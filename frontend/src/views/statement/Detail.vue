<template>
  <div class="statement-detail-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-divider direction="vertical" />
        <span class="page-title">对账单详情</span>
      </div>
      <div class="header-right">
        <el-button @click="handlePrint">
          <el-icon><Printer /></el-icon>
          打印
        </el-button>
        <el-button v-if="statementData.status === 'pending'" type="primary" @click="handleCheck">
          开始核对
        </el-button>
        <el-button v-if="statementData.status === 'checking' || statementData.status === 'difference'" type="primary" @click="handleConfirm">
          确认对账
        </el-button>
        <el-button v-if="statementData.status === 'confirmed'" @click="handleSend">
          发送对账单
        </el-button>
      </div>
    </div>

    <!-- 对账单信息 -->
    <div class="info-container">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="对账单号">{{ statementData.statementNo }}</el-descriptions-item>
        <el-descriptions-item label="对账类型">
          {{ statementData.partyType === 'customer' ? '客户对账' : '供应商对账' }}
        </el-descriptions-item>
        <el-descriptions-item label="对账期间">{{ statementData.period }}</el-descriptions-item>
        <el-descriptions-item label="对方名称">{{ statementData.partyName }}</el-descriptions-item>
        <el-descriptions-item label="我方金额">
          <span class="amount">¥{{ statementData.ourAmount.toLocaleString() }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="对方金额">
          <span class="amount">¥{{ statementData.theirAmount.toLocaleString() }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="差异金额">
          <span :class="{ 'diff-zero': statementData.difference === 0, 'diff-nonzero': statementData.difference !== 0 }">
            ¥{{ statementData.difference.toLocaleString() }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(statementData.status)" size="small">
            {{ getStatusText(statementData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ statementData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="确认时间">{{ statementData.confirmTime || '-' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 对账明细 -->
    <div class="detail-container">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="我方数据" name="our">
          <div class="tab-header">
            <span>我方金额合计：¥{{ ourTotal.toLocaleString() }}</span>
          </div>
          <el-table :data="ourDetailData" border stripe show-summary :summary-method="getOurSummary">
            <el-table-column prop="type" label="单据类型" width="100">
              <template #default="{ row }">
                {{ getBillTypeText(row.type) }}
              </template>
            </el-table-column>
            <el-table-column prop="billNo" label="单据编号" width="160" />
            <el-table-column prop="billDate" label="单据日期" width="110" />
            <el-table-column prop="invoiceNo" label="发票号" width="140" />
            <el-table-column prop="description" label="描述" min-width="150" />
            <el-table-column prop="amount" label="金额" width="120" align="right">
              <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="对方数据" name="their">
          <div class="tab-header">
            <span>对方金额合计：¥{{ theirTotal.toLocaleString() }}</span>
          </div>
          <el-table :data="theirDetailData" border stripe show-summary :summary-method="getTheirSummary">
            <el-table-column prop="type" label="单据类型" width="100">
              <template #default="{ row }">
                {{ getBillTypeText(row.type) }}
              </template>
            </el-table-column>
            <el-table-column prop="billNo" label="单据编号" width="160" />
            <el-table-column prop="billDate" label="单据日期" width="110" />
            <el-table-column prop="invoiceNo" label="发票号" width="140" />
            <el-table-column prop="description" label="描述" min-width="150" />
            <el-table-column prop="amount" label="金额" width="120" align="right">
              <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="差异分析" name="difference">
          <div class="difference-summary">
            <el-row :gutter="16">
              <el-col :span="8">
                <div class="diff-card">
                  <div class="diff-label">我方金额</div>
                  <div class="diff-value">¥{{ statementData.ourAmount.toLocaleString() }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="diff-card">
                  <div class="diff-label">对方金额</div>
                  <div class="diff-value">¥{{ statementData.theirAmount.toLocaleString() }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="diff-card" :class="{ 'diff-zero': statementData.difference === 0, 'diff-nonzero': statementData.difference !== 0 }">
                  <div class="diff-label">差异金额</div>
                  <div class="diff-value">¥{{ statementData.difference.toLocaleString() }}</div>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="diff-items" v-if="statementData.difference !== 0">
            <div class="section-title">差异明细</div>
            <el-table :data="differenceItems" border stripe>
              <el-table-column prop="item" label="差异项" width="150" />
              <el-table-column prop="ourAmount" label="我方金额" width="150" align="right">
                <template #default="{ row }">¥{{ row.ourAmount.toLocaleString() }}</template>
              </el-table-column>
              <el-table-column prop="theirAmount" label="对方金额" width="150" align="right">
                <template #default="{ row }">¥{{ row.theirAmount.toLocaleString() }}</template>
              </el-table-column>
              <el-table-column prop="difference" label="差异" width="150" align="right">
                <template #default="{ row }">
                  <span :class="{ 'diff-zero': row.difference === 0, 'diff-nonzero': row.difference !== 0 }">
                    ¥{{ row.difference.toLocaleString() }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="reason" label="差异原因" />
              <el-table-column label="操作" width="100">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="handleAdjust(row)">调整</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <el-empty v-else description="双方金额一致，无差异" />
        </el-tab-pane>

        <el-tab-pane label="操作记录" name="log">
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
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 核对对话框 -->
    <el-dialog v-model="showCheckDialog" title="核对差异" width="600px">
      <el-form ref="checkFormRef" :model="checkForm" label-width="100px">
        <el-form-item label="差异项">
          <el-input v-model="checkForm.item" disabled />
        </el-form-item>
        <el-form-item label="我方金额">
          <el-input-number
            v-model="checkForm.ourAmount"
            :precision="2"
            :controls="false"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="对方金额">
          <el-input-number
            v-model="checkForm.theirAmount"
            :precision="2"
            :controls="false"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="差异原因">
          <el-input v-model="checkForm.reason" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="处理方式">
          <el-select v-model="checkForm.handleType" style="width: 100%">
            <el-option label="调整我方" value="adjust_our" />
            <el-option label="调整对方" value="adjust_their" />
            <el-option label="双方调整" value="adjust_both" />
            <el-option label="确认差异" value="confirm_diff" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCheckDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitCheck">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
import { ArrowLeft, Printer } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 对账单数据
const statementData = reactive({
  id: 1,
  statementNo: 'DZD2024040001',
  partyType: 'customer',
  partyName: '深圳市腾讯科技有限公司',
  period: '2024-04',
  ourAmount: 800000,
  theirAmount: 750000,
  difference: -50000,
  status: 'difference',
  createTime: '2024-04-25 10:30:00',
  confirmTime: ''
})

// 当前标签页
const activeTab = ref('our')

// 我方明细数据
const ourDetailData = ref([
  { type: 'receivable', billNo: 'YS2024040001', billDate: '2024-04-15', invoiceNo: 'FP2024040001', description: '技术服务费', amount: 500000, remark: '' },
  { type: 'receivable', billNo: 'YS2024040002', billDate: '2024-04-18', invoiceNo: 'FP2024040002', description: '产品销售款', amount: 300000, remark: '' }
])

// 对方明细数据
const theirDetailData = ref([
  { type: 'their', billNo: 'AR2024040001', billDate: '2024-04-20', invoiceNo: '', description: '应付账款', amount: 480000, remark: '' },
  { type: 'their', billNo: 'AR2024040002', billDate: '2024-04-22', invoiceNo: '', description: '其他应付款', amount: 270000, remark: '' }
])

// 差异明细
const differenceItems = ref([
  { item: '技术服务费', ourAmount: 500000, theirAmount: 480000, difference: -20000, reason: '对方扣除了20000元手续费' },
  { item: '产品销售款', ourAmount: 300000, theirAmount: 270000, difference: -30000, reason: '对方认为产品存在质量问题，扣款30000元' }
])

// 操作记录
const operationLogs = ref([
  { timestamp: '2024-04-25 10:30:00', type: 'primary', title: '创建对账单', content: '系统自动生成了对账单 DZD2024040001' },
  { timestamp: '2024-04-25 14:00:00', type: 'warning', title: '数据核对', content: '发现2处差异，分别是技术服务费和产品销售款' },
  { timestamp: '2024-04-26 09:00:00', type: 'info', title: '发送对账单', content: '对账单已发送给深圳市腾讯科技有限公司' }
])

// 核对对话框
const showCheckDialog = ref(false)
const checkFormRef = ref<FormInstance>()
const checkForm = reactive({
  item: '',
  ourAmount: 0,
  theirAmount: 0,
  reason: '',
  handleType: ''
})

// 计算属性
const ourTotal = computed(() => {
  return ourDetailData.value.reduce((sum, row) => sum + row.amount, 0)
})

const theirTotal = computed(() => {
  return theirDetailData.value.reduce((sum, row) => sum + row.amount, 0)
})

// 方法
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'info',
    checking: 'warning',
    confirmed: 'success',
    difference: 'danger',
    sent: 'primary',
    archived: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待核对',
    checking: '核对中',
    confirmed: '已确认',
    difference: '有差异',
    sent: '已发送',
    archived: '已归档'
  }
  return texts[status] || status
}

const getBillTypeText = (type: string) => {
  const texts: Record<string, string> = {
    receivable: '应收单',
    payable: '应付单',
    invoice: '发票',
    their: '对方数据'
  }
  return texts[type] || type
}

const getOurSummary = ({ columns, data }: any) => {
  const sums: string[] = []
  columns.forEach((column: any, index: number) => {
    if (index === 0) {
      sums.push('合计')
      return
    }
    if (column.property === 'amount') {
      const total = data.reduce((sum: number, row: any) => sum + row.amount, 0)
      sums.push('¥' + total.toLocaleString())
    } else {
      sums.push('')
    }
  })
  return sums
}

const getTheirSummary = ({ columns, data }: any) => {
  const sums: string[] = []
  columns.forEach((column: any, index: number) => {
    if (index === 0) {
      sums.push('合计')
      return
    }
    if (column.property === 'amount') {
      const total = data.reduce((sum: number, row: any) => sum + row.amount, 0)
      sums.push('¥' + total.toLocaleString())
    } else {
      sums.push('')
    }
  })
  return sums
}

const handleBack = () => {
  router.push('/statement/list')
}

const handlePrint = () => {
  ElMessage.info('打印对账单')
}

const handleCheck = () => {
  activeTab.value = 'difference'
  ElMessage.info('请核对差异项')
}

const handleConfirm = () => {
  ElMessageBox.confirm(`确认对账单 ${statementData.statementNo} 吗？`, '确认对账', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    statementData.status = 'confirmed'
    statementData.confirmTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
    ElMessage.success('确认成功')
  }).catch(() => {})
}

const handleSend = () => {
  ElMessageBox.confirm(`发送对账单给 ${statementData.partyName} 吗？`, '发送对账单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    statementData.status = 'sent'
    ElMessage.success('发送成功')
  }).catch(() => {})
}

const handleAdjust = (row: any) => {
  Object.assign(checkForm, {
    item: row.item,
    ourAmount: row.ourAmount,
    theirAmount: row.theirAmount,
    reason: row.reason,
    handleType: ''
  })
  showCheckDialog.value = true
}

const handleSubmitCheck = () => {
  ElMessage.success('调整已保存')
  showCheckDialog.value = false
}
</script>

<style scoped>
.statement-detail-container {
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

.info-container {
  background: #fff;
  margin: 16px 20px;
  padding: 20px;
  border-radius: 8px;
}

.amount {
  font-weight: 600;
  color: #303133;
}

.diff-zero {
  color: #67c23a;
  font-weight: 600;
}

.diff-nonzero {
  color: #f56c6c;
  font-weight: 600;
}

.detail-container {
  background: #fff;
  margin: 0 20px 16px;
  padding: 20px;
  border-radius: 8px;
}

.tab-header {
  margin-bottom: 16px;
  font-size: 14px;
  color: #606266;
}

.difference-summary {
  margin-bottom: 24px;
}

.diff-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.diff-card.diff-zero {
  background: #f0f9eb;
}

.diff-card.diff-nonzero {
  background: #fef0f0;
}

.diff-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.diff-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.diff-card.diff-zero .diff-value {
  color: #67c23a;
}

.diff-card.diff-nonzero .diff-value {
  color: #f56c6c;
}

.diff-items {
  margin-top: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 4px solid #409eff;
}
</style>
