---
rfc: 0015
title: Boolean presence convention
status: Draft
targets: 0.2
date: 2026-05-20
---

# Boolean Presence Convention

## Context

In 0.1, boolean attributes are written as `attribute="true"`. This is verbose and inconsistent with how HTML and most modern markup languages handle booleans.

## Decision

Any boolean property is written as a bare attribute. Presence = true. Absence = false. No `="true"` or `="false"` values.

```xml
wrap          instead of   wrap="true"
clip          instead of   clip="true"
mask          instead of   mask="true"
abs           instead of   layout-position="absolute"
truncate      instead of   truncate="true"
reverse-z     instead of   reverse-z="true"
```

`abs` is a special case — it's not just a shortened boolean, it fully replaces `layout-position="absolute"` as a new attribute name.

## Reasoning

Bare boolean attributes are the HTML standard. `<input disabled>` not `<input disabled="true">`. Every developer and every LLM trained on HTML already knows this convention.

`="true"` adds 6 chars of noise to convey exactly one bit of information. At the frequency these appear in real files, the savings compound.

`="false"` is never needed — absence already means false.

## Alternatives Considered

**Keep `="true"`** — Rejected. No benefit over presence-only. The convention is universally understood.

**`no-` prefix for false** (`no-wrap`, `no-clip`) — Rejected. Absence already handles false. A `no-` form would create a third state (present-false vs absent) with no use case.

## Drawbacks

- `abs` as a new attribute name (vs just `layout-position="true"`) is a rename, not just a convention change — slightly more to update
- XML technically requires attribute values — parsers that strictly enforce XML spec may reject bare attributes. dotgui parsers must handle HTML-style boolean attributes.

## Unresolved Questions

- Should `abs="x y"` (positional shorthand encoding x and y into the attribute value) be supported? e.g. `abs="24 80"` meaning `abs x="24" y="80"`. Deferred — adds parsing complexity for moderate savings.
