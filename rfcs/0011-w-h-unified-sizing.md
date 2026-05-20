---
rfc: 0011
title: w / h unified sizing
status: Draft
targets: 0.2
date: 2026-05-20
---

# w / h Unified Sizing

## Context

In 0.1, sizing a node requires up to two attributes depending on what you want:

- Fixed size → `width="320"` / `height="80"`
- Fill parent → `sizing-h="fill"` / `sizing-v="fill"` (or `width="fill"`)
- Hug content → `sizing-h="hug"` / `sizing-v="hug"` (or `width="hug"`)

This is three different naming conventions for the same concept. Figma shows a single `W` / `H` field per node with a fill/hug/fixed toggle. The split between `width` and `sizing-h` is a historical artifact, not a meaningful distinction.

## Decision

`w` and `h` replace `width`, `height`, `sizing-h`, and `sizing-v`. One attribute per axis, three modes:

| Value | Meaning |
|---|---|
| `w="320"` | fixed 320px |
| `w="fill"` | grow to fill parent |
| *(absent)* | hug — fit content |

**Hug is the default. Absent `w`/`h` = hug.** You only write `w` when you need fill or a fixed value.

### Where absent = hug applies

Only on nodes that can derive size from content or children:

| Node | May omit `w`/`h` |
|---|---|
| `row` / `col` / `stack` | ✅ — hugs children |
| `text` | ✅ — hugs text content |
| `instance` | ✅ — inherits from component |
| `frame` / `shape` / `img` / `svg` | ❌ — must specify |

## Reasoning

`w` and `h` are the shortest possible names for width and height. Every UI tool on the planet uses W and H. Figma's inspector shows W and H. There is no ambiguity.

Collapsing four attributes into two removes a conceptual split that confused the CSS-based mental model (`sizing-h` as a separate concept from `width`). In dotgui, size and sizing mode are the same thing.

The "absent = hug" default is correct for layout containers — their natural state is to wrap their content. You explicitly opt into fill or fixed.

## Alternatives Considered

**`width` / `height` as the short form** — Rejected in favor of `w`/`h`. `width` is 5 chars, `w` is 1. At the frequency these appear (every node), the difference is significant.

**`sz="fill hug"` combined shorthand** — Considered and rejected. `w="fill" h="hug"` is already two short attributes. A combined `sz` adds a concept to learn for negligible savings. See RFC-0018.

**Keep `sizing-h` / `sizing-v` as aliases** — Not applicable pre-1.0. No stability guarantees until 1.0. Old attributes are replaced outright.

## Drawbacks

- Breaking change from 0.1 — all existing `width`, `height`, `sizing-h`, `sizing-v` attributes must be updated
- `w` and `h` are very short — could feel too terse in long attribute lists (mitigated by being universal vocabulary)

## Unresolved Questions

- Should `w` and `h` be the canonical form in all spec examples, or should longer forms be shown for clarity in documentation?
