---
name: dotgui-write
description: Write, edit, or reason about `.gui` files. Use when generating UI from a prompt, modifying an existing `.gui` structure, answering format questions, or building layout from scratch.
---

This skill teaches you to write correct, efficient `.gui` markup — v0.2 spec.

`.gui` is portable UI structure. Not HTML. Not JSX. Think of it as **Figma's layer model as readable XML** — layout, typography, visuals, tokens, and assets in one file. Designed to be read by humans, renderers, and AI agents equally well.

---

# File Structure

`.gui` is always a ZIP package. Never a bare XML file.

```
checkout.gui          ← the file you hand to anyone (ZIP)
├── design.guix       ← the UI markup (XML)
├── preview.webp      ← thumbnail shown before anything is parsed
└── assets/
    ├── img-1.webp    ← raster images (always WebP)
    └── svg-1.svg     ← complex vector artwork
```

- **`.gui`** — the package. ZIP internally. This is what the Figma plugin exports and what the renderer receives.
- **`.guix`** — the raw markup file. Lives inside the package as `design.guix`. Can also be used standalone for small hand-written files with no binary assets.
- **`preview.webp`** — not decoration. It's the face of the file, shown in pickers and importers before anything is parsed.
- **`assets/`** — all binary assets live here, referenced by id from the markup.

A program distinguishes a package from raw markup by magic bytes: ZIP starts with `PK`, markup starts with `<`.

### design.guix structure

```xml
<gui version="0.2" name="Checkout" viewport="390x844">

  <tokens>
    <color name="primary" value="#007AFF" />
    <color name="surface" value="#FFFFFF" />
    <number name="radius-card" value="12" />
  </tokens>

  <styles>
    <text-style name="Heading/H1" font-family="Inter" font-size="32" font-weight="700" line-height="40" />
    <text-style name="Body/Regular" font-family="Inter" font-size="16" font-weight="400" line-height="24" />
  </styles>

  <fonts>
    <font family="Inter" source="google" category="sans-serif" weights="400 600 700" styles="normal" />
  </fonts>

  <assets>
    <image id="img-1" format="webp" src="assets/img-1.webp" />
    <image id="svg-1" format="svg" src="assets/svg-1.svg" />
  </assets>

  <!-- components block goes here, before the root layout -->

  <col fill="#F2F2F7" gap="16" p="24">
    ...
  </col>

</gui>
```

Document order: `tokens` → `styles` → `fonts` → `assets` → `components` → root layout node.

---

# Mental Model

`.gui` is like CSS flex — but the direction is the tag name, not an attribute.

| What you're thinking | `.gui` tag |
|---|---|
| A horizontal row of items | `<row>` |
| A vertical column of items | `<col>` |
| A grid | `<grid>` |
| A fixed container (no flow) | `<frame>` |
| A logical group (no layout) | `<group>` |

`<row>`, `<col>`, and `<grid>` are the primary layout tags. **Prefer them over `<stack direction="...">` always** — the direction is in the tag name, not an attribute that could be forgotten. The parser normalizes them to `<stack>` internally.

## Layout priority

Author layout in this order:

1. Use `<col>` for vertical document flow, sections, card content, forms, and stacked text.
2. Use `<row>` for horizontal groups, nav bars, button rows, media+copy pairs, and inline icon/text groups.
3. Use `<grid>` for repeated spatial sets: KPI cards, feature cards, galleries, pricing tables, dashboard tiles, and any evenly distributed multi-column block.
4. Use `<frame>` only when you need a bounded canvas, clipping, explicit layering, or a non-flow scene such as a hero image with overlays.
5. Use `abs` only for true overlays or pinned layers: backgrounds, scrims, badges, captions over media, decorative elements, masks, or exported geometry that cannot be represented as flow.

Do not use absolute `x`/`y` to lay out ordinary content inside a section. If items appear one after another, they belong in a `<row>`, `<col>`, or `<grid>`. This avoids fragile overlaps when text wraps, fonts load differently, or content changes.

---

# Layout Tags

## `<row>` — horizontal auto-layout

```xml
<row gap="12" p="16 24" align="middle-left" fill="#fff" radius="8">
  ...
</row>
```

## `<col>` — vertical auto-layout

```xml
<col gap="8" p="16" align="top-left" fill="#fff" radius="12">
  ...
</col>
```

## `<grid>` — grid auto-layout

```xml
<grid columns="3" gap="16 12" p="16" fill="#f2f2f7">
  ...
</grid>
```

