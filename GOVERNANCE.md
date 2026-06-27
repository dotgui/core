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
| **Implementations** | `@dotgui/kit` (parser, validator, renderer), the website, the docs | How tools read/write it | Regenerating / re-importing from the spec |

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
  Draft → Proposed → Accepted          ← the gate. nothing moves until here.
   │
   ▼
  spec/spec.json updated               ← the change is RATIFIED into the spec
   │                                      (carried by the accepted RFC, not edited freely)
   ▼
  generate
   ├──► spec/DOTGUI.md      regenerated   (human-readable reference)
   ├──► @dotgui/kit         types + validator regenerated / conformance-checked
   └──► website             /spec/* pages regenerated
   │
   ▼
  conformance tests pass               ← proves every tool obeys the new spec
   │
   ▼
  released as a new format version     ← downstream pulls it deliberately
```

Adding an attribute, after this is in place, is: **open an RFC → get it accepted → its `spec.json` change lands → run generate.** Every doc, type, and page updates itself.

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
