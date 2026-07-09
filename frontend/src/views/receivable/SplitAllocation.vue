<template>
  <div class="split-allocation-container">
    <!-- 统计卡片区域 -->
    <div class="stats-cards">
      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span>收入汇总</span>
          </div>
        </template>
        <div class="card-content">
          <div class="stats-item">
            <span class="label">含税总金额：</span>
            <span class="value income">¥{{ formatMoney(statistics.incomeIncTaxTotal) }}</span>
          </div>
          <div class="stats-item">
            <span class="label">不含税总金额：</span>
            <span class="value income">¥{{ formatMoney(statistics.incomeExTaxTotal) }}</span>
          </div>
        </div>
      </el-card>

      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span>成本汇总</span>
          </div>
        </template>
        <div class="card-content">
          <div class="stats-item">
            <span class="label">含税总金额：</span>
            <span class="value cost">¥{{ formatMoney(statistics.costIncTaxTotal) }}</span>
          </div>
          <div class="stats-item">
            <span class="label">不含税总金额：</span>
            <span class="value cost">¥{{ formatMoney(statistics.costExTaxTotal) }}</span>
          </div>
        </div>
      </el-card>

      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span>毛利汇总</span>
          </div>
        </template>
        <div class="card-content">
          <div class="stats-item">
            <span class="label">含税总金额：</span>
            <span class="value profit">¥{{ formatMoney(statistics.profitIncTaxTotal) }}</span>
          </div>
          <div class="stats-item">
            <span class="label">不含税总金额：</span>
            <span class="value profit">¥{{ formatMoney(statistics.profitExTaxTotal) }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 查询条件区域 -->
    <div class="search-panel">
      <el-form :model="searchForm" :inline="true" label-width="120px">
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
        <el-form-item label="账单主体">
          <el-input v-model="searchForm.billingEntity" placeholder="请输入" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="仓库">
          <el-select v-model="searchForm.warehouse" placeholder="请选择" clearable style="width: 150px">
            <el-option label="深圳仓库" value="shenzhen" />
            <el-option label="上海仓库" value="shanghai" />
            <el-option label="广州仓库" value="guangzhou" />
            <el-option label="北京仓库" value="beijing" />
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
          <el-input
            v-model="searchForm.businessRefNo"
            type="textarea"
            :rows="2"
            placeholder="请输入"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="是否结算订单">
          <el-select v-model="searchForm.isSettled" placeholder="请选择" clearable style="width: 150px">
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
            v-model="searchForm.orderCompleteTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="客户指令号">
          <el-input v-model="searchForm.customerInstructionNo" placeholder="请输入" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="总运单">
          <el-input v-model="searchForm.masterWaybillNo" placeholder="请输入" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="分运单">
          <el-input v-model="searchForm.houseWaybillNo" placeholder="请输入" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="收入项目">
          <el-input v-model="searchForm.incomeItem" placeholder="请输入" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="产品标准名L3">
          <el-select v-model="searchForm.productL3" placeholder="请选择" clearable filterable style="width: 180px">
            <el-option v-for="item in productL3List" :key="item.value" :label="item.label" :value="item.value" />
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
            查询
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
      <el-button type="primary" @click="handleExportSelected" :disabled="selectedRows.length === 0">
        <el-icon><Download /></el-icon>
        导出
      </el-button>
    </div>

    <!-- 待分摊订单列表 -->
    <div class="table-container">
      <div class="table-title"></div>
      <el-table
        ref="tableRef"
        :data="orderList"
        border
        stripe
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" fixed />
        <el-table-column prop="businessRefNo" label="业务参考编号" min-width="150" />
        <el-table-column prop="customerName" label="客户名称" min-width="180" />
        <el-table-column prop="billingEntity" label="账单主体" min-width="120" />
        <el-table-column prop="customerInstructionNo" label="客户指令号" min-width="150" />
        <el-table-column prop="masterWaybillNo" label="总运单号" min-width="150" />
        <el-table-column prop="houseWaybillNo" label="分运单号" min-width="150" />
        <el-table-column prop="warehouse" label="仓库" min-width="100" />
        <el-table-column prop="businessMode" label="业务模式" min-width="100">
          <template #default="{ row }">{{ getBusinessModeText(row.businessMode) }}</template>
        </el-table-column>
        <el-table-column prop="businessNo" label="业务编号" min-width="150" />
        <el-table-column prop="transferOrderNo" label="流转单编号" min-width="150" />
        <el-table-column prop="orderCreateTime" label="订单新建时间" min-width="160" />
        <el-table-column prop="orderCompleteTime" label="订单完成时间" min-width="160" />
        <el-table-column prop="orderStatus" label="订单状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getOrderStatusType(row.orderStatus)" size="small">
              {{ row.orderStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isSettled" label="是否结算订单" min-width="120">
          <template #default="{ row }">
            <el-tag :type="row.isSettled === 'yes' ? 'success' : 'warning'" size="small">
              {{ row.isSettled === 'yes' ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="incomeExTaxTotal" label="收入不含税总金额" min-width="160" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.incomeExTaxTotal) }}</template>
        </el-table-column>
        <el-table-column prop="costExTaxTotal" label="成本不含税总金额" min-width="160" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.costExTaxTotal) }}</template>
        </el-table-column>
        <el-table-column prop="profitExTaxTotal" label="毛利不含税总金额" min-width="160" align="right">
          <template #default="{ row }">
            <span :class="row.profitExTaxTotal < 0 ? 'text-red' : 'text-green'">
              ¥{{ formatMoney(row.profitExTaxTotal) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="incomeIncTaxTotal" label="收入含税总金额" min-width="160" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.incomeIncTaxTotal) }}</template>
        </el-table-column>
        <el-table-column prop="costIncTaxTotal" label="成本含税总金额" min-width="160" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.costIncTaxTotal) }}</template>
        </el-table-column>
        <el-table-column prop="profitIncTaxTotal" label="毛利含税总金额" min-width="160" align="right">
          <template #default="{ row }">
            <span :class="row.profitIncTaxTotal < 0 ? 'text-red' : 'text-green'">
              ¥{{ formatMoney(row.profitIncTaxTotal) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="incomeItem" label="收入项目" min-width="120" />
        <el-table-column prop="productL1" label="产品标准名L1" min-width="150" />
        <el-table-column prop="productL2" label="产品标准名L2" min-width="150" />
        <el-table-column prop="productL3" label="产品标准名L3" min-width="150" />
        <el-table-column prop="currency" label="币种" min-width="80" />
        <el-table-column prop="amountExTax" label="不含税金额" min-width="130" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.amountExTax) }}</template>
        </el-table-column>
        <el-table-column prop="taxRate" label="税率(%)" min-width="100" align="right">
          <template #default="{ row }">{{ row.taxRate }}%</template>
        </el-table-column>
        <el-table-column prop="taxAmount" label="税额" min-width="120" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.taxAmount) }}</template>
        </el-table-column>
        <el-table-column prop="amountIncTax" label="含税金额" min-width="120" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.amountIncTax) }}</template>
        </el-table-column>
        <el-table-column prop="exchangeRate" label="汇率" min-width="100" align="right">
          <template #default="{ row }">{{ row.exchangeRate }}</template>
        </el-table-column>
        <el-table-column prop="amountExTaxCny" label="不含税(折合CNY)" min-width="180" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.amountExTaxCny) }}</template>
        </el-table-column>
        <el-table-column prop="amountIncTaxCny" label="含税(折合CNY)" min-width="180" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.amountIncTaxCny) }}</template>
        </el-table-column>
        <el-table-column prop="settlementUnit" label="结算单位" min-width="150" />
        <el-table-column prop="splitBy" label="拆单人" min-width="100" />
        <el-table-column prop="splitTime" label="拆单时间" min-width="160" />
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

    <!-- 分摊明细列表 -->
    <div class="table-container" v-if="selectedOrder">
      <div class="table-title">
        <span>分摊明细 - {{ selectedOrder.businessRefNo }}</span>
        <el-button type="success" size="small" @click="handleAddDetail">
          <el-icon><Plus /></el-icon>
          新增分摊
        </el-button>
        <el-button type="primary" size="small" @click="handleSaveAllocation" style="margin-left: 10px">
          <el-icon><Check /></el-icon>
          保存分摊
        </el-button>
      </div>
      <el-table
        :data="allocationDetailList"
        border
        stripe
      >
        <el-table-column type="index" width="50" />
        <el-table-column prop="incomeItem" label="收入项目" min-width="120" />
        <el-table-column prop="productL1" label="产品标准名L1" min-width="150" />
        <el-table-column prop="productL2" label="产品标准名L2" min-width="150" />
        <el-table-column prop="productL3" label="产品标准名L3" min-width="150" />
        <el-table-column prop="currency" label="币种" min-width="80" />
        <el-table-column prop="amountExTax" label="不含税金额" min-width="130" align="right">
          <template #default="{ row }">
            <el-input-number
              v-model="row.amountExTax"
              :min="0"
              :precision="2"
              @change="calculateAmount(row)"
              style="width: 120px"
            />
          </template>
        </el-table-column>
        <el-table-column prop="taxRate" label="税率(%)" min-width="100" align="right">
          <template #default="{ row }">
            <el-input-number
              v-model="row.taxRate"
              :min="0"
              :max="100"
              :precision="2"
              @change="calculateAmount(row)"
              style="width: 100px"
            />
          </template>
        </el-table-column>
        <el-table-column prop="taxAmount" label="税额" min-width="120" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.taxAmount) }}</template>
        </el-table-column>
        <el-table-column prop="amountIncTax" label="含税金额" min-width="120" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.amountIncTax) }}</template>
        </el-table-column>
        <el-table-column prop="exchangeRate" label="汇率" min-width="100" align="right">
          <template #default="{ row }">
            <el-input-number
              v-model="row.exchangeRate"
              :min="0"
              :precision="4"
              @change="calculateCnyAmount(row)"
              style="width: 100px"
            />
          </template>
        </el-table-column>
        <el-table-column prop="amountExTaxCny" label="不含税(折合CNY)" min-width="180" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.amountExTaxCny) }}</template>
        </el-table-column>
        <el-table-column prop="amountIncTaxCny" label="含税(折合CNY)" min-width="180" align="right">
          <template #default="{ row }">¥{{ formatMoney(row.amountIncTaxCny) }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200">
          <template #default="{ row }">
            <el-input v-model="row.remark" placeholder="请输入备注" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ row, $index }">
            <el-button type="danger" link size="small" @click.stop="handleDeleteDetail($index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分摊合计 -->
      <div class="allocation-summary">
        <div class="summary-item">
          <span class="label">订单收入含税总金额：</span>
          <span class="value">¥{{ formatMoney(selectedOrder.incomeIncTaxTotal) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">已分摊金额：</span>
          <span class="value">¥{{ formatMoney(allocatedTotal) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">未分摊金额：</span>
          <span class="value" :class="{ 'text-red': remainingAmount > 0 }">¥{{ formatMoney(remainingAmount) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">本次分摊金额：</span>
          <span class="value">¥{{ formatMoney(currentAllocatedTotal) }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Download, Plus, Check } from '@element-plus/icons-vue'

const loading = ref(false)
const selectedRows = ref<any[]>([])
const selectedOrder = ref<any>(null)

// 搜索表单
const searchForm = reactive({
  customerId: null as number | null,
  billingEntity: '',
  warehouse: '',
  businessMode: '',
  businessRefNo: '',
  isSettled: '',
  orderCreateTime: [] as string[],
  orderCompleteTime: [] as string[],
  customerInstructionNo: '',
  masterWaybillNo: '',
  houseWaybillNo: '',
  incomeItem: '',
  productL3: '',
  settlementUnit: ''
})

// 客户列表
const customerList = ref([
  { id: 1, name: '深圳市腾讯科技有限公司' },
  { id: 2, name: '阿里巴巴（中国）有限公司' },
  { id: 3, name: '字节跳动科技有限公司' },
  { id: 4, name: '华为技术有限公司' },
  { id: 5, name: '京东集团股份有限公司' }
])

// 产品标准名L3列表
const productL3List = ref([
  { value: '海运', label: '海运' },
  { value: '空运', label: '空运' },
  { value: '铁路运输', label: '铁路运输' },
  { value: '卡航', label: '卡航' },
  { value: '出口报关', label: '出口报关' },
  { value: '货物运输保险', label: '货物运输保险' },
  { value: '普通仓储', label: '普通仓储' },
  { value: '恒温仓储', label: '恒温仓储' },
  { value: '同城配送', label: '同城配送' },
  { value: '进口报关', label: '进口报关' }
])

// 结算单位列表
const settlementUnitList = ref([
  { value: '深圳市腾讯科技有限公司', label: '深圳市腾讯科技有限公司' },
  { value: '阿里巴巴（中国）有限公司', label: '阿里巴巴（中国）有限公司' },
  { value: '字节跳动科技有限公司', label: '字节跳动科技有限公司' },
  { value: '华为技术有限公司', label: '华为技术有限公司' },
  { value: '京东集团股份有限公司', label: '京东集团股份有限公司' }
])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})


// 统计数据
const statistics = reactive({
  incomeIncTaxTotal: 0,
  incomeExTaxTotal: 0,
  costIncTaxTotal: 0,
  costExTaxTotal: 0,
  profitIncTaxTotal: 0,
  profitExTaxTotal: 0
})

// 订单列表数据
const orderList = ref([
  {
    id: 1,
    businessRefNo: 'PO2024050001',
    customerName: '深圳市腾讯科技有限公司',
    billingEntity: '销售-SR',
    customerInstructionNo: 'CI2024050001',
    masterWaybillNo: 'MWB2024050001',
    houseWaybillNo: 'HWB2024050001',
    warehouse: '深圳仓库',
    businessMode: 'fob',
    businessNo: 'BUS2024050001',
    transferOrderNo: 'TR2024050001',
    orderCreateTime: '2024-05-01 10:30:00',
    orderCompleteTime: '2024-05-10 16:45:00',
    orderStatus: '已完成',
    isSettled: 'no',
    incomeExTaxTotal: 132743.36,
    costExTaxTotal: 97345.13,
    profitExTaxTotal: 35398.23,
    incomeIncTaxTotal: 150000.00,
    costIncTaxTotal: 110000.00,
    profitIncTaxTotal: 40000.00,
    incomeItem: '国际货运代理',
    productL1: '物流服务',
    productL2: '国际货运',
    productL3: '海运',
    currency: 'CNY',
    amountExTax: 132743.36,
    taxRate: 13,
    taxAmount: 17256.64,
    amountIncTax: 150000.00,
    exchangeRate: 1.0000,
    amountExTaxCny: 132743.36,
    amountIncTaxCny: 150000.00,
    settlementUnit: '深圳市腾讯科技有限公司',
    customerService: '张三',
    remark: '深圳到美国洛杉矶海运订单',
    reconciliationStatus: 'unreconciled',
    createBy: '管理员',
    createTime: '2024-05-01 09:00:00',
    updateBy: '管理员',
    updateTime: '2024-05-10 17:00:00',
    splitBy: '李四',
    splitTime: '2024-05-11 10:00:00'
  },
  {
    id: 2,
    businessRefNo: 'PO2024050001',
    customerName: '阿里巴巴（中国）有限公司',
    billingEntity: '销售-CT',
    customerInstructionNo: 'CI2024050002',
    masterWaybillNo: 'MWB2024050002',
    houseWaybillNo: 'HWB2024050002',
    warehouse: '上海仓库',
    businessMode: 'cif',
    businessNo: 'BUS2024050002',
    transferOrderNo: 'TR2024050002',
    orderCreateTime: '2024-05-02 14:20:00',
    orderCompleteTime: '2024-05-15 09:30:00',
    orderStatus: '已完成',
    isSettled: 'yes',
    incomeExTaxTotal: 247787.61,
    costExTaxTotal: 176991.15,
    profitExTaxTotal: 70796.46,
    incomeIncTaxTotal: 280000.00,
    costIncTaxTotal: 200000.00,
    profitIncTaxTotal: 80000.00,
    incomeItem: '国际货运代理',
    productL1: '物流服务',
    productL2: '国际货运',
    productL3: '空运',
    currency: 'CNY',
    amountExTax: 247787.61,
    taxRate: 13,
    taxAmount: 32212.39,
    amountIncTax: 280000.00,
    exchangeRate: 1.0000,
    amountExTaxCny: 247787.61,
    amountIncTaxCny: 280000.00,
    settlementUnit: '阿里巴巴（中国）有限公司',
    customerService: '王五',
    remark: '上海到德国汉堡空运订单',
    reconciliationStatus: 'reconciled',
    createBy: '管理员',
    createTime: '2024-05-02 13:00:00',
    updateBy: '管理员',
    updateTime: '2024-05-15 10:00:00',
    splitBy: '赵六',
    splitTime: '2024-05-16 14:00:00'
  },
  {
    id: 3,
    businessRefNo: 'PO2024050001',
    customerName: '字节跳动科技有限公司',
    billingEntity: 'NCDR-CT',
    customerInstructionNo: 'CI2024050003',
    masterWaybillNo: 'MWB2024050003',
    houseWaybillNo: 'HWB2024050003',
    warehouse: '广州仓库',
    businessMode: 'ddp',
    businessNo: 'BUS2024050003',
    transferOrderNo: 'TR2024050003',
    orderCreateTime: '2024-05-03 09:15:00',
    orderCompleteTime: '2024-05-18 11:20:00',
    orderStatus: '已完成',
    isSettled: 'no',
    incomeExTaxTotal: 185840.71,
    costExTaxTotal: 129911.50,
    profitExTaxTotal: 55929.21,
    incomeIncTaxTotal: 210000.00,
    costIncTaxTotal: 146800.00,
    profitIncTaxTotal: 63200.00,
    incomeItem: '国际货运代理',
    productL1: '物流服务',
    productL2: '国际货运',
    productL3: '铁路运输',
    currency: 'CNY',
    amountExTax: 185840.71,
    taxRate: 13,
    taxAmount: 24159.29,
    amountIncTax: 210000.00,
    exchangeRate: 1.0000,
    amountExTaxCny: 185840.71,
    amountIncTaxCny: 210000.00,
    settlementUnit: '字节跳动科技有限公司',
    customerService: '孙七',
    remark: '广州到欧洲铁路运输订单',
    reconciliationStatus: 'unreconciled',
    createBy: '管理员',
    createTime: '2024-05-03 08:30:00',
    updateBy: '管理员',
    updateTime: '2024-05-18 12:00:00',
    splitBy: '周八',
    splitTime: '2024-05-19 09:30:00'
  },
  {
    id: 4,
    businessRefNo: 'PO2024050001',
    customerName: '华为技术有限公司',
    billingEntity: 'NCDR-DS',
    customerInstructionNo: 'CI2024050004',
    masterWaybillNo: 'MWB2024050004',
    houseWaybillNo: 'HWB2024050004',
    warehouse: '北京仓库',
    businessMode: 'exw',
    businessNo: 'BUS2024050004',
    transferOrderNo: 'TR2024050004',
    orderCreateTime: '2024-05-04 16:40:00',
    orderCompleteTime: '2024-05-22 15:10:00',
    orderStatus: '已完成',
    isSettled: 'yes',
    incomeExTaxTotal: 318584.07,
    costExTaxTotal: 229858.41,
    profitExTaxTotal: 88725.66,
    incomeIncTaxTotal: 360000.00,
    costIncTaxTotal: 259740.00,
    profitIncTaxTotal: 100260.00,
    incomeItem: '国际货运代理',
    productL1: '物流服务',
    productL2: '国际货运',
    productL3: '卡航',
    currency: 'CNY',
    amountExTax: 318584.07,
    taxRate: 13,
    taxAmount: 41415.93,
    amountIncTax: 360000.00,
    exchangeRate: 1.0000,
    amountExTaxCny: 318584.07,
    amountIncTaxCny: 360000.00,
    settlementUnit: '华为技术有限公司',
    customerService: '吴九',
    remark: '北京到东南亚卡航订单',
    reconciliationStatus: 'reconciled',
    createBy: '管理员',
    createTime: '2024-05-04 15:30:00',
    updateBy: '管理员',
    updateTime: '2024-05-22 16:00:00',
    splitBy: '郑十',
    splitTime: '2024-05-23 11:15:00'
  }
])

pagination.total = orderList.value.length

// 分摊明细列表
const allocationDetailList = ref<any[]>([])

// 计算合计
const currentAllocatedTotal = computed(() => {
  return allocationDetailList.value.reduce((sum, item) => sum + (item.amountIncTax || 0), 0)
})

const allocatedTotal = computed(() => {
  if (!selectedOrder.value) return 0
  return selectedOrder.value.allocatedAmount || 0
})

const remainingAmount = computed(() => {
  if (!selectedOrder.value) return 0
  return selectedOrder.value.incomeIncTaxTotal - (selectedOrder.value.allocatedAmount + currentAllocatedTotal.value)
})

// 计算统计数据
const calculateStatistics = (data: any[]) => {
  statistics.incomeIncTaxTotal = data.reduce((sum, item) => sum + (item.incomeIncTaxTotal || 0), 0)
  statistics.incomeExTaxTotal = data.reduce((sum, item) => sum + (item.incomeExTaxTotal || 0), 0)
  statistics.costIncTaxTotal = data.reduce((sum, item) => sum + (item.costIncTaxTotal || 0), 0)
  statistics.costExTaxTotal = data.reduce((sum, item) => sum + (item.costExTaxTotal || 0), 0)
  statistics.profitIncTaxTotal = statistics.incomeIncTaxTotal - statistics.costIncTaxTotal
  statistics.profitExTaxTotal = statistics.incomeExTaxTotal - statistics.costExTaxTotal
}

// 监听选中行变化，更新统计数据
watch(selectedRows, (newRows) => {
  calculateStatistics(newRows.length > 0 ? newRows : orderList.value)
}, { deep: true, immediate: true })

// 监听订单列表变化，更新统计数据（无选中时）
watch(orderList, () => {
  if (selectedRows.value.length === 0) {
    calculateStatistics(orderList.value)
  }
}, { deep: true })

// 格式化金额
const formatMoney = (value: number) => {
  if (!value && value !== 0) return '0.00'
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
    '待处理': 'warning',
    '处理中': 'primary',
    '已完成': 'success',
    '已取消': 'danger'
  }
  return types[status] || 'info'
}


// 计算金额
const calculateAmount = (row: any) => {
  if (row.amountExTax !== undefined && row.taxRate !== undefined) {
    row.taxAmount = Number((row.amountExTax * row.taxRate / 100).toFixed(2))
    row.amountIncTax = Number((row.amountExTax + row.taxAmount).toFixed(2))
    calculateCnyAmount(row)
  }
}

// 计算人民币金额
const calculateCnyAmount = (row: any) => {
  if (row.amountExTax !== undefined && row.exchangeRate !== undefined) {
    row.amountExTaxCny = Number((row.amountExTax * row.exchangeRate).toFixed(2))
  }
  if (row.amountIncTax !== undefined && row.exchangeRate !== undefined) {
    row.amountIncTaxCny = Number((row.amountIncTax * row.exchangeRate).toFixed(2))
  }
}

// 搜索
const handleSearch = () => {
  if (!searchForm.customerId) {
    ElMessage.warning('请选择客户名称')
    return
  }
  loading.value = true
  setTimeout(() => {
    // 根据查询条件过滤数据
    let filteredData = [...orderList.value]

    // 客户名称过滤
    if (searchForm.customerId) {
      const customerMap: Record<number, string> = {
        1: '深圳市腾讯科技有限公司',
        2: '阿里巴巴（中国）有限公司',
        3: '字节跳动科技有限公司',
        4: '华为技术有限公司',
        5: '京东集团股份有限公司'
      }
      filteredData = filteredData.filter(item => item.customerName === customerMap[searchForm.customerId])
    }

    // 账单主体过滤
    if (searchForm.billingEntity) {
      filteredData = filteredData.filter(item => item.billingEntity.includes(searchForm.billingEntity))
    }

    // 仓库过滤
    if (searchForm.warehouse) {
      filteredData = filteredData.filter(item => item.warehouse === searchForm.warehouse)
    }

    // 业务模式过滤
    if (searchForm.businessMode) {
      filteredData = filteredData.filter(item => item.businessMode === searchForm.businessMode)
    }

    // 业务参考编号过滤
    if (searchForm.businessRefNo) {
      filteredData = filteredData.filter(item => item.businessRefNo.includes(searchForm.businessRefNo))
    }

    // 是否结算订单过滤
    if (searchForm.isSettled) {
      filteredData = filteredData.filter(item => item.isSettled === searchForm.isSettled)
    }

    // 客户指令号过滤
    if (searchForm.customerInstructionNo) {
      filteredData = filteredData.filter(item => item.customerInstructionNo.includes(searchForm.customerInstructionNo))
    }

    // 总运单过滤
    if (searchForm.masterWaybillNo) {
      filteredData = filteredData.filter(item => item.masterWaybillNo.includes(searchForm.masterWaybillNo))
    }

    // 分运单过滤
    if (searchForm.houseWaybillNo) {
      filteredData = filteredData.filter(item => item.houseWaybillNo.includes(searchForm.houseWaybillNo))
    }

    // 收入项目过滤
    if (searchForm.incomeItem) {
      filteredData = filteredData.filter(item => item.incomeItem.includes(searchForm.incomeItem))
    }

    // 产品标准名L3过滤
    if (searchForm.productL3) {
      filteredData = filteredData.filter(item => item.productL3 === searchForm.productL3)
    }

    // 结算单位过滤
    if (searchForm.settlementUnit) {
      filteredData = filteredData.filter(item => item.settlementUnit === searchForm.settlementUnit)
    }

    orderList.value = filteredData
    pagination.total = filteredData.length
    loading.value = false
    ElMessage.success('查询成功')
    pagination.page = 1
  }, 500)
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
  selectedOrder.value = null
  ElMessage.info('已重置搜索条件')
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


// 导出勾选数据
const handleExportSelected = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要导出的订单')
    return
  }
  ElMessage.success(`导出 ${selectedRows.value.length} 个勾选订单数据`)
}

// 新增分摊明细
const handleAddDetail = () => {
  allocationDetailList.value.push({
    incomeItem: '',
    productL1: '',
    productL2: '',
    productL3: '',
    currency: 'CNY',
    amountExTax: 0,
    taxRate: 13,
    taxAmount: 0,
    amountIncTax: 0,
    exchangeRate: 1.0000,
    amountExTaxCny: 0,
    amountIncTaxCny: 0,
    remark: ''
  })
}

// 删除分摊明细
const handleDeleteDetail = (index: number) => {
  allocationDetailList.value.splice(index, 1)
}

// 保存分摊
const handleSaveAllocation = () => {
  if (allocationDetailList.value.length === 0) {
    ElMessage.warning('请添加分摊明细')
    return
  }

  if (remainingAmount.value < 0) {
    ElMessage.error('分摊金额不能超过订单总金额')
    return
  }

  if (remainingAmount.value > 0) {
    ElMessage.warning(`还有 ¥${formatMoney(remainingAmount.value)} 未分摊，确认保存吗？`)
  }

  ElMessage.success('分摊保存成功')
  // 保存后刷新数据
  if (selectedOrder.value) {
    selectedOrder.value.allocatedAmount = (selectedOrder.value.allocatedAmount || 0) + currentAllocatedTotal.value
    // 这里可以根据实际业务更新订单状态等
  }
}

</script>

<style scoped>
.split-allocation-container {
  padding: 0;
  background: #f5f7fa;
  min-height: 100%;
}

/* 统计卡片样式 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 16px 20px 0;
}

.stats-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stats-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-item .label {
  font-size: 14px;
  color: #606266;
}

.stats-item .value {
  font-size: 18px;
  font-weight: 600;
}

.stats-item .value.income {
  color: #409eff;
}

.stats-item .value.cost {
  color: #f56c6c;
}

.stats-item .value.profit {
  color: #67c23a;
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

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.allocation-summary {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-item .label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
}

.summary-item .value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.summary-item .text-red {
  color: #f56c6c;
}

.text-green {
  color: #67c23a;
}


:deep(.el-table .cell) {
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .allocation-summary {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>