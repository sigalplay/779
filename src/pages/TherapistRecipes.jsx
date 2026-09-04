import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChefHat, Clock, ArrowLeft, RotateCcw, ListPlus, Check, Printer, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { TherapistPostureScissorsTips } from "@/components/TherapistPostureScissorsTips";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { addToDraftPlan } from "@/lib/storage";
import { brandLogo, useTranslator } from "@/lib/language";
import { RECIPE_EN } from "@/lib/recipe-content-en";
import { useCmsCollection } from "@/lib/cms-content";

const RECIPE_TITLES_EN = {
  "chocolate-apple-slices": "Chocolate-Dipped Apple Slices",
  "biscuit-sandwich": "Biscuit Sandwiches",
  "chocolate-toastie": "Chocolate Toastie",
  shoko: "Hot Chocolate",
  "tortilla-pizza": "Tortilla Pizza",
  "chocolate-balls": "Chocolate Balls",
  smores: "S'mores",
  "chocolate-lollipops": "Chocolate Lollipops",
  "strawberry-banana-smoothie": "Strawberry-Banana Smoothie",
  "chocolate-tortilla-swirls": "Chocolate Tortilla Swirls",
  "baked-potato-chips": "Baked Potato Crisps",
  "olive-muffins": "Olive Muffins",
  "mug-cake": "Mug Cake",
  "fruit-popsicles": "Fruit Ice Lollies",
  "homemade-ice-cream": "Homemade Ice Cream",
};

function translatedRecipe(recipe, language) {
  if (language !== "en" || !RECIPE_EN[recipe.id]) return recipe;
  const en = RECIPE_EN[recipe.id];
  return {
    ...recipe,
    title: en.title,
    duration: en.duration,
    ingredients: recipe.ingredients.map((item, index) => ({ ...item, text: en.ingredients[index] || item.text })),
    tools: recipe.tools.map((item, index) => ({ ...item, text: en.tools[index] || item.text })),
    steps: recipe.steps.map((item, index) => ({ ...item, text: en.steps[index] || item.text })),
  };
}

const RECIPE_AMOUNT_OPTIONS = {
  session: { scale: 0.25, he: "כמות קטנה למפגש", en: "Small session batch" },
  half: { scale: 0.5, he: "חצי כמות", en: "Half batch" },
  full: { scale: 1, he: "כמות מלאה", en: "Full batch" },
};

const PRACTICAL_SESSION_SCALES = {
  "biscuit-sandwich": 0.5,
  "chocolate-toastie": 1,
  shoko: 1,
  "tortilla-pizza": 1,
  "olive-muffins": 0.5,
  "mug-cake": 1,
};

const FRACTION_VALUES = { "⅛": 0.125, "¼": 0.25, "⅜": 0.375, "½": 0.5, "⅝": 0.625, "¾": 0.75, "⅞": 0.875 };

function formatRecipeAmount(value) {
  const rounded = Math.round(value * 100) / 100;
  const whole = Math.floor(rounded);
  const fraction = rounded - whole;
  const fractionGlyph = Object.entries(FRACTION_VALUES).find(([, amount]) => Math.abs(amount - fraction) < 0.01)?.[0];
  if (fractionGlyph) return `${whole || ""}${fractionGlyph}`;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded).replace(".", ",");
}

function scaleIngredientText(text, scale, language) {
  if (!text || scale === 1) return text;
  const range = text.match(/^(\d+(?:[.,]\d+)?)\s*[–-]\s*(\d+(?:[.,]\d+)?)(.*)$/);
  if (range) return `${formatRecipeAmount(Number(range[1].replace(",", ".")) * scale)}–${formatRecipeAmount(Number(range[2].replace(",", ".")) * scale)}${range[3]}`;
  const numeric = text.match(/^(\d+(?:[.,]\d+)?|[⅛¼⅜½⅝¾⅞])(.*)$/);
  if (numeric) {
    const amount = FRACTION_VALUES[numeric[1]] ?? Number(numeric[1].replace(",", "."));
    return `${formatRecipeAmount(amount * scale)}${numeric[2]}`;
  }
  const wordFractions = language === "en"
    ? [[/^Half\s+/i, 0.5], [/^Quarter\s+/i, 0.25], [/^One\s+/i, 1]]
    : [[/^(?:חצי|חֲצִי)\s+/, 0.5], [/^(?:רבע|רֶבַע)\s+/, 0.25]];
  for (const [pattern, amount] of wordFractions) {
    if (pattern.test(text)) return `${formatRecipeAmount(amount * scale)} ${text.replace(pattern, "")}`;
  }
  const upToCup = language === "en" ? text.match(/^Up to (?:one|1)\s+(.*)$/i) : text.match(/^(עד|עַד)\s+((?:כוס|כּוֹס).*)$/);
  if (upToCup) return language === "en" ? `Up to ${formatRecipeAmount(scale)} ${upToCup[1]}` : `${upToCup[1]} ${formatRecipeAmount(scale)} ${upToCup[2]}`;
  const singularMeasure = language === "en"
    ? text.match(/^(cup|tablespoon|teaspoon)\s+(.*)$/i)
    : text.match(/^((?:כוס|כּוֹס|כף|כַּף|כפית|כַּפִּית))\s+(.*)$/);
  if (singularMeasure) return `${formatRecipeAmount(scale)} ${singularMeasure[1]} ${singularMeasure[2]}`;
  return text;
}

function recipeForAmount(recipe, amountKey, language) {
  const option = RECIPE_AMOUNT_OPTIONS[amountKey] || RECIPE_AMOUNT_OPTIONS.full;
  const scale = amountKey === "session" ? (PRACTICAL_SESSION_SCALES[recipe.id] ?? option.scale) : option.scale;
  return {
    ...recipe,
    amountLabel: language === "en" ? option.en : option.he,
    ingredients: recipe.ingredients.map((item) => ({
      ...item,
      text: scaleIngredientText(item.text, scale, language),
      textN: language === "he" ? scaleIngredientText(item.textN || item.text, scale, language) : item.textN,
    })),
  };
}

/* ---------- Custom flat-style SVG icons for "כריכון שוקולד" ---------- */

function BreadPlainIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path
        d="M15 55 V38 C15 20 30 10 50 10 C70 10 85 20 85 38 V55 Z"
        fill="#F4D9A0"
        stroke="#C99A4B"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <rect x="15" y="55" width="70" height="30" rx="6" fill="#F7E4B8" stroke="#C99A4B" strokeWidth="4" />
    </svg>
  );
}

function BreadChocolateIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path
        d="M15 55 V38 C15 20 30 10 50 10 C70 10 85 20 85 38 V55 Z"
        fill="#F4D9A0"
        stroke="#C99A4B"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <rect x="15" y="55" width="70" height="30" rx="6" fill="#F7E4B8" stroke="#C99A4B" strokeWidth="4" />
      <path
        d="M22 40 C30 32 34 46 42 36 C50 26 54 44 62 34 C70 24 74 40 80 34 V54 H22 Z"
        fill="#6B3A24"
        opacity="0.9"
      />
      {/* knife */}
      <g transform="rotate(28 78 22)">
        <rect x="70" y="8" width="8" height="34" rx="3" fill="#D8D8D8" stroke="#9A9A9A" strokeWidth="2" />
        <rect x="70" y="40" width="8" height="14" rx="2" fill="#8B5E34" />
      </g>
    </svg>
  );
}

function SandwichHeartIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path
        d="M15 55 V38 C15 20 30 10 50 10 C70 10 85 20 85 38 V55 Z"
        fill="#F4D9A0"
        stroke="#C99A4B"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <rect x="15" y="55" width="70" height="30" rx="6" fill="#F7E4B8" stroke="#C99A4B" strokeWidth="4" />
      <path
        d="M50 62 C44 52 28 54 28 66 C28 76 42 84 50 90 C58 84 72 76 72 66 C72 54 56 52 50 62 Z"
        fill="#6B3A24"
      />
    </svg>
  );
}

function ToasterIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="10" y="35" width="80" height="45" rx="14" fill="#8FB6C9" stroke="#5D8FA6" strokeWidth="4" />
      <path
        d="M35 35 C35 20 65 20 65 35 Z"
        fill="#F4D9A0"
        stroke="#C99A4B"
        strokeWidth="3"
      />
      <path d="M42 35 C42 25 58 25 58 35 Z" fill="#6B3A24" />
      <circle cx="78" cy="58" r="4" fill="#3E6072" />
      <rect x="14" y="80" width="10" height="6" rx="2" fill="#5D8FA6" />
      <rect x="76" y="80" width="10" height="6" rx="2" fill="#5D8FA6" />
    </svg>
  );
}

function BreadSliceToolIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path
        d="M18 58 V40 C18 22 32 12 50 12 C68 12 82 22 82 40 V58 Z"
        fill="#F4D9A0"
        stroke="#C99A4B"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <rect x="18" y="58" width="64" height="26" rx="6" fill="#F7E4B8" stroke="#C99A4B" strokeWidth="4" />
    </svg>
  );
}

function ChocolateJarIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="25" y="30" width="50" height="55" rx="8" fill="#7A4426" stroke="#552F19" strokeWidth="3" />
      <rect x="20" y="18" width="60" height="16" rx="6" fill="#C0392B" stroke="#8E2A20" strokeWidth="3" />
      <ellipse cx="50" cy="60" rx="16" ry="10" fill="#A85A32" opacity="0.7" />
    </svg>
  );
}

function KnifeToolIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <g transform="rotate(-30 50 50)">
        <rect x="20" y="42" width="45" height="14" rx="6" fill="#E3E3E3" stroke="#A8A8A8" strokeWidth="3" />
        <rect x="63" y="45" width="20" height="8" rx="3" fill="#8B5E34" />
      </g>
    </svg>
  );
}

function PlateToolIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="50" cy="50" r="36" fill="#FDFBF6" stroke="#D8CFC0" strokeWidth="4" />
      <circle cx="50" cy="50" r="22" fill="none" stroke="#D8CFC0" strokeWidth="3" />
    </svg>
  );
}

function CuttersToolIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path
        d="M50 30 C42 18 22 22 22 38 C22 52 38 62 50 72 C62 62 78 52 78 38 C78 22 58 18 50 30 Z"
        fill="none"
        stroke="#C0392B"
        strokeWidth="6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const CHOCO_ICONS = {
  breadIng: BreadSliceToolIcon,
  chocolateIng: ChocolateJarIcon,
  knifeTool: KnifeToolIcon,
  plateTool: PlateToolIcon,
  cuttersTool: CuttersToolIcon,
  toasterTool: ToasterIcon,
  step1: BreadChocolateIcon,
  step2: BreadPlainIcon,
  step3: SandwichHeartIcon,
  step4: ToasterIcon,
};

/* ---------- Custom flat-style SVG icons for "הכנת שוקו" ---------- */

function CocoaJarIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="24" y="26" width="52" height="58" rx="8" fill="#8B5A2B" stroke="#5F3A1A" strokeWidth="3" />
      <rect x="30" y="40" width="40" height="26" rx="4" fill="#E8D9BE" />
      <rect x="20" y="16" width="60" height="14" rx="5" fill="#5F3A1A" />
    </svg>
  );
}

function MilkCartonIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M30 20 H70 L70 32 L50 22 L30 32 Z" fill="#DCE7EE" stroke="#9DB8C8" strokeWidth="3" strokeLinejoin="round" />
      <rect x="30" y="30" width="40" height="55" rx="4" fill="#FBFBFB" stroke="#9DB8C8" strokeWidth="3" />
      <rect x="30" y="70" width="40" height="15" rx="0" fill="#7BA098" />
    </svg>
  );
}

function WaterGlassIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M33 22 H67 L61 82 H39 Z" fill="#DFF1F7" stroke="#8FB6C9" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M38 40 H62 L58 76 H42 Z" fill="#AEE0EE" opacity="0.7" />
      <path d="M62 14 C68 20 68 26 62 30" fill="none" stroke="#8FB6C9" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function SugarBowlIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M22 48 C22 66 34 80 50 80 C66 80 78 66 78 48 Z" fill="#E9A15E" stroke="#C77E3D" strokeWidth="3.5" />
      <ellipse cx="50" cy="48" rx="28" ry="12" fill="#FFFFFF" stroke="#D8D0C0" strokeWidth="3" />
      <circle cx="42" cy="46" r="3" fill="#EDEDED" />
      <circle cx="53" cy="44" r="3" fill="#EDEDED" />
      <circle cx="60" cy="48" r="3" fill="#EDEDED" />
    </svg>
  );
}

function CupToolIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M35 20 H65 L60 78 H40 Z" fill="#DFF1F7" stroke="#8FB6C9" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M40 34 H60 L57 68 H43 Z" fill="#AEE0EE" opacity="0.6" />
    </svg>
  );
}

function SpoonToolIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <g transform="rotate(20 50 50)">
        <ellipse cx="50" cy="28" rx="14" ry="18" fill="#E3E3E3" stroke="#A8A8A8" strokeWidth="3" />
        <rect x="46" y="42" width="8" height="42" rx="4" fill="#E3E3E3" stroke="#A8A8A8" strokeWidth="3" />
      </g>
    </svg>
  );
}

