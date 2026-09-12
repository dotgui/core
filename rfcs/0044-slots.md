---
rfc: 0044
title: Slots — components that take content
status: Draft
targets: 0.3
date: 2026-09-12
---

# Slots — Components That Take Content

## Context

### Every component API in the format passes a value

[RFC-0008](0008-component-instance-system.md) gave components a public API: a `<props>` block declaring what an instance may override, and an `<instance>` passing overrides as attributes. [RFC-0034](0034-component-prop-types.md) typed it — `string`, `boolean`, `number`, `color`, `image`, `style`, `component`.

Every one of those passes a **value**. A string, a number, a colour, an id. `<instance>` is self-closing and always has been, because there has never been anything to put inside it.

The closest thing to passing content is `type="component"`, which swaps a nested instance for a different component by id. Real, and good for icons. It cannot pass a *subtree* — only a pointer to something that already exists whole, elsewhere.

### Two shapes that every real interface has, and this format cannot express

**A container that holds whatever you put in it.** A card with a title and then arbitrary content. A panel, a sheet, a section, a modal. The component owns the frame, padding, fill, radius, shadow — and owns nothing about what sits inside.

**A screen scaffold.** Status bar, header, content area, tab bar. Every screen in a product shares it and differs only in the middle.

Neither is exotic. They are the two most common structures in UI, which is why every framework in the industry grew a mechanism for them, most of them a decade ago. The format has no way to say either one.

### The three workarounds, and what each costs

- **Declare every child as a prop.** Works for a fixed shape and collapses immediately — a card holding a row of two buttons is not expressible as `string` props, and no amount of typing gets there.
- **A variant per content shape.** Combinatorial, and it answers "this component holds different things" with "these are different components," which is false.
- **Detach.** Inline the whole tree and lose the component. This is what actually happens.

Detaching is the one that matters, because it discards exactly what [RFC-0008](0008-component-instance-system.md) exists to preserve. Component identity is what tells a code generator to emit one component instead of ten, and tells an agent that ten instances are one pattern. A scaffold is the most reused structure in a product, so detaching throws identity away at the point where it is worth most.

### Measured, before it is argued

The format's four `skeuomorphic_*` examples are four screens of one product, authored as separate packages. Their opening status bar block is **byte-identical in all four**, 584 bytes each.

| | screen markup | identical status bar |
|---|---|---|
| album | 9,313 B | 584 B (6%) |
| library | 11,289 B | 584 B (5%) |
| music | 14,559 B | 584 B (4%) |
| settings | 14,973 B | 584 B (3%) |

Across the four: **2,336 B repeated out of 50,134 B of screen markup — 4.7%.** As a component it would be written once and saves roughly 1,752 B.

**That is a small number, and the argument for this RFC is not the number.** [RFC-0042](0042-multi-document-packages.md) already learned this lesson the hard way: it opened as a deduplication proposal, measured itself, and found the saving was not there. The same is true here, and for the same reason — the value of a component was never its byte count.

What the measurement does establish is that the structure is **provably identical and provably duplicated**. Four copies of a thing that is the same thing is four places for it to drift, four edits to make when the status bar changes, and four trees a consumer must compare to discover they were ever related. The scaffold cannot be a component today for exactly one reason: its middle differs per screen. That is the gap.

(584 B is the floor, not the ceiling — it counts only the block that is byte-identical. The header row below it is structurally identical with a differing title, which is a `string` prop, and a real `Screen` component would absorb it too.)

### Why this matters more now

[RFC-0042](0042-multi-document-packages.md) introduced `library.guix`, where a package's shared components live. The most valuable thing a library could hold is the scaffold its documents share — and it cannot hold one, because a scaffold is precisely a component whose middle differs every time.

So the library holds buttons and badges while the structure every screen repeats stays copy-pasted. The feature meant to make a set of screens agree cannot express the thing they most need to agree on.

## Prior Art

Six systems solve this. Reading them by **how a hole is defined** and **how it is filled** is what produced the design below.

### React

