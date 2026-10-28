---
rfc: 0035
title: detached-from — origin traceability for heavily-overridden instances
status: Implemented
targets: 0.3.8
date: 2026-05-31
updated: 2026-10-28
implemented: 2026-10-28
---

# `detached-from` — Origin Traceability for Heavily-Overridden Instances

## Context

When exporting from design tools like Figma, a component instance can be overridden so heavily — text, visibility, colors, child structure — that it no longer meaningfully behaves like a live instance. The instance is still visually derived from a component, but the overrides have replaced enough of the structure that expressing it as `<instance component="..." prop="..." />` with clean prop mappings is not viable.

The Figma exporter handles this with a threshold: if ≥75% of an instance's layers carry overrides, it writes the node as a plain frame and stamps the component it came from on the frame's root tag. Earlier versions stamped `component="…"`:

```xml
<col component="comp-heading-property-1-green" name="Heading" align="top-left">
  <col fill="#b9ff66" radius="7">
    <text value="Search engine" ... />
  </col>
</col>
```

`component=` is only meaningful on `<instance>` ([RFC-0008](0008-component-instance-system.md)). On a `<col>` it is undefined, renderers ignore it, and a reader may assume it behaves like a live instance with prop inheritance. It does not. The current exporter already writes `detached-from` instead; the format has never defined it.

Three later decisions shape it:

- **[RFC-0046](0046-identity-and-source-ids.md)** makes component ids unique across the whole package and makes an unresolved reference an error. `detached-from` holds a component id, so it is a reference.
- **[RFC-0044](0044-slots.md)** left open how `slot-accept` treats a detached instance: it is no longer an `<instance>`, but it still came from an accepted component.
- **[RFC-0042](0042-multi-document-packages.md)** left open whether an origin may point across documents.

## Decision

**One property on layout containers: `detached-from`, naming the component the container was detached from.**

```xml
<col detached-from="comp-heading-green" name="Heading" align="top-left">
  <col fill="#b9ff66" radius="7">
    <text value="Search engine" ... />
  </col>
</col>
```

### Rules

1. **Where it goes:** `frame`, `stack`, `row`, `col`, `grid` and `group` — the tags a component body can be. Never on `<instance>`, which has `component`.
2. **What it holds:** a component or variant id, the same namespace as `<instance component>`. A component-set id is not valid; the frame was detached from one variant.
3. **It must resolve.** The id names a component declared in the same document or in the package's `library.guix` — the same places an instance's component may come from. Documents do not see each other's declarations, so an origin never points into another document. A `detached-from` that resolves nowhere is an error ([P15](../PRINCIPLES.md)).
4. **An exporter writes it only when it declares that component.** If the component was not exported — a library component outside the package, for example — the exporter leaves `detached-from` out rather than write an origin that cannot be followed.
5. **It changes nothing on screen.** Renderers ignore it: no prop resolution, no inherited layout, no component body cloning.
6. **`component=` on any tag other than `<instance>` is invalid.**
7. **Slots:** a slot with `slot-accept` takes instances of the named components, and also a container whose `detached-from` names one of them. A set id in `slot-accept` covers every variant, so it accepts a container detached from any of them. The designer still thinks of a heavily-changed tab as a tab; refusing it would make every such export fail.
8. **Exporters only.** A person or an AI writing a file uses `<instance component>` for a live component, or a plain container for something custom. `detached-from` means "a tool could not express this as a clean instance"; markup written from scratch has no reason to say that.
9. **It sits beside `source-id`.** A detached container may also carry the instance's own `source-id` ([RFC-0046](0046-identity-and-source-ids.md)): `detached-from` points inside the package, `source-id` outside it.
10. **Kept by default.** An optimizer may offer a pass that strips it. It is never removed silently, since it cannot be recovered.

Rules 3 and 6 are 0.3.8 rules: errors in a document declaring 0.3.8 or higher, warnings in one written before.

## Reasoning

**Honest semantics.** `component=` on a structural tag implies "this is an instance of that component." It is not. `detached-from` says exactly what is true: this frame came from that component and is no longer bound to it.

**A reference, so it must resolve.** Pointing at a component that does not exist would claim a traceability the file does not have. Treating `detached-from` exactly like `<instance component>` — same namespace, same scope, same failure — means one rule for every component reference ([P12](../PRINCIPLES.md)), and makes the quality model's *Intact* gate ("`detached-from` origins are traceable", `spec/QUALITY.md`) something a validator can check.

**Useful for code generators.** A consumer generating React or Swift from a `.gui` can read `detached-from="comp-heading"` as "this column is the Heading component" and emit `<Heading>` rather than a raw container, passing the visible content as props. That is intent a renderer cannot derive ([P6](../PRINCIPLES.md)).

