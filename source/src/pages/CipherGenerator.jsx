import { useEffect, useMemo, useState } from "react";
import { KeyRound, Printer, RotateCcw, House, Sprout, Citrus, Leaf, TreePalm, Star, Grape, Apple, Wheat, Moon, Sun, Link2, Flag, Bird, Flame, Droplet, Flower2, Trees, Cherry, Gift, Sparkles, CloudSun } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslator } from "@/lib/language";

/* ---------- Fixed cipher keys ----------
   Every letter always maps to the same symbol within a given key, so the
   legend table below can be printed once per key and reused across many
   different puzzles. Final letters (ך ם ן ף ץ) share the symbol of their
   base letter. Several keys exist so the same child (or different children)
   can get a fresh-looking puzzle without reusing the exact same mapping. */
const LETTER_ORDER = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ", "ק", "ר", "ש", "ת"];
const ENGLISH_LETTER_ORDER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const CIPHER_KEYS = {
  roshHashanah: {
    label: "מפתח ראש השנה",
    // Avoid near-duplicate emoji variants (two apples, two fish, two breads,
    // several leaves/stars). Some devices render those variants identically.
    symbols: ["🍎", "🍯", "🐝", "🐟", "🍞", "🌾", "🍇", "📯", "🕊️", "💌", "💧", "⭐", "🌙", "☀️", "🌿", "🫙", "👑", "❤️", "🌸", "🕯️", "🐏", "✨"],
  },
  sukkot: {
    label: "מפתח סוכות",
    symbols: Array.from({ length: 22 }, (_, i) => `sukkot-${i + 1}`),
  },
  stars: {
    label: "מפתח כוכבים וצורות",
    symbols: ["☆", "✂", "○", "♦", "✚", "▲", "♣", "☀", "✕", "◆", "♥", "☂", "●", "✎", "▼", "♪", "△", "■", "✦", "☾", "♠", "✿"],
  },
  arrows: {
    label: "מפתח חצים",
    symbols: ["↑", "↓", "←", "→", "↖", "↗", "↘", "↙", "↔", "↕", "⇐", "⇒", "⇑", "⇓", "⇔", "⇕", "↺", "↻", "↚", "↛", "↜", "↝"],
  },
  zodiac: {
    label: "מפתח צורות אחיד",
    symbols: ["○", "●", "□", "■", "△", "▲", "◇", "◆", "☆", "★", "♡", "♥", "♧", "♣", "⬡", "⬢", "⬠", "⬟", "✚", "✕", "✦", "✿"],
  },
};

const ENGLISH_CIPHER_KEYS = {
  shapes: {
    label: "Shapes & Stars",
    symbols: ["○", "●", "□", "■", "△", "▲", "◇", "◆", "☆", "★", "♡", "♥", "♧", "♣", "☀", "☾", "✿", "✦", "✚", "✕", "♪", "♫", "☂", "⚑", "⌂", "∞"],
  },
  arrows: {
    label: "Arrows",
    symbols: ["↑", "↓", "←", "→", "↖", "↗", "↘", "↙", "↔", "↕", "⇐", "⇒", "⇑", "⇓", "⇔", "⇕", "↺", "↻", "↚", "↛", "↜", "↝", "↞", "↠", "↟", "↡"],
  },
  christmas: {
    label: "Christmas",
    symbols: ["🎄", "🎅", "🤶", "🦌", "🛷", "🎁", "🔔", "⭐", "❄️", "☃️", "🧦", "🍪", "🥛", "🍬", "🕯️", "🕊️", "👼", "🌟", "🎶", "❤️", "🌲", "🏠", "🎀", "✨", "🌙", "🧸"],
  },
  easter: {
    label: "Easter",
    symbols: ["🐣", "🐰", "🥚", "🌷", "🌼", "🧺", "🥕", "🦋", "🐝", "🌈", "☀️", "🌿", "🌸", "🐞", "🐑", "🕊️", "💧", "🍫", "🎀", "🌱", "☁️", "💐", "🏡", "⭐", "❤️", "🎨"],
  },
};

const FINAL_TO_BASE = { ך: "כ", ם: "מ", ן: "נ", ף: "פ", ץ: "צ" };

function buildMap(keyId, keys, letterOrder) {
  const symbols = keys[keyId].symbols;
  if (symbols.length !== letterOrder.length || new Set(symbols).size !== letterOrder.length) {
    throw new Error(`Cipher key ${keyId} must contain 22 unique symbols`);
  }
  const map = {};
  letterOrder.forEach((letter, i) => {
    map[letter] = symbols[i];
  });
  return map;
}

function symbolFor(map, letter) {
  const base = FINAL_TO_BASE[letter] || letter;
  return map[base.toUpperCase()] || null;
}

function encode(map, text) {
  return [...text].map((ch) => {
    if (ch === " ") return { ch, symbol: null, isSpace: true };
    const symbol = symbolFor(map, ch);
    return { ch, symbol, isSpace: false };
  });
}

