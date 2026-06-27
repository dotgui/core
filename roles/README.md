# dotgui Role Catalog

The controlled vocabulary for the `role=` attribute. Each file in this folder defines one recognized UI role.

## Why this exists

A `role` makes a `.gui` file **self-describing**. It is the `<nav>`-vs-`<div>` distinction: tagging a `<row>` as `role="nav-bar"` does not change a single pixel — it tells any machine, AI, or tool reading the file *what the node is*, without guessing. That is good *practice*, not good *taste*. It does not make a design better-looking; it makes the file **portable and AI-ready** — something an agent can re-emit correctly into SwiftUI, HTML (with the right ARIA), another design tool, or a search index.

This catalog also backs the **Comprehensible** level of the quality score ([RFC-0040](../rfcs/0040-quality-scoring-model.md), [QUALITY.md](../spec/QUALITY.md)) — a measure of how AI-ready a file is *as semantics*. That level is computed **fully locally**: it reads the `role=` anchors the file declares (taken at face value), and each role documents its subtree as far as its **`reach`** allows (see below). Comprehensible is the fraction of nodes that fall within some role's reach — no AI, no network, no inference of untagged nodes.

**What `role` means:** *this node is a canonical instance of a recognized UI structure.*
**What `role` does not mean:** that using this structure is good design, or that a file lacking it is bad. An unconventional, convention-breaking design can be a perfectly good *file* — Comprehensible measures whether the file *labels* what it contains so an agent can translate it, never whether what it contains is fashionable. Judging design quality is not this catalog's job, and not the score's. (See [RFC-0041](../rfcs/0041-role-attribute.md) for the attribute; `role` is a structural classification, not an ARIA role or any runtime/accessibility claim.)

**To add a role** — create a new `.md` file using the template below, fill in the frontmatter, and add a row to the index table.

**To remove a role** — delete the file and remove its row from the index table. If the role was in a shipped version of the spec, note the removal in an RFC.

---

## Qualification

A role earns a file here by appearing in at least one of three platform reference systems:

