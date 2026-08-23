# Forge — AI-Agent Operations (the staffing plan)

Companion to [BUSINESS_PLAN](BUSINESS_PLAN.md) and [MARKETING_PLAN](MARKETING_PLAN.md).
Those documents define the strategy; this one defines **who executes it** — and almost
every "who" is an agent. Headcount does not scale with catalog or channel count;
agent budgets do.

## 0. Operating principles

1. **Agents propose, humans dispose** on trust-critical paths: listing approvals,
   claims-ledger changes, public statements above routine cadence, takedowns. Everything
   else is full-auto with sampling audits.
2. **Everything lands as a PR.** Agent output (copy, pages, review packets, docs fixes)
   opens PRs. Free audit trail, instant rollback, and the existing CI gauntlet applies to
   agent work same as human work.
3. **Claims-ledger gate binds agents.** Marketing/content agents may only assert proof
   points whose status is SHIPPED in MARKETING_PLAN §2. A nightly linter diffs published
   copy against the ledger; violations auto-open a revert PR.
4. **Every agent has a contract:** trigger, inputs, outputs, success metric, spend cap,
   human checkpoint, kill switch. No contract, no deploy.
5. **Cost floor first.** Static CDN hosting, user-owned storage (see [SYNC](SYNC.md)),
   small models for high-volume tasks, frontier models only where judgment pays for itself.

## 1. The agent roster

### Supply side — grow the catalog

| # | Agent | Trigger | Output | Human checkpoint | Metric |
|---|---|---|---|---|---|
| 1 | **Intake** | New submission PR/form entry | Completed listing draft: copy from spec, procedural screenshots, tags ≤3, semver + changelog lint, `validate.mjs` green | Approve/merge | Submissions→listed ≥80% without human edits |
| 2 | **Gauntlet Runner** | Listing PR opened | Stage 1–3 evidence bundle: dep audit, secret scan, sandbox detonation log, reproducible-build hash match, signed attestation | Only on failures | % listings fully auto-cleared (target 85%) |
| 3 | **Critic** | Attestation passed | UX/a11y/honesty scorecard: screenshot-vs-build diff, contrast audit, tag spam, description drift | Borderline scores (<threshold) queued | Dispute rate <5%; post-install refund/complaint proxy |

Review capacity math: stages 1–3 are pure automation (Gauntlet Runner). Critic replaces
one human reviewer; humans remain reviewer #2 on everything (trust positioning demands a
human signature — it's the moat, don't automate it away).

### Demand side — distribution

| # | Agent | Trigger | Output | Human checkpoint | Metric |
|---|---|---|---|---|---|
| 4 | **SEO/Pages** | Catalog change (nightly) | Programmatic pages (`/category/*`, per-app, comparison/guide pages from collection data), sitemap, internal links — all as PRs to the static build | Weekly sampled review | Indexed pages, organic share ≥45% by M9 |
| 5 | **Social/Release** | New listing / update merged | Draft post set: demo cut captions, build-log thread, changelog note — queued in approval buffer | One daily batch approval (≤10 min) | Follower→visit CVR |
| 6 | **Newsletter** | Weekly cron | *Fresh Generations* issue: top listings by demo-play velocity, personalized section variants per category segment | Auto-sends; monthly sample audit | Open ≥48%, click→demo-play |
| 7 | **Embed Scout** | Weekly crawl | Finds blogs/repos discussing generated apps → outreach draft + ready-to-paste embed snippet for the try-it widget | Approve sends | Live embeds; embed-attributed installs |

### Trust, safety, retention

| # | Agent | Trigger | Output | Human checkpoint | Metric |
|---|---|---|---|---|---|
| 8 | **Sentinel** | Continuous | Weekly adversarial re-scan of live listings, CVE watcher on dependency feeds, rating-anomaly ring detection. On finding: auto-unlist + incident draft + DSA/transparency-report entry staged | Triage within SLA; human confirms reinstatement | Time-to-unlist <1 h; false-positive rate |
| 9 | **Support** | Inbound question | Docs-grounded answers (SECURITY/SYNC/PIPELINE/TRUST pages are the corpus); unresolved threads become suggested docs PRs | Escalation after 2 failed resolutions | Self-serve resolution ≥70% |
| 10 | **Retention** | Behavior triggers (opt-in) | Wishlist-ship alerts, update digests keyed to installed categories, daily-seed game streak nudges | Copy templates approved quarterly | D30 retention ≥35% target |

