<template>
  <div class="start-node">
    <div class="node-icon">
      <el-icon><VideoPlay /></el-icon>
    </div>
    <div class="node-label">{{ node.data.name || '开始' }}</div>
  </div>
</template>

<script setup lang="ts">
import { VideoPlay } from '@element-plus/icons-vue'
import type { WFNode } from '../../../types/workflow'

defineProps<{
  node: WFNode
}>()
</script>

<style scoped>
.start-node {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #67c23a, #85ce61);
  border-radius: 8px;
  color: #fff;
  cursor: move;
}
.node-icon {
  font-size: 20px;
  margin-bottom: 4px;
}
.node-label {
  font-size: 12px;
  font-weight: 500;
}
</style>
