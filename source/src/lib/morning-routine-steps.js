const BASE = "/icon-bank/morning-routine";
const GIRLS = `${BASE}/girls`;

/** Illustration sets a parent/therapist can choose between, so the board can look like their child. */
export const CHARACTERS = [
  { id: "boy-1", gender: "boy", avatar: "/icon-bank/morning-routine/boy-avatar.webp" },
  { id: "boy-2", gender: "boy", avatar: "/icon-bank/morning-routine/boy2-avatar.webp" },
  { id: "boy-3", gender: "boy", avatar: "/icon-bank/morning-routine/boy3-avatar.webp" },
  { id: "boy-red", gender: "boy", avatar: "/icon-bank/morning-routine/boys/red/avatar.png", name: "שיער ג׳ינג׳י" },
  { id: "boy-asian", gender: "boy", avatar: "/icon-bank/morning-routine/boys/asian/avatar.png", name: "דמות אסייתית" },
  { id: "girl-black", gender: "girl", avatar: "/icon-bank/morning-routine/girls/black-avatar.webp", name: "שיער שחור" },
  {
    id: "girl-brown",
    gender: "girl",
    avatar: "/icon-bank/morning-routine/girls/brown-avatar.webp",
    name: "שיער חום מתולתל",
  },
  {
    id: "girl-blonde",
    gender: "girl",
    avatar: "/icon-bank/morning-routine/girls/blonde-avatar.webp",
    name: "שיער בלונדיני",
  },
  {
    id: "girl-african",
    gender: "girl",
    avatar: "/icon-bank/morning-routine/girls/african-avatar.webp",
    name: "עור כהה ושיער מתולתל",
  },
  {
    id: "girl-curly-light",
    gender: "girl",
    avatar: "/icon-bank/morning-routine/girls/curly-light/avatar.png",
    name: "עור בהיר ושיער מתולתל",
  },
  { id: "girl-red", gender: "girl", avatar: "/icon-bank/morning-routine/girls/red/avatar.png", name: "שיער ג׳ינג׳י" },
  {
    id: "girl-asian",
    gender: "girl",
    avatar: "/icon-bank/morning-routine/girls/asian/avatar.png",
    name: "דמות אסייתית",
  },
];

export function charactersForGender(gender) {
  return CHARACTERS.filter((c) => c.gender === gender);
}

/**
 * Each step lists an image per character id (only where that illustration set actually
 * covers this step - not every character has every step drawn).
 */
