---
role: card
platforms: web, ios, android
---

# Card

Contained surface grouping related content and optional actions.

**AKA:** content-card, panel, tile

## States

### Basic
```xml
<col role="card" fill="$color-surface-raised" radius="12" p="16" gap="8" shadow="0 2 8 rgba(0,0,0,0.08)">
  <text font-size="16" font-weight="600">Card title</text>
  <text font-size="14" color="$color-text-secondary">Supporting text that describes the card content.</text>
</col>
```

### With cover image
```xml
<col role="card" fill="$color-surface-raised" radius="12" shadow="0 2 8 rgba(0,0,0,0.08)">
  <img src="cover.jpg" w="100%" h="160" radius="12 12 0 0" />
  <col p="16" gap="8">
    <text font-size="16" font-weight="600">Card title</text>
    <text font-size="14" color="$color-text-secondary">Supporting description text.</text>
  </col>
</col>
```

### With actions
```xml
<col role="card" fill="$color-surface-raised" radius="12" p="16" gap="12" shadow="0 2 8 rgba(0,0,0,0.08)">
  <text font-size="16" font-weight="600">Confirm action</text>
  <text font-size="14" color="$color-text-secondary">This will permanently delete the item.</text>
  <row gap="8" align="center-right">
    <text font-size="14" font-weight="600" color="$color-text-secondary">Cancel</text>
    <rect h="36" p="0 16" radius="8" fill="$color-danger">
      <text font-size="14" font-weight="600" color="#fff">Delete</text>
    </rect>
  </row>
</col>
```

### Horizontal layout
```xml
<row role="card" fill="$color-surface-raised" radius="12" p="16" gap="16" align="center-left" shadow="0 2 8 rgba(0,0,0,0.08)">
  <img src="thumbnail.jpg" w="64" h="64" radius="8" />
  <col gap="4">
    <text font-size="15" font-weight="600">Item title</text>
    <text font-size="13" color="$color-text-secondary">Subtitle or metadata</text>
  </col>
</row>
```
