import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Save,
  Printer,
  Plus,
  X,
  Trash2,
  FolderOpen,
  ArrowRight,
  Upload,
  ShieldCheck,
  WandSparkles,
  Play,
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
import { STORY_TEMPLATES, createTemplateStory, storyImageSrc } from "@/lib/social-story-templates";
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
        ["angry", he ? "כועס/ת על מי שמולו/ה" : "Gets angry with the other child", `${base}/choice-4-angry.webp`],
        ["talks", he ? "מדבר/ת על ההרגשה" : "Talks about the feeling", `${base}/page-5.webp`],
        ["congratulates", he ? "מפרגן/ת למי שניצח/ה" : "Congratulates the winner", `${base}/page-6.webp`],
      ],
      endingOptions: [
        ["winner-walks-away", he ? (girl ? "הילדה שניצחה מתרחקת" : "הילד שניצח מתרחק") : "The winner walks away", `${base}/ending-winner-walks-away.webp`],
        ["different-game", he ? (girl ? "הן משחקות במשחק אחר" : "הם משחקים במשחק אחר") : "They play a different game", `${base}/ending-different-game.webp`],
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
            <img src={storyImageSrc(option.illustration)} alt="" loading="lazy" className="mb-2 aspect-square w-full rounded-xl object-contain" />
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
  const [editIndex, setEditIndex] = useState(0);
  const optionsRef = useRef(null);
  const readerButtonRef = useRef(null);
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
      faceLayout: result.coverFaceLayout || (templateId === "toilet" && illustrationStyle === "new" ? `toilet-cover-${selectedGender}` : null),
      faceBase: result.coverFaceBase || (templateId === "toilet" && illustrationStyle === "new" ? result.cover : null),
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
    setEditIndex(0);
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
      const illustration = `/icon-bank/social-stories/kindergarten/daily-routine-${value === "no-sleep" ? "no-sleep" : "with-sleep"}.webp`;
      return {
        ...prev,
        kindergartenRest: value,
        pages: prev.pages.map((page) => page.text === "במהלך היום אני אשחק במשחקים, אוכל עם כולם, אשתתף במפגש ואוכל לנוח כשאצטרך."
          ? { ...page, illustration }
          : page),
      };
    });
  }
  function removePage(index) {
    if (story.pages.length <= 1) return;
    if (!window.confirm(t(`למחוק את עמוד ${index + 1}?`, `Delete page ${index + 1}?`))) return;
    setStory((prev) => ({ ...prev, pages: prev.pages.filter((_, i) => i !== index) }));
    setEditIndex(Math.max(0, Math.min(index, story.pages.length - 2)));
  }
  function movePage(index, dir) {
    const target = index + dir;
    if (target < 0 || target >= story.pages.length) return;
    setStory((prev) => {
      const pages = [...prev.pages];
      [pages[index], pages[target]] = [pages[target], pages[index]];
      return { ...prev, pages };
    });
    setEditIndex(target);
  }
  function addPage() {
    setStory((prev) => ({ ...prev, pages: [...prev.pages, { id: uid(), text: "", emoji: "✨", illustration: null }] }));
    setEditIndex(story.pages.length);
  }
  function openReader(page) {
    toast.dismiss();
    setViewPage(page);
    setStoryMode("view");
  }
  function closeReader() {
    setStoryMode("edit");
    window.requestAnimationFrame(() => readerButtonRef.current?.focus());
  }
  function startOver() {
    if (!window.confirm(t("לחזור לבחירת סיפור? שינויים שלא נשמרו יימחקו.", "Go back to choosing a story? Unsaved changes will be lost."))) return;
    setStory(null);
  }

  // בחירה ראשונה בעלילה: מחליפה את העמוד הרביעי. בחירה שנייה: את העמוד החמישי.
  function chooseBranch(option) {
    setStory((prev) => ({ ...prev, interactiveChoice: option.value, endingChoice: null, pages: [...prev.pages.slice(0, 3), { ...option, id: uid(), text: "", integrated: true }] }));
    if (storyMode === "view") setViewPage(3);
    else setEditIndex(3);
  }
  function chooseEnding(option) {
    setStory((prev) => ({ ...prev, endingChoice: option.value, pages: [...prev.pages.slice(0, 4), { ...option, id: uid(), text: "", integrated: true }] }));
    if (storyMode === "view") setViewPage(4);
    else setEditIndex(4);
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
    setEditIndex(0);
    setView("create");
  }

  const childLabel = (value) => (value === "boy" ? "הילד" : "הילדה");
  const faceIndex = story && !story.interactive ? facePageIndex(story.pages) : -1;
  const currentPage = story?.pages[Math.min(editIndex, story.pages.length - 1)];
  // Before the story is made: does the chosen story have a place for the child's face?
  const draftStory = createTemplateStory(templateId, childName, gender, kindergartenRest, illustrationStyle, language);
  const draftHasFace = !interactiveTemplate && Boolean(
    draftStory.coverFaceLayout
    || (templateId === "toilet" && illustrationStyle === "new")
    || !draftStory.coverIntegrated
    || draftStory.pages.some((page) => page[4]),
  );

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
            <div className="print:hidden">
            <StorySteps current={1} />
            <div className="space-y-5 rounded-3xl border border-border/60 bg-card p-6">
              <div>
                <h2 className="mb-3 font-display text-xl font-black">{t("1. איזה סיפור נכין?", "1. Which story shall we make?")}</h2>
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
                  {cmsStoryTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => selectTemplate(template)}
                      aria-pressed={templateId === template.id}
                      className={cn(
                        "min-w-0 overflow-hidden rounded-2xl border text-right transition",
                        templateId === template.id ? "border-2 border-primary bg-primary/10 shadow-md ring-4 ring-primary/50" : "border-border hover:bg-muted/50",
                      )}
                    >
                      <img src={storyImageSrc(template.illustration)} alt="" loading="lazy" decoding="async" className="h-20 w-full bg-white object-contain p-1 sm:h-24" />
                      <span className="block p-2.5 sm:p-3">
                        <span className="font-bold">{t(template.title, template.titleEn || template.title)}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">{t(template.description, template.descriptionEn || template.description)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div ref={optionsRef} className="scroll-mt-24" aria-hidden="true" />
              <h2 className="font-display text-xl font-black">{t("2. התאמה אישית", "2. Make it personal")}</h2>

              {templateId !== "kindergarten" && draftHasFace && (
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
                    <Label htmlFor="storyChildName" className="mb-1.5 block">{t("שם הילד/ה (רשות)", "Child's name (optional)")}</Label>
                    <Input id="storyChildName" value={childName} onChange={(e) => setChildName(e.target.value)} placeholder={t("לדוגמה: נועה", "For example: Maya")} />
                  </div>
                )}
                <div>
                  <p className="mb-1.5 text-sm font-medium">{t("בחירת דמות ולשון", "Choose character and pronouns")}</p>
                  <div className="flex gap-2">
                    {[{ v: "girl", label: t("בת", "Girl") }, { v: "boy", label: t("בן", "Boy") }].map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        aria-pressed={gender === option.v}
                        onClick={() => setGender(option.v)}
                        className={cn("min-h-11 rounded-full border px-5 text-sm font-semibold", gender === option.v ? "border-primary bg-primary text-primary-foreground" : "border-border")}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                {!interactiveTemplate && (
                  <div>
                    <p className="mb-1.5 text-sm font-medium">{t("סגנון האיורים", "Illustration style")}</p>
                    <div className="flex gap-2">
                      {[
                        { value: "new", label: t("סגנון 1", "Style 1"), preview: templateId === "kindergarten" ? `/icon-bank/social-stories/kindergarten-cover-${gender}.webp` : `/icon-bank/social-stories/${templateId}-cover-${gender}.webp` },
                        { value: "old", label: t("סגנון 2", "Style 2"), preview: `/icon-bank/social-stories/${templateId}.webp` },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={illustrationStyle === option.value}
                          onClick={() => setIllustrationStyle(option.value)}
                          className={cn("flex items-center gap-2 rounded-2xl border p-1.5 pe-3 text-sm", illustrationStyle === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border")}
                        >
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-0.5">
                            <img src={storyImageSrc(option.preview)} alt="" aria-hidden="true" loading="lazy" className="h-full w-full object-contain" />
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
                        aria-pressed={kindergartenRest === option.value}
                        onClick={() => setKindergartenRest(option.value)}
                        className={cn("rounded-full border px-4 py-2 text-sm font-semibold", kindergartenRest === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background")}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleGenerate} disabled={generating} className="min-h-12 w-full rounded-full text-base">
                <WandSparkles className="h-4 w-4" aria-hidden="true" />{" "}{t("יצירת הסיפור", "Create the story")}
              </Button>
            </div>
            </div>
          )}

          {story && (
            <div data-social-story-result="true" className="scroll-mt-24">
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
                    faceAdjust={story.faceAdjust}
                  />
                ))}
              </div>

              <div className="print:hidden">
                <StorySteps current={3} />
                <div className="mb-4">
                  <button type="button" onClick={startOver} className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />{" "}{t("סיפור חדש", "New story")}
                  </button>
                </div>

                <Label htmlFor="storyTitle" className="sr-only">{t("שם הסיפור", "Story title")}</Label>
                <Input
                  id="storyTitle"
                  value={story.title}
                  onChange={(e) => setStory({ ...story, title: e.target.value })}
                  className="mb-4 h-auto border-none bg-transparent py-1 text-center font-display text-2xl font-black shadow-none focus-visible:ring-2 md:text-3xl"
                />

                {faceIndex >= 0 && (
                  <FacePanel
                    story={story}
                    facePage={story.pages[faceIndex]}
                    faceIndex={faceIndex}
                    originalPhoto={originalChildPhoto}
                    generating={generating}
                    onUpload={handlePhotoUpload}
                    onRemove={removePhoto}
                    onRemoveBackground={() => removeBackground("child")}
                    onRestoreOriginal={restoreOriginalPhoto}
                    onAdjust={(faceAdjust) => setStory((prev) => ({ ...prev, faceAdjust }))}
                  />
                )}

                {story.templateId === "kindergarten" && (
                  <div className="mb-5 rounded-2xl border border-sage/30 bg-sage/10 p-4">
                    <p className="font-bold">{t("האם ישנים בגן?", "Does your child take a nap at preschool?")}</p>
                    <p className="mb-3 text-xs text-muted-foreground">{t("המשפט נשאר זהה ורק איור המנוחה מתחלף.", "The sentence stays the same; only the rest illustration changes.")}</p>
                    <div className="flex flex-wrap gap-2">
                      {[{ value: "sleep", label: t("עם שינה", "With a nap") }, { value: "no-sleep", label: t("בלי שינה", "Without a nap") }].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={(story.kindergartenRest || "sleep") === option.value}
                          onClick={() => updateKindergartenRest(option.value)}
                          className={cn("min-h-11 rounded-full border px-4 text-sm font-semibold", (story.kindergartenRest || "sleep") === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background")}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <PageEditor
                  story={story}
                  index={editIndex}
                  onGo={setEditIndex}
                  onText={(text) => updatePage(currentPage.id, { text })}
                  onMove={(dir) => movePage(editIndex, dir)}
                  onRemove={() => removePage(editIndex)}
                  onAdd={addPage}
                  choices={
                    story.interactive && editIndex === 2 ? <StoryChoices story={story} onBranch={chooseBranch} />
                    : story.interactive && editIndex === 3 ? <StoryChoices story={story} onEnding={chooseEnding} endingsOnly />
                    : null
                  }
                />

                {/* The last step, after editing: show, save or print the story. */}
                <section className="mt-6 rounded-3xl border border-sage/40 bg-sage/10 p-4 text-center sm:p-5" aria-labelledby="story-done-title">
                  <h2 id="story-done-title" className="mb-3 font-display text-xl font-black">{t("הסיפור מוכן", "The story is ready")}</h2>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Button ref={readerButtonRef} onClick={() => openReader(0)} className="min-h-12 rounded-full px-5 text-base">
                      <Play className="h-4 w-4" aria-hidden="true" />{" "}{t("הצגת הסיפור", "Show the story")}
                    </Button>
                    <Button onClick={() => window.print()} variant="outline" className="min-h-12 rounded-full bg-background px-5 text-base">
                      <Printer className="h-4 w-4" aria-hidden="true" />{" "}{t("הדפסה", "Print")}
                    </Button>
                    <Button onClick={handleSaveStory} variant="outline" className="min-h-12 rounded-full bg-background px-5 text-base">
                      <Save className="h-4 w-4" aria-hidden="true" />{" "}{t("שמירה", "Save")}
                    </Button>
                  </div>
                </section>
              </div>

              {storyMode === "view" && (
                <StoryReader
                  story={story}
                  page={viewPage}
                  onPage={setViewPage}
                  onClose={closeReader}
                  onBranch={chooseBranch}
                  onEnding={chooseEnding}
                />
              )}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}

// The page where the child's face appears: the first page drawn with a place for a face, or a
// first page that shows the illustrated character. -1 when the story has no place for a face.
function facePageIndex(pages) {
  const drawn = pages.findIndex((page) => page.faceLayout && page.faceBase);
  if (drawn >= 0) return drawn;
  return pages[0] && !pages[0].integrated ? 0 : -1;
}

function StorySteps({ current }) {
  const { t } = useTranslator();
  const steps = [t("בחירת סיפור", "Choose a story"), t("התאמה אישית", "Make it personal"), t("עריכה", "Edit"), t("הצגה והדפסה", "Show and print")];
  return (
    <ol className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label={t("שלבי יצירת הסיפור", "Story steps")}>
      {steps.map((label, index) => {
        const step = index + 1;
        const now = current === 1 ? step <= 2 : step === 3;
        const done = current === 3 && step < 3;
        return (
          <li
            key={label}
            aria-current={now ? "step" : undefined}
            className={cn(
              "rounded-xl border px-3 py-2 text-center text-sm font-bold",
              now ? "border-foreground bg-foreground text-background" : done ? "border-sage/40 bg-sage/15 text-sage-foreground" : "border-border bg-card text-muted-foreground",
            )}
          >
            {done ? "✓ " : `${step}. `}{label}
          </li>
        );
      })}
    </ol>
  );
}

// Turning pages like a book. The page lifts from its outer edge and turns over the spine with the
// finger: in Hebrew the spine is on the right, so a swipe to the right turns forward and a swipe to
// the left turns back; in English it is the other way round. A short swipe lets the page fall back.
// The arrows and keys play the same turn; people who ask for less motion get a plain page change.
const FLIP_MS = 380;

function usePageFlip({ index, count, onIndex, rtl }) {
  const boxRef = useRef(null);
  const start = useRef(null);
  const timers = useRef([]);
  const [flip, setFlip] = useState(null); // { dir: 1 | -1, progress: 0..1, animate: bool }
  const later = (fn, ms) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
  const canGo = (dir) => index + dir >= 0 && index + dir < count;
  const reduceMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  function settle(dir, done) {
    setFlip({ dir, progress: done ? 1 : 0, animate: true });
    later(() => {
      setFlip(null);
      if (done) onIndex(index + dir);
    }, FLIP_MS);
  }
  function turn(dir) {
    if (flip || !canGo(dir)) return;
    if (reduceMotion()) { onIndex(index + dir); return; }
    setFlip({ dir, progress: 0, animate: false });
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => settle(dir, true)));
  }

  function onPointerDown(event) {
    if (flip || (event.pointerType === "mouse" && event.button !== 0)) return;
    start.current = { x: event.clientX, y: event.clientY, horizontal: null, dir: 0 };
  }
  function onPointerMove(event) {
    const current = start.current;
    if (!current) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (current.horizontal === null) {
      if (Math.hypot(dx, dy) < 8) return;
      current.horizontal = Math.abs(dx) > Math.abs(dy);
      if (!current.horizontal) { start.current = null; return; }
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    const dir = (dx > 0) === rtl ? 1 : -1;
    if (!canGo(dir) || reduceMotion()) { current.dir = 0; setFlip(null); return; }
    current.dir = dir;
    const width = boxRef.current?.offsetWidth || 300;
    setFlip({ dir, progress: Math.min(1, Math.abs(dx) / width), animate: false });
  }
  function onPointerEnd(event) {
    const current = start.current;
    start.current = null;
    if (!current?.horizontal) return;
    if (!current.dir) {
      // No motion wanted, or nothing to turn to: a clear swipe still changes the page.
      const dx = event.clientX - current.x;
      const dir = (dx > 0) === rtl ? 1 : -1;
      if (Math.abs(dx) > 60 && canGo(dir)) onIndex(index + dir);
      return;
    }
    const width = boxRef.current?.offsetWidth || 300;
    const done = Math.abs(event.clientX - current.x) / width > 0.25;
    settle(current.dir, done);
  }

  return {
    boxRef,
    flip,
    turn,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: () => { start.current = null; if (flip) settle(flip.dir, false); },
      onDragStart: (event) => event.preventDefault(),
    },
  };
}

// Two layers: underneath, the page that will show when the turn ends; on top, the page that turns.
// Turning forward, the current page lifts and turns away; turning back, the previous page turns
// back over the current one.
function FlipPages({ pager, index, rtl, renderPage, className = "", style }) {
  const { flip } = pager;
  const target = flip ? index + flip.dir : index;
  const under = flip && flip.dir > 0 ? target : index;
  const turning = flip ? (flip.dir > 0 ? index : target) : null;
  const full = rtl ? 180 : -180;
  const angle = flip ? (flip.dir > 0 ? full * flip.progress : full * (1 - flip.progress)) : 0;
  return (
    <div
      ref={pager.boxRef}
      className={cn("relative touch-pan-y select-none [-webkit-touch-callout:none]", className)}
      style={{ perspective: "2000px", ...style }}
      {...pager.handlers}
    >
      <div className="overflow-hidden rounded-sm bg-white shadow-xl">{renderPage(under)}</div>
      {flip && (
        <div
          className="absolute inset-0 overflow-hidden rounded-sm bg-white shadow-2xl"
          style={{
            transformOrigin: rtl ? "right center" : "left center",
            transform: `rotateY(${angle}deg)`,
            transition: flip.animate ? `transform ${FLIP_MS}ms ease-out` : "none",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {renderPage(turning)}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: `linear-gradient(${rtl ? "to left" : "to right"}, rgba(0,0,0,${0.18 * Math.sin((Math.abs(angle) * Math.PI) / 180)}), transparent 60%)` }}
          />
        </div>
      )}
    </div>
  );
}

// One page at a time: the page as it will look, with its text right next to it, clear buttons,
// and a row of small pages underneath to jump between them.
function PageEditor({ story, index, onGo, onText, onMove, onRemove, onAdd, choices }) {
  const { language, t } = useTranslator();
  const listRef = useRef(null);
  const safeIndex = Math.min(index, story.pages.length - 1);
  const page = story.pages[safeIndex];
  const last = story.pages.length - 1;
  const showText = !story.wordless || page.isCover;

  // Keep the current small page in view by scrolling only the row sideways. scrollIntoView would
  // also scroll the whole page down to the row every time a page is turned.
  useEffect(() => {
    const list = listRef.current;
    const thumb = list?.querySelector(`[data-page-thumb="${safeIndex}"]`);
    if (!list || !thumb) return;
    const box = list.getBoundingClientRect();
    const item = thumb.getBoundingClientRect();
    if (item.left < box.left) list.scrollLeft -= box.left - item.left + 8;
    else if (item.right > box.right) list.scrollLeft += item.right - box.right + 8;
  }, [safeIndex]);

  const pageName = (i) => (i === 0 && story.pages[0]?.isCover ? t("השער", "the cover") : t(`עמוד ${i + 1}`, `page ${i + 1}`));
  const rtl = language !== "en";
  const pager = usePageFlip({ index: safeIndex, count: story.pages.length, onIndex: onGo, rtl });
  const renderPage = (i) => (
    <StoryBookPage
      page={story.pages[i]}
      index={i}
      total={story.pages.length}
      photo={story.childPhoto}
      facePhotos={{ child: story.childPhoto, mother: story.motherPhoto }}
      gender={story.gender}
      wordless={story.wordless}
      faceAdjust={story.faceAdjust}
    />
  );

  return (
    <section aria-label={t("עריכת העמודים", "Edit the pages")}>
      <div className="grid items-start gap-5 rounded-3xl border border-border/60 bg-card p-4 sm:p-5 md:grid-cols-[minmax(0,400px)_1fr]">
        <FlipPages pager={pager} index={safeIndex} rtl={rtl} renderPage={renderPage} className="mx-auto w-full max-w-[320px] md:max-w-none" />
        <div className="space-y-5">
          {showText ? (
            <div>
              <Label htmlFor="storyPageText" className="mb-2 block text-base font-bold">{t(`הכיתוב של ${pageName(safeIndex)}`, `Text of ${pageName(safeIndex)}`)}</Label>
              <Textarea id="storyPageText" value={page.text} onChange={(e) => onText(e.target.value)} rows={4} className="min-h-28 rounded-2xl border-2 text-lg leading-relaxed" />
              <p className="mt-1.5 text-xs text-muted-foreground">{t("כותבים כאן, והעמוד מתעדכן מיד.", "Type here and the page updates right away.")}</p>
            </div>
          ) : (
            <p className="rounded-2xl bg-sage/10 p-4 text-sm leading-relaxed">{t("זה סיפור בלי מילים: מתבוננים יחד באיור ומספרים. בדף המודפס יש שורות לכתיבה.", "This is a wordless story: look at the picture and tell it together. The printed page has lines to write on.")}</p>
          )}
          <div>
            <p className="mb-2 text-sm font-bold">{t("העמוד הזה", "This page")}</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="min-h-11 rounded-full" onClick={() => onMove(-1)} disabled={safeIndex === 0}>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />{" "}{t("להזיז קודם", "Move earlier")}
              </Button>
              <Button type="button" variant="outline" className="min-h-11 rounded-full" onClick={() => onMove(1)} disabled={safeIndex === last}>
                {t("להזיז אחר כך", "Move later")}{" "}<ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button type="button" variant="outline" className="min-h-11 rounded-full border-destructive/40 text-destructive hover:bg-destructive/10" onClick={onRemove} disabled={story.pages.length <= 1}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />{" "}{t("מחיקת העמוד", "Delete page")}
              </Button>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-bold">{t("מעבר בין עמודים", "Go to another page")}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" className="min-h-11 rounded-full" onClick={() => pager.turn(-1)} disabled={safeIndex === 0}>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />{" "}{t("העמוד הקודם", "Previous page")}
              </Button>
              <Button type="button" variant="outline" className="min-h-11 rounded-full" onClick={() => pager.turn(1)} disabled={safeIndex === last}>
                {t("העמוד הבא", "Next page")}{" "}<ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </Button>
              <span className="text-sm font-semibold text-muted-foreground" aria-live="polite">{safeIndex + 1} / {story.pages.length}</span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">{t("אפשר גם לדפדף בהחלקת אצבע על העמוד.", "You can also swipe the page to turn it.")}</p>
          </div>
        </div>
      </div>

      {choices && <div className="mt-5">{choices}</div>}

      <ol ref={listRef} className="mt-4 flex gap-2 overflow-x-auto pb-2" aria-label={t("כל העמודים", "All pages")}>
        {story.pages.map((item, i) => (
          <li key={item.id} className="shrink-0">
            <button
              type="button"
              data-page-thumb={i}
              onClick={() => onGo(i)}
              aria-current={i === safeIndex ? "page" : undefined}
              aria-label={pageName(i)}
              className={cn("block w-[72px] rounded-xl border-2 bg-white p-1 text-center text-xs font-bold text-muted-foreground transition sm:w-20", i === safeIndex ? "border-sage-foreground ring-2 ring-sage-foreground/30" : "border-border hover:border-primary/60")}
            >
              <span className="flex aspect-[210/297] items-center justify-center overflow-hidden rounded-md bg-[#fffaf1]">
                {item.illustration ? <img src={storyImageSrc(item.illustration)} alt="" loading="lazy" decoding="async" className="w-full object-contain" /> : <span className="text-2xl" aria-hidden="true">{item.emoji || "✨"}</span>}
              </span>
              <span className="mt-1 block">{i === 0 && item.isCover ? t("שער", "Cover") : i + 1}</span>
            </button>
          </li>
        ))}
        <li className="shrink-0">
          <button type="button" onClick={onAdd} className="flex h-full min-h-28 w-[72px] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-card text-xs font-bold text-sage-foreground hover:border-primary/60 sm:w-20">
            <Plus className="h-6 w-6" aria-hidden="true" />{t("עמוד חדש", "New page")}
          </button>
        </li>
      </ol>
    </section>
  );
}

// The child's photo, seen on the page where it appears. Drag it, or use the buttons, until it sits well.
function FacePanel({ story, facePage, faceIndex, originalPhoto, generating, onUpload, onRemove, onRemoveBackground, onRestoreOriginal, onAdjust }) {
  const { t } = useTranslator();
  const previewRef = useRef(null);
  const drag = useRef(null);
  const adjust = { x: 0, y: 0, scale: 1, ...(story.faceAdjust || {}) };
  const photo = story.childPhoto;
  const set = (patch) => onAdjust({ ...adjust, ...patch });
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function pointerDown(event) {
    if (!photo) return;
    const box = previewRef.current?.querySelector("[data-face-box]")?.getBoundingClientRect();
    if (!box) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, start: adjust, width: box.width, height: box.height };
  }
  function pointerMove(event) {
    const current = drag.current;
    if (!current) return;
    set({
      x: clamp(current.start.x + ((event.clientX - current.x) / current.width) * 100, -60, 60),
      y: clamp(current.start.y + ((event.clientY - current.y) / current.height) * 100, -60, 60),
    });
  }
  function nudge(key, amount) {
    set({ [key]: clamp(adjust[key] + amount, -60, 60) });
  }

  return (
    <section className="mb-5 grid gap-4 rounded-3xl border border-sage/30 bg-sage/10 p-4 sm:grid-cols-[240px_1fr] sm:p-5" aria-label={t("תמונת הילד/ה בסיפור", "The child's photo in the story")}>
      <div
        ref={previewRef}
        className={cn("mx-auto w-full max-w-[240px] touch-none select-none", photo && "cursor-grab active:cursor-grabbing")}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={() => { drag.current = null; }}
        onPointerCancel={() => { drag.current = null; }}
      >
        <StoryScene
          photo={faceIndex === 0 ? photo : null}
          facePhotos={facePage.faceLayout ? { child: photo, mother: story.motherPhoto } : {}}
          faceLayout={facePage.faceLayout || null}
          faceBase={facePage.faceBase || null}
          gender={story.gender}
          illustration={facePage.illustration}
          integrated={!!facePage.integrated}
          characterSize={120}
          faceAdjust={adjust}
          className="w-full border border-border/60"
        />
      </div>
      <div className="min-w-0">
        <p className="font-bold">{photo ? t("ככה הפנים ייראו בסיפור", "This is how the face will look") : t("תמונת הילד/ה (רשות)", "The child's photo (optional)")}</p>
        <p className="mb-3 mt-1 text-xs leading-relaxed text-muted-foreground">
          {photo
            ? t("גוררים את התמונה באצבע או בעכבר כדי להזיז, או משתמשים בכפתורים.", "Drag the photo with a finger or the mouse, or use the buttons.")
            : t("בלי תמונה נשארות הפנים המאוירות. עדיף צילום מלפנים, מואר, על רקע פשוט.", "Without a photo the illustrated face stays. A bright photo from the front on a plain background works best.")}
        </p>
        {photo && (
          <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label={t("התאמת התמונה", "Adjust the photo")}>
            <Button type="button" variant="outline" className="min-h-11 rounded-full" onClick={() => set({ scale: clamp(adjust.scale + 0.08, 0.6, 2) })}>{t("＋ הגדלה", "＋ Bigger")}</Button>
            <Button type="button" variant="outline" className="min-h-11 rounded-full" onClick={() => set({ scale: clamp(adjust.scale - 0.08, 0.6, 2) })}>{t("－ הקטנה", "－ Smaller")}</Button>
            <Button type="button" variant="outline" className="min-h-11 min-w-11 rounded-full px-3" onClick={() => nudge("y", -4)} aria-label={t("להזיז למעלה", "Move up")}>↑</Button>
            <Button type="button" variant="outline" className="min-h-11 min-w-11 rounded-full px-3" onClick={() => nudge("y", 4)} aria-label={t("להזיז למטה", "Move down")}>↓</Button>
            <Button type="button" variant="outline" className="min-h-11 min-w-11 rounded-full px-3" onClick={() => nudge("x", 4)} aria-label={t("להזיז ימינה", "Move right")}>→</Button>
            <Button type="button" variant="outline" className="min-h-11 min-w-11 rounded-full px-3" onClick={() => nudge("x", -4)} aria-label={t("להזיז שמאלה", "Move left")}>←</Button>
            <Button type="button" variant="ghost" className="min-h-11 rounded-full underline" onClick={() => onAdjust({ x: 0, y: 0, scale: 1 })}>{t("איפוס", "Reset")}</Button>
          </div>
        )}
        <PhotoActions
          photo={photo}
          originalPhoto={originalPhoto}
          generating={generating}
          onUpload={onUpload}
          onRemoveBackground={onRemoveBackground}
          onRestoreOriginal={onRestoreOriginal}
          onRemove={onRemove}
          uploadLabel={photo ? t("החלפת תמונה", "Replace photo") : t("הוספת תמונה", "Add a photo")}
          removeLabel={t("חזרה לפנים המאוירות", "Use illustrated face")}
        />
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />{t("התמונה נשארת במכשיר ולא נשמרת עם הסיפור.", "The photo stays on this device and is not saved with the story.")}</p>
      </div>
    </section>
  );
}

// Showing the story: the whole page fits the screen, with big arrows, swiping, and the arrow keys.
function StoryReader({ story, page, onPage, onClose, onBranch, onEnding }) {
  const { language, t } = useTranslator();
  const closeRef = useRef(null);
  const last = story.pages.length - 1;
  const current = Math.min(page, last);
  const rtl = language !== "en";
  const pager = usePageFlip({ index: current, count: story.pages.length, onIndex: onPage, rtl });
  const go = (next) => pager.turn(next > current ? 1 : -1);
  const branch = story.interactive && current === 2 && story.branchOptions?.length;
  const ending = story.interactive && current === 3 && story.interactiveChoice && story.endingOptions?.length;
  const options = branch ? story.branchOptions : ending ? story.endingOptions : null;

  useEffect(() => {
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, []);
  useEffect(() => {
    function key(event) {
      if (event.key === "Escape") onClose();
      // Hebrew is read from right to left, so the left arrow goes forward; in English the right one.
      else if (event.key === "ArrowLeft") go(current + (rtl ? 1 : -1));
      else if (event.key === "ArrowRight") go(current + (rtl ? -1 : 1));
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-[#2d2622] text-white print:hidden" role="dialog" aria-modal="true" aria-label={story.title}>
      <div className="flex items-center justify-between gap-3 px-3 py-2 sm:px-5">
        <button ref={closeRef} type="button" onClick={onClose} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white/15 px-4 text-sm font-bold hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
          <X className="h-4 w-4" aria-hidden="true" />{t("סגירה", "Close")}
        </button>
        <p className="min-w-0 truncate text-center font-display font-bold">{story.title}</p>
        <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold" aria-live="polite">{current + 1} / {story.pages.length}</span>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3">
        <FlipPages
          pager={pager}
          index={current}
          rtl={rtl}
          style={{ width: `min(100%, calc((100dvh - ${options ? 300 : 170}px) * 210 / 297))` }}
          renderPage={(i) => (
            <StoryBookPage
              page={story.pages[i]}
              index={i}
              total={story.pages.length}
              photo={story.childPhoto}
              facePhotos={{ child: story.childPhoto, mother: story.motherPhoto }}
              gender={story.gender}
              wordless={story.wordless}
              faceAdjust={story.faceAdjust}
            />
          )}
        />
      </div>
      {options && (
        <div className="px-3 pt-2">
          <p className="mb-2 text-center text-sm font-bold">{branch ? story.branchPrompt : story.endingPrompt}</p>
          <div className="mx-auto flex max-w-2xl justify-center gap-2">
            {options.map((option) => {
              const chosen = (branch ? story.interactiveChoice : story.endingChoice) === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={chosen}
                  onClick={() => (branch ? onBranch(option) : onEnding(option))}
                  className={cn("flex w-28 flex-col items-center gap-1 rounded-2xl border-2 bg-white p-1.5 text-xs font-semibold text-foreground", chosen ? "border-primary ring-2 ring-primary/40" : "border-transparent")}
                >
                  <img src={storyImageSrc(option.illustration)} alt="" className="h-16 w-16 object-contain" />
                  <span className="line-clamp-2">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button type="button" onClick={() => go(current - 1)} disabled={current === 0} aria-label={t("העמוד הקודם", "Previous page")} className="grid h-16 w-16 place-items-center rounded-full bg-[#bfe6d1] text-[#315c47] disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
          {rtl ? <ChevronRight className="h-8 w-8" aria-hidden="true" /> : <ChevronLeft className="h-8 w-8" aria-hidden="true" />}
        </button>
        <p className="text-center text-xs text-white/70">{t("אפשר גם להחליק באצבע או להשתמש בחיצים במקלדת", "You can also swipe or use the arrow keys")}</p>
        <button type="button" onClick={() => go(current + 1)} disabled={current === last} aria-label={t("העמוד הבא", "Next page")} className="grid h-16 w-16 place-items-center rounded-full bg-[#bfe6d1] text-[#315c47] disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
          {rtl ? <ChevronLeft className="h-8 w-8" aria-hidden="true" /> : <ChevronRight className="h-8 w-8" aria-hidden="true" />}
        </button>
      </div>
    </div>
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
