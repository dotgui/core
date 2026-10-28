---
rfc: 0022
title: fill and border — one way to color and outline a node
status: Implemented
targets: 0.3.10
date: 2026-05-21
updated: 2026-10-28
implemented: 2026-10-28
---

# `fill` and `border` — One Way to Color and Outline a Node

## Context

The format has two ways to color text and two ways to outline a node.

**Text color.** `fill` colors a frame's background, and on `<text>` it colors the glyphs. `color` does the same job on `<text>` and `<segment>` — a split inherited from CSS (`background` vs `color`) and Figma (fills vs text color). Both renderers read `fill` first and fall back to `color`, and the Figma exporter writes `fill`. Across the 442 `.guix` files in the workspace, `<text>` carries `color=` 3,987 times and `fill=` 1,843 times; `<segment>` carries `color=` 164 times and `fill=` never.

**Outlines.** [RFC-0025](0025-complete-stroke-border-model.md) settled the outline model: the `border` shorthand (`border="2 dashed $line inside"`, tokens in any order), the longhands `border-color`, `border-width`, `border-style` and `border-align`, per-side `border-top` … `border-left`, and `<border>` entries in `<appearance>` for several outlines. That is the half of this RFC's first draft that already shipped.

What it left behind is the SVG vocabulary that came with `<shape>`: `stroke`, `stroke-width` and `stroke-position` as node attributes, and `<stroke>` inside `<appearance>`. [RFC-0023](0023-remove-shape.md) removed `<shape>`, but 121 old files still carry `stroke=`. Kit's HTML renderer still draws it; the native renderer drops it without a word. And a component prop's `bind="stroke"` names an attribute that no longer exists.

## Decision

**`fill` colors a node, whatever it is. `border` outlines it.** Nothing else does either job.

1. **`fill` on `<text>` and `<segment>` colors the glyphs.** `color` on `<text>` or `<segment>` is obsolete.
2. **The outline is RFC-0025's model, unchanged:** `border`, its longhands, per-side borders, and `<border>` inside `<appearance>`. `<border>` is not valid directly inside a node.
3. **`stroke`, `stroke-width` and `stroke-position` are not node attributes,** and `<stroke>` is not an `<appearance>` entry. `border="{width} {color} {position}"` says the same thing.
4. **`color` stays where it names a paint inside a child tag:** `<border color>`, `<effect color>`, and `<fill type="color">`. Those are not a node's own color, and nothing changes there.
5. **A color prop binds `fill` by default, or `border-color`.** `bind="stroke"` is the old name for `border-color`: it still applies, and warns.

Rules 1 and 3 are 0.3.10 rules: errors in a document declaring 0.3.10 or higher, warnings in one written before. A document written before 0.3.10 renders exactly as it did — and in the native renderer, better: a legacy `stroke` is drawn as the border it always meant, where it used to be dropped.

```xml
<!-- Before -->
<text value="Hello" color="$ink" />
<col stroke="$line" stroke-width="1" stroke-position="inside" />

<!-- From 0.3.10 -->
<text value="Hello" fill="$ink" />
<col border="1 $line inside" />
```

## Reasoning

**One way to say it ([P12](../PRINCIPLES.md)).** `fill` already colors text in both renderers and in every Figma export. A second attribute for the same job is a question every author asks — "is it `fill` or `color`?" — and a fork every tool must handle. The node decides what filling means: a frame's background, a glyph's ink.

**One vocabulary ([P8](../PRINCIPLES.md)).** `stroke` is SVG's word, and the format is not SVG ([RFC-0002](0002-not-svg.md)). Its only home, `<shape>`, is gone. Keeping its attributes alive keeps a dialect alive with nothing to belong to.

**Honest rendering ([P15](../PRINCIPLES.md)).** Today the same file draws an outline in kit and none in the native renderer. Retiring `stroke` from 0.3.10, and drawing legacy strokes as borders before it, means every renderer draws the same thing.

**`color` on child tags is a different thing.** `<border color>` and `<effect color>` name the paint of an entry, not a node's own color; there is no `fill` there to collide with. Renaming them would churn every file for no gain.

