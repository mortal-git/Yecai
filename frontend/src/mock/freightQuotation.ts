import dayjs from 'dayjs'

// 货代报价 - 类型定义
export interface FreightAttachment {
  id: number
  name: string
  size: string
  uploader: string
  uploadTime: string
}

export interface FreightApprovalRecord {
  id: number
  stepName: string
  approver: string
  status: 'approved' | 'pending' | 'rejected'
  time: string
  comment: string
}

export interface FreightVersion {
  id: number
  round: number
  quotationName: string
  customerName: string
  entityName: string
  taxIncluded: boolean
  taxRate: number
  expiryDate: string
  declaration: string
  status: string
  updateTime: string
  operator: string
}

export interface FreightQuotation {
  id: number
  quotationNo: string
  quotationName: string
  customerName: string
  entityName: string
  taxIncluded: boolean
  taxRate: number
  round: number
  status: FreightStatus
  expiryDate: string
  declaration: string
  createTime: string
  creator: string
  attachments: FreightAttachment[]
  approvals: FreightApprovalRecord[]
  versions: FreightVersion[]
}

export type FreightStatus = 'draft' | 'approving' | 'active' | 'invalid'

// 泓明主体
export const hongmingEntities = [
  { id: 1, name: '泓明供应链管理有限公司' },
  { id: 2, name: '上海泓明国际物流有限公司' },
  { id: 3, name: '香港泓明物流有限公司' },
  { id: 4, name: '深圳泓明报关服务有限公司' }
]

// 客户目录
export const freightCustomers = [
  { id: 1, name: '浙江远洋进出口有限公司' },
  { id: 2, name: '广东华贸供应链有限公司' },
  { id: 3, name: '江苏恒通国际贸易有限公司' },
  { id: 4, name: '上海铭洲机电设备有限公司' }
]

// 报价状态
export const freightStatusTextMap: Record<FreightStatus, string> = {
  draft: '草稿',
  approving: '审批中',
  active: '已生效',
  invalid: '已失效'
}

export const freightStatusTypeMap: Record<FreightStatus, string> = {
  draft: 'info',
  approving: 'warning',
  active: 'success',
  invalid: 'danger'
}

// 根据是否含税推导税率（货代/物流现代服务 6%）
export const resolveTaxRate = (taxIncluded: boolean) => (taxIncluded ? 6 : 0)

// 生成报价单编号
export const generateFreightNo = () => {
  const seq = String(freightQuotationRecords.length + 1).padStart(4, '0')
  return `HD${dayjs().format('YYYYMMDD')}${seq}`
}

