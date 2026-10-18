---
rfc: 0051
title: Images with a source — carrying what .gui cannot describe
status: Draft
targets: 0.4
date: 2026-10-18
depends-on: 0023, 0031, 0045, 0048
---

# Images with a Source — Carrying What `.gui` Cannot Describe

## Context

[RFC-0045](0045-describe-dont-run.md) keeps the native vocabulary small and closed: layout, components, states, tokens, flows, and motion that is a property changing over time. That leaves a large class of things real designs contain and `.gui` will never describe natively:

- **Illustrative motion:** a Lottie confetti burst, a Rive character, a morphing logo.
- **Generated visuals:** a shader glow, a noise texture, an AI-generated hero image.
- **3D:** a product model, a Spline scene.
- **Whatever a future tool invents.**

Today each of these can only enter a file as a flat image, losing everything that made it: the animation, the scene, the parameters a designer would tweak. A tool that wants to carry more has nowhere to put it.

### What other formats learned

| Format | Its container | What happened |
|---|---|---|
| Markdown | None | People put raw HTML inside it, then invented MDX. It fragmented |
| HTML | `<object>`, `<embed>` plug-ins (Flash, Java) | Security holes, nothing on phones, pages that only ran with the plug-in. Replaced by native `<video>` and sandboxed `<iframe>` |
| PDF | Rich media, with a required static *appearance* | The Flash content died; the appearances still render everywhere |
| Office (OLE) | Embedded objects with a cached preview | Opens anywhere since the 1990s, showing the preview |
| EPUB | Foreign media allowed only with a declared fallback chain | Books stay readable on every reader |
| SVG | `<foreignObject>` | Inconsistently supported; often renders blank |

The pattern is consistent. **No container, and people hack one in. A container without a required fallback, and files break. A container whose fallback is mandatory survives for decades.**

## Decision

**`<img>` gains five optional parts. An image can say what made it, carry its original, the values that produced it, and whether it plays.**

```xml
<!-- a shader: everyone sees glow.webp; a shader plug-in can play it live; a shader tool can tweak it -->
<img src="assets/glow.webp" kind="shader" original="assets/glow.wgsl" playback="loop" label="soft pink glow" w="fill" h="300">
  <param name="intensity" value="0.8" />
  <param name="tint" value="$rose" />
</img>

<!-- a Lottie: the still is the poster -->
<img src="assets/confetti.webp" kind="lottie" original="assets/confetti.lottie" playback="enter" label="confetti burst" w="200" h="200" />

<!-- 3D: a rendered still, the model, and the camera that made the still -->
<img src="assets/chair.webp" kind="gltf" original="assets/chair.glb" label="oak chair, three-quarter view">
  <param name="camera" value="35 20 4" />
</img>

<!-- an AI image: nothing plays; the values let a tool regenerate it -->
<img src="assets/hero.webp" kind="ai-image" label="misty Kyoto street at dawn">
  <param name="prompt" value="…" />
  <param name="seed" value="42" />
</img>
```

| Part | Meaning |
|---|---|
| `src` | **The still.** Unchanged from [RFC-0031](0031-images-and-assets.md), and always present. It is what every reader shows. |
| `kind` | What made it: `lottie`, `rive`, `spline`, `video`, `shader`, `gltf`, `ai-image`, … — and which player can play it |
| `original` | The editable original in the package: a scene, a shader, a `.lottie`. Optional — an AI image may have none |
| `<param>` | The values that produced the still. Values may use tokens, so a re-render follows the theme |
| `playback` | Present only if it can play live: `enter`, `hover`, `tap`, or `loop`, reusing [RFC-0048](0048-motion.md)'s triggers |
| `label` | Plain words for what it is — for AIs, screen readers, and readers without a player |

### The rules

1. **The still is the image.** A `.gui` reader that knows nothing of this RFC draws `src` as it always has. There is no way to write a carried image without a fallback, because the fallback is the image itself — the rule PDF and EPUB had to add, built in.
2. **`label` is required when `kind` is present.** An opaque original must still say what it is.
3. **No interface inside.** `kind` may not be `html`, `iframe`, `url`, or anything that carries buttons, text or layout. Interface is described natively ([RFC-0045](0045-describe-dont-run.md)). Carried images are media: animation, video, 3D, generated imagery.
4. **Known kinds and namespaced kinds.** A short list of kinds is documented by name — `video`, `lottie`, `rive`, `spline`, `shader`, `gltf`, `ai-image` — so two tools saying `lottie` mean the same thing. Any other kind is namespaced by its tool: `x-lorem-sim`.
5. **Parameters change the output.** A `<param>` must affect what is drawn — a colour, a camera, a seed, an intensity. A tool's editor settings (panel layout, zoom, selection) never appear (P3).
6. **The file holds no code.** `original` is an asset in the package like any other ([RFC-0031](0031-images-and-assets.md), [RFC-0043](0043-standalone-guix.md): a local path inside a package, an absolute URL in a standalone document, never a `data:` URI).
7. **It is a node like any other.** It takes size, position, `id`, motion, links and `smart` matching. Players never navigate; a link attaches to the image from outside.

