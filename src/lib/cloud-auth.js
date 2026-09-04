const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const SESSION_KEY = "boo_cloud_session";
const LOCAL_TEST_KEY = "boo_local_test_session";
const BETA_ACCESS_KEY = "boo_beta_email_access";

export function isCloudAuthConfigured() { return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY); }
function headers(token) {
  return {
    apikey: SUPABASE_ANON_KEY,
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
  return Boolean(getCloudSession()?.access_token) || localStorage.getItem(BETA_ACCESS_KEY) === "active" || (!isCloudAuthConfigured() && localStorage.getItem(LOCAL_TEST_KEY) === "active");
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
  const result = await request("/auth/v1/signup", { method: "POST", body: JSON.stringify({ email, password, data: { display_name: displayName } }) });
  if (result.access_token) saveCloudSession(result);
  return result;
}
export async function signInWithPassword({ email, password }) {
  const result = await request("/auth/v1/token?grant_type=password", { method: "POST", body: JSON.stringify({ email, password }) });
  saveCloudSession(result);
  return result;
}
export async function sendMagicLink(email, redirectTo = `${window.location.origin}/auth`) {
  return request(`/auth/v1/otp?redirect_to=${encodeURIComponent(redirectTo)}`, { method: "POST", body: JSON.stringify({ email, create_user: true }) });
}
export async function completeMagicLinkFromUrl() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  if (!accessToken) return null;
  const user = await request("/auth/v1/user", { method: "GET", token: accessToken });
  const session = { access_token: accessToken, refresh_token: refreshToken, user };
  saveCloudSession(session);
  window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}`);
  return session;
}
export async function signOutCloud() {
  const session = getCloudSession();
  if (session?.access_token && isCloudAuthConfigured()) await request("/auth/v1/logout", { method: "POST", token: session.access_token }).catch(() => null);
  clearCloudSession();
}
