import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { X, ShieldCheck, Loader2 } from 'lucide-react'
import { useStore } from '../lib/store'
import { APPS, getApp } from '../lib/data'

function resolveDemoRef(raw: string | null): string | null {
  if (!raw) return null
  const direct = getApp(raw)
  if (direct && direct.id === raw) return direct.demoId ? raw : null
  const byDemo = APPS.find((a) => a.demoId === raw)
  return byDemo ? byDemo.id : null
}

export function DemoModal() {
  const { demoAppId, openDemo, closeDemo } = useStore()
  const app = demoAppId ? getApp(demoAppId) : undefined
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)
  const lastDismissed = useRef<string | null>(null)
  const [params, setParams] = useSearchParams()
  const [frameLoaded, setFrameLoaded] = useState(false)

  function removeParam() {
    if (!params.get('demo')) return
    const next = new URLSearchParams(params)
    next.delete('demo')
    setParams(next, { replace: true })
  }

  useEffect(() => {
    const linked = params.get('demo')
    if (demoAppId) {
      lastDismissed.current = null
      if (linked !== demoAppId) {
        const next = new URLSearchParams(params)
        next.set('demo', demoAppId)
        setParams(next, { replace: true })
      }
      return
    }
    if (!linked || linked === lastDismissed.current) return
    const resolved = resolveDemoRef(linked)
    if (resolved) {
      openDemo(resolved)
    } else {
      lastDismissed.current = linked
      removeParam()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoAppId, params])

  useEffect(() => {
    setFrameLoaded(false)
  }, [demoAppId])

  useEffect(() => {
    if (!app) return
    restoreRef.current = document.activeElement as HTMLElement | null
    closeBtnRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && handleClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      restoreRef.current?.focus?.()
      restoreRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app?.id])

  function handleClose() {
    if (demoAppId) lastDismissed.current = demoAppId
    removeParam()
    closeDemo()
  }

  if (!app) return null

  return (
    <div className="fixed inset-0 z-[80] flex animate-fade flex-col bg-ink/55 backdrop-blur-[3px]" onClick={handleClose} role="dialog" aria-modal="true" aria-label={`${app.name} live demo`}>
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6" onClick={(e) => e.stopPropagation()}>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">{app.name} — live demo</p>
          <p className="flex items-center gap-1.5 text-[11px] text-white/70">
            <ShieldCheck size={11} className="text-accent-green" aria-hidden />
            sandboxed · fully client-side · nothing leaves your machine
          </p>
        </div>
        <button
          ref={closeBtnRef}
          onClick={handleClose}
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 text-white transition hover:bg-white/10 active:scale-95"
          aria-label="Close demo"
        >
          <X size={17} aria-hidden />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 justify-center px-3 pb-4 sm:px-8 sm:pb-6" onClick={(e) => e.stopPropagation()}>
        <div className="relative w-full max-w-5xl animate-pop overflow-hidden rounded-xl border border-line bg-surface shadow-[0_30px_80px_-24px_rgba(20,20,20,0.5)]">
          {!frameLoaded && (
            <span className="pointer-events-none absolute inset-0 z-10 grid place-items-center text-ink-subtle">
              <Loader2 size={22} className="animate-spin" aria-hidden />
            </span>
          )}
          <iframe
            title={`${app.name} demo`}
            src={`/demos/${app.demoId}.html`}
            onLoad={() => setFrameLoaded(true)}
            className="relative h-full w-full bg-white"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  )
}
