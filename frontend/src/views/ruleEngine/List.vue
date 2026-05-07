<template>
  <div class="rule-engine-list-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <span class="page-title">费用规则列表</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建规则
        </el-button>
        <el-button @click="handleTrial">
          <el-icon><Cpu /></el-icon>
          规则试算
        </el-button>
        <el-button @click="handleImport">
          <el-icon><Upload /></el-icon>
          导入
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon total"><el-icon><Setting /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">规则总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon active"><el-icon><CircleCheck /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.active }}</div>
              <div class="stat-label">启用中</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon income"><el-icon><Top /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.incomeRule }}</div>
              <div class="stat-label">收入规则</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon cost"><el-icon><Bottom /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.costRule }}</div>
              <div class="stat-label">成本规则</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-panel">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="规则名称">
          <el-input v-model="searchForm.name" placeholder="请输入规则名称" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="规则编码">
          <el-input v-model="searchForm.code" placeholder="请输入规则编码" clearable style="width: 140px" />
        </el-form-item>
        <el-form-item label="规则类型">
          <el-select v-model="searchForm.ruleType" placeholder="请选择" clearable style="width: 120px">
            <el-option label="收入规则" value="income" />
            <el-option label="成本规则" value="cost" />
          </el-select>
        </el-form-item>
        <el-form-item label="计费模式">
          <el-select v-model="searchForm.billingMode" placeholder="请选择" clearable style="width: 140px">
            <el-option label="固定单价" value="fixed" />
            <el-option label="按重量" value="weight" />
            <el-option label="按体积" value="volume" />
            <el-option label="按数量" value="quantity" />
            <el-option label="周期计费" value="period" />
            <el-option label="阶梯计费" value="ladder" />
            <el-option label="保底封顶" value="cap" />
          </el-select>
        </el-form-item>
        <el-form-item label="业务类型">
          <el-select v-model="searchForm.businessType" placeholder="请选择" clearable style="width: 120px">
            <el-option label="仓储" value="storage" />
            <el-option label="运输" value="transport" />
            <el-option label="关务" value="customs" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 100px">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="ruleCode" label="规则编码" width="120" />
        <el-table-column prop="ruleName" label="规则名称" min-width="180" />
        <el-table-column prop="ruleType" label="规则类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.ruleType === 'income' ? 'success' : 'warning'" size="small">
              {{ row.ruleType === 'income' ? '收入规则' : '成本规则' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="billingMode" label="计费模式" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getBillingModeText(row.billingMode) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="businessType" label="业务类型" width="100">
          <template #default="{ row }">
            {{ getBusinessTypeText(row.businessType) }}
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="70" align="center" />
        <el-table-column prop="unitPrice" label="单价" width="100" align="right">
          <template #default="{ row }">
            {{ row.unitPrice ? '¥' + row.unitPrice.toFixed(4) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="taxRate" label="税率" width="70" align="center">
          <template #default="{ row }">
            {{ row.taxRate }}%
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="70">
          <template #default="{ row }">
            <el-switch v-model="row.status" active-value="active" inactive-value="inactive" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="60" align="center" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click="handleVersion(row)">版本</el-button>
            <el-button type="primary" link size="small" @click="handleCopy(row)">复制</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer v-model="showDetailDrawer" :title="`规则详情 - ${currentRule?.ruleName}`" size="900px">
      <template #default>
        <div class="detail-content" v-if="currentRule">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本信息" name="basic">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="规则编码">{{ currentRule.ruleCode }}</el-descriptions-item>
                <el-descriptions-item label="规则名称">{{ currentRule.ruleName }}</el-descriptions-item>
                <el-descriptions-item label="规则类型">
                  <el-tag :type="currentRule.ruleType === 'income' ? 'success' : 'warning'" size="small">
                    {{ currentRule.ruleType === 'income' ? '收入规则' : '成本规则' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="计费模式">{{ getBillingModeText(currentRule.billingMode) }}</el-descriptions-item>
                <el-descriptions-item label="业务类型">{{ getBusinessTypeText(currentRule.businessType) }}</el-descriptions-item>
                <el-descriptions-item label="优先级">{{ currentRule.priority }}</el-descriptions-item>
                <el-descriptions-item label="单价">
                  <span class="amount">¥{{ currentRule.unitPrice?.toFixed(4) || '-' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="税率">{{ currentRule.taxRate }}%</el-descriptions-item>
                <el-descriptions-item label="计价模式">
                  <el-tag size="small">{{ currentRule.priceMode === 'tax_included' ? '含税价' : '不含税价' }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="currentRule.status === 'active' ? 'success' : 'info'" size="small">
                    {{ currentRule.status === 'active' ? '启用' : '停用' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="当前版本">V{{ currentRule.version }}</el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>
            <el-tab-pane label="维度配置" name="dimensions">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="适用客户">
                  {{ currentRule.dimensions?.customer || '全部客户' }}
                </el-descriptions-item>
                <el-descriptions-item label="适用仓库">
                  {{ currentRule.dimensions?.warehouse || '全部仓库' }}
                </el-descriptions-item>
                <el-descriptions-item label="适用线路">
                  {{ currentRule.dimensions?.route || '全部线路' }}
                </el-descriptions-item>
                <el-descriptions-item label="适用口岸">
                  {{ currentRule.dimensions?.port || '全部口岸' }}
                </el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>
            <el-tab-pane label="阶梯费率" name="ladder" v-if="currentRule.billingMode === 'ladder'">
              <el-table :data="currentRule.ladderRates" border size="small">
                <el-table-column prop="minVolume" label="最小量" width="100" align="center" />
                <el-table-column prop="maxVolume" label="最大量" width="100" align="center" />
                <el-table-column prop="unitPrice" label="单价" width="120" align="right">
                  <template #default="{ row }">
                    ¥{{ row.unitPrice?.toFixed(4) }}
                  </template>
                </el-table-column>
                <el-table-column prop="remark" label="说明" min-width="200" />
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="附加费用" name="extra">
              <el-table :data="currentRule.extraFees" border size="small">
                <el-table-column prop="feeName" label="费用名称" width="150" />
                <el-table-column prop="feeType" label="费用类型" width="100" />
                <el-table-column prop="feeValue" label="费用值" width="120" align="right">
                  <template #default="{ row }">
                    {{ row.feeType === 'fixed' ? '¥' + row.feeValue : row.feeValue + '%' }}
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="!currentRule.extraFees?.length" description="无附加费用" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="showDetailDrawer = false">关闭</el-button>
          <el-button type="primary" @click="handleEdit(currentRule)">编辑规则</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Upload, Download, Setting, CircleCheck, Top, Bottom, Cpu } from '@element-plus/icons-vue'

const router = useRouter()

// 统计数据
const statistics = reactive({
  total: 245,
  active: 198,
  incomeRule: 156,
  costRule: 89
})

// 搜索表单
const searchForm = reactive({
  name: '',
  code: '',
  ruleType: '',
  billingMode: '',
  businessType: '',
  status: ''
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    ruleCode: 'R001',
    ruleName: '仓储入库费',
    ruleType: 'income',
    billingMode: 'fixed',
    businessType: 'storage',
    priority: 1,
    unitPrice: 2.5,
    taxRate: 6,
    priceMode: 'tax_included',
    status: 'active',
    version: 3,
    dimensions: { customer: '全部客户', warehouse: '深圳仓', route: '全部线路', port: '全部口岸' },
    ladderRates: [],
    extraFees: [{ feeName: '燃油附加费', feeType: 'percent', feeValue: 5 }]
  },
  {
    id: 2,
    ruleCode: 'R002',
    ruleName: '干线运输费（按重量）',
    ruleType: 'income',
    billingMode: 'weight',
    businessType: 'transport',
    priority: 2,
    unitPrice: 1.8,
    taxRate: 9,
    priceMode: 'tax_excluded',
    status: 'active',
    version: 2,
    dimensions: { customer: '全部客户', warehouse: '全部仓库', route: '干线A线', port: '全部口岸' },
    ladderRates: [
      { minVolume: 0, maxVolume: 1000, unitPrice: 2.0, remark: '0-1000kg' },
      { minVolume: 1000, maxVolume: 5000, unitPrice: 1.8, remark: '1000-5000kg' },
      { minVolume: 5000, maxVolume: null, unitPrice: 1.5, remark: '5000kg以上' }
    ],
    extraFees: [{ feeName: '燃油附加费', feeType: 'percent', feeValue: 10 }]
  },
  {
    id: 3,
    ruleCode: 'R003',
    ruleName: '报关服务费',
    ruleType: 'income',
    billingMode: 'fixed',
    businessType: 'customs',
    priority: 1,
    unitPrice: 500,
    taxRate: 6,
    priceMode: 'tax_excluded',
    status: 'active',
    version: 1,
    dimensions: { customer: '全部客户', warehouse: '全部仓库', route: '全部线路', port: '皇岗口岸' },
    ladderRates: [],
    extraFees: []
  },
  {
    id: 4,
    ruleCode: 'CR001',
    ruleName: '供应商干线运输成本',
    ruleType: 'cost',
    billingMode: 'weight',
    businessType: 'transport',
    priority: 1,
    unitPrice: 1.2,
    taxRate: 6,
    priceMode: 'tax_excluded',
    status: 'active',
    version: 1,
    dimensions: { customer: '全部客户', warehouse: '全部仓库', route: '干线A线', port: '全部口岸' },
    ladderRates: [],
    extraFees: []
  }
])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 4
})

// 详情抽屉
const showDetailDrawer = ref(false)
const currentRule = ref<any>(null)
const activeTab = ref('basic')

// 方法
const getBillingModeText = (mode: string) => {
  const texts: Record<string, string> = {
    fixed: '固定单价',
    weight: '按重量',
    volume: '按体积',
    quantity: '按数量',
    period: '周期计费',
    ladder: '阶梯计费',
    cap: '保底封顶'
  }
  return texts[mode] || mode
}

const getBusinessTypeText = (type: string) => {
  const texts: Record<string, string> = {
    storage: '仓储',
    transport: '运输',
    customs: '关务'
  }
  return texts[type] || type
}

const handleSearch = () => {
  ElMessage.success('搜索规则')
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    ;(searchForm as any)[key] = ''
  })
  ElMessage.info('已重置搜索条件')
}

const handleCreate = () => {
  router.push('/ruleEngine/create')
}

const handleTrial = () => {
  router.push('/ruleEngine/trial')
}

const handleView = (row: any) => {
  currentRule.value = row
  showDetailDrawer.value = true
}

const handleEdit = (row: any) => {
  router.push(`/ruleEngine/edit/${row.id}`)
}

const handleVersion = (row: any) => {
  router.push(`/ruleEngine/version/${row.id}`)
}

const handleCopy = (row: any) => {
  ElMessage.success('已复制规则: ' + row.ruleName)
}

const handleStatusChange = (row: any) => {
  ElMessage.success(`${row.ruleName}已${row.status === 'active' ? '启用' : '停用'}`)
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.page = 1
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
}

const handleImport = () => {
  ElMessage.info('打开导入功能')
}

const handleExport = () => {
  ElMessage.success('导出规则')
}
</script>

<style scoped>
.rule-engine-list-container {
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

.header-left .page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  gap: 12px;
}

.statistics-cards {
  padding: 16px 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-icon.total { background: #ecf5ff; color: #409eff; }
.stat-icon.active { background: #f0f9eb; color: #67c23a; }
.stat-icon.income { background: #f0f9eb; color: #67c23a; }
.stat-icon.cost { background: #fff0f0; color: #f56c6c; }

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.search-panel {
  background: #fff;
  margin: 0 20px;
  padding: 20px;
  border-radius: 8px;
}

.table-container {
  background: #fff;
  margin: 16px 20px;
  padding: 20px;
  border-radius: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.detail-content {
  padding: 0 10px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.amount {
  font-weight: 600;
  color: #303133;
}
</style>