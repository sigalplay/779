# Live entrypoint matrix

Audit date: 2026-09-24

This file records the version drift that must be eliminated by the reconstructed source build.

| Entrypoint | Core JS | Core CSS | Notable runtime layers |
|---|---|---|---|
| `/` | `index-HomeV16.js` | `index-CxkEiuAw.css?v=110` | Therapist board up to tabs v112, session CSS v109, drawing v107, signs v106, games v100, board/search v102, language switch v102 |
| `/en/` | `index-HomeV16.js` | `index-s5xYDAky.css` | Older therapist layers: cloud v92, session v93, drawing v93, signs v95, board/search v96; English boot and translation overlays |
| Standard parent route HTML | `index-HomeV16.js` | `index-s5xYDAky.css` | Mobile tools v96, board/search v96, language switch, calendar QA |
| Hebrew calendar | `index-HomeV16.js` | `index-s5xYDAky.css` | Multi-photo CSS v105 / JS v108, print fix v104, mobile calendar v88 |
| English calendar | `index-HomeV16.js` | `index-s5xYDAky.css` | Hebrew calendar layers plus English calendar v104 and English overlays |
| Routine-board hub | Standalone HTML | Inline CSS | Board/search v96 and mobile guidance CSS |
| ADL sequences | Standalone HTML | Inline CSS | Mobile tools, calendar QA, board/search v96, reorder overlay |
| Printable game generator | Standalone JS `card-games-generator-v1.js?v=24` | Generator CSS and fixes v15 | Independent from React application |

## Consequence

Client-side navigation retains the entrypoint assets that were loaded first. A hard refresh can load another HTML entrypoint with older CSS and script versions. Therefore the same React route can look or behave differently before and after refresh.

## Target state

- One generated core CSS version across every React entrypoint.
- One source-owned language mechanism.
- One source-owned therapist board implementation.
- Standalone tools may remain separate only when intentional, with shared tokens/header/SEO generated from the same source.
- Every public route must have stable canonical, hreflang, metadata, and refresh behavior.

