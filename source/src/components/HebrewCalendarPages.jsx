import { useRef } from "react";
import { eventLabel, eventsForDay, hebrewRange, monthName, WEEKDAYS_EN, WEEKDAYS_HE } from "@/lib/hebrew-calendar";
import { cn } from "@/lib/utils";

const EVENT_CLASSES = {
  jewish: "bg-amber-100 text-amber-950",
  muslim: "bg-emerald-100 text-emerald-950",
  christian: "calendar-event-christian",
  education: "bg-rose-100 text-rose-950",
  custom: "bg-violet-100 text-violet-950",
};

export const MAX_CALENDAR_PHOTOS = 5;

// Starting position of a new photo, in percent of the photo area. Up to five photos
// are spread over the corners and the middle, shaped by the photo's orientation.
export function initialPhotoBox(photo, index) {
  const ratio = (photo.naturalWidth || 1) / Math.max(photo.naturalHeight || 1, 1);
  let w = 30;
  let h = 30;
  if (ratio > 1.12) { w = 43; h = 27; } else if (ratio < 0.89) { w = 25; h = 43; }
  const positions = [[4, 6], [53, 6], [4, 53], [53, 53], [29, 29]];
  const [x, y] = positions[index] || positions[0];
  return { x: Math.min(x, 100 - w), y: Math.min(y, 100 - h), w, h };
}