function SukkotSymbol({ number }) {
  const icons = [House, Sprout, Citrus, Leaf, TreePalm, Star, Grape, Apple, Wheat, Moon, Sun, Link2, Flag, Bird, Flame, Droplet, Flower2, Trees, Cherry, Gift, Sparkles, CloudSun];
  const Icon = icons[number - 1] || Star;
  return <Icon className="h-8 w-8 text-[#438466]" strokeWidth={1.9} aria-hidden="true" />;
}

function UniformArrowSymbol({ number }) {
  const direction = ((number - 1) % 8) * 45;
  const variant = Math.floor((number - 1) / 8);
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
      <g transform={`rotate(${direction} 24 24)`} fill="none" stroke="#3f4a45" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 24h30m-8-8 8 8-8 8" strokeDasharray={variant === 2 ? "4 3" : undefined} />
        {variant === 1 && <path d="m17 16-8 8 8 8" />}
        {variant === 2 && <circle cx="12" cy="24" r="2.5" fill="#3f4a45" stroke="none" />}
      </g>
    </svg>
  );
}

function UniformShapeSymbol({ number }) {
  const motif = (number - 1) % 6;
  const group = Math.floor((number - 1) / 6);
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke="#3f4a45" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {motif === 0 && <circle cx="24" cy="24" r="10" />}
        {motif === 1 && <rect x="14" y="14" width="20" height="20" rx="2" />}
        {motif === 2 && <path d="m24 12 12 22H12Z" />}
        {motif === 3 && <path d="m24 11 13 13-13 13-13-13Z" />}
        {motif === 4 && <path d="m24 11 4 9 10 1-8 7 3 10-9-5-9 5 3-10-8-7 10-1Z" />}
        {motif === 5 && <path d="M14 24h20M24 14v20M17 17l14 14M31 17 17 31" />}
      </g>
      {group > 0 && Array.from({ length: group }, (_, i) => <circle key={i} cx={18 + i * 6} cy="42" r="1.7" fill="#3f4a45" />)}
    </svg>
  );
}

function CipherSymbol({ symbol }) {
  if (typeof symbol === "string" && symbol.startsWith("sukkot-")) {
    return <SukkotSymbol number={Number(symbol.split("-")[1])} />;
  }
  if (typeof symbol === "string" && symbol.startsWith("arrow-")) {
    return <UniformArrowSymbol number={Number(symbol.split("-")[1])} />;
  }
  if (typeof symbol === "string" && symbol.startsWith("uniform-shape-")) {
    return <UniformShapeSymbol number={Number(symbol.split("-").at(-1))} />;
  }
  return <span className="text-2xl">{symbol}</span>;
}

