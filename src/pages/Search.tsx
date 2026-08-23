import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Sparkles, X } from 'lucide-react'
import { searchApps, APPS } from '../lib/data'
import { BrowseCard } from './Browse'
import { useSeo } from '../lib/seo'

const SUGGESTIONS = ['snake', 'dashboard', 'terminal', 'evals', 'finance', 'cozy']

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  useSeo({
    title: q ? `Search: ${q}` : 'Search generated software',
    description: 'Search the Forge catalog of runnable AI-generated apps, tools and agents.',
    path: '/search',
  })
  const [draft, setDraft] = useState(q)
  const inputRef = useRef<HTMLInputElement>(null)
  const results = q ? searchApps(q) : []

  useEffect(() => {
    setDraft(q)
  }, [q])

  useEffect(() => {
    if (!q) inputRef.current?.focus()
  }, [q])

  const submit = (value: string) => {
    const v = value.trim()
    if (v) setParams({ q: v })
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(draft)
        }}
        className="animate-rise flex h-14 items-center gap-3 rounded-xl border border-line bg-surface px-4 transition-colors duration-150 focus-within:border-ink"
      >
        <Search size={17} className="shrink-0 text-ink-subtle" aria-hidden />
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Search generated software â€” try â€œsnakeâ€ or â€œdashboardâ€"
          aria-label="Search apps"
          className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-subtle"
        />
        {draft && (
          <button type="button" onClick={() => { setDraft(''); setParams({}); inputRef.current?.focus() }} aria-label="Clear search">
            <X size={15} className="text-ink-subtle transition hover:text-ink" aria-hidden />
          </button>
        )}
        <button type="submit" className="hidden h-10 shrink-0 items-center rounded-lg bg-ink px-5 text-[13px] font-semibold text-white transition hover:bg-black active:scale-[0.98] sm:flex">
          Search
        </button>
      </form>

      {!q && (
        <div className="mt-8 animate-fade text-center">
          <p className="text-sm text-ink-secondary">Popular right now</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => { setDraft(s); submit(s) }} className="rounded-full border border-line bg-surface px-4 py-1.5 font-mono text-[13px] text-ink transition hover:border-ink active:scale-95">
                #{s}
              </button>
            ))}
          </div>
          <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...APPS].sort((a, b) => b.downloads - a.downloads).slice(0, 3).map((a) => (
              <BrowseCard key={a.id} app={a} />
            ))}
          </div>
          <p className="mt-8 flex items-center justify-center gap-1.5 font-mono text-xs text-ink-subtle"><Sparkles size={12} className="text-accent-purple" aria-hidden /> searching {APPS.length} listings across 6 categories</p>
        </div>
      )}

      {q && (
        <>
          <div className="mt-6 animate-rise">
            <h1 className="text-2xl font-bold tracking-tight">
              Results for &ldquo;{q}&rdquo;
            </h1>
            <p className="mt-0.5 font-mono text-sm text-ink-secondary">{results.length} app{results.length === 1 ? '' : 's'} found</p>
          </div>
          {results.length === 0 ? (
            <div className="mt-16 flex flex-col items-center gap-3 text-center">
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#C7C7C2" strokeWidth="1.2" aria-hidden>
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
                <path d="M8.5 11h5M11 8.5v5" strokeLinecap="round" />
              </svg>
              <p className="text-lg font-bold text-ink">Nothing generated matches that</p>
              <p className="max-w-sm text-sm leading-relaxed text-ink-secondary">Try one of the popular tags above, or browse by category from the Discover tab.</p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((a) => <BrowseCard key={a.id} app={a} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
