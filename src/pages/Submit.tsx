import { Link } from 'react-router-dom'
import { ScanLine, BugPlay, FileSignature, Eye, Rocket, CheckCircle2, ArrowRight, Timer, ShieldCheck } from 'lucide-react'
import { useSeo } from '../lib/seo'

const STAGES = [
  {
    icon: ScanLine,
    name: 'Static analysis',
    sla: '< 2 min',
    color: '#315CFF',
    checks: [
      'Dependency audit (no known CVEs at high or above)',
      'Secret and credential scanning on the full tree',
      'License compliance against the allow-list',
      'Bundle budget: â‰¤ 480 KB gzipped per app',
    ],
  },
  {
    icon: BugPlay,
    name: 'Sandbox detonation',
    sla: '~ 6 min',
    color: '#7A5CFA',
    checks: [
      '8,000-prompt adversarial battery in an ephemeral VM',
      'Network egress must be exactly zero by default',
      'Filesystem and process escape attempts recorded',
      'Resource ceilings: CPU, memory, spawn rate',
    ],
  },
  {
    icon: FileSignature,
    name: 'Provenance attestation',
    sla: '< 1 min',
    color: '#2E7D6B',
    checks: [
      'Reproducible build from a pinned seed + lockfile',
      'Model lineage recorded: model, prompts, human edits',
      'SLSA-style in-toto attestation signed with ed25519',
      'Deterministic rebuild verified byte-for-byte',
    ],
  },
  {
    icon: Eye,
    name: 'Human review',
    sla: '< 48 h',
    color: '#B45309',
    checks: [
      'Two independent reviewers for listings and claims',
      'UX critic pass: clarity, honesty of screenshots',
      'Accessibility spot-audit (keyboard, contrast, labels)',
      'Ratings-integrity screen on launch cohorts',
    ],
  },
  {
    icon: Rocket,
    name: 'Signed release',
    sla: 'instant',
    color: '#1D3557',
    checks: [
      'Immutable versioned artifact published to CDN edge',
      'Storefront badge shows build provenance to users',
      'Automatic rollback target pinned for 30 days',
      'Continuous re-scan weekly while listed',
    ],
  },
]

const REQUIREMENTS = [
  ['Runnable demo', 'Every listing ships a self-contained demo that runs offline in the store sandbox.'],
  ['Reproducible seed', 'A one-line seed that regenerates the artifact bit-for-bit.'],
  ['Privacy manifest', 'Declare every permission; anything undeclared is treated as a violation.'],
  ['Honest screenshots', 'Screenshots are captured from real builds â€” marketing fiction gets rejected.'],
  ['Accessibility statement', 'Keyboard support, contrast ratios and reduced-motion behavior documented.'],
  ['Takedown contact', 'A monitored channel with a 24-hour response SLA.'],
]

