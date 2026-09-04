const BASE = "/icon-bank/morning-routine";
const GIRLS = `${BASE}/girls`;

/** Illustration sets a parent/therapist can choose between, so the board can look like their child. */
export const CHARACTERS = [
  { id: "boy-1", gender: "boy", avatar: `${BASE}/boy-avatar.webp` },
  { id: "boy-2", gender: "boy", avatar: `${BASE}/boy2-avatar.webp` },
  { id: "boy-3", gender: "boy", avatar: `${BASE}/boy3-avatar.webp` },
  { id: "girl-black", gender: "girl", avatar: `${GIRLS}/black-avatar.webp`, name: "שיער שחור" },
  { id: "girl-brown", gender: "girl", avatar: `${GIRLS}/brown-avatar.webp`, name: "שיער חום מתולתל" },
  { id: "girl-blonde", gender: "girl", avatar: `${GIRLS}/blonde-avatar.webp`, name: "שיער בלונדיני" },
  { id: "girl-african", gender: "girl", avatar: `${GIRLS}/african-avatar.webp`, name: "עור כהה ושיער מתולתל" },
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
    images: { "boy-3": `${BASE}/boy3-wake.webp`, "girl-black": `${GIRLS}/black-wake.webp`, "girl-brown": `${GIRLS}/brown-wake.webp`, "girl-blonde": `${GIRLS}/blonde-wake.webp`, "girl-african": `${GIRLS}/african-wake.webp`, "boy-1": `${BASE}/boy-wake.webp`, "boy-2": `${BASE}/boy2-wake.webp` },
  },
  {
    id: "diaper",
    labelGirl: "אני מחליפה חיתול",
    labelBoy: "אני מחליף חיתול",
    images: { "boy-3": `${BASE}/boy3-diaper.webp`, "girl-black": `${GIRLS}/black-diaper.webp`, "girl-brown": `${GIRLS}/brown-diaper.webp`, "girl-blonde": `${GIRLS}/blonde-diaper.webp`, "girl-african": `${GIRLS}/african-diaper.webp`, "boy-1": `${BASE}/boy-diaper.webp`, "boy-2": `${BASE}/boy2-diaper.webp` },
  },
  {
    id: "wash-face",
    labelGirl: "אני שוטפת פנים",
    labelBoy: "אני שוטף פנים",
    images: { "boy-3": `${BASE}/boy3-wash-face.webp`, "girl-black": `${GIRLS}/black-wash-face.webp`, "girl-brown": `${GIRLS}/brown-wash-face.webp`, "girl-blonde": `${GIRLS}/blonde-wash-face.webp`, "girl-african": `${GIRLS}/african-wash-face.webp`, "boy-1": `${BASE}/boy-wash-face.webp`, "boy-2": `${BASE}/boy2-wash-face.webp` },
  },
  {
    id: "teeth",
    labelGirl: "אני מצחצחת שיניים",
    labelBoy: "אני מצחצח שיניים",
    images: { "boy-3": `${BASE}/boy3-teeth.webp`, "girl-black": `${GIRLS}/black-teeth.webp`, "girl-brown": `${GIRLS}/brown-teeth.webp`, "girl-blonde": `${GIRLS}/blonde-teeth.webp`, "girl-african": `${GIRLS}/african-teeth.webp`, "boy-1": `${BASE}/boy-teeth.webp`, "boy-2": `${BASE}/boy2-teeth.webp` },
  },
  {
    id: "hair",
    labelGirl: "אני מסדרת את השיער",
    labelBoy: "אני מסדר את השיער",
    images: {
      "boy-1": `${BASE}/boy-hair.webp`,
      "boy-3": `${BASE}/boy3-hair.webp`,
      "girl-black": `${GIRLS}/black-hair.webp`,
      "girl-brown": `${GIRLS}/brown-hair.webp`,
      "girl-blonde": `${GIRLS}/blonde-hair.webp`,
      "girl-african": `${GIRLS}/african-hair.webp`,
      "boy-2": `${BASE}/boy2-hair.webp`,
    },
  },
  {
    id: "dressed",
    labelGirl: "אני מתלבשת",
    labelBoy: "אני מתלבש",
    images: {
      "girl-black": `${GIRLS}/black-dressed.webp`,
      "girl-brown": `${GIRLS}/brown-dressed.webp`,
      "girl-blonde": `${GIRLS}/blonde-dressed.webp`,
      "girl-african": `${GIRLS}/black-dressed.webp`,
      "boy-1": `${BASE}/boy-dressed.webp`,
      "boy-2": `${BASE}/boy2-dressed.webp`,
      "boy-3": `${BASE}/boy-dressed.webp`,
    },
  },
  {
    id: "shoes",
    labelGirl: "אני נועלת נעליים",
    labelBoy: "אני נועל נעליים",
    images: {
      "girl-black": `${GIRLS}/black-shoes.webp`,
      "girl-brown": `${GIRLS}/brown-shoes.webp`,
      "girl-blonde": `${GIRLS}/blonde-shoes.webp`,
      "girl-african": `${GIRLS}/black-shoes.webp`,
      "boy-1": `${BASE}/boy-shoes.webp`,
      "boy-2": `${BASE}/boy-shoes.webp`,
      "boy-3": `${BASE}/boy-shoes.webp`,
    },
  },
  {
    id: "breakfast",
    labelGirl: "אני אוכלת ארוחת בוקר",
    labelBoy: "אני אוכל ארוחת בוקר",
    images: {
      "girl-black": `${GIRLS}/black-breakfast.webp`,
      "girl-brown": `${GIRLS}/brown-breakfast.webp`,
      "girl-blonde": `${GIRLS}/blonde-breakfast.webp`,
      "girl-african": `${GIRLS}/black-breakfast.webp`,
      "boy-1": `${BASE}/boy-breakfast.webp`,
      "boy-2": `${BASE}/boy-breakfast.webp`,
      "boy-3": `${BASE}/boy-breakfast.webp`,
    },
  },
  {
    id: "toilet",
    labelGirl: "אני הולכת לשירותים",
    labelBoy: "אני הולך לשירותים",
    images: { "boy-3": `${BASE}/boy3-toilet.webp`, "girl-black": `${GIRLS}/black-toilet.webp`, "girl-brown": `${GIRLS}/brown-toilet.webp`, "girl-blonde": `${GIRLS}/blonde-toilet.webp`, "girl-african": `${GIRLS}/african-toilet.webp`, "boy-1": `${BASE}/boy-toilet.webp`, "boy-2": `${BASE}/boy2-toilet.webp` },
  },
  {
    id: "leave-house",
    labelGirl: "אני יוצאת מהבית",
    labelBoy: "אני יוצא מהבית",
    images: { "boy-3": `${BASE}/boy3-leave-house.webp`,
      "girl-black": `${GIRLS}/black-leave-house.webp`,
      "girl-brown": `${GIRLS}/brown-leave-house.webp`,
      "girl-blonde": `${GIRLS}/blonde-leave-house.webp`,
      "girl-african": `${GIRLS}/african-leave-house.webp`,
      "boy-1": `${BASE}/boy-leave-house.webp`,
      "boy-2": `${BASE}/boy2-leave-house.webp`,
    },
  },
];

export function labelForStep(step, gender) {
  return gender === "girl" ? step.labelGirl : step.labelBoy;
}

export function imageForStep(step, characterId) {
  return step.images?.[characterId] ?? null;
}

/** Builds the shareable child-view URL for a given gender + character + ordered list of step ids. */
export function buildChildRoutineUrl(gender, characterId, order) {
  const params = new URLSearchParams();
  params.set("g", gender);
  params.set("c", characterId);
  params.set("s", order.join(","));
  return `${window.location.origin}/child/morning-routine?${params.toString()}`;
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
