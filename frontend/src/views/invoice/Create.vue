<template>
  <div class="invoice-create-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-divider direction="vertical" />
        <span class="page-title">{{ isEdit ? '编辑发票' : '新增发票' }}</span>
      </div>
      <div class="header-right">
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button type="primary" @click="handleSubmit">提交查验</el-button>
      </div>
    </div>

    <!-- 录入方式选择 -->
    <div class="input-mode-tabs" v-if="!isEdit">
      <el-radio-group v-model="inputMode" size="default" @change="handleInputModeChange">
        <el-radio-button value="manual">手工录入</el-radio-button>
        <el-radio-button value="ocr">OCR识别</el-radio-button>
        <el-radio-button value="import">批量导入</el-radio-button>
        <el-radio-button value="sync">税局同步</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 发票表单 -->
    <div class="form-container">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="140px" size="default">

        <!-- 基本信息区 -->
        <div class="form-section">
          <div class="section-title">
            <el-icon><Document /></el-icon>
            基本信息
          </div>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="发票方向" prop="invoiceDirection">
                <el-radio-group v-model="formData.invoiceDirection" :disabled="isEdit">
                  <el-radio value="JX">进项发票</el-radio>
                  <el-radio value="SX">销项发票</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发票类型" prop="invoiceType">
                <el-select v-model="formData.invoiceType" placeholder="请选择发票类型" style="width: 100%;" :disabled="isEdit">
                  <el-option label="增值税专用发票" value="SZ" />
                  <el-option label="增值税普通发票" value="PT" />
                  <el-option label="电子发票" value="DZ" />
                  <el-option label="机动车销售统一发票" value="JD" />
                  <el-option label="区块链电子发票" value="QKL" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="发票代码" prop="invoiceCode">
                <el-input v-model="formData.invoiceCode" placeholder="请输入10位或12位发票代码" maxlength="12" :disabled="isEdit" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发票号码" prop="invoiceNumber">
                <el-input v-model="formData.invoiceNumber" placeholder="请输入8位发票号码" maxlength="8" :disabled="isEdit">
                  <template #append>
                    <el-button @click="handleCheckDuplicate" :loading="checkingDuplicate">查重</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="开票日期" prop="billingDate">
                <el-date-picker
                  v-model="formData.billingDate"
                  type="date"
                  placeholder="选择开票日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%;"
                  :disabled="isEdit"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="校验码" prop="checkCode" v-if="formData.invoiceType === 'PT'">
                <el-input v-model="formData.checkCode" placeholder="请输入20位校验码" maxlength="20" :disabled="isEdit" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 采购方信息区 -->
        <div class="form-section">
          <div class="section-title">
            <el-icon><OfficeBuilding /></el-icon>
            采购方信息
            <el-tooltip content="发票中的购买方信息" placement="top">
              <el-icon style="margin-left: 4px; color: #909399; cursor: help;"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="采购方名称" prop="purchaserName">
                <el-select
                  v-model="formData.purchaserId"
                  filterable
                  remote
                  reserve-keyword
                  placeholder="请输入名称搜索"
                  :remote-method="handleSearchPurchaser"
                  :loading="purchaserLoading"
                  style="width: 100%;"
                  @change="handlePurchaserChange"
                >
                  <el-option
                    v-for="item in purchaserOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  >
                    <span style="float: left">{{ item.name }}</span>
                    <span style="float: right; color: #909399; font-size: 12px">{{ item.taxNo }}</span>
                  </el-option>
                  <template #footer>
                    <el-button text type="primary" @click="handleAddPurchaser">
                      <el-icon><Plus /></el-icon>
                      新增采购方
                    </el-button>
                  </template>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="采购方税号" prop="purchaserTaxNo">
                <el-input v-model="formData.purchaserTaxNo" placeholder="统一社会信用代码" maxlength="18" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="地址电话">
                <el-input v-model="formData.purchaserAddress" placeholder="请输入地址和电话" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="开户行账号">
                <el-input v-model="formData.purchaserBank" placeholder="请输入开户行及账号" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 销售方信息区 -->
        <div class="form-section">
          <div class="section-title">
            <el-icon><OfficeBuilding /></el-icon>
            销售方信息
            <el-tooltip content="发票中的销售方信息" placement="top">
              <el-icon style="margin-left: 4px; color: #909399; cursor: help;"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="销售方名称" prop="sellerName">
                <el-select
                  v-model="formData.sellerId"
                  filterable
                  remote
                  reserve-keyword
                  placeholder="请输入名称搜索"
                  :remote-method="handleSearchSeller"
                  :loading="sellerLoading"
                  style="width: 100%;"
                  @change="handleSellerChange"
                >
                  <el-option
                    v-for="item in sellerOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  >
                    <span style="float: left">{{ item.name }}</span>
                    <span style="float: right; color: #909399; font-size: 12px">{{ item.taxNo }}</span>
                  </el-option>
                  <template #footer>
                    <el-button text type="primary" @click="handleAddSeller">
                      <el-icon><Plus /></el-icon>
                      新增销售方
                    </el-button>
                  </template>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="销售方税号" prop="sellerTaxNo">
                <el-input v-model="formData.sellerTaxNo" placeholder="统一社会信用代码" maxlength="18" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="地址电话">
                <el-input v-model="formData.sellerAddress" placeholder="请输入地址和电话" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="开户行账号">
                <el-input v-model="formData.sellerBank" placeholder="请输入开户行及账号" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 开票明细区 -->
        <div class="form-section">
          <div class="section-title">
            <el-icon><List /></el-icon>
            开票明细
            <el-button type="primary" link size="small" @click="handleAddItem" style="margin-left: auto;">
              <el-icon><Plus /></el-icon>
              添加明细行
            </el-button>
          </div>

          <el-table :data="formData.items" border size="small" style="width: 100%;">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column label="商品/服务名称" min-width="200">
              <template #default="{ row, $index }">
                <el-form-item :prop="`items.${$index}.name`" :rules="[{ required: true, message: '请输入商品名称', trigger: 'blur' }]">
                  <el-input v-model="row.name" placeholder="请输入商品/服务名称" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="税收分类编码" width="150">
              <template #default="{ row, $index }">
                <el-form-item :prop="`items.${$index}.taxClassificationCode`" :rules="[{ required: true, message: '请选择分类编码', trigger: 'change' }]">
                  <el-select v-model="row.taxClassificationCode" filterable placeholder="请选择" style="width: 100%;">
                    <el-option label="货物-钢材" value="1010101" />
                    <el-option label="货物-水泥" value="1010102" />
                    <el-option label="服务-咨询服务" value="3040101" />
                    <el-option label="服务-设计服务" value="3040201" />
                    <el-option label="服务-软件服务" value="3040301" />
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="规格型号" width="120">
              <template #default="{ row, $index }">
                <el-form-item :prop="`items.${$index}.spec`">
                  <el-input v-model="row.spec" placeholder="规格" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="单位" width="80">
              <template #default="{ row, $index }">
                <el-form-item :prop="`items.${$index}.unit`">
                  <el-select v-model="row.unit" placeholder="单位" style="width: 100%;">
                    <el-option label="个" value="个" />
                    <el-option label="件" value="件" />
                    <el-option label="台" value="台" />
                    <el-option label="套" value="套" />
                    <el-option label="次" value="次" />
                    <el-option label="项" value="项" />
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="数量" width="100">
              <template #default="{ row, $index }">
                <el-form-item :prop="`items.${$index}.quantity`">
                  <el-input-number v-model="row.quantity" :min="0" :precision="2" placeholder="数量" style="width: 100%;" @change="calculateItemAmount($index)" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="单价" width="120">
              <template #default="{ row, $index }">
                <el-form-item :prop="`items.${$index}.unitPrice`">
                  <el-input-number v-model="row.unitPrice" :min="0" :precision="8" placeholder="单价" style="width: 100%;" @change="calculateItemAmount($index)" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="金额" width="130">
              <template #default="{ row, $index }">
                <el-form-item :prop="`items.${$index}.amount`" :rules="[{ required: true, message: '请输入金额', trigger: 'blur' }]">
                  <el-input-number v-model="row.amount" :min="0" :precision="2" placeholder="金额" style="width: 100%;" @change="calculateItemAmount($index)" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="税率" width="100">
              <template #default="{ row, $index }">
                <el-form-item :prop="`items.${$index}.taxRate`" :rules="[{ required: true, message: '请选择税率', trigger: 'change' }]">
                  <el-select v-model="row.taxRate" placeholder="税率" style="width: 100%;" @change="calculateItemAmount($index)">
                    <el-option label="0%" :value="0" />
                    <el-option label="3%" :value="0.03" />
                    <el-option label="6%" :value="0.06" />
                    <el-option label="9%" :value="0.09" />
                    <el-option label="13%" :value="0.13" />
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="税额" width="120">
              <template #default="{ row }">
                <span>¥{{ row.taxAmount.toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="价税合计" width="130">
              <template #default="{ row }">
                <span class="total-cell">¥{{ row.totalAmount.toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60" fixed="right">
              <template #default="{ $index }">
                <el-button type="danger" link size="small" @click="handleRemoveItem($index)" :disabled="formData.items.length <= 1">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 汇总信息区 -->
        <div class="form-section summary-section">
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="不含税金额合计">
                <div class="summary-value">¥{{ summaryData.amountWithoutTax.toFixed(2) }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="税额合计">
                <div class="summary-value primary">¥{{ summaryData.taxAmount.toFixed(2) }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="价税合计">
                <div class="summary-value large">¥{{ summaryData.totalAmount.toFixed(2) }}</div>
                <div class="summary-value-rmb">大写：{{ summaryData.totalAmountRmb }}</div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 附件区 -->
        <div class="form-section">
          <div class="section-title">
            <el-icon><Paperclip /></el-icon>
            发票附件
            <el-button type="primary" link size="small" @click="showOcrDialog = true" style="margin-left: auto;">
              <el-icon><Camera /></el-icon>
              OCR识别
            </el-button>
          </div>
          <el-form-item label="发票原件" prop="attachments" :rules="[{ required: true, message: '请上传发票原件', trigger: 'change' }]">
            <el-upload
              ref="uploadRef"
              action="#"
              :auto-upload="false"
              :file-list="fileList"
              list-type="picture-card"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :limit="5"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">支持 JPG、PNG、PDF 格式，单文件不超过 10MB，最多上传5张</div>
          </el-form-item>
        </div>

        <!-- 其他信息区 -->
        <div class="form-section">
          <div class="section-title">
            <el-icon><Setting /></el-icon>
            其他信息
          </div>
          <el-row :gutter="24">
            <el-col :span="12" v-if="formData.invoiceDirection === 'JX'">
              <el-form-item label="认证期限">
                <div class="info-value">
                  {{ authDeadline }}
                  <el-tag v-if="authDeadlineWarning" type="warning" size="small" style="margin-left: 8px;">即将到期</el-tag>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="formData.invoiceDirection === 'JX'">
              <el-form-item label="期望抵扣期间">
                <el-date-picker
                  v-model="formData.expectedDeductPeriod"
                  type="month"
                  placeholder="选择月份"
                  value-format="YYYY-MM"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="关联订单">
                <el-select
                  v-model="formData.relatedOrders"
                  multiple
                  filterable
                  remote
                  reserve-keyword
                  placeholder="请输入订单号搜索"
                  :remote-method="handleSearchOrder"
                  :loading="orderLoading"
                  style="width: 100%;"
                >
                  <el-option
                    v-for="item in orderOptions"
                    :key="item.id"
                    :label="item.orderNo"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="备注">
                <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注信息，最多500字" maxlength="500" show-word-limit />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

      </el-form>
    </div>

    <!-- OCR识别对话框 -->
    <el-dialog v-model="showOcrDialog" title="OCR发票识别" width="600px">
      <div class="ocr-dialog-content">
        <el-upload
          ref="ocrUploadRef"
          class="ocr-upload"
          drag
          :auto-upload="false"
          :show-file-list="false"
          accept="image/*"
          :on-change="handleOcrUpload"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">将发票图片拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">支持 JPG、PNG 格式，大小不超过 5MB</div>
          </template>
        </el-upload>

        <div v-if="ocrLoading" class="ocr-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>正在识别发票信息...</span>
        </div>

        <div v-if="ocrResult" class="ocr-result">
          <el-divider>识别结果</el-divider>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="发票代码">{{ ocrResult.invoiceCode }}</el-descriptions-item>
            <el-descriptions-item label="发票号码">{{ ocrResult.invoiceNumber }}</el-descriptions-item>
            <el-descriptions-item label="开票日期">{{ ocrResult.billingDate }}</el-descriptions-item>
            <el-descriptions-item label="不含税金额">¥{{ ocrResult.amountWithoutTax }}</el-descriptions-item>
            <el-descriptions-item label="税率">{{ ocrResult.taxRate }}</el-descriptions-item>
            <el-descriptions-item label="税额">¥{{ ocrResult.taxAmount }}</el-descriptions-item>
            <el-descriptions-item label="价税合计" :span="2">¥{{ ocrResult.totalAmount }}</el-descriptions-item>
            <el-descriptions-item label="销售方名称" :span="2">{{ ocrResult.sellerName }}</el-descriptions-item>
            <el-descriptions-item label="采购方名称" :span="2">{{ ocrResult.purchaserName }}</el-descriptions-item>
          </el-descriptions>

          <div v-if="ocrResult.lowConfidenceFields?.length" class="ocr-warning">
            <el-alert type="warning" :closable="false">
              <template #title>
                以下字段识别置信度较低，请人工核对：
                {{ ocrResult.lowConfidenceFields.join('、') }}
              </template>
            </el-alert>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showOcrDialog = false">关闭</el-button>
        <el-button v-if="ocrResult" type="primary" @click="handleConfirmOcr">确认应用</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import {
  ArrowLeft, Document, OfficeBuilding, List, Paperclip,
  Setting, Plus, Delete, Camera, UploadFilled, Loading, QuestionFilled
} from '@element-plus/icons-vue'
import { PARTY_ARCHIVE, searchParty, type InvoiceParty, type InvoiceDirection } from './types'

const router = useRouter()
const route = useRoute()

// 表单引用
const formRef = ref<FormInstance>()
const uploadRef = ref()
const ocrUploadRef = ref()

// 状态
const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const checkingDuplicate = ref(false)
const purchaserLoading = ref(false)
const sellerLoading = ref(false)
const orderLoading = ref(false)
const showOcrDialog = ref(false)
const ocrLoading = ref(false)
const ocrResult = ref<any>(null)
const fileList = ref<UploadFile[]>([])

// 输入模式
const inputMode = ref('manual')

// 采购方/销售方选项
const purchaserOptions = ref<InvoiceParty[]>(PARTY_ARCHIVE.map(p => ({ ...p })))
const sellerOptions = ref<InvoiceParty[]>(PARTY_ARCHIVE.map(p => ({ ...p })))

// 订单选项
const orderOptions = ref<any[]>([
  { id: '1', orderNo: 'SO20240401000001' },
  { id: '2', orderNo: 'PO20240402000002' },
  { id: '3', orderNo: 'SO20240403000003' }
])

// 表单数据
const formData = reactive({
  invoiceDirection: (route.query.direction as InvoiceDirection) || 'JX' as InvoiceDirection,
  invoiceType: 'SZ',
  invoiceCode: '',
  invoiceNumber: '',
  billingDate: '',
  checkCode: '',
  // 采购方
  purchaserId: '' as string | undefined,
  purchaserName: '',
  purchaserTaxNo: '',
  purchaserAddress: '',
  purchaserBank: '',
  // 销售方
  sellerId: '' as string | undefined,
  sellerName: '',
  sellerTaxNo: '',
  sellerAddress: '',
  sellerBank: '',
  items: [
    {
      id: '1',
      name: '',
      taxClassificationCode: '',
      spec: '',
      unit: '',
      quantity: undefined as number | undefined,
      unitPrice: undefined as number | undefined,
      amount: 0,
      taxRate: 0.13,
      taxAmount: 0,
      totalAmount: 0
    }
  ],
  expectedDeductPeriod: '',
  relatedOrders: [] as string[],
  remark: '',
  attachments: [] as File[]
})

// 表单校验规则
const formRules: FormRules = {
  invoiceDirection: [{ required: true, message: '请选择发票方向', trigger: 'change' }],
  invoiceType: [{ required: true, message: '请选择发票类型', trigger: 'change' }],
  invoiceCode: [
    { required: true, message: '请输入发票代码', trigger: 'blur' },
    { pattern: /^\d{10}$|^\d{12}$/, message: '发票代码应为10位或12位数字', trigger: 'blur' }
  ],
  invoiceNumber: [
    { required: true, message: '请输入发票号码', trigger: 'blur' },
    { pattern: /^\d{8}$/, message: '发票号码应为8位数字', trigger: 'blur' }
  ],
  billingDate: [{ required: true, message: '请选择开票日期', trigger: 'change' }],
  purchaserName: [{ required: true, message: '请选择采购方', trigger: 'change' }],
  sellerName: [{ required: true, message: '请选择销售方', trigger: 'change' }]
}

// 采购方切换
const handlePurchaserChange = (val: string | undefined) => {
  const party = purchaserOptions.value.find(p => p.id === val)
  if (party) {
    formData.purchaserName = party.name
    formData.purchaserTaxNo = party.taxNo || ''
    formData.purchaserAddress = party.address ? `${party.address} ${party.phone || ''}`.trim() : ''
    formData.purchaserBank = party.bankName ? `${party.bankName} ${party.bankAccount}` : ''
  }
}

// 销售方切换
const handleSellerChange = (val: string | undefined) => {
  const party = sellerOptions.value.find(p => p.id === val)
  if (party) {
    formData.sellerName = party.name
    formData.sellerTaxNo = party.taxNo || ''
    formData.sellerAddress = party.address ? `${party.address} ${party.phone || ''}`.trim() : ''
    formData.sellerBank = party.bankName ? `${party.bankName} ${party.bankAccount}` : ''
  }
}

// 汇总计算
const summaryData = computed(() => {
  let amountWithoutTax = 0
  let taxAmount = 0
  let totalAmount = 0

  formData.items.forEach(item => {
    amountWithoutTax += item.amount
    taxAmount += item.taxAmount
    totalAmount += item.totalAmount
  })

  return {
    amountWithoutTax,
    taxAmount,
    totalAmount,
    totalAmountRmb: digitToChinese(totalAmount)
  }
})

// 认证期限计算
const authDeadline = computed(() => {
  if (!formData.billingDate) return '-'
  const date = new Date(formData.billingDate)
  date.setDate(date.getDate() + 360)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
})

// 认证期限预警
const authDeadlineWarning = computed(() => {
  if (!authDeadline.value || authDeadline.value === '-') return false
  const deadline = new Date(authDeadline.value)
  const now = new Date()
  const diff = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diff <= 30 && diff > 0
})

// 返回列表路径
const getListPath = () => formData.invoiceDirection === 'SX' ? '/invoice/output' : '/invoice/input'

// 方法
const handleBack = () => {
  router.push(getListPath())
}

// 录入方式切换
const handleInputModeChange = (val: string | number | boolean | undefined) => {
  const mode = String(val)
  if (mode === 'ocr') {
    showOcrDialog.value = true
    inputMode.value = 'manual'
  } else if (mode === 'import') {
    ElMessage.info('请返回列表页使用"批量导入"功能上传发票')
    inputMode.value = 'manual'
  } else if (mode === 'sync') {
    ElMessage.info('税局同步功能开发中')
    inputMode.value = 'manual'
  }
}

const handleSaveDraft = async () => {
  if (!formData.invoiceDirection) {
    ElMessage.warning('请选择发票方向')
    return
  }
  if (!formData.invoiceType) {
    ElMessage.warning('请选择发票类型')
    return
  }
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('草稿保存成功')
    router.push(getListPath())
  }, 800)
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    setTimeout(() => {
      loading.value = false
      ElMessage.success('发票提交查验成功')
      router.push(getListPath())
    }, 1000)
  } catch {
    ElMessage.warning('请完善表单信息')
  }
}

const handleCheckDuplicate = async () => {
  if (!formData.invoiceCode || !formData.invoiceNumber) {
    ElMessage.warning('请先输入发票代码和号码')
    return
  }
  checkingDuplicate.value = true
  setTimeout(() => {
    checkingDuplicate.value = false
    // 模拟查重
    const isDuplicate = Math.random() > 0.8
    if (isDuplicate) {
      ElMessage.warning('该发票已存在，请勿重复录入')
    } else {
      ElMessage.success('该发票可以录入')
    }
  }, 500)
}

const handleSearchPurchaser = (query: string) => {
  purchaserLoading.value = true
  setTimeout(() => {
    purchaserLoading.value = false
    purchaserOptions.value = query ? searchParty(query) : PARTY_ARCHIVE
  }, 300)
}

const handleSearchSeller = (query: string) => {
  sellerLoading.value = true
  setTimeout(() => {
    sellerLoading.value = false
    sellerOptions.value = query ? searchParty(query) : PARTY_ARCHIVE
  }, 300)
}

const handleAddPurchaser = () => {
  ElMessage.info('跳转新增采购方档案页面')
}

const handleAddSeller = () => {
  ElMessage.info('跳转新增销售方档案页面')
}

const handleSearchOrder = (query: string) => {
  if (!query) return
  orderLoading.value = true
  setTimeout(() => {
    orderLoading.value = false
    orderOptions.value = [
      { id: '1', orderNo: `SO20240401${query.padStart(5, '0')}` },
      { id: '2', orderNo: `PO20240402${query.padStart(5, '0')}` }
    ]
  }, 500)
}

const handleAddItem = () => {
  formData.items.push({
    id: String(Date.now()),
    name: '',
    taxClassificationCode: '',
    spec: '',
    unit: '',
    quantity: undefined,
    unitPrice: undefined,
    amount: 0,
    taxRate: 0.13,
    taxAmount: 0,
    totalAmount: 0
  })
}

const handleRemoveItem = (index: number) => {
  if (formData.items.length <= 1) {
    ElMessage.warning('至少保留一行明细')
    return
  }
  formData.items.splice(index, 1)
}

const calculateItemAmount = (index: number) => {
  const item = formData.items[index]
  if (item.quantity && item.unitPrice) {
    item.amount = item.quantity * item.unitPrice
  }
  item.taxAmount = item.amount * item.taxRate
  item.totalAmount = item.amount + item.taxAmount
}

const handleFileChange = (_file: UploadFile, files: UploadFile[]) => {
  fileList.value = files
  formData.attachments = files.map(f => f.raw as File)
}

const handleFileRemove = (_file: UploadFile, files: UploadFile[]) => {
  fileList.value = files
  formData.attachments = files.map(f => f.raw as File)
}

const handleOcrUpload = (_file: UploadFile) => {
  ocrLoading.value = true
  ocrResult.value = null
  setTimeout(() => {
    ocrLoading.value = false
    ocrResult.value = {
      invoiceCode: '144031900110',
      invoiceNumber: '12345678',
      billingDate: '2024-04-15',
      amountWithoutTax: '8849.56',
      taxRate: '9%',
      taxAmount: '796.46',
      totalAmount: '9646.02',
      sellerName: '深圳市XX科技有限公司',
      purchaserName: '广州XX有限公司',
      lowConfidenceFields: ['发票号码']
    }
    ElMessage.success('发票识别完成，请核对信息')
  }, 1500)
}

const handleConfirmOcr = () => {
  if (ocrResult.value) {
    formData.invoiceCode = ocrResult.value.invoiceCode
    formData.invoiceNumber = ocrResult.value.invoiceNumber
    formData.billingDate = ocrResult.value.billingDate
    ElMessage.success('已应用识别结果')
  }
  showOcrDialog.value = false
}

// 数字转中文大写
const digitToChinese = (num: number): string => {
  const fraction = ['角', '分']
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const unit = [['元', '万', '亿'], ['', '拾', '佰', '仟']]

  let s = ''
  const numStr = num.toFixed(2)
  const decimalPart = numStr.split('.')[1]
  const integerPart = numStr.split('.')[0]

  // 整数部分
  let zheng = ''
  let count = 0
  for (let i = integerPart.length - 1; i >= 0; i--) {
    const n = parseInt(integerPart[i])
    if (count !== 0 && count % 4 === 0) {
      zheng = digit[0] + zheng
    }
    if (n !== 0) {
      zheng = digit[n] + unit[1][count % 4] + zheng
    } else {
      zheng = digit[n] + zheng
    }
    count++
  }

  // 小数部分
  let jiao = ''
  if (decimalPart) {
    for (let i = 0; i < decimalPart.length; i++) {
      const n = parseInt(decimalPart[i])
      if (i < 2) {
        jiao += digit[n] + fraction[i]
      }
    }
  }

  s = zheng + jiao
  return s.replace(/零角零分/g, '').replace(/零角/g, '零').replace(/零分/g, '').replace(/零元/g, '元').replace(/亿万/g, '亿')
}

onMounted(() => {
  // 初始化
})
</script>

<style scoped>
.invoice-create-container {
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

.header-right {
  display: flex;
  gap: 10px;
}

.input-mode-tabs {
  background: #fff;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.form-container {
  background: #fff;
  margin: 16px;
  padding: 24px;
  border-radius: 8px;
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px dashed #ebeef5;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-top: 24px;
}

.summary-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.summary-value.primary {
  color: #409eff;
}

.summary-value.large {
  font-size: 24px;
  color: #f56c6c;
}

.summary-value-rmb {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.info-value {
  color: #606266;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.total-cell {
  font-weight: 600;
  color: #303133;
}

.ocr-dialog-content {
  padding: 20px;
}

.ocr-upload {
  text-align: center;
  margin-bottom: 20px;
}

.ocr-loading {
  text-align: center;
  padding: 40px 0;
  color: #606266;
}

.ocr-loading .el-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.ocr-result {
  margin-top: 20px;
}

.ocr-warning {
  margin-top: 16px;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-form-item__error) {
  padding-top: 2px;
}

:deep(.el-table .el-form-item) {
  margin-bottom: 0;
}
</style>
