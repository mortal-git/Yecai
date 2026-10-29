<template>
  <div class="cb-path">
    <div class="path-head">
      <el-icon class="path-icon"><DataAnalysis /></el-icon>
      <span class="path-label">分析思路</span>
      <el-tag v-if="current?.custom" size="small" type="warning">自定义</el-tag>
      <el-button
        text
        size="small"
        :icon="Setting"
        class="custom-btn"
        @click="customVisible = !customVisible"
      >自定义归因维度</el-button>
    </div>
    <div class="path-tags">
      <el-tag
        v-for="p in presetPaths"
        :key="p.name"
        :type="isActive(p) ? 'primary' : 'info'"
        :effect="isActive(p) ? 'dark' : 'plain'"
        class="path-tag"
        @click="onPick(p)"
      >
        {{ p.name }}
        <span class="path-dims">（{{ p.dimensions.join('、') }}）</span>
      </el-tag>
    </div>
    <el-collapse-transition>
      <div v-show="customVisible" class="custom-panel">
        <div class="custom-row">
          <el-input v-model="customName" placeholder="自定义思路名称" size="small" style="width: 160px" />
          <el-select
            v-model="customDims"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入归因维度"
            size="small"
            style="flex: 1"
          >
            <el-option v-for="d in dimensionOptions" :key="d" :label="d" :value="d" />
          </el-select>
          <el-button
            type="primary"
            size="small"
            :loading="loading"
            :disabled="!customDims.length"
            @click="onApplyCustom"
          >重跑归因</el-button>
        </div>
        <div v-if="current?.dimensions?.length" class="current-dims">
          当前归因维度：{{ current.dimensions.join('、') }}
        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DataAnalysis, Setting } from '@element-plus/icons-vue'
import type { AnalysisPath, RetrievedContext } from '../../../types/chatbi'

const props = defineProps<{
  current?: AnalysisPath
  retrieved?: RetrievedContext
  loading?: boolean
}>()
const emit = defineEmits<{ (e: 'apply', path: AnalysisPath): void }>()

// 预置分析思路（从 store 通过父组件传入 retrieved 时也能用，这里直接内置 4 条）
const presetPaths: AnalysisPath[] = [
  { name: '维度归因', dimensions: ['区域', '产品', '业务板块'] },
  { name: '趋势外推', dimensions: ['时间'] },
  { name: '对比差异', dimensions: ['区域', '业务板块'] },
  { name: '结构占比', dimensions: ['品类', '渠道'] }
]

const customVisible = ref(false)
const customName = ref('')
const customDims = ref<string[]>([])

// 维度候选：从检索命中的模型 + 通用枚举收集
const dimensionOptions = computed(() => {
  const set = new Set<string>()
  props.retrieved?.semantic?.forEach(m => m.dimensions?.forEach(d => set.add(d)))
  Object.keys(props.retrieved?.entities || {}).forEach(k => set.add(k))
  return Array.from(set)
})

function isActive(p: AnalysisPath) {
  return props.current?.name === p.name && !props.current?.custom
}

function onPick(p: AnalysisPath) {
  emit('apply', p)
}

function onApplyCustom() {
  if (!customDims.value.length) return
  emit('apply', {
    name: customName.value.trim() || '自定义',
    dimensions: [...customDims.value],
    custom: true
  })
  customVisible.value = false
}
</script>

<style scoped>
.cb-path {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 10px 14px;
}
.path-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}
.path-icon {
  color: #667eea;
  font-size: 14px;
}
.path-label {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}
.custom-btn {
  margin-left: auto;
}
.path-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.path-tag {
  cursor: pointer;
  transition: all .15s;
}
.path-dims {
  font-size: 11px;
  opacity: 0.8;
}
.custom-panel {
  margin-top: 10px;
  padding: 10px;
  background: #f8faff;
  border-radius: 6px;
}
.custom-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.current-dims {
  font-size: 11px;
  color: #909399;
  margin-top: 6px;
}
</style>
