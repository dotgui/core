---
rfc: 0056
title: Linked libraries — declarations pulled from another package, cached in this one
status: Draft
targets: 0.4
date: 2026-10-29
depends-on: 0036, 0042, 0043, 0046
related: 0054, 0055, 0057
amends: 0042, 0043, 0046
---

# Linked Libraries — Declarations Pulled from Another Package, Cached in This One

## Context

### What RFC-0042 settled, and what it refused

[RFC-0042](0042-multi-document-packages.md) gave a package one shared library: `library.guix`, whose declarations every document in the package resolves against. It drew a hard line around it. Resolution is closed at the package boundary: *"A document may never reference a token, component, or asset in another `.gui` file."* And there is exactly one library: *"Multiple libraries would require selectors, which require linking, which is the Figma model."* [RFC-0043](0043-standalone-guix.md) repeated the refusal for standalone documents.

The line was right about what it protected. A package you hand to someone has everything; resolution is decidable offline, at parse time, with certainty; there is no dependency graph, no version skew, no broken link that changes what renders. None of that is negotiable, and this RFC keeps all of it.

### What people actually do with a design system

A design system is not one package's private palette. It is shared by every file a team makes. Today that has two expressions in `.gui`, and both are lossy:

**Copy the declarations in.** A tool pulls `Button`, `$primary` and the `label` text style from the team's library into the file that uses them. The file renders. But the file no longer knows those declarations came from anywhere. When the library ships a new `Button`, nothing can say which files use the old one; when the file is sent back to Figma, nothing says that `comp-button-primary` is the team's button rather than a local one that happens to share its name. Every copy becomes a silent fork.

**Keep a link outside the format.** A tool keeps a sidecar record — "these twelve declarations came from Acme 1.4" — beside the file. That works until the file is copied, zipped, sent, or opened by a different tool. Provenance that lives outside the file is provenance the next reader does not have ([P1](../PRINCIPLES.md)).

The tools that produce `.gui` from design systems already need this. A Figma library imported into a package is exactly "declarations from another file, at a version" — and the component keys that make the trip back to Figma possible ([RFC-0046](0046-identity-and-source-ids.md)) are only meaningful when read against that library.

### The question is narrower than "linking"

What RFC-0042 refused was a document *resolving* names against another file. What is needed is a package *recording* that some of its own declarations came from another one. Those are different things, and the difference is the whole of this RFC: the declarations are still in the package, still resolved inside it, still complete without the network. What is added is a statement of where they came from.

## Decision

### `<library>` — a block of declarations that came from another package

```xml
<gui version="0.4" name="Checkout">
  <library name="acme-ds" uid="7f3e9a1c-…" release="1.4.0"
           src="../libraries/acme-ds.gui" source="figma">
    <mode name="theme" values="light dark" default="light" />
    <tokens>
      <color name="primary" theme-light="#3B5BFD" theme-dark="#7C93FF" />
      <number name="radius-md" value="8" />
    </tokens>
    <styles>
      <text-style name="label" font-size="16" font-weight="600" line-height="20" />
    </styles>
    <components>
      <component-set name="Button" id="compset-button" source-id="5c1d…">
        <variant id="comp-button-primary" style="primary" source-id="a2b9…"> … </variant>
      </component-set>
    </components>
  </library>

  <col w="390">
    <instance component="comp-button-primary" label="Pay $42" />
  </col>
</gui>
```

