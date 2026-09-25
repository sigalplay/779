from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader


def make(image_path, pdf_path):
    page_w, page_h = A4
    c = canvas.Canvas(pdf_path, pagesize=A4)
    # A generous print-safe margin prevents home printers from clipping fins.
    size = 455
    x = (page_w - size) / 2
    y = (page_h - size) / 2
    c.drawImage(ImageReader(image_path), x, y, width=size, height=size,
                preserveAspectRatio=True, mask="auto")
    c.showPage()
    c.save()


make("public/downloads/shark-teeth/shark-colour.png",
     "public/downloads/shark-teeth/shark-colour.pdf")
make("public/downloads/shark-teeth/shark-black-white.png",
     "public/downloads/shark-teeth/shark-black-white.pdf")
