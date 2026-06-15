/**
 * dotgui-core — Validator
 * Format version: 1.0
 *
 * Validates a .guix markup string against the dotgui-core v1.0 spec.
 * Goes beyond structural checks — resolves token refs, asset refs,
 * and enforces contextual constraints that XSD cannot express.
 */

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface ValidationError {
  code: string
  message: string
  /** XPath-style path to the offending node, e.g. "gui > stack[0] > text[2]" */
  path: string
}

export interface ValidationResult {
  valid: boolean
  version: string | null
  errors: ValidationError[]
  warnings: ValidationError[]
}

// ---------------------------------------------------------------------------
// Minimal element representation (mirrors GUIElement in gui-optimizer)
// ---------------------------------------------------------------------------

interface El {
  tag: string
  attrs: Record<string, string>
  children: El[]
}

// ---------------------------------------------------------------------------
// Tiny XML parser (structural only — no validation yet)
// ---------------------------------------------------------------------------

function parse(xml: string): El {
  let pos = 0

  function skipWS() {
    while (pos < xml.length && /\s/.test(xml[pos])) pos++
  }

  function parseEl(): El {
    skipWS()
    if (xml[pos] !== '<') throw new SyntaxError(`Expected '<' at position ${pos}`)
    pos++ // consume <
    skipWS()

    // Tag name
    let tag = ''
    while (pos < xml.length && !/[\s/>]/.test(xml[pos])) {
      tag += xml[pos++]
    }

    const attrs: Record<string, string> = {}

    // Attributes
    while (pos < xml.length) {
      skipWS()
      if (xml[pos] === '/' || xml[pos] === '>') break

      let key = ''
      while (pos < xml.length && !/[\s=/>]/.test(xml[pos])) key += xml[pos++]
      skipWS()
      if (xml[pos] === '=') {
        pos++ // consume =
        skipWS()
        const quote = xml[pos++]
        const start = pos
        while (pos < xml.length && xml[pos] !== quote) pos++
        attrs[key] = xml.slice(start, pos)
        pos++ // consume closing quote
      }
    }

    // Self-closing
    if (xml[pos] === '/') {
      pos += 2 // consume />
      return { tag, attrs, children: [] }
    }

    pos++ // consume >

    const children: El[] = []

    // Children
    while (pos < xml.length) {
      skipWS()
      if (xml.startsWith('</', pos)) {
        // Closing tag
        while (pos < xml.length && xml[pos] !== '>') pos++
        pos++
        break
      }
      if (xml[pos] === '<' && xml[pos + 1] !== '!') {
        children.push(parseEl())
      } else if (xml.startsWith('<!--', pos)) {
        // Comment — skip to its terminator. Must advance pos or we loop forever.
        const end = xml.indexOf('-->', pos)
        pos = end === -1 ? xml.length : end + 3
      } else if (xml[pos] === '<') {
        // <!...> declaration / CDATA — skip to the next '>'.
        while (pos < xml.length && xml[pos] !== '>') pos++
        pos++
      } else {
        // Text content — skip to the next tag.
        while (pos < xml.length && xml[pos] !== '<') pos++
      }
    }

    return { tag, attrs, children }
  }

  // Skip XML declaration if present
  skipWS()
  if (xml.startsWith('<?')) {
    while (pos < xml.length && !xml.startsWith('?>', pos)) pos++
    pos += 2
  }

  return parseEl()
}

// ---------------------------------------------------------------------------
// Known tags and their allowed contexts
// ---------------------------------------------------------------------------

const LAYOUT_TAGS = new Set(['frame', 'stack', 'row', 'col', 'grid', 'group'])
const CONTENT_TAGS = new Set(['text', 'img', 'svg', 'shape'])
const CHILD_TAGS = new Set([...LAYOUT_TAGS, ...CONTENT_TAGS])
const ROOT_SECTION_TAGS = new Set(['preview', 'tokens', 'styles', 'fonts', 'assets', 'meta'])
const ALL_KNOWN_TAGS = new Set([
  ...CHILD_TAGS,
  ...ROOT_SECTION_TAGS,
  'gui',
  // token children
  'color', 'number', 'string',
  // style children
  'text-style', 'fill-style', 'effect-style',
  // font / asset children
  'font', 'image',
  // appearance children
  'appearance', 'fill', 'effect',
  // text children
  'segment',
  // shape path data child
  'path',
])

