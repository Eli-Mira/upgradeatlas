# Post-approval implementation plan — preserve the working product

Status: PLAN ONLY. No permission to implement the full redesign. Eli must first approve the three rendered prototype designs. Comparison/upgrade pages need their own visual extension gate, not silent rollout.

## Source authority and path scope

The only current design implementation is `index.html` -> `src/prototype.jsx` and its imported prototype modules; see `FRONTEND_ARCHITECTURE.md`. The rejected unmounted attempt is removed and recoverable only through Git tag `legacy-prototype-frontend-final-2026-10-18`.

Every abbreviated application path in sections 2–5 below is relative to the separate, preserved `apps/web/src/` integration target, not this laboratory's source directory. This is a future integration plan, not a declaration that the retired laboratory files still exist or run. Eli authorized the archive/retirement commits only; production integration remains unapproved.

## 1. Approve design boundaries and capture a rollback point
Review final screenshot matrix and unresolved independent critique. Approve homepage, catalog and calculator explicitly (or identify one revision). Before later source edits, save byte-exact copies of only files authorized for integration; keep all existing dirty/untracked work. Do not reset, stash, merge or migrate to manufacture a clean repository. Current source-baseline.json hashes 88 original frontend/backend source/config/test files; source-preservation.json records current equality, not a database checksum or a rollback archive.

## 2. Adopt tokens and homepage presentation without routing changes
Targets after approval: apps/web/src/index.css; components/Nav.jsx, Footer.jsx; pages/Home.jsx; site-copy.js locale copy; a scoped original product-visual component/assets. Preserve App.jsx:18–29 useRoute/useCompare/locale state and document lang/dir. Keep lib/router.jsx useRoute/matchRoute/Link and its modifier-click handling; do not copy the prototype's standalone route/query-language mechanism into the application. Refine globals carefully: don't let prototype button/input selectors leak into preserved calculator styles. Remove unsupported coverage/officialness statistics rather than cosmetically rewriting them. Original concept images stay labeled; they are not manufacturer SKU photography.

Verification: actual navigation in both locales, browser Back/Forward, skip/focus, mobile menu, poster failure/reduced-motion/3D lifecycle and no canvas layout shift. Render matching reference screenshots again before proceeding.

## 3. Transfer catalog view, not illustrative data or local prototype state
Targets after approval: pages/Catalog.jsx, components/SkuCard.jsx, CompareTray.jsx as needed. Retain Catalog request/loading/error/abort behavior and lib/api.js fetchLaptops (q, page, per_page, min_ram_gb, brand, use_case, max_price) unchanged unless separately approved. Real rows/pagination/provenance/unknown fields remain authoritative. Replace prototype fictional products with real returned rows; exact partNumber identity is preserved. Unknown offer != EGP0. No prototype illustrative sample value, fake retailer or generic chassis image may become a verified SKU assertion.

Keep lib/compare-store.js useCompare, MAX4, sessionStorage key upgradeatlas.compare, duplicate/full guards, subscription behavior and storage-failure fallback. Bind new comparison controls to has/toggle/remove/clear/isFull; do not transplant the prototype's in-memory sample selection. Existing SkuDetail navigation stays valid. Product imagery uses a documented generic concept placeholder until exact image/reuse provenance exists.

Verification: loading/empty/error, literal/Unicode search, filter reset, sort/pagination, 4-item cap, duplicate selection, refresh persistence, storage unavailable, add -> tray -> existing table and meaningful unavailable-price/provenance states in EN/AR. Existing backend contract tests remain separate from visual review.

## 4. Replace calculator markup; keep arithmetic and request lifecycle
Targets after approval: components/UpgradeCalculator.jsx render section and scoped UpgradeCalculator.css; localized labels in i18n.js as required. Retain COST_FIELDS, normalizeCost and isValidCostString from src/costValidation.js. Preserve UpgradeCalculator.jsx:16–24 edit invalidation/abort; :26–63 submit (requestId, AbortController, pending guard, first-error focus, 422 field mapping, allowed result options, decimal-string response validation and stale-response protection).

The production POST /api/v1/upgrade-or-replace remains server-authoritative. Map its exact string fields upgrade_total_egp, replacement_total_egp, cost_difference_egp, lower_cost_option into the approved analytical view. The isolated prototype's local integer-cent preview is demonstrative, not a reason to replace Laravel arithmetic. Charts use one zero-origin scale and a semantic numeric alternative; do not add ROI, performance uplift or compatibility verdicts. Production should begin with honest empty/result states, not silently apply the prototype's example values to a real user.

Verification: existing4validation/localization tests plus actual happy/equal/replacement-lower/zero cases, Arabic/Persian digits, invalid/large/decimal boundaries, 422/network/malformed responses, rapid edit while request pending, late response/unmount, chart labels/scale, keyboard and mobile result reading order.

## 5. Extend only after separate checks, then ask before publishing
Keep Laravel/PHP, PostgreSQL schema/data, APIs, provenance policy and upgrade logic unchanged. This round does not redesign pages/Compare.jsx, Upgrade.jsx or SkuDetail.jsx beyond the demonstration state in the isolated catalog. Extend the approved visual system to those pages only after Eli authorizes their next scoped prototype/check.

Final acceptance: run safe frontend build and focused tests; backend tests only against verified isolated test DB configuration, never production DB. Capture actual EN/AR desktop/tablet/mobile views and independent visual criticism. Passing tests prove specified behaviors only. No publishing, deployment, commit/merge or destructive change without separate authorization.

## Present-round preservation evidence
- Existing app/frontend and catalog API returned HTTP200 before prototype implementation.
- Four existing cost validation/localization tests passed before edits to isolated prototypes.
- Original source preservation is independently checked by scripts/snapshot.py verify. No original application source has been intentionally edited this round.
- Database data was not snapshotted or compared; no database write/migration is part of this round. Do not claim byte-identical DB contents from source hashes.
