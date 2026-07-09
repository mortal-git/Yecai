<template>
  <div class="text-editor">
    <div class="editor-header">
      <span class="label">提取文本（可手动修正后重新抽取）</span>
      <span class="count">{{ charCount }} 字</span>
    </div>
    <el-input
      type="textarea"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :rows="16"
      resize="vertical"
      placeholder="文件解析后的文本内容将显示在此..."
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ modelValue: string }>()
defineEmits<{ 'update:modelValue': [val: string] }>()

const charCount = computed(() => props.modelValue.length)
</script>

<style scoped>
.text-editor {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}
.label {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}
.count {
  font-size: 12px;
  color: #909399;
}
.text-editor :deep(.el-textarea__inner) {
  border: none;
  border-radius: 0;
  font-size: 13px;
  line-height: 1.8;
}
</style>
