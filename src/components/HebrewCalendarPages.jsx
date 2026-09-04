import { useRef } from "react";
import { MoveDiagonal2 } from "lucide-react";
import { eventsForDay, hebrewRange } from "@/lib/hebrew-calendar";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const EVENT_CLASSES = {
  jewish: "bg-amber-100 text-amber-950",
  muslim: "bg-emerald-100 text-emerald-950",
  christian: "calendar-event-christian",
  education: "bg-rose-100 text-rose-950",
  custom: "bg-violet-100 text-violet-950",
};

function MonthPage({ month, year, settings, title, customEvents, photo, photoTransform, interactive, onDayClick, photoEditable, onPhotoTransformChange, isLast }) {
  const cells = Array(month.days[0]?.weekday || 0).fill(null).concat(month.days);
  while (cells.length % 7) cells.push(null);
  const weekRows = cells.length / 7;

  return (
    <section className={cn("hebrew-calendar-sheet bg-white", !isLast && "hebrew-calendar-break")} dir="rtl">
      <div className="calendar-binding-space" aria-hidden />
      <header className="calendar-sheet-header">
        <img src="/boo-nesahek-logo.png" alt="בואו נשחק" className="calendar-sheet-logo" />
        <div className="calendar-sheet-heading min-w-0 text-center">
          <p className="calendar-sheet-kicker">{title || "לוח השנה המשפחתי שלנו"}</p>
          <h2 className="calendar-sheet-title">{month.name} {month.gregorianYear}</h2>
          <p className="calendar-sheet-range">{hebrewRange(month)}</p>
        </div>
        <div className="calendar-sheet-year" dir="ltr">{year}–{year + 1}</div>
      </header>

      {settings.photoMode === "decorate" ? (
        <div className="calendar-decoration-frame">
          <span className="calendar-decoration-hint">כאן אפשר לצייר, לצבוע ולקשט</span>
        </div>
      ) : photo ? (
        <EditableCalendarPhoto photo={photo} photoTransform={photoTransform} editable={photoEditable} onChange={onPhotoTransformChange} />
      ) : (
        <div className="calendar-photo-placeholder" aria-hidden>
          <span>✦</span><span>החודש שלנו</span><span>✦</span>
        </div>
      )}

      <div className="calendar-grid" style={{ "--calendar-week-rows": weekRows }}>
        {WEEKDAYS.map((day, index) => <div key={day} className={cn("calendar-weekday", index === 6 && "calendar-shabbat")}>{day}</div>)}
        {cells.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="calendar-day calendar-day-empty" />;
          const events = eventsForDay(day, settings, customEvents);
          return (
            <button
              type="button"
              key={day.date}
              disabled={!interactive}
              onClick={() => onDayClick?.(day)}
              className={cn("calendar-day text-right", interactive && "hover:bg-sage/10 focus:outline-none focus:ring-2 focus:ring-sage")}
              title={interactive ? "לחצו להוספת אירוע אישי" : undefined}
            >
              <span className="calendar-hebrew-day">{day.gregorianDay}.{day.gregorianMonth}</span>
              <span className="calendar-gregorian-day">{day.hebrewLabel}</span>
              <span className="calendar-events">
                {events.slice(0, 3).map((event, eventIndex) => (
                  <span key={`${event.label}-${eventIndex}`} className={cn("calendar-event", EVENT_CLASSES[event.type])}>{event.label}</span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <p className="calendar-print-note">* מועדים וחופשות עשויים להשתנות בין מגזרים ומסגרות. מומלץ לוודא מול לוח המסגרת ומשרד החינוך.</p>
      <footer className="calendar-sheet-footer" aria-label="בואו נשחק">
        <img src="/boo-nesahek-logo.png" alt="בואו נשחק" />
      </footer>
    </section>
  );
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function EditableCalendarPhoto({ photo, photoTransform, editable, onChange }) {
  const wrapRef = useRef(null);
  const transform = photoTransform || { scale: 1, x: 0, y: 0 };

  function beginMove(event) {
    if (!editable || event.target.closest(".calendar-photo-resize-handle")) return;
    event.preventDefault();
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const target = event.currentTarget;
    const start = { clientX: event.clientX, clientY: event.clientY, x: transform.x || 0, y: transform.y || 0 };
    target.setPointerCapture(event.pointerId);
    const move = (nextEvent) => onChange?.({
      ...transform,
      x: clamp(start.x + ((nextEvent.clientX - start.clientX) / rect.width) * 100, -70, 70),
      y: clamp(start.y + ((nextEvent.clientY - start.clientY) / rect.height) * 100, -70, 70),
    });
    const finish = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", finish);
      target.removeEventListener("pointercancel", finish);
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", finish);
    target.addEventListener("pointercancel", finish);
  }

  function beginResize(event) {
    if (!editable) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const target = event.currentTarget;
    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const startDistance = Math.hypot(event.clientX - center.x, event.clientY - center.y) || 1;
    const startScale = transform.scale || 1;
    target.setPointerCapture(event.pointerId);
    const move = (nextEvent) => {
      const distance = Math.hypot(nextEvent.clientX - center.x, nextEvent.clientY - center.y);
      onChange?.({ ...transform, scale: clamp(startScale * (distance / startDistance), 0.5, 2.2) });
    };
    const finish = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", finish);
      target.removeEventListener("pointercancel", finish);
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", finish);
    target.addEventListener("pointercancel", finish);
  }

  return (
    <div ref={wrapRef} className={cn("calendar-photo-wrap", editable && "is-editable")} onPointerDown={beginMove}>
          <img
            src={photo}
            alt="תמונה משפחתית"
            data-no-hover-title="true"
            style={{
              "--calendar-photo-scale": photoTransform?.scale ?? 1,
              "--calendar-photo-x": `${photoTransform?.x ?? 0}%`,
              "--calendar-photo-y": `${photoTransform?.y ?? 0}%`,
            }}
          />
      {editable && <><span className="calendar-photo-editor-hint">גררו את התמונה למיקום הרצוי</span><button type="button" className="calendar-photo-resize-handle" aria-label="שינוי גודל התמונה" title="גררו להגדלה או להקטנה" onPointerDown={beginResize}><MoveDiagonal2 className="h-5 w-5" /></button></>}
    </div>
  );
}

export function HebrewCalendarPages({ months, year, settings, title, customEvents = [], sharedPhoto, monthlyPhotos = {}, sharedPhotoTransform, monthlyPhotoTransforms = {}, activeIndex = 0, showAll = false, interactive = false, onDayClick, photoEditable = false, onPhotoTransformChange }) {
  const visible = showAll ? months : months.slice(activeIndex, activeIndex + 1);
  return (
    <div className="hebrew-calendar-pages">
      {visible.map((month, index) => {
        const photo = settings.photoMode === "monthly" ? monthlyPhotos[month.key] : sharedPhoto;
        const photoTransform = settings.photoMode === "monthly" ? monthlyPhotoTransforms[month.key] : sharedPhotoTransform;
        return <MonthPage key={month.key} month={month} year={year} settings={settings} title={title} customEvents={customEvents} photo={photo} photoTransform={photoTransform} interactive={interactive} onDayClick={onDayClick} photoEditable={photoEditable && !showAll} onPhotoTransformChange={onPhotoTransformChange} isLast={index === visible.length - 1} />;
      })}
    </div>
  );
}
