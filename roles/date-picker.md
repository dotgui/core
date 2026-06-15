---
role: date-picker
platforms: web, ios, android
---

# Date Picker

Control for selecting a date, or date range, from a calendar view.

**AKA:** calendar-picker, date-input, date-selector

## States

### Calendar popup
```xml
<col role="date-picker" fill="$color-surface" radius="12" shadow="0 4 16 rgba(0,0,0,0.12)" w="280" p="16">
  <row align="center-between" p="0 0 12">
    <img src="chevron-left.svg" w="20" h="20" />
    <text font-size="15" font-weight="600">June 2026</text>
    <img src="chevron-right.svg" w="20" h="20" />
  </row>
  <row gap="0" align="center-between">
    <text font-size="12" w="36" align="center" color="$color-text-secondary">Su</text>
    <text font-size="12" w="36" align="center" color="$color-text-secondary">Mo</text>
    <text font-size="12" w="36" align="center" color="$color-text-secondary">Tu</text>
    <text font-size="12" w="36" align="center" color="$color-text-secondary">We</text>
    <text font-size="12" w="36" align="center" color="$color-text-secondary">Th</text>
    <text font-size="12" w="36" align="center" color="$color-text-secondary">Fr</text>
    <text font-size="12" w="36" align="center" color="$color-text-secondary">Sa</text>
  </row>
  <row gap="0" align="center-between" p="4 0">
    <text font-size="14" w="36" align="center" color="$color-text-tertiary">1</text>
    <text font-size="14" w="36" align="center" color="$color-text-tertiary">2</text>
    <text font-size="14" w="36" align="center" color="$color-text-tertiary">3</text>
    <rect w="36" h="36" radius="18" fill="$color-brand-primary" align="center-center">
      <text font-size="14" color="#fff">4</text>
    </rect>
    <text font-size="14" w="36" align="center">5</text>
    <text font-size="14" w="36" align="center">6</text>
    <text font-size="14" w="36" align="center">7</text>
  </row>
</col>
```

### Inline field
```xml
<col role="date-picker" gap="4">
  <text font-size="13" font-weight="500" color="$color-text-secondary">Date</text>
  <row fill="$color-surface" border="1 $color-border" radius="8" h="40" p="0 12" align="center-between">
    <text font-size="15">June 12, 2026</text>
    <img src="calendar.svg" w="18" h="18" />
  </row>
</col>
```
