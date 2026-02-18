import { useCallback } from 'react'
import type { OutputMode } from '../utils/format'
import { computeLifeSavedMinutes } from '../utils/lifeSaved'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import type { HistoryItem } from './types'

const KEY = 'number-extractor:history:v1'
const MAX = 500

function newId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function useHistory() {
  const [items, setItems] = useLocalStorageState<HistoryItem[]>(KEY, [])

  const add = useCallback(
    (output: string, mode: OutputMode, count: number, optionalName?: string) => {
      const now = Date.now()
      setItems((prev) => {
        const top = prev[0]
        if (top && top.output === output && top.mode === mode) {
          return prev
        }
        const name =
          optionalName != null && optionalName.trim() !== ''
            ? optionalName.trim()
            : `结果 ${new Date(now).toLocaleString('zh-CN')}`
        const lifeSavedMinutes = computeLifeSavedMinutes(count)
        const item: HistoryItem = {
          id: newId(),
          name,
          output,
          mode,
          count,
          createdAt: now,
          lifeSavedMinutes,
        }
        return [item, ...prev].slice(0, MAX)
      })
    },
    [setItems],
  )

  const rename = useCallback(
    (id: string, name: string) => {
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, name } : x)))
    },
    [setItems],
  )

  const remove = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((x) => x.id !== id))
    },
    [setItems],
  )

  const clear = useCallback(() => setItems([]), [setItems])

  return { items, add, rename, remove, clear }
}

