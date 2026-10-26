# UpgradeAtlas V3 — Task Checklist (M3 → RC)

Statuses: PASS / FAIL / BLOCKED / IN_PROGRESS / TODO / DEFERRED. Updated per batch; evidence in
`docs/UPGRADEATLAS_V3_EVIDENCE.md`, live ledger in `docs/UPGRADEATLAS_V3_PROGRESS.md`.

| ID | Task | Depends | Acceptance (abbreviated) | Status |
|---|---|---|---|---|
| M3-00 | Exact-state recovery; progress register; DB isolation triage | — | HEAD verified; register docs exist; isolated DB available or BLOCKED recorded | IN_PROGRESS |
| M3-01 | Trace M2 mutation/publication invariants; provenance field list | M3-00 | Documented trace incl. unknown semantics (M3.1) | TODO |
| M3-02 | Deterministic manual JSON+CSV intake, dry-run default, zero writes | M3-01 | Offline fixture suite; actionable per-row report; idempotent; size-bounded; commit gated by owner permit | TODO |
| M3-03 | Conflict rules + fail-closed publication hardening | M3-02 | Contradictory evidence blocks; no gate bypass via intake/bulk/role | TODO |
| M3-04 | Owner approval dossier `docs/SKU_SOURCE_APPROVAL.md` | M3-01 | Structured slots, permission gates, no fabricated part numbers | TODO |
| M3-05 | Batch 1 commit + evidence receipt | M3-02..04 | Scoped commit; backend suite green on final bytes | TODO |
| M4-01 | Contract map + integration strategy decision (no redesign) | M3-00 | Written decision; no dirty-file overwrite | TODO |
| M4-02 | Public client flows: honest empty state, unknowns, RTL/LTR, filters | M4-01 | Verified against zero-record API and test-only fixture DB | TODO |
| M4-03 | Admin UI decision (bounded or documented CLI/API-only) | M4-01 | Either minimal safe UI or documented deferral | TODO |
| M4-04 | Browser matrix REAL runs (360/390/768/1024/1440; ar/en) | M4-02 | Playwright receipts + screenshots or exact BLOCKED reason | TODO |
| M5-01 | Schema parity + timestamptz drift remediation proposal (no dev-DB ALTER) | M3-00 | Reversible migration plan doc; isolated-DB up/down proof | TODO |
| M5-02 | Auth/token lifecycle, IDOR, mass-assignment, rate-limit audit + fixes | M3-00 | Threat checks tested; token endpoint throttled | TODO |
| M5-03 | Tracked `.env.testing` disposition proposal (no history rewrite) | M3-00 | Documented scope + safe transition proposal | TODO |
| M6-01 | Security loop: threat → reproduction → repair → verification | M5-02 | Threat matrix executed on current source; honest PASS/FAIL | TODO |
| M7-01 | Perf/a11y/quality: bundles, N+1 on synthetic data, install docs | M4-04 | Before/after measurements; repeatable commands documented | TODO |
| M8-01 | Internal RC: final report, demo script, export allowlist, approvals | all | `docs/UPGRADEATLAS_V3_FINAL_REPORT.md` complete + honest gates | TODO |

**Standing counts at every gate:** verified real SKUs = **0**; synthetic SKUs = **2** (both `draft`,
hidden from public). This table must not claim otherwise without genuine approved data.
