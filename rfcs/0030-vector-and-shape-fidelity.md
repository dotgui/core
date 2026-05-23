---
rfc: 0030
title: Vector and shape fidelity
status: Superseded
superseded-by: 0023
introduced-in: 0.3
date: 2026-05-22
related: 0023
---

> **Superseded by RFC 0023.** All decisions here — `<rect>`, `<ellipse>`, `<line>` as native tags, vector paths as SVG assets via `<img>`, arc/donut shapes as assets — are fully covered by RFC 0023 (Implemented). This file is kept for history only.

# Vector and shape fidelity

## Context

UI exports contain simple geometry and complex vector artwork. Simple geometry should stay readable in `.gui`; complex vectors should preserve visual fidelity without importing SVG vocabulary into the main format.

RFC 0023 proposes removing `<shape>` and using `<rect>`, `<ellipse>`, `<line>`, and `<img>` for vector assets.

This RFC defines the visual-fidelity target for those primitives.

## Decision

Use native dotgui tags for simple UI geometry:

```xml
<rect fill="$surface" radius="12" w="320" h="80" />
<ellipse fill="$red" w="8" h="8" />
<line fill="$line" w="fill" thickness="1" />
```

Use packaged SVG assets for complex vectors:

```xml
<img src="$svg-logo" w="120" h="32" fit="contain" />
<img src="$icon-search" w="20" h="20" />
```

Simple geometry supports:

| Feature | Applies to |
|---|---|
| `fill` | rect, ellipse, line |
| `border` / `<border>` | rect, ellipse |
| `radius` | rect |
| per-corner radius | rect |
| `corner-smoothing` | rect |
| `opacity`, `blend`, `rotation` | all |
| effects/appearance | rect, ellipse |

Complex SVG assets preserve source vector rendering, but their internal paths are not part of dotgui authoring vocabulary.

## Reasoning

This split keeps dotgui readable and visually complete. A rectangle should not be hidden in SVG. A complex logo should not be decomposed into an awkward pseudo-vector model unless the format is trying to become a vector editor, which it is not.

For the `.gui` purpose, flattened vector assets are acceptable because the goal is export fidelity and structural UI understanding, not vector editability.

## Alternatives Considered

**Full vector-network model** — Rejected. Too close to a design editor save format.

**Inline SVG inside `.gui`** — Rejected by RFC 0023. It imports another vocabulary and makes the format less consistent.

**Rasterize all vectors** — Rejected. SVG assets preserve resolution and are better for icons/logos.

## Drawbacks

- SVG asset internals are opaque to AI/code consumers.
- Per-point vector editing is impossible from `.gui`.
- Some simple-looking artwork may be exported as an asset if it relies on unsupported vector behavior.

## Implementation Notes

1. Implement `<rect>`, `<ellipse>`, and `<line>` as first-class helper tags.
2. Export vector, star, polygon, boolean operation, arc, and donut shapes as SVG assets.
3. Deduplicate identical SVG assets.
4. Preserve intrinsic asset dimensions.
5. Prefer native tags only when the result can be rendered faithfully.

## Test Cases

```xml
<rect fill="$button" radius="8" w="120" h="40" />
<ellipse fill="$status-green" w="10" h="10" />
<line fill="$border" w="fill" thickness="1" />
<img src="$svg-complex-logo" w="144" h="40" />
```

## Unresolved Questions

- Should arcs/donuts always become SVG assets?
- Should simple single-path icons ever be represented structurally?
- Should SVG assets include source node names or descriptions?
