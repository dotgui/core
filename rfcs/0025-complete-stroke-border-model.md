---
rfc: 0025
title: Complete stroke and border model for UI outlines
status: Draft
introduced-in: 0.3
date: 2026-05-22
related: 0022
---

# Complete stroke and border model for UI outlines

## Context

Borders are part of almost every UI: buttons, fields, cards, tables, dividers, focus rings, badges, and input states. RFC 0022 introduces `border` as the readable vocabulary for a simple outline, but the current model is not enough for high-fidelity visual export.

Design tools support multiple strokes, stroke alignment, dashed lines, different caps and joins, and occasionally gradient strokes. A single `border` shorthand is ideal for common cases but cannot represent all visible outlines.

## Decision

Keep `border` as the compact shorthand for the common single-border case, and introduce an ordered `<border>` stack for complex outlines.

```xml
<rect fill="$surface" border="$line" radius="8" />

<rect fill="$surface" radius="8">
  <appearance>
    <border color="$line" width="1" align="inside" />
    <border color="$focus" width="2" align="outside" opacity="0.9" />
  </appearance>
</rect>
```

Borders are rendered in document order. Later borders render above earlier borders.

### Border attributes

| Attr | Description |
|---|---|
| `color` | Solid color or token ref |
| `paint` | Optional paint ref/value for gradient or image-like border rendering |
| `width` | Stroke width in px |
| `align` | `inside`, `center`, `outside` |
| `style` | `solid`, `dashed`, `dotted` |
| `dash` | Explicit dash pattern, e.g. `4 2` |
| `cap` | `butt`, `round`, `square`, `arrow-lines`, `arrow-equilateral` |
| `join` | `miter`, `round`, `bevel` |
| `miter-limit` | Miter limit for sharp joins |
| `opacity` | Border-level opacity |
| `blend` | Border-level blend mode |
| `visible` | Optional boolean for hidden stroke preservation |

## Reasoning

For UI export, borders are not decorative metadata. They materially change the design. Missing or incorrect borders make inputs, tables, and cards look broken.

The shorthand handles most product UI. The tag form gives export fidelity without making every simple border verbose.

## Alternatives Considered

**Only support `border` shorthand** — Rejected. It cannot preserve multiple or dashed strokes reliably.

**Expose SVG stroke vocabulary everywhere** — Rejected. dotgui should use UI-oriented vocabulary. SVG remains an asset format, not the authoring vocabulary.

**Flatten complex bordered layers to images** — Rejected as the default because it sacrifices structure for common UI elements.

## Drawbacks

- Renderers need to layer borders correctly, especially outside and center-aligned borders.
- Per-side borders may require special layout logic if they are introduced as part of this model.
- Gradient/image borders are harder to implement consistently across DOM and canvas renderers.

## Implementation Notes

1. Implement `border` shorthand first.
2. Add `<appearance><border /></appearance>` for multiple or non-solid borders.
3. Preserve `border` for simple export and authoring.
4. Add dashed/dotted rendering in the DOM renderer.
5. Ensure outside borders do not affect layout bounds.

## Test Cases

```xml
<rect fill="$surface" border="1 $line inside" w="320" h="48" />

<rect fill="$surface" radius="8" w="320" h="48">
  <appearance>
    <border color="$line" width="1" align="inside" />
    <border color="$focus" width="2" align="outside" style="dashed" dash="4 2" />
  </appearance>
</rect>
```

## Unresolved Questions

- Should per-side borders be attributes (`border-top`) or child tags?
- Should gradient borders reuse `<fill>` paint syntax?
- Should `border` children live inside `<appearance>` or directly under the node?
