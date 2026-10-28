---
rfc: 0046
title: Identity and source ids — addressing nodes in a file, and tracing them to their source
status: Accepted
targets: 0.3.7
date: 2026-10-16
updated: 2026-10-28
---

# Identity and Source Ids — Addressing Nodes in a File, and Tracing Them to Their Source

## Context

### Two questions every consumer eventually asks

Anything that does more with a `.gui` file than draw it asks one of two questions about a node:

1. **"Which node in this file?"** — a component prop that overrides a label, a link that fires when a button is tapped, a transition that moves an icon, a recipe that regenerates an image. Each has to point at a node and be sure it lands on the right one.
2. **"Which layer in the tool this came from?"** — an exporter refreshing a screen, a diff between two exports, an importer putting a file back into a design tool, a consumer that attaches behaviour to designed layers. Each has to connect a node back to the thing it was made from.

The format answers neither question in general. It answers each one in a single special case, in a different way.

### Where the format has it today

| What exists | Where it is allowed | What it answers | Where it falls short |
|---|---|---|---|
| `id` | Only inside component bodies ([RFC-0008](0008-component-instance-system.md), `spec/DOTGUI.md` *Id generation*) | "Which node?" — but only for a prop's `target` | Screen nodes cannot have one. Nothing outside a component can be pointed at. |
| `id` generation rule | Every node in a component body gets `id` = its layer name in kebab-case, `-2`, `-3` on collision | — | Renaming a layer in the source tool silently changes the id and breaks every `target` that named it. And every component node gets one, whether anything points at it or not. |
| `target` on `<prop>` | A direct id in the component's own body | "Which node?" | Cannot reach a node inside a nested instance. Overriding the label of the second tab inside a tab bar has no expression. |
| `<gui source>` ([RFC-0036](0036-gui-meta-block.md)) | Once per document | "Which tool?" | Works. Kept unchanged by this RFC. |
| Nothing per layer | — | "Which layer?" | No node, not even the root, can be traced back to the layer it was exported from. [RFC-0036](0036-gui-meta-block.md) dropped its draft `<meta source-node>` and left the root's id to this RFC. |
| `detached-from` ([RFC-0035](0035-detached-from.md)) | Frames that used to be instances | "Which component?" — for one case | Records a component origin only, only when an instance was detached. |
| `debug-id` (Figma exporter, debug mode) | Every node, debug builds only | "Which layer?" | Not part of the format. Consumers that need it switch on debug output or patch the exporter. |

The last row is the clearest signal. Consumers already need a per-node link to the source layer badly enough to switch on debug output to get it. One such consumer, which attaches behaviour to designed layers, patches the Figma exporter's `debugAttrs()` as the file loads, purely to get each node's Figma id. A format feature that consumers rebuild out of debug output is a format feature that is missing.

### Why now

Everything planned after this RFC points at nodes:

- **Nested overrides** — the most common reason an instance is exported as a plain frame today — need a way to point *through* an instance at a node inside it.
- **States and smart transitions** need to know that the knob in the `off` variant and the knob in the `on` variant are the same knob.
- **Flow** needs to say *which* node is tapped.
- **Motion** needs to say *which* node moves.
- **Recipes** need to say *which* image was generated.

Each of those could invent its own way of pointing. That is how a format ends up with five addressing schemes. This RFC settles addressing once, before any of them is written, so that every later RFC says `target="…"` and means the same thing.

And the round-trip side is no longer optional. [RFC-0042](0042-multi-document-packages.md) makes a `.gui` able to carry a whole product — a library and every screen — and [RFC-0043](0043-standalone-guix.md) makes single screens servable and refreshable one at a time. Both are only useful if a re-export can be matched to the previous one node by node. That matching is the second question, and it has no answer today.

### How each tool identifies a layer

Every tool that writes `.gui` already has its own notion of identity. They do not agree, and they cannot be made to:

| Source | Native layer id | Unique within | Notes |
|---|---|---|---|
| Figma | `336:1697` | one Figma file | Inside an instance, a layer's id is a chain: `I336:1697;12:4` — Figma's own encoding of "layer `12:4` of the component, as it appears in instance `336:1697`". Library components live in a *different* file, so their ids collide with ids in the current file. |
| Penpot | a UUID, e.g. `4f2c1d6e-…` | globally | ~25 tokens per reference. |
| Sketch | `do_objectID`, a UUID | globally | Same cost as Penpot. |
| Pencil, Framer, others | tool-specific | tool-specific | The format does not need to know the scheme. |
| Code generator | file and symbol, if anything | the codebase | May have no per-node identity at all. |
| HTML capture | an element `id`, when the page set one | the page | Most captured nodes have no stable identity. A CSS selector is a position, not an identity. |
| A person, or an AI, writing from scratch | none | — | There is no source to point back to. |

Two things follow from this table. First, no single id scheme can be *the* id: adopting any one of them makes the format the property of that tool ([P1](../PRINCIPLES.md), [RFC-0003](0003-not-figma-data-model.md)). Second, a large and growing share of files — hand-written and AI-written ones — have no source identity at all, and still need nodes that can be pointed at.

## Decision

**Identity has three parts, each stated once, where it belongs:**

| | `id` | `source-id` | `<gui source>` |
|---|---|---|---|
| Answers | "Which node in *this file*?" | "Which layer in *the source*?" | "Which tool is *the source*?" |
| Lives on | any node | any node | the document, once |
| Is | A name in the file — like a variable name | A foreign key into the source | The table that foreign key points into |
| Written by | Anyone: people, AI, exporters | Exporters, only for a round trip | Exporters only |
| Looks like | `id="cta"` | `source-id="336:1697"` | `<gui source="figma">` |
| Used by | props, flow, motion, recipes, agents | re-export, diff, re-import, consumers that attach behaviour to source layers | anything reading a `source-id` |
| When a node is copied | **Must** change — two nodes cannot share it | **May** stay — the copy is honestly derived from that layer | — |
| When the file moves to another tool | Stays — references keep working | Changes — it now points into the new tool | Changes with it |
| Rendered | Never | Never | Never |

The names say how the parts relate. `source-id` is the id *in the source*; it sits beside `id`, the id *in this file*; and it is read against `source`, which names the tool. A reader who has never seen this RFC can work out all three from the names alone.

### The core rule

> **`id` appears only where something points at the node. `source-id` appears only where the node was exported from a source.**

Neither attribute is filler, and neither is required on every node. A node carries:

- **Neither** — the common case in a hand-written or AI-written file.
- **Only `source-id`** — the common case in an exported file.
- **Only `id`** — a node a prop, link, transition, or recipe points at, in a file with no source.
- **Both** — a node that was exported *and* is pointed at. This is a small share of any file, and it is the only place the two appear together.

The overlap that makes the two look like one concept mostly does not happen in practice, because each attribute is only written when its own job exists.

### Part 1 — `id` on any node

```xml
<col id="settings">
  <text id="title" value="Settings" />
  <instance id="nav" component="compset-tabbar" />
</col>
```

1. **Any node may carry `id`.** This lifts the component-body-only restriction of [RFC-0008](0008-component-instance-system.md).
2. **Format:** lowercase kebab-case, beginning with a letter — `[a-z][a-z0-9-]*`. This is the form the generation rule already produces. It contains no `/`, which keeps paths (Part 2) unambiguous.
3. **Optional, except when referenced.** A node that something points at must carry an `id`. A node nothing points at should not.
4. **A reference to an id that does not exist is an error** ([P15](../PRINCIPLES.md)).
5. **Two nodes sharing an id in the same scope is an error.**
6. **Scopes:**
   - **The screen tree of each document is one scope.** Ids are unique within a document, not across a package — two screens may both have a `title`.
   - **Each component body, and each variant body, is its own scope.** `label` inside a button and `label` inside a card do not collide.
   - **Slot content belongs to the scope that wrote it.** Content passed into an instance's `<slot>` ([RFC-0044](0044-slots.md)) is written in the screen, so it lives in the screen's scope and is addressed directly, not through the instance.
   - **Component ids are unique across the whole package** — `library.guix` and every document. This settles the question [RFC-0044](0044-slots.md) left open: references into components must resolve without knowing which document declared them.
