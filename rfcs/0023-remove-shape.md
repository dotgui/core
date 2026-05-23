---
rfc: 0023
title: Remove <shape> — rect, ellipse, line as helper tags; paths as assets
status: Implemented
introduced-in: 0.3
date: 2026-05-21
updated: 2026-05-23
supersedes: 0020
related: 0031
---

# Remove `<shape>` — rect, ellipse, line as helper tags; paths as assets

## Context

dotgui has a `<shape>` tag with four variants:

```xml
<shape type="rect" />      <!-- rectangle -->
<shape type="ellipse" />   <!-- circle / ellipse -->
<shape type="line" />      <!-- horizontal or vertical line -->
<shape type="path" />      <!-- vector path, boolean op, star, polygon -->
```

This tag was inherited from Figma's node taxonomy — Rectangle, Ellipse, Line, and Vector nodes map directly onto these types. RFC 0003 explicitly states that dotgui is not Figma's data model. `<shape type="...">` is the clearest violation of that principle in the format: the type discriminator is Figma's internal node classification, not a meaningful authoring concept.

Beyond provenance, the tag conflates two fundamentally different things:

1. **UI geometry primitives** — decorative boxes, circles, and lines that participate in layout
2. **Vector paths** — SVG drawings, icons, boolean operations that are graphical content

These have different rendering models, different authoring needs, and different correct representations. A single tag with a `type=` attribute is the wrong abstraction for both.

Additionally, this RFC supersedes RFC 0020 (Inline SVG content on the `<svg>` tag). RFC 0020 introduced inline SVG as an authoring convenience, but it imports SVG vocabulary (`stroke`, `stroke-width`, `stroke-linecap`, `viewBox`, `cx`, `cy`) directly into `.gui` files — exactly the convention contamination RFC 0002 (Not SVG) was designed to prevent. Once an author is inside an `<svg>` block, they are writing SVG, not dotgui. The format loses its single-convention guarantee.

## Decision

**`<shape>` is removed.**

**`<rect>`, `<ellipse>`, and `<line>` are introduced as first-class helper tags** — sugar over `<frame>`, following the same pattern as `<row>`, `<col>`, and `<grid>` over `<stack>`. They carry designer-readable intent, render identically to their frame equivalents, and require no new rendering logic.

**`<shape type="path">` becomes `<img src="assets/...">`** — vector paths are SVG assets, referenced inline the same way as any other image.

**`<svg>` is removed.** It collapses into `<img>`. SVG is an image format. Whether an asset is raster or vector is a renderer implementation detail, not an authoring concern. `<img>` handles both.

**Inline SVG (RFC 0020) is superseded.** All SVG content is stored in `assets/` and referenced via `<img src="assets/...">`.

---

### `<rect>` — rectangular box

Sugar for `<frame>` with no layout children. Signals decorative intent.

```xml
<rect fill="$primary" w="340" h="52" />
<rect fill="$surface" w="340" h="52" radius="12" />
<rect fill="$surface" w="340" h="52" border="$line" />
```

Supports all `<frame>` visual attributes: `fill`, `border`, `radius`, `shadow`, `opacity`, `appearance`. Does not support layout attributes (`direction`, `gap`, `p`, `align`) — it has no children. `w` and `h` are required.

### `<ellipse>` — oval or circle

Sugar for `<frame radius="9999">`. The full-radius is implicit and fixed — it is not exposed as an attribute. If a custom corner radius is needed, use `<rect radius="...">`.

```xml
<ellipse fill="$red" w="8" h="8" />       <!-- circle — equal dimensions -->
<ellipse fill="$blue" w="80" h="40" />    <!-- oval -->
<ellipse fill="$gold" w="48" h="48" border="2 $ink" />
```

Arc and donut variants (`arc-start`, `arc-end`, `arc-inner`) are removed. These are complex SVG primitives — they belong as SVG assets referenced via `<img>`.

### `<line>` — horizontal or vertical line

Sugar for a thin frame used as a visual separator. Short, familiar to designers, does not carry the content-semantic weight of HTML's `<hr>`.

```xml
<line fill="$border" />                        <!-- horizontal, 1px, fill-width -->
<line fill="$border" direction="vertical" />   <!-- vertical, 1px, fill-height -->
<line fill="$gold" thickness="2" />            <!-- custom thickness -->
```

