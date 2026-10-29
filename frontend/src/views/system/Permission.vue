<template>
  <div class="permission-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <span class="page-title">权限管理</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增权限
        </el-button>
        <el-button @click="handleExpandAll">
          <el-icon><FolderOpened /></el-icon>
          展开全部
        </el-button>
        <el-button @click="handleCollapseAll">
          <el-icon><Folder /></el-icon>
          收起全部
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
              <div class="stat-label">权限总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon menu"><el-icon><Menu /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.menu }}</div>
              <div class="stat-label">菜单权限</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon btn"><el-icon><Pointer /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.btn }}</div>
              <div class="stat-label">按钮权限</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon data"><el-icon><DataAnalysis /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.data }}</div>
              <div class="stat-label">数据权限</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-panel">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="权限名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入权限名称"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="权限编码">
          <el-input
            v-model="searchForm.code"
            placeholder="请输入权限编码"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="权限类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable style="width: 120px">
            <el-option label="菜单" value="menu" />
            <el-option label="按钮" value="button" />
            <el-option label="数据" value="data" />
            <el-option label="接口" value="api" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 权限树表格 -->
    <div class="table-container">
      <el-table
        :data="tableData"
        border
        stripe
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        default-expand-all
      >
        <el-table-column prop="name" label="权限名称" min-width="200">
          <template #default="{ row }">
            <div class="perm-name-cell">
              <el-icon v-if="row.type === 'menu'" class="perm-icon menu-icon"><Menu /></el-icon>
              <el-icon v-else-if="row.type === 'button'" class="perm-icon btn-icon"><Pointer /></el-icon>
              <el-icon v-else-if="row.type === 'data'" class="perm-icon data-icon"><DataLine /></el-icon>
              <el-icon v-else-if="row.type === 'api'" class="perm-icon api-icon"><Connection /></el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="权限编码" min-width="180" />
        <el-table-column prop="type" label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)" size="small">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由/标识" min-width="150" />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="150" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleAddChild(row)" v-if="row.type === 'menu'">新增子级</el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
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
      :title="isEdit ? '编辑权限' : '新增权限'"
      width="500px"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
        <el-form-item label="上级权限" v-if="formData.parentId">
          <el-input :value="parentName" disabled />
        </el-form-item>
        <el-form-item label="权限类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择" style="width: 100%" @change="handleTypeChange">
            <el-option label="菜单" value="menu" />
            <el-option label="按钮" value="button" />
            <el-option label="数据" value="data" />
            <el-option label="接口" value="api" />
          </el-select>
        </el-form-item>
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入权限编码" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="路由/标识" prop="path">
          <el-input v-model="formData.path" placeholder="请输入路由或权限标识" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.sort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="2" placeholder="请输入描述" />
        </el-form-item>
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
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, FolderOpened, Folder, Key, Menu, Pointer, DataAnalysis, DataLine, Connection } from '@element-plus/icons-vue'

const statistics = reactive({
  total: 45,
  menu: 12,
  btn: 28,
  data: 5
})

const searchForm = reactive({
  name: '',
  code: '',
  type: ''
})

