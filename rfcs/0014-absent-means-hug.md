---
rfc: 0014
title: Absent w/h = hug, layout containers only
status: Draft
targets: 0.2
date: 2026-05-20
---

# Absent w/h = hug, Layout Containers Only

## Context

With `w` and `h` as unified sizing attributes (RFC-0011), three modes exist: fixed (px), fill, and hug. The question is how to represent hug — the most common default state for layout containers.

## Decision

For layout containers and text, **absence of `w`/`h` means hug**. You only write `w` or `h` when you need fill or a fixed value.

```xml
<col>          <!-- hugs children — no w or h needed -->
<col w="fill"> <!-- fills parent -->
<col w="320">  <!-- fixed 320px -->
```

### Applies to

| Node | May omit `w`/`h` | Reason |
|---|---|---|
| `row` / `col` / `stack` | ✅ | derives size from children |
| `text` | ✅ | derives size from text content |
| `instance` | ✅ | inherits size from component definition |
| `frame` | ❌ | no flow children to derive from |
| `shape` | ❌ | no content |
| `img` | ❌ | intrinsic size not guaranteed |
| `svg` | ❌ | no layout context |

### Does not apply

`w` and `h` being absent on `frame`, `shape`, `img`, or `svg` is an **error** — these nodes have no way to derive their size and must have explicit values.

## Reasoning

Hug is the natural default state of a layout container — it wraps around its content. Requiring explicit `h="hug"` on every `<col>` would add noise to the most common case.

The rule is easy for both humans and AI to apply: if the node is a layout container or text, omit `w`/`h` unless you need something specific. If it's anything else, always write them.

The distinction is clean — layout containers and text can derive their size from their content. Frames, shapes, images, and SVGs cannot. No ambiguity.

## Alternatives Considered

**`w` bare (presence = hug)** — Rejected. Absence is cleaner than a bare attribute. `<col>` is simpler than `<col w>`. And `w` bare conflicts with the "presence = auto" convention in RFC-0015.

**Always require `w`/`h`** — Rejected. Every `<col>` and `<row>` would carry `h="hug"` or `w="hug"` — pure noise.

## Drawbacks

- Different behavior for different node types — requires knowing which category a node falls into
- An `<img>` with no `w`/`h` should be a validation error but may silently render incorrectly

## Unresolved Questions

- Should the validator enforce `w`/`h` on non-derivable nodes, or warn only?
