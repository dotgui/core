---
role: select
reach: full
platforms: web, ios, android
---

# Select

A control that shows a single chosen value and opens a list for changing it.

**AKA:** dropdown, dropdown-select, picker

## States

### Closed
```xml
<col role="select" gap="4">
  <text font-size="13" font-weight="500" color="$color-text-secondary">Role</text>
  <row fill="$color-surface" border="1 $color-border" radius="8" h="40" p="0 12" align="center-between">
    <text font-size="15">Designer</text>
    <img src="chevron-down.svg" w="16" h="16" />
  </row>
</col>
```

### Open
```xml
<col role="select" gap="0">
  <col gap="4">
    <text font-size="13" font-weight="500" color="$color-text-secondary">Role</text>
    <row fill="$color-surface" border="1 $color-brand-primary" radius="8 8 0 0" h="40" p="0 12" align="center-between">
      <text font-size="15">Designer</text>
      <img src="chevron-up.svg" w="16" h="16" />
    </row>
  </col>
  <col fill="$color-surface" border="1 $color-border" radius="0 0 8 8" shadow="0 4 12 rgba(0,0,0,0.1)">
    <text p="10 12" font-size="15" fill="$color-brand-subtle" color="$color-brand-primary" font-weight="500">Designer</text>
    <line fill="$color-border" />
    <text p="10 12" font-size="15">Engineer</text>
    <line fill="$color-border" />
    <text p="10 12" font-size="15">Product Manager</text>
  </col>
</col>
```

### Inline (no label)
```xml
<row role="select" fill="$color-surface-raised" radius="8" h="36" p="0 10" gap="6" align="center-center">
  <text font-size="14" font-weight="500">Last 7 days</text>
  <img src="chevron-down.svg" w="14" h="14" />
</row>
```
