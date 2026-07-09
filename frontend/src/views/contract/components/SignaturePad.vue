<template>
  <div class="signature-pad">
    <div class="sign-header">
      <span class="label">电子签章</span>
    </div>
    <div v-if="!signRecords.length" class="empty">暂未配置签章方</div>
    <div v-for="s in signRecords" :key="s.id" class="sign-item">
      <div class="sign-info">
        <span class="party">{{ s.partyName }}</span>
        <span class="signer">签章人：{{ s.signer }}</span>
        <el-tag v-if="s.signedAt" size="small" type="success">已签</el-tag>
        <el-tag v-else size="small" type="info">待签</el-tag>
      </div>
      <div v-if="s.signedAt" class="signed-info">
        <span>签署时间：{{ new Date(s.signedAt).toLocaleString() }}</span>
        <el-image v-if="s.sealDataUrl" :src="s.sealDataUrl" style="width: 64px; height: 64px" fit="contain" />
      </div>
      <div v-else class="sign-area">
        <canvas ref="canvasRef" class="canvas" width="400" height="140"
          @mousedown="startDraw" @mousemove="drawing" @mouseup="stopDraw" @mouseleave="stopDraw"
          @touchstart.prevent="startDraw" @touchmove.prevent="drawing" @touchend="stopDraw"
        />
        <div class="sign-btns">
          <el-button size="small" @click="clearCanvas">清除</el-button>
          <el-button size="small" type="primary" @click="onSign(s)">确认签署</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useContractStore } from '../../../store/contract'
import type { SignRecord } from '../../../types/contract'

const props = defineProps<{ contractId: string; signRecords: SignRecord[] }>()
const store = useContractStore()
const canvasRef = ref<HTMLCanvasElement[]>([])
let ctx: CanvasRenderingContext2D | null = null
let drawing_ = false

onMounted(() => {
  if (canvasRef.value[0]) {
    ctx = canvasRef.value[0].getContext('2d')
    if (ctx) { ctx.strokeStyle = '#303133'; ctx.lineWidth = 2; ctx.lineCap = 'round' }
  }
})

function getPos(e: MouseEvent | Touch) {
  const canvas = canvasRef.value[0]
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}
function startDraw(e: MouseEvent | TouchEvent) {
  drawing_ = true
  const ev = 'touches' in e ? e.touches[0] : e
  const p = getPos(ev)
  ctx?.beginPath()
  ctx?.moveTo(p.x, p.y)
}
function drawing(e: MouseEvent | TouchEvent) {
  if (!drawing_) return
  const ev = 'touches' in e ? e.touches[0] : e
  const p = getPos(ev)
  ctx?.lineTo(p.x, p.y)
  ctx?.stroke()
}
function stopDraw() { drawing_ = false }

function clearCanvas() {
  const canvas = canvasRef.value[0]
  if (canvas) ctx?.clearRect(0, 0, canvas.width, canvas.height)
}

function onSign(s: SignRecord) {
  const canvas = canvasRef.value[0]
  if (!canvas) return
  const dataUrl = canvas.toDataURL('image/png')
  store.addSignRecord(props.contractId, {
    partyName: s.partyName,
    signer: s.signer,
    signDataUrl: dataUrl,
    signedAt: Date.now()
  })
  clearCanvas()
  ElMessage.success(`${s.partyName} 已签署`)
  if (store.checkAllSigned(props.contractId)) {
    store.changeStatus(props.contractId, '履行中')
    ElMessage.success('双方已签署，合同进入履行阶段')
  }
}
</script>

<style scoped>
.signature-pad {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}
.sign-header {
  padding: 8px 14px;
  background: #ecf5ff;
  border-bottom: 1px solid #ebeef5;
  font-weight: 500;
  font-size: 13px;
  color: #303133;
}
.empty { padding: 20px; text-align: center; color: #c0c4cc; }
.sign-item {
  padding: 12px 14px;
  border-bottom: 1px solid #f0f0f0;
}
.sign-item:last-child { border-bottom: none; }
.sign-info { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.party { font-weight: 600; font-size: 14px; color: #303133; }
.signer { font-size: 12px; color: #909399; }
.signed-info { display: flex; align-items: center; gap: 12px; font-size: 12px; color: #67c23a; }
.sign-area { margin-top: 8px; }
.canvas {
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  background: #fafafa;
  cursor: crosshair;
  display: block;
}
.sign-btns { margin-top: 6px; display: flex; gap: 8px; }
</style>
