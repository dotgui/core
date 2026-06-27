---
role: banner
reach: full
platforms: web, ios, android
---

# Banner

Prominent strip promoting content, a sale, or an announcement.

**AKA:** promo-banner, announcement-banner, info-banner

## States

### Text only
```xml
<row role="banner" fill="$color-brand-primary" p="12 24" align="center-between">
  <text font-size="14" font-weight="500" color="#fff">Summer Sale — 50% off everything</text>
  <text font-size="14" font-weight="600" color="#fff">Shop now →</text>
</row>
```

### With image and CTA
```xml
<row role="banner" fill="$color-surface-raised" radius="12" p="20 24" gap="20" align="center-left">
  <img src="promo.jpg" w="80" h="80" radius="8" />
  <col gap="8">
    <text font-size="18" font-weight="700">New arrivals</text>
    <text font-size="14" color="$color-text-secondary">Free shipping on orders over $50</text>
    <rect h="36" p="0 16" radius="8" fill="$color-brand-primary">
      <text font-size="14" font-weight="600" color="#fff">Shop now</text>
    </rect>
  </col>
</row>
```

### Dismissible announcement
```xml
<row role="banner" fill="$color-warning-subtle" border="1 $color-warning" p="12 16" gap="12" align="center-between">
  <row gap="8" align="center-left">
    <img src="megaphone.svg" w="16" h="16" />
    <text font-size="14">Scheduled maintenance on Sunday 2am–4am UTC.</text>
  </row>
  <img src="close.svg" w="16" h="16" />
</row>
```