`columns` = column count. `gap="col-gap row-gap"` (two values).

## Sizing — `w` and `h`

`w` and `h` replace `width`/`height` and `sizing-h`/`sizing-v`. One attribute, three modes:

| Value | Meaning |
|---|---|
| `w="320"` | fixed 320px |
| `w="fill"` | grow to fill parent |
| *(absent)* | hug — fit content |

**Hug is the default. Only write `w`/`h` when you need fill or a fixed value.**

Absence = hug is only valid on nodes that derive size from content:

| Node | Absent `w`/`h` |
|---|---|
| `row`, `col`, `grid`, `stack` | ✅ hug children |
| `text` | ✅ hug text content |
| `instance` | ✅ inherits from component |
| `frame`, `shape`, `img`, `svg`, `group` | ❌ must provide explicit values |

## Padding — `p` and per-side attrs

`p` replaces `padding`. Same CSS shorthand syntax:

```xml
p="16"          →  16px all sides
p="16 24"       →  top/bottom 16, left/right 24
p="8 16 12 16"  →  top right bottom left
```

Per-side overrides: `pt`, `pr`, `pb`, `pl`. Specificity wins:

```xml
<col p="16" pb="24">   <!-- 16 top/left/right, 24 bottom -->
```

## Align — 9-point grid

`align` is a single attr that replaces both `align` and `justify`. Nine positions, matching Figma's alignment grid:

```
top-left      top-center      top-right
middle-left   middle-center   middle-right
bottom-left   bottom-center   bottom-right
```

Plus `stretch` and `baseline`. Default when absent: `top-left`.

```xml
<row align="middle-left">    <!-- vertically centered, left-aligned -->
<row align="middle-center">  <!-- centered both axes -->
<col align="bottom-right">   <!-- bottom-right corner -->
```

## Gap

```xml
gap="16"       → 16px between items
gap            → space-between (bare attr = auto)
gap="auto"     → same, explicit
gap="16 10"    → 16px between items, 10px between rows (for wrap/grid)
```

## Boolean presence

Bare attrs without a value = `true`. No `="true"` needed:

```xml
clip          →  clip="true"
wrap          →  wrap="true"
abs           →  layout-position="absolute"
truncate      →  truncate="true"
mask          →  mask="true"
reverse-z     →  reverse-z="true"
```

## Absolute children inside auto-layout

```xml
<col p="16">
  <text value="Normal flow item" />
  <shape type="rect" abs x="0" y="0" w="8" h="8" radius="4" fill="$red" />
</col>
```

`abs` removes the node from flow. It then uses `x`/`y` relative to the parent.

---

# Content Tags

## `<text>`

```xml
<!-- Single style -->
<text value="Welcome back" font-family="Inter" font-size="22" font-weight="700" color="#1C1C1E" />

<!-- With a named text style — typography attrs omitted -->
<text text-style="Heading/H1" value="Welcome back" color="#1C1C1E" />

<!-- Mixed styles — use <segment> children -->
<text>
  <segment value="Hello " font-size="16" font-weight="400" color="#6E6E73" />
  <segment value="World" font-size="16" font-weight="700" color="#1C1C1E" />
</text>
```

Key text attrs: `font-family`, `font-size`, `font-weight`, `color`, `line-height`, `letter-spacing`, `align` (`left`/`center`/`right`/`justified`), `truncate`, `max-lines`, `href`.

## `<img>`

```xml
<!-- From assets -->
<img src="$img-1" w="390" h="240" fit="cover" radius="12" />

<!-- External URL — no asset declaration needed -->
<img src="https://images.unsplash.com/..." w="390" h="240" fit="cover" />
```

`fit`: `cover`, `contain`, `fill`, `none`.

## `<svg>`

Two modes: **asset reference** or **inline**.

**Asset reference** — `src` points to an `<assets>` entry or external URL:
```xml
<svg src="$svg-1" x="24" y="24" w="48" h="48" />
```

**Inline** — omit `src`. Children are raw SVG elements rendered directly. No asset entry needed:
```xml
<svg w="48" h="48">
  <circle cx="24" cy="24" r="20" fill="#007AFF" />
  <path d="M12 24l8 8 16-16" stroke="white" stroke-width="2" fill="none" />
</svg>

<!-- Inline logo / illustration -->
<svg w="120" h="32">
  <rect width="120" height="32" rx="6" fill="#1C1C1E" />
  <text x="12" y="22" font-family="Inter" font-size="14" font-weight="700" fill="white">acme</text>
</svg>
```

