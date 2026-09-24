import {
  CHARACTERS,
  MORNING_ROUTINE_STEPS,
  charactersForGender,
  imageForStep,
  labelForStep,
} from "@/lib/morning-routine-steps";

const sourceStep = (id) => MORNING_ROUTINE_STEPS.find((step) => step.id === id);
const eveningStep = (id, sourceId, labelGirl, labelBoy, images = {}) => ({
  id,
  labelGirl,
  labelBoy,
  images: { ...(sourceStep(sourceId)?.images ?? {}), ...images },
});

// The evening board deliberately uses the very same character sets and illustration
// language as the morning board, so a child sees one consistent visual character.
export const EVENING_ROUTINE_STEPS = [
  {
    id: "dinner",
    labelGirl: "אני אוכלת ארוחת ערב",
    labelBoy: "אני אוכל ארוחת ערב",
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
    id: "tidy",
    labelGirl: "אני מסדרת את המשחקים",
    labelBoy: "אני מסדר את המשחקים",
    images: {
      "boy-red": "/icon-bank/evening-routine/boys/red/tidy.png",
      "girl-red": "/icon-bank/evening-routine/girls/red/tidy.png",
      "girl-curly-light": "/icon-bank/evening-routine/girls/curly-light/tidy.png",
      "boy-asian": "/icon-bank/evening-routine/boys/asian/tidy.png",
      "girl-asian": "/icon-bank/evening-routine/girls/asian/tidy.png",
      "boy-1": "/icon-bank/evening-routine/boys/boy-1/tidy.png",
      "boy-3": "/icon-bank/evening-routine/boys/boy-3/tidy.png",
      "girl-black": "/icon-bank/evening-routine/girls/black/tidy.png",
      "girl-brown": "/icon-bank/evening-routine/girls/brown/tidy.png",
      "girl-blonde": "/icon-bank/evening-routine/girls/blonde/tidy.png",
      "girl-african": "/icon-bank/evening-routine/girls/african/tidy.png",
      "boy-2": "/icon-bank/evening-routine/boys/boy-2/tidy.png",
    },
  },
  {
    id: "bath",
    labelGirl: "אני מתרחצת",
    labelBoy: "אני מתרחץ",
    images: {
      "boy-asian": "/icon-bank/evening-routine/boys/asian/bath.png",
      "girl-asian": "/icon-bank/evening-routine/girls/asian/bath.png",
      "boy-red": "/icon-bank/evening-routine/boys/red/bath.png",
      "girl-red": "/icon-bank/evening-routine/girls/red/bath.png",
      "girl-curly-light": "/icon-bank/evening-routine/girls/curly-light/bath.png",
      "boy-3": "/icon-bank/evening-routine/boys/boy-3/bath.png",
      "girl-black": "/icon-bank/evening-routine/girls/black/bath.png",
      "girl-brown": "/icon-bank/evening-routine/girls/brown/bath.png",
      "girl-blonde": "/icon-bank/evening-routine/girls/blonde/bath.png",
      "girl-african": "/icon-bank/evening-routine/girls/african/bath.png",
      "boy-1": "/icon-bank/evening-routine/boys/boy-1/bath.png",
      "boy-2": "/icon-bank/evening-routine/boys/boy-2/bath.png",
    },
  },
  {
    id: "pajamas",
    labelGirl: "אני לובשת פיג׳מה",
    labelBoy: "אני לובש פיג׳מה",
    images: {
      "boy-red": "/icon-bank/evening-routine/boys/red/pajamas.png",
      "girl-red": "/icon-bank/evening-routine/girls/red/pajamas.png",
      "girl-curly-light": "/icon-bank/evening-routine/girls/curly-light/pajamas.png",
      "boy-asian": "/icon-bank/evening-routine/boys/asian/pajamas.png",
      "girl-asian": "/icon-bank/evening-routine/girls/asian/pajamas.png",
      "girl-black": "/icon-bank/evening-routine/girls/black/pajamas.png",
      "girl-brown": "/icon-bank/evening-routine/girls/brown/pajamas-v2.png",
      "girl-blonde": "/icon-bank/evening-routine/girls/blonde/pajamas.png",
      "girl-african": "/icon-bank/evening-routine/girls/african/pajamas.png",
      "boy-1": "/icon-bank/evening-routine/boys/boy-1/pajamas.png",
      "boy-2": "/icon-bank/evening-routine/boys/boy-2/pajamas.png",
      "boy-3": "/icon-bank/evening-routine/boys/boy-3/pajamas.png",
    },
  },
  {
    id: "teeth",
    labelGirl: "אני מצחצחת שיניים",
    labelBoy: "אני מצחצח שיניים",
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
    id: "toilet",
    labelGirl: "אני הולכת לשירותים",
    labelBoy: "אני הולך לשירותים",
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
    id: "diaper",
    labelGirl: "אני מחליפה חיתול",
    labelBoy: "אני מחליף חיתול",
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
    id: "bed",
    labelGirl: "אני נכנסת למיטה",
    labelBoy: "אני נכנס למיטה",
    images: {
      "boy-asian": "/icon-bank/evening-routine/boys/asian/bed.png",
      "girl-asian": "/icon-bank/evening-routine/girls/asian/bed.png",
      "boy-red": "/icon-bank/evening-routine/boys/red/bed.png",
      "girl-red": "/icon-bank/evening-routine/girls/red/bed.png",
      "girl-curly-light": "/icon-bank/evening-routine/girls/curly-light/bed.png",
      "boy-3": "/icon-bank/evening-routine/boys/boy-3/bed.png",
      "girl-black": "/icon-bank/evening-routine/girls/black/bed.png",
      "girl-brown": "/icon-bank/evening-routine/girls/brown/bed.png",
      "girl-blonde": "/icon-bank/evening-routine/girls/blonde/bed.png",
      "girl-african": "/icon-bank/evening-routine/girls/african/bed.png",
      "boy-1": "/icon-bank/evening-routine/boys/boy-1/bed.png",
      "boy-2": "/icon-bank/evening-routine/boys/boy-2/bed.png",
    },
  },
];

export { CHARACTERS, charactersForGender, imageForStep, labelForStep };

export function buildChildEveningRoutineUrl(gender, characterId, order) {
  const params = new URLSearchParams();
  params.set("g", gender);
  params.set("c", characterId);
  params.set("s", order.join(","));
  return `${window.location.origin}/child/evening-routine?${params.toString()}`;
}

export function parseChildEveningRoutineParams(searchParams) {
  const gender = searchParams.get("g") === "boy" ? "boy" : "girl";
  const requestedCharacter = searchParams.get("c");
  const validCharacter = CHARACTERS.find((c) => c.id === requestedCharacter && c.gender === gender);
  const characterId = validCharacter ? validCharacter.id : (charactersForGender(gender)[0]?.id ?? null);
  const ids = (searchParams.get("s") || "").split(",").filter(Boolean);
  const steps = ids
    .map((id) => EVENING_ROUTINE_STEPS.find((step) => step.id === id))
    .filter((step) => step && imageForStep(step, characterId));
  return { gender, characterId, steps };
}