function MonthPage({ month, monthIndex, year, settings, title, customEvents, photos, language, interactive, onDayClick, dayState, photoEditable, selectedPhotoId, onSelectPhoto, onPhotoChange, isLast }) {
  const english = language === "en";
  const cells = Array(month.days[0]?.weekday || 0).fill(null).concat(month.days);
  while (cells.length % 7) cells.push(null);
  const weekRows = cells.length / 7;
  const brand = english ? "boo nesahek Let's Play" : "בואו נשחק";
  const logo = english ? "/boo-nesahek-logo-en.png" : "/boo-nesahek-logo.png";

  return (
    <section className={cn("hebrew-calendar-sheet bg-white", !isLast && "hebrew-calendar-break")} dir={english ? "ltr" : "rtl"}>
      <div className="calendar-binding-space" aria-hidden />
      <header className="calendar-sheet-header">
        <img src={logo} alt={brand} className="calendar-sheet-logo" />
        <div className="calendar-sheet-heading min-w-0 text-center">
          <p className="calendar-sheet-kicker">{title || (english ? "Our family calendar" : "לוח השנה המשפחתי שלנו")}</p>
          <h2 className="calendar-sheet-title">{monthName(month, language)} {month.gregorianYear}</h2>
          {/* In English the Hebrew dates are not shown. */}
          {!english && <p className="calendar-sheet-range">{hebrewRange(month)}</p>}
        </div>
        <div className="calendar-sheet-year" dir="ltr">{year}–{year + 1}</div>
      </header>

      {settings.photoMode === "decorate" ? (
        <div className="calendar-decoration-frame">
          <span className="calendar-decoration-hint">{english ? "Draw, color, and decorate here" : "כאן אפשר לצייר, לצבוע ולקשט"}</span>
        </div>
      ) : photos?.length ? (
        <CalendarPhotos photos={photos} editable={photoEditable} selectedId={selectedPhotoId} onSelect={onSelectPhoto} onChange={onPhotoChange} english={english} />
      ) : (
        <div className="calendar-photo-placeholder" aria-hidden>
          <span>✦</span><span>{english ? "Our month" : "החודש שלנו"}</span><span>✦</span>
        </div>
      )}

      <div className="calendar-grid" style={{ "--calendar-week-rows": weekRows }}>
        {(english ? WEEKDAYS_EN : WEEKDAYS_HE).map((day, index) => (
          <div key={day} className={cn("calendar-weekday", `calendar-col-${index}`, index === 6 && "calendar-shabbat")}>{day}</div>
        ))}
        {cells.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className={cn("calendar-day calendar-day-empty", `calendar-col-${index % 7}`)} />;
          const events = eventsForDay(day, settings, customEvents);
          const state = dayState?.(day, monthIndex);
          return (
            <button
              type="button"
              key={day.date}
              disabled={!interactive}
              onClick={() => onDayClick?.(day, monthIndex)}
              className={cn("calendar-day", english ? "text-left" : "text-right", `calendar-col-${index % 7}`, interactive && !dayState && "hover:bg-sage/10 focus:outline-none focus:ring-2 focus:ring-sage", state?.className)}
              title={interactive ? state?.title ?? (english ? "Click to add a personal event" : "לחצו להוספת אירוע אישי") : undefined}
              aria-pressed={state?.pressed}
            >
              <span className="calendar-hebrew-day">{day.gregorianDay}.{day.gregorianMonth}</span>
              {!english && <span className="calendar-gregorian-day">{day.hebrewLabel}</span>}
              <span className="calendar-events">
                {events.slice(0, 3).map((event, eventIndex) => (
                  <span key={`${event.label}-${eventIndex}`} className={cn("calendar-event", EVENT_CLASSES[event.type])}>{eventLabel(event, language)}</span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <p className="calendar-print-note">
        {english
          ? "* Dates and holidays may vary between communities and settings. Please check with your child's setting and the Ministry of Education."
          : "* מועדים וחופשות עשויים להשתנות בין מגזרים ומסגרות. מומלץ לוודא מול לוח המסגרת ומשרד החינוך."}
      </p>
      <footer className="calendar-sheet-footer" aria-label={brand}>
        <img src={logo} alt={brand} />
        <p>
          {english
            ? "© Let’s Play. All rights reserved. The content here is for enrichment and practice only. It is not a diagnosis, personal therapeutic advice, or a substitute for evaluation, consultation, or treatment by a qualified professional."
            : "© בואו נשחק. כל הזכויות שמורות. התכנים נועדו להעשרה ולתרגול בלבד ואינם מהווים אבחון, המלצה טיפולית אישית או תחליף להערכה, לייעוץ או לטיפול של איש מקצוע מוסמך."}
        </p>
      </footer>
    </section>
  );
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Up to five photos in the top area. In the preview each photo can be selected,
// dragged, and resized from its corner handle. Positions are percentages, so the
// printed page matches the preview.
function CalendarPhotos({ photos, editable, selectedId, onSelect, onChange, english }) {
  const stageRef = useRef(null);

  function begin(event, photo, mode) {
    if (!editable || (event.button !== undefined && event.button !== 0)) return;
    event.preventDefault();
    event.stopPropagation();
    onSelect?.(photo.id);
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const target = event.currentTarget;
    const start = { x: event.clientX, y: event.clientY, box: { x: photo.x, y: photo.y, w: photo.w, h: photo.h } };
    try { target.setPointerCapture(event.pointerId); } catch { /* not supported */ }
    let frame = 0;
    let latest = null;
    const move = (next) => {
      if (next.pointerId !== event.pointerId) return;
      next.preventDefault();
      const dx = ((next.clientX - start.x) / rect.width) * 100;
      const dy = ((next.clientY - start.y) / rect.height) * 100;
      const { box } = start;
      latest = mode === "move"
        ? { x: clamp(box.x + dx, 0, 100 - box.w), y: clamp(box.y + dy, 0, 100 - box.h) }
        : { w: clamp(box.w + dx, 12, 100 - box.x), h: clamp(box.h + dy, 15, 100 - box.y) };
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; onChange?.(photo.id, latest); });
    };
    const finish = (next) => {
      if (next.pointerId !== event.pointerId) return;
      if (frame) cancelAnimationFrame(frame);
      if (latest) onChange?.(photo.id, latest);
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", finish);
      target.removeEventListener("pointercancel", finish);
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", finish);
    target.addEventListener("pointercancel", finish);
  }

  return (
    <div className={cn("calendar-photo-wrap", editable && "is-editable")}>
      <div ref={stageRef} className="calendar-multi-photo-stage">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className={cn("calendar-multi-photo-item", editable && photo.id === selectedId && "is-selected")}
            style={{ left: `${photo.x}%`, top: `${photo.y}%`, width: `${photo.w}%`, height: `${photo.h}%` }}
            onPointerDown={(event) => begin(event, photo, "move")}
          >
            <img src={photo.src} alt={english ? `Calendar photo ${index + 1}` : `תמונה ${index + 1} ללוח השנה`} data-no-hover-title="true" />
            {editable && (
              <span
                className="calendar-multi-photo-resize"
                role="presentation"
                aria-label={english ? "Resize photo" : "שינוי גודל התמונה"}
                onPointerDown={(event) => begin(event, photo, "resize")}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HebrewCalendarPages({
  months,
  year,
  settings,
  title,
  customEvents = [],
  sharedPhotos = [],
  monthlyPhotos = {},
  activeIndex = 0,
  showAll = false,
  interactive = false,
  onDayClick,
  dayState,
  photoEditable = false,
  selectedPhotoId,
  onSelectPhoto,
  onPhotoChange,
  language = "he",
}) {
  const visible = showAll ? months : months.slice(activeIndex, activeIndex + 1);
  return (
    <div className="hebrew-calendar-pages">
      {visible.map((month, index) => (
        <MonthPage
          key={month.key}
          month={month}
          monthIndex={showAll ? index : activeIndex}
          year={year}
          settings={settings}
          title={title}
          customEvents={customEvents}
          photos={settings.photoMode === "monthly" ? monthlyPhotos[month.key] : sharedPhotos}
          language={language}
          interactive={interactive}
          onDayClick={onDayClick}
          dayState={dayState}
          photoEditable={photoEditable && !showAll}
          selectedPhotoId={selectedPhotoId}
          onSelectPhoto={onSelectPhoto}
          onPhotoChange={onPhotoChange}
          isLast={index === visible.length - 1}
        />
      ))}
    </div>
  );
}
