from hashlib import sha1
from io import BytesIO
from pathlib import Path
import json
import re
import shutil
import subprocess
import sys

from PIL import Image, ImageCms, ImageOps


sys.stdout.reconfigure(encoding="utf-8")
Image.MAX_IMAGE_PIXELS = 200_000_000
source = Path(r"D:\网站替换内容")
root = Path(__file__).resolve().parents[1]
destination = root / "public" / "collections"
srgb = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB"))

categories = [
    ("poster-design", "Poster Design", "grid"),
    ("e-commerce-kv-design", "E-commerce KV Design", "grid"),
    ("product-detail-page", "Product Detail Page", "reading"),
    ("article-design", "Article Design", "reading"),
    ("e-commerce-homepage", "E-commerce Homepage", "reading"),
    ("event-visual-design", "Event Visual Design", "sequence"),
    ("brand-projects", "Brand Projects", "sequence"),
    ("illustration", "Illustration", "grid"),
]

poster_titles = {
    "加载页": "纯甄H5加载页",
    "H5封面": "纯甄H5封面",
    "【1126】DIMOO产品向头条开屏": "DIMOO产品向头条开屏",
    "1201純甄cny-首頁（定）": "纯甄CNY首页",
    "图片3": "馋酸奶1.0",
    "图片1": "馋酸奶2.0",
    "图片2": "馋酸奶3.0",
    "插画4": "馋酸奶插画海报1",
    "插画1": "馋酸奶插画海报2",
    "插画2": "馋酸奶插画海报3",
    "插画3": "馋酸奶插画海报4",
    "刘宇": "INTO1周边海报",
    "1-周年庆kv": "OATLY周年庆",
    "燕麦奶 - 副本": "OATLY直播海报1",
    "燕麦奶.png777": "OATLY直播海报2",
}

homepage_titles = {
    "8.19火龙果": "跃升小程序UI",
    "0701-纯甄小程序首页UI定稿": "纯甄品牌馆小程序UI",
}

product_detail_titles = {
    "作品 01": "纯甄产酸奶POPMART定制版-电商详情页",
    "20211203-纯甄PET白桃石榴POPMART圣诞定制版-电商详情页": "纯甄PET白桃石榴POPMART圣诞定制版-电商详情页",
    "CB电商详情页1130": "CB杯电商详情页",
    "作品 04": "纯甄PET黄桃藜麦-电商详情页",
    "轻食酪乳详情页0927": "轻食酪乳电商详情页",
}


def natural_key(path):
    return [int(part) if part.isdigit() else part.casefold() for part in re.split(r"(\d+)", path.name)]


def image_title(path, index, layout):
    stem = path.stem
    if layout == "sequence":
        return f"第 {index + 1:02} 页"
    if re.fullmatch(r"[a-f0-9]{32}|\d+", stem) or stem.startswith(("未标题", "图层")):
        return f"作品 {index + 1:02}"
    return stem


