const DEMO_COOKIE_ACTIVITY = {
  title: "עוגיות קורנפלקס ושוקולד",
  short_description: "הכנת עוגיות קורנפלקס פשוטות ללא אפייה, תוך תרגול מדידה, ערבוב והעברה מדויקת.",
  materials: ["קורנפלקס", "שוקולד", "קערה", "כף", "מנג׳טים", "מיקרוגל", "מקרר"],
  preparation: "מבוגר ממיס את השוקולד ומוודא שהוא אינו חם לפני המשך הפעילות.",
  steps: [
    "שוברים את השוקולד ומניחים אותו בקערה.",
    "מבוגר ממיס את השוקולד במיקרוגל.",
    "מוסיפים את הקורנפלקס לקערה.",
    "מערבבים בעדינות בעזרת כף.",
    "מעבירים מן התערובת למנג׳טים.",
    "מכניסים למקרר עד שהעוגיות מתקשות.",
  ],
  goals: ["מוטוריקה עדינה", "תיאום בי-לטרלי", "ויסות כוח", "תכנון והתארגנות"],
  adaptations: "אפשר להכין מראש את הכמויות ולאפשר לילד לבצע רק את ההוספה והערבוב.",
  extensions: "אפשר לבקש מהילד למדוד את הכמויות, לספור מנג׳טים ולתכנן את סדר השלבים בעצמו.",
  duration_min: 20,
  age_min: 4,
  age_max: 10,
  difficulty: "medium",
  tags: ["מתכון", "מוטוריקה עדינה", "תכנון והתארגנות"],
};

function localDraft(idea) {
  if (/קורנפלקס|עוגיות.*שוקולד|שוקולד.*עוגיות/.test(idea)) return DEMO_COOKIE_ACTIVITY;
  return {
    title: idea.trim(),
    short_description: `פעילות טיפולית בנושא ${idea.trim()}, שניתן להתאים למטרות ולרמת הילד.`,
    materials: ["דפים", "עיפרון", "מספריים", "דבק"],
    preparation: "מכינים מראש את הציוד ומסדרים סביבת עבודה נוחה ובטוחה.",
    steps: [
      "מציגים לילד את הציוד ואת מטרת הפעילות.",
      "מתכננים יחד את סדר העבודה.",
      "מבצעים את הפעילות שלב אחר שלב.",
      "מסיימים, מסדרים את הציוד ומתבוננים בתוצר.",
    ],
    goals: ["מוטוריקה עדינה", "תכנון והתארגנות"],
    adaptations: "מפחיתים את מספר השלבים, מכינים חלק מהציוד מראש ומדגימים כל שלב בנפרד.",
    extensions: "מוסיפים שלב נוסף או מאפשרים לילד לתכנן ולבצע באופן עצמאי יותר.",
    duration_min: 20,
    age_min: 4,
    age_max: 10,
    difficulty: "medium",
    tags: ["פעילות שיצרתי"],
  };
}

function normalizeActivity(raw, idea) {
  const fallback = localDraft(idea);
  return {
    ...fallback,
    ...raw,
    materials: Array.isArray(raw?.materials) ? raw.materials.filter(Boolean) : fallback.materials,
    steps: (Array.isArray(raw?.steps) ? raw.steps : fallback.steps).map((step, index) => ({
      n: index + 1,
      text: typeof step === "string" ? step : step?.text ?? "",
    })),
    goals: Array.isArray(raw?.goals) ? raw.goals.filter(Boolean) : fallback.goals,
    tags: Array.isArray(raw?.tags) ? raw.tags.filter(Boolean) : fallback.tags,
    audience: "therapist",
    ai_generated: true,
    searchStatus: "active",
    categories: Array.isArray(raw?.categories) ? raw.categories : [],
    difficulties: Array.isArray(raw?.difficulties) ? raw.difficulties : [],
    functions: Array.isArray(raw?.functions) ? raw.functions : [],
    sensory_systems: Array.isArray(raw?.sensory_systems) ? raw.sensory_systems : [],
    moments: [],
    equipment: "clinic",
  };
}

export async function generateActivityDraft(idea) {
  const endpoint = import.meta.env.VITE_ACTIVITY_AI_ENDPOINT;
  if (!endpoint) return { activity: normalizeActivity(localDraft(idea), idea), demo: true };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea }),
  });
  if (!response.ok) throw new Error("GENERATION_FAILED");
  const data = await response.json();
  return { activity: normalizeActivity(data.activity ?? data, idea), demo: false };
}
