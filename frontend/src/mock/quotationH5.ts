import dayjs from 'dayjs'
import { reactive } from 'vue'

export type QuotationStatus = 'draft' | 'pending' | 'approved' | 'active' | 'expired' | 'cancelled'
export type ResponseStatus = 'pending' | 'accepted' | 'rejected' | 'negotiating'
export type CommentRole = 'customer' | 'sales' | 'system'

export interface QuoteComment {
  id: number
  author: string
  role: CommentRole
  content: string
  createdAt: string
}

export interface QuoteLineItem {
  id: number
  feeName: string
  unit: string
  quantity: number
  amount: number
  remark: string
  comments: QuoteComment[]
}

export interface QuoteEvent {
  id: number
  time: string
  operator: string
  type: string
  detail: string
}

export interface QuoteBranding {
  companyName: string
  logoText: string
  primaryColor: string
  secondaryColor: string
  contactName: string
  contactPhone: string
  contactEmail: string
}

export interface QuoteH5Config {
  token: string
  enabled: boolean
  generatedAt: string
  passwordEnabled: boolean
  password: string
  qrSeed: string
  branding: QuoteBranding
}

export interface QuoteAnalytics {
  openCount: number
  totalViewSeconds: number
  lastViewedAt: string
  events: QuoteEvent[]
}

export interface QuotationRecord {
  id: number
  quotationNo: string
  customerId: number
  customerCode: string
  customerName: string
  businessType: string
  version: number
  effectiveDate: string
  expiryDate: string
  currency: string
  taxRate: number
  settlementCycle: string
  status: QuotationStatus
  createTime: string
  creator: string
  reviewer: string | null
  quoteDescription: string
  paymentTerms: string
  performanceCycle: string
  afterSales: string
  responseStatus: ResponseStatus
  responseReason: string
  lineItems: QuoteLineItem[]
  messages: QuoteComment[]
  logs: QuoteEvent[]
  h5: QuoteH5Config
  analytics: QuoteAnalytics
}

export const customerDirectory = [
  { id: 1, code: 'KH001', name: '深圳市腾讯科技有限公司' },
  { id: 2, code: 'KH002', name: '阿里巴巴（中国）有限公司' },
  { id: 3, code: 'KH003', name: '字节跳动科技有限公司' },
  { id: 4, code: 'KH004', name: '小米科技有限责任公司' }
]

let eventSeed = 1000
let commentSeed = 2000

const nowText = () => dayjs().format('YYYY-MM-DD HH:mm:ss')

const nextEventId = () => {
  eventSeed += 1
  return eventSeed
}

const nextCommentId = () => {
  commentSeed += 1
  return commentSeed
}

const createEvent = (operator: string, type: string, detail: string): QuoteEvent => ({
  id: nextEventId(),
  time: nowText(),
  operator,
  type,
  detail
})

const createComment = (author: string, role: CommentRole, content: string): QuoteComment => ({
  id: nextCommentId(),
  author,
  role,
  content,
  createdAt: nowText()
})

const buildToken = (quotationNo: string, version: number) => `${quotationNo.toLowerCase()}-v${version}`

