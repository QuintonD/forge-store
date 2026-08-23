import type { App } from './types'

function hashSeed(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const NAMES = [
  'quietops', 'marisol.v', 'dkt_dev', 'Ana Petrova', 'juno_writes', 'Tomás Reyes', 'hexley_fan',
  'Priya N.', 'null_ptr', 'sam@work', 'Yuki Tanabe', 'grumpy_admin', 'Lena Kovač', 'ferris_wheel',
  'Omar Haddad', 'tiny_ship', 'Rosa Delgado', 'kernelspace', 'Femi Adeyemi', 'mira_q', 'Sten Larsen',
]

const POSITIVE = [
  'Replaced two paid tools on day one. The {thing} alone is worth it.',
  'I did not expect to keep this past the weekend and I have not opened the old one since.',
  '{thing} is genuinely clever \u2014 you can tell someone iterated on the boring details.',
  'Setup took four minutes. Four. The defaults are better than my old config after years of tuning.',
  'This is what generated software should feel like: opinionated, small, fast.',
  'Our whole team switched within a week. The {thing} sold the skeptics.',
  'Runs cold on my laptop and never gets warm. Whatever they compiled, it works.',
  'The changelog cadence is wild. Fixes land before I finish writing the bug report.',
]

const MIXED = [
  'Great core, but I wish {thing} had more options. Still installed, still daily-driving it.',
  'Love it overall. Docked a star because {thing} tripped me up the first week.',
  'Almost perfect \u2014 needs one more pass on {thing}, then it\u2019s five stars.',
  'The happy path is flawless. Edge cases occasionally surprise, but updates come fast.',
]

const THINGS: Record<string, string> = {
  Dashboards: 'anomaly alerts',
  Games: 'endless mode',
  'UIs & Components': 'token theming',
  'TUIs & CLIs': 'fuzzy search',
  'Harnesses & Evals': 'run-diff viewer',
  'Agents & Automation': 'receipt approvals',
}

export interface Review {
  user: string
  rating: number
  daysAgo: number
  text: string
  helpfulCount: number
}

export function reviewsFor(app: App): Review[] {
  const rand = mulberry32(hashSeed(app.id))
  const count = 6 + Math.floor(rand() * 3)
  const usedNames = new Set<string>()
  const reviews: Review[] = []
  for (let i = 0; i < count; i++) {
    let name = NAMES[Math.floor(rand() * NAMES.length)]
    while (usedNames.has(name)) name = NAMES[Math.floor(rand() * NAMES.length)] + '.'
    usedNames.add(name)
    const roll = rand()
    let rating: number
    if (app.rating >= 4.7) rating = roll < 0.82 ? 5 : roll < 0.95 ? 4 : 3
    else if (app.rating >= 4.4) rating = roll < 0.62 ? 5 : roll < 0.9 ? 4 : 3
    else rating = roll < 0.45 ? 5 : roll < 0.8 ? 4 : 3
    const pool = rating >= 4 ? POSITIVE : MIXED
    const tmpl = pool[Math.floor(rand() * pool.length)]
    const thing = THINGS[app.category] ?? 'onboarding'
    reviews.push({
      user: name,
      rating,
      daysAgo: Math.max(1, Math.floor(rand() * app.updatedDaysAgo + rand() * 40)),
      text: tmpl.replace('{thing}', thing),
      helpfulCount: Math.floor(rand() * (rating <= 3 ? 260 : 140)) + (rating === 5 || rating === 1 ? 12 : 2),
    })
  }
  return reviews.sort((a, b) => a.daysAgo - b.daysAgo)
}

export function histogramFor(app: App): number[] {
  const rand = mulberry32(hashSeed(app.id) ^ 0x9e3779b9)
  const buckets = [0, 0, 0, 0, 0]
  const weights = [0.72, 0.18, 0.06, 0.025, 0.015]
  const skew = (5 - app.rating) * 0.35
  buckets[0] = Math.max(0.05, weights[0] - skew)
  buckets[1] = weights[1] + skew * 0.55
  buckets[2] = weights[2] + skew * 0.25
  buckets[3] = weights[3]
  buckets[4] = weights[4]
  const total = buckets.reduce((s, b) => s + b, 0)
  const result = buckets.map((b) => Math.round((b / total) * app.ratingCount))
  const diff = app.ratingCount - result.reduce((s, b) => s + b, 0)
  result[0] += diff
  void rand
  return result.reverse()
}
