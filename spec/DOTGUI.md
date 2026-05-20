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
<gui version="0.2" name="Checkout" viewport="390x844">
  <tokens>
    <color name="primary" value="#007AFF" />
    <number name="space-md" value="16" />
  </tokens>
  <fonts>
    <font family="Inter" source="google" weights="400 600 700" styles="normal" />
  </fonts>
  <assets>
    <image id="img-1" format="webp" src="assets/img-1.webp" />
    <image id="svg-1" format="svg" src="assets/svg-1.svg" />
  </assets>
  <stack direction="vertical" fill="#F2F2F7" gap="16" p="24">
    <text value="Checkout" font-family="Inter" font-size="28" font-weight="700" color="#1C1C1E" />
    ...
  </stack>
</gui>
```

### Root Element

| Attr | Description |
|---|---|
| `version` | Spec version (`0.2`) |
| `name` | Screen or layer name |
| `viewport` | Canvas size as `WxH` |

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
<shape type="rect" fill="$primary" radius="$radius-card" />
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
<text text-style="Heading/H1" value="Welcome" x="24" y="80" color="#1C1C1E" />
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

Embedded images and vector artwork. All raster images are converted to WebP by the plugin.

```xml
<assets>
  <image id="img-1" format="webp" src="base64:..." />
  <image id="svg-1" format="svg" src="base64:..." />
</assets>
```

Reference with `$id`, or use an external URL directly:
```xml
<img src="$img-1" w="320" h="200" fit="cover" />
<img src="https://example.com/photo.jpg" w="320" h="200" fit="cover" />
```

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
      <text id="title" value="Product Name" font-size="18" font-weight="700" color="#1C1C1E" />
      <shape id="show-badge" type="rect" w="8" h="8" radius="4" fill="$red" />
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
        <text id="label" value="Label" font-size="16" font-weight="600" color="#fff" />
      </row>
    </variant>
    <variant id="comp-button-style-secondary" style="secondary">
      <props>
        <prop name="label" type="text" target="label" />
      </props>
      <row gap="8" p="12 24" fill="none" stroke="$primary" stroke-width="1.5" radius="8">
        <text id="label" value="Label" font-size="16" font-weight="600" color="$primary" />
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
      <text id="label" value="Label" font-size="16" font-weight="600" color="#fff" />
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

`direction` is `horizontal`, `vertical`, or `grid`. Grid adds `columns`, `gap` (two-value for column + row gap), and `align`.

**Sizing (`w` / `h`)**

On stack nodes, `w` and `h` are optional. Absent = hug content. Use `"fill"` to fill the parent, or a number for a fixed pixel size. All other node types (`frame`, `shape`, `img`, `svg`) require explicit `w` and `h`.

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
| `columns` | number (grid only) | — |

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
       mask-src="$svg-2" mask-x="0" mask-y="0" mask-width="390" mask-height="200">
  ...
</group>
```

| Attr | Notes |
|---|---|
| `mask-src` | Asset ref (`$id`) for the SVG mask shape |
| `mask-x` / `mask-y` | Position of the mask relative to the group origin |
| `mask-width` / `mask-height` | Dimensions of the mask |

### Content Tags

#### `<text>` — Text node

Single-style text is self-closing with a `value` attribute. Mixed-style text has `<segment>` children.

```xml
<!-- Single style -->
<text value="Welcome back" x="24" y="80" w="200" h="32"
      font-family="Inter" font-size="22" font-weight="700"
      color="#1C1C1E" line-height="28" />

<!-- Mixed styles -->
<text x="24" y="80" w="200" h="32">
  <segment value="Hello " font-size="16" font-weight="400" color="#6E6E73" />
  <segment value="World"  font-size="16" font-weight="700" color="#1C1C1E" />
</text>
```

#### `<img>` — Raster image

```xml
<img name="Hero Image" src="$img-1" x="0" y="0" w="390" h="240"
     fit="cover" radius="12" />
```

`src` accepts an asset reference (`$id`) or an external URL:

```xml
<img src="https://example.com/photo.jpg" w="390" h="240" fit="cover" />
```

`fit` is `cover`, `contain`, `fill`, or `none`. The `name` attr carries the Figma layer name.

#### `<svg>` — Vector artwork

Two modes: **asset reference** or **inline content**.

**Asset reference** — `src` points to an `<assets>` entry or an external URL. Used for complex graphic clusters exported from Figma — boolean operations, compound vectors, multi-layer icon groups.

```xml
<svg name="Icon / Close" src="$svg-1" x="24" y="24" w="48" h="48" />
```

**Inline content** — no `src`. Children are raw SVG elements rendered directly into a `<svg viewBox="0 0 w h">` container. No `<assets>` entry required.

```xml
<svg w="48" h="48">
  <circle cx="24" cy="24" r="20" fill="#007AFF" />
  <path d="M12 24l8 8 16-16" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" />
</svg>
```

The distinction is `src` presence. When `src` is absent, all XML children are serialized and set as the content of the SVG element. Inline content is not validated by the `.gui` parser — invalid SVG children will fail at render time, not parse time.

Inline SVG is primarily useful for AI-generated `.gui` and hand-authored files where the SVG markup is available directly and going through the asset pipeline would add unnecessary overhead. See [RFC 0020](../rfcs/0020-svg-inline-content.md) for the full rationale.

