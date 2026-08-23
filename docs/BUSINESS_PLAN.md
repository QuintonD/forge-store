# Forge — Business Plan

**One line:** Forge is the app store for AI-generated software — a trusted, demo-first
distribution channel for the exploding supply of UIs, dashboards, games, TUIs and agents
that models now produce daily.

## 1. Problem

- **Supply explosion, no shelf.** Millions of viable micro-apps are generated per year; they
  die in gists, chat threads and repos because there is no distribution surface with
  discovery, trust and updates.
- **Trust is the blocker.** Buyers can't distinguish good generated software from plausible
  garbage; there is no review layer built for machine-authored code.
- **Developers have no economics.** No store offers favorable terms or provenance-based
  reputation for generated work.

## 2. Solution & wedge

A store where **every listing runs before you install**: live sandboxed demos (already
shipped — six playable demos in this repo), reproducible builds with signed provenance,
and a five-stage submission gauntlet. The wedge is **demo-first discovery**: conversion
from *playing* beats screenshots on every legacy platform.

## 3. Market

| Layer | Size | Basis |
|---|---|---|
| TAM | $47B (2026) → $120B (2030) | AI developer-tools & software creation spend |
| SAM | $3.8B | Distribution/monetization infrastructure for generated software |
| SOM (Y3) | ~$46M ARR (~1.2% of SAM) | Bottom-up: listings × attach × ARPU (see FINANCIAL_PLAN) |

## 4. Competition

| Player | What they are | Why they lose to us |
|---|---|---|
| Product Hunt | Launch-day attention | No running software, no installs, no updates |
| itch.io / app stores | Game/app distribution | Human-only review, no provenance, hostile terms (30%) |
| Hugging Face Spaces | Model demo hosting | Not user-facing software; no consumer UX, no purchase rails |
| npm / PyPI | Package registries | Developer-only, zero consumer discovery |

Moat compounding: **trust graph** (provenance records + reviewer reputation) + **demo
runtime expertise** + catalog SEO flywheel.

## 5. Business model

1. Free listings (funnel).
2. **Pro** developer tools $19/mo; **Studio** for teams $99/mo.
3. Paid apps: **85/15 revenue share** (vs industry 70/30).
4. Y2: Team seats ($12/seat/mo) for orgs curating private catalogs.

## 6. GTM summary

Private beta (500 devs) → HN/Product-Hunt moment around "the first store where every app
runs in the listing" → category expansion (games → dashboards → dev tools). Full plan:
[MARKETING_PLAN](MARKETING_PLAN.md).

## 7. Roadmap

| Quarter | Milestone | Gate metric |
|---|---|---|
| Q1 | Public beta: 100 listings, 6 runnable demos, provenance signing GA | 10k WAU |
| Q2 | Payments + paid apps, developer dashboard v2 | $25k MRR |
| Q3 | Collections curation API, embeds ("try in-page" widget) | 500 devs onboarded |
| Q4 | Enterprise/team catalogs pilot, mobile wrapper | 3 design partners |

## 8. Risks

- **Platform risk:** OS vendors add native generated-app support → counter: we are
  cross-platform by construction and own the trust layer.
- **Quality collapse** if catalog outgrows review capacity → counter: staged categories,
  gauntlet automation scaling ahead of supply; review ops is a funded variable line that
  scales per-listing (see FINANCIAL_PLAN §3).
- **Regulatory — EU AI Act Article 50 is already in force (Aug 2026):** machine-generated
  disclosure and provenance metadata are legal duties for a store like this, not marketing
  choices. Our signed-provenance roadmap doubles as the compliance artifact trail.
- **Regulatory — DSA hosting-service status:** an open submission marketplace likely makes
  Forge a hosting service: notice-and-action flows, statement-of-reasons reporting,
  transparency reports, trusted-flagger handling. Budgeted as trust-&-safety ops from beta.
- **Payments exposure:** if we operate paid apps we become merchant of record — chargebacks
  (~0.5–1% friendly-fraud on digital goods at $20–25/dispute erases margin fast at a 15%
  take), global VAT/GST registration, and payout/KYC obligations. Plan: launch payments via
  anMoR partner with chargeback pass-through terms, or hold paid apps until GMV justifies it.
- **Runtime dependency:** the demo product hangs on iframe sandbox semantics; a browser
  policy change is an existential vector → mitigations: multi-browser CI smoke tests on
  demos, WASM/Worker fallback runtime on roadmap, and the attestation model being runtime-
  independent.
- **Mobile wrapper risk (Q4):** shipping an iOS "store of apps" invites Apple Guideline 4.2
  rejection and the 30% tax our positioning mocks → mobile strategy is PWA-first with native
  shells limited to non-store functionality.
- **Model-provider disintermediation:** providers ship their own galleries → counter:
  neutrality across models is the brand; partnerships are negotiated co-marketing, never a
  distribution dependency.
