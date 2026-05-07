<template>
  <div class="subject-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <span class="page-title">科目设置</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAddRoot">
          <el-icon><Plus /></el-icon>
          新增一级科目
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

    <!-- 搜索筛选 -->
    <div class="search-panel">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="科目编码">
          <el-input
            v-model="searchForm.code"
            placeholder="请输入科目编码"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="科目名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入科目名称"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="科目类别">
          <el-select v-model="searchForm.category" placeholder="请选择" clearable style="width: 140px">
            <el-option label="资产" value="asset" />
            <el-option label="负债" value="liability" />
            <el-option label="权益" value="equity" />
            <el-option label="成本" value="cost" />
            <el-option label="损益" value="profit_loss" />
          </el-select>
        </el-form-item>
        <el-form-item label="余额方向">
          <el-select v-model="searchForm.balanceDirection" placeholder="请选择" clearable style="width: 120px">
            <el-option label="借方" value="debit" />
            <el-option label="贷方" value="credit" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 科目表格 -->
    <div class="table-container">
      <el-table
        :data="subjectData"
        border
        stripe
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="code" label="科目编码" width="140" />
        <el-table-column prop="name" label="科目名称" min-width="180">
          <template #default="{ row }">
            <span :class="{ 'is-disabled': row.isDisabled }">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="科目类别" width="100">
          <template #default="{ row }">
            {{ getCategoryText(row.category) }}
          </template>
        </el-table-column>
        <el-table-column prop="balanceDirection" label="余额方向" width="80">
          <template #default="{ row }">
            {{ row.balanceDirection === 'debit' ? '借' : '贷' }}
          </template>
        </el-table-column>
        <el-table-column prop="isLeaf" label="明细科目" width="80">
          <template #default="{ row }">
            {{ row.isLeaf ? '是' : '否' }}
          </template>
        </el-table-column>
        <el-table-column prop="isAuxiliary" label="辅助核算" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.auxiliaryItems?.length" size="small" type="info">
              {{ row.auxiliaryItems.length }}项
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isDisabled ? 'info' : 'success'" size="small">
              {{ row.isDisabled ? '停用' : '启用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleAdd(row)" v-if="!row.isLeaf">
              新增下级
            </el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              type="primary"
              link
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.isDisabled ? '启用' : '停用' }}
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              @click="handleDelete(row)"
              v-if="!row.children?.length"
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
      :title="isEdit ? '编辑科目' : '新增科目'"
      width="600px"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="上级科目" v-if="formData.parentId">
          <el-input :value="parentName" disabled />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="科目编码" prop="code">
              <el-input v-model="formData.code" placeholder="请输入科目编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="科目名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入科目名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="科目类别" prop="category">
              <el-select v-model="formData.category" placeholder="请选择" style="width: 100%">
                <el-option label="资产" value="asset" />
                <el-option label="负债" value="liability" />
                <el-option label="权益" value="equity" />
                <el-option label="成本" value="cost" />
                <el-option label="损益" value="profit_loss" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="余额方向" prop="balanceDirection">
              <el-select v-model="formData.balanceDirection" placeholder="请选择" style="width: 100%">
                <el-option label="借方" value="debit" />
                <el-option label="贷方" value="credit" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="辅助核算">
          <el-checkbox-group v-model="formData.auxiliaryTypes">
            <el-checkbox label="customer">客户</el-checkbox>
            <el-checkbox label="supplier">供应商</el-checkbox>
            <el-checkbox label="department">部门</el-checkbox>
            <el-checkbox label="employee">员工</el-checkbox>
            <el-checkbox label="project">项目</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
import { Plus, Upload, Download } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  code: '',
  name: '',
  category: '',
  balanceDirection: ''
})

