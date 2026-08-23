import { Link } from 'react-router-dom'
import { Play, BadgeCheck } from 'lucide-react'
import type { App } from '../lib/types'
import { formatCount } from '../lib/format'
import { categoryAccent } from '../lib/theme'
import { AppIcon } from './AppIcon'
import { Stars } from './Stars'
import { InstallButton } from './InstallButton'
import { useStore } from '../lib/store'

export function AppCard({ app }: { app: App }) {
  const { openDemo } = useStore()
  return (
    <div className="card-hover group relative flex w-[168px] shrink-0 snap-start flex-col rounded-xl border border-line-soft bg-surface p-3.5 hover:border-line">
      <Link to={`/app/${app.id}`} className="flex flex-col items-center gap-2.5 text-center" aria-label={app.name}>
        <AppIcon app={app} size="md" />
        <div className="w-full">
          <p className="truncate text-[13px] font-semibold text-ink">{app.name}</p>
          <p className="truncate text-[11px]" style={{ color: categoryAccent(app.category) }}>{app.category}</p>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-ink-secondary">
          <Stars rating={app.rating} size={11} />
          <span>{app.rating.toFixed(1)}</span>
        </div>
      </Link>
      <div className="mt-2.5 flex justify-center gap-1.5">
        {app.demoId && (
          <button
            onClick={() => openDemo(app.id)}
            className="flex h-7 items-center gap-1 rounded-lg border border-line px-2.5 text-xs font-semibold text-ink transition hover:border-ink active:scale-95"
          >
            <Play size={11} /> Demo
          </button>
        )}
        <InstallButton app={app} size="sm" />
      </div>
    </div>
  )
}

export function AppRow({ app, rank }: { app: App; rank?: number }) {
  return (
    <Link
      to={`/app/${app.id}`}
      className="group flex min-w-0 items-center gap-3.5 rounded-lg border border-transparent px-3 py-2.5 transition-colors duration-150 hover:border-line-soft hover:bg-surface"
    >
      {rank !== undefined && (
        <span className={`w-6 shrink-0 text-center font-mono text-sm font-bold tabular-nums ${rank <= 3 ? 'text-ink' : 'text-ink-subtle'}`}>{rank}</span>
      )}
      <AppIcon app={app} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-[13px] font-semibold text-ink">
          {app.name}
          {app.editorsChoice && <BadgeCheck size={13} className="shrink-0 text-accent-blue" />}
        </p>
        <p className="truncate text-[11px] text-ink-secondary">{app.tagline}</p>
      </div>
      <div className="hidden shrink-0 flex-col items-end gap-0.5 sm:flex">
        <Stars rating={app.rating} size={10} />
        <span className="font-mono text-[10.5px] text-ink-subtle">{formatCount(app.downloads)} downloads</span>
      </div>
    </Link>
  )
}

export function WideCard({ app }: { app: App }) {
  const { openDemo } = useStore()
  const accent = categoryAccent(app.category)
  return (
    <div className="relative flex w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-night bg-night text-white">
      <div className="relative h-28 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{ background: `radial-gradient(120% 140% at 85% -10%, ${accent}55, transparent 60%)` }}
        />
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{ backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`, backgroundSize: '16px 16px' }}
        />
        {app.demoId && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-wide backdrop-blur">
            <Play size={10} /> LIVE DEMO
          </span>
        )}
        <div className="absolute -bottom-6 right-4"><AppIcon app={app} size="md" /></div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3.5 pt-8">
        <Link to={`/app/${app.id}`} className="truncate text-[13.5px] font-bold transition hover:opacity-80">{app.name}</Link>
        <p className="line-clamp-2 text-[11.5px] leading-snug text-white/70">{app.tagline}. By {app.developer}.</p>
        <div className="mt-auto flex items-center gap-1.5 pt-2.5">
          {app.demoId && (
            <button onClick={() => openDemo(app.id)} className="flex h-7 items-center gap-1 rounded-lg border border-white/25 px-3 text-xs font-semibold transition hover:bg-white/10 active:scale-95">
              <Play size={11} /> Try it
            </button>
          )}
          <InstallButton app={app} size="sm" />
          <span className="ml-auto font-mono text-[10.5px] text-white/60">{formatCount(app.downloads)}</span>
        </div>
      </div>
    </div>
  )
}
