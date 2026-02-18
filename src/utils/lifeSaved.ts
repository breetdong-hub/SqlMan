/**
 * 估算手动处理每个数字约需 3 秒（复制、格式、粘贴、纠错等），
 * 用于计算「已节省生命」的趣味显示。
 */
const SECONDS_PER_NUMBER = 3

export function computeLifeSavedMinutes(count: number): number {
  if (count <= 0) return 0
  const seconds = count * SECONDS_PER_NUMBER
  return Math.round((seconds / 60) * 10) / 10
}

export function formatLifeSaved(minutes: number): string {
  if (minutes <= 0) return ''
  if (minutes < 0.1) return '已节省不到 0.1 分钟生命'
  return `已节省 ${minutes} 分钟生命`
}

export function formatTotalLifeSavedHours(totalMinutes: number): string {
  if (totalMinutes <= 0) return ''
  const hours = Math.round((totalMinutes / 60) * 10) / 10
  if (hours < 0.1) return '总节省不到 0.1 小时'
  return `总节省 ${hours} 小时`
}
