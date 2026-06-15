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

## CCACT — The Five Levels

Quality is scored across five levels, ordered from most to least objective. The first three are fully local and deterministic. The last two require the gui.farm corpus.

```
C — Clean         local, deterministic
C — Consistent    local, deterministic
A — Accessible    local, deterministic (WCAG 2.2 visual criteria)
C — Conventional  remote, gui.farm corpus
T — Trend         remote, gui.farm corpus + temporal data
```

Every level emits the same output envelope:

```json
{ "score": 0–100, "audits": [...] }
```

What lives inside `audits` differs per level. The envelope never changes.

---

### C — Clean

**The question:** how much unnecessary work does the file contain?

A clean file is one the optimizer barely touches. Every node earns its place. Layout is expressed as auto-layout, not absolute coordinates. Assets are deduplicated. Tokens are referenced, not inlined.

**How it is measured:**

Run `gui-optimizer` and read its diff as a quality signal — not a cleanup log. The optimizer's 21 rules are the format's own definition of structural messiness. Inverting them gives a structure score:

- Optimizer barely changes the file → high Clean score
- Optimizer rewrites significant portions → low Clean score

Each fired rule becomes a named audit with a severity, a path, a reason, and an autofix flag. Autofixable audits delegate directly to the optimizer.

Supplementary ratios (not covered by optimizer rules):
- Fraction of positioned nodes using auto-layout vs. absolute position
- Component reuse rate — duplicated subtrees that should be `<instance>` references

**Audit shape:**
```json
{
  "rule": "rule-02-flatten-wrappers",
  "severity": "warn",
  "path": "gui > col[0] > row[2]",
  "why": "wrapper adds nesting with no layout or visual purpose",
  "autofixable": true
}
```

---

### C — Consistent

**The question:** does the file agree with itself?

A consistent file uses the same spacing, the same type scale, the same color palette — and expresses them through tokens, not repeated inline literals. Its token system is coherent: tokens are defined, used, used correctly, and named with intent.

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

**Cross-level signal from Trend:** if Level 5 (Trend) detects multiple style categories with high confidence simultaneously — e.g. glassmorphism 0.81 and brutalism 0.79 — the file is stylistically split. This fires a Consistent audit: the design speaks two incompatible visual languages.

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

**The question:** can a human actually read and interact with this design?

Accessibility here means visual and physical readability — contrast, legibility, reachability. It does not mean document or interaction accessibility (ARIA, keyboard navigation, focus management, screen reader support). Those are out of scope per P5: `.gui` is a visual surface, not a document.

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

### C — Conventional

**The question:** does the file use recognized UI patterns, or does it reinvent them?

A conventional file builds navbars like navbars, card grids like card grids, tab bars like tab bars. Pattern recognition is not prescriptive — a file can score low on Conventional and still be excellent. But low Conventional is a signal worth surfacing.

**How it is measured:**

Compare structural signatures in the file against a pattern catalog maintained on gui.farm. A navigation bar has a known shape in `.gui` markup — a `<row>` near the top of the tree containing a logo node, a set of link-like nodes, and an action node. The file either matches that signature or it doesn't.

This level requires the gui.farm corpus. It runs as a remote service call. Omitting `--remote` leaves this level absent from the report — not zeroed.

**Audit shape:**
```json
{
  "pattern": "navigation-bar",
  "found": true,
  "confidence": 0.94
}
```
```json
{
  "pattern": "tab-bar",
  "found": false,
  "confidence": 0.61,
  "note": "bottom row resembles a tab bar but does not match signature"
}
```

---

### T — Trend

**The question:** is this design current?

Not just what visual language the file speaks — but whether that language is where design is *right now*. A well-executed brutalist file can score low on Trend if brutalism is not an active movement in the current corpus. Trend is not a measure of taste; it is a measure of temporal alignment.

**How it is measured:**

`.gui` is text, and visual style is explicitly declared in it. No rendering required. Attribute combinations, token naming patterns, spacing ratios, effect stacks, and typographic choices are unambiguous signals:

| Signals in markup | Style category |
|---|---|
| `blur` + low-opacity `fill` + `glass` | glassmorphism |
| tight spacing + hard borders + no radius + monospace font | brutalism |
| `$surface` / `$primary` tokens + 8pt grid + soft shadow | material / clean modern |
| wide letter-spacing + muted palette + thin borders + uppercase text | editorial / luxury |
| heavy shadow stacks + saturated gradients | skeuomorphic |

The file is fingerprinted against a labeled, temporally-aware library of `.gui` files on gui.farm. Each detected category gets a confidence score. The overall Trend score reflects alignment with currently active movements in the corpus.

Multiple high-confidence categories detected simultaneously — e.g. glassmorphism 0.81 and brutalism 0.79 — indicate a stylistically split file. This fires a cross-level audit in Consistent (see above).

This level requires the gui.farm corpus with temporal metadata. Omitting `--remote` leaves this level absent — not zeroed.

**Audit shape:**
```json
{ "category": "glassmorphism", "confidence": 0.81 }
{ "category": "editorial",     "confidence": 0.64 }
{ "category": "brutalism",     "confidence": 0.21 }
```

---

## Output

A passing gate followed by a full CCACT report:

```json
{
  "clean": {
    "score": 74,
    "audits": [
      { "rule": "rule-02-flatten-wrappers", "severity": "warn", "path": "gui > col[0] > row[2]", "why": "...", "autofixable": true }
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
  "conventional": {
    "score": 62,
    "audits": [
      { "pattern": "navigation-bar", "found": true,  "confidence": 0.94 },
      { "pattern": "tab-bar",        "found": false, "confidence": 0.61 }
    ]
  },
  "trend": {
    "score": 78,
    "audits": [
      { "category": "glassmorphism", "confidence": 0.81 },
      { "category": "editorial",     "confidence": 0.64 },
      { "category": "brutalism",     "confidence": 0.21 }
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

- **Not a style guide.** It defines measurable quality, not aesthetic preference.
- **Not a validator.** Conformance to the spec is the gate — `validate.ts` is the authority there.
- **Not a complete accessibility standard.** Only WCAG 2.2 visual criteria are in scope. Interaction and document accessibility are out of scope per P5.
- **Not a trend oracle.** Trend scores reflect the gui.farm corpus at the time of scoring. They change as the corpus grows and the design landscape shifts.

---

## Versioning

This document tracks the format version. Breaking changes to scoring criteria — new levels, removed audits, changed thresholds — are proposed as RFCs and reflected here.

Current version: `0.2` (CCACT model, RFC-0040)
