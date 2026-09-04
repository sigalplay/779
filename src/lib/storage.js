import { SEED_ACTIVITIES } from "./activities-data";
import { expandGoals } from "./constants";
import { weeklyBoardTaskById } from "./weekly-board-tasks";
import { getCachedCmsCollection } from "./cms-content";

/**
 * שכבת "באקאנד" מקומית מבוססת localStorage.
 * מחליפה את Supabase של הפרויקט המקורי כדי שהאתר ירוץ מיד בלי חיבור לשרת.
 * כל הפונקציות סינכרוניות ופשוטות לניפוי — לפרויקט אמיתי מומלץ להחליף
 * בקריאות API אמיתיות (או לחבר Supabase/כל באקאנד אחר משלכם).
 */

const KEYS = {
  profile: "pp_profile",
  activities: "pp_activities_custom",
  favorites: "pp_favorites",
  folders: "pp_folders",
  plans: "pp_plans",
  seen: (mode) => `pp_seen_${mode}`,
  views: "pp_views",
  draftPlan: "pp_draft_plan",
  socialStories: "pp_social_stories",
  socialStoryAiSettings: "pp_social_story_ai_settings",
  childPhoto: "pp_social_story_child_photo",
  weeklyBoard: "pp_weekly_board",
  weeklyBoardSettings: "pp_weekly_board_settings",
  weeklyBoardRecurring: "pp_weekly_board_recurring",
  weeklyBoards: "pp_weekly_boards_meta",
  weeklyBoardActive: "pp_weekly_board_active",
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full / unavailable — fail silently, app still works in-memory for this session
  }
}

export function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------- Profile / mock auth ----------

export function getProfile() {
  return read(KEYS.profile, null);
}

export function isSignedIn() {
  return !!getProfile();
}

export function signIn(displayName, email = "", accountType = "local") {
  const profile = { display_name: displayName, email, account_type: accountType, created_at: new Date().toISOString() };
  write(KEYS.profile, profile);
  window.dispatchEvent(new Event("pp_auth_change"));
  return profile;
}

export function signOut() {
  localStorage.removeItem(KEYS.profile);
  window.dispatchEvent(new Event("pp_auth_change"));
}

// ---------- Activities ----------

function customActivities() {
  return read(KEYS.activities, []);
}

export function getCustomActivities() {
  return [...customActivities()].sort(newestActivitiesFirst);
}

export function deleteCustomActivity(id) {
  const next = customActivities().filter((activity) => activity.id !== id);
  write(KEYS.activities, next);
  return next;
}

// סדר אחיד בכל מאגרי הפעילויות: הפעילות שנוספה לאחרונה מופיעה ראשונה.
// כאשר אין תאריך (או שהתאריכים זהים), נשמר הסדר המקורי והיציב של המאגר.
export function newestActivitiesFirst(a, b) {
  const dateA = Date.parse(a?.created_at || "") || 0;
  const dateB = Date.parse(b?.created_at || "") || 0;
  return dateB - dateA;
}

export function allActivities() {
  return [...customActivities(), ...getCachedCmsCollection("activity", SEED_ACTIVITIES)].sort(newestActivitiesFirst);
}

export function isSearchActive(activity) {
  return !activity.searchStatus || activity.searchStatus === "active";
}

export function getActivity(id) {
  return allActivities().find((a) => a.id === id) ?? null;
}

export function addActivity(a) {
  const activity = { ...a, id: uid(), created_at: new Date().toISOString() };
  const list = customActivities();
  list.unshift(activity);
  write(KEYS.activities, list);
  return activity;
}

