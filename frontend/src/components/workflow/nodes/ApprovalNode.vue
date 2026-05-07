<template>
  <div class="approval-node" :class="{ selected: isSelected }">
    <div class="node-header">
      <el-icon class="node-type-icon"><User /></el-icon>
      <span class="node-name">{{ approvalData.name || '审批' }}</span>
    </div>
    <div class="node-body">
      <div class="approver-info">
        <el-tag size="small" :type="getApproverTypeColor()">
          {{ getApproverTypeText() }}
        </el-tag>
        <span class="approver-name" v-if="getApproverName()">{{ getApproverName() }}</span>
      </div>
      <div class="approval-mode" v-if="approvalData.approvalMode !== 'single'">
        <el-tag size="small" type="info">
          {{ approvalData.approvalMode === 'countersign' ? '会签' : '或签' }}
        </el-tag>
      </div>
    </div>
    <div class="node-ports">
      <div class="port port-left"></div>
      <div class="port port-right"></div>
      <div class="port port-top"></div>
      <div class="port port-bottom"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { User } from '@element-plus/icons-vue'
import { useWorkflowStore } from '../../../store/workflow'
import type { WFNode, ApprovalData } from '../../../types/workflow'
import { APPROVER_TYPE_MAP } from '../../../types/workflow'

const props = defineProps<{
  node: WFNode
}>()

const store = useWorkflowStore()

const isSelected = computed(() => store.canvasState.selectedNodeId === props.node.id)
const approvalData = computed(() => props.node.data as ApprovalData)

function getApproverTypeText() {
  return APPROVER_TYPE_MAP[approvalData.value.nodeType] || '未知'
}

function getApproverTypeColor() {
  const colors: Record<string, string> = {
    user: 'primary',
    role: 'warning',
    supervisor: 'success',
    creator: 'info'
  }
  return colors[approvalData.value.nodeType] || 'info'
}

function getApproverName() {
  const data = approvalData.value
  if (data.nodeType === 'user' && data.assigneeName) return data.assigneeName
  if (data.nodeType === 'role' && data.roleName) return data.roleName
  return ''
}
</script>

<style scoped>
.approval-node {
  width: 100%;
  height: 100%;
  background: #fff;
  border: 2px solid #409eff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: move;
  transition: box-shadow 0.2s;
}

.approval-node.selected {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.3);
}

.node-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #409eff;
  color: #fff;
}

.node-type-icon {
  font-size: 14px;
}

.node-name {
  font-size: 13px;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-body {
  flex: 1;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.approver-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.approver-name {
  font-size: 12px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.approval-mode {
  margin-top: 2px;
}

.node-ports {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.port {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #409eff;
  border: 2px solid #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: all;
  cursor: crosshair;
}

.port:hover {
  background: #67c23a;
  transform: translate(-50%, -50%) scale(1.3);
}

.port-left {
  left: 0;
  top: 50%;
}

.port-right {
  right: 0;
  top: 50%;
}

.port-top {
  top: 0;
  left: 50%;
}

.port-bottom {
  bottom: 0;
  left: 50%;
}
</style>
