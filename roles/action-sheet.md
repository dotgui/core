---
role: action-sheet
reach: full
platforms: ios, android
---

# Action Sheet

Modal sheet sliding up from the bottom presenting a list of contextual actions.

**AKA:** bottom-sheet, action-menu

## States

### Default
```xml
<col role="action-sheet" fill="$color-surface" radius="16 16 0 0" p="8 0 32">
  <text font-size="13" color="$color-text-secondary" p="8 16">Share photo</text>
  <line fill="$color-border" />
  <text p="16" font-size="17">Copy link</text>
  <line fill="$color-border" />
  <text p="16" font-size="17">Save to files</text>
</col>
```

### With destructive action
```xml
<col role="action-sheet" fill="$color-surface" radius="16 16 0 0" p="8 0 32">
  <text font-size="13" color="$color-text-secondary" p="8 16">Manage photo</text>
  <line fill="$color-border" />
  <text p="16" font-size="17">Save to camera roll</text>
  <line fill="$color-border" />
  <text p="16" font-size="17" color="$color-danger">Delete photo</text>
</col>
```

### With cancel
```xml
<col role="action-sheet" gap="8">
  <col fill="$color-surface" radius="16">
    <text font-size="13" color="$color-text-secondary" p="8 16">Actions</text>
    <line fill="$color-border" />
    <text p="16" font-size="17">Share</text>
    <line fill="$color-border" />
    <text p="16" font-size="17">Duplicate</text>
  </col>
  <rect fill="$color-surface" radius="16" h="56">
    <text font-size="17" font-weight="600">Cancel</text>
  </rect>
</col>
```
