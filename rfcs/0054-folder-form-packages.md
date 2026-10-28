---
rfc: 0054
title: Folder-form packages — a .gui can be a directory
status: Accepted
targets: 0.4.1
date: 2026-10-29
updated: 2026-10-29
depends-on: 0004, 0042, 0043
amends: 0004
---

# Folder-Form Packages — A `.gui` Can Be a Directory

## Context

### What we assumed

[RFC-0004](0004-package-format.md) settled that `.gui` is always a ZIP. It considered a directory format and rejected it in one line: *sharing a folder is harder than sharing a file.* That was true, and it still is. The ZIP is the right shape for handing a design to someone.

It is the wrong shape for working on one, and RFC-0004 said so itself, under *Drawbacks*: a package "cannot be edited in a text editor without unpacking first."

### What changed

When the package held one document, that drawback was small. Unzip, edit, rezip — or never look inside at all. Three things have since made it the common case rather than the edge:

**Packages are many files now.** [RFC-0042](0042-multi-document-packages.md) put many documents and a `library.guix` in one package, and argued the benefit precisely: *granularity* — an agent opens `02-signup.guix` and nothing else. Inside a ZIP, that addressability stops at the container. A reader can name the document it wants but still has to open the archive to get it, and a diff of the package is a diff of one binary.

**The main readers and writers are agents and version control.** Both work on files in a directory. An agent asked to change the sign-up screen wants `cat 02-signup.guix` and an edit to that file. Git wants to see that one document changed by four lines. Neither can see into a ZIP.

**Tools already do this, privately.** An editor that opens a package, an agent that changes one, a repository that keeps one under review — each unzips to a scratch directory, works there, and zips back. The kit deliberately avoids that ("without extracting a shadow folder"), and every consumer above it rebuilds it anyway. A form every tool reinvents, with no rules, is a form the spec should own.

### What this RFC is not proposing

It does not replace the ZIP, add anything to the markup, or change what a package contains. It does not make an arbitrary folder of `.guix` files a package — a repository with `.guix` files next to its components is a *source tree*, not a package (see *Unresolved Questions*). And it does not touch the `library/` directory, which is [RFC-0055](0055-library-directory.md)'s.

## Decision

**A directory whose name ends in `.gui` is a package. It holds exactly what the ZIP holds, under exactly the same rules.**

```
onboarding.gui  (ZIP)              onboarding.gui/  (directory)
├── 01-welcome.guix                ├── 01-welcome.guix
├── 02-signup.guix                 ├── 02-signup.guix
├── library.guix                   ├── library.guix
├── preview.webp                   ├── preview.webp
└── assets/                        └── assets/
    └── logo.svg                       └── logo.svg
```

These are the same package. Every rule in RFC-0004, [RFC-0042](0042-multi-document-packages.md) and [RFC-0043](0043-standalone-guix.md) that speaks of a package's entries applies to the directory's files, path for path: which `.guix` files are documents, that `library.guix` is reserved, that `assets/` is where local assets live, that `src="assets/logo.svg"` resolves inside the package and nowhere else.

### One structure, two forms, by job

This is the same split RFC-0043 made between the package and the standalone document — two forms, each the right shape for one job:

| | ZIP | directory |
|---|---|---|
| Job | hand it to someone | work on it |
| Moves through | email, chat, upload, file pickers | an editor, an agent, version control |
| Reads one document | open the archive | read the file |
| Diffs | as one binary | per file, as text |

Neither is a superset, and neither is the "real" one. A consumer picks the form that fits what it is doing.

### Conversion is lossless and mechanical

> **Unzipping a `.gui` into a directory, or zipping a `.gui` directory, never changes a byte of markup or an asset.**

Each ZIP entry is the file at the same relative path, and each file is the entry. Nothing is rewritten, renamed, regenerated, or reordered in meaning. A producer writing a ZIP from a directory writes entries in lexical path order, so two producers zipping the same directory produce the same archive ([P14](../PRINCIPLES.md)).

### The `.gui` suffix is what makes it a package

A directory is a package because its name ends in `.gui` — not because it happens to contain `.guix` files. The suffix is the declaration, the same way a `.app` or `.xcassets` directory is one thing to the tools that know it.

This is what keeps source trees out. A component folder in a repository may hold `Button.tsx` and `Button.guix`; it is not a package, and a tool walking the repository must not treat it as one. The suffix makes that unambiguous without a manifest, a marker file, or a scan of the contents ([P10](../PRINCIPLES.md)).

### What is not part of the package

The ZIP never had to say this, because a producer only wrote the entries it meant. A directory collects whatever the operating system, an editor, or version control drops into it. So the rule is stated once, for both forms:

> **A package is its documents, `library.guix`, `preview.webp` and `assets/`, plus whatever a later RFC reserves. Nothing else is part of it.**

