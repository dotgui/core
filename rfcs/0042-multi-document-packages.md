---
rfc: 0042
title: Multi-document packages — many .guix in one .gui
status: Draft
targets: 0.3
date: 2026-08-22
---

# Multi-Document Packages — Many `.guix` in One `.gui`

## Context

### What we assumed

[RFC-0004](0004-package-format.md) established that `.gui` is always a ZIP package containing exactly one markup document, named `design.guix`. This RFC supersedes both halves of that — the count and the name. One package, one screen. That has held since 0.1, and it was the right assumption to start from: a screen is the unit a designer exports, the unit a renderer draws, and the unit a reviewer looks at.

### What actually happens

Nobody ideates one screen at a time.

They ask to see three variations of the same screen side by side. They design a flow — welcome, sign-up, verify, done — where the screens only make sense in relation to each other. They build a deck. The isolated screen is real, but it is the *end* of the process, not the shape of the process. People think in flows and variations; the format only speaks in single screens.

So authors work around it, two ways, and both are wrong:

**Ten separate `.gui` files.** Every file repeats the same tokens, fonts, styles, and components. Nothing forces the ten to agree — screen 7 can declare `signal` as a different orange than screen 3, and nothing notices. The set exists only in the author's head and in a folder name.

**One document, ten frames under a `<row>` root.** Legal today ([RFC-0021](0021-root-canvas-model.md) permits `<row>` as root) and it does deduplicate properly. But it makes the layout tree lie: ten screens are declared as one screen containing ten things. They cannot have different canvas sizes, cannot carry different `platform` values ([RFC-0036](0036-gui-meta-block.md)), cannot be named, addressed, or previewed individually, and cannot be re-exported or diffed on their own. The layout tree is being used as a filing cabinet.

### Why this matters more than it used to

There is a distinction the format has not yet drawn about itself.

**PNG and SVG are output formats.** You embed them. You put them on a page, you send them, and a browser draws them. Nobody opens a PNG to change part of it. Being a single, whole, indivisible thing is exactly right for an output format — it is the point.

**`.gui` is not an output format. It is an intermediate one.** It exists to be read, modified, translated, and handed onward — design→code, code→design, design→design ([P1](../PRINCIPLES.md)). Nothing consumes a `.gui` file as a final artifact; everything consumes it in order to produce something else.

That changes the question the format should be judged on. An output format is judged on how faithfully it draws. **An intermediate format is judged on how well it can be worked with** — how cheaply a consumer can find the part it needs, change it, and put it back. On that measure, "the file only opens whole" is not a neutral property. It is a cost paid on every single read.

And it is a cost that grows. The primary author of `.gui` is increasingly an agent ([P7](../PRINCIPLES.md)), and agents work in pieces. Asked to change the sign-up screen, an agent should read the sign-up screen. Today it reads the entire flow to find it.

### The precedent

PDF made this exact move. It is a final-form transfer format, one file, many pages, with a shared resource dictionary and page order that carries meaning — and, decisively, no authoring state. It is not an editor's save file. EPUB is the same shape in a ZIP: a container, an ordered spine of documents, shared assets.

Multi-document containers are the settled norm for transfer formats. Single-document containers are the norm for output formats. `.gui` is filed under the wrong one.

This is also the answer to the obvious objection — that many screens in one file is just Figma. It isn't, and the difference is precise. Figma's multi-page model carries canvas coordinates, edit history, and authoring state. PDF's carries an ordered list and a resource table. This RFC takes the second and refuses the first, in writing, under *Non-goals*.

### What this RFC is not proposing

The single-screen package is not being deprecated, replaced, or migrated. It stays the default and stays the normal thing to produce, and `design.guix` remains its conventional filename. One screen, one document, forever. Multi-document is a capacity for designs that genuinely have parts — not a new standard everything moves to.

## Decision

**A `.gui` package may carry one document or many. The document grammar does not change.**

### The load-bearing invariant

> **One `.guix` document is exactly one screen, with exactly one root layout node.**
> This RFC does not change that, and it must never change. Everything below is container structure.

### Single-document packages are untouched

