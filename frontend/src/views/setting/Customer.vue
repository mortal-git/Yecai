<template>
  <div class="customer-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <span class="page-title">客户档案</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增客户
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
            <div class="stat-icon total"><el-icon><OfficeBuilding /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">客户总数</div>
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
              <div class="stat-value">¥{{ statistics.totalReceivable.toLocaleString() }}</div>
              <div class="stat-label">应收账款</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon overdue"><el-icon><Warning /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">¥{{ statistics.overdueAmount.toLocaleString() }}</div>
              <div class="stat-label">逾期金额</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-panel">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="客户名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入客户名称"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="客户编码">
          <el-input
            v-model="searchForm.code"
            placeholder="请输入客户编码"
            clearable
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item label="客户等级">
          <el-select v-model="searchForm.level" placeholder="请选择" clearable style="width: 120px">
            <el-option label="A级（核心）" value="A" />
            <el-option label="B级（优质）" value="B" />
            <el-option label="C级（普通）" value="C" />
            <el-option label="D级（淘汰）" value="D" />
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
        <el-table-column prop="code" label="客户编码" width="120" />
        <el-table-column prop="name" label="客户名称" min-width="200" />
        <el-table-column prop="shortName" label="简称" width="120" />
        <el-table-column prop="level" label="客户等级" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)" size="small">
              {{ row.level }}级
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="contact" label="联系人" width="100" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="salesManager" label="客户经理" width="100" />
        <el-table-column prop="creditPeriod" label="信用期" width="80">
          <template #default="{ row }">
            {{ row.creditPeriod ? row.creditPeriod + '天' : '-' }}
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
      :title="currentCustomer?.name || '客户详情'"
      size="800px"
    >
      <template #default>
        <div class="detail-content" v-if="currentCustomer">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本信息" name="basic">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="客户编码">{{ currentCustomer.code }}</el-descriptions-item>
                <el-descriptions-item label="客户名称">{{ currentCustomer.name }}</el-descriptions-item>
                <el-descriptions-item label="简称">{{ currentCustomer.shortName || '-' }}</el-descriptions-item>
                <el-descriptions-item label="客户等级">
                  <el-tag :type="getLevelType(currentCustomer.level)" size="small">
                    {{ currentCustomer.level }}级
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="统一社会信用代码">{{ currentCustomer.unifiedCode || '-' }}</el-descriptions-item>
                <el-descriptions-item label="注册资本">{{ currentCustomer.registeredCapital || '-' }}</el-descriptions-item>
                <el-descriptions-item label="所属行业">{{ currentCustomer.industry || '-' }}</el-descriptions-item>
                <el-descriptions-item label="所在地区">{{ currentCustomer.region || '-' }}</el-descriptions-item>
                <el-descriptions-item label="详细地址" :span="2">{{ currentCustomer.address || '-' }}</el-descriptions-item>
                <el-descriptions-item label="合作状态">
                  <el-tag :type="getStatusType(currentCustomer.status)" size="small">
                    {{ getStatusText(currentCustomer.status) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="信用期">{{ currentCustomer.creditPeriod ? currentCustomer.creditPeriod + '天' : '-' }}</el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>
            <el-tab-pane label="联系人" name="contact">
              <el-table :data="currentCustomer.contacts" border size="small">
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
              <el-empty v-if="!currentCustomer.contacts?.length" description="暂无联系人" />
            </el-tab-pane>
            <el-tab-pane label="银行账户" name="bank">
              <el-table :data="currentCustomer.bankAccounts" border size="small">
                <el-table-column prop="bankName" label="开户行" width="160" />
                <el-table-column prop="accountName" label="账户名" width="160" />
                <el-table-column prop="accountNo" label="账号" min-width="200" />
                <el-table-column prop="isPrimary" label="默认账户" width="80">
                  <template #default="{ row }">
                    <el-tag v-if="row.isPrimary" type="success" size="small">是</el-tag>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="!currentCustomer.bankAccounts?.length" description="暂无银行账户" />
            </el-tab-pane>
            <el-tab-pane label="财务信息" name="finance">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="应收账款">
                  <span class="amount">¥{{ currentCustomer.receivableAmount?.toLocaleString() || '0' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="已收金额">
                  <span class="amount success">¥{{ currentCustomer.receivedAmount?.toLocaleString() || '0' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="合同数量">{{ currentCustomer.contractCount || 0 }}</el-descriptions-item>
                <el-descriptions-item label="订单数量">{{ currentCustomer.orderCount || 0 }}</el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="showDetailDrawer = false">关闭</el-button>
          <el-button type="primary" @click="handleEdit(currentCustomer)">编辑</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="isEdit ? '编辑客户' : '新增客户'"
      width="800px"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="客户名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户简称">
              <el-input v-model="formData.shortName" placeholder="请输入客户简称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="客户等级" prop="level">
              <el-select v-model="formData.level" placeholder="请选择" style="width: 100%">
                <el-option label="A级（核心客户）" value="A" />
                <el-option label="B级（优质客户）" value="B" />
                <el-option label="C级（普通客户）" value="C" />
                <el-option label="D级（淘汰客户）" value="D" />
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
            <el-form-item label="信用期">
              <el-input-number v-model="formData.creditPeriod" :min="0" :max="365" style="width: 100%">
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
import { Plus, Upload, Download, OfficeBuilding, CircleCheck, TrendCharts, Warning } from '@element-plus/icons-vue'

// 统计数据
const statistics = reactive({
  total: 128,
  active: 98,
  totalReceivable: 8563200,
  overdueAmount: 892400
})

// 搜索表单
const searchForm = reactive({
  name: '',
  code: '',
  level: '',
  status: '',
  region: ''
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    code: 'KH001',
    name: '深圳市腾讯科技有限公司',
    shortName: '腾讯',
    level: 'A',
    contact: '张经理',
    phone: '0755-86013388',
    salesManager: '李销售',
    creditPeriod: 60,
    status: 'active',
    region: '深圳',
    address: '深圳市南山区科技中一路腾讯大厦',
    unifiedCode: '914403007708924356',
    registeredCapital: '200000',
    industry: '互联网',
    receivableAmount: 500000,
    receivedAmount: 300000,
    contractCount: 5,
    orderCount: 28,
    contacts: [
      { name: '张经理', position: '采购总监', phone: '13800138001', email: 'zhang@tencent.com', isPrimary: true },
      { name: '李经理', position: '财务总监', phone: '13800138002', email: 'li@tencent.com', isPrimary: false }
    ],
    bankAccounts: [
      { bankName: '中国银行深圳分行', accountName: '深圳市腾讯科技有限公司', accountNo: '1234567890123456', isPrimary: true }
    ]
  },
  {
    id: 2,
    code: 'KH002',
    name: '阿里巴巴（中国）有限公司',
    shortName: '阿里巴巴',
    level: 'A',
    contact: '王经理',
    phone: '0571-85022088',
    salesManager: '赵销售',
    creditPeriod: 90,
    status: 'active',
    region: '杭州',
    address: '杭州市余杭区文一西路969号',
    unifiedCode: '91330100799655058B',
    registeredCapital: '500000',
    industry: '互联网',
    receivableAmount: 800000,
    receivedAmount: 800000,
    contractCount: 8,
    orderCount: 45,
    contacts: [
      { name: '王经理', position: '采购总监', phone: '13900139001', email: 'wang@alibaba.com', isPrimary: true }
    ],
    bankAccounts: []
  },
  {
    id: 3,
    code: 'KH003',
    name: '字节跳动科技有限公司',
    shortName: '字节跳动',
    level: 'B',
    contact: '刘经理',
    phone: '010-58231000',
    salesManager: '钱销售',
    creditPeriod: 45,
    status: 'active',
    region: '北京',
    address: '北京市海淀区科技中心',
    unifiedCode: '91110108MA001YDK4W',
    registeredCapital: '100000',
    industry: '互联网',
    receivableAmount: 350000,
    receivedAmount: 0,
    contractCount: 3,
    orderCount: 15,
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
const currentCustomer = ref<any>(null)
const activeTab = ref('basic')

// 对话框
const showDialog = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  name: '',
  shortName: '',
  level: 'C',
  industry: '',
  unifiedCode: '',
  registeredCapital: '',
  region: '',
  creditPeriod: 30,
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
  name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  level: [{ required: true, message: '请选择客户等级', trigger: 'change' }]
}

// 方法
const getLevelType = (level: string) => {
  const types: Record<string, string> = {
    A: 'success',
    B: 'warning',
    C: 'info',
    D: 'danger'
  }
  return types[level] || 'info'
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
  ElMessage.success('搜索客户')
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
    level: 'C',
    industry: '',
    unifiedCode: '',
    registeredCapital: '',
    region: '',
    creditPeriod: 30,
    address: '',
    status: 'active',
    contacts: []
  })
  showDialog.value = true
}

const handleView = (row: any) => {
  currentCustomer.value = row
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
  currentCustomer.value = row
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
  ElMessage.success('导出客户档案')
}
</script>

<style scoped>
.customer-container {
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

.stat-icon.overdue {
  background: #fef0f0;
  color: #f56c6c;
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
