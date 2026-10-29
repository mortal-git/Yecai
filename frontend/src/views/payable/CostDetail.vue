<template>
  <div class="cost-detail-container">
    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <el-row :gutter="16">
        <el-col :span="12">
          <div class="stat-card cost-card">
            <div class="stat-header">
              <span class="stat-title">成本不含税总金额</span>
            </div>
            <div class="stat-values">
              <span class="stat-value">¥{{ formatMoney(statData.costExTaxTotal) }}</span>
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="stat-card cost-card">
            <div class="stat-header">
              <span class="stat-title">成本含税总金额</span>
            </div>
            <div class="stat-values">
              <span class="stat-value">¥{{ formatMoney(statData.costIncTaxTotal) }}</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="search-panel">
      <el-form :model="searchForm" :inline="true" label-width="100px">
        <el-form-item label="客户名称">
          <el-select
            v-model="searchForm.customerId"
            placeholder="请选择客户"
            clearable
            filterable
            style="width: 220px"
          >
            <el-option
              v-for="c in customerList"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="仓库">
          <el-select v-model="searchForm.warehouseCode" placeholder="请选择仓库" clearable filterable style="width: 180px">
            <el-option v-for="w in warehouseList" :key="w.code" :label="w.name" :value="w.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="供应商">
          <el-select v-model="searchForm.supplierId" placeholder="请选择供应商" clearable filterable style="width: 220px">
            <el-option v-for="s in supplierList" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="业务模式">
          <el-select v-model="searchForm.businessMode" placeholder="请选择" clearable style="width: 150px">
            <el-option label="FOB" value="fob" />
            <el-option label="CIF" value="cif" />
            <el-option label="DDP" value="ddp" />
            <el-option label="EXW" value="exw" />
          </el-select>
        </el-form-item>
        <el-form-item label="业务参考编号">
          <el-input v-model="searchForm.businessRefNo" placeholder="请输入" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.orderStatus" placeholder="请选择" clearable style="width: 140px">
            <el-option label="已完成" value="已完成" />
            <el-option label="进行中" value="进行中" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单新建时间">
          <el-date-picker
            v-model="searchForm.orderCreateTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="订单完成时间">
          <el-date-picker
            v-model="searchForm.orderFinishTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="流转单编号">
          <el-input v-model="searchForm.flowSheetNo" placeholder="请输入" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="客户指令号">
          <el-input v-model="searchForm.customerCmdNo" placeholder="请输入" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="总运单号">
          <el-input v-model="searchForm.masterBillNo" placeholder="请输入" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="分运单号">
          <el-input v-model="searchForm.houseBillNo" placeholder="请输入" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="费率单编号">
          <el-input v-model="searchForm.rateSheetNo" placeholder="请输入" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="费率单成本状态">
          <el-select v-model="searchForm.rateSheetCostStatus" placeholder="请选择" clearable style="width: 140px">
            <el-option label="已确认" value="已确认" />
            <el-option label="待确认" value="待确认" />
          </el-select>
        </el-form-item>
        <el-form-item label="计费单据">
          <el-select v-model="searchForm.billingDoc" placeholder="请选择" clearable style="width: 140px">
            <el-option label="应收单" value="应收单" />
            <el-option label="应付单" value="应付单" />
            <el-option label="调整单" value="调整单" />
          </el-select>
        </el-form-item>
        <el-form-item label="费率单类型">
          <el-select v-model="searchForm.rateSheetType" placeholder="请选择" clearable style="width: 140px">
            <el-option label="标准费率" value="标准费率" />
            <el-option label="特殊费率" value="特殊费率" />
            <el-option label="协议费率" value="协议费率" />
          </el-select>
        </el-form-item>
        <el-form-item label="费率单创建时间">
          <el-date-picker
            v-model="searchForm.rateSheetCreateTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="成本项目">
          <el-input v-model="searchForm.costItem" placeholder="请输入" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="产品标准名L3">
          <el-select v-model="searchForm.productL3" placeholder="请选择" clearable filterable style="width: 180px">
            <el-option v-for="item in productL3List" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="成本项目对账状态">
          <el-select v-model="searchForm.costReconcileStatus" placeholder="请选择" clearable style="width: 160px">
            <el-option label="已对账" value="已对账" />
            <el-option label="待对账" value="待对账" />
            <el-option label="部分对账" value="部分对账" />
          </el-select>
        </el-form-item>
        <el-form-item label="结算单位">
          <el-select v-model="searchForm.settlementUnit" placeholder="请选择" clearable filterable style="width: 180px">
            <el-option v-for="item in settlementUnitList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
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
      <el-button @click="handleExport" :disabled="selectedRows.length === 0">
        <el-icon><Download /></el-icon>
        导出
      </el-button>
      <el-button type="primary" @click="handleGenerateStatement" :disabled="selectedRows.length === 0">
        <el-icon><Document /></el-icon>
        生成对账单
      </el-button>
      <el-button @click="handleCustomFields">
        <el-icon><Setting /></el-icon>
        自定义字段
      </el-button>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <el-table
        ref="tableRef"
        :data="tableData"
        border
        stripe
        v-loading="loading"
        @selection-change="handleSelectionChange"
        :row-class-name="getRowClassName"
      >
        <el-table-column type="selection" width="50" fixed />
        <el-table-column v-if="visibleColumns.rateSheetNo" prop="rateSheetNo" label="费率单编号" min-width="150" fixed />
        <el-table-column v-if="visibleColumns.rateSheetSource" prop="rateSheetSource" label="费率单创建来源" min-width="120" />
        <el-table-column v-if="visibleColumns.rateSheetCreateTime" prop="rateSheetCreateTime" label="费率单创建时间" min-width="160" />
        <el-table-column v-if="visibleColumns.businessRefNo" prop="businessRefNo" label="业务参考编号" min-width="150" />
        <el-table-column v-if="visibleColumns.billingDoc" prop="billingDoc" label="计费单据" min-width="120" />
        <el-table-column v-if="visibleColumns.customerCmdNo" prop="customerCmdNo" label="客户指令号" min-width="130" />
        <el-table-column v-if="visibleColumns.masterBillNo" prop="masterBillNo" label="总运单号" min-width="140" />
        <el-table-column v-if="visibleColumns.houseBillNo" prop="houseBillNo" label="分运单号" min-width="140" />
        <el-table-column v-if="visibleColumns.costExTaxTotal" prop="costExTaxTotal" label="成本不含税总金额" min-width="150" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.costExTaxTotal) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.costIncTaxTotal" prop="costIncTaxTotal" label="成本含税总金额" min-width="150" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.costIncTaxTotal) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.billingDocNo" prop="billingDocNo" label="计费单据编号" min-width="150" />
        <el-table-column v-if="visibleColumns.customerName" prop="customerName" label="客户名称" min-width="160" />
        <el-table-column v-if="visibleColumns.warehouse" prop="warehouse" label="仓库" min-width="100" />
        <el-table-column v-if="visibleColumns.businessMode" prop="businessMode" label="业务模式" min-width="80">
          <template #default="{ row }">{{ getBusinessModeText(row.businessMode) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.rateSheetType" prop="rateSheetType" label="费率单类型" min-width="100" />
        <el-table-column v-if="visibleColumns.orderCreateTime" prop="orderCreateTime" label="订单新建时间" min-width="160" />
        <el-table-column v-if="visibleColumns.orderFinishTime" prop="orderFinishTime" label="订单完成时间" min-width="160" />
        <el-table-column v-if="visibleColumns.orderStatus" prop="orderStatus" label="订单状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getOrderStatusType(row.orderStatus)" size="small">{{ row.orderStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.isSettled" prop="isSettled" label="是否结算订单" min-width="110">
          <template #default="{ row }">{{ row.isSettled === 'yes' ? '是' : '否' }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.customerQuoteNo" prop="customerQuoteNo" label="客户报价单编号" min-width="150" />
        <el-table-column v-if="visibleColumns.businessNo" prop="businessNo" label="业务编号" min-width="120" />
        <el-table-column v-if="visibleColumns.flowSheetNo" prop="flowSheetNo" label="流转单编号" min-width="120" />
        <el-table-column v-if="visibleColumns.rateSheetCostStatus" prop="rateSheetCostStatus" label="费率单成本状态" min-width="120">
          <template #default="{ row }">
            <el-tag :type="getCostStatusType(row.rateSheetCostStatus)" size="small">{{ row.rateSheetCostStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.rateSheetCostConfirmTime" prop="rateSheetCostConfirmTime" label="费率单成本确认时间" min-width="160" />
        <el-table-column v-if="visibleColumns.approvalStatus" prop="approvalStatus" label="修改审批状态" min-width="110">
          <template #default="{ row }">
            <el-tag :type="getApprovalStatusType(row.approvalStatus)" size="small">{{ row.approvalStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.docId" prop="docId" label="单据ID" min-width="100" />
        <el-table-column v-if="visibleColumns.supplier" prop="supplier" label="供应商" min-width="160" />
        <el-table-column v-if="visibleColumns.settlementUnit" prop="settlementUnit" label="结算单位" min-width="150" />
        <el-table-column v-if="visibleColumns.costItem" prop="costItem" label="成本项目" min-width="100" />
        <el-table-column v-if="visibleColumns.productL1" prop="productL1" label="产品标准名L1" min-width="120" />
        <el-table-column v-if="visibleColumns.productL2" prop="productL2" label="产品标准名L2" min-width="120" />
        <el-table-column v-if="visibleColumns.productL3" prop="productL3" label="产品标准名L3" min-width="120" />
        <el-table-column v-if="visibleColumns.currency" prop="currency" label="币种" min-width="80" />
        <el-table-column v-if="visibleColumns.exTaxAmount" prop="exTaxAmount" label="不含税金额" min-width="130" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.exTaxAmount) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.taxRate" prop="taxRate" label="税率" min-width="80" align="right">
          <template #default="{ row }">{{ row.taxRate }}%</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.taxAmount" prop="taxAmount" label="税额" min-width="120" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.taxAmount) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.incTaxAmount" prop="incTaxAmount" label="含税金额" min-width="130" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.incTaxAmount) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.exchangeRate" prop="exchangeRate" label="汇率" min-width="80" align="right" />
        <el-table-column v-if="visibleColumns.exTaxAmountCny" prop="exTaxAmountCny" label="不含税(折合CNY)" min-width="150" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.exTaxAmountCny) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.incTaxAmountCny" prop="incTaxAmountCny" label="含税(折合CNY)" min-width="150" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.incTaxAmountCny) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.customerService" prop="customerService" label="客服" min-width="80" />
        <el-table-column v-if="visibleColumns.remark" prop="remark" label="备注" min-width="150" />
        <el-table-column v-if="visibleColumns.reconcileStatus" prop="reconcileStatus" label="对账状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getReconcileStatusType(row.reconcileStatus)" size="small">{{ row.reconcileStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.creator" prop="creator" label="创建人" min-width="100" />
        <el-table-column v-if="visibleColumns.createTime" prop="createTime" label="创建时间" min-width="160" />
        <el-table-column v-if="visibleColumns.updater" prop="updater" label="修改人" min-width="100" />
        <el-table-column v-if="visibleColumns.updateTime" prop="updateTime" label="修改时间" min-width="160" />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[20, 50, 100, 200]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 自定义字段弹窗 -->
    <el-dialog v-model="showCustomFieldDialog" title="自定义字段" width="700px">
      <div class="custom-field-content">
        <p class="tip-text">勾选要显示的字段</p>
        <el-scrollbar height="400px">
          <div class="field-list">
            <el-checkbox v-for="field in allFields" :key="field.key" v-model="selectedFields" :value="field.key" :label="field.key" class="field-checkbox-item">
              {{ field.label }}
            </el-checkbox>
          </div>
        </el-scrollbar>
        <div class="field-actions">
          <el-button size="small" @click="handleResetFields">恢复默认</el-button>
        </div>
      </div>
      <template #footer>
        <el-button @click="showCustomFieldDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmFields">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Download, Setting, Document } from '@element-plus/icons-vue'
import { usePayableStatementStore } from '../../store/payableStatement'

const router = useRouter()
const payableStatementStore = usePayableStatementStore()

// 搜索表单
const searchForm = reactive({
  customerId: null as number | null,
  warehouseCode: '',
  supplierId: null as number | null,
  businessMode: '',
  businessRefNo: '',
  orderStatus: '',
  orderCreateTime: [] as string[],
  orderFinishTime: [] as string[],
  flowSheetNo: '',
  customerCmdNo: '',
  masterBillNo: '',
  houseBillNo: '',
  rateSheetNo: '',
  rateSheetCostStatus: '',
  billingDoc: '',
  rateSheetType: '',
  rateSheetCreateTime: [] as string[],
  costItem: '',
  productL3: '',
  costReconcileStatus: '',
  settlementUnit: ''
})

const loading = ref(false)

// 统计数据
const statData = computed(() => {
  const data = selectedRows.value.length > 0 ? selectedRows.value : tableData.value
  return {
    costIncTaxTotal: data.reduce((sum, item) => sum + (item.costIncTaxTotal || 0), 0),
    costExTaxTotal: data.reduce((sum, item) => sum + (item.costExTaxTotal || 0), 0)
  }
})

// 客户列表
const customerList = ref([
  { id: 1, name: '深圳市腾讯科技有限公司' },
  { id: 2, name: '阿里巴巴（中国）有限公司' },
  { id: 3, name: '字节跳动科技有限公司' },
  { id: 4, name: '华为技术有限公司' },
  { id: 5, name: '京东集团股份有限公司' }
])

// 仓库列表
const warehouseList = ref([
  { code: 'WH001', name: '深圳仓' },
  { code: 'WH002', name: '上海仓' },
  { code: 'WH003', name: '广州仓' },
  { code: 'WH004', name: '北京仓' },
  { code: 'WH005', name: '杭州仓' }
])

// 供应商列表
const supplierList = ref([
  { id: 1, name: '上海中远海运集装箱运输有限公司' },
  { id: 2, name: '深圳盐田国际集装箱码头有限公司' },
  { id: 3, name: '北京华贸物流股份有限公司' },
  { id: 4, name: '广州白云国际机场物流有限公司' },
  { id: 5, name: '中外运冷链物流有限公司' }
])

// 产品标准名L3列表
const productL3List = ref([
  { value: '海运运输', label: '海运运输' },
  { value: '出口报关', label: '出口报关' },
  { value: '货物运输保险', label: '货物运输保险' },
  { value: '普通仓储', label: '普通仓储' },
  { value: '恒温仓储', label: '恒温仓储' },
  { value: '同城配送', label: '同城配送' },
  { value: '航空运输', label: '航空运输' },
  { value: '进口报关', label: '进口报关' }
])

// 结算单位列表
const settlementUnitList = ref([
  { value: '深圳分公司', label: '深圳分公司' },
  { value: '上海分公司', label: '上海分公司' },
  { value: '广州分公司', label: '广州分公司' },
  { value: '北京分公司', label: '北京分公司' },
  { value: '杭州分公司', label: '杭州分公司' }
])

// 所有字段定义（按显示顺序）
const allFields = [
  { key: 'rateSheetNo', label: '费率单编号' },
  { key: 'rateSheetSource', label: '费率单创建来源' },
  { key: 'rateSheetCreateTime', label: '费率单创建时间' },
  { key: 'businessRefNo', label: '业务参考编号' },
  { key: 'billingDoc', label: '计费单据' },
  { key: 'customerCmdNo', label: '客户指令号' },
  { key: 'masterBillNo', label: '总运单号' },
  { key: 'houseBillNo', label: '分运单号' },
  { key: 'costExTaxTotal', label: '成本不含税总金额' },
  { key: 'costIncTaxTotal', label: '成本含税总金额' },
  { key: 'billingDocNo', label: '计费单据编号' },
  { key: 'customerName', label: '客户名称' },
  { key: 'warehouse', label: '仓库' },
  { key: 'businessMode', label: '业务模式' },
  { key: 'rateSheetType', label: '费率单类型' },
  { key: 'orderCreateTime', label: '订单新建时间' },
  { key: 'orderFinishTime', label: '订单完成时间' },
  { key: 'orderStatus', label: '订单状态' },
  { key: 'isSettled', label: '是否结算订单' },
  { key: 'customerQuoteNo', label: '客户报价单编号' },
  { key: 'businessNo', label: '业务编号' },
  { key: 'flowSheetNo', label: '流转单编号' },
  { key: 'rateSheetCostStatus', label: '费率单成本状态' },
  { key: 'rateSheetCostConfirmTime', label: '费率单成本确认时间' },
  { key: 'approvalStatus', label: '修改审批状态' },
  { key: 'docId', label: '单据ID' },
  { key: 'supplier', label: '供应商' },
  { key: 'settlementUnit', label: '结算单位' },
  { key: 'costItem', label: '成本项目' },
  { key: 'productL1', label: '产品标准名L1' },
  { key: 'productL2', label: '产品标准名L2' },
  { key: 'productL3', label: '产品标准名L3' },
  { key: 'currency', label: '币种' },
  { key: 'exTaxAmount', label: '不含税金额' },
  { key: 'taxRate', label: '税率' },
  { key: 'taxAmount', label: '税额' },
  { key: 'incTaxAmount', label: '含税金额' },
  { key: 'exchangeRate', label: '汇率' },
  { key: 'exTaxAmountCny', label: '不含税(折合CNY)' },
  { key: 'incTaxAmountCny', label: '含税(折合CNY)' },
  { key: 'customerService', label: '客服' },
  { key: 'remark', label: '备注' },
  { key: 'reconcileStatus', label: '对账状态' },
  { key: 'creator', label: '创建人' },
  { key: 'createTime', label: '创建时间' },
  { key: 'updater', label: '修改人' },
  { key: 'updateTime', label: '修改时间' }
]

// 默认显示的字段顺序
const defaultFieldOrder = [
  'rateSheetNo', 'rateSheetSource', 'rateSheetCreateTime', 'businessRefNo', 'billingDoc',
  'customerCmdNo', 'masterBillNo', 'houseBillNo', 'costExTaxTotal', 'costIncTaxTotal',
  'billingDocNo', 'customerName', 'warehouse', 'businessMode', 'rateSheetType',
  'orderCreateTime', 'orderFinishTime', 'orderStatus', 'isSettled', 'customerQuoteNo',
  'businessNo', 'flowSheetNo', 'rateSheetCostStatus', 'rateSheetCostConfirmTime', 'approvalStatus',
  'docId', 'supplier', 'settlementUnit', 'costItem',
  'productL1', 'productL2', 'productL3', 'currency', 'exTaxAmount',
  'taxRate', 'taxAmount', 'incTaxAmount', 'exchangeRate', 'exTaxAmountCny',
  'incTaxAmountCny', 'customerService', 'remark', 'reconcileStatus',
  'creator', 'createTime', 'updater', 'updateTime'
]

// 可见字段（用于表格渲染）
const visibleColumns = reactive<Record<string, boolean>>(
  Object.fromEntries(allFields.map(f => [f.key, true]))
)

// 自定义字段弹窗
const showCustomFieldDialog = ref(false)
const selectedFields = ref<string[]>([...defaultFieldOrder])

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 选中行
const selectedRows = ref<any[]>([])
const tableRef = ref()

// 表格数据 - 示例数据
const tableData = ref([
  {
    rateSheetNo: 'FL2026050001',
    rateSheetSource: '系统创建',
    rateSheetCreateTime: '2026-05-01 10:30:00',
    businessRefNo: 'PO2026050001',
    billingDoc: '应付单',
    customerCmdNo: 'CMD2026050001',
    masterBillNo: 'MBL2026050001',
    houseBillNo: 'HBL2026050001',
    costExTaxTotal: 35000.00,
    costIncTaxTotal: 39550.00,
    billingDocNo: 'YD2026050001',
    customerName: '深圳市腾讯科技有限公司',
    warehouse: '深圳仓',
    businessMode: 'fob',
    rateSheetType: '标准费率',
    orderCreateTime: '2026-04-28 09:00:00',
    orderFinishTime: '2026-05-05 18:00:00',
    orderStatus: '已完成',
    isSettled: 'yes',
    customerQuoteNo: 'BJ2026050001',
    businessNo: 'YW2026050001',
    flowSheetNo: 'LZ2026050001',
    rateSheetCostStatus: '已确认',
    rateSheetCostConfirmTime: '2026-05-03 10:00:00',
    approvalStatus: '已通过',
    docId: 'RS001',
    supplier: '深圳盐田国际集装箱码头有限公司',
    costItem: '仓储费',
    productL1: '物流服务',
    productL2: '仓储服务',
    productL3: '仓储服务',
    currency: 'CNY',
    exTaxAmount: 50000.00,
    taxRate: 13,
    taxAmount: 6500.00,
    incTaxAmount: 56500.00,
    exchangeRate: 1.0,
    exTaxAmountCny: 50000.00,
    incTaxAmountCny: 56500.00,
    settlementUnit: '深圳分公司',
    customerService: '张三',
    remark: '',
    reconcileStatus: '已对账',
    creator: '张三',
    createTime: '2026-05-01 10:30:00',
    updater: '李四',
    updateTime: '2026-05-03 14:00:00'
  },
  {
    rateSheetNo: 'FL2026050002',
    rateSheetSource: '导入创建',
    rateSheetCreateTime: '2026-05-02 11:00:00',
    businessRefNo: 'PO2026050002',
    billingDoc: '应付单',
    customerCmdNo: 'CMD2026050002',
    masterBillNo: 'MBL2026050002',
    houseBillNo: 'HBL2026050002',
    costExTaxTotal: 55000.00,
    costIncTaxTotal: 62150.00,
    billingDocNo: 'YD2026050002',
    customerName: '阿里巴巴（中国）有限公司',
    warehouse: '上海仓',
    businessMode: 'cif',
    rateSheetType: '特殊费率',
    orderCreateTime: '2026-04-25 08:00:00',
    orderFinishTime: '2026-05-08 17:00:00',
    orderStatus: '进行中',
    isSettled: 'no',
    customerQuoteNo: 'BJ2026050002',
    businessNo: 'YW2026050002',
    flowSheetNo: 'LZ2026050002',
    rateSheetCostStatus: '待确认',
    rateSheetCostConfirmTime: '',
    approvalStatus: '待审批',
    docId: 'RS002',
    supplier: '上海中远海运集装箱运输有限公司',
    costItem: '运输费',
    productL1: '物流服务',
    productL2: '运输服务',
    productL3: '运输服务',
    currency: 'CNY',
    exTaxAmount: 80000.00,
    taxRate: 13,
    taxAmount: 10400.00,
    incTaxAmount: 90400.00,
    exchangeRate: 1.0,
    exTaxAmountCny: 80000.00,
    incTaxAmountCny: 90400.00,
    settlementUnit: '上海分公司',
    customerService: '李四',
    remark: '',
    reconcileStatus: '待对账',
    creator: '王五',
    createTime: '2026-05-02 11:00:00',
    updater: '',
    updateTime: ''
  }
])

pagination.total = tableData.value.length

// 格式化金额
const formatMoney = (value: number) => {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

// 获取业务模式文本
const getBusinessModeText = (mode: string) => {
  const map: Record<string, string> = { fob: 'FOB', cif: 'CIF', ddp: 'DDP', exw: 'EXW' }
  return map[mode] || mode
}

// 获取订单状态类型
const getOrderStatusType = (status: string) => {
  const map: Record<string, string> = { '已完成': 'success', '进行中': 'primary', '已取消': 'info' }
  return map[status] || 'info'
}

// 获取对账状态类型
const getReconcileStatusType = (status: string) => {
  const map: Record<string, string> = { '已对账': 'success', '待对账': 'warning' }
  return map[status] || 'info'
}

// 获取成本状态类型
const getCostStatusType = (status: string) => {
  const map: Record<string, string> = { '已确认': 'success', '待确认': 'warning' }
  return map[status] || 'info'
}

// 获取审批状态类型
const getApprovalStatusType = (status: string) => {
  const map: Record<string, string> = { '已通过': 'success', '待审批': 'warning', '已驳回': 'danger' }
  return map[status] || 'info'
}

// 获取行样式
const getRowClassName = ({ row }: any) => {
  if (row.orderStatus === '进行中') return 'row-warning'
  return ''
}

// 搜索
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询应付成本明细')
  }, 500)
  pagination.page = 1
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    customerId: null,
    warehouseCode: '',
    supplierId: null,
    businessMode: '',
    businessRefNo: '',
    orderStatus: '',
    orderCreateTime: [],
    orderFinishTime: [],
    flowSheetNo: '',
    customerCmdNo: '',
    masterBillNo: '',
    houseBillNo: '',
    rateSheetNo: '',
    rateSheetCostStatus: '',
    billingDoc: '',
    rateSheetType: '',
    rateSheetCreateTime: [],
    costItem: '',
    productL3: '',
    costReconcileStatus: '',
    settlementUnit: ''
  })
  ElMessage.info('已重置搜索条件')
}

// 导出
const handleExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  ElMessage.success(`导出 ${selectedRows.value.length} 条数据`)
}

