<template>
  <div class="log-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <span class="page-title">操作日志</span>
      </div>
      <div class="header-right">
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <el-button @click="handleClean">
          <el-icon><Delete /></el-icon>
          清理日志
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon total"><el-icon><Document /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">日志总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon today"><el-icon><Clock /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.today }}</div>
              <div class="stat-label">今日操作</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon warning"><el-icon><Warning /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.warning }}</div>
              <div class="stat-label">警告日志</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon error"><el-icon><CircleClose /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.error }}</div>
              <div class="stat-label">错误日志</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-panel">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="操作人">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入操作人"
            clearable
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.actionType" placeholder="请选择" clearable style="width: 120px">
            <el-option label="新增" value="create" />
            <el-option label="编辑" value="update" />
            <el-option label="删除" value="delete" />
            <el-option label="查询" value="query" />
            <el-option label="登录" value="login" />
            <el-option label="登出" value="logout" />
            <el-option label="审批" value="approve" />
            <el-option label="导出" value="export" />
            <el-option label="导入" value="import" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作模块">
          <el-select v-model="searchForm.module" placeholder="请选择" clearable style="width: 140px">
            <el-option label="系统管理" value="system" />
            <el-option label="基础设置" value="setting" />
            <el-option label="发票管理" value="invoice" />
            <el-option label="应收管理" value="receivable" />
            <el-option label="应付管理" value="payable" />
            <el-option label="对账单" value="statement" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="结果">
          <el-select v-model="searchForm.result" placeholder="请选择" clearable style="width: 100px">
            <el-option label="成功" value="success" />
            <el-option label="失败" value="fail" />
            <el-option label="警告" value="warning" />
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
        <el-table-column prop="actionTime" label="操作时间" width="160" />
        <el-table-column prop="username" label="操作人" width="100" />
        <el-table-column prop="realName" label="姓名" width="100" />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="actionType" label="操作类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getActionTypeTag(row.actionType)" size="small">
              {{ getActionTypeText(row.actionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="100" />
        <el-table-column prop="description" label="操作内容" min-width="200" />
        <el-table-column prop="result" label="结果" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getResultType(row.result)" size="small">
              {{ getResultText(row.result) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="日志详情"
      width="700px"
    >
      <el-descriptions :column="2" border v-if="currentLog">
        <el-descriptions-item label="操作时间">{{ currentLog.actionTime }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentLog.username }} ({{ currentLog.realName }})</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentLog.ip }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">
          <el-tag :type="getActionTypeTag(currentLog.actionType)" size="small">
            {{ getActionTypeText(currentLog.actionType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="模块">{{ currentLog.module }}</el-descriptions-item>
        <el-descriptions-item label="操作结果">
          <el-tag :type="getResultType(currentLog.result)" size="small">
            {{ getResultText(currentLog.result) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作内容" :span="2">{{ currentLog.description }}</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">
          <pre class="json-content">{{ currentLog.requestParams }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="响应结果" :span="2">
          <pre class="json-content">{{ currentLog.responseData }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="用户代理" :span="2">{{ currentLog.userAgent }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Delete, Document, Clock, Warning, CircleClose } from '@element-plus/icons-vue'

const statistics = reactive({
  total: 15860,
  today: 128,
  warning: 456,
  error: 23
})

const searchForm = reactive({
  username: '',
  actionType: '',
  module: '',
  dateRange: [] as any[],
  result: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 15860
})

const tableData = ref([
  { id: 1, actionTime: '2024-04-24 18:30:15', username: 'admin', realName: '系统管理员', ip: '192.168.1.100', actionType: 'login', module: '系统管理', description: '用户登录系统', result: 'success', requestParams: '{"username":"admin"}', responseData: '{"code":200,"msg":"登录成功","token":"abc123..."}', userAgent: 'Mozilla/5.0 Chrome/120.0.0.0' },
  { id: 2, actionTime: '2024-04-24 18:25:30', username: 'caiwu', realName: '财务主管', ip: '192.168.1.101', actionType: 'create', module: '发票管理', description: '开具销售发票，发票号：FP2024040001', result: 'success', requestParams: '{"customerId":1,"amount":100000}', responseData: '{"code":200,"invoiceId":"FP2024040001"}', userAgent: 'Mozilla/5.0 Chrome/120.0.0.0' },
  { id: 3, actionTime: '2024-04-24 18:20:45', username: 'zhangsan', realName: '张三', ip: '192.168.1.102', actionType: 'update', module: '客户档案', description: '修改客户信息：深圳市腾达科技有限公司', result: 'success', requestParams: '{"customerId":5,"name":"深圳市腾达科技有限公司"}', responseData: '{"code":200}', userAgent: 'Mozilla/5.0 Chrome/120.0.0.0' },
  { id: 4, actionTime: '2024-04-24 18:15:20', username: 'lisi', realName: '李四', ip: '192.168.1.103', actionType: 'approve', module: '应收管理', description: '审核应收单据，单据号：YS2024040012', result: 'success', requestParams: '{"invoiceId":"YS2024040012","approved":true}', responseData: '{"code":200}', userAgent: 'Mozilla/5.0 Chrome/120.0.0.0' },
  { id: 5, actionTime: '2024-04-24 18:10:00', username: 'wangwu', realName: '王五', ip: '192.168.1.104', actionType: 'delete', module: '基础设置', description: '删除费用类型：推广费', result: 'warning', requestParams: '{"expenseId":8}', responseData: '{"code":400,"msg":"该费用类型已被使用，无法删除"}', userAgent: 'Mozilla/5.0 Chrome/120.0.0.0' },
  { id: 6, actionTime: '2024-04-24 18:05:30', username: 'zhaoliu', realName: '赵六', ip: '192.168.1.105', actionType: 'export', module: '对账单', description: '导出客户对账单：2024年3月', result: 'success', requestParams: '{"customerId":3,"month":"2024-03"}', responseData: '{"code":200,"fileId":"exp_20240424_001"}', userAgent: 'Mozilla/5.0 Chrome/120.0.0.0' },
  { id: 7, actionTime: '2024-04-24 18:00:15', username: 'caiwu', realName: '财务主管', ip: '192.168.1.101', actionType: 'import', module: '基础设置', description: '导入客户档案数据', result: 'success', requestParams: '{"fileId":"imp_customer_20240424.xlsx"}', responseData: '{"code":200,"imported":50,"failed":2}', userAgent: 'Mozilla/5.0 Chrome/120.0.0.0' },
  { id: 8, actionTime: '2024-04-24 17:55:00', username: 'sunqi', realName: '孙七', ip: '192.168.1.106', actionType: 'query', module: '应收管理', description: '查询应收报表数据', result: 'success', requestParams: '{"startDate":"2024-04-01","endDate":"2024-04-24"}', responseData: '{"code":200,"total":1250000}', userAgent: 'Mozilla/5.0 Chrome/120.0.0.0' },
  { id: 9, actionTime: '2024-04-24 17:50:30', username: 'admin', realName: '系统管理员', ip: '192.168.1.100', actionType: 'update', module: '系统管理', description: '修改角色权限：财务主管', result: 'success', requestParams: '{"roleId":2,"permissions":["sys:user:view"]}', responseData: '{"code":200}', userAgent: 'Mozilla/5.0 Chrome/120.0.0.0' },
  { id: 10, actionTime: '2024-04-24 17:45:00', username: 'zhangsan', realName: '张三', ip: '192.168.1.102', actionType: 'create', module: '应付管理', description: '创建付款申请单：PY2024040005', result: 'error', requestParams: '{"supplierId":3,"amount":50000}', responseData: '{"code":500,"msg":"供应商余额不足"}', userAgent: 'Mozilla/5.0 Chrome/120.0.0.0' }
])

const showDetailDialog = ref(false)
const currentLog = ref<any>(null)

const getActionTypeTag = (type: string) => {
  const types: Record<string, string> = {
    create: 'success',
    update: 'warning',
    delete: 'danger',
    query: 'info',
    login: 'primary',
    logout: 'info',
    approve: 'success',
    export: 'warning',
    import: 'primary'
  }
  return types[type] || 'info'
}

const getActionTypeText = (type: string) => {
  const texts: Record<string, string> = {
    create: '新增',
    update: '编辑',
    delete: '删除',
    query: '查询',
    login: '登录',
    logout: '登出',
    approve: '审批',
    export: '导出',
    import: '导入'
  }
  return texts[type] || type
}

const getResultType = (result: string) => {
  const types: Record<string, string> = {
    success: 'success',
    fail: 'danger',
    warning: 'warning'
  }
  return types[result] || 'info'
}

const getResultText = (result: string) => {
  const texts: Record<string, string> = {
    success: '成功',
    fail: '失败',
    warning: '警告'
  }
  return texts[result] || result
}

const handleSearch = () => {
  ElMessage.success('搜索日志')
}

const handleReset = () => {
  searchForm.username = ''
  searchForm.actionType = ''
  searchForm.module = ''
  searchForm.dateRange = []
  searchForm.result = ''
  ElMessage.info('已重置搜索条件')
}

const handleViewDetail = (row: any) => {
  currentLog.value = row
  showDetailDialog.value = true
}

const handleExport = () => {
  ElMessage.success('导出日志')
}

const handleClean = () => {
  ElMessageBox.confirm('确定要清理过期日志吗？清理后无法恢复。', '清理日志', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('日志清理成功')
  }).catch(() => {})
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  ElMessage.success(`每页 ${val} 条`)
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  ElMessage.success(`跳转至第 ${val} 页`)
}
</script>

<style scoped>
.log-container {
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

.stat-icon.today {
  background: #f0f9eb;
  color: #67c23a;
}

.stat-icon.warning {
  background: #fdf6ec;
  color: #e6a23c;
}

.stat-icon.error {
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

.json-content {
  margin: 0;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  max-height: 150px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
