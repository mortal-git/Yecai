<template>
  <el-dialog v-model="visible" title="合同模板库" width="800px">
    <div class="tpl-grid">
      <div v-for="t in store.templates" :key="t.id" class="tpl-card" @click="onSelect(t)">
        <div class="tpl-icon">
          <el-icon :size="28"><Document /></el-icon>
        </div>
        <div class="tpl-body">
          <div class="tpl-name">{{ t.name }}</div>
          <el-tag size="small" effect="plain">{{ t.category }}</el-tag>
          <div class="tpl-fields">
            <el-tag v-for="f in t.fields.slice(0, 4)" :key="f" size="small" type="info" effect="plain">{{ f }}</el-tag>
            <el-tag v-if="t.fields.length > 4" size="small" type="info" effect="plain">+{{ t.fields.length - 4 }}</el-tag>
          </div>
        </div>
        <div class="tpl-actions">
          <el-button link type="danger" :icon="Delete" size="small" @click.stop="store.removeTemplate(t.id)" />
        </div>
      </div>
      <div class="tpl-card add-card" @click="onAdd">
        <el-icon :size="28"><Plus /></el-icon>
        <span>自定义模板</span>
      </div>
    </div>

    <el-dialog v-model="showAdd" title="新增模板" width="600px" append-to-body>
      <el-form label-width="80px">
        <el-form-item label="名称"><el-input v-model="addForm.name" /></el-form-item>
        <el-form-item label="分类">
          <el-select v-model="addForm.category">
            <el-option v-for="c in CATEGORY_OPTIONS" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="模板内容">
          <el-input v-model="addForm.content" type="textarea" :rows="12" placeholder="输入合同模板正文，下划线 ______ 作为待填项" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdd = false">取消</el-button>
        <el-button type="primary" @click="saveAdd">保存</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Delete, Plus } from '@element-plus/icons-vue'
import { useContractStore } from '../../../store/contract'
import { CATEGORY_OPTIONS } from '../../../types/contract'
import type { ContractTemplate } from '../../../types/contract'

const store = useContractStore()
const visible = defineModel<boolean>('visible', { default: false })
const emit = defineEmits<{ select: [template: ContractTemplate] }>()

const showAdd = ref(false)
const addForm = reactive({ name: '', category: '其他' as string, content: '' })

function onSelect(t: ContractTemplate) {
  emit('select', t)
  visible.value = false
}

function onAdd() { addForm.name = ''; addForm.category = '其他'; addForm.content = ''; showAdd.value = true }

function saveAdd() {
  if (!addForm.name || !addForm.content) { ElMessage.warning('请填写完整'); return }
  store.addTemplate({ name: addForm.name, category: addForm.category as any, content: addForm.content, fields: [] })
  showAdd.value = false
  ElMessage.success('已添加')
}
</script>

<style scoped>
.tpl-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.tpl-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all .2s;
}
.tpl-card:hover { border-color: #409eff; background: #ecf5ff; }
.tpl-icon { color: #409eff; flex-shrink: 0; }
.tpl-body { flex: 1; min-width: 0; }
.tpl-name { font-weight: 600; font-size: 14px; color: #303133; margin-bottom: 4px; }
.tpl-fields { margin-top: 6px; display: flex; flex-wrap: wrap; gap: 3px; }
.tpl-actions { flex-shrink: 0; }
.add-card { justify-content: center; flex-direction: column; color: #909399; gap: 8px; }
</style>
