<template>
  <div class="report-generator">
    <!-- 报表生成配置区 -->
    <div class="generate-config" v-if="!showDesigner">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span><strong>报表生成配置</strong></span>
          </div>
        </template>
        <el-form :inline="true" :model="configForm">
          <el-form-item label="选择模板">
            <el-select v-model="configForm.templateId" placeholder="请选择模板" style="width: 250px" @change="handleTemplateChange">
              <el-option label="北京科技月度订单报表模板" :value="1" />
              <el-option label="上海贸易月度对账模板" :value="2" />
              <el-option label="广州电子季度报表模板" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="映射方案">
            <el-select v-model="configForm.mappingId" placeholder="请选择映射方案" style="width: 250px">
              <el-option label="北京科技月度报表映射配置" :value="1" />
              <el-option label="上海贸易标准映射方案" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="报表周期">
            <el-date-picker v-model="configForm.period" type="month" placeholder="请选择月份" value-format="YYYY-MM" style="width: 180px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleGenerate" :loading="generating">
              <el-icon><MagicStick /></el-icon>
              {{ generating ? '生成中...' : '一键生成报表' }}
            </el-button>
          </el-form-item>
        </el-form>

        <el-form :inline="true" :model="batchForm" style="margin-top: 15px">
          <el-form-item label="批量生成">
            <el-date-picker v-model="batchForm.periods" type="months" range-separator="至" start-placeholder="开始月份" end-placeholder="结束月份" value-format="YYYY-MM" style="width: 280px" />
          </el-form-item>
          <el-form-item>
            <el-button @click="handleBatchGenerate">
              <el-icon><Box /></el-icon>
              批量生成
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 生成进度 -->
    <div class="generate-progress" v-if="showProgress">
      <el-card shadow="never">
        <template #header>
          <span><strong>正在生成报表...</strong></span>
        </template>
        <div class="progress-content">
          <el-progress :percentage="progressPercent" :status="progressStatus" />
          <p class="progress-text">正在从订单系统提取 2026年03月 的订单数据...</p>
          <p class="progress-detail">已处理：128 / 256 条订单</p>
        </div>
      </el-card>
    </div>

    <!-- 电子表格设计器 -->
    <div class="spreadsheet-designer" v-if="showDesigner">
      <!-- 工具栏 -->
      <div class="designer-toolbar">
        <!-- 服务器区域 -->
        <div class="toolbar-section">
          <span class="section-title">服务器</span>
          <el-tooltip content="登录服务器">
            <el-button size="small" @click="handleToolbarAction('login')">
              <el-icon><Key /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="注销">
            <el-button size="small" @click="handleToolbarAction('logout')">
              <el-icon><SwitchButton /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="设置服务器">
            <el-button size="small" @click="handleToolbarAction('setting')">
              <el-icon><Setting /></el-icon>
            </el-button>
          </el-tooltip>
        </div>

        <el-divider direction="vertical" />

        <!-- 报表操作区域 -->
        <div class="toolbar-section">
          <span class="section-title">报表操作</span>
          <el-tooltip content="打开报表">
            <el-button size="small" @click="handleToolbarAction('open')">
              <el-icon><FolderOpened /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="预览报表">
            <el-button size="small" type="primary" @click="handlePreview">
              <el-icon><View /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="执行报表">
            <el-button size="small" @click="handleToolbarAction('execute')">
              <el-icon><VideoPlay /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="重置报表">
            <el-button size="small" @click="handleToolbarAction('reset')">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="发布报表">
            <el-button size="small" type="success" @click="handleToolbarAction('publish')">
              <el-icon><Upload /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="另存为">
            <el-button size="small" @click="handleToolbarAction('saveAs')">
              <el-icon><DocumentCopy /></el-icon>
            </el-button>
          </el-tooltip>
        </div>

        <el-divider direction="vertical" />

        <!-- 图形区域 -->
        <div class="toolbar-section">
          <span class="section-title">图形</span>
          <el-tooltip content="插入图表">
            <el-button size="small" @click="handleInsertChart">
              <el-icon><DataLine /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="图表模板">
            <el-button size="small" @click="handleToolbarAction('chartTemplate')">
              <el-icon><PieChart /></el-icon>
            </el-button>
          </el-tooltip>
        </div>

        <el-divider direction="vertical" />

        <!-- 视图控制 -->
        <div class="toolbar-section">
          <span class="section-title">视图</span>
          <el-tooltip :content="showDatasetPanel ? '隐藏数据集' : '显示数据集'">
            <el-button size="small" :type="showDatasetPanel ? 'primary' : ''" @click="showDatasetPanel = !showDatasetPanel">
              <el-icon><Grid /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="显示/隐藏属性面板">
            <el-button size="small" :type="showPropertyPanel ? 'primary' : ''" @click="showPropertyPanel = !showPropertyPanel">
              <el-icon><Setting /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <!-- 主体区域：数据集面板 + 报表设计区 + 属性面板 -->
      <div class="designer-main">
        <!-- 数据集面板 -->
        <div class="dataset-panel" v-if="showDatasetPanel">
          <div class="panel-header">
            <span>数据集</span>
            <el-button size="small" link @click="handleNewDataset">
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>

          <!-- 搜索 -->
          <div class="dataset-search">
            <el-input v-model="datasetSearch" placeholder="搜索字段..." size="small" clearable>
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>

          <!-- 数据集列表 -->
          <div class="dataset-list">
            <el-collapse v-model="activeDatasets" class="dataset-collapse">
              <el-collapse-item title="订单模型" name="orderModel">
                <template #title>
                  <div class="dataset-title">
                    <el-icon><Connection /></el-icon>
                    <span>订单模型</span>
                  </div>
                </template>
                <div
                  v-for="field in filteredOrderFields"
                  :key="field.name"
                  class="field-item"
                  draggable="true"
                  @dragstart="handleFieldDragStart($event, field)"
                  @dblclick="handleFieldDoubleClick(field)"
                >
                  <el-icon class="field-icon"><Key /></el-icon>
                  <span class="field-name">{{ field.alias || field.name }}</span>
                  <el-tag size="small" type="info">{{ field.type }}</el-tag>
                </div>
              </el-collapse-item>

              <el-collapse-item title="客户模型" name="customerModel">
                <template #title>
                  <div class="dataset-title">
                    <el-icon><User /></el-icon>
                    <span>客户模型</span>
                  </div>
                </template>
                <div
                  v-for="field in filteredCustomerFields"
                  :key="field.name"
                  class="field-item"
                  draggable="true"
                  @dragstart="handleFieldDragStart($event, field)"
                  @dblclick="handleFieldDoubleClick(field)"
                >
                  <el-icon class="field-icon"><Key /></el-icon>
                  <span class="field-name">{{ field.alias || field.name }}</span>
                  <el-tag size="small" type="info">{{ field.type }}</el-tag>
                </div>
              </el-collapse-item>

              <el-collapse-item title="财务模型" name="financeModel">
                <template #title>
                  <div class="dataset-title">
                    <el-icon><Money /></el-icon>
                    <span>财务模型</span>
                  </div>
                </template>
                <div
                  v-for="field in filteredFinanceFields"
                  :key="field.name"
                  class="field-item"
                  draggable="true"
                  @dragstart="handleFieldDragStart($event, field)"
                  @dblclick="handleFieldDoubleClick(field)"
                >
                  <el-icon class="field-icon"><Key /></el-icon>
                  <span class="field-name">{{ field.alias || field.name }}</span>
                  <el-tag size="small" type="info">{{ field.type }}</el-tag>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>

        <!-- 报表设计区 -->
        <div class="report-design-area">
          <!-- 报表区域切换 -->
          <div class="report-region-tabs">
            <el-radio-group v-model="currentRegion" size="small">
              <el-radio-button value="header">表头</el-radio-button>
              <el-radio-button value="data">数据区</el-radio-button>
              <el-radio-button value="footer">表尾</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 电子表格 -->
          <div class="spreadsheet-container">
            <!-- 行号列 -->
            <div class="row-headers">
              <div class="corner-cell" @click="selectAll">全选</div>
              <div
                v-for="row in spreadsheetData.rows"
                :key="'row-' + row.index"
                class="row-header"
                :class="{ 'is-selected': selectedRow === row.index, 'is-header-row': row.isHeader }"
                @click="selectRow(row.index)"
              >
                <span class="row-number">{{ row.index + 1 }}</span>
                <el-input-number
                  v-model="row.height"
                  :min="20"
                  :max="200"
                  size="small"
                  @click.stop
                  @change="updateRowHeight(row.index)"
                  class="row-height-input"
                />
              </div>
            </div>

            <!-- 列头行 -->
            <div class="col-headers-row">
              <div class="col-headers">
                <div
                  v-for="col in spreadsheetData.cols"
                  :key="'col-' + col.index"
                  class="col-header"
                  :class="{ 'is-selected': selectedCol === col.index, 'is-data-col': col.isData }"
                  @click="selectCol(col.index)"
                >
                  <span class="col-name">{{ col.name }}</span>
                  <el-input-number
                    v-model="col.width"
                    :min="50"
                    :max="500"
                    size="small"
                    @click.stop
                    @change="updateColWidth(col.index)"
                    class="col-width-input"
                  />
                </div>
              </div>
            </div>

            <!-- 表格主体 -->
            <div class="spreadsheet-body" ref="spreadsheetRef" @dragover.prevent @drop="handleFieldDrop">
              <table class="spreadsheet-table">
                <tbody>
                  <tr
                    v-for="(row, rowIdx) in spreadsheetData.rows"
                    :key="rowIdx"
                    :class="{ 'is-header-row': row.isHeader, 'is-footer-row': row.isFooter }"
                  >
                    <td
                      v-for="(col, colIdx) in spreadsheetData.cols"
                      :key="colIdx"
                      class="spreadsheet-cell"
                      :class="{
                        'is-selected': isCellSelected(rowIdx, colIdx),
                        'is-row-selected': selectedRow === rowIdx,
                        'is-col-selected': selectedCol === colIdx,
                        'is-bound': getCellBinding(rowIdx, colIdx),
                        'is-header-cell': row.isHeader || isHeaderArea(rowIdx),
                        'is-footer-cell': row.isFooter || isFooterArea(rowIdx),
                        'is-drag-over': dragOverCell?.row === rowIdx && dragOverCell?.col === colIdx
                      }"
                      :style="getCellStyle(rowIdx, colIdx)"
                      @click="handleCellClick(rowIdx, colIdx, $event)"
                      @dblclick="handleCellDoubleClick(rowIdx, colIdx)"
                      @dragover="handleCellDragOver(rowIdx, colIdx, $event)"
                      @dragleave="handleCellDragLeave"
                      @drop.prevent="handleCellDrop(rowIdx, colIdx, $event)"
                    >
                      <div class="cell-content">
                        <!-- 绑定信息 -->
                        <template v-if="getCellBinding(rowIdx, colIdx)">
                          <div class="cell-binding-info">
                            <el-icon><Link /></el-icon>
                            <span class="binding-field">{{ getCellBinding(rowIdx, colIdx)?.fieldName }}</span>
                            <div class="binding-tags">
                              <el-tag size="small" :type="getExpandTypeTag(getCellBinding(rowIdx, colIdx)?.expandType)">
                                {{ getExpandTypeText(getCellBinding(rowIdx, colIdx)?.expandType) }}
                              </el-tag>
                              <el-tag size="small" type="warning" v-if="getCellBinding(rowIdx, colIdx)?.aggregate">
                                {{ getCellBinding(rowIdx, colIdx)?.aggregate }}
                              </el-tag>
                            </div>
                          </div>
                        </template>
                        <!-- 显示值 -->
                        <template v-else-if="row.cells[colIdx]?.displayValue">
                          <span>{{ row.cells[colIdx].displayValue }}</span>
                        </template>
                        <!-- 占位符 -->
                        <template v-else>
                          <span class="cell-placeholder" v-if="!row.isHeader && !row.isFooter">
                            {{ getCellPlaceholder(rowIdx, colIdx) }}
                          </span>
                        </template>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 单元格信息栏 -->
          <div class="cell-info-bar">
            <span class="cell-address">
              <el-icon><Location /></el-icon>
              {{ selectedCell ? getCellAddress(selectedCell.row, selectedCell.col) : '未选择' }}
            </span>
            <el-divider direction="vertical" />
            <template v-if="getCurrentCellBinding()">
              <span>绑定: <strong>{{ getCurrentCellBinding()?.fieldName }}</strong></span>
              <el-divider direction="vertical" />
              <span>扩展: {{ getExpandTypeText(getCurrentCellBinding()?.expandType) }}</span>
              <template v-if="getCurrentCellBinding()?.aggregate">
                <el-divider direction="vertical" />
                <span>汇总: {{ getCurrentCellBinding()?.aggregate }}</span>
              </template>
              <template v-if="getCurrentCellBinding()?.leftParent">
                <el-divider direction="vertical" />
                <span>左父格: {{ getCurrentCellBinding()?.leftParent }}</span>
              </template>
              <template v-if="getCurrentCellBinding()?.topParent">
                <el-divider direction="vertical" />
                <span>上父格: {{ getCurrentCellBinding()?.topParent }}</span>
              </template>
            </template>
            <template v-else>
              <span class="no-binding">未绑定数据</span>
            </template>
          </div>
        </div>

        <!-- 属性面板 -->
        <div class="property-panel" v-if="showPropertyPanel">
          <div class="panel-header">
            <span>单元格属性</span>
          </div>

          <div class="property-content" v-if="selectedCell">
            <!-- 绑定设置 -->
            <div class="property-section">
              <div class="section-title">数据绑定</div>
              <el-form label-width="80px" size="small">
                <el-form-item label="绑定字段">
                  <el-select v-model="cellProperty.fieldName" placeholder="请选择" clearable @change="handleBindingChange">
                    <el-option-group v-for="group in availableFields" :key="group.label" :label="group.label">
                      <el-option v-for="field in group.options" :key="field.value" :label="field.label" :value="field.value" />
                    </el-option-group>
                  </el-select>
                </el-form-item>

                <el-form-item label="扩展方向">
                  <el-select v-model="cellProperty.expandType" placeholder="扩展方向" @change="handlePropertyChange">
                    <el-option label="不扩展" value="none" />
                    <el-option label="从左到右" value="right" />
                    <el-option label="从上到下" value="down" />
                  </el-select>
                </el-form-item>

                <el-form-item label="汇总方式" v-if="cellProperty.expandType === 'none'">
                  <el-select v-model="cellProperty.aggregate" placeholder="汇总方式" @change="handlePropertyChange">
                    <el-option label="无" value="" />
                    <el-option label="求和 (SUM)" value="SUM" />
                    <el-option label="平均值 (AVG)" value="AVG" />
                    <el-option label="计数 (COUNT)" value="COUNT" />
                    <el-option label="最大值 (MAX)" value="MAX" />
                    <el-option label="最小值 (MIN)" value="MIN" />
                  </el-select>
                </el-form-item>

                <el-form-item label="数据格式">
                  <el-select v-model="cellProperty.format" placeholder="数据格式" @change="handlePropertyChange">
                    <el-option label="默认" value="" />
                    <el-option label="千分位" value="thousand" />
                    <el-option label="货币 (¥)" value="currency" />
                    <el-option label="百分比" value="percent" />
                    <el-option label="日期" value="date" />
                  </el-select>
                </el-form-item>
              </el-form>
            </div>

            <!-- 父格设置 -->
            <div class="property-section">
              <div class="section-title">父格设置</div>
              <el-form label-width="80px" size="small">
                <el-form-item label="左父格">
                  <el-input v-model="cellProperty.leftParent" placeholder="左父格单元格" clearable @change="handlePropertyChange" />
                </el-form-item>
                <el-form-item label="上父格">
                  <el-input v-model="cellProperty.topParent" placeholder="上父格单元格" clearable @change="handlePropertyChange" />
                </el-form-item>
              </el-form>
            </div>

            <!-- 扩展属性 -->
            <div class="property-section">
              <div class="section-title">扩展属性</div>
              <el-form label-width="80px" size="small">
                <el-form-item label="数据过滤">
                  <el-button size="small" @click="handleShowFilter">
                    <el-icon><Filter /></el-icon>
                    设置过滤
                  </el-button>
                </el-form-item>
                <el-form-item label="插入方式">
                  <el-radio-group v-model="cellProperty.insertType" @change="handlePropertyChange">
                    <el-radio label="insert">插入</el-radio>
                    <el-radio label="cover">覆盖</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="关联分页">
                  <el-switch v-model="cellProperty.pageBreak" @change="handlePropertyChange" />
                </el-form-item>
              </el-form>
            </div>

            <!-- 样式设置 -->
            <div class="property-section">
              <div class="section-title">样式设置</div>
              <el-form label-width="80px" size="small">
                <el-form-item label="背景色">
                  <el-color-picker v-model="cellProperty.bgColor" size="small" @change="handleStyleChange" />
                </el-form-item>
                <el-form-item label="字体色">
                  <el-color-picker v-model="cellProperty.fontColor" size="small" @change="handleStyleChange" />
                </el-form-item>
                <el-form-item label="对齐方式">
                  <el-radio-group v-model="cellProperty.align" @change="handleStyleChange">
                    <el-radio label="left">左</el-radio>
                    <el-radio label="center">中</el-radio>
                    <el-radio label="right">右</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="字体样式">
                  <el-checkbox-group v-model="cellProperty.fontStyle" @change="handleStyleChange">
                    <el-checkbox label="bold">加粗</el-checkbox>
                    <el-checkbox label="italic">斜体</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-form>
            </div>
          </div>

          <div class="property-content empty-state" v-else>
            <el-empty description="请选择单元格" :image-size="60" />
          </div>
        </div>
      </div>
    </div>

    <!-- 单元格绑定对话框 -->
    <el-dialog v-model="bindingDialogVisible" title="单元格数据绑定" width="600px">
      <el-form :model="bindingForm" label-width="100px">
        <el-alert type="info" :closable="false" style="margin-bottom: 20px">
          <template #title>
            <span>为单元格 <strong>{{ bindingForm.cellAddress }}</strong> 绑定数据字段</span>
          </template>
        </el-alert>

        <el-form-item label="绑定字段" required>
          <el-select v-model="bindingForm.fieldName" placeholder="请选择绑定字段" style="width: 100%" filterable @change="handleBindingFieldChange">
            <el-option-group v-for="group in availableFields" :key="group.label" :label="group.label">
              <el-option v-for="field in group.options" :key="field.value" :label="field.label" :value="field.value" />
            </el-option-group>
          </el-select>
        </el-form-item>

        <el-form-item label="扩展方向">
          <el-radio-group v-model="bindingForm.expandType" @change="handleBindingExpandChange">
            <el-radio label="none">不扩展</el-radio>
            <el-radio label="right">从左到右</el-radio>
            <el-radio label="down">从上到下</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="汇总方式" v-if="bindingForm.expandType === 'none'">
          <el-select v-model="bindingForm.aggregate" placeholder="请选择汇总方式" style="width: 100%">
            <el-option label="无汇总" value="" />
            <el-option label="求和 (SUM)" value="SUM" />
            <el-option label="平均值 (AVG)" value="AVG" />
            <el-option label="计数 (COUNT)" value="COUNT" />
            <el-option label="最大值 (MAX)" value="MAX" />
            <el-option label="最小值 (MIN)" value="MIN" />
          </el-select>
        </el-form-item>

        <el-form-item label="左父格">
          <el-input v-model="bindingForm.leftParent" placeholder="如: B2" />
        </el-form-item>

        <el-form-item label="上父格">
          <el-input v-model="bindingForm.topParent" placeholder="如: A1" />
        </el-form-item>

        <el-form-item label="数据格式">
          <el-select v-model="bindingForm.format" placeholder="请选择数据格式" style="width: 100%">
            <el-option label="默认格式" value="" />
            <el-option label="千分位分隔" value="thousand" />
            <el-option label="货币格式 (¥)" value="currency" />
            <el-option label="百分比 (%)" value="percent" />
            <el-option label="日期格式" value="date" />
          </el-select>
        </el-form-item>

        <el-form-item label="默认值">
          <el-input v-model="bindingForm.defaultValue" placeholder="数据为空时的默认值" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="bindingDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleUnbindCell" v-if="bindingForm.isBound">解除绑定</el-button>
        <el-button type="primary" @click="handleConfirmBinding">确认绑定</el-button>
      </template>
    </el-dialog>

    <!-- 过滤设置对话框 -->
    <el-dialog v-model="filterDialogVisible" title="数据过滤设置" width="500px">
      <el-form :model="filterForm" label-width="100px">
        <el-form-item label="过滤字段">
          <el-select v-model="filterForm.field" placeholder="请选择" style="width: 100%">
            <el-option v-for="field in availableFilterFields" :key="field.value" :label="field.label" :value="field.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="过滤条件">
          <el-select v-model="filterForm.operator" placeholder="请选择" style="width: 100%">
            <el-option label="等于" value="=" />
            <el-option label="不等于" value="!=" />
            <el-option label="大于" value=">" />
            <el-option label="小于" value="<" />
            <el-option label="大于等于" value=">=" />
            <el-option label="小于等于" value="<=" />
            <el-option label="包含" value="like" />
            <el-option label="不包含" value="notLike" />
          </el-select>
        </el-form-item>
        <el-form-item label="过滤值">
          <el-input v-model="filterForm.value" placeholder="请输入过滤值" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="filterDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmFilter">确定</el-button>
      </template>
    </el-dialog>

    <!-- 图表插入对话框 -->
    <el-dialog v-model="chartDialogVisible" title="插入图表" width="600px">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="chart-type-card" @click="handleSelectChartType('line')">
            <el-icon :size="40"><DataLine /></el-icon>
            <p>折线图</p>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="chart-type-card" @click="handleSelectChartType('bar')">
            <el-icon :size="40"><Histogram /></el-icon>
            <p>柱状图</p>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="chart-type-card" @click="handleSelectChartType('pie')">
            <el-icon :size="40"><PieChart /></el-icon>
            <p>饼图</p>
          </div>
        </el-col>
      </el-row>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewDialogVisible" title="报表预览" width="90%" top="20px">
      <div class="preview-container">
        <table class="preview-table">
          <thead>
            <tr>
              <th v-for="col in previewColumns" :key="col">{{ col }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in previewData" :key="idx">
              <td v-for="(val, cidx) in row" :key="cidx">{{ val }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  MagicStick, Box, View, Refresh, Upload, Key, Setting, FolderOpened,
  DocumentCopy, DataLine, PieChart, Histogram, Grid, Plus, Search, Connection,
  User, Money, Link, Location, Filter, SwitchButton, VideoPlay
} from '@element-plus/icons-vue'

// 状态
const generating = ref(false)
const showProgress = ref(false)
const progressPercent = ref(0)
const progressStatus = ref()
const showDesigner = ref(true)
const showDatasetPanel = ref(true)
const showPropertyPanel = ref(true)
const currentRegion = ref('data')
const bindingDialogVisible = ref(false)
const filterDialogVisible = ref(false)
const chartDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const spreadsheetRef = ref<HTMLElement | null>(null)
const datasetSearch = ref('')
const activeDatasets = ref(['orderModel', 'customerModel', 'financeModel'])
const dragOverCell = ref<{ row: number; col: number } | null>(null)

// 选中状态
const selectedCell = ref<{ row: number; col: number } | null>(null)
const selectedRow = ref<number | null>(null)
const selectedCol = ref<number | null>(null)

// 数据集字段
const orderFields = ref([
  { name: 'customerName', alias: '客户名称', type: '字符串' },
  { name: 'orderNo', alias: '订单号', type: '字符串' },
  { name: 'orderTime', alias: '下单时间', type: '日期' },
  { name: 'orderAmount', alias: '订单金额', type: '数值' },
  { name: 'paidAmount', alias: '已付金额', type: '数值' },
  { name: 'unpaidAmount', alias: '未付金额', type: '数值' },
  { name: 'orderStatus', alias: '订单状态', type: '字符串' },
  { name: 'productName', alias: '商品名称', type: '字符串' },
  { name: 'productQty', alias: '商品数量', type: '数值' },
  { name: 'deliveryAddress', alias: '收货地址', type: '字符串' }
])

const customerFields = ref([
  { name: 'customerNo', alias: '客户编号', type: '字符串' },
  { name: 'customerName', alias: '客户名称', type: '字符串' },
  { name: 'contact', alias: '联系人', type: '字符串' },
  { name: 'phone', alias: '联系电话', type: '字符串' },
  { name: 'address', alias: '地址', type: '字符串' }
])

const financeFields = ref([
  { name: 'invoiceNo', alias: '发票号', type: '字符串' },
  { name: 'invoiceAmount', alias: '发票金额', type: '数值' },
  { name: 'taxAmount', alias: '税额', type: '数值' },
  { name: 'invoiceDate', alias: '开票日期', type: '日期' },
  { name: 'paymentStatus', alias: '付款状态', type: '字符串' }
])

// 过滤后的字段
const filteredOrderFields = computed(() => {
  if (!datasetSearch.value) return orderFields.value
  const search = datasetSearch.value.toLowerCase()
  return orderFields.value.filter(f =>
    f.name.toLowerCase().includes(search) || f.alias.toLowerCase().includes(search)
  )
})

const filteredCustomerFields = computed(() => {
  if (!datasetSearch.value) return customerFields.value
  const search = datasetSearch.value.toLowerCase()
  return customerFields.value.filter(f =>
    f.name.toLowerCase().includes(search) || f.alias.toLowerCase().includes(search)
  )
})

const filteredFinanceFields = computed(() => {
  if (!datasetSearch.value) return financeFields.value
  const search = datasetSearch.value.toLowerCase()
  return financeFields.value.filter(f =>
    f.name.toLowerCase().includes(search) || f.alias.toLowerCase().includes(search)
  )
})

// 可用字段（用于绑定）
const availableFields = computed(() => [
  {
    label: '订单信息',
    options: orderFields.value.map(f => ({ label: `${f.alias} (${f.name})`, value: f.name }))
  },
  {
    label: '客户信息',
    options: customerFields.value.map(f => ({ label: `${f.alias} (${f.name})`, value: f.name }))
  },
  {
    label: '财务信息',
    options: financeFields.value.map(f => ({ label: `${f.alias} (${f.name})`, value: f.name }))
  }
])

const availableFilterFields = computed(() => {
  return availableFields.value.flatMap(g => g.options)
})

// 电子表格数据
interface CellData {
  value: string
  displayValue: string
  isEditing: boolean
  style: {
    bold?: boolean
    italic?: boolean
    align?: string
    bgColor?: string
    fontColor?: string
  }
}

interface CellBinding {
  fieldName: string
  expandType: 'none' | 'right' | 'down'
  aggregate?: string
  format?: string
  defaultValue?: string
  leftParent?: string
  topParent?: string
  filter?: { field: string; operator: string; value: string }
}

interface SpreadsheetRow {
  index: number
  height: number
  isHeader: boolean
  isFooter: boolean
  cells: CellData[]
}

interface SpreadsheetCol {
  index: number
  name: string
  width: number
  isData: boolean
}

const spreadsheetData = reactive<{
  rows: SpreadsheetRow[]
  cols: SpreadsheetCol[]
  bindings: Map<string, CellBinding>
}>({
  rows: [],
  cols: [],
  bindings: new Map()
})

// 单元格属性
const cellProperty = reactive({
  fieldName: '',
  expandType: 'none',
  aggregate: '',
  format: '',
  leftParent: '',
  topParent: '',
  insertType: 'insert',
  pageBreak: false,
  bgColor: '#ffffff',
  fontColor: '#000000',
  align: 'left',
  fontStyle: [] as string[]
})

// 绑定表单
const bindingForm = reactive({
  cellAddress: '',
  row: -1,
  col: -1,
  fieldName: '',
  expandType: 'none' as 'none' | 'right' | 'down',
  aggregate: '',
  format: '',
  defaultValue: '',
  leftParent: '',
  topParent: '',
  isBound: false
})

// 过滤表单
const filterForm = reactive({
  field: '',
  operator: '=',
  value: ''
})

// 配置
const configForm = reactive({
  templateId: 1,
  mappingId: 1,
  period: '2026-03'
})

const batchForm = reactive({
  periods: [] as string[]
})

// 预览数据
const previewColumns = ref(['序号', '客户名称', '订单号', '下单时间', '订单金额', '已付金额', '未付金额', '状态'])
const previewData = ref([
  ['1', '北京科技有限公司', 'SO202603010001', '2026-03-01', '128,000.00', '64,000.00', '64,000.00', '执行中'],
  ['2', '上海贸易有限公司', 'SO202603020002', '2026-03-02', '86,000.00', '86,000.00', '0.00', '已完成'],
  ['3', '广州电子有限公司', 'SO202603030003', '2026-03-03', '256,000.00', '0.00', '256,000.00', '待审核']
])

// 初始化电子表格
const initSpreadsheet = () => {
  spreadsheetData.cols = []
  spreadsheetData.rows = []
  spreadsheetData.bindings.clear()

  // 初始化列 (A-H)
  const colNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  for (let i = 0; i < colNames.length; i++) {
    spreadsheetData.cols.push({
      index: i,
      name: colNames[i],
      width: 120,
      isData: i > 0
    })
  }

  // 初始化行 (15行)
  for (let i = 0; i < 15; i++) {
    const row: SpreadsheetRow = {
      index: i,
      height: 40,
      isHeader: i === 0,
      isFooter: i >= 12,
      cells: []
    }
    for (let j = 0; j < colNames.length; j++) {
      row.cells.push({
        value: '',
        displayValue: '',
        isEditing: false,
        style: {}
      })
    }
    spreadsheetData.rows.push(row)
  }

  // 表头行
  const headers = ['序号', '客户名称', '订单号', '下单时间', '订单金额', '已付金额', '未付金额', '订单状态']
  for (let j = 0; j < headers.length; j++) {
    spreadsheetData.rows[0].cells[j].displayValue = headers[j]
    spreadsheetData.rows[0].cells[j].style = {
      bold: true,
      bgColor: '#667eea',
      fontColor: '#ffffff',
      align: 'center'
    }
  }

  // 示例数据行
  const sampleData = [
    ['1', '北京科技有限公司', 'SO202603010001', '2026-03-01', '128,000.00', '64,000.00', '64,000.00', '执行中'],
    ['2', '上海贸易有限公司', 'SO202603020002', '2026-03-02', '86,000.00', '86,000.00', '0.00', '已完成'],
    ['3', '广州电子有限公司', 'SO202603030003', '2026-03-03', '256,000.00', '0.00', '256,000.00', '待审核'],
    ['4', '深圳信息技术有限公司', 'SO202603040004', '2026-03-04', '158,000.00', '79,000.00', '79,000.00', '执行中'],
    ['5', '杭州制造有限公司', 'SO202603050005', '2026-03-05', '98,000.00', '29,400.00', '68,600.00', '执行中']
  ]

  for (let i = 0; i < sampleData.length && i < 10; i++) {
    for (let j = 0; j < sampleData[i].length; j++) {
      spreadsheetData.rows[i + 1].cells[j].displayValue = sampleData[i][j]
    }
  }
}

// 工具栏操作
const handleToolbarAction = (action: string) => {
  const actionMessages: Record<string, string> = {
    login: '登录服务器',
    logout: '注销服务器',
    setting: '服务器设置',
    open: '打开报表',
    execute: '执行报表',
    reset: '重置报表',
    publish: '发布报表',
    saveAs: '另存为',
    chartTemplate: '图表模板'
  }
  ElMessage.info(`执行操作: ${actionMessages[action] || action}`)
}

// 获取单元格地址
const getCellAddress = (row: number, col: number): string => {
  return `${String.fromCharCode(65 + col)}${row + 1}`
}

// 获取单元格绑定
const getCellBinding = (row: number, col: number) => {
  const key = `${row}-${col}`
  return spreadsheetData.bindings.get(key) || null
}

// 设置单元格绑定
const setCellBinding = (row: number, col: number, binding: CellBinding | null) => {
  const key = `${row}-${col}`
  if (binding) {
    spreadsheetData.bindings.set(key, binding)
  } else {
    spreadsheetData.bindings.delete(key)
  }
}

// 获取当前单元格绑定
const getCurrentCellBinding = (): CellBinding | null => {
  if (!selectedCell.value) return null
  return getCellBinding(selectedCell.value.row, selectedCell.value.col)
}

// 获取单元格样式
const getCellStyle = (row: number, col: number) => {
  const cell = spreadsheetData.rows[row]?.cells[col]
  const binding = getCellBinding(row, col)

  const style: any = {
    minWidth: `${spreadsheetData.cols[col]?.width || 120}px`,
    height: `${spreadsheetData.rows[row]?.height || 40}px`
  }

  if (cell?.style) {
    if (cell.style.bold) style.fontWeight = 'bold'
    if (cell.style.italic) style.fontStyle = 'italic'
    if (cell.style.align) style.textAlign = cell.style.align
    if (cell.style.bgColor) style.backgroundColor = cell.style.bgColor
    if (cell.style.fontColor) style.color = cell.style.fontColor
  }

  if (binding) {
    style.border = '2px dashed #409eff'
  }

  return style
}

// 判断是否为选中单元格
const isCellSelected = (row: number, col: number): boolean => {
  return selectedCell.value?.row === row && selectedCell.value?.col === col
}

// 判断是否在表头区域
const isHeaderArea = (row: number): boolean => {
  return currentRegion.value === 'header'
}

// 判断是否在表尾区域
const isFooterArea = (row: number): boolean => {
  return currentRegion.value === 'footer'
}

// 获取单元格占位符
const getCellPlaceholder = (row: number, col: number): string => {
  const binding = getCellBinding(row, col)
  if (binding) return ''
  return '双击绑定或拖拽字段'
}

// 获取扩展类型标签
const getExpandTypeTag = (type: string | undefined): string => {
  switch (type) {
    case 'right': return 'success'
    case 'down': return 'warning'
    default: return 'info'
  }
}

// 获取扩展类型文本
const getExpandTypeText = (type: string | undefined): string => {
  switch (type) {
    case 'right': return '从左到右'
    case 'down': return '从上到下'
    default: return '不扩展'
  }
}

// 单元格点击
const handleCellClick = (row: number, col: number, event: MouseEvent) => {
  selectedCell.value = { row, col }
  selectedRow.value = null
  selectedCol.value = null

  // 更新属性面板
  const binding = getCellBinding(row, col)
  if (binding) {
    cellProperty.fieldName = binding.fieldName
    cellProperty.expandType = binding.expandType
    cellProperty.aggregate = binding.aggregate || ''
    cellProperty.format = binding.format || ''
    cellProperty.leftParent = binding.leftParent || ''
    cellProperty.topParent = binding.topParent || ''
    cellProperty.bgColor = spreadsheetData.rows[row].cells[col].style.bgColor || '#ffffff'
    cellProperty.fontColor = spreadsheetData.rows[row].cells[col].style.fontColor || '#000000'
    cellProperty.align = spreadsheetData.rows[row].cells[col].style.align || 'left'
    cellProperty.fontStyle = []
    if (spreadsheetData.rows[row].cells[col].style.bold) cellProperty.fontStyle.push('bold')
    if (spreadsheetData.rows[row].cells[col].style.italic) cellProperty.fontStyle.push('italic')
  } else {
    cellProperty.fieldName = ''
    cellProperty.expandType = 'none'
    cellProperty.aggregate = ''
    cellProperty.format = ''
    cellProperty.leftParent = ''
    cellProperty.topParent = ''
    cellProperty.bgColor = spreadsheetData.rows[row].cells[col].style.bgColor || '#ffffff'
    cellProperty.fontColor = spreadsheetData.rows[row].cells[col].style.fontColor || '#000000'
    cellProperty.align = spreadsheetData.rows[row].cells[col].style.align || 'left'
    cellProperty.fontStyle = []
    if (spreadsheetData.rows[row].cells[col].style.bold) cellProperty.fontStyle.push('bold')
    if (spreadsheetData.rows[row].cells[col].style.italic) cellProperty.fontStyle.push('italic')
  }
}

// 单元格双击
const handleCellDoubleClick = (row: number, col: number) => {
  if (spreadsheetData.rows[row].isHeader) {
    ElMessage.info('表头单元格不能绑定数据')
    return
  }

  bindingForm.row = row
  bindingForm.col = col
  bindingForm.cellAddress = getCellAddress(row, col)

  const existingBinding = getCellBinding(row, col)
  if (existingBinding) {
    bindingForm.fieldName = existingBinding.fieldName
    bindingForm.expandType = existingBinding.expandType
    bindingForm.aggregate = existingBinding.aggregate || ''
    bindingForm.format = existingBinding.format || ''
    bindingForm.defaultValue = existingBinding.defaultValue || ''
    bindingForm.leftParent = existingBinding.leftParent || ''
    bindingForm.topParent = existingBinding.topParent || ''
    bindingForm.isBound = true
  } else {
    bindingForm.fieldName = ''
    bindingForm.expandType = 'none'
    bindingForm.aggregate = ''
    bindingForm.format = ''
    bindingForm.defaultValue = ''
    bindingForm.leftParent = ''
    bindingForm.topParent = ''
    bindingForm.isBound = false
  }

  bindingDialogVisible.value = true
}

// 行选择
const selectRow = (index: number) => {
  selectedRow.value = selectedRow.value === index ? null : index
  selectedCell.value = null
  selectedCol.value = null
}

// 列选择
const selectCol = (index: number) => {
  selectedCol.value = selectedCol.value === index ? null : index
  selectedCell.value = null
  selectedRow.value = null
}

// 全选
const selectAll = () => {
  selectedCell.value = null
  selectedRow.value = null
  selectedCol.value = null
}

// 更新行高
const updateRowHeight = (index: number) => {
  console.log('updateRowHeight', index)
}

// 更新列宽
const updateColWidth = (index: number) => {
  console.log('updateColWidth', index)
}

// 字段拖拽开始
const handleFieldDragStart = (event: DragEvent, field: any) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'link'
    event.dataTransfer.setData('application/json', JSON.stringify(field))
  }
}

