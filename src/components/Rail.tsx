import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ChevronLeft } from 'lucide-react'

export function Rail({ title, subtitle, seeAllTo, children }: { title: string; subtitle?: string; seeAllTo?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 480, behavior: 'smooth' })
  return (
    <section className="animate-rise">
      <div className="mb-3 flex items-end justify-between px-0.5">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-ink">{title}</h2>
          {subtitle && <p className="text-xs text-ink-secondary">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {seeAllTo && (
            <Link to={seeAllTo} className="flex items-center text-xs font-semibold text-ink transition hover:opacity-70">
              See all <ChevronRight size={13} aria-hidden />
            </Link>
          )}
          <div className="hidden gap-1 md:flex">
            <button onClick={() => scroll(-1)} aria-label="Scroll left" className="grid h-7 w-7 place-items-center rounded-full border border-line bg-surface text-ink-secondary transition hover:border-ink hover:text-ink active:scale-95">
              <ChevronLeft size={15} aria-hidden />
            </button>
            <button onClick={() => scroll(1)} aria-label="Scroll right" className="grid h-7 w-7 place-items-center rounded-full border border-line bg-surface text-ink-secondary transition hover:border-ink hover:text-ink active:scale-95">
              <ChevronRight size={15} aria-hidden />
            </button>
          </div>
        </div>
      </div>
      <div ref={ref} className="no-scrollbar -mx-1 flex snap-x gap-3 overflow-x-auto scroll-smooth px-1 pb-1">
        {children}
      </div>
    </section>
  )
}
