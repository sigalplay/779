export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "https://qcklptudfclzvddjarkw.supabase.co").replace(/\/$/, "");
export const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_8Bp_l_qcOxT2A67Sw2T35A_aVCvWh8H";
const SESSION_KEY = "boo_cloud_session";
const LOCAL_TEST_KEY = "boo_local_test_session";
const BETA_ACCESS_KEY = "boo_beta_email_access";
const AUTH_SITE_URL = (import.meta.env.VITE_SITE_URL || "https://letsplayot.com").replace(/\/$/, "");

function authRedirectUrl(mode = "login") {
  return `${AUTH_SITE_URL}/auth?mode=${mode}`;
}

export function isCloudAuthConfigured() { return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY); }
function headers(token) {
  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
}
async function request(path, options = {}) {
  if (!isCloudAuthConfigured()) throw new Error("cloud-not-configured");
  const response = await fetch(`${SUPABASE_URL}${path}`, { ...options, headers: { ...headers(options.token), ...options.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.msg || body.message || body.error_description || "auth-error");
  return body;
}
export function saveCloudSession(session) { if (session?.access_token) localStorage.setItem(SESSION_KEY, JSON.stringify(session)); }
export function getCloudSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; } }
export function isCloudSignedIn() {
  return Boolean(getCloudSession()?.access_token);
}
export function startBetaEmailAccess() {
  localStorage.setItem(BETA_ACCESS_KEY, "active");
  window.dispatchEvent(new Event("pp_auth_change"));
}
export function startLocalTestSession() {
  if (isCloudAuthConfigured()) return false;
  localStorage.setItem(LOCAL_TEST_KEY, "active");
  window.dispatchEvent(new Event("pp_auth_change"));
  return true;
}
export function clearCloudSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LOCAL_TEST_KEY);
  localStorage.removeItem(BETA_ACCESS_KEY);
  window.dispatchEvent(new Event("pp_auth_change"));
}
export async function signUpWithPassword({ email, password, displayName }) {
  const redirectTo = authRedirectUrl();
  const result = await request(`/auth/v1/signup?redirect_to=${encodeURIComponent(redirectTo)}`, { method: "POST", body: JSON.stringify({ email, password, data: { display_name: displayName } }) });
  if (result.access_token) saveCloudSession(result);
  return result;
}
export async function resendSignupConfirmation(email) {
  const redirectTo = authRedirectUrl();
  return request(`/auth/v1/resend?redirect_to=${encodeURIComponent(redirectTo)}`, {
    method: "POST",
    body: JSON.stringify({ type: "signup", email }),
  });
}
export async function requestPasswordReset(email) {
  const redirectTo = authRedirectUrl("recovery");
  return request(`/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
export async function updateCloudPassword({ accessToken, password }) {
  const user = await request("/auth/v1/user", {
    method: "PUT",
    token: accessToken,
    body: JSON.stringify({ password }),
  });
  const session = getCloudSession();
  if (session?.access_token === accessToken) saveCloudSession({ ...session, user });
  return user;
}
export async function signInWithPassword({ email, password }) {
  const result = await request("/auth/v1/token?grant_type=password", { method: "POST", body: JSON.stringify({ email, password }) });
  saveCloudSession(result);
  return result;
}
export async function refreshCloudSession() {
  const session = getCloudSession();
  if (!session?.refresh_token) throw new Error("missing-refresh-token");
  const result = await request("/auth/v1/token?grant_type=refresh_token", {
    method: "POST",
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  saveCloudSession(result);
  return result;
}
export async function completeMagicLinkFromUrl() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  const authType = hash.get("type");
  if (!accessToken) return null;
  const user = await request("/auth/v1/user", { method: "GET", token: accessToken });
  const session = { access_token: accessToken, refresh_token: refreshToken, user, authType };
  saveCloudSession(session);
  window.dispatchEvent(new Event("pp_auth_change"));
  window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}`);
  return session;
}
export async function signOutCloud() {
  const session = getCloudSession();
  if (session?.access_token && isCloudAuthConfigured()) await request("/auth/v1/logout", { method: "POST", token: session.access_token }).catch(() => null);
  clearCloudSession();
}
