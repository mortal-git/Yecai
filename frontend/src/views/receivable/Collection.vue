<template>
  <div class="collection-apply-container">
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
        <el-form-item label="结算单位">
          <el-input v-model="searchForm.settlementUnit" placeholder="请输入" clearable style="width: 160px" />
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

    <!-- 操作按钮区域 -->
    <div class="action-bar">
      <el-button type="success" @click="handleExport" :disabled="!selectedRows.length">
        <el-icon><Download /></el-icon>
        导出
      </el-button>
      <el-button type="warning" @click="handleBatchAudit" :disabled="!selectedRows.length">
        <el-icon><Check /></el-icon>
        批量审核
      </el-button>
      <el-button type="info" @click="handleAgingAnalysis">
        <el-icon><DataAnalysis /></el-icon>
        账龄分析
      </el-button>
      <span class="action-tip">收款申请单仅可在应收对账单中通过"申请收款"生成</span>
    </div>

    <!-- 状态 Tab 导航 -->
    <div class="status-tabs">
      <el-radio-group v-model="activeStatusTab" @change="handleStatusTabChange">
        <el-radio-button value="all">全部</el-radio-button>
        <el-radio-button value="pending">待审核</el-radio-button>
        <el-radio-button value="approved">已审核</el-radio-button>
        <el-radio-button value="collected">已收款</el-radio-button>
        <el-radio-button value="rejected">已驳回</el-radio-button>
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
        <el-table-column prop="expectedCollectionDate" label="期望收款日期" min-width="120" />
        <el-table-column prop="status" label="申请状态" width="100">
          <template #default="scope">
            <el-tag :type="APPLY_STATUS_TYPE[scope.row.status]" size="small">
              {{ APPLY_STATUS_LABEL[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applicant" label="申请人" width="100" />
        <el-table-column prop="applyDate" label="申请日期" min-width="120" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" link @click.stop="handleView(scope.row)">查看</el-button>
            <el-button type="warning" size="small" link @click.stop="handleAudit(scope.row)" :disabled="scope.row.status !== 'pending'">审核</el-button>
            <el-button type="success" size="small" link @click.stop="handleRegister(scope.row)" :disabled="scope.row.status !== 'approved'">登记收款</el-button>
            <el-button type="danger" size="small" link @click.stop="handleCancel(scope.row)" :disabled="!canCancel(scope.row)">作废</el-button>
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

    <!-- 详情弹窗 -->
    <el-dialog v-model="showDetail" title="收款申请详情" width="800px">
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
            <div class="detail-item"><span class="detail-label">期望收款日期：</span>{{ currentApply.expectedCollectionDate }}</div>
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
        <div class="form-section-title">审核信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">审核人：</span>{{ currentApply.auditor || '-' }}</div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item"><span class="detail-label">审核时间：</span>{{ currentApply.auditTime || '-' }}</div>
          </el-col>
        </el-row>
        <div class="detail-item" style="margin-top: 8px">
          <span class="detail-label">审核意见：</span>{{ currentApply.auditRemark || '-' }}
        </div>
        <template v-if="currentApply.collection">
          <el-divider />
          <div class="form-section-title">收款记录</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="detail-item"><span class="detail-label">收款单号：</span>{{ currentApply.collection.collectionNo }}</div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item"><span class="detail-label">收款日期：</span>{{ currentApply.collection.collectionDate }}</div>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="detail-item"><span class="detail-label">收款方式：</span>{{ currentApply.collection.collectionMethod }}</div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item"><span class="detail-label">实际到账金额：</span>¥{{ formatMoney(currentApply.collection.actualAmount) }}</div>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="detail-item"><span class="detail-label">收款账户：</span>{{ currentApply.collection.bankAccount }}</div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item"><span class="detail-label">银行流水：</span>{{ currentApply.collection.transactionNo || '-' }}</div>
            </el-col>
          </el-row>
          <div class="detail-item" style="margin-top: 8px">
            <span class="detail-label">登记人：</span>{{ currentApply.collection.registrant }}
            <span class="detail-label">登记时间：</span>{{ currentApply.collection.registerTime }}
          </div>
        </template>
        <el-form-item v-if="currentApply.remark" label="备注" style="margin-top: 12px">
          {{ currentApply.remark }}
        </el-form-item>
      </div>
      <template #footer>
        <el-button @click="showDetail = false">关闭</el-button>
        <el-button v-if="currentApply && currentApply.status === 'pending'" type="warning" @click="handleAudit(currentApply); showDetail = false">审核</el-button>
        <el-button v-if="currentApply && currentApply.status === 'approved'" type="success" @click="handleRegister(currentApply); showDetail = false">登记收款</el-button>
      </template>
    </el-dialog>

    <!-- 审核弹窗 -->
    <el-dialog v-model="auditDialog.visible" title="审核收款申请" width="600px" :close-on-click-modal="false">
      <div class="audit-form">
        <el-form :model="auditDialog" label-width="100px">
          <el-form-item label="申请单号">{{ auditDialog.row?.applyNo }}</el-form-item>
          <el-form-item label="对账单号">{{ auditDialog.row?.statementNo }}</el-form-item>
          <el-form-item label="客户">{{ auditDialog.row?.customer }}</el-form-item>
          <el-form-item label="本次申请金额">
            <span class="text-primary">¥{{ formatMoney(auditDialog.row?.applyAmount || 0) }}</span>
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

    <!-- 登记收款弹窗 -->
    <el-dialog v-model="registerDialog.visible" title="登记收款记录" width="700px" :close-on-click-modal="false" destroy-on-close>
      <div class="register-form">
        <el-form :model="registerForm" label-width="120px">
          <div class="form-section-title">申请信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="申请单号">{{ registerDialog.row?.applyNo }}</el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="对账单号">{{ registerDialog.row?.statementNo }}</el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="客户">{{ registerDialog.row?.customer }}</el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="申请金额">
                <span class="text-primary">¥{{ formatMoney(registerDialog.row?.applyAmount || 0) }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-divider />
          <div class="form-section-title">收款信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="收款单号" required>
                <el-input v-model="registerForm.collectionNo" placeholder="请输入收款单号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="收款日期" required>
                <el-date-picker v-model="registerForm.collectionDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="收款方式" required>
                <el-select v-model="registerForm.collectionMethod" placeholder="请选择" style="width: 100%">
                  <el-option v-for="opt in COLLECTION_METHOD_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="收款账户" required>
                <el-select v-model="registerForm.bankAccount" placeholder="请选择" style="width: 100%">
                  <el-option v-for="opt in BANK_ACCOUNT_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="实际到账金额" required>
                <el-input-number v-model="registerForm.actualAmount" :min="0.01" :precision="2" :step="1000" style="width: 100%" />
                <el-button link type="primary" size="small" @click="registerForm.actualAmount = registerDialog.row?.applyAmount || 0" style="margin-left: 8px">全额</el-button>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="银行流水">
                <el-input v-model="registerForm.transactionNo" placeholder="请输入银行流水号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="备注">
            <el-input v-model="registerForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="registerDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmRegister" :loading="registerLoading">确认登记</el-button>
      </template>
    </el-dialog>

    <!-- 账龄分析弹窗 -->
    <el-dialog v-model="showAgingAnalysis" title="收款申请账龄分析" width="900px">
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
          <el-table-column prop="customer" label="客户" min-width="180" />
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
import { Search, Refresh, Download, Check, DataAnalysis } from '@element-plus/icons-vue'
import { useCollectionApplyStore, APPLY_STATUS_LABEL, APPLY_STATUS_TYPE, COLLECTION_METHOD_OPTIONS, BANK_ACCOUNT_OPTIONS, type CollectionApplyOrder, type CollectionApplyStatus } from '../../store/collectionApply'

const store = useCollectionApplyStore()

const loading = ref(false)
const selectedRows = ref<CollectionApplyOrder[]>([])
const activeStatusTab = ref<'all' | CollectionApplyStatus>('all')

const searchForm = reactive({
  applyNo: '',
  statementNo: '',
  customer: '',
  settlementUnit: '',
  status: '' as '' | CollectionApplyStatus,
  dateRange: [] as string[]
})

const pagination = reactive({ page: 1, size: 20 })

const showDetail = ref(false)
const showAgingAnalysis = ref(false)
const currentApply = ref<CollectionApplyOrder | null>(null)

const filteredData = computed(() => {
  return store.list.filter(item => {
    if (activeStatusTab.value !== 'all' && item.status !== activeStatusTab.value) return false
    if (searchForm.applyNo && !item.applyNo.toLowerCase().includes(searchForm.applyNo.toLowerCase())) return false
    if (searchForm.statementNo && !item.statementNo.toLowerCase().includes(searchForm.statementNo.toLowerCase())) return false
    if (searchForm.customer && !item.customer.toLowerCase().includes(searchForm.customer.toLowerCase())) return false
    if (searchForm.settlementUnit && !item.settlementUnit.toLowerCase().includes(searchForm.settlementUnit.toLowerCase())) return false
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

const formatMoney = (value: number) => (value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const handleSearch = () => {
  loading.value = true
  setTimeout(() => { loading.value = false }, 300)
  pagination.page = 1
}

const handleReset = () => {
  Object.assign(searchForm, {
    applyNo: '', statementNo: '', customer: '', settlementUnit: '', status: '', dateRange: []
  })
  handleSearch()
}

const handleStatusTabChange = () => {
  pagination.page = 1
}

const handlePageChange = () => {
  // computed 自动响应
}

const handleSelectionChange = (rows: CollectionApplyOrder[]) => {
  selectedRows.value = rows
}

const handleRowClick = (row: CollectionApplyOrder) => {
  handleView(row)
}

const handleView = (row: CollectionApplyOrder) => {
  currentApply.value = row
  showDetail.value = true
}

const handleViewStatement = (row: CollectionApplyOrder) => {
  ElMessage.info(`查看对账单 ${row.statementNo} 详情（功能开发中）`)
}

const canCancel = (row: CollectionApplyOrder) => row.status === 'pending' || row.status === 'approved'

// 审核
const auditDialog = reactive({
  visible: false,
  row: null as CollectionApplyOrder | null,
  passed: true,
  remark: ''
})
const handleAudit = (row: CollectionApplyOrder) => {
  auditDialog.row = row
  auditDialog.passed = true
  auditDialog.remark = ''
  auditDialog.visible = true
}
const confirmAudit = () => {
  if (!auditDialog.row) return
  store.auditApply(auditDialog.row.id, auditDialog.passed, auditDialog.remark)
  ElMessage.success(auditDialog.passed ? '审核已通过，可登记收款记录' : '已驳回')
  auditDialog.visible = false
}

// 批量审核
const handleBatchAudit = async () => {
  const invalidRows = selectedRows.value.filter(r => r.status !== 'pending')
  if (invalidRows.length > 0) {
    ElMessage.warning('所选记录中存在非"待审核"状态，无法批量审核')
    return
  }
  try {
    await ElMessageBox.confirm(`确认对选中的 ${selectedRows.value.length} 条申请单进行批量审核通过？`, '批量审核', { type: 'warning' })
    selectedRows.value.forEach(row => store.auditApply(row.id, true, '批量审核通过'))
    ElMessage.success(`成功审核 ${selectedRows.value.length} 条`)
    selectedRows.value = []
  } catch {
    // 取消
  }
}

// 登记收款记录
const registerDialog = reactive({
  visible: false,
  row: null as CollectionApplyOrder | null
})
const registerLoading = ref(false)
const registerForm = reactive({
  collectionNo: '',
  collectionDate: '',
  collectionMethod: '银行转账',
  bankAccount: '',
  actualAmount: 0,
  transactionNo: '',
  remark: ''
})
const handleRegister = (row: CollectionApplyOrder) => {
  registerDialog.row = row
  registerForm.collectionNo = ''
  registerForm.collectionDate = new Date().toISOString().slice(0, 10)
  registerForm.collectionMethod = '银行转账'
  registerForm.bankAccount = ''
  registerForm.actualAmount = row.applyAmount
  registerForm.transactionNo = ''
  registerForm.remark = ''
  registerDialog.visible = true
}
const confirmRegister = async () => {
  if (!registerDialog.row) return
  if (!registerForm.collectionNo) {
    ElMessage.warning('请输入收款单号')
    return
  }
  if (!registerForm.collectionDate) {
    ElMessage.warning('请选择收款日期')
    return
  }
  if (!registerForm.collectionMethod) {
    ElMessage.warning('请选择收款方式')
    return
  }
  if (!registerForm.bankAccount) {
    ElMessage.warning('请选择收款账户')
    return
  }
  if (registerForm.actualAmount <= 0) {
    ElMessage.warning('实际到账金额必须大于0')
    return
  }
  registerLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    store.registerCollection(registerDialog.row.id, {
      collectionNo: registerForm.collectionNo,
      collectionDate: registerForm.collectionDate,
      collectionMethod: registerForm.collectionMethod,
      bankAccount: registerForm.bankAccount,
      transactionNo: registerForm.transactionNo,
      actualAmount: registerForm.actualAmount,
      remark: registerForm.remark,
      registrant: '当前用户',
      registerTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
    })
    ElMessage.success('收款登记成功，对账单状态已更新')
    registerDialog.visible = false
  } finally {
    registerLoading.value = false
  }
}

// 作废
const handleCancel = async (row: CollectionApplyOrder) => {
  try {
    await ElMessageBox.confirm(`确认作废申请单 ${row.applyNo}？作废后不可恢复`, '警告', { type: 'warning' })
    store.cancelApply(row.id)
    ElMessage.success('已作废')
  } catch {
    // 取消
  }
}

const handleExport = () => {
  ElMessage.success(`导出 ${selectedRows.value.length} 条申请单`)
}

// 账龄分析
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
  store.list.filter(i => i.status === 'pending' || i.status === 'approved').forEach(i => {
    const apply = new Date(i.applyDate)
    const days = Math.floor((now.getTime() - apply.getTime()) / (1000 * 60 * 60 * 24))
    const idx = days <= 30 ? 0 : days <= 60 ? 1 : days <= 90 ? 2 : 3
    buckets[idx] += i.applyAmount
    rows.push({
      customer: i.customer,
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
.collection-apply-container {
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
  align-items: center;
}

.action-tip {
  margin-left: auto;
  font-size: 13px;
  color: #909399;
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

.detail-form,
.audit-form,
.register-form {
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
