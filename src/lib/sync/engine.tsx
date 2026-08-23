import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { APPS, getApp } from '../data'
import { DEMOS } from '../demos'
import { ATTESTATIONS } from '../../generated/attestations'
import type { DemoId } from '../types'
import { useStore } from '../store'
import { idbDel, idbGet, idbPut } from './idb'
import { fsaSupported, permissionFor, pickDirectory, scanDirectory, sha256Text, writeFiles } from './fsa'
import type { FsDirHandleLike } from './fsa'
import { diffAgainstSnapshot, withPackageDelta } from './diff'
import { ghPushFiles, ghVerify } from './github'
import type { ActivityEvent, DiffResult, GithubConfig, MappingState, PackageFile, Snapshot, SyncMapping, SyncScope } from './types'

const LS_MAPPINGS = 'forge.sync.mappings.v1'
const LS_SETTINGS = 'forge.sync.settings.v1'
const LS_GITHUB = 'forge.sync.github.v1'
const LS_ACTIVITY = 'forge.sync.activity.v1'
const baselineKey = (id: string) => `forge.sync.baseline.${id}`

function uid(): string {
  return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(fallback)) return (Array.isArray(parsed) ? parsed : fallback) as T
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return { ...(fallback as object), ...(parsed as object) } as T
    }
    return fallback
  } catch {
    return fallback
  }
}

export function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function scopeLabel(scope: SyncScope): string {
  if (scope.kind === 'app') return getApp(scope.appId)?.name ?? scope.appId
  if (scope.kind === 'category') return scope.category
  return 'Entire library'
}

export function scopeApps(scope: SyncScope): string[] {
  if (scope.kind === 'app') return [scope.appId]
  if (scope.kind === 'category') {
    return APPS.filter((a) => a.category === scope.category).map((a) => a.id)
  }
  const installed = Object.keys(loadInstalls())
  return installed.length > 0 ? installed : []
}

interface InstallRecord {
  status?: string
  version?: string
  at?: number
}

function loadInstalls(): Record<string, InstallRecord> {
  try {
    const raw = localStorage.getItem('forge.installs.v1')
    return raw ? (JSON.parse(raw) as Record<string, InstallRecord>) : {}
  } catch {
    return {}
  }
}

export async function buildPackages(scope: SyncScope): Promise<PackageFile[]> {
  const out: PackageFile[] = []
  const ids = scopeApps(scope)
  for (const id of ids) {
    const app = getApp(id)
    if (!app) continue
    const base = scope.kind === 'app' ? '' : `${slug(app.id)}/`
    const att = app.demoId ? ATTESTATIONS[app.demoId as DemoId] : undefined
    const manifest = {
      format: 'forge-package@1',
      id: app.id,
      name: app.name,
      version: app.version,
      category: app.category,
      developer: app.developer,
      tagline: app.tagline,
      features: app.features,
      demo: Boolean(app.demoId),
      provenance: att ? { sha256: att.sha256, fingerprint: att.fingerprint } : null,
    }
    out.push({ path: `${base}forge.json`, text: JSON.stringify(manifest, null, 2) })
    if (app.demoId) {
      try {
        out.push({ path: `${base}index.html`, text: await DEMOS[app.demoId as DemoId]() })
      } catch {
        /* artifact unavailable â€” manifest still exports */
      }
    }
  }
  return out
}

async function packageHashes(files: PackageFile[]): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  for (const f of files) map.set(f.path, await sha256Text(f.text))
  return map
}

function loadMappings(): SyncMapping[] {
  try {
    const raw = localStorage.getItem(LS_MAPPINGS)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (m): m is SyncMapping =>
        typeof (m as SyncMapping).id === 'string' &&
        typeof (m as SyncMapping).label === 'string' &&
        (m as SyncMapping).scope != null,
    )
  } catch {
    return []
  }
}

interface SyncSettings {
  autoScan: boolean
}

interface SyncContextValue {
  supported: boolean
  mappings: SyncMapping[]
  states: Record<string, MappingState>
  busy: Record<string, boolean>
  settings: SyncSettings
  activity: ActivityEvent[]
  setAutoScan: (v: boolean) => void
  addFolderMapping: (scope: SyncScope) => Promise<boolean>
  reconnect: (id: string) => Promise<void>
  rescan: (id: string) => Promise<void>
  exportNow: (id: string) => Promise<void>
  markSynced: (id: string) => Promise<void>
  forget: (id: string) => void
  github: GithubConfig | null
  saveGithub: (cfg: GithubConfig) => void
  clearGithub: () => void
  testGithub: () => Promise<{ ok: boolean; message: string }>
  pushGithub: () => Promise<{ ok: boolean; message: string }>
  githubBusy: boolean
}

