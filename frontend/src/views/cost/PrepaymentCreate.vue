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
            <el-form-item label="预付款单号" prop="prepaymentNo">
              <el-input v-model="form.prepaymentNo" disabled placeholder="系统自动生成" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="供应商" prop="supplierId">
              <el-select v-model="form.supplierId" filterable placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="supplier in supplierList"
                  :key="supplier.id"
                  :label="`${supplier.code} - ${supplier.name}`"
                  :value="supplier.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="结算单位" prop="settlementUnit">
              <el-select v-model="form.settlementUnit" filterable placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="item in settlementUnitOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="结算银行" prop="settlementBank">
              <el-select v-model="form.settlementBank" filterable placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="item in settlementBankOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="结算账号" prop="settlementAccount">
              <el-select v-model="form.settlementAccount" filterable placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="item in settlementAccountOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="预付款公司" prop="prepaymentCompany">
              <el-select v-model="form.prepaymentCompany" placeholder="请选择" style="width: 100%" @change="handleCompanyChange">
                <el-option label="总部" value="总部" />
                <el-option label="北京分公司" value="北京分公司" />
                <el-option label="上海分公司" value="上海分公司" />
                <el-option label="广州分公司" value="广州分公司" />
                <el-option label="杭州分公司" value="杭州分公司" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="公司银行" prop="companyBank">
              <el-select v-model="form.companyBank" placeholder="请选择" filterable style="width: 100%">
                <el-option v-for="item in companyBankOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="公司账号" prop="companyAccount">
              <el-select v-model="form.companyAccount" placeholder="请选择" filterable style="width: 100%">
                <el-option v-for="item in companyAccountOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="仓库代码" prop="warehouseCode">
              <el-select v-model="form.warehouseCode" placeholder="请选择" style="width: 100%">
                <el-option label="WH001" value="WH001" />
                <el-option label="WH002" value="WH002" />
                <el-option label="WH003" value="WH003" />
                <el-option label="WH004" value="WH004" />
                <el-option label="WH005" value="WH005" />
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
          <el-col :span="8">
            <el-form-item label="费用项目" prop="expenseItem">
              <el-select v-model="form.expenseItem" placeholder="请选择" style="width: 100%">
                <el-option label="搬运费" value="搬运费" />
                <el-option label="装卸费" value="装卸费" />
                <el-option label="KJ3税金" value="KJ3税金" />
                <el-option label="机场提货费" value="机场提货费" />
                <el-option label="海关监管仓库费" value="海关监管仓库费" />
                <el-option label="仓储费" value="仓储费" />
                <el-option label="磁检费" value="磁检费" />
                <el-option label="港杂费" value="港杂费" />
                <el-option label="品质鉴定报告费" value="品质鉴定报告费" />
                <el-option label="宽带网络费" value="宽带网络费" />
                <el-option label="换单费" value="换单费" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="币种" prop="currency">
              <el-select v-model="form.currency" placeholder="请选择" style="width: 100%">
                <el-option label="人民币 (CNY)" value="CNY" />
                <el-option label="美元 (USD)" value="USD" />
                <el-option label="欧元 (EUR)" value="EUR" />
                <el-option label="港币 (HKD)" value="HKD" />
              </el-select>
            </el-form-item>
          </el-col>
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
            <el-form-item label="费率单编号" prop="rateSheetNo">
              <el-select v-model="form.rateSheetNo" placeholder="请选择" style="width: 100%" @change="handleRateSheetChange">
                <el-option
                  v-for="item in rateSheetList"
                  :key="item.rateSheetNo"
                  :label="item.rateSheetNo"
                  :value="item.rateSheetNo"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="业务参考编号" prop="businessRefNo">
              <el-input v-model="form.businessRefNo" placeholder="自动获取" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="收入项目" prop="incomeItem">
              <el-select v-model="form.incomeItem" placeholder="请选择" style="width: 100%">
                <el-option label="仓储费" value="仓储费" />
                <el-option label="装卸费" value="装卸费" />
                <el-option label="港杂费" value="港杂费" />
                <el-option label="机场提货费" value="机场提货费" />
                <el-option label="换单费" value="换单费" />
                <el-option label="其他收入" value="其他收入" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="提单号" prop="billNo">
              <el-input v-model="form.billNo" placeholder="请输入提单号" />
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

const router = useRouter()
const route = useRoute()
const formRef = ref<InstanceType<typeof ElForm>>()
const saveLoading = ref(false)
const submitLoading = ref(false)

// 编辑模式判断
const isEdit = computed(() => !!route.params.id)

// 供应商列表
const supplierList = ref([
  { id: 1, code: 'SUP001', name: '深圳硬件供应商A公司', account: '75512345678' },
  { id: 2, code: 'SUP002', name: '北京云服务B公司', account: '62170012345' },
  { id: 3, code: 'SUP003', name: '上海软件C公司', account: '62220811111' },
  { id: 4, code: 'SUP004', name: '广州物流D公司', account: '62284812345' },
  { id: 5, code: 'SUP005', name: '杭州装修E公司', account: '62220822222' }
])

// 结算单位选项
const settlementUnitOptions = ref([
  '深圳硬件供应商A公司',
  '北京云服务B公司',
  '上海软件C公司',
  '广州物流D公司',
  '杭州装修E公司'
])

// 结算银行选项
const settlementBankOptions = ref([
  '中国工商银行',
  '中国建设银行',
  '中国农业银行',
  '中国银行',
  '招商银行',
  '交通银行'
])

