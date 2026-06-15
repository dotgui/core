---
role: full-screen-overlay
platforms: web, ios, android
---

# Full Screen Overlay

A view that occupies the entire screen, typically presented modally over another screen.

**AKA:** immersive-modal, full-screen-modal, sheet

## States

### Default
```xml
<col role="full-screen-overlay" fill="$color-surface" w="390" h="844" gap="0">
  <row p="16 20" align="center-between">
    <text font-size="17" font-weight="600">New post</text>
    <img src="close.svg" w="22" h="22" />
  </row>
  <line fill="$color-border" />
  <col p="20" gap="16" fill="1">
    <text font-size="15" color="$color-text-tertiary">What's on your mind?</text>
  </col>
  <row p="12 20" border="1 0 0 0 $color-border" align="center-between">
    <row gap="20">
      <img src="image.svg" w="24" h="24" />
      <img src="at.svg" w="24" h="24" />
      <img src="location.svg" w="24" h="24" />
    </row>
    <rect h="36" p="0 20" radius="18" fill="$color-brand-primary">
      <text font-size="14" font-weight="600" color="#fff">Post</text>
    </rect>
  </row>
</col>
```

### Image viewer
```xml
<col role="full-screen-overlay" fill="#000" w="390" h="844" align="center-center" gap="0">
  <row p="16 20" align="center-between" fill="rgba(0,0,0,0.4)">
    <img src="chevron-left.svg" w="22" h="22" />
    <text font-size="15" font-weight="500" color="#fff">3 of 12</text>
    <img src="share.svg" w="22" h="22" />
  </row>
  <img src="photo.jpg" w="390" h="390" />
</col>
```
