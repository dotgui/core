---
rfc: 0028
title: Clipping and masks for visual export
status: Implemented
targets: 0.3.11
date: 2026-05-22
updated: 2026-10-29
implemented: 2026-10-29
---

# Clipping and Masks for Visual Export

## Context

Clipping and masks are everywhere in UI: rounded image cards, avatars, cropped hero media, device frames, shaped thumbnails, layered compositions. The goal is visual export fidelity, not every mask authoring workflow.

The first draft proposed a `<mask>` child tag. By the time of its hearing the format already had a working set of attributes, written by exporters and drawn by both renderers:

| Form | Uses in 442 files | Written by | Drawn by |
|---|---|---|---|
| `clip` on a container | ~370 | everyone | kit and native |
| `clip-path` — `inset()`, `circle()`, `polygon()` | 24 | hand-written files, HTML capture | kit and native (native also `path()`) |
| `mask-src` with `mask-x`, `mask-y`, `mask-width`, `mask-height`, `mask-mode` on a container | in Figma exports | the Figma exporter, which turns a mask layer into an asset | kit and native |
| `mask-composite` — `add` / `subtract` / `intersect` / `exclude` | 0 | nobody | kit and native |
| `mask` flag on a child, masking the siblings after it | 12 | Figma's layer-order model | kit and native |

None of it was specified. The last row is Figma's own model — a mask is a layer, and it masks the layers above it — which this RFC's first draft already rejected. And `mask-composite` has four values where one mask only ever needs two: with a single mask, `add` and `intersect` both keep the inside, `subtract` and `exclude` both cut it out.

## Decision

**Three properties on containers, and no new tag.**

### 1. `clip` — to the box

```xml
<frame w="96" h="96" radius="48" clip>
  <img src="assets/avatar.webp" w="96" h="96" fit="cover" />
</frame>
```

A presence flag. Children are clipped to the container's box and its corner radius. Unchanged.

### 2. `clip-path` — to a geometric shape

```xml
<col w="320" h="200" clip-path="polygon(0% 0%, 100% 0%, 100% 80%, 0% 100%)" />
<col w="96" h="96" clip-path="circle(50% at 50% 50%)" />
```

One of four shapes: `inset()`, `circle()`, `ellipse()`, `polygon()`, with the arguments every UI toolkit and CSS share. Percentages resolve against the node's own box. `path()` and `url()` are not accepted: a free-form path is a vector asset ([RFC-0023](0023-remove-shape.md)), so it is a mask.

### 3. `mask-src` — through an asset

```xml
<group w="320" h="180" mask-src="assets/blob.svg" mask-mode="alpha">
  <img src="assets/photo.webp" w="320" h="180" fit="cover" />
</group>
```

