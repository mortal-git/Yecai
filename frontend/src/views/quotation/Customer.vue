<template>
  <div class="quotation-customer-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <span class="page-title">客户收入报价管理</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建报价单
        </el-button>
        <el-button @click="handleImport">
          <el-icon><Upload /></el-icon>
          批量导入
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
            <div class="stat-icon total"><el-icon><PriceTag /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">报价单总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon active"><el-icon><CircleCheck /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.active }}</div>
              <div class="stat-label">生效中</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon pending"><el-icon><Clock /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.pending }}</div>
              <div class="stat-label">审核中</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon expiring"><el-icon><Warning /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.expiring }}</div>
              <div class="stat-label">即将过期</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-panel">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="客户名称">
          <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="报价单号">
          <el-input v-model="searchForm.quotationNo" placeholder="请输入报价单号" clearable style="width: 140px" />
        </el-form-item>
        <el-form-item label="业务类型">
          <el-select v-model="searchForm.businessType" placeholder="请选择" clearable style="width: 140px">
            <el-option label="仓储服务" value="storage" />
            <el-option label="运输服务" value="transport" />
            <el-option label="关务服务" value="customs" />
            <el-option label="综合物流" value="integrated" />
          </el-select>
        </el-form-item>
        <el-form-item label="报价状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="草稿" value="draft" />
            <el-option label="审核中" value="pending" />
            <el-option label="审核通过" value="approved" />
            <el-option label="生效" value="active" />
            <el-option label="过期" value="expired" />
            <el-option label="作废" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="生效日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table :data="tableData" border stripe @row-click="handleRowClick">
        <el-table-column prop="quotationNo" label="报价单号" width="150" />
        <el-table-column prop="customerCode" label="客户编码" width="100" />
        <el-table-column prop="customerName" label="客户名称" min-width="180" />
        <el-table-column prop="businessType" label="业务类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getBusinessTypeText(row.businessType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="60" />
        <el-table-column prop="effectiveDate" label="生效日期" width="110" />
        <el-table-column prop="expiryDate" label="失效日期" width="110" />
        <el-table-column prop="currency" label="币种" width="60" />
        <el-table-column prop="taxRate" label="税率" width="70">
          <template #default="{ row }">
            {{ row.taxRate }}%
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ruleCount" label="绑定规则数" width="90" align="center" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click.stop="handleView(row)">查看</el-button>
            <el-button type="primary" link size="small" @click.stop="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click.stop="handleVersion(row)">版本</el-button>
            <el-button type="primary" link size="small" @click.stop="handleCopy(row)">复制</el-button>
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
    <el-drawer v-model="showDetailDrawer" :title="`报价单详情 - ${currentQuotation?.quotationNo}`" size="900px">
      <template #default>
        <div class="detail-content" v-if="currentQuotation">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本信息" name="basic">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="报价单号">{{ currentQuotation.quotationNo }}</el-descriptions-item>
                <el-descriptions-item label="客户编码">{{ currentQuotation.customerCode }}</el-descriptions-item>
                <el-descriptions-item label="客户名称">{{ currentQuotation.customerName }}</el-descriptions-item>
                <el-descriptions-item label="当前版本">V{{ currentQuotation.version }}</el-descriptions-item>
                <el-descriptions-item label="业务类型">{{ getBusinessTypeText(currentQuotation.businessType) }}</el-descriptions-item>
                <el-descriptions-item label="结算周期">{{ currentQuotation.settlementCycle }}</el-descriptions-item>
                <el-descriptions-item label="生效日期">{{ currentQuotation.effectiveDate }}</el-descriptions-item>
                <el-descriptions-item label="失效日期">{{ currentQuotation.expiryDate }}</el-descriptions-item>
                <el-descriptions-item label="币种">{{ currentQuotation.currency }}</el-descriptions-item>
                <el-descriptions-item label="税率">{{ currentQuotation.taxRate }}%</el-descriptions-item>
                <el-descriptions-item label="报价状态">
                  <el-tag :type="getStatusType(currentQuotation.status)" size="small">
                    {{ getStatusText(currentQuotation.status) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ currentQuotation.createTime }}</el-descriptions-item>
                <el-descriptions-item label="创建人">{{ currentQuotation.creator }}</el-descriptions-item>
                <el-descriptions-item label="审核人">{{ currentQuotation.reviewer || '-' }}</el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>
            <el-tab-pane label="绑定计费规则" name="rules">
              <el-table :data="currentQuotation.rules" border size="small">
                <el-table-column prop="ruleCode" label="规则编码" width="120" />
                <el-table-column prop="ruleName" label="规则名称" min-width="150" />
                <el-table-column prop="ruleType" label="规则类型" width="100">
                  <template #default="{ row }">
                    {{ getRuleTypeText(row.ruleType) }}
                  </template>
                </el-table-column>
                <el-table-column prop="billingMode" label="计费模式" width="120">
                  <template #default="{ row }">
                    {{ getBillingModeText(row.billingMode) }}
                  </template>
                </el-table-column>
                <el-table-column prop="priority" label="优先级" width="70" align="center" />
                <el-table-column prop="unitPrice" label="单价" width="100" align="right">
                  <template #default="{ row }">
                    ¥{{ row.unitPrice?.toFixed(4) || '-' }}
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="!currentQuotation.rules?.length" description="暂未绑定计费规则" />
            </el-tab-pane>
            <el-tab-pane label="操作日志" name="logs">
              <el-table :data="currentQuotation.logs" border size="small">
                <el-table-column prop="actionTime" label="操作时间" width="160" />
                <el-table-column prop="operator" label="操作人" width="100" />
                <el-table-column prop="actionType" label="操作类型" width="100" />
                <el-table-column prop="actionDetail" label="操作详情" min-width="300" />
              </el-table>
              <el-empty v-if="!currentQuotation.logs?.length" description="暂无操作记录" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="showDetailDrawer = false">关闭</el-button>
          <el-button v-if="currentQuotation?.status === 'draft'" type="primary" @click="handleEdit(currentQuotation)">编辑</el-button>
          <el-button v-if="currentQuotation?.status === 'draft'" type="warning" @click="handleSubmit(currentQuotation)">提交审核</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 新建/编辑对话框 -->
    <el-dialog v-model="showDialog" :title="isEdit ? '编辑报价单' : '新建报价单'" width="950px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="客户" prop="customerId">
              <el-select v-model="formData.customerId" placeholder="请选择客户" style="width: 100%" filterable>
                <el-option v-for="c in customerList" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="业务类型" prop="businessType">
              <el-select v-model="formData.businessType" placeholder="请选择" style="width: 100%">
                <el-option label="仓储服务" value="storage" />
                <el-option label="运输服务" value="transport" />
                <el-option label="关务服务" value="customs" />
                <el-option label="综合物流" value="integrated" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="生效日期" prop="effectiveDate">
              <el-date-picker v-model="formData.effectiveDate" type="date" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="失效日期" prop="expiryDate">
              <el-date-picker v-model="formData.expiryDate" type="date" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="结算周期" prop="settlementCycle">
              <el-select v-model="formData.settlementCycle" placeholder="请选择" style="width: 100%">
                <el-option label="月结" value="monthly" />
                <el-option label="季度结" value="quarterly" />
                <el-option label="年结" value="yearly" />
                <el-option label="预付" value="prepaid" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="币种" prop="currency">
              <el-select v-model="formData.currency" placeholder="请选择" style="width: 100%">
                <el-option label="人民币" value="CNY" />
                <el-option label="美元" value="USD" />
                <el-option label="港币" value="HKD" />
                <el-option label="欧元" value="EUR" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="税率" prop="taxRate">
              <el-select v-model="formData.taxRate" placeholder="请选择" style="width: 100%">
                <el-option label="0%" :value="0" />
                <el-option label="3%" :value="3" />
                <el-option label="6%" :value="6" />
                <el-option label="9%" :value="9" />
                <el-option label="13%" :value="13" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">绑定计费规则</el-divider>
        <div class="rules-section">
          <div class="rules-header">
            <span>已绑定 {{ formData.rules.length }} 条计费规则</span>
            <el-button type="primary" size="small" @click="handleAddRule">
              <el-icon><Plus /></el-icon>
              添加规则
            </el-button>
          </div>
          <el-table :data="formData.rules" border size="small" class="rules-table">
            <el-table-column prop="ruleCode" label="规则编码" width="120" />
            <el-table-column prop="ruleName" label="规则名称" min-width="150" />
            <el-table-column prop="ruleType" label="规则类型" width="100">
              <template #default="{ row }">
                {{ getRuleTypeText(row.ruleType) }}
              </template>
            </el-table-column>
            <el-table-column prop="billingMode" label="计费模式" width="120">
              <template #default="{ row }">
                {{ getBillingModeText(row.billingMode) }}
              </template>
            </el-table-column>
            <el-table-column prop="priority" label="优先级" width="80">
              <template #default="{ row }">
                <el-input-number v-model="row.priority" :min="1" :max="100" size="small" controls-position="right" style="width: 70px" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row, $index }">
                <el-button type="danger" link size="small" @click="handleRemoveRule($index)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button type="primary" @click="handleSubmitForm">提交审核</el-button>
      </template>
    </el-dialog>

    <!-- 规则选择对话框 -->
    <el-dialog v-model="showRuleDialog" title="选择计费规则" width="800px">
      <div class="search-panel" style="padding: 0; margin-bottom: 16px;">
        <el-form :inline="true" :model="ruleSearchForm">
          <el-form-item label="规则名称">
            <el-input v-model="ruleSearchForm.name" placeholder="请输入规则名称" clearable style="width: 160px" />
          </el-form-item>
          <el-form-item label="规则类型">
            <el-select v-model="ruleSearchForm.ruleType" placeholder="请选择" clearable style="width: 120px">
              <el-option label="收入规则" value="income" />
              <el-option label="成本规则" value="cost" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearchRules">搜索</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="availableRules" border size="small" @selection-change="handleRuleSelection">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="ruleCode" label="规则编码" width="120" />
        <el-table-column prop="ruleName" label="规则名称" min-width="150" />
        <el-table-column prop="ruleType" label="规则类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.ruleType === 'income' ? 'success' : 'warning'">
              {{ row.ruleType === 'income' ? '收入规则' : '成本规则' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="billingMode" label="计费模式" width="120">
          <template #default="{ row }">
            {{ getBillingModeText(row.billingMode) }}
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="showRuleDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmRuleSelection">确认选择</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Upload, Download, PriceTag, CircleCheck, Clock, Warning } from '@element-plus/icons-vue'

// 统计数据
const statistics = reactive({
  total: 156,
  active: 89,
  pending: 12,
  expiring: 8
})

// 搜索表单
const searchForm = reactive({
  customerName: '',
  quotationNo: '',
  businessType: '',
  status: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    quotationNo: 'QT2026040001',
    customerCode: 'KH001',
    customerName: '深圳市腾讯科技有限公司',
    businessType: 'storage',
    version: 1,
    effectiveDate: '2026-04-01',
    expiryDate: '2027-03-31',
    currency: 'CNY',
    taxRate: 6,
    settlementCycle: 'monthly',
    status: 'active',
    ruleCount: 5,
    createTime: '2026-03-28 10:30:00',
    creator: '张三',
    reviewer: '李经理',
    rules: [
      { ruleCode: 'R001', ruleName: '仓储入库费', ruleType: 'income', billingMode: 'fixed', priority: 1, unitPrice: 2.5 },
      { ruleCode: 'R002', ruleName: '仓储出库费', ruleType: 'income', billingMode: 'fixed', priority: 2, unitPrice: 3.0 }
    ],
    logs: [
      { actionTime: '2026-03-28 10:30:00', operator: '张三', actionType: '创建', actionDetail: '新建报价单' },
      { actionTime: '2026-03-28 14:20:00', operator: '李经理', actionType: '审核', actionDetail: '审核通过' },
      { actionTime: '2026-03-28 14:25:00', operator: '系统', actionType: '生效', actionDetail: '报价单生效' }
    ]
  },
  {
    id: 2,
    quotationNo: 'QT2026040002',
    customerCode: 'KH002',
    customerName: '阿里巴巴（中国）有限公司',
    businessType: 'transport',
    version: 2,
    effectiveDate: '2026-04-15',
    expiryDate: '2027-04-14',
    currency: 'CNY',
    taxRate: 9,
    settlementCycle: 'monthly',
    status: 'pending',
    ruleCount: 8,
    createTime: '2026-04-20 09:15:00',
    creator: '王五',
    reviewer: null,
    rules: [],
    logs: [
      { actionTime: '2026-04-20 09:15:00', operator: '王五', actionType: '创建', actionDetail: '新建报价单V2' },
      { actionTime: '2026-04-20 09:15:00', operator: '王五', actionType: '提交', actionDetail: '提交审核' }
    ]
  },
  {
    id: 3,
    quotationNo: 'QT2026030003',
    customerCode: 'KH003',
    customerName: '字节跳动科技有限公司',
    businessType: 'customs',
    version: 1,
    effectiveDate: '2026-03-01',
    expiryDate: '2026-08-31',
    currency: 'CNY',
    taxRate: 6,
    settlementCycle: 'quarterly',
    status: 'expired',
    ruleCount: 3,
    createTime: '2026-02-20 16:45:00',
    creator: '赵六',
    reviewer: '孙经理',
    rules: [],
    logs: []
  }
])

