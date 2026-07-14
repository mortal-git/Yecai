<template>
  <el-dialog
    v-model="visible"
    title="选择应收收入明细"
    width="90%"
    top="3vh"
    destroy-on-close
  >
    <!-- 搜索 -->
    <div class="selector-search">
      <el-form :inline="true" :model="searchForm" size="default">
        <el-form-item label="费率单编号">
          <el-input v-model="searchForm.rateSheetNo" placeholder="请输入" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="客户">
          <el-select v-model="searchForm.customer" placeholder="请选择" clearable filterable style="width: 220px">
            <el-option v-for="c in customerList" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="结算单位">
          <el-select v-model="searchForm.settlementUnit" placeholder="请选择" clearable filterable style="width: 160px">
            <el-option v-for="u in settlementUnitList" :key="u" :label="u" :value="u" />
          </el-select>
        </el-form-item>
        <el-form-item label="业务参考编号">
          <el-input v-model="searchForm.businessRefNo" placeholder="请输入" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="收入项目">
          <el-input v-model="searchForm.incomeItem" placeholder="请输入" clearable style="width: 140px" />
        </el-form-item>
        <el-form-item label="对账状态">
          <el-select v-model="searchForm.reconcileStatus" placeholder="请选择" clearable style="width: 140px">
            <el-option label="已对账" value="已对账" />
            <el-option label="待对账" value="待对账" />
            <el-option label="部分对账" value="部分对账" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doSearch">搜索</el-button>
          <el-button @click="doReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="selector-toolbar">
      <span class="tip">已选 <b>{{ selectedRows.length }}</b> 条</span>
      <span class="tip" v-if="existingCount > 0">（已在对账单中的 {{ existingCount }} 条会自动过滤）</span>
    </div>

    <el-table
      ref="tableRef"
      :data="pagedData"
      border
      stripe
      height="420"
      max-height="420"
      @selection-change="onSelectionChange"
      :row-key="row => row.rateSheetNo"
    >
      <el-table-column type="selection" width="50" fixed :selectable="isSelectable" />
      <el-table-column prop="rateSheetNo" label="费率单编号" min-width="140" fixed />
      <el-table-column prop="customerName" label="客户名称" min-width="160" show-overflow-tooltip />
      <el-table-column prop="businessRefNo" label="业务参考编号" min-width="140" />
      <el-table-column prop="billingDoc" label="计费单据" min-width="100" />
      <el-table-column prop="settlementUnit" label="结算单位" min-width="120" />
      <el-table-column prop="incomeItem" label="收入项目" min-width="100" />
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
    </el-table>

    <div class="selector-pagination">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="filteredData.length"
        layout="total, sizes, prev, pager, next"
        @size-change="pagination.page = 1"
        @current-change="() => {}"
      />
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :disabled="selectedRows.length === 0" @click="confirm">
        确认添加（{{ selectedRows.length }}）
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { ReceivableStatementRow } from '../../../../store/receivableStatement'

const props = defineProps<{
  modelValue: boolean
  existingNos?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm', rows: ReceivableStatementRow[]): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const customerList = [
  '深圳市腾讯科技有限公司',
  '阿里巴巴（中国）有限公司',
  '字节跳动科技有限公司',
  '华为技术有限公司',
  '京东集团股份有限公司'
]
const settlementUnitList = ['深圳分公司', '上海分公司', '广州分公司', '北京分公司', '杭州分公司']

const searchForm = reactive({
  rateSheetNo: '',
  customer: '',
  settlementUnit: '',
  businessRefNo: '',
  incomeItem: '',
  reconcileStatus: ''
})

const pagination = reactive({ page: 1, size: 20 })
const selectedRows = ref<ReceivableStatementRow[]>([])
const tableRef = ref()

