import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePayableStatementStore } from './payableStatement'

export type PaymentApplyStatus = 'pending' | 'paid' | 'cancelled'

export interface PaymentApplyOrder {
  id: string
  applyNo: string
  statementId: string
  statementNo: string
  supplier: string
  settlementUnit: string
  settlementBank: string
  settlementAccount: string
  statementTotalIncTax: number
  appliedBeforeAmount: number
  applyAmount: number
  remainingAmount: number
  paymentMethod: string
  bankAccount: string
  expectedPaymentDate: string
  status: PaymentApplyStatus
  remark?: string
  applicant: string
  applyDate: string
  createTime: string
}

export const APPLY_STATUS_LABEL: Record<PaymentApplyStatus, string> = {
  pending: '待付款',
  paid: '已付款',
  cancelled: '已作废'
}

export const APPLY_STATUS_TYPE: Record<PaymentApplyStatus, string> = {
  pending: 'warning',
  paid: 'success',
  cancelled: 'info'
}

export const PAYMENT_METHOD_OPTIONS = [
  { value: '银行转账', label: '银行转账' },
  { value: '承兑汇票', label: '承兑汇票' },
  { value: '商业汇票', label: '商业汇票' },
  { value: '现金', label: '现金' },
  { value: '其他', label: '其他' }
]

