import type { Snapshot, SnapshotEntry, PackageFile } from './types'

export interface DiffResult {
  added: string[]
  modified: string[]
  deleted: string[]
  pendingExport: string[]
  conflicts: string[]
  scannedAt: number
}

function changedSinceBaseline(baseline: Record<string, SnapshotEntry>, current: Record<string, SnapshotEntry>): Set<string> {
  const out = new Set<string>()
  for (const [path, cur] of Object.entries(current)) {
    const base = baseline[path]
    if (!base) {
      out.add(path)
    } else if (cur.hash && base.hash && cur.hash !== base.hash) {
      out.add(path)
    }
  }
  return out
}

export function diffAgainstSnapshot(baseline: Snapshot | null, current: Record<string, SnapshotEntry>): DiffResult {
  const base = baseline?.files ?? {}
  const added: string[] = []
  const modified: string[] = []
  for (const [path, cur] of Object.entries(current)) {
    const b = base[path]
    if (!b) added.push(path)
    else if (cur.hash && b.hash && cur.hash !== b.hash) modified.push(path)
  }
  const deleted = Object.keys(base).filter((p) => !(p in current))
  return { added, modified, deleted, pendingExport: [], conflicts: [], scannedAt: Date.now() }
}

export function withPackageDelta(
  diff: DiffResult,
  baseline: Snapshot | null,
  packages: PackageFile[],
  packageHashes: Map<string, string>,
  current: Record<string, SnapshotEntry>,
): DiffResult {
  const prefix = packages[0]?.path.split('/')[0]?.concat('/') ?? ''
  const pendingExport: string[] = []
  const conflicts: string[] = []
  const diskTouched = changedSinceBaseline(baseline?.files ?? {}, current)

  for (const pkg of packages) {
    const rel = pkg.path.startsWith(prefix) ? pkg.path.slice(prefix.length) : pkg.path
    const diskEntry = current[pkg.path]
    const wantedHash = packageHashes.get(pkg.path) ?? ''
    const onDiskMatches = diskEntry && diskEntry.hash && diskEntry.hash === wantedHash
    if (!onDiskMatches) pendingExport.push(rel)

    const baselineEntry = baseline?.files?.[pkg.path]
    const baselineMatchedWanted =
      baselineEntry && baselineEntry.hash && baselineEntry.hash === wantedHash
    const localEdit = [...diskTouched].some((p) => p === pkg.path)
    if (!baselineMatchedWanted && localEdit && !onDiskMatches) conflicts.push(rel)
  }

  return { ...diff, pendingExport, conflicts }
}