// 客户列表
const customerList = ref([
  { id: 1, code: 'KH001', name: '深圳市腾讯科技有限公司' },
  { id: 2, code: 'KH002', name: '阿里巴巴（中国）有限公司' },
  { id: 3, code: 'KH003', name: '字节跳动科技有限公司' }
])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 3
})

// 详情抽屉
const showDetailDrawer = ref(false)
const currentQuotation = ref<any>(null)
const activeTab = ref('basic')

// 对话框
const showDialog = ref(false)
const showRuleDialog = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  customerId: null as number | null,
  businessType: '',
  effectiveDate: '',
  expiryDate: '',
  settlementCycle: 'monthly',
  currency: 'CNY',
  taxRate: 6,
  rules: [] as Array<any>
})

const formRules: FormRules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  businessType: [{ required: true, message: '请选择业务类型', trigger: 'change' }],
  effectiveDate: [{ required: true, message: '请选择生效日期', trigger: 'change' }],
  expiryDate: [{ required: true, message: '请选择失效日期', trigger: 'change' }],
  settlementCycle: [{ required: true, message: '请选择结算周期', trigger: 'change' }],
  currency: [{ required: true, message: '请选择币种', trigger: 'change' }],
  taxRate: [{ required: true, message: '请选择税率', trigger: 'change' }]
}

