<template>
  <el-dialog v-model="visible" title="核销账单" width="640px" destroy-on-close>
    <div v-if="statement" class="writeoff-content">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="对账单号">{{ statement.statementNo }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ statement.supplier }}</el-descriptions-item>
        <el-descriptions-item label="对账含税金额">¥{{ formatMoney(statement.totalIncTaxCny) }}</el-descriptions-item>
        <el-descriptions-item label="已核销金额">¥{{ formatMoney(writtenOffTotal) }}</el-descriptions-item>
        <el-descriptions-item label="未核销金额">
          <span class="amount-unsettled">¥{{ formatMoney(statement.totalIncTaxCny - writtenOffTotal) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="STATUS_TYPE[statement.status]" size="small">{{ STATUS_LABEL[statement.status] }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <div v-if="statement.payments.length === 0" class="empty-tip">
        暂无关联付款单，请先关联付款单后再进行核销
      </div>
      <template v-else>
        <div class="section-title">选择要核销的付款单</div>
        <el-table :data="statement.payments" border size="small" @selection-change="onSelectionChange">
          <el-table-column type="selection" width="50" :selectable="isSelectable" />
          <el-table-column prop="paymentNo" label="付款单号" min-width="140" />
          <el-table-column prop="amount" label="付款金额" min-width="120" align="right">
            <template #default="{ row }">¥{{ formatMoney(row.amount) }}</template>
          </el-table-column>
          <el-table-column prop="paymentDate" label="付款日期" min-width="110" />
          <el-table-column prop="paymentMethod" label="付款方式" min-width="100" />
          <el-table-column prop="status" label="状态" min-width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === '已核销' ? 'success' : 'warning'" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :disabled="selectedIds.length === 0" @click="confirm">确认核销</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { STATUS_LABEL, STATUS_TYPE, type PayableStatement, type PaymentRecord } from '../../../../store/payableStatement'

const props = defineProps<{
  modelValue: boolean
  statement: PayableStatement | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm', paymentIds: string[]): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const selectedRows = ref<PaymentRecord[]>([])
const selectedIds = computed(() => selectedRows.value.map(r => r.id))

const writtenOffTotal = computed(() =>
  props.statement?.payments.filter(p => p.status === '已核销').reduce((s, p) => s + p.amount, 0) || 0
)

const isSelectable = (row: PaymentRecord) => row.status !== '已核销'

const formatMoney = (value: number) => (value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const onSelectionChange = (rows: PaymentRecord[]) => { selectedRows.value = rows }

const confirm = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要核销的付款单')
    return
  }
  emit('confirm', selectedIds.value)
  visible.value = false
}
</script>

<style scoped>
.writeoff-content {
  padding: 0 4px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 16px 0 8px;
}

.amount-unsettled {
  color: #f56c6c;
  font-weight: 600;
}

.empty-tip {
  margin-top: 24px;
  padding: 24px;
  text-align: center;
  color: #909399;
  background: #fafafa;
  border-radius: 4px;
}
</style>
