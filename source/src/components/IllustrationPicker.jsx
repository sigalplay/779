import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Camera, RefreshCw, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslator } from "@/lib/language";
import { readPhotoFile } from "@/lib/session-board-tools";
import { loadIllustrationCatalog, suggestIllustrations } from "@/lib/activity-generator";

// A small "change" mark on a picture, so it is clear that tapping it chooses another.
export function SwapBadge() {
  const { t } = useTranslator();
  return (
    <span className="absolute bottom-1 start-1 inline-flex items-center gap-1 rounded-full border border-border bg-white/95 px-1.5 py-0.5 text-[10px] font-bold text-sage-foreground shadow-sm" aria-hidden="true">
      <RefreshCw className="h-3 w-3" />{t("החלפה", "Change")}
    </span>
  );
}

// Another picture for a material or step: suggestions from the site's catalog, a search, the
// therapist's own photo (unless allowUpload is off, as in the shared bank), or no picture.
// inline renders it in place, for use inside another dialog.
export function IllustrationPicker({ text, kind, title, current, onChoose, onClose, allowUpload = true, inline = false }) {
  const { t } = useTranslator();
  const [catalog, setCatalog] = useState(null);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  useEffect(() => { loadIllustrationCatalog().then(setCatalog); }, []);
  useEffect(() => {
    const onKey = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const suggestions = useMemo(() => (catalog ? suggestIllustrations(catalog, query.trim() || text, kind, 12) : []), [catalog, query, text, kind]);

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      onChoose(await readPhotoFile(file, 700, 0.82));
    } catch {
      toast.error(t("לא הצלחנו לפתוח את התמונה.", "We couldn't open the photo."));
    } finally {
      setUploading(false);
    }
  }

  const body = (
      <div className={inline ? "" : "max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-background p-5 shadow-2xl sm:rounded-3xl"}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-black">{t(`איור ל${title}`, `Picture for ${title}`)}</h2>
            <p className="text-sm text-muted-foreground">{t("איורים מהמאגר שאולי מתאימים:", "Pictures from the site that may fit:")}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t("סגירה", "Close")} className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-muted"><X className="h-5 w-5" aria-hidden="true" /></button>
        </div>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("חיפוש איור, למשל: כדור", "Search, e.g. ball")} aria-label={t("חיפוש איור", "Search pictures")} className="mb-3" />
        {!catalog ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t("טוענת איורים…", "Loading pictures…")}</p>
        ) : suggestions.length ? (
          <div className="grid grid-cols-3 gap-2">
            {suggestions.map((item) => (
              <button key={item.image} type="button" onClick={() => onChoose(item.image)} aria-label={item.label} title={item.label} className={cn("aspect-square overflow-hidden rounded-xl border bg-white p-1", item.image === current ? "border-sage-foreground ring-2 ring-sage-foreground" : "border-border hover:border-primary")}>
                <img src={item.image} alt="" loading="lazy" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">{allowUpload ? t("לא מצאנו איור מתאים. אפשר לחפש מילה אחרת או להעלות תמונה.", "No matching picture. Try another word or upload a photo.") : t("לא מצאנו איור מתאים. אפשר לחפש מילה אחרת.", "No matching picture. Try another word.")}</p>
        )}
        {allowUpload && <>
        <p className="my-3 text-center text-xs text-muted-foreground">{t("או", "or")}</p>
        <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-card font-bold hover:bg-muted">
          <Camera className="h-5 w-5" aria-hidden="true" />{uploading ? t("מכינה תמונה…", "Preparing photo…") : t("העלאת תמונה שלי", "Upload my photo")}
          <input type="file" accept="image/*" onChange={upload} className="sr-only" />
        </label>
        <p className="mt-2 rounded-xl bg-sage/15 px-3 py-2 text-xs text-sage-foreground">{t("רק ציוד וחומרים, בלי תמונות של ילדים. התמונה נשמרת עם הפעילות במכשיר הזה.", "Equipment and materials only, no photos of children. The photo is kept with the activity on this device.")}</p>
        </>}
        {current && <button type="button" onClick={() => onChoose(null)} className="mt-3 w-full rounded-full py-2 text-sm font-semibold text-muted-foreground underline">{t("בלי איור", "No picture")}</button>}
      </div>
  );
  if (inline) return <div role="group" aria-label={t(`איור ל${title}`, `Picture for ${title}`)}>{body}</div>;
  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/40 sm:items-center" role="dialog" aria-modal="true" aria-label={t(`איור ל${title}`, `Picture for ${title}`)} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {body}
    </div>
  );
}