collections = []
for category_index, (slug, title, layout) in enumerate(categories):
    folder = source / title
    output_folder = destination / slug
    output_folder.mkdir(parents=True, exist_ok=True)
    subfolders = sorted((path for path in folder.iterdir() if path.is_dir()), key=natural_key)
    if slug == "poster-design":
        poster_order = ["纯甄海报", "合众大厦节日海报", "OATLY", "太太乐", "创意海报"]
        subfolders = [path for path in subfolders if path.name != "信用卡促销"]
        subfolders.sort(key=lambda path: poster_order.index(path.name))
    if layout == "sequence" and subfolders:
        # The exported portfolio's page numbers establish the project order.
        subfolders.sort(key=lambda path: min(int(re.search(r"-(\d+)$", item.stem).group(1)) for item in path.iterdir() if item.is_file()))
    groups = ([folder] if any(path.is_file() for path in folder.iterdir()) else []) + subfolders
    sections = []
    cover_written = False

    for group_index, group in enumerate(groups):
        files = sorted((path for path in group.iterdir() if path.is_file()), key=natural_key)
        if slug == "poster-design" and group.name == "纯甄海报":
            files = [path for path in files if path.stem != "社群海报加keep"]
        if slug == "poster-design" and group.name == "太太乐":
            files = [path for path in files if path.stem not in ("酱油KV完稿", "鸡汁竖版海报", "3.31微博-群发")]
        if slug == "e-commerce-kv-design":
            files.sort(key=lambda path: path.stem.startswith("太太乐"))
        images = []
        for image_index, path in enumerate(files):
            relative_path = path.relative_to(folder).as_posix()
            asset_id = sha1(relative_path.encode("utf-8")).hexdigest()[:12]
            with Image.open(path) as original:
                animated = getattr(original, "is_animated", False)
                image = ImageOps.exif_transpose(original)
                mode = "RGBA" if "A" in image.getbands() or "transparency" in original.info else "RGB"
                profile = original.info.get("icc_profile")
                if profile:
                    image = ImageCms.profileToProfile(image, ImageCms.ImageCmsProfile(BytesIO(profile)), srgb, outputMode=mode)
                else:
                    image = image.convert(mode)
                # Long artwork keeps its reading resolution rather than shrinking to fit a square.
                target_width = 2400 if image.height / image.width < 4 else 1600
                if image.width > target_width:
                    image = image.resize((target_width, round(image.height * target_width / image.width)), Image.Resampling.LANCZOS)

                if animated:
                    extension = path.suffix.lower()
                    shutil.copy2(path, output_folder / f"{asset_id}{extension}")
                elif image.height > 16383:
                    extension = ".png" if mode == "RGBA" else ".jpg"
                    if extension == ".jpg":
                        image.save(output_folder / f"{asset_id}{extension}", "JPEG", quality=96, subsampling=0, icc_profile=srgb.tobytes())
                    else:
                        image.save(output_folder / f"{asset_id}{extension}", "PNG", icc_profile=srgb.tobytes())
                else:
                    extension = ".webp"
                    image.save(output_folder / f"{asset_id}{extension}", "WEBP", quality=94, method=4, icc_profile=srgb.tobytes())

                thumbnail = image.copy()
                thumbnail.thumbnail((960, 1600), Image.Resampling.LANCZOS)
                thumbnail.save(output_folder / f"{asset_id}-thumb.webp", "WEBP", quality=92, method=4, icc_profile=srgb.tobytes())
                if not cover_written:
                    cover = ImageOps.fit(image, (960, 540), Image.Resampling.LANCZOS, centering=(0.5, 0 if image.height > image.width else 0.5))
                    cover.save(output_folder / "cover.webp", "WEBP", quality=94, method=4, icc_profile=srgb.tobytes())
                    cover_written = True

                images.append({
                    "id": asset_id,
                    "title": image_title(path, image_index, layout),
                    "src": f"/collections/{slug}/{asset_id}{extension}",
                    "width": original.width if animated else image.width,
                    "height": original.height if animated else image.height,
                    "thumbnail": f"/collections/{slug}/{asset_id}-thumb.webp",
                    "previewWidth": thumbnail.width,
                    "previewHeight": thumbnail.height,
                    **({"animated": True} if animated else {}),
                })
                print(f"{title} / {group.name} / {path.name}: {images[-1]['width']}x{images[-1]['height']}", flush=True)
        if slug == "poster-design" and group.name == "纯甄海报":
            loading_index = next(index for index, image in enumerate(images) if image["title"] == "加载页")
            cny_index = next(index for index, image in enumerate(images) if image["title"] == "1201純甄cny-首頁（定）")
            images[loading_index], images[cny_index] = images[cny_index], images[loading_index]
            cny_index = next(index for index, image in enumerate(images) if image["title"] == "1201純甄cny-首頁（定）")
            image3_index = next(index for index, image in enumerate(images) if image["title"] == "图片3")
            images[cny_index], images[image3_index] = images[image3_index], images[cny_index]
            cny_index = next(index for index, image in enumerate(images) if image["title"] == "1201純甄cny-首頁（定）")
            illustration4_index = next(index for index, image in enumerate(images) if image["title"] == "插画4")
            images[cny_index], images[illustration4_index] = images[illustration4_index], images[cny_index]
            cny_index = next(index for index, image in enumerate(images) if image["title"] == "1201純甄cny-首頁（定）")
            liuyu_index = next(index for index, image in enumerate(images) if image["title"] == "刘宇")
            images[cny_index], images[liuyu_index] = images[liuyu_index], images[cny_index]
            liuyu_index = next(index for index, image in enumerate(images) if image["title"] == "刘宇")
            yangzi2_index = next(index for index, image in enumerate(images) if image["title"] == "杨紫2")
            images[liuyu_index], images[yangzi2_index] = images[yangzi2_index], images[liuyu_index]
            yangzi2_index = next(index for index, image in enumerate(images) if image["title"] == "杨紫2")
            yangzi1_index = next(index for index, image in enumerate(images) if image["title"] == "杨紫1")
            images[yangzi2_index], images[yangzi1_index] = images[yangzi1_index], images[yangzi2_index]
        if slug == "poster-design":
            for image in images:
                image["title"] = poster_titles.get(image["title"], image["title"])
        elif slug == "e-commerce-homepage":
            for image in images:
                image["title"] = homepage_titles.get(image["title"], image["title"])
        elif slug == "product-detail-page":
            for image in images:
                image["title"] = product_detail_titles.get(image["title"], image["title"])
        section_id = "creative-posters" if slug == "poster-design" and group.name == "创意海报" else f"group-{group_index + 1:02}"
        sections.append({"id": section_id, "title": group.name if group != folder else "", "images": images})

    collections.append({"slug": slug, "title": title, "index": category_index + 1, "layout": layout, "cover": f"/collections/{slug}/cover.webp", "sections": sections})

manifest = root / "src" / "data" / "collections.generated.json"
manifest.write_text(json.dumps(collections, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"已导入 {sum(len(section['images']) for collection in collections for section in collection['sections'])} 张素材，8 个合集。", flush=True)
subprocess.run([sys.executable, str(root / "scripts" / "generate-long-artwork-previews.py")], check=True)
