<template>
  <div class="advance-container">
    <!-- 搜索筛选区域 -->
    <div class="search-panel">
      <el-form :model="searchForm" :inline="true" label-width="100px">
        <el-form-item label="申请人">
          <el-input v-model="searchForm.applicant" placeholder="请输入姓名" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="searchForm.departmentId" placeholder="请选择" clearable style="width: 180px">
            <el-option
              v-for="dept in departmentList"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="费用类型">
          <el-select v-model="searchForm.costType" placeholder="请选择" clearable style="width: 180px">
            <el-option
              v-for="item in costTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="垫付状态">
          <el-select v-model="searchForm.advanceStatus" placeholder="请选择" clearable style="width: 180px">
            <el-option label="草稿" value="draft" />
            <el-option label="待审核" value="pending" />
            <el-option label="待付款" value="approved" />
            <el-option label="待关联发票" value="paid" />
            <el-option label="待核销" value="invoiced" />
            <el-option label="已核销" value="written_off" />
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
        <el-form-item label="关联订单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable style="width: 180px" />
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
        新增垫付申请
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出
      </el-button>
      <el-button type="warning" @click="handleBatchAudit" :disabled="selectedRows.length === 0">
        <el-icon><Check /></el-icon>
        批量审核
      </el-button>
      <el-button type="primary" @click="handleBatchPayment" :disabled="selectedRows.length === 0">
        <el-icon><Money /></el-icon>
        批量付款
      </el-button>
      <el-button type="success" @click="handleBatchBindInvoice" :disabled="selectedRows.length === 0">
        <el-icon><Document /></el-icon>
        批量关联发票
      </el-button>
      <el-button type="info" @click="handleRefresh">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <!-- 状态 Tab 导航 -->
    <div class="status-tabs">
      <el-radio-group v-model="activeStatusTab" @change="handleStatusTabChange">
        <el-radio-button value="all">全部</el-radio-button>
        <el-radio-button value="draft">草稿</el-radio-button>
        <el-radio-button value="pending">待审核</el-radio-button>
        <el-radio-button value="approved">待付款</el-radio-button>
        <el-radio-button value="paid">待关联发票</el-radio-button>
        <el-radio-button value="invoiced">待核销</el-radio-button>
        <el-radio-button value="written_off">已核销</el-radio-button>
        <el-radio-button value="rejected">已驳回</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <el-table
        :data="filteredTableData"
        v-loading="loading"
        border
        stripe
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        :row-class-name="getRowClassName"
      >
        <el-table-column type="selection" width="55" fixed />
        <el-table-column prop="advanceNo" label="垫付单号" min-width="160" sortable fixed />
        <el-table-column prop="applicantName" label="申请人" width="100" />
        <el-table-column prop="departmentName" label="所属部门" width="120" />
        <el-table-column prop="costType" label="费用类型" width="120">
          <template #default="scope">
            {{ getCostTypeText(scope.row.costType) }}
          </template>
        </el-table-column>
        <el-table-column prop="costReason" label="费用事由" min-width="200" show-overflow-tooltip />
        <el-table-column prop="orderNo" label="关联订单号" min-width="160">
          <template #default="scope">
            <el-link v-if="scope.row.orderNo" type="primary" @click.stop="handleViewOrder(scope.row)">{{ scope.row.orderNo }}</el-link>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="advanceAmount" label="垫付金额" width="140" align="right" sortable>
          <template #default="scope">¥{{ formatMoney(scope.row.advanceAmount) }}</template>
        </el-table-column>
        <el-table-column prop="paidAmount" label="已付金额" width="140" align="right">
          <template #default="scope">¥{{ formatMoney(scope.row.paidAmount) }}</template>
        </el-table-column>
        <el-table-column prop="invoicedAmount" label="已关联发票" width="140" align="right">
          <template #default="scope">¥{{ formatMoney(scope.row.invoicedAmount) }}</template>
        </el-table-column>
        <el-table-column prop="balanceAmount" label="未核销金额" width="140" align="right">
          <template #default="scope">
            <span :class="scope.row.balanceAmount > 0 ? 'text-warning' : 'text-success'">
              ¥{{ formatMoney(scope.row.balanceAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="advanceStatus" label="垫付状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusConfig(scope.row.advanceStatus).type" size="small">
              {{ getStatusConfig(scope.row.advanceStatus).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="paymentAccount" label="收款账户" min-width="180" show-overflow-tooltip />
        <el-table-column prop="applyDate" label="申请日期" width="160">
          <template #default="scope">{{ formatDateTime(scope.row.applyDate) }}</template>
        </el-table-column>
        <el-table-column prop="paymentDate" label="付款日期" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" link @click.stop="handleView(scope.row)">查看</el-button>
            <el-button type="success" size="small" link @click.stop="handleEdit(scope.row)" :disabled="!canEdit(scope.row)">编辑</el-button>
            <el-dropdown trigger="hover" @command="(command: string) => handleMoreAction(command, scope.row)">
              <span class="more-dropdown-link">
                <el-button type="info" size="small" link>更多<el-icon><ArrowDown /></el-icon></el-button>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="submit" :disabled="!canSubmit(scope.row)">提交审核</el-dropdown-item>
                  <el-dropdown-item command="audit" :disabled="!canAudit(scope.row)">审核</el-dropdown-item>
                  <el-dropdown-item command="applyPayment" :disabled="!canApplyPayment(scope.row)">申请付款</el-dropdown-item>
                  <el-dropdown-item command="bindInvoice" :disabled="!canBindInvoice(scope.row)">关联发票</el-dropdown-item>
                  <el-dropdown-item command="writeoff" :disabled="!canWriteoff(scope.row)">核销</el-dropdown-item>
                  <el-dropdown-item command="cancel" :disabled="!canCancel(scope.row)">作废</el-dropdown-item>
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
      :title="`垫付单详情 - ${currentRow?.advanceNo || ''}`"
      size="900px"
      :before-close="handleCloseDetail"
    >
      <template #default>
        <advance-detail v-if="currentRow" :advance-id="currentRow.id" @refresh="handleRefreshDetail" />
      </template>
    </el-drawer>

    <!-- 审核弹窗 -->
    <el-dialog
      v-model="showAudit"
      title="审核垫付申请"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="audit-form">
        <el-form :model="auditForm" label-width="100px">
          <el-form-item label="垫付单号">
            {{ auditForm.advanceNo }}
          </el-form-item>
          <el-form-item label="申请人">
            {{ auditForm.applicantName }}
          </el-form-item>
          <el-form-item label="费用类型">
            {{ getCostTypeText(auditForm.costType) }}
          </el-form-item>
          <el-form-item label="垫付金额">
            <span class="text-primary">¥{{ formatMoney(auditForm.advanceAmount) }}</span>
          </el-form-item>
          <el-form-item label="审核操作" required>
            <el-radio-group v-model="auditForm.action">
              <el-radio label="approve">通过</el-radio>
              <el-radio label="reject">驳回</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="auditForm.action === 'reject'" label="驳回原因" required>
            <el-input v-model="auditForm.rejectReason" type="textarea" :rows="3" placeholder="请输入驳回原因" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="auditForm.remark" type="textarea" :rows="2" placeholder="请输入审核备注" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showAudit = false">取消</el-button>
        <el-button type="primary" @click="confirmAudit" :loading="auditLoading">确认</el-button>
      </template>
    </el-dialog>

    <!-- 申请付款弹窗 -->
    <el-dialog
      v-model="showApplyPayment"
      title="申请付款"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="payment-form">
        <el-form :model="paymentForm" label-width="120px">
          <div class="form-section-title">基本信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="垫付单号">
                {{ paymentForm.advanceNo }}
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="申请人">
                {{ paymentForm.applicantName }}
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="垫付金额">
                <span class="text-primary">¥{{ formatMoney(paymentForm.advanceAmount) }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="收款账户">
                {{ paymentForm.paymentAccount }}
              </el-form-item>
            </el-col>
          </el-row>
          <el-divider />
          <div class="form-section-title">付款信息</div>
          <el-form-item label="付款方式" required>
            <el-select v-model="paymentForm.paymentMethod" placeholder="请选择" style="width: 100%">
              <el-option label="银行转账" value="bank_transfer" />
              <el-option label="承兑汇票" value="acceptance" />
              <el-option label="现金" value="cash" />
              <el-option label="支票" value="cheque" />
            </el-select>
          </el-form-item>
          <el-form-item label="付款账户" required>
            <el-select v-model="paymentForm.bankAccountId" placeholder="请选择公司付款账户" style="width: 100%">
              <el-option
                v-for="bank in bankAccounts"
                :key="bank.id"
                :label="`${bank.bankName} ${bank.accountNo}`"
                :value="bank.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="银行流水">
            <el-input v-model="paymentForm.transactionNo" placeholder="请输入银行流水号" />
          </el-form-item>
          <el-form-item label="付款日期" required>
            <el-date-picker
              v-model="paymentForm.paymentDate"
              type="date"
              placeholder="请选择"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="paymentForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
          </el-form-item>
          <el-divider />
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
        <el-button @click="showApplyPayment = false">取消</el-button>
        <el-button type="primary" @click="confirmApplyPayment" :loading="paymentLoading">确认付款</el-button>
      </template>
    </el-dialog>

    <!-- 关联发票弹窗 -->
    <el-dialog
      v-model="showBindInvoice"
      title="关联发票"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="bind-invoice-form">
        <el-form :model="bindInvoiceForm" label-width="120px">
          <div class="form-section-title">基本信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="垫付单号">
                {{ bindInvoiceForm.advanceNo }}
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="申请人">
                {{ bindInvoiceForm.applicantName }}
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="垫付金额">
                <span class="text-primary">¥{{ formatMoney(bindInvoiceForm.advanceAmount) }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="待关联金额">
                <span class="text-warning">¥{{ formatMoney(bindInvoiceForm.waitBindAmount) }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-divider />
          <div class="form-section-title">发票信息</div>
          <el-form-item label="选择发票" required>
            <el-select
              v-model="bindInvoiceForm.selectedInvoice"
              filterable
              placeholder="请选择要关联的发票"
              style="width: 100%"
              @change="handleInvoiceSelectChange"
            >
              <el-option
                v-for="invoice in availableInvoices"
                :key="invoice.id"
                :label="`${invoice.invoiceNo} - ${invoice.invoiceType} - ¥${formatMoney(invoice.invoiceAmount)}`"
                :value="invoice.id"
              >
                <div class="invoice-option">
                  <span class="invoice-no">{{ invoice.invoiceNo }}</span>
                  <span class="invoice-supplier">{{ invoice.invoiceType }}</span>
                  <span class="invoice-amount">¥{{ formatMoney(invoice.invoiceAmount) }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="关联金额" required>
            <el-input-number
              v-model="bindInvoiceForm.bindAmount"
              :min="0"
              :max="bindInvoiceForm.waitBindAmount"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
          <el-divider />
          <el-form-item label="备注">
            <el-input v-model="bindInvoiceForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showBindInvoice = false">取消</el-button>
        <el-button type="primary" @click="confirmBindInvoice" :loading="bindLoading">确认关联</el-button>
      </template>
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
            {{ selectedRows.length }} 条垫付申请
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
        <el-button type="primary" @click="confirmBatchAudit" :loading="batchAuditLoading">确认审核</el-button>
      </template>
    </el-dialog>

    <!-- 批量付款弹窗 -->
    <el-dialog
      v-model="showBatchPayment"
      title="批量付款"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="batch-payment-form">
        <el-form :model="batchPaymentForm" label-width="100px">
          <el-form-item label="选中记录">
            {{ selectedRows.length }} 条垫付申请
          </el-form-item>
          <el-form-item label="付款总金额">
            <span class="text-primary">¥{{ formatMoney(batchPaymentForm.totalAmount) }}</span>
          </el-form-item>
          <el-divider />
          <el-form-item label="付款方式" required>
            <el-select v-model="batchPaymentForm.paymentMethod" placeholder="请选择" style="width: 100%">
              <el-option label="银行转账" value="bank_transfer" />
              <el-option label="承兑汇票" value="acceptance" />
              <el-option label="现金" value="cash" />
              <el-option label="支票" value="cheque" />
            </el-select>
          </el-form-item>
          <el-form-item label="付款账户" required>
            <el-select v-model="batchPaymentForm.bankAccountId" placeholder="请选择" style="width: 100%">
              <el-option
                v-for="bank in bankAccounts"
                :key="bank.id"
                :label="`${bank.bankName} ${bank.accountNo}`"
                :value="bank.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="付款日期" required>
            <el-date-picker
              v-model="batchPaymentForm.paymentDate"
              type="date"
              placeholder="请选择"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="银行流水">
            <el-input v-model="batchPaymentForm.transactionNo" placeholder="请输入银行流水" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="batchPaymentForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showBatchPayment = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchPayment" :loading="batchPaymentLoading">确认付款</el-button>
      </template>
    </el-dialog>

    <!-- 批量关联发票弹窗 -->
    <el-dialog
      v-model="showBatchBindInvoice"
      title="批量关联发票"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="batch-bind-invoice-form">
        <el-form :model="batchBindInvoiceForm" label-width="100px">
          <el-form-item label="选中记录">
            {{ selectedRows.length }} 条垫付申请
          </el-form-item>
          <el-form-item label="待关联总额">
            <span class="text-primary">¥{{ formatMoney(batchBindInvoiceForm.totalAmount) }}</span>
          </el-form-item>
          <el-divider />
          <el-form-item label="选择发票" required>
            <el-select
              v-model="batchBindInvoiceForm.selectedInvoice"
              filterable
              placeholder="请选择要关联的发票"
              style="width: 100%"
              @change="handleBatchInvoiceSelectChange"
            >
              <el-option
                v-for="invoice in availableInvoices"
                :key="invoice.id"
                :label="`${invoice.invoiceNo} - ${invoice.invoiceType} - ¥${formatMoney(invoice.invoiceAmount)}`"
                :value="invoice.id"
              >
                <div class="invoice-option">
                  <span class="invoice-no">{{ invoice.invoiceNo }}</span>
                  <span class="invoice-supplier">{{ invoice.invoiceType }}</span>
                  <span class="invoice-amount">¥{{ formatMoney(invoice.invoiceAmount) }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="关联总金额">
            <span class="text-primary">¥{{ formatMoney(batchBindInvoiceForm.bindAmount) }}</span>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="batchBindInvoiceForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showBatchBindInvoice = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchBindInvoice" :loading="batchBindInvoiceLoading">确认关联</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Download, Check, Money, Document, ArrowDown } from '@element-plus/icons-vue'
import AdvanceDetail from './AdvanceDetail.vue'

const router = useRouter()
const loading = ref(false)
const selectedRows = ref<any[]>([])
const showDetail = ref(false)
const showAudit = ref(false)
const showApplyPayment = ref(false)
const showBindInvoice = ref(false)
const showBatchAudit = ref(false)
const showBatchPayment = ref(false)
const showBatchBindInvoice = ref(false)
const auditLoading = ref(false)
const paymentLoading = ref(false)
const bindLoading = ref(false)
const batchAuditLoading = ref(false)
const batchPaymentLoading = ref(false)
const batchBindInvoiceLoading = ref(false)
const activeStatusTab = ref('all')
const filteredTableData = ref<any[]>([])
const currentRow = ref<any>(null)

// 搜索表单
const searchForm = reactive({
  applicant: '',
  departmentId: null as number | null,
  costType: '',
  advanceStatus: '',
  dateRange: [] as string[],
  orderNo: ''
})

// 部门列表
const departmentList = ref([
  { id: 1, name: '销售一部' },
  { id: 2, name: '销售二部' },
  { id: 3, name: '技术部' },
  { id: 4, name: '行政部' }
])

// 费用类型选项
const costTypeOptions = ref([
  { label: '差旅费', value: 'travel' },
  { label: '招待费', value: 'entertainment' },
  { label: '交通费', value: 'transportation' },
  { label: '办公费', value: 'office' },
  { label: '通讯费', value: 'communication' },
  { label: '其他', value: 'other' }
])

// 银行账户列表
const bankAccounts = ref([
  { id: 1, bankName: '中国工商银行', accountNo: '6222081234567890' },
  { id: 2, bankName: '中国建设银行', accountNo: '6217001234567890' },
  { id: 3, bankName: '中国农业银行', accountNo: '6228481234567890' },
  { id: 4, bankName: '招商银行', accountNo: '6214831234567890' }
])

// 可选发票列表
const availableInvoices = ref([
  { id: 1, invoiceNo: 'FP2026070001', invoiceType: '增值税专用发票', invoiceAmount: 2800.00 },
  { id: 2, invoiceNo: 'FP2026070002', invoiceType: '增值税普通发票', invoiceAmount: 1560.00 },
  { id: 3, invoiceNo: 'FP2026070003', invoiceType: '增值税专用发票', invoiceAmount: 860.00 },
  { id: 4, invoiceNo: 'FP2026070004', invoiceType: '增值税普通发票', invoiceAmount: 450.00 },
  { id: 5, invoiceNo: 'FP2026070005', invoiceType: '增值税专用发票', invoiceAmount: 680.00 }
])

// 分页信息
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    advanceNo: 'DF2026070001',
    applicantId: '1',
    applicantName: '张三',
    departmentId: 3,
    departmentName: '技术部',
    costType: 'travel',
    costReason: '去上海出差3天的机票和酒店费用',
    orderNo: 'SO202602150008',
    advanceAmount: 2800.00,
    paidAmount: 0.00,
    invoicedAmount: 0.00,
    writtenOffAmount: 0.00,
    balanceAmount: 2800.00,
    advanceStatus: 'pending',
    applyDate: '2026-07-10 09:30:45',
    expectedPaymentDate: '2026-07-15',
    paymentDate: '',
    paymentAccount: '招商银行 6214831234567890',
    applicant: '张三'
  },
  {
    id: 2,
    advanceNo: 'DF2026070002',
    applicantId: '2',
    applicantName: '李四',
    departmentId: 1,
    departmentName: '销售一部',
    costType: 'entertainment',
    costReason: '客户招待餐费',
    orderNo: 'SO202603010012',
    advanceAmount: 1560.00,
    paidAmount: 0.00,
    invoicedAmount: 0.00,
    writtenOffAmount: 0.00,
    balanceAmount: 1560.00,
    advanceStatus: 'approved',
    applyDate: '2026-07-08 14:22:30',
    expectedPaymentDate: '2026-07-13',
    paymentDate: '',
    paymentAccount: '工商银行 6222081234567890',
    applicant: '李四'
  },
  {
    id: 3,
    advanceNo: 'DF2026070003',
    applicantId: '1',
    applicantName: '张三',
    departmentId: 3,
    departmentName: '技术部',
    costType: 'office',
    costReason: '购买开发用的软件license',
    orderNo: '',
    advanceAmount: 860.00,
    paidAmount: 860.00,
    invoicedAmount: 0.00,
    writtenOffAmount: 0.00,
    balanceAmount: 860.00,
    advanceStatus: 'paid',
    applyDate: '2026-07-05 10:15:20',
    expectedPaymentDate: '2026-07-10',
    paymentDate: '2026-07-08',
    paymentAccount: '招商银行 6214831234567890',
    applicant: '张三'
  },
  {
    id: 4,
    advanceNo: 'DF2026070004',
    applicantId: '3',
    applicantName: '王五',
    departmentId: 2,
    departmentName: '销售二部',
    costType: 'transportation',
    costReason: '7月打车费报销',
    orderNo: '',
    advanceAmount: 450.00,
    paidAmount: 0.00,
    invoicedAmount: 0.00,
    writtenOffAmount: 0.00,
    balanceAmount: 450.00,
    advanceStatus: 'draft',
    applyDate: '2026-07-15 16:40:00',
    expectedPaymentDate: '',
    paymentDate: '',
    paymentAccount: '建设银行 6217001234567890',
    applicant: '王五'
  },
  {
    id: 5,
    advanceNo: 'DF2026070005',
    applicantId: '4',
    applicantName: '赵六',
    departmentId: 4,
    departmentName: '行政部',
    costType: 'office',
    costReason: '购买办公用品',
    orderNo: '',
    advanceAmount: 680.00,
    paidAmount: 0.00,
    invoicedAmount: 0.00,
    writtenOffAmount: 0.00,
    balanceAmount: 680.00,
    advanceStatus: 'rejected',
    applyDate: '2026-07-02 11:20:00',
    expectedPaymentDate: '',
    paymentDate: '',
    paymentAccount: '农业银行 6228481234567890',
    applicant: '赵六',
    rejectReason: '请提供正规发票'
  },
  {
    id: 6,
    advanceNo: 'DF2026070006',
    applicantId: '2',
    applicantName: '李四',
    departmentId: 1,
    departmentName: '销售一部',
    costType: 'travel',
    costReason: '北京客户拜访差旅费',
    orderNo: 'SO202606200010',
    advanceAmount: 3200.00,
    paidAmount: 3200.00,
    invoicedAmount: 3200.00,
    writtenOffAmount: 0.00,
    balanceAmount: 3200.00,
    advanceStatus: 'invoiced',
    applyDate: '2026-06-25 09:00:00',
    expectedPaymentDate: '2026-06-30',
    paymentDate: '2026-06-28',
    paymentAccount: '工商银行 6222081234567890',
    applicant: '李四'
  },
  {
    id: 7,
    advanceNo: 'DF2026060019',
    applicantId: '1',
    applicantName: '张三',
    departmentId: 3,
    departmentName: '技术部',
    costType: 'communication',
    costReason: '6月通讯费报销',
    orderNo: '',
    advanceAmount: 280.00,
    paidAmount: 280.00,
    invoicedAmount: 280.00,
    writtenOffAmount: 280.00,
    balanceAmount: 0.00,
    advanceStatus: 'written_off',
    applyDate: '2026-06-10 10:00:00',
    expectedPaymentDate: '2026-06-15',
    paymentDate: '2026-06-13',
    paymentAccount: '招商银行 6214831234567890',
    applicant: '张三'
  }
])

pagination.total = tableData.value.length

// 审核表单
const auditForm = reactive({
  advanceId: null as number | null,
  advanceNo: '',
  applicantName: '',
  costType: '',
  advanceAmount: 0,
  action: 'approve' as 'approve' | 'reject',
  rejectReason: '',
  remark: ''
})

// 申请付款表单
const paymentForm = reactive({
  advanceId: null as number | null,
  advanceNo: '',
  applicantName: '',
  advanceAmount: 0,
  paymentAccount: '',
  paymentMethod: '',
  bankAccountId: null as number | null,
  transactionNo: '',
  paymentDate: '',
  remark: '',
  fileList: [] as any[]
})

// 关联发票表单
const bindInvoiceForm = reactive({
  advanceId: null as number | null,
  advanceNo: '',
  applicantName: '',
  advanceAmount: 0,
  waitBindAmount: 0,
  selectedInvoice: null as number | null,
  bindAmount: 0,
  remark: ''
})

// 批量审核表单
const batchAuditForm = reactive({
  action: 'approve' as 'approve' | 'reject',
  rejectReason: '',
  remark: ''
})

// 批量付款表单
const batchPaymentForm = reactive({
  totalAmount: 0,
  paymentMethod: '',
  bankAccountId: null as number | null,
  transactionNo: '',
  paymentDate: '',
  remark: ''
})

// 批量关联发票表单
const batchBindInvoiceForm = reactive({
  totalAmount: 0,
  selectedInvoice: null as number | null,
  bindAmount: 0,
  remark: ''
})

// 格式化金额
const formatMoney = (value: number) => {
  return (value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return dateStr
}

// 获取费用类型文本
const getCostTypeText = (value: string) => {
  const item = costTypeOptions.value.find(t => t.value === value)
  return item ? item.label : value
}

// 获取状态配置
const getStatusConfig = (status: string) => {
  const config: Record<string, { label: string, type: string }> = {
    'draft': { label: '草稿', type: 'info' },
    'pending': { label: '待审核', type: 'warning' },
    'approved': { label: '待付款', type: 'primary' },
    'paid': { label: '待关联发票', type: 'primary' },
    'invoiced': { label: '待核销', type: 'warning' },
    'written_off': { label: '已核销', type: 'success' },
    'rejected': { label: '已驳回', type: 'danger' },
    'cancelled': { label: '已作废', type: 'info' }
  }
  return config[status] || { label: status, type: 'info' }
}

// 获取行样式
const getRowClassName = ({ row }: any) => {
  if (row.advanceStatus === 'rejected') return 'row-danger'
  if (row.advanceStatus === 'written_off') return 'row-success'
  return ''
}

// 操作权限判断
const canEdit = (row: any) => ['draft', 'rejected'].includes(row.advanceStatus)
const canSubmit = (row: any) => ['draft', 'rejected'].includes(row.advanceStatus)
const canAudit = (row: any) => row.advanceStatus === 'pending'
const canApplyPayment = (row: any) => row.advanceStatus === 'approved'
const canBindInvoice = (row: any) => ['paid', 'invoiced'].includes(row.advanceStatus) && row.balanceAmount > 0
const canWriteoff = (row: any) => row.advanceStatus === 'invoiced' && row.balanceAmount > 0
const canCancel = (row: any) => ['draft', 'pending', 'rejected'].includes(row.advanceStatus)

// 过滤数据
const filterDataByStatus = () => {
  let list = [...tableData.value]
  if (activeStatusTab.value !== 'all') {
    list = list.filter(item => item.advanceStatus === activeStatusTab.value)
  }
  // 应用搜索条件
  if (searchForm.applicant) {
    list = list.filter(item => item.applicantName.includes(searchForm.applicant))
  }
  if (searchForm.departmentId) {
    list = list.filter(item => item.departmentId === searchForm.departmentId)
  }
  if (searchForm.costType) {
    list = list.filter(item => item.costType === searchForm.costType)
  }
  if (searchForm.advanceStatus) {
    list = list.filter(item => item.advanceStatus === searchForm.advanceStatus)
  }
  if (searchForm.orderNo) {
    list = list.filter(item => item.orderNo && item.orderNo.includes(searchForm.orderNo))
  }
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    list = list.filter(item => {
      const applyDate = item.applyDate.split(' ')[0]
      return applyDate >= searchForm.dateRange[0] && applyDate <= searchForm.dateRange[1]
    })
  }
  filteredTableData.value = list
  pagination.total = list.length
}

// 状态 Tab 切换
const handleStatusTabChange = () => {
  filterDataByStatus()
}

// 搜索
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    filterDataByStatus()
  }, 300)
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    applicant: '',
    departmentId: null,
    costType: '',
    advanceStatus: '',
    dateRange: [],
    orderNo: ''
  })
  handleSearch()
}

// 新增
const handleCreate = () => {
  router.push('/payable/advance/create')
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

// 查看订单
const handleViewOrder = (row: any) => {
  if (row.orderNo) {
    ElMessage.info(`查看订单 ${row.orderNo} 详情`)
  }
}

// 编辑
const handleEdit = (row: any) => {
  router.push(`/payable/advance/edit/${row.id}`)
}

// 详情刷新
const handleRefreshDetail = () => {
  handleSearch()
}

// 关闭详情
const handleCloseDetail = () => {
  showDetail.value = false
  currentRow.value = null
}

// 更多操作
const handleMoreAction = (command: string, row: any) => {
  switch (command) {
    case 'submit':
      handleSubmit(row)
      break
    case 'audit':
      openAuditDialog(row)
      break
    case 'applyPayment':
      openApplyPaymentDialog(row)
      break
    case 'bindInvoice':
      openBindInvoiceDialog(row)
      break
    case 'writeoff':
      handleWriteoff(row)
      break
    case 'cancel':
      handleCancel(row)
      break
    case 'print':
      window.print()
      break
    case 'log':
      ElMessage.info('操作日志功能开发中')
      break
  }
}

// 提交审核
const handleSubmit = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要提交该垫付申请审核吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    const item = tableData.value.find(t => t.id === row.id)
    if (item) {
      item.advanceStatus = 'pending'
    }
    ElMessage.success('提交成功，等待审核')
    filterDataByStatus()
  } catch {}
}

