---
rfc: 0040
title: Quality scoring model — CCACT
status: Proposed
introduced-in: 0.2
date: 2026-06-12
---

# Quality Scoring Model — CCACT

## Context

There is no formal definition of what makes a *good* `.gui` file. The format has a validity gate (`validate.ts`) and a cleanup tool (`gui-optimizer`), but neither answers the question: "given a valid, optimized file — how good is it?"

This matters for two reasons. First, the primary author of `.gui` is increasingly an AI (P7) — and an AI needs a clear optimization target, not just a spec to comply with. Second, gui.farm positions itself as a registry and reference layer; scoring is a first-class part of that identity.

The question is: what does quality mean, and how do you measure it from a text file alone?

## Decision

Quality is a **gate followed by a score**. A file that fails the gate is not a `.gui` file — it is not scored, it is rejected. A file that passes the gate is scored across five levels — **CCACT** — ordered from most to least objective:

| Level | Name | Objective? | Needs corpus? |
|---|---|---|---|
| C | Clean | Yes | No |
| C | Consistent | Yes | No |
| A | Accessible | Yes (WCAG anchored) | No |
| C | Conventional | Semi | Yes (gui.farm) |
| T | Trend | No (current design trends) | Yes (gui.farm + temporal) |

Every level emits the same envelope: `{ "score": 0–100, "audits": [...] }`. What lives inside `audits` differs per level, but the shape is always identical — predictable and easy to consume across all entry points.

The output of this RFC is `core/spec/QUALITY.md` — a living definition of what a good `.gui` file looks like, sitting alongside `spec/DOTGUI.md`. Any scorer can implement against it. `gui-score` is the reference implementation.

### Gate — conformance + referential integrity

Before any scoring, two conditions must hold:

1. **Valid** — the file conforms to the dotgui spec. `validate.ts` is the authority. If this fails, stop.
2. **Intact** — every reference resolves: `$token` names exist in the token block, asset `src` values point to real files in the package, `component` ids on instances match a declared `<component>`, `detached-from` origins are traceable. A file can be structurally valid and still be silently broken for its core job (P1 — round-trip is a first-class constraint).

Both conditions are binary. Neither is a score. Together they are the entry condition for scoring.

### Level 1 — Clean

**What it measures:** how much unnecessary work the file contains — absolute positioning where auto-layout would do, redundant wrappers, duplicated assets, nodes that exist but don't render.

**How it's computed:** run `gui-optimizer` and measure its diff. The optimizer is already a deterministic, principled definition of "clean" — its 21 rules are the format's own answer to what messiness looks like. Inverting its output gives a structure score for free:

- Optimizer barely changes the file → high score.
- Optimizer rewrites significant portions → low score.

Each rule that fires is a named audit with a reason and an autofix already attached. The score report is the optimizer's stats read as a quality signal rather than a cleanup log.

Supplementary direct ratios (not covered by the optimizer): fraction of positioned nodes using auto-layout vs. absolute position, component reuse rate (duplicated subtrees that should be instances).

### Level 2 — Consistent

**What it measures:** does the file agree with itself? A design that uses 12 slightly-different spacing values, or 6 near-identical grays, is inconsistent. A token system where definitions and usages drift apart is inconsistent. Both are self-referential failures — no external reference needed to catch them.

**How it's computed — value entropy:**
- Count distinct spacing values, font sizes, color values, border radii. Cluster near-duplicates (`13` sitting alone among `8/16/24` is a smell). Flag outliers.
- Token coverage: what fraction of visual values (`fill`, `gap`, `font-size`, `radius`) reference `$tokens` vs. inline literals.
- Instance reuse: how many visually-identical subtrees exist as duplicated nodes vs. `<instance>` references.

**How it's computed — token audits (three distinct checks):**

**Token-usage coherence** — does the file use its own tokens? Three specific smells:
- Token defined but never referenced anywhere → dead token
- Inline value that exactly matches a defined token → missed reference
- Inline value that almost matches a token but differs slightly (`4` vs `6` when `$radius-sm = 4`) → silent drift

**Token semantic misuse** — is each token used for what it means? The token's name declares its category. Using it in the wrong property is a misuse:
- `$radius-sm` on `font-size` → wrong category
- `$color-border-primary` on `fill` → border token on a fill property
- `$spacing-gap-md` on `border-width` → wrong category

This check is best-effort today. It becomes fully powered when `.gui` formally adopts token categories (RFC-0038 / future token naming RFC). Once token types are declared, the check is exact: token type vs. property type, mismatch = audit.

**Token naming coherence** — do token names carry semantic intent? A name should declare what the token *means*, not what it *is*:
- `abc`, `hello-buddy`, `red`, `16px` → meaningless or appearance-based, not semantic
- `color-1`, `space-2`, `text-3` → enumerated, not semantic
- `color-background-primary`, `spacing-gap-md`, `radius-corner-sm` → good: category + variant

Well-structured names follow a `category-property-variant` pattern. This makes token semantic misuse checkable at scale — the name *is* the type declaration.

### Level 3 — Accessible

**What it measures:** can a human actually read and interact with this design? Visual accessibility failures are not document or interaction concerns — they are physical readability properties fully declared in the markup.

