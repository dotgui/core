---
rfc: 0049
title: Connections — which element leads where
status: Draft
targets: 0.4
date: 2026-10-17
updated: 2026-10-18
depends-on: 0042, 0045, 0046, 0048
---

# Connections — Which Element Leads Where

## Context

A `.gui` package can carry many screens ([RFC-0042](0042-multi-document-packages.md)), in order, but it cannot say how they relate. That this button opens checkout, that this icon opens a menu sheet, that tapping a toggle switches it on — none of it is representable. Two consequences follow:

- **A model reading the package learns screens, not apps.** How screens connect is the structure of an app — what is deeper, what is temporary, what is a sibling — and it is exactly what flow datasets exist to capture.
- **Every design tool stores it, and `.gui` drops it.** Figma, Penpot, and Sketch all keep prototype links inside the design file. Exporting one to `.gui` loses them, and importing the `.gui` elsewhere cannot restore them ([P1](../PRINCIPLES.md)).

[RFC-0045](0045-describe-dont-run.md) admits connections as part of the description and rules out logic. This RFC defines connections at the size that ruling allows: enough for an ideation-grade prototype — screens linked, overlays, back, components reacting to tap and hover — and nothing that has to be run to be understood.

### What design tools offer, and what this keeps

| Figma prototype feature | Here |
|---|---|
| Triggers: on tap, on drag, while hovering, while pressing, mouse enter/leave, after delay, key/gamepad | `tap`, `hover`, `press`, `appear <ms>`. Drag and key/gamepad are reported |
| Navigate to, back, open/close/swap overlay, scroll to, open link | All kept |
| Change to (variant), for interactive components | Kept |
| Transitions: instant, dissolve, smart animate, move, push, slide | Kept, via [RFC-0048](0048-motion.md) |
| Overlay position, close on outside click, background | Position and outside-dismiss kept; background reported |
| Set variable, conditionals, expressions, multiple actions | Not kept. Reported on export |

### Prior art in document formats

[RFC-0045](0045-describe-dont-run.md) surveys formats that added links and interactivity before `.gui` did. Every one of them settled on the same shape this RFC uses:

| Format | Declared actions | Triggers | Escape hatch |
|---|---|---|---|
| PDF | Go to a page, open a URL, hide, switch layers, submit or reset a form, named actions | Mouse up and down, enter and exit, page open and close, focus and blur | A `JavaScript` action — later banned in PDF/A and ignored by most viewers |
| PowerPoint | Hyperlink to a slide, to a URL, to another file | Mouse click, mouse over | "Run program" and "Run macro" — the parts that are now blocked |
| HyperCard | Go to a card | Mouse up, and others | HyperTalk |
| Adaptive Cards | Open a URL, show a card, toggle visibility, submit | Selecting an action | None. The host handles everything else |

Two lessons apply directly:

- **A closed set of declared actions and triggers is enough for navigation and simple interaction,** and it is the part of every format that every viewer supports. This RFC's six destination kinds and its triggers are that set.
- **The escape hatch is always where it breaks.** Each format that let a link run code later had to wall it off. `.gui` has no escape hatch in the file: the host is the escape hatch, and it stays outside ([RFC-0045](0045-describe-dont-run.md)).

## Decision

### A connection is one `<link>`

```xml
<links>
  <link target="cta"    trigger="tap"        destination="02-signup.guix" transition="$push-forward" />
  <link target="menu"   trigger="tap"        destination="menu.guix" presentation="overlay" align="bottom-center" />
  <link target="close"  trigger="tap"        destination="close" />
  <link target="back"   trigger="tap"        destination="back" />
  <link target="faq"    trigger="tap"        destination="#pricing" />
  <link target="help"   trigger="tap"        destination="https://help.example.com" />
  <link trigger="appear 1500" destination="01-welcome.guix" transition="fade 400" />
</links>
```

| Property | Value |
|---|---|
| `target` | The node that triggers it: an `id` or a path ([RFC-0046](0046-identity-and-source-ids.md)). On a screen-level link targeting the screen itself, omitted |
| `trigger` | `tap`, `hover`, `press`, or `appear <ms>` — the same vocabulary as [RFC-0048](0048-motion.md)'s triggers, under the same two tests (targets an element; discrete). `appear <ms>` fires that long after the screen appears; with no `target` it belongs to the screen |
| `destination` | Where it leads. Its kind is inferred from its form — see below |
| `transition` | How the change looks: a [RFC-0048](0048-motion.md) transition value or `$token`. Default `none` |
| `presentation` | `replace` (default) or `overlay` |
| `align` | For overlays: 9-point position ([RFC-0012](0012-align-9point.md)). Default `middle-center` |
| `dismiss` | For overlays: `outside` closes the overlay on a tap outside it |
| `backdrop` | For overlays: a colour or `$token` laid over the screen behind, e.g. `backdrop="#00000080"`. Absent = none |
| `hook` | A name for real behaviour a host performs at this point — `hook="checkout.pay"`. The link's `destination` is what a prototype shows; a host may bind the name to real logic. Never code |

