<template>
  <div v-if="quotation" class="quotation-public-page" :style="themeStyle">
    <div class="ambient ambient-left"></div>
    <div class="ambient ambient-right"></div>

    <div class="public-shell">
      <section class="hero-card">
        <div class="brand-block">
          <div class="brand-mark">{{ quotation.h5.branding.logoText }}</div>
          <div>
            <div class="eyebrow">正式报价 H5</div>
            <h1>{{ quotation.h5.branding.companyName }}</h1>
            <p>{{ quotation.quoteDescription }}</p>
          </div>
        </div>
        <div class="hero-meta">
          <div class="meta-chip">
            <span>报价单号</span>
            <strong>{{ quotation.quotationNo }}</strong>
          </div>
          <div class="meta-chip">
            <span>客户名称</span>
            <strong>{{ quotation.customerName }}</strong>
          </div>
          <div class="meta-chip">
            <span>有效期限</span>
            <strong>{{ quotation.effectiveDate }} 至 {{ quotation.expiryDate }}</strong>
          </div>
          <div class="meta-chip warning-chip" v-if="isExpired">
            <span>状态</span>
            <strong>已过期，客户端操作已关闭</strong>
          </div>
        </div>
      </section>

      <section v-if="needsPassword && !unlocked" class="lock-card">
        <div class="lock-title">报价已加密，请输入访问密码</div>
        <p>该报价单启用了访问密码，避免商业报价内容外泄。</p>
        <el-input v-model="passwordInput" type="password" show-password placeholder="请输入访问密码" @keyup.enter="handleUnlock" />
        <div class="lock-actions">
          <el-button type="primary" @click="handleUnlock">解锁报价单</el-button>
        </div>
      </section>

      <template v-else>
        <section class="summary-grid">
          <article class="summary-card total-card">
            <span>报价总额</span>
            <strong>{{ quotation.currency }} {{ totalAmount.toLocaleString() }}</strong>
            <small>含税率 {{ quotation.taxRate }}%，支持下载 PDF 正式版</small>
          </article>
          <article class="summary-card">
            <span>对接负责人</span>
            <strong>{{ quotation.h5.branding.contactName }}</strong>
            <small>{{ quotation.h5.branding.contactPhone }} / {{ quotation.h5.branding.contactEmail }}</small>
          </article>
          <article class="summary-card">
            <span>履约周期</span>
            <strong>{{ quotation.performanceCycle }}</strong>
            <small>付款方式：{{ quotation.paymentTerms }}</small>
          </article>
        </section>

        <section class="panel-card quote-panel">
          <div class="panel-head">
            <div>
              <div class="panel-kicker">报价明细</div>
              <h2>逐项费用展示与精准协同</h2>
            </div>
            <div class="panel-actions">
              <el-button plain @click="downloadPdf">下载 PDF 正式版</el-button>
              <el-button type="primary" :disabled="actionDisabled || quotation.responseStatus === 'accepted'" @click="handleAccept">
                确认接受报价
              </el-button>
            </div>
          </div>

          <div class="line-item-list">
            <article v-for="item in quotation.lineItems" :key="item.id" class="line-item-card">
              <div class="line-item-header">
                <div>
                  <h3>{{ item.feeName }}</h3>
                  <div class="line-item-meta">{{ item.unit }} / 数量 {{ item.quantity }} / 单价 {{ quotation.currency }} {{ item.amount }}</div>
                </div>
                <div class="line-item-total">{{ quotation.currency }} {{ (item.quantity * item.amount).toLocaleString() }}</div>
              </div>
              <p class="line-item-remark">{{ item.remark }}</p>

              <div v-if="item.comments.length" class="comment-feed">
                <div v-for="comment in item.comments" :key="comment.id" class="comment-item" :class="comment.role">
                  <strong>{{ comment.author }}</strong>
                  <span>{{ comment.content }}</span>
                  <small>{{ comment.createdAt }}</small>
                </div>
              </div>

              <div class="comment-editor">
                <el-input
                  v-model="lineCommentDrafts[item.id]"
                  type="textarea"
                  :rows="2"
                  :disabled="actionDisabled"
                  placeholder="可针对单个费用项目提疑问、提修改意见或补充说明"
                />
                <div class="comment-editor-actions">
                  <el-button type="primary" plain :disabled="actionDisabled" @click="submitLineComment(item.id)">提交明细意见</el-button>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section class="panel-card operation-panel">
          <div class="panel-head">
            <div>
              <div class="panel-kicker">整单反馈</div>
              <h2>线上接受、驳回与留言沟通</h2>
            </div>
            <el-tag :type="responseStatusTypeMap[quotation.responseStatus]">{{ responseStatusTextMap[quotation.responseStatus] }}</el-tag>
          </div>

          <div class="operation-grid">
            <div class="reject-box">
              <label>如需驳回报价，请填写整体不满意原因</label>
              <el-input v-model="rejectReason" type="textarea" :rows="4" :disabled="actionDisabled" placeholder="例如：有效期过短、部分报价高于预期、付款条款需调整等" />
              <div class="reject-actions">
                <el-button type="danger" plain :disabled="actionDisabled || !rejectReason.trim()" @click="handleReject">驳回报价方案</el-button>
              </div>
              <p v-if="quotation.responseReason" class="response-note">最近一次客户整单反馈：{{ quotation.responseReason }}</p>
            </div>

            <div class="message-box">
              <label>全局在线沟通区</label>
              <div class="message-feed">
                <div v-for="message in quotation.messages" :key="message.id" class="message-item" :class="message.role">
                  <div class="message-author">{{ message.author }}</div>
                  <div class="message-content">{{ message.content }}</div>
                  <small>{{ message.createdAt }}</small>
                </div>
              </div>
              <el-input v-model="messageDraft" type="textarea" :rows="3" :disabled="actionDisabled" placeholder="可直接留言沟通需求、节点安排与方案调整" />
              <div class="reject-actions">
                <el-button type="primary" plain :disabled="actionDisabled || !messageDraft.trim()" @click="submitMessage">发送留言</el-button>
              </div>
            </div>
          </div>
        </section>

        <section class="panel-card footer-panel">
          <div class="panel-head compact">
            <div>
              <div class="panel-kicker">报价说明</div>
              <h2>付款方式、履约周期、售后保障与联系入口</h2>
            </div>
          </div>
          <div class="footer-grid">
            <div>
              <span>整单报价说明</span>
              <p>{{ quotation.quoteDescription }}</p>
            </div>
            <div>
              <span>付款方式</span>
              <p>{{ quotation.paymentTerms }}</p>
            </div>
            <div>
              <span>履约周期</span>
              <p>{{ quotation.performanceCycle }}</p>
            </div>
            <div>
              <span>售后保障</span>
              <p>{{ quotation.afterSales }}</p>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>

  <div v-else class="quotation-missing">
    <el-empty description="未找到对应报价链接，可能已失效或地址错误" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  acceptQuotation,
  addConversationMessage,
  addLineItemComment,
  getQuotationAmount,
  getQuotationByToken,
  isQuotationExpired,
  recordQuotationOpen,
  recordQuotationViewDuration,
  rejectQuotation,
  responseStatusTextMap,
  responseStatusTypeMap
} from '../../mock/quotationH5'

