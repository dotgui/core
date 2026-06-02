# Platform: Web mobile

## Canvas

- **Width:** 390 (iPhone-class device, the most common design width for mobile web)
- Other common widths: 360, 414. Default to 390.
- **Height:** `<col>` with no `h` for scrolling pages. Mobile web is almost always scrolling — `<frame>` is rarely the right choice.

## Fonts

Same as web desktop — Google Fonts.

```xml
<fonts>
  <font family="Inter" source="google" weights="400 500 600 700" styles="normal" />
</fonts>
```

System font stack (`-apple-system`, `BlinkMacSystemFont`, ...) isn't directly expressible in `.gui` — declare a specific family.

## Type scale

Tighter than desktop. Web mobile screens are short, so big headlines waste real estate.

| Role | Size / line-height / weight |
| --- | --- |
| Hero | 32 / 40 / 700 |
| H1 | 28 / 36 / 700 |
| H2 | 22 / 28 / 600 |
| H3 | 18 / 26 / 600 |
| Body | 15 / 22 / 400 |
| Body small | 14 / 22 / 400 |
| Caption | 12 / 18 / 400 |

## Spacing

4-based, with smaller increments than desktop. Common: 4, 8, 12, 16, 24, 32, 48.

**Edge padding:** 16 (with some designs going to 20 or 24 for breathing room).

**Section separation:** 32–48 between major sections.

## Corner radius

Mobile web tends to use slightly larger radii than mobile native, because shadow-based depth doesn't work as well in a browser.

- **Subtle:** 8
- **Card:** 12–16
- **Pill:** 999

## Mobile web vs native mobile differences

Mobile web is **not** an iOS or Android app — it's a website rendered on a phone. Important differences:

- **No tab bar at the bottom by default.** Some PWAs add one, but most mobile websites use a hamburger menu in the top right or a sticky top nav with limited links.
- **No native chrome.** Don't draw the status bar or home indicator unless you're explicitly designing a PWA mockup.
- **No SF Pro or Roboto.** Use cross-platform fonts (Inter, Geist) so the design looks consistent on both iOS and Android browsers.
- **Buttons can be full-width.** Mobile CTAs often span the screen with some edge padding (16–24).
- **Hover states don't matter.** Touch-first interactions, larger tap targets (44×44 minimum).

## Common mobile web patterns

### Marketing / landing
- Sticky top bar with logo + hamburger
- Hero: stacked headline → subhead → primary CTA → secondary link
- Feature blocks stack vertically (no side-by-side at this width)
- Footer with collapsed link lists (or expand-on-tap accordions)

### App-like (PWA, web app)
- Top header with title + back arrow or hamburger
- Content area with cards/lists
- Sticky bottom action bar for primary CTAs (alternative to tab bar)

### Long-form content
- Single column, comfortable reading width is the screen width minus padding
- Larger body text (16–17px) for readability on smaller screens

## Web mobile pitfalls

- **Don't copy an iOS native design.** Tab bars at the bottom look out of place on the web. Status bar treatments don't apply.
- **Don't squeeze desktop content into 390 wide.** Re-think the layout, don't just scale.
- **Touch targets ≥44px tall.** A 28px-tall button works in a desktop comp but is unusable on mobile.
- **Don't forget the keyboard.** Forms on mobile web get covered by the keyboard. CTAs go above the form, not below.

## A minimal mobile web skeleton

```xml
<gui version="0.2" name="Mobile/Landing">
  <tokens>
    <color name="bg" value="#FFFFFF" />
    <color name="surface" value="#F8F9FB" />
    <color name="text-primary" value="#0A0A0F" />
    <color name="text-secondary" value="#5C6075" />
    <color name="primary" value="#6366F1" />
    <number name="radius-md" value="12" />
  </tokens>
  <fonts>
    <font family="Inter" source="google" weights="400 500 600 700" styles="normal" />
  </fonts>
  <col w="390" fill="$bg">
    <!-- Sticky top bar -->
    <row h="56" p="0 16" align="middle-left" fill="$bg">
      <text value="Brand" font-family="Inter" font-size="18" font-weight="700" color="$text-primary" />
      <col w="fill" />
      <img src="https://api.iconify.design/lucide/menu.svg?color=%230A0A0F" w="24" h="24" />
    </row>

    <!-- Hero -->
    <col p="32 20 48 20" gap="16">
      <text value="A headline that says something." font-family="Inter" font-size="32" font-weight="700" line-height="40" color="$text-primary" />
      <text value="A subheadline with real context. One sentence." font-family="Inter" font-size="17" font-weight="400" line-height="26" color="$text-secondary" />
      <row h="48" align="middle-center" radius="$radius-md" fill="$primary" p="0 24">
        <text value="Get started" font-family="Inter" font-size="15" font-weight="600" color="#FFFFFF" />
      </row>
    </col>
  </col>
</gui>
```
