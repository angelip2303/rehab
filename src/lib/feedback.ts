/** Vibración corta al fallar (solo si el dispositivo la admite; si no, no pasa nada). */
export function vibrarFallo(): void {
  try {
    navigator.vibrate?.([60, 40, 60]);
  } catch {
    /* sin vibración */
  }
}
