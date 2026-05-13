import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('../layout/Layout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '首页', icon: 'House' }
      },
      // 订单管理模块
      {
        path: 'order',
        name: 'Order',
        meta: { title: '订单管理', icon: 'Document' },
        children: [
          {
            path: 'list',
            name: 'OrderList',
            component: () => import('../views/order/List.vue'),
            meta: { title: '订单列表' }
          },
          {
            path: 'create',
            name: 'OrderCreate',
            component: () => import('../views/order/Create.vue'),
            meta: { title: '新增订单' }
          },
          {
            path: 'detail/:id',
            name: 'OrderDetail',
            component: () => import('../views/order/Detail.vue'),
            meta: { title: '订单详情' }
          },
          {
            path: 'cos',
            name: 'OrderCos',
            component: () => import('../views/order/Cos.vue'),
            meta: { title: '账单主体' }
          }
        ]
      },
      // 发票管理模块
      {
        path: 'invoice',
        name: 'Invoice',
        meta: { title: '发票管理', icon: 'Ticket' },
        children: [
          {
            path: 'list',
            name: 'InvoiceList',
            component: () => import('../views/invoice/List.vue'),
            meta: { title: '发票列表' }
          },
          {
            path: 'create',
            name: 'InvoiceCreate',
            component: () => import('../views/invoice/Create.vue'),
            meta: { title: '新增发票' }
          },
          {
            path: 'edit/:id',
            name: 'InvoiceEdit',
            component: () => import('../views/invoice/Create.vue'),
            meta: { title: '编辑发票' }
          },
          {
            path: 'detail/:id',
            name: 'InvoiceDetail',
            component: () => import('../views/invoice/Detail.vue'),
            meta: { title: '发票详情' }
          },
          {
            path: 'import',
            name: 'InvoiceImport',
            component: () => import('../views/invoice/Import.vue'),
            meta: { title: '批量导入' }
          }
        ]
      },
      // 应收管理模块
      {
        path: 'receivable',
        name: 'Receivable',
        meta: { title: '应收管理', icon: 'Money' },
        children: [
          {
            path: 'list',
            name: 'ReceivableList',
            component: () => import('../views/receivable/List.vue'),
            meta: { title: '应收单列表' }
          },
          {
            path: 'revenue-detail',
            name: 'RevenueDetail',
            component: () => import('../views/receivable/RevenueDetail.vue'),
            meta: { title: '收入明细' }
          },
          {
            path: 'create',
            name: 'ReceivableCreate',
            component: () => import('../views/receivable/Create.vue'),
            meta: { title: '新增应收单' }
          },
          {
            path: 'collection',
            name: 'ReceivableCollection',
            component: () => import('../views/receivable/Collection.vue'),
            meta: { title: '收款管理' }
          },
          {
            path: 'aging',
            name: 'ReceivableAging',
            component: () => import('../views/receivable/Aging.vue'),
            meta: { title: '账龄分析' }
          },
          {
            path: 'detail/:id',
            name: 'ReceivableDetail',
            component: () => import('../views/receivable/Detail.vue'),
            meta: { title: '应收单详情' }
          }
        ]
      },
      // 应付管理模块
      {
        path: 'payable',
        name: 'Payable',
        meta: { title: '应付管理', icon: 'Wallet' },
        children: [
          {
            path: 'list',
            name: 'PayableList',
            component: () => import('../views/payable/List.vue'),
            meta: { title: '应付单列表' }
          },
          {
            path: 'create',
            name: 'PayableCreate',
            component: () => import('../views/payable/Create.vue'),
            meta: { title: '新增应付单' }
          },
          {
            path: 'payment',
            name: 'PayablePayment',
            component: () => import('../views/payable/Payment.vue'),
            meta: { title: '付款管理' }
          },
          {
            path: 'aging',
            name: 'PayableAging',
            component: () => import('../views/payable/Aging.vue'),
            meta: { title: '账龄分析' }
          },
          {
            path: 'detail/:id',
            name: 'PayableDetail',
            component: () => import('../views/payable/Detail.vue'),
            meta: { title: '应付单详情' }
          },
          {
            path: 'monthly',
            name: 'CostMonthly',
            component: () => import('../views/cost/Monthly.vue'),
            meta: { title: '月结成本' }
          },
          {
            path: 'monthly/create',
            name: 'CostMonthlyCreate',
            component: () => import('../views/cost/MonthlyCreate.vue'),
            meta: { title: '新增月结成本' }
          },
          {
            path: 'monthly/edit/:id',
            name: 'CostMonthlyEdit',
            component: () => import('../views/cost/MonthlyCreate.vue'),
            meta: { title: '编辑月结成本' }
          },
          {
            path: 'prepayment',
            name: 'CostPrepayment',
            component: () => import('../views/cost/Prepayment.vue'),
            meta: { title: '预付成本' }
          },
          {
            path: 'prepayment/create',
            name: 'CostPrepaymentCreate',
            component: () => import('../views/cost/PrepaymentCreate.vue'),
            meta: { title: '新增预付款申请' }
          },
          {
            path: 'prepayment/edit/:id',
            name: 'CostPrepaymentEdit',
            component: () => import('../views/cost/PrepaymentCreate.vue'),
            meta: { title: '编辑预付款申请' }
          },
          {
            path: 'advance',
            name: 'CostAdvance',
            component: () => import('../views/cost/Advance.vue'),
            meta: { title: '垫付成本' }
          },
          {
            path: 'advance/create',
            name: 'CostAdvanceCreate',
            component: () => import('../views/cost/AdvanceCreate.vue'),
            meta: { title: '新增垫付申请' }
          },
          {
            path: 'advance/edit/:id',
            name: 'CostAdvanceEdit',
            component: () => import('../views/cost/AdvanceCreate.vue'),
            meta: { title: '编辑垫付申请' }
          }
        ]
      },
      // 对账单管理模块
      {
        path: 'statement',
        name: 'Statement',
        meta: { title: '对账单管理', icon: 'List' },
        children: [
          {
            path: 'list',
            name: 'StatementList',
            component: () => import('../views/statement/List.vue'),
            meta: { title: '对账单列表' }
          },
          {
            path: 'create',
            name: 'StatementCreate',
            component: () => import('../views/statement/Create.vue'),
            meta: { title: '生成对账单' }
          },
          {
            path: 'detail/:id',
            name: 'StatementDetail',
            component: () => import('../views/statement/Detail.vue'),
            meta: { title: '对账单详情' }
          }
        ]
      },
      // 预算管理模块
      {
        path: 'budget',
        name: 'Budget',
        meta: { title: '预算管理', icon: 'TrendCharts' },
        children: [
          {
            path: 'list',
            name: 'BudgetList',
            component: () => import('../views/budget/List.vue'),
            meta: { title: '预算列表' }
          },
          {
            path: 'create',
            name: 'BudgetCreate',
            component: () => import('../views/budget/Create.vue'),
            meta: { title: '预算编制' }
          },
          {
            path: 'analysis',
            name: 'BudgetAnalysis',
            component: () => import('../views/budget/Analysis.vue'),
            meta: { title: '预算分析' }
          }
        ]
      },
      // 统计分析模块
      {
        path: 'statistics',
        name: 'Statistics',
        meta: { title: '统计分析', icon: 'PieChart' },
        children: [
          {
            path: 'receivable',
            name: 'StatisticsReceivable',
            component: () => import('../views/statistics/Receivable.vue'),
            meta: { title: '应收报表' }
          },
          {
            path: 'payable',
            name: 'StatisticsPayable',
            component: () => import('../views/statistics/Payable.vue'),
            meta: { title: '应付报表' }
          },
          {
            path: 'cost',
            name: 'StatisticsCost',
            component: () => import('../views/statistics/Cost.vue'),
            meta: { title: '成本报表' }
          },
          {
            path: 'order',
            name: 'StatisticsOrder',
            component: () => import('../views/statistics/Order.vue'),
            meta: { title: '订单报表' }
          },
          {
            path: 'invoice',
            name: 'StatisticsInvoice',
            component: () => import('../views/statistics/Invoice.vue'),
            meta: { title: '发票报表' }
          },
          {
            path: 'payment',
            name: 'StatisticsPayment',
            component: () => import('../views/statistics/Payment.vue'),
            meta: { title: '收付款报表' }
          },
          {
            path: 'aitable',
            name: 'AITable',
            component: () => import('../views/statistics/AITable.vue'),
            meta: { title: 'AI表格' }
          }
        ]
      },
      // 基础设置模块
      {
        path: 'setting',
        name: 'Setting',
        meta: { title: '基础设置', icon: 'Setting' },
        children: [
          {
            path: 'subject',
            name: 'SettingSubject',
            component: () => import('../views/setting/Subject.vue'),
            meta: { title: '科目设置' }
          },
          {
            path: 'flow',
            name: 'SettingFlow',
            component: () => import('../views/setting/Flow.vue'),
            meta: { title: '审批流程' }
          },
          {
            path: 'expense',
            name: 'SettingExpense',
            component: () => import('../views/setting/Expense.vue'),
            meta: { title: '费用类型' }
          },
          {
            path: 'customer',
            name: 'SettingCustomer',
            component: () => import('../views/setting/Customer.vue'),
            meta: { title: '客户档案' }
          },
          {
            path: 'supplier',
            name: 'SettingSupplier',
            component: () => import('../views/setting/Supplier.vue'),
            meta: { title: '供应商档案' }
          },
          {
            path: 'employee',
            name: 'SettingEmployee',
            component: () => import('../views/setting/Employee.vue'),
            meta: { title: '员工档案' }
          }
        ]
      },
      // 报价管理模块
      {
        path: 'quotation',
        name: 'Quotation',
        meta: { title: '报价管理', icon: 'PriceTag' },
        children: [
          {
            path: 'customer',
            name: 'QuotationCustomer',
            component: () => import('../views/quotation/Customer.vue'),
            meta: { title: '客户收入报价' }
          },
          {
            path: 'supplier',
            name: 'QuotationSupplier',
            component: () => import('../views/quotation/Supplier.vue'),
            meta: { title: '供应商成本报价' }
          },
          {
            path: 'history/:id',
            name: 'QuotationHistory',
            component: () => import('../views/quotation/History.vue'),
            meta: { title: '报价版本历史' }
          }
        ]
      },
      // 费用规则引擎模块
      {
        path: 'ruleEngine',
        name: 'RuleEngine',
        meta: { title: '费用规则引擎', icon: 'Setting' },
        children: [
          {
            path: 'list',
            name: 'RuleEngineList',
            component: () => import('../views/ruleEngine/List.vue'),
            meta: { title: '规则列表' }
          },
          {
            path: 'create',
            name: 'RuleEngineCreate',
            component: () => import('../views/ruleEngine/Create.vue'),
            meta: { title: '新建规则' }
          },
          {
            path: 'edit/:id',
            name: 'RuleEngineEdit',
            component: () => import('../views/ruleEngine/Create.vue'),
            meta: { title: '编辑规则' }
          },
          {
            path: 'version/:id',
            name: 'RuleEngineVersion',
            component: () => import('../views/ruleEngine/Version.vue'),
            meta: { title: '规则版本管理' }
          },
          {
            path: 'trial',
            name: 'RuleEngineTrial',
            component: () => import('../views/ruleEngine/Trial.vue'),
            meta: { title: '规则试算' }
          }
        ]
      },
      // 单据引擎模块
      {
        path: 'document',
        name: 'Document',
        meta: { title: '单据引擎', icon: 'DocumentCopy' },
        children: [
          {
            path: 'interface',
            name: 'DocumentInterface',
            component: () => import('../views/document/Interface.vue'),
            meta: { title: '接口配置' }
          },
          {
            path: 'log',
            name: 'DocumentLog',
            component: () => import('../views/document/Log.vue'),
            meta: { title: '对接日志' }
          },
          {
            path: 'exception',
            name: 'DocumentException',
            component: () => import('../views/document/Exception.vue'),
            meta: { title: '异常单据' }
          },
          {
            path: 'trace/:id',
            name: 'DocumentTrace',
            component: () => import('../views/document/Trace.vue'),
            meta: { title: '单据溯源' }
          }
        ]
      },
      // 费率单管理模块
      {
        path: 'rateSheet',
        name: 'RateSheet',
        meta: { title: '费率单管理', icon: 'Tickets' },
        children: [
          {
            path: 'list',
            name: 'RateSheetList',
            component: () => import('../views/rateSheet/List.vue'),
            meta: { title: '费率单列表' }
          },
          {
            path: 'create',
            name: 'RateSheetCreate',
            component: () => import('../views/rateSheet/Create.vue'),
            meta: { title: '新建费率单' }
          },
          {
            path: 'detail/:id',
            name: 'RateSheetDetail',
            component: () => import('../views/rateSheet/Detail.vue'),
            meta: { title: '费率单详情' }
          },
          {
            path: 'compare',
            name: 'RateSheetCompare',
            component: () => import('../views/rateSheet/Compare.vue'),
            meta: { title: '收支对比' }
          }
        ]
      },
      // 系统管理模块
      {
        path: 'system',
        name: 'System',
        meta: { title: '系统管理', icon: 'Tools' },
        children: [
          {
            path: 'user',
            name: 'SystemUser',
            component: () => import('../views/system/User.vue'),
            meta: { title: '用户管理' }
          },
          {
            path: 'role',
            name: 'SystemRole',
            component: () => import('../views/system/Role.vue'),
            meta: { title: '角色管理' }
          },
          {
            path: 'permission',
            name: 'SystemPermission',
            component: () => import('../views/system/Permission.vue'),
            meta: { title: '权限管理' }
          },
          {
            path: 'log',
            name: 'SystemLog',
            component: () => import('../views/system/Log.vue'),
            meta: { title: '操作日志' }
          }
        ]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/404.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title} - 业财管理系统`

  // 检查登录状态 (已禁用登录验证)
  // const token = localStorage.getItem('token')
  // if (to.meta.requiresAuth && !token) {
  //   next('/login')
  // } else {
  //   next()
  // }
  next()
})

export default router
