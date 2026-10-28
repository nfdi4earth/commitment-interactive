import { app, expect, isMobile, query, test } from "./fixtures";

test.beforeEach(async ({ page }) => {
    await page.goto(app());
    await expect(page.locator(".statement")).toHaveCount(12);
});

test("lens badges highlight the relevant statements", async ({ page }) => {
    await page.locator(".lensbar .chip", { hasText: "Student" }).click();
    await expect.poll(() => query(page)).toEqual({ role: "student" });
    await expect(page.locator(".lens-status")).toContainText("6 of 12 statements");
    await expect(page.locator(".statement.hit")).toHaveCount(6);
    await expect(page.locator(".statement.dim")).toHaveCount(6);
    await page.locator(".lens-status button").click();
    await expect.poll(() => query(page)).toEqual({});
});

test("the lens bar stays below the header while scrolling", async ({ page }) => {
    await page.mouse.wheel(0, 2000);
    await expect
        .poll(() =>
            page.locator(".lensbar").evaluate((e) => Math.round(e.getBoundingClientRect().top))
        )
        .toBeGreaterThan(50);
});

test("a note that the pointer only crosses stays closed", async ({ page }) => {
    test.skip(isMobile(page), "hovering needs a mouse");
    const note = page.locator(".statement .anno.d-note").first();
    await note.scrollIntoViewIfNeeded();
    const box = await note.boundingBox();
    if (!box) throw new Error("no note on the page");
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x - 40, y);
    await page.mouse.move(box.x + box.width / 2, y);
    await page.mouse.move(box.x + box.width + 300, y + 200);
    await page.waitForTimeout(500);
    await expect(page.locator(".note")).toHaveCount(0);
});

test("a note opens on hover without changing the URL, and on click with it", async ({ page }) => {
    const note = page.locator(".anno.d-note").first();
    if (!isMobile(page)) {
        await note.hover();
        await expect(page.locator(".note")).toBeVisible();
        expect(await query(page)).toEqual({});
        await page.mouse.move(5, 5);
        await expect(page.locator(".note")).toHaveCount(0);
    }
    await note.click();
    await expect(page.locator(".note")).toBeVisible();
    await expect.poll(() => query(page)).toEqual({ focus: "legend-note" });
});

test("an explainer opens as a popover and closes with Escape", async ({ page }) => {
    await page.locator(".anno.d-explainer").first().click();
    await expect(page.locator(".popover")).toBeVisible();
    await expect.poll(() => query(page)).toEqual({ focus: "legend-explainer" });
    await page.keyboard.press("Escape");
    await expect(page.locator(".popover")).toHaveCount(0);
    await expect.poll(() => query(page)).toEqual({});
});

test("a deep dive opens in the side panel; its tags navigate and close it", async ({ page }) => {
    await page.locator(".anno.d-deepdive").nth(1).click();
    await expect(page.locator(".panel h3")).toHaveText("All four aspects of FAIR");
    await expect.poll(() => query(page)).toEqual({ focus: "four-aspects" });
    // a perspective, topic or concept tag opens the reader with that lens
    const tag = page.locator(".panel .tag:not([data-kind=stmt])").first();
    const kind = await tag.getAttribute("data-kind");
    await tag.click();
    await expect(page.locator(".panel")).toHaveCount(0);
    await expect.poll(async () => Object.keys(await query(page))).toEqual([kind]);
});

test("a statement number opens all perspectives on it", async ({ page }) => {
    await page.locator(".statement .num").nth(7).click();
    await expect(page.locator(".panel .kicker")).toContainText("Statement 8");
    await expect(page.locator(".panel .persp").first()).toBeVisible();
    await expect.poll(() => query(page)).toEqual({ statement: "8" });
    await page.keyboard.press("Escape");
    await expect.poll(() => query(page)).toEqual({});
});

test("the preamble opens and closes through the URL", async ({ page }) => {
    await page.locator("details.preamble summary").click();
    await expect.poll(() => query(page)).toEqual({ preamble: "open" });
    await expect(page.locator("details.preamble")).toHaveAttribute("open", "");
    await page.locator("details.preamble summary").click();
    await expect.poll(() => query(page)).toEqual({});
});

test("the contents menu scrolls to a statement and keeps the lens", async ({ page }) => {
    await page.locator(".lensbar .chip", { hasText: "Student" }).click();
    for (let round = 0; round < 2; round++) {
        // the second time, the URL is the same already
        await page.evaluate(() => window.scrollTo(0, 0));
        if (isMobile(page)) await page.locator(".toc-toggle").click();
        await page.locator(".toc a.mm-item").nth(9).click();
        await expect.poll(() => query(page)).toEqual({ role: "student", focus: "c10" });
        await expect
            .poll(() =>
                page
                    .locator(".statement")
                    .nth(9)
                    .evaluate((e) => e.getBoundingClientRect().top)
            )
            .toBeLessThan(400);
    }
});

test("the statement chosen in the contents menu is the current one, also in a tall window", async ({
    page
}) => {
    test.skip(isMobile(page), "the contents menu is always in view on large screens only");
    await page.setViewportSize({ width: 1280, height: 1100 });
    const isCurrent = async (n: number) => {
        await expect(page.locator(".toc a.mm-item.current .mm-n")).toHaveText(String(n));
        await expect(page.locator(".statement.current")).toHaveAttribute("data-n", String(n));
    };
    // 12 can't scroll up to the line below the lens bar, 10 and 11 are near the end of the page
    for (const n of [5, 9, 12, 11, 10]) {
        await page
            .locator(".toc a.mm-item")
            .nth(n - 1)
            .click();
        await isCurrent(n);
    }
    // a shared link to a statement, and to an annotation in one
    for (const [path, n] of [
        ["?statement=12", 12],
        ["?statement=10", 10],
        ["?focus=standards", 12]
    ] as const) {
        await page.goto(app(path));
        await isCurrent(n);
    }
});

test("Copy link copies a link to the statement", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.locator(".statement .num").nth(7).click();
    await page.locator(".panel .btn-outline").first().click();
    await expect(page.locator(".panel .btn-outline").first()).toContainText("Link copied");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(
        /\/commitment\?focus=c8$/
    );
});

test("no page scrolls sideways", async ({ page }) => {
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        page.viewportSize()?.width ?? 0
    );
});
