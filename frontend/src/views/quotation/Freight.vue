<template>
  <div class="freight-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <span class="page-title">货代报价</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-panel">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="报价单编号">
          <el-input v-model="searchForm.quotationNo" placeholder="请输入报价单编号" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="报价单名称">
          <el-input v-model="searchForm.quotationName" placeholder="请输入报价单名称" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="客户名称">
          <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table :data="pagedData" border stripe @row-click="handleView">
        <el-table-column label="序号" width="70" align="center">
          <template #default="{ $index }">
            {{ (pagination.page - 1) * pagination.pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="报价单编号" min-width="150">
          <template #default="{ row }">
            <el-link type="primary" @click.stop="handleView(row)">{{ row.quotationNo }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="quotationName" label="报价单名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="customerName" label="客户名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="entityName" label="泓明主体" min-width="180" show-overflow-tooltip />
        <el-table-column label="税率" width="80" align="center">
          <template #default="{ row }">
            {{ row.taxRate }}%
          </template>
        </el-table-column>
        <el-table-column label="报价轮次" width="100" align="center">
          <template #default="{ row }">
            第{{ row.round }}轮
          </template>
        </el-table-column>
        <el-table-column label="报价状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="expiryDate" label="报价失效时间" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="creator" label="创建人" width="100" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click.stop="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click.stop="handleDelete(row)">删除</el-button>
            <el-dropdown trigger="click" @command="(cmd: string) => handleMore(cmd, row)">
              <el-button type="primary" link size="small" @click.stop>
                更多
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="sendApproval" :disabled="row.status === 'approving' || row.status === 'active'">发送审批</el-dropdown-item>
                  <el-dropdown-item command="append" :disabled="row.status === 'invalid'">追加报价</el-dropdown-item>
                  <el-dropdown-item command="invalid" :disabled="row.status === 'invalid'">失效报价</el-dropdown-item>
                  <el-dropdown-item command="requote">再次报价</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, Plus } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import {
  freightQuotationRecords,
  freightStatusTextMap,
  freightStatusTypeMap,
  generateFreightNo,
  resolveTaxRate,
  type FreightQuotation,
  type FreightStatus
} from '../../mock/freightQuotation'

const router = useRouter()

const searchForm = reactive({
  quotationNo: '',
  quotationName: '',
  customerName: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const filteredData = computed(() => {
  return freightQuotationRecords.filter(item => {
    if (searchForm.quotationNo && !item.quotationNo.includes(searchForm.quotationNo)) return false
    if (searchForm.quotationName && !item.quotationName.includes(searchForm.quotationName)) return false
    if (searchForm.customerName && !item.customerName.includes(searchForm.customerName)) return false
    return true
  })
})

const pagedData = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

const getStatusText = (value: FreightStatus) => freightStatusTextMap[value] || value
const getStatusType = (value: FreightStatus) => freightStatusTypeMap[value] || 'info'

const handleSearch = () => {
  pagination.page = 1
}

const handleReset = () => {
  searchForm.quotationNo = ''
  searchForm.quotationName = ''
  searchForm.customerName = ''
  pagination.page = 1
}

const handleCreate = () => {
  router.push('/quotation/freight/create')
}

const handleView = (row: FreightQuotation) => {
  router.push(`/quotation/freight/detail/${row.id}`)
}

const handleEdit = (row: FreightQuotation) => {
  router.push(`/quotation/freight/edit/${row.id}`)
}

const handleDelete = (row: FreightQuotation) => {
  ElMessageBox.confirm(`确认删除报价单「${row.quotationName}」吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  })
    .then(() => {
      const index = freightQuotationRecords.findIndex(item => item.id === row.id)
      if (index > -1) freightQuotationRecords.splice(index, 1)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

const handleMore = (command: string, row: FreightQuotation) => {
  switch (command) {
    case 'sendApproval':
      sendApproval(row)
      break
    case 'append':
      appendQuotation(row)
      break
    case 'invalid':
      invalidQuotation(row)
      break
    case 'requote':
      requote(row)
      break
  }
}

const sendApproval = (row: FreightQuotation) => {
  row.status = 'approving'
  row.approvals.push({
    id: Date.now(),
    stepName: '提交审批',
    approver: row.creator,
    status: 'approved',
    time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    comment: '提交货代报价审批'
  })
  row.approvals.push({
    id: Date.now() + 1,
    stepName: '部门主管审批',
    approver: '李国强',
    status: 'pending',
    time: '',
    comment: ''
  })
  ElMessage.success('已发送审批')
}

const appendQuotation = (row: FreightQuotation) => {
  row.versions.push({
    id: Date.now(),
    round: row.round,
    quotationName: row.quotationName,
    customerName: row.customerName,
    entityName: row.entityName,
    taxIncluded: row.taxIncluded,
    taxRate: row.taxRate,
    expiryDate: row.expiryDate,
    declaration: row.declaration,
    status: row.status,
    updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    operator: '当前用户'
  })
  row.round += 1
  row.status = 'draft'
  ElMessage.success(`已追加报价，当前为第${row.round}轮`)
}

const invalidQuotation = (row: FreightQuotation) => {
  row.status = 'invalid'
  ElMessage.success('报价已失效')
}

const requote = (row: FreightQuotation) => {
  const quotationNo = generateFreightNo()
  freightQuotationRecords.unshift({
    id: Date.now(),
    quotationNo,
    quotationName: `${row.quotationName}（再次报价）`,
    customerName: row.customerName,
    entityName: row.entityName,
    taxIncluded: row.taxIncluded,
    taxRate: resolveTaxRate(row.taxIncluded),
    round: 1,
    status: 'draft',
    expiryDate: row.expiryDate,
    declaration: row.declaration,
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    creator: '当前用户',
    attachments: row.attachments.map(item => ({ ...item })),
    approvals: [],
    versions: [
      {
        id: Date.now() + 1,
        round: 1,
        quotationName: `${row.quotationName}（再次报价）`,
        customerName: row.customerName,
        entityName: row.entityName,
        taxIncluded: row.taxIncluded,
        taxRate: resolveTaxRate(row.taxIncluded),
        expiryDate: row.expiryDate,
        declaration: row.declaration,
        status: 'draft',
        updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        operator: '当前用户'
      }
    ]
  })
  ElMessage.success(`已生成再次报价：${quotationNo}`)
}
</script>

<style scoped>
.freight-container {
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
  margin: 16px 20px 0;
  padding: 20px 20px 0;
  border-radius: 8px;
}

.table-container {
  background: #fff;
  margin: 16px 20px 20px;
  padding: 20px;
  border-radius: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
