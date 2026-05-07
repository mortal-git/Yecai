<template>
  <div class="employee-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <span class="page-title">员工档案</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增员工
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
            <div class="stat-icon total"><el-icon><User /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">员工总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon active"><el-icon><CircleCheck /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.active }}</div>
              <div class="stat-label">在职</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon department"><el-icon><Office /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.departmentCount }}</div>
              <div class="stat-label">部门数量</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon role"><el-icon><Key /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.roleCount }}</div>
              <div class="stat-label">系统用户</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-panel">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="员工姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入员工姓名"
            clearable
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item label="工号">
          <el-input
            v-model="searchForm.code"
            placeholder="请输入工号"
            clearable
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="searchForm.departmentId" placeholder="请选择" clearable style="width: 160px">
            <el-option
              v-for="dept in departmentList"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="岗位">
          <el-input
            v-model="searchForm.position"
            placeholder="请输入岗位"
            clearable
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item label="在职状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="在职" value="active" />
            <el-option label="离职" value="inactive" />
            <el-option label="退休" value="retired" />
          </el-select>
        </el-form-item>
        <el-form-item label="系统用户">
          <el-select v-model="searchForm.isSystemUser" placeholder="请选择" clearable style="width: 100px">
            <el-option label="是" value="true" />
            <el-option label="否" value="false" />
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
        <el-table-column prop="code" label="工号" width="100" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="avatar" label="头像" width="70">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar">
              {{ row.name?.charAt(0) }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="departmentName" label="部门" width="120" />
        <el-table-column prop="position" label="岗位" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="entryDate" label="入职日期" width="110" />
        <el-table-column prop="isSystemUser" label="系统用户" width="90">
          <template #default="{ row }">
            <el-tag :type="row.isSystemUser ? 'success' : 'info'" size="small">
              {{ row.isSystemUser ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              v-if="!row.isSystemUser"
              type="primary"
              link
              size="small"
              @click="handleCreateUser(row)"
            >
              创建用户
            </el-button>
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
      :title="currentEmployee?.name || '员工详情'"
      size="700px"
    >
      <template #default>
        <div class="detail-content" v-if="currentEmployee">
          <div class="employee-header">
            <el-avatar :size="80" :src="currentEmployee.avatar">
              {{ currentEmployee.name?.charAt(0) }}
            </el-avatar>
            <div class="employee-info">
              <h3>{{ currentEmployee.name }}</h3>
              <p>{{ currentEmployee.departmentName }} - {{ currentEmployee.position }}</p>
              <el-tag :type="getStatusType(currentEmployee.status)" size="small">
                {{ getStatusText(currentEmployee.status) }}
              </el-tag>
            </div>
          </div>

          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本信息" name="basic">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="工号">{{ currentEmployee.code }}</el-descriptions-item>
                <el-descriptions-item label="姓名">{{ currentEmployee.name }}</el-descriptions-item>
                <el-descriptions-item label="性别">{{ currentEmployee.gender === 'male' ? '男' : '女' }}</el-descriptions-item>
                <el-descriptions-item label="手机号">{{ currentEmployee.phone }}</el-descriptions-item>
                <el-descriptions-item label="邮箱">{{ currentEmployee.email }}</el-descriptions-item>
                <el-descriptions-item label="身份证号">{{ currentEmployee.idCard || '-' }}</el-descriptions-item>
                <el-descriptions-item label="部门">{{ currentEmployee.departmentName }}</el-descriptions-item>
                <el-descriptions-item label="岗位">{{ currentEmployee.position }}</el-descriptions-item>
                <el-descriptions-item label="入职日期">{{ currentEmployee.entryDate }}</el-descriptions-item>
                <el-descriptions-item label="转正日期">{{ currentEmployee.positiveDate || '-' }}</el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>
            <el-tab-pane label="财务信息" name="finance">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="银行名称">{{ currentEmployee.bankName || '-' }}</el-descriptions-item>
                <el-descriptions-item label="银行账号">{{ currentEmployee.bankAccount || '-' }}</el-descriptions-item>
                <el-descriptions-item label="系统用户">
                  <el-tag :type="currentEmployee.isSystemUser ? 'success' : 'info'" size="small">
                    {{ currentEmployee.isSystemUser ? '是' : '否' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="用户角色" v-if="currentEmployee.isSystemUser">
                  {{ currentEmployee.roleName || '-' }}
                </el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="showDetailDrawer = false">关闭</el-button>
          <el-button type="primary" @click="handleEdit(currentEmployee)">编辑</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="isEdit ? '编辑员工' : '新增员工'"
      width="700px"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="工号" prop="code">
              <el-input v-model="formData.code" placeholder="请输入工号" :disabled="isEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="formData.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="formData.gender">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="邮箱">
              <el-input v-model="formData.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号">
              <el-input v-model="formData.idCard" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="部门" prop="departmentId">
              <el-select v-model="formData.departmentId" placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="dept in departmentList"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位" prop="position">
              <el-input v-model="formData.position" placeholder="请输入岗位" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="入职日期">
              <el-date-picker
                v-model="formData.entryDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="转正日期">
              <el-date-picker
                v-model="formData.positiveDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">财务信息</el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="银行名称">
              <el-input v-model="formData.bankName" placeholder="请输入银行名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="银行账号">
              <el-input v-model="formData.bankAccount" placeholder="请输入银行账号" />
            </el-form-item>
          </el-col>
        </el-row>
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
import { Plus, Upload, Download, User, CircleCheck, Office, Key } from '@element-plus/icons-vue'

// 统计数据
const statistics = reactive({
  total: 156,
  active: 142,
  departmentCount: 12,
  roleCount: 38
})

// 部门列表
const departmentList = ref([
  { id: 1, name: '销售部' },
  { id: 2, name: '市场部' },
  { id: 3, name: '研发部' },
  { id: 4, name: '财务部' },
  { id: 5, name: '人力资源部' },
  { id: 6, name: '行政部' }
])

// 搜索表单
const searchForm = reactive({
  name: '',
  code: '',
  departmentId: '',
  position: '',
  status: '',
  isSystemUser: ''
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    code: 'EMP001',
    name: '张三',
    gender: 'male',
    phone: '13800138001',
    email: 'zhangsan@company.com',
    idCard: '440305199001011234',
    departmentId: 1,
    departmentName: '销售部',
    position: '销售经理',
    entryDate: '2020-03-15',
    positiveDate: '2020-06-15',
    status: 'active',
    isSystemUser: true,
    roleName: '销售负责人',
    bankName: '中国银行',
    bankAccount: '6217000010012345678',
    avatar: ''
  },
  {
    id: 2,
    code: 'EMP002',
    name: '李四',
    gender: 'female',
    phone: '13800138002',
    email: 'lisi@company.com',
    idCard: '440306199002022345',
    departmentId: 4,
    departmentName: '财务部',
    position: '财务主管',
    entryDate: '2019-06-01',
    positiveDate: '2019-09-01',
    status: 'active',
    isSystemUser: true,
    roleName: '财务负责人',
    bankName: '工商银行',
    bankAccount: '6222020012345678901',
    avatar: ''
  },
  {
    id: 3,
    code: 'EMP003',
    name: '王五',
    gender: 'male',
    phone: '13800138003',
    email: 'wangwu@company.com',
    idCard: '440307199003033456',
    departmentId: 3,
    departmentName: '研发部',
    position: '技术总监',
    entryDate: '2018-01-10',
    positiveDate: '2018-04-10',
    status: 'active',
    isSystemUser: true,
    roleName: '系统管理员',
    bankName: '建设银行',
    bankAccount: '6217000023456789012',
    avatar: ''
  },
  {
    id: 4,
    code: 'EMP004',
    name: '赵六',
    gender: 'female',
    phone: '13800138004',
    email: 'zhaoliu@company.com',
    idCard: '440308199004044567',
    departmentId: 2,
    departmentName: '市场部',
    position: '市场专员',
    entryDate: '2022-08-01',
    positiveDate: '2022-11-01',
    status: 'active',
    isSystemUser: false,
    bankName: '',
    bankAccount: '',
    avatar: ''
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
const currentEmployee = ref<any>(null)
const activeTab = ref('basic')

// 对话框
const showDialog = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  code: '',
  name: '',
  gender: 'male',
  phone: '',
  email: '',
  idCard: '',
  departmentId: '',
  departmentName: '',
  position: '',
  entryDate: '',
  positiveDate: '',
  status: 'active',
  isSystemUser: false,
  bankName: '',
  bankAccount: ''
})

const formRules: FormRules = {
  code: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  departmentId: [{ required: true, message: '请选择部门', trigger: 'change' }],
  position: [{ required: true, message: '请输入岗位', trigger: 'blur' }]
}

// 方法
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    retired: 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '在职',
    inactive: '离职',
    retired: '退休'
  }
  return texts[status] || status
}

const handleSearch = () => {
  ElMessage.success('搜索员工')
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
    code: '',
    name: '',
    gender: 'male',
    phone: '',
    email: '',
    idCard: '',
    departmentId: '',
    departmentName: '',
    position: '',
    entryDate: '',
    positiveDate: '',
    status: 'active',
    isSystemUser: false,
    bankName: '',
    bankAccount: ''
  })
  showDialog.value = true
}

const handleView = (row: any) => {
  currentEmployee.value = row
  showDetailDrawer.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(formData, {
    ...row
  })
  showDetailDrawer.value = false
  showDialog.value = true
}

const handleCreateUser = (row: any) => {
  ElMessageBox.confirm(`为员工 "${row.name}" 创建系统用户吗？`, '创建用户', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('创建用户成功')
  }).catch(() => {})
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
  ElMessage.success('导出员工档案')
}
</script>

<style scoped>
.employee-container {
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

.stat-icon.department {
  background: #fdf6ec;
  color: #e6a23c;
}

.stat-icon.role {
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

.employee-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.employee-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

.employee-info p {
  margin: 0 0 8px 0;
  color: #606266;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
