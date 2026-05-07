<template>
  <div class="prepayment-container">
    <!-- 搜索筛选区域 -->
    <div class="search-panel">
      <el-form :model="searchForm" :inline="true" label-width="100px">
        <el-form-item label="供应商">
          <el-select
            v-model="searchForm.supplierId"
            placeholder="请选择供应商"
            clearable
            filterable
            style="width: 280px"
          >
            <el-option
              v-for="supplier in supplierList"
              :key="supplier.id"
              :label="`${supplier.code} - ${supplier.name}`"
              :value="supplier.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预付款状态">
          <el-select v-model="searchForm.prepaymentStatus" placeholder="请选择" clearable style="width: 180px">
            <el-option label="草稿" value="draft" />
            <el-option label="待审核" value="pending" />
            <el-option label="待付款" value="approved" />
            <el-option label="待关联发票" value="invoiced" />
            <el-option label="待核销" value="partial_writeoff" />
            <el-option label="部分核销" value="partial" />
            <el-option label="已核销" value="written_off" />
          </el-select>
        </el-form-item>
        <el-form-item label="发票状态">
          <el-select v-model="searchForm.invoiceStatus" placeholder="请选择" clearable style="width: 150px">
            <el-option label="未绑定" value="unbinded" />
            <el-option label="部分绑定" value="partial" />
            <el-option label="已全额" value="binded" />
          </el-select>
        </el-form-item>
        <el-form-item label="核销状态">
          <el-select v-model="searchForm.writeoffStatus" placeholder="请选择" clearable style="width: 150px">
            <el-option label="未核销" value="unwritten_off" />
            <el-option label="部分核销" value="partial" />
            <el-option label="已全额" value="written_off" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="申请人">
          <el-input v-model="searchForm.applicant" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新增预付款
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出
      </el-button>
      <el-button type="warning" @click="handleBatchAudit" :disabled="selectedRows.length === 0">
        <el-icon><Check /></el-icon>
        批量审核
      </el-button>
      <el-button type="info" @click="handleAgingAnalysis">
        <el-icon><DataAnalysis /></el-icon>
        账龄分析
      </el-button>
    </div>

    <!-- 预警提示区域 -->
    <div class="alert-panel" v-if="alerts.length > 0">
      <el-alert
        v-for="(alert, index) in alerts"
        :key="index"
        :title="alert.title"
        :type="alert.type"
        :description="alert.description"
        show-icon
        :closable="true"
        @close="handleCloseAlert(index)"
      />
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        :row-class-name="getRowClassName"
      >
        <el-table-column type="selection" width="55" fixed />
        <el-table-column prop="prepaymentNo" label="预付款单号" min-width="160" sortable fixed />
        <el-table-column prop="supplierName" label="供应商名称" min-width="180" fixed>
          <template #default="scope">
            <el-link type="primary" @click.stop="handleViewSupplier(scope.row.supplierId)">
              {{ scope.row.supplierName }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="paymentReason" label="付款事由" min-width="200" show-overflow-tooltip />
        <el-table-column prop="businessType" label="业务类型" width="100">
          <template #default="scope">
            <el-tag size="small">{{ getBusinessTypeLabel(scope.row.businessType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="prepaymentAmount" label="预付金额" width="140" align="right" sortable>
          <template #default="scope">¥{{ formatMoney(scope.row.prepaymentAmount) }}</template>
        </el-table-column>
        <el-table-column prop="paidAmount" label="已付金额" width="140" align="right" sortable>
          <template #default="scope">¥{{ formatMoney(scope.row.paidAmount) }}</template>
        </el-table-column>
        <el-table-column prop="invoicedAmount" label="已绑定发票" width="130" align="right">
          <template #default="scope">
            <span :class="scope.row.invoicedAmount >= scope.row.prepaymentAmount ? 'text-success' : 'text-warning'">
              ¥{{ formatMoney(scope.row.invoicedAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="writtenOffAmount" label="已核销金额" width="130" align="right">
          <template #default="scope">¥{{ formatMoney(scope.row.writtenOffAmount) }}</template>
        </el-table-column>
        <el-table-column prop="balanceAmount" label="可用余额" width="130" align="right" sortable>
          <template #default="scope">
            <span :class="scope.row.balanceAmount > 0 ? 'text-primary' : 'text-success'">
              ¥{{ formatMoney(scope.row.balanceAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="overdueDays" label="账龄" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.overdueDays > 0" type="danger" size="small">
              逾期{{ scope.row.overdueDays }}天
            </el-tag>
            <span v-else-if="scope.row.balanceAmount > 0" class="text-info">
              {{ scope.row.agingDays || 0 }}天
            </span>
            <span v-else class="text-success">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="prepaymentStatus" label="预付款状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusConfig(scope.row.prepaymentStatus).type" size="small">
              {{ getStatusConfig(scope.row.prepaymentStatus).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="invoiceStatus" label="发票状态" width="100">
          <template #default="scope">
            <el-tag :type="getInvoiceStatusType(scope.row)" size="small">
              {{ getInvoiceStatusText(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="writeoffStatus" label="核销状态" width="100">
          <template #default="scope">
            <el-tag :type="getWriteoffStatusType(scope.row)" size="small">
              {{ getWriteoffStatusText(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyDate" label="申请日期" width="120" />
        <el-table-column prop="expectedPaymentDate" label="预计付款日" width="120">
          <template #default="scope">
            <span :class="isExpectedOverdue(scope.row) ? 'text-danger' : ''">
              {{ scope.row.expectedPaymentDate }}
              <el-icon v-if="isExpectedOverdue(scope.row)" color="#f56c6c"><WarningFilled /></el-icon>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentDate" label="实际付款日" width="120" />
        <el-table-column prop="applicant" label="申请人" width="100" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" link @click.stop="handleView(scope.row)">查看</el-button>
            <el-button type="success" size="small" link @click.stop="handleEdit(scope.row)" :disabled="!canEdit(scope.row)">编辑</el-button>
            <el-button type="warning" size="small" link @click.stop="handleSubmit(scope.row)" :disabled="!canSubmit(scope.row)">提交</el-button>
            <el-dropdown trigger="hover" @command="(command: string) => handleMoreAction(command, scope.row)">
              <span class="more-dropdown-link">
                <el-button type="info" size="small" link>更多<el-icon><ArrowDown /></el-icon></el-button>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="cancel" :disabled="!canCancel(scope.row)">作废</el-dropdown-item>
                  <el-dropdown-item command="audit" :disabled="!canAudit(scope.row)">审核</el-dropdown-item>
                  <el-dropdown-item command="payment" :disabled="!canPayment(scope.row)">付款登记</el-dropdown-item>
                  <el-dropdown-item command="bindInvoice" :disabled="!canBindInvoice(scope.row)">绑定发票</el-dropdown-item>
                  <el-dropdown-item command="writeoff" :disabled="!canWriteoff(scope.row)">核销</el-dropdown-item>
                  <el-dropdown-item command="autoWriteoff" :disabled="!canAutoWriteoff(scope.row)">自动核销</el-dropdown-item>
                  <el-dropdown-item command="transfer" :disabled="!canTransfer(scope.row)">余款转应付</el-dropdown-item>
                  <el-dropdown-item command="print">打印</el-dropdown-item>
                  <el-dropdown-item command="log">操作日志</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
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

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="showDetail"
      :title="`预付款单详情 - ${currentRow?.prepaymentNo || ''}`"
      size="900px"
      :before-close="handleCloseDetail"
    >
      <template #default>
        <prepayment-detail v-if="currentRow" :prepayment-id="currentRow.id" />
      </template>
    </el-drawer>

    <!-- 绑定发票弹窗 -->
    <el-dialog
      v-model="showBindInvoice"
      title="绑定发票"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="bind-invoice-form">
        <el-form :model="bindInvoiceForm" label-width="120px">
          <el-form-item label="可用余额">
            <span class="text-primary">¥{{ formatMoney(bindInvoiceForm.availableAmount) }}</span>
          </el-form-item>
          <el-form-item label="选择发票" required>
            <el-select
              v-model="bindInvoiceForm.selectedInvoices"
              multiple
              filterable
              placeholder="请选择要绑定的发票"
              style="width: 100%"
              @change="handleInvoiceSelectChange"
            >
              <el-option
                v-for="invoice in availableInvoices"
                :key="invoice.id"
                :label="`${invoice.invoiceNo} - ${invoice.supplierName} - ¥${formatMoney(invoice.invoiceAmount)}`"
                :value="invoice.id"
              >
                <div class="invoice-option">
                  <span class="invoice-no">{{ invoice.invoiceNo }}</span>
                  <span class="invoice-supplier">{{ invoice.supplierName }}</span>
                  <span class="invoice-amount">¥{{ formatMoney(invoice.invoiceAmount) }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="绑定金额">
            <el-input-number
              v-model="bindInvoiceForm.bindAmount"
              :min="0"
              :max="bindInvoiceForm.availableAmount"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="bindInvoiceForm.remark" type="textarea" :rows="3" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showBindInvoice = false">取消</el-button>
        <el-button type="primary" @click="confirmBindInvoice" :loading="bindLoading">确认绑定</el-button>
      </template>
    </el-dialog>

    <!-- 核销弹窗 -->
    <el-dialog
      v-model="showWriteoff"
      title="预付款核销"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="writeoff-form">
        <el-form :model="writeoffForm" label-width="120px">
          <el-form-item label="可用余额">
            <span class="text-primary">¥{{ formatMoney(writeoffForm.availableBalance) }}</span>
          </el-form-item>
          <el-form-item label="核销方式" required>
            <el-radio-group v-model="writeoffForm.writeoffType">
              <el-radio label="order">按订单核销</el-radio>
              <el-radio label="amount">按金额核销</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="writeoffForm.writeoffType === 'order'" label="选择订单" required>
            <el-select
              v-model="writeoffForm.selectedOrders"
              multiple
              filterable
              placeholder="请选择要核销的订单"
              style="width: 100%"
            >
              <el-option
                v-for="order in availableOrders"
                :key="order.id"
                :label="`${order.orderNo} - ¥${formatMoney(order.amount)}`"
                :value="order.id"
              >
                <div class="order-option">
                  <span>{{ order.orderNo }}</span>
                  <span class="text-muted">¥{{ formatMoney(order.amount) }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="writeoffForm.writeoffType === 'amount'" label="核销金额" required>
            <el-input-number
              v-model="writeoffForm.writeoffAmount"
              :min="0"
              :max="writeoffForm.availableBalance"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="核销说明">
            <el-input v-model="writeoffForm.remark" type="textarea" :rows="3" placeholder="请输入核销说明" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showWriteoff = false">取消</el-button>
        <el-button type="primary" @click="confirmWriteoff" :loading="writeoffLoading">确认核销</el-button>
      </template>
    </el-dialog>

    <!-- 账龄分析弹窗 -->
    <el-dialog
      v-model="showAgingAnalysis"
      title="预付款账龄分析"
      width="900px"
    >
      <div class="aging-analysis">
        <el-row :gutter="20" class="aging-stats">
          <el-col :span="6">
            <div class="aging-stat-item">
              <div class="aging-label">30天内</div>
              <div class="aging-value text-success">¥{{ formatMoney(agingData.within30Days) }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="aging-stat-item">
              <div class="aging-label">31-60天</div>
              <div class="aging-value text-warning">¥{{ formatMoney(agingData.days31to60) }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="aging-stat-item">
              <div class="aging-label">61-90天</div>
              <div class="aging-value text-danger">¥{{ formatMoney(agingData.days61to90) }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="aging-stat-item">
              <div class="aging-label">90天以上</div>
              <div class="aging-value text-info">¥{{ formatMoney(agingData.over90Days) }}</div>
            </div>
          </el-col>
        </el-row>
        <el-table :data="agingTableData" border style="margin-top: 20px">
          <el-table-column prop="supplierName" label="供应商" min-width="150" />
          <el-table-column prop="prepaymentNo" label="预付款单号" min-width="150" />
          <el-table-column prop="balanceAmount" label="可用余额" width="130" align="right">
            <template #default="scope">¥{{ formatMoney(scope.row.balanceAmount) }}</template>
          </el-table-column>
          <el-table-column prop="agingDays" label="账龄(天)" width="100" />
          <el-table-column prop="agingLevel" label="账龄区间" width="120">
            <template #default="scope">
              <el-tag :type="getAgingTagType(scope.row.agingLevel)" size="small">
                {{ scope.row.agingLevel }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="riskLevel" label="风险等级" width="100">
            <template #default="scope">
              <el-tag :type="getRiskTagType(scope.row.riskLevel)" size="small">
                {{ scope.row.riskLevel }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 批量审核弹窗 -->
    <el-dialog
      v-model="showBatchAudit"
      title="批量审核"
      width="600px"
    >
      <div class="batch-audit-form">
        <el-form :model="batchAuditForm" label-width="100px">
          <el-form-item label="选中记录">
            {{ selectedRows.length }} 条预付款单
          </el-form-item>
          <el-form-item label="审核操作" required>
            <el-radio-group v-model="batchAuditForm.action">
              <el-radio label="approve">全部通过</el-radio>
              <el-radio label="reject">全部驳回</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="batchAuditForm.action === 'reject'" label="驳回原因" required>
            <el-input v-model="batchAuditForm.rejectReason" type="textarea" :rows="3" placeholder="请输入驳回原因" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="batchAuditForm.remark" type="textarea" :rows="2" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showBatchAudit = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchAudit" :loading="batchAuditLoading">确认</el-button>
      </template>
    </el-dialog>

    <!-- 付款登记弹窗 -->
    <el-dialog
      v-model="showPayment"
      title="付款登记"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="payment-form">
        <el-form :model="paymentForm" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="预付款单号">
                {{ paymentForm.prepaymentNo }}
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="供应商">
                {{ paymentForm.supplierName }}
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="预付金额">
                <span class="text-primary">¥{{ formatMoney(paymentForm.prepaymentAmount) }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="可用余额">
                <span class="text-warning">¥{{ formatMoney(paymentForm.balanceAmount) }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-divider />
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="本次付款金额" required>
                <el-input-number
                  v-model="paymentForm.paymentAmount"
                  :min="0"
                  :max="paymentForm.balanceAmount"
                  :precision="2"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="付款日期" required>
                <el-date-picker
                  v-model="paymentForm.paymentDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="付款方式" required>
                <el-select v-model="paymentForm.paymentMethod" placeholder="请选择" style="width: 100%">
                  <el-option label="银行转账" value="bank_transfer" />
                  <el-option label="承兑汇票" value="acceptance" />
                  <el-option label="现金" value="cash" />
                  <el-option label="支票" value="cheque" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="银行账户" required>
                <el-select v-model="paymentForm.bankAccountId" placeholder="请选择" style="width: 100%">
                  <el-option
                    v-for="bank in bankAccounts"
                    :key="bank.id"
                    :label="`${bank.bankName} ${bank.accountNo}`"
                    :value="bank.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="交易流水号">
                <el-input v-model="paymentForm.transactionNo" placeholder="请输入交易流水号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="实际付款金额">
                <el-input-number
                  v-model="paymentForm.actualAmount"
                  :min="0"
                  :precision="2"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="备注">
            <el-input v-model="paymentForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
          </el-form-item>
          <el-form-item label="附件上传">
            <el-upload
              action="#"
              :auto-upload="false"
              :file-list="paymentForm.fileList"
              :on-change="handlePaymentFileChange"
              :on-remove="handlePaymentFileRemove"
              accept=".jpg,.png,.pdf"
              multiple
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <template #tip>
                <div class="el-upload__tip">支持JPG、PNG、PDF格式，单文件不超过10MB</div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showPayment = false">取消</el-button>
        <el-button type="primary" @click="confirmPayment" :loading="paymentLoading">确认付款</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Download, Check, DataAnalysis, WarningFilled, ArrowDown } from '@element-plus/icons-vue'
import PrepaymentDetail from './PrepaymentDetail.vue'

const router = useRouter()
const loading = ref(false)
const selectedRows = ref<any[]>([])
const showDetail = ref(false)
const currentRow = ref<any>(null)
const showBindInvoice = ref(false)
const showWriteoff = ref(false)
const showAgingAnalysis = ref(false)
const showBatchAudit = ref(false)
const showPayment = ref(false)
const bindLoading = ref(false)
const writeoffLoading = ref(false)
const batchAuditLoading = ref(false)
const paymentLoading = ref(false)

// 搜索表单
const searchForm = reactive({
  supplierId: null as number | null,
  prepaymentStatus: '',
  invoiceStatus: '',
  writeoffStatus: '',
  dateRange: [] as string[],
  applicant: ''
})

// 供应商列表
const supplierList = ref([
  { id: 1, code: 'SUP001', name: '深圳硬件供应商A公司' },
  { id: 2, code: 'SUP002', name: '北京云服务B公司' },
  { id: 3, code: 'SUP003', name: '上海软件C公司' },
  { id: 4, code: 'SUP004', name: '广州物流D公司' },
  { id: 5, code: 'SUP005', name: '杭州装修E公司' }
])

// 分页信息
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 统计数据
const stats = reactive({
  pendingCount: 3,
  pendingAmount: 156000.00,
  approvedCount: 2,
  approvedAmount: 98000.00,
  waitWriteoffCount: 5,
  waitWriteoffAmount: 286000.00,
  writtenOffCount: 10,
  writtenOffAmount: 568000.00,
  overdueCount: 2,
  overdueAmount: 86000.00,
  totalCount: 25,
  totalAmount: 1208000.00
})

// 预警信息
const alerts = ref([
  {
    title: '预付款逾期提醒',
    type: 'warning',
    description: '有2笔预付款已逾期90天以上，请及时处理'
  },
  {
    title: '发票缺失提醒',
    type: 'info',
    description: '有3笔已付款预付款尚未绑定发票'
  }
])

// 表格数据
const tableData = ref([
  {
    id: 1,
    prepaymentNo: 'YF2024040001',
    supplierId: 1,
    supplierName: '深圳硬件供应商A公司',
    paymentReason: '服务器采购预付款30%',
    businessType: 'purchase',
    prepaymentAmount: 100000.00,
    paidAmount: 100000.00,
    invoicedAmount: 100000.00,
    writtenOffAmount: 60000.00,
    balanceAmount: 40000.00,
    prepaymentStatus: 'invoiced',
    invoiceStatus: 'binded',
    writeoffStatus: 'partial',
    applyDate: '2024-02-01',
    expectedPaymentDate: '2024-02-05',
    paymentDate: '2024-02-04',
    agingDays: 45,
    overdueDays: 0,
    applicant: '张三'
  },
  {
    id: 2,
    prepaymentNo: 'YF2024040002',
    supplierId: 2,
    supplierName: '北京云服务B公司',
    paymentReason: '2024年Q1云服务费预付款',
    businessType: 'service',
    prepaymentAmount: 56000.00,
    paidAmount: 56000.00,
    invoicedAmount: 0.00,
    writtenOffAmount: 0.00,
    balanceAmount: 56000.00,
    prepaymentStatus: 'paid',
    invoiceStatus: 'unbinded',
    writeoffStatus: 'unwritten_off',
    applyDate: '2024-02-10',
    expectedPaymentDate: '2024-02-15',
    paymentDate: '2024-02-14',
    agingDays: 30,
    overdueDays: 15,
    applicant: '李四'
  },
  {
    id: 3,
    prepaymentNo: 'YF2024040003',
    supplierId: 3,
    supplierName: '上海软件C公司',
    paymentReason: '系统定制开发预付款',
    businessType: 'service',
    prepaymentAmount: 80000.00,
    paidAmount: 0.00,
    invoicedAmount: 0.00,
    writtenOffAmount: 0.00,
    balanceAmount: 80000.00,
    prepaymentStatus: 'approved',
    invoiceStatus: 'unbinded',
    writeoffStatus: 'unwritten_off',
    applyDate: '2024-03-05',
    expectedPaymentDate: '2024-03-10',
    paymentDate: '',
    agingDays: 12,
    overdueDays: 0,
    applicant: '王五'
  },
  {
    id: 4,
    prepaymentNo: 'YF2024040004',
    supplierId: 4,
    supplierName: '广州物流D公司',
    paymentReason: 'Q2物流服务费预付款',
    businessType: 'service',
    prepaymentAmount: 76000.00,
    paidAmount: 0.00,
    invoicedAmount: 0.00,
    writtenOffAmount: 0.00,
    balanceAmount: 76000.00,
    prepaymentStatus: 'pending',
    invoiceStatus: 'unbinded',
    writeoffStatus: 'unwritten_off',
    applyDate: '2024-03-10',
    expectedPaymentDate: '2024-03-20',
    paymentDate: '',
    agingDays: 7,
    overdueDays: 0,
    applicant: '赵六'
  },
  {
    id: 5,
    prepaymentNo: 'YF2024040005',
    supplierId: 5,
    supplierName: '杭州装修E公司',
    paymentReason: '办公室装修预付款（保证金）',
    businessType: 'deposit',
    prepaymentAmount: 200000.00,
    paidAmount: 200000.00,
    invoicedAmount: 200000.00,
    writtenOffAmount: 200000.00,
    balanceAmount: 0.00,
    prepaymentStatus: 'written_off',
    invoiceStatus: 'binded',
    writeoffStatus: 'written_off',
    applyDate: '2024-01-15',
    expectedPaymentDate: '2024-01-20',
    paymentDate: '2024-01-18',
    agingDays: 0,
    overdueDays: 0,
    applicant: '孙七'
  }
])

pagination.total = tableData.value.length

// 绑定发票表单
const bindInvoiceForm = reactive({
  prepaymentId: null as number | null,
  availableAmount: 0,
  selectedInvoices: [] as number[],
  bindAmount: 0,
  remark: ''
})

// 可选发票列表
const availableInvoices = ref([
  { id: 1, invoiceNo: 'FP2024040001', supplierName: '深圳硬件供应商A公司', invoiceAmount: 50000.00 },
  { id: 2, invoiceNo: 'FP2024040002', supplierName: '北京云服务B公司', invoiceAmount: 30000.00 },
  { id: 3, invoiceNo: 'FP2024040003', supplierName: '上海软件C公司', invoiceAmount: 20000.00 },
  { id: 4, invoiceNo: 'FP2024040004', supplierName: '广州物流D公司', invoiceAmount: 45000.00 },
  { id: 5, invoiceNo: 'FP2024040005', supplierName: '杭州装修E公司', invoiceAmount: 35000.00 }
])

// 核销表单
const writeoffForm = reactive({
  prepaymentId: null as number | null,
  availableBalance: 0,
  writeoffType: 'order',
  selectedOrders: [] as number[],
  writeoffAmount: 0,
  remark: ''
})

// 可选订单列表
const availableOrders = ref([
  { id: 1, orderNo: 'PO2024030001', amount: 30000.00 },
  { id: 2, orderNo: 'PO2024030002', amount: 25000.00 },
  { id: 3, orderNo: 'PO2024030003', amount: 15000.00 }
])

// 账龄分析数据
const agingData = reactive({
  within30Days: 156000.00,
  days31to60: 80000.00,
  days61to90: 56000.00,
  over90Days: 86000.00
})

const agingTableData = ref([
  { supplierName: '北京云服务B公司', prepaymentNo: 'YF2024040002', balanceAmount: 56000.00, agingDays: 45, agingLevel: '31-60天', riskLevel: '中' },
  { supplierName: '广州物流D公司', prepaymentNo: 'YF2024040004', balanceAmount: 76000.00, agingDays: 75, agingLevel: '61-90天', riskLevel: '高' }
])

// 批量审核表单
const batchAuditForm = reactive({
  action: 'approve',
  rejectReason: '',
  remark: ''
})

// 付款登记表单
const paymentForm = reactive({
  prepaymentId: null as number | null,
  prepaymentNo: '',
  supplierName: '',
  prepaymentAmount: 0,
  balanceAmount: 0,
  paymentAmount: 0,
  paymentDate: '',
  paymentMethod: '',
  bankAccountId: null as number | null,
  transactionNo: '',
  actualAmount: 0,
  remark: '',
  fileList: [] as any[]
})

// 银行账户列表
const bankAccounts = ref([
  { id: 1, bankName: '中国工商银行', accountNo: '6222081234567890' },
  { id: 2, bankName: '中国建设银行', accountNo: '6217001234567890' },
  { id: 3, bankName: '中国农业银行', accountNo: '6228481234567890' },
  { id: 4, bankName: '招商银行', accountNo: '6214831234567890' }
])

// 格式化金额
const formatMoney = (value: number) => {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

// 获取业务类型标签
const getBusinessTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    'purchase': '采购类',
    'service': '服务类',
    'deposit': '保证金类'
  }
  return map[type] || type
}

// 获取状态配置
const getStatusConfig = (status: string) => {
  const config: Record<string, { label: string, type: string }> = {
    'draft': { label: '草稿', type: 'info' },
    'pending': { label: '待审核', type: 'warning' },
    'approved': { label: '已审核', type: 'primary' },
    'paid': { label: '已付款', type: 'success' },
    'invoiced': { label: '已开票', type: 'success' },
    'written_off': { label: '已核销', type: 'success' },
    'partial_writeoff': { label: '部分核销', type: 'warning' },
    'rejected': { label: '已驳回', type: 'danger' },
    'cancelled': { label: '已作废', type: 'info' }
  }
  return config[status] || { label: status, type: 'info' }
}

// 获取发票状态类型
const getInvoiceStatusType = (row: any) => {
  if (row.invoicedAmount === 0) return 'info'
  if (row.invoicedAmount >= row.prepaymentAmount) return 'success'
  return 'warning'
}

// 获取发票状态文本
const getInvoiceStatusText = (row: any) => {
  if (row.invoicedAmount === 0) return '未绑定'
  if (row.invoicedAmount >= row.prepaymentAmount) return '已全额'
  return '部分'
}

// 获取核销状态类型
const getWriteoffStatusType = (row: any) => {
  if (row.writtenOffAmount === 0) return 'info'
  if (row.writtenOffAmount >= row.paidAmount) return 'success'
  return 'warning'
}

// 获取核销状态文本
const getWriteoffStatusText = (row: any) => {
  if (row.writtenOffAmount === 0) return '未核销'
  if (row.writtenOffAmount >= row.paidAmount) return '已全额'
  return '部分'
}

// 获取账龄标签类型
const getAgingTagType = (level: string) => {
  const map: Record<string, string> = {
    '30天内': 'success',
    '31-60天': 'warning',
    '61-90天': 'danger',
    '90天以上': 'danger'
  }
  return map[level] || 'info'
}

// 获取风险等级标签类型
const getRiskTagType = (level: string) => {
  const map: Record<string, string> = {
    '低': 'success',
    '中': 'warning',
    '高': 'danger'
  }
  return map[level] || 'info'
}

// 是否预期逾期
const isExpectedOverdue = (row: any) => {
  if (!row.expectedPaymentDate || row.paymentDate) return false
  const expected = new Date(row.expectedPaymentDate)
  const now = new Date()
  return now > expected
}

// 获取行样式
const getRowClassName = ({ row }: any) => {
  if (row.overdueDays > 90) return 'row-danger'
  if (row.overdueDays > 0) return 'row-warning'
  return ''
}

// 操作权限判断
const canEdit = (row: any) => ['draft', 'rejected'].includes(row.prepaymentStatus)
const canSubmit = (row: any) => row.prepaymentStatus === 'draft'
const canCancel = (row: any) => ['pending'].includes(row.prepaymentStatus)
const canAudit = (row: any) => row.prepaymentStatus === 'pending'
const canPayment = (row: any) => row.prepaymentStatus === 'approved'
const canBindInvoice = (row: any) => ['paid', 'invoiced'].includes(row.prepaymentStatus) && row.balanceAmount > 0
const canWriteoff = (row: any) => row.prepaymentStatus === 'invoiced' && row.balanceAmount > 0
const canAutoWriteoff = (row: any) => row.prepaymentStatus === 'invoiced' && row.balanceAmount > 0
const canTransfer = (row: any) => row.prepaymentStatus === 'invoiced' && row.balanceAmount > 0

// 搜索
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('搜索完成')
  }, 500)
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    supplierId: null,
    prepaymentStatus: '',
    invoiceStatus: '',
    writeoffStatus: '',
    dateRange: [],
    applicant: ''
  })
  handleSearch()
}

// 新增
const handleCreate = () => {
  router.push('/cost/prepayment/create')
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

// 刷新
const handleRefresh = () => {
  handleSearch()
}

// 分页变化
const handlePageChange = () => {
  handleSearch()
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

// 行点击
const handleRowClick = (row: any) => {
  handleView(row)
}

// 查看详情
const handleView = (row: any) => {
  currentRow.value = row
  showDetail.value = true
}

// 查看供应商
const handleViewSupplier = (supplierId: number) => {
  ElMessage.info('查看供应商详情功能开发中')
}

// 编辑
const handleEdit = (row: any) => {
  router.push(`/cost/prepayment/edit/${row.id}`)
}

// 提交
const handleSubmit = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要提交该预付款申请审核吗？', '提示', { type: 'warning' })
    row.prepaymentStatus = 'pending'
    ElMessage.success('提交成功')
  } catch {}
}

// 更多操作
const handleMoreAction = (command: string, row: any) => {
  switch (command) {
    case 'cancel':
      handleCancel(row)
      break
    case 'audit':
      handleAudit(row)
      break
    case 'payment':
      handlePayment(row)
      break
    case 'bindInvoice':
      openBindInvoice(row)
      break
    case 'writeoff':
      openWriteoff(row)
      break
    case 'autoWriteoff':
      handleAutoWriteoff(row)
      break
    case 'transfer':
      handleTransfer(row)
      break
    case 'print':
      window.print()
      break
    case 'log':
      ElMessage.info('操作日志功能开发中')
      break
  }
}

// 作废
const handleCancel = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要作废该预付款吗？', '警告', { type: 'warning' })
    row.prepaymentStatus = 'cancelled'
    ElMessage.success('作废成功')
  } catch {}
}

// 审核
const handleAudit = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定审核通过该预付款申请吗？', '提示', { type: 'info' })
    row.prepaymentStatus = 'approved'
    ElMessage.success('审核通过')
  } catch {}
}

// 付款登记
const handlePayment = (row: any) => {
  paymentForm.prepaymentId = row.id
  paymentForm.prepaymentNo = row.prepaymentNo
  paymentForm.supplierName = row.supplierName
  paymentForm.prepaymentAmount = row.prepaymentAmount
  paymentForm.balanceAmount = row.balanceAmount
  paymentForm.paymentAmount = row.balanceAmount
  paymentForm.paymentDate = new Date().toISOString().split('T')[0]
  paymentForm.paymentMethod = ''
  paymentForm.bankAccountId = null
  paymentForm.transactionNo = ''
  paymentForm.actualAmount = row.balanceAmount
  paymentForm.remark = ''
  paymentForm.fileList = []
  showPayment.value = true
}

// 付款文件变化
const handlePaymentFileChange = (file: any, fileList: any) => {
  paymentForm.fileList = fileList
}

// 付款文件删除
const handlePaymentFileRemove = (file: any, fileList: any) => {
  paymentForm.fileList = fileList
}

// 确认付款
const confirmPayment = async () => {
  if (!paymentForm.paymentDate) {
    ElMessage.warning('请选择付款日期')
    return
  }
  if (!paymentForm.paymentMethod) {
    ElMessage.warning('请选择付款方式')
    return
  }
  if (!paymentForm.bankAccountId) {
    ElMessage.warning('请选择银行账户')
    return
  }
  if (paymentForm.paymentAmount <= 0) {
    ElMessage.warning('付款金额必须大于0')
    return
  }
  paymentLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('付款登记成功')
    showPayment.value = false
    handleSearch()
  } catch {
    ElMessage.error('付款登记失败')
  } finally {
    paymentLoading.value = false
  }
}

// 打开绑定发票弹窗
const openBindInvoice = (row: any) => {
  bindInvoiceForm.prepaymentId = row.id
  bindInvoiceForm.availableAmount = row.balanceAmount
  bindInvoiceForm.selectedInvoices = []
  bindInvoiceForm.bindAmount = 0
  bindInvoiceForm.remark = ''
  showBindInvoice.value = true
}

// 发票选择变化
const handleInvoiceSelectChange = (selected: number[]) => {
  const total = selected.reduce((sum, id) => {
    const invoice = availableInvoices.value.find(inv => inv.id === id)
    return sum + (invoice?.invoiceAmount || 0)
  }, 0)
  bindInvoiceForm.bindAmount = Math.min(total, bindInvoiceForm.availableAmount)
}

// 确认绑定发票
const confirmBindInvoice = async () => {
  if (bindInvoiceForm.selectedInvoices.length === 0) {
    ElMessage.warning('请选择要绑定的发票')
    return
  }
  bindLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('发票绑定成功')
    showBindInvoice.value = false
    handleSearch()
  } catch {
    ElMessage.error('绑定失败')
  } finally {
    bindLoading.value = false
  }
}

// 打开核销弹窗
const openWriteoff = (row: any) => {
  writeoffForm.prepaymentId = row.id
  writeoffForm.availableBalance = row.balanceAmount
  writeoffForm.writeoffType = 'order'
  writeoffForm.selectedOrders = []
  writeoffForm.writeoffAmount = 0
  writeoffForm.remark = ''
  showWriteoff.value = true
}

// 确认核销
const confirmWriteoff = async () => {
  if (writeoffForm.writeoffType === 'order' && writeoffForm.selectedOrders.length === 0) {
    ElMessage.warning('请选择要核销的订单')
    return
  }
  if (writeoffForm.writeoffType === 'amount' && writeoffForm.writeoffAmount <= 0) {
    ElMessage.warning('请输入核销金额')
    return
  }
  writeoffLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('核销成功')
    showWriteoff.value = false
    handleSearch()
  } catch {
    ElMessage.error('核销失败')
  } finally {
    writeoffLoading.value = false
  }
}

// 自动核销
const handleAutoWriteoff = async (row: any) => {
  try {
    await ElMessageBox.confirm('系统将自动匹配可核销的订单，确定继续吗？', '提示', { type: 'info' })
    ElMessage.success('自动核销功能开发中')
  } catch {}
}

// 余款转应付
const handleTransfer = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定将剩余金额转为应付账款吗？', '提示', { type: 'info' })
    ElMessage.success('余款转应付功能开发中')
  } catch {}
}

// 账龄分析
const handleAgingAnalysis = () => {
  showAgingAnalysis.value = true
}

// 批量审核
const handleBatchAudit = () => {
  batchAuditForm.action = 'approve'
  batchAuditForm.rejectReason = ''
  batchAuditForm.remark = ''
  showBatchAudit.value = true
}

// 确认批量审核
const confirmBatchAudit = async () => {
  if (batchAuditForm.action === 'reject' && !batchAuditForm.rejectReason) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  batchAuditLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success(`批量${batchAuditForm.action === 'approve' ? '审核通过' : '驳回'}成功`)
    showBatchAudit.value = false
    handleSearch()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    batchAuditLoading.value = false
  }
}

// 关闭预警
const handleCloseAlert = (index: number) => {
  alerts.value.splice(index, 1)
}

// 关闭详情
const handleCloseDetail = () => {
  showDetail.value = false
  currentRow.value = null
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.prepayment-container {
  padding: 0;
}

.search-panel {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.action-bar {
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 10px;
}

.alert-panel {
  margin-bottom: 20px;
}

.alert-panel .el-alert {
  margin-bottom: 10px;
}

.table-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #eee;
  margin-top: 20px;
}

.text-success { color: #67c23a; }
.text-warning { color: #e6a23c; }
.text-danger { color: #f56c6c; }
.text-primary { color: #409eff; }
.text-info { color: #909399; }
.text-muted { color: #c0c4cc; font-size: 12px; margin-left: 8px; }

.invoice-option,
.order-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.invoice-option .invoice-no {
  flex: 0 0 140px;
  font-weight: 500;
}

.invoice-option .invoice-supplier {
  flex: 1;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 12px;
}

.invoice-option .invoice-amount {
  flex: 0 0 100px;
  text-align: right;
  color: #409eff;
  font-weight: 500;
}

.bind-invoice-form,
.writeoff-form {
  padding: 10px 0;
}

.aging-analysis {
  padding: 10px 0;
}

.aging-stats {
  margin-bottom: 10px;
}

.aging-stat-item {
  text-align: center;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
}

.aging-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.aging-value {
  font-size: 18px;
  font-weight: 600;
}

.batch-audit-form {
  padding: 10px 0;
}

.payment-form {
  padding: 10px 0;
}

.more-dropdown-link {
  cursor: pointer;
  color: #409eff;
  display: inline-flex;
  align-items: center;
}

:deep(.row-danger) {
  background-color: #fef0f0;
}

:deep(.row-warning) {
  background-color: #fdf6ec;
}
</style>
