<template>
  <div class="collection-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <span class="page-title">收款管理</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新增收款单
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
              <div class="stat-value">¥{{ statistics.totalCollection.toLocaleString() }}</div>
              <div class="stat-label">收款总额</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon confirmed"><el-icon><CircleCheck /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">¥{{ statistics.confirmed.toLocaleString() }}</div>
              <div class="stat-label">已确认收款</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon pending"><el-icon><Clock /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">¥{{ statistics.pendingConfirm.toLocaleString() }}</div>
              <div class="stat-label">待确认</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon rejected"><el-icon><CloseBold /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">¥{{ statistics.rejected.toLocaleString() }}</div>
              <div class="stat-label">已驳回</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-panel">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="客户">
          <el-select
            v-model="searchForm.customerId"
            placeholder="请选择客户"
            clearable
            filterable
            style="width: 200px"
          >
            <el-option
              v-for="customer in customerList"
              :key="customer.id"
              :label="customer.name"
              :value="customer.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="收款单号">
          <el-input
            v-model="searchForm.collectionNo"
            placeholder="请输入收款单号"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 140px">
            <el-option label="待确认" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="收款日期">
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
        <el-form-item label="收款方式">
          <el-select v-model="searchForm.paymentMethod" placeholder="请选择" clearable style="width: 140px">
            <el-option label="银行转账" value="bank" />
            <el-option label="承兑汇票" value="acceptance" />
            <el-option label="商业汇票" value="trade_bill" />
            <el-option label="现金" value="cash" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table
        ref="tableRef"
        :data="tableData"
        border
        stripe
        @row-click="handleRowClick"
      >
        <el-table-column prop="collectionNo" label="收款单号" width="160" fixed />
        <el-table-column prop="customerName" label="客户名称" min-width="160" />
        <el-table-column prop="receivableNo" label="关联应收单" width="160">
          <template #default="{ row }">
            <el-link type="primary" @click.prevent="handleViewReceivable(row.receivableId)">
              {{ row.receivableNo }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="collectionAmount" label="收款金额" width="120" align="right">
          <template #default="{ row }">¥{{ row.collectionAmount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="actualAmount" label="实际到账" width="120" align="right">
          <template #default="{ row }">¥{{ row.actualAmount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="collectionDate" label="收款日期" width="110" />
        <el-table-column prop="paymentMethod" label="收款方式" width="100">
          <template #default="{ row }">
            {{ getPaymentMethodText(row.paymentMethod) }}
          </template>
        </el-table-column>
        <el-table-column prop="bankAccount" label="收款账户" min-width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="confirmTime" label="确认时间" width="160" />
        <el-table-column prop="remark" label="备注" min-width="150" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click.stop="handleView(row)">详情</el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="primary"
              link
              size="small"
              @click.stop="handleConfirm(row)"
            >
              确认
            </el-button>
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
      title="收款单详情"
      size="600px"
    >
      <template #default>
        <div class="detail-content" v-if="currentRow">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="收款单号">{{ currentRow.collectionNo }}</el-descriptions-item>
            <el-descriptions-item label="客户名称">{{ currentRow.customerName }}</el-descriptions-item>
            <el-descriptions-item label="关联应收单">{{ currentRow.receivableNo }}</el-descriptions-item>
            <el-descriptions-item label="收款金额">¥{{ currentRow.collectionAmount.toLocaleString() }}</el-descriptions-item>
            <el-descriptions-item label="实际到账金额">¥{{ currentRow.actualAmount.toLocaleString() }}</el-descriptions-item>
            <el-descriptions-item label="收款日期">{{ currentRow.collectionDate }}</el-descriptions-item>
            <el-descriptions-item label="收款方式">
              {{ getPaymentMethodText(currentRow.paymentMethod) }}
            </el-descriptions-item>
            <el-descriptions-item label="收款账户">{{ currentRow.bankAccount }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(currentRow.status)" size="small">
                {{ getStatusText(currentRow.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="确认时间">{{ currentRow.confirmTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ currentRow.remark || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </template>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="showDetailDrawer = false">关闭</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 新增收款对话框 -->
    <el-dialog v-model="showCreateDialog" title="新增收款单" width="600px">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <el-form-item label="客户" prop="customerId">
          <el-select
            v-model="createForm.customerId"
            placeholder="请选择客户"
            filterable
            style="width: 100%"
            @change="handleCustomerChange"
          >
            <el-option
              v-for="customer in customerList"
              :key="customer.id"
              :label="customer.name"
              :value="customer.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关联应收单" prop="receivableId">
          <el-select
            v-model="createForm.receivableId"
            placeholder="请选择应收单"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="receivable in receivableList"
              :key="receivable.id"
              :label="`${receivable.receivableNo} - ¥${receivable.pendingAmount.toLocaleString()}`"
              :value="receivable.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="收款金额" prop="collectionAmount">
          <el-input-number
            v-model="createForm.collectionAmount"
            :min="0.01"
            :precision="2"
            :controls="false"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="实际到账">
          <el-input-number
            v-model="createForm.actualAmount"
            :min="0"
            :precision="2"
            :controls="false"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="收款日期" prop="collectionDate">
          <el-date-picker
            v-model="createForm.collectionDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="收款方式" prop="paymentMethod">
          <el-select v-model="createForm.paymentMethod" placeholder="请选择" style="width: 100%">
            <el-option label="银行转账" value="bank" />
            <el-option label="承兑汇票" value="acceptance" />
            <el-option label="商业汇票" value="trade_bill" />
            <el-option label="现金" value="cash" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="收款账户" prop="bankAccount">
          <el-select v-model="createForm.bankAccount" placeholder="请选择" style="width: 100%">
            <el-option label="基本户-中国银行" value="boc" />
            <el-option label="一般户-工商银行" value="icbc" />
            <el-option label="一般户-建设银行" value="ccb" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="createForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitCreate">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Download, Money, Clock, CircleCheck, CloseBold } from '@element-plus/icons-vue'

const router = useRouter()

// 统计卡片数据
const statistics = reactive({
  totalCollection: 5231800,
  confirmed: 4800000,
  pendingConfirm: 431800,
  rejected: 0
})

// 客户列表
const customerList = ref([
  { id: 1, name: '深圳市腾讯科技有限公司' },
  { id: 2, name: '阿里巴巴（中国）有限公司' },
  { id: 3, name: '字节跳动科技有限公司' },
  { id: 4, name: '华为技术有限公司' },
  { id: 5, name: '京东集团股份有限公司' }
])

// 搜索表单
const searchForm = reactive({
  customerId: '',
  collectionNo: '',
  status: '',
  dateRange: [],
  paymentMethod: ''
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    collectionNo: 'SK2024040001',
    customerId: 1,
    customerName: '深圳市腾讯科技有限公司',
    receivableId: 1,
    receivableNo: 'YS2024040001',
    collectionAmount: 200000,
    actualAmount: 200000,
    collectionDate: '2024-04-15',
    paymentMethod: 'bank',
    bankAccount: '基本户-中国银行',
    status: 'confirmed',
    confirmTime: '2024-04-15 14:30:00',
    remark: ''
  },
  {
    id: 2,
    collectionNo: 'SK2024040002',
    customerId: 2,
    customerName: '阿里巴巴（中国）有限公司',
    receivableId: 2,
    receivableNo: 'YS2024040002',
    collectionAmount: 800000,
    actualAmount: 800000,
    collectionDate: '2024-04-18',
    paymentMethod: 'bank',
    bankAccount: '基本户-中国银行',
    status: 'confirmed',
    confirmTime: '2024-04-18 10:00:00',
    remark: ''
  },
  {
    id: 3,
    collectionNo: 'SK2024040003',
    customerId: 3,
    customerName: '字节跳动科技有限公司',
    receivableId: 3,
    receivableNo: 'YS2024040003',
    collectionAmount: 350000,
    actualAmount: 345000,
    collectionDate: '2024-04-20',
    paymentMethod: 'bank',
    bankAccount: '一般户-工商银行',
    status: 'pending',
    confirmTime: '',
    remark: '扣除手续费5000元'
  }
])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 3
})

// 详情抽屉
const showDetailDrawer = ref(false)
const currentRow = ref<any>(null)

// 新增对话框
const showCreateDialog = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  customerId: '',
  customerName: '',
  receivableId: '',
  receivableNo: '',
  collectionAmount: 0,
  actualAmount: 0,
  collectionDate: '',
  paymentMethod: '',
  bankAccount: '',
  remark: ''
})
const createRules: FormRules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  receivableId: [{ required: true, message: '请选择应收单', trigger: 'change' }],
  collectionAmount: [{ required: true, message: '请输入收款金额', trigger: 'blur' }],
  collectionDate: [{ required: true, message: '请选择收款日期', trigger: 'change' }],
  paymentMethod: [{ required: true, message: '请选择收款方式', trigger: 'change' }],
  bankAccount: [{ required: true, message: '请选择收款账户', trigger: 'change' }]
}

