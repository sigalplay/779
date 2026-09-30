import { useEffect, useState } from "react";
import { TherapistPostureScissorsTips } from "@/components/TherapistPostureScissorsTips";
import { PenBar } from "@/components/toolbox/PenBar";
import { Toolbox, tipTools } from "@/components/toolbox/Toolbox";
import { CALM_HELPERS, EMOTIONS, VISUAL_SIGNS, calmHelperImage, emotionAsset, getCalmGender, getEmotionGender, localizedLabel, setCalmGender, setEmotionGender } from "@/lib/session-board-tools";
import { MOTOR_TRAIL_ITEMS } from "@/lib/motor-trail-items";

// The toolbox on the session board in full screen, where the tool row is hidden (outside full screen
// the tool row already has every tool). It sits inside the board so it stays visible in full screen.
// Its timer and pen are the board's own, and signs are added to the board.
export function BoardToolbox({ language, pen, onOpenTimer, onAddSign, onOpenChoice, onAddMotorItem, onAddEmotion, onAddCalmHelper, calmPatientKey }) {
  const t = (he, en) => (language === "en" ? en : he);
  const [tipPanel, setTipPanel] = useState(null);
  const [emotionGender, setEmotionGenderState] = useState(getEmotionGender);
  const [calmGender, setCalmGenderState] = useState(() => getCalmGender(calmPatientKey));

  // While a tip window is open, hide the full-screen exit button so its × is not confused with the window's.
  useEffect(() => {
    document.body.classList.toggle("board-tip-open", Boolean(tipPanel));
    return () => document.body.classList.remove("board-tip-open");
  }, [tipPanel]);

  const byId = Object.fromEntries([
    { id: "timer", color: "#bcdcf2", image: "/icon-bank/tools/timer.webp", label: t("טיימר", "Timer"), onSelect: onOpenTimer },
    { id: "pen", color: "#f6c3b5", image: "/icon-bank/tools/pen.webp", label: t("עט", "Pen"), onSelect: () => { pen.setTool("pen"); pen.setEnabled(true); } },
    {
      id: "signs",
      color: "#f8df9a",
      image: "/icon-bank/tools/signs.webp",
      label: t("סימנים", "Signs"),
      items: VISUAL_SIGNS.map((sign) => ({
        id: sign.id,
        image: sign.asset,
        label: localizedLabel(sign, language),
        ariaLabel: t(`הוספת ${sign.label} ללוח`, `Add ${sign.labelEn} to the board`),
        onSelect: () => { pen.setEnabled(false); onAddSign(sign); },
      })),
    },
    {
      id: "emotions",
      color: "#fbe7a1",
      image: "/icon-bank/emotions/happy.webp",
      label: t("רגשות", "Emotions"),
      large: true,
      items: [
        ...EMOTIONS.map((emotion) => ({
          id: emotion.id,
          image: emotionAsset(emotion, emotionGender),
          fill: true,
          label: localizedLabel(emotion, language),
          ariaLabel: t(`הוספת ${emotion.label} ללוח`, `Add ${emotion.labelEn} to the board`),
          onSelect: () => { pen.setEnabled(false); onAddEmotion({ ...emotion, asset: emotionAsset(emotion, emotionGender) }); },
        })),
        // Switches the faces between the boy and the girl.
        {
          id: "emotion-gender",
          image: emotionAsset(EMOTIONS[0], emotionGender === "girl" ? "boy" : "girl"),
          fill: true,
          label: emotionGender === "girl" ? t("לבן", "Boy") : t("לבת", "Girl"),
          ariaLabel: emotionGender === "girl" ? t("החלפה לרגשות של בן", "Switch to the boy's faces") : t("החלפה לרגשות של בת", "Switch to the girl's faces"),
          keepOpen: true,
          onSelect: () => { const next = emotionGender === "girl" ? "boy" : "girl"; setEmotionGender(next); setEmotionGenderState(next); },
        },
      ],
    },
    {
      id: "calm",
      color: "#f6d9e2",
      image: calmHelperImage(CALM_HELPERS[0], calmGender),
      fill: true,
      label: t("להירגע", "Calm down"),
      items: [
        ...CALM_HELPERS.map((helper) => ({
          id: `calm-${helper.id}`,
          image: calmHelperImage(helper, calmGender),
          fill: true,
          label: localizedLabel(helper, language),
          ariaLabel: t(`הוספת ${helper.he} ללוח`, `Add ${helper.en} to the board`),
          onSelect: () => { pen.setEnabled(false); onAddCalmHelper({ ...helper, asset: calmHelperImage(helper, calmGender) }); },
        })),
        {
          id: "calm-gender",
          image: calmHelperImage(CALM_HELPERS[0], calmGender === "girl" ? "boy" : "girl"),
          fill: true,
          label: calmGender === "girl" ? t("לבן", "Boy") : t("לבת", "Girl"),
          ariaLabel: calmGender === "girl" ? t("החלפה לאיורים של בן", "Switch to the boy's pictures") : t("החלפה לאיורים של בת", "Switch to the girl's pictures"),
          keepOpen: true,
          onSelect: () => { const next = calmGender === "girl" ? "boy" : "girl"; setCalmGender(calmPatientKey, next); setCalmGenderState(next); },
        },
      ],
    },
    { id: "first-then", color: "#e6dcf5", image: "/icon-bank/tools/first-then.webp", label: t("קודם-אחר כך", "First-then"), onSelect: () => { pen.setEnabled(false); onOpenChoice("firstThen"); } },
    {
      id: "motor",
      color: "#bfe6d1",
      image: "/icon-bank/motor-trail/trampoline.webp",
      label: t("אביזרים מוטוריים", "Motor equipment"),
      items: MOTOR_TRAIL_ITEMS.map((item) => ({
        id: item.id,
        image: item.image,
        label: localizedLabel(item, language),
        ariaLabel: t(`הוספת ${item.label} ללוח`, `Add ${item.labelEn} to the board`),
        onSelect: () => { pen.setEnabled(false); onAddMotorItem(item); },
      })),
    },
    ...tipTools(language, (panel) => { pen.setEnabled(false); setTipPanel(panel); }),
  ].map((tool) => [tool.id, tool]));
  // In groups: the therapist's tools, then the tips, then what is shown to the child.
  const tools = ["timer", "pen", "motor", "posture", "scissors", "writing", "coloring", "signs", "emotions", "calm", "first-then"].map((id) => byId[id]).filter(Boolean);

  return (
    <>
      <Toolbox language={language} tools={tools} storageKey="boo_board_tools_position" placement="bottom" hidden={Boolean(tipPanel)} />
      {pen.enabled && <PenBar language={language} pen={pen} />}
      <TherapistPostureScissorsTips language={language} openPanel={tipPanel} onOpenPanelChange={setTipPanel} />
    </>
  );
}
