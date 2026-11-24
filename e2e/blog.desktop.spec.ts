import { expect, test } from "@playwright/test";

test("/notes redirects to /blog", async ({ request }) => {
  const res = await request.get("/notes", { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers()["location"]).toMatch(/\/blog$/);
});

// Reads the live Substack feed at build time.
test("blog window lists posts from the feed", async ({ page }) => {
  await page.goto("/blog");
  const win = page.getByRole("dialog", { name: "Blog" });
  await expect(win).toBeVisible();
  await expect(win.locator('a[href^="https://signalfeed.substack.com/p/"]').first()).toBeVisible();
  await expect(win.getByTitle("Subscribe to Connor's Substack")).toBeVisible();
});

test("contact icon sits in the left column, blog in the right", async ({ page }) => {
  await page.goto("/");
  const width = page.viewportSize()!.width;
  const x = async (id: string) => (await page.locator(`[data-icon="${id}"]`).boundingBox())!.x;
  expect(await x("contact")).toBeLessThan(width / 2);
  expect(await x("blog")).toBeGreaterThan(width / 2);
});