1. **`<library>` is a declaration block**, a sibling of `<tokens>`, `<styles>`, `<fonts>` and `<components>`, allowed wherever they are: in a document's library part, above its layout root. In a multi-document package it normally sits in `library.guix` (or a [RFC-0055](0055-library-directory.md) library file), and the positional rule of RFC-0042 applies unchanged — in `library.guix` it is shared, in a screen document it is local to that document.
2. **Its children are ordinary declaration blocks** — `<mode>`, `<tokens>`, `<styles>`, `<fonts>`, `<components>` — with their ordinary grammar. Nothing inside a `<library>` is written differently from the same declaration outside one.
3. **It is a cache, and it is the truth for rendering.** The children are a copy of declarations from the library at `release`. The copy may be partial — four components out of two hundred — but it must be complete for what it contains: every name a cached declaration uses must resolve inside the package, exactly as for any other declaration.
4. **Renderers resolve the contents as if they were declared directly, and must not fetch `src`.** A renderer treats `<library>` as transparent: its children join the declarations of the document that holds it. It never opens, downloads or reads what `src` points at. A missing, moved or unreachable `src` never changes what renders.
5. **Names stay unique across the whole package.** A name declared in a `<library>` block and anywhere else in the package — directly, or in another `<library>` block — is an error, the same error RFC-0042 already reports for redeclaration. There is no namespace, no prefix, no selector: `<instance component="comp-button-primary">` does not say, and does not need to say, which library the component came from.
6. **Several `<library>` blocks are allowed**, one per source library. **They do not nest.** A declaration that a source library itself holds in a `<library>` block (Acme built on a base kit) is pulled into its own top-level block, carrying the original library's attributes — provenance is kept by hoisting, not by nesting.
7. **Only declarations are linked.** A `<library>` block contains declaration blocks and nothing else; a layout root inside one is an error. A screen from another file is never brought in this way — see *Non-goals*.

### Its attributes

| Attribute | Required | Meaning |
|---|---|---|
| `name` | yes | The human-readable label for the library, as `name` is everywhere ([RFC-0046](0046-identity-and-source-ids.md), Part 4). Not an identity and not a namespace. |
| `uid` | yes | The source library's own stable identity — see *Library identity*. |
| `release` | yes | The source library's release the cache was taken from. Opaque to the format; tools compare it. Semantic versioning is recommended. |
| `src` | no | Where a tool may find the library: a relative path or an absolute URL to a `.gui` package. Read by tools only. |
| `source` | no | The tool the library's declarations were exported from, read exactly as `<gui source>` is ([RFC-0036](0036-gui-meta-block.md)). `source-id` values inside the block are read against it. |

The block is the tag; everything a tool needs to browse, update or relink the library is on it once, rather than repeated on every declaration it holds.

### What tools do with it

The format defines what the block *means*. What a tool does with that meaning is the tool's business, but the meaning is chosen so these work:

- **Browse.** Follow `src`, confirm the package found has the same `uid`, and show what else the library offers.
- **Update.** Compare `release` with the library's current release and offer the newer declarations. Replacing a block's contents with a newer release is an ordinary edit.
- **Relink.** When `src` is missing or wrong, find the library by `uid` — in the workspace, a registry, or by asking the user — and rewrite `src`. Rendering is unaffected throughout.
- **Detach.** Moving a declaration out of its `<library>` block into the package's own blocks is detaching it from the library: it renders identically and no longer claims to be the library's. This is the declaration-level counterpart of `detached-from` on instances ([RFC-0035](0035-detached-from.md)).
- **Unlink.** Removing the `<library>` wrapper and leaving its children in place is lossless for rendering — the strip pass for a file meant for handoff.

### Library identity

A package that is used as a library declares its identity on the root of the document that holds its library part — `library.guix`, or the single document of a single-document package:

```xml
<!-- acme-ds.gui → library.guix -->
<gui version="0.4" name="Acme DS" uid="7f3e9a1c-…" release="1.4.0" source="figma">
  <tokens> … </tokens>
  <components> … </components>
  <col w="1200"> … the style guide … </col>
</gui>
```

- **`uid` is an opaque string, minted once** when a package is first published as a library, and never changed afterwards — not by a rename, a move, a new release, or a change of host. A UUID is recommended. It is the only thing that makes "the library this file was pulled from" checkable once `src` has moved.
- **Forking a library mints a new `uid`.** Two packages with the same `uid` claim to be the same library at different releases; a fork is a different library and must say so. Minting and keeping the `uid` is the tool's job, like generating `id`s.
- **`release` on the root** is the library's current release. A package that is never used as a library writes neither attribute.
- A copy's `<library>` block carries the same `uid` and the `release` it was taken from.

