import { useEffect, useRef, useState } from "react";
import { addPatient, hasCloudSession, listPatients } from "@/lib/session-board-cloud";
import { BOARD_GAMES, VISUAL_SIGNS, localizedLabel } from "@/lib/session-board-tools";
import { MOTOR_TRAIL_ITEMS } from "@/lib/motor-trail-items";

// The tool row above the session board. Markup and class names follow the live site so the
// existing board styles (therapist-session-board / signs / games CSS) apply unchanged.
export function BoardToolbar({
  language,
  patientBoardId,
  patientName,
  cloudStatus,
  planningReturnUrl,
  openPlanningOnMount,
  onSelectPatient,
  onUseGuestBoard,
  addActivityHref,
  motorTrailHref,
  pen,
  onAddSign,
  onAddGame,
  onAddMotorItem,
  onOpenTimer,
  onOpenChoice,
  onOpenFirstThen,
  onShareWithParents,
  onOpenMyImages,
  onPickPhoto,
  fullscreen,
  onToggleFullscreen,
}) {
  const t = (he, en) => (language === "en" ? en : he);
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [palette, setPalette] = useState(null); // "signs" | "games" | "motor" | null
  const planningRef = useRef(null);

  useEffect(() => {
    if (openPlanningOnMount) setMenuOpen(true);
  }, [openPlanningOnMount]);

  // A click anywhere outside the planning area closes the client menu.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (event) => { if (!planningRef.current?.contains(event.target)) setMenuOpen(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  const statusText = cloudStatus === "saving" ? t("שומרת…", "Saving…") : cloudStatus === "error" ? t("השמירה נכשלה", "Save failed") : t("נשמר בענן", "Saved to cloud");

  function togglePen() {
    setPalette(null);
    pen.setEnabled(!pen.enabled);
  }
  function togglePalette(name) {
    if (name === "signs" && pen.enabled) pen.setEnabled(false);
    setPalette((current) => (current === name ? null : name));
  }

  return (
    <div className={collapsed ? "meeting-board-actions meeting-tools-collapsed" : "meeting-board-actions"} data-meeting-board-actions="true">
      <button
        className="meeting-tools-toggle"
        type="button"
        aria-expanded={!collapsed}
        aria-label={collapsed ? t("פתיחת כלי הלוח", "Expand board tools") : t("כיווץ כלי הלוח", "Collapse board tools")}
        title={collapsed ? t("פתיחת כלי הלוח", "Expand board tools") : t("כיווץ כלי הלוח", "Collapse board tools")}
        onClick={() => setCollapsed((value) => !value)}
      >
        <span aria-hidden="true">{collapsed ? "⌄" : "⌃"}</span>
      </button>

      <div className="meeting-planning-wrap" ref={planningRef}>
        <button className={patientBoardId ? "meeting-save-state" : "meeting-save-state guest"} type="button" data-treatment-planning="" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
          {patientBoardId && patientName ? (
            <>
              <strong>{t("לוח המפגש של", "Session board for")} {patientName}</strong>
              <small data-cloud-save-state="">{statusText}</small>
            </>
          ) : (
            <>
              <strong>{t("תכנון טיפולים", "Treatment planning")}</strong>
              <small>{t("בחירת מטופל ושמירת לוחות", "Choose a client and save boards")}</small>
            </>
          )}
          <span aria-hidden="true">⌄</span>
        </button>
        <div className="meeting-patient-menu" data-patient-menu="" hidden={!menuOpen}>
          {menuOpen && (
            <PatientMenu
              language={language}
              returnUrl={planningReturnUrl}
              onClose={() => setMenuOpen(false)}
              onSelectPatient={onSelectPatient}
              onUseGuestBoard={onUseGuestBoard}
            />
          )}
        </div>
      </div>

      <a className="meeting-add-activity" href={addActivityHref}>{t("הוסף פעילות ללוח המפגש", "Add an activity to the session board")}</a>
      <a className="meeting-board-link" href={motorTrailHref}>
        <span className="meeting-action-icon" aria-hidden="true">＋</span>
        <span className="meeting-action-label-desktop">{t("הוספת מסלול מוטורי", "Add an obstacle course")}</span>
        <span className="meeting-action-label-mobile">{t("מסלול מוטורי", "Obstacle Course Builder")}</span>
      </a>

      <div className="meeting-drawing-tools" data-drawing-tools="true">
        <button type="button" className={pen.enabled ? "meeting-pen-button active" : "meeting-pen-button"} data-board-pen="" aria-pressed={pen.enabled} title={t("עט — כתיבה וציור על הלוח", "Pen — write and draw on the board")} onClick={togglePen}>
          <span className="meeting-action-icon" aria-hidden="true">✎</span>
          <span className="meeting-action-label-desktop">{t("עט", "Pen")}</span>
          <span className="meeting-action-label-mobile">{t("עט", "Pen")}</span>
        </button>
        <div className="meeting-drawing-controls" data-drawing-controls="" hidden={!pen.enabled}>
          <label>{t("צבע", "Color")} <input type="color" value={pen.color} data-pen-color="" onChange={(e) => pen.setColor(e.target.value)} /></label>
          <label>{t("עובי", "Width")} <input type="range" min="2" max="14" step="1" value={pen.width} data-pen-width="" onChange={(e) => pen.setWidth(Number(e.target.value))} /><output data-width-output="">{pen.width}</output></label>
          <button type="button" data-pen-mode="" className={pen.tool === "pen" ? "active" : undefined} onClick={() => pen.setTool("pen")}>{t("עט", "Pen")}</button>
          <button type="button" data-eraser-mode="" className={pen.tool === "eraser" ? "active" : undefined} onClick={() => pen.setTool("eraser")}>{t("מחק", "Eraser")}</button>
          <button type="button" data-clear-drawing="" onClick={pen.onClear}>{t("מחיקת הכתיבה", "Clear drawing")}</button>
          <small data-drawing-status="">{pen.status}</small>
          <button type="button" className="meeting-drawing-close" data-close-drawing="" onClick={() => pen.setEnabled(false)}>{t("סגירה", "Close")}</button>
        </div>
      </div>

      <div className="meeting-signs-tools" data-signs-tools="true">
        <button type="button" className="meeting-signs-button" data-board-signs="" aria-expanded={palette === "signs"} title={t("הוספת סימנים מוסכמים ללוח", "Add visual signs to the board")} onClick={() => togglePalette("signs")}>
          <span className="meeting-action-icon" aria-hidden="true">✋</span>
          <span className="meeting-action-label-desktop">{t("סימנים מוסכמים", "Visual signs")}</span>
          <span className="meeting-action-label-mobile">{t("סימנים", "Signs")}</span>
        </button>
        {palette === "signs" && (
          <div className="meeting-signs-palette" data-signs-palette="true" role="dialog" aria-label={t("בחירת סימן מוסכם", "Choose a visual sign")}>
            <strong>{t("בחירת סימן ללוח", "Choose a sign for the board")}</strong>
            <div>
              {VISUAL_SIGNS.map((sign) => (
                <button key={sign.id} type="button" data-add-visual-sign={sign.id} aria-label={t(`הוספת ${sign.label} ללוח`, `Add ${sign.labelEn} to the board`)} onClick={() => { setPalette(null); onAddSign(sign); }}>
                  <span className="visual-sign-card"><span className="visual-sign-art"><img src={sign.asset} alt="" /></span><strong>{localizedLabel(sign, language)}</strong></span>
                </button>
              ))}
            </div>
            <button type="button" className="meeting-signs-close" data-close-signs="" onClick={() => setPalette(null)}>{t("סגירה", "Close")}</button>
          </div>
        )}
      </div>

      <div className="meeting-games-tools" data-games-tools="true">
        <button type="button" className="meeting-games-button" data-board-games="" aria-expanded={palette === "games"} title={t("הוספת משחק ללוח", "Add a game to the board")} onClick={() => togglePalette("games")}>
          <img className="meeting-tool-image-icon" src="/assets/therapist-games/board-game.png" alt="" />
          <span>{t("משחקים", "Games")}</span>
        </button>
        {palette === "games" && (
          <div className="meeting-games-palette" data-games-palette="true" role="dialog" aria-label={t("בחירת משחק ללוח", "Choose a game for the board")}>
            <strong>{t("בחירת משחק ללוח", "Choose a game for the board")}</strong>
            <div>
              {BOARD_GAMES.map((game) => (
                <button key={game.id} type="button" data-add-board-game={game.id} aria-label={t(`הוספת ${game.label} ללוח`, `Add ${game.labelEn} to the board`)} onClick={() => { setPalette(null); onAddGame(game); }}>
                  <span className="board-game-choice"><span><img src={game.asset} alt="" /></span><strong>{localizedLabel(game, language)}</strong></span>
                </button>
              ))}
            </div>
            <button type="button" className="meeting-games-close" data-close-games="" onClick={() => setPalette(null)}>{t("סגירה", "Close")}</button>
          </div>
        )}
      </div>

      <button className="meeting-timer" type="button" onClick={onOpenTimer}>
        <span className="meeting-action-icon" aria-hidden="true">⏱</span>
        <span className="meeting-action-label-desktop">{t("טיימר חזותי", "Visual timer")}</span>
        <span className="meeting-action-label-mobile">{t("טיימר", "Timer")}</span>
      </button>
      <button className="meeting-photo" type="button" onClick={onPickPhoto}>
        <span className="meeting-action-icon" aria-hidden="true">📷</span>
        <span className="meeting-action-label-desktop">{t("צילום או הוספת תמונה", "Take or add a photo")}</span>
        <span className="meeting-action-label-mobile">{t("תמונה", "Photo")}</span>
      </button>
      <button className="meeting-fullscreen" type="button" aria-pressed={fullscreen} onClick={onToggleFullscreen}>
        <span className="meeting-action-icon" aria-hidden="true">⛶</span>
        <span data-fullscreen-label="">{fullscreen ? t("יציאה ממסך מלא", "Exit full screen") : t("מסך מלא", "Full screen")}</span>
      </button>
      <button className="meeting-choice" type="button" onClick={onOpenChoice} title={t("לוח בחירה - הילד בוחר מבין 2-3 אפשרויות", "Choice board - the child picks one of 2-3 options")}>
        <span className="meeting-action-icon" aria-hidden="true">✌</span>
        <span className="meeting-action-label-desktop">{t("לוח בחירה", "Choice board")}</span>
        <span className="meeting-action-label-mobile">{t("לוח בחירה", "Choice")}</span>
      </button>
      <button className="meeting-first-then" type="button" onClick={onOpenFirstThen} title={t("קודם - אחר כך", "First - then")}>
        <span className="meeting-action-icon" aria-hidden="true">⇠</span>
        <span className="meeting-action-label-desktop">{t("קודם - אחר כך", "First - then")}</span>
        <span className="meeting-action-label-mobile">{t("קודם-אחר כך", "First-then")}</span>
      </button>
      <button className="meeting-share-parents" type="button" onClick={onShareWithParents} title={t("שליחת פעילויות מהלוח להורים לתרגול בבית", "Send board activities to parents to practice at home")}>
        <span className="meeting-action-icon" aria-hidden="true">🏠</span>
        <span className="meeting-action-label-desktop">{t("שליחה להורים", "Send to parents")}</span>
        <span className="meeting-action-label-mobile">{t("שליחה להורים", "To parents")}</span>
      </button>
      <button className="meeting-my-images" type="button" onClick={onOpenMyImages} title={t("התמונות שלי - העלאת תמונות של משחקים וציוד", "My images - upload photos of games and equipment")}>
        <span className="meeting-action-icon" aria-hidden="true">🖼️</span>
        <span className="meeting-action-label-desktop">{t("העלאת תמונות", "Upload images")}</span>
        <span className="meeting-action-label-mobile">{t("העלאת תמונות", "My images")}</span>
      </button>
      <div className="meeting-games-tools meeting-motor-tools" data-motor-tools="true">
        <button type="button" className="meeting-games-button meeting-motor-button" aria-expanded={palette === "motor"} title={t("הוספת אביזר מהמסלול המוטורי ללוח", "Add obstacle-course equipment to the board")} onClick={() => togglePalette("motor")}>
          <img className="meeting-tool-image-icon" src="/icon-bank/motor-trail/trampoline.webp" alt="" />
          <span>{t("אביזרים מוטוריים", "Motor equipment")}</span>
        </button>
        {palette === "motor" && (
          <div className="meeting-games-palette" role="dialog" aria-label={t("בחירת אביזר מוטורי ללוח", "Choose motor equipment for the board")}>
            <strong>{t("בחירת אביזר מוטורי ללוח", "Choose motor equipment for the board")}</strong>
            <div>
              {MOTOR_TRAIL_ITEMS.map((item) => (
                <button key={item.id} type="button" data-add-board-game={`motor-${item.id}`} aria-label={t(`הוספת ${item.label} ללוח`, `Add ${item.labelEn} to the board`)} onClick={() => { setPalette(null); onAddMotorItem(item); }}>
                  <span className="board-game-choice"><span><img src={item.image} alt="" /></span><strong>{localizedLabel(item, language)}</strong></span>
                </button>
              ))}
            </div>
            <button type="button" className="meeting-games-close" onClick={() => setPalette(null)}>{t("סגירה", "Close")}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// Choose which client's board to open, add a client, or use the board without a client.
function PatientMenu({ language, returnUrl, onClose, onSelectPatient, onUseGuestBoard }) {
  const t = (he, en) => (language === "en" ? en : he);
  const signedIn = hasCloudSession();
  const [state, setState] = useState(signedIn ? "loading" : "signed-out");
  const [patients, setPatients] = useState([]);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const signInHref = `/auth?mode=login&intent=patients&redirect=${encodeURIComponent(returnUrl)}`;

  useEffect(() => {
    if (!signedIn) return undefined;
    let cancelled = false;
    listPatients()
      .then((rows) => { if (!cancelled) { setPatients(Array.isArray(rows) ? rows : []); setState("ready"); } })
      .catch(() => { if (!cancelled) setState("error"); });
    return () => { cancelled = true; };
  }, [signedIn]);

  async function submit(event) {
    event.preventDefault();
    const displayName = name.trim();
    if (!displayName) return;
    setAdding(true);
    try {
      onSelectPatient(await addPatient(displayName));
    } catch {
      setMessage(t("לא הצלחנו להוסיף את המטופל כרגע.", "We could not add the client right now."));
      setAdding(false);
    }
  }

  if (state === "signed-out") {
    return (
      <>
        <strong>{t("שמירת לוחות למטופלים", "Save client boards")}</strong>
        <p>{t("התחברי כדי לשמור מספר מטופלים ולפתוח את הלוחות מכל מכשיר.", "Sign in to save boards for multiple clients and open them from any device.")}</p>
        <a className="patient-menu-primary" href={signInHref}>{t("התחברות", "Sign in")}</a>
        <button type="button" data-close-patient-menu="" onClick={onClose}>{t("חזרה ללוח ללא התחברות", "Return to the board without signing in")}</button>
      </>
    );
  }
  if (state === "loading") {
    return (
      <>
        <strong>{t("בחירת מטופל", "Choose a client")}</strong>
        <p className="patient-menu-loading">{t("טוענת את המטופלים…", "Loading clients…")}</p>
      </>
    );
  }
  if (state === "error") {
    return (
      <>
        <strong>{t("לא הצלחנו לטעון את המטופלים", "We could not load the clients")}</strong>
        <p>{t("ייתכן שצריך להתחבר מחדש.", "You may need to sign in again.")}</p>
        <a className="patient-menu-primary" href={signInHref}>{t("התחברות מחדש", "Sign in again")}</a>
        <button type="button" data-close-patient-menu="" onClick={onClose}>{t("חזרה ללוח", "Return to the board")}</button>
      </>
    );
  }
  return (
    <>
      <strong>{t("בחירת מטופל", "Choose a client")}</strong>
      <div className="patient-menu-list">
        {patients.length
          ? patients.map((patient) => <button key={patient.id} type="button" data-select-patient={patient.id} onClick={() => onSelectPatient(patient.id)}>{patient.display_name}</button>)
          : <p>{t("עדיין לא הוספת מטופלים.", "You have not added any clients yet.")}</p>}
      </div>
      <form data-add-patient-form="" onSubmit={submit}>
        <label htmlFor="quickPatientName">{t("הוספת מטופל", "Add a client")}</label>
        <div>
          <input id="quickPatientName" name="patientName" maxLength={80} required value={name} onChange={(e) => setName(e.target.value)} placeholder={t("שם פרטי, ראשי תיבות או כינוי", "First name, initials, or nickname")} />
          <button type="submit" disabled={adding}>{t("הוספה", "Add")}</button>
        </div>
        <small>{t("מומלץ לא להזין שם מלא או מידע רפואי.", "We recommend not entering a full name or medical information.")}</small>
      </form>
      <button type="button" data-use-guest-board="" onClick={onUseGuestBoard}>{t("מעבר ללוח ללא מטופל", "Use a board without a client")}</button>
      <a href="/therapist/my-patients/">{t("ניהול המטופלים שלי", "Manage my clients")}</a>
      <p className="patient-menu-message" role="status">{message}</p>
    </>
  );
}
