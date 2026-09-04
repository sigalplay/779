/* ---------- ספריית איורים משותפת לחומרים/כלים/שלבים ----------
 * מותאמת בעזרת מילות מפתח (Regex), בדיוק כמו activity-emoji.js,
 * רק שמחזירה רכיב SVG במקום תו אימוג'י. משמשת כשכבת ביניים:
 * קודם ניסיון להתאמה מדויקת לפעילות (ACTIVITY_ICON_SETS), אחר כך
 * ניסיון בספרייה הזו לפי מילות מפתח, ורק לבסוף נפילה לאימוג'י.
 */

function ScissorsIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <g transform="rotate(-30 50 50)">
        <rect x="20" y="42" width="45" height="14" rx="6" fill="#E3E3E3" stroke="#A8A8A8" strokeWidth="3" />
        <rect x="63" y="45" width="20" height="8" rx="3" fill="#8B5E34" />
      </g>
    </svg>
  );
}

function GlueIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="34" y="30" width="32" height="52" rx="6" fill="#EAF4F8" stroke="#8FB6C9" strokeWidth="3" />
      <rect x="40" y="16" width="20" height="16" rx="3" fill="#7BA098" />
      <rect x="38" y="44" width="24" height="20" rx="3" fill="#F3C94A" opacity="0.7" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <g transform="rotate(45 50 50)">
        <rect x="30" y="42" width="45" height="16" rx="2" fill="#F3C94A" stroke="#C99A28" strokeWidth="2.5" />
        <path d="M75 42 L88 50 L75 58 Z" fill="#3E2513" />
        <rect x="24" y="42" width="10" height="16" fill="#E3A6A0" stroke="#C77E7A" strokeWidth="2" />
      </g>
    </svg>
  );
}

function ColoredPencilsIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <g transform="rotate(-20 30 60)">
        <rect x="20" y="55" width="45" height="10" rx="2" fill="#E0637A" />
        <path d="M65 55 L74 60 L65 65 Z" fill="#3E2513" />
      </g>
      <g transform="rotate(-2 30 60)">
        <rect x="20" y="55" width="45" height="10" rx="2" fill="#5CA8D9" />
        <path d="M65 55 L74 60 L65 65 Z" fill="#3E2513" />
      </g>
      <g transform="rotate(16 30 60)">
        <rect x="20" y="55" width="45" height="10" rx="2" fill="#8FB86B" />
        <path d="M65 55 L74 60 L65 65 Z" fill="#3E2513" />
      </g>
    </svg>
  );
}

function MarkerIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <g transform="rotate(30 50 50)">
        <rect x="26" y="40" width="50" height="20" rx="4" fill="#5CA8D9" stroke="#3E80A6" strokeWidth="2.5" />
        <path d="M76 40 L88 50 L76 60 Z" fill="#3E2513" />
        <rect x="20" y="42" width="8" height="16" fill="#3E80A6" />
      </g>
    </svg>
  );
}

function BallIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="50" cy="50" r="34" fill="#E0637A" stroke="#B84B5E" strokeWidth="3" />
      <path d="M50 16 V84 M16 50 H84 M25 25 C40 35 60 35 75 25 M25 75 C40 65 60 65 75 75" fill="none" stroke="#B84B5E" strokeWidth="2" />
    </svg>
  );
}

function BowlLibIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M18 44 C18 44 20 78 50 78 C80 78 82 44 82 44 Z" fill="#EAF4F8" stroke="#9DB8C8" strokeWidth="3.5" />
      <ellipse cx="50" cy="44" rx="32" ry="9" fill="#FBFBFB" stroke="#9DB8C8" strokeWidth="3" />
    </svg>
  );
}

function SpoonLibIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <g transform="rotate(-15 50 50)">
        <ellipse cx="38" cy="34" rx="15" ry="19" fill="#8FB6C9" stroke="#5D8FA6" strokeWidth="3" />
        <rect x="34" y="48" width="8" height="42" rx="4" fill="#8FB6C9" stroke="#5D8FA6" strokeWidth="3" />
      </g>
    </svg>
  );
}

function GlassWaterIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M33 22 H67 L61 82 H39 Z" fill="#DFF1F7" stroke="#8FB6C9" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M38 40 H62 L58 76 H42 Z" fill="#AEE0EE" opacity="0.7" />
    </svg>
  );
}

function BottleLibIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="40" y="10" width="20" height="14" rx="3" fill="#C9CFD3" stroke="#9DA3A8" strokeWidth="2.5" />
      <path d="M36 24 H64 L70 40 V84 C70 88 66 90 62 90 H38 C34 90 30 88 30 84 V40 Z" fill="#EAF4F8" stroke="#9DB8C8" strokeWidth="3.5" strokeLinejoin="round" />
    </svg>
  );
}

function PaperIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M22 12 H68 L80 24 V88 H22 Z" fill="#FBFBFB" stroke="#C9BFA8" strokeWidth="3" strokeLinejoin="round" />
      <path d="M68 12 V24 H80 Z" fill="#EDE6D3" stroke="#C9BFA8" strokeWidth="2" strokeLinejoin="round" />
      <line x1="32" y1="42" x2="68" y2="42" stroke="#D8CFB8" strokeWidth="2.5" />
      <line x1="32" y1="56" x2="68" y2="56" stroke="#D8CFB8" strokeWidth="2.5" />
      <line x1="32" y1="70" x2="58" y2="70" stroke="#D8CFB8" strokeWidth="2.5" />
    </svg>
  );
}

function CardsIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <g transform="rotate(-12 44 50)">
        <rect x="24" y="22" width="34" height="48" rx="5" fill="#FBFBFB" stroke="#C9BFA8" strokeWidth="3" />
      </g>
      <g transform="rotate(10 60 50)">
        <rect x="42" y="26" width="34" height="48" rx="5" fill="#EAF4F8" stroke="#8FB6C9" strokeWidth="3" />
        <circle cx="59" cy="50" r="8" fill="#E0637A" />
      </g>
    </svg>
  );
}

function PhoneMusicIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="32" y="12" width="36" height="76" rx="8" fill="#4A5A62" stroke="#2E3B41" strokeWidth="3" />
      <rect x="37" y="20" width="26" height="52" rx="2" fill="#8FB6C9" />
      <path d="M46 52 V38 L58 35 V49" fill="none" stroke="#FBFBFB" strokeWidth="2.5" />
      <circle cx="44" cy="54" r="4" fill="#FBFBFB" />
      <circle cx="56" cy="51" r="4" fill="#FBFBFB" />
    </svg>
  );
}

function TimerIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="50" cy="54" r="34" fill="#F7DA7A" stroke="#D9A628" strokeWidth="4" />
      <circle cx="50" cy="54" r="24" fill="#FBFBFB" stroke="#D9A628" strokeWidth="2" />
      <line x1="50" y1="54" x2="50" y2="38" stroke="#3E2513" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="54" x2="62" y2="58" stroke="#3E2513" strokeWidth="3" strokeLinecap="round" />
      <rect x="42" y="10" width="16" height="10" rx="3" fill="#D9A628" />
    </svg>
  );
}

function PillowIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="14" y="30" width="72" height="46" rx="18" fill="#DFCBEA" stroke="#B79CD8" strokeWidth="3.5" />
      <path d="M30 30 Q50 42 70 30 M30 76 Q50 64 70 76" fill="none" stroke="#B79CD8" strokeWidth="2" />
    </svg>
  );
}

function SocksIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M30 14 H50 V54 C50 66 60 70 60 80 C60 88 30 88 26 80 C20 68 30 66 30 54 Z" fill="#8FB6C9" stroke="#5D8FA6" strokeWidth="3" strokeLinejoin="round" />
      <path d="M30 24 H50" stroke="#5D8FA6" strokeWidth="2.5" />
    </svg>
  );
}

function PlaydoughIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="42" cy="55" r="26" fill="#E0637A" stroke="#B84B5E" strokeWidth="3" />
      <circle cx="68" cy="42" r="16" fill="#F3C94A" stroke="#D9A628" strokeWidth="2.5" />
    </svg>
  );
}

function RopeIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path
        d="M10 30 C30 10 40 50 60 30 C80 10 90 50 90 50 C90 50 80 90 60 70 C40 50 30 90 10 70"
        fill="none"
        stroke="#E9A15E"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M16 34 L50 20 L84 34 L50 48 Z" fill="#E9C27E" stroke="#C99A4B" strokeWidth="3" strokeLinejoin="round" />
      <path d="M16 34 V72 L50 86 V48 Z" fill="#D3B571" stroke="#C99A4B" strokeWidth="3" strokeLinejoin="round" />
      <path d="M84 34 V72 L50 86 V48 Z" fill="#E9C27E" stroke="#C99A4B" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

function StickerIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="44" cy="44" r="26" fill="#F3C94A" stroke="#D9A628" strokeWidth="3" />
      <path d="M64 64 C70 66 78 74 76 82 C68 80 60 72 62 66 Z" fill="#F7DA7A" stroke="#D9A628" strokeWidth="2" />
    </svg>
  );
}

function BubblesIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="40" cy="45" r="22" fill="#DFF1F7" stroke="#8FB6C9" strokeWidth="3" opacity="0.85" />
      <circle cx="70" cy="30" r="10" fill="#EAF4F8" stroke="#8FB6C9" strokeWidth="2.5" opacity="0.85" />
      <circle cx="68" cy="62" r="7" fill="#EAF4F8" stroke="#8FB6C9" strokeWidth="2" opacity="0.85" />
    </svg>
  );
}

function FlashlightIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M30 40 H55 L70 30 V70 L55 60 H30 Z" fill="#E3E3E3" stroke="#A8A8A8" strokeWidth="3" strokeLinejoin="round" />
      <rect x="16" y="42" width="16" height="16" rx="3" fill="#7BA098" />
      <path d="M74 42 L88 36 M74 50 L90 50 M74 58 L88 64" stroke="#F3C94A" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function DiceIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="20" y="20" width="60" height="60" rx="10" fill="#FBFBFB" stroke="#C9BFA8" strokeWidth="3.5" />
      <circle cx="35" cy="35" r="5" fill="#3E2513" />
      <circle cx="65" cy="35" r="5" fill="#3E2513" />
      <circle cx="35" cy="65" r="5" fill="#3E2513" />
      <circle cx="65" cy="65" r="5" fill="#3E2513" />
      <circle cx="50" cy="50" r="5" fill="#3E2513" />
    </svg>
  );
}

function StairsIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M10 86 V66 H34 V46 H58 V26 H90 V86 Z" fill="#E9C27E" stroke="#C99A4B" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

function HandsIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path
        d="M20 88 V50 C20 44 24 40 28 40 C30 40 32 42 32 45 V55 H40 C44 55 47 58 47 62 L45 82 C44 86 42 88 38 88 Z"
        fill="#F0C79A"
        stroke="#C99A6B"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M80 88 V50 C80 44 76 40 72 40 C70 40 68 42 68 45 V55 H60 C56 55 53 58 53 62 L55 82 C56 86 58 88 62 88 Z"
        fill="#F0C79A"
        stroke="#C99A6B"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BlindfoldIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="50" cy="46" r="30" fill="#F0C79A" stroke="#C99A6B" strokeWidth="3" />
      <rect x="18" y="38" width="64" height="16" rx="8" fill="#4A5A62" stroke="#2E3B41" strokeWidth="2.5" />
      <path d="M18 44 C10 44 8 50 12 56" fill="none" stroke="#2E3B41" strokeWidth="3" strokeLinecap="round" />
      <path d="M82 44 C90 44 92 50 88 56" fill="none" stroke="#2E3B41" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function ScentBottleIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="38" y="14" width="24" height="14" rx="3" fill="#8FB86B" stroke="#6B9146" strokeWidth="2.5" />
      <path d="M32 28 H68 V80 C68 86 62 90 56 90 H44 C38 90 32 86 32 80 Z" fill="#EAF4F8" stroke="#8FB6C9" strokeWidth="3" strokeLinejoin="round" />
      <path d="M40 46 C46 50 54 50 60 46 M40 58 C46 62 54 62 60 58" fill="none" stroke="#8FB6C9" strokeWidth="2" />
    </svg>
  );
}

function HulaHoopIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="50" cy="50" r="36" fill="none" stroke="#E0637A" strokeWidth="9" />
    </svg>
  );
}

function ChairIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="26" y="16" width="42" height="10" rx="3" fill="#E9C27E" stroke="#C99A4B" strokeWidth="2.5" />
      <rect x="26" y="46" width="42" height="10" rx="3" fill="#E9C27E" stroke="#C99A4B" strokeWidth="2.5" />
      <rect x="26" y="26" width="10" height="60" fill="#C99A4B" opacity="0.5" />
      <rect x="20" y="56" width="8" height="30" fill="#C99A4B" />
      <rect x="66" y="56" width="8" height="30" fill="#C99A4B" />
    </svg>
  );
}

function RiceBowlIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M18 44 C18 44 20 78 50 78 C80 78 82 44 82 44 Z" fill="#EAF4F8" stroke="#9DB8C8" strokeWidth="3.5" />
      <ellipse cx="50" cy="44" rx="32" ry="9" fill="#F3E9D6" stroke="#9DB8C8" strokeWidth="3" />
      <circle cx="40" cy="42" r="2" fill="#D3B571" />
      <circle cx="50" cy="40" r="2" fill="#D3B571" />
      <circle cx="60" cy="43" r="2" fill="#D3B571" />
      <circle cx="45" cy="46" r="2" fill="#D3B571" />
    </svg>
  );
}

function PrizeIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M50 14 L59 34 L81 36 L64 50 L70 72 L50 60 L30 72 L36 50 L19 36 L41 34 Z" fill="#F3C94A" stroke="#D9A628" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

function TweezersLibIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <g transform="rotate(-10 50 50)">
        <path d="M40 15 L46 55 L36 78 M60 15 L54 55 L64 78" fill="none" stroke="#8FB6C9" strokeWidth="4" strokeLinecap="round" />
        <path d="M40 15 H60" stroke="#5D8FA6" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function BalloonIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <ellipse cx="50" cy="40" rx="26" ry="30" fill="#E0637A" stroke="#B84B5E" strokeWidth="3" />
      <path d="M50 70 L46 82 L54 84 L50 96" fill="none" stroke="#8F979D" strokeWidth="2" />
      <path d="M44 26 C42 22 46 18 50 20" fill="none" stroke="#FBFBFB" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function BlanketIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="12" y="24" width="76" height="52" rx="6" fill="#8FB6C9" stroke="#5D8FA6" strokeWidth="3" />
      <line x1="12" y1="40" x2="88" y2="40" stroke="#5D8FA6" strokeWidth="2" />
      <line x1="12" y1="60" x2="88" y2="60" stroke="#5D8FA6" strokeWidth="2" />
    </svg>
  );
}

/* ---- Steps / actions ---- */

function JumpStepIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="50" cy="24" r="10" fill="#F0C79A" stroke="#C99A6B" strokeWidth="2.5" />
      <path d="M50 34 V56 M50 40 L34 30 M50 40 L66 30 M50 56 L36 78 M50 56 L64 78" fill="none" stroke="#F0C79A" strokeWidth="6" strokeLinecap="round" />
      <path d="M20 82 H80" stroke="#C9BFA8" strokeWidth="3" strokeDasharray="4 6" strokeLinecap="round" />
    </svg>
  );
}

function RunStepIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="42" cy="22" r="9" fill="#F0C79A" stroke="#C99A6B" strokeWidth="2.5" />
      <path d="M42 31 L54 46 L70 40 M54 46 L46 60 L58 84 M54 46 L34 58 L24 80" fill="none" stroke="#F0C79A" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 30 H10 M20 40 H8" stroke="#C9BFA8" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function DrawStepIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="14" y="60" width="50" height="26" rx="3" fill="#FBFBFB" stroke="#C9BFA8" strokeWidth="2.5" />
      <path d="M22 78 C30 68 36 78 44 68 C50 62 54 70 58 66" fill="none" stroke="#E0637A" strokeWidth="3" strokeLinecap="round" />
      <g transform="rotate(45 70 40)">
        <rect x="60" y="34" width="30" height="11" rx="2" fill="#F3C94A" stroke="#C99A28" strokeWidth="2" />
        <path d="M90 34 L98 39.5 L90 45 Z" fill="#3E2513" />
      </g>
    </svg>
  );
}

function GlueStepIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="20" y="60" width="34" height="22" rx="3" fill="#FBFBFB" stroke="#C9BFA8" strokeWidth="2.5" />
      <g transform="rotate(-20 70 40)">
        <rect x="60" y="18" width="16" height="34" rx="4" fill="#EAF4F8" stroke="#8FB6C9" strokeWidth="2.5" />
        <rect x="64" y="8" width="8" height="12" rx="2" fill="#7BA098" />
      </g>
      <circle cx="38" cy="68" r="3" fill="#F3C94A" />
      <circle cx="44" cy="72" r="3" fill="#F3C94A" />
    </svg>
  );
}

function ThrowStepIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="30" cy="70" r="12" fill="#E0637A" stroke="#B84B5E" strokeWidth="2.5" />
      <path d="M34 60 C48 40 64 32 80 26" fill="none" stroke="#C9BFA8" strokeWidth="3" strokeDasharray="4 6" strokeLinecap="round" />
      <path d="M72 20 L80 26 L74 34" fill="none" stroke="#C9BFA8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TouchStepIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path
        d="M50 90 V50 C50 44 54 40 58 40 C60 40 62 42 62 45 V55 H68 C72 55 75 58 75 62 L73 82 C72 86 70 88 66 88 Z"
        fill="#F0C79A"
        stroke="#C99A6B"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M20 30 C24 20 34 20 38 30" fill="none" stroke="#8FB6C9" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function BreathStepIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="50" cy="55" r="18" fill="#DFF1F7" stroke="#8FB6C9" strokeWidth="3" />
      <path d="M50 30 C40 20 30 24 30 34 C30 24 20 20 10 30" fill="none" stroke="#8FB6C9" strokeWidth="2.5" opacity="0.7" />
      <path d="M50 30 C60 20 70 24 70 34 C70 24 80 20 90 30" fill="none" stroke="#8FB6C9" strokeWidth="2.5" opacity="0.7" />
    </svg>
  );
}

function SleepStepIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M65 20 C50 20 38 34 38 50 C38 66 50 80 65 80 C55 84 42 82 33 73 C20 60 20 38 33 25 C42 16 55 14 65 20 Z" fill="#B79CD8" stroke="#8F6BB8" strokeWidth="2.5" />
      <path d="M75 30 L78 24 L81 30 L87 32 L81 34 L78 40 L75 34 L69 32 Z" fill="#F3C94A" />
    </svg>
  );
}

function MusicDanceStepIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="34" cy="70" r="8" fill="#3E2513" />
      <circle cx="60" cy="76" r="8" fill="#3E2513" />
      <path d="M42 70 V26 L68 20 V68" fill="none" stroke="#3E2513" strokeWidth="4" strokeLinecap="round" />
      <path d="M42 32 L68 26" stroke="#3E2513" strokeWidth="4" />
    </svg>
  );
}

function CountStepIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <text x="50" y="66" fontSize="52" fontWeight="900" textAnchor="middle" fill="#7BA098">
        123
      </text>
    </svg>
  );
}

function LetterStepIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <text x="50" y="70" fontSize="60" fontWeight="900" textAnchor="middle" fill="#5CA8D9">
        א
      </text>
    </svg>
  );
}

function BuildStepIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="26" y="60" width="20" height="20" rx="2" fill="#E0637A" stroke="#B84B5E" strokeWidth="2" />
      <rect x="50" y="60" width="20" height="20" rx="2" fill="#5CA8D9" stroke="#3E80A6" strokeWidth="2" />
      <rect x="38" y="38" width="20" height="20" rx="2" fill="#F3C94A" stroke="#D9A628" strokeWidth="2" />
    </svg>
  );
}

function SearchStepIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="42" cy="42" r="24" fill="none" stroke="#7BA098" strokeWidth="6" />
      <line x1="60" y1="60" x2="82" y2="82" stroke="#7BA098" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

function SmileStepIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="50" cy="50" r="36" fill="#F7DA7A" stroke="#D9A628" strokeWidth="3.5" />
      <circle cx="38" cy="42" r="4" fill="#3E2513" />
      <circle cx="62" cy="42" r="4" fill="#3E2513" />
      <path d="M32 58 C40 70 60 70 68 58" fill="none" stroke="#3E2513" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function TalkStepIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M14 24 H74 V56 H40 L26 70 V56 H14 Z" fill="#EAF4F8" stroke="#8FB6C9" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="30" cy="40" r="3" fill="#5D8FA6" />
      <circle cx="44" cy="40" r="3" fill="#5D8FA6" />
      <circle cx="58" cy="40" r="3" fill="#5D8FA6" />
    </svg>
  );
}

function AnimalWalkStepIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <ellipse cx="50" cy="58" rx="30" ry="20" fill="#E9C27E" stroke="#C99A4B" strokeWidth="3" />
      <circle cx="76" cy="42" r="14" fill="#E9C27E" stroke="#C99A4B" strokeWidth="3" />
      <circle cx="70" cy="36" r="3" fill="#6B3A24" />
      <rect x="26" y="70" width="8" height="16" rx="3" fill="#C99A4B" />
      <rect x="60" y="70" width="8" height="16" rx="3" fill="#C99A4B" />
    </svg>
  );
}

