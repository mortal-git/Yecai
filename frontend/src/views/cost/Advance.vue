<template>
  <div class="advance-container">
    <!-- 搜索筛选区域 -->
    <div class="search-panel">
      <el-form :model="searchForm" :inline="true" label-width="100px">
        <el-form-item label="申请人">
          <el-input v-model="searchForm.applicantName" placeholder="请输入申请人姓名" clearable />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="searchForm.departmentId" placeholder="请选择" clearable>
            <el-option label="销售一部" value="1" />
            <el-option label="销售二部" value="2" />
            <el-option label="技术部" value="3" />
            <el-option label="行政部" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="草稿" value="draft" />
            <el-option label="待审核" value="pending" />
            <el-option label="已审核" value="approved" />
            <el-option label="已付款" value="paid" />
            <el-option label="已驳回" value="rejected" />
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
        <el-form-item label="金额范围">
          <el-input-number v-model="searchForm.minAmount" placeholder="最小值" :min="0" style="width: 120px" />
          <span style="margin: 0 8px">-</span>
          <el-input-number v-model="searchForm.maxAmount" placeholder="最大值" :min="0" style="width: 120px" />
        </el-form-item>
        <el-form-item label="关联订单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
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
        新增垫付申请
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出
      </el-button>
      <el-button @click="handleRefresh">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6">
        <div class="stats-card">
          <div class="stats-label">待我审核</div>
          <div class="stats-value">{{ stats.pendingMyApprovalCount }} 笔</div>
          <div class="stats-amount">¥{{ formatMoney(stats.pendingMyApprovalAmount) }}</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stats-card">
          <div class="stats-label">待财务审核</div>
          <div class="stats-value">{{ stats.pendingFinanceApprovalCount }} 笔</div>
          <div class="stats-amount">¥{{ formatMoney(stats.pendingFinanceApprovalAmount) }}</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stats-card">
          <div class="stats-label">待付款</div>
          <div class="stats-value">{{ stats.pendingPaymentCount }} 笔</div>
          <div class="stats-amount">¥{{ formatMoney(stats.pendingPaymentAmount) }}</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stats-card">
          <div class="stats-label">我的申请</div>
          <div class="stats-value">{{ stats.myApplicationCount }} 笔</div>
          <div class="stats-amount">¥{{ formatMoney(stats.myApplicationAmount) }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- 表格区域 -->
    <div class="table-container">
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="advanceNo" label="垫付单号" min-width="160" sortable />
        <el-table-column prop="applicantName" label="申请人" width="100" />
        <el-table-column prop="departmentName" label="所属部门" width="120" />
        <el-table-column prop="costType" label="费用类型" width="120" />
        <el-table-column prop="costReason" label="费用事由" min-width="200" />
        <el-table-column prop="orderNo" label="关联订单号" min-width="160" />
        <el-table-column prop="advanceAmount" label="垫付金额" width="140" align="right" :formatter="formatMoney" />
        <el-table-column prop="status" label="状态" width="120" :formatter="formatStatus" />
        <el-table-column prop="applyDate" label="申请日期" width="120" />
        <el-table-column prop="paymentDate" label="付款日期" width="120" />
        <el-table-column prop="paymentAccount" label="收款账户" min-width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" link @click="handleView(scope.row)">查看</el-button>
            <el-button type="success" size="small" link @click="handleEdit(scope.row)" :disabled="!['draft', 'rejected'].includes(scope.row.status) || scope.row.applicantId !== currentUserId">编辑</el-button>
            <el-button type="warning" size="small" link @click="handleSubmit(scope.row)" :disabled="scope.row.status !== 'draft' || scope.row.applicantId !== currentUserId">提交审核</el-button>
            <el-dropdown @command="(command) => handleMoreAction(command, scope.row)">
              <template #default>
                <el-button type="info" size="small" link>更多</el-button>
              </template>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="cancel" :disabled="!['pending'].includes(scope.row.status) || scope.row.applicantId !== currentUserId">作废</el-dropdown-item>
                  <el-dropdown-item command="approve" :disabled="scope.row.status !== 'pending' || !canApprove(scope.row)">审核</el-dropdown-item>
                  <el-dropdown-item command="payment" :disabled="scope.row.status !== 'approved'">付款登记</el-dropdown-item>
                  <el-dropdown-item command="print">打印</el-dropdown-item>
                  <el-dropdown-item command="log">操作日志</el-dropdown-item>
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
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { ElTag } from 'element-plus'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Download } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const currentUserId = ref('1') // 当前登录用户ID

