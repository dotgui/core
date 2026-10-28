---
rfc: 0057
title: description and template — what a library item is for
status: Implemented
targets: 0.4.3
date: 2026-10-29
updated: 2026-10-29
implemented: 2026-10-29
depends-on: 0005, 0008, 0042
---

# `description` and `template` — What a Library Item Is For

## Context

A file's declarations say what its tokens, text styles and components *are*. They never say what any of them is *for*.

`$primary` is a colour. Whether it is the brand colour for one call to action per screen, or the colour every link uses, is not written anywhere. `comp-button-primary` and `comp-button-secondary` render differently; nothing says when to reach for which. A designer knows. A model reading the file has to guess from names, and names are written for people who already know.

The source tools do write this down:

- **Figma** has a description on every component, component set, variant, variable and style. Design-system teams use it for exactly this: "Primary action. One per screen." "Deprecated — use Card/Elevated."
- **The W3C Design Tokens format** gives every token a `$description`.

The exporter drops all of it, because the format has nowhere to put it. That loss gets worse as libraries move into `.gui` ([RFC-0042](0042-multi-document-packages.md), and the library RFCs proposed alongside this one). An agent asked to "make a settings screen with our design system" gets a catalog of 200 names with no guidance. The most useful thing a design system holds — its usage rules — doesn't survive the export.

A second gap sits next to it. A library often ships **templates**: whole screens meant to be copied and changed, not shipped as they are. Figma teams keep them on a "Templates" page. In a `.gui` package a template is just another document. A reader cannot tell "the settings screen we built" from "the settings layout you should start from".

### Prior art in the format

There is none for prose. No element carries a description, note or doc attribute, and XML comments are not data (see *Alternatives*).

There is clear precedent for **properties that never render**:

- `role` ([RFC-0041](0041-role-attribute.md)) has "zero visual impact" and records intent that inference can only approximate.
- `detached-from` ([RFC-0035](0035-detached-from.md)) records an origin.
- `source-id` ([RFC-0046](0046-identity-and-source-ids.md)) traces a node to its source.
- `name` has always labelled layers without being drawn.

The format already accepts that some meaning has no pixels.

## Decision

### `description` — one property, on every library item

An optional `description` property holds plain text that says what the item is for and when to use it.

```xml
<tokens>
  <color name="primary" value="#3B5BFD"
         description="Brand colour for the single main action on a screen. Not for links." />
</tokens>

<styles>
  <text-style name="Heading/H1" font-size="32" font-weight="700" line-height="40"
              description="Page titles only. One per screen." />
</styles>

<components>
  <component-set name="Button" id="compset-button"
                 description="Actions. Use primary for the main action, secondary for the rest.">
    <variant id="comp-button-danger" style="danger"
             description="Destructive actions that can't be undone. Always behind a confirmation.">
      …
    </variant>
  </component-set>
</components>
```

It is valid on exactly these elements: `<component>`, `<component-set>`, `<variant>`, the token elements (`<color>`, `<number>`, `<string>`), and every style — `<text-style>`, `<fill-style>`, `<effect-style>`. These are the library items a reader picks from, and they are the items Figma and the Tokens format describe; Figma describes every style, not text styles alone.

Rules:

1. **Never rendered.** A renderer ignores it. Adding, changing or removing it has zero visual impact.
2. **Plain text.** No markdown, no links, no structured fields. The value is one paragraph. XML attribute normalisation turns line breaks into spaces, and that is intended.
3. **Belongs to the definition.** It lives where the item is declared. An `<instance>` does not carry or override it: an instance's attributes are prop values, so `<instance description="…">` sets a prop named `description` and is not this property.
4. **Exporters copy, they don't write.** An exporter writes `description` verbatim when the source item has one, and omits it when the source has none. It never generates one ([RFC-0010](0010-no-ai-in-pipeline.md)). Hand-written and AI-written files may add descriptions freely; that is authoring, not export.
5. **Preserved by every transform.** An optimizer must not strip it as "no visual impact". `flatten` and any library copy carry it with the item.
6. **Validation.** `description=""` is a warning, because an empty description says nothing (P4). `description` on any other element is an error in a document declaring 0.4.3 or higher, and a warning before.

**Length guidance, not a rule:** one or two sentences, about 200 characters at most. Say what the item is for, when to use it, and when not to. Anything longer is documentation, and documentation belongs beside the package, not inside the markup a model reads on every request.

