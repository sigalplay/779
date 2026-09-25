const POSTURE_POINTS = [
  {
    title: "כפות רגליים על משטח יציב",
    titleEn: "Feet on a stable surface",
    image: "/icon-bank/guidance/posture/1-feet.webp",
  },
  {
    title: "אגן צמוד למשענת הכיסא",
    titleEn: "Sit back against the chair",
    image: "/icon-bank/guidance/posture/2-pelvis.webp",
  },
  {
    title: "גב ישר ונתמך",
    titleEn: "Back upright and supported",
    image: "/icon-bank/guidance/posture/3-back.webp",
  },
  {
    title: "אמות ומרפקים על השולחן",
    titleEn: "Forearms and elbows on the table",
    image: "/icon-bank/guidance/posture/4-elbows.webp",
  },
  {
    title: "יד עזר מייצבת את הדף",
    titleEn: "The helping hand steadies the paper",
    image: "/icon-bank/guidance/posture/5-helper-hand.webp",
  },
];

// One card per point with the picture and the title. On phones each card is a
// compact row (small picture beside the text) so all five fit on about one screen.
// The class names avoid "grid", "h-40" and "gap-3": the phone guidance-dialog styles resize those.
export function PencilGripPostureGuide({ language = "he" }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground md:text-base">{language === "en" ? "A stable sitting position before writing or drawing" : "ישיבה נכונה לפני שכותבים או מציירים"}</p>
      <div className="flex flex-col gap-2.5 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
        {POSTURE_POINTS.map((p) => (
          <div key={p.image} className="flex items-center gap-2.5 overflow-hidden rounded-2xl border border-border/60 bg-cream p-2 sm:flex-col sm:items-stretch sm:gap-0 sm:rounded-3xl sm:p-0">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 sm:h-[10rem] sm:w-full sm:rounded-none">
              <img src={p.image} alt="" className="h-full w-full object-contain" />
            </div>
            <h3 className="min-w-0 flex-1 text-sm font-bold leading-snug text-blue-600 sm:px-3 sm:py-3 sm:text-center sm:text-base">{language === "en" ? p.titleEn : p.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
