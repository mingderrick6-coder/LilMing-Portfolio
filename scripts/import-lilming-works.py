from pathlib import Path
import sys

from PIL import Image, ImageDraw, ImageFont, ImageOps


sys.stdout.reconfigure(encoding="utf-8")
Image.MAX_IMAGE_PIXELS = 200_000_000

source = Path(r"D:\作品集内容")
root = Path(__file__).resolve().parents[1]
destination = root / "public" / "works"
destination.mkdir(parents=True, exist_ok=True)

works = [
    ("cb-cup-kv", "CB杯KV.jpg"),
    ("dimoo-factory-kv", "DIMOO工厂KV.jpg"),
    ("dimoo-popping-candy-kv", "DIMOO跳跳糖KV.jpg"),
    ("into1-meeting-kv", "into1见面会主KV.jpg"),
    ("oatly-illustration-1", "OATLY插画1.0.jpg"),
    ("oatly-illustration-2", "OATLY插画2.0.jpg"),
    ("pai", "PAI.jpg"),
    ("pai-promotion", "PAI宣传物料.jpg"),
    ("mid-autumn-exhibition", "中秋节展陈.jpg"),
    ("yogurt-zhang-yixing-kv", "产酸奶张艺兴主KV.jpg"),
    ("creative-poster-1", "创意海报1.0.jpg"),
    ("creative-poster-2", "创意海报2.0.jpg"),
    ("hehe-cny", "合合CNY.jpg"),
    ("hehe-merchandise", "合合文创周边.jpg"),
    ("earth-reading-day-kv", "地球&读书日KV.jpg"),
    ("summer-cooling-kv", "夏日消暑计划KV.jpg"),
    ("totole-science-quiz", "太太乐科学知识竞赛.png"),
    ("totole-fresh-challenge", "太太乐鲜闯为快.png"),
    ("avatar-illustration-1", "头像插画1.0.jpg"),
    ("avatar-illustration-2", "头像插画2.0.jpg"),
    ("mango-pomelo-smile-kv", "杨枝甘露笑脸包KV.jpg"),
    ("zhen-yogurt-poster", "甄酸奶海报.jpg"),
    ("chunzhen-popmart-christmas-kv", "纯甄x泡泡玛特圣诞KV.jpeg"),
    ("chan-yogurt-expression-poster", "馋酸奶人物表情海报.png"),
    ("chan-yogurt-illustration-poster", "馋酸奶插画海报.jpg"),
    ("chan-yogurt-new-product-kv", "馋酸奶新品KV.png"),
]

provided = {path.name for path in source.iterdir() if path.is_file()}
assert provided == {filename for _, filename in works}, "作品文件和导入清单不一致"

font = ImageFont.truetype(r"C:\Windows\Fonts\msyh.ttc", 16)
sheet = Image.new("RGB", (1200, 7 * 205), "#111111")
draw = ImageDraw.Draw(sheet)
total_bytes = 0
selected_slug = sys.argv[1] if len(sys.argv) > 1 else None
imported_count = 0

for index, (slug, filename) in enumerate(works):
    if selected_slug and slug != selected_slug:
        continue
    input_path = source / filename
    asset_slug = slug
    if slug == "hehe-merchandise":
        input_path = Path(r"H:\cm\作品集\作品集内容\合合文创周边.jpg")
        asset_slug = "hehe-merchandise-v2"
    with Image.open(input_path) as original:
        original.draft("RGB", (2400, 2400))
        image = ImageOps.exif_transpose(original)
        image.thumbnail((2400, 2400), Image.Resampling.LANCZOS)
        image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
        preview_path = destination / f"{asset_slug}.webp"
        image.save(preview_path, "WEBP", quality=94, method=6)

        thumbnail = image.copy()
        thumbnail.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        thumbnail_path = destination / f"{asset_slug}-thumb.webp"
        thumbnail.save(thumbnail_path, "WEBP", quality=92, method=6)
        total_bytes += preview_path.stat().st_size + thumbnail_path.stat().st_size
        imported_count += 1

        cell_x = (index % 4) * 300
        cell_y = (index // 4) * 205
        tile = ImageOps.contain(thumbnail.convert("RGB"), (284, 166))
        sheet.paste(tile, (cell_x + (300 - tile.width) // 2, cell_y + 8))
        draw.text((cell_x + 8, cell_y + 177), f"{index + 1:02} {Path(filename).stem}", font=font, fill="white")
        print(f"{slug}: {image.width}x{image.height}, {Path(filename).stem}", flush=True)

if selected_slug in (None, "hehe-merchandise"):
    with Image.open(r"C:\Users\86188\Desktop\未标题-1-16.jpg") as original:
        original.draft("RGB", (2400, 2400))
        image = ImageOps.exif_transpose(original)
        image.thumbnail((2400, 2400), Image.Resampling.LANCZOS)
        image.convert("RGB").save(destination / "hehe-merchandise-photo.webp", "WEBP", quality=94, method=6)

qa = root / "qa" / "lilming-works"
qa.mkdir(parents=True, exist_ok=True)
if not selected_slug:
    sheet.save(qa / "import-contact-sheet.jpg", quality=92)
print(f"已导入 {imported_count} 张作品，网页资源共 {total_bytes / 1024 / 1024:.1f} MB")
