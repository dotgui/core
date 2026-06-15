# dotgui Design Principles

The constitution of the `.gui` format.

These are the durable tenets that govern what the format is and what it is allowed to become. They sit **above** the RFCs. An RFC is a hearing — it argues a single decision. These principles are the law the hearing is held against.

The order of authority is:

```
PRINCIPLES.md   →  what the format must always be          (this document)
RFCs            →  individual decisions, argued and logged (rfcs/)
spec/DOTGUI.md  →  the format as it stands today           (the current law in force)
```

A proposal that conflicts with a principle is rejected **unless the proposal explicitly amends the principle first** (see *Amending a principle*). Silent divergence is not allowed — that is the failure mode this document exists to prevent.

---

## Preamble — what dotgui is

Three founding moves define the format. Everything below is downstream of these.

**1. HTML's good parts, none of its baggage.**
`.gui` keeps what made HTML universal — readable semantic tags, nesting as containment, "open it in a text editor and understand it," a shape every model already knows. It drops the baggage: no `<head>`, no doctype, no meta soup, no scripts, no DOM, no bundler, no dev server, no build step. The markup is XML-*shaped* and relaxed (the JSX position, [RFC-0001](rfcs/0001-xml-over-json.md)) — the readability of HTML without the machinery.

**2. Friction on the render side, not the source side.**
HTML puts the burden on whoever *writes* it (toolchain, DOM knowledge). Figma puts authoring first but locks the *output*. `.gui` inverts this: anyone can write it with a text editor, and the **complexity lives in the renderer**. The language stays small and honest about *what the UI is*; the renderer does the computing, the layout math, and the per-platform translation. This single trade explains most of the rules that follow.

**3. An interchange format — many writers, many readers, both directions.**
`.gui` is a *lingua franca* for UI, the way SVG is for vector art. It is not owned by any tool or platform. It must move design→code, code→design, and design→design without losing fidelity. "A small, well-specified format with many readers and many writers" — an enhancement layer that lets tools and AI talk to each other, not a replacement for any of them.

The single tension these create — *more fidelity wants more in the language, but the language must stay small* — is resolved by one rule, stated as P6: **the language carries intent and meaning; the renderer carries computation and translation.** We encode *what a UI is*, never *how to compute it*.

---

## How to use this document

When a new API is proposed — a tag, a property, a value formula, a convention, a primitive, a token type — run it through every principle below. Each principle ends with a **litmus test**: a single question with a clear pass/fail. A proposal that fails a test is not automatically dead, but the burden shifts to the proposal to justify the exception, in writing, in its RFC.

The principles are grouped by what they govern:

- **What `.gui` is** (P1–P4) — identity.
- **What `.gui` is not** (P5) — the boundaries it must never cross.
- **How it divides labor** (P6) — the language/renderer split that resolves the core tension.
- **How it reads and is written** (P7–P10) — the authoring experience.
- **How it grows** (P11–P13) — the bar and the grammar for admitting change.
- **How it behaves** (P14–P15) — the runtime contract.

The skill `dotgui-rfc` automates this pass. This document is what it reads.

---

# What `.gui` is

### P1 — A neutral interchange format: tool-agnostic and bidirectional

`.gui` belongs to no tool. A source tool's API is an *input* to an extractor — never the format itself ([RFC-0003](rfcs/0003-not-figma-data-model.md)). Any tool can write it (Figma, Sketch, Penpot, a code generator, a human) and any tool can read it; "any extractor can produce raw output, the optimizer does not care where it came from" ([RFC-0009](rfcs/0009-optimizer-separate.md)).

Because it is an interchange format, **round-trip is a first-class constraint**, not an afterthought. It must survive design→code, code→design, and design→design. This is why provenance exists (`source`, `source-node` so a node can be re-exported or diffed, [RFC-0036](rfcs/0036-gui-meta-block.md)), why a diverged instance keeps a `detached-from` origin so it can be re-attached ([RFC-0035](rfcs/0035-detached-from.md)), and why component identity is preserved rather than flattened ([RFC-0008](rfcs/0008-component-instance-system.md)).

> **Litmus test:** Does this work regardless of which tool wrote the file, and does it survive a round-trip in both directions? If it only makes sense coming *out of* one specific tool, or it silently breaks re-import, it fails.

---

### P2 — Platform-agnostic: it renders to iOS, Android, and web alike

