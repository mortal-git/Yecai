<template>
  <div class="user-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <span class="page-title">用户管理</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增用户
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
              <div class="stat-label">用户总数</div>
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
            <div class="stat-icon locked"><el-icon><Lock /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.locked }}</div>
              <div class="stat-label">已锁定</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon online"><el-icon><Monitor /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.online }}</div>
              <div class="stat-label">在线用户</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-panel">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入姓名"
            clearable
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input
            v-model="searchForm.phone"
            placeholder="请输入手机号"
            clearable
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.roleId" placeholder="请选择" clearable style="width: 140px">
            <el-option label="系统管理员" value="1" />
            <el-option label="财务主管" value="2" />
            <el-option label="会计" value="3" />
            <el-option label="出纳" value="4" />
            <el-option label="业务员" value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 100px">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="disabled" />
            <el-option label="锁定" value="locked" />
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
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="roleName" label="角色" width="120">
          <template #default="{ row }">
            <el-tag type="warning" size="small">{{ row.roleName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deptName" label="部门" width="120" />
        <el-table-column prop="lastLoginTime" label="最后登录" width="160" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click="handleResetPwd(row)">重置密码</el-button>
            <el-button
              :type="row.status === 'active' ? 'danger' : 'success'"
              link
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              @click="handleDelete(row)"
              :disabled="row.isAdmin"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="600px"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="formData.username" placeholder="请输入用户名" :disabled="isEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="formData.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16" v-if="!isEdit">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="formData.confirmPassword" type="password" placeholder="请确认密码" show-password />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="角色" prop="roleId">
              <el-select v-model="formData.roleId" placeholder="请选择" style="width: 100%">
                <el-option label="系统管理员" value="1" />
                <el-option label="财务主管" value="2" />
                <el-option label="会计" value="3" />
                <el-option label="出纳" value="4" />
                <el-option label="业务员" value="5" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门">
              <el-select v-model="formData.deptId" placeholder="请选择" style="width: 100%">
                <el-option label="财务部" value="1" />
                <el-option label="销售部" value="2" />
                <el-option label="采购部" value="3" />
                <el-option label="仓储部" value="4" />
                <el-option label="行政部" value="5" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="showResetPwdDialog"
      title="重置密码"
      width="400px"
    >
      <el-form ref="resetPwdFormRef" :model="resetPwdForm" :rules="resetPwdRules" label-width="80px">
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="resetPwdForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="resetPwdForm.confirmPassword" type="password" placeholder="请确认密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showResetPwdDialog = false">取消</el-button>
        <el-button type="primary" @click="handleResetPwdSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Upload, Download, User, CircleCheck, Lock, Monitor } from '@element-plus/icons-vue'

const statistics = reactive({
  total: 28,
  active: 25,
  locked: 2,
  online: 5
})

const searchForm = reactive({
  username: '',
  name: '',
  phone: '',
  roleId: '',
  status: ''
})

const tableData = ref([
  { id: 1, username: 'admin', name: '系统管理员', phone: '13800138000', email: 'admin@yecai.com', roleId: '1', roleName: '系统管理员', deptId: '5', deptName: '行政部', lastLoginTime: '2024-04-24 10:30:00', status: 'active', isAdmin: true },
  { id: 2, username: 'caiwu', name: '财务主管', phone: '13800138001', email: 'caiwu@yecai.com', roleId: '2', roleName: '财务主管', deptId: '1', deptName: '财务部', lastLoginTime: '2024-04-24 09:15:00', status: 'active', isAdmin: false },
  { id: 3, username: 'zhangsan', name: '张三', phone: '13800138002', email: 'zhangsan@yecai.com', roleId: '3', roleName: '会计', deptId: '1', deptName: '财务部', lastLoginTime: '2024-04-23 18:20:00', status: 'active', isAdmin: false },
  { id: 4, username: 'lisi', name: '李四', phone: '13800138003', email: 'lisi@yecai.com', roleId: '4', roleName: '出纳', deptId: '1', deptName: '财务部', lastLoginTime: '2024-04-24 08:00:00', status: 'active', isAdmin: false },
  { id: 5, username: 'wangwu', name: '王五', phone: '13800138004', email: 'wangwu@yecai.com', roleId: '5', roleName: '业务员', deptId: '2', deptName: '销售部', lastLoginTime: '2024-04-22 17:30:00', status: 'locked', isAdmin: false },
  { id: 6, username: 'zhaoliu', name: '赵六', phone: '13800138005', email: 'zhaoliu@yecai.com', roleId: '5', roleName: '业务员', deptId: '3', deptName: '采购部', lastLoginTime: '2024-04-21 16:00:00', status: 'disabled', isAdmin: false }
])

const showDialog = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const currentRow = ref<any>(null)

const formData = reactive({
  id: '',
  username: '',
  name: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: '',
  roleId: '',
  deptId: '',
  remark: ''
})

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value !== formData.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const formRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }],
  confirmPassword: [{ required: true, message: '请确认密码', trigger: 'blur' }, { validator: validateConfirmPassword, trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

// 重置密码
const showResetPwdDialog = ref(false)
const resetPwdFormRef = ref<FormInstance>()
const resetPwdForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

const validateResetConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value !== resetPwdForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const resetPwdRules: FormRules = {
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }, { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }],
  confirmPassword: [{ required: true, message: '请确认密码', trigger: 'blur' }, { validator: validateResetConfirmPassword, trigger: 'blur' }]
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    active: 'success',
    disabled: 'info',
    locked: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '启用',
    disabled: '停用',
    locked: '锁定'
  }
  return texts[status] || status
}

const handleSearch = () => {
  ElMessage.success('搜索用户')
}

const handleReset = () => {
  searchForm.username = ''
  searchForm.name = ''
  searchForm.phone = ''
  searchForm.roleId = ''
  searchForm.status = ''
  ElMessage.info('已重置搜索条件')
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: '',
    username: '',
    name: '',
    password: '',
    confirmPassword: '',
    phone: '',
    email: '',
    roleId: '',
    deptId: '',
    remark: ''
  })
  showDialog.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  currentRow.value = row
  Object.assign(formData, { ...row, password: '', confirmPassword: '' })
  showDialog.value = true
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

const handleResetPwd = (row: any) => {
  currentRow.value = row
  resetPwdForm.newPassword = ''
  resetPwdForm.confirmPassword = ''
  showResetPwdDialog.value = true
}

const handleResetPwdSubmit = async () => {
  if (!resetPwdFormRef.value) return
  await resetPwdFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('密码重置成功')
      showResetPwdDialog.value = false
    }
  })
}

const handleToggleStatus = (row: any) => {
  const action = row.status === 'active' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}用户 "${row.name}" 吗？`, `${action}用户`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除用户 "${row.name}" 吗？`, '删除用户', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleImport = () => {
  ElMessage.info('打开导入功能')
}

const handleExport = () => {
  ElMessage.success('导出用户')
}
</script>

<style scoped>
.user-container {
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

.stat-icon.locked {
  background: #fef0f0;
  color: #f56c6c;
}

.stat-icon.online {
  background: #e8f4ff;
  color: #409eff;
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
</style>