### Cached content follows the host document's rules

The cache is ordinary markup in the document that holds it, so it obeys that document's rules, not the source's. Assets a cached component uses are copied into the host package's `assets/`, or are absolute URLs in a standalone document ([RFC-0043](0043-standalone-guix.md)); fonts are declared as any font is. A cache that leaves a component's icon behind fails as an unresolved asset, loudly ([P15](../PRINCIPLES.md)).

### Figma: component keys, read against the block's `source`

A Figma library imported into `.gui` is the first producer of `<library>` blocks. With `source="figma"` on the block, `source-id` on a cached component set or variant is the published component key, as [RFC-0046](0046-identity-and-source-ids.md)'s guideline already says for *components from a library*. Exporting a screen back to Figma, a plugin reads the block's `source`, takes the key, and imports the real library component by it — the screen comes back as instances of the team's own components rather than detached copies.

The Figma file key is still not recorded. Component keys are global; the plugin does not need the file to find them, so rule 10 of RFC-0046 stands for source-tool files (see *Amendments*).

### A worked example

**The library.** `acme-ds.gui` was imported from the team's Figma library. Its `library.guix` declares `uid="7f3e…"`, `release="1.4.0"`, `source="figma"`, two hundred tokens, twelve text styles and forty component sets.

**The pull.** In `checkout.gui`, a designer drags *Button / primary* in. The tool resolves what it depends on — `$primary`, `$radius-md`, the `theme` axis, the `label` style, the `icon-arrow` component and its SVG — and writes exactly those into a `<library name="acme-ds" uid="7f3e…" release="1.4.0" src="../libraries/acme-ds.gui" source="figma">` block in `checkout.gui`'s `library.guix`, copying the SVG into `assets/`. The screen gets `<instance component="comp-button-primary">`.

**Sending it.** `checkout.gui` is zipped and sent to someone with no Acme anywhere. It renders identically. Their tool sees a library it cannot reach and can say so; nothing on screen changes.

**Updating.** Acme ships 1.5.0 with a new button padding. A tool that can reach `src` sees `release="1.4.0"` against `1.5.0` and offers the update; accepting it rewrites the block's contents and its `release`.

**Back to Figma.** The checkout screen is exported to Figma. The plugin finds the instance's component in a block with `source="figma"` and imports it by key: the screen arrives built from Acme's real button.

### Amendments to existing RFCs

Each is precise; nothing else in those RFCs changes.

**[RFC-0042](0042-multi-document-packages.md), Non-goals.**
- *"No external references"* becomes: **no external resolution.** A document still never resolves a name against another file; every name resolves inside the package, offline. A package may *record* that declarations it contains were taken from another package, through `<library>`. Resolution stays closed at the package boundary — always.
- *"No second library"* becomes: **one resolution scope, any number of sources.** The package still has exactly one library part (`library.guix`, or the RFC-0055 library directory). Within it, declarations may be grouped by the library they came from. No selector, no namespace and no link is introduced, which is what the original non-goal was guarding against.
- *Single-library resolution is implicit* — unchanged. `<library>` blocks are declarations and resolve implicitly like any other.
- The statement *"There is no `<library>` or `<screen>` wrapper tag, and there should not be"* is about marking the library/screen division of every document, and stands: `<library>` does not mark that division, is never required, and appears only around declarations that came from another package.

**[RFC-0043](0043-standalone-guix.md), Non-goals.** *"No linking to a library"* becomes: a standalone document carries its declarations inline, **which may include `<library>` blocks** recording where they came from. It still resolves nothing outside itself; `src` is never followed by a renderer.

