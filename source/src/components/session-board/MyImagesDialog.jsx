import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { deleteMyImage, listMyImages, uploadMyImage } from "@/lib/my-images-cloud";
import { hasCloudSession } from "@/lib/session-board-cloud";
import { readPhotoFile } from "@/lib/session-board-tools";

// "My images": the therapist's own photos (games, equipment). Upload a photo and name it, tap one to
// add it to the board, or delete it. Saved in her account, so they appear on every device.
export function MyImagesDialog({ language, returnUrl, onAdd, onClose, onChanged }) {
  const t = (he, en) => (language === "en" ? en : he);
  const signedIn = hasCloudSession();
  const [state, setState] = useState(signedIn ? "loading" : "signed-out");
  const [images, setImages] = useState([]);
  const [draft, setDraft] = useState(null); // { dataUrl, name }
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!signedIn) return undefined;
    let cancelled = false;
    listMyImages()
      .then((rows) => { if (!cancelled) { setImages(rows); setState("ready"); } })
      .catch(() => { if (!cancelled) setState("error"); });
    return () => { cancelled = true; };
  }, [signedIn]);

  async function fileChosen(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await readPhotoFile(file, 900, 0.82);
      setDraft({ dataUrl, name: file.name.replace(/\.[^.]+$/, "").slice(0, 40) });
      setMessage("");
    } catch {
      setMessage(t("לא הצלחנו לקרוא את התמונה. נסי תמונה אחרת.", "We could not read that image. Try another one."));
    }
  }

  async function save(event) {
    event.preventDefault();
    const name = draft.name.trim();
    if (!name) return;
    setBusy(true);
    try {
      const image = await uploadMyImage(name, draft.dataUrl);
      const next = [image, ...images];
      setImages(next);
      onChanged?.(next);
      setDraft(null);
    } catch {
      setMessage(t("השמירה נכשלה. נסי שוב.", "Saving failed. Please try again."));
    }
    setBusy(false);
  }

  async function remove(image) {
    setBusy(true);
    try {
      await deleteMyImage(image);
      const next = images.filter((item) => item.id !== image.id);
      setImages(next);
      onChanged?.(next);
      setConfirmDelete(null);
    } catch {
      setMessage(t("המחיקה נכשלה. נסי שוב.", "Deleting failed. Please try again."));
    }
    setBusy(false);
  }

  return (
    <div className="choice-board" role="dialog" aria-modal="true" aria-label={t("התמונות שלי", "My images")}>
      <div className="choice-board-card">
        <button type="button" className="choice-board-close" onClick={onClose} aria-label={t("סגירה", "Close")}><X /></button>
        <h2>{t("התמונות שלי", "My images")}</h2>

        {state === "signed-out" && (
          <>
            <p className="choice-board-hint">{t("התחברי כדי לשמור תמונות משלך ולהשתמש בהן בכל מכשיר.", "Sign in to save your own images and use them on any device.")}</p>
            <div className="choice-board-actions"><Link className="choice-link" to={`/auth?mode=login&redirect=${encodeURIComponent(returnUrl)}`}>{t("התחברות", "Sign in")}</Link></div>
          </>
        )}
        {state === "loading" && <p className="choice-board-hint">{t("טוענת את התמונות…", "Loading your images…")}</p>}
        {state === "error" && <p className="choice-board-hint">{t("לא הצלחנו לטעון את התמונות. ייתכן שצריך להתחבר מחדש.", "We could not load your images. You may need to sign in again.")}</p>}

        {state === "ready" && (
          <>
            <p className="my-images-note">{t("יש להעלות רק תמונות של משחקים, ציוד וחומרים, בלי ילדים ובלי פרטים מזהים.", "Upload only photos of games, equipment and materials, with no children and no identifying details.")}</p>

            {draft ? (
              <form className="my-images-draft" onSubmit={save}>
                <img src={draft.dataUrl} alt="" />
                <label className="my-images-name"><span>{t("שם התמונה", "Image name")}</span>
                  <input value={draft.name} maxLength={40} required onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder={t("למשל: ג'נגה", "For example: Jenga")} />
                </label>
                <div className="choice-board-actions">
                  <button type="submit" className="choice-primary" disabled={busy || !draft.name.trim()}>{busy ? t("שומרת…", "Saving…") : t("שמירה", "Save")}</button>
                  <button type="button" onClick={() => setDraft(null)}>{t("ביטול", "Cancel")}</button>
                </div>
              </form>
            ) : (
              <div className="choice-board-options">
                <button type="button" className="choice-option my-images-upload" onClick={() => fileRef.current?.click()}>
                  <span className="choice-option-image"><ImagePlus /></span>
                  <span className="choice-option-title">{t("העלאת תמונה", "Upload an image")}</span>
                </button>
                {images.map((image) => (
                  <div key={image.id} className="my-images-item">
                    <button type="button" className="choice-option" onClick={() => onAdd(image)} title={t("הוספה ללוח", "Add to the board")}>
                      <span className="choice-option-image">{image.url ? <img src={image.url} alt="" /> : null}</span>
                      <span className="choice-option-title">{image.name}</span>
                    </button>
                    {confirmDelete === image.id ? (
                      <div className="my-images-confirm">
                        <button type="button" disabled={busy} onClick={() => remove(image)}>{t("מחיקה", "Delete")}</button>
                        <button type="button" onClick={() => setConfirmDelete(null)}>{t("ביטול", "Cancel")}</button>
                      </div>
                    ) : (
                      <button type="button" className="my-images-delete" onClick={() => setConfirmDelete(image.id)} aria-label={t(`מחיקת ${image.name}`, `Delete ${image.name}`)}><Trash2 /></button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {!draft && images.length > 0 && <p className="choice-board-hint">{t("לחיצה על תמונה מוסיפה אותה ללוח.", "Tap an image to add it to the board.")}</p>}
            {message && <p className="my-images-error" role="alert">{message}</p>}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={fileChosen} />
          </>
        )}
      </div>
    </div>
  );
}
