<template>
  <div class="aging-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <span class="page-title">应收账龄分析</span>
      </div>
      <div class="header-right">
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出报表
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="statistics-overview">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="overview-card normal">
            <div class="overview-label">正常</div>
            <div class="overview-value">¥{{ overview.normal.toLocaleString() }}</div>
            <div class="overview-percent">{{ overview.normalPercent }}%</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card warning1">
            <div class="overview-label">逾期1-30天</div>
            <div class="overview-value">¥{{ overview.overdue1.toLocaleString() }}</div>
            <div class="overview-percent">{{ overview.overdue1Percent }}%</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card warning2">
            <div class="overview-label">逾期31-60天</div>
            <div class="overview-value">¥{{ overview.overdue2.toLocaleString() }}</div>
            <div class="overview-percent">{{ overview.overdue2Percent }}%</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card danger">
            <div class="overview-label">逾期60天以上</div>
            <div class="overview-value">¥{{ overview.overdue3.toLocaleString() }}</div>
            <div class="overview-percent">{{ overview.overdue3Percent }}%</div>
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
        <el-form-item label="账龄分析">
          <el-select v-model="searchForm.agingRange" placeholder="请选择" clearable style="width: 160px">
            <el-option label="全部" value="all" />
            <el-option label="正常（未逾期）" value="normal" />
            <el-option label="逾期1-30天" value="overdue1" />
            <el-option label="逾期31-60天" value="overdue2" />
            <el-option label="逾期61-90天" value="overdue3" />
            <el-option label="逾期90天以上" value="overdue4" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="searchForm.cutoffDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 账龄表格 -->
    <div class="table-container">
      <el-table
        :data="agingData"
        border
        stripe
        show-summary
        :summary-method="getSummary"
      >
        <el-table-column prop="customerName" label="客户名称" min-width="160" fixed />
        <el-table-column prop="totalAmount" label="应收总额" width="130" align="right">
          <template #default="{ row }">¥{{ row.totalAmount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="正常" width="130" align="right">
          <template #default="{ row }">¥{{ row.normalAmount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="逾期1-30天" width="130" align="right">
          <template #default="{ row }">¥{{ row.overdue1Amount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="逾期31-60天" width="140" align="right">
          <template #default="{ row }">¥{{ row.overdue2Amount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="逾期61-90天" width="140" align="right">
          <template #default="{ row }">¥{{ row.overdue3Amount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="逾期90天以上" width="140" align="right">
          <template #default="{ row }">¥{{ row.overdue4Amount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="账龄分布" min-width="200">
          <template #default="{ row }">
            <div class="aging-bar">
              <div
                v-if="row.normalPercent > 0"
                class="bar-segment normal"
                :style="{ width: row.normalPercent + '%' }"
                :title="'正常: ' + row.normalPercent + '%'"
              />
              <div
                v-if="row.overdue1Percent > 0"
                class="bar-segment warning1"
                :style="{ width: row.overdue1Percent + '%' }"
                :title="'逾期1-30天: ' + row.overdue1Percent + '%'"
              />
              <div
                v-if="row.overdue2Percent > 0"
                class="bar-segment warning2"
                :style="{ width: row.overdue2Percent + '%' }"
                :title="'逾期31-60天: ' + row.overdue2Percent + '%'"
              />
              <div
                v-if="row.overdue3Percent > 0"
                class="bar-segment danger"
                :style="{ width: row.overdue3Percent + '%' }"
                :title="'逾期60天以上: ' + (row.overdue3Percent + row.overdue4Percent) + '%'"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 详细记录抽屉 -->
    <el-drawer
      v-model="showDetailDrawer"
      :title="`${currentCustomer} - 应收收入明细`"
      size="800px"
    >
      <template #default>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="正常" name="normal">
            <el-table :data="detailData.normal" border size="small">
              <el-table-column prop="receivableNo" label="应收单号" width="160" />
              <el-table-column prop="amount" label="应收金额" width="120" align="right">
                <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
              </el-table-column>
              <el-table-column prop="receivedAmount" label="已收金额" width="120" align="right">
                <template #default="{ row }">¥{{ row.receivedAmount.toLocaleString() }}</template>
              </el-table-column>
              <el-table-column prop="pendingAmount" label="待收金额" width="120" align="right">
                <template #default="{ row }">¥{{ row.pendingAmount.toLocaleString() }}</template>
              </el-table-column>
              <el-table-column prop="dueDate" label="到期日期" width="110" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)" size="small">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="!detailData.normal.length" description="暂无数据" />
          </el-tab-pane>
          <el-tab-pane label="逾期记录" name="overdue">
            <el-table :data="detailData.overdue" border size="small">
              <el-table-column prop="receivableNo" label="应收单号" width="160" />
              <el-table-column prop="pendingAmount" label="待收金额" width="120" align="right">
                <template #default="{ row }">¥{{ row.pendingAmount.toLocaleString() }}</template>
              </el-table-column>
              <el-table-column prop="dueDate" label="到期日期" width="110" />
              <el-table-column prop="overdueDays" label="逾期天数" width="100">
                <template #default="{ row }">
                  <span class="overdue-days">{{ row.overdueDays }}天</span>
                </template>
              </el-table-column>
              <el-table-column label="逾期等级" width="100">
                <template #default="{ row }">
                  <el-tag :type="getOverdueTagType(row.overdueDays)" size="small">
                    {{ getOverdueLevel(row.overdueDays) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="!detailData.overdue.length" description="暂无数据" />
          </el-tab-pane>
        </el-tabs>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Refresh } from '@element-plus/icons-vue'

// 概览数据
const overview = reactive({
  normal: 5231800,
  normalPercent: 61.1,
  overdue1: 892400,
  overdue1Percent: 10.4,
  overdue2: 1200000,
  overdue2Percent: 14.0,
  overdue3: 1239000,
  overdue3Percent: 14.5
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
  agingRange: '',
  cutoffDate: new Date().toISOString().slice(0, 10)
})

// 账龄数据
const agingData = ref([
  {
    customerId: 1,
    customerName: '深圳市腾讯科技有限公司',
    totalAmount: 500000,
    normalAmount: 300000,
    overdue1Amount: 200000,
    overdue2Amount: 0,
    overdue3Amount: 0,
    overdue4Amount: 0,
    normalPercent: 60,
    overdue1Percent: 40,
    overdue2Percent: 0,
    overdue3Percent: 0,
    overdue4Percent: 0
  },
  {
    customerId: 2,
    customerName: '阿里巴巴（中国）有限公司',
    totalAmount: 800000,
    normalAmount: 800000,
    overdue1Amount: 0,
    overdue2Amount: 0,
    overdue3Amount: 0,
    overdue4Amount: 0,
    normalPercent: 100,
    overdue1Percent: 0,
    overdue2Percent: 0,
    overdue3Percent: 0,
    overdue4Percent: 0
  },
  {
    customerId: 3,
    customerName: '字节跳动科技有限公司',
    totalAmount: 350000,
    normalAmount: 0,
    overdue1Amount: 0,
    overdue2Amount: 0,
    overdue3Amount: 0,
    overdue4Amount: 350000,
    normalPercent: 0,
    overdue1Percent: 0,
    overdue2Percent: 0,
    overdue3Percent: 0,
    overdue4Percent: 100
  },
  {
    customerId: 4,
    customerName: '华为技术有限公司',
    totalAmount: 1200000,
    normalAmount: 1200000,
    overdue1Amount: 0,
    overdue2Amount: 0,
    overdue3Amount: 0,
    overdue4Amount: 0,
    normalPercent: 100,
    overdue1Percent: 0,
    overdue2Percent: 0,
    overdue3Percent: 0,
    overdue4Percent: 0
  },
  {
    customerId: 5,
    customerName: '京东集团股份有限公司',
    totalAmount: 200000,
    normalAmount: 0,
    overdue1Amount: 0,
    overdue2Amount: 200000,
    overdue3Amount: 0,
    overdue4Amount: 0,
    normalPercent: 0,
    overdue1Percent: 0,
    overdue2Percent: 100,
    overdue3Percent: 0,
    overdue4Percent: 0
  }
])

// 详情抽屉
const showDetailDrawer = ref(false)
const currentCustomer = ref('')
const activeTab = ref('normal')

// 详情数据
const detailData = reactive({
  normal: [
    { receivableNo: 'YS2024040001', amount: 500000, receivedAmount: 300000, pendingAmount: 200000, dueDate: '2024-05-15', status: 'partial' }
  ],
  overdue: [
    { receivableNo: 'YS2024040003', pendingAmount: 350000, dueDate: '2024-03-15', overdueDays: 41 },
    { receivableNo: 'YS2024040005', pendingAmount: 200000, dueDate: '2024-03-01', overdueDays: 85 }
  ]
})

// 方法
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'info',
    confirmed: 'success',
    partial: 'warning',
    written_off: 'success'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    partial: '部分收款',
    written_off: '已核销'
  }
  return texts[status] || status
}

