<template>
  <div class="income-add-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">添加收入</span>
      </div>
      <div class="header-right">
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="info-card">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
          </div>
        </template>
        <el-descriptions :column="4" border size="small">
          <el-descriptions-item label="费率单编号">FL2024050001</el-descriptions-item>
          <el-descriptions-item label="费率单创建来源">系统创建</el-descriptions-item>
          <el-descriptions-item label="费率单创建时间">2024-05-01 10:30:00</el-descriptions-item>
          <el-descriptions-item label="业务参考编号">PO2024050001</el-descriptions-item>
          <el-descriptions-item label="计费单据">应收单</el-descriptions-item>
          <el-descriptions-item label="客户部门">销售部</el-descriptions-item>
          <el-descriptions-item label="客户指令号">CMD2024050001</el-descriptions-item>
          <el-descriptions-item label="总运单号">MBL2024050001</el-descriptions-item>
          <el-descriptions-item label="分运单号">HBL2024050001</el-descriptions-item>
          <el-descriptions-item label="收入不含税总金额">¥100,000.00</el-descriptions-item>
          <el-descriptions-item label="成本不含税总金额">¥70,000.00</el-descriptions-item>
          <el-descriptions-item label="毛利不含税总金额">¥30,000.00</el-descriptions-item>
          <el-descriptions-item label="收入含税总金额">¥113,000.00</el-descriptions-item>
          <el-descriptions-item label="成本含税总金额">¥79,100.00</el-descriptions-item>
          <el-descriptions-item label="毛利含税总金额">¥33,900.00</el-descriptions-item>
          <el-descriptions-item label="计费单据编号">YS2024050001</el-descriptions-item>
          <el-descriptions-item label="客户名称">深圳市腾讯科技有限公司</el-descriptions-item>
          <el-descriptions-item label="仓库">深圳仓</el-descriptions-item>
          <el-descriptions-item label="业务模式">FOB</el-descriptions-item>
          <el-descriptions-item label="费率单类型">标准费率</el-descriptions-item>
          <el-descriptions-item label="订单新建时间">2024-04-15 09:00:00</el-descriptions-item>
          <el-descriptions-item label="订单完成时间">2024-05-01 18:00:00</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag size="small" type="success">已完成</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="是否结算订单">是</el-descriptions-item>
          <el-descriptions-item label="客户报价单编号">QT2024050001</el-descriptions-item>
          <el-descriptions-item label="业务编号">BN2024050001</el-descriptions-item>
          <el-descriptions-item label="流转单编号">LS2024050001</el-descriptions-item>
          <el-descriptions-item label="费率单状态">
            <el-tag size="small" type="success">已确认</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="费率单确认时间">2024-05-02 10:00:00</el-descriptions-item>
          <el-descriptions-item label="费率单对账状态">
            <el-tag size="small" type="success">已对账</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="费率单成本状态">
            <el-tag size="small" type="success">已确认</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="费率单成本确认时间">2024-05-02 11:00:00</el-descriptions-item>
          <el-descriptions-item label="修改审批状态">
            <el-tag size="small" type="success">已通过</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="单据ID">DOC001</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>

    <!-- Tab页 -->
    <div class="tab-card">
      <el-tabs v-model="activeTab" class="detail-tabs">
        <el-tab-pane label="收入明细" name="income">
          <div class="table-toolbar">
            <el-button type="primary" size="small" @click="handleAddIncomeItem">
              <el-icon><Plus /></el-icon>
              添加收入明细
            </el-button>
          </div>
          <el-table :data="incomeItems" border size="small" max-height="400">
            <el-table-column prop="incomeItem" label="收入项目" min-width="120">
              <template #default="{ row }">
                <el-select v-model="row.incomeItem" placeholder="请选择" style="width: 100%">
                  <el-option label="仓储费" value="仓储费" />
                  <el-option label="装卸费" value="装卸费" />
                  <el-option label="运输费" value="运输费" />
                  <el-option label="报关费" value="报关费" />
                  <el-option label="港杂费" value="港杂费" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="productL1" label="产品标准名L1" min-width="120">
              <template #default="{ row }">
                <el-input v-model="row.productL1" placeholder="请输入" />
              </template>
            </el-table-column>
            <el-table-column prop="productL2" label="产品标准名L2" min-width="120">
              <template #default="{ row }">
                <el-input v-model="row.productL2" placeholder="请输入" />
              </template>
            </el-table-column>
            <el-table-column prop="productL3" label="产品标准名L3" min-width="120">
              <template #default="{ row }">
                <el-input v-model="row.productL3" placeholder="请输入" />
              </template>
            </el-table-column>
            <el-table-column prop="currency" label="币种" width="100">
              <template #default="{ row }">
                <el-select v-model="row.currency" placeholder="请选择" style="width: 100%">
                  <el-option label="人民币 (CNY)" value="CNY" />
                  <el-option label="美元 (USD)" value="USD" />
                  <el-option label="欧元 (EUR)" value="EUR" />
                  <el-option label="港币 (HKD)" value="HKD" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="exTaxAmount" label="不含税金额" width="130" align="right">
              <template #default="{ row }">
                <el-input-number v-model="row.exTaxAmount" :min="0" :precision="2" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column prop="taxRate" label="税率(%)" width="100" align="right">
              <template #default="{ row }">
                <el-input-number v-model="row.taxRate" :min="0" :max="100" :precision="0" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column prop="taxAmount" label="税额" width="120" align="right">
              <template #default="{ row }">¥{{ formatMoney(row.taxAmount || 0) }}</template>
            </el-table-column>
            <el-table-column prop="incTaxAmount" label="含税金额" width="130" align="right">
              <template #default="{ row }">¥{{ formatMoney(row.incTaxAmount || 0) }}</template>
            </el-table-column>
            <el-table-column prop="exchangeRate" label="汇率" width="80" align="right">
              <template #default="{ row }">
                <el-input-number v-model="row.exchangeRate" :min="0" :precision="4" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column prop="exTaxAmountCny" label="不含税(折合CNY)" width="140" align="right">
              <template #default="{ row }">¥{{ formatMoney(row.exTaxAmountCny || 0) }}</template>
            </el-table-column>
            <el-table-column prop="incTaxAmountCny" label="含税(折合CNY)" width="140" align="right">
              <template #default="{ row }">¥{{ formatMoney(row.incTaxAmountCny || 0) }}</template>
            </el-table-column>
            <el-table-column prop="settlementUnit" label="结算单位" min-width="120">
              <template #default="{ row }">
                <el-select v-model="row.settlementUnit" placeholder="请选择" style="width: 100%">
                  <el-option label="深圳分公司" value="深圳分公司" />
                  <el-option label="上海分公司" value="上海分公司" />
                  <el-option label="广州分公司" value="广州分公司" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="customerService" label="客服" width="100">
              <template #default="{ row }">
                <el-input v-model="row.customerService" placeholder="请输入" />
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="120">
              <template #default="{ row }">
                <el-input v-model="row.remark" placeholder="请输入" />
              </template>
            </el-table-column>
            <el-table-column prop="reconcileStatus" label="对账状态" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.reconcileStatus || '未对账' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="creator" label="创建人" width="100">{{ userInfo.creator }}</el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="160">{{ userInfo.createTime }}</el-table-column>
            <el-table-column prop="updater" label="修改人" width="100">{{ userInfo.updater }}</el-table-column>
            <el-table-column prop="updateTime" label="修改时间" width="160">{{ userInfo.updateTime }}</el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="scope">
                <el-button type="danger" size="small" link @click="handleDeleteIncomeItem(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="成本明细" name="cost">
          <div class="table-toolbar">
            <el-button type="primary" size="small" @click="handleAddCostItem">
              <el-icon><Plus /></el-icon>
              添加成本明细
            </el-button>
          </div>
          <el-table :data="costItems" border size="small" max-height="400">
            <el-table-column prop="costType" label="成本类型" min-width="120">
              <template #default="{ row }">
                <el-select v-model="row.costType" placeholder="请选择" style="width: 100%">
                  <el-option label="供应商成本" value="supplier" />
                  <el-option label="内部成本" value="internal" />
                  <el-option label="代理成本" value="agent" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="supplier" label="供应商" min-width="150">
              <template #default="{ row }">
                <el-select v-model="row.supplier" placeholder="请选择" style="width: 100%">
                  <el-option label="深圳供应商A公司" value="深圳供应商A公司" />
                  <el-option label="上海供应商B公司" value="上海供应商B公司" />
                  <el-option label="广州供应商C公司" value="广州供应商C公司" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="costItem" label="成本项目" min-width="120">
              <template #default="{ row }">
                <el-select v-model="row.costItem" placeholder="请选择" style="width: 100%">
                  <el-option label="采购成本" value="采购成本" />
                  <el-option label="运输成本" value="运输成本" />
                  <el-option label="仓储成本" value="仓储成本" />
                  <el-option label="报关成本" value="报关成本" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="productL1" label="产品标准名L1" min-width="120">
              <template #default="{ row }">
                <el-input v-model="row.productL1" placeholder="请输入" />
              </template>
            </el-table-column>
            <el-table-column prop="productL2" label="产品标准名L2" min-width="120">
              <template #default="{ row }">
                <el-input v-model="row.productL2" placeholder="请输入" />
              </template>
            </el-table-column>
            <el-table-column prop="productL3" label="产品标准名L3" min-width="120">
              <template #default="{ row }">
                <el-input v-model="row.productL3" placeholder="请输入" />
              </template>
            </el-table-column>
            <el-table-column prop="currency" label="币种" width="100">
              <template #default="{ row }">
                <el-select v-model="row.currency" placeholder="请选择" style="width: 100%">
                  <el-option label="人民币 (CNY)" value="CNY" />
                  <el-option label="美元 (USD)" value="USD" />
                  <el-option label="欧元 (EUR)" value="EUR" />
                  <el-option label="港币 (HKD)" value="HKD" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="exTaxAmount" label="不含税金额" width="130" align="right">
              <template #default="{ row }">
                <el-input-number v-model="row.exTaxAmount" :min="0" :precision="2" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column prop="taxRate" label="税率(%)" width="100" align="right">
              <template #default="{ row }">
                <el-input-number v-model="row.taxRate" :min="0" :max="100" :precision="0" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column prop="taxAmount" label="税额" width="120" align="right">
              <template #default="{ row }">¥{{ formatMoney(row.taxAmount || 0) }}</template>
            </el-table-column>
            <el-table-column prop="incTaxAmount" label="含税金额" width="130" align="right">
              <template #default="{ row }">¥{{ formatMoney(row.incTaxAmount || 0) }}</template>
            </el-table-column>
            <el-table-column prop="exchangeRate" label="汇率" width="80" align="right">
              <template #default="{ row }">
                <el-input-number v-model="row.exchangeRate" :min="0" :precision="4" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column prop="exTaxAmountCny" label="不含税(折合CNY)" width="140" align="right">
              <template #default="{ row }">¥{{ formatMoney(row.exTaxAmountCny || 0) }}</template>
            </el-table-column>
            <el-table-column prop="incTaxAmountCny" label="含税(折合CNY)" width="140" align="right">
              <template #default="{ row }">¥{{ formatMoney(row.incTaxAmountCny || 0) }}</template>
            </el-table-column>
            <el-table-column prop="settlementUnit" label="结算单位" min-width="120">
              <template #default="{ row }">
                <el-select v-model="row.settlementUnit" placeholder="请选择" style="width: 100%">
                  <el-option label="深圳分公司" value="深圳分公司" />
                  <el-option label="上海分公司" value="上海分公司" />
                  <el-option label="广州分公司" value="广州分公司" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="customerService" label="客服" width="100">
              <template #default="{ row }">
                <el-input v-model="row.customerService" placeholder="请输入" />
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="120">
              <template #default="{ row }">
                <el-input v-model="row.remark" placeholder="请输入" />
              </template>
            </el-table-column>
            <el-table-column prop="creator" label="创建人" width="100">{{ userInfo.creator }}</el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="160">{{ userInfo.createTime }}</el-table-column>
            <el-table-column prop="updater" label="修改人" width="100">{{ userInfo.updater }}</el-table-column>
            <el-table-column prop="updateTime" label="修改时间" width="160">{{ userInfo.updateTime }}</el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="scope">
                <el-button type="danger" size="small" link @click="handleDeleteCostItem(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'

