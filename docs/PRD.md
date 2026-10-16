# UpgradeAtlas — Egypt-first Laptop Buying & Upgrade Advisor
**Product requirements, engineering design, database specification, implementation plan, and agent handoff**

**Version:** 1.0 planning baseline | **Date:** 16 October 2026 | **Status:** Proposed, not implemented
**Owner:** Solo CS student with AI-agent assistance | **Target:** Egyptian consumers | **Initial market:** Egypt (Arabic-first, English optional)

> **Instruction to Lain:** Treat this as a design and implementation handoff, not proof that a codebase exists, data is licensed, retailer APIs are available, or laptop compatibility is verified. First inspect the actual repository and environment. Never say tests passed, prices are current, or compatibility is confirmed without reproducible evidence. Implement incrementally and report what genuinely works. Any assumptions below must be flagged rather than silently invented.

## 1. Executive overview

**Product concept:** UpgradeAtlas helps Egyptians (A) choose which laptop to buy, (B) compare exact laptop SKUs and Egyptian retail offers, (C) investigate compatible RAM/SSD upgrades for laptops they own, and (D) decide whether upgrading or replacing is better value. It is **not** a retailer, a payment processor, a guaranteed benchmark predictor, or a physical repair service.

**Tagline:** Find it. Compare it. Upgrade it.

**Positioning:** A trustworthy, exact-SKU, upgradeability-aware buying advisor for Egypt. Compared with broad price comparison, build decisions around repairability/upgradeability, source evidence, user requirements, and price freshness. No unsupported claim of being Egypt's first or only tool.

**Principles:** Accurate beats large; explicit unknown beats guessed compatibility; user-value before automation; independent of giant marketplaces; low-cost solo operation; source citations and refresh dates on all factual claims; Arabic and EGP native; accessibility; privacy by design.

**Success hypothesis, NOT verified demand:** Buyers care about future upgradeability and retailer price transparency, and some will click partner retailer links. Validate with 10–15 potential Egyptian laptop buyers and 3–5 shops before commercial investment.

## 2. Users and jobs to be done

| Persona | Motivation | Primary flow | Core concern |
|---|---|---|---|
| University student | Affordable laptop for coursework/programming | Budget + use-case finder | Value, RAM, portability |
| Gamer | Balance GPU/CPU/display/thermals | SKU side-by-side comparison | Actual GPU variant, display, cooling |
| First-time buyer/parent | Understand unfamiliar specs | Guided questions + explanations | Avoid misleading listings |
| Existing owner | Add RAM/SSD | Exact model lookup → supported upgrades | Hardware damage/compatibility |
| Budget-conscious owner | Upgrade or replace | Cost comparison | Avoid wasting money |
| Admin/editor | Curate credible catalog | Sources → fact verification → publish | Data quality and conflicts |
| Future partner shop | Receive attributable clicks | Verified offer page → referral | Fair, clearly labeled placement |

### Core user stories
- As a visitor, I can browse and filter verified laptop configurations **without an account**.
- As a buyer, I can set EGP budget, use cases, RAM/SSD upgrade preference, weight/display/CPU/GPU constraints, and receive explainable ranked results.
- As a buyer, I can compare 2–4 **exact SKUs**, not vague product families, including upgrade potential and unknown facts.
- As an owner, I can find my specific model number (or narrow to possible variants) and see documented upgrade slots, occupied state where known, compatible component classes, and warnings.
- As a visitor, I can see each cited source, verification time, and retailer offer-check time.
- As an admin, I can flag conflicting sources, mark unverifiable attributes as unknown, and refuse to publish unreviewed safety-sensitive compatibility assertions.
- As a logged-in user, I may save favorites and comparisons; guest users can use core functionality.

## 3. Differentiation & competitive reality

Verified reference categories (not exhaustive competitor audit):
- **EGPrices Egypt** already aggregates laptop prices/retailer offers: https://www.egprices.com/en/category/computers/laptops
- **Crucial** has computer-memory/SSD compatibility tools: https://www.crucial.com/
- **Lenovo PSREF** has manufacturer technical specifications and exact-configuration documentation: https://psref.lenovo.com/
- **iFixit** offers repair guidance: https://www.ifixit.com/

Therefore generic laptop listing, standalone price comparison, and basic component lookup are **not unique**. Differentiate through verified exact-SKU upgrade facts + local offer freshness + explainable buyer recommendations + upgrade-vs-replace comparisons, in one coherent experience. Do not assume global manufacturers or third-party catalogs grant commercial re-use rights.

