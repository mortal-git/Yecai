<template>
  <div class="model-selector">
    <el-dropdown trigger="click" @command="onSwitch" v-if="hasModel">
      <span class="selector-trigger">
        <span
          class="status-dot"
          :class="modelStore.activeModel?.status || 'unknown'"
          :title="statusTitle"
        />
        <span class="name">{{ modelStore.activeModel?.name || '选择模型' }}</span>
        <span class="model-name">{{ modelStore.activeModel?.modelName }}</span>
        <el-icon><ArrowDown /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <template v-for="(list, cat) in modelStore.groupedModels" :key="cat">
            <el-dropdown-item v-if="list.length" disabled class="cat-label">{{ cat }}模型</el-dropdown-item>
            <el-dropdown-item
              v-for="m in list"
              :key="m.id"
              :command="m.id"
              :class="{ active: m.id === modelStore.activeId }"
            >
              <span class="status-dot" :class="m.status || 'unknown'" />
              <span class="dd-name">{{ m.name }}</span>
              <span class="dd-model">{{ m.modelName }}</span>
              <el-tag v-if="m.isDefault" size="small" type="info" effect="plain">默认</el-tag>
            </el-dropdown-item>
          </template>
          <el-dropdown-item divided>
            <router-link to="/agent/models" class="cfg-link">
              <el-icon><Setting /></el-icon> 模型配置
            </router-link>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <el-button v-else type="primary" plain size="small" @click="goConfig">
      <el-icon><Plus /></el-icon> 配置模型
    </el-button>

    <el-tooltip v-if="hasModel" content="校验模型可用性">
      <el-button link size="small" :icon="Connection" :loading="verifying" @click="onVerify" />
    </el-tooltip>

    <el-popover v-if="hasModel" placement="bottom" :width="320" trigger="click">
      <template #reference>
        <el-button link size="small" :icon="SetUp" />
      </template>
      <div class="param-form">
        <div class="param-title">参数（{{ modelStore.activeModel?.name }}）</div>
        <el-form size="small" label-width="92px">
          <el-form-item label="温度">
            <el-slider v-model="paramDraft.temperature" :min="0" :max="2" :step="0.1" show-input />
          </el-form-item>
          <el-form-item label="Top P">
            <el-slider v-model="paramDraft.topP" :min="0" :max="1" :step="0.05" show-input />
          </el-form-item>
          <el-form-item label="最大 Tokens">
            <el-input-number v-model="paramDraft.maxTokens" :min="64" :max="32000" :step="128" controls-position="right" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="saveParams">保存参数</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown, Plus, Setting, Connection, SetUp } from '@element-plus/icons-vue'
import { useAgentModelStore } from '../../../store/agentModel'

const modelStore = useAgentModelStore()
const router = useRouter()
const verifying = ref(false)

const hasModel = computed(() => modelStore.models.length > 0)

const statusTitle = computed(() => {
  const s = modelStore.activeModel?.status
  if (s === 'ok') return '模型可用'
  if (s === 'invalid') return '模型不可用，请检查 API Key 或地址'
  return '未校验'
})

const paramDraft = reactive({ temperature: 0.7, topP: 1, maxTokens: 2048 })
watch(() => modelStore.activeModel, m => {
  if (m) {
    paramDraft.temperature = m.params.temperature
    paramDraft.topP = m.params.topP
    paramDraft.maxTokens = m.params.maxTokens
  }
}, { immediate: true })

function onSwitch(id: string) {
  modelStore.setActive(id)
  ElMessage.success('已切换模型')
}

function goConfig() {
  router.push('/agent/models')
}

async function onVerify() {
  if (!modelStore.activeModel) return
  verifying.value = true
  try {
    const ok = await modelStore.verifyModel(modelStore.activeModel.id)
    if (ok) ElMessage.success('模型可用')
    else ElMessage.error('模型不可用，请到模型配置检查 API Key / 地址')
  } finally {
    verifying.value = false
  }
}

function saveParams() {
  if (!modelStore.activeModel) return
  modelStore.updateModel(modelStore.activeModel.id, {
    params: { ...paramDraft }
  })
  ElMessage.success('参数已保存')
}
</script>

<style scoped>
.model-selector {
  display: flex;
  align-items: center;
  gap: 6px;
}
.selector-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  background: #f5f7fa;
  cursor: pointer;
  font-size: 13px;
  transition: background .2s;
}
.selector-trigger:hover { background: #ecf5ff; }

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c0c4cc;
  flex-shrink: 0;
}
.status-dot.ok { background: #67c23a; }
.status-dot.invalid { background: #f56c6c; }
.status-dot.unknown { background: #c0c4cc; }

.name { font-weight: 600; color: #303133; }
.model-name { color: #909399; font-size: 12px; }

.cat-label {
  color: #909399 !important;
  font-size: 12px !important;
  cursor: default !important;
}
.dd-name { margin: 0 8px; min-width: 80px; }
.dd-model { color: #909399; font-size: 12px; flex: 1; }
.cfg-link {
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
}
.param-form { padding: 4px; }
.param-title {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 10px;
}
</style>
