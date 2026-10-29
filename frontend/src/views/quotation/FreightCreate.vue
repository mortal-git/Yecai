<template>
  <div class="freight-create-container">
    <div class="page-card">
      <div class="page-header">
        <div class="page-title">{{ isEdit ? '编辑货代报价' : '新增货代报价' }}</div>
        <div class="page-actions">
          <el-button @click="handleBack">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
      </div>

      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px" class="create-form">
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="报价单名称" prop="quotationName">
              <el-input v-model="formData.quotationName" placeholder="请输入报价单名称" maxlength="100" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户名称" prop="customerName">
              <el-select v-model="formData.customerName" placeholder="请选择客户" filterable style="width: 100%">
                <el-option v-for="c in freightCustomers" :key="c.id" :label="c.name" :value="c.name" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="泓明主体" prop="entityName">
              <el-select v-model="formData.entityName" placeholder="请选择泓明主体" filterable style="width: 100%">
                <el-option v-for="e in hongmingEntities" :key="e.id" :label="e.name" :value="e.name" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否含税" prop="taxIncluded">
              <el-radio-group v-model="formData.taxIncluded">
                <el-radio :value="true">含税</el-radio>
                <el-radio :value="false">不含税</el-radio>
              </el-radio-group>
              <span class="tax-hint">税率：{{ resolveTaxRate(formData.taxIncluded) }}%</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="失效时间" prop="expiryDate">
              <el-date-picker v-model="formData.expiryDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择失效时间" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="申明" prop="declaration">
          <el-input v-model="formData.declaration" type="textarea" :rows="4" placeholder="请输入报价申明" maxlength="500" show-word-limit />
        </el-form-item>

        <el-divider content-position="left">附件</el-divider>
        <el-form-item label="报价附件">
          <div class="upload-area">
            <el-upload
              action="#"
              :auto-upload="false"
              :file-list="fileList"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
            >
              <el-button type="primary" plain>
                <el-icon><Upload /></el-icon>
                上传附件
              </el-button>
            </el-upload>
            <div class="upload-tip">支持常用文档格式，单个文件不超过 20MB</div>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules, type UploadFile, type UploadUserFile } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import {
  freightCustomers,
  freightQuotationRecords,
  generateFreightNo,
  hongmingEntities,
  resolveTaxRate,
  type FreightAttachment
} from '../../mock/freightQuotation'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)

const formRef = ref<FormInstance>()

const formData = reactive({
  quotationName: '',
  customerName: '',
  entityName: '',
  taxIncluded: true,
  expiryDate: '',
  declaration: ''
})

const fileList = ref<UploadUserFile[]>([])
const editingId = ref<number | null>(null)

const formRules: FormRules = {
  quotationName: [{ required: true, message: '请输入报价单名称', trigger: 'blur' }],
  customerName: [{ required: true, message: '请选择客户名称', trigger: 'change' }],
  entityName: [{ required: true, message: '请选择泓明主体', trigger: 'change' }],
  taxIncluded: [{ required: true, message: '请选择是否含税', trigger: 'change' }],
  expiryDate: [{ required: true, message: '请选择失效时间', trigger: 'change' }],
  declaration: [{ required: true, message: '请输入申明', trigger: 'blur' }]
}

const initForm = () => {
  const id = Number(route.params.id)
  if (id) {
    const record = freightQuotationRecords.find(item => item.id === id)
    if (record) {
      editingId.value = record.id
      formData.quotationName = record.quotationName
      formData.customerName = record.customerName
      formData.entityName = record.entityName
      formData.taxIncluded = record.taxIncluded
      formData.expiryDate = record.expiryDate
      formData.declaration = record.declaration
      fileList.value = record.attachments.map((item, index) => ({
        name: item.name,
        url: `attachment-${index}`,
        uid: item.id
      }) as unknown as UploadUserFile)
    }
  }
}

const handleFileChange = (_file: UploadFile, files: UploadUserFile[]) => {
  fileList.value = files
}

const handleFileRemove = (_file: UploadFile, files: UploadUserFile[]) => {
  fileList.value = files
}

const toAttachments = (): FreightAttachment[] => {
  return fileList.value.map((file, index) => ({
    id: Date.now() + index,
    name: file.name,
    size: formatSize(file.size),
    uploader: '当前用户',
    uploadTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }))
}

const formatSize = (size?: number) => {
  if (!size) return '-'
  if (size < 1024) return `${size}B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
  return `${(size / 1024 / 1024).toFixed(1)}MB`
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate(valid => {
    if (!valid) return

    const attachments = toAttachments()
    const taxRate = resolveTaxRate(formData.taxIncluded)

    if (editingId.value) {
      const record = freightQuotationRecords.find(item => item.id === editingId.value)
      if (!record) return
      record.quotationName = formData.quotationName
      record.customerName = formData.customerName
      record.entityName = formData.entityName
      record.taxIncluded = formData.taxIncluded
      record.taxRate = taxRate
      record.expiryDate = formData.expiryDate
      record.declaration = formData.declaration
      record.attachments = attachments
      ElMessage.success('保存成功')
    }
    else {
      const quotationNo = generateFreightNo()
      freightQuotationRecords.unshift({
        id: Date.now(),
        quotationNo,
        quotationName: formData.quotationName,
        customerName: formData.customerName,
        entityName: formData.entityName,
        taxIncluded: formData.taxIncluded,
        taxRate,
        round: 1,
        status: 'draft',
        expiryDate: formData.expiryDate,
        declaration: formData.declaration,
        createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        creator: '当前用户',
        attachments,
        approvals: [],
        versions: [
          {
            id: Date.now() + 1,
            round: 1,
            quotationName: formData.quotationName,
            customerName: formData.customerName,
            entityName: formData.entityName,
            taxIncluded: formData.taxIncluded,
            taxRate,
            expiryDate: formData.expiryDate,
            declaration: formData.declaration,
            status: 'draft',
            updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            operator: '当前用户'
          }
        ]
      })
      ElMessage.success(`新增成功：${quotationNo}`)
    }

    router.push('/quotation/freight')
  })
}

const handleBack = () => {
  router.push('/quotation/freight')
}

initForm()
</script>

<style scoped>
.freight-create-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100%;
}

.page-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.create-form {
  margin-top: 12px;
  max-width: 1000px;
}

.tax-hint {
  margin-left: 12px;
  color: #909399;
  font-size: 13px;
}

.upload-area {
  width: 100%;
}

.upload-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}
</style>
