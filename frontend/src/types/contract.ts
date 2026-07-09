export type ContractFileType = 'pdf' | 'docx' | 'image' | 'draft'
export type ContractStatus = '草稿' | '审批中' | '待签署' | '履行中' | '已完成' | '已归档' | '已作废'
export type ContractCategory = '采购合同' | '销售合同' | '服务合同' | '劳动合同' | '租赁合同' | '保密协议' | '其他'
export type RiskLevel = '高' | '中' | '低'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface ExtractedField {
  key: string
  label: string
  value: string
  editable: boolean
}

export interface ExtractPrompt {
  id: string
  name: string
  content: string
  isDefault: boolean
  fields: string[]
}

export interface RiskItem {
  id: string
  clause: string
  riskLevel: RiskLevel
  description: string
  suggestion: string
}

export interface ApprovalStep {
  id: string
  title: string
  assignee: string
  status: ApprovalStatus
  comment?: string
  timestamp?: number
}

export interface SignRecord {
  id: string
  partyName: string
  signer: string
  signDataUrl?: string
  signedAt?: number
  sealDataUrl?: string
}

export interface ObligationMilestone {
  id: string
  title: string
  dueDate?: number
  completed: boolean
  completedAt?: number
  party: string
  amount?: string
}

export interface ContractVersion {
  id: string
  version: number
  rawText: string
  createdAt: number
  description: string
}

export interface ContractTemplate {
  id: string
  name: string
  category: ContractCategory
  content: string
  fields: string[]
  createdAt: number
}

export interface Contract {
  id: string
  title: string
  category: ContractCategory
  fileName: string
  fileType: ContractFileType
  fileSize: number
  fileDataUrl: string
  rawText: string
  status: ContractStatus
  modelId: string
  promptId: string
  extractedFields: ExtractedField[]
  riskItems: RiskItem[]
  approvals: ApprovalStep[]
  signRecords: SignRecord[]
  obligations: ObligationMilestone[]
  versions: ContractVersion[]
  templateId: string
  startDate?: number
  endDate?: number
  amount?: string
  partyA?: string
  partyB?: string
  createdAt: number
  updatedAt: number
}

export const STATUS_FLOW: ContractStatus[] = ['草稿', '审批中', '待签署', '履行中', '已完成', '已归档']
export const STATUS_COLOR: Record<ContractStatus, string> = {
  '草稿': '#909399', '审批中': '#e6a23c', '待签署': '#409eff',
  '履行中': '#67c23a', '已完成': '#67c23a', '已归档': '#909399', '已作废': '#f56c6c'
}

export const CATEGORY_OPTIONS: ContractCategory[] = [
  '采购合同', '销售合同', '服务合同', '劳动合同', '租赁合同', '保密协议', '其他'
]

export const DEFAULT_EXTRACT_PROMPT: ExtractPrompt = {
  id: 'tpl_contract_default',
  name: '通用合同字段抽取',
  isDefault: true,
  fields: [
    'party_a', 'party_b', 'amount', 'currency',
    'start_date', 'end_date', 'payment_milestones',
    'breach_terms', 'subject', 'special_terms'
  ],
  content: `你是一名合同分析专家。请从以下合同文本中抽取结构化字段，严格以 JSON 格式返回。

要求返回的字段：
- 甲方名称 (party_a)
- 乙方名称 (party_b)
- 合同总金额 (amount)
- 币种 (currency)
- 合同起始日期 (start_date)
- 合同终止日期 (end_date)
- 付款节点及金额 (payment_milestones)
- 违约责任摘要 (breach_terms)
- 合同标的 (subject)
- 特殊条款摘要 (special_terms)

返回格式：
{"fields":[{"key":"party_a","label":"甲方名称","value":"..."},{"key":"party_b","label":"乙方名称","value":"..."}]}

仅返回 JSON，不要其他内容。`
}

export const RISK_ANALYSIS_PROMPT = `你是一名合同风险评估专家。请分析以下合同文本中的风险条款，严格以 JSON 格式返回。

关注以下风险维度：
- 违约责任不对等
- 付款条件模糊或不利
- 知识产权归属不清
- 保密条款缺失或不完善
- 不可抗力条款缺失
- 争议解决条款不利
- 合同期限与终止条款风险
- 税务条款风险
- 担保/保证条款风险
- 竞业限制风险

返回格式：
{"risks":[{"clause":"原条款引用","riskLevel":"高|中|低","description":"风险说明","suggestion":"修改建议"}]}

仅返回 JSON，不要其他内容。如果没有发现风险，返回空数组。`

