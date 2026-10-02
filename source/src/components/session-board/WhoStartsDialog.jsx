import { useEffect, useRef, useState } from "react";
import { Plus, RotateCcw, X } from "lucide-react";

// "Who starts?" on the session board: eeny meeny (אן דן דינו), a draw, a vote, or rock paper scissors.
// The players' names are kept per client in this browser.
const STORAGE_KEY = "boo_who_starts_v1";
const AVATARS = ["🐶", "🐱", "🐰", "🦊", "🐼", "🐸", "🦁", "🐻"];
const COLORS = ["#f9d0de", "#bcdcf2", "#bfe6d1", "#fbe7a1", "#e6dcf5", "#f6c3b5", "#d8ecc6", "#f8df9a"];
const MAX_PLAYERS = 8;
const RHYME_HE = ["אֶן", "דֶּן", "דִּינוֹ", "סָק", "לָה", "מִינוֹ", "סָק", "לָה", "טָקָה", "אֶן", "דֶּן", "דּוֹ"];
const RHYME_EN = ["Eeny", "meeny", "miny", "moe", "catch", "a", "tiger", "by", "the", "toe"];
const HANDS = [
  { id: "rock", emoji: "✊", he: "אבן", en: "Rock", beats: "scissors" },
  { id: "paper", emoji: "✋", he: "נייר", en: "Paper", beats: "rock" },
  { id: "scissors", emoji: "✌️", he: "מספריים", en: "Scissors", beats: "paper" },
];

function readPlayers(patientKey) {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")[patientKey];
    return Array.isArray(list) && list.length >= 2 ? list.slice(0, MAX_PLAYERS).map(String) : null;
  } catch { return null; }
}

function savePlayers(patientKey, players) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    all[patientKey] = players;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch { /* storage is optional */ }
}

const randomIndex = (length) => Math.floor(Math.random() * length);

