<template>
  <div class="payable-statement-create-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-divider direction="vertical" />
        <span class="page-title">{{ isEdit ? '编辑应付对账单' : '新建应付对账单' }}</span>
        <el-tag v-if="formData.id && currentStatement" :type="STATUS_TYPE[currentStatement.status]" size="small" style="margin-left: 8px">
          {{ STATUS_LABEL[currentStatement.status] }}
        </el-tag>
      </div>
      <div class="header-right">
        <el-button @click="handleSaveDraft" v-if="!isEdit || formData.status === 'draft'">保存草稿</el-button>
        <el-button type="primary" @click="handleSubmit" v-if="!isEdit || formData.status === 'draft'">提交审核</el-button>
        <el-button @click="handlePrint" v-if="isEdit">打印</el-button>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="form-section">
      <div class="section-title">
        <el-icon><InfoFilled /></el-icon>
        <span>基本信息</span>
      </div>
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="basic-form"
      >
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="对账单名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入对账单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="供应商" prop="supplier">
              <el-select v-model="formData.supplier" placeholder="请选择供应商" filterable style="width: 100%">
                <el-option v-for="s in supplierList" :key="s" :label="s" :value="s" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="结算单位" prop="settlementUnit">
              <el-select v-model="formData.settlementUnit" placeholder="请选择结算单位" filterable style="width: 100%">
                <el-option v-for="u in settlementUnitList" :key="u" :label="u" :value="u" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="结算银行" prop="settlementBank">
              <el-select v-model="formData.settlementBank" placeholder="请选择结算银行" filterable style="width: 100%">
                <el-option v-for="b in settlementBankList" :key="b" :label="b" :value="b" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="结算账号" prop="settlementAccount">
              <el-select v-model="formData.settlementAccount" placeholder="请选择结算账号" filterable style="width: 100%">
                <el-option v-for="a in settlementAccountList" :key="a" :label="a" :value="a" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="结算日" prop="settleDate">
              <el-date-picker
                v-model="formData.settleDate"
                type="date"
                placeholder="请选择结算日"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="对账单不含税金额">
              <el-input :model-value="`¥${formatMoney(totalExTaxCny)}`" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="对账单含税金额">
              <el-input :model-value="`¥${formatMoney(totalIncTaxCny)}`" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 对账明细 -->
    <div class="form-section">
      <div class="section-title">
        <el-icon><Document /></el-icon>
        <span>对账明细</span>
        <span class="section-sub">共 {{ detailRows.length }} 条</span>
      </div>
      <div class="detail-toolbar">
        <el-button type="primary" size="small" @click="showSelector = true">
          <el-icon><Plus /></el-icon>
          添加明细
        </el-button>
        <el-button size="small" @click="removeSelected" :disabled="selectedDetailRows.length === 0">
          <el-icon><Delete /></el-icon>
          移除选中
        </el-button>
        <el-button size="small" @click="clearAll" :disabled="detailRows.length === 0">清空</el-button>
        <div class="toolbar-summary">
          <span>不含税合计：<b>¥{{ formatMoney(totalExTaxCny) }}</b></span>
          <span>含税合计：<b>¥{{ formatMoney(totalIncTaxCny) }}</b></span>
        </div>
      </div>
      <el-table
        :data="detailRows"
        border
        stripe
        @selection-change="onDetailSelectionChange"
        max-height="500"
        show-summary
        :summary-method="getSummary"
      >
        <el-table-column type="selection" width="50" fixed />
        <el-table-column prop="rateSheetNo" label="费率单编号" min-width="140" fixed />
        <el-table-column prop="customerName" label="客户名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="businessRefNo" label="业务参考编号" min-width="140" />
        <el-table-column prop="billingDoc" label="计费单据" min-width="100" />
        <el-table-column prop="costItem" label="成本项目" min-width="100" />
        <el-table-column prop="productL1" label="产品标准名L1" min-width="120" />
        <el-table-column prop="productL2" label="产品标准名L2" min-width="120" />
        <el-table-column prop="productL3" label="产品标准名L3" min-width="120" />
        <el-table-column prop="currency" label="币种" min-width="80" />
        <el-table-column prop="exTaxAmount" label="不含税金额" min-width="120" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.exTaxAmount) }}</template>
        </el-table-column>
        <el-table-column prop="taxRate" label="税率" min-width="80" align="right">
          <template #default="{ row }">{{ row.taxRate }}%</template>
        </el-table-column>
        <el-table-column prop="taxAmount" label="税额" min-width="120" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.taxAmount) }}</template>
        </el-table-column>
        <el-table-column prop="incTaxAmount" label="含税金额" min-width="120" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.incTaxAmount) }}</template>
        </el-table-column>
        <el-table-column prop="exchangeRate" label="汇率" min-width="80" align="right" />
        <el-table-column prop="exTaxAmountCny" label="不含税(折合CNY)" min-width="140" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.exTaxAmountCny) }}</template>
        </el-table-column>
        <el-table-column prop="incTaxAmountCny" label="含税(折合CNY)" min-width="140" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.incTaxAmountCny) }}</template>
        </el-table-column>
        <el-table-column prop="customerService" label="客服" min-width="80" />
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ $index }">
            <el-button link type="danger" size="small" @click="removeRow($index)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 选择明细弹窗 -->
    <CostDetailSelector
      v-model="showSelector"
      :existing-nos="detailRows.map(r => r.rateSheetNo)"
      @confirm="onSelectorConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { ArrowLeft, Plus, Delete, Document, InfoFilled } from '@element-plus/icons-vue'
