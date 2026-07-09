import type { TodoItem, TodoTag } from '../types/agent'

export const TODO_SYSTEM_PROMPT = `你是业财管理系统中的智能助手。当用户的问题涉及多个步骤或可拆分的任务时，请正常给出 Markdown 解答，并在回复**末尾**追加一个 \`\`\`json 代码块，结构如下：

\`\`\`json
{
  "todos": [
    {
      "text": "主任务描述",
      "tag": "工作|生活|项目|财务",
      "priority": "高|中|低",
      "subSteps": [
        { "text": "子步骤 1" },
        { "text": "子步骤 2" }
      ]
    }
  ]
}
\`\`\`

要求：
- 子步骤按执行先后排序；
- tag 仅在四个枚举中选；priority 仅高/中/低；
- 若问题不涉及多步任务，不要输出 json 块。`

export const STEP_MODE_PROMPT = `当前处于「分步执行」模式。你只需要对当前 ToDo 清单中**第一条未完成**的待办事项给出详细执行结果，完成后用一行总结，并询问用户是否继续下一条。不要一次性输出全部结果。`

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

const VALID_TAGS: TodoTag[] = ['工作', '生活', '项目', '财务']

interface RawTodo {
  text?: string
  tag?: string
  priority?: string
  subSteps?: RawTodo[]
}

function normalize(raw: RawTodo): TodoItem | null {
  if (!raw || typeof raw.text !== 'string' || !raw.text.trim()) return null
  const tag = VALID_TAGS.includes(raw.tag as TodoTag) ? (raw.tag as TodoTag) : undefined
  const priority = ['高', '中', '低'].includes(raw.priority || '') ? (raw.priority as '高' | '中' | '低') : undefined
  const subSteps = Array.isArray(raw.subSteps)
    ? raw.subSteps.map(normalize).filter((x): x is TodoItem => !!x)
    : undefined
  return {
    id: uid(),
    text: raw.text.trim(),
    done: false,
    tag,
    priority,
    subSteps: subSteps && subSteps.length ? subSteps : undefined
  }
}

export interface ParseResult {
  todos: TodoItem[]
  cleanContent: string
}

export function parseTodos(content: string): ParseResult {
  if (!content) return { todos: [], cleanContent: content }
  const re = /```json\s*([\s\S]*?)```/g
  let match: RegExpExecArray | null
  let lastMatch: RegExpExecArray | null = null
  while ((match = re.exec(content)) !== null) {
    lastMatch = match
  }
  if (!lastMatch) return { todos: [], cleanContent: content }
  try {
    const parsed = JSON.parse(lastMatch[1].trim())
    if (!parsed || !Array.isArray(parsed.todos)) return { todos: [], cleanContent: content }
    const todos = parsed.todos.map(normalize).filter((x: TodoItem | null): x is TodoItem => !!x)
    if (!todos.length) return { todos: [], cleanContent: content }
    const cleanContent = (content.slice(0, lastMatch.index) + content.slice(lastMatch.index + lastMatch[0].length)).trim()
    return { todos, cleanContent }
  } catch {
    return { todos: [], cleanContent: content }
  }
}

export function todosToText(todos: TodoItem[]): string {
  const lines: string[] = []
  todos.forEach((t, i) => {
    const tag = t.tag ? ` [${t.tag}]` : ''
    const pri = t.priority ? ` (${t.priority})` : ''
    lines.push(`${i + 1}. ${t.done ? '✓' : '○'} ${t.text}${tag}${pri}`)
    t.subSteps?.forEach((s, j) => {
      lines.push(`   ${i + 1}.${j + 1} ${s.done ? '✓' : '○'} ${s.text}`)
    })
  })
  return lines.join('\n')
}

export function todosToCsv(todos: TodoItem[]): string {
  const rows = [['序号', '内容', '状态', '标签', '优先级', '截止时间']]
  todos.forEach((t, i) => {
    rows.push([
      String(i + 1),
      t.text,
      t.done ? '已完成' : '未完成',
      t.tag || '',
      t.priority || '',
      t.deadline ? new Date(t.deadline).toLocaleDateString() : ''
    ])
    t.subSteps?.forEach((s, j) => {
      rows.push([
        `${i + 1}.${j + 1}`,
        '  └ ' + s.text,
        s.done ? '已完成' : '未完成',
        '',
        '',
        ''
      ])
    })
  })
  return rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
}
