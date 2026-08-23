import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'
import { APPS, COLLECTIONS, getApp } from '../lib/data'
import type { App, Category } from '../lib/types'
import { CATEGORIES } from '../lib/types'
import { AppIcon, AppGlyph } from '../components/AppIcon'
import { Stars } from '../components/Stars'
import { InstallButton } from '../components/InstallButton'
import { useStore } from '../lib/store'
import { formatCount, formatUpdated } from '../lib/format'
import { MOTIF_SHEET, CATEGORY_THEME } from '../lib/theme'
import { useSeo } from '../lib/seo'
import { Play } from 'lucide-react'

type Sort = 'popular' | 'rating' | 'newest' | 'name'
const SORTS: { id: Sort; label: string }[] = [
  { id: 'popular', label: 'Most installed' },
  { id: 'rating', label: 'Top rated' },
  { id: 'newest', label: 'Recently updated' },
  { id: 'name', label: 'A–Z' },
]

const CATEGORY_META: Record<Category, { tagline: string; icon: string }> = {
  Games: { tagline: 'Playable worlds generated overnight — every one runs before you install.', icon: 'Gamepad2' },
  Dashboards: { tagline: 'Mission control surfaces for money, ops and habits.', icon: 'Activity' },
  'UIs & Components': { tagline: 'Design systems and building blocks, token-perfect.', icon: 'Layers' },
  'TUIs & CLIs': { tagline: 'Keyboard-driven tools that live inside a rectangle.', icon: 'SquareTerminal' },
  'Harnesses & Evals': { tagline: 'Quality gates for the generated-software era.', icon: 'FlaskConical' },
  'Agents & Automation': { tagline: 'Software that does the boring parts of your job.', icon: 'Bot' },
}

export function Browse() {
  const { cat = 'All' } = useParams()
  const [params, setParams] = useSearchParams()
  const sort = (params.get('sort') as Sort) || 'popular'
  const demoFilter = params.get('demo') === '1'

  const patchParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) next.delete(k)
      else next.set(k, v)
    }
    setParams(next, { replace: true })
  }
  const setSort = (s: Sort) => patchParams({ sort: s === 'popular' ? null : s })
  const setDemoFilter = (on: boolean) => patchParams({ demo: on ? '1' : null })

  const title = COLLECTIONS.find((c) => c.title === cat)?.title
  const base: App[] = useMemo(() => {
    if (title) return COLLECTIONS.find((c) => c.title === title)!.ids.map((id) => getApp(id)!).filter(Boolean)
    if (cat === 'All') return APPS
    return APPS.filter((a) => a.category === decodeURIComponent(cat))
  }, [cat, title])

  const apps = useMemo(() => {
    let list = demoFilter ? base.filter((a) => a.demoId) : base
    list = [...list]
    switch (sort) {
      case 'popular': list.sort((a, b) => b.downloads - a.downloads); break
      case 'rating': list.sort((a, b) => b.rating - a.rating); break
      case 'newest': list.sort((a, b) => a.updatedDaysAgo - b.updatedDaysAgo); break
      case 'name': list.sort((a, b) => a.name.localeCompare(b.name)); break
    }
    return list
  }, [base, sort, demoFilter])

  const heading = title ?? (cat === 'All' ? 'All generated software' : decodeURIComponent(cat))
  const meta = !title && cat !== 'All' ? CATEGORY_META[decodeURIComponent(cat) as Category] : undefined
  const theme = meta ? CATEGORY_THEME[decodeURIComponent(cat) as Category] : undefined

  useSeo({
    title: heading,
    description: meta
      ? `${meta.tagline} Browse ${apps.length} runnable AI-built ${heading.toLowerCase()} on Forge.`
      : `Browse ${apps.length} listings of runnable AI-generated software${title ? ` in the ${title} collection` : ''} on Forge.`,
    path: title ? `/collection/${encodeURIComponent(title)}` : `/category/${cat}`,
  })

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <div className="animate-rise">
        {meta && theme ? (
          <header className="relative overflow-hidden rounded-2xl border border-line-soft bg-surface p-7 sm:p-9">
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-[46%] opacity-[0.38]"
              style={{
                backgroundImage: `url("${MOTIF_SHEET}")`,
                backgroundSize: '400% 200%',
                backgroundPosition: theme.motifPos,
                maskImage: 'linear-gradient(to left, black 45%, transparent)',
                WebkitMaskImage: 'linear-gradient(to left, black 45%, transparent)',
              }}
              aria-hidden
            />
            <span className="relative grid h-11 w-11 place-items-center rounded-xl" style={{ background: theme.soft, color: theme.accent }}>
              <AppGlyph name={meta.icon} size={22} />
            </span>
            <h1 className="relative mt-3.5 text-2xl font-bold tracking-tight sm:text-3xl">{heading}</h1>
            <p className="relative mt-1 max-w-xl text-sm leading-relaxed text-ink-secondary">{meta.tagline}</p>
            <p className="relative mt-2 font-mono text-xs text-ink-subtle">{apps.length} apps</p>
          </header>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
            <p className="mt-0.5 font-mono text-sm text-ink-secondary">{apps.length} apps{title ? ' · curated collection' : ''}</p>
          </>
        )}
      </div>

      <div className="no-scrollbar mt-5 flex items-center gap-2 overflow-x-auto pb-1">
        <button onClick={() => setDemoFilter(false)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${!demoFilter ? 'bg-ink text-white' : 'border border-line bg-surface text-ink-secondary hover:text-ink'}`}>All</button>
        <button onClick={() => setDemoFilter(true)} className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${demoFilter ? 'bg-accent-green text-white' : 'border border-line bg-surface text-ink-secondary hover:text-ink'}`}>
          <Play size={11} /> RUNNABLE DEMO
        </button>
        <span className="mx-1 h-4 w-px shrink-0 bg-line" aria-hidden />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="cursor-pointer rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-medium outline-none transition hover:border-ink focus:border-ink"
          aria-label="Sort apps"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <div className="ml-auto hidden shrink-0 gap-1.5 lg:flex">
          <CategoryPill to="All" label="All" activeCat={cat} />
          {CATEGORIES.map((c) => (
            <CategoryPill key={c} to={encodeURIComponent(c)} label={c.split(' ')[0]} activeCat={cat} />
          ))}
        </div>
      </div>

      {apps.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {apps.map((a) => <BrowseCard key={a.id} app={a} />)}
        </div>
      )}
    </div>
  )
}

