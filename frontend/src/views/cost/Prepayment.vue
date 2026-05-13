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
      <el-button type="primary" @click="handleBatchPayment" :disabled="selectedRows.length === 0">
        <el-icon><Money /></el-icon>
        批量付款
      </el-button>
      <el-button type="success" @click="handleBatchBindInvoice" :disabled="selectedRows.length === 0">
        <el-icon><Document /></el-icon>
        批量关联发票
      </el-button>
      <el-button type="info" @click="handleAgingAnalysis">
        <el-icon><DataAnalysis /></el-icon>
        账龄分析
      </el-button>
    </div>

    <!-- 状态 Tab 导航 -->
    <div class="status-tabs">
      <el-radio-group v-model="activeStatusTab" @change="handleStatusTabChange">
        <el-radio-button value="all">全部</el-radio-button>
        <el-radio-button value="draft">草稿</el-radio-button>
        <el-radio-button value="pending">待审核</el-radio-button>
        <el-radio-button value="approved">待付款</el-radio-button>
        <el-radio-button value="invoiced">待关联发票</el-radio-button>
        <el-radio-button value="partial_writeoff">待核销</el-radio-button>
        <el-radio-button value="written_off">已核销</el-radio-button>
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
        <el-table-column prop="prepaymentNo" label="预付款单号" min-width="160" sortable fixed />
        <el-table-column prop="supplierName" label="供应商名称" min-width="180" fixed>
          <template #default="scope">
            <el-link type="primary" @click.stop="handleViewSupplier(scope.row.supplierId)">
              {{ scope.row.supplierName }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="supplierAccount" label="供应商账号" min-width="130" />
        <el-table-column prop="prepaymentCompany" label="预付款公司" min-width="120" />
        <el-table-column prop="warehouseCode" label="仓库代码" min-width="100" />
        <el-table-column prop="businessRefNo" label="业务参考编号" min-width="140" />
        <el-table-column prop="rateSheetNo" label="费率单编号" min-width="140" />
        <el-table-column prop="billNo" label="提单号" min-width="140" />
        <el-table-column prop="expenseItem" label="费用项目" min-width="100" />
        <el-table-column prop="currency" label="币种" width="80" />
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
        <el-table-column prop="applyDate" label="申请日期" width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.applyDate) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
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
          :page-sizes="[100, 300, 500, 1000]"
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
          <!-- 基本信息 -->
          <div class="form-section-title">基本信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="预付款单号">
                {{ bindInvoiceForm.prepaymentNo }}
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="供应商">
                {{ bindInvoiceForm.supplierName }}
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="预付款公司">
                {{ bindInvoiceForm.prepaymentCompany }}
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="预付金额">
                <span class="text-primary">¥{{ formatMoney(bindInvoiceForm.prepaymentAmount) }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-divider />
          <!-- 发票信息 -->
          <div class="form-section-title">发票信息</div>
          <el-form-item label="选择发票" required>
            <el-select
              v-model="bindInvoiceForm.selectedInvoice"
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
          <el-form-item label="关联总金额">
            <span class="text-primary">¥{{ formatMoney(bindInvoiceForm.bindAmount) }}</span>
          </el-form-item>
          <el-divider />
          <el-form-item label="备注">
            <el-input v-model="bindInvoiceForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
          <!-- 基本信息 -->
          <div class="form-section-title">基本信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="预付款单号">
                {{ writeoffForm.prepaymentNo }}
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="供应商">
                {{ writeoffForm.supplierName }}
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="预付款公司">
                {{ writeoffForm.prepaymentCompany }}
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="费用项目">
                {{ writeoffForm.expenseItem }}
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="预付金额">
                <span class="text-primary">¥{{ formatMoney(writeoffForm.prepaymentAmount) }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-divider />
          <!-- 核销信息 -->
          <div class="form-section-title">核销信息</div>
          <el-form-item label="选择费率单" required>
            <el-select
              v-model="writeoffForm.selectedRateSheet"
              filterable
              placeholder="请选择费率单"
              style="width: 100%"
              @change="handleWriteoffRateSheetChange"
            >
              <el-option
                v-for="item in writeoffRateSheetList"
                :key="item.rateSheetNo"
                :label="item.rateSheetNo"
                :value="item.rateSheetNo"
              />
            </el-select>
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="业务参考编号">
                <el-input v-model="writeoffForm.businessRefNo" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="收入项目">
                <el-select
                  v-model="writeoffForm.incomeItem"
                  placeholder="请选择收入项目"
                  style="width: 100%"
                  clearable
                >
                  <el-option
                    v-for="item in incomeItemOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="备注">
            <el-input v-model="writeoffForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
            {{ selectedRows.length }} 条预付款单
          </el-form-item>
          <el-form-item label="预付总金额">
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
          <el-form-item label="银行账号">
            <el-select v-model="batchPaymentForm.bankAccountId" placeholder="请选择" style="width: 100%">
              <el-option
                v-for="bank in bankAccounts"
                :key="bank.id"
                :label="`${bank.bankName} ${bank.accountNo}`"
                :value="bank.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="银行流水">
            <el-input v-model="batchPaymentForm.transactionNo" placeholder="请输入银行流水" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="batchPaymentForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
          </el-form-item>
          <el-divider />
          <el-form-item label="附件上传">
            <el-upload
              action="#"
              :auto-upload="false"
              :file-list="batchPaymentForm.fileList"
              :on-change="handleBatchPaymentFileChange"
              :on-remove="handleBatchPaymentFileRemove"
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
            {{ selectedRows.length }} 条预付款单
          </el-form-item>
          <el-form-item label="预付总金额">
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

    <!-- 审核弹窗 -->
    <el-dialog
      v-model="showAudit"
      title="审核预付款"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="audit-form">
        <el-form :model="auditForm" label-width="100px">
          <el-form-item label="预付款单号">
            {{ auditForm.prepaymentNo }}
          </el-form-item>
          <el-form-item label="供应商">
            {{ auditForm.supplierName }}
          </el-form-item>
          <el-form-item label="预付金额">
            <span class="text-primary">¥{{ formatMoney(auditForm.prepaymentAmount) }}</span>
          </el-form-item>
          <el-form-item label="审核操作" required>
            <el-radio-group v-model="auditForm.action">
              <el-radio label="approve">通过</el-radio>
              <el-radio label="reject">驳回</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="auditForm.remark" type="textarea" :rows="3" placeholder="请输入审核备注" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showAudit = false">取消</el-button>
        <el-button type="primary" @click="confirmAudit" :loading="auditLoading">确认</el-button>
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
          <!-- 基本信息 -->
          <div class="form-section-title">基本信息</div>
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
              <el-form-item label="预付款公司">
                {{ paymentForm.prepaymentCompany }}
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="预付金额">
                <span class="text-primary">¥{{ formatMoney(paymentForm.prepaymentAmount) }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-divider />
          <!-- 付款信息 -->
          <div class="form-section-title">付款信息</div>
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
              <el-form-item label="银行账号">
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
              <el-form-item label="银行流水">
                <el-input v-model="paymentForm.transactionNo" placeholder="请输入银行流水" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="备注">
                <el-input v-model="paymentForm.remark" placeholder="请输入备注" />
              </el-form-item>
            </el-col>
          </el-row>
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
import { Search, Refresh, Plus, Download, Check, DataAnalysis, WarningFilled, ArrowDown, Money, Document } from '@element-plus/icons-vue'
import PrepaymentDetail from './PrepaymentDetail.vue'

const router = useRouter()
const loading = ref(false)
const selectedRows = ref<any[]>([])
const showDetail = ref(false)
const activeStatusTab = ref('all')
const filteredTableData = ref<any[]>([])
const currentRow = ref<any>(null)
const showBindInvoice = ref(false)
const showWriteoff = ref(false)
const showAgingAnalysis = ref(false)
const showBatchAudit = ref(false)
const showAudit = ref(false)
const showPayment = ref(false)
const showBatchPayment = ref(false)
const showBatchBindInvoice = ref(false)
const bindLoading = ref(false)
const writeoffLoading = ref(false)
const batchAuditLoading = ref(false)
const auditLoading = ref(false)
const paymentLoading = ref(false)
const batchPaymentLoading = ref(false)
const batchBindInvoiceLoading = ref(false)

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
  pendingCount: 2,
  pendingAmount: 170000.00,
  approvedCount: 2,
  approvedAmount: 235000.00,
  waitWriteoffCount: 2,
  waitWriteoffAmount: 160000.00,
  writtenOffCount: 2,
  writtenOffAmount: 410000.00,
  overdueCount: 2,
  overdueAmount: 235000.00,
  totalCount: 12,
  totalAmount: 1295000.00
})

// 表格数据 - 每个预付款状态2条数据
const tableData = ref([
  // 草稿状态 (draft) - 2条
  {
    id: 1,
    prepaymentNo: 'YF2026050001',
    businessRefNo: 'PO2026050001',
    rateSheetNo: 'FL2026050001',
    billNo: 'BL2026050001',
    supplierId: 1,
    supplierName: '深圳硬件供应商A公司',
    supplierAccount: '75512345678',
    prepaymentCompany: '总部',
    warehouseCode: 'WH001',
    expenseItem: '仓储费',
    currency: 'CNY',
    prepaymentAmount: 150000.00,
    paidAmount: 0.00,
    invoicedAmount: 0.00,
    writtenOffAmount: 0.00,
    balanceAmount: 150000.00,
    prepaymentStatus: 'draft',
    invoiceStatus: 'unbinded',
    writeoffStatus: 'unwritten_off',
    applyDate: '2026-05-08 10:30:45',
    expectedPaymentDate: '2026-05-13',
    paymentDate: '',
    agingDays: 3,
    overdueDays: 0,
    applicant: '张三'
  },
  {
    id: 2,
    prepaymentNo: 'YF2026050002',
    businessRefNo: 'PO2026050002',
    rateSheetNo: 'FL2026050002',
    billNo: 'BL2026050002',
    supplierId: 3,
    supplierName: '上海软件C公司',
    supplierAccount: '62220811111',
    prepaymentCompany: '上海分公司',
    warehouseCode: 'WH003',
    expenseItem: '搬运费',
    currency: 'CNY',
    prepaymentAmount: 80000.00,
    paidAmount: 0.00,
    invoicedAmount: 0.00,
    writtenOffAmount: 0.00,
    balanceAmount: 80000.00,
    prepaymentStatus: 'draft',
    invoiceStatus: 'unbinded',
    writeoffStatus: 'unwritten_off',
    applyDate: '2026-05-09 14:22:30',
    expectedPaymentDate: '2026-05-14',
    paymentDate: '',
    agingDays: 2,
    overdueDays: 0,
    applicant: '王五'
  },
  // 待审核状态 (pending) - 2条
  {
    id: 3,
    prepaymentNo: 'YF2026050003',
    businessRefNo: 'PO2026050003',
    rateSheetNo: 'FL2026050003',
    billNo: 'BL2026050003',
    supplierId: 2,
    supplierName: '北京云服务B公司',
    supplierAccount: '62170012345',
    prepaymentCompany: '北京分公司',
    warehouseCode: 'WH002',
    expenseItem: '装卸费',
    currency: 'CNY',
    prepaymentAmount: 120000.00,
    paidAmount: 0.00,
    invoicedAmount: 0.00,
    writtenOffAmount: 0.00,
    balanceAmount: 120000.00,
    prepaymentStatus: 'pending',
    invoiceStatus: 'unbinded',
    writeoffStatus: 'unwritten_off',
    applyDate: '2026-05-06 09:15:20',
    expectedPaymentDate: '2026-05-11',
    paymentDate: '',
    agingDays: 5,
    overdueDays: 0,
    applicant: '李四'
  },
  {
    id: 4,
    prepaymentNo: 'YF2026050004',
    businessRefNo: 'PO2026050004',
    rateSheetNo: 'FL2026050004',
    billNo: 'BL2026050004',
    supplierId: 5,
    supplierName: '杭州装修E公司',
    supplierAccount: '62220822222',
    prepaymentCompany: '杭州分公司',
    warehouseCode: 'WH005',
    expenseItem: '换单费',
    currency: 'CNY',
    prepaymentAmount: 50000.00,
    paidAmount: 0.00,
    invoicedAmount: 0.00,
    writtenOffAmount: 0.00,
    balanceAmount: 50000.00,
    prepaymentStatus: 'pending',
    invoiceStatus: 'unbinded',
    writeoffStatus: 'unwritten_off',
    applyDate: '2026-05-07 11:30:15',
    expectedPaymentDate: '2026-05-12',
    paymentDate: '',
    agingDays: 4,
    overdueDays: 0,
    applicant: '孙七'
  },
  // 待付款状态 (approved) - 2条
  {
    id: 5,
    prepaymentNo: 'YF2026050005',
    businessRefNo: 'PO2026050005',
    rateSheetNo: 'FL2026050005',
    billNo: 'BL2026050005',
    supplierId: 4,
    supplierName: '广州物流D公司',
    supplierAccount: '62284812345',
    prepaymentCompany: '广州分公司',
    warehouseCode: 'WH004',
    expenseItem: '搬运费',
    currency: 'CNY',
    prepaymentAmount: 35000.00,
    paidAmount: 0.00,
    invoicedAmount: 0.00,
    writtenOffAmount: 0.00,
    balanceAmount: 35000.00,
    prepaymentStatus: 'approved',
    invoiceStatus: 'unbinded',
    writeoffStatus: 'unwritten_off',
    applyDate: '2026-05-03 16:45:00',
    expectedPaymentDate: '2026-05-08',
    paymentDate: '',
    agingDays: 8,
    overdueDays: 3,
    applicant: '赵六'
  },
  {
    id: 6,
    prepaymentNo: 'YF2026050006',
    businessRefNo: 'PO2026050006',
    rateSheetNo: 'FL2026050006',
    billNo: 'BL2026050006',
    supplierId: 1,
    supplierName: '深圳硬件供应商A公司',
    supplierAccount: '75512345678',
    prepaymentCompany: '总部',
    warehouseCode: 'WH001',
    expenseItem: '仓储费',
    currency: 'CNY',
    prepaymentAmount: 200000.00,
    paidAmount: 0.00,
    invoicedAmount: 0.00,
    writtenOffAmount: 0.00,
    balanceAmount: 200000.00,
    prepaymentStatus: 'approved',
    invoiceStatus: 'unbinded',
    writeoffStatus: 'unwritten_off',
    applyDate: '2026-05-02 08:20:10',
    expectedPaymentDate: '2026-05-07',
    paymentDate: '',
    agingDays: 9,
    overdueDays: 4,
    applicant: '张三'
  },
  // 待关联发票状态 (invoiced) - 2条
  {
    id: 7,
    prepaymentNo: 'YF2026050007',
    businessRefNo: 'PO2026050007',
    rateSheetNo: 'FL2026050007',
    billNo: 'BL2026050007',
    supplierId: 2,
    supplierName: '北京云服务B公司',
    supplierAccount: '62170012345',
    prepaymentCompany: '北京分公司',
    warehouseCode: 'WH002',
    expenseItem: '搬运费',
    currency: 'CNY',
    prepaymentAmount: 180000.00,
    paidAmount: 180000.00,
    invoicedAmount: 0.00,
    writtenOffAmount: 0.00,
    balanceAmount: 180000.00,
    prepaymentStatus: 'invoiced',
    invoiceStatus: 'unbinded',
    writeoffStatus: 'unwritten_off',
    applyDate: '2026-04-28 13:50:30',
    expectedPaymentDate: '2026-05-03',
    paymentDate: '2026-05-02',
    agingDays: 12,
    overdueDays: 0,
    applicant: '李四'
  },
  {
    id: 8,
    prepaymentNo: 'YF2026050008',
    businessRefNo: 'PO2026050008',
    rateSheetNo: 'FL2026050008',
    billNo: 'BL2026050008',
    supplierId: 3,
    supplierName: '上海软件C公司',
    supplierAccount: '62220811111',
    prepaymentCompany: '上海分公司',
    warehouseCode: 'WH003',
    expenseItem: '仓储费',
    currency: 'CNY',
    prepaymentAmount: 95000.00,
    paidAmount: 95000.00,
    invoicedAmount: 0.00,
    writtenOffAmount: 0.00,
    balanceAmount: 95000.00,
    prepaymentStatus: 'invoiced',
    invoiceStatus: 'unbinded',
    writeoffStatus: 'unwritten_off',
    applyDate: '2026-04-25 15:30:00',
    expectedPaymentDate: '2026-04-30',
    paymentDate: '2026-04-29',
    agingDays: 15,
    overdueDays: 0,
    applicant: '王五'
  },
  // 待核销状态 (partial_writeoff) - 2条
  {
    id: 9,
    prepaymentNo: 'YF2026050009',
    businessRefNo: 'PO2026050009',
    rateSheetNo: 'FL2026050009',
    billNo: 'BL2026050009',
    supplierId: 5,
    supplierName: '杭州装修E公司',
    supplierAccount: '62220822222',
    prepaymentCompany: '杭州分公司',
    warehouseCode: 'WH005',
    expenseItem: '港杂费',
    currency: 'CNY',
    prepaymentAmount: 100000.00,
    paidAmount: 100000.00,
    invoicedAmount: 60000.00,
    writtenOffAmount: 30000.00,
    balanceAmount: 70000.00,
    prepaymentStatus: 'partial_writeoff',
    invoiceStatus: 'partial',
    writeoffStatus: 'partial',
    applyDate: '2026-04-15 10:20:00',
    expectedPaymentDate: '2026-04-20',
    paymentDate: '2026-04-18',
    agingDays: 25,
    overdueDays: 0,
    applicant: '孙七'
  },
  {
    id: 10,
    prepaymentNo: 'YF2026050010',
    businessRefNo: 'PO2026050010',
    rateSheetNo: 'FL2026050010',
    billNo: 'BL2026050010',
    supplierId: 4,
    supplierName: '广州物流D公司',
    supplierAccount: '62284812345',
    prepaymentCompany: '广州分公司',
    warehouseCode: 'WH004',
    expenseItem: '搬运费',
    currency: 'CNY',
    prepaymentAmount: 60000.00,
    paidAmount: 60000.00,
    invoicedAmount: 40000.00,
    writtenOffAmount: 20000.00,
    balanceAmount: 40000.00,
    prepaymentStatus: 'partial_writeoff',
    invoiceStatus: 'partial',
    writeoffStatus: 'partial',
    applyDate: '2026-04-18 14:40:20',
    expectedPaymentDate: '2026-04-23',
    paymentDate: '2026-04-22',
    agingDays: 22,
    overdueDays: 0,
    applicant: '赵六'
  },
  // 已核销状态 (written_off) - 2条
  {
    id: 11,
    prepaymentNo: 'YF2026050011',
    businessRefNo: 'PO2026050011',
    rateSheetNo: 'FL2026050011',
    billNo: 'BL2026050011',
    supplierId: 1,
    supplierName: '深圳硬件供应商A公司',
    supplierAccount: '75512345678',
    prepaymentCompany: '总部',
    warehouseCode: 'WH001',
    expenseItem: '仓储费',
    currency: 'CNY',
    prepaymentAmount: 250000.00,
    paidAmount: 250000.00,
    invoicedAmount: 250000.00,
    writtenOffAmount: 250000.00,
    balanceAmount: 0.00,
    prepaymentStatus: 'written_off',
    invoiceStatus: 'binded',
    writeoffStatus: 'written_off',
    applyDate: '2026-03-20 09:30:00',
    expectedPaymentDate: '2026-03-25',
    paymentDate: '2026-03-24',
    agingDays: 0,
    overdueDays: 0,
    applicant: '张三'
  },
  {
    id: 12,
    prepaymentNo: 'YF2026050012',
    businessRefNo: 'PO2026050012',
    rateSheetNo: 'FL2026050012',
    billNo: 'BL2026050012',
    supplierId: 2,
    supplierName: '北京云服务B公司',
    supplierAccount: '62170012345',
    prepaymentCompany: '北京分公司',
    warehouseCode: 'WH002',
    expenseItem: '搬运费',
    currency: 'CNY',
    prepaymentAmount: 160000.00,
    paidAmount: 160000.00,
    invoicedAmount: 160000.00,
    writtenOffAmount: 160000.00,
    balanceAmount: 0.00,
    prepaymentStatus: 'written_off',
    invoiceStatus: 'binded',
    writeoffStatus: 'written_off',
    applyDate: '2026-03-15 11:20:30',
    expectedPaymentDate: '2026-03-20',
    paymentDate: '2026-03-19',
    agingDays: 0,
    overdueDays: 0,
    applicant: '李四'
  }
])

pagination.total = filteredTableData.value.length

// 绑定发票表单
const bindInvoiceForm = reactive({
  prepaymentId: null as number | null,
  prepaymentNo: '',
  supplierName: '',
  prepaymentCompany: '',
  prepaymentAmount: 0,
  selectedInvoice: null as number | null,
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
  prepaymentNo: '',
  supplierName: '',
  prepaymentCompany: '',
  prepaymentAmount: 0,
  expenseItem: '',
  selectedRateSheet: null as string | null,
  businessRefNo: '',
  incomeItem: '',
  remark: ''
})

// 收入项目选项
const incomeItemOptions = ref(['仓储费', '装卸费', '港杂费', '机场提货费', '换单费'])

// 核销可选费率单列表
const writeoffRateSheetList = ref([
  { rateSheetNo: 'FL2024040001', businessRefNo: 'PO2024040001', incomeItem: '仓储费' },
  { rateSheetNo: 'FL2024040002', businessRefNo: 'PO2024040002', incomeItem: '装卸费' },
  { rateSheetNo: 'FL2024040003', businessRefNo: 'PO2024040003', incomeItem: '港杂费' },
  { rateSheetNo: 'FL2024040004', businessRefNo: 'PO2024040004', incomeItem: '机场提货费' },
  { rateSheetNo: 'FL2024040005', businessRefNo: 'PO2024040005', incomeItem: '换单费' }
])

// 可选订单列表
const availableOrders = ref([
  { id: 1, orderNo: 'PO2024030001', amount: 30000.00 },
  { id: 2, orderNo: 'PO2024030002', amount: 25000.00 },
  { id: 3, orderNo: 'PO2024030003', amount: 15000.00 }
])

// 账龄分析数据
const agingData = reactive({
  within30Days: 475000.00,
  days31to60: 180000.00,
  days61to90: 0.00,
  over90Days: 0.00
})

const agingTableData = ref([
  { supplierName: '北京云服务B公司', prepaymentNo: 'YF2026050007', balanceAmount: 180000.00, agingDays: 12, agingLevel: '30天内', riskLevel: '低' },
  { supplierName: '广州物流D公司', prepaymentNo: 'YF2026050005', balanceAmount: 35000.00, agingDays: 11, agingLevel: '30天内', riskLevel: '低' }
])

// 批量审核表单
const batchAuditForm = reactive({
  action: 'approve',
  rejectReason: '',
  remark: ''
})

// 批量付款表单
const batchPaymentForm = reactive({
  totalAmount: 0,
  paymentMethod: '',
  bankAccountId: null as number | null,
  transactionNo: '',
  remark: '',
  fileList: [] as any[]
})

// 批量关联发票表单
const batchBindInvoiceForm = reactive({
  totalAmount: 0,
  selectedInvoice: null as number | null,
  bindAmount: 0,
  remark: ''
})

// 审核表单
const auditForm = reactive({
  prepaymentId: null as number | null,
  prepaymentNo: '',
  supplierName: '',
  prepaymentAmount: 0,
  action: 'approve' as 'approve' | 'reject',
  remark: ''
})

// 付款登记表单
const paymentForm = reactive({
  prepaymentId: null as number | null,
  prepaymentNo: '',
  supplierName: '',
  prepaymentCompany: '',
  prepaymentAmount: 0,
  balanceAmount: 0,
  paymentAmount: 0,
  paymentDate: '',
  paymentMethod: '',
  bankAccountId: null as number | null,
  transactionNo: '',
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

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 获取状态配置
const getStatusConfig = (status: string) => {
  const config: Record<string, { label: string, type: string }> = {
    'draft': { label: '草稿', type: 'info' },
    'pending': { label: '待审核', type: 'warning' },
    'approved': { label: '待付款', type: 'primary' },
    'invoiced': { label: '待关联发票', type: 'primary' },
    'partial_writeoff': { label: '待核销', type: 'warning' },
    'written_off': { label: '已核销', type: 'success' }
  }
  return config[status] || { label: status, type: 'info' }
}

// 获取发票状态类型
const getInvoiceStatusType = (row: any) => {
  if (row.invoicedAmount === 0) return 'info'
  if (row.invoicedAmount >= row.prepaymentAmount) return 'success'
  return 'warning'
}

// 获取核销状态类型
const getWriteoffStatusType = (row: any) => {
  if (row.writtenOffAmount === 0) return 'info'
  if (row.writtenOffAmount >= row.paidAmount) return 'success'
  return 'warning'
}

// 获取发票状态文本
const getInvoiceStatusText = (row: any) => {
  if (row.invoicedAmount === 0) return '未绑定'
  if (row.invoicedAmount >= row.prepaymentAmount) return '已全额'
  return '部分绑定'
}

// 获取核销状态文本
const getWriteoffStatusText = (row: any) => {
  if (row.writtenOffAmount === 0) return '未核销'
  if (row.writtenOffAmount >= row.paidAmount) return '已核销'
  return '部分核销'
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
const canBindInvoice = (row: any) => row.prepaymentStatus === 'invoiced' && row.balanceAmount > 0
const canWriteoff = (row: any) => row.prepaymentStatus === 'partial_writeoff' && row.balanceAmount > 0
const canAutoWriteoff = (row: any) => row.prepaymentStatus === 'invoiced' && row.balanceAmount > 0
const canTransfer = (row: any) => row.prepaymentStatus === 'invoiced' && row.balanceAmount > 0

// 过滤数据
const filterDataByStatus = () => {
  if (activeStatusTab.value === 'all') {
    filteredTableData.value = [...tableData.value]
  } else {
    filteredTableData.value = tableData.value.filter(
      item => item.prepaymentStatus === activeStatusTab.value
    )
  }
  pagination.total = filteredTableData.value.length
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
    await ElMessageBox.confirm('确定要提交该预付款申请审核吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    const item = tableData.value.find(t => t.id === row.id)
    if (item) {
      item.prepaymentStatus = 'pending'
    }
    ElMessage.success('提交成功')
    filterDataByStatus()
  } catch {}
}

// 更多操作
const handleMoreAction = (command: string, row: any) => {
  switch (command) {
    case 'cancel':
      handleCancel(row)
      break
    case 'audit':
      openAuditDialog(row)
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
    const item = tableData.value.find(t => t.id === row.id)
    if (item) {
      item.prepaymentStatus = 'cancelled'
    }
    ElMessage.success('作废成功')
    filterDataByStatus()
  } catch {}
}

// 打开审核弹窗
const openAuditDialog = (row: any) => {
  auditForm.prepaymentId = row.id
  auditForm.prepaymentNo = row.prepaymentNo
  auditForm.supplierName = row.supplierName
  auditForm.prepaymentAmount = row.prepaymentAmount
  auditForm.action = 'approve'
  auditForm.remark = ''
  showAudit.value = true
}

// 确认审核
const confirmAudit = async () => {
  auditLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const row = tableData.value.find(item => item.id === auditForm.prepaymentId)
    if (row) {
      row.prepaymentStatus = auditForm.action === 'approve' ? 'approved' : 'draft'
      ElMessage.success(auditForm.action === 'approve' ? '审核通过' : '已驳回')
      // 审核成功后直接更新当前Tab数据
      filterDataByStatus()
    }
    showAudit.value = false
  } catch {
    ElMessage.error('操作失败')
  } finally {
    auditLoading.value = false
  }
}

// 付款登记
const handlePayment = (row: any) => {
  paymentForm.prepaymentId = row.id
  paymentForm.prepaymentNo = row.prepaymentNo
  paymentForm.supplierName = row.supplierName
  paymentForm.prepaymentCompany = row.prepaymentCompany || ''
  paymentForm.prepaymentAmount = row.prepaymentAmount
  paymentForm.balanceAmount = row.balanceAmount
  paymentForm.paymentAmount = row.balanceAmount
  paymentForm.paymentDate = new Date().toISOString().split('T')[0]
  paymentForm.paymentMethod = ''
  paymentForm.bankAccountId = null
  paymentForm.transactionNo = ''
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
  if (paymentForm.paymentAmount <= 0) {
    ElMessage.warning('付款金额必须大于0')
    return
  }
  paymentLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 更新付款数据
    const item = tableData.value.find(t => t.id === paymentForm.prepaymentId)
    if (item) {
      item.paidAmount = paymentForm.paymentAmount
      item.paymentDate = paymentForm.paymentDate
      item.prepaymentStatus = 'invoiced'
    }
    ElMessage.success('付款登记成功')
    showPayment.value = false
    filterDataByStatus()
  } catch {
    ElMessage.error('付款登记失败')
  } finally {
    paymentLoading.value = false
  }
}

// 打开绑定发票弹窗
const openBindInvoice = (row: any) => {
  bindInvoiceForm.prepaymentId = row.id
  bindInvoiceForm.prepaymentNo = row.prepaymentNo
  bindInvoiceForm.supplierName = row.supplierName
  bindInvoiceForm.prepaymentCompany = row.prepaymentCompany || ''
  bindInvoiceForm.prepaymentAmount = row.prepaymentAmount
  bindInvoiceForm.selectedInvoice = null
  bindInvoiceForm.bindAmount = 0
  bindInvoiceForm.remark = ''
  showBindInvoice.value = true
}

// 发票选择变化
const handleInvoiceSelectChange = (selected: number | null) => {
  if (selected) {
    const invoice = availableInvoices.value.find(inv => inv.id === selected)
    bindInvoiceForm.bindAmount = invoice?.invoiceAmount || 0
  } else {
    bindInvoiceForm.bindAmount = 0
  }
}

// 确认绑定发票
const confirmBindInvoice = async () => {
  if (!bindInvoiceForm.selectedInvoice) {
    ElMessage.warning('请选择要绑定的发票')
    return
  }
  bindLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 更新绑定发票数据
    const item = tableData.value.find(t => t.id === bindInvoiceForm.prepaymentId)
    if (item) {
      item.invoicedAmount = bindInvoiceForm.bindAmount
      item.prepaymentStatus = 'partial_writeoff'
    }
    ElMessage.success('发票绑定成功')
    showBindInvoice.value = false
    filterDataByStatus()
  } catch {
    ElMessage.error('绑定失败')
  } finally {
    bindLoading.value = false
  }
}

// 打开核销弹窗
const openWriteoff = (row: any) => {
  writeoffForm.prepaymentId = row.id
  writeoffForm.prepaymentNo = row.prepaymentNo
  writeoffForm.supplierName = row.supplierName
  writeoffForm.prepaymentCompany = row.prepaymentCompany || ''
  writeoffForm.prepaymentAmount = row.prepaymentAmount
  writeoffForm.expenseItem = row.expenseItem || ''
  writeoffForm.selectedRateSheet = null
  writeoffForm.businessRefNo = ''
  writeoffForm.incomeItem = ''
  writeoffForm.remark = ''
  showWriteoff.value = true
}

// 核销选择费率单变化
const handleWriteoffRateSheetChange = (rateSheetNo: string) => {
  if (rateSheetNo) {
    const rateSheet = writeoffRateSheetList.value.find(item => item.rateSheetNo === rateSheetNo)
    if (rateSheet) {
      writeoffForm.businessRefNo = rateSheet.businessRefNo
    }
  } else {
    writeoffForm.businessRefNo = ''
  }
}

// 确认核销
const confirmWriteoff = async () => {
  if (!writeoffForm.selectedRateSheet) {
    ElMessage.warning('请选择费率单')
    return
  }
  writeoffLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 更新核销数据
    const item = tableData.value.find(t => t.id === writeoffForm.prepaymentId)
    if (item) {
      item.writtenOffAmount = (item.writtenOffAmount || 0) + item.prepaymentAmount
      item.balanceAmount = item.balanceAmount - item.prepaymentAmount
      // 如果余额为0或核销完成，状态变为已核销
      if (item.balanceAmount <= 0) {
        item.prepaymentStatus = 'written_off'
        item.balanceAmount = 0
      }
    }
    ElMessage.success('核销成功')
    showWriteoff.value = false
    filterDataByStatus()
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
  // 验证选中数据的预付款状态是否为待审核
  const invalidRows = selectedRows.value.filter(row => row.prepaymentStatus !== 'pending')
  if (invalidRows.length > 0) {
    ElMessage.warning('预付款状态不符合！')
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
    // 更新选中行的状态
    const newStatus = batchAuditForm.action === 'approve' ? 'approved' : 'draft'
    selectedRows.value.forEach(row => {
      const item = tableData.value.find(t => t.id === row.id)
      if (item) {
        item.prepaymentStatus = newStatus
      }
    })
    ElMessage.success(`批量${batchAuditForm.action === 'approve' ? '审核通过' : '驳回'}成功`)
    showBatchAudit.value = false
    // 批量审核成功后直接更新当前Tab数据
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
  // 验证选中数据的预付款状态是否为待付款
  const invalidRows = selectedRows.value.filter(row => row.prepaymentStatus !== 'approved')
  if (invalidRows.length > 0) {
    ElMessage.warning('预付款状态不符合！')
    return
  }
  // 计算选中记录的总付款金额
  const totalAmount = selectedRows.value.reduce((sum, row) => sum + (row.balanceAmount || row.prepaymentAmount), 0)
  batchPaymentForm.totalAmount = totalAmount
  batchPaymentForm.paymentMethod = ''
  batchPaymentForm.bankAccountId = null
  batchPaymentForm.transactionNo = ''
  batchPaymentForm.remark = ''
  batchPaymentForm.fileList = []
  showBatchPayment.value = true
}

// 确认批量付款
const confirmBatchPayment = async () => {
  if (!batchPaymentForm.paymentMethod) {
    ElMessage.warning('请选择付款方式')
    return
  }
  batchPaymentLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 更新选中行的状态为已付款
    const paymentTime = new Date().toISOString().replace('T', ' ').substring(0, 19)
    selectedRows.value.forEach(row => {
      const item = tableData.value.find(t => t.id === row.id)
      if (item) {
        item.prepaymentStatus = 'invoiced'
        item.paidAmount = item.balanceAmount || item.prepaymentAmount
        item.paymentDate = paymentTime
      }
    })
    ElMessage.success('批量付款成功')
    showBatchPayment.value = false
    // 批量付款成功后直接更新当前Tab数据
    filterDataByStatus()
    selectedRows.value = []
  } catch {
    ElMessage.error('操作失败')
  } finally {
    batchPaymentLoading.value = false
  }
}

// 批量付款文件变化
const handleBatchPaymentFileChange = (file: any, fileList: any) => {
  batchPaymentForm.fileList = fileList
}

// 批量付款文件删除
const handleBatchPaymentFileRemove = (file: any, fileList: any) => {
  batchPaymentForm.fileList = fileList
}

// 批量关联发票
const handleBatchBindInvoice = () => {
  // 验证选中数据的预付款状态是否为待关联发票
  const invalidRows = selectedRows.value.filter(row => row.prepaymentStatus !== 'invoiced')
  if (invalidRows.length > 0) {
    ElMessage.warning('预付款状态不符合！')
    return
  }
  // 计算选中记录的预付总金额
  const totalAmount = selectedRows.value.reduce((sum, row) => sum + (row.prepaymentAmount || 0), 0)
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
    // 更新选中行的发票绑定数据
    selectedRows.value.forEach(row => {
      const item = tableData.value.find(t => t.id === row.id)
      if (item) {
        item.invoicedAmount = batchBindInvoiceForm.bindAmount
        item.prepaymentStatus = 'partial_writeoff'
      }
    })
    ElMessage.success('批量关联发票成功')
    showBatchBindInvoice.value = false
    // 批量关联发票成功后直接更新当前Tab数据
    filterDataByStatus()
    selectedRows.value = []
  } catch {
    ElMessage.error('操作失败')
  } finally {
    batchBindInvoiceLoading.value = false
  }
}

// 关闭详情
const handleCloseDetail = () => {
  showDetail.value = false
  currentRow.value = null
}

onMounted(() => {
  filterDataByStatus()
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

.batch-payment-form {
  padding: 10px 0;
}

.batch-bind-invoice-form {
  padding: 10px 0;
}

.audit-form {
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

.form-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}
</style>
