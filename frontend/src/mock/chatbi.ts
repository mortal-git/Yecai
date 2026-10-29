import type {
  AnalysisModel, MetricDictItem, AnalysisModelType, AnalysisPath
} from '../types/chatbi'

// 六大语义知识库（扩展字段：synonyms / businessRules / sqlTemplate / entities / relatedMetricCodes）
export const ANALYSIS_MODELS: AnalysisModel[] = [
  {
    type: 'revenue',
    name: '营收分析模型',
    desc: '主营/副业营收、区域营收、产品营收、月度/季度营收对比',
    icon: 'TrendCharts',
    dimensions: ['时间', '区域', '业务板块', '产品线', '渠道'],
    metrics: ['主营营收', '副业营收', '区域营收', '产品营收', '渠道营收'],
    priority: 1,
    examples: [
      '上个月各区域营收情况',
      '主营营收同比变化',
      'Q1 vs Q2 营收对比'
    ],
    synonyms: ['营收', '收入', '主营', '副业', '销售额', 'GMV', '应收', '营业额', '到账'],
    businessRules: [
      '营收含税',
      '副业不计入主营营收',
      '营收确认以出库签收为准'
    ],
    sqlTemplate: `SELECT
  {{dim}} AS dim_value,
  SUM(revenue_amount) / 10000 AS revenue,
  (SUM(revenue_amount) - SUM(prev_year_revenue)) / NULLIF(SUM(prev_year_revenue), 0) AS yoy,
  (SUM(revenue_amount) - SUM(prev_month_revenue)) / NULLIF(SUM(prev_month_revenue), 0) AS mom
FROM dws_revenue_monthly
WHERE billing_month BETWEEN '{{start}}' AND '{{end}}'
GROUP BY {{dim}}
ORDER BY revenue DESC;`,
    entities: {
      region: ['华南区', '华东区', '华北区', '西南区', '西北区', '东北区'],
      segment: ['主营业务', '副营业务'],
      channel: ['线上', '线下', '经销', '直营']
    },
    relatedMetricCodes: ['M1', 'M1-1', 'M1-2', 'M1-1-1', 'M1-1-2']
  },
  {
    type: 'cost',
    name: '成本费用分析模型',
    desc: '原材料成本、人工成本、运营成本、月度成本趋势',
    icon: 'Coin',
    dimensions: ['时间', '成本类型', '业务板块', '供应商'],
    metrics: ['原材料成本', '人工成本', '运营成本', '采购成本', '物流成本'],
    priority: 2,
    examples: [
      '近半年原材料成本趋势',
      '人工成本同比变化',
      '各业务板块成本占比'
    ],
    synonyms: ['成本', '费用', '原材料', '人工', '运营成本', '采购', '物流成本', '支出'],
    businessRules: [
      '成本不含税费',
      '人工成本含工资、福利、社保',
      '采购成本按入库时点确认'
    ],
    sqlTemplate: `SELECT
  billing_month AS month,
  cost_type,
  SUM(cost_amount) / 10000 AS cost
FROM dwd_cost_detail
WHERE billing_month BETWEEN '{{start}}' AND '{{end}}'
GROUP BY billing_month, cost_type
ORDER BY billing_month, cost_amount DESC;`,
    entities: {
      cost_type: ['原材料', '人工', '运营', '采购', '物流'],
      segment: ['主营业务', '副营业务']
    },
    relatedMetricCodes: ['M2', 'M2-1', 'M2-2', 'M2-1-1']
  },
  {
    type: 'profit',
    name: '毛利盈利分析模型',
    desc: '单品毛利、综合毛利率、毛利同比环比、毛利异常归因',
    icon: 'Money',
    dimensions: ['时间', '产品', '区域', '业务板块'],
    metrics: ['毛利额', '毛利率', '单品毛利', '综合毛利率'],
    priority: 3,
    examples: [
      '本月单品毛利排行',
      '毛利率环比变化',
      '毛利下滑的原因分析'
    ],
    synonyms: ['毛利', '毛利率', '盈利', '利润', '单品毛利', '净利'],
    businessRules: [
      '毛利 = 营收 - 直接成本',
      '毛利率 = 毛利 / 营收 × 100%',
      '直接成本不含期间费用'
    ],
    sqlTemplate: `SELECT
  {{dim}} AS dim_value,
  SUM(profit_amount) / 10000 AS profit,
  SUM(profit_amount) / NULLIF(SUM(revenue_amount), 0) AS profit_rate
FROM dwd_profit_detail
WHERE billing_month BETWEEN '{{start}}' AND '{{end}}'
GROUP BY {{dim}}
ORDER BY profit DESC;`,
    entities: {
      product: ['电子元器件', '机械配件', '办公用品', '包装材料'],
      region: ['华南区', '华东区', '华北区', '西南区', '西北区', '东北区']
    },
    relatedMetricCodes: ['M3', 'M3-1', 'M3-1-1']
  },
  {
    type: 'region',
    name: '区域业绩分析模型',
    desc: '各分公司/区域业绩、区域业绩排名、区域业绩对比',
    icon: 'Location',
    dimensions: ['时间', '区域', '分公司', '业务板块'],
    metrics: ['区域营收', '区域毛利', '区域成本', '区域业绩达成率'],
    priority: 4,
    examples: [
      '各区域营收排名',
      '华南vs华北业绩对比',
      '深圳分公司本月业绩'
    ],
    synonyms: ['区域', '华南', '华北', '华东', '西南', '西北', '东北', '分公司', '深圳', '北京', '上海', '业绩', '达成率'],
    businessRules: [
      '区域按销售大区划分',
      '业绩达成率 = 实际营收 / 目标营收',
      '分公司归属于所在大区'
    ],
    sqlTemplate: `SELECT
  region_name AS region,
  SUM(revenue_amount) / 10000 AS revenue,
  SUM(revenue_amount) / NULLIF(SUM(target_amount), 0) AS target_rate,
  SUM(profit_amount) / 10000 AS profit
FROM dws_revenue_monthly
WHERE billing_month BETWEEN '{{start}}' AND '{{end}}'
GROUP BY region_name
ORDER BY revenue DESC;`,
    entities: {
      region: ['华南区', '华东区', '华北区', '西南区', '西北区', '东北区'],
      branch: ['深圳分公司', '北京分公司', '上海分公司', '广州分公司', '成都分公司']
    },
    relatedMetricCodes: ['M1', 'M1-1-2', 'M3']
  },
  {
    type: 'product',
    name: '产品运营分析模型',
    desc: '产品销量、产品库存、产品周转、产品销量趋势',
    icon: 'Goods',
    dimensions: ['时间', '产品', '品类', '渠道'],
    metrics: ['产品销量', '产品库存', '周转率', '动销率', '退货率'],
    priority: 5,
    examples: [
      '近30天产品销量TOP10',
      '各品类销量占比',
      '库存周转率分析'
    ],
    synonyms: ['产品', '销量', '库存', '动销', '周转', '退货', 'SKU', '品类', '动销率'],
    businessRules: [
      '动销率 = 有销售SKU数 / 在库SKU数',
      '周转率 = 销售成本 / 平均库存',
      '退货率 = 退货单数 / 总单数'
    ],
    sqlTemplate: `SELECT
  category_name AS category,
  SUM(qty) AS qty,
  SUM(revenue_amount) / 10000 AS revenue,
  SUM(revenue_amount) / NULLIF(SUM(SUM(revenue_amount)) OVER (), 0) AS ratio
FROM dws_product_sales_monthly
WHERE billing_month BETWEEN '{{start}}' AND '{{end}}'
GROUP BY category_name
ORDER BY revenue DESC;`,
    entities: {
      category: ['电子元器件', '机械配件', '办公用品', '包装材料', '其他'],
      channel: ['线上', '线下', '经销', '直营']
    },
    relatedMetricCodes: ['M1', 'M3', 'M3-1']
  },
  {
    type: 'supply_chain',
    name: '供应链效率分析模型',
    desc: '交付效率、库存周转、供应链成本、供应链异常',
    icon: 'Van',
    dimensions: ['时间', '区域', '供应商', '物流方式'],
    metrics: ['交付准时率', '库存周转天数', '供应链成本率', '异常订单率'],
    priority: 6,
    examples: [
      '本月交付准时率',
      '库存周转天数趋势',
      '供应链成本占比'
    ],
    synonyms: ['供应链', '交付', '物流', '准时率', '周转天数', '供应商', '异常订单', '运输'],
    businessRules: [
      '准时率 = 准时交付单数 / 总单数',
      '周转天数 = 30 / 月周转率',
      '异常订单含延迟、破损、退货'
    ],
    sqlTemplate: `SELECT
  {{dim}} AS dim_value,
  SUM(CASE WHEN deliver_status = 'on_time' THEN 1 ELSE 0 END) / COUNT(*) AS on_time_rate,
  AVG(turnover_days) AS turnover_days,
  SUM(CASE WHEN is_abnormal = 1 THEN 1 ELSE 0 END) / COUNT(*) AS abnormal_rate
FROM dws_supply_chain
WHERE billing_month BETWEEN '{{start}}' AND '{{end}}'
GROUP BY {{dim}}
ORDER BY on_time_rate DESC;`,
    entities: {
      logistics: ['快递', '零担', '整车', '自提'],
      supplier: ['核心供应商', '备用供应商', '新供应商']
    },
    relatedMetricCodes: ['M4']
  }
]