The renderer wraps the children in a real `<svg viewBox="0 0 w h">`. Use inline when you have self-contained SVG markup and don't want the overhead of a separate asset file.

## `<shape>`

```xml
<!-- Rectangle -->
<shape type="rect" x="0" y="0" w="340" h="52" fill="$primary" radius="12" />

<!-- Ellipse -->
<shape type="ellipse" x="0" y="0" w="40" h="40" fill="#007AFF" />

<!-- Donut segment -->
<shape type="ellipse" x="0" y="0" w="100" h="100"
       fill="#007AFF" arc-start="0" arc-end="270" arc-inner="0.6" />

<!-- Line -->
<shape type="line" x="0" y="100" w="390" stroke="#E5E5EA" stroke-width="1" />

<!-- Path — filled (star, polygon, boolean op) -->
<shape type="path" x="0" y="0" w="24" h="24" fill="#1C1C1E">
  <path d="M12 2L15.09 8.26L22 9.27..." />
</shape>

<!-- Path — stroked icon (Lucide, Heroicons pattern) -->
<shape type="path" x="0" y="0" w="24" h="24" fill="none" stroke="#6366F1" stroke-width="1.5">
  <path d="M5 12h14M12 5l7 7-7 7" />
</shape>
```

`type="path"` is for VECTOR, STAR, POLYGON, and BOOLEAN_OPERATION nodes. SVG path data goes in a `<path d="..."/>` child.

---

# Images vs Icons vs Fonts — When to Use What

The choice matters for file size, token count, and fidelity. Use the cheapest option that maintains accuracy.

## Decision order

```
Can I draw it with <shape>?               → yes → <shape type="rect|ellipse|line">
Is it a stroked or filled SVG path icon?  → yes → <shape type="path"> + <path d="..."/>
Is it from an icon font glyph?            → yes → <text font-family="Material Icons" value="search" />
Do I have self-contained SVG markup?      → yes → <svg w h> with inline children (no asset)
Is it complex art that needs a file?      → yes → <svg src="$id"/> + SVG asset
Is it a raster photo or bitmap?           → yes → <img src="$id" fit="cover"/> + WebP asset
```

### `<shape>` — free, no asset
Simple geometry. Circles, rectangles, lines, dividers, dot indicators, progress arcs. No asset, no base64, just an element.

```xml
<!-- Notification dot -->
<shape type="ellipse" abs x="28" y="-4" w="8" h="8" fill="#FF3B30" />

<!-- Full-width divider -->
<shape type="line" w="fill" stroke="#E5E5EA" stroke-width="1" />
```

### `<shape type="path">` — no asset, inline path data
For any icon described as SVG path data (Lucide, Heroicons, Phosphor, Tabler, etc.). No asset file, no base64. The `d` string travels inline.

```xml
<shape type="path" w="20" h="20" fill="none" stroke="#1C1C1E" stroke-width="1.5">
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
</shape>
```

This is the most common icon pattern. Use it for any icon library that ships SVG path data.

### Icon font `<text>` — no asset, just a glyph
When the design uses an icon font (Material Icons, SF Symbols, etc.), render it as `<text>`. No asset, no path, just a Unicode character.

```xml
<text value="search" font-family="Material Icons" font-size="24" color="#1C1C1E" />
```

### `<svg>` inline — no asset
When you have self-contained SVG markup, embed it directly as children. No `<assets>` entry, no `$id`, no file:

```xml
<svg w="80" h="80">
  <circle cx="40" cy="40" r="36" fill="#007AFF" />
  <path d="M24 40l12 12 20-24" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" />
</svg>
```

### `<svg src="$id">` — SVG asset (binary)
For complex artwork that comes from a file — exported from Figma, a pre-existing SVG, a multi-layer illustration. Adds an asset entry + file overhead. Use inline first if you can.

```xml
<svg src="$svg-logo" x="24" y="48" w="120" h="32" />
```

### `<img>` — raster asset (binary, WebP)
Photos, screenshots, textures, UI mockups. Always WebP. The most expensive option — binary asset embedded in the package.

```xml
<img src="$img-hero" w="390" h="300" fit="cover" />
```

Never use `<img>` for icons or anything you can express as a path or shape.

---

# Components & Instances

This is where `.gui` gets its real power for AI. Components tell you what's reusable. Instances are a single line each, no matter how complex the component.

## Anatomy

