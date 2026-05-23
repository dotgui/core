# dotgui

**UI as text.**

dotgui is an open format for describing user interfaces as plain, portable markup. Export any Figma screen to a `.gui` file. Render it in a browser. Feed it to an AI agent. Build with it programmatically.

No proprietary decoder. No binary blob. No context lost in translation.

---

## Why it exists

Design tools store UI as proprietary formats — binary APIs, closed schemas, data you can only access through vendor SDKs. That works fine for designers. It breaks down the moment you want code or AI to reason about a screen.

Screenshots are imprecise. SVG exports are layout-blind. JSON from the Figma API is verbose, deeply nested, and saturated with authoring noise that has nothing to do with how the screen actually looks.

**dotgui exists because there should be one format that works equally well for a human reading it, a renderer drawing it, and an AI agent reasoning about it.**

That format is text. Structured, readable, self-contained text.

---

## Ethos

### Text is the interface

A `.gui` file is plain markup — XML-inspired, human-readable, purpose-built for UI. You can open it in any editor, diff it in git, pipe it through a shell script, paste it into a prompt. No tooling required to read it. The format is the documentation.

### One package, complete picture

A `.gui` file is a ZIP package. Structure, styles, design tokens, font declarations, binary assets (images, vector artwork), and a preview thumbnail all live in one place. You hand someone a `.gui` file and they have everything — including a visual preview before they open anything.

### Fidelity to source

The format maps 1-1 to Figma's layer model. Auto-layout, fills, gradients, effects, constraints, mixed-style text, image crops, blend modes — everything is preserved exactly. Nothing is approximated, summarized, or dropped because it was inconvenient to encode. If it's on screen, it's in the file.

### Readable by machines and humans

Attributes are named for what they mean, not what the internal data model calls them. `font-weight="700"` not `fontWeight: [700, 700]`. `direction="horizontal"` not `layoutMode: "HORIZONTAL"`. A file that reads naturally is also a file an LLM can reason about without a translation layer.

### No AI in the format pipeline

The Figma plugin that produces `.gui` is deterministic and rule-based. The optimizer that cleans it up is deterministic and rule-based. Neither invents meaning, infers intent, or guesses at what the designer meant. The format carries what the design contains — nothing more.

### Visual impact is zero

The optimizer is explicitly forbidden from making changes that alter visual output. Every transformation either provably preserves the render or is skipped and logged. Structural cleanup is not an excuse to silently change what the user sees.

### Platform-agnostic

`.gui` makes no assumptions about the target platform. It describes visual structure and properties — not React components, not CSS classes, not SwiftUI views. What you build from it is your decision.

---

## The Pipeline

```
Figma Design
     ↓
dotgui-figma (Figma plugin)
     ↓
raw.gui  (package: design.guix + preview.webp + assets/)
     ↓
gui-optimizer
     ↓
optimized.gui
     ↓
dotgui-render   /   AI Agent   /   Code Generator
```

Each stage has a single, well-defined responsibility. The extractor doesn't optimize. The optimizer doesn't render. The renderer doesn't modify the document. They compose cleanly because they stay in their lane.

---

## The Format

### The .gui package

`.gui` is the format. Always. To the designer, the tool, the renderer, and the AI — the file is `.gui`.

Internally, a `.gui` file is a ZIP package. The markup lives inside as `design.guix` — but that is an implementation detail, never surfaced to the outside. A program that needs to distinguish a package from a raw markup string uses magic bytes: ZIP starts with `PK`, markup starts with `<`.

### Package Structure

```
checkout.gui  (ZIP)
├── design.guix       ← the UI markup
├── preview.webp      ← thumbnail for verification and previewing
└── assets/
    ├── img-1.webp
    └── svg-1.svg
```

The `preview.webp` is not decoration — it is the face of the file. Before any tool opens or parses the markup, the preview can be shown. It is the visual verification that the export captured what the designer intended.

### design.guix structure

The root element is `<gui>`. Everything else is a child.

```xml
<gui version="0.2" name="Checkout">
  <tokens>
    <color name="primary" value="#007AFF" />
    <number name="space-md" value="16" />
  </tokens>
  <fonts>
    <font family="Inter" source="google" weights="400 600 700" styles="normal" />
  </fonts>
  <col w="390" fill="#F2F2F7" gap="16" p="24">
    <text value="Checkout" font-family="Inter" font-size="28" font-weight="700" fill="#1C1C1E" />
    ...
  </col>
</gui>
```

### Root Element

`<gui>` is a document envelope — never rendered. Direct children are metadata blocks or exactly one root layout node. Metadata always precedes the layout root.

| Attr | Description |
|---|---|
| `version` | Spec version (`0.2`) |
| `name` | Screen or layer name |

### Root Canvas

The first layout tag under `<gui>` defines the canvas. Two patterns:

| Root | When | `h` |
|---|---|---|
| `<col w="390">` | Content-driven screen, AI-authored | absent — hugs children |
| `<frame w="390" h="844">` | Fixed artboard, Figma export | required |

`<frame>` children are absolutely positioned. `<col>` children flow vertically. Default to `<col>` — it cannot clip content.

### Tokens

Design system primitives. Referenced anywhere in the tree with `$name`.

```xml
<tokens>
  <color name="primary" value="#007AFF" />
  <number name="radius-card" value="12" />
  <string name="font-base" value="Inter" />
</tokens>
```

