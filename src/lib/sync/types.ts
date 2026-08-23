export type SyncScope =
  | { kind: 'app'; appId: string }
  | { kind: 'category'; category: string }
  | { kind: 'library' }

export interface SyncMapping {
  id: string
  label: string
  scope: SyncScope
  target: 'folder'
  folderName?: string
  createdAt: number
  lastSyncAt?: number
}

export interface SnapshotEntry {
  hash: string
  size: number
}

export interface Snapshot {
  at: number
  files: Record<string, SnapshotEntry>
}

export type FolderStatus = 'unlinked' | 'needs-permission' | 'ready' | 'scanning' | 'working' | 'error'

export interface DiffResult {
  added: string[]
  modified: string[]
  deleted: string[]
  pendingExport: string[]
  conflicts: string[]
  scannedAt: number
}

export interface MappingState {
  status: FolderStatus
  error?: string
  fileCount?: number
  diff?: DiffResult
}

export interface ActivityEvent {
  at: number
  kind: 'info' | 'sync' | 'warn' | 'error'
  message: string
}

export interface GithubConfig {
  owner: string
  repo: string
  branch: string
  dir: string
  token: string
}

export interface PackageFile {
  path: string
  text: string
}
