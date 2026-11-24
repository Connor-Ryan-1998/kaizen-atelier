import { expect, test } from "@playwright/test";

test("home grid shows all 12 icons and no window", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Book a call" }).first()).toBeVisible();
  await expect(page.locator("[data-icon]:visible")).toHaveCount(12);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("phone back gesture closes the open window", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-icon="pricing"]').tap();
  await expect(page.getByRole("dialog", { name: "Pricing" })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('[role="dialog"]:visible')).toHaveCount(0);
  await expect(page.locator("[data-icon]:visible")).toHaveCount(12);
});

test("no workshop illustration on phones", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-icon]:visible")).toHaveCount(12);
  await expect(page.locator("img[data-workshop]")).toBeHidden();
});

test("tapping an icon opens it full-screen; Back returns home", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-icon="pricing"]').tap();
  await expect(page).toHaveURL(/\/pricing$/);
  const dialog = page.getByRole("dialog", { name: "Pricing" });
  await expect(dialog).toBeVisible();
  const vp = page.viewportSize()!;
  // Full-screen below the 38px menu bar. Poll: the open animation briefly scales the window.
  await expect
    .poll(async () => {
      const b = (await dialog.boundingBox())!;
      return b.x <= 1 && Math.abs(b.y - 38) <= 1 && b.width >= vp.width - 2 && b.y + b.height >= vp.height - 1;
    })
    .toBe(true);

  await page.getByRole("button", { name: "Back to home" }).tap();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("[data-icon]:visible")).toHaveCount(12);
});