## 4. MVP boundaries (college demonstration)

### Must-have (MVP)
1. Responsive bilingual shell (Arabic RTL first, English LTR toggle); navigation, accessibility, error/empty/loading states.
2. Public laptop catalog of **20–30 carefully verified exact SKUs** (not simply family names), with manufacturer source URLs and dates.
3. Structured laptop specification pages (CPU, GPU, RAM, storage, display, battery, mass, connectivity as available); source/unknown badges.
4. Filtered and searchable catalog, pagination, sorting, and EGP budget filtering against recorded offers.
5. Side-by-side comparison of 2–4 SKUs, presenting differences and missing data fairly.
6. Deterministic buyer questionnaire and transparent recommendation ranking (explain why each match appears).
7. RAM/SSD upgradability pages with exact configuration links and explicit confidence/verification level.
8. Simple upgrade-vs-replace calculator with *editable user-entered upgrade costs* and no fabricated performance gain.
9. Admin CRUD for brands, families, SKUs, specifications, sources, upgrade facts, and retailer offers; unpublished draft and published states.
10. A few verified Egyptian retailer offers **manually curated or ingested only with permission**, plus timestamp and source link; empty-state when unavailable.
11. PostgreSQL schema with constraints, migrations, indexes, seed fixtures, audit trail for edits, API tests, and useful documentation.
12. Sample data must be marked demo until manually verified; no invented live stock, installment terms, affiliate agreements, or performance claims.

### Should-have only after core flows work
Favorites/accounts, account deletion and export, source re-verification queue, basic price history, accessible charts, limited alerts with opt-in, saved user preferences, comparison share links.

### Explicitly out-of-scope for MVP
Automated scraping from websites without permission; comprehensive Egypt-wide current prices; automatic SKU OCR from photos; AI recommendations; benchmark prediction/FPS claims; exact chip-level compatibility on undocumented machines; checkout/payment handling; secondhand listings/marketplace; user-posted reviews; retailer dashboard; mobile native apps; affiliate contracts/monetization guarantees; automated warranty determinations; automatic BIOS modification instructions.

## 5. Representative user journeys and expected UX

### Journey A — buying a laptop
1. User opens /find and selects budget **50,000–60,000 EGP**, programming + moderate gaming, minimum 16 GB RAM, prefers RAM and SSD expandability.
2. Filter hard constraints: budget and explicitly required attributes. `unknown` on required upgradeability is excluded unless user opts to include unverified matches.
3. Rank remaining verified SKUs. UI shows *why* each matched, tradeoffs, source links, offer-check timestamp; never claim stock exists unless freshly verified.
4. User selects 3 exact SKUs, sees comparison /compare?sku=... and retailer offers by date.
5. User follows official retailer page; site does not itself take an order.

### Journey B — ownership and upgrade
1. User enters exact model/MTM/Product Number, not only marketing family. If multiple hardware variants match, ask to choose with guidance for finding the sticker / system information.
2. Display verified installed/soldered memory info, slots, spare slots *if known*, storage form factors/interfaces/drive count, disassembly risk, warranties/region variations.
3. Explain `SUPPORTED`, `UNSUPPORTED`, or `UNKNOWN`; show manufacturer/repair source, why and date. `SUPPORTED` must refer to specific part class/configuration criteria, not every merchant SKU.
4. If unverified, show safe next steps: verify full SKU, OEM service manual, or qualified technician.
5. Upgrade-vs-replace calculator compares **explicit total costs** of candidate RAM/SSD upgrade versus a chosen replacement laptop; no invented FPS increases.

### Journey C — admin resolves conflicting facts
1. Editor imports draft fact, reference URL, extracted quote/locator, time, SKU scope, and license/provenance notes.
2. Two sources disagree on SSD max capacity. Editor flags conflict, preserves both records, does not silently overwrite.
3. Published page shows `Unknown / conflicting documentation` until verified and resolved.
4. Change is audited with old/new values and editor ID.

### Empty/error UX examples
- "No matching laptops under your filters—try removing a hard requirement." / Arabic equivalent.
- "This laptop family has multiple SKUs. Please select your exact model before choosing parts."
- "RAM upgradeability not verified. We cannot safely recommend a kit yet."
- "Last checked 8 days ago; price or stock may have changed."

## 6. Matching & ranking (deterministic, explainable)

