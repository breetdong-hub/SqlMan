/// <reference lib="webworker" />

import { extractIntegersFromText } from '../utils/parse'

export type ParseRequest = {
  id: number
  text: string
  maxChars: number
}

export type ParseResponse = {
  id: number
  values: string[]
  truncated: boolean
  processedChars: number
  totalChars: number
  elapsedMs: number
}

self.onmessage = (e: MessageEvent<ParseRequest>) => {
  const { id, text, maxChars } = e.data
  const t0 = performance.now()
  const res = extractIntegersFromText(text, { maxChars })
  const t1 = performance.now()

  const msg: ParseResponse = {
    id,
    values: res.values,
    truncated: res.truncated,
    processedChars: res.processedChars,
    totalChars: res.totalChars,
    elapsedMs: Math.round(t1 - t0),
  }
  postMessage(msg)
}

