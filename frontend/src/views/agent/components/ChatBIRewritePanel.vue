<template>
  <div class="cb-rewrite">
    <div class="rw-head">
      <el-icon class="rw-icon"><EditPen /></el-icon>
      <span class="rw-label">Query 改写</span>
      <el-tag v-if="isFollowup" size="small" type="warning">追问</el-tag>
    </div>
    <div class="rw-query">{{ rewrittenQuery }}</div>
    <div v-if="synonyms.length" class="rw-synonyms">
      <span class="syn-label">命中同义词：</span>
      <el-tag
        v-for="(s, i) in synonyms"
        :key="i"
        size="small"
        type="info"
        effect="plain"
      >{{ s.from }} -> {{ s.to }}</el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { EditPen } from '@element-plus/icons-vue'
import type { RetrievedContext } from '../../../types/chatbi'

const props = defineProps<{
  rewrittenQuery: string
  isFollowup?: boolean
  retrieved?: RetrievedContext
}>()

const synonyms = computed(() => props.retrieved?.synonyms || [])
</script>

<style scoped>
.cb-rewrite {
  background: #f8faff;
  border: 1px dashed #c0caff;
  border-radius: 6px;
  padding: 10px 12px;
}
.rw-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.rw-icon {
  color: #667eea;
  font-size: 14px;
}
.rw-label {
  font-size: 12px;
  font-weight: 600;
  color: #667eea;
}
.rw-query {
  font-size: 13px;
  color: #303133;
  line-height: 1.6;
  background: #fff;
  padding: 6px 8px;
  border-radius: 4px;
  margin-bottom: 6px;
}
.rw-synonyms {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}
.syn-label {
  font-size: 11px;
  color: #909399;
}
</style>