**Scope:** WCAG 2.2 visual criteria only — contrast ratios (1.4.3 minimum, 1.4.6 enhanced), non-text contrast (1.4.11), text spacing (1.4.12), and touch target size (2.5.5). Interaction and semantic criteria — keyboard navigation, ARIA roles, focus management, screen reader support — are out of scope per P5. `.gui` is a visual surface, not a document.

**How it's computed — all from markup, no rendering required:**
- **Contrast ratio** — `color` vs `fill` on `<text>` nodes. Compute luminance from both values, apply WCAG 2.2 ratio formula. Flag failures at both minimum (4.5:1 normal, 3:1 large) and enhanced (7:1 / 4.5:1) thresholds. Also flag `<text>` on gradient or image fills where contrast cannot be guaranteed — honest uncertainty per P15.
- **Font size minimum** — `font-size` below 12 on any `<text>` node is flaggable. Below 11 is a hard fail.
- **Touch target size** — on `platform="ios"` or `platform="android"` files, interactive-looking nodes (buttons, icon-only rows) with `w` or `h` below 44 fail WCAG 2.5.5.

Level 3 is **fully local and offline**, no corpus needed. It references APCA as the modern perceptual contrast algorithm and notes it as an alternative to WCAG's ratio formula for future versions.

### Level 4 — Conventional

**What it measures:** does the file compose UI using recognized, globally understood patterns — navigation bars, tab bars, card grids, list rows, modal dialogs — or does it reinvent them?

**How it's computed:** compare structural signatures against a pattern catalog maintained in gui.farm. A nav bar has a known shape in `.gui` markup: a `<row>` at the top level containing a logo, a set of links, and an action. The file either matches that signature or it doesn't.

```json
{ "score": 62, "audits": [
  { "pattern": "navigation-bar", "found": true,  "confidence": 0.94 },
  { "pattern": "tab-bar",        "found": false, "note": "bottom row resembles a tab bar but does not match signature" }
]}
```

This level requires the gui.farm corpus. It runs as a service call, not locally.

### Level 5 — Trend

**What it measures:** is this design current? Not just what visual language it speaks, but whether that language aligns with where design is *right now*. A file can be well-executed brutalism and still score low on Trend if brutalism is not a current movement in the reference corpus.

**How it's computed:** `.gui` is text, and visual style is explicitly declared in it. Attribute combinations, token naming patterns, spacing ratios, effect stacks, and typographic choices are unambiguous signals — no rendering required:

- `blur` + low-opacity `fill` + `glass` → glassmorphism
- tight spacing + hard borders + no radius + monospace font → brutalism
- `$surface`, `$primary` tokens + 8pt grid + soft shadow → material / clean modern
- wide letter-spacing + muted palette + thin borders + uppercase text → editorial / luxury
- heavy shadow stacks + saturated gradients → skeuomorphic

The file is fingerprinted against a labeled, temporally-aware library of `.gui` files on gui.farm. Each detected category gets a confidence score. The overall Trend score reflects alignment with currently active movements in the corpus.

```json
{ "score": 78, "audits": [
  { "category": "glassmorphism", "confidence": 0.81 },
  { "category": "editorial",     "confidence": 0.64 },
  { "category": "brutalism",     "confidence": 0.21 }
]}
```

**Cross-level effect on Consistent:** if multiple categories in Trend audits carry high confidence simultaneously — e.g. glassmorphism 0.81 and brutalism 0.79 — the file is stylistically split. This fires a consistency audit in Level 2: the design speaks two incompatible visual languages. A stylistically incoherent file scores low on both.

This is the `.gui` format's structural advantage over image-based tools: intent is explicit in the markup in a way it is never explicit in a screenshot. `fill="rgba(255,255,255,0.1)" blur="20"` is not ambiguous. A rendered pixel of frosted glass is. No rendering step, no vision model — pure text pattern matching.

## Reasoning

**The gate/score split** follows directly from P15 (honest semantics). Scoring an invalid file would imply the format tolerates partial conformance — it doesn't. Validity is binary; quality is a spectrum. Conflating them hides their different natures.

**Levels 1–3 are fully local and deterministic.** They require no corpus, no external service, no calibration against other files. Fast, offline, and trustworthy by the same standard the optimizer is trustworthy.

**The optimizer as structure scorer** is not a hack — it is the natural reading of work already done. The optimizer's rules are the format's own definition of structural quality. Using them as measurement rather than mutation costs nothing and avoids maintaining two definitions of "clean."

**Token audits are self-referential.** All three token checks (usage coherence, semantic misuse, naming coherence) judge the file against its own declared intent — no external standard required. Semantic misuse in particular becomes more powerful as the format's token category system matures, but it is useful now.

**WCAG visual criteria are platform-neutral.** Contrast ratios, font sizes, and touch target sizes are physical readability concerns that apply identically to iOS, Android, and web. Adopting WCAG 2.2 visual criteria does not import document semantics (P5) — it imports measurement thresholds for physical legibility.

