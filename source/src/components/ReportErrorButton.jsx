import { useState } from "react";
import { useLocation } from "react-router-dom";
import { MailWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/language";

const REPORT_EMAIL = "sigalsplay@gmail.com";

export function ReportErrorButton() {
  const { pathname, search } = useLocation();
  const [language] = useLanguage();
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState("");
  const isHebrew = language === "he";

  const sendReport = () => {
    const pageUrl = `${window.location.origin}${pathname}${search}`;
    const message = isHebrew
      ? `היי סיגל, מצאתי טעות באתר „בואו נשחק”.\n\nפירוט: ${details.trim() || "לא הוזן פירוט"}\nעמוד: ${document.title}\nקישור: ${pageUrl}`
      : `Hi Sigal, I found an error on the Let's Play website.\n\nDetails: ${details.trim() || "No details provided"}\nPage: ${document.title}\nLink: ${pageUrl}`;
    const subject = isHebrew ? "דיווח על טעות באתר בואו נשחק" : "Error report — Let's Play";
    window.location.href = `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    setOpen(false);
    setDetails("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="fixed bottom-24 left-4 z-40 flex min-h-11 items-center gap-2 rounded-full border border-coral/30 bg-white px-4 py-2 text-sm font-bold text-foreground shadow-lg transition hover:-translate-y-0.5 hover:border-coral/60 hover:shadow-xl md:bottom-6 print:hidden"
          aria-label={isHebrew ? "דווח על טעות" : "Report an error"}
        >
          <MailWarning className="h-4 w-4 text-coral" />
          <span>{isHebrew ? "דווח על טעות" : "Report an error"}</span>
        </button>
      </DialogTrigger>
      <DialogContent dir={isHebrew ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{isHebrew ? "מצאת טעות?" : "Found an error?"}</DialogTitle>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {isHebrew ? "כתבו לי בקצרה מה לא תקין. שם העמוד והקישור יצורפו לדיווח באופן אוטומטי." : "Briefly describe what is wrong. The page name and link will be added automatically."}
          </p>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="error-report-details">{isHebrew ? "מה הטעות?" : "What is the error?"}</Label>
          <Textarea
            id="error-report-details"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder={isHebrew ? "לדוגמה: האיור בשלב 3 אינו מתאים להסבר..." : "For example: the illustration in step 3 does not match..."}
            rows={5}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button type="button" onClick={sendReport} className="w-full rounded-full">
            <MailWarning className="h-4 w-4" />
            {isHebrew ? "שליחת הדיווח באימייל" : "Send report by email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
