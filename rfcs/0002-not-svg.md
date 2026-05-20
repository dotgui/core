---
rfc: 0002
title: Not SVG
status: Implemented
introduced-in: 0.1
date: 2026-05-20
---

# Not SVG

## Context

SVG is an XML-based format for describing visual content. Since dotgui is also XML-based and describes visual UI, SVG was a natural candidate to evaluate or extend.

## Decision

dotgui is not SVG and does not extend SVG. SVG is used internally only for vector asset embedding (`<svg src="$svg-1" />`).

## Reasoning

SVG is a **drawing format**. It has no concept of layout, no auto-layout, no semantic text nodes, no design tokens, and no structured component hierarchy.

An AI reading SVG sees shapes. An AI reading `.gui` sees structure. A button and a decorative rectangle are indistinguishable in SVG. In dotgui they are fundamentally different nodes with different semantic roles.

SVG also cannot encode the information needed for code generation or layout reasoning — there is no `gap`, no `padding`, no `fill="$primary"`, no `sizing-h="fill"`. Everything is absolute coordinates.

## Alternatives Considered

**Extending SVG with custom namespaces** — Rejected. SVG parsers would ignore the layout extensions. Tooling ecosystem doesn't understand custom namespaces. You'd end up maintaining a fork of SVG that no standard tool can process.

## Drawbacks

None significant. SVG is the right tool for vector assets and dotgui uses it exactly for that — as an embedded asset format, not the document format.

## Implementation Notes

Vector artwork too complex to represent as native shape nodes is exported as SVG assets and referenced via `<svg src="$svg-1" />`. The SVG content lives in the package's `assets/` directory.
