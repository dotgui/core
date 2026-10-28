# dotgui Governance

How a change to the `.gui` format travels from an idea to every tool that reads or writes it — without any two of them ever disagreeing.

This document covers the **downstream half** of the process: what happens *after* a decision is made, and how that decision falls down to the spec, the docs, the implementation, and the website. For the **upstream half** — how a decision is proposed, debated, and accepted — see [`rfcs/README.md`](rfcs/README.md). For the rules every decision is judged against, see [`PRINCIPLES.md`](PRINCIPLES.md).

---

## The chain of authority

Each layer is the authority for the one below it. Nothing skips a level.

| Layer | Artifact | Answers | Changed by |
|---|---|---|---|
| **Constitution** | [`PRINCIPLES.md`](PRINCIPLES.md) | What the format *must always* be | Amending a principle (rare, explicit) |
| **Decisions** | [`rfcs/`](rfcs/) | *Why* the format is the way it is | Opening an RFC |
| **Specification** | `schema/types.ts` + `schema/spec.content.ts` → `spec/spec.json` | *What* the format is, right now | An **accepted** RFC, never by hand |
| **Implementations** | the parser (TypeScript + Rust), the renderer, `@dotgui/kit`, the website, the docs | How tools read/write it | Regenerating / re-importing from the spec |

The single rule that makes this work: **you change a lower layer only through the layer above it.** You don't edit the spec to add an attribute — you get an RFC accepted, and the spec follows. You don't redefine the format in the kit — the kit imports it from here.

---

## Two layers of truth

It is worth being precise about the difference between the RFCs and the spec, because they are often confused:

- **RFCs are the *why*** — the proposals, the alternatives weighed, the decisions, the history. This is a permanent, append-only record. A rejected RFC stays forever so the same ground isn't re-litigated.
- **The spec is the *what*** — the current, compiled state of the format. It carries no history; it only describes how things are *today*.

The spec is **downstream of the RFCs.** It is the sum of every accepted RFC, crystallized into one authoritative description. You never edit it as a standalone act — it changes only because an RFC told it to.

---

## Lifecycle of a change, end to end

```
  idea
   │
   ▼
  RFC opened ──────────────► judged against PRINCIPLES.md + prior RFCs
   │                          (the dotgui-rfc skill runs this pre-check)
   ▼
  Draft → Proposed
   │
   ▼
  prototype + real designs            ← PROVE it before deciding (see below)
   │                                     branch rfc/NNNN-name in core + the repo that draws it
   ▼
  Accepted                            ← the gate. nothing downstream moves until here.
   │
   ▼
  spec/spec.json updated              ← the change is RATIFIED into the spec
   │                                     (carried by the accepted RFC, not edited freely)
   ▼
  parser → renderer → kit             ← implemented for real, tests from the real designs
   │
   ▼
  conformance tests pass              ← proves every tool obeys the new spec
   │
   ▼
  core + parser + renderer + kit merge together, tagged with the same point release
   │
   ▼
  downstream pulls it deliberately    ← embed, cli, app, figma-plugin, farm, website, web-app
```

Adding an attribute, after this is in place, is: **open an RFC → prove it on real designs → get it accepted → its `spec.json` change lands → implement → release.**

### The same thing, as steps

Using slots ([RFC-0044](rfcs/0044-slots.md)) as the example:

1. **Propose.** The RFC lands as Proposed on branch `rfc/0044-slots` in core.
2. **Prototype.** A rough version is built on a branch of the same name in the repo that draws it. It only needs to work well enough to judge — a quick HTML sketch or a polyfill that rewrites the new syntax into today's tags is fine.
3. **Try it.** Render 2–3 real designs that use it. Write down what breaks and what feels wrong; revise the RFC. Repeat.
4. **Accept.** Approval means *it has been seen working, its limits are known, and it is still wanted.* Nothing downstream touches the feature before this.
5. **Specify.** The schema change is made in core; `spec.json` and `REFERENCE.md` regenerate.
6. **Implement.** Parser (both languages), then renderer, then kit's validator / lint / score. The real designs from step 3 become the tests.
7. **Release.** All branches merge to `main` together and get the same tag (`v0.3.4`). The RFC moves to Implemented.
8. **Propagate.** Each downstream repo picks up the release in dependency order (see *The repositories*).

A proposal that fails step 3 is rejected: the prototype is deleted, the spec change is discarded, and only the RFC text merges to `main`, marked Rejected, so the reasoning is kept.

---

## Proving a proposal before it is accepted

A proposal is an idea on paper until something renders it. Every mature standards process builds a rough version before saying yes:

