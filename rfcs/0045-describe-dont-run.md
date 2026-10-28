---
rfc: 0045
title: Describe, don't run — what .gui is for, and where it stops
status: Draft
considered-for: 0.5
date: 2026-10-17
updated: 2026-10-18
amends: P3, P5, roadmap note; adds P16
---

# Describe, Don't Run — What `.gui` Is For, and Where It Stops

## Context

### Why `.gui` exists

`.gui` started from a gap: there is no good, portable data about user interfaces. HTML is one platform's web UI, not UI in general. Design files (Figma, Sketch) and native apps are proprietary or compiled. A model that wants to learn how interfaces look and work — on a phone, a tablet, a kiosk, a watch, the web — has nothing neutral to read. `.gui` is that neutral, readable description: better than a PNG or SVG because it carries meaning, and not HTML because it is not tied to one platform or to a runtime.

The format's lineage makes the job concrete. **SVG fixes a picture. PDF fixes a document. `.gui` fixes a user interface.**

### What `.gui` is for: designing outside production

The clearest job for `.gui` is the one every team already has and no open format serves: **thinking about a design without rebuilding the app.**

An app exists — in React, Vue, SwiftUI, Kotlin, React Native, whatever. Someone wants to rework its onboarding. Today they either push pixels in a closed design tool that cannot read the app's tokens or components, or they edit production code: seed the database with "zero users", "one user", "five hundred users", add mock flags and fake branches, and hope none of it ships. Developers proved the need years ago — that is why Storybook exists, describing each component's states with fake data outside the app — but Storybook is code, bound to one framework and one repository.

`.gui` is that space for designs, in any stack:

1. **Spin off** the screens as `.gui`: components, tokens, and links, each node pointing back to what made it ([RFC-0046](0046-identity-and-source-ids.md)).
2. **Ideate** with the data you choose, not the data you have: an empty state, one item, a long name, an error — each a screen or a variant. Three visual directions are three packages. Motion and flows play without the app.
3. **Return**: the difference between the spun-off file and the ideated one says exactly what changed, and any developer or AI applies it in whatever language the app is written in.

None of it needs a repository. An AI can hand someone a `.gui` file in a chat, and they can open, play, edit and pass it on. That is the difference from every existing tool: they are places; `.gui` is a file.

| Use case | Who | Why neither HTML nor a design tool's own file serves it |
|---|---|---|
| Ideating outside production | Designers, developers, AI | HTML ideation turns into building; a design tool cannot read the app |
| A tool-agnostic design source | Teams moving between Figma, Penpot, AI tools | HTML loses components and variants; tool files are closed |
| AI reading and writing designs | Agents, MCP | HTML hands the agent code, not design; edits come back flat |
| Behaviour on designed layers | Systems such as Pixelog's Blocks | Needs stable identity, instances, variants |
| Design QA and review | Teams, CI | Needs a closed vocabulary to check against |
| Handoff with intent | Developers on any platform | HTML is one platform's implementation; screenshots miss behaviour |

### Why this RFC, now

Through 0.3 the format described what a UI *looks like*. Two pressures now push past that:

- **Interfaces move.** Modern apps are heavily animated, and motion carries meaning: a sheet sliding up says "temporary task," a push says "deeper." A description without motion is incomplete.
- **Interfaces are connected.** A `.gui` package can now carry many screens ([RFC-0042](0042-multi-document-packages.md)). A model learning how apps work needs to know how those screens relate, not only what each looks like. And every design tool that writes `.gui` stores those relationships as prototype links.

Both are reasonable. Both also lead, step by step, toward an engine: motion invites timelines and physics, links invite variables and conditions, and each step is individually defensible. The current principles cannot hold the line, because they hold it in the wrong place:

- **P3** says "everything you can see, nothing you can't." Motion is seen, but not in a still frame; the principle never anticipated time.
- **P5** says "not React — no behavior." Read literally, it forbids a transition. Read loosely, it forbids nothing in particular. The roadmap note under *Process notes* defers motion to 2.0 and plans to re-cut P5 then.
- **Nothing states the test that matters** — what a feature must do for the people and models the format exists to serve.