```xml
<components>

  <!-- Standalone component -->
  <component name="Card/Product" id="comp-card-product">
    <props>
      <prop name="title"      type="text"    target="title" />
      <prop name="show-badge" type="visible" target="show-badge" />
    </props>
    <col w="320" radius="$radius-card" fill="#fff" gap="8" p="16">
      <text id="title" text-style="Heading/H2" value="Product" color="#1C1C1E" />
      <shape id="show-badge" type="ellipse" abs x="8" y="8" w="8" h="8" fill="$red" />
    </col>
  </component>

  <!-- Component set (variants) -->
  <component-set name="Button" id="compset-button">
    <variant id="comp-button-primary" style="primary">
      <props>
        <prop name="label" type="text" target="label" />
      </props>
      <row gap="8" p="12 24" align="middle-center" fill="$primary" radius="8">
        <text id="label" value="Label" font-size="16" font-weight="600" color="#fff" />
      </row>
    </variant>
    <variant id="comp-button-secondary" style="secondary">
      <props>
        <prop name="label" type="text" target="label" />
      </props>
      <row gap="8" p="12 24" align="middle-center" stroke="$primary" stroke-width="1.5" radius="8">
        <text id="label" value="Label" font-size="16" font-weight="600" color="$primary" />
      </row>
    </variant>
  </component-set>

</components>
```

## Instances — one line each

```xml
<!-- Standalone component instance -->
<instance component="comp-card-product" x="24" y="120"
  title="Nike Air Max 90"
  show-badge="false" />

<!-- Variant instance -->
<instance component="comp-button-primary" x="24" y="400" label="Get Started" />
<instance component="comp-button-secondary" x="24" y="460" label="Cancel" />
```

## Props

| type | Effect |
|---|---|
| `text` | Overrides the `value` attr on the target text node |
| `visible` | Hides the target when `"false"` |

`target` matches the `id` on the node inside the component body. Every node inside a component body gets `id` = its layer name in kebab-case.

## Two override approaches

**Declared props** (recommended) — `<props>` block + `target` matched via Figma's internal ref. Immune to duplicate layer names.

**Ad-hoc overrides** — no `<props>` block. Plugin detects text/visibility edits via `InstanceNode.overrides` and emits the layer name as the attribute key directly. Works as long as layer names are unique.

```xml
<!-- Ad-hoc: no props block, just use the layer name as the attr -->
<component name="Tag" id="comp-tag">
  <row p="4 10" fill="#F2F2F7" radius="6">
    <text id="label" value="Tag" font-size="12" font-weight="500" color="#1C1C1E" />
  </row>
</component>

<instance component="comp-tag" label="Design" />
<instance component="comp-tag" label="React" />
```

---

# Token Efficiency

`.gui` is processed by AI and optimizers. Fewer tokens = faster reasoning, cheaper inference, smaller files.

## Use `$tokens` for repeated values

```xml
<!-- Avoid -->
<row fill="#007AFF" />
<shape fill="#007AFF" />
<text color="#007AFF" />

<!-- Prefer -->
<tokens>
  <color name="primary" value="#007AFF" />
</tokens>
<row fill="$primary" />
<shape fill="$primary" />
<text color="$primary" />
```

Tokenize: colors, spacing, radii, font families. Don't tokenize values used exactly once.

## Use `<text-style>` for typography

```xml
<styles>
  <text-style name="Heading/H1" font-family="Inter" font-size="32" font-weight="700" line-height="40" />
</styles>

<!-- 5 attrs → 1 attr -->
<text text-style="Heading/H1" value="Welcome" color="#1C1C1E" />
```

## Use `<component>` for repeated UI

Without components: N identical blocks. With components: N one-liners.

```xml
<!-- 3 tags instead of 3 × however many nodes per tag -->
<instance component="comp-tag" label="Design" />
<instance component="comp-tag" label="React" />
<instance component="comp-tag" label="Open Source" />
```

## Use flow layout before frames and absolute positions

`<frame>` creates a fixed canvas where children are absolute by default. That is useful for backgrounds and layered compositions, but fragile for normal UI. `<col>`, `<row>`, and `<grid>` let content define height naturally and prevent accidental collisions.

```xml
<!-- Avoid -->
<frame w="390" h="200">
  <text value="Title" x="16" y="16" font-size="20" font-weight="700" color="#1C1C1E" />
  <text value="Subtitle" x="16" y="48" font-size="15" color="#6E6E73" />
</frame>

<!-- Prefer -->
<col p="16" gap="4">
  <text value="Title" font-size="20" font-weight="700" color="#1C1C1E" />
  <text value="Subtitle" font-size="15" color="#6E6E73" />
</col>
```

