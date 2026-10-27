# SKU / source approval dossier — owner decision required

**Status: EMPTY BY DESIGN.** No real manufacturer part numbers, no verified compatibility facts, and
no retailer offers exist in this project (verified real SKUs: **0**; synthetic: **2**, both `draft`
and hidden from the public API). This document defines what the owner must approve before any real
data enters the product. It deliberately contains **no fabricated candidate list** — per the
execution directive, candidate model codes may only appear here when grounded in identifiable
manufacturer documentation already in hand.

## Decision blocks (owner completes)

### D-A. Initial exact-SKU set (max 20–30)

| # | Exact manufacturer part number / MTM | Brand, family, variant | Egyptian buyer segment | Primary documentation locator (URL + section) | Fields needing manual verification | Approve? | Notes |
|---|---|---|---|---|---|---|---|
| 1 | _(empty — fill only from documentation in hand)_ | | | | | ☐ approve ☐ deny | |
| 2 | | | | | | ☐ approve ☐ deny | |
| 3 | | | | | | ☐ approve ☐ deny | |

### D-B. Source permissions

| Source | Type | Proposed use | Terms/license read? | Republication allowed? | Citation-only? | Decision |
|---|---|---|---|---|---|---|
| _(empty)_ | OEM spec page / service manual / retailer listing | Citation + paraphrase | ☐ | ☐ | ☐ | ☐ permit ☐ deny |

Rules that apply regardless of the decisions above:

- `robots.txt` and public accessibility are **not** republication permission.
- No bulk or automated extraction from EGPrices, Crucial, Lenovo PSREF, manufacturers, or retailers
  without a written, scope-limited permission for the exact method (MVP: manual hand curation only).
- No Open Icecat or generative-AI ingestion without verified permission. AI output is never evidence.
- Product images only with license or permission; otherwise placeholders.

### D-C. Ingestion method & environment

- Method: ☐ manual hand curation via `laptops:intake` dry-run → review → commit
- Environment: dry-run anywhere; `--commit` only against the disposable `upgradeatlas_pg` test DB
  until the owner names a production DB. Commit additionally requires the permit string:
  `INTAKE_OWNER_PERMIT=UA-APPROVED-YYYY-MM-DD-<8hex>` — issue one per approved batch, referencing
  the approved SKU list above.
- Max planned MVP catalog: 20–30 exact verified SKUs. Not 1,000 synthetic guesses.

### D-D. Retailer pricing

- ☐ Do not ingest retailer prices at all (MVP default; empty states shown honestly)
- ☐ Manual curation of a few named offers, with `observed_at` timestamps and "last checked" UI
- ☐ Later: negotiated feed/API (requires a signed agreement — out of scope today)

## What happens after approval

1. Owner fills D-A/D-B and issues the D-C permit.
2. Researcher records facts via `docs/INTAKE_SCHEMA.md` rows (JSON or CSV), citing locators.
3. `laptops:intake` dry-run → fix all errors/warnings → review report → `--commit` on the test DB.
4. Admin reviews each SKU: verified evidence attached, assertions reviewed, conflicts resolved.
5. Publish per SKU through the gated admin API (audit-tracked). Public catalog then honestly shows
   only what passed every gate.

Until then the public catalog stays intentionally empty, which is the honest state for a
pre-data product.

## Reference pointers (unvisited, unverified — placeholders only, not candidates)

The repo PRD cites (without any verification by this project): Lenovo PSREF
(https://psref.lenovo.com/), Crucial compatibility tools (https://www.crucial.com/),
EGPrices (https://www.egprices.com/en/category/computers/laptops), iFixit (https://www.ifixit.com/).
These are named **only** as starting points for the owner's own rights review. Nothing has been
fetched, and nothing here grants permission.
