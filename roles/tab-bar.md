---
role: tab-bar
platforms: web, ios, android
---

# Tab Bar

Row of tabs for switching between top-level sections of an app.

**AKA:** tabs, bottom-navigation, bottom-tab-bar, tab-strip

## States

### Bottom tab bar (mobile)
```xml
<row role="tab-bar" fill="$color-surface" border="1 0 0 0 $color-border" h="84" p="0 0 20" align="center-between" p-horizontal="8">
  <col gap="4" align="center-center" p="0 16">
    <img src="home-filled.svg" w="24" h="24" />
    <text font-size="10" font-weight="500" color="$color-brand-primary">Home</text>
  </col>
  <col gap="4" align="center-center" p="0 16">
    <img src="search.svg" w="24" h="24" />
    <text font-size="10" color="$color-text-secondary">Explore</text>
  </col>
  <col gap="4" align="center-center" p="0 16">
    <img src="heart.svg" w="24" h="24" />
    <text font-size="10" color="$color-text-secondary">Saved</text>
  </col>
  <col gap="4" align="center-center" p="0 16">
    <img src="user.svg" w="24" h="24" />
    <text font-size="10" color="$color-text-secondary">Profile</text>
  </col>
</row>
```

### Top tab bar (web / Android)
```xml
<col role="tab-bar" gap="0">
  <row border="0 0 1 0 $color-border" gap="0">
    <col p="12 20" gap="0" align="center-center" border="0 0 2 0 $color-brand-primary">
      <text font-size="14" font-weight="600" color="$color-brand-primary">Overview</text>
    </col>
    <col p="12 20" gap="0" align="center-center">
      <text font-size="14" color="$color-text-secondary">Activity</text>
    </col>
    <col p="12 20" gap="0" align="center-center">
      <text font-size="14" color="$color-text-secondary">Settings</text>
    </col>
  </row>
</col>
```
