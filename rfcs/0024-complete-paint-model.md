---
rfc: 0024
title: Complete paint model for visual export fidelity
status: Draft
introduced-in: 0.3
date: 2026-05-22
---

# Complete paint model for visual export fidelity

## Context

dotgui is best understood as a portable visual UI export format with structured design data inside it. It is not a Figma document clone, but it must preserve what the exported design looks like.

The current model supports a simple `fill` attribute and an `<appearance>` block with basic fill children. That covers many simple UI cases, but it is not sufficient for high-fidelity export from visual design tools. Modern UI layers commonly use stacked fills, image fills, gradient overlays, fill-specific opacity, and blend modes.

If these paints are collapsed into a single `fill` value, the exported `.gui` may remain readable but will not remain visually faithful.

## Decision

Introduce a complete ordered paint stack for fills.

Simple single-paint cases continue to use the compact `fill` attribute:

```xml
<rect fill="$surface" w="320" h="80" />
<text value="Hello" fill="$ink" />
```

Layers with multiple paints, image paints, paint-level blend modes, or crop/transform metadata use `<appearance><fill /></appearance>`:

```xml
<frame w="320" h="180">
  <appearance>
    <fill type="image" src="$img-1" fit="cover" />
    <fill type="linear-gradient" value="linear-gradient(180deg, #00000000 0%, #00000099 100%)" blend="normal" opacity="0.8" />
  </appearance>
</frame>
```

Paints are ordered back-to-front in document order. Later fills render above earlier fills.

### Fill attributes

| Attr | Description |
|---|---|
| `type` | `color`, `linear-gradient`, `radial-gradient`, `angular-gradient`, `image` |
| `value` | Color or gradient value |
| `src` | Asset ref for image fills |
| `fit` | `cover`, `contain`, `crop`, `tile`, `fill`, `none` |
| `opacity` | Paint-level opacity, `0`-`1` |
| `blend` | Paint-level blend mode |
| `visible` | Optional boolean, emitted only when preserving hidden paints is required |
| `x` / `y` | Crop offset |
| `w` / `h` | Crop size |
| `transform` | Optional compact transform matrix for exact image/gradient mapping |

## Reasoning

Paints define the visible surface of most UI. A card background, a hero image, a scrim overlay, and a brand gradient are all paint concerns. If dotgui cannot express these accurately, the format fails at its primary job as a visual export artifact.

The compact `fill` attribute should stay because the common case should remain readable. The ordered paint stack should exist only when fidelity requires it.

This keeps dotgui from becoming a design-editor save file while still making it visually complete.

## Alternatives Considered

**Always use `<appearance>` for every fill** — Rejected. It makes simple UI noisy and undermines dotgui's readability.

**Represent gradients only as CSS strings** — Partially accepted for simple gradients. Rejected as the only representation because exact export may require transform metadata.

**Export complex paint stacks as a flattened image** — Rejected as the default. It preserves pixels but loses useful structure for renderers, AI agents, and code generators.

## Drawbacks

- Renderers need a real paint-stack renderer instead of a single background value.
- Gradient and image transform handling must be carefully specified to avoid approximation drift.
- The schema must distinguish compact authoring convenience from full export fidelity.

## Implementation Notes

1. Keep `fill` as shorthand for a single visible paint.
2. Emit `<appearance>` when there is more than one visible fill or when the fill is image/crop/transform-sensitive.
3. Add paint-level `blend`, `visible`, and `transform` support.
4. Update renderer paint order to match design-tool stacking.
5. Update optimizer rules so they do not collapse paint stacks unless the visual result is provably identical.

## Test Cases

```xml
<rect fill="#FFFFFF" w="320" h="80" />

<frame w="320" h="180">
  <appearance>
    <fill type="image" src="$img-hero" fit="crop" x="12" y="8" w="640" h="360" />
    <fill type="color" value="#00000066" blend="multiply" opacity="0.75" />
  </appearance>
</frame>
```

## Unresolved Questions

- Should `transform` be a six-value matrix string or named numeric attrs?
- Should hidden paints be emitted by default or only in debug/lossless export mode?
- Should gradient handles get first-class attrs instead of a generic transform?
