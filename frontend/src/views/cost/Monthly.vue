<template>
  <div class="monthly-cost-container">
    <!-- 搜索筛选区域 -->
    <div class="search-panel">
      <el-form :model="searchForm" :inline="true" label-width="100px">
        <el-form-item label="结算月份">
          <el-date-picker
            v-model="searchForm.settleMonth"
            type="month"
            placeholder="选择月份"
            value-format="YYYY-MM"
          />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="searchForm.supplierName" placeholder="请输入供应商名称" clearable />
        </el-form-item>
        <el-form-item label="关联订单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="searchForm.auditStatus" placeholder="请选择" clearable>
            <el-option label="草稿" value="draft" />
            <el-option label="待审核" value="pending" />
            <el-option label="审核通过" value="approved" />
            <el-option label="审核驳回" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="付款状态">
          <el-select v-model="searchForm.paymentStatus" placeholder="请选择" clearable>
            <el-option label="未付款" value="unpaid" />
            <el-option label="部分付款" value="partial" />
            <el-option label="已付款" value="paid" />
          </el-select>
        </el-form-item>
        <el-form-item label="成本金额">
          <el-input-number v-model="searchForm.minAmount" placeholder="最小值" :min="0" style="width: 120px" />
          <span style="margin: 0 8px">-</span>
          <el-input-number v-model="searchForm.maxAmount" placeholder="最大值" :min="0" style="width: 120px" />
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
        新增月结成本
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
        <el-table-column prop="costNo" label="成本单号" min-width="160" sortable />
        <el-table-column prop="settleMonth" label="结算月份" width="120" />
        <el-table-column prop="supplierName" label="供应商名称" min-width="180" />
        <el-table-column prop="billNo" label="供应商账单号" min-width="160" />
        <el-table-column prop="billDate" label="账单日期" width="120" />
        <el-table-column prop="orderCount" label="关联订单数" width="110" align="center" />
        <el-table-column prop="costAmount" label="成本总额" width="130" align="right" :formatter="formatMoney" />
        <el-table-column prop="paidAmount" label="已付金额" width="130" align="right" :formatter="formatMoney" />
        <el-table-column prop="unpaidAmount" label="未付金额" width="130" align="right" :formatter="formatMoney" />
        <el-table-column prop="auditStatus" label="审核状态" width="110" :formatter="formatAuditStatus" />
        <el-table-column prop="paymentStatus" label="付款状态" width="110" :formatter="formatPaymentStatus" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="creator" label="创建人" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" link @click="handleView(scope.row)">查看</el-button>
            <el-button type="success" size="small" link @click="handleEdit(scope.row)" :disabled="!['draft', 'rejected'].includes(scope.row.auditStatus)">编辑</el-button>
            <el-button type="warning" size="small" link @click="handleSubmit(scope.row)" :disabled="scope.row.auditStatus !== 'draft'">提交审核</el-button>
            <el-dropdown @command="(command) => handleMoreAction(command, scope.row)" v-if="['pending', 'approved'].includes(scope.row.auditStatus)">
              <template #default>
                <el-button type="info" size="small" link>更多</el-button>
              </template>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="cancel" :disabled="scope.row.auditStatus !== 'pending'">作废</el-dropdown-item>
                  <el-dropdown-item command="payment" :disabled="scope.row.paymentStatus === 'paid' || scope.row.auditStatus !== 'approved'">发起付款</el-dropdown-item>
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

    <!-- 成本详情抽屉 -->
    <el-drawer
      v-model="showDetail"
      title="月结成本详情"
      size="900px"
      :before-close="handleCloseDetail"
    >
      <template #default>
        <monthly-detail v-if="currentCost" :cost-id="currentCost.id" @close="handleCloseDetail" />
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { ElTag } from 'element-plus'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Download } from '@element-plus/icons-vue'
import MonthlyDetail from './MonthlyDetail.vue'

const router = useRouter()
const loading = ref(false)
const showDetail = ref(false)
const currentCost = ref<any>(null)

// 搜索表单
const searchForm = reactive({
  settleMonth: '',
  supplierName: '',
  orderNo: '',
  auditStatus: '',
  paymentStatus: '',
  minAmount: undefined as number | undefined,
  maxAmount: undefined as number | undefined
})

