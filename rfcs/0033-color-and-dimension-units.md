---
rfc: 0033
title: Color formats and dimension units
status: Accepted
targets: 0.3.9
date: 2026-05-25
updated: 2026-10-28
---

# Color Formats and Dimension Units

## Context

In 0.1–0.2 the format accepted one color notation (6- or 8-digit hex) and one dimension unit (px, written as a bare number). Two of those limits cause real friction:

- **Hex alpha is unreadable.** `#FF000080` is 50% transparent red. Nobody computes `80` → 128 → 50% by hand; `rgba(255, 0, 0, 0.5)` is read and edited at a glance.
- **Wide-gamut color has no home.** `oklch()` is perceptually uniform and reaches colors outside sRGB. Converting it to hex at write time throws away the designer's color.

A third — sizing relative to the parent — matters too: a column that is half its parent's width has no way to say so except a fixed number.

What tools do today:

| | Kit validator | Kit HTML renderer | Native renderer |
|---|---|---|---|
| hex | ✓ | ✓ | ✓ |
| `rgba()` | ✓ | ✓ (CSS) | **draws nothing** |
| `oklch()` | anything starting `oklch(` | ✓ (CSS) | **draws nothing** |
| `rgb()` | rejected | ✓ (CSS) | **draws nothing** |
| `%` on sizes | ✓ | ✓ | ✓ on `w`, `h`, min/max |
| `px`, `rem`, `vw`, `vh`, `calc()` | ✓ | ✓ (CSS) | ignored |

Two consequences. The Figma exporter writes every gradient stop as `rgb()` or `rgba()`, so every exported gradient draws nothing in the native renderer. And kit accepts units that one renderer silently ignores — a file that validates and renders differently depending on who reads it ([P15](../PRINCIPLES.md)). Across 442 `.guix` files in the workspace, only `%` appears; no file uses `rem`, `vw`, `vh`, `calc()` or a `px` suffix.

The first draft of this RFC accepted all six unit forms and pushed the optimizer's color rules into the format. A hearing against [PRINCIPLES.md](../PRINCIPLES.md) kept the colors and `%`, and dropped the rest.

## Decision

### 1. Three color notations

| Notation | Example | For |
|---|---|---|
| Hex | `#FF0000` / `#FF000080` | Opaque colors; the default |
| `rgba()` | `rgba(255, 0, 0, 0.5)` | Any color with opacity — the alpha stays readable |
| `oklch()` | `oklch(0.627 0.258 29.23)` / `oklch(0.6 0.2 250 / 0.5)` | Wide-gamut color |

- **Exact forms.** `rgba(r, g, b, a)`: three integers 0–255 and an alpha 0–1, comma-separated. `oklch(L C H)` or `oklch(L C H / a)`: lightness 0–1 or `0%`–`100%`, chroma ≥ 0, hue in degrees, alpha 0–1 or a percentage, space-separated.
- **Everywhere a color goes:** `fill`, stroke and border colors, shadows, gradient stops, token values, fill styles.
- **Stored as written.** No tool converts one notation into another. An `oklch()` color is kept, because it may lie outside sRGB.
- **Drawing is the renderer's job.** A renderer that paints in sRGB maps `oklch()` into sRGB, clipping colors outside its gamut ([P6](../PRINCIPLES.md)). The file still holds the original color, so a wide-gamut renderer draws it in full.
- **`rgb(r, g, b)` is tolerated, not part of the format.** Hex already says it ([P12](../PRINCIPLES.md)). Renderers draw it, because every Figma gradient stop has used it, and validators warn with the hex to write instead.
- **Not accepted:** named colors (`red`; the token system names colors), `hsl()`, 3-digit hex, `lab()` / `lch()`.

### 2. Dimensions: bare numbers, and `%` for sizes

- **A bare number is pixels**, as it always has been: `w="320"`.
- **`%` is a share of the parent**, on the size attributes only: `w`, `h`, `min-width`, `max-width`, `min-height`, `max-height`. `w="50%"` is half the parent's width.
- `fill` and `hug` are unchanged. `fill` takes the space left over; `100%` is the parent's full size whatever its siblings take.
- **Everywhere else a dimension is a bare number**: padding, gap, radius, position, font sizes, stroke widths, shadow offsets.
- **Not accepted:** a `px` suffix, `rem`, `em`, `vw`, `vh`, `fr`, `calc()`. Grid track lists (`cols`, `rows`, [RFC-0032](0032-grid-system.md)) keep their own syntax, `fr` and `%` included.

Both are 0.3.9 rules: a document declaring 0.3.9 or higher that uses a dropped form is an error; one declaring an earlier point gets a warning, and renders as it did.

```xml
<tokens>
  <color name="primary" value="oklch(0.627 0.258 29.23)" />
  <color name="scrim" value="rgba(0, 0, 0, 0.4)" />
</tokens>
<row w="390" gap="16" p="24">
  <col w="50%" fill="$primary" radius="12" />
  <col w="fill" fill="linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 100%)" />
</row>
```

## Reasoning

**rgba is how people write opacity.** It is not added because it is new; it is the syntax every designer already reaches for. Hex alpha stays valid — it is what existing files and exporters write — but `rgba()` is the readable form.

**oklch keeps the designer's color.** Normalising to hex would silently change it on wide-gamut displays. The format stores intent; gamut mapping is computation, and computation belongs to the renderer ([P6](../PRINCIPLES.md)).

**`%` is intent every platform has.** "Half the parent" means the same thing in SwiftUI, Compose and CSS ([P2](../PRINCIPLES.md)), and real files already use it. It stays on sizes because that is where it means one thing; percentage padding or radius is a CSS habit with no consistent meaning elsewhere.

