# Launch copy — claims-ledger compliant

Every claim below maps to a SHIPPED row in MARKETING_PLAN §2. Do not upgrade wording
without upgrading the ledger first.

## Show HN title

**Show HN: Forge — an app store where every app runs in the listing**

## Show HN body

We built Forge because AI-generated software has no shelf. Great micro-apps die in chat
threads and gists — nobody can tell the good ones from the plausible garbage, and there's
nowhere to distribute them.

Forge is a store for generated software where every listing runs live in your browser,
sandboxed, before you install anything.

What's shipped today:

- 34 listings across 6 categories; every one with a live sandboxed demo (opaque-origin
  iframe, zero network egress, no storage APIs)
- ed25519-signed build provenance on demo artifacts, with a public verifier:
  `npm run verify` checks every published hash yourself
- A validation agent gating every change to the storefront itself: 90 executable checks
  over catalog integrity, demo sandbox safety, routes, accessibility cues, bundle budgets
- Folder sync (beta): export packages to folders on your disk via the File System Access
  API, or mirror them to your own GitHub repo. We store only SHA-256 manifests — artifact
  bytes live in your storage, not ours
- Wishlist/library/updates persisted locally; works offline after first load; zero
  telemetry scripts

What's NOT shipped yet (honesty section): payments rails, verified-install reviews,
public SLO telemetry. The claims ledger in our marketing plan tracks status for every
claim we make publicly.

Ask: try the demos, run `npm run verify`, and tell us what would make you install from a
generated-software store.

## Product Hunt tagline

Every app runs live before you install

## Product Hunt first comment

TL;DR: a store for AI-generated software where the demo IS the listing.

The problem we kept hitting: models produce thousands of viable micro-apps a day and
they vanish. No discovery, no trust signals, no updates, no economics.

Our answer, in order of importance:

1. Trust by demonstration — click any listing and it's running in front of you, sandboxed
   (opaque origin, no network, no storage).
2. Proof over promises — builds are signed (ed25519) and reproducible; there's a public
   CLI (`npm run verify`) so you don't have to trust us checking.
3. Your bytes, your storage — folder sync and a GitHub mirror mean we keep manifests only.
   Storage cost to us is ~zero, which is how a bootstrapped team ships this free.
4. Developer economics — free listings at launch, 85/15 revenue share when payments land.

Built with React + Vite + Tailwind v4. The storefront's own CI runs a 90-check validation
agent plus adversarial code review on every PR — same gauntlet we sell submitters on.

## Launch-day tweets (thread)

1/ We kept asking one question: why can't you TRY software before installing it anymore?
So we built Forge — every listing runs live, right in the page. [link]

2/ Every artifact is ed25519-signed and reproducible. Don't trust us — run `npm run verify`
against the public manifest yourself.

3/ And since generated software belongs on YOUR machine: sync any package to a local
folder or your own GitHub repo. We store nothing but hashes.

4/ Free listings during beta. Developers keep 85% when paid apps land. [link to submit]
