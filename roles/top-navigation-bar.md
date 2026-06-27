---
role: top-navigation-bar
reach: 1
platforms: web, ios, android
---

# Top Navigation Bar

Persistent bar at the top of a screen showing the title and primary actions.

**AKA:** nav-bar, app-bar, header, header-bar

## States

### Mobile (title centered)
```xml
<row role="top-navigation-bar" fill="$color-surface" border="0 0 1 0 $color-border" h="56" p="0 16" align="center-between">
  <img src="chevron-left.svg" w="22" h="22" />
  <text font-size="17" font-weight="600">Settings</text>
  <img src="ellipsis.svg" w="22" h="22" />
</row>
```

### Mobile (title left)
```xml
<row role="top-navigation-bar" fill="$color-surface" border="0 0 1 0 $color-border" h="56" p="0 16" align="center-between">
  <text font-size="20" font-weight="700">Inbox</text>
  <row gap="12" align="center-left">
    <img src="search.svg" w="22" h="22" />
    <img src="edit.svg" w="22" h="22" />
  </row>
</row>
```

### Web (with logo and actions)
```xml
<row role="top-navigation-bar" fill="$color-surface" border="0 0 1 0 $color-border" h="60" p="0 24" align="center-between">
  <row gap="8" align="center-left">
    <rect w="28" h="28" radius="6" fill="$color-brand-primary" />
    <text font-size="16" font-weight="600">AppName</text>
  </row>
  <row gap="8" align="center-left">
    <rect h="36" p="0 16" radius="8" border="1 $color-border">
      <text font-size="14">Sign in</text>
    </rect>
    <rect h="36" p="0 16" radius="8" fill="$color-brand-primary">
      <text font-size="14" font-weight="500" color="#fff">Get started</text>
    </rect>
  </row>
</row>
```
