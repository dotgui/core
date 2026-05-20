---
rfc: 0006
title: Layout sugar tags — row / col / grid
status: Implemented
introduced-in: 0.1
date: 2026-05-20
---

# Layout Sugar Tags — row / col / grid

## Context

The core layout container is `<stack direction="...">`. Every auto-layout frame needs a direction. Horizontal and vertical are by far the most common — writing `direction="horizontal"` on every row container is verbose and noisy.

## Decision

Three sugar tags alias the most common stack configurations:

| Tag | Equivalent |
|---|---|
| `<row>` | `<stack direction="horizontal">` |
| `<col>` | `<stack direction="vertical">` |
| `<grid>` | `<stack direction="grid">` with short attr names |

`<stack>` remains valid for all cases. Sugar tags simply remove the `direction` attribute for the common case.

## Reasoning

`<row>` and `<col>` are the vocabulary designers and developers already use when describing layout. "A row of cards" and "a column of items" are natural descriptions. The tag name communicates direction at a glance without reading any attributes.

For AI generation specifically, `<row>` is a significantly stronger signal than `<stack direction="horizontal">` — the direction is in the tag, not an attribute that could be forgotten or mistyped.

`<grid>` also gets shorter attribute names (`columns` instead of `grid-columns`, `col-gap` instead of `grid-col-gap`) since the `grid-` prefix is redundant on a `<grid>` tag.

## Alternatives Considered

**`<hstack>` / `<vstack>`** — SwiftUI naming. Familiar to iOS developers but unfamiliar to web developers and designers. `row`/`col` is more universal.

**`<flex-row>` / `<flex-col>`** — Too CSS-specific. dotgui is platform-agnostic.

**Direction attribute only, no sugar** — Rejected. Too verbose for the most common case. Every layout file would be cluttered with `direction="horizontal"`.

## Drawbacks

- Three ways to express the same thing (`<row>`, `<stack direction="horizontal">`, `<stack direction="h">`) — parsers must handle all forms
- `<grid>` has a different attribute surface than `<stack direction="grid">` (short names vs long names)

## Implementation Notes

The parser normalizes sugar tags to their `<stack>` equivalent internally. The renderer and optimizer work with normalized form. The Figma plugin emits sugar tags in output.