// 规则选择
const ruleSearchForm = reactive({ name: '', ruleType: '' })
const availableRules = ref([
  { ruleCode: 'R001', ruleName: '仓储入库费', ruleType: 'income', billingMode: 'fixed' },
  { ruleCode: 'R002', ruleName: '仓储出库费', ruleType: 'income', billingMode: 'fixed' },
  { ruleCode: 'R003', ruleName: '仓储租仓费', ruleType: 'income', billingMode: 'period' },
  { ruleCode: 'R004', ruleName: '干线运输费', ruleType: 'income', billingMode: 'weight' },
  { ruleCode: 'R005', ruleName: '配送费', ruleType: 'income', billingMode: 'quantity' },
  { ruleCode: 'R006', ruleName: '报关费', ruleType: 'income', billingMode: 'fixed' }
])
const selectedRules = ref<any[]>([])

// 方法
const getBusinessTypeText = (type: string) => {
  const texts: Record<string, string> = {
    storage: '仓储服务',
    transport: '运输服务',
    customs: '关务服务',
    integrated: '综合物流'
  }
  return texts[type] || type
}

const getRuleTypeText = (type: string) => {
  return type === 'income' ? '收入规则' : '成本规则'
}

const getBillingModeText = (mode: string) => {
  const texts: Record<string, string> = {
    fixed: '固定单价',
    weight: '按重量',
    volume: '按体积',
    quantity: '按数量',
    period: '周期计费',
    ladder: '阶梯计费'
  }
  return texts[mode] || mode
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    draft: 'info',
    pending: 'warning',
    approved: 'primary',
    active: 'success',
    expired: 'danger',
    cancelled: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    draft: '草稿',
    pending: '审核中',
    approved: '审核通过',
    active: '生效',
    expired: '过期',
    cancelled: '作废'
  }
  return texts[status] || status
}

