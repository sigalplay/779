import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { FolderOpen, Trash2, Play, Route, ClipboardList } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { activityHero } from "@/lib/activity-icons";
import { MOTOR_TRAIL_ITEMS } from "@/lib/motor-trail-items";
import { getTreatmentPlans, deleteTreatmentPlan, getActivity, setDraftPlan } from "@/lib/storage";

function motorTrailItem(id, planItem) {
  return MOTOR_TRAIL_ITEMS.find((it) => it.id === id) ?? planItem?.customItems?.find((it) => it.id === id);
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

export default function TherapistPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(() => getTreatmentPlans());

  function handleDelete(id) {
    deleteTreatmentPlan(id);
    setPlans((prev) => prev.filter((p) => p.id !== id));
    toast.success("התוכנית נמחקה");
  }

  function handleLoad(plan, startSession) {
    setDraftPlan(plan.items ?? []);
    navigate(startSession ? "/therapist/build?view=session" : `/therapist/build?plan=${encodeURIComponent(plan.id)}`);
  }

  return (
    <AppShell mode="therapist">
      <div className="mb-6 flex items-center gap-2 text-sage">
        <FolderOpen className="h-5 w-5" />
        <span className="text-sm font-bold">תכניות טיפול</span>
      </div>
      <h1 className="mb-1 font-display text-3xl font-black md:text-4xl">התוכניות השמורות שלי</h1>
      <p className="mb-6 text-muted-foreground">טענו תוכנית שמורה כדי להמשיך לערוך אותה או להתחיל בה מפגש.</p>

      {plans.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
          <p className="mb-4">עדיין אין תוכניות שמורות.</p>
          <Link to="/therapist/build" className="text-sage-foreground underline underline-offset-4">
            התחילי לבנות תוכנית חדשה
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {plans.map((plan) => {
            const items = plan.items ?? [];
            return (
              <li key={plan.id} className="rounded-3xl border border-border/60 bg-card p-5">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-bold">{plan.title || "מפגש טיפולי"}</h2>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(plan.created_at)} · {items.length} פריטים
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button onClick={() => handleLoad(plan, true)} className="rounded-full bg-sage text-sage-foreground">
                      <Play className="h-4 w-4" /> התחל מפגש
                    </Button>
                    <Button variant="outline" onClick={() => handleLoad(plan, false)} className="rounded-full">
                      טעינה לעריכה
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(plan.id)}
                      className="rounded-full text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {items.map((item, i) => {
                      const activity = item.kind === "activity" ? getActivity(item.id) : null;
                      const hero =
                        item.kind === "activity" ? activityHero(item.id) : motorTrailItem(item.equipment?.[0], item)?.image;
                      const itemTitle = item.kind === "activity" ? activity?.title ?? "פעילות" : "מסלול מוטורי";
                      return (
                        <span
                          key={item.kind === "activity" ? item.id : item.uid}
                          title={itemTitle}
                          className="flex items-center gap-1.5 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background">
                            {hero ? (
                              <img src={hero} alt="" className="h-full w-full object-contain" />
                            ) : item.kind === "motor-trail" ? (
                              <Route className="h-3 w-3" />
                            ) : (
                              <ClipboardList className="h-3 w-3" />
                            )}
                          </span>
                          {i + 1}. {itemTitle}
                        </span>
                      );
                    })}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
