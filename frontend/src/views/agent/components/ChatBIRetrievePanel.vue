<template>
  <div class="cb-retrieve">
    <div class="rt-head toggle-title" @click="collapsed = !collapsed">
      <el-icon class="collapse-arrow"><ArrowRight v-if="collapsed" /><ArrowDown v-else /></el-icon>
      <el-icon class="rt-icon"><Collection /></el-icon>
      <span class="rt-label">知识库检索命中</span>
      <el-tag size="small" type="success">{{ semanticCount }} 模型</el-tag>
      <el-tag size="small" type="primary">{{ metricCount }} 指标</el-tag>
    </div>
    <el-collapse-transition>
      <div v-show="!collapsed" class="rt-body">
        <div v-if="retrieved?.semantic?.length" class="rt-section">
          <div class="rt-section-label">语义知识库</div>
          <div class="rt-model-list">
            <div v-for="m in retrieved.semantic" :key="m.type" class="rt-model-item">
              <el-icon class="rt-model-icon"><component :is="iconComp(m.icon)" /></el-icon>
              <div class="rt-model-info">
                <div class="rt-model-name">{{ m.name }} <span class="rt-model-type">({{ m.type }})</span></div>
                <div class="rt-model-desc">{{ m.desc }}</div>
                <div v-if="m.synonyms?.length" class="rt-model-syn">
                  <span class="syn-tag">同义词：</span>{{ m.synonyms.join('、') }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="retrieved?.metric?.length" class="rt-section">
          <div class="rt-section-label">指标知识库</div>
          <div class="rt-metric-list">
            <div v-for="mt in retrieved.metric" :key="mt.code" class="rt-metric-item">
              <el-tag size="small" type="info">L{{ mt.level }}</el-tag>
              <span class="rt-metric-code">{{ mt.code }}</span>
              <span class="rt-metric-name">{{ mt.name }}</span>
              <span class="rt-metric-table">{{ mt.sourceTable }}</span>
            </div>
          </div>
        </div>
        <div v-if="entityEntries.length" class="rt-section">
          <div class="rt-section-label">枚举值命中</div>
          <div class="rt-entity-list">
            <div v-for="[dim, values] in entityEntries" :key="dim" class="rt-entity-item">
              <span class="rt-entity-dim">{{ dim }}：</span>
              <el-tag v-for="v in values" :key="v" size="small" effect="plain">{{ v }}</el-tag>
            </div>
          </div>
        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ArrowDown, ArrowRight, Collection,
  TrendCharts, Coin, Money, Location, Goods, Van
} from '@element-plus/icons-vue'
import type { RetrievedContext } from '../../../types/chatbi'

const props = defineProps<{ retrieved?: RetrievedContext }>()

const collapsed = ref(true)
const semanticCount = computed(() => props.retrieved?.semantic?.length || 0)
const metricCount = computed(() => props.retrieved?.metric?.length || 0)
const entityEntries = computed(() =>
  props.retrieved?.entities ? Object.entries(props.retrieved.entities) : []
)

const iconMap: Record<string, any> = { TrendCharts, Coin, Money, Location, Goods, Van }
function iconComp(name?: string) {
  return iconMap[name || ''] || TrendCharts
}
</script>

<style scoped>
.cb-retrieve {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 10px 14px;
}
.rt-head {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}
.rt-head:hover {
  background: #f5f7fa;
  border-radius: 4px;
  margin: -2px -4px;
  padding: 2px 4px;
}
.collapse-arrow {
  font-size: 12px;
  color: #909399;
}
.rt-icon {
  color: #67c23a;
  font-size: 14px;
}
.rt-label {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}
.rt-body {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rt-section-label {
  font-size: 11px;
  color: #909399;
  margin-bottom: 4px;
}
.rt-model-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rt-model-item {
  display: flex;
  gap: 8px;
  padding: 6px 8px;
  background: #f8faff;
  border-radius: 4px;
}
.rt-model-icon {
  color: #667eea;
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}
.rt-model-info {
  flex: 1;
  min-width: 0;
}
.rt-model-name {
  font-size: 12px;
  font-weight: 600;
  color: #303133;
}
.rt-model-type {
  font-size: 11px;
  color: #909399;
  font-weight: 400;
}
.rt-model-desc {
  font-size: 11px;
  color: #606266;
  margin-top: 2px;
}
.rt-model-syn {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}
.syn-tag {
  color: #e6a23c;
}
.rt-metric-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rt-metric-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 4px 8px;
  background: #f8faff;
  border-radius: 4px;
}
.rt-metric-code {
  font-family: 'Consolas', monospace;
  font-size: 11px;
  color: #909399;
}
.rt-metric-name {
  color: #303133;
  font-weight: 500;
}
.rt-metric-table {
  margin-left: auto;
  font-family: 'Consolas', monospace;
  font-size: 11px;
  color: #67c23a;
}
.rt-entity-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rt-entity-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 12px;
}
.rt-entity-dim {
  color: #606266;
}
</style>
