---
role: segmented-control
reach: full
platforms: web, ios, android
---

# Segmented Control

A set of mutually exclusive options displayed as connected segments, one selected at a time.

**AKA:** segmented-button-group, button-group, tab-toggle

## States

### Two segments
```xml
<row role="segmented-control" fill="$color-surface-raised" radius="10" p="2" gap="0" h="36">
  <rect fill="$color-surface" radius="8" h="32" p="0 20" align="center-center" shadow="0 1 4 rgba(0,0,0,0.1)">
    <text font-size="14" font-weight="500">Monthly</text>
  </rect>
  <rect h="32" p="0 20" align="center-center">
    <text font-size="14" color="$color-text-secondary">Annual</text>
  </rect>
</row>
```

### Three segments
```xml
<row role="segmented-control" fill="$color-surface-raised" radius="10" p="2" gap="0" h="36">
  <rect h="32" p="0 16" align="center-center">
    <text font-size="13" color="$color-text-secondary">Day</text>
  </rect>
  <rect fill="$color-surface" radius="8" h="32" p="0 16" align="center-center" shadow="0 1 4 rgba(0,0,0,0.1)">
    <text font-size="13" font-weight="500">Week</text>
  </rect>
  <rect h="32" p="0 16" align="center-center">
    <text font-size="13" color="$color-text-secondary">Month</text>
  </rect>
</row>
```

### With icons
```xml
<row role="segmented-control" fill="$color-surface-raised" radius="10" p="2" gap="0" h="36">
  <rect fill="$color-surface" radius="8" h="32" p="0 16" align="center-center" shadow="0 1 4 rgba(0,0,0,0.1)">
    <img src="grid.svg" w="16" h="16" />
  </rect>
  <rect h="32" p="0 16" align="center-center">
    <img src="list.svg" w="16" h="16" />
  </rect>
</row>
```
