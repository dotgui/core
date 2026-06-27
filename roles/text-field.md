---
role: text-field
reach: full
platforms: web, ios, android
---

# Text Field

Single-line input for entering short text values.

**AKA:** input-field, text-input, form-field

## States

### Default
```xml
<col role="text-field" gap="4">
  <text font-size="13" font-weight="500" color="$color-text-secondary">Email</text>
  <row fill="$color-surface" border="1 $color-border" radius="8" h="40" p="0 12">
    <text font-size="15" color="$color-text-tertiary">you@example.com</text>
  </row>
</col>
```

### Focused
```xml
<col role="text-field" gap="4">
  <text font-size="13" font-weight="500" color="$color-text-secondary">Email</text>
  <row fill="$color-surface" border="1 $color-brand-primary" radius="8" h="40" p="0 12">
    <text font-size="15">jinson@barrel.com</text>
  </row>
</col>
```

### Error
```xml
<col role="text-field" gap="4">
  <text font-size="13" font-weight="500" color="$color-text-secondary">Email</text>
  <row fill="$color-surface" border="1 $color-danger" radius="8" h="40" p="0 12">
    <text font-size="15">notavalid</text>
  </row>
  <row gap="4" align="center-left">
    <img src="error.svg" w="14" h="14" />
    <text font-size="12" color="$color-danger">Please enter a valid email address</text>
  </row>
</col>
```

### With leading icon
```xml
<col role="text-field" gap="4">
  <text font-size="13" font-weight="500" color="$color-text-secondary">Username</text>
  <row fill="$color-surface" border="1 $color-border" radius="8" h="40" p="0 12" gap="8" align="center-left">
    <img src="at.svg" w="16" h="16" />
    <text font-size="15" color="$color-text-tertiary">username</text>
  </row>
</col>
```

### Password
```xml
<col role="text-field" gap="4">
  <text font-size="13" font-weight="500" color="$color-text-secondary">Password</text>
  <row fill="$color-surface" border="1 $color-border" radius="8" h="40" p="0 12" align="center-between">
    <text font-size="15">••••••••</text>
    <img src="eye-off.svg" w="18" h="18" />
  </row>
</col>
```
