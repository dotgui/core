---
rfc: 0055
title: The library directory — one library, split across files
status: Accepted
targets: 0.4.2
date: 2026-10-29
updated: 2026-10-29
depends-on: 0042, 0054
amends: 0042
---

# The Library Directory — One Library, Split Across Files

## Context

### What RFC-0042 settled

[RFC-0042](0042-multi-document-packages.md) gave a package one shared library: `library.guix`, whose library part — everything above its layout root — every document in the package resolves against. Resolution is implicit, closed inside the package, and strict: redeclaring a library name is an error, never an override. That rule is what makes `flatten` a plain concatenation.

It also refused, as a non-goal, any **page or folder hierarchy**: "The package is flat. `assets/` is the only directory."

### What happens once the library is a design system

`library.guix` was sized for a deck or a flow — a palette, a few text styles, a header. The experiments in RFC-0042 measured libraries of 2–5 KB. A design system is a different object. Tokens with modes, a type scale, and forty component sets with variants is one file of several hundred kilobytes, and it has three problems that a twelve-slide deck never had:

- **No unit smaller than the whole library.** An agent asked to change the button, or to plan a screen against the catalog, must read every component to reach one. This is the same argument RFC-0042 made against one-document-many-frames, one level down.
- **Every change touches the same file.** Two designers editing two components conflict in one file. Every diff, review and history entry is on `library.guix`, never on the component that changed.
- **Its structure is hidden.** Designers and codebases already organise a system as tokens, styles, and one component per unit (`Button/`, `Input/`). A single file flattens that into one list.

So people split it, and today they can only split it wrongly: separate `.gui` packages (which RFC-0042 forbids from referencing each other), or `.guix` files at the package root (which become *documents*, whose declarations are local and shared with nothing).

### What this RFC is not proposing

Not namespaces, not imports, not a second library, not links between files, and not a hierarchy for documents. Linking to a library outside the package is [RFC-0056](0056-linked-libraries.md). This RFC only lets the one library the package already has be stored as several files.

## Decision

**A package's library may be a single file, `library.guix`, or a directory, `library/`. Every `.guix` under `library/` contributes its library part to the one package library. Nothing else changes.**

### The shape

```
acme-ds.gui
├── style-guide.guix              ← a document, as before
├── library/
│   ├── tokens.guix
│   ├── styles.guix
│   └── components/
│       ├── button.guix
│       ├── input.guix
│       └── icon-arrow.guix
├── preview.webp
└── assets/
    └── arrow.svg
```

It holds identically for a ZIP package and for a folder-form package ([RFC-0054](0054-folder-form-packages.md)).

### The rules

1. **`library/` is reserved.** Every `.guix` file under it, at any depth, is a **library file**. A library file is never a document and never appears in the package's document list. Anything else under `library/` — a `README.md`, an image, a dotfile — is not part of the package: it is ignored and reported, as [RFC-0054](0054-folder-form-packages.md) treats any entry outside the package.
2. **One library, two storage forms.** A package has zero or one library. It is stored as `library.guix` *or* as `library/` — **never both**. A package carrying both is an error ([P15](../PRINCIPLES.md)): there is no rule for which wins, and inventing one would be a cascade. **A library is its files:** a `library/` with no `.guix` in it is no library, because a ZIP cannot hold an empty directory and the two forms must convert without loss.
3. **The library part is the union.** The package library is the library part of every library file, taken together. Each file follows RFC-0042's positional rule unchanged: what is above its layout root is shared; its layout root, if any, is local to that file.
4. **No order, no merge.** Declaring the same name in two library files is an error naming both files (`token '$primary' is declared by library/tokens.guix and library/brand.guix`). Names are tokens, styles, fonts, components — and mode axes: two files declaring `<mode name="theme">` collide like any other pair. Because a collision can never be resolved, the order files are read in can never matter — the union is the same in any order ([P14](../PRINCIPLES.md)).
5. **Library files reference each other freely.** `button.guix` may use `$primary` from `tokens.guix` and `comp-icon-arrow` from `icon-arrow.guix` without declaring them. Within the library there is one scope, exactly as there is within one `library.guix`.
6. **Subfolders are organisation only.** `components/button.guix` and `button.guix` mean the same thing. A path is not a namespace, carries no meaning, and never appears in a reference. `comp-button` is `comp-button`, wherever it is stored.
7. **Assets resolve against the package.** `src="assets/arrow.svg"` in `library/components/icon-arrow.guix` means the package's `assets/arrow.svg` — never a path relative to the file. `assets/` stays at the package root and is not repeated inside `library/`.
8. **Each library file is its own envelope.** It has its own `<gui>` root, declares its own `version`, and — under [RFC-0046](0046-identity-and-source-ids.md) — its own `source`, against which its `source-id`s are read.
9. **Every file in a package with `library/` declares `0.4.2` or higher**, documents and library files alike, for the reason RFC-0042 gives for 0.3: the version is a contract over structure, and a file sitting in a package structured this way cannot honestly claim less.

