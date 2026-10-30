# Component Reference Audit — UpgradeAtlas Premium Laptop Advisor

> **Preliminary delegated research, not accepted as verification.** Parent review found material corrections: Transitions.dev has mixed/custom terms rather than an MIT-only snippet license; the Originkit MIT repository cited here is an MCP integration, not proof of all website component licenses; 21st access/pricing cannot be determined from a Reddit report. See `PARENT_REVIEW.md` for the accepted findings. Keep the following as a historical research draft, not installation clearance.


**Stack target:** React JS + Vite + Tailwind CSS 4 + Laravel 13 backend. No Next.js runtime required at the destination app.
**Scope:** 7 bookmarked component-library references audited for accessibility, official repo/license, free-vs-paid component availability, React JS compatibility, and additional dependencies. No code installed, no accounts used.
**Rule applied:** Free marketing does not imply free license. Missing license = "unknown, reference only."

---

## 1. 21st.dev — https://21st.dev/

| Field | Finding |
|---|---|
| **Accessible** | Yes (public homepage browsable; component previews render) |
| **Repo** | https://github.com/serafimcloud/21st (registry platform code) |
| **License** | **Unknown for component content.** No single LICENSE file verified for the registry itself; individual community components ship under various authors' terms, not vetted by 21st.dev |
| **Free vs paid** | Reddit (r/vibecoding) reports 21st.dev is **no longer free** as of 2026 — paid tiers gate what used to be open access |
| **React JS** | Yes (components are React/TS, shadcn-style) |
| **Deps** | Varies per component; many pull motion/gsap/three.js — not lean for a Vite+Laravel app |

**Verdict: Reject.** License is not verifiable per component, access is increasingly paywalled, and per-component dependency weight is inconsistent. Not suitable as a primary source for a professional advisor UI.

---

## 2. 21st.dev — Timeline preview — https://21st.dev/?preview=%2F%40hyperiux%2Fcomponents%2Ftimeline

| Field | Finding |
|---|---|
| **Accessible** | Yes (component preview page loads publicly) |
| **Component** | @hyperiux/components/timeline — community-published React timeline component |
| **License** | **Unknown.** Author-specific license not verifiable without inspecting the component's own repo/metadata; 21st.dev does not enforce a standard license |
| **Free vs paid** | Unclear — gated behind 21st.dev's current paid model; not independently distributed |
| **React JS** | Yes |
| **Deps** | Unknown without pulling source (motion or framer-motion likely) |

**Verdict: Reject.** Same platform problems as #1, plus no standalone repo/license for this specific component. Reference-only for visual inspiration; do not copy code into UpgradeAtlas.

---

## 3. Transitions.dev — https://transitions.dev/

| Field | Finding |
|---|---|
| **Accessible** | Yes (public site, docs, and GitHub all reachable) |
| **Repo** | https://github.com/Jakubantalik/transitions.dev |
| **License** | **MIT — verified.** LICENSE file at https://github.com/Jakubantalik/transitions.dev/blob/main/LICENSE. Site's own comparison table confirms: "Free library → MIT core transitions; Pro → Commercial." |
| **Free vs paid** | **Free tier:** 32+ portable CSS transitions, free for personal and commercial use, no account needed (`npx transitions-dev add card-resize`). **Paid Pro tier:** full 43+ set, React/TypeScript recipe variants, commercial license. |
| **React JS** | Free tier is pure **CSS** (framework-agnostic — drops into React JS/JSX trivially). React/TS variants are Pro (commercial). |
| **Deps** | Free transitions are standalone CSS — zero runtime dependencies, no JS library required. |

**Verdict: Accept (free MIT tier).** Strong match for "restrained transitions" in UpgradeAtlas. Card-resize, menu, and modal transitions are copy-paste CSS — fits the "prefer existing CSS over library for tiny effects" rule perfectly.

---

## 4. Unlumen UI — https://ui.unlumen.com/

| Field | Finding |
|---|---|
| **Accessible** | Yes (homepage, docs, license page all public) |
| **Repo** | https://github.com/leovvx/unlumen-ui-docs (public registry + docs, open source) |
| **License** | **MIT — verified** at https://github.com/leovvx/unlumen-ui-docs/blob/main/LICENSE ("MIT License, Copyright (c) 2026 Léo Wicki"). Site docs confirm: free components usable in any project including commercial/client work, no attribution; Pro components require a paid license. |
| **Free vs paid** | Free component set is genuinely free under MIT. Pro components are paywalled (Polar license key) — avoid those. |
| **React JS** | Yes — React components, shadcn/ui CLI-compatible registry pattern (`npx shadcn add`). |
| **Deps** | shadcn-style: code copies into your repo, no runtime dependency lock-in. Uses motion (framer-motion successor) for animation on some components. |

**Verdict: Accept (free MIT components).** Good for category navigation and comparison-tray building blocks — animated React components with smooth Motion animations, shadcn-compatible with Tailwind. Fits Vite + React JS well.

---

## 5. SmoothUI Orb — https://smoothui.dev/docs/components/orb