**Text-based style fingerprinting** is only possible because `.gui` encodes intent explicitly (P4 — everything in the file means something). This approach is cheaper, more reliable, and more format-aligned than render-and-judge. The corpus is a collection of labeled `.gui` files — not images — so gui.farm's reference set stays in the format's own vocabulary.

**Separate scores, never blended.** A taste classification is not the same kind of claim as a structure score. Blending them into a single number fakes objectivity and violates P15. Each level is reported independently, with its audit list, so a consumer can decide which levels matter for their use case.

**QUALITY.md as the authority.** The scorer `gui-score` is an implementation. `core/spec/QUALITY.md` is the definition. Anyone can build a different scorer in any language or for any platform by reading `QUALITY.md` — same as anyone can build a renderer by reading `DOTGUI.md`. The tool is never the authority; the spec is.

## Alternatives Considered

**Render-and-judge with a vision model** — Considered for style scoring. Rejected. Requires a render step, a vision model, and produces outputs that can't be explained in terms of the file's own markup. The text-based fingerprint approach is more reliable, cheaper, and more honest about what it's measuring.

**One blended score** — Rejected. Collapses objective measurements (structure, consistency, accessibility) with subjective ones (style) into a single number, implying false precision. Each level is reported independently.

**Validity as a scored level** — Rejected. Validity is not a matter of degree. It is the gate, not the first rung.

**Baking style scoring into the deterministic core** — Rejected. Style requires a reference corpus and produces classifications, not measurements. It is explicitly opinion, not engineering. Keeping it in gui.farm and labeling it as such honors P15.

**WCAG full adoption** — Rejected. Interaction and semantic criteria (keyboard nav, ARIA, focus) are out of scope per P5. Only visual criteria are adopted.

## Drawbacks

- Levels 4–5 require gui.farm to be running and populated. A thin corpus produces low-confidence scores.
- The optimizer-as-scorer relationship means changes to optimizer rules affect Level 1 scores. The two tools are coupled in meaning, not just implementation.
- Token semantic misuse is best-effort until token categories are formally adopted. Files that use unstructured token names will produce weaker Level 2 audits.
- Contrast checking on gradient or image fills cannot be exact — the RFC honestly flags uncertainty rather than computing a false value.

## Unresolved Questions

- **Token category dependency** — token semantic misuse is best-effort today. When does the format formally adopt token categories (RFC-0038 / future naming RFC) such that the check becomes exact? The quality spec should version this capability.
- **Corpus threshold** — what is the minimum corpus size for Level 4 and Level 5 to return meaningful scores? Below that threshold, should the scorer return absent or a low-confidence flag?
- **gui.farm call mode** — should levels 4–5 be synchronous (blocking, returns full report) or async (submits, returns a job id)? Affects CLI and library design.
- **APCA adoption** — WCAG 2.2 uses a ratio formula; APCA is more perceptually accurate. At what point does Level 3 switch to APCA as the primary contrast algorithm?

## Implementation Notes

The scorer (`gui-score`) is a separate package consuming `validate.ts` and `gui-optimizer` as libraries. It ships in multiple forms — one package, many entry points:

- **JS library** — the core. Imported by the Figma plugin, gui-app, gui.farm, and any tool in the ecosystem.
- **CLI / npx** — `npx gui-score myfile.gui` for developers and CI pipelines.
- **Figma plugin** — consumes the JS library to show live scores during export, before the file is saved.
- **gui-app** — consumes the JS library to show scores alongside preview tiles in the grid.
- **gui.farm** — consumes the JS library to score every file on upload, powering the reference corpus for levels 4–5.

The JS library is the authority. The CLI, plugin, app, and farm integrations are thin wrappers around it. `core/spec/QUALITY.md` is what the library implements against — not the other way around.

It emits a structured report — every level uses the same envelope:

```json
{
  "clean":        { "score": 74, "audits": [...] },
  "consistent":   { "score": 88, "audits": [...] },
  "accessible":   { "score": 91, "audits": [...] },
  "conventional": { "score": 62, "audits": [...] },
  "trend":        { "score": 78, "audits": [...] }
}
```

Gate failures (invalid or broken refs) return an error before the report — never a zeroed score. If the gate fails, there is no report.

Audit shape per level:
- **Clean** — `{ rule, severity, path, why, autofixable }`. Autofixable audits delegate to `gui-optimizer`.
- **Consistent** — `{ check, severity, path, why, autofixable }`. Token audits include `{ token, defined-as, used-on }` for misuse findings.
- **Accessible** — `{ criterion, wcag-ref, severity, path, why, computed }`. e.g. `{ criterion: "contrast-ratio", wcag-ref: "1.4.3", computed: "3.1:1", required: "4.5:1" }`.
- **Conventional** — `{ pattern, found, confidence, note? }`.
- **Trend** — `{ category, confidence }`. Overall score reflects alignment with currently active movements in the gui.farm corpus.

Levels 1–3 (CCA) run locally. Levels 4–5 (CT) require `--remote <gui.farm endpoint>`. A caller that omits `--remote` gets a partial report with levels 4–5 absent, not zeroed.

The spec artifact this RFC produces is `core/spec/QUALITY.md`. It is the authority. `gui-score` is the reference implementation.
