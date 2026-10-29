<template>
  <div class="cb-report">
    <!-- 报告头 -->
    <div class="report-header">
      <div class="header-left">
        <el-icon class="header-icon"><MagicStick /></el-icon>
        <div>
          <div class="header-title">AI 深度洞察报告</div>
          <div class="header-sub">由 语义层 + 分工式 AI Pipeline 自动生成 · {{ generatedAt }}</div>
        </div>
      </div>
      <el-dropdown @command="onExport" trigger="click">
        <el-button type="primary" :icon="Download" size="small">导出报告</el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="pdf" :icon="Document">PDF 格式</el-dropdown-item>
            <el-dropdown-item command="word" :icon="DocumentCopy">Word 格式</el-dropdown-item>
            <el-dropdown-item command="image" :icon="Picture">图片格式</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 数据概览 -->
    <div class="report-section">
      <div class="section-title">
        <el-icon><DataLine /></el-icon>
        <span>数据概览</span>
      </div>
      <el-row :gutter="12">
        <el-col v-for="(item, idx) in report.overviews" :key="idx" :span="6">
          <div class="overview-card">
            <div class="ov-label">{{ item.label }}</div>
            <div class="ov-value">{{ item.value }}</div>
            <div class="ov-tags">
              <el-tag v-if="item.yoy" size="small" :type="tagType(item.yoy)">
                同比 {{ item.yoy }}
              </el-tag>
              <el-tag v-if="item.mom" size="small" :type="tagType(item.mom)">
                环比 {{ item.mom }}
              </el-tag>
              <el-tag v-if="item.target" size="small" type="primary">
                {{ item.target }}
              </el-tag>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 异常归因 -->
    <div class="report-section">
      <div class="section-title">
        <el-icon><WarningFilled /></el-icon>
        <span>异常归因分析</span>
      </div>
      <div class="attr-list">
        <div v-for="(attr, idx) in report.attributions" :key="idx" class="attr-card">
          <div class="attr-head">
            <el-tag size="small" type="warning">{{ attr.dimension }}</el-tag>
            <div class="attr-problem">{{ attr.problem }}</div>
          </div>
          <div class="attr-row">
            <span class="attr-label">影响：</span>
            <span class="attr-impact">{{ attr.impact }}</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">证据：</span>
            <span class="attr-evidence">{{ attr.evidence }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 优化建议 -->
    <div class="report-section">
      <div class="section-title">
        <el-icon><Lightning /></el-icon>
        <span>业务优化建议</span>
      </div>
      <div class="sug-list">
        <div v-for="(sug, idx) in report.suggestions" :key="idx" class="sug-card" :class="sug.type">
          <div class="sug-head">
            <el-tag size="small" :type="sug.type === 'short_term' ? 'success' : 'primary'">
              {{ sug.type === 'short_term' ? '短期调整' : '长期优化' }}
            </el-tag>
            <div class="sug-title">{{ sug.title }}</div>
          </div>
          <div class="sug-detail">{{ sug.detail }}</div>
          <div class="sug-effect">
            <el-icon><Aim /></el-icon>
            <span>预期效果：{{ sug.expectedEffect }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 风险预警 -->
    <div v-if="report.risks?.length" class="report-section">
      <div class="section-title">
        <el-icon><WarnTriangleFilled /></el-icon>
        <span>风险预警</span>
      </div>
      <el-alert
        v-for="(risk, idx) in report.risks"
        :key="idx"
        type="warning"
        :closable="false"
        show-icon
        class="risk-item"
      >
        {{ risk }}
      </el-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import {
  MagicStick, Download, Document, DocumentCopy, Picture,
  DataLine, WarningFilled, Lightning, Aim, WarnTriangleFilled
} from '@element-plus/icons-vue'
import type { InsightReport, ExportFormat } from '../../../types/chatbi'
import { useChatbiStore } from '../../../store/chatbi'

const props = defineProps<{
  report: InsightReport
  convId: string
}>()

const store = useChatbiStore()
const generatedAt = new Date().toLocaleString('zh-CN', { hour12: false })

function tagType(value: string): 'success' | 'danger' | 'info' {
  if (value.startsWith('+') || value.includes('增长')) return 'success'
  if (value.startsWith('-') || value.includes('下降') || value.includes('下滑')) return 'danger'
  return 'info'
}

async function onExport(format: ExportFormat) {
  const ok = await store.exportReport(props.convId, format)
  if (ok) {
    const map: Record<ExportFormat, string> = { pdf: 'PDF', word: 'Word', image: '图片' }
    ElMessage.success(`已导出${map[format]}格式分析报告`)
  } else {
    ElMessage.error('导出失败')
  }
}
</script>

<style scoped>
.cb-report {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px 20px;
  margin-top: 12px;
}
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px dashed #ebeef5;
  margin-bottom: 16px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-icon {
  font-size: 28px;
  color: #667eea;
}
.header-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}
.header-sub {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}
.report-section {
  margin-bottom: 18px;
}
.report-section:last-child {
  margin-bottom: 0;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}
.section-title .el-icon {
  color: #667eea;
  font-size: 16px;
}
.overview-card {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
  padding: 12px 14px;
  border-radius: 6px;
  border-left: 3px solid #667eea;
}
.ov-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}
.ov-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}
.ov-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.attr-list, .sug-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.attr-card, .sug-card {
  background: #fafbfc;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 10px 12px;
}
.attr-head, .sug-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.attr-problem, .sug-title {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}
.attr-row {
  font-size: 12px;
  color: #606266;
  margin-top: 4px;
  display: flex;
  gap: 4px;
}
.attr-label {
  color: #909399;
  flex-shrink: 0;
}
.sug-card.short_term {
  border-left: 3px solid #67c23a;
}
.sug-card.long_term {
  border-left: 3px solid #409eff;
}
.sug-detail {
  font-size: 12px;
  color: #606266;
  line-height: 1.7;
  margin-bottom: 6px;
}
.sug-effect {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #67c23a;
  background: #f0f9eb;
  padding: 4px 8px;
  border-radius: 4px;
}
.risk-item {
  margin-bottom: 6px;
}
.risk-item:last-child {
  margin-bottom: 0;
}
</style>