export const quotationRecords = reactive<QuotationRecord[]>([
  {
    id: 1,
    quotationNo: 'QT2026040001',
    customerId: 1,
    customerCode: 'KH001',
    customerName: '深圳市腾讯科技有限公司',
    businessType: 'storage',
    version: 3,
    effectiveDate: '2026-04-01',
    expiryDate: '2026-06-30',
    currency: 'CNY',
    taxRate: 6,
    settlementCycle: 'monthly',
    status: 'active',
    createTime: '2026-03-28 10:30:00',
    creator: '张三',
    reviewer: '李经理',
    quoteDescription: '覆盖华南仓储履约、订单处理与末端配送的一体化收入报价。',
    paymentTerms: '月结 30 天，对公转账；支持电子回单。',
    performanceCycle: '确认接受后 3 个工作日完成项目切换，7 日内完成首批上线。',
    afterSales: '7x12 小时客户成功支持，重大异常 2 小时内响应。',
    responseStatus: 'negotiating',
    responseReason: '客户对配送附加费和高峰期资源费提出补充说明需求。',
    lineItems: [
      {
        id: 11,
        feeName: '仓储入库操作费',
        unit: '托',
        quantity: 280,
        amount: 16,
        remark: '含基础质检、上架、系统回传。',
        comments: [
          { id: 1, author: '腾讯采购-周颖', role: 'customer', content: '高峰季是否会加收人效附加费？', createdAt: '2026-04-03 11:20:00' },
          { id: 2, author: '售前顾问-陈灿', role: 'sales', content: '报价已含常规高峰波动，超出预测 20% 后再协商。', createdAt: '2026-04-03 11:36:00' }
        ]
      },
      {
        id: 12,
        feeName: '仓储出库操作费',
        unit: '单',
        quantity: 9200,
        amount: 3.8,
        remark: '按波次拣货、复核、装箱计费。',
        comments: []
      },
      {
        id: 13,
        feeName: '城配派送费',
        unit: '票',
        quantity: 1500,
        amount: 28,
        remark: '深圳同城次日达，含签收回传。',
        comments: [
          { id: 3, author: '腾讯采购-周颖', role: 'customer', content: '如需当日达是否可以单独加价处理？', createdAt: '2026-04-04 09:15:00' }
        ]
      }
    ],
    messages: [
      { id: 4, author: '腾讯采购-周颖', role: 'customer', content: '希望在正式版报价中强化品牌露出，并补充售后保障说明。', createdAt: '2026-04-04 10:00:00' },
      { id: 5, author: '售前顾问-陈灿', role: 'sales', content: '已为 H5 版报价单配置企业 LOGO、联系电话和统一蓝色品牌色。', createdAt: '2026-04-04 10:12:00' }
    ],
    logs: [
      { id: 10, time: '2026-03-28 10:30:00', operator: '张三', type: '创建', detail: '新建报价单 V1' },
      { id: 11, time: '2026-03-28 14:20:00', operator: '李经理', type: '审核', detail: '审核通过并进入正式报价' },
      { id: 12, time: '2026-03-28 14:25:00', operator: '系统', type: '发布', detail: '自动生成 H5 链接与二维码' }
    ],
    h5: {
      token: buildToken('QT2026040001', 3),
      enabled: true,
      generatedAt: '2026-03-28 14:25:00',
      passwordEnabled: true,
      password: 'TENCENT88',
      qrSeed: 'QT2026040001|3|KH001',
      branding: {
        companyName: '泓明供应链管理有限公司',
        logoText: 'HM',
        primaryColor: '#155eef',
        secondaryColor: '#7c3aed',
        contactName: '陈灿',
        contactPhone: '138-0013-8001',
        contactEmail: 'chen.can@hongming.com'
      }
    },
    analytics: {
      openCount: 8,
      totalViewSeconds: 1240,
      lastViewedAt: '2026-04-04 10:18:00',
      events: [
        { id: 20, time: '2026-04-03 11:18:00', operator: '客户', type: '打开 H5', detail: '客户首次打开报价链接' },
        { id: 21, time: '2026-04-03 11:20:00', operator: '客户', type: '明细评论', detail: '对 仓储入库操作费 提出高峰季附加费问题' },
        { id: 22, time: '2026-04-04 09:15:00', operator: '客户', type: '明细评论', detail: '对 城配派送费 提出当日达扩展诉求' },
        { id: 23, time: '2026-04-04 10:00:00', operator: '客户', type: '在线留言', detail: '要求强化品牌展示和售后说明' }
      ]
    }
  },
  {
    id: 2,
    quotationNo: 'QT2026040002',
    customerId: 2,
    customerCode: 'KH002',
    customerName: '阿里巴巴（中国）有限公司',
    businessType: 'transport',
    version: 2,
    effectiveDate: '2026-04-15',
    expiryDate: '2026-07-15',
    currency: 'CNY',
    taxRate: 9,
    settlementCycle: 'monthly',
    status: 'pending',
    createTime: '2026-04-20 09:15:00',
    creator: '王五',
    reviewer: null,
    quoteDescription: '覆盖全国干线运输与区域配送的收入报价。',
    paymentTerms: '月结 45 天，需对账完成后开票。',
    performanceCycle: '正式确认后 5 个工作日启动承运资源配置。',
    afterSales: '运输异常全链路可视，重大延误 1 小时内同步。',
    responseStatus: 'pending',
    responseReason: '',
    lineItems: [
      { id: 21, feeName: '干线运输费', unit: '吨', quantity: 480, amount: 260, remark: '华东到华南主线路，含油价联动条款。', comments: [] },
      { id: 22, feeName: '区域配送费', unit: '票', quantity: 3600, amount: 22, remark: '电商零担配送，T+1 签收回传。', comments: [] }
    ],
    messages: [],
    logs: [
      { id: 30, time: '2026-04-20 09:15:00', operator: '王五', type: '创建', detail: '新建报价单 V2' },
      { id: 31, time: '2026-04-20 09:20:00', operator: '王五', type: '提交', detail: '提交审核，待审批中心处理' }
    ],
    h5: {
      token: buildToken('QT2026040002', 2),
      enabled: false,
      generatedAt: '',
      passwordEnabled: false,
      password: '',
      qrSeed: 'QT2026040002|2|KH002',
      branding: {
        companyName: '泓明供应链管理有限公司',
        logoText: 'HM',
        primaryColor: '#0f766e',
        secondaryColor: '#f97316',
        contactName: '王五',
        contactPhone: '138-0013-8002',
        contactEmail: 'wang.wu@hongming.com'
      }
    },
    analytics: {
      openCount: 0,
      totalViewSeconds: 0,
      lastViewedAt: '',
      events: []
    }
  },
  {
    id: 3,
    quotationNo: 'QT2026030003',
    customerId: 3,
    customerCode: 'KH003',
    customerName: '字节跳动科技有限公司',
    businessType: 'customs',
    version: 1,
    effectiveDate: '2026-03-01',
    expiryDate: '2026-04-30',
    currency: 'CNY',
    taxRate: 6,
    settlementCycle: 'quarterly',
    status: 'expired',
    createTime: '2026-02-20 16:45:00',
    creator: '赵六',
    reviewer: '孙经理',
    quoteDescription: '适用于跨境业务的关务与报关报价。',
    paymentTerms: '季度结算，先服务后开票。',
    performanceCycle: '业务确认后 2 个工作日进入关务预审。',
    afterSales: '提供专属关务经理与月度服务复盘。',
    responseStatus: 'rejected',
    responseReason: '客户认为有效期过短，且附加服务项说明不足。',
    lineItems: [
      { id: 31, feeName: '报关申报费', unit: '票', quantity: 120, amount: 180, remark: '一般贸易报关申报。', comments: [] },
      { id: 32, feeName: '查验协同服务费', unit: '次', quantity: 18, amount: 350, remark: '海关查验现场协同。', comments: [] }
    ],
    messages: [
      { id: 6, author: '字节采购-刘真', role: 'customer', content: '希望有效期可以覆盖整个财务季度，当前过期后不便内部审批。', createdAt: '2026-04-15 14:32:00' }
    ],
    logs: [
      { id: 40, time: '2026-02-20 16:45:00', operator: '赵六', type: '创建', detail: '新建关务报价单' },
      { id: 41, time: '2026-02-21 09:00:00', operator: '孙经理', type: '审核', detail: '审核通过并推送 H5 链接' },
      { id: 42, time: '2026-05-01 00:00:00', operator: '系统', type: '失效', detail: '报价单到期自动失效，禁止客户继续操作' }
    ],
    h5: {
      token: buildToken('QT2026030003', 1),
      enabled: true,
      generatedAt: '2026-02-21 09:05:00',
      passwordEnabled: true,
      password: 'BYTEDANCE66',
      qrSeed: 'QT2026030003|1|KH003',
      branding: {
        companyName: '泓明供应链管理有限公司',
        logoText: 'HM',
        primaryColor: '#111827',
        secondaryColor: '#ef4444',
        contactName: '赵六',
        contactPhone: '138-0013-8003',
        contactEmail: 'zhao.liu@hongming.com'
      }
    },
    analytics: {
      openCount: 3,
      totalViewSeconds: 286,
      lastViewedAt: '2026-04-15 14:30:00',
      events: [
        { id: 50, time: '2026-04-15 14:30:00', operator: '客户', type: '打开 H5', detail: '到期前再次查看正式报价' },
        { id: 51, time: '2026-04-15 14:32:00', operator: '客户', type: '驳回报价', detail: '反馈有效期不足和附加服务说明不清晰' }
      ]
    }
  }
])

