<template>
  <div class="order-create-container">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <h3>{{ isEdit ? '编辑订单' : '新增订单' }}</h3>
          <el-tag size="large">{{ orderTypeMap[form.type] }}</el-tag>
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
            <el-form-item label="订单类型" prop="type">
              <el-select v-model="form.type" @change="handleTypeChange">
                <el-option label="销售订单" value="sale" />
                <el-option label="采购订单" value="purchase" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="订单编号" prop="orderNo">
              <el-input v-model="form.orderNo" disabled placeholder="系统自动生成" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="客户/供应商" prop="customerId">
              <el-select v-model="form.customerId" filterable placeholder="请选择" style="width: 100%">
                <el-option label="北京科技有限公司" value="1" />
                <el-option label="上海贸易有限公司" value="2" />
                <el-option label="广州电子有限公司" value="3" />
                <el-option label="深圳信息技术有限公司" value="4" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="订单日期" prop="orderDate">
              <el-date-picker
                v-model="form.orderDate"
                type="date"
                placeholder="请选择"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="预计交付/收货日期" prop="expectedDate">
              <el-date-picker
                v-model="form.expectedDate"
                type="date"
                placeholder="请选择"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="销售/采购部门" prop="departmentId">
              <el-select v-model="form.departmentId" placeholder="请选择" style="width: 100%">
                <el-option label="销售一部" value="1" />
                <el-option label="销售二部" value="2" />
                <el-option label="采购部" value="3" />
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
          <el-col :span="8">
            <el-form-item label="合同编号" prop="contractNo">
              <el-input v-model="form.contractNo" placeholder="请输入合同编号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="关联项目" prop="projectId">
              <el-select v-model="form.projectId" placeholder="可选择" clearable style="width: 100%">
                <el-option label="项目A" value="1" />
                <el-option label="项目B" value="2" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="form.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入备注信息，最多500字"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 订单明细表格 -->
        <div class="table-section">
          <div class="table-header">
            <h4>订单明细</h4>
            <el-button type="primary" size="small" @click="addItem">
              <el-icon><Plus /></el-icon>
              添加行
            </el-button>
          </div>

          <el-table :data="form.items" border style="width: 100%">
            <el-table-column label="商品/服务名称" min-width="150">
              <template #default="scope">
                <el-form-item :prop="`items[${scope.$index}].itemName`" :rules="rules.itemName" style="margin: 0">
                  <el-input v-model="scope.row.itemName" placeholder="请输入" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="规格型号" min-width="120">
              <template #default="scope">
                <el-form-item :prop="`items[${scope.$index}].spec`" style="margin: 0">
                  <el-input v-model="scope.row.spec" placeholder="请输入" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="单位" width="100">
              <template #default="scope">
                <el-form-item :prop="`items[${scope.$index}].unit`" :rules="rules.unit" style="margin: 0">
                  <el-select v-model="scope.row.unit" placeholder="请选择">
                    <el-option label="台" value="台" />
                    <el-option label="件" value="件" />
                    <el-option label="套" value="套" />
                    <el-option label="次" value="次" />
                    <el-option label="项" value="项" />
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
        <div class="attachment-section">
          <h4>附件上传</h4>
          <el-upload
            v-model:file-list="fileList"
            :limit="10"
            accept=".jpg,.png,.pdf,.doc,.docx,.xls,.xlsx"
            :on-exceed="handleExceed"
            :before-upload="beforeUpload"
            list-type="text"
          >
            <el-button type="primary" icon="upload">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持JPG、PNG、PDF、Word、Excel格式，单文件不超过10MB，最多上传10个文件
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElForm } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const formRef = ref<InstanceType<typeof ElForm>>()
const saveLoading = ref(false)
const submitLoading = ref(false)

const orderTypeMap: Record<string, string> = {
  'sale': '销售订单',
  'purchase': '采购订单'
}

// 编辑模式判断
const isEdit = computed(() => !!route.params.id)

