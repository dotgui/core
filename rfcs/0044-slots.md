---
rfc: 0044
title: Slots — components that take content
status: Draft
targets: 0.3
date: 2026-09-12
---

# Slots — Components That Take Content

## Context

### Figma shipped slots, and the format cannot carry them

Slots were announced at Schema 2025, entered open beta in March 2026, and are now generally available in Figma Design and the Plugin API. A slot is a component property of type `SLOT` bound to a nested frame; the Plugin API exposes a `SlotNode`, `componentNode.createSlot()`, `slotNode.resetSlot()`, and a `SlotSettings` record.

This is not a feature request. It is a gap in the export path. A designer using slots today produces a file the format cannot represent, and the extractor has exactly two options: detach every slotted instance, or drop the structure. Both lose the thing the designer built.

[P1](../PRINCIPLES.md) makes round-trip a first-class constraint and the format tool-agnostic. Tool-agnostic does not mean indifferent to what tools can express — it means no *single* tool's model is privileged. When a concept becomes available across design tools and has been standard in frontend frameworks for a decade, a format that cannot carry it is not being neutral. It is being behind.

### What a component can be given today

[RFC-0008](0008-component-instance-system.md) gave components a public API: a `<props>` block declaring what an instance may override, and an `<instance>` passing overrides as attributes. [RFC-0034](0034-component-prop-types.md) typed it — `string`, `boolean`, `number`, `color`, `image`, `style`, `component`.

Every one of those passes a **value**. `<instance>` is self-closing and always has been, because there has never been anything to put inside it.

The closest thing to passing content is `type="component"`, which swaps a nested instance for a different component by id. Real, and good for icons. It cannot pass a *subtree* — only a pointer to something that already exists whole, elsewhere.

### What real designs need instead

**A container that holds whatever you put in it.** A card with a title and then arbitrary content. A panel, a sheet, a section, a modal. The component owns the frame, padding, fill, radius, shadow — and owns nothing about what sits inside.

**A screen scaffold.** Nav bar, content area, tab bar. Twelve screens share it and differ only in the middle.

Today there are three workarounds and all three are bad: declare every child as a prop (collapses as soon as the content is a row of two buttons); make a variant per content shape (combinatorial, and the variants share nothing but a name); or detach and lose the component. Detaching is what actually happens, and it discards the reuse information [RFC-0008](0008-component-instance-system.md) exists to preserve.

### Why this matters more now

[RFC-0042](0042-multi-document-packages.md) introduced `library.guix`, where a package's shared components live. The most valuable thing a library could hold is the scaffold twelve documents share — and it cannot hold one, because a scaffold is precisely a component whose middle differs every time.

So the library holds buttons and badges while the structure every screen repeats stays copy-pasted twelve times. The feature meant to make a set of screens agree cannot express what they most need to agree on.

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

The instance's children replace the `<slot>`. Props, frame, and everything else work exactly as before.

### Named slots, and how a child targets one

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

`name` on the declaring side, `slot` on the filling side — the same split web components use, and the same one Vue expresses as `name` and `#name`. A child without `slot` fills the unnamed slot.

### Fallback content

What is written inside `<slot>` renders when the instance supplies nothing:

```xml
<slot name="footer">
  <text value="No items" fill="$ink-2" />
</slot>
```

This is Figma's behaviour too — a slot's original frame content is what `resetSlot()` restores — and Vue's and web components'. All three agree, so the format agrees.

### `<slot>` is a placeholder, not a container

It takes `name` and nothing else. It creates no box and contributes no layout; its content lands in the parent's flow. To give slot content layout, wrap it — `<col gap="12"><slot /></col>` — the same way anything else gets layout, with no vocabulary duplicated.

**The Figma mapping is stated, because Figma's slot *is* a frame:**

- A `<slot>` alone inside a layout container → that container is the slot frame, carrying its layout.
- A `<slot>` among siblings → a bare slot frame beside them.

Deterministic in both directions, so a round trip does not accumulate wrappers.

### The rules

- **At most one unnamed slot per component.** Named slots: any number, names unique within the component. (Figma has the same constraint — two slots in one variant cannot share a slot property.)
- **Children without `slot` go to the unnamed slot.** No unnamed slot, and it is an error.
- **A `slot` naming a hole that does not exist is an error** ([P15](../PRINCIPLES.md)), never content dropped quietly.
- **A slot accepts a sequence.** Several children may target one slot; they render in document order.
- **A slot may not be the component's root.** Figma forbids binding a slot property to the top-level layer, and the same reasoning applies: a component that is nothing but a hole is not a component.
- **Slot content cannot see the component's props.** Content is inserted, not evaluated — no scope, no binding, no expression ([P6](../PRINCIPLES.md)). Figma states the same rule from the other end: component properties cannot be applied to layers inside a slot.
- **A component may not appear inside its own slot content, directly or transitively.** Statically decidable at parse time; an error when violated.

