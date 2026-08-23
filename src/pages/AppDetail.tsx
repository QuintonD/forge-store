import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Play, ShieldCheck, Cpu, HardDrive, CalendarClock, Package, ChevronDown, Sparkles, Heart, Link2, Database } from 'lucide-react'
import { getApp, similarApps } from '../lib/data'
import { ATTESTATIONS } from '../generated/attestations'
import { reviewsFor, histogramFor } from '../lib/reviews'
import type { Review } from '../lib/reviews'
import { formatCount, formatUpdated, formatSize } from '../lib/format'
import { categoryAccent } from '../lib/theme'
import { AppIcon } from '../components/AppIcon'
import { Stars } from '../components/Stars'
import { InstallButton } from '../components/InstallButton'
import { Rail } from '../components/Rail'
import { AppCard } from '../components/AppCard'
import { ShotStrip } from '../components/Screenshots'
import { useStore } from '../lib/store'
import { useSeo, softwareApplicationLd } from '../lib/seo'

type ReviewSort = 'recent' | 'helpful' | 'highest' | 'lowest'
const SORTS: { id: ReviewSort; label: string }[] = [
  { id: 'helpful', label: 'Most helpful' },
  { id: 'recent', label: 'Most recent' },
  { id: 'highest', label: 'Highest rated' },
  { id: 'lowest', label: 'Lowest rated' },
]

export function AppDetail() {
  const { id = '' } = useParams()
  const app = getApp(id)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!app) return <Navigate to="/" replace />
  return <Detail key={app.id} app={app} />
}

