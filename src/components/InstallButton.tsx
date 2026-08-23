import { Download, RefreshCw, Check, Trash2 } from 'lucide-react'
import { useStore } from '../lib/store'
import type { App } from '../lib/types'

export function InstallButton({ app, size = 'md' }: { app: App; size?: 'sm' | 'md' | 'lg' }) {
  const { installs, install, update, uninstall } = useStore()
  const st = installs[app.id]
  const pad =
    size === 'lg'
      ? 'h-11 px-7 text-[15px] rounded-lg'
      : size === 'md'
        ? 'h-9 px-5 text-[13px] rounded-lg'
        : 'h-7 px-3 text-xs rounded-md'

  if (st && (st.status === 'installing' || st.status === 'updating')) {
    return (
      <button className={`${pad} relative min-w-[110px] overflow-hidden bg-canvas font-semibold text-ink ring-1 ring-inset ring-line`} disabled>
        <span
          className="absolute inset-y-0 left-0 bg-accent-blue/25 transition-all duration-200 ease-out"
          style={{ width: `${st.progress}%` }}
        />
        <span className="relative z-10 flex items-center justify-center gap-1.5">
          <RefreshCw size={12} className="animate-spin" aria-hidden />
          {st.status === 'updating' ? 'Updating' : `${Math.round(st.progress)}%`}
        </span>
      </button>
    )
  }

  if (st?.status === 'installed') {
    const needsUpdate = st.version !== app.version
    if (needsUpdate) {
      return (
        <div className="flex items-center gap-2">
          <button onClick={() => update(app.id, app.version)} className={`${pad} flex items-center gap-1.5 bg-accent-blue font-semibold text-white transition hover:opacity-90 active:scale-95`}>
            <Download size={14} />
            Update
          </button>
          <UninstallBtn onClick={() => uninstall(app.id)} />
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2">
        <button className={`${pad} cursor-default flex items-center gap-1.5 border border-accent-green/40 bg-accent-green/[0.07] font-semibold text-accent-green`}>
          <Check size={14} strokeWidth={2.75} aria-hidden />
          Installed
        </button>
        <UninstallBtn onClick={() => uninstall(app.id)} />
      </div>
    )
  }

  return (
    <button
      onClick={() => install(app.id, app.version)}
      className={`${pad} bg-ink font-semibold text-white transition duration-150 hover:bg-black active:scale-[0.97]`}
    >
      Get
    </button>
  )
}

function UninstallBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Uninstall"
      aria-label="Uninstall"
      className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-secondary transition hover:border-red-500/50 hover:text-red-600 active:scale-95"
    >
      <Trash2 size={14} aria-hidden />
    </button>
  )
}
