<template>
  <div class="payable-list-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <span class="page-title">应付单列表</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新增应付单
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon total"><el-icon><Money /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">¥{{ statistics.totalAmount.toLocaleString() }}</div>
              <div class="stat-label">应付总额</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon paid"><el-icon><CircleCheck /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">¥{{ statistics.paidAmount.toLocaleString() }}</div>
              <div class="stat-label">已付款</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon pending"><el-icon><Clock /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">¥{{ statistics.pendingAmount.toLocaleString() }}</div>
              <div class="stat-label">待付款</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon overdue"><el-icon><Warning /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">¥{{ statistics.overdueAmount.toLocaleString() }}</div>
              <div class="stat-label">逾期金额</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-panel">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="供应商">
          <el-select
            v-model="searchForm.supplierId"
            placeholder="请选择供应商"
            clearable
            filterable
            style="width: 200px"
          >
            <el-option
              v-for="supplier in supplierList"
              :key="supplier.id"
              :label="supplier.name"
              :value="supplier.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="订单">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="请输入订单号"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 140px">
            <el-option label="待确认" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="部分付款" value="partial" />
            <el-option label="已核销" value="written_off" />
            <el-option label="部分核销" value="partial_writeoff" />
            <el-option label="已逾期" value="overdue" />
          </el-select>
        </el-form-item>
        <el-form-item label="应付日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item label="逾期状态">
          <el-select v-model="searchForm.overdueStatus" placeholder="请选择" clearable style="width: 140px">
            <el-option label="未逾期" value="normal" />
            <el-option label="逾期1-30天" value="overdue1" />
            <el-option label="逾期31-60天" value="overdue2" />
            <el-option label="逾期61-90天" value="overdue3" />
            <el-option label="逾期90天以上" value="overdue4" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="action-left">
        <el-checkbox v-model="isAllSelected" @change="handleSelectAll">全选</el-checkbox>
        <el-divider direction="vertical" />
        <span class="selected-count">已选择 {{ selectedRows.length }} 项</span>
      </div>
      <div class="action-right">
        <el-button size="small" :disabled="!selectedRows.length" @click="handleBatchConfirm">
          批量确认
        </el-button>
        <el-button size="small" :disabled="!selectedRows.length" @click="handleBatchPayment">
          批量付款
        </el-button>
        <el-button size="small" :disabled="!selectedRows.length" @click="handleBatchWriteoff">
          批量核销
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table
        ref="tableRef"
        :data="tableData"
        border
        stripe
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="payableNo" label="应付单号" width="160" fixed />
        <el-table-column prop="supplierName" label="供应商名称" min-width="160" />
        <el-table-column prop="orderNo" label="关联订单" width="160">
          <template #default="{ row }">
            <el-link type="primary" @click.prevent="handleViewOrder(row.orderId)">
              {{ row.orderNo }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="invoiceNo" label="关联发票" width="140">
          <template #default="{ row }">
            <el-link v-if="row.invoiceId" type="primary" @click.prevent="handleViewInvoice(row.invoiceId)">
              {{ row.invoiceNo }}
            </el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="应付金额" width="120" align="right">
          <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="paidAmount" label="已付金额" width="120" align="right">
          <template #default="{ row }">¥{{ row.paidAmount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="pendingAmount" label="待付金额" width="120" align="right">
          <template #default="{ row }">¥{{ row.pendingAmount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="dueDate" label="到期日期" width="110">
          <template #default="{ row }">
            <span :class="{ overdue: isOverdue(row) }">{{ row.dueDate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="overdueDays" label="逾期天数" width="90">
          <template #default="{ row }">
            <span v-if="isOverdue(row)" class="overdue-days">{{ row.overdueDays }}天</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click.stop="handleView(row)">详情</el-button>
            <el-dropdown trigger="hover" @command="(cmd: string) => handleCommand(cmd, row)">
              <el-button type="primary" link size="small">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="confirm" v-if="row.status === 'pending'">确认应付</el-dropdown-item>
                  <el-dropdown-item command="payment">付款登记</el-dropdown-item>
                  <el-dropdown-item command="writeoff">核销</el-dropdown-item>
                  <el-dropdown-item command="edit" v-if="row.status === 'pending'">编辑</el-dropdown-item>
                  <el-dropdown-item command="print">打印</el-dropdown-item>
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
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="showDetailDrawer"
      title="应付单详情"
      size="700px"
    >
      <template #default>
        <div class="detail-content" v-if="currentRow">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="应付单号">{{ currentRow.payableNo }}</el-descriptions-item>
            <el-descriptions-item label="供应商名称">{{ currentRow.supplierName }}</el-descriptions-item>
            <el-descriptions-item label="关联订单">{{ currentRow.orderNo || '-' }}</el-descriptions-item>
            <el-descriptions-item label="关联发票">{{ currentRow.invoiceNo || '-' }}</el-descriptions-item>
            <el-descriptions-item label="应付金额">¥{{ currentRow.amount.toLocaleString() }}</el-descriptions-item>
            <el-descriptions-item label="已付金额">¥{{ currentRow.paidAmount.toLocaleString() }}</el-descriptions-item>
            <el-descriptions-item label="待付金额">¥{{ currentRow.pendingAmount.toLocaleString() }}</el-descriptions-item>
            <el-descriptions-item label="到期日期">{{ currentRow.dueDate }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(currentRow.status)" size="small">
                {{ getStatusText(currentRow.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="逾期天数" v-if="isOverdue(currentRow)">
              {{ currentRow.overdueDays }}天
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentRow.createTime }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ currentRow.remark || '-' }}</el-descriptions-item>
          </el-descriptions>

          <!-- 付款记录 -->
          <div class="section-title">付款记录</div>
          <el-table :data="currentRow.paymentRecords || []" border size="small">
            <el-table-column prop="paymentNo" label="付款单号" width="160" />
            <el-table-column prop="paymentAmount" label="付款金额" width="120" align="right">
              <template #default="{ row }">¥{{ row.paymentAmount.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column prop="paymentDate" label="付款日期" width="120" />
            <el-table-column prop="paymentMethod" label="付款方式" width="120">
              <template #default="{ row }">
                {{ getPaymentMethodText(row.paymentMethod) }}
              </template>
            </el-table-column>
            <el-table-column prop="bankAccount" label="付款账户" />
            <el-table-column prop="remark" label="备注" />
          </el-table>
          <el-empty v-if="!currentRow.paymentRecords?.length" description="暂无付款记录" />

          <!-- 核销记录 -->
          <div class="section-title">核销记录</div>
          <el-table :data="currentRow.writeoffRecords || []" border size="small">
            <el-table-column prop="writeoffNo" label="核销单号" width="160" />
            <el-table-column prop="writeoffAmount" label="核销金额" width="120" align="right">
              <template #default="{ row }">¥{{ row.writeoffAmount.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column prop="writeoffDate" label="核销日期" width="120" />
            <el-table-column prop="writeoffType" label="核销类型" width="120">
              <template #default="{ row }">{{ row.writeoffType }}</template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" />
          </el-table>
          <el-empty v-if="!currentRow.writeoffRecords?.length" description="暂无核销记录" />
        </div>
      </template>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="showDetailDrawer = false">关闭</el-button>
          <el-button type="primary" @click="handleEdit(currentRow)">编辑</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 付款登记对话框 -->
    <el-dialog v-model="showPaymentDialog" title="付款登记" width="500px">
      <el-form ref="paymentFormRef" :model="paymentForm" :rules="paymentRules" label-width="100px">
        <el-form-item label="应付单号">
          <el-input v-model="paymentForm.payableNo" disabled />
        </el-form-item>
        <el-form-item label="待付金额">
          <el-input :value="'¥' + paymentForm.pendingAmount.toLocaleString()" disabled />
        </el-form-item>
        <el-form-item label="付款金额" prop="paymentAmount">
          <el-input-number
            v-model="paymentForm.paymentAmount"
            :min="0.01"
            :max="paymentForm.pendingAmount"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="付款日期" prop="paymentDate">
          <el-date-picker
            v-model="paymentForm.paymentDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="付款方式" prop="paymentMethod">
          <el-select v-model="paymentForm.paymentMethod" placeholder="请选择" style="width: 100%">
            <el-option label="银行转账" value="bank" />
            <el-option label="承兑汇票" value="acceptance" />
            <el-option label="商业汇票" value="trade_bill" />
            <el-option label="现金" value="cash" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="付款账户" prop="bankAccount">
          <el-select v-model="paymentForm.bankAccount" placeholder="请选择" style="width: 100%">
            <el-option label="基本户-中国银行" value="boc" />
            <el-option label="一般户-工商银行" value="icbc" />
            <el-option label="一般户-建设银行" value="ccb" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="paymentForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPaymentDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitPayment">确认付款</el-button>
      </template>
    </el-dialog>

    <!-- 核销对话框 -->
    <el-dialog v-model="showWriteoffDialog" title="应付核销" width="500px">
      <el-form ref="writeoffFormRef" :model="writeoffForm" :rules="writeoffRules" label-width="100px">
        <el-form-item label="应付单号">
          <el-input v-model="writeoffForm.payableNo" disabled />
        </el-form-item>
        <el-form-item label="待核销金额">
          <el-input :value="'¥' + writeoffForm.pendingAmount.toLocaleString()" disabled />
        </el-form-item>
        <el-form-item label="核销金额" prop="writeoffAmount">
          <el-input-number
            v-model="writeoffForm.writeoffAmount"
            :min="0.01"
            :max="writeoffForm.pendingAmount"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="核销日期" prop="writeoffDate">
          <el-date-picker
            v-model="writeoffForm.writeoffDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="核销类型" prop="writeoffType">
          <el-select v-model="writeoffForm.writeoffType" placeholder="请选择" style="width: 100%">
            <el-option label="预付款核销" value="advance" />
            <el-option label="应付冲抵" value="offset" />
            <el-option label="其他核销" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="writeoffForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showWriteoffDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitWriteoff">确认核销</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Download, Money, Clock, Warning, CircleCheck, ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()

// 统计卡片数据
const statistics = reactive({
  totalAmount: 6234800,
  paidAmount: 3850000,
  pendingAmount: 2384800,
  overdueAmount: 654200
})

// 供应商列表
const supplierList = ref([
  { id: 1, name: '深圳硬件供应商A公司' },
  { id: 2, name: '北京云服务B公司' },
  { id: 3, name: '上海网络设备C公司' },
  { id: 4, name: '广州物流服务D公司' },
  { id: 5, name: '杭州软件服务E公司' }
])

// 搜索表单
const searchForm = reactive({
  supplierId: '',
  orderNo: '',
  status: '',
  dateRange: [],
  overdueStatus: ''
})

// 表格数据
const tableData = ref([
  {
    payableNo: 'YF2024040001',
    supplierName: '深圳硬件供应商A公司',
    supplierId: 1,
    orderId: 'DD2024040010',
    orderNo: 'DD2024040010',
    invoiceId: 1,
    invoiceNo: 'FP2024040010',
    amount: 300000,
    paidAmount: 200000,
    pendingAmount: 100000,
    dueDate: '2024-05-20',
    status: 'partial',
    overdueDays: 0,
    createTime: '2024-04-05 10:30:00',
    remark: ''
  },
  {
    payableNo: 'YF2024040002',
    supplierName: '北京云服务B公司',
    supplierId: 2,
    orderId: 'DD2024040011',
    orderNo: 'DD2024040011',
    invoiceId: 2,
    invoiceNo: 'FP2024040011',
    amount: 500000,
    paidAmount: 500000,
    pendingAmount: 0,
    dueDate: '2024-04-25',
    status: 'written_off',
    overdueDays: 0,
    createTime: '2024-04-10 14:20:00',
    remark: ''
  },
  {
    payableNo: 'YF2024040003',
    supplierName: '上海网络设备C公司',
    supplierId: 3,
    orderId: 'DD2024040012',
    orderNo: 'DD2024040012',
    invoiceId: null,
    invoiceNo: '',
    amount: 180000,
    paidAmount: 0,
    pendingAmount: 180000,
    dueDate: '2024-03-20',
    status: 'overdue',
    overdueDays: 36,
    createTime: '2024-03-05 09:00:00',
    remark: ''
  },
  {
    payableNo: 'YF2024040004',
    supplierName: '广州物流服务D公司',
    supplierId: 4,
    orderId: 'DD2024040013',
    orderNo: 'DD2024040013',
    invoiceId: 4,
    invoiceNo: 'FP2024040013',
    amount: 80000,
    paidAmount: 0,
    pendingAmount: 80000,
    dueDate: '2024-06-15',
    status: 'confirmed',
    overdueDays: 0,
    createTime: '2024-04-15 16:45:00',
    remark: ''
  },
  {
    payableNo: 'YF2024040005',
    supplierName: '杭州软件服务E公司',
    supplierId: 5,
    orderId: 'DD2024040014',
    orderNo: 'DD2024040014',
    invoiceId: 5,
    invoiceNo: 'FP2024040014',
    amount: 250000,
    paidAmount: 0,
    pendingAmount: 250000,
    dueDate: '2024-03-10',
    status: 'overdue',
    overdueDays: 46,
    createTime: '2024-02-25 11:20:00',
    remark: ''
  }
])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 5
})

// 选中行
const selectedRows = ref<any[]>([])
const isAllSelected = computed({
  get: () => tableData.value.length > 0 && selectedRows.value.length === tableData.value.length,
  set: (val: boolean) => val ? selectedRows.value = [...tableData.value] : selectedRows.value = []
})

// 详情抽屉
const showDetailDrawer = ref(false)
const currentRow = ref<any>(null)

// 付款登记对话框
const showPaymentDialog = ref(false)
const paymentFormRef = ref<FormInstance>()
const paymentForm = reactive({
  payableNo: '',
  pendingAmount: 0,
  paymentAmount: 0,
  paymentDate: '',
  paymentMethod: '',
  bankAccount: '',
  remark: ''
})
const paymentRules: FormRules = {
  paymentAmount: [{ required: true, message: '请输入付款金额', trigger: 'blur' }],
  paymentDate: [{ required: true, message: '请选择付款日期', trigger: 'change' }],
  paymentMethod: [{ required: true, message: '请选择付款方式', trigger: 'change' }],
  bankAccount: [{ required: true, message: '请选择付款账户', trigger: 'change' }]
}

// 核销对话框
const showWriteoffDialog = ref(false)
const writeoffFormRef = ref<FormInstance>()
const writeoffForm = reactive({
  payableNo: '',
  pendingAmount: 0,
  writeoffAmount: 0,
  writeoffDate: '',
  writeoffType: '',
  remark: ''
})
const writeoffRules: FormRules = {
  writeoffAmount: [{ required: true, message: '请输入核销金额', trigger: 'blur' }],
  writeoffDate: [{ required: true, message: '请选择核销日期', trigger: 'change' }],
  writeoffType: [{ required: true, message: '请选择核销类型', trigger: 'change' }]
}

// 方法
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'info',
    confirmed: 'success',
    partial: 'warning',
    written_off: 'success',
    partial_writeoff: 'warning',
    overdue: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    partial: '部分付款',
    written_off: '已核销',
    partial_writeoff: '部分核销',
    overdue: '已逾期'
  }
  return texts[status] || status
}

