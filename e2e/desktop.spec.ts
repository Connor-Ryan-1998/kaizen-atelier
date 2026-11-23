import { expect, test, type Page } from "@playwright/test";

async function zOf(page: Page, name: string) {
  return page
    .getByRole("dialog", { name })
    .evaluate((el) => Number(getComputedStyle(el).zIndex) || 0);
}

test("window route is server-rendered", async ({ request }) => {
  const res = await request.get("/services");
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).toContain("Services — Kaizen Atelier");
  expect(html).toContain('role="dialog"');
});

test("no hydration or console errors on a window route", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/services");
  await expect(page.getByRole("dialog", { name: "Services" })).toBeVisible();
  await page.waitForTimeout(300);
  expect(errors).toEqual([]);
});

test("unknown route is a 404 with a 404.txt window", async ({ page, request }) => {
  const res = await request.get("/definitely-not-a-page");
  expect(res.status()).toBe(404);
  await page.goto("/definitely-not-a-page");
  await expect(page.getByRole("dialog", { name: "404.txt" })).toBeVisible();
});

test("icons drive the URL; back/forward and close follow focus", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "About me" }).click();
  await expect(page).toHaveURL(/\/about$/);
  await page.getByRole("button", { name: "Pricing" }).click();
  await expect(page).toHaveURL(/\/pricing$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/about$/);
  await expect
    .poll(async () => (await zOf(page, "About me")) > (await zOf(page, "Pricing")))
    .toBe(true);
  await page.getByRole("button", { name: "Close About me" }).click();
  await expect(page).toHaveURL(/\/pricing$/);
});

test("legacy #anchor links open the matching window", async ({ page }) => {
  await page.goto("/#process");
  await expect(page).toHaveURL(/\/process$/);
  await expect(page.getByRole("dialog", { name: "How I work" })).toBeVisible();
});
