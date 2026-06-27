---
rfc: 0040
title: Quality scoring model — CCAC
status: Proposed
introduced-in: 0.2
date: 2026-06-12
updated: 2026-06-17
---

# Quality Scoring Model — CCAC

## Context

There is no formal definition of what makes a *good* `.gui` file. The format has a validity gate (`validate.ts`) and a cleanup tool (the optimizer), but neither answers the question: "given a valid file — how good is it?"

The question is easy to ask badly. "Good" slides immediately toward *good design* — is this a beautiful, well-composed, on-trend screen? That is the wrong question for this layer, and answering it is the single most important thing this RFC gets right.

**The score measures the file, not the design.** This is the founding distinction. An HTML validator does not tell you whether a web page is a good-looking website — it tells you whether the HTML is well-built: valid, semantic, no dead markup, accessible. `.gui` scoring is the same kind of tool. It asks *"is this a good `.gui` file?"* — never *"is this a good design?"* The two are different questions with different owners, and conflating them is the failure this RFC exists to prevent.

This matters for two reasons. First, the primary author of `.gui` is increasingly an AI (P7) — and an AI needs a clear, objective optimization target, not a moving aesthetic one. Second, *good design* is subjective and ever-evolving: a principle one designer holds today, another rejects, and the same designer may abandon tomorrow. A score built on it would be neither stable nor trustworthy. So the score deliberately stays on the side of properties that are true regardless of who is looking or what year it is.

> **The test for every level:** *Would another designer disagree? Would I disagree next year?* If yes, it is design taste — it does not belong in the score. If it is true for everyone, always, it is a file property — it can be scored.

### Revision (2026-06-17)

This RFC originally proposed a five-level model, **CCACT**, whose fifth level — **Trend** — scored how *fashionable* a design was against a temporal corpus on gui.farm. Trend is **removed**. It failed the test above: fashion is the definition of a thing that changes year to year and that designers disagree on. The model is now **CCAC** — four levels, all local, all deterministic, all measuring the file. See *Alternatives Considered → Trend as a scored level*. The fourth level was also re-scoped and renamed: the old **Conventional** (match a remote pattern catalog, with inferred-role confidence scores) is now **Comprehensible** — a local, inference-free measure of how AI-ready the file is *as semantics*, scored by **reach-coverage** over its declared `role=` anchors (see Level 4).

## Decision

Quality is a **gate followed by a score**. A file that fails the gate is not a `.gui` file — it is not scored, it is rejected. A file that passes the gate is scored across four levels — **CCAC**:

| Level | Name | Measures | AI? | Corpus? |
|---|---|---|---|---|
| C | Clean | Is the file built without waste? | None | No |
| C | Consistent | Does the file agree with itself? | None | No |
| A | Accessible | Is the file physically legible? | None | No |
| C | Comprehensible | How AI-ready is the file as semantics? | None | No |

All four levels share three properties, and these are non-negotiable:

1. **They measure the file, not the design.** None of them passes judgement on taste, beauty, layout quality, or whether the design is current. (Litmus: the test in *Context*.)
2. **They are zero-AI.** Pure rule evaluation over the parsed tree and over fixed, declared vocabularies (`core/roles/`, the token block, WCAG thresholds). Same input → same output, every time. This is the same trustworthiness standard as the producing pipeline (P14, [RFC-0010](0010-no-ai-in-pipeline.md)).
3. **They are fully local and offline.** No external service, no network call, no corpus. The score is a self-contained package a CLI, a Figma plugin, or an app can run with a file and nothing else.

Every level emits the same envelope: `{ "score": 0–100, "audits": [...] }`. What lives inside `audits` differs per level, but the shape is always identical — predictable and easy to consume across all entry points.

The output of this RFC is `core/spec/QUALITY.md` — a living definition of what a good `.gui` file looks like, sitting alongside `spec/DOTGUI.md`. Any scorer can implement against it. `gui-score` is the reference implementation.

