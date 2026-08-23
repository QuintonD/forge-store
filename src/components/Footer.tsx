import { FolderSync, GitFork, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line-soft bg-surface">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden>
              <rect x="7" y="12" width="13" height="13" rx="2.5" fill="#141414" />
              <rect x="12" y="7" width="13" height="13" rx="2.5" fill="#315CFF" fillOpacity="0.92" />
            </svg>
            <b className="text-sm text-ink">Forge</b>
          </div>
          <p className="mt-2.5 max-w-xs text-xs leading-relaxed text-ink-secondary">
            The app store for generated software. Every listing ships with a runnable demo, a seed-stable build and a signed provenance record — and syncs to your own folders or GitHub.
          </p>
        </div>
        <div className="text-xs">
          <p className="mb-2.5 font-bold tracking-widest text-ink-subtle">CATEGORIES</p>
          <ul className="space-y-1.5 text-ink-secondary">
            <li>UIs &amp; Components</li>
            <li>Dashboards</li>
            <li>Games</li>
            <li>TUIs &amp; CLIs</li>
            <li>Harnesses &amp; Evals</li>
            <li>Agents &amp; Automation</li>
          </ul>
        </div>
        <div className="text-xs">
          <p className="mb-2.5 font-bold tracking-widest text-ink-subtle">PLATFORM</p>
          <ul className="space-y-1.5 text-ink-secondary">
            <li><Link to="/submit" className="transition hover:text-ink">Submit software</Link></li>
            <li><Link to="/trust" className="transition hover:text-ink">Trust &amp; safety</Link></li>
            <li><Link to="/charts" className="transition hover:text-ink">Top charts</Link></li>
            <li><Link to="/library" className="transition hover:text-ink">My library</Link></li>
            <li><Link to="/sync" className="flex items-center gap-1.5 transition hover:text-ink"><FolderSync size={12} /> Folder sync <span className="rounded-full border border-line px-1.5 py-px font-mono text-[9px] tracking-wide text-ink-subtle">BETA</span></Link></li>
          </ul>
          <p className="mt-4 text-[11px] leading-snug text-ink-subtle">
            security@forge.example &middot; 24h triage SLA<br />Bounties up to $5,000 for sandbox escapes
          </p>
        </div>
        <div className="text-xs">
          <p className="mb-2.5 font-bold tracking-widest text-ink-subtle">TRUST &amp; SAFETY</p>
          <ul className="space-y-1.5 text-ink-secondary">
            <li className="flex items-center gap-2"><ShieldCheck size={13} className="text-accent-green" aria-hidden /> Sandboxed demo runtime</li>
            <li className="flex items-center gap-2"><ShieldCheck size={13} className="text-accent-green" aria-hidden /> Deterministic reproducible builds</li>
            <li className="flex items-center gap-2"><ShieldCheck size={13} className="text-accent-green" aria-hidden /> Human-reviewed listings</li>
            <li className="flex items-center gap-2"><GitFork size={13} className="text-ink-secondary" aria-hidden /> Open submission pipeline</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line-soft py-4 text-center text-[11px] text-ink-subtle">
        Forge — a concept store for AI-generated software · All demos run locally in your browser
      </div>
    </footer>
  )
}