/* ---- Keyword-matching resolvers (used as a fallback layer,
   between per-activity custom icons and emoji fallback) ---- */

const MATERIAL_ICON_RULES = [
  [/מספריים/, ScissorsIcon],
  [/דבק/, GlueIcon],
  [/עפרונות צבעוניים|צבעי\s?עפרון/, ColoredPencilsIcon],
  [/עפרון|עט\b/, PencilIcon],
  [/טוש/, MarkerIcon],
  [/כדור|כדורון/, BallIcon],
  [/קער(ה|ות)/, BowlLibIcon],
  [/כפי(ת|ות)|כף\b/, SpoonLibIcon],
  [/כוס|מים חמים|כוסי(ת|ות)/, GlassWaterIcon],
  [/בקבוק/, BottleLibIcon],
  [/דף|בריסטול|נייר/, PaperIcon],
  [/קלפ|כרטיסיי?(ה|ות)/, CardsIcon],
  [/מוזיק|טלפון|רמקול/, PhoneMusicIcon],
  [/טיימר|שעון/, TimerIcon],
  [/כרית/, PillowIcon],
  [/גרבי/, SocksIcon],
  [/פלסטלינה|בצק/, PlaydoughIcon],
  [/חבל|שרוך/, RopeIcon],
  [/קופס(ה|ת)/, BoxIcon],
  [/מדבק/, StickerIcon],
  [/בועות סבון/, BubblesIcon],
  [/פנס/, FlashlightIcon],
  [/קובייה/, DiceIcon],
  [/מדרג/, StairsIcon],
  [/יד(יים)?\b/, HandsIcon],
  [/מטפחת|כיסוי עיניים/, BlindfoldIcon],
  [/ריח|קינמון|לימון|וניל|קפה/, ScentBottleIcon],
  [/חישוק/, HulaHoopIcon],
  [/כיסא|כיסאות/, ChairIcon],
  [/אורז|עדשים/, RiceBowlIcon],
  [/פרס/, PrizeIcon],
  [/פינצטה/, TweezersLibIcon],
  [/בלון/, BalloonIcon],
  [/שמיכה/, BlanketIcon],
];

const STEP_ICON_RULES = [
  [/קפ(ו|י)צ/, JumpStepIcon],
  [/רוץ|ריצה|הליכ|זחיל/, RunStepIcon],
  [/צייר|ציור|רשום|צבע/, DrawStepIcon],
  [/גזור|גזירה/, ScissorsIcon],
  [/הדבק|דבק/, GlueStepIcon],
  [/זרוק|זריק|בעיט/, ThrowStepIcon],
  [/מגע|ממשש|נוגע|טקטיל|מרגיש/, TouchStepIcon],
  [/נשימ|שאיפ|נשיפ|נושפ/, BreathStepIcon],
  [/רגוע|הרגע|שוכב|שינה/, SleepStepIcon],
  [/רק(ו|י)ד|מוזיק/, MusicDanceStepIcon],
  [/ספור|מספר|ספיר|מוד(ד|יד)/, CountStepIcon],
  [/אות(יות)?\b/, LetterStepIcon],
  [/בנ(ה|יי|ייה)|קוביות|שכבה|שכבות/, BuildStepIcon],
  [/חפש|מחפש|מוצא|מוצאים/, SearchStepIcon],
  [/מחייך|שמח|רגש|מרגיש/, SmileStepIcon],
  [/מסביר|מזמין|מבקש|שואל|אומר|קורא|מספר|משוחח/, TalkStepIcon],
  [/חיה|חיקוי|חיות/, AnimalWalkStepIcon],
  [/מערבב/, SpoonLibIcon],
  [/ממלא|יוצק|שופכ|טובל/, GlassWaterIcon],
  [/מקפל|קיפול/, PaperIcon],
  [/מכסה עיניים|עוצם עיניים/, BlindfoldIcon],
  [/מגלגל|מרדד/, PlaydoughIcon],
  [/בוחר|נבחר/, HandsIcon],
  [/מציב|מניח|שם\b|מסדר/, BoxIcon],
];

export function libMaterialIcon(text) {
  const t = (text || "").toLowerCase();
  for (const [re, Icon] of MATERIAL_ICON_RULES) if (re.test(t)) return Icon;
  return null;
}

export function libStepIcon(text) {
  const t = (text || "").toLowerCase();
  for (const [re, Icon] of STEP_ICON_RULES) if (re.test(t)) return Icon;
  return null;
}
