---
role: loading-indicator
reach: full
platforms: web, ios, android
---

# Loading Indicator

Visual cue that an operation is in progress.

**AKA:** spinner, loader, activity-indicator, progress-spinner

## States

### Spinner
```xml
<img role="loading-indicator" src="spinner.svg" w="24" h="24" />
```

### Full-screen blocking
```xml
<col role="loading-indicator" fill="rgba(0,0,0,0.4)" w="100%" h="100%" align="center-center">
  <col fill="$color-surface" radius="16" p="24" gap="12" align="center-center">
    <img src="spinner.svg" w="32" h="32" />
    <text font-size="14" color="$color-text-secondary">Loading…</text>
  </col>
</col>
```

### Inline with text
```xml
<row role="loading-indicator" gap="8" align="center-left">
  <img src="spinner.svg" w="16" h="16" />
  <text font-size="14" color="$color-text-secondary">Saving changes…</text>
</row>
```

### Button loading state
```xml
<row role="loading-indicator" h="44" p="0 20" radius="10" fill="$color-brand-primary" gap="8" align="center-center">
  <img src="spinner-white.svg" w="18" h="18" />
  <text font-size="15" font-weight="600" color="#fff">Loading…</text>
</row>
```
