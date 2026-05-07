<template>
  <div class="payable-detail-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-divider direction="vertical" />
        <span class="page-title">应付单详情</span>
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
        <el-descriptions-item label="应付单号">{{ payableData.payableNo }}</el-descriptions-item>
        <el-descriptions-item label="供应商名称">{{ payableData.supplierName }}</el-descriptions-item>
        <el-descriptions-item label="关联订单">
          <el-link type="primary" @click="handleViewOrder">{{ payableData.orderNo || '-' }}</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="关联发票">
          <el-link v-if="payableData.invoiceId" type="primary" @click="handleViewInvoice">
            {{ payableData.invoiceNo }}
          </el-link>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="应付金额">
          <span class="amount">¥{{ payableData.amount.toLocaleString() }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="已付金额">
          <span class="amount success">¥{{ payableData.paidAmount.toLocaleString() }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="待付金额">
          <span class="amount warning">¥{{ payableData.pendingAmount.toLocaleString() }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="到期日期">{{ payableData.dueDate }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(payableData.status)" size="small">
            {{ getStatusText(payableData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="逾期天数" v-if="isOverdue">
          <span class="overdue">{{ payableData.overdueDays }}天</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ payableData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ payableData.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 付款计划 -->
    <div class="plan-container">
      <div class="section-title">付款计划</div>
      <el-table :data="payableData.paymentPlans" border stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="planDate" label="计划付款日期" width="150" />
        <el-table-column prop="planAmount" label="计划付款金额" width="150" align="right">
          <template #default="{ row }">¥{{ row.planAmount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="付款方式" width="120">
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

    <!-- 付款记录 -->
    <div class="record-container">
      <div class="section-title">付款记录</div>
      <el-table :data="payableData.paymentRecords" border stripe>
        <el-table-column prop="paymentNo" label="付款单号" width="160" />
        <el-table-column prop="paymentAmount" label="付款金额" width="120" align="right">
          <template #default="{ row }">¥{{ row.paymentAmount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="actualAmount" label="实际付出" width="120" align="right">
          <template #default="{ row }">¥{{ row.actualAmount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="paymentDate" label="付款日期" width="120" />
        <el-table-column prop="paymentMethod" label="付款方式" width="120">
          <template #default="{ row }">
            {{ getPaymentMethodText(row.paymentMethod) }}
          </template>
        </el-table-column>
        <el-table-column prop="bankAccount" label="付款账户" min-width="150" />
        <el-table-column prop="confirmTime" label="确认时间" width="160" />
      </el-table>
      <el-empty v-if="!payableData.paymentRecords?.length" description="暂无付款记录" />
    </div>

    <!-- 核销记录 -->
    <div class="record-container">
      <div class="section-title">核销记录</div>
      <el-table :data="payableData.writeoffRecords" border stripe>
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
      <el-empty v-if="!payableData.writeoffRecords?.length" description="暂无核销记录" />
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

// 应付单数据
const payableData = reactive({
  payableNo: 'YF2024040001',
  supplierId: 1,
  supplierName: '深圳硬件供应商A公司',
  orderId: 'DD2024040010',
  orderNo: 'DD2024040010',
  invoiceId: 1,
  invoiceNo: 'FP2024040010',
  amount: 300000,
  paidAmount: 200000,
  pendingAmount: 100000,
  dueDate: '2024-05-20',
  status: 'partial',
  overdueDays: 0,
  createTime: '2024-04-05 10:30:00',
  remark: '',
  paymentPlans: [
    { planDate: '2024-04-20', planAmount: 200000, paymentMethod: 'bank', remark: '第一期款', status: 'completed' },
    { planDate: '2024-05-20', planAmount: 100000, paymentMethod: 'bank', remark: '尾款', status: 'pending' }
  ],
  paymentRecords: [
    { paymentNo: 'FK2024040001', paymentAmount: 200000, actualAmount: 200000, paymentDate: '2024-04-20', paymentMethod: 'bank', bankAccount: '基本户-中国银行', confirmTime: '2024-04-20 14:30:00' }
  ],
  writeoffRecords: []
})

// 操作日志
const operationLogs = ref([
  { timestamp: '2024-04-05 10:30:00', type: 'primary', title: '创建应付单', content: '系统创建了应付单 YF2024040001' },
  { timestamp: '2024-04-20 14:30:00', type: 'success', title: '付款登记', content: '登记付款 200000 元' }
])

// 计算属性
const isOverdue = computed(() => {
  if (!payableData.dueDate) return false
  const today = new Date()
  const dueDate = new Date(payableData.dueDate)
  return today > dueDate && payableData.pendingAmount > 0
})

// 方法
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'info',
    confirmed: 'success',
    partial: 'warning',
    written_off: 'success',
    partial_writeoff: 'warning',
    overdue: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    partial: '部分付款',
    written_off: '已核销',
    partial_writeoff: '部分核销',
    overdue: '已逾期'
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
    advance: '预付款核销',
    offset: '应付冲抵',
    other: '其他核销'
  }
  return texts[type] || type
}

const handleBack = () => {
  router.push('/payable/list')
}

const handlePrint = () => {
  ElMessage.info('打印应付单')
}

const handleEdit = () => {
  router.push(`/payable/edit/${payableData.payableNo}`)
}

const handleViewOrder = () => {
  router.push(`/order/detail/${payableData.orderId}`)
}

const handleViewInvoice = () => {
  router.push(`/invoice/detail/${payableData.invoiceId}`)
}
</script>

<style scoped>
.payable-detail-container {
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
