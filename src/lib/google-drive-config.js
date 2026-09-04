// Google Drive integration configuration for "הערות טיפול" (session notes).
//
// This Client ID is NOT a secret — OAuth Client IDs for web apps are public
// identifiers, safe to ship in client-side code. It's the same ID for every
// therapist who uses the site; each therapist still grants their OWN, separate
// consent to their OWN Google account when they click "connect."
//
// To get one:
//   1. Go to https://console.cloud.google.com/ and create a project (free).
//   2. Enable the "Google Drive API" for that project (APIs & Services > Library).
//   3. Go to APIs & Services > Credentials > Create Credentials > OAuth client ID.
//      - Application type: "Web application"
//      - Authorized JavaScript origins: add the exact URL(s) where this site is
//        hosted (e.g. https://your-site.com). For local testing, also add
//        http://localhost:5173 (Vite's default dev port).
//   4. Configure the OAuth consent screen (APIs & Services > OAuth consent screen).
//      You can keep it in "Testing" mode with a list of allowed test-user emails
//      while trying this out — no Google review needed for that. Publishing it
//      for any therapist to sign in requires Google's verification, but the
//      scope used here (drive.file) qualifies for the lighter-weight review.
//   5. Paste the resulting Client ID below.
export const GOOGLE_CLIENT_ID = ""; // <-- paste your OAuth Client ID here

// "drive.file" is the narrowest useful scope: the app can only see/edit files
// it created itself, never the therapist's other Drive content.
export const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

export function isGoogleDriveConfigured() {
  return Boolean(GOOGLE_CLIENT_ID);
}
