import { useEffect, useRef, useState } from "react";
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
import { prepareUploadedPhoto, removePhotoBackground } from "@/lib/local-photo-cutout";
import { useTranslator } from "@/lib/language";
import { useCmsCollection } from "@/lib/cms-content";

// סיפורים כלליים עם בחירות בעלילה: בלי שם הילד ובלי תמונה, והילד בוחר איך הסיפור ממשיך.
const INTERACTIVE_STORIES = new Set(["losing-game", "not-getting-want", "personal-space"]);

function storyChoices(templateId, gender, language) {
  const base = `/icon-bank/social-stories/${templateId}/${gender}`;
  const girl = gender === "girl";
  const he = language !== "en";
  const choices = {
    "losing-game": {
      branchPrompt: he ? "מה קורה אחרי ההפסד? בחרו את המשך העלילה" : "What happens after losing? Choose how the story continues",
      endingPrompt: he ? "הבחירה האחרונה — איך הסיפור ממשיך?" : "One last choice — how does the story continue?",
      branchOptions: [
        ["angry", he ? "כועס/ת על מי שמולו/ה" : "Gets angry with the other child", `${base}/choice-4-angry.png`],
        ["talks", he ? "מדבר/ת על ההרגשה" : "Talks about the feeling", `${base}/page-5.webp`],
        ["congratulates", he ? "מפרגן/ת למי שניצח/ה" : "Congratulates the winner", `${base}/page-6.webp`],
      ],
      endingOptions: [
        ["winner-walks-away", he ? (girl ? "הילדה שניצחה מתרחקת" : "הילד שניצח מתרחק") : "The winner walks away", `${base}/ending-winner-walks-away.png`],
        ["different-game", he ? (girl ? "הן משחקות במשחק אחר" : "הם משחקים במשחק אחר") : "They play a different game", `${base}/ending-different-game.png`],
      ],
    },
    "waiting-turn": {
      branchPrompt: he ? "איך הדמות בוחרת לחכות לתור?" : "How does the character choose to wait?",
      endingPrompt: he ? "מה קורה כשהתור מתקדם?" : "What happens when the turn moves on?",
      branchOptions: [
        ["moves-closer", he ? "מתקרב/ת ובודק/ת אם התור הגיע" : "Moves closer to check whether it is their turn", `${base}/page-3.webp`],
        ["breathes", he ? "נושם/ת ומחכה במקום המסומן" : "Breathes and waits at the marked spot", `${base}/page-4.webp`],
        ["asks-adult", he ? "מבקש/ת עזרה ממבוגר" : "Asks an adult for help", `${base}/page-6.webp`],
      ],
      endingOptions: [
        ["turn-free", he ? "הילד/ה שלפניו/ה מסיים/ת והתור מתפנה" : "The child ahead finishes and the turn becomes free", `${base}/page-5.webp`],
        ["waits-again", he ? "ממשיכים להמתין עד שהתור מגיע" : "Keeps waiting until the turn arrives", `${base}/page-2.webp`],
      ],
    },
    "not-getting-want": {
      branchPrompt: he ? "איך הדמות בוחרת להגיב כשאומרים לה „לא” או „לא עכשיו”?" : "How does the character choose to respond to ‘no’ or ‘not now’?",
      endingPrompt: he ? "מה הדמות בוחרת לעשות עכשיו?" : "What does the character choose to do now?",
      branchOptions: [
        ["breathes", he ? "עוצר/ת ונושם/ת" : "Pauses and breathes", `${base}/page-3.webp`],
        ["protests", he ? "כועס/ת ומוחה" : "Gets angry and protests", `${base}/page-4.webp`],
        ["considers", he ? "מקשיב/ה לאפשרויות אחרות" : "Listens to other choices", `${base}/page-5.webp`],
      ],
      endingOptions: [
        ["different-activity", he ? "בוחר/ת פעילות אחרת" : "Chooses a different activity", `${base}/page-6.webp`],
        ["talks-to-adult", he ? "מדבר/ת עם המבוגר על האכזבה" : "Talks with the adult about the disappointment", `${base}/page-2.webp`],
      ],
    },
    "personal-space": {
      branchPrompt: he ? "איך הדמות בוחרת להגיב כשהיא מזהה שצריך יותר מרחב?" : "How does the character respond when someone needs more space?",
      endingPrompt: he ? "איך הן בוחרות להמשיך להיות יחד?" : "How do they choose to stay connected?",
      branchOptions: [
        ["notices", he ? "עוצר/ת ומתבונן/ת בסימנים" : "Stops and notices the signals", `${base}/page-3.webp`],
        ["steps-back", he ? "מקשיב/ה וזז/ה מעט לאחור" : "Listens and takes a step back", `${base}/page-4.webp`],
        ["asks", he ? "שואל/ת מה נעים ומתאים" : "Asks what feels comfortable", `${base}/page-5.webp`],
      ],
      endingOptions: [
        ["comfortable-distance", he ? "נשארות יחד במרחק שנעים לשתיהן" : "They stay together at a comfortable distance", `${base}/page-1.webp`],
        ["high-five", he ? "בוחרות בכיף במקום בחיבוק" : "They choose a high-five instead of a hug", `${base}/page-6.webp`],
      ],
    },
  }[templateId];
  if (!choices) return null;
  return {
    ...choices,
    choiceInstructions: he
      ? "אין תשובה שצריך לנחש — בוחרים, מתבוננים ומספרים יחד את הסיפור."
      : "There is no answer to guess — choose, look, and tell the story together.",
  };
}

