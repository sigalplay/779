import { ExternalLink, MessageCircle } from "lucide-react";
import { useTranslator } from "@/lib/language";

// Under a share link: open it directly, or send it on WhatsApp, without copying and pasting.
export function ShareLinkActions({ url, message = "" }) {
  const { t } = useTranslator();
  const ready = /^https?:\/\//i.test(String(url || "").trim());
  const text = message ? `${message}\n${url}` : url;
  const base = "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold transition";
  if (!ready) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <a href={url} target="_blank" rel="noopener noreferrer" className={`${base} bg-primary text-primary-foreground hover:opacity-90`}>
        <ExternalLink className="h-4 w-4" aria-hidden="true" />{t("פתיחת הלוח", "Open the board")}
      </a>
      <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className={`${base} border border-[#25d366]/50 bg-[#25d366]/10 text-[#1b7a43] hover:bg-[#25d366]/20`}>
        <MessageCircle className="h-4 w-4" aria-hidden="true" />{t("שליחה בוואטסאפ", "Send on WhatsApp")}
      </a>
    </div>
  );
}
