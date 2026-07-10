<template>
  <div class="layout-container">
    <el-container style="height: 100vh; border: 1px solid #eee">
      <!-- 侧边栏 -->
      <el-aside width="250px" style="background-color: #fff;">
        <div class="logo" style="background-color: #409eff;">
          <h2>业财管理系统</h2>
        </div>
        <el-menu
          :default-active="$route.path"
          class="el-menu-vertical-demo"
          :collapse="isCollapse"
          background-color="#ffffff"
          text-color="#303133"
          active-text-color="#409eff"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/dashboard">
            <el-icon><House /></el-icon>
            <template #title>首页</template>
          </el-menu-item>

          <el-sub-menu index="agent">
            <template #title>
              <el-icon><MagicStick /></el-icon>
              <span>智能体</span>
            </template>
            <el-menu-item index="/agent">对话工作台</el-menu-item>
            <el-menu-item index="/agent/models">模型配置</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="contract">
            <template #title>
              <el-icon><Notebook /></el-icon>
              <span>合同管理</span>
            </template>
            <el-menu-item index="/contract/list">合同列表</el-menu-item>
            <el-menu-item index="/contract/draft">起草拟定</el-menu-item>
            <el-menu-item index="/contract/upload">合同上传</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="quotation">
            <template #title>
              <el-icon><PriceTag /></el-icon>
              <span>报价管理</span>
            </template>
            <el-menu-item index="/quotation/customer">客户收入报价</el-menu-item>
            <el-menu-item index="/quotation/supplier">供应商成本报价</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="ruleEngine">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>费用规则引擎</span>
            </template>
            <el-menu-item index="/ruleEngine/list">规则列表</el-menu-item>
            <el-menu-item index="/ruleEngine/create">新建规则</el-menu-item>
            <el-menu-item index="/ruleEngine/trial">规则试算</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="document">
            <template #title>
              <el-icon><DocumentCopy /></el-icon>
              <span>单据引擎</span>
            </template>
            <el-menu-item index="/document/interface">接口配置</el-menu-item>
            <el-menu-item index="/document/log">对接日志</el-menu-item>
            <el-menu-item index="/document/exception">异常单据</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="rateSheet">
            <template #title>
              <el-icon><Tickets /></el-icon>
              <span>费率单管理</span>
            </template>
            <el-menu-item index="/rateSheet/list">费率单列表</el-menu-item>
            <el-menu-item index="/rateSheet/create">新建费率单</el-menu-item>
            <el-menu-item index="/rateSheet/compare">收支对比</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="order">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>订单管理</span>
            </template>
            <el-menu-item index="/order/list">订单列表</el-menu-item>
            <el-menu-item index="/order/create">新增订单</el-menu-item>
            <el-menu-item index="/order/cos">账单主体</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="invoice">
            <template #title>
              <el-icon><Ticket /></el-icon>
              <span>发票管理</span>
            </template>
            <el-menu-item index="/invoice/list">发票列表</el-menu-item>
            <el-menu-item index="/invoice/create">新增发票</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="receivable">
            <template #title>
              <el-icon><Money /></el-icon>
              <span>应收管理</span>
            </template>
            <el-menu-item index="/receivable/list">应收列表</el-menu-item>
            <el-menu-item index="/receivable/revenue-detail">应收收入明细</el-menu-item>
            <el-menu-item index="/receivable/order-revenue-detail">订单收入明细</el-menu-item>
            <el-menu-item index="/receivable/split-allocation">拆单均摊明细</el-menu-item>
            <el-menu-item index="/receivable/aging">账龄分析</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="payable">
            <template #title>
              <el-icon><Wallet /></el-icon>
              <span>应付管理</span>
            </template>
            <el-menu-item index="/payable/list">应付单列表</el-menu-item>
            <el-menu-item index="/payable/cost-detail">应付成本明细</el-menu-item>
            <el-menu-item index="/payable/aging">账龄分析</el-menu-item>
            <el-menu-item index="/payable/monthly">月结成本</el-menu-item>
            <el-menu-item index="/payable/prepayment">预付成本</el-menu-item>
            <el-menu-item index="/payable/advance">垫付成本</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="statement">
            <template #title>
              <el-icon><List /></el-icon>
              <span>对账单管理</span>
            </template>
            <el-menu-item index="/statement/list">对账单列表</el-menu-item>
            <el-menu-item index="/statement/create">生成对账单</el-menu-item>
            <el-menu-item index="/statement/payable">应付对账单</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="fund">
            <template #title>
              <el-icon><Coin /></el-icon>
              <span>资金管理</span>
            </template>
            <el-menu-item index="/fund/collection">收款管理</el-menu-item>
            <el-menu-item index="/fund/payment">付款管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="budget">
            <template #title>
              <el-icon><TrendCharts /></el-icon>
              <span>预算管理</span>
            </template>
            <el-menu-item index="/budget/list">预算列表</el-menu-item>
            <el-menu-item index="/budget/analysis">预算分析</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="statistics">
            <template #title>
              <el-icon><PieChart /></el-icon>
              <span>统计分析</span>
            </template>
            <el-menu-item index="/statistics/receivable">应收报表</el-menu-item>
            <el-menu-item index="/statistics/payable">应付报表</el-menu-item>
            <el-menu-item index="/statistics/cost">成本报表</el-menu-item>
            <el-menu-item index="/statistics/order">订单报表</el-menu-item>
            <el-menu-item index="/statistics/invoice">发票报表</el-menu-item>
            <el-menu-item index="/statistics/payment">收付款报表</el-menu-item>
            <el-menu-item index="/statistics/aitable">AI表格</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="setting">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>基础设置</span>
            </template>
            <el-menu-item index="/setting/subject">科目设置</el-menu-item>
            <el-menu-item index="/setting/flow">审批流程</el-menu-item>
            <el-menu-item index="/setting/expense">费用类型</el-menu-item>
            <el-menu-item index="/setting/customer">客户档案</el-menu-item>
            <el-menu-item index="/setting/supplier">供应商档案</el-menu-item>
            <el-menu-item index="/setting/employee">员工档案</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="system">
            <template #title>
              <el-icon><Tools /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/system/user">用户管理</el-menu-item>
            <el-menu-item index="/system/role">角色管理</el-menu-item>
            <el-menu-item index="/system/permission">权限管理</el-menu-item>
            <el-menu-item index="/system/log">操作日志</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <el-container>
        <!-- 顶部导航 -->
        <el-header style="text-align: right; font-size: 12px">
          <div class="header-content">
            <el-button
              link
              icon="Expand"
              @click="isCollapse = !isCollapse"
              style="margin-right: 20px"
            />
            <div class="header-right">
              <el-badge :value="5" class="item">
                <el-button link icon="Bell" @click="showMessageCenter = true" />
              </el-badge>
              <el-dropdown>
                <span class="el-dropdown-link">
                  <el-icon><User /></el-icon>
                  {{ username }}
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>个人信息</el-dropdown-item>
                    <el-dropdown-item>修改密码</el-dropdown-item>
                    <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>

        <!-- 主内容区域 -->
        <el-main>
          <!-- 面包屑 -->
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.path" :to="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>

          <!-- 页面内容 -->
          <router-view />
        </el-main>
      </el-container>
    </el-container>

    <!-- 消息中心抽屉 -->
    <el-drawer
      v-model="showMessageCenter"
      title="消息中心"
      size="400px"
    >
      <template #default>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="待办消息" name="todo">
            <div class="message-list">
              <div v-for="msg in todoMessages" :key="msg.id" class="message-item">
                <el-badge is-dot />
                <span class="msg-content">{{ msg.content }}</span>
                <span class="msg-time">{{ msg.time }}</span>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="系统通知" name="notice">
            <div class="message-list">
              <div v-for="msg in noticeMessages" :key="msg.id" class="message-item">
                <span class="msg-content">{{ msg.content }}</span>
                <span class="msg-time">{{ msg.time }}</span>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  House,
  Document,
  DocumentCopy,
  Ticket,
  Money,
  Wallet,
  Coin,
  List,
  TrendCharts,
  PieChart,
  Setting,
  Tools,
  User,
  ArrowDown,
  Bell,
  Expand,
  PriceTag,
  Tickets,
  MagicStick,
  Notebook
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const isCollapse = ref(false)
const username = ref('管理员')
const showMessageCenter = ref(false)
const activeTab = ref('todo')

