---
role: toolbar
platforms: web, ios, android
---

# Toolbar

A horizontal row of action controls contextually relevant to selected content or the current view.

**AKA:** app-bar, command-bar, action-bar, formatting-bar

## States

### Text formatting
```xml
<row role="toolbar" fill="$color-surface" border="1 $color-border" radius="10" p="6" gap="2" align="center-left">
  <rect w="32" h="32" radius="6" fill="$color-surface-raised" align="center-center">
    <text font-size="14" font-weight="700">B</text>
  </rect>
  <rect w="32" h="32" radius="6" align="center-center">
    <text font-size="14" font-style="italic">I</text>
  </rect>
  <rect w="32" h="32" radius="6" align="center-center">
    <text font-size="14" text-decoration="underline">U</text>
  </rect>
  <line fill="$color-border" w="1" h="20" />
  <rect w="32" h="32" radius="6" align="center-center">
    <img src="align-left.svg" w="16" h="16" />
  </rect>
  <rect w="32" h="32" radius="6" align="center-center">
    <img src="align-center.svg" w="16" h="16" />
  </rect>
  <rect w="32" h="32" radius="6" align="center-center">
    <img src="link.svg" w="16" h="16" />
  </rect>
</row>
```

### Selection actions
```xml
<row role="toolbar" fill="$color-foreground" radius="10" p="6" gap="2" shadow="0 4 16 rgba(0,0,0,0.2)" align="center-left">
  <row p="6 10" radius="6" gap="6" align="center-left">
    <img src="copy.svg" w="14" h="14" />
    <text font-size="13" color="#fff">Copy</text>
  </row>
  <line fill="rgba(255,255,255,0.2)" w="1" h="16" />
  <row p="6 10" radius="6" gap="6" align="center-left">
    <img src="cut.svg" w="14" h="14" />
    <text font-size="13" color="#fff">Cut</text>
  </row>
  <line fill="rgba(255,255,255,0.2)" w="1" h="16" />
  <row p="6 10" radius="6" gap="6" align="center-left">
    <img src="paste.svg" w="14" h="14" />
    <text font-size="13" color="#fff">Paste</text>
  </row>
</row>
```
