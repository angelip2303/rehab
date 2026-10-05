import { expect, test } from "@playwright/test";

test("configurar una sesión, jugar y resolver un panel", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("radio", { name: "Fácil" }).click();
  await page.getByRole("radio", { name: "Concurso" }).click();
  await page.getByRole("radiogroup", { name: "Paneles de la misión" }).getByRole("radio", { name: "4" }).click();
  await page.screenshot({ path: "test-results/1-configuracion.png" });
  await page.getByRole("button", { name: "¡A jugar!" }).click();

  await expect(page).toHaveURL(/\/jugar\/$/);
  await expect(page.getByText("Turno de")).toBeVisible();
  await page.screenshot({ path: "test-results/2-panel.png" });

  // Destapar letras hasta resolver el panel, con el lápiz (clics)
  for (let i = 0; i < 4; i++) {
    const ocultas = page.locator('[data-visible="false"][data-letra]');
    const pendientes = new Set(await ocultas.evaluateAll((els) => els.map((e) => e.getAttribute("data-letra"))));
    const [primera] = [...pendientes];
    if (!primera) break;
    if (pendientes.size === 1) break;
    await page.getByRole("button", { name: `Letra ${primera}`, exact: true }).click();
  }
  await page.screenshot({ path: "test-results/3-letras.png" });

  // Resolver casilla a casilla
  const letras = await page
    .locator('[data-visible="false"][data-letra]')
    .evaluateAll((els) => els.map((e) => e.getAttribute("data-letra")!));
  await page.getByRole("button", { name: "Resolver" }).click();
  const dialogo = page.getByRole("dialog");
  for (const l of letras) await dialogo.getByRole("button", { name: `Letra ${l}`, exact: true }).click();
  await page.screenshot({ path: "test-results/4-resolver.png" });
  await dialogo.getByRole("button", { name: "Comprobar" }).click();

  await expect(page.getByText("¡Panel resuelto!")).toBeVisible();
  await expect(page.getByText("1 / 4")).toBeVisible();

  // Mostrar solución del resto para llegar al resumen
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: /Siguiente panel/ }).click();
    await page.getByRole("button", { name: "Mostrar solución" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Mostrar" }).click();
  }
  await page.getByRole("button", { name: "Ver resumen" }).click();
  await expect(page.getByText("Misión completada")).toBeVisible();
  await page.screenshot({ path: "test-results/5-resumen.png" });
});