const route = useRoute()
const token = String(route.params.token || '')
const quotation = computed(() => getQuotationByToken(token))
const unlocked = ref(false)
const passwordInput = ref('')
const rejectReason = ref('')
const messageDraft = ref('')
const lineCommentDrafts = reactive<Record<number, string>>({})
const mountedAt = Date.now()

const totalAmount = computed(() => quotation.value ? getQuotationAmount(quotation.value) : 0)
const isExpired = computed(() => quotation.value ? isQuotationExpired(quotation.value) : false)
const needsPassword = computed(() => Boolean(quotation.value?.h5.passwordEnabled))
const actionDisabled = computed(() => !quotation.value || isExpired.value)

const themeStyle = computed(() => {
  if (!quotation.value) return {}

  return {
    '--brand-primary': quotation.value.h5.branding.primaryColor,
    '--brand-secondary': quotation.value.h5.branding.secondaryColor
  }
})

onMounted(() => {
  if (!quotation.value) return
  recordQuotationOpen(token)
  unlocked.value = !quotation.value.h5.passwordEnabled
})

onBeforeUnmount(() => {
  recordQuotationViewDuration(token, (Date.now() - mountedAt) / 1000)
})

const handleUnlock = () => {
  if (!quotation.value) return
  if (passwordInput.value === quotation.value.h5.password) {
    unlocked.value = true
    ElMessage.success('密码验证通过，已解锁报价单')
    return
  }

  ElMessage.error('访问密码错误')
}

