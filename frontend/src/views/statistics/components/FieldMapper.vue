<template>
  <div class="field-mapper">
    <!-- 步骤指示器 -->
    <div class="steps-container">
      <el-steps :active="currentStep" align-center finish-status="success">
        <el-step title="选择模板" description="选择要配置的报表模板" />
        <el-step title="字段映射" description="配置模板字段与系统字段的映射关系" />
        <el-step title="保存方案" description="保存映射配置以便复用" />
      </el-steps>
    </div>

    <!-- 步骤1：选择模板 -->
    <div v-show="currentStep === 0" class="step-content">
      <div class="step-header">
        <h3>选择模板</h3>
        <p class="step-desc">请选择需要配置字段映射的报表模板，或从映射市场选择已有方案</p>
      </div>

      <!-- 标签页切换：模板选择 / 映射市场 -->
      <el-tabs v-model="templateTab" class="template-tabs">
        <el-tab-pane label="选择报表模板" name="template">
          <div class="template-selector">
            <el-row :gutter="20">
              <el-col :span="8" v-for="template in templates" :key="template.id">
                <div
                  class="template-card"
                  :class="{ 'is-selected': selectedTemplate?.id === template.id }"
                  @click="handleSelectTemplate(template)"
                >
                  <div class="template-icon">
                    <el-icon><Document /></el-icon>
                  </div>
                  <div class="template-info">
                    <h4>{{ template.name }}</h4>
                    <p>{{ template.customerName }}</p>
                    <div class="template-tags">
                      <el-tag size="small" type="info">{{ formatReportType(template.reportType) }}</el-tag>
                      <el-tag size="small" type="success" v-if="template.hasMapping">已配置</el-tag>
                    </div>
                  </div>
                  <div class="template-check" v-if="selectedTemplate?.id === template.id">
                    <el-icon><Check /></el-icon>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
        <el-tab-pane label="从映射市场选择" name="market">
          <div class="mapping-market">
            <div class="market-search">
              <el-input v-model="marketSearch" placeholder="搜索映射方案" style="width: 300px">
                <template #prefix><el-icon><Search /></el-icon></template>
              </el-input>
              <el-select v-model="marketFilterType" placeholder="方案类型" style="width: 150px; margin-left: 10px">
                <el-option label="全部" value="" />
                <el-option label="月度报表" value="monthly" />
                <el-option label="季度报表" value="quarterly" />
                <el-option label="年度报表" value="yearly" />
              </el-select>
              <el-button style="margin-left: 10px" @click="handleImportMapping">
                <el-icon><Upload /></el-icon>
                导入配置
              </el-button>
            </div>
            <el-row :gutter="16" class="market-grid">
              <el-col :span="8" v-for="plan in filteredMarketPlans" :key="plan.id">
                <div class="market-card" @click="handleUseMarketPlan(plan)">
                  <div class="market-card-header">
                    <span class="market-plan-name">{{ plan.name }}</span>
                    <el-tag size="small" type="success">使用{{ plan.usageCount }}次</el-tag>
                  </div>
                  <div class="market-card-body">
                    <div class="market-field-info">
                      <span class="field-count">{{ plan.mappingCount }}个字段映射</span>
                      <span class="compatibility">匹配度 {{ plan.compatibility }}%</span>
                    </div>
                    <div class="market-tags">
                      <el-tag size="small" type="info" v-for="tag in plan.tags" :key="tag">{{ tag }}</el-tag>
                    </div>
                  </div>
                  <div class="market-card-footer">
                    <span class="creator">{{ plan.creator }}</span>
                    <span class="update-time">{{ plan.updateTime }}</span>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>

      <div class="step-actions">
        <el-button type="primary" :disabled="!selectedTemplate" @click="currentStep = 1">
          下一步：字段映射
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 步骤2：字段映射 -->
    <div v-show="currentStep === 1" class="step-content">
      <div class="step-header">
        <h3>字段映射配置</h3>
        <p class="step-desc">拖拽字段建立映射关系，或使用AI智能推荐</p>
      </div>

      <!-- AI智能推荐栏 -->
      <div class="ai-recommend-bar">
        <div class="ai-recommend-left">
          <el-alert type="success" :closable="false" show-icon>
            <template #title>
              <span>AI智能匹配：发现 <strong>{{ aiMatchCount }}</strong> 个高置信度映射推荐</span>
            </template>
          </el-alert>
        </div>
        <div class="ai-recommend-actions">
          <el-button type="primary" @click="handleAIRecommendAll">
            <el-icon><MagicStick /></el-icon>
            一键接受AI推荐
          </el-button>
          <el-button @click="handleAIRecommend">
            <el-icon><Refresh /></el-icon>
            重新分析
          </el-button>
          <el-button @click="handleExportMapping">
            <el-icon><Download /></el-icon>
            导出配置
          </el-button>
        </div>
      </div>

      <!-- 冲突检测提示 -->
      <div class="conflict-alert" v-if="conflicts.length > 0">
        <el-alert type="danger" :closable="false" show-icon>
          <template #title>
            <span>发现 <strong>{{ conflicts.length }}</strong> 个映射冲突</span>
          </template>
        </el-alert>
        <div class="conflict-list">
          <div v-for="(conflict, index) in conflicts" :key="index" class="conflict-item">
            <el-icon><Warning /></el-icon>
            <span>{{ conflict.message }}</span>
            <el-button type="primary" size="small" link @click="handleResolveConflict(conflict)">解决</el-button>
          </div>
        </div>
      </div>

      <!-- 可视化映射区域 -->
      <div class="visual-mapping-area">
        <!-- 模板字段列 -->
        <div class="mapping-column template-column">
          <div class="column-header">
            <span>模板字段</span>
            <div class="header-actions">
              <el-button size="small" link @click="handleParseTemplateFields">
                <el-icon><Refresh /></el-icon>
              </el-button>
              <el-dropdown @command="handleTemplateFieldCommand">
                <el-button size="small" link>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="expand">展开所有字段</el-dropdown-item>
                    <el-dropdown-item command="collapse">收起已映射字段</el-dropdown-item>
                    <el-dropdown-item command="clear">清除所有映射</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <div class="column-search">
            <el-input v-model="templateSearch" placeholder="搜索模板字段" size="small" clearable>
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
          <!-- 字段分组 -->
          <el-tabs v-model="templateFieldTab" class="field-group-tabs" size="small">
            <el-tab-pane label="全部" name="all">
              <div class="field-list">
                <div
                  v-for="field in filteredTemplateFields"
                  :key="field.name"
                  class="field-item"
                  :class="{
                    'is-mapped': field.mapped,
                    'is-dragging': draggingField?.name === field.name,
                    'is-hover-target': hoverTarget?.name === field.name,
                    'is-type-warning': getTypeWarning(field)
                  }"
                  draggable="true"
                  @dragstart="handleDragStart($event, field, 'template')"
                  @dragend="handleDragEnd"
                  @dragover.prevent="handleDragOver(field, 'template')"
                  @drop="handleDrop(field, 'template')"
                  @click="handleFieldClick(field, 'template')"
                >
                  <div class="field-info">
                    <el-icon class="field-icon"><Document /></el-icon>
                    <span class="field-name">{{ field.alias || field.name }}</span>
                    <el-tooltip v-if="getTypeWarning(field)" content="字段类型不匹配">
                      <el-icon class="type-warning-icon"><Warning /></el-icon>
                    </el-tooltip>
                  </div>
                  <div class="field-meta">
                    <el-tag size="small" :type="getDataTypeTag(field.dataType)">{{ field.dataType }}</el-tag>
                    <span class="mapping-status" v-if="field.mapped">
                      <el-icon><Check color="#67C23A" /></el-icon>
                    </span>
                  </div>
                  <!-- 拖拽手柄 -->
                  <div class="drag-handle">
                    <el-icon><Rank /></el-icon>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="已映射" name="mapped">
              <div class="field-list">
                <div
                  v-for="field in filteredTemplateFields.filter(f => f.mapped)"
                  :key="field.name"
                  class="field-item is-mapped"
                  draggable="true"
                  @dragstart="handleDragStart($event, field, 'template')"
                  @dragend="handleDragEnd"
                  @dragover.prevent="handleDragOver(field, 'template')"
                  @drop="handleDrop(field, 'template')"
                >
                  <div class="field-info">
                    <el-icon class="field-icon"><Document /></el-icon>
                    <span class="field-name">{{ field.alias || field.name }}</span>
                  </div>
                  <div class="field-meta">
                    <span class="mapped-target">→ {{ field.mappedTo }}</span>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="未映射" name="unmapped">
              <div class="field-list">
                <div
                  v-for="field in filteredTemplateFields.filter(f => !f.mapped)"
                  :key="field.name"
                  class="field-item"
                  draggable="true"
                  @dragstart="handleDragStart($event, field, 'template')"
                  @dragend="handleDragEnd"
                  @dragover.prevent="handleDragOver(field, 'template')"
                  @drop="handleDrop(field, 'template')"
                >
                  <div class="field-info">
                    <el-icon class="field-icon"><Document /></el-icon>
                    <span class="field-name">{{ field.alias || field.name }}</span>
                  </div>
                  <div class="field-meta">
                    <el-tag size="small" type="warning">待映射</el-tag>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- 映射连接线区域 -->
        <div class="mapping-lines-area">
          <svg class="mapping-svg" v-if="mappingConnections.length > 0">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#409eff" />
              </marker>
              <marker id="arrowhead-warn" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#E6A23C" />
              </marker>
            </defs>
            <path
              v-for="(conn, idx) in mappingConnections"
              :key="idx"
              :d="conn.path"
              :stroke="conn.hasConflict ? '#E6A23C' : '#409eff'"
              :stroke-width="conn.confidence > 0.9 ? 3 : 2"
              fill="none"
              :marker-end="conn.hasConflict ? 'url(#arrowhead-warn)' : 'url(#arrowhead)'"
              :class="{ 'is-high-confidence': conn.confidence > 0.9 }"
            />
          </svg>
          <!-- 快捷操作 -->
          <div class="quick-actions">
            <el-tooltip content="自动连线" placement="top">
              <el-button circle @click="handleAutoConnect">
                <el-icon><Connection /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="清除所有连线" placement="top">
              <el-button circle @click="handleClearConnections">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>

        <!-- 系统字段列 -->
        <div class="mapping-column system-column">
          <div class="column-header">
            <span>系统字段</span>
            <div class="header-actions">
              <el-button size="small" link @click="handleRefreshSystemFields">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="column-search">
            <el-input v-model="systemSearch" placeholder="搜索系统字段" size="small" clearable>
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
          <!-- 字段分组 -->
          <el-collapse v-model="systemFieldCollapse" class="field-collapse">
            <el-collapse-item
              v-for="group in filteredSystemFieldGroups"
              :key="group.name"
              :title="group.name"
              :name="group.name"
            >
              <template #title>
                <span class="collapse-title">
                  {{ group.name }}
                  <el-badge :value="getGroupMappingCount(group)" type="primary" />
                </span>
              </template>
              <div class="field-list field-list-system">
                <div
                  v-for="field in group.fields"
                  :key="field.value"
                  class="field-item"
                  :class="{
                    'is-mapped': field.mapped,
                    'is-hover-target': hoverTarget?.name === field.value,
                    'is-conflict': isFieldInConflict(field.value)
                  }"
                  @dragover.prevent="handleDragOver(field, 'system')"
                  @drop="handleDrop(field, 'system')"
                  @click="handleFieldClick(field, 'system')"
                >
                  <div class="field-info">
                    <el-icon class="field-icon"><Key /></el-icon>
                    <span class="field-name">{{ field.label }}</span>
                    <el-tag size="small" :type="field.mapped ? 'success' : 'info'" class="ml-5">
                      {{ field.mapped ? '已用' : '空闲' }}
                    </el-tag>
                  </div>
                  <div class="field-meta">
                    <span class="mapped-indicator" v-if="field.mapped">
                      <el-icon><Check color="#67C23A" /></el-icon>
                    </span>
                  </div>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>

      <!-- 映射历史记录 -->
      <div class="mapping-history" v-if="mappingHistory.length > 0">
        <el-popover placement="bottom-start" :width="400" trigger="click">
          <template #reference>
            <el-button text>
              <el-icon><Clock /></el-icon>
              映射历史 ({{ mappingHistory.length }})
            </el-button>
          </template>
          <div class="history-list">
            <div v-for="(item, idx) in mappingHistory.slice(-5).reverse()" :key="idx" class="history-item">
              <span class="history-action">{{ item.action }}</span>
              <span class="history-time">{{ item.time }}</span>
            </div>
          </div>
        </el-popover>
      </div>

      <!-- 已映射列表（表格模式） -->
      <div class="mapping-detail-section">
        <div class="section-header">
          <span>已配置映射 ({{ mappedCount }}个)</span>
          <div class="section-actions">
            <el-button size="small" @click="handleBatchTransform">
              <el-icon><Edit /></el-icon>
              批量设置
            </el-button>
            <el-button size="small" type="danger" @click="handleClearAllMappings">
              <el-icon><Delete /></el-icon>
              清除所有
            </el-button>
          </div>
        </div>

        <el-table :data="mappingData" border stripe size="small" class="mapping-detail-table" row-class-name="mapping-row">
          <el-table-column label="模板字段" width="180">
            <template #default="scope">
              <span class="template-field-name">{{ scope.row.templateField }}</span>
              <el-tag size="small" type="info" class="ml-8">{{ scope.row.templateType }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="" width="30" align="center">
            <template #default>
              <el-icon color="#67C23A"><Right /></el-icon>
            </template>
          </el-table-column>
          <el-table-column label="系统字段" width="220">
            <template #default="scope">
              <el-select
                v-model="scope.row.systemField"
                placeholder="请选择系统字段"
                filterable
                clearable
                size="small"
                style="width: 100%"
                @change="handleFieldChange(scope.row, scope.$index)"
              >
                <template #empty>
                  <span class="empty-tip">无匹配字段</span>
                </template>
                <el-option-group
                  v-for="group in systemFieldGroups"
                  :key="group.name"
                  :label="group.name"
                >
                  <el-option
                    v-for="field in group.fields"
                    :key="field.value"
                    :label="field.label"
                    :value="field.value"
                    :disabled="isFieldOccupied(field.value, scope.$index)"
                  >
                    <div class="system-option">
                      <span>{{ field.label }}</span>
                      <el-tag v-if="isFieldOccupied(field.value, scope.$index)" size="small" type="danger">已占用</el-tag>
                    </div>
                  </el-option>
                </el-option-group>
              </el-select>
            </template>
          </el-table-column>
          <!-- 扩展方向列 -->
          <el-table-column label="扩展方向" width="140" align="center">
            <template #default="scope">
              <el-select
                v-model="scope.row.expandType"
                placeholder="扩展方向"
                size="small"
                style="width: 100%"
                :disabled="!scope.row.systemField"
                @change="handleExpandTypeChange(scope.row)"
              >
                <el-option label="不扩展" value="none" />
                <el-option label="从左到右" value="right" />
                <el-option label="从上到下" value="down" />
              </el-select>
            </template>
          </el-table-column>
          <!-- 汇总方式列 -->
          <el-table-column label="汇总方式" width="130" align="center">
            <template #default="scope">
              <el-select
                v-model="scope.row.aggregate"
                placeholder="汇总"
                size="small"
                style="width: 100%"
                :disabled="scope.row.expandType !== 'none' || !scope.row.systemField"
                @change="handleAggregateChange(scope.row)"
              >
                <el-option label="无" value="" />
                <el-option label="求和" value="SUM" />
                <el-option label="平均" value="AVG" />
                <el-option label="计数" value="COUNT" />
                <el-option label="最大" value="MAX" />
                <el-option label="最小" value="MIN" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="数据处理" width="200">
            <template #default="scope">
              <el-select v-model="scope.row.transform" placeholder="数据处理" clearable size="small" style="width: 100%" @change="handleTransformChange(scope.row)">
                <el-option label="无处理" value="" />
                <el-option label="保留2位小数" value="fixed2" />
                <el-option label="保留整数" value="int" />
                <el-option label="日期格式YYYY-MM-DD" value="dateFormat" />
                <el-option label="日期格式YYYY/MM/DD" value="dateFormat2" />
                <el-option label="金额大写" value="moneyCN" />
                <el-option label="文本拼接" value="concat" />
                <el-option label="取绝对值" value="abs" />
                <el-option label="取负数" value="negative" />
                <el-option label="字符串截取" value="substring" />
                <el-option label="去空格" value="trim" />
                <el-option label="转大写" value="uppercase" />
                <el-option label="转小写" value="lowercase" />
                <el-option label="自定义公式" value="formula" />
              </el-select>
            </template>
          </el-table-column>
          <!-- 公式编辑列（当数据处理为公式时显示） -->
          <el-table-column label="公式配置" width="200" v-if="hasFormulaTransform">
            <template #default="scope">
              <el-input
                v-if="scope.row.transform === 'formula'"
                v-model="scope.row.formula"
                placeholder="如: {field} * 1.1"
                size="small"
                @change="handleFormulaChange(scope.row)"
              >
                <template #prefix>
                  <el-tooltip content="可用变量: {field}代表原值, {其他字段名}引用其他字段">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                </template>
              </el-input>
            </template>
          </el-table-column>
          <el-table-column label="默认值" width="140">
            <template #default="scope">
              <el-input v-model="scope.row.defaultValue" placeholder="空值默认" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="智能建议" width="120" align="center">
            <template #default="scope">
              <el-tooltip v-if="getSmartSuggestion(scope.row)" :content="getSmartSuggestion(scope.row)" placement="top">
                <el-button type="primary" size="small" link @click="handleApplySuggestion(scope.row)">
                  <el-icon><Sunny /></el-icon>
                  一键应用
                </el-button>
              </el-tooltip>
              <span v-else class="no-suggestion">-</span>
            </template>
          </el-table-column>
          <el-table-column label="置信度" width="80" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.confidence >= 0.9" type="success" size="small">{{ (scope.row.confidence * 100).toFixed(0) }}%</el-tag>
              <el-tag v-else-if="scope.row.confidence >= 0.7" type="warning" size="small">{{ (scope.row.confidence * 100).toFixed(0) }}%</el-tag>
              <el-tag v-else type="info" size="small">{{ (scope.row.confidence * 100).toFixed(0) }}%</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.systemField" type="success" size="small">已映射</el-tag>
              <el-tag v-else type="warning" size="small">待映射</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="scope">
              <el-button type="primary" size="small" link @click="handleEditMapping(scope.row, scope.$index)">编辑</el-button>
              <el-button type="danger" size="small" link @click="handleRemoveMapping(scope.$index)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 映射异常提醒 -->
      <div class="mapping-warnings" v-if="warnings.length > 0">
        <el-alert type="warning" :closable="false" show-icon>
          <template #title>
            <span>发现 <strong>{{ warnings.length }}</strong> 个映射异常</span>
          </template>
        </el-alert>
        <div class="warning-list">
          <div v-for="(warning, index) in warnings" :key="index" class="warning-item">
            <el-icon><Warning /></el-icon>
            <span>{{ warning.message }}</span>
            <el-button type="primary" size="small" link @click="handleFixWarning(warning)">{{ warning.action }}</el-button>
          </div>
        </div>
      </div>

      <div class="step-actions">
        <el-button @click="currentStep = 0">
          <el-icon><ArrowLeft /></el-icon>
          上一步
        </el-button>
        <el-button @click="handleValidateMapping" :disabled="!isMappingValid">
          <el-icon><CircleCheck /></el-icon>
          验证映射
        </el-button>
        <el-button type="primary" :disabled="!canProceed" @click="currentStep = 2">
          下一步：保存方案
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 步骤3：保存方案 -->
    <div v-show="currentStep === 2" class="step-content">
      <div class="step-header">
        <h3>保存映射方案</h3>
        <p class="step-desc">将当前映射配置保存为方案，可选择发布到映射市场供他人使用</p>
      </div>

      <div class="save-form">
        <el-form :model="saveForm" label-width="120px">
          <el-form-item label="方案名称" required>
            <el-input v-model="saveForm.name" placeholder="请输入方案名称，如：XX客户月度报表映射配置" style="width: 400px" />
          </el-form-item>
          <el-form-item label="关联模板">
            <span>{{ selectedTemplate?.name }}</span>
          </el-form-item>
          <el-form-item label="适用客户">
            <el-select v-model="saveForm.customerId" placeholder="请选择客户" style="width: 300px">
              <el-option label="北京科技有限公司" value="beijing" />
              <el-option label="上海贸易有限公司" value="shanghai" />
              <el-option label="广州电子有限公司" value="guangzhou" />
            </el-select>
          </el-form-item>
          <el-form-item label="映射分类">
            <el-select v-model="saveForm.category" placeholder="请选择分类" style="width: 200px">
              <el-option label="月度汇总" value="monthly" />
              <el-option label="季度汇总" value="quarterly" />
              <el-option label="年度汇总" value="yearly" />
              <el-option label="交易明细" value="transaction" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="版本">
            <el-input v-model="saveForm.version" placeholder="如: v1.0" style="width: 100px" />
            <span class="form-tip">建议每次保存时递增版本号</span>
          </el-form-item>
          <el-form-item label="发布到市场">
            <el-switch v-model="saveForm.publishToMarket" />
            <span class="form-tip">发布后，其他用户可以搜索并使用此映射方案</span>
          </el-form-item>
          <el-form-item label="备注说明">
            <el-input v-model="saveForm.remark" type="textarea" :rows="3" placeholder="请输入备注说明" style="width: 400px" />
          </el-form-item>
        </el-form>
      </div>

      <!-- 映射摘要 -->
      <div class="mapping-summary">
        <h4>映射配置摘要</h4>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="模板字段数">{{ mappingData.length }}</el-descriptions-item>
          <el-descriptions-item label="已映射字段数">
            <el-tag type="success">{{ mappedCount }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="待映射字段数">
            <el-tag type="warning">{{ unmappedCount }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="平均置信度">
            <el-progress :percentage="averageConfidence" :color="confidenceColor" style="width: 150px" />
          </el-descriptions-item>
          <el-descriptions-item label="高置信度映射">{{ highConfidenceCount }}个</el-descriptions-item>
          <el-descriptions-item label="冲突数量">{{ conflicts.length }}个</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 映射预览 -->
      <div class="mapping-preview">
        <h4>数据预览</h4>
        <div class="preview-toggle">
          <el-radio-group v-model="previewMode" size="small">
            <el-radio-button label="table">表格预览</el-radio-button>
            <el-radio-button label="json">JSON预览</el-radio-button>
          </el-radio-group>
          <el-button size="small" @click="handleRefreshPreview">
            <el-icon><Refresh /></el-icon>
            刷新预览
          </el-button>
        </div>
        <div class="preview-content">
          <el-table v-if="previewMode === 'table'" :data="previewData" border size="small" max-height="300">
            <el-table-column
              v-for="col in previewColumns"
              :key="col.prop"
              :prop="col.prop"
              :label="col.label"
              :width="col.width"
            />
          </el-table>
          <pre v-else class="json-preview">{{ previewJson }}</pre>
        </div>
      </div>

      <!-- 已保存方案列表 -->
      <div class="saved-plans">
        <h4>已保存的方案</h4>
        <el-table :data="savedPlans" border stripe size="small">
          <el-table-column prop="name" label="方案名称" min-width="180" />
          <el-table-column prop="templateName" label="关联模板" width="160" />
          <el-table-column prop="customerName" label="适用客户" width="130" />
          <el-table-column prop="mappingCount" label="映射字段数" width="90" align="center" />
          <el-table-column prop="avgConfidence" label="平均置信度" width="90" align="center">
            <template #default="scope">
              <el-tag size="small" type="success">{{ scope.row.avgConfidence }}%</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="version" label="版本" width="70" align="center" />
          <el-table-column prop="updateTime" label="更新时间" width="150" />
          <el-table-column label="操作" width="220" align="center">
            <template #default="scope">
              <el-button type="primary" size="small" link @click="handleUsePlan(scope.row)">使用</el-button>
              <el-button type="success" size="small" link @click="handleCopyPlan(scope.row)">复制</el-button>
              <el-button type="warning" size="small" link @click="handleExportPlan(scope.row)">导出</el-button>
              <el-button type="danger" size="small" link @click="handleDeletePlan(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="step-actions">
        <el-button @click="currentStep = 1">
          <el-icon><ArrowLeft /></el-icon>
          上一步
        </el-button>
        <el-button type="success" @click="handleSavePlan">
          <el-icon><Check /></el-icon>
          保存方案
        </el-button>
        <el-button type="primary" @click="handleFinish">
          <el-icon><Check /></el-icon>
          完成配置
        </el-button>
      </div>
    </div>

    <!-- 批量设置数据处理对话框 -->
    <el-dialog v-model="batchTransformDialogVisible" title="批量设置数据处理" width="500px">
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="选中字段">
          <el-tag v-for="field in batchSelectedFields" :key="field" size="small" class="mr-8">{{ field }}</el-tag>
        </el-form-item>
        <el-form-item label="数据处理方式" required>
          <el-select v-model="batchForm.transform" placeholder="请选择" style="width: 100%">
            <el-option label="保留2位小数" value="fixed2" />
            <el-option label="保留整数" value="int" />
            <el-option label="日期格式YYYY-MM-DD" value="dateFormat" />
            <el-option label="日期格式YYYY/MM/DD" value="dateFormat2" />
            <el-option label="金额大写" value="moneyCN" />
            <el-option label="文本拼接" value="concat" />
            <el-option label="取绝对值" value="abs" />
            <el-option label="取负数" value="negative" />
            <el-option label="字符串截取" value="substring" />
            <el-option label="去空格" value="trim" />
            <el-option label="转大写" value="uppercase" />
            <el-option label="转小写" value="lowercase" />
          </el-select>
        </el-form-item>
        <el-form-item label="默认值">
          <el-input v-model="batchForm.defaultValue" placeholder="空值时的默认值" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchTransformDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchTransformConfirm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑映射对话框 -->
    <el-dialog v-model="editMappingDialogVisible" title="编辑映射" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="模板字段">
          <span>{{ editForm.templateField }}</span>
        </el-form-item>
        <el-form-item label="系统字段">
          <el-select v-model="editForm.systemField" filterable style="width: 100%">
            <el-option-group v-for="group in systemFieldGroups" :key="group.name" :label="group.name">
              <el-option v-for="field in group.fields" :key="field.value" :label="field.label" :value="field.value" />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="数据处理">
          <el-select v-model="editForm.transform" style="width: 100%">
            <el-option label="无处理" value="" />
            <el-option label="保留2位小数" value="fixed2" />
            <el-option label="保留整数" value="int" />
            <el-option label="日期格式YYYY-MM-DD" value="dateFormat" />
            <el-option label="金额大写" value="moneyCN" />
            <el-option label="自定义公式" value="formula" />
          </el-select>
        </el-form-item>
        <el-form-item label="公式" v-if="editForm.transform === 'formula'">
          <el-input v-model="editForm.formula" placeholder="如: {field} * 1.1" />
        </el-form-item>
        <el-form-item label="默认值">
          <el-input v-model="editForm.defaultValue" placeholder="空值时的默认值" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editMappingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditMappingConfirm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 导入映射对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入映射配置" width="500px">
      <div class="import-area">
        <el-upload
          ref="uploadRef"
          class="upload-demo"
          drag
          :auto-upload="false"
          :limit="1"
          accept=".json"
          @change="handleFileChange"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">拖拽JSON文件到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">只能上传JSON文件，建议先导出已有映射配置作为模板</div>
          </template>
        </el-upload>
      </div>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImportConfirm" :disabled="!importFile">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document, Check, ArrowRight, ArrowLeft, Right, MagicStick, Warning, Plus,
  Search, Refresh, Rank, Connection, Delete, Key, Edit, Download, Upload,
  Clock, CircleCheck, QuestionFilled, Sunny, MoreFilled, UploadFilled
} from '@element-plus/icons-vue'

const currentStep = ref(0)
const templateTab = ref('template')
const templateFieldTab = ref('all')

// 映射市场相关
const marketSearch = ref('')
const marketFilterType = ref('')
const marketPlans = ref([
  { id: 1, name: '标准月度订单报表映射', mappingCount: 12, compatibility: 95, tags: ['月度', '订单'], creator: '系统管理员', usageCount: 156, updateTime: '2024-03-15' },
  { id: 2, name: '供应商对账通用映射', mappingCount: 8, compatibility: 88, tags: ['对账', '供应商'], creator: '财务部', usageCount: 89, updateTime: '2024-03-10' },
  { id: 3, name: '客户应收账龄分析映射', mappingCount: 15, compatibility: 92, tags: ['应收', '账龄'], creator: '风控部', usageCount: 45, updateTime: '2024-03-08' }
])

const filteredMarketPlans = computed(() => {
  return marketPlans.value.filter(plan => {
    const matchSearch = !marketSearch.value || plan.name.includes(marketSearch.value)
    const matchType = !marketFilterType.value || plan.tags.includes(marketFilterType.value)
    return matchSearch && matchType
  })
})

interface Template {
  id: number
  name: string
  customerName: string
  reportType: string
  hasMapping?: boolean
  fields?: TemplateField[]
}

interface TemplateField {
  name: string
  alias?: string
  type?: string
  dataType: string
  mapped?: boolean
  mappedTo?: string
}

interface MappingRow {
  templateField: string
  templateType?: string
  systemField: string
  expandType: 'none' | 'right' | 'down'
  aggregate: string
  transform: string
  formula?: string
  defaultValue?: string
  confidence: number
}

interface SystemFieldGroup {
  name: string
  fields: { label: string; value: string; mapped?: boolean }[]
}

interface MappingConnection {
  templateField: string
  systemField: string
  path: string
  confidence: number
  hasConflict?: boolean
}

interface MappingHistoryItem {
  action: string
  time: string
}

interface Conflict {
  message: string
  type: 'duplicate' | 'type_mismatch' | 'required'
  fields: string[]
  fixType?: string
}

const templates = ref<Template[]>([
  { id: 1, name: '北京科技月度订单报表模板', customerName: '北京科技有限公司', reportType: 'monthly', hasMapping: true },
  { id: 2, name: '上海贸易月度对账模板', customerName: '上海贸易有限公司', reportType: 'monthly', hasMapping: false },
  { id: 3, name: '广州电子季度报表模板', customerName: '广州电子有限公司', reportType: 'quarterly', hasMapping: false }
])

const selectedTemplate = ref<Template | null>(null)

// 模板字段搜索
const templateSearch = ref('')
const systemSearch = ref('')
const systemFieldCollapse = ref(['订单信息', '商品信息', '物流信息', '财务信息'])

// 模板字段列表
const templateFields = ref<TemplateField[]>([
  { name: 'customer_name', alias: '客户名称', type: 'string', dataType: 'VARCHAR', mapped: true, mappedTo: 'customerName' },
  { name: 'order_no', alias: '订单号', type: 'string', dataType: 'VARCHAR', mapped: true, mappedTo: 'orderNo' },
  { name: 'order_date', alias: '下单时间', type: 'datetime', dataType: 'DATETIME', mapped: true, mappedTo: 'orderTime' },
  { name: 'total_amount', alias: '订单金额', type: 'decimal', dataType: 'DECIMAL', mapped: true, mappedTo: 'orderAmount' },
  { name: 'paid_amount', alias: '已付金额', type: 'decimal', dataType: 'DECIMAL', mapped: false },
  { name: 'product_name', alias: '商品名称', type: 'string', dataType: 'VARCHAR', mapped: false },
  { name: 'product_qty', alias: '商品数量', type: 'int', dataType: 'INTEGER', mapped: false },
  { name: 'delivery_addr', alias: '收货地址', type: 'string', dataType: 'VARCHAR', mapped: false }
])

const filteredTemplateFields = computed(() => {
  if (!templateSearch.value) return templateFields.value
  const search = templateSearch.value.toLowerCase()
  return templateFields.value.filter(f =>
    f.name.toLowerCase().includes(search) ||
    (f.alias && f.alias.toLowerCase().includes(search))
  )
})

// 过滤后的系统字段分组
const filteredSystemFieldGroups = computed(() => {
  if (!systemSearch.value) return systemFieldGroups.value
  const search = systemSearch.value.toLowerCase()
  return systemFieldGroups.value.map(group => ({
    ...group,
    fields: group.fields.filter(f => f.label.toLowerCase().includes(search))
  })).filter(group => group.fields.length > 0)
})

// 系统字段分组
const systemFieldGroups = ref<SystemFieldGroup[]>([
  {
    name: '订单信息',
    fields: [
      { label: '订单编号 (orderNo)', value: 'orderNo', mapped: true },
      { label: '订单类型 (orderType)', value: 'orderType', mapped: false },
      { label: '客户名称 (customerName)', value: 'customerName', mapped: true },
      { label: '客户编号 (customerNo)', value: 'customerNo', mapped: false },
      { label: '下单时间 (orderTime)', value: 'orderTime', mapped: true },
      { label: '订单金额 (orderAmount)', value: 'orderAmount', mapped: true },
      { label: '已付金额 (paidAmount)', value: 'paidAmount', mapped: false },
      { label: '未付金额 (unpaidAmount)', value: 'unpaidAmount', mapped: false },
      { label: '订单状态 (orderStatus)', value: 'orderStatus', mapped: false }
    ]
  },
  {
    name: '商品信息',
    fields: [
      { label: '商品名称 (productName)', value: 'productName', mapped: false },
      { label: '商品数量 (productQty)', value: 'productQty', mapped: false },
      { label: '商品单价 (productPrice)', value: 'productPrice', mapped: false },
      { label: '商品金额 (productAmount)', value: 'productAmount', mapped: false }
    ]
  },
  {
    name: '物流信息',
    fields: [
      { label: '收货地址 (deliveryAddress)', value: 'deliveryAddress', mapped: false },
      { label: '预计送达 (expectedDelivery)', value: 'expectedDelivery', mapped: false },
      { label: '实际送达 (actualDelivery)', value: 'actualDelivery', mapped: false }
    ]
  },
  {
    name: '财务信息',
    fields: [
      { label: '发票抬头 (invoiceTitle)', value: 'invoiceTitle', mapped: false },
      { label: '税号 (taxNo)', value: 'taxNo', mapped: false },
      { label: '开户银行 (bankName)', value: 'bankName', mapped: false },
      { label: '银行账号 (bankAccount)', value: 'bankAccount', mapped: false }
    ]
  }
])

// 映射数据
const mappingData = ref<MappingRow[]>([
  { templateField: '客户名称', templateType: 'string', systemField: 'customerName', expandType: 'down', aggregate: '', transform: '', formula: '', defaultValue: '', confidence: 0.95 },
  { templateField: '订单号', templateType: 'string', systemField: 'orderNo', expandType: 'down', aggregate: '', transform: '', formula: '', defaultValue: '', confidence: 0.98 },
  { templateField: '下单时间', templateType: 'datetime', systemField: 'orderTime', expandType: 'none', aggregate: '', transform: 'dateFormat', formula: '', defaultValue: '', confidence: 0.92 },
  { templateField: '订单金额', templateType: 'decimal', systemField: 'orderAmount', expandType: 'none', aggregate: 'SUM', transform: 'fixed2', formula: '', defaultValue: '0', confidence: 0.88 },
  { templateField: '已付金额', templateType: 'decimal', systemField: 'paidAmount', expandType: 'none', aggregate: 'SUM', transform: 'fixed2', formula: '', defaultValue: '0', confidence: 0.85 }
])

// 映射历史
const mappingHistory = ref<MappingHistoryItem[]>([
  { action: '创建映射：客户名称 → customerName', time: '10:30:25' },
  { action: '创建映射：订单号 → orderNo', time: '10:30:28' },
  { action: '修改映射：订单金额的数据处理为 fixed2', time: '10:31:05' }
])

// 冲突检测
const conflicts = ref<Conflict[]>([])

// AI推荐相关
const aiMatchCount = computed(() => mappingData.value.filter(m => m.confidence >= 0.9).length)

// 拖拽相关
const draggingField = ref<any>(null)
const draggingType = ref<'template' | 'system' | null>(null)
const hoverTarget = ref<any>(null)

// 可视化连线
const mappingConnections = ref<MappingConnection[]>([])

// 警告信息
const warnings = ref<{ message: string; action: string; fixType: string }[]>([
  { message: '模板字段"商品数量"的类型(int)与系统字段"订单金额"(decimal)不匹配', action: '查看解决方案', fixType: 'type_mismatch' }
])

// 保存表单
const saveForm = reactive({
  name: '',
  customerId: '',
  category: 'monthly',
  version: 'v1.0',
  publishToMarket: false,
  remark: ''
})

// 已保存方案
const savedPlans = ref([
  { id: 1, name: '北京科技月度报表映射配置', templateName: '北京科技月度订单报表模板', customerName: '北京科技有限公司', mappingCount: 8, avgConfidence: 95, version: 'v1.2', updateTime: '2024-03-15 14:30:00' },
  { id: 2, name: '上海贸易标准映射方案', templateName: '上海贸易月度对账模板', customerName: '上海贸易有限公司', mappingCount: 6, avgConfidence: 88, version: 'v1.0', updateTime: '2024-03-10 09:20:00' }
])

// 批量处理
const batchTransformDialogVisible = ref(false)
const batchSelectedFields = ref<string[]>([])
const batchForm = reactive({
  transform: '',
  defaultValue: ''
})

// 编辑映射对话框
const editMappingDialogVisible = ref(false)
const editForm = reactive({
  index: -1,
  templateField: '',
  systemField: '',
  transform: '',
  formula: '',
  defaultValue: ''
})

// 导入对话框
const importDialogVisible = ref(false)
const importFile = ref<File | null>(null)

// 预览相关
const previewMode = ref<'table' | 'json'>('table')
const previewData = ref([
  { customerName: '北京科技有限公司', orderNo: 'ORD202403001', orderTime: '2024-03-01', orderAmount: 150000.00 },
  { customerName: '上海贸易有限公司', orderNo: 'ORD202403002', orderTime: '2024-03-02', orderAmount: 88000.00 }
])
const previewColumns = [
  { prop: 'customerName', label: '客户名称', width: 150 },
  { prop: 'orderNo', label: '订单编号', width: 120 },
  { prop: 'orderTime', label: '下单时间', width: 120 },
  { prop: 'orderAmount', label: '订单金额', width: 120 }
]

const previewJson = computed(() => {
  return JSON.stringify(mappingData.value, null, 2)
})

// 计算属性
const mappedCount = computed(() => mappingData.value.filter(m => m.systemField).length)
const unmappedCount = computed(() => mappingData.value.filter(m => !m.systemField).length)
const isMappingValid = computed(() => mappedCount.value > 0 && unmappedCount.value === 0)
const canProceed = computed(() => isMappingValid.value && conflicts.value.length === 0)
const hasFormulaTransform = computed(() => mappingData.value.some(m => m.transform === 'formula'))
const averageConfidence = computed(() => {
  if (mappingData.value.length === 0) return 0
  const sum = mappingData.value.reduce((acc, m) => acc + m.confidence, 0)
  return Math.round((sum / mappingData.value.length) * 100)
})
const confidenceColor = computed(() => {
  if (averageConfidence.value >= 90) return '#67C23A'
  if (averageConfidence.value >= 70) return '#E6A23C'
  return '#F56C6C'
})
const highConfidenceCount = computed(() => mappingData.value.filter(m => m.confidence >= 0.9).length)
const lowConfidenceCount = computed(() => mappingData.value.filter(m => m.confidence < 0.7).length)

const formatReportType = (type: string) => {
  const map: Record<string, string> = { monthly: '月度', quarterly: '季度', yearly: '年度', weekly: '周' }
  return map[type] || type
}

// 方法
const handleSelectTemplate = (template: Template) => {
  selectedTemplate.value = template
  addHistory(`选择模板：${template.name}`)
  ElMessage.success(`已选择模板：${template.name}`)
}

const handleUseMarketPlan = (plan: any) => {
  ElMessage.success(`已加载方案：${plan.name}`)
  selectedTemplate.value = templates.value[0]
  addHistory(`从市场加载方案：${plan.name}`)
  currentStep.value = 1
}

const handleAIRecommend = () => {
  ElMessage.info('AI正在分析字段相似度...')
  setTimeout(() => {
    ElMessage.success('AI推荐已更新')
    addHistory('AI重新分析字段映射')
  }, 1000)
}

const handleAIRecommendAll = () => {
  ElMessage.success('已接受所有AI推荐的高置信度映射')
  addHistory('一键接受所有AI推荐')
}

// 拖拽方法
const handleDragStart = (event: DragEvent, field: any, type: 'template' | 'system') => {
  draggingField.value = field
  draggingType.value = type
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'link'
    event.dataTransfer.setData('text/plain', JSON.stringify({ field, type }))
  }
}

const handleDragEnd = () => {
  draggingField.value = null
  draggingType.value = null
  hoverTarget.value = null
}

const handleDragOver = (field: any, type: 'template' | 'system') => {
  hoverTarget.value = field
}

const handleDrop = (targetField: any, targetType: 'template' | 'system') => {
  if (!draggingField.value || draggingType.value === targetType) return

  // 创建映射
  if (draggingType.value === 'template' && targetType === 'system') {
    const templateFieldName = draggingField.value.alias || draggingField.value.name
    const existing = mappingData.value.find(m => m.templateField === templateFieldName)

    // 检查目标字段是否已被占用
    if (isFieldOccupied(targetField.value) && (!existing || existing.systemField !== targetField.value)) {
      ElMessage.warning(`系统字段"${targetField.label}"已被其他模板字段占用`)
      handleDragEnd()
      return
    }

    if (existing) {
      existing.systemField = targetField.value
      addHistory(`修改映射：${templateFieldName} → ${targetField.label}`)
    } else {
      mappingData.value.push({
        templateField: templateFieldName,
        templateType: draggingField.value.type,
        systemField: targetField.value,
        transform: '',
        formula: '',
        defaultValue: '',
        confidence: 0.85
      })
      addHistory(`创建映射：${templateFieldName} → ${targetField.label}`)
    }
    // 更新字段状态
    draggingField.value.mapped = true
    draggingField.value.mappedTo = targetField.value
    updateMappingConnections()
    detectConflicts()
    ElMessage.success(`已建立映射：${templateFieldName} → ${targetField.label}`)
  }

  handleDragEnd()
}

// 冲突检测
const detectConflicts = () => {
  conflicts.value = []
  const usedSystemFields = new Map<string, string[]>()

  mappingData.value.forEach(m => {
    if (m.systemField) {
      if (!usedSystemFields.has(m.systemField)) {
        usedSystemFields.set(m.systemField, [])
      }
      usedSystemFields.get(m.systemField)!.push(m.templateField)
    }
  })

  usedSystemFields.forEach((templateFields, systemField) => {
    if (templateFields.length > 1) {
      conflicts.value.push({
        message: `系统字段"${systemField}"被多个模板字段映射：${templateFields.join(', ')}`,
        type: 'duplicate',
        fields: templateFields,
        fixType: 'select_one'
      })
    }
  })
}

const isFieldOccupied = (systemFieldValue: string, excludeIndex: number = -1): boolean => {
  return mappingData.value.some((m, idx) => idx !== excludeIndex && m.systemField === systemFieldValue)
}

const isFieldInConflict = (systemFieldValue: string): boolean => {
  return conflicts.value.some(c => c.fields.includes(systemFieldValue))
}

const getGroupMappingCount = (group: SystemFieldGroup): number => {
  return group.fields.filter(f => f.mapped).length
}

const getTypeWarning = (field: TemplateField): boolean => {
  const mapping = mappingData.value.find(m => m.templateField === (field.alias || field.name))
  if (!mapping || !mapping.systemField) return false
  // 简单类型检查示例
  const numericTypes = ['int', 'decimal', 'float', 'number']
  return numericTypes.includes(field.dataType.toLowerCase())
}

const getDataTypeTag = (dataType: string): string => {
  const type = dataType.toLowerCase()
  if (['varchar', 'text', 'string'].includes(type)) return 'info'
  if (['int', 'integer', 'bigint'].includes(type)) return 'warning'
  if (['decimal', 'float', 'double', 'number'].includes(type)) return 'success'
  if (['datetime', 'date', 'timestamp'].includes(type)) return ''
  return 'info'
}

const getSmartSuggestion = (row: MappingRow): string => {
  if (!row.templateType || !row.systemField) return ''

  // 根据模板字段类型推荐数据处理
  if (row.templateType === 'decimal' || row.templateType === 'int') {
    if (!row.transform) return '建议设置"保留2位小数"'
  }
  if (row.templateType === 'datetime' || row.dataType === 'DATETIME') {
    if (!row.transform) return '建议设置"日期格式YYYY-MM-DD"'
  }
  return ''
}

const handleApplySuggestion = (row: MappingRow) => {
  if (row.templateType === 'decimal' || row.templateType === 'int') {
    row.transform = 'fixed2'
    addHistory(`应用建议：${row.templateField} 设置为"保留2位小数"`)
  } else if (row.templateType === 'datetime') {
    row.transform = 'dateFormat'
    addHistory(`应用建议：${row.templateField} 设置为"日期格式"`)
  }
  ElMessage.success('已应用智能建议')
}

const handleResolveConflict = (conflict: Conflict) => {
  if (conflict.type === 'duplicate') {
    ElMessage.info('请在映射列表中选择保留哪个字段的映射')
  }
}

const handleFieldClick = (field: any, type: 'template' | 'system') => {
  console.log('field clicked:', field, type)
}

const handleAutoConnect = () => {
  ElMessage.info('正在根据字段名称相似度自动连线...')
  setTimeout(() => {
    ElMessage.success('自动连线完成')
    addHistory('执行自动连线')
  }, 500)
}

const handleClearConnections = () => {
  ElMessageBox.confirm('确定要清除所有映射连线吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    mappingData.value = []
    templateFields.value.forEach(f => {
      f.mapped = false
      f.mappedTo = undefined
    })
    mappingConnections.value = []
    conflicts.value = []
    addHistory('清除所有映射')
    ElMessage.success('已清除所有映射')
  }).catch(() => {})
}

