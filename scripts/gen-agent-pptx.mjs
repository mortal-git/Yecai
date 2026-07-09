import PptxGenJS from 'file:///C:/Users/甄德衡/AppData/Roaming/npm/node_modules/pptxgenjs/dist/pptxgen.cjs.js'
import fs from 'fs'

const p = new PptxGenJS()
p.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 })
p.layout = 'WIDE'
p.author = 'AI Product Team'
p.title = '业财智能体助手'

// Palette (purple gradient matching the agent page)
const C = {
  ink: '1A1A2E',       // dark navy/black
  purple: '5B4B8A',    // primary
  purpleDeep: '3E2C6B',
  lavender: 'B8A9E8',
  ice: 'F4F2FB',
  paper: 'FFFFFF',
  gray: '6B6B7B',
  line: 'E5E1F0',
  accent: 'F96167',    // coral accent for emphasis
  mint: '02C39A',
}

const FONT_H = '微软雅黑'
const FONT_B = '微软雅黑'

// ---- helpers ----
function header(slide, title, kicker) {
  slide.addShape('rect', { x: 0, y: 0, w: '100%', h: 0.08, fill: { color: C.purple } })
  if (kicker) {
    slide.addText(kicker, {
      x: 0.6, y: 0.35, w: 6, h: 0.3,
      fontFace: FONT_B, fontSize: 11, color: C.purple, bold: true, charSpacing: 4
    })
  }
  slide.addText(title, {
    x: 0.6, y: 0.65, w: 12, h: 0.7,
    fontFace: FONT_H, fontSize: 30, color: C.ink, bold: true
  })
  // small dot motif
  slide.addShape('ellipse', { x: 12.4, y: 0.55, w: 0.18, h: 0.18, fill: { color: C.lavender } })
  slide.addShape('ellipse', { x: 12.7, y: 0.55, w: 0.18, h: 0.18, fill: { color: C.purple } })
}

function footer(slide, pageNo) {
  slide.addText('业财智能体助手  ·  AI Agent Assistant', {
    x: 0.6, y: 7.15, w: 8, h: 0.25,
    fontFace: FONT_B, fontSize: 9, color: C.gray
  })
  slide.addText(String(pageNo).padStart(2, '0'), {
    x: 12.4, y: 7.15, w: 0.5, h: 0.25,
    fontFace: FONT_B, fontSize: 9, color: C.purple, bold: true, align: 'right'
  })
}

// =================== Slide 1 — Cover ===================
{
  const s = p.addSlide()
  s.background = { color: C.ink }
  // gradient block
  s.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: C.ink } })
  s.addShape('rect', { x: 0, y: 0, w: 0.35, h: '100%', fill: { color: C.purple } })

  // decorative circles (motif)
  s.addShape('ellipse', { x: 10.6, y: 0.6, w: 3.2, h: 3.2, fill: { color: C.purple }, line: { color: C.purple, width: 0 } })
  s.addShape('ellipse', { x: 11.4, y: 1.4, w: 3.2, h: 3.2, fill: { color: C.purpleDeep } })
  s.addShape('ellipse', { x: 11.0, y: 3.2, w: 1.3, h: 1.3, fill: { color: C.lavender } })

  s.addText('AI AGENT · 2026', {
    x: 0.9, y: 1.0, w: 6, h: 0.4,
    fontFace: FONT_B, fontSize: 12, color: C.lavender, bold: true, charSpacing: 6
  })

  s.addText('业财智能体助手', {
    x: 0.9, y: 2.3, w: 10, h: 1.1,
    fontFace: FONT_H, fontSize: 52, color: 'FFFFFF', bold: true
  })
  s.addText('让 AI 成为业财管理中的协作伙伴', {
    x: 0.9, y: 3.5, w: 10, h: 0.6,
    fontFace: FONT_H, fontSize: 22, color: C.lavender
  })

  // divider
  s.addShape('rect', { x: 0.9, y: 4.4, w: 0.6, h: 0.04, fill: { color: C.accent } })

  s.addText('一键对话 · 任务自动拆解 · 多模型管理 · 分步执行', {
    x: 0.9, y: 4.6, w: 11, h: 0.4,
    fontFace: FONT_B, fontSize: 14, color: 'E0DCEE'
  })

  s.addText('产品团队  |  智能体项目', {
    x: 0.9, y: 6.6, w: 8, h: 0.3,
    fontFace: FONT_B, fontSize: 11, color: C.gray
  })
}

// =================== Slide 2 — Agenda ===================
{
  const s = p.addSlide()
  s.background = { color: C.paper }
  header(s, '目录', 'CONTENTS')
  footer(s, 2)

  const items = [
    { n: '01', t: '项目背景', d: '业财工作中的协作痛点' },
    { n: '02', t: '项目目标', d: '我们要交付什么' },
    { n: '03', t: '项目内容', d: '整体功能架构与模块' },
    { n: '04', t: '核心功能', d: '六大关键能力解析' },
    { n: '05', t: '项目价值', d: '业务与技术双轮驱动' },
    { n: '06', t: '应用场景与规划', d: '落地路径与未来演进' },
  ]

  items.forEach((it, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 0.6 + col * 6.2
    const y = 1.7 + row * 1.55
    s.addShape('rect', { x, y, w: 5.9, h: 1.35, fill: { color: C.ice }, line: { color: C.line, width: 0.5 } })
    s.addShape('rect', { x, y, w: 0.08, h: 1.35, fill: { color: C.purple } })
    s.addText(it.n, {
      x: x + 0.25, y: y + 0.18, w: 1.1, h: 0.6,
      fontFace: FONT_H, fontSize: 30, color: C.purple, bold: true
    })
    s.addText(it.t, {
      x: x + 1.5, y: y + 0.22, w: 4.2, h: 0.45,
      fontFace: FONT_H, fontSize: 18, color: C.ink, bold: true
    })
    s.addText(it.d, {
      x: x + 1.5, y: y + 0.7, w: 4.2, h: 0.45,
      fontFace: FONT_B, fontSize: 12, color: C.gray
    })
  })
}

