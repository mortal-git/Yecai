<template>
  <div class="template-manager">
    <!-- 操作按钮区 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleUpload">
        <el-icon><Upload /></el-icon>
        上传模板
      </el-button>
      <el-button @click="handleRefresh">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-panel">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="模板名称">
          <el-input v-model="filterForm.name" placeholder="请输入模板名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="客户分类">
          <el-select v-model="filterForm.customerType" placeholder="请选择" clearable style="width: 180px">
            <el-option label="全部" value="" />
            <el-option label="北京科技有限公司" value="beijing" />
            <el-option label="上海贸易有限公司" value="shanghai" />
            <el-option label="广州电子有限公司" value="guangzhou" />
          </el-select>
        </el-form-item>
        <el-form-item label="报表类型">
          <el-select v-model="filterForm.reportType" placeholder="请选择" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="月度报表" value="monthly" />
            <el-option label="季度报表" value="quarterly" />
            <el-option label="年度报表" value="yearly" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleResetFilter">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 模板列表 -->
    <div class="table-container">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="name" label="模板名称" min-width="200" />
        <el-table-column prop="customerName" label="客户分类" width="150" />
        <el-table-column prop="reportType" label="报表类型" width="100" :formatter="formatReportType" />
        <el-table-column prop="version" label="当前版本" width="100" />
        <el-table-column prop="status" label="状态" width="80" :formatter="formatStatus" />
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column prop="updater" label="更新人" width="100" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" link @click="handlePreview(scope.row)">预览</el-button>
            <el-button type="success" size="small" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="info" size="small" link @click="handleVersion(scope.row)">版本</el-button>
            <el-dropdown @command="(cmd) => handleMoreAction(cmd, scope.row)">
              <template #default>
                <el-button type="warning" size="small" link>更多</el-button>
              </template>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="copy">复制模板</el-dropdown-item>
                  <el-dropdown-item command="disable" v-if="scope.row.status === 'active'">禁用</el-dropdown-item>
                  <el-dropdown-item command="enable" v-else>启用</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>

    <!-- 上传模板对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="上传模板" width="600px" :close-on-click-modal="false">
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="模板名称" required>
          <el-input v-model="uploadForm.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="客户分类" required>
          <el-select v-model="uploadForm.customerId" placeholder="请选择客户" style="width: 100%">
            <el-option label="北京科技有限公司" value="beijing" />
            <el-option label="上海贸易有限公司" value="shanghai" />
            <el-option label="广州电子有限公司" value="guangzhou" />
            <el-option label="深圳信息技术有限公司" value="shenzhen" />
          </el-select>
        </el-form-item>
        <el-form-item label="报表类型" required>
          <el-select v-model="uploadForm.reportType" placeholder="请选择报表类型" style="width: 100%">
            <el-option label="月度报表" value="monthly" />
            <el-option label="季度报表" value="quarterly" />
            <el-option label="年度报表" value="yearly" />
            <el-option label="周报" value="weekly" />
          </el-select>
        </el-form-item>
        <el-form-item label="上传文件" required>
          <el-upload
            ref="uploadRef"
            class="template-upload"
            drag
            :action="uploadUrl"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :on-exceed="handleExceed"
            accept=".xlsx,.xls,.csv,.wps"
          >
            <el-icon class="el-icon--upload"><Upload /></el-icon>
            <div class="el-upload__text">拖拽文件到此处，或 <em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">支持 Excel、WPS、CSV 格式，文件大小不超过 10MB</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="模板说明">
          <el-input v-model="uploadForm.remark" type="textarea" :rows="3" placeholder="请输入模板说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitUpload">确定上传</el-button>
      </template>
    </el-dialog>

    <!-- 模板预览对话框 -->
    <el-dialog v-model="previewDialogVisible" title="模板预览" width="900px">
      <div class="preview-container">
        <el-alert type="info" :closable="false" show-icon>
          <template #title>
            <span>模板识别结果：共识别 <strong>5</strong> 个表头字段，<strong>3</strong> 个数据区域</span>
          </template>
        </el-alert>
        <div class="preview-table">
          <table class="preview-table-inner">
            <thead>
              <tr>
                <th>客户名称</th>
                <th>订单号</th>
                <th>下单时间</th>
                <th>订单金额</th>
                <th>已付金额</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>北京科技...</td><td>SO2024...</td><td>2024-01...</td><td>¥12,800.00</td><td>¥6,400.00</td></tr>
              <tr><td>上海贸易...</td><td>SO2024...</td><td>2024-01...</td><td>¥8,600.00</td><td>¥8,600.00</td></tr>
              <tr><td>广州电子...</td><td>SO2024...</td><td>2024-01...</td><td>¥25,600.00</td><td>¥0.00</td></tr>
            </tbody>
          </table>
        </div>
        <div class="preview-fields">
          <h4>识别的表头字段：</h4>
          <el-tag v-for="field in previewFields" :key="field" style="margin-right: 8px; margin-bottom: 8px">{{ field }}</el-tag>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleUseTemplate">使用此模板</el-button>
      </template>
    </el-dialog>

    <!-- 版本管理对话框 -->
    <el-dialog v-model="versionDialogVisible" title="模板版本管理" width="700px">
      <div class="version-info">
        <el-alert type="success" :closable="false">
          <template #title>
            <span>当前版本：<strong>v3</strong>（最新）</span>
          </template>
        </el-alert>
      </div>
      <el-table :data="versionHistory" border stripe style="margin-top: 15px">
        <el-table-column prop="version" label="版本号" width="100" />
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column prop="updater" label="更新人" width="100" />
        <el-table-column prop="changeDesc" label="变更说明" min-width="200" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button type="primary" size="small" link :disabled="scope.row.version === 'v3'" @click="handleRollback(scope.row)">回滚此版本</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="versionDialogVisible = false">关闭</el-button>
        <el-button type="primary" plain @click="handleUploadNewVersion">
          <el-icon><Upload /></el-icon>
          上传新版本
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑模板对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑模板" width="800px">
      <el-form :model="editForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模板名称">
              <el-input v-model="editForm.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报表类型">
              <el-select v-model="editForm.reportType" style="width: 100%">
                <el-option label="月度报表" value="monthly" />
                <el-option label="季度报表" value="quarterly" />
                <el-option label="年度报表" value="yearly" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="表头字段">
          <el-input v-model="editForm.headerFields" type="textarea" :rows="2" placeholder="多个字段用逗号分隔" />
        </el-form-item>
        <el-form-item label="模板说明">
          <el-input v-model="editForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, Search, Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const uploadDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const versionDialogVisible = ref(false)
