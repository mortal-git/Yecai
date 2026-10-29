<template>
  <div class="freight-detail-container">
    <div class="page-card">
      <div class="page-header">
        <div class="header-left">
          <el-button link @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <span class="page-title">货代报价详情</span>
          <el-tag v-if="record" :type="getStatusType(record.status)" size="small" class="status-tag">
            {{ getStatusText(record.status) }}
          </el-tag>
        </div>
        <div class="page-actions">
          <el-button type="primary" plain @click="handleEdit">编辑</el-button>
        </div>
      </div>

      <el-empty v-if="!record" description="未找到该报价单" />

      <el-tabs v-else v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="报价单编号">{{ record.quotationNo }}</el-descriptions-item>
            <el-descriptions-item label="报价单名称">{{ record.quotationName }}</el-descriptions-item>
            <el-descriptions-item label="客户名称">{{ record.customerName }}</el-descriptions-item>
            <el-descriptions-item label="泓明主体">{{ record.entityName }}</el-descriptions-item>
            <el-descriptions-item label="是否含税">{{ record.taxIncluded ? '含税' : '不含税' }}</el-descriptions-item>
            <el-descriptions-item label="税率">{{ record.taxRate }}%</el-descriptions-item>
            <el-descriptions-item label="报价轮次">第{{ record.round }}轮</el-descriptions-item>
            <el-descriptions-item label="报价状态">
              <el-tag :type="getStatusType(record.status)" size="small">{{ getStatusText(record.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="报价失效时间">{{ record.expiryDate }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ record.createTime }}</el-descriptions-item>
            <el-descriptions-item label="创建人">{{ record.creator }}</el-descriptions-item>
            <el-descriptions-item label="申明" :span="2">{{ record.declaration || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="附件信息" name="attachments">
          <el-table :data="record.attachments" border>
            <el-table-column prop="name" label="附件名称" min-width="240" show-overflow-tooltip />
            <el-table-column prop="size" label="大小" width="120" />
            <el-table-column prop="uploader" label="上传人" width="120" />
            <el-table-column prop="uploadTime" label="上传时间" width="180" />
          </el-table>
          <el-empty v-if="!record.attachments.length" description="暂无附件" />
        </el-tab-pane>

        <el-tab-pane label="审批记录" name="approvals">
          <el-timeline v-if="record.approvals.length">
            <el-timeline-item
              v-for="item in record.approvals"
              :key="item.id"
              :type="getApprovalType(item.status)"
              :timestamp="item.time || '待处理'"
              placement="top"
            >
              <div class="approval-item">
                <span class="approval-step">{{ item.stepName }}</span>
                <el-tag :type="getApprovalType(item.status)" size="small">{{ getApprovalText(item.status) }}</el-tag>
                <span class="approval-approver">{{ item.approver }}</span>
                <span v-if="item.comment" class="approval-comment">{{ item.comment }}</span>
              </div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无审批记录" />
        </el-tab-pane>

        <el-tab-pane label="历史版本" name="versions">
          <el-table :data="[...record.versions].reverse()" border>
            <el-table-column label="轮次" width="80" align="center">
              <template #default="{ row }">第{{ row.round }}轮</template>
            </el-table-column>
            <el-table-column prop="quotationName" label="报价单名称" min-width="200" show-overflow-tooltip />
            <el-table-column prop="customerName" label="客户名称" min-width="180" show-overflow-tooltip />
            <el-table-column prop="entityName" label="泓明主体" min-width="180" show-overflow-tooltip />
            <el-table-column label="税率" width="80" align="center">
              <template #default="{ row }">{{ row.taxRate }}%</template>
            </el-table-column>
            <el-table-column prop="expiryDate" label="失效时间" width="120" />
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="160" />
            <el-table-column prop="operator" label="操作人" width="100" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import {
  freightQuotationRecords,
  freightStatusTextMap,
  freightStatusTypeMap,
  type FreightStatus
} from '../../mock/freightQuotation'

const route = useRoute()
const router = useRouter()

const activeTab = ref('basic')

const record = computed(() => {
  const id = Number(route.params.id)
  return freightQuotationRecords.find(item => item.id === id) || null
})

const getStatusText = (value: FreightStatus) => freightStatusTextMap[value] || value
const getStatusType = (value: FreightStatus) => freightStatusTypeMap[value] || 'info'

const getApprovalType = (status: string) => {
  const map: Record<string, string> = { approved: 'success', pending: 'warning', rejected: 'danger' }
  return map[status] || 'info'
}

const getApprovalText = (status: string) => {
  const map: Record<string, string> = { approved: '已通过', pending: '待审批', rejected: '已驳回' }
  return map[status] || status
}

const handleBack = () => {
  router.push('/quotation/freight')
}

const handleEdit = () => {
  if (record.value) router.push(`/quotation/freight/edit/${record.value.id}`)
}
</script>

<style scoped>
.freight-detail-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100%;
}

.page-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.status-tag {
  margin-left: 4px;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.approval-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.approval-step {
  font-weight: 600;
  color: #303133;
}

.approval-approver {
  color: #606266;
}

.approval-comment {
  color: #909399;
  font-size: 13px;
}
</style>
