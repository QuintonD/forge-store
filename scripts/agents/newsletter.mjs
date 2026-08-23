import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { editorsPicks, topDownloads, freshest, COLLECTIONS, getApp, stamp, isoWeek, catalogStats } from './lib/catalog.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const outDir = join(root, 'content', 'queue')
mkdirSync(outDir, { recursive: true })

const url = (path = '') => `${process.env.SITE_URL ?? 'https://forge.example'}${path}`
const { year, week } = isoWeek()

const compact = (n) => Intl.NumberFormat('en', { notation: 'compact' }).format(n)
const line = (a) => `- [${a.name}](${url(`/app/${a.id}`)}) — ${a.tagline} · ${a.rating.toFixed(1)}★ · ${compact(a.downloads)} installs`

const spotlight = COLLECTIONS[0]
const spotlightApps = spotlight.ids.slice(0, 4).map((id) => getApp(id)).filter(Boolean)

const body = [
  `# Fresh Generations — Week ${week}, ${year}`,
  ``,
  `_The weekly digest of generated software that actually runs. Every link plays in your browser before you install anything._`,
  ``,
  `## Editors' picks`,
  ``,
  ...editorsPicks().slice(0, 3).map(line),
  ``,
  `## Trending now`,
  ``,
  ...topDownloads(5).map(line),
  ``,
  `## Just updated`,
  ``,
  ...freshest(4).map(line),
  ``,
  `## Collection spotlight: ${spotlight.title}`,
  ``,
  `_${spotlight.blurb}_`,
  ``,
  ...spotlightApps.map(line),
  ``,
  `[Browse the full collection](${url(`/collection/${encodeURIComponent(spotlight.title)}`)})`,
  ``,
  `---`,
  ``,
  `Catalog pulse: ${['listings', 'runnableDemos', 'collections', 'avgRating'].map((k) => `${k.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${catalogStats()[k]}`).join(' · ')}`,
  ``,
  `You're receiving this because you opted in during beta. Unsubscribe: reply "stop".`,
]

const target = join(outDir, `newsletter-${year}-W${String(week).padStart(2, '0')}.md`)
if (existsSync(target) && readFileSync(target, 'utf8').includes('APPROVED-READY')) {
  console.log(`skipped ${target} — approved draft is immutable to agents`)
  process.exit(0)
}
writeFileSync(target, body.join('\n'))
console.log(`wrote ${target}`)
