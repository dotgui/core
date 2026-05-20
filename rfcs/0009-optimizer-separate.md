---
rfc: 0009
title: Optimizer separate from extractor
status: Implemented
introduced-in: 0.1
date: 2026-05-20
---

# Optimizer Separate from Extractor

## Context

The raw output of the Figma plugin is verbose — absolute positions everywhere, no inferred layout, redundant wrappers, duplicate assets. It needs cleaning. The question was whether to clean it inside the plugin or in a separate tool.

## Decision

The extractor (Figma plugin) and the optimizer are separate tools with separate responsibilities. The extractor produces `raw.gui`. The optimizer produces `optimized.gui`.

## Reasoning

The Figma plugin runs inside the Figma plugin sandbox — strict browser constraints, no filesystem access, limited compute budget. It has one job: faithfully capture the design as structured text, as fast as possible. Optimization work would slow exports and complicate the plugin.

The optimizer runs after extraction, in any environment, on any input — whether from the Figma plugin, a hand-written `.gui` file, or a code generator. The separation makes both tools simpler and makes the pipeline tool-agnostic. Any extractor can produce `raw.gui`. The optimizer does not care where it came from.

The optimizer is also the right place for rules that require full-tree analysis — detecting stack patterns, deduplicating assets, collapsing redundant wrappers. These are hard to do correctly in a single-pass traversal inside the plugin.

## Alternatives Considered

**Optimize inside the plugin** — Rejected. Plugin sandbox constraints, slower exports, harder to test, harder to iterate on rules.

**No optimizer, raw output only** — Rejected. Raw Figma output is too verbose for human reading or AI reasoning. Absolute positions everywhere with no layout semantics would make the format far less useful.

## Drawbacks

- Two-step pipeline adds friction for simple use cases
- Raw output is not directly usable without optimization for most purposes

## Implementation Notes

The optimizer pipeline has 8 passes and 21 rules. Rules are deterministic and rule-based — no AI. Every transformation either provably preserves the visual render or is skipped and logged. The one rule above all: visual impact must be zero.
