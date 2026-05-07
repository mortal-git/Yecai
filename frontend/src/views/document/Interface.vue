<template>
  <div class="document-interface-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <span class="page-title">接口配置</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增接口
        </el-button>
        <el-button @click="handleTest">
          <el-icon><Connection /></el-icon>
          测试连接
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon total"><el-icon><Connection /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">接口总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon active"><el-icon><CircleCheck /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.active }}</div>
              <div class="stat-label">运行中</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon today"><el-icon><Document /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.todayCount }}</div>
              <div class="stat-label">今日接收</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon error"><el-icon><Warning /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.errorRate }}%</div>
              <div class="stat-label">错误率</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="interfaceCode" label="接口编码" width="120" />
        <el-table-column prop="interfaceName" label="接口名称" min-width="150" />
        <el-table-column prop="systemType" label="来源系统" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getSystemTypeText(row.systemType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="interfaceType" label="接口类型" width="100">
          <template #default="{ row }">
            {{ getInterfaceTypeText(row.interfaceType) }}
          </template>
        </el-table-column>
        <el-table-column prop="url" label="接口地址" min-width="200" />
        <el-table-column prop="authType" label="认证方式" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.authType === 'signature' ? 'success' : 'info'">
              {{ row.authType === 'signature' ? '签名加密' : 'Token' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.status" active-value="active" inactive-value="inactive" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="lastSyncTime" label="最后同步" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click="handleSync(row)">同步</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer v-model="showDetailDrawer" :title="`接口详情 - ${currentInterface?.interfaceName}`" size="800px">
      <template #default>
        <div class="detail-content" v-if="currentInterface">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本信息" name="basic">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="接口编码">{{ currentInterface.interfaceCode }}</el-descriptions-item>
                <el-descriptions-item label="接口名称">{{ currentInterface.interfaceName }}</el-descriptions-item>
                <el-descriptions-item label="来源系统">{{ getSystemTypeText(currentInterface.systemType) }}</el-descriptions-item>
                <el-descriptions-item label="接口类型">{{ getInterfaceTypeText(currentInterface.interfaceType) }}</el-descriptions-item>
                <el-descriptions-item label="认证方式">
                  <el-tag size="small">{{ currentInterface.authType === 'signature' ? '签名加密(appkey+secret)' : 'Token认证' }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="currentInterface.status === 'active' ? 'success' : 'info'" size="small">
                    {{ currentInterface.status === 'active' ? '启用' : '停用' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ currentInterface.createTime }}</el-descriptions-item>
                <el-descriptions-item label="最后同步">{{ currentInterface.lastSyncTime }}</el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>
            <el-tab-pane label="接口配置" name="config">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="接口地址">{{ currentInterface.url }}</el-descriptions-item>
                <el-descriptions-item label="AppKey">{{ currentInterface.appKey }}</el-descriptions-item>
                <el-descriptions-item label="回调地址">{{ currentInterface.callbackUrl }}</el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>
            <el-tab-pane label="字段映射" name="mapping">
              <el-table :data="currentInterface.fieldMappings" border size="small">
                <el-table-column prop="sourceField" label="源系统字段" width="150" />
                <el-table-column prop="targetField" label="目标系统字段" width="150" />
                <el-table-column prop="fieldType" label="字段类型" width="100" />
                <el-table-column prop="required" label="是否必填" width="80" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.required ? 'danger' : 'info'" size="small">{{ row.required ? '是' : '否' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="defaultValue" label="默认值" width="100" />
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="showDetailDrawer = false">关闭</el-button>
          <el-button type="primary" @click="handleEdit(currentInterface)">编辑</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="showDialog" :title="isEdit ? '编辑接口' : '新增接口'" width="700px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="接口名称" prop="interfaceName">
              <el-input v-model="formData.interfaceName" placeholder="请输入接口名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来源系统" prop="systemType">
              <el-select v-model="formData.systemType" placeholder="请选择" style="width: 100%">
                <el-option label="WMS仓储系统" value="wms" />
                <el-option label="TMS运输系统" value="tms" />
                <el-option label="关务系统" value="customs" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="接口类型" prop="interfaceType">
              <el-select v-model="formData.interfaceType" placeholder="请选择" style="width: 100%">
                <el-option label="RESTful API" value="rest" />
                <el-option label="WebService" value="soap" />
                <el-option label="MQ消息" value="mq" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="认证方式" prop="authType">
              <el-select v-model="formData.authType" placeholder="请选择" style="width: 100%">
                <el-option label="签名加密(appkey+secret)" value="signature" />
                <el-option label="Token认证" value="token" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="接口地址" prop="url">
          <el-input v-model="formData.url" placeholder="请输入接口地址" />
        </el-form-item>
        <el-form-item label="AppKey" v-if="formData.authType === 'signature'">
          <el-input v-model="formData.appKey" placeholder="请输入AppKey" />
        </el-form-item>
        <el-form-item label="AppSecret" v-if="formData.authType === 'signature'">
          <el-input v-model="formData.appSecret" placeholder="请输入AppSecret" show-password />
        </el-form-item>
        <el-form-item label="回调地址">
          <el-input v-model="formData.callbackUrl" placeholder="请输入回调地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Connection, CircleCheck, Document, Warning } from '@element-plus/icons-vue'

// 统计数据
const statistics = reactive({
  total: 5,
  active: 4,
  todayCount: 1256,
  errorRate: 0.5
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    interfaceCode: 'IF_WMS_001',
    interfaceName: 'WMS订单同步接口',
    systemType: 'wms',
    interfaceType: 'rest',
    url: 'https://wms.example.com/api/orders',
    authType: 'signature',
    appKey: 'wms_client_001',
    callbackUrl: 'https://finance.example.com/callback/wms',
    status: 'active',
    createTime: '2026-01-15 10:00:00',
    lastSyncTime: '2026-04-26 10:30:00',
    fieldMappings: [
      { sourceField: 'order_no', targetField: 'businessOrderNo', fieldType: 'string', required: true, defaultValue: '' },
      { sourceField: 'order_type', targetField: 'businessType', fieldType: 'string', required: true, defaultValue: '' },
      { sourceField: 'customer_code', targetField: 'customerCode', fieldType: 'string', required: true, defaultValue: '' },
      { sourceField: 'complete_time', targetField: 'businessCompleteTime', fieldType: 'datetime', required: true, defaultValue: '' }
    ]
  },
  {
    id: 2,
    interfaceCode: 'IF_TMS_001',
    interfaceName: 'TMS运输单同步接口',
    systemType: 'tms',
    interfaceType: 'rest',
    url: 'https://tms.example.com/api/transports',
    authType: 'signature',
    appKey: 'tms_client_001',
    callbackUrl: 'https://finance.example.com/callback/tms',
    status: 'active',
    createTime: '2026-01-20 10:00:00',
    lastSyncTime: '2026-04-26 10:25:00',
    fieldMappings: []
  },
  {
    id: 3,
    interfaceCode: 'IF_CUS_001',
    interfaceName: '关务单据同步接口',
    systemType: 'customs',
    interfaceType: 'rest',
    url: 'https://customs.example.com/api/declarations',
    authType: 'signature',
    appKey: 'cus_client_001',
    callbackUrl: 'https://finance.example.com/callback/customs',
    status: 'active',
    createTime: '2026-02-01 10:00:00',
    lastSyncTime: '2026-04-26 09:45:00',
    fieldMappings: []
  }
])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 3
})

// 详情抽屉
const showDetailDrawer = ref(false)
const currentInterface = ref<any>(null)
const activeTab = ref('basic')

// 对话框
const showDialog = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  interfaceName: '',
  systemType: '',
  interfaceType: 'rest',
  authType: 'signature',
  url: '',
  appKey: '',
  appSecret: '',
  callbackUrl: ''
})

