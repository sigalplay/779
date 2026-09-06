const KEY = "boo_therapist_clinic_v1";

const DEMO_PATIENTS = [
  { id: "p-1", patientNumber: 1, name: "נועה", age: 5, color: "#E8F3EC", goals: ["תכנון מוטורי", "מוטוריקה עדינה", "ויסות כוח"] },
  { id: "p-2", patientNumber: 2, name: "איתי", age: 6, color: "#F0EAF8", goals: ["תיאום עין-יד", "קשב למשימה", "מוטוריקה גסה"] },
  { id: "p-3", patientNumber: 3, name: "מאיה", age: 4, color: "#FFF3DA", goals: ["מוטוריקה עדינה", "ויסות חושי", "משחק משותף"] },
  { id: "p-4", patientNumber: 4, name: "נועם", age: 7, color: "#E8F2F8", goals: ["גרפו-מוטוריקה", "תפקודים ניהוליים"] },
];

const DEMO_SESSIONS = [
  { id: "s-1", patientId: "p-1", date: "2026-08-18", time: "10:00", status: "planned", title: "טיפול 8", activities: ["seed-1"], summary: "", next: "" },
  { id: "s-2", patientId: "p-2", date: "2026-08-18", time: "11:30", status: "planned", title: "טיפול 5", activities: ["seed-3"], summary: "", next: "" },
  { id: "s-3", patientId: "p-3", date: "2026-08-18", time: "16:00", status: "planned", title: "טיפול 11", activities: ["seed-1"], summary: "", next: "" },
  { id: "s-4", patientId: "p-4", date: "2026-08-18", time: "17:15", status: "planned", title: "טיפול 3", activities: [], summary: "", next: "" },
  { id: "s-5", patientId: "p-1", date: "2026-08-11", time: "10:00", status: "completed", title: "טיפול 7", activities: ["seed-4"], summary: "עבדנו על תכנון רצף ותיאום שתי ידיים.", next: "להמשיך עם רצף של 3 שלבים" },
  { id: "s-6", patientId: "p-1", date: "2026-08-04", time: "10:00", status: "completed", title: "טיפול 6", activities: ["seed-4"], summary: "השתתפות טובה עם רמזים מילוליים.", next: "להפחית רמזים" },
];

const clone = (v) => JSON.parse(JSON.stringify(v));
const BACKUP_FORMAT = "boo-nesahek-clinic-backup";
const BACKUP_ITERATIONS = 250000;

function bytesToBase64(bytes) {
  let binary = "";
  for (let start = 0; start < bytes.length; start += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(start, start + 0x8000));
  }
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function backupKey(password, salt, usages) {
  const sourceKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: BACKUP_ITERATIONS, hash: "SHA-256" },
    sourceKey,
    { name: "AES-GCM", length: 256 },
    false,
    usages,
  );
}

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { patients: clone(DEMO_PATIENTS), sessions: clone(DEMO_SESSIONS) };
    const data = JSON.parse(raw);
    let migrated = false;
    data.patients = data.patients.map((patient, index) => {
      const patientNumber = Number(patient.patientNumber) || index + 1;
      if (patient.patientNumber !== patientNumber) migrated = true;
      patient = { ...patient, patientNumber, name: String(patient.name || "").trim() || `מטופל מספר ${patientNumber}` };
      if (!patient.treatmentSchedule) return patient;
      const legacyPlanned = data.sessions
        .filter((session) => session.patientId === patient.id && session.generatedFromSchedule && session.status === "planned" && !session.sequenceManuallyAdded && !session.initialScheduledSession)
        .sort((a, b) => a.date.localeCompare(b.date));
      if (legacyPlanned.length) {
        const keepId = legacyPlanned[0].id;
        data.sessions = data.sessions
          .filter((session) => !legacyPlanned.some((legacy) => legacy.id === session.id) || session.id === keepId)
          .map((session) => session.id === keepId ? { ...session, initialScheduledSession: true } : session);
        migrated = true;
      }
      if (patient.treatmentSchedule.manualSequence === true) return patient;
      migrated = true;
      return { ...patient, treatmentSchedule: { ...patient.treatmentSchedule, manualSequence: true } };
    });
    if (migrated) localStorage.setItem(KEY, JSON.stringify(data));
    return data;
  } catch {
    return { patients: clone(DEMO_PATIENTS), sessions: clone(DEMO_SESSIONS) };
  }
}
function write(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("boo_clinic_change"));
}

