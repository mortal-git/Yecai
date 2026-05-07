<template>
  <div class="rule-engine-create-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <el-button text @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">{{ isEdit ? '编辑规则' : '新建规则' }}</span>
      </div>
      <div class="header-right">
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button type="primary" @click="handleSubmit">保存并启用</el-button>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="form-content">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-card class="form-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="规则名称" prop="ruleName">
                <el-input v-model="formData.ruleName" placeholder="请输入规则名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="规则编码" prop="ruleCode">
                <el-input v-model="formData.ruleCode" placeholder="系统自动生成" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="规则类型" prop="ruleType">
                <el-select v-model="formData.ruleType" placeholder="请选择" style="width: 100%">
                  <el-option label="收入规则" value="income" />
                  <el-option label="成本规则" value="cost" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="业务类型" prop="businessType">
                <el-select v-model="formData.businessType" placeholder="请选择" style="width: 100%">
                  <el-option label="仓储服务" value="storage" />
                  <el-option label="运输服务" value="transport" />
                  <el-option label="关务服务" value="customs" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="计费模式" prop="billingMode">
                <el-select v-model="formData.billingMode" placeholder="请选择" style="width: 100%" @change="handleBillingModeChange">
                  <el-option label="固定单价" value="fixed" />
                  <el-option label="按重量计费" value="weight" />
                  <el-option label="按体积计费" value="volume" />
                  <el-option label="按数量计费" value="quantity" />
                  <el-option label="周期计费" value="period" />
                  <el-option label="阶梯累进计费" value="ladder" />
                  <el-option label="保底封顶计费" value="cap" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="优先级" prop="priority">
                <el-input-number v-model="formData.priority" :min="1" :max="100" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <el-card class="form-card">
          <template #header>
            <div class="card-header">
              <span>费率配置</span>
            </div>
          </template>
          <!-- 固定单价 -->
          <div v-if="formData.billingMode === 'fixed'">
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="单价" prop="unitPrice">
                  <el-input-number v-model="formData.unitPrice" :min="0" :precision="4" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="计价模式" prop="priceMode">
                  <el-select v-model="formData.priceMode" style="width: 100%">
                    <el-option label="含税价" value="tax_included" />
                    <el-option label="不含税价" value="tax_excluded" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="税率" prop="taxRate">
                  <el-select v-model="formData.taxRate" style="width: 100%">
                    <el-option label="0%" :value="0" />
                    <el-option label="3%" :value="3" />
                    <el-option label="6%" :value="6" />
                    <el-option label="9%" :value="9" />
                    <el-option label="13%" :value="13" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 按重量/体积/数量 -->
          <div v-if="['weight', 'volume', 'quantity'].includes(formData.billingMode)">
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="单价" prop="unitPrice">
                  <el-input-number v-model="formData.unitPrice" :min="0" :precision="4" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="计量单位" prop="unit">
                  <el-select v-model="formData.unit" style="width: 100%">
                    <el-option label="kg" value="kg" />
                    <el-option label="m³" value="m3" />
                    <el-option label="件" value="pcs" />
                    <el-option label="票" value="ticket" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="计价模式" prop="priceMode">
                  <el-select v-model="formData.priceMode" style="width: 100%">
                    <el-option label="含税价" value="tax_included" />
                    <el-option label="不含税价" value="tax_excluded" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="税率" prop="taxRate">
                  <el-select v-model="formData.taxRate" style="width: 100%">
                    <el-option label="0%" :value="0" />
                    <el-option label="3%" :value="3" />
                    <el-option label="6%" :value="6" />
                    <el-option label="9%" :value="9" />
                    <el-option label="13%" :value="13" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 阶梯计费 -->
          <div v-if="formData.billingMode === 'ladder'">
            <div class="ladder-table-header">
              <span>阶梯费率配置</span>
              <el-button type="primary" size="small" @click="handleAddLadder">
                <el-icon><Plus /></el-icon>
                添加阶梯
              </el-button>
            </div>
            <el-table :data="formData.ladderRates" border size="small" class="ladder-table">
              <el-table-column prop="minVolume" label="起始量" width="120">
                <template #default="{ row }">
                  <el-input-number v-model="row.minVolume" :min="0" size="small" controls-position="right" style="width: 100px" />
                </template>
              </el-table-column>
              <el-table-column prop="maxVolume" label="结束量" width="120">
                <template #default="{ row }">
                  <el-input-number v-model="row.maxVolume" :min="0" size="small" controls-position="right" style="width: 100px" placeholder="无限" />
                </template>
              </el-table-column>
              <el-table-column prop="unitPrice" label="单价" width="150">
                <template #default="{ row }">
                  <el-input-number v-model="row.unitPrice" :min="0" :precision="4" size="small" controls-position="right" style="width: 120px" />
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="说明" min-width="200">
                <template #default="{ row }">
                  <el-input v-model="row.remark" size="small" placeholder="如：0-1000kg" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80">
                <template #default="{ $index }">
                  <el-button type="danger" link size="small" @click="handleRemoveLadder($index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-row :gutter="16" style="margin-top: 16px;">
              <el-col :span="8">
                <el-form-item label="计价模式" prop="priceMode">
                  <el-select v-model="formData.priceMode" style="width: 100%">
                    <el-option label="含税价" value="tax_included" />
                    <el-option label="不含税价" value="tax_excluded" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="税率" prop="taxRate">
                  <el-select v-model="formData.taxRate" style="width: 100%">
                    <el-option label="0%" :value="0" />
                    <el-option label="3%" :value="3" />
                    <el-option label="6%" :value="6" />
                    <el-option label="9%" :value="9" />
                    <el-option label="13%" :value="13" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 保底封顶 -->
          <div v-if="formData.billingMode === 'cap'">
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="单价" prop="unitPrice">
                  <el-input-number v-model="formData.unitPrice" :min="0" :precision="4" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="保底金额" prop="minAmount">
                  <el-input-number v-model="formData.minAmount" :min="0" :precision="2" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="封顶金额" prop="maxAmount">
                  <el-input-number v-model="formData.maxAmount" :min="0" :precision="2" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="计价模式" prop="priceMode">
                  <el-select v-model="formData.priceMode" style="width: 100%">
                    <el-option label="含税价" value="tax_included" />
                    <el-option label="不含税价" value="tax_excluded" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="税率" prop="taxRate">
                  <el-select v-model="formData.taxRate" style="width: 100%">
                    <el-option label="0%" :value="0" />
                    <el-option label="3%" :value="3" />
                    <el-option label="6%" :value="6" />
                    <el-option label="9%" :value="9" />
                    <el-option label="13%" :value="13" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-card>

        <el-card class="form-card">
          <template #header>
            <div class="card-header">
              <span>维度配置</span>
            </div>
          </template>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="适用客户">
                <el-select v-model="formData.dimensions.customer" placeholder="全部客户" clearable style="width: 100%" filterable>
                  <el-option label="全部客户" value="" />
                  <el-option label="深圳市腾讯科技有限公司" value="KH001" />
                  <el-option label="阿里巴巴（中国）有限公司" value="KH002" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="适用仓库">
                <el-select v-model="formData.dimensions.warehouse" placeholder="全部仓库" clearable style="width: 100%">
                  <el-option label="全部仓库" value="" />
                  <el-option label="深圳仓" value="SZWH" />
                  <el-option label="上海仓" value="SHWH" />
                  <el-option label="广州仓" value="GZWH" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="适用线路">
                <el-select v-model="formData.dimensions.route" placeholder="全部线路" clearable style="width: 100%">
                  <el-option label="全部线路" value="" />
                  <el-option label="干线A线" value="route_a" />
                  <el-option label="干线B线" value="route_b" />
                  <el-option label="配送线路" value="route_c" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="适用口岸">
                <el-select v-model="formData.dimensions.port" placeholder="全部口岸" clearable style="width: 100%">
                  <el-option label="全部口岸" value="" />
                  <el-option label="皇岗口岸" value="HG" />
                  <el-option label="深圳湾口岸" value="SZW" />
                  <el-option label="盐田港" value="YT" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <el-card class="form-card">
          <template #header>
            <div class="card-header">
              <span>附加费用</span>
            </div>
          </template>
          <div class="extra-fees-header">
            <span>已添加 {{ formData.extraFees.length }} 项附加费用</span>
            <el-button type="primary" size="small" @click="handleAddExtraFee">
              <el-icon><Plus /></el-icon>
              添加附加费
            </el-button>
          </div>
          <el-table :data="formData.extraFees" border size="small" class="extra-fees-table">
            <el-table-column prop="feeName" label="费用名称" width="150">
              <template #default="{ row }">
                <el-input v-model="row.feeName" size="small" placeholder="如：燃油附加费" />
              </template>
            </el-table-column>
            <el-table-column prop="feeType" label="费用类型" width="150">
              <template #default="{ row }">
                <el-select v-model="row.feeType" size="small" style="width: 100%">
                  <el-option label="固定金额" value="fixed" />
                  <el-option label="百分比" value="percent" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="feeValue" label="费用值" width="150">
              <template #default="{ row }">
                <el-input-number v-model="row.feeValue" :min="0" :precision="2" size="small" controls-position="right" style="width: 120px" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ $index }">
                <el-button type="danger" link size="small" @click="handleRemoveExtraFee($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.id)

