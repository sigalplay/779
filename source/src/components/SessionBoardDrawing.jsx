import { useEffect, useRef } from "react";
import { Eraser, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

function drawStroke(context, stroke, width, height) {
  if (!stroke?.points?.length) return;
  const points = stroke.points.map((point) => ({ x: point.x * width, y: point.y * height }));
  context.save();
  context.globalCompositeOperation = stroke.tool === "eraser" ? "destination-out" : "source-over";
  context.strokeStyle = stroke.color || "#596bb3";
  context.fillStyle = stroke.color || "#596bb3";
  context.lineWidth = Number(stroke.width || 4) * (stroke.tool === "eraser" ? 2.5 : 1);
  context.lineCap = "round";
  context.lineJoin = "round";
  if (points.length === 1) {
    context.beginPath();
    context.arc(points[0].x, points[0].y, context.lineWidth / 2, 0, Math.PI * 2);
    context.fill();
  } else {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
    context.stroke();
  }
  context.restore();
}

export function SessionBoardDrawing({ active, onActiveChange, language = "he", drawingData = [], onDrawingChange }) {
  const canvasRef = useRef(null);
  const strokesRef = useRef(Array.isArray(drawingData) ? drawingData : []);
  const activeStrokeRef = useRef(null);
  const colorRef = useRef("#596bb3");
  const widthRef = useRef(4);
  const toolRef = useRef("pen");
  const text = (hebrew, english) => language === "en" ? english : hebrew;

  function render() {
    const canvas = canvasRef.current;
    const board = canvas?.parentElement;
    if (!canvas || !board) return;
    const rect = board.getBoundingClientRect();
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    const nextWidth = Math.max(1, Math.round(rect.width * ratio));
    const nextHeight = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    }
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    strokesRef.current.forEach((stroke) => drawStroke(context, stroke, rect.width, rect.height));
  }

  useEffect(() => {
    strokesRef.current = Array.isArray(drawingData) ? drawingData : [];
    render();
  }, [drawingData]);

  useEffect(() => {
    render();
    const board = canvasRef.current?.parentElement;
    const observer = board && window.ResizeObserver ? new ResizeObserver(render) : null;
    if (board && observer) observer.observe(board);
    window.addEventListener("resize", render);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", render);
    };
  }, []);

  function point(event) {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
  }

  function start(event) {
    if (!active) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const stroke = { tool: toolRef.current, color: colorRef.current, width: widthRef.current, points: [point(event)] };
    strokesRef.current = [...strokesRef.current, stroke];
    activeStrokeRef.current = stroke;
    render();
  }

  function move(event) {
    const stroke = activeStrokeRef.current;
    if (!active || !stroke) return;
    event.preventDefault();
    const next = point(event);
    const previous = stroke.points[stroke.points.length - 1];
    const rect = canvasRef.current.getBoundingClientRect();
    if (Math.hypot((next.x - previous.x) * rect.width, (next.y - previous.y) * rect.height) < 2) return;
    stroke.points.push(next);
    render();
  }

  function stop() {
    if (!activeStrokeRef.current) return;
    activeStrokeRef.current = null;
    onDrawingChange?.(strokesRef.current.map((stroke) => ({ ...stroke, points: stroke.points.map((point) => ({ ...point })) })));
  }

  function clear() {
    if (!strokesRef.current.length || !window.confirm(text("למחוק את כל הכתיבה מהלוח?", "Clear all drawing from the board?"))) return;
    strokesRef.current = [];
    render();
    onDrawingChange?.([]);
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className={cn("absolute inset-0 z-30 touch-none", active ? "pointer-events-auto cursor-crosshair" : "pointer-events-none")}
        aria-label={text("כתיבה וציור על לוח המפגש", "Writing and drawing on the session board")}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerCancel={stop}
      />
      {active && (
        <div className="board-pen-controls fixed left-1/2 top-3 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-full border border-border/70 bg-white/95 p-2 shadow-xl backdrop-blur" role="toolbar" aria-label={text("כלי עט", "Pen tools")}>
          <label className="flex items-center gap-1 text-xs font-bold">
            <span className="sr-only">{text("צבע", "Color")}</span>
            <input type="color" defaultValue={colorRef.current} onChange={(event) => { colorRef.current = event.target.value; toolRef.current = "pen"; }} className="h-8 w-8 cursor-pointer rounded-full border-0 bg-transparent p-0" />
          </label>
          <label className="flex items-center gap-1 text-xs font-bold">
            <span className="sr-only">{text("עובי", "Width")}</span>
            <input type="range" min="2" max="14" defaultValue={widthRef.current} onChange={(event) => { widthRef.current = Number(event.target.value); }} className="w-20 accent-[#709f89]" />
          </label>
          <button type="button" onClick={() => { toolRef.current = "pen"; }} className="rounded-full p-2 hover:bg-muted" aria-label={text("עט", "Pen")}><Pencil className="h-4 w-4" /></button>
          <button type="button" onClick={() => { toolRef.current = "eraser"; }} className="rounded-full p-2 hover:bg-muted" aria-label={text("מחק", "Eraser")}><Eraser className="h-4 w-4" /></button>
          <button type="button" onClick={clear} className="rounded-full p-2 hover:bg-muted" aria-label={text("מחיקת הכתיבה", "Clear drawing")}><Trash2 className="h-4 w-4" /></button>
          <button type="button" onClick={() => onActiveChange(false)} className="rounded-full p-2 hover:bg-muted" aria-label={text("סגירת העט", "Close pen")}><X className="h-4 w-4" /></button>
        </div>
      )}
    </>
  );
}
