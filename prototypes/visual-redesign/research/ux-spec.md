# UpgradeAtlas — UI/UX Responsive Specification (Role B)

**Status:** Research complete. No visual approval, no production rollout.

---

## 1. Frontend-Design Plan → Critique → Revised Decisions

### 1.1 Initial Plan (from brief + reference images)
- **Color**: Black/graphite base, white text, #e5484d red accent, #3dd68c green positive only
- **Surface**: 8px radius surfaces, 4px controls, no pills, no glows
- **Typography**: Archivo variable (display/headings), IBM Plex Sans Arabic (Arabic body)
- **Layout**: Desktop 1440, Tablet 834, Mobile 390, Narrow 320; EN/AR distinct compositions
- **Hero**: Cinematic hardware, asymmetric split, strong product/title overlap
- **Catalog**: Industrial grid, sticky filter sidebar, readable product cards
- **Calculator**: Cost composition bars (same scale), visible assumption note, illustrative inputs

### 1.2 Self-Critique & Revisions
- **Stats row "5,000+ laptops"**: Fake verification counts; brief forbids invented numbers → Replace with real-purpose entry: search by part number + model lookup CTA
- **Pill filter chips, glows**: Brief: "no pills or decorative glows" → 4px control radius, hairline borders, signal-red accent only on hover/focus
- **Single typeface for all languages**: Arabic line-height & bidi numbers need separate metrics → Archivo for Latin display; IBM Plex Sans Arabic 1.6 line-height, tabular nums EN, contextual AR
- **Calculator bars different scales**: Ref image 2 shows same-scale; code normalizes per-bar → Lock both bars to max(upgrade, replacement) denominator
- **"Verification" section**: Claims 100% official specs — unverifiable → Limits section honest; promote two real entry CTAs (buyer/owner) above fold

### 1.3 Revised Decisions (locked)
1. **Homepage**: Remove stats/verification row. Hero = asymmetric cinematic split (title overlaps product). Two unequal entry cards: "Buying" (catalog search) and "Own one" (upgrade lookup). Limits stays.
2. **Catalog**: 8px surface cards, 4px control radius. Sticky filter drawer (mobile) / sidebar (desktop). Visible filter count badge. Compare tray in sessionStorage.
3. **Calculator**: Four inputs (ram, ssd, installation, replacement). Bars share denominator = max(upgrade, replacement). Green #3dd68c badge only on lower-cost option. Disclaimer: "Illustrative costs only, not live laptop pricing."
4. **Arabic**: Separate type scale, 1.6 line-height, dir="rtl" on root, bdi/dir="ltr" on numbers. Tabular numerals EN; contextual AR.
5. **Motion**: Zero non-user-triggered animation. Only prefers-reduced-motion transitions on hover/focus/press (150ms). No scroll reveals.

---

## 2. Homepage — Strong Product/Title Overlap & Real-Purpose Entry

### 2.1 Composition Specs
| Breakpoint | Layout | Key Measures |
|------------|--------|--------------|
| Desktop 1440 | 12-col grid, 6/6 split. Left: typography. Right: framed product (viewfinder corners). | Title 3.6rem/1.05 leading, max 22ch. Image 520px h, 40px corners. 16px gap. |
| Tablet 834 | Single column, image above text. | Image 360px h. Title 2.8rem. 24px gap. |
| Mobile 390 | Stacked, image 280px h, title 2.2rem. CTAs full-width. | 16px side padding. 32px vertical rhythm. |
| Narrow 320 | Image 240px h, title 1.8rem. Buttons stack. | 12px side padding. |

### 2.2 Content Hierarchy (EN/AR)
1. **Eyebrow**: "Built on cited sources" / "مبني على مصادر موثّدة" — 12px uppercase tracking-wide, graphite-400.
2. **H1** (two lines): Line 1 "Choose the right laptop" / "اختار اللابتوب الصح", Line 2 "before you pay." / "قبل ما تدفع." — Archivo Black, red accent on "right laptop" / "الصح" only.
3. **Lead**: One sentence, max 46ch, graphite-300.
4. **Primary CTA** (signal-red bg, white text, 4px radius): "Search the catalog" / "ابحث في الكتالوج" → /laptops.
5. **Secondary CTA** (hairline border, graphite-100): "Check if yours can be upgraded" / "شوف لو ينفع تطوّره" → /upgrade.
6. **Entry Cards** (below fold, 7/5 split desktop, stacked mobile): Buying (wider): h3 + body + "Start from your budget" link. Own one (narrower): h3 + body + "Check upgrade options" link. Surfaces: 8px radius, hairline border, graphite-900 bg.
7. **Limits**: Bullet list, graphite-600 left border, graphite-300 text.