7. **Ids are separate from token names.** `$primary` and `id="primary"` do not collide; tokens are always referenced with `$`.

### Part 2 — Paths through instances

A plain id reaches any node in its own scope. To reach a node inside an instance, a reference names the instance, then the node inside its component, separated by `/`:

```xml
<component-set name="Tab bar" id="compset-tabbar">
  <variant id="comp-tabbar-default" style="default">
    <props>
      <prop name="first-label"  type="string" target="tab-1/label" />
      <prop name="second-label" type="string" target="tab-2/label" />
    </props>
    <row id="bar" gap="8">
      <instance id="tab-1" component="comp-tab-item" />
      <instance id="tab-2" component="comp-tab-item" />
    </row>
  </variant>
</component-set>

<instance component="comp-tabbar-default" first-label="Library" second-label="Settings" />
```

1. **Form:** `instance-id/node-id`, extended as deep as needed: `nav/tab-1/label`. One inline value, the lowest rung of the grammar ([P11](../PRINCIPLES.md)).
2. **A path starts in the scope where the reference is written.** In a component body, the first segment is an instance in that body. In a screen, it is an instance in that screen.
3. **Each segment but the last must name an `<instance>`.** The next segment is resolved in that instance's component body.
4. **Paths only cross instance boundaries.** Inside one scope a plain id is already unique, so a path never spells out ordinary nesting — `card/header/title` is not a path unless `card` and `header` are instances.
5. **A path that does not resolve is an error**, the same as a missing id.
6. **This is how nested overrides work.** A component exposes a nested node as an ordinary prop whose `target` is a path. The instance sets the prop like any other. [RFC-0034](0034-component-prop-types.md) rejected `<override>` children on instances; this RFC keeps that decision and adds no syntax to `<instance>` at all.

### Part 3 — `source-id` on any node, read against `<gui source>`

```xml
<gui version="0.3.7" name="Settings" source="figma" source-id="336:1697">
  <col w="390">
    <text source-id="336:1702" value="Settings" />
    <instance source-id="336:1710" component="comp-tabbar-default" />
  </col>
</gui>
```

1. **Any node may carry `source-id`**, including the `<gui>` root, components, variants, and instances.
2. **It is never required.** `source-id` has one job: letting a node be traced back, so it can be refreshed, diffed, or synced into the tool it came from. An export that is not meant to go back writes none. An export that is writes it on the nodes the tool wants to track — every node, or only some — and on no others. Whether to write it is the exporter's option, normally the user's choice at export time.
3. **The value is whatever the tool needs to find that thing again, bare.** Usually the layer's own id. For a component that lives in a library, it may be the tool's global component key instead. The tool chooses, and publishes the choice as a guideline in [`spec/SOURCES.md`](../spec/SOURCES.md). No tool prefix: which tool it belongs to is stated once, by `source` on the document's root.
4. **`source` is unchanged** from [RFC-0036](0036-gui-meta-block.md): an open string on `<gui>` naming the tool, with recommended values `figma`, `penpot`, `sketch`, `html`.
5. **A document that carries any `source-id` must declare `source` on its root.** A `source-id` with no `source` to read it against is meaningless, and is an error ([P15](../PRINCIPLES.md)).
6. **One source per document.** Every `source-id` in a document belongs to that document's `source`. A node brought in from a different source — a node copied from a Penpot export into a Figma-exported screen — drops its `source-id`. Under this document's source it cannot be traced, and keeping the value would point it at the wrong layer in the wrong tool.
7. **A `source-id` is read against the document that declares the node.** In a multi-document package ([RFC-0042](0042-multi-document-packages.md)), each document — including `library.guix` — has its own `source` on its root. A node inside a component body is read against the source of the document that declares the component, wherever the component is used.
8. **The value is opaque to the format.** The format never parses it, never compares its parts, and never derives anything from it. Only the tool named by `source` reads it.
9. **Uniqueness belongs to the tool.** A `source-id` must let the tool find one thing unambiguously in the file, project, or library the export came from. Two different nodes may share one only when one is a copy of the other (*How each party uses this*).
10. **The format does not record which source file a document came from.** No file key, no file name, no URL. A `source-id` is resolved against a source file that the consumer is told about — by the user, or by its own records — when it performs a round trip. See *Why the source file is not recorded*.
11. **Exporters only.** A hand-written or AI-written file has no source and omits both `source-id` and `source`, the same rule [RFC-0036](0036-gui-meta-block.md) sets for `source` and [RFC-0035](0035-detached-from.md) sets for `detached-from`. An AI emitting `source-id` on markup it wrote from scratch is misusing it.
12. **Never rendered.** A renderer ignores it. It changes nothing on screen.
13. **On the root, `source-id` is the exported frame's id.** The root is a node like any other, so the exported frame is traced the same way every other node is ([P12](../PRINCIPLES.md)). It is what the first draft of [RFC-0036](0036-gui-meta-block.md) called `<meta source-node>`.
14. **A source with no layer ids writes `source` and nothing else.** A code generator, or a capture with nothing stable to point at, states the tool and writes no `source-id`. The file came from that tool; no node can be traced further.
15. **Inside component bodies, nodes carry the main component's ids.** An instance carries its own `source-id`. Nodes *inside* an instance are never written out — the instance is a reference — so the tool-specific ids of instance sublayers (Figma's `I336:1697;12:4`) never appear. If a consumer needs one, it composes it from the instance's `source-id` and the component node's `source-id`, using the same path that addresses it in Part 2. That composition is the tool's job, not the format's.