// 结算账号选项
const settlementAccountOptions = ref([
  '75512345678',
  '62170012345',
  '62220811111',
  '62284812345',
  '62220822222'
])

// 费率单列表
const rateSheetList = ref([
  { rateSheetNo: 'FL2024040001', businessRefNo: 'PO2024040001', incomeItem: '仓储费' },
  { rateSheetNo: 'FL2024040002', businessRefNo: 'PO2024040002', incomeItem: '装卸费' },
  { rateSheetNo: 'FL2024040003', businessRefNo: 'PO2024040003', incomeItem: '港杂费' },
  { rateSheetNo: 'FL2024040004', businessRefNo: 'PO2024040004', incomeItem: '机场提货费' },
  { rateSheetNo: 'FL2024040005', businessRefNo: 'PO2024040005', incomeItem: '换单费' },
  { rateSheetNo: 'FL2024040006', businessRefNo: 'PO2024040006', incomeItem: '仓储费' },
  { rateSheetNo: 'FL2024040007', businessRefNo: 'PO2024040007', incomeItem: '其他收入' }
])

// 表单数据
const form = reactive({
  prepaymentNo: '',
  supplierId: '',
  settlementUnit: '',
  settlementBank: '',
  settlementAccount: '',
  prepaymentCompany: '',
  companyBank: '',
  companyAccount: '',
  warehouseCode: '',
  businessRefNo: '',
  rateSheetNo: '',
  incomeItem: '',
  billNo: '',
  expenseItem: '',
  currency: 'CNY',
  prepaymentAmount: 0,
  expectedPaymentDate: '',
  remark: ''
})

// 表单校验规则
const rules = {
  supplierId: [
    { required: true, message: '请选择供应商', trigger: 'change' }
  ],
  settlementUnit: [
    { required: true, message: '请选择结算单位', trigger: 'change' }
  ],
  settlementBank: [
    { required: true, message: '请选择结算银行', trigger: 'change' }
  ],
  settlementAccount: [
    { required: true, message: '请选择结算账号', trigger: 'change' }
  ],
  prepaymentCompany: [
    { required: true, message: '请选择预付款公司', trigger: 'change' }
  ],
  warehouseCode: [
    { required: true, message: '请选择仓库代码', trigger: 'change' }
  ],
  expenseItem: [
    { required: true, message: '请选择费用项目', trigger: 'change' }
  ],
  currency: [
    { required: true, message: '请选择币种', trigger: 'change' }
  ],
  prepaymentAmount: [
    { required: true, message: '请输入预付金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '预付金额必须大于0', trigger: 'blur' }
  ],
  expectedPaymentDate: [
    { required: true, message: '请选择预计付款日', trigger: 'change' }
  ]
}

// 预付款公司对应的银行与账号
const companyBankMap: Record<string, { bank: string, account: string }> = {
  '总部': { bank: '中国工商银行', account: '6222021234567890123' },
  '北京分公司': { bank: '中国银行', account: '6217001234567890123' },
  '上海分公司': { bank: '中国建设银行', account: '6214001234567890123' },
  '广州分公司': { bank: '中国农业银行', account: '6228481234567890123' },
  '杭州分公司': { bank: '招商银行', account: '6225881234567890123' }
}

// 公司银行选项
const companyBankOptions = ref([
  '中国工商银行',
  '中国建设银行',
  '中国农业银行',
  '中国银行',
  '招商银行',
  '交通银行'
])

// 公司账号选项
const companyAccountOptions = ref([
  '6222021234567890123',
  '6217001234567890123',
  '6214001234567890123',
  '6228481234567890123',
  '6225881234567890123'
])

// 预付款公司变化时自动带出公司银行、公司账号
const handleCompanyChange = (company: string) => {
  const info = companyBankMap[company]
  if (info) {
    form.companyBank = info.bank
    form.companyAccount = info.account
  } else {
    form.companyBank = ''
    form.companyAccount = ''
  }
}

// 费率单选择变化
const handleRateSheetChange = (rateSheetNo: string) => {
  if (rateSheetNo) {
    const rateSheet = rateSheetList.value.find(item => item.rateSheetNo === rateSheetNo)
    if (rateSheet) {
      form.businessRefNo = rateSheet.businessRefNo
      form.incomeItem = rateSheet.incomeItem
    }
  } else {
    form.businessRefNo = ''
    form.incomeItem = ''
  }
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
      router.push('/payable/prepayment')
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
      router.push('/payable/prepayment')
    }, 1000)
  } catch (error) {
    ElMessage.error('表单校验失败，请检查填写内容')
  }
}

onMounted(() => {
  // 如果是编辑模式，加载预付款数据
  if (isEdit.value) {
    // 模拟加载数据
    form.prepaymentNo = 'YF2024050001'
    form.supplierId = 1
    form.settlementUnit = '深圳硬件供应商A公司'
    form.settlementBank = '中国工商银行'
    form.settlementAccount = '75512345678'
    form.prepaymentCompany = '总部'
    handleCompanyChange('总部')
    form.warehouseCode = 'WH001'
    form.rateSheetNo = 'FL2024040001'
    form.businessRefNo = 'PO2024040001'
    form.billNo = 'BL2024040001'
    form.expenseItem = '采购成本'
    form.currency = 'CNY'
    form.prepaymentAmount = 150000.00
    form.expectedPaymentDate = '2024-04-25'
    form.remark = ''
  } else {
    // 新增模式，生成临时单号
    const now = new Date()
    const dateStr = now.getFullYear() + (now.getMonth() + 1).toString().padStart(2, '0')
    form.prepaymentNo = `YF${dateStr}XXXXXX`
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
