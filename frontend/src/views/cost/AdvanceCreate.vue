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
            <el-form-item label="申请单号" prop="advanceNo">
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
              <el-select v-model="form.applicantId" placeholder="请选择" style="width: 100%">
                <el-option label="张三" value="1" />
                <el-option label="李四" value="2" />
                <el-option label="王五" value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="所属部门" prop="departmentId">
              <el-select v-model="form.departmentId" placeholder="请选择" style="width: 100%">
                <el-option label="销售一部" value="1" />
                <el-option label="销售二部" value="2" />
                <el-option label="技术部" value="3" />
                <el-option label="行政部" value="4" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="费用类型" prop="costType">
              <el-select v-model="form.costType" placeholder="请选择" style="width: 100%">
                <el-option label="差旅费" value="travel" />
                <el-option label="招待费" value="entertainment" />
                <el-option label="交通费" value="transportation" />
                <el-option label="办公费" value="office" />
                <el-option label="通讯费" value="communication" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="关联订单" prop="orderId">
              <el-select v-model="form.orderId" filterable placeholder="可选择" clearable style="width: 100%">
                <el-option label="SO202402150008 - 杭州制造有限公司" value="1" />
                <el-option label="SO202403010012 - 北京科技有限公司" value="2" />
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
            <el-form-item label="收款账户" prop="paymentAccountId">
              <el-select v-model="form.paymentAccountId" placeholder="请选择" style="width: 100%">
                <el-option label="招商银行 6214831234567890" value="1" />
                <el-option label="工商银行 6222081234567890" value="2" />
                <el-option label="建设银行 6217001234567890" value="3" />
              </el-select>
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

        <el-row>
          <el-col :span="24">
            <el-form-item label="费用明细" prop="costDetails">
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
              <div style="margin-top: 10px;">
                <el-button type="primary" size="small" @click="addItem">
                  <el-icon><Plus /></el-icon>
                  添加明细行
                </el-button>
                <span style="margin-left: 20px; font-size: 14px;">
                  合计金额：<strong style="color: #409eff; font-size: 16px;">¥{{ formatMoney(totalAmount) }}</strong>
                </span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 附件上传 -->
        <div class="form-section">
          <h4>附件上传 <span style="color: red; font-size: 12px;">（请上传发票、支付凭证、消费小票等相关证明文件，所有发票必须清晰完整）</span></h4>
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
import { Plus, Upload } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const formRef = ref<InstanceType<typeof ElForm>>()
const saveLoading = ref(false)
const submitLoading = ref(false)

// 编辑模式判断
const isEdit = computed(() => !!route.params.id)

// 表单数据
const form = reactive({
  advanceNo: '',
  applyDate: '',
  applicantId: '',
  departmentId: '',
  costType: '',
  orderId: '',
  advanceAmount: 0,
  advanceDate: '',
  paymentAccountId: '',
  costReason: '',
  remark: '',
  items: [
    {
      itemName: '',
      spec: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
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
  paymentAccountId: [
    { required: true, message: '请选择收款账户', trigger: 'change' }
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
const fileList = ref([])

// 计算合计
const totalAmount = computed(() => {
  return form.items.reduce((sum, item) => sum + (item.amount || 0), 0)
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
  }
  // 自动更新总垫付金额
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
    remark: ''
  })
}

// 删除明细行
const deleteItem = (index: number) => {
  form.items.splice(index, 1)
  // 重新计算总金额
  form.advanceAmount = totalAmount.value
}

// 文件超出限制
const handleExceed = (files: any, fileList: any) => {
  ElMessage.warning(`最多只能上传 ${10} 个文件`)
}

// 文件上传前校验
const beforeUpload = (file: any) => {
  const allowedTypes = [
    'image/jpeg', 'image/png',
    'application/pdf'
  ]
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

    // 模拟保存请求
    setTimeout(() => {
      saveLoading.value = false
      ElMessage.success('草稿保存成功')
      router.push('/cost/advance')
    }, 1000)
  } catch (error) {
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

  // 校验金额是否一致
  if (Math.abs(form.advanceAmount - totalAmount.value) > 0.01) {
    ElMessage.warning('垫付金额与明细合计金额不一致，请检查')
    return
  }

  try {
    await formRef.value.validate()
    submitLoading.value = true

    // 模拟提交请求
    setTimeout(() => {
      submitLoading.value = false
      ElMessage.success('提交成功，等待审核')
      router.push('/cost/advance')
    }, 1000)
  } catch (error) {
    ElMessage.error('表单校验失败，请检查填写内容')
  }
}

onMounted(() => {
  // 如果是编辑模式，加载垫付申请数据
  if (isEdit.value) {
    // 模拟加载数据
    form.advanceNo = 'DF2024030004'
    form.applyDate = '2024-03-15'
    form.applicantId = '3'
    form.departmentId = '2'
    form.costType = 'transportation'
    form.orderId = ''
    form.advanceAmount = 450.00
    form.advanceDate = '2024-03-15'
    form.paymentAccountId = '3'
    form.costReason = '3月打车费报销'
    form.remark = '包含上下班打车和见客户的打车费用'
    form.items = [
      {
        itemName: '打车费',
        spec: '滴滴出行',
        quantity: 15,
        unitPrice: 30.00,
        amount: 450.00,
        remark: '3月1日-3月15日'
      }
    ]
  } else {
    // 新增模式，生成临时单号
    const now = new Date()
    const dateStr = now.getFullYear() + (now.getMonth() + 1).toString().padStart(2, '0')
    form.advanceNo = `DF${dateStr}XXXXXX`
    form.applyDate = now.toISOString().split('T')[0]
    form.advanceDate = now.toISOString().split('T')[0]
    form.applicantId = '1' // 默认当前登录用户
    form.departmentId = '3' // 默认当前用户部门
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
  margin: 30px 0;
}

.form-section h4 {
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
