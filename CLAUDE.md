# CLAUDE.md – commitment-interactive

<!-- source: own rule (project kick-off with Daniel Nüst), added 2026-10-26 -->
## Purpose

This is an interactive, annotated version of the
[NFDI4Earth FAIRness and Openness Commitment](https://nfdi4earth.de/commitment)
(D4.2.1, v1.0, 2024-09, DOI [10.5281/zenodo.10123880](https://doi.org/10.5281/zenodo.10123880)).
It helps different stakeholders understand and implement the commitment:

- **Annotations** attach to sections, statements, sentences or single words. They have three depths:
  - `note`: one sentence, shown as a tooltip
  - `explainer`: a paragraph with links, shown as a popover
  - `deepdive`: several paragraphs with links and figures, shown as a side panel
- **Perspectives (roles):** student, researcher, institution, organisation/group. Policy makers and institutional leadership are possible future perspectives (README "Possible future work"); the mock-up has no placeholders for them.
- **Topics:** researcher activities such as research evaluation, proposal writing, scholarly communication, publishing, open access and reviewing. Researchers are the first target audience.
- **Concepts:** cross-cutting ideas such as openness, FAIRness, licensing, credit, infrastructure and standards. Each concept can have a vertical deep dive.

**Status:** the detail content is **fake example content** for mock-ups of the interaction mechanisms. Never present it as real guidance.

<!-- source: own rule, added 2026-10-26 -->
## Status and layout

- `mockup/`: a clickable HTML/CSS/JS mock-up with no build step; open `mockup/index.html` in a browser. It is the reference for the interaction design until the React app exists.
- **Planned app:** a stripped copy of the OneStop4All (OS4A) implementation at upstream commit `b39aaff` (v1.11.2, https://git.rwth-aachen.de/nfdi4earth/onestop4all/onestop4all-implementation), which uses Open Pioneer Trails, React 19, Chakra UI v3, Vite and pnpm. The repo has two workspace packages:
  - `src/apps/commitment-standalone/`: the thin host. It holds the OS4A theme, layout, header, footer and menu. The search bar and user support link out to the live OS4A.
  - `src/packages/commitment/`: the **drop-in unit**. OS4A will later mount it as one lazy route under `/commitment`, like the `/label` page.
- The full plan is in `~/.claude/plans/we-start-a-new-streamed-moler.md`; move the relevant parts to `docs/` once the project is scaffolded.

<!-- source: own rule, derived from OS4A code review, added 2026-10-26 -->
## OS4A compatibility rules

- Use OS4A's `theme.ts` tokens unchanged:
  - colours: primary `#05668D`, light `#2b9eab`, focus `#22C0D2`, border `#CCCCCC`, text boxes `#F7FAFC`
  - font: Arial
  - layout: breakpoint `custombreak` = 1000px, container `maxW={{ base: "100%", custombreak: "80%" }}`
  - buttons: square corners
- The `commitment` package must not import from `apps/`. It also must not depend on host services (search state, config, auth).
- Use relative routes only, so the package works under any mount path.
- No global CSS. Scope styles under `.commitment-view`; role and topic colours go in a theme fragment that the host merges.
- OS4A renders inside a **shadow root**:
  - never use `document.getElementById` or `querySelector` for scrolling or focus; use refs or `getRootNode()`
  - deep links use query params (`?focus=<anchor-id>`), not `#hash`
- i18n uses OS4A-style ICU YAML (`i18n/en.yaml`) through `useIntl` from `open-pioneer:react-hooks`. The app is English only for now, but no strings may be hard-coded in components.
- Code style is inherited from OS4A: Prettier with 4 spaces, double quotes, printWidth 100, no trailing commas; ESLint 9 flat config.

<!-- source: own rule, added 2026-10-26 -->
## Content model

- `commitment.md` holds the commitment text with `remark-directive` anchors, which need stable IDs:
  - `pre-1…5`, `intro`, `boxA`, `boxB`, `c1…c12`
  - phrase IDs such as `licences` (the mock-up uses plain phrase IDs; an unknown `cN-…` ID falls back to statement N)
- `annotations/*.yaml` hold the annotations: `id`, `target` (anchor ID), `depth`, `title`, `body` (Markdown), `links`, `figure`, `roles`, `topics`, `concepts`, `deepdive`.
- `roles.yaml`, `topics.yaml` and `concepts.yaml` define the facets. Each has `id`, `label`, `icon` and `colour`.
- Tests must check content integrity: every annotation target exists, every referenced facet exists, and IDs are unique.

<!-- source: own rule, added 2026-10-26 -->
## Sources for real content later

These are the starting points for the real deep-dive content. Don't use them for the mock-ups yet.

- **Canonical text:** `../nfdi4earth-deliverables/FAIRness-and-Openness-Commitment/NFDI4Earth_FAIRness-and-Openness-Commitment.source.md` (CC-BY 4.0)
- **"Additional Information" deliverable:** `../nfdi4earth-deliverables/FAIRness-and-Openness-Commitment-Additional-Information/`
  - Open Science statements (→ statements 2 and 4)
  - data acts (→ 3)
  - governing bodies and standards (→ 9 and 12)
- **Boxes on https://nfdi4earth.de/commitment:**
  - "Implementing the Commitment as an institution or organisation"
  - testimonials (AWI, GDI-DE, ZALF, TUD, BKG)
  - related commitments (FAIRagro, NFDI4Energy, NFDI4ING, CC-BY-US)
  - badge, citation and feedback
  - the three reference lists above
- **Consultation history and rationale:** `../nfdi4earth-deliverables/MS4.2.1/` and `MS4.2.2/`
- **Licensing (statement 8):** the `../licensing-and-openness/` audit of NFDI4Earth's own repositories
- **Signatories:** SPARQL query in `../commitment/website/n4e-signatories.js`

<!-- source: own rule, added 2026-10-26 -->
## Licensing

- **Code:** Apache-2.0, inherited from OS4A. Keep the upstream LICENSE and any SPDX headers.
- **Commitment text and content:** CC-BY 4.0. Cite it as "NFDI4Earth Consortium (2024), doi:10.5281/zenodo.10123880".
- Never list an AI as an author in metadata.

<!-- source: own rule, added 2026-10-26 -->
## Checks

- **Mock-up:** there are no automated checks. Verify it manually in a browser at desktop width and at mobile width (< 1000px).
- **App (once scaffolded):** `pnpm lint`, `pnpm check-types`, `CI=1 pnpm test run` and `pnpm build`.

<!-- source: Daniel Nüst, feedback on the mock-up, added 2026-10-26, updated 2026-10-26 -->
## Design decisions from mock-up feedback

- **One interaction method for all filters:** perspectives, topics and concepts are all toggle badges (chips), one row each. No drop-down menus for lenses.
- **The reading overview is a plain contents menu**, not a zoom/pan minimap. It keeps the synced current-section highlight and the lens hit/dim state. On mobile it is a bottom sheet behind a "Contents" button. Zoom and pan stay only in the overview map.
- **Scrollytelling (topic pages):** keep little vertical space between steps (about 14vh), so the next step is always visible. Show "Step x of n", progress dots and a "Next: …" cue.

<!-- source: Daniel Nüst, request to re-use NFDI4Earth colours; logos (2023) and Rollup service brick colours PDF (2026), added 2026-10-26 -->
## Colour palette

- Facet colours re-use the NFDI4Earth palette; the full list with sources is in `README.md#colour-palette`:
  - perspectives use the task-area logo colours (2Participate, 2Facilitate, 2Interoperate, 2Coordinate)
  - topics use the service brick colours
  - all concepts use the Commitment brick colour `#2A9D8F`
- The base UI stays on the OS4A theme (`#05668D`).
- Never put text directly in a facet colour on white, because several colours are too light. Use dark text with a coloured icon or border. On a coloured fill, choose dark or white text by contrast (`ink()` in `mockup/app.js`).
- **Shapes encode kinds** everywhere (badges, tags, counts, map nodes): perspectives and concepts are round pills, topics have 4px corners, statements are square. The map is called "Overview map", because it shows more than concepts.
