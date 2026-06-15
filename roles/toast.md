---
role: toast
platforms: web, ios, android
---

# Toast

Brief notification that appears temporarily, typically at the bottom of the screen.

**AKA:** snackbar, notification-toast, flash-message

## States

### Simple message
```xml
<row role="toast" fill="$color-foreground" radius="12" p="12 20" shadow="0 4 16 rgba(0,0,0,0.2)" align="center-left">
  <text font-size="14" color="#fff">Changes saved successfully</text>
</row>
```

### With action
```xml
<row role="toast" fill="$color-foreground" radius="12" p="12 20" gap="16" shadow="0 4 16 rgba(0,0,0,0.2)" align="center-between">
  <text font-size="14" color="#fff">File deleted</text>
  <text font-size="14" font-weight="600" color="$color-brand-primary">Undo</text>
</row>
```

### With icon (success)
```xml
<row role="toast" fill="$color-foreground" radius="12" p="12 20" gap="10" shadow="0 4 16 rgba(0,0,0,0.2)" align="center-left">
  <img src="check-circle.svg" w="18" h="18" />
  <text font-size="14" color="#fff">Invite sent</text>
</row>
```

### Error
```xml
<row role="toast" fill="$color-danger" radius="12" p="12 20" gap="10" shadow="0 4 16 rgba(0,0,0,0.2)" align="center-between">
  <row gap="10" align="center-left">
    <img src="error.svg" w="18" h="18" />
    <text font-size="14" color="#fff">Something went wrong</text>
  </row>
  <img src="close.svg" w="16" h="16" />
</row>
```
