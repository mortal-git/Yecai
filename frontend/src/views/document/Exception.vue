<template>
  <div class="document-exception-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <span class="page-title">异常单据</span>
        <el-tag type="danger" effect="plain">{{ pagination.total }} 条待处理</el-tag>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleBatchRetry">
          <el-icon><Refresh /></el-icon>
          批量重试
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
            <div class="stat-icon total"><el-icon><Warning /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">异常总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon noQuote"><el-icon><Document /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.noQuote }}</div>
              <div class="stat-label">无生效报价</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon ruleError"><el-icon><Setting /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.ruleError }}</div>
              <div class="stat-label">规则配置异常</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon dataError"><el-icon><CircleClose /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.dataError }}</div>
              <div class="stat-label">数据校验失败</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-panel">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="异常类型">
          <el-select v-model="searchForm.exceptionType" placeholder="请选择" clearable style="width: 140px">
            <el-option label="无生效报价" value="no_quote" />
            <el-option label="规则配置异常" value="rule_error" />
            <el-option label="数据校验失败" value="data_error" />
            <el-option label="接口调用失败" value="api_error" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源系统">
          <el-select v-model="searchForm.systemType" placeholder="请选择" clearable style="width: 100px">
            <el-option label="WMS" value="wms" />
            <el-option label="TMS" value="tms" />
            <el-option label="关务" value="customs" />
          </el-select>
        </el-form-item>
        <el-form-item label="单据号">
          <el-input v-model="searchForm.documentNo" placeholder="请输入单据号" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="异常时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 340px"
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
      <el-table :data="tableData" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="exceptionTime" label="异常时间" width="160" />
        <el-table-column prop="documentNo" label="单据号" width="150" />
        <el-table-column prop="systemType" label="来源系统" width="80">
          <template #default="{ row }">
            <el-tag size="small">{{ getSystemTypeText(row.systemType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="documentType" label="单据类型" width="100">
          <template #default="{ row }">
            {{ getDocumentTypeText(row.documentType) }}
          </template>
        </el-table-column>
        <el-table-column prop="exceptionType" label="异常类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getExceptionTypeTag(row.exceptionType)" size="small">
              {{ getExceptionTypeText(row.exceptionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="exceptionReason" label="异常原因" min-width="200" />
        <el-table-column prop="retryCount" label="重试次数" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.retryCount >= 3" type="danger" size="small">{{ row.retryCount }}</el-tag>
            <span v-else>{{ row.retryCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'pending' ? 'warning' : 'info'" size="small">
              {{ row.status === 'pending' ? '待处理' : '已处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">详情</el-button>
            <el-button type="primary" link size="small" @click="handleRetry(row)">重试</el-button>
            <el-button type="success" link size="small" @click="handleIgnore(row)">忽略</el-button>
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
    <el-drawer v-model="showDetailDrawer" title="异常单据详情" size="800px">
      <template #default>
        <div class="detail-content" v-if="currentException">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="单据号">{{ currentException.documentNo }}</el-descriptions-item>
            <el-descriptions-item label="来源系统">{{ getSystemTypeText(currentException.systemType) }}</el-descriptions-item>
            <el-descriptions-item label="单据类型">{{ getDocumentTypeText(currentException.documentType) }}</el-descriptions-item>
            <el-descriptions-item label="异常类型">
              <el-tag :type="getExceptionTypeTag(currentException.exceptionType)" size="small">
                {{ getExceptionTypeText(currentException.exceptionType) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="异常时间">{{ currentException.exceptionTime }}</el-descriptions-item>
            <el-descriptions-item label="重试次数">{{ currentException.retryCount }}</el-descriptions-item>
          </el-descriptions>

          <el-divider content-position="left">异常详情</el-divider>
          <el-alert type="error" :title="currentException.exceptionReason" show-icon :closable="false" />

          <el-divider content-position="left">原始数据</el-divider>
          <pre class="code-block">{{ currentException.originalData }}</pre>

          <el-divider content-position="left">处理建议</el-divider>
          <div class="suggestion">
            <p v-if="currentException.exceptionType === 'no_quote'">
              <el-icon><Warning /></el-icon> 请为该客户创建并审核通过报价单后，重新执行计费
            </p>
            <p v-else-if="currentException.exceptionType === 'rule_error'">
              <el-icon><Setting /></el-icon> 请检查相关计费规则配置是否正确
            </p>
            <p v-else>
              <el-icon><InfoFilled /></el-icon> 请检查数据完整性后重新提交
            </p>
          </div>
        </div>
      </template>
      <template #footer>
        <el-button @click="showDetailDrawer = false">关闭</el-button>
        <el-button type="primary" @click="handleRetry(currentException)">立即重试</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download, Warning, Document, Setting, CircleClose, InfoFilled } from '@element-plus/icons-vue'

// 统计数据
const statistics = reactive({
  total: 28,
  noQuote: 12,
  ruleError: 8,
  dataError: 5,
  apiError: 3
})

// 搜索表单
const searchForm = reactive({
  exceptionType: '',
  systemType: '',
  documentNo: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    exceptionTime: '2026-04-26 10:25:00',
    documentNo: 'WMS20260426001',
    systemType: 'wms',
    documentType: 'inbound',
    exceptionType: 'no_quote',
    exceptionReason: '客户编码KH999无生效报价单，无法生成费率单',
    retryCount: 2,
    status: 'pending',
    originalData: '{"order_no":"WMS20260426001","customer_code":"KH999","order_type":"inbound"}'
  },
  {
    id: 2,
    exceptionTime: '2026-04-26 10:20:00',
    documentNo: 'TMS20260426003',
    systemType: 'tms',
    documentType: 'transport',
    exceptionType: 'rule_error',
    exceptionReason: '计费规则R002配置异常，缺少必填字段unitPrice',
    retryCount: 3,
    status: 'pending',
    originalData: '{"order_no":"TMS20260426003","weight":"5000"}'
  },
  {
    id: 3,
    exceptionTime: '2026-04-26 10:15:00',
    documentNo: 'WMS20260425015',
    systemType: 'wms',
    documentType: 'outbound',
    exceptionType: 'data_error',
    exceptionReason: '业务完成时间字段缺失，数据校验不通过',
    retryCount: 1,
    status: 'pending',
    originalData: '{"order_no":"WMS20260425015","customer_code":"KH001"}'
  }
])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 3
})

// 选中行
const selectedRows = ref<any[]>([])

// 详情抽屉
const showDetailDrawer = ref(false)
const currentException = ref<any>(null)

// 方法
const getSystemTypeText = (type: string) => {
  const texts: Record<string, string> = { wms: 'WMS', tms: 'TMS', customs: '关务' }
  return texts[type] || type
}

const getDocumentTypeText = (type: string) => {
  const texts: Record<string, string> = {
    inbound: '入库单', outbound: '出库单', transport: '运输单', declaration: '报关单'
  }
  return texts[type] || type
}

const getExceptionTypeText = (type: string) => {
  const texts: Record<string, string> = {
    no_quote: '无生效报价', rule_error: '规则异常', data_error: '数据校验', api_error: '接口失败'
  }
  return texts[type] || type
}

const getExceptionTypeTag = (type: string) => {
  const tags: Record<string, string> = {
    no_quote: 'warning', rule_error: 'danger', data_error: 'info', api_error: 'warning'
  }
  return tags[type] || 'info'
}

const handleSearch = () => {
  ElMessage.success('搜索异常单据')
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    ;(searchForm as any)[key] = key === 'dateRange' ? [] : ''
  })
  ElMessage.info('已重置搜索条件')
}

const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

const handleView = (row: any) => {
  currentException.value = row
  showDetailDrawer.value = true
}

const handleRetry = (row: any) => {
  ElMessage.success(`已提交重试: ${row?.documentNo || '选中单据'}`)
  showDetailDrawer.value = false
}

const handleIgnore = (row: any) => {
  ElMessage.info(`已忽略: ${row.documentNo}`)
}

const handleBatchRetry = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要重试的单据')
    return
  }
  ElMessage.success(`已提交 ${selectedRows.value.length} 条单据重试`)
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.page = 1
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
}

const handleExport = () => {
  ElMessage.success('导出异常单据')
}
</script>

<style scoped>
.document-exception-container {
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
  gap: 12px;
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

.stat-icon.total { background: #fef0f0; color: #f56c6c; }
.stat-icon.noQuote { background: #fdf6ec; color: #e6a23c; }
.stat-icon.ruleError { background: #fff0f0; color: #f56c6c; }
.stat-icon.dataError { background: #ecf5ff; color: #909399; }

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

.code-block {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
}

.suggestion {
  background: #f0f9eb;
  padding: 16px;
  border-radius: 4px;
  color: #67c23a;
}

.suggestion p {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>