<template>
  <div class="rate-sheet-compare-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <el-button text @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">收支对比分析</span>
      </div>
      <div class="header-right">
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
            <div class="stat-icon total"><el-icon><Tickets /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.totalCount }}</div>
              <div class="stat-label">费率单总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon income"><el-icon><Top /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">¥{{ statistics.totalIncome.toLocaleString() }}</div>
              <div class="stat-label">收入总计</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon cost"><el-icon><Bottom /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">¥{{ statistics.totalCost.toLocaleString() }}</div>
              <div class="stat-label">成本总计</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon profit"><el-icon><TrendCharts /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">¥{{ statistics.totalProfit.toLocaleString() }}</div>
              <div class="stat-label">毛利总计</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 对比表格 -->
    <div class="compare-content">
      <el-card class="compare-card">
        <template #header>
          <div class="card-header">
            <span>收支对比明细</span>
          </div>
        </template>
        <el-table :data="compareData" border size="small" show-summary>
          <el-table-column prop="customerName" label="客户名称" min-width="180" fixed />
          <el-table-column prop="businessType" label="业务类型" width="100" />
          <el-table-column prop="documentNo" label="单据号" width="150" />
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
              <el-progress
                :percentage="Math.abs(row.profitRate)"
                :color="row.profitRate >= 0 ? '#67c23a' : '#f56c6c'"
                :stroke-width="10"
                :format="() => row.profitRate + '%'"
              />
            </template>
          </el-table-column>
          <el-table-column prop="marginLevel" label="盈亏" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.profitAmount >= 0 ? 'success' : 'danger'" size="small">
                {{ row.profitAmount >= 0 ? '盈利' : '亏损' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 图表 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>收入成本对比</span>
              </div>
            </template>
            <div class="chart-placeholder">
              <el-empty description="图表区域" />
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>毛利率分布</span>
              </div>
            </template>
            <div class="chart-placeholder">
              <el-empty description="图表区域" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Download, Tickets, Top, Bottom, TrendCharts } from '@element-plus/icons-vue'

const router = useRouter()

const statistics = reactive({
  totalCount: 156,
  totalIncome: 8563200,
  totalCost: 6234800,
  totalProfit: 2328400
})

const compareData = ref([
  {
    customerName: '深圳市腾讯科技有限公司',
    businessType: '仓储',
    documentNo: 'RATE2026040001',
    incomeAmount: 3445,
    costAmount: 2580,
    profitAmount: 865,
    profitRate: 25.1,
    marginLevel: 'profit'
  },
  {
    customerName: '阿里巴巴（中国）有限公司',
    businessType: '运输',
    documentNo: 'RATE2026040002',
    incomeAmount: 5680,
    costAmount: 4560,
    profitAmount: 1120,
    profitRate: 19.7,
    marginLevel: 'profit'
  },
  {
    customerName: '字节跳动科技有限公司',
    businessType: '关务',
    documentNo: 'RATE2026040003',
    incomeAmount: 1500,
    costAmount: 1800,
    profitAmount: -300,
    profitRate: -20.0,
    marginLevel: 'loss'
  }
])

const handleBack = () => {
  router.back()
}

const handleExport = () => {
  ElMessage.success('导出对比数据')
}
</script>

<style scoped>
.rate-sheet-compare-container {
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
  gap: 12px;
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
.stat-icon.income { background: #f0f9eb; color: #67c23a; }
.stat-icon.cost { background: #fff0f0; color: #f56c6c; }
.stat-icon.profit { background: #e8f4fd; color: #409eff; }

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

.compare-content {
  padding: 0 20px 20px;
}

.compare-card,
.chart-card {
  margin-bottom: 16px;
}

.card-header {
  font-weight: 600;
  font-size: 14px;
}

.amount {
  font-weight: 600;
}

.amount.income { color: #67c23a; }
.amount.cost { color: #f56c6c; }
.amount.profit { color: #67c23a; }
.amount.loss { color: #f56c6c; }

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>