// =================== Slide 3 — Background ===================
{
  const s = p.addSlide()
  s.background = { color: C.paper }
  header(s, '项目背景', '01  ·  BACKGROUND')
  footer(s, 3)

  s.addText('业财管理场景中，大量工作依赖人工整理、跨系统核对与流程推进。AI 智能体的引入，旨在把重复劳动转化为可对话、可拆解、可执行的协作流程。', {
    x: 0.6, y: 1.5, w: 12.1, h: 0.9,
    fontFace: FONT_B, fontSize: 14, color: C.ink, lineSpacingMultiple: 1.5
  })

  const pains = [
    { icon: '◇', t: '任务碎片化', d: '催收、对账、月结等任务分散在多个系统中，缺少统一入口与跟踪。' },
    { icon: '◇', t: '执行靠经验', d: '复杂任务如何拆解、先后顺序如何安排，依赖个人经验，难以复用。' },
    { icon: '◇', t: 'AI 接入门槛高', d: '不同模型 API Key、参数、额度差异大，业务侧难以独立配置与管理。' },
    { icon: '◇', t: '对话不可沉淀', d: '与 AI 的对话缺乏结构化输出，难以转化为可执行的待办与可追溯的记录。' },
  ]

  pains.forEach((it, i) => {
    const x = 0.6 + i * 3.05
    const y = 2.7
    s.addShape('rect', { x, y, w: 2.85, h: 3.6, fill: { color: C.ice }, line: { color: C.line, width: 0.5 } })
    s.addShape('ellipse', { x: x + 0.3, y: y + 0.3, w: 0.5, h: 0.5, fill: { color: C.purple } })
    s.addText(it.icon, {
      x: x + 0.3, y: y + 0.32, w: 0.5, h: 0.5,
      fontFace: FONT_H, fontSize: 14, color: 'FFFFFF', bold: true, align: 'center', valign: 'middle'
    })
    s.addText(it.t, {
      x: x + 0.3, y: y + 1.0, w: 2.3, h: 0.45,
      fontFace: FONT_H, fontSize: 16, color: C.ink, bold: true
    })
    s.addText(it.d, {
      x: x + 0.3, y: y + 1.5, w: 2.3, h: 1.9,
      fontFace: FONT_B, fontSize: 11.5, color: C.gray, lineSpacingMultiple: 1.4
    })
  })
}

// =================== Slide 4 — Goals ===================
{
  const s = p.addSlide()
  s.background = { color: C.paper }
  header(s, '项目目标', '02  ·  GOALS')
  footer(s, 4)

  s.addText('围绕「对话即工作」的理念，构建一个轻量、可配置、可沉淀的业财智能体。', {
    x: 0.6, y: 1.5, w: 12.1, h: 0.5,
    fontFace: FONT_B, fontSize: 14, color: C.ink
  })

  const goals = [
    { n: '01', t: '对话即入口', d: '一个统一对话界面承接业财场景下的提问、规划与执行请求，降低使用门槛。' },
    { n: '02', t: '任务可拆解', d: '将复杂问题自动拆解为带优先级、标签、子步骤的可执行清单，并可一键导出。' },
    { n: '03', t: '模型可管理', d: '支持多模型并行接入，API Key 本地加密，参数与额度可视，按需切换。' },
  ]

  goals.forEach((it, i) => {
    const x = 0.6 + i * 4.15
    const y = 2.3
    s.addShape('rect', { x, y, w: 3.95, h: 4.2, fill: { color: C.purple }, line: { color: C.purple, width: 0 } })
    s.addText(it.n, {
      x: x + 0.4, y: y + 0.5, w: 3, h: 1,
      fontFace: FONT_H, fontSize: 56, color: 'FFFFFF', bold: true
    })
    s.addShape('rect', { x: x + 0.45, y: y + 1.7, w: 0.5, h: 0.04, fill: { color: C.accent } })
    s.addText(it.t, {
      x: x + 0.4, y: y + 1.9, w: 3.2, h: 0.5,
      fontFace: FONT_H, fontSize: 20, color: 'FFFFFF', bold: true
    })
    s.addText(it.d, {
      x: x + 0.4, y: y + 2.5, w: 3.2, h: 1.5,
      fontFace: FONT_B, fontSize: 12.5, color: 'E0DCEE', lineSpacingMultiple: 1.5
    })
  })
}

