<template>
  <el-dialog v-model="visible" title="关联进项发票" width="640px" destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-form-item label="对账单号">
        <span>{{ statement?.statementNo }}</span>
      </el-form-item>
      <el-form-item label="对账含税金额">
        <span class="amount">¥{{ formatMoney(statement?.totalIncTaxCny || 0) }}</span>
      </el-form-item>
      <el-form-item label="已关联发票">
        <span class="amount">¥{{ formatMoney(linkedTotal) }}</span>
      </el-form-item>

      <el-divider content-position="left">发票信息</el-divider>

      <el-form-item label="发票号" prop="invoiceNo">
        <el-input v-model="form.invoiceNo" placeholder="请输入发票号" style="width: 240px" />
      </el-form-item>
      <el-form-item label="发票日期" prop="invoiceDate">
        <el-date-picker v-model="form.invoiceDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 240px" />
      </el-form-item>
      <el-form-item label="不含税金额" prop="amount">
        <el-input-number v-model="form.amount" :min="0" :precision="2" :step="1000" style="width: 240px" @change="calcTax" />
      </el-form-item>
      <el-form-item label="税率" prop="taxRate">
        <el-select v-model="form.taxRate" placeholder="请选择" style="width: 240px" @change="calcTax">
          <el-option label="13%" :value="13" />
          <el-option label="9%" :value="9" />
          <el-option label="6%" :value="6" />
          <el-option label="3%" :value="3" />
          <el-option label="0%" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="税额">
        <span class="amount">¥{{ formatMoney(form.taxAmount) }}</span>
      </el-form-item>
      <el-form-item label="价税合计">
        <span class="amount">¥{{ formatMoney(form.incTaxAmount) }}</span>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>

    <div v-if="statement && statement.invoices.length > 0" class="linked-list">
      <div class="linked-title">已关联发票</div>
      <el-table :data="statement.invoices" border size="small">
        <el-table-column prop="invoiceNo" label="发票号" min-width="140" />
        <el-table-column prop="invoiceDate" label="发票日期" min-width="110" />
        <el-table-column prop="amount" label="不含税金额" min-width="120" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="taxRate" label="税率" min-width="80" align="right">
          <template #default="{ row }">{{ row.taxRate }}%</template>
        </el-table-column>
        <el-table-column prop="incTaxAmount" label="价税合计" min-width="120" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.incTaxAmount) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="80">
          <template #default="{ row }">
            <el-tag type="success" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="confirm">确认关联</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { type FormInstance, type FormRules } from 'element-plus'
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

const formRef = ref<FormInstance>()
const form = reactive({
  invoiceNo: '',
  invoiceDate: '',
  amount: 0,
  taxRate: 13,
  taxAmount: 0,
  incTaxAmount: 0,
  remark: ''
})

const rules: FormRules = {
  invoiceNo: [{ required: true, message: '请输入发票号', trigger: 'blur' }],
  invoiceDate: [{ required: true, message: '请选择发票日期', trigger: 'change' }],
  amount: [{ required: true, message: '请输入不含税金额', trigger: 'blur' }],
  taxRate: [{ required: true, message: '请选择税率', trigger: 'change' }]
}

const linkedTotal = computed(() => props.statement?.invoices.reduce((s, i) => s + i.incTaxAmount, 0) || 0)

const formatMoney = (value: number) => (value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const calcTax = () => {
  form.taxAmount = Number((form.amount * form.taxRate / 100).toFixed(2))
  form.incTaxAmount = Number((form.amount + form.taxAmount).toFixed(2))
}

const confirm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(valid => {
    if (!valid) return
    calcTax()
    emit('confirm', {
      invoiceNo: form.invoiceNo,
      invoiceDate: form.invoiceDate,
      amount: form.amount,
      taxRate: form.taxRate,
      taxAmount: form.taxAmount,
      incTaxAmount: form.incTaxAmount,
      status: '已关联',
      remark: form.remark
    })
    visible.value = false
  })
}

watch(() => props.modelValue, v => {
  if (v) {
    form.invoiceNo = ''
    form.invoiceDate = new Date().toISOString().slice(0, 10)
    form.amount = props.statement ? props.statement.totalExTaxCny : 0
    form.taxRate = 13
    form.remark = ''
    calcTax()
  }
})
</script>

<style scoped>
.amount {
  font-weight: 600;
  color: #f56c6c;
}

.linked-list {
  margin-top: 16px;
}

.linked-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}
</style>
