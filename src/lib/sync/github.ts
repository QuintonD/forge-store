import type { GithubConfig } from './types'

const API = 'https://api.github.com'

export interface GhResult {
  ok: boolean
  message: string
}

function authHeaders(cfg: GithubConfig): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${cfg.token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }
}

async function ghFetch(cfg: GithubConfig, path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${API}${path}`, { ...init, headers: { ...authHeaders(cfg), ...(init?.headers ?? {}) } })
  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = (await res.json()) as { message?: string }
      if (body.message) detail = body.message
    } catch {
      /* keep status-only detail */
    }
    if (res.status === 401) detail = 'Token rejected (401) — check scopes/expiry'
    else if (res.status === 404) detail = 'Repo or path not found (404)'
    throw new Error(detail)
  }
  return res
}

export async function ghVerify(cfg: GithubConfig): Promise<GhResult> {
  if (!cfg.owner || !cfg.repo || !cfg.token) return { ok: false, message: 'Owner, repo and token are required' }
  try {
    const res = await ghFetch(cfg, `/repos/${cfg.owner}/${cfg.repo}`)
    const body = (await res.json()) as { permissions?: { push?: boolean }; default_branch?: string; private?: boolean }
    if (!body.permissions?.push) return { ok: false, message: 'Token cannot push to this repository' }
    return { ok: true, message: `Connected to ${cfg.owner}/${cfg.repo} (${body.private ? 'private' : 'public'})` }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'Connection failed' }
  }
}

async function headCommitSha(cfg: GithubConfig): Promise<string> {
  const res = await ghFetch(cfg, `/repos/${cfg.owner}/${cfg.repo}/git/ref/heads/${encodeURIComponent(cfg.branch)}`)
  const body = (await res.json()) as { object: { sha: string } }
  return body.object.sha
}

export async function ghListTree(cfg: GithubConfig): Promise<Map<string, string>> {
  const head = await headCommitSha(cfg)
  const res = await ghFetch(cfg, `/repos/${cfg.owner}/${cfg.repo}/git/trees/${head}?recursive=1`)
  const body = (await res.json()) as { tree: { path: string; type: string; sha: string }[] }
  const out = new Map<string, string>()
  const prefix = cfg.dir ? `${cfg.dir.replace(/\/+$/, '')}/` : ''
  for (const node of body.tree ?? []) {
    if (node.type === 'blob' && (!prefix || node.path.startsWith(prefix))) out.set(node.path, node.sha)
  }
  return out
}

export async function gitBlobSha(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text)
  const header = new TextEncoder().encode(`blob ${bytes.byteLength}\0`)
  const payload = new Uint8Array(header.byteLength + bytes.byteLength)
  payload.set(header, 0)
  payload.set(bytes, header.byteLength)
  const digest = await crypto.subtle.digest('SHA-1', payload)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function ghPushFiles(
  cfg: GithubConfig,
  files: { path: string; text: string }[],
  message: string,
): Promise<string> {
  const head = await headCommitSha(cfg)
  const treeNodes: { path: string; mode: '100644'; type: 'blob'; sha: string }[] = []
  for (const file of files) {
    const blobRes = await ghFetch(cfg, `/repos/${cfg.owner}/${cfg.repo}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({ content: file.text, encoding: 'utf-8' }),
    })
    const blob = (await blobRes.json()) as { sha: string }
    treeNodes.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha })
  }
  const treeRes = await ghFetch(cfg, `/repos/${cfg.owner}/${cfg.repo}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: head, tree: treeNodes }),
  })
  const tree = (await treeRes.json()) as { sha: string }
  const commitRes = await ghFetch(cfg, `/repos/${cfg.owner}/${cfg.repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: tree.sha, parents: [head] }),
  })
  const commit = (await commitRes.json()) as { sha: string }
  await ghFetch(cfg, `/repos/${cfg.owner}/${cfg.repo}/git/refs/heads/${encodeURIComponent(cfg.branch)}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha }),
  })
  return commit.sha
}

export async function ghGetFile(cfg: GithubConfig, path: string): Promise<string | null> {
  try {
    const ref = encodeURIComponent(cfg.branch)
    const res = await ghFetch(cfg, `/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=${ref}`, {
      headers: { Accept: 'application/vnd.github.raw' },
    })
    return await res.text()
  } catch {
    return null
  }
}
