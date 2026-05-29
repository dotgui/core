/**
 * dotgui-core — TypeScript type definitions
 * Format version: 0.2
 *
 * These types are the canonical definition of the .gui format.
 * Every tool in the dotgui ecosystem should derive its understanding
 * of the format from here.
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/** A hex color: #RRGGBB or #RRGGBBAA */
export type HexColor = string

/** An rgba color: rgba(r, g, b, a) — preferred for any color with opacity */
export type RgbaColor = string

/**
 * An oklch color: oklch(l c h) or oklch(l c h / a)
 * Wide-gamut — cannot be losslessly converted to sRGB hex.
 * Always stored and rendered as-is.
 */
export type OklchColor = string

/** Any supported color notation: hex, rgba, or oklch */
export type ColorValue = HexColor | RgbaColor | OklchColor

/** A CSS-style gradient string: linear-gradient(...), radial-gradient(...), conic-gradient(...) */
export type GradientValue = string

/** A design token reference: $token-name */
export type TokenRef = string

/** A fill value — color, gradient, or token reference */
export type FillValue = ColorValue | GradientValue | TokenRef

/**
 * A dimension value.
 * - Bare number → treated as px (e.g. 320 → "320px")
 * - 'fill' → 100% of parent
 * - 'hug' → fit-content
 * - '50%' → 50% of parent container
 * - '1.5rem' → relative to root font size
 * - '100vw' / '50vh' → viewport-relative
 * - 'calc(100% - 16px)' → CSS math, passed through verbatim
 */
export type DimensionValue = number | string

/** An asset reference: $asset-id */
export type AssetRef = string

/** Image fit modes for <img> nodes */
export type ImgFitMode = 'cover' | 'contain' | 'fill' | 'none'

/** Image fit modes for <appearance><fill> image fills */
export type AppearanceFitMode = 'cover' | 'contain' | 'crop' | 'tile' | 'fill' | 'none'

/** @deprecated Use ImgFitMode or AppearanceFitMode. Union of all fit values. */
export type FitMode = ImgFitMode | AppearanceFitMode

/** Blend modes */
export type BlendMode =
  | 'normal' | 'multiply' | 'screen' | 'overlay'
  | 'darken' | 'lighten' | 'color-dodge' | 'color-burn'
  | 'hard-light' | 'soft-light' | 'difference' | 'exclusion'
  | 'hue' | 'saturation' | 'color' | 'luminosity'
  | 'linear-burn' | 'linear-dodge'

/** Auto-layout direction */
export type LayoutDirection = 'horizontal' | 'vertical' | 'grid'

/** Horizontal constraint */
export type ConstraintH = 'left' | 'right' | 'center' | 'scale' | 'stretch'

/** Vertical constraint */
export type ConstraintV = 'top' | 'bottom' | 'center' | 'scale' | 'stretch'

/** Font source */
export type FontSource = 'google' | 'system' | 'unresolved'

/** Image asset format */
export type ImageFormat = 'webp' | 'png' | 'jpg' | 'svg'

/** Fill type in an <appearance> block */
export type AppearanceFillType = 'color' | 'linear-gradient' | 'radial-gradient' | 'angular-gradient' | 'image'

/** Effect type */
export type EffectType = 'drop-shadow' | 'inner-shadow' | 'layer-blur' | 'background-blur' | 'glass'

/** Shape types */
export type ShapeType = 'rect' | 'ellipse' | 'line' | 'path'

/** Border align — used in border= shorthand and border-align= longhand */
export type BorderAlign = 'inside' | 'outside' | 'center'

/** Border style */
export type BorderStyle = 'solid' | 'dashed' | 'dotted'

/** @deprecated Use BorderAlign */
export type StrokePosition = BorderAlign

