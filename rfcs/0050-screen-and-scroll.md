---
rfc: 0050
title: Screen and scroll — screen size, scrolling regions, pinned edges
status: Draft
targets: 0.5
date: 2026-10-18
depends-on: 0021, 0045, 0048
---

# Screen and Scroll — Screen Size, Scrolling Regions, Pinned Edges

## Context

A `.gui` file cannot say that anything scrolls, or that anything stays put while the rest scrolls. Building a real app with it ([RFC-0048](0048-motion.md), *Test Cases*: `8-demo/sable`) made the gap impossible to ignore:

- **The tab bar scrolled away with the content.** Every mobile app pins its tab bar, its header, or its floating action button. Without a way to say so, a prototype of any real app is wrong on its first scroll.
- **Horizontal strips were exported as clipped.** A gui.farm design (Haven) has a row of room chips written as `clip="true"`. The designer meant a strip you swipe sideways; the file can only say "cut off".
- **Nothing says how tall the screen is.** [RFC-0021](0021-root-canvas-model.md) made the root's `h` the *content* height, and rightly removed the need for an author to predict it. But scrolling and pinning need a different fact — the height of the *screen* the content scrolls inside. A player had to guess 844.

### What the format has today

| What | Where | Problem |
|---|---|---|
| `clip` | spec | Hides overflow. Nothing can scroll |
| `overflow-x`, `overflow-y` with `hidden visible scroll auto` | Only the generated reference and the kit renderer; no RFC, not in the spec | CSS words passed through — a foreign dialect ([P8](../PRINCIPLES.md)). No file uses them |
| Screen scrolling | Nowhere | Players assume it |
| Fixed or sticky elements | Nowhere | — |

### Prior art

Every platform and design tool has the same three concepts, under different names:

| | Scrolling region | Stays at an edge | Screen size |
|---|---|---|---|
| CSS | `overflow` + `scroll-snap-type` | `position: sticky` / `fixed` | the viewport |
| SwiftUI | `ScrollView(.horizontal)`, paging | `.safeAreaInset`, toolbars | the device |
| Compose | `LazyRow` / `LazyColumn`, `HorizontalPager` | `Scaffold` top and bottom bars | the window |
| Figma prototypes | Overflow scrolling: horizontal, vertical, both | "Fix position when scrolling", "Sticky" | Frame size and device preset |

## Decision

### 1. `screen` on `<gui>`: how big the screen is

```xml
<gui version="0.5" name="Goals" platform="android" screen="360 800">
  <col w="360"> … content of any height … </col>
</gui>
```

- **What it is:** the size of the screen the design is viewed on — width, then height ([P8](../PRINCIPLES.md): first = horizontal, second = vertical).
- **Where it lives:** on `<gui>`, beside `platform` ([RFC-0036](0036-gui-meta-block.md)), because it describes the device, not the layout.
- **The first value matches the root's `w`.** A mismatch is a lint finding.
- **Absent, with a `platform`:** the renderer uses that platform's reference screen (recommended values documented like `platform` values; not validated).
- **Absent, with no `platform`:** the whole content is the screen. Nothing scrolls; a bottom pin sits at the end of the content. This is the behaviour of every file today, so nothing changes for existing files.
- **A fixed artboard (`<frame w h>`) is its own screen.** Its `h` is both content and screen height; `screen` is redundant there.

**Why this is not RFC-0021's `viewport` again.** RFC-0021 removed `viewport` because it duplicated the root's size and forced authors to predict a content height the layout engine computes. `screen` is neither: it states a fact about the device, which an author knows (a 360 × 800 Android phone) and the engine cannot derive. The content height stays computed.

### 2. The screen scrolls by default

When content is taller than the screen, the screen scrolls vertically. No attribute ([P10](../PRINCIPLES.md)): it is what every app screen does.

### 3. `scroll` on a container: a region that scrolls inside its own box

```xml
<row w="fill" gap="8" scroll="x"> … chips … </row>             <!-- a sideways strip -->
<row w="fill" gap="12" scroll="x snap"> … cards … </row>        <!-- a carousel that stops on each card -->
<col h="320" scroll="y"> … messages … </col>                    <!-- a list inside a panel -->
```

| Value | Means |
|---|---|
| `x`, `y`, `both` | The direction it scrolls |
| `snap` | Scrolling stops with a child aligned to the start — carousels, story strips, pagers |

- **Inline-multiple, order-free** ([P11](../PRINCIPLES.md)): `scroll="snap x"` is the same value.
- **Scrolling implies clipping.** `clip` stays, for "cut off, does not scroll".
- **Children keep their size along the scroll direction.** They never shrink to fit. (Found in testing: without this rule, the Haven chips squeezed instead of scrolling.)
- **The container needs a bound in that direction** — a fixed size, `fill`, or a parent that bounds it. An unbounded scroll region is a lint finding: it would grow to fit and never scroll.
- **Replaces `overflow-x` and `overflow-y`.** One way to say it ([P12](../PRINCIPLES.md)); the CSS words leave the reference.
- **Scroll indicators, bounce, momentum** are each platform's own ([P6](../PRINCIPLES.md)). The file does not say.

