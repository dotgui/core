---
role: time-picker
reach: full
platforms: web, ios, android
---

# Time Picker

Control for selecting a time value.

**AKA:** time-selector, clock-picker, time-input

## States

### Inline input field
```xml
<col role="time-picker" gap="4">
  <text font-size="13" font-weight="500" color="$color-text-secondary">Time</text>
  <row fill="$color-surface" border="1 $color-border" radius="8" h="40" p="0 12" align="center-between">
    <text font-size="15">2:30 PM</text>
    <img src="clock.svg" w="18" h="18" />
  </row>
</col>
```

### Scroll wheel (mobile)
```xml
<col role="time-picker" fill="$color-surface" radius="12" p="0 0 16" gap="0" w="320">
  <col p="12 20" border="0 0 1 0 $color-border">
    <text font-size="15" font-weight="600">Set time</text>
  </col>
  <row h="180" align="center-center" gap="0">
    <col w="80" h="180" align="center-center" gap="0">
      <text font-size="14" color="$color-text-tertiary" p="0 0 8">1</text>
      <text font-size="14" color="$color-text-tertiary" p="0 0 8">2</text>
      <text font-size="22" font-weight="600">3</text>
      <text font-size="14" color="$color-text-tertiary" p="8 0 0">4</text>
      <text font-size="14" color="$color-text-tertiary" p="8 0 0">5</text>
    </col>
    <text font-size="22" font-weight="300">:</text>
    <col w="80" h="180" align="center-center" gap="0">
      <text font-size="14" color="$color-text-tertiary" p="0 0 8">15</text>
      <text font-size="14" color="$color-text-tertiary" p="0 0 8">20</text>
      <text font-size="22" font-weight="600">25</text>
      <text font-size="14" color="$color-text-tertiary" p="8 0 0">30</text>
      <text font-size="14" color="$color-text-tertiary" p="8 0 0">35</text>
    </col>
    <col w="80" h="180" align="center-center" gap="0">
      <text font-size="14" color="$color-text-tertiary" p="0 0 8">AM</text>
      <text font-size="22" font-weight="600">PM</text>
    </col>
  </row>
</col>
```