```xml
<rect fill="$primary" radius="$radius-card" />
```

### Styles

Named text styles from the design system. Each `<text-style>` captures a full typography definition. Text nodes reference a style by name — individual font attrs are omitted when a style is applied.

```xml
<styles>
  <text-style name="Heading/H1" font-family="Inter" font-size="32" font-weight="700" line-height="40" />
  <text-style name="Body/Regular" font-family="Inter" font-size="16" font-weight="400" line-height="24" />
</styles>
```

```xml
<text text-style="Heading/H1" value="Welcome" x="24" y="80" fill="#1C1C1E" />
```

Color and layout attrs are always inlined — they are not part of the text style definition. Only styles used in the exported tree are emitted.

### Fonts

Font declarations for the renderer. The renderer uses these to load Google Fonts or fall back gracefully.

```xml
<fonts>
  <font family="Inter" source="google" category="sans-serif"
        weights="400 600 700" styles="normal italic" />
  <font family="SF Pro" source="system" weights="400 600" styles="normal" />
</fonts>
```

`source` is one of `google`, `system`, or `unresolved`. Text nodes still carry their own `font-family` and `font-weight` — the fonts block makes those families resolvable.

### Assets

Images and vector artwork are embedded in the package under `assets/` and referenced inline — no declaration block, no `$id` indirection.

```xml
<!-- embedded raster — stored in assets/ inside the package -->
<img src="assets/hero.webp" w="320" h="200" fit="cover" />

<!-- embedded vector -->
<img src="assets/logo.svg" w="120" h="32" />

<!-- external URL — fallback only when embedding is not possible -->
<img src="https://example.com/photo.jpg" w="320" h="200" fit="cover" />
```

All raster images are converted to WebP by the plugin (0.85 quality). The renderer loads `assets/...` paths from the package and `https://` URLs from the network. If a URL reference fails to load, the renderer shows an `asset not loaded` error state — no silent failure.

### Components & Instances

Reusable UI building blocks. A `<components>` block at the top of the document holds all component definitions. Components declare their overridable surface area through a `<props>` block. Instances reference a component by id and pass values for those props as attributes.

#### `<component>` — Standalone component definition

```xml
<components>
  <component name="Card/Product" id="comp-card-product">
    <props>
      <prop name="title" type="text" target="title" />
      <prop name="show-badge" type="visible" target="show-badge" />
    </props>
    <col w="320" radius="12" fill="#fff">
      <text id="title" value="Product Name" font-size="18" font-weight="700" fill="#1C1C1E" />
      <rect id="show-badge" w="8" h="8" radius="4" fill="$red" />
    </col>
  </component>
</components>
```

#### `<component-set>` — Variant group

Maps to a Figma component set. Each `<variant>` is a member of the set and carries its own `<props>`.

```xml
<components>
  <component-set name="Button" id="compset-button">
    <variant id="comp-button-style-primary" style="primary">
      <props>
        <prop name="label" type="text" target="label" />
      </props>
      <row gap="8" p="12 24" fill="$primary" radius="8">
        <text id="label" value="Label" font-size="16" font-weight="600" fill="#fff" />
      </row>
    </variant>
    <variant id="comp-button-style-secondary" style="secondary">
      <props>
        <prop name="label" type="text" target="label" />
      </props>
      <row gap="8" p="12 24" fill="none" border="1.5 $primary" radius="8">
        <text id="label" value="Label" font-size="16" font-weight="600" fill="$primary" />
      </row>
    </variant>
  </component-set>
</components>
```

#### `<instance>` — Component usage

References a component or variant by `component` id. Prop overrides are inline attributes — prop name = override value.

```xml
<instance component="comp-card-product" x="24" y="120"
  title="Nike Air Max 90"
  show-badge="false" />

<instance component="comp-button-style-primary" x="24" y="400"
  label="Get Started" />
```

#### `<prop>` — Overridable property declaration

| Attr | Description |
|---|---|
| `name` | Prop name used as attribute on `<instance>` |
| `type` | `text` — text content override; `visible` — show/hide layer |
| `target` | Matches the `id` on the element inside the component body |

#### Prop types

| type | Effect |
|---|---|
| `text` | Overrides the text content (`value` attr) of the target layer |
| `visible` | Hides the target layer when set to `"false"` |

#### Two override approaches

**Declared props (recommended)** — the designer explicitly declares component properties in Figma's properties panel. These become a `<props>` block in the component definition. Prop targets are matched via Figma's internal prop reference, making them immune to duplicate layer names. The instance passes overrides using the prop name as the attribute key.

**Ad-hoc overrides** — the designer edits text or visibility directly on an instance without declaring a formal prop. The plugin detects these via `InstanceNode.overrides` in the Figma API and emits the sanitized layer name as the attribute key. No `<props>` block is needed.

```xml
<!-- Ad-hoc: no props declared, override matched by layer name -->
<components>
  <component name="Button/Primary" id="comp-button-primary">
    <row gap="8" p="12 24" fill="$primary" radius="8">
      <text id="label" value="Label" font-size="16" font-weight="600" fill="#fff" />
    </row>
  </component>
</components>

<instance component="comp-button-primary" x="24" y="400" label="Get Started" />
```

Ad-hoc overrides work as long as layer names are unique within the component. If two layers share the same name, only the first is addressable — declare formal props to avoid this edge case.

#### Id generation