const handleAccept = () => {
  if (!quotation.value || actionDisabled.value) return
  acceptQuotation(token)
  ElMessage.success('已确认接受报价，系统已回传确认回执')
}

const handleReject = () => {
  if (!quotation.value || actionDisabled.value) return
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请先填写整单驳回原因')
    return
  }

  rejectQuotation(token, rejectReason.value.trim())
  ElMessage.success('已驳回报价方案，系统已同步原因')
}

const submitLineComment = (lineItemId: number) => {
  const content = lineCommentDrafts[lineItemId]?.trim()
  if (!content || actionDisabled.value) {
    return
  }

  addLineItemComment(token, lineItemId, content)
  lineCommentDrafts[lineItemId] = ''
  ElMessage.success('已提交明细意见，售前人员可实时处理')
}

const submitMessage = () => {
  const content = messageDraft.value.trim()
  if (!content || actionDisabled.value) {
    return
  }

  addConversationMessage(token, content)
  messageDraft.value = ''
  ElMessage.success('留言已发送')
}

const downloadPdf = () => {
  window.print()
  ElMessage.info('已调用浏览器打印能力，可另存为 PDF')
}
</script>

<style scoped>
.quotation-public-page {
  --brand-primary: #155eef;
  --brand-secondary: #7c3aed;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--brand-primary) 22%, transparent), transparent 40%),
    radial-gradient(circle at bottom right, color-mix(in srgb, var(--brand-secondary) 20%, transparent), transparent 35%),
    #09111f;
  color: #ecf3ff;
}

.ambient {
  position: absolute;
  border-radius: 999px;
  filter: blur(90px);
  opacity: 0.35;
}

.ambient-left {
  width: 280px;
  height: 280px;
  left: -40px;
  top: 60px;
  background: var(--brand-primary);
}

.ambient-right {
  width: 240px;
  height: 240px;
  right: -40px;
  bottom: 120px;
  background: var(--brand-secondary);
}

.public-shell {
  position: relative;
  z-index: 1;
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px 20px 48px;
}

.hero-card,
.panel-card,
.lock-card,
.summary-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(8, 18, 35, 0.78);
  backdrop-filter: blur(14px);
  box-shadow: 0 24px 60px rgba(2, 8, 23, 0.3);
}

.hero-card {
  border-radius: 28px;
  padding: 28px;
  display: grid;
  gap: 24px;
}

.brand-block {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}