const getPaymentMethodText = (method: string) => {
  const texts: Record<string, string> = {
    bank: '银行转账',
    acceptance: '承兑汇票',
    trade_bill: '商业汇票',
    cash: '现金',
    other: '其他'
  }
  return texts[method] || method
}

const isOverdue = (row: any) => {
  if (!row.dueDate) return false
  const today = new Date()
  const dueDate = new Date(row.dueDate)
  return today > dueDate && row.pendingAmount > 0
}

const handleSearch = () => {
  ElMessage.success('搜索应付单')
  pagination.page = 1
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    if (Array.isArray(searchForm[key as keyof typeof searchForm])) {
      ;(searchForm as any)[key] = []
    } else {
      ;(searchForm as any)[key] = ''
    }
  })
  ElMessage.info('已重置搜索条件')
}

const handleCreate = () => {
  router.push('/payable/create')
}

const handleExport = () => {
  ElMessage.success('导出应付单')
}

const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows
}

const handleRowClick = (row: any) => {
  currentRow.value = row
}

const handleView = (row: any) => {
  currentRow.value = row
  showDetailDrawer.value = true
}

const handleViewOrder = (orderId: string) => {
  router.push(`/order/detail/${orderId}`)
}

const handleViewInvoice = (invoiceId: number) => {
  router.push(`/invoice/detail/${invoiceId}`)
}

