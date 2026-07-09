<template>
  <div class="risk-panel">
    <div class="risk-header">
      <span class="label">风险评估</span>
      <el-button type="primary" size="small" :icon="MagicStick" :loading="store.analyzingRisk" @click="onAnalyze">
        {{ store.analyzingRisk ? '分析中...' : 'AI 风险分析' }}
      </el-button>
    </div>
    <div v-if="!risks.length" class="empty">暂无风险项，点击 AI 风险分析按钮开始</div>
    <div v-else class="risk-list">
      <div v-for="r in risks" :key="r.id" class="risk-item" :class="'level-' + r.riskLevel">
        <div class="risk-head">
          <el-tag size="small" :type="levelType(r.riskLevel)" effect="dark">{{ r.riskLevel }}风险</el-tag>
          <span class="clause">{{ r.clause || '综合风险' }}</span>
        </div>
        <div class="risk-desc">{{ r.description }}</div>
        <div v-if="r.suggestion" class="risk-sug">
          <el-icon><Warning /></el-icon>
          <span>建议：{{ r.suggestion }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { MagicStick, Warning } from '@element-plus/icons-vue'
import { useContractStore } from '../../../store/contract'
import { useAgentModelStore } from '../../../store/agentModel'
import { analyzeContractRisks } from '../../../api/riskAnalysis'
import type { RiskItem } from '../../../types/contract'

const props = defineProps<{ contractId: string; risks: RiskItem[]; rawText: string }>()
const store = useContractStore()
const modelStore = useAgentModelStore()

async function onAnalyze() {
  const model = modelStore.activeModel
  if (!model) { ElMessage.error('请先在智能体中配置模型'); return }
  if (!props.rawText) { ElMessage.warning('合同文本为空'); return }
  store.analyzingRisk = true
  try {
    const items = await analyzeContractRisks(model as any, props.rawText)
    store.setRiskItems(props.contractId, items)
    ElMessage.success(`发现 ${items.length} 个风险项`)
  } catch (e: any) {
    if (e?.name !== 'AbortError') ElMessage.error('分析失败：' + (e?.message || e))
  } finally {
    store.analyzingRisk = false
  }
}

function levelType(l: string): 'danger' | 'warning' | 'info' {
  return l === '高' ? 'danger' : l === '中' ? 'warning' : 'info'
}
</script>

<style scoped>
.risk-panel {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}
.risk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: #fef0f0;
  border-bottom: 1px solid #ebeef5;
}
.label { font-weight: 500; font-size: 13px; color: #303133; }
.empty { padding: 30px; text-align: center; color: #c0c4cc; font-size: 13px; }
.risk-list { padding: 10px 14px; max-height: 400px; overflow-y: auto; }
.risk-item {
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  border-left: 3px solid;
}
.risk-item.level-高 { background: #fef0f0; border-left-color: #f56c6c; }
.risk-item.level-中 { background: #fdf6ec; border-left-color: #e6a23c; }
.risk-item.level-低 { background: #f0f9eb; border-left-color: #67c23a; }
.risk-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.clause { font-size: 13px; font-weight: 500; color: #303133; }
.risk-desc { font-size: 13px; color: #606266; line-height: 1.6; }
.risk-sug {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin-top: 6px;
  font-size: 12px;
  color: #e6a23c;
}
</style>
