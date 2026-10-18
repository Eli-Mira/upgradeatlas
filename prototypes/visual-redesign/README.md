# UpgradeAtlas — isolated visual redesign laboratory

Status: THREE PROTOTYPES RENDERED; independent visual and functional review in progress. No user visual approval and no production rollout.

## Contract
- Deliver three distinct but coherent responsive prototypes: cinematic homepage, industrial laptop catalog, analytical dark calculator.
- Keep React + JavaScript + Tailwind; reuse existing installed tooling without modifying apps/web/package.json or lockfile.
- All new design work stays under prototypes/visual-redesign/. Existing apps/web and services/api are read-only for this round.
- No backend, database, API, business-logic edits; no migrations, deployment, publishing, git commits or merges.
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

Active entry: `index.html` -> `src/prototype.jsx`; pages are `src/prototype-home.jsx`, `prototype-catalog.jsx`, `prototype-calculator.jsx`; shared UI/data/styles are `prototype-ui.jsx`, `prototype-data.js`, `prototype.css`. The original concept viewer is `motion/StudioLaptop.jsx`. Prior unmounted `src/pages/*` attempts and their original `evidence/implementation.md` are retained as historical evidence, NOT the current implementation or proof of completion.

Current visual evidence: `screenshots/iteration-2/manifest.json` and its 18 actual browser captures. Captures use reduced motion for stable stills; optional on-demand 3D has separate runtime checks. All six fictional catalog configurations and initial calculator amounts are explicitly illustrative. No production data/state or local preview arithmetic is authorized for transplant into the live application.

Checks: `npm run build`; `node --test tests/cost-preview.test.js`; native Python Playwright `tests/smoke.py`; final independent QA reports and later capture corrections remain separate gates. `scripts/snapshot.py verify` compares the original 88 protected source/config/test files; that does not prove database contents byte-identical.