// 生成对账单
const handleGenerateStatement = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要生成对账单的数据')
    return
  }
  // 暂存选中行到应付对账单 store，跳转新建页
  payableStatementStore.setSelectedCostRows(selectedRows.value.map(r => ({
    rateSheetNo: r.rateSheetNo,
    customerName: r.customerName,
    businessRefNo: r.businessRefNo,
    billingDoc: r.billingDoc,
    costItem: r.costItem,
    productL1: r.productL1,
    productL2: r.productL2,
    productL3: r.productL3,
    currency: r.currency,
    exTaxAmount: r.exTaxAmount,
    taxRate: r.taxRate,
    taxAmount: r.taxAmount,
    incTaxAmount: r.incTaxAmount,
    exchangeRate: r.exchangeRate,
    exTaxAmountCny: r.exTaxAmountCny,
    incTaxAmountCny: r.incTaxAmountCny,
    customerService: r.customerService,
    supplier: r.supplier,
    settlementUnit: r.settlementUnit
  })))
  router.push('/statement/payable/create')
  ElMessage.success(`已带入 ${selectedRows.value.length} 条成本明细，正在跳转新建对账单`)
}

// 自定义字段
const handleCustomFields = () => {
  selectedFields.value = [...defaultFieldOrder]
  showCustomFieldDialog.value = true
}

