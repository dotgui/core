---
rfc: 0001
title: XML over JSON
status: Implemented
introduced-in: 0.1
date: 2026-05-20
---

# XML over JSON

## Context

dotgui needed a serialization format for describing UI structure. The two obvious candidates were XML and JSON. The choice has downstream effects on readability, AI generation, and the cognitive model for working with the format.

## Decision

Use XML-inspired markup as the format for `.guix` files.

## Reasoning

XML has one property JSON does not: **the tag name carries semantic meaning separate from the data**. `<stack direction="horizontal">` reads as a horizontal stack. The JSON equivalent `{ "type": "stack", "direction": "horizontal" }` reads as a database record — the `"type"` key is a workaround for something XML gets for free.

XML also maps naturally to UI trees. Nesting communicates containment. Attributes communicate properties. Children communicate children. This is the same instinct behind SVG, JSX, and HTML.

For AI specifically: models are trained on enormous amounts of tag-based markup. Asking an LLM to write a `.gui` layout is like asking it to write JSX — it already knows the pattern cold. JSON requires the model to maintain a `"type"` convention that has no parallel in its training data for UI.

## Alternatives Considered

**JSON** — Rejected. The `"type"` key workaround is awkward. Attribute vs child distinction is lost. Deeper nesting becomes hard to read quickly.

**YAML** — Rejected. Indentation-sensitive, brittle to copy-paste, no good tag-name concept, poor tooling support relative to XML.

**Custom binary format** — Rejected immediately. Defeats the entire purpose of human and AI readability.

## Drawbacks

- XML is more verbose than JSON for the same data when tag names are long
- No native support for comments in attribute values
- Closing tags add noise for deeply nested structures

## Implementation Notes

The markup lives inside the ZIP package as `design.guix`. A program distinguishing a package from raw markup uses magic bytes: ZIP starts with `PK`, markup starts with `<`.

## Test Cases

- A `.guix` file must be valid XML
- Tag names carry semantic meaning and map 1:1 to node types
- Attributes are the primary vehicle for node properties
