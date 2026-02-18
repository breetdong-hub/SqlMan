export type OutputMode = 'comma' | 'comma_single_quotes'

export function formatOutput(values: readonly string[], mode: OutputMode): string {
  if (values.length === 0) return ''

  switch (mode) {
    case 'comma':
      return values.join(',')
    case 'comma_single_quotes':
      // values 只包含数字字符，不需要额外转义
      return values.map((v) => `'${v}'`).join(',')
    default: {
      const _exhaustive: never = mode
      return _exhaustive
    }
  }
}

export function getModeLabel(mode: OutputMode): string {
  switch (mode) {
    case 'comma':
      return '逗号分隔'
    case 'comma_single_quotes':
      return "逗号 + 单引号"
    default: {
      const _exhaustive: never = mode
      return _exhaustive
    }
  }
}

/** 将逗号分隔的 output 转成竖排展示（保留格式：逗号模式无引号，单引号模式带引号） */
export function outputToVerticalDisplay(output: string, _mode: OutputMode): string {
  if (!output) return ''
  return output.split(',').join('\n')
}