Every node inside a component body is assigned `id` = its Figma layer name, sanitized to lowercase kebab-case (e.g. `"Button Label"` → `id="button-label"`). Duplicate names within a component are deduplicated: the first occurrence keeps the base id, subsequent occurrences get a numeric suffix (`id="icon"`, `id="icon-2"`, `id="icon-3"`, …).

Declared props match targets via Figma's internal prop reference — duplicate ids do not affect prop resolution. Ad-hoc overrides match by layer name — unique names are strongly recommended.

### Layout Tags

#### `<frame>` — Fixed container

Children are absolutely positioned. Maps to a Figma frame without auto-layout.

```xml
<frame w="390" h="844" fill="#FFFFFF" radius="16" clip>
  <text x="24" y="80" value="Hello" ... />
</frame>
```

#### `<stack>` — Auto-layout container

Children are flow-positioned. Maps to a Figma auto-layout frame.

```xml
<stack direction="vertical" gap="16" p="24 16"
       align="top-center"
       fill="#FFFFFF" radius="12">
  ...
</stack>
```

`direction` is `horizontal`, `vertical`, or `grid`. The `grid` direction is legacy — use the `<grid>` tag (RFC 032) for new work. Legacy grid adds `columns` (uniform column count), `gap`, and `align`.

**Sizing (`w` / `h`)**

On stack nodes, `w` and `h` are optional. Absent = hug content. Use `"fill"` to fill the parent, or a number for a fixed pixel size.

On `frame`, `shape`, `img`, and `svg` nodes, explicit `w` and `h` are normally required. **Exception:** a `frame` (or any node) that is a direct child of a `<grid>` with a `gc`/`gr` range does not need `w`/`h` — the range drives fill sizing instead.

**Padding (`p` / `pt` `pr` `pb` `pl`)**

`p` accepts CSS shorthand notation: `p="24"` sets all four sides; `p="24 16"` sets top/bottom + left/right; `p="8 16 12 16"` sets each side individually. Per-side attrs (`pt`, `pr`, `pb`, `pl`) override the shorthand when mixed.

**Gap**

`gap="16"` — fixed item spacing. `gap="auto"` (or bare `gap`) — space-between. Two-value `gap="16 10"` sets item gap + row gap (for `wrap` or `grid`).

**Align (9-point)**

`align` is a single 9-point position: `top-left`, `top-center`, `top-right`, `middle-left`, `middle-center`, `middle-right`, `bottom-left`, `bottom-center`, `bottom-right`. Also `stretch` and `baseline`. Replaces the old `align` + `justify` pair.

| Attr | Values | Default |
|---|---|---|
| `direction` | `horizontal`, `vertical`, `grid` | — |
| `gap` | `auto`, number, `"N N"` (item + row) | — |
| `align` | 9-point value (see above), `stretch`, `baseline` | `top-left` |
| `p` | CSS shorthand | — |
| `pt` `pr` `pb` `pl` | px | — |
| `wrap` | boolean presence | — |
| `columns` | number (legacy grid only — use `<grid cols="N">` instead) | — |

#### `<grid>` — Grid container (RFC 032)

The `<grid>` tag supports three modes determined by which attributes are present.

| Attrs present | Mode |
|---|---|
| `cols` and/or `rows` | Track grid — explicit track sizes, children placed by `gc`/`gr` |
| `unit` | Unit grid — fixed coordinate canvas, children placed by `gc`/`gr` |
| `cols`/`rows` + `unit` | ❌ Validation error — pick one |
| neither (legacy) | Auto-flow — `columns="N"` produces `repeat(N, 1fr)` |

**Sizing contract — universal across all modes**

`w` and `h` are always pixels. The fill-vs-hug decision on a grid child comes from whether `gc`/`gr` carries a range:

| `gc` / `gr` | `w` / `h` | Sizing |
|---|---|---|
| `"2/5"` (range) | absent | fills the spanned columns/rows (`100%`) |
| `"2/5"` (range) | `"80"` | 80 px fixed, anchored at the range start |
| `"2"` (start only) | absent | hugs content |
| `"2"` (start only) | `"80"` | 80 px fixed |

##### Mode 1 — Track Grid

Parent declares track sizes. Children declare which track they occupy via `gc`/`gr`.

**`<grid>` attrs — track mode**

| Attr | Example | Meaning |
|---|---|---|
| `cols` | `"3"` | 3 equal columns → `repeat(3, 1fr)` |
| | `"240 1fr"` | Mixed tracks — bare integer = px, explicit unit for `fr`/`auto`/`%` |
| | `"fill 200"` | Responsive — `repeat(auto-fill, minmax(200px, 1fr))` |
| `rows` | same rules | Row track sizes |
| `gap` | `"16"` / `"16 8"` | Column gap / row gap in px |
| `w`, `h` | existing | `fill` or fixed px |

Track template rules:
```
cols="3"        →  repeat(3, 1fr)
cols="240 1fr"  →  240px 1fr
cols="1fr 2fr"  →  1fr 2fr
cols="auto 1fr" →  auto 1fr
cols="fill 200" →  repeat(auto-fill, minmax(200px, 1fr))
```

**Child placement attrs — track mode**

| Attr | Example | Meaning |
|---|---|---|
| `gc` | `"1"` | Sit in column 1, hug content width |
| | `"2/5"` | Columns 2 through 5 inclusive — fills if no `w` |
| | `"1/-1"` | First to last column — spans all columns |
| `gr` | same rules | Row position |
| `col-span` | `"2"` / `"all"` | Span N columns from current position |
| `row-span` | `"2"` | Span N rows |

