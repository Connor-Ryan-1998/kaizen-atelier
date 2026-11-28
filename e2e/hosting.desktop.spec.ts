import { expect, test } from "@playwright/test";

// Static export served by Wrangler: routes map to .html files without the extension.
for (const [path, title] of [
  ["/blog", "Blog"],
  ["/homelab", "homelab_infra/"],
] as const) {
  test(`deep link ${path} loads directly`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("dialog", { name: title })).toBeVisible();
  });
}

test("unknown path is a 404", async ({ page }) => {
  const res = await page.goto("/nope");
  expect(res?.status()).toBe(404);
});
