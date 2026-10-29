<template>
  <div class="cb-bubble" :class="msg.role">
    <!-- 用户消息 -->
    <template v-if="msg.role === 'user'">
      <div class="user-avatar">
        <el-icon><User /></el-icon>
      </div>
      <div class="user-body">
        <div class="user-content">{{ msg.content }}</div>
      </div>
    </template>

    <!-- 助手消息 -->
    <template v-else>
      <div class="ai-avatar">
        <el-icon><MagicStick /></el-icon>
      </div>
      <div class="ai-body">
        <!-- 闲聊分支：纯文本回复 -->
        <div v-if="msg.payload?.phase === 'chat' && !msg.loading" class="chat-reply">
          {{ msg.payload.chatReply || msg.content }}
        </div>

        <!-- 澄清分支：澄清问题卡片 -->
        <div v-else-if="msg.payload?.isClarifyRound && msg.payload.clarifyQuestion && !msg.loading">
          <ChatBIClarify
            :clarify="msg.payload.clarifyQuestion"
            @pick="onClarifyPick"
          />
        </div>

        <!-- 数据分析分支 -->
        <template v-else>
          <!-- Pipeline 执行流 -->
          <div v-if="msg.payload?.pipeline?.length" class="pipeline-panel">
            <div class="panel-title toggle-title" @click="pipelineCollapsed = !pipelineCollapsed">
              <el-icon class="collapse-arrow"><ArrowRight v-if="pipelineCollapsed" /><ArrowDown v-else /></el-icon>
              <el-icon><Cpu /></el-icon>
              <span>AI Pipeline 执行流</span>
              <el-tag v-if="msg.loading" type="warning" size="small">执行中...</el-tag>
              <el-tag v-else type="success" size="small">已完成</el-tag>
              <span class="step-count">{{ msg.payload.pipeline.length }} 步</span>
            </div>
            <el-collapse-transition>
              <div v-show="!pipelineCollapsed" class="pipeline-steps">
                <div
                  v-for="(step, idx) in msg.payload.pipeline"
                  :key="step.key"
                  class="step-item"
                  :class="step.status"
                >
                  <div class="step-no">
                    <el-icon v-if="step.status === 'success'"><Check /></el-icon>
                    <el-icon v-else-if="step.status === 'running'" class="is-loading"><Loading /></el-icon>
                    <el-icon v-else-if="step.status === 'failed'"><Close /></el-icon>
                    <span v-else>{{ idx + 1 }}</span>
                  </div>
                  <div class="step-info">
                    <div class="step-title">{{ step.title }}</div>
                    <div class="step-desc">{{ step.desc }}</div>
                    <div v-if="step.detail" class="step-detail">{{ step.detail }}</div>
                  </div>
                </div>
              </div>
            </el-collapse-transition>
          </div>

          <!-- 加载中提示 -->
          <div v-if="msg.loading && !msg.payload?.pipeline?.length" class="loading-hint">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>正在思考你的问题...</span>
          </div>

          <!-- Query 改写面板 -->
          <div v-if="msg.payload?.rewrittenQuery && !msg.loading" class="rewrite-panel-wrapper">
            <ChatBIRewritePanel
              :rewritten-query="msg.payload.rewrittenQuery"
              :is-followup="msg.payload.phase === 'followup'"
              :retrieved="msg.payload.retrievedContext"
            />
          </div>

          <!-- 知识库检索命中面板 -->
          <div v-if="msg.payload?.retrievedContext && !msg.loading" class="retrieve-panel-wrapper">
            <ChatBIRetrievePanel :retrieved="msg.payload.retrievedContext" />
          </div>

          <!-- SQL 展示 -->
          <div v-if="msg.payload?.sql && !msg.loading" class="sql-panel">
            <div class="panel-title toggle-title" @click="sqlCollapsed = !sqlCollapsed">
              <el-icon class="collapse-arrow"><ArrowRight v-if="sqlCollapsed" /><ArrowDown v-else /></el-icon>
              <el-icon><Document /></el-icon>
              <span>自动生成 SQL</span>
              <el-tag size="small" type="info">NL2SQL</el-tag>
              <el-button text size="small" :icon="CopyDocument" @click.stop="onCopySql">复制</el-button>
            </div>
            <el-collapse-transition>
              <pre v-show="!sqlCollapsed" class="sql-code"><code>{{ msg.payload.sql }}</code></pre>
            </el-collapse-transition>
          </div>

          <!-- 数据表格 -->
          <div v-if="msg.payload?.dataset && !msg.loading" class="data-panel">
            <div class="panel-title">
              <el-icon><Grid /></el-icon>
              <span>查询结果 {{ msg.payload.dataset.rows.length }} 行</span>
              <el-tag v-if="msg.payload.dataset.total" size="small" type="success">
                合计：{{ formatCell(msg.payload.dataset.total, 'currency') }}
              </el-tag>
            </div>
            <el-table :data="msg.payload.dataset.rows" border size="small" stripe>
              <el-table-column
                v-for="col in msg.payload.dataset.columns"
                :key="col.field"
                :prop="col.field"
                :label="col.label"
                :align="col.align || 'left'"
                :width="col.width"
              >
                <template #default="{ row }">
                  {{ formatCell(row[col.field], col.formatter) }}
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 图表 -->
          <div v-if="msg.payload?.chart && !msg.loading" class="chart-panel">
            <div class="panel-title">
              <el-icon><PieChart /></el-icon>
              <span>{{ msg.payload.chart.title }}</span>
              <el-tag size="small" type="primary">FunctionCall 自动生成</el-tag>
            </div>
            <ChatBIChart :config="msg.payload.chart" />
          </div>

          <!-- 分析思路切换 + 自定义归因 -->
          <div v-if="msg.payload?.chart && msg.payload?.dataset && !msg.loading" class="analysis-path-wrapper">
            <ChatBIAnalysisPath
              :current="msg.payload.analysisPath"
              :retrieved="msg.payload.retrievedContext"
              :loading="msg.loading"
              @apply="onApplyAnalysisPath"
            />
          </div>

          <!-- AI 洞察报告 -->
          <div v-if="msg.payload?.insight && !msg.loading">
            <ChatBIReport :report="msg.payload.insight" :conv-id="convId" />
          </div>

          <!-- 摘要 -->
          <div v-if="msg.content && !msg.loading" class="ai-summary">
            <el-icon class="summary-icon"><ChatLineSquare /></el-icon>
            <div class="summary-text">{{ msg.content }}</div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User, MagicStick, Cpu, Check, Close, Loading, Document,
  Grid, PieChart, CopyDocument, ChatLineSquare, ArrowDown, ArrowRight
} from '@element-plus/icons-vue'
import type { ChatBIMessage, AnalysisPath } from '../../../types/chatbi'
import { useChatbiStore } from '../../../store/chatbi'
import ChatBIChart from './ChatBIChart.vue'
import ChatBIReport from './ChatBIReport.vue'
import ChatBIClarify from './ChatBIClarify.vue'
import ChatBIRewritePanel from './ChatBIRewritePanel.vue'
import ChatBIRetrievePanel from './ChatBIRetrievePanel.vue'
import ChatBIAnalysisPath from './ChatBIAnalysisPath.vue'