// 搜索表单
const searchForm = reactive({
  applicantName: '',
  departmentId: '',
  status: '',
  dateRange: [] as string[],
  minAmount: undefined as number | undefined,
  maxAmount: undefined as number | undefined,
  orderNo: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 统计数据
const stats = reactive({
  pendingMyApprovalCount: 2,
  pendingMyApprovalAmount: 3200.00,
  pendingFinanceApprovalCount: 5,
  pendingFinanceApprovalAmount: 12500.00,
  pendingPaymentCount: 3,
  pendingPaymentAmount: 8600.00,
  myApplicationCount: 8,
  myApplicationAmount: 15600.00
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    advanceNo: 'DF2024030001',
    applicantId: '1',
    applicantName: '张三',
    departmentName: '技术部',
    costType: '差旅费',
    costReason: '去上海出差3天的机票和酒店费用',
    orderNo: 'SO202402150008',
    advanceAmount: 2800.00,
    status: 'pending',
    applyDate: '2024-03-10',
    paymentDate: '',
    paymentAccount: '招商银行 6214831234567890'
  },
  {
    id: 2,
    advanceNo: 'DF2024030002',
    applicantId: '2',
    applicantName: '李四',
    departmentName: '销售一部',
    costType: '招待费',
    costReason: '客户招待餐费',
    orderNo: 'SO202403010012',
    advanceAmount: 1560.00,
    status: 'approved',
    applyDate: '2024-03-12',
    paymentDate: '',
    paymentAccount: '工商银行 6222081234567890'
  },
  {
    id: 3,
    advanceNo: 'DF2024030003',
    applicantId: '1',
    applicantName: '张三',
    departmentName: '技术部',
    costType: '办公费',
    costReason: '购买开发用的软件license',
    orderNo: '',
    advanceAmount: 860.00,
    status: 'paid',
    applyDate: '2024-03-05',
    paymentDate: '2024-03-08',
    paymentAccount: '招商银行 6214831234567890'
  },
  {
    id: 4,
    advanceNo: 'DF2024030004',
    applicantId: '3',
    applicantName: '王五',
    departmentName: '销售二部',
    costType: '交通费',
    costReason: '3月打车费报销',
    orderNo: '',
    advanceAmount: 450.00,
    status: 'draft',
    applyDate: '2024-03-15',
    paymentDate: '',
    paymentAccount: '建设银行 6217001234567890'
  },
  {
    id: 5,
    advanceNo: 'DF2024030005',
    applicantId: '4',
    applicantName: '赵六',
    departmentName: '行政部',
    costType: '办公费',
    costReason: '购买办公用品',
    orderNo: '',
    advanceAmount: 680.00,
    status: 'rejected',
    applyDate: '2024-03-08',
    paymentDate: '',
    paymentAccount: '农业银行 6228481234567890'
  }
])

pagination.total = tableData.value.length

// 格式化状态
const formatStatus = (row: any) => {
  const statusMap: Record<string, { label: string, type: string }> = {
    'draft': { label: '草稿', type: 'info' },
    'pending': { label: '待审核', type: 'warning' },
    'approved': { label: '已审核', type: 'primary' },
    'paid': { label: '已付款', type: 'success' },
    'rejected': { label: '已驳回', type: 'danger' },
    'cancelled': { label: '已作废', type: 'info' }
  }
  const status = statusMap[row.status] || { label: row.status, type: 'info' }
  return h(ElTag, { type: status.type as any }, () => status.label)
}

// 格式化金额
const formatMoney = (value: number) => {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

// 判断是否可以审核
const canApprove = (row: any) => {
  // 这里根据实际权限逻辑判断
  return true
}

// 搜索
const handleSearch = () => {
  loading.value = true
  // 模拟搜索请求
  setTimeout(() => {
    loading.value = false
    ElMessage.success('搜索完成')
  }, 500)
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    applicantName: '',
    departmentId: '',
    status: '',
    dateRange: [],
    minAmount: undefined,
    maxAmount: undefined,
    orderNo: ''
  })
  handleSearch()
}

// 新增
const handleCreate = () => {
  router.push('/payable/advance/create')
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

// 刷新
const handleRefresh = () => {
  handleSearch()
}

// 分页变化
const handlePageChange = () => {
  handleSearch()
}

// 行点击
const handleRowClick = (row: any) => {
  handleView(row)
}

// 查看详情
const handleView = (row: any) => {
  ElMessage.info('详情功能开发中')
  // router.push(`/cost/advance/detail/${row.id}`)
}

// 编辑
const handleEdit = (row: any) => {
  router.push(`/payable/advance/edit/${row.id}`)
}

// 提交审核
const handleSubmit = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '确定要提交该垫付申请审核吗？提交后将进入审核流程。',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    // 模拟提交请求
    loading.value = true
    setTimeout(() => {
      loading.value = false
      row.status = 'pending'
      ElMessage.success('提交成功，等待审核')
    }, 500)
  } catch {
    // 用户取消
  }
}

// 更多操作
const handleMoreAction = (command: string, row: any) => {
  switch (command) {
    case 'cancel':
      handleCancel(row)
      break
    case 'approve':
      ElMessage.info('审核功能开发中')
      break
    case 'payment':
      ElMessage.info('付款登记功能开发中')
      break
    case 'print':
      window.print()
      break
    case 'log':
      ElMessage.info('操作日志功能开发中')
      break
  }
}

// 作废
const handleCancel = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '确定要作废该垫付申请吗？作废后不可恢复。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    // 模拟作废请求
    loading.value = true
    setTimeout(() => {
      loading.value = false
      row.status = 'cancelled'
      ElMessage.success('作废成功')
    }, 500)
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.advance-container {
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

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stats-label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 8px;
}

.stats-value {
  color: #409eff;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
}

.stats-amount {
  color: #606266;
  font-size: 12px;
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
</style>
