# Platform: Generic (platform-agnostic)

Use this when the user explicitly wants a platform-neutral design, or when the design isn't bound to a specific platform (e.g. an internal tool, an illustration, a component shown in isolation, a design system reference).

## Canvas

Pick a canvas based on what's being designed:

- **Single component / card:** the component's natural size (e.g. `w="320"` for a card, plus some padding)
- **Mobile-ish screen:** 390 wide
- **Tablet-ish screen:** 768 wide
- **Desktop-ish screen:** 1280 wide
- **Square showcase:** 600×600 or 800×800

When in doubt, default to 390 wide with `<col>` (no fixed height).

## Fonts

Inter is the safest, most neutral default. Available via Google Fonts on any platform.

```xml
<fonts>
  <font family="Inter" source="google" weights="400 500 600 700" styles="normal" />
</fonts>
```

## Type scale

A neutral scale that works for most contexts:

| Role | Size / line-height / weight |
| --- | --- |
| Display | 48 / 56 / 700 |
| H1 | 32 / 40 / 700 |
| H2 | 22 / 28 / 600 |
| H3 | 18 / 26 / 600 |
| Body | 15 / 24 / 400 |
| Caption | 13 / 20 / 400 |

## Spacing

4-based scale: 4, 8, 12, 16, 24, 32, 48, 64.

## Corner radius

Three values: 8 (subtle), 12 (medium), 999 (pill). Adjust to taste.

## Color palette starting point

A neutral, modern, slightly tech-leaning palette that works for almost any context:

```xml
<tokens>
  <color name="bg" value="#FAFAFA" />
  <color name="surface" value="#FFFFFF" />
  <color name="surface-2" value="#F4F4F5" />
  <color name="text-primary" value="#0A0A0F" />
  <color name="text-secondary" value="#5C6075" />
  <color name="border" value="#E5E7EB" />
  <color name="primary" value="#6366F1" />
  <color name="danger" value="#EF4444" />
  <color name="success" value="#10B981" />
</tokens>
```

For a dark variant: bg `#0A0A0F`, surface `#16161D`, surface-2 `#1F1F28`, text-primary `#FAFAFA`, text-secondary `#A1A1AA`, border `#27272A`.

## When generic is the wrong choice

Don't default to generic when the user actually has a platform in mind. Read the request — phrases like "an app", "a screen", "the home view" usually imply iOS or Android. Phrases like "a landing page", "the marketing site" imply web. Ask if it's ambiguous.

Generic is right for:
- Internal tools (admin panels, dashboards that aren't part of a public product)
- Design system components shown in isolation
- Illustrations and visual mockups that aren't full screens
- Documentation examples
- When the user explicitly says "platform-agnostic" or "any platform"
