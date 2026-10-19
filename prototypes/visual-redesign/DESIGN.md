# UpgradeAtlas — design system (field-guide build)

Status: implemented. Authority: `src/index.css`. Art direction and the original design
rationale live with the source build this laboratory recovered.

## Identity

An Egypt-first **hardware intelligence** instrument, not a store and not a marketing page. The
subject is one specific machine, and the promise is that every claim is traceable. The design
therefore leads with structure (rules, indices, rails, grids, footnotes) and keeps imagery to
one hero object per screen.

Voice: declarative and technical. "THE EVIDENCE IS THE PRODUCT." No superlatives, no urgency
language, no prices, no stock claims, no retailer framing.

## Tokens

```css
--atlas-bg:      #070809   canvas
--atlas-surface: #101215   panels
--atlas-raised:  #16191e   raised controls
--atlas-line:    rgba(232,235,241,.13)   hairline boundaries
--atlas-ink:     #f3f4f6   primary text
--atlas-copy:    #969da9   secondary text
--atlas-muted:   #687180   supporting text
--atlas-red:     #ef3340   action and the single accent
--atlas-deep-red:#a91024   accent border
--atlas-lime:    #b7cf78   exact-configuration marker
--atlas-cyan:    #82b8c2   reserved
--atlas-violet:  #a496bf   reserved
--atlas-display: 'Space Grotesk', sans-serif
--atlas-mono:    'IBM Plex Mono', monospace
```

Red is **action only**. It marks the primary button, the active navigation underline, section
indices, feature numbers, the precision tick and the accent word inside a display heading. It
is never used for a data series and never for a category.

## Type

- Display and UI: **Space Grotesk**, weight 500, with negative tracking that tightens as size
  grows (`-.085em` on page headings, `-.09em` on the hero). Weight and size carry the
  hierarchy; there is no second decorative face.
- Mono: **IBM Plex Mono**, 8–11px, for indices, chips, spec labels, part numbers and readouts.
  Uppercase with wide tracking (`.1em`–`.17em`).
- Arabic: **IBM Plex Sans Arabic**, loaded and applied through
  `.atlas-page[dir="rtl"]`. Arabic pages are a distinct composition, not a mirrored screenshot.
- Barlow Condensed is loaded but unused by the application's own rules; it stays available in the
  token set as `--app-font-serif`.

Type scale, as implemented: hero `clamp(66px, 7.35vw, 112px)` at `line-height .88`; page
headings `clamp(53px, 7.4vw, 96px)`; section headings `clamp(46px, 7vw, 94px)`; decision
panels `clamp(30px, 4vw, 51px)`; card titles 29px; body 12–15px; mono labels 8–11px.

## Surfaces and structure

- Surfaces 8px, controls 4px, no pills, no glow, no glass, no gradients except two functional
  overlays on the hero (a left-to-right scrim and a screen-blend light sweep).
- Borders encode grouping; they do not enclose everything.
- Exactly one shadow-free layout system. The only shadow in the build is the compare tray's
  (in the unbuilt `/compare` page).
- Grid rails are hairlines: `.catalog-grid` is a 2-column table of product plates with a top
  and left border, not a set of bordered cards.

## The field-guide grammar

- **Index** (`.page-heading-index`, `.story-kicker`) — a numbered rail: `01 / THE QUESTION`.
  Every section declares where it sits in the argument.
- **Eyebrow** (`.eyebrow`) — a small uppercase label preceded by a red rule.
- **Accent word** — the one emphasised phrase inside a display heading, wrapped in `<em>` and
  coloured by `h2 em { color: var(--atlas-red) }`.
- **Confidence chip** (`.confidence`) — a 6px dot plus a mono label. Lime for an exact
  configuration, amber for a model family. The dot is the signal; the word is the explanation.
- **Precision tick** (`.precision-tick`) — a 22px red rule used as a small marker in a label
  row or a bottom line.
- **Readout** (`.visual-readout`) — a mono annotation block over the hero, set flush right.
- **Honesty note** (`.catalog-disclaimer`, `.quiet-card`) — a research note that states what the
  page is not, always present, never dismissible.

## Motion

Short, functional, and secondary to the reading experience.

- `entry-rise` (.72s, `cubic-bezier(.2,.7,.25,1)`, staggered .08s → .48s) for the hero copy.
- `visual-arrive` (1.1s, same curve) for the hero object.
- `transition: background .2s ease, padding .2s ease` on `.feature-row` hover.
- No autoplay, no looping motion, no scroll hijacking, no magnetic pointers.

## States

Every interactive surface states itself.

- **Loading** — a status line, not a skeleton. The field guide is static; the library filters
  locally and reports its own count.
- **Empty** — `.empty-state` names the cause and offers the one action that recovers.
- **Error** — the `ErrorBoundary` renders a titled failure page, never a blank screen.
- **Selected** — `.compare-toggle.selected` changes border and label.
- **Confidence** — a per-record state, not a per-page one.
- **Reduced motion** — the global `prefers-reduced-motion` rule disables movement.

## Rules to hold

1. Red is action. A data series gets a neutral ramp, never the accent.
2. Every number is either a count of what is on screen, or a sourced record, or a labelled
   placeholder. No prices, no stock, no invented specifications.
3. A family-level reference is always labelled as a family reference.
4. One accent word per display heading, and it is the point of the sentence.
5. The hero object never competes with the headline: the scrim and the sweep exist so the copy
   stays readable.
6. Casing is a contract: interface labels are uppercase, prose is sentence case.
