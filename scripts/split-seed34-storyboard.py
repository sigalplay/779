from pathlib import Path
from PIL import Image


source = Path("public/icon-bank/movement-new/seed-34-illustrated/storyboard.png")
output_dir = source.parent
image = Image.open(source).convert("RGB")

panels = [
    ("material-step.png", (10, 10, 621, 462)),
    ("step-1.png", (633, 10, 1244, 462)),
    ("step-2.png", (10, 477, 621, 831)),
    ("step-3.png", (633, 477, 1244, 831)),
    ("step-4.png", (10, 847, 621, 1244)),
    ("step-5.png", (633, 847, 1244, 1244)),
]

for filename, box in panels:
    panel = image.crop(box)
    canvas = Image.new("RGB", (640, 640), "white")
    x = (canvas.width - panel.width) // 2
    y = (canvas.height - panel.height) // 2
    canvas.paste(panel, (x, y))
    canvas.save(output_dir / filename, quality=95)
