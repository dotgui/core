---
role: carousel
platforms: web, ios, android
---

# Carousel

Horizontally scrollable series of cards or images, showing one or a few items at a time.

**AKA:** media-carousel, slider-gallery, slideshow

## States

### Image carousel
```xml
<col role="carousel" gap="12">
  <row gap="12">
    <img src="slide1.jpg" w="320" h="200" radius="12" />
    <img src="slide2.jpg" w="320" h="200" radius="12" />
    <img src="slide3.jpg" w="320" h="200" radius="12" />
  </row>
  <row role="item-indicator" gap="6" align="center-center">
    <rect w="8" h="8" radius="4" fill="$color-brand-primary" />
    <rect w="8" h="8" radius="4" fill="$color-border" />
    <rect w="8" h="8" radius="4" fill="$color-border" />
  </row>
</col>
```

### Card carousel with peek
```xml
<col role="carousel" gap="12">
  <row gap="16" p="0 24">
    <col fill="$color-surface-raised" radius="12" p="16" gap="8" w="260">
      <img src="product1.jpg" w="100%" h="140" radius="8" />
      <text font-size="15" font-weight="600">Product name</text>
      <text font-size="14" color="$color-text-secondary">$49.00</text>
    </col>
    <col fill="$color-surface-raised" radius="12" p="16" gap="8" w="260">
      <img src="product2.jpg" w="100%" h="140" radius="8" />
      <text font-size="15" font-weight="600">Product name</text>
      <text font-size="14" color="$color-text-secondary">$59.00</text>
    </col>
  </row>
</col>
```
