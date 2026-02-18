import type { OutputMode } from '../utils/format'

export type HistoryItem = {
  id: string
  name: string
  output: string
  mode: OutputMode
  count: number
  createdAt: number
  /** 该条记录节省的生命（分钟），用于累计展示。旧数据可能无此字段，展示时用 count 推算 */
  lifeSavedMinutes?: number
}