export async function createEncryptedClinicBackup(password) {
  if (!password) throw new Error("missing-password");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await backupKey(password, salt, ["encrypt"]);
  const plaintext = new TextEncoder().encode(JSON.stringify(read()));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return {
    format: BACKUP_FORMAT,
    version: 1,
    createdAt: new Date().toISOString(),
    encryption: { algorithm: "AES-GCM", keyLength: 256, kdf: "PBKDF2", hash: "SHA-256", iterations: BACKUP_ITERATIONS, salt: bytesToBase64(salt), iv: bytesToBase64(iv) },
    data: bytesToBase64(new Uint8Array(ciphertext)),
  };
}

export async function restoreEncryptedClinicBackup(backup, password) {
  if (backup?.format !== BACKUP_FORMAT || backup?.version !== 1 || !backup?.encryption?.salt || !backup?.encryption?.iv || !backup?.data) throw new Error("invalid-backup");
  if (backup.encryption.iterations !== BACKUP_ITERATIONS) throw new Error("invalid-backup");
  try {
    const salt = base64ToBytes(backup.encryption.salt);
    const iv = base64ToBytes(backup.encryption.iv);
    const key = await backupKey(password, salt, ["decrypt"]);
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, base64ToBytes(backup.data));
    const restored = JSON.parse(new TextDecoder().decode(plaintext));
    if (!Array.isArray(restored?.patients) || !Array.isArray(restored?.sessions)) throw new Error("invalid-backup");
    write(restored);
    return restored;
  } catch (error) {
    if (error?.message === "invalid-backup") throw error;
    throw new Error("wrong-password");
  }
}