```
checkout.gui  (ZIP)
├── design.guix
├── preview.webp
└── assets/
```

Unchanged, forever. No manifest, no new files, no migration. Every existing `.gui` file remains valid and byte-identical.

### Multi-document packages are flat

Documents sit at the package root, beside the preview. `assets/` remains the only directory.

```
onboarding.gui  (ZIP)
├── 01-welcome.guix
├── 02-signup.guix
├── 03-verify.guix
├── library.guix          ← optional: the package's shared declarations
├── preview.webp
└── assets/
    └── logo.svg
```

**One name is reserved: `library.guix`.** It is never a document. Every other `.guix` at the package root is one, whatever it is called.

**The discriminator is structural, and it is a count, not a name.** One document means single-document; more than one means multi-document. Nothing is special-cased and no filename carries the signal — you tell what you are holding by listing the package, not by looking up a known path or parsing a declaration. This is the same move as RFC-0004's magic-byte discrimination (`PK` vs `<`): the shape is self-evident from the bytes in front of you.

`design.guix` therefore stops being reserved and becomes what it always actually was — a conventional name. A single-document package **should** use it, because a name every producer agrees on is worth having and because it is the one name older readers know to look for. But it is a default, not a rule. A package whose only document is `01-hello-world.guix` is an ordinary, valid single-document package — nothing looks for `design.guix` except consumers that predate this RFC. And a multi-document package may contain a document called `design.guix` like any other. The alternative — forbidding that one name among many — was considered and rejected; see *Alternatives Considered*.

So, concretely, all three of these are valid:

```
hello.gui                 hello.gui                    onboarding.gui
├── design.guix           ├── 01-hello-world.guix      ├── 01-welcome.guix
├── preview.webp          ├── preview.webp             ├── 02-signup.guix
└── assets/               └── assets/                  ├── library.guix
                                                       ├── preview.webp
                                                       └── assets/
```

> ⚠️ **This is the breaking change in this RFC, and it is a change of philosophy rather than of structure.**
>
> Since 0.1 the format has held that a package contains *the* markup document, at *the* known path. Both halves are now gone: there is no fixed path, and there is no guaranteed count. A consumer can no longer open a `.gui` and reach for what it expects — it must list the package and find out what it was given. That is a different contract with every reader that exists today, and it cannot be softened by a default, because a default only helps the producers who follow it.
>
> **A renderer claiming `0.3` is expected to implement this — not to tolerate it.** Multi-document support is not an optional extra within 0.3; enumerating the root, resolving against `library.guix`, and handling one document or many *is* what 0.3 means at the package layer. A renderer that reads 0.3 vocabulary but only accepts `design.guix` does not support 0.3, and should not claim it. See *The version is the contract*.

**A filename is a document's address.** It is what a consumer names to ask for one screen, so it is load-bearing in a way a layer name is not: it should be stable across re-exports and meaningful enough to address. The container already guarantees the names are distinct; what it cannot guarantee is that they stay put.

**Order is the lexical sort of the filenames.** `01-welcome.guix` precedes `02-signup.guix`. Because names are free, the numeric prefix is not decoration — it is the whole ordering mechanism, and a set named `welcome / signup / verify` will sort into the wrong order silently. Where order carries meaning, prefix it. Order is presentation order: the sequence a consumer should show them in. Nothing else is declared about the relationship — whether the documents are flow steps, slides, or platform variants is the consumer's reading, exactly as `<row>` does not declare *why* its children are in a row.

**Every document in a multi-document package declares `0.3` or higher.** Multi-document packaging is 0.3 *structure*, and a version is a contract over structure as much as vocabulary — so a document sitting in such a package cannot honestly claim to be 0.2, whatever vocabulary it happens to use. This is what makes the version load-bearing rather than advisory: it is the only signal a consumer gets that is guaranteed present, and it must not be able to understate the package it lives in.

There are no subdirectories for documents. A package is a flat list of screens plus its assets — the same shape a designer already has in their head.

### Every `.guix` file already has two halves

This is worth stating because the format relies on it everywhere and has never written it down.

