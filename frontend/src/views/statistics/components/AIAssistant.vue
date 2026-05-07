<template>
  <div class="ai-assistant">
    <el-row :gutter="20">
      <!-- AI智能咨询 -->
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span><strong>AI智能咨询</strong></span>
              <div class="header-right">
                <el-tag type="success" size="small">
                  <el-icon><Connection /></el-icon>
                  AI在线
                </el-tag>
              </div>
            </div>
          </template>

          <!-- 聊天区域 -->
          <div class="chat-container" ref="chatContainerRef">
            <div class="chat-messages">
              <!-- 欢迎消息 -->
              <div class="message welcome-message">
                <div class="message-avatar ai-avatar">
                  <el-icon :size="24"><MagicStick /></el-icon>
                </div>
                <div class="message-content">
                  <div class="message-bubble ai-bubble">
                    您好！我是AI表格助手，可以帮助您解决以下问题：
                    <ul>
                      <li>模板导入失败怎么办？</li>
                      <li>如何配置字段映射？</li>
                      <li>报表生成异常如何排查？</li>
                      <li>如何导出报表？</li>
                    </ul>
                    请输入您的问题，我会尽力为您解答！
                  </div>
                </div>
              </div>

              <!-- 用户消息 -->
              <div v-for="(msg, index) in chatMessages" :key="index" class="message" :class="msg.type">
                <div class="message-avatar" :class="msg.type === 'user' ? 'user-avatar' : 'ai-avatar'">
                  <el-icon v-if="msg.type === 'ai'" :size="24"><MagicStick /></el-icon>
                  <el-icon v-else :size="24"><User /></el-icon>
                </div>
                <div class="message-content">
                  <div class="message-bubble" :class="msg.type === 'user' ? 'user-bubble' : 'ai-bubble'">
                    {{ msg.content }}
                  </div>
                  <div class="message-time">{{ msg.time }}</div>
                </div>
              </div>

              <!-- AI正在输入 -->
              <div v-if="aiTyping" class="message ai">
                <div class="message-avatar ai-avatar">
                  <el-icon :size="24"><MagicStick /></el-icon>
                </div>
                <div class="message-content">
                  <div class="message-bubble ai-bubble typing">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="chat-input-area">
            <div class="quick-questions">
              <el-tag v-for="q in quickQuestions" :key="q" @click="handleQuickQuestion(q)" class="quick-tag">
                {{ q }}
              </el-tag>
            </div>
            <div class="input-row">
              <el-input
                v-model="userInput"
                type="textarea"
                :rows="2"
                placeholder="请输入您的问题，AI助手会实时解答..."
                resize="none"
                @keydown.enter.ctrl="handleSendMessage"
              />
              <el-button type="primary" @click="handleSendMessage" :disabled="!userInput.trim() || aiTyping">
                <el-icon><Promotion /></el-icon>
                发送
              </el-button>
            </div>
            <div class="input-hint">按 Ctrl + Enter 发送</div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧功能区 -->
      <el-col :span="8">
        <!-- 功能使用教程 -->
        <el-card shadow="never" class="tutorial-card">
          <template #header>
            <span><strong>功能使用教程</strong></span>
          </template>
          <div class="tutorial-list">
            <div v-for="(tutorial, index) in tutorials" :key="index" class="tutorial-item" @click="handleShowTutorial(tutorial)">
              <div class="tutorial-icon">
                <el-icon :size="20"><Document /></el-icon>
              </div>
              <div class="tutorial-info">
                <h4>{{ tutorial.title }}</h4>
                <p>{{ tutorial.desc }}</p>
              </div>
              <el-icon class="tutorial-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </el-card>

        <!-- 个性化设置 -->
        <el-card shadow="never" class="settings-card">
          <template #header>
            <span><strong>个性化设置</strong></span>
          </template>
          <el-form label-position="top">
            <el-form-item label="报表生成提醒">
              <el-switch v-model="settings.reportReminder" active-text="开启" inactive-text="关闭" />
              <div v-if="settings.reportReminder" class="setting-sub">
                <el-select v-model="settings.reminderDay" placeholder="提醒日期" style="width: 100%; margin-top: 10px">
                  <el-option label="每月25日" :value="25" />
                  <el-option label="每月最后一天" :value="0" />
                </el-select>
              </div>
            </el-form-item>
            <el-form-item label="导出默认格式">
              <el-select v-model="settings.defaultExportFormat" style="width: 100%">
                <el-option label="Excel (.xlsx)" value="xlsx" />
                <el-option label="PDF (.pdf)" value="pdf" />
                <el-option label="CSV (.csv)" value="csv" />
              </el-select>
            </el-form-item>
            <el-form-item label="数据保留天数">
              <el-input-number v-model="settings.dataRetentionDays" :min="7" :max="365" style="width: 100%" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveSettings" style="width: 100%">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 自动备份设置 -->
        <el-card shadow="never" class="backup-card">
          <template #header>
            <div class="card-header">
              <span><strong>自动备份</strong></span>
              <el-switch v-model="settings.autoBackup" active-color="#67c23a" />
            </div>
          </template>
          <div v-if="settings.autoBackup">
            <el-form label-position="top">
              <el-form-item label="备份周期">
                <el-select v-model="settings.backupCycle" style="width: 100%">
                  <el-option label="每日备份" value="daily" />
                  <el-option label="每周备份" value="weekly" />
                  <el-option label="每月备份" value="monthly" />
                </el-select>
              </el-form-item>
              <el-form-item label="保留备份数量">
                <el-input-number v-model="settings.backupRetentionCount" :min="3" :max="30" style="width: 100%" />
              </el-form-item>
              <div class="backup-info">
                <el-alert type="info" :closable="false" show-icon>
                  <template #title>
                    最近备份：2026-03-20 00:00:00
                  </template>
                </el-alert>
              </div>
              <el-button type="success" plain @click="handleManualBackup" style="width: 100%; margin-top: 10px">
                <el-icon><Download /></el-icon>
                立即备份
              </el-button>
            </el-form>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 教程详情对话框 -->
    <el-dialog v-model="tutorialDialogVisible" :title="currentTutorial?.title" width="700px">
      <div class="tutorial-content" v-if="currentTutorial">
        <div class="tutorial-section" v-for="(section, index) in currentTutorial.sections" :key="index">
          <h4>{{ section.title }}</h4>
          <p>{{ section.content }}</p>
          <div class="tutorial-image" v-if="section.image">
            <el-image :src="section.image" fit="contain" />
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="tutorialDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { MagicStick, User, Promotion, Document, ArrowRight, Connection, Download } from '@element-plus/icons-vue'

