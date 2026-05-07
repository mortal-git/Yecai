<template>
  <div class="order-detail-container">
    <!-- 基本信息区域 -->
    <div class="detail-section">
      <div class="section-header">
        <h3>基本信息</h3>
        <div class="section-actions">
          <el-tag :type="statusMap[orderInfo.status].type" size="large">
            {{ statusMap[orderInfo.status].label }}
          </el-tag>
        </div>
      </div>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="订单编号">{{ orderInfo.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单类型">{{ orderInfo.type === 'sale' ? '销售订单' : '采购订单' }}</el-descriptions-item>
        <el-descriptions-item label="客户/供应商">{{ orderInfo.customerName }}</el-descriptions-item>
        <el-descriptions-item label="订单日期">{{ orderInfo.orderDate }}</el-descriptions-item>
        <el-descriptions-item label="预计交付日期">{{ orderInfo.expectedDate }}</el-descriptions-item>
        <el-descriptions-item label="实际交付日期">{{ orderInfo.actualDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="销售/采购部门">{{ orderInfo.department }}</el-descriptions-item>
        <el-descriptions-item label="责任人">{{ orderInfo.responsible }}</el-descriptions-item>
        <el-descriptions-item label="合同编号">{{ orderInfo.contractNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">
          <span class="amount-text">¥{{ formatMoney(orderInfo.orderAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="已付金额">
          <span class="paid-text">¥{{ formatMoney(orderInfo.paidAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="未付金额">
          <span class="unpaid-text">¥{{ formatMoney(orderInfo.unpaidAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ orderInfo.createTime }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ orderInfo.creator }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ orderInfo.auditTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核人">{{ orderInfo.auditor || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="3">{{ orderInfo.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 订单明细区域 -->
    <div class="detail-section">
      <div class="section-header">
        <h3>订单明细</h3>
      </div>
      <el-table :data="orderItems" border stripe>
        <el-table-column prop="itemName" label="商品/服务名称" min-width="150" />
        <el-table-column prop="spec" label="规格型号" min-width="120" />
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
        <el-tab-pane label="关联成本单" name="cost">
          <el-table :data="relatedCosts" border stripe>
            <el-table-column prop="costNo" label="成本单号" min-width="150" />
            <el-table-column prop="costType" label="成本类型" width="120" />
            <el-table-column prop="supplierName" label="供应商" min-width="150" />
            <el-table-column prop="costAmount" label="成本金额" width="140" align="right" :formatter="formatMoney" />
            <el-table-column prop="status" label="状态" width="100" />
            <el-table-column prop="createTime" label="创建时间" width="160" />
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button type="primary" size="small" link @click="viewCost(scope.row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="关联发票" name="invoice">
          <el-table :data="relatedInvoices" border stripe>
            <el-table-column prop="invoiceNo" label="发票编号" min-width="150" />
            <el-table-column prop="invoiceType" label="发票类型" width="120" />
            <el-table-column prop="invoiceCode" label="发票代码" width="140" />
            <el-table-column prop="invoiceNumber" label="发票号码" width="120" />
            <el-table-column prop="invoiceAmount" label="发票金额" width="140" align="right" :formatter="formatMoney" />
            <el-table-column prop="invoiceDate" label="开票日期" width="120" />
            <el-table-column prop="status" label="状态" width="100" />
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button type="primary" size="small" link @click="viewInvoice(scope.row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="付款记录" name="payment">
          <el-table :data="paymentRecords" border stripe>
            <el-table-column prop="paymentNo" label="付款单号" min-width="150" />
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
            list-type="picture-card"
            :disabled="true"
            :preview-file-handle="handlePreview"
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
                <p v-if="log.remark" class="log-remark">备注：{{ log.remark }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 底部操作栏 -->
    <div class="detail-footer">
      <el-button @click="handleClose">关闭</el-button>
      <el-button v-if="['draft', 'rejected'].includes(orderInfo.status)" type="primary" @click="handleEdit">编辑</el-button>
      <el-button v-if="orderInfo.status === 'draft'" type="success" @click="handleSubmit">提交审核</el-button>
      <el-button v-if="['pending', 'effective', 'executing'].includes(orderInfo.status)" type="warning" @click="handleChange">变更订单</el-button>
      <el-button v-if="orderInfo.status === 'pending'" type="danger" @click="handleCancel">作废</el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Download, View } from '@element-plus/icons-vue'

const props = defineProps<{
  orderId: number
}>()

const emit = defineEmits<{
  close: []
}>()

const activeTab = ref('cost')
const showPreview = ref(false)
const previewFile = ref<any>(null)

// 订单状态映射
const statusMap: Record<string, { label: string, type: string }> = {
  'draft': { label: '草稿', type: 'info' },
  'pending': { label: '待审核', type: 'warning' },
  'effective': { label: '已生效', type: 'success' },
  'executing': { label: '执行中', type: 'primary' },
  'completed': { label: '已完成', type: 'success' },
  'cancelled': { label: '已作废', type: 'danger' },
  'rejected': { label: '已驳回', type: 'danger' }
}

// 订单基本信息
const orderInfo = ref({
  id: props.orderId,
  orderNo: 'SO202401010001',
  type: 'sale',
  customerName: '北京科技有限公司',
  orderDate: '2024-01-01',
  expectedDate: '2024-01-15',
  actualDate: '2024-01-14',
  department: '销售一部',
  responsible: '张三',
  contractNo: 'HT20240001',
  orderAmount: 128000.00,
  paidAmount: 64000.00,
  unpaidAmount: 64000.00,
  createTime: '2024-01-01 10:30:00',
  creator: '张三',
  auditTime: '2024-01-01 14:20:00',
  auditor: '李四',
  status: 'executing',
  remark: '这是一个测试订单，用于演示功能'
})

// 订单明细
const orderItems = ref([
  {
    id: 1,
    itemName: '服务器主机',
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
    itemName: '操作系统',
    spec: 'Windows Server 2022',
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
    itemName: '安装调试服务',
    spec: '上门安装调试',
    unit: '次',
    quantity: 1,
    unitPrice: 35000.00,
    amount: 35000.00,
    taxRate: 6,
    taxAmount: 2100.00,
    totalAmount: 37100.00,
    remark: ''
  }
])

// 关联成本单
const relatedCosts = ref([
  {
    id: 1,
    costNo: 'YJ202401020001',
    costType: '月结成本',
    supplierName: '上海电子有限公司',
    costAmount: 68000.00,
    status: '已付款',
    createTime: '2024-01-02 14:30:00'
  }
])

// 关联发票
const relatedInvoices = ref([
  {
    id: 1,
    invoiceNo: 'FP202401050001',
    invoiceType: '增值税专用发票',
    invoiceCode: '1100231230',
    invoiceNumber: '12345678',
    invoiceAmount: 128000.00,
    invoiceDate: '2024-01-05',
    status: '已认证'
  }
])

// 付款记录
const paymentRecords = ref([
  {
    id: 1,
    paymentNo: 'FK202401100001',
    paymentDate: '2024-01-10',
    paymentType: '银行转账',
    paymentAmount: 64000.00,
    bankAccount: '中国建设银行 1234567890',
    operator: '财务王五',
    remark: '首付款 50%'
  }
])

// 附件信息
const attachments = ref([
  {
    id: 1,
    name: '合同扫描件.pdf',
    size: 2560000,
    type: 'application/pdf',
    url: 'https://picsum.photos/seed/pdf/800/600.pdf'
  },
  {
    id: 2,
    name: '产品配置清单.xlsx',
    size: 128000,
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    url: '#'
  },
  {
    id: 3,
    name: '产品图片.jpg',
    size: 3560000,
    type: 'image/jpeg',
    url: 'https://picsum.photos/800/600'
  }
])

// 操作日志
const operationLogs = ref([
  {
    id: 1,
    operator: '张三',
    action: '创建订单',
    type: 'primary',
    content: '创建了销售订单 SO202401010001',
    createTime: '2024-01-01 10:30:00',
    remark: ''
  },
  {
    id: 2,
    operator: '张三',
    action: '提交审核',
    type: 'warning',
    content: '提交了订单审核申请',
    createTime: '2024-01-01 10:35:00',
    remark: ''
  },
  {
    id: 3,
    operator: '李四',
    action: '审核通过',
    type: 'success',
    content: '审核通过了该订单',
    createTime: '2024-01-01 14:20:00',
    remark: '同意执行'
  },
  {
    id: 4,
    operator: '王五',
    action: '关联成本',
    type: 'info',
    content: '关联了成本单 YJ202401020001',
    createTime: '2024-01-02 16:40:00',
    remark: ''
  }
])

// 计算合计
const totalAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.amount, 0)
})

const totalTax = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.taxAmount, 0)
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

// 查看成本单
const viewCost = (row: any) => {
  ElMessage.info('查看成本单功能开发中')
}

// 查看发票
const viewInvoice = (row: any) => {
  ElMessage.info('查看发票功能开发中')
}

// 预览附件
const handlePreview = (file: any) => {
  previewFile.value = file
  showPreview.value = true
}

const previewAttachment = (file: any) => {
  handlePreview(file)
}

// 下载附件
const downloadAttachment = (file: any) => {
  ElMessage.success(`开始下载 ${file.name}`)
  // 实际开发中这里要处理下载逻辑
}

// 关闭
const handleClose = () => {
  emit('close')
}

// 编辑
const handleEdit = () => {
  // 跳转到编辑页
  ElMessage.info('编辑功能开发中')
}

// 提交审核
const handleSubmit = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要提交该订单审核吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    // 模拟提交
    orderInfo.value.status = 'pending'
    ElMessage.success('提交成功')
  } catch {
    // 用户取消
  }
}

// 变更订单
const handleChange = () => {
  ElMessage.info('变更功能开发中')
}

// 作废订单
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要作废该订单吗？作废后不可恢复。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    // 模拟作废
    orderInfo.value.status = 'cancelled'
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
  // 这里可以根据orderId加载实际的订单数据
})
</script>

<style scoped>
.order-detail-container {
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
  width: 200px;
  height: 180px;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.attachment-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 10px;
}

.attachment-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
  word-break: break-all;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.attachment-size {
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
}

.attachment-actions {
  display: flex;
  gap: 8px;
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