- **Readers ignore everything else.** `.DS_Store`, `Thumbs.db`, `.git/`, editor swap files, a stray `notes.txt` — none of them mean anything to the format, and none change how the package renders. This is how readers already treat a ZIP; the kit reads root `.guix` files, `preview.webp` and `assets/` and nothing more.
- **Any entry whose name starts with `.` is ignored, at any depth**, including inside `assets/`. Hidden files are where tools keep their own state; a dotfile is never an asset.
- **Producers never write what they ignored.** Zipping a directory packs only package entries. The litter stays behind, so it cannot travel into someone else's hands.
- **Validators list what they ignored.** Ignoring is not hiding ([P15](../PRINCIPLES.md)): a validator reports each ignored entry as a warning (`IGNORED_ENTRY`), so an asset left outside `assets/` is visible as "not part of the package" rather than silently missing. A warning never fails the package.

### What is an error

- **A symbolic link, anywhere in the package, is an error.** A ZIP cannot hold one faithfully, so a directory containing one cannot be converted losslessly; and a link is the one way a path inside the package can resolve to a file outside it, which RFC-0042's closed resolution forbids. Readers must not follow links.
- **A path that resolves outside the package is an error**, in either form — `../`, an absolute path, a ZIP entry named `../x`. This was always true of the ZIP in spirit; it is now stated.
- **Two entries whose paths differ only in letter case, or only in Unicode normalization, are an error**, in either form. A ZIP can hold `Logo.svg` and `logo.svg`; most desktop file systems cannot, so the package could not survive being unpacked. Paths are compared after Unicode NFC normalization and case folding, so `café.svg` written composed and decomposed is the same path. A rule that holds in both forms is the only way conversion stays lossless.

### Names, previews and hosts

- **Producers write entry names in NFC.** Some file systems store names decomposed (NFD), and a name can change bytes on the round trip. Writing NFC, and comparing after NFC (above), makes the round trip stable.
- **`preview.webp` is copied, never regenerated, by conversion.** Zipping a working copy packs whatever preview it holds, stale or not. Regenerating a preview is a separate, explicit step a tool may offer; conversion that silently changed the face of the package would not be lossless.
- **Hosts take the ZIP.** Uploading is transfer, and the ZIP is the transfer form. A host may accept a directory and zip it, by the rules above.

### No version requirement of its own

RFC-0042 and RFC-0043 each require a version because a reader could otherwise *misread* the file — a 0.2 renderer would open a multi-document package and draw the wrong thing. A directory cannot be misread that way. A reader that does not support the form fails at the first step, asked to open a directory it cannot open, before any markup is parsed. That failure is already loud and honest.

So the form adds no version rule, and this is what lets conversion be byte-for-byte: unzipping a valid 0.3 package produces a valid package, with nothing to rewrite. A reader that claims `0.4` must accept both forms.

### Amends RFC-0004

RFC-0004's decision becomes: **a `.gui` package is a ZIP or a `.gui` directory.** Its rejection of the directory format is reversed for working copies and kept for transfer — sharing a file is still easier than sharing a folder, which is why the ZIP remains the form a package is sent in. RFC-0004's drawback "cannot be edited in a text editor without unpacking first" is resolved by this RFC.

## Reasoning

### It sits below the grammar

This is container structure, the layer RFC-0004 and RFC-0042 operate on. No tag, property or value form is added; `<gui>` is untouched; no markup changes meaning. [P11](../PRINCIPLES.md)'s grammar gate does not apply, on RFC-0042's precedent that container layout is outside its jurisdiction. As with RFC-0042, that makes it a cheap and reversible bet: if it is wrong, it is dropped and no file's markup was ever affected.

### Answering RFC-0004's rejection

Re-litigating a rejection needs a new argument, not the old one repeated. RFC-0004's argument was about *sharing*, and this RFC accepts it in full — the ZIP stays the transfer form. The new argument is about *working*: since RFC-0042, a package is many named files whose value is that they can be addressed one at a time, and the readers that matter most — agents and version control — address files in directories. RFC-0004 weighed a directory against a ZIP as the only form. The question now is whether a package may have a second form for a different job, which is the question RFC-0043 already answered yes to for the standalone document.

### Not a sidecar

RFC-0043 rejected "a document plus a folder of assets it resolves against" as "a package with the lid off — all of the coordination, none of the guarantees." This RFC is not that. A sidecar is a document claiming to stand alone while depending on files beside it. A `.gui` directory claims to be a package and is one: the same entries, the same rules, the same closed resolution, convertible to the ZIP without judgment. The lid is off; the guarantees are all still there.

### Principle pass