The hole is a prop. The unnamed one has a reserved name, `children`; further holes are ordinary props that happen to hold JSX.

```jsx
function Screen({ title, nav, body, tabs }) {
  return <div>{nav}<h1>{title}</h1><main>{body}</main>{tabs}</div>;
}

<Screen title="Billing"
        nav={<NavBar />}
        body={<Card title="Plan" />}
        tabs={<TabBar active="settings" />} />
```

Fallback is a default parameter. React has no named-slot concept at all — named holes *are* props, because JSX is a value and markup and data are the same language.

### Vue

`<slot>` marks the hole in the template; content between the tags is the fallback. A `<template #name>` wrapper groups content per hole at the call site.

```vue
<!-- define -->  <main><slot name="body">Nothing yet</slot></main>

<!-- use -->
<Screen>
  <template #body>
    <Card title="Plan" />
    <Card title="Usage" />
  </template>
</Screen>
```

### Svelte 5

Slots were deprecated in favour of snippets. A hole is a prop holding a snippet, rendered with `{@render}`; a snippet written inside the component tag implicitly becomes that prop.

```svelte
<!-- define -->  {@render body()}
<!-- use -->     <Screen>{#snippet body()}<Card />{/snippet}</Screen>
```

Its distinguishing trait: a snippet is a **named value**, so it can be rendered in several places and passed onward.

### Angular

`<ng-content select="…">` routes content by CSS selector; a bare `<ng-content>` is the catch-all. Nothing at the call site names a hole — content goes where it goes based on what it *is*. `ngProjectAs` aliases an element when the selector does not match.

### Web Components

`<slot name>` in the shadow template, fallback inside it, and a `slot` attribute on **every** light-DOM child at the call site.

```html
<my-card>
  <h2 slot="title">Billing</h2>
  <p slot="body">one</p>
  <p slot="body">…repeated for every child</p>
</my-card>
```

### Figma

Slots were announced at Schema 2025, entered open beta in March 2026, and are now GA in Figma Design and the Plugin API.

You do not insert a slot — you **convert an existing frame into one** (⌘⇧S), which creates a component property of type `SLOT` bound to that frame. The frame keeps its auto layout, so anything dropped in obeys the slot's own direction, gap, padding, and sizing. Whatever was already in the frame becomes the default, restorable via `slotNode.resetSlot()`. At the use site you put layers **into the named region** on the instance; no layer is ever tagged with which slot it belongs to.

`SlotSettings` carries `minChildren`, `maxChildren`, preferred instances, `allowPreferredValuesOnly`, `displayEmptyByDefault`, and `stretchChildOnInsert`. `SlotNode.limitViolations` reports `BELOW_MIN`, `ABOVE_MAX`, `HAS_NON_PREFERRED` — the counts warn, they do not enforce.

### What the survey settles

| | Figma | Vue | Web Components | React | Svelte | Angular |
|---|---|---|---|---|---|---|
| Multiple named holes | yes | yes | yes | via props | via props | by selector |
| Fallback content | yes | yes | yes | default param | — | yes |
| Many children per hole | yes | yes | yes | yes | yes | yes |
| The hole carries layout | **yes** | no | no | no | no | no |
| Content reads component data | no | yes | no | yes | yes | no |
| Constraints on content | yes | no | no | types | types | by selector |

Three rows are unanimous and become the core: **multiple named holes, fallback content, a sequence per hole.** That is as strong a case as [P11](../PRINCIPLES.md) is likely to get for admitting new grammar, and as clean a [P2](../PRINCIPLES.md) result as exists — the concept means the same thing on every target.

Two rows are where the decisions live, and both are argued in *Reasoning*.

## Decision

**A component may declare holes. An instance may fill them with content.**

### Define: `slot` on a layout container

A container carrying `slot` **is** the slot. Its layout attributes apply to whatever is inserted.