export const MORNING_ROUTINE_STEPS = [
  {
    id: "wake",
    labelGirl: "אני קמה מהמיטה",
    labelBoy: "אני קם מהמיטה",
    labelEn: "I get out of bed",
    images: {
      "boy-asian": "/icon-bank/morning-routine/boys/asian/wake.png",
      "girl-asian": "/icon-bank/morning-routine/girls/asian/wake.png",
      "boy-red": "/icon-bank/morning-routine/boys/red/wake.png",
      "girl-red": "/icon-bank/morning-routine/girls/red/wake.png",
      "girl-curly-light": "/icon-bank/morning-routine/girls/curly-light/wake.png",
      "boy-3": "/icon-bank/morning-routine/boy3-wake.webp",
      "girl-black": "/icon-bank/morning-routine/girls/black-wake.webp",
      "girl-brown": "/icon-bank/morning-routine/girls/brown-wake.webp",
      "girl-blonde": "/icon-bank/morning-routine/girls/blonde-wake.webp",
      "girl-african": "/icon-bank/morning-routine/girls/african-wake.webp",
      "boy-1": "/icon-bank/morning-routine/boy-wake.webp",
      "boy-2": "/icon-bank/morning-routine/boy2-wake.webp",
    },
  },
  {
    id: "diaper",
    labelGirl: "אני מחליפה חיתול",
    labelBoy: "אני מחליף חיתול",
    labelEn: "I change my diaper",
    images: {
      "boy-asian": "/icon-bank/morning-routine/boys/asian/diaper.png",
      "girl-asian": "/icon-bank/morning-routine/girls/asian/diaper.png",
      "boy-red": "/icon-bank/morning-routine/boys/red/diaper.png",
      "girl-red": "/icon-bank/morning-routine/girls/red/diaper.png",
      "girl-curly-light": "/icon-bank/morning-routine/girls/curly-light/diaper.png",
      "boy-3": "/icon-bank/morning-routine/boy3-diaper.webp",
      "girl-black": "/icon-bank/morning-routine/girls/black-diaper.webp",
      "girl-brown": "/icon-bank/morning-routine/girls/brown-diaper.webp",
      "girl-blonde": "/icon-bank/morning-routine/girls/blonde-diaper.webp",
      "girl-african": "/icon-bank/morning-routine/girls/african-diaper.webp",
      "boy-1": "/icon-bank/morning-routine/boy-diaper.webp",
      "boy-2": "/icon-bank/morning-routine/boy2-diaper.webp",
    },
  },
  {
    id: "wash-face",
    labelGirl: "אני שוטפת פנים",
    labelBoy: "אני שוטף פנים",
    labelEn: "I wash my face",
    images: {
      "boy-asian": "/icon-bank/morning-routine/boys/asian/wash-face.png",
      "girl-asian": "/icon-bank/morning-routine/girls/asian/wash-face.png",
      "boy-red": "/icon-bank/morning-routine/boys/red/wash-face.png",
      "girl-red": "/icon-bank/morning-routine/girls/red/wash-face.png",
      "girl-curly-light": "/icon-bank/morning-routine/girls/curly-light/wash-face.png",
      "boy-3": "/icon-bank/morning-routine/boy3-wash-face.webp",
      "girl-black": "/icon-bank/morning-routine/girls/black-wash-face.webp",
      "girl-brown": "/icon-bank/morning-routine/girls/brown-wash-face.webp",
      "girl-blonde": "/icon-bank/morning-routine/girls/blonde-wash-face.webp",
      "girl-african": "/icon-bank/morning-routine/girls/african-wash-face.webp",
      "boy-1": "/icon-bank/morning-routine/boy-wash-face.webp",
      "boy-2": "/icon-bank/morning-routine/boy2-wash-face.webp",
    },
  },
  {
    id: "teeth",
    labelGirl: "אני מצחצחת שיניים",
    labelBoy: "אני מצחצח שיניים",
    labelEn: "I brush my teeth",
    images: {
      "boy-asian": "/icon-bank/morning-routine/boys/asian/teeth.png",
      "girl-asian": "/icon-bank/morning-routine/girls/asian/teeth.png",
      "boy-red": "/icon-bank/morning-routine/boys/red/teeth.png",
      "girl-red": "/icon-bank/morning-routine/girls/red/teeth.png",
      "girl-curly-light": "/icon-bank/morning-routine/girls/curly-light/teeth.png",
      "boy-3": "/icon-bank/morning-routine/boy3-teeth.webp",
      "girl-black": "/icon-bank/morning-routine/girls/black-teeth.webp",
      "girl-brown": "/icon-bank/morning-routine/girls/brown-teeth.webp",
      "girl-blonde": "/icon-bank/morning-routine/girls/blonde-teeth.webp",
      "girl-african": "/icon-bank/morning-routine/girls/african-teeth.webp",
      "boy-1": "/icon-bank/morning-routine/boy-teeth.webp",
      "boy-2": "/icon-bank/morning-routine/boy2-teeth.webp",
    },
  },
  {
    id: "hair",
    labelGirl: "אני מסדרת את השיער",
    labelBoy: "אני מסדר את השיער",
    labelEn: "I do my hair",
    images: {
      "boy-red": "/icon-bank/morning-routine/boys/red/hair.png",
      "girl-red": "/icon-bank/morning-routine/girls/red/hair.png",
      "girl-curly-light": "/icon-bank/morning-routine/girls/curly-light/hair.png",
      "boy-asian": "/icon-bank/morning-routine/boys/asian/hair.png",
      "girl-asian": "/icon-bank/morning-routine/girls/asian/hair.png",
      "boy-1": "/icon-bank/morning-routine/boy-hair.webp",
      "boy-3": "/icon-bank/morning-routine/boy3-hair.webp",
      "girl-black": "/icon-bank/morning-routine/girls/black-hair.webp",
      "girl-brown": "/icon-bank/morning-routine/girls/brown-hair.webp",
      "girl-blonde": "/icon-bank/morning-routine/girls/blonde-hair.webp",
      "girl-african": "/icon-bank/morning-routine/girls/african-hair.webp",
      "boy-2": "/icon-bank/morning-routine/boy2-hair.webp",
    },
  },
  {
    id: "dressed",
    labelGirl: "אני מתלבשת",
    labelBoy: "אני מתלבש",
    labelEn: "I get dressed",
    images: {
      "boy-red": "/icon-bank/morning-routine/boy-dressed.webp",
      "girl-red": "/icon-bank/morning-routine/girls/brown-dressed.webp",
      "girl-curly-light": "/icon-bank/morning-routine/girls/black-dressed.webp",
      "boy-asian": "/icon-bank/morning-routine/boy-dressed.webp",
      "girl-asian": "/icon-bank/morning-routine/girls/black-dressed.webp",
      "girl-black": "/icon-bank/morning-routine/girls/black-dressed.webp",
      "girl-brown": "/icon-bank/morning-routine/girls/brown-dressed.webp",
      "girl-blonde": "/icon-bank/morning-routine/girls/blonde-dressed.webp",
      "girl-african": "/icon-bank/morning-routine/girls/black-dressed.webp",
      "boy-1": "/icon-bank/morning-routine/boy-dressed.webp",
      "boy-2": "/icon-bank/morning-routine/boy2-dressed.webp",
      "boy-3": "/icon-bank/morning-routine/boy-dressed.webp",
    },
  },
  {
    id: "shoes",
    labelGirl: "אני נועלת נעליים",
    labelBoy: "אני נועל נעליים",
    labelEn: "I put on my shoes",
    images: {
      "boy-red": "/icon-bank/morning-routine/boy-shoes.webp",
      "girl-red": "/icon-bank/morning-routine/girls/brown-shoes.webp",
      "girl-curly-light": "/icon-bank/morning-routine/girls/black-shoes.webp",
      "boy-asian": "/icon-bank/morning-routine/boy-shoes.webp",
      "girl-asian": "/icon-bank/morning-routine/girls/black-shoes.webp",
      "girl-black": "/icon-bank/morning-routine/girls/black-shoes.webp",
      "girl-brown": "/icon-bank/morning-routine/girls/brown-shoes.webp",
      "girl-blonde": "/icon-bank/morning-routine/girls/blonde-shoes.webp",
      "girl-african": "/icon-bank/morning-routine/girls/black-shoes.webp",
      "boy-1": "/icon-bank/morning-routine/boy-shoes.webp",
      "boy-2": "/icon-bank/morning-routine/boy-shoes.webp",
      "boy-3": "/icon-bank/morning-routine/boy-shoes.webp",
    },
  },
  {
    id: "breakfast",
    labelGirl: "אני אוכלת ארוחת בוקר",
    labelBoy: "אני אוכל ארוחת בוקר",
    labelEn: "I eat breakfast",
    images: {
      "boy-red": "/icon-bank/morning-routine/boy-breakfast.webp",
      "girl-red": "/icon-bank/morning-routine/girls/brown-breakfast.webp",
      "girl-curly-light": "/icon-bank/morning-routine/girls/black-breakfast.webp",
      "boy-asian": "/icon-bank/morning-routine/boy-breakfast.webp",
      "girl-asian": "/icon-bank/morning-routine/girls/black-breakfast.webp",
      "girl-black": "/icon-bank/morning-routine/girls/black-breakfast.webp",
      "girl-brown": "/icon-bank/morning-routine/girls/brown-breakfast.webp",
      "girl-blonde": "/icon-bank/morning-routine/girls/blonde-breakfast.webp",
      "girl-african": "/icon-bank/morning-routine/girls/black-breakfast.webp",
      "boy-1": "/icon-bank/morning-routine/boy-breakfast.webp",
      "boy-2": "/icon-bank/morning-routine/boy-breakfast.webp",
      "boy-3": "/icon-bank/morning-routine/boy-breakfast.webp",
    },
  },
  {
    id: "toilet",
    labelGirl: "אני הולכת לשירותים",
    labelBoy: "אני הולך לשירותים",
    labelEn: "I go to the bathroom",
    images: {
      "boy-asian": "/icon-bank/morning-routine/boys/asian/toilet.png",
      "girl-asian": "/icon-bank/morning-routine/girls/asian/toilet.png",
      "boy-red": "/icon-bank/morning-routine/boys/red/toilet.png",
      "girl-red": "/icon-bank/morning-routine/girls/red/toilet.png",
      "girl-curly-light": "/icon-bank/morning-routine/girls/curly-light/toilet.png",
      "boy-3": "/icon-bank/morning-routine/boy3-toilet.webp",
      "girl-black": "/icon-bank/morning-routine/girls/black-toilet.webp",
      "girl-brown": "/icon-bank/morning-routine/girls/brown-toilet.webp",
      "girl-blonde": "/icon-bank/morning-routine/girls/blonde-toilet.webp",
      "girl-african": "/icon-bank/morning-routine/girls/african-toilet.webp",
      "boy-1": "/icon-bank/morning-routine/boy-toilet.webp",
      "boy-2": "/icon-bank/morning-routine/boy2-toilet.webp",
    },
  },
  {
    id: "leave-house",
    labelGirl: "אני יוצאת מהבית",
    labelBoy: "אני יוצא מהבית",
    labelEn: "I leave home",
    images: {
      "boy-asian": "/icon-bank/morning-routine/boys/asian/leave-house.png",
      "girl-asian": "/icon-bank/morning-routine/girls/asian/leave-house.png",
      "boy-red": "/icon-bank/morning-routine/boys/red/leave-house.png",
      "girl-red": "/icon-bank/morning-routine/girls/red/leave-house.png",
      "girl-curly-light": "/icon-bank/morning-routine/girls/curly-light/leave-house.png",
      "boy-3": "/icon-bank/morning-routine/boy3-leave-house.webp",
      "girl-black": "/icon-bank/morning-routine/girls/black-leave-house.webp",
      "girl-brown": "/icon-bank/morning-routine/girls/brown-leave-house.webp",
      "girl-blonde": "/icon-bank/morning-routine/girls/blonde-leave-house.webp",
      "girl-african": "/icon-bank/morning-routine/girls/african-leave-house.webp",
      "boy-1": "/icon-bank/morning-routine/boy-leave-house.webp",
      "boy-2": "/icon-bank/morning-routine/boy2-leave-house.webp",
    },
  },
];

