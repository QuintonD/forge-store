import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

const BANNED = [
  ['unleash', 'hype verb banned by content spec 20'],
  ['limitless', 'hype adjective'],
  ['revolutioniz', 'overclaim'],
  ['game-changing', 'cliche overclaim'],
  ['ai revolution', 'generic AI hype'],
  ['next-generation', 'vague superlative'],
  ['supercharg', 'hype verb'],
  ['10x engineer', 'cliche'],
]

const targets = []
function walk(dir) {
  if (!existsSync(dir)) return
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (/\.(md|mdx)$/.test(e.name)) targets.push(p)
  }
}
walk(join(root, 'docs'))
walk(join(root, 'content'))
if (existsSync(join(root, 'README.md'))) targets.push(join(root, 'README.md'))

const violations = []
for (const file of targets) {
  const text = readFileSync(file, 'utf8')
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('ledger-lint:skip')) continue
    for (const [phrase, reason] of BANNED) {
      const re = new RegExp(phrase.replace(/[-]/g, '\\$&'), 'gi')
      let m
      while ((m = re.exec(lines[i])) !== null) {
        violations.push(`${file.replace(root, '')}:${i + 1} - "${m[0]}" (${reason})`)
      }
    }
  }
}

if (violations.length > 0) {
  console.error('ledger lint failed - claims discipline violation:')
  for (const v of violations) console.error(`  ${v}`)
  process.exit(1)
}
console.log('ledger lint clean (' + targets.length + ' files scanned)')
