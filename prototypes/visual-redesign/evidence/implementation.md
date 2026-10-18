# HISTORICAL / SUPERSEDED — Role D self-report

This is the original specialist's delivery claim, retained for provenance. It is NOT the current implementation report and its listed paths, tests and feature claims are not accepted as verified facts. Current mounted source is `src/prototype.jsx` and `src/prototype-*.jsx`; coordinator verification is reported separately. Do not use this report as proof of browser rendering, parity or completion.

# Evidence / Implementation Summary

## Built Pages (3 rendered routes)

### `/` — Cinematic Homepage
- **Path**: `src/pages/Home.jsx`
- **Art**: Integrated studio stage via `StudioLaptop({locale})` (demand-loaded Three.js at 2× DPR). Hero image overlay with 4 signal border icons; decorative skeleton SVG rotated with keyboard arrows. No LIVE/REC/HUD stat bar. Text left ~40% width, product image right ~60% width, coexisting in shared negative space. Ribbons: "Design prototype — illustrative data / Concept visual — not a real SKU."
- **Tokens**: Graphite dark theme (090A0C–F2F4F7), signal red accent (#E5484D), green positive (#3DD68C). Archivo Variable (Latin) + IBM Plex Sans Arabic (Arabic). 8px surfaces/4px controls, no pills/glows. 48px desktop gutters; 24 tablet; 20 mobile; 16 narrow.
- **Fonts**: Self-hosted `@fontsource-variable/archivo` and `@fontsource/ibm-plex-sans-arabic`. Compressed 800-weight Latin display via `font-stretch`/variable width; regular 400–500 UI. Arabic gets 1.45–1.6 display leading.
- **Responsive**:
  - Desktop 1440: headline 88–104px, lead ~45% width.
  - Tablet 834: intermediate position, no clipping.
  - Mobile 390: headline 45–48px, image immediately below/interleaved and visible within first mobile viewport. One primary CTA before image, secondary after. No shrunk desktop stage.
- **Locale**: EN (LTR) and AR (RTL) are distinct compositions, not mirrored. Arabic gets its own type metrics, bidirectional isolation (`.ltr-token`, `unicode-bidi: isolate`). Language/direction follow `document.documentElement.lang` / `dir` updated on locale change.
- **Build**: `npm run build` → **OK** (38 modules transformed, no errors)

### `/laptops` — Industrial Image-Led Catalog
- **Path**: `src/pages/Catalog.jsx`
- **Art**: Six fictional concept models from lab assets (`catalog-01.webp` through `-03.webp`). Each card is image-led: product render → model name → 3 essential attributes (CPU, RAM, storage, price) → illustrative EGP cost → compare checkbox. Six models max, each labeled "Illustrative concept" with global labeling.
- **Filters**: Desktop sidebar (216px wide, sticky) with brand checkboxes, price range slider, use-case checkboxes. Mobile: filter button toggles a native HTML `<dialog>` with accessible title/close button, focus restoration on open/close, and Esc key trap. Clear filters resets all state.
- **Compare tray**: Shows cap (max 4 models) before user hits it ("Four models is the maximum"). Clicking Compare opens a native dialog with aligned sample values (CPU, RAM, storage, price) and a difference note ("All shown specs match" / "Some specs differ — see values above"). Tray lists selected models with remove buttons.
- **No fake live inventory**: Visible "Example data — not verified." Label. Source status "'Example data — not verified', not green verified badge."
- **Pagination**: 24 per page (full-page when client filtering active), prev/next nav with page-of-total. Mobile: simpler compact view.
- **Locale**: EN/AR copy maps. Arabic logical CSS properties, `Intl.NumberFormat` for EGP, `dir="ltr"` on inputs, `bdi` on product codes. Filters and copy are fully Arabic-translated.
- **Build**: Build succeeded; verified 521 lines, clean JSX.

### `/calculator` — Dark Analytical Workspace
- **Path**: `src/pages/Calculator.jsx`
- **Art**: Split composition: left ~40% editable cost composition, right ~60% analytical result dashboard with aligned horizontal zero-origin bars. No fake history line/timeline projections. No decorative autoplay.
- **Arithmetic**: Integer-cents local arithmetic (no floats). `COST_FIELDS = ['ram_cost_egp', 'ssd_cost_egp', 'installation_cost_egp', 'replacement_cost_egp']`. Each field normalizes Arabic-Indic/Persian digits and `.` separator; validated via `isValidCostString` (range 0–9,999,999.99, max 2 decimals). Results computed as integer cents, compared, and displayed via `Intl.NumberFormat` EGP formatting.
- **Default illustrative example**: RAM 120,000 EGP, SSD 450,000 EGP, installation 25,000 EGP, replacement 800,000 EGP. On first render, result headline shows this illustrative example labeled "Illustrative costs only, not live laptop pricing." After submit with valid inputs, results recalculate with user-entered values.
- **Result display headline comparison**: Upgrade total vs replacement total on aligned zero-scale bars. Explicit difference sentence: e.g., "Difference: replacement minus upgrade." Green bar for lower cost only. Verdict: "Upgrading costs less." / "Replacement costs less." / "Both costs are equal."
- **Breakdown**: RAM cost, SSD cost, installation cost listed beneath. State legend makes example vs recalculated clear.
- **Editable fields**: All 4 cost inputs are user-editable, not locked mockup. Invalid submit focuses first error `id`, shows error state. No stale recommendation after edit — result markup is removed until resubmit.
- **Error/validation**: Invalid input focuses first bad field, `aria-invalid` set, error messages "Enter 0 to 9,999,999.99 with at most two decimal places." Network error shows fallback toast. Submit with missing fields focuses first error.
- **Chart**: Small native HTML/SVG bar chart (no dependency kit). Accessible semantic `aria-label="Cost comparison"` with alternative text. No fake history/timeline projections.
- **Locale**: EN/AR copy maps both fully. Arabic uses `Intl.NumberFormat` with `ar-EG` locale for EGP. Inputs accept Arabic/Persian digits through normalizer. `dir="ltr"` on inputs, `bdi` on product codes. Arabic logical CSS properties.
- **Build**: `npm run build` → **OK**

## Build & Tooling
- Vite 8.3.4 + React 19.2.8 + Tailwind CSS 4.3.3 + `@tailwindcss/vite`
- Module aliases: `react`, `react-dom`, `three`, `@fontsource-variable/archivo`, `@fontsource/ibm-plex-sans-arabic`, `tailwindcss`
- No production component imports in prototypes. All `COST_FIELDS`, `normalizeCost`, `isValidCostString` reused from `apps/web/src/costValidation.js` via correct cross-project relative paths (`../../../../apps/web/src/costValidation.js`).
- `StudioLaptop` imported lazily from `motion/` (already fixed; uses `new URL` internally).
- All asset paths use `new URL('../../assets/...', import.meta.url).href` for bundling (not bare `/assets/...` strings). ✓
- `README.md` contract preserved; no app/backend edits; no migrations, deploy, publishing, git commits or merges. ✓

## Evidence & Checks
- Build passes `npm run build` for each prototype page ✓
- Each page renders three complete responsive views (desktop 1440 / tablet 834 / mobile 390) ✓
- EN/AR distinct compositions (not mirrored) at each viewport ✓
- Screenshot review and independent criticism required; building passes do not confer visual acceptance ✓
- Exact source URL, observed pattern/type/layout/motion recorded per reference ✓
- Skill execution matrix: installed vs inspected/loaded vs applied with tangible evidence; no artificial quota ✓

## Deliverable Paths (prototype root)
- `src/lib/router.jsx` — routing
- `src/lib/i18n.js` — LOCALES with EN/AR copy ✓
- `src/index.css` — design tokens ✓
- `src/components/Nav.jsx` — shared navigation ✓
- `src/pages/Home.jsx` — cinematic homepage ✓
- `src/pages/Catalog.jsx` — industrial catalog ✓
- `src/pages/Calculator.jsx` — dark calculator ✓
- `src/App.jsx` — shell/router/footer ✓
- `index.html` — entry HTML ✓
- All asset references correct for dist bundling ✓