Use exact qualification filters first; then a transparent weighted score, never hardcode subjective claims as objective performance measurements.

**Example MVP weights:** use-case fit 30%; budget efficiency 20%; RAM/SSD upgradeability 25%; display/portability preferences 15%; data completeness + freshness 10%. Weights are proposal only; expose them in code and config. Use rubric-based per-feature scoring backed by actual documented attributes, not unsupported synthetic benchmarks.

Pseudo-flow:
```
for each published sku:
    resolve documented attributes and matching current/recorded offers
    if any required constraint is false: exclude
    if required constraint is unknown: exclude, unless user toggles include-unknown
    fit = weighted_sum(normalized documented criteria)
    append explanatory reasons and limitations
sort by fit descending, tie-break by verified offer total, then SKU
```
No unseen stock claim; price may be `NULL`. A missing price should not count as EGP 0. No paid placement altering organic ranking silently. If sponsorship added, label it and separate ranking logic.

## 7. Compatibility engine: hard rules

**Identity:** Manufacturer → laptop family → variant (model code) → exact SKU/MTM/part number → regional options. Never attach a universal fact to a family if it only applies to particular variants.

**RAM facts:** DDR generation, form factor (SO-DIMM vs soldered), slot count, soldered amount, occupied slot count, verified supported max, number of replaceable modules, RAM speed / limitations, BIOS constraints where known. "Manufacturer tested up to 32 GB" is not automatically "cannot accept 64 GB"; preserve distinction between documented/tested limit and known hard limit.

**Storage facts:** number of bays/slots, M.2 key and physical size, protocol (SATA/NVMe), PCIe generation/lane information, slot occupancy, thickness/single-sided clearance if supported by source, shared slots and battery/chassis options. Physical M.2 fit does **not** imply electrical compatibility.

**Decision states:** `supported`, `unsupported`, `unknown`, `conflicting`; confidence (`manufacturer_verified`, `reputable_independent`, `unverified`); each determination must include evidence and exact applicable scope. A claim must not be `supported` solely on an LLM guess or fuzzy SKU text match.

**User guidance:** Hardware changes may affect warranty/service terms. Recommend safety precautions and professional help where appropriate; avoid providing unsupported disassembly claims.

## 8. Data architecture — PostgreSQL conceptual schema

Use PostgreSQL 16+ if compatible with chosen hosting. Normalized entities; immutable fact provenance; timestamp everything. Proposed schema, subject to implementation review:

### Catalog
- `brands(id, name UNIQUE, slug UNIQUE)`
- `laptop_families(id, brand_id FK, family_name, slug, launch_year NULL, UNIQUE(brand_id,slug))`
- `laptop_variants(id, family_id FK, manufacturer_model_code, region_code NULL, notes, UNIQUE(family_id,manufacturer_model_code,region_code))` — assess null-uniqueness carefully in SQL.
- `laptop_skus(id, variant_id FK, manufacturer_part_number, country_code NULL, display_name, cpu_id FK NULL, gpu_id FK NULL, display_id FK NULL, base_ram_gb NULL, base_storage_gb NULL, status, created_at, updated_at)`; uniqueness at manufacturer / part no. level, not ambiguous title.
- `cpus(id, maker, model, architecture NULL, cores NULL, threads NULL, ...)`
- `gpus(id, maker, model, vram_gb NULL, tgp_w NULL, ...)` — same model name can vary in power; preserve unknown.
- `displays(id, diagonal_inches, resolution_width, resolution_height, refresh_hz NULL, panel_type NULL, color_gamut NULL, brightness_nits NULL, ...)`
- `sku_attributes(sku_id FK, attribute_key, typed value or typed columns, provenance_id FK)` for less common attributes; prefer structured tables for core compatibility, not opaque JSON as source of truth.

### Upgrade data
- `ram_configurations(id, sku_id FK, soldered_gb NULL, slot_count NULL, occupied_slot_count NULL, standard NULL, documented_max_gb NULL, max_meaning, evidence_id FK, verification_status)`
- `storage_slots(id, sku_id FK, slot_index, form_factor NULL, protocol NULL, pcie_generation NULL, occupied_status, constraints_text NULL, evidence_id FK, UNIQUE(sku_id,slot_index))`
- `component_classes(id, component_type, standard, form_factor, protocol NULL, capacity_gb NULL, attributes_jsonb NULL)` — specific commercially sold part SKU is a later feature.
- `compatibility_assertions(id, sku_id FK, component_class_id FK, outcome, reason, scope_notes, evidence_id FK, reviewed_by FK NULL, reviewed_at NULL, UNIQUE(sku_id,component_class_id,evidence_id))`