### `template` — a boolean on the document root

```xml
<gui version="0.4" name="Settings — template" template>
  <col w="390" …> … </col>
</gui>
```

`template` is a boolean presence property ([RFC-0015](0015-boolean-presence-convention.md)) on a document's `<gui>` root. It says: *this document is a starting point to copy, not a screen to ship.*

- **It changes nothing about rendering.** A template renders exactly as it would without the flag.
- **Using a template means copying it.** A tool that "starts from a template" copies the document into the target package as a new document without `template`. Templates are never referenced or instanced. That keeps them inside the closed-resolution rule of RFC-0042: copying crosses no boundary.
- **A template's purpose is carried by its `name`.** `<gui>` does not take `description` in this RFC (see *Unresolved Questions*).
- `library.guix`, and any library file under `library/` ([RFC-0055](0055-library-directory.md)), cannot be a template. It is declarations, and its screen part is a style guide, not a starting point. `template` on it is an error.

**Why this belongs here, not in a later RFC:** both properties answer the same question for the same reader ("what is this for?") on the same artifact, a library. Splitting them would make two hearings argue the same P3 question twice. `template` is also the smallest change that gives the planner something to start from, and it costs one bare word on the roots that need it.

## Reasoning

### Where it sits in the grammar

Both are **properties**, the lowest rung. `description` is an inline-single string. `template` is a bare boolean. Neither needs a tag, because no structure is being added. Both are nouns (P11).

A `<description>` child tag was the obvious alternative and is rejected: it adds a tag to carry one string, and it would sit as a child inside `<component>`, where children are the component's body.

### P3 is the hard question — answered by precedent, not amendment

P3's line is *"everything you can see, nothing you can't."* `description` is not seen. Read literally, it fails.

But P3's litmus is aimed at **editor state**: comments, tracked changes, hidden editor metadata. Those are a tool's internals that mean nothing outside it. A description is the reverse. It is authored meaning, written for whoever uses the item next, and it reads the same in every tool. Figma and the Tokens format already exchange it. P3 has never been read as "nothing without pixels": `role`, `name`, `detached-from` and `source-id` all have zero visual impact and were admitted on P4's terms ("every attribute carries signal a downstream consumer can act on").

This RFC takes the same position, so **no principle is amended.** The tension is real, though: P3's wording no longer matches how it has been applied four times. That is raised as an unresolved question for the principles, not slipped through here.

[RFC-0045](0045-describe-dont-run.md) (Draft) points the same way. Its proposed P16 says every feature must be "useful to a reader that never plays the file". A description is useful *only* to that reader. This RFC doesn't depend on 0045, but it is consistent with it.

### Principle pass

| Principle | Result | Why |
|---|---|---|
| P1 Neutral interchange | pass | Figma and the W3C Tokens format both carry descriptions; the property round-trips verbatim |
| P2 Platform-agnostic | pass | Prose has no platform |
| P3 Visually faithful, not a save file | pass, with tension | Not editor state; admitted on the same terms as `role` and `name` (above) |
| P4 Everything means something | pass | This is the case: usage intent a consumer acts on. Empty values warn |
| P5 Not React / HTML / Figma | pass | No behaviour; no document semantics; not authoring state, since it means the same outside the editor |
| P6 Intent vs computation | pass | Intent no renderer or reader can derive ("one per screen") |
| P7 Readable, token-efficient | pass | The plain word every tool uses. It costs tokens only where authors opt in, and only in the declarations, which tools read once and cache. Not measured on real files yet |
| P8 One vocabulary | pass | One name, one meaning, on all five elements |
| P9 Common case compact | pass | Absent in the common case; opt-in |
| P10 Conventions over configuration | pass | Absent means undescribed; `template` is a bare boolean |
| P11 Grammar | pass | Properties, inline-single and boolean; nouns |
| P12 One obvious way | pass | No existing way to say this; comments are not data |
| P13 Fewer primitives | pass | No new primitive |
| P14 Deterministic production | pass | Exporters copy the source verbatim or write nothing |
| P15 Honest semantics | pass | It claims nothing about the render; misplaced or empty values are reported |

### Why only these five elements

They are what a reader *chooses from*. Layers inside a component body are implementation; describing them is documentation of the drawing, not guidance for the user of the library. Props are a possible sixth (see *Unresolved Questions*), but Figma has no description on component properties, so there is nothing to round-trip yet.

