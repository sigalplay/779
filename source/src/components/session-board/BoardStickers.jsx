import { useEffect, useRef, useState } from "react";
import { Trash2, X } from "lucide-react";

const DRAG_THRESHOLD = 6;

// Where a new sticker appears: the middle of the part of the board that is on screen.
export function stickerStartPosition(board, size, count) {
  if (!board) return { x: 20, y: 20 };
  const rect = board.getBoundingClientRect();
  const visibleTop = Math.max(0, -rect.top);
  const bottomBar = window.innerWidth <= 760 ? 80 : 0;
  const visibleBottom = Math.max(visibleTop + size, Math.min(rect.height, window.innerHeight - bottomBar - rect.top));
  // Side by side from the middle outwards (0, +1, -1, +2, -2 …), as many as fit in a row, then a new row.
  const perRow = Math.max(1, Math.floor(board.clientWidth / (size + 12)));
  const column = count % perRow;
  const step = column === 0 ? 0 : Math.ceil(column / 2) * (column % 2 ? 1 : -1);
  const row = Math.floor(count / perRow);
  const x = board.clientWidth / 2 - size / 2 + step * (size + 12);
  return {
    x: Math.max(0, board.scrollLeft + Math.min(Math.max(0, x), board.clientWidth - size)),
    y: Math.max(0, board.scrollTop + (visibleTop + visibleBottom) / 2 - size / 2 + row * (size + 30)),
  };
}

// Signs and emotions placed on the board as round stickers that can be dragged anywhere. They are
// not saved with the board. A tap shows an × to remove one; while dragging, a bin appears at the
// bottom of the screen and dropping a sticker on it removes it too.
export function BoardStickers({ language, boardRef, stickers, onMove, onRemove }) {
  const t = (he, en) => (language === "en" ? en : he);
  const [selected, setSelected] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [overBin, setOverBin] = useState(false);
  const drag = useRef(null);
  const binRef = useRef(null);

  // A new sticker is brought into view if it landed off screen.
  const count = useRef(stickers.length);
  useEffect(() => {
    if (stickers.length > count.current) {
      const last = stickers[stickers.length - 1];
      boardRef.current?.querySelector(`[data-sticker-uid="${last.uid}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
    count.current = stickers.length;
  }, [stickers, boardRef]);

  useEffect(() => {
    if (!selected) return undefined;
    const clear = (event) => { if (!event.target.closest?.("[data-board-sticker]")) setSelected(null); };
    document.addEventListener("pointerdown", clear);
    return () => document.removeEventListener("pointerdown", clear);
  }, [selected]);

  function isOverBin(event) {
    const rect = binRef.current?.getBoundingClientRect();
    if (!rect) return false;
    const margin = 24;
    return event.clientX >= rect.left - margin && event.clientX <= rect.right + margin && event.clientY >= rect.top - margin && event.clientY <= rect.bottom + margin;
  }

  function pointerDown(event, sticker) {
    if (event.target.closest("[data-remove-sticker]")) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { uid: sticker.uid, startX: event.clientX, startY: event.clientY, origin: { x: sticker.x, y: sticker.y }, moved: false };
  }
  function pointerMove(event) {
    const current = drag.current;
    if (!current) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (!current.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    if (!current.moved) { current.moved = true; setDragging(current.uid); setSelected(null); }
    const board = boardRef.current;
    const size = event.currentTarget.offsetWidth;
    const maxX = board ? board.scrollWidth - size : Infinity;
    const maxY = board ? board.scrollHeight - event.currentTarget.offsetHeight : Infinity;
    onMove(current.uid, {
      x: Math.min(Math.max(0, current.origin.x + dx), maxX),
      y: Math.min(Math.max(0, current.origin.y + dy), maxY),
    });
    setOverBin(isOverBin(event));
  }
  function pointerUp(event) {
    const current = drag.current;
    drag.current = null;
    if (!current) return;
    if (!current.moved) { setSelected((open) => (open === current.uid ? null : current.uid)); return; }
    if (isOverBin(event)) onRemove(current.uid);
    setDragging(null);
    setOverBin(false);
  }

  return (
    <>
      {stickers.map((sticker) => (
        <div
          key={sticker.uid}
          className={["board-sticker", sticker.fill && "board-sticker-fill", dragging === sticker.uid && "dragging", selected === sticker.uid && "selected"].filter(Boolean).join(" ")}
          style={{ left: sticker.x, top: sticker.y }}
          data-board-sticker={sticker.id}
          data-sticker-uid={sticker.uid}
          role="img"
          aria-label={sticker.label}
          onPointerDown={(event) => pointerDown(event, sticker)}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          onPointerCancel={() => { drag.current = null; setDragging(null); setOverBin(false); }}
        >
          <span className="board-sticker-circle"><img src={sticker.image} alt="" draggable="false" /></span>
          <small>{sticker.label}</small>
          {selected === sticker.uid && (
            <button type="button" className="board-sticker-remove" data-remove-sticker="" aria-label={t(`הסרת ${sticker.label} מהלוח`, `Remove ${sticker.label} from the board`)} onClick={() => { setSelected(null); onRemove(sticker.uid); }}>
              <X aria-hidden="true" />
            </button>
          )}
        </div>
      ))}
      {dragging && (
        <div ref={binRef} className={overBin ? "board-sticker-bin over" : "board-sticker-bin"} aria-hidden="true">
          <Trash2 />
        </div>
      )}
    </>
  );
}