// 分页信息
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    costNo: 'YJ2024010001',
    settleMonth: '2024-01',
    supplierName: '上海电子有限公司',
    billNo: 'SH20240100123',
    billDate: '2024-01-31',
    orderCount: 3,
    costAmount: 128500.00,
    paidAmount: 64250.00,
    unpaidAmount: 64250.00,
    auditStatus: 'approved',
    paymentStatus: 'partial',
    createTime: '2024-02-01 10:30:00',
    creator: '张三'
  },
  {
    id: 2,
    costNo: 'YJ2024010002',
    settleMonth: '2024-01',
    supplierName: '深圳科技有限公司',
    billNo: 'SZ20240100456',
    billDate: '2024-01-28',
    orderCount: 2,
    costAmount: 86200.00,
    paidAmount: 86200.00,
    unpaidAmount: 0.00,
    auditStatus: 'approved',
    paymentStatus: 'paid',
    createTime: '2024-02-02 14:20:00',
    creator: '李四'
  },
  {
    id: 3,
    costNo: 'YJ2024020001',
    settleMonth: '2024-02',
    supplierName: '广州贸易有限公司',
    billNo: 'GZ20240200078',
    billDate: '2024-02-29',
    orderCount: 5,
    costAmount: 256800.00,
    paidAmount: 0.00,
    unpaidAmount: 256800.00,
    auditStatus: 'pending',
    paymentStatus: 'unpaid',
    createTime: '2024-03-01 09:15:00',
    creator: '王五'
  },
  {
    id: 4,
    costNo: 'YJ2024020002',
    settleMonth: '2024-02',
    supplierName: '北京服务商有限公司',
    billNo: 'BJ20240200112',
    billDate: '2024-02-28',
    orderCount: 1,
    costAmount: 45000.00,
    paidAmount: 0.00,
    unpaidAmount: 45000.00,
    auditStatus: 'draft',
    paymentStatus: 'unpaid',
    createTime: '2024-03-02 16:45:00',
    creator: '赵六'
  },
  {
    id: 5,
    costNo: 'YJ2024020003',
    settleMonth: '2024-02',
    supplierName: '杭州制造有限公司',
    billNo: 'HZ20240200098',
    billDate: '2024-02-27',
    orderCount: 4,
    costAmount: 168000.00,
    paidAmount: 0.00,
    unpaidAmount: 168000.00,
    auditStatus: 'rejected',
    paymentStatus: 'unpaid',
    createTime: '2024-03-03 11:20:00',
    creator: '孙七'
  }
])

pagination.total = tableData.value.length

// 格式化审核状态
const formatAuditStatus = (row: any) => {
  const statusMap: Record<string, { label: string, type: string }> = {
    'draft': { label: '草稿', type: 'info' },
    'pending': { label: '待审核', type: 'warning' },
    'approved': { label: '审核通过', type: 'success' },
    'rejected': { label: '审核驳回', type: 'danger' },
    'cancelled': { label: '已作废', type: 'info' }
  }
  const status = statusMap[row.auditStatus] || { label: row.auditStatus, type: 'info' }
  return h(ElTag, { type: status.type as any }, () => status.label)
}

// 格式化付款状态
const formatPaymentStatus = (row: any) => {
  const statusMap: Record<string, { label: string, type: string }> = {
    'unpaid': { label: '未付款', type: 'danger' },
    'partial': { label: '部分付款', type: 'warning' },
    'paid': { label: '已付款', type: 'success' }
  }
  const status = statusMap[row.paymentStatus] || { label: row.paymentStatus, type: 'info' }
  return h(ElTag, { type: status.type as any }, () => status.label)
}

// 格式化金额
const formatMoney = (row: any, column: any, value: number) => {
  return '¥' + value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
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
    settleMonth: '',
    supplierName: '',
    orderNo: '',
    auditStatus: '',
    paymentStatus: '',
    minAmount: undefined,
    maxAmount: undefined
  })
  handleSearch()
}

// 新增
const handleCreate = () => {
  router.push('/cost/monthly/create')
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
  currentCost.value = row
  showDetail.value = true
}

// 编辑
const handleEdit = (row: any) => {
  router.push(`/cost/monthly/edit/${row.id}`)
}

// 提交审核
const handleSubmit = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '确定要提交该月结成本审核吗？提交后将进入审核流程。',
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
      row.auditStatus = 'pending'
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
    case 'payment':
      handlePayment(row)
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
      '确定要作废该月结成本吗？作废后不可恢复。',
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
      row.auditStatus = 'cancelled'
      ElMessage.success('作废成功')
    }, 500)
  } catch {
    // 用户取消
  }
}

// 发起付款
const handlePayment = (row: any) => {
  ElMessage.info('发起付款功能开发中')
  // 可以跳转到付款申请页面，参数带上成本单ID
}

// 关闭详情
const handleCloseDetail = () => {
  showDetail.value = false
  currentCost.value = null
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.monthly-cost-container {
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
