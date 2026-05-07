<template>
  <div class="operation-log">
    <!-- 操作类型统计 -->
    <div class="stats-row">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <el-icon :size="24"><Upload /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.templateOps }}</div>
              <div class="stat-label">模板操作</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <el-icon :size="24"><Connection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.mappingOps }}</div>
              <div class="stat-label">映射配置</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <el-icon :size="24"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.reportOps }}</div>
              <div class="stat-label">报表生成</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              <el-icon :size="24"><Download /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.exportOps }}</div>
              <div class="stat-label">导出分享</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选查询 -->
    <div class="filter-panel">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 280px"
          />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="filterForm.operationType" placeholder="请选择" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="模板导入" value="template_import" />
            <el-option label="模板编辑" value="template_edit" />
            <el-option label="模板删除" value="template_delete" />
            <el-option label="映射配置" value="mapping_config" />
            <el-option label="报表生成" value="report_generate" />
            <el-option label="报表导出" value="report_export" />
            <el-option label="报表分享" value="report_share" />
            <el-option label="权限分配" value="permission_assign" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人">
          <el-select v-model="filterForm.operator" placeholder="请选择" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="张三" value="zhangsan" />
            <el-option label="李四" value="lisi" />
            <el-option label="王五" value="wangwu" />
            <el-option label="赵六" value="zhaoliu" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="请输入关键词" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作日志列表 -->
    <div class="log-table">
      <el-table :data="logList" v-loading="loading" border stripe>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="timestamp" label="操作时间" width="160" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="operationType" label="操作类型" width="120" :formatter="formatOperationType" />
        <el-table-column prop="target" label="操作对象" min-width="200" />
        <el-table-column prop="detail" label="操作详情" min-width="300" />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button type="primary" size="small" link @click="handleViewDetail(scope.row)">详情</el-button>
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

    <!-- 日志详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="操作日志详情" width="700px">
      <el-descriptions :column="2" border v-if="currentLog">
        <el-descriptions-item label="操作时间" :span="2">{{ currentLog.timestamp }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentLog.operator }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">{{ formatOperationType(currentLog) }}</el-descriptions-item>
        <el-descriptions-item label="操作对象" :span="2">{{ currentLog.target }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentLog.ip }}</el-descriptions-item>
        <el-descriptions-item label="浏览器">{{ currentLog.browser }}</el-descriptions-item>
        <el-descriptions-item label="操作详情" :span="2">
          <div class="detail-content">
            <pre>{{ currentLog.detail }}</pre>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="变更前" :span="2" v-if="currentLog.beforeValue">
          <pre class="before-value">{{ currentLog.beforeValue }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="变更后" :span="2" v-if="currentLog.afterValue">
          <pre class="after-value">{{ currentLog.afterValue }}</pre>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 操作趋势图 -->
    <div class="trend-chart">
      <el-card shadow="never">
        <template #header>
          <span><strong>操作趋势（近30天）</strong></span>
        </template>
        <div class="chart-placeholder">
          <el-empty description="图表区域" :image-size="100">
            <template #image>
              <el-icon :size="60" color="#909399"><DataLine /></el-icon>
            </template>
          </el-empty>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Upload, Connection, Document, Download, DataLine } from '@element-plus/icons-vue'

const loading = ref(false)
const detailDialogVisible = ref(false)
const currentLog = ref<any>(null)

const stats = reactive({
  templateOps: 156,
  mappingOps: 89,
  reportOps: 234,
  exportOps: 178
})