// 字段双击
const handleFieldDoubleClick = (field: any) => {
  // 找到第一个空的数据单元格
  for (let r = 1; r < spreadsheetData.rows.length; r++) {
    if (spreadsheetData.rows[r].isHeader || spreadsheetData.rows[r].isFooter) continue
    for (let c = 0; c < spreadsheetData.cols.length; c++) {
      if (!getCellBinding(r, c)) {
        // 自动绑定
        const binding: CellBinding = {
          fieldName: field.name,
          expandType: 'down',
          aggregate: field.type === '数值' ? 'SUM' : ''
        }
        setCellBinding(r, c, binding)
        ElMessage.success(`已将 "${field.alias}" 绑定到 ${getCellAddress(r, c)}`)
        return
      }
    }
  }
  ElMessage.warning('没有可用的单元格')
}

// 单元格拖拽悬停
const handleCellDragOver = (row: number, col: number, event: DragEvent) => {
  event.preventDefault()
  dragOverCell.value = { row, col }
}

// 单元格拖拽离开
const handleCellDragLeave = () => {
  dragOverCell.value = null
}

// 单元格拖拽释放
const handleCellDrop = (row: number, col: number, event: DragEvent) => {
  event.preventDefault()
  dragOverCell.value = null

  if (!event.dataTransfer) return

  try {
    const field = JSON.parse(event.dataTransfer.getData('application/json'))
    if (spreadsheetData.rows[row].isHeader || spreadsheetData.rows[row].isFooter) {
      ElMessage.warning('表头或表尾区域不能绑定数据')
      return
    }

    const binding: CellBinding = {
      fieldName: field.name,
      expandType: field.type === '数值' ? 'none' : 'down',
      aggregate: field.type === '数值' ? 'SUM' : ''
    }
    setCellBinding(row, col, binding)
    ElMessage.success(`已将 "${field.alias}" 绑定到 ${getCellAddress(row, col)}`)
  } catch (e) {
    console.error('drop error', e)
  }
}

