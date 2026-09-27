import { cloudRequest, getCloudSession, saveCloudSession } from "@/lib/cloud-auth";
import { hasCloudSession } from "@/lib/session-board-cloud";

// The farewell countdown and "what we learned" for each client: { total, filled, learned: [] }.
// Signed in, it is kept on the therapist's account (so it is there on any device);
// otherwise, and for the board without a client, in this browser.
const LOCAL_KEY = "boo_farewell_v1";
const EMPTY = { total: 8, filled: 0, learned: [] };

function readLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || {}; } catch { return {}; }
}

export function loadFarewell(patientKey) {
  const all = hasCloudSession() && patientKey !== "guest"
    ? getCloudSession()?.user?.user_metadata?.farewell || {}
    : readLocal();
  return { ...EMPTY, ...(all[patientKey] || {}) };
}

export async function saveFarewell(patientKey, value) {
  if (!hasCloudSession() || patientKey === "guest") {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify({ ...readLocal(), [patientKey]: value })); } catch { /* storage blocked */ }
    return;
  }
  const session = getCloudSession();
  const farewell = { ...(session.user?.user_metadata?.farewell || {}), [patientKey]: value };
  saveCloudSession({ ...session, user: { ...session.user, user_metadata: { ...session.user?.user_metadata, farewell } } });
  const user = await cloudRequest("/auth/v1/user", { method: "PUT", token: session.access_token, body: JSON.stringify({ data: { farewell } }) });
  saveCloudSession({ ...getCloudSession(), user });
}
