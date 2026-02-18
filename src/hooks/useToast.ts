import { useCallback, useMemo, useRef, useState } from 'react'

export type Toast = {
  id: string
  message: string
}

function newId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef(new Map<string, number>())

  const show = useCallback((message: string, durationMs = 1800) => {
    const id = newId()
    setToasts((prev) => [{ id, message }, ...prev].slice(0, 3))
    const t = window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id))
      timers.current.delete(id)
    }, durationMs)
    timers.current.set(id, t)
  }, [])

  const dismiss = useCallback((id: string) => {
    const t = timers.current.get(id)
    if (t) window.clearTimeout(t)
    timers.current.delete(id)
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  return useMemo(() => ({ toasts, show, dismiss }), [toasts, show, dismiss])
}