### Destinations — one property, kind inferred from form

| Form | Kind | Does |
|---|---|---|
| `02-signup.guix` | Screen | Goes to that document in the same package |
| `https://…` | Link | Opens an external URL. A standalone document ([RFC-0043](0043-standalone-guix.md)) may also name another `.guix` by absolute URL |
| `back` | Back | Returns to the previous screen |
| `close` | Close | Dismisses the overlay this node is in |
| `#pricing` | Scroll | Scrolls to the node with that `id` in this screen |
| `toggle-on` | Variant | Switches an instance to that variant of its set — see *Interactive components* |

Every form is distinguishable by shape alone — a `.guix` suffix, a scheme, a keyword, a `#`, or a bare id — so no `type` attribute is needed. This is the `border` model: one value, type inferred ([RFC-0022](0022-fill-and-border.md)).

### Where links live

A `<links>` block belongs to the **declarations half** of the thing it connects ([RFC-0042](0042-multi-document-packages.md) describes the two halves of a document):

- **In a screen document**, beside `<tokens>` and `<components>`: links for nodes in that screen.
- **Inside a `<variant>`** of a component set: links for nodes in that variant. This is how interactive components work.

Links never sit in the layout tree. A screen's tree is the same with or without them, and deleting every `<links>` block leaves a valid, purely visual package.

### Interactive components

```xml
<component-set name="Toggle" id="compset-toggle" transition="smart 200 $snappy">
  <variant id="toggle-off" state="off">
    <links><link target="track" trigger="tap" destination="toggle-on" /></links>
    <row id="track"> … </row>
  </variant>
  <variant id="toggle-on" state="on">
    <links><link target="track" trigger="tap" destination="toggle-off" /></links>
    <row id="track"> … </row>
  </variant>
</component-set>
```

- A variant destination in a component's links switches **the instance the tap happened in**. Every toggle on a screen works on its own, as in Figma.
- A variant destination in a screen's links switches **the instance named by `target`**.
- The switch looks the way the component set's `transition` says ([RFC-0048](0048-motion.md)), unless the link gives its own.
- `hover` and `press` links hold while the trigger lasts and return when it ends — "while hovering" and "while pressing" in Figma. `tap` stays switched.

### Hooks: naming the logic the file does not hold

```xml
<link target="pay" trigger="tap" destination="05-done.guix" hook="checkout.pay" />
```

A prototype player follows the link and shows the success screen. A real app, or a prototype engine with data, binds `checkout.pay` to actual behaviour — charge the card, then decide where to go. The file stays readable: it says *where* behaviour lives and *what* the designed path is, never how the behaviour works ([RFC-0045](0045-describe-dont-run.md), "Named").

- **A dotted, lower-case name** (`checkout.pay`, `auth.sign-in`). Hosts agree on names with their app; the format assigns no meaning to them.
- **Always beside a destination.** A hook never replaces the designed path; a reader without a host still sees where the flow goes.
- **Valid on any link**, including links inside components.

### Overlays and backdrops

`backdrop` is part of the presentation, not the overlay's own design: the same sheet can be opened dimmed from one screen and undimmed from another. When absent, nothing is laid behind the overlay. Found building the Sable sheet: without a backdrop the sheet read as unfinished, and drawing a full-screen scrim inside the overlay document would tie the sheet to one screen size.

### Links inside library components

Links inside a component in `library.guix` travel with the component into every document that uses it. A tab bar is one component set in the library, each variant holding the links to its sibling screens; screens use `<instance component="tabbar-goals" />` and get working tabs. Destinations name documents in the same package.

### The rules

1. **`target` must resolve.** A link to a missing id or path is an error ([RFC-0046](0046-identity-and-source-ids.md)).
2. **A destination must resolve.** A screen missing from the package, a variant outside the target's set, or an `id` missing for `#` is an error.
3. **One link per target per trigger.** Two `tap` links on the same node is an error. Without conditions there is no way to choose between them, and guessing would break [P14](../PRINCIPLES.md).
4. **One destination per link.** No action lists.
5. **No conditions, no variables, no expressions** ([RFC-0045](0045-describe-dont-run.md)). On export, a source tool's conditional or variable-setting actions are dropped and reported; the links around them are kept. Where a conditional has branches, the exporter keeps the branch the source tool would take with its variables at their defaults, and reports the rest.
6. **The first screen** is the first document in the package's order ([RFC-0042](0042-multi-document-packages.md)). No separate start marker.

