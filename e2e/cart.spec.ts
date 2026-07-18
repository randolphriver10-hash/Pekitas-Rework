import { test, expect } from "@playwright/test";

test("add a product to the cart and check out via WhatsApp", async ({ page, context }) => {
  await page.goto("/productos/curva-de-sueter-combinado");

  await expect(page.getByRole("heading", { name: /Suéter Combinado/i })).toBeVisible();

  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  await expect(page.getByRole("button", { name: "Agregado" })).toBeVisible();

  // El contador del carrito en el header debe reflejar el ítem agregado.
  await expect(page.getByLabel("Ver carrito").locator("span")).toHaveText("1");

  await page.getByLabel("Ver carrito").click();
  const [popup] = await Promise.all([
    context.waitForEvent("page"),
    page.getByRole("link", { name: /Finalizar pedido por WhatsApp/i }).click(),
  ]);
  await popup.waitForLoadState("domcontentloaded");
  // wa.me redirige a api.whatsapp.com/send — cualquiera de los dos hosts confirma
  // que el link de checkout apunta a WhatsApp con el pedido armado.
  expect(popup.url()).toMatch(/wa\.me|whatsapp\.com/);
  expect(decodeURIComponent(popup.url())).toContain("Combinado");
  expect(decodeURIComponent(popup.url())).toContain("8.000");
});

test("cart persists across a page reload (localStorage)", async ({ page }) => {
  await page.goto("/productos/curva-de-sueter-combinado");
  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  await expect(page.getByLabel("Ver carrito").locator("span")).toHaveText("1");

  await page.reload();
  await expect(page.getByLabel("Ver carrito").locator("span")).toHaveText("1");
});
