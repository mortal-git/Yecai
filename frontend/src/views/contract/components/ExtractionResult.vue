<template>
  <div class="extraction-result">
    <div class="result-header">
      <span class="label">结构化抽取结果</span>
      <el-tag v-if="fields.length" size="small" type="success">{{ fields.length }} 个字段</el-tag>
    </div>
    <div v-if="!fields.length" class="empty">暂无抽取结果，请先执行抽取</div>
    <el-form v-else label-width="120px" size="default" class="field-form">
      <el-form-item v-for="f in fields" :key="f.key" :label="f.label">
        <el-input
          v-if="f.editable"
          :model-value="f.value"
          @update:model-value="$emit('updateField', f.key, $event)"
        />
        <span v-else class="readonly">{{ f.value || '-' }}</span>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import type { ExtractedField } from '../../../types/contract'

defineProps<{ fields: ExtractedField[] }>()
defineEmits<{ updateField: [key: string, value: string] }>()
</script>

<style scoped>
.extraction-result {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: linear-gradient(135deg, #667eea11 0%, #764ba211 100%);
  border-bottom: 1px solid #ebeef5;
}
.label {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}
.empty {
  padding: 40px 20px;
  text-align: center;
  color: #c0c4cc;
  font-size: 13px;
}
.field-form {
  padding: 16px 20px;
  max-height: 480px;
  overflow-y: auto;
}
.readonly {
  font-size: 14px;
  color: #606266;
  line-height: 32px;
}
</style>