function ShokoStep1Icon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M35 40 H65 L60 82 H40 Z" fill="#DFF1F7" stroke="#8FB6C9" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M40 55 H60 L57 78 H43 Z" fill="#8B5A2B" opacity="0.85" />
      <circle cx="46" cy="50" r="4" fill="#FFFFFF" />
      <circle cx="54" cy="48" r="4" fill="#FFFFFF" />
      <g transform="rotate(15 66 24)">
        <ellipse cx="66" cy="18" rx="9" ry="11" fill="#E3E3E3" stroke="#A8A8A8" strokeWidth="2.5" />
        <rect x="63" y="28" width="6" height="26" rx="3" fill="#E3E3E3" stroke="#A8A8A8" strokeWidth="2.5" />
      </g>
    </svg>
  );
}

function ShokoStep2Icon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M40 42 H60 L57 82 H43 Z" fill="#DFF1F7" stroke="#8FB6C9" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M44 58 H56 L54 78 H46 Z" fill="#AEE0EE" />
      <path d="M62 14 C58 26 56 34 52 42" fill="none" stroke="#8FB6C9" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="63" cy="12" rx="5" ry="7" fill="#DFF1F7" stroke="#8FB6C9" strokeWidth="2.5" />
    </svg>
  );
}

function ShokoStep3Icon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M38 44 H62 L58 82 H42 Z" fill="#DFF1F7" stroke="#8FB6C9" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M43 60 H57 L55 78 H45 Z" fill="#F3E9D6" />
      <path d="M28 16 H50 L45 26 L58 20 L52 40 H30 Z" fill="#FBFBFB" stroke="#9DB8C8" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

function ShokoStep4Icon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M35 32 H65 L60 84 H40 Z" fill="#8B5A2B" stroke="#5F3A1A" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M30 20 C34 26 30 30 34 36" fill="none" stroke="#C7B7A3" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <path d="M50 14 C54 20 50 24 54 30" fill="none" stroke="#C7B7A3" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <path d="M68 20 C72 26 68 30 72 36" fill="none" stroke="#C7B7A3" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <g transform="rotate(20 74 42)">
        <ellipse cx="74" cy="36" rx="8" ry="10" fill="#E3E3E3" stroke="#A8A8A8" strokeWidth="2.5" />
        <rect x="71" y="45" width="6" height="24" rx="3" fill="#E3E3E3" stroke="#A8A8A8" strokeWidth="2.5" />
      </g>
    </svg>
  );
}

const SHOKO_ICONS = {
  cocoaIng: CocoaJarIcon,
  milkIng: MilkCartonIcon,
  waterIng: WaterGlassIcon,
  sugarIng: SugarBowlIcon,
  cupTool: CupToolIcon,
  spoonTool: SpoonToolIcon,
  step1: ShokoStep1Icon,
  step2: ShokoStep2Icon,
  step3: ShokoStep3Icon,
  step4: ShokoStep4Icon,
};

/* ---------- Custom flat-style SVG icons for "כדורי שוקולד" ---------- */

function BiscuitsTrayIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="14" y="35" width="72" height="40" rx="6" fill="#DCE7EE" stroke="#9DB8C8" strokeWidth="3" />
      <circle cx="32" cy="48" r="9" fill="#E9C27E" stroke="#C99A4B" strokeWidth="2.5" />
      <circle cx="50" cy="58" r="9" fill="#E9C27E" stroke="#C99A4B" strokeWidth="2.5" />
      <circle cx="68" cy="48" r="9" fill="#E9C27E" stroke="#C99A4B" strokeWidth="2.5" />
    </svg>
  );
}

function ChocolateBarIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <g transform="rotate(-12 50 50)">
        <rect x="20" y="35" width="34" height="26" rx="3" fill="#6B3A24" stroke="#4A2716" strokeWidth="2.5" />
        <line x1="20" y1="48" x2="54" y2="48" stroke="#4A2716" strokeWidth="2" />
        <line x1="37" y1="35" x2="37" y2="61" stroke="#4A2716" strokeWidth="2" />
      </g>
      <g transform="rotate(18 68 62)">
        <rect x="52" y="50" width="30" height="24" rx="3" fill="#8B5A2B" stroke="#4A2716" strokeWidth="2.5" />
        <line x1="52" y1="62" x2="82" y2="62" stroke="#4A2716" strokeWidth="2" />
        <line x1="67" y1="50" x2="67" y2="74" stroke="#4A2716" strokeWidth="2" />
      </g>
    </svg>
  );
}

function CreamCartonIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M30 20 H70 L70 32 L50 22 L30 32 Z" fill="#F6EBE0" stroke="#D8C3AC" strokeWidth="3" strokeLinejoin="round" />
      <rect x="30" y="30" width="40" height="55" rx="4" fill="#FBFBFB" stroke="#D8C3AC" strokeWidth="3" />
      <rect x="30" y="68" width="40" height="17" rx="0" fill="#E6A9B8" />
    </svg>
  );
}

function SprinklesJarIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M28 38 H72 V78 C72 84 66 88 60 88 H40 C34 88 28 84 28 78 Z" fill="#FBFBFB" stroke="#C9BFA8" strokeWidth="3" />
      <rect x="24" y="24" width="52" height="16" rx="6" fill="#E9A15E" stroke="#C77E3D" strokeWidth="3" />
      <circle cx="38" cy="52" r="3" fill="#E0637A" />
      <circle cx="50" cy="60" r="3" fill="#5CA8D9" />
      <circle cx="62" cy="50" r="3" fill="#7BA098" />
      <circle cx="44" cy="70" r="3" fill="#E9C24B" />
      <circle cx="58" cy="72" r="3" fill="#E0637A" />
      <circle cx="34" cy="64" r="3" fill="#7BA098" />
    </svg>
  );
}

function BowlToolIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M18 44 C18 44 20 78 50 78 C80 78 82 44 82 44 Z" fill="#EAF4F8" stroke="#9DB8C8" strokeWidth="3.5" />
      <ellipse cx="50" cy="44" rx="32" ry="9" fill="#FBFBFB" stroke="#9DB8C8" strokeWidth="3" />
    </svg>
  );
}

function RollingPinToolIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <g transform="rotate(-18 50 50)">
        <rect x="30" y="42" width="40" height="16" rx="4" fill="#E9A15E" stroke="#C77E3D" strokeWidth="3" />
        <rect x="16" y="46" width="14" height="8" rx="3" fill="#C77E3D" />
        <rect x="70" y="46" width="14" height="8" rx="3" fill="#C77E3D" />
      </g>
    </svg>
  );
}

function SpoonFlatToolIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <g transform="rotate(-15 50 50)">
        <ellipse cx="38" cy="34" rx="15" ry="19" fill="#8FB6C9" stroke="#5D8FA6" strokeWidth="3" />
        <rect x="34" y="48" width="8" height="42" rx="4" fill="#8FB6C9" stroke="#5D8FA6" strokeWidth="3" />
      </g>
    </svg>
  );
}

function FoodBagToolIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M32 22 H68 V78 C68 84 62 88 56 88 H44 C38 88 32 84 32 78 Z" fill="#F0F5F2" stroke="#B9C7BE" strokeWidth="3" />
      <rect x="30" y="20" width="40" height="10" rx="3" fill="#B9C7BE" />
      <line x1="38" y1="45" x2="62" y2="45" stroke="#C9D6CF" strokeWidth="2" />
      <line x1="38" y1="58" x2="62" y2="58" stroke="#C9D6CF" strokeWidth="2" />
    </svg>
  );
}

function MicrowaveToolIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="10" y="26" width="80" height="50" rx="8" fill="#D9E2E6" stroke="#94A3AB" strokeWidth="3.5" />
      <rect x="17" y="33" width="48" height="36" rx="4" fill="#4A5A62" stroke="#33404A" strokeWidth="2.5" />
      <rect x="70" y="33" width="14" height="10" rx="2" fill="#8FB6C9" />
      <circle cx="77" cy="55" r="6" fill="#F6EBE0" stroke="#C99A4B" strokeWidth="2" />
    </svg>
  );
}

function ChocoBallsStep1Icon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <g transform="rotate(10 40 30)">
        <rect x="24" y="14" width="34" height="42" rx="6" fill="#F0F5F2" stroke="#B9C7BE" strokeWidth="2.5" />
      </g>
      <circle cx="42" cy="38" r="7" fill="#E9C27E" stroke="#C99A4B" strokeWidth="2" />
      <circle cx="54" cy="46" r="7" fill="#E9C27E" stroke="#C99A4B" strokeWidth="2" />
      <g transform="rotate(-15 74 30)">
        <rect x="62" y="24" width="30" height="12" rx="4" fill="#E9A15E" stroke="#C77E3D" strokeWidth="2.5" />
      </g>
    </svg>
  );
}

function ChocoBallsStep2Icon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="10" y="20" width="80" height="52" rx="8" fill="#D9E2E6" stroke="#94A3AB" strokeWidth="3.5" />
      <rect x="17" y="27" width="50" height="38" rx="4" fill="#4A5A62" stroke="#33404A" strokeWidth="2.5" />
      <ellipse cx="42" cy="46" rx="16" ry="10" fill="#FBFBFB" />
      <ellipse cx="42" cy="44" rx="10" ry="6" fill="#6B3A24" />
      <circle cx="76" cy="46" r="5" fill="#F6EBE0" stroke="#C99A4B" strokeWidth="2" />
    </svg>
  );
}

function ChocoBallsStep3Icon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M18 46 C18 46 20 78 50 78 C80 78 82 46 82 46 Z" fill="#EAF4F8" stroke="#9DB8C8" strokeWidth="3.5" />
      <ellipse cx="50" cy="46" rx="32" ry="9" fill="#FBFBFB" stroke="#9DB8C8" strokeWidth="3" />
      <path d="M40 12 L46 26 L60 20 L66 30" fill="none" stroke="#C9BFA8" strokeWidth="2.5" />
      <circle cx="44" cy="20" r="3" fill="#E9C27E" />
      <circle cx="52" cy="14" r="3" fill="#E9C27E" />
      <circle cx="60" cy="22" r="3" fill="#E9C27E" />
    </svg>
  );
}

function ChocoBallsStep4Icon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M18 46 C18 46 20 78 50 78 C80 78 82 46 82 46 Z" fill="#6B3A24" stroke="#4A2716" strokeWidth="3.5" opacity="0.9" />
      <ellipse cx="50" cy="46" rx="32" ry="9" fill="#8B5A2B" stroke="#4A2716" strokeWidth="3" />
      <path
        d="M38 30 C34 20 30 16 24 16"
        fill="none"
        stroke="#E7C9A6"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <ellipse cx="20" cy="14" rx="6" ry="4" fill="#F0D9BC" />
    </svg>
  );
}

function ChocoBallsStep5Icon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="30" cy="70" r="14" fill="#6B3A24" />
      <circle cx="56" cy="76" r="12" fill="#6B3A24" />
      <circle cx="76" cy="62" r="11" fill="#6B3A24" />
      <circle cx="46" cy="56" r="4" fill="#5CA8D9" />
      <circle cx="60" cy="50" r="4" fill="#E0637A" />
      <circle cx="72" cy="38" r="4" fill="#E9C24B" />
      <circle cx="34" cy="46" r="4" fill="#7BA098" />
      <path d="M20 20 C24 30 30 32 38 30" fill="none" stroke="#E7C9A6" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

const CHOCOBALLS_ICONS = {
  biscuitsIng: BiscuitsTrayIcon,
  chocolateIng: ChocolateBarIcon,
  creamIng: CreamCartonIcon,
  sprinklesIng: SprinklesJarIcon,
  bowlTool: BowlToolIcon,
  rollingPinTool: RollingPinToolIcon,
  spoonTool: SpoonFlatToolIcon,
  foodBagTool: FoodBagToolIcon,
  microwaveTool: MicrowaveToolIcon,
  step1: ChocoBallsStep1Icon,
  step2: ChocoBallsStep2Icon,
  step3: ChocoBallsStep3Icon,
  step4: ChocoBallsStep4Icon,
  step5: ChocoBallsStep5Icon,
};

/* ---------- Custom flat-style SVG icons for "הכנת פיצה" ---------- */

function TortillaIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="50" cy="50" r="36" fill="#F0DDAE" stroke="#D3B571" strokeWidth="3.5" />
      <circle cx="38" cy="42" r="2.5" fill="#D3B571" />
      <circle cx="58" cy="36" r="2.5" fill="#D3B571" />
      <circle cx="64" cy="58" r="2.5" fill="#D3B571" />
      <circle cx="42" cy="62" r="2.5" fill="#D3B571" />
    </svg>
  );
}

function KetchupBottleIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M40 20 H60 V32 L66 40 V82 C66 86 62 88 58 88 H42 C38 88 34 86 34 82 V40 L40 32 Z" fill="#D3392E" stroke="#9E241B" strokeWidth="3" />
      <rect x="42" y="16" width="16" height="8" rx="2" fill="#9E241B" />
      <rect x="36" y="54" width="28" height="18" rx="3" fill="#FBFBFB" opacity="0.9" />
    </svg>
  );
}

function YellowCheeseIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M20 65 Q30 45 40 60 Q48 42 55 58 Q64 40 72 58 Q80 48 82 65 Z" fill="#F3C94A" stroke="#D9A628" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M28 68 Q38 50 46 64 Q54 48 62 62 Q72 50 78 68 Z" fill="#F7DA7A" stroke="#D9A628" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function PizzaToppingsIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="50" cy="50" r="34" fill="#F0DDAE" stroke="#D3B571" strokeWidth="3" />
      <circle cx="50" cy="50" r="27" fill="#E9A15E" opacity="0.5" />
      <circle cx="38" cy="42" r="6" fill="#C0392B" />
      <circle cx="60" cy="38" r="6" fill="#C0392B" />
      <circle cx="52" cy="60" r="6" fill="#C0392B" />
      <circle cx="66" cy="58" r="4" fill="#3B5B3E" />
      <circle cx="34" cy="60" r="4" fill="#3B5B3E" />
    </svg>
  );
}

function ParchmentPaperIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M22 20 H70 L82 32 V78 C82 82 79 85 75 85 H22 C18 85 15 82 15 78 V27 C15 23 18 20 22 20 Z" fill="#F7F2E3" stroke="#D6C9A6" strokeWidth="3" />
      <path d="M70 20 V32 H82 Z" fill="#EAE0C4" stroke="#D6C9A6" strokeWidth="2" strokeLinejoin="round" />
      <line x1="26" y1="45" x2="66" y2="45" stroke="#E5D9B8" strokeWidth="2" />
      <line x1="26" y1="58" x2="66" y2="58" stroke="#E5D9B8" strokeWidth="2" />
    </svg>
  );
}

function OvenToolIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="10" y="16" width="80" height="70" rx="8" fill="#8B5A2B" stroke="#5F3A1A" strokeWidth="3.5" />
      <circle cx="50" cy="54" r="24" fill="#3E2513" stroke="#241608" strokeWidth="3" />
      <circle cx="50" cy="54" r="16" fill="#E9A15E" />
      <circle cx="22" cy="26" r="3" fill="#F0DDAE" />
      <circle cx="34" cy="26" r="3" fill="#F0DDAE" />
      <circle cx="46" cy="26" r="3" fill="#F0DDAE" />
    </svg>
  );
}

function PizzaStep1Icon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="50" cy="52" r="34" fill="#F0DDAE" stroke="#D3B571" strokeWidth="3" />
      <path d="M32 44 C40 38 48 48 56 40 C62 34 68 42 72 40" fill="none" stroke="#C0392B" strokeWidth="6" strokeLinecap="round" />
      <g transform="rotate(30 78 24)">
        <path d="M70 8 H78 V26 L74 34 L70 26 Z" fill="#D3392E" stroke="#9E241B" strokeWidth="2" />
      </g>
    </svg>
  );
}

function PizzaStep2Icon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="50" cy="52" r="34" fill="#F0DDAE" stroke="#D3B571" strokeWidth="3" />
      <circle cx="50" cy="52" r="27" fill="#E9A15E" opacity="0.35" />
      <path
        d="M30 30 C34 34 30 38 34 42 M46 20 C50 24 46 28 50 32 M64 28 C68 32 64 36 68 40"
        fill="none"
        stroke="#F3C94A"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path d="M30 46 Q40 34 48 44 Q56 32 64 42 Q72 34 78 46 Z" fill="#F3C94A" stroke="#D9A628" strokeWidth="2" />
    </svg>
  );
}

function PizzaStep3Icon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="46" cy="52" r="34" fill="#F0DDAE" stroke="#D3B571" strokeWidth="3" />
      <circle cx="46" cy="52" r="27" fill="#E9A15E" opacity="0.4" />
      <circle cx="36" cy="44" r="5" fill="#C0392B" />
      <circle cx="56" cy="40" r="5" fill="#C0392B" />
      <circle cx="48" cy="60" r="5" fill="#C0392B" />
      <circle cx="60" cy="58" r="3.5" fill="#3B5B3E" />
      <g transform="rotate(-20 82 34)">
        <rect x="78" y="14" width="5" height="34" rx="2" fill="#B9C0C4" />
        <path d="M75 12 L78 14 L81 12 M79 10 L79 16 M83 12 L86 14 L89 12" stroke="#B9C0C4" strokeWidth="2" fill="none" />
      </g>
    </svg>
  );
}

function PizzaStep4Icon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="10" y="30" width="80" height="56" rx="8" fill="#8B5A2B" stroke="#5F3A1A" strokeWidth="3.5" />
      <circle cx="50" cy="58" r="20" fill="#3E2513" stroke="#241608" strokeWidth="2.5" />
      <circle cx="50" cy="58" r="14" fill="#F0DDAE" stroke="#D3B571" strokeWidth="2" />
      <circle cx="46" cy="54" r="2.5" fill="#C0392B" />
      <circle cx="55" cy="60" r="2.5" fill="#C0392B" />
      <circle cx="22" cy="40" r="2.5" fill="#F0DDAE" />
      <circle cx="32" cy="40" r="2.5" fill="#F0DDAE" />
    </svg>
  );
}

const PIZZA_ICONS = {
  tortillaIng: TortillaIcon,
  ketchupIng: KetchupBottleIcon,
  cheeseIng: YellowCheeseIcon,
  toppingsIng: PizzaToppingsIcon,
  paperTool: ParchmentPaperIcon,
  knifeTool: KnifeToolIcon,
  ovenTool: OvenToolIcon,
  step1: PizzaStep1Icon,
  step2: PizzaStep2Icon,
  step3: PizzaStep3Icon,
  step4: PizzaStep4Icon,
};

/* ---------- Custom flat-style SVG icons for "סנדוויץ' ביסקוויט" ---------- */

function BiscuitStackIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <ellipse cx="50" cy="70" rx="30" ry="11" fill="#E9C27E" stroke="#C99A4B" strokeWidth="3" />
      <ellipse cx="50" cy="56" rx="30" ry="11" fill="#EFCC8E" stroke="#C99A4B" strokeWidth="3" />
      <ellipse cx="50" cy="42" rx="30" ry="11" fill="#E9C27E" stroke="#C99A4B" strokeWidth="3" />
      <circle cx="40" cy="40" r="2.5" fill="#6B3A24" />
      <circle cx="55" cy="44" r="2.5" fill="#6B3A24" />
      <circle cx="63" cy="38" r="2.5" fill="#6B3A24" />
      <circle cx="45" cy="54" r="2.5" fill="#6B3A24" />
      <circle cx="60" cy="58" r="2.5" fill="#6B3A24" />
    </svg>
  );
}

function ChocoSpreadBowlIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <path d="M22 46 C22 46 24 78 50 78 C76 78 78 46 78 46 Z" fill="#E9A15E" stroke="#C77E3D" strokeWidth="3.5" />
      <ellipse cx="50" cy="46" rx="28" ry="9" fill="#8B5A2B" stroke="#5F3A1A" strokeWidth="3" />
      <g transform="rotate(20 74 32)">
        <ellipse cx="74" cy="26" rx="8" ry="10" fill="#E3E3E3" stroke="#A8A8A8" strokeWidth="2.5" />
        <rect x="71" y="35" width="6" height="24" rx="3" fill="#E3E3E3" stroke="#A8A8A8" strokeWidth="2.5" />
      </g>
    </svg>
  );
}

function BiscuitStep1Icon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="50" cy="50" r="34" fill="#FBFBFB" stroke="#D8CFC0" strokeWidth="3" />
      <circle cx="50" cy="50" r="24" fill="#E9C27E" stroke="#C99A4B" strokeWidth="3" />
      <circle cx="42" cy="44" r="2.5" fill="#6B3A24" />
      <circle cx="58" cy="46" r="2.5" fill="#6B3A24" />
      <circle cx="50" cy="58" r="2.5" fill="#6B3A24" />
    </svg>
  );
}

function BiscuitStep2Icon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="46" cy="52" r="30" fill="#E9C27E" stroke="#C99A4B" strokeWidth="3" />
      <path d="M26 46 C34 40 40 52 48 44 C54 38 58 48 66 42" fill="none" stroke="#6B3A24" strokeWidth="7" strokeLinecap="round" />
      <g transform="rotate(30 78 24)">
        <rect x="70" y="8" width="8" height="30" rx="3" fill="#D8D8D8" stroke="#9A9A9A" strokeWidth="2" />
        <rect x="70" y="36" width="8" height="12" rx="2" fill="#8B5E34" />
      </g>
    </svg>
  );
}

function BiscuitStep3Icon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <ellipse cx="50" cy="60" rx="32" ry="12" fill="#E9C27E" stroke="#C99A4B" strokeWidth="3" />
      <rect x="20" y="48" width="60" height="14" fill="#6B3A24" />
      <ellipse cx="50" cy="42" rx="32" ry="12" fill="#EFCC8E" stroke="#C99A4B" strokeWidth="3" />
      <circle cx="40" cy="40" r="2.5" fill="#6B3A24" />
      <circle cx="58" cy="42" r="2.5" fill="#6B3A24" />
    </svg>
  );
}

function BiscuitStep4Icon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <ellipse cx="46" cy="58" rx="30" ry="11" fill="#E9C27E" stroke="#C99A4B" strokeWidth="3" />
      <rect x="18" y="47" width="56" height="13" fill="#6B3A24" />
      <path d="M18 40 C18 40 24 34 32 40 C22 42 22 48 18 47 Z" fill="#EFCC8E" stroke="#C99A4B" strokeWidth="2.5" />
      <ellipse cx="46" cy="40" rx="30" ry="11" fill="#EFCC8E" stroke="#C99A4B" strokeWidth="3" />
      <path d="M78 16 L82 24 L90 26 L84 32 L86 40 L78 36 L70 40 L72 32 L66 26 L74 24 Z" fill="#F3C94A" />
    </svg>
  );
}

const SANDWICH_ICONS = {
  biscuitsIng: BiscuitStackIcon,
  chocolateIng: ChocoSpreadBowlIcon,
  knifeTool: KnifeToolIcon,
  plateTool: PlateToolIcon,
  step1: BiscuitStep1Icon,
  step2: BiscuitStep2Icon,
  step3: BiscuitStep3Icon,
  step4: BiscuitStep4Icon,
};