export type FlipValue = 'h' | 'v' | 'both'
export type FillRule = 'nonzero' | 'evenodd'
export type StrokeJoin = 'miter' | 'round' | 'bevel'
export type MaskMode = 'alpha' | 'luminance'
export type MaskComposite = 'add' | 'subtract' | 'intersect' | 'exclude'
export type WritingMode = 'horizontal-tb' | 'vertical-rl' | 'vertical-lr'
export type TextDirection = 'ltr' | 'rtl'
export type FontSmoothing = 'auto' | 'antialiased' | 'subpixel-antialiased' | 'none'
export type TextRendering = 'auto' | 'optimizeSpeed' | 'optimizeLegibility' | 'geometricPrecision'
export type ImageRendering = 'auto' | 'pixelated' | 'crisp-edges'
export type FontOpticalSizing = 'auto' | 'none'
export type OverflowValue = 'hidden' | 'visible' | 'scroll' | 'auto'
export type TextWrap = 'wrap' | 'nowrap' | 'balance' | 'pretty' | 'stable'
export type WhiteSpace = 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line'
export type WordBreak = 'normal' | 'break-all' | 'keep-all' | 'break-word'
export type Overflow = 'clip' | 'ellipsis'
export type FontStretch = 'ultra-condensed' | 'extra-condensed' | 'condensed' | 'semi-condensed' | 'normal' | 'semi-expanded' | 'expanded' | 'extra-expanded' | 'ultra-expanded'

/** Stroke cap style (for line shapes) */
export type StrokeCap = 'round' | 'square' | 'arrow-lines' | 'arrow-equilateral'

/**
 * 9-point alignment — direction-independent, maps to Figma's alignment grid.
 * Describes where items sit visually inside the container.
 *
 *   top-left      top-center      top-right
 *   middle-left   middle-center   middle-right
 *   bottom-left   bottom-center   bottom-right
 *
 * Special values:
 *   stretch   — items stretch to fill the cross axis
 *   baseline  — text baseline alignment (horizontal stacks only)
 */
export type AlignValue =
  | 'top-left'    | 'top-center'    | 'top-right'
  | 'middle-left' | 'middle-center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'stretch'
  | 'baseline'

/**
 * Gap value — controls spacing between items and (when wrapping) between rows.
 *
 * Forms:
 *   "16"       fixed 16px between items
 *   "auto"     space-between on main axis
 *   "16 10"    16px between items, 10px between rows (wrap only)
 *   "16 auto"  16px between items, rows distributed evenly
 *   "auto 10"  items distributed, 10px between rows
 */
export type GapValue = string | number

// ---------------------------------------------------------------------------
// Shared visual attributes (apply to all layout, content, and shape nodes)
// ---------------------------------------------------------------------------

export interface VisualAttrs {
  opacity?: number              // 0–1, omitted when 1
  blend?: BlendMode             // omitted when 'normal' or 'pass-through'
  mask?: boolean                // true = alpha mask for subsequent siblings
  rotation?: number             // degrees, omitted when 0
  'constraint-h'?: ConstraintH  // omitted when 'left'
  'constraint-v'?: ConstraintV  // omitted when 'top'
  /**
   * Unified width. Replaces width + sizing-h.
   * Absent = hug (valid on row/col/stack/text/instance only).
   * "fill" = grow to fill parent.
   * number = fixed px.
   * String forms: '50%' (of parent), '1.5rem', '100vw', 'calc(100% - 16px)'
   * Not valid on frame/img/svg — those require explicit values.
   */
  w?: DimensionValue
  /**
   * Unified height. Replaces height + sizing-v.
   * Absent = hug (valid on row/col/stack/text/instance only).
   * "fill" = grow to fill parent.
   * number = fixed px.
   * String forms: '50%' (of parent), '1.5rem', '100vh', 'calc(100% - 16px)'
   * Not valid on frame/img/svg — those require explicit values.
   */
  h?: DimensionValue
  /** Absolute child inside auto-layout. Presence = true. Replaces layout-position="absolute". */
  abs?: boolean
  'min-width'?: number
  'max-width'?: number
  'min-height'?: number
  'max-height'?: number
  flip?: FlipValue                  // mirror transform — 'h' | 'v' | 'both'
  filter?: string                   // CSS filter string, e.g. "brightness(1.2) contrast(0.9)"
  isolation?: boolean               // true = isolation: isolate (new stacking context for blend modes)
  'transform-origin'?: string       // e.g. "top-left", "center", "0% 0%"
  'scale-x'?: number                // CSS scaleX, e.g. 1.5
  'scale-y'?: number                // CSS scaleY, e.g. 0.8
  'skew-x'?: number                 // degrees
  'skew-y'?: number                 // degrees
  'aspect-ratio'?: string           // e.g. "16/9", "1/1"
  'z-index'?: number                // explicit CSS z-index
  visible?: boolean                 // false = visibility:hidden (preserved in file, skipped in render)
}

