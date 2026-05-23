---
rfc: 0028
title: Clipping and masks for visual export
status: Draft
introduced-in: 0.3
date: 2026-05-22
---

# Clipping and masks for visual export

## Context

Clipping and masks are required for common UI: rounded image cards, avatars, cropped hero media, device frames, shaped thumbnails, and layered visual compositions.

dotgui currently supports `clip`, `mask`, and group-level `mask-src` metadata. That is enough for some cases, but it does not fully describe mask scope or distinguish simple clipping from alpha/luminance masking.

The goal is visual export fidelity, not preserving every mask authoring workflow.

## Decision

Keep `clip` for simple clipping to a node's own bounds and radius.

```xml
<frame w="320" h="180" radius="12" clip>
  <img src="$hero" w="320" h="180" fit="cover" />
</frame>
```

Introduce explicit mask metadata for non-rectangular or alpha-based masks:

```xml
<group w="320" h="180">
  <mask src="$mask-1" mode="alpha" x="0" y="0" w="320" h="180" />
  <img src="$hero" w="320" h="180" fit="cover" />
</group>
```

### Mask attributes

| Attr | Description |
|---|---|
| `src` | Asset ref for mask shape/image |
| `mode` | `alpha`, `luminance`, `clip-path` |
| `x` / `y` | Mask position relative to parent |
| `w` / `h` | Mask bounds |
| `invert` | Optional inverted mask behavior |

The `<mask>` tag is non-rendering metadata that applies to the group's children according to the group's mask scope.

## Reasoning

`clip` should remain extremely simple. Most UI clipping is just "clip this image to this rounded container." That case deserves a one-word attribute.

Masks are different: they describe an extra visual operation and need explicit scope. A mask tag is clearer than overloading `mask` as a boolean on ordinary nodes.

## Alternatives Considered

**Only use `clip`** — Rejected. It cannot represent non-rectangular or alpha masks.

**Keep Figma's mask-child ordering semantics exactly** — Rejected. dotgui should describe the visual result in a cleaner way.

**Always rasterize masked groups** — Rejected as the default. It loses structure and hurts code/AI consumers.

## Drawbacks

- Mask rendering differs between DOM, SVG, and canvas implementations.
- Nested masks require careful scope rules.
- Asset-based masks require reliable packaging and coordinate normalization.

## Implementation Notes

1. Keep `clip` as bounds/radius clipping.
2. Add `<mask>` as a non-layout child, likely inside `<group>` or `<frame>`.
3. Define mask scope as applying to following visual children in the same parent, unless the parent has an explicit mask group.
4. Renderer should support alpha masks first.
5. Exporter should convert complex source masks to SVG or raster mask assets.

## Test Cases

```xml
<frame w="96" h="96" radius="48" clip>
  <img src="$avatar" w="96" h="96" fit="cover" />
</frame>

<group w="320" h="180">
  <mask src="$blob-mask" mode="alpha" x="0" y="0" w="320" h="180" />
  <img src="$photo" w="320" h="180" fit="cover" />
</group>
```

## Unresolved Questions

- Should `<mask>` apply to all siblings or only following siblings?
- Should mask tags live in `<appearance>` instead?
- Should clipping to vector paths use `mode="clip-path"` or a separate `<clip>` tag?
