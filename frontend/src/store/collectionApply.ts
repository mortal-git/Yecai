import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useReceivableStatementStore } from './receivableStatement'

export type CollectionApplyStatus = 'pending' | 'approved' | 'collected' | 'rejected' | 'cancelled'

export interface CollectionRegistrationRecord {
  collectionNo: string
  collectionDate: string
  collectionMethod: string
  bankAccount: string
  transactionNo?: string
  actualAmount: number
  remark?: string
  registrant: string
  registerTime: string
}

export interface CollectionApplyOrder {
  id: string
  applyNo: string
  statementId: string
  statementNo: string
  customer: string
  settlementUnit: string
  statementTotalIncTax: number
  appliedBeforeAmount: number
  applyAmount: number
  remainingAmount: number
  expectedCollectionDate: string
  status: CollectionApplyStatus
  remark?: string
  applicant: string
  applyDate: string
  createTime: string
  auditRemark?: string
  auditor?: string
  auditTime?: string
  collection?: CollectionRegistrationRecord
}

export const APPLY_STATUS_LABEL: Record<CollectionApplyStatus, string> = {
  pending: '待审核',
  approved: '已审核',
  collected: '已收款',
  rejected: '已驳回',
  cancelled: '已作废'
}

export const APPLY_STATUS_TYPE: Record<CollectionApplyStatus, string> = {
  pending: 'warning',
  approved: 'primary',
  collected: 'success',
  rejected: 'danger',
  cancelled: 'info'
}