### 4. `pin` on a node: stays at an edge while its scroll container scrolls

```xml
<row role="tab-bar" pin="bottom"> … </row>
<row role="top-navigation-bar" pin="top"> … </row>
<text pin="top" value="Yesterday" />          <!-- a section header inside a scrolling list -->
```

| Value | Means |
|---|---|
| `top` | Sticks to the top edge once it reaches it |
| `bottom` | Sticks to the bottom edge once it reaches it |

- **Relative to the nearest scroll container** — the screen by default, or an enclosing `scroll` region. So the same property gives a fixed tab bar on the screen and a sticky section header inside a list.
- **One rule covers "fixed" and "sticky".** A node that starts at the edge never leaves it (a tab bar, a top bar). A node that starts further in scrolls until it reaches the edge, then stays (a section header). Figma's two settings, and CSS's `fixed` and `sticky`, are this one behaviour seen from two starting points.
- **A bottom pin is attached to the screen's bottom edge even when content is shorter than the screen.** Found in testing: CSS-style sticky left the Insights tab bar floating under its short content. The screen's content area extends to at least the screen height, and the pinned node sits at its bottom.
- **Several pins at one edge stack** in document order.
- **`pin` with no scroll container above it** does nothing, and is a lint finding.
- **Pin a group, not each piece.** A floating action button and a tab bar that move together are one pinned container.

### 5. How it meets motion and connections

- **`enter` "when it appears"** ([RFC-0048](0048-motion.md)) uses the nearest scroll container, judged by each node's resting box.
- **`#id` destinations** ([RFC-0049](0049-connections.md)) scroll the nearest scroll container that holds the node.
- **A host may set scroll position live**; the file never stores one.

## Reasoning

### Why these belong in the format

Scrolling and pinning change what a person sees and can reach — they pass P3 as amended by [RFC-0045](0045-describe-dont-run.md) ("everything you can see — including how it moves"). They pass the three questions: a model building the app needs to know the tab bar is fixed and the chips scroll (**Build**); they are among the first things that describe a mobile app's structure (**Learn**); every design tool stores them (**Move**). And they are declarations, not computation: the file says *that* a region scrolls; the renderer does the scrolling.

### Why `screen` on `<gui>`, not on the root

The root layout node describes content; its `h`, when present, means a fixed artboard. Putting the screen size there would give `h` two meanings. `<gui>` already carries `platform`, which is a fact about where the design is shown; screen size is the same kind of fact.

### Why one `pin`, not `fixed` and `sticky`

Design tools and CSS offer both, and authors routinely pick the wrong one. The difference is only where the node starts. One property, with behaviour that follows from position, is one obvious way ([P12](../PRINCIPLES.md)).

### Why not scroll-linked motion here

Parallax, shrinking headers and scroll progress are motion driven by scroll position — a second clock. They are deferred to their own RFC ([RFC-0045](0045-describe-dont-run.md), *Unresolved Questions*). This RFC covers only what scrolls and what stays.

## Alternatives Considered

**Keep `overflow-x` / `overflow-y`** — Rejected. CSS vocabulary, undocumented, and a second way to clip.

**A `<scroll>` container tag** (listed in *Deferred to v2*) — Rejected. Scrolling is a property of an existing container, not a new kind of node ([P11](../PRINCIPLES.md): a property before a tag). A `<scroll>` tag would need its own layout direction and duplicate `row` and `col`.

**`position="fixed"` / `"sticky"`** — Rejected. CSS words, two concepts for one behaviour, and `position` already means placement in absolutely positioned frames.

**Screen size on the root (`viewport-h`)** — Rejected. See *Why `screen` on `<gui>`*.

**Infer screen size from `platform` only** — Rejected as the only route. Platforms have many screen sizes; designers pick one on purpose. The platform default is the fallback, not the rule.

## Test Cases

Exercised in the motion lab:

| Example | Proves |
|---|---|
| `8-demo/sable` and `sable-clean`, Goals | A pinned group (floating button + tab bar) at the bottom while 1,100 px of content scrolls in an 800 px screen |
| `8-demo/sable`, Insights | A bottom pin attached to the screen edge when content is shorter than the screen |
| `7-farm/haven-2-motion` | `scroll="x"` turning a clipped chip row into a sideways strip (555 px of chips in a 350 px box); `scroll="x snap"` on a row that fits and therefore does not scroll |

## Unresolved Questions

- **Recommended screens per platform.** Which reference sizes ship as defaults (e.g. iOS 390 × 844, Android 360 × 800, web 1440 × 900)?
- **Opting out of screen scroll.** Is there a real case for a content-driven screen that must not scroll? Leaning: no attribute until one appears.
- **Left and right pins.** Side rails in desktop layouts. Leaning: add only with an example.
- **Safe areas.** Notches and home indicators. Leaning: renderer computation from the platform, never in the file.
- **Responsive screens.** One design across several screen sizes is a larger question, named by the Penpot community thread ([RFC-0045](0045-describe-dont-run.md)); it builds on `screen` but is not settled here.