This is a different axis from P1. P1 is about *source* tools; P2 is about *target* platforms. A `.gui` file describes UI that must render faithfully on iOS, Android, and the web — so its vocabulary may not privilege any one of them.

Names are chosen because they mean the same thing everywhere: `<row>`/`<col>` over SwiftUI's `<hstack>` or CSS's `flex-row` ([RFC-0006](rfcs/0006-layout-sugar-tags.md)); a 9-point `align` over CSS main/cross-axis terminology ([RFC-0012](rfcs/0012-align-9point.md)); `$token` over CSS custom properties ([RFC-0005](rfcs/0005-token-system.md)); `%` meaning "of parent" on every platform, with `vw`/`vh` reserved for the genuinely viewport-relative case ([RFC-0033](rfcs/0033-color-and-dimension-units.md)); `prefers-color-scheme` rejected as web-only in favor of platform-neutral modes ([RFC-0037](rfcs/0037-token-modes-theming.md)). A `platform` hint may *describe* a file's intended target ([RFC-0036](rfcs/0036-gui-meta-block.md)), but the core vocabulary never bakes one platform in.

> **Litmus test:** Does this concept mean the same thing, and render sensibly, on iOS, Android, and web? If a name or behavior only makes sense on one platform (CSS, SwiftUI, Material internals), it fails — find the platform-neutral form.

---

### P3 — Visually faithful, but not an editor's save file

`.gui` is a portable *visual* export. What appears on screen must survive: stacked fills, gradients, image crops, multi-stroke borders, shadows, blurs, glass, real text metrics ([RFC-0024](rfcs/0024-complete-paint-model.md), [RFC-0025](rfcs/0025-complete-stroke-border-model.md), [RFC-0026](rfcs/0026-text-rendering-fidelity.md), [RFC-0027](rfcs/0027-effects-stack.md)). If fidelity is collapsed away, the file fails at its primary job.

But fidelity has a ceiling: the format captures the *visual result*, not a design editor's full authoring state — no comments, no tracked changes, no document-editing features, no hidden editor metadata ([RFC-0026](rfcs/0026-text-rendering-fidelity.md)). Flattening a layer to a raster preserves pixels but is rejected as a default because it destroys structure ([RFC-0024](rfcs/0024-complete-paint-model.md)). The line is: **everything you can see, nothing you can't.**

> **Litmus test:** Does this preserve something a viewer would actually see on screen? If yes, it likely belongs. If it only preserves editor state the render never shows, it fails — push it out.

---

### P4 — Everything in the file means something

A `.gui` file is a visual print where every mark is intentional and interpretable. An AI reading SVG sees shapes; an AI reading `.gui` sees structure ([RFC-0002](rfcs/0002-not-svg.md)). There is no filler: no meaningless wrappers (the optimizer collapses them, [RFC-0009](rfcs/0009-optimizer-separate.md)), no empty spacer nodes used as layout hacks, no decorative ambiguity — `<rect>` exists precisely so a decorative box reads as *decorative*, distinct from an ambiguous empty `<frame>` ([RFC-0023](rfcs/0023-remove-shape.md)).

Meaning is preserved, not just pixels: tokens keep `$primary` over a raw hex ([RFC-0005](rfcs/0005-token-system.md)); named CSS colors are rejected because tokens already name colors with intent ([RFC-0033](rfcs/0033-color-and-dimension-units.md)); components stay instances rather than duplicated nodes ([RFC-0008](rfcs/0008-component-instance-system.md)); a detached instance still records what it came from ([RFC-0034](rfcs/0034-component-prop-types.md), [RFC-0035](rfcs/0035-detached-from.md)). Every node, every attribute, carries signal a downstream consumer can act on.

> **Litmus test:** Does every part of this carry meaning a reader or consumer can interpret and act on? If it adds nodes/attributes that are noise, filler, or decoration-without-intent, it fails.

---

# What `.gui` is not

### P5 — Not React, not HTML-the-document, not Figma

A UI format drifts toward three gravity wells. The constitution forbids all three. We are an *enhancement layer that lets tools talk to each other* — not a replacement for any of them.

