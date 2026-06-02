---
name: dotgui
description: Create beautiful, production-quality UI designs as .gui files (the open dotgui format for describing user interfaces as portable XML markup, packaged with assets and a preview). Use this skill whenever the user asks for a UI design, mockup, screen, layout, interface, or anything that should be delivered as a .gui file — including phrases like "design me a", "create a screen for", "mock up a", "build a UI for", "give me a .gui", or any mention of dotgui. Also use this skill whenever the user wants Claude to produce visual UI specifications they can hand to a renderer, designer, or downstream code generator. If the user uploads an existing .gui file and wants edits or variations, use this skill too. Cover iOS, Android (Material), web desktop, web mobile, and platform-agnostic outputs.
---

# dotgui

Create beautiful `.gui` files — the open dotgui v0.2/v0.3 format for describing UIs as portable XML markup, packaged with assets and a preview.

A `.gui` file is a **ZIP package** containing:
- `design.guix` — the UI markup (an XML document with `<gui>` as the root)
- `preview.webp` — a thumbnail of the rendered screen
- `assets/` — embedded images, SVGs, etc.

This skill walks through a strict five-step pipeline. Do not skip steps and do not reorder them.

---

## The pipeline

```
1. Load the guidelines  →  2. Decide a design direction  →  3. Author markup for the target platform
                                                                            ↓
                                              5. Package as .gui  ←  4. Self-validate against the spec
```

Each step has its own section below. Each section ends with a checkpoint — do not move on until the checkpoint passes.

---

## Workflow, Approvals & Workspace Cleanliness

To ensure a fast, frictionless experience and keep the workspace tidy, adhere strictly to the following execution rules:

*   **Design Direction is the ONLY approval gate:**
    *   **Get user approval ONLY for Step 2 (Design Direction).** Present the chosen theme, color palette tokens, typography, and spacing scale to the user, and get their explicit sign-off on the design direction.
    *   **Do NOT ask for approval or pause for feedback for every step or tool execution.** Once the design direction is approved, proceed immediately and autonomously through authoring (Step 3), validation (Step 4), and packaging (Step 5) without prompting the user. It is annoying for the user to approve every step, intermediate tool call, or file creation.
*   **100% Cleanup & Stream-First Read/Write:**
    *   **Prioritize Stream Commands:** When reading or editing an existing `.gui` package, always use the in-memory stream features (`--read` to stdout, `--update` from stdin) to avoid writing any temporary folders or `.guix` files to the user's workspace filesystem.
    *   **Tidy Up Intermediate Files Instantly:** If you must write a temporary `temp.guix` file to perform updates, immediately delete it via `rm` after compiling. Never leave loose `.guix` files, `/guix` folders, or `.gui` directories in the workspace. Keep Jinson's view 100% spotless.
*   **Always use the Python packaging script:**
    *   Use the provided `package_gui.py` Python script to bundle the assets, metadata, and markup. Do not construct the ZIP manually.

---

## Step 1 — Load the guidelines

Before producing anything, internalize the format. The spec is the constitution: every tag, attribute, and rule that follows must come from it.

**Action:** Read `references/spec.md` in full. This is non-negotiable — even if you think you remember the format, re-read it. The spec is small (one file) and the cost of getting an attribute name or sizing rule wrong is a broken `.gui` file.

**Key rules to memorize from the spec:**

