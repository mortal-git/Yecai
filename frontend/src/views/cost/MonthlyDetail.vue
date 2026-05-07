<template>
  <div class="monthly-detail-container">
    <!-- 基本信息区域 -->
    <div class="detail-section">
      <div class="section-header">
        <h3>月结成本基本信息</h3>
        <div class="section-actions">
          <el-tag :type="auditStatusMap[costInfo.auditStatus].type" size="large" style="margin-right: 10px">
            {{ auditStatusMap[costInfo.auditStatus].label }}
          </el-tag>
          <el-tag :type="paymentStatusMap[costInfo.paymentStatus].type" size="large">
            {{ paymentStatusMap[costInfo.paymentStatus].label }}
          </el-tag>
        </div>
      </div>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="成本单号">{{ costInfo.costNo }}</el-descriptions-item>
        <el-descriptions-item label="结算月份">{{ costInfo.settleMonth }}</el-descriptions-item>
        <el-descriptions-item label="供应商名称">{{ costInfo.supplierName }}</el-descriptions-item>
        <el-descriptions-item label="供应商账单号">{{ costInfo.billNo }}</el-descriptions-item>
        <el-descriptions-item label="账单日期">{{ costInfo.billDate }}</el-descriptions-item>
        <el-descriptions-item label="关联订单数">{{ costInfo.orderCount }} 个</el-descriptions-item>
        <el-descriptions-item label="成本总额">
          <span class="amount-text">¥{{ formatMoney(costInfo.costAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="已付金额">
          <span class="paid-text">¥{{ formatMoney(costInfo.paidAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="未付金额">
          <span class="unpaid-text">¥{{ formatMoney(costInfo.unpaidAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ costInfo.createTime }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ costInfo.creator }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ costInfo.auditTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核人">{{ costInfo.auditor || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="3">{{ costInfo.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 关联订单明细 -->
    <div class="detail-section">
      <div class="section-header">
        <h3>关联订单明细</h3>
      </div>
      <el-table :data="orderItems" border stripe>
        <el-table-column prop="orderNo" label="订单编号" min-width="160" />
        <el-table-column prop="orderType" label="订单类型" width="100" :formatter="formatOrderType" />
        <el-table-column prop="customerName" label="客户名称" min-width="180" />
        <el-table-column prop="orderAmount" label="订单金额" width="140" align="right" :formatter="formatMoney" />
        <el-table-column prop="costAmount" label="本次分摊成本" width="140" align="right" :formatter="formatMoney" />
        <el-table-column prop="orderDate" label="订单日期" width="120" />
        <el-table-column prop="orderStatus" label="订单状态" width="110" :formatter="formatOrderStatus" />
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button type="primary" size="small" link @click="viewOrder(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 成本明细 -->
    <div class="detail-section">
      <div class="section-header">
        <h3>成本明细</h3>
      </div>
      <el-table :data="costItems" border stripe>
        <el-table-column prop="itemName" label="费用名称" min-width="150" />
        <el-table-column prop="expenseType" label="费用类型" width="120" />
        <el-table-column prop="spec" label="规格说明" min-width="150" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="quantity" label="数量" width="100" align="right" />
        <el-table-column prop="unitPrice" label="单价" width="120" align="right" :formatter="formatMoney" />
        <el-table-column prop="amount" label="金额" width="120" align="right" :formatter="formatMoney" />
        <el-table-column prop="taxRate" label="税率" width="80" align="right">
          <template #default="scope">{{ scope.row.taxRate }}%</template>
        </el-table-column>
        <el-table-column prop="taxAmount" label="税额" width="120" align="right" :formatter="formatMoney" />
        <el-table-column prop="totalAmount" label="价税合计" width="140" align="right" :formatter="formatMoney" />
        <el-table-column prop="remark" label="备注" min-width="150" />
      </el-table>

      <!-- 合计行 -->
      <div class="total-row">
        <div class="total-item">
          <span class="label">总金额：</span>
          <span class="value">¥{{ formatMoney(totalAmount) }}</span>
        </div>
        <div class="total-item">
          <span class="label">总税额：</span>
          <span class="value">¥{{ formatMoney(totalTax) }}</span>
        </div>
        <div class="total-item">
          <span class="label">价税合计：</span>
          <span class="value total">¥{{ formatMoney(totalAmount + totalTax) }}</span>
        </div>
      </div>
    </div>

    <!-- 关联信息标签页 -->
    <div class="detail-section">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="关联发票" name="invoice">
          <el-table :data="relatedInvoices" border stripe>
            <el-table-column prop="invoiceNo" label="发票编号" min-width="160" />
            <el-table-column prop="invoiceType" label="发票类型" width="120" />
            <el-table-column prop="invoiceCode" label="发票代码" width="140" />
            <el-table-column prop="invoiceNumber" label="发票号码" width="120" />
            <el-table-column prop="invoiceAmount" label="发票金额" width="140" align="right" :formatter="formatMoney" />
            <el-table-column prop="invoiceDate" label="开票日期" width="120" />
            <el-table-column prop="verifyStatus" label="查验状态" width="100" :formatter="formatVerifyStatus" />
            <el-table-column prop="authStatus" label="认证状态" width="100" :formatter="formatAuthStatus" />
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button type="primary" size="small" link @click="viewInvoice(scope.row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="付款记录" name="payment">
          <el-table :data="paymentRecords" border stripe>
            <el-table-column prop="paymentNo" label="付款单号" min-width="160" />
            <el-table-column prop="paymentDate" label="付款日期" width="120" />
            <el-table-column prop="paymentType" label="付款方式" width="120" />
            <el-table-column prop="paymentAmount" label="付款金额" width="140" align="right" :formatter="formatMoney" />
            <el-table-column prop="bankAccount" label="付款账户" min-width="180" />
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column prop="remark" label="备注" min-width="150" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="附件信息" name="attachment">
          <el-upload
            :file-list="attachments"
            list-type="text"
            :disabled="true"
          >
            <template #file="scope">
              <div class="attachment-item">
                <el-icon class="attachment-icon"><Document /></el-icon>
                <span class="attachment-name">{{ scope.file.name }}</span>
                <span class="attachment-size">{{ formatFileSize(scope.file.size) }}</span>
                <div class="attachment-actions">
                  <el-button type="primary" size="small" @click="downloadAttachment(scope.file)">下载</el-button>
                  <el-button type="default" size="small" @click="previewAttachment(scope.file)">预览</el-button>
                </div>
              </div>
            </template>
          </el-upload>
        </el-tab-pane>

        <el-tab-pane label="审批记录" name="audit">
          <el-timeline>
            <el-timeline-item
              v-for="log in auditLogs"
              :key="log.id"
              :timestamp="log.createTime"
              placement="top"
            >
              <el-card>
                <template #header>
                  <div class="card-header">
                    <span>{{ log.operator }}</span>
                    <el-tag :type="log.type">{{ log.action }}</el-tag>
                  </div>
                </template>
                <p>{{ log.content }}</p>
                <p v-if="log.remark" class="log-remark">意见：{{ log.remark }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>

        <el-tab-pane label="操作日志" name="log">
          <el-timeline>
            <el-timeline-item
              v-for="log in operationLogs"
              :key="log.id"
              :timestamp="log.createTime"
              placement="top"
            >
              <el-card>
                <template #header>
                  <div class="card-header">
                    <span>{{ log.operator }}</span>
                    <el-tag :type="log.type">{{ log.action }}</el-tag>
                  </div>
                </template>
                <p>{{ log.content }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 底部操作栏 -->
    <div class="detail-footer">
      <el-button @click="handleClose">关闭</el-button>
      <el-button v-if="['draft', 'rejected'].includes(costInfo.auditStatus)" type="primary" @click="handleEdit">编辑</el-button>
      <el-button v-if="costInfo.auditStatus === 'draft'" type="success" @click="handleSubmit">提交审核</el-button>
      <el-button v-if="costInfo.auditStatus === 'approved' && costInfo.paymentStatus !== 'paid'" type="warning" @click="handlePayment">发起付款</el-button>
      <el-button v-if="costInfo.auditStatus === 'pending'" type="danger" @click="handleCancel">作废</el-button>
      <el-button type="info" @click="handlePrint">打印</el-button>
    </div>

    <!-- 预览附件对话框 -->
    <el-dialog v-model="showPreview" title="附件预览" width="80%">
      <div class="preview-container">
        <img v-if="previewFile?.type?.startsWith('image/')" :src="previewFile.url" alt="预览" />
        <embed v-else-if="previewFile?.type === 'application/pdf'" :src="previewFile.url" type="application/pdf" width="100%" height="600px" />
        <div v-else class="preview-unsupported">
          <el-icon class="large-icon"><Document /></el-icon>
          <p>该文件类型不支持预览，请下载后查看</p>
          <el-button type="primary" @click="downloadAttachment(previewFile)">下载文件</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps<{
  costId: number
}>()

const emit = defineEmits<{
  close: []
}>()

const activeTab = ref('invoice')
const showPreview = ref(false)
const previewFile = ref<any>(null)

// 状态映射
const auditStatusMap: Record<string, { label: string, type: string }> = {
  'draft': { label: '草稿', type: 'info' },
  'pending': { label: '待审核', type: 'warning' },
  'approved': { label: '审核通过', type: 'success' },
  'rejected': { label: '审核驳回', type: 'danger' },
  'cancelled': { label: '已作废', type: 'info' }
}

const paymentStatusMap: Record<string, { label: string, type: string }> = {
  'unpaid': { label: '未付款', type: 'danger' },
  'partial': { label: '部分付款', type: 'warning' },
  'paid': { label: '已付款', type: 'success' }
}

// 成本基本信息
const costInfo = ref({
  id: props.costId,
  costNo: 'YJ2024010001',
  settleMonth: '2024-01',
  supplierName: '上海电子有限公司',
  billNo: 'SH20240100123',
  billDate: '2024-01-31',
  orderCount: 3,
  costAmount: 128500.00,
  paidAmount: 64250.00,
  unpaidAmount: 64250.00,
  auditStatus: 'approved',
  paymentStatus: 'partial',
  createTime: '2024-02-01 10:30:00',
  creator: '张三',
  auditTime: '2024-02-02 14:20:00',
  auditor: '财务主管',
  remark: '2024年1月服务器采购及运维服务费用'
})

// 关联订单明细
const orderItems = ref([
  {
    id: 1,
    orderNo: 'SO202401010001',
    orderType: 'sale',
    customerName: '北京科技有限公司',
    orderAmount: 128000.00,
    costAmount: 58000.00,
    orderDate: '2024-01-01',
    orderStatus: 'executing'
  },
  {
    id: 2,
    orderNo: 'SO202401050003',
    orderType: 'sale',
    customerName: '广州电子有限公司',
    orderAmount: 256000.00,
    costAmount: 45000.00,
    orderDate: '2024-01-05',
    orderStatus: 'pending'
  },
  {
    id: 3,
    orderNo: 'PO202401100005',
    orderType: 'purchase',
    customerName: '深圳信息技术有限公司',
    orderAmount: 86000.00,
    costAmount: 25500.00,
    orderDate: '2024-01-10',
    orderStatus: 'completed'
  }
])

// 成本明细
const costItems = ref([
  {
    id: 1,
    itemName: '服务器硬件',
    expenseType: '采购成本',
    spec: 'Intel Xeon 32G 1T SSD',
    unit: '台',
    quantity: 2,
    unitPrice: 35000.00,
    amount: 70000.00,
    taxRate: 13,
    taxAmount: 9100.00,
    totalAmount: 79100.00,
    remark: ''
  },
  {
    id: 2,
    itemName: '操作系统授权',
    expenseType: '软件成本',
    spec: 'Windows Server 2022 Standard',
    unit: '套',
    quantity: 2,
    unitPrice: 4500.00,
    amount: 9000.00,
    taxRate: 13,
    taxAmount: 1170.00,
    totalAmount: 10170.00,
    remark: ''
  },
  {
    id: 3,
    itemName: '运维服务费',
    expenseType: '服务成本',
    spec: '2024年1月服务器运维服务',
    unit: '项',
    quantity: 1,
    unitPrice: 35000.00,
    amount: 35000.00,
    taxRate: 6,
    taxAmount: 2100.00,
    totalAmount: 37100.00,
    remark: ''
  }
])

// 关联发票
const relatedInvoices = ref([
  {
    id: 1,
    invoiceNo: 'FP202401310001',
    invoiceType: '增值税专用发票',
    invoiceCode: '3100234560',
    invoiceNumber: '98765432',
    invoiceAmount: 79100.00,
    invoiceDate: '2024-01-31',
    verifyStatus: 'verified',
    authStatus: 'authed'
  },
  {
    id: 2,
    invoiceNo: 'FP202401310002',
    invoiceType: '增值税专用发票',
    invoiceCode: '3100234560',
    invoiceNumber: '98765433',
    invoiceAmount: 47270.00,
    invoiceDate: '2024-01-31',
    verifyStatus: 'verified',
    authStatus: 'authed'
  }
])

// 付款记录
const paymentRecords = ref([
  {
    id: 1,
    paymentNo: 'FK202402050001',
    paymentDate: '2024-02-05',
    paymentType: '银行转账',
    paymentAmount: 64250.00,
    bankAccount: '中国工商银行 6222081202001234567',
    operator: '财务李四',
    remark: '50%预付款'
  }
])

// 附件信息
const attachments = ref([
  {
    id: 1,
    name: '供应商对账单.pdf',
    size: 1256000,
    type: 'application/pdf',
    url: 'https://picsum.photos/seed/pdf/800/600.pdf'
  },
  {
    id: 2,
    name: '发票扫描件.zip',
    size: 8560000,
    type: 'application/zip',
    url: '#'
  },
  {
    id: 3,
    name: '费用明细.xlsx',
    size: 256000,
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    url: '#'
  }
])

// 审批记录
const auditLogs = ref([
  {
    id: 1,
    operator: '张三',
    action: '提交审核',
    type: 'warning',
    content: '提交了月结成本审核申请',
    createTime: '2024-02-01 10:35:00',
    remark: ''
  },
  {
    id: 2,
    operator: '部门经理',
    action: '审核通过',
    type: 'success',
    content: '部门经理审核通过',
    createTime: '2024-02-01 16:40:00',
    remark: '费用合理，同意'
  },
  {
    id: 3,
    operator: '财务主管',
    action: '审核通过',
    type: 'success',
    content: '财务审核通过，可安排付款',
    createTime: '2024-02-02 14:20:00',
    remark: '发票核验无误，金额正确'
  }
])

// 操作日志
const operationLogs = ref([
  {
    id: 1,
    operator: '张三',
    action: '创建',
    type: 'primary',
    content: '创建了月结成本单',
    createTime: '2024-02-01 10:30:00'
  },
  {
    id: 2,
    operator: '张三',
    action: '修改',
    type: 'primary',
    content: '修改了成本明细',
    createTime: '2024-02-01 10:32:00'
  },
  {
    id: 3,
    operator: '张三',
    action: '提交审核',
    type: 'warning',
    content: '提交审核',
    createTime: '2024-02-01 10:35:00'
  }
])

// 计算合计
const totalAmount = computed(() => {
  return costItems.value.reduce((sum, item) => sum + item.amount, 0)
})

const totalTax = computed(() => {
  return costItems.value.reduce((sum, item) => sum + item.taxAmount, 0)
})

// 格式化金额
const formatMoney = (value: number) => {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

// 格式化文件大小
const formatFileSize = (size: number) => {
  if (size < 1024) return size + ' B'
  else if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  else if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB'
  else return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

// 格式化订单类型
const formatOrderType = (row: any) => {
  return row.orderType === 'sale' ? '销售订单' : '采购订单'
}

// 格式化订单状态
const formatOrderStatus = (row: any) => {
  const statusMap: Record<string, string> = {
    'draft': '草稿',
    'pending': '待审核',
    'approved': '已生效',
    'executing': '执行中',
    'completed': '已完成',
    'cancelled': '已作废'
  }
  return statusMap[row.orderStatus] || row.orderStatus
}

// 格式化查验状态
const formatVerifyStatus = (row: any) => {
  const statusMap: Record<string, { label: string, type: string }> = {
    'unverified': { label: '未查验', type: 'info' },
    'verified': { label: '已查验', type: 'success' },
    'failed': { label: '查验失败', type: 'danger' }
  }
  const status = statusMap[row.verifyStatus] || { label: row.verifyStatus, type: 'info' }
  return h(ElTag, { type: status.type as any }, () => status.label)
}

// 格式化认证状态
const formatAuthStatus = (row: any) => {
  const statusMap: Record<string, { label: string, type: string }> = {
    'unauthed': { label: '未认证', type: 'info' },
    'authed': { label: '已认证', type: 'success' },
    'failed': { label: '认证失败', type: 'danger' }
  }
  const status = statusMap[row.authStatus] || { label: row.authStatus, type: 'info' }
  return h(ElTag, { type: status.type as any }, () => status.label)
}

// 查看订单
const viewOrder = (row: any) => {
  router.push(`/order/detail/${row.id}`)
}

// 查看发票
const viewInvoice = (row: any) => {
  ElMessage.info('查看发票功能开发中')
}

// 预览附件
const previewAttachment = (file: any) => {
  previewFile.value = file
  showPreview.value = true
}

// 下载附件
const downloadAttachment = (file: any) => {
  ElMessage.success(`开始下载 ${file.name}`)
}

// 关闭
const handleClose = () => {
  emit('close')
}

// 编辑
const handleEdit = () => {
  router.push(`/cost/monthly/edit/${costInfo.value.id}`)
}

// 提交审核
const handleSubmit = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要提交该月结成本审核吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    costInfo.value.auditStatus = 'pending'
    ElMessage.success('提交成功')
  } catch {
    // 用户取消
  }
}

// 发起付款
const handlePayment = () => {
  ElMessage.info('发起付款功能开发中')
}

// 作废
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要作废该月结成本吗？作废后不可恢复。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    costInfo.value.auditStatus = 'cancelled'
    ElMessage.success('作废成功')
  } catch {
    // 用户取消
  }
}

// 打印
const handlePrint = () => {
  window.print()
}

onMounted(() => {
  // 根据costId加载实际数据
})
</script>

<style scoped>
.monthly-detail-container {
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

.paid-text {
  color: #67c23a;
  font-weight: 500;
}

.unpaid-text {
  color: #f56c6c;
  font-weight: 500;
}

.total-row {
  display: flex;
  justify-content: flex-end;
  gap: 40px;
  padding: 15px 20px;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-top: none;
  font-weight: 500;
}

.total-item .label {
  color: #606266;
  margin-right: 8px;
}

.total-item .value {
  color: #303133;
}

.total-item .value.total {
  color: #409eff;
  font-size: 18px;
  font-weight: 600;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  margin-bottom: 10px;
}

.attachment-icon {
  font-size: 32px;
  color: #409eff;
  margin-right: 15px;
}

.attachment-name {
  flex: 1;
  font-size: 14px;
  color: #303133;
  margin-right: 15px;
}

.attachment-size {
  font-size: 12px;
  color: #909399;
  margin-right: 20px;
}

.attachment-actions {
  display: flex;
  gap: 10px;
}

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

.detail-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.preview-container {
  text-align: center;
}

.preview-container img {
  max-width: 100%;
  max-height: 600px;
}

.preview-unsupported {
  padding: 60px 0;
  text-align: center;
}

.large-icon {
  font-size: 80px;
  color: #909399;
  margin-bottom: 20px;
}

.preview-unsupported p {
  color: #909399;
  margin-bottom: 20px;
}
</style>
