<template>
  <div class="msg-row" :class="msg.role">
    <div class="avatar" :class="msg.role">
      <el-icon v-if="msg.role === 'user'"><User /></el-icon>
      <el-icon v-else><MagicStick /></el-icon>
    </div>
    <div class="bubble-wrap">
      <div class="meta">
        <span class="name">{{ msg.role === 'user' ? '我' : 'AI 助手' }}</span>
        <span class="time">{{ formatTime(msg.createdAt) }}</span>
      </div>
      <div class="bubble" :class="msg.role">
        <span v-if="msg.loading && !msg.content" class="typing">
          <span></span><span></span><span></span>
        </span>
        <MarkdownRenderer v-else :content="msg.content || ''" />
      </div>

      <TodoPanel
        v-if="msg.todos && msg.todos.length"
        :conv-id="convId"
        :msg-id="msg.id"
        :todos="msg.todos"
      />

      <div v-if="!msg.loading" class="actions">
        <el-tooltip content="复制">
          <el-button link size="small" :icon="DocumentCopy" @click="copy" />
        </el-tooltip>
        <el-tooltip v-if="msg.role === 'assistant'" content="重新生成">
          <el-button link size="small" :icon="Refresh" @click="$emit('regenerate', msg.id)" />
        </el-tooltip>
        <el-tooltip content="删除">
          <el-button link size="small" :icon="Delete" @click="$emit('delete', msg.id)" />
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { User, MagicStick, DocumentCopy, Refresh, Delete } from '@element-plus/icons-vue'
import MarkdownRenderer from './MarkdownRenderer.vue'
import TodoPanel from './TodoPanel.vue'
import type { Message } from '../../../types/agent'

const props = defineProps<{ msg: Message; convId: string }>()
defineEmits<{ regenerate: [id: string]; delete: [id: string] }>()

async function copy() {
  await navigator.clipboard.writeText(props.msg.content || '')
  ElMessage.success('已复制')
}

function formatTime(ts: number) {
  const d = new Date(ts)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) {
    return d.toTimeString().slice(0, 5)
  }
  return `${d.getMonth() + 1}/${d.getDate()} ${d.toTimeString().slice(0, 5)}`
}
</script>

<style scoped>
.msg-row {
  display: flex;
  gap: 12px;
  padding: 12px 0;
}
.msg-row.user {
  flex-direction: row-reverse;
}
.avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
}
.avatar.user {
  background: linear-gradient(135deg, #409eff 0%, #36cfc9 100%);
}
.avatar.assistant {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.bubble-wrap {
  max-width: 78%;
  display: flex;
  flex-direction: column;
}
.msg-row.user .bubble-wrap { align-items: flex-end; }

.meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
  padding: 0 4px;
}
.bubble {
  padding: 12px 16px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #ebeef5;
  min-width: 56px;
}
.bubble.user {
  background: linear-gradient(135deg, #409eff 0%, #36cfc9 100%);
  color: #fff;
  border-color: transparent;
}
.bubble.user :deep(.md-body) {
  color: #fff;
}
.bubble.user :deep(.md-body code) {
  background: rgba(255,255,255,.2);
  color: #fff;
}

.typing {
  display: inline-flex;
  gap: 4px;
  padding: 4px 0;
}
.typing span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #c0c4cc;
  animation: blink 1.4s infinite ease-in-out both;
}
.typing span:nth-child(2) { animation-delay: .2s; }
.typing span:nth-child(3) { animation-delay: .4s; }
@keyframes blink {
  0%, 80%, 100% { opacity: .2; transform: scale(.8); }
  40% { opacity: 1; transform: scale(1); }
}

.actions {
  margin-top: 4px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity .2s;
}
.msg-row:hover .actions { opacity: 1; }
</style>
