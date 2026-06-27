---
role: checkbox
reach: full
platforms: web, ios, android
---

# Checkbox

Binary selection control for toggling an option on or off.

**AKA:** checklist-item, tick-box

## States

### Unchecked
```xml
<row role="checkbox" gap="10" align="center-left">
  <rect w="18" h="18" radius="4" border="1.5 $color-border" />
  <text font-size="15">Accept terms and conditions</text>
</row>
```

### Checked
```xml
<row role="checkbox" gap="10" align="center-left">
  <rect w="18" h="18" radius="4" fill="$color-brand-primary">
    <img src="check.svg" w="12" h="12" />
  </rect>
  <text font-size="15">Accept terms and conditions</text>
</row>
```

### Indeterminate
```xml
<row role="checkbox" gap="10" align="center-left">
  <rect w="18" h="18" radius="4" fill="$color-brand-primary">
    <rect w="10" h="2" radius="1" fill="#fff" />
  </rect>
  <text font-size="15">Select all</text>
</row>
```

### Checklist group
```xml
<col role="checkbox" gap="16">
  <row gap="10" align="center-left">
    <rect w="18" h="18" radius="4" fill="$color-brand-primary">
      <img src="check.svg" w="12" h="12" />
    </rect>
    <text font-size="15">Email notifications</text>
  </row>
  <row gap="10" align="center-left">
    <rect w="18" h="18" radius="4" border="1.5 $color-border" />
    <text font-size="15">SMS notifications</text>
  </row>
  <row gap="10" align="center-left">
    <rect w="18" h="18" radius="4" fill="$color-brand-primary">
      <img src="check.svg" w="12" h="12" />
    </rect>
    <text font-size="15">Push notifications</text>
  </row>
</col>
```
