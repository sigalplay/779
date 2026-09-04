from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import black, white
import fitz
from reportlab.lib.utils import ImageReader
from PIL import Image

OUT = Path(__file__).resolve().parents[1] / "public" / "downloads" / "magic-ocean"
W, H = A4


def setup(name):
    c = canvas.Canvas(str(OUT / f"{name}.pdf"), pagesize=A4)
    c.setFillColor(white)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setStrokeColor(black)
    c.setFillColor(white)
    c.setLineWidth(4)
    c.setLineJoin(1)
    c.setLineCap(1)
    return c


def finish(c, name):
    c.showPage()
    c.save()
    doc = fitz.open(OUT / f"{name}.pdf")
    pix = doc[0].get_pixmap(matrix=fitz.Matrix(1.8, 1.8), alpha=False)
    pix.save(OUT / f"{name}-preview.png")
    doc.close()


def flashlight():
    c = setup("flashlight-cutout")
    p = c.beginPath()
    p.moveTo(90, 760); p.lineTo(505, 760); p.lineTo(378, 410)
    p.curveTo(370, 390, 360, 372, 352, 350)
    p.lineTo(243, 350); p.curveTo(235, 372, 225, 390, 217, 410)
    p.close()
    c.drawPath(p, fill=1, stroke=1)
    c.roundRect(243, 65, 109, 315, 24, fill=1, stroke=1)
    c.arc(243, 320, 352, 430, 0, 180)
    c.roundRect(276, 190, 43, 68, 14, fill=1, stroke=1)
    finish(c, "flashlight-cutout")


def simple_fish():
    c = setup("simple-fish-coloring")
    p = c.beginPath()
    p.moveTo(120, 420); p.curveTo(160, 585, 390, 620, 475, 430)
    p.curveTo(390, 240, 160, 275, 120, 420); p.close()
    c.drawPath(p, fill=1, stroke=1)
    p = c.beginPath(); p.moveTo(475, 430); p.lineTo(550, 535); p.curveTo(565, 430, 550, 325, 550, 325); p.close()
    c.drawPath(p, fill=1, stroke=1)
    c.circle(205, 465, 14, fill=0, stroke=1)
    c.arc(175, 345, 285, 425, 200, 110)
    c.arc(285, 520, 390, 650, 15, 150)
    c.arc(285, 190, 390, 320, 195, 150)
    c.arc(390, 350, 465, 510, 270, 180)
    finish(c, "simple-fish-coloring")


def fish(c, x, y, sx=1, sy=1, flip=False):
    d = -1 if flip else 1
    p = c.beginPath(); p.moveTo(x, y)
    p.curveTo(x + d*45*sx, y + 55*sy, x + d*135*sx, y + 50*sy, x + d*175*sx, y)
    p.curveTo(x + d*135*sx, y - 50*sy, x + d*45*sx, y - 55*sy, x, y); p.close()
    c.drawPath(p, fill=1, stroke=1)
    p = c.beginPath(); p.moveTo(x + d*175*sx, y); p.lineTo(x + d*220*sx, y + 50*sy); p.lineTo(x + d*220*sx, y - 50*sy); p.close()
    c.drawPath(p, fill=1, stroke=1)
    c.circle(x + d*45*sx, y + 12*sy, 7, fill=0, stroke=1)


def underwater():
    c = setup("underwater-coloring")
    c.rect(28, 28, W-56, H-56, fill=0, stroke=1)
    fish(c, 105, 580, .9, .9)
    fish(c, 470, 610, .48, .48, True)
    fish(c, 225, 365, .58, .58)
    fish(c, 430, 300, .4, .4, True)
    # sandy floor
    p = c.beginPath(); p.moveTo(28, 145); p.curveTo(130, 210, 220, 125, 320, 165); p.curveTo(420, 205, 505, 120, W-28, 170); p.lineTo(W-28, 28); p.lineTo(28,28); p.close()
    c.drawPath(p, fill=1, stroke=1)
    # seaweed and coral
    for base_x, height in [(70,220),(105,260),(500,210),(535,275)]:
        p=c.beginPath(); p.moveTo(base_x,145); p.curveTo(base_x-18,145+height*.35,base_x+20,145+height*.7,base_x,145+height)
        c.drawPath(p,fill=0,stroke=1)
    c.line(410,145,410,260); c.line(410,195,370,230); c.line(410,220,450,260); c.line(410,175,365,185); c.line(410,245,440,285)
    # shells, stars and bubbles
    c.arc(135,105,205,180,0,180); c.line(170,142,170,178); c.line(150,140,140,170); c.line(190,140,200,170)
    for x,y in [(80,110),(285,105),(465,110)]:
        p=c.beginPath();
        for px,py in [(x,y+30),(x+9,y+9),(x+32,y+7),(x+14,y-7),(x+20,y-32),(x,y-18),(x-20,y-32),(x-14,y-7),(x-32,y+7),(x-9,y+9)]: p.lineTo(px,py) if p._code else p.moveTo(px,py)
        p.close(); c.drawPath(p,fill=1,stroke=1)
    for x,y,r in [(80,730,12),(135,680,7),(260,745,10),(360,675,15),(475,735,9),(520,690,13),(180,500,8),(505,470,7)]:
        c.circle(x,y,r,fill=0,stroke=1)
    finish(c, "underwater-coloring")


OUT.mkdir(parents=True, exist_ok=True)
flashlight()
simple_fish()
underwater()


def image_printable(name):
    source = OUT / f"{name}-source.png"
    image = Image.open(source)
    iw, ih = image.size
    margin = 24
    scale = min((W - 2 * margin) / iw, (H - 2 * margin) / ih)
    dw, dh = iw * scale, ih * scale
    c = canvas.Canvas(str(OUT / f"{name}.pdf"), pagesize=A4)
    c.setFillColor(white)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.drawImage(ImageReader(image), (W - dw) / 2, (H - dh) / 2, width=dw, height=dh, preserveAspectRatio=True)
    c.showPage()
    c.save()
    doc = fitz.open(OUT / f"{name}.pdf")
    pix = doc[0].get_pixmap(matrix=fitz.Matrix(1.8, 1.8), alpha=False)
    pix.save(OUT / f"{name}-preview.png")
    doc.close()


image_printable("simple-fish-coloring")
image_printable("underwater-coloring")