A `.guix` document is a **library part** followed by a **screen part**:

```xml
<gui version="0.3" name="Checkout">
  <tokens>  ... </tokens>      ┐
  <fonts>   ... </fonts>       │  library part — declarations
  <styles>  ... </styles>      │  (what this screen is built from)
  <components> ... </components>┘
  <col w="390">                ┐
    ...                        │  screen part — the layout root
  </col>                       ┘
</gui>
```

There is no `<library>` or `<screen>` wrapper tag, and there should not be. The division is carried by **position** — everything before the layout root is declaration, everything from the layout root down is the screen. Naming it with tags would add two lines and an indent level to every file in existence, in service of a boundary the reader can already see ([P7](../PRINCIPLES.md), [P10](../PRINCIPLES.md)).

### `library.guix` shares its library part

Optional, at package root. It is an ordinary `.guix` document — same grammar, same envelope, no new file type. What makes it the library is its filename.

**The rule is positional: a library part shared, a screen part local.** Everything above `library.guix`'s layout root is visible to every document in the package. Its own layout root, and everything under it, is local to `library.guix` and shared with nothing.

That is the whole definition, and it introduces no new concept — the split already exists in every file. `library.guix` only widens the scope of the half that was always declarations.

Two things follow:

**It is forward-compatible.** Because the rule is "above the layout root" rather than a list of blessed tags, any declaration block a future version adds to the top of a document is shared automatically. No amendment to this RFC, no enumeration to keep in sync.

**The library documents itself.** Because `library.guix` may carry a layout root that nobody else sees, its screen part is free to be the package's **style guide** — a rendered page using the components it defines and showing the palette it declares. Definition and documentation in one file, at no extra cost and with no extra concept.

```xml
<gui version="0.3" name="Library">
  <tokens>
    <color name="primary" value="#007AFF" />
  </tokens>
  <components>
    <component name="Button"> ... </component>
  </components>

  <!-- screen part: local to this file, the style guide for the above -->
  <col w="900" p="48" gap="24">
    <text value="Buttons" font-size="24" font-weight="700" />
    <instance component="Button" />
  </col>
</gui>
```

There is no way to share a frame, because a frame is not in the library part.

### Resolution is implicit

A name a document does not declare resolves to `library.guix`. `$primary`, `<instance component="Button" />`, a text style — if it is not local, it is the library's. There is no import, no link, no export list, and no way to write one.

A name that resolves in neither place is an error, surfaced loudly ([P15](../PRINCIPLES.md)). Because resolution is closed inside the package, this is always decidable offline, at parse time, with certainty.

**A document redeclaring a name the library already declares is an error, not an override.** One rule, no cascade, no merge heuristic, no modes. Deliberately the strictest possible resolution: relaxing it later is additive, tightening it later is breaking. The experiment found it fires zero times on a coherently authored set — see *Conclusions*.

### Assets are shared at package root

`assets/` stays where it is and is referenced identically (`src="assets/logo.svg"`) from any document. Producers must deduplicate assets across documents — two documents referencing the same bytes reference the same entry.

### `preview.webp` remains the face of the package

For a multi-document package it is a contact sheet of the documents in order. Per-document previews are deferred (see *Unresolved Questions*).

### Non-goals — pre-rejected, explicitly

These are the next things someone will ask for. They are refused now so the slope is not walked down one accepted RFC at a time:

- **No canvas coordinates.** Documents have order, never x/y positions on a board.
- **No links, transitions, or hotspots** between documents. Interaction metadata remains deferred (`spec/DOTGUI.md`, *Deferred to v2*).
- **No page or folder hierarchy.** The package is flat. `assets/` is the only directory.
- **No cross-document inheritance** beyond `library.guix` and `assets/`. No overrides, no cascade, no per-document token modes.
- **No external references.** `library.guix` lives inside the package and resolves only within it. A document may never reference a token, component, or asset in *another* `.gui` file. Resolution is closed at the package boundary — always.
- **No second library.** Exactly zero or one `library.guix` per package. Multiple libraries would require selectors, which require linking, which is the Figma model.
- **No editor or authoring state.** [P5](../PRINCIPLES.md) is unchanged and unamended.