```xml
<component name="Screen" id="comp-screen">
  <props>
    <prop name="title" type="string" target="title" />
  </props>
  <col w="390" fill="$bg" pb="34" gap="22">

    <row w="fill" p="16 22 0" align="middle-center" gap="auto">
      <text value="9:41" font-family="SF Pro" font-size="15" font-weight="600" color="$ink" />
      <text text-style="Caption" value="100%" color="$ink-2" />
    </row>

    <row w="fill" p="2 16 0" align="middle-center">
      <text id="title" text-style="Serif/Title" value="Title" color="$ink" />
    </row>

    <col slot="body" w="fill" p="0 16" gap="24" />
    <row slot="tabs" slot-accept="compset-tab-item" w="fill" gap="8" align="middle-center" />
  </col>
</component>
```

`body` is a vertical slot with 16px side padding and 24px between whatever goes in it. `tabs` is horizontal. The slot owns the layout; the content just arrives.

**Fallback content is the container's own children:**

```xml
<row slot="actions" w="fill" gap="12" align="middle-right">
  <instance component="comp-button" label="Close" />
</row>
```

Self-closing means a slot with no fallback.

### Fill: `<slot name>` inside the instance

```xml
<instance component="comp-screen" title="Audio Settings">
  <slot name="body">
    <instance component="comp-section" label="Playback" />
    <row gap="12">
      <instance component="comp-toggle" label="Lossless" />
      <instance component="comp-toggle" label="Spatial" />
    </row>
  </slot>
  <slot name="tabs">
    <instance component="comp-tab-item" label="Library" />
    <instance component="comp-tab-item" label="Settings" active />
  </slot>
</instance>
```

### Constrain: `slot-accept`

```xml
<row slot="items" slot-accept="compset-tab-item comp-nav-divider"
     slot-min="2" slot-max="5" w="fill" p="8 16" gap="8" />
```

Space-separated, the same list form as `values="light dark"` and `weights="400 500 600 700"`.

- **Absent** → free canvas. Any node, any depth: text, frames, rows, cols, grids, instances, whole subtrees.
- **Present** → a **flat list of instances** of the named components. No text nodes, no frames, no wrappers, no nesting.

A **component id** means that component. A **component-set id** means every variant of that set, **expanded on read** — so adding a variant later does not silently leave it unaccepted. The two mix freely in one list.

`slot-min` / `slot-max` bound the child count. They are **advisory**, surfaced by the quality model ([RFC-0040](0040-quality-scoring-model.md)), never errors — which is what Figma does with the same numbers.

### The rules

1. A `<slot>` tag is valid **only** as a direct child of `<instance>`. It never stands alone.
2. An `<instance>`'s children are **only** `<slot>` elements. Nothing else.
3. **Every slot is named.** There is no anonymous slot and no bare content.
4. A slot declaration may not contain another slot declaration. **No nesting.**
5. A slot may not be a component's root.
6. Filling a slot the component does not declare is an error ([P15](../PRINCIPLES.md)).
7. Violating `slot-accept` is an error. Violating `slot-min`/`slot-max` is a quality finding.
8. **An unfilled slot with no fallback renders nothing** — no box, no padding, no contribution to the parent's `gap`.
9. Slot content cannot read the component's props. Insertion, not evaluation ([P6](../PRINCIPLES.md)).
10. **Slot content is composition, not override.** It does not count toward the 75% detach threshold in `spec/DOTGUI.md`.
11. A component may not appear inside its own slot content, directly or transitively. Statically decidable.

### Non-goals

- **No conditional or repeated content.** No `if`, no `for`, no expressions.
- **No scoped slots.**
- **No dynamic slot names.**
- **No selector routing.**
- **No node-type constraints.** `slot-accept` takes component ids, not tag names.
- **No editor settings.** `displayEmptyByDefault`, `limitViolations`, preferred-as-suggestion, and `stretchChildOnInsert` are not carried; see *Reasoning*.

## Reasoning

### The hole is a region, because this is markup describing a tree

React and Svelte make a hole a *value*, and both are right to, because in those languages markup is a value — JSX and snippets are things you can assign, pass, and store. dotgui has no such equivalence. A `.guix` document is a tree of visual nodes, and a hole in it is a **place**, not a value that could be held somewhere else.

