---
rfc: 0025
title: Complete stroke and border model for UI outlines
status: Implemented
introduced-in: 0.3
date: 2026-05-22
updated: 2026-05-23
related: 0022
---

# Complete stroke and border model for UI outlines

## Context

Borders are part of almost every UI: buttons, fields, cards, tables, dividers, focus rings, badges, and input states. RFC 0022 introduces `border` as the readable vocabulary for a simple outline, but the current model is not enough for high-fidelity visual export.

Design tools support multiple strokes, stroke alignment, dashed lines, different caps and joins, and occasionally gradient strokes. A single `border` shorthand is ideal for common cases but cannot represent all visible outlines.

## Decision

Keep `border` as the compact shorthand for the common single-border case, and introduce an ordered `<border>` stack inside `<appearance>` for complex outlines.

```xml
<rect fill="$surface" border="$line" radius="8" />

<rect fill="$surface" radius="8">
  <appearance>
    <border color="$line" w="1" align="inside" />
    <border color="$focus" w="2" align="outside" opacity="0.9" />
  </appearance>
</rect>
```

Borders are rendered in document order. Later borders render above earlier borders.

When `<appearance>` contains at least one `<border>`, the `border` shorthand on the parent element is ignored — the appearance stack owns all border rendering.

### Border attributes

| Attr | Description |
|---|---|
| `color` | Solid color or token ref |
| `paint` | Optional paint ref/value for gradient or image-like border; falls back to first solid stop in DOM renderer |
| `w` | Stroke width in px (follows the format-wide `w` convention) |
| `align` | `inside`, `center` (default), `outside` |
| `style` | `solid` (default), `dashed`, `dotted` |
| `dash` | Explicit dash pattern, e.g. `4 2` — SVG renderers only; ignored in DOM renderer |
| `cap` | `butt`, `round`, `square`, `arrow-lines`, `arrow-equilateral` — SVG renderers only |
| `join` | `miter`, `round`, `bevel` — SVG renderers only |
| `miter-limit` | Miter limit for sharp joins — SVG renderers only |
| `opacity` | Border-level opacity |
| `blend` | Border-level blend mode |
| `visible` | Set to `false` to preserve a hidden stroke without rendering it |

### Shorthand syntax

`border="[width] [color] [align] [style]"` — tokens can appear in any order. Width is a bare number, color starts with `#`, `$`, or `rgba`, align is one of `inside`/`center`/`outside`, style is one of `solid`/`dashed`/`dotted`.

```xml
<rect border="1 $line inside" w="320" h="48" />
<rect border="2 #ff0000 outside dashed" radius="8" w="320" h="48" />
```

### Per-side borders

Individual sides use `border-top`, `border-right`, `border-bottom`, `border-left` attributes directly on the element. They accept the same shorthand grammar (`width color [style]`) but without an alignment token — per-side borders are always `inside`.

```xml
<!-- bottom divider only -->
<rect fill="$surface" border-bottom="1 $line" w="320" h="48" />

<!-- left accent + top cap -->
<rect fill="$surface" border-left="4 $brand" border-top="1 $line" w="320" h="48" />

<!-- different colors per side -->
<rect border-top="2 $focus" border-right="1 $line" border-bottom="1 $line" border-left="2 $focus" w="320" h="48" />
```

Per-side attrs are independent of the `border` shorthand and the `<appearance><border>` stack — they can be combined freely.

## Reasoning

For UI export, borders are not decorative metadata. They materially change the design. Missing or incorrect borders make inputs, tables, and cards look broken.

The shorthand handles most product UI. The tag form gives export fidelity without making every simple border verbose.

The `w` attribute name matches the format-wide convention (`w`/`h` for all width/height measurements) rather than the longer `width` used by SVG and CSS.

## Alternatives Considered

**Only support `border` shorthand** — Rejected. It cannot preserve multiple or dashed strokes reliably.

**Expose SVG stroke vocabulary everywhere** — Rejected. dotgui should use UI-oriented vocabulary. SVG remains an asset format, not the authoring vocabulary.

**Flatten complex bordered layers to images** — Rejected as the default because it sacrifices structure for common UI elements.

