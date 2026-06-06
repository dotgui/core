---
rfc: 0037
title: Token modes — multi-value tokens
status: Proposed
targets: 1.0
date: 2026-06-06
updated: 2026-06-06
---

# Token Modes — Multi-Value Tokens

## Context

RFC-0005 established a flat `<tokens>` block where each token holds exactly one
value. That is sufficient for a single visual appearance but cannot express a
design that ships more than one — light/dark being the obvious case, brand and
density being others.

This matters for 1.0 specifically. A `.gui` is meant to be a *complete visual
description* of a UI, and a UI's dark mode is part of how it looks, not an
interaction. More importantly, modes **restructure the `<tokens>` block** — a
token goes from holding one value to holding several. That is a breaking change
to the token data model, so it cannot be deferred to a post-1.0 minor without
breaking every existing file. If modes are coming at all, they have to land
before the 1.0 freeze.

The concept is called **modes**, not themes. Theme (light/dark) is the most
common mode, but the mechanism is generic — density and brand are modes too.
This naming matches every prior-art system: Figma calls them *modes*, iOS calls
them *appearances*, Android calls them resource *qualifiers*. None special-cases
"theme," and encoding the format around "theme" would be both narrower than the
need and a vendor-flavored framing we don't want (P2).

**Scope — scalar tokens only.** Modes apply to the token types that exist today:
`color`, `number`, `string` (RFC-0005). Composite token types (shadow,
typography, border) are a separate, not-yet-shipped proposal (RFC-0038); this RFC
does **not** depend on them. If composites land later, defining their per-mode
behavior is RFC-0038's responsibility, designed against this RFC — not the other
way around.

## Decision

A token may declare values per **mode**. The document declares which modes exist
and which is the default. A renderer resolves `$name` against the active mode,
falling back to the default mode when a token does not define the active one.

### Mode declaration — named axes

A mode axis is declared once as document-level metadata, sibling to
`<tokens>` / `<fonts>` / `<meta>`, never rendered. The axis is **named** — `name`
gives the axis its identity, `values` enumerates its modes, `default` picks one.
Naming the axis is what makes `theme` self-documenting and what lets multi-axis
extend without a breaking retrofit.

**The axis name is open-ended.** It is not a fixed enum of `theme`. An axis is
any dimension along which a design's values change — and the format does not
prescribe which ones exist:

```xml
<mode name="theme"   values="light dark"          default="light" />
<mode name="viewport" values="mobile desktop"     default="desktop" />
<mode name="brand"   values="acme globex"         default="acme" />
<mode name="density" values="comfortable compact" default="comfortable" />
```

- `name` — the axis identity, chosen by the author.
- `values` — space-separated list of the axis's mode values.
- `default` — the value used when no active mode is supplied; must be one of `values`.

**One axis — singular, self-closing `<mode>`:**

```xml
<mode name="theme" values="light dark" default="light" />
```

**Multiple axes — `<modes>` wrapper:**

When more than one axis exists, wrap each `<mode>` in a `<modes>` container:

```xml
<modes>
  <mode name="theme"   values="light dark"          default="light" />
  <mode name="density" values="comfortable compact" default="comfortable" />
</modes>
```

The bare `<mode>` is the singular shorthand used when exactly one axis is
declared; `<modes>` is used the moment a second axis appears. A renderer accepts
both forms. This mirrors the format's convention elsewhere: self-closing when
one, a container when many.

### Token values — axis-prefixed attributes

A token varies by mode with `{axis}-{value}` attributes. A token with a plain
`value` and no axis-prefixed attributes is **constant across all modes** — the
existing 0.1 single-value form is unchanged:

```xml
<mode name="theme" values="light dark" default="light" />

<tokens>
  <color  name="bg"          theme-light="#FFFFFF" theme-dark="#000000" />
  <color  name="primary"     theme-light="#007AFF" theme-dark="#0A84FF" />
  <string name="cta"         theme-light="Get started" theme-dark="Start now" />
  <number name="radius-card" value="12" />                  <!-- constant -->
</tokens>
```

This works for all three scalar types. Because the per-mode value is a normal
quoted attribute, a `string` value containing spaces is safe — there is no packed
microsyntax to break. A density axis on a `number`:

```xml
<mode name="density" values="comfortable compact" default="comfortable" />
<number name="gutter" density-comfortable="16" density-compact="8" />
```

**Rule:** the presence of any `{declared-axis}-{declared-value}` attribute makes
the token vary on that axis; its absence (a plain `value`) means constant. A
moded token that omits one of an axis's declared values falls back to that axis's
`default` value at resolution time.

### Applying a mode — root or any layer

A mode is made active with a `mode-{axis}` attribute on the root render tag or on
any layout node. It sets the active mode for that axis on the node and everything
beneath it, until a descendant overrides it — exactly Figma's per-frame mode.