const updateMappingConnections = () => {
  mappingConnections.value = mappingData.value
    .filter(m => m.systemField)
    .map(m => ({
      templateField: m.templateField,
      systemField: m.systemField,
      path: `M 200 100 L 400 100`,
      confidence: m.confidence,
      hasConflict: isFieldInConflict(m.systemField)
    }))
}

const addHistory = (action: string) => {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  mappingHistory.value.push({ action, time })
}

const handleTemplateFieldCommand = (command: string) => {
  if (command === 'expand') {
    templateFieldTab.value = 'all'
  } else if (command === 'collapse') {
    templateFieldTab.value = 'mapped'
  } else if (command === 'clear') {
    handleClearConnections()
  }
}

const handleParseTemplateFields = () => {
  ElMessage.success('已刷新模板字段列表')
  addHistory('刷新模板字段')
}

const handleRefreshSystemFields = () => {
  ElMessage.success('已刷新系统字段列表')
}

const handleFieldChange = (row: MappingRow, index: number) => {
  // 更新映射状态
  const templateField = templateFields.value.find(f => (f.alias || f.name) === row.templateField)
  if (templateField) {
    templateField.mapped = !!row.systemField
    templateField.mappedTo = row.systemField || undefined
  }
  addHistory(`修改映射：${row.templateField} → ${row.systemField || '(未映射)'}`)
  updateMappingConnections()
  detectConflicts()
}

