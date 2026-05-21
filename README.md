# dotgui core

The canonical specification and type definitions for the `.gui` format.

**`.gui` is an open, portable XML format for describing user interfaces.** It is designed to be equally readable by humans, renderers, and AI agents.

This repository is the source of truth for the format. All dotgui tools reference the spec version defined here.

---

## What's in here

| Path | Purpose |
|---|---|
| [`spec/DOTGUI.md`](spec/DOTGUI.md) | Full format specification — every tag, attribute, and rule |
| [`schema/types.ts`](schema/types.ts) | TypeScript type definitions for every element in the format |
| [`schema/validate.ts`](schema/validate.ts) | Validator — checks structure, token refs, asset refs |
| [`examples/`](examples/) | Reference `.gui` files that conform to the spec |

---

## Format version

Every `.gui` file declares which version of this spec it targets:

```xml
<gui version="0.2" name="Checkout">
  ...
</gui>
```

`version="0.2"` means the file conforms to **dotgui-core v0.2** — the current working version. v1.0 is the planned first public stable release.

Tools that consume `.gui` files should check this version and reject (or warn on) files they don't support.

---

## The ecosystem

| Tool | Repo | What it does |
|---|---|---|
| **dotgui-core** | this repo | Format spec, types, validator |
| **dotgui-figma** | `dotgui/figma` | Figma plugin — exports screens as `.gui` |
| **dotgui-render** | `dotgui/render` | Renders `.gui` to a live DOM |
| **gui-optimizer** | `dotgui/optimizer` | Cleans and optimizes raw `.gui` output |
| **dotgui-landing** | `dotgui/web` | Website |

---

## Quick look

```xml
<gui version="0.2" name="Profile">
  <tokens>
    <color name="primary" value="#007AFF" />
    <number name="radius-card" value="12" />
  </tokens>
  <col fill="#F2F2F7" gap="16" p="24">
    <row gap="12" fill="#FFFFFF" radius="$radius-card" p="16">
      <img src="$avatar" w="48" h="48" radius="24" fit="cover" />
      <col gap="4">
        <text value="Jane Smith" font-family="Inter" font-size="17" font-weight="600" color="#1C1C1E" />
        <text value="@janesmith" font-family="Inter" font-size="14" font-weight="400" color="#6E6E73" />
      </col>
    </row>
  </col>
</gui>
```

---

## Using the validator

```typescript
import { validate } from 'dotgui-core'

const result = validate(guiString)

if (!result.valid) {
  console.error(result.errors)
}
```

---

## Spec version history

| Version | Status | Notes |
|---|---|---|
| `0.1` | Stable | Initial format design. XML over JSON, package format, token system, layout sugar tags (`row`/`col`/`grid`), appearance block, component/instance system, optimizer separation. |
| `0.2` | Current (in progress) | Layout API overhaul: unified `w`/`h` sizing, 9-point `align`, `gap` auto convention, `p` padding + per-side attrs, `abs` for absolute children, boolean presence convention. Inline SVG on `<svg>`. Root canvas model. |
| `1.0` | Planned | First public stable release. Full Figma layer coverage. Semver applies from this point. |
| `2.0` | Future | `<scroll>`, `<overlay>`, semantic roles, interactions. |
