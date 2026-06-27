---
role: color-picker
reach: full
platforms: web, ios, android
---

# Color Picker

Control for selecting a color from a palette or spectrum.

**AKA:** color-selector, color-swatch

## States

### Swatch grid
```xml
<col role="color-picker" gap="12">
  <row gap="8">
    <rect w="32" h="32" radius="16" fill="#FF3B30" />
    <rect w="32" h="32" radius="16" fill="#FF9500" />
    <rect w="32" h="32" radius="16" fill="#FFCC00" />
    <rect w="32" h="32" radius="16" fill="#34C759" />
    <rect w="32" h="32" radius="16" fill="#007AFF" border="2 $color-brand-primary" />
    <rect w="32" h="32" radius="16" fill="#5856D6" />
    <rect w="32" h="32" radius="16" fill="#000000" />
  </row>
  <row gap="8" align="center-left">
    <text font-size="14" color="$color-text-secondary">Selected:</text>
    <rect w="20" h="20" radius="4" fill="#007AFF" />
    <text font-size="14">#007AFF</text>
  </row>
</col>
```

### With selected state
```xml
<col role="color-picker" gap="8">
  <row gap="8">
    <rect w="28" h="28" radius="14" fill="#FF3B30" />
    <rect w="28" h="28" radius="14" fill="#FF9500" />
    <rect w="28" h="28" radius="14" fill="#34C759" />
    <frame w="28" h="28">
      <rect w="28" h="28" radius="14" fill="#007AFF" />
      <img src="check.svg" w="14" h="14" />
    </frame>
    <rect w="28" h="28" radius="14" fill="#5856D6" />
  </row>
</col>
```
