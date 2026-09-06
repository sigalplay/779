/* ---------- כרטיסי דגשים לגזירה עם איור לכל דגש ---------- */

function TwoHandsIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <g transform="rotate(-25 66 40)">
        <rect x="58" y="24" width="8" height="34" rx="3" fill="#E3E3E3" stroke="#A8A8A8" strokeWidth="2.5" />
        <rect x="70" y="24" width="8" height="34" rx="3" fill="#E3E3E3" stroke="#A8A8A8" strokeWidth="2.5" />
        <circle cx="62" cy="56" r="6" fill="none" stroke="#A8A8A8" strokeWidth="2.5" />
        <circle cx="74" cy="56" r="6" fill="none" stroke="#A8A8A8" strokeWidth="2.5" />
      </g>
      <path d="M18 60 H50 L54 70 H22 Z" fill="#F7F2E3" stroke="#D6C9A6" strokeWidth="2.5" />
      <path
        d="M20 78 C24 70 30 74 34 68 C30 76 36 78 30 84 C26 88 20 86 20 78 Z"
        fill="#F0C79A"
        stroke="#C99A6B"
        strokeWidth="2"
      />
    </svg>
  );
}

function ThumbEyesIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path
        d="M40 88 V50 C40 38 46 30 54 30 C58 30 60 34 60 38 V48 H68 C74 48 78 52 78 58 L74 82 C73 86 70 88 66 88 Z"
        fill="#F0C79A"
        stroke="#C99A6B"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="52" cy="42" r="4" fill="#FFFFFF" stroke="#3E2513" strokeWidth="1.5" />
      <circle cx="52" cy="42" r="1.6" fill="#3E2513" />
      <circle cx="65" cy="40" r="4" fill="#FFFFFF" stroke="#3E2513" strokeWidth="1.5" />
      <circle cx="65" cy="40" r="1.6" fill="#3E2513" />
      <path d="M55 30 L55 14" fill="none" stroke="#8FB6C9" strokeWidth="4" strokeLinecap="round" />
      <path d="M48 22 L55 14 L62 22" fill="none" stroke="#8FB6C9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ScissorsBiteIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M10 50 H60 L52 42 M60 50 L52 58" fill="none" stroke="#C9BFA8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M50 42 Q56 50 50 58" fill="none" stroke="#FBF7F0" strokeWidth="10" strokeLinecap="round" />
      <g transform="rotate(-8 78 50)">
        <path d="M62 38 L86 46 L62 50 Z" fill="#E3E3E3" stroke="#A8A8A8" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M62 62 L86 54 L62 50 Z" fill="#E3E3E3" stroke="#A8A8A8" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="60" cy="42" r="6" fill="none" stroke="#A8A8A8" strokeWidth="2.5" />
        <circle cx="60" cy="58" r="6" fill="none" stroke="#A8A8A8" strokeWidth="2.5" />
      </g>
    </svg>
  );
}

function ScissorsOpenMouthIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <g transform="translate(4 0)">
        <path d="M30 30 L82 46 L30 50 Z" fill="#E3E3E3" stroke="#A8A8A8" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M30 70 L82 54 L30 50 Z" fill="#E3E3E3" stroke="#A8A8A8" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="26" cy="34" r="7" fill="none" stroke="#A8A8A8" strokeWidth="3" />
        <circle cx="26" cy="66" r="7" fill="none" stroke="#A8A8A8" strokeWidth="3" />
      </g>
      <circle cx="80" cy="46" r="2.5" fill="#5D8FA6" />
      <circle cx="80" cy="54" r="2.5" fill="#5D8FA6" />
    </svg>
  );
}

function HandAdvanceIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M14 62 H60 L64 72 H18 Z" fill="#F7F2E3" stroke="#D6C9A6" strokeWidth="2.5" />
      <g transform="rotate(-20 60 50)">
        <path
          d="M42 68 V44 C42 40 46 36 50 36 C52 36 54 38 54 41 V46 H60 C64 46 67 49 67 53 L65 68 C64 71 62 73 59 73 H47 C44 73 42 71 42 68 Z"
          fill="#F0C79A"
          stroke="#C99A6B"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>
      <path d="M72 40 H88" fill="none" stroke="#7BA098" strokeWidth="4" strokeLinecap="round" />
      <path d="M82 34 L88 40 L82 46" fill="none" stroke="#7BA098" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// חמשת הדגשים לגזירה, בסדר קריאה מימין לשמאל (הפריט הראשון במערך
// מוצג מימין, כי כל הדף פועל בכיווניות RTL). מבוסס על עקרונות כלליים
// ומוכרים בתחום הריפוי בעיסוק - נחלת הכלל, לא ייחודיים למקור מסוים.
export const SCISSOR_TIP_CARDS = [
  { icon: TwoHandsIcon, image: "/icon-bank/guidance/scissors/1-two-hands.webp", text: "יד גוזרת ויד עוזרת" },
  { icon: ThumbEyesIcon, image: "/icon-bank/guidance/scissors/2-thumbs-up.webp", text: "העיניים של אצבע האגודל תמיד למעלה, לראות" },
  { icon: ScissorsBiteIcon, image: "/icon-bank/guidance/scissors/3-small-snips.gif", text: "המספריים אוכלות ביסים קטנים", emphasize: true },
  { icon: ScissorsOpenMouthIcon, image: "/icon-bank/guidance/scissors/4-open-scissors.webp", text: "הפה של המספריים תמיד פתוח ולא נסגר" },
  { icon: HandAdvanceIcon, image: "/icon-bank/guidance/scissors/5-helper-hand.gif", text: "היד העוזרת תמיד מתקדמת יחד עם היד הגוזרת" },
];
