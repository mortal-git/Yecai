<template>
  <div class="advance-create-container">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <h3>{{ isEdit ? '编辑垫付申请' : '新增垫付申请' }}</h3>
        </div>
      </template>

      <!-- 基本信息表单 -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="垫付单号" prop="advanceNo">
              <el-input v-model="form.advanceNo" disabled placeholder="系统自动生成" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请日期" prop="applyDate">
              <el-date-picker
                v-model="form.applyDate"
                type="date"
                placeholder="请选择"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请人" prop="applicantId">
              <el-select v-model="form.applicantId" placeholder="请选择" filterable style="width: 100%" @change="handleApplicantChange">
                <el-option
                  v-for="emp in employeeList"
                  :key="emp.id"
                  :label="emp.name"
                  :value="emp.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="所属部门" prop="departmentId">
              <el-select v-model="form.departmentId" placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="dept in departmentList"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="费用类型" prop="costType">
              <el-select v-model="form.costType" placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="item in costTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="关联订单" prop="orderId">
              <el-select v-model="form.orderId" filterable placeholder="可选择" clearable style="width: 100%" @change="handleOrderChange">
                <el-option
                  v-for="order in orderList"
                  :key="order.id"
                  :label="`${order.orderNo} - ${order.customerName}`"
                  :value="order.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="垫付金额" prop="advanceAmount">
              <el-input-number
                v-model="form.advanceAmount"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="请输入金额"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="垫付日期" prop="advanceDate">
              <el-date-picker
                v-model="form.advanceDate"
                type="date"
                placeholder="请选择实际支付日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="预计还款日" prop="expectedRepaymentDate">
              <el-date-picker
                v-model="form.expectedRepaymentDate"
                type="date"
                placeholder="请选择预计还款日"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="收款账户类型" prop="accountType">
              <el-select v-model="form.accountType" placeholder="请选择" style="width: 100%">
                <el-option label="个人银行账户" value="personal" />
                <el-option label="支付宝" value="alipay" />
                <el-option label="微信" value="wechat" />
                <el-option label="现金" value="cash" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="收款银行" prop="bankName">
              <el-select v-model="form.bankName" placeholder="请选择" filterable style="width: 100%">
                <el-option
                  v-for="bank in bankOptions"
                  :key="bank"
                  :label="bank"
                  :value="bank"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="收款账号" prop="accountNo">
              <el-input v-model="form.accountNo" placeholder="请输入收款账号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="费用事由" prop="costReason">
              <el-input
                v-model="form.costReason"
                type="textarea"
                :rows="2"
                placeholder="请详细描述费用产生的原因、时间、地点等信息"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 费用明细 -->
        <div class="form-section">
          <div class="section-title">费用明细</div>
          <el-table :data="form.items" border style="width: 100%">
            <el-table-column label="费用项目" min-width="150">
              <template #default="scope">
                <el-form-item :prop="`items[${scope.$index}].itemName`" :rules="rules.itemName" style="margin: 0">
                  <el-input v-model="scope.row.itemName" placeholder="请输入" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="规格说明" min-width="150">
              <template #default="scope">
                <el-form-item :prop="`items[${scope.$index}].spec`" style="margin: 0">
                  <el-input v-model="scope.row.spec" placeholder="请输入" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="数量" width="110">
              <template #default="scope">
                <el-form-item :prop="`items[${scope.$index}].quantity`" :rules="rules.quantity" style="margin: 0">
                  <el-input-number
                    v-model="scope.row.quantity"
                    :min="1"
                    :precision="0"
                    @change="calculateItem(scope.$index)"
                    style="width: 100%"
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="单价" width="130">
              <template #default="scope">
                <el-form-item :prop="`items[${scope.$index}].unitPrice`" :rules="rules.unitPrice" style="margin: 0">
                  <el-input-number
                    v-model="scope.row.unitPrice"
                    :min="0"
                    :precision="2"
                    @change="calculateItem(scope.$index)"
                    style="width: 100%"
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="金额" width="120" align="right">
              <template #default="scope">
                <span>¥{{ formatMoney(scope.row.amount || 0) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="发票号码" min-width="150">
              <template #default="scope">
                <el-form-item :prop="`items[${scope.$index}].invoiceNo`" style="margin: 0">
                  <el-input v-model="scope.row.invoiceNo" placeholder="可选" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="备注" min-width="150">
              <template #default="scope">
                <el-form-item :prop="`items[${scope.$index}].remark`" style="margin: 0">
                  <el-input v-model="scope.row.remark" placeholder="请输入" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="scope">
                <el-button
                  type="danger"
                  size="small"
                  link
                  @click="deleteItem(scope.$index)"
                  :disabled="form.items.length <= 1"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="items-footer">
            <el-button type="primary" size="small" @click="addItem">
              <el-icon><Plus /></el-icon>
              添加明细行
            </el-button>
            <span class="total-amount">
              合计金额：<strong class="text-primary">¥{{ formatMoney(totalAmount) }}</strong>
            </span>
          </div>
        </div>

        <!-- 附件上传 -->
        <div class="form-section">
          <div class="section-title">
            附件上传
            <span class="section-tip">请上传发票、支付凭证、消费小票等相关证明文件，所有发票必须清晰完整</span>
          </div>
          <el-upload
            v-model:file-list="fileList"
            :limit="10"
            accept=".jpg,.png,.pdf"
            :on-exceed="handleExceed"
            :before-upload="beforeUpload"
            list-type="text"
          >
            <el-button type="primary" icon="upload">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持JPG、PNG、PDF格式，单文件不超过10MB，最多上传10个文件。所有发票必须上传原件照片。
              </div>
            </template>
          </el-upload>
        </div>

        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="form.remark"
                type="textarea"
                :rows="2"
                placeholder="请输入其他需要说明的信息"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 底部操作栏 -->
    <div class="form-footer">
      <el-button @click="handleBack">返回</el-button>
      <el-button @click="handleSaveDraft" :loading="saveLoading">保存草稿</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitLoading">提交审核</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElForm } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const formRef = ref<InstanceType<typeof ElForm>>()
const saveLoading = ref(false)
const submitLoading = ref(false)

const isEdit = computed(() => !!route.params.id)

// 员工列表
const employeeList = ref([
  { id: '1', name: '张三', departmentId: 3, departmentName: '技术部', bankName: '招商银行', accountNo: '6214831234567890' },
  { id: '2', name: '李四', departmentId: 1, departmentName: '销售一部', bankName: '工商银行', accountNo: '6222081234567890' },
  { id: '3', name: '王五', departmentId: 2, departmentName: '销售二部', bankName: '建设银行', accountNo: '6217001234567890' },
  { id: '4', name: '赵六', departmentId: 4, departmentName: '行政部', bankName: '农业银行', accountNo: '6228481234567890' }
])

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

// 订单列表
const orderList = ref([
  { id: 1, orderNo: 'SO202602150008', customerName: '杭州制造有限公司', amount: 30000.00 },
  { id: 2, orderNo: 'SO202603010012', customerName: '北京科技有限公司', amount: 25000.00 },
  { id: 3, orderNo: 'SO202605200010', customerName: '深圳智能科技有限公司', amount: 45000.00 }
])

// 银行选项
const bankOptions = ref([
  '中国工商银行',
  '中国建设银行',
  '中国农业银行',
  '中国银行',
  '招商银行',
  '交通银行'
])

// 表单数据
const form = reactive({
  advanceNo: '',
  applyDate: '',
  applicantId: '',
  departmentId: null as number | null,
  costType: '',
  orderId: null as number | null,
  advanceAmount: 0,
  advanceDate: '',
  expectedRepaymentDate: '',
  accountType: 'personal',
  bankName: '',
  accountNo: '',
  costReason: '',
  remark: '',
  items: [
    {
      itemName: '',
      spec: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      invoiceNo: '',
      remark: ''
    }
  ]
})

// 表单校验规则
const rules = {
  applyDate: [
    { required: true, message: '请选择申请日期', trigger: 'change' }
  ],
  applicantId: [
    { required: true, message: '请选择申请人', trigger: 'change' }
  ],
  departmentId: [
    { required: true, message: '请选择所属部门', trigger: 'change' }
  ],
  costType: [
    { required: true, message: '请选择费用类型', trigger: 'change' }
  ],
  advanceAmount: [
    { required: true, message: '请输入垫付金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '垫付金额必须大于0', trigger: 'blur' }
  ],
  advanceDate: [
    { required: true, message: '请选择垫付日期', trigger: 'change' }
  ],
  accountType: [
    { required: true, message: '请选择收款账户类型', trigger: 'change' }
  ],
  accountNo: [
    { required: true, message: '请输入收款账号', trigger: 'blur' }
  ],
  costReason: [
    { required: true, message: '请输入费用事由', trigger: 'blur' }
  ],
  itemName: [
    { required: true, message: '请输入费用项目', trigger: 'blur' }
  ],
  quantity: [
    { required: true, message: '请输入数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '数量必须大于0', trigger: 'blur' }
  ],
  unitPrice: [
    { required: true, message: '请输入单价', trigger: 'blur' },
    { type: 'number', min: 0, message: '单价不能小于0', trigger: 'blur' }
  ]
}

// 上传文件列表
const fileList = ref<any[]>([])

// 计算合计
const totalAmount = computed(() => {
  return form.items.reduce((sum, item) => sum + (item.amount || 0), 0)
})

// 格式化金额
const formatMoney = (value: number) => {
  return (value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

// 申请人变化时自动带出部门和收款账户
const handleApplicantChange = (empId: string) => {
  const emp = employeeList.value.find(e => e.id === empId)
  if (emp) {
    form.departmentId = emp.departmentId
    form.bankName = emp.bankName
    form.accountNo = emp.accountNo
  }
}

// 订单变化时带出订单信息
const handleOrderChange = (orderId: number | null) => {
  // 订单选中后可在此处带出相关业务信息
  void orderId
}

// 计算行金额
const calculateItem = (index: number) => {
  const item = form.items[index]
  if (item.quantity && item.unitPrice) {
    item.amount = Number((item.quantity * item.unitPrice).toFixed(2))
  }
  form.advanceAmount = totalAmount.value
}

// 添加明细行
const addItem = () => {
  form.items.push({
    itemName: '',
    spec: '',
    quantity: 1,
    unitPrice: 0,
    amount: 0,
    invoiceNo: '',
    remark: ''
  })
}

// 删除明细行
const deleteItem = (index: number) => {
  form.items.splice(index, 1)
  form.advanceAmount = totalAmount.value
}

// 文件超出限制
const handleExceed = () => {
  ElMessage.warning('最多只能上传 10 个文件')
}

// 文件上传前校验
const beforeUpload = (file: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
  const isAllowed = allowedTypes.includes(file.type)
  if (!isAllowed) {
    ElMessage.error('只能上传JPG、PNG、PDF格式的文件')
    return false
  }
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('单文件大小不能超过 10MB')
    return false
  }
  return true
}

// 返回
const handleBack = () => {
  router.back()
}

// 保存草稿
const handleSaveDraft = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    saveLoading.value = true
    setTimeout(() => {
      saveLoading.value = false
      ElMessage.success('草稿保存成功')
      router.push('/payable/advance')
    }, 1000)
  } catch {
    ElMessage.error('表单校验失败，请检查填写内容')
  }
}

// 提交审核
const handleSubmit = async () => {
  if (!formRef.value) return

  if (fileList.value.length === 0) {
    ElMessage.warning('请至少上传一个证明文件（发票或支付凭证）')
    return
  }

  if (Math.abs(form.advanceAmount - totalAmount.value) > 0.01) {
    ElMessage.warning('垫付金额与明细合计金额不一致，请检查')
    return
  }

  try {
    await formRef.value.validate()
    submitLoading.value = true
    setTimeout(() => {
      submitLoading.value = false
      ElMessage.success('提交成功，等待审核')
      router.push('/payable/advance')
    }, 1000)
  } catch {
    ElMessage.error('表单校验失败，请检查填写内容')
  }
}

onMounted(() => {
  if (isEdit.value) {
    // 编辑模式：模拟加载数据
    const id = route.params.id
    form.advanceNo = `DF202607000${id}`
    form.applyDate = '2026-07-15'
    form.applicantId = '3'
    handleApplicantChange('3')
    form.costType = 'transportation'
    form.orderId = null
    form.advanceAmount = 450.00
    form.advanceDate = '2026-07-15'
    form.expectedRepaymentDate = '2026-07-25'
    form.accountType = 'personal'
    form.costReason = '7月打车费报销'
    form.remark = '包含上下班打车和见客户的打车费用'
    form.items = [
      {
        itemName: '打车费',
        spec: '滴滴出行',
        quantity: 15,
        unitPrice: 30.00,
        amount: 450.00,
        invoiceNo: '',
        remark: '7月1日-7月15日'
      }
    ]
  } else {
    // 新增模式：生成临时单号
    const now = new Date()
    const dateStr = now.getFullYear() + (now.getMonth() + 1).toString().padStart(2, '0')
    form.advanceNo = `DF${dateStr}XXXXXX`
    form.applyDate = now.toISOString().split('T')[0]
    form.advanceDate = now.toISOString().split('T')[0]
    form.applicantId = '1'
    handleApplicantChange('1')
  }
})
</script>

<style scoped>
.advance-create-container {
  padding: 0;
}

.form-card {
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.form-section {
  margin: 24px 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}

.section-tip {
  color: #f56c6c;
  font-size: 12px;
  font-weight: normal;
  margin-left: 8px;
}

.items-footer {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-amount {
  font-size: 14px;
}

.text-primary {
  color: #409eff;
  font-size: 16px;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  position: sticky;
  bottom: 0;
  z-index: 100;
}
</style>
