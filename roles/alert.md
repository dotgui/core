---
role: alert
reach: full
platforms: web, ios, android
---

# Alert

Inline message communicating a status — informational, success, warning, or error.

**AKA:** warning, error-message, info-message

## States

### Info
```xml
<row role="alert" fill="$color-info-subtle" border="1 $color-info" radius="8" p="12 16" gap="12" align="top-left">
  <img src="info.svg" w="16" h="16" />
  <col gap="2">
    <text font-size="14" font-weight="500">Note</text>
    <text font-size="14" color="$color-text-secondary">Your session will expire in 10 minutes.</text>
  </col>
</row>
```

### Success
```xml
<row role="alert" fill="$color-success-subtle" border="1 $color-success" radius="8" p="12 16" gap="12" align="top-left">
  <img src="check-circle.svg" w="16" h="16" />
  <col gap="2">
    <text font-size="14" font-weight="500">Saved</text>
    <text font-size="14" color="$color-text-secondary">Your changes have been saved.</text>
  </col>
</row>
```

### Warning
```xml
<row role="alert" fill="$color-warning-subtle" border="1 $color-warning" radius="8" p="12 16" gap="12" align="top-left">
  <img src="warning.svg" w="16" h="16" />
  <col gap="2">
    <text font-size="14" font-weight="500">Heads up</text>
    <text font-size="14" color="$color-text-secondary">This action cannot be undone.</text>
  </col>
</row>
```

### Error
```xml
<row role="alert" fill="$color-danger-subtle" border="1 $color-danger" radius="8" p="12 16" gap="12" align="top-left">
  <img src="error.svg" w="16" h="16" />
  <col gap="2">
    <text font-size="14" font-weight="500">Error</text>
    <text font-size="14" color="$color-text-secondary">Failed to save. Please try again.</text>
  </col>
</row>
```
