import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const findings = []

function check(name, ok, detail = '') {
  if (!ok) findings.push({ name, detail })
  console.log(`${ok ? '\x1b[32mok\x1b[0m' : '\x1b[31mFAIL\x1b[0m'} ${name}${detail ? ` — ${detail}` : ''}`)
}

check('attestation verify', spawnSync(process.execPath, [join('scripts', 'verify.mjs')], { cwd: root, stdio: 'pipe' }).status === 0)

const demosDir = join(root, 'public', 'demos')
const demoFiles = existsSync(demosDir) ? readdirSync(demosDir).filter((f) => f.endsWith('.html')) : []
for (const f of demoFiles) {
  const html = readFileSync(join(demosDir, f), 'utf8')
  check(`${f}: doctype`, /^\s*<!doctype html>/i.test(html))
  check(`${f}: no network refs`, !/(https?:)?\/\/(?!www\.w3\.org)[a-z0-9-]+\.[a-z]{2,}/i.test(html.replace(/\/\/[^\n'"]*/g, '')))
  check(`${f}: no storage APIs`, !/localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|WebSocket|import\(/.test(html))
}

if (findings.length > 0) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  mkdirSync(join(root, 'content', 'queue'), { recursive: true })
  writeFileSync(
    join(root, 'content', 'queue', `incident-${ts}.md`),
    [
      `# Incident draft — sentinel findings ${ts}`,
      ``,
      `Sentinel auto-drafted this report; a human confirms takedown/reinstatement decisions.`,
      ``,
      ...findings.map((f) => `- **${f.name}** ${f.detail}`),
    ].join('\n'),
  )
  console.error(`sentinel: ${findings.length} finding(s) — incident draft written`)
  process.exit(1)
}
console.log('sentinel: all gates green')
