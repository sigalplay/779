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
| Auth (password sign-up, confirmation, recovery) | todo | |
| Calendar (photos, print, Google save) | done | See "Calendar" below |
| Cipher generator | done | Same keys and symbols as live; `?key=sukkot` opens the Sukkot key |
| Child boards, shared weekly board | done | "Make your own board" button, print logo and legal line |
| Favorites / board game favorite | done | Sends to sign-in with return address, as live |
| Therapist build / board / diary / patient | todo | |

## Patch files (`assets/*.js`, `assets/*.css`)

| Patch | Status | Notes |
|---|---|---|
| mobile-tools-v4.js / .css | todo | Menu layout, home cleanup, therapist shortcuts, print delay |
| v92-board-and-search.js / .css | partial | Name search on /parent/all and /therapist/all and compact catalog cards: done. Board dates and search in the builder: stage 4 |
| tip-close-fix.js, print-calendar-and-tip-fix.css | done | Tip close button in ParentPlay; phone style for the holidays link in mobile-tools-v4.css; print margins come from the print CSS (inline @page rules that live overrode were removed) |
| mobile-guidance-cards-v1.css | todo | |
| calendar-qa-v27.js / .css, mobile-calendar-compact-v1.css | done | "Day passed" is built into the shared calendar page |
| calendar-multi-photo-v1.js / .css, calendar-english-complete-v1.js | done | Built into the calendar components |
| mobile-context-nav-v1.js, mobile-search-filters-v1.js / .css | todo | |
| mobile-share-links-v1.js | done | Standalone pages: `standalone-page.js`. React boards: `components/ShareLinkField.jsx` (on live the patch did not take effect in the React share dialogs) |
| adl-sequence-reorder-v2.js | drop | Loaded only on the React home page, where nothing matches it; the ADL page has its own move buttons |
| v36-targeted-fixes.css | todo | |
| therapist-*.js / .css (tabs, header, session board, drawing, signs, games, cloud, search bridge) | todo | |
| english-content-v9, english-approved-v1, american-english-v1, us-english-polish-v2 | todo | Move all translations into source |
| language-switch-v1.js, english-route-boot-v93.js, english-ltr-v1/v2.css | todo | |
| google-snippet-guard-v1.js | todo | |
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
| /therapist/board/, /therapist/tools/, /therapist/my-patients/ | todo |
| English versions under /en/ | todo |
| ~250 SEO pages (activity/*, board-game/*, en/*) | todo |

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
