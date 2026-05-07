<template>
  <div class="properties-panel">
    <div class="panel-header">
      <span class="panel-title">属性配置</span>
      <el-button link @click="handleClose">
        <el-icon><Close /></el-icon>
      </el-button>
    </div>

    <div class="panel-body" v-if="selectedNode">
      <!-- 通用属性 -->
      <div class="property-section">
        <div class="section-title">基本信息</div>
        <el-form label-width="80px" size="small">
          <el-form-item label="节点名称">
            <el-input v-model="formData.name" placeholder="请输入节点名称" @change="handleUpdate" />
          </el-form-item>
        </el-form>
      </div>

      <!-- 审批节点属性 -->
      <template v-if="selectedNode.type === 'approval'">
        <div class="property-section">
          <div class="section-title">审批设置</div>
          <el-form label-width="80px" size="small">
            <el-form-item label="审批类型">
              <el-select v-model="formData.nodeType" placeholder="请选择" @change="handleUpdate">
                <el-option label="指定人员" value="user" />
                <el-option label="指定角色" value="role" />
                <el-option label="上级主管" value="supervisor" />
                <el-option label="发起人" value="creator" />
              </el-select>
            </el-form-item>

            <el-form-item label="审批人" v-if="formData.nodeType === 'user'">
              <el-select v-model="formData.assigneeId" placeholder="请选择" @change="handleUpdate" style="width: 100%">
                <el-option label="张三" value="1" />
                <el-option label="李四" value="2" />
                <el-option label="王五" value="3" />
              </el-select>
            </el-form-item>

            <el-form-item label="审批角色" v-if="formData.nodeType === 'role'">
              <el-select v-model="formData.roleId" placeholder="请选择" @change="handleUpdate" style="width: 100%">
                <el-option label="业务负责人" value="1" />
                <el-option label="财务负责人" value="2" />
                <el-option label="总经理" value="3" />
              </el-select>
            </el-form-item>

            <el-form-item label="审批方式">
              <el-select v-model="formData.approvalMode" placeholder="请选择" @change="handleUpdate" style="width: 100%">
                <el-option label="单签（一人通过即流转）" value="single" />
                <el-option label="会签（所有人通过才流转）" value="countersign" />
                <el-option label="或签（任意人通过即流转）" value="orSign" />
              </el-select>
            </el-form-item>

            <el-form-item label="允许驳回">
              <el-switch v-model="formData.canReject" @change="handleUpdate" />
            </el-form-item>

            <el-form-item label="允许转交">
              <el-switch v-model="formData.canDelegate" @change="handleUpdate" />
            </el-form-item>
          </el-form>
        </div>

        <div class="property-section">
          <div class="section-title">自动通过条件</div>
          <div class="condition-builder-wrapper">
            <ConditionBuilder
              v-model="formData.autoPassConditions"
              @update:modelValue="handleUpdate"
            />
          </div>
        </div>
      </template>

      <!-- 网关节点属性 -->
      <template v-if="selectedNode.type === 'gateway'">
        <div class="property-section">
          <div class="section-title">网关设置</div>
          <el-form label-width="80px" size="small">
            <el-form-item label="网关类型">
              <el-select v-model="formData.gatewayType" placeholder="请选择" @change="handleUpdate">
                <el-option label="排他网关（满足首个条件）" value="XOR" />
                <el-option label="并行网关（所有分支并行）" value="AND" />
                <el-option label="包容网关（满足任一条件）" value="OR" />
              </el-select>
            </el-form-item>
          </el-form>

          <div class="branch-conditions">
            <div class="branch-item" v-for="(cond, index) in formData.conditions" :key="cond.id">
              <div class="branch-header">
                <span>分支 {{ index + 1 }}</span>
                <el-button link type="danger" @click="removeCondition(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-input v-model="cond.label" placeholder="分支名称" @change="handleUpdate" size="small" />
              <el-input
                v-model="cond.expression"
                placeholder="条件表达式，如: formData.amount > 10000"
                @change="handleUpdate"
                size="small"
                style="margin-top: 8px"
              />
            </div>
            <el-button type="dashed" @click="addCondition" style="width: 100%">
              <el-icon><Plus /></el-icon>
              添加分支
            </el-button>
          </div>
        </div>
      </template>

      <!-- 条件节点属性 -->
      <template v-if="selectedNode.type === 'condition'">
        <div class="property-section">
          <div class="section-title">条件设置</div>
          <div class="condition-builder-wrapper">
            <ConditionBuilder
              v-model="formData.conditions"
              @update:modelValue="handleUpdate"
            />
          </div>
        </div>
      </template>

      <!-- 自动审批节点属性 -->
      <template v-if="selectedNode.type === 'autoApproval'">
        <div class="property-section">
          <div class="section-title">自动动作</div>
          <el-form label-width="80px" size="small">
            <el-form-item label="执行动作">
              <el-select v-model="formData.action" placeholder="请选择" @change="handleUpdate" style="width: 100%">
                <el-option label="自动通过" value="autoPass" />
                <el-option label="自动驳回" value="autoReject" />
                <el-option label="自动转交" value="autoTransfer" />
              </el-select>
            </el-form-item>

            <el-form-item label="转交给" v-if="formData.action === 'autoTransfer'">
              <el-select v-model="formData.transferTo" placeholder="请选择" @change="handleUpdate" style="width: 100%">
                <el-option label="张三" value="1" />
                <el-option label="李四" value="2" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <div class="property-section">
          <div class="section-title">触发条件</div>
          <div class="condition-builder-wrapper">
            <ConditionBuilder
              v-model="formData.conditions"
              @update:modelValue="handleUpdate"
            />
          </div>
        </div>
      </template>

      <!-- 节点操作 -->
      <div class="property-section">
        <div class="section-title">操作</div>
        <el-button type="danger" @click="handleDelete" style="width: 100%">
          <el-icon><Delete /></el-icon>
          删除节点
        </el-button>
      </div>
    </div>

    <div class="panel-empty" v-else>
      <el-icon size="48"><Document /></el-icon>
      <p>请选择一个节点进行配置</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Close, Delete, Plus, Document } from '@element-plus/icons-vue'
import { useWorkflowStore } from '../../store/workflow'
import { generateId } from '../../types/workflow'
import ConditionBuilder from './condition/ConditionBuilder.vue'

const store = useWorkflowStore()

const selectedNode = computed(() => store.selectedNode)

// 表单数据副本
const formData = ref<any>({})

watch(selectedNode, (node) => {
  if (node) {
    formData.value = JSON.parse(JSON.stringify(node.data))
  }
}, { immediate: true, deep: true })

function handleUpdate() {
  if (selectedNode.value) {
    store.updateNodeData(selectedNode.value.id, formData.value)
  }
}

function handleClose() {
  store.showPropertiesPanel = false
}

function handleDelete() {
  if (selectedNode.value) {
    store.removeNode(selectedNode.value.id)
  }
}

function addCondition() {
  if (!formData.value.conditions) {
    formData.value.conditions = []
  }
  formData.value.conditions.push({
    id: generateId(),
    label: '',
    expression: '',
    targetNodeId: ''
  })
  handleUpdate()
}

function removeCondition(index: number) {
  formData.value.conditions.splice(index, 1)
  handleUpdate()
}
</script>

<style scoped>
.properties-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.property-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

.condition-builder-wrapper {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 12px;
}

.branch-conditions {
  margin-top: 12px;
}

.branch-item {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}

.branch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

.panel-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.panel-empty p {
  margin-top: 16px;
  font-size: 14px;
}
</style>
