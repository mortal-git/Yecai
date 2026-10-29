import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ReceivableStatementStatus =
  | 'draft'           // 草稿
  | 'pending'         // 待审核
  | 'approved'        // 待开票
  | 'invoiced'        // 待收款
  | 'collected'       // 已收款

export interface ReceivableStatementRow {
  rateSheetNo: string
  customerName: string
  businessRefNo: string
  billingDoc: string
  incomeItem: string
  productL1: string
  productL2: string
  productL3: string
  currency: string
  exTaxAmount: number
  taxRate: number
  taxAmount: number
  incTaxAmount: number
  exchangeRate: number
  exTaxAmountCny: number
  incTaxAmountCny: number
  customerService: string
  settlementUnit?: string
  rateSheetCreateTime?: string
  reconcileStatus?: string
}

export interface InvoiceApplyRecord {
  id: string
  applyNo: string
  invoiceType: string       // 发票类型: 增值税专用发票/增值税普通发票
  invoiceNo: string         // 发票号
  invoiceDate: string       // 开票日期
  amount: number            // 不含税金额
  taxRate: number
  taxAmount: number
  incTaxAmount: number      // 价税合计
  status: '已申请' | '已开票'
  remark?: string
}

export interface CollectionRecord {
  id: string
  collectionNo: string
  amount: number
  collectionDate: string
  collectionMethod: string
  status: '已收款'
  remark?: string
}

export interface OperationLog {
  id: string
  action: string
  operator: string
  operateTime: string
  remark?: string
}

export interface ReceivableStatement {
  id: string
  statementNo: string
  name: string
  customer: string
  settlementUnit: string
  settlementBank: string
  settlementAccount: string
  settleDate: string
  totalExTaxCny: number
  totalIncTaxCny: number
  status: ReceivableStatementStatus
  remark?: string
  rows: ReceivableStatementRow[]
  invoiceApplies: InvoiceApplyRecord[]
  collections: CollectionRecord[]
  logs: OperationLog[]
  creator: string
  createTime: string
  updater?: string
  updateTime?: string
}

export const STATUS_LABEL: Record<ReceivableStatementStatus, string> = {
  draft: '草稿',
  pending: '待审核',
  approved: '待开票',
  invoiced: '待收款',
  collected: '已收款'
}

export const STATUS_TYPE: Record<ReceivableStatementStatus, string> = {
  draft: 'info',
  pending: 'warning',
  approved: 'primary',
  invoiced: 'primary',
  collected: 'success'
}

