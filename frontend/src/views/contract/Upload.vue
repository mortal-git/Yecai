<template>
  <div class="contract-upload">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">合同上传与解析</span>
          <el-button @click="$router.push('/contract/list')">返回列表</el-button>
        </div>
      </template>

      <el-steps :active="step" align-center class="steps">
        <el-step title="上传文件" />
        <el-step title="文本提取" />
        <el-step title="结构化抽取" />
      </el-steps>

      <!-- Step 1: 上传 -->
      <div v-if="step === 0" class="step-content">
        <FileUploader :disabled="parsing" @select="onFileSelect" @remove="onFileRemove" />
        <div v-if="parsing" class="parsing-hint">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>正在解析文件，请稍候...</span>
        </div>
      </div>

      <!-- Step 2: 文本编辑 -->
      <div v-if="step === 1" class="step-content">
        <div v-if="contract?.fileType === 'image'" class="image-preview">
          <el-image :src="contract.fileDataUrl" fit="contain" style="max-height: 360px" />
          <div class="hint">图片合同将由大模型直接识别，无需手动提取文本</div>
        </div>
        <TextEditor v-model="rawText" />
        <div class="step-actions">
          <el-button @click="step = 0">上一步</el-button>
          <el-button type="primary" :disabled="!rawText && contract?.fileType !== 'image'" @click="step = 2; saveRawText()">
            下一步：结构化抽取
          </el-button>
        </div>
      </div>

      <!-- Step 3: 抽取 -->
      <div v-if="step === 2" class="step-content">
        <div class="extract-toolbar">
          <div class="toolbar-left">
            <span class="toolbar-label">模型：</span>
            <el-select v-model="selectedModelId" placeholder="选择模型" size="default" style="width: 220px">
              <el-option v-for="m in modelStore.models" :key="m.id" :label="m.name" :value="m.id">
                <span>{{ m.name }}</span>
                <span style="color: #909399; font-size: 12px; margin-left: 8px">{{ m.modelName }}</span>
              </el-option>
            </el-select>

            <span class="toolbar-label" style="margin-left: 16px">提示词：</span>
            <el-select v-model="selectedPromptId" placeholder="选择提示词" size="default" style="width: 220px">
              <el-option v-for="p in store.prompts" :key="p.id" :label="p.name" :value="p.id" />
            </el-select>

            <el-button link :icon="Setting" @click="showPromptConfig = true">配置</el-button>
          </div>
          <div>
            <el-button
              type="primary"
              :icon="MagicStick"
              :loading="store.extracting"
              @click="onExtract"
            >
              {{ store.extracting ? '抽取中...' : '开始抽取' }}
            </el-button>
            <el-button v-if="store.extracting" type="danger" @click="store.abortExtraction()">停止</el-button>
          </div>
        </div>

        <el-row :gutter="20">
          <el-col :span="12">
            <TextEditor v-model="rawText" />
          </el-col>
          <el-col :span="12">
            <ExtractionResult
              :fields="contract?.extractedFields || []"
              @update-field="(k, v) => store.updateField(contract!.id, k, v)"
            />
          </el-col>
        </el-row>

        <div class="step-actions">
          <el-button @click="step = 1">上一步</el-button>
          <el-button
            type="success"
            :disabled="!contract?.extractedFields?.length"
            @click="onConfirm"
          >
            确认并保存
          </el-button>
        </div>
      </div>

      <PromptConfig v-model:visible="showPromptConfig" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading, MagicStick, Setting } from '@element-plus/icons-vue'
import FileUploader from './components/FileUploader.vue'
import TextEditor from './components/TextEditor.vue'
import ExtractionResult from './components/ExtractionResult.vue'
import PromptConfig from './components/PromptConfig.vue'
import { useContractStore } from '../../store/contract'
import { useAgentModelStore } from '../../store/agentModel'
import { parsePDF, parseWord, imageToBase64, detectFileType } from '../../utils/documentParser'
import { extractContractFields } from '../../api/contractExtract'
import type { ContractFileType } from '../../types/contract'

const router = useRouter()
const store = useContractStore()
const modelStore = useAgentModelStore()

const step = ref(0)
const parsing = ref(false)
const rawText = ref('')
const contractId = ref('')
const selectedModelId = ref(modelStore.activeId || '')
const selectedPromptId = ref(store.prompts[0]?.id || '')
const showPromptConfig = ref(false)

const contract = computed(() => store.getContract(contractId.value))

async function onFileSelect(file: File) {
  parsing.value = true
  const fileType: ContractFileType = detectFileType(file)
  let text = ''
  let dataUrl = ''

  try {
    if (fileType === 'pdf') {
      text = await parsePDF(file)
      dataUrl = await imageToBase64(file)
    } else if (fileType === 'docx') {
      text = await parseWord(file)
      dataUrl = await imageToBase64(file)
    } else {
      dataUrl = await imageToBase64(file)
    }

    rawText.value = text
    const c = store.addContract({
      title: file.name.replace(/\.[^.]+$/, ''),
      fileName: file.name,
      fileType,
      fileSize: file.size,
      fileDataUrl: dataUrl,
      rawText: text,
      status: '已解析',
      modelId: selectedModelId.value,
      promptId: selectedPromptId.value
    })
    contractId.value = c.id
    step.value = 1
  } catch (e: any) {
    ElMessage.error('文件解析失败：' + (e?.message || e))
  } finally {
    parsing.value = false
  }
}

function onFileRemove() {
  rawText.value = ''
  step.value = 0
}

function saveRawText() {
  if (contract.value) {
    store.updateContract(contract.value.id, { rawText: rawText.value })
  }
}

async function onExtract() {
  if (!contract.value) return
  const model = modelStore.models.find(m => m.id === selectedModelId.value)
  if (!model) {
    ElMessage.error('请选择模型')
    return
  }
  const prompt = store.prompts.find(p => p.id === selectedPromptId.value)
  if (!prompt) {
    ElMessage.error('请选择提示词')
    return
  }
  if (!model.apiKeyCipher) {
    ElMessage.error('当前模型未配置 API Key，请前往智能体 → 模型配置')
    return
  }

  store.extracting = true
  try {
    const fields = await extractContractFields({
      model: model as any,
      prompt: prompt.content,
      rawText: rawText.value,
      imageUrl: contract.value.fileType === 'image' ? contract.value.fileDataUrl : undefined
    })
    if (!fields.length) {
      ElMessage.warning('未能抽取到结构化字段，请检查提示词或文本内容')
      return
    }
    store.setExtractedFields(contract.value.id, fields.map(f => ({
      ...f,
      editable: f.editable !== false
    })))
    ElMessage.success(`成功抽取 ${fields.length} 个字段`)
  } catch (e: any) {
    if (e?.name !== 'AbortError') {
      ElMessage.error('抽取失败：' + (e?.message || e))
    }
  } finally {
    store.extracting = false
  }
}

function onConfirm() {
  if (!contract.value) return
  store.changeStatus(contract.value.id, '待签署')
  ElMessage.success('合同已确认保存')
  router.push('/contract/list')
}
</script>

<style scoped>
.contract-upload {
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
}
.steps {
  margin-bottom: 24px;
}
.step-content {
  max-width: 960px;
  margin: 0 auto;
}
.parsing-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  color: #409eff;
  font-size: 13px;
}
.image-preview {
  margin-bottom: 16px;
  text-align: center;
}
.image-preview .hint {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
.step-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
.extract-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 4px;
}
.toolbar-left {
  display: flex;
  align-items: center;
}
.toolbar-label {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
}
</style>
