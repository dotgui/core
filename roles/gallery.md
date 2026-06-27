---
role: gallery
reach: 2
platforms: web, ios, android
---

# Gallery

Grid of images or media thumbnails displayed in a uniform tiled layout.

**AKA:** media-grid, image-grid, photo-grid, mosaic

## States

### Uniform grid
```xml
<col role="gallery" gap="2">
  <row gap="2">
    <img src="photo1.jpg" w="130" h="130" />
    <img src="photo2.jpg" w="130" h="130" />
    <img src="photo3.jpg" w="130" h="130" />
  </row>
  <row gap="2">
    <img src="photo4.jpg" w="130" h="130" />
    <img src="photo5.jpg" w="130" h="130" />
    <img src="photo6.jpg" w="130" h="130" />
  </row>
</col>
```

### Feature + grid
```xml
<col role="gallery" gap="2">
  <img src="photo1.jpg" w="394" h="260" />
  <row gap="2">
    <img src="photo2.jpg" w="130" h="130" />
    <img src="photo3.jpg" w="130" h="130" />
    <frame w="130" h="130">
      <img src="photo4.jpg" w="130" h="130" />
      <rect fill="rgba(0,0,0,0.4)" w="130" h="130" align="center-center">
        <text font-size="20" font-weight="600" color="#fff">+8</text>
      </rect>
    </frame>
  </row>
</col>
```
