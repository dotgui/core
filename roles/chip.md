---
role: chip
reach: full
platforms: web, ios, android
---

# Chip

Compact tag used for filtering, selection, or labelling.

**AKA:** filter-chip, suggestion-chip, tag, label

## States

### Default
```xml
<rect role="chip" h="32" p="0 12" radius="16" border="1 $color-border">
  <text font-size="14" color="$color-text-primary">Design</text>
</rect>
```

### Selected
```xml
<row role="chip" h="32" p="0 12" radius="16" fill="$color-brand-subtle" gap="6" align="center-center">
  <img src="check.svg" w="14" h="14" />
  <text font-size="14" color="$color-brand-primary" font-weight="500">Design</text>
</row>
```

### Dismissible
```xml
<row role="chip" h="32" p="0 8 0 12" radius="16" fill="$color-surface-raised" gap="6" align="center-center">
  <text font-size="14" color="$color-text-primary">Design</text>
  <img src="close.svg" w="14" h="14" />
</row>
```

### Filter row
```xml
<row role="chip" gap="8">
  <rect h="32" p="0 12" radius="16" fill="$color-brand-subtle">
    <text font-size="14" color="$color-brand-primary" font-weight="500">All</text>
  </rect>
  <rect h="32" p="0 12" radius="16" border="1 $color-border">
    <text font-size="14">Design</text>
  </rect>
  <rect h="32" p="0 12" radius="16" border="1 $color-border">
    <text font-size="14">Engineering</text>
  </rect>
  <rect h="32" p="0 12" radius="16" border="1 $color-border">
    <text font-size="14">Marketing</text>
  </rect>
</row>
```
