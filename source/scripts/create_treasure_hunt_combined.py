from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from PIL import Image


OUTPUT = "public/downloads/treasure-hunt/all-clues-one-page.pdf"
IMAGES = [
    "public/downloads/treasure-hunt/clue-1-dot-to-dot.webp",
    "public/downloads/treasure-hunt/clue-2-cipher.webp",
    "public/downloads/treasure-hunt/clue-3-board-game.webp",
    "public/downloads/treasure-hunt/clue-4-found-treasure.webp",
]

page_w, page_h = A4
margin = 28
gap = 16
cell_w = (page_w - 2 * margin - gap) / 2
cell_h = (page_h - 2 * margin - gap) / 2

c = canvas.Canvas(OUTPUT, pagesize=A4)
c.setStrokeColorRGB(.72, .72, .72)
c.setDash(4, 4)
c.setLineWidth(.8)

for index, path in enumerate(IMAGES):
    col = index % 2
    row = 1 - index // 2
    x = margin + col * (cell_w + gap)
    y = margin + row * (cell_h + gap)
    c.roundRect(x, y, cell_w, cell_h, 8, stroke=1, fill=0)

    with Image.open(path) as image:
        img_w, img_h = image.size
    inner = 14
    max_w, max_h = cell_w - 2 * inner, cell_h - 2 * inner
    scale = min(max_w / img_w, max_h / img_h)
    draw_w, draw_h = img_w * scale, img_h * scale
    draw_x = x + (cell_w - draw_w) / 2
    draw_y = y + (cell_h - draw_h) / 2
    c.drawImage(ImageReader(path), draw_x, draw_y, draw_w, draw_h, preserveAspectRatio=True, mask="auto")

c.showPage()
c.save()
