---
role: switch
platforms: web, ios, android
---

# Switch

Toggle control that switches a setting between on and off.

**AKA:** toggle, toggle-switch

## States

### Off
```xml
<row role="switch" w="44" h="26" radius="13" fill="$color-surface-raised" align="center-left" p="0 2">
  <rect w="22" h="22" radius="11" fill="#fff" shadow="0 1 4 rgba(0,0,0,0.2)" />
</row>
```

### On
```xml
<row role="switch" w="44" h="26" radius="13" fill="$color-brand-primary" align="center-right" p="0 2">
  <rect w="22" h="22" radius="11" fill="#fff" shadow="0 1 4 rgba(0,0,0,0.2)" />
</row>
```

### With label
```xml
<row role="switch" align="center-between" w="100%">
  <col gap="2">
    <text font-size="15" font-weight="500">Push notifications</text>
    <text font-size="13" color="$color-text-secondary">Receive alerts when you're away</text>
  </col>
  <row w="44" h="26" radius="13" fill="$color-brand-primary" align="center-right" p="0 2">
    <rect w="22" h="22" radius="11" fill="#fff" shadow="0 1 4 rgba(0,0,0,0.2)" />
  </row>
</row>
```