## Reasoning

### It sits below the language, which is why the bet is cheap

[P6](../PRINCIPLES.md) divides what the language carries from what the renderer computes. This proposal sits below both — it is container structure, the same layer RFC-0004 operates on. `<gui>` is untouched. The root stays single. No tag, property, or value form is added, so [P11](../PRINCIPLES.md)'s grammar is not extended; RFC-0004 is the precedent that container layout is outside the grammar's jurisdiction.

That matters for the cost of being wrong. A tag or an attribute is permanent — once authors write it, it must be supported forever. A container convention is not: if this turns out to be a mistake, it is dropped without a single byte of markup changing meaning. This is one of the cheapest places in the format to make a reversible bet.

It also leaves RFC-0021 untouched. The single-root rule is not amended, relaxed, or worked around — a document still has exactly one root, and screens are separated by being separate *documents* rather than by inventing adjacency semantics inside a layout tree. That matters because the layout tree is precisely where canvas coordinates would eventually try to appear.

### Named documents make partial reads possible

The value is addressability, and the mechanism is the filename.

An agent asked to change the sign-up screen opens `02-signup.guix`. Under the alternatives it has no such option. With ten separate packages it must first work out *which file* is the sign-up screen — the filename is a guess, and confirming it means opening several. With one document holding ten frames, there is no addressable unit at all: the sign-up screen is a subtree somewhere inside a large document, and finding it means parsing the whole thing.

This is the same reason a codebase is many named files rather than one large one. Not to save bytes — so a reader can go straight to the part it needs.

### Granularity is the benefit; tokens were the wrong yardstick

The experiment removed the size argument (*Conclusions 1*), and the deck work since has confirmed it from the other side: restructuring a presentation into many documents did not help with tokens, and did help with streaming, updating, reuse, and organization. That split is not a consolation prize. It is the benefit stated precisely.

Tokens and bytes measure **size**. Everything this RFC delivers is **granularity** — the package gaining a unit of work smaller than the whole. A single-document package has exactly one unit, and that unit is *all of it*, which pins the cost of every operation to the cost of the entire design:

| Operation | One document | Many documents |
|---|---|---|
| Send one screen | the whole set travels | that one file travels |
| Stream to a consumer | nothing is usable until the last byte | each document is usable as it lands |
| A malformed screen | the design is unreadable | that document is unreadable, the rest are fine |
| Edit one screen | rewrite the whole file | rewrite one file |
| Two authors at once | serialized — one writer | one document each |
| Diff and review | every change touches the same file | changes localize to the screen that changed |
| Cache or re-render | any byte invalidates everything | invalidates the changed document |
| Organize | layer names inside a tree | filenames, ordered, readable without parsing |

Three of these carry design weight and are worth stating outright.

**Streaming is structural, not an optimization.** A `.guix` document cannot be acted on until its root closes — XML offers no earlier guarantee, and a partial layout tree has no useful meaning. Under one document that means *a consumer waits for all twelve screens before it can draw the first*. Under many, screen one is done when its file is done. A producer emits in order, a consumer works in order, and no protocol is needed to arrange it: it falls out of the documents being separate files in a defined order.

**Failure stops being total.** Today a single malformed tag anywhere costs the entire design, because there is nothing smaller to fail. With many documents the blast radius is one screen, and a consumer can report *eleven screens, one broken* instead of *unreadable*. This is not a softening of [P15](../PRINCIPLES.md): the broken document still fails loudly, by name, and is never partially rendered or guessed at. What narrows is the *scope* of the failure, not its volume. The renderer contract this implies is not settled here — see *Unresolved Questions*.

**Reuse gets an addressable source.** A screen worth reusing is a file, so reusing it is copying a file. Under one document it is a subtree somebody has to locate, select, and lift out without disturbing its siblings.

None of these properties are novel, and that is the argument. Every transfer format that carries parts arrives here — PDF has pages, EPUB has a spine — because this is what working with a multi-part thing requires. `.gui` did not choose single-document for an intermediate format; it inherited it from output formats (*Context*).

