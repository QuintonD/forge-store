import { useState } from 'react'
import { useStore } from '../lib/store'
import { APPS } from '../lib/data'
import { AppIcon } from '../components/AppIcon'
import { InstallButton } from '../components/InstallButton'
import { Link } from 'react-router-dom'
import { Library, PackageOpen, Heart, Download, FolderSync, ArrowRight } from 'lucide-react'
import { formatSize } from '../lib/format'
import { useSeo } from '../lib/seo'

export function LibraryPage() {
  const { installs, wishlist } = useStore()
  const [tab, setTab] = useState<'installed' | 'wishlist'>('installed')
  useSeo({
    title: 'My library',
    description: 'Your installed apps, wishlist and update feed — persisted locally, syncable to your own storage.',
    path: '/library',
  })

  const installed = APPS.filter((a) => installs[a.id])
  const wished = APPS.filter((a) => wishlist.includes(a.id))
  const totalSize = installed.reduce((s, a) => s + a.sizeMB, 0)
  const updates = installed.filter(
    (a) => installs[a.id].status === 'installed' && (installs[a.id] as { version: string }).version !== a.version,
  )
  const list = tab === 'installed' ? installed : wished

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
      <div className="animate-rise flex flex-wrap items-center gap-x-6 gap-y-3">
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
          <Library size={24} className="text-accent-blue" aria-hidden /> My library
        </h1>
        <div className="flex rounded-lg border border-line bg-surface p-1">
          {([['installed', 'Installed', Download], ['wishlist', 'Wishlist', Heart]] as const).map(([id, lbl, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-[13px] font-semibold transition-colors duration-150 ${
                tab === id ? 'bg-canvas text-ink shadow-[inset_0_0_0_1px_rgba(20,20,20,0.08)]' : 'text-ink-secondary hover:text-ink'
              }`}
            >
              <Icon size={13} aria-hidden /> {lbl}
              <span className={`rounded-full px-1.5 font-mono text-[10px] ${tab === id ? 'bg-ink text-white' : 'bg-canvas text-ink-subtle'}`}>
                {id === 'installed' ? installed.length : wished.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {tab === 'installed' && installed.length > 0 && (
        <p className="mt-1 font-mono text-sm text-ink-secondary">
          {installed.length} app{installed.length === 1 ? '' : 's'} installed Â· {totalSize.toFixed(1)} MB on disk
          {updates.length > 0 && (
            <> Â· <span className="font-semibold text-accent-blue">{updates.length} update{updates.length === 1 ? '' : 's'} available</span></>
          )}
        </p>
      )}

      {tab === 'installed' && installed.length > 0 && (
        <Link
          to="/sync"
          className="animate-fade mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line-soft bg-night p-5 text-white transition hover:border-line"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10">
            <FolderSync size={17} aria-hidden />
          </span>
          <span className="min-w-0">
            <b className="block text-sm">Keep these apps in sync with your machine</b>
            <span className="text-xs leading-relaxed text-white/70">
              Export packages to folders on disk or mirror them to your own GitHub repository.
            </span>
          </span>
          <span className="ml-auto flex items-center gap-1.5 rounded-lg border border-white/25 px-3.5 py-2 text-[12.5px] font-semibold transition hover:bg-white/10">
            Set up sync <ArrowRight size={13} aria-hidden />
          </span>
        </Link>
      )}

      {list.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-xl border border-line bg-surface">
            {tab === 'installed' ? <PackageOpen size={28} className="text-ink-subtle" aria-hidden /> : <Heart size={26} className="text-ink-subtle" aria-hidden />}
          </span>
          <p className="text-lg font-bold text-ink">{tab === 'installed' ? 'Your library is empty' : 'Nothing saved yet'}</p>
          <p className="max-w-sm text-sm leading-relaxed text-ink-secondary">
            {tab === 'installed'
              ? 'Install apps from the store and they\u2019ll show up here â€” persisted locally in your browser.'
              : 'Tap the heart on any app to keep track of what you want to try later.'}
          </p>
          <Link to="/" className="mt-2 flex h-10 items-center rounded-lg bg-ink px-6 text-sm font-semibold text-white transition hover:bg-black active:scale-[0.98]">
            Discover software
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((a) => {
            const st = installs[a.id]
            return (
              <div key={a.id} className="card-hover flex items-center gap-3.5 rounded-xl border border-line-soft bg-surface p-4 hover:border-line">
                <AppIcon app={a} size="md" />
                <div className="min-w-0 flex-1">
                  <Link to={`/app/${a.id}`} className="block truncate text-[14px] font-bold text-ink hover:opacity-75">{a.name}</Link>
                  <p className="truncate font-mono text-[11.5px] text-ink-subtle">
                    {tab === 'wishlist' ? (
                      `${a.category} Â· ${formatSize(a.sizeMB)}`
                    ) : (
                      <>
                        v{(st as { version?: string }).version ?? a.version}
                        {st.status === 'installed' && (st as { version: string }).version !== a.version && (
                          <span className="ml-1.5 rounded-full bg-accent-blue/10 px-1.5 py-0.5 text-[9.5px] font-bold tracking-wide text-accent-blue">UPDATE</span>
                        )}
                      </>
                    )}
                  </p>
                </div>
                {tab === 'installed' ? <InstallButton app={a} /> : (
                  <Link to={`/app/${a.id}`} className="shrink-0 rounded-lg border border-line px-4 py-1.5 text-xs font-semibold text-ink transition hover:border-ink">
                    View
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
