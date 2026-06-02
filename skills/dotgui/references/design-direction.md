# Design direction

The goal of this step is to make a specific, opinionated set of decisions *before* writing markup. Skipping this step is what produces designs that "look AI" — gray cards on white backgrounds, default Inter at 16/24, blue primary button, evenly spaced everything.

## The personality choice

Before anything else, pick a personality in one sentence. It should imply specific design choices.

**Bad personality phrases (predict nothing):**
- "Modern and clean"
- "Sleek and minimal"
- "User-friendly"
- "Professional"

**Good personality phrases (predict everything):**
- "Premium fintech — calm, confident, monochrome with a single accent" → dark backgrounds, restrained type, lots of whitespace, one strong color used sparingly
- "Playful consumer app — vibrant, tactile, soft" → high-saturation colors, rounded everything, slightly oversized type, gentle shadows
- "Developer tool — dense, precise, monospace-leaning" → tight spacing, smaller type, monospace for data, low-saturation palette, hairline dividers
- "Editorial reader — restrained, typographic, paper-like" → serif body, generous line-height, off-white background, narrow content column
- "Neo-brutalist marketing site — bold, blocky, high-contrast" → flat colors, thick borders, oversized type, no shadows, deliberate awkwardness
- "Healthcare dashboard — calm, trustworthy, slightly clinical" → soft blue/green palette, ample whitespace, conservative type, clear hierarchy

If you can't say what your personality implies, it's still too vague.

## Palette construction

Always declare these as tokens:

| Role | What it is | Example |
| --- | --- | --- |
| `bg` | Page background | `#FAFAFA` or `#0B0B0F` |
| `surface` | One step elevated from bg (cards, modals) | `#FFFFFF` or `#16161D` |
| `surface-2` | Two steps elevated (popovers, hover) | `#F2F2F7` or `#1F1F28` |
| `text-primary` | Main text | `#0F0F12` or `#FFFFFF` |
| `text-secondary` | Captions, labels, hints | `#6E6E73` or `#9999A1` |
| `border` | Dividers, input borders | `#E5E5EA` or `#2A2A33` |
| `primary` | The brand color, used sparingly | varies |
| `accent` | (optional) Secondary action color | varies |
| `danger` | Errors, destructive actions | usually `#FF3B30` or `#EF4444` |
| `success` | Confirmations | usually `#34C759` or `#10B981` |

**Rules of thumb:**

- Don't use pure white (`#FFFFFF`) on light backgrounds unless that's the surface color — give the page a slight tint (`#FAFAFA`, `#F7F7F8`).
- Don't use pure black (`#000000`) for text — `#0F0F12` or `#1C1C1E` reads warmer and less harsh.
- On dark themes, base background is usually around `#0B0B0F` to `#15151B`, surfaces around `#1A1A22` to `#22222B`.
- For "premium" / "fintech" feels, restrict to 3–4 colors total. For "playful" / "consumer", you can go up to 6–7.

### Palette starting points (steal from these)

- **iOS system light:** bg `#F2F2F7`, surface `#FFFFFF`, text `#1C1C1E`, secondary `#6E6E73`, primary `#007AFF`, danger `#FF3B30`, success `#34C759`
- **Linear-style dark:** bg `#0B0B0F`, surface `#16161D`, surface-2 `#1F1F28`, text `#E1E1E6`, secondary `#8E8E96`, primary `#5E6AD2`
- **Stripe-style trust:** bg `#FFFFFF`, surface `#F7FAFC`, text `#0A2540`, secondary `#425466`, primary `#635BFF`
- **Notion-style editorial:** bg `#FFFFFF`, surface `#F7F7F5`, text `#37352F`, secondary `#787774`, primary `#2383E2`
- **Vercel-style mono:** bg `#000000`, surface `#0A0A0A`, text `#EDEDED`, secondary `#888888`, primary `#FFFFFF` (yes, white as primary), border `#333333`
- **Warm playful:** bg `#FFF8F0`, surface `#FFFFFF`, text `#2D1810`, secondary `#7A6B5D`, primary `#FF6B35`, accent `#F7C548`

