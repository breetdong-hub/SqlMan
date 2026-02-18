import type { HistoryItem } from './types'

const KEY = 'number-extractor:history:v1'

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    // 轻量校验，避免旧数据把 UI 搞挂
    return data
      .filter((x) => x && typeof x === 'object')
      .map((x) => x as HistoryItem)
      .filter(
        (x) =>
          typeof x.id === 'string' &&
          typeof x.name === 'string' &&
          typeof x.output === 'string' &&
          typeof x.mode === 'string' &&
          typeof x.count === 'number' &&
          typeof x.createdAt === 'number',
      )
      .slice(0, 50)
  } catch {
    return []
  }
}

export function saveHistory(items: HistoryItem[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, 50)))
  } catch {
    // ignore
  }
}

