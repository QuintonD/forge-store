import type { SnapshotEntry } from './types'

export interface FsWritableLike {
  write(data: BufferSource | Blob | string): Promise<void>
  close(): Promise<void>
}

export interface FsFileHandleLike {
  kind: 'file'
  name: string
  getFile(): Promise<File>
  createWritable(options?: { keepExistingData?: boolean }): Promise<FsWritableLike>
}

export interface FsDirHandleLike {
  kind: 'directory'
  name: string
  queryPermission?(descriptor: { mode: 'read' | 'readwrite' }): Promise<PermissionState>
  requestPermission?(descriptor: { mode: 'read' | 'readwrite' }): Promise<PermissionState>
  values(): AsyncIterableIterator<FsFileHandleLike | FsDirHandleLike>
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FsDirHandleLike>
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FsFileHandleLike>
  removeEntry?(name: string, options?: { recursive?: boolean }): Promise<void>
}

declare global {
  interface Window {
    showDirectoryPicker?: (options?: { id?: string; mode?: 'read' | 'readwrite' }) => Promise<FsDirHandleLike>
  }
}

const MAX_FILES = 2500
const MAX_FILE_BYTES = 32 * 1024 * 1024
const MAX_DEPTH = 12

export function fsaSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function' && typeof crypto !== 'undefined' && !!crypto.subtle
}

export async function pickDirectory(id: string): Promise<FsDirHandleLike | null> {
  if (!fsaSupported()) return null
  try {
    return await window.showDirectoryPicker!({ id, mode: 'readwrite' })
  } catch {
    return null
  }
}

export async function permissionFor(handle: FsDirHandleLike, request: boolean): Promise<PermissionState> {
  try {
    const q = handle.queryPermission?.({ mode: 'readwrite' }) ?? Promise.resolve('granted')
    const state = await q
    if (state === 'granted' || !request) return state
    return (await handle.requestPermission?.({ mode: 'readwrite' })) ?? state
  } catch {
    return 'denied'
  }
}

async function hashBytes(buf: BufferSource): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', buf)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function sha256Text(text: string): Promise<string> {
  return hashBytes(new TextEncoder().encode(text))
}

export interface ScanOutcome {
  files: Record<string, SnapshotEntry>
  truncated: boolean
}

export async function scanDirectory(root: FsDirHandleLike): Promise<ScanOutcome> {
  const files: Record<string, SnapshotEntry> = {}
  let truncated = false

  async function walk(dir: FsDirHandleLike, prefix: string, depth: number): Promise<void> {
    if (depth > MAX_DEPTH) return
    for await (const entry of dir.values()) {
      if (Object.keys(files).length >= MAX_FILES) {
        truncated = true
        return
      }
      if (entry.kind === 'directory') {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await walk(entry as FsDirHandleLike, `${prefix}${entry.name}/`, depth + 1)
          if (truncated) return
        }
      } else {
        const path = `${prefix}${entry.name}`
        try {
          const file = await (entry as FsFileHandleLike).getFile()
          let hash = ''
          if (file.size <= MAX_FILE_BYTES) {
            hash = await hashBytes(await file.arrayBuffer())
          }
          files[path] = { hash, size: file.size }
        } catch {
          files[path] = { hash: '', size: -1 }
        }
      }
    }
  }

  await walk(root, '', 0)
  return { files, truncated }
}

export async function writeFiles(root: FsDirHandleLike, files: { path: string; text: string }[]): Promise<void> {
  for (const f of files) {
    const segments = f.path.split('/').filter(Boolean)
    const name = segments.pop()!
    let dir = root
    for (const seg of segments) dir = await dir.getDirectoryHandle(seg, { create: true })
    const fileHandle = await dir.getFileHandle(name, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(f.text)
    await writable.close()
  }
}