### Source guidelines

The format does not parse `source-id`, but a tool that reads another tool's output needs to know what it is reading. So each source publishes a short guideline in [`spec/SOURCES.md`](../spec/SOURCES.md): what it writes as `source-id` on the root, on ordinary layers, on components, and on instances, and what it writes for things defined in another file. These are recommendations, like `platform` values — not validated, and changed without an RFC. A new tool adds its section; the format itself does not change.

At acceptance the guidelines start with:

| `source` | Root | Layers | Components from a library | Nested in an instance |
|---|---|---|---|---|
| `figma` | the frame's node id | node id | the published component `key` | not written (Part 2 paths) |
| `penpot` | UUID | UUID | UUID — global | not written |
| `sketch` | `do_objectID` | `do_objectID` | symbol id | not written |
| `html` | none | the element's `id` **only** when the page set one | — | — |

Figma node ids repeat across files — `1:2` exists in every Figma file — so a Figma node id only means something once the consumer knows which file to read it against. That is deliberate (rule 10): the consumer performing the round trip supplies the file. A library component is defined in a different file, so its node id would be read against the wrong one; its component key is global and is the right handle.

An HTML capture **does not invent identity**. Where a captured element has no stable `id`, the node gets no `source-id` — a CSS selector or DOM position is not an identity and would break on the next capture ([P15](../PRINCIPLES.md)).

### Part 4 — `name` is unchanged

`name` remains the human-readable layer label. So a node has up to three attributes about itself, each with one job:

| Attribute | For | Example |
|---|---|---|
| `name` | People | `name="Primary CTA"` |
| `id` | References inside this file | `id="cta"` |
| `source-id` | Tracing back to the source | `source-id="336:1702"` |

### How each party uses this

**An exporter (Figma, Penpot, Sketch plugin)**

- Writes `source` on the root once. When the export is meant to round-trip, writes `source-id` on the nodes it will need to find again, following its guideline in [`spec/SOURCES.md`](../spec/SOURCES.md).
- Writes `id` **only** on nodes something points at: prop targets, instances that a path passes through, and anything later RFCs reference. The blanket "every node in a component body gets an id" rule in `spec/DOTGUI.md` is withdrawn.
- Generates an `id` from the layer name in kebab-case, suffixing `-2`, `-3` on collision — the existing rule, now applied only where an id is needed.
- Is deterministic: the same source produces the same ids and source ids ([P14](../PRINCIPLES.md)).
- On re-export, may match previous nodes by `source-id` and keep their previous `id`, so references survive a layer rename. This is permitted, not required — and it is only possible *because* `source-id` exists.

