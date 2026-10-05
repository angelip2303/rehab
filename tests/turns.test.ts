import { describe, expect, it } from "vitest";
import { crearEquipos, turnoEn } from "../src/lib/turns";

describe("turnos", () => {
  it("reparte de forma equilibrada", () => {
    const equipos = crearEquipos(11, 3);
    expect(equipos.map((e) => e.miembros.length)).toEqual([4, 4, 3]);
  });

  it("todas las personas tienen turno antes de que nadie repita dos veces", () => {
    for (const [personas, n] of [[12, 3], [7, 2], [9, 4], [8, 1]] as const) {
      const equipos = crearEquipos(personas, n);
      const maxMiembros = Math.max(...equipos.map((e) => e.miembros.length));
      const vistos = new Set<number>();
      for (let t = 0; t < maxMiembros * equipos.length; t++) vistos.add(turnoEn(equipos, t).persona);
      expect(vistos.size).toBe(personas);
    }
  });

  it("alterna equipos en cada turno", () => {
    const equipos = crearEquipos(8, 2);
    expect([0, 1, 2, 3].map((t) => turnoEn(equipos, t).equipo)).toEqual([0, 1, 0, 1]);
  });
});