**Why `<border>` stays inside `<appearance>`.** The first draft allowed `<border>` directly inside a node. RFC-0025 put it in `<appearance>`, beside `<fill>` and `<effect>`, where ordered stacks live. Two places would be two ways.

### Principle pass

| Principle | Result | Note |
|---|---|---|
| P1 — neutral | pass | `fill` and `border` are what every UI tool calls them. |
| P2 — platform-agnostic | pass | Text color and outlines mean the same everywhere. |
| P4 — everything means something | pass | No attribute that is ignored by one renderer and drawn by another. |
| P8 — one vocabulary | pass | SVG's `stroke` leaves; `fill` means one thing on every node. |
| P11 — grammar | pass | No new tag or value form; two attributes retired. |
| P12 — one way | pass | Three duplicates removed: text `color`, `stroke*`, a second home for `<border>`. |
| P14 — deterministic | pass | One reading of every file. |
| P15 — honest | pass | Old forms fail loudly from 0.3.10, and are drawn faithfully before it. |

## Alternatives Considered

**Keep `color` on text** — Rejected. It is the second way to do something `fill` already does in every renderer.

**Keep `stroke` as an alias of `border`** — Rejected. An alias is a second way, in another format's vocabulary.

**`<border>` directly inside a node** — Rejected; see *Reasoning*.

**Rename `color` on `<border>` and `<effect>` to `fill`** — Rejected. It is an entry's paint, not a node's color, and renaming it would churn every file.

**`outline` instead of `border`** — Rejected in the first draft and still. `border` is universally understood.

## Drawbacks

- Files with `color` on text — most of the hand-written and demo files in the workspace — must rename it before they declare 0.3.10. It is a mechanical rename.
- A component whose prop says `bind="stroke"` warns until it says `border-color`.

## Implementation Notes

- **Schema:** the bind description names `fill` and `border-color`; text and segment entries say `fill` colors the glyphs.
- **Kit validator:** `OBSOLETE_TEXT_COLOR` for `color` on `<text>` / `<segment>`; `OBSOLETE_STROKE` for `stroke`, `stroke-width`, `stroke-position` on a node and for `<stroke>` in `<appearance>`; `BORDER_MISPLACED` for `<border>` directly inside a node. Errors from 0.3.10, warnings before. `LEGACY_PROP_BIND` warns on `bind="stroke"`.
- **Kit HTML renderer:** a color prop with `bind="border-color"` sets the target's border color; `stroke` keeps working as its old name.
- **Native renderer:** the same rules and bind; a document before 0.3.10 draws `stroke` / `stroke-width` / `stroke-position` as a border.
- **Figma exporter:** already writes `fill` on text and `border` for outlines. No change.
- **Migration:** rename `color=` → `fill=` on `<text>` and `<segment>`; merge `stroke`, `stroke-width`, `stroke-position` into `border`.

Shipped in 0.3.10: the schema and reference; kit's validator and HTML renderer, which also gained the border longhands RFC-0025 specified and a border color with spaces kept in one piece; and the native renderer, which now draws a legacy `stroke` as a border. Both read documents up to 0.3.10.

## Test Cases

Tested in kit and the native renderer:


- `<text fill="$ink">` and `<segment fill="$ink">` validate; `<text color="$ink">` is an error in 0.3.10 and a warning in 0.3.9, where it still draws.
- `<col stroke="#000000" stroke-width="2">` is an error in 0.3.10; in 0.3.9 it warns and the native renderer draws a 2px border.
- `<border color="$line">` inside `<appearance>` validates; directly inside a `<col>` it is an error in 0.3.10.
- A color prop with `bind="border-color"` sets the target's border color; `bind="stroke"` does the same and warns.

## Unresolved Questions

- **`stroke-style` as a style bind.** RFC-0034 lists `stroke-style` among the style binds, but `<styles>` declares only text, fill and effect styles, so nothing can be bound. Either a border style declaration is added, or the bind goes. Left for the token and style work ([RFC-0038](0038-composite-token-types.md)).
