export interface Equipo {
  numero: number;
  nombre: string;
  /** índices de las personas (en la lista de la sesión) */
  miembros: number[];
}

export interface Turno {
  equipo: number;
  persona: number;
}

/** Reparto equilibrado y fijo: persona 1 → equipo 1, persona 2 → equipo 2… */
export function crearEquipos(personas: number, equipos: number): Equipo[] {
  const total = Math.max(1, Math.min(equipos, personas));
  const lista: Equipo[] = Array.from({ length: total }, (_, i) => ({
    numero: i + 1,
    nombre: `Equipo ${i + 1}`,
    miembros: [],
  }));
  for (let p = 0; p < personas; p++) lista[p % total].miembros.push(p);
  return lista;
}

/**
 * Turno número `n` (empezando en 0): rota entre equipos y, dentro de cada
 * equipo, entre sus miembros. Así cada persona va recibiendo turnos de forma regular.
 */
export function turnoEn(equipos: Equipo[], n: number): Turno {
  const e = n % equipos.length;
  const ronda = Math.floor(n / equipos.length);
  const miembros = equipos[e].miembros;
  return { equipo: e, persona: miembros[ronda % miembros.length] };
}

export function nombrePersona(nombres: string[], indice: number): string {
  return nombres[indice]?.trim() || `Persona ${indice + 1}`;
}
