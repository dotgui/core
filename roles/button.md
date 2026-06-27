---
role: button
reach: full
platforms: web, ios, android
---

# Button

Tappable element that triggers an action.

**AKA:** primary-button, secondary-button, cta, action-button

## States

### Primary
```xml
<rect role="button" h="44" p="0 20" radius="8" fill="$color-brand-primary">
  <text font-size="16" font-weight="600" color="#fff">Continue</text>
</rect>
```

### Secondary
```xml
<rect role="button" h="44" p="0 20" radius="8" fill="$color-surface-raised">
  <text font-size="16" font-weight="600" color="$color-text-primary">Cancel</text>
</rect>
```

### Outline
```xml
<rect role="button" h="44" p="0 20" radius="8" border="1.5 $color-brand-primary">
  <text font-size="16" font-weight="600" color="$color-brand-primary">Learn more</text>
</rect>
```

### Destructive
```xml
<rect role="button" h="44" p="0 20" radius="8" fill="$color-danger">
  <text font-size="16" font-weight="600" color="#fff">Delete account</text>
</rect>
```

### Disabled
```xml
<rect role="button" h="44" p="0 20" radius="8" fill="$color-surface-disabled">
  <text font-size="16" font-weight="600" color="$color-text-disabled">Continue</text>
</rect>
```

### Icon only
```xml
<rect role="button" w="44" h="44" radius="8" fill="$color-brand-primary">
  <img src="plus.svg" w="20" h="20" />
</rect>
```

### With leading icon
```xml
<row role="button" h="44" p="0 20" radius="8" fill="$color-brand-primary" gap="8" align="center-center">
  <img src="download.svg" w="18" h="18" />
  <text font-size="16" font-weight="600" color="#fff">Download</text>
</row>
```
