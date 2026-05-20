---
rfc: 0019
title: "REJECTED: strokes-in-layout"
status: Rejected
considered-for: 0.2
date: 2026-05-20
---

# REJECTED: strokes-in-layout

## Context

Figma has a property `strokesIncludedInLayout` that controls whether a node's stroke thickness counts toward its layout dimensions. It is the equivalent of CSS `box-sizing: border-box` but specifically for strokes.

- `false` (default): stroke renders outside the node's bounds, does not affect layout
- `true`: stroke is included in the node's dimensions — a 1px stroke on a 100px wide node means 98px of usable content area

## Proposal

Add `strokes-in-layout` as a boolean attribute:

```xml
<col stroke="$border" stroke-width="1" strokes-in-layout>
```

## Reasoning for Rejection

Used in under 1% of real Figma designs. It lives in Figma's advanced layout panel and most designers never touch it.

More importantly, it is **Figma internal plumbing** — a detail of how Figma's rendering engine calculates bounds. It is not meaningful layout intent. A code generator targeting CSS, SwiftUI, or Compose would need to translate this into `box-sizing: border-box` or equivalent, which it can derive from context.

Including it in dotgui would add complexity to the format for a property that has no practical effect in the vast majority of files and that renderers can handle with sensible defaults.

## What to Do Instead

Renderers should apply a consistent default (strokes outside layout bounds) and handle the edge case internally. If pixel-perfect stroke-box behavior is needed, it should be handled at the renderer level, not encoded in the format.
