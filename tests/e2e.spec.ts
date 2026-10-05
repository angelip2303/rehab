import { expect, test, type Page } from "@playwright/test";

/** Cada vista tiene que caber en una pantalla, como una diapositiva. */
async function sinScroll(page: Page) {
  const { alto, visible } = await page.evaluate(() => ({
    alto: document.documentElement.scrollHeight,
    visible: window.innerHeight,
  }));
  expect(alto).toBeLessThanOrEqual(visible);
}

test("configurar una sesión, jugar y resolver un panel", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("radio", { name: "Fácil" }).click();
  await page.getByRole("radio", { name: "Concurso" }).click();
  await page.getByRole("radiogroup", { name: "Paneles de la misión" }).getByRole("radio", { name: "4", exact: true }).click();
  await sinScroll(page);
  await page.screenshot({ path: "test-results/1-configuracion.png" });
  await page.getByRole("button", { name: "¡A jugar!" }).click();

  await expect(page).toHaveURL(/\/jugar\/$/);
  await expect(page.getByText("Turno de")).toBeVisible();
  await sinScroll(page);
  await page.screenshot({ path: "test-results/2-panel.png" });

  // Destapar letras hasta resolver el panel, con el lápiz (clics)
  for (let i = 0; i < 4; i++) {
    const ocultas = page.locator('[data-visible="false"][data-letra]');
    const pendientes = new Set(await ocultas.evaluateAll((els) => els.map((e) => e.getAttribute("data-letra"))));
    const [primera] = [...pendientes];
    if (!primera) break;
    if (pendientes.size === 1) break;
    await page.getByRole("button", { name: `Letra ${primera}`, exact: true }).click();
    // las casillas acertadas se iluminan y se destapan tocándolas una a una
    const iluminadas = page.locator("[data-iluminada]");
    await expect(iluminadas.first()).toBeVisible();
    while ((await iluminadas.count()) > 0) await iluminadas.first().click();
  }
  // Una letra que no está: se marca en rojo y se avisa
  const ausente = await page.evaluate(() => {
    const enPanel = new Set([...document.querySelectorAll("[data-letra]")].map((e) => e.getAttribute("data-letra")));
    return "WXKZYQJ".split("").find((l) => !enPanel.has(l))!;
  });
  await page.getByRole("button", { name: `Letra ${ausente}`, exact: true }).click();
  await expect(page.getByRole("button", { name: `Letra ${ausente}`, exact: true })).toHaveAttribute("data-estado", "fallo");
  // El marcador se abre y se cierra en cualquier momento
  await page.getByRole("button", { name: "Marcador" }).click();
  await expect(page.getByRole("complementary", { name: "Marcador" })).toBeVisible();
  await sinScroll(page);
  await page.screenshot({ path: "test-results/3-letras.png" });
  await page.getByRole("button", { name: "Marcador" }).click();
  await expect(page.getByRole("complementary", { name: "Marcador" })).toBeHidden();

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

  // Ver solución del resto para llegar al resumen
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: /Siguiente panel/ }).click();
    await page.getByRole("button", { name: "Ver solución" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Mostrar" }).click();
  }
  await page.getByRole("button", { name: "Ver resumen" }).click();
  await expect(page.getByText("Misión completada")).toBeVisible();
  await sinScroll(page);
  await page.screenshot({ path: "test-results/5-resumen.png" });
});

for (const viewport of [{ width: 1366, height: 768 }, { width: 1280, height: 720 }]) {
  test(`15 personas caben sin scroll a ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("./");
    for (let i = 0; i < 7; i++) await page.getByRole("button", { name: "Una persona más" }).click();
    await page.getByRole("radiogroup", { name: "Equipos" }).getByRole("radio", { name: "Todo el grupo" }).click();
    await page.getByRole("radiogroup", { name: "Paneles de la misión" }).getByRole("radio", { name: "4", exact: true }).click();
    await sinScroll(page);
    await page.screenshot({ path: `test-results/config-${viewport.width}.png` });
    await page.getByRole("button", { name: "¡A jugar!" }).click();
    await expect(page.getByText("Turno de")).toBeVisible();
    await sinScroll(page);
    for (let i = 0; i < 4; i++) {
      await page.getByRole("button", { name: "Ver solución" }).click();
      await page.getByRole("alertdialog").getByRole("button", { name: "Mostrar" }).click();
      await page.getByRole("button", { name: /Siguiente panel|Ver resumen/ }).click();
    }
    await expect(page.getByText("Misión completada")).toBeVisible();
    await sinScroll(page);
    await page.screenshot({ path: `test-results/resumen-${viewport.width}.png` });
  });
}