function uid(prefix = ''): string {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

function now(): string {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
}

function buildMockRows(): ReceivableStatementRow[] {
  return [
    {
      rateSheetNo: 'FL2026050001', customerName: '深圳市腾讯科技有限公司', businessRefNo: 'PO2026050001',
      billingDoc: '应收单', incomeItem: '仓储费',
      productL1: '物流服务', productL2: '仓储服务', productL3: '仓储服务',
      currency: 'CNY', exTaxAmount: 50000, taxRate: 13, taxAmount: 6500, incTaxAmount: 56500,
      exchangeRate: 1.0, exTaxAmountCny: 50000, incTaxAmountCny: 56500,
      customerService: '张三', settlementUnit: '深圳分公司'
    },
    {
      rateSheetNo: 'FL2026050002', customerName: '阿里巴巴（中国）有限公司', businessRefNo: 'PO2026050002',
      billingDoc: '应收单', incomeItem: '运输费',
      productL1: '物流服务', productL2: '运输服务', productL3: '运输服务',
      currency: 'CNY', exTaxAmount: 80000, taxRate: 13, taxAmount: 10400, incTaxAmount: 90400,
      exchangeRate: 1.0, exTaxAmountCny: 80000, incTaxAmountCny: 90400,
      customerService: '李四', settlementUnit: '上海分公司'
    }
  ]
}

function buildMockData(): ReceivableStatement[] {
  const rows = buildMockRows()
  return [
    {
      id: uid('rs_'), statementNo: 'RS2026070001', name: '2026年6月深圳仓仓储费应收对账单',
      customer: '深圳市腾讯科技有限公司', settlementUnit: '深圳分公司',
      settlementBank: '中国工商银行', settlementAccount: '6222021234567890123',
      settleDate: '2026-07-05',
      totalExTaxCny: 50000, totalIncTaxCny: 56500, status: 'collected', remark: '已完成收款',
      rows,
      invoiceApplies: [{ id: uid('ia_'), applyNo: 'IA2026070001', invoiceType: '增值税专用发票', invoiceNo: 'INV2026070001', invoiceDate: '2026-07-06', amount: 50000, taxRate: 13, taxAmount: 6500, incTaxAmount: 56500, status: '已开票' }],
      collections: [{ id: uid('c_'), collectionNo: 'COL2026070001', amount: 56500, collectionDate: '2026-07-10', collectionMethod: '银行转账', status: '已收款' }],
      logs: [
        { id: uid('log_'), action: '创建对账单', operator: '张三', operateTime: '2026-07-01 10:30:00' },
        { id: uid('log_'), action: '提交审核', operator: '张三', operateTime: '2026-07-01 14:00:00' },
        { id: uid('log_'), action: '审核通过', operator: '王经理', operateTime: '2026-07-02 09:00:00' },
        { id: uid('log_'), action: '申请开票', operator: '张三', operateTime: '2026-07-05 16:00:00', remark: '发票号 INV2026070001' },
        { id: uid('log_'), action: '收款登记', operator: '张三', operateTime: '2026-07-10 16:00:00', remark: '收款单号 COL2026070001' }
      ],
      creator: '张三', createTime: '2026-07-01 10:30:00', updater: '李会计', updateTime: '2026-07-10 16:00:00'
    },
    {
      id: uid('rs_'), statementNo: 'RS2026070002', name: '2026年6月海运运输费应收对账单',
      customer: '阿里巴巴（中国）有限公司', settlementUnit: '上海分公司',
      settlementBank: '中国农业银行', settlementAccount: '6225001234567890123',
      settleDate: '2026-07-08',
      totalExTaxCny: 80000, totalIncTaxCny: 90400, status: 'invoiced', remark: '已开票待收款',
      rows: [rows[1]],
      invoiceApplies: [{ id: uid('ia_'), applyNo: 'IA2026070002', invoiceType: '增值税专用发票', invoiceNo: 'INV2026070002', invoiceDate: '2026-07-09', amount: 80000, taxRate: 13, taxAmount: 10400, incTaxAmount: 90400, status: '已开票' }],
      collections: [],
      logs: [
        { id: uid('log_'), action: '创建对账单', operator: '李四', operateTime: '2026-07-03 11:00:00' },
        { id: uid('log_'), action: '提交审核', operator: '李四', operateTime: '2026-07-03 15:00:00' },
        { id: uid('log_'), action: '审核通过', operator: '王经理', operateTime: '2026-07-04 09:30:00' },
        { id: uid('log_'), action: '申请开票', operator: '李四', operateTime: '2026-07-09 14:00:00', remark: '发票号 INV2026070002' }
      ],
      creator: '李四', createTime: '2026-07-03 11:00:00', updater: '王经理', updateTime: '2026-07-09 14:00:00'
    },
    {
      id: uid('rs_'), statementNo: 'RS2026070003', name: '2026年7月首周费用应收对账单',
      customer: '字节跳动科技有限公司', settlementUnit: '北京分公司',
      settlementBank: '中国银行', settlementAccount: '6217001234567890123',
      settleDate: '2026-07-07',
      totalExTaxCny: 35000, totalIncTaxCny: 39550, status: 'approved', remark: '已审核待开票',
      rows: [],
      invoiceApplies: [], collections: [],
      logs: [
        { id: uid('log_'), action: '创建对账单', operator: '王五', operateTime: '2026-07-06 09:00:00' },
        { id: uid('log_'), action: '提交审核', operator: '王五', operateTime: '2026-07-06 11:00:00' },
        { id: uid('log_'), action: '审核通过', operator: '王经理', operateTime: '2026-07-06 16:00:00' }
      ],
      creator: '王五', createTime: '2026-07-06 09:00:00', updater: '王经理', updateTime: '2026-07-06 16:00:00'
    },
    {
      id: uid('rs_'), statementNo: 'RS2026070004', name: '2026年7月第二周费用应收对账单',
      customer: '华为技术有限公司', settlementUnit: '广州分公司',
      settlementBank: '中国建设银行', settlementAccount: '6214001234567890123',
      settleDate: '2026-07-12',
      totalExTaxCny: 22000, totalIncTaxCny: 24860, status: 'pending', remark: '待审核',
      rows: [],
      invoiceApplies: [], collections: [],
      logs: [
        { id: uid('log_'), action: '创建对账单', operator: '赵六', operateTime: '2026-07-08 10:00:00' },
        { id: uid('log_'), action: '提交审核', operator: '赵六', operateTime: '2026-07-08 14:00:00' }
      ],
      creator: '赵六', createTime: '2026-07-08 10:00:00', updater: '赵六', updateTime: '2026-07-08 14:00:00'
    },
    {
      id: uid('rs_'), statementNo: 'RS2026070005', name: '2026年7月第三周费用应收对账单（草稿）',
      customer: '京东集团股份有限公司', settlementUnit: '深圳分公司',
      settlementBank: '招商银行', settlementAccount: '6225001234567890123',
      settleDate: '2026-07-15',
      totalExTaxCny: 12000, totalIncTaxCny: 13560, status: 'draft', remark: '',
      rows: [],
      invoiceApplies: [], collections: [],
      logs: [
        { id: uid('log_'), action: '创建对账单', operator: '张三', operateTime: '2026-07-09 09:00:00' }
      ],
      creator: '张三', createTime: '2026-07-09 09:00:00'
    }
  ]
}

export const useReceivableStatementStore = defineStore('receivableStatement', () => {
  const list = ref<ReceivableStatement[]>(buildMockData())
  const pendingRevenueRows = ref<ReceivableStatementRow[]>([])

  const statistics = computed(() => {
    const s = list.value
    return {
      total: s.length,
      pending: s.filter(i => i.status === 'pending').length,
      approved: s.filter(i => i.status === 'approved').length,
      invoiced: s.filter(i => i.status === 'invoiced').length,
      collected: s.filter(i => i.status === 'collected').length,
      totalExTaxCny: s.reduce((sum, i) => sum + i.totalExTaxCny, 0),
      totalIncTaxCny: s.reduce((sum, i) => sum + i.totalIncTaxCny, 0)
    }
  })

  function setSelectedRevenueRows(rows: ReceivableStatementRow[]) {
    pendingRevenueRows.value = rows.map(r => ({ ...r }))
  }

  function consumePendingRevenueRows(): ReceivableStatementRow[] {
    const rows = pendingRevenueRows.value
    pendingRevenueRows.value = []
    return rows
  }

  function genStatementNo(): string {
    const seq = String(list.value.length + 1).padStart(4, '0')
    return `RS202607${seq}`
  }

  function addStatement(data: Omit<ReceivableStatement, 'id' | 'statementNo' | 'logs' | 'creator' | 'createTime'>): ReceivableStatement {
    const nowStr = now()
    const item: ReceivableStatement = {
      ...data,
      id: uid('rs_'),
      statementNo: genStatementNo(),
      logs: [{ id: uid('log_'), action: '创建对账单', operator: '当前用户', operateTime: nowStr }],
      creator: '当前用户',
      createTime: nowStr
    }
    list.value.unshift(item)
    return item
  }

  function updateStatement(id: string, data: Partial<ReceivableStatement>) {
    const idx = list.value.findIndex(i => i.id === id)
    if (idx === -1) return
    const nowStr = now()
    list.value[idx] = { ...list.value[idx], ...data, updater: '当前用户', updateTime: nowStr }
  }

  function deleteStatement(id: string) {
    list.value = list.value.filter(i => i.id !== id)
  }

  function getById(id: string): ReceivableStatement | undefined {
    return list.value.find(i => i.id === id)
  }

  function addLog(id: string, action: string, remark?: string) {
    const item = getById(id)
    if (!item) return
    item.logs.push({ id: uid('log_'), action, operator: '当前用户', operateTime: now(), remark })
    item.updateTime = now()
    item.updater = '当前用户'
  }

  function changeStatus(id: string, status: ReceivableStatementStatus, action?: string, remark?: string) {
    const item = getById(id)
    if (!item) return
    item.status = status
    item.logs.push({ id: uid('log_'), action: action || `状态变更为${STATUS_LABEL[status]}`, operator: '当前用户', operateTime: now(), remark })
    item.updateTime = now()
    item.updater = '当前用户'
  }

  function addInvoiceApply(id: string, apply: Omit<InvoiceApplyRecord, 'id'>) {
    const item = getById(id)
    if (!item) return
    item.invoiceApplies.push({ ...apply, id: uid('ia_') })
    item.status = 'invoiced'
    item.logs.push({ id: uid('log_'), action: '申请开票', operator: '当前用户', operateTime: now(), remark: `发票号 ${apply.invoiceNo}` })
    item.updateTime = now()
    item.updater = '当前用户'
  }

  function addCollection(id: string, collection: Omit<CollectionRecord, 'id'>) {
    const item = getById(id)
    if (!item) return
    item.collections.push({ ...collection, id: uid('c_') })
    const collectedTotal = item.collections.filter(c => c.status === '已收款').reduce((s, c) => s + c.amount, 0)
    if (collectedTotal >= item.totalIncTaxCny) {
      item.status = 'collected'
    } else {
      item.status = 'invoiced'
    }
    item.logs.push({ id: uid('log_'), action: '收款登记', operator: '当前用户', operateTime: now(), remark: `收款单号 ${collection.collectionNo}` })
    item.updateTime = now()
    item.updater = '当前用户'
  }

  return {
    list,
    pendingRevenueRows,
    statistics,
    setSelectedRevenueRows,
    consumePendingRevenueRows,
    addStatement,
    updateStatement,
    deleteStatement,
    getById,
    addLog,
    changeStatus,
    addInvoiceApply,
    addCollection
  }
})
