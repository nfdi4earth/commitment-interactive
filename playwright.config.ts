// Browser tests (tests/e2e). `pnpm test:e2e` builds the app; the tests serve dist/www with
// `vite preview`, as a deployment would. E2E_BASE_URL tests a running server instead, e.g. a
// preview deployment ("https://…/commitment-interactive/").
import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

// E2E_BASE_URL with one slash at the end, so that relative paths stay below it
const external = process.env.E2E_BASE_URL?.replace(/\/*$/, "/");
// BASE_PATH: the sub-path the build was made for (ci/build-site.sh), with slashes as in vite.config.ts
if (!external && !existsSync("dist/www/index.html"))
    throw new Error(
        "No build in dist/www: run `pnpm test:e2e`, which builds first, or `pnpm build`."
    );
const local = `http://localhost:4173${`/${process.env.BASE_PATH ?? ""}/`.replace(/\/+/g, "/")}`;

export default defineConfig({
    testDir: "tests/e2e",
    testMatch: "**/*.e2e.ts",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
    use: {
        baseURL: external || local,
        trace: "retain-on-failure"
    },
    projects: [
        {
            name: "desktop",
            use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } }
        },
        {
            name: "mobile",
            // below OneStop4All's 1000px breakpoint, with touch
            use: {
                ...devices["Desktop Chrome"],
                viewport: { width: 390, height: 844 },
                hasTouch: true
            }
        }
    ],
    webServer: external
        ? undefined
        : {
              command: "pnpm preview --port 4173 --strictPort",
              url: local,
              reuseExistingServer: !process.env.CI,
              timeout: 60_000
          }
});
