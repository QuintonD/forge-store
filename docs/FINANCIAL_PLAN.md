# Forge — Financial Plan

All figures USD. Year 1 = first 12 months post-public-beta. **Method note:** every revenue
line is built bottom-up from monthly cohort math (payers × ARPU, GMV × take rate); annual
figures are sums of those cohorts, never multiples of EOY states.

## 1. Revenue model & pricing

| Stream | Price | Notes |
|---|---|---|
| Free listings | $0 | Funnel; unlimited during beta |
| Pro developer tools | $19/mo | Pipeline analytics, A/B listing tests, priority review |
| Studio (teams) | $99/mo | Multi-seat, SSO, private catalogs, audit log |
| Paid-app revenue share | 85% developer / 15% Forge | vs industry-standard 70/30 — deliberate wedge |
| Team seats (Y2) | $12/seat/mo | Org catalogs with governance |

## 2. Three-year operating plan (bottom-up)

Payer cohorts ramp linearly to the stated EOY count; revenue uses average-through-year
payers. Commission requires GMV: modeled as paid-app attach of 6% (Y1) → 9% (Y3) of MAU
buying once per year at $9–$11 average order.

| Metric | Y1 | Y2 | Y3 |
|---|---|---|---|
| Listings (EOY) | 120 | 600 | 2,000 |
| WAU (EOY) | 10k | 55k | 160k |
| Paying developers (avg through year) | 130 | 780 | 2,900 |
| **Subscription revenue** (avg payers × blended $34 ARPU × 12) | **$53k** | **$318k** | **$1.18M** |
| GMV on paid apps | $180k | $1.1M | $4.6M |
| **Commission (15%)** | **$27k** | **$165k** | **$690k** |
| **Total revenue** | **$80k** | **$483k** | **$1.87M** |
| Operating cost | $1.35M | $2.15M | $2.95M |
| **EBITDA** | **–$1.27M** | **–$1.67M** | **–$1.08M** |
| Cumulative burn | –$1.27M | –$2.94M | –$4.02M |

**Honest consequences of the recompute** (supersedes earlier drafts):
- Break-even moves to ~month 40 and requires either a Series A (~month 22–26, at
  ≥$60k MRR growing ≥15%/mo) or a larger seed.
- Seed ask is **$4M** (not $2.5M) for ≥18 months of runway past the cash trough
  (~$3.1M cumulative burn around month 34).
- The prior "$5.2M Y3 / break-even month 31" model failed arithmetic re-computation
  under its own payer counts; it has been retired rather than patched.

## 3. Cost structure

### Y1 ($1.35M)

| Line | $/yr | % |
|---|---|---|
| Payroll (5 FTE core + founders at reduced comp) | 940k | 70% |
| Infrastructure (CDN, detonation farm, CI, signing KMS) | 150k | 11% |
| Review operations | 120k | 9% |
| Marketing (phased, see MARKETING_PLAN) | 132k | 10% |
| Legal/accounting/misc | 8k | <1% |

**Detonation cost realism:** an 8k-prompt adversarial battery plus ephemeral VM minutes
prices at **$0.50–$4 per full scan** depending on model routing — not fractions of a cent.
At Y1 volume (~400 scans incl. re-scans) that is immaterial; at Y3 scale (≈12k scans/yr)
it is budgeted inside the infra line's growth, with weekly re-scans tiered by listing
traffic so cost scales with value, not headcount of catalog.

**Review ops scaling:** two-human review at ≤48h prices at roughly **$18/listing-year**
including continuous weekly re-screens. Reviewer pool grows from contract (Y1) to 3 FTE
(Y3); this variable line is what prevents marketplace quality collapse as listings scale,
and it is funded ahead of catalog growth in Y2/Y3 budgets.

## 4. Unit economics

| Metric | Value | Basis |
|---|---|---|
| Blended ARPU (paying developer) | $34/mo | Mix of Pro/Studio + commission attribution |
| Gross margin | 82% | Post infra + review ops |
| CAC (developer, blended) | $38 target | Paid budget ÷ paid-acquired devs; organic modeled separately |
| LTV (24 mo, retention curve) | $240 | Requires D12 dev-churn ≤2.5%/mo — measured from beta before scaling spend |
| LTV : CAC | 6.3x target | Validated quarterly; marketing unlocks stay gated on payback ≤ 7 mo |

CAC coverage honesty: the Y1 paid budget buys ~3,000 developer acquisitions against tens of
thousands of signups — the plan is explicitly **organic-led**, and the HN/PH moment is a
catalyst, not a strategy (see MARKETING_PLAN §4 phase gates).

## 5. Funding strategy

- **Seed: $4M** on public-beta traction signals: ≥10k WAU **and** ≥20% demo→install
  (instrumented) **and** 25+ listings carrying signed builds.
- Use of funds: 50% engineering, 22% trust/review ops, 18% marketing, 10% buffer.
- **Series A trigger:** ≥$60k MRR, ≥15%/mo growth for 3 consecutive months, gross margin
  holding ≥75% while review SLAs hold.
- Discipline gates unchanged: spend >$5k needs hypothesis + kill criterion; headcount
  growth gated to revenue-per-FTE ≥ $140k.

## 6. Controls

Monthly close by day 10. Board pack tracks six numbers: WAU, instrumented demo→install %,
paying devs, net burn, gross margin, review-SLA attainment. Any metric red for two
consecutive months triggers a written plan-of-action before new discretionary spend.