- **Not React (or any framework) — no behavior.** `.gui` is declarative and static. No logic, state, events, reactivity, bindings-that-run, or expressions evaluated at runtime. The producing pipeline is even deterministic and AI-free ([RFC-0010](rfcs/0010-no-ai-in-pipeline.md)); the artifact describes appearance, never behavior.
- **Not HTML-the-document — no document semantics.** No forms, no input/runtime widgets, no accessibility tree, no content-document or SEO concerns. `<line>` was chosen over `<divider>`/`<hr>` precisely to avoid importing document semantics into a UI layout format ([RFC-0023](rfcs/0023-remove-shape.md)). It is a UI surface, not a web page.
- **Not Figma — no authoring state.** No edit history, no editor metadata, no tool internals, no "design-editor save file" ([RFC-0003](rfcs/0003-not-figma-data-model.md), [RFC-0024](rfcs/0024-complete-paint-model.md)). This is the ceiling on P3: be faithful to the *render*, never a clone of the editor.

> **Litmus test:** Does this pull the format toward runtime behavior (React), document/content semantics (HTML), or editor authoring state (Figma)? If it lives in any of those three wells, it fails — no matter how useful it seems.

---

# How it divides labor

### P6 — The language carries intent; the renderer carries computation

This is the rule that resolves the core tension (fidelity wants more; the language must stay small). The format encodes *what a UI is* — intent, meaning, the visual result — stripped of authoring noise. Anything a renderer can *compute or translate* belongs to the renderer, with consistent defaults, not to the file.

Don't encode plumbing the renderer can derive: `strokes-in-layout` was rejected because box-sizing is derivable from context ([RFC-0019](rfcs/0019-rejected-strokes-in-layout.md)); `%` states "of parent" and lets the renderer compute pixels ([RFC-0033](rfcs/0033-color-and-dimension-units.md)). And don't make the *author* solve what the engine can: the fixed root height was dropped because it forced the author — especially an AI — to predict a number the layout engine produces for free; "the format should not make AI authors solve a problem the layout engine can solve automatically" ([RFC-0021](rfcs/0021-root-canvas-model.md)). Renderers also carry capability differences (DOM vs SVG dash/cap/join) without polluting the language ([RFC-0025](rfcs/0025-complete-stroke-border-model.md)).

> **Litmus test:** Is this *intent/meaning* that must be stated — or *computation/translation* a renderer can do with a sensible default? If a faithful renderer could derive it, or it forces the author to compute something the engine could, it belongs on the render side, not in the language.

---

# How it reads and is written

### P7 — Readable and token-efficient, for humans and AI first

The format optimizes for two readers: a person scanning markup, and a model generating or reasoning about it. Of the two, the model is the one that matters most for the future — **the primary author of UI is increasingly an AI, not a hand-typist.** Everything else — terseness for its own sake, cleverness, purity — comes after these two.

Two things follow, and they are distinct. **Comprehension:** names carry meaning on their own, in the vocabulary the audience already uses — `<row>`/`<col>` are how designers describe layout ([RFC-0006](rfcs/0006-layout-sugar-tags.md)); `w`/`h`/`p` are universal inspector/Tailwind shorthands ([RFC-0011](rfcs/0011-w-h-unified-sizing.md), [RFC-0016](rfcs/0016-padding-p-per-side.md)); 9-point `align` matches how designers think ([RFC-0012](rfcs/0012-align-9point.md)). **Token cost:** a format an AI writes thousands of times is judged on what it costs to emit. This is a real design criterion, not an afterthought — and where it matters, it is *measured*, never asserted: inline base64 was measured at ~50% of a token session and is banned ([RFC-0004](rfcs/0004-package-format.md), [RFC-0031](rfcs/0031-images-and-assets.md)).

These two often pull the same way: `<row>` is both how designers speak *and* a stronger generation signal than `<stack direction="horizontal">` — the direction is in the tag, not an attribute that can be forgotten or mistyped ([RFC-0006](rfcs/0006-layout-sugar-tags.md)). When they conflict, comprehension wins for the human reader and token cost is the tiebreaker — but a change that *only* saves keystrokes still has to clear P12 (`sz` was rejected for exactly that, [RFC-0018](rfcs/0018-rejected-sz-shorthand.md)).

> **Litmus test:** Could a competent reader — or an LLM with no prior exposure — understand the line without a lookup table *and* emit it correctly and cheaply? Does the name match what designers/devs already call this thing? If it needs a decoder ring, or it bloats what an AI must write for the common case, it fails.

---

### P8 — One vocabulary, used consistently