- **JavaScript (TC39)** — proposals advance through stages; before the last one they need a polyfill or transpiler plugin, tests, and two shipping implementations.
- **Browsers (WHATWG / W3C)** — an *explainer* first, then the feature ships behind a flag or as an origin trial; it is standardized only after real use.
- **Swift / Rust** — Swift will not review a proposal without a working toolchain; Rust ships new features on nightly, behind a feature gate, before stabilizing.

The common shape is **explainer → rough prototype → real usage → tests → accept.** For `.gui`, cheapest first:

1. **Explainer** — the new syntax beside what you have to write today, and the picture it should produce.
2. **Polyfill** — a small transform that rewrites the new syntax into today's tags, so the existing renderer draws it unchanged. Slots, variant overrides, and multi-document packages can all be tested this way.
3. **Flagged prototype** — for what cannot be rewritten, a rough implementation in the renderer, off by default.
4. **Real designs** — 2–3 actual screens that use it. They become the RFC's test cases.

**The rule:** a Proposed RFC comes with an explainer and a polyfill or prototype that renders at least one real design. Acceptance follows from what that showed, not from how good the idea sounded.

---

## Branches and merging

- **`main` is what is released.** Core `main` only ever holds a spec every tool must support. Each merge is one point release, tagged (`v0.3.1`, `v0.3.2`, …).
- **One branch per RFC, named for the RFC, not the version** — `rfc/0044-slots`, the same name in every repo it touches. The RFC number never changes; its point release can (if slots are accepted before multi-document packages, slots take the earlier number).
- **The branches merge together.** Core, parser, renderer and kit merge to `main` on the same day under the same tag, so the spec never says something the tools cannot do, and the tools never do something the spec does not define.
- **Keep feature branches fresh.** Rebase them on `main` regularly; a prototype that falls behind proves nothing.
- **Releases go in order.** `0.3.2` does not merge before `0.3.1`. If something ahead is stuck, renumber — pre-1.0 that is free.
- **RFC text is not gated.** A Draft RFC is only a document and may land on `main` with its status saying Draft. Only the *spec change* waits on its branch.

---

## The repositories