| Attribute | Meaning | Default |
|---|---|---|
| `mask-src` | The mask: an SVG or raster asset | — |
| `mask-x`, `mask-y` | Where the mask sits, relative to the container | `0` |
| `mask-width`, `mask-height` | The mask's size | the container's size |
| `mask-mode` | `alpha` (the asset's opacity) or `luminance` (its brightness) | `alpha` |
| `mask-invert` | Presence flag: cut the mask's shape out instead of keeping it | absent |

- **Where:** on a layout container — `frame`, `stack`, `row`, `col`, `grid`, `group`.
- **Scope:** everything the container draws. There is no sibling ordering to get wrong.
- **The family:** `mask-x`, `mask-y`, `mask-width`, `mask-height`, `mask-mode` and `mask-invert` mean nothing without `mask-src`, and are an error alone — the same family pattern as `border` and `slot` ([RFC-0044](0044-slots.md)).

### What is retired

- **`mask` as a flag on a child.** Write `mask-src` on the parent. An exporter turns the mask layer into an asset, as the Figma exporter already does.
- **`mask-composite`.** Write `mask-invert` for a cut-out; otherwise nothing.
- **`clip-path="path(…)"` and `url(…)`.** Use `mask-src` with an SVG.

These are 0.3.11 rules: errors in a document declaring 0.3.11 or higher, warnings in one written before, which renders as it did.

## Reasoning

**A property, not a tag ([P11](../PRINCIPLES.md)).** A mask is one asset and a few numbers about a container. The attributes say that at the lowest rung; a `<mask>` child would be a second, heavier way to say the same thing ([P12](../PRINCIPLES.md)), next to attributes exporters already write.

**The container owns the mask, not a sibling ([P5](../PRINCIPLES.md)).** "This layer masks the layers after it" is how Figma stores a mask, not what a viewer sees. Putting the mask on the container states the visual result directly and leaves no ordering question — the draft's first open question disappears.

**Shapes, not path data.** `inset`, `circle`, `ellipse` and `polygon` are plain geometry that SwiftUI, Compose and CSS all draw ([P2](../PRINCIPLES.md)). Inline path data was moved to assets by [RFC-0023](0023-remove-shape.md); `path()` in `clip-path` was a way back in.

**One meaningful choice, one name.** A single mask is either kept or cut out. `mask-invert` says that in a word ([P7](../PRINCIPLES.md)); `mask-composite`'s four values described two outcomes and borrowed CSS's multi-mask vocabulary for a case that has one mask ([P8](../PRINCIPLES.md)).

**Every renderer, the same result ([P15](../PRINCIPLES.md)).** Both renderers already draw these forms; specifying them, and refusing what is retired, keeps them in step.

### Principle pass

| Principle | Result | Note |
|---|---|---|
| P1 — neutral | pass | Every tool can export a mask as an asset; Figma's exporter already does. |
| P2 — platform-agnostic | pass | Box clipping, basic shapes and alpha/luminance masks exist everywhere. |
| P3 — faithful, not a save file | pass | Describes the visible result, not the mask layer's place in a stack. |
| P5 — not Figma | pass | The sibling-mask model is retired. |
| P7 — readable | pass | `clip`, `clip-path="circle(…)"`, `mask-invert` read as what they do. |
| P8 — one vocabulary | pass | Shape names the world shares; no `url()`, `path()` or CSS composite operators. |
| P11 — grammar | pass | Properties on existing tags; one function value form for shapes. |
| P12 — one way | pass | One way each to clip to the box, to a shape, and through an asset. |
| P15 — honest | pass | Retired forms fail loudly from 0.3.11; mask attributes without `mask-src` are errors. |

## Alternatives Considered

**A `<mask>` child tag (the first draft)** — Rejected. A tag where properties already work, and a second way next to what exporters write.

**`<mask>` inside `<appearance>`** — Rejected for the same reason; `<appearance>` holds ordered paint stacks, and a container has one mask.

**Keep the `mask` flag on a child** — Rejected. It is Figma's storage model, and its scope (which siblings?) has to be learned.

**Keep `mask-composite`** — Rejected. Four values for two outcomes, in CSS's multi-mask vocabulary.

**A separate `<clip>` tag for vector clipping** — Rejected. A vector clip is an alpha mask through an SVG asset.

**Always rasterise masked groups** — Rejected as a default, as in the first draft. It loses structure that code and AI consumers use.

## Drawbacks

- An exporter needs an asset for any mask that is not a box or a basic shape. Packaging handles it; a standalone document references it by URL ([RFC-0043](0043-standalone-guix.md)).
- Files with the `mask` flag (12 found) or `path()` must be re-exported, or rewritten with `mask-src`, before they declare 0.3.11.
- Mask rendering still differs subtly between DOM, SVG and raster backends — anti-aliasing at the edge, luminance weights. That is renderer precision, not format meaning.

## Implementation Notes

- **Schema:** `mask-src`, `mask-x`, `mask-y`, `mask-width`, `mask-height`, `mask-mode` and `mask-invert` on layout containers; `clip-path` documented as the four shapes; `mask` and `mask-composite` removed.
- **Kit validator:** `INVALID_CLIP_PATH` for anything but the four shapes; `MASK_WITHOUT_SRC` for a mask attribute without `mask-src`; `MASK_MISPLACED` for `mask-src` off a layout container; `INVALID_MASK_MODE`; `OBSOLETE_MASK` for the `mask` flag and for `mask-composite`. Errors from 0.3.11, warnings before.
- **Kit HTML renderer and native renderer:** draw `mask-invert` as a cut-out. `mask-composite` keeps drawing in older documents.
- **Native renderer:** the same rules; `path()` keeps drawing before 0.3.11.
- **Figma exporter:** already writes `mask-src`. It should stop writing the `mask` flag. Deferred with the rest of the Figma plugin work.

Shipped in 0.3.11: the schema and reference, kit's validator and HTML renderer, and the native renderer. Two kit fixes came with it: the validator's parser kept bare presence attributes (it dropped them), and an absolute-URL `mask-src` now applies in a standalone document. Both tools read documents up to 0.3.11.

## Test Cases

Tested in kit and the native renderer:


- `<frame clip radius="48">` clips its children to the rounded box.
- `clip-path` with `inset(10%)`, `circle(50% at 50% 50%)`, `ellipse(40% 30% at 50% 50%)` and `polygon(0% 0%, 100% 0%, 50% 100%)` validates and draws; `path('M0 0 L10 10')` and `url(#m)` are errors in 0.3.11.
- `<group mask-src="assets/blob.svg">` masks all its children; `mask-invert` cuts the shape out instead.
- `mask-mode="luminance"` validates; `mask-mode="screen"` is an error.
- `mask-x` without `mask-src` is an error in 0.3.11.
- A child with `mask`, and `mask-composite` on a container, are errors in 0.3.11 and warnings in 0.3.10, where they still draw.
