// 发票类型
export type InvoiceType = 'SZ' | 'PT' | 'DZ' | 'JD' | 'QKL' | 'HG'
export type InvoiceDirection = 'JX' | 'SX'
export type InvoiceStatus = 'draft' | 'pending' | 'verified' | 'related' | 'authenticated' | 'deducted' | 'cancelled' | 'red_letter' | 'abnormal'
export type AuthStatus = 'unauthenticated' | 'authenticated' | 'deducted'
export type RedLetterType = 'buyer_apply' | 'seller_apply'

// 发票类型映射
export const INVOICE_TYPE_MAP: Record<InvoiceType, { label: string; direction: InvoiceDirection[] }> = {
  'SZ': { label: '增值税专用发票', direction: ['JX'] },
  'PT': { label: '增值税普通发票', direction: ['JX', 'SX'] },
  'DZ': { label: '电子发票', direction: ['JX', 'SX'] },
  'JD': { label: '机动车销售统一发票', direction: ['SX'] },
  'QKL': { label: '区块链电子发票', direction: ['JX', 'SX'] },
  'HG': { label: '海关缴款书', direction: ['JX'] }
}

// 发票方向映射
export const INVOICE_DIRECTION_MAP: Record<InvoiceDirection, string> = {
  'JX': '进项发票',
  'SX': '销项发票'
}

// 发票状态映射
export const INVOICE_STATUS_MAP: Record<InvoiceStatus, { label: string; type: string }> = {
  'draft': { label: '草稿', type: 'info' },
  'pending': { label: '待查验', type: 'warning' },
  'verified': { label: '已查验', type: 'success' },
  'related': { label: '已关联', type: 'primary' },
  'authenticated': { label: '已认证', type: 'primary' },
  'deducted': { label: '已抵扣', type: 'success' },
  'cancelled': { label: '已作废', type: 'danger' },
  'red_letter': { label: '已红冲', type: 'danger' },
  'abnormal': { label: '异常票', type: 'danger' }
}

// 认证状态映射
export const AUTH_STATUS_MAP: Record<AuthStatus, { label: string; type: string }> = {
  'unauthenticated': { label: '未认证', type: 'info' },
  'authenticated': { label: '已认证', type: 'success' },
  'deducted': { label: '已抵扣', type: 'primary' }
}

// 税率选项
export const TAX_RATE_OPTIONS = [
  { value: 0, label: '0%' },
  { value: 0.03, label: '3%' },
  { value: 0.06, label: '6%' },
  { value: 0.09, label: '9%' },
  { value: 0.13, label: '13%' }
]

// 不抵扣原因
export const NON_DEDUCTIBLE_REASONS = [
  { value: 'simple_tax', label: '用于简易计税项目' },
  { value: 'exempt_tax', label: '用于免征增值税项目' },
  { value: 'welfare', label: '用于集体福利、个人消费' },
  { value: 'loan_service', label: '购进贷款服务' },
  { value: 'passenger_service', label: '旅客运输服务' },
  { value: 'abnormal_loss', label: '非正常损失' },
  { value: 'abnormal_voucher', label: '异常凭证' }
]

// 异常发票类型
export const ABNORMAL_INVOICE_TYPES = [
  { value: 'out_of_control', label: '失控发票' },
  { value: 'abnormal_voucher', label: '异常凭证' },
  { value: 'overdue_not_auth', label: '逾期未认证' },
  { value: 'info_inconsistent', label: '信息不一致' },
  { value: 'suspicious_fake', label: '涉嫌虚开' },
  { value: 'duplicate_entry', label: '重复入账' }
]

