<template>
  <div class="statement-list-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <span class="page-title">对账单列表</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          生成对账单
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
            <div class="stat-icon total"><el-icon><Document /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">对账单总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon pending"><el-icon><Clock /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.pending }}</div>
              <div class="stat-label">待核对</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon confirmed"><el-icon><CircleCheck /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.confirmed }}</div>
              <div class="stat-label">已确认</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon差异"><el-icon><Warning /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.hasDifference }}</div>
              <div class="stat-label">有差异</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-panel">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="对账单号">
          <el-input
            v-model="searchForm.statementNo"
            placeholder="请输入对账单号"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="客户/供应商">
          <el-select
            v-model="searchForm.partyType"
            placeholder="请选择"
            clearable
            style="width: 120px"
          >
            <el-option label="客户" value="customer" />
            <el-option label="供应商" value="supplier" />
          </el-select>
        </el-form-item>
        <el-form-item label="对方名称">
          <el-select
            v-model="searchForm.partyId"
            placeholder="请选择"
            clearable
            filterable
            style="width: 200px"
          >
            <el-option
              v-for="party in partyList"
              :key="party.id"
              :label="party.name"
              :value="party.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 140px">
            <el-option label="待核对" value="pending" />
            <el-option label="核对中" value="checking" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="有差异" value="difference" />
            <el-option label="已发送" value="sent" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
        <el-form-item label="对账期间">
          <el-date-picker
            v-model="searchForm.period"
            type="month"
            placeholder="选择月份"
            value-format="YYYY-MM"
            style="width: 140px"
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
      <el-table
        ref="tableRef"
        :data="tableData"
        border
        stripe
        @row-click="handleRowClick"
      >
        <el-table-column prop="statementNo" label="对账单号" width="160" fixed />
        <el-table-column prop="partyType" label="类型" width="80">
          <template #default="{ row }">
            {{ row.partyType === 'customer' ? '客户' : '供应商' }}
          </template>
        </el-table-column>
        <el-table-column prop="partyName" label="对方名称" min-width="160" />
        <el-table-column prop="period" label="对账期间" width="100" />
        <el-table-column prop="ourAmount" label="我方金额" width="120" align="right">
          <template #default="{ row }">¥{{ row.ourAmount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="theirAmount" label="对方金额" width="120" align="right">
          <template #default="{ row }">¥{{ row.theirAmount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="difference" label="差异金额" width="120" align="right">
          <template #default="{ row }">
            <span :class="{ 'difference-zero': row.difference === 0, 'difference-nonzero': row.difference !== 0 }">
              ¥{{ row.difference.toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="confirmTime" label="确认时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click.stop="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="primary"
              link
              size="small"
              @click.stop="handleCheck(row)"
            >
              核对
            </el-button>
            <el-button
              v-if="row.status === 'checking' || row.status === 'difference'"
              type="primary"
              link
              size="small"
              @click.stop="handleConfirm(row)"
            >
              确认
            </el-button>
            <el-dropdown trigger="hover" @command="(cmd: string) => handleCommand(cmd, row)">
              <el-button type="primary" link size="small">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="send">发送对账单</el-dropdown-item>
                  <el-dropdown-item command="receive">对方确认</el-dropdown-item>
                  <el-dropdown-item command="archive">归档</el-dropdown-item>
                  <el-dropdown-item command="print">打印</el-dropdown-item>
                  <el-dropdown-item command="delete">删除</el-dropdown-item>
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
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Document, Clock, CircleCheck, Warning, ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()

// 统计卡片数据
const statistics = reactive({
  total: 28,
  pending: 8,
  confirmed: 15,
  hasDifference: 5
})

// 对方列表（客户和供应商）
const partyList = ref([
  { id: 1, name: '深圳市腾讯科技有限公司', type: 'customer' },
  { id: 2, name: '阿里巴巴（中国）有限公司', type: 'customer' },
  { id: 3, name: '深圳硬件供应商A公司', type: 'supplier' },
  { id: 4, name: '北京云服务B公司', type: 'supplier' }
])

// 搜索表单
const searchForm = reactive({
  statementNo: '',
  partyType: '',
  partyId: '',
  status: '',
  period: ''
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    statementNo: 'DZD2024040001',
    partyType: 'customer',
    partyName: '深圳市腾讯科技有限公司',
    period: '2024-04',
    ourAmount: 500000,
    theirAmount: 500000,
    difference: 0,
    status: 'confirmed',
    createTime: '2024-04-25 10:30:00',
    confirmTime: '2024-04-26 14:00:00'
  },
  {
    id: 2,
    statementNo: 'DZD2024040002',
    partyType: 'customer',
    partyName: '阿里巴巴（中国）有限公司',
    period: '2024-04',
    ourAmount: 800000,
    theirAmount: 750000,
    difference: -50000,
    status: 'difference',
    createTime: '2024-04-24 09:00:00',
    confirmTime: ''
  },
  {
    id: 3,
    statementNo: 'DZD2024040003',
    partyType: 'supplier',
    partyName: '深圳硬件供应商A公司',
    period: '2024-04',
    ourAmount: 300000,
    theirAmount: 300000,
    difference: 0,
    status: 'checking',
    createTime: '2024-04-23 11:00:00',
    confirmTime: ''
  },
  {
    id: 4,
    statementNo: 'DZD2024040004',
    partyType: 'supplier',
    partyName: '北京云服务B公司',
    period: '2024-04',
    ourAmount: 150000,
    theirAmount: 0,
    difference: -150000,
    status: 'pending',
    createTime: '2024-04-22 08:30:00',
    confirmTime: ''
  },
  {
    id: 5,
    statementNo: 'DZD2024040005',
    partyType: 'customer',
    partyName: '字节跳动科技有限公司',
    period: '2024-04',
    ourAmount: 350000,
    theirAmount: 350000,
    difference: 0,
    status: 'sent',
    createTime: '2024-04-21 15:00:00',
    confirmTime: ''
  }
])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 5
})