const formRef = ref<FormInstance>()

const formData = reactive({
  ruleName: '',
  ruleCode: '',
  ruleType: 'income',
  businessType: 'storage',
  billingMode: 'fixed',
  priority: 1,
  unitPrice: 0,
  unit: 'kg',
  priceMode: 'tax_included',
  taxRate: 6,
  minAmount: 0,
  maxAmount: 0,
  dimensions: {
    customer: '',
    warehouse: '',
    route: '',
    port: ''
  },
  ladderRates: [] as Array<{
    minVolume: number
    maxVolume: number | null
    unitPrice: number
    remark: string
  }>,
  extraFees: [] as Array<{
    feeName: string
    feeType: 'fixed' | 'percent'
    feeValue: number
  }>
})

const formRules: FormRules = {
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  ruleType: [{ required: true, message: '请选择规则类型', trigger: 'change' }],
  businessType: [{ required: true, message: '请选择业务类型', trigger: 'change' }],
  billingMode: [{ required: true, message: '请选择计费模式', trigger: 'change' }]
}

const handleBack = () => {
  router.back()
}

const handleBillingModeChange = () => {
  if (formData.billingMode === 'ladder' && formData.ladderRates.length === 0) {
    handleAddLadder()
  }
}

const handleAddLadder = () => {
  formData.ladderRates.push({
    minVolume: 0,
    maxVolume: null,
    unitPrice: 0,
    remark: ''
  })
}

const handleRemoveLadder = (index: number) => {
  formData.ladderRates.splice(index, 1)
}

const handleAddExtraFee = () => {
  formData.extraFees.push({
    feeName: '',
    feeType: 'percent',
    feeValue: 0
  })
}

const handleRemoveExtraFee = (index: number) => {
  formData.extraFees.splice(index, 1)
}

const handleSaveDraft = () => {
  ElMessage.success('草稿保存成功')
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('规则保存并启用成功')
      router.push('/ruleEngine/list')
    }
  })
}
</script>

<style scoped>
.rule-engine-create-container {
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
}

.ladder-table-header,
.extra-fees-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
}

.ladder-table,
.extra-fees-table {
  margin-top: 8px;
}
</style>