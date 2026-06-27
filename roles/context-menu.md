---
role: context-menu
reach: full
platforms: web, ios, android
---

# Context Menu

Floating list of actions anchored to a specific element or tap position.

**AKA:** right-click-menu, overflow-menu, action-menu

## States

### Simple list
```xml
<col role="context-menu" fill="$color-surface" radius="10" shadow="0 4 16 rgba(0,0,0,0.15)" w="200">
  <text p="10 14" font-size="15">Copy</text>
  <line fill="$color-border" />
  <text p="10 14" font-size="15">Paste</text>
  <line fill="$color-border" />
  <text p="10 14" font-size="15">Duplicate</text>
</col>
```

### With icons
```xml
<col role="context-menu" fill="$color-surface" radius="10" shadow="0 4 16 rgba(0,0,0,0.15)" w="200">
  <row p="10 14" gap="10" align="center-left">
    <img src="edit.svg" w="16" h="16" />
    <text font-size="15">Edit</text>
  </row>
  <row p="10 14" gap="10" align="center-left">
    <img src="copy.svg" w="16" h="16" />
    <text font-size="15">Duplicate</text>
  </row>
  <line fill="$color-border" />
  <row p="10 14" gap="10" align="center-left">
    <img src="trash.svg" w="16" h="16" />
    <text font-size="15" color="$color-danger">Delete</text>
  </row>
</col>
```

### With sections
```xml
<col role="context-menu" fill="$color-surface" radius="10" shadow="0 4 16 rgba(0,0,0,0.15)" w="200">
  <row p="10 14" gap="10" align="center-left">
    <img src="copy.svg" w="16" h="16" />
    <text font-size="15">Copy</text>
  </row>
  <row p="10 14" gap="10" align="center-left">
    <img src="share.svg" w="16" h="16" />
    <text font-size="15">Share</text>
  </row>
  <line fill="$color-border" />
  <row p="10 14" gap="10" align="center-left">
    <img src="trash.svg" w="16" h="16" />
    <text font-size="15" color="$color-danger">Delete</text>
  </row>
</col>
```
