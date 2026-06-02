# Platform: iOS

## Canvas

- **Width:** 390 (iPhone 14/15 standard) — use this unless the user specifies otherwise
- **Height:** 844 for a fixed `<frame>`, or omit `h` and use `<col>` for scrolling content
- **Safe areas:** top 47px (status bar + dynamic island), bottom 34px (home indicator). Content shouldn't bleed under them unless intentional.

## Fonts

- **Primary:** `SF Pro` (`source="system"`)
- **Fallback declaration:** always include `Inter` as a backup with `source="google"` — `SF Pro` only resolves on Apple devices

```xml
<fonts>
  <font family="SF Pro" source="system" weights="400 500 600 700" styles="normal" />
  <font family="Inter" source="google" weights="400 500 600 700" styles="normal" />
</fonts>
```

In text nodes, use `font-family="SF Pro"`. The renderer falls back via the `<fonts>` table.

## Type scale (Apple HIG-aligned)

| Role | Size / line-height / weight |
| --- | --- |
| Large Title | 34 / 41 / 700 |
| Title 1 | 28 / 34 / 700 |
| Title 2 | 22 / 28 / 600 |
| Title 3 | 20 / 25 / 600 |
| Headline | 17 / 22 / 600 |
| Body | 17 / 22 / 400 |
| Callout | 16 / 21 / 400 |
| Subheadline | 15 / 20 / 400 |
| Footnote | 13 / 18 / 400 |
| Caption 1 | 12 / 16 / 400 |
| Caption 2 | 11 / 13 / 400 |

iOS body is 17, not 15 or 16. Get this right — it's a tell.

## Spacing

iOS uses a 4-based scale. Common values: 4, 8, 12, 16, 20, 24, 28, 32.

**Screen edge padding:** 16 or 20 from the screen edge (16 for content-heavy, 20 for more breathing room).

**Vertical rhythm:** 24 between unrelated sections, 8–12 within a group.

## Corner radius

- **Subtle:** 8 (inputs, small chips)
- **Card:** 12 or 14
- **Large card / sheet:** 16 or 20
- **Continuous corners:** iOS uses superellipse corners on real devices; the `.gui` format renders standard rounded corners, but design as if continuous (slightly larger values look right)
- **Buttons:** 12 (filled), or capsule (height/2) for prominent CTAs

## Color palette starting point

```xml
<tokens>
  <color name="bg" value="#F2F2F7" />            <!-- system grouped background -->
  <color name="surface" value="#FFFFFF" />        <!-- card -->
  <color name="surface-2" value="#F2F2F7" />      <!-- inset, hover -->
  <color name="text-primary" value="#1C1C1E" />
  <color name="text-secondary" value="#6E6E73" />
  <color name="text-tertiary" value="#AEAEB2" />
  <color name="border" value="#E5E5EA" />
  <color name="primary" value="#007AFF" />        <!-- iOS blue, the only system accent -->
  <color name="danger" value="#FF3B30" />
  <color name="success" value="#34C759" />
  <color name="warning" value="#FF9500" />
</tokens>
```

For dark mode, swap to `bg #000000`, `surface #1C1C1E`, `surface-2 #2C2C2E`, `text-primary #FFFFFF`, `text-secondary #98989F`, `border #38383A`.

## iOS conventions to follow

- **Large titles** at the top of primary screens (Title 1 or Large Title, left-aligned, 24px from screen edge, padded above and below)
- **Grouped list style** — list items live inside a rounded card with internal dividers (1px `#E5E5EA` insets at 16 from the left)
- **Tab bar at bottom**, ~83px tall (49 + 34 safe area). 4–5 icons with labels.
- **Nav bar at top**, ~44px (under the status bar) with title centered or large-title style
- **System icons** — Use SF Symbols-style icons (1.5–2px stroke, rounded line caps). Since inline `<svg>` is removed, load system icons using standard `<img>` tags pointing to public icon URLs (e.g. `https://api.iconify.design/lucide/...`).
- **Right-pointing chevrons** at the end of disclosable list items (`>` style, gray)

## iOS pitfalls (don't do these)

- **No hamburger menus.** iOS uses tab bars at the bottom. If you need more navigation, use a "More" tab.
- **No floating action buttons.** That's Material. iOS puts the primary action in the nav bar (top right) or as a full-width capsule button near the bottom.
- **No raised button styles with heavy shadows.** iOS buttons are flat. Filled with color, or stroked, or text-only.
- **No Material-style ripples or elevation shadows.** iOS uses subtle, soft shadows if any (e.g. `drop-shadow 0 4 16 #00000010`).
- **Don't use the Google Material color palette** (`#1A73E8`, `#34A853`, etc.). It will look immediately wrong.
- **Don't put a back arrow on the leftmost screen of a flow.** Back arrows imply a navigation stack.

## A minimal iOS screen skeleton

```xml
<gui version="0.2" name="Profile">
  <tokens>
    <color name="bg" value="#F2F2F7" />
    <color name="surface" value="#FFFFFF" />
    <color name="text-primary" value="#1C1C1E" />
    <color name="text-secondary" value="#6E6E73" />
    <color name="border" value="#E5E5EA" />
    <color name="primary" value="#007AFF" />
    <number name="radius-card" value="12" />
  </tokens>
  <fonts>
    <font family="SF Pro" source="system" weights="400 600 700" styles="normal" />
    <font family="Inter" source="google" weights="400 600 700" styles="normal" />
  </fonts>
  <col w="390" fill="$bg">
    <!-- Status bar + nav bar area -->
    <col h="91" />

    <!-- Large title -->
    <col p="16 20 8 20">
      <text value="Profile" font-family="SF Pro" font-size="34" font-weight="700" color="$text-primary" />
    </col>

    <!-- Content -->
    <col p="16 16" gap="16">
      <col fill="$surface" radius="$radius-card" p="16" gap="12">
        ...
      </col>
    </col>
  </col>
</gui>
```
