---
role: item-indicator
platforms: web, ios, android
---

# Item Indicator

Row of dots or marks showing position within an ordered set of items — slides, steps, pages, or images.

**AKA:** page-control, dot-indicator, step-indicator, carousel-indicator, slider-dots

## States

### Dots (current highlighted)
```xml
<row role="item-indicator" gap="6" align="center-center">
  <rect w="8" h="8" radius="4" fill="$color-brand-primary" />
  <rect w="8" h="8" radius="4" fill="$color-border" />
  <rect w="8" h="8" radius="4" fill="$color-border" />
  <rect w="8" h="8" radius="4" fill="$color-border" />
</row>
```

### Elongated active dot
```xml
<row role="item-indicator" gap="6" align="center-center">
  <rect w="20" h="6" radius="3" fill="$color-brand-primary" />
  <rect w="6" h="6" radius="3" fill="$color-border" />
  <rect w="6" h="6" radius="3" fill="$color-border" />
  <rect w="6" h="6" radius="3" fill="$color-border" />
</row>
```

### Dashes (step-style)
```xml
<row role="item-indicator" gap="4" align="center-center">
  <rect w="32" h="3" radius="1.5" fill="$color-brand-primary" />
  <rect w="32" h="3" radius="1.5" fill="$color-brand-primary" />
  <rect w="32" h="3" radius="1.5" fill="$color-border" />
  <rect w="32" h="3" radius="1.5" fill="$color-border" />
  <rect w="32" h="3" radius="1.5" fill="$color-border" />
</row>
```