```xml
<col mode-theme="dark">             <!-- this subtree is dark -->
  <text fill="$ink" value="…" />
  <card mode-theme="light">         <!-- override: this card is light -->
    <text fill="$ink" value="…" />
  </card>
</col>
```

Axes are independent attributes and compose:

```xml
<col mode-theme="dark" mode-density="compact"> … </col>
```

**The file declares the mode; the renderer resolves the value.** The tree never
stores a resolved color — it stores `$token` references plus the active mode in
effect. When the renderer meets a `$name`, it fetches that token's value for the
active mode at that node. This is the division the format relies on: the `.gui`
is the description (axes, per-mode token values, and which mode is active where);
turning a reference into a concrete per-mode value is the renderer's job.

**Resolution cascade** for each axis at a given node, in order:

1. the nearest ancestor-or-self `mode-{axis}` attribute, else
2. the active mode supplied by the consumer at render time (optional), else
3. that axis's `default` from the declaration, else
4. the token's constant (modeless) value.

A consumer can flip an unpinned file — e.g. preview it in dark — by supplying a
render-time mode (step 2). A subtree that pins `mode-{axis}` keeps its declared
mode regardless: that pin is a deliberate design choice, like a light hero on an
otherwise dark page. To leave a file fully consumer-controllable, pin no mode
(P5 — pin only where you mean to). This also gives the **side-by-side** showcase
for free: two sibling subtrees with different `mode-{axis}` render both
appearances at once.

### Where modes live — tokens only, matching Figma

Per-mode values are defined **only on token definitions in `<tokens>`**.
Application sites — a node, an `<appearance>` child, an inline value — never carry
per-mode values. They reference a token with `$name` and resolve to whatever the
active mode yields:

```xml
<color name="surface" theme-light="#FFFFFF" theme-dark="#000000" />  <!-- defines -->
<frame fill="$surface"> … </frame>                                   <!-- references -->
```

This mirrors Figma exactly. In Figma, modes belong to variable collections; a
property changes between modes only if it is **bound to a variable**. A detached
raw value is static across modes. The dotgui equivalent of "bind to a variable"
is "reference a token." The practical consequence: **to make a value themeable,
it must be a token** — an inline literal cannot vary by mode. This keeps the
model predictable: the file defines mode-varying values in one place
(`<tokens>`), a mode is made active with `mode-{axis}` on the root or any layer,
the renderer resolves the values, and everything between is plain `$` references.

## Reasoning

- **Modes belong to the visual layer.** A mode changes how the UI *looks*, with
  no behavioral component. Squarely 1.0 under "1.0 locks the visual layer."
- **It must precede the freeze.** Multi-value tokens change the token data model;
  doing this after stamping 1.0 would break the stability promise.
- **Generic, not theme-only (P2).** Figma modes, iOS appearances, and Android
  qualifiers are all generic axes. "Mode" names the concept the way every
  prior-art system does, and round-trips with Figma variable modes directly.
- **One way to theme (P4).** Per-mode values live only on tokens; there is no
  competing inline-at-application-site form. A single value encoding
  (axis-prefixed attributes) covers all three scalar types.
- **Compact by default (P1, P5).** Plain `value=` for the common modeless token,
  axis-prefixed attributes only where a token actually varies; the common file
  stays quiet.
- **Predictable encoding (P6).** Quoted attributes carry any scalar value
  (including strings with spaces) with no packed microsyntax, and the axis prefix
  avoids collision with real attribute names.
- **Mode application cascades; value resolution is the renderer's job.**
  `mode-{axis}` on the root or any node sets the active mode for that subtree —
  Figma's per-frame model — while the renderer turns `$` references into the
  matching per-mode value. The file stores modes and references, never resolved
  values.

## Alternatives Considered

**`<mode>` children for token values** — Rejected. With scalar-only tokens an
attribute carries the whole value, so children only triple the markup for no gain.

**Inline value map** (`value="light:#FFF dark:#000"`) — Rejected. A packed
`mode:value` microsyntax breaks on `string` values containing spaces or the
delimiter, and is a parsing rule that exists nowhere else in the format.

**Bare attribute per mode** (`light="#FFF" dark="#000"`, no axis prefix) —
Rejected. A mode value like `width` or `fill` would collide with real attribute
names. The axis prefix (`theme-light`) removes the ambiguity.

**`themes` / `default-theme` naming** — Rejected. Narrower than the mechanism and
vendor-flavored. See Context.

**Inline per-mode values at application sites** (CSS `light-dark()` style) —
Rejected. It would create a *second* place to define per-mode values, undoing the
"tokens only" decision (P4). Crucially, it cannot round-trip to Figma — Figma raw
values are static across modes, so an inline per-mode fill has no Figma
equivalent (P2). `light-dark()` is also limited to a single two-value theme axis
and does not generalize to this RFC's named multi-axis model; CSS itself declined
to generalize it. If ever wanted, it would be a post-1.0, theme-axis-only
convenience that explicitly does not round-trip to Figma.