export function searchActivities(params) {
  let rows = allActivities().filter(isSearchActive);

  if (params.audience) {
    rows = rows.filter((a) => a.audience === params.audience || a.audience === "both");
  }
  if (typeof params.age === "number") {
    if (params.functionalDifficulty) {
      // A child can be older than an activity's usual age band and still benefit from it for
      // this specific skill - e.g. an 8-year-old who struggles with drawing a human figure
      // should still see simpler figure-drawing activities meant for younger children, instead
      // of only ones that nominally match their chronological age.
      rows = rows.filter((a) => a.age_min <= params.age);
    } else {
      rows = rows.filter((a) => a.age_min <= params.age && a.age_max >= params.age);
    }
  }
  if (typeof params.maxDuration === "number") {
    rows = rows.filter((a) => a.duration_min <= params.maxDuration);
  }
  if (typeof params.minDuration === "number") {
    rows = rows.filter((a) => a.duration_min >= params.minDuration);
  }
  if (params.difficulty) {
    rows = rows.filter((a) => a.difficulty === params.difficulty);
  }
  if (params.moment) {
    rows = rows.filter((a) => a.moments?.includes(params.moment));
  }
  if (params.goals?.length) {
    rows = rows.filter((a) => params.goals.some((g) => a.goals?.includes(g)));
  }
  if (params.functionalDifficulty) {
    rows = rows.filter(
      (a) =>
        a.difficulties?.includes(params.functionalDifficulty) ||
        a.search_difficulties?.includes(params.functionalDifficulty) ||
        (params.functionalDifficulty === "רגישות לרעש" && a.sensory_systems?.includes("שמיעתית")),
    );
  }
  if (params.q?.trim()) {
    const term = params.q.trim().toLowerCase();
    rows = rows.filter(
      (a) =>
        a.title.toLowerCase().includes(term) ||
        a.short_description?.toLowerCase().includes(term) ||
        a.description?.toLowerCase().includes(term),
    );
  }
  if (params.functionalDifficulty && typeof params.age === "number") {
    rows = [...rows].sort((a, b) => {
      const dateDiff = newestActivitiesFirst(a, b);
      if (dateDiff !== 0) return dateDiff;
      const distA = Math.abs((a.age_min + a.age_max) / 2 - params.age);
      const distB = Math.abs((b.age_min + b.age_max) / 2 - params.age);
      return distA - distB;
    });
  } else {
    rows = [...rows].sort(newestActivitiesFirst);
  }
  return rows.slice(0, params.limit ?? 60);
}

/**
 * חיפוש למסלול ההורה: מנסה קודם התאמה מלאה (גיל + זמן + קושי).
 * אם אין תוצאות אפשר להרפות מהזמן, אך קושי שנבחר נשמר תמיד,
 * כדי שהתוצאות יתבססו באופן מדויק על טבלת התיוגים.
 * מחזיר { result, relaxed } כאשר relaxed מתאר מה הורפה (אם בכלל).
 */
export function searchActivitiesSmart(params) {
  const base = { audience: params.audience, age: params.age, limit: params.limit ?? 60 };

  const tiers = params.functionalDifficulty
    ? [
        {
          extra: { maxDuration: params.maxDuration, minDuration: params.minDuration, functionalDifficulty: params.functionalDifficulty },
          relaxed: null,
        },
        { extra: { functionalDifficulty: params.functionalDifficulty }, relaxed: "duration" },
      ]
    : [
        { extra: { maxDuration: params.maxDuration, minDuration: params.minDuration }, relaxed: null },
        { extra: {}, relaxed: "duration" },
      ];

  for (const tier of tiers) {
    const rows = searchActivities({ ...base, ...tier.extra });
    if (rows.length > 0) {
      return { result: rows, relaxed: tier.relaxed };
    }
  }
  return { result: [], relaxed: "none" };
}

// ---------- Treatment plan builder ----------

export function buildTreatmentPlan(params) {
  const pool = allActivities().filter(
    (a) => isSearchActive(a) && a.age_min <= params.age && a.age_max >= params.age && (a.audience === "therapist" || a.audience === "both"),
  );

  const expandedGoals = params.goals.length ? expandGoals(params.goals) : [];
  const goalMatchedPool = expandedGoals.length
    ? pool.filter((activity) => expandedGoals.some((goal) => activity.goals?.includes(goal)))
    : pool;

  const score = (activity) => {
    const exactGoalMatches = expandedGoals.filter((g) => activity.goals?.includes(g)).length;
    const durationFit = activity.duration_min >= 15 && activity.duration_min <= 30 ? 1 : 0;
    return exactGoalMatches * 4 + durationFit;
  };

  const scored = [...goalMatchedPool].sort((a, b) => {
    const diff = score(b) - score(a);
    if (diff !== 0) return diff;
    return a.duration_min - b.duration_min;
  });

  const picked = [];
  let remaining = params.totalDuration;
  for (const a of scored) {
    if (picked.length >= 5) break;
    if (a.duration_min <= remaining + 3) {
      picked.push(a);
      remaining -= a.duration_min;
    }
    if (picked.length >= 3 && remaining <= 5) break;
  }
  if (picked.length < 3 && goalMatchedPool.length >= 3) {
    for (const a of scored) {
      if (picked.length >= 3) break;
      if (!picked.find((p) => p.id === a.id)) picked.push(a);
    }
  }
  return picked;
}