// ---------------------------------------------------------------------------
// Token definitions
// ---------------------------------------------------------------------------

export interface ColorToken {
  name: string
  value: ColorValue
}

export interface NumberToken {
  name: string
  value: number
}

export interface StringToken {
  name: string
  value: string
}

export type Token = ColorToken | NumberToken | StringToken

export interface Tokens {
  colors: ColorToken[]
  numbers: NumberToken[]
  strings: StringToken[]
}

// ---------------------------------------------------------------------------
// Style definitions (<styles> block)
// ---------------------------------------------------------------------------

/** Named text style capturing Figma typography definition */
export interface TextStyleDeclaration {
  name: string                          // Figma style name, e.g. "Heading/H1"
  'font-family'?: string
  'font-postscript'?: string            // PostScript name (best-effort)
  'font-style-name'?: string            // Original style name, e.g. "Bold Italic"
  'font-size'?: number                  // px
  'font-weight'?: number                // 100–900
  'font-style'?: 'italic'              // omitted when normal
  'font-variation'?: string             // CSS font-variation-settings value
  'font-feature'?: string               // CSS font-feature-settings value
  'line-height'?: number | string       // px or %, omitted when auto
  'letter-spacing'?: number | string    // px or %, omitted when 0
  decoration?: 'underline' | 'strikethrough'
  'decoration-color'?: string
  'decoration-style'?: 'solid' | 'dashed' | 'dotted' | 'wavy' | 'double'
  'decoration-thickness'?: number
  'text-case'?: 'uppercase' | 'lowercase' | 'capitalize' | 'small-caps'
}

/** Named fill/color style */
export interface FillStyleDeclaration {
  name: string                          // Figma style name, e.g. "Brand/Primary"
  value: ColorValue
}

/** Named effect style, contains one or more effects */
export interface EffectStyleDeclaration {
  name: string                          // Figma style name, e.g. "Elevation/1"
  effects: AppearanceEffect[]
}

export interface Styles {
  textStyles: TextStyleDeclaration[]
  fillStyles: FillStyleDeclaration[]
  effectStyles: EffectStyleDeclaration[]
}

// ---------------------------------------------------------------------------
// Font declarations
// ---------------------------------------------------------------------------

export interface FontDeclaration {
  family: string
  source: FontSource
  category?: string             // e.g. 'sans-serif'
  weights: number[]             // e.g. [400, 600, 700]
  styles: ('normal' | 'italic')[]
  variants?: string[]           // Google font variants for Webfonts API
}

// ---------------------------------------------------------------------------
// Asset declarations
// ---------------------------------------------------------------------------

export interface ImageAsset {
  id: string
  format: ImageFormat
  src: string                   // base64:... or relative path in packaged format
}

export type Asset = ImageAsset

// ---------------------------------------------------------------------------
// Appearance block
// ---------------------------------------------------------------------------

export interface AppearanceFill {
  type: AppearanceFillType
  // for color
  value?: ColorValue
  // for gradients (same syntax as inline fill)
  gradient?: GradientValue
  // for image
  src?: AssetRef
  fit?: AppearanceFitMode
  // crop offsets and dimensions (when fit="crop")
  x?: number
  y?: number
  w?: number
  h?: number
  // fill-level opacity
  opacity?: number
  // paint-level blend mode (omitted when normal)
  blend?: BlendMode
  // optional — emitted only when preserving hidden paints
  visible?: boolean
  // compact transform matrix for exact image/gradient mapping
  transform?: string
  // Image fill position (for cover/contain modes)
  'object-position'?: string        // e.g. "center", "top left", "50% 20%"
  // Image fill color adjustments (Figma imageFilters)
  'filter-exposure'?: number        // -1 to 1
  'filter-contrast'?: number        // -1 to 1
  'filter-saturation'?: number      // -1 to 1
  'filter-temperature'?: number     // -1 to 1
  'filter-tint'?: number            // -1 to 1
  'filter-highlights'?: number      // -1 to 1
  'filter-shadows'?: number         // -1 to 1
}

