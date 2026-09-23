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
  eveningStep("dinner", "breakfast", "אני אוכלת ארוחת ערב", "אני אוכל ארוחת ערב"),
  eveningStep("tidy", "hair", "אני מסדרת את המשחקים", "אני מסדר את המשחקים", {
    "girl-black": "/icon-bank/evening-routine/girls/black/tidy.png",
    "girl-brown": "/icon-bank/evening-routine/girls/brown/tidy.png",
    "girl-blonde": "/icon-bank/evening-routine/girls/blonde/tidy.png",
    "girl-african": "/icon-bank/evening-routine/girls/african/tidy.png",
    "boy-1": "/icon-bank/evening-routine/boys/boy-1/tidy.png",
    "boy-2": "/icon-bank/evening-routine/boys/boy-2/tidy.png",
    "boy-3": "/icon-bank/evening-routine/boys/boy-3/tidy.png",
  }),
  eveningStep("bath", "wash-face", "אני מתרחצת", "אני מתרחץ", {
    "girl-black": "/icon-bank/evening-routine/girls/black/bath.png",
    "girl-brown": "/icon-bank/evening-routine/girls/brown/bath.png",
    "girl-blonde": "/icon-bank/evening-routine/girls/blonde/bath.png",
    "girl-african": "/icon-bank/evening-routine/girls/african/bath.png",
    "boy-1": "/icon-bank/evening-routine/boys/boy-1/bath.png",
    "boy-2": "/icon-bank/evening-routine/boys/boy-2/bath.png",
    "boy-3": "/icon-bank/evening-routine/boys/boy-3/bath.png",
  }),
  eveningStep("pajamas", "dressed", "אני לובשת פיג׳מה", "אני לובש פיג׳מה", {
    "girl-black": "/icon-bank/evening-routine/girls/black/pajamas.png",
    "girl-brown": "/icon-bank/evening-routine/girls/brown/pajamas-v2.png",
    "girl-blonde": "/icon-bank/evening-routine/girls/blonde/pajamas.png",
    "girl-african": "/icon-bank/evening-routine/girls/african/pajamas.png",
    "boy-1": "/icon-bank/evening-routine/boys/boy-1/pajamas.png",
    "boy-2": "/icon-bank/evening-routine/boys/boy-2/pajamas.png",
    "boy-3": "/icon-bank/evening-routine/boys/boy-3/pajamas.png",
  }),
  eveningStep("teeth", "teeth", "אני מצחצחת שיניים", "אני מצחצח שיניים"),
  eveningStep("toilet", "toilet", "אני הולכת לשירותים", "אני הולך לשירותים"),
  eveningStep("diaper", "diaper", "אני מחליפה חיתול", "אני מחליף חיתול"),
  eveningStep("bed", "wake", "אני נכנסת למיטה", "אני נכנס למיטה", {
    "girl-black": "/icon-bank/evening-routine/girls/black/bed.png",
    "girl-brown": "/icon-bank/evening-routine/girls/brown/bed.png",
    "girl-blonde": "/icon-bank/evening-routine/girls/blonde/bed.png",
    "girl-african": "/icon-bank/evening-routine/girls/african/bed.png",
    "boy-1": "/icon-bank/evening-routine/boys/boy-1/bed.png",
    "boy-2": "/icon-bank/evening-routine/boys/boy-2/bed.png",
    "boy-3": "/icon-bank/evening-routine/boys/boy-3/bed.png",
  }),
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
