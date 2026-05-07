<template>
  <div class="flow-canvas-wrapper">
    <!-- 工具栏 -->
    <div class="canvas-toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button size="small" @click="handleZoomIn" title="放大">
            <el-icon><ZoomIn /></el-icon>
          </el-button>
          <el-button size="small" @click="handleZoomOut" title="缩小">
            <el-icon><ZoomOut /></el-icon>
          </el-button>
          <el-button size="small" @click="handleZoomReset" title="重置缩放">
            {{ Math.round(store.canvasState.zoom * 100) }}%
          </el-button>
        </el-button-group>
        <el-button-group style="margin-left: 8px">
          <el-button size="small" @click="store.undo()" :disabled="!store.canUndo" title="撤销 (Ctrl+Z)">
            <el-icon><RefreshLeft /></el-icon>
          </el-button>
          <el-button size="small" @click="store.redo()" :disabled="!store.canRedo" title="重做 (Ctrl+Y)">
            <el-icon><RefreshRight /></el-icon>
          </el-button>
        </el-button-group>
        <el-button size="small" @click="handleAutoLayout" style="margin-left: 8px" title="自动布局">
          <el-icon><Grid /></el-icon>
          自动布局
        </el-button>
      </div>
      <div class="toolbar-center">
        <span class="workflow-name">{{ store.currentWorkflow?.name || '未命名流程' }}</span>
      </div>
      <div class="toolbar-right">
        <el-button @click="handleSave" type="primary" size="small">保存</el-button>
        <el-button @click="handlePublish" type="success" size="small">发布</el-button>
        <el-button @click="handleClose" size="small">关闭</el-button>
      </div>
    </div>

    <div class="canvas-container">
      <!-- 左侧节点面板 -->
      <div class="node-palette" v-if="store.showNodePanel">
        <div class="palette-title">流程节点</div>
        <div class="palette-nodes">
          <div
            v-for="template in nodeTemplates"
            :key="template.type"
            class="palette-node"
            draggable="true"
            @dragstart="onDragStart($event, template)"
            @dragend="onDragEnd"
          >
            <el-icon>
              <component :is="template.icon" />
            </el-icon>
            <span>{{ template.label }}</span>
          </div>
        </div>
      </div>

      <!-- 画布 -->
      <div
        ref="canvasRef"
        class="flow-canvas"
        :class="{
          'is-connecting': store.canvasState.isConnecting,
          'is-dragging': store.canvasState.isDragging
        }"
        @click="onCanvasClick"
        @mousedown="onCanvasMouseDown"
        @mousemove="onCanvasMouseMove"
        @mouseup="onCanvasMouseUp"
        @mouseleave="onCanvasMouseUp"
        @wheel="onCanvasWheel"
        @dragover.prevent
        @drop="onDrop"
      >
        <svg
          class="canvas-svg"
          :style="{
            transform: `translate(${store.canvasState.pan.x}px, ${store.canvasState.pan.y}px) scale(${store.canvasState.zoom})`
          }"
        >
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" stroke-width="0.5" />
            </pattern>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#909399" />
            </marker>
          </defs>
          <rect width="5000" height="5000" fill="url(#grid)" />

          <g class="edges-layer">
            <g v-for="edge in store.canvasState.edges" :key="edge.id">
              <path
                :d="getEdgePath(edge)"
                fill="none"
                stroke="#909399"
                stroke-width="2"
                marker-end="url(#arrowhead)"
                :class="{ 'edge-selected': store.canvasState.selectedEdgeId === edge.id }"
                @click.stop="onEdgeClick(edge)"
              />
              <text
                v-if="edge.label"
                :x="getEdgeMidPoint(edge).x"
                :y="getEdgeMidPoint(edge).y"
                class="edge-label"
                text-anchor="middle"
                alignment-baseline="middle"
              >
                {{ edge.label }}
              </text>
            </g>

            <path
              v-if="store.canvasState.isConnecting && tempEdge && connectingNode"
              :d="getTempEdgePath(connectingNode, tempEdge)"
              fill="none"
              stroke="#409eff"
              stroke-width="2"
              stroke-dasharray="5,5"
            />
          </g>

          <foreignObject
            v-for="node in store.canvasState.nodes"
            :key="node.id"
            :x="node.position.x"
            :y="node.position.y"
            :width="node.width"
            :height="node.height"
            class="node-wrapper"
            @mousedown.stop="onNodeMouseDownEvent($event, node.id)"
            @dblclick.stop="onNodeDblClick(node.id)"
          >
            <div
              class="workflow-node"
              :class="[`node-${node.type}`, { selected: store.canvasState.selectedNodeId === node.id }]"
            >
              <StartNode v-if="node.type === 'start'" :node="node" />
              <EndNode v-else-if="node.type === 'end'" :node="node" />
              <ApprovalNode v-else-if="node.type === 'approval'" :node="node" />
              <GatewayNode v-else-if="node.type === 'gateway'" :node="node" />
              <ConditionNode v-else-if="node.type === 'condition'" :node="node" />
              <AutoApprovalNode v-else-if="node.type === 'autoApproval'" :node="node" />
            </div>
          </foreignObject>
        </svg>

        <div v-if="store.canvasState.nodes.length === 0" class="canvas-empty">
          <el-icon size="48"><Edit /></el-icon>
          <p>从左侧拖拽节点到此处开始设计流程</p>
        </div>
      </div>

      <div class="properties-panel" v-if="store.showPropertiesPanel && store.selectedNode">
        <PropertiesPanel />
      </div>
    </div>

    <el-dialog v-model="showValidationDialog" title="流程验证" width="400px">
      <div class="validation-errors">
        <el-alert
          v-for="(error, index) in validationErrors"
          :key="index"
          :title="error"
          type="error"
          show-icon
          :closable="false"
          style="margin-bottom: 8px"
        />
      </div>
      <template #footer>
        <el-button @click="showValidationDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue'
