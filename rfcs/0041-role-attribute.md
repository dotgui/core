---
rfc: 0041
title: role attribute — UI role vocabulary
status: Draft
targets: 0.2
date: 2026-06-12
---

# `role` Attribute — UI Role Vocabulary

## Context

The CCACT quality model (RFC-0040) defines a Conventional level that measures whether a `.gui` file composes UI using recognized, globally-understood roles — navigation bars, tab bars, cards, dialogs. As specified in RFC-0040, the Conventional level runs structural signature matching against a role catalog on gui.farm to infer what roles are present.

Inference is useful but incomplete. It cannot distinguish between a node that *resembles* a nav-bar and one that *is* a nav-bar by author intent. A breadcrumb trail and a navigation bar can share the same structural shape; inference alone cannot disambiguate them. And an AI generator — the primary author of `.gui` files (P7) — knows exactly what it is building at write time. There is no mechanism to state that knowledge in the file.

RFC-0010 explicitly anticipated this gap: "AI-assisted naming / semantic tagging — Considered for v2. Deferred — semantic roles should be explicit in the format, not inferred by AI." This RFC delivers that explicit form.

## Decision

### The attribute

`role` is an optional property on any layout node (`<row>`, `<col>`, `<frame>`, `<grid>`) that declares the node as a canonical instance of a recognized UI role.

```xml
<row role="nav-bar" p="0 24" align="center-between">
  <img src="logo.svg" w="32" h="32" />
  <row gap="32">
    <text>Products</text>
    <text>Pricing</text>
    <text>Docs</text>
  </row>
  <row gap="12">
    <text>Sign in</text>
    <rect w="88" h="36" radius="8" fill="$color-brand-primary" />
  </row>
</row>
```

The attribute is absent on the overwhelming majority of nodes. It appears only on the **root node of a role** — the one that structurally defines the role boundary. It does not propagate to children.

### What this is not

`role` is a visual/structural classification. It is not an ARIA `role`, an accessibility declaration, or a document semantic. It carries no behavior, no accessibility tree membership, no runtime semantics of any kind. It describes *what the node visually and structurally is*, not *what it does at runtime*.

The attribute name `role` and ARIA's `role` attribute are the same word with different vocabularies. ARIA values are singular nouns derived from document and widget semantics (`navigation`, `banner`, `dialog`, `button`). dotgui `role` values are kebab-case UI component names from the role catalog (`nav-bar`, `tab-bar`, `card`, `dialog`). The two vocabularies are not interchangeable and the contexts are distinct — ARIA lives in an HTML runtime; dotgui is a static interchange format.

Downstream consumers — HTML code generators, accessibility-layer skills — may read `role="nav-bar"` and emit the appropriate ARIA (`role="navigation"`, `aria-label="Main navigation"`) on their output. That is a downstream interpretation, not a claim the format makes. The `.gui` file does not assert accessibility semantics.

### The vocabulary

Valid values come exclusively from `core/roles/`. Each role is a separate `.md` file defining:

- **Canonical name** (kebab-case, the `role=` value)
- **Structural signature** — the required and optional nodes and their relationships, expressed as matchable rules (not prose)
- **Required context** — where in the layout tree the role is typically anchored (e.g. top-level of a screen, inside a `<col>` root)
- **Coverage** — which of the three reference platforms document this role (Web / iOS / Android)
- **AKA** — alternative names from other platforms or design systems, sourced from the [Mobbin glossary](https://mobbin.com/glossary)
- **Disqualifying shapes** — shapes that resemble the role but are not it (used by the plausibility auditor)

### Role qualification — the three-table test

A role qualifies for `core/roles/` by appearing in at least one of three platform reference systems:

| Platform | Reference | Scope |
|---|---|---|
| **Web** | [Component Gallery](https://component.gallery/) | Aggregates Ant Design, Carbon, Fluent, GOV.UK, Primer, Spectrum, Material, and more — if it is here it is recognized across the web design system ecosystem |
| **iOS** | Apple Human Interface Guidelines | Native iOS/iPadOS components |
| **Android** | Material Design Guidelines | Android and cross-platform components |

**Naming reference (not a qualification column):** [Mobbin glossary](https://mobbin.com/glossary) — cross-platform AKA names reflecting real-world industry usage. Used to populate the `AKA` field in each role file, not to qualify or disqualify a role.

Coverage determines platform scope, not whether a role exists:
- All three → **Universal** — no platform restriction on the `role=` value
- Two → **Cross-platform** — valid on the covered platforms
- One → **Platform-scoped** — valid on that platform; should co-occur with a matching `platform=` on the `<gui>` root

Two things are excluded regardless of coverage:
- **Rendered content, not UI structure** — `map`, `map-pin`. These are geographic/data content a renderer displays, not UI chrome a layout tree declares.
- **No reference system coverage** — roles appearing only in Mobbin or informal usage are deferred until a reference system adopts them.

### Role catalog — v0.2

| Role | Web | iOS | Android | Scope | AKA |
|---|---|---|---|---|---|
| alert | ✅ | ✅ | ✅ | Universal | warning, error-message, info-message |
| avatar | ✅ | ✅ | ✅ | Universal | profile-image, user-photo, profile-picture |
| badge | ✅ | ✅ | ✅ | Universal | counter-badge, notification-badge, pip |
| banner | ✅ | ✅ | ✅ | Universal | promo-banner, announcement-banner, info-banner |
| button | ✅ | ✅ | ✅ | Universal | primary-button, secondary-button, cta, action-button |
| card | ✅ | ✅ | ✅ | Universal | content-card, panel, tile |
| checkbox | ✅ | ✅ | ✅ | Universal | checklist-item, tick-box |
| color-picker | ✅ | ✅ | ✅ | Universal | color-selector, color-swatch |
| context-menu | ✅ | ✅ | ✅ | Universal | right-click-menu, overflow-menu, action-menu |
| date-picker | ✅ | ✅ | ✅ | Universal | calendar-picker, date-selector |
| dialog | ✅ | ✅ | ✅ | Universal | modal, alert-dialog, modal-dialog |
| divider | ✅ | ✅ | ✅ | Universal | separator, rule, horizontal-rule |
| dropdown-menu | ✅ | ✅ | ✅ | Universal | overflow-menu, action-menu, kebab-menu |
| empty-state | ✅ | ✅ | ✅ | Universal | zero-state, blank-state, no-results, no-data |
| hyperlink | ✅ | ✅ | ✅ | Universal | link, anchor, text-link |
| loading-indicator | ✅ | ✅ | ✅ | Universal | spinner, loader, activity-indicator |
| navigation-menu | ✅ | ✅ | ✅ | Universal | nav-menu, navigation-drawer, side-nav |
| popover | ✅ | ✅ | ✅ | Universal | popup, flyout, floating-panel |
| progress-indicator | ✅ | ✅ | ✅ | Universal | progress-bar, circular-progress, determinate-progress |
| radio-button | ✅ | ✅ | ✅ | Universal | radio, radio-option |
| search-bar | ✅ | ✅ | ✅ | Universal | search-field, search-input, search-box |
| segmented-control | ✅ | ✅ | ✅ | Universal | segmented-button-group, button-group |
| select | ✅ | ✅ | ✅ | Universal | dropdown, dropdown-select, picker |
| sidebar | ✅ | ✅ | ✅ | Universal | navigation-rail, side-navigation, left-nav |
| slider | ✅ | ✅ | ✅ | Universal | range-slider, scrubber, input-range |
| stepper | ✅ | ✅ | ✅ | Universal | quantity-stepper, number-stepper, increment-decrement |
| switch | ✅ | ✅ | ✅ | Universal | toggle, toggle-switch |
| tab-bar | ✅ | ✅ | ✅ | Universal | tabs, bottom-navigation, bottom-tab-bar |
| text-area | ✅ | ✅ | ✅ | Universal | multiline-input, multi-line-text-field |
| text-field | ✅ | ✅ | ✅ | Universal | input-field, text-input, form-field |
| time-picker | ✅ | ✅ | ✅ | Universal | time-selector, clock-picker |
| toolbar | ✅ | ✅ | ✅ | Universal | app-bar, command-bar, action-bar |
| top-navigation-bar | ✅ | ✅ | ✅ | Universal | nav-bar, app-bar, header, header-bar |
| full-screen-overlay | — | ✅ | ✅ | Mobile | immersive-modal, overlay, full-screen-modal |
| action-sheet | — | ✅ | — | iOS | bottom-sheet, action-menu |
| launch-screen | — | ✅ | — | iOS | splash-screen, loading-screen |
| item-indicator | ✅ | ✅ | ✅ | Universal | page-control, dot-indicator, step-indicator, carousel-indicator, slider-dots |
| floating-action-button | — | — | ✅ | Android | FAB, floating-button |
| breadcrumb | ✅ | — | ✅ | Web + Android | path-navigation, crumbs, page-path |
| carousel | ✅ | — | ✅ | Web + Android | media-carousel, slider-gallery, slideshow |
| chip | ✅ | — | ✅ | Web + Android | filter-chip, suggestion-chip, tag, label |
| drawer | ✅ | — | ✅ | Web + Android | side-panel, slide-panel, navigation-drawer |
| pagination | ✅ | — | ✅ | Web + Android | pager, page-navigator |
| skeleton | ✅ | — | ✅ | Web + Android | content-placeholder, loading-skeleton, ghost |
| toast | ✅ | — | ✅ | Web + Android | snackbar, notification-toast, flash-message |
| tooltip | ✅ | — | ✅ | Web + Android | hover-card, hint, info-tip |
| gallery | ✅ | ✅ | — | Web + iOS | media-grid, image-grid, photo-gallery |
| table | ✅ | ✅ | — | Web + iOS | data-table, data-grid |
| accordion | ✅ | — | — | Web | disclosure, collapsible, expandable |
| combobox | ✅ | — | — | Web | autocomplete, searchable-select, typeahead |
| command-palette | ✅ | — | — | Web | command-menu, quick-actions, spotlight |
| file-uploader | ✅ | — | — | Web | upload-zone, dropzone, file-input |
| tree | ✅ | — | — | Web | tree-view, hierarchy-view, folder-tree |

**Excluded:** `map`, `map-pin` — rendered geographic content, not UI structure.

**Deferred** (Mobbin only, no reference system coverage): `stacked-list`, `status-dot`, `table-of-contents`, `tile` — revisit when a reference system formally adopts them.

`core/roles/` is a new directory, established alongside this RFC, with its own README and the first batch of role files.

### Who writes `role=`

Two writers are in scope:

**1. The generator (AI author)**

An AI writing a `.gui` file from scratch knows what it is building. It should write `role=` on the root node of any recognized role it generates. This is the highest-confidence path: declared intent from the author.

**2. The optimizer (annotation pass)**

The optimizer may infer and write `role=` as a separate annotation pass, distinct from its structural cleanup pass. This pass is:

- **Deterministic** — role signatures in `core/roles/` are formal, matchable rules. Structural matching is pure rule evaluation: same input → same output. No AI, no LLM call, no heuristics. This is the same class of work as a linter.
- **Zero visual impact** — `role=` is metadata. Adding it does not change anything a renderer produces.
- **Opt-in** — the annotation pass runs separately from structural cleanup, flagged explicitly (`--annotate-roles`). A caller that wants clean structure without role annotation omits the flag.

The producing pipeline (extractor + optimizer) remains fully deterministic per P14 and RFC-0010.

### What gui-score does with it

The Conventional level of gui-score has two distinct tasks with respect to `role`:

**Task 1 — Validate declared roles**

When `role=` is present, gui-score checks structural plausibility: does the declared role's signature match the node's actual structure? If not, a validation audit fires.

```json
{
  "role": "nav-bar",
  "declared": true,
  "confidence": 1.0
}
```

```json
{
  "role": "nav-bar",
  "declared": true,
  "confidence": 0.31,
  "note": "declared as nav-bar but structure does not match signature — missing logo region, action region resembles a tab bar"
}
```

A declared role with low plausibility confidence is an audit finding (severity: `warn`), not a gate failure. The file is not lying in a way that breaks rendering; it is making a structural claim the scorer cannot verify.

**Task 2 — Infer undeclared roles**

When `role=` is absent on a node, gui-score runs structural signature matching from `core/roles/` against that node. This is deterministic rule evaluation — no AI, no LLM, no token cost. A nav-bar signature requires: a `<row>` at or near the top of the layout tree, containing a logo region (single `<img>` or `<text>`), a set of link-like nodes, and an action region. The node either matches or it doesn't.

```json
{
  "role": "nav-bar",
  "declared": false,
  "confidence": 0.94,
  "note": "structure matches nav-bar signature; consider adding role=\"nav-bar\""
}
```

When `role=` is declared, inference is skipped for that node — declared intent takes precedence. **Declared > inferred** in all cases.

### Conventional score computation

The Conventional score is computed from the combined results of both tasks:

- Each recognized role that is present (declared or inferred with confidence ≥ 0.7) contributes positively.
- Each role expected for the file's evident type (e.g. a mobile app without any `tab-bar` or `nav-bar`) and absent contributes a mild negative signal.
- Declared roles with low plausibility confidence (`< 0.5`) contribute a negative signal — the declaration is inconsistent with the structure.

## Reasoning

**Declaration is not inference — they are distinct.** Inference recovers what can be guessed from structure. Declaration records what the author knows. A breadcrumb trail and a nav-bar can have identical structural shapes; only the author can distinguish them. `role=` is that distinction.

**`role` is a noun — it fits the property grammar.** Every dotgui property is a noun: `fill`, `border`, `radius`, `gap`, `align`, `platform`, `source`. Properties name what a node has or is configured with. Candidate names `is` and `as` were considered and rejected — `is` is a verb, `as` is a preposition, and neither fits the grammar of the property rung (P11). `role` is the noun form of the same concept. This observation is now codified in P11 as a standing grammar rule.

**Analogous to `detached-from` and `source-node`.** Both attributes declare intent that inference could only approximate. `detached-from` records a component origin that a renderer could guess but might get wrong. `role=` records a role identity that a scorer can mostly infer but cannot be certain about. The format's established pattern for "author-intent that inference approximates" is an explicit attribute.

**Deterministic inference preserves RFC-0010.** The optimizer's annotation pass and gui-score's inference task are both pure rule evaluation over formal signatures. No AI in either path. No token cost. No variability between runs. RFC-0010's "no AI in the pipeline" boundary is the producing pipeline — the optimizer. An AI *generating* a `.gui` file directly is an AI consumer producing output, not an AI step inside the pipeline.

**OpenUI as anchor, behavior stripped.** OpenUI's component inventory is the closest thing to a universal, tool-neutral UI vocabulary. Taking the visual/structural anatomy only — and explicitly dropping all behavior, interaction, and accessibility — is consistent with P5. The format takes *what a nav-bar looks like*, not *what it does*.

**Downstream ARIA enabler, not an ARIA claim.** A code-generation skill that reads `.gui` and emits HTML can use `role="nav-bar"` to know which ARIA to emit (`role="navigation"`). That is the skill's job, not the format's. The format makes a structural claim; the skill makes the accessibility claim. This separation is correct and aligns with P5.

**Zero cost on the common case.** The attribute is absent on the vast majority of nodes. It appears only at role boundaries. A 400-node file might have three or four `role=` declarations. The common case is untouched (P9).

## Alternatives Considered

**`is="nav-bar"` / `as="nav-bar"`** — Both considered. Rejected because `is` is a verb and `as` is a preposition — neither fits the property grammar, which requires nouns (P11). This observation is codified in P11 as a standing rule: property names are nouns.

**A new tag per role (`<nav-bar>`, `<tab-bar>`)** — Rejected at the grammar gate. A new tag is the most expensive addition the format can make (P11, P12). Would also conflict with P13 (fewer primitives) and P8 (a `<nav-bar>` tag and a `<row role="nav-bar">` are two ways to express one thing). A property on the existing structural node is the correct rung.

**Using `name=` or component identity as the role signal** — Rejected. Component names (`<component name="NavBar">`) are file-local. `role=` values are cross-file canonical from `core/roles/`. A component named "NavBar" might not follow the canonical nav-bar structural signature; the attribute makes the claim explicit and checkable.

**`pattern="nav-bar"`** — The original attribute name in this RFC's first draft. Rejected. "Pattern" in design vocabulary refers to larger repeating solutions (progressive disclosure, infinite scroll) — not discrete UI roles. Misleading by P7 (names should match what designers already call this thing).

**AI-driven inference in the optimizer** — Rejected (P14, RFC-0010). Role inference must be deterministic. Formal signatures in `core/roles/` make this possible without an LLM call.

**Single combined confidence (declared + inferred, no distinction)** — Rejected. A declared role at confidence 1.0 is different from an inferred role at confidence 0.94 — the first is author intent, the second is a best guess. Collapsing them hides information a consumer needs and violates P15.

## Drawbacks

- `core/roles/` must be maintained. Adding a new recognized role is a deliberate act — a formal signature definition. The catalog is not automatically derived from real-world usage.
- A declared `role=` that doesn't match its signature is an audit finding, not a gate failure. A generator that emits wrong roles will produce noisy Conventional audits without breaking validation. This is intentional (P15 — the file is honest about what it claims; the scorer is honest about what it can verify).
- Role inference confidence thresholds require calibration against real `.gui` files. Initial thresholds are conservative and will be tuned as the corpus grows.
- `role` shares its name with ARIA's `role` attribute. The vocabularies are distinct and the contexts are different (static interchange format vs. HTML runtime), but authors familiar with ARIA should be aware the values do not correspond.

## Implementation Notes

**`core/roles/` directory:** Created alongside this RFC. Includes a `README.md` defining the signature format, the three-table qualification criteria, and the full role catalog above. Each role file defines: canonical name, platform scope (Web / iOS / Android coverage), structural signature (matchable rules, not prose), required context, AKA names from the Mobbin glossary, and disqualifying shapes.

**Generator:** AI authors writing `.gui` files should emit `role=` on the root node of any recognized role they generate. The canonical value is the kebab-case name from `core/roles/`. No other values are valid.

**Optimizer — annotation pass:** A new pass (`--annotate-roles`) that runs structural signature matching and writes `role=` on matched nodes that lack it. Runs after structural cleanup. Separate flag. Deterministic — same input → same output. Signature matching code is shared with gui-score.

**`gui-score` Conventional level:** Two-task architecture as specified above. Signature matching implementation is shared between the optimizer annotation pass and gui-score — one implementation, two callers. Role signatures from `core/roles/` are the authority for both.

**Validator (`validate.ts`):** Add `role` to the allowed property set on layout nodes. Validate that the value is a known name from `core/roles/` — unknown values are a validation error.

**RFC-0040 / QUALITY.md:** Update all references from "UI patterns" / "pattern catalog" to "UI roles" / "role catalog". The Conventional level audit shape gains a `declared` boolean field.

## Unresolved Questions

- **Confidence thresholds:** What confidence floor triggers a "structure matches signature" finding in gui-score? Initial proposal: 0.7 for a positive finding, 0.5 as the floor below which a declared role fires a mismatch audit. Needs calibration against real files.
- **Nested roles:** Can `role="card"` appear inside `role="card-grid"`? Intuitively yes — the card is a sub-role of the grid. Permitted but scoring interaction is unspecified. Deferred.
- **Role versioning:** What happens when a role's signature changes in `core/roles/`? Files with stale declarations are not automatically invalid. Does the validator warn? Deferred.
- **`core/roles/` process:** Should each new role require its own RFC, or is a PR against `core/roles/` with a formal review sufficient? The first batch is defined alongside this RFC; the process for additions after that is unspecified.
