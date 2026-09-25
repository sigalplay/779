import { useEffect, useRef } from "react";

// Writing and drawing layer over the session board (inside the <ol>).
// Strokes are stored with points as fractions of the board size, so they stay in place
// when the board is resized; the format matches the live site's saved drawings.
export function BoardCanvas({ boardRef, strokes, onStrokesChange, enabled, tool, color, width, language }) {
  const canvasRef = useRef(null);
  const strokesRef = useRef(strokes);
  const currentRef = useRef(null);
  strokesRef.current = strokes;

  function render() {
    const canvas = canvasRef.current;
    const board = boardRef.current;
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
    const all = currentRef.current ? [...strokesRef.current, currentRef.current] : strokesRef.current;
    all.forEach((stroke) => {
      if (!stroke?.points?.length) return;
      context.save();
      context.globalCompositeOperation = stroke.tool === "eraser" ? "destination-out" : "source-over";
      context.strokeStyle = stroke.color || color;
      context.fillStyle = stroke.color || color;
      context.lineWidth = Number(stroke.width || 4) * (stroke.tool === "eraser" ? 2 : 1);
      context.lineCap = "round";
      context.lineJoin = "round";
      const points = stroke.points.map((point) => ({ x: point.x * rect.width, y: point.y * rect.height }));
      context.beginPath();
      if (points.length === 1) {
        context.arc(points[0].x, points[0].y, context.lineWidth / 2, 0, Math.PI * 2);
        context.fill();
      } else {
        context.moveTo(points[0].x, points[0].y);
        points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
        context.stroke();
      }
      context.restore();
    });
  }

  useEffect(render);
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return undefined;
    const observer = window.ResizeObserver ? new ResizeObserver(() => render()) : null;
    observer?.observe(board);
    window.addEventListener("resize", render);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", render);
    };
  }, []);

  function pointFrom(event) {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
  }

  function start(event) {
    if (!enabled) return;
    event.preventDefault();
    canvasRef.current.setPointerCapture?.(event.pointerId);
    currentRef.current = { tool, color, width, points: [pointFrom(event)] };
    render();
  }

  function move(event) {
    const stroke = currentRef.current;
    if (!enabled || !stroke) return;
    event.preventDefault();
    const point = pointFrom(event);
    const previous = stroke.points[stroke.points.length - 1];
    const rect = canvasRef.current.getBoundingClientRect();
    if (Math.hypot((point.x - previous.x) * rect.width, (point.y - previous.y) * rect.height) < 2) return;
    stroke.points.push(point);
    render();
  }

  function finish() {
    const stroke = currentRef.current;
    if (!stroke) return;
    currentRef.current = null;
    const next = [...strokesRef.current, stroke];
    strokesRef.current = next;
    onStrokesChange(next);
  }

  return (
    <canvas
      ref={canvasRef}
      className={enabled ? "meeting-board-canvas drawing-enabled" : "meeting-board-canvas"}
      aria-label={language === "en" ? "Writing and drawing on the session board" : "כתיבה וציור על לוח המפגש"}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={finish}
      onPointerCancel={finish}
    />
  );
}
