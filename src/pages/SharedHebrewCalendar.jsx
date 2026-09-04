import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Home, Printer } from "lucide-react";
import { HebrewCalendarPages } from "@/components/HebrewCalendarPages";
import { Button } from "@/components/ui/button";
import { buildGregorianCalendarYear, decodeCalendarPayload } from "@/lib/hebrew-calendar";

export default function SharedHebrewCalendar() {
  const [params] = useSearchParams();
  const data = useMemo(() => decodeCalendarPayload(params.get("data") || ""), [params]);
  if (!data) return <main className="grid min-h-screen place-items-center p-6 text-center" dir="rtl"><div><h1 className="text-2xl font-black">הקישור ללוח אינו תקין</h1><Button className="mt-4" onClick={() => location.assign("/")}>חזרה לבואו נשחק</Button></div></main>;
  const months = buildGregorianCalendarYear(data.year);
  return <main className="shared-hebrew-calendar bg-sky/15 p-4 md:p-8" dir="rtl"><div className="mx-auto mb-5 flex max-w-5xl justify-between print:hidden"><Link to="/"><Button variant="outline"><Home className="h-4 w-4" /> בואו נשחק</Button></Link><Button onClick={() => window.print()}><Printer className="h-4 w-4" /> הדפסה</Button></div><div className="mx-auto max-w-5xl"><HebrewCalendarPages months={months} year={data.year} settings={data.settings} title={data.title} customEvents={data.customEvents || []} showAll /></div></main>;
}