export interface AppearanceEffect {
  type: EffectType
  // drop-shadow / inner-shadow
  x?: number
  y?: number
  radius?: number
  spread?: number
  color?: ColorValue
  blend?: BlendMode
  // layer-blur / background-blur: radius is reused
  // glass: backdrop blur + saturation boost
  saturation?: number            // percentage, e.g. 180 = 180%
  // rf027: ordered effects stack
  opacity?: number               // effect-level opacity when separate from color alpha
  visible?: boolean              // optional; false = preserve the effect in the file but skip rendering
}

export interface AppearanceStroke {
  color?: ColorValue
  gradient?: GradientValue        // gradient stroke (SVG-based)
  width?: number
  align?: BorderAlign             // inside | outside | center
  style?: BorderStyle             // solid | dashed | dotted
  'dash-array'?: string           // e.g. "8 4" for custom dash pattern
  'dash-offset'?: number
  join?: StrokeJoin               // miter | round | bevel
  'miter-limit'?: number
  opacity?: number
  visible?: boolean
}

export interface Appearance {
  fills: AppearanceFill[]
  effects: AppearanceEffect[]
  strokes?: AppearanceStroke[]
}

// ---------------------------------------------------------------------------
// Content nodes
// ---------------------------------------------------------------------------

export interface TextSegment {
  value: string
  'font-family'?: string
  'font-postscript'?: string        // PostScript name, e.g. "Inter-Bold" (best-effort)
  'font-style-name'?: string        // Original style name, e.g. "Bold Italic"
  'font-size'?: number
  'font-weight'?: number
  'font-style'?: 'normal' | 'italic'
  'font-variation'?: string         // CSS font-variation-settings value, e.g. '"wght" 600'
  'font-feature'?: string           // CSS font-feature-settings value, e.g. 'tnum, ss01'
  fill?: ColorValue | TokenRef
  'line-height'?: number | string
  'letter-spacing'?: number | string
  'baseline-shift'?: number         // Baseline offset in px (positive = up)
  decoration?: 'underline' | 'strikethrough'
  'decoration-color'?: ColorValue   // Color of the text decoration line
  'decoration-style'?: 'solid' | 'dashed' | 'dotted' | 'wavy' | 'double'
  'decoration-thickness'?: number   // Thickness in px
  'text-case'?: 'uppercase' | 'lowercase' | 'capitalize' | 'small-caps'
  'list'?: 'disc' | 'decimal' | 'none'
  'list-level'?: number             // Nesting depth, 0-based
  'list-marker'?: string            // Custom marker string
  href?: string
  'font-stretch'?: FontStretch
}

/** Single-style text: value attr present, no children */
export interface SingleStyleText extends VisualAttrs {
  tag: 'text'
  name?: string
  value: string
  x?: number
  y?: number
  /** w absent = hug text content */
  w?: number | 'fill'
  /** h absent = hug text content */
  h?: number | 'fill'
  'text-style'?: string          // reference to <text-style name="...">
  'fill-style'?: string          // reference to <fill-style name="...">
  'font-family'?: string
  'font-postscript'?: string        // PostScript name, e.g. "Inter-Bold" (best-effort)
  'font-style-name'?: string        // Original style name, e.g. "Bold Italic"
  'font-size'?: number
  'font-weight'?: number
  'font-style'?: 'normal' | 'italic'
  'font-variation'?: string         // CSS font-variation-settings value, e.g. '"wght" 600'
  'font-feature'?: string           // CSS font-feature-settings value, e.g. 'tnum, ss01'
  fill?: ColorValue | TokenRef
  'line-height'?: number | string
  'letter-spacing'?: number | string
  'baseline-shift'?: number         // Baseline offset in px
  'paragraph-spacing'?: number
  'paragraph-indent'?: number
  align?: 'left' | 'center' | 'right' | 'justified'
  'vertical-align'?: 'top' | 'center' | 'bottom'
  decoration?: 'underline' | 'strikethrough'
  'decoration-color'?: ColorValue   // Color of the text decoration line
  'decoration-style'?: 'solid' | 'dashed' | 'dotted' | 'wavy' | 'double'
  'decoration-thickness'?: number   // Thickness in px
  'text-case'?: 'uppercase' | 'lowercase' | 'capitalize' | 'small-caps' | 'small-caps-forced'
  'leading-trim'?: 'cap-height' | 'normal'
  'text-resize'?: 'hug' | 'hug-height' | 'fixed' | 'truncate'
  truncate?: boolean
  'max-lines'?: number
  overflow?: 'clip' | 'ellipsis'
  'list'?: 'disc' | 'decimal' | 'none'
  'list-level'?: number
  'list-marker'?: string
  href?: string
  'font-stretch'?: FontStretch
  direction?: TextDirection
  'writing-mode'?: WritingMode
  'white-space'?: WhiteSpace
  'word-break'?: WordBreak
  'word-spacing'?: number           // px
  'text-underline-offset'?: number  // px
  'text-decoration-skip-ink'?: boolean
  'text-wrap'?: TextWrap
  'font-optical-sizing'?: FontOpticalSizing
  'font-smoothing'?: FontSmoothing
  'text-rendering'?: TextRendering
}

