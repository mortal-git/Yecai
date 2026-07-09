<template>
  <div class="contract-draft">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">{{ editingId ? '编辑合同' : '起草拟定合同' }}</span>
          <el-button @click="$router.push('/contract/list')">返回列表</el-button>
        </div>
      </template>

      <div v-if="!templateSelected" class="template-picker">
        <div class="picker-title">选择合同模板开始起草</div>
        <div class="picker-hint">选择模板后可在线编辑合同内容，也可跳过模板直接起草</div>
        <div class="tpl-grid">
          <div v-for="t in store.templates" :key="t.id" class="tpl-card" @click="onTemplateSelect(t)">
            <el-icon class="tpl-icon"><Document /></el-icon>
            <div class="tpl-name">{{ t.name }}</div>
            <el-tag size="small" effect="plain">{{ t.category }}</el-tag>
          </div>
          <div class="tpl-card blank-card" @click="onBlankDraft">
            <el-icon class="tpl-icon"><EditPen /></el-icon>
            <div class="tpl-name">空白起草</div>
            <el-tag size="small" type="info">不使用模板</el-tag>
          </div>
        </div>
      </div>

      <div v-else class="draft-editor">
        <el-form label-width="100px" size="default" class="meta-form">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="合同名称">
                <el-input v-model="form.title" placeholder="请输入合同名称" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="合同分类">
                <el-select v-model="form.category" style="width: 100%">
                  <el-option v-for="c in CATEGORY_OPTIONS" :key="c" :label="c" :value="c" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="合同金额">
                <el-input v-model="form.amount" placeholder="例：100000" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="甲方">
                <el-input v-model="form.partyA" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="乙方">
                <el-input v-model="form.partyB" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="合同期限">
                <el-date-picker v-model="form.dateRange" type="daterange" start-placeholder="起始日期" end-placeholder="终止日期" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <div class="editor-section">
          <div class="editor-toolbar">
            <span class="editor-label">合同正文</span>
            <div class="toolbar-right">
              <el-button size="small" @click="onInsertTemplate">更换模板</el-button>
              <el-button size="small" :icon="MagicStick" @click="onAiRefine">AI 润色</el-button>
            </div>
          </div>
          <el-input
            type="textarea"
            v-model="form.rawText"
            :rows="20"
            resize="vertical"
            placeholder="在此编辑合同正文内容..."
          />
        </div>

        <div class="draft-actions">
          <el-button @click="templateSelected = false">重新选模板</el-button>
          <el-button @click="onSaveDraft">保存草稿</el-button>
          <el-button type="warning" @click="onSubmitApproval">提交审批</el-button>
          <el-button type="primary" :icon="MagicStick" @click="onSmartExtract">智能提取字段</el-button>
        </div>
      </div>

      <TemplateLibrary v-model:visible="showTplLib" @select="onTemplateSelect" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Document, EditPen, MagicStick } from '@element-plus/icons-vue'
import TemplateLibrary from './components/TemplateLibrary.vue'
import { useContractStore } from '../../store/contract'
import { useAgentModelStore } from '../../store/agentModel'
import { CATEGORY_OPTIONS } from '../../types/contract'
import type { ContractTemplate } from '../../types/contract'
import { extractContractFields } from '../../api/contractExtract'
import { DEFAULT_EXTRACT_PROMPT } from '../../types/contract'

const router = useRouter()
const store = useContractStore()
const modelStore = useAgentModelStore()

const templateSelected = ref(false)
const editingId = ref('')
const showTplLib = ref(false)

const form = reactive({
  title: '',
  category: '其他' as string,
  amount: '',
  partyA: '',
  partyB: '',
  dateRange: null as [Date, Date] | null,
  rawText: '',
  templateId: ''
})

onMounted(() => {
  // Support editing existing contract via query param
  const id = router.currentRoute.value.query.id as string
  if (id) {
    const c = store.getContract(id)
    if (c) {
      editingId.value = id
      form.title = c.title
      form.category = c.category
      form.amount = c.amount || ''
      form.partyA = c.partyA || ''
      form.partyB = c.partyB || ''
      form.rawText = c.rawText
      form.templateId = c.templateId
      templateSelected.value = true
    }
  }
})