Range end is **inclusive** — `gc="2/5"` occupies columns 2, 3, 4, and 5 (CSS `grid-column: 2 / 6`). The `-1` sentinel is passed through as-is for full-span shorthand.

Children without `gc`/`gr` auto-flow into the next available cell.

```xml
<grid cols="200 1fr" rows="56 1fr" gap="0" w="fill" h="fill">

  <!-- gc range 1/-1 fills all columns; h="fill" added explicitly since gr has no range -->
  <row gc="1/-1" gr="1" h="fill" fill="#fff" p="0 20" align="middle-left" gap>
    <text value="Dashboard" font-size="17" font-weight="600" />
    <img w="28" h="28" radius="14" src="$avatar" />
  </row>

  <!-- gc="1" gr="2" — no range on either, no w/h → hugs; use fill on children instead -->
  <col gc="1" gr="2" fill="#f7f7f7" p="12" gap="2">
    <row w="fill" p="10 12" radius="8" fill="#007aff" align="middle-left">
      <text value="Home" fill="#fff" font-size="14" font-weight="500" />
    </row>
  </col>

  <col gc="2" gr="2" p="32" gap="16">
    <text value="Overview" font-size="22" font-weight="700" />
  </col>

</grid>
```

##### Mode 2 — Unit Grid

For floating, non-structured interfaces — overlapping cards, canvas-style components, dashboard widgets. Elements sit at intentional positions in a snapped coordinate space. Replaces `<frame>` + `abs` at component level.

**`<grid>` attrs — unit mode**

| Attr | Example | Meaning |
|---|---|---|
| `unit` | `"8"` | Each grid square = 8 px. Presence activates unit mode |
| `w` | `"320"` | Total canvas width in px |
| `h` | `"400"` | Total canvas height in px |

`w ÷ unit` and `h ÷ unit` give the column and row count of the coordinate space.

**Child placement attrs — unit mode**

| Attr | Example | Meaning |
|---|---|---|
| `gc` | `"5"` | Start at unit column 5, hug content width |
| | `"5/20"` | Unit columns 5 through 20 inclusive — fills if no `w` |
| `gr` | same rules | Unit row position |
| `w` | `"128"` | 128 px fixed width, positioned at `gc` start |
| `h` | `"48"` | 48 px fixed height, positioned at `gr` start |

`w` and `h` are always pixels. Use a `gc`/`gr` range for fill sizing, explicit `w`/`h` for fixed pixel sizing.

Children at overlapping coordinates stack in document order — first child is behind, last child is in front.

```xml
<grid unit="8" w="320" h="400" fill="#fff" radius="16">

  <!-- Cover: fills full width (cols 1–40) and 112px tall (rows 1–14) -->
  <img gc="1/40" gr="1/14" fit="cover" src="$cover" />

  <!-- Avatar: 128×128px fixed, positioned at col 13 row 9 -->
  <img gc="13" gr="9" w="128" h="128" fit="cover" radius="64" border="4 #fff" src="$avatar" />

  <!-- Online dot: 32×32px fixed -->
  <col gc="26" gr="21" w="32" h="32" fill="#34c759" radius="4" border="2 #fff" />

  <!-- Name + handle: fills cols 2–39, rows 27–32 -->
  <col gc="2/39" gr="27/32" align="middle-center" gap="2">
    <text value="Sarah Johnson" font-size="18" font-weight="700" fill="#111" />
    <text value="@sarahj" font-size="13" fill="#888" />
  </col>

  <!-- Stats: fills cols 2–39, rows 34–41 -->
  <row gc="2/39" gr="34/41" gap align="middle-center">
    <col w="fill" align="middle-center" gap="2">
      <text value="248" font-size="17" font-weight="700" />
      <text value="Posts" font-size="12" fill="#888" />
    </col>
    <col w="fill" align="middle-center" gap="2">
      <text value="12.4k" font-size="17" font-weight="700" />
      <text value="Followers" font-size="12" fill="#888" />
    </col>
  </row>

  <!-- Follow: 128×48px fixed -->
  <row gc="3" gr="44" w="128" h="48" fill="#007aff" radius="8" align="middle-center">
    <text value="Follow" fill="#fff" font-size="14" font-weight="600" />
  </row>

  <!-- Message: 128×48px fixed -->
  <row gc="22" gr="44" w="128" h="48" fill="#f0f0f0" radius="8" align="middle-center">
    <text value="Message" font-size="14" font-weight="600" fill="#111" />
  </row>

</grid>
```

##### `gc` / `gr` naming

`gc` = grid-column, `gr` = grid-row. Named to avoid collision with the `<col>` and `<row>` tag names:

```xml
<col gc="1" gr="2">      ← unambiguous
<row gc="1/-1" gr="1">   ← unambiguous
```

#### `<group>` — Logical grouping

No layout behavior. Children are absolutely positioned relative to the group origin.

```xml
<group x="0" y="0" w="390" h="200" opacity="0.8">
  ...
</group>
```

When the first child of a Figma group is a mask node, the plugin extracts the mask shape as an SVG asset and hoists it onto the `<group>` tag as `mask-src` / `mask-x` / `mask-y` / `mask-width` / `mask-height`. The mask child is excluded from the rendered children.