const filterForm = reactive({
  dateRange: [] as string[],
  operationType: '',
  operator: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const logList = ref([
  { id: 1, timestamp: '2026-03-20 14:35:22', operator: '张三', operationType: 'template_import', target: '北京科技月度订单报表模板', detail: '上传并导入了新的Excel模板文件（beijing_template_v3.xlsx），AI自动识别了5个表头字段和3个数据区域', ip: '192.168.1.100', browser: 'Chrome 120.0', beforeValue: null, afterValue: null },
  { id: 2, timestamp: '2026-03-20 14:28:15', operator: '张三', operationType: 'mapping_config', target: '北京科技月度报表映射配置', detail: '修改了字段映射关系，将"订单金额"映射到"orderAmount"字段，添加了"保留2位小数"的数据处理规则', ip: '192.168.1.100', browser: 'Chrome 120.0', beforeValue: '{"templateField":"订单金额","systemField":"paidAmount"}', afterValue: '{"templateField":"订单金额","systemField":"orderAmount","transform":"fixed2"}' },
  { id: 3, timestamp: '2026-03-20 11:20:08', operator: '李四', operationType: 'report_generate', target: '上海贸易2026年3月对账报表', detail: '使用模板"上海贸易月度对账模板"生成了2026年3月的月度报表，共提取180条订单数据，合计金额890,000元', ip: '192.168.1.105', browser: 'Firefox 121.0', beforeValue: null, afterValue: null },
  { id: 4, timestamp: '2026-03-20 10:45:33', operator: '李四', operationType: 'report_export', target: '北京科技2026年2月订单报表', detail: '导出了报表为Excel格式（.xlsx），包含报表数据、图表和备注，文件保存至本地', ip: '192.168.1.105', browser: 'Firefox 121.0', beforeValue: null, afterValue: null },
  { id: 5, timestamp: '2026-03-20 10:30:00', operator: '王五', operationType: 'report_share', target: '广州电子2026年Q1季度报表', detail: '生成了分享链接，有效期7天，访问权限设置为"仅查看"，已发送邮件通知收件人', ip: '192.168.1.110', browser: 'Safari 17.0', beforeValue: null, afterValue: null },
  { id: 6, timestamp: '2026-03-19 16:20:45', operator: '王五', operationType: 'template_edit', target: '广州电子季度报表模板', detail: '更新了模板表头字段，添加了"订单状态"和"预计交付日期"两个字段', ip: '192.168.1.110', browser: 'Safari 17.0', beforeValue: '{"headerFields":["客户名称","订单号","下单时间","订单金额","已付金额"]}', afterValue: '{"headerFields":["客户名称","订单号","下单时间","订单金额","已付金额","订单状态","预计交付日期"]}' },
  { id: 7, timestamp: '2026-03-19 15:10:22', operator: '赵六', operationType: 'permission_assign', target: 'AI表格功能权限', detail: '为用户"李四"分配了AI表格的"模板管理"和"报表生成"权限', ip: '192.168.1.115', browser: 'Chrome 120.0', beforeValue: '{"user":"李四","permissions":[]}', afterValue: '{"user":"李四","permissions":["template_manage","report_generate"]}' },
  { id: 8, timestamp: '2026-03-19 14:05:10', operator: '张三', operationType: 'template_delete', target: '深圳信息年度汇总模板', detail: '删除了模板文件，原因是客户更换了模板格式，删除前已自动备份到历史版本', ip: '192.168.1.100', browser: 'Chrome 120.0', beforeValue: null, afterValue: null },
  { id: 9, timestamp: '2026-03-18 11:30:00', operator: '李四', operationType: 'report_generate', target: '北京科技2026年2月订单报表', detail: '批量生成了2026年1月至2月的月度报表，共2份，使用了"北京科技月度报表映射配置"', ip: '192.168.1.105', browser: 'Firefox 121.0', beforeValue: null, afterValue: null },
  { id: 10, timestamp: '2026-03-18 10:15:30', operator: '王五', operationType: 'mapping_config', target: '广州电子季度报表映射配置', detail: '创建了新的映射配置，包含8个字段映射，其中5个由AI自动推荐，3个手动配置', ip: '192.168.1.110', browser: 'Safari 17.0', beforeValue: null, afterValue: null }
])

pagination.total = logList.value.length

const formatOperationType = (row: any) => {
  const map: Record<string, string> = {
    'template_import': '模板导入',
    'template_edit': '模板编辑',
    'template_delete': '模板删除',
    'mapping_config': '映射配置',
    'report_generate': '报表生成',
    'report_export': '报表导出',
    'report_share': '报表分享',
    'permission_assign': '权限分配'
  }
  return map[row.operationType] || row.operationType
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('搜索完成')
  }, 500)
}

const handleReset = () => {
  Object.assign(filterForm, {
    dateRange: [],
    operationType: '',
    operator: '',
    keyword: ''
  })
  handleSearch()
}

const handleViewDetail = (row: any) => {
  currentLog.value = row
  detailDialogVisible.value = true
}
</script>

<style scoped>
.operation-log {
  padding: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.filter-panel {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.log-table {
  background: #fff;
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

.detail-content pre,
.before-value,
.after-value {
  margin: 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.before-value {
  background: #fff5f5;
  color: #f56c6c;
}

.after-value {
  background: #f0f9eb;
  color: #67c23a;
}

.trend-chart {
  margin-top: 20px;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
}
</style>