**[RFC-0046](0046-identity-and-source-ids.md), Part 3.**
- **Rule 6** (*one source per document*) becomes: one source per **provenance scope**. The document's root `source` covers everything in it except the contents of `<library>` blocks; each block's contents are read against the block's own `source`. A `source-id` inside a block with no `source` is an error, as rule 5 makes it on a root.
- **Rule 7** gains: a node inside a component declared in a `<library>` block is read against that block's `source`, wherever the component is used.
- **Rule 10** (*the format does not record which source file a document came from*) **stands for source-tool files** — no Figma file key, name or URL is ever written, on a document or on a `<library>` block. It is **amended** to permit one location: `src` on `<library>`, which points at a `.gui` package, never at a source tool's file. This is an amendment, not a clarification, and *Reasoning* argues it. `uid` does not touch rule 10 at all: it identifies a library, not where a file lives.

### Non-goals

- **No resolution outside the package.** A renderer never follows `src`; no name ever resolves against another file.
- **No embedding another file's screens.** Only declarations are linked. A screen that should be reused is made a component in the library and linked as one. Pulling layout from another file brings back everything RFC-0042 refused — nesting, cycles, ambiguous asset paths, a document that cannot render alone — for no capability components do not already give.
- **No namespaces or selectors.** Names are unique across the package; `<library>` says where a name came from, never how to look it up.
- **No overrides or cascade.** A package cannot redeclare a library's name to change it. Changing a library declaration locally is detaching it.
- **No registry, resolution protocol or version-range syntax.** How a tool finds a library by `uid`, and which releases it considers compatible, is tooling.
- **No nesting** of `<library>` blocks.

## Reasoning

### The renderer contract does not change, which is why this is admissible

Everything RFC-0042 protected is a property of resolution: closed, offline, decidable at parse time. This RFC does not touch resolution. A renderer that implements it does one new thing — treats `<library>` as transparent — and is forbidden from doing the one thing that would break the guarantee. The package you hand someone still has everything, and still renders the same with the network off. What is added is information for tools, carried in the file so it survives the file being copied ([P1](../PRINCIPLES.md)).

### Grammar gate

`<library>` is a **tag** — a block-level declaration container, at the same rung as `<tokens>` and `<components>`, which are tags too. The lower rung was considered first: a property on each declaration (`library="acme-ds"`), in the shape of `detached-from`. It fails on two counts. The library's identity, release and location would have to live somewhere, so a tag would still be needed for them, or they would be repeated on every token and component the library contributed — two hundred copies of the same three values ([P7](../PRINCIPLES.md)). And a library is updated as a unit, at a release: a block makes "these declarations are Acme 1.4" one statement that can be replaced whole, where per-declaration attributes can drift one by one into a state no release ever had. The block is the lowest rung that carries the meaning.

It matches the conventions at that rung: it contains existing blocks with their existing grammar ([P11](../PRINCIPLES.md)), and its attributes are nouns.

### Principle pass

| Principle | | Why |
|---|---|---|
| P1 — interchange, round-trip | **pass** | The reason it exists. Provenance travels with the file, readable by any tool; component keys read against the block's `source` are what let a screen return to Figma as real instances. |
| P2 — platform-agnostic | neutral | Container metadata; nothing platform-specific. |
| P3 — visual export, not a save file | **pass, argued** | `uid`, `release` and `src` are not visible. They are provenance, which P1 names explicitly as a sanctioned exception (`source`, `source-id`, `detached-from`): information that lets a file move between tools, not state of one editor. See below. |
| P4 — everything means something | **pass** | The block states a fact a consumer can act on — these declarations are Acme's, at 1.4. Without it, a pulled declaration is indistinguishable from a local one. |
| P5 — not Figma (no authoring state) | **pass, argued** | No edit history, selection, canvas or tool internals. A library dependency is a relationship between artifacts that every tool reading the file shares. See below. |
| P6 — intent vs computation | **pass** | The renderer computes nothing new. |
| P7 — readable, token-efficient | **pass** | One block, three attributes, ordinary declarations inside. The cost is one line per library; a file with none pays nothing. |
| P8 — one vocabulary | **pass** | *Library* already means "a set of shared declarations" ([RFC-0042](0042-multi-document-packages.md)); `name` and `source` keep their meanings. `release` was chosen over `version`, which on `<gui>` already means the spec version — reusing it for the library's release would give one word two meanings. |
| P9 — common case compact | **pass** | The common case — a file with no linked library — is unchanged. |
| P10 — conventions over configuration | **pass** | `src` and `source` are optional; nothing is required of a file that does not link. |
| P11 — grammar | **pass** | A declaration-block tag; see *Grammar gate*. |
| P12 — one obvious way | **pass, with a note** | A token can now be written inside or outside a `<library>` block. That is not a second semantics: the declaration is byte-identical and resolves identically. The block adds one thing — where it came from — and there is exactly one way to say that. |
| P13 — fewer primitives | **pass** | No existing primitive records where a set of declarations came from. |
| P14 — deterministic | **pass** | The block is literal. Pulling and updating are tool operations; given the same library release and the same selection, a tool writes the same block. |
| P15 — honest semantics | **pass** | An unreachable library changes nothing and can be reported; an incomplete cache fails as unresolved names, loudly; a collision is an error. The one honesty risk — a cache edited in place while still claiming to be a release — is named under *Drawbacks*. |