```xml
<group x="0" y="0" w="390" h="200"
       mask-src="assets/mask-2.svg" mask-x="0" mask-y="0" mask-width="390" mask-height="200">
  ...
</group>
```

| Attr | Notes |
|---|---|
| `mask-src` | Asset path (`assets/...`) for the SVG mask shape |
| `mask-x` / `mask-y` | Position of the mask relative to the group origin |
| `mask-width` / `mask-height` | Dimensions of the mask |

### Content Tags

#### `<text>` — Text node

Single-style text is self-closing with a `value` attribute. Mixed-style text has `<segment>` children.

```xml
<!-- Single style -->
<text value="Welcome back" x="24" y="80" w="200" h="32"
      font-family="Inter" font-postscript="Inter-Bold" font-size="22" font-weight="700"
      fill="#1C1C1E" line-height="28" />

<!-- Mixed styles -->
<text x="24" y="80" w="200">
  <segment value="Pay " fill="#6E6E73" font-size="16" />
  <segment value="$42.00" fill="#1C1C1E" font-size="16" font-weight="700" />
</text>

<!-- Variable font with OpenType features -->
<text value="Dashboard" font-family="Inter" font-size="28" font-weight="700"
      font-variation='"wght" 700, "opsz" 28'
      font-feature='"tnum", "ss01"'
      fill="#1C1C1E" />

<!-- Decorated text with color and style -->
<text value="On sale" font-family="Inter" font-size="16"
      decoration="underline" decoration-color="#FF3B30"
      decoration-style="wavy" decoration-thickness="2"
      fill="#1C1C1E" />

<!-- List item -->
<text value="First item" font-family="Inter" font-size="16"
      list="disc" list-level="0" fill="#1C1C1E" />
```

**Text attributes**

| Attr | Values | Notes |
|---|---|---|
| `value` | string | Text content. Present on single-style; absent on mixed-style |
| `font-family` | string | Font family name, e.g. `"Inter"` |
| `font-postscript` | string | PostScript name, e.g. `"Inter-Bold"` (best-effort) |
| `font-style-name` | string | Original style name from the font, e.g. `"Bold Italic"` |
| `font-size` | number | Font size in px |
| `font-weight` | `100`–`900` | Numeric weight |
| `font-style` | `"italic"` | Omitted when normal |
| `font-variation` | string | CSS `font-variation-settings` value, e.g. `'"wght" 600, "wdth" 75'` |
| `font-feature` | string | CSS `font-feature-settings` value, e.g. `'"tnum", "ss01"'` |
| `line-height` | number or `"n%"` | px or percent. Omitted when auto |
| `letter-spacing` | number or `"n%"` | px or percent. Omitted when 0 |
| `baseline-shift` | number | Baseline offset in px. Positive = up |
| `paragraph-spacing` | number | Space after each paragraph in px |
| `paragraph-indent` | number | First-line indent in px |
| `align` | `"left"`, `"center"`, `"right"`, `"justified"` | Horizontal alignment. Default `left` |
| `vertical-align` | `"top"`, `"center"`, `"bottom"` | Vertical alignment within fixed-height box |
| `text-style` | string | Named text style reference (omits individual font attrs) |
| `fill` | hex, gradient, token | Text color |
| `fill-style` | string | Named fill style reference |
| `decoration` | `"underline"`, `"strikethrough"` | Text decoration line |
| `decoration-color` | hex | Color of the decoration line |
| `decoration-style` | `"solid"`, `"dashed"`, `"dotted"`, `"wavy"`, `"double"` | Decoration line style |
| `decoration-thickness` | number | Decoration line thickness in px |
| `text-case` | `"uppercase"`, `"lowercase"`, `"capitalize"`, `"small-caps"` | Text transform |
| `leading-trim` | `"cap-height"` | Trims leading to cap height |
| `text-resize` | `"hug"`, `"hug-height"`, `"fixed"`, `"truncate"` | Sizing mode from the source tool |
| `truncate` | boolean presence | Clip text with ellipsis when it overflows |
| `max-lines` | number | Maximum lines before clipping |
| `overflow` | `"clip"`, `"ellipsis"` | Explicit overflow behavior |
| `list` | `"disc"`, `"decimal"` | List marker type |
| `list-level` | number | List nesting depth (0-based) |
| `list-marker` | string | Custom marker string |
| `href` | URL | Wraps text in a hyperlink |

All segment-level attrs override text-level attrs for that segment. Segment attrs are a subset: `value`, `font-family`, `font-postscript`, `font-style-name`, `font-size`, `font-weight`, `font-style`, `font-variation`, `font-feature`, `line-height`, `letter-spacing`, `baseline-shift`, `fill`, `decoration`, `decoration-color`, `decoration-style`, `decoration-thickness`, `text-case`, `list`, `list-level`, `href`.

#### `<img>` — Image and vector asset

`<img>` handles both raster and vector assets. The renderer detects format from the file extension at render time — the author only writes `src`, `w`, and `h`.

```xml
<!-- raster — embedded in package -->
<img name="Hero Image" src="assets/hero.webp" x="0" y="0" w="390" h="240"
     fit="cover" radius="12" />

<!-- vector icon — embedded in package -->
<img src="assets/icon-close.svg" w="24" h="24" />

<!-- external URL — fallback only -->
<img src="https://example.com/photo.jpg" w="390" h="240" fit="cover" />
```

`fit` is `cover`, `contain`, `fill`, or `none`. The `name` attr carries the Figma layer name.

