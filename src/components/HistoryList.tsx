import { useMemo, useState } from 'react'
import type { HistoryItem } from '../history/types'
import { formatDateTime } from '../utils/time'
import { fuzzyMatch } from '../utils/fuzzyMatch'
import { outputToVerticalDisplay } from '../utils/format'
import { computeLifeSavedMinutes } from '../utils/lifeSaved'

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
        <div className="panelTitle">历史（最多 50 条）</div>
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
          filteredItems.map((x) => (
            <div key={x.id} className="historyItem" role="listitem">
              <div style={{ minWidth: 0 }}>
                <input
                  className="historyName"
                  value={x.name}
                  onChange={(e) => onRename(x.id, e.target.value)}
                  placeholder="可编辑名称"
                  aria-label="历史名称（可编辑）"
                />
                <div className="historyMeta">
                  {formatDateTime(x.createdAt)} · {x.count} 个整数
                  {(x.lifeSavedMinutes ?? computeLifeSavedMinutes(x.count)) > 0 && (
                    <> · 节省 {(x.lifeSavedMinutes ?? computeLifeSavedMinutes(x.count))} 分钟</>
                  )}
                </div>
                <div className="historyValue">{outputToVerticalDisplay(x.output, x.mode)}</div>
              </div>

              <div className="row" style={{ alignItems: 'flex-start' }}>
                <button type="button" className="btn" onClick={() => onRestore(x)} title="恢复到输入框">
                  恢复
                </button>
                <button type="button" className="btn btnDanger" onClick={() => onDelete(x.id)} title="删除">
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