// 确认字段设置
const handleConfirmFields = () => {
  Object.keys(visibleColumns).forEach(key => {
    visibleColumns[key] = selectedFields.value.includes(key)
  })
  showCustomFieldDialog.value = false
  ElMessage.success('字段设置已保存')
}

// 恢复默认
const handleResetFields = () => {
  selectedFields.value = [...defaultFieldOrder]
}

// 选择变化
const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows
}

// 分页变化
const handlePageChange = () => {
  // 实际项目中这里会重新请求数据
}
</script>

<style scoped>
.cost-detail-container {
  padding: 0;
}

.statistics-cards {
  padding: 0 16px 16px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.stat-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.stat-values {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.revenue-card .stat-value {
  color: #409eff;
}

.cost-card .stat-value {
  color: #f56c6c;
}

.profit-card .stat-value {
  color: #67c23a;
}

.search-panel {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.action-bar {
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
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

.custom-field-content {
  padding: 10px 0;
}

.tip-text {
  color: #909399;
  font-size: 14px;
  margin-bottom: 16px;
}

.field-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 0 10px;
}

.field-checkbox-item {
  width: 150px;
  margin-bottom: 8px;
}

.field-actions {
  display: flex;
  align-items: center;
  padding: 16px 10px 0;
  border-top: 1px solid #eee;
  margin-top: 16px;
}

:deep(.el-table .cell) {
  white-space: nowrap;
}

:deep(.row-warning) {
  background-color: #fdf6ec;
}
</style>
