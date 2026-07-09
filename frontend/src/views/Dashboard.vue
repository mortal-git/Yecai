<template>
  <div class="dashboard-container">
    <!-- Header Section -->
    <div class="dashboard-header" :class="{ 'animate-in': mounted }">
      <div class="header-content">
        <div class="greeting">
          <h1>数据驾驶舱</h1>
          <p>实时业务洞察 · 智能决策支持</p>
        </div>
        <div class="header-meta">
          <div class="date-display">{{ currentDate }}</div>
          <div class="live-indicator">
            <span class="pulse"></span>
            <span>实时更新</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid" :class="{ 'animate-in': mounted }">
      <div
        v-for="(stat, index) in statsData"
        :key="stat.label"
        class="stat-card"
        :class="[stat.color, { 'animate-in': mounted }]"
        :style="{ animationDelay: `${index * 100}ms` }"
      >
        <div class="stat-card-bg"></div>
        <div class="stat-header">
          <div class="stat-icon" v-html="stat.icon"></div>
          <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path
                :d="stat.trend > 0 ? 'M6 2L10 7H2L6 2Z' : 'M6 10L2 5H10L6 10Z'"
                fill="currentColor"
              />
            </svg>
            {{ Math.abs(stat.trend) }}%
          </div>
        </div>
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
        <div class="stat-meta">
          <span class="stat-compare">较上月 {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%</span>
          <span class="stat-target">目标完成 {{ stat.progress }}%</span>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid" :class="{ 'animate-in': mounted }">
      <!-- Payment Trends Chart -->
      <div class="panel trends-panel" :class="{ 'animate-in': mounted }">
        <div class="panel-header">
          <div class="panel-title">
            <h3>收付款趋势</h3>
            <span class="panel-subtitle">最近7天数据对比</span>
          </div>
          <div class="panel-controls">
            <div class="toggle-group">
              <button :class="{ active: trendType === 'amount' }" @click="trendType = 'amount'">金额</button>
              <button :class="{ active: trendType === 'count' }" @click="trendType = 'count'">笔数</button>
            </div>
          </div>
        </div>
        <div class="panel-content">
          <div ref="trendChartRef" class="chart-container"></div>
        </div>
      </div>

      <!-- Todo List -->
      <div class="panel todo-panel" :class="{ 'animate-in': mounted }">
        <div class="panel-header">
          <div class="panel-title">
            <h3>待办事项</h3>
            <span class="badge">{{ todoList.length }} 待处理</span>
          </div>
        </div>
        <div class="panel-content">
          <div class="todo-list">
            <div
              v-for="(item, index) in todoList"
              :key="item.id"
              class="todo-item"
              :class="{ unread: !item.isRead, high: item.priority === 'high' }"
              :style="{ animationDelay: `${index * 80}ms` }"
            >
              <div class="todo-indicator">
                <span class="indicator-dot"></span>
              </div>
              <div class="todo-info">
                <div class="todo-title">{{ item.title }}</div>
                <div class="todo-desc">{{ item.desc }}</div>
              </div>
              <button class="todo-action" @click="handleTodo(item)">
                {{ item.actionText }}
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path d="M4 2L8 6L4 10" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-grid" :class="{ 'animate-in': mounted }">
      <!-- Aging Distribution -->
      <div class="panel aging-panel" :class="{ 'animate-in': mounted }">
        <div class="panel-header">
          <div class="panel-title">
            <h3>应收账龄分布</h3>
            <span class="panel-subtitle">账龄结构分析</span>
          </div>
        </div>
        <div class="panel-content">
          <div ref="agingChartRef" class="chart-container"></div>
        </div>
      </div>

      <!-- Cost Analysis -->
      <div class="panel cost-panel" :class="{ 'animate-in': mounted }">
        <div class="panel-header">
          <div class="panel-title">
            <h3>成本构成分析</h3>
            <span class="panel-subtitle">各类成本占比</span>
          </div>
        </div>
        <div class="panel-content">
          <div ref="costChartRef" class="chart-container"></div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="panel quick-panel" :class="{ 'animate-in': mounted }">
        <div class="panel-header">
          <div class="panel-title">
            <h3>关键指标</h3>
          </div>
        </div>
        <div class="panel-content">
          <div class="quick-stats">
            <div class="quick-stat" v-for="qs in quickStats" :key="qs.label">
              <div class="quick-stat-header">
                <span class="quick-stat-label">{{ qs.label }}</span>
                <span class="quick-stat-value">{{ qs.value }}</span>
              </div>
              <div class="quick-stat-bar">
                <div class="quick-stat-fill" :style="{ width: qs.percent + '%', background: qs.color }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

const router = useRouter()
const mounted = ref(false)
const currentDate = ref('')
const trendType = ref('amount')
const trendChartRef = ref<HTMLElement>()
const agingChartRef = ref<HTMLElement>()
const costChartRef = ref<HTMLElement>()

let trendChart: echarts.ECharts | null = null
let agingChart: echarts.ECharts | null = null
let costChart: echarts.ECharts | null = null

const statsData = ref([
  {
    label: '本月订单',
    value: '128',
    trend: 12.5,
    progress: 78,
    color: 'blue',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>'
  },
  {
    label: '本月应收',
    value: '¥256.8万',
    trend: 8.2,
    progress: 85,
    color: 'green',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
  },
  {
    label: '本月应付',
    value: '¥185.6万',
    trend: -3.5,
    progress: 62,
    color: 'orange',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>'
  },
  {
    label: '本月发票',
    value: '256',
    trend: 15.8,
    progress: 90,
    color: 'purple',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>'
  }
])

const quickStats = ref([
  { label: '回款率', value: '98.5%', percent: 98.5, color: 'linear-gradient(90deg, #10b981, #34d399)' },
  { label: '平均账期', value: '4.2天', percent: 72, color: 'linear-gradient(90deg, #3b82f6, #60a5fa)' },
  { label: '客户数量', value: '156家', percent: 85, color: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' },
  { label: '账面余额', value: '¥1568万', percent: 92, color: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }
])

const todoList = ref([
  { id: 1, title: '订单审核', desc: '3个销售订单待审核', priority: 'high', isRead: false, actionText: '去审核' },
  { id: 2, title: '发票认证', desc: '5张进项发票待认证', priority: 'medium', isRead: false, actionText: '去认证' },
  { id: 3, title: '付款审批', desc: '2笔付款申请待审批', priority: 'high', isRead: true, actionText: '去审批' },
  { id: 4, title: '对账单发送', desc: '10个客户对账单待发送', priority: 'medium', isRead: true, actionText: '去发送' },
  { id: 5, title: '逾期提醒', desc: '3笔应收款即将逾期', priority: 'high', isRead: false, actionText: '去查看' }
])

const updateDate = () => {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
}

const handleTodo = (item: any) => {
  const routes: Record<string, string> = {
    '订单审核': '/order/list', '发票认证': '/invoice/list', '付款审批': '/fund/payment',
    '对账单发送': '/statement/list', '逾期提醒': '/receivable/aging'
  }
  router.push(routes[item.title] || '/')
}

const initTrendChart = () => {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)

  const option = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.98)', borderColor: '#e5e7eb', textStyle: { color: '#374151' }, axisPointer: { type: 'shadow' } },
    legend: { data: ['收款', '付款'], textStyle: { color: '#6b7280' }, top: 0, right: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: true, data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], axisLine: { lineStyle: { color: '#e5e7eb' } }, axisLabel: { color: '#6b7280' } },
    yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#f3f4f6' } }, axisLabel: { color: '#6b7280' } },
    series: [
      {
        name: '收款', type: 'line', smooth: 0.5, symbol: 'circle', symbolSize: 8,
        lineStyle: { color: '#10b981', width: 3 },
        itemStyle: { color: '#10b981', borderWidth: 2, borderColor: '#fff' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(16, 185, 129, 0.15)' }, { offset: 1, color: 'rgba(16, 185, 129, 0)' }]) },
        data: trendType.value === 'amount' ? [120000, 132000, 101000, 134000, 90000, 230000, 210000] : [12, 15, 8, 18, 6, 22, 20]
      },
      {
        name: '付款', type: 'line', smooth: 0.5, symbol: 'circle', symbolSize: 8,
        lineStyle: { color: '#ef4444', width: 3 },
        itemStyle: { color: '#ef4444', borderWidth: 2, borderColor: '#fff' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(239, 68, 68, 0.15)' }, { offset: 1, color: 'rgba(239, 68, 68, 0)' }]) },
        data: trendType.value === 'amount' ? [82000, 93200, 90100, 93400, 129000, 133000, 132000] : [8, 10, 9, 12, 15, 13, 14]
      }
    ]
  }
  trendChart.setOption(option)
}

