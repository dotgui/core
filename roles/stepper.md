---
role: stepper
reach: full
platforms: web, ios, android
---

# Stepper

A control with increment and decrement buttons for adjusting a numeric value.

**AKA:** quantity-stepper, number-stepper, increment-decrement, counter

## States

### Quantity stepper
```xml
<row role="stepper" fill="$color-surface-raised" radius="10" h="36" align="center-center" gap="0">
  <rect w="36" h="36" radius="8 0 0 8" align="center-center">
    <text font-size="20" font-weight="300">−</text>
  </rect>
  <text font-size="15" font-weight="500" w="36" align="center">3</text>
  <rect w="36" h="36" radius="0 8 8 0" align="center-center">
    <text font-size="20" font-weight="300">+</text>
  </rect>
</row>
```

### Outlined style
```xml
<row role="stepper" border="1 $color-border" radius="8" h="36" align="center-center" gap="0">
  <rect w="36" h="36" border="0 1 0 0 $color-border" align="center-center">
    <img src="minus.svg" w="14" h="14" />
  </rect>
  <text font-size="15" font-weight="500" w="40" align="center">1</text>
  <rect w="36" h="36" border="0 0 0 1 $color-border" align="center-center">
    <img src="plus.svg" w="14" h="14" />
  </rect>
</row>
```
