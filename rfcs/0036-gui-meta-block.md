---
rfc: 0036
title: platform and source on the gui root
status: Implemented
targets: 0.3.6
date: 2026-05-31
updated: 2026-10-28
implemented: 2026-10-28
---

# `platform` and `source` on `<gui>`

## Context

The `<gui>` root carries `version` and `name`. That is the whole of what a document says about itself, and two gaps have shown up as more tools read and write the format:

1. **No platform signal.** A code generator cannot tell whether a document targets iOS, Android, the web or a desktop without inferring it from the canvas size or layer names. That is guesswork.
2. **No provenance.** A file exported from a design tool records nothing about which tool produced it. Round-trip tooling and design-to-code diffing have nothing to read a layer id against.

Both are already being written. The Figma exporter emits `platform` when the exported frame is an exact device size, and a `<meta source="figma" source-node="…" exported-at="…" />` block on every export. Kit reads `platform`; the native renderer ignores both. The spec defines neither.

### What changed from the first draft

The first draft put provenance in a `<meta>` block with three attributes: `source`, `source-node`, `exported-at`. A hearing against [PRINCIPLES.md](../PRINCIPLES.md) found the intent sound and the form wrong:

- **A tag where a property would do.** Provenance is one or two scalar facts about the document. [P11](../PRINCIPLES.md) prefers a property over a new tag.
- **`<meta>` is HTML's word.** The preamble names "meta soup" as the baggage the format drops, and a model with HTML priors will write `<meta name="…" content="…">` into it ([P7](../PRINCIPLES.md), [P8](../PRINCIPLES.md)).
- **It would be shared by accident.** In a multi-document package, everything above `library.guix`'s layout root is shared with every document ([RFC-0042](0042-multi-document-packages.md)). A library's `<meta>` would become every document's provenance, while each document has its own ([RFC-0046](0046-identity-and-source-ids.md)). Root attributes are not part of the library part, so they stay per-document without an exception.
- **`exported-at` breaks determinism.** Two exports of the same unchanged design would differ, and every diff of a re-exported file would show a change ([P14](../PRINCIPLES.md)).
- **`source-node` is already being replaced.** [RFC-0046](0046-identity-and-source-ids.md) writes the exported frame's id as `source-id` on the root, like every other node. Shipping `source-node` in 0.3.6 to supersede it in 0.3.7 is two ways to say one thing ([P12](../PRINCIPLES.md)).
- The draft also contradicted itself: its rule placed `<meta>` after the declaration blocks, while its own example — and the exporter — put it first.

## Decision

**Two optional attributes on `<gui>`. No new tag.**

```xml
<gui version="0.3.6" name="Checkout" platform="ios" source="figma">
```

### `platform` — the intended target

An open string describing the platform the document is designed for. Recommended values:

| Value | Target |
|---|---|
| `ios` | iOS / iPadOS |
| `android` | Android |
| `web` | Web browser, responsive or desktop |
| `desktop` | Native desktop — macOS, Windows, Linux |
| `tv` | TV / 10-foot UI |
| `watch` | Wearables |

- Absent means **unspecified**. A consumer must not assume a default.
- It describes intent. It changes nothing about how the document is drawn; the core vocabulary stays platform-neutral ([P2](../PRINCIPLES.md)).
- Values outside the recommended list are allowed. Linters warn on them, so a typo is caught without the spec having to enumerate every platform.
- An exporter writes it only when it knows. The Figma exporter's rule — exact device-frame sizes only, no fuzzy matching — is the model: inference that can be wrong is not written ([P14](../PRINCIPLES.md)).

### `source` — the tool that produced the file

An open string naming the producer. Recommended values: `figma`, `penpot`, `sketch`, `html`.

- **Exporters only.** A file written by hand or by an AI has no source and omits it. Its presence therefore means the file was exported by a tool; its absence means it was authored directly.
- It is the anchor other provenance is read against. [RFC-0046](0046-identity-and-source-ids.md) adds `source-id` — the source tool's own id for a node, including the root — and reads it against this `source`.
- It is the same word, with the same meaning, as `<font source>`: where a thing came from ([P8](../PRINCIPLES.md)).

### Per document

Both attributes belong to the document that declares them. In a multi-document package each document, `library.guix` included, carries its own; nothing is inherited from the library, because root attributes are not part of a document's library part ([RFC-0042](0042-multi-document-packages.md)).

### Not recorded

- **When it was exported.** A timestamp makes identical exports differ. Version control and file metadata already know.
- **Which file it came from.** No export format records it, the consumer doing a round trip already knows, and a file key is an access-bearing link that would travel with every copy ([RFC-0046](0046-identity-and-source-ids.md), *Why the source file is not recorded*).
- **`theme` and screen size.** Theme is token modes ([RFC-0037](0037-token-modes-theming.md)); screen size is [RFC-0050](0050-screen-and-scroll.md).

## Reasoning

