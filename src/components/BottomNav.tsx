import { NavLink } from 'react-router-dom'
import { Sparkles, Search, FolderSync, Library } from 'lucide-react'

const TABS = [
  { to: '/', label: 'Discover', icon: Sparkles, end: true },
  { to: '/search', label: 'Search', icon: Search, end: false },
  { to: '/library', label: 'Library', icon: Library, end: false },
  { to: '/sync', label: 'Sync', icon: FolderSync, end: false },
]

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line-soft bg-canvas/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-4">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-semibold transition-colors duration-150 ${
                isActive ? 'text-ink' : 'text-ink-subtle hover:text-ink-secondary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`grid h-7 w-12 place-items-center rounded-full transition-colors duration-150 ${isActive ? 'bg-line-soft' : ''}`}>
                  <Icon size={18} aria-hidden />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