## Reasoning

### Why connections, under "describe, don't run"

A connection is read, not run: "this button leads to checkout, with a push" is a fact about the app, true whether or not anything plays it. It passes the three questions of [RFC-0045](0045-describe-dont-run.md):

- **Build:** a model building the app knows the navigation structure and which presentations are temporary.
- **Learn:** a model reading the package learns how screens relate, and the transition tells it what kind of relationship — push for deeper, overlay for temporary, fade for sibling.
- **Move:** Figma, Penpot, and Sketch links export to these and import back.

### Why logic stays out

Conditions and variables answer questions only against state. A reader cannot know where a conditional link leads without evaluating it, which is the definition of running. Finite logic was considered and rejected in [RFC-0045](0045-describe-dont-run.md). Rule 3 is the consequence that keeps the format honest: with no way to choose, there may be nothing to choose between.

### Why links live with what they connect

A separate `flow.guix` was the design while logic was in scope, to keep screens free of it. Without logic, links are plain declarations, and the natural home is next to the screen or variant they belong to: an interactive component carries its own links into every file it is used in, and a standalone screen ([RFC-0043](0043-standalone-guix.md)) can carry its links without a package. Keeping them in the declarations half, never in the tree, preserves what `flow.guix` was for — the visual tree is untouched.

### Why one `destination`, not one property per kind

Figma's actions (navigate, back, overlay, scroll, open link, change to) are six kinds of one thing: where the interaction leads. One property with a shape-inferred value keeps a link to four attributes, and adding a kind later adds a form, not a property ([P12](../PRINCIPLES.md)).

### Why `presentation` is only `replace` or `overlay`

Whether a destination replaces the screen or sits on top of it is structure; how it arrives is transition. "Sheet," "modal," "popover," and "toast" are combinations of the two — an overlay aligned bottom-center, sliding up, is a sheet. Naming them would add platform-flavoured vocabulary ([P2](../PRINCIPLES.md)) for things already expressible. Whether a model *learns* "sheet" as well from the combination as from a name is open (see below).

## Alternatives Considered

**A separate `flow.guix` document** — Rejected now that logic is out. See *Why links live with what they connect*.

**Link attributes on tree nodes** (`<row link="02-signup.guix">`) — Rejected. Puts prototype data in the visual tree, and a node with several triggers needs several attributes.

**Finite state variables and conditions** — Rejected in [RFC-0045](0045-describe-dont-run.md). Hooks cover the real need — marking where logic happens — without the file evaluating anything.

**A hook that carries code or an expression** (`hook="if(user) …"`) — Rejected. That is the escape hatch PDF and Flash added and later walled off ([RFC-0045](0045-describe-dont-run.md), *Prior Art*).

**Multiple actions per trigger** — Rejected. Without variables, the realistic combinations (navigate *and* set a variable) lose their second half anyway; one destination keeps a link readable.

**Named presentations (`sheet`, `modal`, `popover`)** — Rejected for now. See *Why `presentation`*.

**`long-press` and `swipe`** — Deferred. Both pass the two trigger tests, but no design tool stores them; added when a real file needs them ([P12](../PRINCIPLES.md)).

**Drag and key triggers** — Rejected. Drag tracks live input; key and gamepad mappings are platform-specific. Both belong to a host.

**An explicit start screen** — Rejected. Package order already defines the first document.

## Test Cases

Exercised in the motion lab alongside [RFC-0048](0048-motion.md): `6-flows/onboarding` (screen-level `appear` auto-advance, `push`, `fade`, `slide`, `back`), `6-flows/shop` (`smart` between screens, overlay `align`, `dismiss="outside"`, `close`), `6-flows/toast` (self-closing overlay), and `5-components/*` (variant destinations from component links, `hover` links that hold and return). The [RFC-0048](0048-motion.md) *Test Cases* table lists what each proves.

## Unresolved Questions

- **Named presentations.** `overlay` + `align` + `transition` expresses a sheet, but a model may learn "sheet" better from the word. If **Learn** says so, `presentation` gains `sheet` and `popover` as named forms that normalise to overlay plus defaults.
- **Overlay background.** Settled: `backdrop` on the link (above).
- **Scroll containers.** Prototypes need content that scrolls inside a fixed frame (`<scroll>` is in *Deferred to v2*). Leaning: a `scroll="y"` property on containers, argued in its own RFC.
- **`back` with no history.** On the first screen, does `back` do nothing, or is a link to `back` there an error? Leaning: nothing, since history is the player's, not the file's.
- **Library links.** Settled: they travel with the component (above).
- **Hook names across apps.** Should common hooks (`auth.sign-in`, `checkout.pay`) have recommended names, so AIs and hosts agree? Leaning: a short recommended list, never validated.
