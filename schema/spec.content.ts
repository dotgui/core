/**
 * Human-authored content layer for the .gui spec.
 *
 * types.ts carries the STRUCTURE (attributes, types, required/optional) and is
 * the canonical source. This file carries the CONTENT that types can't hold:
 * prose descriptions, code examples, categories, "maps to Figma" notes, and
 * FAQs. The generator (scripts/gen-spec.ts) merges the two into spec.json.
 *
 * `source` tells the generator where an entry's attributes come from:
 *   - "interface:Name" → extracted from that interface in types.ts
 *   - "content"        → taken from the inline `attributes` array here
 */

export type SpecKind = 'tag' | 'property' | 'concept'

export interface ContentAttr {
  name: string
  type: string
  required?: boolean
  description: string
}

export interface ContentFaq {
  q: string
  a: string
}

export interface ContentEntry {
  slug: string
  /** XML tag, when this entry is a real element. */
  tag?: string
  /** Display name, e.g. "<frame>" or "Root Canvas". */
  name: string
  /** Optional longer sidebar label, e.g. "<stack> / <row> / <col>". */
  navLabel?: string
  kind: SpecKind
  category: string
  /** One-line label shown next to the name. */
  summary: string
  /** Where attributes come from. */
  source: string
  /** Inline attributes — only for source: "content". */
  attributes?: ContentAttr[]
  /** Prose paragraphs (plain text). */
  description: string[]
  note?: string
  /** Figma layer equivalence, for "maps to Figma" SEO. */
  mapsToFigma?: string
  exampleLabel: string
  example: string
  exampleMode?: 'hl' | 'plain'
  related: string[]
  faq?: ContentFaq[]
  /** row/col share types with stack; hide duplicates from the overview grid. */
  hubHidden?: boolean
}

/**
 * The spec point this content describes: the chapter and the last RFC landed
 * in it (see rfcs/README.md, Format Versions). Written into spec.json.
 */
export const specFormatVersion = '0.3.9'

export const specCategoryOrder = ['Format', 'Metadata', 'Layout', 'Content', 'Geometry', 'Appearance']

