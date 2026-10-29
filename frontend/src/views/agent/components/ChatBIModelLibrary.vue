<template>
  <el-dialog v-model="visible" title="知识库设置" width="900px" top="5vh">
    <el-tabs v-model="activeTab">
      <!-- 语义知识库 -->
      <el-tab-pane label="语义知识库" name="models">
        <el-alert
          class="model-hint"
          type="info"
          :closable="false"
          show-icon
        >
          <template #title>
            <span class="hint-title">语义层 · 业务语言到数据的翻译桥梁</span>
          </template>
          <div class="hint-body">
            当用户在搜索框输入自然语言（如「这个月应收怎么样」），系统通过语义知识库将<span class="hint-key">「应收」</span>自动匹配到<span class="hint-model">收入费用分析模型</span>，并路由到对应的指标、维度与底层数据表。
          </div>
        </el-alert>
        <div class="model-toolbar">
          <span class="model-toolbar-count">共 {{ modelList.length }} 个模型</span>
          <el-button type="primary" :icon="Plus" size="small" @click="onAddModel">新增模型</el-button>
        </div>
        <div class="model-grid">
          <div v-for="m in modelList" :key="m.type" class="model-card" :class="{ active: selectedType === m.type }" @click="selectedType = m.type">
            <div class="card-actions">
              <el-button link size="small" :icon="Edit" @click.stop="onEditModel(m)" />
              <el-button link type="danger" size="small" :icon="Delete" @click.stop="onDeleteModel(m)" />
            </div>
            <div class="model-head">
              <el-icon class="model-icon"><component :is="iconMap[m.icon] || TrendCharts" /></el-icon>
              <div>
                <div class="model-name">{{ m.name }}</div>
                <div class="model-priority">优先级 P{{ m.priority }}</div>
              </div>
            </div>
            <div class="model-desc">{{ m.desc }}</div>
            <div class="model-section">
              <div class="ms-label">分析维度</div>
              <div class="ms-tags">
                <el-tag v-for="d in m.dimensions" :key="d" size="small" type="info">{{ d }}</el-tag>
              </div>
            </div>
            <div class="model-section">
              <div class="ms-label">关联指标</div>
              <div class="ms-tags">
                <el-tag v-for="met in m.metrics" :key="met" size="small">{{ met }}</el-tag>
              </div>
            </div>
            <div class="model-section">
              <div class="ms-label">示例问句</div>
              <div class="example-list">
                <div v-for="(ex, idx) in m.examples" :key="idx" class="example-item">
                  <el-icon><ChatLineSquare /></el-icon>
                  <span>{{ ex }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 指标知识库 -->
      <el-tab-pane label="指标知识库" name="metrics">
        <div class="dict-toolbar">
          <el-input v-model="searchKw" placeholder="搜索指标名称/编码" :prefix-icon="Search" clearable size="small" style="width: 240px" />
          <el-select v-model="filterLevel" placeholder="指标层级" clearable size="small" style="width: 140px">
            <el-option label="一级指标" :value="1" />
            <el-option label="二级指标" :value="2" />
            <el-option label="三级指标" :value="3" />
          </el-select>
          <span class="dict-count">共 {{ filteredMetrics.length }} 个指标</span>
          <el-button type="primary" :icon="Plus" size="small" @click="onAdd">新增指标</el-button>
        </div>
        <el-table :data="filteredMetrics" border size="small" max-height="500">
          <el-table-column prop="code" label="编码" width="100" />
          <el-table-column prop="name" label="指标名称" width="140" />
          <el-table-column label="层级" width="90">
            <template #default="{ row }">
              <el-tag size="small" :type="row.level === 1 ? 'danger' : row.level === 2 ? 'warning' : 'info'">
                L{{ row.level }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="definition" label="业务定义" min-width="200" show-overflow-tooltip />
          <el-table-column prop="formula" label="计算公式" min-width="180" show-overflow-tooltip />
          <el-table-column prop="sourceTable" label="数据来源表" width="160" />
          <el-table-column prop="updateFreq" label="更新频率" width="90" />
          <el-table-column label="操作" width="130" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" :icon="Edit" @click="onEdit(row)">编辑</el-button>
              <el-button link type="danger" size="small" :icon="Delete" @click="onDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增/编辑指标 -->
    <el-dialog
      v-model="formVisible"
      :title="formMode === 'add' ? '新增指标' : '编辑指标'"
      width="640px"
      append-to-body
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="编码" prop="code">
          <el-input v-model="formData.code" placeholder="如 M001" :disabled="formMode === 'edit'" />
        </el-form-item>
        <el-form-item label="指标名称" prop="name">
          <el-input v-model="formData.name" placeholder="如 应收账款回款率" />
        </el-form-item>
        <el-form-item label="指标层级" prop="level">
          <el-radio-group v-model="formData.level">
            <el-radio :value="1">一级</el-radio>
            <el-radio :value="2">二级</el-radio>
            <el-radio :value="3">三级</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上级指标" prop="parent">
          <el-select v-model="formData.parent" clearable placeholder="可选" style="width: 100%">
            <el-option
              v-for="m in parentOptions"
              :key="m.code"
              :label="`${m.code} ${m.name}`"
              :value="m.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="业务定义" prop="definition">
          <el-input v-model="formData.definition" type="textarea" :rows="2" placeholder="描述指标的业务含义" />
        </el-form-item>
        <el-form-item label="计算公式" prop="formula">
          <el-input v-model="formData.formula" placeholder="如 回款额 / 应收总额 × 100%" />
        </el-form-item>
        <el-form-item label="分析维度" prop="dimensions">
          <el-select
            v-model="formData.dimensions"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入维度后回车，可多选"
            style="width: 100%"
          >
            <el-option v-for="d in dimensionOptions" :key="d" :label="d" :value="d" />
          </el-select>
        </el-form-item>
        <el-form-item label="数据来源表" prop="sourceTable">
          <el-input v-model="formData.sourceTable" placeholder="如 receivable_detail" />
        </el-form-item>
        <el-form-item label="更新频率" prop="updateFreq">
          <el-select v-model="formData.updateFreq" placeholder="选择频率" style="width: 100%">
            <el-option label="实时" value="实时" />
            <el-option label="日更" value="日更" />
            <el-option label="周更" value="周更" />
            <el-option label="月更" value="月更" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联模型" prop="modelType">
          <el-select v-model="formData.modelType" placeholder="选择归属的语义知识库模型" clearable style="width: 100%">
            <el-option v-for="t in modelTypeOptions" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑分析模型 -->
    <el-dialog
      v-model="modelFormVisible"
      :title="modelFormMode === 'add' ? '新增分析模型' : '编辑分析模型'"
      width="680px"
      append-to-body
      destroy-on-close
    >
      <el-form ref="modelFormRef" :model="modelFormData" :rules="modelFormRules" label-width="100px">
        <el-form-item label="模型编码" prop="type">
          <el-input v-model="modelFormData.type" placeholder="如 logistics（唯一标识）" :disabled="modelFormMode === 'edit'" />
        </el-form-item>
        <el-form-item label="模型名称" prop="name">
          <el-input v-model="modelFormData.name" placeholder="如 供应链效率分析模型" />
        </el-form-item>
        <el-form-item label="模型描述" prop="desc">
          <el-input v-model="modelFormData.desc" type="textarea" :rows="2" placeholder="一句话描述模型用途" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-select v-model="modelFormData.icon" placeholder="选择图标" style="width: 100%">
            <el-option v-for="name in iconNames" :key="name" :label="name" :value="name">
              <el-icon style="vertical-align: middle"><component :is="iconMap[name]" /></el-icon>
              <span style="margin-left: 8px">{{ name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="modelFormData.priority" :min="1" :max="9" />
          <span class="form-hint">P1 最高，P9 最低</span>
        </el-form-item>
        <el-form-item label="分析维度" prop="dimensions">
          <el-select
            v-model="modelFormData.dimensions"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入维度后回车，可多选"
            style="width: 100%"
          >
            <el-option v-for="d in modelDimensionOptions" :key="d" :label="d" :value="d" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联指标" prop="metrics">
          <el-select
            v-model="modelFormData.metrics"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入指标名称后回车，可多选"
            style="width: 100%"
          >
            <el-option v-for="m in modelMetricOptions" :key="m" :label="m" :value="m" />
          </el-select>
        </el-form-item>
        <el-form-item label="示例问句" prop="examplesText">
          <el-input
            v-model="modelFormData.examplesText"
            type="textarea"
            :rows="3"
            placeholder="每行一句，如：&#10;本月华东区营收是多少&#10;对比上月各区毛利变化"
          />
        </el-form-item>
        <el-form-item label="同义词" prop="synonymsText">
          <el-input
            v-model="modelFormData.synonymsText"
            placeholder="逗号或顿号分隔，如 营收、收入、销售额、GMV"
          />
        </el-form-item>
        <el-form-item label="业务规则" prop="businessRulesText">
          <el-input
            v-model="modelFormData.businessRulesText"
            type="textarea"
            :rows="2"
            placeholder="每行一条，如：&#10;营收含税&#10;副业不计入主营营收"
          />
        </el-form-item>
        <el-form-item label="SQL 模板" prop="sqlTemplate">
          <el-input
            v-model="modelFormData.sqlTemplate"
            type="textarea"
            :rows="4"
            placeholder="含 {{time}} {{dim}} 等占位符的 SQL 骨架，作为 LLM few-shot 示例"
          />
        </el-form-item>
        <el-form-item label="枚举值" prop="entitiesText">
          <el-input
            v-model="modelFormData.entitiesText"
            type="textarea"
            :rows="3"
            placeholder="每行一个维度，格式「维度: 值1,值2」，如：&#10;region: 华南区,华东区,华北区&#10;channel: 线上,线下"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modelFormVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmitModel">确定</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  TrendCharts, Coin, Money, Location, Goods, Van,
  Search, ChatLineSquare, Plus, Edit, Delete
} from '@element-plus/icons-vue'
import { useChatbiStore } from '../../../store/chatbi'
import type { AnalysisModel, AnalysisModelType, MetricDictItem } from '../../../types/chatbi'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const visible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const store = useChatbiStore()

const activeTab = ref('models')
const selectedType = ref<AnalysisModelType | ''>('')
const searchKw = ref('')
const filterLevel = ref<number | ''>('')

const iconMap: Record<string, any> = {
  TrendCharts, Coin, Money, Location, Goods, Van
}
const iconNames = Object.keys(iconMap)

// 模型与指标直接读写 store（持久化由 store 负责）
const modelList = computed(() => store.models)
const metricList = computed(() => store.metrics)

// 模型维度候选（从已有数据收集）
const modelDimensionOptions = computed(() => {
  const set = new Set<string>()
  modelList.value.forEach(m => m.dimensions?.forEach(d => set.add(d)))
  return Array.from(set)
})

// 模型关联指标候选（从已有模型 + 指标知识库收集）
const modelMetricOptions = computed(() => {
  const set = new Set<string>()
  modelList.value.forEach(m => m.metrics?.forEach(mt => set.add(mt)))
  metricList.value.forEach(m => set.add(m.name))
  return Array.from(set)
})

const filteredMetrics = computed(() => {
  return metricList.value.filter(m => {
    if (filterLevel.value && m.level !== filterLevel.value) return false
    if (searchKw.value) {
      const kw = searchKw.value.toLowerCase()
      if (!m.name.toLowerCase().includes(kw) && !m.code.toLowerCase().includes(kw)) return false
    }
    return true
  })
})

// 维度候选（从已有数据收集）
const dimensionOptions = computed(() => {
  const set = new Set<string>()
  metricList.value.forEach(m => m.dimensions?.forEach(d => set.add(d)))
  return Array.from(set)
})

// 上级指标候选（层级高于当前且非自身）
const parentOptions = computed(() => {
  return metricList.value.filter(m => m.level < formData.level && m.code !== formData.code)
})

// 模型类型候选（用于指标反向关联）
const modelTypeOptions: AnalysisModelType[] = ['revenue', 'cost', 'profit', 'region', 'product', 'supply_chain']

// 新增/编辑指标表单
const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const formData = reactive<MetricDictItem>({
  code: '',
  name: '',
  level: 3,
  parent: '',
  definition: '',
  formula: '',
  dimensions: [],
  sourceTable: '',
  updateFreq: '日更',
  modelType: undefined
})

const formRules: FormRules = {
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入指标名称', trigger: 'blur' }],
  level: [{ required: true, message: '请选择层级', trigger: 'change' }],
  definition: [{ required: true, message: '请输入业务定义', trigger: 'blur' }],
  sourceTable: [{ required: true, message: '请输入数据来源表', trigger: 'blur' }],
  updateFreq: [{ required: true, message: '请选择更新频率', trigger: 'change' }]
}

function resetForm() {
  formData.code = ''
  formData.name = ''
  formData.level = 3
  formData.parent = ''
  formData.definition = ''
  formData.formula = ''
  formData.dimensions = []
  formData.sourceTable = ''
  formData.updateFreq = '日更'
  formData.modelType = undefined
}

function onAdd() {
  resetForm()
  formMode.value = 'add'
  formVisible.value = true
}

function onEdit(row: MetricDictItem) {
  Object.assign(formData, JSON.parse(JSON.stringify(row)))
  if (!formData.dimensions) formData.dimensions = []
  formMode.value = 'edit'
  formVisible.value = true
}

async function onDelete(row: MetricDictItem) {
  try {
    await ElMessageBox.confirm(`确定删除指标「${row.name}」？删除后无法恢复`, '确认', { type: 'warning' })
    store.deleteMetric(row.code)
    ElMessage.success('已删除')
  } catch { /* cancel */ }
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(valid => {
    if (!valid) return
    if (formMode.value === 'add') {
      if (metricList.value.some(m => m.code === formData.code)) {
        ElMessage.error('编码已存在，请更换')
        return
      }
      store.upsertMetric({ ...formData, dimensions: [...formData.dimensions] })
      ElMessage.success('已新增')
    } else {
      store.upsertMetric({ ...formData, dimensions: [...formData.dimensions] })
      ElMessage.success('已更新')
    }
    formVisible.value = false
  })
}

// ============= 分析模型 CRUD =============
interface ModelFormState {
  type: string
  name: string
  desc: string
  icon: string
  priority: number
  dimensions: string[]
  metrics: string[]
  examplesText: string
  synonymsText: string
  businessRulesText: string
  sqlTemplate: string
  entitiesText: string
}

const modelFormVisible = ref(false)
const modelFormMode = ref<'add' | 'edit'>('add')
const modelFormRef = ref<FormInstance>()
const modelFormData = reactive<ModelFormState>({
  type: '',
  name: '',
  desc: '',
  icon: 'TrendCharts',
  priority: 3,
  dimensions: [],
  metrics: [],
  examplesText: '',
  synonymsText: '',
  businessRulesText: '',
  sqlTemplate: '',
  entitiesText: ''
})

const modelFormRules: FormRules = {
  type: [{ required: true, message: '请输入模型编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  desc: [{ required: true, message: '请输入模型描述', trigger: 'blur' }],
  icon: [{ required: true, message: '请选择图标', trigger: 'change' }],
  priority: [{ required: true, message: '请填写优先级', trigger: 'blur' }]
}

function resetModelForm() {
  modelFormData.type = ''
  modelFormData.name = ''
  modelFormData.desc = ''
  modelFormData.icon = 'TrendCharts'
  modelFormData.priority = 3
  modelFormData.dimensions = []
  modelFormData.metrics = []
  modelFormData.examplesText = ''
  modelFormData.synonymsText = ''
  modelFormData.businessRulesText = ''
  modelFormData.sqlTemplate = ''
  modelFormData.entitiesText = ''
}

function onAddModel() {
  resetModelForm()
  modelFormMode.value = 'add'
  modelFormVisible.value = true
}

function onEditModel(row: AnalysisModel) {
  modelFormData.type = row.type
  modelFormData.name = row.name
  modelFormData.desc = row.desc
  modelFormData.icon = row.icon
  modelFormData.priority = row.priority
  modelFormData.dimensions = [...(row.dimensions || [])]
  modelFormData.metrics = [...(row.metrics || [])]
  modelFormData.examplesText = (row.examples || []).join('\n')
  modelFormData.synonymsText = (row.synonyms || []).join('、')
  modelFormData.businessRulesText = (row.businessRules || []).join('\n')
  modelFormData.sqlTemplate = row.sqlTemplate || ''
  // entities: Record<string, string[]> -> 文本 "维度:值1,值2\n维度:值1"
  modelFormData.entitiesText = row.entities
    ? Object.entries(row.entities).map(([k, v]) => `${k}: ${v.join(',')}`).join('\n')
    : ''
  modelFormMode.value = 'edit'
  modelFormVisible.value = true
}

async function onDeleteModel(row: AnalysisModel) {
  try {
    await ElMessageBox.confirm(`确定删除模型「${row.name}」？删除后无法恢复`, '确认', { type: 'warning' })
    store.deleteModel(row.type)
    if (selectedType.value === row.type) selectedType.value = ''
    ElMessage.success('已删除')
  } catch { /* cancel */ }
}

function parseEntitiesText(text: string): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  if (!text.trim()) return result
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*([^:：]+)\s*[:：]\s*(.+)\s*$/)
    if (m) {
      const dim = m[1].trim()
      const values = m[2].split(/[,，]/).map(s => s.trim()).filter(Boolean)
      if (dim && values.length) result[dim] = values
    }
  }
  return result
}

async function onSubmitModel() {
  if (!modelFormRef.value) return
  await modelFormRef.value.validate(valid => {
    if (!valid) return
    const examples = modelFormData.examplesText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
    const synonyms = modelFormData.synonymsText
      .split(/[,，、\n]/)
      .map(s => s.trim())
      .filter(Boolean)
    const businessRules = modelFormData.businessRulesText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
    const payload: AnalysisModel = {
      type: modelFormData.type as AnalysisModelType,
      name: modelFormData.name,
      desc: modelFormData.desc,
      icon: modelFormData.icon,
      priority: modelFormData.priority,
      dimensions: [...modelFormData.dimensions],
      metrics: [...modelFormData.metrics],
      examples,
      synonyms,
      businessRules,
      sqlTemplate: modelFormData.sqlTemplate || undefined,
      entities: parseEntitiesText(modelFormData.entitiesText)
    }
    if (modelFormMode.value === 'add') {
      if (modelList.value.some(m => m.type === payload.type)) {
        ElMessage.error('模型编码已存在，请更换')
        return
      }
      store.upsertModel(payload)
      ElMessage.success('已新增')
    } else {
      store.upsertModel(payload)
      ElMessage.success('已更新')
    }
    modelFormVisible.value = false
  })
}
</script>

<style scoped>
.model-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.model-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.model-toolbar-count {
  font-size: 12px;
  color: #909399;
}
.model-card {
  position: relative;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 14px;
  cursor: pointer;
  transition: all .2s;
}
.card-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity .2s;
}
.model-card:hover .card-actions {
  opacity: 1;
}
.model-card:hover {
  border-color: #667eea;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.15);
}
.model-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
}
.model-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.model-icon {
  font-size: 24px;
  color: #667eea;
}
.model-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
.model-priority {
  font-size: 11px;
  color: #909399;
}
.model-desc {
  font-size: 12px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 10px;
}
.model-section {
  margin-bottom: 8px;
}
.ms-label {
  font-size: 11px;
  color: #909399;
  margin-bottom: 4px;
}
.ms-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.example-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.example-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #606266;
}
.example-item .el-icon {
  color: #667eea;
  font-size: 12px;
}
.dict-toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}
.dict-count {
  font-size: 12px;
  color: #909399;
  margin-left: auto;
}
.model-hint {
  margin-bottom: 14px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
  border: 1px solid #dcdfe6;
}
.model-hint :deep(.el-alert__content) {
  padding: 6px 0;
}
.hint-title {
  font-size: 13px;
  font-weight: 600;
  color: #667eea;
}
.hint-body {
  font-size: 12px;
  color: #606266;
  line-height: 1.7;
  margin-top: 4px;
}
.hint-key {
  color: #f56c6c;
  font-weight: 600;
  padding: 0 2px;
}
.hint-model {
  color: #667eea;
  font-weight: 600;
  padding: 0 2px;
}
.form-hint {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}
</style>