**Why the other units were dropped:**

- **`px` suffix** — a second way to write `320` ([P12](../PRINCIPLES.md)).
- **`rem`** — relative to the browser's root font size, which only exists on the web ([P2](../PRINCIPLES.md)). The intent behind it — text that scales with the user's settings — is real, and is its own RFC, stated as intent rather than borrowed as a CSS unit.
- **`vw` / `vh`** — a share of the screen. That depends on what a screen is, which [RFC-0050](0050-screen-and-scroll.md) defines. Deferred there.
- **`calc()`** — arithmetic in the file ([P6](../PRINCIPLES.md)), a CSS dialect ([P8](../PRINCIPLES.md)), and a primitive existing ones already cover ([P13](../PRINCIPLES.md)): "the parent's width minus 16" is `fill` with padding or gap.

**One reading for every renderer.** Kit and the native renderer now accept and draw the same set. A file that validates draws the same everywhere ([P15](../PRINCIPLES.md)).

### Principle pass

| Principle | Result | Note |
|---|---|---|
| P1 — neutral | pass | Every tool can write hex, rgba and oklch; Figma's gradients already write rgba. |
| P2 — platform-agnostic | pass | Colors and `%` mean the same on every platform. `rem` and `vw`/`vh` are out. |
| P6 — intent vs computation | pass | Gamut mapping is the renderer's. `calc()` is out. |
| P7 — readable | pass | Opacity is one readable number. |
| P8 — one vocabulary | pass | CSS color syntax that every model knows; no CSS-only units. |
| P11 — grammar | pass | Value forms: inline-single and functions reusing existing value vocabulary. |
| P12 — one way | watch | Hex alpha and `rgba()` both carry alpha; hex is kept for existing files and exporters. `rgb()` and `px` are not part of the format. |
| P13 — fewer primitives | pass | No new primitive; `calc()` refused because existing ones cover it. |
| P14 — deterministic | pass | Stored as written; no conversion on the way in. |
| P15 — honest | pass | Every accepted form is drawn by every renderer; dropped forms fail loudly. |

## Alternatives Considered

**Accept every CSS unit, as the first draft did** — Rejected. `rem`, `vw`/`vh` and `calc()` are CSS ideas the native renderer cannot honor, and no file in the workspace uses them.

**`rem` for scalable text** — Rejected here. The intent is real; it gets its own RFC stated as intent, not as a CSS unit.

**`%` everywhere** — Rejected. Percentage padding, gap and radius each mean something different in CSS and nothing consistent elsewhere.

**`rgb()` as a fourth notation** — Rejected. Hex already writes an opaque color. It stays drawable so existing exports keep working.

**Normalise rgba and oklch to hex** — Rejected. Hex buries alpha in two digits and cannot hold wide-gamut color.

**Named colors** (`red`, `coral`) — Rejected. Tokens name colors, with the value the designer chose; CSS names are arbitrary (`green` is `#008000`) and spelled two ways (`grey`, `gray`).

**hsl, lab, lch, display-p3** — Not planned. oklch covers wide gamut and perceptual editing.

**A structured color object** — Rejected. Attributes are strings, and the string forms are sufficient.

## Drawbacks

- Three color notations mean three branches in every color parser.
- Files that use `rem`, `vw`, `vh`, `calc()` or a `px` suffix fail once they declare 0.3.9. None were found; any written by a tool must be re-exported.
- The Figma exporter should write opaque gradient stops as hex. Until it does, every exported gradient carries `rgb()` warnings.
- Wide-gamut colors are clipped by an sRGB renderer. That is a limit of the output, and the file keeps the full color.

## Implementation Notes

- **Schema:** `ColorValue` documents the exact `rgba()` and `oklch()` forms; `DimensionValue` is a number, or a `%` string on size attributes. The *Fill Values* reference lists all three notations.
- **Kit validator:** a strict `oklch()` check; `RGB_COLOR` warns on `rgb()` and names the hex; `INVALID_DIMENSION` for a `px` suffix, `rem`, `vw`, `vh` or `calc()`, and for `%` outside the size attributes. Errors from 0.3.9, warnings before.
- **Native renderer:** draws `rgba()`, `rgb()` and `oklch()` everywhere a color goes, gradient stops included, mapping oklch into sRGB with gamut clipping; refuses the dropped unit forms from 0.3.9.
- **Kit HTML renderer:** unchanged — CSS draws all three notations.
- **Figma exporter:** write opaque gradient stops as hex. Deferred with the rest of the Figma plugin work.
- **Optimizer:** its color rules are its own; it must not convert `rgba()` or `oklch()`.

## Test Cases

**Colors**
- `#FF0000`, `#FF000080`, `rgba(255, 0, 0, 0.5)`, `oklch(0.6 0.2 250)`, `oklch(0.6 0.2 250 / 0.5)`, `oklch(60% 0.2 250)` — valid, and drawn by the native renderer.
- `linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 100%)` — drawn natively.
- `rgb(255, 0, 0)` — drawn; a warning names `#FF0000`.
- `oklch(banana)`, `rgba(255, 0, 0)`, `red`, `hsl(0, 100%, 50%)` — invalid.

**Dimensions**
- `w="320"`, `w="50%"`, `max-width="80%"`, `w="fill"`, `p="16 24"` — valid.
- `w="320px"`, `w="1.5rem"`, `w="100vw"`, `w="calc(100% - 16px)"`, `p="10%"`, `radius="50%"` — errors in 0.3.9, warnings in 0.3.8.
