from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/downloads/popsicle-craft/popsicles-coloring-source.png"
PDF = ROOT / "public/downloads/popsicle-craft/popsicles-coloring.pdf"


def main():
    page_w, page_h = A4
    margin = 24
    with Image.open(SOURCE) as image:
        source_w, source_h = image.size
    available_w = page_w - 2 * margin
    available_h = page_h - 2 * margin
    scale = min(available_w / source_w, available_h / source_h)
    draw_w = source_w * scale
    draw_h = source_h * scale
    x = (page_w - draw_w) / 2
    y = (page_h - draw_h) / 2

    pdf = canvas.Canvas(str(PDF), pagesize=A4)
    pdf.setTitle("Popsicles coloring and cutting page")
    pdf.drawImage(str(SOURCE), x, y, width=draw_w, height=draw_h, preserveAspectRatio=True, mask="auto")
    pdf.showPage()
    pdf.save()


if __name__ == "__main__":
    main()