export const RECIPES = [
  {
    id: "chocolate-apple-slices",
    title: "פלחי תפוחים מצופים בשוקולד",
    titleN: "פִּלְחֵי תַּפּוּחִים מְצֻפִּים בְּשׁוֹקוֹלָד",
    cover: "/icon-bank/manual/chocolate-apple-slices/cover.webp",
    duration: "כ־25 דקות",
    ingredients: [
      { text: "3–4 תפוחים גדולים", textN: "3–4 תַּפּוּחִים גְּדוֹלִים", img: "/icon-bank/manual/chocolate-apple-slices/ingredient-apples-v2.png" },
      { text: "12–16 שיפודי עץ", textN: "12–16 שִׁפּוּדֵי עֵץ", img: "/icon-bank/crafts-new/seed-63-independent/material-skewers.webp" },
      { text: "200 גרם שוקולד", textN: "200 גְּרַם שׁוֹקוֹלָד", img: "/icon-bank/manual/chocolate-apple-slices/ingredient-chocolate-v2.png" },
      { text: "חצי כוס תוספות לבחירה", textN: "חֲצִי כּוֹס תּוֹסָפוֹת לִבְחִירָה", img: "/icon-bank/manual/recipe-choco-sprinkles-flat.webp" },
    ],
    tools: [
      { text: "סכין – לשימוש מבוגר", textN: "סַכִּין – לְשִׁמּוּשׁ מְבֻגָּר", img: "/icon-bank/manual/pizza-new/pizza-knife.webp" },
      { text: "נייר סופג", textN: "נְיָר סוֹפֵג", img: "/icon-bank/crafts-new/seed-101-illustrated/material-paper-towel.webp" },
      { text: "מגש", textN: "מַגָּשׁ", img: "/icon-bank/manual/chocolate-apple-slices/tool-tray-v2.png" },
      { text: "קערה המתאימה למיקרוגל", textN: "קְעָרָה הַמַּתְאִימָה לַמִּיקְרוֹגַל", img: "/icon-bank/manual/chocolate-balls-new/chocolate-balls-bowl.webp" },
      { text: "מיקרוגל – בהשגחת מבוגר", textN: "מִיקְרוֹגַל – בְּהַשְׁגָּחַת מְבֻגָּר", img: "/icon-bank/manual/chocolate-balls-new/chocolate-balls-microwave.webp" },
      { text: "מקפיא", textN: "מַקְפִּיא", img: "/icon-bank/manual/chocolate-lollipops-fridge-tool.webp" },
    ],
    steps: [
      { n: 1, text: "חותכים כל תפוח ל־4 או ל־6 פלחים עבים.", textN: "חוֹתְכִים כָּל תַּפּוּחַ לְ־4 אוֹ לְ־6 פְּלָחִים עָבִים.", img: "/icon-bank/manual/chocolate-apple-slices/step-1.webp" },
      { n: 2, text: "מייבשים לחלוטין את פלחי התפוחים בעזרת נייר סופג, כדי שהציפוי יידבק היטב.", textN: "מְיַבְּשִׁים לַחֲלוּטִין אֶת פִּלְחֵי הַתַּפּוּחִים בְּעֶזְרַת נְיָר סוֹפֵג, כְּדֵי שֶׁהַצִּפּוּי יִדָּבֵק הֵיטֵב.", img: "/icon-bank/manual/chocolate-apple-slices/step-2.webp" },
      { n: 3, text: "נועצים בעדינות שיפוד עץ בתחתית של כל פלח תפוח.", textN: "נוֹעֲצִים בַּעֲדִינוּת שִׁפּוּד עֵץ בַּתַּחְתִּית שֶׁל כָּל פֶּלַח תַּפּוּחַ.", img: "/icon-bank/manual/chocolate-apple-slices/step-3.webp" },
      { n: 4, text: "מניחים את הפלחים על מגש ומכניסים למקפיא למשך 10–15 דקות.", textN: "מַנִּיחִים אֶת הַפְּלָחִים עַל מַגָּשׁ וּמַכְנִיסִים לַמַּקְפִּיא לְמֶשֶׁךְ 10–15 דַּקּוֹת.", img: "/icon-bank/manual/chocolate-apple-slices/step-4.webp" },
      { n: 5, text: "ממיסים את השוקולד במיקרוגל בפולסים של 30 שניות, תוך ערבוב בין הפעלה להפעלה.", textN: "מְמִסִּים אֶת הַשּׁוֹקוֹלָד בַּמִּיקְרוֹגַל בְּפוּלְסִים שֶׁל 30 שְׁנִיּוֹת, תּוֹךְ עִרְבּוּב בֵּין הַפְעָלָה לְהַפְעָלָה.", img: "/icon-bank/manual/chocolate-apple-slices/step-5.webp" },
      { n: 6, text: "טובלים את החצי העליון של כל פלח בשוקולד ומוסיפים תוספות לבחירה לפני שהציפוי מתקשה.", textN: "טוֹבְלִים אֶת הַחֵצִי הָעֶלְיוֹן שֶׁל כָּל פֶּלַח בַּשּׁוֹקוֹלָד וּמוֹסִיפִים תּוֹסָפוֹת לִבְחִירָה לִפְנֵי שֶׁהַצִּפּוּי מִתְקַשֶּׁה.", img: "/icon-bank/manual/chocolate-apple-slices/step-6.webp" },
    ],
  },
  {
    id: "biscuit-sandwich",
    title: "סנדוויץ' ביסקוויט",
    titleN: "סֶנְדְּוִיץ' בִּיסְקְוִיט",
    cover: "/icon-bank/manual/sandwich-closed-petit-beurre.webp",
    duration: "5 דקות",
    ingredients: [
      { text: "4 ביסקוויטים", textN: "4 בִּיסְקְוִיטִים", img: "/icon-bank/manual/sandwich-single-petit-beurre.webp" },
      { text: "2 כפות ממרח שוקולד", textN: "2 כַּפּוֹת מִמְרָח שׁוֹקוֹלָד", img: "/icon-bank/manual/sandwich-chocolate-spread.webp" },
    ],
    tools: [
      { text: "סכין", textN: "סַכִּין", img: "/icon-bank/manual/sandwich-knife.webp" },
      { text: "צלחת", textN: "צַלַּחַת", img: "/icon-bank/manual/sandwich-plate.webp" },
    ],
    steps: [
      { n: 1, text: "מניחים ביסקוויט אחד על הצלחת.", textN: "מַנִּיחִים בִּיסְקְוִיט אֶחָד עַל הַצַּלַּחַת.", img: "/icon-bank/manual/biscuit-sandwich-new/biscuit-sandwich-step-1.webp" },
      {
        n: 2,
        text: "מורחים ממרח שוקולד על הביסקוויט.",
        textN: "מוֹרְחִים מִמְרָח שׁוֹקוֹלָד עַל הַבִּיסְקְוִיט.",
        img: "/icon-bank/manual/biscuit-sandwich-new/biscuit-sandwich-step-2.webp",
      },
      { n: 3, text: "סוגרים עם ביסקוויט נוסף מלמעלה.", textN: "סוֹגְרִים עִם בִּיסְקְוִיט נוֹסָף מִלְמַעְלָה.", img: "/icon-bank/manual/biscuit-sandwich-new/biscuit-sandwich-step-3.webp" },
    ],
  },
  {
    id: "chocolate-toastie",
    title: "כריכון בצורות",
    titleN: "כְּרִיכוֹן בְּצוּרוֹת",
    cover: "/icon-bank/manual/chocolate-toastie-new/chocolate-toastie-shapes-cover.webp",
    duration: "10 דקות",
    ingredients: [
      { text: "2 פרוסות לחם", textN: "2 פְּרוּסוֹת לֶחֶם", img: "/icon-bank/manual/chocolate-toastie-new/chocolate-toastie-bread.webp" },
      { text: "כף ממרח שוקולד (או כל ממרח אחר)", textN: "כַּף מִמְרַח שׁוֹקוֹלָד (אוֹ כָּל מִמְרָח אַחֵר)", img: "/icon-bank/manual/sandwich-chocolate-spread.webp" },
    ],
    tools: [
      { text: "סכין", textN: "סַכִּין", img: "/icon-bank/manual/sandwich-knife.webp" },
      { text: "צלחת", textN: "צַלַּחַת", img: "/icon-bank/manual/chocolate-toastie-new/chocolate-toastie-plate.webp" },
      { text: "קורצנים", textN: "קוֹרְצָנִים", img: "/icon-bank/manual/chocolate-toastie-new/chocolate-toastie-cutters.webp" },
      { text: "טוסטר", textN: "טוֹסְטֶר", img: "/icon-bank/manual/chocolate-toastie-new/chocolate-toastie-toaster.webp" },
    ],
    steps: [
      {
        n: 1,
        text: "מורחים שוקולד על פרוסת לחם.",
        textN: "מוֹרְחִים שׁוֹקוֹלָד עַל פְּרוּסַת לֶחֶם.",
        img: "/icon-bank/manual/chocolate-toastie-new/chocolate-toastie-step-1.webp",
      },
      { n: 2, text: "סוגרים עם פרוסת לחם נוספת.", textN: "סוֹגְרִים עִם פְּרוּסַת לֶחֶם נוֹסֶפֶת.", img: "/icon-bank/manual/chocolate-toastie-new/chocolate-toastie-step-2.webp" },
      { n: 3, text: "קורצים צורה שאנחנו בוחרים.", textN: "קוֹרְצִים צוּרָה שֶׁאֲנַחְנוּ בּוֹחֲרִים.", img: "/icon-bank/manual/chocolate-toastie-new/chocolate-toastie-step-3.webp" },
      {
        n: 4,
        text: "מכניסים לטוסטר.",
        textN: "מַכְנִיסִים לַטּוֹסְטֶר.",
        img: "/icon-bank/manual/chocolate-toastie-new/chocolate-toastie-step-4.webp",
      },
    ],
  },
  {
    id: "shoko",
    title: "הכנת שוקו",
    titleN: "הֲכָנַת שׁוֹקוֹ",
    cover: "/icon-bank/manual/shoko-new/shoko-cover.webp",
    duration: "5 דקות",
    ingredients: [
      { text: "כפית שוקולית", textN: "כַּפִּית שׁוֹקוֹלִית", img: "/icon-bank/manual/shoko-new/shoko-cocoa.webp" },
      { text: "חצי כוס חלב", textN: "חֲצִי כּוֹס חָלָב", img: "/icon-bank/manual/mug-cake-new/mug-cake-milk.webp" },
      { text: "חצי כוס מים חמים", textN: "חֲצִי כּוֹס מַיִם חַמִּים", img: "/icon-bank/manual/shoko-new/shoko-hot-water.webp" },
      { text: "כפית סוכר", textN: "כַּפִּית סֻכָּר", img: "/icon-bank/manual/mug-cake-new/mug-cake-sugar.webp" },
    ],
    tools: [
      { text: "כוס", textN: "כּוֹס", img: "/icon-bank/manual/shoko-new/shoko-cup.webp" },
      { text: "כפית", textN: "כַּפִּית", img: "/icon-bank/manual/shoko-new/shoko-teaspoon.webp" },
    ],
    steps: [
      { n: 1, text: "שמים בכוס כפית סוכר וכפית שוקולית.", textN: "שָׂמִים בַּכּוֹס כַּפִּית סֻכָּר וְכַפִּית שׁוֹקוֹלִית.", img: "/icon-bank/manual/shoko-new/shoko-step-1.webp" },
      { n: 2, text: "מוסיפים חצי כוס מים חמים.", textN: "מוֹסִיפִים חֲצִי כּוֹס מַיִם חַמִּים.", img: "/icon-bank/manual/shoko-new/shoko-step-2.webp" },
      { n: 3, text: "מערבבים היטב עד שהסוכר והשוקולית נמסים.", textN: "מְעַרְבְּבִים הֵיטֵב עַד שֶׁהַסֻּכָּר וְהַשּׁוֹקוֹלִית נְמַסִּים.", img: "/icon-bank/manual/shoko-new/shoko-step-4.webp" },
      { n: 4, text: "מוסיפים חצי כוס חלב.", textN: "מוֹסִיפִים חֲצִי כּוֹס חָלָב.", img: "/icon-bank/manual/shoko-new/shoko-step-3.webp" },
      { n: 5, text: "מערבבים שוב ונהנים!", textN: "מְעַרְבְּבִים שׁוּב וְנֶהֱנִים!", img: "/icon-bank/manual/shoko-new/shoko-step-4.webp" },
    ],
  },
  {
    id: "tortilla-pizza",
    title: "הכנת פיצה",
    titleN: "הֲכָנַת פִּיצָה",
    cover: "/icon-bank/manual/pizza-new/pizza-cover.webp",
    duration: "15 דקות",
    ingredients: [
      { text: "טורטייה אחת", textN: "טוֹרְטִיָּה אַחַת", img: "/icon-bank/manual/pizza-new/pizza-tortilla.webp" },
      { text: "2 כפות קטשופ", textN: "2 כַּפּוֹת קֶטְשׁוֹפּ", img: "/icon-bank/manual/pizza-new/pizza-ketchup.webp" },
      { text: "חצי כוס גבינה צהובה מגוררת", textN: "חֲצִי כּוֹס גְּבִינָה צְהֻבָּה מְגֹרֶרֶת", img: "/icon-bank/manual/pizza-new/pizza-cheese.webp" },
      { text: "רבע כוס תוספות (לא חובה)", textN: "רֶבַע כּוֹס תּוֹסָפוֹת (לֹא חוֹבָה)", img: "/icon-bank/manual/pizza-new/pizza-toppings.webp" },
    ],
    tools: [
      { text: "נייר אפייה", textN: "נְיַר אֲפִיָּה", img: "/icon-bank/manual/recipe-parchment-paper-flat.webp" },
      { text: "סכין", textN: "סַכִּין", img: "/icon-bank/manual/pizza-new/pizza-knife.webp" },
      { text: "תנור", textN: "תַּנּוּר", img: "/icon-bank/manual/pizza-new/pizza-oven.webp" },
    ],
    steps: [
      { n: 1, text: "מורחים על טורטייה קטשופ.", textN: "מוֹרְחִים עַל טוֹרְטִיָּה קֶטְשׁוֹפּ.", img: "/icon-bank/manual/pizza-new/pizza-step-1.webp" },
      { n: 2, text: "מפזרים גבינה צהובה.", textN: "מְפַזְּרִים גְּבִינָה צְהֻבָּה.", img: "/icon-bank/manual/pizza-new/pizza-step-2.webp" },
      { n: 3, text: "מוסיפים תוספות – מי שרוצה.", textN: "מוֹסִיפִים תּוֹסָפוֹת – מִי שֶׁרוֹצֶה.", img: "/icon-bank/manual/pizza-new/pizza-step-3.webp" },
      { n: 4, text: "מניחים על נייר אפייה ואופים בתנור למשך כ־10 דקות על חום של 180 מעלות.", textN: "מַנִּיחִים עַל נְיַר אֲפִיָּה וְאוֹפִים בַּתַּנּוּר לְמֶשֶׁךְ כְּ־10 דַּקּוֹת עַל חֹם שֶׁל 180 מַעֲלוֹת.", img: "/icon-bank/manual/pizza-new/pizza-step-4.webp" },
    ],
  },
  {
    id: "chocolate-balls",
    title: "כדורי שוקולד",
    titleN: "כַּדּוּרֵי שׁוֹקוֹלָד",
    cover: "/icon-bank/manual/chocolate-balls-new/chocolate-balls-cover.webp",
    duration: "15 דקות",
    ingredients: [
      { text: "250 גרם ביסקוויטים", textN: "250 גְּרַם בִּיסְקְוִיטִים", img: "/icon-bank/manual/chocolate-balls-new/chocolate-balls-biscuits.webp" },
      { text: "3 כפות קקאו או שוקולית", textN: "3 כַּפּוֹת קָקָאוֹ אוֹ שׁוֹקוֹלִית", img: "/icon-bank/manual/mug-cake-new/mug-cake-cocoa.webp" },
      { text: "חצי כוס שמנת מתוקה", textN: "חֲצִי כּוֹס שַׁמֶּנֶת מְתוּקָה", img: "/icon-bank/manual/chocolate-balls-new/chocolate-balls-cream.webp" },
      { text: "סוכריות לקישוט", textN: "סֻכָּרִיּוֹת לְקִשּׁוּט", img: "/icon-bank/manual/recipe-choco-sprinkles-flat.webp" },
    ],
    tools: [
      { text: "קערה", textN: "קְעָרָה", img: "/icon-bank/manual/chocolate-balls-new/chocolate-balls-bowl.webp" },
      { text: "מערוך", textN: "מַעֲרוֹךְ", img: "/icon-bank/manual/chocolate-balls-new/chocolate-balls-rolling-pin.webp" },
      { text: "כף", textN: "כַּף", img: "/icon-bank/manual/chocolate-balls-new/chocolate-balls-spoon.webp" },
      { text: "שקית אוכל", textN: "שַׂקִּית אֹכֶל", img: "/icon-bank/manual/recipe-choco-bag-flat.webp" },
    ],
    steps: [
      { n: 1, text: "שוברים את הביסקוויטים בשקית באמצעות מערוך.", textN: "שׁוֹבְרִים אֶת הַבִּיסְקְוִיטִים בַּשַּׂקִּית בְּאֶמְצָעוּת מַעֲרוֹךְ.", img: "/icon-bank/manual/chocolate-balls-new/chocolate-balls-step-1.webp" },
      { n: 2, text: "מוסיפים לקערה את הביסקוויטים, הקקאו או השוקולית והשמנת.", textN: "מוֹסִיפִים לַקְּעָרָה אֶת הַבִּיסְקְוִיטִים, הַקָּקָאוֹ אוֹ הַשּׁוֹקוֹלִית וְהַשַּׁמֶּנֶת.", img: "/icon-bank/manual/chocolate-balls-new/chocolate-balls-step-3.webp" },
      { n: 3, text: "מערבבים ביחד את כל המצרכים.", textN: "מְעַרְבְּבִים בְּיַחַד אֶת כָּל הַמִּצְרָכִים.", img: "/icon-bank/manual/chocolate-balls-new/chocolate-balls-step-4.webp" },
      { n: 4, text: "מכינים כדורי שוקולד וטובלים בסוכריות.", textN: "מְכִינִים כַּדּוּרֵי שׁוֹקוֹלָד וְטוֹבְלִים בְּסֻכָּרִיּוֹת.", img: "/icon-bank/manual/chocolate-balls-new/chocolate-balls-step-5.webp" },
    ],
  },
  {
    id: "smores",
    title: "סמורס",
    titleN: "סְמוֹרְס",
    cover: "/icon-bank/manual/recipe-marsh-hero.webp",
    duration: "15 דקות",
    ingredients: [
      { text: "100 גרם שוקולד", textN: "100 גְּרַם שׁוֹקוֹלָד", img: "/icon-bank/manual/chocolate-lollipops-choco-cubes-flat.webp" },
      { text: "4 ביסקוויטים", textN: "4 בִּיסְקְוִיטִים", img: "/icon-bank/manual/chocolate-balls-new/chocolate-balls-biscuits.webp" },
      { text: "8 יחידות מרשמלו", textN: "8 יְחִידוֹת מַרְשְׁמֶלוֹ", img: "/icon-bank/manual/recipe-marsh-marshmallows.webp" },
      { text: "2 כוסות מים רותחים", textN: "2 כּוֹסוֹת מַיִם רוֹתְחִים", img: "/icon-bank/manual/shoko-new/shoko-hot-water.webp" },
    ],
    tools: [
      { text: "2 קערות", textN: "2 קְעָרוֹת", img: "/icon-bank/manual/recipe-marsh-two-bowls.webp" },
      { text: "קאפקייק", textN: "קַאפְּקֵייק", img: "/icon-bank/manual/recipe-marsh-cupcake-liner.webp" },
      { text: "כפית", textN: "כַּפִּית", img: "/icon-bank/manual/shoko-new/shoko-teaspoon.webp" },
      { text: "תנור", textN: "תַּנּוּר", img: "/icon-bank/manual/pizza-new/pizza-oven.webp" },
    ],
    steps: [
      {
        n: 1,
        text: "שוברים שוקולד לתוך קערה.",
        textN: "שׁוֹבְרִים שׁוֹקוֹלָד לְתוֹךְ קְעָרָה.",
        img: "/icon-bank/manual/smores-new/smores-step-1.webp",
      },
      {
        n: 2,
        text: "מניחים את הקערה עם השוקולד בתוך קערה עם מים רותחים.",
        textN: "מַנִּיחִים אֶת הַקְּעָרָה עִם הַשּׁוֹקוֹלָד בְּתוֹךְ קְעָרָה עִם מַיִם רוֹתְחִים.",
        img: "/icon-bank/manual/smores-new/smores-step-2.webp",
      },
      {
        n: 3,
        text: "מועכים את הביסקוויטים באמצעות הידיים ושמים בתוך קאפקייק (חותכים גס).",
        textN: "מוֹעֲכִים אֶת הַבִּיסְקְוִיטִים בְּאֶמְצָעוּת הַיָּדַיִם וְשָׂמִים בְּתוֹךְ קַאפְּקֵייק (חוֹתְכִים גַּס).",
        img: "/icon-bank/manual/smores-new/smores-step-3.webp",
      },
      {
        n: 4,
        text: "מורחים שוקולד מעל הביסקוויטים ומניחים מעליו 2 מרשמלו.",
        textN: "מוֹרְחִים שׁוֹקוֹלָד מֵעַל הַבִּיסְקְוִיטִים וּמַנִּיחִים מֵעָלָיו 2 מַרְשְׁמֶלוֹ.",
        img: "/icon-bank/manual/smores-new/smores-step-4.webp",
      },
      {
        n: 5,
        text: "מכניסים לתנור ל-5 דקות על חום של 180 מעלות.",
        textN: "מַכְנִיסִים לַתַּנּוּר לְ-5 דַּקּוֹת עַל חוֹם שֶׁל 180 מַעֲלוֹת.",
        img: "/icon-bank/manual/smores-new/smores-step-5.webp",
      },
    ],
  },
  {
    id: "chocolate-lollipops",
    title: "הכנת סוכריות שוקולד",
    titleN: "הֲכָנַת סֻכָּרִיּוֹת שׁוֹקוֹלָד",
    cover: "/icon-bank/manual/chocolate-lollipops-hero-flat.webp",
    duration: "20 דקות",
    ingredients: [
      { text: "100 גרם שוקולד", textN: "100 גְּרַם שׁוֹקוֹלָד", img: "/icon-bank/manual/chocolate-lollipops-choco-cubes-flat.webp" },
      { text: "סוכריות לקישוט", textN: "סֻכָּרִיּוֹת לְקִשּׁוּט", img: "/icon-bank/manual/recipe-choco-sprinkles-flat.webp" },
      { text: "6 מקלות ארטיק", textN: "6 מַקְלוֹת אַרְטִיק", img: "/icon-bank/manual/popsicle-sticks-flat.webp" },
    ],
    tools: [
      { text: "שקית אוכל", textN: "שַׂקִּית אֹכֶל", img: "/icon-bank/manual/recipe-choco-bag-flat.webp" },
      { text: "קערה עם מים חמים", textN: "קְעָרָה עִם מַיִם חַמִּים", img: "/icon-bank/manual/chocolate-lollipops-bag-in-water-flat.webp" },
      { text: "נייר אפייה", textN: "נְיַר אֲפִיָּה", img: "/icon-bank/manual/recipe-parchment-paper-flat.webp" },
      { text: "מספריים", textN: "מִסְפָּרַיִם", img: "/icon-bank/crafts-new/shared-independent/scissors.webp" },
      { text: "מקרר", textN: "מְקָרֵר", img: "/icon-bank/manual/chocolate-lollipops-fridge-tool.webp" },
    ],
    steps: [
      {
        n: 1,
        text: "מכניסים קוביות שוקולד לתוך שקית וסוגרים אותה.",
        textN: "מַכְנִיסִים קֻבִּיּוֹת שׁוֹקוֹלָד לְתוֹךְ שַׂקִּית וְסוֹגְרִים אוֹתָהּ.",
        img: "/icon-bank/manual/chocolate-lollipops-bag-fill-flat.webp",
      },
      {
        n: 2,
        text: "מכניסים את השקית עם השוקולד לתוך קערה עם מים חמים ומחכים עד שהשוקולד נמס.",
        textN: "מַכְנִיסִים אֶת הַשַּׂקִּית עִם הַשּׁוֹקוֹלָד לְתוֹךְ קְעָרָה עִם מַיִם חַמִּים וּמְחַכִּים עַד שֶׁהַשּׁוֹקוֹלָד נָמֵס.",
        img: "/icon-bank/manual/chocolate-lollipops-bag-in-water-flat.webp",
      },
      {
        n: 3,
        text: "בזמן שהשוקולד נמס, מציירים צורה פשוטה על נייר אפייה.",
        textN: "בִּזְמַן שֶׁהַשּׁוֹקוֹלָד נָמֵס, מְצַיְּרִים צוּרָה פְּשׁוּטָה עַל נְיַר אֲפִיָּה.",
        img: "/icon-bank/manual/chocolate-lollipops-draw-shapes-flat.webp",
      },
      {
        n: 4,
        text: "עושים חור קטן בשקית, מזלפים על הצורה שציירנו שוקולד, ושמים מקל ארטיק.",
        textN: "עוֹשִׂים חוֹר קָטָן בַּשַּׂקִּית, מְזַלְּפִים עַל הַצּוּרָה שֶׁצִּיַּרְנוּ שׁוֹקוֹלָד, וְשָׂמִים מַקֵּל אַרְטִיק.",
        img: "/icon-bank/manual/chocolate-lollipops-pipe-flat.webp",
      },
      {
        n: 5,
        text: "מפזרים סוכריות.",
        textN: "מְפַזְּרִים סֻכָּרִיּוֹת.",
        img: "/icon-bank/manual/chocolate-lollipops-sprinkles-flat.webp",
      },
      { n: 6, text: "מכניסים למקרר.", textN: "מַכְנִיסִים לַמְּקָרֵר.", img: "/icon-bank/manual/chocolate-lollipops-fridge-flat.webp" },
    ],
  },
  {
    id: "strawberry-banana-smoothie",
    title: "שייק תות־בננה",
    titleN: "שֵׁייק תּוּת־בָּנָנָה",
    cover: "/icon-bank/manual/smoothie-item-9.webp",
    duration: "10 דקות",
    ingredients: [
      { text: "בננה אחת", textN: "בָּנָנָה אַחַת", img: "/icon-bank/manual/smoothie-item-1.webp" },
      { text: "כוס תותים", textN: "כּוֹס תּוּתִים", img: "/icon-bank/manual/smoothie-item-2.webp" },
      { text: "כוס חלב", textN: "כּוֹס חָלָב", img: "/icon-bank/manual/smoothie-item-4.webp" },
    ],
    tools: [
      { text: "סכין – מבוגר בלבד", textN: "סַכִּין – מְבֻגָּר בִּלְבַד", img: "/icon-bank/manual/smoothie-item-5.webp" },
      { text: "קרש חיתוך", textN: "קֶרֶשׁ חִתּוּךְ", img: "/icon-bank/manual/smoothie-item-6.webp" },
      { text: "בלנדר – בהשגחת מבוגר", textN: "בְּלֶנְדֶּר – בְּהַשְׁגָּחַת מְבֻגָּר", img: "/icon-bank/manual/smoothie-item-7.webp" },
      { text: "כוס", textN: "כּוֹס", img: "/icon-bank/manual/smoothie-item-8.webp" },
    ],
    steps: [
      { n: 1, text: "חותכים בזהירות את הבננה והתותים לחתיכות.", textN: "חוֹתְכִים בִּזְהִירוּת אֶת הַבָּנָנָה וְהַתּוּתִים לַחֲתִיכוֹת.", img: "/icon-bank/manual/smoothie-step-1.webp" },
      { n: 2, text: "מכניסים לבלנדר את הפירות וכוס של חלב.", textN: "מַכְנִיסִים לַבְּלֶנְדֶּר אֶת הַפֵּרוֹת וְכוֹס שֶׁל חָלָב.", img: "/icon-bank/manual/smoothie-step-2.webp" },
      { n: 3, text: "סוגרים ומפעילים את הבלנדר עד שהשייק חלק.", textN: "סוֹגְרִים וּמַפְעִילִים אֶת הַבְּלֶנְדֶּר עַד שֶׁהַשֵּׁייק חָלָק.", img: "/icon-bank/manual/smoothie-step-3.webp" },
      { n: 4, text: "מוזגים לכוס ושותים.", textN: "מוֹזְגִים לַכּוֹס וְשׁוֹתִים.", img: "/icon-bank/manual/smoothie-step-4.webp" },
    ],
  },
  {
    id: "chocolate-tortilla-swirls",
    title: "שבלולי שוקולד",
    titleN: "שַׁבְּלוּלֵי שׁוֹקוֹלָד",
    cover: "/icon-bank/manual/swirl-new/swirl-cover.webp",
    duration: "30 דקות",
    ingredients: [
      { text: "טורטייה אחת", textN: "טוֹרְטִיָּה אַחַת", img: "/icon-bank/manual/swirl-item-1.webp" },
      { text: "2 כפות ממרח שוקולד", textN: "2 כַּפּוֹת מִמְרָח שׁוֹקוֹלָד", img: "/icon-bank/manual/swirl-item-2.webp" },
      { text: "כפית שמן", textN: "כַּפִּית שֶׁמֶן", img: "/icon-bank/manual/swirl-item-4.webp" },
      { text: "כפית אבקת סוכר – לא חובה", textN: "כַּפִּית אַבְקַת סֻכָּר – לֹא חוֹבָה", img: "/icon-bank/manual/swirl-item-3.webp" },
    ],
    tools: [
      { text: "צלחת", textN: "צַלַּחַת", img: "/icon-bank/manual/swirl-item-5.webp" },
      { text: "סכין", textN: "סַכִּין", img: "/icon-bank/manual/swirl-item-6.webp" },
      { text: "מברשת", textN: "מִבְרֶשֶׁת", img: "/icon-bank/manual/swirl-item-7.webp" },
      { text: "תבנית עם נייר אפייה", textN: "תַּבְנִית עִם נְיַר אֲפִיָּה", img: "/icon-bank/manual/swirl-item-8.webp" },
      { text: "תנור – מבוגר בלבד", textN: "תַּנּוּר – מְבֻגָּר בִּלְבַד", img: "/icon-bank/manual/pizza-new/pizza-oven.webp" },
    ],
    steps: [
      { n: 1, text: "מורחים שוקולד על הטורטייה ומגלגלים לגליל הדוק.", textN: "מוֹרְחִים שׁוֹקוֹלָד עַל הַטּוֹרְטִיָּה וּמְגַלְגְּלִים לְגָלִיל הָדוּק.", img: "/icon-bank/manual/swirl-new/swirl-step-1.webp" },
      { n: 2, text: "חותכים את הגליל לפרוסות עבות.", textN: "חוֹתְכִים אֶת הַגָּלִיל לִפְרוּסוֹת עָבוֹת.", img: "/icon-bank/manual/swirl-new/swirl-step-2.webp" },
      { n: 3, text: "מסדרים בתבנית ומברישים במעט שמן.", textN: "מְסַדְּרִים בַּתַּבְנִית וּמַבְרִישִׁים בִּמְעַט שֶׁמֶן.", img: "/icon-bank/manual/swirl-new/swirl-step-3.webp" },
      { n: 4, text: "מבוגר אופה בתנור שחומם ל־190 מעלות במשך 15–18 דקות.", textN: "מְבֻגָּר אוֹפֶה בַּתַּנּוּר בְּ־190 מַעֲלוֹת בְּמֶשֶׁךְ 15–18 דַּקּוֹת.", img: "/icon-bank/manual/swirl-new/swirl-step-4.webp" },
    ],
  },
  {
    id: "baked-potato-chips",
    title: "תפוצ׳יפס אפוי",
    titleN: "תַּפּוּצִ'יפְּס אָפוּי",
    cover: "/icon-bank/manual/chips-step-6.webp",
    duration: "40 דקות",
    ingredients: [
      { text: "4–6 תפוחי אדמה", textN: "4–6 תַּפּוּחֵי אֲדָמָה", img: "/icon-bank/manual/chips-item-1.webp" },
      { text: "2 כפות שמן", textN: "2 כַּפּוֹת שֶׁמֶן", img: "/icon-bank/manual/chips-item-3.webp" },
      { text: "חצי כפית מלח גס", textN: "חֲצִי כַּפִּית מֶלַח גַּס", img: "/icon-bank/manual/chips-item-2.webp" },
    ],
    tools: [
      { text: "קערת מים קרים", textN: "קַעֲרַת מַיִם קָרִים", img: "/icon-bank/manual/chips-item-4.webp" },
      { text: "סכין – מבוגר בלבד", textN: "סַכִּין – מְבֻגָּר בִּלְבַד", img: "/icon-bank/manual/chips-item-5.webp" },
      { text: "מסננת", textN: "מְסַנֶּנֶת", img: "/icon-bank/manual/chips-item-6.webp" },
      { text: "2 מגבות", textN: "2 מַגָּבוֹת", img: "/icon-bank/manual/chips-item-7.webp" },
      { text: "תבנית עם נייר אפייה", textN: "תַּבְנִית עִם נְיַר אֲפִיָּה", img: "/icon-bank/manual/chips-item-8.webp" },
      { text: "תנור – מבוגר בלבד", textN: "תַּנּוּר – מְבֻגָּר בִּלְבַד", img: "/icon-bank/manual/chips-item-9.webp" },
    ],
    steps: [
      { n: 1, text: "מבוגר פורס את תפוחי האדמה לפרוסות דקות מאוד.", textN: "מְבֻגָּר פּוֹרֵס אֶת תַּפּוּחֵי הָאֲדָמָה לִפְרוּסוֹת דַּקּוֹת מְאֹד.", img: "/icon-bank/manual/chips-step-1.webp" },
      { n: 2, text: "מסדרים בשכבה אחת על נייר אפייה ומשמנים מעט משני הצדדים.", textN: "מְסַדְּרִים בְּשִׁכְבָה אַחַת וּמְשַׁמְּנִים מְעַט.", img: "/icon-bank/manual/chips-step-4.webp" },
      { n: 3, text: "מבוגר אופה בתנור: 15–18 דקות ב־200 מעלות ועוד כ־5 דקות ב־150 מעלות.", textN: "מְבֻגָּר אוֹפֶה בַּתַּנּוּר.", img: "/icon-bank/manual/chips-step-5.webp" },
      { n: 4, text: "מצננים על רשת ומפזרים מעט מלח גס.", textN: "מְצַנְּנִים עַל רֶשֶׁת וּמְפַזְּרִים מְעַט מֶלַח גַּס.", img: "/icon-bank/manual/chips-step-6.webp" },
    ],
  },
  {
    id: "olive-muffins",
    title: "מאפינס זיתים",
    titleN: "מָאפִינְס זֵיתִים",
    cover: "/icon-bank/manual/olive-muffins-new/olive-muffins-cover.webp",
    duration: "40 דקות",
    ingredients: [
      { text: "2 כוסות קמח תופח", textN: "2 כּוֹסוֹת קֶמַח תּוֹפֵחַ", img: "/icon-bank/manual/mug-cake-new/mug-cake-flour.webp" },
      { text: "כפית מלח", textN: "כַּפִּית מֶלַח", img: "/icon-bank/manual/olive-muffins-new/olive-muffins-salt.webp" },
      { text: "2 ביצים", textN: "2 בֵּיצִים", img: "/icon-bank/manual/olive-muffins-new/olive-muffins-eggs.webp" },
      { text: "חצי כוס שמן", textN: "חֲצִי כּוֹס שֶׁמֶן", img: "/icon-bank/manual/mug-cake-new/mug-cake-oil.webp" },
      { text: "250 גרם יוגורט או גבינה לבנה", textN: "250 גְרָם יוֹגוּרְט אוֹ גְּבִינָה לְבָנָה", img: "/icon-bank/manual/olive-muffins-new/olive-muffins-yogurt.webp" },
      { text: "חצי כוס גבינה צהובה מגורדת", textN: "חֲצִי כּוֹס גְּבִינָה צְהֻבָּה מְגֹרֶדֶת", img: "/icon-bank/manual/pizza-new/pizza-cheese.webp" },
      { text: "כוס זיתים ירוקים פרוסים", textN: "כּוֹס זֵיתִים יְרֻקִּים פְּרוּסִים", img: "/icon-bank/manual/olive-muffins-new/olive-muffins-olives.webp" },
    ],
    tools: [
      { text: "קערה ומטרפה", textN: "קְעָרָה וּמַטְרֵפָה", img: "/icon-bank/manual/olive-muffins-new/olive-muffins-bowl-whisk.webp" },
      { text: "כף", textN: "כַּף", img: "/icon-bank/manual/chocolate-balls-new/chocolate-balls-spoon.webp" },
      { text: "תבנית מאפינס ומנג׳טים", textN: "תַּבְנִית מָאפִינְס וּמַנְגֶ'טִים", img: "/icon-bank/manual/olive-muffins-new/olive-muffins-tray.webp" },
      { text: "תנור – מבוגר בלבד", textN: "תַּנּוּר – מְבֻגָּר בִּלְבַד", img: "/icon-bank/manual/pizza-new/pizza-oven.webp" },
    ],
    steps: [
      { n: 1, text: "מבוגר מחמם תנור מראש ל־180 מעלות.", textN: "מְבֻגָּר מְחַמֵּם תַּנּוּר מֵרֹאשׁ לְ־180 מַעֲלוֹת.", img: "/icon-bank/manual/olive-muffins-new/olive-muffins-step-1.webp" },
      { n: 2, text: "מכניסים לקערה את כל החומרים ומערבבים לתערובת אחידה.", textN: "מַכְנִיסִים לַקְּעָרָה אֶת כָּל הַחֳמָרִים וּמְעַרְבְּבִים.", img: "/icon-bank/manual/olive-muffins-new/olive-muffins-step-2.webp" },
      { n: 3, text: "מחלקים את התערובת למנג׳טים.", textN: "מְחַלְּקִים אֶת הַתַּעֲרֹבֶת לַמַּנְגֶ'טִים.", img: "/icon-bank/manual/olive-muffins-new/olive-muffins-step-3.webp" },
      { n: 4, text: "מבוגר אופה כ־30 דקות עד להזהבה קלה ומוציא בזהירות.", textN: "מְבֻגָּר אוֹפֶה כְּ־30 דַּקּוֹת עַד לְהַזְהָבָה קַלָּה.", img: "/icon-bank/manual/olive-muffins-new/olive-muffins-step-4.webp" },
    ],
  },
  {
    id: "mug-cake",
    title: "עוגה בכוס",
    titleN: "עוּגָה בַּכּוֹס",
    cover: "/icon-bank/manual/mug-cake-new/mug-cake-cover.webp",
    duration: "5 דקות",
    ingredients: [
      { text: "4 כפות קמח לבן", textN: "4 כַּפּוֹת קֶמַח לָבָן", img: "/icon-bank/manual/mug-cake-new/mug-cake-flour.webp" },
      { text: "2 כפות סוכר", textN: "2 כַּפּוֹת סֻכָּר", img: "/icon-bank/manual/mug-cake-new/mug-cake-sugar.webp" },
      { text: "כף אבקת קקאו", textN: "כַּף אַבְקַת קָקָאוֹ", img: "/icon-bank/manual/mug-cake-new/mug-cake-cocoa.webp" },
      { text: "רבע כפית אבקת אפייה", textN: "רֶבַע כַּפִּית אַבְקַת אֲפִיָּה", img: "/icon-bank/manual/mug-cake-new/mug-cake-baking-powder.webp" },
      { text: "3 כפות חלב (או מים)", textN: "3 כַּפּוֹת חָלָב (אוֹ מַיִם)", img: "/icon-bank/manual/mug-cake-new/mug-cake-milk.webp" },
      { text: "2 כפות שמן", textN: "2 כַּפּוֹת שֶׁמֶן", img: "/icon-bank/manual/mug-cake-new/mug-cake-oil.webp" },
      { text: "רבע כפית תמצית וניל (לא חובה)", textN: "רֶבַע כַּפִּית תַּמְצִית וָנִיל (לֹא חוֹבָה)", img: "/icon-bank/manual/mug-cake-new/mug-cake-vanilla.webp" },
    ],
    tools: [
      { text: "ספל גדול שמתאים למיקרוגל", textN: "סֵפֶל גָּדוֹל שֶׁמַּתְאִים לְמִיקְרוֹגַל", img: "/icon-bank/manual/mug-cake-new/mug-cake-mug.webp" },
      { text: "כף", textN: "כַּף", img: "/icon-bank/manual/mug-cake-new/mug-cake-spoon.webp" },
      { text: "מיקרוגל", textN: "מִיקְרוֹגַל", img: "/icon-bank/manual/chocolate-balls-new/chocolate-balls-microwave.webp" },
    ],
    steps: [
      {
        n: 1,
        text: "שמים את כל המצרכים היבשים (קמח, סוכר, קקאו ואבקת אפייה) בתוך הספל.",
        textN: "שָׂמִים אֶת כָּל הַמִּצְרָכִים הַיְּבֵשִׁים בְּתוֹךְ הַסֵּפֶל.",
        img: "/icon-bank/manual/mug-cake-new/mug-cake-step-1.webp",
      },
      {
        n: 2,
        text: "מוסיפים פנימה את הרכיבים הרטובים (חלב, שמן ותמצית וניל).",
        textN: "מוֹסִיפִים פְּנִימָה אֶת הָרְכִיבִים הָרְטֻבִּים.",
        img: "/icon-bank/manual/mug-cake-new/mug-cake-step-2.webp",
      },
      {
        n: 3,
        text: "מערבבים היטב עד שמתקבלת בלילה חלקה ללא גושים.",
        textN: "מְעַרְבְּבִים הֵיטֵב עַד שֶׁמִּתְקַבֶּלֶת בְּלִילָה חֲלָקָה.",
        img: "/icon-bank/manual/mug-cake-new/mug-cake-step-3.webp",
      },
      {
        n: 4,
        text: "מכניסים את הספל למיקרוגל ומפעילים בעוצמה גבוהה למשך 60 עד 90 שניות.",
        textN: "מַכְנִיסִים אֶת הַסֵּפֶל לְמִיקְרוֹגַל וּמַפְעִילִים בְּעָצְמָה גְּבוֹהָה לְמֶשֶׁךְ 60 עַד 90 שְׁנִיּוֹת.",
        img: "/icon-bank/manual/mug-cake-new/mug-cake-step-4.webp",
      },
      {
        n: 5,
        text: "מוציאים בזהירות (הספל חם!) וממתינים רגע שיתקרר לפני שטועמים.",
        textN: "מוֹצִיאִים בִּזְהִירוּת וּמַמְתִּינִים שֶׁיִּתְקָרֵר לִפְנֵי שֶׁטּוֹעֲמִים.",
        img: "/icon-bank/manual/mug-cake-new/mug-cake-step-5.webp",
      },
    ],
  },
  {
    id: "fruit-popsicles",
    hiddenTags: ["החופש הגדול"],
    title: "הכנת ארטיק פירות ויוגורט",
    titleN: "הֲכָנַת אַרְטִיק פֵּרוֹת וְיוֹגוּרְט",
    cover: "/icon-bank/manual/fruit-popsicles/cover.webp",
    duration: "15 דקות הכנה + 4 שעות הקפאה",
    ingredients: [
      {
        text: "1 כוס פירות אהובים (כמו פירות יער, מנגו או בננה)",
        textN: "1 כּוֹס פֵּרוֹת אֲהוּבִים (כְּמוֹ פֵּרוֹת יַעַר, מַנְגּוֹ אוֹ בָּנָנָה)",
        img: "/icon-bank/manual/smoothie-item-2.webp",
      },
      {
        text: "1 כוס יוגורט רגיל או יווני (או חלב צמחי לגרסה טבעונית)",
        textN: "1 כּוֹס יוֹגוּרְט רָגִיל אוֹ יְוָנִי (אוֹ חָלָב צִמְחִי לְגִרְסָה טִבְעוֹנִית)",
        img: "/icon-bank/manual/olive-muffins-new/olive-muffins-yogurt.webp",
      },
      {
        text: "2 כפות דבש, סילאן או סירופ מייפל",
        textN: "2 כַּפּוֹת דְּבַשׁ, סִילָאן אוֹ סִירוֹפּ מֵייפֶּל",
        img: "/icon-bank/manual/fruit-popsicles/honey.webp",
      },
    ],
    tools: [
      {
        text: "בלנדר – בהשגחת מבוגר",
        textN: "בְּלֶנְדֶּר – בְּהַשְׁגָּחַת מְבֻגָּר",
        img: "/icon-bank/manual/smoothie-item-7.webp",
      },
      {
        text: "תבניות ייעודיות לארטיק",
        textN: "תַּבְנִיּוֹת יִעוּדִיּוֹת לְאַרְטִיק",
        img: "/icon-bank/manual/fruit-popsicles/molds.webp",
      },
      {
        text: "מקלות עץ",
        textN: "מַקְלוֹת עֵץ",
        img: "/icon-bank/manual/popsicle-sticks-flat.webp",
      },
      {
        text: "כוס מדידה",
        textN: "כּוֹס מְדִידָה",
        img: "/icon-bank/manual/smoothie-item-8.webp",
      },
      {
        text: "כף",
        textN: "כַּף",
        img: "/icon-bank/manual/chocolate-balls-new/chocolate-balls-spoon.webp",
      },
      {
        text: "מקפיא",
        textN: "מַקְפִּיא",
        img: "/icon-bank/manual/chocolate-lollipops-fridge-tool.webp",
      },
    ],
    steps: [
      {
        n: 1,
        text: "מכניסים את כל החומרים לבלנדר וטוחנים עד לקבלת מרקם חלק.",
        textN: "מַכְנִיסִים אֶת כָּל הַחֳמָרִים לַבְּלֶנְדֶּר וְטוֹחֲנִים עַד לְקַבָּלַת מִרְקָם חָלָק.",
        img: "/icon-bank/manual/fruit-popsicles/step-1.webp",
      },
      {
        n: 2,
        text: "יוצקים את התערובת לתוך תבניות ייעודיות לארטיק.",
        textN: "יוֹצְקִים אֶת הַתַּעֲרֹבֶת לְתוֹךְ תַּבְנִיּוֹת יִעוּדִיּוֹת לְאַרְטִיק.",
        img: "/icon-bank/manual/fruit-popsicles/step-2.webp",
      },
      {
        n: 3,
        text: "נועצים את מקלות העץ ומקפיאים למשך 4 שעות לפחות, עד לקפיאה מלאה.",
        textN: "נוֹעֲצִים אֶת מַקְלוֹת הָעֵץ וּמַקְפִּיאִים לְמֶשֶׁךְ 4 שָׁעוֹת לְפָחוֹת, עַד לִקְפִיאָה מְלֵאָה.",
        img: "/icon-bank/manual/fruit-popsicles/step-3.webp",
      },
    ],
  },
  {
    id: "homemade-ice-cream",
    hiddenTags: ["החופש הגדול"],
    title: "הכנת גלידה ביתית",
    titleN: "הֲכָנַת גְּלִידָה בֵּיתִית",
    cover: "/icon-bank/seasonal/summer-ice-cream.webp",
    duration: "20 דקות הכנה + כ־6 שעות הקפאה",
    ingredients: [
      {
        text: "500 מ״ל שמנת מתוקה (32% או 38%)",
        textN: "500 מ״ל שַׁמֶּנֶת מְתוּקָה (32% אוֹ 38%)",
        img: "/icon-bank/manual/chocolate-balls-new/chocolate-balls-cream.webp",
      },
      {
        text: "1 פחית חלב מרוכז ממותק",
        textN: "1 פַּחִית חָלָב מְרֻכָּז מְמֻתָּק",
        img: "/icon-bank/manual/homemade-ice-cream/condensed-milk.webp",
      },
      {
        text: "עד כוס תוספות לבחירה: תמצית וניל, שברי עוגיות, שוקולד צ׳יפס או מחית פיסטוק",
        textN: "עַד כּוֹס תּוֹסָפוֹת לִבְחִירָה: תַּמְצִית וָנִיל, שִׁבְרֵי עוּגִיּוֹת, שׁוֹקוֹלָד צ׳יפְּס אוֹ מְחִית פִיסְטוּק",
        img: "/icon-bank/manual/chocolate-chunks.webp",
      },
    ],
    tools: [
      {
        text: "מיקסר – בהשגחת מבוגר",
        textN: "מִיקְסֶר – בְּהַשְׁגָּחַת מְבֻגָּר",
        img: "/icon-bank/manual/homemade-ice-cream/mixer.webp",
      },
      {
        text: "מרית או כף",
        textN: "מָרִית אוֹ כַּף",
        img: "/icon-bank/crafts-new/seed-84-independent/material-spatula.webp",
      },
      {
        text: "מיכל פלסטיק עם מכסה",
        textN: "מְכַל פְּלַסְטִיק עִם מִכְסֶה",
        img: "/icon-bank/manual/homemade-ice-cream/container.webp",
      },
      {
        text: "מקפיא",
        textN: "מַקְפִּיא",
        img: "/icon-bank/manual/chocolate-lollipops-fridge-tool.webp",
      },
    ],
    steps: [
      {
        n: 1,
        text: "שופכים את השמנת המתוקה לקערת המיקסר.",
        textN: "שׁוֹפְכִים אֶת הַשַּׁמֶּנֶת הַמְּתוּקָה לִקְעָרַת הַמִּיקְסֶר.",
        img: "/icon-bank/manual/homemade-ice-cream/step-1.webp",
      },
      {
        n: 2,
        text: "מוסיפים את החלב המרוכז.",
        textN: "מוֹסִיפִים אֶת הֶחָלָב הַמְרֻכָּז.",
        img: "/icon-bank/manual/homemade-ice-cream/step-2.webp",
      },
      {
        n: 3,
        text: "מקציפים במהירות גבוהה עד לקבלת קצפת יציבה, רכה ואוורירית.",
        textN: "מַקְצִיפִים בִּמְהִירוּת גְּבוֹהָה עַד לְקַבָּלַת קַצֶּפֶת יַצִּיבָה, רַכָּה וַאֲוִירִירִית.",
        img: "/icon-bank/manual/homemade-ice-cream/step-3.webp",
      },
      {
        n: 4,
        text: "מערבבים פנימה בעדינות את התוספות שבחרנו.",
        textN: "מְעָרְבְּבִים פְּנִימָה בַּעֲדִינוּת אֶת הַתּוֹסָפוֹת שֶׁבָּחַרְנוּ.",
        img: "/icon-bank/manual/homemade-ice-cream/step-4.webp",
      },
      {
        n: 5,
        text: "מעבירים את התערובת למיכל פלסטיק, מכסים ומקפיאים למשך כ־6 שעות.",
        textN: "מַעֲבִירִים אֶת הַתַּעֲרֹבֶת לִמְכַל פְּלַסְטִיק, מְכַסִּים וּמַקְפִּיאִים לְמֶשֶׁךְ כְּ־6 שָׁעוֹת.",
        img: "/icon-bank/manual/homemade-ice-cream/step-5.webp",
      },
    ],
  },
];