That is what finally rules out `<prop type="slot">`: not style, but category. `<props>` declares values an instance may override, and a place in a tree is not a value.

### The name belongs on a wrapper, not on every child

Web Components put the name on each child (`slot="title"`). It works, and it has two costs. Filling one slot with four children means writing the name four times. And an instance cannot be read on its own — you see a flat list of tagged children and have to reconstruct the grouping mentally.

Vue's `<template #name>` and Svelte's `{#snippet name}` both group instead, and Figma's canvas behaviour is the same idea: content is placed *inside* the named region, never tagged with which region it belongs to. Three independent systems reached the grouped form; the format follows.

### `slot` is an attribute on a container, not a tag of its own — because the slot carries layout

This is the row of the survey where Figma is alone, and it is right to be. A slot in Figma *is* an auto-layout frame: give it a horizontal direction and a gap and every inserted item obeys them. That is genuinely a property of the hole, not of the content, and no framework needs it because none of them owns layout.

A standalone `<slot>` tag cannot express it. The tag would need its own direction attribute, which forks [RFC-0006](0006-layout-sugar-tags.md)'s rule that direction lives in the tag name — or it would need wrapping in a `<col>`, which says the wrong thing and makes one Figma node into two.

Flagging an existing container solves all of it. The slot inherits the entire layout vocabulary for free — direction, `gap`, `p`, `align`, `w`/`h`, grid tracks — with no new attribute, no fork, and a 1:1 mapping to what Figma does when it converts a frame into a slot.

It also matches a convention the format already has twice. `mask` is a boolean presence whose `mask-src`, `mask-width`, `mask-height` mean nothing without it; `border` has `border-color`, `border-width`, `border-align`. `slot` with `slot-accept`, `slot-min`, `slot-max` is the third instance of that pattern, and any future slot property joins the family by name.

And fallback content falls out at no cost: the container's existing children *are* the default, which is exactly what `resetSlot()` restores.

### Every slot is named, though React and Vue both have an anonymous default

The anonymous default exists in frameworks because the component definition is a keystroke away — you can always look. A `.guix` document is read by an agent that has been handed one file, and increasingly authored by one ([P7](../PRINCIPLES.md)).

Under an anonymous default, `<instance component="comp-card"><text value="…" /></instance>` cannot be understood in isolation: whether that text is valid, and where it lands, depends on a component the reader may not have open. Naming every slot costs one line and makes every instance self-describing. Figma agrees — slots there are always named properties.

Rule 2 is the other half of the same idea. An instance's children are *only* slots, so an instance never mixes content with fills, and remains what it has always been: a single element, whose children are named holes rather than a body.

### `slot-accept` enforces, `slot-min`/`slot-max` advise

Figma carries both as `SlotSettings`, and it is tempting to take all of it or none. Neither is right, because they are different kinds of statement.

`slot-accept` answers **what** — a tab bar is made of tab items. That is structural: it changes what the component *is*, a validator can check it, and it belongs to the component's public API in the same way `<prop type="color">` does. It errors.

`slot-min`/`slot-max` answer **how many**. They change nothing visual, and Figma itself only warns. Importing them as errors would silently change what the designer expressed. The format already has somewhere for advisory findings — the quality model of [RFC-0040](0040-quality-scoring-model.md) — so they go there, which preserves Figma's semantics exactly on a round trip while still giving an agent the guidance [P7](../PRINCIPLES.md) wants.

The same split disposes of the rest of `SlotSettings`. Preferred-instances-as-a-*suggestion* is an unenforced hint — an editor affordance, not design intent, and [P3](../PRINCIPLES.md) keeps what you cannot see out of a visual export; so the format carries only the enforced form. `displayEmptyByDefault` and `limitViolations` are canvas state. And `stretchChildOnInsert` needs no handling at all: it decides what sizing Figma gives a child *at the moment of insertion*, and the outcome is already recorded in that child's own `w`/`h`. The behaviour is the editor's; only the result travels.

