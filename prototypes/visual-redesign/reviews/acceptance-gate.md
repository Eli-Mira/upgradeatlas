# Acceptance Gate — UpgradeAtlas Visual Redesign

**Role:** Independent QA gate. Read-only. No automatic approval or parity claims.
**Date:** 2026-10-17
**Gate purpose:** Make upcoming prototypes confront these gaps explicitly. No numerical quality scores.

---

## Gate Conditions (must be confronted, not scored)

Each condition below is a gap identified in `baseline-critique.md`. The prototype must **demonstrate a response** to each — even if the response is "this gap is deferred with rationale." Silence on a gap is a failure.

---

### G1. Product Imagery in Catalog Cards

**Gap:** SkuCards display only text (SKU, CPU, RAM, storage, price) with no laptop imagery. Cards read as an admin database table, not a consumer catalog.

**What the prototype must show:**
- [ ] Each SkuCard includes a product visual element (silhouette, photography placeholder, or stylized device outline)
- [ ] The visual is positioned consistently across all cards (top of card, full-bleed, or inset)
- [ ] Even if using placeholder silhouettes, the card layout must not be text-only

**What this does NOT require:** Real product photography (asset sourcing is a separate gate). But it does require that the card structure accommodates imagery.

---

### G2. Catalog Layout Whitespace

**Gap:** Desktop catalog screenshot shows ~40% of horizontal screen width as empty black void. Card grid is right-aligned with sidebar, leaving unbalanced negative space.

**What the prototype must show:**
- [ ] The catalog grid uses the full available width or the sidebar is repositioned
- [ ] No single viewport shows more than ~25% empty horizontal space on the catalog page
- [ ] If a sidebar is retained, the grid area fills the remaining space proportionally

**What this does NOT require:** A specific layout choice (sidebar-left vs sidebar-top). Just that the whitespace is intentional and balanced.

---

### G3. Calculator Result Visualization

**Gap:** The calculator form accepts input but displays no comparison result. The e2e audit confirms `"resultSection": false`. The approved composer ref (19349258) shows two cost cards side-by-side with a bar chart and green "Lower cost" badge.

**What the prototype must show:**
- [ ] After submitting calculator input, a comparison result is displayed
- [ ] The result includes at least two cost values (upgrade cost vs replacement cost) shown side-by-side
- [ ] A visual indicator (bar, badge, or color) communicates which option is lower-cost
- [ ] The disclaimer text ("Illustrative costs only, not live laptop pricing") is visible

**What this does NOT require:** Backend integration or real pricing data. The visual structure must exist even if powered by synthetic data.

---

### G4. Typography — Font Replacement

**Gap:** Current implementation uses Archivo Variable for display and body. The approved design board (234E92D8) specifies Inter / Space Grotesk / Satoshi.

**What the prototype must show:**
- [ ] Headline typeface is Space Grotesk (or a clearly justified alternative with similar character)
- [ ] Body/UI typeface is Inter (or a clearly justified alternative)
- [ ] Arabic typeface remains IBM Plex Sans Arabic (or a justified alternative)
- [ ] Font files are self-hosted or loaded via a verified open-source license

