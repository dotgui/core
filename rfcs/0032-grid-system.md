---
rfc: 0032
title: Grid system — track grid and unit grid
status: Implemented
introduced-in: 0.3
date: 2026-05-23
---

# Grid System — Track Grid and Unit Grid

## Context

The current `<grid>` tag (RFC-0006) supports only uniform equal-column auto-flow layouts — `columns="3"` produces `repeat(3, 1fr)`. Children are passive; they have no placement control. This covers card grids and icon grids but nothing more.

Two major use cases are unaddressed:

1. **Asymmetric page layouts** — app shells, sidebars, dashboards. Tracks of mixed sizes (`240px 1fr`). Children at specific positions.
2. **Floating, non-structured component layouts** — cards, widgets, overlapping elements, canvas-style UIs where elements are freely positioned rather than flow-driven. Design-system-snapped coordinate space. No `<frame>` + `abs` escape hatch needed.

Additionally, the current `<cell>` concept (explored in design sessions) introduces an unnecessary wrapper tag. Grid placement attrs can live directly on children, eliminating one level of nesting.

---

## Decision

Two distinct grid modes are introduced, both on the `<grid>` tag. The mode is determined by which attrs are present. Children declare their own placement via `gc` and `gr` attrs directly — no `<cell>` wrapper.

### Sizing contract — universal

`w` and `h` are **always pixels** in all contexts, including inside a unit grid. There are no dual semantics. The same rules apply everywhere:

- `w="320"` → 320 px fixed
- `w` absent + `gc` range defined → fills the spanned columns (`width: 100%`)
- `w` absent + no `gc` range → hugs content

The fill-vs-hug decision is driven by whether `gc`/`gr` carries a range, not by a separate `w` value.

---

## Mode 1 — Track Grid

Parent declares track sizes. Children declare which track they occupy.

### `<grid>` attrs — track mode

| Attr | Example | Meaning |
|---|---|---|
| `cols` | `"3"` | 3 equal columns → `repeat(3, 1fr)` |
| | `"240 1fr"` | mixed tracks — bare integer = px, explicit unit for `fr` / `auto` |
| | `"fill 200"` | responsive — fills container with min-200px columns |
| `rows` | same rules as `cols` | row track sizes |
| `gap` | `"16"` / `"16 8"` | existing convention — uniform or col-gap row-gap |
| `w`, `h` | existing | `fill` or fixed px |

`cols="3"` (bare integer) is shorthand for `repeat(3, 1fr)` — existing behaviour, unchanged.

Track template strings: bare integer within a string = px. Explicit unit required for `fr`, `auto`, `%`.

```
cols="3"          →  repeat(3, 1fr)
cols="240 1fr"    →  240px 1fr
cols="1fr 2fr"    →  1fr 2fr
cols="auto 1fr"   →  auto 1fr
cols="fill 200"   →  repeat(auto-fill, minmax(200px, 1fr))
```

### Child placement attrs — track mode

Any direct child of a track grid may carry these attrs:

| Attr | Example | Meaning |
|---|---|---|
| `gc` | `"1"` | sit in column 1, hug content width |
| | `"2/5"` | columns 2 through 5 inclusive — fills if no `w` given |
| | `"1/-1"` | first to last column — spans all columns |
| `gr` | same rules | row position |
| `col-span` | `"2"` / `"all"` | span N columns from current position |
| `row-span` | `"2"` | span N rows |

**Range end is inclusive.** `gc="2/5"` occupies columns 2, 3, 4, and 5. In CSS terms this is `grid-column: 2 / 6`. The renderer adds +1 to the end when converting, except for negative indices (`-1` = last line) which are passed through as-is.

**Fill rule.** When `gc` carries a range and `w` is absent, the child fills the column span (`width: 100%`). When `gr` carries a range and `h` is absent, the child fills the row span (`height: 100%`). When `w` or `h` is explicitly given, that pixel value is used regardless of range.

`gc` and `gr` stand for **grid-column** and **grid-row**. Named to avoid collision with `<col>` and `<row>` tag names.

Children without `gc`/`gr` auto-flow into the next available cell — existing behaviour.

### Example

