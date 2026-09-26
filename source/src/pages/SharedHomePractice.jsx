import { useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ActivityCard } from "@/components/ActivityCard";
import { getActivity, isSearchActive } from "@/lib/storage";
import { useTranslator } from "@/lib/language";

// Activities a therapist sent to parents for practice at home (/shared/home-practice?a=seed-4,seed-9).
export default function SharedHomePractice() {
  const { t } = useTranslator();
  const [searchParams] = useSearchParams();
  const ids = (searchParams.get("a") || "").split(",").map((id) => id.trim()).filter(Boolean).slice(0, 20);
  const activities = ids.map((id) => getActivity(id)).filter((activity) => activity && isSearchActive(activity));

  return (
    <AppShell mode="parent">
      <div className="mb-5">
        <h1 className="font-display text-3xl font-black">{t("תרגול בבית", "Practice at home")}</h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">{t("הפעילויות שהמטפלת בחרה לתרגול בבית. לחיצה על פעילות פותחת את ההוראות המלאות, ואפשר גם להדפיס אותה.", "The activities your therapist chose to practice at home. Open an activity for the full instructions; you can also print it.")}</p>
      </div>
      {activities.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity, index) => <ActivityCard key={activity.id} activity={activity} index={index} mode="parent" />)}
        </div>
      ) : (
        <p className="rounded-3xl border border-border/60 bg-card p-6 text-muted-foreground">{t("לא מצאנו את הפעילויות בקישור. כדאי לבקש מהמטפלת קישור חדש.", "We could not find the activities in this link. Ask your therapist for a new link.")}</p>
      )}
    </AppShell>
  );
}