const getOverdueLevel = (days: number) => {
  if (days <= 30) return '轻微'
  if (days <= 60) return '中等'
  if (days <= 90) return '严重'
  return '极严重'
}

const getOverdueTagType = (days: number) => {
  if (days <= 30) return 'warning'
  if (days <= 60) return 'warning'
  if (days <= 90) return 'danger'
  return 'danger'
}

const getSummary = ({ columns, data }: any) => {
  const sums: string[] = []
  columns.forEach((column: any, index: number) => {
    if (index === 0) {
      sums.push('合计')
      return
    }
    if (column.property === 'totalAmount') {
      const total = data.reduce((sum: number, row: any) => sum + row.totalAmount, 0)
      sums.push('¥' + total.toLocaleString())
    } else if (column.property === 'normalAmount') {
      const total = data.reduce((sum: number, row: any) => sum + row.normalAmount, 0)
      sums.push('¥' + total.toLocaleString())
    } else if (column.property === 'overdue1Amount') {
      const total = data.reduce((sum: number, row: any) => sum + row.overdue1Amount, 0)
      sums.push('¥' + total.toLocaleString())
    } else if (column.property === 'overdue2Amount') {
      const total = data.reduce((sum: number, row: any) => sum + row.overdue2Amount, 0)
      sums.push('¥' + total.toLocaleString())
    } else if (column.property === 'overdue3Amount') {
      const total = data.reduce((sum: number, row: any) => sum + row.overdue3Amount, 0)
      sums.push('¥' + total.toLocaleString())
    } else if (column.property === 'overdue4Amount') {
      const total = data.reduce((sum: number, row: any) => sum + row.overdue4Amount, 0)
      sums.push('¥' + total.toLocaleString())
    } else {
      sums.push('')
    }
  })
  return sums
}