// 表单数据
const form = reactive({
  type: 'sale',
  orderNo: '',
  customerId: '',
  orderDate: '',
  expectedDate: '',
  departmentId: '',
  responsibleId: '',
  contractNo: '',
  projectId: '',
  remark: '',
  items: [
    {
      itemName: '',
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
  type: [
    { required: true, message: '请选择订单类型', trigger: 'change' }
  ],
  customerId: [
    { required: true, message: '请选择客户/供应商', trigger: 'change' }
  ],
  orderDate: [
    { required: true, message: '请选择订单日期', trigger: 'change' }
  ],
  expectedDate: [
    { required: true, message: '请选择预计交付/收货日期', trigger: 'change' }
  ],
  departmentId: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  responsibleId: [
    { required: true, message: '请选择责任人', trigger: 'change' }
  ],
  itemName: [
    { required: true, message: '请输入商品/服务名称', trigger: 'blur' }
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

// 订单类型变化
const handleTypeChange = () => {
  // 可以根据订单类型做一些联动处理
}

// 计算行金额
const calculateItem = (index: number) => {
  const item = form.items[index]
  if (item.quantity && item.unitPrice) {
    item.amount = Number((item.quantity * item.unitPrice).toFixed(2))
    item.taxAmount = Number((item.amount * (item.taxRate / 100)).toFixed(2))
    item.totalAmount = Number((item.amount + item.taxAmount).toFixed(2))
  }
}

// 添加明细行
const addItem = () => {
  form.items.push({
    itemName: '',
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
}

// 文件超出限制
const handleExceed = (files: any, fileList: any) => {
  ElMessage.warning(`最多只能上传 ${10} 个文件`)
}

// 文件上传前校验
const beforeUpload = (file: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
  const isAllowed = allowedTypes.includes(file.type)
  if (!isAllowed) {
    ElMessage.error('只能上传JPG、PNG、PDF、Word、Excel格式的文件')
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
      router.push('/order/list')
    }, 1000)
  } catch (error) {
    ElMessage.error('表单校验失败，请检查填写内容')
  }
}

// 提交审核
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    // 模拟提交请求
    setTimeout(() => {
      submitLoading.value = false
      ElMessage.success('提交成功，等待审核')
      router.push('/order/list')
    }, 1000)
  } catch (error) {
    ElMessage.error('表单校验失败，请检查填写内容')
  }
}

onMounted(() => {
  // 如果是编辑模式，加载订单数据
  if (isEdit.value) {
    // 模拟加载数据
    form.type = 'sale'
    form.orderNo = 'SO202401010001'
    form.customerId = '1'
    form.orderDate = '2024-01-01'
    form.expectedDate = '2024-01-15'
    form.departmentId = '1'
    form.responsibleId = '1'
    form.contractNo = 'HT20240001'
    form.remark = '这是一个测试订单'
    form.items = [
      {
        itemName: '服务器主机',
        spec: 'Intel Xeon 32G 1T SSD',
        unit: '台',
        quantity: 2,
        unitPrice: 35000.00,
        amount: 70000.00,
        taxRate: 13,
        taxAmount: 9100.00,
        totalAmount: 79100.00,
        remark: ''
      },
      {
        itemName: '操作系统',
        spec: 'Windows Server 2022',
        unit: '套',
        quantity: 2,
        unitPrice: 4500.00,
        amount: 9000.00,
        taxRate: 13,
        taxAmount: 1170.00,
        totalAmount: 10170.00,
        remark: ''
      }
    ]
  } else {
    // 新增模式，生成临时订单号
    const now = new Date()
    const dateStr = now.getFullYear() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0')
    form.orderNo = `${form.type === 'sale' ? 'SO' : 'PO'}${dateStr}XXXXXX`
    form.orderDate = now.toISOString().split('T')[0]
  }
})
</script>

<style scoped>
.order-create-container {
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

.table-section {
  margin: 30px 0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.table-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
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

.attachment-section {
  margin-top: 30px;
}

.attachment-section h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
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
