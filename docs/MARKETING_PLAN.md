# Forge — Marketing Plan

**Positioning:** *The store where every app runs before you install.* We are not selling
apps; we are selling **confidence in generated software**, demonstrated in one click.

## 1. Audiences (ICPs)

| Persona | Who | Pain | Hook |
|---|---|---|---|
| Indie hacker "Priya" | Ships side-projects weekly | Zero distribution for tiny tools | "Your demo is your storefront — free" |
| Agency lead "Marcus" | Delivers client dashboards fast | Procurement distrust of AI output | Provenance badges + reproducible builds |
| Platform engineer "Dana" | Curates internal tooling | Shadow-AI governance risk | Team catalogs with audit trail |
| Consumer tinkerer | Wants novel toys/games | App stores all look the same | Play-in-page demos, zero install friction |

## 2. Message architecture

- Category 0: **Demo-first distribution.**
- Tone: engineer-honest. Never "10x AI revolution" <!-- ledger-lint:skip (anti-example) -->; always "here it running, here's the
  scan report". That standard applies to our own marketing first.

### Claims ledger (kept in sync with SECURITY.md)

| Proof point | Status | Evidence |
|---|---|---|
| Sandboxed runnable demos (6 live) | **SHIPPED** | `public/demos/*.html`, sandboxed opaque-origin iframes |
| Signed demo artifacts (ed25519) + public verify CLI | **SHIPPED** | `npm run verify`, `.well-known/forge-attestation.json` |
| Security headers / CSP / sandbox enforcement | **SHIPPED** | `_headers`, `vercel.json`, validation agent |
| Validation agent gates on every build | **SHIPPED** | `scripts/validate.mjs`, wired prebuild/postbuild/CI |
| Wishlist, installs, updates, library | **SHIPPED** | in-product, localStorage-backed |
| 85/15 revenue share | **POLICY** | terms of the beta program; no payments rail yet |
| Five-stage submission gauntlet | **DESIGNED** | pipeline spec; human intake not open yet |
| Reproducible full-app builds from seed (beyond demos) | **ROADMAP Q1–Q2** | attestation covers demos today |
| Reviews bound to verified installs | **ROADMAP** | current reviews are seeded demo content |
| Public SLOs with real telemetry | **ROADMAP** | SLO definitions published; measurement infra pending |

Rule: nothing ships in marketing copy above its ledger status. The HN launch story leads
with what is SHIPPED and says so.

## 3. Channels & plays

| Channel | Play | Cadence | KPI |
|---|---|---|---|
| Developer socials (X/Twitter, Mastodon) | Demo GIFs of new listings, build-log threads | 3×/wk | follower→visit CVR |
| Hacker News / Product Hunt | Launch: "A store where every app runs in the listing" | Day-1 moment + Show-HN for pipeline OSS pieces | top-3 finish |
| SEO program pages | `/category/*`, per-app pages, "best AI-built X" guides | 20 pages/mo from catalog data | organic ≥45% of signups by M9 |
| YouTube/Shorts | "Runs in the listing" 30-second demo cuts | 2/wk | view→WAU |
| Newsletter — *Fresh Generations* | Weekly curation of top new listings | weekly | open ≥48% |
| OSS + Discord | Open-source the validation agent + attestation CLI; community review corps | continuous | contributors, review throughput |
| Partnerships | Co-marketing deals with model providers (negotiated, non-dependent) | Y2 | referral installs |

## 4. Launch plan

1. **Phase 0 — Private beta (weeks 1–6):** 25 design partners recruited first (agencies +
   platform teams = the Marcus/Dana wedge), then 500 invited devs, 100 listings target.
   Instrument funnel end-to-end (opt-in, privacy-preserving events) before any public
   moment. **Beta-exit gate: 3 paying Studio teams, 25 listings with signed builds,
   demo→install measurable** — not a WAU vanity number.
2. **Phase 1 — Public beta moment (week 7+):** HN + PH, founder builds in public; PR hook =
   the claims ledger ("everything on this page is running in the repo — here's the verify
   command").
3. **Phase 2 — Category expansion (months 3–6):** weekly themed drops ("Dashboard Week"),
   paid amplification only behind proven CAC ≤ $38 with payback ≤ 7 mo.
4. **Phase 3 — Embed flywheel (months 6–12):** "try-it-here" embeddable widgets on dev blogs
   → every embed is distribution.

### Retention loops (mechanisms, not vibes)

- Update notifications for installed apps (shipped: UPDATE badges + library).
- Follow-the-developer graph → new-listing digests (roadmap Q2).
- Wishlist re-engagement when a saved app ships its demo or update (wishlist shipped).
- *Fresh Generations* weekly digest keyed to installed categories.
- Streak mechanics around daily-seed games (2048 ∞ / Wordforge) as consumer pull.

## 5. Budget ($132k Y1, phased; scales to $300k/yr only after payback gates)

| Line | Y1 $/yr |
|---|---|
| Paid acquisition (gated on measured payback ≤ 7 mo) | 45k |
| Content & SEO production | 35k |
| Launch events + bounty credits | 22k |
| Creator partnerships (dev YouTube) | 20k |
| Tools/analytics | 10k |

## 6. KPIs & targets

Every KPI below is instrumented or explicitly marked unmeasured-yet; no unfalsifiable
targets.

| Metric | Beta exit | Month 12 |
|---|---|---|
| WAU | 2.5k | 10k |
| Demo→install conversion (opt-in instrumented) | baseline established | ≥22% sustained |
| D30 user retention | baseline established | ≥35% |
| Organic share of signups | ≥50% early (paid off) | ≥45% |
| Listings with runnable demo | ≥60% | ≥75% |
| Paying Studio teams | 3 | 40 |

Weekly growth review owns one question: *which stage of the funnel is weakest, and what is
the single experiment running against it?* Kill or scale experiments in 2-week cycles.
