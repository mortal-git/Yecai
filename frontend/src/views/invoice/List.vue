<template>
  <div class="invoice-list-container">
    <!-- 搜索筛选区域 -->
    <div class="search-panel">
      <el-form :model="searchForm" :inline="true" label-width="90px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="发票方向">
              <el-radio-group v-model="searchForm.invoiceDirection" size="small">
                <el-radio-button value="">全部</el-radio-button>
                <el-radio-button value="JX">进项发票</el-radio-button>
                <el-radio-button value="SX">销项发票</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="发票类型">
              <el-select v-model="searchForm.invoiceTypes" multiple collapse-tags collapse-tags-tooltip placeholder="请选择" clearable>
                <el-option label="专票" value="SZ" />
                <el-option label="普票" value="PT" />
                <el-option label="电子发票" value="DZ" />
                <el-option label="机动车" value="JD" />
                <el-option label="区块链发票" value="QKL" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="发票状态">
              <el-select v-model="searchForm.invoiceStatuses" multiple collapse-tags collapse-tags-tooltip placeholder="请选择" clearable>
                <el-option label="草稿" value="draft" />
                <el-option label="待查验" value="pending" />
                <el-option label="已查验" value="verified" />
                <el-option label="已关联" value="related" />
                <el-option label="已认证" value="authenticated" />
                <el-option label="已抵扣" value="deducted" />
                <el-option label="已作废" value="cancelled" />
                <el-option label="已红冲" value="red_letter" />
                <el-option label="异常票" value="abnormal" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="认证状态" v-if="searchForm.invoiceDirection === 'JX' || !searchForm.invoiceDirection">
              <el-select v-model="searchForm.authStatuses" multiple collapse-tags collapse-tags-tooltip placeholder="请选择" clearable>
                <el-option label="未认证" value="unauthenticated" />
                <el-option label="已认证" value="authenticated" />
                <el-option label="已抵扣" value="deducted" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="开票日期">
              <el-date-picker
                v-model="searchForm.billingDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始"
                end-placeholder="结束"
                value-format="YYYY-MM-DD"
                size="small"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="发票号码">
              <el-input v-model="searchForm.invoiceNumber" placeholder="请输入号码" clearable size="small" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item :label="searchForm.invoiceDirection === 'JX' ? '供应商' : searchForm.invoiceDirection === 'SX' ? '客户' : '供应商/客户'">
              <el-input v-model="searchForm.partyName" :placeholder="searchForm.invoiceDirection === 'JX' ? '请输入供应商名称' : searchForm.invoiceDirection === 'SX' ? '请输入客户名称' : '请输入名称'" clearable size="small" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="税率">
              <el-select v-model="searchForm.taxRates" multiple collapse-tags placeholder="请选择" clearable size="small">
                <el-option label="0%" :value="0" />
                <el-option label="3%" :value="0.03" />
                <el-option label="6%" :value="0.06" />
                <el-option label="9%" :value="0.09" />
                <el-option label="13%" :value="0.13" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="金额范围">
              <el-input-number v-model="searchForm.amountRange!.min" placeholder="最小值" :min="0" size="small" style="width: 100px" />
              <span style="margin: 0 4px">-</span>
              <el-input-number v-model="searchForm.amountRange!.max" placeholder="最大值" :min="0" size="small" style="width: 100px" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="关联状态">
              <el-select v-model="searchForm.relatedStatus" placeholder="请选择" clearable size="small">
                <el-option label="全部" value="all" />
                <el-option label="已关联" value="related" />
                <el-option label="未关联" value="unrelated" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="影像">
              <el-select v-model="searchForm.hasAttachment" placeholder="请选择" clearable size="small">
                <el-option label="有影像" :value="true" />
                <el-option label="无影像" :value="false" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="责任人">
              <el-input v-model="searchForm.responsible" placeholder="请输入姓名" clearable size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24" style="text-align: right;">
            <el-form-item>
              <el-button type="primary" @click="handleSearch" size="small">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="handleReset" size="small">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
              <el-button type="primary" link @click="toggleAdvanced" size="small">
                {{ showAdvanced ? '收起' : '更多' }}
                <el-icon><ArrowUp v-if="showAdvanced" /><ArrowDown v-else /></el-icon>
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 高级筛选 -->
        <el-row v-if="showAdvanced" :gutter="20">
          <el-col :span="6">
            <el-form-item label="认证日期">
              <el-date-picker
                v-model="searchForm.authDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始"
                end-placeholder="结束"
                value-format="YYYY-MM-DD"
                size="small"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="异常标识">
              <el-select v-model="searchForm.abnormalType" placeholder="请选择" clearable size="small">
                <el-option label="正常" value="" />
                <el-option label="失控票" value="out_of_control" />
                <el-option label="逾期未认证" value="overdue_not_auth" />
                <el-option label="信息不一致" value="info_inconsistent" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-label">发票总张数</div>
            <div class="stat-value">{{ statistics.totalCount }}</div>
            <div class="stat-sub">价税合计: ¥{{ formatNumber(statistics.totalAmount) }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-label">可抵扣税额</div>
            <div class="stat-value success">¥{{ formatNumber(statistics.totalTaxAmount) }}</div>
            <div class="stat-sub">已认证: {{ statistics.authenticatedCount }} 张</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-label">已抵扣</div>
            <div class="stat-value primary">¥{{ formatNumber(statistics.deductedAmount) }}</div>
            <div class="stat-sub">已抵扣: {{ statistics.deductedCount }} 张</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-label">待处理</div>
            <div class="stat-value warning">{{ statistics.pendingVerifyCount + statistics.abnormalCount }}</div>
            <div class="stat-sub">待查验: {{ statistics.pendingVerifyCount }} | 异常: {{ statistics.abnormalCount }}</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新增发票
      </el-button>
      <el-button type="success" @click="handleScanInput">
        <el-icon><Tickets /></el-icon>
        扫码录入
      </el-button>
      <el-button type="info" @click="handleBatchImport">
        <el-icon><Upload /></el-icon>
        批量导入
      </el-button>
      <el-button @click="handleBatchVerify" :disabled="!selectedRows.length">
        <el-icon><Check /></el-icon>
        批量查验
      </el-button>
      <el-button @click="handleBatchAuth" :disabled="!selectedRows.length || searchForm.invoiceDirection !== 'JX'">
        <el-icon><CircleCheck /></el-icon>
        批量认证
      </el-button>
      <el-button @click="handleBatchDeduct" :disabled="!selectedRows.length || searchForm.invoiceDirection !== 'JX'">
        <el-icon><Wallet /></el-icon>
        批量抵扣
      </el-button>
      <el-button type="danger" @click="handleBatchCancel" :disabled="!selectedRows.length">
        <el-icon><Close /></el-icon>
        批量作废
      </el-button>
      <el-button-group style="margin-left: auto;">
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <el-button @click="handlePrint">
          <el-icon><Printer /></el-icon>
          打印
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </el-button-group>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <el-table
        ref="tableRef"
        :data="tableData"
        v-loading="loading"
        border
        stripe
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        :row-class-name="getRowClassName"
      >
        <el-table-column type="selection" width="50" :selectable="checkSelectable" />
        <el-table-column prop="invoiceNo" label="发票号码" width="160" fixed>
          <template #default="{ row }">
            <el-link type="primary" @click.stop="handleView(row)">{{ row.invoiceNo }}</el-link>
            <el-icon v-if="row.hasAttachment" class="attachment-icon" title="有影像"><Picture /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="invoiceType" label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="getInvoiceTypeTagType(row.invoiceType)" size="small">
              {{ getInvoiceTypeLabel(row.invoiceType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="billingDate" label="开票日期" width="110" sortable />
        <el-table-column :prop="searchForm.invoiceDirection === 'JX' ? 'supplierName' : 'customerName'" label="供应商/客户" min-width="160">
          <template #default="{ row }">
            <span v-if="row.supplierName">{{ row.supplierName }}</span>
            <span v-else>{{ row.customerName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amountWithoutTax" label="不含税金额" width="120" align="right">
          <template #default="{ row }">¥{{ formatNumber(row.amountWithoutTax) }}</template>
        </el-table-column>
        <el-table-column prop="taxRate" label="税率" width="70" align="center">
          <template #default="{ row }">{{ (row.taxRate * 100).toFixed(0) }}%</template>
        </el-table-column>
        <el-table-column prop="taxAmount" label="税额" width="120" align="right">
          <template #default="{ row }">¥{{ formatNumber(row.taxAmount) }}</template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="价税合计" width="130" align="right" sortable>
          <template #default="{ row }">
            <span class="total-amount">¥{{ formatNumber(row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="invoiceStatus" label="发票状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusConfig(row.invoiceStatus).type" size="small">
              {{ getStatusConfig(row.invoiceStatus).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="searchForm.invoiceDirection === 'JX' || !searchForm.invoiceDirection" prop="authStatus" label="认证状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.invoiceDirection === 'JX'" :type="getAuthStatusConfig(row.authStatus).type" size="small">
              {{ getAuthStatusConfig(row.authStatus).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="relatedCount" label="关联单据" width="100">
          <template #default="{ row }">
            <el-link v-if="row.relatedCount > 0" type="primary" @click.stop="handleViewRelated(row)">
              {{ row.relatedCount }}个
            </el-link>
            <span v-else type="info">-</span>
          </template>
        </el-table-column>
        <el-table-column v-if="searchForm.invoiceDirection === 'JX' || !searchForm.invoiceDirection" prop="authPeriod" label="认证期间" width="100" />
        <el-table-column prop="responsible" label="责任人" width="80" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" link @click.stop="handleView(scope.row)">查看</el-button>
            <el-button type="success" size="small" link @click.stop="handleEdit(scope.row)" :disabled="scope.row.invoiceStatus !== 'draft'">编辑</el-button>
            <el-button type="warning" size="small" link @click.stop="handleVerify(scope.row)" :disabled="!['draft', 'pending'].includes(scope.row.invoiceStatus)">查验</el-button>
            <el-dropdown @command="(cmd: string) => handleMoreAction(cmd, scope.row)" trigger="hover">
              <template #default>
                <el-button type="info" size="small" link>更多</el-button>
              </template>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="auth" :disabled="scope.row.invoiceStatus !== 'verified' || scope.row.invoiceDirection !== 'JX'">认证</el-dropdown-item>
                  <el-dropdown-item command="deduct" :disabled="scope.row.authStatus !== 'authenticated' || scope.row.invoiceDirection !== 'JX'">抵扣</el-dropdown-item>
                  <el-dropdown-item command="relate" :disabled="scope.row.invoiceStatus === 'draft'">关联单据</el-dropdown-item>
                  <el-dropdown-item command="cancel" :disabled="scope.row.invoiceStatus === 'cancelled' || scope.row.invoiceStatus === 'draft'">作废</el-dropdown-item>
                  <el-dropdown-item command="red" :disabled="scope.row.invoiceStatus === 'cancelled' || scope.row.invoiceStatus === 'draft'">红冲</el-dropdown-item>
                  <el-dropdown-item command="attachment">查看影像</el-dropdown-item>
                  <el-dropdown-item command="log">操作日志</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <div class="pagination-info">
          已选中 {{ selectedRows.length }} 项，共 {{ pagination.total }} 条记录
        </div>
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 发票详情抽屉 -->
    <el-drawer
      v-model="showDetail"
      title="发票详情"
      size="900px"
      :before-close="handleCloseDetail"
    >
      <template #default>
        <invoice-detail v-if="currentInvoice" :invoice-id="currentInvoice.id" :invoice-data="currentInvoice" @close="handleCloseDetail" @refresh="handleRefresh" />
      </template>
    </el-drawer>

    <!-- 关联单据抽屉 -->
    <el-drawer
      v-model="showRelated"
      title="关联单据"
      size="700px"
      :before-close="handleCloseRelated"
    >
      <template #default>
        <invoice-related v-if="currentInvoice" :invoice-id="currentInvoice.id" :invoice-direction="currentInvoice.invoiceDirection" @close="handleCloseRelated" @refresh="handleRefresh" />
      </template>
    </el-drawer>

    <!-- 批量导入对话框 -->
    <el-dialog v-model="showImportDialog" title="批量导入发票" width="600px">
      <div class="import-dialog-content">
        <el-steps :active="importStep" finish-status="success" align-center>
          <el-step title="下载模板" />
          <el-step title="填写数据" />
          <el-step title="上传导入" />
          <el-step title="确认结果" />
        </el-steps>

        <div class="step-content">
          <div v-if="importStep === 0" class="step-1">
            <p>请先下载发票导入模板，按模板格式填写发票信息</p>
            <el-button type="primary" @click="handleDownloadTemplate">
              <el-icon><Download /></el-icon>
              下载导入模板
            </el-button>
          </div>

          <div v-if="importStep === 1" class="step-2">
            <p>请按照模板格式填写发票数据，注意：</p>
            <ul>
              <li>发票号码不能为空且不能重复</li>
              <li>金额、税率、税额需符合勾稽关系</li>
              <li>供应商/客户需与档案中名称一致</li>
            </ul>
          </div>

          <div v-if="importStep === 2" class="step-3">
            <el-upload
              ref="uploadRef"
              class="upload-demo"
              drag
              :auto-upload="false"
              :limit="1"
              accept=".xlsx,.xls"
              :on-change="handleFileChange"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <template #tip>
                <div class="el-upload__tip">只能上传 xlsx/xls 文件，且不超过 10MB</div>
              </template>
            </el-upload>
          </div>

          <div v-if="importStep === 3" class="step-4">
            <el-alert v-if="importResult.errors.length === 0" type="success" :closable="false">
              导入成功！共导入 {{ importResult.success }} 条数据
            </el-alert>
            <el-alert v-else type="warning" :closable="false">
              导入完成，但有 {{ importResult.errors.length }} 条数据失败
            </el-alert>

            <div v-if="importResult.errors.length > 0" class="error-list">
              <h4>失败记录：</h4>
              <el-table :data="importResult.errors" border size="small" max-height="200">
                <el-table-column prop="row" label="行号" width="80" />
                <el-table-column prop="reason" label="失败原因" />
              </el-table>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div style="text-align: center;">
          <el-button v-if="importStep > 0 && importStep < 3" @click="importStep--">上一步</el-button>
          <el-button v-if="importStep < 3" type="primary" @click="importStep++">下一步</el-button>
          <el-button v-if="importStep === 3" type="primary" @click="showImportDialog = false">完成</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 扫码录入对话框 -->
    <el-dialog v-model="showScanDialog" title="扫码录入发票" width="500px">
      <div class="scan-dialog-content">
        <p>请使用扫码枪扫描发票二维码，或点击按钮选择发票图片</p>
        <el-upload
          ref="scanUploadRef"
          class="scan-upload"
          :auto-upload="false"
          :show-file-list="false"
          accept="image/*"
          :on-change="handleScanUpload"
        >
          <el-button type="primary">
            <el-icon><Camera /></el-icon>
            选择发票图片
          </el-button>
        </el-upload>

        <div v-if="scanResult" class="scan-result">
          <el-divider>识别结果</el-divider>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="发票代码">{{ scanResult.invoiceCode }}</el-descriptions-item>
            <el-descriptions-item label="发票号码">{{ scanResult.invoiceNumber }}</el-descriptions-item>
            <el-descriptions-item label="开票日期">{{ scanResult.billingDate }}</el-descriptions-item>
            <el-descriptions-item label="不含税金额">¥{{ formatNumber(scanResult.amountWithoutTax) }}</el-descriptions-item>
            <el-descriptions-item label="税率">{{ (scanResult.taxRate * 100).toFixed(0) }}%</el-descriptions-item>
            <el-descriptions-item label="税额">¥{{ formatNumber(scanResult.taxAmount) }}</el-descriptions-item>
            <el-descriptions-item label="价税合计" :span="2">¥{{ formatNumber(scanResult.totalAmount) }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <template #footer>
        <el-button @click="showScanDialog = false">关闭</el-button>
        <el-button v-if="scanResult" type="primary" @click="handleConfirmScan">确认录入</el-button>
      </template>
    </el-dialog>

    <!-- 批量操作确认对话框 -->
    <el-dialog v-model="showBatchDialog" :title="batchDialogTitle" width="500px">
      <div class="batch-dialog-content">
        <p>确认对选中的 {{ selectedRows.length }} 张发票进行操作？</p>
        <el-form v-if="batchDialogType === 'auth' || batchDialogType === 'deduct'" :model="batchForm" label-width="100px">
          <el-form-item label="认证/抵扣期间">
            <el-date-picker
              v-model="batchForm.period"
              type="month"
              placeholder="选择月份"
              value-format="YYYY-MM"
            />
          </el-form-item>
          <el-form-item v-if="batchDialogType === 'deduct'" label="抵扣类型">
            <el-select v-model="batchForm.deductType" placeholder="请选择">
              <el-option label="正常抵扣" value="normal" />
              <el-option label="加计抵减" value="additional" />
            </el-select>
          </el-form-item>
        </el-form>
        <el-form v-if="batchDialogType === 'cancel' || batchDialogType === 'red'" :model="batchForm" label-width="100px">
          <el-form-item :label="batchDialogType === 'cancel' ? '作废原因' : '红冲原因'" required>
            <el-input v-model="batchForm.reason" type="textarea" :rows="3" :placeholder="batchDialogType === 'cancel' ? '请输入作废原因' : '请输入红冲原因'" />
          </el-form-item>
          <el-form-item v-if="batchDialogType === 'cancel'" label="上传证明">
            <el-upload :auto-upload="false" :limit="3">
              <el-button>上传附件</el-button>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showBatchDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmBatch">确认</el-button>
      </template>
    </el-dialog>

    <!-- 操作日志对话框 -->
    <el-dialog v-model="showLogDialog" title="操作日志" width="800px">
      <el-table :data="operationLogs" border size="small">
        <el-table-column prop="operateTime" label="操作时间" width="160" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="operateContent" label="操作内容" />
        <el-table-column prop="beforeStatus" label="操作前状态" width="100" />
        <el-table-column prop="afterStatus" label="操作后状态" width="100" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadFile } from 'element-plus'
import {
  Search, Refresh, Plus, Download, Tickets, Upload, Check, CircleCheck,
  Wallet, Close, Printer, Picture, ArrowUp, ArrowDown, Camera, UploadFilled
} from '@element-plus/icons-vue'
import InvoiceDetail from './Detail.vue'
import InvoiceRelated from './Related.vue'
import type { InvoiceStatistics, InvoiceStatus, AuthStatus, InvoiceType, InvoiceDirection } from './types'

const router = useRouter()

// 加载状态
const loading = ref(false)
const tableRef = ref()
const selectedRows = ref<any[]>([])

// 搜索表单
const searchForm = reactive({
  invoiceDirection: '' as InvoiceDirection | '',
  invoiceTypes: [] as InvoiceType[],
  invoiceStatuses: [] as InvoiceStatus[],
  authStatuses: [] as AuthStatus[],
  billingDateRange: [] as string[],
  authDateRange: [] as string[],
  invoiceNumber: '',
  partyName: '',
  amountRange: { min: undefined as number | undefined, max: undefined as number | undefined },
  taxRates: [] as number[],
  relatedStatus: 'all' as 'all' | 'related' | 'unrelated',
  hasAttachment: undefined as boolean | undefined,
  abnormalType: '',
  responsible: ''
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 统计
const statistics = reactive<InvoiceStatistics>({
  totalCount: 156,
  totalAmountWithoutTax: 8560000,
  totalTaxAmount: 1112800,
  totalAmount: 9672800,
  authenticatedCount: 89,
  authenticatedAmount: 923400,
  deductedCount: 67,
  deductedAmount: 712800,
  pendingVerifyCount: 12,
  abnormalCount: 3
})

// 表格数据
const tableData = ref<any[]>([])
const mockTableData = () => {
  const directions: InvoiceDirection[] = ['JX', 'SX']
  const types: InvoiceType[] = ['SZ', 'PT', 'DZ']
  const statuses: InvoiceStatus[] = ['draft', 'pending', 'verified', 'related', 'authenticated', 'deducted', 'cancelled', 'abnormal']
  const authStatuses: AuthStatus[] = ['unauthenticated', 'authenticated', 'deducted']
  const parties = {
    JX: ['深圳市腾讯科技有限公司', '阿里巴巴（中国）有限公司', '华为技术有限公司', '小米科技有限公司', '京东集团'],
    SX: ['北京字节跳动科技有限公司', '美团网络科技有限公司', '网易杭州有限公司', '拼多多网络有限公司', '快手科技有限公司']
  }

  const data = []
  for (let i = 0; i < 50; i++) {
    const direction = directions[i % 2] as InvoiceDirection
    const status = statuses[Math.floor(Math.random() * statuses.length)] as InvoiceStatus
    const type = types[Math.floor(Math.random() * types.length)] as InvoiceType

    data.push({
      id: `INV${String(i + 1).padStart(8, '0')}`,
      invoiceNo: direction === 'JX' ? `JXFP202404${String(i + 1).padStart(5, '0')}` : `XXFP202404${String(i + 1).padStart(5, '0')}`,
      invoiceType: type,
      invoiceDirection: direction,
      invoiceCode: direction === 'JX' ? '144031900110' : '111011900110',
      invoiceNumber: String(10000000 + i + 1),
      billingDate: `2024-04-${String(Math.floor(i / 2) + 1).padStart(2, '0')}`,
      supplierName: direction === 'JX' ? parties.JX[i % 5] : undefined,
      customerName: direction === 'SX' ? parties.SX[i % 5] : undefined,
      amountWithoutTax: Math.round((10000 + Math.random() * 90000) * 100) / 100,
      taxRate: [0, 0.03, 0.06, 0.09, 0.13][Math.floor(Math.random() * 5)],
      taxAmount: 0,
      totalAmount: 0,
      invoiceStatus: status,
      authStatus: direction === 'JX' ? authStatuses[Math.floor(Math.random() * authStatuses.length)] : undefined,
      relatedCount: Math.floor(Math.random() * 5),
      authPeriod: status === 'authenticated' || status === 'deducted' ? '2024-04' : undefined,
      deductPeriod: status === 'deducted' ? '2024-04' : undefined,
      hasAttachment: Math.random() > 0.3,
      responsible: ['张三', '李四', '王五', '赵六'][i % 4],
      createTime: `2024-04-${String(Math.floor(i / 3) + 1).padStart(2, '0')} ${String(8 + (i % 10)).padStart(2, '0')}:30:00`
    })
    data[i].taxAmount = Math.round(data[i].amountWithoutTax * data[i].taxRate * 100) / 100
    data[i].totalAmount = data[i].amountWithoutTax + data[i].taxAmount
  }
  return data
}

tableData.value = mockTableData()
pagination.total = tableData.value.length

// 显示状态
const showAdvanced = ref(false)
const showDetail = ref(false)
const showRelated = ref(false)
const showImportDialog = ref(false)
const showScanDialog = ref(false)
const showBatchDialog = ref(false)
const showLogDialog = ref(false)

// 当前选中发票
const currentInvoice = ref<any>(null)

// 批量操作
const batchDialogType = ref('')
const batchDialogTitle = ref('')
const batchForm = reactive({
  period: '',
  deductType: 'normal',
  reason: ''
})

// 导入
const importStep = ref(0)
const importResult = reactive({
  success: 0,
  errors: [] as { row: number; reason: string }[]
})
const uploadRef = ref()

// 扫码
const scanResult = ref<any>(null)
const scanUploadRef = ref()

// 操作日志
const operationLogs = ref<any[]>([])

// 计算属性
const getStatusConfig = (status: InvoiceStatus) => {
  const config: Record<InvoiceStatus, { label: string; type: string }> = {
    'draft': { label: '草稿', type: 'info' },
    'pending': { label: '待查验', type: 'warning' },
    'verified': { label: '已查验', type: 'success' },
    'related': { label: '已关联', type: 'primary' },
    'authenticated': { label: '已认证', type: 'primary' },
    'deducted': { label: '已抵扣', type: 'success' },
    'cancelled': { label: '已作废', type: 'danger' },
    'red_letter': { label: '已红冲', type: 'danger' },
    'abnormal': { label: '异常票', type: 'danger' }
  }
  return config[status] || { label: status, type: 'info' }
}

const getAuthStatusConfig = (status: AuthStatus) => {
  const config: Record<AuthStatus, { label: string; type: string }> = {
    'unauthenticated': { label: '未认证', type: 'info' },
    'authenticated': { label: '已认证', type: 'success' },
    'deducted': { label: '已抵扣', type: 'primary' }
  }
  return config[status] || { label: status, type: 'info' }
}

const getInvoiceTypeLabel = (type: InvoiceType) => {
  const labels: Record<InvoiceType, string> = {
    'SZ': '专票',
    'PT': '普票',
    'DZ': '电子',
    'JD': '机动车',
    'QKL': '区块链',
    'HG': '海关'
  }
  return labels[type] || type
}

const getInvoiceTypeTagType = (type: InvoiceType) => {
  const types: Record<InvoiceType, string> = {
    'SZ': 'danger',
    'PT': 'primary',
    'DZ': 'success',
    'JD': 'warning',
    'QKL': 'info',
    'HG': ''
  }
  return types[type] || 'info'
}

// 方法
const formatNumber = (value: number) => {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('搜索完成')
  }, 500)
}

const handleReset = () => {
  Object.assign(searchForm, {
    invoiceDirection: '',
    invoiceTypes: [],
    invoiceStatuses: [],
    authStatuses: [],
    billingDateRange: [],
    authDateRange: [],
    invoiceNumber: '',
    partyName: '',
    amountRange: { min: undefined, max: undefined },
    taxRates: [],
    relatedStatus: 'all',
    hasAttachment: undefined,
    abnormalType: '',
    responsible: ''
  })
  handleSearch()
}

const handleCreate = () => {
  router.push('/invoice/create')
}

const handleScanInput = () => {
  scanResult.value = null
  showScanDialog.value = true
}

const handleBatchImport = () => {
  importStep.value = 0
  importResult.success = 0
  importResult.errors = []
  showImportDialog.value = true
}

const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

const handlePrint = () => {
  ElMessage.info('打印功能开发中')
}

const handleRefresh = () => {
  handleSearch()
}

const handlePageChange = () => {
  handleSearch()
}

const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

const handleRowClick = (row: any) => {
  handleView(row)
}

const checkSelectable = (row: any) => {
  return row.invoiceStatus !== 'cancelled' && row.invoiceStatus !== 'red_letter'
}

const getRowClassName = ({ row }: { row: any }) => {
  if (row.abnormal) return 'abnormal-row'
  return ''
}

const handleView = (row: any) => {
  currentInvoice.value = row
  showDetail.value = true
}

const handleEdit = (row: any) => {
  router.push(`/invoice/edit/${row.id}`)
}

const handleVerify = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要查验该发票吗？', '发票查验', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    loading.value = true
    setTimeout(() => {
      loading.value = false
      row.invoiceStatus = 'verified'
      ElMessage.success('查验成功')
    }, 1000)
  } catch {
    // 取消
  }
}

const handleViewRelated = (row: any) => {
  currentInvoice.value = row
  showRelated.value = true
}

const handleMoreAction = (command: string, row: any) => {
  switch (command) {
    case 'auth':
      handleBatchAuthSingle(row)
      break
    case 'deduct':
      handleBatchDeductSingle(row)
      break
    case 'relate':
      handleViewRelated(row)
      break
    case 'cancel':
      handleCancel(row)
      break
    case 'red':
      handleRedLetter(row)
      break
    case 'attachment':
      handleViewAttachment(row)
      break
    case 'log':
      handleViewLog(row)
      break
  }
}

const handleBatchVerify = async () => {
  batchDialogType.value = 'verify'
  batchDialogTitle.value = '批量查验发票'
  showBatchDialog.value = true
}

const handleBatchAuth = () => {
  batchDialogType.value = 'auth'
  batchDialogTitle.value = '批量认证发票'
  batchForm.period = ''
  showBatchDialog.value = true
}

const handleBatchAuthSingle = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要认证该发票吗？', '发票认证', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    loading.value = true
    setTimeout(() => {
      loading.value = false
      row.authStatus = 'authenticated'
      row.authPeriod = '2024-04'
      ElMessage.success('认证成功')
    }, 1000)
  } catch {
    // 取消
  }
}

const handleBatchDeduct = () => {
  batchDialogType.value = 'deduct'
  batchDialogTitle.value = '批量抵扣发票'
  batchForm.period = ''
  batchForm.deductType = 'normal'
  showBatchDialog.value = true
}

const handleBatchDeductSingle = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要抵扣该发票吗？', '发票抵扣', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    loading.value = true
    setTimeout(() => {
      loading.value = false
      row.authStatus = 'deducted'
      row.deductPeriod = '2024-04'
      ElMessage.success('抵扣成功')
    }, 1000)
  } catch {
    // 取消
  }
}

const handleBatchCancel = () => {
  batchDialogType.value = 'cancel'
  batchDialogTitle.value = '批量作废发票'
  batchForm.reason = ''
  showBatchDialog.value = true
}

const handleCancel = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要作废该发票吗？', '发票作废', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    loading.value = true
    setTimeout(() => {
      loading.value = false
      row.invoiceStatus = 'cancelled'
      ElMessage.success('作废成功')
    }, 1000)
  } catch {
    // 取消
  }
}

const handleRedLetter = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要红冲该发票吗？', '发票红冲', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    loading.value = true
    setTimeout(() => {
      loading.value = false
      row.invoiceStatus = 'red_letter'
      ElMessage.success('红冲成功')
    }, 1000)
  } catch {
    // 取消
  }
}

const handleViewAttachment = (row: any) => {
  ElMessage.info('查看影像功能开发中')
}

const handleViewLog = (row: any) => {
  operationLogs.value = [
    { operateTime: '2024-04-20 10:30:00', operator: '张三', operateContent: '录入发票', beforeStatus: '-', afterStatus: '草稿' },
    { operateTime: '2024-04-20 10:35:00', operator: '张三', operateContent: '提交查验', beforeStatus: '草稿', afterStatus: '待查验' },
    { operateTime: '2024-04-20 10:36:00', operator: '系统', operateContent: '查验完成', beforeStatus: '待查验', afterStatus: '已查验' },
    { operateTime: '2024-04-21 09:00:00', operator: '李四', operateContent: '发票认证', beforeStatus: '已查验', afterStatus: '已认证' }
  ]
  showLogDialog.value = true
}

const handleCloseDetail = () => {
  showDetail.value = false
  currentInvoice.value = null
}

const handleCloseRelated = () => {
  showRelated.value = false
  currentInvoice.value = null
}

const handleDownloadTemplate = () => {
  ElMessage.success('开始下载导入模板')
}

const handleFileChange = (file: UploadFile) => {
  ElMessage.info(`已选择文件: ${file.name}`)
}

const handleScanUpload = (file: UploadFile) => {
  // 模拟OCR识别
  setTimeout(() => {
    scanResult.value = {
      invoiceCode: '144031900110',
      invoiceNumber: '12345678',
      billingDate: '2024-04-15',
      amountWithoutTax: 8849.56,
      taxRate: 0.09,
      taxAmount: 796.46,
      totalAmount: 9646.02
    }
    ElMessage.success('发票识别成功')
  }, 1000)
}

const handleConfirmScan = () => {
  ElMessage.success('发票录入成功')
  showScanDialog.value = false
  handleRefresh()
}

const handleConfirmBatch = () => {
  if (batchDialogType.value === 'auth') {
    selectedRows.value.forEach(row => {
      row.authStatus = 'authenticated'
      row.authPeriod = batchForm.period
    })
    ElMessage.success(`成功认证 ${selectedRows.value.length} 张发票`)
  } else if (batchDialogType.value === 'deduct') {
    selectedRows.value.forEach(row => {
      row.authStatus = 'deducted'
      row.deductPeriod = batchForm.period
    })
    ElMessage.success(`成功抵扣 ${selectedRows.value.length} 张发票`)
  } else if (batchDialogType.value === 'cancel') {
    if (!batchForm.reason) {
      ElMessage.warning('请输入作废原因')
      return
    }
    selectedRows.value.forEach(row => {
      row.invoiceStatus = 'cancelled'
    })
    ElMessage.success(`成功作废 ${selectedRows.value.length} 张发票`)
  } else if (batchDialogType.value === 'red') {
    if (!batchForm.reason) {
      ElMessage.warning('请输入红冲原因')
      return
    }
    selectedRows.value.forEach(row => {
      row.invoiceStatus = 'red_letter'
    })
    ElMessage.success(`成功红冲 ${selectedRows.value.length} 张发票`)
  }

  showBatchDialog.value = false
  selectedRows.value = []
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.invoice-list-container {
  padding: 0;
}

.search-panel {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.statistics-cards {
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-card {
  padding: 12px 16px;
  border-radius: 6px;
  background: #f8f9fa;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-value.success {
  color: #67c23a;
}

.stat-value.primary {
  color: #409eff;
}

.stat-value.warning {
  color: #e6a23c;
}

.stat-sub {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 4px;
}

.action-bar {
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.table-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
  margin-top: 20px;
}

.pagination-info {
  font-size: 13px;
  color: #909399;
}

.total-amount {
  font-weight: 600;
  color: #303133;
}

.attachment-icon {
  color: #409eff;
  margin-left: 4px;
}

:deep(.abnormal-row) {
  background-color: #fef0f0 !important;
}

.import-dialog-content {
  padding: 20px;
}

.step-content {
  margin-top: 30px;
  min-height: 200px;
}

.step-1, .step-2, .step-3, .step-4 {
  text-align: center;
}

.step-2 ul {
  text-align: left;
  margin: 20px 0;
  padding-left: 40px;
}

.step-2 li {
  line-height: 2;
  color: #606266;
}

.error-list {
  margin-top: 20px;
}

.error-list h4 {
  margin-bottom: 10px;
}

.scan-dialog-content {
  padding: 20px;
  text-align: center;
}

.scan-upload {
  margin: 20px 0;
}

.scan-result {
  margin-top: 20px;
  text-align: left;
}

.batch-dialog-content {
  padding: 20px;
}
</style>
