import { useMemo, useState } from 'react'
import type { HistoryItem } from '../history/types'
import { fuzzyMatch } from '../utils/fuzzyMatch'

function RestoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}

type Props = {
  items: HistoryItem[]
  onRestore: (item: HistoryItem) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onClear: () => void
}

export function HistoryList({ items, onRestore, onRename, onDelete, onClear }: Props) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items
    return items.filter(
      (x) => fuzzyMatch(searchQuery, x.name) || fuzzyMatch(searchQuery, x.output),
    )
  }, [items, searchQuery])

  return (
    <div className="history">
      <div className="sectionHeader">
        <div className="panelTitle">历史（最多 500 条）</div>
        <button
          type="button"
          className="btn btnDanger"
          onClick={onClear}
          disabled={items.length === 0}
          title="清空历史"
        >
          清空
        </button>
      </div>

      <input
        type="text"
        className="historySearch"
        placeholder="搜索历史（按名称或内容模糊匹配）"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="搜索历史"
      />

      <div className="historyList" role="list" aria-label="历史记录列表">
        {items.length === 0 ? (
          <div style={{ padding: 10, color: '#64748b', fontSize: 12 }}>
            还没有历史记录。复制或停止输入后会自动保存最近结果。
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: 10, color: '#64748b', fontSize: 12 }}>
            没有匹配「{searchQuery}」的历史记录。
          </div>
        ) : (
          filteredItems.map((x) => {
            const firstVal = x.output ? x.output.split(',')[0] : ''
            const preview = firstVal ? (x.output.includes(',') ? `${firstVal}…` : firstVal) : ''
            return (
              <div key={x.id} className="historyItem" role="listitem">
                <div style={{ minWidth: 0 }} className="historyItemContent">
                  <input
                    className="historyName"
                    value={x.name}
                    onChange={(e) => onRename(x.id, e.target.value)}
                    placeholder="可编辑名称"
                    aria-label="历史名称（可编辑）"
                  />
                  {preview && (
                    <div className="historyPreview">{preview}</div>
                  )}
                </div>
                <div className="historyItemActions">
                  <button
                    type="button"
                    className="historyIconBtn"
                    onClick={() => onRestore(x)}
                    title="恢复到输入框"
                    aria-label="恢复"
                  >
                    <RestoreIcon />
                  </button>
                  <button
                    type="button"
                    className="historyIconBtn historyIconBtnDanger"
                    onClick={() => onDelete(x.id)}
                    title="删除"
                    aria-label="删除"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

