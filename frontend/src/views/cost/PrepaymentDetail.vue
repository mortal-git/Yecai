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
            <el-table-column prop="paymentMethod" label="付款方式" width="100" />
            <el-table-column prop="bankAccount" label="银行账号" min-width="200" />
            <el-table-column prop="transactionNo" label="银行流水" min-width="150" />
            <el-table-column prop="remark" label="备注" min-width="150" />
            <el-table-column prop="attachment" label="附件" width="120">
              <template #default="scope">
                <el-link v-if="scope.row.attachment" type="primary" @click="handleViewAttachment(scope.row.attachment)">
                  {{ scope.row.attachment.name }}
                </el-link>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="payer" label="付款人" width="100" />
            <el-table-column prop="paymentTime" label="付款时间" width="160" />
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
          <el-table :data="[writeoffRecords[0]]" border stripe v-if="writeoffRecords.length > 0">
            <el-table-column prop="rateSheetNo" label="费率单" min-width="150" />
            <el-table-column prop="businessRefNo" label="业务参考编号" min-width="150" />
            <el-table-column prop="incomeItem" label="收入项目" min-width="120" />
            <el-table-column prop="remark" label="备注" min-width="150" />
            <el-table-column prop="operator" label="核销人" width="100" />
            <el-table-column prop="writeoffDate" label="核销时间" width="160" />
          </el-table>
          <el-empty v-else description="暂无核销记录" />
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
import { WarningFilled, Minus } from '@element-plus/icons-vue'

const props = defineProps<{
  prepaymentId: number
}>()

const activeTab = ref('payment')

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
  expenseItem: '仓储费',
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
    rateSheetNo: 'FL2024040001',
    businessRefNo: 'PO2024030001',
    incomeItem: '仓储费',
    remark: '按订单核销',
    operator: '张三',
    writeoffDate: '2024-04-22 10:30:00'
  }
])

// 付款记录
const paymentRecords = ref([
  {
    id: 1,
    paymentMethod: '银行转账',
    bankAccount: '中国建设银行 6217001234567890123',
    transactionNo: 'FT202404200001',
    remark: '预付款首期款项',
    attachment: { name: '付款凭证.pdf', url: '/files/voucher1.pdf' },
    payer: '财务王五',
    paymentTime: '2024-04-20 14:30:25'
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
  },
  {
    operator: '张三',
    action: '提交审核',
    type: 'warning',
    content: '提交预付款单 YF2024050001 待审核',
    createTime: '2024-04-20 11:00:00',
    remark: ''
  },
  {
    operator: '李四',
    action: '审核驳回',
    type: 'danger',
    content: '驳回预付款单 YF2024050001',
    createTime: '2024-04-20 13:00:00',
    remark: '附件不完整，请补充合同扫描件'
  },
  {
    operator: '张三',
    action: '重新提交审核',
    type: 'warning',
    content: '重新提交预付款单 YF2024050001 待审核',
    createTime: '2024-04-20 13:30:00',
    remark: '已补充合同扫描件'
  },
  {
    operator: '李四',
    action: '审核通过',
    type: 'success',
    content: '审核通过预付款单 YF2024050001',
    createTime: '2024-04-20 14:00:00',
    remark: '资料完整，同意付款'
  },
  {
    operator: '王五',
    action: '付款登记',
    type: 'primary',
    content: '登记预付款单 YF2024050001 付款信息',
    createTime: '2024-04-20 14:30:25',
    remark: '银行转账150000元'
  },
  {
    operator: '张三',
    action: '绑定发票',
    type: 'primary',
    content: '绑定发票 FP2024040001 到预付款单 YF2024050001',
    createTime: '2024-04-22 09:15:00',
    remark: '绑定金额50000元'
  },
  {
    operator: '张三',
    action: '核销',
    type: 'success',
    content: '核销预付款单 YF2024050001',
    createTime: '2024-04-22 10:30:00',
    remark: '按订单核销50000元'
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

// 查看附件
const handleViewAttachment = (file: { name: string, url: string }) => {
  window.open(file.url, '_blank')
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
