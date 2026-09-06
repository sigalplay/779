import { GOOGLE_CLIENT_ID, DRIVE_SCOPE } from "./google-drive-config";

const SCOPES = [DRIVE_SCOPE, "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"].join(
  " ",
);

const FOLDER_NAME = "בואו נשחק - הערות טיפול";
const PROFILE_KEY = "pp_gdrive_profile";

let tokenClient = null;
let accessToken = null;
let tokenExpiresAt = 0;
let gisLoadingPromise = null;

function loadGis() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gisLoadingPromise) return gisLoadingPromise;
  gisLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("GIS_LOAD_FAILED"));
    document.head.appendChild(script);
  });
  return gisLoadingPromise;
}

function getStoredProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
  } catch {
    return null;
  }
}

function setStoredProfile(profile) {
  if (profile) localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  else localStorage.removeItem(PROFILE_KEY);
}

export function getCachedDriveProfile() {
  return getStoredProfile();
}

export function isDriveConnected() {
  return Boolean(getStoredProfile()) && Boolean(accessToken) && Date.now() < tokenExpiresAt;
}

async function fetchProfile(token) {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("PROFILE_FETCH_FAILED");
  const data = await res.json();
  return { email: data.email, name: data.name, picture: data.picture };
}

/**
 * Opens the Google consent popup (or silently refreshes if the browser still
 * has an active Google session and consent was already granted). Resolves
 * once we have a usable Drive access token + basic profile info.
 */
export function connectDrive({ silent = false } = {}) {
  if (!GOOGLE_CLIENT_ID) {
    return Promise.reject(new Error("NOT_CONFIGURED"));
  }
  return loadGis().then(
    () =>
      new Promise((resolve, reject) => {
        if (!tokenClient) {
          tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: SCOPES,
            callback: () => {}, // overridden per-call below
          });
        }
        tokenClient.callback = async (resp) => {
          if (resp.error) {
            reject(new Error(resp.error));
            return;
          }
          accessToken = resp.access_token;
          tokenExpiresAt = Date.now() + (resp.expires_in ?? 3600) * 1000 - 60_000;
          try {
            const profile = await fetchProfile(accessToken);
            setStoredProfile(profile);
            resolve(profile);
          } catch (err) {
            reject(err);
          }
        };
        tokenClient.requestAccessToken({ prompt: silent ? "" : "consent" });
      }),
  );
}

export function disconnectDrive() {
  if (accessToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(accessToken, () => {});
  }
  accessToken = null;
  tokenExpiresAt = 0;
  setStoredProfile(null);
}

async function driveFetch(url, options = {}) {
  if (!accessToken || Date.now() >= tokenExpiresAt) {
    await connectDrive({ silent: true }).catch(() => {
      throw new Error("NOT_CONNECTED");
    });
  }
  const res = await fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`DRIVE_ERROR: ${res.status} ${text.slice(0, 200)}`);
  }
  return res;
}

let folderIdCache = null;

async function ensureAppFolder() {
  if (folderIdCache) return folderIdCache;
  const q = encodeURIComponent(`name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  const listRes = await driveFetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`);
  const listData = await listRes.json();
  if (listData.files?.length) {
    folderIdCache = listData.files[0].id;
    return folderIdCache;
  }
  const createRes = await driveFetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: FOLDER_NAME, mimeType: "application/vnd.google-apps.folder" }),
  });
  const created = await createRes.json();
  folderIdCache = created.id;
  return folderIdCache;
}

/** Lists session notes saved in the app's Drive folder, newest first. */
export async function listSessionNotes() {
  const folderId = await ensureAppFolder();
  const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const res = await driveFetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime desc&fields=files(id,name,modifiedTime)`,
  );
  const data = await res.json();
  return data.files ?? [];
}

/** Fetches the JSON content of a specific note file. */
export async function getSessionNote(fileId) {
  const res = await driveFetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
  return res.json();
}

/** Creates a new note file, or updates an existing one if fileId is provided. */
export async function saveSessionNote({ fileId, clientName, date, text }) {
  const folderId = await ensureAppFolder();
  const payload = { clientName, date, text, updated_at: new Date().toISOString() };
  const fileName = `${date} - ${clientName || "ללא שם"}.json`;

  if (fileId) {
    await driveFetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return fileId;
  }

  const boundary = "pp_boundary_" + Math.random().toString(36).slice(2);
  const metadata = { name: fileName, parents: [folderId], mimeType: "application/json" };
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(payload)}\r\n` +
    `--${boundary}--`;

  const res = await driveFetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
    body,
  });
  const created = await res.json();
  return created.id;
}

export async function deleteSessionNote(fileId) {
  await driveFetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, { method: "DELETE" });
}