### `slot-accept` means instances only, and that is a stronger rule than a filter

A constrained slot's children are a flat list of instances of the accepted components — not "any content, but components must be from this list." That makes the constraint an invariant rather than a filter: a validator walks the children checking two things, and a consumer knows a constrained slot is homogeneous without inspecting it.

The cost is that grouping is impossible inside a constrained slot — you cannot wrap two accepted items in a `<row>`. That is the right trade. If grouping is needed, either leave the slot unconstrained, or make the group a component and accept it too. A constraint should mean what it says.

### Component sets expand on read

`slot-accept="compset-tab-item"` is shorthand for every variant of that set, resolved when the file is read rather than transcribed when it is written.

The alternative — expanding at author time into an explicit list — would mean the set id never appears in a file, making it a tool convenience rather than a format feature, and adding a sixth variant would silently leave it unaccepted by every slot that meant "any tab item." Resolving on read is self-maintaining, keeps files shorter, and stays decidable offline because the set is declared in the same package, which is the property [RFC-0042](0042-multi-document-packages.md) works to preserve. Writing five ids where one says it better is configuration a convention should absorb ([P10](../PRINCIPLES.md)).

### Unfilled slots collapse, as a rule rather than an expression

Vue solves the empty-wrapper problem with `v-if="$slots.header"` — render the header only if something was passed. The format cannot do that, because it would be an expression evaluated at render time ([P6](../PRINCIPLES.md)).

Rule 8 gets the same outcome as a rendering rule instead. Without it, every scaffold with an optional slot draws an empty padded band and contributes a stray `gap` — visible, wrong, and common in exactly the case this RFC exists for.

### No scoping — and this is a trade, not a consensus

Vue's scoped slots, React's render props, and Svelte's snippet parameters all pass data into content. Figma, Angular, and Web Components do not. Three of six, so this is not a settled question in the field and should not be presented as one.

The format declines it because scoping requires an expression evaluated at render time, which is precisely where [P6](../PRINCIPLES.md) divides the language from the renderer. A scoped slot is a small template language, and the moment one exists every consumer must implement it identically or files stop meaning one thing. That the two *design* systems in the survey independently declined it is evidence the restriction sits naturally in a visual format — not proof that it is free.

### Reuse is already solved, so no snippets

Svelte deprecated slots in favour of snippets, whose distinguishing power is that a named chunk of markup can be rendered in several places. The lesson is that a reusable subtree should be a named thing with an identity — and the format already has that primitive. It is a component. A component with no props is exactly "markup with a name," so nothing further is needed.

### It resolves RFC-0042's open question about libraries

[RFC-0042](0042-multi-document-packages.md) flagged a case it could not settle: a `component`-typed prop on a library component, passed a component defined locally in one document, would make the library depend on that document — a shared declaration resolving differently per document is what `library.guix` exists to prevent.

Slots do not have this problem, structurally. With `type="component"` the value travels *into* the library component's body, so a document completes the library's definition. With a slot the content stays in the document's own instance; the library declares a hole and never learns what fills it. The dependency points the right way: documents depend on the library, the library depends on nothing.

That makes slots the correct mechanism for the scaffold case and `type="component"` the wrong one. Both stay — swap a *definition*, fill with *content*.

## Drawbacks

- **The byte saving is small, and the RFC should not be defended on it.** 4.7% on the measured set. The case rests on identity and drift, not size — and anyone arguing this on token count will be refuted by the table in *Context*.

- **`<instance>` stops being a leaf.** Every parser, serializer, and optimizer that assumed self-closing must change. Existing files stay valid; existing code does not stay correct.

- **The detach heuristic needs a carve-out.** Rule 10 is a rule someone has to implement correctly, and getting it wrong detaches exactly the instances this RFC is for.

- **Recursion is newly possible.** Nothing before this could refer to itself. The check is static and cheap, but it is a class of error the format did not have.

- **Constrained slots cannot group.** An accepted consequence, argued above, but it will surprise someone building a toolbar with two clusters of buttons.