function StoryChoices({ story, onBranch, onEnding, endingsOnly = false }) {
  const options = endingsOnly ? story.endingOptions : story.branchOptions;
  const selected = endingsOnly ? story.endingChoice : story.interactiveChoice;
  if (!story.interactive || !options?.length || (endingsOnly && !story.interactiveChoice)) return null;
  return (
    <section className="rounded-3xl border border-sage/40 bg-sage/10 p-4 print:hidden">
      <h3 className="mb-1 text-center font-display text-lg font-black">{endingsOnly ? story.endingPrompt : story.branchPrompt}</h3>
      <p className="mb-4 text-center text-sm text-muted-foreground">{story.choiceInstructions}</p>
      <div className={cn("grid gap-3", endingsOnly ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
        {options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            onClick={() => (endingsOnly ? onEnding?.(option) : onBranch?.(option))}
            className={cn(
              "overflow-hidden rounded-2xl border bg-background p-2 text-sm font-semibold transition",
              selected === option.value ? "border-primary ring-2 ring-primary/25" : "border-border hover:border-primary/60",
            )}
          >
            {!endingsOnly && <span className="mb-1 block text-base font-black">{index + 1}</span>}
            <img src={option.illustration} alt="" className="mb-2 aspect-square w-full rounded-xl object-contain" />
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default function SocialStories({ mode }) {
  const { language, t } = useTranslator();
  // "מחכים לתור" קיים בתבניות אך עדיין לא מוצג לבחירה.
  const cmsStoryTemplates = useCmsCollection("social_story", STORY_TEMPLATES).filter((template) => template.id !== "waiting-turn");
  const [view, setView] = useState("create"); // "create" | "library"
  const [templateId, setTemplateId] = useState("toilet");
  const [childName, setChildName] = useState("");
  const [gender, setGender] = useState("girl"); // "boy" | "girl"
  const [illustrationStyle, setIllustrationStyle] = useState("new"); // "new" | "old"
  const [kindergartenRest, setKindergartenRest] = useState("sleep"); // "sleep" | "no-sleep"
  const [generating, setGenerating] = useState(false);
  const [story, setStory] = useState(null);
  const [libraryStories, setLibraryStories] = useState(() => getSocialStories());
  const [childPhoto, setChildPhoto] = useState(null);
  const [originalChildPhoto, setOriginalChildPhoto] = useState(null);
  const [motherPhoto, setMotherPhoto] = useState(null);
  const [, setOriginalMotherPhoto] = useState(null);
  const [cropRequest, setCropRequest] = useState(null);
  const [storyMode, setStoryMode] = useState("edit"); // "edit" | "view"
  const [viewPage, setViewPage] = useState(0);
  const optionsRef = useRef(null);
  const interactiveTemplate = INTERACTIVE_STORIES.has(templateId);

  useEffect(() => {
    clearLegacySocialStorySensitiveData();
    return () => { setChildPhoto(null); setMotherPhoto(null); };
  }, []);

  function selectTemplate(template) {
    setTemplateId(template.id);
    if (template.style1Only) setIllustrationStyle("new");
    // בפלאפון גוללים אל אפשרויות הסיפור אחרי הבחירה.
    if (!window.matchMedia("(max-width: 639px)").matches) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => optionsRef.current?.scrollIntoView({ behavior, block: "start" }));
    });
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 12 * 1024 * 1024) {
      toast.error(t("אפשר להעלות תמונת JPG או PNG עד 12MB", "You can upload a JPG or PNG image up to 12 MB."));
      return;
    }
    setGenerating(true);
    try {
      const photo = await prepareUploadedPhoto(file);
      setCropRequest({ source: photo, role: "child", label: gender === "girl" ? "הילדה" : "הילד", backgroundRemoved: false });
    } catch {
      toast.error(t("לא הצלחנו לפתוח את התמונה. נסו תמונת JPG או PNG אחרת.", "We couldn't open the photo. Try a different JPG or PNG image."));
    } finally {
      setGenerating(false);
      e.target.value = "";
    }
  }

  function removePhoto() {
    setChildPhoto(null);
    setOriginalChildPhoto(null);
    if (story) setStory((prev) => ({ ...prev, childPhoto: null }));
    toast.success(t("התמונה נמחקה מהמחולל", "Photo removed from the builder."));
  }

  function confirmCrop(photo) {
    if (cropRequest?.role === "mother") {
      setMotherPhoto(photo);
      if (!cropRequest.backgroundRemoved) setOriginalMotherPhoto(photo);
      if (story) setStory((prev) => ({ ...prev, motherPhoto: photo }));
    } else {
      setChildPhoto(photo);
      if (!cropRequest?.backgroundRemoved) setOriginalChildPhoto(photo);
      if (story) setStory((prev) => ({ ...prev, childPhoto: photo }));
    }
    setCropRequest(null);
    toast.success(t("התמונה הותאמה. אפשר לראות אותה בתצוגה המקדימה.", "Photo adjusted. You can now see it in the preview."));
  }

  async function removeBackground(role) {
    const source = childPhoto;
    if (!source) return;
    setGenerating(true);
    try {
      const cutout = await removePhotoBackground(source);
      setCropRequest({
        source: cutout,
        role,
        label: role === "mother" ? "האמא" : gender === "girl" ? "הילדה" : "הילד",
        backgroundRemoved: true,
      });
    } catch {
      toast.error(t("לא הצלחנו להסיר את הרקע. אפשר להמשיך עם התמונה המקורית.", "We couldn't remove the background. You can continue with the original photo."));
    } finally {
      setGenerating(false);
    }
  }

  function restoreOriginalPhoto() {
    const original = originalChildPhoto;
    if (!original) return;
    setChildPhoto(original);
    if (story) setStory((prev) => ({ ...prev, childPhoto: original }));
    toast.success(t("חזרנו לתמונה המקורית", "Back to the original photo"));
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
    const choices = storyChoices(templateId, selectedGender, language);
    if (choices) {
      // סיפור עם בחירות: שני עמודי פתיחה ללא מילים, ואחריהם הבחירות של הילד.
      result = {
        ...result,
        wordless: true,
        interactive: true,
        branchPrompt: choices.branchPrompt,
        endingPrompt: choices.endingPrompt,
        choiceInstructions: choices.choiceInstructions,
        pages: result.pages.slice(0, 2),
        branchOptions: choices.branchOptions,
        endingOptions: choices.endingOptions,
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
      faceLayout: result.coverFaceLayout || (templateId === "toilet" ? `toilet-cover-${selectedGender}` : null),
      faceBase: result.coverFaceBase || (templateId === "toilet" ? result.cover : null),
    };
    const contentPages = result.pages.map(([text, emoji, illustration, faceReplacement, faceLayout, faceBase]) => ({
      id: uid(), text: result.wordless ? "" : text, emoji, illustration, integrated: true, faceReplacement, faceLayout, faceBase,
    }));
    const toOption = ([value, label, illustration]) => ({ value, label, illustration, id: uid(), text: "", integrated: true });
    setStory({
      id: uid(),
      title: result.title,
      gender: selectedGender,
      templateId,
      kindergartenRest,
      illustrationStyle,
      wordless: !!result.wordless,
      interactive: !!result.interactive,
      branchPrompt: result.branchPrompt,
      endingPrompt: result.endingPrompt,
      choiceInstructions: result.choiceInstructions,
      branchOptions: (result.branchOptions || []).map(toOption),
      endingOptions: (result.endingOptions || []).map(toOption),
      pages: [coverPage, ...contentPages],
      childPhoto: result.personalized === false ? null : childPhoto,
      motherPhoto: result.personalized === false ? null : motherPhoto,
    });
    setStoryMode("edit");
    setViewPage(0);
    setTimeout(() => {
      document.querySelector('[data-social-story-result="true"]')?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
    toast.success(t("הסיפור מוכן לעריכה!", "Your story is ready to edit!"));
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

  // בחירה ראשונה בעלילה: מחליפה את העמוד הרביעי. בחירה שנייה: את העמוד החמישי.
  function chooseBranch(option) {
    setStory((prev) => ({ ...prev, interactiveChoice: option.value, endingChoice: null, pages: [...prev.pages.slice(0, 3), { ...option, id: uid(), text: "", integrated: true }] }));
    if (storyMode === "view") setViewPage(3);
  }
  function chooseEnding(option) {
    setStory((prev) => ({ ...prev, endingChoice: option.value, pages: [...prev.pages.slice(0, 4), { ...option, id: uid(), text: "", integrated: true }] }));
    if (storyMode === "view") setViewPage(4);
  }

  function handleSaveStory() {
    if (!story) return;
    const { childPhoto: _privatePhoto, motherPhoto: _privateMotherPhoto, ...safeStory } = story;
    saveSocialStory({ ...safeStory, created_at: new Date().toISOString() });
    setLibraryStories(getSocialStories());
    toast.success(t("הסיפור נשמר ללא תמונת הילד/ה", "Story saved without the child's photo."));
  }

  function handleDelete(id) {
    deleteSocialStory(id);
    setLibraryStories((prev) => prev.filter((s) => s.id !== id));
    toast.success(t("הסיפור נמחק", "Story deleted."));
  }

  function handleOpenFromLibrary(saved) {
    const savedGender = saved.gender || "girl";
    const choices = saved.interactive ? storyChoices(saved.templateId, savedGender, language) : null;
    setStory({
      ...saved,
      gender: savedGender,
      wordless: !!saved.wordless,
      branchPrompt: saved.branchPrompt || choices?.branchPrompt,
      endingPrompt: saved.endingPrompt || choices?.endingPrompt,
      choiceInstructions: saved.choiceInstructions || choices?.choiceInstructions,
      pages: saved.pages.map((p) => ({ ...p, id: p.id ?? uid() })),
      childPhoto: childPhoto ?? null,
      motherPhoto: motherPhoto ?? null,
    });
    setStoryMode("edit");
    setViewPage(0);
    setView("create");
  }

  const childLabel = (value) => (value === "boy" ? "הילד" : "הילדה");

  return (
    <AppShell mode={mode}>
      {cropRequest && <PortraitCropper source={cropRequest.source} roleLabel={cropRequest.label} onCancel={() => setCropRequest(null)} onConfirm={confirmCrop} />}
      <div className="mb-6 print:hidden">
        <h1 className="font-display text-3xl font-black md:text-4xl">{t("סיפורים חברתיים", "Social Stories")}</h1>
        <p className="mt-1 text-muted-foreground">
          {t("מסבירים לילד/ה מצב חברתי או יומיומי בסיפור קצר, רגוע וחיובי - כדי להתכונן אליו מראש.", "Explain a social or everyday situation through a short, calm, positive story to help the child prepare in advance.")}
        </p>
      </div>

      <div className="mb-6 rounded-3xl border border-sky/50 bg-sky/10 p-5 print:hidden md:p-6">
        <p className="text-sm leading-relaxed text-foreground/90">
          {t("סיפור חברתי מציג לילד/ה מצב, רצף פעולות או ציפייה חברתית בצורה חזותית, ברורה וצפויה. הוא יכול לסייע בהבנת מה שעומד לקרות, להפחית חוסר ודאות, להכין מראש לתגובה מתאימה ולתת מילים וכלים להתמודדות — בקצב שמתאים לילד/ה.", "A social story presents a situation, action sequence, or social expectation in a clear, visual, and predictable way. It can help a child understand what will happen, reduce uncertainty, prepare an appropriate response, and provide language and coping tools at the child's own pace.")}
        </p>
      </div>

      <div className="mb-6 inline-flex rounded-full bg-muted p-1 print:hidden">
        <button
          onClick={() => setView("create")}
          className={cn("rounded-full px-4 py-2 text-sm font-semibold transition-colors", view === "create" ? "bg-background shadow-sm" : "text-muted-foreground")}
        >
          {t("יצירת סיפור", "Create story")}
        </button>
        <button
          onClick={() => setView("library")}
          className={cn("rounded-full px-4 py-2 text-sm font-semibold transition-colors", view === "library" ? "bg-background shadow-sm" : "text-muted-foreground")}
        >
          {t("הסיפורים שלי", "My stories")}{" "}{libraryStories.length > 0 ? `(${libraryStories.length})` : ""}
        </button>
      </div>

      {view === "library" ? (
        <LibraryView stories={libraryStories} onOpen={handleOpenFromLibrary} onDelete={handleDelete} />
      ) : (
        <>
          {!story && (
            <div className="space-y-5 rounded-3xl border border-border/60 bg-card p-6 print:hidden">
              <div>
                <Label className="mb-2 block">{t("איזה סיפור נכין?", "Which story shall we make?")}</Label>
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
                  {cmsStoryTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => selectTemplate(template)}
                      className={cn(
                        "min-w-0 overflow-hidden rounded-2xl border text-right transition",
                        templateId === template.id ? "border-2 border-primary bg-primary/10 shadow-md ring-4 ring-primary/50" : "border-border hover:bg-muted/50",
                      )}
                    >
                      <img src={template.illustration} alt="" className="h-20 w-full bg-white object-contain p-1 sm:h-24" />
                      <span className="block p-2.5 sm:p-3">
                        <span className="font-bold">{t(template.title, template.titleEn || template.title)}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">{t(template.description, template.descriptionEn || template.description)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div ref={optionsRef} className="scroll-mt-24" aria-hidden="true" />

              {templateId !== "kindergarten" && !interactiveTemplate && (
                <div className="rounded-2xl border border-sage/30 bg-sage/10 p-4">
                  <div className="mb-3 flex items-start gap-2 text-sm">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sage-foreground" />
                    <div>
                      <p className="font-bold">{t("התמונה נשארת במכשיר שלך", "The photo stays on your device")}</p>
                      <p className="text-xs text-muted-foreground">{t("אפשר להסיר את הרקע בלחיצה לאחר העלאת התמונה. העיבוד מתבצע בדפדפן, והתמונה אינה נשלחת לשרת.", "After uploading, you can remove the background with one tap. Processing happens in your browser, and the photo is never sent to a server.")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* תצוגה מקדימה: פני הילד על גוף הדמות המאוירת */}
                    <StoryCharacter photo={childPhoto} gender={gender} size={82} />
                    <div className="flex-1">
                      <p className="mb-1 text-sm font-semibold">{t("תמונת הילד/ה – פנים וכתפיים (רשות)", "Child's photo — face and shoulders (optional)")}</p>
                      <p className="mb-2 text-xs text-muted-foreground">
                        {t("עדיף צילום חזיתי ומואר על רקע פשוט. בסיפור הגן התמונה תשתלב בעמוד „בקרוב אני מתחילה ללכת לגן חדש”. בפעם הראשונה המודל ייטען וייתכן שתהיה המתנה קצרה.", "Use a well-lit, front-facing photo against a simple background. In the preschool story, it will appear on the first page. The model may take a moment to load the first time.")}
                      </p>
                      <PhotoActions
                        photo={childPhoto}
                        originalPhoto={originalChildPhoto}
                        generating={generating}
                        onUpload={handlePhotoUpload}
                        onRemoveBackground={() => removeBackground("child")}
                        onRestoreOriginal={restoreOriginalPhoto}
                        onRemove={removePhoto}
                        uploadLabel={childPhoto ? t("החלפת תמונה", "Replace photo") : t("העלאת תמונה", "Upload photo")}
                        removeLabel={t("מחיקת התמונה", "Remove photo")}
                      />
                    </div>
                  </div>
                </div>
              )}

              {templateId === "kindergarten" && (
                <div className="overflow-hidden rounded-3xl border border-sage/30 bg-sage/10">
                  <div className="border-b border-sage/25 px-5 py-4 text-center">
                    <p className="font-display text-lg font-black">{t("התאמת הדמויות לסיפור (רשות)", "Customize story characters (optional)")}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{t("ללא העלאת תמונות, האיורים המקוריים יישארו בדיוק כפי שהם.", "Without uploaded photos, the original illustrations remain unchanged.")}</p>
                  </div>
                  <FaceUploadPanel
                    title={t(`פני ${childLabel(gender)} בסיפור (רשות)`, "Child's face in the story (optional)")}
                    description={t("התמונה תשתלב בעמוד הראשון בלבד. בחרו תמונה חזיתית הכוללת את הראש, השיער והצוואר.", "The photo appears on the first page only. Choose a front-facing photo that shows the head, hair, and neck.")}
                    photo={childPhoto}
                    originalPhoto={originalChildPhoto}
                    generating={generating}
                    onUpload={handlePhotoUpload}
                    onRemove={removePhoto}
                    onRemoveBackground={() => removeBackground("child")}
                    onRestoreOriginal={restoreOriginalPhoto}
                    uploadLabel={t(`החלפת תמונת ${childLabel(gender)}`, "Replace the child's photo")}
                    emptyLabel={t(`הוספת תמונת ${childLabel(gender)}`, "Add the child's photo")}
                  />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                {!interactiveTemplate && (
                  <div>
                    <Label className="mb-1.5 block">{t("שם הילד/ה (רשות)", "Child's name (optional)")}</Label>
                    <Input value={childName} onChange={(e) => setChildName(e.target.value)} placeholder={t("לדוגמה: נועה", "For example: Maya")} />
                  </div>
                )}
                <div>
                  <Label className="mb-1.5 block">{t("בחירת דמות ולשון", "Choose character and pronouns")}</Label>
                  <div className="flex gap-2">
                    {[{ v: "girl", label: t("בת", "Girl") }, { v: "boy", label: t("בן", "Boy") }].map((option) => (
                      <button
                        key={option.label}
                        onClick={() => setGender(option.v)}
                        className={cn("rounded-full border px-3 py-1.5 text-sm", gender === option.v ? "border-primary bg-primary text-primary-foreground" : "border-border")}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                {!interactiveTemplate && (
                  <div>
                    <Label className="mb-1.5 block">{t("בחר סגנון", "Choose a style")}</Label>
                    <div className="flex gap-2">
                      {[
                        { value: "new", label: t("סגנון 1", "Style 1"), preview: templateId === "kindergarten" ? `/icon-bank/social-stories/kindergarten-cover-${gender}.png` : `/icon-bank/social-stories/${templateId}-cover-${gender}.webp` },
                        { value: "old", label: t("סגנון 2", "Style 2"), preview: `/icon-bank/social-stories/${templateId}.webp` },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setIllustrationStyle(option.value)}
                          className={cn("flex items-center gap-2 rounded-2xl border p-1.5 pe-3 text-sm", illustrationStyle === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border")}
                        >
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-0.5">
                            <img src={option.preview} alt="" aria-hidden="true" className="h-full w-full object-contain" />
                          </span>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {templateId === "kindergarten" && (
                <div className="rounded-2xl border border-sage/30 bg-sage/10 p-4">
                  <Label className="mb-2 block">{t("האם ישנים בגן?", "Does your child take a nap at preschool?")}</Label>
                  <p className="mb-3 text-xs text-muted-foreground">{t("הבחירה משנה רק את איור המנוחה. המשפט בסיפור נשאר זהה.", "This choice changes only the rest illustration. The story sentence stays the same.")}</p>
                  <div className="flex flex-wrap gap-2">
                    {[{ value: "sleep", label: t("עם שינה", "With a nap") }, { value: "no-sleep", label: t("בלי שינה", "Without a nap") }].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setKindergartenRest(option.value)}
                        className={cn("rounded-full border px-4 py-2 text-sm font-semibold", kindergartenRest === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background")}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleGenerate} disabled={generating} className="w-full rounded-full">
                <WandSparkles className="h-4 w-4" />{" "}{t("יצירת הסיפור האישי", "Create personal story")}
              </Button>
            </div>
          )}

          {story && (
            <div data-social-story-result="true" className="scroll-mt-24">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 print:hidden">
                <button type="button" onClick={() => setStory(null)} className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <ArrowRight className="h-4 w-4" />{" "}{t("סיפור חדש", "New story")}
                </button>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => { setStoryMode(storyMode === "view" ? "edit" : "view"); setViewPage(0); }}
                    variant={storyMode === "view" ? "default" : "outline"}
                    className="rounded-full"
                  >
                    {storyMode === "view" ? <><Pencil className="h-4 w-4" />{" "}{t("חזרה לעריכה", "Back to Editing")}</> : <><Eye className="h-4 w-4" />{" "}{t("הצגת הסיפור", "View story")}</>}
                  </Button>
                  <Button onClick={handleSaveStory} variant="outline" className="rounded-full">
                    <Save className="h-4 w-4" />{" "}{t("שמירה לספרייה", "Save to library")}
                  </Button>
                  <Button onClick={() => window.print()} variant="outline" className="rounded-full">
                    <Printer className="h-4 w-4" />{" "}{t("הדפסה", "Print")}
                  </Button>
                </div>
              </div>

              <div className="hidden print:block">
                {story.pages.map((page, index) => (
                  <StoryBookPage
                    key={page.id}
                    page={page}
                    index={index}
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
                    <div className="mx-auto mt-5 max-w-4xl"><StoryChoices story={story} onBranch={chooseBranch} /></div>
                  )}
                  {story.interactive && viewPage === 3 && story.interactiveChoice && (
                    <div className="mx-auto mt-5 max-w-3xl"><StoryChoices story={story} onEnding={chooseEnding} endingsOnly /></div>
                  )}
                  <div className="mx-auto mt-5 flex max-w-[540px] items-center justify-between gap-3">
                    <Button type="button" variant="outline" className="rounded-full" onClick={() => setViewPage((page) => Math.max(0, page - 1))} disabled={viewPage === 0}>
                      <ChevronRight className="h-4 w-4" />{" "}{t("העמוד הקודם", "Previous page")}
                    </Button>
                    <div className="flex flex-wrap justify-center gap-1.5" aria-label={t("בחירת עמוד", "Choose page")}>
                      {story.pages.map((page, index) => (
                        <button
                          key={page.id}
                          type="button"
                          onClick={() => setViewPage(index)}
                          aria-label={t(`עמוד ${index + 1}`, `Page ${index + 1}`)}
                          className={cn("h-2.5 w-2.5 rounded-full transition", index === viewPage ? "bg-primary" : "bg-border")}
                        />
                      ))}
                    </div>
                    <Button type="button" variant="outline" className="rounded-full" onClick={() => setViewPage((page) => Math.min(story.pages.length - 1, page + 1))} disabled={viewPage === story.pages.length - 1}>
                      {t("העמוד הבא", "Next page")}{" "}<ChevronLeft className="h-4 w-4" />
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

                  {!INTERACTIVE_STORIES.has(story.templateId) && !(story.templateId === "kindergarten" && story.gender === "girl") && (
                    <div className="mb-5 flex flex-wrap items-center gap-4 rounded-2xl border border-sage/30 bg-sage/10 p-4">
                      {story.templateId === "sibling" && story.pages?.[0] ? (
                        <StoryScene
                          photo={null}
                          facePhotos={{ child: story.childPhoto }}
                          faceLayout={story.pages[0].faceLayout || null}
                          faceBase={story.pages[0].faceBase || null}
                          gender={story.gender}
                          illustration={story.pages[0].illustration}
                          integrated
                          className="w-[76px] shrink-0"
                        />
                      ) : (
                        <StoryCharacter photo={story.childPhoto} gender={story.gender} size={76} />
                      )}
                      <div className="flex-1">
                        <p className="font-bold">{t("פני הילד/ה בסיפור (רשות)", "Child's face in the story (optional)")}</p>
                        <p className="mb-2 text-xs text-muted-foreground">
                          {t("ללא תמונה יישארו הפנים המאוירות. בסיפור הגן, תמונה שהועלתה תשתלב בעמוד „בקרוב אני מתחילה ללכת לגן חדש”.", "Without a photo, the illustrated face remains. In the preschool story, an uploaded photo is used on the first page.")}
                        </p>
                        <PhotoActions
                          photo={story.childPhoto}
                          originalPhoto={originalChildPhoto}
                          generating={generating}
                          onUpload={handlePhotoUpload}
                          onRemoveBackground={() => removeBackground("child")}
                          onRestoreOriginal={restoreOriginalPhoto}
                          onRemove={removePhoto}
                          uploadLabel={story.childPhoto ? t("החלפת תמונה", "Replace photo") : t("הוספת תמונת הילד/ה", "Add the child's photo")}
                          removeLabel={t("חזרה לראש המאויר", "Use illustrated face")}
                        />
                      </div>
                    </div>
                  )}

                  {story.templateId === "kindergarten" && story.gender === "girl" && (
                    <div className="mb-5 overflow-hidden rounded-3xl border border-sage/30 bg-sage/10">
                      <div className="border-b border-sage/25 px-5 py-4 text-center">
                        <p className="font-display text-lg font-black">{t("התאמת הדמויות לסיפור (רשות)", "Customize story characters (optional)")}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{t("אפשר להחליף או להסיר כל תמונה בנפרד. בלי תמונה יוצגו הפנים המאוירות.", "You can replace or remove each photo separately. Without a photo, the illustrated face will be shown.")}</p>
                      </div>
                      <FaceUploadPanel
                        title={t(`פני ${childLabel(story.gender)} בסיפור (רשות)`, "Child's face in the story (optional)")}
                        description={t("התמונה תשתלב בעמוד הראשון בלבד, לאחר חיתוך הראש, השיער והצוואר.", "The photo appears on the first page only, cropped to the head, hair, and neck.")}
                        photo={story.childPhoto}
                        originalPhoto={originalChildPhoto}
                        generating={generating}
                        onUpload={handlePhotoUpload}
                        onRemove={removePhoto}
                        onRemoveBackground={() => removeBackground("child")}
                        onRestoreOriginal={restoreOriginalPhoto}
                        uploadLabel={t(`החלפת תמונת ${childLabel(story.gender)}`, "Replace the child's photo")}
                        emptyLabel={t(`הוספת תמונת ${childLabel(story.gender)}`, "Add the child's photo")}
                      />
                      <div className="border-t border-sage/30 px-5 py-4">
                        <p className="font-bold">{t("האם ישנים בגן?", "Does your child take a nap at preschool?")}</p>
                        <p className="mb-3 text-xs text-muted-foreground">{t("אפשר לשנות גם אחרי יצירת הסיפור. המשפט נשאר זהה ורק איור המנוחה מתחלף.", "You can change this after creating the story. The sentence stays the same; only the rest illustration changes.")}</p>
                        <div className="flex flex-wrap gap-2">
                          {[{ value: "sleep", label: t("עם שינה", "With a nap") }, { value: "no-sleep", label: t("בלי שינה", "Without a nap") }].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => updateKindergartenRest(option.value)}
                              className={cn("rounded-full border px-4 py-2 text-sm font-semibold", (story.kindergartenRest || "sleep") === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background")}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    {story.pages.map((page, index) => (
                      <div key={page.id} className="space-y-6">
                        {story.interactive && index === 3 && <StoryChoices story={story} onBranch={chooseBranch} />}
                        <div className="relative grid items-center gap-5 rounded-3xl border border-border/60 bg-card p-5 md:grid-cols-[minmax(260px,360px)_1fr]">
                          <StoryScene
                            photo={index === 0 ? story.childPhoto : null}
                            facePhotos={page.faceLayout ? { child: story.childPhoto, mother: story.motherPhoto } : {}}
                            faceLayout={page.faceLayout || null}
                            faceBase={page.faceBase || null}
                            gender={story.gender}
                            illustration={page.illustration}
                            integrated={!!page.integrated}
                            className="w-full"
                          />
                          <div>
                            <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-sage/30 text-sm font-bold text-sage-foreground">{index + 1}</span>
                            <Textarea value={page.text} onChange={(e) => updatePage(page.id, { text: e.target.value })} rows={4} />
                          </div>
                          <div className="absolute left-2 top-2 flex flex-col items-center gap-1">
                            <button type="button" onClick={() => movePage(index, -1)} disabled={index === 0} className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-30">
                              <ChevronUp className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" onClick={() => movePage(index, 1)} disabled={index === story.pages.length - 1} className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-30">
                              <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" onClick={() => removePage(page.id)} className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        {story.interactive && index === 3 && <StoryChoices story={story} onEnding={chooseEnding} endingsOnly />}
                      </div>
                    ))}
                    {story.interactive && story.pages.length === 3 && <StoryChoices story={story} onBranch={chooseBranch} />}
                  </div>

                  <Button onClick={addPage} variant="outline" className="mt-4 w-full rounded-full">
                    <Plus className="h-4 w-4" />{" "}{t("הוספת עמוד", "Add page")}
                  </Button>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3 border-t border-border/60 pt-6">
                    <Button onClick={() => { setStoryMode("view"); setViewPage(0); window.scrollTo({ top: 0, behavior: "smooth" }); }} variant="outline" className="rounded-full px-5">
                      <Eye className="h-4 w-4" />{" "}{t("הצגת הסיפור", "View story")}
                    </Button>
                    <Button onClick={handleSaveStory} variant="outline" className="rounded-full px-5">
                      <Save className="h-4 w-4" />{" "}{t("שמירה לספרייה", "Save to library")}
                    </Button>
                    <Button onClick={() => window.print()} variant="outline" className="rounded-full px-5">
                      <Printer className="h-4 w-4" />{" "}{t("הדפסה", "Print")}
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

function PhotoActions({ photo, originalPhoto, generating, onUpload, onRemoveBackground, onRestoreOriginal, onRemove, uploadLabel, removeLabel }) {
  const { t } = useTranslator();
  return (
    <div className="flex flex-wrap gap-2">
      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted">
        <Upload className="h-3.5 w-3.5" />
        {generating ? t("מכין תמונה...", "Preparing photo...") : uploadLabel}
        <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
      </label>
      {photo && (
        <>
          <button type="button" disabled={generating} onClick={onRemoveBackground} className="inline-flex items-center gap-1 rounded-full border border-sage bg-white px-3 py-1.5 text-sm font-bold text-sage-foreground disabled:opacity-50">
            <WandSparkles className="h-3.5 w-3.5" />
            {generating ? t("מסיר רקע...", "Removing background...") : t("הסרת רקע", "Remove background")}
          </button>
          {originalPhoto && photo !== originalPhoto && (
            <button type="button" onClick={onRestoreOriginal} className="rounded-full px-3 py-1.5 text-sm font-bold underline">{t("חזרה למקור", "Back to original")}</button>
          )}
          <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10">
            <X className="h-3.5 w-3.5" />
            {removeLabel}
          </button>
        </>
      )}
    </div>
  );
}

function FaceUploadPanel({ title, description, photo, originalPhoto, generating, onUpload, onRemove, onRemoveBackground, onRestoreOriginal, uploadLabel, emptyLabel }) {
  const { t } = useTranslator();
  return (
    <section className="flex min-h-[168px] items-center gap-4 p-5">
      <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[45%] border border-sage/25 bg-white/80">
        {photo ? <img src={photo} alt={t("תצוגה מקדימה", "Preview")} className="h-full w-full object-contain" /> : <span className="text-center text-[11px] font-medium text-muted-foreground">{t("תצוגה", "Preview")}<br />{t("מקדימה", "")}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold">{title}</h3>
        <p className="mb-3 mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold shadow-sm transition hover:bg-muted">
            <Upload className="h-3.5 w-3.5" />
            {generating ? t("מכין תמונה...", "Preparing photo...") : photo ? uploadLabel : emptyLabel}
            <input type="file" accept="image/*" onChange={onUpload} disabled={generating} className="hidden" />
          </label>
          {photo && (
            <button type="button" disabled={generating} onClick={onRemoveBackground} className="inline-flex items-center gap-1 rounded-full border border-sage bg-white px-3 py-1.5 text-sm font-bold text-sage-foreground disabled:opacity-50">
              <WandSparkles className="h-3.5 w-3.5" />
              {generating ? t("מסיר רקע...", "Removing background...") : t("הסרת רקע", "Remove background")}
            </button>
          )}
          {photo && originalPhoto && photo !== originalPhoto && (
            <button type="button" onClick={onRestoreOriginal} className="rounded-full px-2 py-1.5 text-sm font-bold underline">{t("חזרה למקור", "Back to original")}</button>
          )}
          {photo && (
            <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10">
              <X className="h-3.5 w-3.5" />
              {t("חזרה לפנים המאוירות", "Use illustrated face")}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function LibraryView({ stories, onOpen, onDelete }) {
  const { t } = useTranslator();
  if (stories.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
        {t("עדיין אין סיפורים שמורים. עברו ל\"יצירת סיפור\" כדי להתחיל.", "No saved stories yet. Go to \"Create Story\" to get started.")}
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {stories.map((saved) => (
        <li key={saved.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/60 bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage/20 text-xl">
              <FolderOpen className="h-5 w-5 text-sage-foreground" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold">{saved.title}</h3>
              <p className="text-sm text-muted-foreground">{saved.pages?.length ?? 0}{" "}{t("עמודים", "pages")}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => onOpen(saved)} variant="outline" className="rounded-full">{t("פתיחה לעריכה", "Open for editing")}</Button>
            <Button onClick={() => onDelete(saved.id)} variant="ghost" className="rounded-full text-muted-foreground hover:text-destructive">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
