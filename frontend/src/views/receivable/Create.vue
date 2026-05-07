<template>
  <div class="receivable-create-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-divider direction="vertical" />
        <span class="page-title">{{ isEdit ? '编辑应收单' : '新增应收单' }}</span>
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
        class="receivable-form"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="section-title">基本信息</div>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="客户" prop="customerId">
                <el-select
                  v-model="formData.customerId"
                  placeholder="请选择客户"
                  filterable
                  style="width: 100%"
                  @change="handleCustomerChange"
                >
                  <el-option
                    v-for="customer in customerList"
                    :key="customer.id"
                    :label="customer.name"
                    :value="customer.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="应收单号">
                <el-input v-model="formData.receivableNo" placeholder="系统自动生成" disabled />
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
                    :label="`${order.orderNo} - ${order.customerName}`"
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
              <el-form-item label="应收金额" prop="amount">
                <el-input-number
                  v-model="formData.amount"
                  :min="0.01"
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                  placeholder="请输入应收金额"
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

        <!-- 收款计划 -->
        <div class="form-section">
          <div class="section-title">
            收款计划
            <el-button type="primary" link size="small" @click="handleAddPlan">
              <el-icon><Plus /></el-icon>
              添加计划
            </el-button>
          </div>
          <el-table :data="formData.collectionPlans" border size="small">
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column label="计划收款日期" width="180">
              <template #default="{ row, $index }">
                <el-date-picker
                  v-model="row.planDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                  @change="() => handlePlanChange($index)"
                />
              </template>
            </el-table-column>
            <el-table-column label="计划收款金额" width="180">
              <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.planAmount"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  style="width: 100%"
                  @change="() => handlePlanChange($index)"
                />
              </template>
            </el-table-column>
            <el-table-column label="收款方式" width="150">
              <template #default="{ row }">
                <el-select v-model="row.paymentMethod" placeholder="请选择" style="width: 100%">
                  <el-option label="银行转账" value="bank" />
                  <el-option label="承兑汇票" value="acceptance" />
                  <el-option label="商业汇票" value="trade_bill" />
                  <el-option label="现金" value="cash" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="收款方式" min-width="150">
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
            <span>计划收款总额：¥{{ totalPlanAmount.toLocaleString() }}</span>
            <span v-if="Math.abs(totalPlanAmount - formData.amount) > 0.01" class="amount-warning">
              （与应收金额不符）
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

// 客户列表
const customerList = ref([
  { id: 1, name: '深圳市腾讯科技有限公司' },
  { id: 2, name: '阿里巴巴（中国）有限公司' },
  { id: 3, name: '字节跳动科技有限公司' },
  { id: 4, name: '华为技术有限公司' },
  { id: 5, name: '京东集团股份有限公司' }
])

// 订单列表
const orderList = ref([
  { id: 'DD2024040001', orderNo: 'DD2024040001', customerName: '深圳市腾讯科技有限公司', totalAmount: 500000 },
  { id: 'DD2024040002', orderNo: 'DD2024040002', customerName: '阿里巴巴（中国）有限公司', totalAmount: 800000 },
  { id: 'DD2024040003', orderNo: 'DD2024040003', customerName: '字节跳动科技有限公司', totalAmount: 350000 }
])

// 发票列表
const invoiceList = ref([
  { id: 1, invoiceNo: 'FP2024040001', supplierName: '深圳腾讯科技', amount: 500000 },
  { id: 2, invoiceNo: 'FP2024040002', supplierName: '阿里巴巴', amount: 800000 }
])

// 表单数据
const formData = reactive({
  receivableNo: '',
  customerId: '',
  customerName: '',
  orderId: '',
  orderNo: '',
  invoiceId: null,
  invoiceNo: '',
  amount: 0,
  dueDate: '',
  remark: '',
  collectionPlans: [] as Array<{
    planDate: string
    planAmount: number
    paymentMethod: string
    remark: string
  }>
})

// 表单验证规则
const formRules: FormRules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  orderId: [{ required: true, message: '请选择关联订单', trigger: 'change' }],
  amount: [{ required: true, message: '请输入应收金额', trigger: 'blur' }],
  dueDate: [{ required: true, message: '请选择到期日期', trigger: 'change' }]
}

// 计算计划收款总额
const totalPlanAmount = computed(() => {
  return formData.collectionPlans.reduce((sum, plan) => sum + (plan.planAmount || 0), 0)
})

// 方法
const handleBack = () => {
  router.push('/receivable/list')
}

const handleCustomerChange = (customerId: number) => {
  const customer = customerList.value.find(c => c.id === customerId)
  if (customer) {
    formData.customerName = customer.name
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
  formData.collectionPlans.push({
    planDate: '',
    planAmount: 0,
    paymentMethod: '',
    remark: ''
  })
}

const handleRemovePlan = (index: number) => {
  formData.collectionPlans.splice(index, 1)
}

const handlePlanChange = (index: number) => {
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
      router.push('/receivable/list')
    }
  })
}
</script>

<style scoped>
.receivable-create-container {
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
