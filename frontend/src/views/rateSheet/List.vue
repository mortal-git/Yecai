<template>
  <div class="rate-sheet-list-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <span class="page-title">费率单列表</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建费率单
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <el-button type="success" @click="handleCompare">
          <el-icon><DataLine /></el-icon>
          收支对比
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon total"><el-icon><Tickets /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">费率单总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon draft"><el-icon><Document /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.draft }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon income"><el-icon><Top /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">¥{{ statistics.totalIncome.toLocaleString() }}</div>
              <div class="stat-label">收入合计</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon cost"><el-icon><Bottom /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">¥{{ statistics.totalCost.toLocaleString() }}</div>
              <div class="stat-label">成本合计</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-panel">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="费率单号">
          <el-input v-model="searchForm.rateSheetNo" placeholder="请输入费率单号" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="客户名称">
          <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="业务类型">
          <el-select v-model="searchForm.businessType" placeholder="请选择" clearable style="width: 120px">
            <el-option label="仓储" value="storage" />
            <el-option label="运输" value="transport" />
            <el-option label="关务" value="customs" />
          </el-select>
        </el-form-item>
        <el-form-item label="单据状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="草稿" value="draft" />
            <el-option label="待审核" value="pending" />
            <el-option label="已审核" value="approved" />
            <el-option label="已结算" value="settled" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
        <el-form-item label="生成时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table :data="tableData" border stripe @row-click="handleRowClick">
        <el-table-column prop="rateSheetNo" label="费率单号" width="150" />
        <el-table-column prop="customerCode" label="客户编码" width="100" />
        <el-table-column prop="customerName" label="客户名称" min-width="180" />
        <el-table-column prop="businessType" label="业务类型" width="80">
          <template #default="{ row }">
            <el-tag size="small">{{ getBusinessTypeText(row.businessType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="documentNo" label="来源单据" width="150" />
        <el-table-column prop="incomeAmount" label="收入金额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount income">¥{{ row.incomeAmount?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="costAmount" label="成本金额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount cost">¥{{ row.costAmount?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="profitAmount" label="毛利" width="100" align="right">
          <template #default="{ row }">
            <span class="amount" :class="row.profitAmount >= 0 ? 'profit' : 'loss'">
              ¥{{ row.profitAmount?.toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="profitRate" label="毛利率" width="80" align="center">
          <template #default="{ row }">
            <span :class="row.profitRate >= 0 ? 'text-success' : 'text-danger'">
              {{ row.profitRate }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click.stop="handleView(row)">查看</el-button>
            <el-button v-if="row.status === 'draft' || row.status === 'pending'" type="primary" link size="small" @click.stop="handleEdit(row)">编辑</el-button>
            <el-button v-if="row.status === 'draft'" type="success" link size="small" @click.stop="handleApprove(row)">审核</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Download, Tickets, Document, Top, Bottom, DataLine } from '@element-plus/icons-vue'

const router = useRouter()

// 统计数据
const statistics = reactive({
  total: 1256,
  draft: 45,
  totalIncome: 8563200,
  totalCost: 6234800
})

// 搜索表单
const searchForm = reactive({
  rateSheetNo: '',
  customerName: '',
  businessType: '',
  status: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    rateSheetNo: 'RATE2026040001',
    customerCode: 'KH001',
    customerName: '深圳市腾讯科技有限公司',
    businessType: 'storage',
    documentNo: 'WMS20260426001',
    incomeAmount: 3445,
    costAmount: 2580,
    profitAmount: 865,
    profitRate: 25.1,
    status: 'approved',
    createTime: '2026-04-26 10:30:05'
  },
  {
    id: 2,
    rateSheetNo: 'RATE2026040002',
    customerCode: 'KH002',
    customerName: '阿里巴巴（中国）有限公司',
    businessType: 'transport',
    documentNo: 'TMS20260426002',
    incomeAmount: 5680,
    costAmount: 4560,
    profitAmount: 1120,
    profitRate: 19.7,
    status: 'pending',
    createTime: '2026-04-26 10:25:00'
  },
  {
    id: 3,
    rateSheetNo: 'RATE2026040003',
    customerCode: 'KH001',
    customerName: '深圳市腾讯科技有限公司',
    businessType: 'customs',
    documentNo: 'CUS20260426001',
    incomeAmount: 1500,
    costAmount: 1200,
    profitAmount: 300,
    profitRate: 20.0,
    status: 'settled',
    createTime: '2026-04-25 15:30:00'
  }
])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 3
})

// 方法
const getBusinessTypeText = (type: string) => {
  const texts: Record<string, string> = {
    storage: '仓储', transport: '运输', customs: '关务'
  }
  return texts[type] || type
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    draft: 'info',
    pending: 'warning',
    approved: 'success',
    settled: 'primary',
    archived: 'info',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    draft: '草稿',
    pending: '待审核',
    approved: '已审核',
    settled: '已结算',
    archived: '已归档',
    cancelled: '已作废'
  }
  return texts[status] || status
}

const handleSearch = () => {
  ElMessage.success('搜索费率单')
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    ;(searchForm as any)[key] = key === 'dateRange' ? [] : ''
  })
  ElMessage.info('已重置搜索条件')
}

const handleCreate = () => {
  router.push('/rateSheet/create')
}

const handleCompare = () => {
  router.push('/rateSheet/compare')
}

const handleView = (row: any) => {
  router.push(`/rateSheet/detail/${row.id}`)
}

const handleEdit = (row: any) => {
  ElMessage.info('编辑费率单: ' + row.rateSheetNo)
}

const handleApprove = (row: any) => {
  ElMessage.success('审核通过: ' + row.rateSheetNo)
}

const handleRowClick = (row: any) => {
  router.push(`/rateSheet/detail/${row.id}`)
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.page = 1
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
}

const handleExport = () => {
  ElMessage.success('导出费率单')
}
</script>

<style scoped>
.rate-sheet-list-container {
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

.stat-icon.total { background: #ecf5ff; color: #409eff; }
.stat-icon.draft { background: #fdf6ec; color: #e6a23c; }
.stat-icon.income { background: #f0f9eb; color: #67c23a; }
.stat-icon.cost { background: #fff0f0; color: #f56c6c; }

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

.amount {
  font-weight: 600;
}

.amount.income { color: #67c23a; }
.amount.cost { color: #f56c6c; }
.amount.profit { color: #67c23a; }
.amount.loss { color: #f56c6c; }

.text-success { color: #67c23a; }
.text-danger { color: #f56c6c; }
</style>