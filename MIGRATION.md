# Moving the live site into source

The live site (branch `main`) is a compiled React build plus about 40 "patch" files in
`assets/` that change the page after React renders it. This branch moves every change into
the React source under `source/`, so the site can be built from one place.

Status: `done` = behavior is in source, `todo` = not yet, `drop` = intentionally not carried over.

## Content and data

| Item | Status | Notes |
|---|---|---|
| Activities seed-114..120, tag cleanup, hidden seed-28/31 | done | Identical to live `SEED_ACTIVITIES` |
| Activity English content, titles, terms | done | American English, from live chunks |
| Recipes (batch size), experiments wording, English data | done | Scaling verified for all recipes |
| Social stories (4 new, choices, background removal) | done | Face-on-body preview restored (was lost on live) |
| Morning/evening routine characters | done | |
| Board games English text | done | |
| Static media (icon-bank, downloads, fonts, mediapipe) | done | Moved to `source/public` |

## Compiled app changes (from `index-HomeV16.js` and page chunks)

| Item | Status | Notes |
|---|---|---|
| Home page (cards, quick links, seasonal switcher) | done | |
| Activity page (illustration toggle, print sheet) | done | |
| Parent activity finder (age filter) | done | |
| Age label "6 months–1 year" | done | Live shows it only in the parent area; source uses it everywhere |
| Page titles on /about, /parent/recipes, /parent/experiments | review | Live shows the generic site title; source gives each page its own title. To be decided in the SEO stage |
| Site shell: header, menu, footer, bottom bar, accessibility | done | |
| Cookie consent + Google Analytics after consent | done | |
| Legal pages (privacy, terms, cookies) | done | |
| All pages open without login | done | Live removed the login gate |
| Auth (password sign-up, confirmation, recovery) | done | Same requests and saved session as live (tested with a simulated server); new two-panel design |
| Cloud sync of favorites, folders, plans | done | `lib/cloud-data.js`, called from `lib/storage.js` like live |
| Signed-in check | done | Uses the cloud session, as live (the source used a local profile) |
| CMS (published edits, admin page) | done | Uses the live project by default |
| Profile page | done | Same as live |
| Calendar (photos, print, Google save) | done | See "Calendar" below |
| Cipher generator | done | Same keys and symbols as live; `?key=sukkot` opens the Sukkot key |
| Child boards, shared weekly board | done | "Make your own board" button, print logo and legal line |
| Favorites / board game favorite | done | Sends to sign-in with return address, as live |
| Therapist builder and treatment board | done | See "Treatment board" below |
| Therapist diary / patient / plans / session notes | done | Text matches live at both widths; adding a client in the diary saves the same data |

## Patch files (`assets/*.js`, `assets/*.css`)

| Patch | Status | Notes |
|---|---|---|
| mobile-tools-v4.js / .css | done | CSS imported; menu, home order, About copy, age labels, print delay, holidays link, tip-dialog classes are in the components. Therapist quick menu, top links and phone shortcuts: drop (never showed on live, the therapist header replaced them) |
| v92-board-and-search.js / .css | partial | Name search on /parent/all and /therapist/all and compact catalog cards: done. Board dates and search in the builder: stage 4 |
| tip-close-fix.js, print-calendar-and-tip-fix.css | done | Tip close button in ParentPlay; phone style for the holidays link in mobile-tools-v4.css; print margins come from the print CSS (inline @page rules that live overrode were removed) |
| mobile-guidance-cards-v1.css | done | Imported in main.jsx |
| calendar-qa-v27.js / .css, mobile-calendar-compact-v1.css | done | "Day passed" is built into the shared calendar page |
| calendar-multi-photo-v1.js / .css, calendar-english-complete-v1.js | done | Built into the calendar components |
| mobile-context-nav-v1.js, mobile-search-filters-v1.js / .css | done | Phone bottom bar per area in AppShell; folding filter groups and compact chips in ParentPlay/TherapistBuild. On live these only worked after arriving from the home page; now they always work |
| mobile-share-links-v1.js | done | Standalone pages: `standalone-page.js`. React boards: `components/ShareLinkField.jsx` (on live the patch did not take effect in the React share dialogs) |
| adl-sequence-reorder-v2.js | drop | Loaded only on the React home page, where nothing matches it; the ADL page has its own move buttons |
| v36-targeted-fixes.css | done | Imported in main.jsx |
| therapist-session-board, board-drawing, board-signs, board-games, cloud-board, board-search-bridge | done | Built into `pages/TherapistBuild.jsx` and `components/session-board/` |
| therapist-area-header-v1.js | done | Header links, phone bar and heading were already in AppShell; "לוח המפגש" heading and search-page class in the builder |
| therapist-tabs-v1.js / .css | done | Redirects in App routes; the tab row only lives on the standalone tools page |
| therapist-free-board-v1.js / .css, therapist-board-fullscreen/activity CSS | drop | Only loaded by /therapist/board/, which always redirected to the treatment board |
| patients-site-header-v1, therapist-patients-v1, patients-mobile-workflow-v1 | done | Moved next to /therapist/my-patients/ (patients.js, patients.css) |
| therapist-tools-v1.css | done | Moved next to /therapist/tools/ (tools.css) |
| english-content-v9, english-approved-v1, american-english-v1, us-english-polish-v2, runtime-ui-en | done | Every screen now has its English written next to the Hebrew (`t("עברית", "English")`). The page-rewriting translators are gone (`lib/runtime-ui-en.js` deleted) |
| language-switch-v1.js, english-route-boot-v93.js, english-ltr-v1/v2.css | done | Switch buttons in AppShell, /en routes in App.jsx, english-ltr CSS imported |
| google-snippet-guard-v1.js | done | `data-nosnippet` on the disclaimer paragraph of the legal page |
| CipherGenerator-v99.js | done | Hand-edited compiled chunk, now in `pages/CipherGenerator.jsx` |
| home-*.js, sequence-direction-controls-v1.js, index-v99.js, activities-data-v97.js | drop | Not loaded by any page |

