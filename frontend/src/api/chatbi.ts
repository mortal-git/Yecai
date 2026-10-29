import { streamChat } from './llm'
import type { ModelConfig } from '../types/agent'
import type {
  IntentResult, FollowupContext, ClarifyQuestion, RetrievedContext,
  AnalysisPath, Dataset, ChartConfig, InsightReport, AnalysisModel
} from '../types/chatbi'

// 从 LLM 输出中提取首个 JSON 对象（容错：丢弃 ```json fenced block、首尾多余文本）
function extractJSON(text: string): any {
  if (!text) return null
  // 去 markdown fenced block
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const raw = fenced ? fenced[1] : text
  // 找首个 {...}
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  try {
    return JSON.parse(raw.slice(start, end + 1))
  } catch {
    return null
  }
}

// 统一调用：system prompt + user prompt，返回解析后的 JSON
async function callJSON(
  model: ModelConfig,
  systemPrompt: string,
  userPrompt: string,
  fallback: any
): Promise<any> {
  try {
    const full = await streamChat(model, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ])
    const parsed = extractJSON(full)
    return parsed || fallback
  } catch (err) {
    console.error('[chatbi] LLM call failed:', err)
    return fallback
  }
}

// 拼装知识库上下文（注入到 prompt）
function buildKBContext(retrieved: RetrievedContext | null): string {
  if (!retrieved) return '（本轮未检索到相关知识库信息）'
  const semantic = retrieved.semantic.map((m: AnalysisModel) =>
    `- ${m.name}（type=${m.type}）：${m.desc}\n  维度：${m.dimensions.join('、')}\n  指标：${m.metrics.join('、')}\n  业务规则：${(m.businessRules || []).join('；') || '无'}\n  SQL 模板：${m.sqlTemplate || '无'}`
  ).join('\n')
  const metric = retrieved.metric.map(m =>
    `- [${m.code}] ${m.name}（L${m.level}）：${m.definition}\n  公式：${m.formula}\n  来源表：${m.sourceTable}\n  维度：${m.dimensions.join('、')}`
  ).join('\n')
  const synonyms = retrieved.synonyms.length
    ? retrieved.synonyms.map(s => `${s.from}->${s.to}`).join('、')
    : '无'
  const entities = Object.keys(retrieved.entities).length
    ? Object.entries(retrieved.entities).map(([k, v]) => `${k}: ${v.join('/')}`).join('；')
    : '无'
  return `【语义知识库命中】\n${semantic || '无'}\n\n【指标知识库命中】\n${metric || '无'}\n\n【同义词替换】${synonyms}\n\n【枚举值】${entities}`
}

// ========== 1. 意图识别 ==========
// 输入用户 query + 上一轮上下文，判定 chat / data / followup；闲聊时直接给 chatReply
export async function callIntentRecognition(
  model: ModelConfig,
  query: string,
  lastCtx: FollowupContext | null
): Promise<IntentResult> {
  const sys = `你是一个意图识别模块。判断用户输入属于以下哪一类：
- chat：闲聊、问候、咨询产品功能、非数据分析类问题。同时给出自然语言回复 chatReply。
- data：明确的数据分析/问数需求（含具体指标、维度、时间）。
- followup：基于上一轮分析的追问（如「那近一周呢」「换成成本」「按区域看」）。

输出 JSON：{"phase":"chat|data|followup","intent":"query|compare|abnormal|trend|summary","confidence":0-1,"reason":"简短理由","chatReply":"仅 chat 时填，自然语言回复"}`

  const user = `用户输入：${query}
${lastCtx?.isFollowup ? `（系统已识别为追问，但请你独立再判断一次）` : ''}
${lastCtx?.lastSql ? `上一轮 SQL：${lastCtx.lastSql.slice(0, 200)}` : ''}

请输出 JSON。`

  return callJSON(model, sys, user, {
    phase: 'data',
    intent: 'query',
    confidence: 0.5,
    reason: 'LLM 解析失败，默认走数据分析流程'
  })
}

// ========== 2. Query 改写 ==========
// 若是追问，基于 originalQuery + lastSql 生成独立完整的新问题；否则原样返回
export async function callQueryRewrite(
  model: ModelConfig,
  query: string,
  followupCtx: FollowupContext
): Promise<string> {
  if (!followupCtx.isFollowup) return query

  const sys = `你是一个 query 改写模块。用户当前输入是上一轮分析的追问，缺少独立上下文。请基于「上一轮原始问题」+「上一轮 SQL」+「当前追问输入」，改写成一个语义完整、可独立执行的新问题。
规则：
1. 保留用户追问的意图（换维度/换时间/换指标/细化）
2. 把代词（它/这个/上面）替换为上一轮的具体主体
3. 输出纯文本，不要解释。`

  const user = `上一轮原始问题：${followupCtx.originalQuery || '（无）'}
上一轮 SQL：${followupCtx.lastSql || '（无）'}
当前追问：${query}

改写后的完整问题：`

  try {
    const full = await streamChat(model, [
      { role: 'system', content: sys },
      { role: 'user', content: user }
    ])
    return full.trim() || query
  } catch (err) {
    console.error('[chatbi] callQueryRewrite failed:', err)
    return query
  }
}