### What it costs — measured

On the 45-component shadcn library used for [RFC-0055](0055-library-directory.md), with a typical 20-token description (`cl100k`, a proxy for the model's tokenizer):

| Described | Library tokens | Added |
|---|---|---|
| Nothing | 12,047 | — |
| Each component set | 12,947 | +7.5% |
| Every set and every variant | 14,327 | +18.9% |

The cost is opt-in, sits only in library files, and is read once per library. With the library split, an agent editing the button reads 682 tokens instead of 542.

## Alternatives Considered

**XML comments** (`<!-- Primary action. One per screen. -->`). Rejected. Parsers drop comments, so they aren't attached to an element and can't be copied with it when a component is pulled into another package. An optimizer may strip them. They look like data and aren't.

**A `<description>` child tag.** Rejected under P11: a tag to carry one string, placed where a component's body goes.

**A shorter name** (`desc`, `note`, `doc`). Rejected under P7: `description` is the word Figma, the Tokens format and most tools use, and a model reads it without a lookup.

**Rich text** (markdown, links to docs). Rejected. It turns a property into a document format, and links reach outside the package, which RFC-0042 closes. Long-form guidance lives beside the package, in the workspace.

**A sidecar file of descriptions.** Rejected. Descriptions would detach from their items the moment a component is copied, renamed or pulled into another package. The description must travel with the definition.

**`template` as a `role` value, or a naming convention** ("Template / Settings"). Rejected. `role` names UI structure ([RFC-0041](0041-role-attribute.md)), and a template isn't a structure. A naming convention is a heuristic a reader has to guess at (P14).

**Defer `template` to its own RFC.** Considered. Rejected because it raises the same P3 question for the same reader, and a separate hearing would only repeat this one.

## Drawbacks

- **Tokens.** A fully described library is about a fifth larger (*What it costs*). Authors choose how much to describe; exporters copy only what the source has.
- **A second kind of meaning with no pixels.** Validators and optimizers must know `description` and `template` are kept, never stripped as dead weight.
- **P3's wording lags its application.** This is the fifth property admitted as authored meaning that is never seen (see *Unresolved Questions*).

## Implementation Notes

- **Schema:** `description` on component, component set, variant, the three token types and the three style types; `template` on `<gui>`.
- **Kit validator:** `DESCRIPTION_EMPTY` (warning) and `DESCRIPTION_MISPLACED` (error from 0.4.3, warning before); `TEMPLATE_IN_LIBRARY` for `template` on `library.guix` or a `library/` file. `info()` lists the documents that are templates. `template` joins the presence attributes, so a bare `<gui template>` parses.
- **Native renderer:** the same rules; both attributes are ignored when drawing.
- **Figma exporter:** copies component, set, variant, variable and style descriptions verbatim. Deferred with the rest of the Figma plugin work.

Shipped in 0.4.3: the schema and spec text, kit's validator and package checks, and the native renderer. Both read documents up to 0.4.3.

## Test Cases

Tested in kit and the native renderer:


- `description` on each of the nine elements validates and changes nothing on screen.
- `description` on a `<col>` or on `<gui>` is an error in 0.4.3 and a warning in 0.4.2; on an `<instance>` it is a prop value and is left alone.
- `description=""` warns.
- `<gui template>` on a document validates and renders as without it; on `library.guix` or `library/x.guix` it is an error.

## Unresolved Questions

- **Should P3's wording change?** It has now been read as "no editor state" rather than "nothing unseen" for `role`, `name`, `detached-from`, `source-id` and this RFC. Saying so in P3 would stop each of these from being argued again. If the answer is yes, that is a principle amendment, and it belongs in its own change, possibly together with RFC-0045.
- **`description` on `<gui>`.** A document, a template especially, might want one. It's left out to keep this RFC to library items. Is a document's `name` enough?
- **`description` on `<prop>`.** Useful to an agent filling in an instance ("label: verb first, two words"), but nothing exports it today.
- **Mode axes and mode values.** "Compact is for dense admin tables" is real guidance. Should `<mode>` take a description too?
- **Templates across packages.** If a library package holds templates, they're documents, and RFC-0042 never shares documents. The copy-to-use rule above works without linking. Does the linked-library RFC need to say anything about listing a source's templates?