This RFC replaces "no behavior" with a sharper line, states the test every future API must pass, and brings motion and screen connections before 1.0 rather than after it.

## Prior Art

Several document formats have been exactly where `.gui` is now: a description that wanted links, transitions, and some interactivity. What they did, and what happened to them, is the strongest evidence for where the line belongs.

### Formats that have been here before

| Format | Links between pages | Transitions and animation | Scripting | What happened |
|---|---|---|---|---|
| **PDF** | Link annotations: go to a page, open a URL | Page transitions are part of the spec — wipe, dissolve, push, cover, fade, with a duration — played in presentation mode | A `JavaScript` action, run by the viewer; forms; embedded media | Scripts became an attack surface. The archival profile, **PDF/A**, bans JavaScript and media and keeps links and the static page |
| **PowerPoint, Keynote** | Links to slides, actions on click | Transitions; entrance, emphasis, and exit animations; triggers ("on click," "with previous," "after previous," "on click of this shape"); **Morph** and **Magic Move** | Not in the presentation itself. VBA macros require a separate macro-enabled file type | Plays everywhere, and nobody calls it an engine. Morph matches objects **by name** to animate between slides |
| **SVG** | `<a>` links | SMIL animation, CSS | `<script>` | Browsers split it into two profiles: SVG used as an image keeps its declarative animation and drops scripts and interactivity |
| **Flash (SWF)** | Yes | Vector animation — its origin | ActionScript, which grew into a full language | Started as an animation format, became a runtime, then a security liability, and was discontinued |
| **HyperCard** | Buttons linked to cards through a dialog, with no hand-written code | Visual effects between cards | HyperTalk | Showed that cards, links, and transitions make a usable prototype. Even its no-code links were one-line scripts underneath, which made scripting the default path for everything else |
| **Adaptive Cards** | A closed set of actions: open a URL, show a card, toggle visibility, submit | Minimal | None, by design | Declarative UI rendered natively by each host, which handles the actions. The closest philosophical sibling of `.gui` |
| **Lottie** | No | Animation only | No | Pure motion, embedded as an asset. The role `.gui` gives anything beyond its own motion |

### How scripting was added, and how it was undone

PDF tells the whole story, in five steps.

1. **A closed set of declared actions, inside the file.** PDF defines actions — `GoTo` a page, `URI`, `Hide`, `SetOCGState` (switch layers on and off), `SubmitForm`, `ResetForm`, and named actions such as next page — and triggers to attach them to: mouse up and down, mouse enter and exit, page open and close, focus and blur. Page transitions are declared the same way, as data on each page. No code.
2. **One more action type: `JavaScript`.** The escape hatch. The code lives inside the PDF and runs inside the viewer, which Adobe gave its own JavaScript engine and API. It was meant for form arithmetic and validation.
3. **Animation was built on the escape hatch.** PDF never had animation of its own. Authors flipped layers rapidly with JavaScript, or embedded Flash in the PDF. Both worked only in Adobe's viewer.
4. **The escape hatch became the problem.** JavaScript in PDFs became one of the most exploited attack paths for years. Most viewers today — browsers, operating-system previewers, mobile readers — run none of it, or a sliver. PDF/A bans it outright. The declared actions and transitions still work everywhere.
5. **Interactivity moved outside the file.** Modern products do not script inside a PDF. They embed a viewer and drive it through an SDK, from application code around the document.

The same pattern holds across the other formats:

| Format | Scripting inside the file | Driving it from outside | Where it settled |
|---|---|---|---|
| PDF | The `JavaScript` action | Viewer SDKs | Inside: banned in PDF/A, ignored by most viewers. Outside: the normal path |
| PowerPoint | VBA macros, in a separate macro-enabled type | Add-ins: code running beside the document, calling an API | Macros in files from the internet are blocked by default. Add-ins are the supported path |
| SVG | `<script>` | The host page's code reaching into the SVG by `id` | Inside: dropped when SVG is used as an image. Outside: how SVG is animated in practice |
| Flash | ActionScript, everything inside | — | Discontinued |

### What the prior art settles

