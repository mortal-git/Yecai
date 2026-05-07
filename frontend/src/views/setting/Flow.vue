<template>
  <div class="flow-container">
    <!-- 设计器全屏模式 -->
    <div v-if="store.showDesigner" class="designer-fullscreen">
      <FlowCanvas />
    </div>

    <!-- 列表管理模式 -->
    <template v-else>
      <!-- 顶部操作栏 -->
      <div class="action-header">
        <div class="header-left">
          <span class="page-title">审批流程</span>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新增流程
          </el-button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="statistics-cards">
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon total"><el-icon><Document /></el-icon></div>
              <div class="stat-content">
                <div class="stat-value">{{ store.statistics.total }}</div>
                <div class="stat-label">流程总数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon active"><el-icon><CircleCheck /></el-icon></div>
              <div class="stat-content">
                <div class="stat-value">{{ store.statistics.active }}</div>
                <div class="stat-label">应用中</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon draft"><el-icon><Edit /></el-icon></div>
              <div class="stat-content">
                <div class="stat-value">{{ store.statistics.draft }}</div>
                <div class="stat-label">草稿</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon disabled"><el-icon><CloseBold /></el-icon></div>
              <div class="stat-content">
                <div class="stat-value">{{ store.statistics.disabled }}</div>
                <div class="stat-label">已停用</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 搜索筛选 -->
      <div class="search-panel">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="流程名称">
            <el-input v-model="searchForm.name" placeholder="请输入流程名称" clearable style="width: 180px" />
          </el-form-item>
          <el-form-item label="业务类型">
            <el-select v-model="searchForm.bizType" placeholder="请选择" clearable style="width: 160px">
              <el-option label="订单审核" value="order_audit" />
              <el-option label="付款申请" value="payment_apply" />
              <el-option label="成本审核" value="cost_audit" />
              <el-option label="预付款审核" value="prepayment_audit" />
              <el-option label="垫付报销" value="expense_audit" />
              <el-option label="坏账处理" value="bad_debt" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
              <el-option label="应用中" value="active" />
              <el-option label="草稿" value="draft" />
              <el-option label="已停用" value="disabled" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 流程表格 -->
      <div class="table-container">
        <el-table :data="filteredWorkflows" border stripe>
          <el-table-column prop="name" label="流程名称" min-width="180" />
          <el-table-column prop="bizType" label="业务类型" width="120">
            <template #default="{ row }">
              {{ getBizTypeText(row.bizType) }}
            </template>
          </el-table-column>
          <el-table-column prop="nodeCount" label="节点数量" width="100" align="center">
            <template #default="{ row }">
              {{ row.nodes.length }}
            </template>
          </el-table-column>
          <el-table-column prop="nodes" label="流程预览" min-width="300">
            <template #default="{ row }">
              <div class="flow-preview">
                <div
                  v-for="(node, index) in row.nodes.slice(0, 6)"
                  :key="node.id"
                  class="preview-node"
                  :class="`node-${node.type}`"
                >
                  <el-tag size="small" :type="getNodeTagType(node.type)">
                    {{ getNodeShortLabel(node) }}
                  </el-tag>
                  <el-icon v-if="index < row.nodes.slice(0, 6).length - 1" class="arrow"><ArrowRight /></el-icon>
                </div>
                <span v-if="row.nodes.length > 6" class="more-nodes">+{{ row.nodes.length - 6 }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="160" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleDesign(row)">
                <el-icon><Edit /></el-icon>
                设计
              </el-button>
              <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
              <el-button
                v-if="row.status === 'active'"
                type="danger"
                link
                size="small"
                @click="handleDisable(row)"
              >
                停用
              </el-button>
              <el-button
                v-if="row.status === 'disabled'"
                type="success"
                link
                size="small"
                @click="handleEnable(row)"
              >
                启用
              </el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 详情抽屉 -->
      <el-drawer v-model="showDetailDrawer" :title="currentFlow?.name || '流程详情'" size="700px">
        <template #default>
          <div class="detail-content" v-if="currentFlow">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="流程名称">{{ currentFlow.name }}</el-descriptions-item>
              <el-descriptions-item label="业务类型">
                {{ getBizTypeText(currentFlow.bizType) }}
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="getStatusType(currentFlow.status)" size="small">
                  {{ getStatusText(currentFlow.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ currentFlow.createTime }}</el-descriptions-item>
            </el-descriptions>

            <div class="section-title">流程图预览</div>
            <div class="flow-diagram">
              <div
                v-for="(node, index) in currentFlow.nodes"
                :key="node.id"
                class="diagram-node"
                :class="`node-${node.type}`"
              >
                <div class="diagram-node-icon">
                  <el-icon><component :is="getNodeIcon(node.type)" /></el-icon>
                </div>
                <div class="diagram-node-label">{{ (node.data as any).name || node.type }}</div>
                <el-icon v-if="index < currentFlow.nodes.length - 1" class="diagram-arrow"><ArrowRight /></el-icon>
              </div>
            </div>

            <div class="section-title">节点详情</div>
            <div class="nodes-detail">
              <el-card v-for="(node, index) in currentFlow.nodes" :key="index" class="node-card">
                <template #header>
                  <div class="node-header">
                    <span>节点 {{ index + 1 }}：{{ (node.data as any).name || node.type }}</span>
                    <el-tag size="small" :type="getNodeTagType(node.type)">
                      {{ getNodeTypeText(node.type) }}
                    </el-tag>
                  </div>
                </template>
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="审批人" v-if="node.type === 'approval'">
                    <template v-if="(node.data as any).nodeType === 'user'">
                      {{ (node.data as any).assigneeName || '未指定' }}
                    </template>
                    <template v-else-if="(node.data as any).nodeType === 'role'">
                      {{ (node.data as any).roleName || '未指定' }}
                    </template>
                    <template v-else>
                      {{ getApproverTypeText((node.data as any).nodeType) }}
                    </template>
                  </el-descriptions-item>
                  <el-descriptions-item label="审批方式" v-if="node.type === 'approval'">
                    {{ getApprovalModeText((node.data as any).approvalMode) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="网关类型" v-if="node.type === 'gateway'">
                    {{ getGatewayTypeText((node.data as any).gatewayType) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="自动动作" v-if="node.type === 'autoApproval'">
                    {{ getAutoActionText((node.data as any).action) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="条件数量" v-if="['condition', 'autoApproval'].includes(node.type)">
                    {{ ((node.data as any).conditions || []).length }} 个
                  </el-descriptions-item>
                </el-descriptions>
              </el-card>
            </div>
          </div>
        </template>
      </el-drawer>

      <!-- 新建/编辑流程对话框 -->
      <el-dialog v-model="showEditDialog" :title="isEdit ? '编辑流程' : '新增流程'" width="600px">
        <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
          <el-form-item label="流程名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入流程名称" />
          </el-form-item>
          <el-form-item label="业务类型" prop="bizType">
            <el-select v-model="formData.bizType" placeholder="请选择" style="width: 100%">
              <el-option label="订单审核" value="order_audit" />
              <el-option label="付款申请" value="payment_apply" />
              <el-option label="成本审核" value="cost_audit" />
              <el-option label="预付款审核" value="prepayment_audit" />
              <el-option label="垫付报销" value="expense_audit" />
              <el-option label="坏账处理" value="bad_debt" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmEdit">确定</el-button>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Document, CircleCheck, Edit, CloseBold, ArrowRight, Delete, VideoPlay, User, Share, Filter, Lightning, CircleCheck as EndIcon } from '@element-plus/icons-vue'
import { useWorkflowStore } from '../../store/workflow'
import { BIZ_TYPE_MAP, type Workflow } from '../../types/workflow'
import FlowCanvas from '../../components/workflow/FlowCanvas.vue'

const store = useWorkflowStore()

// 搜索表单
const searchForm = reactive({
  name: '',
  bizType: '',
  status: ''
})

// 过滤后的流程列表
const filteredWorkflows = computed(() => {
  return store.workflows.filter(w => {
    if (searchForm.name && !w.name.includes(searchForm.name)) return false
    if (searchForm.bizType && w.bizType !== searchForm.bizType) return false
    if (searchForm.status && w.status !== searchForm.status) return false
    return true
  })
})

// 详情抽屉
const showDetailDrawer = ref(false)
const currentFlow = ref<Workflow | null>(null)

// 编辑对话框
const showEditDialog = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  name: '',
  bizType: ''
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入流程名称', trigger: 'blur' }],
  bizType: [{ required: true, message: '请选择业务类型', trigger: 'change' }]
}

// 方法
function getBizTypeText(type: string) {
  return BIZ_TYPE_MAP[type as keyof typeof BIZ_TYPE_MAP] || type
}

function getStatusType(status: string) {
  const types: Record<string, string> = {
    active: 'success',
    draft: 'info',
    disabled: 'danger'
  }
  return types[status] || 'info'
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    active: '应用中',
    draft: '草稿',
    disabled: '已停用'
  }
  return texts[status] || status
}

function getNodeTagType(type: string) {
  const types: Record<string, string> = {
    start: 'success',
    end: 'info',
    approval: 'primary',
    gateway: 'warning',
    condition: 'danger',
    autoApproval: ''
  }
  return types[type] || 'info'
}

function getNodeTypeText(type: string) {
  const texts: Record<string, string> = {
    start: '开始',
    end: '结束',
    approval: '审批',
    gateway: '网关',
    condition: '条件',
    autoApproval: '自动审批'
  }
  return texts[type] || type
}

function getNodeShortLabel(node: any) {
  const data = node.data || {}
  if (data.name) return data.name.slice(0, 4)
  return getNodeTypeText(node.type)
}

function getNodeIcon(type: string) {
  const icons: Record<string, any> = {
    start: VideoPlay,
    end: EndIcon,
    approval: User,
    gateway: Share,
    condition: Filter,
    autoApproval: Lightning
  }
  return icons[type] || User
}

function getApproverTypeText(type: string) {
  const texts: Record<string, string> = {
    user: '指定人员',
    role: '指定角色',
    supervisor: '上级主管',
    creator: '发起人'
  }
  return texts[type] || type
}

function getApprovalModeText(mode: string) {
  const texts: Record<string, string> = {
    single: '单签',
    countersign: '会签',
    orSign: '或签'
  }
  return texts[mode] || mode
}

function getGatewayTypeText(type: string) {
  const texts: Record<string, string> = {
    XOR: '排他网关',
    AND: '并行网关',
    OR: '包容网关'
  }
  return texts[type] || type
}

function getAutoActionText(action: string) {
  const texts: Record<string, string> = {
    autoPass: '自动通过',
    autoReject: '自动驳回',
    autoTransfer: '自动转交'
  }
  return texts[action] || action
}

function handleSearch() {
  // 搜索由 computed 处理
}

function handleReset() {
  searchForm.name = ''
  searchForm.bizType = ''
  searchForm.status = ''
}

function handleCreate() {
  isEdit.value = false
  formData.name = ''
  formData.bizType = ''
  showEditDialog.value = true
}

function handleDesign(row: Workflow) {
  store.openDesigner(row)
}

function handleView(row: Workflow) {
  currentFlow.value = row
  showDetailDrawer.value = true
}

function handleConfirmEdit() {
  if (!formData.name || !formData.bizType) {
    ElMessage.warning('请填写完整信息')
    return
  }
  showEditDialog.value = false
  store.openDesigner()
  if (store.currentWorkflow) {
    store.currentWorkflow.name = formData.name
    store.currentWorkflow.bizType = formData.bizType as any
  }
}

function handleDisable(row: Workflow) {
  ElMessageBox.confirm(`确定要停用流程 "${row.name}" 吗？`, '停用流程', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    store.updateWorkflowStatus(row.id, 'disabled')
    ElMessage.success('停用成功')
  }).catch(() => {})
}

function handleEnable(row: Workflow) {
  ElMessageBox.confirm(`确定要启用流程 "${row.name}" 吗？`, '启用流程', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    store.updateWorkflowStatus(row.id, 'active')
    ElMessage.success('启用成功')
  }).catch(() => {})
}

function handleDelete(row: Workflow) {
  ElMessageBox.confirm(`确定要删除流程 "${row.name}" 吗？此操作不可恢复。`, '删除流程', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    store.deleteWorkflow(row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.flow-container {
  padding: 0;
  background: #f5f7fa;
  min-height: 100%;
}

.designer-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: #fff;
}

.action-header {
  background: #fff;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left .page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  gap: 12px;
}

.statistics-cards {
  padding: 16px 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-icon.total {
  background: #ecf5ff;
  color: #409eff;
}

.stat-icon.active {
  background: #f0f9eb;
  color: #67c23a;
}

.stat-icon.draft {
  background: #fdf6ec;
  color: #e6a23c;
}

.stat-icon.disabled {
  background: #fef0f0;
  color: #f56c6c;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.search-panel {
  background: #fff;
  margin: 0 20px;
  padding: 20px;
  border-radius: 8px;
}

.table-container {
  background: #fff;
  margin: 16px 20px;
  padding: 20px;
  border-radius: 8px;
}

.flow-preview {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.preview-node {
  display: flex;
  align-items: center;
  gap: 4px;
}

.arrow {
  color: #909399;
  font-size: 12px;
}

.more-nodes {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

.detail-content {
  padding: 0 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 24px 0 16px;
  padding-left: 12px;
  border-left: 4px solid #409eff;
}

.flow-diagram {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.diagram-node {
  display: flex;
  align-items: center;
  gap: 8px;
}

.diagram-node-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
}

.node-start .diagram-node-icon {
  background: #67c23a;
}

.node-end .diagram-node-icon {
  background: #909399;
}

.node-approval .diagram-node-icon {
  background: #409eff;
}

.node-gateway .diagram-node-icon {
  background: #e6a23c;
}

.node-condition .diagram-node-icon {
  background: #f56c6c;
}

.node-autoApproval .diagram-node-icon {
  background: #9c27b0;
}

.diagram-node-label {
  font-size: 13px;
  color: #606266;
}

.diagram-arrow {
  color: #909399;
  font-size: 16px;
}

.nodes-detail {
  margin-top: 20px;
}

.node-card {
  margin-bottom: 16px;
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
