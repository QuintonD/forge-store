import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { createHash, generateKeyPairSync, sign, createPublicKey } from 'node:crypto'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const keysDir = join(root, 'attest-keys')
const demosDir = join(root, 'public', 'demos')
const privPath = join(keysDir, 'priv.pem')
const pubPath = join(keysDir, 'pub.pem')

if (!existsSync(privPath) || !existsSync(pubPath)) {
  mkdirSync(keysDir, { recursive: true })
  const { privateKey, publicKey } = generateKeyPairSync('ed25519')
  writeFileSync(privPath, privateKey.export({ type: 'pkcs8', format: 'pem' }))
  writeFileSync(pubPath, publicKey.export({ type: 'spki', format: 'pem' }))
  console.log('generated new ed25519 keypair in attest-keys/ (DEMO-ONLY key — use KMS in production)')
}

const privPem = readFileSync(privPath, 'utf8')
const pubPem = readFileSync(pubPath, 'utf8')

if (!existsSync(demosDir)) {
  console.error('public/demos missing — run `npm run gen:demos` first')
  process.exit(1)
}

const manifest = readdirSync(demosDir)
  .filter((f) => f.endsWith('.html'))
  .sort()
  .map((f) => {
    const buf = readFileSync(join(demosDir, f))
    return {
      id: f.replace(/\.html$/, ''),
      bytes: buf.length,
      sha256: createHash('sha256').update(buf).digest('hex'),
    }
  })

if (manifest.length === 0) {
  console.error('no demo files found in public/demos')
  process.exit(1)
}

const canonical = JSON.stringify({ manifest })
const signature = sign(null, Buffer.from(canonical, 'utf8'), privPem)
const fingerprint = createHash('sha256').update(createPublicKey(pubPem).export({ type: 'spki', format: 'der' })).digest('hex')

const attestation = {
  algorithm: 'ed25519',
  keyFingerprint: `sha256:${fingerprint}`,
  signedAt: new Date().toISOString(),
  manifest,
  signature: signature.toString('base64'),
}

const wellKnown = join(root, 'public', '.well-known')
mkdirSync(wellKnown, { recursive: true })
writeFileSync(join(wellKnown, 'forge-attestation.json'), JSON.stringify(attestation, null, 2))

const tsEntries = manifest.map((m) => `  '${m.id}': { sha256: '${m.sha256}', bytes: ${m.bytes}, fingerprint: 'sha256:${fingerprint.slice(0, 16)}…' },`).join('\n')
const genDir = join(root, 'src', 'generated')
mkdirSync(genDir, { recursive: true })
writeFileSync(
  join(genDir, 'attestations.ts'),
  `export interface DemoAttestation {\n  sha256: string\n  bytes: number\n  fingerprint: string\n}\n\nexport const ATTESTATIONS: Record<string, DemoAttestation> = {\n${tsEntries}\n}\n`,
)

console.log(`signed ${manifest.length} artifacts · key sha256:${fingerprint.slice(0, 16)}…`)
for (const m of manifest) console.log(`  ✓ ${m.id} ${m.sha256.slice(0, 12)}…`)