### Renderer plug-ins (non-normative)

The format above is fixed. What plays it is the renderer's business, and renderers may grow without the format changing:

- A **player** registers for a `kind` ("I play `lottie`").
- It receives a **fixed contract:** a box to draw in, its size, its `<param>`s with tokens resolved, and when to play.
- It **runs sandboxed** — a separate frame or worker — and can neither read nor change the rest of the design, the page, or navigation.
- A renderer **reports its capabilities** ("plays: video, lottie, rive"), so a reader knows what it showed as a still.
- **Plug-ins never add tags or attributes.** They play kinds; they do not extend the vocabulary. Growth of the vocabulary goes through RFCs.
- A widely used kind **graduates** to the documented list and ships in the official renderer.

A tool maker who invents something new — "Lorem supports Spline" — ships a Spline player for renderers that want it. Every other reader still shows the still and the label.

## Reasoning

### Why extend `<img>` rather than add `<embed>`

[RFC-0023](0023-remove-shape.md) already folded raster and vector into one `<img>` because format is a renderer detail. A carried Lottie or shader is the same move one step further: the still is the image, and the rest says how it was made. A separate `<embed>` tag would be a second way to place visual media ([P12](../PRINCIPLES.md)), and it would need a separate `poster` that authors could forget. With `<img>`, a plain image is simply the case with no `kind`.

### Why baked, live, and tweakable are one concept

Three needs looked separate: carrying a playable animation, keeping the parameters behind a generated image, and keeping a 3D scene behind a render. They are the same structure — a still, an original, values — differing only in whether a player exists and whether a tool can reopen it. One concept serves all three, and serves whatever a future tool needs.

### Why parameters are admitted under P3

P3 admits what a viewer can see. A parameter that changes the drawn output is part of what the viewer sees, expressed as the values that produce it; re-rendering with a changed `tint` changes the picture. Editor state does not, and stays out (rule 5).

### Why the format stays safe

The lesson of PDF's JavaScript and Flash ([RFC-0045](0045-describe-dont-run.md), *Prior Art*) is that the danger was code running inside the document. Here the document holds no code; players are renderer plug-ins, sandboxed, drawing only in their box. The `.gui` file stays data.

## Alternatives Considered

**A separate `<embed>` tag with a required `poster`** — Rejected. A second way to place media, and a fallback that could be omitted. See *Why extend `<img>`*.

**A separate "recipe" block keyed by `id`** — Rejected. Splits one image's meaning across two places; superseded by `<param>` children on the image itself.

**Allowing `html` or `iframe` kinds** — Rejected. Interface would escape the format and arrive as HTML in a box ([RFC-0045](0045-describe-dont-run.md)).

**Letting plug-ins add vocabulary** — Rejected. Every renderer would speak a different dialect, as Markdown's flavours did.

**No container** — Rejected. Tools would hack one in, as Markdown users did with raw HTML.

## Test Cases

To be exercised in the motion lab before acceptance:

| Case | Expectation |
|---|---|
| A Lottie with `playback="enter"`, no Lottie player | The still is drawn; the renderer reports "lottie, not played" |
| The same, with a Lottie player | Plays when the node appears; the still shows until it loads |
| A shader whose `tint` is `$rose`, theme switched to dark | A live player re-renders with the dark value; without a player, the still is unchanged and reported stale |
| `kind="html"` | Validation error |
| `kind` without `label` | Validation error |

## Unresolved Questions

- **Stale stills.** When a `<param>` uses a token whose value differs in another mode, the still was rendered in one mode only. Should a file carry one still per mode, or should readers report the still as from the default mode?
- **The documented kinds.** Which names make the first list, and who maintains it?
- **Player sizing.** Can a player report a natural size, or is the box always the image's `w` and `h`?
- **Interaction inside a player.** A Rive state machine responds to taps. Is that the player's business (inside its box) while `.gui` links stay outside, or does it need a contract?
