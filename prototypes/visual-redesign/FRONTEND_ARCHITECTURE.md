# Authoritative frontend source

## One entry, one implementation

This laboratory has exactly one frontend implementation. `index.html` mounts `/src/main.tsx`;
it does not mount an alternative application shell.

```text
index.html
└── src/main.tsx                          React root, ErrorBoundary, LocaleProvider, BrowserRouter
    ├── src/App.tsx                       header, primary nav, locale switch, footer, routes
    │   ├── src/components/icons.tsx      inlined Lucide paths (menu, search, reset, arrows, check, plus)
    │   ├── src/pages/home.tsx            field guide: hero, manifesto, research desk, method, decisions
    │   ├── src/pages/catalog.tsx         research library: search, brand filter, confidence filter
    │   │   ├── src/components/page-heading.tsx
    │   │   └── src/components/laptop-card.tsx
    │   ├── src/pages/profile.tsx         one research record: specs, evidence, add to comparison
    │   ├── src/pages/compare.tsx         up to three profiles side by side
    │   ├── src/pages/gaming.tsx          the graphics desk, one record per GPU
    │   ├── src/pages/upgrade.tsx         the cost workbench: four entered figures, one comparison
    │   └── src/pages/not-found.tsx
    ├── src/data/locale.tsx               locale context, `lang`/`dir` on the document
    ├── src/data/compare.tsx              shared comparison selection, carried in `?compare=`
    ├── src/data/copy.ts                  all EN and AR interface copy
    ├── src/data/profiles.ts              the four sourced hardware profiles and the filter sets
    └── src/index.css                     the recovered design system (157 KB)
```

`src/index.css` is the real stylesheet recovered from the user's saved page, not a rewrite. It
carries the Tailwind v4.3.3 base plus the application's own 151 unlayered class rules, the
`--atlas-*` token set, ten keyframes and the responsive media queries. **Do not hand-edit it to
make a page look different**: the page components are what were reconstructed, and the stylesheet
is the authority.

Routes: `/` (field guide), `/laptops` (research library), `/laptops/:slug` (one research
record), `/gaming` (the graphics desk), `/compare` (up to three profiles side by side),
`/upgrade` (the cost workbench) and a not-found page. Each is built against the class contract
that the recovered stylesheet already carried (`.gpu-reference*`, `.comparison-grid`,
`.calculator-layout`, `.profile-*`, `.result-*`).

Query `lang=en` or `lang=ar` controls document language and direction. The header's locale
control switches it live and rewrites the query parameter. The comparison selection is carried
in `?compare=slug,slug`, so a comparison survives a reload and can be linked to.

## Asset honesty

`assets/hero-laptop.webp` is a recovered still of the original Three.js hero. The live scene
was not recoverable from the supplied artefacts. The stylesheet's contract for it is intact:
`.hero-visual` holds `.scene-frame`, which holds `.fallback-art`; `.scene-coordinate`,
`.visual-readout` and `.vertical-index` are DOM overlays above it. The still already carries
that annotation layer as raster, so the DOM overlays are deliberately not rendered over it;
restoring a real scene means swapping the image for a canvas inside `.scene-frame` and
re-adding the three overlays, with no change to the CSS.

## Retired source: Git only

Two earlier generations were removed from this working tree after preservation.

**Generation 1 — the unmounted experimental frontend** (before the previous three-page prototype):

- `src/App.jsx`, `src/main.jsx`, `src/index.css`.
- `src/pages/` (3 files), `src/components/` (6 files), `src/lib/` (3 files).
- The superseded `evidence/implementation.md` self-report.

Archive branch `archive/pre-prototype-frontend`, annotated tag
`legacy-prototype-frontend-final-2026-10-18`, commit
`5559b44d6602b5721b7284383815be5d8aea38b0`. All 15 retired source files were initially
untracked and were committed before removal; the archive preserves their raw bytes, including
CRLF, with scoped Git attributes.

**Generation 2 — the previous three-page prototype** (home / laptops / calculator, fictional
configurations, a cost workbench and a procedural `motion/` laptop viewer). It was committed,
manifested with SHA-256 digests, and archived before this build replaced it.

Archive branch `archive/pre-replit-prototype`, annotated tag `prototype-pre-replit-20261020-011151`.

Inspect a snapshot without checking out or resetting this dirty working tree:

```bash
git show legacy-prototype-frontend-final-2026-10-18:prototypes/visual-redesign/src/App.jsx
git ls-tree -r --name-only archive/pre-replit-prototype prototypes/visual-redesign
```

For a full comparison, use an isolated worktree at the archive branch. Do not restore archived
files into this active source directory.

## Verification and boundaries

- `npm test`: source-authority guards over the entry, the mounted chain, the retired tree, the
  design tokens and the profile data; a copy-integrity guard that fails if any
  `c.<group>.<key>` referenced in the source is missing from either locale; and a TypeScript
  type check, because a missing identifier is a runtime failure the Vite build does not catch.
- `npm run build`: actual Vite production compilation.
- Browser sweeps: 12 widths (320 → 1904) × 3 routes × 2 locales, no console errors, no page
  errors, no horizontal overflow; search, brand filter, confidence filter, reset, compare
  selection, locale switch and the mobile menu were each exercised.

The separate `apps/web` API-connected application, backend, database and existing uncommitted
work are preserved. This is a laboratory replacement, not production integration, visual
approval, deployment or a database migration. The archive branch/tags are local unless
explicitly pushed later; no force-push or history rewriting is part of this task.
