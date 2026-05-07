<template>
  <div class="condition-node" :class="{ selected: isSelected }">
    <div class="node-header">
      <el-icon class="node-icon"><Filter /></el-icon>
      <span class="node-name">{{ conditionData.name || '条件' }}</span>
    </div>
    <div class="node-body">
      <div class="condition-count">
        <el-tag size="small" type="warning">
          {{ conditionData.conditions?.length || 0 }} 个条件
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
import { Filter } from '@element-plus/icons-vue'
import { useWorkflowStore } from '../../../store/workflow'
import type { WFNode, ConditionData } from '../../../types/workflow'

const props = defineProps<{
  node: WFNode
}>()

const store = useWorkflowStore()

const isSelected = computed(() => store.canvasState.selectedNodeId === props.node.id)
const conditionData = computed(() => props.node.data as ConditionData)
</script>

<style scoped>
.condition-node {
  width: 100%;
  height: 100%;
  background: #fff;
  border: 2px solid #e6a23c;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  cursor: move;
  overflow: hidden;
}

.condition-node.selected {
  box-shadow: 0 0 0 3px rgba(230, 162, 60, 0.3);
}

.node-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #e6a23c;
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
  align-items: center;
  justify-content: center;
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
  background: #e6a23c;
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
