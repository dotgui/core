---
rfc: 0008
title: Component and instance system
status: Implemented
introduced-in: 0.1
date: 2026-05-20
---

# Component and Instance System

## Context

Figma has a component system — reusable UI definitions with variant support and prop overrides. A meaningful export format needs to preserve this structure so consumers (code generators, AI agents) understand reuse rather than seeing a flat list of duplicated nodes.

## Decision

A `<components>` block holds all component definitions. Each `<component>` has an optional `<props>` block declaring overridable surface area. Instances reference a component by id and pass overrides as inline attributes.

```xml
<components>
  <component name="Button/Primary" id="comp-button-primary">
    <props>
      <prop name="label" type="text" target="label" />
    </props>
    <row gap="8" p="12 24" fill="$primary" radius="8">
      <text id="label" value="Label" font-size="16" font-weight="600" color="#fff" />
    </row>
  </component>
</components>

<instance component="comp-button-primary" label="Get Started" />
```

## Reasoning

Preserving component identity tells a code generator this is a reusable unit, not a one-off layout. It tells an AI agent "these ten instances all come from the same component — any code you generate should reflect that."

The props system is explicit about what's overridable. A consumer doesn't need to guess — the `<props>` block is the public API of the component.

Two override approaches exist: **declared props** (designer explicitly set properties in Figma) and **ad-hoc overrides** (detected via Figma's `InstanceNode.overrides`). Both produce the same instance syntax.

## Alternatives Considered

**Flatten all instances** — Rejected. Loses reuse information entirely. Code generators would produce duplicate code. AI agents would miss the pattern.

**Reference by name instead of id** — Rejected. Names are not unique across a design system. IDs are stable and collision-free.

## Drawbacks

- Components must be declared before use — forward references are not supported
- Ad-hoc overrides break if layer names are duplicated within a component

## Implementation Notes

Every node inside a component body gets `id` = sanitized Figma layer name (kebab-case). Duplicates get numeric suffixes. The Figma plugin uses Figma's internal prop reference for declared props — immune to duplicate layer names.
