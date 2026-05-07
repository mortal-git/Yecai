<template>
  <div class="receivable-detail-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-divider direction="vertical" />
        <span class="page-title">应收单详情</span>
      </div>
      <div class="header-right">
        <el-button @click="handlePrint">
          <el-icon><Printer /></el-icon>
          打印
        </el-button>
        <el-button type="primary" @click="handleEdit">编辑</el-button>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="info-container">
      <div class="section-title">基本信息</div>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="应收单号">{{ receivableData.receivableNo }}</el-descriptions-item>
        <el-descriptions-item label="客户名称">{{ receivableData.customerName }}</el-descriptions-item>
        <el-descriptions-item label="关联订单">
          <el-link type="primary" @click="handleViewOrder">{{ receivableData.orderNo || '-' }}</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="关联发票">
          <el-link v-if="receivableData.invoiceId" type="primary" @click="handleViewInvoice">
            {{ receivableData.invoiceNo }}
          </el-link>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="应收金额">
          <span class="amount">¥{{ receivableData.amount.toLocaleString() }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="已收金额">
          <span class="amount success">¥{{ receivableData.receivedAmount.toLocaleString() }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="待收金额">
          <span class="amount warning">¥{{ receivableData.pendingAmount.toLocaleString() }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="到期日期">{{ receivableData.dueDate }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(receivableData.status)" size="small">
            {{ getStatusText(receivableData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="逾期天数" v-if="isOverdue">
          <span class="overdue">{{ receivableData.overdueDays }}天</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ receivableData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ receivableData.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 收款计划 -->
    <div class="plan-container">
      <div class="section-title">收款计划</div>
      <el-table :data="receivableData.collectionPlans" border stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="planDate" label="计划收款日期" width="150" />
        <el-table-column prop="planAmount" label="计划收款金额" width="150" align="right">
          <template #default="{ row }">¥{{ row.planAmount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="收款方式" width="120">
          <template #default="{ row }">
            {{ getPaymentMethodText(row.paymentMethod) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getPlanStatusType(row.status)" size="small">
              {{ getPlanStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 收款记录 -->
    <div class="record-container">
      <div class="section-title">收款记录</div>
      <el-table :data="receivableData.collectionRecords" border stripe>
        <el-table-column prop="collectionNo" label="收款单号" width="160" />
        <el-table-column prop="collectionAmount" label="收款金额" width="120" align="right">
          <template #default="{ row }">¥{{ row.collectionAmount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="actualAmount" label="实际到账" width="120" align="right">
          <template #default="{ row }">¥{{ row.actualAmount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="collectionDate" label="收款日期" width="120" />
        <el-table-column prop="paymentMethod" label="收款方式" width="120">
          <template #default="{ row }">
            {{ getPaymentMethodText(row.paymentMethod) }}
          </template>
        </el-table-column>
        <el-table-column prop="bankAccount" label="收款账户" min-width="150" />
        <el-table-column prop="confirmTime" label="确认时间" width="160" />
      </el-table>
      <el-empty v-if="!receivableData.collectionRecords?.length" description="暂无收款记录" />
    </div>

    <!-- 核销记录 -->
    <div class="record-container">
      <div class="section-title">核销记录</div>
      <el-table :data="receivableData.writeoffRecords" border stripe>
        <el-table-column prop="writeoffNo" label="核销单号" width="160" />
        <el-table-column prop="writeoffAmount" label="核销金额" width="120" align="right">
          <template #default="{ row }">¥{{ row.writeoffAmount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="writeoffDate" label="核销日期" width="120" />
        <el-table-column prop="writeoffType" label="核销类型" width="120">
          <template #default="{ row }">
            {{ getWriteoffTypeText(row.writeoffType) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
      </el-table>
      <el-empty v-if="!receivableData.writeoffRecords?.length" description="暂无核销记录" />
    </div>

    <!-- 操作日志 -->
    <div class="log-container">
      <div class="section-title">操作日志</div>
      <el-timeline>
        <el-timeline-item
          v-for="(log, index) in operationLogs"
          :key="index"
          :timestamp="log.timestamp"
          :type="log.type"
          placement="top"
        >
          <el-card>
            <h4>{{ log.title }}</h4>
            <p>{{ log.content }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Printer } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 应收单数据
const receivableData = reactive({
  receivableNo: 'YS2024040001',
  customerId: 1,
  customerName: '深圳市腾讯科技有限公司',
  orderId: 'DD2024040001',
  orderNo: 'DD2024040001',
  invoiceId: 1,
  invoiceNo: 'FP2024040001',
  amount: 500000,
  receivedAmount: 300000,
  pendingAmount: 200000,
  dueDate: '2024-05-15',
  status: 'partial',
  overdueDays: 0,
  createTime: '2024-04-01 10:30:00',
  remark: '',
  collectionPlans: [
    { planDate: '2024-04-15', planAmount: 300000, paymentMethod: 'bank', remark: '第一期款', status: 'completed' },
    { planDate: '2024-05-15', planAmount: 200000, paymentMethod: 'bank', remark: '尾款', status: 'pending' }
  ],
  collectionRecords: [
    { collectionNo: 'SK2024040001', collectionAmount: 300000, actualAmount: 300000, collectionDate: '2024-04-15', paymentMethod: 'bank', bankAccount: '基本户-中国银行', confirmTime: '2024-04-15 14:30:00' }
  ],
  writeoffRecords: []
})

// 操作日志
const operationLogs = ref([
  { timestamp: '2024-04-01 10:30:00', type: 'primary', title: '创建应收单', content: '系统创建了应收单 YS2024040001' },
  { timestamp: '2024-04-15 14:30:00', type: 'success', title: '收款登记', content: '登记收款 300000 元' }
])

// 计算属性
const isOverdue = computed(() => {
  if (!receivableData.dueDate) return false
  const today = new Date()
  const dueDate = new Date(receivableData.dueDate)
  return today > dueDate && receivableData.pendingAmount > 0
})

// 方法
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'info',
    confirmed: 'success',
    partial: 'warning',
    written_off: 'success',
    partial_writeoff: 'warning',
    overdue: 'danger',
    bad_debt: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    partial: '部分收款',
    written_off: '已核销',
    partial_writeoff: '部分核销',
    overdue: '已逾期',
    bad_debt: '坏账'
  }
  return texts[status] || status
}

const getPaymentMethodText = (method: string) => {
  const texts: Record<string, string> = {
    bank: '银行转账',
    acceptance: '承兑汇票',
    trade_bill: '商业汇票',
    cash: '现金'
  }
  return texts[method] || method
}

const getPlanStatusType = (status: string) => {
  return status === 'completed' ? 'success' : 'info'
}

const getPlanStatusText = (status: string) => {
  return status === 'completed' ? '已完成' : '待执行'
}

const getWriteoffTypeText = (type: string) => {
  const texts: Record<string, string> = {
    advance: '预收款核销',
    offset: '应收冲抵',
    other: '其他核销'
  }
  return texts[type] || type
}

const handleBack = () => {
  router.push('/receivable/list')
}

const handlePrint = () => {
  ElMessage.info('打印应收单')
}

const handleEdit = () => {
  router.push(`/receivable/edit/${receivableData.receivableNo}`)
}

const handleViewOrder = () => {
  router.push(`/order/detail/${receivableData.orderId}`)
}

const handleViewInvoice = () => {
  router.push(`/invoice/detail/${receivableData.invoiceId}`)
}
</script>

<style scoped>
.receivable-detail-container {
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

.info-container,
.plan-container,
.record-container,
.log-container {
  background: #fff;
  margin: 16px 20px;
  padding: 20px;
  border-radius: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 4px solid #409eff;
}

.amount {
  font-weight: 600;
}

.amount.success {
  color: #67c23a;
}

.amount.warning {
  color: #e6a23c;
}

.overdue {
  color: #f56c6c;
  font-weight: 500;
}
</style>