const mockData: ReceivableStatementRow[] = [
  {
    rateSheetNo: 'FL2026050001', customerName: '深圳市腾讯科技有限公司', businessRefNo: 'PO2026050001',
    billingDoc: '应收单', incomeItem: '仓储费',
    productL1: '物流服务', productL2: '仓储服务', productL3: '仓储服务',
    currency: 'CNY', exTaxAmount: 50000, taxRate: 13, taxAmount: 6500, incTaxAmount: 56500,
    exchangeRate: 1.0, exTaxAmountCny: 50000, incTaxAmountCny: 56500,
    customerService: '张三', settlementUnit: '深圳分公司'
  },
  {
    rateSheetNo: 'FL2026050002', customerName: '阿里巴巴（中国）有限公司', businessRefNo: 'PO2026050002',
    billingDoc: '应收单', incomeItem: '运输费',
    productL1: '物流服务', productL2: '运输服务', productL3: '海运运输',
    currency: 'CNY', exTaxAmount: 80000, taxRate: 13, taxAmount: 10400, incTaxAmount: 90400,
    exchangeRate: 1.0, exTaxAmountCny: 80000, incTaxAmountCny: 90400,
    customerService: '李四', settlementUnit: '上海分公司'
  },
  {
    rateSheetNo: 'FL2026050003', customerName: '字节跳动科技有限公司', businessRefNo: 'PO2026050003',
    billingDoc: '应收单', incomeItem: '报关费',
    productL1: '物流服务', productL2: '报关服务', productL3: '出口报关',
    currency: 'CNY', exTaxAmount: 12000, taxRate: 6, taxAmount: 720, incTaxAmount: 12720,
    exchangeRate: 1.0, exTaxAmountCny: 12000, incTaxAmountCny: 12720,
    customerService: '王五', settlementUnit: '北京分公司'
  },
  {
    rateSheetNo: 'FL2026050004', customerName: '华为技术有限公司', businessRefNo: 'PO2026050004',
    billingDoc: '应收单', incomeItem: '空运费',
    productL1: '物流服务', productL2: '运输服务', productL3: '航空运输',
    currency: 'CNY', exTaxAmount: 35000, taxRate: 13, taxAmount: 4550, incTaxAmount: 39550,
    exchangeRate: 1.0, exTaxAmountCny: 35000, incTaxAmountCny: 39550,
    customerService: '赵六', settlementUnit: '广州分公司'
  },
  {
    rateSheetNo: 'FL2026050005', customerName: '京东集团股份有限公司', businessRefNo: 'PO2026050005',
    billingDoc: '应收单', incomeItem: '冷链运输费',
    productL1: '物流服务', productL2: '运输服务', productL3: '海运运输',
    currency: 'CNY', exTaxAmount: 22000, taxRate: 13, taxAmount: 2860, incTaxAmount: 24860,
    exchangeRate: 1.0, exTaxAmountCny: 22000, incTaxAmountCny: 24860,
    customerService: '张三', settlementUnit: '深圳分公司'
  }
]

const existingNos = computed(() => new Set(props.existingNos || []))
const existingCount = computed(() => existingNos.value.size)

const isSelectable = (row: ReceivableStatementRow) => !existingNos.value.has(row.rateSheetNo)

const filteredData = computed(() => {
  return mockData.filter(item => {
    if (existingNos.value.has(item.rateSheetNo)) return false
    if (searchForm.rateSheetNo && !item.rateSheetNo.toLowerCase().includes(searchForm.rateSheetNo.toLowerCase())) return false
    if (searchForm.customer && item.customerName !== searchForm.customer) return false
    if (searchForm.settlementUnit && item.settlementUnit !== searchForm.settlementUnit) return false
    if (searchForm.businessRefNo && !item.businessRefNo.toLowerCase().includes(searchForm.businessRefNo.toLowerCase())) return false
    if (searchForm.incomeItem && !item.incomeItem.toLowerCase().includes(searchForm.incomeItem.toLowerCase())) return false
    if (searchForm.reconcileStatus && item.reconcileStatus !== searchForm.reconcileStatus) return false
    return true
  })
})

const pagedData = computed(() => {
  const start = (pagination.page - 1) * pagination.size
  return filteredData.value.slice(start, start + pagination.size)
})

const formatMoney = (value: number) => (value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const onSelectionChange = (rows: ReceivableStatementRow[]) => { selectedRows.value = rows }
const doSearch = () => { pagination.page = 1 }
const doReset = () => {
  Object.assign(searchForm, {
    rateSheetNo: '', customer: '', settlementUnit: '', businessRefNo: '', incomeItem: '', reconcileStatus: ''
  })
  pagination.page = 1
}

const confirm = () => {
  emit('confirm', selectedRows.value)
  visible.value = false
  selectedRows.value = []
}

watch(() => props.modelValue, v => {
  if (!v) {
    selectedRows.value = []
    tableRef.value?.clearSelection?.()
  }
})
</script>

<style scoped>
.selector-search {
  margin-bottom: 12px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 6px;
}

.selector-toolbar {
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
}

.tip {
  margin-right: 8px;
}

.selector-pagination {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>
