---
role: accordion
reach: 1
platforms: web, ios, android
---

# Accordion

Vertically stacked sections, each with a header that reveals or hides content below it.

**AKA:** disclosure, collapsible, expandable, expansion-panel

## States

### Collapsed
```xml
<col role="accordion">
  <row align="center-between" p="16">
    <text font-size="15" font-weight="500">Section title</text>
    <img src="chevron-down.svg" w="16" h="16" />
  </row>
</col>
```

### Expanded
```xml
<col role="accordion">
  <row align="center-between" p="16">
    <text font-size="15" font-weight="500">Section title</text>
    <img src="chevron-up.svg" w="16" h="16" />
  </row>
  <col p="0 16 16">
    <text color="$color-text-secondary">Expanded content.</text>
  </col>
</col>
```

### Multiple items (one expanded, one collapsed)
```xml
<col role="accordion">
  <col>
    <row align="center-between" p="16">
      <text font-size="15" font-weight="500">Section one</text>
      <img src="chevron-up.svg" w="16" h="16" />
    </row>
    <col p="0 16 16">
      <text color="$color-text-secondary">Expanded content.</text>
    </col>
  </col>
  <line fill="$color-border" />
  <col>
    <row align="center-between" p="16">
      <text font-size="15" font-weight="500">Section two</text>
      <img src="chevron-down.svg" w="16" h="16" />
    </row>
  </col>
</col>
```
