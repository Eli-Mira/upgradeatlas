# UpgradeAtlas — design system

Two layers. The **structural system** is the design system recovered from the
user's own saved build: `src/index.css` (157 KB, Tailwind v4.3.3 output plus
151 application rules) and `DESIGN.md` below. The **cinematic layer** is
`src/cinematic.css`, which re-skins that structure for the scroll-driven
direction and adds the components the narrative needs.

Load order: `index.css` then `cinematic.css`. The cinematic layer never
rewrites the structure; it remaps tokens and adds surfaces.

---

## 1. Structural system (recovered, authoritative)

### Identity

An Egypt-first **hardware intelligence** instrument, not a store and not a
marketing page. The subject is one specific machine, and the promise is that
every claim is traceable. The design leads with structure (rules, indices,
rails, grids, footnotes) and keeps imagery to one hero object per screen.

Voice: declarative and technical. No superlatives, no urgency language, no
prices, no stock claims, no retailer framing.

### Tokens

```css
--atlas-bg:      #070809   canvas
--atlas-surface: #101215   panels
--atlas-raised:  #16191e   raised controls
--atlas-line:    rgba(232, 235, 241, .13)   hairline boundaries
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

Red is **action only**. It marks the primary button, the active navigation
underline, section indices, feature numbers, the precision tick and the accent
word inside a display heading. It is never a data series.

### Type

- Display and UI: **Space Grotesk**, weight 500, negative tracking that
  tightens as size grows. Weight and size carry the hierarchy.
- Mono: **IBM Plex Mono**, 8–11px, for indices, chips, spec labels, part
  numbers and readouts. Uppercase, widely tracked.
- Arabic: **IBM Plex Sans Arabic**, applied through
  `.atlas-page[dir="rtl"]`. Arabic pages are a distinct composition.
- Barlow Condensed is loaded but unused by the application's own rules.

### Grammar

- **Index** (`.page-heading-index`, `.story-kicker`) — a numbered rail:
  `01 / THE QUESTION`.
- **Eyebrow** (`.eyebrow`) — a small uppercase label preceded by a red rule.
- **Confidence chip** (`.confidence`) — a 6px dot plus a mono label. Lime for
  an exact configuration, amber for a model family. The dot is the signal; the
  word is the explanation.
- **Honesty note** (`.catalog-disclaimer`, `.quiet-card`) — a research note
  that states what the page is not, always present, never dismissible.

### Rules to hold

1. Red is action. A data series gets a neutral ramp, never the accent.
2. Every number is either a count of what is on screen, a sourced record, or
   a labelled placeholder. No prices, no stock, no invented specifications.
3. A family-level reference is always labelled as a family reference.
4. One accent word per display heading, and it is the point of the sentence.
5. Casing is a contract: interface labels are uppercase, prose is sentence
   case.
6. Arabic is Modern Standard Arabic, not dialect.

---

## 2. Cinematic layer

### Palette

```css
--cin-bg:      #05070a   near-black
--cin-surface: #10151e   elevated dark surface
--cin-white:   #f7f7f4   warm white
--cin-gray:    #e9ebee   soft gray
--cin-cyan:    #18e1db   primary cyan
--cin-blue:    #1677ff   electric blue
--cin-violet:  #7a4dff   violet
--cin-emerald: #19d98b   emerald
--cin-muted-dark:  rgba(255, 255, 255, .62)
--cin-muted-light: rgba(5, 7, 10, .58)
--cin-serif: 'Instrument Serif', serif
--cin-ease:  cubic-bezier(.22, 1, .36, 1)
```

**Why two palettes.** The brand red stays the single action colour, because it
is the site's identity and it means "do this". Cyan, blue, violet and emerald
are **emissive** colours: rings, beams, node states, telemetry, metric
series. They light the scene, they never chrome it. The red is one accent
against a neutral ramp; the four emissive colours never appear as UI chrome.

### Type

- Sans: Space Grotesk, weight 600, tight tracking for display; weight 400–500
  for body.
- Editorial serif: **Instrument Serif** italic, for the one emotional phrase
  in a display heading and for story captions. Never for UI.
- Mono: IBM Plex Mono, for every technical label.
- Two families only, plus the mono face.

### Section rhythm

Sections alternate near-black and warm white. A light section tucks under the
dark one above it with a 34px rounded top, so the page reads as stacked
plates rather than bands. Generous vertical whitespace, 8px spacing system,
16–24px radii on large cards, 999px on pills.

### Motion

- **Scroll progress drives the hero.** A pinned hero over 2.3 viewport heights,
  scrubbed at 0.85. The product sequence, the rings, the beam, the nodes, the
  headline and the telemetry are all functions of scroll position.
- **No loops.** Nothing animates on its own. The page is still when the reader
  is still, and costs nothing while the tab is hidden.
- **Reveals are progressive enhancement.** Content is visible by default; only
  elements measured below the fold wait, and an IntersectionObserver reveals
  them. A page that never scrolls, a print, or a browser without scripting
  still shows every word.
- **Reduced motion** replaces the pinned transformation with a static, complete
  composition: the open product, the rings, the headline and the telemetry, all
  legible without scrolling. Particles, counting and rotation are off.
- Interface controls stay immediate: hover and press feedback use 0.2s, never
  the cinematic curve.

### The product

`assets/sequence/` holds a 16-frame pre-rendered sequence of the concept
laptop, produced by `motion/product-studio.js` and `motion/render-sequence.py`
from the original procedural geometry in `motion/laptop.js`. The lid opens on
its hinge while the camera orbits and closes in. Two further frames,
`exploded-assembled` and `exploded-separated`, are the conceptual exploded
view: the screen assembly lifts from the keyboard deck, which lifts from the
bottom shell, along believable vertical axes.

The sequence is scrubbed to a canvas, so the page carries **no 3D runtime**.
The geometry is original and the frames are the only shipped artefacts.

It is a **conceptual exploded view**, not a teardown drawing of a real
machine, and the copy says so.

### The story cards are typographic

The reference direction uses monochrome lifestyle photography. No stock
photography is used here: a card that implies a photograph it does not have
would be a claim the site cannot back. The cards are type, a label, a rule and
an italic caption.

### Rules to hold (cinematic)

1. Scroll position is the only clock. Nothing loops, nothing autoplays.
2. The machine never sits under the words it contradicts. The product passes
   behind the headline only when the headline is the lighter element.
3. Every interactive element is a real control: the explorer nodes are buttons,
   the chips are buttons, the telemetry is real data.
4. A hover has a keyboard and a touch equivalent, and announces itself.
5. The composition mirrors with the locale: in Arabic the machine moves to
   the opposite side and the nodes ring it from the other direction.
6. Never claim a number the site cannot source. Where a number would be
   invented, the panel states that it is omitted on purpose.
