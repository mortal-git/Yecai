<template>
  <el-dialog v-model="visible" title="付款登记" width="700px" :close-on-click-modal="false" destroy-on-close>
    <div class="payment-form">
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
        <!-- 付款信息 -->
        <div class="form-section-title">付款信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="付款金额" required>
              <el-input-number v-model="form.amount" :min="0" :precision="2" :step="1000" style="width: 100%" />
              <el-button link type="primary" size="small" @click="form.amount = fullAmount" style="margin-left: 8px">全额</el-button>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="付款日期" required>
              <el-date-picker v-model="form.paymentDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="付款方式" required>
              <el-select v-model="form.paymentMethod" placeholder="请选择" style="width: 100%">
                <el-option label="银行转账" value="银行转账" />
                <el-option label="承兑汇票" value="承兑汇票" />
                <el-option label="现金" value="现金" />
                <el-option label="支票" value="支票" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="银行账号">
              <el-select v-model="form.bankAccountId" placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="bank in bankAccounts"
                  :key="bank.id"
                  :label="`${bank.bankName} ${bank.accountNo}`"
                  :value="bank.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="银行流水">
              <el-input v-model="form.transactionNo" placeholder="请输入银行流水" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注">
              <el-input v-model="form.remark" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider />
        <el-form-item label="附件上传">
          <el-upload
            action="#"
            :auto-upload="false"
            :file-list="form.fileList"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            accept=".jpg,.png,.pdf"
            multiple
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">支持JPG、PNG、PDF格式，单文件不超过10MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="confirm" :loading="loading">确认付款</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
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

const loading = ref(false)

const form = reactive({
  amount: 0,
  paymentDate: '',
  paymentMethod: '',
  bankAccountId: null as number | null,
  transactionNo: '',
  remark: '',
  fileList: [] as any[]
})

const bankAccounts = ref([
  { id: 1, bankName: '中国工商银行', accountNo: '6222081234567890' },
  { id: 2, bankName: '中国建设银行', accountNo: '6217001234567890' },
  { id: 3, bankName: '中国农业银行', accountNo: '6228481234567890' },
  { id: 4, bankName: '招商银行', accountNo: '6214831234567890' }
])

const linkedTotal = computed(() => props.statement?.payments.reduce((s, p) => s + p.amount, 0) || 0)
const fullAmount = computed(() => props.statement ? Math.max(0, props.statement.totalIncTaxCny - linkedTotal.value) : 0)

const formatMoney = (value: number) => (value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const genPaymentNo = () => {
  const seq = String((props.statement?.payments.length || 0) + 1).padStart(4, '0')
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `PAY${dateStr}${seq}`
}

const handleFileChange = (_file: any, fileList: any) => {
  form.fileList = fileList
}

const handleFileRemove = (_file: any, fileList: any) => {
  form.fileList = fileList
}

const confirm = async () => {
  if (!form.paymentDate) {
    ElMessage.warning('请选择付款日期')
    return
  }
  if (!form.paymentMethod) {
    ElMessage.warning('请选择付款方式')
    return
  }
  if (form.amount <= 0) {
    ElMessage.warning('付款金额必须大于0')
    return
  }
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    const bank = bankAccounts.value.find(b => b.id === form.bankAccountId)
    const bankAccount = bank ? `${bank.bankName} ${bank.accountNo}` : ''
    const remarkParts: string[] = []
    if (form.remark) remarkParts.push(form.remark)

    const nowTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
    const attachment = form.fileList[0]
      ? { name: form.fileList[0].name, url: form.fileList[0].url || `/files/${form.fileList[0].name}` }
      : undefined

    emit('confirm', {
      paymentNo: genPaymentNo(),
      amount: form.amount,
      paymentDate: form.paymentDate,
      paymentMethod: form.paymentMethod,
      status: '已付款',
      remark: remarkParts.join('；') || undefined,
      bankAccount,
      transactionNo: form.transactionNo || undefined,
      attachment,
      payer: '当前用户',
      paymentTime: nowTime
    })
    visible.value = false
  } finally {
    loading.value = false
  }
}

watch(() => props.modelValue, v => {
  if (v) {
    form.amount = fullAmount.value
    form.paymentDate = new Date().toISOString().slice(0, 10)
    form.paymentMethod = ''
    form.bankAccountId = null
    form.transactionNo = ''
    form.remark = ''
    form.fileList = []
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

.payment-form {
  padding: 10px 0;
}
</style>