// 指标知识库（节选示例）
export const METRIC_DICT: MetricDictItem[] = [
  // 一级指标
  { code: 'M1', name: '营收', level: 1, definition: '企业在一定时期内通过销售商品或提供服务取得的总收入', formula: '∑销售商品/服务收入', dimensions: ['时间', '区域', '业务板块', '产品品类'], sourceTable: 'dwd_revenue_detail', updateFreq: '日更', modelType: 'revenue' },
  { code: 'M2', name: '成本', level: 1, definition: '企业为取得收入而发生的各项成本费用总和', formula: '∑原材料+人工+运营成本', dimensions: ['时间', '成本类型', '业务板块'], sourceTable: 'dwd_cost_detail', updateFreq: '日更', modelType: 'cost' },
  { code: 'M3', name: '毛利', level: 1, definition: '营收减去直接成本后的余额', formula: '营收 - 直接成本', dimensions: ['时间', '产品', '区域'], sourceTable: 'dwd_profit_detail', updateFreq: '日更', modelType: 'profit' },
  { code: 'M4', name: '供应链效率', level: 1, definition: '供应链运营的综合效率指标', formula: '加权综合评分', dimensions: ['时间', '区域', '供应商'], sourceTable: 'dws_supply_chain', updateFreq: '日更', modelType: 'supply_chain' },
  // 二级指标
  { code: 'M1-1', name: '主营营收', level: 2, parent: 'M1', definition: '企业主营业务产生的收入', formula: '∑主营业务订单金额', dimensions: ['时间', '区域', '业务板块'], sourceTable: 'dwd_revenue_detail', updateFreq: '日更', modelType: 'revenue' },
  { code: 'M1-2', name: '副业营收', level: 2, parent: 'M1', definition: '企业非主营业务产生的收入', formula: '∑副业订单金额', dimensions: ['时间', '业务板块'], sourceTable: 'dwd_revenue_detail', updateFreq: '日更', modelType: 'revenue' },
  { code: 'M2-1', name: '原材料成本', level: 2, parent: 'M2', definition: '生产过程中耗用的原材料费用', formula: '∑原材料采购金额', dimensions: ['时间', '品类', '供应商'], sourceTable: 'dwd_cost_detail', updateFreq: '日更', modelType: 'cost' },
  { code: 'M2-2', name: '人工成本', level: 2, parent: 'M2', definition: '企业为员工支付的工资、福利等', formula: '∑工资+福利+社保', dimensions: ['时间', '部门'], sourceTable: 'dwd_cost_detail', updateFreq: '月更', modelType: 'cost' },
  { code: 'M3-1', name: '单品毛利', level: 2, parent: 'M3', definition: '单个SKU的毛利', formula: '单品营收 - 单品直接成本', dimensions: ['时间', '产品'], sourceTable: 'dwd_profit_detail', updateFreq: '日更', modelType: 'profit' },
  // 三级指标
  { code: 'M1-1-1', name: '月度主营营收', level: 3, parent: 'M1-1', definition: '按月统计的主营业务收入', formula: 'SUM(主营业务订单金额) WHERE 月份=指定月', dimensions: ['月份', '区域', '业务板块'], sourceTable: 'dws_revenue_monthly', updateFreq: '月更', modelType: 'revenue' },
  { code: 'M1-1-2', name: '区域主营营收', level: 3, parent: 'M1-1', definition: '按区域统计的主营业务收入', formula: 'SUM(主营业务订单金额) GROUP BY 区域', dimensions: ['月份', '区域'], sourceTable: 'dws_revenue_monthly', updateFreq: '月更', modelType: 'region' },
  { code: 'M2-1-1', name: '区域原材料成本', level: 3, parent: 'M2-1', definition: '按区域统计的原材料成本', formula: 'SUM(原材料采购金额) GROUP BY 区域', dimensions: ['月份', '区域', '品类'], sourceTable: 'dws_cost_monthly', updateFreq: '月更', modelType: 'cost' },
  { code: 'M3-1-1', name: '单品毛利率', level: 3, parent: 'M3-1', definition: '单个SKU的毛利率', formula: '单品毛利 / 单品营收 × 100%', dimensions: ['月份', '产品'], sourceTable: 'dws_profit_monthly', updateFreq: '月更', modelType: 'profit' }
]

