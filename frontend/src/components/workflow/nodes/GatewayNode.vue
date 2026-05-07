<template>
  <div class="gateway-node" :class="{ selected: isSelected }">
    <div class="gateway-shape" :class="`gateway-${gatewayData.gatewayType.toLowerCase()}`">
      <el-icon class="gateway-icon"><Share /></el-icon>
    </div>
    <div class="gateway-label">{{ gatewayData.name || '网关' }}</div>
    <div class="gateway-type">{{ getGatewayTypeText() }}</div>
    <div class="node-ports">
      <div class="port port-top"></div>
      <div class="port port-bottom"></div>
      <div class="port port-left"></div>
      <div class="port port-right"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Share } from '@element-plus/icons-vue'
import { useWorkflowStore } from '../../../store/workflow'
import type { WFNode, GatewayData } from '../../../types/workflow'
import { GATEWAY_TYPE_MAP } from '../../../types/workflow'

const props = defineProps<{
  node: WFNode
}>()

const store = useWorkflowStore()

const isSelected = computed(() => store.canvasState.selectedNodeId === props.node.id)
const gatewayData = computed(() => props.node.data as GatewayData)

function getGatewayTypeText() {
  return GATEWAY_TYPE_MAP[gatewayData.value.gatewayType] || '未知'
}
</script>

<style scoped>
.gateway-node {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: move;
  position: relative;
}

.gateway-shape {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transform: rotate(45deg);
}

.gateway-XOR {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
}

.gateway-AND {
  background: linear-gradient(135deg, #409eff, #66b1ff);
}

.gateway-OR {
  background: linear-gradient(135deg, #67c23a, #85ce61);
}

.gateway-icon {
  transform: rotate(-45deg);
  font-size: 20px;
  color: #fff;
}

.gateway-label {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #303133;
}

.gateway-type {
  font-size: 10px;
  color: #909399;
}

.gateway-node.selected .gateway-shape {
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.3);
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

.port-left { left: 0; top: 50%; }
.port-right { right: 0; top: 50%; }
.port-top { top: 0; left: 50%; }
.port-bottom { bottom: 0; left: 50%; }
</style>
