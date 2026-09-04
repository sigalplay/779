import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Save,
  Printer,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Trash2,
  FolderOpen,
  ArrowRight,
  Upload,
  ShieldCheck,
  WandSparkles,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StoryCharacter, StoryScene, StoryBookPage } from "@/components/StoryCharacter";
import { PortraitCropper } from "@/components/PortraitCropper";
import { cn } from "@/lib/utils";
import {
  getSocialStories,
  saveSocialStory,
  deleteSocialStory,
  clearLegacySocialStorySensitiveData,
  uid,
} from "@/lib/storage";
import { STORY_TEMPLATES, createTemplateStory } from "@/lib/social-story-templates";
import { removePhotoBackgroundLocally } from "@/lib/local-photo-cutout";
import { useTranslator } from "@/lib/language";
import { useCmsCollection } from "@/lib/cms-content";

const GENERAL_SOCIAL_STORY_IDS = new Set(["losing-game", "waiting-turn", "not-getting-want", "personal-space"]);

function InteractiveStoryChoices({ story, onBranch, onEnding, endingsOnly = false }) {
  const options = endingsOnly ? story.endingOptions : story.branchOptions;
  const selected = endingsOnly ? story.endingChoice : story.interactiveChoice;
  if (!story.interactive || !options?.length || (endingsOnly && !story.interactiveChoice)) return null;
  return (
    <section className="rounded-3xl border border-sage/40 bg-sage/10 p-4 print:hidden">
      <h3 className="mb-1 text-center font-display text-lg font-black">
        {endingsOnly ? "הבחירה האחרונה — איך הסיפור ממשיך?" : "מה קורה אחרי ההפסד? בחרו את המשך העלילה"}
      </h3>
      <p className="mb-4 text-center text-sm text-muted-foreground">אין תשובה שצריך לנחש — בוחרים, מתבוננים ומספרים את הסיפור.</p>
      <div className={cn("grid gap-3", endingsOnly ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
        {options.map((option) => (
          <button key={option.value} type="button" onClick={() => (endingsOnly ? onEnding?.(option) : onBranch?.(option))} className={cn("overflow-hidden rounded-2xl border bg-background p-2 text-sm font-semibold transition", selected === option.value ? "border-primary ring-2 ring-primary/25" : "border-border hover:border-primary/60")}>
            {!endingsOnly && <span className="mb-1 block text-base font-black">{option.value}</span>}
            <img src={option.illustration} alt="" className="mb-2 aspect-square w-full rounded-xl object-contain" />
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default function SocialStories({ mode }) {
  const { language } = useTranslator();
  const cmsStoryTemplates = useCmsCollection("social_story", STORY_TEMPLATES);
  const [view, setView] = useState("create"); // "create" | "library"
  const [templateId, setTemplateId] = useState("toilet");
  const [childName, setChildName] = useState("");
  const [gender, setGender] = useState("girl"); // "boy" | "girl"
  const [illustrationStyle, setIllustrationStyle] = useState("new"); // "new" | "old"
  const [kindergartenRest, setKindergartenRest] = useState("sleep"); // "sleep" | "no-sleep"
  const [generating, setGenerating] = useState(false);
  const [story, setStory] = useState(null); // { id, title, pages: [{id, text, emoji}], childPhoto }
  const [libraryStories, setLibraryStories] = useState(() => getSocialStories());
  const [childPhoto, setChildPhoto] = useState(null);
  const [motherPhoto, setMotherPhoto] = useState(null);
  const [cropRequest, setCropRequest] = useState(null);
  const [storyMode, setStoryMode] = useState("edit"); // "edit" | "view"
  const [viewPage, setViewPage] = useState(0);
  const isGeneralSocialStory = GENERAL_SOCIAL_STORY_IDS.has(templateId);

  useEffect(() => {
    clearLegacySocialStorySensitiveData();
    return () => { setChildPhoto(null); setMotherPhoto(null); };
  }, []);

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 12 * 1024 * 1024) {
      toast.error("אפשר להעלות תמונת JPG או PNG עד 12MB");
      return;
    }
    setGenerating(true);
    try {
      const cutout = await removePhotoBackgroundLocally(file);
      setCropRequest({ source: cutout, role: "child", label: gender === "girl" ? "הילדה" : "הילד" });
    } catch {
      toast.error("לא הצלחנו להסיר את הרקע. נסו תמונה מוארת שבה רואים פנים וכתפיים.");
    } finally {
      setGenerating(false);
      e.target.value = "";
    }
  }

  async function handleMotherPhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 12 * 1024 * 1024) {
      toast.error("אפשר להעלות תמונת JPG או PNG עד 12MB");
      return;
    }
    setGenerating(true);
    try {
      const cutout = await removePhotoBackgroundLocally(file);
      setCropRequest({ source: cutout, role: "mother", label: "האמא" });
    } catch {
      toast.error("לא הצלחנו להכין את התמונה. נסו צילום חזיתי ומואר של פנים וכתפיים.");
    } finally {
      setGenerating(false);
      e.target.value = "";
    }
  }

  function removePhoto() {
    setChildPhoto(null);
    if (story) setStory((prev) => ({ ...prev, childPhoto: null }));
    toast.success("התמונה נמחקה מהמחולל");
  }

  function removeMotherPhoto() {
    setMotherPhoto(null);
    if (story) setStory((prev) => ({ ...prev, motherPhoto: null }));
    toast.success("חזרנו לפנים המאוירות של האמא");
  }

  function confirmCrop(photo) {
    if (cropRequest?.role === "mother") {
      setMotherPhoto(photo);
      if (story) setStory((prev) => ({ ...prev, motherPhoto: photo }));
    } else {
      setChildPhoto(photo);
      if (story) setStory((prev) => ({ ...prev, childPhoto: photo }));
    }
    setCropRequest(null);
    toast.success("התמונה הותאמה. אפשר לראות אותה בתצוגה המקדימה.");
  }

  function handleGenerate() {
    const selectedGender = gender || "girl";
    const baseResult = createTemplateStory(templateId, childName, selectedGender, kindergartenRest, illustrationStyle, language);
    const cmsTemplate = cmsStoryTemplates.find((template) => template.id === templateId);
    let result = {
      ...baseResult,
      ...(cmsTemplate?.generatedTitle ? { title: cmsTemplate.generatedTitle } : {}),
      ...(Array.isArray(cmsTemplate?.pages) ? { pages: cmsTemplate.pages } : {}),
    };
    if (templateId === "losing-game") {
      result = {
        ...result,
        wordless: true,
        interactive: true,
        // Cover + the first two scenes are the fixed 1–3 opening.
        pages: result.pages.slice(0, 2),
        branchOptions: [
          ["4", "כועס/ת על מי שמולו/ה", `/icon-bank/social-stories/losing-game/${selectedGender}/choice-4-angry.png`],
          ["5", "מדבר/ת על ההרגשה", `/icon-bank/social-stories/losing-game/${selectedGender}/page-5.webp`],
          ["6", "מפרגן/ת למי שניצח/ה", `/icon-bank/social-stories/losing-game/${selectedGender}/page-6.webp`],
        ],
        endingOptions: [
          ["winner-walks-away", selectedGender === "girl" ? "הילדה שניצחה מתרחקת" : "הילד שניצח מתרחק", `/icon-bank/social-stories/losing-game/${selectedGender}/ending-winner-walks-away.png`],
          ["different-game", selectedGender === "girl" ? "הן משחקות במשחק אחר" : "הם משחקים במשחק אחר", `/icon-bank/social-stories/losing-game/${selectedGender}/ending-different-game.png`],
        ],
      };
    }
    const coverPage = {
      id: uid(),
      text: result.title,
      emoji: "📖",
      illustration: result.cover,
      isCover: true,
      integrated: !!result.coverIntegrated,
      faceReplacement: result.coverFaceReplacement || [],
      faceLayout: result.coverFaceLayout || null,
      faceBase: result.coverFaceBase || null,
    };
    const contentPages = result.pages.map(([text, emoji, illustration, faceReplacement, faceLayout, faceBase]) => ({ id: uid(), text: result.wordless ? "" : text, emoji, illustration, integrated: true, faceReplacement, faceLayout, faceBase }));
    const branchOptions = (result.branchOptions || []).map(([value, label, illustration]) => ({ value, label, illustration, id: uid(), text: "", integrated: true }));
    const endingOptions = (result.endingOptions || []).map(([value, label, illustration]) => ({ value, label, illustration, id: uid(), text: "", integrated: true }));
    setStory({ id: uid(), title: result.title, gender: selectedGender, templateId, kindergartenRest, illustrationStyle, wordless: !!result.wordless, interactive: !!result.interactive, branchOptions, endingOptions, pages: [coverPage, ...contentPages], childPhoto: result.personalized === false ? null : childPhoto, motherPhoto: result.personalized === false ? null : motherPhoto });
    setStoryMode("edit");
    setViewPage(0);
    toast.success("הסיפור מוכן לעריכה!");
  }

  function updatePage(id, patch) {
    setStory((prev) => ({ ...prev, pages: prev.pages.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  }

  function updateKindergartenRest(value) {
    setKindergartenRest(value);
    setStory((prev) => {
      if (!prev || prev.templateId !== "kindergarten") return prev;
      const illustration = `/icon-bank/social-stories/kindergarten/daily-routine-${value === "no-sleep" ? "no-sleep" : "with-sleep"}.png`;
      return {
        ...prev,
        kindergartenRest: value,
        pages: prev.pages.map((page) => page.text === "במהלך היום אני אשחק במשחקים, אוכל עם כולם, אשתתף במפגש ואוכל לנוח כשאצטרך."
          ? { ...page, illustration }
          : page),
      };
    });
  }
  function removePage(id) {
    setStory((prev) => ({ ...prev, pages: prev.pages.filter((p) => p.id !== id) }));
  }
  function movePage(index, dir) {
    setStory((prev) => {
      const pages = [...prev.pages];
      const target = index + dir;
      if (target < 0 || target >= pages.length) return prev;
      [pages[index], pages[target]] = [pages[target], pages[index]];
      return { ...prev, pages };
    });
  }
  function addPage() {
    setStory((prev) => ({ ...prev, pages: [...prev.pages, { id: uid(), text: "", emoji: "✨", illustration: null }] }));
  }

  function chooseLosingBranch(option) {
    setStory((prev) => ({ ...prev, interactiveChoice: option.value, endingChoice: null, pages: [...prev.pages.slice(0, 3), { ...option, id: uid(), text: "", integrated: true }] }));
    if (storyMode === "view") setViewPage(3);
  }

  function chooseLosingEnding(option) {
    setStory((prev) => ({ ...prev, endingChoice: option.value, pages: [...prev.pages.slice(0, 4), { ...option, id: uid(), text: "", integrated: true }] }));
    if (storyMode === "view") setViewPage(4);
  }

  function handleSaveStory() {
    if (!story) return;
    const { childPhoto: _privatePhoto, motherPhoto: _privateMotherPhoto, ...safeStory } = story;
    const toSave = { ...safeStory, created_at: new Date().toISOString() };
    saveSocialStory(toSave);
    setLibraryStories(getSocialStories());
    toast.success("הסיפור נשמר ללא תמונת הילד/ה");
  }

  function handleDelete(id) {
    deleteSocialStory(id);
    setLibraryStories((prev) => prev.filter((s) => s.id !== id));
    toast.success("הסיפור נמחק");
  }

  function handleOpenFromLibrary(s) {
    setStory({ ...s, gender: s.gender || "girl", wordless: !!s.wordless, pages: s.pages.map((p) => ({ ...p, id: p.id ?? uid() })), childPhoto: childPhoto ?? null, motherPhoto: motherPhoto ?? null });
    setStoryMode("edit");
    setViewPage(0);
    setView("create");
  }

  return (
    <AppShell mode={mode}>
      {cropRequest && <PortraitCropper source={cropRequest.source} roleLabel={cropRequest.label} onCancel={() => setCropRequest(null)} onConfirm={confirmCrop} />}
      <div className="mb-6 print:hidden">
        <h1 className="font-display text-3xl font-black md:text-4xl">סיפורים חברתיים</h1>
        <p className="mt-1 text-muted-foreground">
          מסבירים לילד/ה מצב חברתי או יומיומי בסיפור קצר, רגוע וחיובי - כדי להתכונן אליו מראש.
        </p>
      </div>

      <div className="mb-6 rounded-3xl border border-sky/50 bg-sky/10 p-5 print:hidden md:p-6">
        <p className="text-sm leading-relaxed text-foreground/90">
          סיפור חברתי מציג לילד/ה מצב, רצף פעולות או ציפייה חברתית בצורה חזותית, ברורה וצפויה. הוא יכול לסייע בהבנת מה שעומד לקרות,
          להפחית חוסר ודאות, להכין מראש לתגובה מתאימה ולתת מילים וכלים להתמודדות — בקצב שמתאים לילד/ה.
        </p>
      </div>

      <div className="mb-6 inline-flex rounded-full bg-muted p-1 print:hidden">
        <button
          onClick={() => setView("create")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            view === "create" ? "bg-background shadow-sm" : "text-muted-foreground",
          )}
        >
          יצירת סיפור
        </button>
        <button
          onClick={() => setView("library")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            view === "library" ? "bg-background shadow-sm" : "text-muted-foreground",
          )}
        >
          הסיפורים שלי {libraryStories.length > 0 ? `(${libraryStories.length})` : ""}
        </button>
      </div>

      {view === "library" ? (
        <LibraryView stories={libraryStories} onOpen={handleOpenFromLibrary} onDelete={handleDelete} />
      ) : (
        <>
          {!story && (
            <div className="space-y-5 rounded-3xl border border-border/60 bg-card p-6 print:hidden">
              <div>
                <Label className="mb-2 block">איזה סיפור נכין?</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {cmsStoryTemplates.map((template) => (
                    <button key={template.id} type="button" onClick={() => { setTemplateId(template.id); if (template.style1Only) setIllustrationStyle("new"); }}
                      className={cn("overflow-hidden rounded-2xl border text-right transition", templateId === template.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:bg-muted/50")}>
                      <img src={template.illustration} alt="" className="h-28 w-full bg-white object-contain p-1" />
                      <span className="block p-4">
                        <span className="font-bold">{template.title}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">{template.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {templateId !== "kindergarten" && !isGeneralSocialStory && <div className="rounded-2xl border border-sage/30 bg-sage/10 p-4">
                <div className="mb-3 flex items-start gap-2 text-sm">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sage-foreground" />
                  <div><p className="font-bold">התמונה נשארת במכשיר שלך</p><p className="text-xs text-muted-foreground">מודל מקומי מסיר את הרקע בתוך הדפדפן. התמונה אינה נשלחת לשרת, אינה נשמרת בספרייה ונמחקת ביציאה מהמחולל.</p></div>
                </div>
                <div className="flex items-center gap-4">
                <StoryCharacter photo={childPhoto} gender={gender} size={82} />
                <div className="flex-1">
                  <p className="mb-1 text-sm font-semibold">תמונת הילד/ה – פנים וכתפיים (רשות)</p>
                  <p className="mb-2 text-xs text-muted-foreground">
                    עדיף צילום חזיתי ומואר על רקע פשוט. בסיפור הגן התמונה תשתלב בעמוד „בקרוב אני מתחילה ללכת לגן חדש”. בפעם הראשונה המודל ייטען וייתכן שתהיה המתנה קצרה.
                  </p>
                  <div className="flex flex-wrap gap-2"><label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted">
                    <Upload className="h-3.5 w-3.5" />
                    {generating ? "מסיר רקע..." : childPhoto ? "החלפת תמונה" : "העלאת תמונה"}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>{childPhoto && <button type="button" onClick={removePhoto} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" />מחיקת התמונה</button>}</div>
                </div>
                </div>
              </div>}

              {templateId === "kindergarten" && (
                <div className="overflow-hidden rounded-3xl border border-sage/30 bg-sage/10">
                  <div className="border-b border-sage/25 px-5 py-4 text-center">
                    <p className="font-display text-lg font-black">התאמת הדמויות לסיפור (רשות)</p>
                    <p className="mt-1 text-xs text-muted-foreground">ללא העלאת תמונות, האיורים המקוריים יישארו בדיוק כפי שהם.</p>
                  </div>
                  <div>
                    <FaceUploadPanel title={`פני ${gender === "boy" ? "הילד" : "הילדה"} בסיפור (רשות)`} description="התמונה תשתלב בעמוד הראשון בלבד. בחרו תמונה חזיתית הכוללת את הראש, השיער והצוואר." photo={childPhoto} generating={generating} onUpload={handlePhotoUpload} onRemove={removePhoto} uploadLabel={`החלפת תמונת ${gender === "boy" ? "הילד" : "הילדה"}`} emptyLabel={`הוספת תמונת ${gender === "boy" ? "הילד" : "הילדה"}`} />
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                {!isGeneralSocialStory && <div>
                  <Label className="mb-1.5 block">שם הילד/ה (רשות)</Label>
                  <Input value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="לדוגמה: נועה" />
                </div>}
                <div>
                  <Label className="mb-1.5 block">בחירת דמות ולשון</Label>
                  <div className="flex gap-2">
                    {[
                      { v: "girl", label: "בת" },
                      { v: "boy", label: "בן" },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => setGender(opt.v)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm",
                          gender === opt.v ? "border-primary bg-primary text-primary-foreground" : "border-border",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                {!isGeneralSocialStory && <div>
                  <Label className="mb-1.5 block">בחר סגנון</Label>
                  <div className="flex gap-2">
                    {[
                      {
                        value: "new",
                        label: "סגנון 1",
                        preview: templateId === "kindergarten"
                          ? `/icon-bank/social-stories/kindergarten-cover-${gender}.png`
                          : `/icon-bank/social-stories/${templateId}-cover-${gender}.webp`,
                      },
                      { value: "old", label: "סגנון 2", preview: `/icon-bank/social-stories/${templateId}.webp` },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setIllustrationStyle(option.value)}
                        className={cn(
                          "flex items-center gap-2 rounded-2xl border p-1.5 pe-3 text-sm",
                          illustrationStyle === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border",
                        )}
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-0.5">
                          <img src={option.preview} alt="" aria-hidden="true" className="h-full w-full object-contain" />
                        </span>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>}
              </div>

              {templateId === "kindergarten" && (
                <div className="rounded-2xl border border-sage/30 bg-sage/10 p-4">
                  <Label className="mb-2 block">האם ישנים בגן?</Label>
                  <p className="mb-3 text-xs text-muted-foreground">הבחירה משנה רק את איור המנוחה. המשפט בסיפור נשאר זהה.</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "sleep", label: "עם שינה" },
                      { value: "no-sleep", label: "בלי שינה" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setKindergartenRest(option.value)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm font-semibold",
                          kindergartenRest === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleGenerate} disabled={generating} className="w-full rounded-full">
                <WandSparkles className="h-4 w-4" /> יצירת הסיפור האישי
              </Button>
            </div>
          )}

          {story && (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => setStory(null)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <ArrowRight className="h-4 w-4" /> סיפור חדש
                </button>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => { setStoryMode(storyMode === "view" ? "edit" : "view"); setViewPage(0); }}
                    variant={storyMode === "view" ? "default" : "outline"}
                    className="rounded-full"
                  >
                    {storyMode === "view" ? <><Pencil className="h-4 w-4" /> חזרה לעריכה</> : <><Eye className="h-4 w-4" /> הצגת הסיפור</>}
                  </Button>
                  <Button onClick={handleSaveStory} variant="outline" className="rounded-full">
                    <Save className="h-4 w-4" /> שמירה לספרייה
                  </Button>
                  <Button onClick={() => window.print()} variant="outline" className="rounded-full">
                    <Printer className="h-4 w-4" /> הדפסה
                  </Button>
                </div>
              </div>

              <div className="hidden print:block">
                {story.pages.map((page, i) => (
                  <StoryBookPage
                    key={page.id}
                    page={page}
                    index={i}
                    total={story.pages.length}
                    photo={story.childPhoto}
                    facePhotos={{ child: story.childPhoto, mother: story.motherPhoto }}
                    gender={story.gender}
                    wordless={story.wordless}
                  />
                ))}
              </div>

              {storyMode === "view" ? (
                <div className="print:hidden">
                  <h2 className="mb-4 text-center font-display text-2xl font-black">{story.title}</h2>
                  <div className="mx-auto max-w-[540px] overflow-hidden rounded-sm shadow-xl">
                    <StoryBookPage
                      page={story.pages[viewPage]}
                      index={viewPage}
                      total={story.pages.length}
                      photo={story.childPhoto}
                      facePhotos={{ child: story.childPhoto, mother: story.motherPhoto }}
                      gender={story.gender}
                      wordless={story.wordless}
                    />
                  </div>
                  {story.interactive && viewPage === 2 && (
                    <div className="mx-auto mt-5 max-w-4xl"><InteractiveStoryChoices story={story} onBranch={chooseLosingBranch} /></div>
                  )}
                  {story.interactive && viewPage === 3 && story.interactiveChoice && (
                    <div className="mx-auto mt-5 max-w-3xl"><InteractiveStoryChoices story={story} onEnding={chooseLosingEnding} endingsOnly /></div>
                  )}
                  <div className="mx-auto mt-5 flex max-w-[540px] items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setViewPage((p) => Math.max(0, p - 1))}
                      disabled={viewPage === 0}
                    >
                      <ChevronRight className="h-4 w-4" /> העמוד הקודם
                    </Button>
                    <div className="flex flex-wrap justify-center gap-1.5" aria-label="בחירת עמוד">
                      {story.pages.map((page, i) => (
                        <button
                          key={page.id}
                          type="button"
                          onClick={() => setViewPage(i)}
                          aria-label={`עמוד ${i + 1}`}
                          className={cn("h-2.5 w-2.5 rounded-full transition", i === viewPage ? "bg-primary" : "bg-border")}
                        />
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setViewPage((p) => Math.min(story.pages.length - 1, p + 1))}
                      disabled={viewPage === story.pages.length - 1}
                    >
                      העמוד הבא <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
              <div className="print:hidden">
              <Input
                value={story.title}
                onChange={(e) => setStory({ ...story, title: e.target.value })}
                className="mb-4 border-none bg-transparent text-center font-display text-2xl font-black shadow-none focus-visible:ring-0"
              />

              {!GENERAL_SOCIAL_STORY_IDS.has(story.templateId) && !(story.templateId === "kindergarten" && story.gender === "girl") && <div className="mb-5 flex flex-wrap items-center gap-4 rounded-2xl border border-sage/30 bg-sage/10 p-4">
                <StoryCharacter photo={story.childPhoto} gender={story.gender} size={76} />
                <div className="flex-1">
                  <p className="font-bold">פני הילד/ה בסיפור (רשות)</p>
                  <p className="mb-2 text-xs text-muted-foreground">
                    ללא תמונה יישארו הפנים המאוירות. בסיפור הגן, תמונה שהועלתה תשתלב בעמוד „בקרוב אני מתחילה ללכת לגן חדש”.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted">
                      <Upload className="h-3.5 w-3.5" />
                      {generating ? "מסיר רקע..." : story.childPhoto ? "החלפת תמונה" : "הוספת תמונת הילד/ה"}
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    {story.childPhoto && <button type="button" onClick={removePhoto} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" />חזרה לראש המאויר</button>}
                  </div>
                </div>
              </div>}

              {story.templateId === "kindergarten" && story.gender === "girl" && (
                <div className="mb-5 overflow-hidden rounded-3xl border border-sage/30 bg-sage/10">
                  <div className="border-b border-sage/25 px-5 py-4 text-center">
                    <p className="font-display text-lg font-black">התאמת הדמויות לסיפור (רשות)</p>
                    <p className="mt-1 text-xs text-muted-foreground">אפשר להחליף או להסיר כל תמונה בנפרד. בלי תמונה יוצגו הפנים המאוירות.</p>
                  </div>
                  <div>
                    <FaceUploadPanel title={`פני ${story.gender === "boy" ? "הילד" : "הילדה"} בסיפור (רשות)`} description="התמונה תשתלב בעמוד הראשון בלבד, לאחר חיתוך הראש, השיער והצוואר." photo={story.childPhoto} generating={generating} onUpload={handlePhotoUpload} onRemove={removePhoto} uploadLabel={`החלפת תמונת ${story.gender === "boy" ? "הילד" : "הילדה"}`} emptyLabel={`הוספת תמונת ${story.gender === "boy" ? "הילד" : "הילדה"}`} />
                  </div>
                  <div className="border-t border-sage/30 px-5 py-4">
                  <p className="font-bold">האם ישנים בגן?</p>
                  <p className="mb-3 text-xs text-muted-foreground">אפשר לשנות גם אחרי יצירת הסיפור. המשפט נשאר זהה ורק איור המנוחה מתחלף.</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "sleep", label: "עם שינה" },
                      { value: "no-sleep", label: "בלי שינה" },
                    ].map((option) => (
                      <button key={option.value} type="button" onClick={() => updateKindergartenRest(option.value)}
                        className={cn("rounded-full border px-4 py-2 text-sm font-semibold", (story.kindergartenRest || "sleep") === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background")}
                      >{option.label}</button>
                    ))}
                  </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {story.pages.map((page, i) => (
                  <div key={page.id} className="space-y-6">
                  {story.interactive && i === 3 && <InteractiveStoryChoices story={story} onBranch={chooseLosingBranch} />}
                  <div className="relative grid items-center gap-5 rounded-3xl border border-border/60 bg-card p-5 md:grid-cols-[minmax(260px,360px)_1fr]">
                    <StoryScene
                      photo={i === 0 ? story.childPhoto : null}
                      facePhotos={i === 0 ? { child: story.childPhoto } : {}}
                      faceLayout={i === 0 ? page.faceLayout : null}
                      faceBase={i === 0 ? page.faceBase : null}
                      gender={story.gender}
                      illustration={page.illustration}
                      integrated={!!page.integrated}
                      className="w-full"
                    />
                    <div>
                      <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-sage/30 text-sm font-bold text-sage-foreground">
                        {i + 1}
                      </span>
                      <Textarea
                        value={page.text}
                        onChange={(e) => updatePage(page.id, { text: e.target.value })}
                        rows={4}
                      />
                    </div>
                    <div className="absolute left-2 top-2 flex flex-col items-center gap-1">
                      <button
                        type="button"
                        onClick={() => movePage(i, -1)}
                        disabled={i === 0}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-30"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePage(i, 1)}
                        disabled={i === story.pages.length - 1}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-30"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePage(page.id)}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {story.interactive && i === 3 && <InteractiveStoryChoices story={story} onEnding={chooseLosingEnding} endingsOnly />}
                  </div>
                ))}
                {story.interactive && story.pages.length === 3 && <InteractiveStoryChoices story={story} onBranch={chooseLosingBranch} />}
              </div>

              <Button onClick={addPage} variant="outline" className="mt-4 w-full rounded-full">
                <Plus className="h-4 w-4" /> הוספת עמוד
              </Button>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 border-t border-border/60 pt-6">
                <Button
                  onClick={() => { setStoryMode("view"); setViewPage(0); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  variant="outline"
                  className="rounded-full px-5"
                >
                  <Eye className="h-4 w-4" /> הצגת הסיפור
                </Button>
                <Button onClick={handleSaveStory} variant="outline" className="rounded-full px-5">
                  <Save className="h-4 w-4" /> שמירה לספרייה
                </Button>
                <Button onClick={() => window.print()} variant="outline" className="rounded-full px-5">
                  <Printer className="h-4 w-4" /> הדפסה
                </Button>
              </div>
              </div>
              )}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}

function FaceUploadPanel({ title, description, photo, generating, onUpload, onRemove, uploadLabel, emptyLabel }) {
  return (
    <section className="flex min-h-[168px] items-center gap-4 p-5">
      <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[45%] border border-sage/25 bg-white/80">
        {photo ? <img src={photo} alt="תצוגה מקדימה" className="h-full w-full object-contain" /> : <span className="text-center text-[11px] font-medium text-muted-foreground">תצוגה<br />מקדימה</span>}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold">{title}</h3>
        <p className="mb-3 mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold shadow-sm transition hover:bg-muted">
            <Upload className="h-3.5 w-3.5" />
            {generating ? "מכין תמונה..." : photo ? uploadLabel : emptyLabel}
            <input type="file" accept="image/*" onChange={onUpload} disabled={generating} className="hidden" />
          </label>
          {photo && <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" />חזרה לפנים המאוירות</button>}
        </div>
      </div>
    </section>
  );
}

function LibraryView({ stories, onOpen, onDelete }) {
  if (stories.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
        עדיין אין סיפורים שמורים. עברו ל"יצירת סיפור" כדי להתחיל.
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {stories.map((s) => (
        <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/60 bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage/20 text-xl">
              <FolderOpen className="h-5 w-5 text-sage-foreground" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.pages?.length ?? 0} עמודים</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => onOpen(s)} variant="outline" className="rounded-full">
              פתיחה לעריכה
            </Button>
            <Button onClick={() => onDelete(s.id)} variant="ghost" className="rounded-full text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
