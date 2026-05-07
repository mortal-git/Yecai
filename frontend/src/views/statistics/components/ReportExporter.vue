<template>
  <div class="report-exporter">
    <!-- 已生成的报表列表 -->
    <div class="report-list">
      <div class="section-header">
        <h3>已生成的报表</h3>
        <div class="header-actions">
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <div class="filter-panel">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="报表名称">
            <el-input v-model="filterForm.name" placeholder="请输入报表名称" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="客户">
            <el-select v-model="filterForm.customerId" placeholder="请选择客户" clearable style="width: 180px">
              <el-option label="全部" value="" />
              <el-option label="北京科技有限公司" value="beijing" />
              <el-option label="上海贸易有限公司" value="shanghai" />
              <el-option label="广州电子有限公司" value="guangzhou" />
            </el-select>
          </el-form-item>
          <el-form-item label="报表周期">
            <el-date-picker
              v-model="filterForm.period"
              type="month"
              placeholder="请选择月份"
              value-format="YYYY-MM"
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="reportList" v-loading="loading" border stripe>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="name" label="报表名称" min-width="200" />
        <el-table-column prop="customerName" label="客户" width="150" />
        <el-table-column prop="templateName" label="使用模板" width="180" />
        <el-table-column prop="period" label="报表周期" width="120" />
        <el-table-column prop="orderCount" label="订单数" width="80" />
        <el-table-column prop="totalAmount" label="总金额" width="130" :formatter="formatMoney" />
        <el-table-column prop="createTime" label="生成时间" width="160" />
        <el-table-column prop="creator" label="生成人" width="100" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" link @click="handlePreview(scope.row)">预览</el-button>
            <el-button type="success" size="small" link @click="handleExport(scope.row)">导出</el-button>
            <el-button type="info" size="small" link @click="handleShare(scope.row)">分享</el-button>
            <el-dropdown @command="(cmd) => handleMoreAction(cmd, scope.row)">
              <template #default>
                <el-button type="warning" size="small" link>更多</el-button>
              </template>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="rename">重命名</el-dropdown-item>
                  <el-dropdown-item command="copy">复制报表</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 导出设置对话框 -->
    <el-dialog v-model="exportDialogVisible" title="导出报表" width="500px">
      <el-form :model="exportForm" label-width="100px">
        <el-form-item label="报表名称">
          <span>{{ currentReport?.name }}</span>
        </el-form-item>
        <el-form-item label="导出格式" required>
          <el-radio-group v-model="exportForm.format">
            <el-radio label="xlsx">Excel (.xlsx)</el-radio>
            <el-radio label="xls">Excel 97-2003 (.xls)</el-radio>
            <el-radio label="csv">CSV (.csv)</el-radio>
            <el-radio label="pdf">PDF (.pdf)</el-radio>
            <el-radio label="wps">WPS (.et)</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="导出内容">
          <el-checkbox-group v-model="exportForm.includeOptions">
            <el-checkbox label="data">报表数据</el-checkbox>
            <el-checkbox label="chart">图表</el-checkbox>
            <el-checkbox label="remark">备注</el-checkbox>
            <el-checkbox label="style">表格样式</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="文件名">
          <el-input v-model="exportForm.fileName" placeholder="请输入文件名" style="width: 250px" />
        </el-form-item>
        <el-form-item label="导出范围">
          <el-radio-group v-model="exportForm.range">
            <el-radio label="all">全部数据</el-radio>
            <el-radio label="current">当前页</el-radio>
            <el-radio label="selected">选中数据</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmExport">
          <el-icon><Download /></el-icon>
          确认导出
        </el-button>
      </template>
    </el-dialog>

    <!-- 分享对话框 -->
    <el-dialog v-model="shareDialogVisible" title="分享报表" width="600px">
      <el-tabs v-model="shareTab" class="share-tabs">
        <el-tab-pane label="内部消息" name="internal">
          <el-form label-width="100px">
            <el-form-item label="发送给">
              <el-select v-model="shareForm.receivers" multiple placeholder="请选择接收人" style="width: 100%">
                <el-option label="张三" value="zhangsan" />
                <el-option label="李四" value="lisi" />
                <el-option label="王五" value="wangwu" />
                <el-option label="赵六" value="zhaoliu" />
              </el-select>
            </el-form-item>
            <el-form-item label="附加消息">
              <el-input v-model="shareForm.message" type="textarea" :rows="3" placeholder="请输入附加消息" />
            </el-form-item>
            <el-form-item label="查看权限">
              <el-radio-group v-model="shareForm.permission">
                <el-radio label="view">仅查看</el-radio>
                <el-radio label="edit">可编辑</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="邮件分享" name="email">
          <el-form label-width="100px">
            <el-form-item label="收件人邮箱">
              <el-input v-model="shareForm.email" placeholder="请输入邮箱地址，多个用逗号分隔" />
            </el-form-item>
            <el-form-item label="邮件主题">
              <el-input v-model="shareForm.emailSubject" :placeholder="'报表分享：' + currentReport?.name" />
            </el-form-item>
            <el-form-item label="邮件内容">
              <el-input v-model="shareForm.emailContent" type="textarea" :rows="4" placeholder="请输入邮件内容" />
            </el-form-item>
            <el-form-item label="附件格式">
              <el-select v-model="shareForm.attachmentFormat" style="width: 150px">
                <el-option label="Excel (.xlsx)" value="xlsx" />
                <el-option label="PDF (.pdf)" value="pdf" />
                <el-option label="CSV (.csv)" value="csv" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="链接分享" name="link">
          <el-form label-width="100px">
            <el-form-item label="分享链接">
              <el-input v-model="shareForm.link" readonly style="width: 350px">
                <template #append>
                  <el-button @click="handleCopyLink">复制</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="链接有效期">
              <el-select v-model="shareForm.linkExpiry" style="width: 200px">
                <el-option label="24小时" value="24h" />
                <el-option label="7天" value="7d" />
                <el-option label="30天" value="30d" />
                <el-option label="永久有效" value="never" />
              </el-select>
            </el-form-item>
            <el-form-item label="访问密码">
              <el-switch v-model="shareForm.enablePassword" />
              <el-input v-model="shareForm.password" placeholder="请输入访问密码" style="width: 150px; margin-left: 10px" v-if="shareForm.enablePassword" />
            </el-form-item>
            <el-form-item label="查看权限">
              <el-radio-group v-model="shareForm.linkPermission">
                <el-radio label="view">仅查看</el-radio>
                <el-radio label="edit">可编辑</el-radio>
                <el-radio label="none">无权限</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="shareDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmShare">确认分享</el-button>
      </template>
    </el-dialog>

    <!-- 分享记录 -->
    <div class="share-history">
      <el-card shadow="never">
        <template #header>
          <span><strong>分享记录</strong></span>
        </template>
        <el-table :data="shareHistory" border stripe>
          <el-table-column prop="reportName" label="报表名称" width="200" />
          <el-table-column prop="shareType" label="分享方式" width="100" :formatter="formatShareType" />
          <el-table-column prop="receiver" label="接收人" width="120" />
          <el-table-column prop="shareTime" label="分享时间" width="160" />
          <el-table-column prop="status" label="状态" width="100" :formatter="formatShareStatus" />
          <el-table-column prop="viewTime" label="查看时间" width="160" />
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button type="primary" size="small" link>详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Search, Download } from '@element-plus/icons-vue'

