<template>
  <div class="document-log-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <span class="page-title">对接日志</span>
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

    <!-- 搜索筛选 -->
    <div class="search-panel">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="来源系统">
          <el-select v-model="searchForm.systemType" placeholder="请选择" clearable style="width: 120px">
            <el-option label="WMS" value="wms" />
            <el-option label="TMS" value="tms" />
            <el-option label="关务" value="customs" />
          </el-select>
        </el-form-item>
        <el-form-item label="单据类型">
          <el-select v-model="searchForm.documentType" placeholder="请选择" clearable style="width: 120px">
            <el-option label="入库单" value="inbound" />
            <el-option label="出库单" value="outbound" />
            <el-option label="运输单" value="transport" />
            <el-option label="报关单" value="declaration" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 100px">
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
            <el-option label="异常" value="error" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 340px"
          />
        </el-form-item>
        <el-form-item label="单据号">
          <el-input v-model="searchForm.documentNo" placeholder="请输入单据号" clearable style="width: 160px" />
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
        <el-table-column prop="logTime" label="日志时间" width="160" />
        <el-table-column prop="systemType" label="来源系统" width="80">
          <template #default="{ row }">
            <el-tag size="small">{{ getSystemTypeText(row.systemType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="documentNo" label="单据号" width="150" />
        <el-table-column prop="documentType" label="单据类型" width="100">
          <template #default="{ row }">
            {{ getDocumentTypeText(row.documentType) }}
          </template>
        </el-table-column>
        <el-table-column prop="action" label="操作" width="100" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="耗时" width="80" align="center">
          <template #default="{ row }">
            {{ row.duration }}ms
          </template>
        </el-table-column>
        <el-table-column prop="message" label="日志信息" min-width="300" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[20, 50, 100, 200]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer v-model="showDetailDrawer" title="日志详情" size="800px">
      <template #default>
        <el-descriptions :column="2" border v-if="currentLog">
          <el-descriptions-item label="日志时间">{{ currentLog.logTime }}</el-descriptions-item>
          <el-descriptions-item label="来源系统">{{ getSystemTypeText(currentLog.systemType) }}</el-descriptions-item>
          <el-descriptions-item label="单据号">{{ currentLog.documentNo }}</el-descriptions-item>
          <el-descriptions-item label="单据类型">{{ getDocumentTypeText(currentLog.documentType) }}</el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag :type="getStatusType(currentLog.status)" size="small">
              {{ getStatusText(currentLog.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理耗时">{{ currentLog.duration }}ms</el-descriptions-item>
        </el-descriptions>
        <el-divider content-position="left">请求参数</el-divider>
        <pre class="code-block">{{ currentLog.requestData }}</pre>
        <el-divider content-position="left">响应结果</el-divider>
        <pre class="code-block">{{ currentLog.responseData }}</pre>
        <el-divider content-position="left">完整日志</el-divider>
        <pre class="code-block">{{ currentLog.fullLog }}</pre>
      </template>
      <template #footer>
        <el-button @click="showDetailDrawer = false">关闭</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Delete } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  systemType: '',
  documentType: '',
  status: '',
  dateRange: [],
  documentNo: ''
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    logTime: '2026-04-26 10:30:25',
    systemType: 'wms',
    documentNo: 'WMS20260426001',
    documentType: 'inbound',
    action: '订单同步',
    status: 'success',
    duration: 125,
    message: '订单同步成功，生成业务单据',
    requestData: '{"order_no":"WMS20260426001","order_type":"inbound","customer_code":"KH001","complete_time":"2026-04-26 10:30:00"}',
    responseData: '{"code":200,"message":"success","data":{"bill_id":"BILL2026040001"}}',
    fullLog: '[10:30:25] 开始处理WMS订单同步\n[10:30:25] 校验字段完整性: 通过\n[10:30:25] 匹配客户编码: KH001\n[10:30:25] 匹配业务类型: 仓储入库\n[10:30:25] 生成业务单据: BILL2026040001\n[10:30:25] 触发计费规则匹配\n[10:30:25] 匹配报价单: QT2026040001\n[10:30:25] 生成费率单: RATE2026040001\n[10:30:25] 处理完成，耗时125ms'
  },
  {
    id: 2,
    logTime: '2026-04-26 10:28:15',
    systemType: 'tms',
    documentNo: 'TMS20260426002',
    documentType: 'transport',
    action: '运输单同步',
    status: 'success',
    duration: 230,
    message: '运输单同步成功，已生成费率单',
    requestData: '{"order_no":"TMS20260426002","weight":"5000","volume":"20"}',
    responseData: '{"code":200,"message":"success"}',
    fullLog: '[10:28:15] 开始处理TMS运输单同步'
  },
  {
    id: 3,
    logTime: '2026-04-26 10:25:00',
    systemType: 'wms',
    documentNo: 'WMS20260425008',
    documentType: 'outbound',
    action: '订单同步',
    status: 'failed',
    duration: 50,
    message: '客户编码不存在，订单同步失败',
    requestData: '{"order_no":"WMS20260425008","customer_code":"INVALID"}',
    responseData: '{"code":400,"message":"客户编码不存在"}',
    fullLog: '[10:25:00] 开始处理WMS订单同步\n[10:25:00] 校验字段完整性: 通过\n[10:25:00] 匹配客户编码: INVALID - 失败\n[10:25:00] 错误: 客户编码不存在\n[10:25:00] 处理失败，耗时50ms'
  }
])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 3
})

// 详情抽屉
const showDetailDrawer = ref(false)
const currentLog = ref<any>(null)

// 方法
const getSystemTypeText = (type: string) => {
  const texts: Record<string, string> = {
    wms: 'WMS',
    tms: 'TMS',
    customs: '关务'
  }
  return texts[type] || type
}

const getDocumentTypeText = (type: string) => {
  const texts: Record<string, string> = {
    inbound: '入库单',
    outbound: '出库单',
    transport: '运输单',
    declaration: '报关单'
  }
  return texts[type] || type
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    success: 'success',
    failed: 'danger',
    error: 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    success: '成功',
    failed: '失败',
    error: '异常'
  }
  return texts[status] || status
}

const handleSearch = () => {
  ElMessage.success('搜索日志')
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    ;(searchForm as any)[key] = key === 'dateRange' ? [] : ''
  })
  ElMessage.info('已重置搜索条件')
}

const handleViewDetail = (row: any) => {
  currentLog.value = row
  showDetailDrawer.value = true
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.page = 1
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
}

const handleExport = () => {
  ElMessage.success('导出日志')
}

const handleClean = () => {
  ElMessage.info('清理日志功能')
}
</script>

<style scoped>
.document-log-container {
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
  max-height: 200px;
  overflow-y: auto;
}
</style>