---
role: divider
platforms: web, ios, android
---

# Divider

Horizontal or vertical line used to separate sections of content.

**AKA:** separator, rule, hr

## States

### Horizontal
```xml
<line role="divider" fill="$color-border" />
```

### With label
```xml
<row role="divider" gap="12" align="center-center">
  <line fill="$color-border" />
  <text font-size="13" color="$color-text-tertiary">or</text>
  <line fill="$color-border" />
</row>
```

### Vertical
```xml
<line role="divider" fill="$color-border" w="1" h="24" />
```

### Section divider with spacing
```xml
<col gap="0">
  <col p="16" gap="8">
    <text font-size="15" font-weight="600">Section title</text>
    <text font-size="14" color="$color-text-secondary">Section content goes here.</text>
  </col>
  <line role="divider" fill="$color-border" />
  <col p="16" gap="8">
    <text font-size="15" font-weight="600">Next section</text>
    <text font-size="14" color="$color-text-secondary">More content here.</text>
  </col>
</col>
```
