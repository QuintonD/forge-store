import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight } from 'lucide-react'
import { APPS, COLLECTIONS, getApp, similarApps } from '../lib/data'
import { useStore } from '../lib/store'
import type { Category } from '../lib/types'
import { HERO_ART, MOTIF_SHEET, CATEGORY_THEME } from '../lib/theme'
import { HeroCarousel } from '../components/HeroCarousel'
import { Rail } from '../components/Rail'
import { AppCard, AppRow } from '../components/AppCard'
import { AppGlyph } from '../components/AppIcon'
import { CATEGORIES } from '../lib/types'
import { useSeo } from '../lib/seo'

const CAT_ICONS: Record<Category, string> = {
  'UIs & Components': 'Layers',
  Dashboards: 'Activity',
  Games: 'Gamepad2',
  'TUIs & CLIs': 'SquareTerminal',
  'Harnesses & Evals': 'FlaskConical',
  'Agents & Automation': 'Bot',
}

export function Home() {
  const { installs } = useStore()
  const navigate = useNavigate()
  const [booting, setBooting] = useState(true)
  const [heroQ, setHeroQ] = useState('')

  useSeo({
    title: 'Forge — The Store for Generated Software',
    description:
      'Discover, preview and install AI-generated software. Every listing runs live in your browser before you install. Sync packages to your folders or GitHub.',
    path: '/',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Forge',
        alternateName: 'Forge — The Store for Generated Software',
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${window.location.origin}/search?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  })

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 420)
    return () => clearTimeout(t)
  }, [])

  const featured = APPS.filter((a) => a.editorsChoice)
  const trending = useMemo(() => [...APPS].sort((a, b) => b.downloads - a.downloads).slice(0, 10), [])
  const fresh = useMemo(() => [...APPS].sort((a, b) => a.updatedDaysAgo - b.updatedDaysAgo).slice(0, 12), [])
  const topRated = [...APPS].filter((a) => a.rating >= 4.6 && !a.editorsChoice).sort((a, b) => b.rating - a.rating)

  const installedApps = useMemo(
    () => Object.keys(installs).map((id) => getApp(id)).filter((a): a is NonNullable<typeof a> => !!a),
    [installs],
  )

  const forYou = useMemo(() => {
    if (installedApps.length === 0) return []
    const seen = new Set(Object.keys(installs))
    const scored = new Map<string, { app: NonNullable<ReturnType<typeof getApp>>; score: number }>()
    for (const inst of installedApps.slice(0, 6)) {
      for (const s of similarApps(inst, 10)) {
        if (seen.has(s.id)) continue
        const cur = scored.get(s.id)
        const score = (s.category === inst.category ? 2 : 0) + s.tags.filter((t) => inst.tags.includes(t)).length
        if (!cur || cur.score < score) scored.set(s.id, { app: s, score })
      }
    }
    return [...scored.values()].sort((a, b) => b.score - a.score).slice(0, 10).map((x) => x.app)
  }, [installedApps, installs])

  if (booting) return <HomeSkeleton />

  return (
    <div className="mx-auto max-w-[1440px] space-y-12 px-4 py-8 sm:px-8">
      <section className="grid items-center gap-8 lg:grid-cols-[1fr_44%]">
        <div className="animate-rise">
          <p className="font-mono text-[11px] font-semibold tracking-[0.22em] text-ink-secondary">THE APP STORE FOR GENERATED SOFTWARE</p>
          <h1 className="mt-4 max-w-xl text-[40px] font-bold leading-[1.05] tracking-tight sm:text-[52px]">
            Find the right app before you run it.
          </h1>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink-secondary">
            Discover agents, tools and generated software — every listing runs live in your browser,
            then syncs straight to your folders or GitHub.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); if (heroQ.trim()) navigate(`/search?q=${encodeURIComponent(heroQ.trim())}`) }}
            className="mt-7 flex h-14 max-w-xl items-center gap-3 rounded-xl border border-line bg-surface px-5 transition-colors duration-150 focus-within:border-ink"
          >
            <Search size={18} className="shrink-0 text-ink-subtle" aria-hidden />
            <input
              value={heroQ}
              onChange={(e) => setHeroQ(e.target.value)}
              placeholder="What do you want AI to do?"
              aria-label="Search the store"
              className="w-full bg-transparent text-[15px] outline-none placeholder:text-ink-subtle"
            />
            <button type="submit" className="flex h-10 shrink-0 items-center gap-2 rounded-lg bg-ink px-5 text-sm font-semibold text-white transition hover:bg-black active:scale-[0.98]">
              Search <ArrowRight size={15} aria-hidden />
            </button>
          </form>
        </div>
        <div className="relative hidden justify-self-end lg:block">
          <img src={HERO_ART} alt="" width={760} height={760} className="max-h-[520px] w-auto select-none" draggable={false} />
        </div>
      </section>

      {installedApps.length > 0 && forYou.length > 0 && (
        <Rail title="For you" subtitle="Picked from what you already run" seeAllTo="/category/All">
          {forYou.map((a) => <AppCard key={a.id} app={a} />)}
        </Rail>
      )}

      {installedApps.length > 0 && (
        <Rail title={`Because you installed ${installedApps[0].name}`} seeAllTo={`/developer/${encodeURIComponent(installedApps[0].developer)}`}>
          {similarApps(installedApps[0], 10).filter((a) => !installs[a.id]).map((a) => (
            <AppCard key={a.id} app={a} />
          ))}
        </Rail>
      )}

      <section>
        <h2 className="mb-3 px-0.5 text-lg font-bold tracking-tight">Browse by category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => {
            const theme = CATEGORY_THEME[c]
            return (
              <Link
                key={c}
                to={`/category/${encodeURIComponent(c)}`}
                className="card-hover group relative flex flex-col overflow-hidden rounded-xl border border-line-soft bg-surface p-4 hover:border-line"
              >
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 w-24 opacity-30 transition-opacity duration-200 group-hover:opacity-50"
                  style={{
                    backgroundImage: `url("${MOTIF_SHEET}")`,
                    backgroundSize: '400% 200%',
                    backgroundPosition: theme.motifPos,
                    maskImage: 'linear-gradient(to left, black 30%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to left, black 30%, transparent)',
                  }}
                  aria-hidden
                />
                <span className="relative grid h-9 w-9 place-items-center rounded-lg transition-transform duration-150 group-hover:-translate-y-0.5" style={{ background: theme.soft, color: theme.accent }}>
                  <AppGlyph name={CAT_ICONS[c]} size={17} />
                </span>
                <div className="relative mt-6">
                  <p className="text-[13px] font-bold text-ink">{c}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-ink-subtle">{APPS.filter((a) => a.category === c).length} apps</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <Rail title="Trending this week" subtitle="What everyone is generating right now" seeAllTo="/charts">
        {trending.map((a) => <AppCard key={a.id} app={a} />)}
      </Rail>

      <section className="animate-rise">
        <h2 className="mb-3 px-0.5 text-lg font-bold tracking-tight">Editors&rsquo; picks</h2>
        <HeroCarousel apps={featured.slice(0, 4)} />
      </section>

      <section>
        <h2 className="mb-3 px-0.5 text-lg font-bold tracking-tight">Curated collections</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTIONS.map((col) => (
            <Link key={col.title} to={`/collection/${encodeURIComponent(col.title)}`} className="card-hover group flex flex-col rounded-xl border border-line-soft bg-surface p-4 hover:border-line">
              <p className="text-[15px] font-bold text-ink">{col.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-secondary">{col.blurb}</p>
              <div className="mt-4 flex -space-x-3">
                {col.ids.slice(0, 4).map((id) => {
                  const a = getApp(id)
                  return a ? (
                    <span key={id} className="rounded-[11px] ring-2 ring-surface transition-transform duration-150 group-hover:-translate-y-0.5">
                      <MiniIcon id={a.id} />
                    </span>
                  ) : null
                })}
              </div>
              <p className="mt-3 flex items-center gap-1 text-[12px] font-semibold text-ink opacity-70 transition-opacity duration-150 group-hover:opacity-100">
                {col.ids.length} apps <ArrowRight size={12} aria-hidden />
              </p>
            </Link>
          ))}
        </div>
      </section>

      <Rail title="Updated recently" seeAllTo="/category/All">
        {fresh.map((a) => <AppCard key={a.id} app={a} />)}
      </Rail>

      <section className="animate-rise">
        <h2 className="mb-3 px-0.5 text-lg font-bold tracking-tight">Top charts</h2>
        <div className="grid gap-x-8 rounded-2xl border border-line-soft bg-surface p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-3">
          {trending.slice(0, 9).map((a, i) => <AppRow key={a.id} app={a} rank={i + 1} />)}
        </div>
        <div className="mt-2 px-0.5">
          <Link to="/charts" className="text-xs font-semibold text-ink transition hover:opacity-70">See full charts &rarr;</Link>
        </div>
      </section>

      {(['Dashboards', 'Games', 'TUIs & CLIs', 'UIs & Components'] as Category[]).map((cat) => (
        <Rail key={cat} title={cat} seeAllTo={`/category/${encodeURIComponent(cat)}`}>
          {APPS.filter((a) => a.category === cat).slice(0, 10).map((a) => <AppCard key={a.id} app={a} />)}
        </Rail>
      ))}
    </div>
  )
}