| Platform | Reference |
|---|---|
| **Web** | [Component Gallery](https://component.gallery/) — covers Ant, Carbon, Fluent, GOV.UK, Primer, Spectrum, Material, and more |
| **iOS** | Apple Human Interface Guidelines |
| **Android** | Material Design Guidelines |

**Naming reference (not a qualification gate):** [Mobbin glossary](https://mobbin.com/glossary) — used for AKA names only.

Coverage sets scope:
- All three → **Universal**
- Two → **Cross-platform** (web+ios, web+android, mobile)
- One → **Platform-scoped** (web, ios, android)

Excluded regardless of coverage: rendered content with no UI structure role (`map`, `map-pin`).

Deferred (no reference system coverage yet): `stacked-list`, `status-dot`, `table-of-contents`, `tile`.

---

## Reach

Every role declares a **`reach`** — how far *down its own subtree* the role's meaning documents the content, used by the **Comprehensible** quality level ([RFC-0040](../rfcs/0040-quality-scoring-model.md)). It answers one question: *would you ever tag a separate component **inside** this one?*

| `reach` | meaning | when |
|---|---|---|
| `full` | the whole subtree is the role's own anatomy | self-contained widgets — nothing inside ever gets its own role (button, every input, every menu, controls, indicators) |
| `2` | a two-level internal grammar (group→item, row→cell), then content self-labels | structural hosts: table, tree, navigation-menu, carousel, gallery, sidebar |
| `1` | one chrome level, then the payload carries its own roles | host surfaces: card, dialog, drawer, accordion, toolbar, top-navigation-bar, … |

The scorer never *assumes* a reach — it reads this value from the catalog. A node counts as **documented** if it sits within its nearest roled ancestor's `reach`; Comprehensible is the documented-node ratio. See [RFC-0040](../rfcs/0040-quality-scoring-model.md) for the scoring.

---

## File template

```markdown
---
role: kebab-case-name
reach: full | 2 | 1          ← how deep this role documents its subtree (see Reach)
scope: universal | mobile | ios | android | web+android | web+ios | web
platforms: web, ios, android   ← list only the ones that apply
---

# Title Case Name

**AKA:** comma-separated alternative names

## Signature
The structural shape of this role in .gui markup — required nodes, optional nodes, their relationships.

## Context
Where in the layout tree this role typically appears.

## Disqualifying shapes
Shapes that look like this role but are not it.
```

---

## Index

| Role | Reach | Scope | Platforms | AKA |
|---|---|---|---|---|
| [accordion](accordion.md) | 1 | Web | web | disclosure, collapsible, expandable |
| [action-sheet](action-sheet.md) | full | iOS | ios | bottom-sheet, action-menu |
| [alert](alert.md) | full | Universal | web, ios, android | warning, error-message, info-message |
| [avatar](avatar.md) | full | Universal | web, ios, android | profile-image, user-photo, profile-picture |
| [badge](badge.md) | full | Universal | web, ios, android | counter-badge, notification-badge, pip |
| [banner](banner.md) | full | Universal | web, ios, android | promo-banner, announcement-banner, info-banner |
| [breadcrumb](breadcrumb.md) | full | Web + Android | web, android | path-navigation, crumbs, page-path |
| [button](button.md) | full | Universal | web, ios, android | primary-button, secondary-button, cta, action-button |
| [card](card.md) | 1 | Universal | web, ios, android | content-card, panel, tile |
| [carousel](carousel.md) | 2 | Web + Android | web, android | media-carousel, slider-gallery, slideshow |
| [checkbox](checkbox.md) | full | Universal | web, ios, android | checklist-item, tick-box |
| [chip](chip.md) | full | Web + Android | web, android | filter-chip, suggestion-chip, tag, label |
| [color-picker](color-picker.md) | full | Universal | web, ios, android | color-selector, color-swatch |
| [combobox](combobox.md) | full | Web | web | autocomplete, searchable-select, typeahead |
| [command-palette](command-palette.md) | 1 | Web | web | command-menu, quick-actions, spotlight |
| [context-menu](context-menu.md) | full | Universal | web, ios, android | right-click-menu, overflow-menu, action-menu |
| [date-picker](date-picker.md) | full | Universal | web, ios, android | calendar-picker, date-selector |
| [dialog](dialog.md) | 1 | Universal | web, ios, android | modal, alert-dialog, modal-dialog |
| [divider](divider.md) | full | Universal | web, ios, android | separator, rule, horizontal-rule |
| [drawer](drawer.md) | 1 | Web + Android | web, android | side-panel, slide-panel, navigation-drawer |
| [dropdown-menu](dropdown-menu.md) | full | Universal | web, ios, android | overflow-menu, action-menu, kebab-menu |
| [empty-state](empty-state.md) | 1 | Universal | web, ios, android | zero-state, blank-state, no-results, no-data |
| [file-uploader](file-uploader.md) | full | Web | web | upload-zone, dropzone, file-input |
| [floating-action-button](floating-action-button.md) | full | Android | android | FAB, floating-button |
| [full-screen-overlay](full-screen-overlay.md) | 1 | Mobile | ios, android | immersive-modal, overlay, full-screen-modal |
| [gallery](gallery.md) | 2 | Web + iOS | web, ios | media-grid, image-grid, photo-gallery |
| [hyperlink](hyperlink.md) | full | Universal | web, ios, android | link, anchor, text-link |
| [item-indicator](item-indicator.md) | full | Universal | web, ios, android | page-control, dot-indicator, step-indicator, carousel-indicator, slider-dots |
| [launch-screen](launch-screen.md) | full | iOS | ios | splash-screen, loading-screen |
| [loading-indicator](loading-indicator.md) | full | Universal | web, ios, android | spinner, loader, activity-indicator |
| [navigation-menu](navigation-menu.md) | 2 | Universal | web, ios, android | nav-menu, navigation-drawer, side-nav |
| [pagination](pagination.md) | full | Web + Android | web, android | pager, page-navigator |
| [popover](popover.md) | full | Universal | web, ios, android | popup, flyout, floating-panel |
| [progress-indicator](progress-indicator.md) | full | Universal | web, ios, android | progress-bar, circular-progress, determinate-progress |
| [radio-button](radio-button.md) | full | Universal | web, ios, android | radio, radio-option |
| [search-bar](search-bar.md) | full | Universal | web, ios, android | search-field, search-input, search-box |
| [segmented-control](segmented-control.md) | full | Universal | web, ios, android | segmented-button-group, button-group |
| [select](select.md) | full | Universal | web, ios, android | dropdown, dropdown-select, picker |
| [sidebar](sidebar.md) | 2 | Universal | web, ios, android | navigation-rail, side-navigation, left-nav |
| [skeleton](skeleton.md) | full | Web + Android | web, android | content-placeholder, loading-skeleton, ghost |
| [slider](slider.md) | full | Universal | web, ios, android | range-slider, scrubber, input-range |
| [stepper](stepper.md) | full | Universal | web, ios, android | quantity-stepper, number-stepper, increment-decrement |
| [switch](switch.md) | full | Universal | web, ios, android | toggle, toggle-switch |
| [tab-bar](tab-bar.md) | full | Universal | web, ios, android | tabs, bottom-navigation, bottom-tab-bar |
| [table](table.md) | 2 | Web + iOS | web, ios | data-table, data-grid |
| [text-area](text-area.md) | full | Universal | web, ios, android | multiline-input, multi-line-text-field |
| [text-field](text-field.md) | full | Universal | web, ios, android | input-field, text-input, form-field |
| [time-picker](time-picker.md) | full | Universal | web, ios, android | time-selector, clock-picker |
| [toast](toast.md) | full | Web + Android | web, android | snackbar, notification-toast, flash-message |
| [toolbar](toolbar.md) | 1 | Universal | web, ios, android | app-bar, command-bar, action-bar |
| [tooltip](tooltip.md) | full | Web + Android | web, android | hover-card, hint, info-tip |
| [top-navigation-bar](top-navigation-bar.md) | 1 | Universal | web, ios, android | nav-bar, app-bar, header, header-bar |
| [tree](tree.md) | 2 | Web | web | tree-view, hierarchy-view, folder-tree |
