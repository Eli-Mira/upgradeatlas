# Manual intake schema (M3) — canonical JSON and CSV

The intake path is **offline, dry-run-first, and bounded**. It exists so that genuine hardware
research can be recorded reproducibly once the owner approves specific SKUs and sources — not as a
scraper and not as a bulk importer. `docs/SKU_SOURCE_APPROVAL.md` holds the permission gates.

## Command

```
php artisan laptops:intake <file.json|file.csv>            # dry-run (default): report only
php artisan laptops:intake <file> --report=out.json        # write machine-readable report
php artisan laptops:intake <file> --commit                 # REFUSED without INTAKE_OWNER_PERMIT
php artisan laptops:intake-template out.csv                # formula-escaped review template
```

- Dry-run never writes (proven by tests: zero row-count deltas, zero audit events).
- `--commit` applies all valid rows inside one transaction and refuses without a permit matching
  `UA-APPROVED-YYYY-MM-DD-<8 hex>` (issued by the owner; see the approval dossier).
- Bounded: ≤5 MB, ≤2000 rows, ≤40 columns, UTF-8, control characters rejected, JSON depth ≤32,
  malformed JSON rejected. URL references are **shape-checked only and never fetched** (no SSRF).

## Row types and natural keys (idempotent upsert)

| type | natural key | notes |
|---|---|---|
| `source` | `url` | `usage_permission_status` ∈ permitted/unclear/not_permitted — explicit, never inferred |
| `evidence` | source_url + locator + fact_scope | concise paraphrase only; no copyrighted copies |
| `brand` / `family` / `variant` | slug / (brand, slug) / (family, model, region) | identity chain per PRD §7 |
| `sku` | `manufacturer_part_number` | **status is server-owned: intake creates drafts only** |
| `ram_configuration` | one per SKU (upsert) | `max_meaning` ∈ manufacturer_tested/hard_limit/unknown |
| `storage_slot` | (sku, slot_index) | protocol ∈ NVMe/SATA/both/unknown |
| `compatibility_assertion` | (sku, component_class, evidence) | created **unreviewed** → publication gate stays closed |
| `offer` | (sku, retailer, product_url) | price = decimal string; change = new row + old deactivated, never overwrite |

Ordering requirement: define `source` and `evidence` rows **before** the rows that cite them.
Dependents resolve evidence by (source_url, locator [, fact_scope]).

## Provenance contract — what every public claim requires (M3.1)

A compatibility fact may only ever be published when all of the following exist and are retained:

1. **Identity**: manufacturer → family → variant (model code) → **exact** part number. Family-level
   similarity is never evidence for a specific SKU.
2. **Claim**: type, value, and units (e.g. `slot_count=2`, `standard=DDR5 SO-DIMM`,
   `documented_max_gb` with `max_meaning=manufacturer_tested` vs `hard_limit`).
3. **Source**: URL + publisher + explicit `usage_permission_status`. Publicly viewable ≠ reusable.
4. **Locator**: the section/table/field reference (no wholesale page copies).
5. **Paraphrase**: concise, independently worded; AI-generated text is never evidence.
6. **Time**: `observed_at` (when the source said it) + review date; stale (>365 days) warns.
7. **Reviewer**: an authenticated human (`evidence.reviewer_id`); `verified` is a human decision.
8. **Confidence**: `manufacturer_verified` / `reputable_independent` / `unverified`, with scope notes.

## Unknown semantics (never silently defaulted)

`unknown` = we looked and could not establish it (or have not looked). It is **not**:
- `not upgradeable` (a positive unsupported claim),
- `soldered` (a physical layout claim),
- `no documented slot` (a documentation-scope statement),
- `0` / blank / false.

Rule enforced in code: `documented_max_gb` must be **null** when `max_meaning=unknown`, and
**required** when it is not. A missing value never becomes a number.

## Conflicts (M3.3)

If an intake row contradicts a stored value that is backed by **verified** evidence
(RAM slot count / soldered / documented max / standard, storage protocol / occupancy / form factor,
SKU base RAM/SSD), the row is **not applied**: it becomes an open `conflict_flags` entry anchored to
the SKU, the stored value stays untouched, and the M2 publication gate then refuses to publish that
SKU until a human resolves the flag. Re-applying an identical accepted fixture changes nothing and
writes no audit events (tested).

## CSV mapping

The CSV uses the same field names as JSON in one flat header
(`IntakeValidator::csvHeader()`, 34 columns; each row fills the columns its `type` needs).
`evidence`/`retailer`/`component` sub-objects of JSON map to flat columns. CSV export for human
review escapes spreadsheet formula injection (cells starting `= + - @` get an apostrophe prefix —
tested). CSV input accepts quoted fields, embedded commas, and UTF-8 Arabic (tested round trip).
