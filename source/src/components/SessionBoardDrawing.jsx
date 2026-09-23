import { useEffect, useRef } from "react";
import { Eraser, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function SessionBoardDrawing({ active, onActiveChange, language = "he" }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const colorRef = useRef("#596bb3");
  const widthRef = useRef(4);
  const erasingRef = useRef(false);
  const text = (hebrew, english) => language === "en" ? english : hebrew;

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const snapshot = canvas.width && canvas.height ? canvas.toDataURL() : null;
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(window.innerWidth * ratio);
    canvas.height = Math.round(window.innerHeight * ratio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (snapshot) {
      const image = new Image();
      image.onload = () => context.drawImage(image, 0, 0, window.innerWidth, window.innerHeight);
      image.src = snapshot;
    }
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  function point(event) {
    return { x: event.clientX, y: event.clientY };
  }

  function start(event) {
    if (!active) return;
    drawingRef.current = true;
    lastPointRef.current = point(event);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event) {
    if (!active || !drawingRef.current) return;
    const next = point(event);
    const previous = lastPointRef.current;
    const context = canvasRef.current.getContext("2d");
    context.globalCompositeOperation = erasingRef.current ? "destination-out" : "source-over";
    context.strokeStyle = colorRef.current;
    context.lineWidth = erasingRef.current ? widthRef.current * 5 : widthRef.current;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(previous.x, previous.y);
    context.lineTo(next.x, next.y);
    context.stroke();
    lastPointRef.current = next;
  }

  function stop() {
    drawingRef.current = false;
    lastPointRef.current = null;
  }

  function clear() {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className={cn("fixed inset-0 z-[70] touch-none", active ? "pointer-events-auto cursor-crosshair" : "pointer-events-none")}
        aria-hidden="true"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerCancel={stop}
      />
      {active && (
        <div className="board-pen-controls fixed left-1/2 top-3 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-full border border-border/70 bg-white/95 p-2 shadow-xl backdrop-blur" role="toolbar" aria-label={text("כלי עט", "Pen tools")}>
          <label className="flex items-center gap-1 text-xs font-bold">
            <span className="sr-only">{text("צבע", "Color")}</span>
            <input type="color" defaultValue={colorRef.current} onChange={(event) => { colorRef.current = event.target.value; erasingRef.current = false; }} className="h-8 w-8 cursor-pointer rounded-full border-0 bg-transparent p-0" />
          </label>
          <label className="flex items-center gap-1 text-xs font-bold">
            <span className="sr-only">{text("עובי", "Width")}</span>
            <input type="range" min="2" max="14" defaultValue={widthRef.current} onChange={(event) => { widthRef.current = Number(event.target.value); }} className="w-20 accent-[#709f89]" />
          </label>
          <button type="button" onClick={() => { erasingRef.current = false; }} className="rounded-full p-2 hover:bg-muted" aria-label={text("עט", "Pen")}><Pencil className="h-4 w-4" /></button>
          <button type="button" onClick={() => { erasingRef.current = true; }} className="rounded-full p-2 hover:bg-muted" aria-label={text("מחק", "Eraser")}><Eraser className="h-4 w-4" /></button>
          <button type="button" onClick={clear} className="rounded-full p-2 hover:bg-muted" aria-label={text("מחיקת הכתיבה", "Clear drawing")}><Trash2 className="h-4 w-4" /></button>
          <button type="button" onClick={() => onActiveChange(false)} className="rounded-full p-2 hover:bg-muted" aria-label={text("סגירת העט", "Close pen")}><X className="h-4 w-4" /></button>
        </div>
      )}
    </>
  );
}
