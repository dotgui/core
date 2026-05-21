---
rfc: 0022
title: fill and border — unified color and outline properties
status: Draft
introduced-in: 0.3
date: 2026-05-21
---

# fill and border — unified color and outline properties

## Context

dotgui currently uses three separate conventions for what are conceptually two things — filling an element with color, and outlining it:

**Fill:**
- `fill` on frames and shapes → background/fill color
- `color` on text → text color

Two different properties for the same idea: *fill this element with this color.* The split was inherited from Figma's data model (fills vs text color) and from CSS (background vs color), neither of which is the right reference point for a format that is meant to be read naturally.

**Outline:**
- `stroke` → outline color
- `stroke-width` → outline width
- `stroke-position` → outline alignment (inside / outside / center)

Three attributes to express one concept. `stroke` vocabulary is SVG vocabulary — it does not belong in a format that is explicitly not SVG (RFC 0002).

**Impact across existing files:**

| attribute | test.gui | kerala.guix | nasa.guix | total |
|---|---|---|---|---|
| `color` (text only) | 7 | 82 | 93 | **182** |
| `stroke` (UI borders) | 3 | 6 | 27 | **36** |
| `stroke-width` | 3 | 8 | 40 | **51** |
| `stroke-position` | 3 | 0 | 0 | **3** |

182 uses of `color` doing the same job as `fill`. 39 attribute pairs that collapse to a single `border` shorthand. ~734 characters of overhead across three files — before the format even reaches scale.

## Decision

**`fill` is the universal fill property.** It means: fill this element with something. On a frame, it fills the background. On a text node, it fills the text glyphs. The element determines what fill means visually. One property, no disambiguation.

`color` is removed from the vocabulary.

**`border` is the universal outline property.** It replaces `stroke`, `stroke-width`, and `stroke-position` with a single shorthand string. The longhand sub-properties `border-color`, `border-width`, `border-style`, and `border-align` are available when explicit control is needed or for programmatic authoring.

`stroke`, `stroke-width`, and `stroke-position` are removed from the vocabulary.

### border shorthand — string parsing rules

`border` accepts a smart string. Tokens are parsed by type — order does not matter:

| token type | role | example |
|---|---|---|
| number | width (px implied) | `2` |
| `solid` / `dashed` / `dotted` | style | `dashed` |
| `inside` / `outside` / `center` | alignment | `inside` |
| color (`#hex`, `$token`, named) | color | `#eee`, `$line` |

Defaults when not specified: width `1`, style `solid`, align `center`.

```xml
border="#eee"                       <!-- 1px solid #eee center -->
border="2 #333"                     <!-- 2px solid #333 center -->
border="2 dashed #333"              <!-- 2px dashed #333 center -->
border="2 dashed #333 inside"       <!-- 2px dashed #333 inside -->
```

### Longhand sub-properties

Available as individual attributes for explicit control or complex cases:

```xml
border-color="#eee"
border-width="2"
border-style="dashed"
border-align="inside"
```

`border-color` is equivalent to `border="<color>"` — included for consistency and programmatic generation.

### Tag form — for multi-border or opacity control

When a single `border` attribute is insufficient, the `<border>` child tag is used:

```xml
<frame>
  <border color="#eee" width="2" style="dashed" align="inside" />
</frame>
```

No text content between tags. `<border>` is always a child element with explicit attributes.

## Reasoning

### fill on text is correct

`fill` is a verb: *fill this with something.* It applies equally to a frame background, a text glyph, and a shape. The element decides the visual outcome — the property does not need to know. This mirrors SVG's model (where `fill` applies to both text and shapes) and is simpler than maintaining a separate `color` property that only applies to one element type.

The split between `fill` and `color` is Figma and CSS internals leaking into the format. dotgui is an export format, not a reflection of either platform's rendering model (RFC 0003).

### border over stroke

`stroke` is SVG vocabulary. dotgui is not SVG (RFC 0002). Every time `stroke` appears in a `.gui` file it creates unnecessary friction — authors who know CSS or UI conventions expect `border`, authors who know dotgui should not need to learn SVG property names.

`border` also naturally collapses the three-property pattern into one. In real files, nearly every border use is `stroke="$line" stroke-width="1"` — the same pair repeated. The shorthand encodes the common case in a third of the characters.

### Measured impact

Across three representative files:

- **182 attribute renames** (`color` → `fill` on text) — mechanical, zero semantic change
- **39 attributes eliminated** (`stroke` + `stroke-width` pairs → single `border`)
- **~734 characters saved** — before the format reaches production scale
- **3 concepts removed** from the vocabulary: `color`, `stroke`, `stroke-width`, `stroke-position`

The vocabulary shrinks from five color/outline concepts to two.

## Alternatives Considered

**Keep `color` for text** — Rejected. It creates a question every new author asks: "why is text color not fill?" The answer ("because that's how Figma/CSS works") is not a good answer for a format with its own conventions.

**Keep `stroke` for compatibility** — Rejected. There are no external consumers of the format at this stage. Compatibility at the cost of clarity is the wrong trade before 1.0.

**`outline` instead of `border`** — Considered. `outline` is also plain English and avoids CSS `border` associations. Rejected because `border` is more universally understood and `outline` in CSS has specific non-box-model semantics that could be confusing.

**Named params syntax: `border="w:2 c:#eee s:dashed"`** — Rejected. Adds sigil overhead for no benefit. Type inference on tokens is unambiguous and more natural to write.

## Drawbacks

- **Breaking change** — all existing `.gui` files need migration: `color=` → `fill=` on text nodes, `stroke=` / `stroke-width=` / `stroke-position=` → `border=` on layout nodes. Mechanical migration — a single pass script covers it.
- **String parsing** — the `border` shorthand requires a parser. The parser is simple (split on whitespace, classify each token by type) but it is a code path that does not exist today.
- **SVG `stroke` on `<shape type="path">`** — no longer valid. This is resolved by RFC 0023 (removal of `<shape>`): path shapes become SVG assets referenced via `<img>`, where SVG attributes are renderer-internal and never appear in `.gui` authoring.

## Implementation Notes

Migration script for existing files:
1. On `<text>` nodes: rename `color=` → `fill=`
2. On all other nodes: where `stroke=` and `stroke-width=` are both present, merge into `border="{width} {color}"`. Where `stroke-position=` is also present, append the value.
3. Remove standalone `stroke=`, `stroke-width=`, `stroke-position=` attributes.

The `<appearance>` block's `<fill>` children are unaffected — they use their own sub-attributes and are not part of this change.

## Test Cases

```xml
<!-- Text fill — was color= -->
<text value="Hello" fill="$ink" font-size="16" />
<text value="Muted" fill="$muted" font-size="14" />

<!-- Frame fill — unchanged -->
<frame fill="$surface" w="320" h="48" />

<!-- Border shorthand — color only -->
<frame fill="$panel" border="$line" radius="8" />

<!-- Border shorthand — width + color -->
<stack direction="horizontal" fill="$panel" border="2 $ink" />

<!-- Border shorthand — full -->
<frame border="2 dashed $line inside" />

<!-- Border longhand — explicit -->
<frame border-color="$line" border-width="1" border-align="inside" />

<!-- Border tag form — for complex cases -->
<frame>
  <border color="$line" width="1" align="inside" />
</frame>
```