### Why P3 and P5 hold rather than need amending

The test P3 sets is *"if it only preserves editor state the render never shows, it fails."* The operative words are *editor state*. P1 already carves out a class of invisible information the format carries on purpose — provenance, so a file can be traced, refreshed and re-imported — and three implemented RFCs sit in it: `<gui source>`, `source-id`, `detached-from`. `<library>` belongs to the same class. It does not describe how one tool was being used (a selection, a viewport, an undo stack); it describes a fact about the artifact — which shared library its declarations are copies of — that every tool reading it shares and can act on.

If [RFC-0045](0045-describe-dont-run.md) is accepted, its re-cut of P3 and P5 does not change this conclusion: `<library>` describes a relationship, and runs nothing.

The argument has a limit, and it is `src`. `uid` and `release` are identity and version — provenance in the strict sense. `src` is a *location*, which is the thing RFC-0046 rule 10 refused. That is argued next, and it is why rule 10 is amended rather than reinterpreted.

### Why `src` is allowed when a source file is not

RFC-0046 gave four reasons not to record the source file. Each is answered for `src`, and one is only partly answered.

- **"No export format records it."** True of exports, and a `.gui` exported from Figma still records no Figma file. But a linked library is not an export — it is a dependency, and the format already records the location of dependencies it does not embed: an asset may be an absolute URL ([RFC-0043](0043-standalone-guix.md)), and `<font source="google">` names where a font comes from.
- **"A round trip is an explicit act, and whoever performs it already has the file."** For a sync back to Figma, yes. For a library update, the actor is often not the person who made the link — a colleague opening the file six months later. That is exactly the case `src` serves. It is optional because the original argument is still half right: a tool that keeps its own records, or can search by `uid`, does not need it.
- **"It is the most sensitive thing provenance could carry."** This is only partly answered. A Figma file key is an access-bearing URL; a `src` can be one too — a private host, a signed link. The mitigations are real but not complete: `src` is optional; relative paths are recommended, and reveal nothing outside the workspace; it must point at a `.gui` package and never at a source tool's file (a Figma URL in `src` is rule 10 by the back door, and a validator should warn on recognisable source-tool hosts); and unlinking is a one-step, render-lossless strip pass that tools should offer at handoff. What remains is a judgement: the cost of a leaked library location is lower than a leaked source file, and the benefit — a file that can find its library again — is the feature.
- **"It is stated nowhere else, so leaving it out costs nothing."** Not true here: without `src`, relinking needs out-of-band knowledge every time.

### Copy, not reference, is what keeps the promise

The alternative shape — a reference with no cache, resolved by the renderer — would make every file that uses a design system unrenderable on its own, and is rejected below. The cache is not an optimisation; it is the reason the RFC is compatible with RFC-0004's founding promise. The cost is that a library's declarations exist in many packages at once. That duplication is deliberate and bounded: a package holds only what it uses, and `uid` plus `release` make every copy identifiable, which is precisely what an uncached copy-paste could not do.

