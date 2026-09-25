import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AlertCircle, Check, ClipboardList, Eye, EyeOff, Heart, Loader2, LockKeyhole, Mail, MailCheck, ShieldCheck, Users } from "lucide-react";
import { brandLogo, useTranslator } from "@/lib/language";
import { cn } from "@/lib/utils";
import { requestPasswordRecovery, resendConfirmationEmail, sessionFromUrl, signInWithPassword, signUpWithPassword, updatePassword } from "@/lib/cloud-auth";
import { loadSavedContentFromCloud, uploadSavedContentToCloud } from "@/lib/cloud-data";
import { getSavedContent, setSavedContent, signIn as saveProfile } from "@/lib/storage";

const MIN_PASSWORD = 8;

// Sign up, sign in, and password recovery. The account flow and messages follow the live site;
// the layout is a cleaner two-panel design.
export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { language, t } = useTranslator();
  const english = language === "en";
  const intent = params.get("intent");
  const redirectTo = params.get("redirect") || "/";

  const [mode, setMode] = useState(params.get("mode") === "login" ? "login" : "register"); // register | login | forgot | recovery
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [confirmationSentTo, setConfirmationSentTo] = useState("");
  const [recoverySentTo, setRecoverySentTo] = useState("");
  const [recoverySession, setRecoverySession] = useState(null);
  const [error, setError] = useState("");

  const finish = () => navigate(redirectTo, { replace: true });
  const switchMode = (next) => { setMode(next); setError(""); };

  // Coming back from a confirmation or recovery email link.
  useEffect(() => {
    if (!window.location.hash.includes("access_token=")) return undefined;
    let active = true;
    setBusy(true);
    sessionFromUrl()
      .then(async (session) => {
        if (!active || !session?.user) return;
        if (session.authType === "recovery") {
          setRecoverySession(session);
          setMode("recovery");
          toast.success(t("הקישור אומת. עכשיו אפשר לבחור סיסמה חדשה", "Link verified. You can now choose a new password"));
          return;
        }
        const address = session.user.email || "";
        saveProfile(session.user.user_metadata?.display_name || address.split("@")[0], address, "cloud");
        await uploadSavedContentToCloud(getSavedContent());
        setSavedContent(await loadSavedContentFromCloud());
        toast.success(t("האימייל אושר ונכנסת בהצלחה", "Your email was confirmed and you are signed in"));
        finish();
      })
      .catch(() => setError(t("לא הצלחנו להשלים את אישור האימייל. נסי להתחבר עם הסיסמה", "We could not complete email confirmation. Please sign in with your password")))
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);

  async function submitAccount(event) {
    event.preventDefault();
    setError("");
    if (mode === "register" && !acceptedTerms) {
      setError(t("כדי ליצור חשבון צריך לאשר את תנאי השימוש ומדיניות הפרטיות", "Please accept the Terms of Use and Privacy Policy to create an account"));
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError(t("הסיסמה צריכה לכלול לפחות 8 תווים", "Password must contain at least 8 characters"));
      return;
    }
    const address = email.trim().toLowerCase();
    setBusy(true);
    try {
      const localContent = getSavedContent();
      const result = mode === "register"
        ? await signUpWithPassword({ email: address, password, displayName: address.split("@")[0] })
        : await signInWithPassword({ email: address, password });
      if (mode === "register" && !result?.access_token) {
        setConfirmationSentTo(address);
        toast.success(t("נשלח אלייך מייל לאישור החשבון", "We sent you an email to confirm your account"));
        return;
      }
      if (!result?.access_token || !result?.user) {
        setError(t("לא התקבלה התחברות תקינה. נסי שוב", "A valid session was not received. Please try again"));
        return;
      }
      saveProfile(result.user.user_metadata?.display_name || address.split("@")[0], address, "cloud");
      if (mode === "register") await uploadSavedContentToCloud(localContent);
      setSavedContent(await loadSavedContentFromCloud());
      toast.success(mode === "register" ? t("החשבון נוצר והשמירה הופעלה", "Your account was created and saving is enabled") : t("נכנסת בהצלחה", "Signed in successfully"));
      finish();
    } catch (reason) {
      const message = String(reason?.message || "").toLowerCase();
      if (message.includes("invalid login credentials")) setError(t("האימייל או הסיסמה אינם נכונים", "Incorrect email or password"));
      else if (message.includes("email not confirmed")) {
        setConfirmationSentTo(address);
        toast.error(t("עדיין צריך לאשר את החשבון דרך הקישור שנשלח לאימייל", "Please confirm your account using the link sent to your email"));
      } else if (message.includes("already registered")) setError(t("האימייל כבר רשום. עברי למסך הכניסה", "This email is already registered. Please sign in"));
      else setError(t("לא הצלחנו להשלים את הפעולה. נסי שוב", "We could not complete the request. Please try again"));
    } finally {
      setBusy(false);
    }
  }

  async function resendConfirmation() {
    if (!confirmationSentTo || resending) return;
    setResending(true);
    try {
      await resendConfirmationEmail(confirmationSentTo);
      toast.success(t("נשלח מייל אישור חדש. השתמשי בקישור החדש ביותר", "A new confirmation email was sent. Use the newest link"));
    } catch (reason) {
      const message = String(reason?.message || "").toLowerCase();
      toast.error(message.includes("rate limit") || message.includes("security purposes")
        ? t("צריך להמתין מעט לפני שליחה נוספת", "Please wait a little before requesting another email")
        : t("לא הצלחנו לשלוח כרגע מייל נוסף. נסי שוב בעוד רגע", "We could not resend the email. Please try again shortly"));
    } finally {
      setResending(false);
    }
  }

  async function submitRecoveryRequest(event) {
    event.preventDefault();
    setError("");
    const address = email.trim().toLowerCase();
    if (!address) return;
    setBusy(true);
    try {
      await requestPasswordRecovery(address);
      setRecoverySentTo(address);
      toast.success(t("נשלח אלייך קישור לשחזור הכניסה", "A password recovery link was sent"));
    } catch {
      setError(t("לא הצלחנו לשלוח כרגע את קישור השחזור. נסי שוב בעוד רגע", "We could not send the recovery link. Please try again shortly"));
    } finally {
      setBusy(false);
    }
  }

  async function submitNewPassword(event) {
    event.preventDefault();
    setError("");
    if (password.length < MIN_PASSWORD) { setError(t("הסיסמה צריכה לכלול לפחות 8 תווים", "Password must contain at least 8 characters")); return; }
    if (password !== passwordAgain) { setError(t("הסיסמאות אינן זהות", "Passwords do not match")); return; }
    if (!recoverySession?.access_token) { setError(t("קישור השחזור אינו תקף. בקשי קישור חדש", "The recovery link is invalid. Request a new one")); return; }
    setBusy(true);
    try {
      const user = await updatePassword({ accessToken: recoverySession.access_token, password });
      const address = user.email || recoverySession.user?.email || "";
      saveProfile(user.user_metadata?.display_name || address.split("@")[0], address, "cloud");
      setSavedContent(await loadSavedContentFromCloud());
      toast.success(t("הסיסמה עודכנה ונכנסת בהצלחה", "Password updated and you are signed in"));
      finish();
    } catch {
      setError(t("לא הצלחנו לעדכן את הסיסמה. בקשי קישור שחזור חדש", "We could not update the password. Request a new recovery link"));
    } finally {
      setBusy(false);
    }
  }

  const heading = mode === "register" ? t("יצירת חשבון", "Create an account")
    : mode === "forgot" ? t("שחזור כניסה", "Recover access")
      : mode === "recovery" ? t("בחירת סיסמה חדשה", "Choose a new password")
        : t("כניסה לחשבון", "Sign in");
  const subtitle = intent === "favorite"
    ? t("כדי לשמור מועדפים ולפתוח אותם מכל מכשיר", "To save favorites and access them from any device")
    : t("כדי לשמור תוכניות ומועדפים ולפתוח אותם מכל מכשיר", "To save plans and favorites and access them from any device");

  let body;
  if (recoverySession) {
    body = (
      <form onSubmit={submitNewPassword} className="space-y-4" noValidate>
        <p className="text-sm leading-6 text-muted-foreground">{t("בחרי סיסמה חדשה לחשבון. היא צריכה לכלול לפחות 8 תווים.", "Choose a new password with at least 8 characters.")}</p>
        <PasswordField label={t("סיסמה חדשה", "New password")} value={password} onChange={setPassword} show={showPassword} onToggleShow={() => setShowPassword((v) => !v)} autoComplete="new-password" t={t} />
        <PasswordField label={t("אימות הסיסמה החדשה", "Confirm new password")} value={passwordAgain} onChange={setPasswordAgain} show={showPassword} autoComplete="new-password" t={t} />
        <PasswordHint password={password} t={t} />
        <FormError message={error} />
        <SubmitButton busy={busy}>{busy ? t("מעדכנים…", "Updating…") : t("עדכון הסיסמה וכניסה", "Update password and sign in")}</SubmitButton>
      </form>
    );
  } else if (recoverySentTo) {
    body = (
      <SentNotice
        title={t("נשלח קישור לשחזור הכניסה", "Recovery link sent")}
        text={t("פתחי את המייל ולחצי על הקישור. לאחר מכן תוכלי לבחור סיסמה חדשה באתר.", "Open the email and select the link. You can then choose a new password on the site.")}
        address={recoverySentTo}
      >
        <button type="button" onClick={() => { setRecoverySentTo(""); switchMode("forgot"); }} className="auth-secondary-button">{t("שליחה מחדש", "Send again")}</button>
        <button type="button" onClick={() => { setRecoverySentTo(""); switchMode("login"); }} className="auth-primary-button">{t("חזרה לכניסה", "Back to sign in")}</button>
      </SentNotice>
    );
  } else if (confirmationSentTo) {
    body = (
      <SentNotice
        title={t("נשלח אלייך מייל לאישור", "Confirmation email sent")}
        text={t("פתחי את המייל, לחצי על הקישור לאישור החשבון ולאחר מכן חזרי לאתר. הקישור יכניס אותך אוטומטית.", "Open the email and select the confirmation link, then return to the site. The link will sign you in automatically.")}
        address={confirmationSentTo}
      >
        <button type="button" onClick={resendConfirmation} disabled={resending} className="auth-secondary-button">
          {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {resending ? t("שולחים…", "Sending…") : t("שליחת מייל אישור מחדש", "Resend confirmation email")}
        </button>
        <button type="button" onClick={() => { setConfirmationSentTo(""); switchMode("login"); }} className="auth-primary-button">{t("כבר אישרתי — מעבר לכניסה", "I confirmed — go to sign in")}</button>
      </SentNotice>
    );
  } else if (mode === "forgot") {
    body = (
      <form onSubmit={submitRecoveryRequest} className="space-y-4" noValidate>
        <p className="text-sm leading-6 text-muted-foreground">{t("הזיני את כתובת האימייל של החשבון ונשלח אלייך קישור לבחירת סיסמה חדשה.", "Enter your account email and we will send a link to choose a new password.")}</p>
        <EmailField label={t("כתובת אימייל", "Email address")} value={email} onChange={setEmail} />
        <FormError message={error} />
        <SubmitButton busy={busy}>{busy ? t("שולחים…", "Sending…") : t("שליחת קישור לשחזור", "Send recovery link")}</SubmitButton>
        <button type="button" onClick={() => switchMode("login")} className="auth-text-button">{t("חזרה לכניסה", "Back to sign in")}</button>
      </form>
    );
  } else {
    body = (
      <>
        <div className="mb-6 grid grid-cols-2 rounded-2xl bg-muted/70 p-1" role="tablist" aria-label={t("סוג הכניסה", "Account options")}>
          {[["register", t("הרשמה", "Register")], ["login", t("כבר יש לי חשבון", "I have an account")]].map(([value, label]) => (
            <button key={value} type="button" role="tab" aria-selected={mode === value} onClick={() => switchMode(value)} className={cn("rounded-xl px-3 py-2.5 text-sm font-bold transition", mode === value ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {label}
            </button>
          ))}
        </div>
        <form onSubmit={submitAccount} className="space-y-4" noValidate>
          <EmailField label={t("כתובת אימייל", "Email address")} value={email} onChange={setEmail} />
          <PasswordField
            label={t("סיסמה", "Password")}
            value={password}
            onChange={setPassword}
            show={showPassword}
            onToggleShow={() => setShowPassword((v) => !v)}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            t={t}
            aside={mode === "login" ? <button type="button" onClick={() => switchMode("forgot")} className="text-xs font-bold text-primary-foreground underline-offset-4 hover:underline">{t("שכחתי סיסמה", "Forgot password?")}</button> : null}
          />
          {mode === "register" && <PasswordHint password={password} t={t} />}
          {mode === "register" && (
            <label className="flex items-start gap-3 rounded-2xl border border-border/80 bg-cream/60 p-3.5 text-sm leading-6">
              <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-primary" required />
              <span>
                {t("קראתי ואני מסכימ/ה ל", "I have read and agree to the ")}
                <Link className="font-bold underline underline-offset-2" to="/terms" target="_blank">{t("תנאי השימוש", "Terms of Use")}</Link>
                {t(" ול", " and ")}
                <Link className="font-bold underline underline-offset-2" to="/privacy" target="_blank">{t("מדיניות הפרטיות", "Privacy Policy")}</Link>.
              </span>
            </label>
          )}
          <FormError message={error} />
          <SubmitButton busy={busy}>{busy ? t("רגע…", "Please wait…") : mode === "register" ? t("יצירת חשבון ושמירה", "Create account and save") : t("כניסה", "Sign in")}</SubmitButton>
        </form>
      </>
    );
  }

  return (
    <div className="auth-page flex min-h-screen items-center justify-center bg-gradient-to-b from-cream via-background to-warm px-4 py-8" dir={english ? "ltr" : "rtl"}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-[0_18px_50px_-24px_rgba(64,54,47,0.35)] lg:grid-cols-[1.05fr_1fr]">
        {/* Form */}
        <section className="p-6 sm:p-8 md:p-10">
          <Link to="/" className="mb-6 inline-flex items-center gap-3 lg:hidden">
            <img src={brandLogo(language)} alt={t("בואו נשחק", "Let's Play")} className="h-14 w-14 rounded-2xl object-contain" />
          </Link>
          <h1 className="font-display text-2xl font-black tracking-tight md:text-3xl">{heading}</h1>
          <p className="mb-6 mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          {body}
          <button type="button" onClick={() => navigate(redirectTo)} className="auth-text-button mt-5">{t("המשך ללא הרשמה", "Continue without an account")}</button>
          <p className="mt-6 flex items-start gap-2 border-t border-border/60 pt-4 text-xs leading-5 text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sage-foreground" />
            {t("האימייל משמש לכניסה ולשמירת התוכן בלבד. לא נשלח הודעות שיווקיות.", "Your email is used only for signing in and saving content. We do not send marketing messages.")}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <Link className="hover:text-foreground hover:underline" to="/privacy">{t("מדיניות פרטיות", "Privacy Policy")}</Link>
            <Link className="hover:text-foreground hover:underline" to="/terms">{t("תנאי שימוש", "Terms of Use")}</Link>
            <Link className="hover:text-foreground hover:underline" to="/cookies">{t("מדיניות Cookies", "Cookie Policy")}</Link>
          </div>
        </section>

        {/* Brand panel (desktop) */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-sage/35 via-cream to-rose/25 p-10 lg:flex" aria-hidden="true">
          <Link to="/" className="inline-flex" tabIndex={-1}>
            <img src={brandLogo(language)} alt="" className="h-20 w-20 rounded-2xl bg-white/80 object-contain p-1 shadow-sm" />
          </Link>
          <div>
            <p className="font-display text-2xl font-black leading-snug text-foreground">{t("כל מה ששמרת — בכל מכשיר", "Everything you saved — on every device")}</p>
            <ul className="mt-6 space-y-4">
              {[
                [Heart, t("מועדפים ותיקיות שנשמרים בחשבון", "Favorites and folders kept in your account")],
                [ClipboardList, t("תכניות טיפול שמורות לשימוש חוזר", "Saved treatment plans to use again")],
                [Users, t("לוחות מפגש לכל מטופל, מהטלפון ומהמחשב", "Session boards for each client, on phone and computer")],
              ].map(([Icon, text]) => (
                <li key={text} className="flex items-center gap-3 text-sm font-semibold text-foreground/85">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/85 text-sage-foreground shadow-sm"><Icon className="h-5 w-5" /></span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {t("בואו נשחק", "Let's Play")}</p>
        </aside>
      </motion.div>
    </div>
  );
}

function EmailField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold">{label}</span>
      <span className="relative block">
        <Mail className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="email" value={value} onChange={(e) => onChange(e.target.value)} autoComplete="email" dir="ltr" required className="auth-input ps-10" />
      </span>
    </label>
  );
}

function PasswordField({ label, value, onChange, show, onToggleShow, autoComplete, t, aside = null }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between gap-2 text-sm font-bold">{label}{aside}</span>
      <span className="relative block">
        <LockKeyhole className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} dir="ltr" minLength={MIN_PASSWORD} required className="auth-input pe-11 ps-10" />
        {onToggleShow && (
          <button type="button" onClick={onToggleShow} aria-label={show ? t("הסתרת הסיסמה", "Hide password") : t("הצגת הסיסמה", "Show password")} className="absolute end-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </span>
    </label>
  );
}

function PasswordHint({ password, t }) {
  const ok = password.length >= MIN_PASSWORD;
  return (
    <p className={cn("-mt-1 flex items-center gap-1.5 text-xs font-semibold", ok ? "text-sage-foreground" : "text-muted-foreground")}>
      <Check className={cn("h-3.5 w-3.5", ok ? "opacity-100" : "opacity-40")} />
      {t("לפחות 8 תווים", "At least 8 characters")}
    </p>
  );
}

function FormError({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-800">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </p>
  );
}

function SubmitButton({ busy, children }) {
  return (
    <button type="submit" disabled={busy} className="auth-primary-button">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

function SentNotice({ title, text, address, children }) {
  return (
    <div className="rounded-3xl border border-sage/40 bg-sage/10 p-6 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-sage-foreground shadow-sm"><MailCheck className="h-7 w-7" /></span>
      <h2 className="mt-4 text-lg font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
      <p className="mt-3 break-all rounded-xl bg-white/80 px-3 py-2 text-sm font-bold" dir="ltr">{address}</p>
      <div className="mt-5 grid gap-2.5">{children}</div>
    </div>
  );
}
