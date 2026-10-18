# Authoritative frontend source

## One entry, one implementation

This laboratory has exactly one frontend implementation. `index.html` mounts `/src/prototype.jsx`; it does not mount an alternative application shell.

```text
index.html
└── src/prototype.jsx                  route selection, locale, navigation, footer
    ├── src/prototype-home.jsx
    │   └── motion/StudioLaptop.jsx
    │       ├── motion/StudioLaptop.css
    │       └── motion/studio.js       on-demand 3D
    │           └── motion/laptop.js
    ├── src/prototype-catalog.jsx      illustrative products, filters, compare/detail dialogs
    ├── src/prototype-calculator.jsx   illustrative cost workbench
    │   └── src/prototype-calc.js      integer-cent preview, shared input validation
    ├── src/prototype-ui.jsx           native dialog and arrow primitive
    ├── src/prototype-data.js          fictional configurations, locale formatting, asset URLs
    └── src/prototype.css              shared styles and self-hosted font imports
```

The page modules also share the UI/data modules. The arithmetic module imports the existing `../../apps/web/src/costValidation.js` relative to this laboratory root (its source-level import is `../../../apps/web/src/costValidation.js` from `src/`). Dependencies/fonts come from the existing `apps/web/node_modules` aliases. These are intentional read-only cross-project dependencies, not imports of a retired frontend.

Routes: `/`, `/laptops`, `/calculator`. Query `lang=en` or `lang=ar` controls document language/direction; all products and starting costs remain visibly illustrative. `motion/studio.html` and `motion/inspect.html` are viewer diagnostics, not alternate application shells.

## Retired source: Git only

The unmounted experimental tree was deleted from this working tree after preservation:

- `src/App.jsx`, `src/main.jsx`, `src/index.css`.
- `src/pages/` (3 files), `src/components/` (6 files), `src/lib/` (3 files).
- The superseded `evidence/implementation.md` self-report.

Archive branch: `archive/pre-prototype-frontend`.
Annotated tag: `legacy-prototype-frontend-final-2026-10-18`.
Final snapshot commit: `5559b44d6602b5721b7284383815be5d8aea38b0`.

All 15 retired source files were initially untracked. They were committed before removal; the final archive preserves their raw bytes, including CRLF, with scoped Git attributes. Source inventory: `evidence/legacy-preservation.json`. The archive also preserves the pre-cleanup laboratory and original documentation. It is provenance, not a runnable replacement or current specification.

Inspect the snapshot without checking out or resetting this dirty working tree:

```bash
git show legacy-prototype-frontend-final-2026-10-18:prototypes/visual-redesign/src/App.jsx
```

For a full comparison, use an isolated worktree at the archive branch. Do not restore retired files into this active source directory.

## Verification and boundaries

- `npm test`: preview arithmetic plus entry/import/retirement guards.
- `npm run build`: actual Vite production compilation.
- Native Python Playwright: `tests/functional_qa.py` and `tests/smoke.py` against port 5174.
- Built-preview browser checks against port 5175: responsive EN/AR pages, runtime/network errors and representative interactions.
- Fresh archival/reference-scan/test results: `evidence/legacy-retirement/`.

The separate `apps/web` API-connected application, backend, database and existing uncommitted work are preserved. This is a laboratory cleanup, not production integration, visual approval, deployment or a database migration. The archive branch/tag are local unless explicitly pushed later; no force-push or history rewriting is part of this task.
