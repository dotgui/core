---
role: breadcrumb
reach: full
platforms: web, android
---

# Breadcrumb

Horizontal trail showing the current page's location in the site or app hierarchy.

**AKA:** path-navigation, crumbs, page-path

## States

### Simple
```xml
<row role="breadcrumb" gap="8" align="center-left">
  <text font-size="14" color="$color-text-secondary">Home</text>
  <text font-size="14" color="$color-text-tertiary">/</text>
  <text font-size="14" color="$color-text-secondary">Products</text>
  <text font-size="14" color="$color-text-tertiary">/</text>
  <text font-size="14" color="$color-text-primary" font-weight="500">Running shoes</text>
</row>
```

### With truncation
```xml
<row role="breadcrumb" gap="8" align="center-left">
  <text font-size="14" color="$color-text-secondary">Home</text>
  <text font-size="14" color="$color-text-tertiary">/</text>
  <text font-size="14" color="$color-text-secondary">···</text>
  <text font-size="14" color="$color-text-tertiary">/</text>
  <text font-size="14" color="$color-text-primary" font-weight="500">Running shoes</text>
</row>
```

### With icons
```xml
<row role="breadcrumb" gap="8" align="center-left">
  <img src="home.svg" w="14" h="14" />
  <text font-size="14" color="$color-text-tertiary">/</text>
  <text font-size="14" color="$color-text-secondary">Products</text>
  <text font-size="14" color="$color-text-tertiary">/</text>
  <text font-size="14" color="$color-text-primary" font-weight="500">Running shoes</text>
</row>
```
