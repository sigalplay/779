import { SUPABASE_ANON_KEY, SUPABASE_URL, cloudRequest, getCloudSession, isCloudAuthConfigured, saveCloudSession } from "@/lib/cloud-auth";

// "My images": each therapist's own photos for the session board (Supabase storage bucket
// "therapist-images", folder = her user id, plus the table therapist_images for names).
const BUCKET = "therapist-images";

function session() {
  const current = getCloudSession();
  if (!isCloudAuthConfigured() || !current?.access_token || !current?.user?.id) throw new Error("cloud-session-required");
  return current;
}

const authHeaders = (token) => ({ apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` });

// Before her first upload, the therapist confirms once that she uploads only equipment and materials,
// with no children. The time she confirmed is kept on her account.
export function imagesTermsAccepted() {
  return Boolean(getCloudSession()?.user?.user_metadata?.images_terms_accepted_at);
}

export async function acceptImagesTerms() {
  const current = session();
  const user = await cloudRequest("/auth/v1/user", {
    method: "PUT",
    token: current.access_token,
    body: JSON.stringify({ data: { images_terms_accepted_at: new Date().toISOString() } }),
  });
  saveCloudSession({ ...getCloudSession(), user });
}

// Images with a temporary address (valid for an hour) to show them.
export async function listMyImages() {
  const current = session();
  const rows = await cloudRequest("/rest/v1/therapist_images?select=id,name,path,created_at&order=created_at.desc", { token: current.access_token });
  if (!rows?.length) return [];
  const signed = await cloudRequest(`/storage/v1/object/sign/${BUCKET}`, {
    method: "POST",
    token: current.access_token,
    body: JSON.stringify({ expiresIn: 3600, paths: rows.map((row) => row.path) }),
  });
  const urls = new Map((signed || []).filter((item) => item.signedURL).map((item) => [item.path, `${SUPABASE_URL}/storage/v1${item.signedURL}`]));
  return rows.map((row) => ({ ...row, url: urls.get(row.path) || null }));
}

// `dataUrl` is an already resized JPEG (readPhotoFile).
export async function uploadMyImage(name, dataUrl) {
  const current = session();
  const blob = await (await fetch(dataUrl)).blob();
  const path = `${current.user.id}/${crypto.randomUUID()}.jpg`;
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: { ...authHeaders(current.access_token), "Content-Type": "image/jpeg" },
    body: blob,
  });
  if (!response.ok) throw new Error("upload-failed");
  const rows = await cloudRequest("/rest/v1/therapist_images", {
    method: "POST",
    token: current.access_token,
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ user_id: current.user.id, name, path }),
  });
  return { ...rows?.[0], url: dataUrl };
}

export async function deleteMyImage(image) {
  const current = session();
  await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${image.path}`, { method: "DELETE", headers: authHeaders(current.access_token) });
  await cloudRequest(`/rest/v1/therapist_images?id=eq.${encodeURIComponent(image.id)}`, {
    method: "DELETE",
    token: current.access_token,
    headers: { Prefer: "return=minimal" },
  });
}

// A copy of the image as a data URL, so a board keeps showing it after the address expires.
export async function imageAsDataUrl(url) {
  const blob = await (await fetch(url)).blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