Don't copy these literally for every job — but use them as a quality bar. Random hex values usually produce ugly palettes.

## Typography

**One font is usually enough.** Two max (a display face for headlines, a body face for everything else). Three is showing off and looks worse than it sounds.

### Safe pairings

| Personality | Font choice |
| --- | --- |
| Premium / fintech / SaaS | Inter (all weights) |
| Apple / iOS | SF Pro, fall back to `system-ui` |
| Android / Google | Roboto or Google Sans |
| Editorial / reading | Charter / Georgia / Lora for body; Inter for UI |
| Playful / consumer | Inter or Nunito or Plus Jakarta Sans |
| Brutalist / mono | JetBrains Mono or IBM Plex Mono |
| Marketing / display | Geist or Söhne (sub Inter) for body; a display face like Fraunces or Editorial New for headlines |

### Type scale

Pick concrete sizes and stick to them. A solid default:

| Role | Size / line-height / weight |
| --- | --- |
| Display | 40 / 48 / 700 |
| Title 1 | 32 / 40 / 700 |
| Title 2 | 22 / 28 / 600 |
| Title 3 | 17 / 24 / 600 |
| Body | 15 / 22 / 400 |
| Body strong | 15 / 22 / 600 |
| Caption | 13 / 18 / 400 |
| Tiny | 11 / 14 / 500 (uppercase, letter-spacing) |

Declare these as `<text-style>` entries — your markup will be cleaner and the design will feel more systematic.

**Pitfalls:**
- Don't use 16px body — it reads "default web". 15px feels more designed.
- Don't leave line-height implicit — always set it explicitly.
- Don't use more than 4 font sizes on a single screen unless you have a reason.

## Spacing scale

Pick **one** base unit. 4 is the most common; 8 works for chunky designs.

A 4-based scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.

Declare as tokens:

```xml
<tokens>
  <number name="space-1" value="4" />
  <number name="space-2" value="8" />
  <number name="space-3" value="12" />
  <number name="space-4" value="16" />
  <number name="space-6" value="24" />
  <number name="space-8" value="32" />
</tokens>
```

**Rules of thumb:**
- Never use a value not in your scale. `padding="13"` is a red flag.
- Group spacing intentionally: items in a list use a small gap (8–12); sections separated by a big one (32–48).
- More space between unrelated things, less space between related ones. This is the law of proximity — it's the easiest way to make a design feel intentional.

## Corner radius

Three values are usually enough:

| Role | Value |
| --- | --- |
| Subtle (inputs, small cards, tags) | 6–8 |
| Medium (cards, modals) | 12–16 |
| Pill (buttons, badges) | 999 (or `h/2`) |

Don't mix radii randomly. If the design uses 12 for cards, the buttons inside it should be 12 or pill, not 6.

## The signature move

Generic designs have no signature move. Polished designs have one or two deliberate touches that make them feel made.

Pick one and apply it once or twice — not everywhere:

- A bold gradient header
- A hairline divider system (1px dividers in a slightly-different color from the border token)
- Oversized type for one element (a 56px price, a 48px page title)
- A colored shadow (`rgba(99, 91, 255, 0.15)` instead of plain gray)
- An unusual radius (everything 16, but the hero card is 24)
- A pop of accent used only on one element per screen
- A patterned background (a subtle dot grid, a soft mesh gradient)
- Tabular numerals for data-dense screens
- Negative space around the primary action — let it breathe

Decide before authoring. Don't tack it on after.

## Anti-patterns to avoid

These show up in low-effort AI designs. Catch yourself before you ship them:

- Gray placeholder boxes (`#E5E5E5` rectangles where an image should go) — use a real image URL, a gradient placeholder, or describe the image in markup
- Lorem ipsum or "User Name" / "user@example.com" — write real, plausible content
- Five different shades of gray with no system to them
- Default blue primary button on white card on light gray background
- Centered everything because layout decisions are hard
- Every card the same size, in a perfect grid, with no hierarchy
- Icons all from the same generic stock set (heart, star, share, bell) when the screen doesn't need icons
- Headers with "Welcome back!" + a wave emoji
- Footer with "© 2024 Company. All rights reserved." (real footers say more)
