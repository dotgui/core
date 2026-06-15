---
role: pagination
platforms: web, android
---

# Pagination

Numbered page controls for navigating through a multi-page dataset.

**AKA:** pager, page-navigator, page-controls

## States

### Numbered pages
```xml
<row role="pagination" gap="4" align="center-center">
  <rect w="36" h="36" radius="8" border="1 $color-border" align="center-center">
    <img src="chevron-left.svg" w="16" h="16" />
  </rect>
  <rect w="36" h="36" radius="8" border="1 $color-border" align="center-center">
    <text font-size="14">1</text>
  </rect>
  <rect w="36" h="36" radius="8" fill="$color-brand-primary" align="center-center">
    <text font-size="14" font-weight="600" color="#fff">2</text>
  </rect>
  <rect w="36" h="36" radius="8" border="1 $color-border" align="center-center">
    <text font-size="14">3</text>
  </rect>
  <text font-size="14" w="36" align="center" color="$color-text-tertiary">…</text>
  <rect w="36" h="36" radius="8" border="1 $color-border" align="center-center">
    <text font-size="14">12</text>
  </rect>
  <rect w="36" h="36" radius="8" border="1 $color-border" align="center-center">
    <img src="chevron-right.svg" w="16" h="16" />
  </rect>
</row>
```

### Simple prev / next
```xml
<row role="pagination" gap="12" align="center-between">
  <row h="36" p="0 16" radius="8" border="1 $color-border" gap="6" align="center-center">
    <img src="chevron-left.svg" w="14" h="14" />
    <text font-size="14">Previous</text>
  </row>
  <text font-size="14" color="$color-text-secondary">Page 2 of 12</text>
  <row h="36" p="0 16" radius="8" border="1 $color-border" gap="6" align="center-center">
    <text font-size="14">Next</text>
    <img src="chevron-right.svg" w="14" h="14" />
  </row>
</row>
```
