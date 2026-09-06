# בואו נשחק 🎈

אפליקציית פעילויות טיפוליות לילדים — בהשראת "Playful Pathways", בנויה מחדש כפרויקט
**React (JavaScript) + Vite** עצמאי, בלי תלות בבאקאנד חיצוני.

## מה יש כאן

- **מסלול הורה** — מציאת פעילות לפי מטרות, זמן פנוי, או "רגע ביום".
- **מסלול מטפל/ת** — בנק פעילויות, "בנה לי טיפול" (בונה מפגש אוטומטית), מתכונים טיפוליים.
- **יצירת פעילות עם AI** — מחולל תבניות מקומי כברירת מחדל, עם אפשרות לחבר מפתח
  OpenAI (או כל ספק תואם-OpenAI) אמיתי דרך עמוד הפרופיל.
- **מועדפים ותיקיות**, **התחברות מקומית** (בלי סיסמה — הכל נשמר ב-`localStorage` בדפדפן).

כל הנתונים (משתמש, מועדפים, פעילויות שנוצרו ב-AI, תוכניות טיפול שמורות) נשמרים
ב-`localStorage` של הדפדפן — אין באקאנד, אין מסד נתונים, אין חשבון Supabase נדרש.
זה אומר שהנתונים אישיים למכשיר/דפדפן הספציפי ולא מסונכרנים בין מכשירים.

## הרצה מקומית

```bash
npm install
npm run dev
```

האתר יעלה על `http://localhost:5173`.

## פריסה ל-Vercel

1. דחפו את התיקייה ל-repo ב-GitHub.
2. ב-Vercel: **New Project** → ייבוא ה-repo.
3. Vercel יזהה אוטומטית שזה פרויקט Vite (Framework Preset: Vite). אין צורך בהגדרות
   נוספות — Build Command: `npm run build`, Output Directory: `dist`.
4. Deploy.

אין צורך במשתני סביבה (env vars) כדי שהאתר יעבוד — פיצ'ר ה-AI האמיתי (אופציונלי)
מוגדר מתוך הדפדפן ע"י כל משתמש בעמוד הפרופיל, ולא דרך משתני סביבה של הפרויקט.

## מבנה הפרויקט

```
src/
  main.jsx            נקודת הכניסה
  App.jsx             ניתוב (React Router)
  index.css           עיצוב גלובלי + טוקנים (צבעים, גופנים)
  lib/
    storage.js         "באקאנד" מקומי מבוסס localStorage
    activities-data.js בנק פעילויות התחלתי (זרעים)
    ai-generate.js      יצירת פעילות עם AI (מקומי / API אמיתי)
    constants.js, activity-emoji.js, goal-emoji.js, activity-duration.js, utils.js
  components/           AppShell, ActivityCard, AiGenerateDialog, ui/*
  pages/                Landing, Parent, TherapistHome, TherapistBuild,
                        TherapistRecipes, ActivityDetail, Favorites, Profile, Auth
```

## הרחבה עתידית

- **באקאנד אמיתי**: אפשר להחליף את `src/lib/storage.js` בקריאות ל-API אמיתי
  (Supabase, Firebase, שרת משלכם) בלי לגעת ברכיבים — הפונקציות שם הן נקודת הממשק היחידה.
- **בנק פעילויות גדול יותר**: הוסיפו פעילויות ל-`src/lib/activities-data.js`.
- **התחברות אמיתית**: `src/lib/storage.js` מכיל היום auth מדומה (שם בלבד, בלי סיסמה).
