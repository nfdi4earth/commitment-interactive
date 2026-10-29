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

test("at the top of a topic page in a tall window, the first step is active", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1800 });
    await page.goto(app("/topics/teaching?step=2"));
    await expect(page.locator(".step.active .step-n")).toContainText("Step 2 of");
    // the link has scrolled to its step
    await expect.poll(() => scrollY(page)).toBeGreaterThan(0);
    await page.mouse.wheel(0, -3000);
    await expect.poll(() => query(page)).toEqual({});
    await expect(page.locator(".step.active .step-n")).toContainText("Step 1 of");
});

test("pointing at a step or its statement, or focusing a step, lights up both until the next one", async ({
    page
}) => {
    test.skip(isMobile(page), "pointing needs a mouse");
    // both steps in view, so that pointing at them doesn't scroll
    await page.setViewportSize({ width: 1280, height: 1400 });
    await page.goto(app("/topics/teaching"));
    const step = (i: number) => page.locator(".step").nth(i);
    const isLit = async (i: number) => {
        const n = (await step(i).locator(".step-n").textContent())?.match(/statement (\d+)/i)?.[1];
        await expect(page.locator(".step.active")).toHaveCount(1);
        await expect(step(i)).toHaveClass(/active/);
        await expect(page.locator(".cond.active .cn")).toHaveText(n ?? "");
    };
    await step(1).hover();
    await isLit(1);
    // it stays lit when the mouse leaves it
    await page.mouse.move(5, 5);
    await isLit(1);
    await page.locator(".cond.rel").first().hover();
    await isLit(0);
    // so does the keyboard focus in a step
    await step(1).getByRole("link").focus();
    await isLit(1);
    // pointing doesn't change the URL
    expect(await query(page)).toEqual({});
});

test("clicking a statement scrolls to its step", async ({ page }) => {
    await page.goto(app("/topics/proposal-writing"));
    // a step in the middle, which neither end of the page makes active
    const step = page.locator(".step").nth(2);
    const n = (await step.locator(".step-n").textContent())?.match(/statement (\d+)/i)?.[1];
    await page
        .locator("button.cond", { has: page.locator(".cn", { hasText: new RegExp(`^${n}$`) }) })
        .click();
    await expect.poll(() => query(page)).toEqual({ step: "3" });
    await expect(step).toBeInViewport();
    await expect(page.locator(".step.active")).toHaveCount(1);
    await expect(step).toHaveClass(/active/);
    // the focus stays out of the box, which is hidden from the keyboard
    expect(
        await page.evaluate(() => document.activeElement?.shadowRoot?.activeElement?.tagName)
    ).not.toBe("BUTTON");
});

test("a deep-dive page links its phrases into the reader", async ({ page }) => {
    await page.goto(app("/deep-dive/licensing"));
    await expect(page.locator(".dd-ref")).toHaveCount(6);
    await page.locator(".dd-ref", { hasText: "“Data laws and acts”" }).click();
    await expect(page.locator(".popover h4, .note b").first()).toContainText("Data laws and acts");
});

test("the overview map fits the narrowest screen it is shown on, and links nodes to the reader", async ({
    page
}) => {
    test.skip(isMobile(page), "the map needs a wide screen");
    await page.setViewportSize({ width: 1000, height: 900 });
    await page.goto(app("/map"));
    await expect(page.locator(".mnode")).toHaveCount(29);
    const cut = () =>
        page.locator(".react-flow").evaluate((flow) => {
            const box = flow.getBoundingClientRect();
            return [...flow.querySelectorAll(".mnode")]
                .map((n) => n.getBoundingClientRect())
                .filter((r) => r.left < box.left || r.right > box.right).length;
        });
    await expect.poll(cut).toBe(0);
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

// the status is meaningful against a static host (E2E_BASE_URL, ci/build-site.sh); `vite preview`
// answers 200 always
test("every page answers with status 200, also when opened directly, and names itself in the tab", async ({
    page
}) => {
    test.skip(isMobile(page), "status and title do not depend on the viewport");
    const appName = "Annotated FAIRness and Openness Commitment – NFDI4Earth";
    for (const [path, name] of [
        ["", ""],
        ["/for", "Explore by perspective"],
        ["/for/student", "The Commitment for Students"],
        ["/topics/publishing", "Publishing"],
        ["/deep-dive/licensing", "Licensing data and software"],
        ["/map", "Overview map"]
    ]) {
        const response = await page.goto(app(path));
        expect(response?.status(), path).toBe(200);
        await expect(page).toHaveTitle(name ? `${name} – ${appName}` : appName);
    }
    // a link within the app changes it too, also between two pages of the same kind
    await page.locator(".backto").click();
    await expect(page).toHaveTitle(appName);
    await page.goto(app("/topics/publishing"));
    const other = page.locator(".topic-others a").first();
    const label = (await other.textContent())?.trim();
    await other.click();
    await expect(page).toHaveTitle(`${label} – ${appName}`);
});

test("unknown paths lead back", async ({ page }) => {
    await page.goto(app("/nope"));
    await expect(page).toHaveURL(/\/commitment$/);
    await page.goto(app("/for/nobody"));
    await expect(page).toHaveURL(/\/commitment\/for$/);
});
