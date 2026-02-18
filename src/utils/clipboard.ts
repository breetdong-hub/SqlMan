export async function copyTextToClipboard(text: string): Promise<void> {
  if (!text) return

  // 现代 API
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  // 兜底方案（兼容性更好）
  const el = document.createElement('textarea')
  el.value = text
  el.setAttribute('readonly', 'true')
  el.style.position = 'fixed'
  el.style.left = '-9999px'
  el.style.top = '0'
  document.body.appendChild(el)
  el.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(el)
  if (!ok) {
    throw new Error('复制失败（浏览器不支持剪贴板写入）')
  }
}