**What this does NOT require:** A font license audit (that's a separate deliverable). Just that the typeface switch is implemented.

---

### G5. Arabic Navigation Typo

**Gap:** `site-copy.js:7` contains `"اللايتوبات"` — a transliteration error. Correct form is `"اللابتوبات"`.

**What the prototype must show:**
- [ ] Navigation menu displays "اللابتوبات" (not "اللايتوبات") in both LTR and RTL modes
- [ ] All instances of this string are corrected (check site-copy.js, any cached copy objects, and RTL variant)

**What this does NOT require:** Any design change. Pure copy correction.

---

### G6. Input Field Visual Hierarchy

**Gap:** All inputs (search, filter, calculator form) use identical dark rectangle styling. No visual distinction between input types.

**What the prototype must show:**
- [ ] Search input has a visually distinct treatment from filter/form inputs
- [ ] Calculator input fields have a treatment distinct from catalog search
- [ ] At least one visual differentiator exists (border accent, label style, padding, prefix/suffix)

**What this does NOT require:** Completely different input designs. Just enough differentiation that a user can distinguish a search field from a numeric input at a glance.

---

### G7. Hero 3D Enhancement or Replacement

**Gap:** The 3D laptop model is a neutral chassis with no branding, floating in void with a grid-line screen texture. The approved reference direction emphasizes cinematic product storytelling.

**What the prototype must show (choose ONE):**
- [ ] **Enhanced 3D:** The model has refined materials (environment reflections, edge lighting, more realistic proportions), a more compelling camera angle, or animated interaction that communicates "analysis" rather than just "object"
- [ ] **Replaced with photography:** A high-quality product photograph replaces the 3D canvas, with the viewfinder framing preserved
- [ ] **Deferred with rationale:** The prototype acknowledges this gap and states the planned approach (e.g., "3D will be refined in Phase 2; for now we accept the abstract model")

**What this does NOT require:** A complete visual overhaul. The current concept (viewfinder + laptop) is approved; the execution needs elevation.

---

### G8. Compare Page Visual Treatment

**Gap:** The compare page renders a plain HTML table with hairline borders. No product imagery, no difference highlighting, no visual hierarchy beyond text weight.

**What the prototype must show:**
- [ ] Each compare column includes a product visual element (silhouette or placeholder image area)
- [ ] Rows where values differ are visually highlighted (background tint, border accent, or icon marker)
- [ ] The first column (attribute labels) is visually distinct from data columns

**What this does NOT require:** Exact replication of Apple's comparison layout. The principle is: product images above columns, differences marked visibly.

---

### G9. Scroll Indicator Removal

**Gap:** A gradient line with "Scroll" text sits at the bottom of the hero section (Home.jsx:80-87). This is decorative noise with no functional value.

**What the prototype must show:**
- [ ] The scroll indicator element is removed from the hero section
- [ ] The transition from hero to stats section is clean without the decorative arrow/line

**What this does NOT require:** Any replacement element. The stats section serves as natural scroll transition.

---

### G10. Stats Section Copy Rewrite

**Gap:** Stats show keywords ("5,000+", "100%", "Local EGP", "Upgrade") that don't communicate benefit. The copy doesn't answer "why should I care?"

**What the prototype must show:**
- [ ] Each stat item communicates a clear benefit to the user (not just a label)
- [ ] Examples of acceptable rewrites: "5,000+ laptops with documented specs" instead of "5,000+ laptops covered"; "100% official manufacturer specs" instead of "100% official specs"
- [ ] The rewrite maintains the 4-stat grid structure

**What this does NOT require:** A specific copywriting standard. Just that the stats convey benefit, not just data.

---

## Defer-and-Justify Path

If a prototype cannot address a gap, it **must** include a documented defer rationale in the prototype README or a comment in the code. Silence = failure.

Example acceptable defer: *"G7 (Hero 3D) deferred: current abstract model is intentional for Phase 1. Will replace with product photography once asset source is secured (see asset-licensing.md)."*

---

## Non-Goals of This Gate

- **No numerical quality scores.** This is a binary confront-or-justify gate.
- **No automatic approval.** Passing all gaps does not equal "approved" — it equals "confronted."
- **No parity claims.** This gate does not claim the prototype matches any reference site. It claims the prototype addresses the identified gaps.
- **No backend/database changes.** This is a visual/design gate only.
- **No deployment verification.** Running the dev server is not part of this gate.

---

## Access and Vision Limitations

| Limitation | Impact |
|---|---|
| Live dev server not started | Cannot verify interactions, animations, or focus states in real-time |
| `better-interface` 6-skill full audit not completed | Accessibility, color contrast ratios, and cross-domain consistency not exhaustively verified |
| SHAGA Odyssey live page not fetched by vision | Design comparison is based on search snippet + composer image ref only |
| `reference-direction.png` is light theme only | Cannot verify dark-mode parity against this reference; it's a mood board, not a spec |
| No browser screenshot capture in this pass | All visual evidence comes from pre-existing PNGs, not live rendering |

These limitations are documented, not hidden. The implementer should plan a follow-up pass with live server access for interaction verification.

---

## Files Created

| File | Path | Purpose |
|---|---|---|
| baseline-critique.md | `prototypes/visual-redesign/reviews/baseline-critique.md` | This baseline pass output |
| acceptance-gate.md | `prototypes/visual-redesign/reviews/acceptance-gate.md` | This gate — for prototype confrontation |
| reference-evidence/ | `prototypes/visual-redesign/reviews/reference-evidence/` | Directory ready for prototype screenshots |

No existing files were modified. No code was changed. No deployment was attempted.
