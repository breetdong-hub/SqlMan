/**
 * 简单模糊匹配：query 的每个字符按顺序出现在 text 中即视为匹配（忽略大小写）。
 */
export function fuzzyMatch(query: string, text: string): boolean {
  if (!query.trim()) return true
  const q = query.trim().toLowerCase()
  const t = text.toLowerCase()
  let j = 0
  for (let i = 0; i < q.length; i++) {
    const idx = t.indexOf(q[i], j)
    if (idx === -1) return false
    j = idx + 1
  }
  return true
}