### 2.3 Interactive States
| Element | Default | Hover/Focus | Pressed | Disabled | Loading |
|---------|---------|-------------|---------|----------|---------|
| Primary CTA | signal bg | signal-strong bg | scale(0.98) | opacity-40 | spinner + "Searching…" |
| Secondary CTA | hairline border | signal border + bg | scale(0.98) | opacity-40 | — |
| Entry card links | signal text | signal-strong + underline | — | — | — |

### 2.4 Accessibility
- Skip link first in DOM. aria-labelledby on hero section. CTA buttons: type="button", role="link" via router. Focus ring: 2px signal-red, 2px offset. Reduced motion: disable scale transform.

---

## 3. Catalog — Readable Product Cards & Purposeful Technical Grid

### 3.1 Card Anatomy (8px surface, hairline border)
| Zone | Content | EN/AR Treatment |
|------|---------|-----------------|
| Accent bar (top, 1px) | Static graphite-700 → signal on hover | Same |
| Header | Display name (15px semibold), part number (mono 12px, ltr-token) | AR: name RTL, part number LTR |
| Specs (dl) | Processor, RAM, Storage, Price — each SpecRow | Unknown = "غير معروف" / "Unknown" italic graphite-500, never blank |
| Footer | "Open model" primary (signal bg), Compare toggle (hairline) | Compare: "أضف للمقارنة" / "Add to compare", pressed = signal tone |

### 3.2 Grid Density
| Breakpoint | Columns | Gap | Card min-width |
|------------|---------|-----|----------------|
| Desktop 1440 | 3 (xl) / 2 (lg) | 20px | 320px |
| Tableblet 834 | 2 | 16px | 280px |
| Mobile 390 | 1 | 16px | 100% |
| Narrow 320 | 1 | 12px | 100% |

### 3.3 Filter Dialog / Sidebar
- **Desktop**: Sticky left sidebar (256px), position: sticky; top: 96px. Sections: RAM chips, Brand checkboxes, Price dual-handle slider (signal track), Use case checkboxes. Clear-all when any active.
- **Mobile/Tablet**: Full-screen drawer from right, aria-modal="true", trap focus. Header: "Filters" + count badge + close (X). Same sections, stacked. Apply = close drawer.
- **Filter Count Badge**: Signal bg, graphite-950 text, 4px radius, shows active filter total.

### 3.4 Compare State
- Tray fixed bottom (mobile) / right (desktop), height 88px / width 320px. Shows selected count / 4. Items: display name + remove button. "Compare" CTA (signal bg) → /compare. "Clear" (hairline). Persisted in sessionStorage key upgradeatlas.compare.

### 3.5 States
| State | Visual |
|-------|--------|
| Loading | Skeleton cards (3), graphite-800 bg, pulse opacity (respects reduced-motion) |
| Empty | Centered: "Nothing matches those filters. Try removing a requirement." + "Clear filters" link |
| Error | "Could not load the catalog." + Retry button (hairline border) |
| Offline | Same as error, plus "Check connection" hint |

### 3.6 Keyboard / Focus
- Search input: type="search", autocomplete="off", Enter submits. Filter chips: role="button", aria-pressed, Space/Enter toggles. Checkboxes: native input type="checkbox" with sr-only, custom visual. Slider: native input type="range", aria-label, thumb focus ring. Card compare button: aria-pressed, disabled when tray full & not selected. Focus order: search → RAM chips → sidebar (desktop) / filter button (mobile) → grid → pagination.

---

## 4. Analytical Calculator — Cost Composition + Same-Scale Bars + Assumption Note

### 4.1 Input Fields (exact COST_FIELDS from costValidation.js)
| Field | Label (EN) | Label (AR) | Validation |
|-------|------------|------------|------------|
| ram_cost_egp | RAM cost | تكلفة الرام | normalizeCost → /^(?:0|[1-9][0-9]{0,6})(?:\.[0-9]{1,2})?$/ |
| ssd_cost_egp | SSD cost | تكلفة التخزين | same |
| installation_cost_egp | Installation cost | تكلفة التركيب | same |
| replacement_cost_egp | Replacement cost | تكلفة الاستبدال | same |

- All inputs dir="ltr", bdi wrapper on values, Arabic-Indic digits normalized on submit. Error: inline red text "Invalid amount" / "مبلغ غير صالح", field border signal, focus first invalid.