export const DEFAULT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'tpl_采购合同',
    name: '采购合同',
    category: '采购合同',
    createdAt: Date.now(),
    fields: ['party_a', 'party_b', 'amount', 'start_date', 'end_date', 'payment_milestones', 'breach_terms'],
    content: `采购合同

甲方（买方）：______________
乙方（卖方）：______________

根据《中华人民共和国民法典》及相关法律法规，甲乙双方在平等、自愿、公平、诚实信用的原则基础上，经协商一致，就甲方向乙方采购相关产品/服务事宜，达成如下协议：

第一条 采购标的
1.1 甲方拟向乙方采购以下产品/服务：
（详细描述采购产品/服务的名称、规格、数量、质量标准等）

第二条 合同金额
2.1 本合同总金额为人民币______元（大写：______）。
2.2 上述价格为含税价格，包含运输、安装、调试等一切费用。

第三条 付款方式
3.1 本合同付款按以下节点执行：
（1）合同签订后____个工作日内，支付合同总价的____%，即人民币______元；
（2）货物交付验收合格后____个工作日内，支付合同总价的____%，即人民币______元；
（3）质保期满后____个工作日内，支付合同总价的____%，即人民币______元。

第四条 交货期限及方式
4.1 乙方应于____年____月____日前将全部货物交付至甲方指定地点。

第五条 质量标准及验收
5.1 乙方提供的产品/服务应符合国家相关质量标准及本合同约定的技术要求。

第六条 违约责任
6.1 乙方逾期交货的，每逾期一日，应向甲方支付逾期交货部分金额的____%作为违约金。
6.2 甲方逾期付款的，每逾期一日，应向乙方支付逾期付款金额的____%作为违约金。

第七条 不可抗力
7.1 因不可抗力导致本合同无法履行的，遭遇不可抗力的一方应在____日内书面通知对方，并提供相关证明。

第八条 争议解决
8.1 本合同履行过程中发生争议，双方应协商解决；协商不成的，提交____仲裁委员会仲裁。

第九条 合同期限
9.1 本合同自双方签字盖章之日起生效，有效期至____年____月____日。

第十条 其他约定
10.1 本合同一式____份，甲乙双方各执____份，具有同等法律效力。

甲方（盖章）：______________          乙方（盖章）：______________
法定代表人/授权代表：____________      法定代表人/授权代表：____________
日期：____年____月____日              日期：____年____月____日`
  },
  {
    id: 'tpl_服务合同',
    name: '服务合同',
    category: '服务合同',
    createdAt: Date.now(),
    fields: ['party_a', 'party_b', 'amount', 'start_date', 'end_date', 'subject', 'breach_terms'],
    content: `服务合同

甲方（委托方）：______________
乙方（受托方）：______________

根据《中华人民共和国民法典》及相关法律法规，甲乙双方经友好协商，就甲方委托乙方提供相关服务事宜，达成如下协议：

第一条 服务内容
1.1 乙方为甲方提供以下服务：
（详细描述服务内容、范围、标准等）

第二条 服务期限
2.1 服务期限自____年____月____日起至____年____月____日止。

第三条 服务费用
3.1 本合同服务费用总计人民币______元（大写：______）。

第四条 付款方式
4.1 甲方按以下方式向乙方支付服务费用：
（1）合同签订后____个工作日内支付____%；
（2）服务完成并经验收合格后____个工作日内支付____%。

第五条 双方权利义务
5.1 甲方应按约定及时提供乙方开展工作所需的资料和条件。
5.2 乙方应按照行业标准和合同约定提供高质量的服务。

第六条 保密条款
6.1 双方对在履行本合同过程中知悉的对方商业秘密和技术秘密负有保密义务。

第七条 知识产权
7.1 乙方在履行本合同过程中产生的成果，其知识产权归甲方所有。

第八条 违约责任
8.1 任何一方违反本合同约定的，应承担相应的违约责任。

第九条 争议解决
9.1 因本合同引起的争议，双方协商解决；协商不成的，提交____仲裁委员会仲裁。

甲方（盖章）：______________          乙方（盖章）：______________
日期：____年____月____日              日期：____年____月____日`
  },
  {
    id: 'tpl_保密协议',
    name: '保密协议',
    category: '保密协议',
    createdAt: Date.now(),
    fields: ['party_a', 'party_b', 'start_date', 'end_date'],
    content: `保密协议

甲方（披露方）：______________
乙方（接收方）：______________

鉴于双方拟就______项目进行合作，在合作过程中不可避免地会涉及双方的商业秘密和保密信息，为保护双方的合法权益，经协商一致，达成如下保密协议：

第一条 保密信息的定义
1.1 保密信息是指一方（披露方）向另一方（接收方）披露的与项目相关的非公开信息，包括但不限于技术资料、商业计划、客户信息、财务数据等。

第二条 保密义务
2.1 接收方应对保密信息严格保密，未经披露方书面同意，不得向任何第三方披露。
2.2 接收方仅限于为合作目的使用保密信息，不得用于其他用途。

第三条 保密期限
3.1 本协议自签署之日起生效，保密义务期限为自接收保密信息之日起____年。

第四条 例外情形
4.1 以下信息不属于保密信息：
（1）接收方在接收前已合法知悉的信息；
（2）已属公共领域的信息；
（3）接收方从合法渠道独立获取的信息。

第五条 违约责任
5.1 任何一方违反本协议约定，应赔偿因此给对方造成的全部损失。

第六条 争议解决
6.1 因本协议引起的争议，双方协商解决；协商不成的，提交____仲裁委员会仲裁。

甲方（盖章）：______________          乙方（盖章）：______________
日期：____年____月____日              日期：____年____月____日`
  }
]