Eleven repositories under [github.com/dotgui](https://github.com/dotgui), plus local-only working folders.

```
                         core  (RFCs + spec)
                           │
                           ▼
                  parser  (TypeScript + Rust, shared tests)
                     │                  │
                     ▼                  ▼
          kit  (TypeScript)        render  (Rust → native + wasm)
          lint · score · autofix   drawing
          packaging                    │
             │   ◄──── render-wasm ────┘
             │
     ┌── npm ─────────────────────────┬─────── local link ──────┐
     ▼                                ▼                         ▼
   embed ──► farm, website          cli ──► installs        app, figma-plugin
                                            gui-skills
   web-app (pwa)
```

| Repo | Role | Gets changes from | How |
|---|---|---|---|
| **core** | RFCs, principles, spec | — | The source |
| **parser** | Reads `.gui` into a structured model — TypeScript and Rust | core | Implements the spec; both languages pass the same tests |
| **render** | Draws `.gui` — native and wasm | parser | Depends on the Rust parser |
| **kit** | Lint, score, autofix, packaging; today also the HTML renderer and TS parser | core, parser, render | Reads core's schema; generates `spec.json` back into core |
| **embed** | Renders `.gui` in any web page | kit | npm |
| **cli** | `gui` toolchain; installs the agent skill | kit | npm |
| **farm** | gui.farm example library | kit, embed | npm |
| **website** | dotgui.org | kit, embed, core | npm, plus `sync:spec` copies `spec.json` |
| **web-app** | Browser app | kit | npm, pinned exactly |
| **app** | Desktop app | kit | Local link to `../kit` |
| **figma-plugin** | Figma export / import | kit | Local link to `../kit` |

**Two ways downstream gets a change.** npm consumers (embed, cli, farm, website, web-app) only see a feature after kit is published and their version is bumped. Local-link consumers (app, figma-plugin) see whatever is in the `kit` folder *right now* — handy for testing, risky if built while kit is on an RFC branch. Build them from `main` only.

**Release order for a feature:** core + parser + render + kit merge → parser and kit publish → embed publishes → farm, website, cli and web-app bump → app and figma-plugin rebuild → gui-skills learns to write it.

---

## One parser, two languages

Parsing is useful far beyond drawing. Things that read `.gui` without rendering it:

- **Agents** — read a file as structured data to understand or edit it (`gui read` / `gui write`).
- **Lint and score** — structure only, no pixels.
- **Code generation** — `.gui` → React, SwiftUI, Flutter, HTML.
- **Figma import** — building layers inside the plugin sandbox.
- **Diff** — what changed between two versions of a screen, node by node.
- **Search and indexing** — gui.farm finding every screen with a tab bar, or every file using `$primary`.
- **Editors** — autocomplete, error underlines, outline view.
- **JSON / token / component extraction** — for any app that only wants the data.
- **Server-side validation** — checking uploads before accepting them.

Most of those live in JavaScript; the native renderer needs Rust. So the parser is **one repository with two implementations**:

```
dotgui/parser
 ├── ts/      → npm:   @dotgui/parser
 ├── rust/    → crate: dotgui-parser
 └── tests/   → shared .gui files + expected parse results
```

- **Both run the same tests in the same CI run.** A new feature is one pull request that adds it to both; they cannot silently disagree. (tree-sitter and protobuf are kept the same way.)
- **The renderer only draws.** It depends on `dotgui-parser` instead of carrying its own.
- **kit stops owning parsing.** It depends on `@dotgui/parser` and keeps lint, score, autofix and packaging.
- **Both return the same shape.** The parsed model — node names and fields — is defined once, in core beside `spec.json`, so neither implementation invents its own.

The TypeScript implementation is not a fallback. The Figma plugin's main thread runs in a sandbox that cannot load wasm, and every JavaScript consumer is lighter without it.

---

## The spec is machine-readable

There is **one source**, with generated artifacts hanging off it:

- `schema/types.ts` + `schema/spec.content.ts` — the **canonical source**. The types carry the structure (every element, attribute, type, default, constraint); the content file carries the prose and examples that types can't hold.
- `spec/spec.json` — the **machine-readable artifact**, generated from the source (`bun run gen:spec`). The single thing non-TypeScript consumers read.
- `spec/REFERENCE.md` — the human-readable element reference, generated from `spec.json`. (`spec/DOTGUI.md` is the hand-authored *prose* spec; `REFERENCE.md` is its always-accurate companion.)

Every consumer derives its own output from this one source — nothing is hand-copied:

| Repo | Reads | Produces |
|---|---|---|
| **core** | `schema/types.ts` + `spec.content.ts` | `spec/spec.json`, `spec/REFERENCE.md` |
| **[@dotgui/kit](../kit)** | core's `types.ts` (imported directly) | parser, validator, renderer, scorer |
| **website** | `spec.json` (synced from core) | the `/spec/*` documentation pages |

The kit reads the **types** because it is TypeScript and the types *are* the structure; the website and docs read the generated **`spec.json`** because they need the data, not the types. Both faces come from the same source, so they cannot disagree. This is the model used by Protocol Buffers, the Language Server Protocol (`metaModel.json`), and OpenAPI.

> **Why this matters:** the website can never document an attribute the kit rejects, and the docs can never describe one the types don't define — because all of them derive from the same source. Drift becomes structurally impossible, not merely discouraged.

---

## Nobody hand-edits the spec

This is the load-bearing rule, stated plainly:

- ❌ You do **not** open `spec.json` and add an attribute because it seems useful.
- ❌ You do **not** "fix" the docs to match the code, or the code to match the docs.
- ✅ You open an **RFC**. If it is accepted, the spec change it carries is ratified, and everything downstream regenerates.

The RFC is the *only* door into the spec. This is what keeps `PRINCIPLES.md` meaningful — every change to the format has, by construction, passed the constitution.

---

## Two ways to author an RFC

Everyone contributes the same artifact — an RFC. The only difference is how it gets written, because designers are first-class authors of `.gui` and most do not live in git:

- **Developer path** — write the RFC markdown directly, following the structure in [`rfcs/README.md`](rfcs/README.md), and open a PR.
- **Designer path** — use the **`dotgui-rfc` skill**. Describe the change in plain language; the skill checks it against `PRINCIPLES.md`, the existing spec, and prior RFCs, tells you whether it's already possible / conflicts / is genuinely new, and drafts the RFC for you. The git mechanics stay hidden.

Both paths end at the same gate, get the same review, and produce the same result. The skill is a smart front door to the RFC process — and a pre-flight check that catches dead-on-arrival proposals before they cost reviewer time.

---

## Versioning and propagation

The format is versioned (`0.1` → `0.2` → `1.0`; see [`rfcs/README.md`](rfcs/README.md)). Downstream tools depend on a **pinned version** of the spec, not "whatever is latest":

```jsonc
// a consumer's package.json
"dependencies": { "@dotgui/core": "0.2.x" }
```

A consumer upgrades on purpose, by bumping that version — so docs and tooling ship *in step with a release*, never changing out from under users mid-flight. Pre-1.0, breaking changes are free; post-1.0, semver applies (MAJOR = breaking, MINOR = additive, PATCH = clarification).

**Pre-1.0, the spec moves in chapters.**

- **A chapter is the middle number** (`0.3`, `0.4`, `0.5`): a themed group of RFCs, planned up front. 0.3 is components and packages; 0.4 is motion and interaction.
- **Each RFC in it is one point release.** `0.3.1` is one RFC, `0.3.2` the next, so what a file can contain traces to a single decision. Accepted and Proposed RFCs take the lowest numbers; Draft slots are tentative. The current assignment is in the [RFC index](rfcs/README.md#index).
- **A chapter closes when its list is empty** — every RFC shipped, rejected, or moved on. The next release is then `x.y.0` of the next chapter. Once a chapter is underway, new ideas go to a later one, and a chapter that runs well past two or three months closes anyway, pushing what is unfinished forward.

**Tools share the chapter, not the patch.** Every tool's version keeps the spec's `MAJOR.MINOR` — renderer `0.3.x` reads 0.3 documents — but counts its own `PATCH`, because it needs somewhere to put fixes and four-part versions (`0.3.4.1`) are not valid on npm or crates.io. Each tool **declares the exact spec point it reads** (`supports spec 0.3.4`) and refuses documents newer than that. So spec `0.3.4` may be read by renderer `0.3.7`. The renderer's [VERSIONING.md](https://github.com/dotgui/render/blob/main/VERSIONING.md) spells out the same rule (pending [dotgui/render#95](https://github.com/dotgui/render/pull/95)).

---

## Conformance — the anti-drift guarantee

Generation alone proves the *structure* matches. Behavior — does an invalid file get rejected, does `gap="auto"` actually distribute space — is proven by a **conformance test suite**: a shared set of `.gui` inputs with expected outcomes, derived from the spec, that the kit must pass. CI fails any change where the implementation and the spec disagree. This is the same mechanism browsers (Web Platform Tests) and JavaScript engines (Test262) use to stay aligned.

Together: **generation kills structural drift, conformance tests kill behavioral drift.**

---

## Current rollout status

This document describes the governance model. Where it stands:

- ✅ Constitution (`PRINCIPLES.md`), RFC process, and decision log are live.
- ✅ **The source lives in core.** `schema/types.ts` (structure) + `schema/spec.content.ts` (prose) are the canonical definition. The kit imports the types directly (`kit/src/schema/types.ts` is a re-export shim).
- ✅ **Generation from core.** `bun run gen` produces `spec/spec.json` and `spec/REFERENCE.md` from the source.
- ✅ **Drift-check CI** (`.github/workflows/spec-drift.yml`) fails any change where the generated artifacts are stale vs the source.
- ✅ **Consumers wired.** The website syncs `spec.json` from core (`sync:spec`, with a `sync:spec:check` drift guard) and generates its `/spec/*` pages from it.
- 🚧 `spec/DOTGUI.md` (the prose/normative spec) is hand-authored — `REFERENCE.md` is the generated companion, not a replacement.
- 🚧 **Versioned publishing.** Consumers currently sync from a sibling checkout of core; publishing core as a package (so consumers pin a version) is the next step.
- 🚧 **Data-driven validator.** `validate.ts` is still hand-maintained and can drift from the types; pointing it at `spec.json` would close that gap.
- 🚧 **Conformance test suite** — the behavioral safety net — is still to be built.
- 🚧 **Parser split.** The kit has a TypeScript parser and the renderer has its own Rust parser, untested against each other. Moving both into `dotgui/parser` with shared tests is planned.
- 🚧 **Renderer handover.** The kit's HTML renderer is the one in use; the Rust renderer is taking over drawing, with kit depending on its wasm build.
- 🚧 **Version gate.** Both the native renderer and the kit validator read documents up to spec `0.3.11` and refuse any later point or chapter (0.3.11 pending dotgui/render#103 and dotgui/kit#22). `spec.json`'s `formatVersion` comes from core (`specFormatVersion` in `schema/spec.content.ts`). The Figma plugin still writes `version="1.0"` and a `<meta>` block; both tools refuse the first and report the second as obsolete.

### Open decisions

- **`spec-next`.** With one branch per RFC, a shared integration branch mixes features again. Leaning: merge it into `main` and retire it.
- **Figma sandbox.** Confirm the plugin's main thread cannot load wasm before relying on that as the reason the TypeScript parser must exist.
