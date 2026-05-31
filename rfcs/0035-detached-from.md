---
rfc: 0035
title: detached-from — origin traceability for heavily-overridden instances
status: Draft
targets: 0.3
date: 2026-05-31
---

# `detached-from` — Origin Traceability for Heavily-Overridden Instances

## Context

When exporting from design tools like Figma, a component instance can be overridden so heavily — text, visibility, colors, child structure — that it no longer meaningfully behaves like a live instance. The instance is still visually derived from a component, but the overrides have replaced enough of the structure that expressing it as `<instance component="..." prop="..." />` with clean prop mappings is not viable.

The dotgui Figma exporter handles this with a threshold: if ≥75% of an instance's layers carry overrides, it falls back to rendering the node as a plain frame via `frameToGui`, then injects `component="<id>"` onto whatever root tag comes out:

```js
return detached.replace(/^(\s*<\w+)/, '$1 component="' + entry.guiId + '"')
```

This produces markup like:

```xml
<col component="comp-heading-property-1-green" name="Heading" align="top-left">
  <col fill="#b9ff66" radius="7">
    <text value="Search engine" ... />
  </col>
  <col fill="#b9ff66" radius="7">
    <text value="optimization" ... />
  </col>
</col>
```

This is invalid under the component/instance system defined in RFC 0008. `component=` is only meaningful on `<instance>` tags — it is undefined behavior on structural tags like `<col>`, `<row>`, or `<frame>`. The renderer currently ignores it. The spec never formally defined it.

The attribute also creates a false impression: a reader seeing `<col component="...">` might assume it behaves like a live instance with prop inheritance. It does not.

## Decision

Introduce a `detached-from` attribute for structural tags (`<frame>`, `<col>`, `<row>`, `<stack>`, `<grid>`) that carries component origin as pure metadata with no runtime behavior.

```xml
<col detached-from="comp-heading-property-1-green" name="Heading" align="top-left">
  <col fill="#b9ff66" radius="7">
    <text value="Search engine" ... />
  </col>
  <col fill="#b9ff66" radius="7">
    <text value="optimization" ... />
  </col>
</col>
```

**Rules:**

- `detached-from` is valid only on structural layout tags (`frame`, `col`, `row`, `stack`, `grid`). It is not valid on `<instance>`.
- `detached-from` carries a component ID, the same namespace as `component=` on `<instance>`.
- The renderer treats `detached-from` as a no-op. No prop resolution, no layout inheritance, no component body cloning.
- `component=` on structural tags is now explicitly invalid. Parsers should warn and ignore.
- `<instance>` remains the only tag where `component=` is valid and meaningful.

## When `detached-from` appears

This attribute is an export artifact. It is produced when a design tool exporter encounters an instance that cannot be cleanly represented as a live `<instance>` with props:

- **Design tool export** (Figma, Penpot, Sketch) — when an instance has been overridden beyond the threshold where prop mapping is viable, the exporter renders it as a plain frame and stamps `detached-from` to preserve origin.
- **Round-trip tooling** — if a `.gui` file is re-imported into a design tool, `detached-from` hints that this frame should be re-attached to the named component if possible.

`detached-from` is **not** intended for hand-authored markup or AI-generated `.gui` files. When writing `.gui` by hand or generating it programmatically, the correct forms are:

- `<instance component="...">` for a live component reference with prop overrides
- A plain `<col>` / `<row>` / `<frame>` with no component reference if the structure is fully custom

If a coding agent or LLM generates markup with `detached-from`, it is a misuse of the attribute. The attribute means "a design tool could not express this as a clean instance" — a human or AI writing UI from scratch has no reason to emit it.

## Reasoning

**Honest semantics.** `component=` on a structural tag implies "this is an instance of that component." It is not. `detached-from` is explicit: "this frame came from that component but is no longer bound to it."

**Clear runtime contract.** Any tooling — renderer, optimizer, linter — can see `detached-from` and know with certainty: ignore this at runtime. No ambiguity about whether to attempt prop resolution or component body cloning.

**Useful for AI consumers.** An LLM reading a `.gui` file to generate React or Swift code can use `detached-from="comp-heading"` to infer "this col maps to the Heading component in the design system — generate a `<Heading>` call, not a raw div, and pass the visible child content as props." This is real signal that `component=` on a structural tag never clearly communicated because the semantics were undefined.

**Optimizer-safe.** Because `detached-from` is explicitly metadata with no visual impact, the optimizer can strip it in Pass 1 without any risk. Currently `component=` on structural tags cannot be confidently stripped because its meaning is undefined — it might matter to some consumer.

## Alternatives Considered

**Keep `component=` on structural tags, define it as "detached instance"** — Rejected. Too easily confused with live instance behavior. Every reader has to learn a special-case meaning for `component=` depending on what tag it appears on. `detached-from` is unambiguous at the tag level.

**Strip the origin entirely — emit a plain frame, no attribute** — Viable for minimal output, but loses design-system traceability that has real value for code generators and round-trip tooling. An optimizer pass can always strip `detached-from` for consumers that don't need it. You can't recover it once stripped.

**Use a comment** — `<!-- detached from comp-heading -->` — Not machine-readable. Parsers ignore comments. Tooling can't act on it.

## Drawbacks

- Existing `.gui` files exported from Figma carry `component=` on structural tags. These need a migration pass (rename `component=` → `detached-from=` on non-`<instance>` tags).
- `detached-from` is a long attribute name. At the frequency it appears (only heavily-overridden instances), this is acceptable.

## Implementation Notes

**Figma exporter (`gui-figma/src/code.ts`):** Replace the regex inject from:
```js
return detached.replace(/^(\s*<\w+)/, '$1 component="' + entry.guiId + '"')
```
to:
```js
return detached.replace(/^(\s*<\w+)/, '$1 detached-from="' + entry.guiId + '"')
```

**Renderer (`gui-render/src/index.ts`):** No behavior change needed. `detached-from` is ignored at runtime. Add a warning if `component=` is found on a non-`<instance>` tag.

**Optimizer:** Add to Pass 1 documentation — `detached-from` is eligible for stripping (zero visual impact). Make it opt-in via a flag (`--strip-detached-from`) so consumers that need traceability can keep it.

**Parser/linter:** Warn on `component=` appearing on any tag that is not `<instance>`.

## Unresolved Questions

- Should the optimizer strip `detached-from` by default (opt-out to keep) or keep by default (opt-in to strip)? Leaning toward keep-by-default since the traceability value for code generators is high and stripping is always recoverable.
