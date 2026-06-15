---
role: badge
platforms: web, ios, android
---

# Badge

Small count or status label overlaid on or beside another element.

**AKA:** counter-badge, notification-badge, pip

## States

### Number count
```xml
<rect role="badge" h="18" p="0 6" radius="9" fill="$color-danger">
  <text font-size="12" font-weight="600" color="#fff">3</text>
</rect>
```

### Dot (no count)
```xml
<rect role="badge" w="8" h="8" radius="4" fill="$color-danger" />
```

### Max count
```xml
<rect role="badge" h="18" p="0 6" radius="9" fill="$color-danger">
  <text font-size="12" font-weight="600" color="#fff">99+</text>
</rect>
```

### Status badge (on icon)
```xml
<frame w="24" h="24">
  <img src="bell.svg" w="24" h="24" />
  <rect role="badge" w="8" h="8" radius="4" fill="$color-danger" border="1.5 $color-surface" />
</frame>
```
