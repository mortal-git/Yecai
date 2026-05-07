<template>
  <div class="supplier-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <span class="page-title">供应商档案</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增供应商
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
            <div class="stat-icon total"><el-icon><Shop /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">供应商总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon active"><el-icon><CircleCheck /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.active }}</div>
              <div class="stat-label">合作中</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon credit"><el-icon><TrendCharts /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">¥{{ statistics.totalPayable.toLocaleString() }}</div>
              <div class="stat-label">应付账款</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon quality"><el-icon><Star /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.averageScore }}</div>
              <div class="stat-label">平均评分</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-panel">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="供应商名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入供应商名称"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="供应商编码">
          <el-input
            v-model="searchForm.code"
            placeholder="请输入供应商编码"
            clearable
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item label="供应商类型">
          <el-select v-model="searchForm.category" placeholder="请选择" clearable style="width: 140px">
            <el-option label="生产型" value="production" />
            <el-option label="贸易型" value="trade" />
            <el-option label="服务型" value="service" />
          </el-select>
        </el-form-item>
        <el-form-item label="合作状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="合作中" value="active" />
            <el-option label="已暂停" value="paused" />
            <el-option label="已终止" value="terminated" />
          </el-select>
        </el-form-item>
        <el-form-item label="地区">
          <el-input
            v-model="searchForm.region"
            placeholder="请输入地区"
            clearable
            style="width: 120px"
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
        <el-table-column prop="code" label="供应商编码" width="120" />
        <el-table-column prop="name" label="供应商名称" min-width="200" />
        <el-table-column prop="shortName" label="简称" width="120" />
        <el-table-column prop="category" label="类型" width="100">
          <template #default="{ row }">
            {{ getCategoryText(row.category) }}
          </template>
        </el-table-column>
        <el-table-column prop="contact" label="联系人" width="100" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="paymentPeriod" label="账期" width="80">
          <template #default="{ row }">
            {{ row.paymentPeriod ? row.paymentPeriod + '天' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="score" label="评分" width="100">
          <template #default="{ row }">
            <el-rate v-model="row.score" disabled text-color="#ff9900" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click.stop="handleView(row)">查看</el-button>
            <el-button type="primary" link size="small" @click.stop="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click.stop="handleContact(row)">联系人</el-button>
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
    <el-drawer
      v-model="showDetailDrawer"
      :title="currentSupplier?.name || '供应商详情'"
      size="800px"
    >
      <template #default>
        <div class="detail-content" v-if="currentSupplier">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本信息" name="basic">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="供应商编码">{{ currentSupplier.code }}</el-descriptions-item>
                <el-descriptions-item label="供应商名称">{{ currentSupplier.name }}</el-descriptions-item>
                <el-descriptions-item label="简称">{{ currentSupplier.shortName || '-' }}</el-descriptions-item>
                <el-descriptions-item label="供应商类型">
                  {{ getCategoryText(currentSupplier.category) }}
                </el-descriptions-item>
                <el-descriptions-item label="统一社会信用代码">{{ currentSupplier.unifiedCode || '-' }}</el-descriptions-item>
                <el-descriptions-item label="注册资本">{{ currentSupplier.registeredCapital || '-' }}</el-descriptions-item>
                <el-descriptions-item label="所属行业">{{ currentSupplier.industry || '-' }}</el-descriptions-item>
                <el-descriptions-item label="所在地区">{{ currentSupplier.region || '-' }}</el-descriptions-item>
                <el-descriptions-item label="详细地址" :span="2">{{ currentSupplier.address || '-' }}</el-descriptions-item>
                <el-descriptions-item label="合作状态">
                  <el-tag :type="getStatusType(currentSupplier.status)" size="small">
                    {{ getStatusText(currentSupplier.status) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="账期">{{ currentSupplier.paymentPeriod ? currentSupplier.paymentPeriod + '天' : '-' }}</el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>
            <el-tab-pane label="联系人" name="contact">
              <el-table :data="currentSupplier.contacts" border size="small">
                <el-table-column prop="name" label="姓名" width="100" />
                <el-table-column prop="position" label="职位" width="120" />
                <el-table-column prop="phone" label="电话" width="130" />
                <el-table-column prop="email" label="邮箱" min-width="160" />
                <el-table-column prop="isPrimary" label="主联系人" width="80">
                  <template #default="{ row }">
                    <el-tag v-if="row.isPrimary" type="success" size="small">是</el-tag>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="!currentSupplier.contacts?.length" description="暂无联系人" />
            </el-tab-pane>
            <el-tab-pane label="银行账户" name="bank">
              <el-table :data="currentSupplier.bankAccounts" border size="small">
                <el-table-column prop="bankName" label="开户行" width="160" />
                <el-table-column prop="accountName" label="账户名" width="160" />
                <el-table-column prop="accountNo" label="账号" min-width="200" />
                <el-table-column prop="isPrimary" label="默认账户" width="80">
                  <template #default="{ row }">
                    <el-tag v-if="row.isPrimary" type="success" size="small">是</el-tag>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="!currentSupplier.bankAccounts?.length" description="暂无银行账户" />
            </el-tab-pane>
            <el-tab-pane label="财务信息" name="finance">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="应付账款">
                  <span class="amount">¥{{ currentSupplier.payableAmount?.toLocaleString() || '0' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="已付金额">
                  <span class="amount success">¥{{ currentSupplier.paidAmount?.toLocaleString() || '0' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="合同数量">{{ currentSupplier.contractCount || 0 }}</el-descriptions-item>
                <el-descriptions-item label="订单数量">{{ currentSupplier.orderCount || 0 }}</el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="showDetailDrawer = false">关闭</el-button>
          <el-button type="primary" @click="handleEdit(currentSupplier)">编辑</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="isEdit ? '编辑供应商' : '新增供应商'"
      width="800px"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="供应商名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入供应商名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商简称">
              <el-input v-model="formData.shortName" placeholder="请输入供应商简称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="供应商类型" prop="category">
              <el-select v-model="formData.category" placeholder="请选择" style="width: 100%">
                <el-option label="生产型" value="production" />
                <el-option label="贸易型" value="trade" />
                <el-option label="服务型" value="service" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属行业">
              <el-input v-model="formData.industry" placeholder="请输入所属行业" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="统一社会信用代码">
              <el-input v-model="formData.unifiedCode" placeholder="请输入统一社会信用代码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注册资本">
              <el-input v-model="formData.registeredCapital" placeholder="请输入注册资本">
                <template #append>万元</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="所在地区">
              <el-input v-model="formData.region" placeholder="请输入所在地区" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="账期">
              <el-input-number v-model="formData.paymentPeriod" :min="0" :max="365" style="width: 100%">
                <template #append>天</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="详细地址">
          <el-input v-model="formData.address" placeholder="请输入详细地址" />
        </el-form-item>

        <el-divider content-position="left">联系人信息</el-divider>
        <div v-for="(contact, index) in formData.contacts" :key="index" class="contact-item">
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="姓名">
                <el-input v-model="contact.name" placeholder="姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="职位">
                <el-input v-model="contact.position" placeholder="职位" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="电话">
                <el-input v-model="contact.phone" placeholder="电话" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="16">
              <el-form-item label="邮箱">
                <el-input v-model="contact.email" placeholder="邮箱" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="主联系">
                <el-switch v-model="contact.isPrimary" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-button type="dashed" @click="handleAddContact" style="width: 100%;">
          <el-icon><Plus /></el-icon>
          添加联系人
        </el-button>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Upload, Download, Shop, CircleCheck, TrendCharts, Star } from '@element-plus/icons-vue'

// 统计数据
const statistics = reactive({
  total: 86,
  active: 72,
  totalPayable: 6234800,
  averageScore: 4.2
})

// 搜索表单
const searchForm = reactive({
  name: '',
  code: '',
  category: '',
  status: '',
  region: ''
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    code: 'GYS001',
    name: '深圳硬件供应商A公司',
    shortName: 'A公司',
    category: 'production',
    contact: '陈经理',
    phone: '0755-26001234',
    paymentPeriod: 30,
    score: 5,
    status: 'active',
    region: '深圳',
    address: '深圳市宝安区石岩街道',
    unifiedCode: '914403007708924111',
    registeredCapital: '5000',
    industry: '电子制造',
    payableAmount: 100000,
    paidAmount: 0,
    contractCount: 3,
    orderCount: 18,
    contacts: [
      { name: '陈经理', position: '销售总监', phone: '13800138011', email: 'chen@gysA.com', isPrimary: true }
    ],
    bankAccounts: [
      { bankName: '中国工商银行深圳分行', accountName: '深圳硬件供应商A公司', accountNo: '4000123456789012', isPrimary: true }
    ]
  },
  {
    id: 2,
    code: 'GYS002',
    name: '北京云服务B公司',
    shortName: 'B公司',
    category: 'service',
    contact: '周经理',
    phone: '010-82345678',
    paymentPeriod: 45,
    score: 4,
    status: 'active',
    region: '北京',
    address: '北京市朝阳区望京科技园',
    unifiedCode: '91110105777702456X',
    registeredCapital: '10000',
    industry: '云计算服务',
    payableAmount: 500000,
    paidAmount: 500000,
    contractCount: 5,
    orderCount: 32,
    contacts: [],
    bankAccounts: []
  },
  {
    id: 3,
    code: 'GYS003',
    name: '上海网络设备C公司',
    shortName: 'C公司',
    category: 'trade',
    contact: '林经理',
    phone: '021-54321098',
    paymentPeriod: 60,
    score: 4,
    status: 'active',
    region: '上海',
    address: '上海市浦东新区张江高科技园区',
    unifiedCode: '91310115752454567Y',
    registeredCapital: '8000',
    industry: '网络设备',
    payableAmount: 180000,
    paidAmount: 0,
    contractCount: 2,
    orderCount: 10,
    contacts: [],
    bankAccounts: []
  }
])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 3
})

// 详情抽屉
const showDetailDrawer = ref(false)
const currentSupplier = ref<any>(null)
const activeTab = ref('basic')

// 对话框
const showDialog = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  name: '',
  shortName: '',
  category: 'trade',
  industry: '',
  unifiedCode: '',
  registeredCapital: '',
  region: '',
  paymentPeriod: 30,
  address: '',
  status: 'active',
  contacts: [] as Array<{
    name: string
    position: string
    phone: string
    email: string
    isPrimary: boolean
  }>
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择供应商类型', trigger: 'change' }]
}

// 方法
const getCategoryText = (category: string) => {
  const texts: Record<string, string> = {
    production: '生产型',
    trade: '贸易型',
    service: '服务型'
  }
  return texts[category] || category
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    active: 'success',
    paused: 'warning',
    terminated: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '合作中',
    paused: '已暂停',
    terminated: '已终止'
  }
  return texts[status] || status
}

const handleSearch = () => {
  ElMessage.success('搜索供应商')
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    ;(searchForm as any)[key] = ''
  })
  ElMessage.info('已重置搜索条件')
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    name: '',
    shortName: '',
    category: 'trade',
    industry: '',
    unifiedCode: '',
    registeredCapital: '',
    region: '',
    paymentPeriod: 30,
    address: '',
    status: 'active',
    contacts: []
  })
  showDialog.value = true
}

const handleView = (row: any) => {
  currentSupplier.value = row
  showDetailDrawer.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(formData, {
    ...row,
    contacts: row.contacts?.length ? [...row.contacts] : []
  })
  showDetailDrawer.value = false
  showDialog.value = true
}

const handleContact = (row: any) => {
  currentSupplier.value = row
  activeTab.value = 'contact'
  showDetailDrawer.value = true
}

const handleAddContact = () => {
  formData.contacts.push({
    name: '',
    position: '',
    phone: '',
    email: '',
    isPrimary: false
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      showDialog.value = false
    }
  })
}

const handleRowClick = (row: any) => {
  // 可选：点击选中
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
  ElMessage.success('导出供应商档案')
}
</script>

<style scoped>
.supplier-container {
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

.stat-icon.total {
  background: #ecf5ff;
  color: #409eff;
}

.stat-icon.active {
  background: #f0f9eb;
  color: #67c23a;
}

.stat-icon.credit {
  background: #fdf6ec;
  color: #e6a23c;
}

.stat-icon.quality {
  background: #fff9f0;
  color: #ff9900;
}

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

.contact-item {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.amount {
  font-weight: 600;
  color: #303133;
}

.amount.success {
  color: #67c23a;
}
</style>
