import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { createHash, verify, createPublicKey } from 'node:crypto'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const attestationPath = join(root, 'public', '.well-known', 'forge-attestation.json')
const pubPath = join(root, 'attest-keys', 'pub.pem')
const demosDir = join(root, 'public', 'demos')

let failures = 0

if (!existsSync(attestationPath)) {
  console.error('✗ no attestation found — run `npm run attest`')
  process.exit(1)
}
if (!existsSync(pubPath)) {
  console.error('✗ no verification key at attest-keys/pub.pem')
  process.exit(1)
}

const doc = JSON.parse(readFileSync(attestationPath, 'utf8'))
const pubPem = readFileSync(pubPath, 'utf8')

const canonical = JSON.stringify({ manifest: doc.manifest })
const sigOk = verify(
  null,
  Buffer.from(canonical, 'utf8'),
  pubPem,
  Buffer.from(doc.signature, 'base64'),
)
console.log(`${sigOk ? '✓' : '✗'} signature over manifest verifies against attest-keys/pub.pem`)
if (!sigOk) failures++

const actual = new Map(
  existsSync(demosDir)
    ? readdirSync(demosDir).filter((f) => f.endsWith('.html')).map((f) => {
        const buf = readFileSync(join(demosDir, f))
        return [f.replace(/\.html$/, ''), buf]
      })
    : [],
)

for (const entry of doc.manifest) {
  const buf = actual.get(entry.id)
  if (!buf) {
    console.log(`✗ ${entry.id}: listed but missing on disk`)
    failures++
    continue
  }
  const h = createHash('sha256').update(buf).digest('hex')
  const sizeOk = buf.length === entry.bytes
  if (h === entry.sha256 && sizeOk) {
    console.log(`✓ ${entry.id} ${entry.sha256.slice(0, 12)}… (${entry.bytes} B)`)
  } else {
    console.log(`✗ ${entry.id}: hash/size mismatch — artifact drifted after signing`)
    failures++
  }
  actual.delete(entry.id)
}

for (const [id] of actual) {
  console.log(`✗ ${id}: on disk but not covered by the manifest — re-run \`npm run attest\``)
  failures++
}

console.log(failures === 0 ? '\nATTESTATION VALID' : `\nATTESTATION INVALID — ${failures} failure(s)`)
process.exit(failures === 0 ? 0 : 1)