1. **Declared links, triggers, and transitions without scripting is a proven layer.** PDF, PowerPoint, Keynote, and HyperCard all carry it, and every viewer plays it with no engine. It is the part of each format that survived everywhere. `.gui` admits exactly this layer.
2. **Scripting inside the file is where every one of these formats broke.** It always arrived later, as an escape hatch, and it always had to be walled off afterwards with profiles. `.gui` starts as the safe profile instead of carving one out later: there is no escape hatch in the file.
3. **The industry settled on driving documents from outside.** A host addresses the document by id through an API. That is "the file declares; the host drives" (Decision §3), made official from the start.
4. **Matching by name is the standard way to animate between two states.** PowerPoint's Morph, Keynote's Magic Move, and Figma's Smart Animate all do it. [RFC-0048](0048-motion.md)'s `smart` transition does it by `id`.
5. **Anything richer is an embedded asset.** Lottie, video, and Rive keep their own players; `.gui` holds them the way a slide holds a video.


## Decision

### 1. The line: describe, don't run

> **A `.gui` file describes a user interface. It is never a program that has to be run to be understood.**

An engine is something you execute to learn what it does. A description is something you read. Every feature the format admits must be useful to a reader that **never plays the file** — a model reading it as data, a tool importing it, a person scanning it.

This is what separates `.gui` from HTML. HTML can express everything `.gui` can, and that is precisely its weakness as a description: because it can express anything, a reader cannot know what a page does without executing scripts, the cascade, and network requests. `.gui` is useful because it is closed and finite: every screen, every state, every transition and every connection is written down.

### 2. The three questions

Every proposed tag, property, value form, or convention is asked three questions, in addition to the principle pass. A proposal that fails one is rejected or reshaped.

| Question | Asks | Guards against |
|---|---|---|
| **Build** | Given this file, could a model build the real app — on any platform — without guessing? | Losing intent; baking in one platform |
| **Learn** | Reading this file as data, does a model learn how this UI looks, moves, and connects? | Noise, runtime machinery, anything that only means something when executed |
| **Move** | Does it survive Figma → `.gui` → Penpot (or any tool to any tool)? | Tool lock-in; features no other tool can hold |

### 3. Three layers, and what belongs to each

| Layer | Holds | Where |
|---|---|---|
| **Design** | How the UI looks, how it moves, and which screen an element leads to | `.gui` |
| **Prototype player** | Playing that description: tapping through screens, running the motions | Any consumer of `.gui` — like a PDF viewer is to a PDF |
| **Host** | Anything driven by live input or logic: cursor following, drag, physics, data, conditions, variables | App code, a prototype engine, a system that attaches behaviour to designed layers |

**The file declares; the host drives.** A host finds nodes by `id` ([RFC-0046](0046-identity-and-source-ids.md)), switches variants, plays named motions, and sets the animatable properties ([RFC-0048](0048-motion.md)) live. The look and the motion stay designable and portable; only the live part is code.

The target for the design layer is **ideation-grade prototypes**: enough to show and understand an idea — screens connected, overlays, transitions, components reacting to tap and hover — readable as data, never enough to become the app.

### 3a. Native, carried, or named

Everything a design tool — today's or one not yet built — produces enters a `.gui` file in exactly one of three ways. Nothing is silently lost.

| Way | What | How a reader without support sees it |
|---|---|---|
| **Native** | What the format describes itself: layout, components, states, tokens, flows, motion | Fully |
| **Carried** | What a specialised player draws — Lottie, Rive, Spline, video, shaders, 3D, AI-generated images — as an image with its source ([RFC-0051](0051-images-with-a-source.md)) | A required still image, with a plain-words label |
| **Named** | What has to run — logic, data, live input — as a `hook` a host binds ([RFC-0049](0049-connections.md)) | The plain link around the hook; the name of the behaviour |

The native vocabulary stays small and closed. The carried container keeps it open: a new tool never meets a wall, it carries its payload with a still. The hook keeps logic out without hiding where it lives.

### 4. What is in, and what is out

| In the format | Out of the format |
|---|---|
| Visual design (through 0.3) | Editor state: comments, history, selection |
| Motion as a design spec: tokens, named motions, element triggers, how state and screen changes look ([RFC-0048](0048-motion.md)) | Timelines driven by anything other than time; scroll-linked motion until argued separately |
| Connections: this element leads to that screen, overlay, back, or variant, with this transition ([RFC-0049](0049-connections.md)) | Variables, conditions, expressions, counters, computed text |
| Component variants a connection can switch between | Gestures that track input: drag, swipe, cursor, momentum |
| | Randomness of any kind |