**An optimizer**

- When it merges two nodes, the survivor keeps its own `source-id`. The removed node's `source-id` is dropped with it: that layer no longer exists as a node in the file, and claiming otherwise would be false.
- When it removes a node that something points at, it must not. A referenced node is not dead weight.
- May offer a strip pass that removes every `source-id` from a file meant for handoff. The result is still valid and still says which tool it came from; it can no longer be traced back.

**A person or an AI editing a file**

- Adds `id` to a node when it needs to point at it — `id="cta"` before writing a link to it.
- **Copying a node gives the copy a new `id`.** The copy may keep `source-id` — it is honestly derived from that layer — but two nodes may never share an `id`.
- **Moving a node into a document with a different `source` drops its `source-id`.**
- Never writes `source-id` on new nodes. A node that did not come from a source has none.

**A renderer**

- Uses `id` and paths only to resolve references — props today; flow, motion, and recipes later.
- Ignores `source-id` and `<gui source>`.
- Fails loudly on a missing id, a duplicate id, or an unresolvable path.

**A consumer that traces back** — a diff tool, an importer, a system that attaches behaviour to designed layers

- Reads `<gui source>` first, and only reads `source-id` values from documents whose source it understands.
- Keys on `source-id`, not `id`. `source-id` is what stays the same across re-exports of the same source; `id` is only guaranteed within one file.
- Treats a missing `source-id` as "this node did not come from that source," never as an error.

### A worked round trip

1. **Export.** A designer exports a settings screen from Figma. The user asks for a round-trippable export, so the document declares `<gui source="figma">` and every node carries a `source-id`. The tab bar's component body gives `tab-1`, `tab-2`, and their `label` nodes ids, because the tab bar exposes `first-label` and `second-label` props that point at them. Nothing else has an `id`.
2. **Edit.** An AI adds a link that should fire when the save button is tapped. The button had no `id`, so it adds `id="save"` and writes `target="save"`. The button's `source-id` is untouched.
3. **Copy.** The AI duplicates a settings row. The copy keeps `source-id="336:1730"` — it is derived from that row — but if the original had an `id`, the copy gets a new one.
4. **Paste from elsewhere.** The AI pastes in a banner from a Penpot export. The banner's `source-id` is dropped: this document's source is Figma, and a Penpot UUID read as a Figma node id would point nowhere.
5. **Re-export.** The designer renames the save layer to "Save changes" in Figma and exports again. A naive exporter would generate `id="save-changes"` and break the link. An exporter that reads the previous file matches the button by `source-id` and keeps `id="save"`. The link survives.
6. **Re-import.** The designer tells an importer to sync the file back into the Figma file it came from. The importer — not the `.gui`, which does not record the file — knows which file that is, and uses `source-id` to update existing layers in place rather than create duplicates. The copied row shares a `source-id` with the original; the importer sees two nodes claiming one layer and creates the second as a new layer — which is exactly what it is. The banner has none, so it is created new.
7. **Move to Penpot.** The file is imported into Penpot and exported from there. `source` becomes `penpot` and every `source-id` becomes a Penpot UUID. Every `id` — and so the link, the props, every reference — stays the same.

## Reasoning

### Why two node attributes, not one

Using the source tool's id as the node's id — `id="336:1697"` — is the obvious simplification, and it works for a file that only ever goes from Figma to a renderer. It fails as soon as the file is used as anything else:

