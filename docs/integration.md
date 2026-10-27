# Adding the Commitment to OneStop4All

The package `src/packages/commitment/` is a self-contained part of the app, including its texts (`content/`), styles, English and German UI strings, and tests. This repository runs it in a thin copy of the OneStop4All (OS4A) shell. This page describes how to add it to OS4A as a page under `/commitment`, like `/label`.

**Tested** on 2026-10-27 in a fresh copy of OS4A at commit `b39aaff` (v1.11.2), following the steps below: `pnpm install` (no unexpected duplicates), `pnpm check-types`, `pnpm build` and the package's tests passed; `pnpm lint` showed one warning in OS4A's own code. This repository's browser tests (`E2E_BASE_URL=http://localhost:4180/ pnpm exec playwright test` against OS4A's `vite preview`, with OS4A's chatbot button shown) passed: 49 passed, 1 skipped (2026-10-27). The chatbot button and the reader's "Contents" button no longer overlap at widths from 320 to 999px.

## Steps

1. **Copy the package** into OS4A as `src/packages/commitment/`, without its `node_modules` folder (it links into this repository's install):

   ```bash
   mkdir -p ../onestop4all-implementation/src/packages/commitment
   git archive HEAD src/packages/commitment | tar -x --strip-components=3 -C ../onestop4all-implementation/src/packages/commitment
   ```

   `src/**` is already a workspace path in OS4A's `pnpm-workspace.yaml`.

2. **Add the dependency** to `src/apps/onestop4all/package.json`:

   ```json
   "commitment": "workspace:^"
   ```

   The package brings `js-yaml` and `react-markdown` (OS4A uses both already) and one new library, `@xyflow/react` (MIT), for the overview map. Run `pnpm install`.

3. **Allow one duplicate type package.** OS4A's duplicate check reports `@types/d3-interpolate` (3.0.1 from OS4A's dependencies, 3.0.4 from `@xyflow/react`); `pnpm dedupe` does not resolve it. These are TypeScript types only, like `@types/d3-color` and `@types/d3-time`, which OS4A already allows. Add it to `support/duplicate-packages.yaml`:

   ```yaml
   allowed:
     - "@types/d3-interpolate"
   ```

4. **Mount the routes** in `src/apps/onestop4all/routes/routes.tsx`, as a child of the layout route. Use a plain path, not `commitment/*`: the package derives the base of its links from the route's path, and its own routes already catch unknown subpaths:

   ```tsx
   import { commitmentRoutes } from "commitment";
   // …
   { path: "commitment", children: commitmentRoutes },
   ```

5. **Tell the package the header height** in `src/apps/onestop4all/layouts/layout.tsx`, so that the sticky lens bar sits below OS4A's fixed header:

   ```tsx
   <Box
       as="main"
       width="100%"
       paddingTop={height + 15}
       flex="1"
       style={{ "--commitment-sticky-top": `${height}px` } as React.CSSProperties}
   >
   ```

6. **Apply the host settings.** The package passes settings for the host page as the route's `handle` (`CommitmentHostSettings` in `routes.tsx`). Currently there is one: `chatbot`, which lets the page hide OS4A's chatbot button. It is `true` now, so this step is optional; with it, hiding the button again is a one-word change in `routes.tsx`. In `layouts/layout.tsx`, which is a component of OS4A's data router:

   ```tsx
   import { Outlet, useMatches } from "react-router-dom";
   import type { CommitmentHostSettings } from "commitment";

   /** The chatbot button, unless the page turns it off with `handle: { chatbot: false }`. */
   function Chatbot() {
       const off = useMatches().some(
           (m) => (m.handle as Partial<CommitmentHostSettings> | undefined)?.chatbot === false
       );
       return off ? null : <ChatbotToaster />;
   }
   // in Layout, instead of `<ChatbotToaster />`:
   {showChatbotToaster && <Chatbot />}
   ```

   `useMatches()` re-renders on every URL change, and the reader changes the URL as you use it, so keep it in this small component rather than in `Layout` itself.

7. **Add the test setup file.** OS4A's `vite.config.ts` names `src/testing/global-setup.ts`, which does not exist in OS4A, so all tests fail to start. Copy `src/testing/global-setup.ts` from this repository (one line: `import "@testing-library/jest-dom/vitest";`).

8. **Keep Prettier away from the content**, which is edited by hand, and from the content file generated from it: add both to OS4A's `.prettierignore`:

   ```
   src/packages/commitment/content/
   src/packages/commitment/model/content.generated.json
   ```

   The app loads the generated file (`model/content.generated.json`), so OS4A needs no build step for the content. It is updated in this repository and copied with the package.

9. **Link the page**, e.g. in the menu (`components/BaseMenu/BaseMenu.tsx`) next to the Label, with strings in OS4A's `i18n/en.yaml` and `de.yaml`. For the sitemap, add a `handle: { sitemap: … }` to the route as for `/label`.

Nothing else is needed: the package uses OS4A's theme as it is, sets its colours from the content files as CSS variables, keeps its styles under `.commitment-view`, uses no OS4A services, and works inside the shadow root.

## Things to decide before going live

- **Buttons at the bottom of small screens:** OS4A's chatbot button sits at the bottom right and the reader's "Contents" button at the bottom left (icon only below 400px width). If OS4A changes its button (wider, or on the left), check `/commitment` at 320 to 420px width; if they collide, set `chatbot: false` in `routes.tsx` (step 6) until the layout is fixed.
- **German:** OS4A declares English and German, and Pioneer requires every package to support both, so the package has `i18n/de.yaml` (UI strings only; the translation is not reviewed yet, a review is postponed but due before going live). OS4A currently forces English in `src/index.html`. The texts in `content/` are English only.
- **Example content:** all annotations, perspective notes, topic steps and deep dives are fake (see `README.md`), and the pages say so. Replace them before the page is announced.
- **Where content is edited after the move:** either keep editing here and copy the package again (step 1), or move the editing to OS4A. Keep one place.

## Checks in OS4A after integrating

```bash
pnpm check-duplicates
pnpm check-types
pnpm lint
pnpm vitest run src/packages/commitment
pnpm build && pnpm preview --port 4180
# in this repository, against that server:
E2E_BASE_URL=http://localhost:4180/ pnpm exec playwright test
```

Then open `/commitment`, `/commitment/for/researcher`, `/commitment/topics/proposal-writing`, `/commitment/deep-dive/licensing` and `/commitment/map` at desktop and mobile widths.