### Offers
- `retailers(id, name, website_url, country, status)`
- `retailer_offers(id, sku_id FK, retailer_id FK, retailer_sku NULL, product_url, currency DEFAULT 'EGP', displayed_price_egp NUMERIC(12,2) NULL, available_status ENUM-like, observed_at, recorded_at, source_id FK, active)`
- `offer_price_observations(id, offer_id FK, price_egp NUMERIC(12,2), stock_status, observed_at, source_id FK)` append-only rather than overwriting history.

### Evidence and governance
- `sources(id, url, source_type, publisher, usage_permission_status, last_accessed_at, notes)`
- `evidence(id, source_id FK, locator, concise_paraphrase, fact_scope, observed_at, reviewer_id FK NULL, verification_status, superseded_by FK NULL)`; no wholesale copyrighted page copies.
- `conflict_flags(id, entity_type, entity_id, field_name, evidence_ids, status, resolution_notes)` — validate polymorphic refs in service layer or redesign with explicit fact IDs.
- `audit_events(id, actor_id FK NULL, entity_name, entity_pk, operation, old_value JSONB, new_value JSONB, occurred_at)`

### Users
- `users(id, email UNIQUE, hashed_password OR external_auth_id, display_name NULL, locale, created_at, deleted_at NULL)` — only collect required data; do not implement custom crypto.
- `favorites(user_id FK, sku_id FK, created_at, PRIMARY KEY(user_id,sku_id))`
- `saved_comparisons(id, user_id FK, title, created_at)` + `saved_comparison_items(comparison_id FK, sku_id FK)`
- `recommendation_sessions(id, optional_user_id FK, preferences JSONB, created_at, ephemeral_until)` with short retention; guest may be fully client-side.

### Schema invariants and indexes
- Nonnegative monetary amounts and capacities, valid enum values, URLs validated at ingestion, unique SKU identities, conditional nullability, foreign keys with intentional ON DELETE behavior.
- Index exact normalized part numbers; trigram/full-text search for Arabic/English names where useful; `(sku_id, observed_at DESC)` for offer history; filtered indexes for `published` SKUs and active offers.
- Distinguish `NULL` / not known from `false` / conclusively unsupported. Preserve UTC timestamps, render Africa/Cairo dates locally.
- Use SQL migrations, repeatable deterministic seeds, transactions for multi-table publishing, DB roles and backups. No materialized performance features without explainable provenance.

### Sample SQL migrations (illustrative, not final schema)
```sql
CREATE TABLE laptop_skus (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  variant_id BIGINT NOT NULL REFERENCES laptop_variants(id),
  manufacturer_part_number TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'published', 'retired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE storage_slots (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sku_id BIGINT NOT NULL REFERENCES laptop_skus(id) ON DELETE RESTRICT,
  slot_index SMALLINT NOT NULL CHECK (slot_index > 0),
  form_factor TEXT,
  protocol TEXT CHECK (protocol IN ('NVMe', 'SATA', 'both', 'unknown')),
  source_evidence_id BIGINT REFERENCES evidence(id),
  UNIQUE (sku_id, slot_index)
);
```
**Migration note:** Foreign referenced tables must be created earlier in the actual migration sequence; this is just an illustrative excerpt.

## 9. Source ingestion and provenance

**Hierarchy:** OEM exact SKU/part-number specification → OEM service/maintenance manual → official part finder → licensed distributor documentation → reputable teardown/independent compatibility evidence → customer reports (unverified; cannot establish support on their own).

**Operational workflow:** Identify local high-interest SKUs → record exact identifiers → gather source URLs and permission status → manually or legally ingest structured data → check consistency → human/agent-assisted review with citations → publish → schedule recheck. LLMs can propose fact extraction but cannot independently certify facts. Record conflicts and changes.

**Public data considerations:** Publicly viewable ≠ licensed for bulk reproduction or scraping. Obey terms, robots, rate limits and permission requirements; prefer official APIs, written retailer partnerships, limited hand curation, or user-submitted facts with moderation. Do not bypass anti-bot defenses. Remove sources/data on valid rights requests. Product photos only with permission or applicable license; otherwise placeholder images.

