---
role: popover
platforms: web, ios, android
---

# Popover

Small floating panel anchored to a trigger element, for supplementary information or a compact form.

**AKA:** popup, flyout, floating-panel

## States

### Info popover
```xml
<col role="popover" fill="$color-surface" radius="12" shadow="0 4 16 rgba(0,0,0,0.15)" p="16" gap="8" w="220">
  <text font-size="14" font-weight="600">Storage limit</text>
  <text font-size="13" color="$color-text-secondary">You're using 4.2 GB of your 5 GB storage. Upgrade for unlimited storage.</text>
  <text font-size="13" color="$color-brand-primary" font-weight="500">Upgrade plan</text>
</col>
```

### With actions
```xml
<col role="popover" fill="$color-surface" radius="12" shadow="0 4 16 rgba(0,0,0,0.15)" p="16" gap="12" w="200">
  <row align="center-between">
    <text font-size="14" font-weight="600">Add to list</text>
    <img src="close.svg" w="16" h="16" />
  </row>
  <col gap="8">
    <row gap="8" align="center-left">
      <rect w="16" h="16" radius="3" fill="$color-brand-primary">
        <img src="check.svg" w="10" h="10" />
      </rect>
      <text font-size="13">Favorites</text>
    </row>
    <row gap="8" align="center-left">
      <rect w="16" h="16" radius="3" border="1 $color-border" />
      <text font-size="13">Read later</text>
    </row>
  </col>
  <rect h="32" radius="6" fill="$color-brand-primary" align="center-center">
    <text font-size="13" font-weight="500" color="#fff">Save</text>
  </rect>
</col>
```
