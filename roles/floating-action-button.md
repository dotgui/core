---
role: floating-action-button
platforms: web, ios, android
---

# Floating Action Button

Circular button fixed above content, representing the primary action on a screen.

**AKA:** FAB, primary-action-button

## States

### Standard
```xml
<rect role="floating-action-button" w="56" h="56" radius="28" fill="$color-brand-primary" shadow="0 4 12 rgba(0,0,0,0.2)" align="center-center">
  <img src="plus.svg" w="24" h="24" />
</rect>
```

### Extended (with label)
```xml
<row role="floating-action-button" h="56" p="0 20" radius="28" fill="$color-brand-primary" gap="10" align="center-center" shadow="0 4 12 rgba(0,0,0,0.2)">
  <img src="edit.svg" w="22" h="22" />
  <text font-size="15" font-weight="600" color="#fff">Compose</text>
</row>
```

### Small
```xml
<rect role="floating-action-button" w="40" h="40" radius="20" fill="$color-brand-primary" shadow="0 2 8 rgba(0,0,0,0.2)" align="center-center">
  <img src="plus.svg" w="18" h="18" />
</rect>
```
