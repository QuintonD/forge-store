import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, Library, X, FolderSync } from 'lucide-react'
import { searchApps } from '../lib/data'
import { AppIcon } from './AppIcon'
import { useStore } from '../lib/store'
import { useSync } from '../lib/sync/engine'

const NAV = [
  { to: '/', label: 'Discover' },
  { to: '/category/Games', label: 'Games' },
  { to: '/category/Dashboards', label: 'Dashboards' },
  { to: '/category/UIs%20%26%20Components', label: 'UIs' },
  { to: '/category/TUIs%20%26%20CLIs', label: 'TUIs' },
  { to: '/category/Harnesses%20%26%20Evals', label: 'Evals' },
  { to: '/category/Agents%20%26%20Automation', label: 'Agents' },
  { to: '/charts', label: 'Top Charts' },
  { to: '/sync', label: 'Sync' },
]

function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect x="7" y="12" width="13" height="13" rx="2.5" fill="#141414" />
      <rect x="12" y="7" width="13" height="13" rx="2.5" fill="#315CFF" fillOpacity="0.92" />
    </svg>
  )
}

export function SyncDot() {
  const { states, mappings } = useSync()
  if (mappings.length === 0) return null
  const list = Object.values(states)
  const blocked = list.some((s) => s.status === 'needs-permission' || s.status === 'error')
  const working = list.some((s) => s.status === 'scanning' || s.status === 'working')
  return (
    <span
      aria-hidden
      className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-canvas ${
        blocked ? 'bg-[#F97316]' : working ? 'animate-sync-pulse bg-accent-blue' : 'bg-accent-green'
      }`}
    />
  )
}

export function Header() {
  const [q, setQ] = useState('')
  const [focus, setFocus] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const { installs, closeDemo } = useStore()
  const installedCount = Object.values(installs).filter((i) => i.status === 'installed').length

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)
      if (e.key === '/' && !typing) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') inputRef.current?.blur()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const results = focus ? searchApps(q).slice(0, 7) : []
  const showPanel = focus && q.trim().length > 0

  return (
    <header className="sticky top-0 z-50 border-b border-line-soft bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-8">
        <Link to="/" onClick={closeDemo} className="flex shrink-0 items-center gap-2.5" aria-label="Forge home">
          <BrandMark />
          <span className="hidden text-[17px] font-bold tracking-tight text-ink sm:block">Forge</span>
        </Link>

        <div className="relative mx-auto w-full max-[640px]:max-w-none">
          <div
            className={`flex h-11 items-center gap-2.5 rounded-lg border bg-surface px-3.5 transition-colors duration-150 ${
              focus ? 'border-ink' : 'border-line hover:border-ink-subtle'
            }`}
          >
            <Search size={15} className={focus ? 'text-ink' : 'text-ink-subtle'} aria-hidden />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setTimeout(() => setFocus(false), 150)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && q.trim()) {
                  navigate(`/search?q=${encodeURIComponent(q.trim())}`)
                  inputRef.current?.blur()
                }
              }}
              placeholder="Search agents, tools, generated apps…"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-subtle"
              aria-label="Search apps"
            />
            {q ? (
              <button onClick={() => setQ('')} aria-label="Clear search"><X size={14} className="text-ink-subtle transition hover:text-ink" /></button>
            ) : (
              <kbd className="hidden rounded-md border border-line bg-canvas px-1.5 py-0.5 text-[10px] font-semibold text-ink-secondary sm:block">/</kbd>
            )}
          </div>
          {showPanel && (
            <div className="absolute inset-x-0 top-[52px] animate-pop overflow-hidden rounded-xl border border-line bg-surface shadow-[0_12px_32px_-16px_rgba(20,20,20,0.25)]">
              {results.length === 0 ? (
                <p className="px-4 py-5 text-center text-xs text-ink-subtle">No results for “{q}”</p>
              ) : (
                results.map((app) => (
                  <Link key={app.id} to={`/app/${app.id}`} onMouseDown={() => setQ('')} className="flex items-center gap-3 px-3.5 py-2.5 transition hover:bg-canvas">
                    <AppIcon app={app} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-ink">{app.name}</p>
                      <p className="truncate text-[11px] text-ink-secondary">{app.category} · {app.developer}</p>
                    </div>
                    <span className="ml-auto shrink-0 font-mono text-[11px] font-semibold text-ink-secondary">★ {app.rating.toFixed(1)}</span>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        <Link
          to="/library"
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-[13px] font-semibold text-ink transition hover:border-ink"
        >
          <Library size={15} aria-hidden />
          <span className="hidden md:inline">Saved</span>
          {installedCount > 0 && (
            <span className="grid min-w-[18px] place-items-center rounded-full bg-ink px-1 font-mono text-[10px] font-bold text-white">{installedCount}</span>
          )}
        </Link>
        <Link
          to="/submit"
          className="hidden h-9 shrink-0 items-center rounded-lg bg-ink px-4 text-[13px] font-semibold text-white transition hover:bg-black sm:flex"
        >
          Submit
        </Link>
        <Link
          to="/sync"
          aria-label="Folder sync"
          title="Folder sync"
          className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-surface text-ink transition hover:border-ink"
        >
          <FolderSync size={15} aria-hidden />
          <SyncDot />
        </Link>
      </div>

      <nav className="no-scrollbar mx-auto flex max-w-[1440px] gap-5 overflow-x-auto px-4 pb-1 sm:px-8">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) =>
              `relative shrink-0 py-2 text-[13px] font-medium transition-colors duration-150 ${
                isActive ? 'text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-left after:animate-rise after:bg-ink' : 'text-ink-secondary after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-150 hover:text-ink'
              }`
            }
          >
            {n.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