interface ChatMessage {
  type: 'user' | 'ai'
  content: string
  time: string
}

interface Tutorial {
  title: string
  desc: string
  sections: Array<{ title: string, content: string, image?: string }>
}

const chatContainerRef = ref<HTMLElement>()
const userInput = ref('')
const aiTyping = ref(false)
const tutorialDialogVisible = ref(false)
const currentTutorial = ref<Tutorial | null>(null)

const quickQuestions = [
  '如何上传Excel模板？',
  '字段映射失败怎么办？',
  '报表数据缺失如何处理？',
  '如何批量导出报表？'
]

const chatMessages = ref<ChatMessage[]>([])

const settings = reactive({
  reportReminder: true,
  reminderDay: 25,
  defaultExportFormat: 'xlsx',
  dataRetentionDays: 30,
  autoBackup: true,
  backupCycle: 'daily',
  backupRetentionCount: 7
})

const tutorials: Tutorial[] = [
  {
    title: '模板导入教程',
    desc: '学习如何上传和配置报表模板',
    sections: [
      { title: '第一步：准备模板', content: '确保您的Excel/WPS模板文件格式为.xlsx、.xls或.csv，文件大小不超过10MB。' },
      { title: '第二步：上传模板', content: '在"模板管理"页面，点击"上传模板"按钮，选择您的模板文件。' },
      { title: '第三步：AI识别', content: '系统会自动识别模板的表格结构、表头字段和数据区域。' },
      { title: '第四步：确认预览', content: '预览识别结果，如有误差可手动调整。' }
    ]
  },
  {
    title: '字段映射配置教程',
    desc: '配置模板字段与系统字段的映射关系',
    sections: [
      { title: '第一步：选择模板', content: '在"字段映射"页面，选择需要配置的报表模板。' },
      { title: '第二步：AI自动匹配', content: '系统会根据字段名称相似度自动推荐映射关系，准确率可达95%。' },
      { title: '第三步：手动调整', content: '如有需要，可手动调整映射关系，支持一对一、一对多映射。' },
      { title: '第四步：保存方案', content: '配置完成后，保存为映射方案，后续可直接复用。' }
    ]
  },
  {
    title: '报表生成教程',
    desc: '一键生成月度订单报表',
    sections: [
      { title: '第一步：选择配置', content: '在"报表生成"页面，选择模板和映射方案。' },
      { title: '第二步：选择周期', content: '指定报表周期，如2026年3月。' },
      { title: '第三步：一键生成', content: '点击"一键生成"，AI自动从订单系统提取数据并填充报表。' },
      { title: '第四步：数据校验', content: '生成后AI会自动校验数据完整性，发现异常会提示修正。' }
    ]
  },
  {
    title: '报表导出教程',
    desc: '多格式导出和分享报表',
    sections: [
      { title: '第一步：选择报表', content: '在"导出分享"页面，选择需要导出的报表。' },
      { title: '第二步：设置格式', content: '支持Excel、PDF、CSV、WPS等多种格式，可选择是否包含样式和图表。' },
      { title: '第三步：导出/分享', content: '可直接导出到本地，或通过内部消息、邮件、链接等方式分享。' }
    ]
  }
]

