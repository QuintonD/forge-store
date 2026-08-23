import { APPS } from '../lib/data'
import { AppRow } from '../components/AppCard'
import { useSeo } from '../lib/seo'

export function Charts() {
  useSeo({
    title: 'Top charts',
    description: 'The most installed, highest rated and freshest AI-generated software across all Forge categories.',
    path: '/charts',
  })
  const free = [...APPS].sort((a, b) => b.downloads - a.downloads)
  const rated = [...APPS].sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount)
  const fresh = [...APPS].sort((a, b) => a.updatedDaysAgo - b.updatedDaysAgo)

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <div className="animate-rise">
        <h1 className="text-2xl font-bold tracking-tight">Top charts</h1>
        <p className="mt-0.5 font-mono text-sm text-ink-secondary">Ranked across all Forge categories Â· rebuilt with every catalog release</p>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {[
          { title: 'Most installed', list: free },
          { title: 'Highest rated', list: rated },
          { title: 'Fresh updates', list: fresh },
        ].map((sec) => (
          <section key={sec.title} className="animate-rise rounded-2xl border border-line-soft bg-surface p-3.5">
            <h2 className="mb-2 px-1 text-sm font-bold tracking-wide text-ink">{sec.title}</h2>
            <div className="space-y-0.5">
              {sec.list.slice(0, 12).map((a, i) => (
                <AppRow key={a.id} app={a} rank={i + 1} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