const handleTransformChange = (row: MappingRow) => {
  addHistory(`修改映射：${row.templateField}的数据处理为"${row.transform || '无'}"`)
}

const handleFormulaChange = (row: MappingRow) => {
  addHistory(`修改映射：${row.templateField}的公式`)
}

const handleExpandTypeChange = (row: MappingRow) => {
  // 扩展方向变更时，清空汇总方式
  if (row.expandType !== 'none') {
    row.aggregate = ''
  }
  addHistory(`修改映射：${row.templateField}的扩展方向为"${row.expandType === 'none' ? '不扩展' : row.expandType === 'right' ? '从左到右' : '从上到下'}"`)
  updateMappingConnections()
}

const handleAggregateChange = (row: MappingRow) => {
  addHistory(`修改映射：${row.templateField}的汇总方式为"${row.aggregate || '无'}"`)
  updateMappingConnections()
}

const handleRemoveMapping = (index: number) => {
  const removed = mappingData.value[index]
  const templateField = templateFields.value.find(f => (f.alias || f.name) === removed.templateField)
  if (templateField) {
    templateField.mapped = false
    templateField.mappedTo = undefined
  }
  addHistory(`移除映射：${removed.templateField}`)
  mappingData.value.splice(index, 1)
  updateMappingConnections()
  detectConflicts()
}

