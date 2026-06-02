#!/usr/bin/env python3
"""
package_gui.py — bundle dotgui markup + assets + preview into a .gui ZIP package.

A .gui file is a ZIP archive containing:
    design.guix       — the UI markup (XML with <gui> as root)
    preview.webp      — a thumbnail image of the rendered screen
    assets/           — any embedded images, SVGs, etc.

Usage:
    python3 package_gui.py \
        --markup path/to/design.guix \
        --output /path/to/output.gui \
        [--preview path/to/preview.webp] \
        [--assets-dir path/to/assets/]

If --preview is omitted, a simple placeholder WebP is generated from the
<gui name="..."> attribute and the root canvas dimensions.

The script validates that the markup is well-formed XML with <gui> as the
root element. It does NOT do semantic spec validation — that's Claude's job
in Step 4 of the skill.
"""

import argparse
import io
import re
import struct
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path


# Bare boolean attributes that the dotgui spec allows without ="true".
# We expand them to ="true" before passing to a strict XML parser, since
# bare attributes are valid per the dotgui spec but invalid in standard XML.
_BOOLEAN_ATTRS = ("clip", "mask", "wrap", "abs", "truncate", "reverse-z")


def _expand_boolean_attributes(markup: str) -> str:
    """
    Rewrite bare boolean attributes (e.g. `<frame clip>`) to fully-quoted form
    (`<frame clip="true">`) so strict XML parsers accept them.
    """
    result = markup
    for attr in _BOOLEAN_ATTRS:
        # Match the attribute when it appears as a bare flag: preceded by
        # whitespace and followed by whitespace, '/', or '>'. Avoid double-
        # rewriting attributes that already have a value.
        pattern = re.compile(
            r"(\s)" + re.escape(attr) + r"(?=\s|/|>)"
        )
        result = pattern.sub(r'\1' + attr + r'="true"', result)
    return result


def parse_markup_content(raw: str) -> tuple[ET.Element, bytes]:
    """
    Parse markup XML content string and confirm <gui> is the root element.
    Returns (root_element, original_utf8_bytes_for_packaging).
    """
    expanded = _expand_boolean_attributes(raw)

    try:
        root = ET.fromstring(expanded)
    except ET.ParseError as e:
        sys.exit(f"ERROR: markup is not well-formed XML: {e}")

    if root.tag != "gui":
        sys.exit(f"ERROR: root element must be <gui>, got <{root.tag}>")

    if "version" not in root.attrib:
        sys.exit("ERROR: <gui> is missing the required 'version' attribute")
    if "name" not in root.attrib:
        sys.exit("ERROR: <gui> is missing the required 'name' attribute")

    # Return the ORIGINAL markup bytes (not the expanded form) so the
    # .gui package preserves whatever the author wrote. The boolean
    # expansion is only used for our local parse step.
    return root, raw.encode("utf-8")


def parse_markup(markup_path: Path) -> tuple[ET.Element, bytes]:
    """
    Parse the markup file and confirm <gui> is the root element.
    """
    try:
        raw = markup_path.read_text(encoding="utf-8")
    except UnicodeDecodeError as e:
        sys.exit(f"ERROR: markup must be UTF-8 encoded: {e}")

    return parse_markup_content(raw)


def get_canvas_dimensions(root: ET.Element) -> tuple[int, int]:
    """
    Find the root canvas (first non-metadata layout child of <gui>) and return
    its (width, height). Falls back to (390, 600) if dimensions can't be
    determined.
    """
    metadata_tags = {"tokens", "styles", "fonts", "assets", "components"}
    for child in root:
        if child.tag in metadata_tags:
            continue
        # First non-metadata child is the root canvas
        w = child.attrib.get("w", "390")
        h = child.attrib.get("h", "600")
        try:
            return (int(w), int(h))
        except ValueError:
            return (390, 600)
    return (390, 600)


def get_screen_name(root: ET.Element) -> str:
    return root.attrib.get("name", "Untitled")


