<template>
  <div class="rule-engine-trial-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <el-button text @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">规则试算</span>
      </div>
      <div class="header-right">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleTrial">
          <el-icon><Cpu /></el-icon>
          开始试算
        </el-button>
      </div>
    </div>

    <div class="trial-content">
      <el-row :gutter="20">
        <!-- 左侧：试算参数 -->
        <el-col :span="12">
          <el-card class="trial-card">
            <template #header>
              <div class="card-header">
                <span>试算参数</span>
              </div>
            </template>
            <el-form :model="trialForm" label-width="100px">
              <el-form-item label="客户">
                <el-select v-model="trialForm.customerId" placeholder="请选择客户" style="width: 100%" filterable>
                  <el-option label="深圳市腾讯科技有限公司" value="KH001" />
                  <el-option label="阿里巴巴（中国）有限公司" value="KH002" />
                  <el-option label="字节跳动科技有限公司" value="KH003" />
                </el-select>
              </el-form-item>
              <el-form-item label="业务类型">
                <el-select v-model="trialForm.businessType" placeholder="请选择" style="width: 100%">
                  <el-option label="仓储服务" value="storage" />
                  <el-option label="运输服务" value="transport" />
                  <el-option label="关务服务" value="customs" />
                </el-select>
              </el-form-item>
              <el-form-item label="仓库">
                <el-select v-model="trialForm.warehouse" placeholder="请选择仓库" style="width: 100%">
                  <el-option label="深圳仓" value="SZWH" />
                  <el-option label="上海仓" value="SHWH" />
                  <el-option label="广州仓" value="GZWH" />
                </el-select>
              </el-form-item>
              <el-form-item label="线路">
                <el-select v-model="trialForm.route" placeholder="请选择线路" style="width: 100%">
                  <el-option label="干线A线" value="route_a" />
                  <el-option label="干线B线" value="route_b" />
                  <el-option label="配送线路" value="route_c" />
                </el-select>
              </el-form-item>
              <el-form-item label="口岸">
                <el-select v-model="trialForm.port" placeholder="请选择口岸" style="width: 100%">
                  <el-option label="皇岗口岸" value="HG" />
                  <el-option label="深圳湾口岸" value="SZW" />
                  <el-option label="盐田港" value="YT" />
                </el-select>
              </el-form-item>
              <el-divider content-position="left">计费参数</el-divider>
              <el-form-item label="重量(kg)">
                <el-input-number v-model="trialForm.weight" :min="0" :precision="2" style="width: 100%" />
              </el-form-item>
              <el-form-item label="体积(m³)">
                <el-input-number v-model="trialForm.volume" :min="0" :precision="3" style="width: 100%" />
              </el-form-item>
              <el-form-item label="数量">
                <el-input-number v-model="trialForm.quantity" :min="0" :precision="0" style="width: 100%" />
              </el-form-item>
              <el-form-item label="业务量">
                <el-input-number v-model="trialForm.businessVolume" :min="0" :precision="2" style="width: 100%" />
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <!-- 右侧：试算结果 -->
        <el-col :span="12">
          <el-card class="trial-card">
            <template #header>
              <div class="card-header">
                <span>试算结果</span>
                <el-tag type="success" v-if="trialResult.matched">匹配成功</el-tag>
                <el-tag type="danger" v-else>匹配失败</el-tag>
              </div>
            </template>
            <div v-if="trialResult.matched">
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="匹配规则数">{{ trialResult.matchedRules?.length || 0 }}</el-descriptions-item>
                <el-descriptions-item label="规则优先级">按优先级排序</el-descriptions-item>
              </el-descriptions>

              <el-divider content-position="left">费用明细</el-divider>
              <el-table :data="trialResult.feeDetails" border size="small">
                <el-table-column prop="ruleName" label="规则名称" min-width="150" />
                <el-table-column prop="billingBase" label="计费基数" width="100" align="right" />
                <el-table-column prop="unitPrice" label="单价" width="80" align="right">
                  <template #default="{ row }">
                    ¥{{ row.unitPrice?.toFixed(4) }}
                  </template>
                </el-table-column>
                <el-table-column prop="baseAmount" label="基础金额" width="100" align="right">
                  <template #default="{ row }">
                    ¥{{ row.baseAmount?.toFixed(2) }}
                  </template>
                </el-table-column>
                <el-table-column prop="extraFee" label="附加费" width="80" align="right">
                  <template #default="{ row }">
                    ¥{{ row.extraFee?.toFixed(2) }}
                  </template>
                </el-table-column>
                <el-table-column prop="subtotal" label="小计" width="100" align="right">
                  <template #default="{ row }">
                    <b>¥{{ row.subtotal?.toFixed(2) }}</b>
                  </template>
                </el-table-column>
              </el-table>

              <el-divider content-position="left">汇总</el-divider>
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="不含税金额">
                  <span class="amount">¥{{ trialResult.taxExclusiveAmount?.toFixed(2) }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="增值税税额">
                  <span class="amount">¥{{ trialResult.taxAmount?.toFixed(2) }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="价税合计">
                  <span class="amount total">¥{{ trialResult.totalAmount?.toFixed(2) }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="适用税率">{{ trialResult.taxRate }}%</el-descriptions-item>
              </el-descriptions>

              <div class="result-tip">
                <el-icon><InfoFilled /></el-icon>
                <span>以上为试算结果，实际费用以正式计费为准</span>
              </div>
            </div>
            <el-empty v-else description="请填写试算参数后点击开始试算" />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Cpu, InfoFilled } from '@element-plus/icons-vue'

const router = useRouter()

const trialForm = reactive({
  customerId: '',
  businessType: 'storage',
  warehouse: 'SZWH',
  route: '',
  port: '',
  weight: 1000,
  volume: 5,
  quantity: 100,
  businessVolume: 0
})

const trialResult = reactive<any>({
  matched: false,
  matchedRules: [],
  feeDetails: [],
  taxExclusiveAmount: 0,
  taxAmount: 0,
  totalAmount: 0,
  taxRate: 6
})

const handleBack = () => {
  router.back()
}

const handleReset = () => {
  trialForm.customerId = ''
  trialForm.businessType = 'storage'
  trialForm.warehouse = 'SZWH'
  trialForm.route = ''
  trialForm.port = ''
  trialForm.weight = 1000
  trialForm.volume = 5
  trialForm.quantity = 100
  trialForm.businessVolume = 0
  trialResult.matched = false
}

const handleTrial = () => {
  if (!trialForm.businessType) {
    ElMessage.warning('请选择业务类型')
    return
  }

  // 模拟试算结果
  trialResult.matched = true
  trialResult.matchedRules = [
    { ruleCode: 'R001', ruleName: '仓储入库费' }
  ]
  trialResult.feeDetails = [
    {
      ruleName: '仓储入库费',
      billingBase: '100件',
      unitPrice: 2.5,
      baseAmount: 250,
      extraFee: 12.5,
      subtotal: 262.5
    },
    {
      ruleName: '仓储租仓费',
      billingBase: '5m³ × 30天',
      unitPrice: 1.0,
      baseAmount: 150,
      extraFee: 0,
      subtotal: 150
    }
  ]
  trialResult.taxExclusiveAmount = 400
  trialResult.taxAmount = 24
  trialResult.totalAmount = 424
  trialResult.taxRate = 6

  ElMessage.success('试算完成')
}
</script>

<style scoped>
.rule-engine-trial-container {
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

.trial-content {
  padding: 20px;
}

.trial-card {
  height: 100%;
}

.card-header {
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.amount {
  font-weight: 600;
  color: #303133;
}

.amount.total {
  color: #409eff;
  font-size: 16px;
}

.result-tip {
  margin-top: 16px;
  padding: 12px;
  background: #f4f4f5;
  border-radius: 4px;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>