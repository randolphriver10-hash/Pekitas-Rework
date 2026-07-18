import { test, expect } from "@playwright/test";

test("visiting /admin without a session redirects to /login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
});

test("visiting a nested admin route without a session also redirects to /login", async ({ page }) => {
  await page.goto("/admin/productos");
  await expect(page).toHaveURL(/\/login/);
});

test("login page renders the sign-in form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
  await expect(page.getByLabel(/contraseña/i)).toBeVisible();
});
