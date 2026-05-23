---
rfc: 0027
title: Ordered effects stack
status: Draft
introduced-in: 0.3
date: 2026-05-22
---

# Ordered effects stack

## Context

Effects define visual depth and polish: shadows, inner shadows, layer blur, background blur, and glass/frosted treatments. dotgui already has basic effect support, but it needs a stricter stack model for visual export fidelity.

The format should preserve effects that visibly alter the exported UI, without attempting to capture unrelated editor metadata.

## Decision

Effects are represented as ordered children in `<appearance>`.

```xml
<rect fill="$surface" radius="12" w="320" h="120">
  <appearance>
    <effect type="drop-shadow" x="0" y="8" radius="24" spread="0" color="#00000029" />
    <effect type="background-blur" radius="16" />
  </appearance>
</rect>
```

### Effect attributes

| Attr | Description |
|---|---|
| `type` | `drop-shadow`, `inner-shadow`, `layer-blur`, `background-blur`, `glass` |
| `x` / `y` | Shadow offset |
| `radius` | Shadow blur or blur radius |
| `spread` | Shadow spread |
| `color` | Shadow color |
| `opacity` | Effect-level opacity when separate from color alpha |
| `blend` | Effect-level blend mode |
| `saturation` | Glass/backdrop saturation percentage |
| `visible` | Optional boolean for preserving hidden effects |

Effects render in document order. The exporter should preserve source ordering when source tools expose it.

## Reasoning

Effects are visual, not semantic, so they belong in `<appearance>`. This keeps layout tags clean while making it clear that fills, borders, and effects collectively describe the layer's rendered surface.

The model should stay intentionally smaller than a design editor's internal effect system. It only needs effects that can be rendered or approximated in downstream visual outputs.

## Alternatives Considered

**Use a single `shadow` shorthand only** — Rejected. It cannot represent multiple shadows, inner shadows, blur, or glass.

**Flatten effect-heavy layers to images** — Rejected as the default. It should remain a fallback for unsupported source effects.

**Expose tool-specific effect names** — Rejected. dotgui should use stable visual concepts, not vendor names.

## Drawbacks

- CSS and canvas renderers may differ in background blur and glass behavior.
- Effect stacking can be subtle, especially with blend modes.
- Some source effects may need export warnings or raster fallback.

## Implementation Notes

1. Preserve current effect types.
2. Add `opacity`, `visible`, and stricter ordered rendering.
3. Prefer `<effect>` over `shadow` shorthand when more than one effect exists.
4. Allow optimizer to remove no-op effects only below documented perceptual thresholds.
5. Unsupported effects should be explicitly reported, not silently dropped.

## Test Cases

```xml
<rect fill="$surface" radius="16" w="300" h="160">
  <appearance>
    <effect type="drop-shadow" x="0" y="2" radius="6" spread="0" color="#0000001F" />
    <effect type="drop-shadow" x="0" y="16" radius="32" spread="-8" color="#00000029" />
  </appearance>
</rect>

<frame fill="#FFFFFF66" w="320" h="80">
  <appearance>
    <effect type="background-blur" radius="24" />
    <effect type="glass" radius="24" saturation="180" />
  </appearance>
</frame>
```

## Unresolved Questions

- Should `glass` remain a separate effect or compile into blur + saturation?
- Should unsupported source effects force raster fallback?
- Should effect styles reference the same ordered effect model?
