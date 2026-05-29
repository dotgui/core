---
rfc: 0033
title: Color formats and dimension units
status: Draft
targets: 0.3
date: 2026-05-25
---

# Color Formats and Dimension Units

## Context

In 0.1–0.2, the format accepts exactly one color notation (6- or 8-digit hex) and one dimension unit (px, stored as a bare number). Both constraints made early implementation easier but have become friction points:

- **Hex alpha is unusable in practice.** Editing opacity means hex math — `#FF000080` is 50% transparent red. No designer does this by hand. `rgba(255, 0, 0, 0.5)` is immediately readable and editable.
- **oklch is becoming the default in design systems.** It is perceptually uniform, supports wide-gamut displays, and cannot be losslessly round-tripped through sRGB hex. Requiring conversion at write time discards color intent.
- **Bare pixel numbers block responsive intent.** A node that should be 50% of its parent has no way to express that today — it must be given a fixed value. With the format increasingly used for multi-screen and component-level design, `%` and `rem` are table stakes.

## Decision

### 1. Three canonical color notations

The format accepts three color notations as equally valid. No normalization between them.

| Notation | Example | Notes |
|---|---|---|
| Hex | `#FF0000` / `#FF000080` | 6-digit (opaque) or 8-digit (with alpha) |
| rgba | `rgba(255, 0, 0, 0.5)` | Alpha as 0–1 float. **Preferred for any color with opacity.** |
| oklch | `oklch(0.6 0.2 250)` / `oklch(0.6 0.2 250 / 0.5)` | Slash-alpha syntax for oklch |

All three are valid in any attribute that accepts a color: `fill`, `color`, `border`, `shadow`, gradient stops, and token `value` declarations.

```xml
<!-- All of these are valid -->
<rect fill="#FF0000" w="40" h="40" />
<rect fill="rgba(255, 0, 0, 0.5)" w="40" h="40" />
<rect fill="oklch(0.6 0.2 250 / 0.5)" w="40" h="40" />
<tokens>
  <color name="primary" value="oklch(0.627 0.258 29.23)" />
  <color name="overlay" value="rgba(0, 0, 0, 0.4)" />
</tokens>
```

**rgba is the preferred notation for any color with opacity.** Changing opacity is editing one number at the end of the value. This is the primary reason rgba is promoted to first-class rather than treated as a normalization target.

### 2. Color normalizer scope

The optimizer's color normalizer (`rule-11-normalize-colors`) currently converts `rgb()` and lowercase hex to uppercase hex. Updated scope:

- `rgb(r, g, b)` (no alpha) → `#RRGGBB` hex (no change from current behavior)
- `rgba(r, g, b, a)` → **left as-is** (rgba is now a canonical format)
- `oklch(...)` → **left as-is** (cannot be converted to sRGB hex without gamut clipping)
- `#rrggbb` / `#rrggbbaa` → normalized to uppercase (no change)

The normalizer does not add or remove alpha. It does not change format unless the input is a bare `rgb()` call.

### 3. Five dimension units

Dimension values — `w`, `h`, `min-w`, `max-w`, `min-h`, `max-h`, padding (`p`, `pt`, `pr`, `pb`, `pl`), gap, radius, `x`, `y`, font sizes, and shadow offsets — now accept five forms:

| Form | Example | CSS output | Notes |
|---|---|---|---|
| Bare number | `320` | `320px` | Backward-compatible. All existing files unchanged. |
| px string | `"320px"` | `320px` | Explicit form. Same result as bare number. |
| Percent | `"50%"` | `50%` | Always relative to the **parent container**. |
| rem | `"1.5rem"` | `1.5rem` | Relative to root font size. |
| vw / vh | `"100vw"` / `"50vh"` | `100vw` / `50vh` | Percent of viewport width/height. |
| calc | `"calc(100% - 16px)"` | `calc(100% - 16px)` | Passed through verbatim. |

Keyword values `fill`, `hug`, and `auto` are unaffected.

```xml
<!-- Existing files: no change needed -->
<rect w="320" h="80" fill="$surface" />

<!-- New: percentage, rem, viewport, calc -->
<col w="50%" h="100vh" fill="$background" />
<text font-size="1rem" value="Hello" />
<col w="calc(100% - 32px)" gap="16" p="24" />
```

**`%` always means percent of the parent container.** For viewport-relative sizing, `vw` and `vh` are the correct units. There is no ambiguity between the two.

### 4. Space-separated multi-value attributes

Attributes that accept space-separated lists — `radius`, `p` (padding shorthand), `shadow` offsets — accept the same unit forms per token:

```xml
<!-- radius: each corner independently -->
<rect radius="8px 8px 0 0" w="320" h="64" fill="$surface" />
<rect radius="50% 50% 0 0" w="80" h="80" fill="$primary" />

<!-- padding shorthand -->
<col p="16px 24px" gap="12">
  <text value="Label" font-size="14" />
</col>
<col p="1rem 1.5rem" gap="12">
  <text value="Label" font-size="14" />
</col>
```

Each whitespace-separated token is parsed individually. A token that is a bare number gets `px` appended. A token that is already a unit string passes through.

## Reasoning

### Why rgba over hex-alpha for opacity

`#FF000080` and `rgba(255, 0, 0, 0.5)` represent the same color. The hex form requires mental conversion — `80` in hex is 128 in decimal, which is 50% of 255. No one computes this. Every designer who wants 40% opacity writes `rgba(r, g, b, 0.4)`. Making the format accept only hex means every opacity-carrying color must be converted before being written, which defeats the purpose of a human-readable format.

