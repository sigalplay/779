// Accounts (Supabase Auth): email + password, email confirmation, password recovery.
// Same requests and the same saved session as the live site, so existing sign-ins keep working.

// The site's own Supabase project (tables: supabase/schema.sql). The key is the public (publishable)
// key, safe to ship in the page. A build can point elsewhere with VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
// Also set in public/therapist/my-patients/patients.js.
const DEFAULT_SUPABASE_URL = "https://xoyaymlmnsmhuaxnkdqh.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_FjXUtCvY96sSzeTs_0LFOQ_bxp2_mKb";
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;
// Links in confirmation and recovery emails always point to the public site.
const SITE_URL = "https://letsplayot.com";

const SESSION_KEY = "boo_cloud_session";
// Left over from older test versions; removed on sign-out.
const LEGACY_KEYS = ["boo_local_test_session", "boo_beta_email_access"];

function authRedirect(mode = "login") {
  return `${SITE_URL}/auth?mode=${mode}`;
}

export function isCloudAuthConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function headers(token) {
  return {
    apikey: SUPABASE_ANON_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
}

export async function cloudRequest(path, options = {}) {
  if (!isCloudAuthConfigured()) throw new Error("cloud-not-configured");
  const { token, retried, ...requestOptions } = options;
  const response = await fetch(`${SUPABASE_URL}${path}`, { ...requestOptions, headers: { ...headers(token), ...options.headers } });
  const body = await response.json().catch(() => ({}));
  const message = body.msg || body.message || body.error_description || "";
  // A sign-in expires after an hour. It is renewed once, then the request is repeated.
  const expired = response.status === 401 || /jwt|token/i.test(message);
  if (!response.ok && expired && token && !retried && token === getCloudSession()?.access_token) {
    const renewed = await renewCloudSession().catch(() => null);
    if (renewed?.access_token) return cloudRequest(path, { ...options, token: renewed.access_token, retried: true });
  }
  if (!response.ok) throw new Error(message || "auth-error");
  return body;
}

// Requests that start together share one renewal.
let renewing = null;
function renewCloudSession() {
  renewing ||= refreshCloudSession().finally(() => { renewing = null; });
  return renewing;
}

// The saved sign-in, renewed first if it expires within a minute.
export async function freshCloudSession() {
  const session = getCloudSession();
  if (!session?.access_token || !session.refresh_token) return session;
  try {
    const { exp } = JSON.parse(atob(session.access_token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (exp * 1000 - Date.now() > 60000) return session;
  } catch { return session; }
  return renewCloudSession().catch(() => session);
}

export function saveCloudSession(session) {
  if (session?.access_token) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getCloudSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}

export function isCloudSignedIn() {
  return Boolean(getCloudSession()?.access_token);
}

export function clearCloudSession() {
  localStorage.removeItem(SESSION_KEY);
  LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  window.dispatchEvent(new Event("pp_auth_change"));
}

export async function signUpWithPassword({ email, password, displayName }) {
  const result = await cloudRequest(`/auth/v1/signup?redirect_to=${encodeURIComponent(authRedirect())}`, {
    method: "POST",
    // The time the terms and privacy policy were accepted is kept on the account.
    body: JSON.stringify({ email, password, data: { display_name: displayName, terms_accepted_at: new Date().toISOString() } }),
  });
  if (result.access_token) saveCloudSession(result);
  return result;
}

export async function resendConfirmationEmail(email) {
  return cloudRequest(`/auth/v1/resend?redirect_to=${encodeURIComponent(authRedirect())}`, {
    method: "POST",
    body: JSON.stringify({ type: "signup", email }),
  });
}

export async function requestPasswordRecovery(email) {
  return cloudRequest(`/auth/v1/recover?redirect_to=${encodeURIComponent(authRedirect("recovery"))}`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function updatePassword({ accessToken, password }) {
  const user = await cloudRequest("/auth/v1/user", { method: "PUT", token: accessToken, body: JSON.stringify({ password }) });
  const session = getCloudSession();
  if (session?.access_token === accessToken) saveCloudSession({ ...session, user });
  return user;
}

export async function signInWithPassword({ email, password }) {
  const result = await cloudRequest("/auth/v1/token?grant_type=password", { method: "POST", body: JSON.stringify({ email, password }) });
  saveCloudSession(result);
  return result;
}

export async function refreshCloudSession() {
  const session = getCloudSession();
  if (!session?.refresh_token) throw new Error("missing-refresh-token");
  const result = await cloudRequest("/auth/v1/token?grant_type=refresh_token", { method: "POST", body: JSON.stringify({ refresh_token: session.refresh_token }) });
  saveCloudSession(result);
  return result;
}

// After clicking a confirmation or recovery link, the tokens arrive in the address (#access_token=…).
export async function sessionFromUrl() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const accessToken = hash.get("access_token");
  if (!accessToken) return null;
  const user = await cloudRequest("/auth/v1/user", { method: "GET", token: accessToken });
  const session = { access_token: accessToken, refresh_token: hash.get("refresh_token"), user, authType: hash.get("type") };
  saveCloudSession(session);
  window.dispatchEvent(new Event("pp_auth_change"));
  window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}`);
  return session;
}

export async function signOutCloud() {
  const session = getCloudSession();
  if (session?.access_token && isCloudAuthConfigured()) {
    await cloudRequest("/auth/v1/logout", { method: "POST", token: session.access_token }).catch(() => null);
  }
  clearCloudSession();
}
