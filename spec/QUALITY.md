# dotgui Quality

**What a good `.gui` file looks like.**

This document is the authority on quality for the dotgui format. It is the output of [RFC-0040](../rfcs/0040-quality-scoring-model.md). `gui-score` is the reference implementation — but any tool, in any language, on any platform, can implement against this spec.

The order of authority is:

```
PRINCIPLES.md   →  what the format must always be
DOTGUI.md       →  the format as it stands today
QUALITY.md      →  what a good file looks like       (this document)
gui-score       →  the reference implementation
```

---

## What this measures — and what it does not

**The score measures the file, not the design.**

This is the founding distinction, and getting it right is the whole point of this document. An HTML validator does not tell you whether a web page is a good-looking website — it tells you whether the HTML is well-built: valid, semantic, no dead markup, readable. dotgui scoring is the same kind of tool. It answers *"is this a good `.gui` file?"* — never *"is this a good design?"*

These are different questions with different owners:

- **Is this a good file?** Objective, stable, true for everyone, forever. Clean structure, self-agreement, physical legibility, self-description. → **This document.**
- **Is this good design?** Subjective, plural, ever-evolving. Beauty, composition, hierarchy, taste, what is current. → **Not scored.** That belongs to human judgement and to gui.farm's library of good examples.

The test for whether something belongs in the score:

> **Would another designer disagree? Would I disagree next year?**
> If yes, it is design taste — it is out. If it is true for everyone, always, it is a file property — it can be scored.

Every level below passes that test. Two consequences follow, and both are non-negotiable:

- **Zero-AI.** Pure rule evaluation over the parsed tree and fixed, declared vocabularies. Same input → same output. The same trustworthiness standard as the producing pipeline (P14, RFC-0010).
- **Fully local and offline.** No external service, no network, no corpus. The score is a self-contained package that runs with a file and nothing else. **gui.farm is not part of scoring** — it is a separate service for *creating* interfaces (ideation, examples, discovery), and it has no role in measuring file quality.

---

## The Gate

Before quality is measured, two conditions must hold. Both are binary — pass or fail, no score.

**Valid** — the file conforms to the dotgui spec. `core/schema/validate.ts` is the authority. A file that fails here is not a `.gui` file. It is not scored. It is rejected.

**Intact** — every reference in the file resolves:
- `$token` names exist in the `<tokens>` block
- Asset `src` values point to real files inside the package
- `component` ids on `<instance>` nodes match a declared `<component>`
- `detached-from` origins are traceable

A file can be syntactically valid and still be silently broken. Intact catches the breakage before scoring begins.

If either condition fails, return an error. There is no report.

---

## CCAC — The Four Levels

Quality is scored across four levels. **All four are local, deterministic, and zero-AI** — they run on the parsed tree and fixed vocabularies, with no external service.

```
C — Clean         is the file built without waste?
C — Consistent    does the file agree with itself?
A — Accessible    is the file physically legible?     (WCAG 2.2 visual criteria)
C — Comprehensible how AI-ready is the file as semantics? (core/roles vocabulary)
```

Every level emits the same output envelope:

```json
{ "score": 0–100, "audits": [...] }
```

What lives inside `audits` differs per level. The envelope never changes.

---

### C — Clean

**The question:** how much unnecessary work does the file contain?

A clean file earns every node. Layout is expressed as auto-layout, not absolute coordinates. Assets are deduplicated. Tokens are referenced, not inlined. No designer defends dead nodes or spacer hacks — this is a file property, not a taste call.

**How it is measured:**

Clean analyses the parsed tree directly. (It does not run the optimizer — the optimizer is the separate tool that can later *apply* the fixes Clean marks safe.) A node counts as **dead weight** only if it passes a **two-gate** test:

1. **Renders nothing** — no paint, or `visible=false` / `opacity=0` / zero-size / empty text.
2. **Removal is safe** — breaks no instance/component/mask contract, and does not move its siblings.

Gate 2 is **parent-aware**: under an auto-layout parent an `opacity=0` node still holds its slot, so removing it collapses the layout. That node is not dead weight — it is a **spacer hack** (use `gap`/padding), flagged but never silently deleted.

Buckets scored: **A** dead weight · **B** redundant wrappers · **C** hard-way layout (absolute positioning + spacer hacks). Each finding is a named audit with a severity, a path, a reason, and an autofix flag. Autofixable audits delegate to the optimizer.

**Audit shape:**
```json
{
  "rule": "redundant-wrapper",
  "severity": "warn",
  "path": "gui > col[0] > row[2]",
  "why": "wrapper adds nesting with no layout or visual purpose",
  "autofixable": true
}
```

---

### C — Consistent

**The question:** does the file agree with itself?

A consistent file uses the same spacing, the same type scale, the same color palette — and expresses them through tokens, not repeated inline literals. Its token system is coherent: tokens are defined, used, used correctly, and named with intent. Every check here is self-referential — the file judged against its own declared intent, no external standard.

