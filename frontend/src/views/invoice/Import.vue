<template>
  <div class="invoice-import-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-divider direction="vertical" />
        <span class="page-title">批量导入发票</span>
      </div>
    </div>

    <!-- 导入向导 -->
    <div class="import-wizard">
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="选择导入方式" />
        <el-step title="下载模板" />
        <el-step title="上传文件" />
        <el-step title="数据校验" />
        <el-step title="确认导入" />
      </el-steps>

      <div class="step-content">
        <!-- Step 1: 选择导入方式 -->
        <div v-show="currentStep === 0" class="step-panel">
          <div class="import-mode-selection">
            <el-card
              v-for="mode in importModes"
              :key="mode.value"
              class="mode-card"
              :class="{ active: selectedMode === mode.value }"
              @click="handleSelectMode(mode.value)"
              shadow="hover"
            >
              <el-icon :size="48" :color="selectedMode === mode.value ? '#409eff' : '#909399'">
                <component :is="mode.icon" />
              </el-icon>
              <div class="mode-title">{{ mode.title }}</div>
              <div class="mode-desc">{{ mode.desc }}</div>
            </el-card>
          </div>
          <div class="step-action">
            <el-button type="primary" :disabled="!selectedMode" @click="currentStep++">下一步</el-button>
          </div>
        </div>

        <!-- Step 2: 下载模板 -->
        <div v-show="currentStep === 1" class="step-panel">
          <div class="template-download">
            <el-alert type="info" :closable="false">
              <template #title>
                <strong>模板说明：</strong>
                <ul class="template-rules">
                  <li>请下载标准导入模板，模板中包含了所有必填字段和示例数据</li>
                  <li>红色标注的字段为必填字段，请勿删除或修改表头</li>
                  <li>蓝色标注的字段为系统自动计算字段，无需填写</li>
                  <li>请根据发票类型选择对应的模板（进项发票/销项发票）</li>
                </ul>
              </template>
            </el-alert>

            <el-row :gutter="24" style="margin-top: 30px;">
              <el-col :span="12">
                <div class="template-item">
                  <div class="template-icon"><el-icon><Document /></el-icon></div>
                  <div class="template-info">
                    <div class="template-name">进项发票导入模板</div>
                    <div class="template-size">进项发票批量导入标准模板</div>
                  </div>
                  <el-button type="primary" @click="handleDownloadTemplate('JX')">
                    <el-icon><Download /></el-icon>
                    下载模板
                  </el-button>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="template-item">
                  <div class="template-icon"><el-icon><Document /></el-icon></div>
                  <div class="template-info">
                    <div class="template-name">销项发票导入模板</div>
                    <div class="template-size">销项发票批量导入标准模板</div>
                  </div>
                  <el-button type="primary" @click="handleDownloadTemplate('SX')">
                    <el-icon><Download /></el-icon>
                    下载模板
                  </el-button>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="step-action">
            <el-button @click="currentStep--">上一步</el-button>
            <el-button type="primary" @click="currentStep++">下一步</el-button>
          </div>
        </div>

        <!-- Step 3: 上传文件 -->
        <div v-show="currentStep === 2" class="step-panel">
          <el-upload
            ref="uploadRef"
            class="upload-area"
            drag
            :auto-upload="false"
            :limit="1"
            accept=".xlsx,.xls"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                只能上传 xlsx/xls 文件，且不超过 10MB
              </div>
            </template>
          </el-upload>

          <div class="upload-actions">
            <el-button link @click="handleDownloadTemplate(selectedMode === 'JX' ? 'JX' : 'SX')">
              <el-icon><Download /></el-icon>
              下载模板
            </el-button>
            <el-button link @click="handleViewHistory">
              <el-icon><Clock /></el-icon>
              导入记录
            </el-button>
          </div>
          <div class="step-action">
            <el-button @click="currentStep--">上一步</el-button>
            <el-button type="primary" :disabled="!uploadFile" @click="handleUpload">下一步</el-button>
          </div>
        </div>

        <!-- Step 4: 数据校验 -->
        <div v-show="currentStep === 3" class="step-panel">
          <div class="validation-result">
            <el-row :gutter="24">
              <el-col :span="6">
                <div class="stat-card success">
                  <div class="stat-value">{{ validationResult.success }}</div>
                  <div class="stat-label">校验成功</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card warning">
                  <div class="stat-value">{{ validationResult.warnings }}</div>
                  <div class="stat-label">警告</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card danger">
                  <div class="stat-value">{{ validationResult.errors }}</div>
                  <div class="stat-label">错误</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card info">
                  <div class="stat-value">{{ validationResult.total }}</div>
                  <div class="stat-label">总记录数</div>
                </div>
              </el-col>
            </el-row>

            <el-tabs v-model="validationTab" style="margin-top: 24px;">
              <el-tab-pane label="错误记录" name="errors">
                <el-table :data="validationErrors" border size="small" max-height="300">
                  <el-table-column prop="row" label="行号" width="80" />
                  <el-table-column prop="field" label="字段" width="120" />
                  <el-table-column prop="value" label="错误值" width="150" />
                  <el-table-column prop="reason" label="错误原因" />
                  <el-table-column label="操作" width="100">
                    <template #default="{ row }">
                      <el-button type="primary" link size="small" @click="handleEditRow(row)">修正</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-empty v-if="!validationErrors.length" description="没有错误记录" />
              </el-tab-pane>

              <el-tab-pane label="警告记录" name="warnings">
                <el-table :data="validationWarnings" border size="small" max-height="300">
                  <el-table-column prop="row" label="行号" width="80" />
                  <el-table-column prop="field" label="字段" width="120" />
                  <el-table-column prop="value" label="警告值" width="150" />
                  <el-table-column prop="reason" label="警告原因" />
                  <el-table-column label="操作" width="100">
                    <template #default="{ row }">
                      <el-button type="primary" link size="small" @click="handleIgnoreWarning(row)">忽略</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-empty v-if="!validationWarnings.length" description="没有警告记录" />
              </el-tab-pane>

              <el-tab-pane label="成功记录" name="success">
                <el-table :data="validationSuccess" border size="small" max-height="300">
                  <el-table-column prop="row" label="行号" width="80" />
                  <el-table-column prop="invoiceType" label="发票类型" width="100" />
                  <el-table-column prop="invoiceCode" label="发票代码" width="140" />
                  <el-table-column prop="invoiceNumber" label="发票号码" width="120" />
                  <el-table-column prop="partyName" label="对方单位" min-width="150" />
                  <el-table-column prop="totalAmount" label="价税合计" width="120" align="right">
                    <template #default="{ row }">¥{{ row.totalAmount }}</template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </div>
          <div class="step-action">
            <el-button @click="currentStep--">上一步</el-button>
            <el-button type="primary" :disabled="validationResult.errors > 0" @click="currentStep++">下一步</el-button>
          </div>
        </div>

        <!-- Step 5: 确认导入 -->
        <div v-show="currentStep === 4" class="step-panel">
          <div class="confirm-import">
            <el-alert type="success" :closable="false">
              <template #title>
                准备导入 {{ validationResult.success }} 条发票记录
              </template>
            </el-alert>

            <el-descriptions :column="2" border style="margin-top: 24px;">
              <el-descriptions-item label="导入方向">
                {{ selectedMode === 'JX' ? '进项发票' : '销项发票' }}
              </el-descriptions-item>
              <el-descriptions-item label="文件名称">
                {{ uploadFile?.name }}
              </el-descriptions-item>
              <el-descriptions-item label="成功记录">
                {{ validationResult.success }} 条
              </el-descriptions-item>
              <el-descriptions-item label="警告记录">
                {{ validationResult.warnings }} 条（已忽略）
              </el-descriptions-item>
            </el-descriptions>

            <div class="import-options">
              <el-checkbox v-model="importOptions.skipDuplicate">跳过重复发票（已存在的发票号码不重复导入）</el-checkbox>
              <el-checkbox v-model="importOptions.autoVerify">导入后自动查验发票</el-checkbox>
              <el-checkbox v-model="importOptions.autoRelate">导入后自动关联订单</el-checkbox>
            </div>
          </div>
          <div class="step-action">
            <el-button @click="currentStep--">上一步</el-button>
            <el-button type="primary" :loading="importing" @click="handleConfirmImport">确认导入</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 导入进度对话框 -->
    <el-dialog v-model="showProgressDialog" title="正在导入" width="400px" :close-on-click-modal="false">
      <div class="progress-content">
        <el-progress :percentage="importProgress" :stroke-width="20" status="success" />
        <div class="progress-text">
          正在导入第 {{ importedCount }} / {{ validationResult.success }} 条记录...
        </div>
      </div>
    </el-dialog>

    <!-- 导入结果对话框 -->
    <el-dialog v-model="showResultDialog" title="导入完成" width="500px">
      <div class="result-content">
        <el-result
          :icon="importResult.success ? 'success' : 'error'"
          :title="importResult.success ? '导入成功' : '导入失败'"
        >
          <template #sub-title>
            <p>成功导入 {{ importResult.successCount }} 条记录</p>
            <p v-if="importResult.failCount > 0" style="color: #f56c6c;">失败 {{ importResult.failCount }} 条记录</p>
          </template>
          <template #extra>
            <el-button type="primary" @click="handleViewResult">查看详情</el-button>
            <el-button @click="showResultDialog = false; handleBack()">完成</el-button>
          </template>
        </el-result>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'
