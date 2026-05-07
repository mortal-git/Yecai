<template>
  <div class="rule-engine-version-container">
    <!-- 顶部操作栏 -->
    <div class="action-header">
      <div class="header-left">
        <el-button text @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">规则版本管理</span>
      </div>
      <div class="header-right">
        <span class="rule-info">规则：{{ ruleName }}</span>
      </div>
    </div>

    <!-- 版本列表 -->
    <div class="version-section">
      <el-table :data="versionList" border>
        <el-table-column prop="version" label="版本号" width="100" align="center">
          <template #default="{ row, $index }">
            <el-tag :type="$index === 0 ? 'success' : 'info'">V{{ row.version }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="creator" label="创建人" width="100" />
        <el-table-column prop="changeDesc" label="变更说明" min-width="300" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : row.status === 'draft' ? 'warning' : 'info'" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row, $index }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button v-if="$index !== 0" type="warning" link size="small" @click="handleRollback(row)">回滚</el-button>
            <el-button v-if="row.status === 'draft'" type="primary" link size="small" @click="handleEnable(row)">启用</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 版本对比抽屉 -->
    <el-drawer v-model="showCompareDrawer" title="版本详情" size="800px">
      <template #default>
        <el-descriptions :column="2" border v-if="currentVersion">
          <el-descriptions-item label="规则名称">{{ currentVersion.ruleName }}</el-descriptions-item>
          <el-descriptions-item label="版本号">V{{ currentVersion.version }}</el-descriptions-item>
          <el-descriptions-item label="规则类型">
            <el-tag :type="currentVersion.ruleType === 'income' ? 'success' : 'warning'" size="small">
              {{ currentVersion.ruleType === 'income' ? '收入规则' : '成本规则' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="计费模式">{{ currentVersion.billingMode }}</el-descriptions-item>
          <el-descriptions-item label="单价">¥{{ currentVersion.unitPrice?.toFixed(4) }}</el-descriptions-item>
          <el-descriptions-item label="税率">{{ currentVersion.taxRate }}%</el-descriptions-item>
          <el-descriptions-item label="优先级">{{ currentVersion.priority }}</el-descriptions-item>
          <el-descriptions-item label="计价模式">{{ currentVersion.priceMode === 'tax_included' ? '含税价' : '不含税价' }}</el-descriptions-item>
        </el-descriptions>
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
const ruleName = ref('仓储入库费')

const versionList = ref([
  {
    version: 3,
    createTime: '2026-04-15 14:30:00',
    creator: '张三',
    changeDesc: '调整单价从2.0调整为2.5，新增燃油附加费5%',
    status: 'active',
    ruleName: '仓储入库费',
    ruleType: 'income',
    billingMode: '固定单价',
    unitPrice: 2.5,
    taxRate: 6,
    priority: 1,
    priceMode: 'tax_included'
  },
  {
    version: 2,
    createTime: '2026-03-10 10:20:00',
    creator: '李四',
    changeDesc: '税率从0%调整为6%，修改计价模式为含税价',
    status: 'archived',
    ruleName: '仓储入库费',
    ruleType: 'income',
    billingMode: '固定单价',
    unitPrice: 2.0,
    taxRate: 6,
    priority: 1,
    priceMode: 'tax_included'
  },
  {
    version: 1,
    createTime: '2026-01-05 09:00:00',
    creator: '王五',
    changeDesc: '初始版本创建',
    status: 'archived',
    ruleName: '仓储入库费',
    ruleType: 'income',
    billingMode: '固定单价',
    unitPrice: 2.0,
    taxRate: 0,
    priority: 1,
    priceMode: 'tax_excluded'
  }
])

const showCompareDrawer = ref(false)
const currentVersion = ref<any>(null)

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '启用中',
    draft: '草稿',
    archived: '已归档'
  }
  return texts[status] || status
}

const handleBack = () => {
  router.back()
}

const handleView = (row: any) => {
  currentVersion.value = row
  showCompareDrawer.value = true
}

const handleRollback = (row: any) => {
  ElMessage.success(`已回滚至V${row.version}`)
}

const handleEnable = (row: any) => {
  ElMessage.success(`V${row.version}已启用`)
}
</script>

<style scoped>
.rule-engine-version-container {
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

.rule-info {
  font-size: 14px;
  color: #909399;
}

.version-section {
  background: #fff;
  margin: 20px;
  padding: 20px;
  border-radius: 8px;
}
</style>