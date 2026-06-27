---
role: text-area
reach: full
platforms: web, ios, android
---

# Text Area

Multi-line text input for longer freeform content.

**AKA:** multiline-input, multi-line-text-field, textarea

## States

### Default
```xml
<col role="text-area" gap="4">
  <text font-size="13" font-weight="500" color="$color-text-secondary">Message</text>
  <rect fill="$color-surface" border="1 $color-border" radius="8" h="120" p="12">
    <text font-size="15" color="$color-text-tertiary">Write your message…</text>
  </rect>
</col>
```

### Focused with content
```xml
<col role="text-area" gap="4">
  <text font-size="13" font-weight="500" color="$color-text-secondary">Message</text>
  <rect fill="$color-surface" border="1 $color-brand-primary" radius="8" h="120" p="12">
    <text font-size="15">Hey! I wanted to follow up on our earlier conversation about the new design system. Would love to sync this week.</text>
  </rect>
</col>
```

### With character count
```xml
<col role="text-area" gap="4">
  <row align="center-between">
    <text font-size="13" font-weight="500" color="$color-text-secondary">Bio</text>
    <text font-size="12" color="$color-text-tertiary">72 / 160</text>
  </row>
  <rect fill="$color-surface" border="1 $color-border" radius="8" h="100" p="12">
    <text font-size="15">Product designer focused on mobile and design systems. Previously at Stripe, Figma.</text>
  </rect>
</col>
```
