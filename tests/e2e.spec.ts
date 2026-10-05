import { expect, test, type Page } from "@playwright/test";

/** Cada vista tiene que caber en una pantalla, como una diapositiva. */
async function sinScroll(page: Page) {
  const { alto, visible, ancho, visibleAncho } = await page.evaluate(() => ({
    alto: document.documentElement.scrollHeight,
    visible: window.innerHeight,
    ancho: document.documentElement.scrollWidth,
    visibleAncho: window.innerWidth,
  }));
  expect(alto).toBeLessThanOrEqual(visible);
  expect(ancho).toBeLessThanOrEqual(visibleAncho);
  // y nada se corta dentro de las tarjetas
  const cortadas = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("[data-slot=card], [data-slot=card] *")]
      .filter((el) => !el.classList.contains("sr-only"))
      .filter((el) => el.scrollHeight > el.clientHeight + 1 && getComputedStyle(el).overflowY !== "visible")
      .map((el) => el.textContent?.slice(0, 40)),
  );
  expect(cortadas).toEqual([]);
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
  await expect(page.getByText("Turno de", { exact: true })).toBeVisible();
  await sinScroll(page);
  await page.screenshot({ path: "test-results/2-panel.png" });

  // Destapar letras hasta resolver el panel, con el lápiz (clics)
  for (let i = 0; i < 4; i++) {
    const ocultas = page.locator('[data-visible="false"][data-letra]');
    const pendientes = new Set(await ocultas.evaluateAll((els) => els.map((e) => e.getAttribute("data-letra"))));
    const [primera] = [...pendientes];
    if (!primera) break;
    if (pendientes.size === 1) break;
    const antes = await page.getByRole("button", { name: "Resolver" }).boundingBox();
    await page.getByRole("button", { name: `Letra ${primera}`, exact: true }).click();
    // los botones de abajo no se mueven aunque aparezca «Destapar las iluminadas»
    await expect(page.getByRole("button", { name: "Destapar las iluminadas" })).toBeEnabled();
    expect(await page.getByRole("button", { name: "Resolver" }).boundingBox()).toEqual(antes);
    // las casillas acertadas se iluminan y se destapan tocándolas una a una
    const iluminadas = page.locator("[data-iluminada]");
    await expect(iluminadas.first()).toBeVisible();
    while ((await iluminadas.count()) > 0) await iluminadas.first().click();
  }
  // Una letra que no está: se marca en rojo
  const ausente = await page.evaluate(() => {
    const enPanel = new Set([...document.querySelectorAll("[data-letra]")].map((e) => e.getAttribute("data-letra")));
    return "WXKZYQJ".split("").find((l) => !enPanel.has(l))!;
  });
  await page.getByRole("button", { name: `Letra ${ausente}`, exact: true }).click();
  await expect(page.getByRole("button", { name: `Letra ${ausente}`, exact: true })).toHaveAttribute("data-estado", "fallo");
  // El marcador se abre en un diálogo en cualquier momento
  await page.getByRole("button", { name: "Marcador" }).click();
  const marcador = page.getByRole("dialog", { name: /Marcador/ });
  await expect(marcador).toBeVisible();
  await page.screenshot({ path: "test-results/3-marcador.png" });
  await page.keyboard.press("Escape");
  await expect(marcador).toBeHidden();
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

  // Primero se destapa el panel y después llega la celebración
  await expect(page.getByText("¡Resuelto! Destapad el panel")).toBeVisible();
  const porDestapar = page.locator("[data-iluminada]");
  while ((await porDestapar.count()) > 0) await porDestapar.first().click();
  await expect(page.getByText("¡Panel resuelto!")).toBeVisible();
  await expect(page.getByText("1 / 4")).toBeVisible();

  // El resto se pasa viendo la solución
  // El ojo enseña la solución sin resolver el panel; al quitarlo se sigue jugando
  await page.getByRole("button", { name: /Siguiente panel/ }).click();
  const ojo = page.getByRole("button", { name: "Ver solución" });
  const ocultasAntes = await page.locator('[data-visible="false"][data-letra]').count();
  await ojo.click();
  await expect(page.locator('[data-visible="false"][data-letra]')).toHaveCount(0);
  await ojo.click();
  await expect(page.locator('[data-visible="false"][data-letra]')).toHaveCount(ocultasAntes);
  for (let i = 0; i < 3; i++) {
    if (i > 0) await page.getByRole("button", { name: /Siguiente panel/ }).click();
    await ojo.click();
  }
  await page.getByRole("button", { name: "Ver resumen" }).click();
  await expect(page.getByText("Misión completada")).toBeVisible();
  await sinScroll(page);
  await page.screenshot({ path: "test-results/5-resumen.png" });
});

for (const viewport of [{ width: 1366, height: 768 }, { width: 1280, height: 720 }]) {
  test(`20 personas caben sin scroll a ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("./");
    for (let i = 0; i < 15; i++) await page.getByRole("button", { name: "Una persona más" }).click();
    await expect(page.getByRole("button", { name: "Una persona más" })).toBeEnabled();
    await expect(page.getByText("20", { exact: true })).toBeVisible();
    // las tarjetas de la configuración no se estiran al añadir personas
    const altoGrupo = () => page.locator("[data-slot=card]", { hasText: "Grupo" }).first().evaluate((el) => el.getBoundingClientRect().height);
    await page.reload();
    await page.getByRole("button", { name: "Una persona menos" }).waitFor();
    const altoInicial = await altoGrupo();
    for (let i = 0; i < 12; i++) await page.getByRole("button", { name: "Una persona más" }).click();
    for (const equipos of ["4", "3", "2", "Todo el grupo"]) {
      await page.getByRole("radiogroup", { name: "Equipos" }).getByRole("radio", { name: equipos, exact: true }).click();
      expect(Math.abs((await altoGrupo()) - altoInicial)).toBeLessThan(2);
    }
    for (const equipos of ["4", "3", "Todo el grupo"]) {
      await page.getByRole("radiogroup", { name: "Equipos" }).getByRole("radio", { name: equipos, exact: true }).click();
      await sinScroll(page);
      await expect(page.getByText("Persona 20")).toBeInViewport();
    }
    await page.getByRole("radiogroup", { name: "Paneles de la misión" }).getByRole("radio", { name: "4", exact: true }).click();
    // En Concurso, el texto de la misión ocupa como mucho dos líneas
    await page.getByRole("radio", { name: "Concurso" }).click();
    const lineas = await page.getByTestId("mision").evaluate(
      (el) => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight),
    );
    expect(lineas).toBeLessThanOrEqual(2.1);
    await sinScroll(page);
    await page.screenshot({ path: `test-results/config-${viewport.width}.png` });
    await page.getByRole("button", { name: "¡A jugar!" }).click();
    await expect(page.getByText("Turno de", { exact: true })).toBeVisible();
    await sinScroll(page);
    for (let i = 0; i < 4; i++) {
      await page.getByRole("button", { name: "Ver solución" }).click();
      await page.getByRole("button", { name: /Siguiente panel|Ver resumen/ }).click();
    }
    await expect(page.getByText("Misión completada")).toBeVisible();
    await sinScroll(page);
    await page.screenshot({ path: `test-results/resumen-${viewport.width}.png` });
  });
}
