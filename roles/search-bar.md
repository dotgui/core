---
role: search-bar
platforms: web, ios, android
---

# Search Bar

Input field dedicated to searching or filtering content.

**AKA:** search-field, search-input, search-box

## States

### Default
```xml
<row role="search-bar" fill="$color-surface-raised" radius="10" h="40" p="0 12" gap="8" align="center-left">
  <img src="search.svg" w="16" h="16" />
  <text font-size="15" color="$color-text-tertiary">Search</text>
</row>
```

### With value and clear
```xml
<row role="search-bar" fill="$color-surface-raised" radius="10" h="40" p="0 12" gap="8" align="center-between">
  <row gap="8" align="center-left">
    <img src="search.svg" w="16" h="16" />
    <text font-size="15">design system</text>
  </row>
  <img src="close-circle.svg" w="18" h="18" />
</row>
```

### Prominent (top of screen)
```xml
<row role="search-bar" fill="$color-surface" border="1 $color-border" radius="12" h="48" p="0 16" gap="10" align="center-left">
  <img src="search.svg" w="18" h="18" />
  <text font-size="16" color="$color-text-tertiary">Search projects…</text>
</row>
```

### With filter action
```xml
<row role="search-bar" gap="10" align="center-left">
  <row fill="$color-surface-raised" radius="10" h="40" p="0 12" gap="8" align="center-left" fill="1">
    <img src="search.svg" w="16" h="16" />
    <text font-size="15" color="$color-text-tertiary">Search</text>
  </row>
  <rect w="40" h="40" radius="10" fill="$color-surface-raised" align="center-center">
    <img src="filter.svg" w="18" h="18" />
  </rect>
</row>
```
