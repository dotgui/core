# dotgui RFCs

Request for Comments — the decision log for the dotgui format.

Every significant design decision lives here as an RFC. This includes decisions that were accepted, rejected, and superseded. Especially rejected ones — they document why certain ideas were deliberately not pursued, so the same ground isn't covered twice.

---

## Format Versions

```
0.1   →  initial format design (current)
0.2   →  layout API overhaul (in progress)
1.0   →  first public stable release (future)
```

Pre-1.0: no stability guarantees. Breaking changes are free.
Post-1.0: semver applies. MAJOR = breaking, MINOR = additive, PATCH = clarification only.

---

## RFC Lifecycle

```
Draft        →  thoughts, actively changing, no commitment
Proposed     →  direction is set, open for final feedback
Accepted     →  decision made, implementation can begin
Implemented  →  shipped in the format
Rejected     →  considered and deliberately not done
Superseded   →  replaced by a newer RFC
```

---

## RFC Structure

Each RFC has frontmatter followed by these sections:

| Section | Required on |
|---|---|
| Context | all |
| Decision | all except Rejected |
| Reasoning | all |
| Alternatives Considered | all |
| Drawbacks | Accepted / Implemented |
| Implementation Notes | Accepted / Implemented |
| Test Cases | Accepted / Implemented |
| Unresolved Questions | Draft / Proposed |
| Reasoning for Rejection | Rejected |
| What to Do Instead | Rejected |

---

## Index

### 0.1 — Initial Format Design

| RFC | Title | Status |
|---|---|---|
| [0001](0001-xml-over-json.md) | XML over JSON | Implemented |
| [0002](0002-not-svg.md) | Not SVG | Implemented |
| [0003](0003-not-figma-data-model.md) | Not Figma's own data model | Implemented |
| [0004](0004-package-format.md) | Package format — ZIP with .guix | Implemented |
| [0005](0005-token-system.md) | Token system — flat $name references | Implemented |
| [0006](0006-layout-sugar-tags.md) | Layout sugar tags — row / col / grid | Implemented |
| [0007](0007-appearance-block.md) | Appearance block for multi-fill | Implemented |
| [0008](0008-component-instance-system.md) | Component and instance system | Implemented |
| [0009](0009-optimizer-separate.md) | Optimizer separate from extractor | Implemented |
| [0010](0010-no-ai-in-pipeline.md) | No AI in the pipeline | Implemented |

### 0.2 — Layout API Overhaul

| RFC | Title | Status |
|---|---|---|
| [0011](0011-w-h-unified-sizing.md) | w / h unified sizing | Draft |
| [0012](0012-align-9point.md) | 9-point align replaces justify + align | Draft |
| [0013](0013-gap-auto-convention.md) | gap / gap="auto" replaces space-between | Draft |
| [0014](0014-absent-means-hug.md) | Absent w/h = hug, layout containers only | Draft |
| [0015](0015-boolean-presence-convention.md) | Boolean presence convention | Draft |
| [0016](0016-padding-p-per-side.md) | p and per-side padding pt/pr/pb/pl | Draft |
| [0017](0017-gap-two-value-wrap.md) | Two-value gap for wrap rows | Draft |
| [0018](0018-rejected-sz-shorthand.md) | REJECTED: sz combined sizing shorthand | Rejected |
| [0019](0019-rejected-strokes-in-layout.md) | REJECTED: strokes-in-layout | Rejected |

### 0.2 — SVG & Asset Improvements

| RFC | Title | Status |
|---|---|---|
| [0020](0020-svg-inline-content.md) | Inline SVG content on the `<svg>` tag | Implemented |

### 0.2 — Canvas Model

| RFC | Title | Status |
|---|---|---|
| [0021](0021-root-canvas-model.md) | Root canvas model — drop `viewport`, `<col>` over `<frame>` | Draft |

### 0.3 — Vocabulary & Primitives

| RFC | Title | Status |
|---|---|---|
| [0022](0022-fill-and-border.md) | fill and border — unified color and outline properties | Draft |
| [0023](0023-remove-shape.md) | Remove `<shape>` — geometry as frames, paths as assets | Draft |
