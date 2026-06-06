---
rfc: 0039
title: "REJECTED: <render> wrapper tag"
status: Rejected
considered-for: 1.0
date: 2026-06-06
---

# REJECTED: `<render>` Wrapper Tag

## Context

RFC-0037 (token modes) applies a mode with `mode-{axis}` on "the root render tag
or any layout node." The root layout node can be any container — `<frame>`,
`<col>`, `<row>`, or `<grid>`. This raised the idea of a dedicated wrapper that
sits above the layout root and marks "everything inside this is the rendered
design," giving modes (and any future render-level concern) one predictable,
non-layout host instead of riding on whichever container happens to be the root.

## Proposal

A `<render>` tag wrapping the design subtree, analogous to an HTML container. It
carries no size of its own; everything nested under it is what gets rendered, and
document-level concerns like the active mode attach to it:

```xml
<gui version="1.0" name="Profile">
  <tokens />
  <render mode-theme="dark">
    <col w="390"> … </col>
  </render>
</gui>
```

Open question raised with the proposal: should `<render>` affect the layout of
the UI nested under it?

## Reasoning for Rejection

**The render root already exists and is already singular (P8, P7).** RFC-0021
established that `<gui>` is a pure metadata envelope and the *first layout child*
is where the design starts. That child is a single, predictable location a
renderer reads regardless of its tag type. `<render>` is a second way to mark a
boundary that position already marks — concept tax for no new expressiveness.

**The root tag's variance is not a real problem.** `mode-theme="dark"` is the
same attribute whether it sits on a `<col>` or a `<frame>`; the host's tag type
never changes how a mode is written or read. There is no inconsistency for a
wrapper to fix.

**A fixed host fights RFC-0037's design (P3).** Mode application is deliberately a
*per-subtree, overridable cascade* — a light card inside a dark column is a
supported case. Modes therefore must work on any node. A `<render>` host does not
replace that; it only adds a redundant layer above it.

**The open question is fatal either way (P8, P9).** If `<render>` affects child
layout, it *is* a `<col>`/`<frame>` and duplicates an existing primitive. If it
does not, it is a semantically empty wrapper that adds nesting and meaning a
consumer cannot act on. Neither outcome survives.

**It imports a foreign mental model (P5, P4).** A `<render>`/`<body>`-style
container is HTML vocabulary. The dotgui render root is `<col>`/`<frame>`, not a
document body.

## What to Do Instead

The two distinct concerns the proposal bundled are each already covered without a
new tag:

- **The render root / "what gets rendered"** → the first layout child of `<gui>`,
  per RFC-0021. Metadata blocks sit above it; the layout tree below it is the
  render. No wrapper needed.
- **The document-wide default mode** → `default="dark"` on the `<mode>`
  declaration (RFC-0037). That is the file-wide render default.
- **Applying or overriding a mode anywhere** → `mode-{axis}` on the root layout
  node or any descendant (RFC-0037), which preserves the per-subtree cascade.

Between `default=` and `mode-{axis}`, the space a `<render>` host would occupy is
already filled.

## Alternatives Considered

**`<render>` as a no-op transparent wrapper (no layout effect)** — Rejected. Adds
nesting with no meaning a consumer can act on (P3) and a second way to demarcate
the render root (P8).

**`<render>` as a layout container** — Rejected. That is exactly `<col>` /
`<frame>` / `<row>` / `<grid>` already (P9).

**Document-level mode host on `<gui>` instead of a new tag** — If a non-layout
home for the *default* mode is ever wanted, it belongs as `default=` on the
`<mode>` declaration (already specified) or, at most, an attribute on the existing
`<gui>` envelope — not a new wrapper element. Tracked as RFC-0037 Unresolved
Question 3 (reconciliation with `<gui>` root attrs), not here.
