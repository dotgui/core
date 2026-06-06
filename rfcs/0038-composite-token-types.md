---
rfc: 0038
title: Composite token types — shadow, typography, border, and aliases
status: Draft
targets: 1.0
date: 2026-06-06
---

# Composite Token Types — Shadow, Typography, Border, and Aliases

## Context

RFC-0005 shipped three scalar token types — `color`, `number`, `string` — and
explicitly deferred two things to a future version:

- **Composite tokens** — tokens whose value is a *structure* of several
  sub-properties (shadow, typography, border), not a single scalar.
- **Token aliases** — a token whose value references another token.

Both align with the W3C Design Tokens Community Group model, which RFC-0005 named
as deferred.

This belongs in 1.0 for the same reason as RFC-0037: composite values change the
token *value model*, which is a breaking change to `<tokens>`. A design system's
shadow/type/border primitives are part of its visual definition. Adding them
after the freeze would break the token model, so they must land before 1.0.

The non-trivial part is not the syntax — it is **reconciliation with constructs
the format already ships**:

- typography composite vs. the existing `<text-style>` / `<styles>` block
- shadow composite vs. the ordered effects stack (RFC-0027)
- border composite vs. the stroke/border model (RFC-0022, RFC-0025)

These overlaps are the substance of this RFC.

## Decision

> **Status: direction agreed, syntax and the reconciliation questions are not yet
> locked. The shapes below are leading candidates.**

Add composite token types whose values are structured, referenced by `$name` like
any token, and applied to the appearance properties they correspond to. Add token
aliases (token-to-token references).

### Composite shapes (leading candidates)

```xml
<tokens>
  <!-- shadow: one or more layers -->
  <shadow name="card">
    <layer x="0" y="2" blur="8" spread="0" color="rgba(0,0,0,0.10)" />
  </shadow>

  <!-- typography: a full type definition -->
  <typography name="body"
    font-family="Inter" font-size="16" font-weight="400" line-height="24" />

  <!-- border: width + style + color -->
  <border name="hairline" width="1" style="solid" color="$gray-200" />

  <!-- alias: a token whose value is another token -->
  <color name="surface" value="$bg" />
</tokens>
```

### Application (leading candidate)

```xml
<frame shadow="$card" border="$hairline" />
<text text-style="$body" value="Hello" />
```

## Reasoning

- **It is a visual primitive.** Shadow/type/border tokens describe how the UI
  looks; they belong to the 1.0 visual layer.
- **It must precede the freeze.** Composite values change the token value model —
  a breaking change to `<tokens>`.
- **W3C alignment without JSON.** Adopt the W3C *model* (composite `$type`/`$value`
  semantics, aliasing) while keeping dotgui's XML syntax. This honors the
  "deferred W3C format" note in RFC-0005 without importing JSON.
- **Aliases ride along.** Composite values frequently need to reference scalar
  tokens (a shadow's color, a border's color), so token-to-token references are a
  natural part of the same change.

## Alternatives Considered

**Keep everything inline (no composite tokens)** — Rejected. A repeated shadow or
type ramp loses its semantic identity; a code generator sees five identical
shadow literals instead of one `$card` shadow.

**Full W3C JSON token format** — Rejected. dotgui is XML (RFC-0001); importing
JSON token files as a parallel syntax fractures the format. Adopt the model, not
the serialization.

**Defer to post-1.0** — Rejected. Breaking change to the token model after the
freeze. See Context.

## Unresolved Questions

1. **typography token vs. `<text-style>`** — the `<styles>` block already captures
   full typography. This RFC must decide the canonical path:
   (a) composite `typography` tokens **replace** `<text-style>`,
   (b) they **coexist** with a defined relationship, or
   (c) `<text-style>` is **redefined as** a composite token.
   This is the most important open question — shipping two blessed ways is not
   acceptable for 1.0.
2. **shadow token vs. effects stack (RFC-0027)** — does a `shadow` token produce a
   single effect, a layer in the stack, or the whole stack? How does `shadow="$card"`
   compose with inline effects on the same node?
3. **border token vs. border model (RFC-0022 / 0025)** — reconcile with per-side
   borders and ordered border stacks. Can a `border` token express multi-side /
   stacked borders, or only the simple case?
4. **W3C `$type` fidelity** — how closely to track the W3C composite type
   definitions (e.g. their `shadow`, `typography`, `border`, `transition` types)
   and naming.
5. **Alias depth and cycles** — is alias-to-alias allowed? How deep? Cycle
   detection.
6. **Mode interaction (RFC-0037)** — RFC-0037 covers **scalar tokens only**
   (color/number/string) and deliberately does not define per-mode composite
   values. If composites need per-mode values (e.g. a dark-mode shadow), defining
   that is this RFC's responsibility, designed against RFC-0037's axis model
   (`{axis}-{value}`). Scalar tokens use axis-prefixed attributes; a composite
   value cannot fit in a single attribute, so this RFC must decide its own form
   (likely `<mode>` children) — that decision belongs here, not in RFC-0037.
7. **Optimizer** — resolution of composite/alias tokens in the optimizer and
   renderer (relates to the deferred rule-08 style-token resolution).
