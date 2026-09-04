import { Link } from "react-router-dom";
import { Dices, Clock, Layers } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BOARD_GAMES } from "@/lib/board-games-data";
import { BOARD_GAMES_EN } from "@/lib/board-games-en";
import { useTranslator } from "@/lib/language";

export default function BoardGames({ mode = "therapist" }) {
  const { language, t } = useTranslator();
  const display = (game) => language === "en" ? { ...game, ...(BOARD_GAMES_EN[game.id] || {}) } : game;
  return (
    <AppShell mode={mode}>
      <div className="mb-6 flex items-center gap-2 text-sage">
        <Dices className="h-5 w-5" />
        <span className="text-sm font-bold">משחקי קופסא</span>
      </div>
      <h1 className="mb-1 font-display text-3xl font-black md:text-4xl">משחקי קופסא</h1>
      <p className="mb-6 text-muted-foreground">משחקים קלאסיים עם אביזרים, שלבים, וטיפים להקלה ולהקשיה - בדיוק כמו הפעילויות.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BOARD_GAMES.map((original) => { const g = display(original); return (
          <Link
            key={g.id}
            to={`/board-game/${g.id}${mode === "parent" ? "?mode=parent" : ""}`}
            className="group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-40 items-center justify-center overflow-hidden bg-white p-3">
              {g.image ? (
                <img src={g.image} alt={t(`איור של המשחק ${original.title}`, `Illustration for ${g.title}`)} title={t(`${original.title} — משחק לילדים מבואו נשחק`, `${g.title} — a Let's Play game for children`)} data-seo-name={t(`${original.title} משחק לילדים`, `${g.title} game for children`)} className="h-full w-full object-contain" />
              ) : (
                <span className="text-7xl leading-none drop-shadow-md">{g.emoji}</span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h2 className="font-display text-lg font-bold">{g.title}</h2>
              {g.short_description && <p className="mt-1 flex-1 text-sm text-muted-foreground">{g.short_description}</p>}
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                  {t("גיל", "Age")} {g.age_min}–{g.age_max}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                  <Clock className="h-3 w-3" /> {g.duration_min} {t("דק'", "min")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-warm px-2 py-1 text-foreground/80">
                  <Layers className="h-3 w-3" /> {g.difficulty === "easy" ? t("קל", "Easy") : g.difficulty === "medium" ? t("בינוני", "Medium") : t("מתקדם", "Advanced")}
                </span>
              </div>
            </div>
          </Link>
        )})}
      </div>
    </AppShell>
  );
}
