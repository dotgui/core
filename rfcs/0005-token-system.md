---
rfc: 0005
title: Token system — flat $name references
status: Implemented
introduced-in: 0.1
date: 2026-05-20
---

# Token System — Flat $name References

## Context

Design systems use tokens — named primitives for colors, spacing, radius, typography. The format needed a way to carry these so that downstream tools (code generators, AI agents) understand that `#007AFF` is `$primary`, not just a hex value.

## Decision

Tokens are declared in a flat `<tokens>` block at the top of the document. Three types: `color`, `number`, `string`. Referenced anywhere in the tree with `$name`.

```xml
<tokens>
  <color name="primary" value="#007AFF" />
  <number name="radius-card" value="12" />
  <string name="font-base" value="Inter" />
</tokens>

<shape type="rect" fill="$primary" radius="$radius-card" />
```

## Reasoning

A flat token list with `$name` references is the simplest possible token system that preserves design intent. Any attribute that accepts a token reference will see `$primary` and know this is a semantic value, not a raw color.

The `$` prefix makes token references visually distinct from raw values at a glance — both for humans reading the file and for parsers looking for references.

Flat structure (not nested groups) keeps lookup simple: split on `$`, look up the name, done. No path resolution, no namespace collision.

## Alternatives Considered

**W3C Design Token format** — Considered. More expressive (composite tokens, references to references, groups). Deferred to a future version — the overhead of the full W3C format is not justified for dotgui's use case at this stage.

**Inline only (no token block)** — Rejected. Loses the semantic layer entirely. `#007AFF` everywhere tells a code generator nothing about intent.

**CSS custom properties (`--primary`)** — Rejected. CSS variable syntax is platform-specific and implies a CSS runtime. dotgui is platform-agnostic.

## Drawbacks

- Flat structure means no grouping (e.g. `$color/primary` is not supported, must be `$color-primary`)
- No token aliases or token-to-token references in 0.1
- Only three token types — composite tokens (shadow, typography, border) deferred

## Implementation Notes

Only tokens actually referenced in the exported tree are emitted. Unused tokens from the design system are not included.

## Test Cases

- `$name` in any attribute value resolves to the token's value
- Unknown `$name` reference is treated as a literal string (no error)
- Token names are case-sensitive, kebab-case recommended
