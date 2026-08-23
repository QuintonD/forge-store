import { useMemo } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { APPS } from '../lib/data'
import { BrowseCard } from './Browse'
import { useSeo } from '../lib/seo'

export function DeveloperPage() {
  const { name = '' } = useParams()
  const dev = decodeURIComponent(name)
  const apps = useMemo(() => APPS.filter((a) => a.developer === dev), [dev])
  useSeo({
    title: dev,
    description: apps[0] ? `${dev} — generated software studio on Forge. ${apps.length} listings including ${apps[0].name}.` : undefined,
    path: `/developer/${encodeURIComponent(name)}`,
  })

  if (apps.length === 0) return <Navigate to="/" replace />

  const totalDownloads = apps.reduce((s, a) => s + a.downloads, 0)
  const avgRating = apps.reduce((s, a) => s + a.rating, 0) / apps.length
  const categories = [...new Set(apps.map((a) => a.category))]
  const initial = dev.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase()

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <header className="animate-rise flex flex-col items-center gap-4 rounded-2xl border border-line-soft bg-surface p-7 text-center sm:flex-row sm:text-left">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-ink text-xl font-bold text-white">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] font-semibold tracking-[0.22em] text-ink-subtle">GENERATED SOFTWARE STUDIO</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{dev}</h1>
          <p className="mt-1 font-mono text-sm text-ink-secondary">
            {apps.length} listing{apps.length === 1 ? '' : 's'} · {categories.join(', ')}
          </p>
        </div>
        <dl className="flex gap-8 sm:ml-auto">
          <div><dt className="font-mono text-[10px] tracking-widest text-ink-subtle">DOWNLOADS</dt><dd className="text-lg font-bold tabular-nums">{(totalDownloads / 1000).toFixed(0)}k</dd></div>
          <div><dt className="font-mono text-[10px] tracking-widest text-ink-subtle">AVG RATING</dt><dd className="text-lg font-bold tabular-nums">{avgRating.toFixed(2)}</dd></div>
        </dl>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[...apps].sort((a, b) => b.downloads - a.downloads).map((a) => <BrowseCard key={a.id} app={a} />)}
      </div>
    </div>
  )
}
