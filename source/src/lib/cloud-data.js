// Favorites, folders and saved treatment plans in the cloud, for signed-in users.
// Loaded on demand from storage.js; the tables and request shapes match the live site.
import { SUPABASE_ANON_KEY, SUPABASE_URL, getCloudSession, refreshCloudSession } from "@/lib/cloud-auth";

function currentUser() {
  const session = getCloudSession();
  return { session, userId: session?.user?.id };
}

async function request(table, options = {}, retryAfterRefresh = true) {
  const { method = "GET", query = "", body, prefer } = options;
  const { session } = currentUser();
  if (!session?.access_token) throw new Error("not-authenticated");
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  // An expired sign-in is renewed once, then the request is repeated.
  if (response.status === 401 && retryAfterRefresh && session.refresh_token) {
    await refreshCloudSession();
    return request(table, options, false);
  }
  if (!response.ok) throw new Error(`cloud-data-${response.status}`);
  return response.status === 204 ? null : response.json().catch(() => null);
}

const MERGE = "resolution=merge-duplicates,return=minimal";

export async function loadSavedContentFromCloud() {
  const [favorites, folders, plans] = await Promise.all([
    request("user_favorites", { query: "?select=id,activity_id,folder_id,created_at&order=created_at.desc" }),
    request("user_folders", { query: "?select=id,name,created_at&order=created_at.asc" }),
    request("treatment_plans", { query: "?select=id,title,items,params,created_at,updated_at&order=created_at.desc" }),
  ]);
  return { favorites: favorites || [], folders: folders || [], plans: plans || [] };
}

// Right after creating an account: copy what was saved in this browser to the new account.
export async function uploadSavedContentToCloud({ favorites, folders, plans }) {
  const { userId } = currentUser();
  if (!userId) throw new Error("not-authenticated");
  const withUser = (rows) => rows.map((row) => ({ ...row, user_id: userId }));
  await Promise.all([
    favorites?.length ? request("user_favorites", { method: "POST", body: withUser(favorites), prefer: MERGE }) : null,
    folders?.length ? request("user_folders", { method: "POST", body: withUser(folders), prefer: MERGE }) : null,
    plans?.length ? request("treatment_plans", { method: "POST", body: withUser(plans), prefer: MERGE }) : null,
  ]);
}

export function saveFavoriteToCloud(favorite) {
  const { userId } = currentUser();
  return userId ? request("user_favorites", { method: "POST", body: { ...favorite, user_id: userId }, prefer: MERGE }) : Promise.resolve();
}

export function deleteFavoriteFromCloud(id) {
  return request("user_favorites", { method: "DELETE", query: `?id=eq.${encodeURIComponent(id)}` });
}

export function saveFolderToCloud(folder) {
  const { userId } = currentUser();
  return userId ? request("user_folders", { method: "POST", body: { ...folder, user_id: userId }, prefer: MERGE }) : Promise.resolve();
}

export function savePlanToCloud(plan) {
  const { userId } = currentUser();
  return userId ? request("treatment_plans", { method: "POST", body: { ...plan, user_id: userId }, prefer: MERGE }) : Promise.resolve();
}

export function deletePlanFromCloud(id) {
  return request("treatment_plans", { method: "DELETE", query: `?id=eq.${encodeURIComponent(id)}` });
}