export function saveTreatmentPlan(title, items, params) {
  const plan = { id: uid(), title, items, params, created_at: new Date().toISOString() };
  const list = read(KEYS.plans, []);
  list.unshift(plan);
  write(KEYS.plans, list);
  return plan;
}

export function updateTreatmentPlan(id, title, items, params) {
  const list = read(KEYS.plans, []);
  const index = list.findIndex((plan) => plan.id === id);
  if (index === -1) return null;
  const updated = {
    ...list[index],
    title,
    items,
    params,
    updated_at: new Date().toISOString(),
  };
  list[index] = updated;
  write(KEYS.plans, list);
  return updated;
}

export function getTreatmentPlan(id) {
  return read(KEYS.plans, []).find((plan) => plan.id === id) ?? null;
}

export function getTreatmentPlans() {
  return read(KEYS.plans, []);
}

export function getLatestTreatmentPlan() {
  const list = read(KEYS.plans, []);
  return list[0] ?? null;
}

export function deleteTreatmentPlan(id) {
  const list = read(KEYS.plans, []);
  write(
    KEYS.plans,
    list.filter((p) => p.id !== id),
  );
}

// ---------- Draft plan (in-progress session being built by the therapist) ----------
// Items: { kind: "activity", id } | { kind: "motor-trail", uid, equipment: [ids] }

export function getDraftPlan() {
  return read(KEYS.draftPlan, []);
}

export function setDraftPlan(items) {
  write(KEYS.draftPlan, items);
}

export function addMotorTrailToDraftPlan(equipment, customItems = []) {
  const list = getDraftPlan();
  const item = { kind: "motor-trail", uid: uid(), equipment, customItems };
  write(KEYS.draftPlan, [...list, item]);
  return item;
}

// Adds an activity, recipe, or experiment to the in-progress draft plan.
// kind: "activity" | "recipe" | "experiment"
// Returns { added: boolean } — added is false if the item was already in the plan.
export function addToDraftPlan(kind, id) {
  const list = getDraftPlan();
  const alreadyIn = list.some((p) => p.kind === kind && p.id === id);
  if (alreadyIn) return { added: false };
  write(KEYS.draftPlan, [...list, { kind, id }]);
  return { added: true };
}

export function updateMotorTrailInDraftPlan(itemUid, equipment, customItems = []) {
  const list = getDraftPlan();
  const next = list.map((p) => (p.kind === "motor-trail" && p.uid === itemUid ? { ...p, equipment, customItems } : p));
  write(KEYS.draftPlan, next);
}

// ---------- Favorites & folders ----------

export function listFolders() {
  return read(KEYS.folders, []);
}

export function createFolder(name) {
  const folder = { id: uid(), name, created_at: new Date().toISOString() };
  const list = listFolders();
  list.push(folder);
  write(KEYS.folders, list);
  return folder;
}