**Recommended layout** — a convention, never a rule, since rule 6 means nothing can depend on it: `library/tokens.guix`, `library/styles.guix`, and one `library/components/<name>.guix` per component or component set.

### Each library file documents itself

RFC-0042's best side effect carries over unchanged and gets better. `library.guix` may carry a layout root nobody else sees, which makes it the package's style guide. A library file may do the same, which makes **each component its own spec page**:

```xml
<!-- library/components/button.guix -->
<gui version="0.4.2" name="Button">
  <components>
    <component-set name="Button" id="compset-button">
      <variant id="comp-button-primary" style="primary">
        <props><prop name="label" type="string" target="label" /></props>
        <row gap="8" p="12 24" fill="$primary" radius="$radius-md">
          <text id="label" value="Button" text-style="Label" fill="#fff" />
          <instance component="comp-icon-arrow" />
        </row>
      </variant>
    </component-set>
  </components>

  <!-- screen part: local to this file, the button's spec page -->
  <row gap="16" p="32">
    <instance component="comp-button-primary" />
  </row>
</gui>
```

A consumer may render a library file's own page, addressed by its path (`library/components/button.guix`), as it already may render `library.guix`'s. It is still not a document.

### Converting between the two forms is mechanical

Splitting `library.guix` into `library/` moves declaration blocks into files. Joining `library/` into `library.guix` concatenates their library parts. Both directions are lossless for the same reason `flatten` is (RFC-0042): a collision is an error, so there is never anything to merge. The only thing joining cannot keep is more than one local page; a tool joining files with pages must drop all but one and say so ([P15](../PRINCIPLES.md)).

`flatten(pkg, name)` is unchanged in meaning: it inlines the package library into one document, from whichever form the library is stored in.

### Amendment to RFC-0042

RFC-0042's non-goal **"No page or folder hierarchy. The package is flat. `assets/` is the only directory."** becomes:

> **No page or folder hierarchy for documents.** Documents sit at the package root and nowhere else. `assets/` and `library/` are the only directories, and neither holds documents.

Every other RFC-0042 non-goal stands as written. In particular this RFC adds no second library — the one library is stored in more files — and no external references.

## Reasoning

### It is the RFC-0042 argument, one level down

RFC-0042 was decided on granularity, not size: named documents make partial reads, scoped failures, local diffs and separate review possible, and a single file makes none of them possible however well it is authored. That argument was made about screens. A design-system library has the same shape — many independent units, read and changed one at a time — and the same answer. Reading the button without reading forty other components is the same win as reading one slide without reading twelve.

### It adds no semantics

The resolution rule does not change. Shared means "above the layout root"; resolution is implicit; collisions are errors. Rule 3 only widens *where* library parts are collected from. A renderer that already merges `library.guix` into each document merges a list of library parts instead of one — the same operation, over a list.

### The hearing

**Where it sits in the grammar (P11).** Nowhere in the markup grammar: no tag, no property, no value form. Like RFC-0042 it is container structure — a reserved path in the package. That is the cheapest place a change can live, which is why the hearing turns on P12 rather than P11.

**Precedent.** RFC-0042 pre-rejected a folder hierarchy and a `documents/` subdirectory. Both rejections were about *documents*: a path segment on every address, and a hierarchy where screens need none. Neither applies here — library files have no address a consumer fetches by, and the directory is opt-in for the case that needs it. This RFC narrows that non-goal; it does not reverse its reason.

| Principle | | |
|---|---|---|
| P1 interchange | pass | Mirrors how design systems are organised in tools and codebases; splits and joins are lossless both ways. |
| P2 platform-agnostic | neutral | Container structure; no platform concept. |
| P3 visual, not a save file | pass | Every file holds declarations that render; no editor state. |
| P4 meaning | pass | A file per component is meaningful structure. Paths themselves carry no meaning (rule 6), so nothing implies a semantics it lacks. |
| P5 not React / HTML / Figma | pass | No behaviour, no document semantics, no authoring state. Not Figma's library-linking model: nothing crosses the package. |
| P6 intent vs computation | pass | Collecting the union is the reader's work; the author states only where declarations live. |
| P7 readable, token-efficient | pass | The point of the RFC: an agent reads `button.guix`, not the whole system. |
| P8 one vocabulary | pass | Each file is an ordinary `.guix`. No new vocabulary. |
| P9 common case compact | pass | A small library stays one `library.guix`. The directory is only for scale. |
| P10 conventions | pass | Reserved name, no manifest, no declaration of which files are library files. |
| P11 grammar | neutral | Not in the markup grammar; see above. |
| **P12 one obvious way** | **pass, with a cost** | Two storage forms for one library. Justified below; also listed under *Drawbacks*. |
| P13 fewer primitives | pass | No new primitive. |
| P14 deterministic | pass | Order-independent by construction (rule 4). |
| P15 honest semantics | pass | Both forms present, a cross-file collision, an unresolved name: each fails loudly, naming files. |

