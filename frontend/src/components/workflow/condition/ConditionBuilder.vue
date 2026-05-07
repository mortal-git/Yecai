<template>
  <div class="condition-builder">
    <div class="condition-list">
      <div v-for="(condition, index) in modelValue" :key="condition.id" class="condition-item">
        <div class="condition-row" v-if="index > 0">
          <el-select v-model="condition.logic" size="small" style="width: 80px" @change="emitUpdate">
            <el-option label="且 (AND)" value="AND" />
            <el-option label="或 (OR)" value="OR" />
          </el-select>
        </div>

        <div class="condition-fields">
          <el-select v-model="condition.field" placeholder="字段" size="small" style="width: 120px" @change="emitUpdate">
            <el-option label="金额" value="formData.amount" />
            <el-option label="单据类型" value="formData.type" />
            <el-option label="申请人" value="formData.applicant" />
            <el-option label="部门" value="formData.department" />
            <el-option label="摘要" value="formData.remark" />
            <el-option label="日期" value="formData.date" />
            <el-option label="自定义" value="custom" />
          </el-select>

          <el-select v-model="condition.operator" placeholder="操作符" size="small" style="width: 100px" @change="emitUpdate">
            <el-option label="大于" value=">" />
            <el-option label="小于" value="<" />
            <el-option label="大于等于" value=">=" />
            <el-option label="小于等于" value="<=" />
            <el-option label="等于" value="==" />
            <el-option label="不等于" value="!=" />
            <el-option label="包含" value="contains" />
            <el-option label="为空" value="empty" />
            <el-option label="不为空" value="notEmpty" />
          </el-select>

          <el-input
            v-if="condition.operator !== 'empty' && condition.operator !== 'notEmpty'"
            v-model="condition.value"
            placeholder="值"
            size="small"
            style="flex: 1; min-width: 80px"
            @change="emitUpdate"
          />

          <el-button link type="danger" @click="removeCondition(index)" size="small">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <el-button type="dashed" @click="addCondition" style="width: 100%; margin-top: 8px">
      <el-icon><Plus /></el-icon>
      添加条件
    </el-button>

    <div class="condition-preview" v-if="modelValue.length > 0">
      <div class="preview-label">条件表达式：</div>
      <div class="preview-text">{{ expressionPreview }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Delete, Plus } from '@element-plus/icons-vue'
import { generateId, type Condition } from '../../../types/workflow'

const props = defineProps<{
  modelValue: Condition[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Condition[]]
}>()

const expressionPreview = computed(() => {
  return props.modelValue.map((c, i) => {
    if (i > 0) {
      const logicText = c.logic === 'OR' ? ' 或 ' : ' 且 '
      return `${logicText}${c.field} ${c.operator} ${c.value}`
    }
    return `${c.field} ${c.operator} ${c.value}`
  }).join('')
})

function addCondition() {
  const newCondition: Condition = {
    id: generateId(),
    field: 'formData.amount',
    operator: '>',
    value: '',
    logic: 'AND'
  }
  emit('update:modelValue', [...props.modelValue, newCondition])
}

function removeCondition(index: number) {
  const newList = [...props.modelValue]
  newList.splice(index, 1)
  // 如果删除了第一个条件，清除后续的logic
  if (index === 0 && newList.length > 0) {
    newList[0].logic = 'AND'
  }
  emit('update:modelValue', newList)
}

function emitUpdate() {
  emit('update:modelValue', [...props.modelValue])
}
</script>

<style scoped>
.condition-builder {
  width: 100%;
}

.condition-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.condition-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.condition-fields {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
}

.condition-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.condition-preview {
  margin-top: 12px;
  padding: 8px;
  background: #ecf5ff;
  border-radius: 4px;
  font-size: 12px;
}

.preview-label {
  color: #909399;
  margin-bottom: 4px;
}

.preview-text {
  color: #409eff;
  font-family: monospace;
}
</style>
