# Forge — The Store for Generated Software

A production-grade app store concept for AI-generated software: UIs & components, dashboards,
games, TUIs & CLIs, eval harnesses, and agents. Built with **Vite + React 19 + TypeScript +
Tailwind CSS v4**.

## Highlights

- **34-app catalog** across 6 categories with rich copy, ratings, changelogs, tags and
  deterministic seeded reviews.
- **Six fully runnable live demos**, each a self-contained HTML app streamed into a sandboxed
  iframe (`sandbox="allow-scripts"`, opaque origin, zero network):
  - Neon Serpent — playable synthwave snake (canvas, beat-synced obstacles)
  - 2048 ∞ — full sliding-merge implementation with animated tiles
  - Pulse Analytics — live-ticking analytics dashboard (SVG charts, KPIs, event feed, anomaly toasts)
  - Warpfile — keyboard-driven terminal file manager (j/k/l/h, `/` fuzzy filter, dual panes)
  - EvalDeck — interactive LLM-eval harness runner with streaming verdicts and pass-rate ring
  - Kanbanly — drag-and-drop kanban board with WIP limits and flow suggestions
- **Install system**: animated download progress, installed/update states, localStorage
  persistence, uninstall, library stats.
- **Package sync (beta)**: link any scope — whole library, a category, or a single app — to a
  folder on disk (File System Access API, persisted handles in IndexedDB) and/or mirror it to
  the user's own GitHub repo (Git Data API, user PAT, zero server). Launch-time permission
  checks with inform-don't-nag toasts, client-side SHA-256 three-way diffing, conflict
  surfacing, deterministic `forge.json` manifests. Forge stores metadata only — artifact bytes
  live on user disk / user repos. See [docs/SYNC.md](docs/SYNC.md).
- **Full store UX**: hero carousel, category browsing with sort/filter, top charts,
  curated collections, instant search (`/` shortcut), app detail pages with procedural SVG
  screenshots, rating histograms, reviews, changelog accordion, provenance panel, similar apps.
- **Generative Canvas design system**: light editorial canvas (#F7F6F2), Geist type,
  per-category accents + abstract motif artwork, borders-over-shadows, meaningful 120–250 ms
  motion (line-draw reveals, -1px card lifts), reduced-motion support.

## Develop

```bash
npm install
npm run dev       # generates demos + serves on http://localhost:5173 (node ≥ 23.6)
npm run validate  # validation agent (90 executable gates)
npm run attest    # regenerate demo files + sign ed25519 attestation
npm run verify    # verify artifact hashes + signature (exit code gates CI)
npm run build     # attest → validate → typecheck → build → verify → post-build budgets
npm run preview   # serve the production build
```

Requires Node ≥ 23.6 (native TypeScript stripping for build scripts).

## Production pipeline

Every change passes a **validation agent** (`scripts/validate.mjs`, 90 executable checks:
catalog integrity, shipped-demo sandbox safety, route reachability, accessibility cues,
bundle budgets, security surface) wired into `prebuild`/`postbuild` and CI — including an
**ed25519 attestation gate** that cryptographically verifies every demo artifact against the
published manifest (`public/.well-known/forge-attestation.json`, `npm run verify`). PRs get
an **adversarial LLM code review** across correctness, security, a11y, UX and performance
lenses, plus Dependabot and dependency audit.

Security posture, threat model, incident response and bounty program: [SECURITY.md](SECURITY.md).
Reliability SLOs & error-budget policy: [docs/RELIABILITY.md](docs/RELIABILITY.md).
Full gate/promotion flow: [docs/PIPELINE.md](docs/PIPELINE.md).
Business/financial/marketing plans: [docs/](docs). Agent-run operations model
(12-agent staffing plan, CI wiring, 90-day rollout): [docs/AI_OPERATIONS.md](docs/AI_OPERATIONS.md).
Production go-live state and the remaining one-time human steps: [docs/LAUNCH_RUNBOOK.md](docs/LAUNCH_RUNBOOK.md).

In-product trust surfaces: `/submit` (the five-stage developer gauntlet), `/trust`
(sandbox isolation, reproducible builds, signed provenance, public SLOs), per-app **data
safety panels** and **cryptographic provenance receipts** on every listing with a runnable
demo.

## Structure

```
src/
  lib/
    data.ts        # app catalog, collections, search
    types.ts       # shared types
    demos.ts       # demo artifact loaders (HTML shipped in public/demos)
    theme.ts       # Generative Canvas tokens: category accents, motifs, art URLs
    reviews.ts     # seeded review + histogram generation
    store.tsx      # install state, toasts, demo modal context
    sync/          # folder sync engine: fsa adapter, idb handles, diff, github mirror
    format.ts      # number/date formatting
  components/      # header, hero, cards, rails, icons, screenshots, modal, toasts
  pages/           # Home, Browse, Charts, Search, Library, AppDetail, Sync, Submit, Trust
```
