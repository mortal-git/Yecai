<template>
  <el-dialog v-model="visible" title="付款登记" width="640px" destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-form-item label="对账单号">
        <span>{{ statement?.statementNo }}</span>
      </el-form-item>
      <el-form-item label="对账含税金额">
        <span class="amount">¥{{ formatMoney(statement?.totalIncTaxCny || 0) }}</span>
      </el-form-item>
      <el-form-item label="已登记付款">
        <span class="amount">¥{{ formatMoney(linkedTotal) }}</span>
        <span class="sub">（未付款 ¥{{ formatMoney(statement!.totalIncTaxCny - linkedTotal) }}）</span>
      </el-form-item>

      <el-divider content-position="left">付款信息</el-divider>

      <el-form-item label="付款单号" prop="paymentNo">
        <el-input v-model="form.paymentNo" placeholder="请输入付款单号" style="width: 240px" />
        <el-button link type="primary" size="small" @click="genPaymentNo" style="margin-left: 8px">自动生成</el-button>
      </el-form-item>
      <el-form-item label="付款金额" prop="amount">
        <el-input-number v-model="form.amount" :min="0" :precision="2" :step="1000" style="width: 240px" />
        <el-button link type="primary" size="small" @click="form.amount = statement!.totalIncTaxCny - linkedTotal" style="margin-left: 8px">全额</el-button>
      </el-form-item>
      <el-form-item label="付款日期" prop="paymentDate">
        <el-date-picker v-model="form.paymentDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 240px" />
      </el-form-item>
      <el-form-item label="付款方式" prop="paymentMethod">
        <el-select v-model="form.paymentMethod" placeholder="请选择" style="width: 240px">
          <el-option label="银行转账" value="银行转账" />
          <el-option label="电汇" value="电汇" />
          <el-option label="承兑汇票" value="承兑汇票" />
          <el-option label="现金" value="现金" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="可填写付款说明" />
      </el-form-item>
    </el-form>

    <div v-if="statement && statement.payments.length > 0" class="linked-list">
      <div class="linked-title">已登记付款记录</div>
      <el-table :data="statement.payments" border size="small">
        <el-table-column prop="paymentNo" label="付款单号" min-width="140" />
        <el-table-column prop="amount" label="金额" min-width="120" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="paymentDate" label="付款日期" min-width="110" />
        <el-table-column prop="paymentMethod" label="付款方式" min-width="100" />
        <el-table-column prop="status" label="状态" min-width="80">
          <template #default="{ row }">
            <el-tag type="success" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="confirm">确认登记</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { PayableStatement, PaymentRecord } from '../../../../store/payableStatement'

const props = defineProps<{
  modelValue: boolean
  statement: PayableStatement | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm', payment: Omit<PaymentRecord, 'id'>): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const formRef = ref<FormInstance>()
const form = reactive({
  paymentNo: '',
  amount: 0,
  paymentDate: '',
  paymentMethod: '银行转账',
  remark: ''
})

const rules: FormRules = {
  paymentNo: [{ required: true, message: '请输入付款单号', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入付款金额', trigger: 'blur' }],
  paymentDate: [{ required: true, message: '请选择付款日期', trigger: 'change' }],
  paymentMethod: [{ required: true, message: '请选择付款方式', trigger: 'change' }]
}

const linkedTotal = computed(() => props.statement?.payments.reduce((s, p) => s + p.amount, 0) || 0)

const formatMoney = (value: number) => (value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const genPaymentNo = () => {
  const seq = String((props.statement?.payments.length || 0) + 1).padStart(4, '0')
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  form.paymentNo = `PAY${dateStr}${seq}`
}

const confirm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(valid => {
    if (!valid) return
    if (form.amount <= 0) {
      ElMessage.warning('付款金额必须大于0')
      return
    }
    emit('confirm', {
      paymentNo: form.paymentNo,
      amount: form.amount,
      paymentDate: form.paymentDate,
      paymentMethod: form.paymentMethod,
      status: '已付款',
      remark: form.remark
    })
    visible.value = false
  })
}

watch(() => props.modelValue, v => {
  if (v) {
    form.paymentNo = ''
    form.amount = props.statement ? Math.max(0, props.statement.totalIncTaxCny - linkedTotal.value) : 0
    form.paymentDate = new Date().toISOString().slice(0, 10)
    form.paymentMethod = '银行转账'
    form.remark = ''
  }
})
</script>

<style scoped>
.amount {
  font-weight: 600;
  color: #f56c6c;
}

.sub {
  margin-left: 8px;
  color: #909399;
  font-size: 13px;
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