- **Two ways to pass a component.** `type="component"` swaps by id; a slot takes content. The distinction is principled but it is still two mechanisms to tell apart, which [P12](../PRINCIPLES.md) dislikes.

- **Some design-system intent is lost on export.** A Figma slot with preferred-but-not-enforced instances, or with min/max treated as hard limits by a team's convention, exports as something looser. Nothing renders differently; a library author's intent is thinner.

- **It makes the wrong thing easier.** A component that is four slots and no props is a `<col>` with extra steps. Nothing here prevents it, and [RFC-0040](0040-quality-scoring-model.md) may need an opinion.

## Alternatives Considered

**A standalone `<slot>` tag** — Rejected. It cannot carry the slot's layout without either inventing a direction attribute, forking [RFC-0006](0006-layout-sugar-tags.md), or being wrapped in a container — which says the wrong thing and turns one Figma node into two.

**A `slot` prop type, as React models it and Figma declares it** — Rejected. A hole is a place in a tree, not a value, and `<props>` declares values. Figma's own API splits the declaration from the content, so copying it puts one fact in three places; and since the settings are not carried wholesale, the props entry would hold little the body does not already state.

**A `slot` attribute on every child, as Web Components do** — Rejected. It repeats the name once per child and leaves an instance unreadable on its own.

**Selector routing, as Angular does** — Rejected. `select` is the enforced form of content matching, and it costs a selector grammar inside the language plus `ngProjectAs` as an escape hatch for when the selector misfires. `slot-accept` gets the useful part with a list of ids.

**An anonymous default slot** — Rejected. Convenient in the single-hole case, at the price of an instance that cannot be understood without opening the component it points at.

**`slot-items` for an exact count** — Rejected. `slot-min="3" slot-max="3"` already says it, and a third attribute creates a precedence question when combined with the other two. More fundamentally, a fixed count is usually a sign the design wants *named* slots rather than one slot — three named cells can be constrained and filled independently, which is strictly more expressive.

**Carrying `SlotSettings` wholesale** — Rejected under [P3](../PRINCIPLES.md)/[P5](../PRINCIPLES.md). Argued in *Reasoning*; reopenable if unenforced preferred instances turn out to carry weight that the enforced form cannot.

**Scoped slots** — Rejected under [P6](../PRINCIPLES.md).

**A variant per content shape** — Rejected. Combinatorial and false.

**Do nothing; keep detaching** — The honest status quo. Rejected because it discards component identity where it is worth most, because [RFC-0042](0042-multi-document-packages.md) makes the cost worse by giving libraries something they cannot hold, and because the concept is now standard across every system in *Prior Art* — including the format's primary extractor, which means the export path is no longer merely limited but lossy against what designers actually produce.

## Unresolved Questions

- **Must component ids be unique package-wide?** Inherited from [RFC-0042](0042-multi-document-packages.md) and sharper here: slot content in one document may hold instances of library components and document-local components in the same subtree, and `slot-accept` names ids that must resolve unambiguously across that boundary.
- **What does the extractor do with the settings the format drops?** A Figma slot with unenforced preferred instances or hard min/max has intent that will not survive. Refusing the import is more honest; degrading quietly is friendlier. The export path needs a stated rule rather than whatever falls out.
- **Does the quality model score slots?** [RFC-0040](0040-quality-scoring-model.md) counts dead weight and redundant wrappers. An unfilled slot, a slot holding a single text node, and a component that is only slots are shapes it has no opinion on — and `slot-min`/`slot-max` findings need a home in its buckets.
- **How does `slot-accept` interact with a detached instance?** If an accepted instance diverges enough to be emitted as an inline tree ([RFC-0035](0035-detached-from.md)), it is no longer an `<instance>` and rule 7 would reject it — but it still carries a `detached-from` origin naming an accepted component.
- **Should a slot be able to require content?** There is currently no way to say "this slot must be filled." `slot-min="1"` says it advisorily; nothing says it structurally, and it is not obvious that anything should.
