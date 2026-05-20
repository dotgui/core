---
rfc: 0004
title: Package format — ZIP with .guix inside
status: Implemented
introduced-in: 0.1
date: 2026-05-20
---

# Package Format — ZIP with .guix Inside

## Context

A UI file references external assets — images, vector artwork, fonts. These need to travel with the markup. The format needed a way to bundle everything into one portable unit.

## Decision

`.gui` is a ZIP package. The markup lives inside as `design.guix`. Binary assets live in `assets/`. A preview thumbnail lives at `preview.webp`.

```
checkout.gui  (ZIP)
├── design.guix
├── preview.webp
└── assets/
    ├── img-1.webp
    └── svg-1.svg
```

A program distinguishing a package from raw markup uses magic bytes: ZIP starts with `PK`, markup starts with `<`.

## Reasoning

A single file that contains everything — markup, assets, and a visual preview — is the most portable and self-contained unit. You hand someone a `.gui` file and they have everything without a separate asset pipeline.

The `.guix` extension for the inner markup distinguishes raw markup from the packaged format at the file level. This matters for tools that need to process one or the other.

The `preview.webp` is not decoration — it is the face of the file. Before any tool opens or parses the markup, the preview can be shown. It is visual verification that the export captured what the designer intended.

## Alternatives Considered

**Inline base64 assets in the markup** — Viable for small files but makes the markup unreadable for large images. Base64 inflates size ~33%. Kept as a fallback for `src="base64:..."` on individual assets.

**Directory format (folder of files)** — Rejected. Sharing a folder is harder than sharing a file. Git, email, Slack, and file pickers all handle single files better.

**Custom binary container** — Rejected. ZIP is universally supported, inspectable with standard tools, and diff-friendly.

## Drawbacks

- ZIP overhead for files with no binary assets (pure markup with no images)
- Cannot be edited in a text editor without unpacking first

## Implementation Notes

The Figma plugin produces the ZIP client-side using the JSZip library. The renderer accepts either a ZIP blob or raw markup string, distinguished by magic bytes.
