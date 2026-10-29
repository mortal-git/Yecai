<template>
  <div class="payment-apply-container">
    <!-- 搜索筛选区域 -->
    <div class="search-panel">
      <el-form :model="searchForm" :inline="true" label-width="100px">
        <el-form-item label="申请单号">
          <el-input v-model="searchForm.applyNo" placeholder="请输入" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="对账单号">
          <el-input v-model="searchForm.statementNo" placeholder="请输入" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="searchForm.supplier" placeholder="请输入供应商名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="结算单位">
          <el-input v-model="searchForm.settlementUnit" placeholder="请输入" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="申请状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 140px">
            <el-option v-for="(label, key) in APPLY_STATUS_LABEL" :key="key" :label="label" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item label="付款方式">
          <el-select v-model="searchForm.paymentMethod" placeholder="请选择" clearable style="width: 140px">
            <el-option v-for="opt in PAYMENT_METHOD_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
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

    <!-- 操作按钮区域 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新增付款申请
      </el-button>
      <el-button type="success" @click="handleExport" :disabled="!selectedRows.length">
        <el-icon><Download /></el-icon>
        导出
      </el-button>
      <el-button type="warning" @click="handleBatchPay" :disabled="!selectedRows.length">
        <el-icon><Check /></el-icon>
        批量确认付款
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
        <el-radio-button value="pending">待付款</el-radio-button>
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
      >
        <el-table-column type="selection" width="55" fixed />
        <el-table-column prop="applyNo" label="申请单号" min-width="150" sortable fixed />
        <el-table-column prop="statementNo" label="对账单号" min-width="140" fixed>
          <template #default="scope">
            <el-link type="primary" @click.stop="handleViewStatement(scope.row)">{{ scope.row.statementNo }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="supplier" label="供应商" min-width="200" show-overflow-tooltip />
        <el-table-column prop="settlementUnit" label="结算单位" min-width="120" />
        <el-table-column prop="settlementBank" label="结算银行" min-width="120" />
        <el-table-column prop="settlementAccount" label="结算账号" min-width="160" />
        <el-table-column prop="statementTotalIncTax" label="对账含税金额" min-width="130" align="right">
          <template #default="scope">¥{{ formatMoney(scope.row.statementTotalIncTax) }}</template>
        </el-table-column>
        <el-table-column prop="appliedBeforeAmount" label="此前已申请金额" min-width="140" align="right">
          <template #default="scope">
            <span :class="scope.row.appliedBeforeAmount > 0 ? 'text-warning' : 'text-info'">¥{{ formatMoney(scope.row.appliedBeforeAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="applyAmount" label="本次申请金额" min-width="140" align="right" sortable>
          <template #default="scope">
            <span class="text-primary">¥{{ formatMoney(scope.row.applyAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remainingAmount" label="剩余可申请金额" min-width="140" align="right">
          <template #default="scope">
            <span :class="scope.row.remainingAmount > 0 ? 'text-success' : 'text-info'">¥{{ formatMoney(scope.row.remainingAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="付款方式" min-width="100" />
        <el-table-column prop="bankAccount" label="付款账户" min-width="200" show-overflow-tooltip />
        <el-table-column prop="expectedPaymentDate" label="期望付款日期" min-width="120" />
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
            <el-button type="success" size="small" link @click.stop="handlePay(scope.row)" :disabled="scope.row.status !== 'pending'">确认付款</el-button>
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

    <!-- 新增付款申请弹窗 -->
    <el-dialog
      v-model="showCreate"
      title="新增付款申请"
      width="800px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="create-form">
        <el-form :model="form" label-width="130px">
          <!-- 选择对账单 -->
          <div class="form-section-title">选择对账单</div>
          <el-form-item label="应付对账单" required>
            <el-select
              v-model="form.statementId"
              filterable
              placeholder="请选择对账单（仅显示待付款/已付款）"
              style="width: 100%"
              @change="handleStatementChange"
            >
              <el-option
                v-for="s in availableStatements"
                :key="s.id"
                :label="`${s.statementNo} - ${s.supplier} - 剩余可申请 ¥${formatMoney(getStatementRemaining(s.id))}`"
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
                <el-form-item label="供应商">
                  {{ currentStatement.supplier }}
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
                <el-form-item label="已申请付款金额">
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

          <!-- 付款信息 -->
          <div class="form-section-title">付款信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="付款方式" required>
                <el-select v-model="form.paymentMethod" placeholder="请选择" style="width: 100%">
                  <el-option v-for="opt in PAYMENT_METHOD_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="付款账户" required>
                <el-select v-model="form.bankAccount" placeholder="请选择" style="width: 100%">
                  <el-option v-for="opt in BANK_ACCOUNT_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="期望付款日期" required>
                <el-date-picker v-model="form.expectedPaymentDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
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
        <el-button @click="showCreate = false">取消</el-button>
        <el-button type="primary" @click="confirmCreate" :loading="createLoading">确认申请</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="showDetail" title="付款申请详情" width="800px">
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
            <div class="detail-item"><span class="detail-label">供应商：</span>{{ currentApply.supplier }}</div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">结算单位：</span>{{ currentApply.settlementUnit }}</div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">期望付款日期：</span>{{ currentApply.expectedPaymentDate }}</div>
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
            <div class="detail-item"><span class="detail-label">本次申请：</span>¥{{ formatMoney(currentApply.applyAmount) }}</div>
          </el-col>
          <el-col :span="6">
            <div class="detail-item"><span class="detail-label">剩余可申请：</span>¥{{ formatMoney(currentApply.remainingAmount) }}</div>
          </el-col>
        </el-row>
        <el-divider />
        <div class="form-section-title">付款信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">付款方式：</span>{{ currentApply.paymentMethod }}</div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">付款账户：</span>{{ currentApply.bankAccount }}</div>
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
        <el-button v-if="currentApply && currentApply.status === 'pending'" type="success" @click="handlePay(currentApply); showDetail = false">确认付款</el-button>
      </template>
    </el-dialog>

    <!-- 账龄分析弹窗 -->
    <el-dialog v-model="showAgingAnalysis" title="付款申请账龄分析" width="900px">
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
          <el-table-column prop="applyNo" label="申请单号" min-width="150" />
          <el-table-column prop="applyAmount" label="申请金额" min-width="130" align="right">
            <template #default="scope">¥{{ formatMoney(scope.row.applyAmount) }}</template>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Download, Check, DataAnalysis } from '@element-plus/icons-vue'
import { usePaymentApplyStore, APPLY_STATUS_LABEL, APPLY_STATUS_TYPE, PAYMENT_METHOD_OPTIONS, BANK_ACCOUNT_OPTIONS, type PaymentApplyOrder, type PaymentApplyStatus } from '../../store/paymentApply'
import { usePayableStatementStore, type PayableStatement } from '../../store/payableStatement'

const store = usePaymentApplyStore()
const payableStore = usePayableStatementStore()

const loading = ref(false)
const selectedRows = ref<PaymentApplyOrder[]>([])
const activeStatusTab = ref<'all' | PaymentApplyStatus>('all')

const searchForm = reactive({
  applyNo: '',
  statementNo: '',
  supplier: '',
  settlementUnit: '',
  status: '' as '' | PaymentApplyStatus,
  paymentMethod: '',
  dateRange: [] as string[]
})

const pagination = reactive({ page: 1, size: 20 })

const showCreate = ref(false)
const showDetail = ref(false)
const showAgingAnalysis = ref(false)
const createLoading = ref(false)
const currentApply = ref<PaymentApplyOrder | null>(null)

const form = reactive({
  statementId: '',
  paymentMethod: '银行转账',
  bankAccount: '',
  applyAmount: 0,
  expectedPaymentDate: '',
  remark: ''
})

const availableStatements = computed(() => store.getAvailableStatements())

const currentStatement = computed<PayableStatement | undefined>(() =>
  payableStore.list.find(s => s.id === form.statementId)
)

const appliedAmount = computed(() =>
  form.statementId ? store.getAppliedAmountByStatement(form.statementId) : 0
)

const remainingAmount = computed(() => {
  if (!currentStatement.value) return 0
  return Math.max(0, currentStatement.value.totalIncTaxCny - appliedAmount.value)
})

const getStatementRemaining = (statementId: string) => {
  const stmt = payableStore.list.find(s => s.id === statementId)
  if (!stmt) return 0
  return Math.max(0, stmt.totalIncTaxCny - store.getAppliedAmountByStatement(statementId))
}

const filteredData = computed(() => {
  return store.list.filter(item => {
    if (activeStatusTab.value !== 'all' && item.status !== activeStatusTab.value) return false
    if (searchForm.applyNo && !item.applyNo.toLowerCase().includes(searchForm.applyNo.toLowerCase())) return false
    if (searchForm.statementNo && !item.statementNo.toLowerCase().includes(searchForm.statementNo.toLowerCase())) return false
    if (searchForm.supplier && !item.supplier.toLowerCase().includes(searchForm.supplier.toLowerCase())) return false
    if (searchForm.settlementUnit && !item.settlementUnit.toLowerCase().includes(searchForm.settlementUnit.toLowerCase())) return false
    if (searchForm.status && item.status !== searchForm.status) return false
    if (searchForm.paymentMethod && item.paymentMethod !== searchForm.paymentMethod) return false
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

const formatMoney = (value: number) => (value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const handleStatementChange = () => {
  if (currentStatement.value) {
    form.applyAmount = remainingAmount.value
  }
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => { loading.value = false }, 300)
  pagination.page = 1
}

const handleReset = () => {
  Object.assign(searchForm, {
    applyNo: '', statementNo: '', supplier: '', settlementUnit: '', status: '', paymentMethod: '', dateRange: []
  })
  handleSearch()
}

const handleStatusTabChange = () => {
  pagination.page = 1
}

const handlePageChange = () => {
  // computed 自动响应
}

const handleSelectionChange = (rows: PaymentApplyOrder[]) => {
  selectedRows.value = rows
}

const handleRowClick = (row: PaymentApplyOrder) => {
  handleView(row)
}

const handleView = (row: PaymentApplyOrder) => {
  currentApply.value = row
  showDetail.value = true
}

const handleViewStatement = (row: PaymentApplyOrder) => {
  ElMessage.info(`查看对账单 ${row.statementNo} 详情（功能开发中）`)
}

const handleCreate = () => {
  form.statementId = ''
  form.paymentMethod = '银行转账'
  form.bankAccount = ''
  form.applyAmount = 0
  form.expectedPaymentDate = new Date().toISOString().slice(0, 10)
  form.remark = ''
  showCreate.value = true
}

const confirmCreate = async () => {
  if (!form.statementId) {
    ElMessage.warning('请选择应付对账单')
    return
  }
  if (!currentStatement.value) {
    ElMessage.warning('对账单不存在')
    return
  }
  if (!form.expectedPaymentDate) {
    ElMessage.warning('请选择期望付款日期')
    return
  }
  if (!form.paymentMethod) {
    ElMessage.warning('请选择付款方式')
    return
  }
  if (!form.bankAccount) {
    ElMessage.warning('请选择付款账户')
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
  createLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    store.addApply({
      statementId: currentStatement.value.id,
      statementNo: currentStatement.value.statementNo,
      supplier: currentStatement.value.supplier,
      settlementUnit: currentStatement.value.settlementUnit,
      settlementBank: currentStatement.value.settlementBank,
      settlementAccount: currentStatement.value.settlementAccount,
      statementTotalIncTax: currentStatement.value.totalIncTaxCny,
      applyAmount: form.applyAmount,
      paymentMethod: form.paymentMethod,
      bankAccount: form.bankAccount,
      expectedPaymentDate: form.expectedPaymentDate,
      status: 'pending',
      remark: form.remark
    })
    ElMessage.success('付款申请单已生成')
    showCreate.value = false
  } finally {
    createLoading.value = false
  }
}

const handlePay = async (row: PaymentApplyOrder) => {
  try {
    await ElMessageBox.confirm(`确认对申请单 ${row.applyNo} 进行付款？确认后状态将变为"已付款"`, '提示', { type: 'warning' })
    store.updateStatus(row.id, 'paid')
    ElMessage.success('付款确认成功')
  } catch {
    // 取消
  }
}

const handleCancel = async (row: PaymentApplyOrder) => {
  try {
    await ElMessageBox.confirm(`确认作废申请单 ${row.applyNo}？作废后不可恢复`, '警告', { type: 'warning' })
    store.updateStatus(row.id, 'cancelled')
    ElMessage.success('已作废')
  } catch {
    // 取消
  }
}

const handleBatchPay = async () => {
  const invalidRows = selectedRows.value.filter(r => r.status !== 'pending')
  if (invalidRows.length > 0) {
    ElMessage.warning('所选记录中存在非"待付款"状态，无法批量确认')
    return
  }
  try {
    await ElMessageBox.confirm(`确认对选中的 ${selectedRows.value.length} 条申请单进行付款？`, '提示', { type: 'warning' })
    selectedRows.value.forEach(row => store.updateStatus(row.id, 'paid'))
    ElMessage.success(`成功确认付款 ${selectedRows.value.length} 条`)
    selectedRows.value = []
  } catch {
    // 取消
  }
}

const handleExport = () => {
  ElMessage.success(`导出 ${selectedRows.value.length} 条申请单`)
}

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
  const now = new Date()
  const levels = ['30天内', '31-60天', '61-90天', '90天以上']
  const buckets = [0, 0, 0, 0]
  const rows: any[] = []
  store.list.filter(i => i.status === 'pending').forEach(i => {
    const apply = new Date(i.applyDate)
    const days = Math.floor((now.getTime() - apply.getTime()) / (1000 * 60 * 60 * 24))
    const idx = days <= 30 ? 0 : days <= 60 ? 1 : days <= 90 ? 2 : 3
    buckets[idx] += i.applyAmount
    rows.push({
      supplier: i.supplier,
      statementNo: i.statementNo,
      applyNo: i.applyNo,
      applyAmount: i.applyAmount,
      agingDays: days,
      agingLevel: levels[idx]
    })
  })
  agingData.within30Days = buckets[0]
  agingData.days31to60 = buckets[1]
  agingData.days61to90 = buckets[2]
  agingData.over90Days = buckets[3]
  agingTableData.value = rows
  showAgingAnalysis.value = true
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.payment-apply-container {
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

:deep(.el-table .cell) {
  white-space: nowrap;
}
</style>
