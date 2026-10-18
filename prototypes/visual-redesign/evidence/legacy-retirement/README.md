# Legacy frontend retirement — verification

## Scope and preservation

Active branch: `main`. Only the unmounted frontend inside `prototypes/visual-redesign` was retired. The separate `apps/web` API-connected application, Laravel backend, database and unrelated uncommitted work were not replaced or reset.

Initial discovery contradicted the assumption that the legacy files were already committed: the entire prototype directory was untracked. Preservation was therefore performed before deletion:

1. `1307f3a8b733e3f7405bc824720a3b9d07324b12`: preserve the 15 legacy source files.
2. `35d0b3e47f6fca2197e845a4503cf5a1263cb427`: preserve the complete laboratory source, assets, docs, tests and evidence, excluding build/cache/local scratch files.
3. `5559b44d6602b5721b7284383815be5d8aea38b0`: preserve exact original line endings in the legacy catalog file. Git's cached index needed an explicit scoped renormalization after applying `-text` attributes.

Final archive branch: `archive/pre-prototype-frontend`.
Annotated tag: `legacy-prototype-frontend-final-2026-10-18`.
Both resolve to final snapshot `5559b44d6602b5721b7284383815be5d8aea38b0`.

Every legacy blob was compared byte-for-byte before deletion. All 15 were also retrieved from the tag into isolated scratch and checked against their original SHA-256 digests. There was no unique uncommitted legacy content left behind. The archive refs are local; no push, force-push or history rewrite was performed.

## Deleted paths

All paths below are relative to the laboratory, not `apps/web`:

- `src/App.jsx`, `src/main.jsx`, `src/index.css`.
- `src/pages/Calculator.jsx`, `Catalog.jsx`, `Home.jsx`.
- `src/components/CompareTray.jsx`, `Footer.jsx`, `Nav.jsx`, `Reveal.jsx`, `SkuCard.jsx`, `States.jsx`.
- `src/lib/compare-store.js`, `i18n.js`, `router.jsx`.
- Superseded self-report `evidence/implementation.md` (also preserved in the archive).

The retired source directories no longer exist. No duplicate legacy code was moved elsewhere in the active tree. Root README/architecture, laboratory README/architecture, coordinator report/status, UX contract and future-integration plan now identify the mounted prototype as the only design authority. Historical production-source hash inventories remain clearly scoped to the separate application.

## Import/reference proof

`reference-scan.json` records 13 reachable modules and 19 local import edges, including the dynamic studio import and the read-only shared input validator. All local imports/assets resolve. A project-wide first-party import scan covered 54 code files and found zero imports to any retired file. The active laboratory JS/CSS/HTML contains zero literal retired-path references. Archive inventories and recovery instructions intentionally name the deleted paths; they are not active imports.

All eight mounted source files are byte-identical to pre-removal inputs. `tests/frontend-authority.test.js` prevents retired files or a second entry from returning and checks the current literal import graph. The static scan handles current literal imports; the actual Vite build independently checks compilation.

## Fresh execution evidence

| Check | Direct exit | Observed result |
|---|---:|---|
| `npm test` | 0 | 9 passed, 0 failed: 6 preview arithmetic tests and 3 authority/import/retirement guards |
| Native Python `tests/functional_qa.py` | 0 | 24 page/locale/viewport checks; 30 interaction records; failed=0; six QA screenshots regenerated |
| Native Python `tests/smoke.py` | 0 | All six route/locale controls passed |
| `npm run build` | 0 | Vite build succeeded; the existing optional 543.07 kB studio chunk warning remains |
| Native Python `tests/built_browser_qa.py` | 0 | Fresh built output on loopback port 5175: 24 responsive EN/AR page checks and 2 interaction journeys passed; zero recorded console/runtime errors, warnings, failed requests or HTTP errors in the page matrix |
| Native Python `scripts/snapshot.py verify` | 0 | 88 protected source/config/test files unchanged, no additions/removals |

The built-preview journeys exercise cap-four comparison, difference rows, native dialog Escape/focus restoration, Arabic/Persian calculator input, equality, stale-result removal and a zero replacement cost. Six built-preview mobile screenshots are included. A direct screenshot inspection found the Arabic catalog populated with all six images and no obvious blank/clipped layout; this is not visual approval or WCAG certification.

Raw stdout/stderr and individual command receipts are stored beside this report. `tested-inputs.json` binds the exact source/test/config bytes; `build-sha256.json` binds emitted build files. Existing functional QA records are also inspected programmatically because that inherited runner can exit zero even when its failure count is nonzero. No existing assertion was weakened for this retirement.

`preflight.json` freezes the dirty working state. Verification compares 233 unrelated files unchanged, excluding the two intentionally updated root documents. The separate 88-file production-source guard also passed. Full machine containment, database-content equality and Safari/Firefox/real-phone/screen-reader testing are not claimed.

## Read-only recovery

From the repository root:

```bash
git show legacy-prototype-frontend-final-2026-10-18:prototypes/visual-redesign/src/App.jsx
```

Use an isolated archive worktree for a full historical comparison; never reset or check out over the existing dirty working tree. Current authority is `index.html` -> `src/prototype.jsx`, documented in `../../FRONTEND_ARCHITECTURE.md`.