### One library is a stylesheet, not a library system

`library.guix` introduces no new concept. It is the `<tokens>` block that already exists in every file, hoisted one level to package scope, with the same syntax and the same `$name` resolution. What it adds is a *single source*: within a package, there is exactly one definition of `$signal`, and a document that disagrees is an error rather than a silent divergence.

Resolution is closed inside the ZIP. Nothing crosses a file boundary, so there is no dependency graph, no version skew, no broken links, no registry — and RFC-0004's promise survives intact: you hand someone the `.gui` and they have everything. The moment a library could point at *another* `.gui` file, all of that inverts. That is the line, and it is easy to hold because a ZIP cannot reach outside itself.

### The version is the contract, and checking it is the renderer's job

[P15](../PRINCIPLES.md) demands that an unrepresentable case surface rather than silently degrade. The guarantee is the version number, and it is the only one this RFC relies on.

A multi-document package is `0.3`, and every document in it says so. A renderer built for `0.2` reads that number, knows the file uses structure it was never built for, and refuses honestly. That is the entire mechanism, and it is what version numbers are already for.

An earlier draft of this RFC claimed a second, structural signal — a `0.2` reader looking up `design.guix`, failing to find it, and erroring before it ever parsed a version. That argument is withdrawn. It only protects against a reader that *ignores* the version field, and such a reader is already unsafe in every other direction: it would equally swallow 0.3 vocabulary it cannot draw. A format cannot be designed around consumers that skip the field whose only purpose is to be checked. Adding a naming rule to shield them would have bought nothing real and cost the rule its only exception.

**Renderer support is versioned and cumulative, the way browser support is.** A renderer does not implement "dotgui"; it implements a set of spec versions, and it must say which:

| A renderer that supports | must |
|---|---|
| `0.2` | expect exactly one document, look it up at `design.guix`, and **refuse any document declaring a version it does not implement** |
| `0.3` | enumerate the `.guix` files at the package root, treat `library.guix` as declarations rather than a screen, accept one document or many, resolve unresolved names against the library — and implement `0.2` as well |

This is the browser model, and it puts the burden where it belongs. A 0.2-only renderer meeting a 0.3 file is not a format problem to be engineered around; it is a renderer that needs updating, and the version number is how it finds that out. The corollary is that the burden is real: a renderer that wants to read 0.3 packages has to do the enumeration, and a producer cannot assume an old renderer will cope.

A full conformance model — what a renderer must implement to claim a version, how partial support is declared, what a validator checks — is larger than this RFC and belongs in its own. What is settled here is the minimum above.

### Timing: it has to land pre-1.0

Pre-1.0, breaking changes are free. Post-1.0, semver applies and a container-level change becomes a MAJOR. The package model is the one layer every consumer touches, so this has to land while breaking changes are still free — it targets 0.3, alongside the other additions in that version.

---

## Experiment

[P7](../PRINCIPLES.md) requires that cost claims be measured rather than asserted — the precedent is RFC-0004 measuring inline base64 at ~50% of a token session. This proposal was measured before it was argued, and the measurement changed the argument.

### Method

A real 12-slide presentation (`onda-r2-keynote.gui`, 1920×1080 slides, authored as a single document with 12 frames under a `<col>` root) was restructured three ways from the same source tree, with one shared serializer so byte counts are comparable, and token counts taken with a real BPE tokenizer rather than a bytes-per-token estimate.

| | Arrangement |
|---|---|
| **A naive** | 12 separate packages, full header copied into each |
| **A pruned** | 12 separate packages, header reduced to what each slide references |
| **B** | one document, 12 frames under a `<row>`/`<col>` root — the file as authored |
| **C** | one package, 12 documents + `library.guix` — this RFC |

A is measured twice deliberately. *A naive* is what an author actually produces, human or agent: writing slide 7 as its own file, you cannot know which subset of declarations it needs until after the slide is written, so you emit all of them. *A pruned* is the theoretical best case, requiring either foreknowledge or a stripping pass. Including it keeps the comparison honest — it is the strongest possible version of "just use separate files".

### Results

