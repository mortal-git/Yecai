import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type PayableStatementStatus =
  | 'draft'      // 草稿
  | 'pending'    // 待审核
  | 'confirmed'  // 已确认
  | 'sent'       // 已发送
  | 'writtenOff' // 已核销
  | 'cancelled'  // 已取消

export interface PayableStatementRow {
  rateSheetNo: string
  customerName: string
  businessRefNo: string
  billingDoc: string
  costType: string
  costItem: string
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
  supplier?: string
  settlementUnit?: string
  rateSheetCreateTime?: string
  costReconcileStatus?: string
}

export interface PaymentRecord {
  id: string
  paymentNo: string
  amount: number
  paymentDate: string
  paymentMethod: string
  status: '已付款' | '待付款' | '已核销'
  remark?: string
}

export interface InvoiceRecord {
  id: string
  invoiceNo: string
  invoiceDate: string
  amount: number
  taxRate: number
  taxAmount: number
  incTaxAmount: number
  status: '已关联' | '已核销'
  remark?: string
}

export interface OperationLog {
  id: string
  action: string
  operator: string
  operateTime: string
  remark?: string
}

export interface PayableStatement {
  id: string
  statementNo: string
  name: string
  supplier: string
  settlementUnit: string
  settleDate: string
  totalExTaxCny: number
  totalIncTaxCny: number
  status: PayableStatementStatus
  remark?: string
  rows: PayableStatementRow[]
  payments: PaymentRecord[]
  invoices: InvoiceRecord[]
  logs: OperationLog[]
  creator: string
  createTime: string
  updater?: string
  updateTime?: string
}

export const STATUS_LABEL: Record<PayableStatementStatus, string> = {
  draft: '草稿',
  pending: '待审核',
  confirmed: '已确认',
  sent: '已发送',
  writtenOff: '已核销',
  cancelled: '已取消'
}

export const STATUS_TYPE: Record<PayableStatementStatus, string> = {
  draft: 'info',
  pending: 'warning',
  confirmed: 'primary',
  sent: 'success',
  writtenOff: 'success',
  cancelled: 'info'
}

