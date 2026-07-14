<template>
  <el-dialog v-model="visible" title="绑定发票" width="700px" :close-on-click-modal="false" destroy-on-close>
    <div class="bind-invoice-form">
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
            <el-form-item label="供应商">
              {{ statement?.supplier }}
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
        <el-form-item label="选择发票" required>
          <el-select
            v-model="form.selectedInvoiceId"
            filterable
            placeholder="请选择要绑定的发票"
            style="width: 100%"
            @change="handleInvoiceSelectChange"
          >
            <el-option
              v-for="invoice in availableInvoices"
              :key="invoice.id"
              :label="`${invoice.invoiceNo} - ${invoice.supplierName} - ¥${formatMoney(invoice.incTaxAmount)}`"
              :value="invoice.id"
            >
              <div class="invoice-option">
                <span class="invoice-no">{{ invoice.invoiceNo }}</span>
                <span class="invoice-supplier">{{ invoice.supplierName }}</span>
                <span class="invoice-amount">¥{{ formatMoney(invoice.incTaxAmount) }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关联总金额">
          <span class="text-primary">¥{{ formatMoney(form.bindAmount) }}</span>
        </el-form-item>
        <el-divider />
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="confirm" :loading="loading">确认绑定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { PayableStatement, InvoiceRecord } from '../../../../store/payableStatement'

const props = defineProps<{
  modelValue: boolean
  statement: PayableStatement | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm', invoice: Omit<InvoiceRecord, 'id'>): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const loading = ref(false)

const form = reactive({
  selectedInvoiceId: null as number | null,
  bindAmount: 0,
  remark: ''
})

const availableInvoices = ref([
  { id: 1, invoiceNo: 'FP2026070001', supplierName: '深圳盐田国际集装箱码头有限公司', invoiceType: '增值税专用发票', invoiceDate: '2026-07-06', amount: 50000, taxRate: 13, taxAmount: 6500, incTaxAmount: 56500 },
  { id: 2, invoiceNo: 'FP2026070002', supplierName: '上海中远海运集装箱运输有限公司', invoiceType: '增值税专用发票', invoiceDate: '2026-07-07', amount: 80000, taxRate: 13, taxAmount: 10400, incTaxAmount: 90400 },
  { id: 3, invoiceNo: 'FP2026070003', supplierName: '北京华贸物流股份有限公司', invoiceType: '增值税专用发票', invoiceDate: '2026-07-08', amount: 35000, taxRate: 13, taxAmount: 4550, incTaxAmount: 39550 },
  { id: 4, invoiceNo: 'FP2026070004', supplierName: '广州白云国际机场物流有限公司', invoiceType: '增值税普通发票', invoiceDate: '2026-07-09', amount: 22000, taxRate: 13, taxAmount: 2860, incTaxAmount: 24860 },
  { id: 5, invoiceNo: 'FP2026070005', supplierName: '中外运冷链物流有限公司', invoiceType: '增值税普通发票', invoiceDate: '2026-07-10', amount: 12000, taxRate: 13, taxAmount: 1560, incTaxAmount: 13560 }
])

const formatMoney = (value: number) => (value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const handleInvoiceSelectChange = (selected: number | null) => {
  if (selected) {
    const invoice = availableInvoices.value.find(inv => inv.id === selected)
    form.bindAmount = invoice?.incTaxAmount || 0
  } else {
    form.bindAmount = 0
  }
}

const confirm = async () => {
  if (!form.selectedInvoiceId) {
    ElMessage.warning('请选择要绑定的发票')
    return
  }
  const invoice = availableInvoices.value.find(inv => inv.id === form.selectedInvoiceId)
  if (!invoice) {
    ElMessage.warning('发票信息不存在')
    return
  }
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    emit('confirm', {
      invoiceNo: invoice.invoiceNo,
      invoiceDate: invoice.invoiceDate,
      amount: invoice.amount,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      incTaxAmount: invoice.incTaxAmount,
      status: '已关联',
      remark: form.remark || undefined,
      invoiceType: invoice.invoiceType,
      invoiceAmount: invoice.incTaxAmount,
      bindAmount: form.bindAmount,
      bindDate: new Date().toISOString().slice(0, 10)
    })
    visible.value = false
  } finally {
    loading.value = false
  }
}

watch(() => props.modelValue, v => {
  if (v) {
    form.selectedInvoiceId = null
    form.bindAmount = 0
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

.bind-invoice-form {
  padding: 10px 0;
}

.invoice-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.invoice-option .invoice-no {
  flex: 0 0 140px;
  font-weight: 500;
}

.invoice-option .invoice-supplier {
  flex: 1;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 12px;
}

.invoice-option .invoice-amount {
  flex: 0 0 100px;
  text-align: right;
  color: #409eff;
  font-weight: 500;
}
</style>
