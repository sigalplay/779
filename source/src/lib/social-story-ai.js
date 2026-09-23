const SYSTEM_PROMPT = `אתה עוזר שכותב "סיפורים חברתיים" (Social Stories) בעברית עבור ילדים, בשיטת קרול גריי.
כל סיפור מסביר מצב חברתי או יומיומי בצורה רגועה, קונקרטית וחיובית, מנקודת המבט של הילד/ה (גוף ראשון, "אני...").
כללים:
- משפטים קצרים ופשוטים, מתאימים לילד.
- לשלב משפטים תיאוריים (מה קורה), משפטי פרספקטיבה (איך אנשים מרגישים/חושבים), ומשפטי הכוונה עדינים (מה אני יכול/ה לעשות) - בלי לצוות או להטיף.
- טון חם, מרגיע ומעודד, לא מפחיד ולא שיפוטי.
- אורך: 5-8 "עמודים", כל עמוד 1-3 משפטים בלבד.
החזר אך ורק JSON תקני בפורמט הבא, בלי טקסט נוסף, בלי markdown, בלי גרשיים משולשות:
{"title": "כותרת קצרה לסיפור", "pages": [{"text": "טקסט העמוד", "emoji": "אימוג'י אחד מתאים"}]}`;

export async function generateSocialStory({ topic, childName, gender, settings }) {
  const { apiKey, baseUrl, model } = settings;
  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  const userPrompt = [
    `נושא הסיפור: ${topic}`,
    childName ? `שם הילד/ה: ${childName}` : null,
    gender === "boy" ? "לכתוב בלשון זכר (הילד)." : gender === "girl" ? "לכתוב בלשון נקבה (הילדה)." : null,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API_ERROR: ${res.status} ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) throw new Error("EMPTY_RESPONSE");

  let parsed;
  try {
    const cleaned = raw.trim().replace(/^```json\s*|^```\s*|```$/g, "");
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("PARSE_ERROR");
  }

  if (!parsed?.title || !Array.isArray(parsed?.pages) || parsed.pages.length === 0) {
    throw new Error("PARSE_ERROR");
  }

  return {
    title: parsed.title,
    pages: parsed.pages.map((p) => ({ text: p.text ?? "", emoji: p.emoji ?? "✨" })),
  };
}
