<template>
  <div class="end-node">
    <div class="node-icon">
      <el-icon><CircleCheck /></el-icon>
    </div>
    <div class="node-label">{{ node.data.name || '结束' }}</div>
  </div>
</template>

<script setup lang="ts">
import { CircleCheck } from '@element-plus/icons-vue'
import type { WFNode } from '../../../types/workflow'

defineProps<{
  node: WFNode
}>()
</script>

<style scoped>
.end-node {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #909399, #b1b3b8);
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
