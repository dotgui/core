---
role: tree
reach: 2
platforms: web
---

# Tree

Hierarchical list of expandable and collapsible nodes representing nested content.

**AKA:** tree-view, hierarchy-view, folder-tree

## States

### File tree
```xml
<col role="tree" gap="0">
  <row p="6 8" gap="6" align="center-left">
    <img src="chevron-down.svg" w="14" h="14" />
    <img src="folder-open.svg" w="16" h="16" />
    <text font-size="14">src</text>
  </row>
  <col p="0 0 0 22" gap="0">
    <row p="6 8" gap="6" align="center-left">
      <img src="chevron-down.svg" w="14" h="14" />
      <img src="folder-open.svg" w="16" h="16" />
      <text font-size="14">components</text>
    </row>
    <col p="0 0 0 22" gap="0">
      <row p="6 8" gap="6" align="center-left" fill="$color-brand-subtle" radius="6">
        <rect w="14" h="14" />
        <img src="file.svg" w="16" h="16" />
        <text font-size="14" color="$color-brand-primary">Button.tsx</text>
      </row>
      <row p="6 8" gap="6" align="center-left">
        <rect w="14" h="14" />
        <img src="file.svg" w="16" h="16" />
        <text font-size="14">Card.tsx</text>
      </row>
    </col>
    <row p="6 8" gap="6" align="center-left">
      <img src="chevron-right.svg" w="14" h="14" />
      <img src="folder.svg" w="16" h="16" />
      <text font-size="14" color="$color-text-secondary">utils</text>
    </row>
  </col>
</col>
```

### Collapsed nodes
```xml
<col role="tree" gap="0">
  <row p="6 8" gap="6" align="center-left">
    <img src="chevron-right.svg" w="14" h="14" />
    <img src="folder.svg" w="16" h="16" />
    <text font-size="14">node_modules</text>
  </row>
  <row p="6 8" gap="6" align="center-left">
    <img src="chevron-down.svg" w="14" h="14" />
    <img src="folder-open.svg" w="16" h="16" />
    <text font-size="14">src</text>
  </row>
  <col p="0 0 0 22" gap="0">
    <row p="6 8" gap="6" align="center-left">
      <rect w="14" h="14" />
      <img src="file.svg" w="16" h="16" />
      <text font-size="14">index.ts</text>
    </row>
  </col>
</col>
```