import { ElMessage } from 'element-plus'
import { ZoomIn, ZoomOut, RefreshLeft, RefreshRight, Grid, Edit, VideoPlay, User, Share, Filter, Lightning, CircleCheck } from '@element-plus/icons-vue'
import { useWorkflowStore } from '../../store/workflow'
import { useWorkflow } from '../../composables/useWorkflow'
import { NODE_TEMPLATES, type NodeType, type WFNode } from '../../types/workflow'
import StartNode from './nodes/StartNode.vue'
import EndNode from './nodes/EndNode.vue'
import ApprovalNode from './nodes/ApprovalNode.vue'
import GatewayNode from './nodes/GatewayNode.vue'
import ConditionNode from './nodes/ConditionNode.vue'
import AutoApprovalNode from './nodes/AutoApprovalNode.vue'
import PropertiesPanel from './PropertiesPanel.vue'

const store = useWorkflowStore()
const {
  canvasRef,
  tempEdge,
  getEdgePath,
  getTempEdgePath,
  onCanvasClick,
  onCanvasMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
  onCanvasWheel,
  onNodeMouseDown,
  onNodeDblClick,
  validateWorkflow,
  autoLayout: doAutoLayout
} = useWorkflow()

const nodeTemplates = NODE_TEMPLATES.map(t => ({
  ...t,
  icon: markRaw(getIcon(t.icon))
}))

function getIcon(name: string) {
  const icons: Record<string, any> = {
    VideoPlay,
    User,
    Share,
    Filter,
    Lightning,
    CircleCheck
  }
  return icons[name] || User
}

const connectingNode = computed(() => {
  if (!store.canvasState.connectingFrom) return null
  return store.canvasState.nodes.find(n => n.id === store.canvasState.connectingFrom)
})

const showValidationDialog = ref(false)
const validationErrors = ref<string[]>([])

function onDragStart(e: DragEvent, template: typeof NODE_TEMPLATES[0]) {
  if (e.dataTransfer) {
    e.dataTransfer.setData('nodeType', template.type)
    e.dataTransfer.effectAllowed = 'copy'
  }
}

function onDragEnd() {}

