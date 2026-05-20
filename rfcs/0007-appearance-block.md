---
rfc: 0007
title: Appearance block for multi-fill
status: Implemented
introduced-in: 0.1
date: 2026-05-20
---

# Appearance Block for Multi-fill

## Context

Figma supports multiple fills stacked on a single layer — e.g. an image fill with a color overlay on top. It also supports multiple effects (shadows, blurs) on the same node. A single `fill` attribute cannot represent this.

## Decision

Nodes with multiple fills or complex effects carry an `<appearance>` child block instead of inline `fill` / `shadow` attributes.

```xml
<frame w="320" h="180">
  <appearance>
    <fill type="image" src="$img-1" fit="cover" />
    <fill type="color" value="#00000066" />
    <effect type="drop-shadow" x="0" y="8" radius="24" color="#00000033" />
  </appearance>
  ...
</frame>
```

## Reasoning

The appearance block keeps the common case (single fill, single effect) simple — just `fill="#007AFF"` inline. The uncommon case (stacked fills, multiple effects) gets a structured block that can express arbitrary layering.

This avoids encoding a list in an attribute value (e.g. `fill="[image, overlay]"`) which would be hard to parse, hard to read, and hard for AI to generate correctly.

The `<appearance>` block is ordered — fills and effects are applied top-to-bottom as listed, matching Figma's layer stack.

## Alternatives Considered

**Numbered attributes** (`fill-1`, `fill-2`) — Rejected. Awkward to parse, unclear ordering, doesn't scale.

**Always use the appearance block** — Rejected. Kills readability for the 90% case where a node has one fill. `fill="#fff"` is far more readable than a three-line appearance block for a white background.

## Drawbacks

- Two ways to express fills (inline vs appearance block) — parsers must handle both
- Appearance block cannot be used alongside inline `fill` on the same node — one or the other

## Implementation Notes

When a node has a single solid color fill and no effects, the Figma plugin emits `fill="..."` inline. The appearance block is only emitted when there are multiple fills, image fills with complex settings, or multiple effects.
