---
rfc: 0001
title: XML-inspired markup over JSON
status: Implemented
introduced-in: 0.1
date: 2026-05-20
updated: 2026-05-23
---

# XML-inspired markup over JSON

## Context

dotgui needed a serialization format for describing UI structure. The two obvious candidates were XML and JSON. The choice has downstream effects on readability, AI generation, and the cognitive model for working with the format.

## Decision

The markup language inside the `.gui` package is XML-inspired — not strict XML.

Like JSX to JavaScript, the markup follows XML's shape: tags, attributes, nesting, self-closing elements. But it is not bound by XML's rules. The format can introduce shorthands, CSS-style functions, or expressions that a strict XML parser would reject. The `.guix` filename inside the package signals this — it is not a `.xml` file.

## Reasoning

XML has one property JSON does not: **the tag name carries semantic meaning separate from the data**. `<stack direction="horizontal">` reads as a horizontal stack. The JSON equivalent `{ "type": "stack", "direction": "horizontal" }` reads as a database record — the `"type"` key is a workaround for something XML gets for free.

XML also maps naturally to UI trees. Nesting communicates containment. Attributes communicate properties. Children communicate children. This is the same instinct behind SVG, JSX, and HTML.

For AI specifically: models are trained on enormous amounts of tag-based markup. Asking an LLM to write a `.gui` layout is like asking it to write JSX — it already knows the pattern cold. JSON requires the model to maintain a `"type"` convention that has no parallel in its training data for UI.

The JSX comparison is intentional and not just aesthetic. JSX proved that taking XML's syntax and relaxing its rules — rather than following them strictly — produces a more expressive, practical language. The `.gui` markup takes the same position.

## Alternatives Considered

**JSON** — Rejected. The `"type"` key workaround is awkward. Attribute vs child distinction is lost. Deeper nesting becomes hard to read quickly.

**YAML** — Rejected. Indentation-sensitive, brittle to copy-paste, no good tag-name concept, poor tooling support relative to XML.

**Strict XML** — Rejected as the compliance target. XML's rules exist for document interchange standards, not for a UI layout language. Requiring strict XML validity would block useful shorthands and force verbose syntax where a relaxed parser handles it cleanly.

**Custom binary format** — Rejected immediately. Defeats the entire purpose of human and AI readability.

## Drawbacks

- XML is more verbose than JSON for the same data when tag names are long
- No native support for comments in attribute values
- Closing tags add noise for deeply nested structures

## Implementation Notes

The markup lives inside the `.gui` ZIP package as `design.guix`. The parser is a custom XML-inspired parser — not a strict XML parser. It handles the format's own conventions without being constrained by XML spec compliance.

## Test Cases

- Tag names carry semantic meaning and map 1:1 to node types
- Attributes are the primary vehicle for node properties
- The markup parses correctly without requiring strict XML validity