- **Copying makes the id lie.** Duplicate a node and both copies claim to be the same Figma layer. Either the file now has a duplicate id, or one copy is given a new id and loses its link to the source. With two attributes, the copy gets a new `id` and keeps an honest `source-id`. Identity in a file and provenance from a source change at different moments, so they cannot be one value. This is the deciding argument.
- **Files written from scratch have no source id.** They would carry `id="cta"` beside exported files carrying `id="336:1697"` — two kinds of id in one attribute, with nothing to tell a reader which kind it is holding.
- **Moving between tools rewrites every reference.** Export from Penpot what came from Figma, and every id changes — so every prop, link, transition, and recipe that pointed at one changes with it. With two attributes, only `source-id` changes.
- **Ids inside instances are a tool's data model.** Figma's `I336:1697;12:4` is Figma's encoding of instance structure. Adopting it as the format's id adopts Figma's model, which [RFC-0003](0003-not-figma-data-model.md) rules out. A path (`nav/label`) says the same thing for any tool.
- **References are what an AI reads and writes most.** `target="cta"` is about one token. `target="336:1697"` is around five, and a Penpot UUID around twenty-five — paid on every reference, by the author the format is designed for ([P7](../PRINCIPLES.md)).

### Why the tool is stated once, not in every value

An earlier draft of this RFC prefixed every value with its tool — `origin="figma:336:1697"` — and dropped `<gui source>`. That made each value self-contained, at a cost:

- **The tool is a fact about the document, not about each node.** Writing it on every node repeats one fact hundreds of times ([P12](../PRINCIPLES.md)), and costs about 3% of an exported file's size for no information.
- **[RFC-0036](0036-gui-meta-block.md) already states it.** `<gui source>` works and is understood. Keeping it changes nothing for existing readers.
- **A per-node prefix cannot be an exception either.** It is tempting to keep the tool in the document and allow a `figma:` prefix only on nodes from a different source. But Figma ids already contain colons, so `336:1702` would read as tool "336" — a reader could not tell a prefixed value from a bare one. The format would have to parse the value to find out, which breaks rule 7.

What stating it once costs is self-containment: a `source-id` means nothing without its document's `source`. Two rules cover that. A document has one source, so there is never a question of which tool a value belongs to. And a node that moves into a document with a different source drops its `source-id`, so a value is never read against the wrong tool.

### Why the source file is not recorded

A source file key, file name, or URL would make a `.gui` file self-locating: a consumer could open it and know where to sync back to without being told. This RFC does not record one, for four reasons.

- **No export format records it.** A PNG, a PDF, or an SVG exported from a design tool does not know which file it came from, and nothing is lost: the exported result is complete without it. A `.gui` file is the same kind of artifact.
- **A round trip is an explicit act.** Syncing a file back into a design tool, or refreshing it from one, starts with someone saying "this came from that file." Whoever performs that act already has the file — the user who names it, or the system that made the export and keeps its own record of it. A consumer that refreshes exports automatically keys its records on the file itself; it does not need the `.gui` to tell it.
- **It is the most sensitive thing provenance could carry.** A Figma file key is the file's URL. Where a file is shared by link, the key alone grants access; where it is not, it still reveals that the file exists and where. A file name can be confidential in itself. Both would travel with every copy of the `.gui` — to clients, to public libraries, into prompts — and be stripped only when someone remembered to.
- **It is stated nowhere else in the file, so leaving it out costs nothing.** `source-id` values and `<gui source>` mean the same thing with or without it.

What this costs is a check the format can no longer make: if a user points a round trip at the wrong file, `source-id` values may match unrelated layers. That check belongs to the importer — confirming a node exists and has the expected type before writing to it — not to the format.

### Why these names

The three parts need names that show how they relate, because the relationship is the whole design: one id is the file's own, one belongs to the source, and the source is named once.

- **`source` stays.** It is [RFC-0036](0036-gui-meta-block.md)'s word, already in use, and accurate.
- **`source-id`** reads as "the id in the source." The name states that it depends on `source`, and placing it next to `id` — `id="title" source-id="336:1702"` — reads as "our id, their id," which is the two-attribute argument in a single line.
- It replaces **`source-node`**, which was only ever used on the root. On a node, "node" is redundant, and the name reads as a reference to a node rather than an identifier.
- `source-id` and `src` do not collide on `<img>`: `<img src="assets/hero.webp" source-id="12:3">` is easy to tell apart. A bare `source` on a node would not be, and would also clash with `<font source="google">`.

Rejected pairings are listed under *Alternatives Considered*.

### Why not layer names

