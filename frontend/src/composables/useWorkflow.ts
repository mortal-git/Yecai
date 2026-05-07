import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWorkflowStore } from '../store/workflow'
import type { WFNode, WFEdge, NodeType, Condition } from '../types/workflow'

export function useWorkflow() {
  const store = useWorkflowStore()

  // 拖拽状态
  const draggedNodeType = ref<NodeType | null>(null)
  const isDraggingNode = ref(false)
  const dragOffset = ref({ x: 0, y: 0 })

  // 连接线状态
  const tempEdge = ref<{ x: number; y: number } | null>(null)

  // 画布引用
  const canvasRef = ref<HTMLElement | null>(null)
  const canvasRect = ref<DOMRect | null>(null)

  // 计算节点端口位置
  function getNodePorts(node: WFNode) {
    return {
      top: { x: node.position.x + node.width / 2, y: node.position.y },
      bottom: { x: node.position.x + node.width / 2, y: node.position.y + node.height },
      left: { x: node.position.x, y: node.position.y + node.height / 2 },
      right: { x: node.position.x + node.width, y: node.position.y + node.height / 2 }
    }
  }

  // 获取节点中心点
  function getNodeCenter(node: WFNode) {
    return {
      x: node.position.x + node.width / 2,
      y: node.position.y + node.height / 2
    }
  }

  // 计算贝塞尔曲线控制点
  function getBezierPath(source: { x: number; y: number }, target: { x: number; y: number }) {
    const dx = target.x - source.x
    const dy = target.y - source.y
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    let cp1x = source.x
    let cp1y = source.y
    let cp2x = target.x
    let cp2y = target.y

    if (absDx > absDy) {
      cp1x = source.x + dx * 0.5
      cp2x = target.x - dx * 0.5
    } else {
      cp1y = source.y + dy * 0.5
      cp2y = target.y - dy * 0.5
    }

    return `M ${source.x} ${source.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${target.x} ${target.y}`
  }

  // 获取边的路径
  function getEdgePath(edge: WFEdge, nodes: WFNode[]) {
    const sourceNode = nodes.find(n => n.id === edge.source)
    const targetNode = nodes.find(n => n.id === edge.target)
    if (!sourceNode || !targetNode) return ''

    const sourceCenter = getNodeCenter(sourceNode)
    const targetCenter = getNodeCenter(targetNode)

    return getBezierPath(sourceCenter, targetCenter)
  }

  // 获取临时连接线的路径
  function getTempEdgePath(sourceNode: WFNode, mousePos: { x: number; y: number }) {
    const sourceCenter = getNodeCenter(sourceNode)
    return getBezierPath(sourceCenter, mousePos)
  }

  // 更新画布矩形信息
  function updateCanvasRect() {
    if (canvasRef.value) {
      canvasRect.value = canvasRef.value.getBoundingClientRect()
    }
  }

  // 将屏幕坐标转换为画布坐标
  function screenToCanvas(screenX: number, screenY: number) {
    if (!canvasRect.value) return { x: 0, y: 0 }
    const { zoom, pan } = store.canvasState
    return {
      x: (screenX - canvasRect.value.left - pan.x) / zoom,
      y: (screenY - canvasRect.value.top - pan.y) / zoom
    }
  }

  // 检查点是否在节点内
  function isPointInNode(point: { x: number; y: number }, node: WFNode) {
    return (
      point.x >= node.position.x &&
      point.x <= node.position.x + node.width &&
      point.y >= node.position.y &&
      point.y <= node.position.y + node.height
    )
  }

  // 获取节点在指定位置的连接端口
  function getClosestPort(node: WFNode, point: { x: number; y: number }) {
    const ports = getNodePorts(node)
    const portKeys = Object.keys(ports) as Array<keyof typeof ports>

    let closestPort: keyof typeof ports | null = null
    let minDistance = Infinity

    for (const key of portKeys) {
      const port = ports[key]
      const distance = Math.sqrt(
        Math.pow(point.x - port.x, 2) + Math.pow(point.y - port.y, 2)
      )
      if (distance < minDistance && distance < 30) {
        minDistance = distance
        closestPort = key
      }
    }

    return closestPort
  }

  // 节点拖拽开始
  function onNodeDragStart(e: MouseEvent, nodeId: string) {
    const node = store.canvasState.nodes.find(n => n.id === nodeId)
    if (!node) return

    store.selectNode(nodeId)
    isDraggingNode.value = true
    dragOffset.value = {
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    }
    updateCanvasRect()
  }

  // 节点拖拽中
  function onNodeDragging(e: MouseEvent) {
    if (!isDraggingNode.value || !store.canvasState.selectedNodeId) return

    const canvasPos = screenToCanvas(e.clientX, e.clientY)
    store.moveNode(store.canvasState.selectedNodeId, {
      x: canvasPos.x - dragOffset.value.x + (store.canvasState.pan.x / store.canvasState.zoom),
      y: canvasPos.y - dragOffset.value.y + (store.canvasState.pan.y / store.canvasState.zoom)
    })
  }

  // 节点拖拽结束
  function onNodeDragEnd() {
    if (isDraggingNode.value) {
      isDraggingNode.value = false
      store.finishMoveNode()
    }
  }

  // 画布点击
  function onCanvasClick(e: MouseEvent) {
    if (e.target === canvasRef.value || (e.target as HTMLElement).classList.contains('canvas-content')) {
      store.clearSelection()
    }
  }

  // 画布拖拽（平移）
  function onCanvasMouseDown(e: MouseEvent) {
    if (e.target !== canvasRef.value && !(e.target as HTMLElement).classList.contains('canvas-content')) return
    if (isDraggingNode.value) return

    store.canvasState.isDragging = true
    updateCanvasRect()
  }

  function onCanvasMouseMove(e: MouseEvent) {
    if (store.canvasState.isDragging && !isDraggingNode.value) {
      store.setPan({
        x: store.canvasState.pan.x + e.movementX,
        y: store.canvasState.pan.y + e.movementY
      })
    }

    if (store.canvasState.isConnecting) {
      const canvasPos = screenToCanvas(e.clientX, e.clientY)
      tempEdge.value = canvasPos
    }

    if (isDraggingNode.value) {
      onNodeDragging(e)
    }
  }

  function onCanvasMouseUp(e: MouseEvent) {
    if (store.canvasState.isDragging) {
      store.canvasState.isDragging = false
    }

    if (isDraggingNode.value) {
      onNodeDragEnd()
    }

    if (store.canvasState.isConnecting) {
      const canvasPos = screenToCanvas(e.clientX, e.clientY)
      const targetNode = store.canvasState.nodes.find(n => isPointInNode(canvasPos, n))
      if (targetNode && targetNode.id !== store.canvasState.connectingFrom) {
        store.finishConnecting(targetNode.id)
      } else {
        store.cancelConnecting()
      }
      tempEdge.value = null
    }
  }

  // 节点上鼠标按下（开始连线）
  function onNodeMouseDown(e: MouseEvent, nodeId: string) {
    e.stopPropagation()
    store.startConnecting(nodeId)
    updateCanvasRect()
  }

  // 滚轮缩放
  function onCanvasWheel(e: WheelEvent) {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    store.setZoom(store.canvasState.zoom + delta)
  }

  // 双击节点编辑
  function onNodeDblClick(nodeId: string) {
    store.selectNode(nodeId)
    store.showPropertiesPanel = true
  }

  // 删除选中元素
  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (store.canvasState.selectedNodeId) {
        store.removeNode(store.canvasState.selectedNodeId)
      } else if (store.canvasState.selectedEdgeId) {
        store.removeEdge(store.canvasState.selectedEdgeId)
      }
    }

    if (e.ctrlKey && e.key === 'z') {
      store.undo()
    }

    if (e.ctrlKey && e.key === 'y') {
      store.redo()
    }

    if (e.key === 'Escape') {
      store.clearSelection()
      store.cancelConnecting()
    }
  }

  // 验证流程完整性
  function validateWorkflow(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const nodes = store.canvasState.nodes
    const edges = store.canvasState.edges

    if (nodes.length === 0) {
      errors.push('流程至少需要一个节点')
      return { valid: false, errors }
    }

    const startNodes = nodes.filter(n => n.type === 'start')
    const endNodes = nodes.filter(n => n.type === 'end')

    if (startNodes.length === 0) {
      errors.push('流程必须有开始节点')
    }
    if (startNodes.length > 1) {
      errors.push('流程只能有一个开始节点')
    }
    if (endNodes.length === 0) {
      errors.push('流程必须有结束节点')
    }

    const connectedNodes = new Set<string>()
    edges.forEach(e => {
      connectedNodes.add(e.source)
      connectedNodes.add(e.target)
    })
    nodes.forEach(n => {
      if (n.type !== 'start' && !connectedNodes.has(n.id)) {
        errors.push(`节点"${(n.data as any).name || n.id}"未连接`)
      }
    })

    if (startNodes.length === 1) {
      const hasOutgoing = edges.some(e => e.source === startNodes[0].id)
      if (!hasOutgoing) {
        errors.push('开始节点必须有下游节点')
      }
    }

    endNodes.forEach(n => {
      const hasIncoming = edges.some(e => e.target === n.id)
      if (!hasIncoming) {
        errors.push('结束节点必须被连接')
      }
    })

    return { valid: errors.length === 0, errors }
  }

  // 自动布局
  function autoLayout() {
    const nodes = store.canvasState.nodes
    if (nodes.length === 0) return

    const levels: WFNode[][] = []
    const visited = new Set<string>()
    const startNode = nodes.find(n => n.type === 'start')

    if (!startNode) return

    function bfs(level: WFNode[]) {
      if (level.length === 0) return
      const nextLevel: WFNode[] = []
      level.forEach(node => {
        if (!visited.has(node.id)) {
          visited.add(node.id)
          const currentLevelIndex = levels.length
          if (!levels[currentLevelIndex]) {
            levels[currentLevelIndex] = []
          }
          levels[currentLevelIndex].push(node)

          store.canvasState.edges
            .filter(e => e.source === node.id)
            .forEach(e => {
              const targetNode = nodes.find(n => n.id === e.target)
              if (targetNode && !visited.has(targetNode.id)) {
                nextLevel.push(targetNode)
              }
            })
        }
      })
      bfs(nextLevel)
    }

    bfs([startNode])

    nodes.forEach(n => {
      if (!visited.has(n.id)) {
        if (!levels[levels.length - 1]) {
          levels[levels.length - 1] = []
        }
        levels[levels.length - 1].push(n)
      }
    })

    const horizontalGap = 200
    const verticalGap = 120
    const startX = 100
    const startY = 200

    levels.forEach((level, levelIndex) => {
      const totalHeight = level.reduce((sum, n) => sum + n.height, 0) + (level.length - 1) * verticalGap
      let currentY = startY - totalHeight / 2 + level[0].height / 2

      level.forEach(node => {
        node.position.x = startX + levelIndex * horizontalGap
        node.position.y = currentY
        currentY += node.height + verticalGap
      })
    })

    store.saveHistory()
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown)
  })

  return {
    draggedNodeType,
    isDraggingNode,
    tempEdge,
    canvasRef,
    canvasRect,
    getNodePorts,
    getNodeCenter,
    getBezierPath,
    getEdgePath,
    getTempEdgePath,
    screenToCanvas,
    isPointInNode,
    getClosestPort,
    onNodeDragStart,
    onNodeDragging,
    onNodeDragEnd,
    onCanvasClick,
    onCanvasMouseDown,
    onCanvasMouseMove,
    onCanvasMouseUp,
    onNodeMouseDown,
    onCanvasWheel,
    onNodeDblClick,
    validateWorkflow,
    autoLayout
  }
}
