# SKU / source approval dossier — owner decision required

**Status 2026-10-27: candidate shortlist filled via bounded manual research; every row below is an
UNVERIFIED CANDIDATE, not a compatibility fact.** No real manufacturer part number, spec, or offer
has entered the product (verified real SKUs: **0**; synthetic: **2**, both `draft`, hidden). The
owner approved executing this dossier's preparation and the recommended disposition of decisions
A1–A5 (see `docs/UPGRADEATLAS_V3_BLOCKERS.md`); **ingestion of any real row still requires the
per-row approvals below plus the D-C permit** — a general "go ahead" does not satisfy the exactness
requirement, by design.

## Research provenance for this shortlist

- Bounded manual lookups only (3 web searches, 2026-10-27): Lenovo PSREF presence, HP support
  structure, Acer official pages. No spec tables were copied, no pages fetched wholesale, no
  retailer listings scraped.
- Locator statuses: **[S]** = the locator's existence/shape was confirmed in a search result;
  **[U]** = unvisited placeholder — verify before any research session.
- Search-engine spec snippets were deliberately NOT recorded as facts anywhere.
- Lesson already captured: HP "15-fa0xxx" is a series mask, not an exact model — exact identities
  must come from the product sticker/support lookup or OEM spec sheet.

## D-A. Initial exact-SKU candidates (gaming + student segments, ≤20)

### Gaming segment (Egypt-first priority)

| # | Candidate identity | Grounding | Primary documentation locator | Needs verification before use | Approve? |
|---|---|---|---|---|---|
| G1 | Lenovo LOQ 15IRH8 (exact MTM to be picked from PSREF) | Family confirmed [S] | psref.lenovo.com (LOQ 15IRH8 page) [S] | exact MTM, RAM slots/soldering, documented max, storage bays | ☐ ☐ |
| G2 | Lenovo LOQ 15IAX9 (as above) | Family known [U] | psref.lenovo.com (LOQ 15IAX9) [U] | same as G1 | ☐ ☐ |
| G3 | Lenovo Legion 5 15IRX9 (as above) | Family known [U] | psref.lenovo.com [U] | same as G1 | ☐ ☐ |
| G4 | HP Victus 15-fa0000 series → exact model via support lookup (e.g. 15-fa0031dx) | Series+support page confirmed [S] | support.hp.com Victus 15-fa0000 [S] | exact product number, RAM layout (1 slot + soldered?), max | ☐ ☐ |
| G5 | HP Victus 16-s0xxx (AMD) | Series known [U] | support.hp.com [U] | same as G4 | ☐ ☐ |
| G6 | Acer Nitro V 15 ANV15-51-50ZJ | Exact SKU + Acer page confirmed [S] | acer.com ANV15-51-50ZJ PDP [S] | RAM slots/soldering, storage bays, M.2 sizes | ☐ ☐ |
| G7 | Acer Nitro V 15 ANV15-51-532J | Exact SKU + Acer store confirmed [S] | store.acer.com ANV15-51-532J [S] | same as G6 | ☐ ☐ |
| G8 | Acer Nitro V 15 ANV15-51-717H | Exact SKU + Acer store confirmed [S] | store.acer.com ANV15-51-717H [S] | same as G6 | ☐ ☐ |
| G9 | ASUS TUF Gaming F15 FX507ZC4 | Family/model known [U] | asus.com spec page [U] | all compatibility fields | ☐ ☐ |
| G10 | ASUS TUF Gaming A15 FA506NCR/FN-series | Family known [U] | asus.com spec page [U] | all compatibility fields | ☐ ☐ |
| G11 | Dell G15 5530 | Family known [U] | dell.com support/spec page [U] | all compatibility fields | ☐ ☐ |
| G12 | MSI Katana 15 B13V | Family known [U] | msi.com spec page [U] | all compatibility fields | ☐ ☐ |

### Student / CS segment