// =================== Slide 5 — Content / Architecture ===================
{
  const s = p.addSlide()
  s.background = { color: C.paper }
  header(s, '项目内容', '03  ·  ARCHITECTURE')
  footer(s, 5)

  s.addText('智能体页面由四大模块构成：对话核心、任务引擎、模型管理与会话沉淀，形成「输入—理解—执行—沉淀」的完整闭环。', {
    x: 0.6, y: 1.5, w: 12.1, h: 0.8,
    fontFace: FONT_B, fontSize: 13.5, color: C.ink, lineSpacingMultiple: 1.5
  })

  // 4-stage flow
  const stages = [
    { t: '对话核心', d: '流式输出\n多轮上下文\nMarkdown 渲染' },
    { t: '任务引擎', d: '自动拆解\n待办清单\n分步执行' },
    { t: '模型管理', d: '多模型接入\nKey 加密\n额度统计' },
    { t: '会话沉淀', d: '会话归档\n历史搜索\n导出复用' },
  ]

  stages.forEach((it, i) => {
    const x = 0.6 + i * 3.1
    const y = 2.7
    s.addShape('roundRect', { x, y, w: 2.8, h: 3.2, rectRadius: 0.08, fill: { color: C.ice }, line: { color: C.lavender, width: 1 } })
    s.addText(String(i + 1).padStart(2, '0'), {
      x: x + 0.3, y: y + 0.25, w: 2.4, h: 0.5,
      fontFace: FONT_H, fontSize: 14, color: C.purple, bold: true, charSpacing: 2
    })
    s.addText(it.t, {
      x: x + 0.3, y: y + 0.7, w: 2.4, h: 0.55,
      fontFace: FONT_H, fontSize: 19, color: C.ink, bold: true
    })
    s.addShape('rect', { x: x + 0.3, y: y + 1.35, w: 0.4, h: 0.03, fill: { color: C.purple } })
    s.addText(it.d, {
      x: x + 0.3, y: y + 1.55, w: 2.3, h: 1.5,
      fontFace: FONT_B, fontSize: 12, color: C.gray, lineSpacingMultiple: 1.6
    })

    // arrow
    if (i < stages.length - 1) {
      s.addShape('rightArrow', {
        x: x + 2.85, y: y + 1.45, w: 0.22, h: 0.3,
        fill: { color: C.purple }, line: { color: C.purple, width: 0 }
      })
    }
  })

  s.addText('闭环：输入 → AI 理解 → 拆解执行 → 结果沉淀 → 可追溯复用', {
    x: 0.6, y: 6.2, w: 12.1, h: 0.4,
    fontFace: FONT_B, fontSize: 12, color: C.purple, bold: true, align: 'center'
  })
}

// =================== Slide 6 — Feature 01 ===================
{
  const s = p.addSlide()
  s.background = { color: C.paper }
  header(s, '核心功能 01  ·  智能对话', '04  ·  KEY FEATURES')
  footer(s, 6)

  // left: description; right: mock chat
  s.addText('流式输出 · 多轮上下文 · Markdown 渲染', {
    x: 0.6, y: 1.6, w: 6, h: 0.4,
    fontFace: FONT_H, fontSize: 16, color: C.purple, bold: true
  })
  s.addText('对接 OpenAI 兼容协议，回答以流式方式逐字呈现，体验顺滑；上下文按对话维度累积，支持重新生成、删除单条消息与中断输出。', {
    x: 0.6, y: 2.05, w: 6, h: 1.2,
    fontFace: FONT_B, fontSize: 13, color: C.ink, lineSpacingMultiple: 1.6
  })

  const feats = ['流式 token 输出，可中途打断', '多轮上下文，自动拼接历史', 'Markdown 与代码块高亮渲染', '失败友好提示，支持重新生成']
  feats.forEach((f, i) => {
    const y = 3.5 + i * 0.55
    s.addShape('ellipse', { x: 0.6, y: y + 0.08, w: 0.18, h: 0.18, fill: { color: C.purple } })
    s.addText(f, { x: 0.95, y, w: 5.6, h: 0.4, fontFace: FONT_B, fontSize: 12.5, color: C.ink })
  })

  // mock chat panel
  const px = 7.2, py = 1.6, pw = 5.5, ph = 4.9
  s.addShape('roundRect', { x: px, y: py, w: pw, h: ph, rectRadius: 0.1, fill: { color: C.ice }, line: { color: C.line, width: 0.5 } })
  s.addShape('rect', { x: px, y: py, w: pw, h: 0.55, fill: { color: C.purple } })
  s.addText('智能体 · 对话', { x: px + 0.3, y: py + 0.1, w: 4, h: 0.35, fontFace: FONT_H, fontSize: 12, color: 'FFFFFF', bold: true })

  // user bubble
  s.addShape('roundRect', { x: px + 2.5, y: py + 0.85, w: 2.7, h: 0.6, rectRadius: 0.08, fill: { color: C.purple } })
  s.addText('帮我规划本周催收任务', { x: px + 2.6, y: py + 0.95, w: 2.5, h: 0.4, fontFace: FONT_B, fontSize: 11, color: 'FFFFFF', align: 'center', valign: 'middle' })

  // ai bubble
  s.addShape('roundRect', { x: px + 0.3, y: py + 1.7, w: 4.9, h: 2.9, rectRadius: 0.08, fill: { color: 'FFFFFF' }, line: { color: C.line, width: 0.5 } })
  s.addText('好的，已为你梳理本周催收任务：\n\n1. 拉取逾期账单清单\n2. 按金额与账期排序\n3. 优先联系前 10 大客户\n4. 每日记录跟进结果', {
    x: px + 0.5, y: py + 1.85, w: 4.5, h: 2.6, fontFace: FONT_B, fontSize: 11.5, color: C.ink, lineSpacingMultiple: 1.5
  })

  // typing dots
  s.addShape('ellipse', { x: px + 0.45, y: py + 4.35, w: 0.12, h: 0.12, fill: { color: C.lavender } })
  s.addShape('ellipse', { x: px + 0.65, y: py + 4.35, w: 0.12, h: 0.12, fill: { color: C.lavender } })
  s.addShape('ellipse', { x: px + 0.85, y: py + 4.35, w: 0.12, h: 0.12, fill: { color: C.lavender } })
}

