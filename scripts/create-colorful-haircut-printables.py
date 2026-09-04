from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "downloads" / "colorful-haircut"
LOGO = ROOT / "public" / "boo-nesahek-logo.png"


def create_printable(image_name: str, pdf_name: str) -> None:
    image_path = OUTPUT / image_name
    pdf_path = OUTPUT / pdf_name
    page_width, page_height = A4
    margin = 24
    logo_zone_height = 66
    image = ImageReader(str(image_path))
    image_width, image_height = image.getSize()
    scale = min(
        (page_width - 2 * margin) / image_width,
        (page_height - 2 * margin - logo_zone_height) / image_height,
    )
    draw_width = image_width * scale
    draw_height = image_height * scale
    x = (page_width - draw_width) / 2
    illustration_height = page_height - 2 * margin - logo_zone_height
    y = margin + logo_zone_height + (illustration_height - draw_height) / 2

    logo = ImageReader(str(LOGO))
    logo_width_px, logo_height_px = logo.getSize()
    logo_width = 54
    logo_height = logo_width * logo_height_px / logo_width_px
    logo_x = margin
    logo_y = 12

    pdf = canvas.Canvas(str(pdf_path), pagesize=A4)
    pdf.setTitle("תבנית תספורת צבעונית")
    pdf.drawImage(
        image,
        x,
        y,
        width=draw_width,
        height=draw_height,
        preserveAspectRatio=True,
        mask="auto",
    )
    pdf.drawImage(
        logo,
        logo_x,
        logo_y,
        width=logo_width,
        height=logo_height,
        preserveAspectRatio=True,
        mask="auto",
    )
    pdf.showPage()
    pdf.save()


create_printable("colorful-haircut-boy-template.png", "colorful-haircut-face-template.pdf")
create_printable("colorful-haircut-girl-template.png", "colorful-haircut-girl-template.pdf")