Default: horizontal, `thickness="1"`, `w="fill"`. For vertical: `h="fill"`.

`<line>` maps to: `<frame w="fill" h="{thickness}" fill="...">` horizontally, or `<frame w="{thickness}" h="fill" fill="...">` vertically.

### `<img>` handles raster and vector

`<img>` now accepts any asset reference regardless of format. No separate declaration — source is inline, always.

```xml
<img src="assets/hero.webp" w="800" h="400" />     <!-- raster -->
<img src="assets/logo.svg" w="120" h="32" />       <!-- vector — was <svg src="..."> -->
<img src="assets/icon-rocket.svg" w="21" h="21" /> <!-- icon — was <shape type="path"> -->
```

The renderer detects asset format from the file extension at render time. The author does not declare format — only `src`, `w`, and `h`.

---

## Reasoning

### Sugar tags, not new concepts

`<row>`, `<col>`, and `<grid>` already prove this pattern works. They are aliases of `<stack>` with preset attributes. They add no rendering complexity — the renderer maps the tag to its base form. But they make the format significantly more readable and reduce the learning curve for designers coming from Figma.

`<rect>`, `<ellipse>`, and `<line>` follow the same logic. A designer thinks in these terms. An AI generating `.gui` produces cleaner output when tags carry geometric intent. The format gains readability without gaining complexity.

The difference from the old `<shape type="...">` is significant: the type becomes the tag name. There is no discriminator attribute to remember, no valid-type enumeration to look up. You write what you mean.

### `<rect>` vs `<frame>` — semantic signal matters

Both render as a `<div>`. But:

- `<frame>` signals: "this is a layout container, it may have children"
- `<rect>` signals: "this is a decorative box, it has no structural role"

This matters to AI agents reasoning about a `.gui` file and to human authors scanning a layout tree. A `<rect>` in a list of children is clearly decorative background. A childless `<frame>` is ambiguous — is it intentionally empty, or were children omitted?

### `<ellipse>` — fixed contract

`<ellipse>` means ellipse. The full-radius rendering is the contract the tag makes. Exposing `radius=` on an ellipse would mean "an ellipse with... a corner radius?" — undefined and confusing. If the desired shape has a non-circular corner treatment, it is a `<rect radius="...">`, not an ellipse.

### `<line>` — designer vocabulary

`<line>` is what a Figma user, a designer, and an AI would reach for when drawing a separator. It is short, unambiguous, and directly maps to the Figma concept. The semantic weight of HTML's `<hr>` ("this separates thematic content") is not relevant in a UI layout format where the designer is choosing visual structure, not document semantics.

### `<shape type="path">` belongs in assets

A vector path, boolean operation, star, or polygon is SVG content — path data, drawing instructions, no layout semantics. The Figma plugin already exports complex vectors as SVG assets. `<shape type="path">` was an inconsistency where icon paths were inlined rather than exported.

In the NASA sample file, 13 Lucide icons were authored as `<shape type="path">` — each 3–5 lines of raw path data. As `<img src="assets/icon-x.svg">` references, each becomes a single line. The SVG file lives once in `assets/` and is referenced wherever needed.

### Inline SVG violates the single-convention guarantee

An author writing a `.gui` file should encounter one vocabulary throughout. Inside an `<svg>` inline block, they encounter SVG: `stroke`, `stroke-width`, `stroke-linecap`, `fill="none"`, `viewBox`, `cx`, `cy`, `rx`, `ry`. These are not dotgui conventions.

RFC 0022 removed `stroke` from the dotgui vocabulary. RFC 0020's inline SVG reintroduced it — inside a block. That is an inconsistency the format should not carry. The convention boundary is more valuable than the generation shortcut.

## Alternatives Considered

**Keep `<shape>` with type discriminator, just rename** — Rejected. The problem is not the name, it is the discriminator pattern. A single tag covering geometrically and semantically different things is the wrong abstraction regardless of what the tag is called.

**`<rect>` and `<ellipse>` as normalized forms of `<frame>`** — Considered. The optimizer could collapse `<rect>` → `<frame>` on output. Decided against: keep the sugar tag in the parsed tree for the same reason `<row>` and `<col>` are kept — readability and intent are preserved for downstream consumers (AI agents, code generators).

