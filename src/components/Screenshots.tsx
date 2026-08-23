import type { App } from '../lib/types'

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function rng(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const PANEL = '#F1F0EB'
const PANEL_2 = '#E9E8E2'
const TRACK = '#DDDcd5'

function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <rect width="320" height="200" rx="10" fill="#FFFFFF" />
      <line x1="0" y1="26" x2="320" y2="26" stroke="#E3E2DD" strokeWidth="1" />
      <circle cx="16" cy="13" r="3" fill="#DAD7CF" />
      <circle cx="27" cy="13" r="3" fill="#DAD7CF" />
      <circle cx="38" cy="13" r="3" fill="#C7C7C2" />
      {children}
    </>
  )
}

export function Screenshot({ app, variant }: { app: App; variant: number }) {
  const rand = rng(hash(app.id) + variant * 7919)
  const [c1, c2] = app.colors

  let body: React.ReactNode = null
  const cat = app.category

  if (cat === 'Dashboards') {
    if (variant === 0) {
      const pts: string[] = []
      for (let i = 0; i <= 12; i++) pts.push(`${20 + i * 23},${120 - rand() * 55 - 15}`)
      const d = 'M' + pts.join(' L')
      body = (
        <>
          <rect x="14" y="36" width="70" height="150" rx="6" fill={PANEL} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x="22" y={48 + i * 26} width={40 + rand() * 22} height="7" rx="3.5" fill={i === 0 ? c1 : TRACK} />
          ))}
          <path d={d} fill="none" stroke={c1} strokeWidth="2.5" strokeLinejoin="round" />
          <path d={`${d} L296,186 L20,186 Z`} fill={c1} opacity=".08" />
          <rect x="100" y="36" width="60" height="26" rx="6" fill={PANEL} />
          <rect x="108" y="46" width="28" height="6" rx="3" fill={c2} />
          <rect x="170" y="36" width="60" height="26" rx="6" fill={PANEL} />
          <rect x="178" y="46" width="28" height="6" rx="3" fill={TRACK} />
          <rect x="240" y="36" width="56" height="26" rx="6" fill={PANEL} />
          <rect x="248" y="46" width="28" height="6" rx="3" fill={TRACK} />
        </>
      )
    } else if (variant === 1) {
      body = (
        <>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const hgt = 30 + rand() * 95
            return <rect key={i} x={26 + i * 39} y={168 - hgt} width="24" height={hgt} rx="5" fill={i % 2 ? c1 : c2} opacity={0.45 + (hgt / 130) * 0.55} />
          })}
          <line x1="20" y1="169" x2="300" y2="169" stroke={TRACK} strokeWidth="1.5" />
        </>
      )
    } else {
      body = (
        <>
          <circle cx="105" cy="115" r="52" fill="none" stroke={PANEL_2} strokeWidth="16" />
          <circle cx="105" cy="115" r="52" fill="none" stroke={c1} strokeWidth="16" strokeDasharray={`220 ${326}`} strokeLinecap="round" transform="rotate(-90 105 115)" />
          <text x="105" y="121" textAnchor="middle" fill="#141414" fontSize="19" fontWeight="800">{Math.round(55 + rand() * 30)}%</text>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <circle cx="205" cy={58 + i * 38} r="6" fill={i === 0 ? c2 : TRACK} />
              <rect x="222" y={54 + i * 38} width={50 + rand() * 45} height="8" rx="4" fill={PANEL_2} />
            </g>
          ))}
        </>
      )
    }
  } else if (cat === 'Games') {
    if (variant === 0) {
      body = (
        <>
          {Array.from({ length: 7 }, (_, r) =>
            Array.from({ length: 11 }, (_, cI) => {
              const on = rand() > 0.62
              return on ? <rect key={`${r}${cI}`} x={18 + cI * 26} y={42 + r * 21} width="21" height="16" rx="3.5" fill={rand() > 0.5 ? c1 : c2} opacity={0.35 + rand() * 0.65} /> : null
            }),
          )}
          <circle cx="160" cy="185" r="7" fill="#141414" opacity=".85" />
        </>
      )
    } else if (variant === 1) {
      const segs: React.ReactNode[] = []
      let x = 60
      let y = 100
      for (let i = 0; i < 14; i++) {
        segs.push(<rect key={i} x={x - 9} y={y - 9} width="18" height="18" rx="5" fill={i === 0 ? '#141414' : c1} opacity={1 - i * 0.05} />)
        x += 17
        y += Math.sin(i * 0.8) * 14
      }
      body = (
        <>
          <g opacity=".12">
            {Array.from({ length: 13 }, (_, i) => <line key={'v' + i} x1={i * 26} y1="0" x2={i * 26} y2="200" stroke={c2} />)}
            {Array.from({ length: 9 }, (_, i) => <line key={'hh' + i} x1="0" y1={i * 24} x2="320" y2={i * 24} stroke={c2} />)}
          </g>
          {segs}
          <circle cx="250" cy="70" r="9" fill="#D97706" />
        </>
      )
    } else {
      body = (
        <>
          {['#E76F51', '#F4A261', '#E9C46A', '#2E7D6B', c1, c2, '#7A5CFA'].map((col, i) => (
            <rect key={i} x={92 + (i % 2) * 70} y={40 + Math.floor(i / 2) * 38} width="64" height="32" rx="6" fill={col} opacity={0.9} />
          ))}
          <rect x="92" y="186" width="134" height="8" rx="4" fill={PANEL_2} />
        </>
      )
    }
  } else if (cat === 'TUIs & CLIs') {
    const lines = [0.95, 0.7, 0.82, 0.55, 0.88, 0.4, 0.75, 0.62]
    body = (
      <>
        <text x="18" y="44" fontFamily="monospace" fontSize="10" fill={c1}>$ warpfile ~/forge</text>
        {lines.map((w, i) => (
          <g key={i}>
            <rect x="18" y={54 + i * 17} width={90 + w * 150} height="7" rx="3.5" fill={i % 3 === 0 ? c1 : i % 3 === 1 ? TRACK : c2} opacity={i % 3 === 0 ? 0.95 : 0.85} />
            {i === 3 && <rect x={96 + w * 150} y="105" width="9" height="11" fill="#141414" />}
          </g>
        ))}
      </>
    )
  } else if (cat === 'Harnesses & Evals') {
    body = (
      <>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const pass = rand() > 0.25
          return (
            <g key={i}>
              <rect x="20" y={40 + i * 26} width="280" height="19" rx="6" fill={PANEL} />
              <circle cx="33" cy={49.5 + i * 26} r="4.5" fill={pass ? '#2E7D6B' : '#DC2626'} />
              <rect x="46" y={46 + i * 26} width={70 + rand() * 110} height="7" rx="3.5" fill={TRACK} />
              <rect x="256" y={46 + i * 26} width="30" height="7" rx="3.5" fill={pass ? c1 : '#DC2626'} opacity=".85" />
            </g>
          )
        })}
      </>
    )
  } else {
    body = (
      <>
        {[
          [40, 55], [150, 40], [245, 70],
          [80, 125], [190, 118], [270, 148],
        ].map(([x, y], i) => (
          <g key={i}>
            {i > 0 && <line x1={[40, 150, 245, 80, 190][i - 1] + 26} y1={[55, 40, 70, 125, 118][i - 1] + 11} x2={x} y2={y + 11} stroke={TRACK} strokeWidth="1.5" />}
            <rect x={x} y={y} width="52" height="22" rx="7" fill={i % 2 ? PANEL : c1} opacity={i % 2 ? 1 : 0.92} />
          </g>
        ))}
      </>
    )
  }

  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" role="img" aria-label={`${app.name} screenshot ${variant + 1}`}>
      <defs>
        <linearGradient id={`bg-${app.id}-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c1} stopOpacity=".07" />
          <stop offset="1" stopColor={c2} stopOpacity=".03" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" rx="10" fill={`url(#bg-${app.id}-${variant})`} />
      <Chrome>{body}</Chrome>
      <rect width="320" height="200" rx="10" fill="none" stroke="#E3E2DD" strokeWidth="1" />
    </svg>
  )
}

export function ShotStrip({ app, onOpen }: { app: App; onOpen?: () => void }) {
  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
      {[0, 1, 2].map((v) => {
        const playable = !!app.demoId && v === 0
        const inner = (
          <>
            <Screenshot app={app} variant={v} />
            {playable && (
              <span className="absolute inset-0 grid place-items-center bg-white/60 text-xs font-bold tracking-widest text-ink opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
                ▶ RUN LIVE DEMO
              </span>
            )}
          </>
        )
        const cls = 'group relative h-[188px] w-[300px] shrink-0 overflow-hidden rounded-xl border border-line-soft transition-colors duration-150 hover:border-line'
        return playable ? (
          <button key={v} onClick={onOpen} className={`${cls} cursor-pointer`} aria-label={`Run live demo of ${app.name}`}>
            {inner}
          </button>
        ) : (
          <figure key={v} className={cls}>
            {inner}
          </figure>
        )
      })}
    </div>
  )
}
