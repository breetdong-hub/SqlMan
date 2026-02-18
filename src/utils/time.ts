export function formatDateTime(ts: number): string {
  const d = new Date(ts)
  // 尽量稳定：YYYY-MM-DD HH:mm:ss
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

