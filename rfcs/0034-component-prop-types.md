---
rfc: 0034
title: Component prop types — data-typed prop vocabulary and override inference
status: Draft
introduced-in: 0.3
date: 2026-05-29
supersedes: 0008
---

# Component Prop Types — Data-Typed Prop Vocabulary and Override Inference

## Context

RFC 0008 established the component and instance system with two prop types: `text` and `visible`. These types describe *what the prop does to a layer* rather than *what kind of data it carries*. This conflates two separate concerns — data type and binding — and prevents the system from expressing the full range of Figma instance overrides.

In practice, real Figma files have two very different component authoring patterns:

**Pattern 1 — Figma-authored components.** Designers update instances directly — editing text inline, swapping nested components from the right panel, changing fill colors, swapping text styles or fill styles on layers inside an instance. Formal component property definitions (`componentPropertyDefinitions`) are rarely set up. Overrides are ad-hoc and tracked silently by Figma in `InstanceNode.overrides`.

**Pattern 2 — Code-authored components.** AI agents or developers define components with an explicit prop surface from the start. Clean, intentional, restricted to declared props.

The current prop system only serves Pattern 2 cleanly. Pattern 1 produces empty or incomplete `<props>` blocks because the plugin only reads formal Figma declarations.

Additionally, the `text` / `visible` type vocabulary cannot express fill overrides, image overrides, component swaps, style swaps, or stroke overrides — all common in both patterns.

## Decision

### 1. Prop types are data types

Replace `text` and `visible` with a vocabulary of data types aligned with common frontend framework conventions:

| type | description | replaces |
|---|---|---|
| `string` | Text content or any string-valued attribute | `text` |
| `boolean` | Show / hide, toggle state | `visible` |
| `number` | Numeric value — opacity, radius, gap, font-size, etc. Requires `bind` | — |
| `color` | Hex color value or token reference — fill or stroke | — |
| `image` | Asset reference or URL | — |
| `component` | Component id — nested instance swap | — |
| `style` | Named style token reference — text style, fill style, effect style, or stroke style. Requires `bind` | — |

```xml
<props>
  <prop name="label"        type="string"    target="label" />
  <prop name="align"        type="string"    target="label"   bind="align" />
  <prop name="disabled"     type="boolean"   target="button-layer" />
  <prop name="bg"           type="color"     target="surface" />
  <prop name="border-color" type="color"     target="surface" bind="stroke" />
  <prop name="avatar"       type="image"     target="avatar-img" />
  <prop name="icon"         type="component" target="icon-slot" />
  <prop name="radius"       type="number"    target="surface" bind="radius" />
  <prop name="opacity"      type="number"    target="surface" bind="opacity" />
  <prop name="font-size"    type="number"    target="label"   bind="font-size" />
  <prop name="label-style"  type="style"     target="label"   bind="text-style" />
  <prop name="card-style"   type="style"     target="surface" bind="fill-style" />
  <prop name="shadow-style" type="style"     target="surface" bind="effect-style" />
  <prop name="border-style" type="style"     target="surface" bind="stroke-style" />
</props>
```

### 2. `bind` — the universal override specifier

`bind` names the specific attribute being overridden on the target layer. It is the same concept across all types that support it:

| type | `bind` required | default when omitted | valid `bind` values |
|---|---|---|---|
| `string` | no | `value` (text content) | `value`, `align`, `href`, any string attr |
| `boolean` | no | `visible` | — |
| `color` | no | `fill` | `fill`, `stroke` |
| `image` | no | `src` | — |
| `component` | no | `component` | — |
| `number` | **yes** | — | `radius`, `opacity`, `gap`, `font-size`, `stroke-width`, `font-weight`, `letter-spacing`, `line-height`, `padding`, `pt`, `pr`, `pb`, `pl` |
| `style` | **yes** | — | `text-style`, `fill-style`, `effect-style`, `stroke-style` |

