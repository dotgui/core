---
rfc: 0041
title: role attribute — UI role vocabulary
status: Accepted
introduced-in: 0.2
date: 2026-06-12
updated: 2026-07-27
---

# `role` Attribute — UI Role Vocabulary

## Context

The CCAC quality model (RFC-0040) defines a **Comprehensible** level that measures how **AI-ready** a `.gui` file is *as semantics* — how much of its meaning an agent can translate into code because the recognized UI structures (navigation bars, tab bars, cards, dialogs) are **labeled** with a canonical role rather than left as anonymous boxes. The level reads the **declared** `role=` values at face value and scores by **reach-coverage** — each role documents its subtree as far as its `reach` allows, and the score is the fraction of nodes so documented (a fully local, deterministic, zero-AI computation; no remote corpus, no inference of untagged nodes, no confidence). This RFC defines the catalog, the `role=` attribute, and the per-role `reach` it is keyed on.

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
- **`reach`** — `full` / `2` / `1`: how far down its own subtree the role documents content, consumed by the Comprehensible quality level (RFC-0040). `full` = self-contained widget (whole subtree is its anatomy); `2` = two-level grammar (group→item, row→cell); `1` = host surface (one chrome level, payload self-labels)
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

The **Comprehensible** level of gui-score reads **only declared roles**, at **face value**. It does not infer roles for untagged nodes, it emits no confidence scores, and it does not check whether a declared role "really looks like" its kind — that resemblance judgement is the soft pattern-matching that wants a model and would break the zero-AI guarantee (RFC-0040). Like SEO trusting a `<nav>`, if the author wrote `role="tab-bar"`, the file *says* tab-bar and that is what is counted.

**Inventory declared roles**

Walk the tree; every node with a `role=` is one semantic anchor, reported as a plain fact:

```json
{ "role": "tab-bar", "path": "gui > col[0] > row[3]" }
```

No `severity`, no `why`, no autofix — a declared role is not a finding, it just is. (The one hard check is **catalog membership**: an unknown `role=` value is a *gate* error in `validate.ts`, so it never reaches scoring — the score only ever sees valid role names.)

**No inference, no shape audit.** When `role=` is absent, the score leaves the node alone. Suggesting a role for untagged structure — and any resemblance checking — is an *authoring* concern, handled by the optimizer's opt-in `--annotate-roles` pass below, never by the score.

### Comprehensible score computation

**Reach-coverage** — the fraction of content nodes a declared role documents, bounded by each role's `reach`:

- **A node is documented** if it has a role, or sits within the `reach` of some roled ancestor-or-self. `reach: full` covers the whole subtree; `2` and `1` cover that many levels down.
- **Score = documented ÷ content nodes**, where content nodes are every node except the root canvas wrapper (scaffolding).
- **No roles → 0.** A file with no anchors is honestly low on AI-readiness. A plain node lowers the score not because we decided it *should* be tagged, but because it factually sits beyond any role's reach.

This is coverage made honest: `reach` gives it a real denominator (no guessing which nodes should be tagged) and closes the lazy-root-tag exploit (a `card` reaches one level, not the whole screen). No confidence, no inference, no resemblance check.

## Reasoning

**Declaration is not inference — they are distinct.** Inference recovers what can be guessed from structure. Declaration records what the author knows. A breadcrumb trail and a nav-bar can have identical structural shapes; only the author can distinguish them. `role=` is that distinction.

**`role` is a noun — it fits the property grammar.** Every dotgui property is a noun: `fill`, `border`, `radius`, `gap`, `align`, `platform`, `source`. Properties name what a node has or is configured with. Candidate names `is` and `as` were considered and rejected — `is` is a verb, `as` is a preposition, and neither fits the grammar of the property rung (P11). `role` is the noun form of the same concept. This observation is now codified in P11 as a standing grammar rule.

