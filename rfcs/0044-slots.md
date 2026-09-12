---
rfc: 0044
title: Slots — components that take content
status: Draft
targets: 0.3
date: 2026-09-12
---

# Slots — Components That Take Content

## Context

### What a component can be given today

[RFC-0008](0008-component-instance-system.md) gave components a public API: a `<props>` block declaring what an instance may override, and an `<instance>` that passes overrides as attributes. [RFC-0034](0034-component-prop-types.md) typed that API — `string`, `boolean`, `number`, `color`, `image`, `style`, `component`.

Every one of those passes a **value**. A string, a number, a colour, an id. `<instance>` is self-closing and always has been, because there has never been anything to put inside it.

The closest thing to passing content is `type="component"`, which swaps a nested instance for a different component by id. That is a real capability and it covers icons well. It cannot pass a *subtree* — only a pointer to another component that must already exist, whole, somewhere else.

### What real designs need instead

Two shapes come up constantly and neither is expressible.

**A container that holds whatever you put in it.** A card with a title and then arbitrary content. A panel, a sheet, a section, a modal. The component owns the frame, the padding, the fill, the radius, the shadow — and owns nothing about what sits inside.

**A screen scaffold.** A nav bar, a content area, a tab bar. Twelve screens share it and differ only in the middle. This is the single most common structure in a real product, and today the format has no way to say it.

Authors have three workarounds and all three are bad:

- **Declare every child as a prop.** Works for a fixed shape, collapses immediately — a card holding a row of two buttons is not expressible as `string` props, and no amount of typing gets there.
- **Make a variant per content shape.** Combinatorial, and the variants share nothing but a name.
- **Detach.** Inline the whole tree and lose the component ([RFC-0035](0035-detached-from.md) at least records where it came from). This is what actually happens, and it throws away the reuse information [RFC-0008](0008-component-instance-system.md) exists to preserve.

### Why this matters more now

[RFC-0042](0042-multi-document-packages.md) introduced `library.guix`, where a package's shared components live. The single most valuable thing a library could hold is the screen scaffold that twelve documents share.

It cannot hold one. A scaffold is precisely a component whose middle is different every time, and there is no way to declare a middle.

So the library ends up holding buttons and badges — real, but the small stuff — while the structure every screen actually repeats stays copy-pasted twelve times. The feature that was supposed to make a set of screens agree cannot express the thing they most need to agree on.

## Decision

**A component may declare holes. An instance may fill them with content.**

### `<slot>` marks a hole

```xml
<components>
  <component name="Card" id="comp-card">
    <props>
      <prop name="title" type="string" target="title" />
    </props>
    <col id="surface" gap="12" p="16" fill="$panel" radius="12">
      <text id="title" value="Title" />
      <slot />
    </col>
  </component>
</components>

<instance component="comp-card" title="Billing">
  <text value="Visa ending 4242" />
  <row gap="8">
    <instance component="comp-button" label="Update" />
    <instance component="comp-button" label="Remove" />
  </row>
</instance>
```

The instance's children replace the `<slot>`. Everything else about the component — its frame, padding, fill, radius, and its props — works exactly as before.

### Named slots for more than one hole

```xml
<component name="Screen" id="comp-screen">
  <col w="390" fill="$bg">
    <slot name="nav" />
    <col w="fill" gap="16" p="16">
      <slot name="body" />
    </col>
    <slot name="tabs" />
  </col>
</component>

<instance component="comp-screen">
  <instance slot="nav"  component="comp-navbar" title="Billing" />
  <col      slot="body" gap="12"> ... </col>
  <instance slot="tabs" component="comp-tabbar" active="settings" />
</instance>
```

A `slot` attribute on a child names the hole it fills. A child without one fills the unnamed slot.

### The rules

