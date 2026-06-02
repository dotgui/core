# Platform: Web desktop

## Canvas

- **Width:** 1440 (the most common design width — represents a 14"-15" laptop)
- Other common widths: 1280 (smaller laptops), 1920 (large monitors). Use 1440 unless specified.
- **Height:** `<col>` with no `h` for scrolling pages. Use `<frame>` with a fixed height only when designing above-the-fold or single-screen tools.
- **Content max-width:** the canvas is 1440 but the actual content usually lives inside a 1200–1280 max-width container, centered.

## Fonts

Use Google Fonts via `source="google"`. Solid defaults:

- **Inter** — the modern SaaS default
- **Geist** — used by Vercel, popular for tech
- **Söhne / Söhne Buch** — premium feel, not free, sub with Inter
- **JetBrains Mono / IBM Plex Mono** — for code blocks and tabular data

```xml
<fonts>
  <font family="Inter" source="google" weights="400 500 600 700" styles="normal" />
  <font family="JetBrains Mono" source="google" weights="400 500" styles="normal" />
</fonts>
```

## Type scale

| Role | Size / line-height / weight |
| --- | --- |
| Hero | 64 / 72 / 700 |
| Display | 48 / 56 / 700 |
| H1 | 36 / 44 / 700 |
| H2 | 28 / 36 / 600 |
| H3 | 22 / 30 / 600 |
| H4 | 18 / 26 / 600 |
| Body large | 17 / 26 / 400 |
| Body | 15 / 24 / 400 |
| Body small | 14 / 22 / 400 |
| Caption | 13 / 20 / 400 |
| Tiny | 11 / 16 / 500 (uppercase tracking) |

For marketing pages, scale up — hero text often goes 80–120px on large monitors.

## Spacing

4-based or 8-based. Common values: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.

**Page-level spacing:** sections separated by 64–128px vertically. Inside a section, 24–48px between subsections.

**Component-level spacing:** standard 4 or 8 based scale.

## Corner radius

Smaller than mobile. Common values:

- **None:** 0 (brutalist designs use this everywhere)
- **Subtle:** 6 (inputs, small buttons)
- **Medium:** 8 or 10 (cards, modals)
- **Large:** 16 (hero cards, feature boxes)
- **Pill:** 999 (badges, some buttons)

Web designs are more often square-ish than mobile.

## Common layouts

### Marketing / landing page
- Centered content column ~1200–1280px max width
- Hero section ~600–800px tall with big headline + subhead + CTA
- Feature sections alternating image-left / image-right
- Logo strip or testimonial section
- Footer ~300–400px tall with link grid

### App / dashboard
- Top nav bar 56–64px tall, full-width
- Sidebar 240–280px wide on the left (or no sidebar for simpler apps)
- Main content area fills the rest
- Content padding: 24–32px from the sidebar/nav

### Editorial / blog
- Centered content column ~680–720px wide for readability
- Larger heading hierarchy
- Generous line-height (1.6–1.8 for body)

## Web pitfalls

- **Don't make it look like a mobile app stretched out.** Use the horizontal space — multi-column layouts, side-by-side content.
- **Don't make CTAs huge.** A 56px-tall CTA button is mobile. On web, 40–48px is standard.
- **Body text shouldn't be 16/24 by default.** That's the framework default. Try 15/24 or 17/26 for a more designed feel.
- **Buttons aren't full-width.** Mobile buttons are; desktop buttons sit on the left or right with their content.
- **Don't forget hover states (mentally).** You can't show them in static markup, but design components that imply they'd have a hover state.
- **Footer matters.** Real products have real footers. Sitemap, social, legal, language switcher. Not "© 2024 All rights reserved."

## A minimal web desktop skeleton

```xml
<gui version="0.2" name="Marketing/Landing">
  <tokens>
    <color name="bg" value="#FFFFFF" />
    <color name="surface" value="#F8F9FB" />
    <color name="text-primary" value="#0A0A0F" />
    <color name="text-secondary" value="#5C6075" />
    <color name="border" value="#E5E7EB" />
    <color name="primary" value="#6366F1" />
    <number name="radius-md" value="10" />
  </tokens>
  <fonts>
    <font family="Inter" source="google" weights="400 500 600 700" styles="normal" />
  </fonts>
  <col w="1440" fill="$bg">
    <!-- Nav -->
    <row h="72" p="0 64" align="middle-left" gap="$space-8" fill="$bg">
      <text value="Brand" font-family="Inter" font-size="18" font-weight="700" color="$text-primary" />
      <row gap="24" align="middle-left">
        <text value="Product" font-family="Inter" font-size="14" font-weight="500" color="$text-secondary" />
        <text value="Pricing" font-family="Inter" font-size="14" font-weight="500" color="$text-secondary" />
        <text value="Docs" font-family="Inter" font-size="14" font-weight="500" color="$text-secondary" />
      </row>
    </row>

    <!-- Hero (centered max-width container) -->
    <col p="120 64" align="top-center" gap="24">
      <col w="800" align="top-center" gap="24">
        <text value="A headline that actually says something." font-family="Inter" font-size="64" font-weight="700" line-height="72" color="$text-primary" text-align="center" />
        <text value="A subheadline that adds real context. One sentence, never two." font-family="Inter" font-size="20" font-weight="400" line-height="30" color="$text-secondary" text-align="center" />
      </col>
    </col>
  </col>
</gui>
```