const loading = ref(false)
const exportDialogVisible = ref(false)
const shareDialogVisible = ref(false)
const shareTab = ref('internal')

const filterForm = reactive({
  name: '',
  customerId: '',
  period: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const exportForm = reactive({
  format: 'xlsx',
  includeOptions: ['data', 'style'],
  fileName: '',
  range: 'all'
})

const shareForm = reactive({
  receivers: [] as string[],
  message: '',
  permission: 'view',
  email: '',
  emailSubject: '',
  emailContent: '',
  attachmentFormat: 'xlsx',
  link: 'https://report.example.com/share/abc123xyz',
  linkExpiry: '7d',
  enablePassword: false,
  password: '',
  linkPermission: 'view'
})

const currentReport = ref<any>(null)

const reportList = ref([
  { id: 1, name: '北京科技2026年3月订单报表', customerName: '北京科技有限公司', templateName: '北京科技月度订单报表模板', period: '2026-03', orderCount: 256, totalAmount: 1258000, createTime: '2026-03-20 14:30:00', creator: '张三' },
  { id: 2, name: '北京科技2026年2月订单报表', customerName: '北京科技有限公司', templateName: '北京科技月度订单报表模板', period: '2026-02', orderCount: 230, totalAmount: 1180000, createTime: '2026-02-20 10:20:00', creator: '张三' },
  { id: 3, name: '上海贸易2026年3月对账报表', customerName: '上海贸易有限公司', templateName: '上海贸易月度对账模板', period: '2026-03', orderCount: 180, totalAmount: 890000, createTime: '2026-03-19 16:45:00', creator: '李四' },
  { id: 4, name: '广州电子2026年Q1季度报表', customerName: '广州电子有限公司', templateName: '广州电子季度报表模板', period: '2026-Q1', orderCount: 520, totalAmount: 2560000, createTime: '2026-03-15 09:00:00', creator: '王五' },
  { id: 5, name: '深圳信息2026年2月订单报表', customerName: '深圳信息技术有限公司', templateName: '深圳信息年度汇总模板', period: '2026-02', orderCount: 145, totalAmount: 680000, createTime: '2026-02-25 11:30:00', creator: '赵六' }
])

pagination.total = reportList.value.length

const shareHistory = ref([
  { id: 1, reportName: '北京科技2026年3月订单报表', shareType: 'internal', receiver: '张三', shareTime: '2026-03-20 15:00:00', status: 'viewed', viewTime: '2026-03-20 16:30:00' },
  { id: 2, reportName: '北京科技2026年3月订单报表', shareType: 'email', receiver: 'client@example.com', shareTime: '2026-03-20 15:05:00', status: 'viewed', viewTime: '2026-03-20 18:20:00' },
  { id: 3, reportName: '上海贸易2026年3月对账报表', shareType: 'link', receiver: '链接分享', shareTime: '2026-03-19 17:00:00', status: 'pending', viewTime: '-' },
  { id: 4, reportName: '广州电子2026年Q1季度报表', shareType: 'internal', receiver: '王五', shareTime: '2026-03-15 10:00:00', status: 'viewed', viewTime: '2026-03-15 14:00:00' }
])

const formatMoney = (row: any) => {
  return '¥' + row.totalAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

const formatShareType = (row: any) => {
  const map: Record<string, string> = { internal: '内部消息', email: '邮件', link: '链接' }
  return map[row.shareType] || row.shareType
}

const formatShareStatus = (row: any) => {
  const map: Record<string, string> = { viewed: '已查看', pending: '待查看', expired: '已过期' }
  return map[row.status] || row.status
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

const handlePreview = (row: any) => {
  ElMessage.info('预览功能开发中')
}

const handleExport = (row: any) => {
  currentReport.value = row
  exportForm.fileName = row.name
  exportDialogVisible.value = true
}

const handleShare = (row: any) => {
  currentReport.value = row
  shareDialogVisible.value = true
}

const handleMoreAction = (command: string, row: any) => {
  switch (command) {
    case 'rename':
      ElMessage.info('重命名功能开发中')
      break
    case 'copy':
      ElMessage.success('报表复制成功')
      break
    case 'delete':
      ElMessage.success('报表删除成功')
      break
  }
}

const handleConfirmExport = () => {
  ElMessage.success(`报表正在导出为 ${exportForm.format.toUpperCase()} 格式...`)
  exportDialogVisible.value = false
}

const handleCopyLink = () => {
  navigator.clipboard.writeText(shareForm.link)
  ElMessage.success('链接已复制到剪贴板')
}

const handleConfirmShare = () => {
  ElMessage.success('分享成功')
  shareDialogVisible.value = false
}
</script>

<style scoped>
.report-exporter {
  padding: 0;
}

.report-list {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #303133;
}

.filter-panel {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #eee;
  margin-top: 20px;
}

.share-history {
  margin-top: 30px;
}

.share-tabs :deep(.el-tabs__content) {
  padding: 20px 0;
}
</style>
