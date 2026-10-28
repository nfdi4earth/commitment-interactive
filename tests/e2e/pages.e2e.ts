import { app, expect, isMobile, query, scrollY, test } from "./fixtures";

test("the index pages list perspectives, topics and concepts", async ({ page }) => {
    for (const [path, n] of [
        ["/for", 4],
        ["/topics", 7],
        ["/concepts", 6]
    ] as const) {
        await page.goto(app(path));
        await expect(page.locator(".tile")).toHaveCount(n);
    }
});

test("ticked first steps are kept per perspective and in the URL", async ({ page }) => {
    await page.goto(app("/for/student"));
    await page.locator(".card input").nth(0).click();
    await page.locator(".card input").nth(2).click();
    await expect.poll(() => query(page)).toEqual({ done: "3,5" });
    await expect(page.locator(".progress-label")).toHaveText("2 of 6 first steps");
    await page.reload();
    await expect(page.locator(".progress-label")).toHaveText("2 of 6 first steps");
    // another perspective starts at the top, without ticks
    await page.locator(".other-roles a.chip").first().click();
    await expect(page.locator(".progress-label")).toHaveText(/^0 of/);
    expect(await scrollY(page)).toBe(0);
});

test("a perspective's 'Show in text' opens the reader with its lens", async ({ page }) => {
    await page.goto(app("/for/researcher"));
    await page.locator(".card-foot a").first().click();
    await expect.poll(() => query(page)).toEqual({ role: "researcher", focus: "c1" });
    await expect(page.locator(".statement.hit")).toHaveCount(10);
});

test("a topic page follows the scroll position and keeps the step in the URL", async ({ page }) => {
    await page.goto(app("/topics/proposal-writing"));
    await expect(page.locator(".step")).toHaveCount(5);
    await page
        .locator(".step")
        .nth(2)
        .evaluate((e) => e.scrollIntoView({ block: "center" }));
    await expect.poll(() => query(page)).toEqual({ step: "3" });
    await expect(page.locator(".step.active .step-n")).toContainText("Step 3 of 5");
    // a shared link opens at that step
    await page.goto(app("/topics/proposal-writing?step=3"));
    await expect(page.locator(".step.active .step-n")).toContainText("Step 3 of 5");
    await expect(page.locator(".step").nth(2)).toBeInViewport();
});

test("a deep-dive page links its phrases into the reader", async ({ page }) => {
    await page.goto(app("/deep-dive/licensing"));
    await expect(page.locator(".dd-ref")).toHaveCount(6);
    await page.locator(".dd-ref", { hasText: "“Data laws and acts”" }).click();
    await expect(page.locator(".popover h4, .note b").first()).toContainText("Data laws and acts");
});

test("the overview map links nodes to the reader", async ({ page }) => {
    test.skip(isMobile(page), "the map needs a wide screen");
    await page.goto(app("/map"));
    await expect(page.locator(".mnode")).toHaveCount(29);
    await page.locator(".mnode", { hasText: "8 ·" }).click();
    await expect.poll(() => query(page)).toEqual({ focus: "c8" });
});

test.describe("on a large touch screen", () => {
    test.use({ viewport: { width: 1024, height: 768 }, hasTouch: true });
    test("the first tap on a map node only shows its connections", async ({ page }) => {
        test.skip(test.info().project.name !== "mobile", "runs once, in the touch project");
        await page.goto(app("/map"));
        const node = page.locator(".mnode", { hasText: "8 ·" });
        await node.click();
        await expect(page.locator(".map-wrap.map-focus")).toBeVisible();
        expect(await query(page)).toEqual({});
        await node.click();
        await expect.poll(() => query(page)).toEqual({ focus: "c8" });
    });
});

test("on a small screen, the overview map page leads to the index pages", async ({ page }) => {
    test.skip(!isMobile(page), "only below the 1000px breakpoint");
    await page.goto(app("/map"));
    await expect(page.locator(".mnode")).toHaveCount(0);
    await page.locator(".map-small a", { hasText: "topics" }).click();
    await expect(page).toHaveURL(/\/commitment\/topics$/);
});

// meaningful against a static host (E2E_BASE_URL, ci/build-site.sh); `vite preview` answers 200 always
test("every page answers with status 200, also when opened directly", async ({ page }) => {
    test.skip(isMobile(page), "the status does not depend on the viewport");
    for (const path of [
        "",
        "/for",
        "/for/student",
        "/topics/publishing",
        "/deep-dive/licensing",
        "/map"
    ]) {
        const response = await page.goto(app(path));
        expect(response?.status(), path).toBe(200);
    }
});

test("unknown paths lead back", async ({ page }) => {
    await page.goto(app("/nope"));
    await expect(page).toHaveURL(/\/commitment$/);
    await page.goto(app("/for/nobody"));
    await expect(page).toHaveURL(/\/commitment\/for$/);
});