// 字段拖放（整个电子表格区域）
const handleFieldDrop = (event: DragEvent) => {
  event.preventDefault()
  dragOverCell.value = null
}

// 绑定字段变更
const handleBindingFieldChange = () => {
  // 自动推断扩展方向和汇总方式
  const field = [...orderFields.value, ...customerFields.value, ...financeFields.value].find(f => f.name === bindingForm.fieldName)
  if (field) {
    if (field.type === '数值') {
      bindingForm.expandType = 'none'
      bindingForm.aggregate = 'SUM'
    } else {
      bindingForm.expandType = 'down'
      bindingForm.aggregate = ''
    }
  }
}

// 绑定扩展方向变更
const handleBindingExpandChange = () => {
  if (bindingForm.expandType !== 'none') {
    bindingForm.aggregate = ''
  }
}

// 确认绑定
const handleConfirmBinding = () => {
  if (!bindingForm.fieldName) {
    ElMessage.warning('请选择绑定字段')
    return
  }

  const binding: CellBinding = {
    fieldName: bindingForm.fieldName,
    expandType: bindingForm.expandType,
    aggregate: bindingForm.aggregate,
    format: bindingForm.format,
    defaultValue: bindingForm.defaultValue,
    leftParent: bindingForm.leftParent,
    topParent: bindingForm.topParent
  }

  setCellBinding(bindingForm.row, bindingForm.col, binding)

  // 处理扩展
  if (bindingForm.expandType === 'right') {
    for (let c = bindingForm.col + 1; c < spreadsheetData.cols.length; c++) {
      if (!getCellBinding(bindingForm.row, c)) {
        setCellBinding(bindingForm.row, c, { ...binding, expandType: 'none' })
      }
    }
  } else if (bindingForm.expandType === 'down') {
    for (let r = bindingForm.row + 1; r < spreadsheetData.rows.length; r++) {
      if (spreadsheetData.rows[r].isHeader || spreadsheetData.rows[r].isFooter) continue
      if (!getCellBinding(r, bindingForm.col)) {
        setCellBinding(r, bindingForm.col, { ...binding, expandType: 'none' })
      }
    }
  }

  bindingDialogVisible.value = false
  ElMessage.success('数据绑定成功')
}

