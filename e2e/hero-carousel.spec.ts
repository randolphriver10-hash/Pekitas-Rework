import { test, expect } from "@playwright/test";

test("hero carousel shows the first banner, then auto-advances after 2s", async ({ page }) => {
  await page.goto("/");

  const slide1Dot = page.getByLabel("Ir al banner 1");
  const slide2Dot = page.getByLabel("Ir al banner 2");
  await expect(slide1Dot).toBeVisible();
  await expect(slide2Dot).toBeVisible();

  // Banner 1 activo al cargar (el dot activo es más ancho: w-6 vs w-1.5).
  await expect(slide1Dot).toHaveClass(/w-6/);
  await expect(slide2Dot).toHaveClass(/w-1\.5/);

  // A los ~2s debería auto-avanzar al banner 2.
  await expect(slide2Dot).toHaveClass(/w-6/, { timeout: 3500 });
});

test("clicking a pagination dot switches banners manually", async ({ page }) => {
  await page.goto("/");

  const slide2Dot = page.getByLabel("Ir al banner 2");
  await slide2Dot.click();
  await expect(slide2Dot).toHaveClass(/w-6/);
});