**Price truthfulness:** An observed listed price is not guaranteed current. Show `last checked` and store URL; distinguish `in_stock_confirmed_at`, `out_of_stock_confirmed_at`, and `unknown`. No "currently available" banner beyond an appropriate refresh policy with permitted source access. Installment terms only when verified at time shown, inclusive of fees, and clearly attributed.

## 10. Example records — synthetic only

**Synthetic laptop SKU A** (DO NOT display as factual real listing):
```
Brand: ExampleTech; Family: Campus 15; SKU: EX-C15-01
CPU: Example 6-core; GPU: Integrated
RAM: 16 GB installed; 2 SO-DIMM slots; both occupied; expansion NOT VERIFIED
SSD: 512 GB NVMe; number of free slots UNKNOWN
Retailer price: NULL; stock status: UNKNOWN
Evidence status: DEMO DATA ONLY
```
**Synthetic laptop SKU B:** `EX-G15-02`, 16 GB RAM, one reported open M.2 slot, but compatibility evidence is missing → outcome must be `UNKNOWN`, not `SUPPORTED`.

**Illustrative buyer result:** Under 60,000 EGP and mandatory replaceable RAM, an SKU with soldered-only memory should be excluded; a SKU with unknown memory layout should be flagged/excluded by default. If no verified offers are within budget, tell user exact price availability is insufficient rather than manufacturing a recommendation.

**Illustrative cost comparison:** User-entered RAM upgrade 2,000 EGP + installation 400 EGP = 2,400 EGP; replacement laptop 45,000 EGP; cash difference 42,600 EGP. This is a *cost* comparison only, not a claim of equivalent performance. Optional resale value, warranty, and longevity inputs can be modeled later.

**Example bilingual labels:**
- Find a Laptop / دور على لابتوب
- Compare Laptops / قارن اللابتوبات
- Upgrade My Laptop / طوّر اللابتوب بتاعي
- Verified source / مصدر موثّق
- Compatibility unknown / التوافق غير مؤكّد
- Price last checked / آخر مراجعة للسعر
- Exact model number / رقم الموديل بالتحديد

## 11. Proposed screens and UI structure

**Routes:** `/`, `/find`, `/laptops`, `/laptops/:skuSlug`, `/compare`, `/upgrade`, `/upgrade/:skuSlug`, `/upgrade-or-replace`, `/about-data`, `/privacy`, `/admin`, optional `/account/favorites`.

**Home:** Clear buyer/owner split; one search bar; value proposition; sample comparison; how verification works. No heavy hero animations, unverified testimonials or misleading retailer logos.

**Catalog:** filter sidebar/drawer; chips for required vs preference; budget in EGP; verified/unverified toggle; empty states; keyboard navigation; mobile-first.

**Laptop detail:** exact model number clearly prominent; spec sections; upgradeability summary (`replaceable`, `soldered`, `unknown`); sources expandable by field; retailer offers with last checked time; compare action.

**Comparison:** horizontal table with sticky SKU names and categories; differences highlighted without color-only signaling; unknown treated distinctly from no; price timestamps.

**Upgrade advisor:** exact-model-first flow, confirm variants, safe component categories, source evidence panel, warnings, link to OEM instructions. Avoid implying that the website can scan a laptop remotely through a browser.

**Admin:** draft/publish, field-level evidence, conflict queue, revision audit, ingestion queue, source permission metadata; no destructive bulk imports by default.

**Design direction:** Technical but approachable, intentional typography, minimal cards, high-contrast light/dark themes, restrained visual effects, accurate RTL layouts, WCAG 2.2 AA target, SEO pages with factual structured content. Do not copy competitor branding/UI. Arabic localized units, numeral presentation as configurable, EGP currency, accessible icons. Avoid generic AI-generated dashboards with meaningless charts.

## 12. API proposal