**On P12.** `library.guix` and `library/` are two ways to store one thing, and P12 fails anything that forks the canonical path. The mitigation is the same one RFC-0042 relied on for "N packages or one package with N documents": **every declaration still has exactly one representation**. The fork is in storage, not in the language — a button is written the same way in either form, resolves the same way, and flattens to the same bytes. Rule 2 keeps it from becoming two blessed places at once, and the conversion is mechanical in both directions. The alternatives that remove the fork each cost more (*Alternatives Considered*).

No principle fails, and none is amended.

## Alternatives Considered

**Only `library/`; retire `library.guix`.** One storage form, which satisfies P12 completely, and pre-1.0 the break is allowed. Rejected because it taxes the common case to serve the large one ([P9](../PRINCIPLES.md)): a four-screen flow with a 2 KB library would need a directory and a file inside it to say what one file says now. Recorded as the fallback if the two-form cost proves real.

**Both allowed together, unioned.** Strictly more permissive: `library.guix` plus `library/**`, all contributing. Rejected because it makes "where is the library?" a two-part answer in every package that uses it, and invites the half-migrated package where a token lives in one and its sibling in the other. Rule 2 can be relaxed to this later without breaking any file; the reverse is not true.

**Library parts collected from every document.** No reserved directory: every `.guix` at the root shares what it declares. Rejected — it reverses RFC-0042's rule that a document's declarations are local, which is what lets a screen add a name without touching anything else.

**Namespaces from paths** (`components/button` → `<instance component="components/button/primary">`). Rejected. It would make a file move a breaking change to every reference, add a second naming system beside ids, and create overrides by another name — two `primary` tokens in two folders. Rule 6 keeps paths meaningless so moving a file is free.

**Separate packages per part, composed by reference.** This is linking, and it is a different problem with different costs. Taken up by [RFC-0056](0056-linked-libraries.md) for libraries from *outside* the package; within one package, files are the cheaper answer.

**A manifest listing the library files.** Rejected for the reason RFC-0042 rejected one: a second source of truth that can drift from the files it describes. The directory listing is the manifest.

### What partial reads save — measured

The 45 shadcn component packages in the workspace were combined into one design-system library, then split one component per file. Tokens counted with `cl100k`, a proxy for the model's own tokenizer:

| Task | `library.guix` | `library/` | Share |
|---|---|---|---|
| Edit one component (Button) | 12,047 | 542 | **4.5%** |
| Plan a settings screen: the file list plus six components | 12,047 | 2,047 | **17%** |
| Read the whole library | 12,047 | 13,073 | +8.5%, each file's own `<gui>` envelope |

The library is small — 37 KB, one component set per file — so the shares are the least the split saves; a design system of several hundred kilobytes saves more. No component id collided across the 45 files.

## Drawbacks

- **Two storage forms for one library.** The P12 cost, mitigated rather than eliminated (*Reasoning*). Tools must read both and should write one consistently.
- **A cross-file collision is an error far from the edit.** Adding `$primary` to `brand.guix` fails because `tokens.guix` has it. The error names both files, but the author has to know the library is one scope.
- **Paths look meaningful and aren't.** Someone will expect `components/` to be a namespace. Rule 6 is the answer, and it has to be taught.
- **More files to validate.** A validator checks the union for collisions and resolves every library file against it, not one file. Linear in total size, but a new code path in both implementations.

## Implementation Notes

- **Kit:** the package model keeps library files by path (`libraryFiles`) beside the single `library`. `fromEntries` reads `library/**/*.guix` as library files and ignores everything else under `library/`; both forms present is a `PackageEntryError`. The union is built by inlining each file's library part, so `flatten` and `validateDocument` work as before. `validateDocument` names cross-file collisions (`LIBRARY_COLLISION`, mode axes included), enforces 0.4.2 (`VERSION_BELOW_LIBRARY_DIRECTORY`), and validates a library file, by its path, against the union of the others.
- **Native renderer:** the package keeps library files beside `library.guix`, refuses both together, and parses the union, naming both files in a collision.
- **Spec:** `spec/DOTGUI.md` describes the directory form and the recommended layout.

## Test Cases

- A package with `library/tokens.guix` and `library/components/button.guix` renders a document using `$primary` and `comp-button`, exactly as the same declarations in one `library.guix`.
- `library.guix` beside `library/x.guix` is refused; an empty `library/` beside `library.guix` is not a library and is fine.
- `$primary` in two library files, or `<mode name="theme">` in two, is an error naming both.
- `library/README.md` is ignored and reported.
- A document declaring 0.4.1 in a package with `library/` is an error.
- A library file, validated by its path, resolves names from the other library files.

## Unresolved Questions

- **How does a linked library sit in a split one?** [RFC-0056](0056-linked-libraries.md)'s `<library>` blocks are declarations and so may live in any library file. Whether one file per linked library should be the recommendation is RFC-0056's to settle.