export const specContent: ContentEntry[] = [
  // ════════════════ FORMAT ════════════════
  {
    slug: 'package', name: '.gui package', kind: 'concept', category: 'Format', summary: 'file format',
    source: 'content',
    attributes: [
      { name: 'design.guix', type: 'entry', description: 'The UI markup — always this name inside the package.' },
      { name: 'preview.webp', type: 'entry', description: 'Thumbnail for visual verification before opening.' },
      { name: 'assets/', type: 'entry', description: 'Embedded WebP images and SVG vectors.' }
    ],
    description: [
      'A .gui file is a ZIP package. The markup, design tokens, font declarations, binary assets, and a preview thumbnail all live in one self-contained file.',
      'Internally, the markup lives as design.guix — an implementation detail never surfaced to the outside. A program distinguishing a package from a raw markup string uses magic bytes: ZIP starts with PK, markup starts with <.'
    ],
    exampleLabel: 'Package structure', exampleMode: 'plain',
    example: `checkout.gui  (ZIP)
├── design.guix
├── preview.webp
└── assets/
    ├── hero.webp
    └── icon-close.svg`,
    related: ['gui', 'assets', 'fonts'],
    faq: [
      { q: 'Is a .gui file just XML?', a: 'No — a .gui file is a ZIP package whose markup (design.guix) is XML, alongside a preview thumbnail and an assets/ folder. A raw XML string is also valid input; tools tell them apart by magic bytes (ZIP starts with PK, markup with <).' }
    ]
  },
  {
    slug: 'gui', tag: 'gui', name: '<gui>', kind: 'tag', category: 'Format', summary: 'document root',
    source: 'content',
    attributes: [
      { name: 'version', type: 'string', required: true, description: 'Spec version the document is written for: a chapter ("0.3") or a point in it ("0.3.4"). Consumers refuse a version newer than they read. Current: ' + specFormatVersion + '.' },
      { name: 'name', type: 'string', description: 'Screen or layer name from the source design.' },
      { name: 'platform', type: 'string', description: 'The platform the document is designed for. Open string; recommended: ios, android, web, desktop, tv, watch. Absent = unspecified — assume no default. Describes intent; changes nothing about how the document is drawn (RFC-0036).' },
      { name: 'source', type: 'string', description: 'The tool that exported the file. Open string; recommended: figma, penpot, sketch, html. Exporters only — a file written by hand or by an AI omits it (RFC-0036).' },
      { name: 'source-id', type: 'string', description: 'The exported frame\'s handle in the source tool, read against source. Exporters only, and only for an export meant to round-trip. See spec/SOURCES.md (RFC-0046).' }
    ],
    description: [
      'The root element is a document envelope — never rendered. Direct children are metadata blocks or exactly one root layout node. Metadata always precedes the layout root.',
      'platform and source describe the document itself and belong to it alone: in a multi-document package each document, library.guix included, carries its own. There is no <meta> block; files written before 0.3.6 that carry one keep working.'
    ],
    exampleLabel: 'Example',
    example: `<gui version="0.3" name="Checkout" platform="ios">
  <tokens>
    <color name="primary" value="#007AFF" />
  </tokens>
  <fonts>
    <font family="Inter" source="google" weights="400 700" />
  </fonts>
  <col w="390" fill="#F2F2F7" gap="16" p="24">
    <text value="Checkout"
          font-family="Inter" font-size="28"
          font-weight="700" fill="#1C1C1E" />
  </col>
</gui>`,
    related: ['package', 'root-canvas', 'tokens']
  },
  {
    slug: 'root-canvas', name: 'Root Canvas', kind: 'concept', category: 'Format', summary: 'canvas patterns',
    source: 'content',
    attributes: [
      { name: '<col w="390">', type: 'pattern', description: 'Content-driven screen, AI-authored. h absent — hugs children.' },
      { name: '<frame w="390" h="844">', type: 'pattern', description: 'Fixed artboard, Figma export. h required.' }
    ],
    description: [
      'The first layout tag under <gui> defines the canvas. Two patterns cover all cases.'
    ],
    note: 'Default to <col> — it cannot clip content. <frame> children are absolutely positioned. <col> children flow vertically.',
    exampleLabel: 'Both patterns',
    example: `<!-- content-driven: h absent, hugs children -->
<gui version="0.2" name="Feed">
  <col w="390" fill="#fff" gap="0">
    ...
  </col>
</gui>

<!-- fixed artboard: h required, children absolute -->
<gui version="0.2" name="Splash">
  <frame w="390" h="844" fill="#000">
    <img x="0" y="0" src="assets/bg.webp" w="390" h="844" fit="cover" />
    <text x="24" y="720" value="Welcome" font-size="32"
          font-weight="700" fill="#fff" />
  </frame>
</gui>`,
    related: ['gui', 'col', 'frame']
  },

  // ════════════════ METADATA ════════════════
  {
    slug: 'tokens', tag: 'tokens', name: '<tokens>', kind: 'tag', category: 'Metadata', summary: 'design primitives',
    source: 'content',
    attributes: [
      { name: '<color>', type: 'token', description: 'A color: hex, rgba() or oklch(), e.g. #007AFF.' },
      { name: '<number>', type: 'token', description: 'Numeric value, e.g. 12.' },
      { name: '<string>', type: 'token', description: 'String value, e.g. Inter.' }
    ],
    description: [
      'Design system primitives. Referenced anywhere in the tree with $name. Figma Variables resolve to <tokens> entries. Only tokens used in the exported tree are emitted.'
    ],
    exampleLabel: 'Example',
    example: `<tokens>
  <color name="primary"     value="#007AFF" />
  <number name="radius-card" value="12" />
  <string name="font-base"  value="Inter" />
</tokens>

<col fill="$surface" p="$space-md" gap="12">
  <rect fill="$primary" radius="$radius-card" w="fill" h="52" />
</col>`,
    related: ['styles', 'fonts', 'fill-values']
  },
  {
    slug: 'styles', tag: 'styles', name: '<styles>', kind: 'tag', category: 'Metadata', summary: 'text styles',
    source: 'content',
    attributes: [
      { name: 'name', type: 'string', description: 'Style name, e.g. Heading/H1.' },
      { name: 'font-family', type: 'string', description: 'Font family name.' },
      { name: 'font-size', type: 'number', description: 'Size in px.' },
      { name: 'font-weight', type: 'number', description: 'Numeric weight (100–900).' },
      { name: 'line-height', type: 'number | string', description: 'px or percent.' }
    ],
    description: [
      'Named text styles from the design system. Each <text-style> captures a full typography definition. Text nodes reference a style by name — individual font attrs are omitted when a style is applied.',
      'Color and layout attrs are always inlined — they are not part of the text style definition. Only styles used in the exported tree are emitted.'
    ],
    exampleLabel: 'Example',
    example: `<styles>
  <text-style name="Heading/H1"
              font-family="Inter" font-size="32"
              font-weight="700" line-height="40" />
</styles>

<text text-style="Heading/H1" value="Welcome" fill="#1C1C1E" />`,
    related: ['text', 'tokens', 'fonts']
  },
  {
    slug: 'fonts', tag: 'fonts', name: '<fonts>', kind: 'tag', category: 'Metadata', summary: 'font declarations',
    source: 'content',
    attributes: [
      { name: 'family', type: 'string', description: 'Font family name.' },
      { name: 'source', type: 'google | system | unresolved', description: 'Where the font is resolved from.' },
      { name: 'category', type: 'string', description: 'e.g. sans-serif, serif, monospace.' },
      { name: 'weights', type: 'string', description: 'Space-separated numeric weights, e.g. 400 600 700.' },
      { name: 'styles', type: 'string', description: 'normal italic.' }
    ],
    description: [
      'Font declarations for the renderer to load Google Fonts or fall back gracefully. Text nodes still carry their own font-family and font-weight — the fonts block makes those families resolvable.'
    ],
    exampleLabel: 'Example',
    example: `<fonts>
  <font family="Inter" source="google"
        category="sans-serif"
        weights="400 500 600 700" styles="normal italic" />
</fonts>`,
    related: ['text', 'styles', 'tokens']
  },
  {
    slug: 'assets', name: 'Assets', kind: 'concept', category: 'Metadata', summary: 'images & vectors',
    source: 'content',
    attributes: [
      { name: 'assets/img.webp', type: 'pattern', description: 'Embedded raster (default for all exports).' },
      { name: 'assets/icon.svg', type: 'pattern', description: 'Embedded vector artwork.' },
      { name: 'https://…', type: 'pattern', description: 'External URL — fallback only.' }
    ],
    description: [
      'Images and vector artwork are embedded in assets/ and referenced inline via src — no declaration block, no $id indirection.',
      'All raster images are converted to WebP at 0.85 quality by the Figma plugin. External URLs are a fallback only. If a URL reference fails to load, the renderer shows an asset not loaded error state — no silent failure.'
    ],
    exampleLabel: 'Example',
    example: `<img src="assets/hero.webp" w="390" h="240" fit="cover" />
<img src="assets/icon-close.svg" w="24" h="24" />
<img src="https://example.com/photo.jpg" w="390" h="240" fit="cover" />`,
    related: ['img', 'package', 'gui']
  },
  {
    slug: 'components', tag: 'components', name: '<components>', kind: 'tag', category: 'Metadata', summary: 'component system',
    source: 'content',
    attributes: [],
    description: [
      'A <components> block above the layout root holds every component definition. An <instance> places one by id and passes prop values as flat attributes.',
      '<component id> defines one reusable component: an optional <props> block, then one layout body. <component-set id> groups <variant id> members; an instance references a variant by its own id.',
      'A component may declare slots — layout containers carrying slot="name" — that an instance fills with content (RFC-0044).',
      'In a multi-document package, components declared in library.guix are shared with every document (RFC-0042).'
    ],
    exampleLabel: 'Component + instance',
    example: `<components>
  <component name="Card/Product" id="comp-card">
    <props>
      <prop name="title" type="string" target="title" />
      <prop name="accent" type="color" target="badge" />
    </props>
    <col w="320" radius="12" fill="#fff" p="16" gap="8">
      <text id="title" value="Product Name" font-size="16" font-weight="600" />
      <rect id="badge" w="24" h="4" fill="#0A84FF" />
      <col slot="details" gap="4" />
    </col>
  </component>
</components>

<instance component="comp-card" title="Nike Air Max 90" accent="#FF3B30" />`,
    related: ['prop', 'instance', 'slot']
  },
  {
    slug: 'prop', tag: 'prop', name: '<prop>', kind: 'tag', category: 'Metadata', summary: 'typed component prop',
    source: 'content',
    attributes: [
      { name: 'name', type: 'string', required: true, description: 'The attribute an instance passes the value as.' },
      { name: 'type', type: 'string | boolean | number | color | image | component | style', required: true, description: 'A data type (RFC-0034).' },
      { name: 'target', type: 'string', description: 'Layer id(s) the value applies to, space-separated. Each is an id in the body, or a path through instances in it — tab-1/label sets label inside the instance tab-1 (RFC-0046). Optional for a string prop whose name is the id of exactly one <text> in the body.' },
      { name: 'bind', type: 'string', description: 'The attribute overridden on the target. Required for number and style. Defaults: string → value, boolean → visible, color → fill (or stroke), image → src, component → component.' }
    ],
    description: [
      'A <prop> inside a component\'s <props> block declares one value an instance may pass. Prop types are data types — string, boolean, number, color, image, component, style — and bind names which attribute of the target changes.',
      'number and style always need bind, because each could mean several attributes. A list in target applies one value to several layers at once.',
      'A path reaches a node inside a nested instance, so a component can expose it as an ordinary prop: every segment but the last names an <instance> by id, and the next segment is read in that instance\'s component body.'
    ],
    exampleLabel: 'Typed props',
    example: `<props>
  <prop name="label"       type="string"  target="label" />
  <prop name="disabled"    type="boolean" target="button" />
  <prop name="bg"          type="color"   target="surface" />
  <prop name="radius"      type="number"  target="surface" bind="radius" />
  <prop name="label-style" type="style"   target="label"   bind="text-style" />
  <prop name="accent"      type="color"   target="icon label indicator" />
</props>`,
    related: ['components', 'instance']
  },
  {
    slug: 'instance', tag: 'instance', name: '<instance>', kind: 'tag', category: 'Content', summary: 'component placement',
    source: 'interface:InstanceNode',
    mapsToFigma: 'Instance',
    description: [
      'Places a component by id. Prop values and overrides are flat attributes, whatever their type; tokens and assets use the usual $name form.',
      'Its only children are <slot> fills. Setting w or h scales the component body to fit.'
    ],
    exampleLabel: 'Instance with props and a slot',
    example: `<instance component="comp-screen" title="Audio Settings">
  <slot name="body">
    <instance component="comp-toggle" label="Lossless" />
    <instance component="comp-toggle" label="Spatial" />
  </slot>
</instance>`,
    related: ['components', 'prop', 'slot']
  },
  {
    slug: 'slot', tag: 'slot', name: '<slot>', kind: 'tag', category: 'Content', summary: 'content for a component slot',
    source: 'content',
    attributes: [
      { name: 'name', type: 'string', required: true, description: 'The slot this fills. The component must declare it; each slot is filled once.' }
    ],
    description: [
      'A component declares a slot by putting slot="name" on one of its layout containers; that container\'s layout applies to whatever is inserted, and its own children are the fallback. slot-accept limits it to instances of listed components or component sets; slot-min and slot-max advise a count.',
      'An instance fills a slot with a <slot name> child. <slot> is valid only directly inside an <instance>, and its content cannot read the component\'s props. An unfilled slot keeps its fallback; one left empty renders nothing — no box, padding, or gap.'
    ],
    exampleLabel: 'Declare and fill',
    example: `<!-- in the component -->
<row slot="tabs" slot-accept="compset-tab-item" slot-max="5" w="fill" gap="8" />

<!-- in the instance -->
<slot name="tabs">
  <instance component="tab-library" />
  <instance component="tab-settings" />
</slot>`,
    related: ['components', 'instance']
  },

  // ════════════════ LAYOUT ════════════════
  {
    slug: 'frame', tag: 'frame', name: '<frame>', kind: 'tag', category: 'Layout', summary: 'fixed container',
    source: 'interface:FrameNode',
    mapsToFigma: 'Frame (auto-layout off)',
    description: [
      'Fixed container. Children are absolutely positioned with x and y attributes. Maps to a Figma frame without auto-layout.',
      'w and h are required. clip (boolean presence) clips content to bounds.'
    ],
    exampleLabel: 'Example',
    example: `<frame w="390" h="844" fill="#FFFFFF" clip>
  <img x="0" y="0" src="assets/bg.webp" w="390" h="240" fit="cover" />
  <text x="24" y="260" value="Good morning"
        font-size="28" font-weight="700" fill="#1C1C1E" />
</frame>`,
    related: ['col', 'group', 'rect'],
    faq: [
      { q: "What's the difference between frame and col?", a: 'A frame positions its children absolutely with x/y and maps to a Figma frame with auto-layout off; a col flows its children vertically with auto-layout. Use frame for fixed artboards, col for content-driven screens.' }
    ]
  },
  {
    slug: 'stack', tag: 'stack', name: '<stack>', navLabel: '<stack> / <row> / <col>', kind: 'tag', category: 'Layout', summary: 'auto-layout',
    source: 'interface:StackNode',
    mapsToFigma: 'Frame (auto-layout on)',
    description: [
      '<row> is horizontal, <col> is vertical. <stack> requires an explicit direction. Children are flow-positioned.',
      'w / h absent = hug content; "fill" = fill parent; number = fixed px. p accepts CSS shorthand (1–4 values). gap="auto" distributes space evenly.'
    ],
    exampleLabel: 'Example',
    example: `<col w="fill" gap="12" p="16" fill="#fff" radius="12">
  <text value="Settings" font-size="17" font-weight="600" fill="#1C1C1E" />
  <line fill="#E5E5EA" />
  <row w="fill" gap="auto" align="middle-left">
    <text value="Notifications" font-size="15" fill="#1C1C1E" />
    <text value="On" font-size="15" fill="#8E8E93" />
  </row>
</col>`,
    related: ['row', 'col', 'grid']
  },
  {
    slug: 'row', tag: 'row', name: '<row>', kind: 'tag', category: 'Layout', summary: 'horizontal auto-layout',
    source: 'interface:RowNode', hubHidden: true,
    mapsToFigma: 'Frame (horizontal auto-layout)',
    description: [
      '<row> is a horizontal auto-layout container — children flow left to right. It is shorthand for <stack direction="horizontal">.',
      'w / h absent = hug content; "fill" = fill parent; number = fixed px. gap="auto" distributes space evenly.'
    ],
    exampleLabel: 'Example',
    example: `<row w="390" h="56" p="0 16" gap="auto" align="middle-left" fill="#fff">
  <text value=".gui" font-size="17" font-weight="600" fill="#1C1C1E" />
  <img src="assets/avatar.webp" w="32" h="32" radius="16" fit="cover" />
</row>`,
    related: ['col', 'stack', 'grid']
  },
  {
    slug: 'col', tag: 'col', name: '<col>', kind: 'tag', category: 'Layout', summary: 'vertical auto-layout',
    source: 'interface:ColNode', hubHidden: true,
    mapsToFigma: 'Frame (vertical auto-layout)',
    description: [
      '<col> is a vertical auto-layout container — children flow top to bottom. It is shorthand for <stack direction="vertical"> and the recommended default screen root.',
      'w / h absent = hug content; "fill" = fill parent; number = fixed px. gap="auto" distributes space evenly.'
    ],
    exampleLabel: 'Example',
    example: `<col w="fill" gap="12" p="16" fill="#fff" radius="12">
  <text value="Title" font-size="17" font-weight="600" fill="#1C1C1E" />
  <text value="Subtitle" font-size="14" fill="#8E8E93" />
</col>`,
    related: ['row', 'stack', 'frame']
  },
  {
    slug: 'grid', tag: 'grid', name: '<grid>', kind: 'tag', category: 'Layout', summary: 'track & unit grid',
    source: 'interface:GridNode',
    description: [
      'Two modes determined by which attrs are present. Track grid (columns/rows): parent declares track sizes, children place themselves. Unit grid: fixed coordinate canvas.',
      'A grid range fills the spanned tracks (no w/h needed). A single value hugs content.'
    ],
    exampleLabel: 'Track grid — dashboard layout',
    example: `<grid columns="200 1fr" rows="56 1fr" gap="0" w="fill" h="fill">
  <row gc="1/-1" gr="1" fill="#fff" p="0 20" align="middle-left">
    <text value="Dashboard" font-size="17" font-weight="600" />
  </row>
  <col gc="1" gr="2" fill="#f7f7f7" p="12" gap="4">...</col>
  <col gc="2" gr="2" p="32" gap="16">...</col>
</grid>`,
    related: ['stack', 'frame', 'col']
  },
  {
    slug: 'group', tag: 'group', name: '<group>', kind: 'tag', category: 'Layout', summary: 'logical grouping',
    source: 'interface:GroupNode',
    mapsToFigma: 'Group',
    description: [
      'No layout behavior. Children are absolutely positioned relative to the group origin. Maps to a Figma group node.',
      'When the first child of a Figma group is a mask node, the mask shape is extracted as an SVG asset and hoisted onto the <group> as mask-src attrs.'
    ],
    exampleLabel: 'Group with mask',
    example: `<group x="0" y="0" w="390" h="200"
       mask-src="assets/mask-1.svg"
       mask-x="0" mask-y="0" mask-width="390" mask-height="200">
  <img x="0" y="0" src="assets/texture.webp" w="390" h="200" fit="cover" />
</group>`,
    related: ['frame', 'img', 'appearance']
  },

  // ════════════════ CONTENT ════════════════
  {
    slug: 'text', tag: 'text', name: '<text>', kind: 'tag', category: 'Content', summary: 'text node',
    source: 'interface:SingleStyleText',
    mapsToFigma: 'Text',
    description: [
      'Single-style text is self-closing with a value attribute. Mixed-style text has <segment> children — each segment overrides font attrs for its run.',
      'text-style references a named style; individual font attrs are omitted when a style is referenced. Variable fonts use font-variation; OpenType features use font-feature.'
    ],
    exampleLabel: 'Single, mixed, decorated',
    example: `<text value="Welcome back"
      font-family="Inter" font-size="22"
      font-weight="700" fill="#1C1C1E" />

<text x="24" y="80" w="300">
  <segment value="Pay " fill="#6E6E73" font-size="16" />
  <segment value="$42.00" fill="#1C1C1E" font-size="16" font-weight="700" />
</text>`,
    related: ['styles', 'fonts', 'fill-values']
  },
  {
    slug: 'img', tag: 'img', name: '<img>', kind: 'tag', category: 'Content', summary: 'image & vector',
    source: 'interface:ImgNode',
    mapsToFigma: 'Rectangle with image fill / vector',
    description: [
      'Handles both raster and vector assets. The renderer detects format from the file extension at render time — the author only writes src, w, and h.',
      'The name attribute carries the Figma layer name. fit controls image scaling within the bounding box.'
    ],
    exampleLabel: 'Example',
    example: `<img name="Hero Image" src="assets/hero.webp" w="390" h="240" fit="cover" />
<img src="assets/avatar.webp" w="48" h="48" radius="24" fit="cover" />
<img src="assets/icon-check.svg" w="20" h="20" />`,
    related: ['assets', 'rect', 'frame']
  },

  // ════════════════ GEOMETRY ════════════════
  {
    slug: 'rect', tag: 'rect', name: '<rect>', kind: 'tag', category: 'Geometry', summary: 'rectangle',
    source: 'interface:RectNode',
    mapsToFigma: 'Rectangle',
    description: [
      'Sugar for a childless <frame>. Signals decorative intent — no layout children. w and h are required.',
      'Supports all visual attributes: fill, border, radius, opacity, blend, rotation, appearance. Does not accept layout attributes.',
      'Border shorthand: "[width] [color] [style] [align]". Defaults: 1px solid center.'
    ],
    exampleLabel: 'Example',
    example: `<rect fill="$primary" w="342" h="52" radius="12" />
<rect fill="$surface" w="320" h="80" radius="12" border="1 #E5E5EA" />
<rect fill="linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)" w="fill" h="160" radius="16" />`,
    related: ['ellipse', 'line', 'frame']
  },
  {
    slug: 'ellipse', tag: 'ellipse', name: '<ellipse>', kind: 'tag', category: 'Geometry', summary: 'oval & circle',
    source: 'interface:EllipseNode',
    mapsToFigma: 'Ellipse',
    description: [
      'Sugar for <frame radius="9999">. Full-radius rendering is the contract — radius is not an attribute on <ellipse>. Equal dimensions produce a circle.',
      'Arc and donut shapes (progress rings, pie segments) are SVG assets referenced via <img>.'
    ],
    exampleLabel: 'Example',
    example: `<ellipse fill="#FF3B30" w="8" h="8" />
<ellipse fill="#E5E5EA" w="48" h="48" />
<ellipse fill="none" border="2 $primary" w="48" h="48" />`,
    related: ['rect', 'line', 'img']
  },
  {
    slug: 'line', tag: 'line', name: '<line>', kind: 'tag', category: 'Geometry', summary: 'separator',
    source: 'interface:LineNode',
    mapsToFigma: 'Line',
    description: [
      'Sugar for a thin frame used as a visual divider. Default: horizontal, thickness="1", w="fill".'
    ],
    exampleLabel: 'Example',
    example: `<line fill="#E5E5EA" />
<line fill="#007AFF" thickness="2" />
<line fill="#E5E5EA" direction="vertical" />`,
    related: ['rect', 'ellipse', 'stack']
  },

  // ════════════════ APPEARANCE ════════════════
  {
    slug: 'appearance', tag: 'appearance', name: '<appearance>', kind: 'tag', category: 'Appearance', summary: 'paint & effects stack',
    source: 'content',
    attributes: [
      { name: '<fill>', type: 'child', description: 'color, linear-gradient, radial-gradient, angular-gradient, image.' },
      { name: '<border>', type: 'child', description: 'color, w, align (inside/center/outside), style, dash, cap, join.' },
      { name: '<effect>', type: 'child', description: 'drop-shadow, inner-shadow, layer-blur, background-blur, glass.' }
    ],
    description: [
      "A non-layout child that describes the parent's complete paint and effect stack. Used when a node has multiple fills, complex borders, or multiple effects.",
      'All three stacks — fills, borders, effects — are ordered in document order. When <appearance> contains at least one <border>, the border shorthand on the parent is ignored.'
    ],
    exampleLabel: 'Multi-fill + shadow',
    example: `<frame w="320" h="180" radius="16">
  <appearance>
    <fill type="image" src="assets/hero.webp" fit="cover" />
    <fill type="linear-gradient" value="linear-gradient(180deg, #00000000 0%, #000000CC 100%)" />
    <effect type="drop-shadow" x="0" y="8" radius="24" color="#00000033" />
  </appearance>
</frame>`,
    related: ['fill-values', 'shared-attrs', 'frame']
  },
  {
    slug: 'fill-values', name: 'Fill Values', kind: 'property', category: 'Appearance', summary: 'fill attribute formats',
    source: 'content',
    attributes: [
      { name: 'Hex opaque', type: 'format', description: '#1C1C1E.' },
      { name: 'Hex + alpha', type: 'format', description: '#1C1C1ECC (last byte = alpha).' },
      { name: 'rgba', type: 'format', description: 'rgba(28, 28, 30, 0.8) — integers 0–255, alpha 0–1. The readable form for any color with opacity (RFC-0033).' },
      { name: 'oklch', type: 'format', description: 'oklch(0.627 0.258 29.23) or oklch(0.6 0.2 250 / 0.5) — wide-gamut, stored as written (RFC-0033).' },
      { name: 'Linear gradient', type: 'format', description: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%).' },
      { name: 'Radial gradient', type: 'format', description: 'radial-gradient(circle at 50% 30%, #FFFFFF 0%, #000000 100%).' },
      { name: 'Angular gradient', type: 'format', description: 'conic-gradient(from 0deg at 50% 50%, #FF0000 0deg, #0000FF 360deg).' },
      { name: 'Token', type: 'format', description: '$primary.' }
    ],
    description: [
      'The fill attribute accepts a color — hex, rgba() or oklch() — a gradient function, or a token reference. The same three color notations work everywhere a color goes: strokes, borders, shadows, gradient stops, tokens and fill styles. rgb() is tolerated for existing exports but is not part of the format; write hex.',
      'Dimensions are bare numbers in pixels. Sizes (w, h, min-width, max-width, min-height, max-height) may also be a share of the parent: w="50%". There is no px suffix, rem, vw/vh or calc() (RFC-0033).',
      'Gradient syntax mirrors CSS — linear-gradient(), radial-gradient(), conic-gradient(). Token references use $name syntax.'
    ],
    exampleLabel: 'Fill values in use',
    example: `<rect fill="#1C1C1ECC" w="100" h="100" />
<rect fill="linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)" w="fill" h="160" />
<rect fill="$primary" w="fill" h="52" radius="12" />`,
    related: ['tokens', 'appearance', 'rect']
  },
  {
    slug: 'shared-attrs', name: 'Shared Attrs', kind: 'property', category: 'Appearance', summary: 'all nodes',
    source: 'interface:VisualAttrs',
    description: [
      'Visual attributes available on all layout, content, and geometry nodes.',
      'id names a node so something can point at it: a prop target, a path segment through an instance (target="tab-1/label"). Lowercase kebab-case, written only where something points, unique within its scope — the screen tree of a document, or one component or variant body. A reference that does not resolve is an error (RFC-0046).',
      'source-id is the source tool\'s own handle for a node, read against source on the <gui> root. It is optional, written by exporters only when the user asks for an export that can go back, and opaque: the format never parses it. A document with any source-id must declare source. What each tool writes is in spec/SOURCES.md (RFC-0046).',
      'detached-from names the component a layout container was detached from, when an exporter could not keep a heavily-overridden instance as an <instance>. It holds a component or variant id declared in the document or its library, and must resolve; it changes nothing on screen. Only <instance> carries component (RFC-0035).',
      'Boolean presence convention: bare attributes without a value are treated as true. <frame clip> = <frame clip="true">. Applies to: clip, mask, wrap, abs, truncate, reverse-z.'
    ],
    exampleLabel: 'Shared attrs in use',
    example: `<img src="assets/overlay.webp" w="390" h="240" opacity="0.6" blend="multiply" />
<rect fill="#FF3B30" w="40" h="40" radius="4" rotation="45" />
<rect fill="$primary" w="fill" h="52" constraint-v="bottom" />`,
    related: ['appearance', 'fill-values', 'frame']
  }
]