// 货代报价数据
export const freightQuotationRecords: FreightQuotation[] = [
  {
    id: 1,
    quotationNo: 'HD202608010001',
    quotationName: '2026年度海运费报价-浙江远洋',
    customerName: '浙江远洋进出口有限公司',
    entityName: '泓明供应链管理有限公司',
    taxIncluded: true,
    taxRate: 6,
    round: 2,
    status: 'active',
    expiryDate: '2026-12-31',
    declaration: '本报价适用于 2026 年度国际海运整箱（FCL）及拼箱（LCL）业务，含起运港操作费，不含目的港费用与关税。',
    createTime: '2026-08-01 10:20:00',
    creator: '王海峰',
    attachments: [
      { id: 1, name: '海运报价明细表.xlsx', size: '1.2MB', uploader: '王海峰', uploadTime: '2026-08-01 10:18:00' },
      { id: 2, name: '报价说明.pdf', size: '380KB', uploader: '王海峰', uploadTime: '2026-08-01 10:19:00' }
    ],
    approvals: [
      { id: 1, stepName: '提交审批', approver: '王海峰', status: 'approved', time: '2026-08-01 11:00:00', comment: '提交年度海运费报价' },
      { id: 2, stepName: '部门主管审批', approver: '李国强', status: 'approved', time: '2026-08-02 09:30:00', comment: '同意' },
      { id: 3, stepName: '总经理审批', approver: '赵明', status: 'approved', time: '2026-08-02 15:10:00', comment: '批准生效' }
    ],
    versions: [
      {
        id: 1,
        round: 1,
        quotationName: '2026年度海运费报价-浙江远洋',
        customerName: '浙江远洋进出口有限公司',
        entityName: '泓明供应链管理有限公司',
        taxIncluded: true,
        taxRate: 6,
        expiryDate: '2026-12-31',
        declaration: '本报价适用于 2026 年度国际海运整箱（FCL）业务。',
        status: 'active',
        updateTime: '2026-08-01 10:20:00',
        operator: '王海峰'
      },
      {
        id: 2,
        round: 2,
        quotationName: '2026年度海运费报价-浙江远洋',
        customerName: '浙江远洋进出口有限公司',
        entityName: '泓明供应链管理有限公司',
        taxIncluded: true,
        taxRate: 6,
        expiryDate: '2026-12-31',
        declaration: '本报价适用于 2026 年度国际海运整箱（FCL）及拼箱（LCL）业务，含起运港操作费，不含目的港费用与关税。',
        status: 'active',
        updateTime: '2026-08-15 14:00:00',
        operator: '王海峰'
      }
    ]
  },
  {
    id: 2,
    quotationNo: 'HD202609120001',
    quotationName: '华南区空运代理报价',
    customerName: '广东华贸供应链有限公司',
    entityName: '上海泓明国际物流有限公司',
    taxIncluded: true,
    taxRate: 6,
    round: 1,
    status: 'approving',
    expiryDate: '2027-03-31',
    declaration: '覆盖广州、深圳两地机场的空运出口代理服务，含报关、订舱与地面操作。',
    createTime: '2026-09-12 09:05:00',
    creator: '陈晓燕',
    attachments: [
      { id: 3, name: '空运代理报价单.xlsx', size: '960KB', uploader: '陈晓燕', uploadTime: '2026-09-12 09:00:00' }
    ],
    approvals: [
      { id: 4, stepName: '提交审批', approver: '陈晓燕', status: 'approved', time: '2026-09-12 09:30:00', comment: '提交空运代理报价' },
      { id: 5, stepName: '部门主管审批', approver: '李国强', status: 'pending', time: '', comment: '' }
    ],
    versions: [
      {
        id: 3,
        round: 1,
        quotationName: '华南区空运代理报价',
        customerName: '广东华贸供应链有限公司',
        entityName: '上海泓明国际物流有限公司',
        taxIncluded: true,
        taxRate: 6,
        expiryDate: '2027-03-31',
        declaration: '覆盖广州、深圳两地机场的空运出口代理服务，含报关、订舱与地面操作。',
        status: 'approving',
        updateTime: '2026-09-12 09:05:00',
        operator: '陈晓燕'
      }
    ]
  },
  {
    id: 3,
    quotationNo: 'HD202609200001',
    quotationName: '进口报关服务报价',
    customerName: '江苏恒通国际贸易有限公司',
    entityName: '深圳泓明报关服务有限公司',
    taxIncluded: false,
    taxRate: 0,
    round: 1,
    status: 'draft',
    expiryDate: '2027-09-20',
    declaration: '提供进口报关、报检、换单及仓储配套服务报价。',
    createTime: '2026-09-20 16:40:00',
    creator: '周敏',
    attachments: [],
    approvals: [],
    versions: [
      {
        id: 4,
        round: 1,
        quotationName: '进口报关服务报价',
        customerName: '江苏恒通国际贸易有限公司',
        entityName: '深圳泓明报关服务有限公司',
        taxIncluded: false,
        taxRate: 0,
        expiryDate: '2027-09-20',
        declaration: '提供进口报关、报检、换单及仓储配套服务报价。',
        status: 'draft',
        updateTime: '2026-09-20 16:40:00',
        operator: '周敏'
      }
    ]
  },
  {
    id: 4,
    quotationNo: 'HD202607150001',
    quotationName: '中欧铁路整柜运输报价',
    customerName: '上海铭洲机电设备有限公司',
    entityName: '泓明供应链管理有限公司',
    taxIncluded: true,
    taxRate: 6,
    round: 1,
    status: 'invalid',
    expiryDate: '2026-09-30',
    declaration: '中欧班列整柜运输服务报价，含提货、报关、集拼与境外派送。',
    createTime: '2026-07-15 11:10:00',
    creator: '王海峰',
    attachments: [
      { id: 5, name: '铁路运输报价单.pdf', size: '640KB', uploader: '王海峰', uploadTime: '2026-07-15 11:08:00' }
    ],
    approvals: [
      { id: 6, stepName: '提交审批', approver: '王海峰', status: 'approved', time: '2026-07-15 13:00:00', comment: '提交中欧铁路报价' },
      { id: 7, stepName: '部门主管审批', approver: '李国强', status: 'approved', time: '2026-07-16 10:20:00', comment: '同意' }
    ],
    versions: [
      {
        id: 5,
        round: 1,
        quotationName: '中欧铁路整柜运输报价',
        customerName: '上海铭洲机电设备有限公司',
        entityName: '泓明供应链管理有限公司',
        taxIncluded: true,
        taxRate: 6,
        expiryDate: '2026-09-30',
        declaration: '中欧班列整柜运输服务报价，含提货、报关、集拼与境外派送。',
        status: 'invalid',
        updateTime: '2026-07-15 11:10:00',
        operator: '王海峰'
      }
    ]
  }
]