### gui.farm is not part of scoring

gui.farm is a separate service that helps people *create* interfaces — a library of good examples for ideation, discovery, and reference, consumed by the CLI and the kit during authoring. It plays **no part in measuring file quality.** Scoring never calls it, never depends on it, and the core never mentions it. A design's *style* (glassmorphism, brutalism, editorial) and its *currency* (what is trending) are real things gui.farm can describe and search over — as discovery facets, not grades — but they are not file-quality and are out of scope here. This separation is what keeps the score stable, offline, and honest.

### Gate — conformance + referential integrity

Before any scoring, two conditions must hold:

1. **Valid** — the file conforms to the dotgui spec. `validate.ts` is the authority. If this fails, stop.
2. **Intact** — every reference resolves: `$token` names exist in the token block, asset `src` values point to real files in the package, `component` ids on instances match a declared `<component>`, `detached-from` origins are traceable. A file can be structurally valid and still be silently broken for its core job (P1 — round-trip is a first-class constraint).

Both conditions are binary. Neither is a score. Together they are the entry condition for scoring.

### Level 1 — Clean

**What it measures:** how much unnecessary work the file contains — absolute positioning where auto-layout would do, redundant wrappers, duplicated assets, nodes that exist but don't render.

No designer defends dead nodes or load-bearing spacer hacks; this is a file property, not a taste call. Clean analyses the parsed tree directly — it does not run the optimizer, though the optimizer is the separate tool that can later *apply* the fixes Clean marks safe.

A node counts as dead weight only if it passes a **two-gate** test: it renders nothing **and** removing it is safe (breaks no instance/component/mask contract and does not move its siblings). Gate two is parent-aware: under an auto-layout parent an `opacity=0` node still holds its slot, so it is not dead weight — it is a *spacer hack* (use `gap`/padding), never silently deleted. Buckets scored: **A** dead weight · **B** redundant wrappers · **C** hard-way layout (absolute positioning + spacer hacks).

Each finding is a named audit with a reason and an autofix flag. Autofixable audits delegate to the optimizer.

### Level 2 — Consistent

**What it measures:** does the file agree with itself? A design that uses 12 slightly-different spacing values, or 6 near-identical grays, is inconsistent. A token system where definitions and usages drift apart is inconsistent. Both are self-referential failures — no external reference needed to catch them, and no taste call involved.

**How it's computed — value entropy:**
- Count distinct spacing values, font sizes, color values, border radii. Cluster near-duplicates (`13` sitting alone among `8/16/24` is a smell). Flag outliers.
- Token coverage: what fraction of visual values (`fill`, `gap`, `font-size`, `radius`) reference `$tokens` vs. inline literals.
- Instance reuse: how many visually-identical subtrees exist as duplicated nodes vs. `<instance>` references.

**How it's computed — token audits (three distinct checks):**

**Token-usage coherence** — does the file use its own tokens? Dead token (defined, never referenced); missed reference (inline value exactly matching a token); silent drift (inline value almost matching a token).

**Token semantic misuse** — is each token used for what its name declares? `$radius-sm` on `font-size`, `$color-border-primary` on `fill`. Best-effort today; exact once the format formally adopts token categories (RFC-0038 / future naming RFC).

**Token naming coherence** — do names carry intent? `color-1`/`red`/`16px` fail; `color-background-primary`/`spacing-gap-md` pass. A `category-property-variant` name *is* a type declaration, which makes semantic misuse checkable at scale.

### Level 3 — Accessible

**What it measures:** can a human physically read the design? Visual accessibility failures are physical readability properties fully declared in the markup. This is the one level anchored to an *external* standard rather than the file itself — but the standard (WCAG) is not a matter of taste or fashion. No designer legitimately argues that 2:1 contrast becomes readable next year. It passes the test.

