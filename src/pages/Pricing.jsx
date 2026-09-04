import { Check, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { checkoutUrl, PRICES } from "@/lib/subscription";

const benefits = [
  "חסכו זמן של הכנת חומרים.",
  "גישה בלתי מוגבלת לכל הפעילויות, המתכונים והניסויים באתר.",
  "פעילויות מתחדשות ללא הגבלה.",
  "מחולל פעילויות ללא הגבלה.",
  "יצירת לוחות התארגנות שבועיים ללא הגבלה.",
  "יצירת לוחות בוקר ללא הגבלה.",
  "יצירת סיפורים חברתיים ללא הגבלה.",
  "שימוש ביומן מטפל.",
  "שימוש בלוח דיגיטלי להבניית הטיפול.",
];
function Plan({ title, price, note, plan, featured }) {
  const url = checkoutUrl(plan);
  return <section className={`flex h-full min-h-[315px] flex-col rounded-3xl border p-6 shadow-sm ${featured ? "border-primary bg-primary/5" : "bg-card"}`}>
    <div className="mb-3 flex h-7 items-center">{featured ? <div className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground"><Sparkles className="h-3 w-3"/> מחיר השקה</div> : null}</div>
    <h2 className="min-h-8 font-display text-2xl font-black">{title}</h2>
    <div className="my-4 text-4xl font-black">₪{price}<span className="text-sm font-normal text-muted-foreground"> {plan === "monthly" ? "לחודש" : "לשנה"}</span></div>
    <p className="mb-5 min-h-10 flex-1 text-sm text-muted-foreground">{note}</p>
    <a href={url || "#payment-setup"} onClick={(e) => { if (!url) e.preventDefault(); }} className="block rounded-full bg-foreground px-5 py-3 text-center font-bold text-background">{url ? "להצטרפות" : "הסליקה תיפתח בקרוב"}</a>
  </section>;
}
export default function Pricing() {
  return <AppShell><div className="mx-auto max-w-5xl">
    <div className="mb-8 text-center"><h1 className="font-display text-4xl font-black">בוחרים את המנוי שמתאים לכם</h1><p className="mt-2 text-muted-foreground">אפשר להתחיל בחינם ולשדרג מתי שרוצים.</p></div>
    <div className="grid items-stretch gap-5 md:auto-rows-fr md:grid-cols-3">
      <Plan title="חודשי" price={PRICES.monthly} plan="monthly" note="חיוב חודשי, ללא התחייבות." />
      <Plan title="שנתי – מחיר השקה" price={PRICES.launchYearly} plan="launch" featured note={`לשנה הראשונה. לאחר מכן ₪${PRICES.yearly} לשנה, בכפוף לאישור לפני החידוש.`} />
      <Plan title="שנתי" price={PRICES.yearly} plan="yearly" note="המנוי השנתי במחיר הרגיל." />
    </div>
    <section className="mt-8 rounded-3xl bg-card p-6" id="payment-setup"><h2 className="font-display text-xl font-black">מה כלול במנוי?</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{benefits.map(x => <div key={x} className="flex items-start gap-2"><Check className="mt-0.5 h-5 w-5 shrink-0 text-sage"/><span>{x}</span></div>)}</div></section>
  </div></AppShell>;
}
