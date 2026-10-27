// Shared helpers: the app's path, the query of the current URL, and a check that no page logs an
// error. The app renders in a shadow root; Playwright's CSS locators reach into it.
import { test as base, expect, type Page } from "@playwright/test";

export { expect };

/** Path of a page of the app, relative to the base URL (works under a sub-path, too). */
export const app = (path = "") => `commitment${path}`;

/** The current query as an object. Read from the page: `page.url()` misses `replaceState`. */
export async function query(page: Page): Promise<Record<string, string>> {
    const search = await page.evaluate(() => location.search);
    return Object.fromEntries(new URLSearchParams(search));
}

export const scrollY = (page: Page) => page.evaluate(() => window.scrollY);

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 1000;

export const test = base.extend<{ errors: string[] }>({
    errors: [
        async ({ page }, use) => {
            const errors: string[] = [];
            page.on("pageerror", (e) => errors.push(String(e)));
            // static hosts answer unknown paths with the app's 404.html and status 404, which the
            // browser logs for the page itself; any other failed load still counts
            const notFoundPages = new Set<string>();
            page.on("response", (r) => {
                if (r.request().isNavigationRequest() && r.status() === 404)
                    notFoundPages.add(r.url());
            });
            page.on("console", (m) => {
                if (m.type() !== "error") return;
                const notFoundPage =
                    m.text().startsWith("Failed to load resource") &&
                    notFoundPages.has(m.location().url);
                if (!notFoundPage) errors.push(m.text());
            });
            await use(errors);
            expect(errors, "errors in the browser console").toEqual([]);
        },
        { auto: true }
    ]
});
