export type Role = 'user' | 'assistant' | 'system'

export type TodoTag = '工作' | '生活' | '项目' | '财务'
export type TodoPriority = '高' | '中' | '低'

export interface TodoItem {
  id: string
  text: string
  done: boolean
  subSteps?: TodoItem[]
  tag?: TodoTag
  priority?: TodoPriority
  deadline?: number
}

export interface Message {
  id: string
  role: Role
  content: string
  createdAt: number
  modelId?: string
  todos?: TodoItem[]
  loading?: boolean
}

export interface Conversation {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  modelId: string
  archived: boolean
  systemPrompt?: string
  stepMode?: boolean
  messages: Message[]
}

export type ModelCategory = '通用' | '代码' | '行业'

export interface ModelParams {
  temperature: number
  maxTokens: number
  topP: number
}

export interface ModelConfig {
  id: string
  name: string
  baseURL: string
  apiKeyCipher: string
  modelName: string
  category: ModelCategory
  isDefault: boolean
  params: ModelParams
  status?: 'unknown' | 'ok' | 'invalid'
  dailyLimit?: number
  callCount?: number
  callDate?: string
}

export interface PromptTemplate {
  id: string
  name: string
  content: string
}