Versioned JSON REST endpoints (FastAPI recommendation):
```
GET  /api/v1/brands
GET  /api/v1/laptops?q=&brand=&min_price=&max_price=&ram_upgradeable=&ssd_upgradeable=&page=
GET  /api/v1/laptops/{sku_id}
GET  /api/v1/laptops/{sku_id}/sources
GET  /api/v1/laptops/{sku_id}/offers
GET  /api/v1/laptops/{sku_id}/upgrades
POST /api/v1/laptops/compare        { sku_ids: [...] }
POST /api/v1/recommendations         { budget_egp, use_cases, requirements, preferences }
POST /api/v1/upgrade-or-replace      { existing_sku_id, upgrade_costs, replacement_sku_id, optional_inputs }
POST /api/v1/admin/laptops          [auth + role]
PATCH /api/v1/admin/laptops/{sku_id} [auth + role + audit]
POST /api/v1/admin/evidence         [auth + role]
POST /api/v1/admin/publish/{sku_id} [auth + verification gates]
```
Pagination and stable sort order. OpenAPI automatically documented. Strong Pydantic validation, typed responses, careful field-level NULL semantics, HTTP 422 for bad input, 404 for missing SKU, 409 for conflicting publication, 429 for rate-limited endpoints. Avoid leaking draft/admin attributes into public API.

## 13. Technology choices & repo layout

**Preferred:** Next.js + TypeScript (React UI), Tailwind CSS (or similarly lean CSS system), FastAPI + Python, PostgreSQL, SQLAlchemy + Alembic, Pydantic, pytest, Playwright, Docker Compose, CI via GitHub Actions. This is a proposal; assess existing repo before introducing frameworks or packages. Zero-cost development should work locally without paid APIs.

```
upgradeatlas/
  apps/web/                 # Next.js UI, i18n, accessible components
  services/api/             # FastAPI routes, domain services, validators
    app/models/
    app/schemas/
    app/routers/
    app/services/
    app/repositories/
    migrations/
  data/fixtures/            # synthetic seeds, cited approved references
  docs/
    PRD.md
    ARCHITECTURE.md
    DATA_SOURCES.md
    DATA_DICTIONARY.md
    ERD.md
    SECURITY.md
    DECISIONS.md
    TEST_PLAN.md
  tests/                    # as suited to monorepo
  compose.yaml
  .env.example              # zero real secrets
  README.md
  LICENSE                   # choose only after owner review
```

**DevOps:** Local containerized PostgreSQL; simple deployment path selected only after hosting constraints are known; no claim that free-tier hosting will remain free. CI runs migrations, lint/type checks, backend tests, build, frontend tests, basic e2e. Add backup/restore test before handling real users.

## 14. Security, privacy, accessibility, and legal

- OWASP-style threat review: SQL injection (parameterized ORM/queries), XSS, CSRF where applicable, auth/session controls, broken access control, SSRF from admin-supplied links, untrusted content, rate limits, secrets management, malicious file uploads.
- Start with guest-only browsing; admin login behind secure sessions and least privilege. If public accounts introduced, use maintained auth library, strong password hashing, email verification, reset flow, deletion/export, and no exposed credentials in client code.
- Never send arbitrary submitted source URLs to internal/private network endpoints; strict allowlists or safe egress controls.
- Keep minimal personal data; explicit consent if alerts/analytics added; clear retention policy; protect email and saved preferences; don't store unnecessary device identifiers.
- Review applicable Egyptian data-protection requirements with qualified counsel before commercial public launch. Do not treat this document as legal advice.
- Protect source licenses/copyrights and trademarks; make affiliate relationships conspicuous.
- For product images, use authorized media/attribution or self-produced placeholders.
- WCAG 2.2 AA ambitions: semantic headings, keyboard operability, focus styling, meaningful alt text, responsive RTL, locale switching.

## 15. Test strategy & acceptance evidence

### Required automated tests
1. DB migrations apply cleanly to empty PostgreSQL; rollback tested where appropriate; uniqueness/check/FK behavior verified.
2. Exact SKU matching disambiguates family variants; fuzzy query never silently maps to incompatible part numbers.
3. `unknown` compatibility is NEVER rendered as `supported`; conflict blocks publication when material.
4. Soldered-only RAM excludes laptop from hard RAM-upgradable requirement.
5. Missing price does not become free; stale offers show timestamps; no invented stock.
6. Comparison handles mismatched/unknown optional fields and 2–4 SKU limits.
7. Ranking is deterministic and explanations trace to matching criteria; money spent on sponsorship does not secretly increase organic match score.
8. API rejects invalid budgets, negative money, unknown enum states, abusive pagination, unauthorized admin writes.
9. Admin changes write audit events; evidence changes may require re-review.
10. Data ingestion handles broken URLs/timeouts/conflicting specs without destructive overwrite.
11. RTL layout tests, keyboard interactions, mobile viewports (360, 390, 768, 1440 px), light/dark, 200% zoom.
12. Core flows operate without AI/API keys, and without network access except seeded DB where applicable.

