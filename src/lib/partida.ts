import type { Estado } from "./game";

const CLAVE = "panel-rehab:partida";

/** La partida en curso se guarda en el navegador para poder recargar la página sin perderla. */
export function guardarPartida(estado: Estado): void {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch {
    /* sin almacenamiento */
  }
}

export function cargarPartida(): Estado | null {
  try {
    const texto = sessionStorage.getItem(CLAVE);
    return texto ? (JSON.parse(texto) as Estado) : null;
  } catch {
    return null;
  }
}

export function borrarPartida(): void {
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {
    /* nada */
  }
}
