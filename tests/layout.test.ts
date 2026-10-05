import { describe, expect, it } from "vitest";
import { ANCHO_FILAS, cabeEnTablero, COLUMNAS, crearTablero } from "../src/lib/layout";

function lineas(frase: string) {
  return crearTablero(frase).filas.map((f) =>
    f.map((c) => (c === undefined ? "#" : c === null ? "." : c.caracter)).join(""),
  );
}

describe("tablero", () => {
  it("una palabra corta va centrada en la segunda fila", () => {
    const l = lineas("Ratón");
    expect(l[1]).toContain("Ratón");
    expect(l[0]).toBe("#............#");
  });

  it("no corta palabras y respeta el ancho de cada fila", () => {
    const frase = "Más vale pájaro en mano que ciento volando";
    const t = crearTablero(frase);
    t.filas.forEach((fila, i) => {
      expect(fila).toHaveLength(COLUMNAS);
      const usadas = fila.filter((c) => c !== undefined).length;
      expect(usadas).toBe(ANCHO_FILAS[i]);
    });
    const texto = lineas(frase)
      .map((l) => l.replace(/[#.]+/g, " ").trim())
      .filter(Boolean)
      .join(" ");
    expect(texto.replace(/\s+/g, " ")).toBe(frase);
  });

  it("numera las casillas de letra en orden de lectura y deja los signos visibles", () => {
    const t = crearTablero("Al pan, pan");
    expect(t.casillasLetra.map((c) => c.letra).join("")).toBe("ALPANPAN");
    expect(t.casillasLetra.map((c) => c.indice)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it("rechaza frases que no caben o palabras demasiado largas", () => {
    expect(cabeEnTablero("Supercalifragilístico")).toBe(false);
    expect(cabeEnTablero("uno dos tres cuatro cinco seis siete ocho nueve diez once doce")).toBe(false);
    expect(cabeEnTablero("Tres de Soria")).toBe(true);
  });
});
