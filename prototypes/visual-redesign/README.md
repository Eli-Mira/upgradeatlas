# UpgradeAtlas — isolated visual redesign laboratory

Status: THREE PROTOTYPES RENDERED; independent visual and functional review in progress. No user visual approval and no production rollout.

## Contract
- Deliver three distinct but coherent responsive prototypes: cinematic homepage, industrial laptop catalog, analytical dark calculator.
- Keep React + JavaScript + Tailwind; reuse existing installed tooling without modifying apps/web/package.json or lockfile.
- All new design work stays under prototypes/visual-redesign/. Existing apps/web and services/api are read-only for this round.
- No backend, database, API or business-logic edits; no migrations, deployment, publishing or merges. The explicitly authorized frontend archival/retirement commits are the only exception to the original no-commit boundary.
- All prototype products, numbers and prices must be visibly labeled illustrative. No invented verified specifications, retail offers, testimonials, coverage counts or compatibility advice.
- Original art or assets with verified free reuse rights only. Reference images remain private study material, not assets.
- Desktop 1440px, tablet 834px, mobile 390px and narrow 320px checks. Arabic RTL and English LTR are distinct compositions, not only mirrored screenshots.
- Screenshot review and independent criticism are required; passing builds do not confer visual acceptance. Eli alone approves full-site rollout.

## Current reference authority
The newest user brief overrides earlier light/cobalt drafts. Black/graphite, white typography, restrained #e5484d red, #3dd68c only for positive analytical states, 8px surfaces and 4px controls, no pills or decorative glows. References A cinematic hardware, B industrial typography/grid, C analytical clarity. Study SHAGA Odyssey principles without copying artwork or layout.

The user's brief controls the design. Premium quality here means composition, material lighting, hierarchy and readability—not pills, giant whitespace or decorative glows. Skill application must remain specific to this brief and supported by rendered evidence.

## Specialist ownership
A Creative Director: research/art-direction.md and research/reference-evidence/ only; public references and saved reference mapping, no app code.
B UI/UX Designer: research/ux-spec.md only; responsive/locale/component specs, no app code.
C Motion/Visual Engineering: assets/ and motion module only after a concrete direction contract; no page files.
D Frontend Implementation: isolated prototype page/styles only after direction synthesis; no production integration.
E Independent Visual QA: reviews/ only; independent baseline then prototype screenshot critique; never implementation.
F Functional/Accessibility QA: tests/ and evidence/ reports only; run actual browser checks, no implementation.
Coordinator: scope snapshots, tooling, integration, consolidated evidence and final rollout plan.

## Acceptance evidence
- Three visually complete rendered pages, interactive representative states.
- EN/AR screenshots for each page at desktop, tablet and mobile; screenshot manifest generated from files, no hand-counted claims.
- Exact source URL, observed pattern/type/layout/motion, application, reuse boundary and access limitation for every selected reference.
- Skill Execution Matrix: installed vs inspected/loaded vs applied with tangible evidence; no artificial quota.
- Independent differences/findings, bounded correction rounds, unresolved limits.
- Existing source hash preservation and existing working tests verified separately from prototype checks.

## Current running prototype
Run `npm run dev` from this laboratory only. Existing installed application dependencies are reused by the laboratory's Vite config; no package installation is needed. Prototype server: `http://127.0.0.1:5174`.

| Page | English | Arabic |
|---|---|---|
| Homepage | `/?lang=en` | `/?lang=ar` |
| Catalog | `/laptops?lang=en` | `/laptops?lang=ar` |
| Calculator | `/calculator?lang=en` | `/calculator?lang=ar` |

**Sole authoritative frontend implementation in this laboratory:** `index.html` -> `src/prototype.jsx`. Its pages are `src/prototype-home.jsx`, `src/prototype-catalog.jsx` and `src/prototype-calculator.jsx`; shared UI/data/styles are `src/prototype-ui.jsx`, `src/prototype-data.js` and `src/prototype.css`; local preview arithmetic is `src/prototype-calc.js`. The original concept viewer is `motion/StudioLaptop.jsx`.

The unmounted historical frontend and its superseded implementation report have been removed from this working tree. They exist only in Git: branch `archive/pre-prototype-frontend`, annotated tag `legacy-prototype-frontend-final-2026-10-18`, commit `5559b44d6602b5721b7284383815be5d8aea38b0`. Do not restore or review them as active code. See `FRONTEND_ARCHITECTURE.md` for the import graph, archival scope and safe recovery instructions. The separate `apps/web` API-connected application remains untouched; this retirement is not a production migration.

Current visual evidence: `screenshots/iteration-2/manifest.json` and its 18 actual browser captures. Captures use reduced motion for stable stills; optional on-demand 3D has separate runtime checks. All six fictional catalog configurations and initial calculator amounts are explicitly illustrative. No production data/state or local preview arithmetic is authorized for transplant into the live application.

Checks: `npm test` (preview arithmetic and frontend-authority/import guards); `npm run build`; native Python Playwright `tests/functional_qa.py` and `tests/smoke.py`. Retirement-specific raw outputs and built-preview browser checks are in `evidence/legacy-retirement/`. Final independent visual approval and later capture corrections remain separate gates. `scripts/snapshot.py verify` compares the original 88 protected source/config/test files; that does not prove database contents byte-identical.
