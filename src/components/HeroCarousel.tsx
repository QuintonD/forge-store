import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Play, ChevronRight, BadgeCheck } from 'lucide-react'
import type { App } from '../lib/types'
import { formatCount } from '../lib/format'
import { categoryAccent } from '../lib/theme'
import { AppIcon } from './AppIcon'
import { Stars } from './Stars'
import { InstallButton } from './InstallButton'
import { useStore } from '../lib/store'

export function HeroCarousel({ apps }: { apps: App[] }) {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setIdx((i) => (i + 1) % apps.length), 7000)
    return () => clearInterval(t)
  }, [apps.length, paused])

  const go = useCallback((n: number) => setIdx((i) => (i + n + apps.length) % apps.length), [apps.length])

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-night bg-night"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative h-[340px] sm:h-[300px]">
        {apps.map((app, i) => (
          <Slide key={app.id} app={app} active={i === idx} />
        ))}
      </div>
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
        {apps.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-200 ${i === idx ? 'w-7 bg-white' : 'w-2.5 bg-white/30 hover:bg-white/60'}`}
          />
        ))}
      </div>
      <button onClick={() => go(-1)} aria-label="Previous" className="group absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 place-items-center rounded-full border border-white/15 p-2 text-white/70 transition hover:text-white sm:grid">
        <ChevronRight size={18} className="rotate-180 transition group-hover:-translate-x-0.5" aria-hidden />
      </button>
      <button onClick={() => go(1)} aria-label="Next" className="group absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 place-items-center rounded-full border border-white/15 p-2 text-white/70 transition hover:text-white sm:grid">
        <ChevronRight size={18} className="transition group-hover:translate-x-0.5" aria-hidden />
      </button>
    </div>
  )
}

function Slide({ app, active }: { app: App; active: boolean }) {
  const { openDemo } = useStore()
  const accent = categoryAccent(app.category)
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-250 ease-out ${active ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      style={{ background: `radial-gradient(130% 160% at 88% -20%, ${accent}66, transparent 62%)` }}
      aria-hidden={!active}
      inert={!active}
    >
      <svg className="absolute bottom-0 left-0 h-[2px] w-full opacity-40" preserveAspectRatio="none" viewBox="0 0 100 1">
        <line x1="0" y1="0.5" x2="100" y2="0.5" stroke={accent} strokeWidth="1" pathLength={1}
          className={active ? 'draw-line' : ''} vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="relative z-10 flex h-full flex-col justify-center gap-6 px-6 py-8 sm:flex-row sm:items-center sm:gap-10 sm:px-12">
        <div className="hidden shrink-0 sm:block"><AppIcon app={app} size="xl" /></div>
        <div className="min-w-0 max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-[10.5px] font-bold tracking-[0.16em] text-white/75">
            {app.editorsChoice ? (<><BadgeCheck size={12} className="text-accent-blue" aria-hidden /> EDITORS&rsquo; CHOICE</>) : 'FEATURED'}
          </span>
          <Link to={`/app/${app.id}`} className="mt-3 block text-3xl font-bold tracking-tight text-white transition hover:opacity-85 sm:text-[34px]">
            {app.name}
          </Link>
          <p className="mt-2 text-sm leading-relaxed text-white/75 sm:text-[15px]">{app.tagline}. {app.description[0].split('.')[0]}.</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-xs text-white/65">
            <span className="flex items-center gap-1.5"><Stars rating={app.rating} size={12} /><b className="text-white">{app.rating.toFixed(1)}</b></span>
            <span>{formatCount(app.downloads)} downloads</span>
            <span className="hidden sm:inline">{app.developer}</span>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <InstallButton app={app} size="lg" />
            {app.demoId && (
              <button
                onClick={() => openDemo(app.id)}
                className="flex h-11 items-center gap-2 rounded-lg border border-white/25 px-6 text-[15px] font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
              >
                <Play size={16} aria-hidden /> Live demo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
