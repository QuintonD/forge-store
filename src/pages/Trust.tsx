import { Link } from 'react-router-dom'
import { ShieldCheck, Box, KeyRound, RefreshCcw, EyeOff, Activity, Flag, ScrollText } from 'lucide-react'
import { useSeo } from '../lib/seo'

const PILLARS = [
  {
    icon: Box,
    title: 'Sandbox isolation',
    body: 'Demos run in iframes with script execution only â€” no same-origin privileges, no cookies, no storage, no network. A demo cannot read your machine or the store.',
    tag: 'enforced in DemoModal',
  },
  {
    icon: RefreshCcw,
    title: 'Reproducible builds',
    body: 'Every artifact rebuilds byte-for-byte from its published seed and lockfile. What you install is what was reviewed â€” provably.',
    tag: 'verified per release',
  },
  {
    icon: KeyRound,
    title: 'Signed provenance',
    body: 'Each release carries an ed25519-signed attestation: model lineage, prompt lineage, human reviewers and scan results.',
    tag: 'ed25519 / in-toto style',
  },
  {
    icon: ShieldCheck,
    title: 'Continuous scanning',
    body: 'The adversarial battery re-runs against live listings weekly. New CVEs in dependencies trigger automatic re-review within 24 hours.',
    tag: 'weekly cadence',
  },
  {
    icon: EyeOff,
    title: 'Local-first privacy',
    body: 'Installs persist in your browser only. Folder-sync manifests and GitHub tokens never leave your device except to the destination you chose.',
    tag: 'zero telemetry',
  },
  {
    icon: Activity,
    title: 'Honest ratings',
    body: 'Reviews require a verified install. Launch cohorts are screened for rating manipulation; detected rings are removed and published.',
    tag: 'integrity reports public',
  },
]

const SLO = [
  ['Storefront availability', '99.9%', 'monthly'],
  ['Demo runtime availability', '99.5%', 'monthly'],
  ['Median page load (p75)', '< 1.8 s', 'field data'],
  ['Security triage', '< 24 h', 'per report'],
]

export function TrustPage() {
  useSeo({
    title: 'Trust & safety',
    description:
      'Sandbox isolation, reproducible builds, signed provenance and continuous scanning — how Forge holds generated software to a higher standard.',
    path: '/trust',
  })
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="animate-rise">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-accent-green/30 bg-accent-green/[0.06] px-3 py-1 font-mono text-[10.5px] font-bold tracking-[0.18em] text-accent-green">
          <ShieldCheck size={12} aria-hidden /> TRUST &amp; SAFETY
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Generated software, held to a higher standard.
        </h1>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-ink-secondary">
          Model-generated code can be brilliant and wrong at the same time. Forge&rsquo;s entire product is the
          machinery that separates the two: isolation by default, proof over promises, and humans accountable
          for every listing.
        </p>
      </header>

      <section className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PILLARS.map((p) => (
          <article key={p.title} className="card-hover rounded-xl border border-line-soft bg-surface p-5 hover:border-line">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-canvas text-accent-blue"><p.icon size={18} aria-hidden /></span>
            <h2 className="mt-3 text-[15px] font-bold">{p.title}</h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-secondary">{p.body}</p>
            <p className="mt-3 inline-block rounded-full border border-line px-2.5 py-0.5 font-mono text-[10px] tracking-wide text-ink-subtle">{p.tag}</p>
          </article>
        ))}
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-line-soft bg-surface p-6">
          <h2 className="text-lg font-bold tracking-tight">How to report a problem</h2>
          <ol className="mt-3 space-y-3 text-[13px] leading-relaxed text-ink">
            <li className="flex gap-2.5"><b className="text-accent-orange">1.</b> Use â€œReportâ€ on any listing, or email security@forge.example (PGP on the keyserver).</li>
            <li className="flex gap-2.5"><b className="text-accent-orange">2.</b> Triage within 24 hours; critical listings are unlisted immediately pending review.</li>
            <li className="flex gap-2.5"><b className="text-accent-orange">3.</b> You get a finding ID, status page access, and credit in our integrity reports if you want it.</li>
          </ol>
          <p className="mt-4 flex items-start gap-2 rounded-lg border border-[#F97316]/30 bg-[#F97316]/[0.06] p-3.5 text-[12px] leading-snug text-[#B45309]">
            <Flag size={14} className="mt-0.5 shrink-0" aria-hidden />
            Bounties: $500â€“$5,000 for sandbox escapes or provenance forgery. Full scope in SECURITY.md.
          </p>
        </div>
        <aside className="rounded-2xl border border-line-soft bg-surface p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight"><ScrollText size={17} className="text-accent-blue" aria-hidden /> Public SLOs</h2>
          <ul className="mt-3 space-y-2.5">
            {SLO.map(([k, v, w]) => (
              <li key={k} className="flex items-baseline justify-between gap-2 border-b border-dashed border-line-soft pb-2 last:border-0 text-[12.5px]">
                <span className="text-ink-secondary">{k}</span>
                <span className="text-right"><b>{v}</b> <span className="font-mono text-[10.5px] text-ink-subtle">{w}</span></span>
              </li>
            ))}
          </ul>
          <Link to="/submit" className="mt-4 flex h-10 items-center justify-center rounded-lg border border-line text-[13px] font-semibold transition hover:border-ink">
            Ship through the gauntlet &rarr;
          </Link>
        </aside>
      </section>
    </div>
  )
}