**Analogous to `detached-from` and `source-node`.** Both attributes declare intent that inference could only approximate. `detached-from` records a component origin that a renderer could guess but might get wrong. `role=` records a role identity that a scorer can mostly infer but cannot be certain about. The format's established pattern for "author-intent that inference approximates" is an explicit attribute.

**Inference lives in the optimizer, not the score.** Suggesting a role for an untagged node is structural matching that produces a *resemblance* — a confidence, not a fact. That belongs to the optimizer's opt-in `--annotate-roles` pass (a creation-time helper), where it is still deterministic rule evaluation over formal signatures — no AI, no token cost, no variability — and where a wrong guess is a discardable suggestion, not a grade. The gui-score Comprehensible level does **not** infer; it reads declared roles at face value and counts them. Keeping fuzzy matching out of the score is what lets the score stay zero-AI (RFC-0040). RFC-0010's "no AI in the pipeline" boundary is the producing pipeline — the optimizer remains rule-based; an AI *generating* a `.gui` file directly is an AI consumer, not a pipeline step.

**OpenUI as anchor, behavior stripped.** OpenUI's component inventory is the closest thing to a universal, tool-neutral UI vocabulary. Taking the visual/structural anatomy only — and explicitly dropping all behavior, interaction, and accessibility — is consistent with P5. The format takes *what a nav-bar looks like*, not *what it does*.

**Downstream ARIA enabler, not an ARIA claim.** A code-generation skill that reads `.gui` and emits HTML can use `role="nav-bar"` to know which ARIA to emit (`role="navigation"`). That is the skill's job, not the format's. The format makes a structural claim; the skill makes the accessibility claim. This separation is correct and aligns with P5.

**Zero cost on the common case.** The attribute is absent on the vast majority of nodes. It appears only at role boundaries. A 400-node file might have three or four `role=` declarations. The common case is untouched (P9).

## Alternatives Considered

**`is="nav-bar"` / `as="nav-bar"`** — Both considered. Rejected because `is` is a verb and `as` is a preposition — neither fits the property grammar, which requires nouns (P11). This observation is codified in P11 as a standing rule: property names are nouns.

**A new tag per role (`<nav-bar>`, `<tab-bar>`)** — Rejected at the grammar gate. A new tag is the most expensive addition the format can make (P11, P12). Would also conflict with P13 (fewer primitives) and P8 (a `<nav-bar>` tag and a `<row role="nav-bar">` are two ways to express one thing). A property on the existing structural node is the correct rung.

**Using `name=` or component identity as the role signal** — Rejected. Component names (`<component name="NavBar">`) are file-local. `role=` values are cross-file canonical from `core/roles/`. A component named "NavBar" might not follow the canonical nav-bar structural signature; the attribute makes the claim explicit and checkable.

**`pattern="nav-bar"`** — The original attribute name in this RFC's first draft. Rejected. "Pattern" in design vocabulary refers to larger repeating solutions (progressive disclosure, infinite scroll) — not discrete UI roles. Misleading by P7 (names should match what designers already call this thing).

**AI-driven inference in the optimizer** — Rejected (P14, RFC-0010). Role inference must be deterministic. Formal signatures in `core/roles/` make this possible without an LLM call.

**Inferring undeclared roles inside gui-score** — Rejected (and revised out, 2026-06-17). The first draft had gui-score run signature matching on untagged nodes and emit "resembles a tab bar, 0.61 confidence." A confidence float is judgment by resemblance — soft matching that wants a model — which breaks the zero-AI guarantee of the score (RFC-0040). The score now reads declared roles at face value and scores by reach-coverage. Resemblance-based suggestion survives solely in the optimizer's opt-in `--annotate-roles` authoring pass, never in the score.

**Plausibility-checking declared roles in the score** — Rejected. An intermediate draft had the score fire a `warn` when a declared `role="tab-bar"` tripped a hard disqualifying-shape rule. Dropped on the SEO logic: SEO does not verify a `<nav>` "looks navigational" — the tag is taken at face value. Checking a declared role's shape is inference in a binary costume and reintroduces the resemblance judgement the score excludes. The score inventories declared roles; it does not audit their shape. (Shape correctness is the author's / annotation pass's concern.)