import {
  usePayableStatementStore,
  STATUS_LABEL,
  STATUS_TYPE,
  type PayableStatement,
  type PayableStatementRow
} from '../../../store/payableStatement'
import CostDetailSelector from './components/CostDetailSelector.vue'

const route = useRoute()
const router = useRouter()
const store = usePayableStatementStore()

const isEdit = computed(() => !!route.params.id)
const currentStatement = computed<PayableStatement | undefined>(() =>
  isEdit.value ? store.getById(route.params.id as string) : undefined
)

const supplierList = [
  '深圳盐田国际集装箱码头有限公司',
  '上海中远海运集装箱运输有限公司',
  '北京华贸物流股份有限公司',
  '广州白云国际机场物流有限公司',
  '中外运冷链物流有限公司'
]
const settlementUnitList = ['深圳分公司', '上海分公司', '广州分公司', '北京分公司', '杭州分公司']
const settlementBankList = [
  '中国工商银行',
  '中国农业银行',
  '中国银行',
  '中国建设银行',
  '交通银行',
  '招商银行',
  '中信银行',
  '中国民生银行',
  '上海浦东发展银行',
  '兴业银行'
]
const settlementAccountList = [
  '6222021234567890123',
  '6225001234567890123',
  '6217001234567890123',
  '6214001234567890123',
  '6226001234567890123',
  '6225881234567890123',
  '6217001234567890456',
  '6222001234567890789'
]