### Geometry Tags

#### `<rect>` — Rectangular box

Sugar for a childless `<frame>`. Signals decorative intent — no layout children. `w` and `h` are required.

```xml
<rect fill="$primary" w="340" h="52" />
<rect fill="$surface" w="320" h="64" radius="12" border="$line" />
<rect fill="none" border="2 dashed $focus inside" w="320" h="64" radius="8" />
```

Supports all visual attributes: `fill`, `border`, `radius`, `opacity`, `blend`, `rotation`, `appearance`. Does not accept layout attributes (`direction`, `gap`, `p`, `align`).

#### `<ellipse>` — Oval or circle

Sugar for `<frame radius="9999">`. Full-radius rendering is the contract — `radius` is not an attribute on `<ellipse>`. Equal dimensions produce a circle.

```xml
<ellipse fill="#FF3B30" w="8" h="8" />      <!-- circle -->
<ellipse fill="$blue" w="80" h="40" />      <!-- oval -->
<ellipse fill="none" border="2 $ink" w="48" h="48" />
```

Arc and donut shapes (progress rings, pie segments) are SVG assets referenced via `<img>`.

#### `<line>` — Separator

Sugar for a thin frame used as a visual divider. Default: horizontal, `thickness="1"`, `w="fill"`.

```xml
<line fill="$border" />                        <!-- horizontal, 1px, fill width -->
<line fill="$border" direction="vertical" />   <!-- vertical, 1px, fill height -->
<line fill="$gold" thickness="2" />            <!-- custom thickness -->
```

### Appearance Block

Used when a node has multiple fills, complex borders, or multiple effects. A non-layout child that describes the parent's complete paint and effect stack.

```xml
<frame w="320" h="180">
  <appearance>
    <fill type="image" src="assets/hero.webp" fit="crop" x="12" y="8" w="640" h="360" />
    <fill type="linear-gradient" value="linear-gradient(180deg, #00000000 0%, #00000099 100%)" blend="multiply" opacity="0.8" />
    <border color="$line" w="1" align="inside" />
    <effect type="drop-shadow" x="0" y="8" radius="24" spread="0" color="#00000033" />
  </appearance>
  ...
</frame>
```

All three stacks — fills, borders, effects — are ordered in document order. Simple single-paint cases use `fill="..."` directly on the element; simple single-border cases use the `border="..."` shorthand. Use `<appearance>` only when multiple layers, border stacks, or paint-level metadata (opacity, blend, transform) are needed.

`fill` types: `color`, `linear-gradient`, `radial-gradient`, `angular-gradient`, `image`.

`fill` attributes:

| Attr | Description | Notes |
|---|---|---|
| `type` | `color`, `linear-gradient`, `radial-gradient`, `angular-gradient`, `image` | Required |
| `value` | Hex color or gradient CSS string | For color and gradient fills |
| `src` | Asset path (`assets/img.webp`) | For image fills |
| `fit` | `cover`, `contain`, `crop`, `tile`, `fill`, `none` | Image scaling mode |
| `opacity` | `0`–`1` | Paint-level opacity; omitted when `1` |
| `blend` | `multiply`, `screen`, `overlay`, `darken`, `lighten`, ... | Paint-level blend mode; omitted when `normal` |
| `visible` | `false` | Emitted only for hidden paints that must be preserved |
| `x` / `y` | number | Crop offset in pixels (when `fit="crop"`) |
| `w` / `h` | number | Crop image dimensions in pixels (when `fit="crop"`) |
| `transform` | string | Compact transform matrix for exact gradient/image mapping |

`border` attributes (inside `<appearance>`):

| Attr | Description | Notes |
|---|---|---|
| `color` | Solid color or token ref | |
| `paint` | Gradient value for gradient borders | DOM renderer uses first solid stop as fallback |
| `w` | Stroke width in px | |
| `align` | `inside`, `center` (default), `outside` | |
| `style` | `solid` (default), `dashed`, `dotted` | |
| `dash` | Explicit dash pattern, e.g. `4 2` | SVG renderers only |
| `cap` | `butt`, `round`, `square`, `arrow-lines`, `arrow-equilateral` | SVG renderers only |
| `join` | `miter`, `round`, `bevel` | SVG renderers only |
| `opacity` | Border-level opacity | |
| `blend` | Border-level blend mode | |
| `visible` | `false` | Preserve hidden borders without rendering |

When `<appearance>` contains at least one `<border>`, the `border` shorthand on the parent element is ignored — the appearance stack owns all border rendering.

`effect` types:

| Type | Attrs | Notes |
|---|---|---|
| `drop-shadow` | `x y radius spread color blend` | |
| `inner-shadow` | `x y radius spread color blend` | |
| `layer-blur` | `radius` | Normal Figma layer blur |
| `background-blur` | `radius` | Figma background blur |
| `glass` | `radius saturation` | Figma glass/frosted effect. `saturation` is a percentage (e.g. `180` = 180%). |

### Fill Values

The `fill` attribute accepts:

| Value | Example |
|---|---|
| Hex opaque | `#1C1C1E` |
| Hex with alpha | `#1C1C1ECC` (last byte is alpha) |
| Linear gradient | `linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)` |
| Radial gradient | `radial-gradient(circle at 50% 30%, #FFF 0%, #000 100%)` |
| Angular gradient | `conic-gradient(from 0deg at 50% 50%, #F00 0deg, #00F 360deg)` |
| Token | `$primary` |

