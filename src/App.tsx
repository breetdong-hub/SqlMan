import './App.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ModeToggle } from './components/ModeToggle'
import { ToastHost } from './components/ToastHost'
import { HistoryList } from './components/HistoryList'
import type { OutputMode } from './utils/format'
import { formatOutput } from './utils/format'
import { computeLifeSavedMinutes, formatTotalLifeSavedHours } from './utils/lifeSaved'
import { copyTextToClipboard } from './utils/clipboard'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import { useToast } from './hooks/useToast'
import { useLocalStorageState } from './hooks/useLocalStorageState'
import { useHistory } from './history/useHistory'

type ParseResponse = {
  id: number
  values: string[]
  truncated: boolean
  processedChars: number
  totalChars: number
  elapsedMs: number
}

const INPUT_KEY = 'number-extractor:input:v1'
const INPUT_NAME_KEY = 'number-extractor:inputName:v1'
const MAX_PARSE_CHARS = 5_000_000
const MAX_PERSIST_INPUT_CHARS = 200_000

function loadInitialInput(): string {
  try {
    return localStorage.getItem(INPUT_KEY) ?? ''
  } catch {
    return ''
  }
}

function loadInitialInputName(): string {
  try {
    return localStorage.getItem(INPUT_NAME_KEY) ?? ''
  } catch {
    return ''
  }
}

function LifesaverLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="ls-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0071e3" />
          <stop offset="100%" stopColor="#00c7be" />
        </linearGradient>
      </defs>
      <path
        d="M16 6l8 4v8l-8 4-8-4v-8l8-4z"
        stroke="url(#ls-grad)"
        strokeWidth="1.8"
        fill="none"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="14" r="3" fill="url(#ls-grad)" opacity="0.9" />
      <path d="M10 10h4M22 10h-4M10 18h4M22 18h-4" stroke="url(#ls-grad)" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function App() {
  const { toasts, show } = useToast()
  const { items, add, rename, remove, clear } = useHistory()

  const [mode, setMode] = useLocalStorageState<OutputMode>('number-extractor:mode:v1', 'comma')

  const [input, setInput] = useState<string>(() => loadInitialInput())
  const [inputName, setInputName] = useState<string>(() => loadInitialInputName())
  const debouncedInputToPersist = useDebouncedValue(input, 800)
  const debouncedInputNameToPersist = useDebouncedValue(inputName, 500)

  const [values, setValues] = useState<string[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [parseInfo, setParseInfo] = useState<{
    truncated: boolean
    processedChars: number
    totalChars: number
    elapsedMs: number
  }>({ truncated: false, processedChars: 0, totalChars: 0, elapsedMs: 0 })

  const workerRef = useRef<Worker | null>(null)
  const reqIdRef = useRef(0)

  const startParse = (text: string) => {
    if (!text) {
      setValues([])
      setParseInfo({ truncated: false, processedChars: 0, totalChars: 0, elapsedMs: 0 })
      setIsParsing(false)
      return
    }
    const w = workerRef.current
    if (!w) return
    const id = ++reqIdRef.current
    setIsParsing(true)
    w.postMessage({ id, text, maxChars: MAX_PARSE_CHARS })
  }

  useEffect(() => {
    const w = new Worker(new URL('./workers/parserWorker.ts', import.meta.url), {
      type: 'module',
    })
    workerRef.current = w

    w.onmessage = (e: MessageEvent<ParseResponse>) => {
      const msg = e.data
      if (msg.id !== reqIdRef.current) return
      setValues(msg.values)
      setParseInfo({
        truncated: msg.truncated,
        processedChars: msg.processedChars,
        totalChars: msg.totalChars,
        elapsedMs: msg.elapsedMs,
      })
      setIsParsing(false)
    }

    queueMicrotask(() => startParse(input))

    return () => {
      w.terminate()
      workerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(INPUT_KEY, debouncedInputToPersist.slice(0, MAX_PERSIST_INPUT_CHARS))
    } catch {
      // ignore
    }
  }, [debouncedInputToPersist])

  useEffect(() => {
    try {
      localStorage.setItem(INPUT_NAME_KEY, debouncedInputNameToPersist)
    } catch {
      // ignore
    }
  }, [debouncedInputNameToPersist])

  const output = useMemo(() => formatOutput(values, mode), [values, mode])
  const lifeSavedMinutes = useMemo(() => computeLifeSavedMinutes(values.length), [values.length])
  const totalLifeSavedMinutes = useMemo(
    () => items.reduce((s, i) => s + (i.lifeSavedMinutes ?? computeLifeSavedMinutes(i.count)), 0),
    [items],
  )
  const totalLifeSavedText = formatTotalLifeSavedHours(totalLifeSavedMinutes)
  const debouncedOutputForHistory = useDebouncedValue(output, 900)

  useEffect(() => {
    if (!debouncedOutputForHistory) return
    add(debouncedOutputForHistory, mode, values.length, debouncedInputNameToPersist)
  }, [add, debouncedOutputForHistory, mode, values.length, debouncedInputNameToPersist])

  const onCopy = async () => {
    if (!output) {
      show('输出为空，无需复制')
      return
    }
    try {
      await copyTextToClipboard(output)
      add(output, mode, values.length, inputName)
      show('已复制到剪贴板')
    } catch (err) {
      show(err instanceof Error ? err.message : '复制失败')
    }
  }

  const onClearInput = () => {
    setInput('')
    startParse('')
    show('已清空输入')
  }

  return (
    <div className="app">
      <div className="header">
        <div className="headerBrand">
          <LifesaverLogo />
          <span className="headerTitle">Lifesaver</span>
        </div>
        <div className="headerMeta">
          {(lifeSavedMinutes > 0 || totalLifeSavedText) ? (
            <span className="lifeSavedBanner">
              {lifeSavedMinutes > 0 && <><b>已节省 {lifeSavedMinutes} 分钟</b></>}
              {lifeSavedMinutes > 0 && totalLifeSavedText && ' · '}
              {totalLifeSavedText && <><b>{totalLifeSavedText}</b></>}
            </span>
          ) : null}
          <span>已提取 <b>{values.length}</b> 个整数{isParsing ? '（解析中…）' : ''}{parseInfo.elapsedMs ? ` · ${parseInfo.elapsedMs}ms` : ''}</span>
        </div>
      </div>

      <div className="main">
        <section className="panel panelInput" aria-label="输入面板">
          <div className="panelHeader">
            <div className="panelTitle">输入（粘贴表格/CSV/任意文本）</div>
            <button type="button" className="btn btnDanger" onClick={onClearInput} disabled={!input}>
              清空
            </button>
          </div>
          <div className="panelBody">
            <input
              type="text"
              className="inputName"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="名称（可选，有输入时历史会使用此名称）"
              aria-label="本次输入的可选名称"
            />
            <textarea
              className="textarea"
              value={input}
              onChange={(e) => {
                const next = e.target.value
                setInput(next)
                startParse(next)
              }}
              placeholder="把 Excel/CSV/文本直接粘贴到这里：会自动提取所有整数（仅 0-9 序列，保留顺序、重复与前导零）"
              spellCheck={false}
            />
            {parseInfo.truncated ? (
              <div style={{ color: '#b45309', fontSize: 12 }}>
                输入过大：仅解析前 {parseInfo.processedChars.toLocaleString()} /{' '}
                {parseInfo.totalChars.toLocaleString()} 个字符（防止卡顿/崩溃）。
              </div>
            ) : null}
          </div>
        </section>

        <section className="panel panelOutput" aria-label="输出面板">
          <div className="panelHeader">
            <div className="panelTitle">输出</div>
            <button
              type="button"
              className="copyIconBtn"
              onClick={onCopy}
              disabled={!output}
              title="复制全部输出到剪贴板"
              aria-label="复制全部"
            >
              <CopyIcon />
            </button>
          </div>
          <div className="panelBody">
            <div className="outputContent">
            <div className="outputTabsRow">
              <ModeToggle value={mode} onChange={setMode} />
            </div>
            <div className="outputPreviewWrap">
              <textarea
                className="outputPreview"
                readOnly
                value={output}
                placeholder="输出会在这里实时生成。逗号模式：1,2,3,4；单引号模式：'1','2','3','4'。复制即得到完整字符串。"
                spellCheck={false}
                aria-label="输出预览"
              />
            </div>
            </div>
          </div>
        </section>

        <section className="panel panelHistory" aria-label="历史面板">
          <div className="panelBody">
            <HistoryList
              items={items}
              onRestore={(item) => {
                setMode(item.mode)
                setInput(item.output)
                startParse(item.output)
                show('已恢复到输入框')
              }}
              onRename={rename}
              onDelete={remove}
              onClear={() => {
                clear()
                show('历史已清空')
              }}
            />
          </div>
        </section>
      </div>

      <ToastHost toasts={toasts} />
    </div>
  )
}

export default App
