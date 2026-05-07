import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  WFNode,
  WFEdge,
  Workflow,
  CanvasState,
  NodeType,
  ApprovalData,
  GatewayData,
  ConditionData,
  AutoApprovalData,
  BizType,
  FlowStatus
} from '../types/workflow'
import {
  createDefaultNode,
  createEdge,
  generateId,
  BIZ_TYPE_MAP
} from '../types/workflow'

export const useWorkflowStore = defineStore('workflow', () => {
  // 流程列表
  const workflows = ref<Workflow[]>([
    {
      id: '1',
      name: '订单审核流程',
      bizType: 'order_audit',
      status: 'active',
      createTime: '2024-01-15 10:30:00',
      nodes: [
        { id: 'n1', type: 'start', position: { x: 100, y: 200 }, width: 120, height: 60, data: { name: '开始' } },
        { id: 'n2', type: 'approval', position: { x: 280, y: 200 }, width: 160, height: 80, data: { name: '部门主管', nodeType: 'supervisor', approvalMode: 'single', canDelegate: true, canReject: true } as ApprovalData },
        { id: 'n3', type: 'approval', position: { x: 500, y: 200 }, width: 160, height: 80, data: { name: '财务审批', nodeType: 'role', roleId: '2', roleName: '财务负责人', approvalMode: 'countersign', canReject: true } as ApprovalData },
        { id: 'n4', type: 'end', position: { x: 720, y: 200 }, width: 120, height: 60, data: { name: '结束' } }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4' }
      ]
    },
    {
      id: '2',
      name: '付款申请流程',
      bizType: 'payment_apply',
      status: 'active',
      createTime: '2024-01-16 14:20:00',
      nodes: [
        { id: 'n1', type: 'start', position: { x: 100, y: 200 }, width: 120, height: 60, data: { name: '开始' } },
        { id: 'n2', type: 'approval', position: { x: 280, y: 200 }, width: 160, height: 80, data: { name: '上级主管', nodeType: 'supervisor', approvalMode: 'single' } as ApprovalData },
        { id: 'n3', type: 'gateway', position: { x: 480, y: 200 }, width: 80, height: 80, data: { name: '金额判断', gatewayType: 'XOR', conditions: [{ id: 'c1', expression: 'formData.amount > 50000', targetNodeId: 'n4', label: '金额>5万' }] } as GatewayData },
        { id: 'n4', type: 'approval', position: { x: 680, y: 120 }, width: 160, height: 80, data: { name: '总经理审批', nodeType: 'role', roleId: '3', roleName: '总经理', approvalMode: 'single' } as ApprovalData },
        { id: 'n5', type: 'approval', position: { x: 680, y: 280 }, width: 160, height: 80, data: { name: '财务复核', nodeType: 'role', roleId: '2', roleName: '财务负责人', approvalMode: 'single' } as ApprovalData },
        { id: 'n6', type: 'end', position: { x: 900, y: 200 }, width: 120, height: 60, data: { name: '结束' } }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4', label: '金额>5万' },
        { id: 'e4', source: 'n3', target: 'n5', label: '金额≤5万' },
        { id: 'e5', source: 'n4', target: 'n6' },
        { id: 'e6', source: 'n5', target: 'n6' }
      ]
    }
  ])

  // 当前编辑的流程
  const currentWorkflow = ref<Workflow | null>(null)

  // 画布状态
  const canvasState = ref<CanvasState>({
    nodes: [],
    edges: [],
    selectedNodeId: null,
    selectedEdgeId: null,
    zoom: 1,
    pan: { x: 0, y: 0 },
    isDragging: false,
    isConnecting: false,
    connectingFrom: null
  })

  // 设计器UI状态
  const showDesigner = ref(false)
  const showNodePanel = ref(true)
  const showPropertiesPanel = ref(true)
  const historyStack = ref<{ nodes: WFNode[]; edges: WFEdge[] }[]>([])
  const historyIndex = ref(-1)

  // 计算属性
  const selectedNode = computed(() => {
    if (!canvasState.value.selectedNodeId) return null
    return canvasState.value.nodes.find(n => n.id === canvasState.value.selectedNodeId) || null
  })

  const selectedEdge = computed(() => {
    if (!canvasState.value.selectedEdgeId) return null
    return canvasState.value.edges.find(e => e.id === canvasState.value.selectedEdgeId) || null
  })

  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < historyStack.value.length - 1)

  // 保存历史状态
  function saveHistory() {
    const state = {
      nodes: JSON.parse(JSON.stringify(canvasState.value.nodes)),
      edges: JSON.parse(JSON.stringify(canvasState.value.edges))
    }
    // 如果当前不在栈顶，截断后面的历史
    if (historyIndex.value < historyStack.value.length - 1) {
      historyStack.value = historyStack.value.slice(0, historyIndex.value + 1)
    }
    historyStack.value.push(state)
    historyIndex.value = historyStack.value.length - 1
    // 限制历史记录数量
    if (historyStack.value.length > 50) {
      historyStack.value.shift()
      historyIndex.value--
    }
  }

  // 撤销
  function undo() {
    if (!canUndo.value) return
    historyIndex.value--
    const state = historyStack.value[historyIndex.value]
    canvasState.value.nodes = JSON.parse(JSON.stringify(state.nodes))
    canvasState.value.edges = JSON.parse(JSON.stringify(state.edges))
  }

  // 重做
  function redo() {
    if (!canRedo.value) return
    historyIndex.value++
    const state = historyStack.value[historyIndex.value]
    canvasState.value.nodes = JSON.parse(JSON.stringify(state.nodes))
    canvasState.value.edges = JSON.parse(JSON.stringify(state.edges))
  }

  // 打开设计器
  function openDesigner(workflow?: Workflow) {
    if (workflow) {
      currentWorkflow.value = JSON.parse(JSON.stringify(workflow))
      canvasState.value.nodes = JSON.parse(JSON.stringify(workflow.nodes))
      canvasState.value.edges = JSON.parse(JSON.stringify(workflow.edges))
    } else {
      // 创建新流程
      currentWorkflow.value = {
        id: generateId(),
        name: '',
        bizType: 'order_audit',
        status: 'draft',
        createTime: new Date().toLocaleString(),
        nodes: [],
        edges: []
      }
      canvasState.value.nodes = []
      canvasState.value.edges = []
    }
    // 初始化历史
    historyStack.value = [{
      nodes: JSON.parse(JSON.stringify(canvasState.value.nodes)),
      edges: JSON.parse(JSON.stringify(canvasState.value.edges))
    }]
    historyIndex.value = 0
    canvasState.value.selectedNodeId = null
    canvasState.value.selectedEdgeId = null
    canvasState.value.zoom = 1
    canvasState.value.pan = { x: 0, y: 0 }
    showDesigner.value = true
  }

  // 关闭设计器
  function closeDesigner() {
    showDesigner.value = false
    currentWorkflow.value = null
    canvasState.value.nodes = []
    canvasState.value.edges = []
    canvasState.value.selectedNodeId = null
    canvasState.value.selectedEdgeId = null
    historyStack.value = []
    historyIndex.value = -1
  }

  // 添加节点
  function addNode(type: NodeType, position: { x: number; y: number }) {
    const node = createDefaultNode(type, position)
    canvasState.value.nodes.push(node)
    canvasState.value.selectedNodeId = node.id
    saveHistory()
    return node
  }

  // 删除节点
  function removeNode(nodeId: string) {
    const index = canvasState.value.nodes.findIndex(n => n.id === nodeId)
    if (index !== -1) {
      canvasState.value.nodes.splice(index, 1)
      // 删除相关的边
      canvasState.value.edges = canvasState.value.edges.filter(
        e => e.source !== nodeId && e.target !== nodeId
      )
      if (canvasState.value.selectedNodeId === nodeId) {
        canvasState.value.selectedNodeId = null
      }
      saveHistory()
    }
  }

  // 更新节点
  function updateNode(nodeId: string, data: Partial<WFNode>) {
    const node = canvasState.value.nodes.find(n => n.id === nodeId)
    if (node) {
      Object.assign(node, data)
      saveHistory()
    }
  }

  // 更新节点数据
  function updateNodeData(nodeId: string, data: any) {
    const node = canvasState.value.nodes.find(n => n.id === nodeId)
    if (node) {
      node.data = { ...node.data, ...data }
      saveHistory()
    }
  }

  // 移动节点
  function moveNode(nodeId: string, position: { x: number; y: number }) {
    const node = canvasState.value.nodes.find(n => n.id === nodeId)
    if (node) {
      node.position = position
    }
  }

  // 完成节点移动（保存历史）
  function finishMoveNode() {
    saveHistory()
  }

  // 添加连线
  function addEdge(source: string, target: string, sourceHandle?: string, targetHandle?: string) {
    // 检查是否已存在相同的边
    const exists = canvasState.value.edges.some(
      e => e.source === source && e.target === target
    )
    if (exists) return null

    const edge = createEdge(source, target, sourceHandle, targetHandle)
    canvasState.value.edges.push(edge)
    saveHistory()
    return edge
  }

  // 删除连线
  function removeEdge(edgeId: string) {
    const index = canvasState.value.edges.findIndex(e => e.id === edgeId)
    if (index !== -1) {
      canvasState.value.edges.splice(index, 1)
      if (canvasState.value.selectedEdgeId === edgeId) {
        canvasState.value.selectedEdgeId = null
      }
      saveHistory()
    }
  }

  // 更新连线
  function updateEdge(edgeId: string, data: Partial<WFEdge>) {
    const edge = canvasState.value.edges.find(e => e.id === edgeId)
    if (edge) {
      Object.assign(edge, data)
      saveHistory()
    }
  }

  // 选中节点
  function selectNode(nodeId: string | null) {
    canvasState.value.selectedNodeId = nodeId
    canvasState.value.selectedEdgeId = null
  }

  // 选中连线
  function selectEdge(edgeId: string | null) {
    canvasState.value.selectedEdgeId = edgeId
    canvasState.value.selectedNodeId = null
  }

  // 清除选择
  function clearSelection() {
    canvasState.value.selectedNodeId = null
    canvasState.value.selectedEdgeId = null
  }

  // 开始连接
  function startConnecting(nodeId: string) {
    canvasState.value.isConnecting = true
    canvasState.value.connectingFrom = nodeId
  }

  // 取消连接
  function cancelConnecting() {
    canvasState.value.isConnecting = false
    canvasState.value.connectingFrom = null
  }

  // 完成连接
  function finishConnecting(targetNodeId: string, targetHandle?: string) {
    if (canvasState.value.connectingFrom && canvasState.value.connectingFrom !== targetNodeId) {
      addEdge(canvasState.value.connectingFrom, targetNodeId, undefined, targetHandle)
    }
    cancelConnecting()
  }

  // 设置缩放
  function setZoom(zoom: number) {
    canvasState.value.zoom = Math.max(0.25, Math.min(2, zoom))
  }

  // 设置平移
  function setPan(pan: { x: number; y: number }) {
    canvasState.value.pan = pan
  }

  // 保存流程
  function saveWorkflow() {
    if (!currentWorkflow.value) return
    currentWorkflow.value.nodes = JSON.parse(JSON.stringify(canvasState.value.nodes))
    currentWorkflow.value.edges = JSON.parse(JSON.stringify(canvasState.value.edges))

    const index = workflows.value.findIndex(w => w.id === currentWorkflow.value!.id)
    if (index !== -1) {
      workflows.value[index] = { ...currentWorkflow.value, updateTime: new Date().toLocaleString() }
    } else {
      workflows.value.push({ ...currentWorkflow.value })
    }
    return currentWorkflow.value
  }

  // 删除流程
  function deleteWorkflow(id: string) {
    const index = workflows.value.findIndex(w => w.id === id)
    if (index !== -1) {
      workflows.value.splice(index, 1)
    }
  }

  // 更新流程状态
  function updateWorkflowStatus(id: string, status: FlowStatus) {
    const workflow = workflows.value.find(w => w.id === id)
    if (workflow) {
      workflow.status = status
      workflow.updateTime = new Date().toLocaleString()
    }
  }

  // 获取流程列表统计数据
  const statistics = computed(() => ({
    total: workflows.value.length,
    active: workflows.value.filter(w => w.status === 'active').length,
    draft: workflows.value.filter(w => w.status === 'draft').length,
    disabled: workflows.value.filter(w => w.status === 'disabled').length
  }))

  return {
    // 状态
    workflows,
    currentWorkflow,
    canvasState,
    showDesigner,
    showNodePanel,
    showPropertiesPanel,

    // 计算属性
    selectedNode,
    selectedEdge,
    canUndo,
    canRedo,
    statistics,

    // 方法
    openDesigner,
    closeDesigner,
    addNode,
    removeNode,
    updateNode,
    updateNodeData,
    moveNode,
    finishMoveNode,
    addEdge,
    removeEdge,
    updateEdge,
    selectNode,
    selectEdge,
    clearSelection,
    startConnecting,
    cancelConnecting,
    finishConnecting,
    setZoom,
    setPan,
    saveWorkflow,
    deleteWorkflow,
    updateWorkflowStatus,
    undo,
    redo,
    saveHistory
  }
})