### Demo acceptance checklist
- [ ] 20–30 SKU identities present, with each **verified** record showing at least one accountable source; synthetic fixtures clearly labeled.
- [ ] Student can search, budget-filter, compare 3 SKUs, and see why two differ.
- [ ] User can locate an exact SKU and see RAM/SSD upgrade evidence and uncertainty.
- [ ] Upgrade-or-replace math correct with editable EGP inputs.
- [ ] Admin can draft, verify, publish, and audit a changed compatibility fact.
- [ ] Tests, migrations, local launch, docs, and screenshots can be reproduced by reviewer.
- [ ] No unsupported live-price, available-stock, review, benchmark, or compatibility claims.

**Performance goals (targets, not measured):** median basic catalog API response below 300 ms against 1000 local SKU fixture records; responsive catalog UI on normal midrange mobile; no unbounded queries; benchmark conditions and methods documented. No measured claim until run.

## 16. Delivery phases and stopping gates

### Phase 0 — Discovery and permissions
Review repo/environment and project instructions. Competitive mapping, user interviews, choose first 20–30 actual Egyptian-market SKU candidates, collect source/rights matrix, draft ERD and UI wireframes, risks and architecture decisions.
**Gate:** Product scope fixed; reliable identity/provenance path demonstrated for at least 5 sample SKUs. If not, reduce data ambition.

### Phase 1 — Database/API foundation
Migrations, typed schemas, source evidence, catalog CRUD, seed data, role checks, tests.
**Gate:** Deterministic tests, FK integrity, source fields and unknown handling.

### Phase 2 — Frontend and finder
Catalog, details, filters, bilingual i18n, accessibility, comparison, algorithm and clear explanations.
**Gate:** Three end-to-end journeys work on mobile and desktop with test data.

### Phase 3 — Upgrade advisor
Exact-identifier flow, verified RAM/SSD slots, conflict logic, cost comparison.
**Gate:** No unsafe compatibility guess; evidence displayed.

### Phase 4 — Retailer offers and reliability
Permissioned data sources, offer timestamps, manual admin refresh, monitoring, deploy instructions, security, backups, documentation.
**Gate:** Production demo with honest provenance and reproducible tests; no invented partnerships.

### Phase 5 — Later commercial features (only if validated)
Saved searches, opt-in price alerts, licensed feeds, partner tracking, advance cost models, user reviews with anti-spam, paid reporting, benchmark datasets only under rights and sound methodology.

## 17. Product metrics and validation

**Early user research:** Speak with 10–15 potential Egyptian laptop buyers across budget ranges; present 2–3 real buying dilemmas. Measure problem intensity and whether respondents can correctly identify exact SKU. Speak with 3–5 retailers about whether referral tracking or approved feeds are possible.

**MVP metrics:** search → laptop detail CTR; finder completion; comparison usage; exact-SKU match rate; verified-attribute coverage; conflicting-fact backlog; source freshness; outbound offer clicks. Avoid treating outbound click as a verified sale.

**Monetization hypotheses, not guaranteed:** future affiliate/referral agreements, clearly labeled sponsored retail placements, possibly paid high-effort reports if buyers demonstrate willingness to pay. Do not implement checkout or collect commission before agreements. Avoid recurring subscriptions without a repeat-value hypothesis.

## 18. Risks and mitigation

| Risk | Severity | Mitigation |
|---|---|---|
| Wrong compatibility damages trust | Critical | Exact SKU + evidence required; unknown rather than fabricated answer; editorial gates |
| SKU variations / retailer title mismatch | High | Explicit identifier matching, region variants, manual mapping, never fuzzy auto-certify |
| Retailer prices stale | High | Timestamps, freshness warning, permitted refresh, no stock guarantee |
| Unlicensed scraping or product imagery | High | Source rights log, permission/partnership, original placeholders |
| No viable monetization | High | Validate before paid work; launch useful free catalog |
| Over-engineering / agent hallucinations | High | Strict MVP, one phase at a time, test logs, source-backed claims |
| Paid ranking undermines trust | High | Sponsor labels, organic ranking independence |
| Free hosting changes/outages | Medium | Portable containers, backups, independent exportable database |
| Regional hardware variants | High | Exact part number and source-level scope |

## 19. Open questions — resolve through discovery, not fabrication

