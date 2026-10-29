// ChatBI 数据分析平台类型定义

// 分析模型类型
export type AnalysisModelType =
  | 'revenue'        // 营收分析模型
  | 'cost'           // 成本费用分析模型
  | 'profit'         // 毛利盈利分析模型
  | 'region'         // 区域业绩分析模型
  | 'product'        // 产品运营分析模型
  | 'supply_chain'   // 供应链效率分析模型

// 意图识别类型
export type IntentType =
  | 'query'          // 数据查询
  | 'compare'        // 对比分析
  | 'abnormal'       // 异常分析
  | 'trend'          // 趋势分析
  | 'summary'        // 统计汇总

// 图表类型
export type ChartType =
  | 'line'           // 折线图（趋势分析）
  | 'bar'            // 柱状图（对比分析）
  | 'pie'            // 饼图（占比分析）
  | 'table'          // 表格（明细数据）
  | 'radar'          // 雷达图（综合指标分析）

// 消息角色
export type ChatRole = 'user' | 'assistant' | 'system'

// Pipeline 步骤状态
export type PipelineStatus = 'pending' | 'running' | 'success' | 'failed'

// Pipeline 步骤
export interface PipelineStep {
  key: string
  title: string
  desc: string
  status: PipelineStatus
  detail?: string
}

// 数据列定义
export interface DataColumn {
  field: string
  label: string
  align?: 'left' | 'center' | 'right'
  width?: number
  formatter?: 'currency' | 'percent' | 'number' | 'text'
}

// 数据行
export type DataRow = Record<string, string | number | null>

// 结构化数据集
export interface Dataset {
  columns: DataColumn[]
  rows: DataRow[]
  total?: number
}

// ECharts 配置
export interface ChartConfig {
  type: ChartType
  title: string
  option: any
}

// 洞察报告 - 数据概览项
export interface OverviewItem {
  label: string
  value: string
  yoy?: string      // 同比
  mom?: string      // 环比
  target?: string   // 目标达成率
  trend?: 'up' | 'down' | 'flat'
}

// 洞察报告 - 异常归因项
export interface AttributionItem {
  dimension: string
  problem: string
  impact: string
  evidence: string
}

// 洞察报告 - 优化建议项
export interface SuggestionItem {
  type: 'short_term' | 'long_term'
  title: string
  detail: string
  expectedEffect: string
}

// AI 洞察报告
export interface InsightReport {
  overviews: OverviewItem[]
  attributions: AttributionItem[]
  suggestions: SuggestionItem[]
  risks: string[]
}

// AI 回复消息内容
export interface AssistantPayload {
  // 流程阶段（决定气泡渲染分支）
  phase?: ChatPhase
  // 改写后的 query（data/followup 阶段）
  rewrittenQuery?: string
  // 知识库检索命中（data 阶段）
  retrievedContext?: RetrievedContext
  // 澄清问题（data 阶段且意图不清晰时）
  clarifyQuestion?: ClarifyQuestion
  // 当前是否为澄清轮（等待用户补充）
  isClarifyRound?: boolean
  // 闲聊回复正文（仅 phase=chat）
  chatReply?: string
  // 分析思路（含自定义归因维度）
  analysisPath?: AnalysisPath
  // 原有字段
  intent?: IntentType
  modelType?: AnalysisModelType
  pipeline?: PipelineStep[]
  sql?: string
  dataset?: Dataset
  chart?: ChartConfig
  insight?: InsightReport
  summary?: string
  error?: string
}

// 对话消息
export interface ChatBIMessage {
  id: string
  role: ChatRole
  content: string
  payload?: AssistantPayload
  createdAt: number
  loading?: boolean
}

// 对话会话
export interface ChatBIConversation {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  archived: boolean
  messages: ChatBIMessage[]
}

// 语义知识库定义
export interface AnalysisModel {
  type: AnalysisModelType
  name: string
  desc: string
  icon: string
  dimensions: string[]
  metrics: string[]
  priority: number
  examples: string[]
  // 同义词（用于 query 改写与检索命中打分）
  synonyms?: string[]
  // 业务规则/口径描述（注入 LLM prompt）
  businessRules?: string[]
  // 该模型典型 SQL 骨架（含 {{time}} {{dim}} 等占位符，作为 LLM few-shot 示例）
  sqlTemplate?: string
  // 维度 -> 枚举值映射（如 { region: ['华南','华东',...] }）
  entities?: Record<string, string[]>
  // 反向关联的指标编码列表
  relatedMetricCodes?: string[]
}

// 指标知识库项
export interface MetricDictItem {
  code: string
  name: string
  level: 1 | 2 | 3
  parent?: string
  definition: string
  formula: string
  dimensions: string[]
  sourceTable: string
  updateFreq: string
  // 反向关联到语义模型
  modelType?: AnalysisModelType
}

// ========== ChatBI 流程相关类型 ==========

// 大类分支：闲聊 / 数据分析 / 追问
export type ChatPhase = 'chat' | 'data' | 'followup'

// 意图识别结果
export interface IntentResult {
  phase: ChatPhase
  intent?: IntentType
  confidence: number
  reason?: string
  // 闲聊时直接给出回复
  chatReply?: string
}

// 追问上下文
export interface FollowupContext {
  isFollowup: boolean
  originalQuery?: string
  lastSql?: string
  lastModelType?: AnalysisModelType
}

// 意图澄清结果
export interface ClarifyQuestion {
  clear: boolean
  question?: string
  missingDims?: string[]
  suggestions?: string[]
}

// 知识库检索结果
export interface RetrievedContext {
  semantic: AnalysisModel[]
  metric: MetricDictItem[]
  synonyms: Array<{ from: string; to: string }>
  entities: Record<string, string[]>
}

// 分析思路（含自定义归因维度）
export interface AnalysisPath {
  name: string
  dimensions: string[]
  custom?: boolean
}

// 导出格式
export type ExportFormat = 'pdf' | 'word' | 'image'