const NIKUD_KEY = "recipe:nikud";
const HANDWRITING_KEY = "recipe:handwriting";

function useToggleSetting(storageKey) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    try {
      setOn(window.localStorage.getItem(storageKey) === "1");
    } catch {
      /* ignore */
    }
  }, [storageKey]);
  const toggle = useCallback(() => {
    setOn((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(storageKey, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [storageKey]);
  return { on, toggle };
}

function useNikud() {
  return useToggleSetting(NIKUD_KEY);
}

function useHandwriting() {
  return useToggleSetting(HANDWRITING_KEY);
}

function useItemsChecklist(key, total) {
  const [checked, setChecked] = useState(() => new Set());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      setChecked(new Set(Array.isArray(arr) ? arr : []));
    } catch {
      setChecked(new Set());
    }
  }, [key]);

  const toggle = useCallback(
    (i) => {
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(i)) next.delete(i);
        else next.add(i);
        try {
          window.localStorage.setItem(key, JSON.stringify([...next]));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [key],
  );

  return { checked, toggle, done: checked.size, total };
}

function useRecipeChecklist(recipeId, total) {
  const key = `recipe-steps:${recipeId}`;
  const [checked, setChecked] = useState(() => new Set());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      setChecked(new Set(Array.isArray(arr) ? arr : []));
    } catch {
      setChecked(new Set());
    }
  }, [key]);

  const toggle = useCallback(
    (n) => {
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(n)) next.delete(n);
        else next.add(n);
        try {
          window.localStorage.setItem(key, JSON.stringify([...next]));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [key],
  );

  const reset = useCallback(() => {
    setChecked(new Set());
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }, [key]);

  return { checked, toggle, reset, done: checked.size, total };
}

