import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NotebookPen, LogIn, LogOut, Save, Trash2, Loader2, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useTranslator } from "@/lib/language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isGoogleDriveConfigured } from "@/lib/google-drive-config";
import {
  connectDrive,
  disconnectDrive,
  getCachedDriveProfile,
  isDriveConnected,
  listSessionNotes,
  getSessionNote,
  saveSessionNote,
  deleteSessionNote,
} from "@/lib/google-drive";

export default function SessionNotes() {
  const { t } = useTranslator();
  const configured = isGoogleDriveConfigured();
  const [profile, setProfile] = useState(() => getCachedDriveProfile());
  const [connecting, setConnecting] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [clientName, setClientName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      connectDrive({ silent: true })
        .then(() => refreshNotes())
        .catch(() => {
          // silent refresh failed (session expired) — user will need to reconnect manually
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshNotes() {
    setLoadingNotes(true);
    try {
      const files = await listSessionNotes();
      setNotes(files);
    } catch {
      toast.error(t("לא הצלחנו לטעון את ההערות מ-Drive", "We could not load notes from Drive."));
    } finally {
      setLoadingNotes(false);
    }
  }

  async function handleConnect() {
    setConnecting(true);
    try {
      const p = await connectDrive();
      setProfile(p);
      toast.success(t(`מחוברת כ-${p.name || p.email}`, `Connected as ${p.name || p.email}`));
      await refreshNotes();
    } catch (err) {
      const msg = String(err?.message ?? "");
      if (msg.includes("NOT_CONFIGURED")) {
        toast.error(t("החיבור ל-Drive עדיין לא הוגדר באתר", "Drive has not been configured for this site."));
      } else {
        toast.error(t("ההתחברות בוטלה או נכשלה", "Connection was cancelled or failed."));
      }
    } finally {
      setConnecting(false);
    }
  }

  function handleDisconnect() {
    disconnectDrive();
    setProfile(null);
    setNotes([]);
    toast.success(t("החיבור ל-Drive נותק", "Drive disconnected."));
  }

  function resetForm() {
    setEditingId(null);
    setClientName("");
    setDate(new Date().toISOString().slice(0, 10));
    setText("");
  }

  async function handleOpenNote(file) {
    try {
      const data = await getSessionNote(file.id);
      setEditingId(file.id);
      setClientName(data.clientName || "");
      setDate(data.date || file.modifiedTime?.slice(0, 10) || "");
      setText(data.text || "");
    } catch {
      toast.error(t("לא הצלחנו לפתוח את ההערה", "We could not open the note."));
    }
  }

  async function handleSaveNote() {
    if (!text.trim()) {
      toast.error(t("כתבי משהו לפני השמירה", "Enter something before saving."));
      return;
    }
    setSaving(true);
    try {
      await saveSessionNote({ fileId: editingId, clientName, date, text });
      toast.success(t("ההערה נשמרה ב-Drive שלך", "Note saved to your Drive."));
      resetForm();
      await refreshNotes();
    } catch {
      toast.error(t("השמירה נכשלה - נסי להתחבר מחדש", "Save failed — please reconnect."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteNote(file) {
    try {
      await deleteSessionNote(file.id);
      toast.success(t("ההערה נמחקה", "Note deleted."));
      if (editingId === file.id) resetForm();
      await refreshNotes();
    } catch {
      toast.error(t("המחיקה נכשלה", "Delete failed."));
    }
  }

  return (
    <AppShell mode="therapist">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sage">
          <NotebookPen className="h-5 w-5" />
          <span className="text-sm font-bold">{t("כלי יצירה", "Creative tool")}</span>
        </div>
        <h1 className="mt-1 font-display text-3xl font-black md:text-4xl">{t("הערות טיפול", "Session notes")}</h1>
        <p className="mt-1 text-muted-foreground">{t("רושמים מה היה בטיפול - נשמר ישירות ב-Google Drive שלך, ורק שלך.", "Record what happened in the session — saved directly to your Google Drive and accessible only to you.")}</p>
      </div>

      {!configured ? (
        <div className="rounded-3xl border border-dashed border-border p-8 text-center text-muted-foreground">
          {t("החיבור ל-Google Drive עדיין לא הוגדר באתר הזה. צריך ליצור פרויקט ב-Google Cloud, להפעיל את ה-Drive API, וליצור OAuth Client ID (הוראות מלאות בקובץ", "Google Drive has not been configured for this site yet. Create a Google Cloud project, enable the Drive API, and create an OAuth Client ID (full instructions are in")}{" "}<code className="rounded bg-muted px-1.5 py-0.5 text-xs">google-drive-config.js</code>).
        </div>
      ) : !profile ? (
        <div className="rounded-3xl border border-border/60 bg-card p-8 text-center">
          <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-sage-foreground" />
          <h2 className="mb-2 font-display text-xl font-bold">{t("מתחברים עם Google", "Connect with Google")}</h2>
          <p className="mx-auto mb-5 max-w-md text-sm text-muted-foreground">
            {t("ההערות שתכתבי נשמרות רק ב-Drive האישי שלך - לא אצלנו, ולא אצל אף מטפלת אחרת. את שולטת עליהן לגמרי.", "Your notes are stored only in your personal Drive — not with us or any other therapist. You remain in full control.")}
          </p>
          <Button onClick={handleConnect} disabled={connecting} className="rounded-full bg-sage text-sage-foreground">
            {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {t("התחברות עם Google", "Connect with Google")}
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/60 bg-card p-4">
            <div className="flex items-center gap-3">
              {profile.picture ? (
                <img src={profile.picture} alt="" className="h-10 w-10 rounded-full" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage/20 text-sage-foreground">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold">{profile.name || profile.email}</p>
                <p className="text-xs text-muted-foreground">{t("מחוברת ל-Drive שלך", "Connected to your Drive")}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={handleDisconnect} className="rounded-full text-muted-foreground">
              <LogOut className="h-4 w-4" />{" "}{t("ניתוק", "Disconnect")}
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4 rounded-3xl border border-border/60 bg-card p-6">
              <h2 className="font-display text-lg font-bold">{editingId ? t("עריכת הערה", "Edit note") : t("הערה חדשה", "New note")}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block">{t("שם המטופל/ת (רשות)", "Client name (optional)")}</Label>
                  <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder={t("לדוגמה: נועה", "For example: Maya")} />
                </div>
                <div>
                  <Label className="mb-1.5 block">{t("תאריך", "Date")}</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">{t("מה היה בטיפול", "What happened in the session")}</Label>
                <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder={t("מה עשינו, איך זה הלך, מה כדאי להמשיך בפעם הבאה...", "What we did, how it went, and what to continue next time...")} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSaveNote} disabled={saving} className="rounded-full bg-sage text-sage-foreground">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editingId ? t("עדכון ההערה", "Update note") : t("שמירה ל-Drive", "Save to Drive")}
                </Button>
                {editingId && (
                  <Button variant="outline" onClick={resetForm} className="rounded-full">
                    {t("הערה חדשה", "New note")}
                  </Button>
                )}
              </div>
            </div>

            <aside className="h-fit rounded-3xl border border-border/60 bg-card p-5">
              <h2 className="mb-3 font-display text-lg font-bold">{t("הערות קודמות", "Previous notes")}</h2>
              {loadingNotes ? (
                <p className="text-sm text-muted-foreground">{t("טוענת...", "Loading...")}</p>
              ) : notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("עדיין אין הערות שמורות.", "No saved notes yet.")}</p>
              ) : (
                <ul className="space-y-2">
                  {notes.map((file) => (
                    <li key={file.id} className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background p-2.5">
                      <button
                        type="button"
                        onClick={() => handleOpenNote(file)}
                        className="flex-1 truncate text-right text-sm font-medium hover:text-sage-foreground"
                      >
                        {file.name.replace(/\.json$/, "")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(file)}
                        aria-label={t("מחיקה", "Delete")}
                        className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>
        </>
      )}
    </AppShell>
  );
}
