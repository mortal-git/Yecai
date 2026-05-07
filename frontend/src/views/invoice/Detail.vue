<template>
  <div class="invoice-detail-container">
    <!-- 操作按钮 -->
    <div class="detail-actions">
      <el-button v-if="invoiceData.invoiceStatus === 'draft'" type="primary" @click="handleSubmitVerify">
        <el-icon><Check /></el-icon>
        提交查验
      </el-button>
      <el-button v-if="['draft', 'pending'].includes(invoiceData.invoiceStatus)" type="success" @click="handleVerify">
        <el-icon><CircleCheck /></el-icon>
        查验
      </el-button>
      <el-button v-if="invoiceData.invoiceStatus === 'verified' && invoiceData.invoiceDirection === 'JX'" type="primary" @click="handleAuth">
        <el-icon><Medal /></el-icon>
        认证
      </el-button>
      <el-button v-if="invoiceData.authStatus === 'authenticated' && invoiceData.invoiceDirection === 'JX'" type="warning" @click="handleDeduct">
        <el-icon><Wallet /></el-icon>
        抵扣
      </el-button>
      <el-button v-if="invoiceData.invoiceStatus === 'verified'" type="info" @click="handleRelate">
        <el-icon><Link /></el-icon>
        关联单据
      </el-button>
      <el-button v-if="['verified', 'authenticated', 'deducted'].includes(invoiceData.invoiceStatus)" type="danger" @click="handleCancel">
        <el-icon><Close /></el-icon>
        作废
      </el-button>
      <el-button v-if="['verified', 'authenticated', 'deducted'].includes(invoiceData.invoiceStatus)" type="warning" @click="handleRedLetter">
        <el-icon><DocumentDelete /></el-icon>
        红冲
      </el-button>
      <el-button @click="handleViewAttachment">
        <el-icon><Picture /></el-icon>
        查看影像
      </el-button>
      <el-button @click="handlePrint">
        <el-icon><Printer /></el-icon>
        打印
      </el-button>
    </div>

    <!-- 基本信息卡片 -->
    <el-card class="detail-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">发票信息</span>
          <el-tag :type="getStatusConfig(invoiceData.invoiceStatus).type">
            {{ getStatusConfig(invoiceData.invoiceStatus).label }}
          </el-tag>
        </div>
      </template>

      <el-descriptions :column="3" border size="small">
        <el-descriptions-item label="发票号码" :span="2">
          <el-link type="primary" @click="handleCopy(invoiceData.invoiceNo)">
            {{ invoiceData.invoiceNo }}
            <el-icon style="margin-left: 4px;"><CopyDocument /></el-icon>
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="发票类型">
          <el-tag :type="getInvoiceTypeTagType(invoiceData.invoiceType)" size="small">
            {{ getInvoiceTypeLabel(invoiceData.invoiceType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发票方向">
          {{ invoiceData.invoiceDirection === 'JX' ? '进项发票' : '销项发票' }}
        </el-descriptions-item>
        <el-descriptions-item label="发票代码">{{ invoiceData.invoiceCode }}</el-descriptions-item>
        <el-descriptions-item label="发票号码">{{ invoiceData.invoiceNumber }}</el-descriptions-item>
        <el-descriptions-item label="开票日期">{{ invoiceData.billingDate }}</el-descriptions-item>
        <el-descriptions-item label="不含税金额">
          <span class="amount">¥{{ formatNumber(invoiceData.amountWithoutTax) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="税率">
          {{ (invoiceData.taxRate * 100).toFixed(0) }}%
        </el-descriptions-item>
        <el-descriptions-item label="税额">
          <span class="amount primary">¥{{ formatNumber(invoiceData.taxAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="价税合计" :span="3">
          <span class="amount large">¥{{ formatNumber(invoiceData.totalAmount) }}</span>
          <span class="amount-rmb">（大写：{{ digitToChinese(invoiceData.totalAmount) }}）</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 供应商/客户信息 -->
    <el-card class="detail-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">{{ invoiceData.invoiceDirection === 'JX' ? '供应商信息' : '客户信息' }}</span>
        </div>
      </template>

      <el-descriptions :column="3" border size="small">
        <el-descriptions-item :label="invoiceData.invoiceDirection === 'JX' ? '供应商名称' : '客户名称'" :span="2">
          {{ invoiceData.supplierName || invoiceData.customerName }}
        </el-descriptions-item>
        <el-descriptions-item :label="invoiceData.invoiceDirection === 'JX' ? '供应商税号' : '客户税号'">
          {{ invoiceData.supplierTaxNo || invoiceData.customerTaxNo }}
        </el-descriptions-item>
        <el-descriptions-item :label="invoiceData.invoiceDirection === 'JX' ? '供应商地址电话' : '客户地址电话'" :span="2">
          {{ invoiceData.supplierAddress || invoiceData.customerAddress || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="invoiceData.invoiceDirection === 'JX' ? '供应商银行账号' : '客户银行账号'">
          {{ invoiceData.supplierBank || invoiceData.customerBank || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 认证抵扣信息（进项票显示） -->
    <el-card v-if="invoiceData.invoiceDirection === 'JX'" class="detail-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">认证抵扣信息</span>
          <el-tag v-if="invoiceData.authStatus" :type="getAuthStatusConfig(invoiceData.authStatus).type" size="small">
            {{ getAuthStatusConfig(invoiceData.authStatus).label }}
          </el-tag>
        </div>
      </template>

      <el-descriptions :column="3" border size="small">
        <el-descriptions-item label="认证期限">
          {{ invoiceData.authDeadline || '-' }}
          <el-tag v-if="authDeadlineWarning" type="warning" size="small" style="margin-left: 8px;">即将到期</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="认证期间">{{ invoiceData.authPeriod || '-' }}</el-descriptions-item>
        <el-descriptions-item label="抵扣期间">{{ invoiceData.deductPeriod || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 开票明细 -->
    <el-card class="detail-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">开票明细</span>
        </div>
      </template>

      <el-table :data="invoiceData.items || mockItems" border size="small">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="商品/服务名称" min-width="200" />
        <el-table-column prop="taxClassificationCode" label="税收分类编码" width="120" />
        <el-table-column prop="spec" label="规格型号" width="100" />
        <el-table-column prop="unit" label="单位" width="60" align="center" />
        <el-table-column prop="quantity" label="数量" width="80" align="right" />
        <el-table-column prop="unitPrice" label="单价" width="120" align="right">
          <template #default="{ row }">¥{{ formatNumber(row.unitPrice) }}</template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120" align="right">
          <template #default="{ row }">¥{{ formatNumber(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="taxRate" label="税率" width="80" align="center">
          <template #default="{ row }">{{ (row.taxRate * 100).toFixed(0) }}%</template>
        </el-table-column>
        <el-table-column prop="taxAmount" label="税额" width="120" align="right">
          <template #default="{ row }">¥{{ formatNumber(row.taxAmount) }}</template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="价税合计" width="130" align="right">
          <template #default="{ row }">
            <span class="amount">¥{{ formatNumber(row.totalAmount) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 关联单据 -->
    <el-card class="detail-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">关联单据</span>
          <el-button type="primary" link size="small" @click="handleRelate">
            <el-icon><Plus /></el-icon>
            添加关联
          </el-button>
        </div>
      </template>

      <el-tabs v-model="relatedTab">
        <el-tab-pane label="关联订单" name="order">
          <el-table :data="relatedOrders" border size="small">
            <el-table-column prop="orderNo" label="订单编号" width="180">
              <template #default="{ row }">
                <el-link type="primary">{{ row.orderNo }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="订单类型" width="100">
              <template #default="{ row }">
                {{ row.type === 'sale' ? '销售订单' : '采购订单' }}
              </template>
            </el-table-column>
            <el-table-column prop="partyName" label="客户/供应商" min-width="150" />
            <el-table-column prop="amount" label="订单金额" width="130" align="right">
              <template #default="{ row }">¥{{ formatNumber(row.amount) }}</template>
            </el-table-column>
            <el-table-column prop="relatedAmount" label="关联金额" width="130" align="right">
              <template #default="{ row }">¥{{ formatNumber(row.relatedAmount) }}</template>
            </el-table-column>
            <el-table-column prop="createTime" label="关联时间" width="160" />
          </el-table>
          <el-empty v-if="!relatedOrders.length" description="暂无关联订单" />
        </el-tab-pane>

        <el-tab-pane v-if="invoiceData.invoiceDirection === 'JX'" label="关联成本单" name="cost">
          <el-table :data="relatedCost" border size="small">
            <el-table-column prop="costNo" label="成本单号" width="180">
              <template #default="{ row }">
                <el-link type="primary">{{ row.costNo }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="costType" label="成本类型" width="100" />
            <el-table-column prop="supplierName" label="供应商" min-width="150" />
            <el-table-column prop="amount" label="成本金额" width="130" align="right">
              <template #default="{ row }">¥{{ formatNumber(row.amount) }}</template>
            </el-table-column>
            <el-table-column prop="relatedAmount" label="关联金额" width="130" align="right">
              <template #default="{ row }">¥{{ formatNumber(row.relatedAmount) }}</template>
            </el-table-column>
            <el-table-column prop="createTime" label="关联时间" width="160" />
          </el-table>
          <el-empty v-if="!relatedCost.length" description="暂无关联成本单" />
        </el-tab-pane>

        <el-tab-pane label="关联收付款" name="payment">
          <el-table :data="relatedPayment" border size="small">
            <el-table-column prop="paymentNo" label="收付款单号" width="180">
              <template #default="{ row }">
                <el-link type="primary">{{ row.paymentNo }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                {{ invoiceData.invoiceDirection === 'JX' ? '付款单' : '收款单' }}
              </template>
            </el-table-column>
            <el-table-column prop="partyName" label="对方单位" min-width="150" />
            <el-table-column prop="amount" label="收付款金额" width="130" align="right">
              <template #default="{ row }">¥{{ formatNumber(row.amount) }}</template>
            </el-table-column>
            <el-table-column prop="relatedAmount" label="关联金额" width="130" align="right">
              <template #default="{ row }">¥{{ formatNumber(row.relatedAmount) }}</template>
            </el-table-column>
            <el-table-column prop="createTime" label="关联时间" width="160" />
          </el-table>
          <el-empty v-if="!relatedPayment.length" description="暂无关联收付款" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 查验记录 -->
    <el-card v-if="verifyRecords.length > 0" class="detail-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">查验记录</span>
        </div>
      </template>

      <el-table :data="verifyRecords" border size="small">
        <el-table-column prop="verifyTime" label="查验时间" width="160" />
        <el-table-column prop="verifyStatus" label="查验状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.verifyStatus === 'success' ? 'success' : 'danger'" size="small">
              {{ row.verifyStatus === 'success' ? '查验成功' : '查验失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="verifyResult" label="查验结果" min-width="200" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button type="primary" link size="small">查看报告</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 操作记录 -->
    <el-card class="detail-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">操作记录</span>
        </div>
      </template>

      <el-table :data="operationLogs" border size="small">
        <el-table-column prop="operateTime" label="操作时间" width="160" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="operateContent" label="操作内容" min-width="150" />
        <el-table-column prop="beforeStatus" label="操作前状态" width="100">
          <template #default="{ row }">
            {{ row.beforeStatus ? getStatusConfig(row.beforeStatus).label : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="afterStatus" label="操作后状态" width="100">
          <template #default="{ row }">
            {{ row.afterStatus ? getStatusConfig(row.afterStatus).label : '-' }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 作废/红冲记录 -->
    <el-card v-if="invoiceData.invoiceStatus === 'cancelled' || invoiceData.invoiceStatus === 'red_letter'" class="detail-card danger" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">{{ invoiceData.invoiceStatus === 'cancelled' ? '作废记录' : '红冲记录' }}</span>
        </div>
      </template>

      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="操作时间">{{ cancelRecord?.operateTime }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ cancelRecord?.operator }}</el-descriptions-item>
        <el-descriptions-item label="原因" :span="2">{{ cancelRecord?.reason }}</el-descriptions-item>
        <el-descriptions-item v-if="cancelRecord?.attachment" label="附件" :span="2">
          <el-button type="primary" link size="small">
            <el-icon><Download /></el-icon>
            下载证明文件
          </el-button>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 影像查看抽屉 -->
    <el-drawer v-model="showAttachment" title="发票影像" size="60%">
      <div class="attachment-viewer">
        <el-carousel v-if="invoiceData.attachments?.length" height="600px" indicator-position="outside">
          <el-carousel-item v-for="(item, index) in invoiceData.attachments" :key="index">
            <img :src="item.url" class="attachment-image" />
          </el-carousel-item>
        </el-carousel>
        <el-empty v-else description="暂无影像文件" />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Check, CircleCheck, Medal, Wallet, Link, Close, DocumentDelete,
  Picture, Printer, Plus, Download, CopyDocument
} from '@element-plus/icons-vue'
import type { InvoiceStatus, AuthStatus, InvoiceType } from './types'

const props = defineProps<{
  invoiceId: string
  invoiceData?: any
}>()

const emit = defineEmits<{
  close: []
  refresh: []
}>()

const router = useRouter()

// 状态
const loading = ref(false)
const showAttachment = ref(false)
const relatedTab = ref('order')

// 发票数据
const invoiceData = ref<any>({
  id: 'INV00000001',
  invoiceNo: 'JXFP20240401000001',
  invoiceType: 'SZ',
  invoiceDirection: 'JX',
  invoiceCode: '144031900110',
  invoiceNumber: '12345678',
  billingDate: '2024-04-15',
  amountWithoutTax: 8849.56,
  taxRate: 0.09,
  taxAmount: 796.46,
  totalAmount: 9646.02,
  invoiceStatus: 'verified',
  authStatus: 'authenticated',
  authPeriod: '2024-04',
  deductPeriod: '2024-04',
  authDeadline: '2025-04-10',
  supplierName: '深圳市腾讯科技有限公司',
  supplierTaxNo: '91440300MA5XXXX1X',
  supplierAddress: '深圳市南山区科技中一路88号 0755-86013388',
  supplierBank: '招商银行深圳科技园支行 6222988888888888',
  createTime: '2024-04-15 10:30:00',
  createBy: '张三',
  items: [
    {
      name: '咨询服务费',
      taxClassificationCode: '3040101',
      spec: '-',
      unit: '次',
      quantity: 1,
      unitPrice: 8849.56,
      amount: 8849.56,
      taxRate: 0.09,
      taxAmount: 796.46,
      totalAmount: 9646.02
    }
  ],
  attachments: [
    { url: 'https://via.placeholder.com/400x600?text=发票图片1' },
    { url: 'https://via.placeholder.com/400x600?text=发票图片2' }
  ]
})

// 关联数据
const relatedOrders = ref<any[]>([
  {
    orderNo: 'PO20240401000001',
    type: 'purchase',
    partyName: '深圳市腾讯科技有限公司',
    amount: 50000,
    relatedAmount: 9646.02,
    createTime: '2024-04-16 14:30:00'
  }
])

const relatedCost = ref<any[]>([])
const relatedPayment = ref<any[]>([])

// 查验记录
const verifyRecords = ref<any[]>([
  {
    verifyTime: '2024-04-15 10:35:00',
    verifyStatus: 'success',
    verifyResult: '发票真实有效，状态正常',
    operator: '系统'
  }
])

// 操作记录
const operationLogs = ref<any[]>([
  { operateTime: '2024-04-15 10:30:00', operator: '张三', operateContent: '录入发票', beforeStatus: '', afterStatus: 'draft' },
  { operateTime: '2024-04-15 10:35:00', operator: '张三', operateContent: '提交查验', beforeStatus: 'draft', afterStatus: 'pending' },
  { operateTime: '2024-04-15 10:36:00', operator: '系统', operateContent: '查验完成', beforeStatus: 'pending', afterStatus: 'verified' },
  { operateTime: '2024-04-16 09:00:00', operator: '李四', operateContent: '发票认证', beforeStatus: 'verified', afterStatus: 'authenticated' }
])

// 作废/红冲记录
const cancelRecord = ref<any>(null)

// 模拟数据
const mockItems = [
  {
    name: '咨询服务费',
    taxClassificationCode: '3040101',
    spec: '-',
    unit: '次',
    quantity: 1,
    unitPrice: 8849.56,
    amount: 8849.56,
    taxRate: 0.09,
    taxAmount: 796.46,
    totalAmount: 9646.02
  }
]

// 计算属性
const authDeadlineWarning = computed(() => {
  if (!invoiceData.value.authDeadline) return false
  const deadline = new Date(invoiceData.value.authDeadline)
  const now = new Date()
  const diff = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diff <= 30 && diff > 0
})

// 方法
const getStatusConfig = (status: InvoiceStatus) => {
  const config: Record<InvoiceStatus, { label: string; type: string }> = {
    'draft': { label: '草稿', type: 'info' },
    'pending': { label: '待查验', type: 'warning' },
    'verified': { label: '已查验', type: 'success' },
    'related': { label: '已关联', type: 'primary' },
    'authenticated': { label: '已认证', type: 'primary' },
    'deducted': { label: '已抵扣', type: 'success' },
    'cancelled': { label: '已作废', type: 'danger' },
    'red_letter': { label: '已红冲', type: 'danger' },
    'abnormal': { label: '异常票', type: 'danger' }
  }
  return config[status] || { label: status, type: 'info' }
}

const getAuthStatusConfig = (status: AuthStatus) => {
  const config: Record<AuthStatus, { label: string; type: string }> = {
    'unauthenticated': { label: '未认证', type: 'info' },
    'authenticated': { label: '已认证', type: 'success' },
    'deducted': { label: '已抵扣', type: 'primary' }
  }
  return config[status] || { label: status, type: 'info' }
}

const getInvoiceTypeLabel = (type: InvoiceType) => {
  const labels: Record<InvoiceType, string> = {
    'SZ': '专票',
    'PT': '普票',
    'DZ': '电子',
    'JD': '机动车',
    'QKL': '区块链',
    'HG': '海关'
  }
  return labels[type] || type
}

const getInvoiceTypeTagType = (type: InvoiceType) => {
  const types: Record<InvoiceType, string> = {
    'SZ': 'danger',
    'PT': 'primary',
    'DZ': 'success',
    'JD': 'warning',
    'QKL': 'info',
    'HG': ''
  }
  return types[type] || 'info'
}

const formatNumber = (value: number) => {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const digitToChinese = (num: number): string => {
  const fraction = ['角', '分']
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const unit = [['元', '万', '亿'], ['', '拾', '佰', '仟']]

  let s = ''
  const numStr = num.toFixed(2)
  const decimalPart = numStr.split('.')[1]
  const integerPart = numStr.split('.')[0]

  let zheng = ''
  let count = 0
  for (let i = integerPart.length - 1; i >= 0; i--) {
    const n = parseInt(integerPart[i])
    if (count !== 0 && count % 4 === 0) {
      zheng = digit[0] + zheng
    }
    if (n !== 0) {
      zheng = digit[n] + unit[1][count % 4] + zheng
    } else {
      zheng = digit[n] + zheng
    }
    count++
  }

  let jiao = ''
  if (decimalPart) {
    for (let i = 0; i < decimalPart.length; i++) {
      const n = parseInt(decimalPart[i])
      if (i < 2) {
        jiao += digit[n] + fraction[i]
      }
    }
  }

  s = zheng + jiao
  return s.replace(/零角零分/g, '').replace(/零角/g, '零').replace(/零分/g, '').replace(/零元/g, '元').replace(/亿万/g, '亿')
}

const handleCopy = (text: string) => {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制到剪贴板')
}

const handleSubmitVerify = async () => {
  try {
    await ElMessageBox.confirm('确定要提交查验该发票吗？', '提交查验', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    loading.value = true
    setTimeout(() => {
      loading.value = false
      invoiceData.value.invoiceStatus = 'pending'
      ElMessage.success('提交查验成功')
      emit('refresh')
    }, 1000)
  } catch {
    // 取消
  }
}

const handleVerify = async () => {
  try {
    await ElMessageBox.confirm('确定要查验该发票吗？', '发票查验', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    loading.value = true
    setTimeout(() => {
      loading.value = false
      invoiceData.value.invoiceStatus = 'verified'
      verifyRecords.value.push({
        verifyTime: new Date().toLocaleString(),
        verifyStatus: 'success',
        verifyResult: '发票真实有效，状态正常',
        operator: '系统'
      })
      operationLogs.value.push({
        operateTime: new Date().toLocaleString(),
        operator: '系统',
        operateContent: '查验完成',
        beforeStatus: 'pending',
        afterStatus: 'verified'
      })
      ElMessage.success('查验成功')
      emit('refresh')
    }, 1000)
  } catch {
    // 取消
  }
}

const handleAuth = async () => {
  try {
    await ElMessageBox.confirm('确定要认证该发票吗？', '发票认证', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    loading.value = true
    setTimeout(() => {
      loading.value = false
      invoiceData.value.authStatus = 'authenticated'
      invoiceData.value.authPeriod = '2024-04'
      operationLogs.value.push({
        operateTime: new Date().toLocaleString(),
        operator: '李四',
        operateContent: '发票认证',
        beforeStatus: 'verified',
        afterStatus: 'authenticated'
      })
      ElMessage.success('认证成功')
      emit('refresh')
    }, 1000)
  } catch {
    // 取消
  }
}

const handleDeduct = async () => {
  try {
    await ElMessageBox.confirm('确定要抵扣该发票吗？', '发票抵扣', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    loading.value = true
    setTimeout(() => {
      loading.value = false
      invoiceData.value.authStatus = 'deducted'
      invoiceData.value.deductPeriod = '2024-04'
      operationLogs.value.push({
        operateTime: new Date().toLocaleString(),
        operator: '李四',
        operateContent: '发票抵扣',
        beforeStatus: 'authenticated',
        afterStatus: 'deducted'
      })
      ElMessage.success('抵扣成功')
      emit('refresh')
    }, 1000)
  } catch {
    // 取消
  }
}

const handleRelate = () => {
  ElMessage.info('打开关联单据页面')
}

const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定要作废该发票吗？', '发票作废', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    loading.value = true
    setTimeout(() => {
      loading.value = false
      invoiceData.value.invoiceStatus = 'cancelled'
      cancelRecord.value = {
        operateTime: new Date().toLocaleString(),
        operator: '王五',
        reason: '发票开具有误'
      }
      operationLogs.value.push({
        operateTime: new Date().toLocaleString(),
        operator: '王五',
        operateContent: '发票作废',
        beforeStatus: 'verified',
        afterStatus: 'cancelled'
      })
      ElMessage.success('作废成功')
      emit('refresh')
    }, 1000)
  } catch {
    // 取消
  }
}

const handleRedLetter = async () => {
  try {
    await ElMessageBox.confirm('确定要红冲该发票吗？', '发票红冲', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    loading.value = true
    setTimeout(() => {
      loading.value = false
      invoiceData.value.invoiceStatus = 'red_letter'
      cancelRecord.value = {
        operateTime: new Date().toLocaleString(),
        operator: '王五',
        reason: '退货冲红'
      }
      operationLogs.value.push({
        operateTime: new Date().toLocaleString(),
        operator: '王五',
        operateContent: '发票红冲',
        beforeStatus: 'verified',
        afterStatus: 'red_letter'
      })
      ElMessage.success('红冲成功')
      emit('refresh')
    }, 1000)
  } catch {
    // 取消
  }
}

const handleViewAttachment = () => {
  showAttachment.value = true
}

const handlePrint = () => {
  window.print()
}

onMounted(() => {
  // 如果有props.invoiceData，使用props的数据
  if (props.invoiceData) {
    invoiceData.value = props.invoiceData
  }
})
</script>

<style scoped>
.invoice-detail-container {
  padding: 0;
}

.detail-actions {
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.detail-card {
  margin: 16px;
  border-radius: 8px;
}

.detail-card.danger {
  border: 1px solid #f56c6c;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.amount {
  font-weight: 600;
  color: #303133;
}

.amount.primary {
  color: #409eff;
}

.amount.large {
  font-size: 18px;
  color: #f56c6c;
}

.amount-rmb {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}

.attachment-viewer {
  text-align: center;
  padding: 20px;
}

.attachment-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

:deep(.el-card__header) {
  padding: 12px 20px;
  background: #fafafa;
}

:deep(.el-descriptions__label) {
  background: #fafafa;
}
</style>