function Detail({ app }: { app: NonNullable<ReturnType<typeof getApp>> }) {
  const { openDemo, isWishlisted, toggleWishlist, pushToast } = useStore()
  const navigate = useNavigate()
  const reviews = reviewsFor(app)
  const hist = histogramFor(app)
  const similar = similarApps(app)
  const moreFromDev = useMemo(() => similar.filter((a) => a.developer === app.developer), [similar, app])
  const wished = isWishlisted(app.id)
  const accent = categoryAccent(app.category)

  const [sort, setSort] = useState<ReviewSort>('helpful')
  const [starFilter, setStarFilter] = useState<number | null>(null)
  const att = app.demoId ? ATTESTATIONS[app.demoId] : undefined

  const visibleReviews = useMemo(() => {
    let list: Review[] = starFilter ? reviews.filter((r) => r.rating === starFilter) : reviews
    list = [...list]
    switch (sort) {
      case 'helpful': list.sort((a, b) => b.helpfulCount - a.helpfulCount); break
      case 'recent': list.sort((a, b) => a.daysAgo - b.daysAgo); break
      case 'highest': list.sort((a, b) => b.rating - a.rating || b.helpfulCount - a.helpfulCount); break
      case 'lowest': list.sort((a, b) => a.rating - b.rating || b.helpfulCount - a.helpfulCount); break
    }
    return list
  }, [reviews, sort, starFilter])

  const goBack = () => {
    if (window.history.length > 1 && document.referrer !== '') history.back()
    else navigate('/')
  }

  useSeo({
    title: app.name,
    description: `${app.tagline} — runs live in your browser. ${app.category} · by ${app.developer} · v${app.version}.`,
    path: `/app/${app.id}`,
    jsonLd: softwareApplicationLd(app),
  })

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href).then(
      () => pushToast({ title: 'Link copied to clipboard' }),
      () => pushToast({ title: 'Could not copy link' }),
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 sm:px-6">
      <button onClick={goBack} className="mt-4 flex items-center gap-1.5 text-[13px] font-semibold text-ink-secondary transition hover:text-ink">
        <ArrowLeft size={15} aria-hidden /> Back
      </button>

      <header className="relative mt-4 overflow-hidden rounded-2xl border border-line-soft bg-surface p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-[0.25]" style={{ background: `radial-gradient(120% 160% at 100% 0%, ${accent}26, transparent 60%)` }} aria-hidden />
        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:items-end sm:text-left">
          <AppIcon app={app} size="xl" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{app.name}</h1>
            <p className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-medium sm:justify-start" style={{ color: accent }}>
              {app.tagline}
              {app.editorsChoice && (
                <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-ink">
                  <BadgeCheck size={11} aria-hidden /> EDITORS&rsquo; CHOICE
                </span>
              )}
            </p>
            <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 font-mono text-xs text-ink-subtle sm:justify-start">
              <Sparkles size={12} style={{ color: accent }} aria-hidden />
              Generated &amp; maintained by{' '}
              <Link to={`/developer/${encodeURIComponent(app.developer)}`} className="font-semibold underline decoration-line underline-offset-2 transition hover:decoration-ink">
                {app.developer}
              </Link>
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-2.5 sm:items-stretch">
            <InstallButton app={app} size="lg" />
            {app.demoId && (
              <button
                onClick={() => openDemo(app.id)}
                className="flex h-11 items-center justify-center gap-2 rounded-lg border border-accent-green/50 bg-accent-green/[0.06] px-7 text-[15px] font-bold text-accent-green transition hover:bg-accent-green/10 active:scale-[0.98]"
              >
                <Play size={16} aria-hidden /> Run live demo
              </button>
            )}
            <div className="flex justify-center gap-2 sm:justify-stretch">
              <button
                onClick={() => toggleWishlist(app.id)}
                aria-pressed={wished}
                className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold transition active:scale-95 ${
                  wished ? 'border-red-500/40 bg-red-500/[0.05] text-red-600' : 'border-line bg-surface text-ink-secondary hover:border-ink hover:text-ink'
                }`}
              >
                <Heart size={13} fill={wished ? 'currentColor' : 'none'} aria-hidden /> {wished ? 'In wishlist' : 'Wishlist'}
              </button>
              <button
                onClick={copyLink}
                title="Copy link to this app"
                aria-label="Copy link"
                className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-ink-secondary transition hover:border-ink hover:text-ink active:scale-95"
              >
                <Link2 size={14} aria-hidden />
              </button>
            </div>
          </div>
        </div>

        <dl className="relative mt-6 grid grid-cols-2 gap-y-4 border-t border-line-soft pt-5 sm:grid-cols-4">
          <Meta icon={<Stars rating={app.rating} size={13} />} label={`${formatCount(app.ratingCount)} ratings`} value={app.rating.toFixed(1)} />
          <Meta icon={<HardDrive size={14} aria-hidden />} label="Download size" value={formatSize(app.sizeMB)} />
          <Meta icon={<Package size={14} aria-hidden />} label={`Version ${app.version}`} value={`${formatCount(app.downloads)} installs`} />
          <Meta icon={<CalendarClock size={14} aria-hidden />} label="Updated" value={formatUpdated(app.updatedDaysAgo)} />
        </dl>
      </header>

      <section className="mt-8">
        <SectionTitle>Preview</SectionTitle>
        <ShotStrip app={app} onOpen={app.demoId ? () => openDemo(app.id!) : undefined} />
        {app.demoId && (
          <p className="mt-2 text-center font-mono text-[11px] text-ink-subtle">First screenshot is playable &mdash; click it or hit &ldquo;Run live demo&rdquo;.</p>
        )}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <SectionTitle>About this app</SectionTitle>
          <div className="space-y-3.5 rounded-2xl border border-line-soft bg-surface p-5">
            {app.description.map((p, i) => (
              <p key={i} className="text-[13.5px] leading-relaxed text-ink">{p}</p>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-line-soft bg-surface p-5">
            <p className="mb-3 font-mono text-xs font-bold tracking-widest text-ink-subtle">HIGHLIGHTS</p>
            <ul className="space-y-2.5">
              {app.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-[13px] leading-snug text-ink">
                  <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full text-[9px]" style={{ background: `${accent}16`, color: accent }}>&#10022;</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line-soft bg-surface p-5">
            <p className="mb-3 flex items-center gap-1.5 font-mono text-xs font-bold tracking-widest text-ink-subtle"><Database size={13} className="text-accent-green" aria-hidden /> DATA SAFETY</p>
            <ul className="space-y-2.5 text-[12.5px] text-ink">
              <li className="flex items-center gap-2.5">
                <ShieldCheck size={14} className="shrink-0 text-accent-green" aria-hidden />
                {app.permissions?.length ? 'Declares permissions (right)' : 'No data collected · no network access'}
              </li>
              {app.permissions?.map((p) => (
                <li key={p} className="flex items-start gap-2.5 pl-6 text-ink-secondary">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-green" aria-hidden />{p}
                </li>
              ))}
              <li className="border-t border-line-soft pt-2.5 text-[11px] leading-snug text-ink-subtle">
                Every declaration is enforced by the sandbox, not just promised &mdash; see{' '}
                <Link to="/trust" className="font-medium underline decoration-line underline-offset-2 hover:decoration-ink">trust model</Link>.
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-line-soft bg-surface p-5">
            <p className="mb-3 font-mono text-xs font-bold tracking-widest text-ink-subtle">PROVENANCE</p>
            <ul className="space-y-2.5 text-[12.5px] text-ink">
              <li className="flex items-center gap-2.5"><Cpu size={14} className="shrink-0 text-accent-purple" aria-hidden /> Generated with frontier LLM + human review</li>
              {att ? (
                <>
                  <li className="flex items-start gap-2.5">
                    <ShieldCheck size={14} className="mt-0.5 shrink-0 text-accent-green" aria-hidden />
                    <span>
                      Demo artifact ed25519-signed
                      <code className="ml-1 rounded bg-canvas px-1 font-mono text-[10.5px]" title={`sha256 ${att.sha256}`}>{att.sha256.slice(0, 12)}&hellip;</code>
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Package size={14} className="mt-0.5 shrink-0 text-accent-blue" aria-hidden />
                    <span>
                      Key fingerprint
                      <code className="ml-1 rounded bg-canvas px-1 font-mono text-[10.5px]">{att.fingerprint}</code>
                    </span>
                  </li>
                  <li className="rounded-lg border border-accent-green/25 bg-accent-green/[0.05] px-3 py-2 font-mono text-[10.5px] leading-relaxed text-accent-green">
                    $ npm run verify &rarr; ATTESTATION VALID
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2.5"><ShieldCheck size={14} className="shrink-0 text-accent-green" aria-hidden /> Sandboxed build · signed manifest pipeline</li>
                  <li className="flex items-center gap-2.5"><Package size={14} className="shrink-0 text-accent-blue" aria-hidden /> Reproducible from seed <code className="rounded bg-canvas px-1 font-mono text-[11px]">{app.id.slice(0, 6)}</code></li>
                </>
              )}
            </ul>
          </div>
          <div className="rounded-2xl border border-line-soft bg-surface p-5">
            <p className="mb-2.5 font-mono text-xs font-bold tracking-widest text-ink-subtle">TAGS</p>
            <div className="flex flex-wrap gap-1.5">
              {app.tags.map((t) => (
                <span key={t} className="rounded-full border border-line bg-canvas px-2.5 py-1 font-mono text-[11px] text-ink-secondary">#{t}</span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-line-soft bg-surface p-5">
            <p className="mb-2.5 font-mono text-xs font-bold tracking-widest text-ink-subtle">WHAT&rsquo;S NEW · v{app.changelog[0].v}</p>
            <ul className="list-disc space-y-1 pl-4 text-[12.5px] text-ink">
              {app.changelog[0].notes.map((n) => <li key={n}>{n}</li>)}
            </ul>
            {app.changelog.length > 1 && <ChangelogMore entries={app.changelog.slice(1)} />}
          </div>
        </aside>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-2xl border border-line-soft bg-surface p-5">
          <SectionTitle>Ratings &amp; reviews</SectionTitle>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-bold tracking-tight tabular-nums">{app.rating.toFixed(1)}</span>
            <div className="pb-1">
              <Stars rating={app.rating} size={15} />
              <p className="mt-1 font-mono text-[11px] text-ink-subtle">{formatCount(app.ratingCount)} ratings</p>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star, i) => (
              <div key={star} className="flex items-center gap-2 font-mono text-[11px] text-ink-subtle">
                <span className="w-3 text-right">{star}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-soft">
                  <div
                    className="h-full rounded-full bg-ink transition-all duration-300"
                    style={{ width: `${(hist[i] / Math.max(...hist)) * 100}%` }}
                  />
                </div>
                <span className="w-10 tabular-nums">{formatCount(hist[i])}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label htmlFor="review-sort" className="font-mono text-[11px] font-bold tracking-widest text-ink-subtle">SORT</label>
            <select
              id="review-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as ReviewSort)}
              className="cursor-pointer rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold outline-none transition hover:border-ink focus:border-ink"
            >
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <div className="ml-auto flex gap-1" role="group" aria-label="Filter reviews by star rating">
              {[null, 5, 4, 3, 2, 1].map((star) => (
                <button
                  key={String(star)}
                  onClick={() => setStarFilter(star)}
                  aria-pressed={starFilter === star}
                  className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-bold transition ${
                    starFilter === star ? 'bg-ink text-white' : 'border border-line text-ink-secondary hover:text-ink'
                  }`}
                >
                  {star === null ? 'All' : `${star}&#9733;`}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3 lg:max-h-[520px] lg:overflow-y-auto lg:pr-1">
            {visibleReviews.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-ink-secondary">No {starFilter}&#9733; reviews yet.</p>
            ) : (
              visibleReviews.map((r, i) => (
                <article key={i} className="rounded-2xl border border-line-soft bg-surface p-4">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-night text-xs font-bold text-white">
                      {r.user.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold">{r.user}</p>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-ink-subtle">
                        <Stars rating={r.rating} size={10} /> {formatUpdated(r.daysAgo)}
                      </div>
                    </div>
                    <span className="ml-auto shrink-0 rounded-full bg-canvas px-2 py-0.5 font-mono text-[10.5px] font-semibold text-ink-secondary">
                      {formatCount(r.helpfulCount)} found helpful
                    </span>
                  </div>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-ink">{r.text}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {moreFromDev.length > 0 && (
        <div className="mt-10">
          <Rail title={`More from ${app.developer}`} seeAllTo={`/developer/${encodeURIComponent(app.developer)}`}>
            {moreFromDev.map((a) => <AppCard key={a.id} app={a} />)}
          </Rail>
        </div>
      )}

      <div className="mt-10">
        <Rail title="Similar generated software" seeAllTo={`/category/${encodeURIComponent(app.category)}`}>
          {similar.map((a) => <AppCard key={a.id} app={a} />)}
        </Rail>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-lg font-bold tracking-tight">{children}</h2>
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-0.5 sm:items-start">
      <span className="flex items-center gap-1.5 text-ink-secondary">{icon}<span className="truncate font-mono text-[11.5px] font-semibold text-ink">{value}</span></span>
      <dt className="text-[11px] text-ink-subtle">{label}</dt>
    </div>
  )
}

function ChangelogMore({ entries }: { entries: { v: string; notes: string[] }[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-3 border-t border-line-soft pt-3">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-[11.5px] font-semibold text-ink-secondary transition hover:text-ink">
        Older versions <ChevronDown size={13} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && (
        <div className="mt-2.5 animate-rise space-y-3">
          {entries.map((e) => (
            <div key={e.v}>
              <p className="font-mono text-[11px] font-bold text-ink-secondary">v{e.v}</p>
              <ul className="list-disc space-y-0.5 pl-4 text-[12px] text-ink-secondary">
                {e.notes.map((n) => <li key={n}>{n}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