const handleSearch = () => {
  ElMessage.success('搜索报价单')
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    ;(searchForm as any)[key] = key === 'dateRange' ? [] : ''
  })
  ElMessage.info('已重置搜索条件')
}

const handleCreate = () => {
  isEdit.value = false
  Object.assign(formData, {
    customerId: null,
    businessType: '',
    effectiveDate: '',
    expiryDate: '',
    settlementCycle: 'monthly',
    currency: 'CNY',
    taxRate: 6,
    rules: []
  })
  showDialog.value = true
}

const handleView = (row: any) => {
  currentQuotation.value = row
  showDetailDrawer.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  showDetailDrawer.value = false
  Object.assign(formData, {
    customerId: row.customerId,
    businessType: row.businessType,
    effectiveDate: row.effectiveDate,
    expiryDate: row.expiryDate,
    settlementCycle: row.settlementCycle,
    currency: row.currency,
    taxRate: row.taxRate,
    rules: [...row.rules]
  })
  showDialog.value = true
}

const handleVersion = (row: any) => {
  ElMessage.info('查看版本历史: ' + row.quotationNo)
}

const handleCopy = (row: any) => {
  ElMessage.success('已复制报价单: ' + row.quotationNo)
}

const handleSubmit = (row: any) => {
  ElMessage.success('已提交审核: ' + row.quotationNo)
}