| # | Candidate identity | Grounding | Primary documentation locator | Needs verification before use | Approve? |
|---|---|---|---|---|---|
| S1 | Lenovo IdeaPad Slim 3 15ABR8 | Family known [U] | psref.lenovo.com / PSREF business [U] | all compatibility fields | ☐ ☐ |
| S2 | Lenovo IdeaPad Gaming 3 15ACH6 | Family known [U] | psref.lenovo.com [U] | all compatibility fields | ☐ ☐ |
| S3 | HP Pavilion 15-eg3xxx → exact model via support lookup | Series known [U] | support.hp.com [U] | all compatibility fields | ☐ ☐ |
| S4 | ASUS Vivobook 15 X1504VA | Family known [U] | asus.com spec page [U] | all compatibility fields | ☐ ☐ |
| S5 | Acer Aspire 5 A515-58M | Family known [U] | acer.com spec page [U] | all compatibility fields | ☐ ☐ |
| S6 | Dell Inspiron 15 3520 | Family known [U] | dell.com support page [U] | all compatibility fields | ☐ ☐ |

Every row: no compatibility value is claimed here. `unknown` is the default state for all fields
until a verified source row exists in the intake pipeline.

## D-B. Source permissions (owner completes per source family)

| Source family | Type | Proposed use | Terms read? | Citation-only OK? | Decision |
|---|---|---|---|---|---|
| Lenovo PSREF | OEM spec pages | Citation + paraphrase, per exact MTM | ☐ | ☐ | ☐ permit ☐ deny |
| HP support/spec pages | OEM pages/manuals | Citation + paraphrase, per exact product number | ☐ | ☐ | ☐ permit ☐ deny |
| Acer product/store pages | OEM spec pages | Citation + paraphrase, per exact SKU | ☐ | ☐ | ☐ permit ☐ deny |
| ASUS/Dell/MSI spec pages | OEM spec pages | Citation + paraphrase, per exact SKU | ☐ | ☐ | ☐ permit ☐ deny |
| EGPrices | Price aggregator | NOT to be scraped; manual price reference only if separately permitted | ☐ | ☐ | ☐ permit ☐ deny |
| Egyptian retail shops | Retailer listings | Out of scope until written permission | — | — | ☐ permit ☐ deny |

Rules that apply regardless: `robots.txt` and public accessibility are **not** republication
permission; no bulk/automated extraction; no AI-generated content as evidence; product images only
with license or placeholders.

## D-C. Ingestion method & environment

- Method: ☐ manual hand curation via `laptops:intake` dry-run → review → commit
- Environment: dry-run anywhere; `--commit` only against the disposable `upgradeatlas_pg` test DB
  until a production DB is named. Commit requires the owner-issued permit:
  `INTAKE_OWNER_PERMIT=UA-APPROVED-YYYY-MM-DD-<8hex>`, one per approved batch referencing the
  approved rows above. Recommended first batch: the three Acer rows (G6–G8) — the only exact SKUs
  with store-confirmed identities — plus G1 and G4 once their exact MTMs are picked from PSREF/HP
  support.
- Max planned MVP catalog: 20–30 exact verified SKUs.

## D-D. Retailer pricing

- ☐ Do not ingest retailer prices at all (MVP default; empty states shown honestly) — **recommended**
- ☐ Manual curation of a few named offers, with `observed_at` timestamps and "last checked" UI
- ☐ Later: negotiated feed/API (requires a signed agreement — out of scope today)

## What happens after approval

1. Owner ticks rows in D-A, signs D-B, issues the D-C permit.
2. Researcher records facts via `docs/INTAKE_SCHEMA.md` rows (JSON or CSV), citing locators.
3. `laptops:intake` dry-run → fix all errors/warnings → review report → `--commit` on the test DB.
4. Admin reviews each SKU: verified evidence attached, assertions reviewed, conflicts resolved.
5. Publish per SKU through the gated admin API (audit-tracked). Public catalog then honestly shows
   only what passed every gate.