Names are not unique — two layers called "Icon" are common — and [RFC-0008](0008-component-instance-system.md) already rejected referencing by name for this reason. Names are also the thing designers change most. `name` stays as a label for people; it is never an address.

### Why `id` only where it is pointed at

The current rule gives every node in a component body an id derived from its name. That has two costs and no benefit. Most of those ids are never referenced, so they are noise ([P4](../PRINCIPLES.md)). And because they are derived from names, every layer rename churns them, producing diffs that look like changes and are not. An id that exists because something points at it carries meaning: a reader seeing `id="save"` knows something refers to that button.

### Why `source-id` per node, not a map

A single table mapping ids to source layers would keep nodes shorter, but it would require every exported node to have an `id` — exactly the blanket ids this RFC removes — and it would put the link to the source somewhere other than the node it describes. An attribute on the node travels with the node: copied, moved, or merged, its provenance goes with it or is dropped with it.

### Why the value is opaque

If the format parsed `source-id`, it would have to know every tool's id scheme, and every new tool would need a format change. Treating the value as opaque means a new tool needs nothing from the format: it names itself in `<gui source>` and writes its own ids.

### Why `/` for paths

`/` cannot appear in an id, so a path can never be mistaken for one. It reads as descent, which is what it is. `.` was rejected because it reads as property access, the vocabulary of a programming language ([P5](../PRINCIPLES.md)). CSS selectors (`nav > label`) were rejected as a foreign dialect ([P8](../PRINCIPLES.md)) that also invites selector features — classes, wildcards, positions — the format does not want.

### Measured cost of `source-id`

Measured on sixteen real Figma exports (`gui-figma/test/source`): 5,146 nodes in 1,021,536 bytes of markup. Writing `source-id="1234:5678"` on every node adds about 113,200 bytes — **about 11% of file size**. For comparison, the prefixed form of the earlier draft (`origin="figma:1234:5678"`) measured 12.5%. Numeric ids tokenize less efficiently than prose, so the share of tokens is likely somewhat higher; that measurement is still owed (see *Unresolved Questions*).

That cost is paid only by exports the user asked to round-trip, which are the files that need it, and it can be removed in one pass for handoff. Every other export pays nothing. Hand-written and AI-written files pay nothing. None of the sixteen samples contains components or instances, so they do not measure the saving from withdrawing blanket component-body ids; that saving offsets part of the cost in files with components.

### Principles

| Principle | Result | Why |
|---|---|---|
| P1 — neutral, round-trips | pass | Nothing in the format depends on one tool's ids. `source-id` is the mechanism that makes round-trip possible. |
| P3 — visually faithful, not an editor's save file | pass | `source-id` is provenance, already admitted by [RFC-0036](0036-gui-meta-block.md); this applies it per node. It records no editor state. |
| P4 — everything means something | pass | Each attribute appears only where its job exists. Blanket ids are removed. |
| P5 — not Figma | pass | Figma's instance-id encoding is explicitly kept out. |
| P7 — readable, cheap for AI | pass | References stay short, and the names explain each other. `source-id` costs ~11% of a round-trip export's size, and nothing anywhere else. |
| P8 — one vocabulary | pass | Keeps 0036's `source`; `source-id` names its relationship to it. Reuses `id` and kebab-case. Avoids colliding with `<font source>` and `src`. |
| P11 — grammar | pass | Two properties, each a single inline value. No new tag. |
| P12 — one way | pass | The tool is stated once. The root's id is written like every other node's, replacing `source-node`. One addressing scheme for every later RFC. |
| P14 — deterministic | pass | Same source, same ids and source ids. |
| P15 — honest | pass | Broken references fail loudly. A `source-id` with no `source` is an error. Copies get new ids. Merged, captured, and foreign nodes do not claim a source they do not have. Provenance never leaks the source file's location. |

## Alternatives Considered

**One attribute: the source tool's id as `id`** — Rejected. Copies cannot keep both a unique id and their provenance; hand-written files have a different kind of id in the same attribute; moving between tools rewrites every reference; and instance-internal ids import a tool's data model. Argued in *Reasoning*.

