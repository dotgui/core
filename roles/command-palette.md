---
role: command-palette
reach: 1
platforms: web
---

# Command Palette

Full-screen overlay with a search input for quickly finding and triggering commands or navigation.

**AKA:** command-menu, quick-actions, spotlight

## States

### Empty
```xml
<col role="command-palette" fill="$color-surface" radius="12" shadow="0 8 32 rgba(0,0,0,0.2)" w="560">
  <row border="0 0 1 0 $color-border" p="12 16" gap="10" align="center-left">
    <img src="search.svg" w="18" h="18" />
    <text font-size="16" color="$color-text-tertiary">Search commands…</text>
  </row>
  <col p="8">
    <text font-size="12" font-weight="600" color="$color-text-tertiary" p="8 8 4">RECENT</text>
    <row p="8 12" radius="6" gap="10" align="center-left">
      <img src="file.svg" w="16" h="16" />
      <text font-size="14">Dashboard</text>
    </row>
    <row p="8 12" radius="6" gap="10" align="center-left">
      <img src="settings.svg" w="16" h="16" />
      <text font-size="14">Settings</text>
    </row>
  </col>
</col>
```

### With results
```xml
<col role="command-palette" fill="$color-surface" radius="12" shadow="0 8 32 rgba(0,0,0,0.2)" w="560">
  <row border="0 0 1 0 $color-border" p="12 16" gap="10" align="center-left">
    <img src="search.svg" w="18" h="18" />
    <text font-size="16">new proj</text>
  </row>
  <col p="8">
    <row p="8 12" radius="6" fill="$color-brand-subtle" gap="10" align="center-between">
      <row gap="10" align="center-left">
        <img src="plus.svg" w="16" h="16" />
        <text font-size="14" font-weight="500">New project</text>
      </row>
      <rect h="20" p="0 6" radius="4" fill="$color-surface-raised">
        <text font-size="11" color="$color-text-secondary">⌘N</text>
      </rect>
    </row>
    <row p="8 12" radius="6" gap="10" align="center-left">
      <img src="folder.svg" w="16" h="16" />
      <text font-size="14">New folder</text>
    </row>
  </col>
</col>
```