- **At most one unnamed slot per component.** Named slots: as many as you like, names unique within the component.
- **Children without `slot` go to the unnamed slot.** If the component has no unnamed slot, that is an error.
- **A `slot` naming a hole that does not exist is an error** ([P15](../PRINCIPLES.md)), not content to be dropped quietly.
- **A slot accepts a sequence.** Several children may target the same slot; they appear in document order.
- **`<slot>` children are the fallback.** What is written inside `<slot>` renders when the instance supplies nothing for it. An empty `<slot />` renders nothing.
- **`<slot>` is not a layout node.** It takes no attributes but `name`, creates no frame, and contributes no box. Its content lands directly in the parent's flow. Wrapping it in a `<col>` is how you give it layout — the same way any other content gets layout.
- **Slot content cannot see the component's props.** Content is inserted, not evaluated. There is no scope, no binding, no expression ([P6](../PRINCIPLES.md)).
- **A component may not appear inside its own slot content, directly or transitively.** Decidable statically, at parse time, and an error when violated.

### Slot content is composition, not override

This is load-bearing. `spec/DOTGUI.md` detaches an instance that overrides more than 75% of its component's layers, emitting an inline tree instead of a reference.

**Slot content does not count toward that threshold.** An override replaces something the component declared; slot content fills something the component deliberately left empty. A scaffold instance whose body is a large subtree has overridden nothing — treating it as divergence would detach exactly the instances this RFC exists to make possible.

### `<instance>` may now have children

The only grammar change. A self-closing `<instance>` means what it has always meant, so every existing file is unaffected and no producer has to change.

### Non-goals

- **No conditional or repeated content.** No `if`, no `for`, no expressions. A slot is a hole, not a template ([P6](../PRINCIPLES.md)).
- **No type constraints on slots.** A slot does not declare what may go in it. Constraining content is a type system, and the format does not have one.
- **No scoping.** Slot content is written where it is written and means what it says there.
- **No styling from the outside in.** A component cannot reach into slot content to style it, and content cannot reach out.

## Reasoning

### It resolves RFC-0042's open question about libraries

[RFC-0042](0042-multi-document-packages.md) flagged a case it could not settle: a `component`-typed prop on a library component, passed a component defined locally in one document, would make the library depend on that document. A shared declaration that resolves differently per document is exactly what `library.guix` exists to prevent.

Slots do not have this problem, and the reason is structural. With `type="component"` the value travels *into* the library component's body, so the library's definition is completed by something a document owns. With a slot, the content stays in the document's own instance — the library declares a hole and never learns what fills it. The dependency points the right way: documents depend on the library, and the library depends on nothing.

That makes slots the correct mechanism for the library-scaffold case, and `type="component"` the wrong one. Both can stay: swap a nested *component*, fill a slot with *content*.

### The alternative is detaching, which destroys the thing components are for

Today a scaffold used by twelve screens is twelve detached trees. [RFC-0008](0008-component-instance-system.md) exists so a consumer can see that ten instances share an origin; a code generator emits one component, an agent recognises a pattern. Detaching throws that away precisely where it is worth most — a screen scaffold is the most reused structure in a product.

So the format already pays for the missing feature. It pays in lost reuse information, in twelve copies of the same tree, and in twelve chances for them to drift apart.

### It is one tag, one attribute, and no new semantics

[P11](../PRINCIPLES.md) sets a high bar for new grammar. What is added here is `<slot>`, a `slot` attribute, and children on `<instance>` — and nothing that computes. Insertion is the whole behaviour: a subtree that was written in one place renders in another. No evaluation order, no scope chain, no reactivity for a renderer to implement ([P6](../PRINCIPLES.md)).

Every platform the format targets has this and means the same thing by it — SwiftUI's `@ViewBuilder` content, Compose's content lambdas, web components' `<slot>`, React's `children` ([P2](../PRINCIPLES.md)). It is one of the few composition ideas that is genuinely universal.

### Why `<slot>` and not `<content>`

`slot` is the most widely understood name for this across both design tools and frameworks, and it is not owned by one platform — it appears in web components, Vue, Svelte, and in designers' everyday speech. `<content>` was considered and is vaguer: everything in a document is content, so a tag by that name says less about what it does. The format already uses "slot" informally in this exact sense ([RFC-0034](0034-component-prop-types.md) targets an `icon-slot`).

## Drawbacks

