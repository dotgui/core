---
rfc: 0029
title: Layout geometry fidelity
status: Draft
introduced-in: 0.3
date: 2026-05-22
related: 0011, 0012, 0013, 0014, 0015, 0016, 0017
---

# Layout geometry fidelity

## Context

Layout geometry is the skeleton of a `.gui` export. dotgui does not need to preserve every authoring control from every design tool, but it must preserve enough geometry to reconstruct the visible screen and explain its structure.

The 0.2 layout RFCs already define the core vocabulary: `w`, `h`, `row`, `col`, `grid`, `gap`, `p`, `align`, `wrap`, `abs`, and absent-size-as-hug.

This RFC ties those pieces together under the visual export goal.

## Decision

dotgui layout should preserve:

| Feature | Purpose |
|---|---|
| `x` / `y` | Absolute position in parent coordinates |
| `w` / `h` | Rendered size or sizing behavior |
| `row` / `col` / `grid` | Structural flow layout |
| `frame` | Fixed container with absolute children |
| `gap` | Item and row spacing |
| `p`, `pt`, `pr`, `pb`, `pl` | Padding |
| `align` | Visual alignment |
| `wrap` | Multi-line auto-layout |
| `abs` | Absolute child inside flow layout |
| `min-*` / `max-*` | Responsive size bounds |
| `rotation` | Layer rotation |
| `z` or source order | Stacking order |
| `constraint-h` / `constraint-v` | Responsive replay hints |

Use source order as z-order by default. Add `reverse-z` where a source tool's auto-layout drawing order requires it.

Add an optional `transform` attr only when `x`, `y`, `w`, `h`, and `rotation` are insufficient to reproduce the visible geometry.

```xml
<frame w="390" h="844">
  <row x="24" y="24" w="342" gap="12" p="16" align="middle-left">
    <text value="Profile" fill="$ink" />
  </row>
</frame>
```

## Reasoning

For `.gui`, layout has two responsibilities:

1. Reproduce the visible screen.
2. Preserve enough structure for AI, code generators, and renderers to understand the UI.

This means dotgui should prefer readable layout tags over raw absolute positions when the source structure is real. But it should also preserve absolute geometry when layout inference would be lossy.

## Alternatives Considered

**Always export absolute frames** — Rejected. It preserves pixels but destroys meaningful structure.

**Always infer semantic layout** — Rejected. Inference can change visual output and should not invent intent.

**Preserve every source-tool layout property** — Rejected. dotgui is not a design editor save format.

## Drawbacks

- Mixed absolute/flow layouts are more complex to render and optimize.
- `transform` introduces a lower-level geometry escape hatch that should be used sparingly.
- Constraints are useful but can be mistaken for full responsive behavior.

## Implementation Notes

1. Preserve explicit source auto-layout as `row`, `col`, or `grid`.
2. Preserve non-auto-layout containers as `frame`.
3. Use `abs` for absolute children inside flow containers.
4. Keep optimizer layout inference conservative and visual-preserving.
5. Add `transform` only for skew/shear or unsupported transforms.

## Test Cases

```xml
<frame w="390" h="844" fill="$canvas">
  <col x="24" y="80" w="342" gap="16">
    <text value="Checkout" fill="$ink" />
    <row w="fill" gap="12" p="16" fill="$surface" radius="12">
      <text value="Visa ending 4242" fill="$ink" />
    </row>
  </col>
  <rect abs x="0" y="0" w="390" h="44" fill="#00000011" />
</frame>
```

## Unresolved Questions

- Is `transform` needed for 0.3 or should unsupported transforms rasterize?
- Should explicit `z` exist, or is source order plus `reverse-z` enough?
- Should layout grids be part of visual export or deferred as editor metadata?
