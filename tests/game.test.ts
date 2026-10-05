import { describe, expect, it } from "vitest";
import { crearEstado, elegirPaneles, letraDeAyuda, propuestaCorrecta, reducir } from "../src/lib/game";
import type { Sesion } from "../src/lib/session";
import type { Nivel, Panel } from "../src/lib/types";

const facil: Nivel = { id: "facil", nombre: "Fácil", letrasReveladas: "vocales", ayudasPorPanel: 2 };
const dificil: Nivel = { id: "dificil", nombre: "Difícil", letrasReveladas: "ninguna", ayudasPorPanel: 1 };

const panel = (id: string, frase: string, extra: Partial<Panel> = {}): Panel => ({
  id, tema: "t", frase, pista: "pista", nivel: "facil", ...extra,
});

const sesion = (extra: Partial<Sesion> = {}): Sesion => ({
  nivel: "facil", temas: [], personas: ["Ana", "Luis", "Eva", "Juan"],
  equipos: 2, modo: "concurso", paneles: 2, jugados: [], ...extra,
});

describe("partida", () => {
  it("en fácil empiezan destapadas las vocales", () => {
    const e = crearEstado(sesion(), [panel("1", "Ratón")], facil);
    expect(e.panel.visibles.sort()).toEqual(["A", "O"]);
  });

  it("tocar una letra destapa todas sus apariciones, suma puntos y pasa el turno", () => {
    let e = crearEstado(sesion(), [panel("1", "Pan con pan")], dificil);
    e = reducir(e, { tipo: "letra", letra: "P" });
    expect(e.panel.visibles).toContain("P");
    expect(e.puntos).toEqual([2, 0]);
    expect(e.turno).toBe(1);
    e = reducir(e, { tipo: "letra", letra: "Z" });
    expect(e.puntos).toEqual([2, 0]);
    expect(e.participaciones).toEqual([1, 1, 0, 0]);
  });

  it("al acertar, las casillas se iluminan y se destapan una a una con el lápiz", () => {
    let e = crearEstado(sesion(), [panel("1", "Pan con pan")], dificil);
    e = reducir(e, { tipo: "letra", letra: "N" });
    expect(e.panel.porVoltear).toEqual([2, 5, 8]);
    e = reducir(e, { tipo: "voltear", indice: 5 });
    expect(e.panel.porVoltear).toEqual([2, 8]);
    e = reducir(e, { tipo: "voltearTodas" });
    expect(e.panel.porVoltear).toEqual([]);
  });

  it("mostrar la solución ilumina solo las casillas que faltaban", () => {
    let e = crearEstado(sesion(), [panel("1", "Sol")], facil);
    e = reducir(e, { tipo: "mostrar" });
    expect(e.panel.porVoltear).toEqual([0, 2]);
  });

  it("en modo light no se suman puntos", () => {
    let e = crearEstado(sesion({ modo: "light" }), [panel("1", "Pan")], dificil);
    e = reducir(e, { tipo: "letra", letra: "P" });
    expect(e.puntos).toEqual([0, 0]);
  });

  it("completar todas las letras resuelve el panel", () => {
    let e = crearEstado(sesion(), [panel("1", "Sol")], facil);
    e = reducir(e, { tipo: "letra", letra: "S" });
    e = reducir(e, { tipo: "letra", letra: "L" });
    expect(e.panel.resultado).toBe("resuelto");
    e = reducir(e, { tipo: "siguiente", nivel: facil });
    expect(e.terminado).toBe(true);
    expect(e.resultados).toEqual(["resuelto"]);
  });

  it("la ayuda muestra primero el texto y después la letra más frecuente (sin azar)", () => {
    let e = crearEstado(sesion(), [panel("1", "Perro ladrador", { ayuda: "Hace guau" })], facil);
    e = reducir(e, { tipo: "ayuda", nivel: facil });
    expect(e.panel.ayudaTextoVista).toBe(true);
    expect(letraDeAyuda(e.panel)).toBe("R");
    e = reducir(e, { tipo: "ayuda", nivel: facil });
    expect(e.panel.visibles).toContain("R");
    const sinMas = reducir(e, { tipo: "ayuda", nivel: facil });
    expect(sinMas).toBe(e);
  });

  it("resolver correctamente cierra el panel y fallar solo pasa el turno", () => {
    let e = crearEstado(sesion(), [panel("1", "Ratón")], facil);
    e = reducir(e, { tipo: "resolver", correcto: false });
    expect(e.panel.resultado).toBeNull();
    expect(e.turno).toBe(1);
    e = reducir(e, { tipo: "resolver", correcto: true });
    expect(e.panel.resultado).toBe("resuelto");
    expect(e.puntos).toEqual([0, 3]);
  });

  it("comprueba propuestas sin tildes", () => {
    expect(propuestaCorrecta("Ratón", ["R", "A", "T", "O", "N"])).toBe(true);
    expect(propuestaCorrecta("Ratón", ["R", "A", "T", "A", "N"])).toBe(false);
  });
});

describe("elegirPaneles", () => {
  const todos = [
    panel("largo", "Una frase bastante larga"),
    panel("corto", "Sol"),
    panel("medio", "La casa azul"),
    panel("dificil", "Cinco", { nivel: "dificil" }),
    panel("otro", "Seis", { tema: "otro" }),
  ];

  it("filtra por nivel y temática y ordena de la frase más corta a la más larga", () => {
    const elegidos = elegirPaneles(todos, { ...sesion(), temas: ["t"], paneles: 10 });
    expect(elegidos.map((p) => p.id)).toEqual(["corto", "medio", "largo"]);
  });

  it("no repite paneles ya jugados y respeta cuántos se juegan", () => {
    const elegidos = elegirPaneles(todos, { ...sesion(), temas: ["t"], paneles: 1, jugados: ["corto", "medio"] });
    expect(elegidos.map((p) => p.id)).toEqual(["largo"]);
  });
});