- Root element is always `<gui version="0.2" name="...">`.
- Two root-canvas patterns: `<col w="390">` (content-driven, hugs height) or `<frame w="390" h="844">` (fixed artboard). Default to `<col>` unless you have a specific reason to pin the height.
- Layout hierarchy preference: Always prioritize `stack (row/col) > grid > frame/abs`. Default to `<col>` or `<row>` stacks for standard layouts. If a stack is insufficient, use `<grid>` (using Track Grid with `cols`/`rows`, Unit Grid with `unit`, or Auto-flow). Use `<frame>` with absolute positioning (`abs="true"`) only as a last resort when overlapping layers or explicit coordinate-based placement is absolutely necessary. `<col>`, `<row>`, and `<grid>` are preferred over `<stack>` as the primary layout tags.
- On `col`/`row`/`grid`/`text`/`instance`: `w` and `h` absent = hug content. On `frame`/`rect`/`ellipse`/`line`/`img`/`group`: `w` and `h` are **required** (except `<line>` where dimensions fill by default).
- `<rect>`, `<ellipse>`, and `<line>` are first-class helper tags that replace the deprecated `<shape>` tag.
- All SVG/vector icons and images are declared inline using `<img>` pointing directly to relative `assets/` or public URLs — the `<assets>` metadata block and `<svg>` tag are completely removed.
- Padding shorthand: `p="24"`, `p="24 16"`, `p="8 16 12 16"`. Or per-side: `pt`, `pr`, `pb`, `pl`.
- Tokens are referenced with `$name` after being declared in `<tokens>`.
- `<text>` is single-style with a `value` attribute, OR mixed-style with `<segment>` children.
- Fills support hex (with optional alpha byte), CSS gradient functions, and `$token` refs.

**Checkpoint:** You can name, without looking, the three auto-layout tags, the whitelisted helper tags, the required attributes on the root element, and the sizing rule for `<col>` vs `<frame>`. If you can't, re-read the spec.

---

## Step 2 — Decide a design direction

A `.gui` file with the right tags but no design direction looks generic and AI-flavored. The goal is a deliberate, coherent visual identity *before* you write markup. Commit to a BOLD, unforgettable design direction that avoids generic "AI slop" aesthetics.

**Action:** Read `references/design-direction.md`. Then, for the current task, explicitly decide and write down (in your reasoning, not necessarily to the user):

1. **The Conceptual Tone** — Commit to an extreme visual tone that guides every choice. E.g. *"brutally minimal, retro-futuristic, maximalist chaos, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian"*. Refined minimalism and bold maximalism both work—the key is intentionality, not intensity.

2. **The palette** — 4–7 colors with named tokens. Always include: a primary, a background, a surface (one step elevated from background), a primary text color, a secondary text color. Add accent/destructive/success as needed. Be specific with hex — no `#FFFFFF` + `#000000` defaults. Decisively use accents and gradient overlays to create atmospheric depth.

3. **Characterful Typography** — Avoid generic fonts like standard Arial or system sans-serif by default unless strictly required. Opt instead for distinctive, interesting choices that elevate the frontend's aesthetics (e.g., pairing an elegant display serif like EB Garamond with a clean Inter, or a dense monospace like JetBrains Mono for a technical tool). Pick concrete sizes for your type scale, line-heights, and tracking weights.

4. **Spatial Asymmetry & Composition** — Challenge yourself to use unexpected layouts, asymmetry, and generous negative space (rather than predictable, perfectly repeating symmetric grids) to make the interface feel memorable, alive, and human-designed.

5. **The spacing scale** — pick a base unit (usually 4 or 8) and stick to it. Common scale: 4, 8, 12, 16, 24, 32, 48. Store as tokens (`space-xs`, `space-sm`, etc.) so the markup reads cleanly.

6. **The corner radius scale** — usually three values: subtle (cards, inputs), medium (large cards, modals), pill (buttons, tags). E.g. 8 / 16 / 999.

7. **One signature move** — the thing that makes this design UNFORGETTABLE. A gradient header, a hairline divider system, oversized type, a colored shadow, an unusual radius, or a custom atmospheric orb layout. Decide what it is and execute it with precision.

**Checkpoint:** You have a `<tokens>` block drafted in your head (colors, spacing, radius) and a `<styles>` block for typography. If asked "what's the visual personality of this design?" you have a one-sentence answer that isn't "modern and clean" but is a bold aesthetic commitment.

---

## Step 3 — Author the markup for the target platform