// 科目数据
const subjectData = ref([
  {
    id: 1,
    code: '1001',
    name: '库存现金',
    category: 'asset',
    balanceDirection: 'debit',
    isLeaf: false,
    isDisabled: false,
    auxiliaryItems: [],
    remark: '',
    children: [
      {
        id: 11,
        code: '100101',
        name: '人民币',
        category: 'asset',
        balanceDirection: 'debit',
        isLeaf: true,
        isDisabled: false,
        auxiliaryItems: [],
        remark: ''
      },
      {
        id: 12,
        code: '100102',
        name: '外币',
        category: 'asset',
        balanceDirection: 'debit',
        isLeaf: true,
        isDisabled: false,
        auxiliaryItems: [],
        remark: ''
      }
    ]
  },
  {
    id: 2,
    code: '1002',
    name: '银行存款',
    category: 'asset',
    balanceDirection: 'debit',
    isLeaf: false,
    isDisabled: false,
    auxiliaryItems: [{ type: 'bank' }],
    remark: '',
    children: [
      {
        id: 21,
        code: '100201',
        name: '基本户',
        category: 'asset',
        balanceDirection: 'debit',
        isLeaf: true,
        isDisabled: false,
        auxiliaryItems: [],
        remark: '中国银行'
      },
      {
        id: 22,
        code: '100202',
        name: '一般户',
        category: 'asset',
        balanceDirection: 'debit',
        isLeaf: true,
        isDisabled: false,
        auxiliaryItems: [],
        remark: '工商银行'
      }
    ]
  },
  {
    id: 3,
    code: '1122',
    name: '应收账款',
    category: 'asset',
    balanceDirection: 'debit',
    isLeaf: false,
    isDisabled: false,
    auxiliaryItems: [{ type: 'customer' }],
    remark: '',
    children: []
  },
  {
    id: 4,
    code: '2202',
    name: '应付账款',
    category: 'liability',
    balanceDirection: 'credit',
    isLeaf: false,
    isDisabled: false,
    auxiliaryItems: [{ type: 'supplier' }],
    remark: '',
    children: []
  },
  {
    id: 5,
    code: '5001',
    name: '主营业务成本',
    category: 'cost',
    balanceDirection: 'debit',
    isLeaf: true,
    isDisabled: false,
    auxiliaryItems: [{ type: 'department' }],
    remark: ''
  },
  {
    id: 6,
    code: '6001',
    name: '主营业务收入',
    category: 'profit_loss',
    balanceDirection: 'credit',
    isLeaf: true,
    isDisabled: false,
    auxiliaryItems: [],
    remark: ''
  }
])

// 对话框
const showDialog = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const parentName = ref('')

const formData = reactive({
  id: '',
  parentId: '',
  code: '',
  name: '',
  category: '',
  balanceDirection: '',
  auxiliaryTypes: [] as string[],
  remark: ''
})

const formRules: FormRules = {
  code: [{ required: true, message: '请输入科目编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入科目名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择科目类别', trigger: 'change' }],
  balanceDirection: [{ required: true, message: '请选择余额方向', trigger: 'change' }]
}

// 方法
const getCategoryText = (category: string) => {
  const texts: Record<string, string> = {
    asset: '资产',
    liability: '负债',
    equity: '权益',
    cost: '成本',
    profit_loss: '损益'
  }
  return texts[category] || category
}

const handleSearch = () => {
  ElMessage.success('搜索科目')
}

const handleReset = () => {
  searchForm.code = ''
  searchForm.name = ''
  searchForm.category = ''
  searchForm.balanceDirection = ''
  ElMessage.info('已重置搜索条件')
}

const handleAddRoot = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: '',
    parentId: '',
    code: '',
    name: '',
    category: '',
    balanceDirection: '',
    auxiliaryTypes: [],
    remark: ''
  })
  parentName.value = ''
  showDialog.value = true
}

const handleAdd = (row: any) => {
  isEdit.value = false
  Object.assign(formData, {
    id: '',
    parentId: row.id,
    code: row.code,
    name: '',
    category: row.category,
    balanceDirection: row.balanceDirection,
    auxiliaryTypes: [],
    remark: ''
  })
  parentName.value = row.name
  showDialog.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    parentId: row.parentId || '',
    code: row.code,
    name: row.name,
    category: row.category,
    balanceDirection: row.balanceDirection,
    auxiliaryTypes: row.auxiliaryItems?.map((a: any) => a.type) || [],
    remark: row.remark || ''
  })
  parentName.value = row.parentName || ''
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

const handleToggleStatus = (row: any) => {
  const action = row.isDisabled ? '启用' : '停用'
  ElMessageBox.confirm(`确定要${action}科目 "${row.name}" 吗？`, `${action}科目`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除科目 "${row.name}" 吗？`, '删除科目', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleImport = () => {
  ElMessage.info('打开科目导入功能')
}

const handleExport = () => {
  ElMessage.success('导出科目')
}
</script>

<style scoped>
.subject-container {
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

.search-panel {
  background: #fff;
  margin: 16px 20px;
  padding: 20px;
  border-radius: 8px;
}

.table-container {
  background: #fff;
  margin: 0 20px 16px;
  padding: 20px;
  border-radius: 8px;
}

.is-disabled {
  color: #c0c4cc;
}
</style>
