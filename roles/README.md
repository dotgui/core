# dotgui Role Catalog

The controlled vocabulary for the `role=` attribute. Each file in this folder defines one recognized UI role.

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

## File template

```markdown
---
role: kebab-case-name
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

| Role | Scope | Platforms | AKA |
|---|---|---|---|
| [accordion](accordion.md) | Web | web | disclosure, collapsible, expandable |
| [action-sheet](action-sheet.md) | iOS | ios | bottom-sheet, action-menu |
| [alert](alert.md) | Universal | web, ios, android | warning, error-message, info-message |
| [avatar](avatar.md) | Universal | web, ios, android | profile-image, user-photo, profile-picture |
| [badge](badge.md) | Universal | web, ios, android | counter-badge, notification-badge, pip |
| [banner](banner.md) | Universal | web, ios, android | promo-banner, announcement-banner, info-banner |
| [breadcrumb](breadcrumb.md) | Web + Android | web, android | path-navigation, crumbs, page-path |
| [button](button.md) | Universal | web, ios, android | primary-button, secondary-button, cta, action-button |
| [card](card.md) | Universal | web, ios, android | content-card, panel, tile |
| [carousel](carousel.md) | Web + Android | web, android | media-carousel, slider-gallery, slideshow |
| [checkbox](checkbox.md) | Universal | web, ios, android | checklist-item, tick-box |
| [chip](chip.md) | Web + Android | web, android | filter-chip, suggestion-chip, tag, label |
| [color-picker](color-picker.md) | Universal | web, ios, android | color-selector, color-swatch |
| [combobox](combobox.md) | Web | web | autocomplete, searchable-select, typeahead |
| [command-palette](command-palette.md) | Web | web | command-menu, quick-actions, spotlight |
| [context-menu](context-menu.md) | Universal | web, ios, android | right-click-menu, overflow-menu, action-menu |
| [date-picker](date-picker.md) | Universal | web, ios, android | calendar-picker, date-selector |
| [dialog](dialog.md) | Universal | web, ios, android | modal, alert-dialog, modal-dialog |
| [divider](divider.md) | Universal | web, ios, android | separator, rule, horizontal-rule |
| [drawer](drawer.md) | Web + Android | web, android | side-panel, slide-panel, navigation-drawer |
| [dropdown-menu](dropdown-menu.md) | Universal | web, ios, android | overflow-menu, action-menu, kebab-menu |
| [empty-state](empty-state.md) | Universal | web, ios, android | zero-state, blank-state, no-results, no-data |
| [file-uploader](file-uploader.md) | Web | web | upload-zone, dropzone, file-input |
| [floating-action-button](floating-action-button.md) | Android | android | FAB, floating-button |
| [full-screen-overlay](full-screen-overlay.md) | Mobile | ios, android | immersive-modal, overlay, full-screen-modal |
| [gallery](gallery.md) | Web + iOS | web, ios | media-grid, image-grid, photo-gallery |
| [hyperlink](hyperlink.md) | Universal | web, ios, android | link, anchor, text-link |
| [item-indicator](item-indicator.md) | Universal | web, ios, android | page-control, dot-indicator, step-indicator, carousel-indicator, slider-dots |
| [launch-screen](launch-screen.md) | iOS | ios | splash-screen, loading-screen |
| [loading-indicator](loading-indicator.md) | Universal | web, ios, android | spinner, loader, activity-indicator |
| [navigation-menu](navigation-menu.md) | Universal | web, ios, android | nav-menu, navigation-drawer, side-nav |
| [pagination](pagination.md) | Web + Android | web, android | pager, page-navigator |
| [popover](popover.md) | Universal | web, ios, android | popup, flyout, floating-panel |
| [progress-indicator](progress-indicator.md) | Universal | web, ios, android | progress-bar, circular-progress, determinate-progress |
| [radio-button](radio-button.md) | Universal | web, ios, android | radio, radio-option |
| [search-bar](search-bar.md) | Universal | web, ios, android | search-field, search-input, search-box |
| [segmented-control](segmented-control.md) | Universal | web, ios, android | segmented-button-group, button-group |
| [select](select.md) | Universal | web, ios, android | dropdown, dropdown-select, picker |
| [sidebar](sidebar.md) | Universal | web, ios, android | navigation-rail, side-navigation, left-nav |
| [skeleton](skeleton.md) | Web + Android | web, android | content-placeholder, loading-skeleton, ghost |
| [slider](slider.md) | Universal | web, ios, android | range-slider, scrubber, input-range |
| [stepper](stepper.md) | Universal | web, ios, android | quantity-stepper, number-stepper, increment-decrement |
| [switch](switch.md) | Universal | web, ios, android | toggle, toggle-switch |
| [tab-bar](tab-bar.md) | Universal | web, ios, android | tabs, bottom-navigation, bottom-tab-bar |
| [table](table.md) | Web + iOS | web, ios | data-table, data-grid |
| [text-area](text-area.md) | Universal | web, ios, android | multiline-input, multi-line-text-field |
| [text-field](text-field.md) | Universal | web, ios, android | input-field, text-input, form-field |
| [time-picker](time-picker.md) | Universal | web, ios, android | time-selector, clock-picker |
| [toast](toast.md) | Web + Android | web, android | snackbar, notification-toast, flash-message |
| [toolbar](toolbar.md) | Universal | web, ios, android | app-bar, command-bar, action-bar |
| [tooltip](tooltip.md) | Web + Android | web, android | hover-card, hint, info-tip |
| [top-navigation-bar](top-navigation-bar.md) | Universal | web, ios, android | nav-bar, app-bar, header, header-bar |
| [tree](tree.md) | Web | web | tree-view, hierarchy-view, folder-tree |