An author should encounter *one* vocabulary throughout, never switch dialects mid-file. This is the **single-convention guarantee**.

Inline SVG was superseded because, inside an `<svg>` block, the author was writing SVG (`stroke`, `viewBox`, `cx`), not dotgui ([RFC-0023](rfcs/0023-remove-shape.md) superseding [RFC-0020](rfcs/0020-svg-inline-content.md)). `stroke`→`border` and `color`→`fill` removed SVG/CSS dialects in favor of one UI vocabulary ([RFC-0022](rfcs/0022-fill-and-border.md)). Conventions, once set, apply everywhere: bare-boolean presence ([RFC-0015](rfcs/0015-boolean-presence-convention.md)), `w` for every width including stroke width ([RFC-0025](rfcs/0025-complete-stroke-border-model.md)), the `first=primary, second=secondary` two-value pattern shared by `p` and `gap` ([RFC-0016](rfcs/0016-padding-p-per-side.md), [RFC-0017](rfcs/0017-gap-two-value-wrap.md)).

> **Litmus test:** Does this import a foreign dialect or contradict an existing convention? If an author must context-switch to a different naming world to use it, it fails. Reuse an existing convention before inventing one.

---

### P9 — The common case stays compact; fidelity is opt-in

The 90% case must read cleanly with a single inline value; the rare high-fidelity case gets a structured block — and only then. This progressive-disclosure pattern recurs across the whole format and is non-negotiable.

`fill="#fff"` inline; `<appearance>` only for stacked/image/blend fills ([RFC-0007](rfcs/0007-appearance-block.md), [RFC-0024](rfcs/0024-complete-paint-model.md)). `border="1 $line"` shorthand; the `<appearance><border>` stack only for multiple/dashed strokes ([RFC-0025](rfcs/0025-complete-stroke-border-model.md)). `shadow` shorthand; the `<effect>` stack for many ([RFC-0027](rfcs/0027-effects-stack.md)). Single-style text as attributes; `<segment>` only for mixed styling ([RFC-0026](rfcs/0026-text-rendering-fidelity.md)). "Always use the structured block" is repeatedly rejected for killing the common case.

> **Litmus test:** Does the simplest, most-frequent use stay short and inline? If the design taxes the 90% case to serve the 10%, split it: shorthand for common, structured form for fidelity.

---

### P10 — Conventions over configuration

The common case should require no ceremony. Sensible defaults encode it, so the markup stays quiet and only a deliberate departure needs words.

Absent `w`/`h` means hug for layout and text ([RFC-0014](rfcs/0014-absent-means-hug.md)). Booleans are true by presence, never `="true"` ([RFC-0015](rfcs/0015-boolean-presence-convention.md)). `gap="auto"` absorbs `space-between` ([RFC-0013](rfcs/0013-gap-auto-convention.md)). A good convention makes the attribute disappear in the overwhelming majority of files.

> **Litmus test:** Can a default or convention cover the overwhelming majority of cases, so this attribute only appears on a deliberate departure? If the common case still has to spell it out, fix the default before adding the attribute.

---

# How it grows

### P11 — The grammar: tags, properties, and how values are passed (the formula)

The format expresses everything through a small, fixed grammar. A new API must say where it sits in that grammar and **match the conventions already used there**. This is the first question any proposal answers.

There are two **structural** levels — a node, and something set on a node:

| Level | What it is | Examples |
|---|---|---|
| **Tag** | a structural node in the tree — has identity, nests, or is placed | `<row>`, `<rect>`, `<text>`, `<instance>`, `<grid>` |
| **Property** | something set on a single node | `w`, `p`, `align`, `fill`, `gc` |

And one **value grammar** — the *formula*: how a property's value is actually passed in. A value may be single or multiple, and it is carried in one of a few sanctioned forms, in increasing order of richness:

| Form | When | Examples |
|---|---|---|
| **Inline, single** | one value | `w="100"`, `fill="#fff"` |
| **Inline, multiple** (space-separated) | several values, space as separator, order-independent and type-inferred | `border="1 dashed $line inside"`, `gap="12 8"` |
| **Function formula** | a value with internal structure a flat list can't carry | `linear-gradient(...)`, `calc(...)` |
| **Content / block** (via a tag) | the value is too rich for any attribute, so it lives as the tag's content or children | text string inside `<text>`, `<segment>`s for mixed text, the `<appearance>` block for stacked fills |