Now write the `design.guix` markup. The format is platform-agnostic, but a good design respects the conventions of the platform it's meant for.

**Action:** Identify the target platform (ask the user if it's ambiguous — don't guess between iOS and Android for the same screen). Then read the matching file from `references/platforms/`:

- `references/platforms/ios.md` — iOS (390×844, SF Pro, iOS HIG conventions)
- `references/platforms/android.md` — Android (360×800, Roboto / Google Sans, Material 3 conventions)
- `references/platforms/web-desktop.md` — Web desktop (1440 wide, common type scales)
- `references/platforms/web-mobile.md` — Web mobile (390 wide, responsive considerations)
- `references/platforms/generic.md` — Platform-agnostic (when the user explicitly wants this, or when the design is not platform-bound)

Each platform reference gives canvas size, default fonts, safe-area / system-bar treatment, idiomatic patterns (e.g. iOS uses large titles, Android uses Material elevation), and pitfalls to avoid (e.g. don't put hamburger menus in iOS designs).

**Authoring guidance:**

- **Start from the outside in.** Declare `<tokens>`, `<styles>`, `<fonts>` first, then the root canvas, then the content.
- **Use tokens for every repeated value.** If the same color or spacing appears more than twice, it's a token.
- **Use real content, not lorem ipsum.** Real product names, real prices, plausible usernames, copy that reads like it's from a shipping product. This is the single biggest lever for "looks designed" vs "looks AI".
- **Stay inside the spec.** Every tag and attribute must be in `references/spec.md`. If you find yourself wanting something the spec doesn't have, find a way to express the same intent with what's available.
- **Use standard image elements for icons:** Inline `<svg>` and the `<assets>` block are deprecated. All icons and graphic shapes must be loaded using `<img src="..." />` (e.g., `<img src="https://api.iconify.design/lucide/home.svg?color=%23ffffff" w="24" h="24" />` for online icons, or `<img src="assets/icon-home.svg" w="24" h="24" />` for packaged assets). **CRITICAL RULE:** All icons on a screen must belong to the exact *same icon family* (e.g., all `lucide` or all `heroicons`) to preserve weight and styling consistency across the interface.
- **Use the Unsplash API for high-fidelity images:** Never use solid gray or empty placeholder shapes for photos. Reference real image URLs from Unsplash: `https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w={width}&q=80` with plausible photograph IDs.
- **Mind the sizing rules.** `<frame>`/`<rect>`/`<ellipse>`/`<img>`/`<group>` need explicit `w` and `h`. `<col>`/`<row>`/`<grid>` hug content when `w`/`h` are absent.
- **Rule for auto-gap layouts:** Whenever you use `gap="auto"` (space-between distribution) on a `<row>`, `<col>`, or `<stack>`, you MUST explicitly set the corresponding dimension to fill the parent (e.g. `w="fill"` for a `<row>` or `h="fill"` for a `<col>`). If you leave the dimension absent, the parent container will collapse to hug its children's cumulative content size, reducing the distributed auto-gap to zero and breaking the layout.
- **Do NOT use empty spacer elements:** Avoid inserting empty `<row w="fill" />`, `<col h="fill" />`, or empty layout containers solely to distribute items, push elements to edges, or act as flex spacers. This is a structural code-smell. Instead, use clean structural nesting—such as grouping items into distinct left/right sub-containers and setting the parent container to `gap="auto"` with `w="fill"` / `h="fill"` to divide space gracefully.
- **Deliver ONLY the packaged `.gui` file:** The ultimate and only mandatory deliverable is the compiled, packaged `.gui` ZIP archive (which internally bundles `design.guix`, assets, and the preview). Any temporary files or code snippets are auxiliary; downstream systems require strictly the single `.gui` package.

Review `examples/` for two reference `.gui.xml` files that demonstrate the level of polish to aim for.

**Checkpoint:** You have a complete `design.guix` string. It opens with `<gui version="0.2" name="...">`, has `<tokens>` / `<styles>` / `<fonts>` blocks, then the root layout, and closes with `</gui>`. Content is real, not placeholder.

---

## Step 4 — Self-validate against the spec

Before packaging, audit the markup against the spec. This is a quick pass — not a separate phase of work — but skipping it is the single biggest cause of broken `.gui` files.

**Action:** Read `references/validation-checklist.md` and walk through every item against your draft. Fix issues in place; do not move on with known violations.

The checklist covers:
- Root element shape and version
- Required attributes on each tag type
- Token and asset references resolve
- Sizing rules (which tags require explicit `w`/`h`)
- No unsupported tags or attributes
- Color formats are valid
- Text node well-formedness (single `value` OR `<segment>` children, not both)

**Checkpoint:** Every item in the validation checklist passes. If something can't be fixed without changing the design, go back to Step 3 — do not paper over it in the packaging step.

---

## Step 5 — Package as a real .gui file

A `.gui` file is a ZIP package, not a raw XML string. Internally it contains `design.guix`, `preview.webp`, and an `assets/` directory.

**Action:** Use the bundled packaging script. Write the validated markup to a file, then run:

```bash
python3 /path/to/skill/scripts/package_gui.py \
  --markup design.guix \
  --output /mnt/user-data/outputs/<name>.gui \
  [--preview preview.webp] \
  [--assets-dir assets/]
```

The script:
- Validates the input is well-formed XML with `<gui>` as root
- Generates a simple placeholder `preview.webp` if none is provided (a solid-color rectangle with the screen name — this is a real WebP, not a stub, so downstream tools won't break)
- Reads any files in `--assets-dir` and includes them under `assets/` in the ZIP
- Writes a valid `.gui` ZIP to the output path

For details and options, run `python3 scripts/package_gui.py --help` or read the script header.

**After packaging:** 
1. **Clean up intermediate files immediately:** Delete the `design.guix` file and any other temporary assets or folders created during the packaging process. Ensure no `.guix` or other leftover files remain in the workspace.
2. Call `present_files` with the resulting `.gui` path so the user can download it. Add a short note (one or two sentences) describing the design direction you chose — this is the only narration the user needs.

**Checkpoint:** The output is a real `.gui` file at `/mnt/user-data/outputs/` (or the requested output path), presented to the user via `present_files`, and **all temporary files (like `design.guix`) have been deleted**.

---

## When the user is editing an existing .gui

If the user uploads a `.gui` file and asks for changes or variations:

1. **Read direct in-memory (no approval needed):** Stream the existing markup to your context using the script:
   `python3 .gemini/skills/dotgui/scripts/package_gui.py --read outputs/filename.gui`
   This outputs the XML content directly to stdout in memory.
2. Read `references/spec.md` to make sure you understand any tags/attrs you're touching.
3. Skip Step 2 if you're keeping the existing design direction; otherwise pick a new design direction and obtain user approval for it.
4. **Make edits and update directly (no approval needed):** Author the modified XML. To update the `.gui` package in-place, write the modified XML to a temporary file (e.g., `temp.guix`) and pipe it using `--update`:
   `python3 .gemini/skills/dotgui/scripts/package_gui.py --update outputs/filename.gui < temp.guix`
   *Alternatively*, stream it directly using a Here-doc:
   `python3 .gemini/skills/dotgui/scripts/package_gui.py --update outputs/filename.gui << 'EOF' ... XML ... EOF`
5. **Clean up instantly:** If you created a `temp.guix` file, immediately delete it via `rm temp.guix`.
6. Ensure the workspace remains completely clean, with no stray `.gui/` folders or `.guix` files visible to the user.

---

## Tone for the user-facing response

After the file is delivered:

- Briefly name the design direction (one phrase).
- Mention the platform and key numbers (canvas size, primary color, font).
- Don't dump the markup into chat — it's already in the file.
- Don't apologize for the placeholder preview unless asked.

That's it. The file is the deliverable; chat is just framing.