function AddToPlanButton({ kind, id, mode, className = "" }) {
  const [added, setAdded] = useState(false);
  if (mode !== "therapist") return null;
  return (
    <button
      type="button"
      aria-label={added ? "נוסף לטיפול" : "הוסף לטיפול"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const res = addToDraftPlan(kind, id);
        if (res.added) {
          setAdded(true);
          toast.success(kind === "recipe" ? "המתכון נוסף לטיפול ✨" : "הניסוי נוסף לטיפול ✨");
        } else {
          toast.info(kind === "recipe" ? "המתכון כבר בתוכנית הטיפול" : "הניסוי כבר בתוכנית הטיפול");
        }
      }}
      className={`absolute top-3 left-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-background/90 backdrop-blur transition-all hover:scale-105 ${
        added ? "border-sage text-sage-foreground" : "border-border text-muted-foreground hover:text-primary"
      } ${className}`}
    >
      {added ? <Check className="h-4 w-4" /> : <ListPlus className="h-4 w-4" />}
    </button>
  );
}

export default function TherapistRecipes({ mode = "therapist" }) {
  const { language, t } = useTranslator();
  const cmsRecipes = useCmsCollection("recipe", RECIPES);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get("r");
  const active = cmsRecipes.find((r) => r.id === activeId) ?? null;

  if (active) return <RecipeDetail recipe={active} mode={mode} onBack={() => setSearchParams({})} />;

  return (
    <AppShell mode={mode}>
      <div className="mb-6 flex items-center gap-3">
        <ChefHat className="h-7 w-7 text-primary" />
        <div>
          <h1 className="font-display text-3xl font-black">{t("מתכונים", "Recipes")}</h1>
          <p className="text-muted-foreground">{t("מתכונים טיפוליים פשוטים לשימוש במפגשים או בבית", "Simple, child-friendly recipes for sessions or home.")}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cmsRecipes.map((original) => {
          const r = translatedRecipe(original, language);
          const title = r.title;
          return (
          <div key={r.id} className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <AddToPlanButton kind="recipe" id={r.id} mode={mode} />
            <button
              onClick={() => setSearchParams({ r: r.id })}
              className="block w-full text-right"
            >
              <div className="flex h-44 items-center justify-center bg-white">
                {r.cover ? (
                  <div className="flex h-36 w-36 items-center justify-center">
                    <img src={r.cover} alt={t(`תמונה של המתכון ${r.title}`, `Illustration for the ${title} recipe`)} title={t(`${r.title} — מתכון לילדים מבואו נשחק`, `${title} — a Let's Play recipe for children`)} data-seo-name={t(`${r.title} מתכון לילדים`, `${title} recipe for children`)} className="max-h-full max-w-full object-contain" />
                  </div>
                ) : r.coverIcon ? (
                  <div className="h-28 w-28">
                    <r.coverIcon />
                  </div>
                ) : (
                  <span className="text-7xl">{r.coverEmoji}</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display text-xl font-bold group-hover:text-primary">{title}</h3>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> {r.duration}
                </span>
              </div>
            </button>
          </div>
        )})}
      </div>
    </AppShell>
  );
}

function HighlightableText({ text, stepKey, highlighted, onToggle }) {
  if (!text) return null;
  const words = text.split(/(\s+)/);
  return (
    <>
      {words.map((word, i) => {
        if (/^\s+$/.test(word)) return <span key={i}>{word}</span>;
        if (!word) return null;
        const key = `${stepKey}-${i}`;
        const isOn = highlighted.has(key);
        return (
          <span
            key={i}
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(key);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onToggle(key);
              }
            }}
            className={`cursor-pointer rounded px-0.5 transition-colors ${isOn ? "bg-butter text-foreground" : "hover:bg-sky/20"}`}
          >
            {word}
          </span>
        );
      })}
    </>
  );
}