### Slot content is composition, not override

`spec/DOTGUI.md` detaches an instance overriding more than 75% of its component's layers, emitting an inline tree instead of a reference.

**Slot content does not count toward that threshold.** An override replaces something the component declared; slot content fills something it deliberately left empty. A scaffold instance with a large body has overridden nothing, and treating it as divergence would detach exactly the instances this RFC exists to enable.

### `<instance>` may now have children

The only grammar change. A self-closing `<instance>` means what it always meant, so every existing file is unaffected.

### What this deliberately does not carry from Figma

Figma's `SlotSettings` holds `minChildren`, `maxChildren`, `allowPreferredValuesOnly`, preferred instances, `displayEmptyByDefault`, and `stretchChildOnInsert`; `SlotNode.limitViolations` reports `BELOW_MIN`, `ABOVE_MAX`, `HAS_NON_PREFERRED`.

None of it is carried, on [P3](../PRINCIPLES.md) grounds: **everything you can see, nothing you can't.** Layer limits and preferred instances are authoring guardrails — Figma itself treats them as guidance rather than enforcement, warning designers who exceed them. `displayEmptyByDefault` draws an affordance for someone editing. `limitViolations` is editor validation state. None of them changes a rendered pixel, and [P5](../PRINCIPLES.md) keeps editor state out of the format.

`stretchChildOnInsert` is the interesting one and it needs no special handling: it decides what sizing Figma gives a child *at the moment of insertion*, and the result is already recorded in that child's own `w`/`h`. The behaviour is an editor's, the outcome is the export's, and only the outcome travels.

The cost is real and belongs in *Drawbacks*: a design system expressing "this slot takes Buttons" loses that on export.

### Non-goals

- **No conditional or repeated content.** No `if`, no `for`, no expressions. A slot is a hole, not a template ([P6](../PRINCIPLES.md)).
- **No scoped slots.** See *Reasoning*.
- **No dynamic slot names.** Vue has them; they require a runtime expression.
- **No styling across the boundary.** A component cannot reach into slot content, and content cannot reach out.

## Reasoning

### Three prior arts, one shape

| | Figma | Web Components / Vue | SwiftUI / Compose | this RFC |
|---|---|---|---|---|
| Multiple named slots | yes | yes (`name` + `slot=` / `#name`) | yes (several content closures) | yes |
| Fallback content | yes (`resetSlot()`) | yes (children of `<slot>`) | yes (default argument) | yes |
| Many children in one slot | yes | yes | yes | yes |
| Content sees the component's data | **no** | yes (scoped slots, render props) | yes (closure parameters) | **no** |
| Constraints on what may be inserted | yes (preferred, min/max) | no | compile-time types | **no** |
| The slot itself carries layout | yes (it is a frame) | no (pure placeholder) | n/a | no (wrap it) |

The rows that matter are the ones where all three agree: multiple named holes, fallback content, a sequence per hole. That is the settled core of the idea across a design tool, a browser standard, and two native UI frameworks — which is as strong a case as [P11](../PRINCIPLES.md) is ever going to get for admitting new grammar, and as good a [P2](../PRINCIPLES.md) result as exists, since the concept means the same thing on every target.

### Where the design tool and the frameworks disagree, follow the design tool

The one genuine split is scoping. Vue's scoped slots and React's render props let content read data the component supplies; SwiftUI and Compose pass closure parameters. Figma does not, and says so explicitly: component properties cannot be applied to layers inside a slot.

The format follows Figma here, and not because Figma is privileged ([RFC-0003](0003-not-figma-data-model.md) is clear that it is not). Scoping requires an expression evaluated at render time, and [P6](../PRINCIPLES.md) draws the line exactly there: the language carries intent, the renderer carries computation. A scoped slot is a small template language, and the moment one exists, every consumer must implement it identically or files stop meaning one thing.

That the design tool independently landed in the same place is evidence the restriction is natural for a *visual* format rather than a limitation being rationalised.

### Why slots are not declared in `<props>`, though Figma declares them there

In Figma a slot is a component property of type `SLOT`. The obvious translation is a `<prop type="slot">` entry, keeping everything inside the [RFC-0034](0034-component-prop-types.md) model.

It is rejected, and Figma's own API shows why: the property declaration and the content live in different places. Settings sit on the property; the content is a `SlotNode` in the tree. Copy that into markup and the hole is declared in `<props>`, positioned by a marker in the body, and filled by children on the instance — one fact in three places. Since the settings are not carried at all (*What this deliberately does not carry*), the property entry would hold nothing but a name that the body already states.

`<props>` describes values an instance may override. A hole is not a value. [RFC-0003](0003-not-figma-data-model.md) exists for exactly this: take the capability, not the data model.

