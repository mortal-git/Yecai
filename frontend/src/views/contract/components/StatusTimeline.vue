<template>
  <div class="status-timeline">
    <el-steps :active="activeStep" finish-status="success" align-center>
      <el-step v-for="s in STATUS_FLOW" :key="s" :title="s" />
    </el-steps>
    <div v-if="contract.status === '已作废'" class="void-notice">
      <el-tag type="danger" effect="dark">合同已作废</el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { STATUS_FLOW } from '../../../types/contract'
import type { Contract } from '../../../types/contract'

const props = defineProps<{ contract: Contract }>()
const activeStep = computed(() => {
  if (props.contract.status === '已作废') return -1
  return STATUS_FLOW.indexOf(props.contract.status)
})
</script>

<style scoped>
.status-timeline {
  padding: 12px 0;
}
.void-notice {
  text-align: center;
  margin-top: 8px;
}
</style>
