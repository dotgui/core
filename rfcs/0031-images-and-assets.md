---
rfc: 0031
title: Images and assets as self-contained visual dependencies
status: Implemented
introduced-in: 0.3
date: 2026-05-22
updated: 2026-05-23
related: 0004
---

# Images and assets as self-contained visual dependencies

## Context

A `.gui` file should behave like an exportable visual artifact: open it later, on another machine, and the UI still renders. That requires assets to be embedded in the package and referenced inline — with no separate declaration step.

## Decision

Images declare their source inline. No `<assets>` block. No `$id` indirection.

The renderer determines how to load the asset from the `src` value alone:

- **Relative path** → asset is embedded in the package under `assets/`
- **`https://` URL** → asset is an external reference (Rule 2)

```xml
<!-- Rule 1: embedded -->
<img src="assets/hero.webp" w="1200" h="800" fit="cover" />
<img src="assets/logo.svg" w="240" h="64" />

<!-- Rule 2: url reference (fallback only) -->
<img src="https://images.unsplash.com/photo-..." w="1200" h="800" fit="cover" />
```

---

### Rule 1 — Embed (default)

Assets are downloaded at creation time and stored in `assets/` inside the package. The file is self-contained. No network access needed at render time.

Creation tools — software or AI builders — are responsible for embedding before the file is written.

### Rule 2 — URL reference (fallback only)

Some services, most notably free-tier stock photo providers like Unsplash, do not permit programmatic image downloads without authenticated API access. This creates a class of assets that cannot be embedded at creation time by all tools.

When embedding is not possible, the `src` is written as a fully qualified URL. The renderer attempts to load it at render time. If the resource fails to load, the renderer shows an `asset not loaded` error state in place of the image. No silent failure.

Rule 2 exists solely because of the dependency on services that withhold direct access. It is not the preferred state of a finished `.gui` file.

---

## Why no `<assets>` block

Fonts use a document-level declaration because they must be loaded before layout can be calculated — they are a document-level dependency.

Tokens use a document-level declaration because reusability is their purpose — define once, reference everywhere.

Images are neither. They are used inline, at the point they appear. A separate declaration block forces every image to be named twice: once in the manifest and once in the layout. HTML, SwiftUI, and Android do not have a runtime image manifest for the same reason. The `assets/` folder in the package handles deduplication naturally — same file, same path, one copy on disk.

## Reasoning

Inline `src` reduces tokens, removes indirection, and matches how every major layout format handles images. The path format (`assets/` vs `https://`) carries all the information the renderer needs to distinguish embedded from external. No additional metadata required.

## Alternatives Considered

**`<assets>` block with `$id` references** — Rejected. Doubles the declaration surface for no gain. Id + src is a token overhead with no reusability benefit for images.

**Inline base64 `src`** — Tested and rejected. Inlining 2–4 images consumed ~50% of a 5-hour token session. The failure is most acute during `.gui → HTML` conversion via AI: the model tokenises every character of a base64 string — thousands of tokens per image — just to emit a single `<img src="...">` line. Not supported in any form. See RFC 0004.

**Store origin URL as metadata on embedded assets** — Rejected. Once an asset is embedded, its origin is irrelevant to the format.

## Drawbacks

- No document-level asset inventory. Tools that want to enumerate all assets in a file must scan the layout tree.
- Rule 2 assets are a runtime dependency and can break silently if the renderer does not surface the error state clearly.

## Implementation Notes

1. Creation tools must attempt to embed all assets before writing the file.
2. If embedding fails due to service restrictions, write the URL directly as `src` and warn the user at creation time.
3. Deduplicate embedded assets by storing identical files once under a content-hash filename in `assets/`.
4. Renderer must display `asset not loaded` visually when a URL `src` fails — no silent failure.
5. Renderer treats any `src` beginning with `https://` as Rule 2. Everything else is a package-relative path.

## Test Cases

```xml
<img src="assets/hero.webp" w="320" h="240" fit="cover" />
<img src="assets/logo.svg" w="24" h="24" />
<img src="https://images.unsplash.com/photo-..." w="320" h="240" fit="cover" />
```

## Implementation

Implemented in Figma plugin (`gui-figma`), renderer (`gui-render`), and landing (`gui-landing`) on 2026-05-23.

- Figma plugin: removed `<assets>` block generation, removed `$id` references throughout — all asset `src` attrs now write `assets/filename.ext` directly. Single-use SVG skip removed (was silently breaking those assets in packaged files).
- `App.vue`: `parseGuiAssets` scans `src="assets/..."` across the layout tree instead of reading an `<assets>` block. `applyWebP` renames path keys and patches XML in one pass. `packagedIndex` simplified — no asset block rewriting, preview only.
- Renderer: no changes required. `resolveSrc` already resolves by map key lookup, works identically for `assets/` path keys.
- Raster format: WebP is the default on export. Original format is not preserved — lossy compression at 0.85 quality is the standard.
