# dotgui core

The canonical specification and type definitions for the `.gui` format.

---

## What is `.gui`?

`.gui` is a file format for user interfaces — think of it the way you think of `.jpg` or `.png` for images, or `.svg` for vector graphics. Except instead of pixels or paths, it describes *UI*.

Like `.svg`, a `.gui` file is human-readable XML you can open in any text editor. Like `.svg`, it is portable — it doesn't belong to any one tool. Unlike `.svg`, it is built specifically for UI: layouts, components, tokens, screens. Not shapes.

A `.gui` file is a **package** (a zip with a manifest), not a bare XML file. This is a deliberate decision: real UIs have assets — images, fonts, icons. Encoding those as base64 inside the XML would be a token-killer for AI pipelines and a readability nightmare for humans. The package format keeps assets separate and the markup clean.

---

## The problem it solves

HTML is great for prototyping UI. The tooling is everywhere, the rendering is instant, and every AI model can write it. But HTML carries enormous friction at the *source* level: you need a package manager, a bundler, a dev server, an understanding of the DOM, a reason to have Node installed. The pressure is on whoever is creating the source.

Design tools like Figma flip this. Authoring is smooth — drag, style, done. But the output is **vendor-locked**. Your designs live inside Figma. You can export images or a static link, but the source of truth is proprietary. When you want to ideate with an AI, move to a different tool, or open it in a renderer, you are translating through lossy formats every time. The patterns and decisions embedded in your designs don't travel — they stay in the platform as pixels.

`.gui` moves the friction to the **render** side, not the source side.

- Anyone can create a `.gui` file with a text editor and zip utility. No install required.
- Any renderer — a browser, a design tool, a code generator — can consume it.
- AI models can read and write it natively, without extra scaffolding.

---

## Inspiration

`.svg` proved that a text-based, open, portable format can become the universal interchange for an entire visual medium. That is the model.

But SVG was designed for graphics, not interfaces. It has no concept of layout, tokens, components, or screens. Building a UI in SVG means fighting the format.

We wanted something that felt more like writing HTML — semantic, composable, readable — but without the div soup, the implicit inheritance, and the browser-specific rendering quirks. Platform-agnostic. Not "a web technology". A format any renderer can implement.

---

## Why now

The ways of working are changing.

Software development has become increasingly open: open-source tools, open models, open pipelines. Design has not kept up. Designers are largely locked into one or two commercial platforms, and the artefacts they produce are not portable in any meaningful sense.

There is another asymmetry worth naming. The web has an enormous body of text-based knowledge — documentation, tutorials, Stack Overflow, open-source code. AI models get better at web development almost automatically because the knowledge is already in a format they can consume.

Design is not like this. Design knowledge lives in images: screenshots on Dribbble, PDFs with annotated mockups, Figma community files, platform guidelines illustrated with pixels. When a new visual trend emerges, or Apple ships a new design language, the patterns exist — but they exist as images, locked inside closed platforms or buried in documentation that is hard to parse programmatically.

`.gui` changes this. A new design pattern is a `.gui` snippet. A new component style is a `.gui` file. iOS 26 shipping a new interaction model means someone can write it down as structured text — and every model, every tool, every developer gets access to it immediately. No image training required. No vision model needed. Text is the design knowledge here.

This is the same reason HTML documentation made web development so learnable. The format being text meant the patterns were inherently shareable. We want that for UI design.

At the same time, AI-assisted design is becoming real. Models can generate UI from a prompt, iterate on a layout, reason about component hierarchies. But they need a format they can work with — one that is text-based, structured, and round-trippable.

`.gui` is the interchange format that makes this loop possible:

- Ideate in any tool (a coding assistant, a chat interface, a design plugin)
- Iterate using the latest models
- Return to your favourite design tool to refine
- Come back to the AI, push to a renderer, open in another tool — the file stays yours

The goal is not to pick a winner. The goal is to make the medium portable.

---

## What we are not trying to be

We are not building another Figma. We are not building another design tool. We are not trying to replace the tools people love.

We are building the format that lets those tools talk to each other — and to AI — without losing fidelity. An enhancement layer, not a replacement.

---

## The ecosystem

| Tool | Repo | What it does |
|---|---|---|
| **dotgui-core** | this repo | Format spec, types, validator |
| **dotgui-figma** | `dotgui/figma` | Figma plugin — exports screens as `.gui` |
| **dotgui-render** | `dotgui/render` | Renders `.gui` to a live DOM |
| **gui-optimizer** | `dotgui/optimizer` | Cleans and optimizes raw `.gui` output |
| **dotgui-landing** | `dotgui/web` | Website |

The goal is to grow this — more entry points, more design software integrations, more renderers, more AI-native tooling. A small, well-specified format with many readers and many writers.

---

## What's in this repo

| Path | Purpose |
|---|---|
| [`PRINCIPLES.md`](PRINCIPLES.md) | The constitution — durable design tenets every RFC must satisfy |
| [`spec/DOTGUI.md`](spec/DOTGUI.md) | Full format specification — every tag, attribute, and rule |
| [`rfcs/`](rfcs/) | Every design decision, debated and recorded |
| [`schema/types.ts`](schema/types.ts) | TypeScript type definitions for every element |
| [`schema/validate.ts`](schema/validate.ts) | Validator — checks structure, token refs, asset refs |
| [`examples/`](examples/) | Reference `.gui` files that conform to the spec |

---

## How RFCs work

Every non-trivial decision about the format lives in [`rfcs/`](rfcs/) as a numbered document. RFCs cover the rationale, the alternatives considered, and the final decision. If you want to know *why* the format works the way it does — why it is XML and not JSON, why the package format, why layout works the way it does — the RFCs are where to look.

The spec in [`spec/DOTGUI.md`](spec/DOTGUI.md) is the normative reference. RFCs are the reasoning behind it. And [`PRINCIPLES.md`](PRINCIPLES.md) is the constitution every RFC is judged against — a proposal cannot contradict a principle without explicitly amending it.

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

## Format version

Every `.gui` file declares which version of the spec it targets:

```xml
<gui version="0.2" name="Checkout">
  ...
</gui>
```

`version="0.2"` is the current working version. v1.0 is the planned first public stable release.

| Version | Status | Notes |
|---|---|---|
| `0.1` | Stable | Initial format design. XML over JSON, package format, token system, layout sugar tags, component/instance system. |
| `0.2` | Current (in progress) | Layout API overhaul: unified sizing, 9-point align, gap/padding model, absolute children, complete paint and stroke model, text fidelity, effects, vector shapes, assets, grid system, component prop types. |
| `1.0` | Planned | First public stable release. Full Figma layer coverage. Semver applies from this point. |
| `2.0` | Future | Scroll, overlays, semantic roles, interactions. |

---

## Using the validator

```typescript
import { validate } from 'dotgui-core'

const result = validate(guiString)

if (!result.valid) {
  console.error(result.errors)
}
```
