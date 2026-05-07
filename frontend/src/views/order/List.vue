<template>
  <div class="order-list-container">
    <!-- 搜索筛选区域 -->
    <div class="search-panel">
      <el-form :model="searchForm" :inline="true" label-width="80px">
        <el-form-item label="订单类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable>
            <el-option label="销售订单" value="sale" />
            <el-option label="采购订单" value="purchase" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="草稿" value="draft" />
            <el-option label="待审核" value="pending" />
            <el-option label="已生效" value="effective" />
            <el-option label="执行中" value="executing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已作废" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户/供应商">
          <el-input v-model="searchForm.customer" placeholder="请输入名称" clearable />
        </el-form-item>
        <el-form-item label="订单日期">
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
        <el-form-item label="责任人">
          <el-input v-model="searchForm.responsible" placeholder="请输入姓名" clearable />
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
        新增订单
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
        <el-table-column prop="orderNo" label="订单编号" min-width="180" sortable />
        <el-table-column prop="type" label="订单类型" width="100" :formatter="formatType" />
        <el-table-column prop="customerName" label="客户/供应商" min-width="150" />
        <el-table-column prop="orderAmount" label="订单金额" width="120" align="right" :formatter="formatMoney" />
        <el-table-column prop="paidAmount" label="已付金额" width="120" align="right" :formatter="formatMoney" />
        <el-table-column prop="unpaidAmount" label="未付金额" width="120" align="right" :formatter="formatMoney" />
        <el-table-column prop="status" label="订单状态" width="100" :formatter="formatStatus" />
        <el-table-column prop="orderDate" label="订单日期" width="120" />
        <el-table-column prop="expectedDate" label="预计交付日期" width="140" />
        <el-table-column prop="responsible" label="责任人" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" link @click="handleView(scope.row)">查看</el-button>
            <el-button type="success" size="small" link @click="handleEdit(scope.row)" :disabled="!['draft', 'rejected'].includes(scope.row.status)">编辑</el-button>
            <el-button type="warning" size="small" link @click="handleSubmit(scope.row)" :disabled="scope.row.status !== 'draft'">提交审核</el-button>
            <el-dropdown @command="(command) => handleMoreAction(command, scope.row)" v-if="['pending', 'effective', 'executing'].includes(scope.row.status)">
              <template #default>
                <el-button type="info" size="small" link>更多</el-button>
              </template>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="cancel" :disabled="scope.row.status !== 'pending'">作废</el-dropdown-item>
                  <el-dropdown-item command="change">变更订单</el-dropdown-item>
                  <el-dropdown-item command="print">打印订单</el-dropdown-item>
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

    <!-- 订单详情抽屉 -->
    <el-drawer
      v-model="showDetail"
      title="订单详情"
      size="800px"
      :before-close="handleCloseDetail"
    >
      <template #default>
        <order-detail v-if="currentOrder" :order-id="currentOrder.id" @close="handleCloseDetail" />
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { ElTag } from 'element-plus'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Download,
  Edit,
  View,
  Delete
} from '@element-plus/icons-vue'
import OrderDetail from './Detail.vue'

const router = useRouter()
const loading = ref(false)
const showDetail = ref(false)
const currentOrder = ref<any>(null)

// 搜索表单
const searchForm = reactive({
  type: '',
  status: '',
  customer: '',
  dateRange: [] as string[],
  minAmount: undefined as number | undefined,
  maxAmount: undefined as number | undefined,
  responsible: ''
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
    orderNo: 'SO202401010001',
    type: 'sale',
    customerName: '北京科技有限公司',
    orderAmount: 128000.00,
    paidAmount: 64000.00,
    unpaidAmount: 64000.00,
    status: 'executing',
    orderDate: '2024-01-01',
    expectedDate: '2024-01-15',
    responsible: '张三',
    createTime: '2024-01-01 10:30:00'
  },
  {
    id: 2,
    orderNo: 'PO202401020002',
    type: 'purchase',
    customerName: '上海贸易有限公司',
    orderAmount: 86000.00,
    paidAmount: 86000.00,
    unpaidAmount: 0.00,
    status: 'completed',
    orderDate: '2024-01-02',
    expectedDate: '2024-01-20',
    responsible: '李四',
    createTime: '2024-01-02 14:20:00'
  },
  {
    id: 3,
    orderNo: 'SO202401030003',
    type: 'sale',
    customerName: '广州电子有限公司',
    orderAmount: 256000.00,
    paidAmount: 0.00,
    unpaidAmount: 256000.00,
    status: 'pending',
    orderDate: '2024-01-03',
    expectedDate: '2024-01-25',
    responsible: '王五',
    createTime: '2024-01-03 09:15:00'
  },
  {
    id: 4,
    orderNo: 'SO202401040004',
    type: 'sale',
    customerName: '深圳信息技术有限公司',
    orderAmount: 158000.00,
    paidAmount: 79000.00,
    unpaidAmount: 79000.00,
    status: 'draft',
    orderDate: '2024-01-04',
    expectedDate: '2024-01-30',
    responsible: '赵六',
    createTime: '2024-01-04 16:45:00'
  },
  {
    id: 5,
    orderNo: 'PO202401050005',
    type: 'purchase',
    customerName: '杭州制造有限公司',
    orderAmount: 98000.00,
    paidAmount: 29400.00,
    unpaidAmount: 68600.00,
    status: 'effective',
    orderDate: '2024-01-05',
    expectedDate: '2024-02-05',
    responsible: '孙七',
    createTime: '2024-01-05 11:20:00'
  }
])

pagination.total = tableData.value.length

// 格式化订单类型
const formatType = (row: any) => {
  const typeMap: Record<string, string> = {
    'sale': '销售订单',
    'purchase': '采购订单'
  }
  return typeMap[row.type] || row.type
}

// 格式化订单状态
const formatStatus = (row: any) => {
  const statusMap: Record<string, { label: string, type: string }> = {
    'draft': { label: '草稿', type: 'info' },
    'pending': { label: '待审核', type: 'warning' },
    'effective': { label: '已生效', type: 'success' },
    'executing': { label: '执行中', type: 'primary' },
    'completed': { label: '已完成', type: 'success' },
    'cancelled': { label: '已作废', type: 'danger' },
    'rejected': { label: '已驳回', type: 'danger' }
  }
  const status = statusMap[row.status] || { label: row.status, type: 'info' }
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
    type: '',
    status: '',
    customer: '',
    dateRange: [],
    minAmount: undefined,
    maxAmount: undefined,
    responsible: ''
  })
  handleSearch()
}

// 新增订单
const handleCreate = () => {
  router.push('/order/create')
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
  currentOrder.value = row
  showDetail.value = true
}

// 编辑
const handleEdit = (row: any) => {
  router.push(`/order/edit/${row.id}`)
}

// 提交审核
const handleSubmit = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '确定要提交该订单审核吗？',
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
      ElMessage.success('提交成功')
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
    case 'change':
      ElMessage.info('变更功能开发中')
      break
    case 'print':
      window.print()
      break
    case 'log':
      ElMessage.info('操作日志功能开发中')
      break
  }
}

// 作废订单
const handleCancel = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '确定要作废该订单吗？作废后不可恢复。',
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

// 关闭详情
const handleCloseDetail = () => {
  showDetail.value = false
  currentOrder.value = null
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.order-list-container {
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
