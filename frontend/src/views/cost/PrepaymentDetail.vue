<template>
  <div class="prepayment-detail-container">
    <!-- 基本信息 -->
    <div class="detail-section">
      <div class="section-header">
        <h3>预付款基本信息</h3>
        <el-tag :type="getStatusConfig(prepayment.prepaymentStatus).type" size="large">
          {{ getStatusConfig(prepayment.prepaymentStatus).label }}
        </el-tag>
      </div>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="预付款单号">{{ prepayment.prepaymentNo }}</el-descriptions-item>
        <el-descriptions-item label="供应商名称">
          <el-link type="primary">{{ prepayment.supplierName }}</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="供应商账号">{{ prepayment.supplierAccount }}</el-descriptions-item>
        <el-descriptions-item label="预付款公司">{{ prepayment.prepaymentCompany }}</el-descriptions-item>
        <el-descriptions-item label="仓库代码">{{ prepayment.warehouseCode }}</el-descriptions-item>
        <el-descriptions-item label="业务参考编号">{{ prepayment.businessRefNo }}</el-descriptions-item>
        <el-descriptions-item label="费率单编号">{{ prepayment.rateSheetNo }}</el-descriptions-item>
        <el-descriptions-item label="提单号">{{ prepayment.billNo }}</el-descriptions-item>
        <el-descriptions-item label="费用项目">{{ prepayment.expenseItem }}</el-descriptions-item>
        <el-descriptions-item label="币种">{{ prepayment.currency }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ prepayment.applicant }}</el-descriptions-item>
        <el-descriptions-item label="申请日期">{{ formatDateTime(prepayment.applyDate) }}</el-descriptions-item>
        <el-descriptions-item label="预计付款日">
          <span :class="isExpectedOverdue(prepayment) ? 'text-danger' : ''">
            {{ prepayment.expectedPaymentDate }}
            <el-icon v-if="isExpectedOverdue(prepayment)" color="#f56c6c"><WarningFilled /></el-icon>
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="实际付款日">{{ prepayment.paymentDate || '-' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 金额信息 -->
    <div class="detail-section">
      <div class="section-header">
        <h3>金额信息</h3>
      </div>
      <el-descriptions :column="4" border>
        <el-descriptions-item label="预付金额">
          <span class="amount-text">¥{{ formatMoney(prepayment.prepaymentAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="已付金额">
          <span class="text-success">¥{{ formatMoney(prepayment.paidAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="已绑定发票">
          <span :class="prepayment.invoicedAmount >= prepayment.prepaymentAmount ? 'text-success' : 'text-warning'">
            ¥{{ formatMoney(prepayment.invoicedAmount) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="已核销金额">
          <span class="text-success">¥{{ formatMoney(prepayment.writtenOffAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="可用余额">
          <span :class="prepayment.balanceAmount > 0 ? 'text-primary' : 'text-success'">
            ¥{{ formatMoney(prepayment.balanceAmount) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="账龄">
          <span v-if="prepayment.overdueDays > 0" class="text-danger">逾期{{ prepayment.overdueDays }}天</span>
          <span v-else-if="prepayment.balanceAmount > 0">{{ prepayment.agingDays || 0 }}天</span>
          <span v-else class="text-success">-</span>
        </el-descriptions-item>
        <el-descriptions-item label="发票状态">
          <el-tag :type="getInvoiceStatusType(prepayment)" size="small">
            {{ getInvoiceStatusText(prepayment) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="核销状态">
          <el-tag :type="getWriteoffStatusType(prepayment)" size="small">
            {{ getWriteoffStatusText(prepayment) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- Tab区域 -->
    <div class="detail-section">
      <el-tabs v-model="activeTab">
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
          </el-table>
        </el-tab-pane>

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
import { WarningFilled } from '@element-plus/icons-vue'

const props = defineProps<{
  prepaymentId: number
}>()

const activeTab = ref('invoice')

// 预付款数据
const prepayment = ref({
  id: props.prepaymentId,
  prepaymentNo: 'YF2024050001',
  supplierName: '深圳硬件供应商A公司',
  supplierId: 1,
  supplierAccount: '75512345678',
  prepaymentCompany: '总部',
  warehouseCode: 'WH001',
  businessRefNo: 'PO2024040001',
  rateSheetNo: 'FL2024040001',
  billNo: 'BL2024040001',
  expenseItem: '采购成本',
  currency: 'CNY',
  prepaymentAmount: 150000.00,
  paidAmount: 0.00,
  invoicedAmount: 0.00,
  writtenOffAmount: 0.00,
  balanceAmount: 150000.00,
  prepaymentStatus: 'draft',
  invoiceStatus: 'unbinded',
  writeoffStatus: 'unwritten_off',
  applyDate: '2024-04-20 10:30:45',
  expectedPaymentDate: '2024-04-25',
  paymentDate: '',
  agingDays: 5,
  overdueDays: 0,
  applicant: '张三',
  remark: ''
})

// 发票记录
const invoiceRecords = ref([
  {
    id: 1,
    invoiceNo: 'FP2024040001',
    invoiceType: '增值税专用发票',
    invoiceAmount: 50000.00,
    bindAmount: 50000.00,
    bindDate: '2024-04-22',
    invoiceDate: '2024-04-20',
    taxRate: 13
  }
])

// 核销记录
const writeoffRecords = ref([
  {
    id: 1,
    writeoffNo: 'HX2024040001',
    writeoffType: 'order',
    orderNo: 'PO2024030001',
    writeoffAmount: 50000.00,
    writeoffDate: '2024-04-22',
    operator: '张三',
    remark: '按订单核销'
  },
  {
    id: 2,
    writeoffNo: 'HX2024040002',
    writeoffType: 'amount',
    orderNo: '-',
    writeoffAmount: 30000.00,
    writeoffDate: '2024-04-25',
    operator: '李四',
    remark: '按金额核销'
  }
])

// 付款记录
const paymentRecords = ref([
  {
    id: 1,
    paymentNo: 'FK2024040001',
    paymentDate: '2024-04-20',
    paymentAmount: 150000.00,
    paymentMethod: '银行转账',
    bankAccount: '中国建设银行 6217001234567890123',
    transactionNo: 'FT202404200001',
    operator: '财务王五'
  }
])

// 操作日志
const operationLogs = ref([
  {
    operator: '张三',
    action: '创建预付款单',
    type: 'primary',
    content: '创建了预付款单 YF2024050001',
    createTime: '2024-04-20 10:30:45',
    remark: ''
  }
])

// 格式化金额
const formatMoney = (value: number) => {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return dateStr
}

// 获取状态配置
const getStatusConfig = (status: string) => {
  const config: Record<string, { label: string, type: string }> = {
    'draft': { label: '草稿', type: 'info' },
    'pending': { label: '待审核', type: 'warning' },
    'approved': { label: '待付款', type: 'primary' },
    'invoiced': { label: '待关联发票', type: 'primary' },
    'partial_writeoff': { label: '待核销', type: 'warning' },
    'partial': { label: '部分核销', type: 'warning' },
    'written_off': { label: '已核销', type: 'success' }
  }
  return config[status] || { label: status, type: 'info' }
}

// 获取发票状态类型
const getInvoiceStatusType = (row: any) => {
  if (row.invoicedAmount === 0) return 'info'
  if (row.invoicedAmount >= row.prepaymentAmount) return 'success'
  return 'warning'
}

// 获取发票状态文本
const getInvoiceStatusText = (row: any) => {
  if (row.invoicedAmount === 0) return '未绑定'
  if (row.invoicedAmount >= row.prepaymentAmount) return '已全额'
  return '部分绑定'
}

// 获取核销状态类型
const getWriteoffStatusType = (row: any) => {
  if (row.writtenOffAmount === 0) return 'info'
  if (row.writtenOffAmount >= row.paidAmount) return 'success'
  return 'warning'
}

// 获取核销状态文本
const getWriteoffStatusText = (row: any) => {
  if (row.writtenOffAmount === 0) return '未核销'
  if (row.writtenOffAmount >= row.paidAmount) return '已核销'
  return '部分核销'
}

// 是否预期逾期
const isExpectedOverdue = (row: any) => {
  if (!row.expectedPaymentDate || row.paymentDate) return false
  return new Date() > new Date(row.expectedPaymentDate)
}

// 获取日志类型
const getLogType = (action: string) => {
  if (action.includes('通过') || action.includes('成功')) return 'success'
  if (action.includes('驳回') || action.includes('作废')) return 'danger'
  if (action.includes('提交') || action.includes('申请')) return 'warning'
  return 'info'
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
