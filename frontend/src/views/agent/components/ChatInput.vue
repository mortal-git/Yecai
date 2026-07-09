<template>
  <div class="chat-input">
    <div class="input-toolbar">
      <ModelSelector />

      <div class="toolbar-right">
        <el-tooltip content="角色提示词">
          <el-popover placement="top-end" :width="320" trigger="click">
            <template #reference>
              <el-button link :icon="Avatar" size="small">
                <span class="btn-label">角色</span>
              </el-button>
            </template>
            <div class="tpl-popover">
              <div class="tpl-title">角色提示词模板</div>
              <div class="tpl-current">
                <el-input
                  type="textarea"
                  :rows="3"
                  v-model="systemPromptDraft"
                  placeholder="自定义当前会话的系统提示词..."
                  size="small"
                />
                <div class="tpl-actions">
                  <el-button size="small" @click="applySystemPrompt">应用到当前会话</el-button>
                </div>
              </div>
              <el-divider />
              <div class="tpl-list">
                <div v-for="t in store.promptTemplates" :key="t.id" class="tpl-item">
                  <span class="tpl-name">{{ t.name }}</span>
                  <div>
                    <el-button link size="small" @click="systemPromptDraft = t.content">使用</el-button>
                    <el-button link size="small" type="danger" @click="store.removePromptTemplate(t.id)">删</el-button>
                  </div>
                </div>
              </div>
              <el-divider />
              <el-input v-model="newTplName" size="small" placeholder="新模板名称" />
              <el-button size="small" type="primary" style="margin-top: 6px; width: 100%" @click="saveTpl">保存当前提示词为模板</el-button>
            </div>
          </el-popover>
        </el-tooltip>

        <el-tooltip content="分步执行：AI 仅逐条完成单条 ToDo">
          <el-switch
            :model-value="!!conv?.stepMode"
            @change="onStepModeChange"
            inline-prompt
            active-text="分步"
            inactive-text="一次"
            size="small"
            style="margin: 0 8px"
          />
        </el-tooltip>

        <el-tooltip content="清空当前会话记忆（保留会话）">
          <el-button link :icon="Brush" size="small" @click="onClearMemory" />
        </el-tooltip>
      </div>
    </div>

    <div class="input-area">
      <el-input
        v-model="text"
        type="textarea"
        :rows="3"
        :autosize="{ minRows: 3, maxRows: 8 }"
        placeholder="输入你的问题... (Ctrl+Enter 发送，Enter 换行)"
        resize="none"
        @keydown.ctrl.enter.prevent="onSend"
        @keydown.meta.enter.prevent="onSend"
      />
      <div class="send-row">
        <span class="hint">Ctrl + Enter 发送</span>
        <el-button
          v-if="store.sending"
          type="danger"
          :icon="VideoPause"
          @click="store.abortSending"
        >
          停止生成
        </el-button>
        <el-button
          v-else
          type="primary"
          :icon="Promotion"
          :disabled="!canSend"
          @click="onSend"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Promotion, Brush, Avatar, VideoPause } from '@element-plus/icons-vue'
import ModelSelector from './ModelSelector.vue'
import { useAgentStore } from '../../../store/agent'

const store = useAgentStore()
const text = ref('')
const systemPromptDraft = ref('')
const newTplName = ref('')

const conv = computed(() => store.activeConv)
const canSend = computed(() => text.value.trim().length > 0 && !store.sending)

watch(conv, c => {
  systemPromptDraft.value = c?.systemPrompt || ''
}, { immediate: true })

async function onSend() {
  if (!canSend.value) return
  const t = text.value
  text.value = ''
  try {
    await store.sendMessage(t)
  } catch (e: any) {
    ElMessage.error(e?.message || '发送失败')
    text.value = t
  }
}

function onClearMemory() {
  if (!conv.value) return
  ElMessageBox.confirm('确定清空当前会话的所有消息？会话本身保留。', '清空记忆', {
    type: 'warning'
  }).then(() => {
    store.clearMemory(conv.value!.id)
    ElMessage.success('已清空')
  }).catch(() => { /* user cancelled */ })
}

function applySystemPrompt() {
  if (!conv.value) {
    store.createConversation({ systemPrompt: systemPromptDraft.value })
  } else {
    store.setSystemPrompt(conv.value.id, systemPromptDraft.value)
  }
  ElMessage.success('已应用到当前会话')
}

function saveTpl() {
  const name = newTplName.value.trim()
  const content = systemPromptDraft.value.trim()
  if (!name || !content) {
    ElMessage.warning('请填写名称并输入提示词内容')
    return
  }
  store.addPromptTemplate(name, content)
  newTplName.value = ''
  ElMessage.success('已保存模板')
}

function onStepModeChange(val: boolean | string | number) {
  if (!conv.value) {
    store.createConversation()
  }
  if (conv.value) store.setStepMode(conv.value.id, !!val)
}
</script>

<style scoped>
.chat-input {
  border-top: 1px solid #e4e7ed;
  background: #fff;
  padding: 12px 20px 14px;
}
.input-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}
.btn-label {
  font-size: 12px;
  margin-left: 2px;
}
.input-area :deep(.el-textarea__inner) {
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
}
.send-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.hint {
  font-size: 12px;
  color: #c0c4cc;
}
.tpl-popover {
  padding: 4px;
}
.tpl-title {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 8px;
}
.tpl-list {
  max-height: 180px;
  overflow-y: auto;
}
.tpl-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}
.tpl-name {
  font-size: 13px;
}
.tpl-actions {
  margin-top: 6px;
  text-align: right;
}
</style>