**Scope:** WCAG 2.2 visual criteria only — contrast (1.4.3, 1.4.6), non-text contrast (1.4.11), text spacing (1.4.12), touch target size (2.5.5). Interaction and semantic criteria (keyboard nav, ARIA, focus) are out of scope per P5. `.gui` is a visual surface, not a document.

**How it's computed — all from markup, no rendering required:**
- **Contrast ratio** — `color` vs `fill` on `<text>` nodes via the WCAG formula. Flag `<text>` on gradient/image fills as uncertain — honest about what it cannot guarantee (P15).
- **Font size minimum** — below 12 is flaggable; below 11 is a hard fail.
- **Touch target size** — on `platform="ios"`/`platform="android"`, interactive-looking nodes below 44 fail 2.5.5.

Level 3 references APCA as the modern perceptual alternative to WCAG's ratio formula for future versions.

### Level 4 — Comprehensible

**What it measures:** how **AI-ready** is this file *as semantics* — how much meaning does it carry that an agent can translate into dev-ready code, with context? The carrier of that meaning is the `role=` attribute ([RFC-0041](0041-role-attribute.md)): a role names what a structure *is* — nav-bar, tab-bar, card — the way `<nav>` does in HTML. An agent reading `role="tab-bar"` knows what it is looking at and can re-emit it correctly into SwiftUI, into HTML with the right ARIA, into another tool. An anonymous `<row>` of boxes forces every consumer to guess.

This is the level most at risk of being mistaken for a design judgement, so the framing matters. Comprehensible does **not** ask *"is using a nav bar good design?"* — an unconventional, convention-breaking design can be a perfectly good, highly-comprehensible *file*. It asks the semantic-markup question: *does the file say what it is?* Using `<nav>` does not make a page prettier; it makes the file **self-describing**. That is good practice, not good taste, and it does not change with fashion. (The earlier name for this level was *Conventional* — renamed because "conventional" implied following conventions, when the property is really self-description / AI-readiness.)

**How it's computed — reach-coverage.** The score is the fraction of the tree that a declared role *documents* — but "documents" is bounded by each role's **`reach`**, which is what makes coverage honest instead of gameable.

Every role in `core/roles/` declares a `reach` ([RFC-0041](0041-role-attribute.md)) — how far down its own subtree its meaning reaches:

- **`full`** — the whole subtree is the role's own anatomy. Self-contained widgets: every input, every menu, `button`, `switch`, `tab-bar`, indicators. You would never tag a separate component *inside* one.
- **`2`** — a two-level internal grammar (group→item, row→cell): `table`, `tree`, `navigation-menu`, `carousel`, `gallery`, `sidebar`.
- **`1`** — one chrome level, then the payload carries its own roles: `card`, `dialog`, `drawer`, `accordion`, `toolbar`, `top-navigation-bar`.

A node is **documented** if it has a role, or sits within the `reach` of some roled ancestor. **Comprehensible = documented nodes ÷ content nodes** (the root canvas wrapper is excluded — it is scaffolding, not content). The audits are a plain inventory — `{ role, path }`, one per declaration. No severity, no `why`, no autofix: a declared role is not a *problem*, it just *is*.

`reach` is the answer to the gaming objection that sinks naive coverage: a lazy `role="card"` on the whole screen no longer claims 100% — at `reach: 1` it documents one level and the deep tree stays uncovered. And it is still **inference-free**: roles are read at face value and reach is read from the catalog. A plain node is not "missing" a role — it is simply outside any role's reach, a fact about the tree, not a guess about what should have been tagged. (This mirrors HTML: a page of `<div>` is valid but not self-described — which costs AI-readiness the way all-`<div>` markup costs SEO.)

There is **no inference of undeclared roles** here. Suggesting a role for untagged structure is genuinely useful, but it belongs at **creation time** — the optimizer's opt-in `--annotate-roles` pass ([RFC-0041](0041-role-attribute.md)) — never in the score.

