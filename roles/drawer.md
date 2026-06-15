---
role: drawer
platforms: web, ios, android
---

# Drawer

Panel that slides in from a screen edge, overlaying content without replacing it.

**AKA:** side-sheet, bottom-sheet, slide-over, panel

## States

### Side drawer (desktop)
```xml
<col role="drawer" fill="$color-surface" w="280" h="100%" p="24" gap="24" shadow="4 0 16 rgba(0,0,0,0.12)">
  <row align="center-between">
    <text font-size="17" font-weight="600">Filters</text>
    <img src="close.svg" w="20" h="20" />
  </row>
  <col gap="16">
    <text font-size="15" font-weight="500">Category</text>
    <col gap="10">
      <row gap="10" align="center-left">
        <rect w="18" h="18" radius="4" fill="$color-brand-primary">
          <img src="check.svg" w="12" h="12" />
        </rect>
        <text font-size="15">Design</text>
      </row>
      <row gap="10" align="center-left">
        <rect w="18" h="18" radius="4" border="1.5 $color-border" />
        <text font-size="15">Engineering</text>
      </row>
    </col>
  </col>
  <rect h="44" radius="10" fill="$color-brand-primary" align="center-center">
    <text font-size="15" font-weight="600" color="#fff">Apply filters</text>
  </rect>
</col>
```

### Bottom sheet (mobile)
```xml
<col role="drawer" fill="$color-surface" radius="20 20 0 0" p="12 0 32" gap="0" w="390" shadow="0 -4 16 rgba(0,0,0,0.12)">
  <rect w="36" h="4" radius="2" fill="$color-border" align="center-center" p="0 0 16" />
  <text font-size="17" font-weight="600" p="0 20 16">Share</text>
  <col gap="0">
    <row p="14 20" gap="14" align="center-left">
      <img src="link.svg" w="22" h="22" />
      <text font-size="16">Copy link</text>
    </row>
    <line fill="$color-border" />
    <row p="14 20" gap="14" align="center-left">
      <img src="mail.svg" w="22" h="22" />
      <text font-size="16">Send via email</text>
    </row>
  </col>
</col>
```
