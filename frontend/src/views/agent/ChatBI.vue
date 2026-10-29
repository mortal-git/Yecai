<template>
  <div class="cb-page">
    <div class="cb-layout">
      <!-- 左侧：会话列表 -->
      <aside class="side-panel" :class="{ collapsed }">
        <div class="side-header">
          <div class="brand">
            <el-icon><DataAnalysis /></el-icon>
            <span v-show="!collapsed">ChatBI 数据分析</span>
          </div>
          <el-button link :icon="collapsed ? Expand : Fold" @click="collapsed = !collapsed" />
        </div>
        <ChatBIConversationList v-show="!collapsed" @show-models="showModels = true" />
      </aside>

      <!-- 主对话区 -->
      <section class="main-area">
        <div class="main-header">
          <div class="conv-info">
            <el-button v-if="collapsed" link :icon="Expand" @click="collapsed = false" />
            <span class="title">{{ store.activeConv?.title || 'ChatBI 智能数据分析' }}</span>
            <el-tag v-if="store.activeConv" size="small" type="success">
              {{ store.activeConv.messages.length }} 条消息
            </el-tag>
          </div>
          <div class="header-actions">
            <el-button text :icon="DataAnalysis" @click="showModels = true">知识库</el-button>
            <router-link to="/agent">
              <el-button text :icon="ChatLineSquare">对话工作台</el-button>
            </router-link>
          </div>
        </div>

        <div ref="msgContainer" class="msg-container">
          <!-- 欢迎页 -->
          <div v-if="!store.activeConv || !store.activeConv.messages.length" class="welcome">
            <div class="hero">
              <div class="hero-icon">
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <h2>ChatBI 智能数据分析平台</h2>
              <p class="hero-desc">自然语言问数 → 智能图表生成 → AI 数据洞察 → 业务策略建议 → 自动化报告导出</p>
            </div>

            <!-- 核心能力 -->
            <div class="capability-cards">
              <div class="cap-card">
                <el-icon class="cap-icon" style="color: #667eea"><Cpu /></el-icon>
                <div class="cap-title">AI Pipeline 流水线</div>
                <div class="cap-desc">意图识别 → 模型路由 → NL2SQL → 取数 → 图表生成 → AI 洞察</div>
              </div>
              <div class="cap-card">
                <el-icon class="cap-icon" style="color: #67c23a"><PieChart /></el-icon>
                <div class="cap-title">智能可视化</div>
                <div class="cap-desc">基于 FunctionCall 自动选择最优图表类型与 ECharts 配置</div>
              </div>
              <div class="cap-card">
                <el-icon class="cap-icon" style="color: #f093fb"><MagicStick /></el-icon>
                <div class="cap-title">深度洞察推理</div>
                <div class="cap-desc">数据概览 + 异常归因 + 优化建议 + 风险预警 四维报告</div>
              </div>
              <div class="cap-card">
                <el-icon class="cap-icon" style="color: #f56c6c"><Document /></el-icon>
                <div class="cap-title">多格式导出</div>
                <div class="cap-desc">支持 PDF / Word / 图片 一键导出，适配工作汇报场景</div>
              </div>
            </div>

            <!-- 快捷提问 -->
            <div class="quick-tips">
              <div class="tip-title">
                <el-icon><ChatLineSquare /></el-icon>
                <span>试试这样问</span>
              </div>
              <div class="tips">
                <div
                  v-for="t in quickQuestions"
                  :key="t.text"
                  class="tip-item"
                  @click="onQuickTip(t.text)"
                >
                  <el-icon class="tip-icon"><component :is="iconMap[t.icon]" /></el-icon>
                  <span>{{ t.text }}</span>
                  <el-icon class="tip-arrow"><Right /></el-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- 消息列表 -->
          <template v-else>
            <ChatBIBubble
              v-for="m in store.activeConv.messages"
              :key="m.id"
              :msg="m"
              :conv-id="store.activeConv.id"
            />
          </template>
        </div>

        <ChatBIInput @show-models="showModels = true" />
      </section>
    </div>

    <!-- 语义知识库弹窗 -->
    <ChatBIModelLibrary v-model="showModels" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  DataAnalysis, Expand, Fold, ChatLineSquare, Cpu, PieChart,
  MagicStick, Document, Right, TrendCharts, Coin, Money,
  Location, Goods, Van
} from '@element-plus/icons-vue'
import ChatBIConversationList from './components/ChatBIConversationList.vue'
import ChatBIBubble from './components/ChatBIBubble.vue'
import ChatBIInput from './components/ChatBIInput.vue'
import ChatBIModelLibrary from './components/ChatBIModelLibrary.vue'
import { useChatbiStore } from '../../store/chatbi'
import { QUICK_QUESTIONS } from '../../mock/chatbi'

const store = useChatbiStore()
const collapsed = ref(false)
const msgContainer = ref<HTMLElement>()
const showModels = ref(false)

const quickQuestions = QUICK_QUESTIONS
const iconMap: Record<string, any> = {
  TrendCharts, Coin, Money, Location, Goods, Van
}

onMounted(() => {
  if (!store.activeId && store.activeConversations.length) {
    store.switchConversation(store.activeConversations[0].id)
  }
})

watch(
  () => store.activeConv?.messages.map(m => m.id + (m.loading ? '_l' : '')).join('|'),
  () => {
    nextTick(() => {
      if (msgContainer.value) {
        msgContainer.value.scrollTop = msgContainer.value.scrollHeight
      }
    })
  }
)

async function onQuickTip(text: string) {
  if (!store.activeConv) store.createConversation(text.slice(0, 16))
  await store.sendMessage(text).catch(e => ElMessage.error(e?.message || '发送失败'))
}
</script>

<style scoped>
.cb-page {
  height: calc(100vh - 60px - 40px - 60px);
  min-height: 560px;
}
.cb-layout {
  display: flex;
  height: 100%;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ebeef5;
}

/* 左侧 */
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
  font-size: 15px;
  font-weight: 600;
}
.brand .el-icon {
  font-size: 20px;
}
.side-header :deep(.el-button) {
  color: #fff;
}

/* 主区域 */
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
.header-actions {
  display: flex;
  gap: 4px;
}

.msg-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px 12px;
  background: #f8f9fb;
}

/* 欢迎页 */
.welcome {
  max-width: 960px;
  margin: 16px auto 0;
}
.hero {
  text-align: center;
  padding: 30px 20px 20px;
}
.hero-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 36px;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}
.hero h2 {
  margin: 0 0 10px;
  font-size: 24px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.hero-desc {
  color: #606266;
  font-size: 14px;
  margin: 0 0 6px;
}

/* 能力卡片 */
.capability-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 24px;
}
.cap-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 14px;
  text-align: center;
  transition: all .2s;
}
.cap-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}
.cap-icon {
  font-size: 28px;
  margin-bottom: 8px;
}
.cap-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}
.cap-desc {
  font-size: 11px;
  color: #909399;
  line-height: 1.5;
}

/* 快捷提问 */
.quick-tips {
  margin-top: 30px;
}
.tip-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
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
  gap: 10px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
  transition: all .2s;
}
.tip-item:hover {
  border-color: #667eea;
  color: #667eea;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
  transform: translateY(-1px);
}
.tip-icon {
  color: #667eea;
  font-size: 18px;
  flex-shrink: 0;
}
.tip-item span {
  flex: 1;
}
.tip-arrow {
  color: #c0c4cc;
  font-size: 14px;
  transition: transform .2s;
}
.tip-item:hover .tip-arrow {
  color: #667eea;
  transform: translateX(3px);
}
</style>
