import { useState } from "react";
import { Hand, Pencil, Timer } from "lucide-react";
import { TherapistPostureScissorsTips } from "@/components/TherapistPostureScissorsTips";
import { PenBar } from "@/components/toolbox/PenBar";
import { Toolbox, tipTools } from "@/components/toolbox/Toolbox";
import { VISUAL_SIGNS, localizedLabel } from "@/lib/session-board-tools";

// The toolbox on the session board. It sits inside the board, so it stays available in full screen,
// where the tool row is hidden. Its timer and pen are the board's own, and signs are added to the board.
export function BoardToolbox({ language, fullscreen, pen, onOpenTimer, onAddSign }) {
  const t = (he, en) => (language === "en" ? en : he);
  const [tipPanel, setTipPanel] = useState(null);

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
    ...tipTools(language, (panel) => { pen.setEnabled(false); setTipPanel(panel); }),
  ];

  return (
    <>
      <Toolbox
        language={language}
        tools={tools}
        storageKey={fullscreen ? "boo_board_tools_position" : "boo_page_tools_position"}
        placement={fullscreen ? "bottom" : "middle"}
        hidden={Boolean(tipPanel)}
        key={fullscreen ? "fullscreen" : "page"}
      />
      {/* Outside full screen the tool row has its own pen controls. */}
      {fullscreen && pen.enabled && <PenBar language={language} pen={pen} />}
      <TherapistPostureScissorsTips language={language} openPanel={tipPanel} onOpenPanelChange={setTipPanel} />
    </>
  );
}
