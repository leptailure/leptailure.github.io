#!/usr/bin/env python3
"""Visible, repeated watermark for Leptailure project images.

Examples:
    python tools/batch_watermark.py --input assets --output dist/watermarked
    python tools/batch_watermark.py --input assets --output assets --replace
Original files are never deleted by the default command.
"""
import argparse
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

DEFAULT_TEXT = "LEPTAILURE  •  leptailure.github.io"
EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
EXCLUDED = {"serval-avatar.png", "favicon.png", "favicon.svg"}

def font_for(size: int):
    for candidate in [
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
    ]:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()

def watermark(image: Image.Image, text: str, opacity: float = 0.28) -> Image.Image:
    base = ImageOps.exif_transpose(image).convert("RGBA")
    w, h = base.size
    size = max(17, min(66, round(min(w, h) * 0.073)))
    font = font_for(size)
    measure = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    left, top, right, bottom = measure.textbbox((0, 0), text, font=font, stroke_width=1)
    tw, th = right - left, bottom - top
    stamp = Image.new("RGBA", (tw + 36, th + 24), (0, 0, 0, 0))
    d = ImageDraw.Draw(stamp)
    d.text((18 - left, 12 - top), text, font=font,
           fill=(255, 255, 255, round(255 * opacity)),
           stroke_width=1, stroke_fill=(0, 0, 0, round(255 * min(0.5, opacity * 1.4))))
    stamp = stamp.rotate(27, Image.Resampling.BICUBIC, expand=True)
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    step_x = max(stamp.width + 24, int(w * 0.22))
    step_y = max(stamp.height + 18, int(h * 0.16))
    for row, y in enumerate(range(-stamp.height, h + stamp.height, step_y)):
        for x in range(-stamp.width + (row % 2) * (step_x // 2), w + stamp.width, step_x):
            overlay.alpha_composite(stamp, (x, y))
    return Image.alpha_composite(base, overlay)

def run():
    p = argparse.ArgumentParser()
    p.add_argument("--input", type=Path, default=Path("assets"))
    p.add_argument("--output", type=Path, default=Path("dist/watermarked"))
    p.add_argument("--text", default=DEFAULT_TEXT)
    p.add_argument("--opacity", type=float, default=0.28)
    p.add_argument("--replace", action="store_true",
                   help="Explicitly allow overwriting source files")
    args = p.parse_args()
    if not 0.05 <= args.opacity <= 0.6:
        p.error("--opacity must be between 0.05 and 0.6")
    if args.input.resolve() == args.output.resolve() and not args.replace:
        p.error("Refusing to overwrite source images without --replace")
    args.output.mkdir(parents=True, exist_ok=True)
    n = 0
    for file in sorted(args.input.iterdir()):
        if not file.is_file() or file.suffix.lower() not in EXTENSIONS or file.name.lower() in EXCLUDED:
            continue
        output_file = args.output / file.name
        with Image.open(file) as img:
            processed = watermark(img, args.text, args.opacity)
            if file.suffix.lower() in {".jpg", ".jpeg"}:
                processed.convert("RGB").save(output_file, "JPEG", quality=93, optimize=True, subsampling=0)
            elif file.suffix.lower() == ".webp":
                processed.save(output_file, "WEBP", quality=93, method=6)
            else:
                processed.save(output_file, "PNG", optimize=True)
        n += 1
        print(f"{file.name} -> {output_file}")
    print(f"Processed {n} images; brand/avatar images excluded.")

if __name__ == "__main__":
    run()