**Why slots accept it.** `slot-accept` states what a slot is made of — a tab bar holds tab items ([RFC-0044](0044-slots.md)). A tab item detached because it was heavily overridden is still a tab item to the designer, and `detached-from` says so in the file. Rejecting it would make a common export invalid for a reason the designer never chose.

**Tool-neutral.** Figma, Penpot and Sketch all let a designer detach an instance. The value is a `.gui` component id, not any tool's id ([P1](../PRINCIPLES.md)); the 75% threshold is one exporter's policy, not the format's.

### Principle pass

| Principle | Result | Note |
|---|---|---|
| P1 — neutral, round-trips | pass | Every major tool has detach; the value is a `.gui` id. Re-import can re-attach. |
| P3 — faithful, not a save file | pass | Provenance a consumer acts on, not editor state. |
| P4 — everything means something | pass | Present only when a frame really came from a declared component. |
| P5 — not React / HTML / Figma | pass | No behaviour; the detach threshold stays in the exporter. |
| P6 — intent vs computation | pass | A renderer could only guess the origin. |
| P8 — one vocabulary | pass | Same id namespace and scope as `<instance component>`. |
| P11 — grammar | pass | A property on existing tags, inline-single. |
| P12 — one way | pass | `component=` off `<instance>` is invalid, so there is one way to say this. |
| P14 — deterministic | pass | Rendering is identical with or without it. |
| P15 — honest | pass | An origin that does not resolve is an error; an exporter writes none it cannot back. |

## Alternatives Considered

**Keep `component=` on structural tags, define it as "detached instance"** — Rejected. Every reader would have to learn that `component=` means different things on different tags.

**Strip the origin entirely** — Rejected as the default. It loses design-system traceability that code generators and round-trip tools use, and it cannot be recovered. An optimizer can still strip it on request.

**A comment** (`<!-- detached from comp-heading -->`) — Rejected. Not machine-readable.

**Allow an origin outside the package** (a tool's component key) — Rejected. That is what `source-id` is for ([RFC-0046](0046-identity-and-source-ids.md)); `detached-from` stays a reference inside the file that a validator can check.

**Let `slot-accept` reject detached containers** — Rejected. Correct to the letter of "instances only", but it turns the most common heavily-overridden export into an invalid file.

**Allow a component-set id** — Rejected. A frame is detached from one variant, and naming the set loses which.

## Drawbacks

- Files exported before the Figma exporter switched carry `component=` on structural tags. They warn in documents declaring 0.3.7 or earlier, and fail from 0.3.8; the fix is renaming the attribute.
- An exporter must declare a component to keep a detached frame's origin. One that exports a single screen without its library components loses the origin rather than write a broken one.
- `detached-from` is a long name. It is rare — only heavily-overridden instances — so the cost is small.

## Implementation Notes

- **Schema:** `detached-from` on `FrameNode`, `StackNode` (and so `row`, `col`, `grid`) and `GroupNode`; described on the shared attributes and in `spec/DOTGUI.md`.
- **Kit validator:** `UNRESOLVED_DETACHED_FROM` when the id names no component or variant in the document or library; `DETACHED_FROM_MISPLACED` on `<instance>` or a non-layout tag; `COMPONENT_ON_NON_INSTANCE` for `component=` off `<instance>`. Errors from 0.3.8, warnings before. `slot-accept` accepts a container whose `detached-from` names an accepted component.
- **Kit HTML renderer and native renderer:** ignore `detached-from` when drawing. The native renderer applies the same `slot-accept` rule and refuses an unresolved origin from 0.3.8.
- **Figma exporter:** already writes `detached-from`. It must only do so when the component is declared in the export. Deferred with the rest of the Figma plugin work.
- **Optimizer:** keeps `detached-from` by default; an opt-in pass strips it.
- **On acceptance:** [RFC-0044](0044-slots.md)'s open question on detached instances is settled by rule 7, and [RFC-0042](0042-multi-document-packages.md)'s cross-document origin question by rule 3.

Shipped in 0.3.8: the schema, kit's validator, and the native renderer. Both read documents up to 0.3.8. The Figma exporter rule (write `detached-from` only for a declared component) waits with the rest of the Figma plugin work.

## Test Cases

Tested in kit and the native renderer:


- `<col detached-from="comp-heading">` with `comp-heading` declared in the document, or in `library.guix`, validates and renders exactly as the same `<col>` without it.
- `detached-from` naming an undeclared id is an error in 0.3.8, a warning in 0.3.7.
- `detached-from` naming a component-set id does not resolve.
- `detached-from` on `<instance>` or `<text>` is an error; `component=` on a `<col>` is an error in 0.3.8.
- A slot with `slot-accept="compset-tab-item"` accepts `<row detached-from="comp-tab-item-active">` when that variant is in the set, and rejects `<row detached-from="comp-other">`.
