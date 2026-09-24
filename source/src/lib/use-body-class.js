import { useEffect } from "react";

// מוסיף מחלקה ל-body כל עוד הרכיב מוצג (משמש את ה-CSS הייעודי לעמוד).
export function useBodyClass(className, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    document.body.classList.add(className);
    return () => document.body.classList.remove(className);
  }, [className, active]);
}
