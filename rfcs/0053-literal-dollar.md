---
rfc: 0053
title: Literal $ — prices in text, and token references that fail loudly
status: Draft
targets: 0.4
date: 2026-10-18
amends: 0005
---

# Literal `$` — Prices in Text, and Token References That Fail Loudly

## Context

[RFC-0005](0005-token-system.md) references a token as `$name` in any attribute value, and says an unknown `$name` "is treated as a literal string (no error)". Two problems follow, both found building the Sable app (`motion-lab/examples/8-demo/sable`):

- **Prices work by luck.** The app has 48 text values like `$7,510`, `$60` and `Add $100 to goal`. Renderers read `$7` and `$60` as token references, find no token named `7` or `60`, and fall back to the literal text. If a file ever declared a token whose name starts with a digit, every matching price would silently change.
- **Typos are invisible.** `fill="$primay"` renders as the literal string `$primay` — usually an invalid colour, so nothing is drawn — and no tool reports why. That contradicts [P15](../PRINCIPLES.md): the format should fail loudly, not degrade silently.

## Decision

1. **Token names start with a letter**: `[A-Za-z][A-Za-z0-9-]*`. A token declared with any other name is an error.
2. **`$` followed by a digit, a space, or the end of the value is always literal.** `$7,510`, `$60`, `5 $` and `US$` are text. No escape is needed for prices in any currency written with `$`.
3. **`$` followed by a letter is a token reference.** If no such token exists in the document or its library, it is an **error** in validation and a visible fallback in rendering — not silent literal text.
4. **`$$` writes a literal `$` before a letter**, for the rare text that needs it: `value="$$ash"` renders `$ash`.

## Reasoning

The rule follows how `$` is actually used: in interfaces, `$` before a number is money and `$` before a word is almost always a reference. Making the common case need no escape keeps text readable and cheap to write ([P7](../PRINCIPLES.md)); making the rare case explicit keeps it unambiguous. Turning unknown references into errors moves a whole class of silent failures into lint, where authors — human or AI — see them.

## Alternatives Considered

**Keep "unknown is literal"** — Rejected. Silent failure ([P15](../PRINCIPLES.md)), and prices depend on no token ever having a numeric name.

**Escape every literal `$`** (`\$60`) — Rejected. Taxes the common case — every price — to serve the rare one ([P9](../PRINCIPLES.md)).

**Change the token sigil** (`@primary`, `{primary}`) — Rejected. Breaks every existing file and RFC for a problem a naming rule solves.

## Test Cases

| Value | Result |
|---|---|
| `value="$7,510"` | Text `$7,510` |
| `value="Add $60 to goal"` | Text `Add $60 to goal` |
| `fill="$primary"` (declared) | The token's value |
| `fill="$primay"` (not declared) | Validation error; renderer shows its missing-value state |
| `value="$$ash"` | Text `$ash` |
| `<color name="60" …>` | Validation error: token names start with a letter |

## Unresolved Questions

- **Migration.** Existing files with unknown references that were meant as text (`$USD`?) become errors. A one-time lint pass can rewrite them to `$$`.