const tableData = ref([
  {
    id: '1',
    name: '系统管理',
    code: 'system',
    type: 'menu',
    path: '/system',
    sort: 1,
    status: 'active',
    isSystem: true,
    description: '系统管理模块',
    children: [
      { id: '1-1', name: '用户管理', code: 'system:user', type: 'menu', path: '/system/user', sort: 1, status: 'active', isSystem: true, description: '', children: [
        { id: '1-1-1', name: '查看用户', code: 'system:user:view', type: 'button', path: '', sort: 1, status: 'active', isSystem: true, description: '' },
        { id: '1-1-2', name: '新增用户', code: 'system:user:add', type: 'button', path: '', sort: 2, status: 'active', isSystem: true, description: '' },
        { id: '1-1-3', name: '编辑用户', code: 'system:user:edit', type: 'button', path: '', sort: 3, status: 'active', isSystem: true, description: '' },
        { id: '1-1-4', name: '删除用户', code: 'system:user:del', type: 'button', path: '', sort: 4, status: 'active', isSystem: true, description: '' }
      ]},
      { id: '1-2', name: '角色管理', code: 'system:role', type: 'menu', path: '/system/role', sort: 2, status: 'active', isSystem: true, description: '', children: [
        { id: '1-2-1', name: '查看角色', code: 'system:role:view', type: 'button', path: '', sort: 1, status: 'active', isSystem: true, description: '' },
        { id: '1-2-2', name: '新增角色', code: 'system:role:add', type: 'button', path: '', sort: 2, status: 'active', isSystem: true, description: '' },
        { id: '1-2-3', name: '编辑角色', code: 'system:role:edit', type: 'button', path: '', sort: 3, status: 'active', isSystem: true, description: '' },
        { id: '1-2-4', name: '分配权限', code: 'system:role:perm', type: 'button', path: '', sort: 4, status: 'active', isSystem: true, description: '' }
      ]},
      { id: '1-3', name: '权限管理', code: 'system:permission', type: 'menu', path: '/system/permission', sort: 3, status: 'active', isSystem: true, description: '' },
      { id: '1-4', name: '操作日志', code: 'system:log', type: 'menu', path: '/system/log', sort: 4, status: 'active', isSystem: true, description: '' }
    ]
  },
  {
    id: '2',
    name: '基础设置',
    code: 'setting',
    type: 'menu',
    path: '/setting',
    sort: 2,
    status: 'active',
    isSystem: true,
    description: '基础设置模块',
    children: [
      { id: '2-1', name: '科目设置', code: 'setting:subject', type: 'menu', path: '/setting/subject', sort: 1, status: 'active', isSystem: true, description: '' },
      { id: '2-2', name: '费用类型', code: 'setting:expense', type: 'menu', path: '/setting/expense', sort: 2, status: 'active', isSystem: true, description: '' },
      { id: '2-3', name: '审批流程', code: 'setting:flow', type: 'menu', path: '/setting/flow', sort: 3, status: 'active', isSystem: true, description: '' },
      { id: '2-4', name: '客户档案', code: 'setting:customer', type: 'menu', path: '/setting/customer', sort: 4, status: 'active', isSystem: true, description: '' },
      { id: '2-5', name: '供应商档案', code: 'setting:supplier', type: 'menu', path: '/setting/supplier', sort: 5, status: 'active', isSystem: true, description: '' },
      { id: '2-6', name: '员工档案', code: 'setting:employee', type: 'menu', path: '/setting/employee', sort: 6, status: 'active', isSystem: true, description: '' }
    ]
  },
  {
    id: '3',
    name: '发票管理',
    code: 'invoice',
    type: 'menu',
    path: '/invoice',
    sort: 3,
    status: 'active',
    isSystem: false,
    description: '发票管理模块',
    children: [
      { id: '3-1', name: '发票开具', code: 'invoice:create', type: 'menu', path: '/invoice/create', sort: 1, status: 'active', isSystem: false, description: '' },
      { id: '3-2', name: '进项发票', code: 'invoice:input', type: 'menu', path: '/invoice/input', sort: 2, status: 'active', isSystem: false, description: '' },
      { id: '3-3', name: '销项发票', code: 'invoice:output', type: 'menu', path: '/invoice/output', sort: 3, status: 'active', isSystem: false, description: '' },
      { id: '3-4', name: '发票统计', code: 'invoice:stats', type: 'menu', path: '/invoice/stats', sort: 4, status: 'active', isSystem: false, description: '' }
    ]
  },
  {
    id: '4',
    name: '应收管理',
    code: 'receivable',
    type: 'menu',
    path: '/receivable',
    sort: 4,
    status: 'active',
    isSystem: false,
    description: '应收管理模块',
    children: [
      { id: '4-1', name: '应收确认', code: 'receivable:confirm', type: 'menu', path: '/receivable/confirm', sort: 1, status: 'active', isSystem: false, description: '' },
      { id: '4-2', name: '收款核销', code: 'receivable:verify', type: 'menu', path: '/receivable/verify', sort: 2, status: 'active', isSystem: false, description: '' },
      { id: '4-3', name: '应收报表', code: 'receivable:report', type: 'menu', path: '/receivable/report', sort: 3, status: 'active', isSystem: false, description: '' }
    ]
  }
])

const showDialog = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const currentRow = ref<any>(null)
const parentName = ref('')

const formData = reactive({
  id: '',
  parentId: '',
  type: 'menu',
  name: '',
  code: '',
  path: '',
  sort: 0,
  description: ''
})

const formRules: FormRules = {
  type: [{ required: true, message: '请选择权限类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入权限编码', trigger: 'blur' }]
}

const getTypeTag = (type: string) => {
  const types: Record<string, string> = {
    menu: 'primary',
    button: 'warning',
    data: 'success',
    api: 'info'
  }
  return types[type] || 'info'
}

const getTypeText = (type: string) => {
  const texts: Record<string, string> = {
    menu: '菜单',
    button: '按钮',
    data: '数据',
    api: '接口'
  }
  return texts[type] || type
}

const handleTypeChange = () => {
  formData.path = ''
}

const handleSearch = () => {
  ElMessage.success('搜索权限')
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.code = ''
  searchForm.type = ''
  ElMessage.info('已重置搜索条件')
}

const handleAdd = () => {
  isEdit.value = false
  formData.parentId = ''
  parentName.value = ''
  Object.assign(formData, {
    id: '',
    type: 'menu',
    name: '',
    code: '',
    path: '',
    sort: 0,
    description: ''
  })
  showDialog.value = true
}

const handleAddChild = (row: any) => {
  isEdit.value = false
  currentRow.value = row
  formData.parentId = row.id
  parentName.value = row.name
  Object.assign(formData, {
    id: '',
    type: 'button',
    name: '',
    code: '',
    path: '',
    sort: 0,
    description: ''
  })
  showDialog.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  currentRow.value = row
  formData.parentId = row.parentId || ''
  parentName.value = ''
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

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除权限 "${row.name}" 吗？`, '删除权限', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleExpandAll = () => {
  ElMessage.success('展开全部')
}

const handleCollapseAll = () => {
  ElMessage.success('收起全部')
}
</script>

<style scoped>
.permission-container {
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

.stat-icon.menu {
  background: #f0f9eb;
  color: #67c23a;
}

.stat-icon.btn {
  background: #fdf6ec;
  color: #e6a23c;
}

.stat-icon.data {
  background: #e8f4ff;
  color: #909399;
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

.perm-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.perm-icon {
  font-size: 16px;
}

.menu-icon {
  color: #67c23a;
}

.btn-icon {
  color: #e6a23c;
}

.data-icon {
  color: #909399;
}

.api-icon {
  color: #409eff;
}
</style>
