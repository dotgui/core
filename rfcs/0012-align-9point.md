---
rfc: 0012
title: 9-point align replaces justify + align
status: Draft
targets: 0.2
date: 2026-05-20
---

# 9-point align Replaces justify + align

## Context

In 0.1, positioning items inside a layout container requires two attributes:

- `justify` — main axis (direction of flow): `start | center | end | space-between`
- `align` — cross axis (perpendicular): `start | center | end | stretch | baseline`

This is CSS vocabulary. It requires knowing which axis is "main" and which is "cross" relative to the container's direction — which flips between `row` and `col`. It's correct but it's a cognitive tax.

Figma's approach is simpler: a 9-point grid that describes where items sit in the container visually. No axis terminology needed.

## Decision

Replace `justify` and `align` with a single `align` attribute using 9 positional values:

```
top-left      top-center      top-right
middle-left   middle-center   middle-right
bottom-left   bottom-center   bottom-right
```

Direction-independent — always describes item position in the container visually.

```xml
<row align="middle-center">    <!-- was: justify="center" align="center" -->
<row align="middle-left">      <!-- was: justify="start" align="center" -->
<col align="bottom-left">      <!-- was: justify="end" align="start" -->
```

Special values not on the 9-point grid:

| Value | Meaning |
|---|---|
| `align="stretch"` | items stretch to fill cross axis |
| `align="baseline"` | text baseline alignment (horizontal stacks only) |

Default when absent: `top-left`.

Distribution (space-between) is handled by `gap="auto"` — see RFC-0013.

## Reasoning

The 9-point model matches how designers think. "Items are centered in the middle of the container" is a visual description, not an axis calculation. It's how Figma's UI works and how designers describe layout verbally.

For AI generation, `align="middle-center"` is significantly more robust than the two-attribute form — the model cannot forget to set `justify` or use the wrong axis.

The 9 values map 1:1 to the cross product of `{top, middle, bottom} × {left, center, right}` — completely systematic, no special cases to memorize.

`stretch` and `baseline` are kept as special values because they have no natural 9-point position — they describe behavior, not a position.

## Alternatives Considered

**Keep CSS `justify` / `align`** — Rejected. Axis terminology adds cognitive load and is CSS-specific. dotgui is platform-agnostic.

**Figma's internal names (`primaryAxisAlignItems`)** — Rejected. Internal API noise, not human-readable. See RFC-0003.

**Two-value `align="center center"` (cross main)** — Considered. Less readable than named positions. `middle-center` communicates visually, `center center` requires knowing the order convention.

## Drawbacks

- Breaking change from 0.1
- `stretch` and `baseline` sit outside the 9-point system — two vocabularies in one attribute
- `space-between` is handled by a different attribute (`gap`) — slight conceptual split, but the tradeoff is cleaner than cramming distribution into a position attribute

## Unresolved Questions

- Should absent `align` mean `top-left` explicitly, or "no alignment set" (renderer default)?
- Is `baseline` useful enough to keep or is it an edge case to defer?
