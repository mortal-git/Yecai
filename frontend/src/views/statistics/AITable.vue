<template>
  <div class="aitable-container">
    <!-- 顶部标题区域 -->
    <div class="page-header">
      <div class="header-left">
        <h2>AI表格</h2>
        <span class="header-desc">智能报表生成，灵活配置模板字段映射，高效制作月度订单报表</span>
      </div>
    </div>

    <!-- 主功能区 -->
    <div class="main-content">
      <el-tabs v-model="activeTab" class="aitable-tabs">
        <!-- 模块一：模板管理 -->
        <el-tab-pane label="模板管理" name="template">
          <templateManager />
        </el-tab-pane>

        <!-- 模块二：字段映射 -->
        <el-tab-pane label="字段映射" name="mapping">
          <fieldMapper />
        </el-tab-pane>

        <!-- 模块三：报表生成 -->
        <el-tab-pane label="报表生成" name="generator">
          <reportGenerator />
        </el-tab-pane>

        <!-- 模块四：导出分享 -->
        <el-tab-pane label="导出分享" name="export">
          <reportExporter />
        </el-tab-pane>

        <!-- 模块五：AI助手 -->
        <el-tab-pane label="AI助手" name="assistant">
          <aIAssistant />
        </el-tab-pane>

        <!-- 模块六：操作日志 -->
        <el-tab-pane label="操作日志" name="log">
          <operationLog />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import templateManager from './components/TemplateManager.vue'
import fieldMapper from './components/FieldMapper.vue'
import reportGenerator from './components/ReportGenerator.vue'
import reportExporter from './components/ReportExporter.vue'
import aIAssistant from './components/AIAssistant.vue'
import operationLog from './components/OperationLog.vue'

const activeTab = ref('template')
</script>

<style scoped>
.aitable-container {
  padding: 0;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 24px 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.header-left h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.header-desc {
  font-size: 14px;
  opacity: 0.9;
}

.main-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 200px);
}

.aitable-tabs :deep(.el-tabs__header) {
  margin-bottom: 20px;
}

.aitable-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  padding: 0 30px;
  height: 45px;
  line-height: 45px;
}

.aitable-tabs :deep(.el-tabs__item.is-active) {
  color: #667eea;
  font-weight: 600;
}

.aitable-tabs :deep(.el-tabs__active-bar) {
  background-color: #667eea;
  height: 3px;
}

.aitable-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}
</style>
