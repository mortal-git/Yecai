import * as Diff from 'diff'

export interface DiffLine {
  type: 'add' | 'del' | 'same'
  content: string
  oldLine?: number
  newLine?: number
}

export function diffContracts(textOld: string, textNew: string): DiffLine[] {
  const changes = Diff.diffLines(textOld, textNew)
  const result: DiffLine[] = []
  let oldLine = 1
  let newLine = 1

  for (const change of changes) {
    const lines = change.value.replace(/\n$/, '').split('\n')
    for (const line of lines) {
      if (change.added) {
        result.push({ type: 'add', content: line, newLine: newLine++ })
      } else if (change.removed) {
        result.push({ type: 'del', content: line, oldLine: oldLine++ })
      } else {
        result.push({ type: 'same', content: line, oldLine: oldLine++, newLine: newLine++ })
      }
    }
  }
  return result
}

export function diffStats(lines: DiffLine[]) {
  let added = 0, deleted = 0, same = 0
  for (const l of lines) {
    if (l.type === 'add') added++
    else if (l.type === 'del') deleted++
    else same++
  }
  return { added, deleted, same, total: added + deleted + same }
}
