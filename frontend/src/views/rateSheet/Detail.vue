<template>
  <div class="rate-sheet-detail-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <el-button text @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">费率单详情</span>
      </div>
      <div class="header-right">
        <el-button v-if="detailData.status === 'draft' || detailData.status === 'pending'" type="warning" @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
        <el-button v-if="detailData.status === 'draft'" type="success" @click="handleApprove">
          <el-icon><CircleCheck /></el-icon>
          审核
        </el-button>
        <el-button v-if="detailData.status === 'approved'" type="primary" @click="handleSettle">
          <el-icon><Check /></el-icon>
          结算
        </el-button>
        <el-button @click="handleTrace">
          <el-icon><Connection /></el-icon>
          溯源
        </el-button>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="detail-content">
      <el-card class="detail-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <el-tag :type="getStatusType(detailData.status)" effect="plain">
              {{ getStatusText(detailData.status) }}
            </el-tag>
          </div>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="费率单号">{{ detailData.rateSheetNo }}</el-descriptions-item>
          <el-descriptions-item label="客户编码">{{ detailData.customerCode }}</el-descriptions-item>
          <el-descriptions-item label="客户名称">{{ detailData.customerName }}</el-descriptions-item>
          <el-descriptions-item label="业务类型">{{ detailData.businessType }}</el-descriptions-item>
          <el-descriptions-item label="来源单据">{{ detailData.documentNo }}</el-descriptions-item>
          <el-descriptions-item label="业务日期">{{ detailData.businessDate }}</el-descriptions-item>
          <el-descriptions-item label="计费重量">{{ detailData.billingWeight }} kg</el-descriptions-item>
          <el-descriptions-item label="计费体积">{{ detailData.billingVolume }} m³</el-descriptions-item>
          <el-descriptions-item label="计费数量">{{ detailData.billingQuantity }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ detailData.creator }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
          <el-descriptions-item label="审核人">{{ detailData.reviewer || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 收入成本对比 -->
      <el-card class="detail-card">
        <template #header>
          <div class="card-header">
            <span>收支概览</span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="amount-box income">
              <div class="amount-label">收入合计（含税）</div>
              <div class="amount-value">¥{{ detailData.totalIncome?.toLocaleString() }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="amount-box cost">
              <div class="amount-label">成本合计</div>
              <div class="amount-value">¥{{ detailData.totalCost?.toLocaleString() }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="amount-box profit" :class="detailData.profit >= 0 ? 'positive' : 'negative'">
              <div class="amount-label">毛利</div>
              <div class="amount-value">¥{{ detailData.profit?.toLocaleString() }}</div>
              <div class="amount-rate">{{ detailData.profitRate }}%</div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 收入明细 -->
      <el-card class="detail-card">
        <template #header>
          <div class="card-header">
            <span>收入明细</span>
          </div>
        </template>
        <el-table :data="detailData.incomeItems" border size="small">
          <el-table-column prop="feeName" label="费用名称" min-width="150" />
          <el-table-column prop="ruleCode" label="规则编码" width="120" />
          <el-table-column prop="billingBase" label="计费基数" width="100" align="center" />
          <el-table-column prop="unitPrice" label="单价" width="100" align="right">
            <template #default="{ row }">
              ¥{{ row.unitPrice?.toFixed(4) }}
            </template>
          </el-table-column>
          <el-table-column prop="taxExclusiveAmount" label="不含税金额" width="120" align="right">
            <template #default="{ row }">
              ¥{{ row.taxExclusiveAmount?.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="taxRate" label="税率" width="70" align="center">
            <template #default="{ row }">
              {{ row.taxRate }}%
            </template>
          </el-table-column>
          <el-table-column prop="taxAmount" label="税额" width="100" align="right">
            <template #default="{ row }">
              ¥{{ row.taxAmount?.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="totalAmount" label="价税合计" width="120" align="right">
            <template #default="{ row }">
              <b>¥{{ row.totalAmount?.toFixed(2) }}</b>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 成本明细 -->
      <el-card class="detail-card">
        <template #header>
          <div class="card-header">
            <span>成本明细</span>
          </div>
        </template>
        <el-table :data="detailData.costItems" border size="small">
          <el-table-column prop="supplierName" label="供应商" min-width="150" />
          <el-table-column prop="feeName" label="费用名称" min-width="150" />
          <el-table-column prop="ruleCode" label="规则编码" width="120" />
          <el-table-column prop="taxExclusiveAmount" label="不含税金额" width="120" align="right">
            <template #default="{ row }">
              ¥{{ row.taxExclusiveAmount?.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="taxRate" label="税率" width="70" align="center">
            <template #default="{ row }">
              {{ row.taxRate }}%
            </template>
          </el-table-column>
          <el-table-column prop="taxAmount" label="税额" width="100" align="right">
            <template #default="{ row }">
              ¥{{ row.taxAmount?.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="totalAmount" label="价税合计" width="120" align="right">
            <template #default="{ row }">
              <b>¥{{ row.totalAmount?.toFixed(2) }}</b>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 操作日志 -->
      <el-card class="detail-card">
        <template #header>
          <div class="card-header">
            <span>操作日志</span>
          </div>
        </template>
        <el-table :data="detailData.logs" border size="small">
          <el-table-column prop="actionTime" label="操作时间" width="160" />
          <el-table-column prop="operator" label="操作人" width="100" />
          <el-table-column prop="actionType" label="操作类型" width="100" />
          <el-table-column prop="actionDetail" label="操作详情" min-width="300" />
          <el-table-column prop="beforeValue" label="变更前" width="120" />
          <el-table-column prop="afterValue" label="变更后" width="120" />
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Edit, CircleCheck, Check, Connection } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const detailData = reactive({
  rateSheetNo: 'RATE2026040001',
  customerCode: 'KH001',
  customerName: '深圳市腾讯科技有限公司',
  businessType: '仓储服务',
  documentNo: 'WMS20260426001',
  businessDate: '2026-04-26',
  billingWeight: 5000,
  billingVolume: 25,
  billingQuantity: 1000,
  creator: '系统',
  createTime: '2026-04-26 10:30:05',
  reviewer: '李经理',
  status: 'approved',
  totalIncome: 3445,
  totalCost: 2580,
  profit: 865,
  profitRate: 25.1,
  incomeItems: [
    { feeName: '仓储入库费', ruleCode: 'R001', billingBase: 1000, unitPrice: 2.5, taxExclusiveAmount: 2500, taxRate: 6, taxAmount: 150, totalAmount: 2650 },
    { feeName: '仓储租仓费', ruleCode: 'R003', billingBase: 25, unitPrice: 30, taxExclusiveAmount: 750, taxRate: 6, taxAmount: 45, totalAmount: 795 }
  ],
  costItems: [
    { supplierName: '深圳仓储A公司', feeName: '仓储服务成本', ruleCode: 'CR001', taxExclusiveAmount: 2434, taxRate: 6, taxAmount: 146, totalAmount: 2580 }
  ],
  logs: [
    { actionTime: '2026-04-26 10:30:05', operator: '系统', actionType: '生成', actionDetail: '根据业务单据自动生成费率单', beforeValue: '-', afterValue: '-' },
    { actionTime: '2026-04-26 11:00:00', operator: '张三', actionType: '修改', actionDetail: '微调收入单价', beforeValue: '¥2580', afterValue: '¥2650' },
    { actionTime: '2026-04-26 14:00:00', operator: '李经理', actionType: '审核', actionDetail: '审核通过', beforeValue: '待审核', afterValue: '已审核' }
  ]
})

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    draft: 'info', pending: 'warning', approved: 'success', settled: 'primary', archived: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    draft: '草稿', pending: '待审核', approved: '已审核', settled: '已结算', archived: '已归档'
  }
  return texts[status] || status
}

const handleBack = () => {
  router.back()
}

const handleEdit = () => {
  ElMessage.info('编辑费率单')
}

const handleApprove = () => {
  ElMessage.success('审核通过')
}

const handleSettle = () => {
  ElMessage.success('结算完成')
}

const handleTrace = () => {
  router.push(`/document/trace/${detailData.rateSheetNo}`)
}
</script>

<style scoped>
.rate-sheet-detail-container {
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

.detail-content {
  padding: 20px;
}

.detail-card {
  margin-bottom: 16px;
}

.card-header {
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.amount-box {
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.amount-box.income {
  background: #f0f9eb;
  border: 1px solid #e1f3d8;
}

.amount-box.cost {
  background: #fef0f0;
  border: 1px solid #fde2e2;
}

.amount-box.profit {
  background: #ecf5ff;
  border: 1px solid #d9ecff;
}

.amount-box.profit.positive .amount-value {
  color: #67c23a;
}

.amount-box.profit.negative .amount-value {
  color: #f56c6c;
}

.amount-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.amount-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.amount-rate {
  font-size: 14px;
  color: #67c23a;
  margin-top: 4px;
}
</style>