**Rule:** `bind` is optional when the type has one obvious default target attribute. `bind` is required when the type is inherently ambiguous — `number` (which numeric property?) and `style` (which style slot?). `color` and `string` require `bind` only when targeting a non-default attribute.

This gives complete Figma instance override coverage:

| Figma override | prop type | bind |
|---|---|---|
| Text content changed | `string` | omit |
| Text alignment changed | `string` | `align` |
| Layer visibility toggled | `boolean` | omit |
| Solid fill color changed | `color` | omit |
| Solid stroke color changed | `color` | `stroke` |
| Image fill swapped | `image` | omit |
| Nested component swapped | `component` | omit |
| Numeric property changed | `number` | e.g. `font-size`, `opacity`, `radius` |
| Text style swapped | `style` | `text-style` |
| Fill style swapped | `style` | `fill-style` |
| Effect style swapped | `style` | `effect-style` |
| Stroke style swapped | `style` | `stroke-style` |

### 3. `target` is a binding, not part of the type

`target` is the layer `id` this prop value is applied to. The renderer resolves the binding based on both the type and `bind`.

**`target` is optional when implicit.** If a `string` prop name matches exactly one `<text>` layer id in the component body, the binding is unambiguous and `target` may be omitted.

```xml
<!-- explicit target — multiple text layers, disambiguation needed -->
<prop name="title"    type="string" target="card-title" />
<prop name="subtitle" type="string" target="card-subtitle" />

<!-- implicit target — only one text layer, name matches id -->
<prop name="label" type="string" />
```

**`target` accepts a space-separated list for multi-layer bindings.** When one prop value needs to apply to multiple layers simultaneously:

```xml
<!-- one prop updates icon, label, and indicator all at once -->
<prop name="accent" type="color" target="icon label indicator" />
```

This applies to all prop types. A `boolean` prop can show/hide multiple layers, a `number` prop with `bind="opacity"` can fade multiple layers together, a `style` prop with `bind="text-style"` can swap the text style across multiple text layers at once.

### 4. Instance syntax — flat attrs for all prop types

All prop values are passed as flat attributes on `<instance>`, regardless of type:

```xml
<instance component="comp-card"
  title="Hello world"
  align="center"
  disabled="false"
  bg="#FF3B30"
  border-color="$brand-danger"
  avatar="$img-2"
  icon="comp-icon-star"
  radius="12"
  font-size="18"
  label-style="$text-heading-lg"
  card-style="$surface-elevated"
  shadow-style="$shadow-card"
  border-style="$stroke-heavy" />
```

Token references and asset references follow the same `$name` convention used everywhere in the format.

### 5. For Figma-authored components — props inferred from actual usage

When generating `.gui` from Figma, the plugin must not rely solely on `componentPropertyDefinitions`. Instead, it scans all instances of a component across the file, collects every overridden field, and auto-generates the `<props>` block from actual usage.

Inference rules per override type:

| Figma override | inferred prop type | inferred bind |
|---|---|---|
| Text content changed on a `TEXT` layer | `string` | omit |
| Layer visibility toggled | `boolean` | omit |
| Solid fill changed on a layer | `color` | omit |
| Solid stroke changed on a layer | `color` | `stroke` |
| Image fill changed on a layer | `image` | omit |
| Nested `INSTANCE` swapped | `component` | omit |
| `textStyleId` changed on a `TEXT` layer | `style` | `text-style` |
| `fillStyleId` changed on a layer | `style` | `fill-style` |
| `effectStyleId` changed on a layer | `style` | `effect-style` |
| Numeric property changed (font-size, opacity, etc.) | `number` | the property name |

Prop name = sanitized layer name (kebab-case). If a formal `componentPropertyDefinitions` entry exists for the same field, the formal name is preferred.

### 6. Detach threshold — 75% and at least 4 layers

If an instance has overridden fields across more than **75% of the layers in the component body** and the component body has **at least 4 layers**, the instance is considered structurally diverged. The plugin detaches it — emitting the live instance children as an inline node tree instead of an `<instance>` reference.

A `component` attribute is preserved as metadata so consumers know the origin:

```xml
<!-- detached — too many overrides, emitted as inline tree -->
<col component="comp-card" gap="16" p="16" fill="#FF3B30" radius="12">
  <text value="Custom title" font-size="18" font-weight="700" color="#fff" />
  <img src="$img-custom" w="fill" h="120" fit="cover" radius="8" />
</col>
```

The renderer treats this as a plain layout node. The `component` attr is informational only — no resolution required.

## Reasoning

**Data types over action types.** `string`, `boolean`, `number` are universal — every frontend framework (React, Vue, SwiftUI, Jetpack Compose) thinks in these terms. A consumer reading a `.gui` file immediately understands what value to pass without needing format-specific knowledge.

**`bind` as the universal override specifier.** Rather than creating a new prop type for every possible attribute override, `bind` extends existing types to cover non-default targets. `type="color" bind="stroke"` is more readable than a hypothetical `type="stroke-color"`. The pattern is learnable once and applies consistently.

**`type="style"` for named style tokens.** A style reference is semantically distinct from a plain string — it names a design token bundle that the renderer resolves into multiple CSS properties. Treating it as `type="string"` would lose this semantic signal and make it impossible for renderers to distinguish style tokens from arbitrary text values.

**Complete Figma override surface.** Every override Figma tracks in `InstanceNode.overrides` now has a direct mapping to a prop type + bind combination. No override is left unrepresented.

**Inferring from usage, not declarations.** Most real Figma files don't use formal component property definitions. Scanning actual instance overrides is the honest approach — the data is there in Figma's API, the plugin just wasn't reading it.

**Flat attrs over `<override>` children.** Rejected because it breaks the compact reference model of `<instance>` and pushes complexity onto consumers. Flat attrs keep instances readable and parseable in a single pass.

**Detach rather than approximate.** A heavily overridden instance that retains its `<instance>` tag with incomplete overrides is worse than a detached node — it implies fidelity that doesn't exist.

## Alternatives Considered

**Keep `text` and `visible`, add more action-types** — Rejected. Inconsistent vocabulary. Mixes data types with action types.

**`type="typography"` as a bundle type for all text style properties** — Rejected. Decomposing into individual `number` props (font-size, font-weight, line-height) and a `style` prop (text-style) is more granular, more composable, and consistent with the rest of the system.

**`type="string"` with `bind` for style references** — Rejected. A named style token is semantically different from a plain string value. `type="style"` makes the intent explicit and lets renderers and code generators handle it correctly.

**`<override>` children on `<instance>`** — Rejected. Verbose, forces consumers to implement patch logic, breaks the single-line instance model.

**Always detach all instances with overrides** — Rejected. Loses reuse semantics entirely.

**Lower detach threshold (50%)** — Rejected. Too aggressive for normal usage patterns.

## Drawbacks

- `type="number"` and `type="style"` require `bind` — one extra attr compared to other types. Necessary because both are ambiguous without it.
- `type="color"` and `type="string"` have optional `bind` — authors must know the default to know when to omit it.
- Inference from actual usage requires the plugin to scan all instances before generating the component block. This changes the plugin's traversal order — components must be registered after a full pass.
- The 75% detach threshold is heuristic. Minimum 4-layer floor mitigates aggressive detaching of small components.

## Unresolved Questions

1. ~~Should `type="number"` require an explicit `bind` attr?~~ **Resolved: yes.**
2. ~~Should the detach threshold have a minimum layer count floor?~~ **Resolved: yes — 75% AND at least 4 layers.**
3. ~~For `type="component"` — id or name?~~ **Resolved: id.**
4. ~~Should `target` resolution be documented as a normative algorithm?~~ **Resolved: `target` is a direct `id` reference.**
5. ~~Should `bind` extend to `type="color"` and `type="string"`?~~ **Resolved: yes. `color` defaults to `fill`, accepts `stroke`. `string` defaults to `value`, accepts any string attr name (e.g. `align`, `href`). `bind` is required on `type="style"` and `type="number"`, optional on `color` and `string`.**