```json
{ "score": 82, "audits": [
  { "role": "top-navigation-bar", "path": "gui > col[0] > row[0]" },
  { "role": "card",               "path": "gui > col[0] > col[1]" },
  { "role": "tab-bar",            "path": "gui > col[0] > row[2]" }
]}
```

## Reasoning

**The score measures the file, not the design.** This is the load-bearing decision of the whole RFC. Good design is subjective, plural, and ever-evolving; a score built on it would be a different number for every designer and a different number every year. A `.gui` validator is an HTML-validator analogue, not a design critic. Every level is chosen to survive the test *"would another designer disagree, or would I disagree next year?"* — and any candidate signal that fails it is pushed out of the score entirely.

**The gate/score split** follows from P15 (honest semantics). Scoring an invalid file would imply the format tolerates partial conformance — it doesn't. Validity is binary; quality is a spectrum. Conflating them hides their different natures.

**All four levels are local, deterministic, zero-AI, offline.** No corpus, no external service, no calibration against other files. Fast, offline, and trustworthy by the same standard the producing pipeline is trustworthy (P14, RFC-0010). This is only possible because every signal is read from the file itself or from fixed, declared vocabularies — the parsed tree, the token block, WCAG thresholds, and the `core/roles/` catalog.

**Comprehensible is self-description / AI-readiness, not convention-following.** The genuinely file-relevant signal is whether the file *labels* its recognized structures so an agent can translate them, not whether it *uses fashionable* ones. RFC-0041 put the `role=` vocabulary in `core/roles/` (local), so this level needs no remote corpus — the earlier "gui.farm pattern catalog" framing is superseded. A self-describing file is a portable, AI-ready file; that is an engineering property, measurable and stable.

**Reach-coverage is coverage made honest — and it stays inference-free.** Naive coverage ("roles ÷ nodes") has two failures: it can't pick a denominator without guessing which nodes *should* be tagged (inference), and a single role on the root would claim the whole tree (gaming). Per-role `reach` fixes both. A role documents only as far down as its catalog reach allows, so coverage is computed from two facts — *is there a role* and *how far does its reach go* — never from a guess about what is missing. A plain node outside every role's reach lowers the score not because we decided it *should* have a role, but because it factually sits beyond the meaning any declared role carries. The lazy-root-tag exploit dies: `card` reaches one level, not the whole screen. And resemblance matching — inferring a role for an untagged node — is still refused; that lives in the optimizer's `--annotate-roles` authoring pass, never the score. Same move that kept Trend and gui.farm out: the assumption-heavy part is an authoring helper; the score reads facts (roles + their declared reach).

**Token audits are self-referential.** All three judge the file against its own declared intent — no external standard. Semantic misuse sharpens as the token category system matures, but is useful now.

**WCAG visual criteria are platform-neutral and not taste.** Contrast, font size, and touch target are physical readability concerns identical across iOS, Android, and web. Adopting them does not import document semantics (P5) — it imports measurement thresholds, which no designer disputes.

**Separate scores, never blended.** Each level is a different kind of claim. A single blended number fakes precision and hides *which* property is weak. Each level is reported independently, with its audit list, so a consumer decides which levels matter.

**QUALITY.md is the authority.** `gui-score` is an implementation. `core/spec/QUALITY.md` is the definition — anyone can build a different scorer in any language by reading it, exactly as anyone can build a renderer by reading `DOTGUI.md`.

## Alternatives Considered

