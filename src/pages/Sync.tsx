import { useMemo, useState } from 'react'
import {
  FolderSync, RefreshCcw, UploadCloud, CheckCheck, Trash2, PlugZap,
  ShieldAlert, Plus, CircleAlert, CircleCheck, Clock3, Loader2,
} from 'lucide-react'

function GithubMark({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}
import { useSync, scopeLabel } from '../lib/sync/engine'
import type { SyncScope } from '../lib/sync/engine'
import { APPS } from '../lib/data'
import { CATEGORIES } from '../lib/types'
import { Link2 } from 'lucide-react'
import { useSeo } from '../lib/seo'

function fmtTime(at?: number): string {
  if (!at) return 'Never'
  return new Date(at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const STATUS_META = {
  unlinked: { label: 'Folder missing', cls: 'border-line bg-canvas text-ink-secondary' },
  'needs-permission': { label: 'Needs access', cls: 'border-[#F97316]/40 bg-[#F97316]/[0.07] text-[#B45309]' },
  scanning: { label: 'Scanning', cls: 'border-accent-blue/30 bg-accent-blue/[0.06] text-accent-blue' },
  working: { label: 'Working', cls: 'border-accent-blue/30 bg-accent-blue/[0.06] text-accent-blue' },
  error: { label: 'Error', cls: 'border-red-500/30 bg-red-500/[0.05] text-red-600' },
} as const

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status as keyof typeof STATUS_META]
  if (!meta) return null
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.cls}`}>
      {(status === 'scanning' || status === 'working') && (
        <Loader2 size={10} className="animate-spin" aria-hidden />
      )}
      {meta.label}
    </span>
  )
}

export function SyncPage() {
  const sync = useSync()
  useSeo({
    title: 'Folder sync',
    description:
      'Sync Forge packages to folders on your machine or mirror them to your own GitHub repository. Forge stores only manifests — your files live where you put them.',
    path: '/sync',
  })
  const [scopeKind, setScopeKind] = useState<'library' | 'category' | 'app'>('library')
  const [scopeValue, setScopeValue] = useState('')
  const [ghForm, setGhForm] = useState({
    owner: sync.github?.owner ?? '',
    repo: sync.github?.repo ?? '',
    branch: sync.github?.branch ?? 'main',
    dir: sync.github?.dir ?? 'forge',
    token: sync.github?.token ?? '',
  })
  const [ghStatus, setGhStatus] = useState<{ ok: boolean; message: string } | null>(null)

  const activeCount = useMemo(() => Object.values(sync.states).filter((s) => s.status === 'ready').length, [sync.states])
  const attentionCount = useMemo(
    () => Object.values(sync.states).filter((s) => s.status === 'needs-permission').length,
    [sync.states],
  )

  const addMapping = async () => {
    const scope: SyncScope =
      scopeKind === 'library'
        ? { kind: 'library' }
        : scopeKind === 'category'
          ? { kind: 'category', category: scopeValue || CATEGORIES[0] }
          : { kind: 'app', appId: scopeValue }
    await sync.addFolderMapping(scope)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="animate-rise">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-line-soft bg-surface px-3 py-1 text-[10.5px] font-bold tracking-[0.18em] text-ink-secondary">
          <FolderSync size={12} className="text-accent-green" /> LOCAL &amp; CLOUD SYNC Â· BETA
        </p>
        <h1 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">Keep packages in sync with your own machine.</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-secondary">
          Point any package at a folder on disk or mirror it to your own GitHub repository. Forge stores
          only lightweight manifests â€” your files live where you put them. Every launch re-checks
          permissions and diffs your folders against the catalog.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-xs text-ink-subtle">
          <span>{activeCount} folder{activeCount === 1 ? '' : 's'} connected</span>
          {attentionCount > 0 && <span className="font-semibold text-[#B45309]">{attentionCount} awaiting access</span>}
          <span>{sync.mappings.length} mapping{sync.mappings.length === 1 ? '' : 's'} total</span>
        </div>
      </header>

      {!sync.supported && (
        <div className="animate-rise mt-6 flex items-start gap-3 rounded-xl border border-[#F97316]/35 bg-[#F97316]/[0.06] p-4">
          <ShieldAlert size={17} className="mt-0.5 shrink-0 text-[#C2410C]" />
          <div className="text-[13px] leading-relaxed text-ink">
            <b>Folder sync is unavailable in this browser.</b> It uses the File System Access API, currently
            supported in Chrome, Edge and other Chromium browsers. You can still configure the GitHub
            mirror below â€” it works everywhere.
          </div>
        </div>
      )}

      <section className="animate-rise mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line-soft bg-surface px-4 py-3">
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={sync.settings.autoScan}
            onChange={(e) => sync.setAutoScan(e.target.checked)}
            className="h-4 w-4 rounded border-line accent-[#141414]"
          />
          <span className="font-medium">Scan folders automatically on launch</span>
        </label>
        <p className="font-mono text-[11px] text-ink-subtle">permission prompts never fire without a click</p>
      </section>

      <section className="animate-rise mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Folders</h2>
            <p className="mt-0.5 text-sm text-ink-secondary">One folder per mapping. Exports write clean subfolders â€” nothing else is touched.</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {sync.mappings.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-12 text-center">
              <FolderSync size={28} className="mx-auto text-ink-subtle" aria-hidden />
              <p className="mt-3 font-semibold">No folders linked yet</p>
              <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-ink-secondary">
                Pick a destination below â€” for example â€œD:\forge\agentsâ€ for Agents &amp; Automation.
                Forge will offer to export packages there and watch for local edits on every visit.
              </p>
            </div>
          )}

          {sync.mappings.map((m) => {
            const st = sync.states[m.id]
            const diff = st?.diff
            const hasChanges =
              diff && (diff.added.length > 0 || diff.modified.length > 0 || diff.deleted.length > 0 || diff.pendingExport.length > 0)
            return (
              <article key={m.id} className="card-hover rounded-2xl border border-line-soft bg-surface p-5 hover:border-line">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line-soft bg-canvas text-ink">
                    <FolderSync size={17} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold">{m.folderName ?? m.label}</p>
                    <p className="truncate font-mono text-[11px] text-ink-subtle">
                      {scopeLabel(m.scope)} Â· {st?.fileCount ?? 'â€”'} files tracked Â· last sync {fmtTime(m.lastSyncAt)}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <StatusBadge status={st?.status ?? 'ready'} />
                  </div>
                </div>

                {st?.status === 'error' && (
                  <p className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/25 bg-red-500/[0.04] px-3 py-2 text-[12px] text-red-700">
                    <CircleAlert size={13} className="mt-0.5 shrink-0" /> {st.error}
                  </p>
                )}

                {diff && hasChanges && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-line-soft bg-canvas">
                    <div className="grid grid-cols-2 divide-line-soft border-b border-line-soft text-center sm:grid-cols-4 sm:divide-x">
                      <DiffCell n={diff.added.length} label="added on disk" tone="text-accent-green" />
                      <DiffCell n={diff.modified.length} label="modified locally" tone="text-accent-blue" />
                      <DiffCell n={diff.deleted.length} label="deleted locally" tone="text-red-600" />
                      <DiffCell n={diff.pendingExport.length} label="to export" tone="text-[#B45309]" />
                    </div>
                    <ul className="max-h-36 space-y-0.5 overflow-y-auto px-4 py-2.5 font-mono text-[11px] leading-relaxed text-ink-secondary">
                      {diff.added.slice(0, 6).map((p) => (
                        <li key={`a-${p}`}><span className="text-accent-green">+</span> {p}</li>
                      ))}
                      {diff.modified.slice(0, 6).map((p) => (
                        <li key={`m-${p}`}><span className="text-accent-blue">~</span> {p}</li>
                      ))}
                      {diff.deleted.slice(0, 6).map((p) => (
                        <li key={`d-${p}`}><span className="text-red-600">&minus;</span> {p}</li>
                      ))}
                      {diff.conflicts.slice(0, 3).map((p) => (
                        <li key={`c-${p}`} className="text-[#B45309]"><span>!</span> conflict: {p} changed here and in catalog</li>
                      ))}
                      {hasTotal(diff) > 21 && <li className="text-ink-subtle">â€¦and more</li>}
                    </ul>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => void sync.exportNow(m.id)}
                    disabled={!!sync.busy[`export-${m.id}`]}
                    className="flex h-9 items-center gap-1.5 rounded-lg bg-ink px-4 text-[13px] font-semibold text-white transition hover:bg-black disabled:opacity-50"
                  >
                    <UploadCloud size={14} /> Export now
                  </button>
                  <button
                    onClick={() => void sync.rescan(m.id)}
                    disabled={!!sync.busy[`scan-${m.id}`]}
                    className="flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 text-[13px] font-semibold text-ink transition hover:border-ink disabled:opacity-50"
                  >
                    <RefreshCcw size={13} /> Diff check
                  </button>
                  {diff && hasChanges && diff.pendingExport.length === 0 && (
                    <button
                      onClick={() => void sync.markSynced(m.id)}
                      className="flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 text-[13px] font-semibold text-ink transition hover:border-ink"
                    >
                      <CheckCheck size={13} /> Keep local version
                    </button>
                  )}
                  <button
                    onClick={() => sync.forget(m.id)}
                    className="ml-auto grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-secondary transition hover:border-red-500/50 hover:text-red-600"
                    title="Unlink folder"
                    aria-label={`Unlink ${m.label}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>

        {sync.supported && (
          <div className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-dashed border-line bg-transparent p-4">
            <div>
              <label htmlFor="sync-scope-kind" className="mb-1 block text-[11px] font-semibold tracking-wider text-ink-subtle">WHAT TO SYNC</label>
              <select
                id="sync-scope-kind"
                value={scopeKind}
                onChange={(e) => { setScopeKind(e.target.value as typeof scopeKind); setScopeValue('') }}
                className="h-9 cursor-pointer rounded-lg border border-line bg-surface px-2.5 text-[13px] font-medium outline-none focus:border-ink"
              >
                <option value="library">Entire library</option>
                <option value="category">A category</option>
                <option value="app">A single app</option>
              </select>
            </div>
            {scopeKind !== 'library' && (
              <div>
                <label htmlFor="sync-scope-value" className="mb-1 block text-[11px] font-semibold tracking-wider text-ink-subtle">TARGET</label>
                <select
                  id="sync-scope-value"
                  value={scopeValue}
                  onChange={(e) => setScopeValue(e.target.value)}
                  className="h-9 max-w-56 cursor-pointer rounded-lg border border-line bg-surface px-2.5 text-[13px] font-medium outline-none focus:border-ink"
                >
                  <option value="">Selectâ€¦</option>
                  {scopeKind === 'category'
                    ? CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)
                    : APPS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            )}
            <button
              onClick={() => void addMapping()}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-ink px-4 text-[13px] font-semibold text-white transition hover:bg-black"
            >
              <Plus size={14} /> Choose folderâ€¦
            </button>
          </div>
        )}
      </section>

      <section className="animate-rise mt-12 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-line-soft bg-surface p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <GithubMark size={18} /> GitHub mirror
          </h2>
          <p className="mt-1 max-w-lg text-sm leading-relaxed text-ink-secondary">
            Publish your library into a repository you own. GitHub stores the bytes and keeps full
            history for free â€” Forge keeps none of it. A fine-grained personal access token with
            <span className="font-mono text-[12px]"> Contents: Read &amp; write </span> access is enough.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field id="gh-owner" label="Owner" value={ghForm.owner} onChange={(v) => setGhForm({ ...ghForm, owner: v })} placeholder="your-name" />
            <Field id="gh-repo" label="Repository" value={ghForm.repo} onChange={(v) => setGhForm({ ...ghForm, repo: v })} placeholder="forge-library" />
            <Field id="gh-branch" label="Branch" value={ghForm.branch} onChange={(v) => setGhForm({ ...ghForm, branch: v })} placeholder="main" />
            <Field id="gh-dir" label="Folder in repo" value={ghForm.dir} onChange={(v) => setGhForm({ ...ghForm, dir: v })} placeholder="forge" />
            <div className="sm:col-span-2">
              <Field
                id="gh-token"
                label="Personal access token"
                type="password"
                value={ghForm.token}
                onChange={(v) => setGhForm({ ...ghForm, token: v })}
                placeholder="github_pat_â€¦"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => { sync.saveGithub({ ...ghForm }); void sync.testGithub().then(setGhStatus) }}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-4 text-[13px] font-semibold transition hover:border-ink"
            >
              <PlugZap size={14} /> Save &amp; test
            </button>
            <button
              onClick={() => { sync.saveGithub({ ...ghForm }); void sync.pushGithub().then(setGhStatus) }}
              disabled={sync.githubBusy || !sync.github}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-ink px-4 text-[13px] font-semibold text-white transition hover:bg-black disabled:opacity-50"
            >
              <UploadCloud size={14} /> Push library to repo
            </button>
            {sync.github && (
              <button
                onClick={() => { sync.clearGithub(); setGhStatus(null) }}
                className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-secondary transition hover:border-red-500/50 hover:text-red-600"
                title="Disconnect repository"
                aria-label="Disconnect repository"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {ghStatus && (
            <p className={`mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-[12px] ${ghStatus.ok ? 'border-accent-green/30 bg-accent-green/[0.05] text-accent-green' : 'border-red-500/25 bg-red-500/[0.04] text-red-700'}`}>
              {ghStatus.ok ? <CircleCheck size={13} /> : <CircleAlert size={13} />} {ghStatus.message}
            </p>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line-soft bg-night p-5 text-white">
            <p className="text-[11px] font-bold tracking-widest text-white/60">HOW STORAGE WORKS</p>
            <ul className="mt-3 space-y-2.5 text-[12.5px] leading-relaxed text-white/85">
              <li className="flex gap-2"><Link2 size={13} className="mt-1 shrink-0 text-white/50" /> Folders hold exports on your drive â€” Forge keeps only SHA-256 manifests.</li>
              <li className="flex gap-2"><GithubMark size={13} className="mt-1 shrink-0 text-white/50" /> Mirrors live in your repo, with free commits, tags and diffs.</li>
              <li className="flex gap-2"><ShieldAlert size={13} className="mt-1 shrink-0 text-white/50" /> Tokens stay in this browser and go directly to api.github.com â€” no relay server.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-line-soft bg-surface p-5">
            <p className="text-[11px] font-bold tracking-widest text-ink-subtle">ACTIVITY</p>
            {sync.activity.length === 0 ? (
              <p className="mt-3 flex items-center gap-2 text-[12.5px] text-ink-subtle"><Clock3 size={13} /> Nothing yet â€” connect a folder to begin.</p>
            ) : (
              <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                {sync.activity.map((ev, i) => (
                  <li key={`${ev.at}-${i}`} className="flex items-start gap-2 text-[12px] leading-snug">
                    <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${ev.kind === 'error' ? 'bg-red-500' : ev.kind === 'warn' ? 'bg-[#F97316]' : ev.kind === 'sync' ? 'bg-accent-green' : 'bg-line'}`} />
                    <span className="text-ink-secondary">
                      {ev.message}
                      <span className="ml-1.5 font-mono text-[10px] text-ink-subtle">{fmtTime(ev.at)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </section>
    </div>
  )
}

function hasTotal(d: { added: string[]; modified: string[]; deleted: string[]; conflicts: string[] }): number {
  return d.added.length + d.modified.length + d.deleted.length + d.conflicts.length
}

function DiffCell({ n, label, tone }: { n: number; label: string; tone: string }) {
  return (
    <div className="px-3 py-2.5">
      <p className={`text-base font-extrabold tabular-nums ${n > 0 ? tone : 'text-ink-subtle'}`}>{n}</p>
      <p className="text-[10.5px] text-ink-subtle">{label}</p>
    </div>
  )
}

function Field({
  id, label, value, onChange, placeholder, type = 'text',
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[11px] font-semibold tracking-wider text-ink-subtle">{label.toUpperCase()}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="h-9 w-full rounded-lg border border-line bg-canvas px-3 font-mono text-[12.5px] outline-none transition placeholder:text-ink-subtle/70 focus:border-ink"
      />
    </div>
  )
}
