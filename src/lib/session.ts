import type { Modo, NivelId } from "./types";

export interface Sesion {
  nivel: NivelId;
  faseInicial: number;
  temas: string[];
  /** nombres opcionales; la longitud es el nº de personas */
  personas: string[];
  equipos: number;
  modo: Modo;
  paneles: number;
  /** ids de paneles ya jugados en esta sesión, para no repetirlos en otra ronda */
  jugados: string[];
}

const CLAVE = "panel-rehab:sesion";

export function guardarSesion(sesion: Sesion): void {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(sesion));
  } catch {
    /* navegador sin almacenamiento: la sesión vive solo en memoria */
  }
}

export function cargarSesion(): Sesion | null {
  try {
    const texto = sessionStorage.getItem(CLAVE);
    return texto ? (JSON.parse(texto) as Sesion) : null;
  } catch {
    return null;
  }
}

export function borrarSesion(): void {
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {
    /* nada */
  }
}