## Drawbacks

- `core/roles/` must be maintained. Adding a new recognized role is a deliberate act — a formal signature definition. The catalog is not automatically derived from real-world usage.
- The score takes declared roles at **face value** — it does not verify a `role="tab-bar"` actually looks like one. A generator that emits a wrong role inflates Comprehensible without penalty (the score counts it as an anchor). This is the deliberate trade for staying inference-free (the SEO `<nav>` logic). Role *correctness* is the author's and the `--annotate-roles` pass's concern, not the score's.
- The optimizer's `--annotate-roles` suggestion pass uses confidence thresholds that require calibration against real `.gui` files. These live entirely in the authoring helper — the score never sees a confidence — so a miscalibration produces a noisy *suggestion*, never a wrong *grade*.
- `role` shares its name with ARIA's `role` attribute. The vocabularies are distinct and the contexts are different (static interchange format vs. HTML runtime), but authors familiar with ARIA should be aware the values do not correspond.

## Implementation Notes

**`core/roles/` directory:** Created alongside this RFC. Includes a `README.md` defining the signature format, the three-table qualification criteria, the `reach` vocabulary, and the full role catalog above. Each role file defines: canonical name, `reach` (`full`/`2`/`1`), platform scope (Web / iOS / Android coverage), structural signature (matchable rules, not prose), required context, AKA names from the Mobbin glossary, and disqualifying shapes.

**Generator:** AI authors writing `.gui` files should emit `role=` on the root node of any recognized role they generate. The canonical value is the kebab-case name from `core/roles/`. No other values are valid.

**Optimizer — annotation pass:** A new pass (`--annotate-roles`) that runs structural signature matching and writes `role=` on matched nodes that lack it. Runs after structural cleanup. Separate flag. Deterministic — same input → same output. This is the *only* home for resemblance-based signature matching.

**`gui-score` Comprehensible level:** Reads declared roles only — a `{ role, path }` inventory scored by **reach-coverage** (documented ÷ content nodes, where each role documents its subtree as far as its `reach`). No signature inference, no shape check, no confidence. It shares the `core/roles/` *catalog* with the optimizer annotation pass (role names and their `reach`), but not a matcher: the annotation pass *suggests* roles by resemblance, the score reads declared ones at face value.

**Validator (`validate.ts`):** Add `role` to the allowed property set on layout nodes. Validate that the value is a known name from `core/roles/` — unknown values are a validation error.

**RFC-0040 / QUALITY.md:** The fourth quality level is **Comprehensible** (renamed from Conventional). Its audit shape is `{ role, path }` — a plain inventory fact — and its score is the reach-coverage above.

## Unresolved Questions

- **Annotation thresholds:** What confidence floor triggers a "structure matches signature" *suggestion* in the optimizer's `--annotate-roles` pass? Initial proposal: 0.7. This is an authoring-helper threshold only — gui-score reads declared roles and emits no confidence, so the floor never affects a score.
- **Per-role `reach` calibration:** values are assigned by role kind (`full` / `2` / `1`). A few are judgment calls (card `1` vs `0`; popover `full` vs `1`; toolbar / top-navigation-bar `1` vs `2`). The mechanism is settled (reach is a role-file field the scorer reads); the values want tuning against real annotated files (tracked in RFC-0040).
- **Nested roles:** Can `role="card"` appear inside `role="card-grid"`? Intuitively yes — the card is a sub-role of the grid. Permitted but scoring interaction is unspecified. Deferred.
- **Role versioning:** What happens when a role's signature changes in `core/roles/`? Files with stale declarations are not automatically invalid. Does the validator warn? Deferred.
- **`core/roles/` process:** Should each new role require its own RFC, or is a PR against `core/roles/` with a formal review sufficient? The first batch is defined alongside this RFC; the process for additions after that is unspecified.