function onDrop(e: DragEvent) {
  e.preventDefault()
  const nodeType = e.dataTransfer?.getData('nodeType') as NodeType
  if (!nodeType || !canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const { zoom, pan } = store.canvasState
  const x = (e.clientX - rect.left - pan.x) / zoom
  const y = (e.clientY - rect.top - pan.y) / zoom

  store.addNode(nodeType, { x: x - 80, y: y - 40 })
}

function onNodeMouseDownEvent(e: MouseEvent, nodeId: string) {
  onNodeMouseDown(e, nodeId)
}

function onEdgeClick(edge: any) {
  store.selectEdge(edge.id)
}

function handleZoomIn() {
  store.setZoom(store.canvasState.zoom + 0.1)
}

function handleZoomOut() {
  store.setZoom(store.canvasState.zoom - 0.1)
}

function handleZoomReset() {
  store.setZoom(1)
  store.setPan({ x: 0, y: 0 })
}

function handleAutoLayout() {
  doAutoLayout()
  ElMessage.success('已自动布局')
}

function getEdgeMidPoint(edge: any) {
  const sourceNode = store.canvasState.nodes.find(n => n.id === edge.source)
  const targetNode = store.canvasState.nodes.find(n => n.id === edge.target)
  if (!sourceNode || !targetNode) return { x: 0, y: 0 }
  return {
    x: (sourceNode.position.x + sourceNode.width / 2 + targetNode.position.x + targetNode.width / 2) / 2,
    y: (sourceNode.position.y + sourceNode.height / 2 + targetNode.position.y + targetNode.height / 2) / 2
  }
}

function handleSave() {
  const result = validateWorkflow()
  if (!result.valid) {
    validationErrors.value = result.errors
    showValidationDialog.value = true
    return
  }
  const workflow = store.saveWorkflow()
  if (workflow) {
    ElMessage.success('保存成功')
  }
}

function handlePublish() {
  const result = validateWorkflow()
  if (!result.valid) {
    validationErrors.value = result.errors
    showValidationDialog.value = true
    return
  }
  if (store.currentWorkflow) {
    store.currentWorkflow.status = 'active'
    store.saveWorkflow()
    ElMessage.success('发布成功')
  }
}

function handleClose() {
  store.closeDesigner()
}

onMounted(() => {
  if (store.canvasState.nodes.length === 0) {
    const startNode = store.addNode('start', { x: 100, y: 200 })
    const endNode = store.addNode('end', { x: 600, y: 200 })
    store.addEdge(startNode.id, endNode.id)
    store.clearSelection()
  }
})
</script>

<style scoped>
.flow-canvas-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f7fa;
}

.canvas-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
}

.toolbar-center {
  flex: 1;
  text-align: center;
}

.workflow-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.canvas-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.node-palette {
  width: 180px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  padding: 16px;
  overflow-y: auto;
}

.palette-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.palette-nodes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.palette-node {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f5f7fa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  cursor: grab;
  font-size: 13px;
  color: #606266;
  transition: all 0.2s;
}

.palette-node:hover {
  background: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}

.palette-node:active {
  cursor: grabbing;
}

.flow-canvas {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #fff;
  cursor: default;
}

.flow-canvas.is-connecting {
  cursor: crosshair;
}

.flow-canvas.is-dragging {
  cursor: grabbing;
}

.canvas-svg {
  width: 100%;
  height: 100%;
  transform-origin: 0 0;
}

.node-wrapper {
  overflow: visible;
}

.workflow-node {
  width: 100%;
  height: 100%;
  cursor: move;
  user-select: none;
}

.workflow-node.selected {
  filter: drop-shadow(0 0 4px #409eff);
}

.edge-selected {
  stroke: #409eff !important;
  stroke-width: 3 !important;
}

.edge-label {
  font-size: 12px;
  fill: #606266;
}

.canvas-empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #909399;
}

.canvas-empty p {
  margin-top: 16px;
  font-size: 14px;
}

.properties-panel {
  width: 320px;
  background: #fff;
  border-left: 1px solid #e8e8e8;
  overflow-y: auto;
}

.validation-errors {
  max-height: 300px;
  overflow-y: auto;
}
</style>