export function SubmitPage() {
  useSeo({
    title: 'Submit software',
    description:
      'Ship generated software through the five-stage gauntlet: static analysis, sandbox detonation, provenance attestation, human review and signed release.',
    path: '/submit',
  })
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="animate-rise rounded-2xl border border-line-soft bg-night p-7 text-white sm:p-10">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 font-mono text-[10.5px] font-bold tracking-[0.18em] text-white/80">
          <ShieldCheck size={12} className="text-accent-green" aria-hidden /> DEVELOPER PIPELINE
        </p>
        <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Ship generated software people can trust.
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/75">
          Every submission runs the Forge gauntlet: static analysis, adversarial sandbox detonation,
          cryptographic provenance, human review and signed release. The same pipeline gates our own
          storefront changes &mdash; nothing ships around it.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/trust" className="flex h-11 items-center gap-2 rounded-lg bg-white px-6 text-[15px] font-semibold text-ink transition hover:bg-white/90 active:scale-[0.98]">
            Read the trust model <ArrowRight size={16} aria-hidden />
          </Link>
          <button
            onClick={() => document.getElementById('stages')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="flex h-11 items-center rounded-lg border border-white/25 px-6 text-[15px] font-semibold transition hover:bg-white/10 active:scale-[0.98]"
          >
            See the five stages
          </button>
        </div>
      </header>

      <section id="stages" className="mt-10 scroll-mt-28">
        <h2 className="text-lg font-bold tracking-tight">The gauntlet</h2>
        <p className="mt-0.5 text-sm text-ink-secondary">Five sequential gates. Fail any one and the submission stops until it&rsquo;s fixed.</p>

        <ol className="mt-5 space-y-3">
          {STAGES.map((s, i) => (
            <li key={s.name} className="card-hover relative overflow-hidden rounded-xl border border-line-soft bg-surface p-5 hover:border-line sm:p-6">
              <div className="absolute inset-y-0 left-0 w-1" style={{ background: s.color }} aria-hidden />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: `${s.color}14`, color: s.color }}>
                  <s.icon size={18} aria-hidden />
                </span>
                <h3 className="text-[16px] font-bold">{i + 1}. {s.name}</h3>
                <span className="flex items-center gap-1 rounded-full border border-line px-2.5 py-0.5 font-mono text-[10.5px] font-semibold text-ink-secondary">
                  <Timer size={10} aria-hidden /> SLA {s.sla}
                </span>
                <span className="ml-auto hidden font-mono text-[11px] tracking-widest text-ink-subtle sm:block">STAGE {i + 1} / 5</span>
              </div>
              <ul className="mt-3.5 grid gap-2 pl-1 sm:grid-cols-2">
                {s.checks.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-[12.5px] leading-snug text-ink">
                    <CheckCircle2 size={13} className="mt-0.5 shrink-0" style={{ color: s.color }} aria-hidden />
                    {c}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Submission requirements</h2>
          <p className="mt-0.5 text-sm text-ink-secondary">Six things every listing must have before entering the gauntlet.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {REQUIREMENTS.map(([t, d]) => (
              <div key={t} className="rounded-xl border border-line-soft bg-surface p-4">
                <p className="flex items-center gap-2 text-[13px] font-bold"><CheckCircle2 size={14} className="text-accent-green" aria-hidden />{t}</p>
                <p className="mt-1.5 text-[12px] leading-snug text-ink-secondary">{d}</p>
              </div>
            ))}
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.05] p-5">
            <p className="font-mono text-xs font-bold tracking-widest text-accent-green">LAUNCH PRICING</p>
            <ul className="mt-3 space-y-2.5 text-[12.5px]">
              <li className="flex justify-between text-ink"><span>Listing + pipeline</span><b>Free</b></li>
              <li className="flex justify-between text-ink"><span>Pro developer tools</span><b>$19/mo</b></li>
              <li className="flex justify-between text-ink"><span>Studio (teams, SSO)</span><b>$99/mo</b></li>
              <li className="flex justify-between border-t border-line pt-2.5 text-ink"><span>Paid-app revenue share</span><b className="text-accent-green">85% / 15%</b></li>
            </ul>
            <p className="mt-3 text-[11px] leading-snug text-ink-secondary">Developers keep 85% &mdash; versus 70% on legacy stores. Free during beta.</p>
          </div>
          <div className="rounded-xl border border-line-soft bg-surface p-5">
            <p className="font-mono text-xs font-bold tracking-widest text-ink-subtle">SLAs WE SIGN</p>
            <ul className="mt-3 space-y-2 text-[12.5px]">
              <li className="flex justify-between text-ink"><span>Review decision</span><b>&lt; 48 h</b></li>
              <li className="flex justify-between text-ink"><span>Security report triage</span><b>&lt; 24 h</b></li>
              <li className="flex justify-between text-ink"><span>Takedown action</span><b>&lt; 1 h</b></li>
              <li className="flex justify-between text-ink"><span>Storefront uptime</span><b>99.9%</b></li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  )
}