**Keep `<shape type="path">` for simple single-path icons** — Rejected. "Simple" is not a formal criterion. One rule (paths are assets) is better than a heuristic (some paths are inlined, others are not).

**Keep inline SVG for AI generation convenience** — Rejected. The convenience was real but the cost — convention contamination — is structural. AI agents generating `.gui` produce `<img src="assets/icon.svg">` references just as easily as inline SVG markup. Writing a file to `assets/` is a one-line addition to the output.

**`<divider>` instead of `<line>`** — Considered. `<divider>` is more semantic (closer to HTML's `<hr>`). Rejected in favour of `<line>` because dotgui is a UI layout format, not a document format. Designer vocabulary takes precedence over document semantics. `<line>` is what the format's primary authors reach for.

**`<circle>` as a distinct tag from `<ellipse>`** — Rejected. A circle is an ellipse with equal dimensions. No new tag needed — `<ellipse w="8" h="8" />` is a circle. Adding `<circle>` gains nothing.

## Drawbacks

- **Breaking change for `<shape>`** — all existing uses must be migrated. Migration is mechanical for `rect`, `ellipse`, and `line`. Path shapes require plugin re-export or manual asset extraction.
- **Breaking change for `<svg src="...">`** — rename to `<img src="...">`. Mechanical, one attribute value change per occurrence.
- **RFC 0020 superseded** — inline SVG blocks must migrate to the asset pipeline. In practice this pattern appeared only in hand-authored and AI-generated files, not plugin output.
- **Arc/donut shapes** — lose their `<ellipse>` / `<shape>` home. Progress rings and pie segments become SVG assets. Correct placement, slightly higher authoring overhead.

## Implementation Notes

**Figma plugin:**
- `RECTANGLE` → `<rect>` (was `<shape type="rect">`)
- `ELLIPSE` (no arc) → `<ellipse>` (was `<shape type="ellipse">`)
- `ELLIPSE` (with arc) → SVG asset → `<img>`
- `LINE` → `<line>` (was `<shape type="line">`, map `stroke` → `fill`, `strokeWeight` → `thickness`)
- `VECTOR`, `STAR`, `POLYGON`, `BOOLEAN_OPERATION` → SVG asset → `<img>`
- `<svg src="...">` → `<img src="...">`

**Renderer:**
- `<rect>` → same render path as childless `<frame>`
- `<ellipse>` → same render path as `<frame>` with `borderRadius: '50%'`
- `<line>` → thin `<div>`, `w: 100%` / `h: 1px` depending on direction, `background: fill`
- `<img>` — detect asset format from extension or magic bytes, route to raster or SVG path
- Remove `<svg>` render branch, remove `<shape>` render branch

**Migration script:**
1. `<shape type="rect" .../>` → `<rect .../>` (copy attrs, remove `type`)
2. `<shape type="ellipse" .../>` → `<ellipse .../>` (copy attrs, remove `type` and any `radius`)
3. `<shape type="line" .../>` → `<line .../>` (map `stroke=` → `fill=`, `stroke-width=` → `thickness=`)
4. `<shape type="path" .../>` → flag for plugin re-export as SVG asset
5. `<svg src="...">` → `<img src="...">` (copy all attrs, rename tag)
6. Inline `<svg>` blocks → flag for manual migration

## Test Cases

```xml
<!-- rect — decorative box -->
<rect fill="$primary" w="340" h="52" />

<!-- rect — rounded -->
<rect fill="$surface" w="320" h="64" radius="12" border="$line" />

<!-- ellipse — circle (equal dimensions) -->
<ellipse fill="$red" w="8" h="8" />

<!-- ellipse — oval -->
<ellipse fill="$blue" w="80" h="40" />

<!-- ellipse — with border -->
<ellipse fill="none" border="2 $ink" w="48" h="48" />

<!-- line — horizontal separator -->
<line fill="$border" />

<!-- line — vertical separator -->
<line fill="$border" direction="vertical" />

<!-- line — custom thickness -->
<line fill="$gold" thickness="2" />

<!-- img — SVG asset (was <svg src="...">) -->
<img src="assets/logo.svg" w="120" h="32" />

<!-- img — icon (was <shape type="path">) -->
<img src="assets/icon-rocket.svg" w="21" h="21" />

<!-- img — raster -->
<img src="assets/hero.webp" w="800" h="400" />
```