// 解除绑定
const handleUnbindCell = () => {
  setCellBinding(bindingForm.row, bindingForm.col, null)
  bindingDialogVisible.value = false
  ElMessage.success('绑定已解除')
}

// 属性变更
const handlePropertyChange = () => {
  if (!selectedCell.value) return

  const { row, col } = selectedCell.value
  const existing = getCellBinding(row, col)

  const binding: CellBinding = {
    fieldName: cellProperty.fieldName || existing?.fieldName || '',
    expandType: cellProperty.expandType,
    aggregate: cellProperty.aggregate,
    format: cellProperty.format,
    leftParent: cellProperty.leftParent,
    topParent: cellProperty.topParent
  }

  setCellBinding(row, col, binding)
}

// 绑定变更（从属性面板）
const handleBindingChange = () => {
  if (!selectedCell.value) return

  const { row, col } = selectedCell.value
  const field = [...orderFields.value, ...customerFields.value, ...financeFields.value].find(f => f.name === cellProperty.fieldName)

  if (field && field.type === '数值') {
    cellProperty.expandType = 'none'
    cellProperty.aggregate = 'SUM'
  } else if (field) {
    cellProperty.expandType = 'down'
    cellProperty.aggregate = ''
  }

  handlePropertyChange()
}

// 样式变更
const handleStyleChange = () => {
  if (!selectedCell.value) return

  const { row, col } = selectedCell.value
  spreadsheetData.rows[row].cells[col].style.bgColor = cellProperty.bgColor
  spreadsheetData.rows[row].cells[col].style.fontColor = cellProperty.fontColor
  spreadsheetData.rows[row].cells[col].style.align = cellProperty.align
  spreadsheetData.rows[row].cells[col].style.bold = cellProperty.fontStyle.includes('bold')
  spreadsheetData.rows[row].cells[col].style.italic = cellProperty.fontStyle.includes('italic')
}