The `name` attr carries the Figma layer name (asset reference mode only).

### Shape Tag

```xml
<!-- Rectangle -->
<shape type="rect" x="0" y="0" w="340" h="52"
       fill="$primary" radius="12" />

<!-- Ellipse -->
<shape type="ellipse" x="12" y="12" w="8" h="8" fill="#FF3B30" />

<!-- Arc / donut segment -->
<shape type="ellipse" x="0" y="0" w="100" h="100"
       fill="#007AFF" arc-start="0" arc-end="270" arc-inner="0.6" />

<!-- Line -->
<shape type="line" x="0" y="100" w="390"
       stroke="#E5E5EA" stroke-width="1" />

<!-- Path (vector / boolean operation / star / polygon) — filled -->
<shape type="path" x="12" y="12" w="24" h="24" fill="#1C1C1E">
  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
</shape>

<!-- Path — stroked outline (Lucide / icon pattern) -->
<shape type="path" x="12" y="12" w="24" h="24" fill="none" stroke="#6366F1" stroke-width="1.5">
  <path d="M5 12h14M12 5l7 7-7 7" />
</shape>
```

`type="path"` is used for VECTOR, STAR, POLYGON, and BOOLEAN_OPERATION nodes. The SVG path data is emitted as a `<path d="..." />` child element. `fill-style` and `effect-style` attrs apply the same way as on `rect` and `ellipse`.

`fill="none" stroke="..." stroke-width="..."` produces a stroked outline path with no fill — the standard pattern for stroke-only icons (Lucide, Heroicons, etc.). `stroke-position` (`center` | `inside` | `outside`) is also supported and mirrors Figma's stroke alignment.

### Appearance Block

Used when a node has multiple fills, image fills, or complex effects. A non-layout child that describes the parent's paint and effect stack.

```xml
<frame w="320" h="180">
  <appearance>
    <fill type="image" src="$img-1" fit="cover" />
    <fill type="color" value="#00000066" />
    <effect type="drop-shadow" x="0" y="8" radius="24" spread="0" color="#00000033" />
  </appearance>
  ...
</frame>
```

`fill` types: `color`, `linear-gradient`, `radial-gradient`, `angular-gradient`, `image`.

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

These apply to all layout, content, and shape nodes:

| Attr | Values | Notes |
|---|---|---|
| `name` | string | Figma layer name |
| `opacity` | `0`–`1` | Omitted when `1` |
| `blend` | `multiply`, `screen`, `overlay`, `darken`, `lighten`, `linear-burn`, `linear-dodge`, ... | Omitted when `normal` or `pass-through` |
| `mask` | boolean presence | Alpha mask for subsequent siblings |
| `rotation` | degrees | Omitted when `0` |
| `constraint-h` | `right`, `center`, `scale`, `stretch` | `left` is default, omitted |
| `constraint-v` | `bottom`, `center`, `scale`, `stretch` | `top` is default, omitted |
| `w` | number, `"fill"` | Width. On stack/row/col: absent = hug. On frame/shape/img/svg: required |
| `h` | number, `"fill"` | Height. On stack/row/col: absent = hug. On frame/shape/img/svg: required |
| `abs` | boolean presence | Absolute child inside an auto-layout parent |
| `min-width` / `max-width` | px | Omitted when unset |
| `min-height` / `max-height` | px | Omitted when unset |

**`w` / `h` sizing rules**

| Node type | Absent means | `"fill"` | number |
|---|---|---|---|
| `stack`, `row`, `col` | hug content | fill parent | fixed px |
| `text` | hug content | fill parent | fixed px |
| `frame`, `shape`, `img`, `svg`, `group` | **required — must provide a value** | fill parent | fixed px |

**Boolean presence convention**

Bare attributes without a value are treated as `true`. `<frame clip>` = `<frame clip="true">`. Applies to: `clip`, `mask`, `wrap`, `abs`, `truncate`, `reverse-z`.


---

## The Toolchain

### dotgui-figma

The Figma plugin. Select any visible layer — frame, component, group, shape, text, or vector — and export it as `.gui`. The plugin:

- Traverses the Figma layer tree and maps each node to its `.gui` equivalent
- Extracts and encodes all image fills as WebP via the Canvas API
- Emits VECTOR, STAR, POLYGON, and BOOLEAN_OPERATION nodes as `<shape type="path">` with inline SVG path data
- Exports complex multi-layer graphic clusters (groups of graphic-only leaves) as `<svg>` assets
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
| 2 | Remove no-op effects | Drop effects below perceptibility thresholds (shadow opacity `< 0.05`, blur `< 0.5px`, stroke `< 0.5px`) |
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

With a pre-built asset map (avoids re-parsing large base64 blobs):

```typescript
const assetMap = {
  '$img-1': 'data:image/webp;base64,...',
  '$svg-1': 'data:image/svg+xml;base64,...',
}
render(guiCode, containerEl, assetMap)
```

The renderer handles: auto-layout (flex and grid), absolute positioning, gradients, shadows, blur effects, blend modes, image fills with crop/fit modes, SVG embedding, mixed-style text, font loading (Google Fonts), arc shapes, and zoom via CSS `zoom`.

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