function uid(prefix = ''): string {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

function now(): string {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
}

function buildMockRows(): PayableStatementRow[] {
  return [
    {
      rateSheetNo: 'FL2026050001', customerName: '深圳市腾讯科技有限公司', businessRefNo: 'PO2026050001',
      billingDoc: '应付单', costType: '直接成本', costItem: '仓储费',
      productL1: '物流服务', productL2: '仓储服务', productL3: '普通仓储',
      currency: 'CNY', exTaxAmount: 50000, taxRate: 13, taxAmount: 6500, incTaxAmount: 56500,
      exchangeRate: 1.0, exTaxAmountCny: 50000, incTaxAmountCny: 56500,
      customerService: '张三', supplier: '深圳盐田国际集装箱码头有限公司', settlementUnit: '深圳分公司'
    },
    {
      rateSheetNo: 'FL2026050002', customerName: '阿里巴巴（中国）有限公司', businessRefNo: 'PO2026050002',
      billingDoc: '应付单', costType: '直接成本', costItem: '运输费',
      productL1: '物流服务', productL2: '运输服务', productL3: '海运运输',
      currency: 'CNY', exTaxAmount: 80000, taxRate: 13, taxAmount: 10400, incTaxAmount: 90400,
      exchangeRate: 1.0, exTaxAmountCny: 80000, incTaxAmountCny: 90400,
      customerService: '李四', supplier: '上海中远海运集装箱运输有限公司', settlementUnit: '上海分公司'
    }
  ]
}

function buildMockData(): PayableStatement[] {
  const rows = buildMockRows()
  return [
    {
      id: uid('ps_'), statementNo: 'PS2026070001', name: '2026年6月深圳仓仓储费对账单',
      supplier: '深圳盐田国际集装箱码头有限公司', settlementUnit: '深圳分公司', settleDate: '2026-07-05',
      totalExTaxCny: 50000, totalIncTaxCny: 56500, status: 'writtenOff', remark: '已核销完成',
      rows,
      payments: [{ id: uid('p_'), paymentNo: 'PAY2026070001', amount: 56500, paymentDate: '2026-07-10', paymentMethod: '银行转账', status: '已核销' }],
      invoices: [{ id: uid('inv_'), invoiceNo: 'INV2026070001', invoiceDate: '2026-07-06', amount: 50000, taxRate: 13, taxAmount: 6500, incTaxAmount: 56500, status: '已核销' }],
      logs: [
        { id: uid('log_'), action: '创建对账单', operator: '张三', operateTime: '2026-07-01 10:30:00' },
        { id: uid('log_'), action: '提交审核', operator: '张三', operateTime: '2026-07-01 14:00:00' },
        { id: uid('log_'), action: '审核通过', operator: '王经理', operateTime: '2026-07-02 09:00:00' },
        { id: uid('log_'), action: '发送对账单', operator: '张三', operateTime: '2026-07-03 10:00:00' },
        { id: uid('log_'), action: '关联付款单', operator: '张三', operateTime: '2026-07-08 11:00:00' },
        { id: uid('log_'), action: '核销完成', operator: '李会计', operateTime: '2026-07-10 16:00:00' }
      ],
      creator: '张三', createTime: '2026-07-01 10:30:00', updater: '李会计', updateTime: '2026-07-10 16:00:00'
    },
    {
      id: uid('ps_'), statementNo: 'PS2026070002', name: '2026年6月海运运输费对账单',
      supplier: '上海中远海运集装箱运输有限公司', settlementUnit: '上海分公司', settleDate: '2026-07-08',
      totalExTaxCny: 80000, totalIncTaxCny: 90400, status: 'sent', remark: '已发送供应商待回执',
      rows: [rows[1]],
      payments: [], invoices: [],
      logs: [
        { id: uid('log_'), action: '创建对账单', operator: '李四', operateTime: '2026-07-03 11:00:00' },
        { id: uid('log_'), action: '提交审核', operator: '李四', operateTime: '2026-07-03 15:00:00' },
        { id: uid('log_'), action: '审核通过', operator: '王经理', operateTime: '2026-07-04 09:30:00' },
        { id: uid('log_'), action: '发送对账单', operator: '李四', operateTime: '2026-07-05 10:00:00' }
      ],
      creator: '李四', createTime: '2026-07-03 11:00:00', updater: '李四', updateTime: '2026-07-05 10:00:00'
    },
    {
      id: uid('ps_'), statementNo: 'PS2026070003', name: '2026年7月首周费用对账单',
      supplier: '北京华贸物流股份有限公司', settlementUnit: '北京分公司', settleDate: '2026-07-07',
      totalExTaxCny: 35000, totalIncTaxCny: 39550, status: 'confirmed', remark: '',
      rows: [],
      payments: [], invoices: [],
      logs: [
        { id: uid('log_'), action: '创建对账单', operator: '王五', operateTime: '2026-07-06 09:00:00' },
        { id: uid('log_'), action: '提交审核', operator: '王五', operateTime: '2026-07-06 11:00:00' },
        { id: uid('log_'), action: '审核通过', operator: '王经理', operateTime: '2026-07-06 16:00:00' }
      ],
      creator: '王五', createTime: '2026-07-06 09:00:00', updater: '王经理', updateTime: '2026-07-06 16:00:00'
    },
    {
      id: uid('ps_'), statementNo: 'PS2026070004', name: '2026年7月第二周费用对账单',
      supplier: '广州白云国际机场物流有限公司', settlementUnit: '广州分公司', settleDate: '2026-07-12',
      totalExTaxCny: 22000, totalIncTaxCny: 24860, status: 'pending', remark: '待审核',
      rows: [],
      payments: [], invoices: [],
      logs: [
        { id: uid('log_'), action: '创建对账单', operator: '赵六', operateTime: '2026-07-08 10:00:00' },
        { id: uid('log_'), action: '提交审核', operator: '赵六', operateTime: '2026-07-08 14:00:00' }
      ],
      creator: '赵六', createTime: '2026-07-08 10:00:00', updater: '赵六', updateTime: '2026-07-08 14:00:00'
    },
    {
      id: uid('ps_'), statementNo: 'PS2026070005', name: '2026年7月第三周费用对账单（草稿）',
      supplier: '中外运冷链物流有限公司', settlementUnit: '深圳分公司', settleDate: '2026-07-15',
      totalExTaxCny: 12000, totalIncTaxCny: 13560, status: 'draft', remark: '',
      rows: [],
      payments: [], invoices: [],
      logs: [
        { id: uid('log_'), action: '创建对账单', operator: '张三', operateTime: '2026-07-09 09:00:00' }
      ],
      creator: '张三', createTime: '2026-07-09 09:00:00'
    }
  ]
}

export const usePayableStatementStore = defineStore('payableStatement', () => {
  const list = ref<PayableStatement[]>(buildMockData())
  const pendingCostRows = ref<PayableStatementRow[]>([])

  const statistics = computed(() => {
    const s = list.value
    return {
      total: s.length,
      pending: s.filter(i => i.status === 'pending').length,
      confirmed: s.filter(i => i.status === 'confirmed').length,
      writtenOff: s.filter(i => i.status === 'writtenOff').length,
      totalExTaxCny: s.reduce((sum, i) => sum + i.totalExTaxCny, 0),
      totalIncTaxCny: s.reduce((sum, i) => sum + i.totalIncTaxCny, 0)
    }
  })

  function setSelectedCostRows(rows: PayableStatementRow[]) {
    pendingCostRows.value = rows.map(r => ({ ...r }))
  }

  function consumePendingCostRows(): PayableStatementRow[] {
    const rows = pendingCostRows.value
    pendingCostRows.value = []
    return rows
  }

  function genStatementNo(): string {
    const seq = String(list.value.length + 1).padStart(4, '0')
    return `PS202607${seq}`
  }

  function addStatement(data: Omit<PayableStatement, 'id' | 'statementNo' | 'logs' | 'creator' | 'createTime'>): PayableStatement {
    const nowStr = now()
    const item: PayableStatement = {
      ...data,
      id: uid('ps_'),
      statementNo: genStatementNo(),
      logs: [{ id: uid('log_'), action: '创建对账单', operator: '当前用户', operateTime: nowStr }],
      creator: '当前用户',
      createTime: nowStr
    }
    list.value.unshift(item)
    return item
  }

  function updateStatement(id: string, data: Partial<PayableStatement>) {
    const idx = list.value.findIndex(i => i.id === id)
    if (idx === -1) return
    const nowStr = now()
    list.value[idx] = { ...list.value[idx], ...data, updater: '当前用户', updateTime: nowStr }
  }

  function deleteStatement(id: string) {
    list.value = list.value.filter(i => i.id !== id)
  }

  function getById(id: string): PayableStatement | undefined {
    return list.value.find(i => i.id === id)
  }

  function addLog(id: string, action: string, remark?: string) {
    const item = getById(id)
    if (!item) return
    item.logs.push({ id: uid('log_'), action, operator: '当前用户', operateTime: now(), remark })
    item.updateTime = now()
    item.updater = '当前用户'
  }

  function changeStatus(id: string, status: PayableStatementStatus, action?: string, remark?: string) {
    const item = getById(id)
    if (!item) return
    item.status = status
    item.logs.push({ id: uid('log_'), action: action || `状态变更为${STATUS_LABEL[status]}`, operator: '当前用户', operateTime: now(), remark })
    item.updateTime = now()
    item.updater = '当前用户'
  }

  function addPayment(id: string, payment: Omit<PaymentRecord, 'id'>) {
    const item = getById(id)
    if (!item) return
    item.payments.push({ ...payment, id: uid('p_') })
    item.logs.push({ id: uid('log_'), action: '关联付款单', operator: '当前用户', operateTime: now(), remark: `付款单号 ${payment.paymentNo}` })
    item.updateTime = now()
  }

  function addInvoice(id: string, invoice: Omit<InvoiceRecord, 'id'>) {
    const item = getById(id)
    if (!item) return
    item.invoices.push({ ...invoice, id: uid('inv_') })
    item.logs.push({ id: uid('log_'), action: '关联进项发票', operator: '当前用户', operateTime: now(), remark: `发票号 ${invoice.invoiceNo}` })
    item.updateTime = now()
  }

  function writeOffPayment(id: string, paymentId: string) {
    const item = getById(id)
    if (!item) return
    const p = item.payments.find(i => i.id === paymentId)
    if (p) p.status = '已核销'
    item.logs.push({ id: uid('log_'), action: '核销账单', operator: '当前用户', operateTime: now(), remark: `核销付款单 ${p?.paymentNo}` })
    item.updateTime = now()
  }

  return {
    list,
    pendingCostRows,
    statistics,
    setSelectedCostRows,
    consumePendingCostRows,
    addStatement,
    updateStatement,
    deleteStatement,
    getById,
    addLog,
    changeStatus,
    addPayment,
    addInvoice,
    writeOffPayment
  }
})
