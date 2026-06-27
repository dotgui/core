---
role: dropdown-menu
reach: full
platforms: web, ios, android
---

# Dropdown Menu

Floating list of options anchored to a trigger, for navigation or actions.

**AKA:** menu, pulldown-menu, select-menu

## States

### Simple options
```xml
<col role="dropdown-menu" fill="$color-surface" radius="10" shadow="0 4 16 rgba(0,0,0,0.12)" w="200">
  <text p="10 14" font-size="15">Profile</text>
  <text p="10 14" font-size="15">Settings</text>
  <text p="10 14" font-size="15">Help</text>
  <line fill="$color-border" />
  <text p="10 14" font-size="15" color="$color-danger">Sign out</text>
</col>
```

### With icons and keyboard hints
```xml
<col role="dropdown-menu" fill="$color-surface" radius="10" shadow="0 4 16 rgba(0,0,0,0.12)" w="220" p="4">
  <row p="8 12" radius="6" gap="10" align="center-between">
    <row gap="10" align="center-left">
      <img src="user.svg" w="16" h="16" />
      <text font-size="14">Profile</text>
    </row>
    <text font-size="12" color="$color-text-tertiary">⌘P</text>
  </row>
  <row p="8 12" radius="6" gap="10" align="center-between">
    <row gap="10" align="center-left">
      <img src="settings.svg" w="16" h="16" />
      <text font-size="14">Settings</text>
    </row>
    <text font-size="12" color="$color-text-tertiary">⌘,</text>
  </row>
  <line fill="$color-border" />
  <row p="8 12" radius="6" gap="10" align="center-left">
    <img src="logout.svg" w="16" h="16" />
    <text font-size="14" color="$color-danger">Sign out</text>
  </row>
</col>
```

### With checkmarks (selected state)
```xml
<col role="dropdown-menu" fill="$color-surface" radius="10" shadow="0 4 16 rgba(0,0,0,0.12)" w="200" p="4">
  <row p="8 12" radius="6" gap="10" align="center-left">
    <img src="check.svg" w="16" h="16" />
    <text font-size="14" font-weight="500">Newest first</text>
  </row>
  <row p="8 12" radius="6" gap="10" align="center-left">
    <rect w="16" h="16" />
    <text font-size="14">Oldest first</text>
  </row>
  <row p="8 12" radius="6" gap="10" align="center-left">
    <rect w="16" h="16" />
    <text font-size="14">Alphabetical</text>
  </row>
</col>
```
