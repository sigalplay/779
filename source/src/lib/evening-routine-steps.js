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
    labelEn: "I eat dinner",
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
    labelEn: "I tidy my toys",
    images: {
      "boy-red": "/icon-bank/evening-routine/boys/red/tidy.webp",
      "girl-red": "/icon-bank/evening-routine/girls/red/tidy.webp",
      "girl-curly-light": "/icon-bank/evening-routine/girls/curly-light/tidy.webp",
      "boy-asian": "/icon-bank/evening-routine/boys/asian/tidy.webp",
      "girl-asian": "/icon-bank/evening-routine/girls/asian/tidy.webp",
      "boy-1": "/icon-bank/evening-routine/boys/boy-1/tidy.webp",
      "boy-3": "/icon-bank/evening-routine/boys/boy-3/tidy.webp",
      "girl-black": "/icon-bank/evening-routine/girls/black/tidy.webp",
      "girl-brown": "/icon-bank/evening-routine/girls/brown/tidy.webp",
      "girl-blonde": "/icon-bank/evening-routine/girls/blonde/tidy.webp",
      "girl-african": "/icon-bank/evening-routine/girls/african/tidy.webp",
      "boy-2": "/icon-bank/evening-routine/boys/boy-2/tidy.webp",
    },
  },
  {
    id: "bath",
    labelGirl: "אני מתרחצת",
    labelBoy: "אני מתרחץ",
    labelEn: "I take a bath",
    images: {
      "boy-asian": "/icon-bank/evening-routine/boys/asian/bath.webp",
      "girl-asian": "/icon-bank/evening-routine/girls/asian/bath.webp",
      "boy-red": "/icon-bank/evening-routine/boys/red/bath.webp",
      "girl-red": "/icon-bank/evening-routine/girls/red/bath.webp",
      "girl-curly-light": "/icon-bank/evening-routine/girls/curly-light/bath.webp",
      "boy-3": "/icon-bank/evening-routine/boys/boy-3/bath.webp",
      "girl-black": "/icon-bank/evening-routine/girls/black/bath.webp",
      "girl-brown": "/icon-bank/evening-routine/girls/brown/bath.webp",
      "girl-blonde": "/icon-bank/evening-routine/girls/blonde/bath.webp",
      "girl-african": "/icon-bank/evening-routine/girls/african/bath.webp",
      "boy-1": "/icon-bank/evening-routine/boys/boy-1/bath.webp",
      "boy-2": "/icon-bank/evening-routine/boys/boy-2/bath.webp",
    },
  },
  {
    id: "pajamas",
    labelGirl: "אני לובשת פיג׳מה",
    labelBoy: "אני לובש פיג׳מה",
    labelEn: "I put on my pajamas",
    images: {
      "boy-red": "/icon-bank/evening-routine/boys/red/pajamas.webp",
      "girl-red": "/icon-bank/evening-routine/girls/red/pajamas.webp",
      "girl-curly-light": "/icon-bank/evening-routine/girls/curly-light/pajamas.webp",
      "boy-asian": "/icon-bank/evening-routine/boys/asian/pajamas.webp",
      "girl-asian": "/icon-bank/evening-routine/girls/asian/pajamas.webp",
      "girl-black": "/icon-bank/evening-routine/girls/black/pajamas.webp",
      "girl-brown": "/icon-bank/evening-routine/girls/brown/pajamas-v2.webp",
      "girl-blonde": "/icon-bank/evening-routine/girls/blonde/pajamas.webp",
      "girl-african": "/icon-bank/evening-routine/girls/african/pajamas.webp",
      "boy-1": "/icon-bank/evening-routine/boys/boy-1/pajamas.webp",
      "boy-2": "/icon-bank/evening-routine/boys/boy-2/pajamas.webp",
      "boy-3": "/icon-bank/evening-routine/boys/boy-3/pajamas.webp",
    },
  },
  {
    id: "teeth",
    labelGirl: "אני מצחצחת שיניים",
    labelBoy: "אני מצחצח שיניים",
    labelEn: "I brush my teeth",
    images: {
      "boy-asian": "/icon-bank/morning-routine/boys/asian/teeth.webp",
      "girl-asian": "/icon-bank/morning-routine/girls/asian/teeth.webp",
      "boy-red": "/icon-bank/morning-routine/boys/red/teeth.webp",
      "girl-red": "/icon-bank/morning-routine/girls/red/teeth.webp",
      "girl-curly-light": "/icon-bank/morning-routine/girls/curly-light/teeth.webp",
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
    labelEn: "I go to the bathroom",
    images: {
      "boy-asian": "/icon-bank/morning-routine/boys/asian/toilet.webp",
      "girl-asian": "/icon-bank/morning-routine/girls/asian/toilet.webp",
      "boy-red": "/icon-bank/morning-routine/boys/red/toilet.webp",
      "girl-red": "/icon-bank/morning-routine/girls/red/toilet.webp",
      "girl-curly-light": "/icon-bank/morning-routine/girls/curly-light/toilet.webp",
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
    labelEn: "I change my diaper",
    images: {
      "boy-asian": "/icon-bank/morning-routine/boys/asian/diaper.webp",
      "girl-asian": "/icon-bank/morning-routine/girls/asian/diaper.webp",
      "boy-red": "/icon-bank/morning-routine/boys/red/diaper.webp",
      "girl-red": "/icon-bank/morning-routine/girls/red/diaper.webp",
      "girl-curly-light": "/icon-bank/morning-routine/girls/curly-light/diaper.webp",
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
    labelEn: "I get into bed",
    images: {
      "boy-asian": "/icon-bank/evening-routine/boys/asian/bed.webp",
      "girl-asian": "/icon-bank/evening-routine/girls/asian/bed.webp",
      "boy-red": "/icon-bank/evening-routine/boys/red/bed.webp",
      "girl-red": "/icon-bank/evening-routine/girls/red/bed.webp",
      "girl-curly-light": "/icon-bank/evening-routine/girls/curly-light/bed.webp",
      "boy-3": "/icon-bank/evening-routine/boys/boy-3/bed.webp",
      "girl-black": "/icon-bank/evening-routine/girls/black/bed.webp",
      "girl-brown": "/icon-bank/evening-routine/girls/brown/bed.webp",
      "girl-blonde": "/icon-bank/evening-routine/girls/blonde/bed.webp",
      "girl-african": "/icon-bank/evening-routine/girls/african/bed.webp",
      "boy-1": "/icon-bank/evening-routine/boys/boy-1/bed.webp",
      "boy-2": "/icon-bank/evening-routine/boys/boy-2/bed.webp",
    },
  },
];

export { CHARACTERS, charactersForGender, imageForStep, labelForStep };

export function buildChildEveningRoutineUrl(gender, characterId, order, language = "he") {
  const params = new URLSearchParams();
  params.set("g", gender);
  params.set("c", characterId);
  params.set("s", order.join(","));
  return `${window.location.origin}${language === "en" ? "/en" : ""}/child/evening-routine?${params.toString()}`;
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