export const businessTypeTextMap: Record<string, string> = {
  storage: '仓储服务',
  transport: '运输服务',
  customs: '关务服务',
  integrated: '综合物流'
}

export const statusTextMap: Record<QuotationStatus, string> = {
  draft: '草稿',
  pending: '审核中',
  approved: '审核通过',
  active: '生效',
  expired: '过期',
  cancelled: '作废'
}

export const statusTypeMap: Record<QuotationStatus, string> = {
  draft: 'info',
  pending: 'warning',
  approved: 'primary',
  active: 'success',
  expired: 'danger',
  cancelled: 'info'
}

export const responseStatusTextMap: Record<ResponseStatus, string> = {
  pending: '待客户处理',
  accepted: '已接受报价',
  rejected: '已驳回',
  negotiating: '沟通中'
}

export const responseStatusTypeMap: Record<ResponseStatus, string> = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'danger',
  negotiating: 'primary'
}

export const settlementCycleTextMap: Record<string, string> = {
  monthly: '月结',
  quarterly: '季度结',
  yearly: '年结',
  prepaid: '预付'
}

export const getQuotationById = (id: number | string) => quotationRecords.find(item => item.id === Number(id))

export const getQuotationByToken = (token: string) => quotationRecords.find(item => item.h5.token === token)

