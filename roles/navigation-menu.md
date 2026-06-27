---
role: navigation-menu
reach: 2
platforms: web, ios, android
---

# Navigation Menu

A set of links or destinations used to move between sections of an app or site.

**AKA:** nav-menu, site-nav, side-nav, navigation-drawer

## States

### Sidebar (desktop)
```xml
<col role="navigation-menu" fill="$color-surface-raised" w="220" h="100%" p="16" gap="4">
  <row p="10 12" radius="8" fill="$color-brand-subtle" gap="10" align="center-left">
    <img src="home.svg" w="18" h="18" />
    <text font-size="14" font-weight="500" color="$color-brand-primary">Home</text>
  </row>
  <row p="10 12" radius="8" gap="10" align="center-left">
    <img src="projects.svg" w="18" h="18" />
    <text font-size="14">Projects</text>
  </row>
  <row p="10 12" radius="8" gap="10" align="center-left">
    <img src="inbox.svg" w="18" h="18" />
    <text font-size="14">Inbox</text>
  </row>
  <row p="10 12" radius="8" gap="10" align="center-left">
    <img src="settings.svg" w="18" h="18" />
    <text font-size="14">Settings</text>
  </row>
</col>
```

### Horizontal nav (web)
```xml
<row role="navigation-menu" gap="4" align="center-left">
  <text p="8 12" radius="6" fill="$color-brand-subtle" font-size="14" font-weight="500" color="$color-brand-primary">Home</text>
  <text p="8 12" radius="6" font-size="14">Docs</text>
  <text p="8 12" radius="6" font-size="14">Blog</text>
  <text p="8 12" radius="6" font-size="14">Pricing</text>
</row>
```