Two rules govern the grammar:

- **Choose the lowest rung that works.** Prefer a property over a new tag; and for the value, prefer inline-single over inline-multiple over a function over a content/block form. New tags are the most expensive thing the format can add; escalating the value form is the next most expensive. Escalate only when the value genuinely needs it — this *is* the P9 common-case-compact ladder.
- **Match the conventions at that rung.** A new **tag** normalizes to a base form (`<row>`→`<stack>`, `<rect>`→`<frame>`) rather than adding a second semantics ([RFC-0006](rfcs/0006-layout-sugar-tags.md), [RFC-0023](rfcs/0023-remove-shape.md)). A new **property** follows the established shorthands — short universal names ([RFC-0011](rfcs/0011-w-h-unified-sizing.md), [RFC-0016](rfcs/0016-padding-p-per-side.md)) and the `first=primary, second=secondary` two-value rule ([RFC-0016](rfcs/0016-padding-p-per-side.md), [RFC-0017](rfcs/0017-gap-two-value-wrap.md)). A new **inline-multiple** value is order-independent, sigil-free, and type-inferred like the `border` shorthand — classify each token by its type ([RFC-0022](rfcs/0022-fill-and-border.md)). A **function** or **content/block** form reuses existing value vocabulary (`$token`, `auto`, units, the paint model, [RFC-0007](rfcs/0007-appearance-block.md), [RFC-0024](rfcs/0024-complete-paint-model.md), [RFC-0026](rfcs/0026-text-rendering-fidelity.md)) rather than inventing new syntax.
- **Property names are nouns.** A property names what a node *has* or *is configured with* — `fill`, `radius`, `gap`, `platform`, `role`. Verbs (`is`, `do`) and prepositions (`as`, `by`) are not valid property names: they describe relationships or actions, not configurable state. If a proposed name is not a noun, find the noun form before the proposal advances. ([RFC-0041](rfcs/0041-role-attribute.md))

> **Litmus test:** Can you name where it sits — tag, property, or which value form (inline-single / inline-multiple / function / content-block) — is it the *lowest rung* that works, and does it match the conventions already in use there? If it needs a new tag where a property would do, escalates the value form past what's needed, or invents a syntax that clashes with existing ones, it fails.

---

### P12 — Every concept must pay its tax — consolidate, and keep one obvious way

Each new tag, property, or way-of-doing-a-thing is a permanent cost: more to learn, document, render, and — worst — another way to express something that already had one. The bar is high; the default move is **consolidation, not accretion**.

A 9-point `align` replaced `justify`+`align` ([RFC-0012](rfcs/0012-align-9point.md)); `gap` absorbed `space-between`/`wrap-gap`/`wrap-align` ([RFC-0013](rfcs/0013-gap-auto-convention.md), [RFC-0017](rfcs/0017-gap-two-value-wrap.md)); `w`/`h` replaced four sizing attributes ([RFC-0011](rfcs/0011-w-h-unified-sizing.md)). `sz` was rejected for adding a third sizing syntax to save a few characters ([RFC-0018](rfcs/0018-rejected-sz-shorthand.md)).

And there must be **one obvious way**: "one rule is better than a heuristic" ([RFC-0023](rfcs/0023-remove-shape.md)); "shipping two blessed ways is not acceptable for 1.0" ([RFC-0038](rfcs/0038-composite-token-types.md)). Sugar that coexists with a base form is a pure alias, never a second semantics.

> **Litmus test:** Does the benefit clearly exceed the cost of a new concept *and* a new way to do something? Could consolidation into an existing form achieve the same? Would this create a second blessed way to express one thing? If it only saves keystrokes or forks the canonical path, it fails.

---

### P13 — Fewer, sharper primitives

Prefer composing what exists over introducing something new. Geometry is frames; arbitrary paths are assets, not a tag ([RFC-0023](rfcs/0023-remove-shape.md)). A circle is `<ellipse>` with equal sides — no `<circle>`. Raster and vector collapse into one `<img>` because format is a renderer detail, not an authoring concern.

> **Litmus test:** Can existing primitives already express this, even if a touch less elegantly? If yes, the new primitive fails (and probably P12 too). A new primitive must unlock something genuinely inexpressible.

---

# How it behaves

### P14 — Deterministic and faithful production

