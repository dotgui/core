---
rfc: 0043
title: Standalone `.guix` — the served, readable form
status: Draft
targets: 0.3
date: 2026-09-12
---

# Standalone `.guix` — The Served, Readable Form

## Context

### The format had two goals, and quietly dropped one

`.gui` was built to be two things at once: a package that carries design knowledge and transfers in one piece, and something a machine can read without ceremony ([P1](../PRINCIPLES.md), [P7](../PRINCIPLES.md)). Both are still right. They are not the same shape.

The second goal wanted what SVG has: one text file, readable in place, servable from anywhere, embeddable in anything. That is the shape the format started toward, and the preamble still describes it — "open it in a text editor and understand it."

[RFC-0004](0004-package-format.md) chose a ZIP instead, for one measured reason. Inlining assets as base64 cost roughly half a token session, which is intolerable for the exact consumer the format is built for. Separating markup from binaries required a container, and the container was the right call — [RFC-0042](0042-multi-document-packages.md) is now the second thing it bought.

But it cost the SVG property, and nothing has ever said so out loud.

### The practice already moved

Three things are true today that were not true when RFC-0004 was written:

**Bare markup is already valid input.** The spec distinguishes a package from raw markup by magic bytes — `PK` versus `<` — and accepts both. A standalone document is not a new idea; it is an accepted input that was never given a contract.

**Assets can already live on a network.** [RFC-0031](0031-images-and-assets.md) Rule 2 permits `https://` sources. It labels them *fallback only when embedding is not possible*, which reads as an apology rather than a design.

**It is being served in production.** gui.farm exposes any screen's raw markup at `<url>/design.guix`, and agents read it directly. Meanwhile [`spec/REFERENCE.md`](../spec/REFERENCE.md) calls that same markup "an implementation detail never surfaced to the outside."

That sentence is no longer true. The practice is ahead of the specification, and a spec that contradicts a live deployment is a spec that will be ignored in the places it matters.

### What this RFC is for

Every mechanism already exists. What is missing is a name, a contract, and one rule. This RFC does not invent a form — it ratifies one that is already load-bearing, and states what it is allowed to contain.

## Decision

**A bare `.guix` document is a first-class distribution form, not an implementation detail.**

### The package transfers; the document serves

These are two jobs, and neither form does both well. That is the design, not a defect:

| | `.gui` package | standalone `.guix` |
|---|---|---|
| Job | hand it to someone | serve it to a reader |
| Contains | markup, assets, preview | markup |
| Offline | yes, completely | no — assets are fetched |
| Read by an agent | unzip first | `GET` and read |
| Screens | one or many ([RFC-0042](0042-multi-document-packages.md)) | exactly one |
| Assets | local, in `assets/` | absolute URLs only |

Neither is a superset. The package is complete in your hand and works with no network. The standalone document is readable by anything that can fetch a URL and costs one round trip per asset. A consumer picks the form that matches what it is doing.

### The rule that makes it coherent: no local asset paths

> **A standalone `.guix` document may not reference a local asset path.**
> `src="assets/hero.webp"` is invalid outside a package. Asset references must be absolute URLs.

This is the whole constraint, and everything else follows from it. A relative path means "relative to the package," and there is no package — so the reference cannot resolve, and nothing should try to guess what it meant.

**For renderers, this is an error, not a degradation.** A relative asset path in a standalone document fails loudly ([P15](../PRINCIPLES.md)). It is not a missing image to be drawn as a placeholder; it is a document that was handed over in the wrong form.

**For editors, this is the moment to say so.** An editor working on a standalone document can change text, styles, tokens, components, layout, and remote images indefinitely. The moment the user adds a local asset, the document has outgrown the form and must be packaged. That is a thing to tell the user plainly, not to paper over.

### Promotion has exactly two triggers

A standalone document becomes a `.gui` package when, and only when:

1. **It needs a local asset** — a file that has to travel with the markup.
2. **It needs more than one screen** — because a document is exactly one screen ([RFC-0042](0042-multi-document-packages.md)), and more than one means a package.

Both are mechanical. Neither requires judgment, a heuristic, or a setting. Until one of them fires, the standalone form is not a lesser version of the package — it is simply the right shape.

### There is no preview, and that is correct

A standalone document has nowhere to put a `preview.webp` and does not get one.

[RFC-0004](0004-package-format.md) made the preview the face of the file, and that remains true *of the package*. But a preview serves a human scanning a catalog, not an agent reading markup — and a catalog can hold its own thumbnails. The preview belongs to the package and to the things that list packages. It was never a property of the document.

### It does not announce itself

A standalone document is ordinary markup. There is no flag, no attribute, and no mode that says "I am standalone." A document that declares everything it uses and references only absolute URLs *is* standalone, by being those things.

This matters more than it looks. It means no producer has to opt in, no parser has to branch, and a document flattened out of a package is indistinguishable from one authored directly — which is the property that makes the form free.

### Non-goals

- **No new syntax.** Not a tag, not an attribute, not a value form. [P11](../PRINCIPLES.md) is untouched.
- **No standalone flag.** See above.
- **No linking to a library.** A standalone document carries its declarations inline or does without them. Pointing at an external library is pre-rejected by [RFC-0042](0042-multi-document-packages.md) and stays rejected here.
- **No multi-screen standalone.** More than one screen is a package. The one-document-one-screen invariant is not touched.
- **No media type registration, yet.** See *Unresolved Questions*.

## Reasoning

### This is the original shape, recovered

The standalone document is not a concession to hosting. It is what the format was reaching for before assets forced a container, and the reason it is available again is that the network solved the problem base64 could not: an image can be *referenced* cheaply even though it cannot be *embedded* cheaply.

