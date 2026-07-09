<template>
  <div class="obligation-tracker">
    <div class="tracker-header">
      <span class="label">履约跟踪</span>
      <el-button size="small" type="primary" :icon="Plus" @click="showAdd = true">添加节点</el-button>
    </div>
    <div v-if="!obligations.length" class="empty">暂无履约节点</div>
    <el-table v-else :data="obligations" size="small" border stripe>
      <el-table-column label="节点" prop="title" min-width="160" />
      <el-table-column label="责任方" prop="party" width="100" />
      <el-table-column label="金额" prop="amount" width="120" />
      <el-table-column label="截止日期" width="120">
        <template #default="{ row }">
          {{ row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.completed ? 'success' : isOverdue(row) ? 'danger' : 'info'" size="small">
            {{ row.completed ? '已完成' : isOverdue(row) ? '逾期' : '待完成' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template #default="{ row }">
          <el-button link size="small" @click="store.toggleObligation(contractId, row.id)">
            {{ row.completed ? '撤回' : '完成' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showAdd" title="添加履约节点" width="480px" append-to-body>
      <el-form label-width="80px" size="default">
        <el-form-item label="节点名称"><el-input v-model="addForm.title" /></el-form-item>
        <el-form-item label="责任方"><el-input v-model="addForm.party" /></el-form-item>
        <el-form-item label="金额"><el-input v-model="addForm.amount" /></el-form-item>
        <el-form-item label="截止日期"><el-date-picker v-model="addForm.dueDate" type="date" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdd = false">取消</el-button>
        <el-button type="primary" @click="onAdd">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useContractStore } from '../../../store/contract'
import type { ObligationMilestone } from '../../../types/contract'

const props = defineProps<{ contractId: string; obligations: ObligationMilestone[] }>()
const store = useContractStore()
const showAdd = ref(false)
const addForm = reactive({ title: '', party: '', amount: '', dueDate: null as Date | null })

function isOverdue(ob: ObligationMilestone) {
  return !ob.completed && ob.dueDate && ob.dueDate < Date.now()
}

function onAdd() {
  if (!addForm.title) { ElMessage.warning('请填写节点名称'); return }
  store.addObligation(props.contractId, {
    title: addForm.title,
    party: addForm.party,
    amount: addForm.amount || undefined,
    dueDate: addForm.dueDate ? addForm.dueDate.getTime() : undefined,
    completed: false
  })
  showAdd.value = false
  addForm.title = ''; addForm.party = ''; addForm.amount = ''; addForm.dueDate = null
  ElMessage.success('已添加')
}
</script>

<style scoped>
.obligation-tracker {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}
.tracker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: #f0f9eb;
  border-bottom: 1px solid #ebeef5;
}
.label { font-weight: 500; font-size: 13px; }
.empty { padding: 20px; text-align: center; color: #c0c4cc; }
</style>
