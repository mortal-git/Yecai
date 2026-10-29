<template>
  <el-dialog v-model="visible" title="申请收款" width="800px" :close-on-click-modal="false" destroy-on-close>
    <div class="apply-form">
      <el-form :model="form" label-width="130px">
        <!-- 对账单信息 -->
        <div class="form-section-title">对账单信息</div>
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
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="此前已申请金额">
              <span class="text-warning">¥{{ formatMoney(appliedAmount) }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="剩余可申请金额">
              <span class="text-success">¥{{ formatMoney(remainingAmount) }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider />

        <!-- 收款信息 -->
        <div class="form-section-title">收款信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="期望收款日期" required>
              <el-date-picker v-model="form.expectedCollectionDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="本次申请金额" required>
              <el-input-number
                v-model="form.applyAmount"
                :min="0.01"
                :max="remainingAmount"
                :precision="2"
                :step="1000"
                style="width: 100%"
              />
              <el-button link type="primary" size="small" @click="form.applyAmount = remainingAmount" style="margin-left: 8px">全额</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="confirm" :loading="loading">确认申请</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useCollectionApplyStore } from '../../../../store/collectionApply'
import type { ReceivableStatement } from '../../../../store/receivableStatement'

const props = defineProps<{
  modelValue: boolean
  statement: ReceivableStatement | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm'): void
}>()

const store = useCollectionApplyStore()

const visible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const loading = ref(false)

const form = reactive({
  applyAmount: 0,
  expectedCollectionDate: '',
  remark: ''
})

const appliedAmount = computed(() =>
  props.statement ? store.getAppliedAmountByStatement(props.statement.id) : 0
)

const remainingAmount = computed(() => {
  if (!props.statement) return 0
  return Math.max(0, props.statement.totalIncTaxCny - appliedAmount.value)
})

const formatMoney = (value: number) => (value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const confirm = async () => {
  if (!props.statement) {
    ElMessage.warning('对账单不存在')
    return
  }
  if (!form.expectedCollectionDate) {
    ElMessage.warning('请选择期望收款日期')
    return
  }
  if (form.applyAmount <= 0) {
    ElMessage.warning('本次申请金额必须大于0')
    return
  }
  if (form.applyAmount > remainingAmount.value) {
    ElMessage.warning(`本次申请金额不能超过剩余可申请金额 ¥${formatMoney(remainingAmount.value)}`)
    return
  }
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    store.addApply({
      statementId: props.statement.id,
      statementNo: props.statement.statementNo,
      customer: props.statement.customer,
      settlementUnit: props.statement.settlementUnit,
      statementTotalIncTax: props.statement.totalIncTaxCny,
      applyAmount: form.applyAmount,
      expectedCollectionDate: form.expectedCollectionDate,
      status: 'pending',
      remark: form.remark
    })
    ElMessage.success('收款申请单已生成')
    emit('confirm')
    visible.value = false
  } finally {
    loading.value = false
  }
}

watch(() => props.modelValue, v => {
  if (v) {
    form.expectedCollectionDate = new Date().toISOString().slice(0, 10)
    form.remark = ''
    setTimeout(() => {
      form.applyAmount = remainingAmount.value
    }, 0)
  }
})
</script>

<style scoped>
.text-primary { color: #409eff; }
.text-warning { color: #e6a23c; }
.text-success { color: #67c23a; }

.form-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}

.apply-form {
  padding: 10px 0;
}
</style>
