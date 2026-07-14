<template>
  <el-dialog v-model="visible" title="申请开票" width="700px" :close-on-click-modal="false" destroy-on-close>
    <div class="invoice-apply-form">
      <el-form :model="form" label-width="120px">
        <!-- 基本信息 -->
        <div class="form-section-title">基本信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="对账单号">
              {{ statement?.statementNo }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户">
              {{ statement?.customer }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="结算单位">
              {{ statement?.settlementUnit }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="对账含税金额">
              <span class="text-primary">¥{{ formatMoney(statement?.totalIncTaxCny || 0) }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider />
        <!-- 发票信息 -->
        <div class="form-section-title">发票信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发票类型" required>
              <el-select v-model="form.invoiceType" placeholder="请选择" style="width: 100%">
                <el-option label="增值税专用发票" value="增值税专用发票" />
                <el-option label="增值税普通发票" value="增值税普通发票" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发票号" required>
              <el-input v-model="form.invoiceNo" placeholder="请输入发票号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开票日期" required>
              <el-date-picker v-model="form.invoiceDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="税率" required>
              <el-select v-model="form.taxRate" placeholder="请选择" style="width: 100%">
                <el-option label="13%" :value="13" />
                <el-option label="9%" :value="9" />
                <el-option label="6%" :value="6" />
                <el-option label="3%" :value="3" />
                <el-option label="0%" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="不含税金额" required>
              <el-input-number v-model="form.amount" :min="0" :precision="2" :step="1000" style="width: 100%" />
              <el-button link type="primary" size="small" @click="form.amount = exTaxAmount" style="margin-left: 8px">全额</el-button>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="税额">
              <span class="text-primary">¥{{ formatMoney(form.taxAmount) }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="价税合计">
          <span class="text-primary">¥{{ formatMoney(form.incTaxAmount) }}</span>
        </el-form-item>
        <el-divider />
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="confirm" :loading="loading">确认开票</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { ReceivableStatement, InvoiceApplyRecord } from '../../../../store/receivableStatement'

const props = defineProps<{
  modelValue: boolean
  statement: ReceivableStatement | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm', invoice: Omit<InvoiceApplyRecord, 'id'>): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const loading = ref(false)

const form = reactive({
  invoiceType: '增值税专用发票',
  invoiceNo: '',
  invoiceDate: '',
  amount: 0,
  taxRate: 13,
  remark: ''
})

const formatMoney = (value: number) => (value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const exTaxAmount = computed(() => props.statement?.totalExTaxCny || 0)
const taxAmount = computed(() => Number((form.amount * form.taxRate / 100).toFixed(2)))
const incTaxAmount = computed(() => Number((form.amount + taxAmount.value).toFixed(2)))

const genApplyNo = () => {
  const seq = String((props.statement?.invoiceApplies.length || 0) + 1).padStart(4, '0')
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `IA${dateStr}${seq}`
}

const confirm = async () => {
  if (!form.invoiceNo) {
    ElMessage.warning('请输入发票号')
    return
  }
  if (!form.invoiceDate) {
    ElMessage.warning('请选择开票日期')
    return
  }
  if (form.amount <= 0) {
    ElMessage.warning('开票金额必须大于0')
    return
  }
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    emit('confirm', {
      applyNo: genApplyNo(),
      invoiceType: form.invoiceType,
      invoiceNo: form.invoiceNo,
      invoiceDate: form.invoiceDate,
      amount: form.amount,
      taxRate: form.taxRate,
      taxAmount: taxAmount.value,
      incTaxAmount: incTaxAmount.value,
      status: '已开票',
      remark: form.remark
    })
    visible.value = false
  } finally {
    loading.value = false
  }
}

watch(() => props.modelValue, v => {
  if (v) {
    form.invoiceType = '增值税专用发票'
    form.invoiceNo = ''
    form.invoiceDate = new Date().toISOString().slice(0, 10)
    form.amount = exTaxAmount.value
    form.taxRate = props.statement?.rows[0]?.taxRate || 13
    form.remark = ''
  }
})
</script>

<style scoped>
.text-primary { color: #409eff; }

.form-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}

.invoice-apply-form {
  padding: 10px 0;
}
</style>
