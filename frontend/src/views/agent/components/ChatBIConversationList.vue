<template>
  <div class="cb-conv-list">
    <div class="list-toolbar">
      <el-button type="primary" :icon="Plus" class="new-btn" @click="onNew">新建分析</el-button>
      <el-tooltip content="知识库" placement="bottom">
        <el-button :icon="DataAnalysis" @click="emit('show-models')" />
      </el-tooltip>
    </div>

    <el-scrollbar class="conv-scroll">
      <div v-if="store.activeConversations.length === 0" class="empty-hint">
        <el-icon><ChatDotRound /></el-icon>
        <p>暂无分析会话</p>
        <span>点击「新建分析」开始第一次数据问答</span>
      </div>

      <div v-else class="conv-groups">
        <div v-if="store.activeConversations.length" class="conv-group">
          <div class="group-title">活跃会话 · {{ store.activeConversations.length }}</div>
          <div
            v-for="c in store.activeConversations"
            :key="c.id"
            class="conv-item"
            :class="{ active: c.id === store.activeId }"
            @click="store.switchConversation(c.id)"
          >
            <el-icon class="conv-icon"><Histogram /></el-icon>
            <div class="conv-meta">
              <div class="conv-title">{{ c.title }}</div>
              <div class="conv-time">{{ formatTime(c.updatedAt) }} · {{ c.messages.length }}条</div>
            </div>
            <el-dropdown trigger="click" @command="(cmd: string) => onCommand(cmd, c.id)" @click.stop>
              <el-icon class="more-icon" @click.stop><MoreFilled /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="rename">重命名</el-dropdown-item>
                  <el-dropdown-item command="archive">归档</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div v-if="store.archivedConversations.length" class="conv-group">
          <div class="group-title">已归档 · {{ store.archivedConversations.length }}</div>
          <div
            v-for="c in store.archivedConversations"
            :key="c.id"
            class="conv-item archived"
            @click="store.switchConversation(c.id)"
          >
            <el-icon class="conv-icon"><Histogram /></el-icon>
            <div class="conv-meta">
              <div class="conv-title">{{ c.title }}</div>
              <div class="conv-time">{{ formatTime(c.updatedAt) }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus'
import { Plus, MoreFilled, Histogram, ChatDotRound, DataAnalysis } from '@element-plus/icons-vue'
import { useChatbiStore } from '../../../store/chatbi'

const emit = defineEmits<{ (e: 'show-models'): void }>()
const store = useChatbiStore()

function formatTime(ts: number): string {
  const now = Date.now()
  const diff = now - ts
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function onNew() {
  store.createConversation('新数据分析')
}

async function onCommand(cmd: string, id: string) {
  const conv = store.conversations.find(c => c.id === id)
  if (!conv) return
  if (cmd === 'rename') {
    try {
      const { value } = await ElMessageBox.prompt('请输入新的会话名称', '重命名', {
        inputValue: conv.title,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      if (value && value.trim()) {
        store.renameConversation(id, value.trim())
        ElMessage.success('已重命名')
      }
    } catch { /* cancel */ }
  } else if (cmd === 'archive') {
    store.archiveConversation(id)
    ElMessage.success('已归档')
  } else if (cmd === 'delete') {
    try {
      await ElMessageBox.confirm('确定删除此会话？删除后无法恢复', '确认', { type: 'warning' })
      store.deleteConversation(id)
      ElMessage.success('已删除')
    } catch { /* cancel */ }
  }
}
</script>

<style scoped>
.cb-conv-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fafbfc;
}
.list-toolbar {
  padding: 12px;
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #ebeef5;
}
.new-btn {
  flex: 1;
}
.conv-scroll {
  flex: 1;
  min-height: 0;
}
.empty-hint {
  text-align: center;
  padding: 60px 20px;
  color: #c0c4cc;
}
.empty-hint .el-icon {
  font-size: 40px;
  margin-bottom: 12px;
}
.empty-hint p {
  margin: 0 0 4px;
  color: #909399;
  font-size: 14px;
}
.empty-hint span {
  font-size: 12px;
}
.conv-groups {
  padding: 8px;
}
.conv-group {
  margin-bottom: 12px;
}
.group-title {
  font-size: 12px;
  color: #909399;
  padding: 6px 8px;
  font-weight: 500;
}
.conv-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all .2s;
  margin-bottom: 2px;
}
.conv-item:hover {
  background: #ecf5ff;
}
.conv-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
.conv-item.active .conv-title,
.conv-item.active .conv-time {
  color: #fff;
}
.conv-item.active .conv-icon,
.conv-item.active .more-icon {
  color: #fff;
}
.conv-item.archived {
  opacity: 0.6;
}
.conv-icon {
  font-size: 18px;
  color: #667eea;
  flex-shrink: 0;
}
.conv-meta {
  flex: 1;
  min-width: 0;
}
.conv-title {
  font-size: 13px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}
.conv-time {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}
.more-icon {
  font-size: 14px;
  color: #909399;
  cursor: pointer;
  flex-shrink: 0;
}
.more-icon:hover {
  color: #667eea;
}
</style>
