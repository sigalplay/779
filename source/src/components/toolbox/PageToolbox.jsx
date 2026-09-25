import { useEffect, useRef, useState } from "react";
import { Pencil, Timer } from "lucide-react";
import { TherapistPostureScissorsTips } from "@/components/TherapistPostureScissorsTips";
import { VisualSessionTimer } from "@/components/VisualSessionTimer";
import { useTranslator } from "@/lib/language";
import { PenBar } from "./PenBar";
import { Toolbox, tipTools } from "./Toolbox";

// The toolbox on activity, recipe and planning pages: timer, a pen for writing on the page,
// and the sitting / cutting / writing / coloring tips. The writing is not saved: it is gone
// when the page is left.
export function PageToolbox({ showScissors = true }) {
  const { language } = useTranslator();
  const t = (he, en) => (language === "en" ? en : he);
  const [timerOpen, setTimerOpen] = useState(false);
  const [tipPanel, setTipPanel] = useState(null);
  const [penEnabled, setPenEnabled] = useState(false);
  const [penTool, setPenTool] = useState("pen");
  const [penColor, setPenColor] = useState("#5a67a8");
  const [strokes, setStrokes] = useState([]);

  const pen = {
    tool: penTool,
    setTool: setPenTool,
    color: penColor,
    setColor: setPenColor,
    setEnabled: setPenEnabled,
    onClear: () => setStrokes([]),
  };

  const tools = [
    { id: "timer", color: "#bcdcf2", icon: <Timer />, label: t("טיימר", "Timer"), onSelect: () => { setPenEnabled(false); setTimerOpen(true); } },
    { id: "pen", color: "#f6c3b5", icon: <Pencil />, label: t("עט", "Pen"), onSelect: () => { setPenTool("pen"); setPenEnabled(true); } },
    ...tipTools(language, (panel) => { setPenEnabled(false); setTipPanel(panel); }, { showScissors }),
  ];

  return (
    <div className="print:hidden">
      <PageDrawingLayer strokes={strokes} onStrokesChange={setStrokes} enabled={penEnabled} tool={penTool} color={penColor} language={language} />
      <Toolbox language={language} tools={tools} storageKey="boo_page_tools_position" hidden={Boolean(tipPanel)} />
      {penEnabled && <PenBar language={language} pen={pen} />}
      <VisualSessionTimer language={language} open={timerOpen} onOpenChange={setTimerOpen} hideTrigger />
      <TherapistPostureScissorsTips language={language} openPanel={tipPanel} onOpenPanelChange={setTipPanel} />
    </div>
  );
}

// Writing over the whole page. The canvas covers the screen; strokes are kept in page coordinates,
// so they scroll with the page.
function PageDrawingLayer({ strokes, onStrokesChange, enabled, tool, color, language }) {
  const canvasRef = useRef(null);
  const strokesRef = useRef(strokes);
  const currentRef = useRef(null);
  strokesRef.current = strokes;

  function render() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, -window.scrollX * ratio, -window.scrollY * ratio);
    context.clearRect(window.scrollX, window.scrollY, width, height);
    const all = currentRef.current ? [...strokesRef.current, currentRef.current] : strokesRef.current;
    all.forEach((stroke) => {
      context.save();
      context.globalCompositeOperation = stroke.tool === "eraser" ? "destination-out" : "source-over";
      context.strokeStyle = stroke.color;
      context.fillStyle = stroke.color;
      context.lineWidth = stroke.tool === "eraser" ? 24 : 4;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.beginPath();
      if (stroke.points.length === 1) {
        context.arc(stroke.points[0].x, stroke.points[0].y, context.lineWidth / 2, 0, Math.PI * 2);
        context.fill();
      } else {
        context.moveTo(stroke.points[0].x, stroke.points[0].y);
        stroke.points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
        context.stroke();
      }
      context.restore();
    });
  }

  useEffect(render);
  useEffect(() => {
    window.addEventListener("scroll", render, { passive: true });
    window.addEventListener("resize", render);
    return () => {
      window.removeEventListener("scroll", render);
      window.removeEventListener("resize", render);
    };
  }, []);

  const pointFrom = (event) => ({ x: event.clientX + window.scrollX, y: event.clientY + window.scrollY });

  function start(event) {
    if (!enabled) return;
    event.preventDefault();
    canvasRef.current.setPointerCapture?.(event.pointerId);
    currentRef.current = { tool, color, points: [pointFrom(event)] };
    render();
  }
  function move(event) {
    const stroke = currentRef.current;
    if (!enabled || !stroke) return;
    event.preventDefault();
    const point = pointFrom(event);
    const previous = stroke.points[stroke.points.length - 1];
    if (Math.hypot(point.x - previous.x, point.y - previous.y) < 2) return;
    stroke.points.push(point);
    render();
  }
  function finish() {
    const stroke = currentRef.current;
    if (!stroke) return;
    currentRef.current = null;
    onStrokesChange([...strokesRef.current, stroke]);
  }

  if (!enabled && !strokes.length) return null;
  return (
    <canvas
      ref={canvasRef}
      className={enabled ? "page-drawing-layer drawing-enabled" : "page-drawing-layer"}
      aria-label={language === "en" ? "Writing and drawing on the page" : "כתיבה וציור על הדף"}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={finish}
      onPointerCancel={finish}
    />
  );
}
