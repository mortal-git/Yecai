<template>
  <div class="rate-sheet-create-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <el-button text @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">新建费率单</span>
      </div>
      <div class="header-right">
        <el-button @click="handleSave">保存草稿</el-button>
        <el-button type="primary" @click="handleSubmit">提交审核</el-button>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="form-content">
      <el-form :model="formData" label-width="120px">
        <el-card class="form-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="客户">
                <el-select v-model="formData.customerId" placeholder="请选择客户" style="width: 100%" filterable>
                  <el-option label="深圳市腾讯科技有限公司" value="KH001" />
                  <el-option label="阿里巴巴（中国）有限公司" value="KH002" />
                  <el-option label="字节跳动科技有限公司" value="KH003" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="业务类型">
                <el-select v-model="formData.businessType" placeholder="请选择" style="width: 100%">
                  <el-option label="仓储服务" value="storage" />
                  <el-option label="运输服务" value="transport" />
                  <el-option label="关务服务" value="customs" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="来源单据">
                <el-input v-model="formData.documentNo" placeholder="请输入或选择单据" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="计费重量">
                <el-input-number v-model="formData.billingWeight" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="计费体积">
                <el-input-number v-model="formData.billingVolume" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="计费数量">
                <el-input-number v-model="formData.billingQuantity" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="业务日期">
                <el-date-picker v-model="formData.businessDate" type="date" placeholder="选择日期" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="备注">
                <el-input v-model="formData.remark" placeholder="请输入备注" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <el-card class="form-card">
          <template #header>
            <div class="card-header">
              <span>收入明细</span>
              <el-button type="primary" size="small" @click="handleAddIncome">
                <el-icon><Plus /></el-icon>
                添加收入项
              </el-button>
            </div>
          </template>
          <el-table :data="formData.incomeItems" border size="small">
            <el-table-column prop="feeName" label="费用名称" min-width="150">
              <template #default="{ row }">
                <el-input v-model="row.feeName" size="small" placeholder="费用名称" />
              </template>
            </el-table-column>
            <el-table-column prop="billingBase" label="计费基数" width="120">
              <template #default="{ row }">
                <el-input-number v-model="row.billingBase" :min="0" size="small" controls-position="right" style="width: 100px" />
              </template>
            </el-table-column>
            <el-table-column prop="unitPrice" label="单价" width="120">
              <template #default="{ row }">
                <el-input-number v-model="row.unitPrice" :min="0" :precision="4" size="small" controls-position="right" style="width: 100px" />
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="120" align="right">
              <template #default="{ row }">
                <span class="amount">¥{{ ((row.billingBase || 0) * (row.unitPrice || 0)).toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="taxRate" label="税率" width="100">
              <template #default="{ row }">
                <el-select v-model="row.taxRate" size="small" style="width: 80px">
                  <el-option label="0%" :value="0" />
                  <el-option label="6%" :value="6" />
                  <el-option label="9%" :value="9" />
                  <el-option label="13%" :value="13" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ $index }">
                <el-button type="danger" link size="small" @click="handleRemoveIncome($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="income-summary">
            <span>收入合计：<b class="amount income">¥{{ totalIncome.toFixed(2) }}</b></span>
            <span>税额：<b>¥{{ totalIncomeTax.toFixed(2) }}</b></span>
            <span>价税合计：<b class="amount income">¥{{ totalIncomeWithTax.toFixed(2) }}</b></span>
          </div>
        </el-card>

        <el-card class="form-card">
          <template #header>
            <div class="card-header">
              <span>成本明细</span>
              <el-button type="primary" size="small" @click="handleAddCost">
                <el-icon><Plus /></el-icon>
                添加成本项
              </el-button>
            </div>
          </template>
          <el-table :data="formData.costItems" border size="small">
            <el-table-column prop="supplierName" label="供应商" width="150">
              <template #default="{ row }">
                <el-input v-model="row.supplierName" size="small" placeholder="供应商名称" />
              </template>
            </el-table-column>
            <el-table-column prop="feeName" label="费用名称" min-width="150">
              <template #default="{ row }">
                <el-input v-model="row.feeName" size="small" placeholder="费用名称" />
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="120">
              <template #default="{ row }">
                <el-input-number v-model="row.amount" :min="0" :precision="2" size="small" controls-position="right" style="width: 100px" />
              </template>
            </el-table-column>
            <el-table-column prop="taxRate" label="税率" width="100">
              <template #default="{ row }">
                <el-select v-model="row.taxRate" size="small" style="width: 80px">
                  <el-option label="0%" :value="0" />
                  <el-option label="6%" :value="6" />
                  <el-option label="9%" :value="9" />
                  <el-option label="13%" :value="13" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ $index }">
                <el-button type="danger" link size="small" @click="handleRemoveCost($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="cost-summary">
            <span>成本合计：<b class="amount cost">¥{{ totalCost.toFixed(2) }}</b></span>
          </div>
        </el-card>

        <el-card class="form-card">
          <template #header>
            <div class="card-header">
              <span>毛利分析</span>
            </div>
          </template>
          <el-descriptions :column="4" border size="small">
            <el-descriptions-item label="收入合计">
              <span class="amount income">¥{{ totalIncomeWithTax.toFixed(2) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="成本合计">
              <span class="amount cost">¥{{ totalCost.toFixed(2) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="毛利">
              <span class="amount" :class="profit >= 0 ? 'profit' : 'loss'">¥{{ profit.toFixed(2) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="毛利率">
              <span :class="profitRate >= 0 ? 'text-success' : 'text-danger'">{{ profitRate }}%</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'

const router = useRouter()

const formData = reactive({
  customerId: '',
  businessType: 'storage',
  documentNo: '',
  billingWeight: 0,
  billingVolume: 0,
  billingQuantity: 0,
  businessDate: '',
  remark: '',
  incomeItems: [] as Array<{
    feeName: string
    billingBase: number
    unitPrice: number
    taxRate: number
  }>,
  costItems: [] as Array<{
    supplierName: string
    feeName: string
    amount: number
    taxRate: number
  }>
})

const totalIncome = computed(() => {
  return formData.incomeItems.reduce((sum, item) => sum + (item.billingBase || 0) * (item.unitPrice || 0), 0)
})

const totalIncomeTax = computed(() => {
  return formData.incomeItems.reduce((sum, item) => {
    const amount = (item.billingBase || 0) * (item.unitPrice || 0)
    return sum + amount * (item.taxRate || 0) / 100
  }, 0)
})

const totalIncomeWithTax = computed(() => {
  return totalIncome.value + totalIncomeTax.value
})

const totalCost = computed(() => {
  return formData.costItems.reduce((sum, item) => sum + (item.amount || 0), 0)
})

const profit = computed(() => {
  return totalIncomeWithTax.value - totalCost.value
})

const profitRate = computed(() => {
  if (totalIncomeWithTax.value === 0) return 0
  return (profit.value / totalIncomeWithTax.value * 100).toFixed(1)
})

const handleBack = () => {
  router.back()
}

const handleSave = () => {
  ElMessage.success('草稿保存成功')
}

const handleSubmit = () => {
  ElMessage.success('提交审核成功')
  router.push('/rateSheet/list')
}

const handleAddIncome = () => {
  formData.incomeItems.push({
    feeName: '',
    billingBase: 0,
    unitPrice: 0,
    taxRate: 6
  })
}

const handleRemoveIncome = (index: number) => {
  formData.incomeItems.splice(index, 1)
}

const handleAddCost = () => {
  formData.costItems.push({
    supplierName: '',
    feeName: '',
    amount: 0,
    taxRate: 6
  })
}

const handleRemoveCost = (index: number) => {
  formData.costItems.splice(index, 1)
}
</script>

<style scoped>
.rate-sheet-create-container {
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
  gap: 12px;
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

.form-content {
  padding: 20px;
}

.form-card {
  margin-bottom: 16px;
}

.card-header {
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.income-summary,
.cost-summary {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  display: flex;
  gap: 24px;
  font-size: 14px;
}

.amount {
  font-weight: 600;
}

.amount.income { color: #67c23a; }
.amount.cost { color: #f56c6c; }
.amount.profit { color: #67c23a; }
.amount.loss { color: #f56c6c; }

.text-success { color: #67c23a; }
.text-danger { color: #f56c6c; }
</style>