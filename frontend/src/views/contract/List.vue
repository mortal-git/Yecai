<template>
  <div class="contract-list">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :span="4" v-for="s in statCards" :key="s.label">
        <div class="stat-card" :style="{ borderLeftColor: s.color }">
          <div class="stat-num" :style="{ color: s.color }">{{ s.count }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">合同管理</span>
          <div class="header-btns">
            <el-button type="primary" :icon="Edit" @click="$router.push('/contract/draft')">起草拟定</el-button>
            <el-button :icon="Upload" @click="$router.push('/contract/upload')">上传合同</el-button>
          </div>
        </div>
      </template>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-input v-model="kw" placeholder="搜索合同名称 / 甲乙方..." :prefix-icon="Search" clearable style="width: 280px" />
        <el-select v-model="filterCategory" placeholder="合同分类" clearable style="width: 140px">
          <el-option v-for="c in CATEGORY_OPTIONS" :key="c" :label="c" :value="c" />
        </el-select>
        <el-radio-group v-model="filterStatus" size="default">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button v-for="s in STATUS_FLOW" :key="s" :value="s">{{ s }}</el-radio-button>
          <el-radio-button value="已作废">已作废</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 列表 -->
      <el-table :data="filtered" border stripe row-key="id">
        <el-table-column label="合同名称" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link type="primary" @click="onView(row)">{{ row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="110">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="甲方" prop="partyA" width="120" show-overflow-tooltip>
          <template #default="{ row }">{{ row.partyA || '-' }}</template>
        </el-table-column>
        <el-table-column label="乙方" prop="partyB" width="120" show-overflow-tooltip>
          <template #default="{ row }">{{ row.partyB || '-' }}</template>
        </el-table-column>
        <el-table-column label="金额" width="120">
          <template #default="{ row }">{{ row.amount || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag size="small" :color="STATUS_COLOR[row.status]" effect="dark" style="border: none; color: #fff">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="风险" width="80">
          <template #default="{ row }">
            <el-badge v-if="row.riskItems?.length" :value="row.riskItems.length" type="danger">
              <el-tag size="small" :type="riskBadgeType(row.riskItems)">有风险</el-tag>
            </el-badge>
            <span v-else style="color: #c0c4cc">-</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">{{ new Date(row.createdAt).toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="onView(row)">详情</el-button>
            <el-button v-if="row.status === '草稿'" link type="warning" size="small" @click="store.submitForApproval(row.id)">提交审批</el-button>
            <el-button v-if="row.status === '待签署'" link type="success" size="small" @click="onSign(row)">签署</el-button>
            <el-button v-if="row.status === '审批中' && row.approvals?.some((a: any) => a.status === 'pending')" link type="primary" size="small" @click="onView(row)">审批</el-button>
            <el-button link size="small" @click="onView(row)">智能提取</el-button>
            <el-dropdown trigger="click" @command="(cmd: string) => onMore(cmd, row)">
              <el-button link size="small">更多<el-icon><ArrowDown /></el-icon></el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="compare">智能比对</el-dropdown-item>
                  <el-dropdown-item command="risk">风险分析</el-dropdown-item>
                  <el-dropdown-item command="obligation">履约跟踪</el-dropdown-item>
                  <el-dropdown-item v-if="row.status === '履行中'" command="complete">标记完成</el-dropdown-item>
                  <el-dropdown-item v-if="row.status !== '已作废' && row.status !== '已完成'" command="void" divided>作废</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 详情 Drawer -->
    <el-drawer v-model="drawerVisible" :title="drawerContract?.title || '合同详情'" size="900px">
      <template v-if="drawerContract">
        <StatusTimeline :contract="drawerContract" />

        <el-tabs v-model="drawerTab" class="detail-tabs">
          <el-tab-pane label="合同详情" name="detail">
            <el-descriptions :column="3" border size="small" class="desc-section">
              <el-descriptions-item label="分类">{{ drawerContract.category }}</el-descriptions-item>
              <el-descriptions-item label="文件名">{{ drawerContract.fileName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="文件类型">{{ typeLabel(drawerContract.fileType) }}</el-descriptions-item>
              <el-descriptions-item label="甲方">{{ drawerContract.partyA || '-' }}</el-descriptions-item>
              <el-descriptions-item label="乙方">{{ drawerContract.partyB || '-' }}</el-descriptions-item>
              <el-descriptions-item label="金额">{{ drawerContract.amount || '-' }}</el-descriptions-item>
              <el-descriptions-item label="起始日期">{{ drawerContract.startDate ? new Date(drawerContract.startDate).toLocaleDateString() : '-' }}</el-descriptions-item>
              <el-descriptions-item label="终止日期">{{ drawerContract.endDate ? new Date(drawerContract.endDate).toLocaleDateString() : '-' }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ new Date(drawerContract.createdAt).toLocaleString() }}</el-descriptions-item>
            </el-descriptions>

            <div v-if="drawerContract.fileType === 'image'" style="margin-top: 12px">
              <el-image :src="drawerContract.fileDataUrl" fit="contain" style="max-height: 320px; width: 100%" />
            </div>

            <div class="section-label">合同文本</div>
            <el-input type="textarea" v-model="drawerContract.rawText" :rows="8" @change="onTextChange" />

            <div v-if="drawerContract.extractedFields?.length" class="section-top">
              <div class="section-label">智能提取结果</div>
              <el-form label-width="120px" size="small">
                <el-row :gutter="16">
                  <el-col :span="12" v-for="f in drawerContract.extractedFields" :key="f.key">
                    <el-form-item :label="f.label">
                      <el-input v-if="f.editable" :model-value="f.value" @update:model-value="store.updateField(drawerContract!.id, f.key, $event)" />
                      <span v-else>{{ f.value || '-' }}</span>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </el-tab-pane>

          <el-tab-pane label="审批流程" name="approval">
            <ApprovalFlow :contract="drawerContract" />
          </el-tab-pane>

          <el-tab-pane label="电子签章" name="sign">
            <SignaturePad :contract-id="drawerContract.id" :sign-records="drawerContract.signRecords" />
          </el-tab-pane>

          <el-tab-pane label="风险评估" name="risk">
            <RiskAnalysis :contract-id="drawerContract.id" :risks="drawerContract.riskItems" :raw-text="drawerContract.rawText" />
          </el-tab-pane>

          <el-tab-pane label="智能比对" name="compare">
            <div class="compare-toolbar">
              <el-button size="small" @click="store.saveVersion(drawerContract.id, '手动保存')">保存当前版本</el-button>
              <span class="version-count">已有 {{ drawerContract.versions?.length || 0 }} 个版本</span>
            </div>
            <CompareView :versions="drawerContract.versions || []" />
          </el-tab-pane>

          <el-tab-pane label="履约跟踪" name="obligation">
            <ObligationTracker :contract-id="drawerContract.id" :obligations="drawerContract.obligations" />
          </el-tab-pane>
        </el-tabs>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Upload, Search, ArrowDown } from '@element-plus/icons-vue'
import { useContractStore } from '../../store/contract'
import { CATEGORY_OPTIONS, STATUS_FLOW, STATUS_COLOR } from '../../types/contract'
import type { Contract } from '../../types/contract'
import StatusTimeline from './components/StatusTimeline.vue'
import ApprovalFlow from './components/ApprovalFlow.vue'
import SignaturePad from './components/SignaturePad.vue'
import RiskAnalysis from './components/RiskAnalysis.vue'
import CompareView from './components/CompareView.vue'
import ObligationTracker from './components/ObligationTracker.vue'

const store = useContractStore()
const kw = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const drawerVisible = ref(false)
const drawerContract = ref<Contract | null>(null)
const drawerTab = ref('detail')

const statCards = computed(() => {
  const s = store.statsByStatus
  return [
    { label: '全部合同', count: store.contracts.length, color: '#409eff' },
    { label: '草稿', count: s['草稿'] || 0, color: '#909399' },
    { label: '审批中', count: s['审批中'] || 0, color: '#e6a23c' },
    { label: '待签署', count: s['待签署'] || 0, color: '#409eff' },
    { label: '履行中', count: s['履行中'] || 0, color: '#67c23a' },
    { label: '已完成', count: s['已完成'] || 0, color: '#67c23a' }
  ]
})

const filtered = computed(() => {
  return store.sortedContracts.filter(c => {
    if (filterStatus.value && c.status !== filterStatus.value) return false
    if (filterCategory.value && c.category !== filterCategory.value) return false
    if (kw.value) {
      const k = kw.value.toLowerCase()
      if (!(c.title.toLowerCase().includes(k) || (c.partyA || '').toLowerCase().includes(k) || (c.partyB || '').toLowerCase().includes(k))) return false
    }
    return true
  })
})

function onView(row: Contract) {
  drawerContract.value = row
  drawerTab.value = 'detail'
  drawerVisible.value = true
}

function onSign(row: Contract) {
  drawerContract.value = row
  drawerTab.value = 'sign'
  drawerVisible.value = true
  if (!row.signRecords.length) {
    store.addSignRecord(row.id, { partyName: row.partyA || '甲方', signer: '' })
    store.addSignRecord(row.id, { partyName: row.partyB || '乙方', signer: '' })
  }
}

function onTextChange() {
  if (drawerContract.value) store.updateContract(drawerContract.value.id, { rawText: drawerContract.value.rawText })
}

async function onMore(cmd: string, row: Contract) {
  if (cmd === 'delete') {
    try { await ElMessageBox.confirm(`确定删除合同「${row.title}」？`, '删除', { type: 'warning' }); store.deleteContract(row.id); ElMessage.success('已删除') } catch {}
  } else if (cmd === 'compare') {
    store.saveVersion(row.id, '比对前保存')
    drawerContract.value = row; drawerTab.value = 'compare'; drawerVisible.value = true
  } else if (cmd === 'risk') {
    drawerContract.value = row; drawerTab.value = 'risk'; drawerVisible.value = true
  } else if (cmd === 'obligation') {
    drawerContract.value = row; drawerTab.value = 'obligation'; drawerVisible.value = true
  } else if (cmd === 'complete') {
    store.changeStatus(row.id, '已完成'); ElMessage.success('已标记完成')
  } else if (cmd === 'void') {
    try { await ElMessageBox.confirm('确定作废该合同？', '作废', { type: 'warning' }); store.changeStatus(row.id, '已作废'); ElMessage.success('已作废') } catch {}
  }
}

function typeLabel(t: string): string { return t === 'pdf' ? 'PDF' : t === 'docx' ? 'Word' : t === 'image' ? '图片' : '在线起草' }
function riskBadgeType(items: any[]): 'danger' | 'warning' | 'info' {
  if (items.some((i: any) => i.riskLevel === '高')) return 'danger'
  if (items.some((i: any) => i.riskLevel === '中')) return 'warning'
  return 'info'
}
</script>

<style scoped>
.stat-row { margin-bottom: 16px; }
.stat-card {
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  border-left: 4px solid;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.stat-num { font-size: 24px; font-weight: 700; }
.stat-label { font-size: 12px; color: #909399; margin-top: 4px; }

.card-header { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 16px; font-weight: 600; color: #303133; }
.header-btns { display: flex; gap: 8px; }

.filter-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }

.detail-tabs { margin-top: 16px; }
.desc-section { margin-bottom: 16px; }
.section-label {
  font-size: 14px; font-weight: 600; color: #303133; margin: 16px 0 8px;
  padding-left: 8px; border-left: 3px solid #409eff;
}
.section-top { margin-top: 16px; }
.compare-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.version-count { font-size: 12px; color: #909399; }
</style>
