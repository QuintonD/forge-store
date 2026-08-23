# Package Sync — investigation & architecture

Status: **shipped as beta** (`/sync`, header indicator, launch-time checks).
Goal: let users mirror Forge packages to locations they control — local folders
and/or their own GitHub repositories — without Forge paying for blob storage.

## Why this matters for bootstrap economics

Forge stores **only lightweight metadata**: catalog entries, SHA-256 manifests,
mapping records (a few KB per user). The heavy bytes (demo artifacts, package
payloads) live in exactly two places:

1. **The user's filesystem** — exported via the File System Access API.
2. **The user's GitHub repository** — committed through the Git Data API.

Marginal storage cost to Forge: ~$0. Bandwidth cost: ~$0 (browser ↔ disk and
browser ↔ GitHub directly; no relay server involved). This is the same shape
Git/LFS-free tooling uses, and it scales with users instead of against them.

## Capability matrix

| Surface | Chrome/Edge | Safari | Firefox |
|---|---|---|---|
| Folder sync (read/write) | yes | no* | no* |
| IndexedDB-persisted folder handles | yes | partial** | no |
| GitHub mirror | yes | yes | yes |

\* `window.showDirectoryPicker` is Chromium-only today; the UI feature-detects
and degrades gracefully (banner on `/sync`, sync icon hidden state stays inert).
\*\* Safari supports OPFS variants but not persistent user-directory handles.

Fallbacks if native support is required later: Tauri/Electron wrapper (real FS
everywhere) or a small signed desktop agent. The engine interface
(`src/lib/sync/engine.tsx`) is transport-agnostic so an agent can slot in
behind the same mapping/diff model.

## How folder sync works

1. **Linking.** User picks a scope (entire library / one category / one app)
   and a folder via `showDirectoryPicker({ mode: 'readwrite' })`. The resulting
   `FileSystemDirectoryHandle` is stored in IndexedDB (`src/lib/sync/idb.ts`) —
   handles are structured-cloneable, so the mapping survives reloads.
   localStorage keeps only the mapping record + SHA-256 baseline manifest.
2. **Launch behavior.** On every app open (`SyncProvider` → `checkOnLaunch`,
   delayed ~900 ms so it never blocks first paint):
   - `queryPermission()` per handle.
     - `granted` → silent scan + three-way diff.
     - `prompt` → we **inform, not nag**: one toast ("Folder sync paused — N
       folders need reconnection") deep-linking to `/sync`. Browsers require a
       user gesture for `requestPermission()`, so auto-granting is impossible
       by design; we surface a single actionable prompt instead.
   - If scans find drift and nothing needs permission: one summary toast.
3. **Diff engine** (`src/lib/sync/diff.ts`). Content-addressed, git-style:
   - Baseline = snapshot of path → {sha256, size} taken at last acknowledged
     sync (stored in localStorage, capped at 2 500 files / 32 MB per file).
   - Fresh scan vs baseline ⇒ `added / modified / deleted` on disk.
   - Catalog packages vs disk ⇒ `pendingExport`.
   - Both sides changed since baseline ⇒ `conflicts` (surfaced, never
     auto-resolved; "Keep local version" re-baselines deliberately).
4. **Export.** Writes `forge.json` (manifest incl. provenance hash +
   fingerprint) and `index.html` (the attested demo artifact) per app into the
   mapped folder. Deterministic manifests — no timestamps — so identical
   versions hash identically across machines.

## How the GitHub mirror works

`src/lib/sync/github.ts` speaks straight to `api.github.com` from the browser:

- Auth: user-supplied fine-grained PAT (scopes: Contents read/write on one
  repo). Stored in localStorage only; CSP `connect-src` allows `api.github.com`
  and nothing else third-party.
- Push: create blobs → create tree (with `base_tree`) → create commit →
  fast-forward branch ref. One commit per push, full message trail.
- Diff for free: remote tree listing returns git blob SHAs; we compute the same
  `sha1("blob <len>\0…")` locally, so comparing libraries is O(1) API calls.
- History/versioning for free: every sync is a commit; rollbacks are `git`.

## Security posture

- Folder handles grant access to **one chosen directory**, scoped by the
  browser; cannot escalate to parent paths.
- Permission is re-checked every session; never requested without a click.
- Demo payloads written to disk are the same ed25519-attested artifacts
  verified by `npm run verify`; manifests embed the artifact sha256.
- Tokens never transit Forge servers (there is no sync server); direct TLS to
  GitHub. Disconnect deletes them from the device.
- Diffs are computed over content hashes — file contents never leave the
  machine except on explicit export/push.

## Cost model

| Item | Forge pays |
|---|---|
| Catalog + manifests (KB/user) | effectively free tier |
| Artifact blobs | $0 (user disk or user repo) |
| Sync bandwidth | $0 (peer-to-browser flows) |
| OAuth device-flow relay (future) | one static Worker, no storage |

## Roadmap

- Two-way pull: import external edits back into the library with conflict UI
  (engine already produces the three-way sets needed).
- GitHub OAuth device flow behind a tiny Worker (removes manual PAT paste).
- Scheduled background sync via PWA periodicsync where available.
- Optional S3/R2 adapter for teams that outgrow repos (same diff model).
