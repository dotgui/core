---
rfc: 0017
title: Two-value gap for wrap rows
status: Draft
targets: 0.2
date: 2026-05-20
---

# Two-value gap for Wrap Rows

## Context

In 0.1, wrapping stacks need two separate attributes for spacing:

- `gap="16"` — space between items on the main axis
- `wrap-gap="12"` — space between wrapped rows on the cross axis

Additionally, `wrap-align="space-between"` distributes rows evenly but is a separate attribute with limited values (only `space-between` supported).

This is three attributes to fully describe spacing in a wrapped layout.

## Decision

`gap` accepts two values when `wrap` is present:

```xml
gap="16 10"     →  16px between items, 10px between rows
gap="16 auto"   →  16px between items, rows distributed evenly
gap="auto 10"   →  items distributed, 10px between rows
gap="auto auto" →  both axes distributed
```

The first value is the main-axis gap (between items). The second is the cross-axis gap (between rows). Follows the same two-value convention as `p` — first value is primary, second is secondary.

The second value is only meaningful when `wrap` is present. It is ignored on non-wrapping stacks.

`wrap-gap` and `wrap-align` are removed entirely.

## Reasoning

All spacing — item gap, row gap, distribution — lives in `gap`. A reader only needs to check `gap` to understand all spacing in a layout. No separate attributes to discover.

The two-value convention is consistent with `p="v h"` — both use the pattern "first value primary axis, second value secondary axis." Once you know one, you know both.

`auto` as the row-gap value naturally handles the `wrap-align="space-between"` case. See RFC-0013 for the `auto` convention.

## Alternatives Considered

**Keep `wrap-gap` as a separate attribute** — Rejected. Single-attribute ownership of spacing is cleaner. `gap` should own everything spacing-related.

**`row-gap` as the name for cross-axis gap** — Considered (`<row wrap row-gap="10">`). More explicit but adds yet another attribute name. The two-value form is consistent with existing conventions.

**`gap="16 / 10"` slash-separated** — Rejected. Unusual syntax with no precedent in the format.

## Drawbacks

- Two-value gap requires knowing which value is main-axis vs cross-axis — a convention to learn
- `gap="auto auto"` is slightly redundant — could just be `gap` but the explicit form may be clearer in some contexts

## Unresolved Questions

- Is `gap="auto 10"` (distribute items, fixed row gap) a real use case worth supporting, or edge-case noise?
