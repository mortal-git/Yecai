<template>
  <div class="advance-detail-container">
    <!-- 基本信息 -->
    <div class="detail-section">
      <div class="section-header">
        <h3>垫付申请基本信息</h3>
        <el-tag :type="getStatusConfig(advance.advanceStatus).type" size="large">
          {{ getStatusConfig(advance.advanceStatus).label }}
        </el-tag>
      </div>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="垫付单号">{{ advance.advanceNo }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ advance.applicantName }}</el-descriptions-item>
        <el-descriptions-item label="所属部门">{{ advance.departmentName }}</el-descriptions-item>
        <el-descriptions-item label="费用类型">{{ getCostTypeText(advance.costType) }}</el-descriptions-item>
        <el-descriptions-item label="关联订单号">
          <el-link v-if="advance.orderNo" type="primary">{{ advance.orderNo }}</el-link>
          <span v-else class="text-muted">无</span>
        </el-descriptions-item>
        <el-descriptions-item label="申请日期">{{ formatDateTime(advance.applyDate) }}</el-descriptions-item>
        <el-descriptions-item label="垫付日期">{{ advance.advanceDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="预计还款日">{{ advance.expectedRepaymentDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="实际付款日">{{ advance.paymentDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="收款账户类型">{{ getAccountTypeText(advance.accountType) }}</el-descriptions-item>
        <el-descriptions-item label="收款银行">{{ advance.bankName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="收款账号">{{ advance.accountNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="费用事由" :span="3">{{ advance.costReason }}</el-descriptions-item>
        <el-descriptions-item v-if="advance.rejectReason" label="驳回原因" :span="3">
          <span class="text-danger">{{ advance.rejectReason }}</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="advance.remark" label="备注" :span="3">{{ advance.remark }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 金额信息 -->
    <div class="detail-section">
      <div class="section-header">
        <h3>金额信息</h3>
      </div>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="amount-card">
            <div class="amount-label">垫付金额</div>
            <div class="amount-value text-primary">¥{{ formatMoney(advance.advanceAmount) }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="amount-card">
            <div class="amount-label">已付金额</div>
            <div class="amount-value">¥{{ formatMoney(advance.paidAmount) }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="amount-card">
            <div class="amount-label">已关联发票</div>
            <div class="amount-value">¥{{ formatMoney(advance.invoicedAmount) }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="amount-card">
            <div class="amount-label">未核销金额</div>
            <div class="amount-value" :class="advance.balanceAmount > 0 ? 'text-warning' : 'text-success'">
              ¥{{ formatMoney(advance.balanceAmount) }}
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 操作按钮区 -->
    <div class="detail-section" v-if="showActionButtons">
      <div class="action-buttons">
        <el-button v-if="canSubmit" type="warning" @click="handleSubmit">提交审核</el-button>
        <el-button v-if="canAudit" type="primary" @click="handleAudit">审核</el-button>
        <el-button v-if="canApplyPayment" type="primary" @click="handleApplyPayment">申请付款</el-button>
        <el-button v-if="canBindInvoice" type="success" @click="handleBindInvoice">关联发票</el-button>
        <el-button v-if="canWriteoff" type="success" @click="handleWriteoff">核销</el-button>
        <el-button v-if="canEdit" type="primary" @click="handleEdit">编辑</el-button>
        <el-button @click="handlePrint">打印</el-button>
      </div>
    </div>

    <!-- Tab区域 -->
    <div class="detail-section">
      <el-tabs v-model="activeTab">
        <!-- 费用明细 -->
        <el-tab-pane label="费用明细" name="items">
          <el-table :data="costItems" border stripe>
            <el-table-column prop="itemName" label="费用项目" min-width="150" />
            <el-table-column prop="spec" label="规格说明" min-width="150" />
            <el-table-column prop="quantity" label="数量" width="100" align="right" />
            <el-table-column prop="unitPrice" label="单价" width="120" align="right">
              <template #default="scope">¥{{ formatMoney(scope.row.unitPrice) }}</template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="120" align="right">
              <template #default="scope">¥{{ formatMoney(scope.row.amount) }}</template>
            </el-table-column>
            <el-table-column prop="invoiceNo" label="发票号码" min-width="150">
              <template #default="scope">
                <span v-if="scope.row.invoiceNo">{{ scope.row.invoiceNo }}</span>
                <span v-else class="text-muted">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="150">
              <template #default="scope">
                <span v-if="scope.row.remark">{{ scope.row.remark }}</span>
                <span v-else class="text-muted">-</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="items-total">
            <span>合计金额：</span>
            <strong class="text-primary">¥{{ formatMoney(itemsTotalAmount) }}</strong>
          </div>
        </el-tab-pane>

        <!-- 付款记录 -->
        <el-tab-pane label="付款记录" name="payment">
          <el-table :data="paymentRecords" border stripe>
            <el-table-column prop="paymentMethod" label="付款方式" width="120" />
            <el-table-column prop="bankAccount" label="付款账户" min-width="200" />
            <el-table-column prop="paymentAmount" label="付款金额" width="140" align="right">
              <template #default="scope">¥{{ formatMoney(scope.row.paymentAmount) }}</template>
            </el-table-column>
            <el-table-column prop="transactionNo" label="银行流水" min-width="150" />
            <el-table-column prop="paymentDate" label="付款日期" width="120" />
            <el-table-column prop="payer" label="付款人" width="100" />
            <el-table-column prop="remark" label="备注" min-width="150" />
            <el-table-column prop="attachment" label="附件" width="120">
              <template #default="scope">
                <el-link v-if="scope.row.attachment" type="primary" @click="handleViewAttachment(scope.row.attachment)">
                  {{ scope.row.attachment.name }}
                </el-link>
                <span v-else class="text-muted">-</span>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="paymentRecords.length === 0" description="暂无付款记录" />
        </el-tab-pane>

        <!-- 发票记录 -->
        <el-tab-pane label="发票记录" name="invoice">
          <el-table :data="invoiceRecords" border stripe>
            <el-table-column prop="invoiceNo" label="发票号" min-width="150" />
            <el-table-column prop="invoiceType" label="发票类型" width="150" />
            <el-table-column prop="invoiceAmount" label="发票金额" width="140" align="right">
              <template #default="scope">¥{{ formatMoney(scope.row.invoiceAmount) }}</template>
            </el-table-column>
            <el-table-column prop="bindAmount" label="关联金额" width="140" align="right">
              <template #default="scope">¥{{ formatMoney(scope.row.bindAmount) }}</template>
            </el-table-column>
            <el-table-column prop="invoiceDate" label="开票日期" width="120" />
            <el-table-column prop="bindDate" label="关联日期" width="120" />
            <el-table-column prop="taxRate" label="税率" width="100" align="right">
              <template #default="scope">{{ scope.row.taxRate }}%</template>
            </el-table-column>
            <el-table-column prop="operator" label="操作人" width="100" />
          </el-table>
          <el-empty v-if="invoiceRecords.length === 0" description="暂无发票记录" />
        </el-tab-pane>

        <!-- 核销记录 -->
        <el-tab-pane label="核销记录" name="writeoff">
          <el-table :data="writeoffRecords" border stripe>
            <el-table-column prop="writeoffNo" label="核销单号" min-width="150" />
            <el-table-column prop="writeoffAmount" label="核销金额" width="140" align="right">
              <template #default="scope">¥{{ formatMoney(scope.row.writeoffAmount) }}</template>
            </el-table-column>
            <el-table-column prop="relatedOrderNo" label="关联订单号" min-width="150" />
            <el-table-column prop="incomeItem" label="收入项目" min-width="120" />
            <el-table-column prop="operator" label="核销人" width="100" />
            <el-table-column prop="writeoffDate" label="核销时间" width="160" />
            <el-table-column prop="remark" label="备注" min-width="150" />
          </el-table>
          <el-empty v-if="writeoffRecords.length === 0" description="暂无核销记录" />
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

    <!-- 审核弹窗 -->
    <el-dialog
      v-model="showAudit"
      title="审核垫付申请"
      width="600px"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form :model="auditForm" label-width="100px">
        <el-form-item label="垫付单号">{{ advance.advanceNo }}</el-form-item>
        <el-form-item label="申请人">{{ advance.applicantName }}</el-form-item>
        <el-form-item label="垫付金额">
          <span class="text-primary">¥{{ formatMoney(advance.advanceAmount) }}</span>
        </el-form-item>
        <el-form-item label="审核操作" required>
          <el-radio-group v-model="auditForm.action">
            <el-radio label="approve">通过</el-radio>
            <el-radio label="reject">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="auditForm.action === 'reject'" label="驳回原因" required>
          <el-input v-model="auditForm.rejectReason" type="textarea" :rows="3" placeholder="请输入驳回原因" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="auditForm.remark" type="textarea" :rows="2" placeholder="请输入审核备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAudit = false">取消</el-button>
        <el-button type="primary" @click="confirmAudit" :loading="auditLoading">确认</el-button>
      </template>
    </el-dialog>

    <!-- 申请付款弹窗 -->
    <el-dialog
      v-model="showApplyPayment"
      title="申请付款"
      width="700px"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form :model="paymentForm" label-width="120px">
        <div class="form-section-title">基本信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="垫付单号">{{ advance.advanceNo }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请人">{{ advance.applicantName }}</el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="垫付金额">
              <span class="text-primary">¥{{ formatMoney(advance.advanceAmount) }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收款账户">
              {{ advance.bankName }} {{ advance.accountNo }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider />
        <div class="form-section-title">付款信息</div>
        <el-form-item label="付款方式" required>
          <el-select v-model="paymentForm.paymentMethod" placeholder="请选择" style="width: 100%">
            <el-option label="银行转账" value="bank_transfer" />
            <el-option label="承兑汇票" value="acceptance" />
            <el-option label="现金" value="cash" />
            <el-option label="支票" value="cheque" />
          </el-select>
        </el-form-item>
        <el-form-item label="付款账户" required>
          <el-select v-model="paymentForm.bankAccountId" placeholder="请选择公司付款账户" style="width: 100%">
            <el-option
              v-for="bank in bankAccounts"
              :key="bank.id"
              :label="`${bank.bankName} ${bank.accountNo}`"
              :value="bank.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="银行流水">
          <el-input v-model="paymentForm.transactionNo" placeholder="请输入银行流水号" />
        </el-form-item>
        <el-form-item label="付款日期" required>
          <el-date-picker
            v-model="paymentForm.paymentDate"
            type="date"
            placeholder="请选择"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="paymentForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showApplyPayment = false">取消</el-button>
        <el-button type="primary" @click="confirmApplyPayment" :loading="paymentLoading">确认付款</el-button>
      </template>
    </el-dialog>

    <!-- 关联发票弹窗 -->
    <el-dialog
      v-model="showBindInvoice"
      title="关联发票"
      width="700px"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form :model="bindInvoiceForm" label-width="120px">
        <div class="form-section-title">基本信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="垫付单号">{{ advance.advanceNo }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请人">{{ advance.applicantName }}</el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="垫付金额">
              <span class="text-primary">¥{{ formatMoney(advance.advanceAmount) }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="待关联金额">
              <span class="text-warning">¥{{ formatMoney(advance.balanceAmount) }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider />
        <div class="form-section-title">发票信息</div>
        <el-form-item label="选择发票" required>
          <el-select
            v-model="bindInvoiceForm.selectedInvoice"
            filterable
            placeholder="请选择要关联的发票"
            style="width: 100%"
            @change="handleInvoiceSelectChange"
          >
            <el-option
              v-for="invoice in availableInvoices"
              :key="invoice.id"
              :label="`${invoice.invoiceNo} - ${invoice.invoiceType} - ¥${formatMoney(invoice.invoiceAmount)}`"
              :value="invoice.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关联金额" required>
          <el-input-number
            v-model="bindInvoiceForm.bindAmount"
            :min="0"
            :max="advance.balanceAmount"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="bindInvoiceForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBindInvoice = false">取消</el-button>
        <el-button type="primary" @click="confirmBindInvoice" :loading="bindLoading">确认关联</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps<{
  advanceId: number
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const router = useRouter()
const activeTab = ref('items')
const showAudit = ref(false)
const showApplyPayment = ref(false)
const showBindInvoice = ref(false)
const auditLoading = ref(false)
const paymentLoading = ref(false)
const bindLoading = ref(false)

// 费用类型选项
const costTypeOptions = [
  { label: '差旅费', value: 'travel' },
  { label: '招待费', value: 'entertainment' },
  { label: '交通费', value: 'transportation' },
  { label: '办公费', value: 'office' },
  { label: '通讯费', value: 'communication' },
  { label: '其他', value: 'other' }
]

// 银行账户列表
const bankAccounts = ref([
  { id: 1, bankName: '中国工商银行', accountNo: '6222081234567890' },
  { id: 2, bankName: '中国建设银行', accountNo: '6217001234567890' },
  { id: 3, bankName: '中国农业银行', accountNo: '6228481234567890' },
  { id: 4, bankName: '招商银行', accountNo: '6214831234567890' }
])

// 可选发票列表
const availableInvoices = ref([
  { id: 1, invoiceNo: 'FP2026070001', invoiceType: '增值税专用发票', invoiceAmount: 2800.00 },
  { id: 2, invoiceNo: 'FP2026070002', invoiceType: '增值税普通发票', invoiceAmount: 1560.00 },
  { id: 3, invoiceNo: 'FP2026070003', invoiceType: '增值税专用发票', invoiceAmount: 860.00 },
  { id: 4, invoiceNo: 'FP2026070004', invoiceType: '增值税普通发票', invoiceAmount: 450.00 },
  { id: 5, invoiceNo: 'FP2026070005', invoiceType: '增值税专用发票', invoiceAmount: 680.00 }
])

// 垫付数据
const advance = reactive({
  id: props.advanceId,
  advanceNo: '',
  applicantId: '',
  applicantName: '',
  departmentId: null as number | null,
  departmentName: '',
  costType: '',
  costReason: '',
  orderNo: '',
  advanceAmount: 0,
  paidAmount: 0,
  invoicedAmount: 0,
  writtenOffAmount: 0,
  balanceAmount: 0,
  advanceStatus: '',
  applyDate: '',
  advanceDate: '',
  expectedRepaymentDate: '',
  paymentDate: '',
  accountType: 'personal',
  bankName: '',
  accountNo: '',
  rejectReason: '',
  remark: ''
})

// 费用明细
const costItems = ref<any[]>([])

// 付款记录
const paymentRecords = ref<any[]>([])

// 发票记录
const invoiceRecords = ref<any[]>([])

// 核销记录
const writeoffRecords = ref<any[]>([])

// 操作日志
const operationLogs = ref<any[]>([])

// 审核表单
const auditForm = reactive({
  action: 'approve' as 'approve' | 'reject',
  rejectReason: '',
  remark: ''
})

// 申请付款表单
const paymentForm = reactive({
  paymentMethod: 'bank_transfer',
  bankAccountId: null as number | null,
  transactionNo: '',
  paymentDate: '',
  remark: ''
})

// 关联发票表单
const bindInvoiceForm = reactive({
  selectedInvoice: null as number | null,
  bindAmount: 0,
  remark: ''
})

// 计算属性
const itemsTotalAmount = computed(() => {
  return costItems.value.reduce((sum, item) => sum + (item.amount || 0), 0)
})

const showActionButtons = computed(() => {
  return !['written_off', 'cancelled'].includes(advance.advanceStatus)
})

const canEdit = computed(() => ['draft', 'rejected'].includes(advance.advanceStatus))
const canSubmit = computed(() => ['draft', 'rejected'].includes(advance.advanceStatus))
const canAudit = computed(() => advance.advanceStatus === 'pending')
const canApplyPayment = computed(() => advance.advanceStatus === 'approved')
const canBindInvoice = computed(() => ['paid', 'invoiced'].includes(advance.advanceStatus) && advance.balanceAmount > 0)
const canWriteoff = computed(() => advance.advanceStatus === 'invoiced' && advance.balanceAmount > 0)

// 格式化金额
const formatMoney = (value: number) => {
  return (value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return dateStr
}

// 获取费用类型文本
const getCostTypeText = (value: string) => {
  const item = costTypeOptions.find(t => t.value === value)
  return item ? item.label : value
}

// 获取账户类型文本
const getAccountTypeText = (value: string) => {
  const map: Record<string, string> = {
    personal: '个人银行账户',
    alipay: '支付宝',
    wechat: '微信',
    cash: '现金'
  }
  return map[value] || value
}

// 获取状态配置
const getStatusConfig = (status: string) => {
  const config: Record<string, { label: string, type: string }> = {
    'draft': { label: '草稿', type: 'info' },
    'pending': { label: '待审核', type: 'warning' },
    'approved': { label: '待付款', type: 'primary' },
    'paid': { label: '待关联发票', type: 'primary' },
    'invoiced': { label: '待核销', type: 'warning' },
    'written_off': { label: '已核销', type: 'success' },
    'rejected': { label: '已驳回', type: 'danger' },
    'cancelled': { label: '已作废', type: 'info' }
  }
  return config[status] || { label: status, type: 'info' }
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

// 提交审核
const handleSubmit = async () => {
  try {
    await ElMessageBox.confirm('确定要提交该垫付申请审核吗？', '提示', { type: 'warning' })
    advance.advanceStatus = 'pending'
    operationLogs.value.unshift({
      operator: advance.applicantName,
      action: '提交审核',
      content: `提交垫付单 ${advance.advanceNo} 待审核`,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      remark: ''
    })
    ElMessage.success('提交成功')
    emit('refresh')
  } catch {}
}

// 打开审核弹窗
const handleAudit = () => {
  auditForm.action = 'approve'
  auditForm.rejectReason = ''
  auditForm.remark = ''
  showAudit.value = true
}

// 确认审核
const confirmAudit = async () => {
  if (auditForm.action === 'reject' && !auditForm.rejectReason) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  auditLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (auditForm.action === 'approve') {
      advance.advanceStatus = 'approved'
      ElMessage.success('审核通过')
      operationLogs.value.unshift({
        operator: '当前用户',
        action: '审核通过',
        content: `审核通过垫付单 ${advance.advanceNo}`,
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        remark: auditForm.remark
      })
    } else {
      advance.advanceStatus = 'rejected'
      advance.rejectReason = auditForm.rejectReason
      ElMessage.success('已驳回')
      operationLogs.value.unshift({
        operator: '当前用户',
        action: '审核驳回',
        content: `驳回垫付单 ${advance.advanceNo}`,
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        remark: auditForm.rejectReason
      })
    }
    showAudit.value = false
    emit('refresh')
  } catch {
    ElMessage.error('操作失败')
  } finally {
    auditLoading.value = false
  }
}

// 打开申请付款弹窗
const handleApplyPayment = () => {
  paymentForm.paymentMethod = 'bank_transfer'
  paymentForm.bankAccountId = null
  paymentForm.transactionNo = ''
  paymentForm.paymentDate = new Date().toISOString().split('T')[0]
  paymentForm.remark = ''
  showApplyPayment.value = true
}

// 确认申请付款
const confirmApplyPayment = async () => {
  if (!paymentForm.paymentMethod) {
    ElMessage.warning('请选择付款方式')
    return
  }
  if (!paymentForm.bankAccountId) {
    ElMessage.warning('请选择付款账户')
    return
  }
  if (!paymentForm.paymentDate) {
    ElMessage.warning('请选择付款日期')
    return
  }
  paymentLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    advance.paidAmount = advance.advanceAmount
    advance.balanceAmount = advance.advanceAmount
    advance.paymentDate = paymentForm.paymentDate
    advance.advanceStatus = 'paid'
    const bank = bankAccounts.value.find(b => b.id === paymentForm.bankAccountId)
    paymentRecords.value.unshift({
      id: paymentRecords.value.length + 1,
      paymentMethod: getPaymentMethodText(paymentForm.paymentMethod),
      bankAccount: bank ? `${bank.bankName} ${bank.accountNo}` : '',
      paymentAmount: advance.advanceAmount,
      transactionNo: paymentForm.transactionNo,
      paymentDate: paymentForm.paymentDate,
      payer: '当前用户',
      remark: paymentForm.remark,
      attachment: null
    })
    operationLogs.value.unshift({
      operator: '当前用户',
      action: '付款登记',
      content: `登记垫付单 ${advance.advanceNo} 付款信息，金额 ¥${formatMoney(advance.advanceAmount)}`,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      remark: paymentForm.remark
    })
    ElMessage.success('付款成功')
    showApplyPayment.value = false
    emit('refresh')
  } catch {
    ElMessage.error('操作失败')
  } finally {
    paymentLoading.value = false
  }
}

// 获取付款方式文本
const getPaymentMethodText = (value: string) => {
  const map: Record<string, string> = {
    bank_transfer: '银行转账',
    acceptance: '承兑汇票',
    cash: '现金',
    cheque: '支票'
  }
  return map[value] || value
}

// 打开关联发票弹窗
const handleBindInvoice = () => {
  bindInvoiceForm.selectedInvoice = null
  bindInvoiceForm.bindAmount = 0
  bindInvoiceForm.remark = ''
  showBindInvoice.value = true
}

// 发票选择变化
const handleInvoiceSelectChange = (selected: number | null) => {
  if (selected) {
    const invoice = availableInvoices.value.find(inv => inv.id === selected)
    if (invoice) {
      bindInvoiceForm.bindAmount = Math.min(invoice.invoiceAmount, advance.balanceAmount)
    }
  } else {
    bindInvoiceForm.bindAmount = 0
  }
}

// 确认关联发票
const confirmBindInvoice = async () => {
  if (!bindInvoiceForm.selectedInvoice) {
    ElMessage.warning('请选择要关联的发票')
    return
  }
  if (!bindInvoiceForm.bindAmount || bindInvoiceForm.bindAmount <= 0) {
    ElMessage.warning('请输入关联金额')
    return
  }
  if (bindInvoiceForm.bindAmount > advance.balanceAmount) {
    ElMessage.warning('关联金额不能超过待关联金额')
    return
  }
  bindLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const invoice = availableInvoices.value.find(inv => inv.id === bindInvoiceForm.selectedInvoice)
    advance.invoicedAmount = (advance.invoicedAmount || 0) + bindInvoiceForm.bindAmount
    advance.balanceAmount = advance.advanceAmount - advance.writtenOffAmount - advance.invoicedAmount
    if (advance.balanceAmount < 0) advance.balanceAmount = 0
    advance.advanceStatus = 'invoiced'
    if (invoice) {
      invoiceRecords.value.unshift({
        id: invoiceRecords.value.length + 1,
        invoiceNo: invoice.invoiceNo,
        invoiceType: invoice.invoiceType,
        invoiceAmount: invoice.invoiceAmount,
        bindAmount: bindInvoiceForm.bindAmount,
        invoiceDate: new Date().toISOString().split('T')[0],
        bindDate: new Date().toISOString().split('T')[0],
        taxRate: 13,
        operator: '当前用户'
      })
    }
    operationLogs.value.unshift({
      operator: '当前用户',
      action: '关联发票',
      content: `关联发票到垫付单 ${advance.advanceNo}，金额 ¥${formatMoney(bindInvoiceForm.bindAmount)}`,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      remark: bindInvoiceForm.remark
    })
    ElMessage.success('发票关联成功')
    showBindInvoice.value = false
    emit('refresh')
  } catch {
    ElMessage.error('关联失败')
  } finally {
    bindLoading.value = false
  }
}

// 核销
const handleWriteoff = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要核销该垫付申请吗？核销后垫付流程结束。\n待核销金额：¥${formatMoney(advance.balanceAmount)}`,
      '提示',
      { type: 'warning' }
    )
    const writeoffAmount = advance.balanceAmount
    advance.writtenOffAmount = advance.advanceAmount
    advance.balanceAmount = 0
    advance.advanceStatus = 'written_off'
    writeoffRecords.value.unshift({
      id: writeoffRecords.value.length + 1,
      writeoffNo: `HX${new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14)}`,
      writeoffAmount,
      relatedOrderNo: advance.orderNo || '-',
      incomeItem: getCostTypeText(advance.costType),
      operator: '当前用户',
      writeoffDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      remark: '核销完成'
    })
    operationLogs.value.unshift({
      operator: '当前用户',
      action: '核销',
      content: `核销垫付单 ${advance.advanceNo}，金额 ¥${formatMoney(writeoffAmount)}`,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      remark: ''
    })
    ElMessage.success('核销成功')
    emit('refresh')
  } catch {}
}

// 编辑
const handleEdit = () => {
  router.push(`/payable/advance/edit/${advance.id}`)
}

// 打印
const handlePrint = () => {
  window.print()
}

// 加载数据
const loadData = () => {
  // 模拟根据 advanceId 加载数据
  const mockData: Record<number, any> = {
    1: {
      advanceNo: 'DF2026070001',
      applicantName: '张三',
      departmentName: '技术部',
      costType: 'travel',
      costReason: '去上海出差3天的机票和酒店费用',
      orderNo: 'SO202602150008',
      advanceAmount: 2800.00,
      paidAmount: 0,
      invoicedAmount: 0,
      writtenOffAmount: 0,
      balanceAmount: 2800.00,
      advanceStatus: 'pending',
      applyDate: '2026-07-10 09:30:45',
      advanceDate: '2026-07-08',
      expectedRepaymentDate: '2026-07-20',
      paymentDate: '',
      accountType: 'personal',
      bankName: '招商银行',
      accountNo: '6214831234567890',
      rejectReason: '',
      remark: ''
    },
    2: {
      advanceNo: 'DF2026070002',
      applicantName: '李四',
      departmentName: '销售一部',
      costType: 'entertainment',
      costReason: '客户招待餐费',
      orderNo: 'SO202603010012',
      advanceAmount: 1560.00,
      paidAmount: 0,
      invoicedAmount: 0,
      writtenOffAmount: 0,
      balanceAmount: 1560.00,
      advanceStatus: 'approved',
      applyDate: '2026-07-08 14:22:30',
      advanceDate: '2026-07-06',
      expectedRepaymentDate: '2026-07-18',
      paymentDate: '',
      accountType: 'personal',
      bankName: '工商银行',
      accountNo: '6222081234567890',
      rejectReason: '',
      remark: ''
    },
    3: {
      advanceNo: 'DF2026070003',
      applicantName: '张三',
      departmentName: '技术部',
      costType: 'office',
      costReason: '购买开发用的软件license',
      orderNo: '',
      advanceAmount: 860.00,
      paidAmount: 860.00,
      invoicedAmount: 0,
      writtenOffAmount: 0,
      balanceAmount: 860.00,
      advanceStatus: 'paid',
      applyDate: '2026-07-05 10:15:20',
      advanceDate: '2026-07-04',
      expectedRepaymentDate: '2026-07-15',
      paymentDate: '2026-07-08',
      accountType: 'personal',
      bankName: '招商银行',
      accountNo: '6214831234567890',
      rejectReason: '',
      remark: ''
    },
    4: {
      advanceNo: 'DF2026070004',
      applicantName: '王五',
      departmentName: '销售二部',
      costType: 'transportation',
      costReason: '7月打车费报销',
      orderNo: '',
      advanceAmount: 450.00,
      paidAmount: 0,
      invoicedAmount: 0,
      writtenOffAmount: 0,
      balanceAmount: 450.00,
      advanceStatus: 'draft',
      applyDate: '2026-07-15 16:40:00',
      advanceDate: '2026-07-15',
      expectedRepaymentDate: '2026-07-25',
      paymentDate: '',
      accountType: 'personal',
      bankName: '建设银行',
      accountNo: '6217001234567890',
      rejectReason: '',
      remark: ''
    },
    5: {
      advanceNo: 'DF2026070005',
      applicantName: '赵六',
      departmentName: '行政部',
      costType: 'office',
      costReason: '购买办公用品',
      orderNo: '',
      advanceAmount: 680.00,
      paidAmount: 0,
      invoicedAmount: 0,
      writtenOffAmount: 0,
      balanceAmount: 680.00,
      advanceStatus: 'rejected',
      applyDate: '2026-07-02 11:20:00',
      advanceDate: '2026-07-01',
      expectedRepaymentDate: '',
      paymentDate: '',
      accountType: 'personal',
      bankName: '农业银行',
      accountNo: '6228481234567890',
      rejectReason: '请提供正规发票',
      remark: ''
    },
    6: {
      advanceNo: 'DF2026070006',
      applicantName: '李四',
      departmentName: '销售一部',
      costType: 'travel',
      costReason: '北京客户拜访差旅费',
      orderNo: 'SO202606200010',
      advanceAmount: 3200.00,
      paidAmount: 3200.00,
      invoicedAmount: 3200.00,
      writtenOffAmount: 0,
      balanceAmount: 3200.00,
      advanceStatus: 'invoiced',
      applyDate: '2026-06-25 09:00:00',
      advanceDate: '2026-06-22',
      expectedRepaymentDate: '2026-07-05',
      paymentDate: '2026-06-28',
      accountType: 'personal',
      bankName: '工商银行',
      accountNo: '6222081234567890',
      rejectReason: '',
      remark: ''
    },
    7: {
      advanceNo: 'DF2026060019',
      applicantName: '张三',
      departmentName: '技术部',
      costType: 'communication',
      costReason: '6月通讯费报销',
      orderNo: '',
      advanceAmount: 280.00,
      paidAmount: 280.00,
      invoicedAmount: 280.00,
      writtenOffAmount: 280.00,
      balanceAmount: 0,
      advanceStatus: 'written_off',
      applyDate: '2026-06-10 10:00:00',
      advanceDate: '2026-06-08',
      expectedRepaymentDate: '2026-06-20',
      paymentDate: '2026-06-13',
      accountType: 'personal',
      bankName: '招商银行',
      accountNo: '6214831234567890',
      rejectReason: '',
      remark: ''
    }
  }

  const data = mockData[props.advanceId] || mockData[1]
  Object.assign(advance, data)

  // 加载费用明细
  costItems.value = [
    {
      itemName: getCostTypeText(advance.costType),
      spec: '',
      quantity: 1,
      unitPrice: advance.advanceAmount,
      amount: advance.advanceAmount,
      invoiceNo: '',
      remark: advance.costReason
    }
  ]

  // 加载付款记录
  paymentRecords.value = advance.paymentDate ? [
    {
      id: 1,
      paymentMethod: '银行转账',
      bankAccount: '中国工商银行 6222081234567890',
      paymentAmount: advance.paidAmount,
      transactionNo: `FT${advance.advanceNo.substring(2)}`,
      paymentDate: advance.paymentDate,
      payer: '财务王五',
      remark: '垫付款项',
      attachment: { name: '付款凭证.pdf', url: '/files/voucher1.pdf' }
    }
  ] : []

  // 加载发票记录
  invoiceRecords.value = advance.invoicedAmount > 0 ? [
    {
      id: 1,
      invoiceNo: 'FP2026070001',
      invoiceType: '增值税专用发票',
      invoiceAmount: advance.invoicedAmount,
      bindAmount: advance.invoicedAmount,
      invoiceDate: '2026-07-12',
      bindDate: advance.paymentDate || new Date().toISOString().split('T')[0],
      taxRate: 13,
      operator: '张三'
    }
  ] : []

  // 加载核销记录
  writeoffRecords.value = advance.writtenOffAmount > 0 ? [
    {
      id: 1,
      writeoffNo: `HX${advance.advanceNo.substring(2)}`,
      writeoffAmount: advance.writtenOffAmount,
      relatedOrderNo: advance.orderNo || '-',
      incomeItem: getCostTypeText(advance.costType),
      operator: '张三',
      writeoffDate: '2026-07-15 10:30:00',
      remark: '核销完成'
    }
  ] : []

  // 加载操作日志
  operationLogs.value = [
    {
      operator: advance.applicantName,
      action: '创建垫付单',
      content: `创建了垫付单 ${advance.advanceNo}`,
      createTime: advance.applyDate,
      remark: ''
    }
  ]
  if (['pending', 'approved', 'rejected', 'paid', 'invoiced', 'written_off'].includes(advance.advanceStatus)) {
    operationLogs.value.push({
      operator: advance.applicantName,
      action: '提交审核',
      content: `提交垫付单 ${advance.advanceNo} 待审核`,
      createTime: advance.applyDate,
      remark: ''
    })
  }
  if (['approved', 'rejected'].includes(advance.advanceStatus) || advance.advanceStatus === 'paid' || advance.advanceStatus === 'invoiced' || advance.advanceStatus === 'written_off') {
    if (advance.advanceStatus === 'rejected') {
      operationLogs.value.push({
        operator: '李四',
        action: '审核驳回',
        content: `驳回垫付单 ${advance.advanceNo}`,
        createTime: advance.applyDate,
        remark: advance.rejectReason
      })
    } else {
      operationLogs.value.push({
        operator: '李四',
        action: '审核通过',
        content: `审核通过垫付单 ${advance.advanceNo}`,
        createTime: advance.applyDate,
        remark: '资料完整，同意付款'
      })
    }
  }
  if (advance.paymentDate) {
    operationLogs.value.push({
      operator: '王五',
      action: '付款登记',
      content: `登记垫付单 ${advance.advanceNo} 付款信息`,
      createTime: `${advance.paymentDate} 14:30:25`,
      remark: `银行转账 ${formatMoney(advance.paidAmount)}元`
    })
  }
  if (advance.invoicedAmount > 0) {
    operationLogs.value.push({
      operator: advance.applicantName,
      action: '关联发票',
      content: `关联发票到垫付单 ${advance.advanceNo}`,
      createTime: advance.paymentDate || new Date().toISOString().split('T')[0],
      remark: `关联金额 ${formatMoney(advance.invoicedAmount)}元`
    })
  }
  if (advance.writtenOffAmount > 0) {
    operationLogs.value.push({
      operator: advance.applicantName,
      action: '核销',
      content: `核销垫付单 ${advance.advanceNo}`,
      createTime: '2026-07-15 10:30:00',
      remark: `核销金额 ${formatMoney(advance.writtenOffAmount)}元`
    })
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.advance-detail-container {
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
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

.amount-value.text-success { color: #67c23a; }
.amount-value.text-warning { color: #e6a23c; }
.amount-value.text-primary { color: #409eff; }

.text-success { color: #67c23a; }
.text-warning { color: #e6a23c; }
.text-danger { color: #f56c6c; }
.text-primary { color: #409eff; }
.text-muted { color: #c0c4cc; }

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

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.items-total {
  margin-top: 12px;
  text-align: right;
  font-size: 14px;
}

.form-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}
</style>
