import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useReceivableStatementStore } from './receivableStatement'

export type InvoiceApplyStatus = 'pending' | 'invoiced' | 'cancelled'

export interface InvoiceApplyOrder {
  id: string
  applyNo: string
  statementId: string
  statementNo: string
  customer: string
  settlementUnit: string
  statementTotalIncTax: number
  appliedBeforeAmount: number
  applyAmount: number
  taxRate: number
  taxAmount: number
  incTaxAmount: number
  remainingAmount: number
  invoiceType: string
  expectedInvoiceDate: string
  status: InvoiceApplyStatus
  remark?: string
  applicant: string
  applyDate: string
  createTime: string
}

export const APPLY_STATUS_LABEL: Record<InvoiceApplyStatus, string> = {
  pending: '待开票',
  invoiced: '已开票',
  cancelled: '已作废'
}

export const APPLY_STATUS_TYPE: Record<InvoiceApplyStatus, string> = {
  pending: 'warning',
  invoiced: 'success',
  cancelled: 'info'
}

export const INVOICE_TYPE_OPTIONS = [
  { value: '增值税专用发票', label: '增值税专用发票' },
  { value: '增值税普通发票', label: '增值税普通发票' },
  { value: '电子发票', label: '电子发票' }
]

export const APPLY_TAX_RATE_OPTIONS = [
  { value: 13, label: '13%' },
  { value: 9, label: '9%' },
  { value: 6, label: '6%' },
  { value: 3, label: '3%' },
  { value: 0, label: '0%' }
]

function uid(prefix = ''): string {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

function now(): string {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export const useInvoiceApplyStore = defineStore('invoiceApply', () => {
  const receivableStore = useReceivableStatementStore()

  function buildMockList(): InvoiceApplyOrder[] {
    const findByNo = (no: string) => receivableStore.list.find(s => s.statementNo === no)
    const s1 = findByNo('RS2026070003')
    const s2 = findByNo('RS2026070002')

    const result: InvoiceApplyOrder[] = []

    if (s1) {
      result.push({
        id: uid('ia_'),
        applyNo: 'IA2026070001',
        statementId: s1.id,
        statementNo: s1.statementNo,
        customer: s1.customer,
        settlementUnit: s1.settlementUnit,
        statementTotalIncTax: s1.totalIncTaxCny,
        appliedBeforeAmount: 0,
        applyAmount: Number((s1.totalIncTaxCny / 1.13).toFixed(2)),
        taxRate: 13,
        taxAmount: Number((s1.totalIncTaxCny - s1.totalIncTaxCny / 1.13).toFixed(2)),
        incTaxAmount: s1.totalIncTaxCny,
        remainingAmount: 0,
        invoiceType: '增值税专用发票',
        expectedInvoiceDate: '2026-07-12',
        status: 'pending',
        remark: '首期开票',
        applicant: '王五',
        applyDate: '2026-07-08',
        createTime: '2026-07-08 10:00:00'
      })
    }

    if (s2) {
      const firstAmount = 50000
      const secondAmount = Number((s2.totalIncTaxCny - firstAmount).toFixed(2))
      result.push({
        id: uid('ia_'),
        applyNo: 'IA2026070002',
        statementId: s2.id,
        statementNo: s2.statementNo,
        customer: s2.customer,
        settlementUnit: s2.settlementUnit,
        statementTotalIncTax: s2.totalIncTaxCny,
        appliedBeforeAmount: 0,
        applyAmount: Number((firstAmount / 1.13).toFixed(2)),
        taxRate: 13,
        taxAmount: Number((firstAmount - firstAmount / 1.13).toFixed(2)),
        incTaxAmount: firstAmount,
        remainingAmount: secondAmount,
        invoiceType: '增值税专用发票',
        expectedInvoiceDate: '2026-07-15',
        status: 'invoiced',
        remark: '部分开票',
        applicant: '李四',
        applyDate: '2026-07-10',
        createTime: '2026-07-10 14:30:00'
      })
      result.push({
        id: uid('ia_'),
        applyNo: 'IA2026070003',
        statementId: s2.id,
        statementNo: s2.statementNo,
        customer: s2.customer,
        settlementUnit: s2.settlementUnit,
        statementTotalIncTax: s2.totalIncTaxCny,
        appliedBeforeAmount: firstAmount,
        applyAmount: Number((secondAmount / 1.13).toFixed(2)),
        taxRate: 13,
        taxAmount: Number((secondAmount - secondAmount / 1.13).toFixed(2)),
        incTaxAmount: secondAmount,
        remainingAmount: 0,
        invoiceType: '增值税专用发票',
        expectedInvoiceDate: '2026-07-20',
        status: 'pending',
        remark: '剩余金额开票',
        applicant: '李四',
        applyDate: '2026-07-12',
        createTime: '2026-07-12 09:15:00'
      })
    }

    return result
  }

  const list = ref<InvoiceApplyOrder[]>(buildMockList())

  const statistics = computed(() => {
    const s = list.value
    return {
      total: s.length,
      pending: s.filter(i => i.status === 'pending').length,
      invoiced: s.filter(i => i.status === 'invoiced').length,
      cancelled: s.filter(i => i.status === 'cancelled').length,
      totalApplyAmount: s.filter(i => i.status !== 'cancelled').reduce((sum, i) => sum + i.incTaxAmount, 0),
      pendingAmount: s.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.incTaxAmount, 0)
    }
  })

  function genApplyNo(): string {
    const seq = String(list.value.length + 1).padStart(4, '0')
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    return `IA${dateStr}${seq}`
  }

  function getAppliedAmountByStatement(statementId: string, excludeId?: string): number {
    return list.value
      .filter(i => i.statementId === statementId && i.status !== 'cancelled' && i.id !== excludeId)
      .reduce((sum, i) => sum + i.incTaxAmount, 0)
  }

  function getAvailableStatements() {
    return receivableStore.list.filter(s => s.status === 'approved' || s.status === 'invoiced' || s.status === 'collected')
  }

  function addApply(data: Omit<InvoiceApplyOrder, 'id' | 'applyNo' | 'appliedBeforeAmount' | 'remainingAmount' | 'applicant' | 'applyDate' | 'createTime'>): InvoiceApplyOrder {
    const appliedBeforeAmount = getAppliedAmountByStatement(data.statementId)
    const remainingAmount = Math.max(0, data.statementTotalIncTax - appliedBeforeAmount - data.incTaxAmount)
    const nowStr = now()
    const item: InvoiceApplyOrder = {
      ...data,
      id: uid('ia_'),
      applyNo: genApplyNo(),
      appliedBeforeAmount,
      remainingAmount,
      applicant: '当前用户',
      applyDate: today(),
      createTime: nowStr
    }
    list.value.unshift(item)
    return item
  }

  function updateStatus(id: string, status: InvoiceApplyStatus, action?: string, remark?: string) {
    const item = list.value.find(i => i.id === id)
    if (!item) return
    item.status = status
    void action
    void remark
  }

  function deleteApply(id: string) {
    list.value = list.value.filter(i => i.id !== id)
  }

  function getById(id: string): InvoiceApplyOrder | undefined {
    return list.value.find(i => i.id === id)
  }

  return {
    list,
    statistics,
    genApplyNo,
    getAppliedAmountByStatement,
    getAvailableStatements,
    addApply,
    updateStatus,
    deleteApply,
    getById
  }
})
