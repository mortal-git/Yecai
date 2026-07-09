<template>
  <div
    class="file-uploader"
    :class="{ dragging, disabled }"
    @dragover.prevent="dragging = true"
    @dragleave="dragging = false"
    @drop.prevent="onDrop"
  >
    <input
      ref="inputRef"
      type="file"
      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
      class="hidden-input"
      @change="onPick"
      :disabled="disabled"
    />
    <div v-if="!file" class="placeholder" @click="inputRef?.click()">
      <el-icon class="icon"><UploadFilled /></el-icon>
      <p class="main-text">将文件拖到此处，或 <em>点击上传</em></p>
      <p class="sub-text">支持 PDF / Word / 图片（PNG、JPG），单个文件不超过 10MB</p>
    </div>
    <div v-else class="file-info">
      <el-icon class="file-icon" :size="32">
        <Document />
      </el-icon>
      <div class="file-detail">
        <span class="name">{{ file.name }}</span>
        <span class="size">{{ formatSize(file.size) }}</span>
      </div>
      <el-button v-if="!disabled" link type="danger" :icon="Delete" @click="onRemove" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UploadFilled, Document, Delete } from '@element-plus/icons-vue'

const emit = defineEmits<{ select: [file: File]; remove: [] }>()
defineProps<{ disabled?: boolean }>()

const inputRef = ref<HTMLInputElement>()
const dragging = ref(false)
const file = ref<File | null>(null)

function onPick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) handleFile(f)
}

function onDrop(e: DragEvent) {
  dragging.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) handleFile(f)
}

function handleFile(f: File) {
  if (f.size > 10 * 1024 * 1024) {
    ElMessage.error('文件不能超过 10MB')
    return
  }
  file.value = f
  emit('select', f)
}

function onRemove() {
  file.value = null
  if (inputRef.value) inputRef.value.value = ''
  emit('remove')
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<script lang="ts">
import { ElMessage } from 'element-plus'
</script>

<style scoped>
.file-uploader {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color .2s, background .2s;
  background: #fafbfc;
}
.file-uploader.dragging {
  border-color: #409eff;
  background: #ecf5ff;
}
.file-uploader.disabled {
  cursor: default;
  opacity: .6;
}
.hidden-input {
  display: none;
}
.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.icon {
  font-size: 48px;
  color: #c0c4cc;
}
.main-text {
  font-size: 14px;
  color: #606266;
}
.main-text em {
  color: #409eff;
  font-style: normal;
}
.sub-text {
  font-size: 12px;
  color: #c0c4cc;
}
.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
}
.file-icon { color: #409eff; }
.file-detail {
  flex: 1;
  text-align: left;
}
.name {
  display: block;
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}
.size {
  font-size: 12px;
  color: #909399;
}
</style>