**How it is measured — value entropy:**

Count distinct spacing values, font sizes, color values, border radii across the file. Cluster near-duplicates — a lone `13` among `8 / 16 / 24` is a smell. Flag outliers.

Token coverage: what fraction of visual properties (`fill`, `gap`, `font-size`, `radius`) reference `$tokens` vs. inline literals.

Instance reuse: how many visually-identical subtrees exist as duplicated nodes vs. `<instance>` references.

**How it is measured — three token audits:**

**Token-usage coherence** — does the file use its own tokens?
- Token defined but never referenced → dead token
- Inline value that exactly matches a defined token → missed reference
- Inline value that almost matches a token but differs slightly → silent drift

**Token semantic misuse** — is each token used for what its name declares?

The token's name is its type declaration. Using it on the wrong property is a misuse:
- `$radius-corner-sm` on `font-size` → wrong category
- `$color-border-primary` on `fill` → border token on a fill property
- `$spacing-gap-md` on `border-width` → wrong category

This check is best-effort until the format formally adopts token categories. Once token types are declared in the spec, the check becomes exact: token category vs. property category, mismatch = audit.

**Token naming coherence** — do token names carry semantic intent?

A name should declare what the token *means*, not what it *is*. Well-structured names follow `category-property-variant`:

| Name | Verdict |
|---|---|
| `abc`, `hello-buddy`, `red`, `16px` | Fail — meaningless or appearance-based |
| `color-1`, `space-2`, `text-3` | Fail — enumerated, not semantic |
| `color`, `spacing`, `radius` | Weak — category only, no variant |
| `color-background-primary` | Pass |
| `spacing-gap-md` | Pass |
| `radius-corner-sm` | Pass |

**Audit shape:**
```json
{
  "check": "token-semantic-misuse",
  "severity": "error",
  "path": "gui > tokens > $radius-corner-sm",
  "why": "token defined as radius category, used on font-size",
  "token": "$radius-corner-sm",
  "defined-as": "radius",
  "used-on": "font-size",
  "autofixable": false
}
```

---

### A — Accessible

**The question:** can a human physically read this design?

Accessibility here means visual and physical readability — contrast, legibility, reachability. It does not mean document or interaction accessibility (ARIA, keyboard navigation, focus management, screen reader support). Those are out of scope per P5: `.gui` is a visual surface, not a document.

This is the one level anchored to an *external* standard rather than the file itself. But the standard is not taste: no designer argues that 2:1 contrast becomes readable next year. WCAG thresholds are physical facts, so this level still passes the test.

**Standard:** WCAG 2.2 visual criteria only.

| Check | WCAG ref | Threshold |
|---|---|---|
| Text contrast (normal) | 1.4.3 | 4.5:1 minimum, 7:1 enhanced |
| Text contrast (large, ≥18pt or ≥14pt bold) | 1.4.3 | 3:1 minimum, 4.5:1 enhanced |
| Non-text contrast | 1.4.11 | 3:1 |
| Text spacing | 1.4.12 | line-height ≥ 1.5× font-size |
| Touch target size | 2.5.5 | 44×44pt minimum (iOS / Android files) |

**How it is measured — all from markup, no rendering required:**

- **Contrast** — compute luminance from `color` and `fill` on `<text>` nodes and apply the WCAG ratio formula. Flag `<text>` on gradient or image fills as uncertain — contrast cannot be guaranteed and is reported as such, not silently passed.
- **Font size** — `font-size` below 12 on any `<text>` node is flagged. Below 11 is a hard fail.
- **Touch targets** — on `platform="ios"` or `platform="android"` files, button-shaped or icon-only nodes with `w` or `h` below 44 fail 2.5.5.

APCA (Accessible Perceptual Contrast Algorithm) is noted as the modern alternative to WCAG's ratio formula and may replace it in a future version of this spec.

**Audit shape:**
```json
{
  "criterion": "contrast-ratio",
  "wcag-ref": "1.4.3",
  "severity": "error",
  "path": "gui > col[0] > text[3]",
  "why": "text contrast ratio is below the 4.5:1 minimum",
  "computed": "3.1:1",
  "required": "4.5:1",
  "autofixable": false
}
```

---

### C — Comprehensible

**The question:** how AI-ready is the file *as semantics* — how much meaning does it carry that an agent can translate into dev-ready code, with context?

The carrier of that meaning is the `role=` attribute ([RFC-0041](../rfcs/0041-role-attribute.md)). A role names what a structure *is* — nav-bar, tab-bar, card — the way `<nav>` does in HTML. An agent reading `role="tab-bar"` knows what it is looking at and can re-emit it into SwiftUI, into HTML with the right ARIA, into another tool. An anonymous `<row>` of boxes forces every consumer to guess.