| Field | Finding |
|---|---|
| **Accessible** | Yes (docs page public, installation instructions visible) |
| **Repo** | https://github.com/educlopez/smoothui |
| **License** | **MIT — verified** at https://github.com/educlopez/smoothui/blob/main/LICENSE (confirmed via podie.dev registry and repo README) |
| **Free vs paid** | Free, MIT |
| **React JS** | Yes |
| **Deps** | **WebGL2** custom shader code, 22 tuning props — heavy custom GL, not a tiny CSS effect |

**Verdict: Reject as spectacle.** A lit WebGL2 sphere with OkLab colour marbling is impressive tech, but a premium laptop advisor needs credibility and clarity, not a decorative orb. It adds WebGL complexity, GPU cost, and zero information value for a user comparing hardware. Irrelevant per the brief's "reject gratuitous orb" instruction.

---

## 6. Animmaster Lib — https://animmasterlib.dev/

| Field | Finding |
|---|---|
| **Accessible** | Yes (homepage and category pages public) |
| **Repo** | **No library repo.** https://github.com/Animmaster is the author's personal profile (demo sites, clone experiments) — the 300-component library itself is not open source |
| **License** | **Unknown / none published.** No LICENSE file, no terms granting reuse rights for the component code found. Site has Terms/Privacy/Refund links but no open-source license. |
| **Free vs paid** | **Paid product:** Junior $3, PRO $4.99, Premium $8. The "free" content is previews/videos only. Marketing shows prices but code access requires purchase. |
| **React JS** | Partial — components are 60% HTML/CSS/JS, 30% React, 10% Next.js; not uniformly React |
| **Deps** | Unknown (source not inspectable without purchase) |

**Verdict: Reject.** Paid, no verifiable license, no public repo, and mixed non-React formats. "PRO-Level" marketing does not equal open rights to the code — this is a purchased zip file, not a licensed library. Reference-only at most.

---

## 7. Originkit — https://www.originkit.dev/

| Field | Finding |
|---|---|
| **Accessible** | Yes (homepage, sections, docs, licensing all public) |
| **Repo** | https://github.com/vellum-ai/originkit |
| **License** | **MIT — verified** at https://github.com/vellum-ai/originkit/blob/main/LICENSE (standard MIT text, Copyright (c) 2026 Vellum, Inc.). Also confirmed on npm: `originkit` package lists MIT. Licensing page: https://www.originkit.dev/docs/licensing |
| **Free vs paid** | **Free.** Largest free animated component library per their own marketing; 47 hero sections, features, pricing, CTA, footer sections — most free, a few marked "Pro" (skip those). |
| **React JS** | Yes — React + Next.js + Tailwind components; free sections are copy-paste source that works in Vite+React (Next.js-specific parts are minimal, mostly Tailwind+React) |
| **Deps** | Registry delivers code into your repo (shadcn-like), "nothing from Originkit stays in your dependency tree at runtime." Some components use motion/react or GSAP — per-component. |

**Verdict: Accept (MIT, free).** Strong match for hero/search and category navigation. Animated hero sections with a professional, restrained aesthetic; code lands in-repo and is owned outright under MIT.

---

## Recommendation: Top 3 Free/Open-Source Choices for UpgradeAtlas

### 1. Transitions.dev (Free tier, MIT) — **Restrained transitions**
- Repo + license: https://github.com/Jakubantalik/transitions.dev/blob/main/LICENSE (MIT)
- 32+ CSS-only transitions (card-resize, menus, toggles, modals) — copy-paste, no runtime dep, works in any React JS + Tailwind 4 project
- Covers: subtle upgrade-flow transitions (spec-card expand → comparison tray), menu/overlay reveals
- Free for commercial use, verified

### 2. Originkit (MIT) — **Hero/search + category navigation**
- Repo + license: https://github.com/vellum-ai/originkit/blob/main/LICENSE (MIT)
- 47 free hero sections + features/CTA sections; code delivered to repo, no runtime lock-in
- Covers: premium hero with integrated search, feature/category grids for laptop browsing
- Verified MIT, commercial use permitted

### 3. Unlumen UI (Free components, MIT) — **Comparison tray + animated primitives**
- Repo + license: https://github.com/leovvx/unlumen-ui-docs/blob/main/LICENSE (MIT)
- shadcn-compatible animated React components (tooltips, tabs, cards) — good building blocks for a comparison tray and category tabs
- Free components explicitly cleared for commercial/client use; Pro components are off-limits (skip)
- Works with React JS + Tailwind via shadcn CLI pattern

### Rejected
| Library | Reason |
|---|---|
| 21st.dev (both bookmarks) | No longer free; per-component license unknown; inconsistent dependency weight |
| SmoothUI Orb | Spectacle over substance — WebGL orb adds complexity with zero advisor value |
| Animmaster Lib | Paid, no published license, no public repo, mixed non-React formats |

---

## Footnotes on Method

- All 7 URLs confirmed publicly accessible without login.
- Licenses verified by locating exact LICENSE files in public GitHub repos where available; two sources (21st.dev, Animmaster) had **no verifiable open-source license** — treated as unknown/reference-only per brief.
- No paid accounts, memberships, downloads, or code execution were used. All data from public homepages, docs pages, and public GitHub repos.
- Free-vs-paid was determined from each site's own pricing/license docs — not inferred from marketing copy.