export default function CipherGenerator({ mode = "therapist" }) {
  const { language, t } = useTranslator();
  const isEnglish = language === "en";
  const letterOrder = isEnglish ? ENGLISH_LETTER_ORDER : LETTER_ORDER;
  const cipherKeys = isEnglish ? ENGLISH_CIPHER_KEYS : CIPHER_KEYS;
  const defaultTitle = t("היכן הרמז הבא?", "Where is the next clue?");
  const [title, setTitle] = useState(defaultTitle);
  const [word, setWord] = useState("");
  const [keyId, setKeyId] = useState("roshHashanah");

  useEffect(() => {
    const nextKey = isEnglish ? "shapes" : "roshHashanah";
    setKeyId(nextKey);
    setTitle(isEnglish ? "Where is the next clue?" : "היכן הרמז הבא?");
    setWord("");
  }, [isEnglish]);

  const activeKeyId = cipherKeys[keyId] ? keyId : Object.keys(cipherKeys)[0];
  const map = useMemo(() => buildMap(activeKeyId, cipherKeys, letterOrder), [activeKeyId, cipherKeys, letterOrder]);
  const encoded = useMemo(() => encode(map, word.trim()), [map, word]);
  const hasUnknown = encoded.some((c) => !c.isSpace && c.ch && !c.symbol);

  return (
    <AppShell mode={mode}>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sage">
          <KeyRound className="h-5 w-5" />
          <span className="text-sm font-bold">{t("כלי יצירה", "Creative tool")}</span>
        </div>
        <h1 className="mt-1 font-display text-3xl font-black md:text-4xl">{t("מחולל כתב סתרים", "Secret Code Generator")}</h1>
        <p className="mt-1 text-muted-foreground">{t("כתבי מילה או משפט, וקבלי חידת כתב-סתרים מוכנה להדפסה - עם אותו מפתח קבוע בכל פעם.", "Enter a word or sentence and create a printable secret-code puzzle with a consistent key.")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_1.3fr]">
        {/* ---------- Controls ---------- */}
        <section className="print:hidden rounded-3xl border border-border/60 bg-card p-5 md:p-6">
          <h2 className="mb-4 font-display text-lg font-bold">{t("פרטי החידה", "Puzzle details")}</h2>

          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">{t("מפתח הסימנים", "Symbol key")}</label>
          <div className="mb-4 flex flex-wrap gap-2">
            {Object.entries(cipherKeys).map(([id, k]) => (
              <button
                key={id}
                type="button"
                onClick={() => setKeyId(id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  activeKeyId === id ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
          {keyId === "roshHashanah" && (
            <p className="mb-4 rounded-2xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              מפתח חגיגי עם תפוחים, דבש, דבורים, דגים, שיבולים, שופר וסמלי התחדשות. לכל אות נשמר סימן קבוע.
            </p>
          )}
          {keyId === "sukkot" && (
            <p className="mb-4 rounded-2xl bg-emerald-50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              מפתח חגיגי עם סוכה, ארבעת המינים, קישוטים, שרשראות, כוכבים, פירות ועלים. לכל אות נשמר סימן קבוע.
            </p>
          )}
          {isEnglish && ["christmas", "easter"].includes(activeKeyId) && (
            <p className="mb-4 rounded-2xl bg-sky/20 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              {activeKeyId === "christmas"
                ? "A festive Christmas key with 26 different symbols — one for every English letter."
                : "A colourful Easter and spring key with 26 different symbols — one for every English letter."}
            </p>
          )}

          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">{t("כותרת (אופציונלי)", "Title (optional)")}</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={defaultTitle} className="mb-4" />

          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">{t("המילה / המשפט לקידוד", "Word or sentence to encode")}</label>
          <Input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder={t("למשל: קלמר", "For example: SCHOOL")}
            dir={isEnglish ? "ltr" : "rtl"}
            className="mb-2"
          />
          {hasUnknown && (
            <p className="mb-2 text-xs text-primary">
              {t("שימי לב: יש כאן תווים שאינם אותיות עבריות (מספרים/סימנים) - הם יוצגו כמו שהם, בלי קידוד.", "Note: characters that are not English letters (numbers or punctuation) will appear as-is without encoding.")}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={() => window.print()} disabled={!word.trim()} className="rounded-full">
              <Printer className="h-4 w-4" /> {t("הדפסה / שמירה כ-PDF", "Print / Save as PDF")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setWord("");
                setTitle(defaultTitle);
              }}
              className="rounded-full text-muted-foreground"
            >
              <RotateCcw className="h-4 w-4" /> {t("איפוס", "Reset")}
            </Button>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
            {t("טיפ: כל מפתח קבוע ולא משתנה - אפשר להדפיס את מפתח הסימנים למטה פעם אחת לכל ילד/קבוצה, ולהשתמש בו שוב ושוב. כדי לתת למישהו חידה \"טרייה\", פשוט מחליפים למפתח אחר.", "Tip: Each key stays consistent. Print the symbol key once for a child or group and reuse it. Switch keys whenever you want a fresh puzzle.")}
          </p>
        </section>

        {/* ---------- Printable puzzle card ---------- */}
        <section className="rounded-3xl border border-border/60 bg-card p-5 md:p-6 print:rounded-none print:border-none print:p-0">
          <h2 className="mb-5 text-center font-display text-xl font-bold">{title || defaultTitle}</h2>

          {word.trim() ? (
            <div className="mb-8 flex flex-wrap items-end justify-center gap-x-1 gap-y-4">
              {encoded.map((c, i) =>
                c.isSpace ? (
                  <div key={i} className="w-4" />
                ) : (
                  <div key={i} className="flex flex-col items-center gap-1.5 rounded-xl bg-gradient-to-br from-sky/30 to-sage/20 px-2.5 py-2">
                    <CipherSymbol symbol={c.symbol ?? c.ch} />
                  </div>
                ),
              )}
            </div>
          ) : (
            <p className="mb-8 text-center text-sm text-muted-foreground">{t("כתבי מילה בצד כדי לראות כאן את החידה.", "Enter a word to see the puzzle here.")}</p>
          )}

          <h3 className="mb-3 text-center text-sm font-bold text-muted-foreground">{t("טבלה לפיענוח ההודעה:", "Code key:")}</h3>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-11">
            {letterOrder.map((l) => (
              <div
                key={l}
                className="flex flex-col items-center justify-center gap-1 rounded-lg border border-border/60 bg-background py-2"
              >
                <CipherSymbol symbol={map[l]} />
                <span className="text-xs font-bold text-muted-foreground">{l}</span>
              </div>
            ))}
          </div>

          {word.trim() && (
            <>
              <h3 className="mb-3 mt-8 text-center text-sm font-bold text-muted-foreground">{t("כתיבת הפתרון:", "Write the answer:")}</h3>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {encoded.map((c, i) =>
                  c.isSpace ? (
                    <div key={i} className="w-4" />
                  ) : (
                    <div key={i} className="h-9 w-9 rounded-md border-2 border-dashed border-border" />
                  ),
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
