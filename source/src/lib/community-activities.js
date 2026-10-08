import { SUPABASE_ANON_KEY, SUPABASE_URL, freshCloudSession } from "@/lib/cloud-auth";

// "Activities users created": every activity made with the activity generator is added to the
// table community_activities by the generate-activity function. Anyone can read it; only site
// admins can change (its pictures) or delete it (see supabase/schema.sql).
const TABLE = `${SUPABASE_URL}/rest/v1/community_activities`;

export async function listCommunityActivities() {
  const response = await fetch(`${TABLE}?select=id,activity,equipment,language,created_at&order=created_at.desc&limit=500`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!response.ok) throw new Error(response.status === 404 ? "not-set-up" : "server");
  return response.json();
}

export async function deleteCommunityActivity(id) {
  const session = await freshCloudSession();
  if (!session?.access_token) throw new Error("sign-in");
  const response = await fetch(`${TABLE}?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}`, Prefer: "return=representation" },
  });
  const rows = await response.json().catch(() => []);
  if (!response.ok || !rows.length) throw new Error("not-allowed");
}

// Saves an admin's changes to a shared activity (new pictures from the site's catalog).
export async function updateCommunityActivity(id, activity) {
  const session = await freshCloudSession();
  if (!session?.access_token) throw new Error("sign-in");
  const response = await fetch(`${TABLE}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ activity }),
  });
  const rows = await response.json().catch(() => []);
  if (!response.ok || !rows.length) throw new Error("not-allowed");
  return rows[0];
}
