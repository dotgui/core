---
role: avatar
reach: full
platforms: web, ios, android
---

# Avatar

Circular or rounded image representing a person or entity.

**AKA:** profile-image, user-photo, profile-picture

## States

### With image
```xml
<img role="avatar" src="user.jpg" w="40" h="40" radius="20" />
```

### Initials fallback
```xml
<rect role="avatar" w="40" h="40" radius="20" fill="$color-brand-subtle">
  <text font-size="15" font-weight="600" color="$color-brand-primary">JD</text>
</rect>
```

### With online status badge
```xml
<frame role="avatar" w="40" h="40">
  <img src="user.jpg" w="40" h="40" radius="20" />
  <rect w="10" h="10" radius="5" fill="$color-success" border="2 $color-surface" />
</frame>
```

### Stacked group
```xml
<row role="avatar" gap="-8">
  <img src="user1.jpg" w="32" h="32" radius="16" border="2 $color-surface" />
  <img src="user2.jpg" w="32" h="32" radius="16" border="2 $color-surface" />
  <img src="user3.jpg" w="32" h="32" radius="16" border="2 $color-surface" />
  <rect w="32" h="32" radius="16" fill="$color-surface-raised" border="2 $color-surface">
    <text font-size="11" font-weight="600" color="$color-text-secondary">+4</text>
  </rect>
</row>
```