| | A naive | A pruned | B | C |
|---|---|---|---|---|
| Files to hand someone | 12 | 12 | **1** | **1** |
| Packaged bytes | 99,563 | 87,651 | **10,019** | 13,895 |
| Tokens to author all 12 | 29,567 | 5,669 | **5,453** | 5,627 |
| — vs B | +442% | +4% | — | +3% |
| Tokens to read one slide | 2,473 | **486** | 5,453 | 2,480 |
| Tokens per further slide, warm | 2,464 | 472 | 0 *(all loaded)* | **287** |
| One screen addressable? | by guess | by guess | **no** | **by name** |
| Palette forced consistent? | no | no | **yes** | **yes** |

Supporting detail:

- In *A naive* the header is **2,162 tokens, identical in all twelve files**. On the lightest slide — which references four declarations — 93% of the file is header it never touches.
- The keynote was **already fully componentized**: 5 components, 20 instances, and zero remaining cross-slide repeated structure. B had already extracted everything extractable.
- Hoisting all declarations into `library.guix` produced **zero name conflicts**, because one author wrote all twelve slides coherently.
- `library.guix` is 39% of package C at twelve slides — a fixed cost that amortizes as the document count rises.

### Conclusions

**1. The deduplication argument does not survive.** It was the original justification for this RFC and the measurement removed it. Against *A naive* the saving is real and large (+442%), but against B there is no saving at all — C is 3% *worse*, from twelve `<gui>` envelopes. A well-built `<row>` deck already deduplicates everything. Any version of this RFC that argues size will be refuted by its own data.

**2. The benefit is granularity; addressability is the part of it that has a number.** Reading one slide costs 5,453 tokens under B and cannot be improved — B has no smaller unit than the whole file. C halves it immediately and, once the library is in context, each further slide costs a fraction of the alternatives. The advantage widens with document count as the library amortizes. The rest of the benefit never appears in a token count at all: streaming, partial send, scoped failure, localized edits and diffs, and organization are consequences of the same smaller unit. The deck work found exactly that split — no token saving, everything else better — which is why the argument is made on granularity and not on size (*Reasoning*).

**3. Separate files are stronger than assumed, in one narrow respect.** *A pruned* is the cheapest single cold read of any arrangement. Its costs lie elsewhere: an order of magnitude more authoring tokens in the form anyone actually writes, roughly six times the packaged bytes, no addressing better than a filename guess, and nothing forcing twelve screens to agree on a palette.

**4. The strict "collision is an error" rule is right, and cheap.** It fired zero times on a coherently authored set. On five independently-authored files from `examples/`, the same check found 29 shared declaration names of which **20 disagreed on value** — the exact silent divergence the rule is meant to catch. It stays quiet on good input and loud on bad.

**5. Existing files cannot be mechanically migrated.** Those 20 conflicts are not a bug in the rule; they are evidence that independently-authored screens are not a set. Retrofitting requires a human deciding which value wins.

**6. The true cost is not measurable in tokens.** Implicit library resolution — "not declared here, so it is the library's" — is new semantics that must be specified, validated, and error-reported. That is the actual price of this RFC, and no byte count captures it.

---

## Alternatives Considered

**Do nothing — one container, screens as children** — The status quo, and the serious alternative. One root (`<col>` or `<row>`) with each screen as a child `<frame>`; the root stays single, exactly as RFC-0021 requires. The experiment *strengthened* this option: it matches or beats this RFC on every size metric, and a well-built example already extracts every shared component, leaving nothing for a library to dedupe.

It has to be defeated on one specific point, and only one: **it has no unit smaller than the whole file.** Every read of one screen costs the entire design, and that never improves with better authoring — it is a property of the structure. Where a design is only ever viewed whole, this form remains correct and this RFC should not be used for it.

It is also honest about what it costs: the layout tree is made to say that ten screens are one screen containing ten things. Nothing breaks, but the structure stops describing what the file actually is, and any consumer wanting one screen has to infer which subtree is a screen and which is a component of one.

