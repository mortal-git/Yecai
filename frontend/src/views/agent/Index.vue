<template>
  <div class="agent-page">
    <div class="agent-layout">
      <!-- 左侧：会话列表 + 模型配置入口 -->
      <aside class="side-panel" :class="{ collapsed: collapsed }">
        <div class="side-header">
          <div class="brand">
            <el-icon><MagicStick /></el-icon>
            <span>智能体</span>
          </div>
          <el-button link :icon="collapsed ? Expand : Fold" @click="collapsed = !collapsed" />
        </div>
        <ConversationList v-show="!collapsed" />
      </aside>

      <!-- 主对话区 -->
      <section class="main-area">
        <div class="main-header">
          <div class="conv-info">
            <el-button v-if="collapsed" link :icon="Expand" @click="collapsed = false" />
            <span class="title">{{ store.activeConv?.title || '未开始对话' }}</span>
            <el-tag v-if="store.activeConv?.archived" size="small" type="info">已归档</el-tag>
            <el-tag v-if="store.activeConv?.stepMode" size="small" type="warning">分步执行</el-tag>
          </div>
          <div>
            <router-link to="/agent/models">
              <el-button text :icon="Setting">模型配置</el-button>
            </router-link>
          </div>
        </div>

        <div ref="msgContainer" class="msg-container">
          <div v-if="!store.activeConv || !store.activeConv.messages.length" class="welcome">
            <div class="hero">
              <el-icon class="hero-icon"><MagicStick /></el-icon>
              <h2>嗨，我是智能体助手</h2>
              <p>你可以直接对话、提问，或让我把一项复杂任务拆解为可执行的清单</p>
            </div>

            <div class="quick-tips">
              <div class="tip-title">试试这样问</div>
              <div class="tips">
                <div
                  v-for="t in quickTips"
                  :key="t"
                  class="tip-item"
                  @click="onQuickTip(t)"
                >
                  <el-icon><ChatLineSquare /></el-icon>
                  <span>{{ t }}</span>
                </div>
              </div>
            </div>

            <div v-if="!modelStore.models.length" class="cfg-hint">
              <el-alert type="warning" :closable="false" show-icon>
                <template #title>尚未配置模型</template>
                请先到「模型配置」添加 API Key 后再开始对话
              </el-alert>
              <el-button type="primary" style="margin-top: 12px" @click="$router.push('/agent/models')">
                立即配置
              </el-button>
            </div>
          </div>

          <template v-else>
            <MessageBubble
              v-for="m in store.activeConv.messages"
              :key="m.id"
              :msg="m"
              :conv-id="store.activeConv.id"
              @regenerate="onRegenerate"
              @delete="onDeleteMsg"
            />
          </template>
        </div>

        <ChatInput />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { MagicStick, Setting, Expand, Fold, ChatLineSquare } from '@element-plus/icons-vue'
import ConversationList from './components/ConversationList.vue'
import MessageBubble from './components/MessageBubble.vue'
import ChatInput from './components/ChatInput.vue'
import { useAgentStore } from '../../store/agent'
import { useAgentModelStore } from '../../store/agentModel'

const store = useAgentStore()
const modelStore = useAgentModelStore()
const collapsed = ref(false)
const msgContainer = ref<HTMLElement>()

const quickTips = [
  '帮我规划本周完成对账单催收的任务',
  '分析一下应收账款逾期的常见原因',
  '生成一份月结成本检查清单',
  '把"上线发票批量导入"拆成可执行的步骤'
]

onMounted(() => {
  if (!store.activeId && store.activeConversations.length) {
    store.switchConversation(store.activeConversations[0].id)
  }
})

watch(
  () => store.activeConv?.messages.map(m => m.content + (m.loading ? '_l' : '')).join('|'),
  () => {
    nextTick(() => {
      if (msgContainer.value) {
        msgContainer.value.scrollTop = msgContainer.value.scrollHeight
      }
    })
  }
)

function onQuickTip(text: string) {
  if (!store.activeConv) store.createConversation()
  store.sendMessage(text).catch(e => ElMessage.error(e?.message || '发送失败'))
}

async function onRegenerate(msgId: string) {
  if (!store.activeConv) return
  await store.regenerate(store.activeConv.id, msgId).catch(e => ElMessage.error(e?.message || '失败'))
}

async function onDeleteMsg(msgId: string) {
  if (!store.activeConv) return
  try {
    await ElMessageBox.confirm('删除这条消息？', '确认', { type: 'warning' })
    store.deleteMessage(store.activeConv.id, msgId)
  } catch { /* user cancelled */ }
}
</script>

<style scoped>
.agent-page {
  height: calc(100vh - 60px - 40px - 60px);
  min-height: 560px;
}
.agent-layout {
  display: flex;
  height: 100%;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ebeef5;
}

.side-panel {
  width: 280px;
  flex-shrink: 0;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  transition: width .25s;
}
.side-panel.collapsed {
  width: 56px;
}
.side-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  flex-shrink: 0;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}
.brand .el-icon { font-size: 20px; }
.side-header :deep(.el-button) { color: #fff; }

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
}
.main-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}
.conv-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.title {
  font-weight: 600;
  color: #303133;
  font-size: 15px;
}

.msg-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 32px;
  background: #f8f9fb;
}
.welcome {
  max-width: 640px;
  margin: 24px auto 0;
}
.hero {
  text-align: center;
  padding: 40px 20px 20px;
}
.hero-icon {
  font-size: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.hero h2 {
  margin: 16px 0 8px;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}
.hero p {
  color: #909399;
  font-size: 14px;
}
.quick-tips {
  margin-top: 24px;
}
.tip-title {
  font-size: 13px;
  color: #909399;
  margin-bottom: 10px;
  font-weight: 500;
}
.tips {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
  transition: all .2s;
}
.tip-item:hover {
  border-color: #409eff;
  color: #409eff;
  background: #ecf5ff;
}
.cfg-hint {
  margin-top: 30px;
  text-align: center;
}
</style>