const editDialogVisible = ref(false)

const uploadUrl = '/api/template/upload'

const filterForm = reactive({
  name: '',
  customerType: '',
  reportType: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const uploadForm = reactive({
  name: '',
  customerId: '',
  reportType: '',
  remark: ''
})

const editForm = reactive({
  name: '',
  reportType: '',
  headerFields: '',
  remark: ''
})

const previewFields = ['客户名称', '订单号', '下单时间', '订单金额', '已付金额']

const tableData = ref([
  { id: 1, name: '北京科技月度订单报表模板', customerName: '北京科技有限公司', reportType: 'monthly', version: 'v3', status: 'active', updateTime: '2024-03-15 14:30:00', updater: '张三' },
  { id: 2, name: '上海贸易月度对账模板', customerName: '上海贸易有限公司', reportType: 'monthly', version: 'v2', status: 'active', updateTime: '2024-03-10 09:20:00', updater: '李四' },
  { id: 3, name: '广州电子季度报表模板', customerName: '广州电子有限公司', reportType: 'quarterly', version: 'v1', status: 'active', updateTime: '2024-02-28 16:45:00', updater: '王五' },
  { id: 4, name: '深圳信息年度汇总模板', customerName: '深圳信息技术有限公司', reportType: 'yearly', version: 'v2', status: 'disabled', updateTime: '2024-02-20 11:10:00', updater: '赵六' },
  { id: 5, name: '杭州制造周报模板', customerName: '杭州制造有限公司', reportType: 'weekly', version: 'v1', status: 'active', updateTime: '2024-03-01 08:00:00', updater: '孙七' }
])

pagination.total = tableData.value.length

const versionHistory = ref([
  { version: 'v3', updateTime: '2024-03-15 14:30:00', updater: '张三', changeDesc: '更新表头样式，添加合计行' },
  { version: 'v2', updateTime: '2024-02-10 10:20:00', updater: '张三', changeDesc: '调整列宽，修改日期格式' },
  { version: 'v1', updateTime: '2024-01-05 09:00:00', updater: '张三', changeDesc: '初始版本' }
])

const formatReportType = (row: any) => {
  const map: Record<string, string> = { monthly: '月度报表', quarterly: '季度报表', yearly: '年度报表', weekly: '周报' }
  return map[row.reportType] || row.reportType
}

const formatStatus = (row: any) => {
  return row.status === 'active' ? '启用' : '禁用'
}

const handleUpload = () => {
  uploadDialogVisible.value = true
}

const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('刷新成功')
  }, 500)
}

