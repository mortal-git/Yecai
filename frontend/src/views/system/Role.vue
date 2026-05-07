<template>
  <div class="role-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <span class="page-title">角色管理</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增角色
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon total"><el-icon><Key /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">角色总数</div>
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
            <div class="stat-icon user"><el-icon><User /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.userCount }}</div>
              <div class="stat-label">使用用户</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon system"><el-icon><Setting /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.systemRole }}</div>
              <div class="stat-label">系统角色</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-panel">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="角色名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入角色名称"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="角色编码">
          <el-input
            v-model="searchForm.code"
            placeholder="请输入角色编码"
            clearable
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 100px">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="disabled" />
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
        <el-table-column prop="code" label="角色编码" width="120" />
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="userCount" label="用户数" width="80" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.userCount }}人</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click="handleAssignPerm(row)">分配权限</el-button>
            <el-button
              :type="row.status === 'active' ? 'danger' : 'success'"
              link
              size="small"
              @click="handleToggleStatus(row)"
              :disabled="row.isSystem"
            >
              {{ row.status === 'active' ? '停用' : '启用' }}
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              @click="handleDelete(row)"
              :disabled="row.isSystem"
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
      :title="isEdit ? '编辑角色' : '新增角色'"
      width="500px"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入角色编码" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      v-model="showPermDialog"
      title="分配权限"
      width="600px"
    >
      <div class="perm-tree-container">
        <div class="perm-header">
          <el-input v-model="permSearchKey" placeholder="搜索权限" style="width: 200px;" clearable />
        </div>
        <el-tree
          ref="permTreeRef"
          :data="permTreeData"
          :props="permTreeProps"
          node-key="id"
          show-checkbox
          default-expand-all
          :expand-on-click-node="false"
          :filter-node-method="filterPermNode"
          @check-change="handlePermCheck"
        />
      </div>
      <div class="perm-selected-info">
        已选择 <span class="count">{{ selectedPermCount }}</span> 个权限
      </div>
      <template #footer>
        <el-button @click="showPermDialog = false">取消</el-button>
        <el-button type="primary" @click="handlePermSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Key, CircleCheck, User, Setting } from '@element-plus/icons-vue'
import type { ElTree } from 'element-plus'

const statistics = reactive({
  total: 6,
  active: 5,
  userCount: 28,
  systemRole: 3
})

const searchForm = reactive({
  name: '',
  code: '',
  status: ''
})

const tableData = ref([
  { id: 1, code: 'ROLE_ADMIN', name: '系统管理员', userCount: 1, description: '系统最高权限，管理所有功能', createTime: '2024-01-01 00:00:00', status: 'active', isSystem: true },
  { id: 2, code: 'ROLE_FINANCE_MGR', name: '财务主管', userCount: 2, description: '财务部门管理人员，拥有财务模块全部权限', createTime: '2024-01-10 10:00:00', status: 'active', isSystem: false },
  { id: 3, code: 'ROLE_ACCOUNTANT', name: '会计', userCount: 5, description: '会计人员，负责记账、凭证等业务', createTime: '2024-01-15 09:00:00', status: 'active', isSystem: false },
  { id: 4, code: 'ROLE_CASIER', name: '出纳', userCount: 3, description: '出纳人员，负责收付款操作', createTime: '2024-01-15 09:30:00', status: 'active', isSystem: false },
  { id: 5, code: 'ROLE_SALES', name: '业务员', userCount: 15, description: '销售业务人员，拥有客户和订单相关权限', createTime: '2024-02-01 10:00:00', status: 'active', isSystem: false },
  { id: 6, code: 'ROLE_DISABLED', name: '已停用角色', userCount: 0, description: '已停用的角色示例', createTime: '2024-03-01 10:00:00', status: 'disabled', isSystem: false }
])

const showDialog = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const currentRow = ref<any>(null)

const formData = reactive({
  id: '',
  code: '',
  name: '',
  description: ''
})