// 作废
const handleCancel = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要作废该垫付申请吗？作废后不可恢复。', '警告', { type: 'warning' })
    const item = tableData.value.find(t => t.id === row.id)
    if (item) {
      item.advanceStatus = 'cancelled'
    }
    ElMessage.success('作废成功')
    filterDataByStatus()
  } catch {}
}

// 核销
const handleWriteoff = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要核销该垫付申请吗？核销后垫付流程结束。\n待核销金额：¥${formatMoney(row.balanceAmount)}`,
      '提示',
      { type: 'warning' }
    )
    const item = tableData.value.find(t => t.id === row.id)
    if (item) {
      item.writtenOffAmount = item.advanceAmount
      item.balanceAmount = 0
      item.advanceStatus = 'written_off'
    }
    ElMessage.success('核销成功')
    filterDataByStatus()
  } catch {}
}

// 打开审核弹窗
const openAuditDialog = (row: any) => {
  auditForm.advanceId = row.id
  auditForm.advanceNo = row.advanceNo
  auditForm.applicantName = row.applicantName
  auditForm.costType = row.costType
  auditForm.advanceAmount = row.advanceAmount
  auditForm.action = 'approve'
  auditForm.rejectReason = ''
  auditForm.remark = ''
  showAudit.value = true
}

// 确认审核
const confirmAudit = async () => {
  if (auditForm.action === 'reject' && !auditForm.rejectReason) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  auditLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const row = tableData.value.find(item => item.id === auditForm.advanceId)
    if (row) {
      if (auditForm.action === 'approve') {
        row.advanceStatus = 'approved'
        ElMessage.success('审核通过')
      } else {
        row.advanceStatus = 'rejected'
        row.rejectReason = auditForm.rejectReason
        ElMessage.success('已驳回')
      }
    }
    showAudit.value = false
    filterDataByStatus()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    auditLoading.value = false
  }
}

// 打开申请付款弹窗
const openApplyPaymentDialog = (row: any) => {
  paymentForm.advanceId = row.id
  paymentForm.advanceNo = row.advanceNo
  paymentForm.applicantName = row.applicantName
  paymentForm.advanceAmount = row.advanceAmount
  paymentForm.paymentAccount = row.paymentAccount
  paymentForm.paymentMethod = 'bank_transfer'
  paymentForm.bankAccountId = null
  paymentForm.transactionNo = ''
  paymentForm.paymentDate = new Date().toISOString().split('T')[0]
  paymentForm.remark = ''
  paymentForm.fileList = []
  showApplyPayment.value = true
}

// 确认申请付款
const confirmApplyPayment = async () => {
  if (!paymentForm.paymentMethod) {
    ElMessage.warning('请选择付款方式')
    return
  }
  if (!paymentForm.bankAccountId) {
    ElMessage.warning('请选择付款账户')
    return
  }
  if (!paymentForm.paymentDate) {
    ElMessage.warning('请选择付款日期')
    return
  }
  paymentLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const row = tableData.value.find(item => item.id === paymentForm.advanceId)
    if (row) {
      row.paidAmount = row.advanceAmount
      row.balanceAmount = row.advanceAmount
      row.paymentDate = paymentForm.paymentDate
      row.advanceStatus = 'paid'
    }
    ElMessage.success('付款成功')
    showApplyPayment.value = false
    filterDataByStatus()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    paymentLoading.value = false
  }
}

// 付款附件变化
const handlePaymentFileChange = (_file: any, fileList: any) => {
  paymentForm.fileList = fileList
}

// 付款附件删除
const handlePaymentFileRemove = (_file: any, fileList: any) => {
  paymentForm.fileList = fileList
}

// 打开关联发票弹窗
const openBindInvoiceDialog = (row: any) => {
  bindInvoiceForm.advanceId = row.id
  bindInvoiceForm.advanceNo = row.advanceNo
  bindInvoiceForm.applicantName = row.applicantName
  bindInvoiceForm.advanceAmount = row.advanceAmount
  bindInvoiceForm.waitBindAmount = row.balanceAmount
  bindInvoiceForm.selectedInvoice = null
  bindInvoiceForm.bindAmount = 0
  bindInvoiceForm.remark = ''
  showBindInvoice.value = true
}

// 发票选择变化
const handleInvoiceSelectChange = (selected: number | null) => {
  if (selected) {
    const invoice = availableInvoices.value.find(inv => inv.id === selected)
    if (invoice) {
      bindInvoiceForm.bindAmount = Math.min(invoice.invoiceAmount, bindInvoiceForm.waitBindAmount)
    }
  } else {
    bindInvoiceForm.bindAmount = 0
  }
}

// 确认关联发票
const confirmBindInvoice = async () => {
  if (!bindInvoiceForm.selectedInvoice) {
    ElMessage.warning('请选择要关联的发票')
    return
  }
  if (!bindInvoiceForm.bindAmount || bindInvoiceForm.bindAmount <= 0) {
    ElMessage.warning('请输入关联金额')
    return
  }
  if (bindInvoiceForm.bindAmount > bindInvoiceForm.waitBindAmount) {
    ElMessage.warning('关联金额不能超过待关联金额')
    return
  }
  bindLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const row = tableData.value.find(item => item.id === bindInvoiceForm.advanceId)
    if (row) {
      row.invoicedAmount = (row.invoicedAmount || 0) + bindInvoiceForm.bindAmount
      row.balanceAmount = row.advanceAmount - row.writtenOffAmount - row.invoicedAmount
      if (row.balanceAmount < 0) row.balanceAmount = 0
      if (row.invoicedAmount >= row.advanceAmount - row.writtenOffAmount) {
        row.advanceStatus = 'invoiced'
      } else {
        row.advanceStatus = 'invoiced'
      }
    }
    ElMessage.success('发票关联成功')
    showBindInvoice.value = false
    filterDataByStatus()
  } catch {
    ElMessage.error('关联失败')
  } finally {
    bindLoading.value = false
  }
}

// 批量审核
const handleBatchAudit = () => {
  const invalidRows = selectedRows.value.filter(row => row.advanceStatus !== 'pending')
  if (invalidRows.length > 0) {
    ElMessage.warning('只有待审核状态的垫付申请才能批量审核')
    return
  }
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
    const newStatus = batchAuditForm.action === 'approve' ? 'approved' : 'rejected'
    selectedRows.value.forEach(row => {
      const item = tableData.value.find(t => t.id === row.id)
      if (item) {
        item.advanceStatus = newStatus
        if (newStatus === 'rejected') {
          item.rejectReason = batchAuditForm.rejectReason
        }
      }
    })
    ElMessage.success(`批量${batchAuditForm.action === 'approve' ? '审核通过' : '驳回'}成功`)
    showBatchAudit.value = false
    filterDataByStatus()
    selectedRows.value = []
  } catch {
    ElMessage.error('操作失败')
  } finally {
    batchAuditLoading.value = false
  }
}

// 批量付款
const handleBatchPayment = () => {
  const invalidRows = selectedRows.value.filter(row => row.advanceStatus !== 'approved')
  if (invalidRows.length > 0) {
    ElMessage.warning('只有待付款状态的垫付申请才能批量付款')
    return
  }
  const totalAmount = selectedRows.value.reduce((sum, row) => sum + row.advanceAmount, 0)
  batchPaymentForm.totalAmount = totalAmount
  batchPaymentForm.paymentMethod = 'bank_transfer'
  batchPaymentForm.bankAccountId = null
  batchPaymentForm.transactionNo = ''
  batchPaymentForm.paymentDate = new Date().toISOString().split('T')[0]
  batchPaymentForm.remark = ''
  showBatchPayment.value = true
}

// 确认批量付款
const confirmBatchPayment = async () => {
  if (!batchPaymentForm.paymentMethod) {
    ElMessage.warning('请选择付款方式')
    return
  }
  if (!batchPaymentForm.bankAccountId) {
    ElMessage.warning('请选择付款账户')
    return
  }
  if (!batchPaymentForm.paymentDate) {
    ElMessage.warning('请选择付款日期')
    return
  }
  batchPaymentLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    selectedRows.value.forEach(row => {
      const item = tableData.value.find(t => t.id === row.id)
      if (item) {
        item.paidAmount = item.advanceAmount
        item.balanceAmount = item.advanceAmount
        item.paymentDate = batchPaymentForm.paymentDate
        item.advanceStatus = 'paid'
      }
    })
    ElMessage.success('批量付款成功')
    showBatchPayment.value = false
    filterDataByStatus()
    selectedRows.value = []
  } catch {
    ElMessage.error('操作失败')
  } finally {
    batchPaymentLoading.value = false
  }
}

// 批量关联发票
const handleBatchBindInvoice = () => {
  const invalidRows = selectedRows.value.filter(row => !['paid', 'invoiced'].includes(row.advanceStatus))
  if (invalidRows.length > 0) {
    ElMessage.warning('只有待关联发票或待核销状态的垫付申请才能批量关联发票')
    return
  }
  const totalAmount = selectedRows.value.reduce((sum, row) => sum + (row.balanceAmount || 0), 0)
  batchBindInvoiceForm.totalAmount = totalAmount
  batchBindInvoiceForm.selectedInvoice = null
  batchBindInvoiceForm.bindAmount = 0
  batchBindInvoiceForm.remark = ''
  showBatchBindInvoice.value = true
}

// 批量发票选择变化
const handleBatchInvoiceSelectChange = (selected: number | null) => {
  if (selected) {
    const invoice = availableInvoices.value.find(inv => inv.id === selected)
    batchBindInvoiceForm.bindAmount = invoice?.invoiceAmount || 0
  } else {
    batchBindInvoiceForm.bindAmount = 0
  }
}

// 确认批量关联发票
const confirmBatchBindInvoice = async () => {
  if (!batchBindInvoiceForm.selectedInvoice) {
    ElMessage.warning('请选择要关联的发票')
    return
  }
  batchBindInvoiceLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    selectedRows.value.forEach(row => {
      const item = tableData.value.find(t => t.id === row.id)
      if (item) {
        const avgAmount = batchBindInvoiceForm.bindAmount / selectedRows.value.length
        item.invoicedAmount = (item.invoicedAmount || 0) + avgAmount
        item.balanceAmount = item.advanceAmount - item.writtenOffAmount - item.invoicedAmount
        if (item.balanceAmount < 0) item.balanceAmount = 0
        item.advanceStatus = 'invoiced'
      }
    })
    ElMessage.success('批量关联发票成功')
    showBatchBindInvoice.value = false
    filterDataByStatus()
    selectedRows.value = []
  } catch {
    ElMessage.error('操作失败')
  } finally {
    batchBindInvoiceLoading.value = false
  }
}

onMounted(() => {
  filterDataByStatus()
})
</script>

<style scoped>
.advance-container {
  padding: 0;
}

.search-panel {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.status-tabs {
  background: #fff;
  padding: 16px 20px;
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

.invoice-option {
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

.audit-form,
.payment-form,
.bind-invoice-form,
.batch-audit-form,
.batch-payment-form,
.batch-bind-invoice-form {
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

:deep(.row-success) {
  background-color: #f0f9eb;
}

:deep(.row-warning) {
  background-color: #fdf6ec;
}

.form-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}
</style>