const formRef = ref<FormInstance>()
const formData = reactive({
  id: '',
  name: '',
  supplier: '',
  settlementUnit: '',
  settlementBank: '',
  settlementAccount: '',
  settleDate: '',
  remark: '',
  status: 'draft' as PayableStatement['status']
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入对账单名称', trigger: 'blur' }],
  supplier: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  settlementUnit: [{ required: true, message: '请选择结算单位', trigger: 'change' }],
  settlementBank: [{ required: true, message: '请选择结算银行', trigger: 'change' }],
  settlementAccount: [{ required: true, message: '请选择结算账号', trigger: 'change' }],
  settleDate: [{ required: true, message: '请选择结算日', trigger: 'change' }]
}

const detailRows = ref<PayableStatementRow[]>([])
const selectedDetailRows = ref<PayableStatementRow[]>([])
const showSelector = ref(false)

const totalExTaxCny = computed(() => detailRows.value.reduce((s, r) => s + (r.exTaxAmountCny || 0), 0))
const totalIncTaxCny = computed(() => detailRows.value.reduce((s, r) => s + (r.incTaxAmountCny || 0), 0))

const formatMoney = (value: number) => (value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const onDetailSelectionChange = (rows: PayableStatementRow[]) => { selectedDetailRows.value = rows }

const onSelectorConfirm = (rows: PayableStatementRow[]) => {
  const existing = new Set(detailRows.value.map(r => r.rateSheetNo))
  const newRows = rows.filter(r => !existing.has(r.rateSheetNo))
  detailRows.value.push(...newRows)
  ElMessage.success(`已添加 ${newRows.length} 条明细`)
}

const removeRow = (index: number) => {
  detailRows.value.splice(index, 1)
}

const removeSelected = () => {
  const selectedNos = new Set(selectedDetailRows.value.map(r => r.rateSheetNo))
  detailRows.value = detailRows.value.filter(r => !selectedNos.has(r.rateSheetNo))
}

const clearAll = () => {
  ElMessageBox.confirm('确认清空所有对账明细?', '提示', { type: 'warning' })
    .then(() => {
      detailRows.value = []
      ElMessage.success('已清空')
    })
    .catch(() => {})
}

const getSummary = () => {
  return ['合计', '', '', '', '', '', '', '', '', '',
    `¥${formatMoney(detailRows.value.reduce((s, r) => s + r.exTaxAmount, 0))}`,
    '',
    `¥${formatMoney(detailRows.value.reduce((s, r) => s + r.taxAmount, 0))}`,
    `¥${formatMoney(detailRows.value.reduce((s, r) => s + r.incTaxAmount, 0))}`,
    '',
    `¥${formatMoney(totalExTaxCny.value)}`,
    `¥${formatMoney(totalIncTaxCny.value)}`,
    ''
  ]
}

const validateBeforeSave = () => {
  if (!formData.name) { ElMessage.warning('请输入对账单名称'); return false }
  if (!formData.supplier) { ElMessage.warning('请选择供应商'); return false }
  if (!formData.settlementUnit) { ElMessage.warning('请选择结算单位'); return false }
  if (!formData.settlementBank) { ElMessage.warning('请选择结算银行'); return false }
  if (!formData.settlementAccount) { ElMessage.warning('请选择结算账号'); return false }
  if (!formData.settleDate) { ElMessage.warning('请选择结算日'); return false }
  if (detailRows.value.length === 0) {
    ElMessage.warning('请添加对账明细')
    return false
  }
  return true
}

const buildStatementData = () => ({
  name: formData.name,
  supplier: formData.supplier,
  settlementUnit: formData.settlementUnit,
  settlementBank: formData.settlementBank,
  settlementAccount: formData.settlementAccount,
  settleDate: formData.settleDate,
  totalExTaxCny: totalExTaxCny.value,
  totalIncTaxCny: totalIncTaxCny.value,
  status: formData.status,
  remark: formData.remark,
  rows: detailRows.value.map(r => ({ ...r })),
  payments: currentStatement.value?.payments || [],
  invoices: currentStatement.value?.invoices || []
})

const handleSaveDraft = async () => {
  if (!formRef.value) return
  await formRef.value.validate(valid => {
    if (!valid) return
    if (detailRows.value.length === 0) {
      ElMessage.warning('请添加对账明细')
      return
    }
    formData.status = 'draft'
    if (isEdit.value) {
      store.updateStatement(formData.id, buildStatementData())
      store.addLog(formData.id, '保存草稿')
      ElMessage.success('草稿已保存')
    } else {
      const item = store.addStatement(buildStatementData())
      ElMessage.success(`草稿已保存，对账单号：${item.statementNo}`)
      router.replace(`/statement/payable/edit/${item.id}`)
    }
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(valid => {
    if (!valid) return
    if (!validateBeforeSave()) return
    formData.status = 'pending'
    if (isEdit.value) {
      store.updateStatement(formData.id, { ...buildStatementData(), status: 'pending' })
      store.addLog(formData.id, '提交审核')
      ElMessage.success('已提交审核')
      router.push('/statement/payable')
    } else {
      const item = store.addStatement({ ...buildStatementData(), status: 'pending' })
      store.addLog(item.id, '提交审核')
      ElMessage.success(`已提交审核，对账单号：${item.statementNo}`)
      router.push('/statement/payable')
    }
  })
}

const handleBack = () => router.push('/statement/payable')

const handlePrint = () => {
  router.push(`/statement/payable/detail/${formData.id}?print=1`)
}

onMounted(() => {
  if (isEdit.value && currentStatement.value) {
    const s = currentStatement.value
    formData.id = s.id
    formData.name = s.name
    formData.supplier = s.supplier
    formData.settlementUnit = s.settlementUnit
    formData.settlementBank = s.settlementBank || ''
    formData.settlementAccount = s.settlementAccount || ''
    formData.settleDate = s.settleDate
    formData.remark = s.remark || ''
    formData.status = s.status
    detailRows.value = s.rows.map(r => ({ ...r }))
  } else {
    // 入口 B：从应付成本明细跳转携带的选中行
    const pendingRows = store.consumePendingCostRows()
    if (pendingRows.length > 0) {
      detailRows.value = pendingRows.map(r => ({ ...r }))
      if (pendingRows[0].supplier) formData.supplier = pendingRows[0].supplier!
      if (pendingRows[0].settlementUnit) formData.settlementUnit = pendingRows[0].settlementUnit!
      ElMessage.success(`已从成本明细带入 ${pendingRows.length} 条数据`)
    }
  }
})
</script>

<style scoped>
.payable-statement-create-container {
  padding: 0;
}

.action-header {
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.form-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.section-sub {
  margin-left: 8px;
  font-size: 13px;
  color: #909399;
  font-weight: normal;
}

.basic-form {
  padding-top: 8px;
}

.detail-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.toolbar-summary {
  margin-left: auto;
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: #606266;
}

.toolbar-summary b {
  color: #f56c6c;
  margin-left: 4px;
}

:deep(.el-table .cell) {
  white-space: nowrap;
}
</style>
