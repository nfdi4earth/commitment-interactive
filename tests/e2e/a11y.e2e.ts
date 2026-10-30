// Accessibility, against WCAG 2.2 level AA (the basis of BITV 2.0 / EN 301 549): an axe-core scan
// of every page and the reader's states, and the use by keyboard and touch. Only the Commitment
// part is checked (`.commitment-view`, also inside overlays), not the host's header and footer.
// Automated checks find only part of all problems.
import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { app, expect, isMobile, test } from "./fixtures";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** The rule violations on the page, one line per element, e.g. "color-contrast: .chip …". */
async function violations(page: Page): Promise<string[]> {
    // the host's element with the shadow root: `commitment-app` here, `onestop4all-app` in OS4A
    const host = await page.evaluate(
        () =>
            [...document.querySelectorAll("*")].find((e) =>
                e.shadowRoot?.querySelector(".commitment-view")
            )?.localName
    );
    if (!host) throw new Error("no host element with the app's shadow root");
    const { violations } = await new AxeBuilder({ page })
        .include({ fromShadowDom: [host, ".commitment-view"] })
        .withTags(TAGS)
        .analyze();
    return violations.flatMap((v) =>
        v.nodes.map((n) => `${v.id}: ${n.target.join(" ")} – ${n.failureSummary ?? v.help}`)
    );
}

const PAGES: [name: string, path: string, ready: string][] = [
    ["reader", "", ".statement"],
    ["reader with a lens", "?role=researcher&topic=publishing&concept=licensing", ".statement.hit"],
    ["reader with the preamble open", "?preamble=open", ".preamble p"],
    ["reader with a note open", "?focus=edu-materials", ".note"],
    ["reader with an explainer open", "?focus=dora-coara", ".popover"],
    ["reader with a deep dive open", "?focus=data-experts", ".panel"],
    ["reader with a statement open", "?statement=8", ".panel .kicker"],
    ["perspectives", "/for", ".tile"],
    ["a perspective", "/for/student", ".card"],
    ["topics", "/topics", ".tile"],
    ["a topic", "/topics/proposal-writing", ".step"],
    ["concepts", "/concepts", ".tile"],
    ["a deep-dive page", "/deep-dive/licensing", ".dd-ref"],
    ["the overview map", "/map", ".mnode, .map-small"]
];

for (const [name, path, ready] of PAGES)
    test(`${name} has no WCAG 2.2 AA violations`, async ({ page }) => {
        await page.goto(app(path));
        await expect(page.locator(ready).first()).toBeVisible();
        expect(await violations(page)).toEqual([]);
    });

test("the contents menu on small screens has no WCAG 2.2 AA violations", async ({ page }) => {
    test.skip(!isMobile(page), "the contents menu is a bottom sheet on small screens only");
    await page.goto(app());
    await page.locator(".toc-toggle").click();
    await expect(page.locator(".toc-col.open .toc")).toBeVisible();
    expect(await violations(page)).toEqual([]);
});

/** Class and text of the focused element, also inside the shadow root. */
const focused = (page: Page) =>
    page.evaluate(() => {
        let a = document.activeElement;
        while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
        return `${a?.className ?? ""} ${a?.textContent ?? ""}`;
    });

/** Presses `key` until the focus is on an element whose class and text match, or gives up. */
async function tabTo(page: Page, match: RegExp, key = "Tab") {
    for (let i = 0; i < 200; i++) {
        await page.keyboard.press(key);
        if (match.test(await focused(page))) return;
    }
    throw new Error(`no focusable element matches ${match}`);
}

test("notes and explainers work by keyboard", async ({ page }) => {
    await page.goto(app());
    await expect(page.locator(".statement").first()).toBeVisible();
    await tabTo(page, /\bd-note\b/);
    await expect(page.locator(".note")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.locator(".note")).toHaveCount(0);
    await tabTo(page, /\bd-explainer\b/);
    await page.keyboard.press("Enter");
    await expect(page.locator(".popover")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".popover")).toHaveCount(0);
    expect(await focused(page)).toMatch(/\bd-explainer\b/);
});

test("a tap opens notes and explainers", async ({ page }) => {
    test.skip(!isMobile(page), "touch is tested at mobile width");
    await page.goto(app());
    await page.locator(".statement .anno.d-explainer").first().tap();
    await expect(page.locator(".popover")).toBeVisible();
    // closing it gives the focus back to the passage, where the tap put it
    await page.keyboard.press("Escape");
    await expect(page.locator(".popover")).toHaveCount(0);
    expect(await focused(page)).toMatch(/\bd-explainer\b/);
    await page.goto(app());
    await page.locator(".statement .anno.d-note").first().tap();
    await expect(page.locator(".note")).toBeVisible();
});

// WCAG 2.4.11: the header and the sticky lens bar cover the top of the page
for (const path of ["", "/topics/proposal-writing", "/deep-dive/licensing"])
    test(`tabbing backwards on ${path || "the reader"} never hides the focus`, async ({ page }) => {
        await page.goto(app(path));
        await expect(page.locator(".commitment-view a").first()).toBeVisible();
        await page.keyboard.press("End");
        const hidden = new Set<string>();
        let seen = 0;
        for (let i = 0; i < 300; i++) {
            await page.keyboard.press("Shift+Tab");
            const covered = await page.evaluate(() => {
                let a = document.activeElement;
                while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
                if (!a?.closest(".commitment-view")) return null;
                const r = a.getBoundingClientRect();
                const inside = (c: DOMRect) =>
                    r.top >= c.top - 1 && r.bottom <= c.bottom + 1 && r.height > 0;
                const root = a.getRootNode() as ShadowRoot;
                const covers = [...root.querySelectorAll(".lensbar, header")]
                    .filter((c) => !c.contains(a))
                    .map((c) => c.getBoundingClientRect());
                return covers.some(inside) ? `${a.className} ${a.textContent}` : "";
            });
            // the host's footer comes first, its header last
            if (covered === null) {
                if (seen) break;
                continue;
            }
            seen++;
            if (covered) hidden.add(covered);
        }
        expect(seen).toBeGreaterThan(10);
        expect([...hidden]).toEqual([]);
    });