import {
  ArrowLeft, UploadFilled, Download, Clock, Document,
  DocumentAdd, Connection
} from '@element-plus/icons-vue'

const router = useRouter()

// 步骤
const currentStep = ref(0)
const selectedMode = ref('')
const uploadRef = ref()
const uploadFile = ref<UploadFile | null>(null)
const importing = ref(false)
const importProgress = ref(0)
const importedCount = ref(0)

// 导入方式
const importModes = [
  {
    value: 'JX',
    title: '导入进项发票',
    desc: '从供应商取得的发票，包括采购发票、服务发票等',
    icon: 'DocumentAdd'
  },
  {
    value: 'SX',
    title: '导入销项发票',
    desc: '开具给客户的发票，包括销售发票、服务发票等',
    icon: 'DocumentAdd'
  },
  {
    value: 'SCAN',
    title: '扫码枪导入',
    desc: '连接扫码枪，连续扫描发票二维码进行导入',
    icon: 'Search'
  },
  {
    value: 'OCR',
    title: 'OCR识别导入',
    desc: '上传发票图片，通过OCR识别提取发票信息',
    icon: 'Connection'
  }
]

// 校验结果
const validationResult = reactive({
  total: 25,
  success: 23,
  warnings: 1,
  errors: 1
})

const validationTab = ref('errors')