For repeated cards, use `<grid>` instead of manually positioning each item:

```xml
<!-- Avoid -->
<frame w="1296" h="140">
  <instance component="stat-card" x="0" y="0" />
  <instance component="stat-card" x="328" y="0" />
  <instance component="stat-card" x="656" y="0" />
</frame>

<!-- Prefer -->
<grid w="fill" columns="3" gap="18">
  <instance component="stat-card" />
  <instance component="stat-card" />
  <instance component="stat-card" />
</grid>
```

A common hero pattern is one layered `<frame>` for the visual canvas, then one flow `<col>` inside it:

```xml
<frame w="1440" h="980" clip>
  <img abs x="0" y="0" w="1440" h="980" src="$hero" fit="cover" />
  <shape abs x="0" y="0" w="1440" h="980" type="rect" fill="#00000066" />

  <col w="fill" h="fill" p="34 72 72 72" gap="64">
    <row w="fill" gap align="middle-center">...</row>
    <col w="760" gap="32">...</col>
    <grid w="fill" columns="4" gap="18">...</grid>
  </col>
</frame>
```

## Omit defaults — they're assumed

| Attr | Default (omit when this) |
|---|---|
| `opacity` | `1` |
| `blend` | `normal` |
| `align` | `top-left` |
| `constraint-h` | `left` |
| `constraint-v` | `top` |
| `font-style` | `normal` |
| `stroke-position` | `center` |

---

# Appearance Block

Use when a node has **multiple fills**, an **image fill**, or **complex effects**. Switch from the `fill=` shorthand to `<appearance>`:

```xml
<frame w="390" h="300">
  <appearance>
    <fill type="image" src="$img-bg" fit="cover" />
    <fill type="color" value="#00000066" />
    <effect type="background-blur" radius="20" />
    <effect type="drop-shadow" x="0" y="8" radius="24" spread="0" color="#00000033" />
  </appearance>
  <!-- children render above -->
</frame>
```

Effect types:

| type | Attrs |
|---|---|
| `drop-shadow` | `x y radius spread color blend` |
| `inner-shadow` | `x y radius spread color blend` |
| `layer-blur` | `radius` |
| `background-blur` | `radius` |
| `glass` | `radius saturation` (saturation is %, e.g. `180`) |

Single color fill shorthand is still valid:
```xml
<col fill="#FFFFFF">         <!-- simple, use this -->
<col fill="$surface">       <!-- token ref -->
<col fill="linear-gradient(180deg, #FF6B6B 0%, #4ECDC4 100%)">  <!-- gradient inline -->
```

---

# Common Mistakes

| Mistake | Fix |
|---|---|
| Using `<stack direction="horizontal">` | Use `<row>` — shorter, clearer, direction in the tag |
| `width="320" height="80"` | Use `w="320" h="80"` |
| `padding="16"` | Use `p="16"` |
| `sizing-h="fill"` | Use `w="fill"` |
| `layout-position="absolute"` | Use `abs` |
| `clip="true"` `wrap="true"` | Use bare `clip` `wrap` |
| `justify="space-between"` | Use bare `gap` (presence = space-between) |
| `align="center" justify="center"` | Use `align="middle-center"` |
| Absolute `x`/`y` on every child | Use `<col>`/`<row>` — children don't need positions |
| `<svg src="$id">` for a simple stroked icon | Use `<shape type="path"><path d="..."/></shape>` |
| `<svg src="$id">` when you have the SVG markup | Use `<svg w h>` with inline children — no asset needed |
| Repeating identical UI blocks | Define `<component>`, use `<instance>` |
| Inlining all font attrs on every text node | Define `<text-style>`, reference with `text-style=` |
| Duplicating fill color literals | Define `<color>` token, reference with `$name` |

---

# Using Alongside `dotgui-design`

This skill (`dotgui-write`) covers **format correctness, v0.2 API, and efficiency**.

The companion skill `dotgui-design` covers **visual direction and aesthetics** — what the UI should look like, which design language to commit to, composition, typography choices.

For full-screen generation from scratch: use `dotgui-design` first to establish visual intent, then `dotgui-write` to produce correctly structured markup.

For edits, format questions, or targeted generation: `dotgui-write` alone is enough.
