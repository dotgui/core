---
role: radio-button
platforms: web, ios, android
---

# Radio Button

Single-selection control where only one option from a group can be chosen.

**AKA:** radio, radio-option, radio-group

## States

### Unselected
```xml
<row role="radio-button" gap="10" align="center-left">
  <rect w="20" h="20" radius="10" border="1.5 $color-border" />
  <text font-size="15">Option A</text>
</row>
```

### Selected
```xml
<row role="radio-button" gap="10" align="center-left">
  <rect w="20" h="20" radius="10" border="2 $color-brand-primary" align="center-center">
    <rect w="10" h="10" radius="5" fill="$color-brand-primary" />
  </rect>
  <text font-size="15" font-weight="500">Option A</text>
</row>
```

### Radio group
```xml
<col role="radio-button" gap="16">
  <row gap="10" align="center-left">
    <rect w="20" h="20" radius="10" border="2 $color-brand-primary" align="center-center">
      <rect w="10" h="10" radius="5" fill="$color-brand-primary" />
    </rect>
    <text font-size="15">Monthly billing</text>
  </row>
  <row gap="10" align="center-left">
    <rect w="20" h="20" radius="10" border="1.5 $color-border" />
    <text font-size="15">Annual billing</text>
  </row>
</col>
```
