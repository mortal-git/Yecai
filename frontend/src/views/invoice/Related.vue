<template>
  <div class="invoice-related-container">
    <!-- 发票信息概要 -->
    <div class="invoice-summary">
      <el-descriptions :column="4" border size="small">
        <el-descriptions-item label="发票号码">{{ invoiceInfo.invoiceNo }}</el-descriptions-item>
        <el-descriptions-item label="发票类型">{{ getInvoiceTypeLabel(invoiceInfo.invoiceType) }}</el-descriptions-item>
        <el-descriptions-item label="价税合计">
          <span class="amount">¥{{ formatNumber(invoiceInfo.totalAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="已关联金额">
          <span class="amount primary">¥{{ formatNumber(invoiceInfo.relatedAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="可用金额" :span="4">
          <span class="amount large">¥{{ formatNumber(invoiceInfo.availableAmount) }}</span>
          <el-progress
            :percentage="relatedPercentage"
            :stroke-width="8"
            style="width: 300px; display: inline-block; margin-left: 20px;"
            :color="relatedPercentage >= 100 ? '#67c23a' : relatedPercentage >= 50 ? '#409eff' : '#e6a23c'"
          />
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 已关联单据 -->
    <div class="related-section">
      <div class="section-header">
        <span class="section-title">已关联单据</span>
        <el-tag type="info">{{ relatedDocuments.length }} 条</el-tag>
      </div>

      <el-table :data="relatedDocuments" border size="small">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="type" label="单据类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ getDocTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="no" label="单据编号" width="180">
          <template #default="{ row }">
            <el-link type="primary">{{ row.no }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="partyName" label="对方单位" min-width="150" />
        <el-table-column prop="amount" label="单据金额" width="130" align="right">
          <template #default="{ row }">¥{{ formatNumber(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="relatedAmount" label="关联金额" width="130" align="right">
          <template #default="{ row }">
            <span class="amount">¥{{ formatNumber(row.relatedAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="关联时间" width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row, $index }">
            <el-button type="primary" link size="small" @click="handleEditRelated(row, $index)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDeleteRelated(row, $index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!relatedDocuments.length" description="暂无关联单据" />
    </div>

    <!-- 添加关联 -->
    <div class="add-section">
      <div class="section-header">
        <span class="section-title">添加关联</span>
      </div>

      <el-form :model="addForm" :inline="true" size="small">
        <el-form-item label="单据类型">
          <el-select v-model="addForm.type" placeholder="请选择单据类型" style="width: 150px;" @change="handleTypeChange">
            <el-option
              v-for="item in availableDocTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="addForm.keyword" placeholder="单据编号/客户名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :data="searchResults" border size="small" v-loading="searchLoading">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="no" label="单据编号" width="180">
          <template #default="{ row }">
            <el-link type="primary">{{ row.no }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="单据类型" width="120">
          <template #default="{ row }">
            {{ getDocTypeLabel(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="partyName" label="对方单位" min-width="150" />
        <el-table-column prop="amount" label="单据金额" width="130" align="right">
          <template #default="{ row }">¥{{ formatNumber(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="remainingAmount" label="可用金额" width="130" align="right">
          <template #default="{ row }">
            <span class="amount primary">¥{{ formatNumber(row.remainingAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="单据日期" width="120" />
        <el-table-column label="关联金额" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.relatedAmount"
              :min="0"
              :max="row.remainingAmount"
              :precision="2"
              size="small"
              style="width: 120px;"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleAddRelated(row)" :disabled="!row.relatedAmount">
              添加
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!searchResults.length && searched" description="未搜索到可关联的单据" />
    </div>

    <!-- 关联规则说明 -->
    <div class="rules-section">
      <el-alert type="info" :closable="false">
        <template #title>
          <strong>关联规则：</strong>
          <ul class="rules-list">
            <li>一张发票可关联多个单据，关联金额合计不能超过发票价税合计</li>
            <li>多张发票可关联一个单据，但每张发票的关联金额不能超过其可用余额</li>
            <li>已认证/已抵扣的发票，解除关联需先撤销认证/抵扣状态</li>
            <li>进项发票只能关联采购类单据（采购订单、成本单、预付款等）</li>
            <li>销项发票只能关联销售类单据（销售订单、应收单、收款单等）</li>
          </ul>
        </template>
      </el-alert>
    </div>

    <!-- 编辑关联金额对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑关联金额" width="400px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="单据编号">
          <div>{{ editForm.no }}</div>
        </el-form-item>
        <el-form-item label="原关联金额">
          <div>¥{{ formatNumber(editForm.originalAmount) }}</div>
        </el-form-item>
        <el-form-item label="新关联金额" required>
          <el-input-number
            v-model="editForm.newAmount"
            :min="0"
            :max="editForm.maxAmount"
            :precision="2"
            style="width: 100%;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmEdit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import type { InvoiceType } from './types'

const props = defineProps<{
  invoiceId: string
  invoiceDirection?: string
}>()

const emit = defineEmits<{
  close: []
  refresh: []
}>()

// 发票信息
const invoiceInfo = ref({
  invoiceNo: 'JXFP20240401000001',
  invoiceType: 'SZ' as InvoiceType,
  totalAmount: 9646.02,
  relatedAmount: 5000,
  availableAmount: 4646.02
})

// 已关联单据
const relatedDocuments = ref<any[]>([
  {
    id: '1',
    type: 'order',
    no: 'PO20240401000001',
    partyName: '深圳市腾讯科技有限公司',
    amount: 50000,
    relatedAmount: 5000,
    createTime: '2024-04-16 14:30:00'
  }
])

// 添加关联表单
const addForm = reactive({
  type: '',
  keyword: ''
})

// 搜索结果
const searchResults = ref<any[]>([])
const searchLoading = ref(false)
const searched = ref(false)

// 编辑对话框
const showEditDialog = ref(false)
const editForm = reactive({
  index: -1,
  no: '',
  originalAmount: 0,
  newAmount: 0,
  maxAmount: 0
})

// 可关联单据类型
const docTypes = [
  { value: 'order', label: '销售订单', directions: ['SX'] },
  { value: 'purchase_order', label: '采购订单', directions: ['JX'] },
  { value: 'monthly_cost', label: '月结成本单', directions: ['JX'] },
  { value: 'prepayment', label: '预付款单', directions: ['JX'] },
  { value: 'advance_cost', label: '垫付成本单', directions: ['JX'] },
  { value: 'receivable', label: '应收单', directions: ['SX'] },
  { value: 'payable', label: '应付单', directions: ['JX'] },
  { value: 'collection', label: '收款单', directions: ['SX'] },
  { value: 'payment', label: '付款单', directions: ['JX'] }
]

// 计算属性
const availableDocTypes = computed(() => {
  if (!props.invoiceDirection) return docTypes
  return docTypes.filter(dt => dt.directions.includes(props.invoiceDirection as any))
})

const relatedPercentage = computed(() => {
  if (invoiceInfo.value.totalAmount === 0) return 0
  return Math.round((invoiceInfo.value.relatedAmount / invoiceInfo.value.totalAmount) * 100)
})

// 方法
const getInvoiceTypeLabel = (type: InvoiceType) => {
  const labels: Record<InvoiceType, string> = {
    'SZ': '增值税专用发票',
    'PT': '增值税普通发票',
    'DZ': '电子发票',
    'JD': '机动车销售统一发票',
    'QKL': '区块链电子发票',
    'HG': '海关缴款书'
  }
  return labels[type] || type
}

const getDocTypeLabel = (type: string) => {
  const doc = docTypes.find(d => d.value === type)
  return doc ? doc.label : type
}

const formatNumber = (value: number) => {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const handleTypeChange = () => {
  addForm.keyword = ''
  searchResults.value = []
  searched.value = false
}

const handleSearch = () => {
  if (!addForm.type) {
    ElMessage.warning('请先选择单据类型')
    return
  }

  searchLoading.value = true
  searched.value = true

  // 模拟搜索
  setTimeout(() => {
    searchLoading.value = false
    searchResults.value = [
      {
        id: '1',
        no: 'PO20240403000003',
        type: addForm.type,
        partyName: '华为技术有限公司',
        amount: 30000,
        remainingAmount: 20000,
        date: '2024-04-03',
        relatedAmount: 0
      },
      {
        id: '2',
        no: 'PO20240405000005',
        type: addForm.type,
        partyName: '小米科技有限公司',
        amount: 15000,
        remainingAmount: 15000,
        date: '2024-04-05',
        relatedAmount: 0
      },
      {
        id: '3',
        no: 'PO20240408000008',
        type: addForm.type,
        partyName: '京东集团',
        amount: 80000,
        remainingAmount: 80000,
        date: '2024-04-08',
        relatedAmount: 0
      }
    ].filter(item => item.type === addForm.type)
  }, 500)
}

const handleAddRelated = (row: any) => {
  if (row.relatedAmount <= 0) {
    ElMessage.warning('请输入关联金额')
    return
  }

  if (row.relatedAmount > row.remainingAmount) {
    ElMessage.warning('关联金额不能超过单据可用金额')
    return
  }

  if (invoiceInfo.value.availableAmount <= 0) {
    ElMessage.warning('发票可用金额已用完')
    return
  }

  if (row.relatedAmount > invoiceInfo.value.availableAmount) {
    ElMessage.warning('关联金额不能超过发票可用金额')
    return
  }

  // 添加关联
  relatedDocuments.value.push({
    id: row.id,
    type: row.type,
    no: row.no,
    partyName: row.partyName,
    amount: row.amount,
    relatedAmount: row.relatedAmount,
    createTime: new Date().toLocaleString()
  })

  // 更新发票信息
  invoiceInfo.value.relatedAmount += row.relatedAmount
  invoiceInfo.value.availableAmount -= row.relatedAmount

  // 从搜索结果移除
  searchResults.value = searchResults.value.filter(r => r.id !== row.id)

  ElMessage.success('关联成功')
  emit('refresh')
}

const handleEditRelated = (row: any, index: number) => {
  editForm.index = index
  editForm.no = row.no
  editForm.originalAmount = row.relatedAmount
  editForm.newAmount = row.relatedAmount
  editForm.maxAmount = row.amount - row.relatedAmount + invoiceInfo.value.availableAmount
  showEditDialog.value = true
}

const handleConfirmEdit = () => {
  if (editForm.newAmount < 0) {
    ElMessage.warning('关联金额不能为负数')
    return
  }

  const diff = editForm.newAmount - editForm.originalAmount

  if (diff > invoiceInfo.value.availableAmount) {
    ElMessage.warning('关联金额增量超过发票可用金额')
    return
  }

  // 更新关联金额
  relatedDocuments.value[editForm.index].relatedAmount = editForm.newAmount

  // 更新发票信息
  invoiceInfo.value.relatedAmount += diff
  invoiceInfo.value.availableAmount -= diff

  showEditDialog.value = false
  ElMessage.success('修改成功')
  emit('refresh')
}

const handleDeleteRelated = async (row: any, index: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该关联吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 更新发票信息
    invoiceInfo.value.relatedAmount -= row.relatedAmount
    invoiceInfo.value.availableAmount += row.relatedAmount

    // 删除关联
    relatedDocuments.value.splice(index, 1)

    ElMessage.success('删除成功')
    emit('refresh')
  } catch {
    // 取消
  }
}

onMounted(() => {
  // 初始化
})
</script>

<style scoped>
.invoice-related-container {
  padding: 0;
}

.invoice-summary {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.related-section,
.add-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
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

.rules-section {
  margin-top: 20px;
}

.rules-list {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.rules-list li {
  line-height: 1.8;
  color: #606266;
}

:deep(.el-form-item) {
  margin-bottom: 12px;
}
</style>
