<template>
  <div class="compare-view">
    <div class="compare-header">
      <span class="label">智能比对</span>
      <div class="compare-ctrls">
        <el-select v-model="leftVer" size="small" style="width: 140px">
          <el-option v-for="v in versions" :key="v.version" :label="'v' + v.version + ' - ' + (v.description || '自动保存')" :value="v.version" />
        </el-select>
        <span class="vs">VS</span>
        <el-select v-model="rightVer" size="small" style="width: 140px">
          <el-option v-for="v in versions" :key="v.version" :label="'v' + v.version + ' - ' + (v.description || '自动保存')" :value="v.version" />
        </el-select>
        <el-button size="small" type="primary" @click="onDiff">比对</el-button>
      </div>
    </div>
    <div v-if="lines.length" class="compare-stats">
      <el-tag type="success" size="small">新增 {{ stats.added }} 行</el-tag>
      <el-tag type="danger" size="small">删除 {{ stats.deleted }} 行</el-tag>
      <el-tag type="info" size="small">相同 {{ stats.same }} 行</el-tag>
    </div>
    <div v-if="lines.length" class="diff-container">
      <div v-for="(l, i) in lines" :key="i" class="diff-line" :class="l.type">
        <span class="ln">{{ l.oldLine || '' }}</span>
        <span class="ln">{{ l.newLine || '' }}</span>
        <span class="marker">{{ l.type === 'add' ? '+' : l.type === 'del' ? '-' : ' ' }}</span>
        <span class="content">{{ l.content }}</span>
      </div>
    </div>
    <div v-else-if="versions.length < 2" class="empty">需要至少两个版本才能比对，请先保存版本</div>
    <div v-else class="empty">选择两个版本后点击比对</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { diffContracts, diffStats } from '../../../utils/contractDiff'
import type { DiffLine, ContractVersion } from '../../../types/contract'

const props = defineProps<{ versions: ContractVersion[] }>()
const leftVer = ref(props.versions.length > 1 ? props.versions[props.versions.length - 2].version : 1)
const rightVer = ref(props.versions.length > 0 ? props.versions[props.versions.length - 1].version : 1)
const lines = ref<DiffLine[]>([])

const stats = computed(() => diffStats(lines.value))

function onDiff() {
  const lv = props.versions.find(v => v.version === leftVer.value)
  const rv = props.versions.find(v => v.version === rightVer.value)
  if (!lv || !rv) return
  lines.value = diffContracts(lv.rawText, rv.rawText)
}
</script>

<style scoped>
.compare-view {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}
.compare-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}
.label { font-weight: 500; font-size: 13px; }
.compare-ctrls { display: flex; align-items: center; gap: 8px; }
.vs { font-weight: 600; color: #909399; font-size: 12px; }
.compare-stats { display: flex; gap: 6px; padding: 8px 14px; background: #fafbfc; }
.diff-container {
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.6;
}
.diff-line {
  display: flex;
  border-bottom: 1px solid #f5f5f5;
}
.diff-line.add { background: #e6ffec; }
.diff-line.del { background: #ffebe9; }
.ln {
  width: 36px;
  text-align: right;
  padding-right: 8px;
  color: #c0c4cc;
  flex-shrink: 0;
  user-select: none;
}
.marker {
  width: 16px;
  text-align: center;
  flex-shrink: 0;
  font-weight: 600;
}
.diff-line.add .marker { color: #67c23a; }
.diff-line.del .marker { color: #f56c6c; }
.content { flex: 1; white-space: pre-wrap; word-break: break-all; }
.empty { padding: 30px; text-align: center; color: #c0c4cc; font-size: 13px; }
</style>
