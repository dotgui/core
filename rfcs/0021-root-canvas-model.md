---
rfc: 0021
title: Root canvas model — drop viewport, col over frame
status: Draft
targets: 0.2
date: 2026-05-21
---

# Root Canvas Model — Drop `viewport`, `<col>` over `<frame>`

## Context

The `<gui>` root element currently carries a `viewport` attribute:

```xml
<gui version="0.2" name="Profile" viewport="390x844">
  <frame w="390" h="844" fill="#F2F2F7">
    ...
  </frame>
</gui>
```

Two problems with this:

**1. `viewport` is the wrong word.**
Viewport is a browser/CSS concept — the visible window into scrollable content. dotgui is a canvas format. There is no scrolling, no window, no CSS coordinate space. The word imports a mental model that does not apply. The root `<frame>` already carries `w` and `h`. `viewport` is the same two numbers with a borrowed web term on top.

**2. Fixed root `h` breaks AI generation.**
In practice, AI agents generating `.gui` files set the root to `<frame w="390" h="844">` because that is what every spec example shows. But AI cannot reliably predict the final rendered height of dynamic content. The result is content that silently overflows and gets clipped at exactly 844px — or whatever the AI guessed. This has been a consistent failure pattern in AI-authored screens.

The root `<frame>` is the right model for a locked Figma artboard — a pixel-perfect screen that a designer has fully composed and bounded. It is the wrong model for a content-driven screen, especially one authored by AI.

## Decision

**Drop `viewport` from `<gui>`.** The root layout node's `w` and `h` are the canvas dimensions. No separate attribute needed.

**Establish two explicit root patterns:**

### Fixed artboard — `<frame>`

Use when exporting a locked Figma screen. `w` and `h` are required. Content is clipped to bounds. Children are absolutely positioned.

```xml
<gui version="0.2" name="Splash Screen">
  <frame w="390" h="844" fill="#0A0A0A">
    ...
  </frame>
</gui>
```

### Content-driven screen — `<col>`

Use when authoring a screen with flowing content — especially from AI. `w` is required. `h` is absent (hug — expands to fit all children). No clipping by default.

```xml
<gui version="0.2" name="Profile">
  <col w="390" fill="#F2F2F7" p="24" gap="16">
    ...
  </col>
</gui>
```

**The AI skill defaults to `<col w="390">` as root, not `<frame>`.**

### `<gui>` is metadata only

Direct children of `<gui>` are either metadata blocks or exactly one root layout node. Metadata always precedes the layout root.

```
<gui>
  <tokens />      ← metadata
  <fonts />       ← metadata
  <assets />      ← metadata
  <styles />      ← metadata
  <components />  ← metadata
  <col> or <frame>  ← the design starts here
```

`<gui>` itself is never rendered. It is a document envelope.

## Reasoning

### `viewport` forces the AI to solve a layout problem it cannot solve

When a root `<frame h="844">` is used, the AI must predict the total pixel height of the screen before writing a single child node. This is impossible to do accurately — it depends on font metrics, padding, gap values, and the number of elements, none of which are known until the content is written.

The result is that AI agents guess. They guess 844 because that is the iPhone 14 height and it appears in every spec example. Content taller than 844px is silently clipped. The user sees a broken render and has no obvious indication why.

Using `<col>` as root eliminates this entirely. The height is not a value the AI writes — it is a consequence of the content. The format should not make AI authors solve a problem that the layout engine can solve automatically.

### dotgui is an open canvas, not a production viewport

dotgui is a design preview format. The goal is to see the full design — everything the AI or designer created — rendered completely and without obstruction. A hard `h` constraint on the root works against this. It hides content. It turns a design tool into a clipping mask.

A web browser uses a viewport because the user is navigating content in real time and the device has a physical screen. dotgui has no physical screen. It renders into whatever container it is given. The appropriate mental model is an open canvas that expands to show everything, not a window that crops to a device frame.

