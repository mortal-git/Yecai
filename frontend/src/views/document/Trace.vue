<template>
  <div class="document-trace-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <el-button text @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">单据溯源</span>
      </div>
      <div class="header-right">
        <span class="bill-info">费率单号：{{ billNo }}</span>
      </div>
    </div>

    <!-- 溯源流程 -->
    <div class="trace-section">
      <el-steps :active="currentStep" align-center finish-status="success">
        <el-step title="业务单据" description="上游系统原始单据" />
        <el-step title="数据校验" description="字段完整性校验" />
        <el-step title="报价匹配" description="匹配生效报价单" />
        <el-step title="规则匹配" description="匹配计费规则" />
        <el-step title="费率单生成" description="生成业财核心单据" />
      </el-steps>
    </div>

    <!-- 溯源详情 -->
    <div class="trace-content">
      <el-card class="trace-card">
        <template #header>
          <div class="card-header">
            <span>业务单据信息</span>
            <el-tag type="info">{{ traceData.sourceSystem }}</el-tag>
          </div>
        </template>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="单据号">{{ traceData.documentNo }}</el-descriptions-item>
          <el-descriptions-item label="单据类型">{{ traceData.documentType }}</el-descriptions-item>
          <el-descriptions-item label="来源系统">{{ traceData.sourceSystem }}</el-descriptions-item>
          <el-descriptions-item label="业务完成时间">{{ traceData.completeTime }}</el-descriptions-item>
          <el-descriptions-item label="客户编码">{{ traceData.customerCode }}</el-descriptions-item>
          <el-descriptions-item label="客户名称">{{ traceData.customerName }}</el-descriptions-item>
          <el-descriptions-item label="计费重量">{{ traceData.billingWeight }} kg</el-descriptions-item>
          <el-descriptions-item label="计费体积">{{ traceData.billingVolume }} m³</el-descriptions-item>
        </el-descriptions>
        <div class="source-snapshot">
          <div class="snapshot-header">原始单据快照</div>
          <pre class="code-block">{{ traceData.sourceSnapshot }}</pre>
        </div>
      </el-card>

      <el-card class="trace-card">
        <template #header>
          <div class="card-header">
            <span>报价匹配信息</span>
            <el-tag type="success" v-if="traceData.quotation">已匹配</el-tag>
            <el-tag type="danger" v-else>未匹配</el-tag>
          </div>
        </template>
        <el-descriptions :column="2" border size="small" v-if="traceData.quotation">
          <el-descriptions-item label="报价单号">{{ traceData.quotation.quotationNo }}</el-descriptions-item>
          <el-descriptions-item label="报价版本">V{{ traceData.quotation.version }}</el-descriptions-item>
          <el-descriptions-item label="客户编码">{{ traceData.quotation.customerCode }}</el-descriptions-item>
          <el-descriptions-item label="业务类型">{{ traceData.quotation.businessType }}</el-descriptions-item>
          <el-descriptions-item label="生效日期">{{ traceData.quotation.effectiveDate }}</el-descriptions-item>
          <el-descriptions-item label="失效日期">{{ traceData.quotation.expiryDate }}</el-descriptions-item>
        </el-descriptions>
        <el-empty v-else description="未找到匹配的报价单" />
      </el-card>

      <el-card class="trace-card">
        <template #header>
          <div class="card-header">
            <span>计费规则匹配</span>
            <el-tag type="success">已匹配 {{ traceData.matchedRules?.length || 0 }} 条规则</el-tag>
          </div>
        </template>
        <el-table :data="traceData.matchedRules" border size="small">
          <el-table-column prop="ruleCode" label="规则编码" width="100" />
          <el-table-column prop="ruleName" label="规则名称" min-width="150" />
          <el-table-column prop="ruleType" label="规则类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.ruleType === 'income' ? 'success' : 'warning'" size="small">
                {{ row.ruleType === 'income' ? '收入' : '成本' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="billingMode" label="计费模式" width="100" />
          <el-table-column prop="priority" label="优先级" width="70" align="center" />
          <el-table-column prop="calculatedAmount" label="计算金额" width="120" align="right">
            <template #default="{ row }">
              ¥{{ row.calculatedAmount?.toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card class="trace-card">
        <template #header>
          <div class="card-header">
            <span>费率单信息</span>
            <el-tag type="primary">{{ traceData.rateSheet?.status }}</el-tag>
          </div>
        </template>
        <el-descriptions :column="2" border size="small" v-if="traceData.rateSheet">
          <el-descriptions-item label="费率单号">{{ traceData.rateSheet.rateSheetNo }}</el-descriptions-item>
          <el-descriptions-item label="客户编码">{{ traceData.rateSheet.customerCode }}</el-descriptions-item>
          <el-descriptions-item label="不含税金额">
            <span class="amount">¥{{ traceData.rateSheet.taxExclusiveAmount?.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="税额">
            <span class="amount">¥{{ traceData.rateSheet.taxAmount?.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="价税合计">
            <span class="amount total">¥{{ traceData.rateSheet.totalAmount?.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ traceData.rateSheet.createTime }}</el-descriptions-item>
        </el-descriptions>
        <div class="rate-sheet-actions">
          <el-button type="primary" size="small" @click="handleViewRateSheet">
            查看费率单详情
          </el-button>
        </div>
      </el-card>

      <!-- 关联单据 -->
      <el-card class="trace-card">
        <template #header>
          <div class="card-header">
            <span>关联单据</span>
          </div>
        </template>
        <el-table :data="traceData.relatedBills" border size="small">
          <el-table-column prop="billType" label="单据类型" width="120" />
          <el-table-column prop="billNo" label="单据号" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '已结算' ? 'success' : 'info'" size="small">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额" width="120" align="right">
            <template #default="{ row }">
              ¥{{ row.amount?.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button type="primary" link size="small">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const billNo = ref(route.params.id || 'RATE2026040001')

const currentStep = ref(4)

const traceData = reactive({
  documentNo: 'WMS20260426001',
  documentType: '仓储入库单',
  sourceSystem: 'WMS仓储系统',
  completeTime: '2026-04-26 10:30:00',
  customerCode: 'KH001',
  customerName: '深圳市腾讯科技有限公司',
  billingWeight: 5000,
  billingVolume: 25,
  sourceSnapshot: `{
  "order_no": "WMS20260426001",
  "order_type": "inbound",
  "customer_code": "KH001",
  "warehouse_code": "SZWH",
  "weight": 5000,
  "volume": 25,
  "quantity": 1000,
  "complete_time": "2026-04-26 10:30:00"
}`,
  quotation: {
    quotationNo: 'QT2026040001',
    version: 1,
    customerCode: 'KH001',
    businessType: '仓储服务',
    effectiveDate: '2026-04-01',
    expiryDate: '2027-03-31'
  },
  matchedRules: [
    { ruleCode: 'R001', ruleName: '仓储入库费', ruleType: 'income', billingMode: '按数量', priority: 1, calculatedAmount: 2500 },
    { ruleCode: 'R003', ruleName: '仓储租仓费', ruleType: 'income', billingMode: '周期计费', priority: 2, calculatedAmount: 750 },
    { ruleCode: 'R004', ruleName: '燃油附加费', ruleType: 'income', billingMode: '百分比', priority: 3, calculatedAmount: 162.5 }
  ],
  rateSheet: {
    rateSheetNo: 'RATE2026040001',
    customerCode: 'KH001',
    taxExclusiveAmount: 3250,
    taxAmount: 195,
    totalAmount: 3445,
    status: '已审核',
    createTime: '2026-04-26 10:30:05'
  },
  relatedBills: [
    { billType: '应收单', billNo: 'AR2026040001', status: '已结算', amount: 3445 },
    { billType: '对账单', billNo: 'ST2026040012', status: '待发送', amount: 3445 },
    { billType: '发票', billNo: 'INV2026040015', status: '待开票', amount: 3445 }
  ]
})

const handleBack = () => {
  router.back()
}

const handleViewRateSheet = () => {
  ElMessage.info('查看费率单详情')
}
</script>

<style scoped>
.document-trace-container {
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
  align-items: center;
}

.bill-info {
  font-size: 14px;
  color: #909399;
}

.trace-section {
  background: #fff;
  margin: 20px;
  padding: 32px 20px;
  border-radius: 8px;
}

.trace-content {
  padding: 0 20px 20px;
}

.trace-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 14px;
}

.source-snapshot {
  margin-top: 16px;
}

.snapshot-header {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.code-block {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
}

.amount {
  font-weight: 600;
  color: #303133;
}

.amount.total {
  color: #409eff;
  font-size: 16px;
}

.rate-sheet-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}
</style>