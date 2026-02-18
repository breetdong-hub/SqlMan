export type ExtractIntegersOptions = {
  /**
   * 为了防止极端大粘贴导致内存/性能问题，可设置最大处理字符数。
   * 超过部分会被截断不参与解析。
   */
  maxChars?: number
}

export type ExtractIntegersResult = {
  values: string[]
  truncated: boolean
  processedChars: number
  totalChars: number
}

/**
 * 从任意文本中按出现顺序提取所有“整数数字串”（0-9 连续序列）。
 *
 * 规则：
 * - 只提取数字序列（0-9）
 * - 小数点/负号等都视为分隔符（因此不会把 -12 当作负数，也不会解析 12.34 为小数）
 * - 保留出现顺序
 * - 保留前导零（返回 string，不转 number）
 */
export function extractIntegersFromText(
  text: string,
  options: ExtractIntegersOptions = {},
): ExtractIntegersResult {
  const maxChars = options.maxChars ?? Number.POSITIVE_INFINITY
  const totalChars = text.length
  const processedChars = Math.min(totalChars, maxChars)
  const truncated = processedChars < totalChars

  const values: string[] = []
  if (processedChars === 0) {
    return { values, truncated, processedChars, totalChars }
  }

  // 手写扫描比正则 match 更省内存/更可控（也更适合超大文本）
  let start = -1
  for (let i = 0; i < processedChars; i++) {
    const code = text.charCodeAt(i)
    const isDigit = code >= 48 && code <= 57
    if (isDigit) {
      if (start === -1) start = i
      continue
    }
    if (start !== -1) {
      values.push(text.slice(start, i))
      start = -1
    }
  }
  if (start !== -1) {
    values.push(text.slice(start, processedChars))
  }

  return { values, truncated, processedChars, totalChars }
}