const LAYOUT_DIRECTIONS = new Set(['horizontal', 'vertical', 'grid'])
const SHAPE_TYPES = new Set(['rect', 'ellipse', 'line', 'path'])
const FIT_MODES = new Set(['cover', 'contain', 'crop', 'tile', 'fill', 'none'])
const FONT_SOURCES = new Set(['google', 'system', 'unresolved'])
const STROKE_POSITIONS = new Set(['inside', 'outside', 'center'])

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function isTokenRef(value: string): boolean {
  return value.startsWith('$')
}

function isHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(value)
}

/** rgba(r, g, b, a) — alpha as 0–1 float */
function isRgbaColor(value: string): boolean {
  return /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/.test(value)
}

/** oklch(l c h) or oklch(l c h / a) */
function isOklchColor(value: string): boolean {
  return /^oklch\(/.test(value)
}

/** Any supported color notation: hex, rgba, or oklch */
function isColorValue(value: string): boolean {
  return isHexColor(value) || isRgbaColor(value) || isOklchColor(value)
}

function isGradient(value: string): boolean {
  return /^(linear-gradient|radial-gradient|conic-gradient)\(/.test(value)
}

function isValidFill(value: string): boolean {
  return isColorValue(value) || isGradient(value) || isTokenRef(value)
}

function isValidColor(value: string): boolean {
  return isColorValue(value) || isTokenRef(value)
}

/** A valid dimension: bare number, or string with an allowed unit */
function isValidDimension(value: string): boolean {
  if (/^-?\d+(\.\d+)?$/.test(value)) return true           // bare number → px
  if (/^\d+(\.\d+)?(px|%|rem|vw|vh)$/.test(value)) return true  // explicit unit
  if (/^calc\(/.test(value)) return true                    // calc() — content not validated
  if (value === 'fill' || value === 'hug' || value === 'auto') return true
  return false
}

function isNumeric(value: string): boolean {
  return !isNaN(Number(value))
}

// ---------------------------------------------------------------------------
// Main validator
// ---------------------------------------------------------------------------

export function validate(guiXml: string): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  function err(code: string, message: string, path: string) {
    errors.push({ code, message, path })
  }

  function warn(code: string, message: string, path: string) {
    warnings.push({ code, message, path })
  }

  // Parse
  let root: El
  try {
    root = parse(guiXml)
  } catch (e) {
    return {
      valid: false,
      version: null,
      errors: [{ code: 'PARSE_ERROR', message: String(e), path: 'gui' }],
      warnings: [],
    }
  }

  // Root must be <gui>
  if (root.tag !== 'gui') {
    err('ROOT_TAG', `Root element must be <gui>, got <${root.tag}>`, 'gui')
    return { valid: false, version: null, errors, warnings }
  }

  const version = root.attrs.version || null

  // Version check
  if (!version) {
    err('NO_VERSION', 'Missing required attribute: version', 'gui')
  } else if (version !== '1.0') {
    warn('UNKNOWN_VERSION', `Unknown version "${version}". This validator targets 1.0.`, 'gui')
  }

  // Collect declared tokens, assets, and styles for ref resolution
  const tokenNames = new Set<string>()
  const assetIds = new Set<string>()
  const textStyleNames = new Set<string>()
  const fillStyleNames = new Set<string>()
  const effectStyleNames = new Set<string>()

  // Parse tokens section
  const tokensEl = root.children.find(function(c) { return c.tag === 'tokens' })
  if (tokensEl) {
    for (const t of tokensEl.children) {
      if (!['color', 'number', 'string'].includes(t.tag)) {
        err('INVALID_TOKEN_TAG', `Unknown token type <${t.tag}>`, `gui > tokens > ${t.tag}`)
        continue
      }
      if (!t.attrs.name) {
        err('TOKEN_NO_NAME', `Token missing required attribute: name`, `gui > tokens > ${t.tag}`)
        continue
      }
      if (!t.attrs.value) {
        err('TOKEN_NO_VALUE', `Token "${t.attrs.name}" missing required attribute: value`, `gui > tokens > ${t.tag}`)
        continue
      }
      if (t.tag === 'color' && !isColorValue(t.attrs.value)) {
        err('TOKEN_INVALID_COLOR', `Color token "${t.attrs.name}" has invalid color value: ${t.attrs.value}. Expected hex, rgba(), or oklch().`, `gui > tokens > color`)
      }
      tokenNames.add(t.attrs.name)
    }
  }

  // Parse styles section
  const stylesEl = root.children.find(function(c) { return c.tag === 'styles' })
  if (stylesEl) {
    stylesEl.children.forEach(function(s, i) {
      const stylePath = `gui > styles > ${s.tag}[${i}]`
      if (!['text-style', 'fill-style', 'effect-style'].includes(s.tag)) {
        warn('UNKNOWN_STYLE_TAG', `Unknown element inside <styles>: <${s.tag}>`, stylePath)
        return
      }
      if (!s.attrs.name) {
        err('STYLE_NO_NAME', `<${s.tag}> missing required attribute: name`, stylePath)
        return
      }
      if (s.tag === 'text-style') {
        textStyleNames.add(s.attrs.name)
      } else if (s.tag === 'fill-style') {
        if (!s.attrs.value) {
          err('MISSING_ATTR', `<fill-style name="${s.attrs.name}"> missing required attribute: value`, stylePath)
        } else if (!isColorValue(s.attrs.value)) {
          err('INVALID_FILL_STYLE_VALUE', `<fill-style> value must be a color (hex, rgba, or oklch), got "${s.attrs.value}"`, stylePath)
        }
        fillStyleNames.add(s.attrs.name)
      } else if (s.tag === 'effect-style') {
        for (const child of s.children) {
          if (child.tag !== 'effect') {
            warn('UNKNOWN_TAG', `Unexpected child <${child.tag}> inside <effect-style>`, `${stylePath} > ${child.tag}`)
          } else if (!child.attrs.type) {
            err('MISSING_ATTR', `<effect> inside <effect-style> missing required attribute: type`, `${stylePath} > effect`)
          }
        }
        effectStyleNames.add(s.attrs.name)
      }
    })
  }

  // Parse assets section
  const assetsEl = root.children.find(function(c) { return c.tag === 'assets' })
  if (assetsEl) {
    for (const a of assetsEl.children) {
      if (a.tag !== 'image') {
        warn('UNKNOWN_ASSET_TAG', `Unknown asset element <${a.tag}>`, `gui > assets > ${a.tag}`)
        continue
      }
      if (!a.attrs.id) {
        err('ASSET_NO_ID', `Asset missing required attribute: id`, `gui > assets > image`)
        continue
      }
      if (!a.attrs.src) {
        err('ASSET_NO_SRC', `Asset "${a.attrs.id}" missing required attribute: src`, `gui > assets > image`)
      }
      assetIds.add(a.attrs.id)
    }
  }

  // Resolve a token/asset reference
  function resolveRef(value: string, path: string, kind: 'token' | 'asset') {
    if (!isTokenRef(value)) return
    const name = value.slice(1) // strip $
    if (kind === 'token' && !tokenNames.has(name)) {
      err('UNRESOLVED_TOKEN', `Token reference "${value}" not found in <tokens>`, path)
    }
    if (kind === 'asset' && !assetIds.has(name)) {
      err('UNRESOLVED_ASSET', `Asset reference "${value}" not found in <assets>`, path)
    }
  }

  // Resolve a style reference
  function resolveStyleRef(value: string, kind: 'text-style' | 'fill-style' | 'effect-style', path: string) {
    if (kind === 'text-style' && !textStyleNames.has(value)) {
      err('UNRESOLVED_TEXT_STYLE', `text-style reference "${value}" not found in <styles>`, path)
    } else if (kind === 'fill-style' && !fillStyleNames.has(value)) {
      err('UNRESOLVED_FILL_STYLE', `fill-style reference "${value}" not found in <styles>`, path)
    } else if (kind === 'effect-style' && !effectStyleNames.has(value)) {
      err('UNRESOLVED_EFFECT_STYLE', `effect-style reference "${value}" not found in <styles>`, path)
    }
  }

  // Validate fill value
  function validateFill(value: string, path: string) {
    if (!isValidFill(value)) {
      err('INVALID_FILL', `Invalid fill value: "${value}"`, path)
      return
    }
    if (isTokenRef(value)) resolveRef(value, path, 'token')
  }

  // Validate color value
  function validateColor(value: string, path: string) {
    if (!isValidColor(value)) {
      err('INVALID_COLOR', `Invalid color value: "${value}"`, path)
      return
    }
    if (isTokenRef(value)) resolveRef(value, path, 'token')
  }

  // Validate shared visual attrs common to all nodes
  function validateVisualAttrs(el: El, path: string) {
    if (el.attrs.opacity !== undefined) {
      const v = Number(el.attrs.opacity)
      if (isNaN(v) || v < 0 || v > 1) {
        err('INVALID_OPACITY', `opacity must be 0–1, got "${el.attrs.opacity}"`, path)
      }
    }
    if (el.attrs.fill !== undefined) validateFill(el.attrs.fill, path)
    if (el.attrs.stroke !== undefined) validateColor(el.attrs.stroke, path)
    if (el.attrs.color !== undefined) validateColor(el.attrs.color, path)
    if (el.attrs['stroke-position'] !== undefined && !STROKE_POSITIONS.has(el.attrs['stroke-position'])) {
      err('INVALID_STROKE_POSITION', `stroke-position must be inside|outside|center, got "${el.attrs['stroke-position']}"`, path)
    }
    if (el.attrs['fill-style'] !== undefined) {
      resolveStyleRef(el.attrs['fill-style'], 'fill-style', path)
    }
    if (el.attrs['effect-style'] !== undefined) {
      resolveStyleRef(el.attrs['effect-style'], 'effect-style', path)
    }
  }

  // Validate a content/layout node recursively
  function validateNode(el: El, path: string, parentTag: string) {
    if (!ALL_KNOWN_TAGS.has(el.tag)) {
      warn('UNKNOWN_TAG', `Unknown element <${el.tag}>`, path)
      return
    }

    validateVisualAttrs(el, path)

    switch (el.tag) {
      case 'frame': {
        if (!el.attrs.w) err('MISSING_ATTR', `<frame> missing required attribute: w`, path)
        if (!el.attrs.h) err('MISSING_ATTR', `<frame> missing required attribute: h`, path)
        validateChildren(el, path)
        break
      }

      case 'stack': {
        if (el.attrs.direction && !LAYOUT_DIRECTIONS.has(el.attrs.direction)) {
          err('INVALID_DIRECTION', `<stack> direction must be horizontal|vertical|grid, got "${el.attrs.direction}"`, path)
        }
        if (el.attrs.direction === 'grid' && !el.attrs['grid-columns']) {
          warn('GRID_NO_COLUMNS', `<stack direction="grid"> should specify grid-columns`, path)
        }
        validateChildren(el, path)
        break
      }

      case 'row':
      case 'col': {
        validateChildren(el, path)
        break
      }

      case 'grid': {
        if (!el.attrs.columns) {
          warn('GRID_NO_COLUMNS', `<grid> should specify columns`, path)
        }
        validateChildren(el, path)
        break
      }

      case 'group': {
        validateChildren(el, path)
        break
      }

      case 'text': {
        const hasValue = el.attrs.value !== undefined
        const hasSegments = el.children.some(function(c) { return c.tag === 'segment' })
        if (!hasValue && !hasSegments) {
          err('TEXT_NO_CONTENT', `<text> must have either a value attribute or <segment> children`, path)
        }
        if (hasValue && hasSegments) {
          err('TEXT_AMBIGUOUS', `<text> must not have both a value attribute and <segment> children`, path)
        }
        if (el.attrs['text-style'] !== undefined) {
          resolveStyleRef(el.attrs['text-style'], 'text-style', path)
        }
        if (el.attrs['fill-style'] !== undefined) {
          resolveStyleRef(el.attrs['fill-style'], 'fill-style', path)
        }
        break
      }

      case 'img': {
        if (!el.attrs.src) {
          err('MISSING_ATTR', `<img> missing required attribute: src`, path)
        } else {
          if (isTokenRef(el.attrs.src)) resolveRef(el.attrs.src, path, 'asset')
          else if (!el.attrs.src.startsWith('https://') && !el.attrs.src.startsWith('http://'))
            warn('IMG_INLINE_SRC', `<img src> is not an asset reference or URL — expected "$asset-id" or "https://..."`, path)
        }
        if (!el.attrs.w) err('MISSING_ATTR', `<img> missing required attribute: w`, path)
        if (!el.attrs.h) err('MISSING_ATTR', `<img> missing required attribute: h`, path)
        if (el.attrs.fit && !FIT_MODES.has(el.attrs.fit)) {
          err('INVALID_FIT', `<img> fit must be cover|contain|fill|none, got "${el.attrs.fit}"`, path)
        }
        break
      }

      case 'svg': {
        const hasSrc = !!el.attrs.src
        const hasInlineChildren = el.children.some(function(c) { return c.tag !== 'appearance' })
        if (!hasSrc && !hasInlineChildren) {
          err('MISSING_CONTENT', `<svg> must have either a src attribute (asset ref) or inline SVG children`, path)
        } else if (hasSrc) {
          if (isTokenRef(el.attrs.src)) resolveRef(el.attrs.src, path, 'asset')
        }
        // inline SVG children are raw SVG markup — skip .gui child validation for them
        if (!el.attrs.w) err('MISSING_ATTR', `<svg> missing required attribute: w`, path)
        if (!el.attrs.h) err('MISSING_ATTR', `<svg> missing required attribute: h`, path)
        break
      }

      case 'shape': {
        if (!el.attrs.type) {
          err('MISSING_ATTR', `<shape> missing required attribute: type`, path)
        } else if (!SHAPE_TYPES.has(el.attrs.type)) {
          err('INVALID_SHAPE_TYPE', `<shape> type must be rect|ellipse|line|path, got "${el.attrs.type}"`, path)
        }
        if (!el.attrs.w) err('MISSING_ATTR', `<shape> missing required attribute: w`, path)
        if (el.attrs.type !== 'line' && !el.attrs.h) {
          err('MISSING_ATTR', `<shape type="${el.attrs.type}"> missing required attribute: h`, path)
        }
        if (el.attrs.fill) validateFill(el.attrs.fill, path)
        if (el.attrs['fill-style']) resolveStyleRef(el.attrs['fill-style'], 'fill-style', path)
        if (el.attrs['effect-style']) resolveStyleRef(el.attrs['effect-style'], 'effect-style', path)
        // <path d="..." /> child is allowed inside <shape type="path">
        for (const child of el.children) {
          if (child.tag === 'path') {
            if (!child.attrs.d) {
              err('MISSING_ATTR', `<path> inside <shape> missing required attribute: d`, `${path} > path`)
            }
          } else if (child.tag === 'appearance') {
            validateNode(child, `${path} > appearance`, el.tag)
          } else {
            warn('UNEXPECTED_CHILD', `Unexpected child <${child.tag}> inside <shape>`, `${path} > ${child.tag}`)
          }
        }
        break
      }

      case 'appearance': {
        if (parentTag === 'gui') {
          err('APPEARANCE_MISPLACED', `<appearance> must be a child of a layout or shape node`, path)
        }
        for (const child of el.children) {
          const childPath = `${path} > ${child.tag}`
          if (child.tag === 'fill') {
            if (child.attrs.type === 'image' && child.attrs.src) {
              resolveRef(child.attrs.src, childPath, 'asset')
            }
            if (child.attrs.opacity !== undefined) {
              const v = Number(child.attrs.opacity)
              if (isNaN(v) || v < 0 || v > 1) {
                err('INVALID_OPACITY', `<fill> opacity must be 0–1, got "${child.attrs.opacity}"`, childPath)
              }
            }
          } else if (child.tag === 'effect') {
            if (!child.attrs.type) {
              err('MISSING_ATTR', `<effect> missing required attribute: type`, childPath)
            }
            const EFFECT_TYPES = new Set(['drop-shadow', 'inner-shadow', 'layer-blur', 'background-blur', 'glass'])
            if (child.attrs.type && !EFFECT_TYPES.has(child.attrs.type)) {
              err('INVALID_EFFECT_TYPE', `<effect> type must be drop-shadow|inner-shadow|layer-blur|background-blur|glass, got "${child.attrs.type}"`, childPath)
            }
          } else {
            warn('UNKNOWN_TAG', `Unknown element inside <appearance>: <${child.tag}>`, childPath)
          }
        }
        break
      }
    }
  }

  function validateChildren(el: El, path: string) {
    el.children.forEach(function(child, i) {
      const childPath = `${path} > ${child.tag}[${i}]`
      if (child.tag === 'appearance') {
        validateNode(child, childPath, el.tag)
      } else if (CHILD_TAGS.has(child.tag)) {
        validateNode(child, childPath, el.tag)
      } else {
        warn('UNEXPECTED_CHILD', `Unexpected child <${child.tag}> inside <${el.tag}>`, childPath)
      }
    })
  }

  // Validate fonts section
  const fontsEl = root.children.find(function(c) { return c.tag === 'fonts' })
  if (fontsEl) {
    fontsEl.children.forEach(function(f, i) {
      const path = `gui > fonts > font[${i}]`
      if (f.tag !== 'font') {
        warn('UNKNOWN_TAG', `Unknown element inside <fonts>: <${f.tag}>`, path)
        return
      }
      if (!f.attrs.family) err('MISSING_ATTR', `<font> missing required attribute: family`, path)
      if (!f.attrs.source) err('MISSING_ATTR', `<font> missing required attribute: source`, path)
      if (f.attrs.source && !FONT_SOURCES.has(f.attrs.source)) {
        err('INVALID_FONT_SOURCE', `<font> source must be google|system|unresolved, got "${f.attrs.source}"`, path)
      }
    })
  }

  // Validate root layout node
  const layoutRoot = root.children.find(function(c) { return CHILD_TAGS.has(c.tag) })
  if (!layoutRoot) {
    err('NO_ROOT_NODE', 'No root layout node found in <gui>. Expected <frame>, <stack>, or <group>.', 'gui')
  } else {
    validateNode(layoutRoot, `gui > ${layoutRoot.tag}`, 'gui')
  }

  return {
    valid: errors.length === 0,
    version,
    errors,
    warnings,
  }
}
