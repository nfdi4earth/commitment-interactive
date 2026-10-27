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

<!-- source: own rule, added 2026-10-26, updated 2026-10-27 -->
## Status and layout

- `src/packages/commitment/content/` ("`content/`" below): all texts as Markdown files, see "Content model". It is inside the package so that it moves with it into OS4A; `.prettierignore` keeps Prettier off it. `tools/build-content.mjs` turns them into `mockup/data.js`.
- `mockup/`: a clickable HTML/CSS/JS mock-up that runs without a build step (only the content needs one); open `mockup/index.html` in a browser. It was the reference for the interaction design; the React app now has all its pages. Retire it once the React app is deployed (then also drop `tools/build-content.mjs`'s `mockup/data.js` output).
- **React app (all pages of the mock-up built):** the shell of the OneStop4All (OS4A) implementation at upstream commit `b39aaff` (v1.11.2, https://git.rwth-aachen.de/nfdi4earth/onestop4all/onestop4all-implementation), which uses Open Pioneer Trails, React 19, Chakra UI v3, Vite and pnpm. Root tooling (`package.json`, `pnpm-workspace.yaml` with the catalog, lockfile, ESLint, Prettier, `tsconfig`, `vite.config.ts`, `patches/`, `.husky/`) is copied from OS4A and trimmed. The repo has two workspace packages:
  - `src/apps/commitment-standalone/`: the thin host. It holds the OS4A theme (`theme.ts`, unchanged), layout, header, footer and menu, copied from OS4A and cut down. The search bar opens the live OS4A search, and user support is a `mailto:` link to the helpdesk (`links.ts`). It renders `<commitment-app>` in a shadow root and redirects `/` to `/commitment`.
  - `src/packages/commitment/`: the **drop-in unit**. It exports `commitmentRoutes` (relative routes) that OS4A will later mount under `commitment/*`, like the `/label` page. An ESLint rule forbids imports from the host app.
    - `model/`: `parse.ts` (front matter with `js-yaml`, quote matching, all content checks), `content.ts` (loads `content/**/*.md` with `import.meta.glob`), `lens.ts`, `types.ts`. Annotated quotes become Markdown links `[quote](annotation:<id>)` that `components/Markdown.tsx` renders as annotation buttons.
    - `views/Reader/`: lens bar, contents menu, statements, annotations (note = Chakra Tooltip, explainer = Popover, deep dive = Drawer) and the statement panel; `?focus=` deep links.
    - `views/`: `IndexView` (`for`, `topics`, `concepts`), `PerspectiveView` (`for/:id`), `TopicView` (`topics/:id`, scrollytelling), `DeepDiveView` (`deep-dive/:id`) and `MapView` (`map`, `@xyflow/react`, lazy-loaded; its base CSS is loaded scoped in `styles.scss`). Unknown paths redirect to the reader.
    - **Host contract:** the host mounts `commitmentRoutes` as children of a splat route (`commitment/*`); `CommitmentRoot` derives the base path for links from the splat. The host also sets the CSS variable `--commitment-sticky-top` to the height of its fixed header (see `layouts/layout.tsx`), so the sticky lens bar sits below it.
- **Node and pnpm:** OS4A needs Node ≥ 20 and pnpm 10 (`engines` in `package.json`). On this machine use the nvm Node 22 (`PATH=$HOME/.nvm/versions/node/v22.23.3/bin:$PATH`); the default Node 18 is too old for the app (the content script works with both).
- `pnpm install` runs husky, which sets `core.hooksPath` so the **pre-commit hook runs lint, Prettier, type check and tests** (from OS4A). `NO_VERIFY=1` skips it; never use that to get around a failing check (G2.2).
- How to add the package to OS4A, and what to decide before going live: `docs/integration.md` (tested against OS4A `b39aaff` on 2026-10-27). Keep it current when the host contract changes. The original plan is in `~/.claude/plans/we-start-a-new-streamed-moler.md`.

<!-- source: own rule, derived from OS4A code review, added 2026-10-26, updated 2026-10-27 -->
## OS4A compatibility rules

- Use OS4A's `theme.ts` tokens unchanged:
  - colours: primary `#05668D`, light `#2b9eab`, focus `#22C0D2`, border `#CCCCCC`, text boxes `#F7FAFC`
  - font: Arial
  - layout: breakpoint `custombreak` = 1000px, container `maxW={{ base: "100%", custombreak: "80%" }}`
  - buttons: square corners
- The `commitment` package must not import from `apps/`. It also must not depend on host services (search state, config, auth).
- Use relative routes only, so the package works under any mount path.
- No global CSS. Scope styles under `.commitment-view` (`styles.scss`, declared in the package's `build.config.mjs`). Overlays render in portals, so wrap their content in `Scoped` (`components/base.tsx`). Facet colours come from the content files and are set as CSS variables (`--c`, `--ink`, see `colourVars()` in `model/lens.ts`), not as theme tokens.
- OS4A renders inside a **shadow root**:
  - never use `document.getElementById` or `querySelector` for scrolling or focus; use refs or `getRootNode()`
  - deep links use query params (`?focus=<anchor-id>`), not `#hash`
- i18n uses OS4A-style ICU YAML (`i18n/en.yaml`, `i18n/de.yaml`) through `useIntl` from `open-pioneer:react-hooks`. OS4A declares English and German and Pioneer requires every package to support both, so every UI string needs both files (`i18n/i18n.test.ts` checks that the keys match). The content is English only. No strings may be hard-coded in components.
- Code style is inherited from OS4A: Prettier with 4 spaces, double quotes, printWidth 100, no trailing commas; ESLint 9 flat config.

<!-- source: own rule, added 2026-10-26; storage by quoting decided by Daniel Nüst, updated 2026-10-27 -->
## Content model

- **All content is in `src/packages/commitment/content/`, one Markdown file per item with YAML front matter; the file name is the ID.** The full author guide is `docs/content-authoring.md`. Keep it in sync with any change to the format.
  - `commitment.md`: the published text, unchanged and without markers. Sections `# … {#preamble}`, `{#intro}`, `{#boxA}`, `{#boxB}`; the boxes hold numbered lists of statements. Targets are `pre-1…5`, `intro`, `boxA`, `boxB` and `c1…c12`.
  - `statements/NN.md`: front matter only (`short`, `roles`, `topics`, `concepts`).
  - `annotations/<id>.md`: `target` + `quote` (+ optional `occurrence`), `depth`, `title`, `roles`, `topics`, `concepts`, `links` (label/url), `figure`, `deepdive`, `statements`; the body is the text. `target: legend` is for the reading-legend examples.
  - `deepdives/<id>.md`: `title`, `concept`, `statements`, `anchors`, `links`, `figure`, `placeholder`; the body is a lead paragraph plus `##` sections. Deep dives are part of this app, not the Living Handbook.
  - `roles/<id>.md` (body: description + `## Statement N` notes ending in one `- [ ] first step`), `topics/<id>.md` (body: steps `## Title {statement=N}`), `concepts/<id>.md` (front matter only).
- **Annotations attach by quoting** (like a W3C TextQuoteSelector): exact, whole words, unique within the target or disambiguated by `occurrence`, no overlaps, not inside links. Never add markers or IDs to `commitment.md`.
- `tools/build-content.mjs` (Node ≥ 18, no dependencies) validates everything and generates `mockup/data.js`, turning quotes into `[[id|text]]` markers. **Never edit `mockup/data.js` by hand**; commit it together with the content change.
  - Its front-matter parser accepts a strict YAML subset, so the React app can read the same files with `js-yaml`. Don't extend the format beyond what both accept.
- Daniel Nüst edits the content by hand. Error messages from the check are written for an editor, not a developer: keep them that way.
- **Text formatting:** all content texts (the commitment, notes, explainers, deep dives, perspective notes, topic steps, deep-dive pages) are **Markdown**, restricted to:
  - paragraphs
  - `**bold**`, `*italic*` / `_italic_`
  - plain `-` and `1.` lists
  - `[links](https://…)`
  - Raw HTML is not allowed (the check rejects it). Only `http(s)`, `mailto` and internal `#/` links are allowed; external links open in a new tab.
  - In the React app use `react-markdown` (already an OS4A dependency) with `skipHtml` and `allowedElements` limited to `p, strong, em, ul, ol, li, a`. The mock-up has a small equivalent, `md()`/`mdInline()` in `mockup/app.js`.
- The React app checks the content with the same rules in `src/packages/commitment/model/parse.ts`; `parse.test.ts` fails on any problem in `content/` and tests the quote rules. Keep `parse.ts` and `tools/build-content.mjs` in sync until the mock-up is retired.

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

<!-- source: own rule, added 2026-10-26, updated 2026-10-27 -->
## Checks

- **Content:** `node tools/build-content.mjs --check` validates `content/` and fails if `mockup/data.js` is out of date.
- **Mock-up:** there are no automated UI tests. Verify it manually in a browser at desktop width and at mobile width (< 1000px).
- **App:** `pnpm lint`, `pnpm prettier-check`, `pnpm check-types`, `CI=1 pnpm test run` and `pnpm build`. Tests are in `src/packages/commitment/**/*.test.ts`; `src/testing/global-setup.ts` loads the jest-dom matchers.
- **In a browser:** `pnpm build && pnpm preview`, or `pnpm dev`, then open http://localhost:4173/ (preview) or http://localhost:5173/ (dev) at desktop and mobile widths.

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
