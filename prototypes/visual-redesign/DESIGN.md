# UpgradeAtlas — prototype design system

Status: implemented proposal; Eli has not approved rollout. Actual source: `src/prototype.css` and mounted `src/prototype-*.jsx`. Art direction and reference observations: `research/art-direction.md`. This system is specific to the three isolated pages, not an assertion that production has been redesigned.

## Identity and hierarchy

The subject is a laptop decision, not a generic SaaS dashboard. Spend visual emphasis on one hardware composition on the homepage; product images and exact sample attributes in the catalog; entered totals, their difference and honest bars in the calculator. Avoid decorative fake coverage, verification badges, serial numbers, stock indicators or speculative performance promises.

| Role | Implemented value / use |
|---|---|
| Canvas | `#090a0c` |
| Surface | `#111419` |
| Raised controls | `#171b22` |
| Boundary | `#2d333d` (component-specific stronger borders for controls) |
| Main text | `#f2f4f7` |
| Secondary text | `#a7adb8` |
| Supporting text | `#89939f` |
| Action | `#e5484d`, dark text on primary buttons |
| Positive analytical state | `#3dd68c`, only the lower entered cost—not compatibility or verification |
| Error | `#ffadb1` text, `#ff8f94` invalid border plus written instructions |
| Surfaces / controls | 8px / 4px radius; no pills or glow effects |

## Typography and geometry

- Installed self-hosted Archivo Variable for English display and UI; IBM Plex Sans Arabic for Arabic. No paid font or component package was added. Weight/size contrast does the hierarchy work, not a decorative extra font.
- Homepage Latin display: responsive 70–108px; 58px at 390px and 50px at 320px. Weight800, leading0.96–1, tighter Latin tracking. Arabic: responsive60–78px desktop,43px at390 and37px at320; weight600, leading1.45, no Latin tracking. Those independent metrics are deliberate rather than blind mirroring.
- Page headings: catalog60px desktop/43px mobile; calculator54px desktop. Arabic page headings54px desktop/36px mobile. Exact tablet/narrow rules remain in CSS. Totals use tabular figures and explicit EGP formatting.
- Maximum main content1344px; side gutters48px at1440,24px at834,20px at390,16px at320. Logical inline spacing follows locale.
- Desktop nav, native dialogs, buttons, selects, inputs and focus styles are shared. Page compositions are NOT one generic grid with interchangeable labels.

## Three page compositions

| Page | Desktop | Tablet / mobile |
|---|---|---|
| Home | Integrated diagonal hardware stage; large editorial decision heading, primary catalog action, secondary calculator action; narrow search strip; restrained value statements; detail-study second act | Independent portrait asset and normal-flow image; primary action before image, secondary after; stacked explanation and detail study. Product lighting is not mirrored for Arabic |
| Catalog |204px filter rail, image-led three-column product plates, aligned three-attribute rows and illustrative costs; compact search/sort band | Two columns at tablet; one at mobile. Desktop rail replaced by real filter dialog. Same state, not a separate fake form |
| Calculator | Editable composition on left; totals/verdict, zero-based bars and component breakdown on right | DOM order begins with summary, then form, chart and breakdown; no CSS-only form/result reading-order reversal |

## Assets and motion

Original procedural laptop geometry, original contour wallpaper and studio render exports live in `motion/` and `assets/`; they are explicitly concept visuals, not exact-SKU photography. Three camera views are reused across six fictional configurations; do not mistake that for six sourced retail models.

Default hero is a lightweight WebP poster. Non-reduced-motion users can explicitly load the optional inspector; Three.js is not needed for the initial poster. Rotation has buttons and keyboard alternatives, no autoplay or mandatory gesture. Reduced motion keeps the useful still. Source: `motion/StudioLaptop.jsx` and `StudioLaptop.css`.

Pointer feedback uses a short custom cubic-bezier; transform feedback is small and nonessential. The global reduced-motion rule disables movement. Screenshot captures deliberately use reduced motion; they are not evidence of animation playback. No scroll hijacking, magnetic pointer controls, gradient glow or imported component animation is used.

## States and truthfulness

- Catalog: actual local search, use/memory/budget filters, sort, reset, derived result count, no-match recovery, cap-four selection, sample detail and comparison dialogs. Difference rows have a visible tint as well as readable values. These are prototype states—not a replacement for production API pagination, provenance or persisted comparison state.
- Calculator: four exact production field keys; production normalization/validation reused read-only. Local integer-cent preview handles zero, either lower option, equality and invalid fields. Editing removes outdated totals/charts until recalculation. Initial amounts are labeled illustrative; results make no performance, market-price, compatibility or financing claim.
- Native `<dialog>` provides a real modal surface; named buttons, semantic labels, visible focus and numerical HTML labels matter independently of appearance. Actual keyboard/focus/overflow checks belong to the independent QA report, not to this specification.

## Acceptance boundary

Passing a build does not establish a beautiful or accessible interface. Independent criticism, actual desktop/tablet/mobile EN/AR screenshots, unresolved differences and the source-preserving rollout plan accompany this proposal. Only Eli can approve the visual direction. Full-site implementation, publication and database/backend changes remain outside this round.