| Principle | Result | Why |
|---|---|---|
| P1 Neutral interchange | pass | Directories and ZIPs are universal; no tool owns either |
| P2 Platform-agnostic | neutral | Container only; nothing renders differently |
| P3 Visual, not an editor's save file | pass | No editor state is added; tool litter is explicitly excluded |
| P4 Everything means something | pass | The package is defined as its meaningful entries; the rest is outside it |
| P5 Not React / HTML / Figma | pass | No behavior, document semantics, or authoring state |
| P6 Intent vs computation | neutral | Below the language |
| P7 Readable, token-efficient | **pass** | An agent reads one document without unpacking; the main motivation |
| P8 One vocabulary | neutral | No vocabulary added |
| P9 Common case compact | pass | The single ZIP is unchanged; the directory is opt-in |
| P10 Conventions over configuration | pass | The suffix declares it; no manifest, no marker file |
| P11 Grammar | neutral | Outside the grammar (RFC-0042 precedent) |
| P12 One obvious way | **pass, argued** | Two forms of one structure, split by job as in RFC-0043, with mechanical conversion — not two ways to express a design |
| P13 Fewer primitives | neutral | No primitive added |
| P14 Deterministic | pass | Lossless conversion; lexical entry order when zipping |
| P15 Honest semantics | pass | Ignored entries are reported; links, escaping paths and case collisions fail loudly |

P12 is the one to watch. Two forms would fail it if a design could be expressed differently in each. It cannot: the forms hold the same entries, convert without judgment, and a consumer that reads one reads the other by walking the same paths.

## Alternatives Considered

**Status quo: tools unzip privately** — Rejected. It is what happens today, and every tool does it differently: where the scratch copy lives, what it does with litter, whether symlinks or case collisions survive the trip back. The format ends up with an unofficial second form whose rules nobody wrote.

**Any directory containing `.guix` files is a package** — Rejected. It would make every component folder in a repository a package, and a repository root a package containing whatever `.guix` files happen to sit there. The suffix is one character of ceremony that removes all of that ambiguity.

**A marker or manifest file** (`package.json`-style, or an empty `.gui` file inside) — Rejected under [P10](../PRINCIPLES.md). It is a second place for the truth to live and a thing to forget. RFC-0042 made the same call for `library.guix`: the filename is the declaration.

**A different suffix for the directory form** (`.guid`, `.gui-folder`) — Rejected. The two forms are one package; giving them two names implies two formats and forces every tool to know both. A reader tells them apart the way RFC-0004 tells a ZIP from bare markup: by looking at what it was handed — a file or a directory.

**Allow symlinks that stay inside the package** — Rejected. Even an internal link becomes a duplicate file in the ZIP, so the round trip back to a directory is not the directory you started with. One rule — no links — is simpler than a rule about where links may point.

## Drawbacks

- **Two forms of one structure.** Every reader of packages must accept both from 0.4.1. The conversion is mechanical, and a shared step in each implementation applies the same rules, but it is a second code path.
- **A new error for some existing ZIPs.** A ZIP holding two entries that differ only by case or normalization, or an entry path that escapes the package, was never sensible and is now refused.
- **The folder is not one file on every platform.** macOS can show a `.gui` directory as a document; Windows and Linux show a folder. That is a tool and operating-system matter, not the format's.

## Implementation Notes

- **Kit:** the package module stays byte-based and file-system-free. It gains `fromEntries(entries)` — a map of relative paths to bytes, from a ZIP or a walked directory — and `toEntries(pkg)`, in lexical path order. `unpack` and `pack` are those two plus ZIP encoding, so a ZIP and a directory pass through one step that applies every rule here: dotfiles and non-package entries ignored and listed (`pkg.ignored`, reported as `IGNORED_ENTRY` by `validateDocument`), escaping paths and case or NFC collisions refused. Symbolic links are the caller's to detect, since only the caller touches the file system.
- **Native renderer:** reads a `.gui` directory as well as a ZIP, through the same entry step and rules, refusing symbolic links. The wasm build takes entries from its host.
- **CLI:** `gui pack` and `gui unpack` move onto kit's entry step once a kit release carrying it is published.
- **Spec:** `spec/DOTGUI.md` *The .gui package* describes both forms.

## Test Cases

- A ZIP and the directory it unzips to read as the same package: the same documents, library, preview and assets, byte for byte.
- `toEntries` of a package, zipped and read back, is unchanged; two zips of one directory are identical.
- `.DS_Store`, `.git/config`, `assets/.hidden.png` and `notes.txt` are ignored and listed; none appear when the package is packed.
- `../outside.svg`, `/abs.svg` and `assets/../../x` are refused; `Logo.svg` beside `logo.svg`, and `café.svg` composed beside decomposed, are refused.
- A symbolic link in a directory package is refused by the native renderer.
- A directory not ending in `.gui` is not a package.

## Not Covered

- **Source trees and the build step.** A repository keeping `Button.guix` beside `Button.tsx` wants those files assembled into a package. That assembly is a tool's job, and how it treats local asset paths in scattered `.guix` files may need its own RFC.
- **Showing a directory as one file** — a platform and tool matter.
