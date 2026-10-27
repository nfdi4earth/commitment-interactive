// Shared links and the browser's Back, Forward and reload show the same view: they scroll to the
// target first and open it when the page has stopped scrolling.
import { app, expect, query, test } from "./fixtures";

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