const formRules: FormRules = {
  interfaceName: [{ required: true, message: '请输入接口名称', trigger: 'blur' }],
  systemType: [{ required: true, message: '请选择来源系统', trigger: 'change' }],
  interfaceType: [{ required: true, message: '请选择接口类型', trigger: 'change' }],
  authType: [{ required: true, message: '请选择认证方式', trigger: 'change' }],
  url: [{ required: true, message: '请输入接口地址', trigger: 'blur' }]
}

// 方法
const getSystemTypeText = (type: string) => {
  const texts: Record<string, string> = {
    wms: 'WMS',
    tms: 'TMS',
    customs: '关务'
  }
  return texts[type] || type
}

const getInterfaceTypeText = (type: string) => {
  const texts: Record<string, string> = {
    rest: 'RESTful',
    soap: 'WebService',
    mq: 'MQ消息'
  }
  return texts[type] || type
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    interfaceName: '',
    systemType: '',
    interfaceType: 'rest',
    authType: 'signature',
    url: '',
    appKey: '',
    appSecret: '',
    callbackUrl: ''
  })
  showDialog.value = true
}

const handleView = (row: any) => {
  currentInterface.value = row
  showDetailDrawer.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  showDetailDrawer.value = false
  Object.assign(formData, { ...row })
  showDialog.value = true
}

const handleSync = (row: any) => {
  ElMessage.success('开始同步: ' + row.interfaceName)
}

const handleStatusChange = (row: any) => {
  ElMessage.success(`${row.interfaceName}已${row.status === 'active' ? '启用' : '停用'}`)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      showDialog.value = false
    }
  })
}

const handleTest = () => {
  ElMessage.success('连接测试成功')
}
</script>

<style scoped>
.document-interface-container {
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

.header-left .page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  gap: 12px;
}

.statistics-cards {
  padding: 16px 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-icon.total { background: #ecf5ff; color: #409eff; }
.stat-icon.active { background: #f0f9eb; color: #67c23a; }
.stat-icon.today { background: #fff0f0; color: #f56c6c; }
.stat-icon.error { background: #fef0f0; color: #f56c6c; }

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.table-container {
  background: #fff;
  margin: 16px 20px;
  padding: 20px;
  border-radius: 8px;
}

.detail-content {
  padding: 0 10px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>