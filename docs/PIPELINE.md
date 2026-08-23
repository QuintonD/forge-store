# Forge — Delivery Pipeline & Automated Code Review

Every change to Forge — storefront code, catalog data, demo documents — passes the same
gauntlet we sell to submitters. No exceptions, including docs-only PRs (they skip build
gates, never trust gates).

## 1. Branching & flow

- **Trunk-based:** short-lived branches (`feat/*`, `fix/*`, `docs/*`) → PR → squash to `main`.
- `main` is always releasable; deploys are immutable and instantly revertible.
- Conventional commits; release notes generated from them.

## 2. Gates (blocking)

| Gate | Implementation | Fails when |
|---|---|---|
| Validation agent | [`scripts/validate.mjs`](../scripts/validate.mjs) — runs prebuild + postbuild + CI | Any of 90 executable checks: catalog integrity (unique ids, categories, icons in registry, semver, changelogs), demo sandbox safety (no network/storage APIs, no external refs, balanced tags), route reachability, a11y cues, bundle budgets, security-header presence |
| Typecheck | `tsc --noEmit` | any type error |
| Build | `vite build` | any bundling error |
| Budget | postbuild re-run of validator on fresh `dist/` | JS > 480 KB raw or CSS > 80 KB raw |
| Dependency audit | `npm audit --audit-level=critical` | known critical CVE |
| Human review | CODEOWNERS: 1 approval; 2 for `src/lib/demos.ts` and anything touching auth/headers | — |

## 3. Adversarial review stage

Two automated critics run on every PR:

1. **LLM hostile reviewer** ([code-review.yml](../.github/workflows/code-review.yml)) —
   audits the diff across five lenses: correctness, security (XSS/injection/sandbox
   escape/secret leakage), accessibility, UX/visual-cue regressions, performance.
   Output is a severity-ranked findings table posted to the PR. **Advisory**: humans decide
   what blocks; S1/S2 findings require an explicit "won't fix now" comment to merge past.
2. **Static adversarial suite** — the validation agent's security section doubles as a
   regression tripwire: if a change weakens sandbox attributes, drops a security header,
   introduces storage/network calls inside demos, or breaks escape-to-close/focus handling,
   CI goes red.

Reviewer rules of engagement: assume hostile input everywhere; verify every claim with
file:line evidence; no nitpicks without severity; praise is noise.

## 4. Promotion

```
PR → gates → squash to main → CI on main → artifact (immutable, hashed)
  → deploy preview per-PR (Netlify/Vercel)
  → production on green main + manual "ship" by releaser
  → post-deploy smoke: validation agent against live URLs + Lighthouse budget check
```

Rollback = redeploy previous immutable artifact (< 5 min). Feature flags for anything
user-visible and risky.

## 5. Quality loops beyond CI

- **Weekly:** Dependabot grouped bumps ride the same gauntlet; budget trends reviewed;
  flaky-check quarantine list pruned.
- **Per-release:** reproducible-build verification re-runs each demo document's build from
  seed; attestation signed.
- **Quarterly:** game days (see RELIABILITY.md); a11y audit sweep (keyboard-only + screen
  reader pass on new surfaces).

## 6. Definition of done (any deliverable)

Code reviewed · validation agent green · budgets green · a11y cues present (labels,
focus, reduced-motion) · docs updated if behavior changed · rollback path stated.