export function labelForStep(step, gender, language = "he") {
  if (language === "en") return step.labelEn;
  return gender === "girl" ? step.labelGirl : step.labelBoy;
}

export function imageForStep(step, characterId) {
  return step.images?.[characterId] ?? null;
}

/** Builds the shareable child-view URL for a given gender + character + ordered list of step ids. */
export function buildChildRoutineUrl(gender, characterId, order, language = "he") {
  const params = new URLSearchParams();
  params.set("g", gender);
  params.set("c", characterId);
  params.set("s", order.join(","));
  return `${window.location.origin}${language === "en" ? "/en" : ""}/child/morning-routine?${params.toString()}`;
}

/** Parses gender + character + ordered step list from URL search params. Returns [] for steps if invalid/missing. */
export function parseChildRoutineParams(searchParams) {
  const gender = searchParams.get("g") === "boy" ? "boy" : "girl";
  const requestedCharacter = searchParams.get("c");
  const validCharacter = CHARACTERS.find((c) => c.id === requestedCharacter && c.gender === gender);
  const characterId = validCharacter ? validCharacter.id : (charactersForGender(gender)[0]?.id ?? null);

  const idsRaw = searchParams.get("s") || "";
  const ids = idsRaw.split(",").filter(Boolean);
  const steps = ids
    .map((id) => MORNING_ROUTINE_STEPS.find((s) => s.id === id))
    .filter((s) => s && imageForStep(s, characterId));
  return { gender, characterId, steps };
}