**Both are facts about the document, so both sit on its root.** `version` and `name` already live there; `platform` and `source` are the same kind of thing. The first draft's argument for a block — keeping renderer-relevant attributes apart from informational ones — does not hold: a renderer reads neither `platform` nor `source`. And stripping provenance from a file for handoff is removing one attribute, as easy as removing one block.

**Open strings, recommended values.** An enum of tools or platforms would need a spec change every time a new one appears. Recommended values give producers a convention to agree on; linters catch the typos ([P15](../PRINCIPLES.md)).

**The lowest rung that works.** Two inline-single values ([P11](../PRINCIPLES.md)). Nothing here needs a tag, a list, or a block.

### Principle pass

| Principle | Result | Note |
|---|---|---|
| P1 — neutral, round-trips | pass | `source` is any tool's name; it is what round-trip ids are read against. |
| P2 — platform-agnostic | pass | `platform` describes a target and changes no vocabulary. |
| P3 — faithful, not a save file | pass | Provenance, not editor state; no timestamp, no file key. |
| P4 — everything means something | pass | Present only when known; absent means unspecified or hand-authored. |
| P5 — not React / HTML / Figma | pass | No behaviour; no HTML `<meta>`; no tool internals. |
| P6 — intent vs computation | pass | Neither can be derived by a renderer. |
| P7 / P8 — readable, one vocabulary | pass | Plain nouns; `source` matches `<font source>`. |
| P9 / P10 — compact, conventions | pass | Absent by default; one attribute each when present. |
| P11 — grammar | pass | Properties on an existing tag, inline-single values. |
| P12 / P13 — one way, few primitives | pass | No new tag; `source-node` left to RFC-0046's `source-id`. |
| P14 — deterministic | pass | No timestamp; exporters write `platform` only on an exact match. |
| P15 — honest | pass | Unknown values are allowed and warned on, never guessed into a default. |

## Alternatives Considered

**A `<meta>` block with `source`, `source-node` and `exported-at`** — Rejected. This RFC's first draft. A tag where a property does, HTML's word, shared by accident in a package, and non-deterministic; see *What changed from the first draft*.

**`exported-at` on `<gui>`** — Rejected. Moving the timestamp does not fix it: identical exports still differ.

**`source-node` on `<gui>`** — Rejected. The root's id is written as `source-id`, the same way as every other node's ([RFC-0046](0046-identity-and-source-ids.md)).

**`source-url` / `source-file`** — Rejected. Not exposed by every tool, meaningless for hand-written files, and a file link carries access with every copy.

**`author` / `created-at`** — Rejected. File-management metadata, not format metadata.

**An enum for `platform` or `source`** — Rejected. Every new platform or tool would need a spec change.

## Drawbacks

- Files exported before this RFC carry `<meta>`. Consumers must keep tolerating it in documents declaring 0.3.5 or earlier; from 0.3.6 it is reported as obsolete, with the attributes to use instead.
- Open strings cannot be validated exhaustively; a typo is a lint warning, not an error.
- Between 0.3.6 and 0.3.7 an exporter can name its tool but has no way to write the exported frame's id. The window is one point release, and nothing ships that writes it today except the Figma exporter, whose output is being reworked anyway.

## Implementation Notes

- **Schema:** `platform` and `source` on the `<gui>` root entry in `schema/spec.content.ts`.
- **Kit:** the validator accepts both, warns on a `platform` outside the recommended list, and warns on `<meta>` in a document declaring 0.3.6 or higher. `info()` reports `source` beside `platform`.
- **Native renderer:** reads neither. Reports `<meta>` the same way for 0.3.6 documents.
- **Figma exporter:** writes `source="figma"` and, when known, `platform` on `<gui>`; stops writing `<meta>`. Deferred with the rest of the Figma plugin work.
- **On acceptance:** [RFC-0046](0046-identity-and-source-ids.md) reads `source-id` against `<gui source>` instead of `<meta source>` (noted there, rewritten at its hearing), and [P1](../PRINCIPLES.md)'s list of provenance names `source` and `source-id` (done).

Shipped in 0.3.6: the schema entry; kit's validator warns `UNKNOWN_PLATFORM` and `OBSOLETE_META` and `info()` reports `source`; the native renderer reports an obsolete `<meta>`. Both read documents up to 0.3.6. The Figma exporter change waits with the rest of the Figma plugin work.

## Test Cases

Tested in kit and the native renderer:

- `<gui version="0.3.6" platform="ios" source="figma">` validates and renders.
- `platform="iso"` warns as an unknown platform and never fails.
- `<meta source="figma" source-node="1:2" exported-at="…">` in a `0.3.6` document is reported as obsolete; the same block in a `0.3.5` document is untouched.
- `info()` reports `platform` and `source`.

## Unresolved Questions

- **Should a multi-document package state a platform as a whole?** Current lean, shared with [RFC-0042](0042-multi-document-packages.md): no — read it per document and assume nothing for the package.
- **Should `platform` take a list** (`platform="ios android"`) for a screen designed for both? Lean: no until a real file needs it; a shared screen is better described by leaving `platform` out.
