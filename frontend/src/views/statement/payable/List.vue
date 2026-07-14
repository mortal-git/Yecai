<template>
  <div class="payable-statement-container">
    <!-- 搜索筛选区域 -->
    <div class="search-panel">
      <el-form :model="searchForm" :inline="true" label-width="100px">
        <el-form-item label="对账单号">
          <el-input v-model="searchForm.statementNo" placeholder="请输入" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="对账单名称">
          <el-input v-model="searchForm.name" placeholder="请输入" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="供应商">
          <el-select v-model="searchForm.supplier" placeholder="请选择供应商" clearable filterable style="width: 240px">
            <el-option v-for="s in supplierList" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="结算单位">
          <el-select v-model="searchForm.settlementUnit" placeholder="请选择" clearable filterable style="width: 180px">
            <el-option v-for="u in settlementUnitList" :key="u" :label="u" :value="u" />
          </el-select>
        </el-form-item>
        <el-form-item label="结算银行">
          <el-select v-model="searchForm.settlementBank" placeholder="请选择" clearable filterable style="width: 180px">
            <el-option v-for="b in settlementBankList" :key="b" :label="b" :value="b" />
          </el-select>
        </el-form-item>
        <el-form-item label="结算账号">
          <el-select v-model="searchForm.settlementAccount" placeholder="请选择" clearable filterable style="width: 220px">
            <el-option v-for="a in settlementAccountList" :key="a" :label="a" :value="a" />
          </el-select>
        </el-form-item>
        <el-form-item label="对账单状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 140px">
            <el-option v-for="(label, key) in STATUS_LABEL" :key="key" :label="label" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item label="结算日">
          <el-date-picker
            v-model="searchForm.settleDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.createTimeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="创建人">
          <el-input v-model="searchForm.creator" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新增对账单
      </el-button>
      <el-button type="success" @click="handleExport" :disabled="selectedRows.length === 0">
        <el-icon><Download /></el-icon>
        导出
      </el-button>
      <el-button type="warning" @click="handleBatchAudit" :disabled="selectedRows.length === 0">
        <el-icon><Check /></el-icon>
        批量审核
      </el-button>
      <el-button type="info" @click="handleAgingAnalysis">
        <el-icon><DataAnalysis /></el-icon>
        账龄分析
      </el-button>
    </div>

    <!-- 状态 Tab 导航 -->
    <div class="status-tabs">
      <el-radio-group v-model="activeStatusTab" @change="handleStatusTabChange">
        <el-radio-button value="all">全部</el-radio-button>
        <el-radio-button value="draft">草稿</el-radio-button>
        <el-radio-button value="pending">待审核</el-radio-button>
        <el-radio-button value="pending_payment">待付款</el-radio-button>
        <el-radio-button value="paid">已付款</el-radio-button>
        <el-radio-button value="cancelled">已作废</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <el-table
        :data="pagedData"
        v-loading="loading"
        border
        stripe
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        :row-class-name="getRowClassName"
      >
        <el-table-column type="selection" width="55" fixed />
        <el-table-column prop="statementNo" label="对账单号" min-width="150" sortable fixed />
        <el-table-column prop="name" label="对账单名称" min-width="200" fixed show-overflow-tooltip>
          <template #default="scope">
            <el-link type="primary" @click.stop="handleView(scope.row)">{{ scope.row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="supplier" label="供应商" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            <el-link type="primary" @click.stop="handleViewSupplier(scope.row.supplier)">{{ scope.row.supplier }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="settlementUnit" label="结算单位" min-width="120" />
        <el-table-column prop="settlementBank" label="结算银行" min-width="120" />
        <el-table-column prop="settlementAccount" label="结算账号" min-width="160" />
        <el-table-column prop="settleDate" label="结算日" min-width="110" sortable />
        <el-table-column prop="totalExTaxCny" label="不含税金额" min-width="130" align="right" sortable>
          <template #default="scope">¥{{ formatMoney(scope.row.totalExTaxCny) }}</template>
        </el-table-column>
        <el-table-column prop="totalIncTaxCny" label="含税金额" min-width="130" align="right" sortable>
          <template #default="scope">¥{{ formatMoney(scope.row.totalIncTaxCny) }}</template>
        </el-table-column>
        <el-table-column label="关联付款" min-width="130" align="right">
          <template #default="scope">
            <span :class="paymentTotal(scope.row) >= scope.row.totalIncTaxCny && scope.row.totalIncTaxCny > 0 ? 'text-success' : (paymentTotal(scope.row) > 0 ? 'text-warning' : 'text-info')">
              ¥{{ formatMoney(paymentTotal(scope.row)) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="关联发票" min-width="130" align="right">
          <template #default="scope">
            <span :class="invoiceTotal(scope.row) >= scope.row.totalIncTaxCny && scope.row.totalIncTaxCny > 0 ? 'text-success' : (invoiceTotal(scope.row) > 0 ? 'text-warning' : 'text-info')">
              ¥{{ formatMoney(invoiceTotal(scope.row)) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="已付款金额" min-width="130" align="right">
          <template #default="scope">
            <span class="text-success">¥{{ formatMoney(paidTotal(scope.row)) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="未付款金额" min-width="130" align="right" sortable :sort-method="(a, b) => unpaidAmount(a) - unpaidAmount(b)">
          <template #default="scope">
            <span :class="unpaidAmount(scope.row) > 0 ? 'text-danger' : 'text-success'">
              ¥{{ formatMoney(unpaidAmount(scope.row)) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="对账单状态" min-width="110">
          <template #default="scope">
            <el-tag :type="STATUS_TYPE[scope.row.status]" size="small">{{ STATUS_LABEL[scope.row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" min-width="100" />
        <el-table-column prop="createTime" label="创建时间" min-width="160">
          <template #default="scope">{{ formatDateTime(scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" link @click.stop="handleEdit(scope.row)" :disabled="!canEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" link @click.stop="handleDelete(scope.row)" :disabled="!canDelete(scope.row)">删除</el-button>
            <el-dropdown trigger="hover" @command="(command: string) => handleMoreAction(command, scope.row)">
              <span class="more-dropdown-link">
                <el-button type="info" size="small" link>更多<el-icon><ArrowDown /></el-icon></el-button>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="submit" :disabled="!canSubmit(scope.row)">提交审批</el-dropdown-item>
                  <el-dropdown-item command="audit" :disabled="!canAudit(scope.row)">审核</el-dropdown-item>
                  <el-dropdown-item command="applyPay" :disabled="!canApplyPayment(scope.row)">申请付款</el-dropdown-item>
                  <el-dropdown-item command="pay" :disabled="!canPay(scope.row)">付款登记</el-dropdown-item>
                  <el-dropdown-item command="linkInvoice" :disabled="!canLinkInvoice(scope.row)">绑定发票</el-dropdown-item>
                  <el-dropdown-item command="cancel" :disabled="!canCancel(scope.row)">作废</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="filteredData.length"
          :page-sizes="[100, 300, 500, 1000]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="showDetail"
      :title="`应付对账单详情 - ${currentRow?.statementNo || ''}`"
      size="900px"
      :before-close="handleCloseDetail"
    >
      <template #default>
        <payable-statement-detail-drawer v-if="currentRow" :statement-id="currentRow.id" @refresh="refreshCurrentRow" />
      </template>
    </el-drawer>

    <!-- 审核弹窗 -->
    <el-dialog v-model="auditDialog.visible" title="审核应付对账单" width="600px" :close-on-click-modal="false">
      <div class="audit-form">
        <el-form :model="auditDialog" label-width="100px">
          <el-form-item label="对账单号">{{ auditDialog.row?.statementNo }}</el-form-item>
          <el-form-item label="供应商">{{ auditDialog.row?.supplier }}</el-form-item>
          <el-form-item label="对账含税金额">
            <span class="text-primary">¥{{ formatMoney(auditDialog.row?.totalIncTaxCny || 0) }}</span>
          </el-form-item>
          <el-form-item label="审核操作" required>
            <el-radio-group v-model="auditDialog.passed">
              <el-radio :value="true">审核通过</el-radio>
              <el-radio :value="false">审核驳回</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="审核意见">
            <el-input v-model="auditDialog.remark" type="textarea" :rows="3" placeholder="请输入审核意见" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="auditDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmAudit">确认</el-button>
      </template>
    </el-dialog>

    <!-- 批量审核弹窗 -->
    <el-dialog v-model="showBatchAudit" title="批量审核" width="600px">
      <div class="batch-audit-form">
        <el-form :model="batchAuditForm" label-width="100px">
          <el-form-item label="选中记录">{{ selectedRows.length }} 条对账单</el-form-item>
          <el-form-item label="审核操作" required>
            <el-radio-group v-model="batchAuditForm.action">
              <el-radio label="approve">全部通过</el-radio>
              <el-radio label="reject">全部驳回</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="batchAuditForm.action === 'reject'" label="驳回原因" required>
            <el-input v-model="batchAuditForm.rejectReason" type="textarea" :rows="3" placeholder="请输入驳回原因" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="batchAuditForm.remark" type="textarea" :rows="2" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showBatchAudit = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchAudit">确认审核</el-button>
      </template>
    </el-dialog>

    <!-- 付款登记 / 关联发票弹窗 -->
    <PaymentLinkDialog v-model="paymentDialogVisible" :statement="currentRow" @confirm="onPaymentLinked" />
    <InvoiceLinkDialog v-model="invoiceDialogVisible" :statement="currentRow" @confirm="onInvoiceLinked" />

    <!-- 账龄分析弹窗 -->
    <el-dialog v-model="showAgingAnalysis" title="应付对账单账龄分析" width="900px">
      <div class="aging-analysis">
        <el-row :gutter="20" class="aging-stats">
          <el-col :span="6">
            <div class="aging-stat-item">
              <div class="aging-label">30天内</div>
              <div class="aging-value text-success">¥{{ formatMoney(agingData.within30Days) }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="aging-stat-item">
              <div class="aging-label">31-60天</div>
              <div class="aging-value text-warning">¥{{ formatMoney(agingData.days31to60) }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="aging-stat-item">
              <div class="aging-label">61-90天</div>
              <div class="aging-value text-danger">¥{{ formatMoney(agingData.days61to90) }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="aging-stat-item">
              <div class="aging-label">90天以上</div>
              <div class="aging-value text-info">¥{{ formatMoney(agingData.over90Days) }}</div>
            </div>
          </el-col>
        </el-row>
        <el-table :data="agingTableData" border style="margin-top: 20px">
          <el-table-column prop="supplier" label="供应商" min-width="180" />
          <el-table-column prop="statementNo" label="对账单号" min-width="150" />
          <el-table-column prop="totalIncTaxCny" label="对账金额" min-width="130" align="right">
            <template #default="scope">¥{{ formatMoney(scope.row.totalIncTaxCny) }}</template>
          </el-table-column>
          <el-table-column prop="unpaid" label="未付款金额" min-width="130" align="right">
            <template #default="scope">¥{{ formatMoney(scope.row.unpaid) }}</template>
          </el-table-column>
          <el-table-column prop="agingDays" label="账龄(天)" width="100" />
          <el-table-column prop="agingLevel" label="账龄区间" width="120">
            <template #default="scope">
              <el-tag :type="getAgingTagType(scope.row.agingLevel)" size="small">{{ scope.row.agingLevel }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Download, Check, DataAnalysis, ArrowDown } from '@element-plus/icons-vue'
import { usePayableStatementStore, STATUS_LABEL, STATUS_TYPE, type PayableStatement, type PayableStatementStatus } from '../../../store/payableStatement'
import PayableStatementDetailDrawer from './DetailDrawer.vue'
import PaymentLinkDialog from './components/PaymentLinkDialog.vue'
import InvoiceLinkDialog from './components/InvoiceLinkDialog.vue'

const router = useRouter()
const store = usePayableStatementStore()

const loading = ref(false)
const selectedRows = ref<PayableStatement[]>([])
const showDetail = ref(false)
const currentRow = ref<PayableStatement | null>(null)
const activeStatusTab = ref<'all' | PayableStatementStatus>('all')

const supplierList = [
  '深圳盐田国际集装箱码头有限公司',
  '上海中远海运集装箱运输有限公司',
  '北京华贸物流股份有限公司',
  '广州白云国际机场物流有限公司',
  '中外运冷链物流有限公司'
]
const settlementUnitList = ['深圳分公司', '上海分公司', '广州分公司', '北京分公司', '杭州分公司']
const settlementBankList = [
  '中国工商银行',
  '中国农业银行',
  '中国银行',
  '中国建设银行',
  '交通银行',
  '招商银行',
  '中信银行',
  '中国民生银行',
  '上海浦东发展银行',
  '兴业银行'
]
const settlementAccountList = [
  '6222021234567890123',
  '6225001234567890123',
  '6217001234567890123',
  '6214001234567890123',
  '6226001234567890123',
  '6225881234567890123',
  '6217001234567890456',
  '6222001234567890789'
]

const searchForm = reactive({
  statementNo: '',
  name: '',
  supplier: '',
  settlementUnit: '',
  settlementBank: '',
  settlementAccount: '',
  status: '',
  settleDateRange: [] as string[],
  createTimeRange: [] as string[],
  creator: ''
})

const pagination = reactive({ page: 1, size: 100 })

// 过滤数据
const filteredData = computed(() => {
  return store.list.filter(item => {
    if (activeStatusTab.value !== 'all' && item.status !== activeStatusTab.value) return false
    if (searchForm.statementNo && !item.statementNo.toLowerCase().includes(searchForm.statementNo.toLowerCase())) return false
    if (searchForm.name && !item.name.toLowerCase().includes(searchForm.name.toLowerCase())) return false
    if (searchForm.supplier && item.supplier !== searchForm.supplier) return false
    if (searchForm.settlementUnit && item.settlementUnit !== searchForm.settlementUnit) return false
    if (searchForm.settlementBank && item.settlementBank !== searchForm.settlementBank) return false
    if (searchForm.settlementAccount && item.settlementAccount !== searchForm.settlementAccount) return false
    if (searchForm.status && item.status !== searchForm.status) return false
    if (searchForm.settleDateRange && searchForm.settleDateRange.length === 2) {
      if (item.settleDate < searchForm.settleDateRange[0] || item.settleDate > searchForm.settleDateRange[1]) return false
    }
    if (searchForm.createTimeRange && searchForm.createTimeRange.length === 2) {
      const createDate = item.createTime.split(' ')[0]
      if (createDate < searchForm.createTimeRange[0] || createDate > searchForm.createTimeRange[1]) return false
    }
    if (searchForm.creator && !item.creator.toLowerCase().includes(searchForm.creator.toLowerCase())) return false
    return true
  })
})

const pagedData = computed(() => {
  const start = (pagination.page - 1) * pagination.size
  return filteredData.value.slice(start, start + pagination.size)
})

const formatMoney = (value: number) => (value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatDateTime = (dateStr: string) => dateStr || '-'

const paymentTotal = (row: PayableStatement) => row.payments.reduce((s, p) => s + p.amount, 0)
const invoiceTotal = (row: PayableStatement) => row.invoices.reduce((s, i) => s + i.incTaxAmount, 0)
const paidTotal = (row: PayableStatement) => row.payments.filter(p => p.status === '已付款').reduce((s, p) => s + p.amount, 0)
const unpaidAmount = (row: PayableStatement) => Math.max(0, row.totalIncTaxCny - paidTotal(row))

// 行样式
const getRowClassName = ({ row }: { row: PayableStatement }) => {
  if (row.status === 'cancelled') return 'row-warning'
  return ''
}

// 操作权限
const canEdit = (row: PayableStatement) => row.status === 'draft'
const canSubmit = (row: PayableStatement) => row.status === 'draft'
const canAudit = (row: PayableStatement) => row.status === 'pending'
const canApplyPayment = (row: PayableStatement) => row.status === 'pending_payment'
const canPay = (row: PayableStatement) => row.status === 'pending_payment'
const canLinkInvoice = (row: PayableStatement) => row.status === 'draft'
const canCancel = (row: PayableStatement) => row.status === 'paid'
const canDelete = (row: PayableStatement) => row.status === 'draft'

const handleSearch = () => {
  loading.value = true
  setTimeout(() => { loading.value = false }, 300)
  pagination.page = 1
}

const handleReset = () => {
  Object.assign(searchForm, {
    statementNo: '', name: '', supplier: '', settlementUnit: '', settlementBank: '', settlementAccount: '', status: '',
    settleDateRange: [], createTimeRange: [], creator: ''
  })
  handleSearch()
}

const handleStatusTabChange = () => {
  pagination.page = 1
}

const handleSelectionChange = (rows: PayableStatement[]) => { selectedRows.value = rows }
const handlePageChange = () => { /* computed 自动响应 */ }

const handleRowClick = (row: PayableStatement) => {
  handleView(row)
}

const handleView = (row: PayableStatement) => {
  currentRow.value = row
  showDetail.value = true
}

const handleViewSupplier = (supplier: string) => {
  ElMessage.info(`查看供应商详情：${supplier}（功能开发中）`)
}

const handleCloseDetail = () => {
  showDetail.value = false
  currentRow.value = null
}

const refreshCurrentRow = () => {
  if (currentRow.value) {
    const fresh = store.getById(currentRow.value.id)
    if (fresh) currentRow.value = fresh
  }
}

const handleCreate = () => router.push('/statement/payable/create')
const handleEdit = (row: PayableStatement) => router.push(`/statement/payable/edit/${row.id}`)

const handleSubmit = (row: PayableStatement) => {
  ElMessageBox.confirm(`确认提交对账单 ${row.statementNo} 进行审核?`, '提示', { type: 'warning' })
    .then(() => {
      store.changeStatus(row.id, 'pending', '提交审核')
      ElMessage.success('已提交审核')
    })
    .catch(() => {})
}

// 审核弹窗
const auditDialog = reactive({
  visible: false,
  row: null as PayableStatement | null,
  passed: true,
  remark: ''
})
const handleAudit = (row: PayableStatement) => {
  auditDialog.row = row
  auditDialog.passed = true
  auditDialog.remark = ''
  auditDialog.visible = true
}
const confirmAudit = () => {
  if (!auditDialog.row) return
  if (auditDialog.passed) {
    store.changeStatus(auditDialog.row.id, 'pending_payment', '审核通过', auditDialog.remark)
    ElMessage.success('审核已通过')
  } else {
    store.changeStatus(auditDialog.row.id, 'draft', '审核驳回', auditDialog.remark)
    ElMessage.success('已驳回')
  }
  auditDialog.visible = false
}

// 作废
const handleCancel = (row: PayableStatement) => {
  ElMessageBox.confirm(`确认作废对账单 ${row.statementNo}?`, '警告', { type: 'warning' })
    .then(() => {
      store.changeStatus(row.id, 'cancelled', '作废对账单')
      ElMessage.success('已作废')
    })
    .catch(() => {})
}

// 删除
const handleDelete = (row: PayableStatement) => {
  ElMessageBox.confirm(`确认删除对账单 ${row.statementNo}?删除后不可恢复`, '危险操作', { type: 'error' })
    .then(() => {
      store.deleteStatement(row.id)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

const handleExport = () => {
  ElMessage.success(`导出 ${selectedRows.value.length} 条对账单`)
}

// 更多操作
const handleMoreAction = (command: string, row: PayableStatement) => {
  switch (command) {
    case 'submit': handleSubmit(row); break
    case 'audit': handleAudit(row); break
    case 'applyPay': handleApplyPayment(row); break
    case 'pay': openPaymentDialog(row); break
    case 'linkInvoice': openInvoiceDialog(row); break
    case 'cancel': handleCancel(row); break
  }
}

// 申请付款
const handleApplyPayment = (row: PayableStatement) => {
  ElMessageBox.confirm(`确认对账单 ${row.statementNo} 申请付款?申请金额 ¥${formatMoney(row.totalIncTaxCny)}`, '申请付款', { type: 'warning' })
    .then(() => {
      store.addLog(row.id, '申请付款', `申请付款金额 ¥${formatMoney(row.totalIncTaxCny)}`)
      ElMessage.success('已提交付款申请')
    })
    .catch(() => {})
}

// 付款登记 / 关联发票弹窗
const paymentDialogVisible = ref(false)
const invoiceDialogVisible = ref(false)

const openPaymentDialog = (row: PayableStatement) => {
  currentRow.value = row
  paymentDialogVisible.value = true
}
const openInvoiceDialog = (row: PayableStatement) => {
  currentRow.value = row
  invoiceDialogVisible.value = true
}

const onPaymentLinked = (payment: any) => {
  if (!currentRow.value) return
  store.addPayment(currentRow.value.id, payment)
  ElMessage.success('付款登记成功，对账单状态已变更为已付款')
  refreshCurrentRow()
}
const onInvoiceLinked = (invoice: any) => {
  if (!currentRow.value) return
  store.addInvoice(currentRow.value.id, invoice)
  ElMessage.success('发票绑定成功')
  refreshCurrentRow()
}

// 批量审核
const showBatchAudit = ref(false)
const batchAuditForm = reactive({ action: 'approve', rejectReason: '', remark: '' })
const handleBatchAudit = () => {
  const invalidRows = selectedRows.value.filter(r => r.status !== 'pending')
  if (invalidRows.length > 0) {
    ElMessage.warning('所选记录中存在非"待审核"状态，无法批量审核')
    return
  }
  batchAuditForm.action = 'approve'
  batchAuditForm.rejectReason = ''
  batchAuditForm.remark = ''
  showBatchAudit.value = true
}
const confirmBatchAudit = () => {
  if (batchAuditForm.action === 'reject' && !batchAuditForm.rejectReason) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  const newStatus: PayableStatementStatus = batchAuditForm.action === 'approve' ? 'pending_payment' : 'draft'
  const action = batchAuditForm.action === 'approve' ? '批量审核通过' : '批量审核驳回'
  selectedRows.value.forEach(row => store.changeStatus(row.id, newStatus, action, batchAuditForm.remark || batchAuditForm.rejectReason))
  ElMessage.success(`批量${batchAuditForm.action === 'approve' ? '审核通过' : '驳回'}成功`)
  showBatchAudit.value = false
  selectedRows.value = []
}

// 账龄分析
const showAgingAnalysis = ref(false)
const agingData = reactive({
  within30Days: 0,
  days31to60: 0,
  days61to90: 0,
  over90Days: 0
})
const agingTableData = ref<any[]>([])
const getAgingTagType = (level: string) => {
  const map: Record<string, string> = { '30天内': 'success', '31-60天': 'warning', '61-90天': 'danger', '90天以上': 'danger' }
  return map[level] || 'info'
}
const handleAgingAnalysis = () => {
  // 基于 store 现有数据计算账龄（mock：用结算日距今的天数）
  const now = new Date()
  const levels = ['30天内', '31-60天', '61-90天', '90天以上']
  const buckets = [0, 0, 0, 0]
  const rows: any[] = []
  store.list.filter(s => s.status === 'pending_payment').forEach(s => {
    const settle = new Date(s.settleDate)
    const days = Math.floor((now.getTime() - settle.getTime()) / (1000 * 60 * 60 * 24))
    const idx = days <= 30 ? 0 : days <= 60 ? 1 : days <= 90 ? 2 : 3
    const unpaid = unpaidAmount(s)
    if (unpaid > 0) {
      buckets[idx] += unpaid
      rows.push({
        supplier: s.supplier,
        statementNo: s.statementNo,
        totalIncTaxCny: s.totalIncTaxCny,
        unpaid,
        agingDays: days,
        agingLevel: levels[idx]
      })
    }
  })
  agingData.within30Days = buckets[0]
  agingData.days31to60 = buckets[1]
  agingData.days61to90 = buckets[2]
  agingData.over90Days = buckets[3]
  agingTableData.value = rows
  showAgingAnalysis.value = true
}

onMounted(() => {
  // 初始化
})
</script>

<style scoped>
.payable-statement-container {
  padding: 0;
}

.search-panel {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.action-bar {
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 10px;
}

.status-tabs {
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.table-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #eee;
  margin-top: 20px;
}

.text-success { color: #67c23a; }
.text-warning { color: #e6a23c; }
.text-danger { color: #f56c6c; }
.text-primary { color: #409eff; }
.text-info { color: #909399; }

.audit-form,
.send-form,
.batch-audit-form,
.batch-send-form {
  padding: 10px 0;
}

.aging-analysis {
  padding: 10px 0;
}

.aging-stats {
  margin-bottom: 10px;
}

.aging-stat-item {
  text-align: center;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
}

.aging-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.aging-value {
  font-size: 18px;
  font-weight: 600;
}

.more-dropdown-link {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

:deep(.row-warning) {
  background-color: #fdf6ec;
}

:deep(.el-table .cell) {
  white-space: nowrap;
}
</style>