**`border` children directly under the node (not inside `<appearance>`)** — Rejected. Grouping all paint-layer overrides inside `<appearance>` keeps the structure consistent with fills and effects.

## Drawbacks

- Renderers need to layer borders correctly, especially outside and center-aligned borders.
- Per-side borders are not part of this model and remain an open question.
- Gradient/image borders require SVG or pseudo-element tricks in DOM renderers; the DOM renderer currently extracts the first solid stop as a fallback.
- Custom `dash`, `cap`, `join`, and `miter-limit` are meaningful only in SVG-based renderers; the DOM renderer ignores them.

## Implementation

### Parser (`gui-parser`)

- `miter-limit` added to `NUMERIC_ATTRS` for correct type coercion.
- `w` was already in `NUMERIC_ATTRS` (no change needed).
- `parseAppearance` now collects `<border>` children into a `borders: ParsedNode[]` array alongside `fills` and `effects`.

### DOM Renderer (`gui-render`)

- `hasAppearanceBorder(el)` — returns true when the element's `<appearance>` contains at least one `<border>` child.
- `renderBorderElement(target, borderEl, radius?)` — creates an absolutely-positioned overlay div. Handles `w`, `align` (inside / center / outside), `style` (solid / dashed / dotted), `color`, `paint` (gradient → first solid stop), `opacity`, `blend`, and `visible`.
- `renderAppearance` dispatches `<border>` children to `renderBorderElement` in document order.
- `strokeStyle` (shorthand path) is skipped entirely when `hasAppearanceBorder` returns true. Also updated to apply `style` from the shorthand parser, so `border="2 $focus dashed outside"` now renders correctly.
- `strokePerSideStyle(el, guiEl, radius?)` — reads `border-top`, `border-right`, `border-bottom`, `border-left` from the element; if any are present, creates a single overlay div and sets the corresponding `borderTop` / `borderRight` / `borderBottom` / `borderLeft` CSS properties. Always inside-aligned. Called after `strokeStyle` in every render path.

### Not implemented in DOM renderer

`dash`, `cap`, `join`, `miter-limit` — these require SVG path stroke APIs and are deferred to SVG/canvas renderer work.

## Test Cases

```xml
<!-- Shorthand: solid inside border -->
<rect fill="$surface" border="1 $line inside" w="320" h="48" />

<!-- Shorthand: dashed outside border -->
<rect fill="$surface" border="2 $focus dashed outside" radius="8" w="320" h="48" />

<!-- Appearance stack: two stacked borders -->
<rect fill="$surface" radius="8" w="320" h="48">
  <appearance>
    <border color="$line" w="1" align="inside" />
    <border color="$focus" w="2" align="outside" style="dashed" />
  </appearance>
</rect>

<!-- Hidden border preserved for export tools -->
<rect fill="$surface" w="320" h="48">
  <appearance>
    <border color="$line" w="1" align="inside" visible="false" />
  </appearance>
</rect>

<!-- Gradient border via paint (DOM: first stop used) -->
<rect fill="$surface" radius="8" w="320" h="48">
  <appearance>
    <border paint="linear-gradient(to right, #FF6B6B, #4ECDC4)" w="2" align="outside" />
  </appearance>
</rect>

<!-- Per-side: bottom divider -->
<rect fill="$surface" border-bottom="1 $line" w="320" h="48" />

<!-- Per-side: left accent bar -->
<rect fill="$surface" border-left="4 $brand" w="320" h="48" />

<!-- Per-side + all-sides combined -->
<rect fill="$surface" border="1 $line" border-bottom="2 $focus" w="320" h="48" />
```

## Resolved Questions

**Should `border` children live inside `<appearance>` or directly under the node?**
Inside `<appearance>`. This keeps all paint-layer data (fills, effects, borders) grouped consistently.

**Should the stroke width attribute be `width` or `w`?**
`w`, following the format-wide convention that all width measurements use `w`.

**Should per-side borders be attributes or child tags?**
Flat attributes — `border-top`, `border-right`, `border-bottom`, `border-left` — following the CSS naming convention. They are independent of the `border` shorthand and the `<appearance><border>` stack and can be freely combined with either.

## Open Questions

- Should gradient borders formally reuse `<fill>` paint syntax, or remain a separate `paint` attr on `<border>`?
