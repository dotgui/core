# dotgui v0.2 — authoring reference

This is the spec you write against. Every tag and attribute Claude emits must appear here.

## Table of contents

1. [Document shape](#document-shape)
2. [Tokens](#tokens)
3. [Styles](#styles)
4. [Fonts](#fonts)
5. [No Assets Block (Inline Assets)](#no-assets-block-inline-assets)
6. [Layout tags](#layout-tags)
7. [Content tags](#content-tags)
8. [Helper tags (rect, ellipse, line)](#helper-tags)
9. [Appearance block](#appearance-block)
10. [Components & instances](#components--instances)
11. [Shared visual attributes](#shared-visual-attributes)
12. [Fill values](#fill-values)
13. [Boolean attributes](#boolean-attributes)

---

## Document shape

Every `.gui` markup file looks like this:

```xml
<gui version="0.2" name="ScreenName">
  <tokens>...</tokens>            <!-- optional, but recommended -->
  <styles>...</styles>            <!-- optional -->
  <fonts>...</fonts>              <!-- optional but needed if using custom fonts -->
  <components>...</components>    <!-- optional -->

  <!-- exactly one root layout node, e.g. -->
  <col w="390" fill="#FFFFFF" p="24" gap="16">
    ...
  </col>
</gui>
```

- Root is always `<gui>` with `version="0.2"` and a `name` attribute.
- Metadata blocks (`tokens`, `styles`, `fonts`, `components`) precede the layout root.
- Exactly **one** root layout node.

### Choosing the root canvas

| Root | Use when | `h` attribute |
| --- | --- | --- |
| `<col w="390">` | Content-driven screen (AI-authored, scrolling content) | absent — hugs children |
| `<frame w="390" h="844">` | Fixed-size artboard (e.g. an iPhone screen with everything pinned) | required |

**Default to `<col>`.** It cannot clip content and matches how Claude-authored designs flow.

---

## Tokens

Design system primitives. Declared once, referenced as `$name` anywhere.

```xml
<tokens>
  <color name="primary" value="#007AFF" />
  <color name="bg" value="#F2F2F7" />
  <number name="radius-card" value="12" />
  <number name="space-md" value="16" />
  <string name="font-base" value="Inter" />
</tokens>
```

Reference example:

```xml
<rect fill="$primary" radius="$radius-card" w="340" h="52" />
<col gap="$space-md" p="$space-md" fill="$bg">...</col>
```

Three token types: `color`, `number`, `string`. References resolve at render time.

---

## Styles

Named typography styles. Each `<text-style>` is a complete typography definition.

```xml
<styles>
  <text-style name="Heading/H1" font-family="Inter" font-size="32" font-weight="700" line-height="40" />
  <text-style name="Body/Regular" font-family="Inter" font-size="16" font-weight="400" line-height="24" />
  <text-style name="Caption" font-family="Inter" font-size="13" font-weight="400" line-height="18" />
</styles>
```

Apply on a `<text>` node with `text-style="Heading/H1"`. The text node still carries its own `color` and layout attrs (those are not part of the text style).

```xml
<text text-style="Heading/H1" value="Welcome" color="#1C1C1E" />
```

---

## Fonts

Declare what's needed so the renderer can load them.

```xml
<fonts>
  <font family="Inter" source="google" weights="400 500 600 700" styles="normal" />
  <font family="SF Pro" source="system" weights="400 600 700" styles="normal" />
</fonts>
```

`source`: `google` | `system` | `unresolved`. Text nodes still carry `font-family` — the `<fonts>` block makes those families resolvable.

---

## No Assets Block (Inline Assets)

There is no separate `<assets>` block in `version="0.2"`. All images and vector graphics are declared inline using `<img>` pointing directly to relative `assets/` paths or public URLs.

```xml
<!-- Packed relative asset -->
<img src="assets/hero.webp" w="320" h="200" fit="cover" />

<!-- Packed vector asset -->
<img src="assets/logo.svg" w="120" h="32" />

<!-- External URL asset -->
<img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=320&h=200&fit=crop" w="320" h="200" fit="cover" />
```

For icons, always load them using fully qualified URLs (e.g. from Iconify like `https://api.iconify.design/lucide/home.svg?color=%23ffffff`).

---

## Layout tags

### `<frame>` — fixed container, absolutely positioned children

```xml
<frame w="390" h="844" fill="#FFFFFF" radius="16" clip>
  <text x="24" y="80" value="Hello" font-family="Inter" font-size="22" font-weight="700" color="#1C1C1E" />
</frame>
```

Children use `x` / `y` for position. `clip` is a boolean — present means children are clipped to the frame bounds.

### `<col>` / `<row>` / `<grid>` — auto-layout container, flow-positioned children

`<col>` is shorthand for `<stack direction="vertical">`. `<row>` is shorthand for `<stack direction="horizontal">`. `<grid>` is shorthand for `<stack direction="grid">`. Use these tag names directly.

```xml
<col w="390" fill="#FFFFFF" gap="16" p="24">
  <text value="Title" font-family="Inter" font-size="28" font-weight="700" color="#1C1C1E" />
  <row gap="12" align="middle-left">
    <img src="assets/avatar.webp" w="48" h="48" radius="24" fit="cover" />
    <text value="Jane Smith" font-family="Inter" font-size="17" font-weight="600" color="#1C1C1E" />
  </row>
</col>
```

#### `<grid>` — Advanced Grid Layouts (RFC 032)

The `<grid>` tag provides a powerful, highly flexible grid container. It supports three layout modes depending on which attributes are present:

1. **Track Grid Mode** (`cols` and/or `rows` present): Explicit pixel track sizing. Children are placed using `gc` (grid column) and `gr` (grid row) track ranges.
2. **Unit Grid Mode** (`unit` present): Uses a coordinate canvas where each coordinate represents `unit` pixels. Children are placed using `gc` and `gr` coordinates.
3. **Auto-flow Mode** (neither present): Legacy uniform grid layout where columns are distributed evenly based on `columns="N"` (equal to `repeat(N, 1fr)`).

> [!WARNING]
> Specifying both `cols`/`rows` track sizes AND a `unit` grid on the same `<grid>` container is a validation error. Pick one.

##### Attributes on `<grid>`:
| Attr | Value / Type | Mode | Description |
| --- | --- | --- | --- |
| `cols` | Space-separated list of pixel track sizes (e.g., `cols="260 340 220"`) | Track Grid | Defines horizontal column track sizes |
| `rows` | Space-separated list of pixel track sizes (e.g., `rows="280 320"`) | Track Grid | Defines vertical row track sizes |
| `unit` | Pixels (e.g., `unit="20"`) | Unit Grid | Defines grid cell coordinate unit size |
| `columns` | Number (e.g., `columns="3"`) | Auto-flow | Sets uniform column count (legacy shorthand) |
| `gap` | Number or `"col-gap row-gap"` (e.g., `"20 16"`) | All | Spacing between grid cells |
| `p` | CSS shorthand padding (e.g. `"24"`, `"24 16"`) | All | Container internal padding |
| `align` | 9-point alignment or `stretch`/`baseline` | All | Align children in their tracks. Default `top-left` |

##### Placement Attributes on Grid Children:
| Attr | Value / Format | Description |
| --- | --- | --- |
| `gc` | `"start/end"` range (e.g., `"1/3"`) or single number | Placed from column `start` to column `end` |
| `gr` | `"start/end"` range (e.g., `"2/4"`) or single number | Placed from row `start` to row `end` |

##### Sizing Contract on Grid Children:
* If `gc` or `gr` is a range (e.g., `gc="1/3"`), leaving `w` or `h` **absent** will automatically stretch the child to fill the spanned columns or rows.
* If `w` or `h` is set to a pixel number, it overrides the track sizing and centers the child inside the track (subject to alignment).

##### Examples:

**Track Grid Example (Brutalist card layout):**
```xml
<grid cols="260 340 220" rows="280 320" gap="20" w="860">
  <col gc="1/2" gr="1/2" fill="$green" /> <!-- Green card spanning col 1, row 1 -->
  <frame gc="2/3" gr="1/2" fill="$podcast" /> <!-- Podcast card spanning col 2, row 1 -->
  <ellipse gc="3/4" gr="1/2" fill="$circle" /> <!-- Circle card spanning col 3, row 1 -->
  <frame gc="1/4" gr="2/3" fill="$visa" /> <!-- Visa card spanning all columns in row 2 -->
</grid>
```

**Unit Grid Example (Coordinate-based grid canvas):**
```xml
<grid unit="20" gap="10" w="800">
  <!-- Spans from grid coordinate 1 to 5 horizontally (80px wide) -->
  <rect gc="1/5" gr="1/3" fill="$primary" />
</grid>
```


### `<group>` — logical grouping, no layout behavior

Children are absolutely positioned relative to the group origin.

```xml
<group x="0" y="0" w="390" h="200" opacity="0.8">
  ...
</group>
```

Supports masking via `mask-src` / `mask-x` / `mask-y` / `mask-width` / `mask-height`.

---

## Content tags

### `<text>` — single-style or mixed-style text

**Single style** (most common):

```xml
<text value="Welcome back" font-family="Inter" font-size="22" font-weight="700" color="#1C1C1E" line-height="28" />
```

**Mixed styles** — segment children, no `value` on the parent:

```xml
<text>
  <segment value="Hello " font-family="Inter" font-size="16" font-weight="400" color="#6E6E73" />
  <segment value="World" font-family="Inter" font-size="16" font-weight="700" color="#1C1C1E" />
</text>
```

Common attrs: `value`, `font-family`, `font-size`, `font-weight`, `color`, `line-height`, `letter-spacing`, `text-align` (`left|center|right`), `truncate` (boolean), `w`, `h`.

### `<img>` — raster or vector image / icon

Handles both raster WebP images and vector SVG files. Declare path/URL directly in the `src` attribute.

```xml
<img src="assets/img-1.webp" w="390" h="240" fit="cover" radius="12" />
<img src="https://api.iconify.design/lucide/check.svg?color=%23A78BFA" w="16" h="16" />
```

`fit`: `cover` | `contain` | `fill` | `none`. `w` and `h` are required.

---

## Helper tags

First-class sugar tags over `<frame>` that describe common geometric primitives.

### `<rect>` — rectangular box

Sugar for `<frame>` with no children. Requires `w` and `h`.

```xml
<!-- Solid filled box -->
<rect fill="$primary" w="340" h="52" radius="12" />

<!-- Outlined box -->
<rect fill="none" border="2 $primary" w="340" h="52" radius="12" />
```

### `<ellipse>` — circle or oval

Sugar for `<frame radius="9999">`. Corner radius is implicit and full. Requires `w` and `h`.

```xml
<!-- 8px dot -->
<ellipse fill="#FF3B30" w="8" h="8" />

<!-- 80x40 oval -->
<ellipse fill="$primary" w="80" h="40" />
```

### `<line>` — horizontal or vertical visual separator

Sugar for a thin frame visual divider.

```xml
<!-- Horizontal line (default: thickness="1", w="fill") -->
<line fill="$border" />

<!-- Vertical line (h="fill") -->
<line fill="$border" direction="vertical" />

<!-- Custom thickness divider -->
<line fill="$border" thickness="2" />
```

`<line>` maps to `<frame w="fill" h="{thickness}" />` horizontally and `<frame w="{thickness}" h="fill" />` vertically.

---

## Appearance block

For nodes with multiple fills, image fills, or complex effects. Goes inside the parent.

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

`effect` types: `drop-shadow`, `inner-shadow`, `layer-blur`, `background-blur`, `glass`.

Most of the time, a simple `fill="..."` attribute is enough. Reach for `<appearance>` only when stacking fills or applying effects.

---

## Components & instances

For reused UI pieces (buttons, cards, list items).

```xml
<components>
  <component name="Button/Primary" id="comp-button-primary">
    <props>
      <prop name="label" type="text" target="label" />
    </props>
    <row gap="8" p="12 24" fill="$primary" radius="8">
      <text id="label" value="Label" font-family="Inter" font-size="16" font-weight="600" color="#FFFFFF" />
    </row>
  </component>
</components>

<!-- Usage -->
<instance component="comp-button-primary" label="Get Started" />
```

`<prop type="text">` overrides the `value` of the target element. `<prop type="visible">` shows/hides the target.

For AI-authored designs containing repeating elements (such as grid items, seat maps, calendar dates, list cells, buttons, or navigation items), you MUST create a reusable component in the `<components>` block and instantiate it using `<instance>`. This makes the XML lightweight, modular, and easy to maintain.

---

## Shared visual attributes

Apply to all layout, content, and helper nodes:

| Attr | Values | Default |
| --- | --- | --- |
| `name` | string | — (layer name, optional) |
| `opacity` | `0`–`1` | `1` |
| `blend` | `multiply`, `screen`, `overlay`, etc. | `normal` |
| `rotation` | degrees | `0` |
| `w` | number, `"fill"` | required on `frame`/`rect`/`ellipse`/`img`/`group`; hugs on stacks/col/row/grid/text/instance |
| `h` | number, `"fill"` | same as `w` |
| `abs` | boolean | child is absolutely positioned inside an auto-layout parent |
| `min-width` / `max-width` | px | — |
| `min-height` / `max-height` | px | — |

### Sizing rules (memorize this)

| Tag | `w`/`h` absent means | `"fill"` | number |
| --- | --- | --- | --- |
| `stack`, `col`, `row`, `grid`, `text`, `instance` | hug content | fill parent | fixed px |
| `frame`, `rect`, `ellipse`, `img`, `group` | **required — error if missing** | fill parent | fixed px |

---

## Fill values

The `fill` attribute accepts:

| Value | Example |
| --- | --- |
| Hex opaque | `#1C1C1E` |
| Hex with alpha | `#1C1C1ECC` (last byte = alpha) |
| Linear gradient | `linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)` |
| Radial gradient | `radial-gradient(circle at 50% 30%, #FFFFFF 0%, #000000 100%)` |
| Angular gradient | `conic-gradient(from 0deg at 50% 50%, #FF0000 0deg, #0000FF 360deg)` |
| Token reference | `$primary` |

Gradient syntax mirrors CSS. No new vocabulary to learn.

---

## Boolean attributes

Bare attributes without `="true"` are truthy. These all work:

```xml
<frame clip>...</frame>           <!-- = clip="true" -->
<col wrap>...</col>               <!-- = wrap="true" -->
<element abs />                   <!-- = abs="true" -->
```

Booleans: `clip`, `mask`, `wrap`, `abs`, `truncate`, `reverse-z`.

---

## Things the spec does NOT have (don't invent them)

- No `<button>`, `<input>`, `<nav>`, etc. — those are semantic v2 features. For v0.2/v0.3, a button is a `<row>` with a fill and a `<text>` inside.
- No `class` or `style` attribute. All styling is on attributes or via `<styles>` / `<tokens>`.
- No CSS units — everything is unitless pixels.
- No `<scroll>` or `<overlay>` — deferred to v2.
- No JavaScript, no event handlers, no interaction state.

If you find yourself wanting one of these, express the visual intent using what v0.2/v0.3 provides.
