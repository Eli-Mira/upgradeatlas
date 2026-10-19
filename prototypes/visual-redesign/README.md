# UpgradeAtlas — visual-redesign laboratory

Status: the gaming-laptop research build is mounted and running. No user visual approval and no production rollout.

## What this laboratory now holds

The design study was replaced on 2026-10-20 with the **UpgradeAtlas field-guide build**: an
Egypt-first gaming-laptop research instrument with sourced hardware profiles, a confidence
model, and a research-library catalogue. The previous three-page prototype (home / laptops /
calculator) with fictional configurations and a cost workbench is **archived, not active**.

### Provenance of the current build

The build was recovered from artefacts the user supplied, not rewritten from scratch:

| Artefact | How it was recovered | Status |
|---|---|---|
| `src/index.css` (157 KB) | The complete real stylesheet, serialised from the browser CSSOM of the user's saved page. Tailwind v4.3.3 output plus the app's own 151 unlayered class rules, the `--atlas-*` token set, the 10 keyframes and the mobile media queries. | Byte-faithful |
| `src/main.tsx` | Original TypeScript recovered from the `sourcesContent` of the Vite source map embedded in the saved entry module. | Byte-faithful |
| `assets/hero-laptop.webp` | The hero's rendered Three.js output, recovered from the supplied full-page PNG and cleaned of the adjacent headline pixels by gradient extrapolation. A still, not the live scene. | Reconstructed still |
| `src/App.tsx`, `src/pages/*`, `src/components/*`, `src/data/*` | Reconstructed from the saved DOM. Every element in that DOM carried `data-replit-metadata` naming its source file and line, so the component tree, class contract and copy are exact; the component bodies are new. | Reconstructed |
| `src/data/profiles.ts` | The four real hardware profiles, verbatim from the saved catalogue DOM (model names, part numbers, SKUs, processors, GPUs, memory, storage, confidence level). | Exact |
| Lucide icon set | The six icons the DOM used, inlined as SVG in `src/components/icons.tsx` with the same paths and classes. No `lucide-react` dependency. | Exact |

### What is **not** recovered

- The original source of `App.tsx`, `catalog.tsx`, `laptop-card.tsx`, `page-heading.tsx` and `index.css`.
- The live Three.js hero scene. The `.scene-frame` / `.fallback-art` / `.scene-coordinate` /
  `.visual-readout` contract is intact, so restoring a real scene is a component swap, not a redesign.
- The `/gaming`, `/compare`, `/upgrade` and `/laptops/:slug` pages were **not captured**, so
  they have since been rebuilt against the class contract the recovered stylesheet already
  carried (`.gpu-reference*`, `.comparison-grid`, `.calculator-layout`, `.profile-*`,
  `.result-*`). Their layout is a reconstruction, not a recovery.
- The Arabic copy of the recovered pages is new, written against the same class contract. The
  recovered stylesheet has no `[dir=rtl]` rules, so RTL is a first-class locale that the original
  stylesheet only partially mirrored.

## Contract

- All new design work stays under `prototypes/visual-redesign/`. `apps/web` and `services/api` are read-only.
- No backend, database, API or business-logic edits; no migrations, deployment or publishing.
- The product is honest by construction: **no prices, no stock claims, no invented specifications**.
  Every profile is a research record, and a family-level reference is labelled as such.
- Screenshots and independent criticism are required; passing builds do not confer visual acceptance.
  Eli alone approves full-site rollout.

## Running

Run `npm run dev` from this directory only. `http://127.0.0.1:5174`.

| Page | English | Arabic |
|---|---|---|
| Field guide | `/?lang=en` | `/?lang=ar` |
| Research library | `/laptops?lang=en` | `/laptops?lang=ar` |
| Research record | `/laptops/<slug>?lang=en` | `/laptops/<slug>?lang=ar` |
| Graphics desk | `/gaming?lang=en` | `/gaming?lang=ar` |
| Comparison | `/compare?lang=en` | `/compare?lang=ar` |
| Cost workbench | `/upgrade?lang=en` | `/upgrade?lang=ar` |

`?lang=` controls document language and direction. The header's `EN | ع` control switches it live.

Dependencies: the laboratory reuses `apps/web/node_modules` through the aliases in
`vite.config.mjs`; `react-router-dom` is the one local dependency, in this directory's
`node_modules`. Nothing is installed into `apps/web`.

## Checks

- `npm test` — source-authority guards (the document entry, the mounted chain, the absence of the
  retired legacy tree, the design tokens, the uniqueness of the profiles) and a copy-integrity
  guard that fails if any referenced interface string is missing from a locale.
- `npm run build` — real Vite production compilation.
- Browser sweeps were run with Playwright across 12 widths (320–1904) × 3 routes × 2 locales:
  no console errors, no page errors, no horizontal overflow.

## Archive

Two generations of archived source exist in Git. Both are local, not pushed.

| Generation | Branch | Annotated tag | Commit |
|---|---|---|---|
| Pre-archive experimental frontend | `archive/pre-prototype-frontend` | `legacy-prototype-frontend-final-2026-10-18` | `5559b44` |
| Previous three-page prototype (this build's predecessor) | `archive/pre-replit-prototype` | `prototype-pre-replit-20261020-011151` | see `git rev-parse` |

Do not restore either generation into the active source directory. See
`FRONTEND_ARCHITECTURE.md` for the import graph, archival scope and safe recovery instructions.
The separate `apps/web` API-connected application remains untouched; this is not a production migration.
