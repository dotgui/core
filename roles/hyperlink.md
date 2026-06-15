---
role: hyperlink
platforms: web, ios, android
---

# Hyperlink

Inline text that navigates to another location when activated.

**AKA:** link, anchor, text-link

## States

### Inline
```xml
<text role="hyperlink" font-size="15" color="$color-brand-primary">View all projects</text>
```

### Inline within paragraph
```xml
<text font-size="15">
  By continuing, you agree to our <text role="hyperlink" color="$color-brand-primary">Terms of Service</text> and <text role="hyperlink" color="$color-brand-primary">Privacy Policy</text>.
</text>
```

### With icon
```xml
<row role="hyperlink" gap="4" align="center-left">
  <text font-size="15" color="$color-brand-primary">Learn more</text>
  <img src="arrow-right.svg" w="14" h="14" />
</row>
```