/** Mixed-style text: no value attr, has <segment> children */
export interface MixedStyleText extends VisualAttrs {
  tag: 'text'
  name?: string
  x?: number
  y?: number
  w?: number | 'fill'
  h?: number | 'fill'
  'text-style'?: string
  'fill-style'?: string
  align?: 'left' | 'center' | 'right' | 'justified'
  'vertical-align'?: 'top' | 'center' | 'bottom'
  segments: TextSegment[]
}

export type TextNode = SingleStyleText | MixedStyleText

export interface ImgNode extends VisualAttrs {
  tag: 'img'
  name?: string
  src: AssetRef
  x?: number
  y?: number
  /** Required on img — no content to derive size from */
  w: number | 'fill'
  /** Required on img — no content to derive size from */
  h: number | 'fill'
  fit?: ImgFitMode
  radius?: number | string
  'corner-smoothing'?: number
  border?: string
  'border-color'?: ColorValue | TokenRef
  'border-width'?: number
  'border-style'?: BorderStyle
  'border-align'?: BorderAlign
  'object-position'?: string        // e.g. "center top", "50% 20%"
  'image-rendering'?: ImageRendering
}

export interface SvgNode extends VisualAttrs {
  tag: 'svg'
  name?: string
  /** Asset reference ($svg-1) when the SVG is reused; omitted when the SVG markup is inlined as children */
  src?: AssetRef
  x?: number
  y?: number
  /** Required on svg — no content to derive size from */
  w: number
  /** Required on svg — no content to derive size from */
  h: number
}

// ---------------------------------------------------------------------------
// Shape node
// ---------------------------------------------------------------------------

export interface RectShape extends VisualAttrs {
  tag: 'shape'
  type: 'rect'
  name?: string
  x?: number
  y?: number
  /** Required on shape */
  w: number
  /** Required on shape */
  h: number
  fill?: FillValue
  'fill-style'?: string
  'effect-style'?: string
  radius?: number | string
  'corner-smoothing'?: number
  border?: string
  'border-color'?: ColorValue | TokenRef
  'border-width'?: number
  'border-style'?: BorderStyle
  'border-align'?: BorderAlign
  shadow?: string
  'fill-rule'?: FillRule
}

export interface EllipseShape extends VisualAttrs {
  tag: 'shape'
  type: 'ellipse'
  name?: string
  x?: number
  y?: number
  /** Required on shape */
  w: number
  /** Required on shape */
  h: number
  fill?: FillValue
  'fill-style'?: string
  'effect-style'?: string
  border?: string
  'border-color'?: ColorValue | TokenRef
  'border-width'?: number
  'border-style'?: BorderStyle
  'border-align'?: BorderAlign
  shadow?: string
  'fill-rule'?: FillRule
  // Arc / donut segment
  'arc-start'?: number
  'arc-end'?: number
  'arc-inner'?: number
}