const validationErrors = ref<any[]>([
  { row: 5, field: 'invoiceNumber', value: '1234567', reason: '发票号码应为8位数字' },
  { row: 12, field: 'taxRate', value: '0.15', reason: '税率不在可选范围内' }
])

const validationWarnings = ref<any[]>([
  { row: 8, field: 'amount', value: '9646.02', reason: '金额与订单金额存在轻微差异（差异率0.5%）' }
])

const validationSuccess = ref<any[]>([
  { row: 1, invoiceType: 'SZ', invoiceCode: '144031900110', invoiceNumber: '12345678', partyName: '深圳市腾讯科技有限公司', totalAmount: 9646.02 },
  { row: 2, invoiceType: 'PT', invoiceCode: '111011900110', invoiceNumber: '87654321', partyName: '阿里巴巴（中国）有限公司', totalAmount: 5000.00 }
])

// 导入选项
const importOptions = reactive({
  skipDuplicate: true,
  autoVerify: false,
  autoRelate: false
})

// 导入结果
const showProgressDialog = ref(false)
const showResultDialog = ref(false)
const importResult = reactive({
  success: true,
  successCount: 23,
  failCount: 0
})

// 方法
const handleBack = () => {
  router.push('/invoice/input')
}

const handleSelectMode = (mode: string) => {
  selectedMode.value = mode
}

