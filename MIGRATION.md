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
| Site shell: header, menu, footer, bottom bar, accessibility | done | |
| Cookie consent + Google Analytics after consent | done | |
| Legal pages (privacy, terms, cookies) | done | |
| All pages open without login | done | Live removed the login gate |
| Auth (password sign-up, confirmation, recovery) | todo | |
| Calendar (photos, print, Google save) | todo | |
| Cipher generator | todo | |
| Therapist build / board / diary / patient | todo | |

## Patch files (`assets/*.js`, `assets/*.css`)

| Patch | Status | Notes |
|---|---|---|
| mobile-tools-v4.js / .css | todo | Menu layout, home cleanup, therapist shortcuts, print delay |
| v92-board-and-search.js / .css | todo | Activity name search, board dates, language sync |
| tip-close-fix.js, print-calendar-and-tip-fix.css | todo | |
| mobile-guidance-cards-v1.css | todo | |
| calendar-qa-v27.js / .css, mobile-calendar-compact-v1.css | todo | |
| calendar-multi-photo-v1.js / .css, calendar-english-complete-v1.js | todo | |
| mobile-context-nav-v1.js, mobile-search-filters-v1.js / .css | todo | |
| mobile-share-links-v1.js | todo | |
| adl-sequence-reorder-v2.js | todo | |
| v36-targeted-fixes.css | todo | |
| therapist-*.js / .css (tabs, header, session board, drawing, signs, games, cloud, search bridge) | todo | |
| english-content-v9, english-approved-v1, american-english-v1, us-english-polish-v2 | todo | Move all translations into source |
| language-switch-v1.js, english-route-boot-v93.js, english-ltr-v1/v2.css | todo | |
| google-snippet-guard-v1.js | todo | |
| CipherGenerator-v99.js | todo | Hand-edited compiled chunk |
| home-*.js, sequence-direction-controls-v1.js, index-v99.js, activities-data-v97.js | drop | Not loaded by any page |

## Standalone pages (plain HTML, outside the React app)

| Page | Status |
|---|---|
| /parent/routine-boards/, /parent/daily-routine/, /child/daily-routine/ | todo |
| /parent/daily-sequences/ (ADL) | todo |
| /parent/school-holidays/ | todo |
| /parent/card-games-generator/ | todo |
| /therapist/board/, /therapist/tools/, /therapist/my-patients/ | todo |
| English versions under /en/ | todo |
| ~250 SEO pages (activity/*, board-game/*, en/*) | todo |

## How to check parity locally

The live site can be served from a checkout of `main` and compared page by page with a
build of `source/`. Rendered text, links and screenshots should match, except where a
difference is intentional and listed above.
