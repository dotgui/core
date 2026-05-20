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
<gui version="1.0" name="Checkout" viewport="390x844">
  ...
</gui>
```

`version="1.0"` means the file conforms to **dotgui-core v1.0**.

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
<gui version="1.0" name="Profile" viewport="390x844">
  <tokens>
    <color name="primary" value="#007AFF" />
    <number name="radius-card" value="12" />
  </tokens>
  <stack direction="vertical" fill="#F2F2F7" gap="16" padding="24">
    <stack direction="horizontal" gap="12" fill="#FFFFFF" radius="$radius-card" padding="16">
      <img src="$avatar" width="48" height="48" radius="24" fit="cover" />
      <stack direction="vertical" gap="4">
        <text value="Jane Smith" font-family="Inter" font-size="17" font-weight="600" color="#1C1C1E" />
        <text value="@janesmith" font-family="Inter" font-size="14" font-weight="400" color="#6E6E73" />
      </stack>
    </stack>
  </stack>
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
| `1.0` | Current | Initial release. Full Figma layer coverage. `<component>`, `<component-set>`, `<instance>` — component definitions and reuse. |
| `2.0` | Planned | `<scroll>`, `<overlay>`, semantic roles |
