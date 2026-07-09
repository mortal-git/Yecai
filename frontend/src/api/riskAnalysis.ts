import type { ModelConfig } from '../types/agent'
import type { RiskItem } from '../types/contract'
import { RISK_ANALYSIS_PROMPT } from '../types/contract'
import { streamChat } from './llm'

function parseRisks(json: string): RiskItem[] {
  try {
    const cleaned = json.replace(/```json\s*|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    const items = Array.isArray(parsed.risks) ? parsed.risks : Array.isArray(parsed) ? parsed : []
    return items.map((r: any, i: number) => ({
      id: 'risk_' + i,
      clause: r.clause || '',
      riskLevel: ['高', '中', '低'].includes(r.riskLevel) ? r.riskLevel : '中',
      description: r.description || '',
      suggestion: r.suggestion || ''
    }))
  } catch {
    return []
  }
}

export async function analyzeContractRisks(
  model: ModelConfig,
  rawText: string,
  signal?: AbortSignal
): Promise<RiskItem[]> {
  const messages = [
    { role: 'system' as const, content: RISK_ANALYSIS_PROMPT },
    { role: 'user' as const, content: `请分析以下合同文本中的风险：\n\n${rawText}` }
  ]
  const fullResponse = await streamChat(model, messages, { signal })
  return parseRisks(fullResponse)
}