.brand-mark {
  width: 70px;
  height: 70px;
  border-radius: 22px;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.eyebrow,
.panel-kicker {
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(236, 243, 255, 0.72);
}

.brand-block h1,
.panel-head h2 {
  margin: 8px 0 10px;
  font-size: 30px;
  line-height: 1.12;
}

.brand-block p,
.lock-card p {
  margin: 0;
  color: rgba(236, 243, 255, 0.76);
  line-height: 1.7;
}

.hero-meta,
.summary-grid,
.operation-grid,
.footer-grid {
  display: grid;
  gap: 16px;
}

.hero-meta {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.meta-chip,
.summary-card {
  border-radius: 22px;
  padding: 18px 20px;
}

.meta-chip {
  background: rgba(255, 255, 255, 0.06);
}

.meta-chip span,
.summary-card span,
.footer-grid span,
.reject-box label,
.message-box label {
  display: block;
  font-size: 12px;
  color: rgba(236, 243, 255, 0.68);
  margin-bottom: 8px;
}

.meta-chip strong,
.summary-card strong {
  display: block;
  font-size: 16px;
}

.warning-chip {
  border: 1px solid rgba(248, 113, 113, 0.35);
}

.summary-grid {
  margin-top: 18px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.summary-card small {
  display: block;
  margin-top: 8px;
  line-height: 1.6;
  color: rgba(236, 243, 255, 0.68);
}

.total-card {
  background: linear-gradient(145deg, color-mix(in srgb, var(--brand-primary) 25%, rgba(8, 18, 35, 0.7)), rgba(8, 18, 35, 0.8));
}

.panel-card,
.lock-card {
  margin-top: 18px;
  border-radius: 28px;
  padding: 24px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.panel-head.compact {
  margin-bottom: 16px;
}

.panel-actions,
.lock-actions,
.reject-actions,
.comment-editor-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.line-item-list,
.message-feed,
.comment-feed {
  display: grid;
  gap: 14px;
}

.line-item-card,
.message-item,
.comment-item,
.reject-box,
.message-box {
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.line-item-card,
.reject-box,
.message-box {
  padding: 18px;
}

.line-item-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.line-item-header h3 {
  margin: 0;
  font-size: 20px;
}

.line-item-meta,
.line-item-remark,
.response-note,
.message-content,
.comment-item span,
.footer-grid p {
  color: rgba(236, 243, 255, 0.76);
  line-height: 1.7;
}

.line-item-total {
  font-size: 22px;
  font-weight: 700;
  white-space: nowrap;
}

.line-item-remark {
  margin: 12px 0 0;
}

.comment-feed,
.message-feed {
  margin-top: 16px;
}

.comment-item,
.message-item {
  padding: 14px 16px;
}

.comment-item strong,
.message-author {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
}

.comment-item small,
.message-item small {
  display: block;
  margin-top: 8px;
  color: rgba(236, 243, 255, 0.56);
}

.comment-item.sales,
.message-item.sales {
  border-left: 3px solid var(--brand-secondary);
}

.comment-item.customer,
.message-item.customer {
  border-left: 3px solid var(--brand-primary);
}

.comment-editor {
  margin-top: 16px;
}

.comment-editor-actions,
.reject-actions {
  margin-top: 12px;
}

.operation-grid,
.footer-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.response-note {
  margin: 12px 0 0;
}

.footer-grid p {
  margin: 0;
}

.quotation-missing {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0b1220;
}

@media (max-width: 768px) {
  .public-shell {
    padding: 20px 14px 32px;
  }

  .hero-card,
  .panel-card,
  .lock-card {
    border-radius: 22px;
    padding: 18px;
  }

  .brand-block {
    flex-direction: column;
  }

  .brand-block h1,
  .panel-head h2 {
    font-size: 24px;
  }

  .panel-head,
  .line-item-header {
    flex-direction: column;
  }

  .panel-actions,
  .lock-actions,
  .reject-actions,
  .comment-editor-actions {
    justify-content: stretch;
    flex-direction: column;
  }
}

@media print {
  .ambient,
  .panel-actions,
  .lock-card,
  .comment-editor,
  .reject-actions,
  .message-box .el-textarea {
    display: none !important;
  }

  .quotation-public-page {
    background: #fff;
    color: #111827;
  }

  .hero-card,
  .panel-card,
  .summary-card {
    background: #fff;
    box-shadow: none;
    color: #111827;
  }
}
</style>
