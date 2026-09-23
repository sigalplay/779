import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const SIZE = 480;

function draw(ctx, image, scale, offset, clip = false) {
  ctx.clearRect(0, 0, SIZE, SIZE);
  const base = Math.min(SIZE / image.width, SIZE / image.height) * 0.88;
  const width = image.width * base * scale;
  const height = image.height * base * scale;
  ctx.drawImage(image, SIZE / 2 - width / 2 + offset.x, SIZE / 2 - height / 2 + offset.y, width, height);
  // Keep the full transparent head/neck cutout. The story scene applies the
  // soft integration mask; clipping here created a visible white "sticker".
}

export function PortraitCropper({ source, roleLabel, onCancel, onConfirm }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const dragRef = useRef(null);
  const [scale, setScale] = useState(1.08);
  const [offset, setOffset] = useState({ x: 0, y: 12 });

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) draw(ctx, image, scale, offset);
    };
    image.src = source;
  }, [source]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && imageRef.current) draw(ctx, imageRef.current, scale, offset);
  }, [scale, offset]);

  function startDrag(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, offset };
  }
  function moveDrag(e) {
    if (!dragRef.current) return;
    const ratio = SIZE / e.currentTarget.getBoundingClientRect().width;
    setOffset({
      x: dragRef.current.offset.x + (e.clientX - dragRef.current.x) * ratio,
      y: dragRef.current.offset.y + (e.clientY - dragRef.current.y) * ratio,
    });
  }
  function finish() {
    const output = document.createElement("canvas");
    output.width = SIZE;
    output.height = SIZE;
    draw(output.getContext("2d"), imageRef.current, scale, offset, true);
    onConfirm(output.toDataURL("image/png"));
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-label={`חיתוך תמונת ${roleLabel}`}>
      <div className="w-full max-w-lg rounded-3xl bg-background p-5 shadow-2xl" dir="rtl">
        <h2 className="font-display text-xl font-black">התאמת תמונת {roleLabel}</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">הזיזו והקטינו את התמונה כך שכל הראש, השיער והצוואר יהיו בתוך העיגול.</p>
        <div className="relative mx-auto aspect-square w-full max-w-[390px] touch-none overflow-hidden rounded-2xl bg-[#f3eee6]">
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className="h-full w-full cursor-move"
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={() => { dragRef.current = null; }}
            onPointerCancel={() => { dragRef.current = null; }}
          />
          <div className="pointer-events-none absolute inset-[3%_7%] rounded-[50%] border-4 border-dashed border-white shadow-[0_0_0_999px_rgba(0,0,0,.3)]" />
        </div>
        <label className="mt-4 block text-sm font-semibold">
          גודל התמונה
          <input className="mt-2 w-full accent-primary" type="range" min="0.72" max="1.8" step="0.01" value={scale} onChange={(e) => setScale(Number(e.target.value))} />
        </label>
        <p className="mt-1 text-xs text-muted-foreground">נשמרים שוליים קטנים אוטומטית, כדי שהשיער והצוואר לא ייחתכו בהטמעה.</p>
        <div className="mt-5 flex gap-2">
          <Button type="button" onClick={finish} className="flex-1 rounded-full">אישור ותצוגה מקדימה</Button>
          <Button type="button" onClick={onCancel} variant="outline" className="rounded-full">ביטול</Button>
        </div>
      </div>
    </div>
  );
}