// 显示过滤设置
const handleShowFilter = () => {
  filterDialogVisible.value = true
}

// 确认过滤
const handleConfirmFilter = () => {
  filterDialogVisible.value = false
  handlePropertyChange()
  ElMessage.success('过滤条件已设置')
}

// 插入图表
const handleInsertChart = () => {
  chartDialogVisible.value = true
}

// 选择图表类型
const handleSelectChartType = (type: string) => {
  chartDialogVisible.value = false
  ElMessage.success(`已插入${type}图表`)
}

// 预览
const handlePreview = () => {
  previewDialogVisible.value = true
}

// 新建数据集
const handleNewDataset = () => {
  ElMessage.info('新建数据集功能开发中')
}

// 生成报表
const handleGenerate = async () => {
  if (!configForm.templateId || !configForm.period) {
    ElMessage.warning('请选择模板和报表周期')
    return
  }

  generating.value = true
  showProgress.value = true
  progressPercent.value = 0
  progressStatus.value = undefined

  const interval = setInterval(() => {
    progressPercent.value += Math.random() * 15
    if (progressPercent.value >= 100) {
      progressPercent.value = 100
      progressStatus.value = 'success'
      clearInterval(interval)
      generating.value = false
      showDesigner.value = true
      initSpreadsheet()
      ElMessage.success('报表生成成功！')
    }
  }, 300)
}

