---
role: table
reach: 2
platforms: web, ios, android
---

# Table

Grid of rows and columns presenting structured data.

**AKA:** data-table, data-grid

## States

### Simple table
```xml
<col role="table" border="1 $color-border" radius="10" overflow="hidden">
  <row fill="$color-surface-raised" border="0 0 1 0 $color-border">
    <text p="10 16" font-size="12" font-weight="600" color="$color-text-secondary" w="200">NAME</text>
    <text p="10 16" font-size="12" font-weight="600" color="$color-text-secondary" w="120">STATUS</text>
    <text p="10 16" font-size="12" font-weight="600" color="$color-text-secondary" w="100">DATE</text>
  </row>
  <row border="0 0 1 0 $color-border">
    <text p="12 16" font-size="14" w="200">Project Alpha</text>
    <row p="12 16" w="120">
      <rect h="22" p="0 8" radius="11" fill="$color-success-subtle">
        <text font-size="12" font-weight="500" color="$color-success">Active</text>
      </rect>
    </row>
    <text p="12 16" font-size="14" color="$color-text-secondary" w="100">Jun 12</text>
  </row>
  <row>
    <text p="12 16" font-size="14" w="200">Project Beta</text>
    <row p="12 16" w="120">
      <rect h="22" p="0 8" radius="11" fill="$color-surface-raised">
        <text font-size="12" font-weight="500" color="$color-text-secondary">Draft</text>
      </rect>
    </row>
    <text p="12 16" font-size="14" color="$color-text-secondary" w="100">Jun 8</text>
  </row>
</col>
```

### With checkboxes and actions
```xml
<col role="table" border="1 $color-border" radius="10" overflow="hidden">
  <row fill="$color-surface-raised" border="0 0 1 0 $color-border" align="center-left">
    <rect w="48" h="44" align="center-center">
      <rect w="16" h="16" radius="3" border="1.5 $color-border" />
    </rect>
    <text p="0 16" font-size="12" font-weight="600" color="$color-text-secondary">NAME</text>
  </row>
  <row border="0 0 1 0 $color-border" align="center-left">
    <rect w="48" h="48" align="center-center">
      <rect w="16" h="16" radius="3" fill="$color-brand-primary">
        <img src="check.svg" w="10" h="10" />
      </rect>
    </rect>
    <text p="0 16" font-size="14">Homepage redesign</text>
  </row>
  <row align="center-left">
    <rect w="48" h="48" align="center-center">
      <rect w="16" h="16" radius="3" border="1.5 $color-border" />
    </rect>
    <text p="0 16" font-size="14">Mobile app audit</text>
  </row>
</col>
```