export const COLLECTION_METHOD_OPTIONS = [
  { value: '银行转账', label: '银行转账' },
  { value: '承兑汇票', label: '承兑汇票' },
  { value: '商业汇票', label: '商业汇票' },
  { value: '现金', label: '现金' },
  { value: '支票', label: '支票' },
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

export const useCollectionApplyStore = defineStore('collectionApply', () => {
  const receivableStore = useReceivableStatementStore()

  function buildMockList(): CollectionApplyOrder[] {
    const findByNo = (no: string) => receivableStore.list.find(s => s.statementNo === no)
    const s1 = findByNo('RS2026070001')
    const s2 = findByNo('RS2026070002')

    const result: CollectionApplyOrder[] = []

    if (s1) {
      result.push({
        id: uid('ca_'),
        applyNo: 'CA2026070001',
        statementId: s1.id,
        statementNo: s1.statementNo,
        customer: s1.customer,
        settlementUnit: s1.settlementUnit,
        statementTotalIncTax: s1.totalIncTaxCny,
        appliedBeforeAmount: 0,
        applyAmount: s1.totalIncTaxCny,
        remainingAmount: 0,
        expectedCollectionDate: '2026-07-10',
        status: 'collected',
        remark: '全额收款',
        applicant: '张三',
        applyDate: '2026-07-08',
        createTime: '2026-07-08 10:00:00',
        auditor: '王经理',
        auditTime: '2026-07-09 09:00:00',
        auditRemark: '审核通过',
        collection: {
          collectionNo: 'COL2026070001',
          collectionDate: '2026-07-10',
          collectionMethod: '银行转账',
          bankAccount: '基本户-中国银行 6222021234567890123',
          transactionNo: 'BANK20260710001',
          actualAmount: s1.totalIncTaxCny,
          remark: '全额到账',
          registrant: '张三',
          registerTime: '2026-07-10 16:00:00'
        }
      })
    }

    if (s2) {
      const firstAmount = 50000
      const secondAmount = Number((s2.totalIncTaxCny - firstAmount).toFixed(2))
      result.push({
        id: uid('ca_'),
        applyNo: 'CA2026070002',
        statementId: s2.id,
        statementNo: s2.statementNo,
        customer: s2.customer,
        settlementUnit: s2.settlementUnit,
        statementTotalIncTax: s2.totalIncTaxCny,
        appliedBeforeAmount: 0,
        applyAmount: firstAmount,
        remainingAmount: secondAmount,
        expectedCollectionDate: '2026-07-18',
        status: 'approved',
        remark: '首期收款申请',
        applicant: '李四',
        applyDate: '2026-07-12',
        createTime: '2026-07-12 09:30:00',
        auditor: '王经理',
        auditTime: '2026-07-13 10:00:00',
        auditRemark: '审核通过，待登记收款记录'
      })
      result.push({
        id: uid('ca_'),
        applyNo: 'CA2026070003',
        statementId: s2.id,
        statementNo: s2.statementNo,
        customer: s2.customer,
        settlementUnit: s2.settlementUnit,
        statementTotalIncTax: s2.totalIncTaxCny,
        appliedBeforeAmount: firstAmount,
        applyAmount: secondAmount,
        remainingAmount: 0,
        expectedCollectionDate: '2026-07-25',
        status: 'pending',
        remark: '剩余金额收款申请',
        applicant: '李四',
        applyDate: '2026-07-14',
        createTime: '2026-07-14 14:00:00'
      })
    }

    return result
  }

  const list = ref<CollectionApplyOrder[]>(buildMockList())

  const statistics = computed(() => {
    const s = list.value
    return {
      total: s.length,
      pending: s.filter(i => i.status === 'pending').length,
      approved: s.filter(i => i.status === 'approved').length,
      collected: s.filter(i => i.status === 'collected').length,
      rejected: s.filter(i => i.status === 'rejected').length,
      cancelled: s.filter(i => i.status === 'cancelled').length,
      totalApplyAmount: s.filter(i => i.status !== 'cancelled' && i.status !== 'rejected').reduce((sum, i) => sum + i.applyAmount, 0),
      collectedAmount: s.filter(i => i.status === 'collected').reduce((sum, i) => sum + i.applyAmount, 0),
      pendingAmount: s.filter(i => i.status === 'pending' || i.status === 'approved').reduce((sum, i) => sum + i.applyAmount, 0)
    }
  })

  function genApplyNo(): string {
    const seq = String(list.value.length + 1).padStart(4, '0')
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    return `CA${dateStr}${seq}`
  }

  function getAppliedAmountByStatement(statementId: string, excludeId?: string): number {
    return list.value
      .filter(i => i.statementId === statementId && i.status !== 'cancelled' && i.status !== 'rejected' && i.id !== excludeId)
      .reduce((sum, i) => sum + i.applyAmount, 0)
  }

  function getAvailableStatements() {
    return receivableStore.list.filter(s => s.status === 'invoiced')
  }

  function addApply(data: Omit<CollectionApplyOrder, 'id' | 'applyNo' | 'appliedBeforeAmount' | 'remainingAmount' | 'applicant' | 'applyDate' | 'createTime'>): CollectionApplyOrder {
    const appliedBeforeAmount = getAppliedAmountByStatement(data.statementId)
    const remainingAmount = Math.max(0, data.statementTotalIncTax - appliedBeforeAmount - data.applyAmount)
    const nowStr = now()
    const item: CollectionApplyOrder = {
      ...data,
      id: uid('ca_'),
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

  function auditApply(id: string, passed: boolean, remark: string) {
    const item = list.value.find(i => i.id === id)
    if (!item) return
    item.status = passed ? 'approved' : 'rejected'
    item.auditor = '当前用户'
    item.auditTime = now()
    item.auditRemark = remark
  }

  function registerCollection(id: string, collection: CollectionRegistrationRecord) {
    const item = list.value.find(i => i.id === id)
    if (!item) return
    item.status = 'collected'
    item.collection = collection
    receivableStore.addCollection(item.statementId, {
      collectionNo: collection.collectionNo,
      amount: collection.actualAmount,
      collectionDate: collection.collectionDate,
      collectionMethod: collection.collectionMethod,
      status: '已收款',
      remark: collection.remark
    })
  }

  function cancelApply(id: string) {
    const item = list.value.find(i => i.id === id)
    if (!item) return
    item.status = 'cancelled'
  }

  function deleteApply(id: string) {
    list.value = list.value.filter(i => i.id !== id)
  }

  function getById(id: string): CollectionApplyOrder | undefined {
    return list.value.find(i => i.id === id)
  }

  return {
    list,
    statistics,
    genApplyNo,
    getAppliedAmountByStatement,
    getAvailableStatements,
    addApply,
    auditApply,
    registerCollection,
    cancelApply,
    deleteApply,
    getById
  }
})
