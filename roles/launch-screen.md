---
role: launch-screen
reach: full
platforms: ios, android
---

# Launch Screen

Full-screen view shown while an app is loading, typically displaying a logo or brand mark.

**AKA:** splash-screen, loading-screen, intro-screen

## States

### Logo centered
```xml
<col role="launch-screen" fill="$color-brand-primary" w="390" h="844" align="center-center" gap="12">
  <img src="app-logo.svg" w="80" h="80" />
  <text font-size="22" font-weight="700" color="#fff">AppName</text>
</col>
```

### With tagline
```xml
<col role="launch-screen" fill="#fff" w="390" h="844" align="center-center" gap="16">
  <img src="app-logo.svg" w="100" h="100" />
  <col gap="6" align="center-center">
    <text font-size="24" font-weight="700">AppName</text>
    <text font-size="15" color="$color-text-secondary">Your work, simplified.</text>
  </col>
</col>
```