So the two founding goals stop competing. Transfer gets the package. Reading gets the document. The format does not have to choose, because the two jobs were never in conflict — they only ever needed different envelopes.

### Flattening is already specified

[RFC-0042](0042-multi-document-packages.md) defines the transform: inline the subset of the library the document uses, and it is lossless because a redeclared name is an error rather than an override. This RFC adds the other half — rewrite local asset paths to absolute URLs — and the result is an ordinary standalone document.

Nothing new is invented here. The operation was already named; it now has a destination.

### The conversion is asymmetric, and the asymmetry is honest

Packaging a standalone document is a local operation: fetch the remote assets, write them into `assets/`, rewrite the references. Any machine can do it alone.

Flattening a package into a standalone document is **not** local if the package has local assets. Those bytes have to be somewhere a URL can reach, which means a host, which means the transform depends on infrastructure the format does not provide.

This is worth stating rather than hiding: `standalone → package` is always available, `package → standalone` is available only to something that can publish. It is the correct asymmetry — it puts the burden on the party that wanted to serve.

### A cheap renderer changes what a preview is worth

Today's rendering path is heavy, and a stored thumbnail is how a consumer avoids paying for it. As rendering moves to a small Rust/WASM implementation, that calculation changes: drawing the design becomes cheap enough that carrying a picture of it is mostly redundant.

That argument is about the future and is offered as a direction, not a justification — the renderer has not shipped. The reasons the standalone form needs no preview hold today regardless: there is nowhere to put one, and the consumer that reads a served document is reading markup, not looking at a thumbnail.

### Serving markup is what the readable-format claim was always for

[P7](../PRINCIPLES.md) says the primary author and reader of `.gui` is increasingly an agent. An agent that has to fetch a ZIP, unpack it, locate a document, and parse it — in order to read markup that was always text — is paying a container tax for a job the container was not bought for. The container was bought for assets. When the assets are elsewhere, the tax has no payer.

## Drawbacks

- **It depends on the network, heavily.** This is the core trade. A standalone document with twelve images is twelve fetches and twelve chances to fail, against one file that always worked. RFC-0004's promise — hand someone the file and they have everything — does not hold for this form, and the RFC should not pretend otherwise.

- **Remote assets can rot.** A package's assets cannot 404. A standalone document's can, and the document has no way to know. It will render with holes long after it stops being correct.

- **Round-tripping is possible but not free.** An agent can read a standalone document, edit it, and hand it back; re-packaging means downloading every remote asset first. The markup round-trips cleanly ([P1](../PRINCIPLES.md)); the assets do not.

- **Two forms is two things to support.** Every tool now has a choice to make, and every piece of documentation has a second case. [P12](../PRINCIPLES.md) dislikes forks in the canonical path. The defense is that the fork is at the transport layer and the *document* is identical in both — but it is a real cost.

- **Part of the preview argument rests on unshipped work.** The Rust renderer is a direction, not a fact. If it does not land, consumers that want a thumbnail without rendering have no answer for this form.

- **No media type means nothing downstream knows what it is holding.** Served as plain text, a `.guix` is a string. SVG travels as well as it does partly because `image/svg+xml` exists. This is deferred, not solved.

## Alternatives Considered

**Keep it an implementation detail (the status quo)** — Rejected. The spec says the markup is never surfaced outside the package; it is surfaced, at a public URL, and read by agents daily. A rule that production already ignores is not a rule. Either the practice stops or the spec catches up, and the practice is the one delivering value.

**Allow local asset paths, resolved against a sidecar convention** — Rejected. A document plus a folder of assets it resolves against is a package with the lid off — all of the coordination, none of the guarantees. The moment assets must travel with the markup, the container is the right answer, which is exactly what *Promotion* says.

**Embed assets as `data:` URIs so standalone is self-contained** — Rejected, and already measured. RFC-0004 tested inline base64 at roughly half a token session; the whole container exists to avoid it. Re-introducing it to rescue portability would reverse the format's most expensive finding.

**Require a `standalone` attribute** — Rejected. It would be a second source of truth about a fact already evident from the content, and it would mean a flattened document is not interchangeable with an authored one.

**Restrict the standalone form to reading only** — Considered, rejected. Tempting, because it would sidestep the round-trip asymmetry by declaring the form read-only. But nothing enforces it, agents will edit what they can read, and a rule that cannot be checked is worse than a stated cost.

## Unresolved Questions

- **Media types for `.gui` and `.guix`.** Registration is the right end state — it is part of why SVG travels — but it is not what makes the format useful this week. Deferred deliberately: get the form serving and solving a problem first, register once it has proven itself.
- **Are `data:` URIs permitted at all?** Banned outright, or allowed for genuinely small assets like a 200-byte icon? A blanket ban is simpler and harder to abuse; a threshold is more useful and needs a number.
- **How does a host address documents now that filenames are free?** [RFC-0042](0042-multi-document-packages.md) removed the fixed `design.guix` path, so gui.farm's `<url>/design.guix` is a host convention rather than a format guarantee. Nothing is wrong with that — but the convention should be written down somewhere, and this RFC is the closest thing to its home.
- **Can `library.guix` be served standalone?** It is an ordinary document with a screen part that doubles as a style guide, so serving it appears to be legal and possibly useful. Nothing has checked whether that creates a confusing artifact.
- **Should a standalone document declare a minimum version?** Multi-document packages require `0.3` or higher ([RFC-0042](0042-multi-document-packages.md)) because the structure is a 0.3 structure. A standalone document uses no new vocabulary at all, so it may honestly be a `0.2` document — which means a 0.2 renderer can read it, which is either a feature or a loophole depending on what "supported form" means.
