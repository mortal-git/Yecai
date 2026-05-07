<template>
  <div class="prepayment-detail-container">
    <!-- 基本信息 -->
    <div class="detail-section">
      <div class="section-header">
        <h3>预付款基本信息</h3>
        <el-tag :type="getStatusType(prepayment.status)" size="large">
          {{ getStatusLabel(prepayment.status) }}
        </el-tag>
      </div>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="预付款单号">{{ prepayment.prepaymentNo }}</el-descriptions-item>
        <el-descriptions-item label="供应商名称">
          <el-link type="primary">{{ prepayment.supplierName }}</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="业务类型">{{ getBusinessTypeLabel(prepayment.businessType) }}</el-descriptions-item>
        <el-descriptions-item label="预付金额">
          <span class="amount-text">¥{{ formatMoney(prepayment.prepaymentAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="已付金额">
          <span class="text-success">¥{{ formatMoney(prepayment.paidAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="可用余额">
          <span class="text-primary">¥{{ formatMoney(prepayment.balanceAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="已绑定发票金额">
          <span :class="prepayment.invoicedAmount >= prepayment.prepaymentAmount ? 'text-success' : 'text-warning'">
            ¥{{ formatMoney(prepayment.invoicedAmount) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="已核销金额">
          <span class="text-success">¥{{ formatMoney(prepayment.writtenOffAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="申请日期">{{ prepayment.applyDate }}</el-descriptions-item>
        <el-descriptions-item label="预计付款日">
          <span :class="isOverdue(prepayment.expectedPaymentDate, prepayment.paymentDate) ? 'text-danger' : ''">
            {{ prepayment.expectedPaymentDate }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="实际付款日">{{ prepayment.paymentDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ prepayment.applicant }}</el-descriptions-item>
        <el-descriptions-item label="收款账户">{{ prepayment.bankAccount }}</el-descriptions-item>
        <el-descriptions-item label="付款事由" :span="2">{{ prepayment.paymentReason }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="3">{{ prepayment.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 金额汇总 -->
    <div class="detail-section">
      <div class="section-header">
        <h3>金额汇总</h3>
      </div>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="amount-card">
            <div class="amount-label">预付金额</div>
            <div class="amount-value">¥{{ formatMoney(prepayment.prepaymentAmount) }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="amount-card">
            <div class="amount-label">已付金额</div>
            <div class="amount-value text-success">¥{{ formatMoney(prepayment.paidAmount) }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="amount-card">
            <div class="amount-label">已核销金额</div>
            <div class="amount-value text-warning">¥{{ formatMoney(prepayment.writtenOffAmount) }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="amount-card">
            <div class="amount-label">可用余额</div>
            <div class="amount-value text-primary">¥{{ formatMoney(prepayment.balanceAmount) }}</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Tab区域 -->
    <div class="detail-section">
      <el-tabs v-model="activeTab">
        <!-- 发票记录 -->
        <el-tab-pane label="发票记录" name="invoice">
          <el-table :data="invoiceRecords" border stripe>
            <el-table-column prop="invoiceNo" label="发票号" min-width="150" />
            <el-table-column prop="invoiceType" label="发票类型" width="120" />
            <el-table-column prop="invoiceAmount" label="发票金额" width="130" align="right">
              <template #default="scope">¥{{ formatMoney(scope.row.invoiceAmount) }}</template>
            </el-table-column>
            <el-table-column prop="bindAmount" label="绑定金额" width="130" align="right">
              <template #default="scope">¥{{ formatMoney(scope.row.bindAmount) }}</template>
            </el-table-column>
            <el-table-column prop="bindDate" label="绑定日期" width="120" />
            <el-table-column prop="invoiceDate" label="开票日期" width="120" />
            <el-table-column prop="taxRate" label="税率" width="80" align="right">
              <template #default="scope">{{ scope.row.taxRate }}%</template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button type="primary" size="small" link>查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 核销记录 -->
        <el-tab-pane label="核销记录" name="writeoff">
          <el-table :data="writeoffRecords" border stripe>
            <el-table-column prop="writeoffNo" label="核销单号" min-width="150" />
            <el-table-column prop="writeoffType" label="核销方式" width="120">
              <template #default="scope">
                {{ scope.row.writeoffType === 'order' ? '按订单核销' : '按金额核销' }}
              </template>
            </el-table-column>
            <el-table-column prop="orderNo" label="关联订单" min-width="150" />
            <el-table-column prop="writeoffAmount" label="核销金额" width="130" align="right">
              <template #default="scope">¥{{ formatMoney(scope.row.writeoffAmount) }}</template>
            </el-table-column>
            <el-table-column prop="writeoffDate" label="核销日期" width="120" />
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column prop="remark" label="核销说明" min-width="150" />
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button type="primary" size="small" link>查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 付款记录 -->
        <el-tab-pane label="付款记录" name="payment">
          <el-table :data="paymentRecords" border stripe>
            <el-table-column prop="paymentNo" label="付款单号" min-width="150" />
            <el-table-column prop="paymentDate" label="付款日期" width="120" />
            <el-table-column prop="paymentAmount" label="付款金额" width="130" align="right">
              <template #default="scope">¥{{ formatMoney(scope.row.paymentAmount) }}</template>
            </el-table-column>
            <el-table-column prop="paymentMethod" label="付款方式" width="120" />
            <el-table-column prop="bankAccount" label="付款账户" min-width="180" />
            <el-table-column prop="transactionNo" label="交易流水号" min-width="150" />
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button type="primary" size="small" link>查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 操作日志 -->
        <el-tab-pane label="操作日志" name="log">
          <el-timeline>
            <el-timeline-item
              v-for="(log, index) in operationLogs"
              :key="index"
              :timestamp="log.createTime"
              placement="top"
            >
              <el-card>
                <template #header>
                  <div class="card-header">
                    <span>{{ log.operator }}</span>
                    <el-tag :type="getLogType(log.action)">{{ log.action }}</el-tag>
                  </div>
                </template>
                <p>{{ log.content }}</p>
                <p v-if="log.remark" class="log-remark">备注：{{ log.remark }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  prepaymentId: number
}>()

const activeTab = ref('invoice')

// 预付款数据
const prepayment = ref({
  id: props.prepaymentId,
  prepaymentNo: 'YF2024040001',
  supplierName: '深圳硬件供应商A公司',
  supplierId: 1,
  businessType: 'purchase',
  prepaymentAmount: 100000.00,
  paidAmount: 100000.00,
  invoicedAmount: 100000.00,
  writtenOffAmount: 60000.00,
  balanceAmount: 40000.00,
  status: 'invoiced',
  applyDate: '2024-02-01',
  expectedPaymentDate: '2024-02-05',
  paymentDate: '2024-02-04',
  applicant: '张三',
  bankAccount: '中国建设银行 6217001234567890123',
  paymentReason: '服务器采购预付款30%',
  remark: ''
})

// 发票记录
const invoiceRecords = ref([
  {
    id: 1,
    invoiceNo: 'FP2024020001',
    invoiceType: '增值税专用发票',
    invoiceAmount: 60000.00,
    bindAmount: 60000.00,
    bindDate: '2024-02-06',
    invoiceDate: '2024-01-28',
    taxRate: 13
  },
  {
    id: 2,
    invoiceNo: 'FP2024020002',
    invoiceType: '增值税专用发票',
    invoiceAmount: 40000.00,
    bindAmount: 40000.00,
    bindDate: '2024-02-06',
    invoiceDate: '2024-01-30',
    taxRate: 13
  }
])

// 核销记录
const writeoffRecords = ref([
  {
    id: 1,
    writeoffNo: 'HX2024020001',
    writeoffType: 'order',
    orderNo: 'PO2024010001',
    writeoffAmount: 60000.00,
    writeoffDate: '2024-02-10',
    operator: '张三',
    remark: '采购订单核销'
  }
])

// 付款记录
const paymentRecords = ref([
  {
    id: 1,
    paymentNo: 'FK2024020001',
    paymentDate: '2024-02-04',
    paymentAmount: 100000.00,
    paymentMethod: '银行转账',
    bankAccount: '中国建设银行 6217001234567890123',
    transactionNo: 'FT202402040001',
    operator: '财务李四'
  }
])

// 操作日志
const operationLogs = ref([
  {
    operator: '张三',
    action: '创建预付款单',
    type: 'primary',
    content: '创建了预付款单 YF2024040001',
    createTime: '2024-02-01 10:30:00',
    remark: ''
  },
  {
    operator: '张三',
    action: '提交审核',
    type: 'warning',
    content: '提交了预付款审核申请',
    createTime: '2024-02-01 10:35:00',
    remark: ''
  },
  {
    operator: '部门经理',
    action: '审核通过',
    type: 'success',
    content: '审核通过预付款申请',
    createTime: '2024-02-01 14:20:00',
    remark: '同意付款'
  },
  {
    operator: '财务李四',
    action: '审核通过',
    type: 'success',
    content: '财务审核通过',
    createTime: '2024-02-01 16:00:00',
    remark: ''
  },
  {
    operator: '出纳王五',
    action: '付款成功',
    type: 'success',
    content: '完成付款100000.00元',
    createTime: '2024-02-04 11:30:00',
    remark: '银行转账'
  }
])

// 格式化金额
const formatMoney = (value: number) => {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

// 获取业务类型标签
const getBusinessTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    'purchase': '采购类',
    'service': '服务类',
    'deposit': '保证金类'
  }
  return map[type] || type
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    'draft': '草稿',
    'pending': '待审核',
    'approved': '已审核',
    'paid': '已付款',
    'invoiced': '已开票',
    'written_off': '已核销',
    'partial_writeoff': '部分核销',
    'rejected': '已驳回',
    'cancelled': '已作废'
  }
  return map[status] || status
}

// 获取状态类型
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    'draft': 'info',
    'pending': 'warning',
    'approved': 'primary',
    'paid': 'success',
    'invoiced': 'success',
    'written_off': 'success',
    'partial_writeoff': 'warning',
    'rejected': 'danger',
    'cancelled': 'info'
  }
  return map[status] || 'info'
}

// 获取日志类型
const getLogType = (action: string) => {
  if (action.includes('通过') || action.includes('成功')) return 'success'
  if (action.includes('驳回') || action.includes('作废')) return 'danger'
  if (action.includes('提交') || action.includes('申请')) return 'warning'
  return 'info'
}

// 判断是否逾期
const isOverdue = (expectedDate: string, paymentDate: string) => {
  if (!expectedDate || paymentDate) return false
  return new Date() > new Date(expectedDate)
}

onMounted(() => {
  // 加载预付款详情数据
})
</script>

<style scoped>
.prepayment-detail-container {
  padding: 0;
}

.detail-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.amount-text {
  color: #303133;
  font-weight: 500;
}

.text-success { color: #67c23a; }
.text-warning { color: #e6a23c; }
.text-danger { color: #f56c6c; }
.text-primary { color: #409eff; }

.amount-card {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
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

.amount-value.text-success { color: #67c23a; }
.amount-value.text-warning { color: #e6a23c; }
.amount-value.text-primary { color: #409eff; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-remark {
  color: #909399;
  font-size: 14px;
  margin-top: 8px;
}
</style>