const router = useRouter()
const activeTab = ref('income')

// 用户信息
const userInfo = reactive({
  creator: '张三',
  createTime: '2024-05-01 10:30:00',
  updater: '张三',
  updateTime: '2024-05-01 10:30:00'
})

// 收入明细
const incomeItems = ref([
  {
    incomeItem: '仓储费',
    productL1: '仓储服务',
    productL2: '普通仓储',
    productL3: '标准仓储',
    currency: 'CNY',
    exTaxAmount: 50000,
    taxRate: 6,
    taxAmount: 3000,
    incTaxAmount: 53000,
    exchangeRate: 1,
    exTaxAmountCny: 50000,
    incTaxAmountCny: 53000,
    settlementUnit: '深圳分公司',
    customerService: '李四',
    remark: '',
    reconcileStatus: '已对账'
  },
  {
    incomeItem: '装卸费',
    productL1: '装卸服务',
    productL2: '人工装卸',
    productL3: '标准装卸',
    currency: 'CNY',
    exTaxAmount: 30000,
    taxRate: 6,
    taxAmount: 1800,
    incTaxAmount: 31800,
    exchangeRate: 1,
    exTaxAmountCny: 30000,
    incTaxAmountCny: 31800,
    settlementUnit: '深圳分公司',
    customerService: '李四',
    remark: '',
    reconcileStatus: '未对账'
  },
  {
    incomeItem: '运输费',
    productL1: '运输服务',
    productL2: '公路运输',
    productL3: '标准运输',
    currency: 'CNY',
    exTaxAmount: 20000,
    taxRate: 9,
    taxAmount: 1800,
    incTaxAmount: 21800,
    exchangeRate: 1,
    exTaxAmountCny: 20000,
    incTaxAmountCny: 21800,
    settlementUnit: '深圳分公司',
    customerService: '王五',
    remark: '',
    reconcileStatus: '已对账'
  }
])

