# Adding the Commitment to OneStop4All

The package `src/packages/commitment/` is a self-contained part of the app, including its texts (`content/`), styles, English and German UI strings, and tests. This repository runs it in a thin copy of the OneStop4All (OS4A) shell. This page describes how to add it to OS4A as a page under `/commitment`, like `/label`.

**Tested** on 2026-10-27 in a fresh copy of OS4A at commit `b39aaff` (v1.11.2), following the steps below: `pnpm install` (no unexpected duplicates), `pnpm check-types`, `pnpm build` and the package's tests passed; `pnpm lint` showed one warning in OS4A's own code. This repository's browser tests (`E2E_BASE_URL=http://localhost:4180/ pnpm test:e2e` against OS4A's `vite preview`) passed 47 of 48: on mobile, OS4A's "Ask our Bot" button covers the reader's "Contents" button (see "Things to decide"). An earlier test (same day) also checked the German UI strings.

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

6. **Add the test setup file.** OS4A's `vite.config.ts` names `src/testing/global-setup.ts`, which does not exist in OS4A, so all tests fail to start. Copy `src/testing/global-setup.ts` from this repository (one line: `import "@testing-library/jest-dom/vitest";`).

7. **Keep Prettier away from the content**, which is edited by hand, and from the content file generated from it: add both to OS4A's `.prettierignore`:

   ```
   src/packages/commitment/content/
   src/packages/commitment/model/content.generated.json
   ```

   The app loads the generated file (`model/content.generated.json`), so OS4A needs no build step for the content. It is updated in this repository and copied with the package.

8. **Link the page**, e.g. in the menu (`components/BaseMenu/BaseMenu.tsx`) next to the Label, with strings in OS4A's `i18n/en.yaml` and `de.yaml`. For the sitemap, add a `handle: { sitemap: … }` to the route as for `/label`.

Nothing else is needed: the package uses OS4A's theme as it is, sets its colours from the content files as CSS variables, keeps its styles under `.commitment-view`, uses no OS4A services, and works inside the shadow root.

## Things to decide before going live

- **Overlapping buttons on small screens:** OS4A's "Ask our Bot" button and the reader's "Contents" button are both fixed at the bottom right; the bot button covers the other one, so the contents menu can't be opened on a phone (the browser test "the contents menu scrolls to a statement" fails in OS4A). One of them has to move.
- **German:** OS4A declares English and German, and Pioneer requires every package to support both, so the package has `i18n/de.yaml` (UI strings only; please review the translation). OS4A currently forces English in `src/index.html`. The texts in `content/` are English only.
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
E2E_BASE_URL=http://localhost:4180/ pnpm test:e2e
```

Then open `/commitment`, `/commitment/for/researcher`, `/commitment/topics/proposal-writing`, `/commitment/deep-dive/licensing` and `/commitment/map` at desktop and mobile widths.