### Shared Visual Attributes

These apply to all layout, content, and geometry nodes:

| Attr | Values | Notes |
|---|---|---|
| `name` | string | Figma layer name |
| `opacity` | `0`–`1` | Omitted when `1` |
| `blend` | `multiply`, `screen`, `overlay`, `darken`, `lighten`, `linear-burn`, `linear-dodge`, ... | Omitted when `normal` or `pass-through` |
| `mask` | boolean presence | Alpha mask for subsequent siblings |
| `rotation` | degrees | Omitted when `0` |
| `constraint-h` | `right`, `center`, `scale`, `stretch` | `left` is default, omitted |
| `constraint-v` | `bottom`, `center`, `scale`, `stretch` | `top` is default, omitted |
| `w` | number, `"fill"` | Width. On stack/row/col: absent = hug. On frame/rect/ellipse/img/group: required |
| `h` | number, `"fill"` | Height. On stack/row/col: absent = hug. On frame/rect/ellipse/img/group: required |
| `abs` | boolean presence | Absolute child inside an auto-layout parent |
| `min-width` / `max-width` | px | Omitted when unset |
| `min-height` / `max-height` | px | Omitted when unset |
| `border` | shorthand string | Outline — `"[width] [color] [style] [align]"`. Defaults: `1 solid center`. Example: `"2 #333 dashed inside"` |
| `border-color` | color | Longhand — border color only |
| `border-width` | px | Longhand — border width only |
| `border-style` | `solid`, `dashed`, `dotted` | Longhand — border style only |
| `border-align` | `inside`, `center`, `outside` | Longhand — border alignment only |
| `border-top` | shorthand | Top edge only — `"[width] [color] [style]"`. Always inside-aligned |
| `border-right` | shorthand | Right edge only |
| `border-bottom` | shorthand | Bottom edge only |
| `border-left` | shorthand | Left edge only |

**`w` / `h` sizing rules**

| Node type | Absent means | `"fill"` | number |
|---|---|---|---|
| `stack`, `row`, `col` | hug content | fill parent | fixed px |
| `text` | hug content | fill parent | fixed px |
| `frame`, `rect`, `ellipse`, `img`, `group` | **required — must provide a value** | fill parent | fixed px |
| `line` | `w` defaults to `fill`, `h` defaults to `thickness` | — | fixed px |

**Boolean presence convention**

Bare attributes without a value are treated as `true`. `<frame clip>` = `<frame clip="true">`. Applies to: `clip`, `mask`, `wrap`, `abs`, `truncate`, `reverse-z`.


---

## The Toolchain

### dotgui-figma

The Figma plugin. Select any visible layer — frame, component, group, shape, text, or vector — and export it as `.gui`. The plugin:

- Traverses the Figma layer tree and maps each node to its `.gui` equivalent
- Extracts and encodes all image fills as WebP (0.85 quality) via the Canvas API
- Emits RECTANGLE nodes as `<rect>`, ELLIPSE (no arc) as `<ellipse>`, LINE as `<line>`
- Exports VECTOR, STAR, POLYGON, BOOLEAN_OPERATION, and arc/donut ELLIPSE nodes as SVG assets stored in `assets/` and referenced via `<img src="assets/...">`
- Exports complex multi-layer graphic clusters (groups of graphic-only leaves) as SVG assets in `assets/`
- Resolves Figma Variables to `<tokens>` entries and emits `$token-name` references inline
- Resolves Figma Styles (text, fill, effect) to `<styles>` entries and emits `text-style`/`fill-style`/`effect-style` refs
- Handles mask groups: extracts the mask shape as an SVG asset, hoists it to `mask-src` on `<group>`
- Computes gradient angles and positions from Figma's transform matrices
- Collects font usage and validates families against the Google Fonts catalog
- Generates a PNG preview thumbnail

The extractor is deterministic. Given the same Figma layer, it always produces the same output. It does not guess, summarize, or interpret.

### gui-optimizer

A post-processing pipeline that converts raw extractor output into a cleaner, smaller, more semantically rich `.gui` file.

The optimizer is also deterministic, non-AI, and rule-based. It does not invent meaning. Every transformation either provably preserves the visual render or is skipped and logged.

**The one rule above all: visual impact must be zero.**

#### Pass Order

Rules run in eight passes, each operating on the output of the previous:

| Pass | Responsibility | Rules |
|---|---|---|
| 1 | Remove invisible and empty nodes | Remove nodes with `visible=false`, `opacity=0`, zero dimensions, or empty text content |
| 2 | Remove no-op effects | Drop effects below perceptibility thresholds (shadow opacity `< 0.05`, blur `< 0.5px`, border width `< 0.5px`) |
| 3 | Normalize values | Uniform color format, collapsed corner radius, rounded floating-point coordinates |
| 4 | Flatten structure | Remove single-child wrapper frames with no visual role; collapse parents and children with identical bounds |
| 5 | Infer layout | Detect vertical/horizontal stacks from child positions (±2px tolerance); detect grid patterns; extract padding |
| 6 | Deduplicate | Remove identical image/SVG assets, remap references to the canonical copy |
| 7 | Final reduction | Re-run flatten pass after layout normalization catches newly eligible nodes |
| 8 | Attach metadata | Add optimizer version, stats, and timing to the output document |

#### Skip Behavior