- **Figma cannot express it, so the round trip is lossy.** Figma has instance swap, not content slots. A slotted instance coming back from `.gui` into Figma has to become a detached tree with a `detached-from` origin ([RFC-0035](0035-detached-from.md)). That is a defined and traceable degradation rather than data loss, but [P1](../PRINCIPLES.md) makes round-trip a first-class constraint and this fails it in one direction. It is the strongest objection to this RFC.

- **`<instance>` stops being a leaf.** Every parser, serializer, and optimizer that assumed self-closing has to change. Existing files stay valid, but existing code does not stay correct.

- **The detach heuristic needs a carve-out.** "Slot content does not count toward the 75% threshold" is a rule someone has to implement correctly, and getting it wrong detaches exactly the instances this RFC is for.

- **Recursion is newly possible and needs a new check.** Nothing before this could refer to itself. The check is static and cheap, but it is a class of error the format did not previously have.

- **It makes the wrong thing easier.** A component with four slots and no props is a `<col>` with extra steps. The format gains a way to write structure that looks reusable and is not, and nothing here prevents it — [RFC-0040](0040-quality-scoring-model.md) may need an opinion.

- **Two ways to pass a component.** `type="component"` swaps by id, a slot takes content. The distinction is principled (*Reasoning*) but it is still two mechanisms a reader has to tell apart, which [P12](../PRINCIPLES.md) dislikes.

## Alternatives Considered

**A `slot` prop type** — Rejected. It would keep everything inside the [RFC-0034](0034-component-prop-types.md) props model, which is attractive for uniformity. But a prop is an attribute and attributes carry values; a subtree is not a value, and the content would still have to arrive as instance children. The result declares the hole in `<props>` and fills it in the body — two places for one fact, with nothing gained.

**Extend `type="component"` to accept inline content** — Rejected. It conflates swapping a definition with supplying content, and it is the variant that creates the library-depends-on-document problem (*Reasoning*). The two mechanisms differ in which direction the dependency runs, which is exactly the kind of thing a format should keep separate.

**Variants for every content shape** — Rejected. Combinatorial, and it answers "this component holds different things" with "these are different components," which is false and defeats the reuse it is meant to preserve.

**Do nothing; keep detaching** — The status quo and the honest alternative. It costs nothing to implement and it already works. It is rejected because it discards component identity at the exact point where identity is most valuable, and because [RFC-0042](0042-multi-document-packages.md) makes the cost worse: a library that cannot hold a scaffold cannot hold the thing a set of screens most needs to share.

**Named slots only, no unnamed slot** — Considered. One rule instead of two, and no "children without `slot`" case to specify. Rejected as a tax on the common case: the overwhelming majority of components have exactly one hole, and making every one of them name it is configuration the convention should absorb ([P10](../PRINCIPLES.md)).

## Unresolved Questions

- **How do slots interact with `<component-set>` variants?** Must every variant declare the same slot names, so an instance can switch variant without its content becoming invalid? Requiring agreement is safer and constrains the author; not requiring it means a variant swap can silently orphan content.
- **Should the Figma path refuse or degrade?** Detaching on the way back is defined, but an extractor could also refuse to import a slotted component and say so. Degrading quietly is friendlier; refusing is more honest ([P15](../PRINCIPLES.md)).
- **Does the quality model score slots?** [RFC-0040](0040-quality-scoring-model.md) counts dead weight and redundant wrappers. An unfilled slot, a slot holding one text node, or a component that is only slots are all shapes it has no opinion on yet.
- **Must component ids be unique package-wide?** Inherited unresolved from [RFC-0042](0042-multi-document-packages.md) and now sharper: slot content in one document may contain instances of components from the library and from that document at once, in the same subtree.
- **Is fallback content worth keeping?** It is genuinely useful for a scaffold with an optional footer, but it is also a second place a component's appearance is defined, and it complicates the detach calculation. Dropping it would simplify the model at a real cost in expressiveness.
- **Can slot content be reused?** Nothing lets an author name a subtree and put it in two places. Slots make that gap more visible without addressing it.