// 批量生成
const handleBatchGenerate = () => {
  if (!batchForm.periods || batchForm.periods.length < 2) {
    ElMessage.warning('请选择开始和结束月份')
    return
  }
  ElMessage.success('批量生成任务已提交')
}

// 模板变更
const handleTemplateChange = () => {
  console.log('template changed')
}

// 初始化
initSpreadsheet()
</script>

<style scoped>
.report-generator {
  padding: 0;
}

.generate-config {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 工具栏样式 */
.designer-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 5px;
}

.section-title {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-right: 5px;
  font-weight: 500;
}

.designer-toolbar :deep(.el-button) {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
}

.designer-toolbar :deep(.el-button:hover) {
  background: rgba(255, 255, 255, 0.3);
}

/* 主体区域 */
.designer-main {
  display: flex;
  gap: 15px;
  min-height: 600px;
}

/* 数据集面板 */
.dataset-panel {
  width: 250px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 600;
  color: #303133;
}

.dataset-search {
  padding: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.dataset-list {
  padding: 10px;
  max-height: 500px;
  overflow-y: auto;
}

.dataset-collapse :deep(.el-collapse-item__header) {
  background: #f5f7fa;
  padding: 0 10px;
}

.dataset-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 6px;
  cursor: grab;
  transition: all 0.2s;
}