const SyncContext = createContext<SyncContextValue | null>(null)

export function SyncProvider({ children }: { children: ReactNode }) {
  const { pushToast } = useStore()
  const navigate = useNavigate()
  const [supported] = useState(fsaSupported)
  const [mappings, setMappings] = useState<SyncMapping[]>(loadMappings)
  const [states, setStates] = useState<Record<string, MappingState>>({})
  const [busy, setBusy] = useState<Record<string, boolean>>({})
  const [settings, setSettings] = useState<SyncSettings>(() => readJson<SyncSettings>(LS_SETTINGS, { autoScan: true }))
  const [activity, setActivity] = useState<ActivityEvent[]>(() => readJson<ActivityEvent[]>(LS_ACTIVITY, []))
  const [github, setGithub] = useState<GithubConfig | null>(() => {
    const cfg = readJson<GithubConfig | null>(LS_GITHUB, null)
    return cfg && cfg.owner && cfg.token ? cfg : null
  })
  const [githubBusy, setGithubBusy] = useState(false)
  const launched = useRef(false)

  const patchState = useCallback((id: string, patch: Partial<MappingState>) => {
    setStates((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }, [])

  const setBusyFlag = useCallback((key: string, on: boolean) => {
    setBusy((prev) => {
      const next = { ...prev }
      if (on) next[key] = true
      else delete next[key]
      return next
    })
  }, [])

  const logActivity = useCallback((kind: ActivityEvent['kind'], message: string) => {
    setActivity((prev) => [{ at: Date.now(), kind, message }, ...prev].slice(0, 50))
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(LS_MAPPINGS, JSON.stringify(mappings))
    } catch { /* storage unavailable */ }
  }, [mappings])

  useEffect(() => {
    try {
      localStorage.setItem(LS_SETTINGS, JSON.stringify(settings))
    } catch { /* storage unavailable */ }
  }, [settings])

  useEffect(() => {
    try {
      localStorage.setItem(LS_ACTIVITY, JSON.stringify(activity.slice(0, 50)))
    } catch { /* storage unavailable */ }
  }, [activity])

  const persistMappings = useCallback((next: SyncMapping[]) => setMappings(next), [])

  const scanMapping = useCallback(
    async (mapping: SyncMapping, handle: FsDirHandleLike, saveBaseline: boolean): Promise<DiffResult | null> => {
      patchState(mapping.id, { status: 'scanning', error: undefined })
      try {
        const outcome = await scanDirectory(handle)
        const baselineRaw = localStorage.getItem(baselineKey(mapping.id))
        const baseline: Snapshot | null = baselineRaw ? (JSON.parse(baselineRaw) as Snapshot) : null
        let diff = diffAgainstSnapshot(baseline, outcome.files)
        const packages = await buildPackages(mapping.scope)
        if (packages.length > 0) {
          const hashes = await packageHashes(packages)
          diff = withPackageDelta(diff, baseline, packages, hashes, outcome.files)
        }
        patchState(mapping.id, {
          status: 'ready',
          fileCount: Object.keys(outcome.files).length,
          diff,
        })
        if (saveBaseline) {
          const snap: Snapshot = { at: Date.now(), files: outcome.files }
          try {
            localStorage.setItem(baselineKey(mapping.id), JSON.stringify(snap))
          } catch { /* quota â€” baseline not saved */ }
        }
        return diff
      } catch (e) {
        patchState(mapping.id, { status: 'error', error: e instanceof Error ? e.message : 'Scan failed' })
        return null
      }
    },
    [patchState],
  )

  const ensurePermission = useCallback(async (mapping: SyncMapping, handle: FsDirHandleLike, request: boolean) => {
    const perm = await permissionFor(handle, request)
    patchState(mapping.id, { status: perm === 'granted' ? 'ready' : 'needs-permission' })
    return perm === 'granted'
  }, [patchState])

  const checkOnLaunch = useCallback(async () => {
    if (launched.current) return
    launched.current = true
    const folders = mappings.filter((m) => m.target === 'folder')
    if (folders.length === 0) return
    let needsPermission = 0
    let changed = 0
    for (const mapping of folders) {
      const handle = await idbGet<FsDirHandleLike>(mapping.id)
      if (!handle) {
        patchState(mapping.id, { status: 'unlinked' })
        continue
      }
      const granted = await ensurePermission(mapping, handle, false)
      if (!granted) {
        needsPermission++
        continue
      }
      if (settings.autoScan) {
        const diff = await scanMapping(mapping, handle, false)
        if (diff && (diff.added.length || diff.modified.length || diff.deleted.length)) changed++
      }
    }
    if (needsPermission > 0) {
      pushToast({
        title: `Folder sync paused â€” ${needsPermission} folder${needsPermission === 1 ? '' : 's'} need reconnection`,
        action: { label: 'Review', run: () => { navigate('/sync') } },
      })
    } else if (changed > 0) {
      pushToast({
        title: `Changes detected in ${changed} synced folder${changed === 1 ? '' : 's'}`,
        action: { label: 'View', run: () => { navigate('/sync') } },
      })
    }
  }, [mappings, settings.autoScan, ensurePermission, scanMapping, patchState, pushToast, navigate])

  useEffect(() => {
    const t = setTimeout(() => { void checkOnLaunch() }, 900)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addFolderMapping = useCallback(
    async (scope: SyncScope) => {
      if (!supported) {
        pushToast({ title: 'Folder sync needs Chrome or Edge' })
        return false
      }
      const handle = await pickDirectory('forge-sync')
      if (!handle) return false
      const mapping: SyncMapping = {
        id: uid(),
        label: handle.name,
        scope,
        target: 'folder',
        folderName: handle.name,
        createdAt: Date.now(),
      }
      await idbPut(mapping.id, handle)
      persistMappings([mapping, ...mappings])
      logActivity('info', `Linked folder â€œ${handle.name}â€ to ${scopeLabel(scope)}`)
      await scanMapping(mapping, handle, false)
      return true
    },
    [supported, mappings, persistMappings, scanMapping, pushToast, logActivity],
  )

  const reconnect = useCallback(
    async (id: string) => {
      const mapping = mappings.find((m) => m.id === id)
      if (!mapping) return
      const handle = await idbGet<FsDirHandleLike>(id)
      if (!handle) {
        patchState(id, { status: 'unlinked' })
        return
      }
      const granted = await ensurePermission(mapping, handle, true)
      if (granted) await scanMapping(mapping, handle, false)
    },
    [mappings, ensurePermission, scanMapping, patchState],
  )

  const rescan = useCallback(
    async (id: string) => {
      const mapping = mappings.find((m) => m.id === id)
      if (!mapping) return
      setBusyFlag(`scan-${id}`, true)
      try {
        const handle = await idbGet<FsDirHandleLike>(id)
        if (!handle) {
          patchState(id, { status: 'unlinked' })
          return
        }
        if (!(await ensurePermission(mapping, handle, false))) return
        await scanMapping(mapping, handle, false)
      } finally {
        setBusyFlag(`scan-${id}`, false)
      }
    },
    [mappings, ensurePermission, scanMapping, patchState, setBusyFlag],
  )

  const exportNow = useCallback(
    async (id: string) => {
      const mapping = mappings.find((m) => m.id === id)
      if (!mapping) return
      setBusyFlag(`export-${id}`, true)
      patchState(id, { status: 'working', error: undefined })
      try {
        const handle = await idbGet<FsDirHandleLike>(id)
        if (!handle) {
          patchState(id, { status: 'unlinked' })
          return
        }
        if (!(await ensurePermission(mapping, handle, true))) return
        const packages = await buildPackages(mapping.scope)
        if (packages.length === 0) {
          patchState(id, { status: 'error', error: 'Nothing to export yet â€” install apps into this scope first.' })
          return
        }
        await writeFiles(handle, packages)
        await scanMapping(mapping, handle, true)
        persistMappings(mappings.map((m) => (m.id === id ? { ...m, lastSyncAt: Date.now() } : m)))
        logActivity('sync', `Exported ${packages.length} files to â€œ${mapping.label}â€`)
        pushToast({ title: `Synced ${scopeLabel(mapping.scope)} â†’ ${mapping.folderName}` })
      } catch (e) {
        patchState(id, { status: 'error', error: e instanceof Error ? e.message : 'Export failed' })
        logActivity('error', `Export failed for â€œ${mapping.label}â€`)
      } finally {
        setBusyFlag(`export-${id}`, false)
      }
    },
    [mappings, ensurePermission, scanMapping, persistMappings, logActivity, pushToast, patchState, setBusyFlag],
  )

  const markSynced = useCallback(
    async (id: string) => {
      const mapping = mappings.find((m) => m.id === id)
      if (!mapping) return
      setBusyFlag(`mark-${id}`, true)
      try {
        const handle = await idbGet<FsDirHandleLike>(id)
        if (!handle) return
        if (!(await ensurePermission(mapping, handle, true))) return
        await scanMapping(mapping, handle, true)
        persistMappings(mappings.map((m) => (m.id === id ? { ...m, lastSyncAt: Date.now() } : m)))
        logActivity('info', `Marked â€œ${mapping.label}â€ as up to date`)
      } finally {
        setBusyFlag(`mark-${id}`, false)
      }
    },
    [mappings, ensurePermission, scanMapping, persistMappings, logActivity, setBusyFlag],
  )

  const forget = useCallback(
    (id: string) => {
      const mapping = mappings.find((m) => m.id === id)
      persistMappings(mappings.filter((m) => m.id !== id))
      void idbDel(id)
      try {
        localStorage.removeItem(baselineKey(id))
      } catch { /* ignore */ }
      setStates((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      if (mapping) logActivity('info', `Unlinked â€œ${mapping.label}â€`)
    },
    [mappings, persistMappings, logActivity],
  )

  const saveGithub = useCallback((cfg: GithubConfig) => {
    setGithub(cfg)
    try {
      localStorage.setItem(LS_GITHUB, JSON.stringify(cfg))
    } catch { /* storage unavailable */ }
  }, [])

  const clearGithub = useCallback(() => {
    setGithub(null)
    try {
      localStorage.removeItem(LS_GITHUB)
    } catch { /* ignore */ }
  }, [])

  const testGithub = useCallback(async (): Promise<{ ok: boolean; message: string }> => {
    if (!github) return { ok: false, message: 'No configuration saved' }
    return ghVerify(github)
  }, [github])

  const pushGithub = useCallback(async (): Promise<{ ok: boolean; message: string }> => {
    if (!github) return { ok: false, message: 'Connect a repository first' }
    setGithubBusy(true)
    try {
      const scope: SyncScope = { kind: 'library' }
      const packages = await buildPackages(scope)
      if (packages.length === 0) return { ok: false, message: 'Install a few apps first â€” nothing to publish yet' }
      const dir = github.dir ? `${github.dir.replace(/\/+$/, '')}/` : ''
      const payload = packages.map((f) => ({ path: `${dir}${f.path}`, text: f.text }))
      const sha = await ghPushFiles(github, payload, `Forge sync: ${payload.length} files (${new Date().toISOString().slice(0, 16).replace('T', ' ')})`)
      logActivity('sync', `Pushed ${payload.length} files to github.com/${github.owner}/${github.repo}`)
      pushToast({ title: `Pushed to GitHub Â· commit ${sha.slice(0, 7)}` })
      return { ok: true, message: `Commit ${sha.slice(0, 7)} pushed` }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Push failed'
      logActivity('error', `GitHub push failed: ${message}`)
      return { ok: false, message }
    } finally {
      setGithubBusy(false)
    }
  }, [github, logActivity, pushToast])

  const value = useMemo<SyncContextValue>(
    () => ({
      supported,
      mappings,
      states,
      busy,
      settings,
      activity,
      setAutoScan: (v: boolean) => setSettings((s) => ({ ...s, autoScan: v })),
      addFolderMapping,
      reconnect,
      rescan,
      exportNow,
      markSynced,
      forget,
      github,
      saveGithub,
      clearGithub,
      testGithub,
      pushGithub,
      githubBusy,
    }),
    [supported, mappings, states, busy, settings, activity, addFolderMapping, reconnect, rescan, exportNow, markSynced, forget, github, saveGithub, clearGithub, testGithub, pushGithub, githubBusy],
  )

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>
}

export function useSync(): SyncContextValue {
  const ctx = useContext(SyncContext)
  if (!ctx) throw new Error('useSync outside SyncProvider')
  return ctx
}

export type { SyncMapping, SyncScope, MappingState, DiffResult, ActivityEvent, GithubConfig }