When a rule cannot be safely applied — ambiguous z-order, uncertain bounds, a protected node — it skips the node, logs the reason, and moves on. The optimizer always produces a valid output file. A skipped rule never causes a failure.

#### Guard Rules

Certain rules are permanent constraints enforced across all passes:

- **Preserve masks** — Never flatten or remove nodes responsible for clipping or masking
- **Preserve z-order** — No transformation may alter visual stacking order
- **Preserve responsive metadata** — Constraints, auto-layout settings, and breakpoints are never stripped
- **Preserve component instances** — Component instance references, IDs, and variant properties are never altered

#### Rule Files

Each rule lives in its own TypeScript file under `gui-optimizer/src/rules/`. The `rules/index.ts` exports two arrays:

- `ALL_RULES` — every rule including guards, for documentation and tooling
- `PIPELINE` — the active execution order, guards excluded

Adding, removing, or reordering rules is a one-line change in `index.ts`.

### dotgui-render

A standalone TypeScript library with zero dependencies. Takes a `.gui` document string and renders it into a live DOM container.

```typescript
import { render } from 'dotgui-render'

const setZoom = render(guiCode, containerEl)
setZoom?.(1)   // fit to container
setZoom?.(2)   // 2× zoom
```

With a pre-built asset map (package caller resolves `assets/` paths to data URLs before passing in):

```typescript
const assetMap = {
  'assets/hero.webp': 'data:image/webp;base64,...',
  'assets/logo.svg': 'data:image/svg+xml;base64,...',
}
render(guiCode, containerEl, assetMap)
```

The renderer handles: auto-layout (flex and grid), absolute positioning, gradients, shadows, blur effects, blend modes, image fills with crop/fit modes, raster and SVG assets via `<img>`, `<rect>` / `<ellipse>` / `<line>` geometry tags, ordered border stacks (including per-side borders), mixed-style text, font loading (Google Fonts), and zoom via CSS `zoom`. Text rendering includes variable font axes (`font-variation-settings`), OpenType features (`font-feature-settings`), baseline shift, decoration color/style/thickness, list markers, and overflow control.

Returns a zoom setter or `null` if parsing fails.

---

## Design Decisions

### Why XML, not JSON?

XML has one property JSON does not: **the tag name carries semantic meaning separate from the data**. `<stack direction="horizontal">` reads as a horizontal stack. The equivalent JSON — `{ "type": "stack", "direction": "horizontal" }` — reads as a database record. The `"type"` key is a workaround for something XML gets for free.

XML also has a natural hierarchy that matches UI trees. Nesting communicates containment. Attributes communicate properties. Children communicate children. This is the same instinct behind SVG, JSX, and HTML — tag-based syntax is how UI structure is naturally described.

For AI consumption specifically, this matters even more. Models are trained on enormous amounts of tag-based markup. Asking an LLM to write a `.gui` layout is like asking it to write JSX — it already knows the pattern cold.

Attribute values follow two conventions: **literals** (`color="#1C1C1E"`, `gap="16"`) and **functions** (`fill="linear-gradient(135deg, #FF6B6B, #4ECDC4)"`). Function syntax is borrowed directly from CSS — no new vocabulary to learn.

### Why not SVG?

SVG is a drawing format. It has no concept of layout, no auto-layout, no semantic text nodes, no design tokens, and no structured component hierarchy. It cannot distinguish between a button and a decorative rectangle. An AI reading SVG sees shapes. An AI reading `.gui` sees structure.

### Why not keep Figma's own data model?

Figma's API returns raw authoring state — a 1:1 snapshot of every property in the editor, including defaults, overrides, legacy values, and implementation details of Figma's rendering engine. It's designed for Figma plugins to read, not for downstream tools to consume.

`.gui` is an export format. It carries what matters for rendering and reasoning, stripped of authoring noise, using names that mean what they say.

### Why is the optimizer separate from the extractor?

The extractor runs inside the Figma plugin sandbox, which has strict browser constraints and no filesystem access. It has one job: faithfully capture the design as structured text, as fast as possible.

The optimizer runs after extraction, in any environment, on any input — whether it came from the Figma plugin, a hand-written `.gui` file, or a code generator. The separation makes both tools simpler and makes the pipeline tool-agnostic. Any extractor can produce `raw.gui`. The optimizer does not care where it came from.

### Why no AI in the pipeline?

Consistency. A deterministic pipeline always produces the same output for the same input. It can be tested, diffed, and trusted. An AI step introduces variability — the output might change between runs, between model versions, or with different prompts.

The optimizer's job is structural cleanup, not interpretation. Interpretation is the AI agent's job, downstream.

---

## What's in v1.0

- `.gui` format spec with full Figma layer coverage
- Figma plugin for export
- `dotgui-render` renderer (TypeScript, zero deps)
- `gui-optimizer` with 21 rules across 8 passes
- Inline and packaged export formats
- Asset deduplication and WebP conversion
- `<component>`, `<component-set>`, and `<instance>` — component definitions and reuse

## Deferred to v2

- `<scroll>` — scrollable containers
- `<overlay>` / `<sheet>` — modal and bottom sheet layers
- Semantic roles — `role="button|input|nav"`
- ~~Named text style tokens~~ *(shipped in v1)*
- Interactions and prototyping metadata
- Platform and theme variants on root
- W3C composite token types — `shadow`, `typography`, `border`
- `gui-optimizer` style token resolution in the renderer (rule-08)