export function WhoStartsDialog({ language, patientKey, patientName, onClose }) {
  const t = (he, en) => (language === "en" ? en : he);
  const [mode, setMode] = useState("rhyme"); // "rhyme" | "draw" | "vote" | "rps"
  const [players, setPlayers] = useState(() => readPlayers(patientKey) || [patientName || t("אני", "Me"), t("המטפלת", "Therapist")]);
  const [editing, setEditing] = useState(false);

  useEffect(() => { savePlayers(patientKey, players); }, [patientKey, players]);

  useEffect(() => {
    const onKey = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const names = players.map((name, i) => name.trim() || t(`שחקן ${i + 1}`, `Player ${i + 1}`));
  const modes = [
    ["rhyme", "👆", t("אן דן דינו", "Eeny meeny")],
    ["draw", "🎲", t("הגרלה", "Draw")],
    ["vote", "✋", t("הצבעה", "Vote")],
    ["rps", "✊", t("אבן, נייר ומספריים", "Rock paper scissors")],
  ];

  return (
    <div className="choice-board" role="dialog" aria-modal="true" aria-label={t("מי מתחיל?", "Who starts?")}>
      <div className="choice-board-card who-card">
        <button type="button" className="choice-board-close" onClick={onClose} aria-label={t("סגירה", "Close")}><X /></button>
        <h2>{t("מי מתחיל?", "Who starts?")}</h2>
        <div className="who-modes" role="tablist">
          {modes.map(([id, emoji, label]) => (
            <button key={id} type="button" role="tab" aria-selected={mode === id} className={mode === id ? "on" : ""} onClick={() => setMode(id)}>
              <span aria-hidden="true">{emoji}</span>{label}
            </button>
          ))}
        </div>
        <section className="who-players" aria-label={t("המשתתפים", "Players")}>
          {editing ? (
            <div className="who-edit">
              {players.map((name, i) => (
                <span key={i} className="who-edit-row" style={{ background: COLORS[i] }}>
                  <span aria-hidden="true">{AVATARS[i]}</span>
                  <input value={name} maxLength={20} aria-label={t(`שם משתתף ${i + 1}`, `Player ${i + 1} name`)} onChange={(e) => setPlayers((list) => list.map((item, j) => (j === i ? e.target.value : item)))} />
                  {players.length > 2 && <button type="button" aria-label={t(`הסרת ${names[i]}`, `Remove ${names[i]}`)} onClick={() => setPlayers((list) => list.filter((_, j) => j !== i))}><X aria-hidden="true" /></button>}
                </span>
              ))}
              {players.length < MAX_PLAYERS && (
                <button type="button" className="who-add" onClick={() => setPlayers((list) => [...list, ""])}><Plus aria-hidden="true" />{t("משתתף", "Player")}</button>
              )}
              <button type="button" className="who-done" onClick={() => { setPlayers((list) => list.map((name, i) => name.trim() || names[i])); setEditing(false); }}>{t("סיום", "Done")}</button>
            </div>
          ) : (
            <button type="button" className="who-edit-open" onClick={() => setEditing(true)}>
              {t(`${players.length} משתתפים`, `${players.length} players`)} · {t("עריכת שמות", "Edit names")}
            </button>
          )}
        </section>
        {!editing && mode === "rhyme" && <Rhyme key={players.length} t={t} names={names} language={language} />}
        {!editing && mode === "draw" && <Draw key={players.length} t={t} names={names} />}
        {!editing && mode === "vote" && <Vote key={players.length} t={t} names={names} />}
        {!editing && mode === "rps" && <RockPaperScissors key={players.length} t={t} names={names} />}
      </div>
    </div>
  );
}

function PlayerCircles({ names, active, winner, votes, onVote }) {
  return (
    <div className="who-circles">
      {names.map((name, i) => (
        <div key={i} className={`who-player${active === i ? " active" : ""}${winner === i ? " winner" : ""}`} style={{ "--who-color": COLORS[i] }}>
          <span className="who-avatar" aria-hidden="true">{AVATARS[i]}</span>
          <strong>{name}</strong>
          {votes && (
            <span className="who-votes">
              <button type="button" aria-label={`-1 ${name}`} disabled={!votes[i]} onClick={() => onVote(i, -1)}>−</button>
              <output aria-live="polite">{votes[i]}</output>
              <button type="button" aria-label={`+1 ${name}`} onClick={() => onVote(i, 1)}>+</button>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function Winner({ t, name, onAgain }) {
  return (
    <div className="who-winner" role="status">
      <span aria-hidden="true">🎉</span>
      <strong>{t(`התור של ${name}!`, `${name} goes first!`)}</strong>
      <button type="button" className="who-again" onClick={onAgain}><RotateCcw aria-hidden="true" />{t("שוב", "Again")}</button>
    </div>
  );
}

// Says the rhyme word by word, pointing at the next player on every word.
function Rhyme({ t, names, language }) {
  const words = language === "en" ? RHYME_EN : RHYME_HE;
  const [step, setStep] = useState(-1);
  const [start, setStart] = useState(0);
  const running = step >= 0 && step < words.length;
  const done = step >= words.length;
  const pointAt = (n) => (start + n) % names.length;

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setTimeout(() => setStep((n) => n + 1), 650);
    return () => window.clearTimeout(id);
  }, [running, step]);

  function go() { setStart(randomIndex(names.length)); setStep(0); }
  const winner = pointAt(words.length - 1);
  return (
    <div className="who-stage">
      <PlayerCircles names={names} active={running ? pointAt(step) : -1} winner={done ? winner : -1} />
      <div className="who-word" aria-live="polite">{running ? words[step] : done ? "" : words.slice(0, 3).join(" ") + "…"}</div>
      {done ? <Winner t={t} name={names[winner]} onAgain={go} /> : (
        <div className="choice-board-actions"><button type="button" className="choice-primary" onClick={go} disabled={running}>{t("מתחילים לספור", "Start counting")}</button></div>
      )}
    </div>
  );
}

// Runs around the players, slowing down, and stops on a random one.
function Draw({ t, names }) {
  const [active, setActive] = useState(-1);
  const [winner, setWinner] = useState(-1);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function go() {
    window.clearTimeout(timer.current);
    setWinner(-1);
    const target = randomIndex(names.length);
    const from = randomIndex(names.length);
    const total = names.length * 3 + ((target - from + names.length) % names.length);
    let n = 0;
    const tick = () => {
      setActive((from + n) % names.length);
      if (n >= total) { setWinner(target); return; }
      n += 1;
      timer.current = window.setTimeout(tick, 70 + (n / total) ** 3 * 450);
    };
    tick();
  }
  const spinning = active >= 0 && winner < 0;
  return (
    <div className="who-stage">
      <PlayerCircles names={names} active={spinning ? active : -1} winner={winner} />
      {winner >= 0 ? <Winner t={t} name={names[winner]} onAgain={go} /> : (
        <div className="choice-board-actions"><button type="button" className="choice-primary" onClick={go} disabled={spinning}>🎲 {t("מגרילים!", "Draw!")}</button></div>
      )}
    </div>
  );
}

// Everyone votes with a hand up; a tie is settled with a draw between the tied players.
function Vote({ t, names }) {
  const [votes, setVotes] = useState(() => names.map(() => 0));
  const [winner, setWinner] = useState(-1);
  const total = votes.reduce((sum, n) => sum + n, 0);
  const top = Math.max(...votes);
  const leaders = votes.map((n, i) => (n === top ? i : -1)).filter((i) => i >= 0);

  function vote(i, delta) { setWinner(-1); setVotes((list) => list.map((n, j) => (j === i ? Math.max(0, n + delta) : n))); }
  function finish() { setWinner(leaders[randomIndex(leaders.length)]); }
  function again() { setWinner(-1); setVotes(names.map(() => 0)); }
  return (
    <div className="who-stage">
      <p className="choice-board-hint">{t("כל אחד מצביע על מי שיתחיל. לוחצים + על השם.", "Everyone votes for who starts. Tap + by the name.")}</p>
      <PlayerCircles names={names} active={-1} winner={winner} votes={votes} onVote={vote} />
      {winner >= 0 ? <Winner t={t} name={names[winner]} onAgain={again} /> : (
        <div className="choice-board-actions">
          <button type="button" className="choice-primary" onClick={finish} disabled={!total}>
            {total && leaders.length > 1 ? t("תיקו! מגרילים ביניהם 🎲", "A tie! Draw between them 🎲") : t("מי ניצח?", "Who won?")}
          </button>
        </div>
      )}
    </div>
  );
}

// Two players each pick in secret, then "rock… paper… scissors!" shows both hands.
function RockPaperScissors({ t, names }) {
  const [sides, setSides] = useState([0, 1]);
  const [picks, setPicks] = useState([null, null]);
  const [count, setCount] = useState(-1);
  const sayings = [t("אבן…", "Rock…"), t("נייר…", "Paper…"), t("ומספריים!", "Scissors!")];
  const revealed = count >= sayings.length;

  useEffect(() => {
    if (count < 0 || revealed) return undefined;
    const id = window.setTimeout(() => setCount((n) => n + 1), 700);
    return () => window.clearTimeout(id);
  }, [count, revealed]);

  const pick = (side, hand) => setPicks((list) => list.map((p, i) => (i === side ? hand : p)));
  const again = () => { setPicks([null, null]); setCount(-1); };
  const [a, b] = picks.map((id) => HANDS.find((hand) => hand.id === id));
  const result = revealed ? (a.id === b.id ? -1 : a.beats === b.id ? 0 : 1) : null;

  return (
    <div className="who-stage">
      <div className="who-rps">
        {[0, 1].map((side) => (
          <div key={side} className="who-rps-side" style={{ "--who-color": COLORS[sides[side]] }}>
            <select aria-label={t("מי משחק", "Who plays")} value={sides[side]} onChange={(e) => { setSides((list) => list.map((p, i) => (i === side ? Number(e.target.value) : p))); again(); }}>
              {names.map((name, i) => <option key={i} value={i} disabled={i === sides[1 - side]}>{AVATARS[i]} {name}</option>)}
            </select>
            {revealed ? (
              <div className={`who-rps-hand${result === side ? " winner" : ""}`}><span aria-hidden="true">{(side ? b : a).emoji}</span>{t((side ? b : a).he, (side ? b : a).en)}</div>
            ) : picks[side] ? (
              <div className="who-rps-hand hidden"><span aria-hidden="true">🤫</span>{t("בחרתי!", "Picked!")}</div>
            ) : (
              <div className="who-rps-picks">
                {HANDS.map((hand) => (
                  <button key={hand.id} type="button" onClick={() => pick(side, hand.id)} disabled={count >= 0}>
                    <span aria-hidden="true">{hand.emoji}</span>{t(hand.he, hand.en)}
                  </button>
                ))}
                <button type="button" className="who-rps-random" onClick={() => pick(side, HANDS[randomIndex(3)].id)} disabled={count >= 0}>🎲 {t("אקראי", "Random")}</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {count >= 0 && !revealed && <div className="who-word" aria-live="polite">{sayings[count]}</div>}
      {revealed ? (result < 0 ? (
        <div className="who-winner" role="status"><span aria-hidden="true">🤝</span><strong>{t("תיקו! עוד פעם", "A tie! Once more")}</strong><button type="button" className="who-again" onClick={again}><RotateCcw aria-hidden="true" />{t("שוב", "Again")}</button></div>
      ) : <Winner t={t} name={names[sides[result]]} onAgain={again} />) : count < 0 && (
        <div className="choice-board-actions">
          <button type="button" className="choice-primary" disabled={!picks[0] || !picks[1]} onClick={() => setCount(0)}>{t("אבן, נייר ומספריים!", "Rock, paper, scissors!")}</button>
        </div>
      )}
    </div>
  );
}
