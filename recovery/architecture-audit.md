# Current live architecture audit

Audit date: 2026-09-24

Repository: `sigalplay/779`

Production baseline commit: `49e0a2a19b02bdf5dbb04568d89bd1b76d280875`

This directory is documentation only. Nothing under `recovery/` is loaded by the live website.

## Source-of-truth decision

- The current production behavior and public URLs are the product source of truth.
- The original v774 archive is a structural reference only. It must not be deployed as a replacement for the current website.
- The production repository currently contains compiled bundles, standalone pages, and runtime overlays, but no complete buildable React source tree.
- Reconstruction must preserve current behavior before runtime overlays are removed.

## Current architecture

The live website combines three mechanisms:

1. A compiled React/Vite application loaded by `assets/index-HomeV16.js`.
2. Standalone HTML tools such as the printable game generator, routine-board hub, and ADL sequences.
3. Runtime JavaScript and CSS overlays that query and modify the rendered DOM.

The same route can receive a different CSS or overlay version depending on whether it is reached through client-side navigation or a hard refresh. This is the root cause of route-versus-refresh visual changes.

## Systems that must be preserved

### Shared application

- Hebrew RTL and American English LTR.
- Header, menu, mobile bottom navigation, accessibility control, cookies dialog, legal footer, and Cloudflare analytics.
- Favorites, authentication/profile, About, privacy, terms, cookies, and contact links.
- SEO metadata, canonical URLs, hreflang pairs, structured data, sitemap, and social previews.

### Parent tools

- Parent activity search and all-activities bank.
- Activity detail pages and printable attachments.
- Recipes and experiments.
- Social Story Builder with seven templates, optional local face photo, local background removal, preview, and story creation.
- Routine-board hub, daily routine, morning routine, evening routine, weekly board, and child/shared views.
- ADL visual sequences with selection, ordering, layout, and print behavior.
- Family calendar with September-to-August year, holidays, school breaks, personal events, image modes, multiple photos, sharing, Google save, and print.
- Printable game generator with Lotto, Memory, Who Am I, Explain the Picture, Double, Domino, and Quartets.
- Cipher generator and seasonal home content.

### Therapist tools

- Therapist activity search and treatment-plan builder.
- Session board as the therapist entry destination.
- Previous/today/next treatment dates, saved boards, and copy-to-next-week.
- Guest boards and cloud patient boards.
- Add activity, motor trail, visual timer, camera/photo, pen/drawing, agreed signs, games, reorder, delete, and fullscreen exit.
- Therapist diary, patients, saved plans, session notes, recipes, experiments, board games, routines, and calendar.
- Fullscreen tools drawer must coexist with checklist interaction and contain sitting, coloring, cutting, writing, signs, timer, and pen.

### Content baseline

- The v774 source contains 93 activities and ends at `seed-113`.
- The live compiled data contains 104 activities and ends at `seed-120`.
- The live sitemap contains 262 public URLs, including 130 English URLs, 101 activity URLs, and 11 board-game URLs.
- Current seasonal Sukkot content includes the family calendar, heart chain, 3D sukkah, and Sukkot cipher.

## Known parity risks

- Route HTML files load different versions of the shared CSS and overlay scripts.
- English pages still contain some Hebrew runtime labels in therapist, diary, calendar, and accessibility areas.
- Several current features exist only in compiled bundles or runtime DOM overlays, not in source components.
- Some standalone pages duplicate functionality that also exists as React routes.
- Runtime overlays use MutationObserver, localStorage, forced reloads, and DOM class selectors, making them sensitive to unrelated layout changes.

## Reconstruction rules

- Work only on a recovery branch until full parity is verified.
- Do not deploy or modify `main` during reconstruction.
- Implement each feature in React/source modules rather than adding another runtime overlay.
- Preserve current production assets and public route HTML until the replacement build passes parity checks.
- Do not remove an overlay until its replacement source behavior has passed Hebrew/English and phone/tablet/desktop tests.
- Preserve SEO files and URL structure independently of the application refactor.