### 4a. Cannot, and what to do instead

The line is only useful if it says what to do on the other side of it.

| Cannot | Because | Instead |
|---|---|---|
| Logic, variables, conditions | They must run to be understood | One screen or variant per outcome; a `hook` where real logic lives |
| Pass a value to the next screen | That is data, not design | One variant per case, or a host |
| Follow the cursor, drag, physics | Live input every frame | A host sets animatable properties by `id` ([RFC-0048](0048-motion.md)) |
| Path animation, morphing, particles, character animation | Beyond a property changing over time | Carried: an image with a Lottie or Rive source |
| Shaders, 3D, generative art as nodes | Not interface | Carried: still for everyone, live with a plug-in, tweakable in its tool |
| Embed HTML or a web page | Interface escaping the format | Describe the interface natively |
| Editor state | Not the design | Stays in the tool |
| Randomness | Not reproducible | Carried |
| Run as a production app | It is a design | Build the app from it, in any language |

A design-tool feature on the right of §4 is **reported, not faked**, when a file is exported ([P15](../PRINCIPLES.md)): a Figma prototype with conditionals exports its links and reports the logic it could not keep.

### 5. Principle amendments

**P3 — amended.** Current litmus: *"Does this preserve something a viewer would actually see on screen?"* Amended to include time:

> **Everything you can see — including how it moves and where it leads. Nothing about the editor.**
>
> *Litmus:* Does this preserve something a viewer would see or experience in the UI — at rest, in motion, or by following a connection? If it only preserves editor state, it fails.

**P5 — amended, React bullet.** Current: *"Not React — no behavior."* Amended:

> **Not React — no logic.** A file may declare how things move and which screen an element leads to. It never declares conditions, variables, data, or computed values. Nothing in a `.gui` has to run to be understood.

The HTML and Figma bullets are unchanged.

**P16 — added.**

> ### P16 — Describe, don't run
>
> `.gui` is a description of a user interface, read as data. Every feature must be useful to a reader that never plays the file. Anything that must be executed to be understood — logic, live input, randomness — belongs to a host, which drives the file by `id`; the file itself stays declarative, finite, and portable.
>
> *Litmus:* Is this useful to a reader that never plays the file? And does it pass the three questions — **Build** (could a model build the app from it?), **Learn** (does a model learn how this UI looks, moves, and connects?), **Move** (does it survive one design tool to another)? If it must run to mean anything, it fails.

**Roadmap note — amended.** The process note *"P5 stays absolute until 2.0 motion/interaction actually lands"* is replaced: motion and connections land before 1.0, under P16, and 1.0 freezes visual, motion, and connections together. `spec/DOTGUI.md` *Deferred to v2* drops "Interactions and prototyping metadata."

## Reasoning

### Why "describe, don't run" rather than "no behavior"

"No behavior" is a ban on a category nobody can define. A transition is behaviour in one reading and a visual property in another; the principle gave no way to decide. "Describe, don't run" turns the question into one with an answer: *can a reader understand this without executing it?* A transition can be read ("rises in, 400 ms, springy"). A condition cannot be read to a result without evaluating it against state. That is the line, and it is the same line that separates a description from a program.

### Why motion belongs, under the format's own purpose

The format exists so models can learn how interfaces work. How an interface moves is part of how it works, and it carries meaning that a still frame does not: whether a screen is deeper, temporary, contextual, or a replacement. Leaving motion out leaves the description incomplete for exactly the reader the format serves. Motion as a *spec* — values written down, not code that produces them — passes all three questions.

### Why connections belong, and logic does not

A connection ("this button leads to checkout, with a push") is a fact about the app, like a sitemap. A model learning app structure needs it, a model building the app needs it, and every design tool stores it. Logic ("if logged in, go here, else there") is not a fact until evaluated against state. Finite logic was considered — state variables with enumerated values, which keep the state space listable — and rejected here: it is useful mostly to something that plays the prototype, it requires every reader to carry a small engine, and it starts the slope from conditions to counters to expressions. A host can add logic on top of a `.gui` by `id`; the format does not need to hold it.

