---
rfc: 0010
title: No AI in the pipeline
status: Implemented
introduced-in: 0.1
date: 2026-05-20
---

# No AI in the Pipeline

## Context

The export pipeline — Figma plugin → optimizer → output — could use AI at various points to produce smarter, more semantic output. The question was whether to include AI steps in the core pipeline.

## Decision

The pipeline is fully deterministic and rule-based. No AI in the extractor. No AI in the optimizer. AI is a consumer of dotgui output, not a producer.

## Reasoning

**Consistency.** A deterministic pipeline always produces the same output for the same input. It can be tested, diffed, and trusted. An AI step introduces variability — output might change between runs, between model versions, or with different prompts.

**Trust.** The optimizer's core guarantee is "visual impact is zero." An AI step cannot make that guarantee. It might silently change what the user sees while claiming to clean up the file.

**Separation of concerns.** The pipeline's job is structural capture and cleanup — not interpretation. Interpretation is the AI agent's job downstream. Mixing them blurs responsibility and makes failures hard to diagnose.

**Format as ground truth.** AI agents consuming `.gui` files need to trust that the file means exactly what it says. If AI was involved in producing the file, the agent can't be sure the output is a faithful representation of the design.

## Alternatives Considered

**AI-assisted layout inference** — Considered. Could catch layout patterns the rule-based optimizer misses. Rejected because it would produce different results on different runs and could not guarantee visual fidelity.

**AI-assisted naming / semantic tagging** — Considered for v2. Deferred — semantic roles should be explicit in the format, not inferred by AI.

## Drawbacks

- The optimizer can only catch layout patterns it has explicit rules for — edge cases may produce suboptimal output
- Some cleanup that AI could do in one pass requires multiple deterministic rules

## Implementation Notes

The optimizer logs every rule that is applied or skipped. Full auditability — every transformation has a reason. This is only possible because the pipeline is deterministic.
