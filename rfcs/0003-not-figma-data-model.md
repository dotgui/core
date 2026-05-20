---
rfc: 0003
title: Not Figma's own data model
status: Implemented
introduced-in: 0.1
date: 2026-05-20
---

# Not Figma's Own Data Model

## Context

Figma exposes a rich API that returns detailed node data. Since dotgui exports from Figma, the simplest approach would be to serialize Figma's own data model directly.

## Decision

dotgui is an independent format. It maps to Figma concepts but uses its own vocabulary, structure, and naming. The Figma API is an input to the extractor — not the format itself.

## Reasoning

Figma's API returns **raw authoring state** — a 1:1 snapshot of every property in the editor, including defaults, overrides, legacy values, and implementation details of Figma's rendering engine. It is designed for Figma plugins to read, not for downstream tools to consume.

Examples of authoring noise in the Figma API:
- `fontWeight: [700, 700]` instead of `font-weight="700"`
- `layoutMode: "HORIZONTAL"` instead of `direction="horizontal"`
- Deeply nested `fills` arrays even for a single solid color
- Internal IDs, component keys, and plugin data scattered throughout

dotgui is an **export format**. It carries what matters for rendering and reasoning, stripped of authoring noise, using names that mean what they say.

The format is also designed to be platform-agnostic — it should be producible from sources other than Figma. Encoding Figma's internal model would permanently tie the format to Figma's choices.

## Alternatives Considered

**Direct Figma API serialization** — Rejected. Too verbose, too noisy, too coupled to Figma's internal evolution. Any Figma API change could break the format.

**Thin wrapper around Figma JSON** — Rejected. Same problems, just slightly restructured. Still requires consumers to understand Figma's model.

## Drawbacks

- Requires maintaining a mapping layer between Figma concepts and dotgui concepts
- New Figma features need a deliberate dotgui equivalent before they can be exported