export interface LineShape extends VisualAttrs {
  tag: 'shape'
  type: 'line'
  name?: string
  x?: number
  y?: number
  /** Required on line shape */
  w: number
  stroke?: ColorValue | TokenRef
  'stroke-width'?: number
  'stroke-cap'?: StrokeCap
  join?: StrokeJoin
  'miter-limit'?: number
  'dash-array'?: string
  'dash-offset'?: number
}

export interface PathShape extends VisualAttrs {
  tag: 'shape'
  type: 'path'
  name?: string
  x?: number
  y?: number
  /** Required on shape */
  w: number
  /** Required on shape */
  h: number
  fill?: FillValue
  'fill-style'?: string
  'effect-style'?: string
  stroke?: ColorValue | TokenRef
  'stroke-width'?: number
  'stroke-position'?: StrokePosition
  'fill-rule'?: FillRule
  join?: StrokeJoin
  'miter-limit'?: number
  'dash-array'?: string
  'dash-offset'?: number
  /** SVG path data — emitted as a <path d="..." /> child element */
  d?: string
}

/** @deprecated Use RectNode, EllipseNode, LineNode, or <img> for paths. Kept for backward compat. */
export type ShapeNode = RectShape | EllipseShape | LineShape | PathShape

// ---------------------------------------------------------------------------
// Helper geometry tags — sugar over <frame>, same pattern as row/col/grid
// ---------------------------------------------------------------------------

/** Decorative box — same visual attrs as frame, no layout children */
export interface RectNode extends VisualAttrs {
  tag: 'rect'
  name?: string
  x?: number
  y?: number
  w: number | 'fill'
  h: number | 'fill'
  fill?: FillValue
  'fill-style'?: string
  'effect-style'?: string
  radius?: number | string
  'corner-smoothing'?: number
  border?: string
  'border-color'?: ColorValue | TokenRef
  'border-width'?: number
  'border-style'?: BorderStyle
  'border-align'?: BorderAlign
  shadow?: string
  'fill-rule'?: FillRule
}

/** Oval or circle — radius is always 50%, not exposed as an attribute */
export interface EllipseNode extends VisualAttrs {
  tag: 'ellipse'
  name?: string
  x?: number
  y?: number
  w: number | 'fill'
  h: number | 'fill'
  fill?: FillValue
  'fill-style'?: string
  'effect-style'?: string
  border?: string
  'border-color'?: ColorValue | TokenRef
  'border-width'?: number
  'border-style'?: BorderStyle
  'border-align'?: BorderAlign
  shadow?: string
  'fill-rule'?: FillRule
}

/** Thin visual separator — horizontal by default */
export interface LineNode extends VisualAttrs {
  tag: 'line'
  name?: string
  x?: number
  y?: number
  w?: number | 'fill'
  direction?: 'horizontal' | 'vertical'
  /** Line thickness in px. Default: 1 */
  thickness?: number
  fill?: ColorValue | TokenRef
  'fill-style'?: string
  opacity?: number
}

// ---------------------------------------------------------------------------
// Layout nodes
// ---------------------------------------------------------------------------

/** Horizontal stack — sugar for <stack direction="horizontal"> */
export interface RowNode extends Omit<StackNode, 'tag' | 'direction' | 'grid-columns' | 'grid-rows' | 'grid-col-gap' | 'grid-row-gap'> {
  tag: 'row'
}

/** Vertical stack — sugar for <stack direction="vertical"> */
export interface ColNode extends Omit<StackNode, 'tag' | 'direction' | 'grid-columns' | 'grid-rows' | 'grid-col-gap' | 'grid-row-gap'> {
  tag: 'col'
}

/** Grid stack — sugar for <stack direction="grid"> with short attr names */
export interface GridNode extends Omit<StackNode, 'tag' | 'direction' | 'gap' | 'wrap' | 'align' | 'reverse-z' | 'grid-columns' | 'grid-rows' | 'grid-col-gap' | 'grid-row-gap'> {
  tag: 'grid'
  columns?: number
  rows?: number
  'col-gap'?: number | string
  'row-gap'?: number | string
}

export type GUIChild = FrameNode | StackNode | RowNode | ColNode | GridNode | GroupNode | TextNode | ImgNode | RectNode | EllipseNode | LineNode | SvgNode | ShapeNode

