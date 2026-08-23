import { useStore } from '../lib/store'
import { CheckCircle2, X } from 'lucide-react'

export function Toasts() {
  const { toasts, dismissToast } = useStore()
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-1/2 z-[90] flex -translate-x-1/2 flex-col items-center gap-2 md:bottom-6 md:left-auto md:right-6 md:translate-x-0 md:items-end"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex animate-toast-in items-center gap-2.5 rounded-xl border border-line bg-surface py-2 pl-3.5 pr-2 shadow-[0_12px_32px_-16px_rgba(20,20,20,0.3)]"
        >
          <CheckCircle2 size={15} className="shrink-0 text-accent-green" aria-hidden />
          <span className="whitespace-nowrap text-sm font-medium text-ink">{t.title}</span>
          {t.action && (
            <button
              onClick={t.action.run}
              className="rounded-lg bg-ink px-3 py-1 text-xs font-bold text-white transition hover:bg-black active:scale-95"
            >
              {t.action.label}
            </button>
          )}
          <button
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss notification"
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-ink-subtle transition hover:text-ink"
          >
            <X size={12} aria-hidden />
          </button>
        </div>
      ))}
    </div>
  )
}
