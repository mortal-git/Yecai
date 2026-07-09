import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { ModelConfig, ModelCategory } from '../types/agent'
import { encryptKey } from '../utils/crypto'
import { verifyModel as apiVerify } from '../api/llm'

const STORAGE_KEY = 'agent.models.v1'
const ACTIVE_KEY = 'agent.activeModelId.v1'

function uid(): string {
  return 'm_' + Math.random().toString(36).slice(2, 10)
}

function loadModels(): ModelConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function loadActiveId(): string {
  return localStorage.getItem(ACTIVE_KEY) || ''
}

export const useAgentModelStore = defineStore('agentModel', () => {
  const models = ref<ModelConfig[]>(loadModels())
  const activeId = ref<string>(loadActiveId())

  if (!activeId.value) {
    const def = models.value.find(m => m.isDefault)
    if (def) activeId.value = def.id
    else if (models.value.length) activeId.value = models.value[0].id
  }

  watch(models, val => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, { deep: true })

  watch(activeId, val => {
    localStorage.setItem(ACTIVE_KEY, val)
  })

  const activeModel = computed(() => models.value.find(m => m.id === activeId.value) || null)

  const groupedModels = computed(() => {
    const groups: Record<ModelCategory, ModelConfig[]> = { 通用: [], 代码: [], 行业: [] }
    models.value.forEach(m => {
      groups[m.category]?.push(m)
    })
    return groups
  })

  function addModel(input: Omit<ModelConfig, 'id' | 'apiKeyCipher' | 'status'> & { apiKey: string }): ModelConfig {
    const m: ModelConfig = {
      id: uid(),
      name: input.name,
      baseURL: input.baseURL,
      apiKeyCipher: encryptKey(input.apiKey),
      modelName: input.modelName,
      category: input.category,
      isDefault: input.isDefault,
      params: input.params,
      status: 'unknown',
      dailyLimit: input.dailyLimit,
      callCount: 0,
      callDate: ''
    }
    if (m.isDefault) {
      models.value.forEach(x => (x.isDefault = false))
    }
    models.value.push(m)
    if (!activeId.value) activeId.value = m.id
    return m
  }

  function updateModel(id: string, patch: Partial<Omit<ModelConfig, 'id'>> & { apiKey?: string }) {
    const m = models.value.find(x => x.id === id)
    if (!m) return
    if (patch.apiKey !== undefined && patch.apiKey !== '') {
      m.apiKeyCipher = encryptKey(patch.apiKey)
      m.status = 'unknown'
    }
    if (patch.isDefault) {
      models.value.forEach(x => (x.isDefault = x.id === id))
    }
    Object.assign(m, {
      name: patch.name ?? m.name,
      baseURL: patch.baseURL ?? m.baseURL,
      modelName: patch.modelName ?? m.modelName,
      category: patch.category ?? m.category,
      isDefault: patch.isDefault ?? m.isDefault,
      params: patch.params ?? m.params,
      dailyLimit: patch.dailyLimit ?? m.dailyLimit
    })
  }

  function removeModel(id: string) {
    const idx = models.value.findIndex(m => m.id === id)
    if (idx === -1) return
    models.value.splice(idx, 1)
    if (activeId.value === id) {
      const def = models.value.find(m => m.isDefault)
      activeId.value = def ? def.id : (models.value[0]?.id || '')
    }
  }

  function setActive(id: string) {
    if (models.value.some(m => m.id === id)) activeId.value = id
  }

  function setDefault(id: string) {
    models.value.forEach(m => (m.isDefault = m.id === id))
  }

  async function verifyModel(id: string): Promise<boolean> {
    const m = models.value.find(x => x.id === id)
    if (!m) return false
    const ok = await apiVerify(m)
    m.status = ok ? 'ok' : 'invalid'
    return ok
  }

  function recordCall(id: string): { allowed: boolean; reason?: string } {
    const m = models.value.find(x => x.id === id)
    if (!m) return { allowed: false, reason: '模型不存在' }
    const today = new Date().toISOString().slice(0, 10)
    if (m.callDate !== today) {
      m.callDate = today
      m.callCount = 0
    }
    if (m.dailyLimit && (m.callCount || 0) >= m.dailyLimit) {
      return { allowed: false, reason: `已达每日调用上限 ${m.dailyLimit} 次` }
    }
    m.callCount = (m.callCount || 0) + 1
    return { allowed: true }
  }

  return {
    models,
    activeId,
    activeModel,
    groupedModels,
    addModel,
    updateModel,
    removeModel,
    setActive,
    setDefault,
    verifyModel,
    recordCall
  }
})