const formRules: FormRules = {
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

// 分配权限
const showPermDialog = ref(false)
const permTreeRef = ref<InstanceType<typeof ElTree>>()
const permSearchKey = ref('')
const selectedPermCount = ref(0)

const permTreeProps = {
  children: 'children',
  label: 'name'
}

const permTreeData = ref([
  {
    id: '1',
    name: '系统管理',
    children: [
      { id: '1-1', name: '用户管理', children: [
        { id: '1-1-1', name: '查看用户' },
        { id: '1-1-2', name: '新增用户' },
        { id: '1-1-3', name: '编辑用户' },
        { id: '1-1-4', name: '删除用户' },
        { id: '1-1-5', name: '重置密码' }
      ]},
      { id: '1-2', name: '角色管理', children: [
        { id: '1-2-1', name: '查看角色' },
        { id: '1-2-2', name: '新增角色' },
        { id: '1-2-3', name: '编辑角色' },
        { id: '1-2-4', name: '删除角色' },
        { id: '1-2-5', name: '分配权限' }
      ]},
      { id: '1-3', name: '权限管理' },
      { id: '1-4', name: '操作日志' }
    ]
  },
  {
    id: '2',
    name: '基础设置',
    children: [
      { id: '2-1', name: '科目设置' },
      { id: '2-2', name: '费用类型' },
      { id: '2-3', name: '审批流程' },
      { id: '2-4', name: '客户档案' },
      { id: '2-5', name: '供应商档案' },
      { id: '2-6', name: '员工档案' }
    ]
  },
  {
    id: '3',
    name: '发票管理',
    children: [
      { id: '3-1', name: '发票开具' },
      { id: '3-2', name: '发票查询' },
      { id: '3-3', name: '发票统计' }
    ]
  },
  {
    id: '4',
    name: '应收管理',
    children: [
      { id: '4-1', name: '应收确认' },
      { id: '4-2', name: '收款核销' },
      { id: '4-3', name: '应收报表' }
    ]
  },
  {
    id: '5',
    name: '应付管理',
    children: [
      { id: '5-1', name: '应付确认' },
      { id: '5-2', name: '付款申请' },
      { id: '5-3', name: '应付报表' }
    ]
  },
  {
    id: '6',
    name: '对账单管理',
    children: [
      { id: '6-1', name: '客户对账' },
      { id: '6-2', name: '供应商对账' },
      { id: '6-3', name: '对账汇总' }
    ]
  }
])

watch(permSearchKey, (val) => {
  permTreeRef.value?.filter(val)
})

const filterPermNode = (value: string, data: any) => {
  if (!value) return true
  return data.name.includes(value)
}

const handlePermCheck = () => {
  const checkedKeys = permTreeRef.value?.getCheckedKeys() || []
  const halfCheckedKeys = permTreeRef.value?.getHalfCheckedKeys() || []
  selectedPermCount.value = checkedKeys.length + halfCheckedKeys.length
}

const handleSearch = () => {
  ElMessage.success('搜索角色')
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.code = ''
  searchForm.status = ''
  ElMessage.info('已重置搜索条件')
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: '',
    code: '',
    name: '',
    description: ''
  })
  showDialog.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  currentRow.value = row
  Object.assign(formData, { ...row })
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

const handleAssignPerm = (row: any) => {
  currentRow.value = row
  permSearchKey.value = ''
  selectedPermCount.value = 0
  permTreeRef.value?.setCheckedKeys([])
  showPermDialog.value = true
}

const handlePermSubmit = () => {
  ElMessage.success('权限分配成功')
  showPermDialog.value = false
}

const handleToggleStatus = (row: any) => {
  const action = row.status === 'active' ? '停用' : '启用'
  ElMessageBox.confirm(`确定要${action}角色 "${row.name}" 吗？`, `${action}角色`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除角色 "${row.name}" 吗？`, '删除角色', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.role-container {
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

.stat-icon.user {
  background: #f0f9eb;
  color: #e6a23c;
}

.stat-icon.system {
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

.perm-tree-container {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.perm-header {
  margin-bottom: 12px;
}

.perm-selected-info {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
}

.perm-selected-info .count {
  color: #409eff;
  font-weight: 600;
}
</style>
