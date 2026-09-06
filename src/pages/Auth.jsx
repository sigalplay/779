import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { LockKeyhole, Mail, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { brandLogo, useTranslator } from "@/lib/language";
import { completeMagicLinkFromUrl, requestPasswordReset, resendSignupConfirmation, signInWithPassword, signUpWithPassword, updateCloudPassword } from "@/lib/cloud-auth";
import { loadSavedContentFromCloud, uploadSavedContentToCloud } from "@/lib/cloud-data";
import { getLocalSavedContent, replaceLocalSavedContent, signIn } from "@/lib/storage";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, t } = useTranslator();
  const [mode, setMode] = useState(searchParams.get("mode") === "login" ? "login" : "register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [recoveryEmailSent, setRecoveryEmailSent] = useState("");
  const [recoverySession, setRecoverySession] = useState(null);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const intent = searchParams.get("intent");

  useEffect(() => {
    if (!window.location.hash.includes("access_token=")) return;
    let active = true;
    setBusy(true);
    completeMagicLinkFromUrl()
      .then(async (session) => {
        if (!active || !session?.user) return;
        if (session.authType === "recovery") {
          setRecoverySession(session);
          setMode("recovery");
          toast.success(t("הקישור אומת. עכשיו אפשר לבחור סיסמה חדשה", "Link verified. You can now choose a new password"));
          return;
        }
        const confirmedEmail = session.user.email || "";
        signIn(session.user.user_metadata?.display_name || confirmedEmail.split("@")[0], confirmedEmail, "cloud");
        const localContent = getLocalSavedContent();
        await uploadSavedContentToCloud(localContent);
        replaceLocalSavedContent(await loadSavedContentFromCloud());
        toast.success(t("האימייל אושר ונכנסת בהצלחה", "Your email was confirmed and you are signed in"));
        navigate(searchParams.get("redirect") || "/", { replace: true });
      })
      .catch(() => toast.error(t("לא הצלחנו להשלים את אישור האימייל. נסי להתחבר עם הסיסמה", "We could not complete email confirmation. Please sign in with your password")))
      .finally(() => active && setBusy(false));
    return () => { active = false; };
  }, [navigate, searchParams, t]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (mode === "register" && !legalAccepted) {
      toast.error(t("כדי ליצור חשבון צריך לאשר את תנאי השימוש ומדיניות הפרטיות", "Please accept the Terms of Use and Privacy Policy to create an account"));
      return;
    }
    if (password.length < 8) {
      toast.error(t("הסיסמה צריכה לכלול לפחות 8 תווים", "Password must contain at least 8 characters"));
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    setBusy(true);
    try {
      const localContent = getLocalSavedContent();
      const session = mode === "register"
        ? await signUpWithPassword({ email: normalizedEmail, password, displayName: normalizedEmail.split("@")[0] })
        : await signInWithPassword({ email: normalizedEmail, password });

      if (mode === "register" && !session?.access_token) {
        setConfirmationEmail(normalizedEmail);
        toast.success(t("נשלח אלייך מייל לאישור החשבון", "We sent you an email to confirm your account"));
        return;
      }

      if (!session?.access_token || !session?.user) {
        toast.error(t("לא התקבלה התחברות תקינה. נסי שוב", "A valid session was not received. Please try again"));
        return;
      }

      signIn(session.user.user_metadata?.display_name || normalizedEmail.split("@")[0], normalizedEmail, "cloud");
      if (mode === "register") await uploadSavedContentToCloud(localContent);
      replaceLocalSavedContent(await loadSavedContentFromCloud());
      toast.success(mode === "register" ? t("החשבון נוצר והשמירה הופעלה", "Your account was created and saving is enabled") : t("נכנסת בהצלחה", "Signed in successfully"));
      navigate(searchParams.get("redirect") || "/", { replace: true });
    } catch (error) {
      const message = String(error?.message || "").toLowerCase();
      if (message.includes("invalid login credentials")) {
        toast.error(t("האימייל או הסיסמה אינם נכונים", "Incorrect email or password"));
      } else if (message.includes("email not confirmed")) {
        setConfirmationEmail(normalizedEmail);
        toast.error(t("עדיין צריך לאשר את החשבון דרך הקישור שנשלח לאימייל", "Please confirm your account using the link sent to your email"));
      } else if (message.includes("already registered")) {
        toast.error(t("האימייל כבר רשום. עברי למסך הכניסה", "This email is already registered. Please sign in"));
      } else {
        toast.error(t("לא הצלחנו להשלים את הפעולה. נסי שוב", "We could not complete the request. Please try again"));
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleResendConfirmation() {
    if (!confirmationEmail || resendBusy) return;
    setResendBusy(true);
    try {
      await resendSignupConfirmation(confirmationEmail);
      toast.success(t("נשלח מייל אישור חדש. השתמשי בקישור החדש ביותר", "A new confirmation email was sent. Use the newest link"));
    } catch (error) {
      const message = String(error?.message || "").toLowerCase();
      if (message.includes("rate limit") || message.includes("security purposes")) {
        toast.error(t("צריך להמתין מעט לפני שליחה נוספת", "Please wait a little before requesting another email"));
      } else {
        toast.error(t("לא הצלחנו לשלוח כרגע מייל נוסף. נסי שוב בעוד רגע", "We could not resend the email. Please try again shortly"));
      }
    } finally {
      setResendBusy(false);
    }
  }

  async function handlePasswordResetRequest(event) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;
    setBusy(true);
    try {
      await requestPasswordReset(normalizedEmail);
      setRecoveryEmailSent(normalizedEmail);
      toast.success(t("נשלח אלייך קישור לשחזור הכניסה", "A password recovery link was sent"));
    } catch {
      toast.error(t("לא הצלחנו לשלוח כרגע את קישור השחזור. נסי שוב בעוד רגע", "We could not send the recovery link. Please try again shortly"));
    } finally {
      setBusy(false);
    }
  }

  async function handleNewPassword(event) {
    event.preventDefault();
    if (password.length < 8) {
      toast.error(t("הסיסמה צריכה לכלול לפחות 8 תווים", "Password must contain at least 8 characters"));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("הסיסמאות אינן זהות", "Passwords do not match"));
      return;
    }
    if (!recoverySession?.access_token) {
      toast.error(t("קישור השחזור אינו תקף. בקשי קישור חדש", "The recovery link is invalid. Request a new one"));
      return;
    }
    setBusy(true);
    try {
      const user = await updateCloudPassword({ accessToken: recoverySession.access_token, password });
      const recoveredEmail = user.email || recoverySession.user?.email || "";
      signIn(user.user_metadata?.display_name || recoveredEmail.split("@")[0], recoveredEmail, "cloud");
      replaceLocalSavedContent(await loadSavedContentFromCloud());
      toast.success(t("הסיסמה עודכנה ונכנסת בהצלחה", "Password updated and you are signed in"));
      navigate(searchParams.get("redirect") || "/", { replace: true });
    } catch {
      toast.error(t("לא הצלחנו לעדכן את הסיסמה. בקשי קישור שחזור חדש", "We could not update the password. Request a new recovery link"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-cream via-background to-warm px-5 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm md:p-8">
        <div className="mb-5 text-center">
          <img src={brandLogo(language)} alt={t("בואו נשחק", "Let's Play")} className="mx-auto mb-3 h-24 w-24 object-contain" />
          <h1 className="font-display text-2xl font-black">{mode === "register" ? t("יצירת חשבון", "Create an account") : mode === "forgot" ? t("שחזור כניסה", "Recover access") : mode === "recovery" ? t("בחירת סיסמה חדשה", "Choose a new password") : t("כניסה לחשבון", "Sign in")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {intent === "favorite"
              ? t("כדי לשמור מועדפים ולפתוח אותם מכל מכשיר", "To save favourites and access them from any device")
              : t("כדי לשמור תוכניות ומועדפים ולפתוח אותם מכל מכשיר", "To save plans and favourites and access them from any device")}
          </p>
        </div>

        {recoverySession ? (
          <form onSubmit={handleNewPassword} className="space-y-4">
            <p className="text-center text-sm leading-6 text-muted-foreground">{t("בחרי סיסמה חדשה לחשבון. היא צריכה לכלול לפחות 8 תווים.", "Choose a new password with at least 8 characters.")}</p>
            <div><Label className="mb-1.5 flex items-center gap-2"><LockKeyhole className="h-4 w-4" />{t("סיסמה חדשה", "New password")}</Label><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" dir="ltr" minLength={8} required /></div>
            <div><Label className="mb-1.5 flex items-center gap-2"><LockKeyhole className="h-4 w-4" />{t("אימות הסיסמה החדשה", "Confirm new password")}</Label><Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" dir="ltr" minLength={8} required /></div>
            <Button type="submit" disabled={busy} className="w-full rounded-full bg-sage text-sage-foreground">{busy ? t("מעדכנים…", "Updating…") : t("עדכון הסיסמה וכניסה", "Update password and sign in")}</Button>
          </form>
        ) : recoveryEmailSent ? (
          <div className="rounded-[1.5rem] border border-sage/40 bg-sage/10 p-5 text-center">
            <MailCheck className="mx-auto h-10 w-10 text-sage-foreground" />
            <h2 className="mt-3 text-lg font-black">{t("נשלח קישור לשחזור הכניסה", "Recovery link sent")}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("פתחי את המייל ולחצי על הקישור. לאחר מכן תוכלי לבחור סיסמה חדשה באתר.", "Open the email and select the link. You can then choose a new password on the site.")}</p>
            <p className="mt-2 break-all text-sm font-bold" dir="ltr">{recoveryEmailSent}</p>
            <Button type="button" variant="outline" onClick={() => { setRecoveryEmailSent(""); setMode("forgot"); }} className="mt-4 w-full rounded-full">{t("שליחה מחדש", "Send again")}</Button>
            <Button type="button" onClick={() => { setRecoveryEmailSent(""); setMode("login"); }} className="mt-3 w-full rounded-full bg-sage text-sage-foreground">{t("חזרה לכניסה", "Back to sign in")}</Button>
          </div>
        ) : confirmationEmail ? (
          <div className="rounded-[1.5rem] border border-sage/40 bg-sage/10 p-5 text-center">
            <MailCheck className="mx-auto h-10 w-10 text-sage-foreground" />
            <h2 className="mt-3 text-lg font-black">{t("נשלח אלייך מייל לאישור", "Confirmation email sent")}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("פתחי את המייל, לחצי על הקישור לאישור החשבון ולאחר מכן חזרי לאתר. הקישור יכניס אותך אוטומטית.", "Open the email and select the confirmation link, then return to the site. The link will sign you in automatically.")}
            </p>
            <p className="mt-2 break-all text-sm font-bold" dir="ltr">{confirmationEmail}</p>
            <Button type="button" variant="outline" onClick={handleResendConfirmation} disabled={resendBusy} className="mt-4 w-full rounded-full">
              {resendBusy ? t("שולחים…", "Sending…") : t("שליחת מייל אישור מחדש", "Resend confirmation email")}
            </Button>
            <Button type="button" onClick={() => { setConfirmationEmail(""); setMode("login"); }} className="mt-4 w-full rounded-full bg-sage text-sage-foreground">
              {t("כבר אישרתי — מעבר לכניסה", "I confirmed — go to sign in")}
            </Button>
          </div>
        ) : mode === "forgot" ? (
          <form onSubmit={handlePasswordResetRequest} className="space-y-4">
            <p className="text-center text-sm leading-6 text-muted-foreground">{t("הזיני את כתובת האימייל של החשבון ונשלח אלייך קישור לבחירת סיסמה חדשה.", "Enter your account email and we will send a link to choose a new password.")}</p>
            <div><Label className="mb-1.5 flex items-center gap-2"><Mail className="h-4 w-4" />{t("כתובת אימייל", "Email address")}</Label><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" dir="ltr" required /></div>
            <Button type="submit" disabled={busy} className="w-full rounded-full bg-sage text-sage-foreground">{busy ? t("שולחים…", "Sending…") : t("שליחת קישור לשחזור", "Send recovery link")}</Button>
            <button type="button" onClick={() => setMode("login")} className="w-full text-center text-sm text-muted-foreground underline">{t("חזרה לכניסה", "Back to sign in")}</button>
          </form>
        ) : <>
        <div className="mb-5 grid grid-cols-2 rounded-full bg-muted p-1">
          <button type="button" onClick={() => setMode("register")} className={`rounded-full px-3 py-2 text-sm font-bold ${mode === "register" ? "bg-white shadow-sm" : "text-muted-foreground"}`}>{t("הרשמה", "Register")}</button>
          <button type="button" onClick={() => setMode("login")} className={`rounded-full px-3 py-2 text-sm font-bold ${mode === "login" ? "bg-white shadow-sm" : "text-muted-foreground"}`}>{t("כבר יש לי חשבון", "I have an account")}</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label className="mb-1.5 flex items-center gap-2"><Mail className="h-4 w-4" />{t("כתובת אימייל", "Email address")}</Label><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" dir="ltr" required /></div>
          <div><Label className="mb-1.5 flex items-center gap-2"><LockKeyhole className="h-4 w-4" />{t("סיסמה – לפחות 8 תווים", "Password – at least 8 characters")}</Label><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "register" ? "new-password" : "current-password"} dir="ltr" minLength={8} required /></div>
          {mode === "register" && <label className="flex items-start gap-2 rounded-2xl border border-border bg-white/70 p-3 text-sm leading-6"><input type="checkbox" checked={legalAccepted} onChange={(event) => setLegalAccepted(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-primary" required /><span>{t("קראתי ואני מסכימ/ה ל", "I have read and agree to the ")}<Link className="font-bold underline" to="/terms" target="_blank">{t("תנאי השימוש", "Terms of Use")}</Link>{t(" ול", " and ")}<Link className="font-bold underline" to="/privacy" target="_blank">{t("מדיניות הפרטיות", "Privacy Policy")}</Link>.</span></label>}
          <Button type="submit" disabled={busy} className="w-full rounded-full bg-sage text-sage-foreground">{busy ? t("רגע…", "Please wait…") : mode === "register" ? t("יצירת חשבון ושמירה", "Create account and save") : t("כניסה", "Sign in")}</Button>
          {mode === "login" && <button type="button" onClick={() => setMode("forgot")} className="w-full text-center text-sm font-bold text-muted-foreground underline">{t("שכחתי סיסמה — שחזור כניסה", "Forgot password — recover access")}</button>}
        </form>
        </>}
        <button type="button" onClick={() => navigate(searchParams.get("redirect") || "/")} className="mt-4 w-full text-center text-sm text-muted-foreground underline">{t("המשך ללא הרשמה", "Continue without an account")}</button>
        <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">{t("האימייל משמש לכניסה ולשמירת התוכן בלבד. לא נשלח הודעות שיווקיות.", "Your email is used only for signing in and saving content. We do not send marketing messages.")}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground"><Link className="underline" to="/privacy">{t("מדיניות פרטיות", "Privacy Policy")}</Link><Link className="underline" to="/terms">{t("תנאי שימוש", "Terms of Use")}</Link><Link className="underline" to="/cookies">{t("מדיניות Cookies", "Cookie Policy")}</Link></div>
      </motion.div>
    </div>
  );
}
