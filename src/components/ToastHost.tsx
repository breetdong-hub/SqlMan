import type { Toast } from '../hooks/useToast'

type Props = {
  toasts: Toast[]
}

export function ToastHost({ toasts }: Props) {
  if (toasts.length === 0) return null
  return (
    <div className="toastWrap" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.message}
        </div>
      ))}
    </div>
  )
}