export function getPatients() { return read().patients.filter((patient) => !patient.archived); }
export function getArchivedPatients() { return read().patients.filter((patient) => patient.archived); }
export function getNextPatientNumber() {
  const numbers = read().patients.map((patient) => Number(patient.patientNumber) || 0);
  return Math.max(0, ...numbers) + 1;
}
export function getPatient(id) { return read().patients.find((p) => p.id === id) ?? null; }
export function getSession(id) { return read().sessions.find((s) => s.id === id) ?? null; }
export function getSessions(patientId) {
  const data = read();
  const archivedIds = new Set(data.patients.filter((patient) => patient.archived).map((patient) => patient.id));
  return data.sessions
    .filter((s) => patientId ? s.patientId === patientId : !archivedIds.has(s.patientId) && !s.hiddenFromDiary)
    .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
}
export function savePatient(patient) {
  const data = read();
  const patientNumber = Number(patient.patientNumber) || Math.max(0, ...data.patients.map((item) => Number(item.patientNumber) || 0)) + 1;
  const next = { ...patient, patientNumber, name: String(patient.name || "").trim() || `מטופל מספר ${patientNumber}`, id: patient.id || `p-${Date.now()}` };
  if (next.settingName?.trim()) {
    next.settingName = next.settingName.trim();
    next.settingColor = next.settingColor || "#A9CFAA";
    data.patients = data.patients.map((item) => item.settingName?.trim().toLocaleLowerCase("he") === next.settingName.toLocaleLowerCase("he") ? { ...item, settingName: next.settingName, settingColor: next.settingColor } : item);
  }
  const index = data.patients.findIndex((p) => p.id === next.id);
  if (index >= 0) data.patients[index] = next;
  else data.patients.push(next);
  write(data);
  return next;
}
export function getFrameworks() {
  const seen = new Map();
  for (const patient of read().patients) {
    const name = patient.settingName?.trim();
    if (name && !seen.has(name.toLocaleLowerCase("he"))) seen.set(name.toLocaleLowerCase("he"), { name, color: patient.settingColor || "#A9CFAA" });
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name, "he"));
}
export function archivePatient(id) {
  const data = read();
  const patient = data.patients.find((item) => item.id === id);
  if (!patient) return null;
  const next = { ...patient, archived: true, archivedAt: new Date().toISOString() };
  data.patients = data.patients.map((item) => item.id === id ? next : item);
  data.sessions = data.sessions.map((session) => session.patientId === id && session.status === "planned" ? { ...session, hiddenFromDiary: true } : session);
  write(data);
  return next;
}
export function restorePatient(id) {
  const patient = getPatient(id);
  if (!patient) return null;
  const { archivedAt, ...rest } = patient;
  return savePatient({ ...rest, archived: false });
}
export function deletePatientPermanently(id) {
  const data = read();
  const exists = data.patients.some((patient) => patient.id === id);
  if (!exists) return false;
  data.patients = data.patients.filter((patient) => patient.id !== id);
  data.sessions = data.sessions.filter((session) => session.patientId !== id);
  write(data);
  return true;
}
export function saveSession(session) {
  const data = read();
  const next = { ...session, id: session.id || `s-${Date.now()}` };
  const index = data.sessions.findIndex((s) => s.id === next.id);
  if (index >= 0) data.sessions[index] = next;
  else data.sessions.push(next);
  write(data);
  return next;
}
export function deleteSession(id) {
  const data = read();
  const exists = data.sessions.some((session) => session.id === id);
  if (!exists) return false;
  data.sessions = data.sessions.filter((session) => session.id !== id);
  write(data);
  return true;
}
function isoDate(date) { return date.toISOString().slice(0, 10); }
function utcDate(value) { return new Date(`${value}T12:00:00Z`); }
function scheduleDays(schedule) {
  if (schedule.frequency === "daily") return [0, 1, 2, 3, 4];
  return (schedule.weekdays || []).map(Number);
}
function buildScheduleDates(schedule) {
  const wanted = new Set(scheduleDays(schedule));
  const total = Math.max(1, Number(schedule.totalAllocation) || 1);
  const cursor = utcDate(schedule.startDate || isoDate(new Date()));
  const dates = [];
  for (let guard = 0; dates.length < total && guard < 1500; guard += 1) {
    if (wanted.has(cursor.getUTCDay())) dates.push(isoDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}
export function saveTreatmentSchedule(patientId, schedule) {
  const data = read();
  const patientIndex = data.patients.findIndex((patient) => patient.id === patientId);
  if (patientIndex < 0) return null;
  const normalized = {
    frequency: schedule.frequency || "weekly",
    weekdays: scheduleDays(schedule),
    time: schedule.time || "",
    startDate: schedule.startDate || isoDate(new Date()),
    totalAllocation: Math.max(1, Number(schedule.totalAllocation) || 1),
    manualSequence: true,
  };
  data.patients[patientIndex] = { ...data.patients[patientIndex], treatmentSchedule: normalized };
  const completed = data.sessions.filter((session) => session.patientId === patientId && session.status === "completed");
  const manualOrActive = data.sessions.filter((session) => session.patientId === patientId && (!session.generatedFromSchedule || session.status === "in-progress"));
  const existingScheduled = data.sessions.filter((session) => session.patientId === patientId && session.generatedFromSchedule && session.status === "planned");
  const otherPatients = data.sessions.filter((session) => session.patientId !== patientId);
  const completedCount = completed.length;
  const existingIdsByDate = new Map([...completed, ...manualOrActive].map((session) => [session.date, session.id]));
  const generated = buildScheduleDates(normalized)
    .filter((date) => !existingIdsByDate.has(date))
    .slice(0, Math.min(1, Math.max(0, normalized.totalAllocation - completedCount)))
    .map((date, index) => {
      const existingSession = existingScheduled.find((session) => session.date === date);
      return {
        ...(existingSession || {}),
        id: existingSession?.id || `s-${patientId}-${date}`,
        patientId,
        date,
        time: normalized.time,
        status: "planned",
        title: existingSession?.title || `טיפול ${completedCount + index + 1}`,
        activities: existingSession?.activities || [],
        summary: existingSession?.summary || "",
        next: existingSession?.next || "",
        generatedFromSchedule: true,
        initialScheduledSession: true,
      };
    });
  const uniquePatientSessions = [...completed, ...manualOrActive].filter((session, index, list) => list.findIndex((item) => item.id === session.id) === index);
  data.sessions = [...otherPatients, ...uniquePatientSessions, ...generated];
  write(data);
  return data.patients[patientIndex];
}

export function addNextScheduledSession(patientId) {
  const data = read();
  const patient = data.patients.find((item) => item.id === patientId);
  const schedule = patient?.treatmentSchedule;
  if (!schedule) return { session: null, reason: "no-schedule" };
  const patientSessions = data.sessions.filter((session) => session.patientId === patientId);
  if (patientSessions.length >= Number(schedule.totalAllocation)) return { session: null, reason: "allocation-finished" };
  const existingDates = new Set(patientSessions.map((session) => session.date));
  const lastDate = patientSessions.reduce((latest, session) => session.date > latest ? session.date : latest, schedule.startDate || "");
  const allowedDays = new Set(scheduleDays(schedule));
  const cursor = utcDate(lastDate || schedule.startDate || isoDate(new Date()));
  cursor.setUTCDate(cursor.getUTCDate() + (existingDates.size ? 1 : 0));
  let nextDate = null;
  for (let guard = 0; guard < 370; guard += 1) {
    const candidate = isoDate(cursor);
    if (allowedDays.has(cursor.getUTCDay()) && !existingDates.has(candidate)) { nextDate = candidate; break; }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  if (!nextDate) return { session: null, reason: "no-date" };
  const session = {
    id: `s-${patientId}-${nextDate}`,
    patientId,
    date: nextDate,
    time: schedule.time || "",
    status: "planned",
    title: `טיפול ${patientSessions.length + 1}`,
    activities: [],
    summary: "",
    next: "",
    generatedFromSchedule: true,
    sequenceManuallyAdded: true,
  };
  data.sessions.push(session);
  write(data);
  return { session, reason: null };
}

export function getAllocationStatus(patientId) {
  const data = read();
  const patient = data.patients.find((item) => item.id === patientId);
  const total = Number(patient?.treatmentSchedule?.totalAllocation) || 0;
  const completed = data.sessions.filter((session) => session.patientId === patientId && session.status === "completed").length;
  return { total, completed, remaining: Math.max(0, total - completed) };
}

export function rescheduleSession(sessionId, newDate, changeType = "once") {
  const data = read();
  const index = data.sessions.findIndex((session) => session.id === sessionId);
  if (index < 0) return null;
  const session = data.sessions[index];
  const oldDate = session.date;
  data.sessions[index] = { ...session, date: newDate, rescheduledFrom: oldDate, rescheduleType: changeType };
  if (changeType === "permanent") {
    const patientIndex = data.patients.findIndex((patient) => patient.id === session.patientId);
    const schedule = data.patients[patientIndex]?.treatmentSchedule;
    if (schedule && schedule.frequency !== "daily") {
      const oldDay = utcDate(oldDate).getUTCDay();
      const newDay = utcDate(newDate).getUTCDay();
      schedule.weekdays = [...new Set((schedule.weekdays || []).map((day) => Number(day) === oldDay ? newDay : Number(day)))];
      data.patients[patientIndex] = { ...data.patients[patientIndex], treatmentSchedule: { ...schedule } };
      const delta = Math.round((utcDate(newDate) - utcDate(oldDate)) / 86400000);
      data.sessions = data.sessions.map((item) => {
        if (item.id === sessionId || item.patientId !== session.patientId || item.status !== "planned" || item.date < oldDate || utcDate(item.date).getUTCDay() !== oldDay) return item;
        const moved = utcDate(item.date);
        moved.setUTCDate(moved.getUTCDate() + delta);
        return { ...item, date: isoDate(moved), rescheduleType: "permanent" };
      });
    }
  }
  write(data);
  return data.sessions.find((item) => item.id === sessionId) || null;
}
export function addSession(patientId, partial = {}) {
  const data = read();
  const count = data.sessions.filter((s) => s.patientId === patientId).length;
  const session = {
    id: `s-${Date.now()}`,
    patientId,
    date: new Date().toISOString().slice(0, 10),
    time: "",
    status: "planned",
    title: `טיפול ${count + 1}`,
    activities: [],
    summary: "",
    next: "",
    ...partial,
  };
  data.sessions.unshift(session);
  write(data);
  return session;
}

export function attachPlanToSession(sessionId, plan, details = {}) {
  const session = getSession(sessionId);
  if (!session) return null;
  return saveSession({
    ...session,
    treatmentPlanItems: plan,
    activities: plan.filter((item) => item.kind === "activity").map((item) => item.id),
    treatmentGoals: details.goals || [],
    durationMode: details.durationMode || null,
    treatmentPlanId: details.planId || session.treatmentPlanId || null,
    planUpdatedAt: new Date().toISOString(),
  });
}

export function startClinicSession(sessionId) {
  const session = getSession(sessionId);
  if (!session) return null;
  return saveSession({ ...session, status: "in-progress", startedAt: session.startedAt || new Date().toISOString() });
}

export function completeClinicSession(sessionId) {
  const session = getSession(sessionId);
  if (!session) return null;
  return saveSession({ ...session, status: "completed", completedAt: new Date().toISOString() });
}
