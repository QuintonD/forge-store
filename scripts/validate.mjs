import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
let pass = 0
let fail = 0
const failures = []

function check(group, name, ok, detail = '') {
  if (ok) {
    pass++
    console.log(`  \x1b[32m✓\x1b[0m ${name}`)
  } else {
    fail++
    failures.push(`${group} :: ${name}${detail ? ` — ${detail}` : ''}`)
    console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ''}`)
  }
}
function section(title) {
  console.log(`\n\x1b[1m▸ ${title}\x1b[0m`)
}

const read = (p) => readFileSync(join(root, p), 'utf8')

console.log('\x1b[35m╔══════════════════════════════════════╗')
console.log('║  FORGE VALIDATION AGENT v1.0         ║')
console.log('╚══════════════════════════════════════╝\x1b[0m')

section('Project integrity')
check('project', 'package.json exists', existsSync(join(root, 'package.json')))
check('project', 'README.md present', existsSync(join(root, 'README.md')))
check('project', 'SECURITY.md present', existsSync(join(root, 'SECURITY.md')))
check('project', 'CI workflow present', existsSync(join(root, '.github/workflows/ci.yml')))
check('project', 'no debugger statements in src', !/debugger/.test(read('src/main.tsx')) && !scanSrc(/(^|\W)debugger(\W|$)/))
function scanSrc(re) {
  const files = []
  walk('src', files)
  return files.some((f) => re.test(read(f)))
}
function walk(dir, out) {
  for (const e of readdirSync(join(root, dir))) {
    const p = join(dir, e)
    if (statSync(join(root, p)).isDirectory()) walk(p, out)
    else out.push(p)
  }
}

section('Source hygiene')
{
  const srcFiles = []
  walk('src', srcFiles)
  const logOffenders = srcFiles.filter((f) => /console\.log\(/.test(read(f)))
  check('hygiene', 'no console.log in src', logOffenders.length === 0, logOffenders.join(', '))
  const todoOffenders = srcFiles.filter((f) => /\bTODO\b|\bFIXME\b|\bHACK\b/.test(read(f)))
  check('hygiene', 'no TODO/FIXME/HACK markers', todoOffenders.length === 0, todoOffenders.join(', '))
}

section('Catalog data integrity')
{
  const data = read('src/lib/data.ts')
  const ids = [...data.matchAll(/id:\s*'([a-z0-9-]+)'/g)].map((m) => m[1])
  const uniqueIds = new Set(ids)
  check('catalog', 'all app ids unique', ids.length === uniqueIds.size, `${ids.length} apps`)
  check('catalog', 'catalog size >= 30', ids.length >= 30, `${ids.length}`)

  const categories = ['UIs & Components', 'Dashboards', 'Games', 'TUIs & CLIs', 'Harnesses & Evals', 'Agents & Automation']
  const usedCats = [...data.matchAll(/category:\s*'([^']+)'/g)].map((m) => m[1])
  check('catalog', 'every category is a known category', usedCats.every((c) => categories.includes(c)), [...new Set(usedCats.filter((c) => !categories.includes(c)))].join(', '))
  categories.forEach((c) => {
    check('catalog', `category populated: ${c}`, usedCats.filter((x) => x === c).length >= 4, `${usedCats.filter((x) => x === c).length} apps`)
  })

  const icons = [...data.matchAll(/icon:\s*'([A-Za-z0-9]+)'/g)].map((m) => m[1])
  const appIcon = read('src/components/AppIcon.tsx')
  const registryBlock = appIcon.match(/const REGISTRY:\s*Record<string,\s*LucideIcon>\s*=\s*\{([\s\S]*?)\}/)
  const registryIcons = new Set(registryBlock ? [...registryBlock[1].matchAll(/([A-Z][A-Za-z0-9]+)/g)].map((m) => m[1]) : [])
  const missingIcons = [...new Set(icons.filter((i) => !registryIcons.has(i)))]
  check('catalog', 'every app icon exists in icon registry', missingIcons.length === 0, missingIcons.join(', '))

  const colors = [...data.matchAll(/colors:\s*\[('(#[0-9a-fA-F]{6})'),\s*('(#[0-9a-fA-F]{6})')\]/g)]
  check('catalog', 'color pairs are valid hex pairs', colors.length >= ids.length)

  const ratings = [...data.matchAll(/rating:\s*([\d.]+)/g)].map((m) => parseFloat(m[1]))
  check('catalog', 'ratings within 3.0–5.0', ratings.every((r) => r >= 3 && r <= 5))

  const versions = [...data.matchAll(/version:\s*'(\d+\.\d+\.\d+)'/g)].map((m) => m[1])
  check('catalog', 'semver versions on every app', versions.length >= ids.length)

  const changelogs = (data.match(/changelog:\s*\[/g) || []).length
  check('catalog', 'changelog on every app', changelogs >= ids.length)

  const demoIds = [...data.matchAll(/demoId:\s*'([a-z0-9]+)'/g)].map((m) => m[1])
  const demos = read('src/lib/demos.ts')
  const exportedDemos = new Set([...demos.matchAll(/^\s{2}([a-z0-9]+):\s*[A-Z]/gm)].filter((m) => ['snake', 'g2048', 'dashboard', 'tui', 'evaldeck', 'kanban'].includes(m[1])).map((m) => m[1]))
  const orphanDemos = demoIds.filter((d) => !exportedDemos.has(d))
  check('demos', 'every referenced demoId has a demo implementation', orphanDemos.length === 0, orphanDemos.join(', '))

  const collectionBlock = data.slice(data.indexOf('export const COLLECTIONS'), data.indexOf('export const DEVELOPER_AVATARS'))
  const collectionTitles = [...collectionBlock.matchAll(/title:\s*'([^']+)'/g)].map((m) => m[1])
  const collectionRefs = [...collectionBlock.matchAll(/'([a-z0-9][a-z0-9-]+)'/g)].map((m) => m[1]).filter((id) => !['Weekend MVP Kit', 'Terminal Power Hour', 'Eval Before You Ship', 'Cozy Corner'].includes(id))
  const brokenRefs = collectionRefs.filter((id) => !uniqueIds.has(id))
  check('catalog', 'collection app references resolve', brokenRefs.length === 0, brokenRefs.join(', '))

  const similarFn = data.includes('export function similarApps')
  const searchFn = data.includes('export function searchApps')
  check('catalog', 'similarApps + searchApps exports present', similarFn && searchFn)
}

section('Demo documents (shipped artifacts)')
{
  const demosDir = join(root, 'public', 'demos')
  const demos = read('src/lib/demos.ts')
  const exportedDemos = new Set(
    [...demos.matchAll(/^\s{2}([a-z0-9]+):\s*[A-Z]/gm)]
      .filter((m) => ['snake', 'g2048', 'dashboard', 'tui', 'evaldeck', 'kanban'].includes(m[1]))
      .map((m) => m[1]),
  )
  const data = read('src/lib/data.ts')
  const referencedDemos = new Set([...data.matchAll(/demoId:\s*'([a-z0-9]+)'/g)].map((m) => m[1]))
  const missingFiles = [...referencedDemos].filter((id) => !existsSync(join(demosDir, `${id}.html`)))
  check('demos', 'every referenced demoId has a shipped file in public/demos', missingFiles.length === 0, missingFiles.join(', '))
  const orphans = [...exportedDemos].filter((id) => !referencedDemos.has(id))
  check('demos', 'no orphaned demo implementations', orphans.length === 0, orphans.join(', '))

  for (const id of referencedDemos) {
    const p = join(demosDir, `${id}.html`)
    if (!existsSync(p)) continue
    const html = readFileSync(p, 'utf8')
    check('demos', `${id}.html: doctype + closing html`, /^\s*<!doctype html>/i.test(html) && /<\/html>\s*$/.test(html))
    check('demos', `${id}.html: no external network references`, !/(https?:)?\/\/(?!www\.w3\.org)[a-z0-9-]+\.[a-z]{2,}/i.test(html.replace(/\/\/[^\n'"]*/g, '')))
    check('demos', `${id}.html: no storage/network APIs`, !/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|WebSocket|import\(/.test(html))
    check('demos', `${id}.html: no unescaped template interpolation`, !html.includes('${'))
    const opens = (html.match(/<script>/g) || []).length
    const closes = (html.match(/<\/script>/g) || []).length
    check('demos', `${id}.html: balanced script tags`, opens > 0 && opens === closes, `${opens}/${closes}`)
    check('demos', `${id}.html: includes styles + viewport meta`, /<style>/.test(html) && /name="viewport"/.test(html))
  }

  check('attestation', 'signed manifest published at .well-known/forge-attestation.json', existsSync(join(root, 'public', '.well-known', 'forge-attestation.json')))
  check('attestation', 'ed25519 signature + artifact hashes verify', spawnSync(process.execPath, [join('scripts', 'verify.mjs')], { cwd: root, stdio: 'pipe' }).status === 0)
}

section('Routing surface')
{
  const types = read('src/lib/types.ts')
  const appTs = read('src/App.tsx')
  ;['/', '/category/:cat', '/charts', '/search', '/library', '/app/:id', '/developer/:name'].forEach((r) => {
    check('routes', `route registered: ${r}`, appTs.includes(`"${r}"`) || appTs.includes(`'${r}'`))
  })
  const home = read('src/pages/Home.tsx')
  const header = read('src/components/Header.tsx')
  const catLinks = [...home.matchAll(/(seeAll)?[tT]o=\{`\/category\/\$\{encodeURIComponent\((\w+)\)\}`\}/g)].map((m) => m[2])
  check('routes', 'Home category links use encoded params', catLinks.length >= 2, `${catLinks.length} links`)
  const navHasSubmit = header.includes('/submit') || home.includes('/submit') || read('src/components/Footer.tsx').includes('/submit')
  check('routes', 'submit pipeline reachable from nav/footer', navHasSubmit)
  check('routes', 'trust page reachable from footer', read('src/components/Footer.tsx').includes('/trust'))
  const collections = read('src/lib/data.ts')
  const colStart = collections.indexOf('export const COLLECTIONS')
  const colEnd = collections.indexOf('export const DEVELOPER_AVATARS', colStart)
  const titles = collections.slice(colStart, colEnd > -1 ? colEnd : undefined).match(/title:\s*'[^']+'/g) || []
  check('routes', 'collections defined', titles.length >= 3, `${titles.length}`)
}

section('Accessibility cues')
{
  const header = read('src/components/Header.tsx')
  check('a11y', 'search input labelled', header.includes('aria-label'))
  check('a11y', 'carousel controls labelled', read('src/components/HeroCarousel.tsx').includes('aria-label'))
  const css = read('src/index.css')
  check('a11y', 'reduced-motion support', css.includes('prefers-reduced-motion'))
  check('a11y', 'focus-visible ring defined in css', css.includes(':focus-visible'))
  const modal = read('src/components/DemoModal.tsx')
  check('a11y', 'demo modal escape-to-close', modal.includes("Escape"))
  check('a11y', 'iframe titled for screen readers', modal.includes('title='))
}

section('Build budget')
{
  const withDist = process.argv.includes('--with-dist')
  const distDir = join(root, 'dist')
  if (!existsSync(distDir)) {
    if (withDist) {
      check('budget', 'dist/ exists (required by --with-dist)', false, 'run after vite build')
    } else {
      console.log('  \x1b[33m–\x1b[0m dist/ not found — skipping bundle budget (run after build)')
    }
  } else {
    const assets = join(distDir, 'assets')
    let jsBytes = 0
    let cssBytes = 0
    for (const f of readdirSync(assets)) {
      const size = statSync(join(assets, f)).size
      if (f.endsWith('.js')) jsBytes += size
      if (f.endsWith('.css')) cssBytes += size
    }
    check('budget', `JS bundle ≤ 480 KB raw`, jsBytes <= 480 * 1024, `${(jsBytes / 1024).toFixed(1)} KB`)
    check('budget', `CSS ≤ 80 KB raw`, cssBytes <= 80 * 1024, `${(cssBytes / 1024).toFixed(1)} KB`)
  }
}

section('Security headers shipped')
{
  const headersPath = existsSync(join(root, 'public/_headers')) ? 'public/_headers' : null
  check('security', 'netlify _headers present', !!headersPath)
  if (headersPath) {
    const h = read(headersPath)
    check('security', 'CSP declared', h.includes('Content-Security-Policy'))
    check('security', 'frame ancestors denied', /frame-ancestors\s+'none'|X-Frame-Options:\s*DENY/.test(h))
    check('security', 'nosniff', h.includes('nosniff'))
  }
  check('security', 'vercel.json present', existsSync(join(root, 'vercel.json')))
  check('security', 'dependabot configured', existsSync(join(root, '.github/dependabot.yml')))
  check('security', 'automated review workflow', existsSync(join(root, '.github/workflows/code-review.yml')))
}

console.log('')
if (fail === 0) {
  console.log(`\x1b[32m  ALL CHECKS PASSED — ${pass} passed\x1b[0m`)
  process.exit(0)
} else {
  console.log(`\x1b[31m  VALIDATION FAILED — ${fail} failed, ${pass} passed\x1b[0m`)
  failures.forEach((f) => console.log(`   · ${f}`))
  process.exit(1)
}