## Standalone pages (plain HTML, outside the React app)

| Page | Status |
|---|---|
| /parent/routine-boards/, /parent/daily-routine/, /child/daily-routine/ (+ /en/) | done |
| /parent/daily-sequences/ (ADL) (+ /en/) | done |
| /parent/school-holidays/ | done |
| /parent/card-games-generator/ | done |

These pages live in `source/public/` as plain HTML. They no longer load the site-wide patch
files (checked: pixel-identical without them). Their only shared helper is
`public/standalone-page.js` (print delay for iPhone, tap-to-open share link on phones).
The game builder's script and styles moved next to the page (`generator.js`, `generator.css`).
In English mode, menu links to these pages now go to the `/en/` copy (live sent them to the Hebrew page).
| /therapist/board/, /therapist/tools/, /therapist/my-patients/ | done |
| English versions under /en/ | done (React pages translate themselves; standalone pages have /en/ copies) |
| ~250 SEO pages (activity/*, board-game/*, en/*) | done — built from source, see "Search engines (stage 7)" |

## How to check parity locally

The live site can be served from a checkout of `main` and compared page by page with a
build of `source/`. Rendered text, links and screenshots should match, except where a
difference is intentional and listed above.

## Calendar

Checked against live: the dates, holidays and school breaks match for 6,573 days, and the
printout is exactly 12 pages (desktop, phone, "decorate yourself" and English).

Changes from live, on purpose:
- Up to 5 photos per month, move and resize, as on live. In "one photo" mode the photos
  now show on every month in the preview too (live showed them only on the month where
  they were added, but printed them on all months). In "one for each month" mode each month
  prints its own photos (live printed the current month's photos on every page).
- Printed pages show the logo at the top and the copyright line at the bottom. Live showed
  only one of the two, depending on how the page was opened.
- "Day passed" on a shared calendar link now works when the link is opened directly (on live
  it only worked after navigating inside the site).
- English: all holiday names are in English (live left most of them in Hebrew), the calendar
  uses the English logo, and the shared link opens in English. Hebrew dates are hidden in
  English, as on live.
- The "Ministry of Education holidays" link shows only in Hebrew (that page is Hebrew only).

## Treatment board

Checked against live with the same actions on both: adding signs and games, reordering,
deleting, marking done, drawing with the pen, adding a photo, copying to next week, moving
between dates, and a client (cloud) board with simulated database answers. The saved data and
the database requests are identical.

The saved formats did not change (`pp_draft_plan`, `boo_guest_boards_by_date`,
`boo_board_drawing_*`, `boo_active_cloud_patient`, the `daily_meeting_boards` table), so boards
therapists already saved still open.

Changes from live, on purpose:
- Adding an activity from the search page to today's board no longer disappears when you
  return to the board (live reloaded the older saved board over it).
- Adding an obstacle course from a board of another date returns to that date (live jumped to
  today's board and overwrote it).
- Links from a client board (activity page, obstacle course) come back to the same client board.
- English: "mark as completed" labels are in English; `/en/therapist/...` opens the English
  builder (live showed the Hebrew home page).
- The legal line is hidden under the treatment board, like the site footer.
- The board no longer reloads the page after each change.

## Accounts

The cloud project address and public key default to the live project (`lib/cloud-auth.js`), so
a build without extra settings behaves like the live site. The old "beta email" and "local test
mode" sign-ins were removed; accounts are email + password only, as on live.

Sign-in screens: same flow and texts as live, with a new layout (brand panel on desktop, clearer
fields with show-password, a live "8 characters" check, errors shown next to the form).
The password label reads "סיסמה" with a separate "לפחות 8 תווים" check instead of one combined label.

## English (stage 6)

- No Hebrew is left on English pages (checked with a crawler over 35 English pages, phone and desktop).
- Wording follows the live English site. Where live had no English (toasts, dialogs, error messages,
  some labels) I wrote it; those strings are listed in `ENGLISH-NEW.md` for review.
- Sample clients in the therapist calendar get English names in English (Emma, Ethan, Maya, Noah).
- Page titles of activities, games, recipes and experiments are English in English mode (live showed Hebrew).
- Links for the child's phone (morning/evening boards) open in English when made in English.
- Removed unused code: pages/Home.jsx, pages/Pricing.jsx, components/ActivityGenerator.jsx and
  the libraries only they used (not reachable from any route on live either).

Fixed live bugs (for review):
- On phones the "report a mistake" button sat exactly under the accessibility button and could not be tapped. It now sits above it.
- On desktop pages that load the newer CSS, the accessibility button covered the "report a mistake" button. It is now above it, as on the other pages.
- The phone bottom bar and search filters depended on which page you entered from; now always the same.
- "Build a Visual Schedule for a Therapy Session" overflowed the phone screen in English; now "Plan a Therapy Session" (same as the home page).

## Search engines (stage 7)

`npm run build` (in `source/`) now runs `vite build` and then `scripts/prerender.mjs`, which opens every
public page in a headless Chrome and saves it as ready HTML: the full page text, its own title,
description, address, language pair and structured data. `dist/` is the whole site, ready to publish.

- One place for page tags: `src/lib/seo.js`. The build writes them into each saved page and
  `components/SeoManager.jsx` uses the same code in the browser, so the two always agree.
- Pages saved: the fixed pages, every activity, board game, recipe and experiment, in Hebrew and
  English (314). Personal pages (therapist tools, accounts, child links) get an empty page with
  `noindex`, so their address works directly. `404.html` is the same, for any other address.
- `sitemap.xml` is written by the build from the same list, with the language pairs and the main picture
  of each page. `public/sitemap.xml` and `scripts/generate-sitemap.mjs` were removed.
- The build fails if a page cannot be saved, if its title in the app differs from `seo.js`, or if a
  saved page links to a file that does not exist.

Fixed on the live site (why Google did not index many pages):
- 249 of the 268 live pages were empty until the app ran; now every indexed page has its text in the HTML.
- After loading, the app set every English page's main address (canonical) to the Hebrew page, so the
  English pages were treated as copies. Each page now names itself, with the address ending in `/`
  (the address without `/` is a redirect on GitHub Pages).
- `/en/...` addresses moved the visitor to the Hebrew address with English text. English pages now stay
  under `/en/`: the router runs with `basename="/en"`, the language comes from the address, and the
  language switch opens the same page in the other language.
- Recipe and experiment cards were buttons, so search engines could not reach them. They are links now,
  and each recipe and experiment has its own page: `/parent/recipes/<id>/`, `/parent/experiments/<id>/`
  (old `?r=` and `?e=` links still work).
- The "What should we play today?" page had no `<h1>`.
- `seed-28` and `seed-31` (removed from the catalog) had live pages saying "Activity not found"; they are gone.

Other changes:
- Titles of playful activities say "משחק לילדים" / "Game for Kids" instead of "פעילות לילדים"
  (activities in the categories משחק, משחק חברתי, משחק ופנאי, or with משחק/תופסת/מחבואים in the title).
- Descriptions come from the activity data. On live, 38 pages had only the title as the description
  or a generic English line.
- Structured data: HowTo for activities and experiments, Recipe for recipes, Game for board games,
  Organization + WebSite on the home page.
- Every picture has alt text that says what it shows and where: "אני מצחצחת שיניים – לוח התארגנות
  בוקר לילדים", "מגש חושי – פעילות לילדים" (`imageAlt` in `lib/image-seo.js`). Pictures without their own
  alt get the text next to them plus the page type, instead of a guess from the file name.
- 8 pictures and one printable (the shark PDF and its preview) were linked under names that do not
  exist (broken on live too); they point at the existing files now.
- The English text of the board game "Submarines" described Battleships; it is translated from the Hebrew now.
- Cloudflare Web Analytics is back on the React pages (live had it; the source had dropped it).
- A saved page stays on screen while its code loads, without the entrance animation, so it does not flash.

Publishing: `.github/workflows/site.yml` builds on every push. It publishes to GitHub Pages only from
`main`, and only after Settings → Pages → Source is "GitHub Actions" and the repository variable
`PAGES_FROM_ACTIONS` is `true`. Until then the live site is still served from the files in `main`.
