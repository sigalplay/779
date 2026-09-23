export const VISUAL_SIGNS = [
  { id: "enough", label: "מספיק", labelEn: "Enough", asset: "/icon-bank/ui/visual-signs-v95/enough.png" },
  { id: "more", label: "עוד", labelEn: "More", asset: "/icon-bank/ui/visual-signs-v95/more.png" },
  { id: "stop", label: "עצור", labelEn: "Stop", asset: "/icon-bank/ui/visual-signs-v95/stop.png" },
  { id: "my-turn", label: "תורי", labelEn: "My turn", asset: "/icon-bank/ui/visual-signs-v95/my-turn.png" },
  { id: "your-turn", label: "תורך", labelEn: "Your turn", asset: "/icon-bank/ui/visual-signs-v95/your-turn.png" },
];

export function localizedSignLabel(sign, language) {
  return language === "en" ? sign.labelEn : sign.label;
}

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.roundRect?.(x, y, width, height, radius);
  if (!context.roundRect) {
    context.moveTo(x + radius, y);
    context.arcTo(x + width, y, x + width, y + height, radius);
    context.arcTo(x + width, y + height, x, y + height, radius);
    context.arcTo(x, y + height, x, y, radius);
    context.arcTo(x, y, x + width, y, radius);
    context.closePath();
  }
}

export function renderVisualSign(sign, language) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = async () => {
      try { await document.fonts?.load("800 64px Rubik"); } catch { /* use fallback font */ }
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 600;
      const context = canvas.getContext("2d");
      context.fillStyle = "#fff";
      roundedRect(context, 12, 12, 576, 576, 52);
      context.fill();
      context.lineWidth = 12;
      context.strokeStyle = "#2f2925";
      context.stroke();
      context.drawImage(image, 82, 42, 436, 436);
      context.direction = language === "en" ? "ltr" : "rtl";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "#2f2925";
      context.font = "800 64px Rubik, Arial, sans-serif";
      context.fillText(localizedSignLabel(sign, language), 300, 530);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = reject;
    image.src = sign.asset;
  });
}