export const BANK_ACCOUNT_OPTIONS = [
  { value: '基本户-中国银行 6222021234567890123', label: '基本户-中国银行 6222021234567890123' },
  { value: '一般户-工商银行 6225001234567890123', label: '一般户-工商银行 6225001234567890123' },
  { value: '一般户-建设银行 6217001234567890123', label: '一般户-建设银行 6217001234567890123' },
  { value: '一般户-招商银行 6225881234567890123', label: '一般户-招商银行 6225881234567890123' }
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

export const usePaymentApplyStore = defineStore('paymentApply', () => {
  const payableStore = usePayableStatementStore()

  function buildMockList(): PaymentApplyOrder[] {
    const findByNo = (no: string) => payableStore.list.find(s => s.statementNo === no)
    const s1 = findByNo('PS2026070001')
    const s2 = findByNo('PS2026070002')
    const s3 = findByNo('PS2026070003')

    const result: PaymentApplyOrder[] = []

    if (s1) {
      result.push({
        id: uid('pa_'),
        applyNo: 'PA2026070001',
        statementId: s1.id,
        statementNo: s1.statementNo,
        supplier: s1.supplier,
        settlementUnit: s1.settlementUnit,
        settlementBank: s1.settlementBank,
        settlementAccount: s1.settlementAccount,
        statementTotalIncTax: s1.totalIncTaxCny,
        appliedBeforeAmount: 0,
        applyAmount: s1.totalIncTaxCny,
        remainingAmount: 0,
        paymentMethod: '银行转账',
        bankAccount: '基本户-中国银行 6222021234567890123',
        expectedPaymentDate: '2026-07-10',
        status: 'paid',
        remark: '全额付款',
        applicant: '张三',
        applyDate: '2026-07-08',
        createTime: '2026-07-08 10:00:00'
      })
    }

    if (s2) {
      const firstAmount = 50000
      const secondAmount = Number((s2.totalIncTaxCny - firstAmount).toFixed(2))
      result.push({
        id: uid('pa_'),
        applyNo: 'PA2026070002',
        statementId: s2.id,
        statementNo: s2.statementNo,
        supplier: s2.supplier,
        settlementUnit: s2.settlementUnit,
        settlementBank: s2.settlementBank,
        settlementAccount: s2.settlementAccount,
        statementTotalIncTax: s2.totalIncTaxCny,
        appliedBeforeAmount: 0,
        applyAmount: firstAmount,
        remainingAmount: secondAmount,
        paymentMethod: '银行转账',
        bankAccount: '一般户-工商银行 6225001234567890123',
        expectedPaymentDate: '2026-07-15',
        status: 'pending',
        remark: '部分付款申请',
        applicant: '李四',
        applyDate: '2026-07-10',
        createTime: '2026-07-10 14:30:00'
      })
      result.push({
        id: uid('pa_'),
        applyNo: 'PA2026070003',
        statementId: s2.id,
        statementNo: s2.statementNo,
        supplier: s2.supplier,
        settlementUnit: s2.settlementUnit,
        settlementBank: s2.settlementBank,
        settlementAccount: s2.settlementAccount,
        statementTotalIncTax: s2.totalIncTaxCny,
        appliedBeforeAmount: firstAmount,
        applyAmount: secondAmount,
        remainingAmount: 0,
        paymentMethod: '银行转账',
        bankAccount: '一般户-工商银行 6225001234567890123',
        expectedPaymentDate: '2026-07-22',
        status: 'pending',
        remark: '剩余金额付款申请',
        applicant: '李四',
        applyDate: '2026-07-12',
        createTime: '2026-07-12 09:15:00'
      })
    }

    if (s3) {
      result.push({
        id: uid('pa_'),
        applyNo: 'PA2026070004',
        statementId: s3.id,
        statementNo: s3.statementNo,
        supplier: s3.supplier,
        settlementUnit: s3.settlementUnit,
        settlementBank: s3.settlementBank,
        settlementAccount: s3.settlementAccount,
        statementTotalIncTax: s3.totalIncTaxCny,
        appliedBeforeAmount: 0,
        applyAmount: s3.totalIncTaxCny,
        remainingAmount: 0,
        paymentMethod: '承兑汇票',
        bankAccount: '一般户-建设银行 6217001234567890123',
        expectedPaymentDate: '2026-07-18',
        status: 'pending',
        remark: '首期付款申请',
        applicant: '王五',
        applyDate: '2026-07-11',
        createTime: '2026-07-11 10:00:00'
      })
    }

    return result
  }

  const list = ref<PaymentApplyOrder[]>(buildMockList())

  const statistics = computed(() => {
    const s = list.value
    return {
      total: s.length,
      pending: s.filter(i => i.status === 'pending').length,
      paid: s.filter(i => i.status === 'paid').length,
      cancelled: s.filter(i => i.status === 'cancelled').length,
      totalApplyAmount: s.filter(i => i.status !== 'cancelled').reduce((sum, i) => sum + i.applyAmount, 0),
      pendingAmount: s.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.applyAmount, 0)
    }
  })

  function genApplyNo(): string {
    const seq = String(list.value.length + 1).padStart(4, '0')
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    return `PA${dateStr}${seq}`
  }

  function getAppliedAmountByStatement(statementId: string, excludeId?: string): number {
    return list.value
      .filter(i => i.statementId === statementId && i.status !== 'cancelled' && i.id !== excludeId)
      .reduce((sum, i) => sum + i.applyAmount, 0)
  }

  function getAvailableStatements() {
    return payableStore.list.filter(s => s.status === 'pending_payment' || s.status === 'paid')
  }

  function addApply(data: Omit<PaymentApplyOrder, 'id' | 'applyNo' | 'appliedBeforeAmount' | 'remainingAmount' | 'applicant' | 'applyDate' | 'createTime'>): PaymentApplyOrder {
    const appliedBeforeAmount = getAppliedAmountByStatement(data.statementId)
    const remainingAmount = Math.max(0, data.statementTotalIncTax - appliedBeforeAmount - data.applyAmount)
    const nowStr = now()
    const item: PaymentApplyOrder = {
      ...data,
      id: uid('pa_'),
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

  function updateStatus(id: string, status: PaymentApplyStatus) {
    const item = list.value.find(i => i.id === id)
    if (!item) return
    item.status = status
  }

  function deleteApply(id: string) {
    list.value = list.value.filter(i => i.id !== id)
  }

  function getById(id: string): PaymentApplyOrder | undefined {
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
