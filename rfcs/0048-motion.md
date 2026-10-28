---
rfc: 0048
title: Motion — how a design moves, as a spec
status: Draft
targets: 0.5
date: 2026-10-17
updated: 2026-10-18
depends-on: 0045, 0046
---

# Motion — How a Design Moves, as a Spec

## Context

A `.gui` file today is a still picture. Interfaces are not: buttons respond to a press, menus fade in, sheets slide up, lists cascade in, spinners turn, a toggle's knob glides across. Motion also carries meaning a still frame cannot — a push says "deeper," a sheet says "temporary," a shared element growing into a page says "this is the same thing, expanded." Under [RFC-0045](0045-describe-dont-run.md) the format admits motion as part of the description, on one condition: it is written as a **spec** a reader can understand without playing it, never as code that produces movement.

### What every motion system agrees on

Surveyed: Motion (motion.dev, React and vanilla), Motion for Vue (motion-v, @vueuse/motion), anime.js v4, GSAP 3, CSS (transitions, animations, `@keyframes`, View Transitions), SwiftUI, Jetpack Compose, Figma (prototype transitions and Figma Motion), Lottie, and Rive.

| Concept | Motion | anime.js | GSAP | CSS | SwiftUI / Compose | Figma |
|---|---|---|---|---|---|---|
| Duration, delay, ease | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cubic-bezier | ✓ | ✓ | plugin | ✓ | ✓ | ✓ |
| Spring as duration + bounce | ✓ | ✓ | — | via `linear()` | ✓ (iOS 17) | mass/stiffness/damping, converts exactly |
| Keyframes at % offsets, ease per segment | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Repeat and alternate | ✓ | ✓ | ✓ (`yoyo`) | ✓ | ✓ | — |
| Hover / press / appear triggers | ✓ | — | — | partial | ✓ | ✓ |
| Stagger | ✓ | ✓ | ✓ | — | — | — |
| Shared element matched by a string id | `layoutId` | — | — | `view-transition-name` | `matchedGeometryEffect` / `sharedElement` | Smart Animate (by layer name) |
| Units | s | ms | s | both | s / ms | ms |

