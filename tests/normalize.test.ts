import { describe, expect, it } from "vitest";
import { letraDeTeclado, letrasDe } from "../src/lib/normalize";

describe("letraDeTeclado", () => {
  it("quita tildes y diéresis pero respeta la Ñ", () => {
    expect(letraDeTeclado("ó")).toBe("O");
    expect(letraDeTeclado("Ü")).toBe("U");
    expect(letraDeTeclado("ñ")).toBe("Ñ");
    expect(letraDeTeclado("a")).toBe("A");
  });
  it("devuelve null para signos y espacios", () => {
    expect(letraDeTeclado(",")).toBeNull();
    expect(letraDeTeclado(" ")).toBeNull();
    expect(letraDeTeclado("¿")).toBeNull();
  });
  it("RATÓN y raton tienen las mismas letras", () => {
    expect(letrasDe("RATÓN")).toEqual(letrasDe("raton"));
  });
});