const handleEditMapping = (row: MappingRow, index: number) => {
  editForm.index = index
  editForm.templateField = row.templateField
  editForm.systemField = row.systemField
  editForm.transform = row.transform
  editForm.formula = row.formula || ''
  editForm.defaultValue = row.defaultValue || ''
  editMappingDialogVisible.value = true
}

const handleEditMappingConfirm = () => {
  if (editForm.index >= 0) {
    const row = mappingData.value[editForm.index]
    row.systemField = editForm.systemField
    row.transform = editForm.transform
    row.formula = editForm.formula
    row.defaultValue = editForm.defaultValue
    addHistory(`编辑映射：${row.templateField}`)
    updateMappingConnections()
    detectConflicts()
  }
  editMappingDialogVisible.value = false
  ElMessage.success('映射已更新')
}

const handleBatchTransform = () => {
  batchSelectedFields.value = mappingData.value.filter(m => m.systemField).map(m => m.templateField)
  batchTransformDialogVisible.value = true
}

const handleBatchTransformConfirm = () => {
  if (!batchForm.transform) {
    ElMessage.warning('请选择数据处理方式')
    return
  }
  mappingData.value.forEach(m => {
    if (batchSelectedFields.value.includes(m.templateField)) {
      m.transform = batchForm.transform
      if (batchForm.defaultValue) {
        m.defaultValue = batchForm.defaultValue
      }
    }
  })
  addHistory(`批量设置数据处理：${batchForm.transform}`)
  batchTransformDialogVisible.value = false
  ElMessage.success('批量设置成功')
}