def make_placeholder_webp(width: int, height: int, label: str) -> bytes:
    """
    Generate a minimal valid WebP file. Tries Pillow first (produces a real
    rendered preview with the screen name). Falls back to a hand-rolled
    minimal lossless WebP of a solid color if Pillow isn't available.
    """
    # Clamp dimensions to something WebP-friendly
    width = max(64, min(width, 1600))
    height = max(64, min(height, 1600))

    try:
        from PIL import Image, ImageDraw, ImageFont  # type: ignore

        # Soft neutral background with a subtle gradient — looks designed,
        # not stubby.
        img = Image.new("RGB", (width, height), (245, 245, 247))
        draw = ImageDraw.Draw(img)

        # Vertical gradient overlay
        for y in range(height):
            t = y / max(1, height - 1)
            r = int(245 - 10 * t)
            g = int(245 - 10 * t)
            b = int(247 - 5 * t)
            draw.line([(0, y), (width, y)], fill=(r, g, b))

        # Center the label
        try:
            # Try a few common system fonts
            font = None
            for candidate in [
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                "/System/Library/Fonts/Helvetica.ttc",
                "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            ]:
                if Path(candidate).exists():
                    font = ImageFont.truetype(candidate, max(20, width // 24))
                    break
            if font is None:
                font = ImageFont.load_default()
        except Exception:
            font = ImageFont.load_default()

        text = label
        bbox = draw.textbbox((0, 0), text, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text(
            ((width - tw) / 2, (height - th) / 2 - 12),
            text,
            font=font,
            fill=(140, 140, 150),
        )

        subtitle = "dotgui preview"
        try:
            sub_font = ImageFont.truetype(
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                max(12, width // 44),
            )
        except Exception:
            sub_font = ImageFont.load_default()
        sbbox = draw.textbbox((0, 0), subtitle, font=sub_font)
        sw, sh = sbbox[2] - sbbox[0], sbbox[3] - sbbox[1]
        draw.text(
            ((width - sw) / 2, (height - th) / 2 + th + 4),
            subtitle,
            font=sub_font,
            fill=(180, 180, 188),
        )

        buf = io.BytesIO()
        img.save(buf, format="WEBP", quality=85)
        return buf.getvalue()

    except ImportError:
        # Hand-rolled minimal lossless WebP (VP8L) of a solid color.
        # This is a fallback path. Most environments have Pillow.
        return _minimal_lossless_webp(width, height)


def _minimal_lossless_webp(width: int, height: int) -> bytes:
    """
    Produce a minimal lossless VP8L WebP of a solid light-gray color.
    Used only if Pillow is unavailable. Produces a valid file that any
    WebP decoder will accept.

    Reference: https://developers.google.com/speed/webp/docs/riff_container
    """
    w = max(1, min(width, 16384))
    h = max(1, min(height, 16384))

    # VP8L bitstream for a 1x1 solid #F4F4F7 image; we'll let the WebP header
    # carry the canvas dimensions and use a tiny image — most renderers will
    # stretch a thumbnail to display size, and worst case a 1x1 still parses.
    # Constructing arbitrary-size VP8L by hand is involved; a 1x1 keeps the
    # file tiny while staying valid.
    #
    # VP8L signature is 0x2f, followed by 14 bits of (width-1), 14 bits of
    # (height-1), 1 bit alpha_is_used, 3 bits version.
    # For 1x1: width-1 = 0, height-1 = 0. Plus enough Huffman data to encode
    # one pixel. We use a precomputed VP8L payload for a 1x1 light-gray pixel.

    # Precomputed VP8L payload (1x1 solid #F4F4F7-ish):
    vp8l_payload = bytes.fromhex(
        "2f00000000109a0211101148000020c019402204008b015b020f0118"
    )

    # Pad to even length (RIFF chunk size must be even, pad with 0x00 if odd)
    chunk = b"VP8L" + struct.pack("<I", len(vp8l_payload)) + vp8l_payload
    if len(vp8l_payload) % 2:
        chunk += b"\x00"

    riff_body = b"WEBP" + chunk
    file_data = b"RIFF" + struct.pack("<I", len(riff_body)) + riff_body
    return file_data


def collect_assets(assets_dir: Path | None) -> list[tuple[str, bytes]]:
    """Return list of (path_in_zip, contents) for every file in assets_dir."""
    if not assets_dir:
        return []
    assets_dir = Path(assets_dir)
    if not assets_dir.exists():
        sys.exit(f"ERROR: assets directory not found: {assets_dir}")
    if not assets_dir.is_dir():
        sys.exit(f"ERROR: --assets-dir must be a directory: {assets_dir}")

    out: list[tuple[str, bytes]] = []
    for f in sorted(assets_dir.rglob("*")):
        if f.is_file():
            rel = f.relative_to(assets_dir)
            zip_path = f"assets/{rel.as_posix()}"
            out.append((zip_path, f.read_bytes()))
    return out


def build_gui_package(
    markup_bytes: bytes,
    preview_bytes: bytes,
    asset_entries: list[tuple[str, bytes]],
    output_path: Path,
) -> None:
    """Write a .gui ZIP package."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("design.guix", markup_bytes)
        zf.writestr("preview.webp", preview_bytes)
        for path, data in asset_entries:
            zf.writestr(path, data)


def stream_read_gui(gui_path: Path) -> None:
    """Read design.guix from the .gui package and print to stdout."""
    if not gui_path.exists():
        sys.exit(f"ERROR: .gui file not found: {gui_path}")
    try:
        with zipfile.ZipFile(gui_path, "r") as zf:
            if "design.guix" not in zf.namelist():
                sys.exit(f"ERROR: design.guix not found in archive: {gui_path}")
            content = zf.read("design.guix").decode("utf-8")
            sys.stdout.write(content)
    except Exception as e:
        sys.exit(f"ERROR: Failed to read .gui archive: {e}")


def stream_update_gui(gui_path: Path) -> None:
    """Read updated design.guix from stdin and update the .gui package in-place."""
    if not gui_path.exists():
        sys.exit(f"ERROR: .gui file not found: {gui_path}")
        
    # Read raw updated XML from stdin
    try:
        raw_xml = sys.stdin.read()
    except Exception as e:
        sys.exit(f"ERROR: Failed to read from stdin: {e}")
        
    if not raw_xml.strip():
        sys.exit("ERROR: Received empty markup input from stdin")

    # Validate raw XML
    root, markup_bytes = parse_markup_content(raw_xml)
    
    # Read existing ZIP items into memory (except design.guix)
    entries = []
    try:
        with zipfile.ZipFile(gui_path, "r") as zf:
            for item in zf.infolist():
                if item.filename != "design.guix":
                    entries.append((item.filename, zf.read(item.filename)))
    except Exception as e:
        sys.exit(f"ERROR: Failed to read existing archive contents: {e}")

    # Re-write the ZIP in-place (updates design.guix, keeps assets/previews)
    try:
        with zipfile.ZipFile(gui_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
            zf.writestr("design.guix", markup_bytes)
            for path, data in entries:
                zf.writestr(path, data)
    except Exception as e:
        sys.exit(f"ERROR: Failed to write updated archive: {e}")
        
    print(f"✓ Successfully updated: {gui_path}")
    print(f"  Updated screen name: {get_screen_name(root)}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Package, read, or update dotgui markup inside a .gui ZIP file",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--markup", help="Path to the design.guix markup file to pack")
    group.add_argument("--read", help="Path to a .gui file to read in-memory and stream to stdout")
    group.add_argument("--update", help="Path to a .gui file to update in-place with markup from stdin")

    parser.add_argument("--output", help="Path for the output .gui file (required for --markup)")
    parser.add_argument("--preview", help="Optional path to a preview.webp image (for --markup)")
    parser.add_argument("--assets-dir", help="Optional directory of assets to include (for --markup)")
    args = parser.parse_args()

    # Handle Read Stream Mode
    if args.read:
        stream_read_gui(Path(args.read))
        return

    # Handle Update Stream Mode
    if args.update:
        stream_update_gui(Path(args.update))
        return

    # Handle Pack Mode
    if not args.output:
        parser.error("--output is required when packing a new package using --markup")

    markup_path = Path(args.markup)
    output_path = Path(args.output)

    if not markup_path.exists():
        sys.exit(f"ERROR: markup file not found: {markup_path}")

    # Parse + light validation
    root, markup_bytes = parse_markup(markup_path)
    width, height = get_canvas_dimensions(root)
    name = get_screen_name(root)

    # Preview
    if args.preview:
        preview_path = Path(args.preview)
        if not preview_path.exists():
            sys.exit(f"ERROR: preview file not found: {preview_path}")
        preview_bytes = preview_path.read_bytes()
    else:
        preview_bytes = make_placeholder_webp(width, height, name)

    # Assets
    asset_entries = collect_assets(Path(args.assets_dir) if args.assets_dir else None)

    # Build
    build_gui_package(markup_bytes, preview_bytes, asset_entries, output_path)

    # Report
    print(f"✓ Packaged: {output_path}")
    print(f"  Screen name: {name}")
    print(f"  Canvas: {width}×{height}")
    print(f"  Assets: {len(asset_entries)}")
    print(f"  Preview: {'custom' if args.preview else 'generated placeholder'}")


if __name__ == "__main__":
    main()
