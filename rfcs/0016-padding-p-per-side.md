---
rfc: 0016
title: p and per-side padding pt/pr/pb/pl
status: Draft
targets: 0.2
date: 2026-05-20
---

# p and Per-side Padding pt/pr/pb/pl

## Context

In 0.1, padding is set with `padding="..."` using a shorthand value syntax (1, 2, or 4 values). Setting a single side requires writing all four values — e.g. `padding="0 0 16 0"` to set only bottom padding.

## Decision

Two changes:

1. `p` replaces `padding` as the attribute name (same value syntax)
2. Per-side attributes `pt`, `pr`, `pb`, `pl` are added for single-side overrides

```xml
p="16"          →  16px all sides
p="16 24"       →  16px top/bottom, 24px left/right
p="24 16 12 8"  →  top right bottom left

pt="24"         →  top only
pb="16"         →  bottom only
pt="24" pb="16" →  top and bottom, no left/right padding
```

Specificity rule: per-side attributes override the shorthand for that side.

```xml
<col p="16" pb="24">
<!-- = pt:16, pr:16, pb:24, pl:16 -->
```

## Reasoning

`p` follows the same rationale as `w`/`h` — it's the shortest meaningful name for a concept that appears on nearly every container. Figma's inspector shows padding per-side. Tailwind uses `p`, `pt`, `pr`, `pb`, `pl`. Both designers and developers know this vocabulary.

Per-side attributes solve a real problem: `padding="0 0 16 0"` is hard to read and easy to get wrong. `pb="16"` is unambiguous and half the chars.

## Alternatives Considered

**Keep `padding` as the name** — Considered. More explicit. Rejected because `p` is already universally understood and the savings on a high-frequency attribute are meaningful.

**`padding-top` / `padding-right` etc.** — More verbose but unambiguous. Rejected in favor of the shorter `pt`/`pr`/`pb`/`pl` which are equally unambiguous to anyone who has used CSS or Tailwind.

**`px` / `py` axis shorthands** — Considered (horizontal/vertical axis shorthands like Tailwind's `px-4` / `py-4`). Deferred — adds two more attribute names for moderate benefit. Can be added in a future RFC.

## Drawbacks

- `p` could theoretically conflict with future attribute names starting with `p` — unlikely given dotgui's attribute surface
- Four new attribute names to learn (`pt`, `pr`, `pb`, `pl`) alongside `p`

## Unresolved Questions

- Should `px` (left+right) and `py` (top+bottom) axis shorthands be added now or deferred?