**This is not a design judgement.** Comprehensible does *not* ask "is using a nav bar good design?" — an unconventional, convention-breaking design can be an excellent, highly-comprehensible *file*. It asks the **semantic-markup** question: *does the file say what it is?* Using `<nav>` does not make a page prettier; it makes the file **self-describing** — good practice, not good taste, and it does not change with fashion. (Renamed from *Conventional*, which wrongly implied "follows conventions"; the property is self-description / AI-readiness.)

**How it is measured — reach-coverage.**

The score is the fraction of the tree a declared role *documents*, where each role reaches only as far down its subtree as its **`reach`** allows. That bound is what makes coverage honest instead of gameable, and it keeps the score zero-AI: it is computed from two facts — *is there a role* and *how far is its reach* — never from a guess about which untagged node "should" have one.

Every role in `core/roles/` declares a `reach`:

| `reach` | covers | roles |
|---|---|---|
| `full` | the whole subtree (it's all the widget's anatomy) | every input, every menu, button, switch, slider, tab-bar, indicators… |
| `2` | a two-level grammar (group→item, row→cell) | table, tree, navigation-menu, carousel, gallery, sidebar |
| `1` | one chrome level; payload self-labels | card, dialog, drawer, accordion, toolbar, top-navigation-bar |

A node is **documented** if it has a role, or sits within the `reach` of some roled ancestor. **Comprehensible = documented ÷ content nodes** (the root canvas wrapper is excluded as scaffolding). Roles are read at **face value** — like SEO trusting a `<nav>`, the score does not check whether the structure "really looks like" its role.

Two failures of naive coverage are closed by `reach`: a lazy `role="card"` on the whole screen no longer claims 100% (it reaches one level); and a plain node lowers the score not because we *decided* it should be tagged, but because it factually sits beyond any declared role's reach. A wall of anonymous boxes scores low — a true statement about its translatability. (A page of `<div>` is valid but not self-described — which costs AI-readiness the way all-`<div>` markup costs SEO.)

There is **no inference of undeclared roles.** Suggesting a role for untagged structure belongs at *creation time* — the optimizer's opt-in `--annotate-roles` pass ([RFC-0041](../rfcs/0041-role-attribute.md)) — never in the score.

**Audit shape** — a plain inventory fact, one per declared role:
```json
{
  "role": "tab-bar",
  "path": "gui > col[0] > row[3]"
}
```

---

## Output

A passing gate followed by a full CCAC report:

```json
{
  "clean": {
    "score": 74,
    "audits": [
      { "rule": "redundant-wrapper", "severity": "warn", "path": "gui > col[0] > row[2]", "why": "...", "autofixable": true }
    ]
  },
  "consistent": {
    "score": 88,
    "audits": [
      { "check": "token-semantic-misuse", "severity": "error", "token": "$radius-corner-sm", "defined-as": "radius", "used-on": "font-size", "autofixable": false }
    ]
  },
  "accessible": {
    "score": 91,
    "audits": [
      { "criterion": "contrast-ratio", "wcag-ref": "1.4.3", "severity": "warn", "computed": "3.8:1", "required": "4.5:1", "autofixable": false }
    ]
  },
  "comprehensible": {
    "score": 78,
    "audits": [
      { "role": "top-navigation-bar", "path": "gui > col[0] > row[0]" },
      { "role": "card",               "path": "gui > col[0] > col[1]" },
      { "role": "tab-bar",            "path": "gui > col[0] > row[2]" }
    ]
  }
}
```

A gate failure returns an error — no report:

```json
{
  "error": "intact",
  "details": [
    { "ref": "$color-brand-primary", "type": "token", "path": "gui > col[0] > text[1]", "reason": "token not declared in <tokens> block" }
  ]
}
```

---

## What This Document Is Not

- **Not a design critic.** It measures the file, not the design. Beauty, composition, hierarchy, taste, and whether a design is *current* are out of scope — they are subjective, plural, and ever-evolving. That judgement belongs to humans and to gui.farm's library of good examples, never to this score.
- **Not a style guide.** It defines measurable file quality, not aesthetic preference.
- **Not a validator.** Conformance to the spec is the gate — `validate.ts` is the authority there.
- **Not a complete accessibility standard.** Only WCAG 2.2 visual criteria are in scope. Interaction and document accessibility are out of scope per P5.
- **Not dependent on gui.farm or any service.** All four levels run locally and offline. gui.farm helps people *create* interfaces; it plays no part in measuring quality.

---

## Versioning

This document tracks the format version. Breaking changes to scoring criteria — new levels, removed audits, changed thresholds — are proposed as RFCs and reflected here.

Current version: `0.2` (CCAC model, RFC-0040). The earlier CCACT model included a fifth level, **Trend**, which scored a design's fashion-alignment against a temporal corpus. Trend was removed (RFC-0040, 2026-06-17): fashion is not a file property, it changes year to year, and optimizing for it homogenizes the ecosystem. Style fingerprinting survives only as a gui.farm discovery facet, never as a score.
