import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { APPS, CATEGORIES, COLLECTIONS } from './lib/catalog.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const siteUrl = (process.env.SITE_URL ?? 'https://forge.example').replace(/\/+$/, '')

const staticRoutes = ['/', '/charts', '/search', '/library', '/sync', '/submit', '/trust']
const today = new Date().toISOString().slice(0, 10)

function urls() {
  const out = staticRoutes.map((r) => ({ loc: `${siteUrl}${r === '/' ? '/' : r}`, priority: r === '/' ? '1.0' : '0.6' }))
  for (const c of CATEGORIES) out.push({ loc: `${siteUrl}/category/${encodeURIComponent(c)}`, priority: '0.8' })
  for (const col of COLLECTIONS) out.push({ loc: `${siteUrl}/collection/${encodeURIComponent(col.title)}`, priority: '0.7' })
  for (const a of [...APPS].sort((x, y) => y.downloads - x.downloads)) {
    out.push({ loc: `${siteUrl}/app/${a.id}`, priority: a.editorsChoice ? '0.9' : '0.7' })
  }
  return out
}

function sitemapXml() {
  const rows = urls().map(
    (u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`,
  )
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</urlset>\n`
}

const target = join(root, 'public', 'sitemap.xml')
const xml = sitemapXml()

if (process.argv.includes('--check')) {
  let committed = ''
  try {
    committed = readFileSync(target, 'utf8')
  } catch {
    console.error('public/sitemap.xml missing — run scripts/agents/seo-audit.mjs to generate')
    process.exit(1)
  }
  if (committed !== xml) {
    console.error('sitemap drift detected — rerun scripts/agents/seo-audit.mjs and commit public/sitemap.xml')
    process.exit(1)
  }
  console.log(`sitemap OK (${urls().length} urls)`)
  process.exit(0)
}

mkdirSync(dirname(target), { recursive: true })
writeFileSync(target, xml)

const report = [
  `# SEO audit — ${today}`,
  ``,
  `- Sitemap: ${urls().length} URLs (${staticRoutes.length} static · ${CATEGORIES.length} categories · ${COLLECTIONS.length} collections · ${APPS.length} app pages)`,
  `- Origin: ${siteUrl} (override with SITE_URL; placeholder is not indexable)`,
  `- robots.txt: present, references /sitemap.xml`,
  `- Canonical strategy: BrowserRouter clean URLs + vercel.json rewrite + Netlify _redirects fallback`,
  `- Structured data: JSON-LD SoftwareApplication injected per app page by src/lib/seo.ts`,
  ``,
  `## Next levers (in priority order)`,
  ``,
  `1. Set SITE_URL secret to the production origin so sitemap/canonicals resolve.`,
  `2. Weekly guide pages ("best AI-built dashboards") from collection data — SEO/Pages agent backlog.`,
  `3. OG images per category via edge function once traffic justifies it.`,
]
mkdirSync(join(root, 'content', 'queue'), { recursive: true })
writeFileSync(join(root, 'content', 'queue', `seo-audit-${today}.md`), report.join('\n'))
console.log(`wrote ${target} (${urls().length} urls)`)
