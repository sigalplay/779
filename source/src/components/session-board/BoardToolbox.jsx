import { useEffect, useState } from "react";
import { ArrowLeftRight, Hand, ImagePlus, Pencil, Split, Timer } from "lucide-react";
import { TherapistPostureScissorsTips } from "@/components/TherapistPostureScissorsTips";
import { PenBar } from "@/components/toolbox/PenBar";
import { Toolbox, tipTools } from "@/components/toolbox/Toolbox";
import { VISUAL_SIGNS, localizedLabel } from "@/lib/session-board-tools";
import { MOTOR_TRAIL_ITEMS } from "@/lib/motor-trail-items";

// The toolbox on the session board in full screen, where the tool row is hidden (outside full screen
// the tool row already has every tool). It sits inside the board so it stays visible in full screen.
// Its timer and pen are the board's own, and signs are added to the board.
export function BoardToolbox({ language, pen, onOpenTimer, onAddSign, onOpenChoice, onOpenMyImages, onAddMotorItem }) {
  const t = (he, en) => (language === "en" ? en : he);
  const [tipPanel, setTipPanel] = useState(null);

  // While a tip window is open, hide the full-screen exit button so its × is not confused with the window's.
  useEffect(() => {
    document.body.classList.toggle("board-tip-open", Boolean(tipPanel));
    return () => document.body.classList.remove("board-tip-open");
  }, [tipPanel]);

  const tools = [
    { id: "timer", color: "#bcdcf2", icon: <Timer />, label: t("טיימר", "Timer"), onSelect: onOpenTimer },
    { id: "pen", color: "#f6c3b5", icon: <Pencil />, label: t("עט", "Pen"), onSelect: () => { pen.setTool("pen"); pen.setEnabled(true); } },
    {
      id: "signs",
      color: "#f8df9a",
      icon: <Hand />,
      label: t("סימנים מוסכמים", "Visual signs"),
      items: VISUAL_SIGNS.map((sign) => ({
        id: sign.id,
        image: sign.asset,
        label: localizedLabel(sign, language),
        ariaLabel: t(`הוספת ${sign.label} ללוח`, `Add ${sign.labelEn} to the board`),
        onSelect: () => { pen.setEnabled(false); onAddSign(sign); },
      })),
    },
    { id: "choice", color: "#d8ecc6", icon: <Split />, label: t("לוח בחירה", "Choice board"), onSelect: () => { pen.setEnabled(false); onOpenChoice("choice"); } },
    { id: "first-then", color: "#e6dcf5", icon: <ArrowLeftRight />, label: t("קודם-אחר כך", "First-then"), onSelect: () => { pen.setEnabled(false); onOpenChoice("firstThen"); } },
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
    { id: "my-images", color: "#f9d0de", icon: <ImagePlus />, label: t("העלאת תמונות", "Upload images"), onSelect: () => { pen.setEnabled(false); onOpenMyImages(); } },
    ...tipTools(language, (panel) => { pen.setEnabled(false); setTipPanel(panel); }),
  ];

  return (
    <>
      <Toolbox language={language} tools={tools} storageKey="boo_board_tools_position" placement="bottom" hidden={Boolean(tipPanel)} />
      {pen.enabled && <PenBar language={language} pen={pen} />}
      <TherapistPostureScissorsTips language={language} openPanel={tipPanel} onOpenPanelChange={setTipPanel} />
    </>
  );
}