## Alternatives Considered

**A reference without a cache, resolved by the renderer** (`<library src="…"/>` and nothing inside) — Rejected. The file no longer renders by itself; rendering depends on the network or the file system; two copies of one file can render differently depending on which release they find. Every property RFC-0042 protected inverts. This is the Figma model the non-goal named, and the non-goal was right.

**A per-declaration attribute (`library="acme-ds"` on each token and component)** — Rejected under *Grammar gate*: the library's identity still needs a home, and per-item tags drift out of any release.

**A sidecar file outside the markup (`sources.json` in the package)** — Rejected as the place for this. It is a second file format to specify and keep in sync with the markup ([P10](../PRINCIPLES.md), the same reasoning that rejected a manifest in RFC-0042); a declaration can move without its record; and an agent reading the markup does not see where things came from. Tools remain free to keep their own records beside this.

**Namespaced names (`acme-ds/primary`, `<instance component="acme-ds:comp-button">`)** — Rejected. A namespace is a selector, which is the mechanism RFC-0042 refused, and it would change how every existing name is written. Strict uniqueness is the more conservative rule and can be relaxed later without breaking any file written under this one.

**Overridable library declarations** — Rejected for the reason RFC-0042 rejected them: a cascade is a heuristic. Detaching is the honest form of "I changed the library's button here."

**Leaving it to tools entirely** — the status quo. Rejected because provenance that lives outside the file is lost the first time the file moves, and the round trip to Figma depends on it.

## Drawbacks

- **It amends a rule that was argued, not assumed.** RFC-0046 rule 10 had four reasons; this RFC answers three and accepts residual risk on the fourth.
- **A cache can lie.** Nothing in the format stops a tool or a person editing a declaration inside a `<library>` block, leaving it claiming to be Acme 1.4 when it is not. A validator cannot catch this without the library. The rule is stated — edits to a library's declaration are detachment or publication — but enforcement belongs to tools.
- **Strict uniqueness will bite with two libraries.** Two libraries that both declare `$primary`, or both declare a `theme` mode axis, cannot be pulled into one package without detaching or renaming one side. Mode axes are the likeliest collision (*Unresolved Questions*).
- **Renderer work is small but real.** Both implementations must accept the block, merge its contents, reject a layout root inside it, and read `source-id` against the block's `source`.
- **Copies multiply.** Many packages hold parts of the same library. Bounded by what each uses, but real.

## Unresolved Questions

- **Where a library declares its `uid`.** Proposed: root attributes on the document that holds the package's library part. Alternatives: a dedicated root-level `<library>` self-declaration in the library itself, which would make the same tag mean "I am this library" and "these came from that library" (rejected for now, [P8](../PRINCIPLES.md)); or a content hash, which changes on every release and so cannot identify a library across releases. With [RFC-0055](0055-library-directory.md)'s split library there is no single `library.guix`; which library file carries `uid` and `release` is for that RFC and this one to settle together.
- **Naming `uid`.** `uid` sits beside `id` (a node in this file) and `source-id` (a node in the source tool). `library-id` is more explicit but longer, and repeats the tag name on the tag. Open.
- **Shared mode axes.** Should an identical `<mode>` declaration from two libraries (same name, same values, same default) be allowed, as the one exception to the redeclaration error? Strict now; relaxing later is additive.
- **`src` and multiple locations.** One `src`, or a list (a relative path and a URL fallback)? One for now, as the simpler rule.
- **`release` semantics.** Is semantic versioning recommended or required? Recommended; a tool that offers updates needs ordering, but the format does not compare releases.
- **Transitive libraries.** Hoisting keeps provenance flat, but loses the fact that Acme built its button on the base kit's icon. Whether that relationship needs recording is open; nothing so far needs it.
- **Validation of cache completeness across releases.** Whether a tool should be able to check that a block's contents match a release (a per-block content hash) is a tooling question for now.
