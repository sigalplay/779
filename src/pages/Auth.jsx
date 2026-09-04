import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Link as LinkIcon, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { brandLogo, useTranslator } from "@/lib/language";
import { completeMagicLinkFromUrl, isCloudAuthConfigured, sendMagicLink, startBetaEmailAccess, startLocalTestSession } from "@/lib/cloud-auth";
import { signIn } from "@/lib/storage";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, t } = useTranslator();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const configured = isCloudAuthConfigured();

  useEffect(() => {
    if (!configured || !window.location.hash.includes("access_token")) return;
    setBusy(true);
    completeMagicLinkFromUrl().then((session) => {
      if (!session?.user) return;
      const name = session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || t("משתמשת", "User");
      signIn(name, session.user.email || "", "cloud");
      toast.success(t("נכנסת בהצלחה", "Signed in successfully"));
      navigate(searchParams.get("redirect") || "/", { replace: true });
    }).catch(() => toast.error(t("הקישור אינו תקין או שפג תוקפו", "This link is invalid or has expired"))).finally(() => setBusy(false));
  }, [configured, navigate, searchParams, t]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!configured) return;
    if (!email.trim()) { toast.error(t("נא להזין כתובת אימייל", "Please enter an email address")); return; }
    setBusy(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const redirect = searchParams.get("redirect") || "/";
      const callbackUrl = `${window.location.origin}/auth?redirect=${encodeURIComponent(redirect)}`;
      startBetaEmailAccess();
      signIn(t("משתמשת בטא", "Beta user"), normalizedEmail, "beta-email");
      toast.success(t("נכנסת בהצלחה לגרסת ההרצה", "You are now signed in to the beta"));
      navigate(redirect, { replace: true });
      // Beta access must never depend on Supabase's email quota. Register the
      // address in the background when Auth can accept it, but do not block or
      // show an error if mail delivery is rate-limited.
      void sendMagicLink(normalizedEmail, callbackUrl).catch(() => null);
    } catch (error) {
      const message = error.message === "Invalid login credentials" ? t("האימייל או הסיסמה אינם נכונים", "Incorrect email or password") : t("לא הצלחנו להשלים את הפעולה. נסי שוב.", "We could not complete the request. Please try again.");
      toast.error(message);
    } finally { setBusy(false); }
  }

  function handleLocalTest() {
    if (!startLocalTestSession()) return;
    signIn(t("מצב בדיקה", "Test mode"), "test@local", "local-test");
    toast.success(t("נכנסת למצב בדיקה מקומי", "Local test mode is active"));
    navigate(searchParams.get("redirect") || "/", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-cream via-background to-warm px-5 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm md:p-8">
        <div className="mb-5 text-center">
          <img src={brandLogo(language)} alt={t("בואו נשחק", "Let's Play")} className="mx-auto mb-3 h-24 w-24 object-contain" />
          <h1 className="font-display text-2xl font-black">{t("כניסה או הרשמה", "Sign in or create an account")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("בתקופת ההרצה מזינים אימייל ונכנסים מיד - ללא סיסמה וללא צורך באישור", "During the beta, enter your email for immediate access - no password or confirmation needed")}</p>
        </div>
        {!configured && <div className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>{t("הכניסה באימייל עדיין לא מחוברת לשרת.", "Email sign-in is not connected to the server yet.")}</strong><br />{t("בינתיים אפשר להיכנס למצב בדיקה מקומי במכשיר הזה. לאחר חיבור Supabase האפשרות תיעלם אוטומטית.", "For now, you can use local test mode on this device. This option will disappear automatically once Supabase is connected.")}<Button type="button" onClick={handleLocalTest} className="mt-3 w-full rounded-full bg-amber-900 text-white hover:bg-amber-800">{t("כניסה למצב בדיקה", "Enter test mode")}</Button></div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label className="mb-1.5 flex items-center gap-2"><Mail className="h-4 w-4" />{t("כתובת אימייל", "Email address")}</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" dir="ltr" required /></div>
          <Button type="submit" disabled={!configured || busy} className="w-full rounded-full bg-sage text-sage-foreground"><LinkIcon className="h-4 w-4" />{busy ? t("רגע…", "Please wait…") : t("כניסה לאתר", "Enter the site")}</Button>
        </form>
        <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">{t("ביצירת חשבון המשתמשת מסכימה למדיניות הפרטיות. ביומן ההדגמה אין להזין פרטים מזהים.", "By creating an account, you agree to the privacy policy. Do not enter identifying information in the demo diary.")}</p>
      </motion.div>
    </div>
  );
}
