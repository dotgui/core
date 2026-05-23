---
rfc: 0026
title: Text rendering fidelity
status: Draft
introduced-in: 0.3
date: 2026-05-22
---

# Text rendering fidelity

## Context

Text is the most important content in most UI exports. A design can survive minor geometry differences, but poor text export immediately makes the artifact feel wrong.

dotgui already supports basic text attributes, named text styles, mixed-style segments, alignment, line height, letter spacing, paragraph spacing, paragraph indent, text case, decoration, truncation, max lines, and hyperlinks.

The missing pieces are not full document-editor semantics. The goal is visual fidelity for UI text: what appears on screen should survive export.

## Decision

Expand text to preserve visual rendering metadata needed by UI design tools while keeping the current compact single-style and segmented model.

Single-style text remains attribute-based:

```xml
<text value="Checkout" fill="$ink" font-family="Inter" font-size="28" font-weight="700" line-height="34" />
```

Mixed text remains segment-based:

```xml
<text w="280">
  <segment value="Pay " fill="$muted" font-size="16" />
  <segment value="$42.00" fill="$ink" font-size="16" font-weight="700" />
</text>
```

Add support for:

| Feature | Proposed attrs |
|---|---|
| Font identity | `font-family`, `font-postscript`, `font-style-name` |
| Variable fonts | `font-variation` |
| OpenType features | `font-feature` |
| Baseline shift | `baseline-shift` |
| Decoration details | `decoration-color`, `decoration-style`, `decoration-thickness` |
| Text overflow | `truncate`, `max-lines`, `overflow` |
| Text sizing mode | `text-resize` |
| List markers | `list`, `list-level`, `list-marker` |
| Paragraph rhythm | `paragraph-spacing`, `paragraph-indent` |

All segment-level attrs override text-level attrs for that segment.

## Reasoning

This RFC keeps dotgui centered on rendered UI, not rich-text document authoring. It does not need comments, tracked changes, full paragraph styles, or every editing feature. It needs the visual facts that affect glyph placement and appearance.

The existing `<segment>` model is a good foundation. It should be extended rather than replaced.

## Alternatives Considered

**Represent text as SVG paths for perfect visual fidelity** — Rejected. It preserves pixels but destroys text semantics and makes AI/code generation worse.

**Use HTML rich text inside `<text>`** — Rejected. It imports a second markup vocabulary and weakens the dotgui model.

**Only support single-style text** — Rejected. Mixed emphasis, links, and price/value styling are common in UI.

## Drawbacks

- Exact font availability remains environment-dependent.
- Variable fonts and OpenType features may be unevenly supported by renderers.
- List rendering can become complicated if scoped too broadly.

## Implementation Notes

1. Keep current text attrs stable.
2. Add optional attrs only when they affect rendering.
3. Collect font metadata during export, including postscript/style names when available.
4. Renderer should use CSS font-feature-settings and font-variation-settings when present.
5. Optimizer must never merge adjacent segments if doing so changes text rendering.

## Test Cases

```xml
<text value="Dashboard" font-family="Inter" font-postscript="Inter-Bold" font-size="28" font-weight="700" fill="$ink" />

<text w="320" line-height="24" paragraph-spacing="8">
  <segment value="Save " fill="$ink" />
  <segment value="20%" fill="$green" font-weight="700" />
  <segment value=" today" fill="$ink" />
</text>
```

## Unresolved Questions

- Should `font-variation` use CSS syntax or a space-separated dotgui syntax?
- Should list support be included in 0.3 or deferred?
- Should text layout expose exact measured glyph bounds from the source tool?
