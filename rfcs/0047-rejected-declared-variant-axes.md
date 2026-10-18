---
rfc: 0047
title: "REJECTED: Declared variant axes and component states"
status: Rejected
considered-for: 0.4
date: 2026-10-17
---

# REJECTED: Declared Variant Axes and Component States

## Context

Planning for motion and prototype flow (the RFCs after [RFC-0046](0046-identity-and-source-ids.md)) raised a question: before a flow can switch a toggle from `off` to `on`, or a transition can animate between the two, does the format need to know that `off` and `on` are two *states* of one component?

Today a `<component-set>` groups `<variant>`s, each tagged with key-value attributes, and an `<instance>` points at one variant by id ([RFC-0008](0008-component-instance-system.md), `spec/DOTGUI.md` *Component sets*):

```xml
<component-set name="Toggle" id="compset-toggle">
  <variant id="toggle-off" state="off"> … </variant>
  <variant id="toggle-on"  state="on">  … </variant>
</component-set>

<instance component="toggle-on" />
```

## Proposal

Declare each variant property ("axis") on the set with the `<mode>` tag that [RFC-0037](0037-token-modes-theming.md) uses for document themes, and let an instance pick a variant by axis values instead of by id:

```xml
<component-set name="Toggle" id="compset-toggle">
  <mode name="state" values="off on" default="off" />
  <variant id="toggle-off" state="off"> … </variant>
  <variant id="toggle-on"  state="on">  … </variant>
</component-set>

<instance component="compset-toggle" state="on" />
```

The aim was to make component variants and document modes one concept — "axes are the format's only variables" — so that a flow could only ever set an axis to one of its declared values.

## Reasoning for Rejection

**Everything it declares is already in the file.** The variants carry their property values as attributes. A reader that wants the list of properties scans the variants. A reader that wants "the same button, but `sm`" finds the variant whose attributes match. Both are lookups over what is already written, not information the format is missing. Declaring them again on the set would state the same facts twice ([P12](../PRINCIPLES.md)), with a new way for the declaration and the variants to disagree.

**It is a second way to pick a variant.** Instances already reference a variant by id. Adding a set-plus-values form gives two blessed ways to say the same thing, and one of them would have to be demoted to an alias ([P12](../PRINCIPLES.md)).

**"State" is not a separate concept.** Hover, pressed, and on/off are variants like any other. Figma does not distinguish them, and neither should the format. Calling some variants "states" adds a word without adding meaning ([P13](../PRINCIPLES.md)).

**The one real gap is a default, and that is a clarification.** Nothing says which variant an unqualified reference to the set means. That needs one sentence in the spec, not a new declaration.

**Flow does not need it.** A flow that switches a component can name the target variant directly, or name the property values it wants and let the reader match them against the variants' attributes — the way Figma's "Change to" interaction works. That belongs in the flow RFC.

## What to Do Instead

- **Clarify the default in `spec/DOTGUI.md`:** the first `<variant>` in a `<component-set>` is the set's default.
- **Switch variants from flow** by variant id, or by property values matched against variant attributes. Decided in the flow RFC.
- **Exporters should write every variant of a set,** not only those in use, so that switching never needs a refetch. This is an exporter requirement, not a format change.

## Alternatives Considered

**Declare axes with `<mode>`, pick by axis values** — The proposal. Rejected above.

**Pick by axis values without declaring axes** — Rejected for now. Still a second way to reference a variant. Revisit only if referencing by id proves painful in practice.

**Set axes on instances with `mode-{axis}`, as [RFC-0037](0037-token-modes-theming.md) does for themes** — Moot once the proposal is rejected.
