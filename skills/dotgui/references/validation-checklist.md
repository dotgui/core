# Validation checklist

Walk through this list before packaging. Fix issues in place. Do not move on with known violations.

## 1. Document shape

- [ ] Root element is `<gui>` with both `version="0.2"` and `name="..."` attributes
- [ ] Exactly **one** top-level layout node under `<gui>` (the root canvas). Multiple `<col>` / `<frame>` siblings under `<gui>` are invalid.
- [ ] Metadata blocks (`<tokens>`, `<styles>`, `<fonts>`, `<components>`) precede the root layout node, not after it
- [ ] The document closes with `</gui>`

## 2. Root canvas

- [ ] Root canvas is `<col w="...">` (preferred for content-driven screens) or `<frame w="..." h="...">` (fixed artboard)
- [ ] If `<frame>`, both `w` and `h` are present
- [ ] If `<col>`, `w` is present (height hugs content)

## 3. Sizing rules

For every `<frame>`, `<rect>`, `<ellipse>`, `<img>`, `<group>` node:
- [ ] Both `w` and `h` are present (or `"fill"`)

For every `<col>` / `<row>` / `<grid>` / `<text>` / `<instance>` node:
- [ ] If sized, sizes are reasonable (no `w="0"`, no `h="-5"`)
- [ ] If used as a fixed-size element (e.g. a button), the dimensions are explicit

## 4. Token references

For every `$tokenname` reference in the markup:
- [ ] The token is declared in the `<tokens>` block
- [ ] Token type matches usage (`<color>` for fills/borders/text, `<number>` for sizes/radii, `<string>` for font names)

Quick way to check: scan the markup for `$`, list each unique reference, confirm each appears as a `name=` in `<tokens>`.

## 5. Asset references

For every `src` on an `<img>` tag:
- [ ] There is **no** `<assets>` metadata block declared in the document.
- [ ] The `src` attribute either uses a relative path (e.g., `assets/hero.webp` for packaged assets) or a fully qualified URL (e.g., Unsplash or Iconify).

## 6. Text nodes

For every `<text>` node:
- [ ] Either it has a `value` attribute and is self-closing, OR it has `<segment>` children with no `value` on the parent
- [ ] Not both
- [ ] `font-family` is declared in `<fonts>` (or `text-style` references a declared `<text-style>`)
- [ ] `color` is set (text should never inherit color in `.gui` — it's not CSS)
- [ ] `line-height` is set when `font-size` is set

## 7. Layout attribute correctness

- [ ] `align` uses 9-point values (`top-left`, `top-center`, ..., `bottom-right`) or `stretch` / `baseline` — not CSS values like `flex-start` or `center` alone
- [ ] `gap` is a number, `auto`, or two numbers (`"16 10"`)
- [ ] If `gap="auto"`, the parent has `w="fill"` (for `<row>` or horizontal stack) or `h="fill"` (for `<col>` or vertical stack) explicitly declared to prevent the parent from hugging content and collapsing the distributed space-between gaps to zero
- [ ] `p` uses CSS shorthand (1, 2, or 4 values), or per-side `pt`/`pr`/`pb`/`pl`
- [ ] `wrap` and `clip` and `mask` are used as boolean presence (no `="true"` needed, but `="false"` is wrong — just omit instead)

## 8. Color formats

For every `fill`, `stroke`, `color`, and gradient color stop:
- [ ] Hex strings are 6 or 8 characters after `#` (`#1C1C1E` or `#1C1C1ECC`), not 3 (`#FFF`)
- [ ] Gradients use CSS function syntax: `linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)`
- [ ] No CSS color keywords (`red`, `transparent`, `rgba(...)`) — these aren't in the spec. Use hex with alpha byte instead of `rgba`, or token references.

## 9. Helper tags and images (rect, ellipse, line, img)

- [ ] `<rect>` and `<ellipse>` have both `w` and `h` set and have no children (self-closing).
- [ ] `<line>` has no children. Direction is default horizontal or `direction="vertical"`.
- [ ] `<img>` handles all raster/vector graphics and has `w` and `h` set explicitly. No `<svg>` or `<shape>` tags are present in the markup.

## 10. Spec compliance

- [ ] No invented tags. Every tag is from the spec: `gui`, `tokens`, `color`, `number`, `string`, `styles`, `text-style`, `fonts`, `font`, `components`, `component`, `component-set`, `variant`, `props`, `prop`, `instance`, `frame`, `col`, `row`, `grid`, `group`, `text`, `segment`, `img`, `rect`, `ellipse`, `line`, `appearance`, `fill`, `effect`
- [ ] No invented attributes. Every attribute is in `references/spec.md`.
- [ ] No `class`, `style`, `id` (except `id` on components/instances where the spec calls for it), CSS classes, JavaScript event handlers, or accessibility attributes (ARIA isn't in v0.2/v0.3).

## 11. Design quality (the "doesn't look AI" check)

This isn't a spec rule, but it's a quality gate worth running:

- [ ] Content is real and plausible (real names, real product details, real prices) — not lorem ipsum or "User Name"
- [ ] At least one design decision feels intentional and specific — not just "modern" defaults
- [ ] Spacing values come from the declared scale, not random numbers
- [ ] Color palette has more nuance than `#FFFFFF` + `#000000` + accent
- [ ] Typography varies (sizes/weights) to create hierarchy — not everything at 16/24/400
- [ ] If icons are used, they're consistent in style (all stroke or all fill, same stroke width)

If any of these fail, go back to Step 2 (design direction) or Step 3 (authoring) rather than papering over them.

## 12. Final mechanical check

- [ ] The markup parses as well-formed XML — all tags closed, attributes quoted, no stray `<` or `>`
- [ ] Tags that should be self-closing are (`<img ... />`, `<text value="..." ... />`, `<rect ... />`, `<ellipse ... />`, `<line ... />`)
- [ ] Whitespace and indentation are consistent (not strictly required by the format, but helps readability)

## Note on bare boolean attributes

The dotgui spec allows bare booleans like `<frame clip>` (equivalent to `clip="true"`). This is **valid per the spec** but **invalid in strict XML**. The packaging script automatically expands these before its internal parse, so writing `<frame clip>` is fine — the script handles it. If you want maximum portability (e.g. for hand-editing or third-party tooling that doesn't yet support the shorthand), use the explicit `="true"` form instead.

Boolean attributes: `clip`, `mask`, `wrap`, `abs`, `truncate`, `reverse-z`.
