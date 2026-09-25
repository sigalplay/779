import { cloudRequest, getCloudSession, isCloudAuthConfigured } from "@/lib/cloud-auth";

function authenticatedSession() {
  const session = getCloudSession();
  if (!isCloudAuthConfigured() || !session?.access_token || !session?.user?.id) throw new Error("cloud-session-required");
  return session;
}

function encoded(value) {
  return encodeURIComponent(String(value));
}

export async function loadPatientBoard(patientId, boardDate) {
  const session = authenticatedSession();
  const [patients, boards] = await Promise.all([
    cloudRequest(`/rest/v1/therapist_patients?id=eq.${encoded(patientId)}&select=id,display_name`, { token: session.access_token }),
    cloudRequest(`/rest/v1/daily_meeting_boards?patient_id=eq.${encoded(patientId)}&board_date=eq.${encoded(boardDate)}&select=items,drawing_data`, { token: session.access_token }),
  ]);
  if (!patients?.[0]) throw new Error("patient-not-found");
  return {
    patient: { id: patients[0].id, name: patients[0].display_name },
    items: Array.isArray(boards?.[0]?.items) ? boards[0].items : [],
    drawingData: Array.isArray(boards?.[0]?.drawing_data) ? boards[0].drawing_data : [],
  };
}

export async function listPatientBoardDates(patientId) {
  const session = authenticatedSession();
  const boards = await cloudRequest(`/rest/v1/daily_meeting_boards?patient_id=eq.${encoded(patientId)}&select=board_date&order=board_date.asc`, { token: session.access_token });
  return [...new Set((boards || []).map((board) => board.board_date).filter(Boolean))].sort();
}

export async function savePatientBoard(patientId, boardDate, items, drawingData = undefined) {
  const session = authenticatedSession();
  const body = {
    user_id: session.user.id,
    patient_id: patientId,
    board_date: boardDate,
    items: Array.isArray(items) ? items : [],
    updated_at: new Date().toISOString(),
  };
  if (drawingData !== undefined) body.drawing_data = Array.isArray(drawingData) ? drawingData : [];
  await cloudRequest("/rest/v1/daily_meeting_boards?on_conflict=user_id,patient_id,board_date", {
    method: "POST",
    token: session.access_token,
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(body),
  });
}

// Signed in to the cloud (needed for client boards).
export function hasCloudSession() {
  const session = getCloudSession();
  return Boolean(isCloudAuthConfigured() && session?.access_token && session?.user?.id);
}

export async function listPatients() {
  const session = authenticatedSession();
  return cloudRequest("/rest/v1/therapist_patients?select=id,display_name,updated_at&order=updated_at.desc", { token: session.access_token });
}

export async function addPatient(displayName) {
  const session = authenticatedSession();
  const rows = await cloudRequest("/rest/v1/therapist_patients", {
    method: "POST",
    token: session.access_token,
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ user_id: session.user.id, display_name: displayName }),
  });
  const id = rows?.[0]?.id;
  if (!id) throw new Error("missing-patient");
  return id;
}
