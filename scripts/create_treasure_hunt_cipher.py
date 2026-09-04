from pathlib import Path
from math import cos, pi, sin

from PIL import Image, ImageDraw, ImageFont


OUTPUT = Path("public/downloads/treasure-hunt/clue-2-cipher.webp")
W, H = 1600, 900
FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
LETTERS = list("אבגדהוזחטיכלמנסעפצקרשת")
PHRASE = ["הרמז", "נמצא", "בתוך", "הקלמר"]


def font(size, bold=False):
    return ImageFont.truetype(BOLD_PATH if bold else FONT_PATH, size)


def rtl(draw, xy, text, size, bold=False, fill="#191919", anchor="mm"):
    draw.text(xy, text, font=font(size, bold), fill=fill, anchor=anchor, direction="rtl")


def polygon(draw, center, radius, sides, outline, width, rotation=-pi / 2):
    cx, cy = center
    pts = [(cx + radius * cos(rotation + i * 2 * pi / sides), cy + radius * sin(rotation + i * 2 * pi / sides)) for i in range(sides)]
    draw.line(pts + [pts[0]], fill=outline, width=width, joint="curve")


def draw_symbol(draw, letter, cx, cy, scale=1.0):
    index = LETTERS.index("כ" if letter == "ך" else letter)
    family, variant = divmod(index, 5)
    radius = int(18 * scale)
    stroke = max(3, int(4 * scale))
    color = "#273238"
    if family == 0:
        draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), outline=color, width=stroke)
    elif family == 1:
        draw.rounded_rectangle((cx - radius, cy - radius, cx + radius, cy + radius), radius=int(5 * scale), outline=color, width=stroke)
    elif family == 2:
        polygon(draw, (cx, cy + 2 * scale), radius * 1.15, 3, color, stroke)
    elif family == 3:
        polygon(draw, (cx, cy), radius * 1.1, 4, color, stroke, rotation=0)
    else:
        polygon(draw, (cx, cy), radius * 1.1, 6, color, stroke)

    inner = int(11 * scale)
    if variant == 1:
        draw.line((cx, cy - inner, cx, cy + inner), fill=color, width=stroke)
    elif variant == 2:
        draw.line((cx - inner, cy, cx + inner, cy), fill=color, width=stroke)
    elif variant == 3:
        draw.line((cx - inner, cy - inner, cx + inner, cy + inner), fill=color, width=stroke)
        draw.line((cx + inner, cy - inner, cx - inner, cy + inner), fill=color, width=stroke)
    elif variant == 4:
        draw.ellipse((cx - inner // 2, cy - inner // 2, cx + inner // 2, cy + inner // 2), fill=color)


image = Image.new("RGB", (W, H), "white")
draw = ImageDraw.Draw(image)
rtl(draw, (W // 2, 55), "היכן הרמז הבא?", 44, True)
rtl(draw, (W // 2, 110), "פענחו כל מילה וכתבו אותה במשבצות שמתחתיה", 25, fill="#555555")

symbol_size = 60
symbol_gap = 8
word_gap = 32
word_widths = [len(word) * (symbol_size + symbol_gap) - symbol_gap for word in PHRASE]
total_width = sum(word_widths) + word_gap * (len(PHRASE) - 1)
x_right = (W + total_width) / 2

for word, word_width in zip(PHRASE, word_widths):
    x_left = x_right - word_width
    for index, letter in enumerate(word):
        x = x_right - symbol_size / 2 - index * (symbol_size + symbol_gap)
        draw.rounded_rectangle((x - 29, 165, x + 29, 223), radius=12, fill="#f7f4ee", outline="#d8d1c7", width=2)
        draw_symbol(draw, letter, x, 194, 0.9)
        draw.rounded_rectangle((x - 27, 243, x + 27, 297), radius=7, outline="#343434", width=3)
    x_right = x_left - word_gap

rtl(draw, (W // 2, 370), "מפתח הסימנים", 28, True)
cols = 11
card_w, card_h, gap = 126, 94, 10
grid_w = cols * card_w + (cols - 1) * gap
grid_x = (W - grid_w) / 2

for index, letter in enumerate(LETTERS):
    row, col = divmod(index, cols)
    x = grid_x + col * (card_w + gap)
    y = 410 + row * (card_h + 12)
    draw.rounded_rectangle((x, y, x + card_w, y + card_h), radius=14, fill="#fbfaf7", outline="#d8d1c7", width=2)
    draw_symbol(draw, letter, x + 42, y + card_h / 2, 0.72)
    rtl(draw, (x + 94, y + card_h / 2), letter, 31, True)

rtl(draw, (W // 2, 670), "אחרי הפענוח: חפשו את הרמז במקום שגיליתם", 25, fill="#555555")
rtl(draw, (W - 62, H - 35), "מתחת לשולחן", 17, fill="#777777", anchor="rm")

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
image.save(OUTPUT, "WEBP", quality=94, method=6)