// 方法
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'info',
    checking: 'warning',
    confirmed: 'success',
    difference: 'danger',
    sent: 'primary',
    archived: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待核对',
    checking: '核对中',
    confirmed: '已确认',
    difference: '有差异',
    sent: '已发送',
    archived: '已归档'
  }
  return texts[status] || status
}

const handleSearch = () => {
  ElMessage.success('搜索对账单')
  pagination.page = 1
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    ;(searchForm as any)[key] = ''
  })
  ElMessage.info('已重置搜索条件')
}

const handleCreate = () => {
  router.push('/statement/create')
}

const handleExport = () => {
  ElMessage.success('导出对账单')
}

const handleRowClick = (row: any) => {
  // 可选：点击行时选中
}

const handleView = (row: any) => {
  router.push(`/statement/detail/${row.id}`)
}

const handleCheck = (row: any) => {
  router.push(`/statement/check/${row.id}`)
}

const handleConfirm = (row: any) => {
  ElMessageBox.confirm(`确认对账单 ${row.statementNo} 吗？`, '确认对账单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('确认成功')
  }).catch(() => {})
}

const handleCommand = (command: string, row: any) => {
  switch (command) {
    case 'send':
      handleSend(row)
      break
    case 'receive':
      handleReceive(row)
      break
    case 'archive':
      handleArchive(row)
      break
    case 'print':
      handlePrint(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

const handleSend = (row: any) => {
  ElMessageBox.confirm(`发送对账单 ${row.statementNo} 给 ${row.partyName} 吗？`, '发送对账单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('发送成功')
  }).catch(() => {})
}

const handleReceive = (row: any) => {
  ElMessageBox.confirm(`${row.partyName} 已确认对账单 ${row.statementNo} 吗？`, '对方确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('确认成功')
  }).catch(() => {})
}

const handleArchive = (row: any) => {
  ElMessageBox.confirm(`归档对账单 ${row.statementNo} 吗？归档后将不能再修改。`, '归档对账单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('归档成功')
  }).catch(() => {})
}

const handlePrint = (row: any) => {
  ElMessage.info('打印对账单')
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`删除对账单 ${row.statementNo} 吗？此操作不可恢复。`, '删除对账单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.page = 1
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
}
</script>

<style scoped>
.statement-list-container {
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

.stat-icon.pending {
  background: #fdf6ec;
  color: #e6a23c;
}

.stat-icon.confirmed {
  background: #f0f9eb;
  color: #67c23a;
}

.stat-icon.差异 {
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

.difference-zero {
  color: #67c23a;
}

.difference-nonzero {
  color: #f56c6c;
}
</style>
