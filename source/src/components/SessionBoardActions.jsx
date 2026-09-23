import { useRef } from "react";
import { Camera, Maximize2, Minimize2, Plus, Route } from "lucide-react";
import { Link } from "react-router-dom";

export function SessionBoardActions({
  language = "he",
  addActivityHref,
  motorTrailHref,
  onPhotoFile,
  fullscreenActive = false,
  onToggleFullscreen,
}) {
  const photoInputRef = useRef(null);
  const text = (hebrew, english) => language === "en" ? english : hebrew;
  const FullscreenIcon = fullscreenActive ? Minimize2 : Maximize2;

  return (
    <section className="mb-6" aria-label={text("פעולות לוח המפגש", "Session board actions")}>
      <div className="grid grid-cols-2 gap-3">
        <Link to={addActivityHref} className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-3xl border border-[#8bcbb0] bg-[#ccebdc] p-4 text-center font-bold text-[#285a48] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <Plus className="h-10 w-10" strokeWidth={2.5} />
          <span>{text("הוספת פעילות ללוח המפגש", "Add an activity to the session board")}</span>
        </Link>
        <Link to={motorTrailHref} className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-3xl border border-border bg-white p-4 text-center font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <Route className="h-10 w-10" strokeWidth={2.25} />
          <span>{text("הוספת מסלול מוטורי", "Add a motor trail")}</span>
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:flex sm:justify-center">
        <button type="button" onClick={() => photoInputRef.current?.click()} className="flex min-h-20 items-center justify-center gap-3 rounded-2xl border border-border bg-white px-5 font-bold shadow-sm hover:bg-muted sm:min-w-48">
          <Camera className="h-7 w-7" />
          <span>{text("הוספת תמונה", "Add a photo")}</span>
        </button>
        <button type="button" onClick={onToggleFullscreen} aria-pressed={fullscreenActive} className="flex min-h-20 items-center justify-center gap-3 rounded-2xl border border-border bg-white px-5 font-bold shadow-sm hover:bg-muted sm:min-w-48">
          <FullscreenIcon className="h-7 w-7" />
          <span>{fullscreenActive ? text("יציאה ממסך מלא", "Exit full screen") : text("מסך מלא", "Full screen")}</span>
        </button>
      </div>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={onPhotoFile}
        aria-label={text("צילום או בחירת תמונה", "Take or choose a photo")}
      />
    </section>
  );
}
