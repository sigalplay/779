import { useEffect, useState } from "react";
import { useTranslator } from "@/lib/language";

const PHONE = "(max-width: 767px)";

function usePhone() {
  const [phone, setPhone] = useState(() => window.matchMedia(PHONE).matches);
  useEffect(() => {
    const query = window.matchMedia(PHONE);
    const update = () => setPhone(query.matches);
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);
  return phone;
}

// Read-only field that shows a share link. On a phone it acts as a link: tapping it opens the board.
export function ShareLinkField({ value, className }) {
  const phone = usePhone();
  const { t } = useTranslator();
  const openable = phone && /^https?:\/\//i.test(String(value || "").trim());
  const open = (event) => {
    event.preventDefault();
    window.location.assign(String(value).trim());
  };
  return (
    <input
      readOnly
      value={value}
      className={openable ? `${className} mobile-openable-board-link` : className}
      onFocus={openable ? undefined : (e) => e.target.select()}
      onClick={openable ? open : undefined}
      onKeyDown={openable ? (e) => (e.key === "Enter" || e.key === " ") && open(e) : undefined}
      role={openable ? "link" : undefined}
      tabIndex={openable ? 0 : undefined}
      title={openable ? t("פתיחת הלוח", "Open the board") : undefined}
      aria-label={openable ? t("פתיחת הקישור ללוח", "Open the board link") : undefined}
    />
  );
}
