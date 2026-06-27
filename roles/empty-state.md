---
role: empty-state
reach: 1
platforms: web, ios, android
---

# Empty State

Placeholder shown when a list or view has no content, guiding the user to an action.

**AKA:** zero-state, blank-state, no-results

## States

### No content
```xml
<col role="empty-state" gap="16" align="center-center" p="48 24">
  <img src="empty-inbox.svg" w="80" h="80" />
  <col gap="6" align="center-center">
    <text font-size="17" font-weight="600" align="center">No messages yet</text>
    <text font-size="15" color="$color-text-secondary" align="center">When you get messages, they'll appear here.</text>
  </col>
</col>
```

### With action
```xml
<col role="empty-state" gap="20" align="center-center" p="48 24">
  <img src="empty-folder.svg" w="80" h="80" />
  <col gap="6" align="center-center">
    <text font-size="17" font-weight="600" align="center">No projects yet</text>
    <text font-size="15" color="$color-text-secondary" align="center">Create your first project to get started.</text>
  </col>
  <rect h="44" p="0 24" radius="10" fill="$color-brand-primary">
    <text font-size="15" font-weight="600" color="#fff">Create project</text>
  </rect>
</col>
```

### Search no results
```xml
<col role="empty-state" gap="12" align="center-center" p="40 24">
  <img src="search-empty.svg" w="60" h="60" />
  <col gap="4" align="center-center">
    <text font-size="16" font-weight="600" align="center">No results for "design"</text>
    <text font-size="14" color="$color-text-secondary" align="center">Try a different search term.</text>
  </col>
</col>
```
