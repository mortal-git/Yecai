<template>
  <div class="cb-input">
    <div class="input-wrap">
      <el-input
        v-model="text"
        type="textarea"
        :rows="2"
        :autosize="{ minRows: 2, maxRows: 6 }"
        placeholder="输入你的数据分析问题，例如：本月各区域营收对比、近半年毛利趋势、Top10产品销量..."
        resize="none"
        @keydown.enter.exact.prevent="onSend"
        :disabled="store.sending"
      />
      <div class="input-actions">
        <div class="action-left">
          <el-tooltip content="清除对话" placement="top">
            <el-button :icon="Delete" circle size="small" @click="onClear" :disabled="store.sending" />
          </el-tooltip>
          <el-tooltip content="查看语义知识库" placement="top">
            <el-button :icon="DataAnalysis" circle size="small" @click="emit('show-models')" />
          </el-tooltip>
        </div>
        <el-button
          type="primary"
          :icon="Promotion"
          :loading="store.sending"
          :disabled="!text.trim()"
          @click="onSend"
        >
          发送分析
        </el-button>
      </div>
    </div>
    <div class="input-tip">
      <el-icon><InfoFilled /></el-icon>
      <span>AI Pipeline 将自动完成：意图识别 → 模型路由 → NL2SQL → 取数 → 图表生成 → AI 洞察</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Promotion, Delete, DataAnalysis, InfoFilled } from '@element-plus/icons-vue'
import { useChatbiStore } from '../../../store/chatbi'

const emit = defineEmits<{ (e: 'show-models'): void }>()
const store = useChatbiStore()
const text = ref('')

async function onSend() {
  const q = text.value.trim()
  if (!q) return
  if (store.sending) {
    ElMessage.warning('正在处理上一个问题，请稍候')
    return
  }
  text.value = ''
  await store.sendMessage(q).catch(e => ElMessage.error(e?.message || '发送失败'))
}

async function onClear() {
  try {
    await ElMessageBox.confirm('确定清空所有会话？此操作不可恢复', '确认', { type: 'warning' })
    store.clearAll()
    ElMessage.success('已清空')
  } catch { /* cancel */ }
}
</script>

<style scoped>
.cb-input {
  padding: 12px 20px 16px;
  background: #fff;
  border-top: 1px solid #ebeef5;
}
.input-wrap {
  background: #f8f9fb;
  border: 1px solid #dcdfe6;
  border-radius: 10px;
  padding: 10px 12px 8px;
  transition: border-color .2s;
}
.input-wrap:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
.input-wrap :deep(.el-textarea__inner) {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  font-size: 14px;
  color: #303133;
}
.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.action-left {
  display: flex;
  gap: 6px;
}
.input-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #909399;
  margin-top: 8px;
  padding: 0 4px;
}
.input-tip .el-icon {
  font-size: 12px;
}
</style>