### It resolves RFC-0042's open question about libraries

[RFC-0042](0042-multi-document-packages.md) flagged a case it could not settle: a `component`-typed prop on a library component, passed a component defined locally in one document, would make the library depend on that document — a shared declaration resolving differently per document is what `library.guix` exists to prevent.

Slots do not have this problem, structurally. With `type="component"` the value travels *into* the library component's body, so a document completes the library's definition. With a slot the content stays in the document's own instance; the library declares a hole and never learns what fills it. The dependency points the right way: documents depend on the library, the library depends on nothing.

That makes slots correct for the scaffold case and `type="component"` wrong for it. Both stay — swap a *definition*, fill with *content*.

### The alternative is detaching, which destroys what components are for

A scaffold used by twelve screens is twelve detached trees today. [RFC-0008](0008-component-instance-system.md) exists so a consumer can see that instances share an origin — a code generator emits one component, an agent recognises a pattern. Detaching throws that away exactly where it is worth most, and the format already pays for the missing feature in lost reuse, duplicated trees, and twelve chances to drift.

## Drawbacks

- **Design-system constraints are lost on export.** A Figma slot restricted to preferred instances, or to two-to-four children, exports as an unconstrained hole. Nothing is rendered differently, but a library author's intent is gone and a round trip will not restore it. This is the deliberate [P3](../PRINCIPLES.md) trade, and it is the main cost of the RFC.

- **`<instance>` stops being a leaf.** Every parser, serializer, and optimizer that assumed self-closing must change. Existing files stay valid; existing code does not stay correct.

- **The detach heuristic needs a carve-out.** "Slot content does not count toward the 75% threshold" is a rule someone must implement correctly, and getting it wrong detaches the instances this RFC is for.

- **Recursion is newly possible.** Nothing before this could refer to itself. The check is static and cheap, but it is a class of error the format did not have.

- **It makes the wrong thing easier.** A component with four slots and no props is a `<col>` with extra steps. Nothing here prevents it, and [RFC-0040](0040-quality-scoring-model.md) may need an opinion.

- **Two ways to pass a component.** `type="component"` swaps by id; a slot takes content. The distinction is principled but it is still two mechanisms to tell apart, which [P12](../PRINCIPLES.md) dislikes.

## Alternatives Considered

**A `slot` prop type, as Figma models it** — Rejected; argued in full under *Reasoning*. One fact in three places, and a props entry holding only a name.

**Extend `type="component"` to accept inline content** — Rejected. It conflates swapping a definition with supplying content, and it is the variant that creates the library-depends-on-document problem.

**Carry `SlotSettings` for fidelity** — Rejected under [P3](../PRINCIPLES.md)/[P5](../PRINCIPLES.md): none of it is visible, Figma treats the limits as guidance rather than enforcement, and importing them would put editor state into a visual export. Reopenable if preferred instances turn out to be load-bearing for design systems — see *Unresolved Questions*.

**Scoped slots** — Rejected under [P6](../PRINCIPLES.md). Requires expressions evaluated at render time, which is a template language, which every consumer would have to implement identically.

**Variants for every content shape** — Rejected. Combinatorial, and it answers "this component holds different things" with "these are different components," which is false.

**Do nothing; keep detaching** — The honest status quo. Rejected because it discards component identity where it is worth most, because [RFC-0042](0042-multi-document-packages.md) makes the cost worse, and because it is no longer merely a gap in expressiveness: it is a gap against what the primary extractor now produces.

**Named slots only, no unnamed slot** — Considered. One rule instead of two. Rejected as a tax on the common case, where a component has exactly one hole ([P10](../PRINCIPLES.md)).

## Unresolved Questions

- **Should preferred instances be carried after all?** It is the one `SlotSettings` field with a claim to being design intent rather than editor guidance — "this slot takes Buttons" is closer to a component's public API than to a canvas affordance. Carrying it alone would be inconsistent; carrying none of them loses real information.
- **How do slots interact with `<component-set>` variants?** Must every variant declare the same slot names, so switching variant cannot orphan content? Figma's constraint is per-variant, which suggests they need not agree — and that a variant swap can strand content.
- **What does the extractor do with a slot it cannot represent faithfully?** Figma's own note is that layers placed in a slot behave as detached from the component structure. The export path needs a stated rule rather than whatever falls out.
- **Does the quality model score slots?** [RFC-0040](0040-quality-scoring-model.md) counts dead weight and redundant wrappers. An unfilled slot, a slot holding one text node, and a component that is only slots are shapes it has no opinion on.
- **Must component ids be unique package-wide?** Inherited from [RFC-0042](0042-multi-document-packages.md) and now sharper: slot content in one document may hold instances of library components and document-local components in the same subtree.
- **Can slot content be reused?** Nothing lets an author name a subtree and place it twice. Slots make the gap more visible without addressing it.
