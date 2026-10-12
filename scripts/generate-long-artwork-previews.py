from pathlib import Path
import json
import math
import sys

from PIL import Image, ImageCms


sys.stdout.reconfigure(encoding="utf-8")
Image.MAX_IMAGE_PIXELS = 200_000_000
root = Path(__file__).resolve().parents[1]
manifest = root / "src" / "data" / "collections.generated.json"
collections = json.loads(manifest.read_text(encoding="utf-8"))
srgb_profile = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
long_categories = {"product-detail-page", "article-design", "e-commerce-homepage"}


def save_preview(image, path, max_width):
    if image.width > max_width:
        image = image.resize(
            (max_width, round(image.height * max_width / image.width)),
            Image.Resampling.LANCZOS,
        )
    image.save(path, "WEBP", quality=94, method=4, icc_profile=srgb_profile)
    return {"src": "/" + path.relative_to(root / "public").as_posix(), "width": image.width, "height": image.height}


artwork_count = 0
segment_count = 0
for collection in collections:
    if collection["slug"] not in long_categories:
        continue
    for section in collection["sections"]:
        for artwork in section["images"]:
            source = root / "public" / artwork["src"].lstrip("/")
            with Image.open(source) as original:
                image = original.convert("RGBA" if "A" in original.getbands() else "RGB")
                assert (image.width, image.height) == (artwork["width"], artwork["height"])
                phone_height = min(image.height, round(image.width * 19.5 / 9))
                phone = save_preview(
                    image.crop((0, 0, image.width, phone_height)),
                    source.parent / f"{artwork['id']}-phone.webp",
                    640,
                )
                artwork["phonePreview"] = phone["src"]
                count = min(5, max(3, math.ceil(image.height / image.width / 5)))
                boundaries = [image.height * index // count for index in range(count + 1)]
                assert boundaries[0] == 0 and boundaries[-1] == image.height
                assert sum(boundaries[index + 1] - boundaries[index] for index in range(count)) == image.height
                artwork["segments"] = [
                    save_preview(
                        image.crop((0, boundaries[index], image.width, boundaries[index + 1])),
                        source.parent / f"{artwork['id']}-segment-{index + 1:02}.webp",
                        420,
                    )
                    for index in range(count)
                ]
                artwork_count += 1
                segment_count += count
                print(f"{collection['slug']} / {artwork['id']}: phone {phone['width']}x{phone['height']}, {count} segments, boundaries {boundaries}", flush=True)

manifest.write_text(json.dumps(collections, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Generated {artwork_count} phone previews and {segment_count} segments.", flush=True)
