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
        <el-descriptions-item label="客户">
          <el-link type="primary">{{ statement.customer }}</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="结算单位">{{ statement.settlementUnit }}</el-descriptions-item>
        <el-descriptions-item label="结算银行">{{ statement.settlementBank || '-' }}</el-descriptions-item>
        <el-descriptions-item label="结算账号">{{ statement.settlementAccount || '-' }}</el-descriptions-item>
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
        <el-descriptions-item label="关联开票">
          <span :class="invoiceTotal >= statement.totalIncTaxCny && statement.totalIncTaxCny > 0 ? 'text-success' : (invoiceTotal > 0 ? 'text-warning' : 'text-info')">
            ¥{{ formatMoney(invoiceTotal) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="关联收款">
          <span :class="collectionTotal >= statement.totalIncTaxCny && statement.totalIncTaxCny > 0 ? 'text-success' : (collectionTotal > 0 ? 'text-warning' : 'text-info')">
            ¥{{ formatMoney(collectionTotal) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="已收款金额">
          <span class="text-success">¥{{ formatMoney(collectedTotal) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="未收款金额">
          <span :class="uncollectedAmount > 0 ? 'text-danger' : 'text-success'">¥{{ formatMoney(uncollectedAmount) }}</span>
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
            <el-table-column prop="incomeItem" label="收入项目" min-width="100" />
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

        <!-- 开票记录 -->
        <el-tab-pane :label="`开票记录 (${statement.invoiceApplies.length})`" name="invoice">
          <el-empty v-if="statement.invoiceApplies.length === 0" description="暂无开票记录" />
          <el-table v-else :data="statement.invoiceApplies" border stripe size="small">
            <el-table-column prop="applyNo" label="申请单号" min-width="140" />
            <el-table-column prop="invoiceType" label="发票类型" min-width="140" />
            <el-table-column prop="invoiceNo" label="发票号" min-width="140" />
            <el-table-column prop="invoiceDate" label="开票日期" min-width="110" />
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
            <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
          </el-table>
        </el-tab-pane>

        <!-- 收款记录 -->
        <el-tab-pane :label="`收款记录 (${statement.collections.length})`" name="collection">
          <el-empty v-if="statement.collections.length === 0" description="暂无收款记录" />
          <el-table v-else :data="statement.collections" border stripe size="small">
            <el-table-column prop="collectionNo" label="收款单号" min-width="140" />
            <el-table-column prop="amount" label="收款金额" min-width="120" align="right">
              <template #default="scope">¥{{ formatMoney(scope.row.amount) }}</template>
            </el-table-column>
            <el-table-column prop="collectionDate" label="收款日期" min-width="110" />
            <el-table-column prop="collectionMethod" label="收款方式" min-width="100" />
            <el-table-column prop="status" label="状态" min-width="80">
              <template #default="scope">
                <el-tag type="success" size="small">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
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
  useReceivableStatementStore,
  STATUS_LABEL,
  STATUS_TYPE
} from '../../../store/receivableStatement'

const props = defineProps<{
  statementId: string
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const store = useReceivableStatementStore()

const statement = computed(() => store.getById(props.statementId))

const activeTab = ref('rows')

const formatMoney = (value: number) => (value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatDateTime = (dateStr: string) => dateStr || '-'

const invoiceTotal = computed(() => statement.value?.invoiceApplies.reduce((s, i) => s + i.incTaxAmount, 0) || 0)
const collectionTotal = computed(() => statement.value?.collections.reduce((s, c) => s + c.amount, 0) || 0)
const collectedTotal = computed(() => statement.value?.collections.filter(c => c.status === '已收款').reduce((s, c) => s + c.amount, 0) || 0)
const uncollectedAmount = computed(() => {
  if (!statement.value) return 0
  return Math.max(0, statement.value.totalIncTaxCny - collectedTotal.value)
})

const getRowsSummary = () => {
  if (!statement.value) return []
  const rows = statement.value.rows
  return ['合计', '', '', '', '', '', '', '', '',
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