**Trend as a scored level (the original fifth level)** — Rejected, and removed in the 2026-06-17 revision. Trend scored how well a design aligned with *currently active* visual movements in a temporal corpus. It fails the founding test on every count:
- **It is a property of the corpus, not the file.** The same unchanged file scores differently next month. A number that moves when the artifact doesn't is measuring market fit, not quality — a category error inside a quality model.
- **It is the definition of taste that changes year to year.** A well-executed brutalist file scoring low because brutalism is "not current" punishes a perfectly good file for being unfashionable. No consumer has a sane action on that, and "make it trendier" is not actionable feedback the way "contrast 3.1:1, needs 4.5:1" is.
- **Optimizing for it harms the ecosystem.** If AI authors optimize toward Trend, the corpus homogenizes — every file converges on whatever is currently popular, narrowing the corpus, which tightens the trend, in a feedback loop. It is the one metric that makes the ecosystem *worse* as files "improve."
- **Its only quality-bearing output already lives elsewhere.** The one objective signal from style fingerprinting — a *stylistically split* file (glassmorphism 0.81 **and** brutalism 0.79 simultaneously) — is a self-referential consistency defect, and belongs to Consistent, not to a fashion score.

*What to do instead:* the underlying text-based style fingerprinting is genuinely useful — but as a **gui.farm discovery facet** (search and cluster by style: "show me glassmorphism dashboards"), and as a corpus-level *observation* ("glassmorphism rising"), never as a grade on a file. It describes; it does not judge. It lives in gui.farm, out of the score.

**Render-and-judge with a vision model** — Rejected. Requires a render step and a vision model and produces outputs that can't be explained in terms of the file's own markup. Text-based analysis is more reliable, cheaper, and honest about what it measures — and stays zero-AI (P14).

**One blended score** — Rejected. Collapses different kinds of claim into a single number, implying false precision and hiding which property is weak.

**Validity as a scored level** — Rejected. Validity is not a matter of degree. It is the gate, not the first rung.

**A remote corpus for Comprehensible** — Rejected (and superseded by RFC-0041). The `role=` vocabulary is the local `core/roles/` catalog. A network dependency would make the score slower, non-offline, and would re-introduce exactly the corpus coupling Trend's removal eliminated. Keep all four levels local.

