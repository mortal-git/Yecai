<template>
  <div class="cos-order-container">
    <!-- 搜索筛选区域 -->
    <div class="search-panel">
      <el-form :model="searchForm" :inline="true">
        <el-form-item label="业务参考编号">
          <el-input v-model="searchForm.bizReferenceNo" placeholder="请输入业务参考编号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="客户名称">
          <el-select v-model="searchForm.customerName" placeholder="请选择客户名称" clearable filterable style="width: 200px">
            <el-option v-for="customer in customerList" :key="customer" :label="customer" :value="customer" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-bar">
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出
      </el-button>
      <el-button @click="openFieldConfig">
        <el-icon><Setting /></el-icon>
        字段设置
      </el-button>
    </div>

    <!-- 列表区域 -->
    <div class="table-container">
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        highlight-current-row
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" fixed />
        <el-table-column type="index" label="序号" width="80" fixed />
        <el-table-column prop="billingSubject" label="账单主体" min-width="150" fixed />
        <el-table-column prop="bizReferenceNo" label="业务参考编号" min-width="180" fixed />
        <el-table-column prop="customerName" label="客户名称" min-width="150" fixed />
        <!-- 动态自定义字段 -->
        <el-table-column
          v-for="field in customFields"
          :key="field.fieldCode"
          :prop="field.fieldCode"
          :label="field.fieldName"
          min-width="150"
          show-overflow-tooltip
        />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 流程图区域 -->
    <div class="flow-section">
      <div class="flow-header">
        <h3>数据获取流程</h3>
      </div>

      <!-- 账单拆分交互图片 -->
      <div class="flow-image">
        <img src="@/assets/账单交互.png" alt="账单拆分交互流程图" />
      </div>
    </div>

    <!-- 自定义字段配置弹窗 -->
    <el-dialog
      v-model="showFieldConfig"
      title="字段设置"
      width="850px"
      :close-on-click-modal="false"
    >
      <div class="field-config-container">
        <!-- 已配置字段 -->
        <div class="config-section">
          <div class="section-header">
            <h4>已配置字段</h4>
          </div>
          <el-table :data="customFields" border style="margin-top: 10px">
            <el-table-column prop="cosTable" label="COS表" min-width="200">
              <template #default="scope">
                <el-input v-model="scope.row.cosTable" placeholder="请输入COS表名" />
              </template>
            </el-table-column>
            <el-table-column prop="fieldCode" label="COS表字段" min-width="200">
              <template #default="scope">
                <el-input v-model="scope.row.fieldCode" placeholder="COS表字段" />
              </template>
            </el-table-column>
            <el-table-column prop="fieldName" label="中文名称" min-width="180">
              <template #default="scope">
                <el-input v-model="scope.row.fieldName" placeholder="中文名称" />
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 新增字段 -->
        <div class="config-section" style="margin-top: 20px">
          <div class="section-header">
            <h4>新增字段</h4>
          </div>
          <div class="add-field-form">
            <el-input v-model="newField.cosTable" placeholder="COS表" style="width: 180px; margin-right: 10px" />
            <el-input v-model="newField.fieldCode" placeholder="COS表字段" style="width: 180px; margin-right: 10px" />
            <el-input v-model="newField.fieldName" placeholder="中文名称" style="width: 140px; margin-right: 10px" />
            <el-button type="primary" @click="addField" :disabled="!newField.cosTable || !newField.fieldCode || !newField.fieldName">
              <el-icon><Plus /></el-icon>
              添加
            </el-button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showFieldConfig = false">取消</el-button>
          <el-button type="primary" @click="saveFieldConfig" :loading="saveLoading">保存配置</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Download, Setting, Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const saveLoading = ref(false)
const showFieldConfig = ref(false)
const selectedRows = ref<any[]>([])

// 客户列表
const customerList = ref([
  '北京科技有限公司',
  '上海电子有限公司',
  '广州贸易有限公司',
  '深圳信息技术有限公司',
  '杭州制造有限公司'
])