export const getQuotationPublicPath = (token: string) => `/quotation/h5/${token}`

export const getQuotationAmount = (quotation: QuotationRecord) => quotation.lineItems.reduce((sum, item) => sum + item.quantity * item.amount, 0)

export const isQuotationExpired = (quotation: QuotationRecord) => {
  if (quotation.status === 'expired') return true
  return dayjs(quotation.expiryDate).endOf('day').isBefore(dayjs())
}

export const publishQuotationH5 = (quotation: QuotationRecord, operator = '系统') => {
  quotation.status = isQuotationExpired(quotation) ? 'expired' : 'active'
  quotation.h5.enabled = true
  quotation.h5.generatedAt = nowText()
  quotation.reviewer = quotation.reviewer || operator
  quotation.logs.unshift(createEvent(operator, '发布', '审批正式通过后自动生成 H5 链接与二维码'))
  quotation.analytics.events.unshift(createEvent(operator, '系统动作', '已生成公开访问链接，支持客户在线处理'))
}

export const recordQuotationOpen = (token: string) => {
  const quotation = getQuotationByToken(token)
  if (!quotation) return
  quotation.analytics.openCount += 1
  quotation.analytics.lastViewedAt = nowText()
  quotation.analytics.events.unshift(createEvent('客户', '打开 H5', '客户打开了报价 H5 页面'))
}

export const recordQuotationViewDuration = (token: string, seconds: number) => {
  const quotation = getQuotationByToken(token)
  if (!quotation || seconds <= 0) return
  quotation.analytics.totalViewSeconds += Math.round(seconds)
}

export const acceptQuotation = (token: string) => {
  const quotation = getQuotationByToken(token)
  if (!quotation) return
  quotation.responseStatus = 'accepted'
  quotation.responseReason = ''
  quotation.analytics.events.unshift(createEvent('客户', '接受报价', '客户一键确认接受整单报价'))
  quotation.logs.unshift(createEvent('系统', '回执', '已回传客户接受回执至内部系统'))
}

export const rejectQuotation = (token: string, reason: string) => {
  const quotation = getQuotationByToken(token)
  if (!quotation) return
  quotation.responseStatus = 'rejected'
  quotation.responseReason = reason
  quotation.analytics.events.unshift(createEvent('客户', '驳回报价', `客户驳回报价，原因：${reason}`))
  quotation.logs.unshift(createEvent('系统', '回执', '已回传客户驳回原因至内部系统'))
}

export const addLineItemComment = (token: string, lineItemId: number, content: string, author = '客户', role: CommentRole = 'customer') => {
  const quotation = getQuotationByToken(token)
  const lineItem = quotation?.lineItems.find(item => item.id === lineItemId)
  if (!quotation || !lineItem) return
  lineItem.comments.push(createComment(author, role, content))
  quotation.responseStatus = role === 'customer' ? 'negotiating' : quotation.responseStatus
  quotation.analytics.events.unshift(createEvent(author, '明细评论', `${lineItem.feeName}：${content}`))
}

export const addConversationMessage = (token: string, content: string, author = '客户', role: CommentRole = 'customer') => {
  const quotation = getQuotationByToken(token)
  if (!quotation) return
  quotation.messages.push(createComment(author, role, content))
  quotation.responseStatus = role === 'customer' ? 'negotiating' : quotation.responseStatus
  quotation.analytics.events.unshift(createEvent(author, '在线留言', content))
}

export const buildQrMatrix = (seed: string, size = 13) => {
  return Array.from({ length: size }, (_, rowIndex) => {
    return Array.from({ length: size }, (_, colIndex) => {
      const seedCode = seed.charCodeAt((rowIndex * size + colIndex) % seed.length)
      const value = (seedCode + rowIndex * 7 + colIndex * 11) % 5
      const isFinder = (
        (rowIndex < 3 && colIndex < 3) ||
        (rowIndex < 3 && colIndex >= size - 3) ||
        (rowIndex >= size - 3 && colIndex < 3)
      )
      return isFinder || value <= 1
    })
  })
}
