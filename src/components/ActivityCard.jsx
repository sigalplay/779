import { Link } from "react-router-dom";
import { Clock, Layers, Heart, ListPlus, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { isFavorite, isSignedIn, toggleFavorite, addToDraftPlan } from "@/lib/storage";
import { toast } from "sonner";
import { useState } from "react";
import { activityEmoji } from "@/lib/activity-emoji";
import { getActivityDurationShortLabel } from "@/lib/activity-duration";
import { activityHero } from "@/lib/activity-icons";
import { useTranslator } from "@/lib/language";
import { activityTitle } from "@/lib/content-translations";

const DIFFICULTY_LABEL = {
  easy: "קל",
  medium: "בינוני",
  hard: "מתקדם",
};

export function ActivityCard({ activity, index = 0, mode, returnPath, returnLabel }) {
  const { language, t } = useTranslator();
  const title = activityTitle(activity, language);
  const [saved, setSaved] = useState(() => isFavorite(activity.id));
  const [addedToPlan, setAddedToPlan] = useState(false);
  const hero = activityHero(activity.id);

  function handleSave(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn()) {
      toast.error(t("צריך להתחבר כדי לשמור פעילויות", "Please sign in to save activities"));
      return;
    }
    const res = toggleFavorite(activity.id, null);
    setSaved(res.favored);
    toast.success(res.favored ? t("נשמר במועדפים ❤️", "Saved to favourites ❤️") : t("הוסר מהמועדפים", "Removed from favourites"));
  }

  function handleAddToPlan(e) {
    e.preventDefault();
    e.stopPropagation();
    const { added } = addToDraftPlan("activity", activity.id);
    if (added) {
      setAddedToPlan(true);
      toast.success(t("הפעילות נוספה לטיפול ✨", "Activity added to the session ✨"));
    } else {
      toast.info(t("הפעילות כבר בתוכנית הטיפול", "This activity is already in the session plan"));
    }
  }

  const detailParams = new URLSearchParams();
  if (mode) detailParams.set("mode", mode);
  if (returnPath) detailParams.set("returnPath", returnPath);
  if (returnLabel) detailParams.set("returnLabel", returnLabel);
  const detailUrl = `/activity/${activity.id}${detailParams.size ? `?${detailParams.toString()}` : ""}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.35, ease: "easeOut" }}
      className="relative"
    >
      <button
        type="button"
        aria-label={saved ? t("הסר ממועדפים", "Remove from favourites") : t("שמור למועדפים", "Save to favourites")}
        aria-pressed={saved}
        onClick={handleSave}
        className={cn(
          "absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-background/90 backdrop-blur transition-all hover:scale-105",
          saved ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-primary",
        )}
      >
        <Heart className={cn("h-4 w-4", saved && "fill-current")} />
      </button>

      {mode === "therapist" ? (
        <button
          type="button"
          aria-label={addedToPlan ? t("נוספה לטיפול", "Added to session") : t("הוסף לטיפול", "Add to session")}
          onClick={handleAddToPlan}
          className={cn(
            "absolute top-3 left-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-background/90 backdrop-blur transition-all hover:scale-105",
            addedToPlan ? "border-sage text-sage-foreground" : "border-border text-muted-foreground hover:text-primary",
          )}
        >
          {addedToPlan ? <Check className="h-4 w-4" /> : <ListPlus className="h-4 w-4" />}
        </button>
      ) : null}

      <Link
        to={detailUrl}
        className="group block h-full overflow-hidden rounded-3xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div
          className="mb-4 flex h-32 items-center justify-center overflow-hidden rounded-2xl border border-border/40 bg-white"
        >
          {hero ? (
            <img
              src={hero}
              alt={t(`איור של הפעילות ${activity.title}`, `Illustration for ${title}`)}
              title={t(`${activity.title} — פעילות לילדים מבואו נשחק`, `${title} — a Let's Play activity for children`)}
              data-seo-name={t(`${activity.title} פעילות לילדים`, `${title} activity for children`)}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-5xl leading-none drop-shadow-sm">{activityEmoji(activity)}</span>
          )}
        </div>
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary">{title}</h3>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
            {t("גיל", "Ages")} {activity.age_min}–{activity.age_max}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
            <Clock className="h-3 w-3" /> {getActivityDurationShortLabel(activity)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-warm px-2.5 py-1 text-foreground/80">
            <Layers className="h-3 w-3" /> {language === "en" ? ({ easy: "Easy", medium: "Moderate", hard: "Advanced" }[activity.difficulty] ?? activity.difficulty) : (DIFFICULTY_LABEL[activity.difficulty] ?? activity.difficulty)}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
