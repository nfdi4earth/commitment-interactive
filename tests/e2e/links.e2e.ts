// Shared links and the browser's Back, Forward and reload show the same view: they scroll to the
// target first and open it when the page has stopped scrolling.
import { app, expect, query, scrollY, test } from "./fixtures";

test("a shared deep-dive link scrolls, then opens the panel", async ({ page }) => {
    await page.goto(app("?focus=four-aspects"));
    await expect(page.locator(".panel h3")).toHaveText("All four aspects of FAIR");
    // the annotation is in statement 5
    await expect(page.locator(".statement").nth(4)).toBeInViewport();
    // the browser keeps the URL; a reload shows the same
    await page.reload();
    await expect(page.locator(".panel h3")).toHaveText("All four aspects of FAIR");
});

test("a shared note in the preamble opens the preamble and keeps it open", async ({ page }) => {
    await page.goto(app("?focus=sdgs"));
    await expect(page.locator(".note")).toContainText("UN Sustainable Development Goals");
    await expect.poll(() => query(page)).toEqual({ focus: "sdgs", preamble: "open" });
    await page.keyboard.press("Escape");
    await page.mouse.move(5, 5);
    await expect.poll(() => query(page)).toEqual({ preamble: "open" });
    await expect(page.locator("details.preamble")).toHaveAttribute("open", "");
});

test("a shared statement link opens the statement panel", async ({ page }) => {
    await page.goto(app("?statement=8"));
    await expect(page.locator(".panel .kicker")).toContainText("Statement 8");
});

test("a shared link puts its passage below the lens bar", async ({ page }) => {
    // the host adds the height of its fixed header only after the first jump
    await page.goto(app("?focus=c5"));
    const top = (selector: string, edge: "top" | "bottom") =>
        page
            .locator(selector)
            .first()
            .evaluate((e, edge) => e.getBoundingClientRect()[edge], edge);
    // wait for the host's offset: before it, the passage is in place also without the fix
    await expect
        .poll(() => page.locator(".lensbar").evaluate((e) => parseFloat(getComputedStyle(e).top)))
        .toBeGreaterThan(0);
    // 24px apart (scroll-margin-top), within 1.5px for subpixel positions
    await expect
        .poll(
            async () =>
                (await top('.statement[data-n="5"]', "top")) - (await top(".lensbar", "bottom"))
        )
        .toBeCloseTo(24, -0.5);
});

test("the URL follows the current statement while reading on", async ({ page }) => {
    await page.goto(app("?focus=c5"));
    await expect(page.locator(".statement.current")).toHaveAttribute("data-n", "5");
    // the link has scrolled to its passage
    await expect.poll(() => scrollY(page)).toBeGreaterThan(0);
    await page.mouse.move(400, 400);
    await page.mouse.wheel(0, 600);
    await expect.poll(async () => (await query(page)).focus).not.toBe("c5");
    const n = await page.locator(".statement.current").getAttribute("data-n");
    expect(await query(page)).toEqual({ focus: `c${n}` });
    // above the first statement, nothing is current
    await page.mouse.wheel(0, -20000);
    await expect.poll(() => query(page)).toEqual({});
});

test("an open explainer stays in the URL while reading on", async ({ page }) => {
    await page.goto(app("?focus=legend-explainer"));
    await expect(page.locator(".popover")).toBeVisible();
    await page.mouse.move(400, 400);
    await page.mouse.wheel(0, 1500);
    await expect(page.locator(".statement.current")).toHaveCount(1);
    expect(await query(page)).toEqual({ focus: "legend-explainer" });
});

test("a link to the passage that is open already scrolls again", async ({ page }) => {
    await page.goto(app("?focus=four-aspects"));
    const tag = page.locator(".panel .tag[data-kind=stmt]").first();
    await expect(tag).toBeVisible();
    await tag.click();
    await expect(page.locator(".panel")).toHaveCount(0);
    await expect.poll(() => query(page)).toEqual({ focus: "c5" });
});

test("an unknown passage shows a notice, and the rest of the link still opens", async ({
    page
}) => {
    await page.goto(app("?statement=5&focus=nope"));
    await expect(page.locator(".panel .kicker")).toContainText("Statement 5");
    await expect(page.locator(".focus-missing")).toContainText("“nope”");
    await page.keyboard.press("Escape");
    await page.locator(".lensbar .chip").first().click();
    await expect(page.locator(".focus-missing")).toHaveCount(0);
});

test("Back returns to an open panel and scrolls to it", async ({ page }) => {
    await page.goto(app());
    await page.locator(".statement .num").nth(9).click();
    await expect.poll(() => query(page)).toEqual({ statement: "10" });
    await page.goto(app("/for"));
    await page.goBack();
    await expect(page.locator(".panel .kicker")).toContainText("Statement 10");
    await expect(page.locator(".statement").nth(9)).toBeInViewport();
});

test("leaving the reader with a popover open does not change the next page's URL", async ({
    page
}) => {
    await page.goto(app("?focus=legend-explainer"));
    await expect(page.locator(".popover")).toBeVisible();
    await page.locator(".tile").first().click();
    await expect(page).toHaveURL(/\/commitment\/for$/);
    await expect.poll(() => query(page)).toEqual({});
});