function onTemplateSelect(t: ContractTemplate) {
  form.rawText = t.content
  form.category = t.category
  form.templateId = t.id
  form.title = form.title || t.name
  templateSelected.value = true
}

function onBlankDraft() {
  form.rawText = ''
  form.templateId = ''
  templateSelected.value = true
}

function onInsertTemplate() {
  showTplLib.value = true
}

function onSaveDraft() {
  if (!form.title) { ElMessage.warning('请填写合同名称'); return }
  if (editingId.value) {
    store.updateContract(editingId.value, {
      title: form.title,
      category: form.category as any,
      amount: form.amount,
      partyA: form.partyA,
      partyB: form.partyB,
      rawText: form.rawText,
      startDate: form.dateRange?.[0]?.getTime(),
      endDate: form.dateRange?.[1]?.getTime()
    })
    ElMessage.success('已保存')
  } else {
    const c = store.addContract({
      title: form.title,
      category: form.category as any,
      fileType: 'draft',
      rawText: form.rawText,
      status: '草稿',
      templateId: form.templateId,
      amount: form.amount,
      partyA: form.partyA,
      partyB: form.partyB,
      startDate: form.dateRange?.[0]?.getTime(),
      endDate: form.dateRange?.[1]?.getTime()
    })
    editingId.value = c.id
    ElMessage.success('草稿已保存')
  }
}

function onSubmitApproval() {
  onSaveDraft()
  if (!editingId.value) return
  store.submitForApproval(editingId.value)
  ElMessage.success('已提交审批')
  router.push('/contract/list')
}

async function onSmartExtract() {
  const model = modelStore.activeModel
  if (!model) { ElMessage.error('请先在智能体中配置模型'); return }
  onSaveDraft()
  if (!editingId.value) return
  if (!form.rawText) { ElMessage.warning('合同正文为空'); return }
  try {
    const fields = await extractContractFields({
      model: model as any,
      prompt: DEFAULT_EXTRACT_PROMPT.content,
      rawText: form.rawText
    })
    store.setExtractedFields(editingId.value, fields.map(f => ({ ...f, editable: true })))
    ElMessage.success(`成功提取 ${fields.length} 个字段`)
  } catch (e: any) {
    ElMessage.error('提取失败：' + (e?.message || e))
  }
}

async function onAiRefine() {
  const model = modelStore.activeModel
  if (!model) { ElMessage.error('请先在智能体中配置模型'); return }
  if (!form.rawText) { ElMessage.warning('合同正文为空'); return }
  try {
    const { streamChat } = await import('../../api/llm')
    const result = await streamChat(model as any, [
      { role: 'system', content: '你是一名合同起草专家。请对以下合同文本进行润色和规范化，修正措辞、补充缺失条款、优化条款表述，保持原有结构和核心内容不变。直接输出润色后的完整合同文本。' },
      { role: 'user', content: form.rawText }
    ])
    form.rawText = result
    ElMessage.success('AI 润色完成')
  } catch (e: any) {
    ElMessage.error('润色失败：' + (e?.message || e))
  }
}
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 16px; font-weight: 600; color: #303133; }
.template-picker { text-align: center; padding: 20px 0; }
.picker-title { font-size: 18px; font-weight: 600; color: #303133; margin-bottom: 8px; }
.picker-hint { font-size: 13px; color: #909399; margin-bottom: 24px; }
.tpl-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; max-width: 720px; margin: 0 auto; }
.tpl-card {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 20px 14px; border: 1px solid #ebeef5; border-radius: 8px;
  cursor: pointer; transition: all .2s;
}
.tpl-card:hover { border-color: #409eff; background: #ecf5ff; }
.tpl-icon { font-size: 32px; color: #409eff; }
.tpl-name { font-weight: 600; font-size: 14px; color: #303133; }
.blank-card .tpl-icon { color: #909399; }
.meta-form { margin-bottom: 16px; }
.editor-section { margin-bottom: 16px; }
.editor-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 8px;
}
.editor-label { font-size: 14px; font-weight: 600; color: #303133; }
.toolbar-right { display: flex; gap: 6px; }
.draft-actions {
  display: flex; justify-content: flex-end; gap: 10px;
  padding-top: 16px; border-top: 1px solid #f0f0f0;
}
</style>