.field-item:hover {
  background: #ecf5ff;
  border-color: #409eff;
}

.field-icon {
  color: #409eff;
  font-size: 14px;
}

.field-name {
  flex: 1;
  font-size: 13px;
  color: #303133;
}

/* 报表设计区 */
.report-design-area {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.report-region-tabs {
  padding: 10px 15px;
  border-bottom: 1px solid #e4e7ed;
}

/* 电子表格 */
.spreadsheet-container {
  flex: 1;
  overflow: auto;
  padding: 0;
}

.row-headers {
  display: flex;
  flex-direction: column;
  position: sticky;
  left: 0;
  z-index: 2;
  background: #f5f7fa;
  float: left;
  width: 60px;
}

.corner-cell {
  width: 60px;
  height: 32px;
  border-right: 1px solid #dcdfe6;
  border-bottom: 1px solid #dcdfe6;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
}

.corner-cell:hover {
  background: #ecf5ff;
}

.row-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 40px;
  border-right: 1px solid #dcdfe6;
  border-bottom: 1px solid #dcdfe6;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
}

.row-header:hover {
  background: #ecf5ff;
}

.row-header.is-selected {
  background: #ecf5ff;
  color: #409eff;
}

.row-number {
  font-weight: 500;
}

.row-height-input {
  width: 50px;
  margin-top: 2px;
}

