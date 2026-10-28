---
rfc: 0004
title: Package format — .gui is always a ZIP package
status: Implemented
amended-by: 0042, 0043, 0054
introduced-in: 0.1
date: 2026-05-20
updated: 2026-05-23
---

# Package Format — `.gui` is always a ZIP package

## Context

A UI file references external assets — images, vector artwork, fonts. These need to travel with the markup. The format needed a way to bundle everything into one portable unit.

## Decision

> **Amended.** [RFC-0042](0042-multi-document-packages.md) replaced the single `design.guix` with any number of root documents plus an optional `library.guix`. [RFC-0043](0043-standalone-guix.md) made bare `.guix` markup a served form. [RFC-0054](0054-folder-form-packages.md) made a directory named `*.gui` a package too — the form a package is worked on in. The ZIP described below remains the transfer form.

`.gui` is always a ZIP package. There is no standalone markup format. The markup lives inside the package as `design.guix`. Binary assets live in `assets/`. A preview thumbnail lives at `preview.webp`.

```
checkout.gui  (ZIP)
├── design.guix
├── preview.webp
└── assets/
    ├── hero.webp
    └── logo.svg
```

`.guix` is the filename for the markup file inside the package. It is not a format users interact with — it never lives outside a `.gui` package. The `.guix` name signals that the markup is not generic XML: it is XML-inspired, not XML-strict. See RFC 0001 for the markup language design.

## Reasoning

A single file that contains everything — markup, assets, and a visual preview — is the most portable and self-contained unit. You hand someone a `.gui` file and they have everything.

The `preview.webp` is not decoration — it is the face of the file. Before any tool opens or parses the markup, the preview can be shown. It is visual verification that the export captured what the designer intended.

## Alternatives Considered

**Inline base64 assets in the markup** — Tested and rejected entirely. In practice, inlining 2–4 images as base64 consumed roughly 50% of a 5-hour token session. The failure mode is most acute during `.gui → HTML` conversion via AI: the model has to tokenise every character of the base64 string — thousands of tokens per image — just to emit a single `<img src="...">` line. The image data is completely opaque to the model yet it pays the full token cost for it. Plain asset path references (`src="assets/hero.webp"`) were reliable and cost nothing. Base64 inline is not supported in any form.

**Directory format (folder of files)** — Rejected. Sharing a folder is harder than sharing a file. Git, email, Slack, and file pickers all handle single files better.

**Custom binary container** — Rejected. ZIP is universally supported, inspectable with standard tools, and diff-friendly.

## Drawbacks

- ZIP overhead for files with no binary assets (pure markup with no images)
- Cannot be edited in a text editor without unpacking first

## Implementation Notes

The Figma plugin produces the ZIP client-side using the JSZip library. The renderer opens the ZIP, reads `design.guix`, and resolves asset paths relative to `assets/`.
