<template>
  <div class="prepayment-create-container">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <h3>{{ isEdit ? '编辑预付款申请' : '新增预付款申请' }}</h3>
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
            <el-form-item label="申请单号" prop="prepaymentNo">
              <el-input v-model="form.prepaymentNo" disabled placeholder="系统自动生成" />
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
            <el-form-item label="供应商" prop="supplierId">
              <el-select v-model="form.supplierId" filterable placeholder="请选择" style="width: 100%">
                <el-option label="深圳硬件供应商" value="1" />
                <el-option label="北京云服务商" value="2" />
                <el-option label="上海软件公司" value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="业务类型" prop="businessType">
              <el-select v-model="form.businessType" placeholder="请选择" style="width: 100%">
                <el-option label="采购类" value="purchase" />
                <el-option label="服务类" value="service" />
                <el-option label="保证金类" value="deposit" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="预计付款日" prop="expectedPaymentDate">
              <el-date-picker
                v-model="form.expectedPaymentDate"
                type="date"
                placeholder="请选择"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="预付金额" prop="prepaymentAmount">
              <el-input-number
                v-model="form.prepaymentAmount"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="请输入金额"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="付款方式" prop="paymentType">
              <el-select v-model="form.paymentType" placeholder="请选择" style="width: 100%">
                <el-option label="银行转账" value="bank_transfer" />
                <el-option label="承兑汇票" value="acceptance" />
                <el-option label="现金" value="cash" />
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

        <el-row>
          <el-col :span="24">
            <el-form-item label="付款事由" prop="paymentReason">
              <el-input
                v-model="form.paymentReason"
                type="textarea"
                :rows="2"
                placeholder="请详细描述付款事由"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

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

        <!-- 附件上传 -->
        <div class="form-section">
          <h4>附件上传 <span style="color: red; font-size: 12px;">（请上传付款申请单、合同、报价单等相关证明文件）</span></h4>
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
import { Upload } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const formRef = ref<InstanceType<typeof ElForm>>()
const saveLoading = ref(false)
const submitLoading = ref(false)

// 编辑模式判断
const isEdit = computed(() => !!route.params.id)

// 表单数据
const form = reactive({
  prepaymentNo: '',
  applyDate: '',
  applicantId: '',
  supplierId: '',
  businessType: '',
  expectedPaymentDate: '',
  prepaymentAmount: 0,
  paymentType: '',
  orderId: '',
  paymentReason: '',
  remark: ''
})

// 表单校验规则
const rules = {
  applyDate: [
    { required: true, message: '请选择申请日期', trigger: 'change' }
  ],
  applicantId: [
    { required: true, message: '请选择申请人', trigger: 'change' }
  ],
  supplierId: [
    { required: true, message: '请选择供应商', trigger: 'change' }
  ],
  businessType: [
    { required: true, message: '请选择业务类型', trigger: 'change' }
  ],
  expectedPaymentDate: [
    { required: true, message: '请选择预计付款日', trigger: 'change' }
  ],
  prepaymentAmount: [
    { required: true, message: '请输入预付金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '预付金额必须大于0', trigger: 'blur' }
  ],
  paymentType: [
    { required: true, message: '请选择付款方式', trigger: 'change' }
  ],
  paymentReason: [
    { required: true, message: '请输入付款事由', trigger: 'blur' }
  ]
}

// 上传文件列表
const fileList = ref([])

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
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
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
      router.push('/cost/prepayment')
    }, 1000)
  } catch (error) {
    ElMessage.error('表单校验失败，请检查填写内容')
  }
}

// 提交审核
const handleSubmit = async () => {
  if (!formRef.value) return

  if (fileList.value.length === 0) {
    ElMessage.warning('请至少上传一个证明文件')
    return
  }

  try {
    await formRef.value.validate()
    submitLoading.value = true

    // 模拟提交请求
    setTimeout(() => {
      submitLoading.value = false
      ElMessage.success('提交成功，等待审核')
      router.push('/cost/prepayment')
    }, 1000)
  } catch (error) {
    ElMessage.error('表单校验失败，请检查填写内容')
  }
}

onMounted(() => {
  // 如果是编辑模式，加载预付款数据
  if (isEdit.value) {
    // 模拟加载数据
    form.prepaymentNo = 'YF2024030003'
    form.applyDate = '2024-03-15'
    form.applicantId = '1'
    form.supplierId = '4'
    form.businessType = 'service'
    form.expectedPaymentDate = '2024-03-25'
    form.prepaymentAmount = 200000.00
    form.paymentType = 'bank_transfer'
    form.orderId = ''
    form.paymentReason = '办公室装修预付款'
    form.remark = '按合同约定支付30%预付款'
  } else {
    // 新增模式，生成临时单号
    const now = new Date()
    const dateStr = now.getFullYear() + (now.getMonth() + 1).toString().padStart(2, '0')
    form.prepaymentNo = `YF${dateStr}XXXXXX`
    form.applyDate = now.toISOString().split('T')[0]
    form.applicantId = '1' // 默认当前登录用户
  }
})
</script>

<style scoped>
.prepayment-create-container {
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