// 成本明细
const costItems = ref([
  {
    costType: 'supplier',
    supplier: '深圳供应商A公司',
    costItem: '采购成本',
    productL1: '仓储服务',
    productL2: '普通仓储',
    productL3: '标准仓储',
    currency: 'CNY',
    exTaxAmount: 35000,
    taxRate: 6,
    taxAmount: 2100,
    incTaxAmount: 37100,
    exchangeRate: 1,
    exTaxAmountCny: 35000,
    incTaxAmountCny: 37100,
    settlementUnit: '深圳分公司',
    customerService: '李四',
    remark: ''
  },
  {
    costType: 'internal',
    supplier: '上海供应商B公司',
    costItem: '运输成本',
    productL1: '运输服务',
    productL2: '公路运输',
    productL3: '标准运输',
    currency: 'CNY',
    exTaxAmount: 25000,
    taxRate: 9,
    taxAmount: 2250,
    incTaxAmount: 27250,
    exchangeRate: 1,
    exTaxAmountCny: 25000,
    incTaxAmountCny: 27250,
    settlementUnit: '深圳分公司',
    customerService: '王五',
    remark: ''
  },
  {
    costType: 'agent',
    supplier: '广州供应商C公司',
    costItem: '报关成本',
    productL1: '报关服务',
    productL2: '进口报关',
    productL3: '一般报关',
    currency: 'CNY',
    exTaxAmount: 10000,
    taxRate: 6,
    taxAmount: 600,
    incTaxAmount: 10600,
    exchangeRate: 1,
    exTaxAmountCny: 10000,
    incTaxAmountCny: 10600,
    settlementUnit: '深圳分公司',
    customerService: '赵六',
    remark: ''
  }
])

