<template>
  <div class="expense-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <span class="page-title">费用类型</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增费用类型
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
            <div class="stat-icon total"><el-icon><Coin /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">费用类型总数</div>
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
            <div class="stat-icon budget"><el-icon><TrendCharts /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.withBudget }}</div>
              <div class="stat-label">关联预算</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon invoice"><el-icon><Document /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.withInvoice }}</div>
              <div class="stat-label">可开票</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-panel">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="费用类型">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入费用类型"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="费用大类">
          <el-select v-model="searchForm.category" placeholder="请选择" clearable style="width: 140px">
            <el-option label="采购类" value="procurement" />
            <el-option label="物流类" value="logistics" />
            <el-option label="服务类" value="service" />
            <el-option label="租赁类" value="rental" />
            <el-option label="差旅类" value="travel" />
            <el-option label="办公类" value="office" />
            <el-option label="其他类" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 100px">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="可开票">
          <el-select v-model="searchForm.canInvoice" placeholder="请选择" clearable style="width: 100px">
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
        <el-table-column prop="code" label="费用编码" width="120" />
        <el-table-column prop="name" label="费用类型名称" min-width="160" />
        <el-table-column prop="category" label="费用大类" width="100">
          <template #default="{ row }">
            {{ getCategoryText(row.category) }}
          </template>
        </el-table-column>
        <el-table-column prop="taxRate" label="默认税率" width="100">
          <template #default="{ row }">
            {{ row.taxRate ? row.taxRate + '%' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="canInvoice" label="可开票" width="80">
          <template #default="{ row }">
            <el-tag :type="row.canInvoice ? 'success' : 'info'" size="small">
              {{ row.canInvoice ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hasBudget" label="关联预算" width="80">
          <template #default="{ row }">
            <el-tag :type="row.hasBudget ? 'warning' : 'info'" size="small">
              {{ row.hasBudget ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" min-width="200" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              :type="row.status === 'active' ? 'danger' : 'success'"
              link
              size="small"
              @click="handleToggleStatus(row)"
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
      :title="isEdit ? '编辑费用类型' : '新增费用类型'"
      width="600px"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="费用编码" prop="code">
              <el-input v-model="formData.code" placeholder="请输入费用编码" :disabled="isEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="费用类型" prop="name">
              <el-input v-model="formData.name" placeholder="请输入费用类型名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="费用大类" prop="category">
              <el-select v-model="formData.category" placeholder="请选择" style="width: 100%">
                <el-option label="采购类" value="procurement" />
                <el-option label="物流类" value="logistics" />
                <el-option label="服务类" value="service" />
                <el-option label="租赁类" value="rental" />
                <el-option label="差旅类" value="travel" />
                <el-option label="办公类" value="office" />
                <el-option label="其他类" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认税率">
              <el-select v-model="formData.taxRate" placeholder="请选择" style="width: 100%">
                <el-option label="0%" :value="0" />
                <el-option label="6%" :value="6" />
                <el-option label="9%" :value="9" />
                <el-option label="13%" :value="13" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="可开票">
              <el-switch v-model="formData.canInvoice" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联预算">
              <el-switch v-model="formData.hasBudget" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="说明">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入说明" />
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
import { Plus, Upload, Download, Coin, CircleCheck, TrendCharts, Document } from '@element-plus/icons-vue'

// 统计数据
const statistics = reactive({
  total: 24,
  active: 22,
  withBudget: 15,
  withInvoice: 20
})

// 搜索表单
const searchForm = reactive({
  name: '',
  category: '',
  status: '',
  canInvoice: ''
})

// 表格数据
const tableData = ref([
  { id: 1, code: 'FY001', name: '商品采购', category: 'procurement', taxRate: 13, canInvoice: true, hasBudget: true, description: '用于采购各类商品', status: 'active', isSystem: true },
  { id: 2, code: 'FY002', name: '服务费', category: 'service', taxRate: 6, canInvoice: true, hasBudget: true, description: '各类服务费用支出', status: 'active', isSystem: true },
  { id: 3, code: 'FY003', name: '物流费', category: 'logistics', taxRate: 6, canInvoice: true, hasBudget: true, description: '货物运输及配送费用', status: 'active', isSystem: false },
  { id: 4, code: 'FY004', name: '租赁费', category: 'rental', taxRate: 9, canInvoice: true, hasBudget: true, description: '场地、设备租赁费用', status: 'active', isSystem: false },
  { id: 5, code: 'FY005', name: '差旅费', category: 'travel', taxRate: 0, canInvoice: false, hasBudget: true, description: '员工出差相关费用', status: 'active', isSystem: false },
  { id: 6, code: 'FY006', name: '办公费', category: 'office', taxRate: 0, canInvoice: false, hasBudget: false, description: '办公用品及日常消耗', status: 'active', isSystem: false },
  { id: 7, code: 'FY007', name: '咨询费', category: 'service', taxRate: 6, canInvoice: true, hasBudget: true, description: '专业咨询顾问费用', status: 'active', isSystem: false },
  { id: 8, code: 'FY008', name: '推广费', category: 'service', taxRate: 6, canInvoice: true, hasBudget: true, description: '市场推广及广告费用', status: 'active', isSystem: false },
  { id: 9, code: 'FY009', name: '维修费', category: 'service', taxRate: 13, canInvoice: true, hasBudget: false, description: '设备及设施维修保养', status: 'disabled', isSystem: false },
  { id: 10, code: 'FY010', name: '培训费', category: 'service', taxRate: 6, canInvoice: true, hasBudget: true, description: '员工培训及教育费用', status: 'active', isSystem: false }
])

// 对话框
const showDialog = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  id: '',
  code: '',
  name: '',
  category: '',
  taxRate: null as number | null,
  canInvoice: true,
  hasBudget: false,
  description: ''
})

const formRules: FormRules = {
  code: [{ required: true, message: '请输入费用编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入费用类型名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择费用大类', trigger: 'change' }]
}

// 方法
const getCategoryText = (category: string) => {
  const texts: Record<string, string> = {
    procurement: '采购类',
    logistics: '物流类',
    service: '服务类',
    rental: '租赁类',
    travel: '差旅类',
    office: '办公类',
    other: '其他类'
  }
  return texts[category] || category
}

const handleSearch = () => {
  ElMessage.success('搜索费用类型')
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.category = ''
  searchForm.status = ''
  searchForm.canInvoice = ''
  ElMessage.info('已重置搜索条件')
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: '',
    code: '',
    name: '',
    category: '',
    taxRate: null,
    canInvoice: true,
    hasBudget: false,
    description: ''
  })
  showDialog.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
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

const handleToggleStatus = (row: any) => {
  const action = row.status === 'active' ? '停用' : '启用'
  ElMessageBox.confirm(`确定要${action}费用类型 "${row.name}" 吗？`, `${action}费用类型`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除费用类型 "${row.name}" 吗？`, '删除费用类型', {
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
  ElMessage.success('导出费用类型')
}
</script>

<style scoped>
.expense-container {
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

.stat-icon.budget {
  background: #fdf6ec;
  color: #e6a23c;
}

.stat-icon.invoice {
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
