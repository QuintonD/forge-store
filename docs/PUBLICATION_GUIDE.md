# Publication Guide — step-by-step to production

Companion to [LAUNCH_RUNBOOK](LAUNCH_RUNBOOK.md). This is the operational walkthrough:
each step lists what it does, who executes it (agent vs human), and how to verify.
Steps are ordered so each one unblocks the next.

## Execution status (updated after autonomous run)

| Step | Executor | Result |
|---|---|---|
| 0 · Repo hygiene & push | Agent | ✅ `QuintonD/forge-store` live on GitHub |
| 1A · GitHub Pages deploy | Agent | ✅ **https://quintond.github.io/forge-store/** — deep links verified in browser |
| 1B/1C · Vercel / Netlify upgrade | Human | ⏸ blocked at login wall (no session) — import repo when ready |
| 2 · SITE_URL + sitemap | Agent | ✅ variable set, sitemap regenerated (53 real URLs), seo-nightly green |
| 3 · Content batch | Agent-prepared | ✅ drafts regenerated against live origin, marked APPROVED-READY |
| 4 · Model key | Human | ⏸ optional; agents run deterministic without it |
| 5 · Launch post | Human only | ⏸ copy ready in `content/launch/LAUNCH_COPY.md`; HN blocks automation |

Incidents hit & fixed during the run (all root-caused): missing `@types/node`,
CI verify-before-attest ordering (keys are generated per-run, never committed),
GH Pages needed enabling via API (`build_type=workflow`), repository variables not
auto-exported as env vars (`vars.SITE_URL` passthrough added), and agent-vs-approval
write races (approved drafts are now immutable to agents).

---

## Step 0 — Repo hygiene & version control  `agent · autonomous`

The folder was not a git repository. Before anything can deploy from Git:

1. Create `.gitignore`: excludes `node_modules/`, `dist/`, `attest-keys/`
   (the private signing key must never be published — CI regenerates a demo keypair),
   local logs, OS junk.
2. `git init` → stage → initial commit.
3. `gh repo create <name> --public --source=. --push` (gh CLI is authenticated as
   **QuintonD** with `repo` + `workflow` scopes).

**Verify:** `git log --oneline` shows the commit; `gh repo view` returns the URL;
CI workflow starts on push.

## Step 1 — Deploy  `agent where possible · human for hosted-account options`

Three paths, in preference order:

| Path | How | Auth needed | Security headers |
|---|---|---|---|
| A. GitHub Pages | Actions workflow builds `dist/`, publishes; `404.html` fallback keeps deep links alive | none — uses existing gh token | ⚠️ no custom headers on GH Pages |
| B. Vercel | import via dashboard (browser) or `VERCEL_TOKEN` + CLI | browser OAuth or token | ✅ full CSP/HSTS from `vercel.json` |
| C. Netlify | dashboard drag/import or `NETLIFY_AUTH_TOKEN` + CLI | browser OAuth or token | ✅ full headers from `_headers` |

Path A is fully autonomous and gets the product **live immediately**; B/C upgrade the
header posture later by connecting the same repo (zero code changes needed — both
configs are committed).

**Verify:** deployment URL returns 200 with `<div id="root">`; cold load of
`/app/neon-serpent` resolves (SPA fallback working).

## Step 2 — Origin variable & sitemap regeneration  `agent · autonomous once URL exists`

1. `gh variable set SITE_URL --body "<deployed origin>"`.
2. Dispatch the SEO agent: `gh workflow run agent-seo-nightly.yml` — it regenerates
   `public/sitemap.xml` + audit report against the real origin and opens a drift PR.
3. Merge that PR (or regenerate locally and push).
4. Also update canonical/OG expectations — `src/lib/seo.ts` reads the live origin at
   runtime, so no rebuild change needed beyond the sitemap artifact.

**Verify:** `curl <origin>/sitemap.xml` contains real URLs; `--check` mode passes.

## Step 3 — Content batch approval  `human sign-off · agent-prepared`

Drafts live in `content/queue/`. Per doctrine, agents prepare, a human approves public
posting. Minimal loop:

1. Read `2026-08-23-social.md` and `newsletter-2026-W34.md`.
2. Edit freely or approve as-is.
3. Post to X/Mastodon/newsletter sender of choice (or hand back to an agent runner with
   posting credentials later — deliberately not automated yet).

**Verify:** queue file renamed/marked approved; posts live on their channels.

## Step 4 — Optional model key  `human`

`gh secret set ANTHROPIC_API_KEY` upgrades content drafts from deterministic templates to
model-polished ones. Everything works without it. Skip if budget-tight.

## Step 5 — Launch post  `human voice only`

`content/launch/LAUNCH_COPY.md` holds the claims-ledger-compliant Show HN body, Product
Hunt tagline + first comment, and tweet thread. Posting stays human (founder voice).
Timing guidance: post HN early morning US Eastern, Tuesday–Thursday.

**Verify:** thread links resolve; every claim maps to a SHIPPED ledger row.

---

## Rollback / abort

- Deployment: GH Pages = delete the `github-pages` environment run; Vercel/Netlify =
  instant rollback in dashboard.
- Bad agent PRs: close; agents never force-push and never touch `main` directly except
  append-only content commits.
- Compromised signing key: delete `attest-keys/`, next build regenerates a new pair and
  re-signs (demo posture; KMS before real payments).
