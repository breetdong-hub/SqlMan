import { useEffect, useMemo, useState } from 'react'

type Serializer<T> = {
  parse: (raw: string) => T
  stringify: (value: T) => string
}

const defaultSerializer: Serializer<unknown> = {
  parse: (raw) => JSON.parse(raw),
  stringify: (value) => JSON.stringify(value),
}

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
  serializer: Serializer<T> = defaultSerializer as Serializer<T>,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw == null) return defaultValue
      return serializer.parse(raw)
    } catch {
      return defaultValue
    }
  })

  const setAndPersist = useMemo(() => {
    return (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value
        try {
          localStorage.setItem(key, serializer.stringify(next))
        } catch {
          // 忽略写入失败（例如隐私模式/空间不足）
        }
        return next
      })
    }
  }, [key, serializer])

  // 同步：当 key 变化时更新（一般不会变，但保持健壮）
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw == null) {
        setState(defaultValue)
        return
      }
      setState(serializer.parse(raw))
    } catch {
      setState(defaultValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return [state, setAndPersist]
}