```xml
<grid cols="200 1fr" rows="56 1fr" gap="0" w="fill" h="fill">

  <row gc="1/-1" gr="1" h="fill" fill="#fff" p="0 20" align="middle-left" gap>
    <text value="Dashboard" font-size="17" font-weight="600" />
    <img w="28" h="28" radius="14" src="$avatar" />
  </row>

  <col gc="1" gr="2" fill="#f7f7f7" p="12" gap="2">
    <row w="fill" p="10 12" radius="8" fill="#007aff" align="middle-left">
      <text value="Home" color="#fff" font-size="14" font-weight="500" />
    </row>
    <row w="fill" p="10 12" align="middle-left">
      <text value="Settings" font-size="14" color="#333" />
    </row>
  </col>

  <col gc="2" gr="2" p="32" gap="16">
    <text value="Overview" font-size="22" font-weight="700" />
  </col>

</grid>
```

Note: `gc="1/-1" gr="1"` — no `w` or `h` given. The `gc` range spans all columns so width fills. The `gr` has no range so height hugs; `h="fill"` is added explicitly instead.

---

## Mode 2 — Unit Grid

Unit grid is designed for **floating, non-structured interfaces** — layouts where elements are freely placed in a coordinate space rather than flowing through defined tracks. Think overlapping UI layers, dashboard widgets, canvas-style components, and design-system-snapped cards where elements sit at intentional positions rather than inside a flow.

This is the replacement for `<frame>` at the component level. Where track grid imposes structure, unit grid gives freedom within a snapped coordinate system.

Parent declares a unit size in px. The grid becomes a coordinate space. Children declare their position in unit columns/rows and their size either via a `gc`/`gr` range (fill) or via explicit `w`/`h` in pixels (fixed).

### `<grid>` attrs — unit mode

| Attr | Example | Meaning |
|---|---|---|
| `unit` | `"8"` | each grid square = 8px. Presence activates unit mode |
| `w`, `h` | `"320"` `"400"` | total canvas size in px |

`w ÷ unit` and `h ÷ unit` give the column and row count of the coordinate space.

### Child placement attrs — unit mode

| Attr | Example | Meaning |
|---|---|---|
| `gc` | `"5"` | start at unit column 5, hug content width |
| | `"5/20"` | unit columns 5 through 20 inclusive — fills if no `w` |
| `gr` | same rules | unit row position |
| `w` | `"128"` | **pixels** — 128px wide, positioned at gc start column |
| `h` | `"48"` | **pixels** — 48px tall, positioned at gr start row |

`w` and `h` are always pixels — the same as everywhere else. The grid range on `gc`/`gr` drives fill behaviour when `w`/`h` are absent.

Children at overlapping coordinates stack in document order — first child is behind, last child is in front. This replaces `<frame>` + `abs` for component-level overlap.

### Example

```xml
<grid unit="8" w="320" h="400" fill="#fff" radius="16">

  <!-- Cover image: fills full width (cols 1–40) and 112px height (rows 1–14) -->
  <img gc="1/40" gr="1/14" fit="cover" src="$cover" />

  <!-- Avatar: 128×128px circle, positioned at col 13, row 9 -->
  <img gc="13" gr="9" w="128" h="128" fit="cover" radius="64" border="4 #fff" src="$avatar" />

  <!-- Online indicator dot: 32×32px -->
  <col gc="26" gr="21" w="32" h="32" fill="#34c759" radius="4" border="2 #fff" />

  <!-- Name + handle: fills cols 2–39, rows 27–32 -->
  <col gc="2/39" gr="27/32" align="middle-center" gap="2">
    <text value="Sarah Johnson" font-size="18" font-weight="700" color="#111" />
    <text value="@sarahj" font-size="13" color="#888" />
  </col>

  <!-- Stats row: fills cols 2–39, rows 34–41 -->
  <row gc="2/39" gr="34/41" gap align="middle-center">
    <col w="fill" align="middle-center" gap="2">
      <text value="248" font-size="17" font-weight="700" />
      <text value="Posts" font-size="12" color="#888" />
    </col>
    <col w="fill" align="middle-center" gap="2">
      <text value="12.4k" font-size="17" font-weight="700" />
      <text value="Followers" font-size="12" color="#888" />
    </col>
  </row>

  <!-- Follow button: 128×48px fixed -->
  <row gc="3" gr="44" w="128" h="48" fill="#007aff" radius="8" align="middle-center">
    <text value="Follow" color="#fff" font-size="14" font-weight="600" />
  </row>

  <!-- Message button: 128×48px fixed -->
  <row gc="22" gr="44" w="128" h="48" fill="#f0f0f0" radius="8" align="middle-center">
    <text value="Message" font-size="14" font-weight="600" color="#111" />
  </row>

</grid>
```

