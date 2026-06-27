---
role: skeleton
reach: full
platforms: web, ios, android
---

# Skeleton

Placeholder shapes shown while content is loading, matching the rough layout of the expected content.

**AKA:** content-placeholder, loading-skeleton, ghost, shimmer

## States

### Text lines
```xml
<col role="skeleton" gap="10">
  <rect w="180" h="14" radius="4" fill="$color-surface-raised" />
  <rect w="240" h="14" radius="4" fill="$color-surface-raised" />
  <rect w="200" h="14" radius="4" fill="$color-surface-raised" />
</col>
```

### Card skeleton
```xml
<col role="skeleton" fill="$color-surface" radius="12" p="16" gap="12" w="280">
  <rect w="100%" h="140" radius="8" fill="$color-surface-raised" />
  <col gap="8">
    <rect w="160" h="14" radius="4" fill="$color-surface-raised" />
    <rect w="220" h="14" radius="4" fill="$color-surface-raised" />
  </col>
</col>
```

### List item skeleton
```xml
<col role="skeleton" gap="16">
  <row gap="12" align="center-left">
    <rect w="40" h="40" radius="20" fill="$color-surface-raised" />
    <col gap="8">
      <rect w="120" h="12" radius="4" fill="$color-surface-raised" />
      <rect w="180" h="10" radius="4" fill="$color-surface-raised" />
    </col>
  </row>
  <row gap="12" align="center-left">
    <rect w="40" h="40" radius="20" fill="$color-surface-raised" />
    <col gap="8">
      <rect w="140" h="12" radius="4" fill="$color-surface-raised" />
      <rect w="160" h="10" radius="4" fill="$color-surface-raised" />
    </col>
  </row>
</col>
```