// 待办消息
const todoMessages = ref([
  { id: 1, content: '有3个订单待审核', time: '10分钟前' },
  { id: 2, content: '有5张发票待认证', time: '30分钟前' },
  { id: 3, content: '有2笔付款申请待审批', time: '1小时前' },
  { id: 4, content: '10个对账单待发送', time: '2小时前' },
  { id: 5, content: '3笔应收款即将逾期', time: '3小时前' }
])

// 系统通知
const noticeMessages = ref([
  { id: 1, content: '系统将于本周日00:00-06:00进行维护', time: '1天前' },
  { id: 2, content: '发票查验接口已升级，支持批量查验', time: '2天前' },
  { id: 3, content: '新功能"对账单自动发送"已上线', time: '3天前' }
])

// 面包屑导航
const breadcrumbList = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.slice(1).map(item => ({
    path: item.path,
    title: item.meta.title as string
  }))
})

// 退出登录
const logout = () => {
  localStorage.removeItem('token')
  ElMessage.success('退出登录成功')
  router.push('/login')
}

// 菜单跳转
const handleMenuSelect = (index: string) => {
  console.log('点击菜单:', index)
  // 如果是路径直接跳转
  if (index && index.startsWith('/')) {
    router.push(index)
  }
  // 父菜单跳转默认第一个子页面
  else if (index === 'quotation') {
    router.push('/quotation/customer')
  } else if (index === 'agent') {
    router.push('/agent')
  } else if (index === 'contract') {
    router.push('/contract/list')
  } else if (index === 'ruleEngine') {
    router.push('/ruleEngine/list')
  } else if (index === 'document') {
    router.push('/document/interface')
  } else if (index === 'rateSheet') {
    router.push('/rateSheet/list')
  } else if (index === 'order') {
    router.push('/order/list')
  } else if (index === 'invoice') {
    router.push('/invoice/list')
  } else if (index === 'receivable') {
    router.push('/receivable/list')
  } else if (index === 'payable') {
    router.push('/payable/list')
  } else if (index === 'fund') {
    router.push('/fund/collection')
  } else if (index === 'statement') {
    router.push('/statement/list')
  } else if (index === 'budget') {
    router.push('/budget/list')
  } else if (index === 'statistics') {
    router.push('/statistics/receivable')
  } else if (index === 'setting') {
    router.push('/setting/subject')
  } else if (index === 'system') {
    router.push('/system/user')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  overflow: hidden;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #e4e7ed;
}

.el-aside {
  background-color: #fff;
  color: #303133;
  text-align: center;
  line-height: 60px;
  border-right: 1px solid #e4e7ed;
}

.el-menu-vertical-demo {
  border-right: none;
  background-color: #fff;
}

.el-menu-vertical-demo .el-menu-item,
.el-menu-vertical-demo .el-sub-menu__title {
  color: #303133;
}

.el-menu-vertical-demo .el-menu-item:hover,
.el-menu-vertical-demo .el-sub-menu__title:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.el-menu-vertical-demo .el-menu-item.is-active {
  background-color: #ecf5ff;
  color: #409eff;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 5px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.el-main {
  background-color: #f5f7fa;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.msg-content {
  flex: 1;
  margin-left: 10px;
}

.msg-time {
  color: #909399;
  font-size: 12px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.message-item:last-child {
  border-bottom: none;
}
</style>