const handleEdit = (row: any) => {
  router.push(`/payable/edit/${row.payableNo}`)
}

const handleCommand = (command: string, row: any) => {
  currentRow.value = row
  switch (command) {
    case 'confirm':
      handleConfirm(row)
      break
    case 'payment':
      handleOpenPayment(row)
      break
    case 'writeoff':
      handleOpenWriteoff(row)
      break
    case 'edit':
      handleEdit(row)
      break
    case 'print':
      handlePrint(row)
      break
  }
}

const handleConfirm = (row: any) => {
  ElMessageBox.confirm(`确认应付单 ${row.payableNo} 吗？`, '确认应付', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('确认成功')
  }).catch(() => {})
}

const handleOpenPayment = (row: any) => {
  Object.assign(paymentForm, {
    payableNo: row.payableNo,
    pendingAmount: row.pendingAmount,
    paymentAmount: row.pendingAmount,
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMethod: '',
    bankAccount: '',
    remark: ''
  })
  showPaymentDialog.value = true
}

const handleSubmitPayment = async () => {
  if (!paymentFormRef.value) return
  await paymentFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('付款登记成功')
      showPaymentDialog.value = false
    }
  })
}

const handleOpenWriteoff = (row: any) => {
  Object.assign(writeoffForm, {
    payableNo: row.payableNo,
    pendingAmount: row.pendingAmount,
    writeoffAmount: row.pendingAmount,
    writeoffDate: new Date().toISOString().slice(0, 10),
    writeoffType: '',
    remark: ''
  })
  showWriteoffDialog.value = true
}

