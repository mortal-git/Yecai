<template>
  <div class="payable-create-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-divider direction="vertical" />
        <span class="page-title">{{ isEdit ? '编辑应付单' : '新增应付单' }}</span>
      </div>
      <div class="header-right">
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="form-container">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="payable-form"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="section-title">基本信息</div>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="供应商" prop="supplierId">
                <el-select
                  v-model="formData.supplierId"
                  placeholder="请选择供应商"
                  filterable
                  style="width: 100%"
                  @change="handleSupplierChange"
                >
                  <el-option
                    v-for="supplier in supplierList"
                    :key="supplier.id"
                    :label="supplier.name"
                    :value="supplier.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="应付单号">
                <el-input v-model="formData.payableNo" placeholder="系统自动生成" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="关联订单" prop="orderId">
                <el-select
                  v-model="formData.orderId"
                  placeholder="请选择订单"
                  filterable
                  style="width: 100%"
                  @change="handleOrderChange"
                >
                  <el-option
                    v-for="order in orderList"
                    :key="order.id"
                    :label="`${order.orderNo} - ${order.supplierName}`"
                    :value="order.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="关联发票" prop="invoiceId">
                <el-select
                  v-model="formData.invoiceId"
                  placeholder="请选择发票（可选）"
                  clearable
                  filterable
                  style="width: 100%"
                >
                  <el-option
                    v-for="invoice in invoiceList"
                    :key="invoice.id"
                    :label="`${invoice.invoiceNo} - ${invoice.supplierName}`"
                    :value="invoice.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="应付金额" prop="amount">
                <el-input-number
                  v-model="formData.amount"
                  :min="0.01"
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                  placeholder="请输入应付金额"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="到期日期" prop="dueDate">
                <el-date-picker
                  v-model="formData.dueDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="备注">
                <el-input
                  v-model="formData.remark"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入备注信息"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 付款计划 -->
        <div class="form-section">
          <div class="section-title">
            付款计划
            <el-button type="primary" link size="small" @click="handleAddPlan">
              <el-icon><Plus /></el-icon>
              添加计划
            </el-button>
          </div>
          <el-table :data="formData.paymentPlans" border size="small">
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column label="计划付款日期" width="180">
              <template #default="{ row }">
                <el-date-picker
                  v-model="row.planDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                  @change="() => handlePlanChange(row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="计划付款金额" width="180">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.planAmount"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                  @change="() => handlePlanChange(row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="付款方式" width="150">
              <template #default="{ row }">
                <el-select v-model="row.paymentMethod" placeholder="请选择" style="width: 100%">
                  <el-option label="银行转账" value="bank" />
                  <el-option label="承兑汇票" value="acceptance" />
                  <el-option label="商业汇票" value="trade_bill" />
                  <el-option label="现金" value="cash" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="备注" min-width="150">
              <template #default="{ row }">
                <el-input v-model="row.remark" placeholder="备注" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ $index }">
                <el-button type="danger" link size="small" @click="handleRemovePlan($index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="plan-summary">
            <span>计划付款总额：¥{{ totalPlanAmount.toLocaleString() }}</span>
            <span v-if="Math.abs(totalPlanAmount - formData.amount) > 0.01" class="amount-warning">
              （与应付金额不符）
            </span>
          </div>
        </div>

        <!-- 附件信息 -->
        <div class="form-section">
          <div class="section-title">附件信息</div>
          <el-upload
            action="#"
            :auto-upload="false"
            :file-list="fileList"
            list-type="picture-card"
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()

const isEdit = computed(() => !!route.params.id)
const fileList = ref<any[]>([])

// 供应商列表
const supplierList = ref([
  { id: 1, name: '深圳硬件供应商A公司' },
  { id: 2, name: '北京云服务B公司' },
  { id: 3, name: '上海网络设备C公司' },
  { id: 4, name: '广州物流服务D公司' },
  { id: 5, name: '杭州软件服务E公司' }
])

// 订单列表
const orderList = ref([
  { id: 'DD2024040010', orderNo: 'DD2024040010', supplierName: '深圳硬件供应商A公司', totalAmount: 300000 },
  { id: 'DD2024040011', orderNo: 'DD2024040011', supplierName: '北京云服务B公司', totalAmount: 500000 },
  { id: 'DD2024040012', orderNo: 'DD2024040012', supplierName: '上海网络设备C公司', totalAmount: 180000 }
])

// 发票列表
const invoiceList = ref([
  { id: 1, invoiceNo: 'FP2024040010', supplierName: '深圳硬件供应商A公司', amount: 300000 },
  { id: 2, invoiceNo: 'FP2024040011', supplierName: '北京云服务B公司', amount: 500000 }
])

// 表单数据
const formData = reactive({
  payableNo: '',
  supplierId: '',
  supplierName: '',
  orderId: '',
  orderNo: '',
  invoiceId: null,
  invoiceNo: '',
  amount: 0,
  dueDate: '',
  remark: '',
  paymentPlans: [] as Array<{
    planDate: string
    planAmount: number
    paymentMethod: string
    remark: string
  }>
})

// 表单验证规则
const formRules: FormRules = {
  supplierId: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  orderId: [{ required: true, message: '请选择关联订单', trigger: 'change' }],
  amount: [{ required: true, message: '请输入应付金额', trigger: 'blur' }],
  dueDate: [{ required: true, message: '请选择到期日期', trigger: 'change' }]
}

// 计算计划付款总额
const totalPlanAmount = computed(() => {
  return formData.paymentPlans.reduce((sum, plan) => sum + (plan.planAmount || 0), 0)
})

// 方法
const handleBack = () => {
  router.push('/payable/list')
}

const handleSupplierChange = (supplierId: number) => {
  const supplier = supplierList.value.find(s => s.id === supplierId)
  if (supplier) {
    formData.supplierName = supplier.name
  }
}

const handleOrderChange = (orderId: string) => {
  const order = orderList.value.find(o => o.id === orderId)
  if (order) {
    formData.orderNo = order.orderNo
    if (!formData.amount) {
      formData.amount = order.totalAmount
    }
  }
}

const handleAddPlan = () => {
  formData.paymentPlans.push({
    planDate: '',
    planAmount: 0,
    paymentMethod: '',
    remark: ''
  })
}

const handleRemovePlan = (index: number) => {
  formData.paymentPlans.splice(index, 1)
}

const handlePlanChange = (plan: any) => {
  // 计划变更时的处理
}

const handleSaveDraft = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('保存草稿成功')
    }
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('提交成功')
      router.push('/payable/list')
    }
  })
}
</script>

<style scoped>
.payable-create-container {
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
  gap: 12px;
}

.form-container {
  background: #fff;
  margin: 16px;
  padding: 24px;
  border-radius: 8px;
}

.form-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 4px solid #409eff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.plan-summary {
  margin-top: 12px;
  text-align: right;
  font-size: 14px;
  color: #606266;
}

.amount-warning {
  color: #e6a23c;
}
</style>
