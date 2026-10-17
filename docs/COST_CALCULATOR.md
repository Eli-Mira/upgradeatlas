# Upgrade-or-replace cost comparison

## Scope and dependency policy

Use the existing Laravel/PHP and React/Vite/Tailwind toolchain. This feature adds no runtime packages, external services, API keys, subscriptions, hosted AI or paid components. Prefer built-in/platform capabilities before adding an open-source dependency. Free-tier hosted offerings are not assumed permanently free. The owner has not selected a license for the project's original code; dependency licenses do not select it automatically.

This is a manual, guest-accessible **cost-only** comparison. Blank fields are not zero; enter `0` explicitly where a cost does not apply. No hardware, retailer price, stock or performance data is inferred. No SKU is selected or certified by this calculator. It does not determine whether either option meets the buyer's requirements. No input/result is persisted by the calculator.

## API

`POST /api/v1/upgrade-or-replace`, JSON request:

```json
{
  "ram_cost_egp": "2000",
  "ssd_cost_egp": "0",
  "installation_cost_egp": "400",
  "replacement_cost_egp": "45000"
}
```

All four amounts are required **decimal strings**, from `0` through `9999999.99`, with at most two fractional digits. Canonical ASCII digits and `.` are accepted. JSON numbers, negative amounts, exponent notation, grouping separators and excess precision return HTTP 422 with Laravel field errors. All example prices above are illustrative user inputs, not retail offers.

```json
{
  "currency": "EGP",
  "input_source": "user_entered",
  "upgrade_total_egp": "2400.00",
  "replacement_total_egp": "45000.00",
  "cost_difference_egp": "42600.00",
  "lower_cost_option": "upgrade",
  "compatibility_assessed": false,
  "performance_equivalence_assessed": false
}
```

`upgrade_total = RAM + SSD + installation`. Difference is `replacement - upgrade`; negative means replacement costs less, not that replacement is technically better. All arithmetic uses integer piasters; JSON amounts remain strings with two decimal places. There is no floating-point rounding and no money library required. Limits keep sums within a signed 64-bit PHP integer (tested on PHP 8.3 x64).

## Test safety and evidence

`services/api/tests/TestCase.php` rejects non-testing environments, non-PostgreSQL drivers and any database other than `upgradeatlas_test` before test transaction traits execute. The calculator itself makes no database queries. Existing integration fixtures remain transaction-scoped in the separate test database. Do not use `migrate:fresh`, resets or `RefreshDatabase` on development data.

Fresh execution logs and JUnit output are in `docs/evidence/cost-calculator/`. The initial RED run returned 404 for the missing route; the GREEN suite verifies the final route and edge cases. `test-db-guard.log` is an **expected refusal**, not a passing application execution.

## Verified frontend and browser checks

The UI defaults to Arabic RTL and switches to English LTR, including the document language/direction. All fields begin blank. Arabic-Indic/Persian digits and the Arabic decimal separator are normalized to the API format; grouping separators are not guessed. There is no client-side money arithmetic. Results are invalidated on edits, requests are aborted and stale responses ignored. Errors are localized without copying raw backend messages.

Run `npm test`, `npm run lint`, and `npm run build` from `apps/web`. The standalone browser smoke script `test/calculator.browser.cjs` uses Playwright: reuse an existing installation via `PLAYWRIGHT_MODULE` and an existing Chromium via `CHROMIUM_PATH`, or provide Playwright in your test environment. This increment reused cached open-source tooling and installed nothing. Set `EVIDENCE_DIR` to an existing directory for JSON results/screenshot; start Laravel and Vite as described in the root README. The default tested app URL is `http://127.0.0.1:5173`.

Latest saved evidence: 30 backend cases / 230 assertions; 4 frontend helper tests; 8 browser scenarios; lint and production build exit 0. Browser scenarios include real Laravel calculations, RTL/LTR at four viewport widths, localized 422 validation, injected network failures with real retry, stale-request rejection and malformed-response rejection. Error-path responses are deliberately injected; successful arithmetic journeys use the actual Laravel API. These checks are not a complete WCAG audit, full product E2E suite or public-launch acceptance.

`database-before.json` and `database-after.json` match: unchanged normalized development schema and row-content fingerprints for all 25 existing tables. No migrations, seeds or resets ran against the development database during this increment. This verifies preservation for this increment only, not prior migration equivalence or backup recoverability.

## Existing limitations (not cleared by calculator tests)

- The earlier detail-panel and commit claims were incorrect: the workspace audit found no detail view and uncommitted upgrades endpoint changes. Preserve that work; do not claim it was shipped.
- The empty Laravel baseline does not recreate the schema or prove schema equivalence. Restore rehearsal, a portable Laravel-owned schema and full migration parity remain open.
- Existing public catalog/detail/upgrades routes expose draft data and raw, uncited hardware fields. Keep the app local-only until publication gates, evidence-aware responses and request validation are implemented. This calculator does not repair or certify those endpoints.
- Least-privilege runtime/test roles, credential hardening, auth/admin gates, abuse controls and deployment/reverse-proxy configuration need separate validation before public launch.
- No verified laptop/retailer source collection or compatibility certification was performed in this increment. Phase 2 is incomplete; a passing calculator is not full-product readiness.