const handleClearAllMappings = () => {
  ElMessageBox.confirm('确定要清除所有映射配置吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    mappingData.value = []
    templateFields.value.forEach(f => {
      f.mapped = false
      f.mappedTo = undefined
    })
    mappingConnections.value = []
    conflicts.value = []
    addHistory('清除所有映射')
    ElMessage.success('已清除所有映射')
  }).catch(() => {})
}

const handleFixWarning = (warning: any) => {
  ElMessage.info('正在应用解决方案...')
}

const handleValidateMapping = () => {
  if (conflicts.value.length > 0) {
    ElMessage.warning(`发现 ${conflicts.value.length} 个冲突，请先解决后再继续`)
  } else if (unmappedCount.value > 0) {
    ElMessage.warning(`还有 ${unmappedCount.value} 个字段未映射`)
  } else {
    ElMessage.success('映射验证通过！')
  }
}

const handleRefreshPreview = () => {
  ElMessage.success('预览已刷新')
}

const handleExportMapping = () => {
  const exportData = {
    version: saveForm.version || 'v1.0',
    template: selectedTemplate.value,
    mappings: mappingData.value,
    exportTime: new Date().toISOString()
  }
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `mapping_config_${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('映射配置已导出')
  addHistory('导出映射配置')
}

const handleImportMapping = () => {
  importFile.value = null
  importDialogVisible.value = true
}

const handleFileChange = (uploadFile: any) => {
  importFile.value = uploadFile.raw
}

const handleImportConfirm = () => {
  if (!importFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      if (data.mappings && Array.isArray(data.mappings)) {
        mappingData.value = data.mappings
        addHistory(`导入映射配置：${data.mappings.length}个字段`)
        ElMessage.success('映射配置导入成功')
        importDialogVisible.value = false
        updateMappingConnections()
        detectConflicts()
      } else {
        ElMessage.error('文件格式不正确')
      }
    } catch (err) {
      ElMessage.error('文件解析失败')
    }
  }
  reader.readAsText(importFile.value)
}

const handleSavePlan = () => {
  if (!saveForm.name) {
    ElMessage.warning('请输入方案名称')
    return
  }
  if (saveForm.publishToMarket) {
    ElMessage.success('映射方案已保存并发布到映射市场')
    addHistory(`发布方案到市场：${saveForm.name}`)
  } else {
    ElMessage.success('映射方案保存成功')
    addHistory(`保存方案：${saveForm.name}`)
  }
}

const handleFinish = () => {
  ElMessage.success('字段映射配置完成！现在可以前往"报表生成"生成报表。')
}

const handleUsePlan = (plan: any) => {
  ElMessage.success(`已加载方案：${plan.name}`)
  addHistory(`使用方案：${plan.name}`)
}

const handleCopyPlan = (plan: any) => {
  ElMessage.success(`方案"${plan.name}"已复制`)
  addHistory(`复制方案：${plan.name}`)
}

const handleExportPlan = (plan: any) => {
  ElMessage.success(`方案"${plan.name}"已导出`)
  addHistory(`导出方案：${plan.name}`)
}

const handleDeletePlan = (plan: any) => {
  ElMessage.success(`方案"${plan.name}"已删除`)
  addHistory(`删除方案：${plan.name}`)
}

// 监听映射变化，检测冲突
watch(mappingData, () => {
  detectConflicts()
}, { deep: true })
</script>

<style scoped>
.field-mapper {
  padding: 0;
}

.steps-container {
  background: #fff;
  padding: 30px 50px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.step-content {
  background: #fff;
  padding: 30px;
  border-radius: 8px;
}

.step-header {
  margin-bottom: 25px;
}

.step-header h3 {
  margin: 0 0 8px 0;
  color: #303133;
}

.step-desc {
  color: #909399;
  margin: 0;
  font-size: 14px;
}

/* 模板选择相关 */
.template-tabs {
  margin-bottom: 20px;
}

.template-selector {
  margin-bottom: 30px;
}

.template-card {
  background: #f8f9fa;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  margin-bottom: 20px;
}

.template-card:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.template-card.is-selected {
  border-color: #67c23a;
  background: #f0f9eb;
}

.template-icon {
  font-size: 40px;
  color: #409eff;
  margin-bottom: 15px;
}

.template-info h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
}

.template-info p {
  margin: 0 0 10px 0;
  color: #909399;
  font-size: 13px;
}

.template-tags {
  display: flex;
  gap: 8px;
}

.template-check {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 24px;
  height: 24px;
  background: #67c23a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

/* 映射市场 */
.mapping-market {
  padding: 10px 0;
}

.market-search {
  display: flex;
  margin-bottom: 20px;
}

.market-grid {
  max-height: 400px;
  overflow-y: auto;
}

.market-card {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 16px;
}

.market-card:hover {
  border-color: #409eff;
  background: #ecf5ff;
  transform: translateY(-2px);
}

.market-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.market-plan-name {
  font-weight: 600;
  color: #303133;
}

.market-card-body {
  margin-bottom: 10px;
}

.market-field-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
}

.field-count {
  color: #409eff;
}

.compatibility {
  color: #67c23a;
  font-weight: 500;
}

.market-tags {
  display: flex;
  gap: 5px;
}

.market-card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

/* 步骤操作按钮 */
.step-actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* AI推荐栏 */
.ai-recommend-bar {
  background: #f0f9eb;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ai-recommend-actions {
  display: flex;
  gap: 10px;
}

/* 冲突提示 */
.conflict-alert {
  background: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 20px;
}

.conflict-list {
  margin-top: 10px;
}

.conflict-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px dashed #fde2e2;
  color: #f56c6c;
}

.conflict-item:last-child {
  border-bottom: none;
}

/* 映射历史 */
.mapping-history {
  margin-bottom: 15px;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  font-size: 13px;
}

.history-item:last-child {
  border-bottom: none;
}

.history-action {
  color: #606266;
}

.history-time {
  color: #909399;
}

/* 可视化映射区域 */
.visual-mapping-area {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  min-height: 400px;
}

.mapping-column {
  flex: 1;
  background: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.column-header {
  background: #f5f7fa;
  padding: 12px 15px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 5px;
}

.column-search {
  padding: 10px 15px;
  border-bottom: 1px solid #e4e7ed;
}

.field-group-tabs {
  padding: 0 10px;
}

.field-list {
  padding: 10px;
  max-height: 350px;
  overflow-y: auto;
}

.field-item {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 8px;
  cursor: grab;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.field-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.field-item.is-mapped {
  background: #f0f9eb;
  border-color: #67c23a;
}

.field-item.is-dragging {
  opacity: 0.5;
  transform: scale(1.02);
}

.field-item.is-hover-target {
  border-color: #409eff;
  border-style: dashed;
  background: #ecf5ff;
}

.field-item.is-type-warning {
  border-color: #e6a23c;
}

.field-item.is-conflict {
  border-color: #f56c6c;
  background: #fef0f0;
}

.field-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-icon {
  color: #909399;
  font-size: 14px;
}

.field-name {
  font-size: 13px;
  color: #303133;
}

.type-warning-icon {
  color: #e6a23c;
  font-size: 14px;
}

.mapped-target {
  font-size: 12px;
  color: #67c23a;
}

.field-type-tag {
  font-size: 11px;
  color: #909399;
  background: #f4f4f5;
  padding: 2px 6px;
  border-radius: 3px;
}

.field-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mapping-status {
  display: flex;
  align-items: center;
}

.drag-handle {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #c0c4cc;
  cursor: grab;
  opacity: 0;
  transition: opacity 0.2s;
}

.field-item:hover .drag-handle {
  opacity: 1;
}

/* 映射连线区域 */
.mapping-lines-area {
  width: 120px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.mapping-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.mapping-svg path.is-high-confidence {
  stroke: #67c23a;
  stroke-width: 3;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1;
}

/* 字段折叠面板 */
.field-collapse {
  border: none;
}

.field-collapse :deep(.el-collapse-item__header) {
  background: transparent;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 15px;
  font-size: 13px;
}

.field-collapse :deep(.el-collapse-item__content) {
  padding: 0;
}

.field-collapse :deep(.el-collapse-item__wrap) {
  border: none;
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-list-system {
  padding: 5px 10px;
}

.field-list-system .field-item {
  padding: 8px 10px;
}

.system-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ml-5 {
  margin-left: 5px;
}

/* 映射详情表格 */
.mapping-detail-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px 15px;
  background: #f5f7fa;
  border-radius: 6px;
}

.section-header span {
  font-weight: 600;
  color: #303133;
}

.section-actions {
  display: flex;
  gap: 10px;
}

.mapping-detail-table .template-field-name {
  font-weight: 500;
  color: #409eff;
}

.mapping-detail-table :deep(.mapping-row) {
  background-color: #fff;
}

.mapping-detail-table :deep(.mapping-row:hover) {
  background-color: #f5f7fa;
}

.empty-tip {
  color: #909399;
  font-size: 12px;
}

.no-suggestion {
  color: #c0c4cc;
}

.ml-8 {
  margin-left: 8px;
}

/* 警告列表 */
.mapping-warnings {
  background: #fdf6ec;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.warning-list {
  margin-top: 15px;
}

.warning-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px dashed #eee;
  color: #e6a23c;
}

.warning-item:last-child {
  border-bottom: none;
}

/* 保存表单 */
.save-form {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.form-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

/* 映射摘要 */
.mapping-summary {
  margin-bottom: 25px;
}

.mapping-summary h4 {
  margin-bottom: 15px;
  color: #303133;
}

/* 映射预览 */
.mapping-preview {
  margin-bottom: 25px;
}

.mapping-preview h4 {
  margin-bottom: 15px;
  color: #303133;
}

.preview-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.preview-content {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.json-preview {
  background: #f5f7fa;
  padding: 15px;
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  max-height: 300px;
  overflow-y: auto;
}

/* 已保存方案 */
.saved-plans h4 {
  margin-bottom: 15px;
  color: #303133;
}

.mr-8 {
  margin-right: 8px;
}

/* 导入区域 */
.import-area {
  padding: 20px;
}

.import-area :deep(.el-upload-dragger) {
  padding: 40px 20px;
}
</style>