export function listFavorites() {
  const favs = read(KEYS.favorites, []);
  return favs
    .map((f) => ({ ...f, activity: getActivity(f.activity_id) }))
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function isFavorite(activityId) {
  const favs = read(KEYS.favorites, []);
  return favs.some((f) => f.activity_id === activityId);
}

export function toggleFavorite(activityId, folderId = null) {
  const favs = read(KEYS.favorites, []);
  const idx = favs.findIndex((f) => f.activity_id === activityId && f.folder_id === folderId);
  if (idx >= 0) {
    favs.splice(idx, 1);
    write(KEYS.favorites, favs);
    return { favored: false };
  }
  favs.unshift({ id: uid(), activity_id: activityId, folder_id: folderId, created_at: new Date().toISOString() });
  write(KEYS.favorites, favs);
  return { favored: true };
}

// ---------- Views ----------

export function logView(activityId) {
  const views = read(KEYS.views, []);
  views.unshift({ activity_id: activityId, viewed_at: new Date().toISOString() });
  write(KEYS.views, views.slice(0, 50));
}

// ---------- "Seen" rotation (parent/therapist single-suggestion flow) ----------

function readSeen(mode) {
  return new Set(read(KEYS.seen(mode), []));
}
function writeSeen(mode, s) {
  write(KEYS.seen(mode), [...s]);
}

export function markSeen(mode, ids) {
  if (!ids.length) return;
  const s = readSeen(mode);
  ids.forEach((id) => s.add(id));
  writeSeen(mode, s);
}

export function resetSeen(mode) {
  writeSeen(mode, new Set());
}

export function filterUnseen(mode, pool) {
  const s = readSeen(mode);
  const unseen = pool.filter((p) => !s.has(p.id));
  if (unseen.length === 0 && pool.length > 0) {
    writeSeen(mode, new Set());
    return { result: pool, recycled: s.size > 0 };
  }
  return { result: unseen, recycled: false };
}

// ---------- Social stories ----------
// story: { id, title, pages: [{ id, text, emoji }], created_at }

export function getSocialStories() {
  const list = read(KEYS.socialStories, []);
  const safe = list.map(({ childPhoto: _photo, motherPhoto: _motherPhoto, ...story }) => story);
  if (list.some((story) => story.childPhoto || story.motherPhoto)) write(KEYS.socialStories, safe);
  return safe;
}

export function saveSocialStory(story) {
  const { childPhoto: _photo, motherPhoto: _motherPhoto, ...safeStory } = story;
  const list = read(KEYS.socialStories, []);
  const existingIndex = list.findIndex((s) => s.id === safeStory.id);
  if (existingIndex >= 0) {
    list[existingIndex] = safeStory;
  } else {
    list.unshift(safeStory);
  }
  write(KEYS.socialStories, list);
  return safeStory;
}

export function deleteSocialStory(id) {
  const list = read(KEYS.socialStories, []);
  write(
    KEYS.socialStories,
    list.filter((s) => s.id !== id),
  );
}

export function clearLegacySocialStorySensitiveData() {
  localStorage.removeItem(KEYS.socialStoryAiSettings);
  localStorage.removeItem(KEYS.childPhoto);
}

// ---------- Weekly organization board (לוח התארגנות שבועי) - מבוסס לוח שנה אמיתי ----------
// כל כרטיס משויך לתאריך קלנדרי אמיתי (מפתח בפורמט YYYY-MM-DD) ולמספר "שורה"/משבצת, כך שכל שבוע בלוח
// השנה הוא שבוע נפרד לגמרי עם תוכן משלו - ואפשר לנווט בין שבועות עם "שבוע קודם" / "שבוע הבא".
// הלוח בנוי כרשת עם מספר משבצות קבוע (5 כברירת מחדל, ניתן להוסיף/להסיר), ואפשר להציג שעה אופציונלית
// לכל משבצת (כבוי כברירת מחדל).
// Shape: { "2026-07-26": { 0: Card, 2: Card, ... }, ... }
// Card: { id, title, emoji, photo (dataURL) | null }

export function dateKeyFor(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** מחזיר את יום ראשון (00:00) של השבוע שמכיל את התאריך הנתון. */
export function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

/** מחזיר מערך של 7 אובייקטי Date, מיום ראשון עד שבת, עבור השבוע שמכיל את התאריך הנתון. */
export function getWeekDates(anchorDate) {
  const start = startOfWeek(anchorDate);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

const DEFAULT_ROW_COUNT = 5;

function ensureWeeklyBoards() {
  let boards = read(KEYS.weeklyBoards, null);
  if (!Array.isArray(boards) || !boards.length) {
    boards = [{ id: "default", name: "הלוח שלי", created_at: new Date().toISOString() }];
    write(KEYS.weeklyBoards, boards);
  }
  return boards;
}

export function getWeeklyBoards() { return ensureWeeklyBoards(); }
export function getActiveWeeklyBoardId() {
  const boards = ensureWeeklyBoards();
  const id = read(KEYS.weeklyBoardActive, "default");
  return boards.some((b) => b.id === id) ? id : boards[0].id;
}
export function setActiveWeeklyBoardId(id) {
  if (ensureWeeklyBoards().some((b) => b.id === id)) write(KEYS.weeklyBoardActive, id);
}
function boardKey(base, id = getActiveWeeklyBoardId()) { return id === "default" ? base : `${base}:${id}`; }
export function createWeeklyBoard(name) {
  const boards = ensureWeeklyBoards();
  const board = { id: uid(), name: name.trim() || `לוח ${boards.length + 1}`, created_at: new Date().toISOString() };
  write(KEYS.weeklyBoards, [...boards, board]); setActiveWeeklyBoardId(board.id); return board;
}
export function renameWeeklyBoard(id, name) {
  write(KEYS.weeklyBoards, ensureWeeklyBoards().map((b) => b.id === id ? { ...b, name: name.trim() || b.name } : b));
}
export function duplicateWeeklyBoard(id, name) {
  const source = ensureWeeklyBoards().find((b) => b.id === id); if (!source) return null;
  const board = createWeeklyBoard(name || `${source.name} – עותק`);
  for (const base of [KEYS.weeklyBoard, KEYS.weeklyBoardSettings, KEYS.weeklyBoardRecurring]) {
    const value = read(boardKey(base, id), null); if (value !== null) write(boardKey(base, board.id), value);
  }
  return board;
}
export function deleteWeeklyBoard(id) {
  const boards = ensureWeeklyBoards(); if (boards.length <= 1) return false;
  const next = boards.filter((b) => b.id !== id); write(KEYS.weeklyBoards, next);
  for (const base of [KEYS.weeklyBoard, KEYS.weeklyBoardSettings, KEYS.weeklyBoardRecurring]) localStorage.removeItem(boardKey(base, id));
  if (getActiveWeeklyBoardId() === id) write(KEYS.weeklyBoardActive, next[0].id);
  return true;
}

function readWeeklyBoardRaw() {
  return read(boardKey(KEYS.weeklyBoard), {});
}

/** הגדרות הלוח: מספר משבצות, האם להציג שעות, ורשימת השעות לכל משבצת. משותף לכל השבועות. */
export function getWeeklyBoardSettings() {
  const s = read(boardKey(KEYS.weeklyBoardSettings), null);
  if (!s) return { rowCount: DEFAULT_ROW_COUNT, showTimes: false, rowTimes: [], boardStyle: "general" };
  return {
    rowCount: s.rowCount ?? DEFAULT_ROW_COUNT,
    showTimes: !!s.showTimes,
    rowTimes: Array.isArray(s.rowTimes) ? s.rowTimes : [],
    boardStyle: s.boardStyle === "kids" ? "kids" : "general",
  };
}

function writeWeeklyBoardSettings(next) {
  write(boardKey(KEYS.weeklyBoardSettings), next);
}

export function setWeeklyBoardStyle(boardStyle) {
  const s = getWeeklyBoardSettings();
  writeWeeklyBoardSettings({ ...s, boardStyle: boardStyle === "kids" ? "kids" : "general" });
}

export function addWeeklyBoardRow() {
  const s = getWeeklyBoardSettings();
  writeWeeklyBoardSettings({ ...s, rowCount: s.rowCount + 1 });
}

/** מסיר את המשבצת האחרונה - כולל הכרטיסים שהיו בה בכל הימים, בכל השבועות. */
export function removeWeeklyBoardRow() {
  const s = getWeeklyBoardSettings();
  if (s.rowCount <= 1) return;
  const newCount = s.rowCount - 1;
  const raw = readWeeklyBoardRaw();
  for (const key of Object.keys(raw)) {
    if (raw[key] && Object.prototype.hasOwnProperty.call(raw[key], newCount)) {
      const day = { ...raw[key] };
      delete day[newCount];
      raw[key] = day;
    }
  }
  write(boardKey(KEYS.weeklyBoard), raw);
  writeWeeklyBoardSettings({ ...s, rowCount: newCount, rowTimes: s.rowTimes.slice(0, newCount) });
}

export function setWeeklyBoardShowTimes(show) {
  const s = getWeeklyBoardSettings();
  writeWeeklyBoardSettings({ ...s, showTimes: show });
}

export function setWeeklyBoardRowTime(rowIndex, time) {
  const s = getWeeklyBoardSettings();
  const rowTimes = [...s.rowTimes];
  rowTimes[rowIndex] = time;
  writeWeeklyBoardSettings({ ...s, rowTimes });
}

/** מחזיר את הכרטיסים של יום נתון, כאובייקט { מספר משבצת: כרטיס }. */
export function getWeeklyBoardDayCards(dateKey) {
  const raw = readWeeklyBoardRaw();
  return raw[dateKey] ?? {};
}

/** קובע (או מוחק, אם card הוא null) את הכרטיס במשבצת נתונה של יום נתון. */
export function setWeeklyBoardCardAt(dateKey, rowIndex, card) {
  const raw = readWeeklyBoardRaw();
  const day = { ...(raw[dateKey] ?? {}) };
  if (card) {
    day[rowIndex] = { id: uid(), title: "", emoji: "🗓️", photo: null, ...card };
  } else {
    delete day[rowIndex];
  }
  raw[dateKey] = day;
  write(boardKey(KEYS.weeklyBoard), raw);
}

export function removeWeeklyBoardCardAt(dateKey, rowIndex) {
  setWeeklyBoardCardAt(dateKey, rowIndex, null);
}

// ---------- כרטיסים קבועים (חוזרים בכל שבוע באותו יום) ----------
// Shape: { "0": { rowIndex: Card }, "1": {...}, ... } - מפתח הוא מספר יום בשבוע (0=ראשון...6=שבת),
// לא תאריך ספציפי - כך שהכרטיס מופיע אוטומטית בכל שבוע, בלי צורך למלא כל שבוע מראש.
function readWeeklyBoardRecurringRaw() {
  return read(boardKey(KEYS.weeklyBoardRecurring), {});
}

export function getWeeklyBoardRecurringDayCards(dayOfWeek) {
  const raw = readWeeklyBoardRecurringRaw();
  return raw[dayOfWeek] ?? {};
}

export function setWeeklyBoardRecurringCardAt(dayOfWeek, rowIndex, card) {
  const raw = readWeeklyBoardRecurringRaw();
  const day = { ...(raw[dayOfWeek] ?? {}) };
  if (card) {
    day[rowIndex] = { id: uid(), title: "", emoji: "🗓️", photo: null, ...card };
  } else {
    delete day[rowIndex];
  }
  raw[dayOfWeek] = day;
  write(boardKey(KEYS.weeklyBoardRecurring), raw);
}

export function removeWeeklyBoardRecurringCardAt(dayOfWeek, rowIndex) {
  setWeeklyBoardRecurringCardAt(dayOfWeek, rowIndex, null);
}

/** מאפס רק את הכרטיסים של השבוע המבוקש (מערך מפתחות תאריך), בלי לפגוע בשבועות אחרים. */
export function resetWeeklyBoardWeek(keys) {
  const raw = readWeeklyBoardRaw();
  for (const k of keys) delete raw[k];
  write(boardKey(KEYS.weeklyBoard), raw);
}

// ---------- שיתוף השבוע - קישור/QR למכשיר אחר ----------
// בדיוק כמו הקישור ל"לוח התארגנות בוקר", הנתונים מקודדים ישירות בתוך הקישור עצמו - כך שהמכשיר
// שפותח אותו רואה את הלוח בלי תלות באחסון מקומי משותף. תמונות שהועלו נכנסות גם הן לקישור,
// אחרי כיווץ לתמונה ממוזערת מאוד (ר' compressPhotoForShare) - כי תמונה מקורית גדולה מדי לקישור.

/** מכווץ תמונה (dataURL) לתמונה ממוזערת בסיסית ל-JPEG כדי שתוכל להיכנס לקישור שיתוף. */
export function compressPhotoForShare(dataUrl, maxSize = 56, quality = 0.5) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width >= height) {
        height = Math.max(1, Math.round((height / width) * maxSize));
        width = maxSize;
      } else {
        width = Math.max(1, Math.round((width / height) * maxSize));
        height = maxSize;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      try {
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

// thumbnails: Map/Object of cardId -> compressed dataURL (from compressPhotoForShare). Cards without
// an entry there fall back to their emoji (or a camera icon, if they had a photo that couldn't be compressed).
function encodeShareCard(card, rowIndex, thumbnails) {
  const title = encodeURIComponent(card.title || "");
  const thumb = card.photo ? thumbnails?.[card.id] : null;
  if (thumb) {
    const payload = thumb.split(",")[1] || "";
    return `${rowIndex}:P${payload}~${title}`;
  }
  if (card.taskId) return `${rowIndex}:I${encodeURIComponent(card.taskId)}~${title}`;
  const emoji = card.photo ? "📷" : card.emoji || "🗓️";
  return `${rowIndex}:${emoji}~${title}`;
}

/** בונה קישור לשיתוף השבוע הנוכחי. cardsByDay: מערך 7 אובייקטים { rowIndex: card }. */
export function buildWeeklyBoardShareUrl(weekDates, cardsByDay, settings, thumbnails = {}) {
  const params = new URLSearchParams();
  params.set("share", "1");
  params.set("week", dateKeyFor(weekDates[0]));
  params.set("rows", String(settings.rowCount));
  if (settings.boardStyle === "kids") params.set("style", "kids");
  if (settings.showTimes && settings.rowTimes.length) {
    params.set("times", settings.rowTimes.map((t) => encodeURIComponent(t || "")).join(","));
  }
  weekDates.forEach((_, i) => {
    const dayCards = cardsByDay[i] ?? {};
    const entries = Object.entries(dayCards);
    if (entries.length) {
      params.set(
        `d${i}`,
        entries.map(([rowIndex, c]) => encodeShareCard(c, rowIndex, thumbnails)).join(";"),
      );
    }
  });
  return `${window.location.origin}/shared/weekly-board?${params.toString()}`;
}

/** מפענח פרמטרים משותפים מתוך ה-URL. מחזיר null אם אין נתוני שיתוף תקינים. */
export function parseWeeklyBoardShareParams(searchParams) {
  if (searchParams.get("share") !== "1") return null;
  const weekStartKey = searchParams.get("week");
  if (!weekStartKey) return null;
  const startDate = new Date(`${weekStartKey}T00:00:00`);
  if (Number.isNaN(startDate.getTime())) return null;

  const rowCount = Number(searchParams.get("rows")) || DEFAULT_ROW_COUNT;
  const timesRaw = searchParams.get("times");
  const rowTimes = timesRaw
    ? timesRaw.split(",").map((t) => {
        try {
          return decodeURIComponent(t);
        } catch {
          return t;
        }
      })
    : [];

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const key = dateKeyFor(d);
    const raw = searchParams.get(`d${i}`) || "";
    const cards = {};
    raw
      .split(";")
      .filter(Boolean)
      .forEach((chunk) => {
        const sepIndex = chunk.indexOf(":");
        if (sepIndex < 0) return;
        const rowIndex = Number(chunk.slice(0, sepIndex));
        const rest = chunk.slice(sepIndex + 1);
        const [head, titleEnc] = rest.split("~");
        let title = "";
        try {
          title = decodeURIComponent(titleEnc || "");
        } catch {
          title = titleEnc || "";
        }
        if (head?.startsWith("P")) {
          cards[rowIndex] = { emoji: null, photo: `data:image/jpeg;base64,${head.slice(1)}`, title };
        } else if (head?.startsWith("I")) {
          let taskId = "";
          try {
            taskId = decodeURIComponent(head.slice(1));
          } catch {
            taskId = head.slice(1);
          }
          const task = weeklyBoardTaskById(taskId);
          cards[rowIndex] = task
            ? {
                emoji: null,
                photo: null,
                title: title || task.title,
                taskId: task.id,
                image: task.image,
                categoryId: task.categoryId,
                categoryColor: task.categoryColor,
              }
            : { emoji: "🗓️", photo: null, title };
        } else {
          cards[rowIndex] = { emoji: head || "🗓️", photo: null, title };
        }
      });
    days.push({ date: d, key, cards });
  }
  return { days, rowCount, showTimes: rowTimes.length > 0, rowTimes, boardStyle: searchParams.get("style") === "kids" ? "kids" : "general" };
}

/** שומר שבוע ששותף (מ-parseWeeklyBoardShareParams) לתוך האחסון המקומי של המכשיר הנוכחי. */
export function importWeeklyBoardWeek(parsed) {
  const { days, rowCount, showTimes, rowTimes, boardStyle } = parsed;
  const raw = readWeeklyBoardRaw();
  for (const { key, cards } of days) {
    const dayObj = {};
    for (const [rowIndex, c] of Object.entries(cards)) {
      dayObj[rowIndex] = {
        id: uid(),
        title: c.title,
        emoji: c.emoji,
        photo: c.photo ?? null,
        taskId: c.taskId ?? null,
        image: c.image ?? null,
        categoryId: c.categoryId ?? null,
        categoryColor: c.categoryColor ?? null,
      };
    }
    raw[key] = dayObj;
  }
  write(KEYS.weeklyBoard, raw);
  writeWeeklyBoardSettings({ rowCount, showTimes, rowTimes, boardStyle });
}
