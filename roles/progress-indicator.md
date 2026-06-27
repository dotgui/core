---
role: progress-indicator
reach: full
platforms: web, ios, android
---

# Progress Indicator

Bar or ring showing how much of a process has completed.

**AKA:** progress-bar, progress-ring, determinate-progress

## States

### Linear bar
```xml
<col role="progress-indicator" gap="6">
  <row align="center-between">
    <text font-size="13" color="$color-text-secondary">Uploading…</text>
    <text font-size="13" font-weight="500">64%</text>
  </row>
  <rect w="100%" h="8" radius="4" fill="$color-surface-raised">
    <rect w="64%" h="8" radius="4" fill="$color-brand-primary" />
  </rect>
</col>
```

### Linear bar (no label)
```xml
<rect role="progress-indicator" w="240" h="4" radius="2" fill="$color-surface-raised">
  <rect w="40%" h="4" radius="2" fill="$color-brand-primary" />
</rect>
```

### Step progress
```xml
<row role="progress-indicator" gap="4" align="center-center">
  <rect w="32" h="4" radius="2" fill="$color-brand-primary" />
  <rect w="32" h="4" radius="2" fill="$color-brand-primary" />
  <rect w="32" h="4" radius="2" fill="$color-border" />
  <rect w="32" h="4" radius="2" fill="$color-border" />
</row>
```
