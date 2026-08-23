# Forge — Reliability & Service Standards

## 1. Service catalog

| Service | Tier | SLO | Window |
|---|---|---|---|
| Storefront (browse/search/detail) | T0 | 99.9% availability, p75 LCP < 1.8 s | monthly |
| Demo runtime (iframe documents) | T1 | 99.5% render success | monthly |
| Install/library sync | T1 | 99.5% availability | monthly |
| Submission pipeline API | T2 | 99.0%, p95 stage-1 result < 10 min | monthly |

Error budget policy: when a service burns >100% of budget in a window, feature deploys for
that service freeze until budget ≥25% recovered; reliability work takes the next slot
automatically. Budget burn is reviewed weekly with a traffic-light page in the board pack.

## 2. Architecture posture

- **Static-first storefront:** hashed immutable assets on multi-CDN; origin only for
  catalog JSON. The site degrades to "fully browsable from cache" — offline banner ships in
  product (`OfflineBanner.tsx`).
- **Demos are client-side by construction:** zero backend in the demo path → demo SLO risk
  is CDN-only.
- **Stateless API layer** behind the pipeline; every endpoint idempotent where safe;
  queue-backed detonation workers scale horizontally.

## 3. Failure modes & responses

| Failure | Blast radius | Response |
|---|---|---|
| CDN region outage | regional latency/errors | multi-CDN failover < 5 min automatic |
| Catalog API down | no fresh data | serve last-known-good catalog snapshot (≤15 min staleness) from edge |
| Bad deploy | global | immutable hashed deploys + one-command revert; rollback target pinned 30 days |
| Detonation farm backlog | slow submissions | degrade to static-analysis-only listing with "pending full scan" badge, never skip silently |
| Client-side runtime error | single user view | ErrorBoundary catches, session preserved, report batched to `/api/client-error` |

RTO: minutes (static) / hours (pipeline). RPO: zero for code and catalog (git + object
versioning are the source of truth); reviews/attestations replicated cross-region hourly.

## 4. Operations practice

- **On-call:** weekly rotation across 3 senior engineers; alert thresholds paged only on
  user-facing symptoms (SLO burn, error rate), never on CPU-style noise.
- **Game days:** quarterly — sandbox escape drill, bad-deploy revert race (target < 10 min),
  catalog-snapshot restore.
- **Postmortems:** blameless, published internally within 5 working days; action items carry
  owners and dates; repeat incident = automated test added to the validation agent.
- **Change safety:** all changes ride the gauntlet in [PIPELINE.md](PIPELINE.md);
  `main` is always releasable; Friday-evening risky deploys prohibited.

## 5. Capacity signals

Watch: p95 detonation queue depth (>200 triggers autoscale), CDN egress vs forecast,
review-corpus growth vs reviewer throughput (SLA breach forecast at current hiring).