**One token varying on two axes at once** (a single value that is a function of
theme × contrast simultaneously) — Rejected. A token varies on exactly one axis;
a node sets one value per axis (`mode-theme="dark" mode-density="compact"` is
fine, repeating `mode-theme` is not — like not repeating `fill` on a tag).
Independent axes compose, but a single value cannot be a cross-product cell of two
axes. Real and well-precedented (Android composes `night-sw600dp`; iOS composes
style × contrast × size class), but full cross-product values add combinatorial
handling not worth the cost before the freeze. A design that genuinely needs the
cross product encodes it as named modes on one axis (`dark-high-contrast`, …).

**Viewport / responsiveness as a mode** — Partly in scope. The axis name is
open-ended, so a `viewport` axis that *swaps token values* (e.g. a smaller
`gutter` on `mobile`) is a legitimate mode. What is **not** a mode is using the
axis to alter *layout structure* (reflowing a row into a column, hiding nodes);
that is responsiveness and belongs in its own RFC, not the token-mode mechanism
(P3, P7). Modes swap values; they do not restructure the tree.

**Separate file per mode** — Rejected. This is the W3C DTCG / Android approach
(merged sets / per-qualifier files), so it is not a strawman, but it loses
single-source-of-truth and diverges from the single-file-multiple-modes model the
format round-trips with.

**CSS custom properties / `prefers-color-scheme`** — Rejected for the same reason
as RFC-0005: platform-specific, implies a CSS runtime, not platform-agnostic.

## Drawbacks

- **Data-dependent attribute names.** Because axis names are open-ended and
  `{axis}-{value}` attributes follow from the declaration, they can't be
  enumerated by a fixed schema; validation is declaration-driven — a parser must
  match attributes against the declared axes and values, not a static list. This
  is the deliberate cost of open-ended naming, which exists so the mechanism is
  not hard-wired to `theme`.
- **No single cross-product token.** A token varies on one axis. A value that
  must depend on two axes simultaneously (theme × contrast) cannot be expressed in
  one token — independent axes compose at the node, but a single value can't be a
  cross-product cell. Such cases collapse the cross product onto one named axis
  (`dark-high-contrast`, …). This is the same shape as not repeating `fill` or
  `border` on a tag: one value per axis, per node.

## Implementation Notes

- **Parser (`gui-parser`):** read `<mode>` / `<modes>` into an axis table
  (`name → { values, default }`); validate `default ∈ values`. On a token,
  collect attributes matching `{axis}-{value}`; a token with any such attribute is
  moded, otherwise `value` is its constant. Warn on a `{axis}-{value}` attribute
  whose axis or value is undeclared.
- **Renderer (`gui-render`):** track the active mode per axis down the tree
  (nearest ancestor-or-self `mode-{axis}`), optionally seeded by a render-input
  active-mode map; resolve `$name` per the cascade. Resolve values at render time
  — never store resolved values in the tree.
- **Figma exporter (`gui-figma`):** map a variable collection's modes onto an
  axis and emit `{axis}-{value}` attributes; a single-mode variable emits a plain
  `value`.
- **Optimizer (`gui-optimizer`):** mode-aware emission — keep only modes
  referenced by retained screens; apply color normalization (RFC-0033) per
  resolved value.
- **Linter:** error on a `mode-{axis}` or `{axis}-{value}` whose axis or value is
  undeclared; warn on a token that defines some but not all of an axis's values.

## Test Cases

1. A modeless token (`value="12"`) resolves identically under every active mode.
2. `theme-light="#FFF" theme-dark="#000"` resolves to `#000` under an ancestor
   `mode-theme="dark"`, `#FFF` under `mode-theme="light"`, and to `default` when
   no `mode-theme` is in effect and none is supplied at render time.
3. A `string` token whose value contains spaces
   (`theme-light="Get started"`) round-trips intact.
4. A token defining only `theme-light` resolves to its `light` value when the
   active mode is `dark` and `default="light"`.
5. A nested `mode-theme` overrides its ancestor: a `light` card inside a `dark`
   column renders light while its siblings render dark — both appearances in one
   render.
6. The optimizer drops a mode referenced by no retained screen.

## Unresolved Questions

1. **No-default behavior** — when `<mode>` omits `default`, define the exact
   fallback. Leaning: the first listed value is the implicit default.
2. **Render-API surface and override precedence** — the exact shape by which a
   consumer seeds the active mode per axis at render time, and whether a forced
   render-time mode should be able to override explicit in-file `mode-{axis}`
   pins (the cascade above currently lets in-file pins win).
3. **Reconciliation with `<gui>` root attrs (RFC-0036)** — confirm the axis
   declaration is a separate `<mode>` / `<modes>` block rather than attributes on
   `<gui>` root, with no overlap.