**One attribute: `id` holds either a name or a source id** — Rejected. The cheapest version of the above. A reader cannot tell which kind it holds, and the copy and tool-move failures remain.

**A tool-named attribute such as `figma-id`** — Rejected under [P1](../PRINCIPLES.md). It makes sense coming out of one tool only, and every new tool would need its own attribute.

**The tool in every value (`origin="figma:336:1697"`), dropping `<gui source>`** — Rejected. This RFC's earlier draft. Repeats a document-level fact on every node, and cannot coexist with a document-level source because Figma ids contain colons. See *Why the tool is stated once*.

**`source` + `origin`** — Rejected. Near-synonyms. Nothing in the names says that one is a tool and the other an id that depends on it.

**`tool` + `origin`** — Rejected. Clear, but renames [RFC-0036](0036-gui-meta-block.md)'s working `source`, and "tool" is the wrong word for an HTML capture or a code generator.

**`source` + `source-node`** — Rejected. 0036's root-only name, carried down to every node. "Node" is redundant on a node, and the name reads as a reference rather than an identifier.

**`source` + `ref`** — Rejected. Too vague, and reads like a reference to something inside the file.

**Layer names as addresses** — Rejected. Not unique, and the most frequently changed thing about a layer. [RFC-0008](0008-component-instance-system.md) already rejected it.

**Keep blanket name-derived ids on every component node** — Rejected. Noise on unreferenced nodes, and churn on every rename.

**Record the source file (`<gui source-file>`, or a file key inside the root's `source-id`)** — Rejected. No export format records where it came from; the consumer performing a round trip already knows; and a file key is an access-bearing URL that would travel with every copy. This RFC's earlier draft put the file key in the root's `source-id`. See *Why the source file is not recorded*.

**A source-id map on the root or in a block** — Rejected. Forces an `id` on every exported node and separates provenance from the node it describes.

**Figma's `I…;…` chain for nested nodes** — Rejected. Figma's encoding of its own instance model ([RFC-0003](0003-not-figma-data-model.md)). Paths cover the same ground for every tool.

**`.` or CSS selectors for paths** — Rejected. See *Why `/` for paths*.

**`<override>` children on instances for nested overrides** — Rejected again, as in [RFC-0034](0034-component-prop-types.md). A prop with a path `target` reaches the same nodes without adding anything to `<instance>`.

**`source-id` on every exported node, always** — Rejected. Costs about 11% of every export to serve only the exports that go back. A round trip is something the user asks for, so the cost is paid only then.

**A fixed value scheme (always the layer's node id)** — Rejected. The node id is the wrong handle for a library component in Figma, whose id belongs to another file; the tool knows which handle it can resolve, and says so in its guideline.

**Synthesise a `source-id` from a DOM selector for HTML captures** — Rejected under [P15](../PRINCIPLES.md). A selector is a position, and would claim a stability the capture does not have.

## Unresolved Questions

- **Strict kebab-case for `id`, or any XML name?** Leaning strict. It is what generation already produces, and it guarantees `/` never appears in an id. Hand-written files that want `saveButton` would have to write `save-button`.
- **Must a re-export preserve ids?** Matching by `source-id` to keep previous ids is permitted here, not required. A rule that needs the previous file makes export depend on history, which sits uneasily with [P14](../PRINCIPLES.md). Leaning: keep it permitted.
- **Does `detached-from` fold into this?** `detached-from="comp-x"` ([RFC-0035](0035-detached-from.md)) records which *component* a frame came from — a reference inside the package, where `source-id` points outside it. It is a reference, so it uses this RFC's ids. Leaning: keep it as its own point release (0.3.8), built on this one.
- **Cross-variant identity.** Settled in [RFC-0048](0048-motion.md): corresponding nodes in different variants carry the same `id`, so `smart` transitions can match them.
- **Spec and RFC updates on acceptance.** `spec/DOTGUI.md` *Id generation* is rewritten; `spec/SOURCES.md` is added with the Figma, Penpot, Sketch and HTML guidelines; [RFC-0044](0044-slots.md)'s open question on package-wide component ids is marked settled here.