function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-10 px-4 py-8 sm:px-8" aria-busy="true" aria-label="Loading store">
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_44%]">
        <div className="space-y-4">
          <div className="skeleton h-4 w-64 rounded-md" />
          <div className="skeleton h-16 w-full max-w-xl rounded-lg" />
          <div className="skeleton h-6 w-full max-w-md rounded-md" />
          <div className="skeleton h-14 w-full max-w-xl rounded-xl" />
        </div>
        <div className="skeleton hidden h-[420px] rounded-2xl lg:block" />
      </div>
      <div>
        <div className="skeleton mb-3 h-5 w-44 rounded-md" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      </div>
      {[0, 1].map((row) => (
        <div key={row}>
          <div className="skeleton mb-3 h-5 w-52 rounded-md" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 7 }).map((_, i) => <div key={i} className="skeleton h-[190px] w-[168px] shrink-0 rounded-xl" />)}
          </div>
        </div>
      ))}
    </div>
  )
}

function MiniIcon({ id }: { id: string }) {
  const a = getApp(id)!
  return (
    <span
      className="grid h-10 w-10 place-items-center rounded-[11px]"
      style={{ background: `linear-gradient(135deg, ${a.colors[0]}, ${a.colors[1]})` }}
    >
      <AppGlyph name={a.icon} size={17} />
    </span>
  )
}
