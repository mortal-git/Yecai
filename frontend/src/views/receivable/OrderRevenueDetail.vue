<template>
  <div class="order-revenue-detail-container">
    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <el-row :gutter="16">
        <el-col :span="8">
          <div class="stat-card revenue-card">
            <div class="stat-header">
              <span class="stat-title">收入</span>
            </div>
            <div class="stat-values">
              <div class="stat-item">
                <span class="stat-label">收入含税总金额</span>
                <span class="stat-value">¥{{ formatMoney(statData.revenueIncTaxTotal) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">收入不含税总金额</span>
                <span class="stat-value">¥{{ formatMoney(statData.revenueExTaxTotal) }}</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card cost-card">
            <div class="stat-header">
              <span class="stat-title">成本</span>
            </div>
            <div class="stat-values">
              <div class="stat-item">
                <span class="stat-label">成本含税总金额</span>
                <span class="stat-value">¥{{ formatMoney(statData.costIncTaxTotal) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">成本不含税总金额</span>
                <span class="stat-value">¥{{ formatMoney(statData.costExTaxTotal) }}</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card profit-card">
            <div class="stat-header">
              <span class="stat-title">毛利</span>
            </div>
            <div class="stat-values">
              <div class="stat-item">
                <span class="stat-label">毛利含税总金额</span>
                <span class="stat-value">¥{{ formatMoney(statData.profitIncTaxTotal) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">毛利不含税总金额</span>
                <span class="stat-value">¥{{ formatMoney(statData.profitExTaxTotal) }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="search-panel">
      <el-form :model="searchForm" :inline="true" label-width="110px">
        <el-form-item label="客户名称" required>
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
        <el-form-item label="业务模式">
          <el-select v-model="searchForm.businessMode" placeholder="请选择" clearable style="width: 150px">
            <el-option label="FOB" value="fob" />
            <el-option label="CIF" value="cif" />
            <el-option label="DDP" value="ddp" />
            <el-option label="EXW" value="exw" />
          </el-select>
        </el-form-item>
        <el-form-item label="业务参考编号">
          <el-input v-model="searchForm.businessRefNo" type="textarea" :rows="2" placeholder="支持多行" style="width: 200px" />
        </el-form-item>
        <el-form-item label="是否结算订单">
          <el-select v-model="searchForm.isSettled" placeholder="请选择" clearable style="width: 140px">
            <el-option label="是" value="yes" />
            <el-option label="否" value="no" />
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
        <el-form-item label="客户指令号">
          <el-input v-model="searchForm.customerCmdNo" placeholder="请输入" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="总运单">
          <el-input v-model="searchForm.masterBillNo" placeholder="请输入" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="分运单">
          <el-input v-model="searchForm.houseBillNo" placeholder="请输入" clearable style="width: 160px" />
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
      <el-button type="success" @click="handleExport" :disabled="selectedRows.length === 0">
        <el-icon><Download /></el-icon>
        导出
      </el-button>
      <el-button type="warning" @click="handleSplitAllocation" :disabled="selectedRows.length === 0 && !hasSearched">
        <el-icon><Operation /></el-icon>
        拆单均摊
      </el-button>
      <el-button type="info" @click="handleCustomFields">
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
      >
        <el-table-column type="selection" width="50" fixed />
        <el-table-column v-if="visibleColumns.businessRefNo" prop="businessRefNo" label="业务参考编号" min-width="150" fixed />
        <el-table-column v-if="visibleColumns.customerName" prop="customerName" label="客户名称" min-width="160" />
        <el-table-column v-if="visibleColumns.billingEntity" prop="billingEntity" label="账单主体" min-width="150" />
        <el-table-column v-if="visibleColumns.customerCmdNo" prop="customerCmdNo" label="客户指令号" min-width="130" />
        <el-table-column v-if="visibleColumns.masterBillNo" prop="masterBillNo" label="总运单号" min-width="140" />
        <el-table-column v-if="visibleColumns.houseBillNo" prop="houseBillNo" label="分运单号" min-width="140" />
        <el-table-column v-if="visibleColumns.warehouse" prop="warehouse" label="仓库" min-width="100" />
        <el-table-column v-if="visibleColumns.businessMode" prop="businessMode" label="业务模式" min-width="80">
          <template #default="{ row }">{{ getBusinessModeText(row.businessMode) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.businessNo" prop="businessNo" label="业务编号" min-width="120" />
        <el-table-column v-if="visibleColumns.flowSheetNo" prop="flowSheetNo" label="流转单编号" min-width="120" />
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
        <el-table-column v-if="visibleColumns.revenueExTaxTotal" prop="revenueExTaxTotal" label="收入不含税总金额" min-width="150" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.revenueExTaxTotal) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.costExTaxTotal" prop="costExTaxTotal" label="成本不含税总金额" min-width="150" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.costExTaxTotal) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.profitExTaxTotal" prop="profitExTaxTotal" label="毛利不含税总金额" min-width="150" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.profitExTaxTotal) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.revenueIncTaxTotal" prop="revenueIncTaxTotal" label="收入含税总金额" min-width="150" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.revenueIncTaxTotal) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.costIncTaxTotal" prop="costIncTaxTotal" label="成本含税总金额" min-width="150" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.costIncTaxTotal) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.profitIncTaxTotal" prop="profitIncTaxTotal" label="毛利含税总金额" min-width="150" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.profitIncTaxTotal) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.revenueItem" prop="revenueItem" label="收入项目" min-width="120" />
        <el-table-column v-if="visibleColumns.productL1" prop="productL1" label="产品标准名L1" min-width="150" />
        <el-table-column v-if="visibleColumns.productL2" prop="productL2" label="产品标准名L2" min-width="150" />
        <el-table-column v-if="visibleColumns.productL3" prop="productL3" label="产品标准名L3" min-width="150" />
        <el-table-column v-if="visibleColumns.currency" prop="currency" label="币种" min-width="80" />
        <el-table-column v-if="visibleColumns.amountExTax" prop="amountExTax" label="不含税金额" min-width="120" align="right">
          <template #default="{ row }">{{ formatMoney(row.amountExTax) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.taxRate" prop="taxRate" label="税率" min-width="80" align="right">
          <template #default="{ row }">{{ (row.taxRate * 100).toFixed(2) }}%</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.taxAmount" prop="taxAmount" label="税额" min-width="120" align="right">
          <template #default="{ row }">{{ formatMoney(row.taxAmount) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.amountIncTax" prop="amountIncTax" label="含税金额" min-width="120" align="right">
          <template #default="{ row }">{{ formatMoney(row.amountIncTax) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.exchangeRate" prop="exchangeRate" label="汇率" min-width="100" align="right">
          <template #default="{ row }">{{ row.exchangeRate.toFixed(4) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.amountExTaxCny" prop="amountExTaxCny" label="不含税(折合CNY)" min-width="150" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.amountExTaxCny) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.amountIncTaxCny" prop="amountIncTaxCny" label="含税(折合CNY)" min-width="150" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.amountIncTaxCny) }}</template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.settlementUnit" prop="settlementUnit" label="结算单位" min-width="150" />
        <el-table-column v-if="visibleColumns.customerService" prop="customerService" label="客服" min-width="100" />
        <el-table-column v-if="visibleColumns.remark" prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column v-if="visibleColumns.reconciliationStatus" prop="reconciliationStatus" label="对账状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getReconciliationStatusType(row.reconciliationStatus)" size="small">{{ row.reconciliationStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="visibleColumns.createBy" prop="createBy" label="创建人" min-width="100" />
        <el-table-column v-if="visibleColumns.createTime" prop="createTime" label="创建时间" min-width="160" />
        <el-table-column v-if="visibleColumns.updateBy" prop="updateBy" label="修改人" min-width="100" />
        <el-table-column v-if="visibleColumns.updateTime" prop="updateTime" label="修改时间" min-width="160" />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
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
import { ElMessage } from 'element-plus'
import { Search, Refresh, Download, Operation, Setting } from '@element-plus/icons-vue'

const loading = ref(false)
const hasSearched = ref(false)

// 统计数据 - 有勾选数据时汇总勾选数据，无勾选时显示当前页总和
const statData = computed(() => {
  const data = selectedRows.value.length > 0 ? selectedRows.value : tableData.value
  return {
    revenueIncTaxTotal: data.reduce((sum, item) => sum + (item.revenueIncTaxTotal || 0), 0),
    revenueExTaxTotal: data.reduce((sum, item) => sum + (item.revenueExTaxTotal || 0), 0),
    costIncTaxTotal: data.reduce((sum, item) => sum + (item.costIncTaxTotal || 0), 0),
    costExTaxTotal: data.reduce((sum, item) => sum + (item.costExTaxTotal || 0), 0),
    profitIncTaxTotal: data.reduce((sum, item) => sum + (item.profitIncTaxTotal || 0), 0),
    profitExTaxTotal: data.reduce((sum, item) => sum + (item.profitExTaxTotal || 0), 0)
  }
})

// 搜索表单
const searchForm = reactive({
  customerId: null as number | null,
  warehouseCode: '',
  businessMode: '',
  businessRefNo: '',
  isSettled: '',
  orderCreateTime: [] as string[],
  orderFinishTime: [] as string[],
  customerCmdNo: '',
  masterBillNo: '',
  houseBillNo: ''
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

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 选中行
const selectedRows = ref<any[]>([])

// 自定义字段弹窗
const showCustomFieldDialog = ref(false)

// 所有字段 - 按需求列出
const allFields = [
  { key: 'businessRefNo', label: '业务参考编号' },
  { key: 'customerName', label: '客户名称' },
  { key: 'billingEntity', label: '账单主体' },
  { key: 'customerCmdNo', label: '客户指令号' },
  { key: 'masterBillNo', label: '总运单号' },
  { key: 'houseBillNo', label: '分运单号' },
  { key: 'warehouse', label: '仓库' },
  { key: 'businessMode', label: '业务模式' },
  { key: 'businessNo', label: '业务编号' },
  { key: 'flowSheetNo', label: '流转单编号' },
  { key: 'orderCreateTime', label: '订单新建时间' },
  { key: 'orderFinishTime', label: '订单完成时间' },
  { key: 'orderStatus', label: '订单状态' },
  { key: 'isSettled', label: '是否结算订单' },
  { key: 'revenueExTaxTotal', label: '收入不含税总金额' },
  { key: 'costExTaxTotal', label: '成本不含税总金额' },
  { key: 'profitExTaxTotal', label: '毛利不含税总金额' },
  { key: 'revenueIncTaxTotal', label: '收入含税总金额' },
  { key: 'costIncTaxTotal', label: '成本含税总金额' },
  { key: 'profitIncTaxTotal', label: '毛利含税总金额' },
  { key: 'revenueItem', label: '收入项目' },
  { key: 'productL1', label: '产品标准名L1' },
  { key: 'productL2', label: '产品标准名L2' },
  { key: 'productL3', label: '产品标准名L3' },
  { key: 'currency', label: '币种' },
  { key: 'amountExTax', label: '不含税金额' },
  { key: 'taxRate', label: '税率' },
  { key: 'taxAmount', label: '税额' },
  { key: 'amountIncTax', label: '含税金额' },
  { key: 'exchangeRate', label: '汇率' },
  { key: 'amountExTaxCny', label: '不含税(折合CNY)' },
  { key: 'amountIncTaxCny', label: '含税(折合CNY)' },
  { key: 'settlementUnit', label: '结算单位' },
  { key: 'customerService', label: '客服' },
  { key: 'remark', label: '备注' },
  { key: 'reconciliationStatus', label: '对账状态' },
  { key: 'createBy', label: '创建人' },
  { key: 'createTime', label: '创建时间' },
  { key: 'updateBy', label: '修改人' },
  { key: 'updateTime', label: '修改时间' }
]

// 默认显示的字段
const defaultVisibleColumns: Record<string, boolean> = {
  businessRefNo: true,
  customerName: true,
  billingEntity: true,
  customerCmdNo: true,
  masterBillNo: true,
  houseBillNo: true,
  warehouse: true,
  businessMode: true,
  businessNo: true,
  flowSheetNo: true,
  orderCreateTime: true,
  orderFinishTime: true,
  orderStatus: true,
  isSettled: true,
  revenueExTaxTotal: true,
  costExTaxTotal: true,
  profitExTaxTotal: true,
  revenueIncTaxTotal: true,
  costIncTaxTotal: true,
  profitIncTaxTotal: true,
  revenueItem: false,
  productL1: false,
  productL2: false,
  productL3: false,
  currency: false,
  amountExTax: false,
  taxRate: false,
  taxAmount: false,
  amountIncTax: false,
  exchangeRate: false,
  amountExTaxCny: false,
  amountIncTaxCny: false,
  settlementUnit: false,
  customerService: false,
  remark: false,
  reconciliationStatus: false,
  createBy: false,
  createTime: false,
  updateBy: false,
  updateTime: false
}

// 可见列
const visibleColumns = reactive<Record<string, boolean>>({ ...defaultVisibleColumns })

// 已选字段
const selectedFields = ref<string[]>(Object.keys(defaultVisibleColumns).filter(key => defaultVisibleColumns[key]))

// 表格数据 - 模拟数据
const tableData = ref([
  {
    businessRefNo: 'PO2026050001',
    customerName: '深圳市腾讯科技有限公司',
    billingEntity: '深圳泓明供应链有限公司',
    customerCmdNo: 'CMD2026050001',
    masterBillNo: 'MBL2026050001',
    houseBillNo: 'HBL2026050001',
    warehouse: '深圳仓',
    businessMode: 'fob',
    businessNo: 'YW2026050001',
    flowSheetNo: 'LZ2026050001',
    orderCreateTime: '2026-04-28 09:00:00',
    orderFinishTime: '2026-05-05 18:00:00',
    orderStatus: '已完成',
    isSettled: 'yes',
    revenueExTaxTotal: 50000.00,
    costExTaxTotal: 35000.00,
    profitExTaxTotal: 15000.00,
    revenueIncTaxTotal: 56500.00,
    costIncTaxTotal: 39550.00,
    profitIncTaxTotal: 16950.00,
    revenueItem: '仓储费',
    productL1: '物流服务',
    productL2: '仓储服务',
    productL3: '普通仓储',
    currency: 'CNY',
    amountExTax: 50000.00,
    taxRate: 0.13,
    taxAmount: 6500.00,
    amountIncTax: 56500.00,
    exchangeRate: 1.0,
    amountExTaxCny: 50000.00,
    amountIncTaxCny: 56500.00,
    settlementUnit: '深圳分公司',
    customerService: '张三',
    remark: '20GP整柜从深圳到洛杉矶',
    reconciliationStatus: '已对账',
    createBy: '张三',
    createTime: '2026-05-01 10:30:00',
    updateBy: '李四',
    updateTime: '2026-05-03 14:00:00'
  },
  {
    businessRefNo: 'PO2026050002',
    customerName: '阿里巴巴（中国）有限公司',
    billingEntity: '上海泓明供应链有限公司',
    customerCmdNo: 'CMD2026050002',
    masterBillNo: 'MBL2026050002',
    houseBillNo: 'HBL2026050002',
    warehouse: '上海仓',
    businessMode: 'cif',
    businessNo: 'YW2026050002',
    flowSheetNo: 'LZ2026050002',
    orderCreateTime: '2026-04-25 08:00:00',
    orderFinishTime: '2026-05-08 17:00:00',
    orderStatus: '已完成',
    isSettled: 'no',
    revenueExTaxTotal: 80000.00,
    costExTaxTotal: 55000.00,
    profitExTaxTotal: 25000.00,
    revenueIncTaxTotal: 90400.00,
    costIncTaxTotal: 62150.00,
    profitIncTaxTotal: 28250.00,
    revenueItem: '运输费',
    productL1: '物流服务',
    productL2: '运输服务',
    productL3: '海运运输',
    currency: 'USD',
    amountExTax: 11267.62,
    taxRate: 0.13,
    taxAmount: 1464.79,
    amountIncTax: 12732.41,
    exchangeRate: 7.1,
    amountExTaxCny: 80000.00,
    amountIncTaxCny: 90400.00,
    settlementUnit: '上海分公司',
    customerService: '李四',
    remark: '500平仓储服务，租期3个月',
    reconciliationStatus: '待对账',
    createBy: '王五',
    createTime: '2026-05-02 11:00:00',
    updateBy: '',
    updateTime: ''
  }
])

// 设置分页总数
pagination.total = tableData.value.length

// 格式化金额
const formatMoney = (value: number) => {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

// 获取业务模式文本
const getBusinessModeText = (mode: string) => {
  const texts: Record<string, string> = {
    fob: 'FOB',
    cif: 'CIF',
    ddp: 'DDP',
    exw: 'EXW'
  }
  return texts[mode] || mode
}

// 获取订单状态类型
const getOrderStatusType = (status: string) => {
  const types: Record<string, string> = {
    '已取消': 'info',
    '待执行': 'warning',
    '执行中': 'primary',
    '已完成': 'success'
  }
  return types[status] || 'info'
}

// 获取对账状态类型
const getReconciliationStatusType = (status: string) => {
  const types: Record<string, string> = {
    '已对账': 'success',
    '待对账': 'warning',
    '部分对账': 'warning'
  }
  return types[status] || 'info'
}

// 搜索
const handleSearch = () => {
  if (!searchForm.customerId) {
    ElMessage.warning('请选择客户名称')
    return
  }
  loading.value = true
  setTimeout(() => {
    loading.value = false
    hasSearched.value = true
    ElMessage.success('查询订单收入明细成功')
  }, 500)
  pagination.page = 1
}

// 重置
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    if (Array.isArray(searchForm[key as keyof typeof searchForm])) {
      ;(searchForm as any)[key] = []
    } else {
      ;(searchForm as any)[key] = ''
    }
  })
  searchForm.customerId = null
  hasSearched.value = false
  ElMessage.info('已重置搜索条件')
}

// 导出
const handleExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要导出的数据')
    return
  }
  ElMessage.success(`正在导出 ${selectedRows.value.length} 条数据`)
}

// 拆单均摊
const handleSplitAllocation = () => {
  ElMessage.success('拆单均摊功能开发中')
}

// 自定义字段
const handleCustomFields = () => {
  selectedFields.value = Object.keys(visibleColumns).filter(key => visibleColumns[key])
  showCustomFieldDialog.value = true
}

// 确认字段设置
const handleConfirmFields = () => {
  Object.keys(visibleColumns).forEach(key => {
    visibleColumns[key] = selectedFields.value.includes(key)
  })
  showCustomFieldDialog.value = false
  ElMessage.success('字段显示设置已保存')
}

// 恢复默认字段
const handleResetFields = () => {
  Object.assign(visibleColumns, defaultVisibleColumns)
  selectedFields.value = Object.keys(defaultVisibleColumns).filter(key => defaultVisibleColumns[key])
}

// 选中变化
const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows
}

// 分页变化
const handlePageChange = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
}
</script>

<style scoped>
.order-revenue-detail-container {
  padding: 0;
  background: #f5f7fa;
  min-height: 100%;
}

.statistics-cards {
  padding: 16px 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.stat-header {
  margin-bottom: 16px;
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

.revenue-card {
  border-left: 4px solid #409eff;
}

.cost-card {
  border-left: 4px solid #e6a23c;
}

.profit-card {
  border-left: 4px solid #67c23a;
}

.search-panel {
  background: #fff;
  margin: 16px 20px;
  padding: 20px;
  border-radius: 8px;
}

.action-bar {
  background: #fff;
  margin: 0 20px;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  gap: 10px;
}

.table-container {
  background: #fff;
  margin: 16px 20px;
  padding: 20px;
  border-radius: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.custom-field-content {
  padding: 10px 0;
}

.tip-text {
  color: #909399;
  font-size: 14px;
  margin-bottom: 15px;
}

.field-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.field-checkbox-item {
  width: 180px;
  margin-right: 0;
}

.field-actions {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}
</style>