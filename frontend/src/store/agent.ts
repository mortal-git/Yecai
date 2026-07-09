import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Conversation, Message, TodoItem, PromptTemplate } from '../types/agent'
import { streamChat } from '../api/llm'
import { parseTodos, TODO_SYSTEM_PROMPT, STEP_MODE_PROMPT, todosToText, todosToCsv } from '../utils/todoParser'
import { useAgentModelStore } from './agentModel'

const STORAGE_KEY = 'agent.conversations.v1'
const ACTIVE_KEY = 'agent.activeConvId.v1'
const TEMPLATES_KEY = 'agent.promptTemplates.v1'

function uid(prefix = ''): string {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function loadTemplates(): PromptTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (Array.isArray(data)) return data
    }
  } catch { /* fallthrough */ }
  return [
    { id: 'tpl_default', name: '通用助手', content: '你是一个专业、友好的助手，擅长为用户解决业务和日常问题。' },
    { id: 'tpl_finance', name: '财务专家', content: '你是一名资深财务顾问，回答业财融合、对账、应收应付相关问题时严谨规范。' },
    { id: 'tpl_code', name: '代码工程师', content: '你是一名资深前端工程师，擅长 Vue 3、TypeScript、Element Plus 与代码审查。' }
  ]
}

export const useAgentStore = defineStore('agent', () => {
  const modelStore = useAgentModelStore()

  const conversations = ref<Conversation[]>(loadConversations())
  const activeId = ref<string>(localStorage.getItem(ACTIVE_KEY) || '')
  const promptTemplates = ref<PromptTemplate[]>(loadTemplates())
  const sending = ref(false)
  let abortCtrl: AbortController | null = null

  watch(conversations, val => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, { deep: true })

  watch(activeId, val => {
    localStorage.setItem(ACTIVE_KEY, val)
  })

  watch(promptTemplates, val => {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(val))
  }, { deep: true })

  const activeConversations = computed(() => conversations.value.filter(c => !c.archived).sort((a, b) => b.updatedAt - a.updatedAt))
  const archivedConversations = computed(() => conversations.value.filter(c => c.archived).sort((a, b) => b.updatedAt - a.updatedAt))
  const activeConv = computed(() => conversations.value.find(c => c.id === activeId.value) || null)

  function createConversation(opts: { title?: string; modelId?: string; systemPrompt?: string } = {}): Conversation {
    const conv: Conversation = {
      id: uid('c_'),
      title: opts.title || '新对话',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      modelId: opts.modelId || modelStore.activeId || '',
      archived: false,
      systemPrompt: opts.systemPrompt,
      stepMode: false,
      messages: []
    }
    conversations.value.unshift(conv)
    activeId.value = conv.id
    return conv
  }

  function ensureActive(): Conversation {
    if (activeConv.value) return activeConv.value
    return createConversation()
  }

  function switchConversation(id: string) {
    if (conversations.value.some(c => c.id === id)) activeId.value = id
  }

  function renameConversation(id: string, title: string) {
    const c = conversations.value.find(x => x.id === id)
    if (c) {
      c.title = title.trim() || c.title
      c.updatedAt = Date.now()
    }
  }

  function deleteConversation(id: string) {
    const idx = conversations.value.findIndex(c => c.id === id)
    if (idx === -1) return
    conversations.value.splice(idx, 1)
    if (activeId.value === id) {
      activeId.value = activeConversations.value[0]?.id || ''
    }
  }

  function archiveConversation(id: string, archived = true) {
    const c = conversations.value.find(x => x.id === id)
    if (c) {
      c.archived = archived
      c.updatedAt = Date.now()
      if (archived && activeId.value === id) {
        activeId.value = activeConversations.value[0]?.id || ''
      }
    }
  }

  function clearAllHistory() {
    conversations.value = []
    activeId.value = ''
  }

  function clearMemory(id: string) {
    const c = conversations.value.find(x => x.id === id)
    if (c) {
      c.messages = []
      c.updatedAt = Date.now()
    }
  }

  function deleteMessage(convId: string, msgId: string) {
    const c = conversations.value.find(x => x.id === convId)
    if (!c) return
    const idx = c.messages.findIndex(m => m.id === msgId)
    if (idx >= 0) {
      c.messages.splice(idx, 1)
      c.updatedAt = Date.now()
    }
  }

  function setStepMode(id: string, on: boolean) {
    const c = conversations.value.find(x => x.id === id)
    if (c) c.stepMode = on
  }

  function setSystemPrompt(id: string, prompt: string) {
    const c = conversations.value.find(x => x.id === id)
    if (c) c.systemPrompt = prompt
  }

  function searchMessages(keyword: string): { conv: Conversation; msg: Message }[] {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return []
    const results: { conv: Conversation; msg: Message }[] = []
    conversations.value.forEach(c => {
      c.messages.forEach(m => {
        if (m.content.toLowerCase().includes(kw)) results.push({ conv: c, msg: m })
      })
    })
    return results
  }

  function buildSystemMessages(conv: Conversation): { role: 'system' | 'user' | 'assistant'; content: string }[] {
    const sys: string[] = []
    if (conv.systemPrompt && conv.systemPrompt.trim()) sys.push(conv.systemPrompt.trim())
    sys.push(TODO_SYSTEM_PROMPT)
    if (conv.stepMode) sys.push(STEP_MODE_PROMPT)
    return [{ role: 'system' as const, content: sys.join('\n\n') }]
  }

  async function sendMessage(text: string): Promise<void> {
    const content = text.trim()
    if (!content || sending.value) return
    const conv = ensureActive()
    const model = modelStore.models.find(m => m.id === conv.modelId) || modelStore.activeModel
    if (!model) throw new Error('请先在「模型配置」中添加并选择模型')
    if (!model.apiKeyCipher) throw new Error('当前模型未配置 API Key')

    const limitCheck = modelStore.recordCall(model.id)
    if (!limitCheck.allowed) throw new Error(limitCheck.reason || '已达调用上限')

    const userMsg: Message = {
      id: uid('m_'),
      role: 'user',
      content,
      createdAt: Date.now()
    }
    conv.messages.push(userMsg)
    if (conv.messages.length === 1 || conv.title === '新对话') {
      conv.title = content.slice(0, 20) || '新对话'
    }
    conv.updatedAt = Date.now()

    const aiMsg: Message = {
      id: uid('m_'),
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
      modelId: model.id,
      loading: true
    }
    conv.messages.push(aiMsg)

    sending.value = true
    abortCtrl = new AbortController()
    try {
      const sysMsgs = buildSystemMessages(conv)
      const history = conv.messages
        .filter(m => m.id !== aiMsg.id && m.role !== 'system')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      await streamChat(model, [...sysMsgs, ...history], {
        signal: abortCtrl.signal,
        onDelta: delta => {
          aiMsg.content += delta
        }
      })
      const { todos, cleanContent } = parseTodos(aiMsg.content)
      if (todos.length) {
        aiMsg.todos = todos
        aiMsg.content = cleanContent
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        aiMsg.content = (aiMsg.content || '') + `\n\n> ⚠️ 调用失败：${e?.message || e}`
      }
    } finally {
      aiMsg.loading = false
      sending.value = false
      conv.updatedAt = Date.now()
      abortCtrl = null
    }
  }

  function abortSending() {
    if (abortCtrl) {
      abortCtrl.abort()
      abortCtrl = null
    }
  }

  async function regenerate(convId: string, msgId: string): Promise<void> {
    const c = conversations.value.find(x => x.id === convId)
    if (!c) return
    const idx = c.messages.findIndex(m => m.id === msgId)
    if (idx < 1) return
    const target = c.messages[idx]
    if (target.role !== 'assistant') return
    let userIdx = idx - 1
    while (userIdx >= 0 && c.messages[userIdx].role !== 'user') userIdx--
    if (userIdx < 0) return
    const userText = c.messages[userIdx].content
    c.messages.splice(userIdx, c.messages.length - userIdx)
    activeId.value = convId
    await sendMessage(userText)
  }

  function toggleTodo(convId: string, msgId: string, todoId: string) {
    const c = conversations.value.find(x => x.id === convId)
    const m = c?.messages.find(x => x.id === msgId)
    if (!m?.todos) return
    const walk = (list: TodoItem[]): boolean => {
      for (const t of list) {
        if (t.id === todoId) { t.done = !t.done; return true }
        if (t.subSteps && walk(t.subSteps)) return true
      }
      return false
    }
    walk(m.todos)
    if (c) c.updatedAt = Date.now()
  }

  function updateTodo(convId: string, msgId: string, todoId: string, patch: Partial<TodoItem>) {
    const c = conversations.value.find(x => x.id === convId)
    const m = c?.messages.find(x => x.id === msgId)
    if (!m?.todos) return
    const walk = (list: TodoItem[]): boolean => {
      for (const t of list) {
        if (t.id === todoId) {
          Object.assign(t, patch)
          return true
        }
        if (t.subSteps && walk(t.subSteps)) return true
      }
      return false
    }
    walk(m.todos)
    if (c) c.updatedAt = Date.now()
  }

  function addTodo(convId: string, msgId: string, text: string) {
    const c = conversations.value.find(x => x.id === convId)
    const m = c?.messages.find(x => x.id === msgId)
    if (!m) return
    if (!m.todos) m.todos = []
    m.todos.push({ id: uid('t_'), text, done: false })
    if (c) c.updatedAt = Date.now()
  }

  function removeTodo(convId: string, msgId: string, todoId: string) {
    const c = conversations.value.find(x => x.id === convId)
    const m = c?.messages.find(x => x.id === msgId)
    if (!m?.todos) return
    const walk = (list: TodoItem[]): boolean => {
      const i = list.findIndex(t => t.id === todoId)
      if (i >= 0) { list.splice(i, 1); return true }
      for (const t of list) if (t.subSteps && walk(t.subSteps)) return true
      return false
    }
    walk(m.todos)
    if (c) c.updatedAt = Date.now()
  }

  function exportTodos(convId: string, msgId: string, format: 'text' | 'csv'): string {
    const c = conversations.value.find(x => x.id === convId)
    const m = c?.messages.find(x => x.id === msgId)
    if (!m?.todos?.length) return ''
    return format === 'csv' ? todosToCsv(m.todos) : todosToText(m.todos)
  }

  function downloadFile(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  function exportTodosAsFile(convId: string, msgId: string, format: 'text' | 'csv') {
    const content = exportTodos(convId, msgId, format)
    if (!content) return
    const ext = format === 'csv' ? 'csv' : 'txt'
    const mime = format === 'csv' ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8'
    downloadFile(content, `todos-${Date.now()}.${ext}`, mime)
  }

  function addPromptTemplate(name: string, content: string) {
    promptTemplates.value.push({ id: uid('tpl_'), name, content })
  }

  function removePromptTemplate(id: string) {
    const i = promptTemplates.value.findIndex(t => t.id === id)
    if (i >= 0) promptTemplates.value.splice(i, 1)
  }

  return {
    conversations,
    activeId,
    activeConv,
    activeConversations,
    archivedConversations,
    promptTemplates,
    sending,
    createConversation,
    switchConversation,
    renameConversation,
    deleteConversation,
    archiveConversation,
    clearAllHistory,
    clearMemory,
    deleteMessage,
    setStepMode,
    setSystemPrompt,
    searchMessages,
    sendMessage,
    abortSending,
    regenerate,
    toggleTodo,
    updateTodo,
    addTodo,
    removeTodo,
    exportTodos,
    exportTodosAsFile,
    addPromptTemplate,
    removePromptTemplate
  }
})
