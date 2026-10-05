/** Alfabeto español del teclado: la Ñ es una letra propia. */
export const ALFABETO = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
export const VOCALES = ["A", "E", "I", "O", "U"];

export const FILAS_ABC = [
  "ABCDEFGHIJ".split(""),
  "KLMNÑOPQRS".split(""),
  "TUVWXYZ".split(""),
];

const SIN_TILDE: Record<string, string> = {
  Á: "A", À: "A", Ä: "A", Â: "A",
  É: "E", È: "E", Ë: "E", Ê: "E",
  Í: "I", Ì: "I", Ï: "I", Î: "I",
  Ó: "O", Ò: "O", Ö: "O", Ô: "O",
  Ú: "U", Ù: "U", Ü: "U", Û: "U",
  Ç: "C",
};

/**
 * Devuelve la letra de teclado que corresponde a un carácter de la frase
 * (sin tildes, en mayúsculas) o `null` si no es una letra (espacio, coma…).
 */
export function letraDeTeclado(caracter: string): string | null {
  const mayuscula = caracter.toLocaleUpperCase("es-ES");
  const letra = SIN_TILDE[mayuscula] ?? mayuscula;
  return ALFABETO.includes(letra) ? letra : null;
}

/** Letras distintas (normalizadas) que aparecen en una frase. */
export function letrasDe(frase: string): Set<string> {
  const letras = new Set<string>();
  for (const c of frase) {
    const l = letraDeTeclado(c);
    if (l) letras.add(l);
  }
  return letras;
}
