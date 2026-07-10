<template>
  <div class="statement-detail-container" v-if="statement">
    <!-- 基本信息 -->
    <div class="detail-section">
      <div class="section-header">
        <h3>对账单基本信息</h3>
        <el-tag :type="STATUS_TYPE[statement.status]" size="large">{{ STATUS_LABEL[statement.status] }}</el-tag>
      </div>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="对账单号">{{ statement.statementNo }}</el-descriptions-item>
        <el-descriptions-item label="对账单名称">{{ statement.name }}</el-descriptions-item>
        <el-descriptions-item label="供应商">
          <el-link type="primary">{{ statement.supplier }}</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="结算单位">{{ statement.settlementUnit }}</el-descriptions-item>
        <el-descriptions-item label="结算日">{{ statement.settleDate }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ statement.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ statement.creator }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(statement.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="最后更新">{{ statement.updateTime || '-' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 金额信息 -->
    <div class="detail-section">
      <div class="section-header">
        <h3>金额信息</h3>
      </div>
      <el-descriptions :column="4" border>
        <el-descriptions-item label="不含税金额">
          <span class="amount-text">¥{{ formatMoney(statement.totalExTaxCny) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="含税金额">
          <span class="amount-text">¥{{ formatMoney(statement.totalIncTaxCny) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="关联付款">
          <span :class="paymentTotal >= statement.totalIncTaxCny && statement.totalIncTaxCny > 0 ? 'text-success' : (paymentTotal > 0 ? 'text-warning' : 'text-info')">
            ¥{{ formatMoney(paymentTotal) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="关联发票">
          <span :class="invoiceTotal >= statement.totalIncTaxCny && statement.totalIncTaxCny > 0 ? 'text-success' : (invoiceTotal > 0 ? 'text-warning' : 'text-info')">
            ¥{{ formatMoney(invoiceTotal) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="已付款金额">
          <span class="text-success">¥{{ formatMoney(paidTotal) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="未付款金额">
          <span :class="unpaidAmount > 0 ? 'text-danger' : 'text-success'">¥{{ formatMoney(unpaidAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="明细行数">{{ statement.rows.length }} 条</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="STATUS_TYPE[statement.status]" size="small">{{ STATUS_LABEL[statement.status] }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- Tab区域 -->
    <div class="detail-section">
      <el-tabs v-model="activeTab">
        <!-- 对账明细 -->
        <el-tab-pane :label="`对账明细 (${statement.rows.length})`" name="rows">
          <el-table :data="statement.rows" border stripe size="small" show-summary :summary-method="getRowsSummary" max-height="420">
            <el-table-column prop="rateSheetNo" label="费率单编号" min-width="140" />
            <el-table-column prop="customerName" label="客户名称" min-width="160" show-overflow-tooltip />
            <el-table-column prop="businessRefNo" label="业务参考编号" min-width="140" />
            <el-table-column prop="billingDoc" label="计费单据" min-width="100" />
            <el-table-column prop="costType" label="成本类型" min-width="100" />
            <el-table-column prop="costItem" label="成本项目" min-width="100" />
            <el-table-column prop="productL1" label="产品标准名L1" min-width="120" />
            <el-table-column prop="productL2" label="产品标准名L2" min-width="120" />
            <el-table-column prop="productL3" label="产品标准名L3" min-width="120" />
            <el-table-column prop="currency" label="币种" min-width="80" />
            <el-table-column prop="exTaxAmount" label="不含税金额" min-width="120" align="right">
              <template #default="scope">¥{{ formatMoney(scope.row.exTaxAmount) }}</template>
            </el-table-column>
            <el-table-column prop="taxRate" label="税率" min-width="80" align="right">
              <template #default="scope">{{ scope.row.taxRate }}%</template>
            </el-table-column>
            <el-table-column prop="taxAmount" label="税额" min-width="120" align="right">
              <template #default="scope">¥{{ formatMoney(scope.row.taxAmount) }}</template>
            </el-table-column>
            <el-table-column prop="incTaxAmount" label="含税金额" min-width="120" align="right">
              <template #default="scope">¥{{ formatMoney(scope.row.incTaxAmount) }}</template>
            </el-table-column>
            <el-table-column prop="exchangeRate" label="汇率" min-width="80" align="right" />
            <el-table-column prop="exTaxAmountCny" label="不含税(折合CNY)" min-width="140" align="right">
              <template #default="scope">¥{{ formatMoney(scope.row.exTaxAmountCny) }}</template>
            </el-table-column>
            <el-table-column prop="incTaxAmountCny" label="含税(折合CNY)" min-width="140" align="right">
              <template #default="scope">¥{{ formatMoney(scope.row.incTaxAmountCny) }}</template>
            </el-table-column>
            <el-table-column prop="customerService" label="客服" min-width="80" />
          </el-table>
        </el-tab-pane>

        <!-- 付款记录 -->
        <el-tab-pane :label="`付款记录 (${statement.payments.length})`" name="payment">
          <el-empty v-if="statement.payments.length === 0" description="暂无关联付款单" />
          <el-table v-else :data="statement.payments" border stripe size="small">
            <el-table-column prop="paymentNo" label="付款单号" min-width="140" />
            <el-table-column prop="amount" label="付款金额" min-width="120" align="right">
              <template #default="scope">¥{{ formatMoney(scope.row.amount) }}</template>
            </el-table-column>
            <el-table-column prop="paymentDate" label="付款日期" min-width="110" />
            <el-table-column prop="paymentMethod" label="付款方式" min-width="100" />
            <el-table-column prop="status" label="状态" min-width="80">
              <template #default="scope">
                <el-tag type="success" size="small">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
          </el-table>
        </el-tab-pane>

        <!-- 发票记录 -->
        <el-tab-pane :label="`发票记录 (${statement.invoices.length})`" name="invoice">
          <el-empty v-if="statement.invoices.length === 0" description="暂无关联进项发票" />
          <el-table v-else :data="statement.invoices" border stripe size="small">
            <el-table-column prop="invoiceNo" label="发票号" min-width="140" />
            <el-table-column prop="invoiceDate" label="发票日期" min-width="110" />
            <el-table-column prop="amount" label="不含税金额" min-width="120" align="right">
              <template #default="scope">¥{{ formatMoney(scope.row.amount) }}</template>
            </el-table-column>
            <el-table-column prop="taxRate" label="税率" min-width="80" align="right">
              <template #default="scope">{{ scope.row.taxRate }}%</template>
            </el-table-column>
            <el-table-column prop="taxAmount" label="税额" min-width="120" align="right">
              <template #default="scope">¥{{ formatMoney(scope.row.taxAmount) }}</template>
            </el-table-column>
            <el-table-column prop="incTaxAmount" label="价税合计" min-width="120" align="right">
              <template #default="scope">¥{{ formatMoney(scope.row.incTaxAmount) }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态" min-width="80">
              <template #default="scope">
                <el-tag type="success" size="small">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 操作记录 -->
        <el-tab-pane label="操作记录" name="logs">
          <el-timeline v-if="statement.logs.length > 0">
            <el-timeline-item
              v-for="log in statement.logs"
              :key="log.id"
              :timestamp="log.operateTime"
              placement="top"
            >
              <div class="log-action">{{ log.action }}</div>
              <div class="log-meta">操作人：{{ log.operator }}<span v-if="log.remark">　|　{{ log.remark }}</span></div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无操作记录" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>

  <el-empty v-else description="对账单不存在或已删除" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  usePayableStatementStore,
  STATUS_LABEL,
  STATUS_TYPE
} from '../../../store/payableStatement'

const props = defineProps<{
  statementId: string
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const store = usePayableStatementStore()

const statement = computed(() => store.getById(props.statementId))

const activeTab = ref('rows')

const formatMoney = (value: number) => (value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatDateTime = (dateStr: string) => dateStr || '-'

const paymentTotal = computed(() => statement.value?.payments.reduce((s, p) => s + p.amount, 0) || 0)
const invoiceTotal = computed(() => statement.value?.invoices.reduce((s, i) => s + i.incTaxAmount, 0) || 0)
const paidTotal = computed(() => statement.value?.payments.filter(p => p.status === '已付款').reduce((s, p) => s + p.amount, 0) || 0)
const unpaidAmount = computed(() => {
  if (!statement.value) return 0
  return Math.max(0, statement.value.totalIncTaxCny - paidTotal.value)
})

const getRowsSummary = () => {
  if (!statement.value) return []
  const rows = statement.value.rows
  return ['合计', '', '', '', '', '', '', '', '', '',
    `¥${formatMoney(rows.reduce((s, r) => s + r.exTaxAmount, 0))}`,
    '',
    `¥${formatMoney(rows.reduce((s, r) => s + r.taxAmount, 0))}`,
    `¥${formatMoney(rows.reduce((s, r) => s + r.incTaxAmount, 0))}`,
    '',
    `¥${formatMoney(rows.reduce((s, r) => s + r.exTaxAmountCny, 0))}`,
    `¥${formatMoney(rows.reduce((s, r) => s + r.incTaxAmountCny, 0))}`,
    ''
  ]
}
</script>

<style scoped>
.statement-detail-container {
  padding: 0 4px;
}

.detail-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}

.amount-text {
  font-weight: 600;
  color: #f56c6c;
}

.text-success { color: #67c23a; }
.text-warning { color: #e6a23c; }
.text-danger { color: #f56c6c; }
.text-primary { color: #409eff; }
.text-info { color: #909399; }

.log-action {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.log-meta {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

:deep(.el-table .cell) {
  white-space: nowrap;
}
</style>