**Naive coverage (roles ÷ all nodes)** — Rejected. A flat ratio over every node implies the denominator is "every node should be tagged," which is false (rows, text, leaves never should) and would require inferring which untagged nodes deserve a role. It also lets a single root tag claim the whole tree. *Adopted instead:* reach-coverage — each role documents its subtree only as far as its catalog `reach`, so the denominator is real (nodes within some role's reach) and the root-tag exploit is closed.

**Saturating count `100·(1−e^(−n/2))`** — Considered, then superseded (this revision). An earlier cut scored the raw *count* of declared roles through a saturating curve — deliberately *not* coverage, to dodge the denominator problem. It worked but couldn't tell "three roles is all this screen needed" from "three roles, fifteen structures left untagged," and gave a 6-node screen and a 600-node screen the same score for the same count. Per-role `reach` solved the denominator problem coverage couldn't, so reach-coverage replaces the count: it is size-aware (a big undocumented screen scores lower) without the gaming or inference the count was avoiding.

**Inferring undeclared roles in the score** — Rejected. The original Conventional design ran structural signature matching on *untagged* nodes and emitted "this resembles a tab bar, 0.61 confidence." A confidence float is judgment by resemblance — soft matching that wants a model, violating the zero-AI guarantee. *What to do instead:* role suggestion for untagged structure lives in the optimizer's opt-in `--annotate-roles` creation-time pass (RFC-0041), where an assumption is a help to the author, not a grade on the file.

**Plausibility-checking declared roles (does this `role="tab-bar"` look like one?)** — Rejected, on the same HTML-semantics logic as SEO. SEO does not verify a `<nav>` "looks navigational" — if the author tagged it, it is nav. Likewise the score takes a declared role at face value. Checking whether the structure "really matches" is inference wearing a binary costume, and it imports exactly the resemblance judgement we excluded. The score inventories declared roles; it does not audit their shape.

**WCAG full adoption** — Rejected. Interaction and semantic criteria (keyboard nav, ARIA, focus) are out of scope per P5. Only visual criteria are adopted.

## Drawbacks

- The optimizer-as-meaning relationship means changes to the optimizer's definition of "clean" affect how Clean reads. The two tools are coupled in meaning, even though Clean no longer runs the optimizer.
- Token semantic misuse is best-effort until token categories are formally adopted. Files with unstructured token names produce weaker Level 2 audits.
- Contrast checking on gradient or image fills cannot be exact — the scorer flags uncertainty rather than computing a false value (P15).
- Comprehensible depends on `core/roles/` being maintained — a recognized structure with no role file has no canonical name to be tagged with. The catalog is a deliberate, curated artifact, not auto-derived from usage.
- Comprehensible scores un-annotated files low (a file with no `role=` lands near 0), including older files authored before roles existed. This is the honest signal — they genuinely carry little machine-readable semantics — and it is also the incentive to run the optimizer's `--annotate-roles` pass. It is not a defect, but it will visibly pull the headline on legacy files until they are annotated.

## Implementation Notes

The scorer (`gui-score`) ships as one package, many entry points — a JS library at the core, imported by a CLI/npx wrapper, the Figma plugin, gui-app, and gui.farm. **All four levels run locally; there is no `--remote` mode and no corpus call.** gui.farm consumes the library to score uploads like any other consumer — it does not *power* scoring.

Every level uses the same envelope:

```json
{
  "clean":        { "score": 74, "audits": [...] },
  "consistent":   { "score": 88, "audits": [...] },
  "accessible":   { "score": 91, "audits": [...] },
  "comprehensible": { "score": 63, "audits": [...] }
}
```

Gate failures (invalid or broken refs) return an error before the report — never a zeroed score.

Audit shape per level:
- **Clean** — `{ rule, severity, path, why, autofixable }`. Autofixable audits delegate to the optimizer.
- **Consistent** — `{ check, severity, path, why, autofixable }`. Token audits include `{ token, defined-as, used-on }`.
- **Accessible** — `{ criterion, wcag-ref, severity, path, why, computed, required }`.
- **Comprehensible** — `{ role, path }`. A plain inventory: one fact per declared `role=`. No `severity`/`why`/`autofixable` — these are *facts*, not findings, so they carry none of the problem-metadata the other three levels do. The level's `score` is reach-coverage: documented nodes ÷ content nodes, where a node is documented if it sits within the `reach` of some roled ancestor-or-self (reach from `core/roles/`). (The optimizer's `--annotate-roles` creation-time pass, RFC-0041, is where undeclared structure gets *suggested* a role — separate from the score.)

The spec artifact this RFC produces is `core/spec/QUALITY.md`. It is the authority. `gui-score` is the reference implementation.

## Unresolved Questions

- **Token category dependency** — token semantic misuse is best-effort until the format formally adopts token categories (RFC-0038 / future naming RFC). The quality spec should version this capability.
- **Per-role `reach` calibration** — the catalog assigns `full`/`2`/`1` by role kind (RFC-0041). A handful are judgment calls (card 1 vs 0; popover full vs 1; toolbar/top-navigation-bar 1 vs 2). These want tuning against real annotated files, but the *mechanism* (reach lives on the role, the scorer reads it) is settled.
- **Root exclusion** — the score excludes the root canvas wrapper from the denominator (it is scaffolding). Should the next layer of structural scaffolding (a top-level `<col>` that only groups) also be excluded, or is leaving it counted-and-undocumented the honest signal? Currently counted.
- **APCA adoption** — at what point does Level 3 switch from the WCAG ratio formula to APCA as the primary contrast algorithm?
- **Hierarchy and other design properties** — emphasis/hierarchy, grouping, and alignment were considered as candidate levels. They were left out because they edge into design taste (the test in *Context*). If a strictly file-property formulation of any of them is found, it can be proposed as a future level — but the default is that "good design" signals belong to gui.farm's example library, not the score.