// ========== 3. 意图澄清 ==========
// 结合检索到的知识库信息，判断是否缺维度/时间/区域；不清晰时给出引导问题
export async function callClarifyIntent(
  model: ModelConfig,
  rewrittenQuery: string,
  retrieved: RetrievedContext
): Promise<ClarifyQuestion> {
  const sys = `你是一个意图澄清模块。基于用户问题与知识库检索结果，判断意图是否清晰。
判定为不清晰的条件（任一满足即不清晰）：
1. 缺时间范围（如「营收多少」未指定月份/季度/区间）
2. 缺关键维度（如「分析一下」「看看」过于宽泛）
3. 缺分析对象（如未指明区域/产品/品类）

输出 JSON：{"clear":true|false,"question":"不清晰时的引导问题，一句话","missingDims":["缺失的维度名"],"suggestions":["可补充的候选，3-5 个"]}`
  const user = `改写后问题：${rewrittenQuery}

${buildKBContext(retrieved)}

请判断意图是否清晰并输出 JSON。`

  return callJSON(model, sys, user, {
    clear: true
  })
}

// ========== 4. SQL 生成 + 数据 + 图表 ==========
// LLM 一次性产出 NL2SQL + 合成 dataset + echarts option + 分析思路
export async function callGenerateSQL(
  model: ModelConfig,
  rewrittenQuery: string,
  retrieved: RetrievedContext
): Promise<{ sql: string; analysisPath: AnalysisPath; dataset: Dataset; chartConfig: ChartConfig }> {
  const sys = `你是一个 NL2SQL 与数据生成模块。基于用户问题与知识库信息，一次性产出：
1. sql：标准 ANSI SQL，含时间筛选、维度分组、指标聚合
2. dataset：SQL 执行后「应该返回」的合成数据（columns 含 field/label/align/formatter；rows 为合理数值；total 可选）
   - formatter 取值：currency/percent/number/text
   - 数值要符合业务直觉（如华南区营收通常高于西北区）
3. chartConfig：echarts option（含 title/tooltip/legend/xAxis/yAxis/series），type 取 line/bar/pie/table/radar
4. analysisPath：默认分析思路，name 为「维度归因/趋势外推/对比差异/结构占比」之一，dimensions 为该思路关注的维度列表

输出 JSON：
{"sql":"...","analysisPath":{"name":"...","dimensions":[...]},"dataset":{"columns":[...],"rows":[...],"total":12345},"chartConfig":{"type":"bar","title":"...","option":{...}}}`

  const user = `用户问题：${rewrittenQuery}

${buildKBContext(retrieved)}

请输出 JSON。dataset.rows 给 4-8 行合理的合成数据，不要真实业务数据。`

  const fallback: { sql: string; analysisPath: AnalysisPath; dataset: Dataset; chartConfig: ChartConfig } = {
    sql: '-- LLM 生成失败，请检查模型配置',
    analysisPath: { name: '维度归因', dimensions: ['区域'] },
    dataset: { columns: [{ field: 'info', label: '提示', formatter: 'text' }], rows: [{ info: '未能生成数据，请重试或更换问题' }] },
    chartConfig: { type: 'table', title: '暂无图表', option: {} }
  }

  const result = await callJSON(model, sys, user, fallback)
  return {
    sql: result.sql || fallback.sql,
    analysisPath: result.analysisPath || fallback.analysisPath,
    dataset: result.dataset || fallback.dataset,
    chartConfig: result.chartConfig || fallback.chartConfig
  }
}

// ========== 5. 归因分析 ==========
// 基于 dataset 与 analysisPath.dimensions 做归因，产出 overviews/attributions/suggestions/risks
export async function callAttribution(
  model: ModelConfig,
  dataset: Dataset,
  analysisPath: AnalysisPath
): Promise<InsightReport> {
  const sys = `你是一个数据归因分析模块。基于查询结果与归因维度，输出结构化洞察报告。
输出 JSON：
{
  "overviews":[{"label":"指标名","value":"数值+单位","yoy":"+12.3%","mom":"+4.5%","target":"达成102%","trend":"up|down|flat"}],
  "attributions":[{"dimension":"维度","problem":"问题描述","impact":"影响金额或幅度","evidence":"数据证据"}],
  "suggestions":[{"type":"short_term|long_term","title":"建议标题","detail":"具体建议","expectedEffect":"预期效果"}],
  "risks":["风险点1","风险点2"]
}
要求：
1. overviews 3-4 项核心指标
2. attributions 2-3 条，每条对应一个归因维度
3. suggestions 2-3 条，short_term 与 long_term 至少各 1 条
4. risks 2-3 条
5. 内容要结合 dataset 的真实数值，不要泛泛而谈`

  const rowsPreview = dataset.rows.slice(0, 8).map(r => JSON.stringify(r)).join('\n')
  const user = `归因维度：${analysisPath.dimensions.join('、')}（分析思路：${analysisPath.name}）

数据列：${dataset.columns.map(c => c.label).join('、')}

数据行（最多 8 行）：
${rowsPreview || '（无数据）'}

${dataset.total ? `合计：${dataset.total}` : ''}

请输出 JSON 归因报告。`

  const fallback: InsightReport = {
    overviews: [{ label: '提示', value: '归因生成失败', trend: 'flat' }],
    attributions: [],
    suggestions: [],
    risks: ['LLM 归因失败，请重试']
  }

  const result = await callJSON(model, sys, user, fallback)
  return {
    overviews: result.overviews || fallback.overviews,
    attributions: result.attributions || [],
    suggestions: result.suggestions || [],
    risks: result.risks || []
  }
}
