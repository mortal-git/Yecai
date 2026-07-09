import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  Contract, ContractTemplate, ExtractPrompt, ExtractedField,
  RiskItem, ApprovalStep, SignRecord, ObligationMilestone, ContractVersion
} from '../types/contract'
import { DEFAULT_EXTRACT_PROMPT, DEFAULT_TEMPLATES } from '../types/contract'

const CONTRACTS_KEY = 'contract.list.v2'
const PROMPTS_KEY = 'contract.prompts.v1'
const TEMPLATES_KEY = 'contract.templates.v1'

function uid(prefix = ''): string {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

function loadContracts(): Contract[] { try { const r = localStorage.getItem(CONTRACTS_KEY); return r ? JSON.parse(r) : [] } catch { return [] } }
function loadPrompts(): ExtractPrompt[] { try { const r = localStorage.getItem(PROMPTS_KEY); if (r) { const d = JSON.parse(r); if (Array.isArray(d) && d.length) return d } } catch {} return [DEFAULT_EXTRACT_PROMPT] }
function loadTemplates(): ContractTemplate[] { try { const r = localStorage.getItem(TEMPLATES_KEY); if (r) { const d = JSON.parse(r); if (Array.isArray(d) && d.length) return d } } catch {} return DEFAULT_TEMPLATES }

export const useContractStore = defineStore('contract', () => {
  const contracts = ref<Contract[]>(loadContracts())
  const prompts = ref<ExtractPrompt[]>(loadPrompts())
  const templates = ref<ContractTemplate[]>(loadTemplates())
  const extracting = ref(false)
  const analyzingRisk = ref(false)
  let abortCtrl: AbortController | null = null

  watch(contracts, v => localStorage.setItem(CONTRACTS_KEY, JSON.stringify(v)), { deep: true })
  watch(prompts, v => localStorage.setItem(PROMPTS_KEY, JSON.stringify(v)), { deep: true })
  watch(templates, v => localStorage.setItem(TEMPLATES_KEY, JSON.stringify(v)), { deep: true })

  const sortedContracts = computed(() => [...contracts.value].sort((a, b) => b.createdAt - a.createdAt))
  const statsByStatus = computed(() => {
    const s: Record<string, number> = {}
    contracts.value.forEach(c => { s[c.status] = (s[c.status] || 0) + 1 })
    return s
  })

  function getContract(id: string): Contract | undefined { return contracts.value.find(c => c.id === id) }

  function addContract(input: Partial<Contract> & { title: string }): Contract {
    const c: Contract = {
      id: uid('ct_'),
      title: input.title,
      category: input.category || '其他',
      fileName: input.fileName || '',
      fileType: input.fileType || 'draft',
      fileSize: input.fileSize || 0,
      fileDataUrl: input.fileDataUrl || '',
      rawText: input.rawText || '',
      status: input.status || '草稿',
      modelId: input.modelId || '',
      promptId: input.promptId || '',
      extractedFields: input.extractedFields || [],
      riskItems: input.riskItems || [],
      approvals: input.approvals || [],
      signRecords: input.signRecords || [],
      obligations: input.obligations || [],
      versions: input.versions || [],
      templateId: input.templateId || '',
      startDate: input.startDate,
      endDate: input.endDate,
      amount: input.amount,
      partyA: input.partyA,
      partyB: input.partyB,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    contracts.value.push(c)
    return c
  }

  function updateContract(id: string, patch: Partial<Contract>) {
    const c = contracts.value.find(x => x.id === id)
    if (!c) return
    Object.assign(c, patch, { updatedAt: Date.now() })
  }

  function deleteContract(id: string) {
    const idx = contracts.value.findIndex(c => c.id === id)
    if (idx >= 0) contracts.value.splice(idx, 1)
  }

  function setExtractedFields(id: string, fields: ExtractedField[]) {
    const c = contracts.value.find(x => x.id === id)
    if (!c) return
    c.extractedFields = fields
    c.updatedAt = Date.now()
    // auto-populate top-level fields from extraction
    const find = (key: string) => fields.find(f => f.key === key)?.value
    if (find('party_a')) c.partyA = find('party_a')
    if (find('party_b')) c.partyB = find('party_b')
    if (find('amount')) c.amount = find('amount')
  }

  function updateField(contractId: string, fieldKey: string, value: string) {
    const c = contracts.value.find(x => x.id === contractId)
    if (!c) return
    const f = c.extractedFields.find(x => x.key === fieldKey)
    if (f) { f.value = value; c.updatedAt = Date.now() }
  }

  function setRiskItems(id: string, items: RiskItem[]) {
    const c = contracts.value.find(x => x.id === id)
    if (c) { c.riskItems = items; c.updatedAt = Date.now() }
  }

  function changeStatus(id: string, status: Contract['status']) {
    const c = contracts.value.find(x => x.id === id)
    if (c) { c.status = status; c.updatedAt = Date.now() }
  }

  function submitForApproval(id: string) {
    const c = contracts.value.find(x => x.id === id)
    if (!c) return
    c.status = '审批中'
    c.approvals = [
      { id: uid('ap_'), title: '部门经理审批', assignee: '部门经理', status: 'pending' },
      { id: uid('ap_'), title: '法务审核', assignee: '法务专员', status: 'pending' },
      { id: uid('ap_'), title: '总经理审批', assignee: '总经理', status: 'pending' }
    ]
    c.updatedAt = Date.now()
  }

  function approveStep(id: string, stepId: string, approved: boolean, comment?: string) {
    const c = contracts.value.find(x => x.id === id)
    if (!c) return
    const step = c.approvals.find(s => s.id === stepId)
    if (!step) return
    step.status = approved ? 'approved' : 'rejected'
    step.comment = comment
    step.timestamp = Date.now()
    if (!approved) { c.status = '草稿'; c.updatedAt = Date.now(); return }
    const pending = c.approvals.find(s => s.status === 'pending')
    if (!pending) c.status = '待签署'
    c.updatedAt = Date.now()
  }

  function addSignRecord(id: string, record: Omit<SignRecord, 'id'>) {
    const c = contracts.value.find(x => x.id === id)
    if (!c) return
    const existing = c.signRecords.find(s => s.partyName === record.partyName)
    if (existing) {
      Object.assign(existing, record)
    } else {
      c.signRecords.push({ id: uid('sg_'), ...record })
    }
    c.updatedAt = Date.now()
  }

  function checkAllSigned(id: string) {
    const c = contracts.value.find(x => x.id === id)
    if (!c || c.signRecords.length < 2) return false
    return c.signRecords.every(s => s.signedAt)
  }

  function addObligation(id: string, ob: Omit<ObligationMilestone, 'id'>) {
    const c = contracts.value.find(x => x.id === id)
    if (c) { c.obligations.push({ id: uid('ob_'), ...ob }); c.updatedAt = Date.now() }
  }

  function toggleObligation(id: string, obId: string) {
    const c = contracts.value.find(x => x.id === id)
    if (!c) return
    const ob = c.obligations.find(o => o.id === obId)
    if (ob) { ob.completed = !ob.completed; ob.completedAt = ob.completed ? Date.now() : undefined; c.updatedAt = Date.now() }
  }

  function saveVersion(id: string, description = '') {
    const c = contracts.value.find(x => x.id === id)
    if (!c) return
    c.versions.push({
      id: uid('v_'),
      version: c.versions.length + 1,
      rawText: c.rawText,
      createdAt: Date.now(),
      description
    })
    c.updatedAt = Date.now()
  }

  function abortExtraction() { if (abortCtrl) { abortCtrl.abort(); abortCtrl = null }; extracting.value = false; analyzingRisk.value = false }

  // Template management
  function addTemplate(input: Omit<ContractTemplate, 'id' | 'createdAt'>): ContractTemplate {
    const t: ContractTemplate = { id: uid('tp_'), ...input, createdAt: Date.now() }
    templates.value.push(t)
    return t
  }
  function removeTemplate(id: string) {
    const idx = templates.value.findIndex(t => t.id === id)
    if (idx >= 0) templates.value.splice(idx, 1)
  }

  // Prompt management
  function addPrompt(input: Omit<ExtractPrompt, 'id'>): ExtractPrompt {
    const p: ExtractPrompt = { id: uid('ep_'), ...input }
    prompts.value.push(p)
    return p
  }
  function updatePrompt(id: string, patch: Partial<ExtractPrompt>) {
    const p = prompts.value.find(x => x.id === id)
    if (p) Object.assign(p, patch)
  }
  function removePrompt(id: string) {
    if (id === DEFAULT_EXTRACT_PROMPT.id) return
    const idx = prompts.value.findIndex(p => p.id === id)
    if (idx >= 0) prompts.value.splice(idx, 1)
  }

  return {
    contracts, prompts, templates, extracting, analyzingRisk,
    sortedContracts, statsByStatus,
    getContract, addContract, updateContract, deleteContract,
    setExtractedFields, updateField, setRiskItems, changeStatus,
    submitForApproval, approveStep,
    addSignRecord, checkAllSigned,
    addObligation, toggleObligation,
    saveVersion, abortExtraction,
    addTemplate, removeTemplate,
    addPrompt, updatePrompt, removePrompt
  }
})