function CategoryPill({ to, label, activeCat }: { to: string; label: string; activeCat: string }) {
  const active = activeCat === to || (activeCat !== 'All' && decodeURIComponent(activeCat).startsWith(label))
  return (
    <Link to={`/category/${to}`} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${active ? 'bg-accent-blue text-white' : 'border border-line bg-surface text-ink-secondary hover:text-ink'}`}>
      {label}
    </Link>
  )
}

export function BrowseCard({ app }: { app: App }) {
  const { openDemo } = useStore()
  return (
    <div className="card-hover flex gap-3.5 rounded-xl border border-line-soft bg-surface p-4 hover:border-line">
      <AppIcon app={app} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold text-ink">{app.name}</p>
        <p className="truncate text-[12px] text-ink-secondary">{app.developer}</p>
        <p className="mt-1 line-clamp-1 text-[11.5px] text-ink-secondary">{app.tagline}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10.5px] text-ink-subtle">
          <span className="flex items-center gap-1"><Stars rating={app.rating} size={10} /> {app.rating.toFixed(1)}</span>
          <span>{formatCount(app.downloads)}</span>
          <span>{formatUpdated(app.updatedDaysAgo)}</span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-between">
        <InstallButton app={app} />
        {app.demoId && (
          <button onClick={() => openDemo(app.id)} className="flex h-7 items-center gap-1 rounded-lg border border-line px-2.5 text-[10.5px] font-bold text-ink transition hover:border-ink active:scale-95">
            <Play size={10} /> DEMO
          </button>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="mt-16 flex flex-col items-center gap-3 text-center">
      <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#C7C7C2" strokeWidth="1.2" aria-hidden>
        <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
      </svg>
      <p className="text-lg font-bold text-ink">Nothing here yet</p>
      <p className="max-w-xs text-sm leading-relaxed text-ink-secondary">No apps match this filter. Try clearing the runnable-demo filter or picking another category.</p>
    </div>
  )
}
