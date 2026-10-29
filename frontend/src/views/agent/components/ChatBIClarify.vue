<template>
  <div class="cb-clarify">
    <div class="clarify-head">
      <el-icon class="clarify-icon"><QuestionFilled /></el-icon>
      <div class="clarify-title">需要补充信息才能精准分析</div>
    </div>
    <div v-if="clarify.question" class="clarify-question">{{ clarify.question }}</div>
    <div v-if="clarify.missingDims?.length" class="clarify-missing">
      <span class="missing-label">缺失维度：</span>
      <el-tag v-for="d in clarify.missingDims" :key="d" size="small" type="warning" effect="plain">{{ d }}</el-tag>
    </div>
    <div v-if="clarify.suggestions?.length" class="clarify-suggestions">
      <div class="suggestions-label">点击补充：</div>
      <div class="suggestions-chips">
        <el-tag
          v-for="s in clarify.suggestions"
          :key="s"
          class="suggestion-chip"
          effect="plain"
          @click="onPick(s)"
        >
          {{ s }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QuestionFilled } from '@element-plus/icons-vue'
import type { ClarifyQuestion } from '../../../types/chatbi'

defineProps<{ clarify: ClarifyQuestion }>()
const emit = defineEmits<{ (e: 'pick', text: string): void }>()

function onPick(text: string) {
  emit('pick', text)
}
</script>

<style scoped>
.cb-clarify {
  background: linear-gradient(135deg, #fff9e6 0%, #fff5d6 100%);
  border: 1px solid #f5d971;
  border-radius: 8px;
  padding: 14px 16px;
}
.clarify-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.clarify-icon {
  font-size: 18px;
  color: #e6a23c;
}
.clarify-title {
  font-size: 13px;
  font-weight: 600;
  color: #b88200;
}
.clarify-question {
  font-size: 13px;
  color: #303133;
  line-height: 1.6;
  margin-bottom: 10px;
}
.clarify-missing {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}
.missing-label {
  font-size: 12px;
  color: #909399;
}
.clarify-suggestions {
  margin-top: 6px;
}
.suggestions-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
}
.suggestions-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.suggestion-chip {
  cursor: pointer;
  transition: all .15s;
}
.suggestion-chip:hover {
  background: #667eea;
  color: #fff;
  border-color: #667eea;
}
</style>
