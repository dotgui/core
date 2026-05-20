---
rfc: 0018
title: "REJECTED: sz combined sizing shorthand"
status: Rejected
considered-for: 0.2
date: 2026-05-20
---

# REJECTED: sz Combined Sizing Shorthand

## Context

With `w` and `h` as unified sizing (RFC-0011), setting both axes on a node requires two attributes: `w="fill" h="hug"`. The question was whether a combined shorthand was worth adding.

## Proposal

A `sz` attribute encoding both `w` and `h` in a single two-value shorthand:

```xml
sz="fill hug"   →  w="fill" h="hug"
sz="fill"        →  w="fill" h="fill"
sz="320 80"      →  w="320" h="80"
```

## Reasoning for Rejection

`w="fill" h="hug"` is already two short attributes — 7 chars each. A combined `sz` saves at most 3-5 chars while introducing:

- A new attribute name to learn (`sz` is not intuitive without knowing the convention)
- Ambiguity in the single-value form (`sz="fill"` — does it mean both axes or just width?)
- A third way to set sizing alongside `w` / `h`

The concept tax outweighs the token savings. `w` and `h` are already as short as they need to be.

## What to Do Instead

Use `w` and `h` independently:

```xml
<col w="fill" h="hug">
<text w="fill">
```
