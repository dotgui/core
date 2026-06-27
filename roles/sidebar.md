---
role: sidebar
reach: 2
platforms: web, ios, android
---

# Sidebar

Persistent vertical panel on the side of the screen containing navigation or contextual tools.

**AKA:** navigation-rail, side-navigation, left-nav, side-panel

## States

### Full sidebar (desktop)
```xml
<col role="sidebar" fill="$color-surface-raised" w="240" h="100%" p="16" gap="0">
  <row p="12 8" align="center-between" p="0 0 16">
    <row gap="8" align="center-left">
      <rect w="28" h="28" radius="6" fill="$color-brand-primary" />
      <text font-size="15" font-weight="600">Workspace</text>
    </row>
    <img src="chevron-down.svg" w="16" h="16" />
  </row>
  <col gap="2">
    <row p="8 10" radius="8" fill="$color-brand-subtle" gap="8" align="center-left">
      <img src="home.svg" w="16" h="16" />
      <text font-size="14" font-weight="500" color="$color-brand-primary">Home</text>
    </row>
    <row p="8 10" radius="8" gap="8" align="center-left">
      <img src="inbox.svg" w="16" h="16" />
      <text font-size="14" color="$color-text-secondary">Inbox</text>
    </row>
    <row p="8 10" radius="8" gap="8" align="center-left">
      <img src="projects.svg" w="16" h="16" />
      <text font-size="14" color="$color-text-secondary">Projects</text>
    </row>
  </col>
</col>
```

### Icon rail (compact)
```xml
<col role="sidebar" fill="$color-surface-raised" w="60" h="100%" p="12" gap="8" align="center-left">
  <rect w="36" h="36" radius="8" fill="$color-brand-subtle" align="center-center">
    <img src="home.svg" w="20" h="20" />
  </rect>
  <rect w="36" h="36" radius="8" align="center-center">
    <img src="inbox.svg" w="20" h="20" />
  </rect>
  <rect w="36" h="36" radius="8" align="center-center">
    <img src="projects.svg" w="20" h="20" />
  </rect>
</col>
```