---

## Mode Disambiguation

The active mode is determined by which attrs are present on `<grid>`:

| Attrs present | Mode |
|---|---|
| `cols` and/or `rows` | track grid |
| `unit` | unit grid |
| `cols`/`rows` + `unit` | ❌ validation error — pick one |
| neither | simple auto-flow (existing `columns="N"` behaviour) |

---

## `gc` / `gr` naming

`gc` and `gr` stand for grid-column and grid-row. The names are chosen to avoid collision with existing tag names `<col>` and `<row>`.

Without this distinction, placement attrs would conflict visually:

```xml
<col col="1" row="2">   ← col tag + col attr — ambiguous at a glance
<row row="1" gc="1">    ← row tag + row attr — same problem
```

With `gc`/`gr`:

```xml
<col gc="1" gr="2">     ← unambiguous
<row gc="1/-1" gr="1">  ← unambiguous
```

---

## Alternatives Considered

**`<cell>` wrapper tag** — explored and rejected. A `<cell>` wrapper separates placement from layout direction cleanly but adds an unnecessary nesting level and a new concept. `gc`/`gr` directly on children achieves the same result with less markup.

**CSS passthrough template string on `cols`/`rows`** — e.g. `cols="repeat(auto-fill, minmax(200px, 1fr))"`. Rejected. Too CSS-specific. `cols="fill 200"` is design-vocabulary-aligned and translates to the same CSS output.

**`col-pos` / `row-pos` naming** — considered for placement attrs. Rejected as too verbose. `gc`/`gr` are short and unambiguous in context.

**Single unified grid model** — one mode covering both flexible and rigid layouts. Rejected. Track grid and unit grid are philosophically opposite — flexible vs rigid, track-indexed vs coordinate-based, responsive vs fixed-canvas. A single model would require complex conditional behaviour.

**`x` / `y` for unit grid position** — `x` and `y` already mean pixel position on absolutely-positioned children (frame context). Reusing them in unit grid context would create a semantic collision.

**Dual `w`/`h` semantics (unit counts in unit grid)** — considered and rejected. Having `w`/`h` mean "unit counts" inside a unit grid and "pixels" everywhere else creates hidden context-dependent behaviour. A child moved out of a unit grid would silently change meaning. The range-on-`gc`/`gr` approach gives fill sizing without reinterpreting `w`/`h`.

---

## Drawbacks

- `gc`/`gr` are new attr names to learn. Not immediately obvious to new authors without documentation.
- Unit grid is not responsive by nature. Fixed canvas only. Intentionally so — it targets floating, non-structured interfaces where position is deliberate, not flow-driven. Cannot and should not be used for page-level layouts.
- Range-based fill requires knowing the column/row count to write the end index. For full-span elements in unit grid, authors must know `w ÷ unit` and `h ÷ unit` to write the correct end.

---

## Implementation Notes

- Parser: detect mode from `<grid>` attrs. If `unit` present → unit mode. If `cols`/`rows` present → track mode. Both → validation error.
- Parser: `w`/`h` are always parsed as pixels regardless of grid mode. No special handling for unit grid children.
- Renderer: `cols="3"` → `grid-template-columns: repeat(3, 1fr)`. `cols="240 1fr"` → `grid-template-columns: 240px 1fr`. `cols="fill 200"` → `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`.
- Renderer: unit grid → `display: grid` with equal fixed tracks. Child `gc`/`gr` map to `grid-column-start`/`grid-row-start`.
- Renderer: range end is inclusive. `gc="2/5"` → CSS `grid-column: 2 / 6`. Negative end indices (e.g. `-1`) are passed through as-is (CSS semantics preserved).
- Renderer: when `gc` carries a range and `w` is absent → set `width: 100%`. When `gr` carries a range and `h` is absent → set `height: 100%`. Explicit `w`/`h` in px always take precedence.
- Renderer: overlapping unit grid children — document order determines z-index. No explicit z attr needed for common cases.
- Figma plugin: auto-layout grid direction maps to track grid. Absolutely positioned frame children with consistent x/y alignment may be detected and emitted as unit grid by the optimizer.
- Existing `<grid columns="3">` remains valid — `columns` is accepted as an alias for `cols` during the transition period.
