import { getCloudSession, refreshCloudSession, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./cloud-auth";

function currentUser() {
  const session = getCloudSession();
  return { session, userId: session?.user?.id };
}

async function rest(table, options = {}, retry = true) {
  const { method = "GET", query = "", body, prefer } = options;
  const { session } = currentUser();
  if (!session?.access_token) throw new Error("not-authenticated");
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (response.status === 401 && retry && session.refresh_token) {
    await refreshCloudSession();
    return rest(table, options, false);
  }
  if (!response.ok) throw new Error(`cloud-data-${response.status}`);
  if (response.status === 204) return null;
  return response.json().catch(() => null);
}

export async function loadSavedContentFromCloud() {
  const [favorites, folders, plans] = await Promise.all([
    rest("user_favorites", { query: "?select=id,activity_id,folder_id,created_at&order=created_at.desc" }),
    rest("user_folders", { query: "?select=id,name,created_at&order=created_at.asc" }),
    rest("treatment_plans", { query: "?select=id,title,items,params,created_at,updated_at&order=created_at.desc" }),
  ]);
  return { favorites: favorites || [], folders: folders || [], plans: plans || [] };
}

export async function uploadSavedContentToCloud({ favorites, folders, plans }) {
  const { userId } = currentUser();
  if (!userId) throw new Error("not-authenticated");
  await Promise.all([
    favorites?.length ? rest("user_favorites", { method: "POST", body: favorites.map((item) => ({ ...item, user_id: userId })), prefer: "resolution=merge-duplicates,return=minimal" }) : null,
    folders?.length ? rest("user_folders", { method: "POST", body: folders.map((item) => ({ ...item, user_id: userId })), prefer: "resolution=merge-duplicates,return=minimal" }) : null,
    plans?.length ? rest("treatment_plans", { method: "POST", body: plans.map((item) => ({ ...item, user_id: userId })), prefer: "resolution=merge-duplicates,return=minimal" }) : null,
  ]);
}

export function saveFavoriteToCloud(item) {
  const { userId } = currentUser();
  if (!userId) return Promise.resolve();
  return rest("user_favorites", { method: "POST", body: { ...item, user_id: userId }, prefer: "resolution=merge-duplicates,return=minimal" });
}

export function deleteFavoriteFromCloud(id) {
  return rest("user_favorites", { method: "DELETE", query: `?id=eq.${encodeURIComponent(id)}` });
}

export function saveFolderToCloud(item) {
  const { userId } = currentUser();
  if (!userId) return Promise.resolve();
  return rest("user_folders", { method: "POST", body: { ...item, user_id: userId }, prefer: "resolution=merge-duplicates,return=minimal" });
}

export function savePlanToCloud(item) {
  const { userId } = currentUser();
  if (!userId) return Promise.resolve();
  return rest("treatment_plans", { method: "POST", body: { ...item, user_id: userId }, prefer: "resolution=merge-duplicates,return=minimal" });
}

export function deletePlanFromCloud(id) {
  return rest("treatment_plans", { method: "DELETE", query: `?id=eq.${encodeURIComponent(id)}` });
}