export interface FrameNode extends VisualAttrs {
  tag: 'frame'
  name?: string
  x?: number
  y?: number
  /** Required on frame */
  w: number | 'fill'
  /** Required on frame */
  h: number | 'fill'
  fill?: FillValue
  'fill-style'?: string
  'effect-style'?: string
  radius?: number | string
  'corner-smoothing'?: number
  border?: string
  'border-color'?: ColorValue | TokenRef
  'border-width'?: number
  'border-style'?: BorderStyle
  'border-align'?: BorderAlign
  shadow?: string
  clip?: boolean
  appearance?: Appearance
  'clip-path'?: string              // CSS clip-path value, e.g. "polygon(0 0, 100% 0, 100% 80%, 0 100%)"
  'overflow-x'?: OverflowValue
  'overflow-y'?: OverflowValue
  'border-image'?: string           // CSS border-image shorthand
  outline?: string                  // CSS outline shorthand e.g. "2 #000 solid"
  'outline-offset'?: number
  children: GUIChild[]
}

export interface StackNode extends VisualAttrs {
  tag: 'stack'
  name?: string
  direction: LayoutDirection
  x?: number
  y?: number
  /** Absent = hug children */
  w?: number | 'fill'
  /** Absent = hug children */
  h?: number | 'fill'
  /**
   * Gap between items and (when wrapping) between rows.
   * "16"      fixed 16px
   * "auto"    space-between (bare attribute = auto)
   * "16 10"   16px items, 10px rows
   * "16 auto" 16px items, rows distributed
   */
  gap?: GapValue
  /** Reverse z-order of children. Presence = true. */
  'reverse-z'?: boolean
  /** Enable wrapping. Presence = true. */
  wrap?: boolean
  // grid layout attrs (when direction="grid")
  'grid-columns'?: number
  'grid-rows'?: number
  'grid-col-gap'?: number | string
  'grid-row-gap'?: number | string
  /**
   * Padding shorthand. Single value, "v h", or "top right bottom left".
   * Alias: padding
   */
  p?: string | number
  /** Top padding override */
  pt?: number
  /** Right padding override */
  pr?: number
  /** Bottom padding override */
  pb?: number
  /** Left padding override */
  pl?: number
  /**
   * 9-point alignment — direction-independent.
   * Replaces justify + align.
   * Special values: stretch, baseline.
   * Default: top-left.
   */
  align?: AlignValue
  fill?: FillValue
  'fill-style'?: string
  'effect-style'?: string
  radius?: number | string
  'corner-smoothing'?: number
  border?: string
  'border-color'?: ColorValue | TokenRef
  'border-width'?: number
  'border-style'?: BorderStyle
  'border-align'?: BorderAlign
  shadow?: string
  clip?: boolean
  appearance?: Appearance
  'clip-path'?: string              // CSS clip-path value, e.g. "polygon(0 0, 100% 0, 100% 80%, 0 100%)"
  'overflow-x'?: OverflowValue
  'overflow-y'?: OverflowValue
  'border-image'?: string           // CSS border-image shorthand
  outline?: string                  // CSS outline shorthand e.g. "2 #000 solid"
  'outline-offset'?: number
  children: GUIChild[]
}

export interface GroupNode extends VisualAttrs {
  tag: 'group'
  name?: string
  x?: number
  y?: number
  /** Required on group — no content to derive size from */
  w: number
  /** Required on group — no content to derive size from */
  h: number
  // Mask passthrough — set when the first child is a mask node
  'mask-src'?: AssetRef
  'mask-x'?: number
  'mask-y'?: number
  'mask-width'?: number
  'mask-height'?: number
  'mask-mode'?: MaskMode            // alpha | luminance
  'mask-composite'?: MaskComposite  // add | subtract | intersect | exclude
  children: GUIChild[]
}

// ---------------------------------------------------------------------------
// Root document
// ---------------------------------------------------------------------------

export interface GUIDocument {
  /** Format version */
  version: string
  /** Screen or layer name */
  name?: string
  /** Preview thumbnail */
  preview?: {
    format: 'webp' | 'png'
    src: string
  }
  tokens: Tokens
  styles?: Styles
  fonts: FontDeclaration[]
  assets: Asset[]
  /** The root layout node */
  root: FrameNode | StackNode | GroupNode
}
