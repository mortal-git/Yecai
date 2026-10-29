<template>
  <div ref="chartEl" class="cb-chart-render"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ChartConfig } from '../../../types/chatbi'

const props = defineProps<{
  config: ChartConfig
  height?: string
}>()

const chartEl = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

function init() {
  if (!chartEl.value) return
  chart = echarts.init(chartEl.value)
  chart.setOption(props.config.option)
}

function resize() {
  chart?.resize()
}

onMounted(() => {
  nextTick(() => {
    init()
    window.addEventListener('resize', resize)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
  chart = null
})

watch(() => props.config, () => {
  if (chart) {
    chart.setOption(props.config.option, true)
  } else {
    nextTick(init)
  }
}, { deep: true })
</script>

<style scoped>
.cb-chart-render {
  width: 100%;
  height: v-bind('height || "320px"');
  min-height: 240px;
}
</style>
