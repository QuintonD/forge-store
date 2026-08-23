export interface DemoAttestation {
  sha256: string
  bytes: number
  fingerprint: string
}

export const ATTESTATIONS: Record<string, DemoAttestation> = {
  'dashboard': { sha256: '4c43f9a2d92834a209d546ca9b857bbeef80de3192be15f9ab0accb6561a3e2c', bytes: 13715, fingerprint: 'sha256:ebcb2dc9845ef405…' },
  'evaldeck': { sha256: '3fba3b22504a448f9ff269d646ea0dca893bcfa03693895a4c058e237e4d633d', bytes: 12180, fingerprint: 'sha256:ebcb2dc9845ef405…' },
  'g2048': { sha256: '0da0bdb246c230a17e7485425637626fc615007f59f5986ded4fe75fcb87397b', bytes: 10241, fingerprint: 'sha256:ebcb2dc9845ef405…' },
  'kanban': { sha256: '3dbf20dd4281202f8a6bc9180d1a0880e397f6aee78e031740c3b45d776dade5', bytes: 10816, fingerprint: 'sha256:ebcb2dc9845ef405…' },
  'snake': { sha256: '59aac9e44e4ffd76edf71111b73045bce551b86e82d4b054fae3da0789dd0c97', bytes: 10118, fingerprint: 'sha256:ebcb2dc9845ef405…' },
  'tui': { sha256: 'e9c2bec0b72c272f8a82ae8df635f69dcbe279f996d137b55e545644b3f81e70', bytes: 11523, fingerprint: 'sha256:ebcb2dc9845ef405…' },
}