const getCurrentTime = () => {
  const now = new Date()
  return now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const handleSendMessage = () => {
  if (!userInput.trim() || aiTyping.value) return

  const userMessage: ChatMessage = {
    type: 'user',
    content: userInput.trim(),
    time: getCurrentTime()
  }
  chatMessages.value.push(userMessage)
  userInput.value = ''

  aiTyping.value = true

  setTimeout(() => {
    aiTyping.value = false
    const aiResponse: ChatMessage = {
      type: 'ai',
      content: getAIResponse(userMessage.content),
      time: getCurrentTime()
    }
    chatMessages.value.push(aiResponse)

    nextTick(() => {
      if (chatContainerRef.value) {
        chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
      }
    })
  }, 1500)
}

const getAIResponse = (question: string): string => {
  const q = question.toLowerCase()
  if (q.includes('模板') && q.includes('上传')) {
    return '上传模板的步骤如下：\n1. 进入"模板管理"页面\n2. 点击"上传模板"按钮\n3. 选择Excel、WPS或CSV文件\n4. 填写模板名称、客户分类和报表类型\n5. 点击确认上传\n\nAI会自动识别表格结构，如有问题可查看"功能使用教程"中的模板导入教程。'
  } else if (q.includes('字段') && q.includes('映射')) {
    return '字段映射配置步骤：\n1. 进入"字段映射"页面\n2. 选择要配置的模板\n3. AI会自动推荐映射关系\n4. 如需调整，可手动选择系统字段\n5. 可设置数据处理方式（如保留2位小数）\n6. 保存为映射方案以便复用\n\n提示：映射异常时，系统会显示警告并提供解决方案。'
  } else if (q.includes('报表') && (q.includes('生成') || q.includes('创建'))) {
    return '生成报表的步骤：\n1. 进入"报表生成"页面\n2. 选择模板和映射方案\n3. 指定报表周期（如2026年3月）\n4. 点击"一键生成"\n5. AI会自动提取订单数据并填充报表\n6. 生成后可进行编辑和美化\n\n如需生成多个月份，可使用"批量生成"功能。'
  } else if (q.includes('导出') || q.includes('下载')) {
    return '报表导出支持以下格式：\n- Excel (.xlsx/.xls)\n- CSV (.csv)\n- PDF (.pdf)\n- WPS (.et)\n\n导出时可选择：\n- 是否包含图表\n- 是否保留表格样式\n- 是否包含备注\n\n分享方式：\n- 内部消息\n- 邮件分享\n- 链接分享（可设置密码和有效期）'
  } else if (q.includes('数据') && (q.includes('缺失') || q.includes('异常'))) {
    return '数据异常处理方法：\n1. 检查字段映射是否正确\n2. 确认订单系统中是否有对应周期的数据\n3. 查看映射异常提醒，根据提示调整\n4. 可使用"AI数据校验"功能检查数据完整性\n5. 发现异常数据可点击"修正"按钮一键修复\n\n如问题持续存在，建议联系管理员检查数据源。'
  } else {
    return '感谢您的提问！您的问题已收到。针对AI表格功能的常见问题，您可以：\n1. 查看右侧的"功能使用教程"\n2. 使用快速问题标签快速获取答案\n3. 详细描述您遇到的问题，我会尽力解答\n\n如需人工帮助，请联系系统管理员。'
  }
}

const handleQuickQuestion = (question: string) => {
  userInput.value = question
  handleSendMessage()
}

const handleShowTutorial = (tutorial: Tutorial) => {
  currentTutorial.value = tutorial
  tutorialDialogVisible.value = true
}

const handleSaveSettings = () => {
  ElMessage.success('设置保存成功')
}

const handleManualBackup = () => {
  ElMessage.success('备份任务已启动，请在备份记录中查看进度')
}
</script>

<style scoped>
.ai-assistant {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-container {
  height: 450px;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.user-avatar {
  background: #409eff;
  color: #fff;
}

.message-content {
  max-width: 75%;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
}

.ai-bubble {
  background: #fff;
  color: #303133;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.user-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.message.user .message-bubble {
  border-bottom-right-radius: 4px;
}

.message.ai .message-bubble {
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.message.user .message-time {
  text-align: right;
}

.welcome-message .ai-bubble ul {
  margin: 10px 0 0 0;
  padding-left: 20px;
}

.welcome-message .ai-bubble li {
  margin-bottom: 5px;
}

.typing {
  display: flex;
  gap: 4px;
  padding: 16px 20px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: #909399;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-6px);
  }
}

.chat-input-area {
  background: #fff;
  padding-top: 15px;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.quick-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.quick-tag:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-color: transparent;
}

.input-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.input-row .el-input {
  flex: 1;
}

.input-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.tutorial-card,
.settings-card,
.backup-card {
  margin-bottom: 20px;
}

.tutorial-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tutorial-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.tutorial-item:hover {
  background: #ecf5ff;
  transform: translateX(5px);
}

.tutorial-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.tutorial-info {
  flex: 1;
}

.tutorial-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #303133;
}

.tutorial-info p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.tutorial-arrow {
  color: #c0c4cc;
}

.setting-sub {
  margin-top: 10px;
}

.backup-info {
  margin-top: 15px;
}

.tutorial-content {
  max-height: 500px;
  overflow-y: auto;
}

.tutorial-section {
  margin-bottom: 25px;
}

.tutorial-section h4 {
  color: #409eff;
  margin-bottom: 10px;
}

.tutorial-section p {
  color: #606266;
  line-height: 1.8;
}

.tutorial-image {
  margin-top: 15px;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}
</style>
