---
role: combobox
platforms: web
---

# Combobox

Text input combined with a filterable dropdown list of suggestions.

**AKA:** autocomplete, searchable-select, typeahead

## States

### Closed
```xml
<col role="combobox" gap="4">
  <text font-size="13" font-weight="500" color="$color-text-secondary">Country</text>
  <row fill="$color-surface" border="1 $color-border" radius="8" h="40" p="0 12" align="center-between">
    <text font-size="15" color="$color-text-tertiary">Search countries…</text>
    <img src="chevron-down.svg" w="16" h="16" />
  </row>
</col>
```

### Open with results
```xml
<col role="combobox" gap="0">
  <col gap="4">
    <text font-size="13" font-weight="500" color="$color-text-secondary">Country</text>
    <row fill="$color-surface" border="1 $color-brand-primary" radius="8 8 0 0" h="40" p="0 12" align="center-between">
      <text font-size="15">Ire</text>
      <img src="chevron-up.svg" w="16" h="16" />
    </row>
  </col>
  <col fill="$color-surface" border="1 $color-border" radius="0 0 8 8" shadow="0 4 12 rgba(0,0,0,0.1)">
    <text p="10 12" font-size="15" fill="$color-brand-subtle" color="$color-brand-primary">Ireland</text>
    <line fill="$color-border" />
    <text p="10 12" font-size="15">Iran</text>
    <line fill="$color-border" />
    <text p="10 12" font-size="15">Iraq</text>
  </col>
</col>
```