// =================== Slide 7 — Feature 02 ===================
{
  const s = p.addSlide()
  s.background = { color: C.paper }
  header(s, '核心功能 02  ·  任务自动拆解', '04  ·  KEY FEATURES')
  footer(s, 7)

  s.addText('AI 在回答末尾以 JSON 结构输出任务清单，前端解析后呈现为可勾选、可编辑、可导出的待办面板。', {
    x: 0.6, y: 1.5, w: 12.1, h: 0.7,
    fontFace: FONT_B, fontSize: 13.5, color: C.ink, lineSpacingMultiple: 1.5
  })

  // left: todo panel mock
  const px = 0.6, py = 2.4, pw = 6.2, ph = 4.2
  s.addShape('roundRect', { x: px, y: py, w: pw, h: ph, rectRadius: 0.08, fill: { color: C.ice }, line: { color: C.line, width: 0.5 } })
  s.addText('任务清单  ·  2/4', { x: px + 0.3, y: py + 0.2, w: 4, h: 0.4, fontFace: FONT_H, fontSize: 14, color: C.ink, bold: true })

  const todos = [
    { done: true, text: '拉取逾期账单清单', tag: '财务', pri: '高' },
    { done: true, text: '按金额与账期排序', tag: '工作', pri: '中' },
    { done: false, text: '联系前 10 大客户', tag: '工作', pri: '高' },
    { done: false, text: '每日记录跟进结果', tag: '工作', pri: '中' },
  ]
  todos.forEach((t, i) => {
    const y = py + 0.75 + i * 0.75
    s.addShape('roundRect', { x: px + 0.3, y, w: pw - 0.6, h: 0.62, rectRadius: 0.05, fill: { color: 'FFFFFF' }, line: { color: C.line, width: 0.3 } })
    s.addShape('roundRect', { x: px + 0.45, y: y + 0.18, w: 0.26, h: 0.26, rectRadius: 0.04, fill: { color: t.done ? C.purple : 'FFFFFF' }, line: { color: C.purple, width: 1 } })
    s.addText(t.done ? '✓' : '', { x: px + 0.45, y: y + 0.18, w: 0.26, h: 0.26, fontFace: FONT_B, fontSize: 12, color: 'FFFFFF', align: 'center', valign: 'middle' })
    s.addText(t.text, { x: px + 0.85, y: y + 0.12, w: 3.4, h: 0.4, fontFace: FONT_B, fontSize: 12, color: t.done ? C.gray : C.ink, bold: !t.done, strike: t.done })
    s.addShape('roundRect', { x: px + 4.3, y: y + 0.15, w: 0.7, h: 0.32, rectRadius: 0.04, fill: { color: C.ice }, line: { color: C.lavender, width: 0.5 } })
    s.addText(t.tag, { x: px + 4.3, y: y + 0.15, w: 0.7, h: 0.32, fontFace: FONT_B, fontSize: 10, color: C.purple, align: 'center', valign: 'middle' })
    s.addShape('roundRect', { x: px + 5.1, y: y + 0.15, w: 0.5, h: 0.32, rectRadius: 0.04, fill: { color: t.pri === '高' ? C.accent : C.purple } })
    s.addText(t.pri, { x: px + 5.1, y: y + 0.15, w: 0.5, h: 0.32, fontFace: FONT_B, fontSize: 10, color: 'FFFFFF', align: 'center', valign: 'middle', bold: true })
  })

  // right: feature bullets
  const fx = 7.2
  s.addText('能力点', { x: fx, y: 2.4, w: 5.5, h: 0.4, fontFace: FONT_H, fontSize: 16, color: C.purple, bold: true })

  const points = [
    ['自动结构化', 'AI 末尾输出 JSON，前端解析为主任务 + 子步骤'],
    ['标签与优先级', '支持 工作 / 生活 / 项目 / 财务 四类标签与高 / 中 / 低'],
    ['可编辑', '勾选、改优先级、设截止时间、增删条目'],
    ['一键导出', '支持导出为 .txt 与 .csv，便于沉淀到其他系统'],
  ]
  points.forEach((pt, i) => {
    const y = 3.0 + i * 0.95
    s.addShape('ellipse', { x: fx, y: y + 0.05, w: 0.4, h: 0.4, fill: { color: C.purple } })
    s.addText(String(i + 1), { x: fx, y: y + 0.05, w: 0.4, h: 0.4, fontFace: FONT_H, fontSize: 13, color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' })
    s.addText(pt[0], { x: fx + 0.55, y, w: 5, h: 0.35, fontFace: FONT_H, fontSize: 14, color: C.ink, bold: true })
    s.addText(pt[1], { x: fx + 0.55, y: y + 0.35, w: 5, h: 0.5, fontFace: FONT_B, fontSize: 11.5, color: C.gray, lineSpacingMultiple: 1.3 })
  })
}

// =================== Slide 8 — Feature 03 Step Mode ===================
{
  const s = p.addSlide()
  s.background = { color: C.paper }
  header(s, '核心功能 03  ·  分步执行模式', '04  ·  KEY FEATURES')
  footer(s, 8)

  s.addText('开启后，AI 仅对清单中「第一条未完成」的待办给出详细执行结果，完成一项再推进下一项，避免信息过载。', {
    x: 0.6, y: 1.5, w: 12.1, h: 0.7,
    fontFace: FONT_B, fontSize: 13.5, color: C.ink, lineSpacingMultiple: 1.5
  })

  // 3-step illustration
  const steps = [
    { n: '1', t: '开启分步', d: '会话顶部出现「分步执行」标签，AI 仅处理首条未完成项。' },
    { n: '2', t: '逐步输出', d: 'AI 给出当前一步的详细结果并询问是否继续下一条。' },
    { n: '3', t: '推进下一项', d: '用户确认后，自动推进到下一条未完成待办。' },
  ]
  steps.forEach((it, i) => {
    const x = 0.6 + i * 4.15
    const y = 2.6
    s.addShape('roundRect', { x, y, w: 3.95, h: 3.6, rectRadius: 0.08, fill: { color: 'FFFFFF' }, line: { color: C.line, width: 1 } })
    s.addShape('ellipse', { x: x + 1.6, y: y + 0.4, w: 0.7, h: 0.7, fill: { color: C.purple } })
    s.addText(it.n, { x: x + 1.6, y: y + 0.4, w: 0.7, h: 0.7, fontFace: FONT_H, fontSize: 24, color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' })
    s.addText(it.t, { x: x + 0.3, y: y + 1.35, w: 3.4, h: 0.45, fontFace: FONT_H, fontSize: 18, color: C.ink, bold: true, align: 'center' })
    s.addShape('rect', { x: x + 1.6, y: y + 1.9, w: 0.7, h: 0.03, fill: { color: C.accent } })
    s.addText(it.d, { x: x + 0.4, y: y + 2.1, w: 3.2, h: 1.3, fontFace: FONT_B, fontSize: 12.5, color: C.gray, align: 'center', lineSpacingMultiple: 1.5 })
  })

  s.addText('价值：把「一次性长文」拆为「可控节奏的对话」，让 AI 真正成为可指挥的执行者。', {
    x: 0.6, y: 6.45, w: 12.1, h: 0.4,
    fontFace: FONT_B, fontSize: 12.5, color: C.purple, bold: true, align: 'center'
  })
}

// =================== Slide 9 — Feature 04 Model Mgmt ===================
{
  const s = p.addSlide()
  s.background = { color: C.paper }
  header(s, '核心功能 04  ·  多模型管理', '04  ·  KEY FEATURES')
  footer(s, 9)

  s.addText('支持新增多个 OpenAI 兼容模型，分类管理；API Key 本地加密存储，可校验、设默认、按日限额度。', {
    x: 0.6, y: 1.5, w: 12.1, h: 0.6,
    fontFace: FONT_B, fontSize: 13.5, color: C.ink, lineSpacingMultiple: 1.5
  })

  // mock table
  const tx = 0.6, ty = 2.3, tw = 12.1
  const cols = [
    { t: '名称', w: 2.2 },
    { t: '分类', w: 1.0 },
    { t: '模型 ID', w: 2.4 },
    { t: '接口地址', w: 3.2 },
    { t: '状态', w: 1.0 },
    { t: '今日调用', w: 1.3 },
    { t: '默认', w: 1.0 },
  ]
  let cx = tx
  s.addShape('rect', { x: tx, y: ty, w: tw, h: 0.5, fill: { color: C.purple } })
  cols.forEach(c => {
    s.addText(c.t, { x: cx + 0.1, y: ty, w: c.w - 0.2, h: 0.5, fontFace: FONT_H, fontSize: 12, color: 'FFFFFF', bold: true, valign: 'middle' })
    cx += c.w
  })

  const rows = [
    ['DeepSeek Chat', '通用', 'deepseek-chat', 'https://api.deepseek.com', '正常', '32 / 100', '默认'],
    ['Claude Sonnet', '代码', 'claude-sonnet-4-6', 'https://api.anthropic.com', '正常', '12', ''],
    ['通义千问', '行业', 'qwen-max', 'https://dashscope.aliyuncs.com', '校验中', '5 / 50', ''],
  ]
  rows.forEach((r, i) => {
    const ry = ty + 0.5 + i * 0.62
    s.addShape('rect', { x: tx, y: ry, w: tw, h: 0.62, fill: { color: i % 2 ? C.ice : 'FFFFFF' }, line: { color: C.line, width: 0.3 } })
    let cx2 = tx
    r.forEach((cell, j) => {
      let color = C.ink, bold = false
      if (j === 4) { color = cell === '正常' ? C.mint : C.accent; bold = true }
      if (j === 6 && cell === '默认') { color = C.purple; bold = true }
      s.addText(cell, { x: cx2 + 0.1, y: ry, w: cols[j].w - 0.2, h: 0.62, fontFace: FONT_B, fontSize: 11, color, bold, valign: 'middle' })
      cx2 += cols[j].w
    })
  })

  // 4 feature bullets at bottom
  const feats = [
    ['Key 加密', 'AES 本地存储，不上服务端'],
    ['可校验', '一键验证 Key 与参数可用性'],
    ['按日限流', '配置每日调用上限，自动计数'],
    ['灵活切换', '会话级选择模型，按需切换'],
  ]
  feats.forEach((f, i) => {
    const x = 0.6 + i * 3.05
    const y = 5.0
    s.addShape('rect', { x, y, w: 2.85, h: 1.55, fill: { color: C.ice }, line: { color: C.line, width: 0.5 } })
    s.addShape('rect', { x, y, w: 0.08, h: 1.55, fill: { color: C.purple } })
    s.addText(f[0], { x: x + 0.25, y: y + 0.2, w: 2.5, h: 0.4, fontFace: FONT_H, fontSize: 14, color: C.ink, bold: true })
    s.addText(f[1], { x: x + 0.25, y: y + 0.65, w: 2.5, h: 0.8, fontFace: FONT_B, fontSize: 11, color: C.gray, lineSpacingMultiple: 1.4 })
  })
}

// =================== Slide 10 — Feature 05 Conversation ===================
{
  const s = p.addSlide()
  s.background = { color: C.paper }
  header(s, '核心功能 05  ·  会话管理与沉淀', '04  ·  KEY FEATURES')
  footer(s, 10)

  // left list mock
  const lx = 0.6, ly = 1.7, lw = 4.2, lh = 5.0
  s.addShape('roundRect', { x: lx, y: ly, w: lw, h: lh, rectRadius: 0.06, fill: { color: C.ice }, line: { color: C.line, width: 0.5 } })
  s.addShape('rect', { x: lx, y: ly, w: lw, h: 0.55, fill: { color: C.purple } })
  s.addText('智能体 · 会话', { x: lx + 0.25, y: ly + 0.1, w: 3, h: 0.35, fontFace: FONT_H, fontSize: 13, color: 'FFFFFF', bold: true })

  const convs = [
    { t: '本周催收任务规划', time: '今天', active: true },
    { t: '应收逾期原因分析', time: '昨天' },
    { t: '月结成本检查清单', time: '6/28' },
    { t: '发票批量导入拆解', time: '6/27', archived: true },
    { t: '对账单字段映射', time: '6/25', archived: true },
  ]
  convs.forEach((c, i) => {
    const y = ly + 0.7 + i * 0.78
    if (c.active) {
      s.addShape('rect', { x: lx + 0.15, y, w: lw - 0.3, h: 0.7, fill: { color: 'FFFFFF' }, line: { color: C.lavender, width: 1 } })
    }
    s.addText(c.t, { x: lx + 0.3, y: y + 0.08, w: lw - 0.7, h: 0.32, fontFace: FONT_B, fontSize: 12, color: c.archived ? C.gray : C.ink, bold: c.active })
    s.addText(c.time + (c.archived ? ' · 已归档' : ''), { x: lx + 0.3, y: y + 0.4, w: lw - 0.7, h: 0.25, fontFace: FONT_B, fontSize: 10, color: C.gray })
  })

  // right features
  const rx = 5.3
  s.addText('会话级能力', { x: rx, y: 1.7, w: 7, h: 0.4, fontFace: FONT_H, fontSize: 16, color: C.purple, bold: true })

  const items = [
    { t: '多会话并行', d: '左侧会话列表按时间倒序，点击即可切换，互不干扰。' },
    { t: '重命名与归档', d: '支持重命名、归档与删除，已归档会话单独分类。' },
    { t: '清空记忆', d: '保留会话壳的同时清空消息，便于重置上下文。' },
    { t: '全量搜索', d: '跨会话关键词搜索消息，快速定位历史讨论。' },
    { t: '本地持久化', d: '会话、模型、模板均存储于浏览器 localStorage。' },
  ]
  items.forEach((it, i) => {
    const y = 2.3 + i * 0.88
    s.addShape('ellipse', { x: rx, y: y + 0.05, w: 0.36, h: 0.36, fill: { color: C.purple } })
    s.addText(String(i + 1), { x: rx, y: y + 0.05, w: 0.36, h: 0.36, fontFace: FONT_H, fontSize: 12, color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' })
    s.addText(it.t, { x: rx + 0.5, y, w: 6.5, h: 0.35, fontFace: FONT_H, fontSize: 13.5, color: C.ink, bold: true })
    s.addText(it.d, { x: rx + 0.5, y: y + 0.35, w: 6.5, h: 0.45, fontFace: FONT_B, fontSize: 11.5, color: C.gray, lineSpacingMultiple: 1.3 })
  })
}

// =================== Slide 11 — Feature 06 Templates & Export ===================
{
  const s = p.addSlide()
  s.background = { color: C.paper }
  header(s, '核心功能 06  ·  提示词模板与导出', '04  ·  KEY FEATURES')
  footer(s, 11)

  // left templates
  s.addText('提示词模板', { x: 0.6, y: 1.6, w: 6, h: 0.4, fontFace: FONT_H, fontSize: 16, color: C.purple, bold: true })
  s.addText('内置通用助手 / 财务专家 / 代码工程师三类模板，可自定义新增，会话级一键应用，统一 AI 角色定位。', {
    x: 0.6, y: 2.05, w: 6, h: 1.0,
    fontFace: FONT_B, fontSize: 12.5, color: C.ink, lineSpacingMultiple: 1.5
  })

  const tpls = [
    { t: '通用助手', d: '专业、友好，业财与日常问题均可', tag: '通用' },
    { t: '财务专家', d: '业财融合、对账、应收应付', tag: '财务' },
    { t: '代码工程师', d: 'Vue 3 / TS / Element Plus 审查', tag: '代码' },
  ]
  tpls.forEach((tp, i) => {
    const y = 3.2 + i * 1.05
    s.addShape('roundRect', { x: 0.6, y, w: 6, h: 0.92, rectRadius: 0.06, fill: { color: C.ice }, line: { color: C.line, width: 0.5 } })
    s.addShape('rect', { x: 0.6, y, w: 0.08, h: 0.92, fill: { color: C.purple } })
    s.addText(tp.t, { x: 0.85, y: y + 0.12, w: 4, h: 0.35, fontFace: FONT_H, fontSize: 14, color: C.ink, bold: true })
    s.addText(tp.d, { x: 0.85, y: y + 0.48, w: 4.5, h: 0.35, fontFace: FONT_B, fontSize: 11, color: C.gray })
    s.addShape('roundRect', { x: 5.3, y: y + 0.3, w: 1.1, h: 0.32, rectRadius: 0.04, fill: { color: C.purple } })
    s.addText(tp.tag, { x: 5.3, y: y + 0.3, w: 1.1, h: 0.32, fontFace: FONT_B, fontSize: 10, color: 'FFFFFF', align: 'center', valign: 'middle' })
  })

  // right export
  s.addText('结果导出', { x: 7.2, y: 1.6, w: 5.5, h: 0.4, fontFace: FONT_H, fontSize: 16, color: C.purple, bold: true })
  s.addText('任务清单支持复制、导出 .txt 与 .csv，让 AI 输出可被外部系统承接，形成「对话→执行→沉淀」闭环。', {
    x: 7.2, y: 2.05, w: 5.5, h: 1.0,
    fontFace: FONT_B, fontSize: 12.5, color: C.ink, lineSpacingMultiple: 1.5
  })

  const exps = [
    { icon: '📋', t: '一键复制', d: '清单结构化文本，粘贴即用' },
    { icon: '📄', t: '导出 .txt', d: '纯文本格式，便于阅读与归档' },
    { icon: '📊', t: '导出 .csv', d: '表格格式，可直接进 Excel' },
  ]
  exps.forEach((e, i) => {
    const y = 3.2 + i * 1.05
    s.addShape('roundRect', { x: 7.2, y, w: 5.5, h: 0.92, rectRadius: 0.06, fill: { color: C.ice }, line: { color: C.line, width: 0.5 } })
    s.addText(e.icon, { x: 7.4, y: y + 0.18, w: 0.7, h: 0.6, fontFace: FONT_B, fontSize: 22, align: 'center', valign: 'middle' })
    s.addText(e.t, { x: 8.2, y: y + 0.15, w: 4.3, h: 0.35, fontFace: FONT_H, fontSize: 14, color: C.ink, bold: true })
    s.addText(e.d, { x: 8.2, y: y + 0.5, w: 4.3, h: 0.35, fontFace: FONT_B, fontSize: 11, color: C.gray })
  })
}

// =================== Slide 12 — Value: Business ===================
{
  const s = p.addSlide()
  s.background = { color: C.ink }
  s.addShape('rect', { x: 0, y: 0, w: 0.35, h: '100%', fill: { color: C.accent } })
  s.addText('05  ·  VALUE', { x: 0.9, y: 0.6, w: 6, h: 0.3, fontFace: FONT_B, fontSize: 11, color: C.lavender, bold: true, charSpacing: 4 })
  s.addText('项目价值 · 业务侧', { x: 0.9, y: 0.95, w: 12, h: 0.8, fontFace: FONT_H, fontSize: 32, color: 'FFFFFF', bold: true })

  const vals = [
    { stat: '60%', t: '任务梳理提速', d: '复杂任务自动拆解，省去人工列清单与排序的时间。' },
    { stat: '1 个', t: '统一入口', d: '对话即工作，告别多系统切换与碎片化记录。' },
    { stat: '0', t: '后端依赖', d: '模型与历史均存本地，业务侧零部署即可上线。' },
    { stat: '∞', t: '场景复用', d: '通过提示词模板适配催收、对账、月结等多场景。' },
  ]

  vals.forEach((v, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 0.9 + col * 6.0
    const y = 2.1 + row * 2.4
    s.addShape('rect', { x, y, w: 5.6, h: 2.15, fill: { color: '241F38' }, line: { color: '3E2C6B', width: 0.5 } })
    s.addText(v.stat, { x: x + 0.3, y: y + 0.2, w: 2, h: 1.2, fontFace: FONT_H, fontSize: 56, color: C.lavender, bold: true })
    s.addText(v.t, { x: x + 2.4, y: y + 0.3, w: 3, h: 0.5, fontFace: FONT_H, fontSize: 17, color: 'FFFFFF', bold: true })
    s.addText(v.d, { x: x + 2.4, y: y + 0.8, w: 3, h: 1.2, fontFace: FONT_B, fontSize: 12, color: 'C9C4DC', lineSpacingMultiple: 1.5 })
  })

  s.addText('业财智能体助手  ·  让 AI 真正参与工作', { x: 0.9, y: 7.0, w: 8, h: 0.3, fontFace: FONT_B, fontSize: 11, color: C.gray })
}

// =================== Slide 13 — Value: Technical ===================
{
  const s = p.addSlide()
  s.background = { color: C.paper }
  header(s, '项目价值 · 技术侧', '05  ·  VALUE')
  footer(s, 13)

  const items = [
    { t: '协议兼容', d: '遵循 OpenAI Chat Completions 协议，可无缝接入 DeepSeek、通义、Claude 等主流模型。' },
    { t: '前端纯静态', d: 'Vue 3 + Pinia + Element Plus，无后端依赖，部署成本极低。' },
    { t: '本地加密', d: 'API Key 加密存储于浏览器，不上传服务端，安全合规。' },
    { t: '结构化输出', d: '通过系统提示词约束 AI 输出 JSON，前端解析为可操作对象。' },
    { t: '流式响应', d: '基于 fetch + AbortController 实现流式输出与可中断。' },
    { t: '可扩展', d: '提示词模板、模型分类、待办标签均为枚举设计，便于扩展新场景。' },
  ]

  items.forEach((it, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const x = 0.6 + col * 4.15
    const y = 1.7 + row * 2.55
    s.addShape('roundRect', { x, y, w: 3.95, h: 2.3, rectRadius: 0.06, fill: { color: C.ice }, line: { color: C.line, width: 0.5 } })
    s.addShape('ellipse', { x: x + 0.3, y: y + 0.3, w: 0.45, h: 0.45, fill: { color: C.purple } })
    s.addText(String(i + 1).padStart(2, '0'), { x: x + 0.3, y: y + 0.3, w: 0.45, h: 0.45, fontFace: FONT_H, fontSize: 11, color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' })
    s.addText(it.t, { x: x + 0.3, y: y + 0.9, w: 3.4, h: 0.45, fontFace: FONT_H, fontSize: 16, color: C.ink, bold: true })
    s.addShape('rect', { x: x + 0.3, y: y + 1.4, w: 0.4, h: 0.03, fill: { color: C.accent } })
    s.addText(it.d, { x: x + 0.3, y: y + 1.55, w: 3.4, h: 0.7, fontFace: FONT_B, fontSize: 11.5, color: C.gray, lineSpacingMultiple: 1.4 })
  })
}

// =================== Slide 14 — Scenarios ===================
{
  const s = p.addSlide()
  s.background = { color: C.paper }
  header(s, '应用场景', '06  ·  SCENARIOS')
  footer(s, 14)

  s.addText('智能体已在以下业财场景中具备落地条件，可作为日常工作的「AI 协作伙伴」直接介入。', {
    x: 0.6, y: 1.5, w: 12.1, h: 0.5,
    fontFace: FONT_B, fontSize: 13.5, color: C.ink
  })

  const scenes = [
    { t: '账单催收', d: '生成按金额、账期排序的催收清单与跟进话术。' },
    { t: '应收分析', d: '对话式分析逾期原因，输出结构化风险点。' },
    { t: '月结检查', d: '一键生成月结成本检查清单，逐项核对。' },
    { t: '功能拆解', d: '把「上线发票批量导入」等需求拆为可执行步骤。' },
    { t: '字段映射', d: '协助梳理对账单字段与系统字段的对应关系。' },
    { t: '日常问答', d: '业财制度、流程、术语的即问即答助手。' },
  ]

  scenes.forEach((sc, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const x = 0.6 + col * 4.15
    const y = 2.3 + row * 2.4
    s.addShape('roundRect', { x, y, w: 3.95, h: 2.15, rectRadius: 0.06, fill: { color: 'FFFFFF' }, line: { color: C.lavender, width: 1 } })
    s.addShape('rect', { x, y, w: 3.95, h: 0.08, fill: { color: C.purple } })
    s.addText('0' + (i + 1), { x: x + 0.3, y: y + 0.3, w: 1, h: 0.5, fontFace: FONT_H, fontSize: 22, color: C.lavender, bold: true })
    s.addText(sc.t, { x: x + 1.2, y: y + 0.35, w: 2.6, h: 0.45, fontFace: FONT_H, fontSize: 17, color: C.ink, bold: true })
    s.addText(sc.d, { x: x + 0.3, y: y + 1.05, w: 3.4, h: 0.95, fontFace: FONT_B, fontSize: 12, color: C.gray, lineSpacingMultiple: 1.5 })
  })
}

// =================== Slide 15 — Roadmap ===================
{
  const s = p.addSlide()
  s.background = { color: C.paper }
  header(s, '未来规划', '06  ·  ROADMAP')
  footer(s, 15)

  // timeline
  s.addShape('rect', { x: 0.9, y: 3.85, w: 11.5, h: 0.04, fill: { color: C.lavender } })

  const phases = [
    { phase: 'Q3 2026', t: '后端化', d: '引入轻量后端，统一鉴权与模型代理，支持团队共享。' },
    { phase: 'Q4 2026', t: '工具调用', d: '接入 Function Calling，让 AI 直接查询账单与执行操作。' },
    { phase: 'Q1 2027', t: '知识库', d: '业财制度、SOP 向量化，AI 回答可溯源至文档。' },
    { phase: 'Q2 2027', t: '多智能体', d: '催收、对账、月结等子智能体协同，按场景自动调度。' },
  ]
  phases.forEach((ph, i) => {
    const x = 0.9 + i * 2.95
    const y = 2.3
    s.addShape('ellipse', { x: x + 1.2, y: 3.7, w: 0.35, h: 0.35, fill: { color: C.purple } })
    s.addText(String(i + 1), { x: x + 1.2, y: 3.7, w: 0.35, h: 0.35, fontFace: FONT_H, fontSize: 13, color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' })

    // above line — phase + title
    s.addText(ph.phase, { x, y, w: 2.7, h: 0.35, fontFace: FONT_B, fontSize: 11, color: C.purple, bold: true, align: 'center' })
    s.addText(ph.t, { x, y: y + 0.4, w: 2.7, h: 0.5, fontFace: FONT_H, fontSize: 18, color: C.ink, bold: true, align: 'center' })

    // below line — desc
    s.addText(ph.d, { x, y: 4.4, w: 2.7, h: 1.6, fontFace: FONT_B, fontSize: 11.5, color: C.gray, align: 'center', lineSpacingMultiple: 1.5 })
  })
}

// =================== Slide 16 — Closing ===================
{
  const s = p.addSlide()
  s.background = { color: C.ink }
  s.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: C.ink } })
  s.addShape('rect', { x: 0, y: 0, w: 0.35, h: '100%', fill: { color: C.purple } })

  s.addShape('ellipse', { x: 9.8, y: 4.2, w: 4.5, h: 4.5, fill: { color: C.purpleDeep } })
  s.addShape('ellipse', { x: 10.6, y: 3.4, w: 3, h: 3, fill: { color: C.purple } })
  s.addShape('ellipse', { x: 11.2, y: 4.8, w: 1.2, h: 1.2, fill: { color: C.lavender } })

  s.addText('THANK YOU', {
    x: 0.9, y: 2.5, w: 9, h: 0.5,
    fontFace: FONT_B, fontSize: 14, color: C.lavender, bold: true, charSpacing: 8
  })
  s.addText('让 AI 成为业财工作的协作伙伴', {
    x: 0.9, y: 3.1, w: 9, h: 1,
    fontFace: FONT_H, fontSize: 44, color: 'FFFFFF', bold: true
  })
  s.addShape('rect', { x: 0.9, y: 4.3, w: 0.6, h: 0.04, fill: { color: C.accent } })
  s.addText('对话即工作  ·  任务可拆解  ·  模型可管理  ·  结果可沉淀', {
    x: 0.9, y: 4.5, w: 10, h: 0.5,
    fontFace: FONT_B, fontSize: 14, color: 'E0DCEE'
  })
  s.addText('业财智能体项目团队  |  2026', {
    x: 0.9, y: 6.5, w: 8, h: 0.3,
    fontFace: FONT_B, fontSize: 11, color: C.gray
  })
}

const out = '业财智能体助手介绍.pptx'
await p.writeFile({ fileName: out })
console.log('written:', out, fs.existsSync(out))