const initAgingChart = () => {
  if (!agingChartRef.value) return
  agingChart = echarts.init(agingChartRef.value)

  const option = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: 'rgba(255,255,255,0.98)', borderColor: '#e5e7eb', textStyle: { color: '#374151' }, formatter: '{b}: ¥{c} ({d}%)' },
    series: [{
      type: 'pie', radius: ['45%', '75%'], center: ['50%', '50%'], avoidLabelOverlap: true,
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 3 },
      label: { show: true, color: '#6b7280', fontSize: 12, formatter: '{b}\n{d}%' },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#1f2937' } },
      data: [
        { value: 1056000, name: '30天以内', itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [{ offset: 0, color: '#10b981' }, { offset: 1, color: '#34d399' }]) } },
        { value: 680000, name: '31-60天', itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [{ offset: 0, color: '#f59e0b' }, { offset: 1, color: '#fbbf24' }]) } },
        { value: 420000, name: '61-90天', itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [{ offset: 0, color: '#ef4444' }, { offset: 1, color: '#f87171' }]) } },
        { value: 320000, name: '90天以上', itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [{ offset: 0, color: '#6b7280' }, { offset: 1, color: '#9ca3af' }]) } }
      ]
    }]
  }
  agingChart.setOption(option)
}

const initCostChart = () => {
  if (!costChartRef.value) return
  costChart = echarts.init(costChartRef.value)

  const option = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.98)', borderColor: '#e5e7eb', textStyle: { color: '#374151' }, axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '8%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#f3f4f6' } }, axisLabel: { color: '#6b7280', formatter: (v: number) => v >= 1000 ? (v/1000) + 'k' : v } },
    yAxis: { type: 'category', data: ['物流费', '服务费', '采购费', '租赁费', '差旅费', '其他'], axisLine: { lineStyle: { color: '#e5e7eb' } }, axisLabel: { color: '#6b7280', fontSize: 12 } },
    series: [{
      type: 'bar', data: [
        { value: 568000, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#667eea' }, { offset: 1, color: '#764ba2' }]) } },
        { value: 420000, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#60a5fa' }]) } },
        { value: 380000, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#10b981' }, { offset: 1, color: '#34d399' }]) } },
        { value: 210000, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#f59e0b' }, { offset: 1, color: '#fbbf24' }]) } },
        { value: 150000, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#ec4899' }, { offset: 1, color: '#f472b6' }]) } },
        { value: 86000, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#8b5cf6' }, { offset: 1, color: '#a78bfa' }]) } }
      ],
      barWidth: 18, itemStyle: { borderRadius: [0, 6, 6, 0] },
      showBackground: true, backgroundStyle: { color: '#f9fafb', borderRadius: [0, 6, 6, 0] }
    }]
  }
  costChart.setOption(option)
}

const handleResize = () => { trendChart?.resize(); agingChart?.resize(); costChart?.resize() }

watch(trendType, () => { if (trendChart) { trendChart.dispose(); initTrendChart() } })

onMounted(() => {
  mounted.value = true
  updateDate()
  setTimeout(() => { initTrendChart(); initAgingChart(); initCostChart() }, 100)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose(); agingChart?.dispose(); costChart?.dispose()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');

.dashboard-container {
  padding: 0;
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header */
.dashboard-header {
  padding: 32px 32px 24px;
  opacity: 0;
  transform: translateY(-20px);
}
.dashboard-header.animate-in { animation: slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes slideDown { to { opacity: 1; transform: translateY(0); } }

.header-content { display: flex; justify-content: space-between; align-items: flex-start; }

.greeting h1 {
  font-size: 30px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
  letter-spacing: -0.5px;
}
.greeting p { font-size: 14px; color: #64748b; margin: 0; }

.header-meta { text-align: right; }
.date-display { font-size: 13px; color: #64748b; margin-bottom: 6px; }
.live-indicator { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #10b981; font-weight: 500; }
.pulse { width: 7px; height: 7px; background: #10b981; border-radius: 50%; animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.3); } }

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 0 32px;
  margin-bottom: 24px;
}
@media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .stats-grid { grid-template-columns: 1fr; } }

.stat-card {
  position: relative;
  padding: 22px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.04);
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.3s ease;
}
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.06); }
.stat-card.animate-in { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes slideUp { to { opacity: 1; transform: translateY(0); } }

.stat-card-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
}
.stat-card.blue .stat-card-bg { background: linear-gradient(90deg, #667eea, #764ba2); }
.stat-card.green .stat-card-bg { background: linear-gradient(90deg, #10b981, #34d399); }
.stat-card.orange .stat-card-bg { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.stat-card.purple .stat-card-bg { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }

.stat-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }

.stat-icon {
  width: 44px; height: 44px;
  padding: 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-icon :deep(svg) { width: 100%; height: 100%; }
.stat-card.blue .stat-icon { background: rgba(102, 126, 234, 0.1); color: #667eea; }
.stat-card.green .stat-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.stat-card.orange .stat-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.stat-card.purple .stat-icon { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

.stat-trend {
  display: flex; align-items: center; gap: 3px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
}
.stat-trend.up { color: #10b981; background: rgba(16, 185, 129, 0.1); }
.stat-trend.down { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

.stat-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 28px; font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
  letter-spacing: -0.5px;
}
.stat-label { font-size: 13px; color: #64748b; margin-bottom: 12px; }
.stat-meta { display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
.stat-compare { font-weight: 500; }

/* Content Grid */
.content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; padding: 0 32px; margin-bottom: 20px; }
@media (max-width: 1024px) { .content-grid { grid-template-columns: 1fr; } }

.charts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 0 32px 32px; }
@media (max-width: 1200px) { .charts-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .charts-grid { grid-template-columns: 1fr; } }

/* Panel */
.panel {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.04);
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px);
}
.panel.animate-in { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 22px; border-bottom: 1px solid #f1f5f9; }
.panel-title { display: flex; align-items: center; gap: 10px; }
.panel-title h3 { font-size: 15px; font-weight: 600; color: #0f172a; margin: 0; }
.panel-subtitle { font-size: 12px; color: #94a3b8; }
.badge { font-size: 11px; font-weight: 600; padding: 3px 10px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border-radius: 20px; }
.panel-content { padding: 20px 22px; }

/* Toggle Group */
.toggle-group { display: flex; background: #f1f5f9; border-radius: 10px; padding: 4px; gap: 2px; }
.toggle-group button { font-family: inherit; font-size: 12px; font-weight: 500; padding: 6px 14px; background: transparent; border: none; color: #64748b; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; }
.toggle-group button.active { background: #ffffff; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.toggle-group button:hover:not(.active) { color: #0f172a; }

/* Chart */
.chart-container { width: 100%; height: 260px; }

/* Todo List */
.todo-list { display: flex; flex-direction: column; gap: 10px; }
.todo-item {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  transition: all 0.25s ease;
}
.todo-item:hover { background: #f1f5f9; transform: translateX(4px); border-color: #e2e8f0; }
.todo-item.unread { background: rgba(102, 126, 234, 0.05); border-color: rgba(102, 126, 234, 0.15); }

.todo-indicator { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.indicator-dot { width: 8px; height: 8px; border-radius: 50%; background: #cbd5e1; }
.todo-item.unread .indicator-dot { background: #667eea; box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15); }
.todo-item.high .indicator-dot { background: #ef4444; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15); }

.todo-info { flex: 1; min-width: 0; }
.todo-title { font-size: 13px; font-weight: 600; color: #0f172a; margin-bottom: 2px; }
.todo-desc { font-size: 11px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.todo-action {
  display: flex; align-items: center; gap: 5px;
  font-family: inherit; font-size: 12px; font-weight: 500;
  padding: 7px 12px;
  background: rgba(102, 126, 234, 0.08);
  color: #667eea;
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.todo-action:hover { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; border-color: transparent; transform: translateX(2px); }

/* Quick Stats */
.quick-stats { display: flex; flex-direction: column; gap: 18px; }
.quick-stat-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.quick-stat-label { font-size: 12px; color: #64748b; }
.quick-stat-value { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 600; color: #0f172a; }
.quick-stat-bar { height: 6px; background: #f1f5f9; border-radius: 6px; overflow: hidden; }
.quick-stat-fill { height: 100%; border-radius: 6px; transition: width 1s cubic-bezier(0.16, 1, 0.3, 1); }
</style>
