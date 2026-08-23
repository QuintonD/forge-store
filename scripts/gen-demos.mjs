import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DEMOS } from './demo-sources.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'demos')
mkdirSync(outDir, { recursive: true })

for (const [id, html] of Object.entries(DEMOS)) {
  const target = join(outDir, `${id}.html`)
  writeFileSync(target, html)
  console.log(`wrote public/demos/${id}.html (${(html.length / 1024).toFixed(1)} KB)`)
}
console.log('done')