const handleSearch = () => {
  ElMessage.success('搜索账龄数据')
}

const handleReset = () => {
  searchForm.customerId = ''
  searchForm.agingRange = ''
  ElMessage.info('已重置搜索条件')
}

const handleExport = () => {
  ElMessage.success('导出账龄报表')
}

const handleRefresh = () => {
  ElMessage.success('刷新数据')
}

const handleViewDetail = (row: any) => {
  currentCustomer.value = row.customerName
  showDetailDrawer.value = true
}
</script>

<style scoped>
.aging-container {
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

.statistics-overview {
  padding: 16px 20px;
}

.overview-card {
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.overview-card.normal {
  background: linear-gradient(135deg, #67c23a 0%, #95d475 100%);
  color: #fff;
}

.overview-card.warning1 {
  background: linear-gradient(135deg, #e6a23c 0%, #f3d19e 100%);
  color: #fff;
}

.overview-card.warning2 {
  background: linear-gradient(135deg, #f56c6c 0%, #fab6b6 100%);
  color: #fff;
}

.overview-card.danger {
  background: linear-gradient(135deg, #a65a5a 0%, #c99191 100%);
  color: #fff;
}

.overview-label {
  font-size: 14px;
  opacity: 0.9;
}

.overview-value {
  font-size: 24px;
  font-weight: 600;
  margin: 8px 0;
}

.overview-percent {
  font-size: 12px;
  opacity: 0.8;
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

.aging-bar {
  display: flex;
  height: 20px;
  border-radius: 4px;
  overflow: hidden;
}

.bar-segment {
  height: 100%;
  min-width: 4px;
}

.bar-segment.normal {
  background: #67c23a;
}

.bar-segment.warning1 {
  background: #e6a23c;
}

.bar-segment.warning2 {
  background: #f56c6c;
}

.bar-segment.danger {
  background: #a65a5a;
}

.overdue-days {
  color: #f56c6c;
  font-weight: 500;
}
</style>
