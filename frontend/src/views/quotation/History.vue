<template>
  <div class="quotation-history-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <el-button text @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">报价版本历史</span>
      </div>
      <div class="header-right">
        <span class="quotation-info">报价单号：{{ quotationNo }}</span>
      </div>
    </div>

    <!-- 版本时间线 -->
    <div class="timeline-section">
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in versionList"
          :key="item.version"
          :timestamp="item.createTime"
          :type="index === 0 ? 'primary' : 'info'"
          :hollow="index !== 0"
        >
          <el-card class="version-card" :class="{ 'current': index === 0 }">
            <template #header>
              <div class="card-header">
                <span class="version-title">V{{ item.version }}</span>
                <el-tag v-if="index === 0" type="success" size="small">当前版本</el-tag>
                <el-tag v-else type="info" size="small">历史版本</el-tag>
              </div>
            </template>
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="生效日期">{{ item.effectiveDate }}</el-descriptions-item>
              <el-descriptions-item label="失效日期">{{ item.expiryDate }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="getStatusType(item.status)" size="small">
                  {{ getStatusText(item.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="绑定规则数">{{ item.ruleCount }}</el-descriptions-item>
              <el-descriptions-item label="创建人">{{ item.creator }}</el-descriptions-item>
              <el-descriptions-item label="审核人">{{ item.reviewer || '-' }}</el-descriptions-item>
            </el-descriptions>
            <div class="card-actions">
              <el-button type="primary" link size="small" @click="handleViewDetail(item)">查看详情</el-button>
              <el-button v-if="index !== 0 && item.status === 'active'" type="warning" link size="small" @click="handleRollback(item)">
                回滚此版本
              </el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>

    <!-- 版本对比抽屉 -->
    <el-drawer v-model="showCompareDrawer" title="版本对比" size="900px">
      <template #default>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息变更" name="basic">
            <el-table :data="compareBasicData" border size="small">
              <el-table-column prop="field" label="字段" width="120" />
              <el-table-column prop="oldValue" label="旧版本值" min-width="150" />
              <el-table-column prop="newValue" label="新版本值" min-width="150" />
              <el-table-column label="变更" width="80" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.oldValue !== row.newValue ? 'warning' : 'info'" size="small">
                    {{ row.oldValue !== row.newValue ? '变更' : '无' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="规则变更" name="rules">
            <el-table :data="compareRuleData" border size="small">
              <el-table-column prop="ruleCode" label="规则编码" width="100" />
              <el-table-column prop="ruleName" label="规则名称" min-width="120" />
              <el-table-column prop="changeType" label="变更类型" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="getChangeType(row.changeType)" size="small">
                    {{ getChangeTypeText(row.changeType) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="oldUnitPrice" label="原单价" width="100" align="right">
                <template #default="{ row }">
                  {{ row.oldUnitPrice ? '¥' + row.oldUnitPrice.toFixed(4) : '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="newUnitPrice" label="新单价" width="100" align="right">
                <template #default="{ row }">
                  {{ row.newUnitPrice ? '¥' + row.newUnitPrice.toFixed(4) : '-' }}
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </template>
      <template #footer>
        <el-button @click="showCompareDrawer = false">关闭</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const quotationNo = ref(route.params.id || 'QT2026040001')

// 版本列表
const versionList = ref([
  {
    version: 3,
    createTime: '2026-04-20 14:30:00',
    effectiveDate: '2026-05-01',
    expiryDate: '2027-04-30',
    status: 'active',
    ruleCount: 6,
    creator: '张三',
    reviewer: '李经理'
  },
  {
    version: 2,
    createTime: '2026-03-15 10:20:00',
    effectiveDate: '2026-04-01',
    expiryDate: '2026-08-31',
    status: 'expired',
    ruleCount: 5,
    creator: '张三',
    reviewer: '李经理'
  },
  {
    version: 1,
    createTime: '2026-02-10 09:00:00',
    effectiveDate: '2026-03-01',
    expiryDate: '2026-03-31',
    status: 'expired',
    ruleCount: 3,
    creator: '王五',
    reviewer: '孙经理'
  }
])

// 对比抽屉
const showCompareDrawer = ref(false)
const activeTab = ref('basic')

const compareBasicData = ref([
  { field: '结算周期', oldValue: '月结', newValue: '季度结' },
  { field: '税率', oldValue: '6%', newValue: '9%' },
  { field: '生效日期', oldValue: '2026-04-01', newValue: '2026-05-01' },
  { field: '失效日期', oldValue: '2026-08-31', newValue: '2027-04-30' }
])

const compareRuleData = ref([
  { ruleCode: 'R001', ruleName: '仓储入库费', changeType: 'modify', oldUnitPrice: 2.0, newUnitPrice: 2.5 },
  { ruleCode: 'R003', ruleName: '仓储租仓费', changeType: 'add', oldUnitPrice: null, newUnitPrice: 1.5 },
  { ruleCode: 'R002', ruleName: '仓储出库费', changeType: 'delete', oldUnitPrice: 3.0, newUnitPrice: null }
])

// 方法
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    draft: 'info',
    pending: 'warning',
    approved: 'primary',
    active: 'success',
    expired: 'danger',
    cancelled: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    draft: '草稿',
    pending: '审核中',
    approved: '审核通过',
    active: '生效',
    expired: '过期',
    cancelled: '作废'
  }
  return texts[status] || status
}

const getChangeType = (type: string) => {
  const types: Record<string, string> = {
    add: 'success',
    modify: 'warning',
    delete: 'danger'
  }
  return types[type] || 'info'
}

const getChangeTypeText = (type: string) => {
  const texts: Record<string, string> = {
    add: '新增',
    modify: '修改',
    delete: '删除'
  }
  return texts[type] || type
}

const handleBack = () => {
  router.back()
}

const handleViewDetail = (item: any) => {
  showCompareDrawer.value = true
}

const handleRollback = (item: any) => {
  ElMessage.success(`已回滚至V${item.version}版本`)
}
</script>

<style scoped>
.quotation-history-container {
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
  gap: 12px;
}

.header-left .page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
}

.quotation-info {
  font-size: 14px;
  color: #909399;
}

.timeline-section {
  background: #fff;
  margin: 20px;
  padding: 24px;
  border-radius: 8px;
}

.version-card {
  max-width: 600px;
}

.version-card.current {
  border-color: #67c23a;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.version-title {
  font-weight: 600;
  font-size: 16px;
}

.card-actions {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
  display: flex;
  gap: 16px;
}
</style>