const props = defineProps<{
  msg: ChatBIMessage
  convId: string
}>()

const store = useChatbiStore()
const pipelineCollapsed = ref(true)
const sqlCollapsed = ref(true)

// 澄清问题 chip 点击 -> 作为用户消息发送
function onClarifyPick(text: string) {
  store.sendMessage(text)
}

// 自定义分析思路 -> 重跑归因
function onApplyAnalysisPath(path: AnalysisPath) {
  store.runAttribution(props.convId, props.msg.id, path)
}

function formatCell(val: any, formatter?: string): string {
  if (val === null || val === undefined || val === '') return '-'
  if (formatter === 'currency') {
    const num = Number(val)
    if (isNaN(num)) return String(val)
    return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  if (formatter === 'percent') {
    const num = Number(val)
    if (isNaN(num)) return String(val)
    return (num * 100).toFixed(1) + '%'
  }
  if (formatter === 'number') {
    const num = Number(val)
    if (isNaN(num)) return String(val)
    return num.toLocaleString('zh-CN')
  }
  return String(val)
}

async function onCopySql() {
  if (!props.msg.payload?.sql) return
  try {
    await navigator.clipboard.writeText(props.msg.payload.sql)
    ElMessage.success('SQL 已复制')
  } catch {
    ElMessage.warning('复制失败，请手动复制')
  }
}
</script>

<style scoped>
.cb-bubble {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: flex-start;
}
.cb-bubble.user {
  flex-direction: row-reverse;
}
.user-avatar, .ai-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  font-size: 18px;
}
.user-avatar {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}
.ai-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.user-body {
  max-width: 70%;
}
.user-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 10px 14px;
  border-radius: 12px 12px 2px 12px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}
.ai-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pipeline-panel, .sql-panel, .data-panel, .chart-panel {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px 16px;
}
.panel-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}
.panel-title .el-icon {
  color: #667eea;
}
.panel-title :deep(.el-button) {
  margin-left: auto;
}
.toggle-title {
  cursor: pointer;
  user-select: none;
  border-radius: 4px;
  padding: 2px 4px;
  margin: -2px -4px 10px;
  transition: background .15s;
}
.toggle-title:hover {
  background: #f5f7fa;
}
.collapse-arrow {
  font-size: 12px;
  color: #909399;
  transition: transform .2s;
}
.step-count {
  margin-left: auto;
  font-size: 11px;
  font-weight: 400;
  color: #909399;
}
.pipeline-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.step-item {
  display: flex;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  background: #fafbfc;
  transition: all .2s;
}
.step-item.running {
  background: #ecf5ff;
  border: 1px solid #b3d8ff;
}
.step-item.success {
  background: #f0f9eb;
}
.step-item.failed {
  background: #fef0f0;
}
.step-item.pending {
  opacity: 0.5;
}
.step-no {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #ebeef5;
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
}
.step-item.success .step-no {
  background: #67c23a;
  color: #fff;
  border-color: #67c23a;
}
.step-item.running .step-no {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}
.step-item.failed .step-no {
  background: #f56c6c;
  color: #fff;
  border-color: #f56c6c;
}
.step-info {
  flex: 1;
  min-width: 0;
}
.step-title {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}
.step-desc {
  font-size: 12px;
  color: #606266;
  margin-top: 2px;
}
.step-detail {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}
.loading-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 13px;
  padding: 16px;
}
.sql-code {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 12px 14px;
  border-radius: 6px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
  margin: 0;
  max-height: 220px;
  overflow-y: auto;
}
.ai-summary {
  display: flex;
  gap: 8px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
  border-left: 3px solid #667eea;
  padding: 10px 14px;
  border-radius: 4px;
}
.summary-icon {
  color: #667eea;
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}
.summary-text {
  font-size: 13px;
  color: #303133;
  line-height: 1.7;
  flex: 1;
}
.chat-reply {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 12px 12px 12px 2px;
  padding: 12px 14px;
  font-size: 14px;
  color: #303133;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}
.rewrite-panel-wrapper,
.retrieve-panel-wrapper,
.analysis-path-wrapper {
  margin-top: 0;
}
</style>