const handleFilter = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('筛选成功')
  }, 500)
}

const handleResetFilter = () => {
  Object.assign(filterForm, { name: '', customerType: '', reportType: '', status: '' })
  handleFilter()
}

const handleFileChange = (file: any) => {
  console.log('file change:', file)
}

const handleExceed = () => {
  ElMessage.warning('最多只能上传 1 个文件')
}

const handleSubmitUpload = () => {
  if (!uploadForm.name || !uploadForm.customerId || !uploadForm.reportType) {
    ElMessage.warning('请填写完整信息')
    return
  }
  ElMessage.success('模板上传成功，AI正在识别表格结构...')
  uploadDialogVisible.value = false
  setTimeout(() => {
    previewDialogVisible.value = true
  }, 500)
}

const handlePreview = (row: any) => {
  previewDialogVisible.value = true
}

const handleEdit = (row: any) => {
  editForm.name = row.name
  editForm.reportType = row.reportType
  editForm.headerFields = '客户名称, 订单号, 下单时间, 订单金额, 已付金额'
  editForm.remark = ''
  editDialogVisible.value = true
}

const handleVersion = (row: any) => {
  versionDialogVisible.value = true
}

const handleMoreAction = (command: string, row: any) => {
  switch (command) {
    case 'copy':
      ElMessage.success('模板复制成功')
      break
    case 'disable':
      row.status = 'disabled'
      ElMessage.success('模板已禁用')
      break
    case 'enable':
      row.status = 'active'
      ElMessage.success('模板已启用')
      break
    case 'delete':
      ElMessageBox.confirm('确定要删除该模板吗？删除后不可恢复。', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ElMessage.success('删除成功')
      }).catch(() => {})
      break
  }
}

const handleUseTemplate = () => {
  previewDialogVisible.value = false
  ElMessage.success('模板已选中，请前往"字段映射"进行配置')
}

const handleRollback = (row: any) => {
  ElMessageBox.confirm(`确定要回滚到版本 ${row.version} 吗？`, '确认回滚', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('回滚成功')
    versionDialogVisible.value = false
  }).catch(() => {})
}

const handleUploadNewVersion = () => {
  versionDialogVisible.value = false
  uploadDialogVisible.value = true
}

const handleSaveEdit = () => {
  ElMessage.success('保存成功')
  editDialogVisible.value = false
}
</script>

<style scoped>
.template-manager {
  padding: 0;
}

.action-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.filter-panel {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.table-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #eee;
  margin-top: 20px;
}

.preview-container {
  max-height: 500px;
  overflow-y: auto;
}

.preview-table {
  margin: 20px 0;
  overflow-x: auto;
}

.preview-table-inner {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.preview-table-inner th,
.preview-table-inner td {
  border: 1px solid #dcdfe6;
  padding: 10px;
  text-align: left;
}

.preview-table-inner th {
  background: #f5f7fa;
  font-weight: 600;
}

.preview-fields {
  margin-top: 15px;
}

.preview-fields h4 {
  margin-bottom: 10px;
  color: #606266;
}

.version-info {
  margin-bottom: 10px;
}

.template-upload :deep(.el-upload-dragger) {
  padding: 30px;
}
</style>
