<template>
  <div class="todo-panel">
    <div class="todo-header">
      <div class="title">
        <el-icon><Tickets /></el-icon>
        <span>任务清单</span>
        <el-tag v-if="todos.length" type="info" size="small" round>{{ doneCount }}/{{ todos.length }}</el-tag>
      </div>
      <div class="header-actions">
        <el-tooltip content="一键复制全部清单">
          <el-button link :icon="DocumentCopy" @click="copyAll" />
        </el-tooltip>
        <el-dropdown trigger="click" @command="onExport">
          <el-button link :icon="Download" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="text">导出为文本 (.txt)</el-dropdown-item>
              <el-dropdown-item command="csv">导出为表格 (.csv)</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="todo-list">
      <div
        v-for="(t, i) in todos"
        :key="t.id"
        class="todo-item"
        :class="{ done: t.done }"
      >
        <div class="todo-row">
          <el-checkbox :model-value="t.done" @change="toggle(t.id)" />
          <span class="idx">{{ i + 1 }}.</span>
          <span class="text">{{ t.text }}</span>
          <el-tag v-if="t.tag" size="small" :type="tagType(t.tag)" effect="plain">{{ t.tag }}</el-tag>
          <el-tag v-if="t.priority" size="small" :type="priorityType(t.priority)" effect="dark">{{ t.priority }}</el-tag>
          <span v-if="t.deadline" class="deadline">⏰ {{ formatDate(t.deadline) }}</span>
          <div class="row-actions">
            <el-tooltip content="设置截止时间 / 优先级">
              <el-popover placement="bottom-end" :width="280" trigger="click">
                <template #reference>
                  <el-button link :icon="Calendar" size="small" />
                </template>
                <div class="meta-form">
                  <el-form size="small" label-width="68px">
                    <el-form-item label="截止时间">
                      <el-date-picker
                        :model-value="t.deadline ? new Date(t.deadline) : null"
                        type="date"
                        @update:model-value="(d: Date | null) => updateDeadline(t.id, d)"
                        style="width: 100%"
                      />
                    </el-form-item>
                    <el-form-item label="优先级">
                      <el-radio-group :model-value="t.priority" @update:model-value="(v: string | number | boolean) => updatePriority(t.id, v as any)">
                        <el-radio-button value="高">高</el-radio-button>
                        <el-radio-button value="中">中</el-radio-button>
                        <el-radio-button value="低">低</el-radio-button>
                      </el-radio-group>
                    </el-form-item>
                  </el-form>
                </div>
              </el-popover>
            </el-tooltip>
            <el-button link :icon="Delete" size="small" @click="remove(t.id)" />
          </div>
        </div>
        <div v-if="t.subSteps?.length" class="sub-steps">
          <div
            v-for="(s, si) in t.subSteps"
            :key="s.id"
            class="sub-row"
            :class="{ done: s.done }"
          >
            <el-checkbox :model-value="s.done" @change="toggle(s.id)" />
            <span class="sub-idx">{{ i + 1 }}.{{ si + 1 }}</span>
            <span class="sub-text">{{ s.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="todo-add">
      <el-input
        v-model="newText"
        size="small"
        placeholder="新增一条待办..."
        @keyup.enter="add"
      >
        <template #append>
          <el-button :icon="Plus" @click="add" />
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Tickets, DocumentCopy, Download, Plus, Delete, Calendar } from '@element-plus/icons-vue'
import { useAgentStore } from '../../../store/agent'
import { todosToText } from '../../../utils/todoParser'
import type { TodoItem, TodoPriority } from '../../../types/agent'

const props = defineProps<{ convId: string; msgId: string; todos: TodoItem[] }>()
const store = useAgentStore()
const newText = ref('')

const doneCount = computed(() => props.todos.filter(t => t.done).length)

function toggle(id: string) {
  store.toggleTodo(props.convId, props.msgId, id)
}
function remove(id: string) {
  store.removeTodo(props.convId, props.msgId, id)
}
function add() {
  const t = newText.value.trim()
  if (!t) return
  store.addTodo(props.convId, props.msgId, t)
  newText.value = ''
}
function updateDeadline(id: string, d: Date | null) {
  store.updateTodo(props.convId, props.msgId, id, { deadline: d ? d.getTime() : undefined })
}
function updatePriority(id: string, p: TodoPriority) {
  store.updateTodo(props.convId, props.msgId, id, { priority: p })
}

async function copyAll() {
  const text = todosToText(props.todos)
  if (!text) return
  await navigator.clipboard.writeText(text)
  ElMessage.success('已复制到剪贴板')
}

function onExport(cmd: 'text' | 'csv') {
  store.exportTodosAsFile(props.convId, props.msgId, cmd)
  ElMessage.success(`已导出${cmd === 'csv' ? '表格' : '文本'}`)
}

function tagType(tag: string): 'success' | 'warning' | 'info' | 'primary' | 'danger' {
  return ({ 工作: 'primary', 生活: 'success', 项目: 'warning', 财务: 'danger' } as const)[tag] || 'info'
}
function priorityType(p: string): 'danger' | 'warning' | 'info' {
  return p === '高' ? 'danger' : p === '中' ? 'warning' : 'info'
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString()
}
</script>

<style scoped>
.todo-panel {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fafbfc;
  margin-top: 12px;
  overflow: hidden;
}
.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: linear-gradient(135deg, #667eea11 0%, #764ba211 100%);
  border-bottom: 1px solid #e4e7ed;
}
.title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}
.header-actions {
  display: flex;
  gap: 4px;
}
.todo-list {
  padding: 8px 14px;
  max-height: 360px;
  overflow-y: auto;
}
.todo-item {
  padding: 6px 0;
  border-bottom: 1px dashed #ebeef5;
}
.todo-item:last-child { border-bottom: none; }
.todo-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.idx {
  color: #909399;
  min-width: 18px;
}
.text {
  flex: 1;
  color: #303133;
  word-break: break-all;
}
.todo-item.done .text {
  color: #909399;
  text-decoration: line-through;
}
.deadline {
  color: #e6a23c;
  font-size: 12px;
}
.row-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity .2s;
}
.todo-row:hover .row-actions { opacity: 1; }

.sub-steps {
  margin-left: 36px;
  margin-top: 4px;
}
.sub-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
  color: #606266;
}
.sub-row.done .sub-text {
  text-decoration: line-through;
  color: #c0c4cc;
}
.sub-idx { color: #909399; min-width: 28px; }

.todo-add {
  padding: 8px 14px;
  border-top: 1px solid #e4e7ed;
  background: #fff;
}
.meta-form { padding: 4px; }
</style>