rgba is not added because it is new — it is added because it is already the de facto authoring syntax for transparent colors.

### Why oklch is not normalized to hex

oklch operates in a wider color space than sRGB. A color expressed as `oklch(0.627 0.258 29.23)` may be outside the sRGB gamut and has no lossless hex equivalent. Normalizing it would silently change the color — potentially significantly on wide-gamut displays. The format stores design intent, not a rendering approximation. oklch values must be preserved as authored.

### Why `%` does not mean "of viewport"

Viewport-relative percent is a CSS-specific convention (`vw`/`vh` exist precisely because `%` was overloaded). In dotgui, `%` means "of parent" at every level — the same semantics as `fill` but with a specific fraction. `vw`/`vh` are available when viewport-relative sizing is genuinely needed.

### Why bare numbers still mean px

All existing `.gui` files use bare numbers. Making them mean anything else is a breaking change with no benefit. The explicit `px` suffix is accepted for authoring clarity but is not required.

### Why no em, fr, dvh, or clamp()

- `em` — relative to the element's own font size. Useful in CSS but uncommon in design tools where context-sensitive sizing complicates layout math. Deferred.
- `fr` — grid fractions. Meaningful only inside `grid` containers. Grid layout is a separate concern (RFC-0032). Deferred until grid implementation is mature.
- `dvh` / `svh` — dynamic/small viewport height. Useful for mobile browser chrome but adds complexity. The designs dotgui targets are single-screen, not scroll-driven. Deferred.
- `clamp()` — useful for responsive typography. The designs dotgui targets are not responsive at the font level. Deferred.

## Implications for Figma Plugin

Figma operates in sRGB. The Figma plugin (`gui-figma`) must handle the two non-hex formats:

- **rgba → Figma RGB**: Divide each channel by 255, pass alpha directly. Straightforward.
- **oklch → Figma RGB**: Requires oklch-to-sRGB conversion with gamut mapping. Colors outside sRGB are clipped to the sRGB boundary. This is a lossy operation and is documented as such — the plugin will emit a warning when oklch values are gamut-mapped.

Figma export does not change the stored `.gui` format. The conversion happens at export time only.

## Alternatives Considered

**Accept any CSS string as a dimension (no validation)** — Rejected. Passing `"banana"` as a width would silently produce invalid CSS. The format should validate against a known-good set of units.

**Adopt full CSS color syntax (lab, lch, display-p3, named colors)** — Considered. CSS lab/lch are similar to oklch but oklch is strictly better and is the direction the CSS spec is moving; lab/lch are not planned.

Named colors specifically (`red`, `coral`, `rebeccapurple`) are rejected. CSS named colors were introduced long before CSS custom properties — they were the only way to give a color a human-readable name at the time. That problem is now solved by the token system. `$red` in dotgui is the team's red: the exact value the designer chose, not the browser's arbitrary `#FF0000`. Named colors are also ambiguous (`grey` vs `gray` are both valid CSS, `green` is `#008000` not `#00FF00`). Tokens are unambiguous, designer-controlled, and already part of the format — they make named colors unnecessary.

**Normalize rgba to hex, store hex only** — Rejected. This is the current behavior for `rgb()` and it is the source of the friction being addressed. Once a color is normalized to hex, the alpha is buried in two hex digits that no one can read or edit.

**Store a structured `{r, g, b, a}` color object instead of a string** — Rejected. dotgui attributes are strings. A structured color object would require a new value type and complicates every attribute parser. String formats are sufficient.

## Drawbacks

- Three color notations means three branches in every color parser and validator. Not complex, but it is more surface area.
- calc() is accepted but not validated. Malformed calc expressions will pass the format validator and fail at render time. This is acceptable — calc() is a power-user escape hatch, not a common case.
- oklch gamut-mapping in the Figma plugin introduces a dependency on a color conversion library (e.g. `culori`). Adds ~15KB to the plugin bundle.

## Test Cases

**Colors:**
- `fill="#FF0000"` — valid hex, opaque red
- `fill="#FF000080"` — valid hex with alpha, 50% red
- `fill="rgba(255, 0, 0, 0.5)"` — valid rgba, 50% red
- `fill="rgba(255, 0, 0, 1)"` — valid rgba, opaque red (not required to be hex)
- `fill="oklch(0.6 0.2 250)"` — valid oklch, opaque
- `fill="oklch(0.6 0.2 250 / 0.5)"` — valid oklch with alpha
- `fill="rgb(255, 0, 0)"` — valid input, optimizer normalizes to `#FF0000`
- `fill="red"` — invalid (named colors not yet supported)
- `fill="hsl(0, 100%, 50%)"` — invalid (hsl not in scope)

**Dimensions:**
- `w="320"` — valid, 320px (existing behavior)
- `w="320px"` — valid, 320px (explicit form)
- `w="50%"` — valid, 50% of parent width
- `w="1.5rem"` — valid, 1.5rem
- `w="100vw"` — valid, full viewport width
- `w="calc(100% - 16px)"` — valid, passed through
- `w="fill"` — valid keyword (existing behavior)
- `w="50em"` — invalid (em not in scope)
- `w="1fr"` — invalid (fr not in scope)
- `p="16 24"` — valid, 16px top/bottom 24px left/right (existing behavior)
- `p="1rem 1.5rem"` — valid, rem values per side
- `radius="8 8 0 0"` — valid, per-corner px (existing behavior)
- `radius="50% 50% 0 0"` — valid, percent corners
