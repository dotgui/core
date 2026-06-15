---
role: slider
platforms: web, ios, android
---

# Slider

A track with a draggable thumb for selecting a value within a continuous range.

**AKA:** range-slider, scrubber, input-range

## States

### Single value
```xml
<col role="slider" gap="8">
  <row align="center-between">
    <text font-size="13" color="$color-text-secondary">Volume</text>
    <text font-size="13" font-weight="500">72</text>
  </row>
  <rect w="100%" h="4" radius="2" fill="$color-surface-raised">
    <rect w="72%" h="4" radius="2" fill="$color-brand-primary" />
    <rect w="12" h="12" radius="6" fill="$color-brand-primary" shadow="0 1 4 rgba(0,0,0,0.2)" />
  </rect>
</col>
```

### Range slider
```xml
<col role="slider" gap="8">
  <row align="center-between">
    <text font-size="13" color="$color-text-secondary">Price range</text>
    <text font-size="13" font-weight="500">$20 – $80</text>
  </row>
  <rect w="100%" h="4" radius="2" fill="$color-surface-raised">
    <rect x="20%" w="60%" h="4" fill="$color-brand-primary" />
    <rect w="12" h="12" radius="6" fill="#fff" border="2 $color-brand-primary" shadow="0 1 4 rgba(0,0,0,0.2)" />
    <rect w="12" h="12" radius="6" fill="#fff" border="2 $color-brand-primary" shadow="0 1 4 rgba(0,0,0,0.2)" />
  </rect>
</col>
```

### With steps
```xml
<col role="slider" gap="4">
  <rect w="100%" h="4" radius="2" fill="$color-surface-raised">
    <rect w="50%" h="4" radius="2" fill="$color-brand-primary" />
    <rect w="12" h="12" radius="6" fill="$color-brand-primary" shadow="0 1 4 rgba(0,0,0,0.2)" />
  </rect>
  <row align="center-between">
    <text font-size="11" color="$color-text-tertiary">Low</text>
    <text font-size="11" color="$color-text-tertiary">Medium</text>
    <text font-size="11" color="$color-text-tertiary">High</text>
  </row>
</col>
```