**A `documents/` subdirectory** — Rejected. Grouping documents under a directory is tidier to list but adds a path segment to every address (`onboarding.gui` → `documents/02-signup.guix`) and introduces a hierarchy where none is needed. Screens are the package's primary content and belong at its root, the way the single document already does. The cost of flatness is one reserved filename, which is cheaper than a directory convention plus the temptation to nest inside it.

**A manifest file (EPUB's OPF model)** — Rejected. A manifest would carry order, names, and relationships explicitly, but introduces a second file format to specify, parse, validate, and keep from drifting. [P10](../PRINCIPLES.md) says a convention should cover the overwhelming majority so the configuration never has to be written. Lexical filename order is deterministic ([P14](../PRINCIPLES.md)), self-evident when the ZIP is listed, and impossible to desynchronize from the files it describes. Note that `README.md` currently describes `.gui` as "a zip with a manifest" while the spec defines none; this RFC settles that as *no manifest*, and the README should be corrected.

**A version flag to signal multi-document** — Rejected as redundant. The document count is the signal and the format version already states the contract. A flag would be a third source of truth about the same fact.

**Forbidding `design.guix` in a multi-document package** — Rejected. The case for it is not renderers, which have a version to check, but the consumers that never parse at all: tooling that fetches a known path directly — gui.farm serves any screen's raw markup at `<url>/design.guix` — would silently retrieve one screen of twelve and have no way to know the rest existed. The rule would make that fetch miss loudly instead. It was rejected because it buys that protection at the price of the only carve-out in an otherwise exceptionless rule, and it protects the wrong layer: a path-fetching tool reading a 0.3 package is a tool that has not been updated, exactly like a 0.2 renderer, and the answer for both is the same. Tools that address a document by a fixed name should address it by enumeration instead. Noted as a drawback rather than legislated away.

**Per-document metadata only; no `library.guix`** — Rejected. This deduplicates assets but not declarations, and forfeits the single-source guarantee that prevents twelve screens from disagreeing on a palette. The experiment shows the byte saving was never the point; the consistency is.

**`library.guix` declarations as overridable defaults** — Rejected for now. An override cascade is a heuristic, and "one rule is better than a heuristic" ([RFC-0023](0023-remove-shape.md)). Collision-is-an-error is strictly more conservative and can be relaxed by a later RFC without breaking any file written under this one.

**Typed relationships (`kind="flow" | "deck" | "variants"`)** — Deferred, not rejected. It would satisfy [P4](../PRINCIPLES.md) more completely by making the relationship between documents explicit rather than inferred, but requires either a manifest or a new root attribute, and the ordering convention already carries the actionable part.

## Drawbacks

- **It creates a second way to ship a set of screens** — N packages, or one package with N documents. [P12](../PRINCIPLES.md) fails anything that forks the canonical path. The mitigation is the invariant at the top of *Decision*: a *screen* still has exactly one representation, and the fork exists only at transport level, where a file-versus-folder choice is already unavoidable. This is a mitigation, not an elimination, and it remains the strongest objection.

- **Implicit resolution is new semantics.** Named in *Conclusions* as the real cost. It must be specified, validated, and reported on, and it is a rule every future reader of the format has to learn.

- **It is not free at small scale.** The library is a fixed cost — 39% of a twelve-document package. Below roughly three documents it is pure overhead and the single-file form is simply better.

- **The non-goals are a promise, not a mechanism.** Nothing structurally prevents a future RFC from adding coordinates or links between documents. The defense is review discipline against [P5](../PRINCIPLES.md), which is the same defense the format already relies on.

- **`preview.webp` weakens as "the face of the file."** RFC-0004 makes the preview load-bearing. A contact sheet of twelve screens at thumbnail size conveys much less than one screen at thumbnail size.

- **Existing files cannot be auto-migrated.** Twenty value conflicts across five real files; resolving them requires a human decision about which value is correct.

- **The read-side saving depends on consumers doing partial reads.** Named documents make it possible to open one screen out of twelve, but a naive consumer that unpacks and reads everything gets no benefit. The mechanism is sound; the tooling has to use it. Kit and the CLI should expose document-level reads as the default path, not an advanced option.

- **Ecosystem assumes one file, one screen.** The gui.farm catalog accepts one screen per contribution; the Figma plugin exports one selection to one package. Both need work, and downstream tools that hardcode `design.guix` break by design.

- **Name-fetching tools can be silently wrong, and this RFC chooses to let them.** Because `design.guix` is no longer forbidden among many, a consumer that fetches that path without enumerating or parsing — gui.farm's `<url>/design.guix` is a live example — may retrieve one screen of twelve and present it as the package. This is the cost of refusing the carve-out (*Alternatives Considered*), and it is the one place where the "fail loudly" guarantee rests on tooling being updated rather than on the format's own structure.

- **Free names cost single-document packages their old-reader compatibility.** A single-document package named `checkout.guix` is entirely readable by a 0.2 renderer in every way that matters, but that renderer looks up `design.guix` and finds nothing. It fails safe, but it fails a file it could have drawn. The mitigation is convention rather than rule: `design.guix` remains the recommended name for single-document packages precisely so this does not happen by accident.

- **A lone `.guix` becomes less portable.** Pulled out of its package, it may no longer resolve its tokens. The counter is that RFC-0004's thesis is already that *the package* is the unit you hand someone.

## Unresolved Questions

These are what stand between Draft and Proposed. The direction is considered sound; none of the below is settled.

- **The edit case has not been tested.** Everything measured so far is authoring and reading. The case this RFC exists for is an agent *modifying* one screen out of many and writing it back. That test has not been run, and it is the one that either confirms the design or kills it.
- **A flow has not been tested, only a deck.** A presentation is the friendliest possible input — uniform canvas size, one author, one visual system. A genuine product flow with mixed platforms and screen sizes may behave differently.
- **Where is the crossover?** The library is 39% of a twelve-document package. At what document count does multi-document stop being overhead and start paying — three, five, ten? This should be a documented guideline, not folklore.
- **Should the relationship between documents be typed?** Ordering alone leaves "three variants of one screen" and "three steps of a flow" indistinguishable, which sits uneasily with [P4](../PRINCIPLES.md).
- **The renderer conformance model needs its own RFC.** This RFC states the minimum (*Reasoning*): support is versioned, cumulative, and a renderer must refuse a version it does not implement. It does not define how a renderer *declares* what it supports, whether partial support is expressible, or what a validator checks. Freeing document names moved weight onto the version number, so the thing now carrying the guarantee is the thing least specified.
- **Is a package with one invalid document an invalid package?** Scoped failure is one of the reasons to want many documents (*Reasoning*), but the contract has to be written down: does a consumer reject the whole package, or read the valid documents and report the broken one by name? [P15](../PRINCIPLES.md) forbids silent degradation under either answer — the open question is whether a loud, scoped failure counts as the package failing. Current lean: the package is readable, the document is not, and a consumer must say so explicitly rather than quietly presenting eleven of twelve as if that were the set.
- **Per-document previews.** Sibling files (`02-signup.webp` beside `02-signup.guix`) would keep each screen's face intact, at the cost of a second convention and larger packages.
- **Is there an upper bound on document count?** A 200-slide deck in one package is technically valid and practically hostile to every consumer. A soft limit with a linter warning may be warranted.
- **Which component cases does the positional rule not cover?** Components are shared like every other declaration — settled, and they are the bulk of what a library is worth. But a few interactions with the component system are genuinely unanswered and may need pre-rejecting or their own RFC: a `detached-from` origin ([RFC-0035](0035-detached-from.md)) that points across documents; a `component`-typed prop ([RFC-0034](0034-component-prop-types.md)) on a library component whose slot is filled by a *document-local* component, which would make the library depend on a document; and whether component IDs must be unique package-wide. None of these arise in the tested deck, whose components use only string props — but RFC-0034 is still Draft and supersedes RFC-0008, so this should be revisited once the component system settles.
- **Does `platform` become a package-level concept?** If documents in one package carry different `platform` values ([RFC-0036](0036-gui-meta-block.md)), consumers need a stated rule for what the package as a whole targets. Current lean: nothing — read it per document, assume no default.
