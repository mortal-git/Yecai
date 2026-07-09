<template>
  <div class="conv-list">
    <div class="search-bar">
      <el-input
        v-model="kw"
        size="small"
        placeholder="搜索对话内容..."
        :prefix-icon="Search"
        clearable
      />
    </div>

    <div class="list-actions">
      <el-button type="primary" size="small" :icon="Plus" @click="onCreate" style="flex: 1">
        新建对话
      </el-button>
      <el-tooltip content="清空全部历史">
        <el-button size="small" :icon="DeleteFilled" @click="onClearAll" />
      </el-tooltip>
    </div>

    <div v-if="searchResults.length" class="search-results">
      <div class="section-title">搜索结果（{{ searchResults.length }}）</div>
      <div
        v-for="r in searchResults"
        :key="r.msg.id"
        class="search-item"
        @click="onJump(r.conv.id)"
      >
        <div class="conv-name">{{ r.conv.title }}</div>
        <div class="snippet" v-html="highlight(r.msg.content)"></div>
      </div>
    </div>

    <div v-else class="conv-section">
      <div class="section-title">对话历史</div>
      <div v-if="!store.activeConversations.length" class="empty">还没有对话，点击上方"新建对话"开始</div>
      <div
        v-for="c in store.activeConversations"
        :key="c.id"
        class="conv-item"
        :class="{ active: c.id === store.activeId }"
        @click="store.switchConversation(c.id)"
      >
        <el-icon class="icon"><ChatLineRound /></el-icon>
        <div class="conv-body">
          <div class="conv-title" v-if="editingId !== c.id">{{ c.title }}</div>
          <el-input
            v-else
            v-model="editText"
            size="small"
            @keyup.enter="onRename(c.id)"
            @blur="onRename(c.id)"
            ref="editInput"
          />
          <div class="conv-meta">
            <span>{{ formatTime(c.updatedAt) }}</span>
            <span v-if="c.messages.length">· {{ c.messages.length }} 条</span>
          </div>
        </div>
        <el-dropdown trigger="click" @click.stop @command="(cmd: string) => onMenu(cmd, c.id)">
          <el-button link :icon="MoreFilled" size="small" @click.stop />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="rename">重命名</el-dropdown-item>
              <el-dropdown-item command="archive">归档</el-dropdown-item>
              <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <template v-if="store.archivedConversations.length">
        <div class="section-title archived" @click="showArchived = !showArchived">
          <el-icon><CollectionTag /></el-icon>
          归档（{{ store.archivedConversations.length }}）
          <el-icon class="caret" :class="{ open: showArchived }"><ArrowRight /></el-icon>
        </div>
        <div v-if="showArchived">
          <div
            v-for="c in store.archivedConversations"
            :key="c.id"
            class="conv-item archived"
            :class="{ active: c.id === store.activeId }"
            @click="store.switchConversation(c.id)"
          >
            <el-icon class="icon"><Files /></el-icon>
            <div class="conv-body">
              <div class="conv-title">{{ c.title }}</div>
              <div class="conv-meta">{{ formatTime(c.updatedAt) }}</div>
            </div>
            <el-dropdown trigger="click" @click.stop @command="(cmd: string) => onMenu(cmd, c.id)">
              <el-button link :icon="MoreFilled" size="small" @click.stop />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="unarchive">取消归档</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Plus, DeleteFilled, MoreFilled,
  ChatLineRound, Files, CollectionTag, ArrowRight
} from '@element-plus/icons-vue'
import { useAgentStore } from '../../../store/agent'

const store = useAgentStore()
const kw = ref('')
const editingId = ref('')
const editText = ref('')
const editInput = ref()
const showArchived = ref(false)

const searchResults = computed(() => store.searchMessages(kw.value))

function onCreate() {
  store.createConversation()
}

function onJump(id: string) {
  store.switchConversation(id)
  kw.value = ''
}

function highlight(text: string): string {
  const k = kw.value.trim()
  if (!k) return text.slice(0, 80)
  const idx = text.toLowerCase().indexOf(k.toLowerCase())
  if (idx < 0) return text.slice(0, 80)
  const start = Math.max(0, idx - 20)
  const end = Math.min(text.length, idx + k.length + 40)
  const slice = (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '')
  return slice.replace(new RegExp(`(${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<mark>$1</mark>')
}

async function onMenu(cmd: string, id: string) {
  if (cmd === 'rename') {
    const c = store.conversations.find(x => x.id === id)
    if (c) {
      editingId.value = id
      editText.value = c.title
      await nextTick()
      editInput.value?.focus?.()
    }
  } else if (cmd === 'archive') {
    store.archiveConversation(id, true)
    ElMessage.success('已归档')
  } else if (cmd === 'unarchive') {
    store.archiveConversation(id, false)
    ElMessage.success('已取消归档')
  } else if (cmd === 'delete') {
    try {
      await ElMessageBox.confirm('确定删除该对话？此操作不可恢复。', '删除对话', { type: 'warning' })
      store.deleteConversation(id)
      ElMessage.success('已删除')
    } catch { /* user cancelled */ }
  }
}

function onRename(id: string) {
  if (editingId.value === id) {
    store.renameConversation(id, editText.value)
    editingId.value = ''
  }
}

async function onClearAll() {
  try {
    await ElMessageBox.confirm('确定清空全部对话历史？此操作不可恢复。', '清空历史', { type: 'warning' })
    store.clearAllHistory()
    ElMessage.success('已清空')
  } catch { /* user cancelled */ }
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - ts
  if (diff < 60_000) return '刚刚'
  if (diff < 3600_000) return Math.floor(diff / 60_000) + ' 分钟前'
  if (d.toDateString() === now.toDateString()) return d.toTimeString().slice(0, 5)
  if (now.getFullYear() === d.getFullYear()) return `${d.getMonth() + 1}/${d.getDate()}`
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<style scoped>
.conv-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fafbfc;
}
.search-bar {
  padding: 12px 12px 8px;
  border-bottom: 1px solid #ebeef5;
}
.list-actions {
  display: flex;
  gap: 6px;
  padding: 8px 12px;
}
.section-title {
  padding: 10px 14px 4px;
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}
.section-title.archived {
  cursor: pointer;
  user-select: none;
}
.section-title .caret {
  margin-left: auto;
  transition: transform .2s;
}
.section-title .caret.open { transform: rotate(90deg); }

.conv-section, .search-results {
  flex: 1;
  overflow-y: auto;
}
.empty {
  padding: 30px 14px;
  color: #c0c4cc;
  font-size: 12px;
  text-align: center;
}
.conv-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: background .15s;
}
.conv-item:hover { background: #ecf5ff; }
.conv-item.active {
  background: #ecf5ff;
  border-left-color: #409eff;
}
.conv-item.archived { opacity: .7; }
.icon { color: #909399; flex-shrink: 0; }
.conv-body {
  flex: 1;
  min-width: 0;
}
.conv-title {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.conv-meta {
  font-size: 11px;
  color: #c0c4cc;
  margin-top: 2px;
}
.search-item {
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid #ebeef5;
}
.search-item:hover { background: #ecf5ff; }
.conv-name {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}
.snippet {
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
}
.snippet :deep(mark) {
  background: #fff3a8;
  padding: 0 2px;
  border-radius: 2px;
}
</style>
