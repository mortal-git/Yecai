<template>
  <div class="payable-statement-detail-container" v-if="statement">
    <!-- 顶部操作栏 -->
    <div class="action-header no-print">
      <div class="header-left">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-divider direction="vertical" />
        <span class="page-title">应付对账单详情</span>
        <el-tag :type="STATUS_TYPE[statement.status]" size="default" style="margin-left: 8px">
          {{ STATUS_LABEL[statement.status] }}
        </el-tag>
      </div>
      <div class="header-right">
        <el-button v-if="statement.status === 'draft'" @click="handleEdit">编辑</el-button>
        <el-button v-if="statement.status === 'draft'" type="primary" @click="handleSubmitAudit">提交审核</el-button>
        <el-button v-if="statement.status === 'pending'" type="success" @click="handleAudit(true)">审核通过</el-button>
        <el-button v-if="statement.status === 'pending'" type="warning" @click="handleAudit(false)">审核驳回</el-button>
        <el-button v-if="statement.status === 'pending_payment'" @click="openInvoiceDialog">关联进项发票</el-button>
        <el-button @click="handlePrint">打印</el-button>
        <el-button v-if="statement.status === 'draft'" type="danger" @click="handleDelete">删除</el-button>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="info-section">
      <div class="section-title">
        <el-icon><InfoFilled /></el-icon>
        <span>基本信息</span>
      </div>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="对账单号">{{ statement.statementNo }}</el-descriptions-item>
        <el-descriptions-item label="对账单名称">{{ statement.name }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="STATUS_TYPE[statement.status]" size="small">{{ STATUS_LABEL[statement.status] }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="供应商">{{ statement.supplier }}</el-descriptions-item>
        <el-descriptions-item label="结算单位">{{ statement.settlementUnit }}</el-descriptions-item>
        <el-descriptions-item label="结算日">{{ statement.settleDate }}</el-descriptions-item>
        <el-descriptions-item label="对账单不含税金额">
          <span class="amount">¥{{ formatMoney(statement.totalExTaxCny) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="对账单含税金额">
          <span class="amount">¥{{ formatMoney(statement.totalIncTaxCny) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="3">{{ statement.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ statement.creator }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ statement.createTime }}</el-descriptions-item>
        <el-descriptions-item label="最后更新">{{ statement.updateTime || '-' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 详情 Tabs -->
    <div class="info-section">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="对账明细" name="rows">
          <div class="tab-toolbar">
            <span>共 {{ statement.rows.length }} 条明细</span>
            <span class="tab-summary">不含税合计：<b>¥{{ formatMoney(statement.totalExTaxCny) }}</b>　含税合计：<b>¥{{ formatMoney(statement.totalIncTaxCny) }}</b></span>
          </div>
          <el-table :data="statement.rows" border stripe size="small" show-summary :summary-method="getRowsSummary">
            <el-table-column prop="rateSheetNo" label="费率单编号" min-width="140" />
            <el-table-column prop="customerName" label="客户名称" min-width="160" show-overflow-tooltip />
            <el-table-column prop="businessRefNo" label="业务参考编号" min-width="140" />
            <el-table-column prop="billingDoc" label="计费单据" min-width="100" />
            <el-table-column prop="costItem" label="成本项目" min-width="100" />
            <el-table-column prop="productL1" label="产品标准名L1" min-width="120" />
            <el-table-column prop="productL2" label="产品标准名L2" min-width="120" />
            <el-table-column prop="productL3" label="产品标准名L3" min-width="120" />
            <el-table-column prop="currency" label="币种" min-width="80" />
            <el-table-column prop="exTaxAmount" label="不含税金额" min-width="120" align="right">
              <template #default="{ row }">¥{{ formatMoney(row.exTaxAmount) }}</template>
            </el-table-column>
            <el-table-column prop="taxRate" label="税率" min-width="80" align="right">
              <template #default="{ row }">{{ row.taxRate }}%</template>
            </el-table-column>
            <el-table-column prop="taxAmount" label="税额" min-width="120" align="right">
              <template #default="{ row }">¥{{ formatMoney(row.taxAmount) }}</template>
            </el-table-column>
            <el-table-column prop="incTaxAmount" label="含税金额" min-width="120" align="right">
              <template #default="{ row }">¥{{ formatMoney(row.incTaxAmount) }}</template>
            </el-table-column>
            <el-table-column prop="exchangeRate" label="汇率" min-width="80" align="right" />
            <el-table-column prop="exTaxAmountCny" label="不含税(折合CNY)" min-width="140" align="right">
              <template #default="{ row }">¥{{ formatMoney(row.exTaxAmountCny) }}</template>
            </el-table-column>
            <el-table-column prop="incTaxAmountCny" label="含税(折合CNY)" min-width="140" align="right">
              <template #default="{ row }">¥{{ formatMoney(row.incTaxAmountCny) }}</template>
            </el-table-column>
            <el-table-column prop="customerService" label="客服" min-width="80" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane :label="`关联付款单 (${statement.payments.length})`" name="payments">
          <div class="tab-toolbar">
            <span>付款合计：<b>¥{{ formatMoney(paymentTotal) }}</b>　已付款：<b>¥{{ formatMoney(paidTotal) }}</b></span>
          </div>
          <el-empty v-if="statement.payments.length === 0" description="暂无关联付款单" />
          <el-table v-else :data="statement.payments" border stripe size="small">
            <el-table-column prop="paymentMethod" label="付款方式" min-width="100" />
            <el-table-column prop="bankAccount" label="银行账号" min-width="200" />
            <el-table-column prop="transactionNo" label="银行流水" min-width="150" />
            <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
            <el-table-column prop="attachment" label="附件" min-width="120">
              <template #default="{ row }">
                <el-link v-if="row.attachment" type="primary" @click="handleViewAttachment(row.attachment)">
                  {{ row.attachment.name }}
                </el-link>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="payer" label="付款人" min-width="100" />
            <el-table-column prop="paymentTime" label="付款时间" min-width="160" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane :label="`关联进项发票 (${statement.invoices.length})`" name="invoices">
          <div class="tab-toolbar">
            <span>发票价税合计：<b>¥{{ formatMoney(invoiceTotal) }}</b></span>
            <el-button v-if="statement.status === 'pending_payment'" type="primary" size="small" @click="openInvoiceDialog">关联进项发票</el-button>
          </div>
          <el-empty v-if="statement.invoices.length === 0" description="暂无关联发票" />
          <el-table v-else :data="statement.invoices" border stripe size="small">
            <el-table-column prop="invoiceNo" label="发票号" min-width="150" />
            <el-table-column prop="invoiceType" label="发票类型" min-width="120" />
            <el-table-column prop="invoiceAmount" label="发票金额" min-width="130" align="right">
              <template #default="{ row }">¥{{ formatMoney(row.invoiceAmount) }}</template>
            </el-table-column>
            <el-table-column prop="bindAmount" label="绑定金额" min-width="130" align="right">
              <template #default="{ row }">¥{{ formatMoney(row.bindAmount) }}</template>
            </el-table-column>
            <el-table-column prop="bindDate" label="绑定日期" min-width="120" />
            <el-table-column prop="invoiceDate" label="开票日期" min-width="120" />
            <el-table-column prop="taxRate" label="税率" min-width="80" align="right">
              <template #default="{ row }">{{ row.taxRate }}%</template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="操作记录" name="logs">
          <el-timeline>
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
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 弹窗 -->
    <InvoiceLinkDialog v-model="invoiceDialogVisible" :statement="statement" @confirm="onInvoiceLinked" />
  </div>

  <el-empty v-else description="对账单不存在或已删除" style="margin-top: 100px">
    <el-button type="primary" @click="handleBack">返回列表</el-button>
  </el-empty>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, InfoFilled } from '@element-plus/icons-vue'
import {
  usePayableStatementStore,
  STATUS_LABEL,
  STATUS_TYPE,
  type PayableStatement,
  type InvoiceRecord
} from '../../../store/payableStatement'
import InvoiceLinkDialog from './components/InvoiceLinkDialog.vue'

const route = useRoute()
const router = useRouter()
const store = usePayableStatementStore()

const statement = computed<PayableStatement | undefined>(() => store.getById(route.params.id as string))

const activeTab = ref('rows')

const formatMoney = (value: number) => (value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const paymentTotal = computed(() => statement.value?.payments.reduce((s, p) => s + p.amount, 0) || 0)
const paidTotal = computed(() => statement.value?.payments.filter(p => p.status === '已付款').reduce((s, p) => s + p.amount, 0) || 0)
const invoiceTotal = computed(() => statement.value?.invoices.reduce((s, i) => s + i.incTaxAmount, 0) || 0)

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

const handleBack = () => router.push('/statement/payable')
const handleEdit = () => router.push(`/statement/payable/edit/${statement.value!.id}`)

const handleSubmitAudit = () => {
  ElMessageBox.confirm('确认提交对账单进行审核?', '提示', { type: 'warning' })
    .then(() => {
      store.changeStatus(statement.value!.id, 'pending', '提交审核')
      ElMessage.success('已提交审核')
    })
    .catch(() => {})
}

const handleAudit = (passed: boolean) => {
  ElMessageBox.confirm(`确认${passed ? '通过' : '驳回'}审核?`, '提示', { type: 'warning' })
    .then(() => {
      if (passed) {
        store.changeStatus(statement.value!.id, 'pending_payment', '审核通过')
        ElMessage.success('审核已通过')
      } else {
        store.changeStatus(statement.value!.id, 'draft', '审核驳回')
        ElMessage.success('已驳回')
      }
    })
    .catch(() => {})
}

const handleDelete = () => {
  ElMessageBox.confirm('确认删除此对账单?删除后不可恢复', '危险操作', { type: 'error' })
    .then(() => {
      store.deleteStatement(statement.value!.id)
      ElMessage.success('已删除')
      router.push('/statement/payable')
    })
    .catch(() => {})
}

const handlePrint = () => {
  window.print()
}

const handleViewAttachment = (file: { name: string, url: string }) => {
  window.open(file.url, '_blank')
}

// 弹窗
const invoiceDialogVisible = ref(false)

const openInvoiceDialog = () => { invoiceDialogVisible.value = true }

const onInvoiceLinked = (invoice: Omit<InvoiceRecord, 'id'>) => {
  store.addInvoice(statement.value!.id, invoice)
  ElMessage.success('关联发票成功')
}

onMounted(() => {
  if (route.query.print === '1') {
    setTimeout(() => window.print(), 500)
  }
})
</script>

<style scoped>
.payable-statement-detail-container {
  padding: 0;
}

.action-header {
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.info-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.amount {
  font-weight: 600;
  color: #f56c6c;
}

.tab-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
}

.tab-summary b {
  color: #f56c6c;
  margin: 0 4px;
}

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

@media print {
  .no-print {
    display: none !important;
  }
  .info-section {
    box-shadow: none !important;
    border: none !important;
    page-break-inside: avoid;
  }
}
</style>
