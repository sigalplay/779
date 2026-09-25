from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


OUTPUT = Path("public/downloads/treasure-hunt/clue-1-dot-to-dot.webp")
W, H = 900, 1000
FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def font(size, bold=False):
    return ImageFont.truetype(BOLD_PATH if bold else FONT_PATH, size)


def rtl_text(draw, xy, text, font_value, fill="#171717", anchor="mm"):
    draw.text(xy, text, font=font_value, fill=fill, anchor=anchor, direction="rtl")


image = Image.new("RGB", (W, H), "white")
draw = ImageDraw.Draw(image)

rtl_text(draw, (W // 2, 78), "חברו את הנקודות לפי הסדר", font(42, True))
rtl_text(draw, (W // 2, 135), "איזה רהיט מסתתר בציור?", font(25), fill="#555555")

# A simple front-facing table silhouette. The closer spacing along the long
# vertical edges helps children recognise the legs before completing the line.
points = [
    (150, 300), (250, 300), (350, 300), (450, 300), (550, 300), (650, 300), (750, 300),
    (750, 365), (690, 365),
    (690, 445), (690, 525), (690, 605), (690, 685),
    (620, 685),
    (620, 605), (620, 525), (620, 445), (620, 365),
    (280, 365),
    (280, 445), (280, 525), (280, 605), (280, 685),
    (210, 685),
    (210, 605), (210, 525), (210, 445), (210, 365),
    (150, 365),
]


def label_offset(index, x, y):
    if (x, y) == (150, 365):
        return (-28, 10)
    if (x, y) == (210, 365):
        return (28, -10)
    if y == 300:
        return (-18, -27) if x in (150, 750) else (0, -28)
    if x in (690, 280):
        return (28, 0)
    if x in (620, 210):
        return (-29, 0)
    if y == 685:
        return (0, 31)
    return (0, -27)

for number, (x, y) in enumerate(points, start=1):
    dx, dy = label_offset(number, x, y)
    draw.ellipse((x - 7, y - 7, x + 7, y + 7), fill="#111111")
    draw.text((x + dx, y + dy), str(number), font=font(23, True), fill="#111111", anchor="mm")

rtl_text(draw, (W // 2, 830), "הרמז נמצא מתחת ל...", font(36, True))
draw.line((275, 890, 625, 890), fill="#555555", width=3)
rtl_text(draw, (W // 2, 940), "מביאים לילד", font(20), fill="#666666")

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
image.save(OUTPUT, "WEBP", quality=94, method=6)
