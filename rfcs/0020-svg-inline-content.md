---
rfc: 0020
title: Inline SVG content on the <svg> tag
status: Implemented
introduced-in: 0.2
date: 2026-05-20
---

# Inline SVG Content on the `<svg>` Tag

## Context

The `<svg>` tag was originally asset-only — it required a `src` attribute pointing to a `<assets>` entry or external URL. Complex vector artwork from Figma always went through the asset pipeline: exported as a binary `.svg` file, registered in `<assets>`, referenced by `$id`.

This worked well for Figma-exported content but created unnecessary friction in two cases:

1. **AI generation** — When an AI agent generates `.gui` from scratch, it can produce SVG markup directly. Forcing it to also fabricate an asset pipeline (declare an `<assets>` entry, assign an id, write base64) adds token overhead and roundabout structure for content that exists only as markup in the model's output.

2. **Hand-authored `.gui`** — When writing `.gui` by hand — logos, decorative illustrations, simple icon compositions — needing to manage a separate asset file for a handful of SVG elements is unnecessary ceremony. The markup is self-contained; the asset file adds no value.

The pattern came up in a review of AI-generated `.gui` output: the model consistently produced valid SVG markup inline but then wrapped it in boilerplate asset declarations, inflating token usage and making the output harder to read.

## Decision

When `<svg>` has no `src` attribute, its XML children are treated as inline SVG content. The renderer wraps them in a real `<svg viewBox="0 0 w h">` element and sets them as its content directly — no asset lookup, no base64, no `<assets>` entry required.

```xml
<!-- Asset reference — existing behavior, unchanged -->
<svg src="$svg-logo" w="120" h="32" />

<!-- Inline content — new: no src, children are raw SVG -->
<svg w="48" h="48">
  <circle cx="24" cy="24" r="20" fill="#007AFF" />
  <path d="M12 24l8 8 16-16" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" />
</svg>
```

The distinction is `src` presence. If `src` is present, it resolves as before. If absent, children are rendered inline.

## Reasoning

### Fast image generation for AI

This was the primary motivation. An AI agent generating a UI screen can now produce complete, renderable SVG artwork — logos, avatars, illustrations, icon clusters — in a single block of markup with no side-channel asset declarations. The SVG content and its placement in the layout are co-located.

Before this change, generating a logo required:
```xml
<assets>
  <image id="svg-logo" format="svg" src="base64:PHN2ZyB4bWxucz0..." />
</assets>
...
<svg src="$svg-logo" w="120" h="32" />
```

After:
```xml
<svg w="120" h="32">
  <rect width="120" height="32" rx="6" fill="#1C1C1E" />
  <text x="12" y="22" font-family="Inter" font-size="14" font-weight="700" fill="white">acme</text>
</svg>
```

The model doesn't need to base64-encode anything. It doesn't need to manage ids. It writes what it knows — SVG — and the renderer handles it.

### Composability

Inline SVG also composes naturally with the rest of the `.gui` tree. An inline `<svg>` node participates in auto-layout the same way as any other node — it has `w`, `h`, and optional shared visual attrs. It doesn't break the layout model.

### No new syntax

The `src`-absent pattern is consistent with how other nodes in the format handle "no external reference." Adding a new attribute (e.g. `mode="inline"`) would have been more explicit but less ergonomic. The absence of `src` is the signal — clear enough, already consistent with how optional attrs work in the format.

## Alternatives Considered

**`content="..."` attribute with escaped SVG string** — Rejected. Escaping SVG markup inside an XML attribute is unreadable and error-prone. Defeats the purpose of making the format human- and AI-readable.

**`<svg-inline>` as a separate tag** — Rejected. Two tags for what is conceptually one thing. The distinction is already expressed by `src` presence; a separate tag name adds no information.

**Require all SVG to go through assets** — Rejected. This was the status quo. It creates unnecessary friction for AI generation and hand-authored files. The asset pipeline exists for binary files that need to travel with the package — not for markup that's already in the document.

**Auto-detect inline vs asset by inspecting children** — Same as the `src`-absent approach. The presence of children already implies inline content; the absence of `src` makes the intent explicit without inspecting the tree.

## Drawbacks

- Two modes on one tag (`src` vs inline) — parser must branch. The branch is simple (`src` presence check) but it is an extra code path.
- Inline SVG children are not validated by the `.gui` parser — they pass through to the renderer as-is. Invalid SVG in children will fail silently at render time, not at parse time.
- `<assets>` deduplication does not apply to inline content. The same SVG used in multiple places must be duplicated inline or refactored into a component.

## Implementation Notes

The renderer's `renderSvgAsset` function checks for `src` first. When absent, it creates an `<svg>` element in the SVG namespace, serializes all XML children via `XMLSerializer`, and sets the result as `innerHTML`, stripping empty `xmlns=""` attributes introduced by the serializer.

```ts
if (!src) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h)
  // ... position and class setup ...
  const serializer = new XMLSerializer()
  let innerSvg = ''
  for (const child of el.children) innerSvg += serializer.serializeToString(child)
  svg.innerHTML = innerSvg.replace(/\s+xmlns=""/g, '')
  return svg
}
```

The Figma plugin continues to emit `src`-referenced assets for all Figma-exported SVG. Inline content is a hand-authored and AI-generation pattern — the plugin has no path data to inline.

## Test Cases

```xml
<!-- Basic inline shape -->
<svg w="48" h="48">
  <circle cx="24" cy="24" r="20" fill="#007AFF" />
</svg>

<!-- Multi-element inline -->
<svg w="80" h="80">
  <rect width="80" height="80" rx="8" fill="#1C1C1E" />
  <circle cx="40" cy="35" r="14" fill="#fff" opacity="0.9" />
  <rect x="28" y="55" width="24" height="3" rx="1.5" fill="#fff" opacity="0.5" />
</svg>

<!-- Inline inside auto-layout -->
<row gap="12" align="middle-left" p="16">
  <svg w="24" h="24">
    <path d="M12 2L15 8l6 1-4.5 4 1 6L12 18l-5.5 3 1-6L3 9l6-1z" fill="#F59E0B" />
  </svg>
  <text value="4.9 rating" font-size="14" font-weight="500" color="#1C1C1E" />
</row>

<!-- Asset reference still works unchanged -->
<svg src="$svg-figma-export" w="200" h="120" />
```