// 搜索表单
const searchForm = reactive({
  bizReferenceNo: '',
  customerName: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 自定义字段列表
const customFields = ref([
  { cosTable: 'ord_order', fieldCode: 'department', fieldName: '部门' },
  { cosTable: 'ord_order', fieldCode: 'owner_region', fieldName: '货主区域' },
  { cosTable: 'ord_order', fieldCode: 'plant', fieldName: 'Plant' },
  { cosTable: 'ord_order', fieldCode: 'location', fieldName: 'Location' }
])

// 新增字段
const newField = reactive({
  cosTable: '',
  fieldCode: '',
  fieldName: ''
})

// 表格数据
const tableData = ref([
  {
    billingSubject: '北京科技有限公司',
    bizReferenceNo: 'BIZ2024040001',
    customerName: '北京科技有限公司',
    department: '销售一部',
    ownerRegion: '华北区域',
    plant: 'Beijing-01',
    location: 'WH-A01'
  },
  {
    billingSubject: '上海电子有限公司',
    bizReferenceNo: 'BIZ2024040002',
    customerName: '上海电子有限公司',
    department: '销售二部',
    ownerRegion: '华东区域',
    plant: 'Shanghai-01',
    location: 'WH-B02'
  },
  {
    billingSubject: '广州贸易有限公司',
    bizReferenceNo: 'BIZ2024040003',
    customerName: '广州贸易有限公司',
    department: '销售一部',
    ownerRegion: '华南区域',
    plant: 'Guangzhou-01',
    location: 'WH-C03'
  },
  {
    billingSubject: '深圳信息技术有限公司',
    bizReferenceNo: 'BIZ2024040004',
    customerName: '深圳信息技术有限公司',
    department: '销售三部',
    ownerRegion: '华南区域',
    plant: 'Shenzhen-01',
    location: 'WH-D04'
  },
  {
    billingSubject: '杭州制造有限公司',
    bizReferenceNo: 'BIZ2024040005',
    customerName: '杭州制造有限公司',
    department: '销售二部',
    ownerRegion: '华东区域',
    plant: 'Hangzhou-01',
    location: 'WH-E05'
  }
])

pagination.total = tableData.value.length

// 搜索
const handleSearch = () => {
  loading.value = true
  // 模拟搜索请求
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

// 重置
const handleReset = () => {
  searchForm.bizReferenceNo = ''
  searchForm.customerName = ''
  handleSearch()
}

// 刷新数据
const handleRefresh = () => {
  handleSearch()
}

// 勾选数据
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

// 分页变化
const handlePageChange = () => {
  handleSearch()
}

// 打开字段配置
const openFieldConfig = () => {
  showFieldConfig.value = true
}

// 添加字段
const addField = () => {
  if (!newField.cosTable || !newField.fieldCode || !newField.fieldName) {
    ElMessage.warning('请填写完整的字段信息')
    return
  }
  // 检查是否已存在
  const exists = customFields.value.some(f => f.fieldCode === newField.fieldCode)
  if (exists) {
    ElMessage.warning('该字段已存在')
    return
  }
  customFields.value.push({
    cosTable: newField.cosTable,
    fieldCode: newField.fieldCode,
    fieldName: newField.fieldName
  })
  newField.cosTable = ''
  newField.fieldCode = ''
  newField.fieldName = ''
}

// 删除字段
const removeField = (index: number) => {
  ElMessageBox.confirm('确定要删除该字段吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    customFields.value.splice(index, 1)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 保存字段配置
const saveFieldConfig = async () => {
  // 校验字段
  for (const field of customFields.value) {
    if (!field.fieldCode || !field.fieldName) {
      ElMessage.warning('字段信息不完整，请检查')
      return
    }
  }

  saveLoading.value = true
  try {
    // 模拟保存请求
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 保存到本地存储
    localStorage.setItem('cosCustomFields', JSON.stringify(customFields.value))

    showFieldConfig.value = false
    ElMessage.success('配置保存成功')
    handleSearch()
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saveLoading.value = false
  }
}

// 从本地存储加载自定义字段
const loadCustomFields = () => {
  const saved = localStorage.getItem('cosCustomFields')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        customFields.value = parsed
      }
    } catch (e) {
      console.error('加载自定义字段失败', e)
    }
  }
  // 如果没有保存的字段，使用默认值
  if (!localStorage.getItem('cosCustomFields')) {
    localStorage.setItem('cosCustomFields', JSON.stringify(customFields.value))
  }
}

onMounted(() => {
  loadCustomFields()
})
</script>

<style scoped>
.cos-order-container {
  padding: 0;
}

.search-panel {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.action-bar {
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 10px;
}

.table-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #eee;
  margin-top: 20px;
}

.flow-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.flow-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.flow-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.flow-image {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: center;
}

.flow-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.field-config-container {
  max-height: 500px;
  overflow-y: auto;
}

.config-section {
  padding: 10px 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.section-header .tip {
  font-size: 12px;
  color: #909399;
}

.add-field-form {
  margin-top: 10px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
}

.dialog-footer {
  text-align: right;
}
</style>
