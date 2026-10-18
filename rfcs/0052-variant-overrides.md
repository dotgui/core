---
rfc: 0052
title: Variant overrides — a variant as the set's body with different values
status: Draft
targets: 0.4
date: 2026-10-18
depends-on: 0008, 0034, 0045, 0048
---

# Variant Overrides — A Variant as the Set's Body with Different Values

## Context

[RFC-0045](0045-describe-dont-run.md) makes every state of a design written out, never computed. Done naively, that is expensive. In the clean Sable package (`motion-lab/examples/8-demo/sable-clean`), the amount sheet has four variants — $25, $60, $100, $250 — and each is a complete copy of the same tree: the same chips, the same button, the same layout. They differ in four things: where the selection pill sits, which chip label is dark, the big amount, and the button label. The four copies cost 7 KB of a 58 KB package; the category picker on the New goal screen repeats the pattern.

This is the single largest reason the clean `.gui` package stayed larger than an equivalent HTML file ([RFC-0045](0045-describe-dont-run.md), *Evidence*): HTML keeps one template and a variable. `.gui` cannot use a variable — that would be computation — but it can say what a variable would have said, once per state, without copying the tree.

Components already have the tool for it. [RFC-0008](0008-component-instance-system.md) and [RFC-0034](0034-component-prop-types.md) let an instance set declared props on a component's body. A variant that differs from its siblings only in prop values is the same idea: a named, saved set of prop values.

## Decision

**A component set may have one shared body. A variant without its own body is that body with its own prop values.**

```xml
<component-set name="Amount" id="compset-amount" transition="smart 300 $snappy">
  <props>
    <prop name="pill-x"  type="number" target="chip-pill" bind="x" />
    <prop name="amount"  type="string" target="amt-big" />
    <prop name="label"   type="string" target="confirm-label" />
    <prop name="c25"     type="color"  target="chip-25" />
    <prop name="c60"     type="color"  target="chip-60" />
    <prop name="c100"    type="color"  target="chip-100" />
    <prop name="c250"    type="color"  target="chip-250" />
  </props>

  <col id="amt" w="328" gap="18">
    <text id="amt-big" text-style="HugeAmt" value="$60" color="$text" />
    <frame w="328" h="44" radius="$r-pill" fill="$glass">
      <rect id="chip-pill" x="84" y="4" w="78" h="36" radius="$r-pill" fill="$rose" />
      <text id="chip-25"  x="4"   y="13" w="78" align="center" value="$25"  color="$text-70" />
      <text id="chip-60"  x="84"  y="13" w="78" align="center" value="$60"  color="$ink" />
      <text id="chip-100" x="164" y="13" w="78" align="center" value="$100" color="$text-70" />
      <text id="chip-250" x="244" y="13" w="78" align="center" value="$250" color="$text-70" />
    </frame>
    <row id="confirm" w="fill" h="52" radius="$r-pill" fill="$rose" align="middle-center">
      <text id="confirm-label" value="Add $60 to goal" color="$ink" />
    </row>
  </col>

  <variant id="amt-25"  amount-option="25"  pill-x="4"   amount="$25"  label="Add $25 to goal"  c25="$ink"  c60="$text-70">
    <links><link target="chip-60" trigger="tap" destination="amt-60" /> … </links>
  </variant>
  <variant id="amt-60"  amount-option="60">
    <links> … </links>
  </variant>
  <variant id="amt-100" amount-option="100" pill-x="164" amount="$100" label="Add $100 to goal" c100="$ink" c60="$text-70">
    <links> … </links>
  </variant>
  <variant id="amt-250" amount-option="250" pill-x="244" amount="$250" label="Add $250 to goal" c250="$ink" c60="$text-70">
    <links> … </links>
  </variant>
</component-set>
```

### The rules

1. **The shared body is the set's first layout child.** Its values are the defaults.
2. **A variant with no layout child of its own uses the shared body.** Its attributes that name a declared prop are that prop's value for this variant. A variant with no prop values (`amt-60` above) *is* the shared body.
3. **A variant with its own body keeps it.** Variants whose structure genuinely differs — an accordion's open state adds a body text — still carry a full tree, exactly as today. Both kinds may sit in one set.
4. **Attributes that do not name a declared prop are the variant's properties**, as today (`amount-option="25"`). A name that is both a declared prop and used as a variant property is an error.
5. **An instance's own prop values apply on top of the variant's.** Variant values are defaults for that state; an instance can still override them.
6. **Ids are the shared body's ids in every variant**, so `smart` ([RFC-0048](0048-motion.md)) matches every node between states by construction.
7. **Links and `<props>` stay as they are.** A variant's `<links>` block is its own; the set's `<props>` is shared.

## Reasoning

### It is still a description

Nothing is computed. Each variant still states every value that differs, in the file, by name. A reader — or a model — that wants to know what `amt-100` looks like reads the shared body and four attributes. What disappears is only the repetition of everything that does *not* differ.

### It reuses what exists

Props ([RFC-0034](0034-component-prop-types.md)) are already the format's way of saying "this component, with these values". A variant without a body is a saved instance. No new tag, no new value form; one rule about where a variant's tree comes from.

### `smart` gets better, not just smaller

With full copies, matching between variants depends on every copy using the same ids — a rule exporters must follow and authors can break. With a shared body, the ids are the same by construction.

### Exporters can choose

A design tool exporting a component set compares its variants. Where they differ only in values a prop can carry, it writes a shared body and value-only variants; where structure differs, it writes full bodies. Both are valid; the compact form is preferred.

## Alternatives Considered

**Keep full copies only** — Rejected. The largest source of size in real files, and the main thing HTML does better ([RFC-0045](0045-describe-dont-run.md), *Evidence*).

**Variables in the body (`value="${amount}"`)** — Rejected. That is computation in the file ([RFC-0045](0045-describe-dont-run.md)): the reader would have to evaluate the template to know what a state looks like.

**A `base` attribute pointing at another variant (`base="amt-60"`)** — Rejected. Chains of inheritance make a reader follow several variants to know one, and invite cycles. One shared body, one level.

**Diff-style overrides naming node paths (`chip-pill.x="164"`)** — Rejected. It turns attribute names into paths into the tree, so any node and any property becomes overridable without the component saying so. Declared props ([RFC-0034](0034-component-prop-types.md)) exist precisely to document what may change.

## Test Cases

To be exercised in the motion lab before acceptance:

| Case | Expectation |
|---|---|
| Rewrite the Sable amount sheet and category picker in this form | Same rendering and behaviour; size reduction measured and recorded here |
| `smart` between value-only variants | Every node matches; pill slides, colours and text change |
| A set mixing value-only and full-body variants | Both render; `smart` matches by id as before |
| A prop name reused as a variant property | Validation error |

## Unresolved Questions

- **Props that layout values need.** Settled: [RFC-0034](0034-component-prop-types.md) now lets `number` bind `x`, `y`, `w`, `h`.
- **Showing value-only variants in tools.** A design tool importing the compact form must expand it into full variants on its canvas, and may re-compact on export. Does that round trip lose anything?
