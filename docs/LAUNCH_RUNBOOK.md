# Launch Runbook — production publication

State: **everything below the line is done and green.** The remaining human steps are
deliberately irreducible (trust-critical by policy, see AI_OPERATIONS §4).

## Done — autonomous (no human required)

| Area | Status | Evidence |
|---|---|---|
| Build pipeline | attest → validate → typecheck → build → verify all green | `npm run build`, 90/90 checks |
| Bundle budgets | JS 421.9 KB ≤ 480 · CSS within 80 KB | postbuild gates |
| Security headers | CSP, nosniff, DENY framing, HSTS on Vercel + Netlify | `vercel.json`, `public/_headers` |
| SPA deep links | BrowserRouter + Vercel rewrite + Netlify `_redirects` | `/app/neon-serpent` resolves cold |
| SEO surface | robots.txt, 53-URL sitemap, per-route titles/descriptions, JSON-LD (`WebSite`+`SearchAction` home, `SoftwareApplication` per app) | `public/sitemap.xml`, `src/lib/seo.ts` |
| PWA baseline | manifest, theme color, SVG icon, installable standalone | `public/manifest.webmanifest` |
| Claims discipline | ledger linter in CI; banned-hype scan across docs/content | `scripts/agents/ledger-lint.mjs` |
| Content supply | social drafts (4), newsletter W34, weekly report, SEO audit generated from catalog | `content/queue/`, `content/reports/` |
| Agent fleet | 5 workflows: gauntlet (PR evidence), seo-nightly (drift PRs), social (queue commits), sentinel (daily patrol → auto-issue), analyst (weekly report) | `.github/workflows/agent-*.yml` |
| Sync beta | folder sync + GitHub mirror shipped behind /sync | `docs/SYNC.md` |

## Remaining human steps (one-time, ~30 minutes)

1. **Deploy:** connect repo to Vercel (or Netlify) — both configs are committed. First
   deploy is the publication moment.
2. **Domain:** set the production origin as the `SITE_URL` repository variable, then run
   *agent-seo-nightly → workflow_dispatch* once so the sitemap regenerates with real URLs.
3. **Approve first content batch:** review `content/queue/2026-08-23-social.md` +
   `newsletter-2026-W34.md`; edit or approve-as-is and post.
4. **Optional richness:** add `ANTHROPIC_API_KEY` secret to upgrade deterministic drafts to
   model-polished drafts (agents degrade gracefully without it).
5. **Launch post:** the HN/PH copy lives in `content/launch/`. Post manually — founder
   voice stays human per doctrine.

## Ongoing human cadence (minutes/week, not hours)

- Daily ≤10 min: approve/clear the social queue batch.
- Weekly 15 min: read Analyst Monday report, pick the single experiment.
- On sentinel issue: confirm takedown/reinstatement (SLA <1 h for critical).
- Per listing PR: human reviewer signature (stages 4–5 of the gauntlet).

## Verification commands

```bash
npm run validate        # 90 content/security/a11y/route gates
node scripts/agents/ledger-lint.mjs   # claims discipline over docs+content
node scripts/agents/sentinel.mjs      # attestation + demo safety patrol
node scripts/agents/seo-audit.mjs --check   # sitemap drift
npm run build           # full pipeline incl. budgets
```
