import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getApp } from './data'

export type InstallStatus = 'not-installed' | 'installing' | 'updating' | 'installed'

export interface ActiveInstall {
  status: 'installing' | 'updating'
  progress: number
}

export interface CompletedInstall {
  status: 'installed'
  version: string
  at: number
}

export type InstallState = ActiveInstall | CompletedInstall

interface ToastAction {
  label: string
  run: () => void
}

export interface Toast {
  id: number
  title: string
  action?: ToastAction
}

interface StoreValue {
  installs: Record<string, InstallState>
  wishlist: string[]
  install: (id: string, version: string) => void
  update: (id: string, version: string) => void
  uninstall: (id: string) => void
  toggleWishlist: (id: string) => void
  isInstalled: (id: string) => boolean
  isWishlisted: (id: string) => boolean
  openDemo: (appId: string) => void
  closeDemo: () => void
  demoAppId: string | null
  toasts: Toast[]
  pushToast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: number) => void
}

const StoreContext = React.createContext<StoreValue | null>(null)

const LS_INSTALLS = 'forge.installs.v1'
const LS_WISHLIST = 'forge.wishlist.v1'

function isValidInstall(v: unknown): v is CompletedInstall {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false
  const c = v as Partial<CompletedInstall>
  return typeof c.version === 'string' && Number.isFinite(c.at) && (c.status === undefined || c.status === 'installed')
}

function loadInstalls(): Record<string, InstallState> {
  try {
    const raw = localStorage.getItem(LS_INSTALLS)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}
    const out: Record<string, InstallState> = {}
    for (const [id, v] of Object.entries(parsed)) {
      if (isValidInstall(v)) out[id] = { status: 'installed', version: v.version, at: v.at }
    }
    return out
  } catch {
    return {}
  }
}

function loadWishlist(): string[] {
  try {
    const raw = localStorage.getItem(LS_WISHLIST)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is string => typeof x === 'string').slice(0, 200)
  } catch {
    return []
  }
}

function label(id: string, verb: string, version: string): string {
  const app = getApp(id)
  return `${app ? app.name : id} ${version ? `v${version} ` : ''}${verb}`
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [installs, setInstalls] = useState<Record<string, InstallState>>(loadInstalls)
  const [wishlist, setWishlist] = useState<string[]>(loadWishlist)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [demoAppId, setDemoAppId] = useState<string | null>(null)

  const toastId = useRef(0)
  const timers = useRef<Record<string, { interval?: ReturnType<typeof setInterval>; completion?: ReturnType<typeof setTimeout> }>>({})
  const installsRef = useRef(installs)
  useEffect(() => {
    installsRef.current = installs
  }, [installs])

  useEffect(() => {
    const saved: Record<string, CompletedInstall> = {}
    for (const [id, st] of Object.entries(installs)) {
      if (st.status === 'installed') saved[id] = { status: 'installed', version: st.version, at: st.at }
    }
    try {
      localStorage.setItem(LS_INSTALLS, JSON.stringify(saved))
    } catch {
      /* storage unavailable */
    }
  }, [installs])

  useEffect(() => {
    try {
      localStorage.setItem(LS_WISHLIST, JSON.stringify(wishlist))
    } catch {
      /* storage unavailable */
    }
  }, [wishlist])

  useEffect(
    () => () => {
      for (const t of Object.values(timers.current)) {
        if (t.interval) clearInterval(t.interval)
        if (t.completion) clearTimeout(t.completion)
      }
    },
    [],
  )

  const pushToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = ++toastId.current
    setToasts((prev) => [...prev.slice(-3), { ...t, id }])
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const clearTimers = useCallback((id: string) => {
    const t = timers.current[id]
    if (t) {
      if (t.interval) clearInterval(t.interval)
      if (t.completion) clearTimeout(t.completion)
      delete timers.current[id]
    }
  }, [])

  const runProgress = useCallback(
    (id: string, version: string, kind: 'installing' | 'updating') => {
      clearTimers(id)
      setInstalls((prev) => ({ ...prev, [id]: { status: kind, progress: 0 } }))
      let progress = 0
      const interval = setInterval(() => {
        progress = Math.min(100, progress + 7 + Math.random() * 11)
        if (progress < 100) {
          setInstalls((prev) => {
            const cur = prev[id]
            if (!cur || cur.status === 'installed') return prev
            return { ...prev, [id]: { status: kind, progress } }
          })
          return
        }
        clearInterval(interval)
        const completion = setTimeout(() => {
          const cur = installsRef.current[id]
          if (!cur || cur.status === 'installed') return
          setInstalls((prev) => ({ ...prev, [id]: { status: 'installed', version, at: Date.now() } }))
          pushToast({ title: label(id, kind === 'updating' ? 'updated' : 'installed', version) })
        }, 260)
        timers.current[id] = { completion }
      }, 130)
      timers.current[id] = { interval }
    },
    [clearTimers, pushToast],
  )

  const install = useCallback((id: string, version: string) => runProgress(id, version, 'installing'), [runProgress])
  const update = useCallback((id: string, version: string) => runProgress(id, version, 'updating'), [runProgress])

  const uninstall = useCallback(
    (id: string) => {
      const snapshot = installsRef.current[id]
      clearTimers(id)
      setInstalls((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      const name = getApp(id)?.name ?? id
      pushToast({
        title: `${name} uninstalled`,
        action: snapshot
          ? { label: 'Undo', run: () => setInstalls((prev) => ({ ...prev, [id]: snapshot })) }
          : undefined,
      })
    },
    [clearTimers, pushToast],
  )

  const toggleWishlist = useCallback(
    (id: string) => {
      setWishlist((prev) => {
        const has = prev.includes(id)
        const name = getApp(id)?.name ?? id
        pushToast({ title: has ? `${name} removed from wishlist` : `${name} saved to wishlist` })
        return has ? prev.filter((x) => x !== id) : [...prev, id]
      })
    },
    [pushToast],
  )

  const openDemo = useCallback((appId: string) => setDemoAppId(appId), [])
  const closeDemo = useCallback(() => setDemoAppId(null), [])

  const value = useMemo<StoreValue>(
    () => ({
      installs,
      wishlist,
      install,
      update,
      uninstall,
      toggleWishlist,
      isInstalled: (id) => installs[id]?.status === 'installed',
      isWishlisted: (id) => wishlist.includes(id),
      openDemo,
      closeDemo,
      demoAppId,
      toasts,
      pushToast,
      dismissToast,
    }),
    [installs, wishlist, install, update, uninstall, toggleWishlist, openDemo, closeDemo, demoAppId, toasts, pushToast, dismissToast],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore outside provider')
  return ctx
}
