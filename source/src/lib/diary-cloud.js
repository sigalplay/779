import { cloudRequest, getCloudSession, isCloudAuthConfigured } from "@/lib/cloud-auth";

// Calendar appointments (table diary_appointments, private to each therapist).
// A weekly appointment repeats on the same weekday from start_date until end_date (if set),
// except the dates listed in skipped_dates.

function session() {
  const current = getCloudSession();
  if (!isCloudAuthConfigured() || !current?.access_token || !current?.user?.id) throw new Error("cloud-session-required");
  return current;
}

const FIELDS = "id,patient_id,start_date,start_time,weekly,end_date,skipped_dates";

export async function listAppointments() {
  return cloudRequest(`/rest/v1/diary_appointments?select=${FIELDS}&order=start_date.asc`, { token: session().access_token });
}

export async function addAppointment({ patientId, date, time, weekly }) {
  const current = session();
  const rows = await cloudRequest("/rest/v1/diary_appointments", {
    method: "POST",
    token: current.access_token,
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ user_id: current.user.id, patient_id: patientId, start_date: date, start_time: time || null, weekly: Boolean(weekly) }),
  });
  return rows?.[0];
}

export async function updateAppointment(id, patch) {
  const rows = await cloudRequest(`/rest/v1/diary_appointments?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    token: session().access_token,
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(patch),
  });
  return rows?.[0];
}

export async function deleteAppointment(id) {
  await cloudRequest(`/rest/v1/diary_appointments?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    token: session().access_token,
    headers: { Prefer: "return=minimal" },
  });
}

// "YYYY-MM-DD" for a local date (not UTC, so late-evening dates don't shift a day).
export function localDateKey(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Does this appointment take place on the given day?
export function occursOn(appointment, dayKey) {
  if (appointment.skipped_dates?.includes(dayKey)) return false;
  if (!appointment.weekly) return appointment.start_date === dayKey;
  if (dayKey < appointment.start_date) return false;
  if (appointment.end_date && dayKey > appointment.end_date) return false;
  return parseDate(appointment.start_date).getDay() === parseDate(dayKey).getDay();
}

export function previousDay(dayKey) {
  const date = parseDate(dayKey);
  date.setDate(date.getDate() - 1);
  return localDateKey(date);
}
