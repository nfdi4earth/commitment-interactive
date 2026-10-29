# CLAUDE.md – commitment-interactive

<!-- source: own rule (project kick-off with Daniel Nüst), added 2026-10-26, updated 2026-10-27 -->
## Purpose

This is an interactive, annotated version of the
[NFDI4Earth FAIRness and Openness Commitment](https://nfdi4earth.de/commitment)
(D4.2.1, v1.0, 2024-09, DOI [10.5281/zenodo.10123880](https://doi.org/10.5281/zenodo.10123880)).
It helps different stakeholders understand and implement the commitment:

- **Annotations** attach to sections, statements, sentences or single words. They have three depths:
  - `note`: one sentence, shown as a tooltip
  - `explainer`: a paragraph with links, shown as a popover
  - `deepdive`: several paragraphs with links and figures, shown as a side panel
- **Perspectives (roles):** student, researcher, institution, organisation/group. Policy makers and institutional leadership are possible future perspectives (README "Possible future work"); the app has no placeholders for them.
- **Topics:** researcher activities such as research evaluation, proposal writing, scholarly communication, publishing, open access and reviewing. Researchers are the first target audience.
- **Concepts:** cross-cutting ideas such as openness, FAIRness, licensing, credit, infrastructure and standards. Each concept can have a vertical deep dive.

**Status:** the detail content is **fake example content** that shows the interaction mechanisms. Never present it as real guidance.

<!-- source: own rule, added 2026-10-26, updated 2026-10-28 (host settings, jump on a shared link: Daniel Nüst, 2026-10-27; target kept in place: 2026-10-28) -->
## Status and layout

- `src/packages/commitment/content/` ("`content/`" below): all texts as Markdown files, see "Content model". It is inside the package so that it moves with it into OS4A; `.prettierignore` keeps Prettier off it. `tools/build-app-content.mjs` turns them into `model/content.generated.json`.
- The clickable HTML mock-up (`mockup/`, with its own content script `tools/build-content.mjs`) was the reference for the interaction design. It was removed on 2026-10-27, after the React app had all its pages and was deployed; it is in the git history before that date.
- **React app:** the shell of the OneStop4All (OS4A) implementation at upstream commit `b39aaff` (v1.11.2, https://git.rwth-aachen.de/nfdi4earth/onestop4all/onestop4all-implementation), which uses Open Pioneer Trails, React 19, Chakra UI v3, Vite and pnpm. Root tooling (`package.json`, `pnpm-workspace.yaml` with the catalog, lockfile, ESLint, Prettier, `tsconfig`, `vite.config.ts`, `patches/`, `.husky/`) is copied from OS4A and trimmed. The repo has two workspace packages:
  - `src/apps/commitment-standalone/`: the thin host. It holds the OS4A theme (`theme.ts`, unchanged), layout, header, footer and menu, copied from OS4A and cut down. The search bar opens the live OS4A search, and user support is a `mailto:` link to the helpdesk (`links.ts`). It renders `<commitment-app>` in a shadow root and redirects `/` to `/commitment`.
  - `src/packages/commitment/`: the **drop-in unit**. It exports `commitmentRoutes` (relative routes) that OS4A will later mount under `commitment`, like the `/label` page. An ESLint rule forbids imports from the host app.
    - `model/`: `parse.ts` (quote matching, all content checks), `header.ts` (front matter), `content.ts` (loads the committed `content.generated.json`, built from `content/` with `parse.ts` by `tools/build-app-content.mjs`, so the browser gets no YAML parser and no checks, and OS4A needs no build step; see "Checks"), `lens.ts`, `types.ts`. Annotated quotes become Markdown links `[quote](annotation:<id>)` that `components/Markdown.tsx` renders as annotation buttons.
    - `views/Reader/`: lens bar, contents menu, statements, annotations (note = Chakra Tooltip, explainer = Popover, deep dive = Drawer) and the statement panel; `?focus=` deep links.
    - **All page state except hovering is in the URL**, so a shared link shows the same view (list in `components/base.tsx`): reader `role`/`topic`/`concept` (lens), `focus` (open annotation, or a passage to scroll to), `statement` (statement panel), `preamble=open`; topic page `step`; perspective page `done`. Changes made on the page replace the URL with `state: { quiet: true }` (`useQueryState`) and don't scroll. Every other navigation (a link, a shared URL, Back, Forward, reload) scrolls to its target first, and what it opens appears when the page has stopped scrolling (`useReveal`, `scrollIntoViewThen`: `scrollend`, or no scroll event for 200 ms; no guessed delays). Until the reader scrolls, clicks or types, `scrollIntoViewThen` keeps the target in place when the page changes its size: OS4A's layout adds the height of its fixed header only after measuring it, which comes after the jump of a shared link (found 2026-10-28; the passage ended up under the lens bar). On a URL opened from outside (a shared link, a reload: a `POP` when the routes mount), and on Back to that URL, it jumps instead of scrolling smoothly, so a shared link opens about 0.6 s sooner (decided by Daniel Nüst, 2026-10-27). React runs effects twice in development (Pioneer uses `StrictMode`), so `scrollIntoViewThen` starts the scroll in the next frame.
    - `views/`: `IndexView` (`for`, `topics`, `concepts`), `PerspectiveView` (`for/:id`), `TopicView` (`topics/:id`, scrollytelling), `DeepDiveView` (`deep-dive/:id`) and `MapView` (`map`; on screens from 1000px it loads `MapCanvas` with `@xyflow/react`, whose base CSS is loaded scoped in `styles.scss`). Unknown paths redirect to the reader.
    - **Start-up:** each page's code loads with the router's `lazy` (`routes.tsx`), so it loads while the host draws its layout (`HydrateFallback`: `Loading`); a link waits on the old page until the new page's code is there. A quiet URL change meanwhile would cancel that link, so `useQueryState` skips it while the router is leaving (it reads the router's state through `UNSAFE_DataRouterContext`, because `useNavigation()` only tells with the next render). Notes and explainers get their Chakra tooltip or popover only when a mouse enters them, they get the keyboard focus, or they open (`AnnotationButton.tsx`); until then they are plain buttons. Measured on 2026-10-27: a shared link's panel opens at 0.85 s instead of 1.5 s; the page code saves about 0.3 s at 200 ms network latency (none measurable at 80 ms); the plain buttons save about 30–150 ms of main-thread time.
    - **Host contract:** the host mounts `commitmentRoutes` as children of a plain route (`commitment`, not `commitment/*`, where React Router 7 resolves "." against the whole URL); `CommitmentRoot` derives the base path for links from it. The host also sets the CSS variable `--commitment-sticky-top` to the height of its fixed header (see `layouts/layout.tsx`), so the sticky lens bar sits below it. The package passes settings for the host page as the route `handle` (`CommitmentHostSettings` in `routes.tsx`, read in OS4A with `useMatches()`): `chatbot` (now `true`) lets the page hide OS4A's chatbot button (`docs/integration.md`, step 6).
- **Node and pnpm:** OS4A needs Node ≥ 20 and pnpm 10 (`engines` in `package.json`). On this machine use the nvm Node 22 (`PATH=$HOME/.nvm/versions/node/v22.23.3/bin:$PATH`); the default Node 18 is too old for the app and the content script.
- `pnpm install` runs husky, which sets `core.hooksPath` so the **pre-commit hook runs `ci/check.sh`**: lint, Prettier, type check, content check and unit tests, the same as CI. `NO_VERIFY=1` skips it; never use that to get around a failing check (G2.2).
- How to add the package to OS4A, and what to decide before going live: `docs/integration.md` (tested against OS4A `b39aaff` on 2026-10-27). Keep it current when the host contract changes. The original plan is in `~/.claude/plans/we-start-a-new-streamed-moler.md`.

<!-- source: own rule, derived from OS4A code review, added 2026-10-26, updated 2026-10-27 (Pioneer and Chakra code: Daniel Nüst, 2026-10-27) -->
## OS4A compatibility rules

- **Never change Open Pioneer Trails or Chakra UI code** (decided by Daniel Nüst, 2026-10-27), including the libraries Chakra is built on (Ark UI, Zag): no edits in `node_modules`, no new entries in `patches/`, no copies of their code, no overrides of their internals. Work with their public API, or tell Daniel what upstream should change and draft the issue (G1.1, G1.2). `patches/` holds two patches inherited from OS4A (`@ark-ui/react`, `@zag-js/toast`); keep them as OS4A has them.

- Use OS4A's `theme.ts` tokens unchanged:
  - colours: primary `#05668D`, light `#2b9eab`, focus `#22C0D2`, border `#CCCCCC`, text boxes `#F7FAFC`, secondary text `#71717a` (`primary_font_secondary` = Chakra v3 `gray.500`, `--fg-2`)
  - font: Arial
  - layout: breakpoint `custombreak` = 1000px, container `maxW={{ base: "100%", custombreak: "80%" }}`
  - buttons: square corners
- The `commitment` package must not import from `apps/`. It also must not depend on host services (search state, config, auth).
- Use relative routes only, so the package works under any mount path.
- No global CSS. Scope styles under `.commitment-view` (`styles.scss`, declared in the package's `build.config.mjs`). Overlays render in portals, so wrap their content in `Scoped` (`components/base.tsx`). Facet colours come from the content files and are set as CSS variables (`--c`, `--ink`, see `colourVars()` in `model/lens.ts`), not as theme tokens.
- OS4A renders inside a **shadow root**:
  - never use `document.getElementById` or `querySelector` for scrolling or focus; use refs or `getRootNode()`
  - deep links use query params (`?focus=<anchor-id>`), not `#hash`
- i18n uses OS4A-style ICU YAML (`i18n/en.yaml`, `i18n/de.yaml`) through `useIntl` from `open-pioneer:react-hooks`. OS4A declares English and German and Pioneer requires every package to support both, so every UI string needs both files (`i18n/i18n.test.ts` checks that the keys match). The content is English only. No strings may be hard-coded in components. Exception (decided by Daniel Nüst, 2026-10-27): the labels inside the placeholder figures (`components/Figure.tsx`) stay English only; their alt texts and captions are translated. The German strings in `de.yaml` are AI-translated and not reviewed yet; the review is postponed (Daniel Nüst, 2026-10-27) and due before the page goes live in OS4A. The standalone app only enables English (`i18n: ["en"]` in its `build.config.mjs`), so the demo never shows them.
- Code style is inherited from OS4A: Prettier with 4 spaces, double quotes, printWidth 100, no trailing commas; ESLint 9 flat config.

<!-- source: own rule, added 2026-10-26; storage by quoting decided by Daniel Nüst, updated 2026-10-27 -->
## Content model

- **All content is in `src/packages/commitment/content/`, one Markdown file per item with YAML front matter; the file name is the ID.** The full author guide is `docs/content-authoring.md`. Keep it in sync with any change to the format.
  - `commitment.md`: the published text, unchanged and without markers. Sections `# … {#preamble}`, `{#intro}`, `{#boxA}`, `{#boxB}`; the boxes hold numbered lists of statements. Targets are `pre-1…5`, `intro`, `boxA`, `boxB` and `c1…c12`.
  - `statements/NN.md`: front matter only (`short`, `roles`, `topics`, `concepts`).
  - `annotations/<id>.md`: `target` + `quote` (+ optional `occurrence`), `depth`, `title`, `roles`, `topics`, `concepts`, `links` (label/url), `figure`, `deepdive`, `statements`; the body is the text. `target: legend` is for the reading-legend examples.
  - `deepdives/<id>.md`: `title`, `concept`, `statements`, `anchors`, `links`, `figure`, `placeholder`; the body is a lead paragraph plus `##` sections. Deep dives are part of this app, not the Living Handbook.
  - `roles/<id>.md` (body: description + `## Statement N` notes ending in one `- [ ] first step`), `topics/<id>.md` (body: steps `## Title {statement=N}`), `concepts/<id>.md` (front matter only).
- **Annotations attach by quoting** (like a W3C TextQuoteSelector): exact, whole words, unique within the target or disambiguated by `occurrence`, no overlaps, not inside links, and never across the edge of `**bold**` or `*italic*` text (plain text, or text inside one bold or italic part; decided by Daniel Nüst, 2026-10-27: crossing quotes are too brittle, the author adapts the quote). Never add markers or IDs to `commitment.md`.
- Front matter is the small YAML subset of `docs/content-authoring.md` ("Header rules"). `model/header.ts` reads it, with messages for editors; a full YAML parser would silently change some values (`title: Step #3` would lose " #3", `quote: 1.5` would become a number). Change the format only together with the guide.
- Daniel Nüst edits the content by hand. Error messages from the check are written for an editor, not a developer: keep them that way.
- **Text formatting:** all content texts (the commitment, notes, explainers, deep dives, perspective notes, topic steps, deep-dive pages) are **Markdown**, restricted to:
  - paragraphs
  - `**bold**`, `*italic*` / `_italic_`
  - plain `-` and `1.` lists
  - `[links](https://…)`
  - Raw HTML is not allowed (the check rejects it). Only `http(s)`, `mailto` and internal `#/` links are allowed; external links open in a new tab.
  - In the React app use `react-markdown` (already an OS4A dependency) with `skipHtml` and `allowedElements` limited to `p, strong, em, ul, ol, li, a`.
- The content is checked by `src/packages/commitment/model/parse.ts`; `parse.test.ts` fails on any problem in `content/` and tests the quote rules.

<!-- source: own rule, added 2026-10-26, updated 2026-10-27 -->
## Sources for real content later

These are the starting points for the real deep-dive content. Don't use them until real content is written.

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

<!-- source: own rule, added 2026-10-26, updated 2026-10-27 (accessibility target: Daniel Nüst, 2026-10-27) -->
## Checks

- **Content:** `pnpm check-content` validates `content/` and fails if `model/content.generated.json` is out of date; `pnpm build-content` updates it. Commit it together with the content. `pnpm dev` regenerates the JSON on every content change (`tools/vite-plugin-content.mjs`, dev server only); builds and tests use the committed file, so `parse.test.ts` fails on a stale one.
- **App:** `ci/check.sh` (`pnpm lint`, `pnpm prettier-check`, `pnpm check-types`, `pnpm check-content`, `CI=1 pnpm test run`) and `pnpm build`. Tests are in `src/packages/commitment/**/*.test.ts`; `src/testing/global-setup.ts` loads the jest-dom matchers.
- **Browser tests:** `pnpm test:e2e` (Playwright, `tests/e2e/*.e2e.ts`, desktop and mobile width) builds the app, serves `dist/www` with `vite preview` and runs the reader, links/URL state, page and accessibility tests; every test also fails on browser console errors. `E2E_BASE_URL=<url> pnpm exec playwright test` tests a running server instead (a deployment, or OS4A with the package). Run them for every change to the UI. Use `location` from the page for URL checks: `page.url()` misses `replaceState`. First run on a machine: `pnpm exec playwright install chromium`.
- **Accessibility:** target WCAG 2.2 level AA (the basis of BITV 2.0 / EN 301 549). `tests/e2e/a11y.e2e.ts` scans every page and the reader's states with axe-core (`@axe-core/playwright`, only `.commitment-view`, not the host) and tests keyboard and touch use, and that tabbing never hides the focus under the header or the lens bar (WCAG 2.4.11; every focusable element has a `scroll-margin-top`). There is no manual screen-reader test (Daniel Nüst, 2026-10-27).
- **In a browser:** `pnpm build && pnpm preview`, or `pnpm dev`, then open http://localhost:4173/ (preview) or http://localhost:5173/ (dev) at desktop and mobile widths.
- **Effects need block bodies** (ESLint `no-restricted-syntax` in the package): newer browsers return a Promise from `scrollTo`/`scrollIntoView`, and an expression body makes React call it as cleanup and crash on unmount (found by the browser tests). `routes.tsx` has an `errorElement`, so a failing page doesn't break the host page.

<!-- source: Daniel Nüst, request for an interim deployment, added 2026-10-27 -->
## CI and deployment

- **Interim** deployment: GitHub Pages (https://nfdi4earth.github.io/commitment-interactive/) from https://github.com/nfdi4earth/commitment-interactive, until the page moves into OS4A or the repository to RWTH GitLab. Details in `ci/README.md`.
- **All CI steps live in `ci/*.sh`**; `.github/workflows/pages.yml` and the prepared `.gitlab-ci.yml` only install and call them, with the same job layout. Change a step in the script, not in a config.
- Sub-path: `BASE_PATH` sets Vite's `base`, the router's `basename` and the browser tests' base URL. In the host app, write public assets as `` `${import.meta.env.BASE_URL}file.png` ``, not `/file.png` (Vite rewrites only HTML and CSS).

<!-- source: Daniel Nüst, request, added 2026-10-27 -->
## Development workflow

After every code change, before reporting it as done or committing it:

1. **Run `/simplify` first** on the changed code and apply its fixes.
2. **Then run `/code-review`** with a level that depends on how many lines changed (`git diff --stat`, added plus removed, without `content/`, the generated `model/content.generated.json` and `pnpm-lock.yaml`):
   - up to 50 lines: `/code-review low`
   - 51 to 300 lines: `/code-review medium`
   - more than 300 lines: `/code-review high`, never higher unless asked
3. Run the checks above and quote their results (G2.1).

For trying the app out, keep a **live-reloading dev server** running (`pnpm dev`, http://localhost:5173/) instead of `pnpm preview`, so content and code edits show up without a rebuild. Stop any old preview or dev server before starting a new one.

<!-- source: Daniel Nüst, feedback on the mock-up, added 2026-10-26, updated 2026-10-29 (dimming, overview map size, current statement; topic steps: 2026-10-29) -->
## Design decisions from mock-up feedback

- **One interaction method for all filters:** perspectives, topics and concepts are all toggle badges (chips), one row each. No drop-down menus for lenses.
- **The reading overview is a plain contents menu**, not a zoom/pan minimap. It keeps the synced current-section highlight and the lens hit/dim state. On mobile it is a bottom sheet behind a "Contents" button at the bottom left (hosts put their own buttons at the bottom right). Zoom and pan stay only in the overview map.
- **The current statement** (decided by Daniel Nüst, 2026-10-28) is the one at the line where a link puts a statement (its `scroll-margin-top`, below the lens bar), so the entry just chosen in the contents menu is the current one at any window height; at the end of the page, which the last statements can't scroll up to, it is the chosen one. Its number is a filled circle with a white number, in the contents menu and in the text.
- **Dimming is grey text, not transparency** (decided by Daniel Nüst, 2026-10-28, from a comparison of three variants): what a lens does not match, and the topic steps around the current one, turn grey (`--dim`, the `dimmed` mixin in `styles.scss`; 4.8:1 also on the light blue of hovered and current items), so they stay readable (WCAG 1.4.3); matches keep their colour tint and bar. Never dim text with `opacity`; the overview map greys out nodes with `grayscale`.
- **The overview map needs a screen at least 1000px wide** (decided by Daniel Nüst, 2026-10-28): below that the page links to the index pages instead; above it the map never zooms out below 24px nodes (WCAG 2.5.8).
- **Scrollytelling (topic pages):** keep little vertical space between steps (about 14vh), so the next step is always visible. Show "Step x of n", progress dots and a "Next: …" cue. The active step is the last one whose top has reached the middle of the window, or the first or last one at the top or end of the page (a tall window can't scroll them to the middle; found by Daniel Nüst, 2026-10-29); only scrolling changes it, so a link to a step that can't be scrolled to keeps its step. Pointing the mouse at a step or at its statement, or moving the keyboard focus into a step, lights up both, and they stay lit until another pair is pointed at or scrolling makes another step active (decided by Daniel Nüst, 2026-10-29); pointing changes no URL. Clicking a statement opens its step like a link with `?step=` (decided by Daniel Nüst, 2026-10-29); the box of statements stays hidden from the keyboard and screen readers, which reach the same through the steps.

<!-- source: Daniel Nüst, request to re-use NFDI4Earth colours; logos (2023) and Rollup service brick colours PDF (2026), added 2026-10-26, updated 2026-10-27 -->
## Colour palette

- Facet colours re-use the NFDI4Earth palette; the full list with sources is in `README.md#colour-palette`:
  - perspectives use the task-area logo colours (2Participate, 2Facilitate, 2Interoperate, 2Coordinate)
  - topics use the service brick colours
  - all concepts use the Commitment brick colour `#2A9D8F`
- The base UI stays on the OS4A theme (`#05668D`).
- Never put text directly in a facet colour on white, because several colours are too light. Use dark text with a coloured icon or border. On a coloured fill, choose dark or white text by contrast (`ink()` in `model/lens.ts`).
- **Shapes encode kinds** everywhere (badges, tags, counts, map nodes): perspectives and concepts are round pills, topics have 4px corners, statements are square. The map is called "Overview map", because it shows more than concepts.
