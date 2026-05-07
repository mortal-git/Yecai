<template>
  <div class="statement-create-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-divider direction="vertical" />
        <span class="page-title">生成对账单</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleGenerate">生成对账单</el-button>
      </div>
    </div>

    <!-- 生成条件 -->
    <div class="form-container">
      <el-form :inline="true" :model="formData" class="condition-form">
        <el-form-item label="对账类型">
          <el-radio-group v-model="formData.statementType" size="default">
            <el-radio-button label="customer">客户对账</el-radio-button>
            <el-radio-button label="supplier">供应商对账</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="对方">
          <el-select
            v-model="formData.partyId"
            placeholder="请选择"
            filterable
            style="width: 280px"
          >
            <el-option
              v-for="party in filteredPartyList"
              :key="party.id"
              :label="party.name"
              :value="party.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="对账期间">
          <el-date-picker
            v-model="formData.period"
            type="month"
            placeholder="选择月份"
            value-format="YYYY-MM"
            style="width: 140px"
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- 对账明细 -->
    <div class="detail-container">
      <div class="detail-header">
        <span class="detail-title">对账明细</span>
        <div class="detail-actions">
          <el-button size="small" @click="handleSelectAll">全选</el-button>
          <el-button size="small" @click="handleSelectInverse">反选</el-button>
          <el-button size="small" @click="handleSelectNone">清空</el-button>
        </div>
      </div>

      <!-- 我方数据 -->
      <div class="data-section">
        <div class="section-title">
          <el-checkbox v-model="ourChecked" @change="handleOurSelectAll">我方数据</el-checkbox>
          <span class="section-amount">合计：¥{{ ourTotalAmount.toLocaleString() }}</span>
        </div>
        <el-table
          ref="ourTableRef"
          :data="ourData"
          border
          stripe
          @selection-change="handleOurSelectionChange"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="type" label="单据类型" width="100">
            <template #default="{ row }">
              {{ getBillTypeText(row.type) }}
            </template>
          </el-table-column>
          <el-table-column prop="billNo" label="单据编号" width="160" />
          <el-table-column prop="billDate" label="单据日期" width="110" />
          <el-table-column prop="amount" label="金额" width="120" align="right">
            <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" />
        </el-table>
      </div>

      <!-- 对方数据 -->
      <div class="data-section">
        <div class="section-title">
          <el-checkbox v-model="theirChecked" @change="handleTheirSelectAll">对方数据</el-checkbox>
          <span class="section-amount">合计：¥{{ theirTotalAmount.toLocaleString() }}</span>
        </div>
        <el-table
          ref="theirTableRef"
          :data="theirData"
          border
          stripe
          @selection-change="handleTheirSelectionChange"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="type" label="单据类型" width="100">
            <template #default="{ row }">
              {{ getBillTypeText(row.type) }}
            </template>
          </el-table-column>
          <el-table-column prop="billNo" label="单据编号" width="160" />
          <el-table-column prop="billDate" label="单据日期" width="110" />
          <el-table-column prop="amount" label="金额" width="120" align="right">
            <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" />
        </el-table>
      </div>

      <!-- 差异分析 -->
      <div class="difference-section">
        <div class="section-title">差异分析</div>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="我方金额">
            <span class="amount">¥{{ ourTotalAmount.toLocaleString() }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="对方金额">
            <span class="amount">¥{{ theirTotalAmount.toLocaleString() }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="差异金额">
            <span :class="{ 'diff-zero': differenceAmount === 0, 'diff-nonzero': differenceAmount !== 0 }">
              ¥{{ differenceAmount.toLocaleString() }}
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

// 表单数据
const formData = reactive({
  statementType: 'customer',
  partyId: '',
  period: new Date().toISOString().slice(0, 7)
})

// 客户列表
const customerList = ref([
  { id: 1, name: '深圳市腾讯科技有限公司' },
  { id: 2, name: '阿里巴巴（中国）有限公司' },
  { id: 3, name: '字节跳动科技有限公司' },
  { id: 4, name: '华为技术有限公司' }
])

// 供应商列表
const supplierList = ref([
  { id: 11, name: '深圳硬件供应商A公司' },
  { id: 12, name: '北京云服务B公司' },
  { id: 13, name: '上海网络设备C公司' }
])

// 我方数据
const ourData = ref([
  { id: 1, type: 'receivable', billNo: 'YS2024040001', billDate: '2024-04-15', amount: 500000, remark: '' },
  { id: 2, type: 'receivable', billNo: 'YS2024040002', billDate: '2024-04-18', amount: 300000, remark: '' },
  { id: 3, type: 'invoice', billNo: 'FP2024040001', billDate: '2024-04-10', amount: 500000, remark: '' },
  { id: 4, type: 'invoice', billNo: 'FP2024040002', billDate: '2024-04-12', amount: 300000, remark: '' }
])

// 对方数据
const theirData = ref([
  { id: 101, type: 'their', billNo: 'AR2024040001', billDate: '2024-04-20', amount: 480000, remark: '' },
  { id: 102, type: 'their', billNo: 'AR2024040002', billDate: '2024-04-22', amount: 320000, remark: '' }
])

// 选中状态
const ourChecked = ref(false)
const theirChecked = ref(false)
const ourSelectedRows = ref<any[]>([])
const theirSelectedRows = ref<any[]>([])

// 计算属性
const filteredPartyList = computed(() => {
  return formData.statementType === 'customer' ? customerList.value : supplierList.value
})

const ourTotalAmount = computed(() => {
  if (ourSelectedRows.value.length > 0) {
    return ourSelectedRows.value.reduce((sum, row) => sum + row.amount, 0)
  }
  return ourData.value.reduce((sum, row) => sum + row.amount, 0)
})

const theirTotalAmount = computed(() => {
  if (theirSelectedRows.value.length > 0) {
    return theirSelectedRows.value.reduce((sum, row) => sum + row.amount, 0)
  }
  return theirData.value.reduce((sum, row) => sum + row.amount, 0)
})

const differenceAmount = computed(() => {
  return ourTotalAmount.value - theirTotalAmount.value
})

// 方法
const getBillTypeText = (type: string) => {
  const texts: Record<string, string> = {
    receivable: '应收单',
    payable: '应付单',
    invoice: '发票',
    their: '对方数据'
  }
  return texts[type] || type
}

const handleBack = () => {
  router.push('/statement/list')
}

const handleOurSelectAll = (val: boolean) => {
  if (val) {
    ourData.value.forEach(row => {
      ourTableRef.value?.toggleRowSelection(row, true)
    })
  } else {
    ourTableRef.value?.clearSelection()
  }
}

const handleTheirSelectAll = (val: boolean) => {
  if (val) {
    theirData.value.forEach(row => {
      theirTableRef.value?.toggleRowSelection(row, true)
    })
  } else {
    theirTableRef.value?.clearSelection()
  }
}

const handleOurSelectionChange = (rows: any[]) => {
  ourSelectedRows.value = rows
  ourChecked.value = rows.length === ourData.value.length
}

const handleTheirSelectionChange = (rows: any[]) => {
  theirSelectedRows.value = rows
  theirChecked.value = rows.length === theirData.value.length
}

const handleSelectAll = () => {
  ourChecked.value = true
  theirChecked.value = true
  ourData.value.forEach(row => {
    ourTableRef.value?.toggleRowSelection(row, true)
  })
  theirData.value.forEach(row => {
    theirTableRef.value?.toggleRowSelection(row, true)
  })
}

const handleSelectInverse = () => {
  ourData.value.forEach(row => {
    const isSelected = ourSelectedRows.value.some(r => r.id === row.id)
    ourTableRef.value?.toggleRowSelection(row, !isSelected)
  })
  theirData.value.forEach(row => {
    const isSelected = theirSelectedRows.value.some(r => r.id === row.id)
    theirTableRef.value?.toggleRowSelection(row, !isSelected)
  })
}

const handleSelectNone = () => {
  ourChecked.value = false
  theirChecked.value = false
  ourTableRef.value?.clearSelection()
  theirTableRef.value?.clearSelection()
}

const handleGenerate = () => {
  if (!formData.partyId) {
    ElMessage.warning('请选择对账对方')
    return
  }
  if (!formData.period) {
    ElMessage.warning('请选择对账期间')
    return
  }
  ElMessage.success('对账单已生成')
  router.push('/statement/list')
}

// 表格引用
const ourTableRef = ref()
const theirTableRef = ref()
</script>

<style scoped>
.statement-create-container {
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

.form-container {
  background: #fff;
  margin: 16px 20px;
  padding: 20px;
  border-radius: 8px;
}

.condition-form {
  display: flex;
  align-items: center;
  gap: 24px;
}

.detail-container {
  background: #fff;
  margin: 0 20px 16px;
  padding: 20px;
  border-radius: 8px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.detail-actions {
  display: flex;
  gap: 8px;
}

.data-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.section-amount {
  font-size: 14px;
  color: #409eff;
  font-weight: normal;
}

.difference-section {
  background: #f8f9fa;
  padding: 16px;
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
</style>