function PrintRow({ i, icon, label, isLast }) {
  return (
    <tr>
      <td style={i === 0 ? { width: "6%" } : undefined} className="border border-black p-1 text-center">
        <span aria-hidden className="mx-auto block h-4 w-4 border-2 border-black" />
      </td>
      <td style={i === 0 ? { width: "8%" } : undefined} className="border border-black p-1 text-center">
        {i + 1}
      </td>
      <td style={i === 0 ? { width: "16%" } : undefined} className="border border-black p-1">
        {icon}
      </td>
      <td style={i === 0 ? { width: "70%" } : undefined} className="border border-black p-1">
        {label}
      </td>
    </tr>
  );
}

function RecipePrintSheet({ recipe, pick, language }) {
  const label = (he, en) => language === "en" ? en : he;
  const iconFor = (item) =>
    item.img ? (
      <img src={item.img} alt="" className="mx-auto h-14 w-14 object-contain" />
    ) : item.icon ? (
      <div className="mx-auto h-9 w-9">
        <item.icon />
      </div>
    ) : (
      <span className="mx-auto block text-3xl leading-none">{item.emoji}</span>
    );

  return (
    <div className="activity-print-sheet hidden print:block print:space-y-4 print:text-black">
      <div className="relative flex items-center justify-center gap-5 border-b-2 border-black pb-3">
        <img src={brandLogo(language)} alt={label("בואו נשחק", "Let's Play")} className="print-sheet-brand absolute left-0 top-0 h-14 w-16 object-contain" />
        {recipe.cover ? (
          <img src={recipe.cover} alt="" className="h-24 w-24 shrink-0 object-contain" />
        ) : recipe.coverIcon ? (
          <div className="h-24 w-24 shrink-0">
            <recipe.coverIcon />
          </div>
        ) : (
          <span className="text-6xl">{recipe.coverEmoji}</span>
        )}
        <h1 className="text-center text-4xl font-black">{pick(recipe.title, recipe.titleN)}</h1>
      </div>

      {recipe.ingredients?.length ? (
        <div>
          <div className="mb-1 text-xl font-bold">
            {label("מצרכים:", "Ingredients:")} <span className="text-base font-normal">({recipe.amountLabel})</span>
          </div>
          <table className="w-full table-fixed border-collapse border border-black text-base">
            <tbody>
              {recipe.ingredients.map((it, i) => (
                <PrintRow key={i} i={i} icon={iconFor(it)} label={pick(it.text, it.textN)} />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {recipe.tools?.length ? (
        <div>
          <div className="mb-1 text-xl font-bold">{label("כלים:", "Tools:")}</div>
          <table className="w-full table-fixed border-collapse border border-black text-base">
            <tbody>
              {recipe.tools.map((it, i) => (
                <PrintRow key={i} i={i} icon={iconFor(it)} label={pick(it.text, it.textN)} />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {recipe.steps?.length ? (
        <div style={{ breakBefore: "page" }}>
          <div className="mb-1 text-xl font-bold">{label("שלבים:", "Steps:")}</div>
          <table className="w-full table-fixed border-collapse border border-black text-base">
            <tbody>
              {recipe.steps.map((s, i) => (
                <PrintRow key={s.n} i={i} icon={iconFor(s)} label={pick(s.text, s.textN)} />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="mt-6 text-center text-xs text-muted-foreground/70">
        {label("© בואו נשחק — כל הזכויות שמורות. המתכון הודפס לשימוש אישי ומשפחתי/טיפולי בלבד; אין להעתיק, למכור או להפיץ מחדש בלי אישור.", "© Let's Play — All rights reserved. Printed for personal, family, or therapeutic use only. Do not copy, sell, or redistribute without permission.")}
      </div>
    </div>
  );
}

function RecipeDetail({ recipe, mode, onBack }) {
  const { language, t } = useTranslator();
  recipe = translatedRecipe(recipe, language);
  const [amountKey, setAmountKey] = useState(() => mode === "therapist" ? "session" : "full");
  const displayRecipe = recipeForAmount(recipe, amountKey, language);
  const title = recipe.title;
  const { checked, toggle, reset, done, total } = useRecipeChecklist(recipe.id, recipe.steps.length);
  const ingChecklist = useItemsChecklist(`recipe-ing:${recipe.id}`, recipe.ingredients.length);
  const toolChecklist = useItemsChecklist(`recipe-tools:${recipe.id}`, recipe.tools.length);
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const [expandedStep, setExpandedStep] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);
  const [highlightedWords, setHighlightedWords] = useState(() => new Set());
  const toggleWord = (key) => {
    setHighlightedWords((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const nikud = useNikud();
  const handwriting = useHandwriting();
  const pick = (t, tn) => (nikud.on && tn ? tn : t);
  const hwClass = handwriting.on ? "font-handwriting" : "";

  return (
    <AppShell mode={mode}>
      {language === "he" ? <TherapistPostureScissorsTips showScissors={false} /> : null}
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("חזרה למתכונים", "Back to recipes")}
      </button>

      <div className="mb-6 flex h-56 items-center justify-center overflow-hidden rounded-3xl border border-border/40 bg-white md:h-80 print:hidden">
        {recipe.cover ? (
          <div className="flex h-44 w-44 items-center justify-center md:h-64 md:w-64">
            <img src={recipe.cover} alt={t(`תמונה של המתכון ${recipe.title}`, `Illustration for the ${title} recipe`)} title={t(`${recipe.title} — מתכון לילדים מבואו נשחק`, `${title} — a Let's Play recipe for children`)} data-seo-name={t(`${recipe.title} מתכון לילדים`, `${title} recipe for children`)} className="max-h-full max-w-full object-contain" />
          </div>
        ) : recipe.coverIcon ? (
          <div className="h-40 w-40">
            <recipe.coverIcon />
          </div>
        ) : (
          <span className="text-8xl">{recipe.coverEmoji}</span>
        )}
      </div>

      <h1 className="font-display text-4xl font-black md:text-5xl print:hidden">{language === "en" ? title : pick(recipe.title, recipe.titleN)}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-base font-bold hover:bg-muted/70"
        >
          <Printer className="h-4 w-4" /> {t("הדפסה / הורדה", "Print / download")}
        </button>
        {language === "he" && <button
          type="button"
          onClick={nikud.toggle}
          aria-pressed={nikud.on}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-base font-bold transition-colors ${
            nikud.on ? "bg-sage text-sage-foreground" : "bg-muted hover:bg-muted/70"
          }`}
        >
          אָ ניקוד {nikud.on ? "פעיל" : "כבוי"}
        </button>}
        {language === "he" && <button
          type="button"
          onClick={handwriting.toggle}
          aria-pressed={handwriting.on}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-base font-bold transition-colors ${
            handwriting.on ? "bg-sage text-sage-foreground" : "bg-muted hover:bg-muted/70"
          }`}
        >
          ✏️ כתב יד {handwriting.on ? "פעיל" : "כבוי"}
        </button>}
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-base text-muted-foreground">
          <Clock className="h-4 w-4" /> {recipe.duration}
        </span>
        <label className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-base font-bold">
          <span>{t("כמות", "Batch size")}</span>
          <select
            value={amountKey}
            onChange={(event) => setAmountKey(event.target.value)}
            className="rounded-full border border-border bg-background px-2 py-1 text-sm font-semibold outline-none focus:ring-2 focus:ring-sage"
            aria-label={t("בחירת כמות למתכון", "Choose recipe batch size")}
          >
            {Object.entries(RECIPE_AMOUNT_OPTIONS).map(([key, option]) => (
              <option key={key} value={key}>{language === "en" ? option.en : option.he}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 print:hidden">
        <section className="rounded-3xl border border-border/60 bg-card p-5">
          <h2 className="mb-3 font-display text-xl font-bold">
            {t("מצרכים", "Ingredients")} <span className="text-sm font-normal text-muted-foreground">· {ingChecklist.done}/{ingChecklist.total}</span>
          </h2>
          <div className="space-y-1.5">
            {displayRecipe.ingredients.map((it, i) => (
              <IconChip
                key={it.text}
                item={it}
                label={pick(it.text, it.textN)}
                checked={ingChecklist.checked.has(i)}
                onToggle={() => ingChecklist.toggle(i)}
                expanded={expandedItem === `ingredient-${i}`}
                onExpand={() => setExpandedItem((current) => (current === `ingredient-${i}` ? null : `ingredient-${i}`))}
                hwClass={hwClass}
              />
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-border/60 bg-card p-5">
          <h2 className="mb-3 font-display text-xl font-bold">
            {t("כלים", "Tools")} <span className="text-sm font-normal text-muted-foreground">· {toolChecklist.done}/{toolChecklist.total}</span>
          </h2>
          <div className="space-y-1.5">
            {recipe.tools.map((it, i) => (
              <IconChip
                key={it.text}
                item={it}
                label={pick(it.text, it.textN)}
                checked={toolChecklist.checked.has(i)}
                onToggle={() => toolChecklist.toggle(i)}
                expanded={expandedItem === `tool-${i}`}
                onExpand={() => setExpandedItem((current) => (current === `tool-${i}` ? null : `tool-${i}`))}
                hwClass={hwClass}
              />
            ))}
          </div>
        </section>
      </div>

      <section className="mt-4 rounded-3xl border border-border/60 bg-card p-4 md:p-5 print:hidden">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold">{t("שלבי ההכנה", "Preparation steps")}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t("סמני כל שלב לאחר ביצועו · לחצו על שלב כדי להגדיל · לחצו על מילה כדי לסמן אותה", "Mark each step when complete · Select a step to enlarge it · Select a word to highlight it")} · {done}/{total}
            </p>
          </div>
          {done > 0 && (
            <Button variant="ghost" size="sm" onClick={reset} className="rounded-full text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5" /> {t("אפס", "Reset")}
            </Button>
          )}
        </div>
        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-sage transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <ol className="space-y-1.5">
          {recipe.steps.map((s) => {
            const isChecked = checked.has(s.n);
            const isExpanded = expandedStep === s.n;
            return (
              <li
                key={s.n}
                className={`relative flex items-center gap-2 rounded-2xl border p-2 transition-all duration-300 print:scale-100 print:shadow-none ${
                  isExpanded
                    ? "z-10 scale-[1.02] border-sky/80 bg-sky/10 shadow-lg"
                    : isChecked
                      ? "border-sage/60 bg-sage/10"
                      : "border-border/60 bg-background"
                }`}
              >
                <Checkbox
                  id={`rstep-${s.n}`}
                  checked={isChecked}
                  onCheckedChange={() => toggle(s.n)}
                  aria-label={t(`סימון שלב ${s.n} כהושלם`, `Mark step ${s.n} as complete`)}
                  className="h-5 w-5 shrink-0 print:hidden"
                />
                <button
                  type="button"
                  onClick={() => setExpandedStep((current) => (current === s.n ? null : s.n))}
                  aria-pressed={isExpanded}
                  className={`flex min-w-0 flex-1 cursor-zoom-in items-center gap-3 text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky ${
                    isExpanded ? "flex-col sm:flex-row" : ""
                  }`}
                >
                  <span
                    aria-hidden
                    className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted transition-all duration-300 ${
                      isExpanded ? "h-36 w-36 md:h-44 md:w-44 print:h-16 print:w-16" : "h-16 w-16"
                    }`}
                  >
                    {s.img ? (
                      <img src={s.img} alt={t(`איור שלב ${s.n}`, `Illustration for step ${s.n}`)} title={t(`שלב ${s.n} במתכון ${recipe.title}`, `Step ${s.n} of ${title}`)} className="h-full w-full object-cover" />
                    ) : s.icon ? (
                      <s.icon />
                    ) : (
                      <span className="text-4xl">{s.emoji}</span>
                    )}
                  </span>
                  <span
                    className={`min-w-0 flex-1 leading-relaxed transition-all duration-300 ${
                      isExpanded ? "text-xl md:text-2xl" : "text-lg md:text-xl"
                    } ${isChecked ? "text-muted-foreground line-through" : ""} ${hwClass}`}
                  >
                    <span className="me-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-sage/70 align-middle text-sm font-bold text-sage-foreground">
                      {s.n}
                    </span>
                    <HighlightableText
                      text={pick(s.text, s.textN)}
                      stepKey={s.n}
                      highlighted={highlightedWords}
                      onToggle={toggleWord}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <RecipePrintSheet recipe={displayRecipe} pick={pick} language={language} />
    </AppShell>
  );
}

function IconChip({ item, label, checked, onToggle, expanded, onExpand, hwClass = "" }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle?.();
        }
      }}
      className={`relative flex w-full cursor-pointer items-center gap-2 rounded-xl border px-2 py-2 text-right transition-all duration-300 ${
        expanded ? "pb-3 shadow-md" : ""
      } ${
        checked ? "border-sage/60 bg-sage/10" : "border-border/60 bg-background"
      }`}
    >
      <span className="shrink-0" onClick={(event) => event.stopPropagation()}>
        <Checkbox
          checked={!!checked}
          onCheckedChange={() => onToggle?.()}
          aria-label={`סימון ${label ?? item.text}`}
          className="h-5 w-5"
        />
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onExpand?.();
        }}
        aria-label={`${expanded ? "הקטנת" : "הגדלת"} ${label ?? item.text}`}
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted transition-all duration-300 ${
          expanded ? "h-28 w-28 cursor-zoom-out md:h-32 md:w-32" : "h-16 w-16 cursor-zoom-in"
        }`}
      >
        {item.img ? (
          <img src={item.img} alt="" className="h-full w-full object-contain p-1" />
        ) : item.icon ? (
          <item.icon />
        ) : (
          <span className="text-4xl">{item.emoji}</span>
        )}
      </button>
      <span className={`min-w-0 flex-1 text-xl leading-relaxed ${expanded ? "pe-9" : ""} ${checked ? "text-muted-foreground line-through" : ""} ${hwClass}`}>{label ?? item.text}</span>
      {expanded && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onExpand?.();
          }}
          aria-label={`סגירת ההגדלה של ${label ?? item.text}`}
          className="absolute left-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
