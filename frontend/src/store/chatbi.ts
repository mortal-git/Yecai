import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  ChatBIConversation, ChatBIMessage, PipelineStep, AssistantPayload,
  AnalysisModel, MetricDictItem, FollowupContext, RetrievedContext,
  IntentResult, ClarifyQuestion, AnalysisPath, ExportFormat
} from '../types/chatbi'
import { ANALYSIS_MODELS, METRIC_DICT, FOLLOWUP_MARKERS, ENTITY_MAP, ANALYSIS_PATHS, parseTimeRange } from '../mock/chatbi'
import { useAgentModelStore } from './agentModel'
import {
  callIntentRecognition, callQueryRewrite, callClarifyIntent,
  callGenerateSQL, callAttribution
} from '../api/chatbi'
import type { ModelConfig as AgentModelConfig } from '../types/agent'

const STORAGE_KEY = 'chatbi.conversations.v1'
const ACTIVE_KEY = 'chatbi.activeConvId.v1'
const KB_MODELS_KEY = 'chatbi.kb.models.v1'
const KB_METRICS_KEY = 'chatbi.kb.metrics.v1'

function uid(prefix = ''): string {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

function loadConversations(): ChatBIConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function loadKb<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data as T : fallback
  } catch {
    return fallback
  }
}

// ========== Pipeline 构建（5 步） ==========
function buildPipelineV2(): PipelineStep[] {
  return [
    { key: 'intent', title: '意图识别', desc: '判定闲聊/问数/追问', status: 'pending' },
    { key: 'rewrite', title: 'Query 改写', desc: '追问补全上下文', status: 'pending' },
    { key: 'retrieve', title: '知识检索', desc: '语义知识库 + 指标知识库', status: 'pending' },
    { key: 'clarify', title: '意图澄清', desc: '判断是否缺维度/时间', status: 'pending' },
    { key: 'generate', title: 'SQL 生成与归因', desc: 'NL2SQL + 图表 + 归因', status: 'pending' }
  ]
}

function setPipelineStep(pipeline: PipelineStep[], idx: number, status: PipelineStep['status'], detail?: string) {
  if (!pipeline[idx]) return
  pipeline[idx].status = status
  if (detail) pipeline[idx].detail = detail
  for (let i = 0; i < idx; i++) {
    if (pipeline[i].status === 'pending') pipeline[i].status = 'success'
  }
}

