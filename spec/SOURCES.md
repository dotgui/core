# Source guidelines

What each source tool writes when it exports a `.gui` file meant to round-trip: the `source` it names on `<gui>`, and what it puts in `source-id`.

The format treats `source-id` as opaque ([RFC-0046](../rfcs/0046-identity-and-source-ids.md)). It never parses the value. These guidelines exist so that a tool reading another tool's output knows what it is holding. They are recommendations, like `platform` values. They are not validated, and they change without an RFC. A new tool adds its own section.

## Rules for every source

- **`source-id` is optional.** Write it only when the user asks for an export that can be traced back (refreshed, diffed or synced). An ordinary export writes `source` and no `source-id`.
- **Write it where you will need it.** That can be every node or only some, such as just the components. Leave out any node you could not find again.
- **The value is whatever you need to find that thing again.** Usually that is the layer's own id. For something defined in another file, use a global handle if your tool has one; otherwise leave it out.
- **Write the value bare, with no tool prefix.** `source` on the root already says which tool it belongs to.
- **Be deterministic.** The same design and the same export options produce the same values.
- **Don't record which file the export came from.** No file key, file name, URL or timestamp. The consumer doing the round trip already knows the file.
- **Never write ids for sublayers of an instance.** Instances are references, and their insides are not written out. Address them with paths (`tab-1/label`).

## `figma`

```xml
<gui version="0.3.7" name="Settings" source="figma" source-id="336:1697">
```

| What | `source-id` | Example |
|---|---|---|
| Root (the exported frame) | the frame's node id | `336:1697` |
| Any layer | its node id | `336:1702` |
| Instance | the instance's own node id | `336:1710` |
| Local component or component set (defined in this file) | the main component's node id | `12:4` |
| Variant of a local set | the variant component's node id | `12:5` |
| Component or component set from a library | its published `key` | `a1b2c3d4e5f6…` |
| Layer inside a library component's body | not written | — |
| Sublayer of an instance (`I336:1710;12:4`) | not written | — |

- **Node ids** are only unique within one Figma file. The consumer reads them against the file it is told about.
- **Library components** live in another file, so their node ids would point into the wrong one. The published `key` is global and resolves through `importComponentByKeyAsync`. If the component is unpublished and has no key, leave `source-id` out.
- **`platform`** is written only when the frame is an exact device size. Never guess it.
- **Don't write** `<meta>`, `source-node`, `exported-at`, `debug-id` or `version="1.0"`. Write the spec point the exporter supports.

## `penpot`

| What | `source-id` |
|---|---|
| Root, layers, instances, components | the shape's or component's UUID |

Penpot ids are global UUIDs, so they need no file to be read against, and library components use their UUID too.

## `sketch`

| What | `source-id` |
|---|---|
| Root, layers, instances | `do_objectID` |
| Symbol master | its `symbolID` |

## `html`

| What | `source-id` |
|---|---|
| Root | none |
| An element the page gave an `id` | that `id` |
| Any other element | none |

A capture does not invent identity. A CSS selector or DOM position is a location, not an identity, and it breaks on the next capture.

## Code generators and other sources with no layer ids

Write `source` and no `source-id`. That says which tool the file came from, without claiming any node can be traced back to it.
