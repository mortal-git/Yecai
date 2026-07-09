<template>
  <el-dialog v-model="visible" title="提示词配置" width="700px">
    <div class="prompt-list">
      <div v-for="p in store.prompts" :key="p.id" class="prompt-item">
        <div class="prompt-head">
          <span class="prompt-name">{{ p.name }}</span>
          <el-tag v-if="p.isDefault" size="small" type="success">内置</el-tag>
          <div class="prompt-actions">
            <el-button link size="small" @click="onEdit(p)">编辑</el-button>
            <el-button v-if="!p.isDefault" link size="small" type="danger" @click="store.removePrompt(p.id)">删除</el-button>
          </div>
        </div>
        <div class="prompt-preview">{{ p.content.slice(0, 120) }}{{ p.content.length > 120 ? '...' : '' }}</div>
        <div class="prompt-fields">
          <el-tag v-for="f in p.fields" :key="f" size="small" effect="plain" style="margin: 2px">{{ f }}</el-tag>
        </div>
      </div>
    </div>
    <el-divider />
    <div class="add-form">
      <div class="form-title">{{ editingId ? '编辑提示词' : '新增提示词' }}</div>
      <el-form size="default" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="例：采购合同抽取" />
        </el-form-item>
        <el-form-item label="提示词">
          <el-input v-model="form.content" type="textarea" :rows="8" placeholder="输入让 LLM 抽取字段的提示词..." />
        </el-form-item>
        <el-form-item label="字段列表">
          <el-select v-model="form.fields" multiple filterable allow-create default-first-option placeholder="输入后回车添加字段 key">
            <el-option v-for="f in form.fields" :key="f" :label="f" :value="f" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSave">{{ editingId ? '保存修改' : '添加提示词' }}</el-button>
          <el-button v-if="editingId" @click="resetForm">取消编辑</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useContractStore } from '../../../store/contract'
import type { ExtractPrompt } from '../../../types/contract'

const store = useContractStore()
const visible = defineModel<boolean>('visible', { default: false })
const editingId = ref('')

const defaultForm = () => ({ name: '', content: '', fields: [] as string[] })
const form = reactive(defaultForm())

function onEdit(p: ExtractPrompt) {
  editingId.value = p.id
  form.name = p.name
  form.content = p.content
  form.fields = [...p.fields]
}

function resetForm() {
  editingId.value = ''
  Object.assign(form, defaultForm())
}

function onSave() {
  if (!form.name.trim() || !form.content.trim()) {
    ElMessage.warning('请填写名称和提示词内容')
    return
  }
  if (editingId.value) {
    store.updatePrompt(editingId.value, {
      name: form.name.trim(),
      content: form.content.trim(),
      fields: form.fields
    })
    ElMessage.success('已保存')
  } else {
    store.addPrompt({
      name: form.name.trim(),
      content: form.content.trim(),
      isDefault: false,
      fields: form.fields
    })
    ElMessage.success('已添加')
  }
  resetForm()
}
</script>

<style scoped>
.prompt-list {
  max-height: 300px;
  overflow-y: auto;
}
.prompt-item {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}
.prompt-item:last-child { border-bottom: none; }
.prompt-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.prompt-name {
  font-weight: 500;
  color: #303133;
}
.prompt-actions {
  margin-left: auto;
}
.prompt-preview {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-bottom: 6px;
}
.prompt-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}
.form-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
  color: #303133;
}
</style>
