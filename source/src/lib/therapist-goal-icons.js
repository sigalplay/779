const THERAPIST_GOAL_ICONS = {
  "מוטוריקה עדינה": "/icon-bank/search/force-grading.webp",
  "גראפו מוטורי": "/icon-bank/search/pencil-grip.webp",
  "גזירה": "/icon-bank/ui/cutting-scissors.webp",
  "הכנה לכיתה א'": "/icon-bank/search/letters.webp",
  "מוטוריקה גסה": "/icon-bank/search/body-awareness.webp",
  "ויסות כוח": "/icon-bank/search/force-grading.webp",
  "תיאום בי-לטרלי": "/icon-bank/search/body-awareness.webp",
  "תיאום בי לטרלי": "/icon-bank/search/body-awareness.webp",
  "ויסות חושי": "/icon-bank/search/touch-sensitivity.webp",
  "משחק חברתי": "/icon-bank/search/turn-taking.webp",
  שפה: "/icon-bank/therapist-goals/language.webp",
  עכבה: "/icon-bank/therapist-goals/inhibition.webp",
  בקרה: "/icon-bank/therapist-goals/monitoring.webp",
  תכנון: "/icon-bank/search/instructions.webp",
  ארגון: "/icon-bank/therapist-goals/organization.webp",
  התארגנות: "/icon-bank/therapist-goals/organization.webp",
  "זיכרון עבודה": "/icon-bank/therapist-goals/working-memory.webp",
  "גמישות מחשבתית": "/icon-bank/therapist-goals/cognitive-flexibility.webp",
};

export function therapistGoalIcon(goal) {
  return THERAPIST_GOAL_ICONS[goal] ?? "/icon-bank/ui/therapy-goals.webp";
}