1. Initial scope: gaming laptops, general student devices, or both? Recommended start **gaming + CS/student laptops sold in Egypt**, but ensure a manageable list.
2. Data providers and legal permissions: which Egyptian retailers offer APIs, approved feeds, referral contracts, or simple permitted manual references?
3. Language: Arabic-first with English from day one; exact Egyptian Arabic copy vs standard Arabic editorial guidelines.
4. Accounts: optional favorites later. MVP guest-first.
5. Legal identity/license: source code license **not selected**; owner must approve before publication. Public GitHub does not imply commercial-use restrictions by default, and trademark/data rights are separate concerns.
6. Deployment: free/low-cost constraints, database hosting, domain ownership, and expected traffic remain to be decided.
7. How to verify exact regional SKUs available in local offers; set up a repeatable human-review workflow.

## 20. Exact instructions to Lain (copyable agent execution contract)

**Mission:** Build a professional, maintainable UpgradeAtlas MVP for Egyptian consumers using the specification above and actual repository constraints. Prioritize correctness, a great UX, explicit uncertainties, and reproducible tests—not inflated claims or broad feature counts.

1. Inspect repo, workspace, tests, dependencies, git state, config, and applicable skills. **Do not overwrite or delete existing user work.** Create a clear `docs/DECISIONS.md` and record gaps against this spec.
2. Audit relevant skills and select only those needed for the current task (database design, backend/API, UX/a11y, security, testing, documentation). Avoid flooding every subagent with all skills.
3. Propose minimal implementation sequence with precise acceptance checks; start Phase 0 and Phase 1. Only begin feature work after identity and evidence model is sound.
4. Use Postgres as source of truth and database migrations for all changes. Never pretend demo records are real laptop/price/stock facts.
5. Research using trusted manufacturer sources and record exact SKU, citations, provenance, rights, and timestamps. If browsing or source access is unavailable, seed *synthetic* demonstration data and report the limitation.
6. Implement deterministic recommendations and strict compatibility rules; never let an LLM invent part compatibility. Only introduce AI later if useful, grounded, and cost-justified.
7. Implement the complete buyer journey and upgrade journey in accessible Arabic/English UI with good empty/error states, responsive layout, and polished but not gaudy visual design.
8. Test at database, API, frontend, E2E, accessibility, and security levels. Show command output, pass/fail counts, reproducible logs, and note untested aspects. Do not claim verified completion if environment failures block tests.
9. Keep changes reasonably scoped. Before any irreversible action, migration affecting real data, publication, live connector access, or changes to billing/security settings, request owner approval.
10. At each completed phase, output: files added/changed; decisions; exact commands run; evidence of working behavior; current known defects; limitations; next scoped phase. Do not claim work done by subagents without independent verification.
11. Do not publish to a public repository, enable spending, sign up retailers, scrape at scale, or deploy publicly without explicit owner authorization.
12. Reply in the same language used by the user; project UI supports Arabic/English.

**First response required from Lain:** repo/environment audit, concise architecture and ERD proposal, 5-SKU verified-source feasibility check (or clear inability to access sources), then a phased plan with file-level implementation sequence. Once audited, begin building Phase 1 without inventing data.

---

## Appendix A — Official/reference links (verify before relying on currentness)
- Lenovo PSREF: https://psref.lenovo.com/
- Example Lenovo PSREF demonstrating soldered RAM and limited slots: https://psref.lenovo.com/Product/2208
- Example Lenovo specifications distinguishing soldered RAM + SO-DIMM: https://support.lenovo.com/us/en/manuals/um928101
- Example Lenovo specifications showing battery-dependent storage options: https://support.lenovo.com/gb/en/manuals/um928309-product-specifications-reference-psref-lenovo-v15-g4-abp
- Egypt price-comparison competitor: https://www.egprices.com/en/category/computers/laptops
- Crucial compatibility tools: https://www.crucial.com/
- iFixit: https://www.ifixit.com/

## Appendix B — Explicit non-goals and ethical assertions
- Never invent a retailer, price, discount, sale, promotion, installment plan, technical limit, wattage, or stock status.
- Never present external web content as reusable simply because it is accessible online.
- No hidden paid placement; referral marketing must be labeled and comply with applicable terms.
- Never interpret a missing OEM maximum as confirmation of incompatibility or compatibility.
- Do not use scraping workarounds to bypass access controls; preserve rate-limit and consent constraints.
- Preserve user ownership of original work and keep public GitHub publication as a deliberate owner decision.
