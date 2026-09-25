from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "downloads" / "pomegranate-seeds"
SOURCE = OUTPUT / "pomegranate-template-with-logo.png"
PDF = OUTPUT / "pomegranate-template.pdf"


page_width, page_height = A4
margin = 18
image = ImageReader(str(SOURCE))
image_width, image_height = image.getSize()
scale = min(
    (page_width - 2 * margin) / image_width,
    (page_height - 2 * margin) / image_height,
)
draw_width = image_width * scale
draw_height = image_height * scale
x = (page_width - draw_width) / 2
y = (page_height - draw_height) / 2

pdf = canvas.Canvas(str(PDF), pagesize=A4)
pdf.setTitle("דף רימון לפעילות גרעיני הרימון")
pdf.drawImage(
    image,
    x,
    y,
    width=draw_width,
    height=draw_height,
    preserveAspectRatio=True,
    mask="auto",
)
pdf.showPage()
pdf.save()
