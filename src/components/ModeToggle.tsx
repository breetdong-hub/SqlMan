import type { OutputMode } from '../utils/format'
import { getModeLabel } from '../utils/format'

type Props = {
  value: OutputMode
  onChange: (mode: OutputMode) => void
}

export function ModeToggle({ value, onChange }: Props) {
  return (
    <div className="outputModeRow" aria-label="输出模式">
      <div className="segmented" role="tablist" aria-label="输出模式切换">
        <button
          type="button"
          className={`segBtn ${value === 'comma' ? 'segBtnActive' : ''}`}
          role="tab"
          aria-selected={value === 'comma'}
          onClick={() => onChange('comma')}
          title={getModeLabel('comma')}
        >
          逗号
        </button>
        <button
          type="button"
          className={`segBtn ${value === 'comma_single_quotes' ? 'segBtnActive' : ''}`}
          role="tab"
          aria-selected={value === 'comma_single_quotes'}
          onClick={() => onChange('comma_single_quotes')}
          title={getModeLabel('comma_single_quotes')}
        >
          单引号
        </button>
      </div>
      <span style={{ color: '#64748b', fontSize: 12 }}>实时更新</span>
    </div>
  )
}