.row-height-input :deep(.el-input__wrapper) {
  padding: 0 3px;
}

.col-headers-row {
  overflow-x: auto;
  overflow-y: hidden;
}

.col-headers {
  display: flex;
  position: sticky;
  top: 0;
  z-index: 1;
  background: #f5f7fa;
  padding-left: 60px;
}

.col-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  height: 32px;
  border-right: 1px solid #dcdfe6;
  border-bottom: 1px solid #dcdfe6;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
}

.col-header:hover {
  background: #ecf5ff;
}

.col-header.is-selected {
  background: #ecf5ff;
  color: #409eff;
}

.col-name {
  font-weight: 500;
}

.col-width-input {
  width: 60px;
  height: 20px;
}

.col-width-input :deep(.el-input__wrapper) {
  padding: 0 3px;
}

.spreadsheet-body {
  overflow-x: auto;
  padding-left: 60px;
}

.spreadsheet-table {
  border-collapse: collapse;
  table-layout: fixed;
}

.spreadsheet-cell {
  border: 1px solid #dcdfe6;
  padding: 0;
  min-width: 120px;
  height: 40px;
  background: #fff;
  cursor: cell;
  transition: all 0.2s;
}

.spreadsheet-cell:hover {
  border-color: #409eff;
}

.spreadsheet-cell.is-selected {
  outline: 2px solid #409eff;
  outline-offset: -2px;
  z-index: 1;
}

.spreadsheet-cell.is-row-selected {
  background: #f5f7fa;
}

.spreadsheet-cell.is-col-selected {
  background: #f5f7fa;
}

.spreadsheet-cell.is-bound {
  background: #ecf5ff;
}

.spreadsheet-cell.is-header-cell {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.spreadsheet-cell.is-footer-cell {
  background: #f5f7fa;
  font-style: italic;
}

.spreadsheet-cell.is-drag-over {
  background: #e6f7ff;
  border-style: dashed;
}

.cell-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 8px;
  font-size: 13px;
  text-align: center;
}

.cell-binding-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.binding-field {
  font-weight: 500;
  color: #409eff;
  font-size: 12px;
}

.binding-tags {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  justify-content: center;
}

.cell-placeholder {
  color: #c0c4cc;
  font-style: italic;
  font-size: 11px;
}

/* 单元格信息栏 */
.cell-info-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 15px;
  background: #f5f7fa;
  border-top: 1px solid #e4e7ed;
  font-size: 12px;
  color: #606266;
}

.cell-address {
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 5px;
}

.no-binding {
  color: #c0c4cc;
}

/* 属性面板 */
.property-panel {
  width: 280px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.property-content {
  padding: 15px;
  max-height: 550px;
  overflow-y: auto;
}

.property-section {
  margin-bottom: 20px;
}

.property-section .section-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.property-content :deep(.el-form-item) {
  margin-bottom: 12px;
}

.property-content :deep(.el-form-item__label) {
  font-size: 12px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

/* 进度条 */
.progress-content {
  text-align: center;
  padding: 20px 0;
}

.progress-text {
  margin: 15px 0 5px;
  color: #606266;
}

.progress-detail {
  color: #909399;
  font-size: 13px;
}

/* 图表类型卡片 */
.chart-type-card {
  text-align: center;
  padding: 30px 20px;
  background: #f8f9fa;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.chart-type-card:hover {
  border-color: #409eff;
  background: #ecf5ff;
  transform: translateY(-2px);
}

.chart-type-card p {
  margin-top: 10px;
  color: #606266;
}

/* 预览表格 */
.preview-container {
  overflow-x: auto;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.preview-table th,
.preview-table td {
  border: 1px solid #dcdfe6;
  padding: 10px;
  text-align: center;
}

.preview-table th {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
</style>