// 追问标记词（含代词、承接词、范围切换词）
export const FOLLOWUP_MARKERS: string[] = [
  '那', '它', '这个', '上面', '刚才', '继续', '换成', '按', '看',
  '近一周呢', '上周呢', '上月呢', '去年呢', '换成成本', '按区域看',
  '具体', '详细', '拆解', '再'
]

// 通用枚举值映射（跨模型共用）
export const ENTITY_MAP: Record<string, string[]> = {
  region: ['华南区', '华东区', '华北区', '西南区', '西北区', '东北区'],
  segment: ['主营业务', '副营业务'],
  channel: ['线上', '线下', '经销', '直营'],
  category: ['电子元器件', '机械配件', '办公用品', '包装材料', '其他']
}

// 预置分析思路（用户可在 chart 下方切换或自定义）
export const ANALYSIS_PATHS: AnalysisPath[] = [
  { name: '维度归因', dimensions: ['区域', '产品', '业务板块'] },
  { name: '趋势外推', dimensions: ['时间'] },
  { name: '对比差异', dimensions: ['区域', '业务板块'] },
  { name: '结构占比', dimensions: ['品类', '渠道'] }
]

// 时间关键词提取（保留原工具函数，store 内部仍可使用）
export function parseTimeRange(query: string): { start: string; end: string; label: string } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  if (/近30天|近一个月|最近30天|本月/.test(query)) {
    const start = new Date(now)
    start.setDate(start.getDate() - 30)
    return {
      start: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-01`,
      end: `${year}-${String(month).padStart(2, '0')}-01`,
      label: '近30天'
    }
  }
  if (/近半年|近6个月|最近半年/.test(query)) {
    const startMonth = month - 6 <= 0 ? month + 6 : month - 6
    const startY = month - 6 <= 0 ? year - 1 : year
    return {
      start: `${startY}-${String(startMonth).padStart(2, '0')}-01`,
      end: `${year}-${String(month).padStart(2, '0')}-01`,
      label: '近半年'
    }
  }
  if (/近一年|近12个月|最近一年/.test(query)) {
    return {
      start: `${year - 1}-${String(month).padStart(2, '0')}-01`,
      end: `${year}-${String(month).padStart(2, '0')}-01`,
      label: '近一年'
    }
  }
  if (/Q1|一季度|第一季度/.test(query)) {
    return { start: `${year}-01-01`, end: `${year}-03-31`, label: 'Q1' }
  }
  if (/Q2|二季度|第二季度/.test(query)) {
    return { start: `${year}-04-01`, end: `${year}-06-30`, label: 'Q2' }
  }
  // 默认本月
  return {
    start: `${year}-${String(month).padStart(2, '0')}-01`,
    end: `${year}-${String(month).padStart(2, '0')}-31`,
    label: '本月'
  }
}

// 快捷提问示例
export const QUICK_QUESTIONS = [
  { icon: 'TrendCharts', text: '近半年营收、成本、毛利趋势分析' },
  { icon: 'Location', text: '本月各区域营收对比及目标达成情况' },
  { icon: 'Goods', text: '各品类营收占比分析' },
  { icon: 'Money', text: '本月毛利率变化及归因分析' },
  { icon: 'Coin', text: '近半年原材料成本趋势' },
  { icon: 'Van', text: '本月供应链交付准时率与异常订单' }
]
