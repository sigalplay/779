import { useEffect, useMemo, useState } from "react";
import { getCloudSession, isCloudAuthConfigured } from "./cloud-auth";

const URL = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const CACHE_KEY = "boo_cms_published_v1";

function apiHeaders(withSession = false) {
  const token = withSession ? getCloudSession()?.access_token : null;
  return {
    apikey: KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
}

async function api(path, options = {}, withSession = false) {
  if (!isCloudAuthConfigured()) throw new Error("cms-not-configured");
  const response = await fetch(`${URL}/rest/v1/${path}`, { ...options, headers: { ...apiHeaders(withSession), ...options.headers } });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.message || body?.hint || "cms-request-failed");
  return body;
}

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "[]"); } catch { return []; }
}

function writeCache(rows) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(rows)); } catch { /* offline fallback remains in memory */ }
}

export async function refreshPublishedCmsContent() {
  if (!isCloudAuthConfigured()) return readCache();
  const rows = await api("cms_content?select=content_type,content_id,payload,status,updated_at&status=eq.published");
  writeCache(rows || []);
  window.dispatchEvent(new Event("boo_cms_change"));
  return rows || [];
}

export function mergeCmsCollection(type, baseItems, rows = readCache()) {
  const relevant = rows.filter((row) => row.content_type === type);
  const overrides = new Map(relevant.map((row) => [row.content_id, row.payload || {}]));
  const baseIds = new Set(baseItems.map((item) => item.id));
  const merged = baseItems
    .map((item) => overrides.has(item.id) ? { ...item, ...overrides.get(item.id), id: item.id } : item)
    .filter((item) => item.cms_hidden !== true);
  relevant.forEach((row) => {
    if (!baseIds.has(row.content_id) && row.payload?.cms_hidden !== true) merged.unshift({ ...row.payload, id: row.content_id });
  });
  return merged;
}

export function getCachedCmsCollection(type, baseItems) {
  return mergeCmsCollection(type, baseItems, readCache());
}

export function useCmsCollection(type, baseItems) {
  const [rows, setRows] = useState(() => readCache());
  useEffect(() => {
    const update = () => setRows(readCache());
    window.addEventListener("boo_cms_change", update);
    refreshPublishedCmsContent().catch(() => null);
    return () => window.removeEventListener("boo_cms_change", update);
  }, []);
  return useMemo(() => mergeCmsCollection(type, baseItems, rows), [type, baseItems, rows]);
}

export async function isCmsAdmin() {
  const userId = getCloudSession()?.user?.id;
  if (!userId) return false;
  const rows = await api(`cms_admins?select=user_id&user_id=eq.${encodeURIComponent(userId)}`, {}, true);
  return rows.length === 1;
}

export async function getCmsAdminRows() {
  return api("cms_content?select=content_type,content_id,payload,status,updated_at&order=updated_at.desc", {}, true);
}

export async function saveCmsRow(row) {
  const userId = getCloudSession()?.user?.id;
  if (!userId) throw new Error("not-signed-in");
  const payload = {
    content_type: row.content_type,
    content_id: row.content_id,
    payload: row.payload,
    status: row.status,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  };
  await api("cms_content?on_conflict=content_type,content_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(payload),
  }, true);
  if (row.status === "published") await refreshPublishedCmsContent();
}

export async function deleteCmsRow(type, id) {
  await api(`cms_content?content_type=eq.${encodeURIComponent(type)}&content_id=eq.${encodeURIComponent(id)}`, { method: "DELETE" }, true);
  await refreshPublishedCmsContent().catch(() => null);
}