const handleSaveDraft = () => {
  ElMessage.success('草稿保存成功')
  showDialog.value = false
}

const handleSubmitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('提交成功')
      showDialog.value = false
    }
  })
}

const handleAddRule = () => {
  selectedRules.value = []
  showRuleDialog.value = true
}

const handleRemoveRule = (index: number) => {
  formData.rules.splice(index, 1)
}

const handleSearchRules = () => {
  ElMessage.info('搜索规则')
}

const handleRuleSelection = (selection: any[]) => {
  selectedRules.value = selection
}

const handleConfirmRuleSelection = () => {
  selectedRules.value.forEach(rule => {
    if (!formData.rules.find(r => r.ruleCode === rule.ruleCode)) {
      formData.rules.push({ ...rule, priority: formData.rules.length + 1 })
    }
  })
  showRuleDialog.value = false
  ElMessage.success(`已添加 ${selectedRules.value.length} 条规则`)
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.page = 1
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
}

const handleRowClick = (row: any) => {
  // 点击行查看详情
}

const handleImport = () => {
  ElMessage.info('打开批量导入功能')
}

const handleExport = () => {
  ElMessage.success('导出报价单')
}
</script>

<style scoped>
.quotation-customer-container {
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
.stat-icon.pending { background: #fdf6ec; color: #e6a23c; }
.stat-icon.expiring { background: #fef0f0; color: #f56c6c; }

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

.rules-section {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
}

.rules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
}

.rules-table {
  margin-top: 8px;
}
</style>