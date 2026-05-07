<template>
  <div class="monthly-create-container">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <h3>{{ isEdit ? '编辑月结成本' : '新增月结成本' }}</h3>
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
            <el-form-item label="成本单号" prop="costNo">
              <el-input v-model="form.costNo" disabled placeholder="系统自动生成" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="结算月份" prop="settleMonth">
              <el-date-picker
                v-model="form.settleMonth"
                type="month"
                placeholder="请选择"
                value-format="YYYY-MM"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="供应商" prop="supplierId">
              <el-select v-model="form.supplierId" filterable placeholder="请选择" style="width: 100%">
                <el-option label="上海电子有限公司" value="1" />
                <el-option label="深圳科技有限公司" value="2" />
                <el-option label="广州贸易有限公司" value="3" />
                <el-option label="北京服务商有限公司" value="4" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="供应商账单号" prop="billNo">
              <el-input v-model="form.billNo" placeholder="请输入供应商账单号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="账单日期" prop="billDate">
              <el-date-picker
                v-model="form.billDate"
                type="date"
                placeholder="请选择"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="所属部门" prop="departmentId">
              <el-select v-model="form.departmentId" placeholder="请选择" style="width: 100%">
                <el-option label="销售一部" value="1" />
                <el-option label="销售二部" value="2" />
                <el-option label="技术部" value="3" />
                <el-option label="运维部" value="4" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="责任人" prop="responsibleId">
              <el-select v-model="form.responsibleId" placeholder="请选择" style="width: 100%">
                <el-option label="张三" value="1" />
                <el-option label="李四" value="2" />
                <el-option label="王五" value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="form.remark"
                type="textarea"
                :rows="1"
                placeholder="请输入备注信息"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 关联订单选择 -->
        <div class="form-section">
          <div class="section-header">
            <h4>关联订单</h4>
            <el-button type="primary" size="small" @click="showOrderSelect = true">
              <el-icon><Plus /></el-icon>
              添加关联订单
            </el-button>
          </div>

          <el-table :data="form.relatedOrders" border style="width: 100%">
            <el-table-column prop="orderNo" label="订单编号" min-width="160" />
            <el-table-column prop="customerName" label="客户名称" min-width="180" />
            <el-table-column prop="orderAmount" label="订单金额" width="140" align="right" :formatter="formatMoney" />
            <el-table-column prop="orderDate" label="订单日期" width="120" />
            <el-table-column label="分摊成本" width="140">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.costAmount"
                  :min="0"
                  :precision="2"
                  @change="calculateTotal"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="备注" min-width="150">
              <template #default="scope">
                <el-input v-model="scope.row.remark" placeholder="请输入" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="scope">
                <el-button
                  type="danger"
                  size="small"
                  link
                  @click="removeOrder(scope.$index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 成本明细 -->
        <div class="form-section">
          <div class="section-header">
            <h4>成本明细</h4>
            <el-button type="primary" size="small" @click="addItem">
              <el-icon><Plus /></el-icon>
              添加明细行
            </el-button>
          </div>

          <el-table :data="form.items" border style="width: 100%">
            <el-table-column label="费用名称" min-width="150">
              <template #default="scope">
                <el-form-item :prop="`items[${scope.$index}].itemName`" :rules="rules.itemName" style="margin: 0">
                  <el-input v-model="scope.row.itemName" placeholder="请输入" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="费用类型" width="130">
              <template #default="scope">
                <el-form-item :prop="`items[${scope.$index}].expenseType`" :rules="rules.expenseType" style="margin: 0">
                  <el-select v-model="scope.row.expenseType" placeholder="请选择">
                    <el-option label="采购成本" value="purchase" />
                    <el-option label="服务成本" value="service" />
                    <el-option label="物流成本" value="logistics" />
                    <el-option label="人力成本" value="labor" />
                    <el-option label="办公成本" value="office" />
                    <el-option label="其他成本" value="other" />
                  </el-select>
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
            <el-table-column label="单位" width="80">
              <template #default="scope">
                <el-form-item :prop="`items[${scope.$index}].unit`" :rules="rules.unit" style="margin: 0">
                  <el-select v-model="scope.row.unit" placeholder="请选择">
                    <el-option label="台" value="台" />
                    <el-option label="件" value="件" />
                    <el-option label="套" value="套" />
                    <el-option label="次" value="次" />
                    <el-option label="项" value="项" />
                    <el-option label="人天" value="人天" />
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="数量" width="100">
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
            <el-table-column label="单价" width="120">
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
            <el-table-column label="金额" width="120">
              <template #default="scope">
                <span>{{ formatMoney(scope.row.amount || 0) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="税率" width="100">
              <template #default="scope">
                <el-form-item :prop="`items[${scope.$index}].taxRate`" :rules="rules.taxRate" style="margin: 0">
                  <el-select v-model="scope.row.taxRate" @change="calculateItem(scope.$index)">
                    <el-option :label="0 + '%'" :value="0" />
                    <el-option :label="6 + '%'" :value="6" />
                    <el-option :label="9 + '%'" :value="9" />
                    <el-option :label="13 + '%'" :value="13" />
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="税额" width="120">
              <template #default="scope">
                <span>{{ formatMoney(scope.row.taxAmount || 0) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="价税合计" width="140">
              <template #default="scope">
                <span>{{ formatMoney(scope.row.totalAmount || 0) }}</span>
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

          <!-- 合计行 -->
          <div class="total-row">
            <div class="total-item">
              <span class="label">总金额：</span>
              <span class="value">¥{{ formatMoney(totalAmount) }}</span>
            </div>
            <div class="total-item">
              <span class="label">总税额：</span>
              <span class="value">¥{{ formatMoney(totalTax) }}</span>
            </div>
            <div class="total-item">
              <span class="label">价税合计：</span>
              <span class="value total">¥{{ formatMoney(totalAmount + totalTax) }}</span>
            </div>
          </div>
        </div>

        <!-- 附件上传 -->
        <div class="form-section">
          <h4>附件上传</h4>
          <el-upload
            v-model:file-list="fileList"
            :limit="10"
            accept=".jpg,.png,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
            :on-exceed="handleExceed"
            :before-upload="beforeUpload"
            list-type="text"
          >
            <el-button type="primary" icon="upload">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持JPG、PNG、PDF、Word、Excel、压缩包格式，单文件不超过10MB，最多上传10个文件
              </div>
            </template>
          </el-upload>
        </div>
      </el-form>
    </el-card>

    <!-- 底部操作栏 -->
    <div class="form-footer">
      <el-button @click="handleBack">返回</el-button>
      <el-button @click="handleSaveDraft" :loading="saveLoading">保存草稿</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitLoading">提交审核</el-button>
    </div>

    <!-- 选择订单对话框 -->
    <el-dialog v-model="showOrderSelect" title="选择关联订单" width="80%">
      <div class="search-bar">
        <el-input
          v-model="orderSearchKey"
          placeholder="搜索订单号/客户名称"
          style="width: 300px; margin-right: 10px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="searchOrder">搜索</el-button>
      </div>
      <el-table :data="orderList" border style="margin-top: 20px">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="orderNo" label="订单编号" min-width="160" />
        <el-table-column prop="customerName" label="客户名称" min-width="180" />
        <el-table-column prop="orderAmount" label="订单金额" width="140" align="right" :formatter="formatMoney" />
        <el-table-column prop="orderDate" label="订单日期" width="120" />
        <el-table-column prop="orderStatus" label="订单状态" width="110">
          <template #default="scope">
            <el-tag type="success">{{ scope.row.orderStatus }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showOrderSelect = false">取消</el-button>
          <el-button type="primary" @click="confirmSelectOrder">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElForm } from 'element-plus'
import { Plus, Search, Upload } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const formRef = ref<InstanceType<typeof ElForm>>()
const saveLoading = ref(false)
const submitLoading = ref(false)
const showOrderSelect = ref(false)
const orderSearchKey = ref('')

// 编辑模式判断
const isEdit = computed(() => !!route.params.id)

// 表单数据
const form = reactive({
  costNo: '',
  settleMonth: '',
  supplierId: '',
  billNo: '',
  billDate: '',
  departmentId: '',
  responsibleId: '',
  remark: '',
  relatedOrders: [] as any[],
  items: [
    {
      itemName: '',
      expenseType: '',
      spec: '',
      unit: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      taxRate: 13,
      taxAmount: 0,
      totalAmount: 0,
      remark: ''
    }
  ]
})

// 表单校验规则
const rules = {
  settleMonth: [
    { required: true, message: '请选择结算月份', trigger: 'change' }
  ],
  supplierId: [
    { required: true, message: '请选择供应商', trigger: 'change' }
  ],
  billNo: [
    { required: true, message: '请输入供应商账单号', trigger: 'blur' }
  ],
  billDate: [
    { required: true, message: '请选择账单日期', trigger: 'change' }
  ],
  departmentId: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  responsibleId: [
    { required: true, message: '请选择责任人', trigger: 'change' }
  ],
  itemName: [
    { required: true, message: '请输入费用名称', trigger: 'blur' }
  ],
  expenseType: [
    { required: true, message: '请选择费用类型', trigger: 'change' }
  ],
  unit: [
    { required: true, message: '请选择单位', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '数量必须大于0', trigger: 'blur' }
  ],
  unitPrice: [
    { required: true, message: '请输入单价', trigger: 'blur' },
    { type: 'number', min: 0, message: '单价不能小于0', trigger: 'blur' }
  ],
  taxRate: [
    { required: true, message: '请选择税率', trigger: 'change' }
  ]
}

// 上传文件列表
const fileList = ref([])

// 订单列表
const orderList = ref([
  {
    id: 1,
    orderNo: 'SO202401010001',
    customerName: '北京科技有限公司',
    orderAmount: 128000.00,
    orderDate: '2024-01-01',
    orderStatus: '已生效'
  },
  {
    id: 2,
    orderNo: 'SO202401050003',
    customerName: '广州电子有限公司',
    orderAmount: 256000.00,
    orderDate: '2024-01-05',
    orderStatus: '已生效'
  },
  {
    id: 3,
    orderNo: 'PO202401100005',
    customerName: '深圳信息技术有限公司',
    orderAmount: 86000.00,
    orderDate: '2024-01-10',
    orderStatus: '已完成'
  },
  {
    id: 4,
    orderNo: 'SO202401150008',
    customerName: '杭州制造有限公司',
    orderAmount: 168000.00,
    orderDate: '2024-01-15',
    orderStatus: '已生效'
  }
])

// 已选择的订单
const selectedOrders = ref<any[]>([])

// 计算合计
const totalAmount = computed(() => {
  return form.items.reduce((sum, item) => sum + (item.amount || 0), 0)
})

const totalTax = computed(() => {
  return form.items.reduce((sum, item) => sum + (item.taxAmount || 0), 0)
})

// 格式化金额
const formatMoney = (value: number) => {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

// 计算行金额
const calculateItem = (index: number) => {
  const item = form.items[index]
  if (item.quantity && item.unitPrice) {
    item.amount = Number((item.quantity * item.unitPrice).toFixed(2))
    item.taxAmount = Number((item.amount * (item.taxRate / 100)).toFixed(2))
    item.totalAmount = Number((item.amount + item.taxAmount).toFixed(2))
  }
  calculateTotal()
}

// 计算总计
const calculateTotal = () => {
  // 这里可以添加分摊成本和总成本的校验逻辑
}

// 添加明细行
const addItem = () => {
  form.items.push({
    itemName: '',
    expenseType: '',
    spec: '',
    unit: '',
    quantity: 1,
    unitPrice: 0,
    amount: 0,
    taxRate: 13,
    taxAmount: 0,
    totalAmount: 0,
    remark: ''
  })
}

// 删除明细行
const deleteItem = (index: number) => {
  form.items.splice(index, 1)
  calculateTotal()
}

// 移除关联订单
const removeOrder = (index: number) => {
  form.relatedOrders.splice(index, 1)
  calculateTotal()
}

// 搜索订单
const searchOrder = () => {
  ElMessage.success('搜索完成')
}

// 确认选择订单
const confirmSelectOrder = () => {
  // 获取选中的订单
  const selected = orderList.value.filter(order =>
    // 这里应该获取表格选中的行，简化处理
    Math.random() > 0.5
  )

  // 添加到关联订单列表，避免重复
  selected.forEach(order => {
    const exists = form.relatedOrders.some(item => item.id === order.id)
    if (!exists) {
      form.relatedOrders.push({
        ...order,
        costAmount: 0,
        remark: ''
      })
    }
  })

  showOrderSelect.value = false
  ElMessage.success(`已添加 ${selected.length} 个订单`)
}

// 文件超出限制
const handleExceed = (files: any, fileList: any) => {
  ElMessage.warning(`最多只能上传 ${10} 个文件`)
}

// 文件上传前校验
const beforeUpload = (file: any) => {
  const allowedTypes = [
    'image/jpeg', 'image/png',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip', 'application/x-rar-compressed', 'application/x-zip-compressed'
  ]
  const isAllowed = allowedTypes.includes(file.type)
  if (!isAllowed) {
    ElMessage.error('只能上传JPG、PNG、PDF、Word、Excel、压缩包格式的文件')
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

    // 模拟保存请求
    setTimeout(() => {
      saveLoading.value = false
      ElMessage.success('草稿保存成功')
      router.push('/cost/monthly')
    }, 1000)
  } catch (error) {
    ElMessage.error('表单校验失败，请检查填写内容')
  }
}

// 提交审核
const handleSubmit = async () => {
  if (!formRef.value) return

  // 校验关联订单和金额
  if (form.relatedOrders.length === 0) {
    ElMessage.warning('请至少关联一个订单')
    return
  }

  const totalCostAmount = form.relatedOrders.reduce((sum, item) => sum + (item.costAmount || 0), 0)
  if (Math.abs(totalCostAmount - (totalAmount.value + totalTax.value)) > 0.01) {
    ElMessage.warning('分摊成本总和必须等于总成本金额')
    return
  }

  try {
    await formRef.value.validate()
    submitLoading.value = true

    // 模拟提交请求
    setTimeout(() => {
      submitLoading.value = false
      ElMessage.success('提交成功，等待审核')
      router.push('/cost/monthly')
    }, 1000)
  } catch (error) {
    ElMessage.error('表单校验失败，请检查填写内容')
  }
}

onMounted(() => {
  // 如果是编辑模式，加载成本数据
  if (isEdit.value) {
    // 模拟加载数据
    form.costNo = 'YJ2024020002'
    form.settleMonth = '2024-02'
    form.supplierId = '4'
    form.billNo = 'BJ20240200112'
    form.billDate = '2024-02-28'
    form.departmentId = '4'
    form.responsibleId = '1'
    form.remark = '2024年2月运维服务费'
    form.relatedOrders = [
      {
        id: 4,
        orderNo: 'SO202401150008',
        customerName: '杭州制造有限公司',
        orderAmount: 168000.00,
        orderDate: '2024-01-15',
        orderStatus: '已生效',
        costAmount: 45000.00,
        remark: ''
      }
    ]
    form.items = [
      {
        itemName: '运维服务费',
        expenseType: 'service',
        spec: '2024年2月服务器运维服务',
        unit: '项',
        quantity: 1,
        unitPrice: 45000.00,
        amount: 45000.00,
        taxRate: 6,
        taxAmount: 2700.00,
        totalAmount: 47700.00,
        remark: ''
      }
    ]
  } else {
    // 新增模式，生成临时单号
    const now = new Date()
    const dateStr = now.getFullYear() + (now.getMonth() + 1).toString().padStart(2, '0')
    form.costNo = `YJ${dateStr}XXXXXX`
    form.settleMonth = dateStr
  }
})
</script>

<style scoped>
.monthly-create-container {
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
  margin: 30px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.search-bar {
  display: flex;
  align-items: center;
}

.total-row {
  display: flex;
  justify-content: flex-end;
  gap: 40px;
  padding: 15px 20px;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-top: none;
  font-weight: 500;
}

.total-item .label {
  color: #606266;
  margin-right: 8px;
}

.total-item .value {
  color: #303133;
}

.total-item .value.total {
  color: #409eff;
  font-size: 18px;
  font-weight: 600;
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

.dialog-footer {
  text-align: right;
}
</style>
