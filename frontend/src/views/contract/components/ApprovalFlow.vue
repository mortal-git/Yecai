<template>
  <div class="approval-flow">
    <div class="flow-header">
      <span class="label">审批流程</span>
      <el-tag v-if="contract.status === '审批中'" type="warning" size="small">审批中</el-tag>
    </div>
    <div v-if="!contract.approvals?.length" class="empty">暂无审批记录</div>
    <el-timeline v-else>
      <el-timeline-item
        v-for="step in contract.approvals"
        :key="step.id"
        :type="step.status === 'approved' ? 'success' : step.status === 'rejected' ? 'danger' : 'warning'"
        :hollow="step.status === 'pending'"
      >
        <div class="step-info">
          <span class="step-title">{{ step.title }}</span>
          <span class="step-assignee">{{ step.assignee }}</span>
          <el-tag v-if="step.status === 'approved'" size="small" type="success">已通过</el-tag>
          <el-tag v-else-if="step.status === 'rejected'" size="small" type="danger">已驳回</el-tag>
          <el-tag v-else size="small" type="warning">待审批</el-tag>
        </div>
        <div v-if="step.comment" class="step-comment">{{ step.comment }}</div>
        <div v-if="step.timestamp" class="step-time">{{ new Date(step.timestamp).toLocaleString() }}</div>
        <div v-if="step.status === 'pending' && canApprove" class="step-actions">
          <el-button size="small" type="success" @click="onApprove(step.id, true)">通过</el-button>
          <el-button size="small" type="danger" @click="onApprove(step.id, false)">驳回</el-button>
        </div>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useContractStore } from '../../../store/contract'
import type { Contract } from '../../../types/contract'

const props = defineProps<{ contract: Contract }>()
const store = useContractStore()
const canApprove = computed(() => props.contract.status === '审批中')

function onApprove(stepId: string, approved: boolean) {
  store.approveStep(props.contract.id, stepId, approved, approved ? '审批通过' : '审批驳回')
}
</script>

<style scoped>
.approval-flow {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}
.flow-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: #fdf6ec;
  border-bottom: 1px solid #ebeef5;
}
.label { font-weight: 500; font-size: 13px; }
.empty { padding: 20px; text-align: center; color: #c0c4cc; }
.step-info { display: flex; align-items: center; gap: 8px; }
.step-title { font-weight: 600; font-size: 13px; color: #303133; }
.step-assignee { font-size: 12px; color: #909399; }
.step-comment { font-size: 12px; color: #606266; margin-top: 4px; }
.step-time { font-size: 11px; color: #c0c4cc; margin-top: 2px; }
.step-actions { margin-top: 8px; display: flex; gap: 8px; }
</style>