// 应收单列表
const receivableList = ref([
  { id: 1, receivableNo: 'YS2024040001', pendingAmount: 200000 },
  { id: 2, receivableNo: 'YS2024040002', pendingAmount: 0 },
  { id: 3, receivableNo: 'YS2024040003', pendingAmount: 350000 }
])

// 方法
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    confirmed: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    rejected: '已驳回'
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

const handleSearch = () => {
  ElMessage.success('搜索收款记录')
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
  Object.assign(createForm, {
    customerId: '',
    customerName: '',
    receivableId: '',
    receivableNo: '',
    collectionAmount: 0,
    actualAmount: 0,
    collectionDate: new Date().toISOString().slice(0, 10),
    paymentMethod: '',
    bankAccount: '',
    remark: ''
  })
  showCreateDialog.value = true
}

const handleExport = () => {
  ElMessage.success('导出收款记录')
}

const handleRowClick = (row: any) => {
  currentRow.value = row
}

const handleView = (row: any) => {
  currentRow.value = row
  showDetailDrawer.value = true
}

const handleViewReceivable = (receivableId: number) => {
  router.push(`/receivable/detail/${receivableId}`)
}

const handleConfirm = (row: any) => {
  currentRow.value = row
  ElMessageBox.confirm(`确认收款单 ${row.collectionNo} 吗？`, '确认收款', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('确认成功')
  }).catch(() => {})
}

const handleCustomerChange = (customerId: number) => {
  const customer = customerList.value.find(c => c.id === customerId)
  if (customer) {
    createForm.customerName = customer.name
  }
}

const handleSubmitCreate = async () => {
  if (!createFormRef.value) return
  await createFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('新增收款单成功')
      showCreateDialog.value = false
    }
  })
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
.collection-container {
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

.stat-icon.confirmed {
  background: #f0f9eb;
  color: #67c23a;
}

.stat-icon.pending {
  background: #fdf6ec;
  color: #e6a23c;
}

.stat-icon.rejected {
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

.table-container {
  background: #fff;
  margin: 16px 20px;
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

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
