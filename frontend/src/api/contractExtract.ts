import type { ModelConfig } from '../types/agent'
import type { ExtractedField } from '../types/contract'
import { streamChat } from './llm'

interface ExtractOptions {
  model: ModelConfig
  prompt: string
  rawText: string
  imageUrl?: string
  signal?: AbortSignal
}

function parseFields(json: string): ExtractedField[] {
  try {
    const cleaned = json.replace(/```json\s*|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (Array.isArray(parsed.fields)) return parsed.fields
    if (Array.isArray(parsed)) return parsed
    return []
  } catch {
    const m = json.match(/\{[\s\S]*"fields"[\s\S]*\}/)
    if (m) {
      try { return JSON.parse(m[0]).fields || [] } catch { /* */ }
    }
    return []
  }
}

export async function extractContractFields(opts: ExtractOptions): Promise<ExtractedField[]> {
  const messages: { role: 'system' | 'user'; content: any }[] = [
    { role: 'system', content: opts.prompt }
  ]

  if (opts.imageUrl) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: '请从以下合同图片中抽取结构化字段：' },
        { type: 'image_url', image_url: { url: opts.imageUrl } }
      ]
    })
  } else {
    messages.push({
      role: 'user',
      content: `请从以下合同文本中抽取结构化字段：\n\n${opts.rawText}`
    })
  }

  const fullResponse = await streamChat(opts.model as any, messages, {
    signal: opts.signal
  })

  return parseFields(fullResponse)
}