const handleSubmitWriteoff = async () => {
  if (!writeoffFormRef.value) return
  await writeoffFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('核销成功')
      showWriteoffDialog.value = false
    }
  })
}

const handlePrint = (row: any) => {
  ElMessage.info('打印应付单')
}

const handleBatchConfirm = () => {
  ElMessageBox.confirm(`确认选中的 ${selectedRows.value.length} 条应付单吗？`, '批量确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量确认成功')
  }).catch(() => {})
}

const handleBatchPayment = () => {
  if (selectedRows.value.length === 1) {
    handleOpenPayment(selectedRows.value[0])
  } else {
    ElMessage.info('请选择一条记录进行付款')
  }
}

const handleBatchWriteoff = () => {
  if (selectedRows.value.length === 1) {
    handleOpenWriteoff(selectedRows.value[0])
  } else {
    ElMessage.info('请选择一条记录进行核销')
  }
}

const handleSelectAll = (val: boolean) => {
  selectedRows.value = val ? [...tableData.value] : []
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.page = 1
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
}
</script>

<style scoped>
.payable-list-container {
  padding: 0;
  background: #f5f7fa;
  min-height: 100%;
}

.action-header {
  background: #fff;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left .page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  gap: 12px;
}

.statistics-cards {
  padding: 16px 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-icon.total {
  background: #ecf5ff;
  color: #409eff;
}

.stat-icon.paid {
  background: #f0f9eb;
  color: #67c23a;
}

.stat-icon.pending {
  background: #fdf6ec;
  color: #e6a23c;
}

.stat-icon.overdue {
  background: #fef0f0;
  color: #f56c6c;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.search-panel {
  background: #fff;
  margin: 0 20px;
  padding: 20px;
  border-radius: 8px;
}

.action-bar {
  background: #fff;
  margin: 16px 20px;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-count {
  font-size: 14px;
  color: #606266;
}

.action-right {
  display: flex;
  gap: 8px;
}

.table-container {
  background: #fff;
  margin: 0 20px;
  padding: 20px;
  border-radius: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.detail-content {
  padding: 0 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 24px 0 12px;
  padding-left: 12px;
  border-left: 4px solid #409eff;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.overdue {
  color: #f56c6c;
}

.overdue-days {
  color: #f56c6c;
  font-weight: 500;
}
</style>
