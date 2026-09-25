import { useEffect, useRef } from "react";

// Shows the photo that is about to be added to the session board.
export function BoardPhotoPreview({ image, language, onConfirm, onRepick, onCancel }) {
  const t = (he, en) => (language === "en" ? en : he);
  const confirmRef = useRef(null);
  useEffect(() => { confirmRef.current?.focus(); }, []);
  return (
    <div
      className="board-photo-preview"
      data-board-photo-preview="true"
      role="dialog"
      aria-modal="true"
      aria-label={t("תצוגה מקדימה של התמונה", "Photo preview")}
      onClick={(event) => { if (event.target === event.currentTarget) onCancel(); }}
    >
      <div className="board-photo-preview-card">
        <h2>{t("התמונה שתתווסף ללוח", "Photo to add to the board")}</h2>
        <img src={image} alt={t("תצוגה מקדימה", "Preview")} />
        <div>
          <button ref={confirmRef} type="button" data-confirm-photo="" onClick={onConfirm}>{t("הוספה ללוח", "Add to board")}</button>
          <button type="button" data-repick-photo="" onClick={onRepick}>{t("צילום או בחירה מחדש", "Take or choose another photo")}</button>
          <button type="button" data-cancel-photo="" onClick={onCancel}>{t("ביטול", "Cancel")}</button>
        </div>
      </div>
    </div>
  );
}
