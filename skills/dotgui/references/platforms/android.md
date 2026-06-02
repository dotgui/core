# Platform: Android (Material 3)

## Canvas

- **Width:** 360 (Material baseline) or 412 (Pixel 6/7/8 width — also common). Default to 360.
- **Height:** 800 for fixed, or `<col>` for scrolling content
- **Status bar:** ~24dp top. Navigation bar: ~48dp bottom (gesture handles use ~24dp).

## Fonts

- **Primary:** `Roboto` or `Google Sans` (both Google fonts)
- Material 3 uses `Roboto Flex` on newer Android; `Roboto` is the safest declaration

```xml
<fonts>
  <font family="Roboto" source="google" weights="400 500 600 700" styles="normal" />
</fonts>
```

## Type scale (Material 3)

Material 3 has a 15-step type scale. The ones you'll actually use:

| Role | Size / line-height / weight |
| --- | --- |
| Display Large | 57 / 64 / 400 |
| Display Medium | 45 / 52 / 400 |
| Headline Large | 32 / 40 / 400 |
| Headline Medium | 28 / 36 / 400 |
| Headline Small | 24 / 32 / 400 |
| Title Large | 22 / 28 / 400 |
| Title Medium | 16 / 24 / 500 |
| Title Small | 14 / 20 / 500 |
| Body Large | 16 / 24 / 400 |
| Body Medium | 14 / 20 / 400 |
| Label Large | 14 / 20 / 500 (buttons) |
| Label Medium | 12 / 16 / 500 |
| Label Small | 11 / 16 / 500 |

Material weight conventions are lighter than iOS — Display/Headline are 400, not 700. Body is 16 (Body Large), not 17.

## Spacing

Material uses an 8-based scale: 4, 8, 12, 16, 24, 32, 48, 64.

**Screen edge padding:** 16dp standard.

**Vertical rhythm:** 24 between sections, 8–16 within a group.

## Corner radius (Material 3 shape scale)

- **None:** 0
- **Extra Small:** 4
- **Small:** 8 (chips, small components)
- **Medium:** 12 (cards)
- **Large:** 16 (large cards, dialogs)
- **Extra Large:** 28 (bottom sheets, big surfaces)
- **Full:** 999 (FABs, pills)

## Color palette starting point

Material 3 uses dynamic color, but for a designed mockup, pick a primary and derive surfaces from it. A neutral starting point:

```xml
<tokens>
  <color name="bg" value="#FEF7FF" />              <!-- surface (light) -->
  <color name="surface" value="#FFFBFE" />
  <color name="surface-variant" value="#E7E0EC" />
  <color name="text-primary" value="#1C1B1F" />
  <color name="text-secondary" value="#49454F" />
  <color name="outline" value="#79747E" />
  <color name="primary" value="#6750A4" />          <!-- Material default primary -->
  <color name="on-primary" value="#FFFFFF" />
  <color name="primary-container" value="#EADDFF" />
  <color name="on-primary-container" value="#21005D" />
  <color name="error" value="#B3261E" />
</tokens>
```

For dark theme: `bg #1C1B1F`, `surface #1C1B1F`, `surface-variant #49454F`, `text-primary #E6E1E5`, `primary #D0BCFF`.

## Material conventions

- **App bar (top):** 64dp tall. Can collapse on scroll (large → medium → small).
- **FAB (Floating Action Button):** 56×56dp, bottom-right with 16dp margin, primary container color. Use for the single most prominent action on a screen.
- **Bottom navigation bar:** 80dp tall. 3–5 destinations.
- **Cards:** filled (with `surface` background), elevated (with shadow), or outlined (with `outline` stroke).
- **Buttons:** Filled, Tonal, Outlined, Text, Elevated. Min height 40dp, label uses Label Large.
- **Icons:** Material Symbols — outlined by default (1.5–2px stroke). Filled versions for selected states.
- **Ripples:** Not representable in static markup, but design as though they exist — buttons and list items should have enough padding for a touch target.

## Android pitfalls

- **Don't use tab bars at the bottom in iOS style.** Android uses a "Bottom Navigation Bar" which looks similar but uses Material conventions (active item often shows a pill-shaped background).
- **Don't use SF Pro or iOS blue (`#007AFF`).** Roboto and Material color tokens.
- **Don't put navigation arrows on the right.** Android forward arrows go on the left (right-to-left languages aside).
- **Use elevation, not just shadows.** Material elevation is conventional (1, 2, 3, 4, 5). Translate to `drop-shadow` effects with increasing radius/y-offset.
- **Don't ignore the FAB.** If a screen has one dominant action (compose, add, create), it goes in a FAB.

## A minimal Android screen skeleton

```xml
<gui version="0.2" name="Inbox">
  <tokens>
    <color name="bg" value="#FEF7FF" />
    <color name="surface" value="#FFFBFE" />
    <color name="text-primary" value="#1C1B1F" />
    <color name="text-secondary" value="#49454F" />
    <color name="primary" value="#6750A4" />
    <color name="on-primary" value="#FFFFFF" />
    <number name="radius-card" value="12" />
  </tokens>
  <fonts>
    <font family="Roboto" source="google" weights="400 500 700" styles="normal" />
  </fonts>
  <col w="360" fill="$bg">
     <!-- Status bar spacer -->
     <col h="24" />

     <!-- Top app bar -->
     <row h="64" p="0 16" align="middle-left" gap="16" fill="$bg">
       <img src="https://api.iconify.design/lucide/menu.svg?color=%231C1B1F" w="24" h="24" />
       <text value="Inbox" font-family="Roboto" font-size="22" font-weight="500" color="$text-primary" />
     </row>

     <!-- Content -->
     <col p="0 16" gap="8">
       ...
     </col>

     <!-- FAB -->
     <row abs x="288" y="700">
       <row w="56" h="56" radius="16" fill="$primary" align="middle-center">
         <img src="https://api.iconify.design/lucide/plus.svg?color=%23FFFFFF" w="24" h="24" />
       </row>
     </row>
  </col>
</gui>
```