Fixed-height artboards still exist and are supported — but they are an explicit opt-in via `<frame>`, not the default. The default should be: show everything.

### `<gui>` as metadata is already how it works

`<tokens>`, `<fonts>`, `<assets>`, `<styles>`, and `<components>` are all direct children of `<gui>` and are all metadata — never rendered, never part of the layout tree. `viewport` fits in this same category (document-level metadata), but it is redundant metadata. The root layout node already carries the sizing. There is nothing `viewport` expresses that `w`/`h` on the root does not.

Formalising `<gui>` as a pure metadata envelope — and the first layout tag as the start of the design — makes the structure obvious and self-documenting.

## Alternatives Considered

**Keep `viewport` as device metadata (not sizing)** — `viewport` could be retained as a hint about what device the design was authored for, decoupled from the root element's actual `w`/`h`. This has merit for future platform hints (`platform="ios"`, `density="3"`, safe area insets). Rejected for now: those concerns belong in a future `platform` RFC. Conflating device context with canvas sizing under the word "viewport" is the root confusion. Ship the removal now; add platform hints later as a separate, clearly named attribute.

**Default `h` of 844 if absent on root `<frame>`** — Keep `<frame>` as the root model but make `h` optional with a default. Rejected: a magic default height is worse than no height. It makes silent clipping non-obvious. The better fix is to use the correct tag — `<col>` — which has honest semantics for dynamic height.

**Allow any tag as root** — `<text>`, `<shape>`, etc. could theoretically be root nodes. Rejected: the plugin already wraps non-container selections in a `<frame>`. Content and shape nodes have no canvas semantics. Root must be a layout container.

**`<row>` as root** — Technically valid; a horizontal layout root is meaningful for landscape tablet or split-panel screens. Allowed but not a recommended default.

## Drawbacks

- Breaking change: `viewport` is removed. All existing `.gui` files and the Figma plugin's export code must be updated.
- Figma plugin currently emits `<frame>` as root with explicit `w`/`h` matching viewport. Plugin must be updated to emit `<col>` for auto-layout frames without explicit height constraints.
- Renderer currently reads `viewport` to force root element size. Must be updated to read from the root layout node directly.

## Implementation Notes

- Remove `viewport` attribute from `<gui>` in `core/schema/types.ts`
- Update `gui-render/src/index.ts` — read `w`/`h` from root element, not `viewport` attr on `<gui>`
- Update `gui-parser/src/index.ts` — remove viewport parsing
- Update `core/spec/DOTGUI.md` — remove viewport from root element table, document the two root patterns
- Update `core/skills/dotgui-write.md` — change canonical root example from `<frame w="390" h="844">` to `<col w="390">`
- Update all spec examples, README files, and the landing page docs

### Figma plugin export logic (`gui-figma/src/code.ts`)

The plugin reads the selected node's Figma properties directly to determine which root tag to emit. No ambiguity — it is fully detectable:

| Figma node | Condition | Emits |
|---|---|---|
| Frame, no auto-layout | `layoutMode === "NONE"` | `<frame w h>` |
| Auto-layout, vertical, hug height | `layoutMode === "VERTICAL"` + `primaryAxisSizingMode === "AUTO"` | `<col w>` |
| Auto-layout, vertical, fixed height | `layoutMode === "VERTICAL"` + `primaryAxisSizingMode === "FIXED"` | `<col w h>` |
| Auto-layout, horizontal, hug width | `layoutMode === "HORIZONTAL"` + `primaryAxisSizingMode === "AUTO"` | `<row h>` |
| Auto-layout, horizontal, fixed width | `layoutMode === "HORIZONTAL"` + `primaryAxisSizingMode === "FIXED"` | `<row w h>` |

Remove `viewport` assembly entirely from the export function.

## Unresolved Questions

- Should `w` on root have a default (e.g. 390) if absent, or remain required? Current lean: required — magic defaults hide intent and break non-phone canvases.