What none of them can share, and every report recommended against: callbacks, function-valued properties, randomness, scroll timelines (web-only), state machines (Rive), `steps()`, per-keyframe springs, and timeline position glyphs (`<` means a segment's *end* in anime.js and its *start* in GSAP).

Lottie and Rive solve a different problem — self-contained vector animation with its own player — and stay what they already are in `.gui`: assets.

### Prior art in document formats

[RFC-0045](0045-describe-dont-run.md) surveys formats that added motion before `.gui` did. Four findings bear directly on this RFC:

- **Presentation software already classifies element motion the way this RFC does.** PowerPoint sorts animations into *entrance*, *emphasis*, and *exit*. Here those are `enter`, `tap` (one-shot feedback), and `exit`. The classification is decades old and familiar to every designer.
- **Matching by name is how every tool animates between two states.** PowerPoint's Morph matches objects across slides by name, Keynote's Magic Move matches identical objects, Figma's Smart Animate matches layers by name and hierarchy. `smart` matches by `id`.
- **The timing tree is where presentation animation gets heavy.** PowerPoint chains animations with "with previous" and "after previous," nests them in a timing tree, and adds motion paths. That machinery is what this RFC deliberately leaves out: delay and stagger cover choreography for UI.
- **PDF declares page transitions as data.** Wipe, dissolve, push, cover, and fade, with a duration, written on the page and played by any viewer in presentation mode — the same shape as this RFC's transition styles.

## Decision

### The guardrails

Every motion feature, now and later, must pass all six. They apply [RFC-0045](0045-describe-dont-run.md) to motion.

| # | Guardrail | Test |
|---|---|---|
| 1 | **Design, not product logic** | Would a designer put it in a motion spec? "When the API returns" fails. |
| 2 | **Belongs to the element** | Is its trigger part of the element itself — appearing, leaving, hover, press, a state change? Not app events. |
| 3 | **Time-driven and deterministic** | Same file, same animation, every time. No live input, no randomness, no computed values. |
| 4 | **Presentation only** | It changes how things look, never structure, content, or layout. Layout changes happen between states, and motion only describes how that change looks. |
| 5 | **Safe to ignore** | Remove all motion and the design is still correct at rest. |
| 6 | **Portable** | Expressible in CSS, SwiftUI, and Compose. |

### 1. The rest-state rule

> **A node's own attributes are always its resting state. A motion describes only the other side.**

| Trigger | Plays |
|---|---|
| `enter` | from the motion to the resting state |
| `exit` | from the resting state to the motion |
| `hover`, `press` | from the resting state to the motion while the trigger lasts, then back |
| `tap` | from the resting state to the motion and back to rest, once per tap |

So every file still renders as a correct still picture: the resting state is what is drawn, and a reader that ignores motion loses nothing visible (guardrail 5, [P15](../PRINCIPLES.md)).

### 2. Triggers — five properties on any node

```xml
<col  enter="rise">                         <!-- built-in preset -->
<text enter="rise 400 120">                 <!-- 400 ms, 120 ms delay -->
<row  hover="lift" press="sink">
<img  exit="fade 200 ease-in">
<svg  tap="$shake">                         <!-- one-shot feedback: rest → motion → rest -->
<ellipse enter="pulse">                     <!-- a looping motion: starts on appear, keeps going -->
```

**Which triggers, and why only these.** A trigger is admitted only if it passes two tests:

1. **It targets an element.** The user does something *to this node* — points at it, presses it, taps it — or the node itself appears or leaves. Shake, tilt, keyboard shortcuts, and app events happen to the device or the app; there is no layer for them to belong to.
2. **It is discrete.** It completes as an event. Continuous input — a finger's position during a drag, scroll position, cursor coordinates — is a formula fed every frame, which has to run ([RFC-0045](0045-describe-dont-run.md)).

`enter`, `exit`, `hover`, `press`, and `tap` pass both, and every design tool stores them. `swipe` and `long-press` also pass both; they are left out until a real file or tool needs them ([P12](../PRINCIPLES.md)). Everything that fails a test belongs to a host, which can still drive anything the file declares by `id`.

- **Value:** one inline-multiple string, order-independent and type-inferred like `border` ([RFC-0022](0022-fill-and-border.md)):
  - a motion — a built-in preset name, or `$token`
  - numbers — the first is duration, the second is delay (the `first = primary, second = secondary` rule of `p` and `gap`)
  - an ease — keyword, function, or `$token`
- **`enter`** plays once, when the node first appears — when its screen starts to appear, or when it is scrolled into view. One trigger across platforms, rather than separate "mount" and "in view."
  - **Appearing is judged by the node's resting box, not its starting position.** A tab bar whose `enter` starts 90 px below the screen edge still appears when its resting place is on screen. (Found in testing: judging by the starting position means the motion never starts.)
  - **It starts as the screen starts to appear**, so entrances play during a screen transition, not after it.
- **`exit`** plays when the node leaves: its screen is navigated away from, its overlay is dismissed, or a state change removes it.
- **`hover`** and **`press`** hold while the pointer hovers or the press is held, and return when it ends. On a platform without hover, `hover` does nothing — it is not mapped to something else.
- **`tap`** plays the whole motion once per tap and ends at rest: a single key is reached at the midpoint and left again. It is for feedback — a shake on a wrong password, a heart that pops — that leaves nothing changed. A tap that *changes* something switches a variant ([RFC-0049](0049-connections.md)).
- **Looping is not a trigger.** A motion with `repeat="infinite"` keeps playing after its trigger. A spinner is `enter="spin"`.
- **Units:** milliseconds, unitless — matching Figma, Compose, anime.js, and CSS `ms`.
- **Defaults:** duration `300`, delay `0`, ease `ease-out`.

### 3. Stagger

```xml
<col enter="rise 450 150" stagger="60"> … </col>       <!-- each child rises in turn, 60 ms apart -->
<text enter="rise 500" stagger="40 word">Ship designs that move</text>
```

- **`enter` + `stagger` on a container distributes the `enter` to its children,** in document order, each one `stagger` ms after the previous. The container itself does not move. This is Motion's `staggerChildren`, and it means a list of twenty rows says `rise` once, not twenty times.
- **On `<text>`, the units are parts of the text:** `word` (default), `char`, or `line`. Same rule — the text's `enter` plays on each unit in turn.
- **A child with its own `enter` keeps it** and still takes its place in the sequence.
- The stagger offset adds to the trigger's own delay: `enter="rise 450 150" stagger="60"` starts the first child at 150 ms, the second at 210 ms.
- **Stagger applies whenever children appear, not only when the screen opens.** When a state change ([§8](#8-how-a-state-change-looks)) brings in new children of a staggered container — a filter swapping a list — they enter in turn too. Found building the Sable filter: without it, a new list arrived all at once.

### 4. Motion tokens

```xml
<tokens>
  <duration name="fast" value="150" />
  <easing   name="emphasized" value="cubic-bezier(0.2, 0, 0, 1)" />
  <easing   name="snappy"     value="spring(0.3)" />
</tokens>
```

**Easing values:**

| Form | Meaning |
|---|---|
| `linear`, `ease-in`, `ease-out`, `ease-in-out` | The CSS keyword curves |
| `cubic-bezier(x1, y1, x2, y2)` | Any curve. Universal across every platform surveyed |
| `spring(bounce)` | A spring. `bounce` from 0 (no overshoot) to 1. **`duration` stays authoritative** — the spring settles in the declared duration |

The spring is SwiftUI's duration-and-bounce model. It converts in closed form to every other system (mass 1: stiffness = (2π / duration)², damping = 4π(1 − bounce) / duration; Compose dampingRatio = 1 − bounce), so Figma's mass/stiffness/damping springs round-trip, and the web samples it into `linear()`.

### 5. Named motions — composite tokens

A motion is a composite token, the same shape as [RFC-0038](0038-composite-token-types.md)'s shadow token with its `<layer>` children:

```xml
<tokens>
  <motion name="drop-in" duration="500" ease="$snappy">
    <key offset="0 -40" opacity="0" />
  </motion>

  <motion name="heartbeat" duration="900" repeat="infinite">
    <key at="0%"  scale="1" />
    <key at="15%" scale="1.15" ease="ease-out" />
    <key at="30%" scale="1" />
  </motion>

  <motion name="shimmer" duration="1400" repeat="infinite" ease="linear">
    <key at="0%"   offset="-100% 0" />
    <key at="100%" offset="100% 0" />
  </motion>
</tokens>

<img enter="$drop-in" />
```

- **`<motion>` attributes:** `duration`, `delay`, `ease`, `repeat`, `alternate`.
  - `repeat` counts *extra* plays, as Motion, GSAP, and anime.js do: `repeat="2"` plays three times. `infinite` never stops.
  - `alternate` is a presence boolean ([RFC-0015](0015-boolean-presence-convention.md)): play back and forth. Renderers must add it to their list of presence attributes.
  - `ease` is the default for **every segment** between keys, as in CSS — not one curve across the whole run, as in GSAP. A key's own `ease` overrides the segment that starts at it.
- **`<key>`:** values at an offset `at` (a percentage). `ease` on a key applies to the segment that starts there (the CSS, GSAP, and anime.js rule).
- **A single key needs no `at`.** It is "the other side" of the rest-state rule.
- **Missing ends are the resting state.** If no key sits at `0%` or `100%`, the node's own values fill it — Motion's `null` keyframe, without a sentinel.
- **Trigger values override.** `enter="$drop-in 300"` plays `drop-in` in 300 ms.

### 6. The animatable properties — a closed list

| Property | Value | Notes |
|---|---|---|
| `opacity` | 0–1 | Existing property |
| `rotation` | degrees | Existing property. A key gives the absolute angle; a node resting at 10° animated to `rotation="360"` turns 350° |
| `scale` | one value, or `x y` | Two values follow `first = horizontal, second = vertical` |
| `offset` | `x y`, in px or `%` of the node's own size | A translation that does not affect layout. Not `x`/`y`, which already mean position |
| `fill` | a colour or `$token` | Solid fills only in v1. On `<text>`, the text colour |
| `blur` | px | Layer blur |
| `inset` | `top right bottom left`, px or `%` | Clips the node inward — for wipes and reveals. Four-value form of `p` |

None of these change layout, so they can be animated every frame without reflow. **The same list is what a host may set live** ([RFC-0045](0045-describe-dont-run.md)): cursor following is a host setting `offset` on a node by `id`. A renderer that cannot animate one of them reports it.

### 7. Built-in presets

Presets are motions the format pre-declares. There are five — the ones real files used. `spin` and `pulse` were presets in the first draft; across the Sable app they were never used, and as tokens they are three lines each (see `motion-lab/examples/1-basics/03-custom-motions`). Every preset name is permanent after 1.0, so the list holds only what earns it.

They are bare names; a file's own motions are `$tokens` — the same split as `fill="#fff"` versus `fill="$primary"`. A token may not reuse a preset's name.

| Preset | Key | Typical use |
|---|---|---|
| `fade` | `opacity="0"` | `enter`, `exit` |
| `rise` | `opacity="0" offset="0 16"` | `enter` |
| `pop` | `opacity="0" scale="0.9"` | `enter`, `exit` |
| `lift` | `offset="0 -2" scale="1.02"` | `hover` |
| `sink` | `scale="0.97"` | `press` |

### 8. How a state change looks

A component's variants are its states. Switching between them is a connection's job ([RFC-0049](0049-connections.md)); how the switch *looks* is design, so it sits on the component set:

```xml
<component-set name="Toggle" id="compset-toggle" transition="smart 200 $snappy">
  <variant id="toggle-off" state="off"> <row id="track"> <ellipse id="knob" … /> </row> </variant>
  <variant id="toggle-on"  state="on">  <row id="track"> <ellipse id="knob" … /> </row> </variant>
</component-set>
```

**`smart`** matches nodes across the two variants by `id` ([RFC-0046](0046-identity-and-source-ids.md)), **including the component's root**. A node present in both interpolates its position, size, `radius`, `opacity`, `rotation`, and `fill` (text colour on `<text>`). A node present only in the new variant plays its `enter` if it has one, and fades in otherwise; a node present only in the old variant fades out. Because layout is interpolated between two declared states, this is how accordions open, tabs move their underline, and a switch's knob slides — without motion ever changing layout itself (guardrail 4).

**`smart` moves the layout around the change, not only the component.** When a state change makes a component taller or shorter, everything after it moves to its new place over the same transition instead of jumping. This is computation a renderer does from the two layouts ([P6](../PRINCIPLES.md)); the file says nothing more. Found building the Sable filter, where the page below the list jumped.

**Matching between screens uses the nearest named instance.** When `smart` runs between two screens ([RFC-0049](0049-connections.md)), a node is matched by the `id` of the nearest enclosing instance that has one, plus its own `id`: `g-emergency/thumb`. Whatever wraps that instance — a filter panel, a list, a slot — does not count. So the same goal can be a card component on one screen and a hero component on the next, and its photo, name and amounts travel between them. Found building the clean Sable package: matching by full path failed as soon as the cards sat inside a panel component, and the expand carried nothing; with this rule it carried seven parts.

This settles [RFC-0046](0046-identity-and-source-ids.md)'s open question on cross-variant identity: **corresponding nodes in different variants carry the same `id`.** Matching is a reference, so the ids are not filler. Exporters derive them from what the source tool already matches (Figma matches by layer name and hierarchy).

### 9. Transition styles

The `transition` value — used on component sets here and on connections in [RFC-0049](0049-connections.md) — is one inline-multiple string: a style, a duration, an ease.

| Style | Meaning |
|---|---|
| `none` | Instant. The default |
| `fade` | Cross-fade |
| `smart` | Match by `id`, interpolate, fade the rest |
| `push <direction>` | The new view pushes the old one out; both move the full distance |
| `slide <direction>` | The new view slides in; the old one shifts a short way in the same direction (the iOS navigation feel) |
| `move <direction>` | The new view moves in over the old one, which stays still |

The direction is the direction of travel: `push left` brings the new view in from the right. Going back plays the same transition with the direction reversed.

Directions: `left`, `right`, `up`, `down`. Named transitions are scalar tokens:

```xml
<transition name="push-forward" value="push left 350 $emphasized" />
```

### 10. Rendering

- A renderer that does not support motion renders the resting state and reports that motion was present. It never approximates.
- Reduced motion is the renderer's call ([P6](../PRINCIPLES.md)): it may play `fade` in place of any motion, or nothing. The file does not say.

## Reasoning

### The rest-state rule is what keeps motion a description

If a motion could define where a node ends up, a file's still picture would depend on whether its animations had run. Making the node's own attributes the resting state, always, means the still picture is the design, motion is a description of how it arrives, leaves, and responds, and a reader that ignores motion is never wrong — only less informed.

### Why five triggers

`enter`, `exit`, `hover`, `press`, and `tap` are the triggers that pass both tests in §2 and that design tools store. The tests are what keep the list closed: a candidate either targets an element and completes as an event, or it belongs to a host. Focus is a document concern ([P5](../PRINCIPLES.md)). Drag tracks live input and belongs to a host. "In view" is not separate from "appears" on any platform that lazily lays out content (SwiftUI's `onAppear`, Compose's lazy lists), so one `enter` covers both. Looping needs no trigger because it is a property of the motion.

### Why duration + bounce for springs

Three spring parameterisations exist: physics (stiffness, damping, mass), response and damping fraction, and duration and bounce. Physics is unintuitive and lets a spring override the declared duration. Duration and bounce is two perceptual numbers with a meaningful zero, is what SwiftUI and Motion now lead with, and converts exactly to the others. Keeping `duration` authoritative means a spring is just an ease.

### Why motions are tokens

Motion is design-system material — Material and Apple both publish motion tokens beside colour and type. Making motions composite tokens means a file extends the vocabulary without new syntax, reuse is by name, and the tree stays clean: a node says `enter="$drop-in"`, never carries keyframes. Presets are the format's own tokens, written bare.

### Why `offset`, not `x` and `y`

Every animation library calls the translation `x`/`y`. In `.gui`, `x` and `y` already mean position in an absolutely positioned frame. Reusing them would give one name two meanings ([P8](../PRINCIPLES.md)). `offset` says what it is: a shift from where layout put the node.

### Why no timelines

Labels, positions, and nested timelines are how GSAP and anime.js choreograph scenes, and they are where the libraries diverge most. In UI, delay and stagger cover choreography: a hero that fades its title, then its subtitle, then its buttons is three delays. A timeline can be added later if real files need it; removing one cannot.

### Coverage

Measured against the motion.dev example catalogue:

| | Examples | Covered by |
|---|---|---|
| ✅ This RFC | Hover and press buttons, tooltips, toasts, menus, modal enter/exit, hero entrances, staggered lists, split-text reveals, spinners, jumping and pulsing dots, progress fill, skeleton shimmer, tickers, page wipes, colour changes | Triggers, keys, repeat, stagger, `inset`, `%` offsets |
| ✅ With [RFC-0049](0049-connections.md) | Switch, checkbox, tabs, accordion, dialog and sheet, page push/slide/fade, carousel autoplay, App Store card expansion, shared layout between views | Variant switching and screen connections with `smart` and directional transitions |
| Later | Scroll-linked: parallax, zoom on scroll, hiding header, scroll progress | A follow-up RFC ([RFC-0045](0045-describe-dont-run.md)) |
| Host | Cursor follow, magnetic targets, tilt, drag, swipe, momentum, reorder by drag, ripple from the touch point | Live input. A host sets animatable properties by `id` |
| Out | Scramble text, confetti, particles, count-up numbers, 3D, shaders, path drawing and morphing | Random, computed, or generative. Assets (Lottie, video) where needed |

### The three questions

- **Build:** every value maps to CSS, SwiftUI, and Compose directly or in closed form.
- **Learn:** a model reads `enter="rise 400"` or `transition="smart 200 $snappy"` and knows what happens, without playing anything.
- **Move:** Figma's transitions, easings, springs, and Smart Animate map onto this vocabulary and back. Figma Motion's keyframes map to `<key>`s.

## Test Cases

Every rule in this RFC was exercised in a working player before it was written down: `motion-lab/` in the workspace. It renders `.gui` with the kit renderer (patched at build time to carry ids and motion attributes into the DOM, the kit itself untouched) and plays motion and connections with the Web Animations API. Each example is editable live.

| Example | Proves |
|---|---|
| `1-basics/01-presets` | The presets; `hover` + `press` pair |
| `1-basics/02-trigger-values` | Duration, delay, ease, `$duration` and `$easing` tokens in one order-free value |
| `1-basics/03-custom-motions` | Single-key and multi-key motions; missing ends filled by rest; `tap` one-shot; `fill` animation; `repeat` + `alternate` |
| `1-basics/04-easing-and-springs` | Keyword, bezier, and `spring(bounce)` eases side by side; duration stays authoritative for springs |
| `2-choreography/01-staggered-list` | Container `enter` + `stagger` distributed to children |
| `2-choreography/02-text-reveals` | `stagger` by `word`, `char`, and `line`; `blur` |
| `2-choreography/03-dashboard` | Nested staggers; bars growing with two-value `scale` and the existing `transform-origin` |
| `3-loaders/01-loaders` | `spin`, staggered looping dots, `pulse`, progress fill, skeleton shimmer with `%` offsets, `inset` wipe |
| `4-feedback/01-buttons` | Custom hover and press motions (including `fill`), `tap`, a delayed looping attention cue |
| `5-components/01-toggle` | `smart` between variants: position and colour; each instance independent |
| `5-components/02-tabs` | `smart` moves and resizes an underline; label colours change |
| `5-components/03-accordion` | `smart` animates a size change between states; a node that exists only when open plays its `enter` |
| `5-components/04-like-button` | A "counter" as two declared states; a `hover` link that switches a variant and returns |
| `6-flows/onboarding` | `appear <ms>` auto-advance, `push`, `fade`, `slide`, `back` reversing the transition, `exit` before leaving, a `library.guix` holding transition tokens |
| `6-flows/shop` | `smart` between screens: shared `id`s move from card to page; overlay sheet with `align`, `move up`, `dismiss="outside"` |
| `6-flows/toast` | Overlay at the top; an overlay that closes itself with `appear <ms>` → `close` |
| `8-demo/sable`, `8-demo/sable-clean` | A 7-screen app built from a gui.farm design: filters swapping lists with staggered entrances, card → page shared elements through components, sheet, switch, pinned tab bar. The clean version uses library components and props |
| `7-farm/haven-1-original`, `haven-2-motion` | A real gui.farm design before and after: 44 changed lines add entrances, staggered chips and tiles, hover and press on every control, a pulsing live dot, a docked tab bar, and an interactive toggle component |

### What testing changed

Writing the player settled seven questions the first draft left open or got wrong. Each is now in the Decision:

1. **`enter` visibility is judged by the resting box.** Judged by the starting position, an element that enters from off-screen never starts.
2. **Entrances start as the screen starts to appear,** not after its transition ends.
3. **`enter` + `stagger` on a container distributes to the children.** The first draft offset children's *own* `enter`s, which made every child repeat the same motion.
4. **`tap` was missing.** One-shot feedback had no trigger; `press` only lasts while held.
5. **`repeat` counts extra plays,** following Motion, GSAP, and anime.js.
6. **A motion's `ease` applies per segment,** following CSS.
7. **`slide` and `move` were described identically.** They now differ: `slide` shifts the old view a short way; `move` leaves it still.

Three implementation notes for real renderers:

- `alternate` must be added to the renderer's presence-attribute list, or files using it fail to parse.
- `smart` must include the instance root in matching; otherwise a toggle's track colour does not animate.
- When a `hover` or `press` link swaps a variant, the new variant owns the release event — the element that received the pointer has been replaced.

## Alternatives Considered

**Keyframes inline on nodes** (`<col keyframes="…">`) — Rejected. Puts animation data in the tree on every use, with no reuse, and needs a packed value grammar for what `<key>` children carry plainly.

**Animation child elements, as SVG's SMIL does** (`<animate attribute="opacity" …/>` inside a node) — Rejected. Turns the tree into the div soup the format exists to avoid, and couples motion to structure.

**A CSS-style `animation` shorthand** (`animation="pulse 1s ease-in-out infinite alternate"`) — Rejected. Seven positional fields in one string fails [P7](../PRINCIPLES.md); the trigger properties carry the three that vary per use, and the rest live on the token.

**A separate timeline block targeting nodes by `id`** — Rejected for v1. Needed only for cross-node choreography that delay and stagger cannot express. Revisit with evidence.

**Physics springs (stiffness, damping, mass)** — Rejected as the authored form. Unintuitive, and lets a spring override duration. Exporters convert.

**Seconds** — Rejected. Figma, Compose, and anime.js use milliseconds; integers are easier to read and emit.

**`x` and `y` for translation** — Rejected. See *Why `offset`*.

**Separate `mount` and `in-view` triggers** — Rejected. One `enter` covers both on every platform.

**`steps()`, per-key springs, path motion, scroll timelines** — Rejected for v1. Not portable, or a second clock.

## Unresolved Questions

- **Token names across types.** A trigger value resolves `$name` by what kind of token it is (motion, easing, or duration). That requires token names to be unique across token types within a document. Confirm with [RFC-0038](0038-composite-token-types.md).

- **The preset list.** Five: `fade`, `rise`, `pop`, `lift`, `sink`. Revisit only with evidence from real files.
- **Stagger on `exit`.** Should children leave in reverse order? Leaning yes, as a default rather than an option.
- **Default spring bounce.** `spring` with no argument: 0 (smooth) or a small bounce such as 0.15 (SwiftUI's `snappy`)?
- **Motion on instances.** Can an instance override the motions in its component's body, and through which mechanism — a prop ([RFC-0034](0034-component-prop-types.md)) or a trigger property on the instance?
- **Gradient fills in keys.** Interpolating between gradients is defined on the web and inconsistent elsewhere. Solid only in v1.
- **Token name collisions.** `<transition>` is now a token type and `transition` is a property; `<motion>` is a token type. Confirm neither collides with anything in [RFC-0038](0038-composite-token-types.md).
