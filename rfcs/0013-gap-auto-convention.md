---
rfc: 0013
title: gap / gap="auto" replaces space-between
status: Draft
targets: 0.2
date: 2026-05-20
---

# gap / gap="auto" Replaces space-between

## Context

In 0.1, distributing items evenly in a container requires `justify="space-between"`. This is:
1. A separate attribute from `gap` even though both control spacing
2. CSS vocabulary that requires knowing the "primary axis" concept
3. Verbose for a very common pattern

## Decision

`gap="auto"` (or bare `gap`) replaces `justify="space-between"`. Gap owns all spacing concerns.

```xml
gap             →  space-between (bare presence = auto)
gap="auto"      →  same, explicit form
gap="16"        →  fixed 16px between items
gap="16 10"     →  16px between items, 10px between rows (wrap only)
gap="16 auto"   →  16px between items, rows distributed evenly
gap="auto 10"   →  items distributed, 10px between rows
gap="auto auto" →  both axes distributed
```

The two-value form `gap="main cross"` is only meaningful when `wrap` is present. The second value is ignored on non-wrapping stacks.

This also replaces `wrap-gap` and `wrap-align` entirely — they collapse into the second value of `gap`.

## Reasoning

`gap="auto"` reads naturally — the space between items is automatic, i.e. distributed. No axis terminology needed. The `auto` keyword is already familiar from CSS (`margin: auto`, `grid-template-columns: auto`).

Making `gap` own both fixed spacing and distribution unifies all inter-item spacing into one attribute. A reader never needs to check both `gap` and `justify` to understand spacing.

The bare `gap` convention (presence = auto) follows the global boolean presence convention established in RFC-0015. It is the shortest possible way to express "distribute items."

## Alternatives Considered

**Keep `justify="space-between"`** — Rejected. Two attributes for spacing is one too many.

**`distribute` boolean attribute** — Considered. `<row distribute>` is readable but adds yet another attribute name for what is fundamentally a spacing concept.

**`gap="auto 10"` is too implicit** — Fair concern. The first value being `auto` means distribution on the main axis, second value means fixed row gap. This requires knowing the order convention. Kept because consistency with the `padding` two-value convention outweighs the learning cost.

## Drawbacks

- `gap="auto"` conflates two different concepts: fixed spacing (number) and distribution (auto). A reader must know that `auto` means distribute, not "calculate automatically."
- Two-value form requires knowing which value is main-axis vs cross-axis — same convention as `padding` but still a convention to learn

## Unresolved Questions

- Should `gap` (bare, no value) be the preferred canonical form in spec examples, or should `gap="auto"` be preferred for clarity?
- Should `gap="auto auto"` simplify to just `gap`?