const handleDownloadTemplate = (type: string) => {
  ElMessage.success(`下载${type === 'JX' ? '进项' : '销项'}发票导入模板`)
}

const handleViewHistory = () => {
  ElMessage.info('打开导入历史记录')
}

const handleFileChange = (file: UploadFile) => {
  uploadFile.value = file
}

const handleFileRemove = () => {
  uploadFile.value = null
}

const handleUpload = () => {
  // 模拟上传和校验
  setTimeout(() => {
    currentStep.value++
  }, 500)
}

const handleEditRow = (row: any) => {
  ElMessage.info(`打开行 ${row.row} 编辑`)
}

const handleIgnoreWarning = (row: any) => {
  validationWarnings.value = validationWarnings.value.filter(r => r.row !== row.row)
  validationResult.warnings--
}

const handleConfirmImport = () => {
  showProgressDialog.value = true
  importProgress.value = 0
  importedCount.value = 0
  importing.value = true

  const interval = setInterval(() => {
    importedCount.value++
    importProgress.value = Math.round((importedCount.value / validationResult.success) * 100)

    if (importedCount.value >= validationResult.success) {
      clearInterval(interval)
      importing.value = false
      showProgressDialog.value = false
      showResultDialog.value = true
    }
  }, 100)
}

const handleViewResult = () => {
  showResultDialog.value = false
  ElMessage.info('查看导入结果详情')
}

onMounted(() => {
  // 初始化
})
</script>

<style scoped>
.invoice-import-container {
  padding: 0;
  background: #f5f7fa;
  min-height: 100%;
}

.action-header {
  background: #fff;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left .page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.import-wizard {
  background: #fff;
  margin: 16px;
  padding: 32px;
  border-radius: 8px;
}

.step-content {
  margin-top: 40px;
  min-height: 400px;
}

.step-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-action {
  margin-top: 40px;
  text-align: center;
}

.import-mode-selection {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.mode-card {
  cursor: pointer;
  text-align: center;
  padding: 30px 20px;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.mode-card.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.mode-card:hover {
  transform: translateY(-4px);
}

.mode-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-top: 16px;
}

.mode-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.template-download {
  max-width: 800px;
  margin: 0 auto;
}

.template-rules {
  margin: 12px 0 0 0;
  padding-left: 20px;
}

.template-rules li {
  line-height: 2;
}

.template-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.template-icon {
  width: 48px;
  height: 48px;
  background: #ecf5ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: #409eff;
  font-size: 24px;
}

.template-info {
  flex: 1;
}

.template-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.template-size {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.upload-area {
  text-align: center;
  padding: 60px 0;
}

.upload-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  padding: 24px;
  border-radius: 8px;
  text-align: center;
}

.stat-card.success {
  background: #f0f9eb;
}

.stat-card.warning {
  background: #fdf6ec;
}

.stat-card.danger {
  background: #fef0f0;
}

.stat-card.info {
  background: #f4f4f5;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
}

.stat-card.success .stat-value {
  color: #67c23a;
}

.stat-card.warning .stat-value {
  color: #e6a23c;
}

.stat-card.danger .stat-value {
  color: #f56c6c;
}

.stat-card.info .stat-value {
  color: #909399;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

.import-options {
  margin-top: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.import-options .el-checkbox {
  display: block;
  margin-top: 12px;
}

.import-options .el-checkbox:first-child {
  margin-top: 0;
}

.progress-content {
  text-align: center;
}

.progress-text {
  margin-top: 16px;
  color: #606266;
}

.result-content {
  padding: 20px;
}
</style>
