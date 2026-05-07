// 节点类型
export type NodeType = 'start' | 'end' | 'approval' | 'gateway' | 'condition' | 'autoApproval'

// 审批方式
export type ApprovalMode = 'single' | 'countersign' | 'orSign'

// 审批人类型
export type ApproverType = 'user' | 'role' | 'supervisor' | 'creator'

// 网关类型
export type GatewayType = 'XOR' | 'AND' | 'OR'

// 条件操作符
export type ConditionOperator = '>' | '<' | '>=' | '<=' | '==' | '!=' | 'in' | 'contains' | 'empty' | 'notEmpty'

// 自动审批动作
export type AutoApprovalAction = 'autoPass' | 'autoReject' | 'autoTransfer'

// 流程状态
export type FlowStatus = 'draft' | 'active' | 'disabled'

// 业务类型
export type BizType = 'order_audit' | 'payment_apply' | 'cost_audit' | 'prepayment_audit' | 'expense_audit' | 'bad_debt'

// 条件表达式
export interface Condition {
  id: string
  field: string
  operator: ConditionOperator
  value: any
  logic?: 'AND' | 'OR'
}

// 条件组
export interface ConditionGroup {
  id: string
  conditions: Condition[]
  logic: 'AND' | 'OR'
}

// 超时配置
export interface TimeoutConfig {
  enabled: boolean
  duration: number
  unit: 'minute' | 'hour' | 'day'
  action: 'autoPass' | 'autoReject' | 'remind' | 'transfer'
  transferTo?: string
}

// 审批节点数据
export interface ApprovalData {
  name: string
  nodeType: ApproverType
  assigneeId?: string
  assigneeName?: string
  roleId?: string
  roleName?: string
  approvalMode: ApprovalMode
  approvers?: Array<{ id: string; name: string }>
  autoPassConditions?: Condition[]
  timeoutConfig?: TimeoutConfig
  canDelegate?: boolean
  canReject?: boolean
  remark?: string
}

// 网关节点数据
export interface GatewayData {
  name: string
  gatewayType: GatewayType
  defaultFlow?: string
  conditions: Array<{
    id: string
    expression: string
    targetNodeId: string
    label: string
  }>
}

// 条件节点数据
export interface ConditionData {
  name: string
  conditions: Condition[]
  remark?: string
}

// 自动审批节点数据
export interface AutoApprovalData {
  name: string
  conditions: Condition[]
  action: AutoApprovalAction
  transferTo?: string
  nextNodeId?: string
  remark?: string
}

// 节点并集数据
export type NodeData = ApprovalData | GatewayData | ConditionData | AutoApprovalData | { name?: string }

// 流程节点
export interface WFNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  width: number
  height: number
  data: NodeData
}

// 流程连线
export interface WFEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  label?: string
  type?: 'default' | 'conditional'
  condition?: Condition
}

// 流程定义
export interface Workflow {
  id: string
  name: string
  bizType: BizType
  status: FlowStatus
  nodes: WFNode[]
  edges: WFEdge[]
  createTime: string
  updateTime?: string
}

// 画布状态
export interface CanvasState {
  nodes: WFNode[]
  edges: WFEdge[]
  selectedNodeId: string | null
  selectedEdgeId: string | null
  zoom: number
  pan: { x: number; y: number }
  isDragging: boolean
  isConnecting: boolean
  connectingFrom: string | null
}

// 节点模板（用于拖拽创建）
export interface NodeTemplate {
  type: NodeType
  label: string
  icon: string
  description: string
  defaultWidth: number
  defaultHeight: number
  defaultData: NodeData
}

// 节点模板列表
export const NODE_TEMPLATES: NodeTemplate[] = [
  {
    type: 'start',
    label: '开始节点',
    icon: 'VideoPlay',
    description: '流程起点，自动触发',
    defaultWidth: 120,
    defaultHeight: 60,
    defaultData: { name: '开始' }
  },
  {
    type: 'approval',
    label: '审批节点',
    icon: 'User',
    description: '人工审批环节',
    defaultWidth: 160,
    defaultHeight: 80,
    defaultData: {
      name: '审批',
      nodeType: 'role',
      approvalMode: 'single',
      canDelegate: true,
      canReject: true
    } as ApprovalData
  },
  {
    type: 'gateway',
    label: '网关节点',
    icon: 'Share',
    description: '条件分支路由',
    defaultWidth: 80,
    defaultHeight: 80,
    defaultData: {
      name: '网关',
      gatewayType: 'XOR',
      conditions: []
    } as GatewayData
  },
  {
    type: 'condition',
    label: '条件节点',
    icon: 'Filter',
    description: '计算流转条件',
    defaultWidth: 140,
    defaultHeight: 70,
    defaultData: {
      name: '条件',
      conditions: []
    } as ConditionData
  },
  {
    type: 'autoApproval',
    label: '自动审批',
    icon: 'Lightning',
    description: '满足条件自动通过',
    defaultWidth: 140,
    defaultHeight: 70,
    defaultData: {
      name: '自动审批',
      conditions: [],
      action: 'autoPass'
    } as AutoApprovalData
  },
  {
    type: 'end',
    label: '结束节点',
    icon: 'CircleCheck',
    description: '流程终点',
    defaultWidth: 120,
    defaultHeight: 60,
    defaultData: { name: '结束' }
  }
]

// 业务类型映射
export const BIZ_TYPE_MAP: Record<BizType, string> = {
  order_audit: '订单审核',
  payment_apply: '付款申请',
  cost_audit: '成本审核',
  prepayment_audit: '预付款审核',
  expense_audit: '垫付报销',
  bad_debt: '坏账处理'
}

// 审批模式映射
export const APPROVAL_MODE_MAP: Record<ApprovalMode, string> = {
  single: '单签',
  countersign: '会签',
  orSign: '或签'
}

// 审批人类型映射
export const APPROVER_TYPE_MAP: Record<ApproverType, string> = {
  user: '指定人员',
  role: '指定角色',
  supervisor: '上级主管',
  creator: '发起人'
}

// 网关类型映射
export const GATEWAY_TYPE_MAP: Record<GatewayType, string> = {
  XOR: '排他网关',
  AND: '并行网关',
  OR: '包容网关'
}

// 状态映射
export const STATUS_MAP: Record<FlowStatus, string> = {
  draft: '草稿',
  active: '应用中',
  disabled: '已停用'
}

// 条件操作符映射
export const OPERATOR_MAP: Record<ConditionOperator, string> = {
  '>': '大于',
  '<': '小于',
  '>=': '大于等于',
  '<=': '小于等于',
  '==': '等于',
  '!=': '不等于',
  'in': '包含',
  'contains': '包含',
  'empty': '为空',
  'notEmpty': '不为空'
}

// 工具函数：生成唯一ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// 工具函数：创建默认节点
export function createDefaultNode(type: NodeType, position: { x: number; y: number }): WFNode {
  const template = NODE_TEMPLATES.find(t => t.type === type)
  if (!template) {
    throw new Error(`Unknown node type: ${type}`)
  }
  return {
    id: generateId(),
    type,
    position,
    width: template.defaultWidth,
    height: template.defaultHeight,
    data: JSON.parse(JSON.stringify(template.defaultData))
  }
}

// 工具函数：创建连线
export function createEdge(source: string, target: string, sourceHandle?: string, targetHandle?: string): WFEdge {
  return {
    id: generateId(),
    source,
    target,
    sourceHandle,
    targetHandle
  }
}
