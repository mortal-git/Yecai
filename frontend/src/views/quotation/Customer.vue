<template>
  <div class="quotation-customer-container">
    <div class="action-header">
      <div>
        <div class="page-title">客户收入报价管理</div>
        <p class="page-subtitle">围绕正式报价发布、H5 链接外发、客户反馈与行为追踪做一体化优化。</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建报价单
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出列表
        </el-button>
      </div>
    </div>

    <div class="statistics-cards">
      <div class="stat-card stat-primary">
        <div class="stat-label">报价单总数</div>
        <div class="stat-value">{{ statistics.total }}</div>
        <div class="stat-desc">客户收入报价全量视图</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已发布 H5</div>
        <div class="stat-value">{{ statistics.published }}</div>
        <div class="stat-desc">审批通过后自动生成专属链接</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">沟通中报价</div>
        <div class="stat-value">{{ statistics.negotiating }}</div>
        <div class="stat-desc">含整单驳回、留言和明细异议</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">即将过期</div>
        <div class="stat-value">{{ statistics.expiring }}</div>
        <div class="stat-desc">需要续期或重新审批发布</div>
      </div>
    </div>

    <div class="search-panel">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="客户名称">
          <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="报价单号">
          <el-input v-model="searchForm.quotationNo" placeholder="请输入报价单号" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="业务类型">
          <el-select v-model="searchForm.businessType" placeholder="请选择" clearable style="width: 150px">
            <el-option label="仓储服务" value="storage" />
            <el-option label="运输服务" value="transport" />
            <el-option label="关务服务" value="customs" />
            <el-option label="综合物流" value="integrated" />
          </el-select>
        </el-form-item>
        <el-form-item label="报价状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 130px">
            <el-option label="草稿" value="draft" />
            <el-option label="审核中" value="pending" />
            <el-option label="审核通过" value="approved" />
            <el-option label="生效" value="active" />
            <el-option label="过期" value="expired" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户动作">
          <el-select v-model="searchForm.responseStatus" placeholder="请选择" clearable style="width: 140px">
            <el-option label="待客户处理" value="pending" />
            <el-option label="已接受报价" value="accepted" />
            <el-option label="已驳回" value="rejected" />
            <el-option label="沟通中" value="negotiating" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
      <el-table :data="pagedData" border stripe @row-click="handleView">
        <el-table-column prop="quotationNo" label="报价单号" min-width="150" />
        <el-table-column prop="customerName" label="客户名称" min-width="190" />
        <el-table-column prop="businessType" label="业务类型" width="120">
          <template #default="{ row }">
            <el-tag effect="plain">{{ getBusinessTypeText(row.businessType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="70" />
        <el-table-column label="报价总额" width="140" align="right">
          <template #default="{ row }">
            {{ row.currency }} {{ getAmount(row).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="expiryDate" label="有效期至" width="120" />
        <el-table-column prop="status" label="报价状态" width="110">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="客户动作" width="120">
          <template #default="{ row }">
            <el-tag :type="getResponseStatusType(row.responseStatus)">{{ getResponseStatusText(row.responseStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="H5 发布" width="110">
          <template #default="{ row }">
            <el-tag :type="row.h5.enabled ? 'success' : 'info'">{{ row.h5.enabled ? '已发布' : '未发布' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="访问/时长" width="150" align="center">
          <template #default="{ row }">
            {{ row.analytics.openCount }} 次 / {{ formatSeconds(row.analytics.totalViewSeconds) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="310" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click.stop="handleView(row)">查看</el-button>
            <el-button type="primary" link size="small" @click.stop="previewH5(row)" :disabled="!row.h5.enabled">H5 预览</el-button>
            <el-button type="primary" link size="small" @click.stop="copyH5Link(row)" :disabled="!row.h5.enabled">复制链接</el-button>
            <el-button type="primary" link size="small" @click.stop="handleEdit(row)">编辑</el-button>
            <el-button type="warning" link size="small" @click.stop="approveAndPublish(row)" :disabled="row.h5.enabled || row.status === 'expired'">审核发布</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>

    <el-drawer v-model="showDetailDrawer" :title="currentQuotation ? `报价单详情 - ${currentQuotation.quotationNo}` : '报价单详情'" size="960px">
      <div v-if="currentQuotation" class="detail-content">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="报价单号">{{ currentQuotation.quotationNo }}</el-descriptions-item>
              <el-descriptions-item label="客户名称">{{ currentQuotation.customerName }}</el-descriptions-item>
              <el-descriptions-item label="业务类型">{{ getBusinessTypeText(currentQuotation.businessType) }}</el-descriptions-item>
              <el-descriptions-item label="当前版本">V{{ currentQuotation.version }}</el-descriptions-item>
              <el-descriptions-item label="有效期">{{ currentQuotation.effectiveDate }} 至 {{ currentQuotation.expiryDate }}</el-descriptions-item>
              <el-descriptions-item label="结算周期">{{ getSettlementCycleText(currentQuotation.settlementCycle) }}</el-descriptions-item>
              <el-descriptions-item label="报价状态">
                <el-tag :type="getStatusType(currentQuotation.status)">{{ getStatusText(currentQuotation.status) }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="客户动作">
                <el-tag :type="getResponseStatusType(currentQuotation.responseStatus)">{{ getResponseStatusText(currentQuotation.responseStatus) }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="整单说明">{{ currentQuotation.quoteDescription }}</el-descriptions-item>
              <el-descriptions-item label="付款方式">{{ currentQuotation.paymentTerms }}</el-descriptions-item>
              <el-descriptions-item label="履约周期">{{ currentQuotation.performanceCycle }}</el-descriptions-item>
              <el-descriptions-item label="售后保障">{{ currentQuotation.afterSales }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <el-tab-pane label="费用明细" name="items">
            <el-table :data="currentQuotation.lineItems" border>
              <el-table-column prop="feeName" label="费用名称" min-width="180" />
              <el-table-column prop="unit" label="费用单位" width="90" />
              <el-table-column prop="quantity" label="数量" width="100" />
              <el-table-column prop="amount" label="报价金额" width="120">
                <template #default="{ row }">
                  {{ currentQuotation.currency }} {{ row.amount }}
                </template>
              </el-table-column>
              <el-table-column label="单项备注" min-width="200" prop="remark" />
              <el-table-column label="客户评论" width="100" align="center">
                <template #default="{ row }">
                  {{ row.comments.length }} 条
                </template>
              </el-table-column>
            </el-table>

            <div class="comment-block" v-for="item in currentQuotation.lineItems" :key="item.id">
              <div class="comment-title">{{ item.feeName }} 的明细沟通</div>
              <el-empty v-if="!item.comments.length" description="暂无明细评论" />
              <div v-else class="comment-list">
                <div v-for="comment in item.comments" :key="comment.id" class="comment-item">
                  <div class="comment-meta">{{ comment.author }} · {{ comment.createdAt }}</div>
                  <div>{{ comment.content }}</div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="H5 发布" name="h5">
            <div class="h5-grid">
              <div class="h5-card brand-card">
                <div class="brand-mark">{{ currentQuotation.h5.branding.logoText }}</div>
                <div>
                  <div class="h5-card-title">品牌展示配置</div>
                  <div class="h5-card-text">{{ currentQuotation.h5.branding.companyName }}</div>
                  <div class="h5-card-text">{{ currentQuotation.h5.branding.contactName }} / {{ currentQuotation.h5.branding.contactPhone }}</div>
                  <div class="h5-card-text">主色 {{ currentQuotation.h5.branding.primaryColor }}，辅色 {{ currentQuotation.h5.branding.secondaryColor }}</div>
                </div>
              </div>
              <div class="h5-card">
                <div class="h5-card-title">正式 H5 链接</div>
                <div class="h5-link">{{ getPublicUrl(currentQuotation.h5.token) }}</div>
                <div class="h5-card-text">生成时间：{{ currentQuotation.h5.generatedAt || '待审批通过后自动生成' }}</div>
                <div class="h5-card-text">访问密码：{{ currentQuotation.h5.passwordEnabled ? currentQuotation.h5.password : '未启用' }}</div>
                <div class="h5-card-actions">
                  <el-button type="primary" plain :disabled="!currentQuotation.h5.enabled" @click="previewH5(currentQuotation)">打开客户页</el-button>
                  <el-button :disabled="!currentQuotation.h5.enabled" @click="copyH5Link(currentQuotation)">复制链接</el-button>
                </div>
              </div>
              <div class="h5-card qr-card">
                <div class="h5-card-title">自动二维码</div>
                <div class="qr-grid">
                  <div
                    v-for="(cell, index) in getQrMatrix(currentQuotation.h5.qrSeed)"
                    :key="index"
                    class="qr-cell"
                    :class="{ filled: cell }"
                  ></div>
                </div>
                <div class="h5-card-text">审批通过后自动生成，无需手工制作二维码。</div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="行为数据" name="analytics">
            <div class="analytics-cards">
              <div class="mini-card">
                <span>打开次数</span>
                <strong>{{ currentQuotation.analytics.openCount }}</strong>
              </div>
              <div class="mini-card">
                <span>查看时长</span>
                <strong>{{ formatSeconds(currentQuotation.analytics.totalViewSeconds) }}</strong>
              </div>
              <div class="mini-card">
                <span>最后查看</span>
                <strong>{{ currentQuotation.analytics.lastViewedAt || '暂无' }}</strong>
              </div>
            </div>
            <el-table :data="currentQuotation.analytics.events" border>
              <el-table-column prop="time" label="时间" width="180" />
              <el-table-column prop="operator" label="操作人" width="120" />
              <el-table-column prop="type" label="行为类型" width="120" />
              <el-table-column prop="detail" label="记录内容" min-width="300" />
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="在线沟通" name="messages">
            <div class="message-list">
              <div v-for="message in currentQuotation.messages" :key="message.id" class="message-item">
                <div class="message-meta">{{ message.author }} · {{ message.createdAt }}</div>
                <div>{{ message.content }}</div>
              </div>
              <el-empty v-if="!currentQuotation.messages.length" description="暂无留言" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="showDetailDrawer = false">关闭</el-button>
          <template v-if="currentQuotation">
            <el-button @click="handleEdit(currentQuotation)">编辑</el-button>
            <el-button type="warning" :disabled="currentQuotation.h5.enabled || currentQuotation.status === 'expired'" @click="approveAndPublish(currentQuotation)">审核通过并发布 H5</el-button>
          </template>
        </div>
      </template>
    </el-drawer>

    <el-dialog v-model="showDialog" :title="isEdit ? '编辑报价单' : '新建报价单'" width="1080px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px">
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="客户" prop="customerId">
              <el-select v-model="formData.customerId" placeholder="请选择客户" style="width: 100%" filterable>
                <el-option v-for="customer in customerDirectory" :key="customer.id" :label="customer.name" :value="customer.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="业务类型" prop="businessType">
              <el-select v-model="formData.businessType" placeholder="请选择" style="width: 100%">
                <el-option label="仓储服务" value="storage" />
                <el-option label="运输服务" value="transport" />
                <el-option label="关务服务" value="customs" />
                <el-option label="综合物流" value="integrated" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="生效日期" prop="effectiveDate">
              <el-date-picker v-model="formData.effectiveDate" value-format="YYYY-MM-DD" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="失效日期" prop="expiryDate">
              <el-date-picker v-model="formData.expiryDate" value-format="YYYY-MM-DD" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="结算周期" prop="settlementCycle">
              <el-select v-model="formData.settlementCycle" style="width: 100%">
                <el-option label="月结" value="monthly" />
                <el-option label="季度结" value="quarterly" />
                <el-option label="年结" value="yearly" />
                <el-option label="预付" value="prepaid" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="币种" prop="currency">
              <el-select v-model="formData.currency" style="width: 100%">
                <el-option label="人民币" value="CNY" />
                <el-option label="美元" value="USD" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="税率" prop="taxRate">
              <el-select v-model="formData.taxRate" style="width: 100%">
                <el-option label="0%" :value="0" />
                <el-option label="3%" :value="3" />
                <el-option label="6%" :value="6" />
                <el-option label="9%" :value="9" />
                <el-option label="13%" :value="13" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">报价说明</el-divider>
        <el-form-item label="整单说明" prop="quoteDescription">
          <el-input v-model="formData.quoteDescription" type="textarea" :rows="2" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="付款方式" prop="paymentTerms">
              <el-input v-model="formData.paymentTerms" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="履约周期" prop="performanceCycle">
              <el-input v-model="formData.performanceCycle" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="售后保障" prop="afterSales">
              <el-input v-model="formData.afterSales" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">H5 品牌与安全</el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="企业名称">
              <el-input v-model="formData.branding.companyName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="LOGO 文案">
              <el-input v-model="formData.branding.logoText" maxlength="3" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="负责人">
              <el-input v-model="formData.branding.contactName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系电话">
              <el-input v-model="formData.branding.contactPhone" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系邮箱">
              <el-input v-model="formData.branding.contactEmail" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="主品牌色">
              <el-input v-model="formData.branding.primaryColor" placeholder="#155EEF" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="辅品牌色">
              <el-input v-model="formData.branding.secondaryColor" placeholder="#7C3AED" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="访问密码">
              <div class="password-row">
                <el-switch v-model="formData.passwordEnabled" />
                <el-input v-model="formData.password" :disabled="!formData.passwordEnabled" placeholder="启用后输入密码" />
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">报价明细</el-divider>
        <div class="editor-toolbar">
          <span>客户端将严格展示费用名称、费用单位、数量、报价金额与单项备注。</span>
          <el-button type="primary" plain @click="addFormLineItem">新增费用项</el-button>
        </div>
        <el-table :data="formData.lineItems" border class="form-table">
          <el-table-column label="费用名称" min-width="180">
            <template #default="{ row }">
              <el-input v-model="row.feeName" />
            </template>
          </el-table-column>
          <el-table-column label="费用单位" width="100">
            <template #default="{ row }">
              <el-input v-model="row.unit" />
            </template>
          </el-table-column>
          <el-table-column label="数量" width="120">
            <template #default="{ row }">
              <el-input-number v-model="row.quantity" :min="0" :precision="0" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column label="报价金额" width="140">
            <template #default="{ row }">
              <el-input-number v-model="row.amount" :min="0" :precision="2" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column label="单项备注" min-width="220">
            <template #default="{ row }">
              <el-input v-model="row.remark" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90">
            <template #default="{ $index }">
              <el-button type="danger" link @click="removeFormLineItem($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button @click="saveQuotation('draft')">保存草稿</el-button>
        <el-button type="primary" @click="saveQuotation('pending')">提交审核</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Download, Plus } from '@element-plus/icons-vue'
import {
  buildQrMatrix,
  businessTypeTextMap,
  customerDirectory,
  getQuotationAmount,
  getQuotationPublicPath,
  publishQuotationH5,
  quotationRecords,
  responseStatusTextMap,
  responseStatusTypeMap,
  settlementCycleTextMap,
  statusTextMap,
  statusTypeMap,
  type QuotationRecord,
  type QuotationStatus
} from '../../mock/quotationH5'

type EditableLineItem = {
  id: number
  feeName: string
  unit: string
  quantity: number
  amount: number
  remark: string
  comments: Array<any>
}

const router = useRouter()
const showDetailDrawer = ref(false)
const showDialog = ref(false)
const isEdit = ref(false)
const activeTab = ref('basic')
const formRef = ref<FormInstance>()
const editingId = ref<number | null>(null)
const selectedId = ref<number | null>(null)

const searchForm = reactive({
  customerName: '',
  quotationNo: '',
  businessType: '',
  status: '',
  responseStatus: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const createEmptyLineItem = (): EditableLineItem => ({
  id: Date.now() + Math.floor(Math.random() * 1000),
  feeName: '',
  unit: '',
  quantity: 0,
  amount: 0,
  remark: '',
  comments: []
})

const createDefaultForm = () => ({
  customerId: null as number | null,
  businessType: '',
  effectiveDate: dayjs().format('YYYY-MM-DD'),
  expiryDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
  settlementCycle: 'monthly',
  currency: 'CNY',
  taxRate: 6,
  quoteDescription: '',
  paymentTerms: '',
  performanceCycle: '',
  afterSales: '',
  passwordEnabled: false,
  password: '',
  branding: {
    companyName: '泓明供应链管理有限公司',
    logoText: 'HM',
    primaryColor: '#155EEF',
    secondaryColor: '#7C3AED',
    contactName: '',
    contactPhone: '',
    contactEmail: ''
  },
  lineItems: [createEmptyLineItem()] as EditableLineItem[]
})

const formData = reactive(createDefaultForm())

const formRules: FormRules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  businessType: [{ required: true, message: '请选择业务类型', trigger: 'change' }],
  effectiveDate: [{ required: true, message: '请选择生效日期', trigger: 'change' }],
  expiryDate: [{ required: true, message: '请选择失效日期', trigger: 'change' }],
  settlementCycle: [{ required: true, message: '请选择结算周期', trigger: 'change' }],
  currency: [{ required: true, message: '请选择币种', trigger: 'change' }],
  taxRate: [{ required: true, message: '请选择税率', trigger: 'change' }],
  quoteDescription: [{ required: true, message: '请输入整单说明', trigger: 'blur' }],
  paymentTerms: [{ required: true, message: '请输入付款方式', trigger: 'blur' }],
  performanceCycle: [{ required: true, message: '请输入履约周期', trigger: 'blur' }],
  afterSales: [{ required: true, message: '请输入售后保障', trigger: 'blur' }]
}

const filteredData = computed(() => {
  return quotationRecords.filter(item => {
    if (searchForm.customerName && !item.customerName.includes(searchForm.customerName)) return false
    if (searchForm.quotationNo && !item.quotationNo.includes(searchForm.quotationNo)) return false
    if (searchForm.businessType && item.businessType !== searchForm.businessType) return false
    if (searchForm.status && item.status !== searchForm.status) return false
    if (searchForm.responseStatus && item.responseStatus !== searchForm.responseStatus) return false
    return true
  })
})

const pagedData = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  return filteredData.value.slice(start, start + pagination.pageSize)
})

const statistics = computed(() => ({
  total: quotationRecords.length,
  published: quotationRecords.filter(item => item.h5.enabled).length,
  negotiating: quotationRecords.filter(item => item.responseStatus === 'negotiating' || item.responseStatus === 'rejected').length,
  expiring: quotationRecords.filter(item => dayjs(item.expiryDate).diff(dayjs(), 'day') >= 0 && dayjs(item.expiryDate).diff(dayjs(), 'day') <= 30).length
}))

const currentQuotation = computed(() => quotationRecords.find(item => item.id === selectedId.value) || null)

const resetForm = () => {
  Object.assign(formData, createDefaultForm())
}

const getBusinessTypeText = (value: string) => businessTypeTextMap[value] || value
const getStatusText = (value: keyof typeof statusTextMap) => statusTextMap[value] || value
const getStatusType = (value: keyof typeof statusTypeMap) => statusTypeMap[value] || 'info'
const getResponseStatusText = (value: keyof typeof responseStatusTextMap) => responseStatusTextMap[value] || value
const getResponseStatusType = (value: keyof typeof responseStatusTypeMap) => responseStatusTypeMap[value] || 'info'
const getSettlementCycleText = (value: string) => settlementCycleTextMap[value] || value
const getAmount = (quotation: QuotationRecord) => getQuotationAmount(quotation)

const formatSeconds = (seconds: number) => {
  if (!seconds) return '0 秒'
  if (seconds < 60) return `${seconds} 秒`
  const minutes = Math.floor(seconds / 60)
  const remain = seconds % 60
  return `${minutes} 分 ${remain} 秒`
}

const getPublicUrl = (token: string) => `${window.location.origin}${getQuotationPublicPath(token)}`
const getQrMatrix = (seed: string) => buildQrMatrix(seed).flat()

const fillForm = (quotation?: QuotationRecord | null) => {
  resetForm()
  if (!quotation) return

  editingId.value = quotation.id
  Object.assign(formData, {
    customerId: quotation.customerId,
    businessType: quotation.businessType,
    effectiveDate: quotation.effectiveDate,
    expiryDate: quotation.expiryDate,
    settlementCycle: quotation.settlementCycle,
    currency: quotation.currency,
    taxRate: quotation.taxRate,
    quoteDescription: quotation.quoteDescription,
    paymentTerms: quotation.paymentTerms,
    performanceCycle: quotation.performanceCycle,
    afterSales: quotation.afterSales,
    passwordEnabled: quotation.h5.passwordEnabled,
    password: quotation.h5.password,
    branding: { ...quotation.h5.branding },
    lineItems: quotation.lineItems.map(item => ({ ...item, comments: [...item.comments] }))
  })
}

const handleSearch = () => {
  pagination.page = 1
}

const handleReset = () => {
  searchForm.customerName = ''
  searchForm.quotationNo = ''
  searchForm.businessType = ''
  searchForm.status = ''
  searchForm.responseStatus = ''
  pagination.page = 1
}

const handleCreate = () => {
  isEdit.value = false
  editingId.value = null
  resetForm()
  showDialog.value = true
}

const handleView = (row: QuotationRecord) => {
  selectedId.value = row.id
  activeTab.value = 'basic'
  showDetailDrawer.value = true
}

const handleEdit = (row: QuotationRecord | null) => {
  if (!row) return
  isEdit.value = true
  fillForm(row)
  showDetailDrawer.value = false
  showDialog.value = true
}

const previewH5 = (row: QuotationRecord) => {
  const href = router.resolve({ path: getQuotationPublicPath(row.h5.token) }).href
  window.open(href, '_blank')
}

const copyH5Link = async (row: QuotationRecord) => {
  const link = getPublicUrl(row.h5.token)
  try {
    await navigator.clipboard.writeText(link)
    ElMessage.success('H5 链接已复制')
  }
  catch {
    ElMessage.error(`复制失败，请手动复制：${link}`)
  }
}

const approveAndPublish = (row: QuotationRecord) => {
  if (row.h5.enabled || row.status === 'expired') return
  publishQuotationH5(row, '审批中心')
  ElMessage.success(`已审核通过并自动生成 H5：${row.quotationNo}`)
}

const addFormLineItem = () => {
  formData.lineItems.push(createEmptyLineItem())
}

const removeFormLineItem = (index: number) => {
  if (formData.lineItems.length === 1) {
    ElMessage.warning('至少保留一条费用明细')
    return
  }
  formData.lineItems.splice(index, 1)
}

const saveQuotation = async (status: QuotationStatus) => {
  if (!formRef.value) return
  await formRef.value.validate(valid => {
    if (!valid) return

    if (!formData.lineItems.every(item => item.feeName && item.unit)) {
      ElMessage.warning('请补全费用明细名称与单位')
      return
    }

    const customer = customerDirectory.find(item => item.id === formData.customerId)
    if (!customer) return

    if (editingId.value) {
      const target = quotationRecords.find(item => item.id === editingId.value)
      if (!target) return

      target.customerId = customer.id
      target.customerCode = customer.code
      target.customerName = customer.name
      target.businessType = formData.businessType
      target.effectiveDate = formData.effectiveDate
      target.expiryDate = formData.expiryDate
      target.settlementCycle = formData.settlementCycle
      target.currency = formData.currency
      target.taxRate = formData.taxRate
      target.quoteDescription = formData.quoteDescription
      target.paymentTerms = formData.paymentTerms
      target.performanceCycle = formData.performanceCycle
      target.afterSales = formData.afterSales
      target.status = status
      target.lineItems = formData.lineItems.map(item => ({ ...item, comments: item.comments || [] }))
      target.h5.passwordEnabled = formData.passwordEnabled
      target.h5.password = formData.password
      target.h5.branding = { ...formData.branding }
      target.logs.unshift({
        id: Date.now(),
        time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        operator: '当前用户',
        type: '更新',
        detail: status === 'pending' ? '更新报价单并重新提交审核' : '更新报价单并保存草稿'
      })
    }
    else {
      const nextIndex = quotationRecords.length + 1
      const quotationNo = `QT${dayjs().format('YYYYMMDD')}${String(nextIndex).padStart(4, '0')}`
      quotationRecords.unshift({
        id: Date.now(),
        quotationNo,
        customerId: customer.id,
        customerCode: customer.code,
        customerName: customer.name,
        businessType: formData.businessType,
        version: 1,
        effectiveDate: formData.effectiveDate,
        expiryDate: formData.expiryDate,
        currency: formData.currency,
        taxRate: formData.taxRate,
        settlementCycle: formData.settlementCycle,
        status,
        createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        creator: '当前用户',
        reviewer: null,
        quoteDescription: formData.quoteDescription,
        paymentTerms: formData.paymentTerms,
        performanceCycle: formData.performanceCycle,
        afterSales: formData.afterSales,
        responseStatus: 'pending',
        responseReason: '',
        lineItems: formData.lineItems.map(item => ({ ...item, comments: [] })),
        messages: [],
        logs: [{ id: Date.now() + 1, time: dayjs().format('YYYY-MM-DD HH:mm:ss'), operator: '当前用户', type: '创建', detail: status === 'pending' ? '创建报价单并提交审核' : '创建报价单草稿' }],
        h5: {
          token: `${quotationNo.toLowerCase()}-v1`,
          enabled: false,
          generatedAt: '',
          passwordEnabled: formData.passwordEnabled,
          password: formData.password,
          qrSeed: `${quotationNo}|1|${customer.code}`,
          branding: { ...formData.branding }
        },
        analytics: {
          openCount: 0,
          totalViewSeconds: 0,
          lastViewedAt: '',
          events: []
        }
      })
    }

    showDialog.value = false
    ElMessage.success(status === 'pending' ? '报价单已提交审核' : '报价单草稿已保存')
  })
}

const handleExport = () => {
  ElMessage.success('当前示例已完成前端优化，列表导出接口可继续接后端实现')
}
</script>

<style scoped>
.quotation-customer-container {
  min-height: 100%;
  background: linear-gradient(180deg, #f4f7fb 0%, #eef3f8 100%);
  padding: 20px;
}

.action-header,
.search-panel,
.table-container {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
}

.action-header {
  padding: 24px 28px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.page-title {
  font-size: 22px;
  line-height: 1.2;
  font-weight: 700;
  color: #0f172a;
}

.page-subtitle {
  margin: 8px 0 0;
  color: #64748b;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.statistics-cards {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  border-radius: 24px;
  padding: 22px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.stat-primary {
  background: linear-gradient(135deg, #155eef, #7c3aed);
  color: #fff;
}

.stat-label {
  font-size: 13px;
  color: inherit;
  opacity: 0.82;
}

.stat-value {
  margin-top: 12px;
  font-size: 34px;
  font-weight: 700;
  color: inherit;
}

.stat-desc {
  margin-top: 8px;
  color: inherit;
  opacity: 0.72;
  line-height: 1.5;
}

.search-panel {
  margin-top: 18px;
  padding: 20px 24px 4px;
}

.table-container {
  margin-top: 18px;
  padding: 20px 24px;
}

.pagination-container {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}

.detail-content {
  padding-right: 10px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.comment-block {
  margin-top: 18px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
}

.comment-title,
.h5-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 12px;
}

.comment-list,
.message-list {
  display: grid;
  gap: 12px;
}

.comment-item,
.message-item {
  border-radius: 14px;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
}

.comment-meta,
.message-meta,
.h5-card-text {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 6px;
}

.h5-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.h5-card {
  min-height: 220px;
  border-radius: 20px;
  padding: 18px;
  border: 1px solid #dbe5f1;
  background: linear-gradient(180deg, #ffffff, #f8fbff);
}

.brand-card {
  background: linear-gradient(160deg, #eff6ff, #f5f3ff);
}

.brand-mark {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: linear-gradient(135deg, #155eef, #7c3aed);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
}

.h5-link {
  margin-bottom: 12px;
  word-break: break-all;
  color: #155eef;
}

.h5-card-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

.qr-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.qr-grid {
  display: grid;
  grid-template-columns: repeat(13, 10px);
  gap: 3px;
  padding: 14px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #dbe5f1;
  margin-bottom: 14px;
}

.qr-cell {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: #e2e8f0;
}

.qr-cell.filled {
  background: #0f172a;
}

.analytics-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.mini-card {
  border-radius: 16px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.mini-card span {
  display: block;
  color: #64748b;
  margin-bottom: 8px;
}

.mini-card strong {
  color: #0f172a;
  font-size: 20px;
}

.password-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  width: 100%;
  align-items: center;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  color: #64748b;
}

.form-table {
  margin-bottom: 8px;
}

@media (max-width: 1200px) {
  .statistics-cards,
  .h5-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .quotation-customer-container {
    padding: 14px;
  }

  .action-header,
  .editor-toolbar,
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .statistics-cards,
  .h5-grid,
  .analytics-cards {
    grid-template-columns: 1fr;
  }

  .h5-card-actions,
  .header-actions {
    flex-direction: column;
  }
}
</style>
