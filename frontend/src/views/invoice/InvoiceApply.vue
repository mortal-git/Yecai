<template>
  <div class="invoice-apply-container">
    <!-- 搜索筛选区域 -->
    <div class="search-panel">
      <el-form :model="searchForm" :inline="true" label-width="100px">
        <el-form-item label="申请单号">
          <el-input v-model="searchForm.applyNo" placeholder="请输入" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="对账单号">
          <el-input v-model="searchForm.statementNo" placeholder="请输入" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="客户">
          <el-input v-model="searchForm.customer" placeholder="请输入客户名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="申请状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 140px">
            <el-option v-for="(label, key) in APPLY_STATUS_LABEL" :key="key" :label="label" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
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

    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-label">申请单总数</div>
            <div class="stat-value">{{ statistics.total }}</div>
            <div class="stat-sub">
              <span class="stat-sub-item">待开票 {{ statistics.pending }} 单</span>
              <span class="stat-sub-item">已开票 {{ statistics.invoiced }} 单</span>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-label">申请开票总额</div>
            <div class="stat-value primary">¥{{ formatMoney(statistics.totalApplyAmount) }}</div>
            <div class="stat-sub">
              <span class="stat-sub-item">不含作废记录</span>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-label">待开票金额</div>
            <div class="stat-value warning">¥{{ formatMoney(statistics.pendingAmount) }}</div>
            <div class="stat-sub">
              <span class="stat-sub-item">{{ statistics.pending }} 单待处理</span>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-label">已作废单数</div>
            <div class="stat-value info">{{ statistics.cancelled }}</div>
            <div class="stat-sub">
              <span class="stat-sub-item">作废记录不统计金额</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新增申请开票
      </el-button>
      <el-button type="success" @click="handleExport" :disabled="!selectedRows.length">
        <el-icon><Download /></el-icon>
        导出
      </el-button>
      <el-button type="warning" @click="handleBatchInvoice" :disabled="!selectedRows.length">
        <el-icon><Check /></el-icon>
        批量开票
      </el-button>
      <el-button type="info" @click="handleRefresh">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <!-- 状态 Tab 导航 -->
    <div class="status-tabs">
      <el-radio-group v-model="activeStatusTab" @change="handleStatusTabChange">
        <el-radio-button value="all">全部</el-radio-button>
        <el-radio-button value="pending">待开票</el-radio-button>
        <el-radio-button value="invoiced">已开票</el-radio-button>
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
      >
        <el-table-column type="selection" width="55" fixed />
        <el-table-column prop="applyNo" label="申请单号" min-width="150" sortable fixed />
        <el-table-column prop="statementNo" label="对账单号" min-width="140" fixed>
          <template #default="scope">
            <el-link type="primary" @click.stop="handleViewStatement(scope.row)">{{ scope.row.statementNo }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="customer" label="客户" min-width="200" show-overflow-tooltip />
        <el-table-column prop="settlementUnit" label="结算单位" min-width="120" />
        <el-table-column prop="statementTotalIncTax" label="对账含税金额" min-width="130" align="right">
          <template #default="scope">¥{{ formatMoney(scope.row.statementTotalIncTax) }}</template>
        </el-table-column>
        <el-table-column prop="appliedBeforeAmount" label="此前已申请金额" min-width="140" align="right">
          <template #default="scope">
            <span :class="scope.row.appliedBeforeAmount > 0 ? 'text-warning' : 'text-info'">¥{{ formatMoney(scope.row.appliedBeforeAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="incTaxAmount" label="本次申请金额" min-width="140" align="right" sortable>
          <template #default="scope">
            <span class="text-primary">¥{{ formatMoney(scope.row.incTaxAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remainingAmount" label="剩余可申请金额" min-width="140" align="right">
          <template #default="scope">
            <span :class="scope.row.remainingAmount > 0 ? 'text-success' : 'text-info'">¥{{ formatMoney(scope.row.remainingAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="invoiceType" label="发票类型" min-width="140" />
        <el-table-column prop="taxRate" label="税率" width="80" align="center">
          <template #default="scope">{{ scope.row.taxRate }}%</template>
        </el-table-column>
        <el-table-column prop="taxAmount" label="税额" min-width="120" align="right">
          <template #default="scope">¥{{ formatMoney(scope.row.taxAmount) }}</template>
        </el-table-column>
        <el-table-column prop="applyAmount" label="不含税金额" min-width="120" align="right">
          <template #default="scope">¥{{ formatMoney(scope.row.applyAmount) }}</template>
        </el-table-column>
        <el-table-column prop="expectedInvoiceDate" label="期望开票日期" min-width="120" />
        <el-table-column prop="status" label="申请状态" width="100">
          <template #default="scope">
            <el-tag :type="APPLY_STATUS_TYPE[scope.row.status]" size="small">
              {{ APPLY_STATUS_LABEL[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applicant" label="申请人" width="100" />
        <el-table-column prop="applyDate" label="申请日期" min-width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" link @click.stop="handleView(scope.row)">查看</el-button>
            <el-button type="success" size="small" link @click.stop="handleInvoice(scope.row)" :disabled="scope.row.status !== 'pending'">开票</el-button>
            <el-button type="danger" size="small" link @click.stop="handleCancel(scope.row)" :disabled="scope.row.status !== 'pending'">作废</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <span class="pagination-info">共 {{ filteredData.length }} 条记录</span>
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="filteredData.length"
          :page-sizes="[20, 50, 100, 200]"
          layout="sizes, prev, pager, next, jumper"
          @size-change="handlePageChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 新增申请开票弹窗 -->
    <el-dialog
      v-model="showCreate"
      title="新增申请开票"
      width="800px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="create-form">
        <el-form :model="form" label-width="130px">
          <!-- 选择对账单 -->
          <div class="form-section-title">选择对账单</div>
          <el-form-item label="应收对账单" required>
            <el-select
              v-model="form.statementId"
              filterable
              placeholder="请选择对账单（仅显示待开票/待收款/已收款）"
              style="width: 100%"
              @change="handleStatementChange"
            >
              <el-option
                v-for="s in availableStatements"
                :key="s.id"
                :label="`${s.statementNo} - ${s.customer} - 剩余可申请 ¥${formatMoney(getStatementRemaining(s.id))}`"
                :value="s.id"
              />
            </el-select>
          </el-form-item>

          <!-- 对账单信息 -->
          <template v-if="form.statementId && currentStatement">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="对账单号">
                  {{ currentStatement.statementNo }}
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="客户">
                  {{ currentStatement.customer }}
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="结算单位">
                  {{ currentStatement.settlementUnit }}
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="对账含税金额">
                  <span class="text-primary">¥{{ formatMoney(currentStatement.totalIncTaxCny) }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="已申请开票金额">
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
          </template>

          <!-- 发票信息 -->
          <div class="form-section-title">发票信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="发票类型" required>
                <el-select v-model="form.invoiceType" placeholder="请选择" style="width: 100%">
                  <el-option v-for="opt in INVOICE_TYPE_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="期望开票日期" required>
                <el-date-picker v-model="form.expectedInvoiceDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="税率" required>
                <el-select v-model="form.taxRate" placeholder="请选择" style="width: 100%" @change="recalcAmount">
                  <el-option v-for="opt in APPLY_TAX_RATE_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="本次申请金额" required>
                <el-input-number
                  v-model="form.incTaxAmount"
                  :min="0.01"
                  :max="remainingAmount"
                  :precision="2"
                  :step="1000"
                  style="width: 100%"
                  @change="recalcAmount"
                />
                <el-button link type="primary" size="small" @click="form.incTaxAmount = remainingAmount; recalcAmount()" style="margin-left: 8px">全额</el-button>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="不含税金额">
                <span class="text-primary">¥{{ formatMoney(form.applyAmount) }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="税额">
                <span class="text-primary">¥{{ formatMoney(form.taxAmount) }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showCreate = false">取消</el-button>
        <el-button type="primary" @click="confirmCreate" :loading="createLoading">确认申请</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="showDetail" title="申请开票详情" width="800px">
      <div v-if="currentApply" class="detail-form">
        <div class="form-section-title">基本信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">申请单号：</span>{{ currentApply.applyNo }}</div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">申请状态：</span>
              <el-tag :type="APPLY_STATUS_TYPE[currentApply.status]" size="small">{{ APPLY_STATUS_LABEL[currentApply.status] }}</el-tag>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">对账单号：</span>{{ currentApply.statementNo }}</div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">客户：</span>{{ currentApply.customer }}</div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">结算单位：</span>{{ currentApply.settlementUnit }}</div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">期望开票日期：</span>{{ currentApply.expectedInvoiceDate }}</div>
          </el-col>
        </el-row>
        <el-divider />
        <div class="form-section-title">金额明细</div>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="detail-item"><span class="detail-label">对账含税金额：</span>¥{{ formatMoney(currentApply.statementTotalIncTax) }}</div>
          </el-col>
          <el-col :span="6">
            <div class="detail-item"><span class="detail-label">此前已申请：</span>¥{{ formatMoney(currentApply.appliedBeforeAmount) }}</div>
          </el-col>
          <el-col :span="6">
            <div class="detail-item"><span class="detail-label">本次申请：</span>¥{{ formatMoney(currentApply.incTaxAmount) }}</div>
          </el-col>
          <el-col :span="6">
            <div class="detail-item"><span class="detail-label">剩余可申请：</span>¥{{ formatMoney(currentApply.remainingAmount) }}</div>
          </el-col>
        </el-row>
        <el-divider />
        <div class="form-section-title">发票信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">发票类型：</span>{{ currentApply.invoiceType }}</div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">税率：</span>{{ currentApply.taxRate }}%</div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">不含税金额：</span>¥{{ formatMoney(currentApply.applyAmount) }}</div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">税额：</span>¥{{ formatMoney(currentApply.taxAmount) }}</div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">申请人：</span>{{ currentApply.applicant }}</div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">申请日期：</span>{{ currentApply.applyDate }}</div>
          </el-col>
        </el-row>
        <el-form-item v-if="currentApply.remark" label="备注" style="margin-top: 12px">
          {{ currentApply.remark }}
        </el-form-item>
      </div>
      <template #footer>
        <el-button @click="showDetail = false">关闭</el-button>
        <el-button v-if="currentApply && currentApply.status === 'pending'" type="success" @click="handleInvoice(currentApply); showDetail = false">开票</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Download, Check } from '@element-plus/icons-vue'
import { useInvoiceApplyStore, APPLY_STATUS_LABEL, APPLY_STATUS_TYPE, INVOICE_TYPE_OPTIONS, APPLY_TAX_RATE_OPTIONS, type InvoiceApplyOrder, type InvoiceApplyStatus } from '../../store/invoiceApply'
import { useReceivableStatementStore, type ReceivableStatement } from '../../store/receivableStatement'

const store = useInvoiceApplyStore()
const receivableStore = useReceivableStatementStore()

const loading = ref(false)
const selectedRows = ref<InvoiceApplyOrder[]>([])
const activeStatusTab = ref<'all' | InvoiceApplyStatus>('all')

const searchForm = reactive({
  applyNo: '',
  statementNo: '',
  customer: '',
  status: '' as '' | InvoiceApplyStatus,
  dateRange: [] as string[]
})

const pagination = reactive({ page: 1, size: 20 })

const showCreate = ref(false)
const showDetail = ref(false)
const createLoading = ref(false)
const currentApply = ref<InvoiceApplyOrder | null>(null)

const form = reactive({
  statementId: '',
  invoiceType: '增值税专用发票',
  taxRate: 13,
  incTaxAmount: 0,
  applyAmount: 0,
  taxAmount: 0,
  expectedInvoiceDate: '',
  remark: ''
})

const availableStatements = computed(() => store.getAvailableStatements())

const currentStatement = computed<ReceivableStatement | undefined>(() =>
  receivableStore.list.find(s => s.id === form.statementId)
)

const appliedAmount = computed(() =>
  form.statementId ? store.getAppliedAmountByStatement(form.statementId) : 0
)

const remainingAmount = computed(() => {
  if (!currentStatement.value) return 0
  return Math.max(0, currentStatement.value.totalIncTaxCny - appliedAmount.value)
})

const getStatementRemaining = (statementId: string) => {
  const stmt = receivableStore.list.find(s => s.id === statementId)
  if (!stmt) return 0
  return Math.max(0, stmt.totalIncTaxCny - store.getAppliedAmountByStatement(statementId))
}

const filteredData = computed(() => {
  return store.list.filter(item => {
    if (activeStatusTab.value !== 'all' && item.status !== activeStatusTab.value) return false
    if (searchForm.applyNo && !item.applyNo.toLowerCase().includes(searchForm.applyNo.toLowerCase())) return false
    if (searchForm.statementNo && !item.statementNo.toLowerCase().includes(searchForm.statementNo.toLowerCase())) return false
    if (searchForm.customer && !item.customer.toLowerCase().includes(searchForm.customer.toLowerCase())) return false
    if (searchForm.status && item.status !== searchForm.status) return false
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      if (item.applyDate < searchForm.dateRange[0] || item.applyDate > searchForm.dateRange[1]) return false
    }
    return true
  })
})

const pagedData = computed(() => {
  const start = (pagination.page - 1) * pagination.size
  return filteredData.value.slice(start, start + pagination.size)
})

const statistics = computed(() => store.statistics)

const formatMoney = (value: number) => (value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const recalcAmount = () => {
  const incTax = form.incTaxAmount || 0
  const rate = form.taxRate || 0
  const exTax = Number((incTax / (1 + rate / 100)).toFixed(2))
  form.applyAmount = exTax
  form.taxAmount = Number((incTax - exTax).toFixed(2))
}

const handleStatementChange = () => {
  if (currentStatement.value) {
    form.incTaxAmount = remainingAmount.value
    recalcAmount()
  }
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => { loading.value = false }, 300)
  pagination.page = 1
}

const handleReset = () => {
  Object.assign(searchForm, {
    applyNo: '', statementNo: '', customer: '', status: '', dateRange: []
  })
  handleSearch()
}

const handleStatusTabChange = () => {
  pagination.page = 1
}

const handlePageChange = () => {
  // computed 自动响应
}

const handleSelectionChange = (rows: InvoiceApplyOrder[]) => {
  selectedRows.value = rows
}

const handleRowClick = (row: InvoiceApplyOrder) => {
  handleView(row)
}

const handleView = (row: InvoiceApplyOrder) => {
  currentApply.value = row
  showDetail.value = true
}

const handleViewStatement = (row: InvoiceApplyOrder) => {
  ElMessage.info(`查看对账单 ${row.statementNo} 详情（功能开发中）`)
}

const handleCreate = () => {
  form.statementId = ''
  form.invoiceType = '增值税专用发票'
  form.taxRate = 13
  form.incTaxAmount = 0
  form.applyAmount = 0
  form.taxAmount = 0
  form.expectedInvoiceDate = new Date().toISOString().slice(0, 10)
  form.remark = ''
  showCreate.value = true
}

const confirmCreate = async () => {
  if (!form.statementId) {
    ElMessage.warning('请选择应收对账单')
    return
  }
  if (!currentStatement.value) {
    ElMessage.warning('对账单不存在')
    return
  }
  if (!form.expectedInvoiceDate) {
    ElMessage.warning('请选择期望开票日期')
    return
  }
  if (form.incTaxAmount <= 0) {
    ElMessage.warning('本次申请金额必须大于0')
    return
  }
  if (form.incTaxAmount > remainingAmount.value) {
    ElMessage.warning(`本次申请金额不能超过剩余可申请金额 ¥${formatMoney(remainingAmount.value)}`)
    return
  }
  createLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    store.addApply({
      statementId: currentStatement.value.id,
      statementNo: currentStatement.value.statementNo,
      customer: currentStatement.value.customer,
      settlementUnit: currentStatement.value.settlementUnit,
      statementTotalIncTax: currentStatement.value.totalIncTaxCny,
      applyAmount: form.applyAmount,
      taxRate: form.taxRate,
      taxAmount: form.taxAmount,
      incTaxAmount: form.incTaxAmount,
      invoiceType: form.invoiceType,
      expectedInvoiceDate: form.expectedInvoiceDate,
      status: 'pending',
      remark: form.remark
    })
    ElMessage.success('申请开票单已生成')
    showCreate.value = false
  } finally {
    createLoading.value = false
  }
}

const handleInvoice = async (row: InvoiceApplyOrder) => {
  try {
    await ElMessageBox.confirm(`确认对申请单 ${row.applyNo} 进行开票？开票后状态将变为"已开票"`, '提示', { type: 'warning' })
    store.updateStatus(row.id, 'invoiced', '开票登记')
    ElMessage.success('开票成功')
  } catch {
    // 取消
  }
}

const handleCancel = async (row: InvoiceApplyOrder) => {
  try {
    await ElMessageBox.confirm(`确认作废申请单 ${row.applyNo}？作废后不可恢复`, '警告', { type: 'warning' })
    store.updateStatus(row.id, 'cancelled', '作废申请')
    ElMessage.success('已作废')
  } catch {
    // 取消
  }
}

const handleBatchInvoice = async () => {
  const invalidRows = selectedRows.value.filter(r => r.status !== 'pending')
  if (invalidRows.length > 0) {
    ElMessage.warning('所选记录中存在非"待开票"状态，无法批量开票')
    return
  }
  try {
    await ElMessageBox.confirm(`确认对选中的 ${selectedRows.value.length} 条申请单进行开票？`, '提示', { type: 'warning' })
    selectedRows.value.forEach(row => store.updateStatus(row.id, 'invoiced', '批量开票'))
    ElMessage.success(`成功开票 ${selectedRows.value.length} 条`)
    selectedRows.value = []
  } catch {
    // 取消
  }
}

const handleExport = () => {
  ElMessage.success(`导出 ${selectedRows.value.length} 条申请单`)
}

const handleRefresh = () => {
  handleSearch()
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.invoice-apply-container {
  padding: 0;
}

.search-panel {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.statistics-cards {
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-card {
  padding: 12px 16px;
  border-radius: 6px;
  background: #f8f9fa;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-value.primary { color: #409eff; }
.stat-value.success { color: #67c23a; }
.stat-value.warning { color: #e6a23c; }
.stat-value.info { color: #909399; }

.stat-sub {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 4px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-sub-item {
  display: inline-flex;
  align-items: center;
}

.action-bar {
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 10px;
}

.status-tabs {
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
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
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
  margin-top: 20px;
}

.pagination-info {
  font-size: 13px;
  color: #909399;
}

.text-success { color: #67c23a; }
.text-warning { color: #e6a23c; }
.text-danger { color: #f56c6c; }
.text-primary { color: #409eff; }
.text-info { color: #909399; }

.form-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}

.create-form,
.detail-form {
  padding: 10px 0;
}

.detail-item {
  font-size: 14px;
  color: #303133;
  line-height: 32px;
}

.detail-label {
  color: #909399;
  margin-right: 4px;
}
</style>