### Meta — the loop that improves the loop

| # | Agent | Trigger | Output | Notes |
|---|---|---|---|---|
| 11 | **Analyst** | Monday cron | Funnel report against MARKETING_PLAN §6 tables; names the weakest stage and proposes the single experiment for the week (the plan's rule: one experiment, 2-week kill/scale cycle) | Founder reviews in 15 min instead of running analytics |
| 12 | **Budget Guard** | Continuous | Per-agent token/API spend tracking with hard monthly caps; auto-throttle then kill switch; cost-per-listing and cost-per-installed-user rollup | Caps reviewed monthly |

## 2. Wiring into this repo (implemented)

```
.github/workflows/
  ci.yml                  # validate + ledger lint + build + budgets on every PR/push
  agent-gauntlet.yml      # listing PR → regenerates artifacts, signs, posts evidence bundle
  agent-seo-nightly.yml   # sitemap drift check → auto-PR with regenerated artifact
  agent-social.yml        # merge to main → social + newsletter drafts committed to queue
  agent-sentinel.yml      # daily patrol (attestation + demo gates) → auto-issue on findings
  agent-analyst.yml       # Monday cron → weekly report committed to content/reports
content/queue/            # drafts awaiting batch approval (seeded and regenerating)
content/reports/          # analyst output
content/launch/           # launch-day copy, claims-ledger compliant
scripts/agents/           # deterministic-first runners: social, newsletter, seo-audit,
                          # analyst, sentinel, ledger-lint (+ lib/catalog.mjs loader)
```

Runner contract: every script runs with **zero secrets** in deterministic mode from real
catalog data (`src/lib/data.ts` imported directly — Node type stripping). Model keys
(`ANTHROPIC_API_KEY`) are optional upgrades for copy polish; agents never require them to
function. `SITE_URL` controls canonical/sitemap origin.

Rules of engagement in CI:
- Agent PRs get the same `validate.mjs` + adversarial review workflow as humans.
- Agents never push directly to `main`; branches only, even for "auto" merges
  (auto-merge = merge queue with green checks, still auditable).
- Secrets: each agent gets scoped tokens (content agent cannot touch attest keys).
  Attestation signing key stays human-only, in CI secrets, forever.

## 3. First 90 days (mapped to MARKETING_PLAN phases)

| Weeks | Focus | Agents stood up | Exit gate |
|---|---|---|---|
| 1–2 | Foundations | Budget Guard, Analyst (report on day 8) | Funnel instrumented; weekly report exists before any promotion |
| 2–4 | Supply | Intake + Gauntlet Runner on real submission PRs; Critic in shadow mode | 25 design-partner listings processed; auto-clear ≥70% |
| 4–6 | Demand prep | SEO/Pages nightly PRs live; Social queue filling; Newsletter #1 drafted | 20 programmatic pages indexed; beta-exit metrics dashboard live |
| 6–8 | Public moment | Social + Newsletter full-auto-with-approval; Sentinel live before HN traffic | HN/PH launch with claims ledger; zero unhandled incidents week 1 |
| 8–12 | Compounding | Embed Scout; Retention triggers; Support agent on | Embed-attributed installs measured; self-serve support ≥50% |

## 4. What we refuse to automate

- The second human review signature on listings (the trust product).
- Attestation key custody.
- Claims-ledger edits.
- Security responses and takedown final decisions (agents draft, humans decide — DSA
  notice-and-action accountability cannot be delegated).
- The founder voice on launch day. Agents amplify it; they don't replace it.

## 5. Failure modes & counters

| Failure | Counter |
|---|---|
| Agent publishes false claim | Ledger linter + PR-only publishing + revert automation |
| Runaway spend | Budget Guard hard caps per agent, default-deny new scopes |
| Quality collapse from auto-approved listings | Critic thresholds tighten automatically if complaint proxy rises; sampling audit rate rises with volume |
| Support agent hallucinates policy | Answers must cite corpus sections; uncited answers blocked; low-confidence → human |
| Prompt injection via submissions | Submission fields are data, never instructions; intake agent prompt-hardened; output validated against schema by `validate.mjs` |