### Why not just HTML

If the goal is one finished website, HTML is the right output. `.gui` is the layer before the output, and HTML is poor at being that layer:

| | HTML + JS | `.gui` |
|---|---|---|
| Back into design tools | Practically one-way | Round-trips ([RFC-0046](0046-identity-and-source-ids.md)) |
| Platforms | The web, or a webview | The same file maps to SwiftUI, Compose, and the web |
| Design vs code | One file; a design change is a code diff | Separate; host code points at `id`s and survives re-export |
| Reading | Must be run to know what it shows | Readable as-is |
| Safety | An executable | Data: safe to open, embed, render on a server, put in a prompt |
| Still picture | Not guaranteed | Always defined |

HTML-generating design tools make the gap concrete. An open-source AI design workspace that reached tens of thousands of users in weeks stores each design as a single HTML page and its design system as a prose brief; its own roadmap lists precise edits to a design as unfinished, and its Figma path leads to code, not back to a design. The demand for AI-made design is real. What such tools lack is a design artifact that travels.

Markdown is the precedent. Anything a README holds could be written in HTML; people use Markdown because everything can read it and it can be edited without breaking. When they need more, they render it into HTML. `.gui` is to UI what Markdown is to documents: the readable source, not the final program.

### Evidence: the Sable test

A 7-screen app with flows, motion and interactive components was given to two models as a clean `.gui` package, as clean HTML, and as screenshots. On 16 questions about its flows, states, design facts and motion, `.gui` and HTML tied (14.5–16 of 16) and screenshots scored about half (6.5–8.5). The honest reading: `.gui` is not *better* than HTML to read; it is *as* readable, with no training exposure at all, against the most-trained format there is. Its case rests on what HTML does not declare — components, variants, instances, tokens, links, identity — not on reading speed. Full results: `motion-lab/eval/RESULTS.md`.

### Why bring motion before 1.0

1.0 is a compatibility freeze. A 1.0 that freezes only visuals would freeze a description known to be incomplete for animated interfaces, and motion would arrive in 2.0 as a breaking change to the model of what a file holds. Every version before 1.0 exists so a mistake can still be corrected for free; motion and connections should use that window.

## Alternatives Considered

**Keep P5 absolute; motion in 2.0** — the current roadmap. Rejected: it freezes an incomplete description at 1.0, and leaves the "behavior" line undefined until then.

**Motion only, no connections** — Rejected. Fails **Learn** (a model cannot learn how screens relate) and **Move** (prototype links stored by every design tool are lost on export).

**Finite logic: enumerated state variables and conditions** — Rejected. Keeps the state space listable, but serves players more than readers, requires an engine in every conforming renderer, and opens the slope to counters and expressions. Hosts can add it on top.

**Full prototype logic (Figma parity)** — Rejected. Makes `.gui` a programming language; fails P16 outright.

**A separate `flow.guix` holding links and logic** — Considered while logic was in scope, to keep screens pure. With logic out, links are plain declarations and sit with the screens and components they belong to ([RFC-0049](0049-connections.md)).

## Unresolved Questions

- **Scroll-linked motion.** Progress driven by scroll position rather than time. Portable to every platform, but a second clock. Leaning: a follow-up RFC after 0048.
- **Carried content.** Settled in [RFC-0051](0051-images-with-a-source.md): anything native `.gui` cannot describe is carried as an image with its source and a required still. Its parameters are admitted under P3 because they change the visible output.
- **The repository bridge.** Reading a codebase's tokens (W3C design-token JSON) so ideation always starts from the latest values. Tooling first; a small RFC for external tokens once the loop is clear.
- **Artboard placement.** If a package is used as a free-form board of screens, their arrangement is not represented ([RFC-0042](0042-multi-document-packages.md) orders documents; it does not place them). Leave until a design-tool importer needs it.
- **Application on acceptance.** `core/PRINCIPLES.md` is edited in the same change that accepts this RFC: P3 and P5 reworded, P16 added under *How it behaves*, the roadmap note replaced. `spec/DOTGUI.md` *Deferred to v2* updated.
