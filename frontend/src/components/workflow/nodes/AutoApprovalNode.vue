<template>
  <div class="auto-approval-node" :class="{ selected: isSelected }">
    <div class="node-header">
      <el-icon class="node-icon"><Lightning /></el-icon>
      <span class="node-name">{{ autoApprovalData.name || '自动审批' }}</span>
    </div>
    <div class="node-body">
      <div class="action-info">
        <el-tag size="small" :type="getActionType()">
          {{ getActionText() }}
        </el-tag>
      </div>
      <div class="condition-count" v-if="autoApprovalData.conditions?.length">
        <el-tag size="small" type="info">
          {{ autoApprovalData.conditions.length }} 个条件
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
import { Lightning } from '@element-plus/icons-vue'
import { useWorkflowStore } from '../../../store/workflow'
import type { WFNode, AutoApprovalData } from '../../../types/workflow'

const props = defineProps<{
  node: WFNode
}>()

const store = useWorkflowStore()

const isSelected = computed(() => store.canvasState.selectedNodeId === props.node.id)
const autoApprovalData = computed(() => props.node.data as AutoApprovalData)

function getActionText() {
  const texts: Record<string, string> = {
    autoPass: '自动通过',
    autoReject: '自动驳回',
    autoTransfer: '自动转交'
  }
  return texts[autoApprovalData.value.action] || '未知'
}

function getActionType() {
  const types: Record<string, string> = {
    autoPass: 'success',
    autoReject: 'danger',
    autoTransfer: 'warning'
  }
  return types[autoApprovalData.value.action] || 'info'
}
</script>

<style scoped>
.auto-approval-node {
  width: 100%;
  height: 100%;
  background: #fff;
  border: 2px solid #9c27b0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  cursor: move;
  overflow: hidden;
}
.auto-approval-node.selected {
  box-shadow: 0 0 0 3px rgba(156, 39, 176, 0.3);
}
.node-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #9c27b0;
  color: #fff;
}
.node-icon {
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
  align-items: center;
  justify-content: center;
}
.condition-count {
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
  background: #9c27b0;
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
.port-left { left: 0; top: 50%; }
.port-right { right: 0; top: 50%; }
.port-top { top: 0; left: 50%; }
.port-bottom { bottom: 0; left: 50%; }
</style>
