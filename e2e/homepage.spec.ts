import { test, expect } from "@playwright/test";

test("homepage loads with header, hero and footer", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Pekitas/i);

  // Header: logo/business name link + WhatsApp CTA
  await expect(page.locator("header").getByRole("link", { name: /pekitas/i }).first()).toBeVisible();

  // Footer: nueva estructura de 4 columnas
  const footer = page.locator("footer");
  await expect(footer.getByText("Ayuda")).toBeVisible();
  await expect(footer.getByText("Contacto")).toBeVisible();
  await expect(footer.getByText("Seguinos")).toBeVisible();
  await expect(footer.getByRole("link", { name: "Preguntas frecuentes" })).toBeVisible();
});

test("mobile nav drawer opens and lists categories", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(page.getByRole("link", { name: "Todos los productos" })).toBeVisible();

  await page.getByRole("button", { name: "Cerrar menú" }).click();
  await expect(page.getByRole("link", { name: "Todos los productos" })).not.toBeVisible();
});

test("search box navigates to the filtered catalog", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Buscar" }).click();
  const input = page.getByPlaceholder("Buscar productos...");
  await input.fill("remera");
  await input.press("Enter");

  await expect(page).toHaveURL(/\/productos\?q=remera/);
  await expect(page.getByRole("heading", { name: /Resultados para "remera"/i })).toBeVisible();
});
