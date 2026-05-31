---
rfc: 0036
title: gui root attrs and meta block — platform and provenance
status: Draft
targets: 0.3
date: 2026-05-31
---

# `<gui>` Root Attrs and `<meta>` Block — Platform and Provenance

## Context

The `<gui>` root element currently carries two attributes: `version` (spec version) and `name` (screen or layer name). That is the full extent of document-level information in a `.gui` file today.

As dotgui is used across more tools — Figma exporters, AI agents, code generators, hand-authored files — two gaps have emerged:

1. **No platform signal.** A code generator reading a `.gui` file cannot tell whether it targets iOS, Android, web, or desktop without inferring from viewport dimensions or layer naming conventions. This forces guesswork.

2. **No provenance.** When a `.gui` file is exported from a design tool, there is no record of where it came from — which tool, which file, which node, when. Round-trip tooling and design-to-code diffing have no anchor point.

These are distinct concerns. Platform shapes how the file is interpreted. Provenance is purely informational — it has no effect on rendering or code generation and should never be required.

## Decision

### 1. Add `platform` to `<gui>` root attrs

`platform` is an optional attribute on the `<gui>` root describing the intended target platform.

```xml
<gui version="0.2" name="Checkout" platform="ios">
```

Recommended values (open string, not enforced):

| Value | Target |
|---|---|
| `ios` | Apple iOS / iPadOS |
| `android` | Android (Material) |
| `web` | Web browser (responsive or desktop) |
| `desktop` | Native desktop (macOS, Windows, Linux) |
| `tv` | TV / 10-foot UI |
| `watch` | Wearable / Apple Watch |

The value is open — any tool can emit its own platform string. The spec documents recommended values but does not validate them.

When absent, platform is unspecified. Consumers must not assume a default.

### 2. Introduce `<meta>` block for provenance

`<meta>` is an optional child of `<gui>` that carries export provenance. It must appear before any layout node, after `<tokens>`, `<fonts>`, `<styles>`, and `<components>` blocks.

```xml
<gui version="0.2" name="Checkout" platform="ios">
  <meta source="figma" source-node="336:1697" exported-at="2026-05-31T10:00:00Z" />
  <tokens>...</tokens>
  <col w="390">
    ...
  </col>
</gui>
```

**`<meta>` attributes:**

| Attr | Type | Description |
|---|---|---|
| `source` | open string | Tool or origin that produced this file. Recommended: `figma`, `penpot`, `sketch`, `hand`. |
| `source-node` | string | Node ID of the exported node in the source design tool. Design-tool exports only. |
| `exported-at` | ISO 8601 | Timestamp of when the export ran. |

All attributes are optional. An empty `<meta />` is valid but pointless — omit the block if there is nothing to say.

### 3. `<meta>` is absent on hand-authored and AI-generated files

`<meta>` is an export artifact. When a human or AI writes a `.gui` file from scratch, there is no source tool, no node ID, and no export timestamp. The block should be omitted entirely.

Presence of `<meta>` is therefore a reliable signal: this file came from a design tool export. Absence means it was authored directly.

## Reasoning

**`platform` on `<gui>` root, not in `<meta>`.** Platform shapes how the entire file is interpreted by a renderer or code generator — it is an input, not history. It belongs alongside `version` and `name` as a document descriptor. Provenance is history and belongs in `<meta>`.

**`source` is open string, not enum.** An enum of design tools (`figma | penpot | sketch`) would need to be updated every time a new tool adopts dotgui. An open string lets any tool self-identify without waiting for a spec update. Recommended values are documented as a convention, not a constraint.

**`source-node` kept despite being design-tool specific.** It is the most actionable provenance datum — with a node ID, round-trip tooling can re-export the same node, diff against the latest design, or re-attach to the live file. `source-file` (the design file name) was considered but dropped — it overlaps with `name` enough that the signal is weak. `source-url` was considered but dropped — the Figma plugin API does not expose the file URL, and it has no meaning for non-design-tool sources.

**`exported-at` in ISO 8601.** Standard, unambiguous, sortable. No timezone assumptions — exporters should emit UTC.

**`theme` and `viewport` deferred.** `theme` (`light` / `dark` / `auto`) is useful but requires mode support in the renderer — not yet implemented. `viewport` (`390x844`) is useful but requires scroll and fixed-canvas support to be meaningful — also not yet implemented. Both are natural additions to `<gui>` root attrs in a future RFC when their supporting features land.

## Alternatives Considered

**All metadata as attrs on `<gui>`** — Rejected. Provenance attrs (`source`, `source-node`, `exported-at`) have zero runtime meaning. Mixing them with structural attrs (`version`, `name`, `platform`) obscures which attrs a renderer actually needs to read. The `<meta>` block makes the boundary explicit and lets the optimizer strip provenance in a single targeted pass.

**`source-file` — the design file name** — Rejected. Overlaps with `name` on `<gui>` (which already captures the screen or layer name). The Figma file name and the exported node name are different things, but the file name adds little actionable value compared to `source-node`.

**`source-url` — link back to the source file** — Rejected. The Figma plugin API does not expose the canonical file URL. For hand-authored or AI-generated files, there is no URL. Not practical to emit reliably.

**`author` and `created-at`** — Rejected. Authorship is either implicit in the source tool (the design file's owner) or meaningless for the consumer. `created-at` is file management metadata, not format metadata. Neither affects rendering or code generation.

## Drawbacks

- Existing `.gui` files carry no `<meta>` block. Tooling must treat its absence gracefully — this is already required since the block is optional.
- `platform` being an open string means tooling cannot exhaustively validate it. A typo like `platfrom="ios"` goes undetected. Linters should warn on unknown values against the recommended list.

## Implementation Notes

**Figma exporter (`gui-figma/src/code.ts`):** Emit `<meta>` block after the `<gui>` opening tag with `source="figma"`, `source-node` from the exported node's ID, and `exported-at` as the current UTC timestamp. Add `platform` to the `<gui>` tag — the Figma plugin UI should expose a platform selector (default: unset).

**Renderer (`gui-render/src/index.ts`):** `<meta>` is already a no-op — the renderer does not process unknown child blocks. No change needed for `<meta>`. Read `platform` from `<gui>` if needed for platform-specific rendering decisions (none currently — future use).

**Optimizer:** Add `<meta>` to the Pass 1 strip candidates — it is eligible for removal with zero visual impact. Make stripping opt-in (keep by default, `--strip-meta` to remove) so round-trip and diffing tooling retains provenance.

**Parser/linter:** Warn on unknown `platform` values (not in the recommended list). Warn if `<meta>` appears in a file where `source="hand"` or `source` is absent — this is not an error but is unusual.

## Unresolved Questions

- Should the Figma plugin UI expose a `platform` selector, or should platform be inferred from the Figma file's device frame (iPhone frame → `ios`, Android frame → `android`)? Inference is convenient but unreliable — many Figma files use no device frame at all.
- Should `<meta>` support multiple entries for files that have been re-exported or processed by multiple tools? e.g. exported from Figma, then run through the optimizer. An export chain. Deferred — adds complexity for a niche case.
