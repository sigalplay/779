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

// Same cards as the cutting tips: picture and title, two per row on phones.
export function PencilGripPostureGuide({ language = "he" }) {
  return (
    <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3 lg:grid-cols-5">
      {POSTURE_POINTS.map((p) => (
        <div key={p.image} className="flex flex-col items-center justify-start gap-3 rounded-3xl border border-sage/30 bg-sage/10 p-4 text-center">
          <div className="h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-white p-1">
            <img src={p.image} alt="" className="h-full w-full object-contain" />
          </div>
          <span className="text-sm font-semibold leading-snug text-foreground md:text-base">{language === "en" ? p.titleEn : p.title}</span>
        </div>
      ))}
    </div>
  );
}
