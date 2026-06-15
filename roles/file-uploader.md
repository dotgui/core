---
role: file-uploader
platforms: web
---

# File Uploader

Area for selecting or dropping files for upload.

**AKA:** dropzone, file-input, drag-and-drop-upload

## States

### Default
```xml
<col role="file-uploader" border="1.5 dashed $color-border" radius="12" p="32" gap="12" align="center-center">
  <img src="upload.svg" w="40" h="40" />
  <col gap="4" align="center-center">
    <text font-size="15" font-weight="500">Drop files here, or <text color="$color-brand-primary">browse</text></text>
    <text font-size="13" color="$color-text-secondary">PNG, JPG, PDF up to 10MB</text>
  </col>
</col>
```

### Drag over
```xml
<col role="file-uploader" border="1.5 dashed $color-brand-primary" radius="12" p="32" gap="12" align="center-center" fill="$color-brand-subtle">
  <img src="upload.svg" w="40" h="40" />
  <text font-size="15" font-weight="500" color="$color-brand-primary">Drop to upload</text>
</col>
```

### With uploaded files
```xml
<col role="file-uploader" gap="12">
  <col border="1.5 dashed $color-border" radius="12" p="24" gap="8" align="center-center">
    <img src="upload.svg" w="32" h="32" />
    <text font-size="14" color="$color-text-secondary">Drop files or <text color="$color-brand-primary">browse</text></text>
  </col>
  <col gap="8">
    <row fill="$color-surface-raised" radius="8" p="12" gap="12" align="center-between">
      <row gap="10" align="center-left">
        <img src="file-pdf.svg" w="20" h="20" />
        <col gap="2">
          <text font-size="14" font-weight="500">document.pdf</text>
          <text font-size="12" color="$color-text-secondary">2.4 MB</text>
        </col>
      </row>
      <img src="close.svg" w="16" h="16" />
    </row>
  </col>
</col>
```