// 格式化金额
const formatMoney = (value: number) => {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

// 返回
const handleBack = () => {
  router.back()
}

// 保存草稿
const handleSaveDraft = () => {
  ElMessage.success('草稿保存成功')
}

// 提交
const handleSubmit = () => {
  ElMessage.success('提交成功')
  router.push('/receivable/list')
}

// 添加收入明细
const handleAddIncomeItem = () => {
  incomeItems.value.push({
    incomeItem: '',
    productL1: '',
    productL2: '',
    productL3: '',
    currency: 'CNY',
    exTaxAmount: 0,
    taxRate: 6,
    taxAmount: 0,
    incTaxAmount: 0,
    exchangeRate: 1,
    exTaxAmountCny: 0,
    incTaxAmountCny: 0,
    settlementUnit: '',
    customerService: '',
    remark: '',
    reconcileStatus: '未对账'
  })
}

// 删除收入明细
const handleDeleteIncomeItem = (index: number) => {
  incomeItems.value.splice(index, 1)
}

// 添加成本明细
const handleAddCostItem = () => {
  costItems.value.push({
    costType: '',
    supplier: '',
    costItem: '',
    productL1: '',
    productL2: '',
    productL3: '',
    currency: 'CNY',
    exTaxAmount: 0,
    taxRate: 6,
    taxAmount: 0,
    incTaxAmount: 0,
    exchangeRate: 1,
    exTaxAmountCny: 0,
    incTaxAmountCny: 0,
    settlementUnit: '',
    customerService: '',
    remark: ''
  })
}

// 删除成本明细
const handleDeleteCostItem = (index: number) => {
  costItems.value.splice(index, 1)
}
</script>

<style scoped>
.income-add-container {
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
  gap: 16px;
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

.info-card {
  margin: 16px 20px;
}

.tab-card {
  margin: 0 20px 20px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}

.table-toolbar {
  margin-bottom: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.detail-tabs :deep(.el-tabs__header) {
  margin-bottom: 20px;
}
</style>
