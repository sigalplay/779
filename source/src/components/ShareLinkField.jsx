import { useTranslator } from "@/lib/language";
import { PHONE_QUERY, useMediaQuery } from "@/lib/use-media-query";

// Read-only field that shows a share link. On a phone it acts as a link: tapping it opens the board.
export function ShareLinkField({ value, className }) {
  const phone = useMediaQuery(PHONE_QUERY);
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
