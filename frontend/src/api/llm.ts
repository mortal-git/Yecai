import type { ModelConfig, Message } from '../types/agent'
import { decryptKey } from '../utils/crypto'

export interface ChatOptions {
  onDelta?: (text: string) => void
  signal?: AbortSignal
}

function buildURL(baseURL: string): string {
  const trimmed = baseURL.replace(/\/+$/, '')
  if (/\/chat\/completions$/.test(trimmed)) return trimmed
  if (/\/v1$/.test(trimmed)) return trimmed + '/chat/completions'
  return trimmed + '/v1/chat/completions'
}

export async function streamChat(
  model: ModelConfig,
  messages: Pick<Message, 'role' | 'content'>[],
  options: ChatOptions = {}
): Promise<string> {
  const url = buildURL(model.baseURL)
  const apiKey = decryptKey(model.apiKeyCipher)
  const body = {
    model: model.modelName,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    temperature: model.params.temperature,
    max_tokens: model.params.maxTokens,
    top_p: model.params.topP,
    stream: true
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body),
    signal: options.signal
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${errText.slice(0, 300)}`)
  }
  if (!res.body) throw new Error('响应没有 body 流')

  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let full = ''
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n\n')
    buffer = parts.pop() || ''
    for (const part of parts) {
      const line = part.trim()
      if (!line.startsWith('data:')) continue
      const data = line.slice(5).trim()
      if (data === '[DONE]') continue
      try {
        const json = JSON.parse(data)
        const delta = json?.choices?.[0]?.delta?.content
        if (typeof delta === 'string' && delta) {
          full += delta
          options.onDelta?.(delta)
        }
      } catch {
        // 忽略不能解析的片段（部分供应商心跳/keep-alive）
      }
    }
  }
  return full
}

export async function verifyModel(model: ModelConfig): Promise<boolean> {
  try {
    const url = buildURL(model.baseURL)
    const apiKey = decryptKey(model.apiKeyCipher)
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model.modelName,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
        stream: false
      })
    })
    return res.ok
  } catch {
    return false
  }
}
