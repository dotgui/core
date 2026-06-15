---
role: dialog
platforms: web, ios, android
---

# Dialog

Modal overlay requiring user interaction before returning to the main flow.

**AKA:** modal, popup, confirmation-dialog

## States

### Confirmation
```xml
<col role="dialog" fill="$color-surface" radius="16" p="24" gap="16" w="320" shadow="0 8 32 rgba(0,0,0,0.2)">
  <text font-size="17" font-weight="600">Delete project?</text>
  <text font-size="15" color="$color-text-secondary">This action cannot be undone. All files and members will lose access.</text>
  <row gap="12" align="center-right">
    <rect h="40" p="0 16" radius="8" border="1 $color-border">
      <text font-size="15" font-weight="500">Cancel</text>
    </rect>
    <rect h="40" p="0 16" radius="8" fill="$color-danger">
      <text font-size="15" font-weight="500" color="#fff">Delete</text>
    </rect>
  </row>
</col>
```

### With form
```xml
<col role="dialog" fill="$color-surface" radius="16" p="24" gap="20" w="440" shadow="0 8 32 rgba(0,0,0,0.2)">
  <row align="center-between">
    <text font-size="17" font-weight="600">New workspace</text>
    <img src="close.svg" w="20" h="20" />
  </row>
  <col gap="4">
    <text font-size="13" font-weight="500" color="$color-text-secondary">Name</text>
    <row fill="$color-surface" border="1 $color-border" radius="8" h="40" p="0 12">
      <text font-size="15" color="$color-text-tertiary">Enter workspace name</text>
    </row>
  </col>
  <row gap="12" align="center-right">
    <rect h="40" p="0 16" radius="8" border="1 $color-border">
      <text font-size="15">Cancel</text>
    </rect>
    <rect h="40" p="0 16" radius="8" fill="$color-brand-primary">
      <text font-size="15" font-weight="500" color="#fff">Create</text>
    </rect>
  </row>
</col>
```

### Info dialog (mobile)
```xml
<col role="dialog" fill="$color-surface" radius="14" p="24" gap="8" w="270" align="center-center" shadow="0 8 32 rgba(0,0,0,0.2)">
  <text font-size="17" font-weight="600" align="center">Allow notifications?</text>
  <text font-size="13" color="$color-text-secondary" align="center">We'll send you updates about your orders and account activity.</text>
  <col gap="0" p="16 0 0">
    <line fill="$color-border" />
    <rect h="44" align="center-center">
      <text font-size="17" color="$color-brand-primary" font-weight="600">Allow</text>
    </rect>
    <line fill="$color-border" />
    <rect h="44" align="center-center">
      <text font-size="17" color="$color-brand-primary">Don't Allow</text>
    </rect>
  </col>
</col>
```