export const useChatbiStore = defineStore('chatbi', () => {
  const conversations = ref<ChatBIConversation[]>(loadConversations())
  const activeId = ref<string>(localStorage.getItem(ACTIVE_KEY) || '')
  const sending = ref(false)

  const models = ref<AnalysisModel[]>(loadKb(KB_MODELS_KEY, ANALYSIS_MODELS))
  const metrics = ref<MetricDictItem[]>(loadKb(KB_METRICS_KEY, METRIC_DICT))

  watch(conversations, val => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, { deep: true })

  watch(activeId, val => {
    localStorage.setItem(ACTIVE_KEY, val)
  })

  watch(models, val => {
    localStorage.setItem(KB_MODELS_KEY, JSON.stringify(val))
  }, { deep: true })

  watch(metrics, val => {
    localStorage.setItem(KB_METRICS_KEY, JSON.stringify(val))
  }, { deep: true })

  const activeConversations = computed(() =>
    conversations.value.filter(c => !c.archived).sort((a, b) => b.updatedAt - a.updatedAt)
  )
  const archivedConversations = computed(() =>
    conversations.value.filter(c => c.archived).sort((a, b) => b.updatedAt - a.updatedAt)
  )
  const activeConv = computed(() =>
    conversations.value.find(c => c.id === activeId.value) || null
  )

  function createConversation(title = '新数据分析'): ChatBIConversation {
    const conv: ChatBIConversation = {
      id: uid('cb_'),
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      archived: false,
      messages: []
    }
    conversations.value.unshift(conv)
    activeId.value = conv.id
    return conv
  }

  function switchConversation(id: string) {
    activeId.value = id
  }

  function archiveConversation(id: string) {
    const conv = conversations.value.find(c => c.id === id)
    if (conv) {
      conv.archived = true
      if (activeId.value === id) {
        const next = activeConversations.value[0]
        activeId.value = next?.id || ''
      }
    }
  }

  function deleteConversation(id: string) {
    const idx = conversations.value.findIndex(c => c.id === id)
    if (idx >= 0) {
      conversations.value.splice(idx, 1)
      if (activeId.value === id) {
        const next = activeConversations.value[0]
        activeId.value = next?.id || ''
      }
    }
  }

  function renameConversation(id: string, title: string) {
    const conv = conversations.value.find(c => c.id === id)
    if (conv) {
      conv.title = title
      conv.updatedAt = Date.now()
    }
  }

  function clearAll() {
    conversations.value = []
    activeId.value = ''
  }

  // ===== 知识库 CRUD =====
  function upsertModel(m: AnalysisModel) {
    const idx = models.value.findIndex(x => x.type === m.type)
    if (idx >= 0) models.value[idx] = m
    else models.value.push(m)
  }
  function deleteModel(type: string) {
    const idx = models.value.findIndex(x => x.type === type)
    if (idx >= 0) models.value.splice(idx, 1)
  }
  function upsertMetric(m: MetricDictItem) {
    const idx = metrics.value.findIndex(x => x.code === m.code)
    if (idx >= 0) metrics.value[idx] = m
    else metrics.value.push(m)
  }
  function deleteMetric(code: string) {
    const idx = metrics.value.findIndex(x => x.code === code)
    if (idx >= 0) metrics.value.splice(idx, 1)
  }
  function resetKb() {
    models.value = JSON.parse(JSON.stringify(ANALYSIS_MODELS))
    metrics.value = JSON.parse(JSON.stringify(METRIC_DICT))
  }

  // ===== 追问判定（前端规则） =====
  function detectFollowup(text: string, conv: ChatBIConversation, lastAssistant?: ChatBIMessage): FollowupContext {
    const ctx: FollowupContext = { isFollowup: false }
    if (!lastAssistant || lastAssistant.role !== 'assistant') return ctx
    const payload = lastAssistant.payload
    if (!payload?.sql) return ctx
    const hit = FOLLOWUP_MARKERS.some(m => text.includes(m))
    if (!hit) return ctx
    // 找上一轮用户原始问题（最后一条 user 消息，即当前消息之前的那条 user）
    const userMsgs = conv.messages.filter(m => m.role === 'user')
    const prevUser = userMsgs[userMsgs.length - 2] // 倒数第二条 user（最后一条是当前刚 push 的）
    return {
      isFollowup: true,
      originalQuery: prevUser?.content,
      lastSql: payload.sql,
      lastModelType: payload.modelType
    }
  }

  // ===== 知识库检索（前端规则） =====
  function retrieveFromKB(rewrittenQuery: string): RetrievedContext {
    const q = rewrittenQuery.toLowerCase()
    const result: RetrievedContext = { semantic: [], metric: [], synonyms: [], entities: {} }

    const modelScores = models.value.map(m => {
      let score = 0
      const synonyms = m.synonyms || []
      for (const s of synonyms) if (q.includes(s.toLowerCase())) score += 2
      if (q.includes(m.name.toLowerCase())) score += 3
      for (const met of m.metrics) if (q.includes(met.toLowerCase())) score += 1
      for (const dim of m.dimensions) if (q.includes(dim)) score += 0.5
      return { m, score }
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score)
    result.semantic = modelScores.slice(0, 3).map(x => x.m)

    const metricScores = metrics.value.map(m => {
      let score = 0
      if (q.includes(m.name.toLowerCase())) score += 3
      if (m.parent && q.includes(m.parent)) score += 1
      return { m, score }
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score)
    result.metric = metricScores.slice(0, 5).map(x => x.m)

    for (const m of result.semantic) {
      if (!m.synonyms) continue
      for (const s of m.synonyms) {
        if (q.includes(s.toLowerCase()) && s !== m.name) {
          result.synonyms.push({ from: s, to: m.name })
        }
      }
    }

    const allEntities: Record<string, string[]> = { ...ENTITY_MAP }
    for (const m of result.semantic) {
      if (m.entities) Object.assign(allEntities, m.entities)
    }
    for (const [dim, values] of Object.entries(allEntities)) {
      const hitValues = values.filter(v => q.includes(v))
      if (hitValues.length) result.entities[dim] = hitValues
    }

    if (result.semantic.length === 0) {
      const fallback = [...models.value].sort((a, b) => a.priority - b.priority)[0]
      if (fallback) result.semantic = [fallback]
    }

    return result
  }

  function patchActiveAiMsg(convId: string, aiMsgId: string, patch: Partial<AssistantPayload>) {
    const targetConv = conversations.value.find(c => c.id === convId)
    if (!targetConv) return
    const msg = targetConv.messages.find(m => m.id === aiMsgId)
    if (msg) {
      msg.payload = { ...(msg.payload || {}), ...patch }
    }
  }

  // 澄清 + SQL 生成 + 归因 的共用尾部
  async function runClarifyAndGenerate(
    convId: string,
    aiMsgId: string,
    activeModel: AgentModelConfig,
    rewritten: string,
    retrieved: RetrievedContext,
    pipeline: PipelineStep[],
    timeRange: { start: string; end: string; label: string }
  ) {
    setPipelineStep(pipeline, 3, 'running', '判断意图清晰度...')
    patchActiveAiMsg(convId, aiMsgId, { pipeline: JSON.parse(JSON.stringify(pipeline)) })

    const clarify: ClarifyQuestion = await callClarifyIntent(activeModel, rewritten, retrieved)

    if (!clarify.clear) {
      setPipelineStep(pipeline, 3, 'success', `不清晰：缺 ${(clarify.missingDims || []).join('、') || '信息'}`)
      pipeline[4].status = 'pending'
      patchActiveAiMsg(convId, aiMsgId, {
        phase: 'data',
        isClarifyRound: true,
        rewrittenQuery: rewritten,
        retrievedContext: retrieved,
        clarifyQuestion: clarify,
        pipeline: JSON.parse(JSON.stringify(pipeline))
      })
      const targetConv = conversations.value.find(c => c.id === convId)
      const msg = targetConv?.messages.find(m => m.id === aiMsgId)
      if (msg) { msg.loading = false; msg.content = clarify.question || '请补充更多信息' }
      return
    }

    setPipelineStep(pipeline, 3, 'success', '意图清晰')
    patchActiveAiMsg(convId, aiMsgId, { pipeline: JSON.parse(JSON.stringify(pipeline)) })

    setPipelineStep(pipeline, 4, 'running', '生成 NL2SQL 与图表...')
    patchActiveAiMsg(convId, aiMsgId, { pipeline: JSON.parse(JSON.stringify(pipeline)) })

    const { sql, analysisPath, dataset, chartConfig } = await callGenerateSQL(activeModel, rewritten, retrieved)
    const insight = await callAttribution(activeModel, dataset, analysisPath)
    setPipelineStep(pipeline, 4, 'success', 'SQL + 图表 + 归因 已生成')

    const modelType = retrieved.semantic[0]?.type
    const summary = insight.overviews[0]
      ? `${insight.overviews[0].label}：${insight.overviews[0].value}${insight.overviews[0].yoy ? '（同比 ' + insight.overviews[0].yoy + '）' : ''}`
      : '数据分析完成'

    patchActiveAiMsg(convId, aiMsgId, {
      phase: 'data',
      rewrittenQuery: rewritten,
      retrievedContext: retrieved,
      sql,
      dataset,
      chart: chartConfig,
      insight,
      analysisPath,
      modelType,
      summary,
      pipeline: JSON.parse(JSON.stringify(pipeline))
    })

    const targetConv = conversations.value.find(c => c.id === convId)
    const msg = targetConv?.messages.find(m => m.id === aiMsgId)
    if (msg) { msg.loading = false; msg.content = summary }
    if (targetConv) targetConv.updatedAt = Date.now()
  }

  // ===== 发送消息主流程 =====
  async function sendMessage(text: string) {
    if (!text.trim() || sending.value) return
    let conv = activeConv.value
    if (!conv) {
      conv = createConversation(text.slice(0, 16))
    } else if (conv.messages.length === 0) {
      conv.title = text.slice(0, 16)
    }

    const userMsg: ChatBIMessage = {
      id: uid('u_'),
      role: 'user',
      content: text,
      createdAt: Date.now()
    }
    conv.messages.push(userMsg)
    conv.updatedAt = Date.now()

    const aiMsgId = uid('a_')
    const aiMsg: ChatBIMessage = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      payload: { pipeline: buildPipelineV2() },
      createdAt: Date.now(),
      loading: true
    }
    conv.messages.push(aiMsg)

    sending.value = true
    const convId = conv.id

    const modelStore = useAgentModelStore()
    const activeModel = modelStore.activeModel
    if (!activeModel) {
      patchActiveAiMsg(convId, aiMsgId, {
        phase: 'chat',
        chatReply: '请先在「智能体 - 模型配置」中配置一个可用的 LLM 模型，再来提问。',
        pipeline: []
      })
      const targetConv = conversations.value.find(c => c.id === convId)
      const msg = targetConv?.messages.find(m => m.id === aiMsgId)
      if (msg) { msg.loading = false; msg.content = '请先配置可用模型' }
      sending.value = false
      return
    }

    const prevMsgs = conv.messages.slice(0, -1)
    const lastAssistant = [...prevMsgs].reverse().find(m => m.role === 'assistant')

    const pipeline = aiMsg.payload!.pipeline!
    const timeRange = parseTimeRange(text)

    try {
      // 分支 A：澄清轮补充
      if (lastAssistant?.payload?.isClarifyRound && lastAssistant.payload.rewrittenQuery) {
        const rewritten = `${lastAssistant.payload.rewrittenQuery} ${text}`
        setPipelineStep(pipeline, 0, 'success', '澄清轮补充')
        setPipelineStep(pipeline, 1, 'success', `合并后：${rewritten}`)
        patchActiveAiMsg(convId, aiMsgId, { pipeline: JSON.parse(JSON.stringify(pipeline)) })

        const retrieved = retrieveFromKB(rewritten)
        setPipelineStep(pipeline, 2, 'success', `命中 ${retrieved.semantic.length} 模型 / ${retrieved.metric.length} 指标`)
        patchActiveAiMsg(convId, aiMsgId, { pipeline: JSON.parse(JSON.stringify(pipeline)) })

        await runClarifyAndGenerate(convId, aiMsgId, activeModel, rewritten, retrieved, pipeline, timeRange)
        sending.value = false
        return
      }

      // 分支 B：追问判定
      const followupCtx = detectFollowup(text, conv, lastAssistant)
      let rewritten: string

      if (followupCtx.isFollowup) {
        setPipelineStep(pipeline, 0, 'running', '识别为追问')
        patchActiveAiMsg(convId, aiMsgId, { pipeline: JSON.parse(JSON.stringify(pipeline)) })
        rewritten = await callQueryRewrite(activeModel, text, followupCtx)
        setPipelineStep(pipeline, 0, 'success', '追问识别完成')
        setPipelineStep(pipeline, 1, 'success', `改写：${rewritten}`)
        patchActiveAiMsg(convId, aiMsgId, {
          phase: 'followup',
          rewrittenQuery: rewritten,
          pipeline: JSON.parse(JSON.stringify(pipeline))
        })
      } else {
        // 分支 C：意图识别
        setPipelineStep(pipeline, 0, 'running', '识别意图...')
        patchActiveAiMsg(convId, aiMsgId, { pipeline: JSON.parse(JSON.stringify(pipeline)) })

        const intent: IntentResult = await callIntentRecognition(activeModel, text, followupCtx)
        setPipelineStep(pipeline, 0, 'success', `phase=${intent.phase}, confidence=${intent.confidence.toFixed(2)}`)

        if (intent.phase === 'chat') {
          pipeline[1].status = 'pending'
          pipeline[2].status = 'pending'
          pipeline[3].status = 'pending'
          pipeline[4].status = 'pending'
          patchActiveAiMsg(convId, aiMsgId, {
            phase: 'chat',
            chatReply: intent.chatReply || '您好，有什么可以帮您分析的数据吗？',
            pipeline: JSON.parse(JSON.stringify(pipeline))
          })
          const targetConv = conversations.value.find(c => c.id === convId)
          const msg = targetConv?.messages.find(m => m.id === aiMsgId)
          if (msg) { msg.loading = false; msg.content = intent.chatReply || '您好' }
          sending.value = false
          return
        }

        rewritten = text
        setPipelineStep(pipeline, 1, 'success', '首轮无需改写')
        patchActiveAiMsg(convId, aiMsgId, {
          phase: 'data',
          rewrittenQuery: rewritten,
          pipeline: JSON.parse(JSON.stringify(pipeline))
        })
      }

      // 知识库检索
      setPipelineStep(pipeline, 2, 'running', '检索语义+指标知识库...')
      patchActiveAiMsg(convId, aiMsgId, { pipeline: JSON.parse(JSON.stringify(pipeline)) })

      const retrieved = retrieveFromKB(rewritten)
      setPipelineStep(pipeline, 2, 'success', `命中 ${retrieved.semantic.length} 模型 / ${retrieved.metric.length} 指标`)
      patchActiveAiMsg(convId, aiMsgId, {
        retrievedContext: retrieved,
        pipeline: JSON.parse(JSON.stringify(pipeline))
      })

      await runClarifyAndGenerate(convId, aiMsgId, activeModel, rewritten, retrieved, pipeline, timeRange)
    } catch (err) {
      console.error('[chatbi] sendMessage error:', err)
      patchActiveAiMsg(convId, aiMsgId, {
        phase: 'chat',
        chatReply: '处理过程中出现异常，请稍后重试或换种问法。',
        error: String(err)
      })
      const targetConv = conversations.value.find(c => c.id === convId)
      const msg = targetConv?.messages.find(m => m.id === aiMsgId)
      if (msg) { msg.loading = false; msg.content = '处理异常，请重试' }
    } finally {
      sending.value = false
    }
  }

  // ===== 自定义分析思路：重跑归因 =====
  async function runAttribution(convId: string, aiMsgId: string, analysisPath: AnalysisPath) {
    const conv = conversations.value.find(c => c.id === convId)
    if (!conv) return
    const msg = conv.messages.find(m => m.id === aiMsgId)
    if (!msg?.payload?.dataset) return

    const modelStore = useAgentModelStore()
    const activeModel = modelStore.activeModel
    if (!activeModel) return

    msg.loading = true
    try {
      const insight = await callAttribution(activeModel, msg.payload.dataset, analysisPath)
      msg.payload = {
        ...msg.payload,
        insight,
        analysisPath,
        summary: insight.overviews[0]
          ? `${insight.overviews[0].label}：${insight.overviews[0].value}`
          : msg.payload.summary
      }
      msg.content = msg.payload.summary || msg.content
    } finally {
      msg.loading = false
    }
  }

  function exportReport(convId: string, format: ExportFormat): Promise<boolean> {
    return new Promise(resolve => {
      setTimeout(() => {
        const conv = conversations.value.find(c => c.id === convId)
        if (!conv) {
          resolve(false)
          return
        }
        resolve(true)
      }, 800)
    })
  }

  return {
    conversations,
    activeId,
    sending,
    models,
    metrics,
    analysisPaths: ANALYSIS_PATHS,
    activeConversations,
    archivedConversations,
    activeConv,
    createConversation,
    switchConversation,
    archiveConversation,
    deleteConversation,
    renameConversation,
    clearAll,
    sendMessage,
    runAttribution,
    exportReport,
    upsertModel,
    deleteModel,
    upsertMetric,
    deleteMetric,
    resetKb
  }
})
