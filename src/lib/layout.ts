import { letraDeTeclado } from "./normalize";

/** Tablero tipo ruleta: 4 filas, 14 columnas; la primera y la última fila tienen las esquinas cortadas. */
export const COLUMNAS = 14;
export const ANCHO_FILAS = [12, 14, 14, 12] as const;

export interface Casilla {
  /** Carácter tal y como está escrito en la frase (con tilde, coma…). */
  caracter: string;
  /** Letra de teclado a la que corresponde, o null si es puntuación (siempre visible). */
  letra: string | null;
  /** Posición de la casilla dentro de la lista de casillas de letra (para el modo Resolver). */
  indice: number;
}

/** Cada fila tiene COLUMNAS posiciones: `null` = casilla de relleno, `undefined` = esquina fuera del tablero. */
export type Fila = (Casilla | null | undefined)[];

export interface Tablero {
  filas: Fila[];
  /** Casillas con letra en orden de lectura. */
  casillasLetra: Casilla[];
}

/** Combinaciones de filas a usar según el nº de líneas, por orden de preferencia. */
const COLOCACIONES: number[][][] = [
  [[1]],
  [[1, 2]],
  [[0, 1, 2], [1, 2, 3]],
  [[0, 1, 2, 3]],
];

function palabras(frase: string): string[] {
  return frase.trim().split(/\s+/).filter(Boolean);
}

function repartir(ps: string[], anchos: number[]): string[] | null {
  const lineas: string[] = [];
  let actual = "";
  for (const p of ps) {
    const ancho = anchos[lineas.length];
    if (ancho === undefined) return null;
    const candidata = actual ? `${actual} ${p}` : p;
    if ([...candidata].length <= ancho) {
      actual = candidata;
      continue;
    }
    if (!actual) return null; // la palabra sola no cabe
    lineas.push(actual);
    const siguiente = anchos[lineas.length];
    if (siguiente === undefined || [...p].length > siguiente) return null;
    actual = p;
  }
  if (actual) lineas.push(actual);
  return lineas.length === anchos.length ? lineas : null;
}

function colocar(frase: string): { lineas: string[]; filas: number[] } | null {
  const ps = palabras(frase);
  if (ps.length === 0) return null;
  for (const opciones of COLOCACIONES) {
    for (const filas of opciones) {
      const lineas = repartir(ps, filas.map((f) => ANCHO_FILAS[f]));
      if (lineas) return { lineas, filas };
    }
  }
  return null;
}

/** ¿Cabe la frase en el tablero? Se usa también para validar el contenido al compilar. */
export function cabeEnTablero(frase: string): boolean {
  return colocar(frase) !== null;
}

export function crearTablero(frase: string): Tablero {
  const colocacion = colocar(frase);
  if (!colocacion) throw new Error(`La frase no cabe en el tablero: "${frase}"`);

  const filas: Fila[] = ANCHO_FILAS.map((ancho) => {
    const margen = (COLUMNAS - ancho) / 2;
    return Array.from({ length: COLUMNAS }, (_, c) =>
      c < margen || c >= COLUMNAS - margen ? undefined : null,
    );
  });

  const casillasLetra: Casilla[] = [];
  colocacion.lineas.forEach((linea, i) => {
    const f = colocacion.filas[i];
    const caracteres = [...linea];
    const inicio = Math.floor((COLUMNAS - caracteres.length) / 2);
    caracteres.forEach((caracter, j) => {
      if (caracter === " ") return;
      const letra = letraDeTeclado(caracter);
      const casilla: Casilla = { caracter, letra, indice: letra ? casillasLetra.length : -1 };
      if (letra) casillasLetra.push(casilla);
      filas[f][inicio + j] = casilla;
    });
  });

  return { filas, casillasLetra };
}