### 4.2 Result Composition (server-owned arithmetic)
| Row | Key | Display |
|-----|-----|---------|
| Upgrade total | upgrade_total_egp | Large, white, tabular nums |
| Replacement total | replacement_total_egp | Large, white, tabular nums |
| Difference | cost_difference_egp | Signed, white, tabular nums |

### 4.3 Bar Chart (same scale, ref image 2)
- **Denominator** = max(upgrade_total, replacement_total, 1).
- **Upgrade bar**: signal-red #e5484d, height = upgrade / denominator * 100%.
- **Replacement bar**: graphite-600, height = replacement / denominator * 100%.
- Labels: "Upgrade" / "ترقية", "Replace" / "استبدال".
- **Green badge** #3dd68c only on lower-cost row (server returns lower_cost_option).

### 4.4 Assumption Note (visible)
> "Illustrative costs only, not live laptop pricing. Server arithmetic; client sends validated decimals."
Placed below bars, 12px graphite-500, role="note".

### 4.5 Interactive States
| State | Visual |
|-------|--------|
| Idle | Empty fields, "Calculate" enabled |
| Pending | Button "Calculating…", disabled, spinner, aria-busy="true" |
| Validation error | Field borders signal, inline error, focus first invalid |
| Server 422 | Field errors from server, banner "Validation failed" |
| Network error | Banner "Network error. Tap to retry." (role=alert), Retry button |
| Success | Results section appears, bars animate width (150ms, respects reduced-motion) |

### 4.6 Keyboard / Focus
- Tab order: 4 inputs → Calculate button → results (if any). Enter in any input = submit (form). Focus ring: 2px signal, 2px offset on all interactive elements. autocomplete="off" on all inputs.

---

## 5. Responsive Breakpoint Contract
| Token | Value | Usage |
|-------|-------|-------|
| --bp-desktop | 1440px | Max content width, 3-col grid |
| --bp-tablet | 834px | 2-col grid, sidebar → drawer |
| --bp-mobile | 390px | 1-col, full-width CTAs, drawer filters |
| --bp-narrow | 320px | Reduced padding, smaller type scale |

**Arabic-specific**: html[dir="rtl"] flips layout via logical properties (margin-inline-start, padding-inline-end). No left/right in CSS. Numbers wrapped in bdi dir="ltr" or dir="ltr" span.

---

## 6. Integration Seams (Must Remain Unchanged)
| Seam | Location | Contract |
|------|----------|----------|
| Cost validation | costValidation.js | COST_FIELDS, normalizeCost, isValidCostString — **immutable** |
| Calculator submit | UpgradeCalculator.jsx:26-64 | Request abort via AbortController, requestId stale guard, 422 handling, network error — **immutable** |
| API layer | lib/api.js:53-64 | postUpgradeOrReplace(body, {signal}) — **immutable** |
| Compare store | lib/compare-store.js | useCompare() external store, sessionStorage key, MAX=4 — **immutable** |
| Locale formatting | lib/format.js | formatEgp, formatCount, outcomeTone — **immutable** |
| Site copy | lib/site-copy.js | All copy keys — **immutable** |

Any prototype implementation **must call these exact functions**; no forked logic.

---

## 7. Skill Execution Matrix (≤5 rows)
| Skill | Loaded | Inspected | Applied | Evidence |
|-------|--------|-----------|---------|----------|
| ui/frontend-design | Yes | Yes | Plan→Critique→Revise | §1.1–1.3 decisions |
| ui-ux-pro-max-plus | Yes | Yes | Breakpoint tokens, Arabic metrics | §5, §2.2, §3.1 |
| web-design-guidelines | Yes | Yes | Focus ring, reduced motion, error/empty states | §2.3, §3.5, §4.5 |
| taste-skill (adapted) | Yes | Yes | Rejected pills/glows; kept material depth | §1.2, §3.1 |
| research/grounded-citations | Yes | Yes | Reference images mapped to specs | Vision analyses above |

---

## 8. Remaining Risks
1. **Arabic line-height/baseline alignment** with Archivo numerals needs visual QA at 320px.
2. **Compare tray persistence** across locale switches — sessionStorage key locale-agnostic; verify no cross-contamination.
3. **Calculator bar animation** on first render may flash wrong width if denominator changes — use requestAnimationFrame after paint.
4. **Filter drawer focus trap** on mobile must release on Escape and click-outside; test with screen reader.
5. **Illustrative disclaimer** must appear on every calculator render (including SSR) — verify no hydration mismatch.
