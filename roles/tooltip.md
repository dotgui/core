---
role: tooltip
reach: full
platforms: web, ios, android
---

# Tooltip

Small label that appears on hover or long-press to explain a control or provide context.

**AKA:** hint, info-tip, hover-label

## States

### Default
```xml
<rect role="tooltip" fill="$color-foreground" radius="6" p="6 10">
  <text font-size="12" color="#fff">Bold (⌘B)</text>
</rect>
```

### With arrow (above element)
```xml
<col role="tooltip" gap="0" align="center-center">
  <rect fill="$color-foreground" radius="6" p="6 10">
    <text font-size="12" color="#fff">Delete item</text>
  </rect>
  <rect w="8" h="5" fill="$color-foreground" />
</col>
```

### Long description
```xml
<rect role="tooltip" fill="$color-foreground" radius="8" p="8 12" w="200">
  <text font-size="12" color="#fff" align="center">Applies to all items in this group and its subgroups</text>
</rect>
```