// 可关联单据类型
export const RELATED_DOCUMENT_TYPES = [
  { value: 'order', label: '销售订单', directions: ['SX'] },
  { value: 'purchase_order', label: '采购订单', directions: ['JX'] },
  { value: 'monthly_cost', label: '月结成本单', directions: ['JX'] },
  { value: 'prepayment', label: '预付款单', directions: ['JX'] },
  { value: 'advance_cost', label: '垫付成本单', directions: ['JX'] },
  { value: 'receivable', label: '应收单', directions: ['SX'] },
  { value: 'payable', label: '应付单', directions: ['JX'] },
  { value: 'collection', label: '收款单', directions: ['SX'] },
  { value: 'payment', label: '付款单', directions: ['JX'] }
]

// 发票数据接口
export interface InvoiceItem {
  id: string
  invoiceNo: string
  invoiceType: InvoiceType
  invoiceDirection: InvoiceDirection
  invoiceCode: string
  invoiceNumber: string
  billingDate: string
  checkCode?: string
  supplierId?: string
  supplierName?: string
  supplierTaxNo?: string
  customerId?: string
  customerName?: string
  customerTaxNo?: string
  amountWithoutTax: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  authStatus: AuthStatus
  invoiceStatus: InvoiceStatus
  authPeriod?: string
  deductPeriod?: string
  remark?: string
  attachments?: Attachment[]
  relatedDocuments?: RelatedDocument[]
  createTime: string
  createBy: string
  updateTime: string
  updateBy: string
}

export interface Attachment {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadTime: string
}

export interface RelatedDocument {
  id: string
  type: string
  no: string
  amount: number
  relatedAmount: number
  createTime: string
}

export interface InvoiceVerifyRecord {
  id: string
  invoiceId: string
  verifyTime: string
  verifyStatus: 'success' | 'failed'
  verifyResult: string
  abnormalType?: string
  operator: string
}

export interface InvoiceAuthRecord {
  id: string
  invoiceId: string
  authTime: string
  authPeriod: string
  authStatus: 'success' | 'failed'
  operator: string
  remark?: string
}

export interface InvoiceDeductRecord {
  id: string
  invoiceId: string
  deductTime: string
  deductPeriod: string
  deductAmount: number
  deductType: string
  operator: string
}

export interface OperationLog {
  id: string
  operator: string
  operateTime: string
  operateContent: string
  beforeStatus?: string
  afterStatus?: string
}

// 发票录入表单
export interface InvoiceFormData {
  invoiceType: InvoiceType
  invoiceDirection: InvoiceDirection
  invoiceCode: string
  invoiceNumber: string
  billingDate: string
  checkCode?: string
  partyId: string
  partyName: string
  partyTaxNo?: string
  partyAddress?: string
  partyBank?: string
  items: InvoiceItemRow[]
  totalAmountWithoutTax: number
  totalTaxAmount: number
  totalAmount: number
  remark?: string
  expectedDeductPeriod?: string
  attachments: File[]
}

export interface InvoiceItemRow {
  id: string
  name: string
  taxClassificationCode: string
  spec?: string
  unit?: string
  quantity?: number
  unitPrice?: number
  amount: number
  taxRate: number
  taxAmount: number
  totalAmount: number
}

// 搜索表单
export interface InvoiceSearchForm {
  invoiceDirection?: InvoiceDirection
  invoiceTypes?: InvoiceType[]
  invoiceStatuses?: InvoiceStatus[]
  authStatuses?: AuthStatus[]
  billingDateRange?: string[]
  authDateRange?: string[]
  invoiceNumber?: string
  partyName?: string
  amountRange?: { min?: number; max?: number }
  taxRates?: number[]
  relatedStatus?: 'all' | 'related' | 'unrelated'
  hasAttachment?: boolean
  abnormalType?: string
  responsible?: string
}

// 统计汇总
export interface InvoiceStatistics {
  totalCount: number
  totalAmountWithoutTax: number
  totalTaxAmount: number
  totalAmount: number
  authenticatedCount: number
  authenticatedAmount: number
  deductedCount: number
  deductedAmount: number
  pendingVerifyCount: number
  abnormalCount: number
}

// 批量操作
export interface BatchOperationResult {
  success: number
  failed: number
  errors: { id: string; reason: string }[]
}