The producing pipeline is rule-based and deterministic. No AI, no heuristics, no guessing in the path that *creates* the format ([RFC-0010](rfcs/0010-no-ai-in-pipeline.md)). AI is a *consumer*, never a producer. Extractor and optimizer are separate, and every optimizer transformation either provably preserves the render or is skipped and logged — "visual impact must be zero" ([RFC-0009](rfcs/0009-optimizer-separate.md)). This is what makes the file trustworthy as ground truth: reproducible, diffable, auditable.

> **Litmus test:** Would two faithful producers, given the same input, emit the same thing? Can a consumer trust this literally, with no inference? If its meaning is fuzzy or production-time interpretation creeps in, it fails.

---

### P15 — Honest semantics: fail loudly, never fake fidelity

The format must mean exactly what it says and never imply a capability it lacks. When something can't be represented faithfully, it is surfaced — not papered over.

A missing image renders a visible "asset not loaded" state, never a silent blank ([RFC-0031](rfcs/0031-images-and-assets.md)). A magic default root height was rejected because it would hide clipping — "a magic default is worse than no height" ([RFC-0021](rfcs/0021-root-canvas-model.md)). A heavily-overridden instance is *detached* rather than left implying a fidelity it doesn't have ([RFC-0034](rfcs/0034-component-prop-types.md)), with an honest `detached-from` over an overloaded `component=` ([RFC-0035](rfcs/0035-detached-from.md)). Unsupported effects are reported, not silently dropped ([RFC-0027](rfcs/0027-effects-stack.md)).

> **Litmus test:** When this can't represent something faithfully, does it fail loudly and honestly — or guess, silently degrade, or imply a fidelity it doesn't have? Anything that hides its own limitations fails.

---

## Amending a principle

These tenets are durable, not frozen. A genuinely better idea that conflicts with a principle is not silently admitted and not silently dropped — it is argued openly:

1. The RFC proposing the change must **name the principle it conflicts with** and argue the principle itself should change.
2. It must explain what breaks and what is gained, and update the precedent it overturns.
3. If accepted, the RFC amends this document in the same change. The principle's wording is updated and the RFC is linked from it.

An RFC may *never* quietly contradict a principle while leaving the principle standing. Either the principle governs, or the principle is amended. There is no third path. This is the one rule that keeps the format from diverging from itself over time.

---

## Process notes

- **Every significant decision is an RFC** — accepted, rejected, or superseded. **Rejections are kept**, with a "What to Do Instead," so the same ground is not re-litigated ([rfcs/README.md](rfcs/README.md)).
- **Decide from evidence — and count the tokens.** The strongest RFCs measure cost before deciding — attribute counts across real files ([RFC-0022](rfcs/0022-fill-and-border.md)), token cost of base64 ([RFC-0004](rfcs/0004-package-format.md)), icon line counts ([RFC-0023](rfcs/0023-remove-shape.md)). Because an AI emits the common case thousands of times (P7), **token/character cost of the common case is a standard thing to measure** when a proposal claims to be more compact. Measure the reduction on real files; don't assert a number the RFC can't show (P15).
- **The roadmap scopes what may land when.** `0.1` initial design → `0.2` layout API → `0.3` visual export fidelity → `1.0` locks the visual layer. Anything that changes a data model (multi-value tokens, composite tokens) must land *before* the 1.0 freeze ([RFC-0037](rfcs/0037-token-modes-theming.md), [RFC-0038](rfcs/0038-composite-token-types.md)).
- **Pre-1.0: clarity beats compatibility.** No external-consumer guarantees yet; prefer the right shape over a backwards-compatible one ([RFC-0022](rfcs/0022-fill-and-border.md)). Post-1.0: semver applies — MAJOR breaking, MINOR additive, PATCH clarification.
- **Principles state what's true *today* — don't pre-loosen for a future capability.** A principle is not hedged against work that hasn't shipped. P5 ("not React — no behavior") stays absolute until 2.0 motion/interaction actually lands; *then* the RFC that introduces it re-cuts the React bullet to "no *computed* behavior." This is safe because P6 — not P5's wording — is what holds the line: declared visual states and transitions are intent the renderer performs, never logic the file runs.
- The spec (`spec/DOTGUI.md`) reflects the format *as it stands*. RFCs are how it got there. This document is *why* it is shaped the way it is.
