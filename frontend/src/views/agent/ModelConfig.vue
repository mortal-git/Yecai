<template>
  <div class="model-config-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div>
            <span class="title">模型配置</span>
            <span class="sub">管理你的 LLM 模型，API Key 仅在本浏览器加密保存</span>
          </div>
          <el-button type="primary" :icon="Plus" @click="openCreate">新增模型</el-button>
        </div>
      </template>

      <el-table :data="modelStore.models" border stripe row-key="id" empty-text="还没有模型，点击右上角「新增模型」">
        <el-table-column label="名称" min-width="160">
          <template #default="{ row }">
            <div class="cell-name">
              <span class="status-dot" :class="row.status || 'unknown'" />
              <span>{{ row.name }}</span>
              <el-tag v-if="row.isDefault" size="small" type="success" effect="plain">默认</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="catType(row.category)">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="模型 ID" prop="modelName" min-width="160" />
        <el-table-column label="接口地址" prop="baseURL" min-width="240" show-overflow-tooltip />
        <el-table-column label="API Key" min-width="160">
          <template #default="{ row }">
            <span class="masked">{{ keyDisplay(row.apiKeyCipher) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="参数" width="200">
          <template #default="{ row }">
            <span class="params">
              T={{ row.params.temperature }} / TopP={{ row.params.topP }} / Max={{ row.params.maxTokens }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="今日调用" width="110">
          <template #default="{ row }">
            <span>{{ todayCount(row) }}{{ row.dailyLimit ? ' / ' + row.dailyLimit : '' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="onVerify(row)">校验</el-button>
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button v-if="!row.isDefault" link size="small" @click="modelStore.setDefault(row.id)">设为默认</el-button>
            <el-button link type="danger" size="small" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑模型' : '新增模型'"
      width="640px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" status-icon>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="例：DeepSeek Chat" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-radio-group v-model="form.category">
            <el-radio-button value="通用">通用</el-radio-button>
            <el-radio-button value="代码">代码</el-radio-button>
            <el-radio-button value="行业">行业</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="预设" v-if="!editingId">
          <el-select v-model="presetKey" placeholder="选择常用供应商，自动填充" clearable @change="applyPreset" style="width: 100%">
            <el-option
              v-for="p in presets"
              :key="p.key"
              :label="p.label"
              :value="p.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="接口地址" prop="baseURL">
          <el-input v-model="form.baseURL" placeholder="https://api.deepseek.com（自动补全 /v1/chat/completions）" />
        </el-form-item>
        <el-form-item label="模型 ID" prop="modelName">
          <el-input v-model="form.modelName" placeholder="例：deepseek-chat / gpt-4o / glm-4.5" />
        </el-form-item>
        <el-form-item label="API Key" prop="apiKey">
          <el-input
            v-model="form.apiKey"
            type="password"
            show-password
            :placeholder="editingId ? '留空则保持原 Key 不变' : '请输入完整 API Key'"
          />
          <div v-if="editingId" class="hint">当前 Key：{{ keyDisplay(originalKeyCipher) }}</div>
        </el-form-item>
        <el-form-item label="温度">
          <el-slider v-model="form.params.temperature" :min="0" :max="2" :step="0.1" show-input />
        </el-form-item>
        <el-form-item label="Top P">
          <el-slider v-model="form.params.topP" :min="0" :max="1" :step="0.05" show-input />
        </el-form-item>
        <el-form-item label="最大 Tokens">
          <el-input-number v-model="form.params.maxTokens" :min="64" :max="32000" :step="128" controls-position="right" />
        </el-form-item>
        <el-form-item label="每日调用上限">
          <el-input-number v-model="form.dailyLimit" :min="0" :max="100000" :step="10" controls-position="right" />
          <span class="hint" style="margin-left: 8px">0 表示不限制</span>
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="form.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAgentModelStore } from '../../store/agentModel'
import { maskKey, decryptKey } from '../../utils/crypto'
import type { ModelConfig, ModelCategory } from '../../types/agent'

const modelStore = useAgentModelStore()

const dialogVisible = ref(false)
const editingId = ref('')
const originalKeyCipher = ref('')
const formRef = ref<FormInstance>()
const presetKey = ref('')

const presets = [
  { key: 'deepseek', label: 'DeepSeek', baseURL: 'https://api.deepseek.com', modelName: 'deepseek-chat', category: '通用' as ModelCategory },
  { key: 'tongyi', label: '阿里通义（DashScope）', baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1', modelName: 'qwen-plus', category: '通用' as ModelCategory },
  { key: 'kimi', label: 'Moonshot Kimi', baseURL: 'https://api.moonshot.cn/v1', modelName: 'moonshot-v1-32k', category: '通用' as ModelCategory },
  { key: 'zhipu', label: '智谱 GLM', baseURL: 'https://open.bigmodel.cn/api/paas/v4', modelName: 'glm-4.5', category: '通用' as ModelCategory },
  { key: 'openai', label: 'OpenAI', baseURL: 'https://api.openai.com/v1', modelName: 'gpt-4o', category: '通用' as ModelCategory },
  { key: 'ollama', label: 'Ollama 本地', baseURL: 'http://localhost:11434/v1', modelName: 'llama3.1', category: '通用' as ModelCategory }
]

const defaultForm = () => ({
  name: '',
  baseURL: '',
  apiKey: '',
  modelName: '',
  category: '通用' as ModelCategory,
  isDefault: false,
  dailyLimit: 0,
  params: { temperature: 0.7, topP: 1, maxTokens: 2048 }
})

const form = reactive(defaultForm())

const rules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  baseURL: [{ required: true, message: '请输入接口地址', trigger: 'blur' }],
  modelName: [{ required: true, message: '请输入模型 ID', trigger: 'blur' }],
  apiKey: [{
    validator: (_, val, cb) => {
      if (!editingId.value && !val) return cb(new Error('请输入 API Key'))
      cb()
    },
    trigger: 'blur'
  }]
}

function applyPreset(key: string) {
  const p = presets.find(x => x.key === key)
  if (!p) return
  form.baseURL = p.baseURL
  form.modelName = p.modelName
  form.category = p.category
  if (!form.name) form.name = p.label
}

function openCreate() {
  Object.assign(form, defaultForm())
  editingId.value = ''
  originalKeyCipher.value = ''
  presetKey.value = ''
  dialogVisible.value = true
}

function openEdit(row: ModelConfig) {
  editingId.value = row.id
  originalKeyCipher.value = row.apiKeyCipher
  Object.assign(form, {
    name: row.name,
    baseURL: row.baseURL,
    apiKey: '',
    modelName: row.modelName,
    category: row.category,
    isDefault: row.isDefault,
    dailyLimit: row.dailyLimit || 0,
    params: { ...row.params }
  })
  dialogVisible.value = true
}

async function onSave() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  if (editingId.value) {
    modelStore.updateModel(editingId.value, {
      name: form.name,
      baseURL: form.baseURL,
      modelName: form.modelName,
      category: form.category,
      isDefault: form.isDefault,
      params: { ...form.params },
      dailyLimit: form.dailyLimit,
      apiKey: form.apiKey || undefined
    })
    ElMessage.success('已保存')
  } else {
    modelStore.addModel({
      name: form.name,
      baseURL: form.baseURL,
      apiKey: form.apiKey,
      modelName: form.modelName,
      category: form.category,
      isDefault: form.isDefault,
      params: { ...form.params },
      dailyLimit: form.dailyLimit
    })
    ElMessage.success('已新增')
  }
  dialogVisible.value = false
}

async function onDelete(row: ModelConfig) {
  try {
    await ElMessageBox.confirm(`确定删除模型「${row.name}」？`, '删除模型', { type: 'warning' })
    modelStore.removeModel(row.id)
    ElMessage.success('已删除')
  } catch { /* user cancelled */ }
}

async function onVerify(row: ModelConfig) {
  ElMessage.info('正在校验...')
  const ok = await modelStore.verifyModel(row.id)
  if (ok) ElMessage.success(`「${row.name}」可用`)
  else ElMessage.error(`「${row.name}」不可用，请检查 API Key 或地址`)
}

function keyDisplay(cipher: string): string {
  if (!cipher) return ''
  return maskKey(decryptKey(cipher))
}

function todayCount(row: ModelConfig): number {
  const today = new Date().toISOString().slice(0, 10)
  return row.callDate === today ? row.callCount || 0 : 0
}

function catType(c: ModelCategory): 'primary' | 'success' | 'warning' {
  return c === '代码' ? 'success' : c === '行业' ? 'warning' : 'primary'
}
function statusType(s?: string): 'success' | 'danger' | 'info' {
  return s === 'ok' ? 'success' : s === 'invalid' ? 'danger' : 'info'
}
function statusText(s?: string): string {
  return s === 'ok' ? '可用' : s === 'invalid' ? '不可用' : '未校验'
}
</script>

<style scoped>
.model-config-page {
  padding: 0;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-right: 12px;
}
.sub {
  color: #909399;
  font-size: 12px;
}
.cell-name {
  display: flex;
  align-items: center;
  gap: 6px;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c0c4cc;
}
.status-dot.ok { background: #67c23a; }
.status-dot.invalid { background: #f56c6c; }
.masked {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: #606266;
}
.params {
  font-size: 12px;
  color: #909399;
}
.hint {
  font-size: 12px;
  color: #c0c4cc;
}
</style>
